import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  LogOut,
  AlertCircle,
  X,
  Lock,
  RefreshCw,
  Clock,
  CheckCircle2,
  Upload,
  Phone,
  Eye,
} from 'lucide-react';
import {
  MemberAccountState,
  MembershipOrder,
  cancelActiveMembership,
  requestProtectedEpisodeStream,
} from '../../services/membershipService';
import { getDramaById } from '../../data/membershipCatalog';
import { attachHlsStream } from '../../utils/hlsPlayer';
import { useLanguage } from '../../i18n/LanguageContext';
import { MEMBERSHIP_COPY } from '../../i18n/membershipTranslations';
import { BankQrPaymentSection } from './BankQrPaymentSection';

interface MembershipAccountPanelProps {
  account: MemberAccountState;
  onAccountUpdated: (updated: MemberAccountState) => void;
  onSignOut: () => void;
  onChoosePlanClick: () => void;
}

export const MembershipAccountPanel: React.FC<MembershipAccountPanelProps> = ({
  account,
  onAccountUpdated,
  onSignOut,
  onChoosePlanClick,
}) => {
  const { t, isUrdu, dir } = useLanguage();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState<MembershipOrder | null>(null);
  const [proofViewerOrderId, setProofViewerOrderId] = useState<string | null>(null);

  // Server-authorized episode theater state
  const [loadingEpisodeSlug, setLoadingEpisodeSlug] = useState<string | null>(null);
  const [activeStream, setActiveStream] = useState<{
    streamUrl: string;
    dramaTitle: string;
    episodeTitle: string;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (activeStream && videoRef.current) {
      const cleanup = attachHlsStream(videoRef.current, activeStream.streamUrl, {
        autoPlay: true,
      });
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [activeStream]);

  const handleCancelMembership = async () => {
    setCancelling(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const res = await cancelActiveMembership();
      if ('error' in res) {
        setActionError(res.error || 'Could not cancel membership.');
      } else {
        setConfirmCancel(false);
        setActiveStream(null);
        setActionMessage(
          isUrdu
            ? 'آپ کی ممبرشپ منسوخ کر دی گئی ہے اور محفوظ رسائی فوری طور پر ختم ہو گئی ہے۔'
            : 'Your membership has been cancelled and protected access ended immediately.'
        );
        onAccountUpdated(res);
      }
    } catch {
      setActionError('Network error while cancelling membership.');
    } finally {
      setCancelling(false);
    }
  };

  const handleWatchEpisode = async (dramaId: string, episodeSlug: string) => {
    setActionError(null);
    setLoadingEpisodeSlug(`${dramaId}:${episodeSlug}`);
    try {
      const res = await requestProtectedEpisodeStream(dramaId, episodeSlug);
      if ('error' in res) {
        setActionError(res.error || 'You do not have active entitlement to watch this episode.');
        setActiveStream(null);
      } else {
        setActiveStream({
          streamUrl: res.streamUrl,
          dramaTitle: res.dramaTitle,
          episodeTitle: res.episodeTitle,
        });
      }
    } catch {
      setActionError('Unable to verify episode access right now.');
    } finally {
      setLoadingEpisodeSlug(null);
    }
  };

  const {
    member,
    activeMembership,
    latestMembership,
    remainingDays,
    remainingHours = 0,
    unlockedDramas,
    orders,
    history,
    publicConfig,
  } = account;

  const pendingVerificationOrder = orders.find((o) => o.status === 'pending_verification');
  const awaitingPaymentOrder = orders.find((o) => o.status === 'awaiting_payment');
  const latestRejectedOrder = !activeMembership
    ? orders.find((o) => o.status === 'rejected')
    : undefined;

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const getOrderStatusLabel = (status: MembershipOrder['status']) => {
    const entry = MEMBERSHIP_COPY.statuses[status] || MEMBERSHIP_COPY.statuses.awaiting_payment;
    return t(entry);
  };

  return (
    <section
      id="my-account"
      dir={dir}
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 ${
        isUrdu ? 'font-urdu-slim' : ''
      }`}
      aria-labelledby="account-heading"
    >
      {/* Top Account Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
            {t(MEMBERSHIP_COPY.account.myAccount)}
          </div>
          <h2 id="account-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0B0D] mt-1">
            {member.fullName}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600 mt-1">
            <span dir="ltr">{member.email}</span>
            {member.phone && (
              <span dir="ltr" className="inline-flex items-center gap-1 text-zinc-500">
                <Phone className="w-3.5 h-3.5" />
                {member.phone}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onChoosePlanClick}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-300 text-[#0B0B0D] hover:bg-zinc-100 transition cursor-pointer whitespace-nowrap"
          >
            {t(MEMBERSHIP_COPY.account.viewPlans)}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-zinc-600 hover:text-[#0B0B0D] hover:bg-zinc-100 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t(MEMBERSHIP_COPY.subbar.signOut)}</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banners */}
      {activeMembership && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 sm:p-5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-sm font-bold text-emerald-950">
              {t(MEMBERSHIP_COPY.account.activeBanner)}
            </div>
            <p className="text-xs text-emerald-800">
              {isUrdu
                ? `منتخب پلان: ${activeMembership.planName} · میعاد ختم: ${formatDate(activeMembership.expiresAt)}`
                : `${activeMembership.planName} Plan · Expires on ${formatDate(activeMembership.expiresAt)}`}
            </p>
          </div>
        </div>
      )}

      {pendingVerificationOrder && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-amber-950">
                {t(MEMBERSHIP_COPY.account.pendingBanner)}
              </div>
              <p className="text-xs text-amber-900">
                {pendingVerificationOrder.planName} ·{' '}
                <span dir="ltr">PKR {pendingVerificationOrder.amountPkr.toLocaleString()}</span> ·{' '}
                {pendingVerificationOrder.selectedDramaIds
                  .map((id) => getDramaById(id)?.title || id)
                  .join(', ')}
              </p>
            </div>
          </div>
          {pendingVerificationOrder.hasProof && (
            <button
              type="button"
              onClick={() => setProofViewerOrderId(pendingVerificationOrder.id)}
              className="px-3.5 py-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-amber-950 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'جمع شدہ ثبوت دیکھیں' : 'View Submitted Proof'}</span>
            </button>
          )}
        </div>
      )}

      {!activeMembership && latestRejectedOrder && !pendingVerificationOrder && (
        <div
          role="alert"
          className="rounded-2xl bg-red-50 border border-red-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-red-900">
                {t(MEMBERSHIP_COPY.account.rejectedBannerPrefix)}
              </div>
              {latestRejectedOrder.rejectionReason && (
                <p className="text-xs text-red-800">
                  <strong>{t(MEMBERSHIP_COPY.account.rejectionReasonLabel)}</strong>{' '}
                  {latestRejectedOrder.rejectionReason}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActivePaymentOrder(latestRejectedOrder)}
            className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t(MEMBERSHIP_COPY.account.reuploadCta)}</span>
          </button>
        </div>
      )}

      {!activeMembership && awaitingPaymentOrder && !pendingVerificationOrder && (
        <div className="rounded-2xl bg-zinc-100 border border-zinc-300 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-bold text-[#0B0B0D]">
              {t(MEMBERSHIP_COPY.account.awaitingPaymentBanner)}
            </div>
            <p className="text-xs text-zinc-600">
              {awaitingPaymentOrder.planName} ·{' '}
              <span dir="ltr">PKR {awaitingPaymentOrder.amountPkr.toLocaleString()}</span> · Request ID:{' '}
              <span className="font-mono" dir="ltr">
                {awaitingPaymentOrder.id}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePaymentOrder(awaitingPaymentOrder)}
            className="px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t(MEMBERSHIP_COPY.payment.stepTitle)}</span>
          </button>
        </div>
      )}

      {actionMessage && (
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#0B0B0D]">
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Inline Bank QR Payment / Re-upload Section when selected from My Account */}
      {activePaymentOrder && (
        <div className="space-y-3">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setActivePaymentOrder(null)}
              className="text-xs font-semibold text-zinc-600 hover:text-[#0B0B0D] inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'بند کریں' : 'Close Payment Panel'}</span>
            </button>
          </div>
          <BankQrPaymentSection
            order={activePaymentOrder}
            member={member}
            publicConfig={publicConfig}
            onProofSubmitted={(updatedAcc, updatedOrd) => {
              onAccountUpdated(updatedAcc);
              setActivePaymentOrder(updatedOrd);
            }}
            onViewMyAccount={() => setActivePaymentOrder(null)}
          />
        </div>
      )}

      {/* Membership Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-[#F8FAFC] p-6 sm:p-8 flex flex-col justify-between gap-6">
          {activeMembership ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#16A34A]">
                    {t(MEMBERSHIP_COPY.statuses.active)}
                  </div>
                  <h3 className="text-2xl font-bold text-[#0B0B0D] mt-1">
                    {activeMembership.planName} Plan
                  </h3>
                  <p className="text-sm text-zinc-600 mt-1 tabular-nums">
                    <span dir="ltr">PKR {activeMembership.pricePkr.toLocaleString()}</span> ·{' '}
                    {activeMembership.durationDays} {isUrdu ? 'دن' : 'Days'}
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500 mt-2">
                    <span>
                      {t(MEMBERSHIP_COPY.account.activatedOn)} {formatDate(activeMembership.activatedAt)}
                    </span>
                    <span>
                      {t(MEMBERSHIP_COPY.account.expiresOn)} {formatDate(activeMembership.expiresAt)}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-bold text-[#0B0B0D] tabular-nums">{remainingDays}</div>
                  <div className="text-xs text-zinc-500">{t(MEMBERSHIP_COPY.account.daysRemaining)}</div>
                  {remainingHours > 0 && remainingDays <= 2 && (
                    <div className="text-[11px] text-zinc-500 tabular-nums mt-0.5">
                      ({remainingHours} {t(MEMBERSHIP_COPY.account.hoursRemaining)})
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-5 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-zinc-600">
                  {t(MEMBERSHIP_COPY.account.selectedDramasLabel)}{' '}
                  <span className="font-semibold text-[#0B0B0D]">
                    {activeMembership.selectedDramaIds
                      .map((id) => getDramaById(id)?.title || id)
                      .join(', ')}
                  </span>
                </div>

                {!confirmCancel ? (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-4 cursor-pointer self-start sm:self-auto"
                  >
                    {t(MEMBERSHIP_COPY.account.cancelMembership)}
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-zinc-700">
                      {isUrdu ? 'فوری منسوخی کی تصدیق کریں؟' : 'Confirm immediate cancellation?'}
                    </span>
                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={handleCancelMembership}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      {cancelling ? '...' : isUrdu ? 'جی ہاں، منسوخ کریں' : 'Yes, Cancel Now'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmCancel(false)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                    >
                      {isUrdu ? 'نہیں' : 'Keep Plan'}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : latestMembership ? (
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                {latestMembership.status === 'cancelled'
                  ? t(MEMBERSHIP_COPY.statuses.cancelled)
                  : t(MEMBERSHIP_COPY.statuses.expired)}
              </div>
              <h3 className="text-2xl font-bold text-[#0B0B0D]">
                {latestMembership.status === 'cancelled'
                  ? isUrdu
                    ? `آپ کا ${latestMembership.planName} پلان منسوخ ہو چکا ہے`
                    : `Your ${latestMembership.planName} Plan was cancelled`
                  : t(MEMBERSHIP_COPY.account.expiredBanner)}
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed max-w-xl">
                {latestMembership.status === 'cancelled'
                  ? isUrdu
                    ? `${formatDate(latestMembership.cancelledAt)} کو منسوخ کیا گیا۔`
                    : `Ended on ${formatDate(latestMembership.cancelledAt)}. ${
                        latestMembership.revokedReason ? `Note: ${latestMembership.revokedReason}` : ''
                      }`
                  : isUrdu
                  ? `آپ کے ${latestMembership.durationDays} دن کی مدت ${formatDate(latestMembership.expiresAt)} کو مکمل ہو گئی تھی۔`
                  : `Your ${latestMembership.durationDays}-day term ended on ${formatDate(latestMembership.expiresAt)}. Renew your membership to continue watching.`}
              </p>
              <div>
                <button
                  type="button"
                  onClick={onChoosePlanClick}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-sm font-semibold transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t(MEMBERSHIP_COPY.account.renewMembership)}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                {t(MEMBERSHIP_COPY.statuses.inactive)}
              </div>
              <h3 className="text-2xl font-bold text-[#0B0B0D]">
                {isUrdu ? 'دیکھنے کے لیے ممبرشپ منتخب کریں' : 'Select a membership to begin watching'}
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed max-w-xl">
                {isUrdu
                  ? 'اسٹارٹر، اسٹینڈرڈ، پلس یا VIP میں سے کوئی پلان چنیں اور اپنے پسندیدہ اردو ڈب ترکی ڈرامے منتخب کریں۔'
                  : 'Choose Starter, Standard, Plus, or VIP and select the Turkish dramas you want unlocked on your personal FEVIQO account.'}
              </p>
              <div>
                <button
                  type="button"
                  onClick={onChoosePlanClick}
                  className="px-5 py-2.5 rounded-xl bg-[#0B0B0D] hover:bg-zinc-800 text-white text-sm font-semibold transition cursor-pointer"
                >
                  {t(MEMBERSHIP_COPY.account.chooseMembership)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Account Verification Requests Overview */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            {t(MEMBERSHIP_COPY.account.verificationHistory)}
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {isUrdu ? 'ابھی تک کوئی ادائیگی کی درخواست موجود نہیں ہے۔' : 'No payment requests created yet.'}
            </p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="pb-3 border-b border-zinc-100 last:border-b-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#0B0B0D]">
                      {ord.planName} · <span dir="ltr">PKR {ord.amountPkr.toLocaleString()}</span>
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        ord.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : ord.status === 'pending_verification'
                          ? 'bg-amber-50 text-amber-800'
                          : ord.status === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {getOrderStatusLabel(ord.status)}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {ord.selectedDramaIds.map((d) => getDramaById(d)?.title || d).join(', ')}
                  </div>
                  {ord.rejectionReason && (
                    <div className="text-[11px] text-red-600">
                      {t(MEMBERSHIP_COPY.account.rejectionReasonLabel)} {ord.rejectionReason}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                    <span dir="ltr" className="font-mono">
                      {ord.id}
                    </span>
                    <span>{formatDate(ord.createdAt)}</span>
                  </div>
                  {(ord.status === 'awaiting_payment' || ord.status === 'rejected') && (
                    <button
                      type="button"
                      onClick={() => setActivePaymentOrder(ord)}
                      className="text-xs font-semibold text-[#16A34A] hover:underline cursor-pointer pt-0.5"
                    >
                      {ord.status === 'rejected'
                        ? t(MEMBERSHIP_COPY.account.reuploadCta)
                        : t(MEMBERSHIP_COPY.payment.proofHeading)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Authorized Member Video Theater */}
      {activeStream && (
        <div className="rounded-2xl overflow-hidden bg-[#0B0B0D] text-white border border-zinc-800">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-zinc-800">
            <div>
              <div className="text-xs text-[#22C55E] font-semibold">{activeStream.dramaTitle}</div>
              <div className="text-sm font-semibold text-white">{activeStream.episodeTitle}</div>
            </div>
            <button
              type="button"
              onClick={() => setActiveStream(null)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              aria-label="Close episode player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="aspect-video w-full bg-black">
            <video ref={videoRef} controls playsInline className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      {/* Unlocked Dramas & Eligible Episodes */}
      {activeMembership && unlockedDramas.length > 0 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-bold text-[#0B0B0D]">
              {t(MEMBERSHIP_COPY.account.unlockedLibrary)}
            </h3>
            <p className="text-sm text-zinc-600 mt-0.5">
              {isUrdu
                ? 'آپ کی فعال ممبرشپ میں شامل تمام دستیاب اور نئی اقساط دیکھیں۔'
                : 'Stream all available and newly released eligible episodes included in your active membership.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {unlockedDramas.map((drama) => (
              <div key={drama.id} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                <div className="p-5 border-b border-zinc-100 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-base font-bold text-[#0B0B0D]">{drama.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {drama.seasonLabel} · {t(MEMBERSHIP_COPY.dramaSelection.urduDubbed)} ·{' '}
                      {drama.episodes.length} {t(MEMBERSHIP_COPY.dramaSelection.episodes)}
                    </div>
                  </div>
                  <div className="font-urdu-slim text-lg text-zinc-700" dir="rtl">
                    {drama.urduTitle}
                  </div>
                </div>

                <div className="divide-y divide-zinc-100">
                  {drama.episodes.map((ep) => {
                    const key = `${drama.id}:${ep.slug}`;
                    const isLoading = loadingEpisodeSlug === key;
                    return (
                      <div key={ep.slug} className="px-5 py-3.5 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#0B0B0D] truncate">
                            {isUrdu ? `قسط ${ep.number}` : `Episode ${ep.number}`}
                          </div>
                          <div className="text-xs text-zinc-500 truncate">
                            {ep.duration} · {ep.releaseDate}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleWatchEpisode(drama.id, ep.slug)}
                          className="px-3.5 py-2 rounded-lg bg-[#0B0B0D] hover:bg-[#22C55E] hover:text-[#0B0B0D] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>
                            {isLoading
                              ? t(MEMBERSHIP_COPY.account.verifyingStream)
                              : t(MEMBERSHIP_COPY.account.watchEpisode)}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protected Preview Notice when Inactive */}
      {!activeMembership && (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 flex items-start gap-3.5">
          <Lock className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[#0B0B0D]">
              {isUrdu ? 'محفوظ ممبر لائبریری' : 'Protected Member Library'}
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {isUrdu
                ? 'پروٹیکٹڈ اقساط صرف فیویکو ٹیم کی تصدیق اور فعال ممبرشپ کے بعد چلتی ہیں۔'
                : 'Protected episode streams are strictly verified on the server for active, verified FEVIQO members. Complete payment proof verification or renew your plan to unlock playback.'}
            </p>
          </div>
        </div>
      )}

      {/* Membership History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#0B0B0D]">
          {t(MEMBERSHIP_COPY.account.membershipHistory)}
        </h3>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">
            {isUrdu ? 'ابھی تک کوئی سرگرمی ریکارڈ نہیں ہے۔' : 'No activity recorded yet.'}
          </p>
        ) : (
          <div className="rounded-2xl border border-zinc-200 divide-y divide-zinc-100 bg-white">
            {history.slice(0, 15).map((entry) => (
              <div
                key={entry.id}
                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="text-sm text-[#0B0B0D]">{entry.details}</div>
                <div className="text-xs text-zinc-500 shrink-0 tabular-nums">
                  {formatDate(entry.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Private Proof Lightbox Preview */}
      {proofViewerOrderId && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setProofViewerOrderId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="text-sm font-bold text-[#0B0B0D]" dir="ltr">
                Payment Proof · {proofViewerOrderId}
              </div>
              <button
                type="button"
                onClick={() => setProofViewerOrderId(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-zinc-50 rounded-xl p-2">
              <img
                src={`/api/membership/orders/${encodeURIComponent(proofViewerOrderId)}/proof`}
                alt="Submitted payment screenshot"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

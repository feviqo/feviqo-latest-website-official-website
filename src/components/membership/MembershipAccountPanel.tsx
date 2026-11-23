import React, { useState, useRef, useEffect } from 'react';
import '@videojs/html/video/player';
import '@videojs/html/video/skin';
import '@videojs/html/media/mux-video';
import '@videojs/html/extensions/mux-data';
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
  Bell,
  ExternalLink,
  CheckCheck,
  Gift,
  Copy,
  Check,
  Users,
  Wallet,
  Tag,
} from 'lucide-react';
import {
  MemberAccountState,
  MembershipOrder,
  MembershipRecord,
  cancelActiveMembership,
  requestProtectedEpisodeStream,
  fetchAuthenticatedProofObjectUrl,
  markMemberNotificationRead,
  markAllMemberNotificationsRead,
  updateMemberPhone,
} from '../../services/membershipService';
import {
  isFirebaseSignedInVerified,
  cancelMembershipInFirestore,
  syncMemberAccountToFirestore,
} from '../../services/firestoreMembershipSync';
import { getDramaById } from '../../data/membershipCatalog';
import { extractMuxPlaybackId } from '../../utils/hlsPlayer';
import { useLanguage } from '../../i18n/LanguageContext';
import { MEMBERSHIP_COPY } from '../../i18n/membershipTranslations';
import { BankQrPaymentSection } from './BankQrPaymentSection';
import { notifyMembershipAuthChanged } from './useDramaEntitlement';
import {
  fetchMemberNotificationPreferences,
  saveMemberNotificationPreferences,
} from '../../services/automationService';

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
  const [proofViewerSrc, setProofViewerSrc] = useState<string | null>(null);
  const [proofViewerLoading, setProofViewerLoading] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [nowTs, setNowTs] = useState<number>(() => Date.now());
  const [notifLoadingId, setNotifLoadingId] = useState<string | null>(null);
  const [missingPhoneInput, setMissingPhoneInput] = useState('');
  const [savingMissingPhone, setSavingMissingPhone] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Customer WhatsApp phone & explicit notification consent settings
  const [waPhoneInput, setWaPhoneInput] = useState(account.member.phone || '');
  const [waMembershipUpdates, setWaMembershipUpdates] = useState(false);
  const [waRenewalReminders, setWaRenewalReminders] = useState(false);
  const [waNewEpisodeAlerts, setWaNewEpisodeAlerts] = useState(false);
  const [waPromotionalMessages, setWaPromotionalMessages] = useState(false);
  const [waOptedOut, setWaOptedOut] = useState(false);
  const [waPrefsLoaded, setWaPrefsLoaded] = useState(false);
  const [savingWaPrefs, setSavingWaPrefs] = useState(false);
  const [waPrefsFeedback, setWaPrefsFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    setWaPhoneInput((prev) => prev || account.member.phone || '');
    fetchMemberNotificationPreferences()
      .then((res) => {
        if (!active) return;
        if (res.success && res.preferences) {
          setWaPhoneInput(res.preferences.phoneE164 || account.member.phone || '');
          setWaMembershipUpdates(Boolean(res.preferences.membershipUpdates));
          setWaRenewalReminders(Boolean(res.preferences.renewalReminders));
          setWaNewEpisodeAlerts(Boolean(res.preferences.newEpisodeAlerts));
          setWaPromotionalMessages(Boolean(res.preferences.promotionalMessages));
          setWaOptedOut(Boolean(res.preferences.optedOut));
        }
        setWaPrefsLoaded(true);
      })
      .catch(() => {
        if (active) setWaPrefsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [account.member.id, account.member.phone]);

  const handleSaveWhatsAppSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaPrefsFeedback(null);
    const trimmedPhone = waPhoneInput.trim();
    const digits = trimmedPhone.replace(/[^\d]/g, '');
    if (digits.length < 10 || digits.length > 15) {
      setWaPrefsFeedback({
        type: 'error',
        text: isUrdu
          ? 'براہ کرم درست WhatsApp نمبر درج کریں (مثال: +923001234567 یا 03001234567)۔'
          : 'Please enter a valid WhatsApp number (e.g. +923001234567 or 03001234567).',
      });
      return;
    }

    setSavingWaPrefs(true);
    try {
      // 1. Update member profile phone so Firebase UID & account profile stay in sync without touching memberships
      const phoneRes = await updateMemberPhone(trimmedPhone, undefined, {
        whatsappOptIn: !waOptedOut && (waMembershipUpdates || waRenewalReminders || waNewEpisodeAlerts),
      });
      if ('error' in phoneRes) {
        setWaPrefsFeedback({ type: 'error', text: phoneRes.error || 'Could not update phone number.' });
        setSavingWaPrefs(false);
        return;
      }
      if (isFirebaseSignedInVerified()) {
        await syncMemberAccountToFirestore(phoneRes.member).catch(() => {});
      }
      onAccountUpdated(phoneRes);

      // 2. Save explicit WhatsApp notification preferences
      const prefRes = await saveMemberNotificationPreferences({
        phone: trimmedPhone,
        membershipUpdates: waOptedOut ? false : waMembershipUpdates,
        renewalReminders: waOptedOut ? false : waRenewalReminders,
        newEpisodeAlerts: waOptedOut ? false : waNewEpisodeAlerts,
        promotionalMessages: waOptedOut ? false : waPromotionalMessages,
        optedOut: waOptedOut,
      });

      if (!prefRes.success) {
        setWaPrefsFeedback({
          type: 'error',
          text: prefRes.error || 'Phone saved, but could not update WhatsApp preferences.',
        });
      } else {
        if (prefRes.preferences?.phoneE164) {
          setWaPhoneInput(prefRes.preferences.phoneE164);
        }
        setWaPrefsFeedback({
          type: 'success',
          text: isUrdu
            ? 'آپ کا WhatsApp نمبر اور الرٹ کی ترجیحات محفوظ ہو گئی ہیں۔'
            : 'Your WhatsApp number and episode alert preferences have been saved.',
        });
        notifyMembershipAuthChanged();
      }
    } catch {
      setWaPrefsFeedback({
        type: 'error',
        text: isUrdu
          ? 'سرور سے رابطہ نہیں ہو سکا۔ براہ کرم دوبارہ کوشش کریں۔'
          : 'Unable to reach server while saving WhatsApp preferences.',
      });
    } finally {
      setSavingWaPrefs(false);
    }
  };

  const handleCopyValue = async (text: string, key: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2200);
    } catch {}
  };

  useEffect(() => {
    const timer = window.setInterval(() => setNowTs(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Server-authorized episode theater state
  const [loadingEpisodeSlug, setLoadingEpisodeSlug] = useState<string | null>(null);
  const [activeStream, setActiveStream] = useState<{
    dramaId: string;
    episodeSlug: string;
    streamUrl: string;
    dramaTitle: string;
    episodeTitle: string;
    thumbnail: string;
    fallbackThumbnail: string;
  } | null>(null);
  const [showPosterOverlay, setShowPosterOverlay] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const theaterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeStream) return;
    setShowPosterOverlay(true);
    theaterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const el = videoRef.current as any;
    if (!el) return;

    const handlePlaying = () => setShowPosterOverlay(false);
    el.addEventListener?.('play', handlePlaying);
    el.addEventListener?.('playing', handlePlaying);

    const timer = window.setTimeout(() => {
      try {
        const playResult = el.play?.();
        if (playResult && typeof playResult.then === 'function') {
          playResult
            .then(() => setShowPosterOverlay(false))
            .catch(() => {
              // Keep poster overlay visible if browser blocks autoplay
            });
        }
      } catch {}
    }, 120);

    return () => {
      window.clearTimeout(timer);
      el.removeEventListener?.('play', handlePlaying);
      el.removeEventListener?.('playing', handlePlaying);
    };
  }, [activeStream]);

  useEffect(() => {
    if (!proofViewerOrderId) {
      setProofViewerSrc(null);
      return;
    }
    const matchedOrder = account.orders.find((o) => o.id === proofViewerOrderId);
    if (matchedOrder?.proofDataUrl) {
      setProofViewerSrc(matchedOrder.proofDataUrl);
      return;
    }
    let cancelled = false;
    let objectUrlToRevoke: string | null = null;
    setProofViewerLoading(true);
    fetchAuthenticatedProofObjectUrl(proofViewerOrderId, false).then((url) => {
      if (cancelled) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      objectUrlToRevoke = url;
      setProofViewerSrc(url);
      setProofViewerLoading(false);
    });
    return () => {
      cancelled = true;
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
    };
  }, [proofViewerOrderId, account.orders]);

  const handleStartPosterPlayback = () => {
    setShowPosterOverlay(false);
    const el = videoRef.current as any;
    if (el && typeof el.play === 'function') {
      el.play().catch(() => {});
    }
  };

  const handleCancelMembership = async (targetMembershipId?: string) => {
    setCancelling(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const priorActiveId = targetMembershipId || account.activeMembership?.id;
      const res = await cancelActiveMembership(priorActiveId);
      if ('error' in res) {
        setActionError(res.error || 'Could not cancel membership.');
      } else {
        if (priorActiveId && isFirebaseSignedInVerified()) {
          await cancelMembershipInFirestore(
            priorActiveId,
            res.latestMembership?.cancelledAt || new Date().toISOString()
          ).catch(() => {});
        }
        setConfirmCancel(false);
        setConfirmCancelId(null);
        setActiveStream(null);
        setActionMessage(
          isUrdu
            ? 'آپ کی ممبرشپ منسوخ کر دی گئی ہے اور محفوظ رسائی فوری طور پر ختم ہو گئی ہے۔'
            : 'Your membership has been cancelled and protected access ended immediately.'
        );
        notifyMembershipAuthChanged();
        onAccountUpdated(res);
      }
    } catch {
      setActionError('Network error while cancelling membership.');
    } finally {
      setCancelling(false);
    }
  };

  const handleMarkNotifRead = async (notifId: string) => {
    setNotifLoadingId(notifId);
    try {
      const res = await markMemberNotificationRead(notifId);
      if (res.success && res.member) {
        onAccountUpdated(res as MemberAccountState);
      }
    } finally {
      setNotifLoadingId(null);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    setNotifLoadingId('all');
    try {
      const res = await markAllMemberNotificationsRead();
      if (res.success && res.member) {
        onAccountUpdated(res as MemberAccountState);
      }
    } finally {
      setNotifLoadingId(null);
    }
  };

  const triggerMembershipUrl = (targetUrl: string) => {
    window.dispatchEvent(new CustomEvent('feviqo-navigate-url', { detail: targetUrl }));
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
        const drama = getDramaById(dramaId);
        const ep = drama?.episodes.find((e) => e.slug === episodeSlug);
        setActiveStream({
          dramaId,
          episodeSlug,
          streamUrl: res.streamUrl,
          dramaTitle: res.dramaTitle,
          episodeTitle: res.episodeTitle,
          thumbnail: res.thumbnail || ep?.thumbnail || drama?.posterUrl || '',
          fallbackThumbnail: res.fallbackThumbnail || drama?.fallbackPosterUrl || '',
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
    activeMemberships: rawActiveMemberships,
    allMemberships: rawAllMemberships,
    latestMembership,
    remainingDays,
    remainingHours = 0,
    unlockedDramas,
    orders,
    history,
    notifications = [],
    unreadNotificationCount = 0,
    referralSummary,
    publicConfig,
  } = account;

  const activeMembershipsList: MembershipRecord[] =
    rawActiveMemberships && rawActiveMemberships.length > 0
      ? rawActiveMemberships.filter((m) => m.status === 'active' && Date.parse(m.expiresAt) > nowTs)
      : activeMembership && Date.parse(activeMembership.expiresAt) > nowTs
      ? [activeMembership]
      : [];

  const allMembershipsList: MembershipRecord[] =
    rawAllMemberships && rawAllMemberships.length > 0
      ? rawAllMemberships
      : activeMembership
      ? [activeMembership]
      : latestMembership
      ? [latestMembership]
      : [];

  const pendingVerificationOrder = orders.find((o) => o.status === 'pending_verification');
  const awaitingPaymentOrder = orders.find((o) => o.status === 'awaiting_payment');
  const latestRejectedOrder = activeMembershipsList.length === 0
    ? orders.find((o) => o.status === 'rejected')
    : undefined;

  const hasActiveVip = activeMembershipsList.some((m) => m.planId === 'vip');
  const hasAnyActivePlan = activeMembershipsList.length > 0;

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

  const formatLocalDateTime = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString(isUrdu ? 'ur-PK' : undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  const formatCountdown = (expiresAtIso?: string) => {
    if (!expiresAtIso) return '—';
    const diffMs = Date.parse(expiresAtIso) - nowTs;
    if (Number.isNaN(diffMs) || diffMs <= 0) {
      return isUrdu ? 'میعاد ختم' : 'Expired';
    }
    const totalMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const mins = totalMinutes % 60;
    if (days > 0) {
      return isUrdu ? `${days} دن ${hours} گھنٹے` : `${days}d ${hours}h left`;
    }
    return isUrdu ? `${hours} گھنٹے ${mins} منٹ` : `${hours}h ${mins}m left`;
  };

  const formatOrderAmount = (ord: MembershipOrder) => {
    if (ord.currency === 'USD' || ord.paymentMethod === 'binance_qr') {
      const usd = Number(ord.expectedAmount ?? ord.amountUsd ?? 0);
      return `$${usd.toFixed(2)} USD`;
    }
    return `PKR ${ord.amountPkr.toLocaleString()}`;
  };

  const formatMembershipPrice = (m: MembershipRecord) => {
    if (m.currency === 'USD' || m.paymentMethod === 'binance_qr') {
      const usd = Number(m.expectedAmount ?? m.priceUsd ?? 0);
      return `$${usd.toFixed(2)} USD`;
    }
    return `PKR ${m.pricePkr.toLocaleString()}`;
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
          {hasActiveVip ? (
            <button
              type="button"
              onClick={() => triggerMembershipUrl('/dramas')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isUrdu ? 'ڈرامے دیکھیں' : 'Explore Dramas'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onChoosePlanClick}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-300 text-[#0B0B0D] hover:bg-zinc-100 transition cursor-pointer whitespace-nowrap"
            >
              {hasAnyActivePlan
                ? isUrdu
                  ? 'پلان اپ گریڈ کریں'
                  : 'Upgrade Plan'
                : t(MEMBERSHIP_COPY.account.viewPlans)}
            </button>
          )}
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

      {/* Missing Phone Completion Prompt for Google Sign-In Accounts */}
      {(!member.phone || member.phone.replace(/[^\d]/g, '').length < 10) && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setActionError(null);
            setActionMessage(null);
            const digits = missingPhoneInput.replace(/[^\d]/g, '');
            if (digits.length < 10 || digits.length > 15) {
              setActionError(
                isUrdu
                  ? 'براہ کرم درست فون / واٹس ایپ نمبر درج کریں (کم از کم 10 ہندسے)۔'
                  : 'Please enter a valid WhatsApp / phone number (10 to 15 digits, e.g. 0300 1234567).'
              );
              return;
            }
            setSavingMissingPhone(true);
            try {
              const res = await updateMemberPhone(missingPhoneInput.trim());
              if ('error' in res) {
                setActionError(res.error || 'Could not save phone number.');
              } else {
                if (isFirebaseSignedInVerified()) {
                  await syncMemberAccountToFirestore(res.member).catch(() => {});
                }
                setMissingPhoneInput('');
                setActionMessage(
                  isUrdu
                    ? 'آپ کا فون / واٹس ایپ نمبر محفوظ ہو گیا ہے۔'
                    : 'Your WhatsApp / phone number has been saved.'
                );
                notifyMembershipAuthChanged();
                onAccountUpdated(res);
              }
            } catch {
              setActionError('Network error while saving phone number.');
            } finally {
              setSavingMissingPhone(false);
            }
          }}
          className="rounded-2xl bg-amber-50 border border-amber-300 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-800 shrink-0" />
              <span>{t(MEMBERSHIP_COPY.auth.googlePhoneTitle)}</span>
            </div>
            <p className="text-xs text-amber-900">{t(MEMBERSHIP_COPY.auth.googlePhoneDesc)}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <input
              type="tel"
              dir="ltr"
              required
              value={missingPhoneInput}
              onChange={(e) => setMissingPhoneInput(e.target.value)}
              placeholder={t(MEMBERSHIP_COPY.auth.phonePlaceholder)}
              className="px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:border-[#0B0B0D] min-w-[200px]"
            />
            <button
              type="submit"
              disabled={savingMissingPhone}
              className="px-4 py-2 rounded-xl bg-[#0B0B0D] hover:bg-[#22C55E] hover:text-[#0B0B0D] disabled:opacity-60 text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
            >
              {savingMissingPhone
                ? t(MEMBERSHIP_COPY.auth.googlePhoneSaving)
                : t(MEMBERSHIP_COPY.auth.googlePhoneSaveBtn)}
            </button>
          </div>
        </form>
      )}

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
                <span dir="ltr">{formatOrderAmount(pendingVerificationOrder)}</span> ·{' '}
                {pendingVerificationOrder.orderType === 'renewal' ? (isUrdu ? 'تجدید · ' : 'Renewal · ') : ''}
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

      {activeMembershipsList.length === 0 && latestRejectedOrder && !pendingVerificationOrder && (
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

      {activeMembershipsList.length === 0 && awaitingPaymentOrder && !pendingVerificationOrder && (
        <div className="rounded-2xl bg-zinc-100 border border-zinc-300 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-bold text-[#0B0B0D]">
              {t(MEMBERSHIP_COPY.account.awaitingPaymentBanner)}
            </div>
            <p className="text-xs text-zinc-600">
              {awaitingPaymentOrder.planName} ·{' '}
              <span dir="ltr">{formatOrderAmount(awaitingPaymentOrder)}</span> · Request ID:{' '}
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
            <span>
              {awaitingPaymentOrder.currency === 'USD'
                ? t(MEMBERSHIP_COPY.payment.stepTitleBinance)
                : t(MEMBERSHIP_COPY.payment.stepTitle)}
            </span>
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

      {/* In-Account Notification Center & Renewal Alerts */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-[#16A34A]" />
            <h3 className="text-base font-bold text-[#0B0B0D]">
              {t(MEMBERSHIP_COPY.account.notificationsHeading)}
            </h3>
            {unreadNotificationCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#22C55E] text-[#0B0B0D] text-[11px] font-bold">
                {unreadNotificationCount}
              </span>
            )}
          </div>
          {unreadNotificationCount > 0 && (
            <button
              type="button"
              disabled={notifLoadingId === 'all'}
              onClick={handleMarkAllNotifsRead}
              className="text-xs font-semibold text-[#16A34A] hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{t(MEMBERSHIP_COPY.account.markAllRead)}</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-xs text-zinc-500">{t(MEMBERSHIP_COPY.account.noNotifications)}</p>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {notifications.slice(0, 12).map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  n.isRead ? 'bg-zinc-50/70 border-zinc-200' : 'bg-emerald-50/70 border-emerald-200'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#22C55E]" />}
                    <span className="text-xs font-bold text-[#0B0B0D]">
                      {isUrdu && n.titleUr ? n.titleUr : n.title}
                    </span>
                    <span className="text-[10px] text-zinc-500" dir="ltr">
                      {formatLocalDateTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    {isUrdu && n.messageUr ? n.messageUr : n.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.ctaHref && (
                    <button
                      type="button"
                      onClick={() => triggerMembershipUrl(n.ctaHref!)}
                      className="px-3 py-1.5 rounded-lg bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-[#0B0B0D] text-xs font-semibold transition cursor-pointer"
                    >
                      {n.ctaLabel || t(MEMBERSHIP_COPY.account.renewMembership)}
                    </button>
                  )}
                  {!n.isRead && (
                    <button
                      type="button"
                      disabled={notifLoadingId === n.id}
                      onClick={() => handleMarkNotifRead(n.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-[11px] font-semibold cursor-pointer"
                    >
                      {t(MEMBERSHIP_COPY.account.markRead)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Number & Explicit Episode / Membership Alert Preferences */}
      <form
        onSubmit={handleSaveWhatsAppSettings}
        className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#16A34A]" />
              <h3 className="text-base font-bold text-[#0B0B0D]">
                {isUrdu ? 'WhatsApp نمبر اور نئی اقساط کے الرٹس' : 'WhatsApp Number & Episode Alert Preferences'}
              </h3>
            </div>
            <p className="text-xs text-zinc-500">
              {isUrdu
                ? 'اپنا WhatsApp نمبر اپڈیٹ کریں اور منتخب کریں کہ آپ کون سی اطلاعات وصول کرنا چاہتے ہیں۔ آپ کی ممبرشپ اور اکاؤنٹ ہسٹری محفوظ رہے گی۔'
                : 'Add or update your WhatsApp number on this account and choose which alerts you want to receive. Reply STOP anytime to opt out.'}
            </p>
          </div>
          {waPrefsLoaded && (
            <span
              className={`self-start sm:self-auto px-2.5 py-1 rounded-md border text-[11px] font-bold ${
                waOptedOut
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : waNewEpisodeAlerts || waMembershipUpdates
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-zinc-100 border-zinc-200 text-zinc-700'
              }`}
            >
              {waOptedOut
                ? isUrdu
                  ? 'WhatsApp بند ہے'
                  : 'Opted Out'
                : waNewEpisodeAlerts || waMembershipUpdates
                ? isUrdu
                  ? 'WhatsApp الرٹس فعال'
                  : 'WhatsApp Alerts Enabled'
                : isUrdu
                ? 'رضامندی منتخب نہیں'
                : 'Not Opted In Yet'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-5 space-y-1.5">
            <label htmlFor="account-whatsapp-phone" className="block text-xs font-semibold text-zinc-700">
              {isUrdu ? 'WhatsApp فون نمبر (بین الاقوامی یا پاکستانی)' : 'WhatsApp Phone Number'}
            </label>
            <input
              id="account-whatsapp-phone"
              type="tel"
              dir="ltr"
              required
              value={waPhoneInput}
              onChange={(e) => setWaPhoneInput(e.target.value)}
              placeholder="+923001234567 or 03001234567"
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D]"
            />
            <p className="text-[11px] text-zinc-500">
              {isUrdu
                ? 'پاکستانی نمبر خودکار طور پر +92 فارمیٹ میں محفوظ ہوں گے۔'
                : 'Pakistani numbers (03XX...) are automatically normalized to +92 format.'}
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={!waOptedOut && waNewEpisodeAlerts}
                onChange={(e) => {
                  if (e.target.checked) setWaOptedOut(false);
                  setWaNewEpisodeAlerts(e.target.checked);
                }}
                className="mt-0.5 h-4 w-4 accent-[#16A34A]"
              />
              <span>
                <strong className="block text-[#0B0B0D]">
                  {isUrdu ? 'نئی اقساط کے الرٹس' : 'New Episode Alerts'}
                </strong>
                <span className="text-[11px] text-zinc-500">
                  {isUrdu ? 'نئی اردو قسط ریلیز ہوتے ہی اطلاع' : 'Instant alert when a new Urdu episode drops'}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={!waOptedOut && waMembershipUpdates}
                onChange={(e) => {
                  if (e.target.checked) setWaOptedOut(false);
                  setWaMembershipUpdates(e.target.checked);
                }}
                className="mt-0.5 h-4 w-4 accent-[#16A34A]"
              />
              <span>
                <strong className="block text-[#0B0B0D]">
                  {isUrdu ? 'ممبرشپ اور ادائیگی اپڈیٹس' : 'Membership & Payment Updates'}
                </strong>
                <span className="text-[11px] text-zinc-500">
                  {isUrdu ? 'ادائیگی کی تصدیق اور ایکٹیویشن' : 'Payment confirmation & plan activation'}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={!waOptedOut && waRenewalReminders}
                onChange={(e) => {
                  if (e.target.checked) setWaOptedOut(false);
                  setWaRenewalReminders(e.target.checked);
                }}
                className="mt-0.5 h-4 w-4 accent-[#16A34A]"
              />
              <span>
                <strong className="block text-[#0B0B0D]">
                  {isUrdu ? 'تجدید کی یاد دہانیاں' : 'Renewal Reminders'}
                </strong>
                <span className="text-[11px] text-zinc-500">
                  {isUrdu ? 'میعاد ختم ہونے سے پہلے یاد دہانی' : 'Before your active plan expires'}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={!waOptedOut && waPromotionalMessages}
                onChange={(e) => {
                  if (e.target.checked) setWaOptedOut(false);
                  setWaPromotionalMessages(e.target.checked);
                }}
                className="mt-0.5 h-4 w-4 accent-[#16A34A]"
              />
              <span>
                <strong className="block text-[#0B0B0D]">
                  {isUrdu ? 'خصوصی آفرز' : 'Special Offers'}
                </strong>
                <span className="text-[11px] text-zinc-500">
                  {isUrdu ? 'اختیاری ڈسکاؤنٹ اور پرومو' : 'Optional package offers & promos'}
                </span>
              </span>
            </label>
          </div>
        </div>

        {waPrefsFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs ${
              waPrefsFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {waPrefsFeedback.text}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
            <input
              type="checkbox"
              checked={waOptedOut}
              onChange={(e) => setWaOptedOut(e.target.checked)}
              className="h-4 w-4 accent-red-600"
            />
            <span>
              {isUrdu
                ? 'تمام WhatsApp اطلاعات بند کریں (Opt Out)'
                : 'Pause all automated WhatsApp messages (Opt Out)'}
            </span>
          </label>
          <button
            type="submit"
            disabled={savingWaPrefs}
            className="px-4 py-2.5 rounded-xl bg-[#0B0B0D] hover:bg-[#22C55E] hover:text-[#0B0B0D] disabled:opacity-60 text-white text-xs font-bold transition cursor-pointer"
          >
            {savingWaPrefs
              ? isUrdu
                ? 'محفوظ ہو رہا ہے...'
                : 'Saving...'
              : isUrdu
              ? 'WhatsApp سیٹنگز محفوظ کریں'
              : 'Save WhatsApp Settings'}
          </button>
        </div>
      </form>

      {/* Membership Summary & Multi-Drama Memberships Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[#0B0B0D]">
              {t(MEMBERSHIP_COPY.account.activeMembershipsHeading)}
            </h3>
            {hasActiveVip ? (
              <button
                type="button"
                onClick={() => triggerMembershipUrl('/dramas')}
                className="text-xs font-semibold text-[#16A34A] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isUrdu ? 'ڈرامے دیکھیں' : 'Explore Dramas'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onChoosePlanClick}
                className="text-xs font-semibold text-[#16A34A] hover:underline cursor-pointer"
              >
                {hasAnyActivePlan
                  ? isUrdu
                    ? '+ پلان اپ گریڈ کریں'
                    : '+ Upgrade Plan'
                  : `+ ${t(MEMBERSHIP_COPY.account.addAnotherDrama)}`}
              </button>
            )}
          </div>

          {allMembershipsList.length > 0 ? (
            <div className="space-y-4">
              {allMembershipsList.map((m) => {
                const isExpiredNow = m.status !== 'active' || Date.parse(m.expiresAt) <= nowTs;
                const msLeft = Math.max(0, Date.parse(m.expiresAt) - nowTs);
                const isExpiringSoon = !isExpiredNow && msLeft <= 7 * 24 * 60 * 60 * 1000;
                const renewHref = `/membership?renew=${encodeURIComponent(m.id)}&plan=${encodeURIComponent(
                  m.planId
                )}${m.selectedDramaIds[0] ? `&drama=${encodeURIComponent(m.selectedDramaIds[0])}` : ''}`;

                return (
                  <div
                    key={m.id}
                    className={`rounded-2xl border p-6 space-y-4 ${
                      !isExpiredNow
                        ? 'border-zinc-200 bg-[#F8FAFC]'
                        : 'border-zinc-200 bg-zinc-50/70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs font-semibold uppercase tracking-[0.12em] ${
                              !isExpiredNow
                                ? 'text-[#16A34A]'
                                : m.status === 'cancelled'
                                ? 'text-red-600'
                                : 'text-amber-700'
                            }`}
                          >
                            {!isExpiredNow
                              ? t(MEMBERSHIP_COPY.statuses.active)
                              : m.status === 'cancelled'
                              ? t(MEMBERSHIP_COPY.statuses.cancelled)
                              : t(MEMBERSHIP_COPY.statuses.expired)}
                          </span>
                          {isExpiringSoon && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                              {isUrdu ? 'جلد ختم ہونے والی ہے' : 'Expiring Soon'}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xl font-bold text-[#0B0B0D] mt-1">
                          {m.planName} Plan · <span dir="ltr">{formatMembershipPrice(m)}</span>
                        </h4>
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500 mt-1.5">
                          <span>
                            {t(MEMBERSHIP_COPY.account.activatedOn)} {formatLocalDateTime(m.activatedAt)}
                          </span>
                          <span>
                            {t(MEMBERSHIP_COPY.account.expiresOn)} {formatLocalDateTime(m.expiresAt)}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <div
                          className={`text-lg font-bold tabular-nums ${
                            !isExpiredNow ? 'text-[#0B0B0D]' : 'text-zinc-500'
                          }`}
                        >
                          {!isExpiredNow ? formatCountdown(m.expiresAt) : t(MEMBERSHIP_COPY.statuses.expired)}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {m.durationDays} {isUrdu ? 'دن' : 'Days'}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-700">
                      {t(MEMBERSHIP_COPY.account.selectedDramasLabel)}{' '}
                      <span className="font-semibold text-[#0B0B0D]">
                        {m.selectedDramaIds.map((id) => getDramaById(id)?.title || id).join(', ')}
                      </span>
                    </div>

                    {m.renewalHistory && m.renewalHistory.length > 0 && (
                      <div className="rounded-xl bg-white border border-zinc-200 p-3 space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                          {t(MEMBERSHIP_COPY.account.renewalHistoryLabel)} ({m.renewalHistory.length})
                        </div>
                        {m.renewalHistory.slice(0, 3).map((rh) => (
                          <div key={rh.id} className="text-[11px] text-zinc-600 flex flex-wrap justify-between gap-2">
                            <span>
                              +{rh.addedDays} {isUrdu ? 'دن' : 'days'} ({rh.planName})
                            </span>
                            <span dir="ltr">{formatDate(rh.renewedAt)} → {formatDate(rh.newExpiresAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {!isExpiredNow && (
                          <button
                            type="button"
                            onClick={() => triggerMembershipUrl('/dramas')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-[#0B0B0D] text-xs font-bold transition cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isUrdu ? 'ڈرامے دیکھیں' : 'Explore Dramas'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => triggerMembershipUrl(renewHref)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-xs font-bold transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{t(MEMBERSHIP_COPY.account.renewMembership)}</span>
                        </button>
                      </div>

                      {!isExpiredNow && (
                        confirmCancelId !== m.id ? (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(m.id)}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-4 cursor-pointer"
                          >
                            {t(MEMBERSHIP_COPY.account.cancelMembership)}
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={cancelling}
                              onClick={() => handleCancelMembership(m.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                            >
                              {cancelling ? '...' : isUrdu ? 'جی ہاں، منسوخ کریں' : 'Yes, Cancel Now'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmCancelId(null)}
                              className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                            >
                              {isUrdu ? 'نہیں' : 'Keep Plan'}
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-[#F8FAFC] p-6 sm:p-8 space-y-4">
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
              {orders.slice(0, 6).map((ord) => (
                <div key={ord.id} className="pb-3 border-b border-zinc-100 last:border-b-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#0B0B0D]">
                      {ord.planName} · <span dir="ltr">{formatOrderAmount(ord)}</span>
                      {ord.orderType === 'renewal' && (
                        <span className="ml-1.5 text-[10px] font-bold text-[#16A34A] uppercase">
                          Renewal
                        </span>
                      )}
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
                  {(ord.promoCode || (ord.discountTotalPkr || 0) > 0 || (ord.discountTotalUsd || 0) > 0) && (
                    <div className="text-[11px] text-[#16A34A] font-medium flex flex-wrap items-center gap-2">
                      {ord.promoCode && (
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200" dir="ltr">
                          {ord.promoCode}
                        </span>
                      )}
                      {((ord.discountTotalPkr || 0) > 0 || (ord.discountTotalUsd || 0) > 0) && (
                        <span dir="ltr">
                          {isUrdu ? 'رعایت:' : 'Saved:'}{' '}
                          {ord.currency === 'USD' || ord.paymentMethod === 'binance_qr'
                            ? `$${Number(ord.discountTotalUsd || 0).toFixed(2)} USD`
                            : `PKR ${Number(ord.discountTotalPkr || 0).toLocaleString()}`}
                        </span>
                      )}
                    </div>
                  )}
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

      {/* Refer & Earn Rewards Dashboard */}
      {referralSummary && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
            <div className="space-y-1.5 max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A] inline-flex items-center gap-1.5">
                <Gift className="w-4 h-4" />
                <span>{t(MEMBERSHIP_COPY.referral.heading)}</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                {t(MEMBERSHIP_COPY.referral.subheading)}
              </p>
            </div>

            <div className="rounded-xl bg-[#F8FAFC] border border-zinc-200 px-4 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>{t(MEMBERSHIP_COPY.referral.walletTitle)}</span>
                </div>
                <div className="text-base font-bold text-[#0B0B0D] mt-0.5 tabular-nums" dir="ltr">
                  PKR {Math.round(referralSummary.creditBalancePkr).toLocaleString()} · $
                  {Number(referralSummary.creditBalanceUsd || 0).toFixed(2)} USD
                </div>
              </div>
              {!hasActiveVip && (
                <button
                  type="button"
                  onClick={onChoosePlanClick}
                  className="px-3.5 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
                >
                  {t(MEMBERSHIP_COPY.referral.useCreditsCheckoutBtn)}
                </button>
              )}
            </div>
          </div>

          {/* Code & Shareable Link Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 rounded-xl bg-[#F8FAFC] border border-zinc-200 p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                {t(MEMBERSHIP_COPY.referral.yourCodeLabel)}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-lg font-bold tracking-wider text-[#0B0B0D]" dir="ltr">
                  {referralSummary.referralCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyValue(referralSummary.referralCode, 'ref-code')}
                  className="px-3 py-1.5 rounded-lg bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-[#0B0B0D] text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  {copiedKey === 'ref-code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>
                    {copiedKey === 'ref-code'
                      ? t(MEMBERSHIP_COPY.referral.copied)
                      : t(MEMBERSHIP_COPY.referral.copyCode)}
                  </span>
                </button>
              </div>
            </div>

            <div className="md:col-span-8 rounded-xl bg-[#F8FAFC] border border-zinc-200 p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                {t(MEMBERSHIP_COPY.referral.yourLinkLabel)}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="font-mono text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg px-3 py-2 truncate flex-1" dir="ltr">
                  {referralSummary.referralLink}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyValue(referralSummary.referralLink, 'ref-link')}
                  className="px-3.5 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  {copiedKey === 'ref-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>
                    {copiedKey === 'ref-link'
                      ? t(MEMBERSHIP_COPY.referral.copied)
                      : t(MEMBERSHIP_COPY.referral.copyLink)}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Referral KPI Stat Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-1">
              <div className="text-xs font-medium text-zinc-500">{t(MEMBERSHIP_COPY.referral.kpiTotalReferrals)}</div>
              <div className="text-2xl font-bold text-[#0B0B0D] tabular-nums">{referralSummary.totalReferrals}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-1">
              <div className="text-xs font-medium text-zinc-500">{t(MEMBERSHIP_COPY.referral.kpiCompletedPurchases)}</div>
              <div className="text-2xl font-bold text-[#16A34A] tabular-nums">{referralSummary.completedPurchases}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-1">
              <div className="text-xs font-medium text-zinc-500">{t(MEMBERSHIP_COPY.referral.kpiPendingReferrals)}</div>
              <div className="text-2xl font-bold text-amber-700 tabular-nums">{referralSummary.pendingReferrals}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-1">
              <div className="text-xs font-medium text-zinc-500">{t(MEMBERSHIP_COPY.referral.kpiTotalEarned)}</div>
              <div className="text-base sm:text-lg font-bold text-[#0B0B0D] tabular-nums" dir="ltr">
                PKR {Math.round(referralSummary.totalEarnedPkr).toLocaleString()} · $
                {Number(referralSummary.totalEarnedUsd || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Personal Reward Promo Codes Strip */}
          {referralSummary.personalRewardPromos && referralSummary.personalRewardPromos.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{t(MEMBERSHIP_COPY.referral.personalCodesHeading)}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {referralSummary.personalRewardPromos.map((rp) => (
                  <div
                    key={rp.code}
                    className="rounded-lg bg-white border border-emerald-200 px-3 py-2 flex items-center gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#0B0B0D]" dir="ltr">{rp.code}</span>
                      <span className="text-[#16A34A] font-semibold ml-2" dir="ltr">
                        {rp.discountType === 'percentage'
                          ? `${rp.discountPercent}% OFF`
                          : `PKR ${rp.discountAmountPkr} / $${rp.discountAmountUsd} OFF`}
                      </span>
                      {rp.expiresAt && (
                        <div className="text-[10px] text-zinc-500">
                          {isUrdu ? 'میعاد:' : 'Exp:'} {formatDate(rp.expiresAt)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyValue(rp.code, `rp-${rp.code}`)}
                      className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-[#22C55E] text-emerald-950 font-semibold text-[11px] cursor-pointer transition"
                    >
                      {copiedKey === `rp-${rp.code}`
                        ? t(MEMBERSHIP_COPY.referral.copied)
                        : t(MEMBERSHIP_COPY.referral.copyCode)}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends Activity & Credit Wallet Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{t(MEMBERSHIP_COPY.referral.historyHeading)}</span>
              </div>
              {referralSummary.referrals.length === 0 ? (
                <p className="text-xs text-zinc-500 leading-relaxed">{t(MEMBERSHIP_COPY.referral.noReferralsYet)}</p>
              ) : (
                <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto">
                  {referralSummary.referrals.map((refRow) => (
                    <div key={refRow.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-semibold text-[#0B0B0D] truncate">{refRow.referredName}</div>
                        <div className="text-[11px] text-zinc-500 truncate" dir="ltr">
                          {refRow.maskedEmail} · {formatDate(refRow.createdAt)}
                        </div>
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            refRow.status === 'converted'
                              ? 'bg-emerald-50 text-emerald-700'
                              : refRow.status === 'blocked'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {refRow.status === 'converted'
                            ? t(MEMBERSHIP_COPY.referral.statusConverted)
                            : refRow.status === 'blocked'
                            ? t(MEMBERSHIP_COPY.referral.statusBlocked)
                            : t(MEMBERSHIP_COPY.referral.statusSignedUp)}
                        </span>
                        {refRow.status === 'converted' && (refRow.rewardAmountPkr > 0 || refRow.rewardPromoCode) && (
                          <div className="text-[11px] font-semibold text-[#16A34A]" dir="ltr">
                            {refRow.rewardAmountPkr > 0
                              ? `+PKR ${refRow.rewardAmountPkr} / +$${refRow.rewardAmountUsd.toFixed(2)}`
                              : refRow.rewardPromoCode}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{t(MEMBERSHIP_COPY.referral.ledgerHeading)}</span>
              </div>
              {referralSummary.creditLedger.length === 0 ? (
                <p className="text-xs text-zinc-500 leading-relaxed">{t(MEMBERSHIP_COPY.referral.noLedgerYet)}</p>
              ) : (
                <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto">
                  {referralSummary.creditLedger.slice(0, 15).map((entry) => {
                    const isDeduction = entry.type === 'checkout_spent';
                    return (
                      <div key={entry.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <div className="font-medium text-[#0B0B0D] truncate">{entry.details}</div>
                          <div className="text-[11px] text-zinc-400">{formatDate(entry.createdAt)}</div>
                        </div>
                        <div
                          dir="ltr"
                          className={`font-bold tabular-nums shrink-0 ${
                            isDeduction ? 'text-red-600' : 'text-[#16A34A]'
                          }`}
                        >
                          {isDeduction ? '-' : '+'}
                          {entry.amountUsd > 0 && entry.amountPkr === 0
                            ? `$${entry.amountUsd.toFixed(2)} USD`
                            : `PKR ${Math.round(entry.amountPkr).toLocaleString()}${
                                entry.amountUsd > 0 ? ` / $${entry.amountUsd.toFixed(2)}` : ''
                              }`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Authorized Member Video Theater (Matching FEVIQO Website Episode Player) */}
      {activeStream && (
        <div
          ref={theaterRef}
          className="rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0B0B0D] text-white border border-zinc-800 shadow-2xl"
        >
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-zinc-800">
            <div className="min-w-0">
              <div className="text-xs text-[#22C55E] font-semibold uppercase tracking-wider">
                {activeStream.dramaTitle} · {t(MEMBERSHIP_COPY.dramaSelection.urduDubbed)} · HD
              </div>
              <div className="text-sm sm:text-base font-semibold text-white truncate">
                {activeStream.episodeTitle}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveStream(null)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer shrink-0"
              aria-label="Close episode player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            onContextMenu={(e) => e.preventDefault()}
            className="w-full relative overflow-hidden bg-black flex items-center justify-center select-none aspect-video"
          >
            {showPosterOverlay && activeStream.thumbnail && (
              <div
                onClick={handleStartPosterPlayback}
                className="absolute inset-0 z-30 bg-black flex items-center justify-center cursor-pointer group overflow-hidden"
              >
                <img
                  src={activeStream.thumbnail}
                  alt={activeStream.episodeTitle}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (activeStream.fallbackThumbnail && img.src !== activeStream.fallbackThumbnail) {
                      img.src = activeStream.fallbackThumbnail;
                    }
                  }}
                  className="w-full h-full object-cover object-center bg-black group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current text-slate-950 ml-1" />
                  </div>
                </div>
              </div>
            )}

            <style>{`
              mux-video, video-skin, video-player { object-fit: contain !important; }
              mux-video::part(video), mux-video video { object-fit: contain !important; width: 100% !important; height: 100% !important; }
              media-error-dialog, .media-error-dialog, [class*="dialog-root"], media-dialog-backdrop, media-dialog-popup {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
            `}</style>

            <video-player
              key={`${activeStream.dramaId}:${activeStream.episodeSlug}`}
              className="w-full h-full block bg-black overflow-hidden"
            >
              <video-skin style={{ display: 'block', width: '100%', height: '100%', aspectRatio: '16 / 9' }}>
                <mux-video
                  ref={videoRef as any}
                  src={activeStream.streamUrl}
                  playback-id={extractMuxPlaybackId(activeStream.streamUrl) || undefined}
                  crossorigin="anonymous"
                  playsinline
                  poster={activeStream.thumbnail || undefined}
                  onContextMenu={(e: any) => e.preventDefault()}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                ></mux-video>
                <mux-data env-key="feviqo" metadata-video-title={activeStream.episodeTitle}></mux-data>
              </video-skin>
            </video-player>
          </div>
        </div>
      )}

      {/* Unlocked Dramas & Eligible Episodes */}
      {activeMembershipsList.length > 0 && unlockedDramas.length > 0 && (
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
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        triggerMembershipUrl(drama.id === 'teskilat' ? '/teskilat' : `/${drama.id}`)
                      }
                      className="px-3 py-1.5 rounded-lg border border-zinc-300 hover:border-[#22C55E] text-xs font-semibold text-[#0B0B0D] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3 text-[#16A34A]" />
                      <span>{t(MEMBERSHIP_COPY.account.openDramaPage)}</span>
                    </button>
                    <div className="font-urdu-slim text-lg text-zinc-700" dir="rtl">
                      {drama.urduTitle}
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-zinc-100">
                  {drama.episodes.map((ep) => {
                    const key = `${drama.id}:${ep.slug}`;
                    const isLoading = loadingEpisodeSlug === key;
                    const isActive =
                      activeStream?.dramaId === drama.id && activeStream?.episodeSlug === ep.slug;
                    return (
                      <div
                        key={ep.slug}
                        className={`px-5 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                          isActive ? 'bg-emerald-50/70' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleWatchEpisode(drama.id, ep.slug)}
                            disabled={isLoading}
                            className="relative w-20 sm:w-24 aspect-video rounded-lg overflow-hidden bg-zinc-900 shrink-0 group cursor-pointer border border-zinc-200"
                            aria-label={`Play ${ep.title}`}
                          >
                            <img
                              src={ep.thumbnail || drama.posterUrl}
                              alt={ep.title}
                              onError={(e) => {
                                const img = e.currentTarget;
                                if (drama.fallbackPosterUrl && img.src !== drama.fallbackPosterUrl) {
                                  img.src = drama.fallbackPosterUrl;
                                }
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <span className="absolute inset-0 bg-black/25 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <span className="w-7 h-7 rounded-full bg-[#22C55E] text-[#0B0B0D] flex items-center justify-center shadow">
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              </span>
                            </span>
                          </button>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[#0B0B0D] truncate">
                              {isUrdu ? `قسط ${ep.number}` : `Episode ${ep.number}`}
                            </div>
                            <div className="text-xs text-zinc-500 truncate">
                              {ep.duration} · {ep.releaseDate}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleWatchEpisode(drama.id, ep.slug)}
                          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                            isActive
                              ? 'bg-[#22C55E] text-[#0B0B0D]'
                              : 'bg-[#0B0B0D] hover:bg-[#22C55E] hover:text-[#0B0B0D] text-white'
                          }`}
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
      {activeMembershipsList.length === 0 && (
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
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-zinc-50 rounded-xl p-2 min-h-[240px]">
              {proofViewerLoading ? (
                <div className="text-xs text-zinc-500 py-10">Loading payment proof...</div>
              ) : proofViewerSrc ? (
                <img
                  src={proofViewerSrc}
                  alt="Submitted payment screenshot"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : (
                <div className="text-xs text-zinc-500 py-10">
                  Could not load proof image preview.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

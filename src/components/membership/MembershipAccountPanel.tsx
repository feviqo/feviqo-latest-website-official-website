import React, { useState, useRef, useEffect } from 'react';
import { Play, LogOut, AlertCircle, X, Lock, RefreshCw } from 'lucide-react';
import {
  MemberAccountState,
  cancelActiveMembership,
  requestProtectedEpisodeStream,
} from '../../services/membershipService';
import { getDramaById } from '../../data/membershipCatalog';
import { attachHlsStream } from '../../utils/hlsPlayer';

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
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
        setActionMessage('Your membership has been cancelled and protected access ended immediately.');
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

  const { member, activeMembership, latestMembership, remainingDays, unlockedDramas, orders, history, gatewayStatus } =
    account;

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <section
      id="my-account"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10"
      aria-labelledby="account-heading"
    >
      {/* Top Account Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
            My Account
          </div>
          <h2 id="account-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0B0D] mt-1">
            {member.fullName}
          </h2>
          <p className="text-sm text-zinc-600 mt-0.5">{member.email}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onChoosePlanClick}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-300 text-[#0B0B0D] hover:bg-zinc-100 transition cursor-pointer whitespace-nowrap"
          >
            View Plans
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-zinc-600 hover:text-[#0B0B0D] hover:bg-zinc-100 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#0B0B0D]">
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Active / Expired / Empty Membership Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-[#F8FAFC] p-6 sm:p-8 flex flex-col justify-between gap-6">
          {activeMembership ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#16A34A]">
                    Active Membership
                  </div>
                  <h3 className="text-2xl font-bold text-[#0B0B0D] mt-1">
                    {activeMembership.planName} Plan
                  </h3>
                  <p className="text-sm text-zinc-600 mt-1 tabular-nums">
                    PKR {activeMembership.pricePkr.toLocaleString()} · {activeMembership.durationDays} Days · Expires{' '}
                    {formatDate(activeMembership.expiresAt)}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-bold text-[#0B0B0D] tabular-nums">{remainingDays}</div>
                  <div className="text-xs text-zinc-500">days remaining</div>
                </div>
              </div>

              <div className="pt-5 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-zinc-600">
                  Selected dramas:{' '}
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
                    Cancel Membership
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-zinc-700">Confirm immediate cancellation?</span>
                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={handleCancelMembership}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      {cancelling ? 'Cancelling...' : 'Yes, Cancel Now'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmCancel(false)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                    >
                      Keep Plan
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : latestMembership ? (
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                {latestMembership.status === 'cancelled' ? 'Membership Cancelled' : 'Membership Expired'}
              </div>
              <h3 className="text-2xl font-bold text-[#0B0B0D]">
                Your {latestMembership.planName} Plan is no longer active
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed max-w-xl">
                {latestMembership.status === 'cancelled'
                  ? `Cancelled on ${formatDate(latestMembership.cancelledAt)}. Streaming access for your selected dramas ended immediately.`
                  : `Your ${latestMembership.durationDays}-day term ended on ${formatDate(latestMembership.expiresAt)}. Renew your plan or select new dramas to resume streaming.`}
              </p>
              <div>
                <button
                  type="button"
                  onClick={onChoosePlanClick}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-sm font-semibold transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Renew Membership</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                No Active Membership
              </div>
              <h3 className="text-2xl font-bold text-[#0B0B0D]">
                Select a membership to begin watching
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed max-w-xl">
                Choose Starter, Standard, Plus, or VIP and select the Turkish dramas you want unlocked on your personal FEVIQO account.
              </p>
              <div>
                <button
                  type="button"
                  onClick={onChoosePlanClick}
                  className="px-5 py-2.5 rounded-xl bg-[#0B0B0D] hover:bg-zinc-800 text-white text-sm font-semibold transition cursor-pointer"
                >
                  Choose Your Membership
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Account Overview / Order Status */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Recent Checkout Orders
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-zinc-500">No membership orders created yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((ord) => (
                <div key={ord.id} className="pb-3 border-b border-zinc-100 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#0B0B0D]">
                      {ord.planName} · PKR {ord.amountPkr.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-zinc-600 capitalize">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {ord.selectedDramaIds.map((d) => getDramaById(d)?.title || d).join(', ')}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Order {ord.id} · {formatDate(ord.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!gatewayStatus.configured && orders.some((o) => o.status === 'pending_payment') && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 leading-relaxed">
              Pending orders await live payment settlement. Gateway credentials have not yet been connected on this server.
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
            <video
              ref={videoRef}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Unlocked Dramas & Eligible Episodes */}
      {activeMembership && unlockedDramas.length > 0 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-bold text-[#0B0B0D]">Your Unlocked Dramas &amp; Episodes</h3>
            <p className="text-sm text-zinc-600 mt-0.5">
              Stream all available and newly released eligible episodes included in your active membership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {unlockedDramas.map((drama) => (
              <div key={drama.id} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                <div className="p-5 border-b border-zinc-100 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-base font-bold text-[#0B0B0D]">{drama.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {drama.seasonLabel} · {drama.languageLabel} · {drama.episodes.length} Episodes
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
                            Episode {ep.number}
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
                          <span>{isLoading ? 'Verifying...' : 'Watch Episode'}</span>
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
            <div className="text-sm font-semibold text-[#0B0B0D]">Protected Member Library</div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Protected episode streams are strictly verified on the server for active, non-expired FEVIQO members. Select a plan above or renew an expired membership to unlock playback.
            </p>
          </div>
        </div>
      )}

      {/* Membership History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#0B0B0D]">Membership History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">No activity recorded yet.</p>
        ) : (
          <div className="rounded-2xl border border-zinc-200 divide-y divide-zinc-100 bg-white">
            {history.slice(0, 12).map((entry) => (
              <div key={entry.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-sm text-[#0B0B0D]">{entry.details}</div>
                <div className="text-xs text-zinc-500 shrink-0 tabular-nums">{formatDate(entry.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

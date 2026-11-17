import { useState, useEffect, useCallback } from 'react';
import {
  MembershipPlanId,
  getDramaById,
  isEpisodePremium,
} from '../../data/membershipCatalog';
import {
  MemberAccountState,
  MembershipRecord,
  WatermarkInfo,
  fetchMemberAccount,
  requestProtectedEpisodeStream,
  sendPlaybackHeartbeat,
} from '../../services/membershipService';

export type EpisodeGateCase = 'A' | 'B' | 'D' | 'E';

export interface EpisodeGateState {
  isOpen: boolean;
  dramaId: string;
  dramaTitle: string;
  episodeSlug: string;
  episodeTitle: string;
  caseType: EpisodeGateCase;
  coveredDramaIds?: string[];
  activePlanNames?: string[];
  expiredMembershipId?: string;
  expiredPlanId?: MembershipPlanId;
  expiresAt?: string;
  errorMessage?: string;
}

export function notifyMembershipAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('feviqo-member-auth-changed'));
  }
}

export function useDramaEntitlement(_defaultDramaId?: string) {
  const [account, setAccount] = useState<MemberAccountState | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [checkingEpisodeKey, setCheckingEpisodeKey] = useState<string | null>(null);
  const [unlockedStreams, setUnlockedStreams] = useState<Record<string, string>>({});
  const [playbackSessionIds, setPlaybackSessionIds] = useState<Record<string, string>>({});
  const [playbackWatermarks, setPlaybackWatermarks] = useState<Record<string, WatermarkInfo>>({});
  const [gateState, setGateState] = useState<EpisodeGateState | null>(null);

  const refreshEntitlement = useCallback(async () => {
    try {
      const res = await fetchMemberAccount();
      if (res && res.success) {
        setAccount(res);
        return res;
      }
      setAccount(null);
      return null;
    } catch {
      return null;
    } finally {
      setLoadingAccount(false);
    }
  }, []);

  useEffect(() => {
    refreshEntitlement();
    const onFocus = () => {
      refreshEntitlement();
    };
    const onAuthChanged = () => {
      setUnlockedStreams({});
      setPlaybackSessionIds({});
      setPlaybackWatermarks({});
      refreshEntitlement();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('feviqo-member-auth-changed', onAuthChanged);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('feviqo-member-auth-changed', onAuthChanged);
    };
  }, [refreshEntitlement]);

  // Mid-stream session & membership revocation heartbeat check every 30s
  useEffect(() => {
    const entries = Object.entries(unlockedStreams).filter(([, url]) => Boolean(url));
    if (entries.length === 0) return;

    const timer = window.setInterval(async () => {
      for (const [key] of entries) {
        const idx = key.indexOf(':');
        if (idx <= 0) continue;
        const dramaId = key.slice(0, idx);
        const episodeSlug = key.slice(idx + 1);
        const sessionId = playbackSessionIds[key];
        const hb = await sendPlaybackHeartbeat(dramaId, episodeSlug, sessionId);
        if (!hb.allowed) {
          setUnlockedStreams((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
          setPlaybackSessionIds((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
          setPlaybackWatermarks((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
          refreshEntitlement();
        }
      }
    }, 30000);

    return () => window.clearInterval(timer);
  }, [unlockedStreams, playbackSessionIds, refreshEntitlement]);

  const activeMemberships: MembershipRecord[] = (() => {
    if (!account) return [];
    const list =
      account.activeMemberships && account.activeMemberships.length > 0
        ? account.activeMemberships
        : account.activeMembership
        ? [account.activeMembership]
        : [];
    const now = Date.now();
    return list.filter(
      (m) => m.status === 'active' && (!m.expiresAt || Date.parse(m.expiresAt) > now)
    );
  })();

  const hasDramaAccess = useCallback(
    (dramaId: string): boolean => {
      const drama = getDramaById(dramaId);
      return activeMemberships.some((m) => {
        if (m.planId === 'vip' && (drama ? drama.vipEligible : true)) return true;
        return m.selectedDramaIds.includes(dramaId);
      });
    },
    [activeMemberships]
  );

  const getUnlockedStreamUrl = useCallback(
    (dramaId: string, episodeSlug: string): string | undefined => {
      return unlockedStreams[`${dramaId}:${episodeSlug}`];
    },
    [unlockedStreams]
  );

  const getWatermarkForEpisode = useCallback(
    (dramaId: string, episodeSlug: string): WatermarkInfo | undefined => {
      return playbackWatermarks[`${dramaId}:${episodeSlug}`];
    },
    [playbackWatermarks]
  );

  const closeGateModal = useCallback(() => {
    setGateState(null);
  }, []);

  const verifyAndUnlockEpisode = useCallback(
    async (
      dramaId: string,
      episodeSlug: string
    ): Promise<{
      allowed: boolean;
      streamUrl?: string;
      watermark?: WatermarkInfo;
      caseType?: EpisodeGateCase;
      coveredDramaIds?: string[];
      activePlanNames?: string[];
      expiredMembershipId?: string;
      expiredPlanId?: MembershipPlanId;
      expiresAt?: string;
    }> => {
      const key = `${dramaId}:${episodeSlug}`;
      if (unlockedStreams[key] && hasDramaAccess(dramaId)) {
        return {
          allowed: true,
          streamUrl: unlockedStreams[key],
          watermark: playbackWatermarks[key],
        };
      }

      setCheckingEpisodeKey(key);
      try {
        const res = await requestProtectedEpisodeStream(dramaId, episodeSlug);
        if ('streamUrl' in res && res.success) {
          setUnlockedStreams((prev) => ({ ...prev, [key]: res.streamUrl }));
          if (res.playbackSessionId) {
            const sid = res.playbackSessionId;
            setPlaybackSessionIds((prev) => ({ ...prev, [key]: sid }));
          }
          if (res.watermark) {
            const wm = res.watermark;
            setPlaybackWatermarks((prev) => ({ ...prev, [key]: wm }));
          }
          return {
            allowed: true,
            streamUrl: res.streamUrl,
            watermark: res.watermark,
          };
        }

        const errRes = res as {
          code?: string;
          coveredDramaIds?: string[];
          activePlanNames?: string[];
          expiredMembershipId?: string;
          expiredPlanId?: MembershipPlanId;
          expiresAt?: string;
        };

        let caseType: EpisodeGateCase = 'A';
        if (errRes.code === 'UNAUTHENTICATED') caseType = 'A';
        else if (errRes.code === 'NO_ACTIVE_MEMBERSHIP') caseType = 'B';
        else if (errRes.code === 'DRAMA_NOT_INCLUDED') caseType = 'D';
        else if (errRes.code === 'MEMBERSHIP_EXPIRED' || errRes.code === 'MEMBERSHIP_CANCELLED') {
          caseType = 'E';
        } else {
          caseType = account?.member ? 'B' : 'A';
        }

        return {
          allowed: false,
          caseType,
          coveredDramaIds: errRes.coveredDramaIds,
          activePlanNames: errRes.activePlanNames,
          expiredMembershipId: errRes.expiredMembershipId,
          expiredPlanId: errRes.expiredPlanId,
          expiresAt: errRes.expiresAt,
        };
      } catch {
        return {
          allowed: false,
          caseType: account?.member ? 'B' : 'A',
        };
      } finally {
        setCheckingEpisodeKey((prev) => (prev === key ? null : prev));
      }
    },
    [unlockedStreams, playbackWatermarks, hasDramaAccess, account?.member]
  );

  const attemptWatchEpisode = useCallback(
    async (
      dramaId: string,
      episodeSlug: string,
      episodeTitle: string,
      onUnlocked?: (streamUrl: string) => void
    ): Promise<{ allowed: boolean; streamUrl?: string; caseType?: EpisodeGateCase }> => {
      if (!isEpisodePremium(dramaId, episodeSlug)) {
        onUnlocked?.('');
        return { allowed: true };
      }

      const drama = getDramaById(dramaId);
      const dramaTitle = drama?.title || dramaId;
      const result = await verifyAndUnlockEpisode(dramaId, episodeSlug);

      if (result.allowed && result.streamUrl) {
        setGateState(null);
        onUnlocked?.(result.streamUrl);
        return { allowed: true, streamUrl: result.streamUrl };
      }

      if (account?.member && (!account.member.phone || account.member.phone.replace(/[^\d]/g, '').length < 10)) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('feviqo-require-phone-completion'));
        }
        return { allowed: false };
      }

      const caseType = result.caseType || (account?.member ? 'B' : 'A');
      setGateState({
        isOpen: true,
        dramaId,
        dramaTitle,
        episodeSlug,
        episodeTitle,
        caseType,
        coveredDramaIds: result.coveredDramaIds,
        activePlanNames: result.activePlanNames,
        expiredMembershipId: result.expiredMembershipId,
        expiredPlanId: result.expiredPlanId,
        expiresAt: result.expiresAt,
      });

      return { allowed: false, caseType };
    },
    [verifyAndUnlockEpisode, account?.member]
  );

  return {
    account,
    member: account?.member || null,
    activeMemberships,
    latestMembership: account?.latestMembership || null,
    loadingAccount,
    checkingEpisodeKey,
    unlockedStreams,
    playbackWatermarks,
    gateState,
    hasDramaAccess,
    getUnlockedStreamUrl,
    getWatermarkForEpisode,
    verifyAndUnlockEpisode,
    attemptWatchEpisode,
    closeGateModal,
    refreshEntitlement,
  };
}

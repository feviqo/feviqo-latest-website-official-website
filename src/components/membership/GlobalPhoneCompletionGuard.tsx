import React, { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ShieldBan, Mail, LogOut } from 'lucide-react';
import { AppRoute } from '../../types';
import { auth } from '../../firebase';
import {
  AccountBlockedDetail,
  checkMemberAccessStatus,
  fetchMemberAccount,
  getMemberToken,
  logoutMemberAccount,
  MemberAccountState,
} from '../../services/membershipService';
import { isFirebaseAdminUser } from '../../services/firestoreMembershipSync';
import { MembershipAuthModal } from './MembershipAuthModal';
import { notifyMembershipAuthChanged } from './useDramaEntitlement';

function hasValidPhoneNumber(phone?: string): boolean {
  const digits = (phone || '').replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

interface GlobalPhoneCompletionGuardProps {
  currentRoute: AppRoute;
}

export const GlobalPhoneCompletionGuard: React.FC<GlobalPhoneCompletionGuardProps> = ({
  currentRoute,
}) => {
  const [incompleteAccount, setIncompleteAccount] = useState<MemberAccountState | null>(null);
  const [blockedDetail, setBlockedDetail] = useState<AccountBlockedDetail | null>(null);

  const isAdminRoute = currentRoute === 'admin-memberships' || currentRoute === 'flow';
  const isYieldedPhoneRoute =
    currentRoute === 'membership' ||
    currentRoute === 'account' ||
    isAdminRoute;

  const enforceBlockedLockout = useCallback(async (detail: AccountBlockedDetail) => {
    setIncompleteAccount(null);
    setBlockedDetail(detail);
    await logoutMemberAccount().catch(() => {});
    if (!isFirebaseAdminUser()) {
      await signOut(auth).catch(() => {});
    }
    notifyMembershipAuthChanged();
  }, []);

  const checkSignedInAccountStatus = useCallback(async (forceCheck = false) => {
    if (typeof window === 'undefined' || isAdminRoute) return;
    const hasToken = Boolean(getMemberToken());
    if (!hasToken && !forceCheck) {
      setIncompleteAccount(null);
      return;
    }

    try {
      const res = await fetchMemberAccount();
      if (res && res.success) {
        if (!isYieldedPhoneRoute && !hasValidPhoneNumber(res.member.phone)) {
          setIncompleteAccount(res);
        } else {
          setIncompleteAccount(null);
        }
      } else {
        setIncompleteAccount(null);
        if (res && res.success === false && (res.code === 'ACCOUNT_BLOCKED' || res.blocked)) {
          await enforceBlockedLockout({
            email: res.email,
            reason: res.reason,
            error:
              res.error ||
              'This email address has been permanently blocked from accessing FEVIQO until an administrator restores access.',
          });
        }
      }
    } catch {
      // Non-fatal network issue
    }
  }, [isAdminRoute, isYieldedPhoneRoute, enforceBlockedLockout]);

  // Listen for site-wide ACCOUNT_BLOCKED events from any API call
  useEffect(() => {
    if (typeof window === 'undefined' || isAdminRoute) return;

    const onBlockedEvent = (evt: Event) => {
      const detail = (evt as CustomEvent<AccountBlockedDetail>).detail;
      if (!detail) return;
      void enforceBlockedLockout(detail);
    };

    window.addEventListener('feviqo-account-blocked', onBlockedEvent as EventListener);
    return () => {
      window.removeEventListener('feviqo-account-blocked', onBlockedEvent as EventListener);
    };
  }, [isAdminRoute, enforceBlockedLockout]);

  // Verify signed-in Firebase Google accounts against blocked list on mount / auth changes
  useEffect(() => {
    if (isAdminRoute) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.email || isFirebaseAdminUser()) return;
      try {
        const idToken = await user.getIdToken();
        const status = await checkMemberAccessStatus(idToken);
        if (status.blocked) {
          await enforceBlockedLockout({
            email: status.email || user.email,
            reason: status.reason,
            error:
              status.error ||
              'This email address has been permanently blocked from accessing FEVIQO until an administrator restores access.',
          });
        }
      } catch {
        // Non-fatal
      }
    });
    return () => unsubscribe();
  }, [isAdminRoute, enforceBlockedLockout]);

  // Check active member token on route navigation & auth changes (and periodically while signed in)
  useEffect(() => {
    if (isAdminRoute) {
      setIncompleteAccount(null);
      return;
    }

    void checkSignedInAccountStatus(false);

    const onAuthChanged = () => {
      void checkSignedInAccountStatus(false);
    };
    const onRequirePhone = () => {
      void checkSignedInAccountStatus(true);
    };

    const interval = window.setInterval(() => {
      if (getMemberToken()) {
        void checkMemberAccessStatus();
      }
    }, 45000);

    window.addEventListener('feviqo-member-auth-changed', onAuthChanged);
    window.addEventListener('feviqo-require-phone-completion', onRequirePhone);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('feviqo-member-auth-changed', onAuthChanged);
      window.removeEventListener('feviqo-require-phone-completion', onRequirePhone);
    };
  }, [isAdminRoute, currentRoute, checkSignedInAccountStatus]);

  if (blockedDetail && !isAdminRoute) {
    return (
      <div
        className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="feviqo-blocked-title"
      >
        <div className="w-full max-w-md rounded-2xl bg-[#111215] border border-red-500/40 shadow-2xl p-6 sm:p-7 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
            <ShieldBan className="w-7 h-7" />
          </div>
          <h2 id="feviqo-blocked-title" className="text-xl font-bold text-white tracking-tight">
            Account Access Blocked
          </h2>
          <p className="mt-2.5 text-sm text-gray-300 leading-relaxed">
            {blockedDetail.error}
          </p>
          {blockedDetail.email && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-red-300">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>{blockedDetail.email}</span>
            </div>
          )}
          {blockedDetail.reason &&
            blockedDetail.reason.trim() !== 'Blocked by FEVIQO administrator' && (
              <div className="mt-3 rounded-xl bg-red-950/40 border border-red-500/20 px-4 py-2.5 text-xs text-red-200 text-left">
                <span className="font-semibold text-red-300">Reason: </span>
                {blockedDetail.reason}
              </div>
            )}
          <p className="mt-4 text-xs text-gray-400">
            This email cannot sign in, register, or access FEVIQO memberships until an administrator restores access.
          </p>
          <button
            type="button"
            onClick={() => setBlockedDetail(null)}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Close</span>
          </button>
        </div>
      </div>
    );
  }

  if (isYieldedPhoneRoute || !incompleteAccount) {
    return null;
  }

  return (
    <MembershipAuthModal
      isOpen={true}
      forcePhoneAccount={incompleteAccount}
      onSignedOutDuringPhoneStep={() => {
        setIncompleteAccount(null);
      }}
      onClose={() => {
        // Keep open until valid phone is saved or user signs out via handleAbandonPhoneStep
      }}
      onAuthenticated={() => {
        setIncompleteAccount(null);
      }}
    />
  );
};

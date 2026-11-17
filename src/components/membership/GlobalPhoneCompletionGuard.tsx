import React, { useEffect, useState, useCallback } from 'react';
import { AppRoute } from '../../types';
import {
  fetchMemberAccount,
  getCachedMemberSnapshotForEmail,
  MemberAccountState,
} from '../../services/membershipService';
import { MembershipAuthModal } from './MembershipAuthModal';

const MEMBER_TOKEN_KEY = 'feviqo_member_token_v1';

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

  const isYieldedRoute =
    currentRoute === 'membership' ||
    currentRoute === 'account' ||
    currentRoute === 'admin-memberships' ||
    currentRoute === 'flow';

  const checkSignedInAccountPhone = useCallback(async (forceCheck = false) => {
    if (typeof window === 'undefined') return;
    let hasSessionHint = forceCheck;
    try {
      if (window.localStorage.getItem(MEMBER_TOKEN_KEY)) {
        hasSessionHint = true;
      } else if (getCachedMemberSnapshotForEmail()?.member?.email) {
        // Also check only when a cached member snapshot exists without hitting server for pure guests
        hasSessionHint = Boolean(window.localStorage.getItem(MEMBER_TOKEN_KEY));
      }
    } catch {}

    if (!hasSessionHint) {
      setIncompleteAccount(null);
      return;
    }

    try {
      const res = await fetchMemberAccount();
      if (res && res.success) {
        if (!hasValidPhoneNumber(res.member.phone)) {
          setIncompleteAccount(res);
        } else {
          setIncompleteAccount(null);
        }
      } else {
        setIncompleteAccount(null);
      }
    } catch {
      // Non-fatal network issue
    }
  }, []);

  useEffect(() => {
    if (isYieldedRoute) {
      setIncompleteAccount(null);
      return;
    }

    void checkSignedInAccountPhone(false);

    const onAuthChanged = () => {
      void checkSignedInAccountPhone(false);
    };
    const onRequirePhone = () => {
      void checkSignedInAccountPhone(true);
    };

    window.addEventListener('feviqo-member-auth-changed', onAuthChanged);
    window.addEventListener('feviqo-require-phone-completion', onRequirePhone);
    return () => {
      window.removeEventListener('feviqo-member-auth-changed', onAuthChanged);
      window.removeEventListener('feviqo-require-phone-completion', onRequirePhone);
    };
  }, [isYieldedRoute, checkSignedInAccountPhone]);

  if (isYieldedRoute || !incompleteAccount) {
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

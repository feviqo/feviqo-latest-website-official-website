import React, { useState } from 'react';
import { Crown, LogIn, LogOut, ShieldCheck, User } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { AppRoute } from '../../types';
import { logoutMemberAccount } from '../../services/membershipService';
import { notifyMembershipAuthChanged, useDramaEntitlement } from './useDramaEntitlement';

interface DramaMemberBarProps {
  dramaId?: string;
  onNavigatePage: (route: AppRoute) => void;
}

export const DramaMemberBar: React.FC<DramaMemberBarProps> = ({
  dramaId,
  onNavigatePage,
}) => {
  const { account, loadingAccount, hasDramaAccess } = useDramaEntitlement(dramaId);
  const [signingOut, setSigningOut] = useState(false);

  if (loadingAccount) {
    return null;
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logoutMemberAccount();
      await signOut(auth).catch(() => {});
      notifyMembershipAuthChanged();
    } finally {
      setSigningOut(false);
    }
  };

  const member = account?.member || null;
  const activeMemberships = account?.activeMemberships || [];
  const activePlanNames = Array.from(
    new Set(activeMemberships.map((m) => m.planName).filter(Boolean))
  );
  const dramaUnlocked = dramaId ? hasDramaAccess(dramaId) : activeMemberships.length > 0;
  const isVip = activeMemberships.some((m) => m.planId === 'vip');

  if (!member) {
    return (
      <div className="w-full bg-slate-950 text-white border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Sign in with your FEVIQO member account to watch unlocked Premium Urdu episodes.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigatePage('account')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('membership')}
              className="px-3 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Get Membership</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#09150F] text-white border-b border-emerald-900/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-white min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
            <span className="truncate max-w-[180px] sm:max-w-[260px]">
              {member.fullName || member.email}
            </span>
          </span>
          {member.email && (
            <span className="hidden md:inline text-[11px] text-emerald-200/75 truncate max-w-[220px]">
              {member.email}
            </span>
          )}
          {activeMemberships.length > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold whitespace-nowrap">
              {isVip ? (
                <Crown className="w-3 h-3 text-amber-300 shrink-0" />
              ) : (
                <ShieldCheck className="w-3 h-3 shrink-0" />
              )}
              <span>
                {dramaId && dramaUnlocked
                  ? `${activePlanNames[0] || 'Premium'} · Unlocked`
                  : `${activePlanNames.join(' + ') || 'Active Membership'}`}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-slate-200 text-[11px] font-semibold whitespace-nowrap">
              <span>Free Account</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigatePage('account')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-200 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
          >
            <User className="w-3.5 h-3.5" />
            <span>My Account</span>
          </button>
          {activeMemberships.length === 0 && (
            <button
              type="button"
              onClick={() => onNavigatePage('membership')}
              className="px-3 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Upgrade</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/25 border border-white/15 hover:border-red-400/40 text-slate-200 hover:text-red-200 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap disabled:opacity-60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, LogOut, AlertCircle, MessageSquare, Users, CreditCard } from 'lucide-react';
import { signInWithPopup, signOut } from 'firebase/auth';
import {
  SafeAdmin,
  fetchAdminAuthStatus,
  loginAdminAccount,
  authenticateAdminWithGoogle,
  logoutAdminAccount,
} from '../../services/membershipService';
import { auth, googleProvider } from '../../firebase';
import { AppRoute } from '../../types';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

interface AdminPortalAuthGateProps {
  currentSection: 'automation' | 'leads';
  onBookCall: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigatePricing: () => void;
  onNavigateFlow: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
  children: (ctx: {
    admin: SafeAdmin;
    handleLogout: () => Promise<void>;
    renderSectionSwitcher: () => React.ReactNode;
  }) => React.ReactNode;
}

export const AdminPortalAuthGate: React.FC<AdminPortalAuthGateProps> = ({
  currentSection,
  onBookCall,
  onNavigateSection,
  onNavigatePricing,
  onNavigateFlow,
  onNavigatePage,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<SafeAdmin | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchAdminAuthStatus()
      .then((res) => {
        if (!active) return;
        if (res.authenticated && res.admin) {
          setAdmin(res.admin);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await loginAdminAccount({ email: email.trim(), password });
      if (!res.success || !('admin' in res) || !res.admin) {
        setError(('error' in res ? res.error : undefined) || 'Invalid administrator credentials.');
        return;
      }
      setAdmin(res.admin);
      setPassword('');
    } catch {
      setError('Unable to reach authentication server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleBusy(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();
      const res = await authenticateAdminWithGoogle(idToken);
      if (!res.success || !('admin' in res) || !res.admin) {
        await signOut(auth).catch(() => {});
        setError(('error' in res ? res.error : undefined) || 'This Google account does not have FEVIQO admin access.');
        return;
      }
      setAdmin(res.admin);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Google sign-in failed.');
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdminAccount().catch(() => {});
    await signOut(auth).catch(() => {});
    setAdmin(null);
  };

  const renderSectionSwitcher = () => (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onNavigatePage('admin-memberships')}
        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition"
      >
        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
        <span>Memberships Admin</span>
      </button>
      <button
        type="button"
        onClick={() => onNavigatePage('admin-automation')}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition ${
          currentSection === 'automation'
            ? 'bg-[#0F172A] text-white'
            : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>WhatsApp &amp; Automation</span>
      </button>
      <button
        type="button"
        onClick={() => onNavigatePage('admin-automation-leads')}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition ${
          currentSection === 'leads'
            ? 'bg-[#0F172A] text-white'
            : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
        }`}
      >
        <Users className="w-3.5 h-3.5" />
        <span>Video Leads &amp; Inbox</span>
      </button>
      <button
        type="button"
        onClick={handleLogout}
        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sign Out</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col">
      <Navbar
        onBookCall={onBookCall}
        onNavigateSection={onNavigateSection}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-600">
            Verifying administrator session...
          </div>
        ) : !admin ? (
          <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl border border-slate-200 p-7 sm:p-8 shadow-sm space-y-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#16A34A]">
                <ShieldCheck className="w-4 h-4" />
                <span>FEVIQO Automation Admin</span>
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Administrator Sign In</h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign in with your authorized FEVIQO administrator account to manage WhatsApp Cloud API, membership automation, episode broadcasts, and video editing leads.
              </p>
            </div>

            <button
              type="button"
              disabled={googleBusy || submitting}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
            >
              <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{googleBusy ? 'Connecting Google Admin...' : 'Sign in with Authorized Google Account'}</span>
            </button>

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400">
              <div className="flex-1 h-px bg-slate-200" />
              <span>or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Admin Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@feviqo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0F172A]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] hover:text-[#0F172A] text-white text-sm font-semibold transition cursor-pointer disabled:opacity-60"
              >
                {submitting ? 'Signing In...' : 'Sign In to Automation Portal'}
              </button>
            </form>
          </div>
        ) : (
          children({ admin, handleLogout, renderSectionSwitcher })
        )}
      </main>

      <Footer
        onBookCall={onBookCall}
        onGetStarted={onBookCall}
        onNavigateSection={onNavigateSection}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={() => onNavigateFlow('login')}
        onNavigatePage={onNavigatePage}
      />
    </div>
  );
};

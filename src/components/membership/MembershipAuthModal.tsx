import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, ArrowRight } from 'lucide-react';
import {
  loginMemberAccount,
  registerMemberAccount,
  MemberAccountState,
} from '../../services/membershipService';

interface MembershipAuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  pendingContextLabel?: string;
  onClose: () => void;
  onAuthenticated: (account: MemberAccountState) => void;
}

export const MembershipAuthModal: React.FC<MembershipAuthModalProps> = ({
  isOpen,
  initialMode = 'signup',
  pendingContextLabel,
  onClose,
  onAuthenticated,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result =
        mode === 'signup'
          ? await registerMemberAccount({ fullName, email, password })
          : await loginMemberAccount({ email, password });

      if ('error' in result) {
        setError(result.error || 'Authentication failed. Please check your details.');
        setSubmitting(false);
        return;
      }

      onAuthenticated(result);
    } catch {
      setError('Unable to reach authentication server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="membership-auth-title"
    >
      <div
        className="w-full max-w-md bg-white text-[#0B0B0D] rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign in dialog"
          className="absolute top-5 right-5 p-2 rounded-lg text-zinc-500 hover:text-[#0B0B0D] hover:bg-zinc-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1.5 pr-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
            FEVIQO Account
          </div>
          <h2 id="membership-auth-title" className="text-2xl font-bold tracking-tight text-[#0B0B0D]">
            {mode === 'signup' ? 'Create your account' : 'Sign in to FEVIQO'}
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            {pendingContextLabel
              ? `Continue with ${pendingContextLabel}. Your membership is linked directly to your personal email account.`
              : 'Access your FEVIQO Premium Membership, selected dramas, and billing history.'}
          </p>
        </div>

        {/* Clean segmented toggle */}
        <div className="mt-6 grid grid-cols-2 bg-zinc-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#0B0B0D] shadow-sm'
                : 'text-zinc-600 hover:text-[#0B0B0D]'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-[#0B0B0D] shadow-sm'
                : 'text-zinc-600 hover:text-[#0B0B0D]'
            }`}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label htmlFor="member-fullname" className="block text-xs font-semibold text-zinc-700">
                Full Name
              </label>
              <input
                id="member-fullname"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Hamza Tariq"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D] transition"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="member-email" className="block text-xs font-semibold text-zinc-700">
              Email Address
            </label>
            <input
              id="member-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D] transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="member-password" className="block text-xs font-semibold text-zinc-700">
              Password
            </label>
            <div className="relative">
              <input
                id="member-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#0B0B0D] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-[#0B0B0D] hover:bg-zinc-800 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>
              {submitting
                ? mode === 'signup'
                  ? 'Creating account...'
                  : 'Signing in...'
                : mode === 'signup'
                ? 'Create Personal Account'
                : 'Sign In'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

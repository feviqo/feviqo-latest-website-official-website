import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import {
  loginMemberAccount,
  registerMemberAccount,
  authenticateMemberWithGoogle,
  MemberAccountState,
} from '../../services/membershipService';
import { auth, googleProvider } from '../../firebase';
import { syncMemberAccountToFirestore } from '../../services/firestoreMembershipSync';
import { useLanguage } from '../../i18n/LanguageContext';
import { MEMBERSHIP_COPY } from '../../i18n/membershipTranslations';

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
  const { t, isUrdu, dir } = useLanguage();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();
      const result = await authenticateMemberWithGoogle({
        idToken,
        fullName: cred.user.displayName || undefined,
      });
      if ('error' in result) {
        setError(result.error || 'Google sign-in failed.');
        setGoogleLoading(false);
        return;
      }
      await syncMemberAccountToFirestore(result.member, cred.user.uid).catch(() => {});
      onAuthenticated(result);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setError(
          isUrdu ? 'گوگل سائن ان مکمل ہونے سے پہلے بند ہو گیا۔' : 'Google sign-in popup was closed before completing.'
        );
      } else {
        setError(
          err?.message ||
            (isUrdu
              ? 'گوگل کے ذریعے سائن ان نہیں ہو سکا۔ براہ کرم ای میل استعمال کریں۔'
              : 'Unable to sign in with Google right now. You can use Email & Password below.')
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setError(
          isUrdu
            ? 'براہ کرم اپنا مکمل نام درج کریں۔'
            : 'Please enter your full name.'
        );
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError(
          isUrdu
            ? 'براہ کرم درست ای میل ایڈریس درج کریں۔'
            : 'Please enter a valid email address.'
        );
        return;
      }
      const phoneDigits = phone.replace(/[^\d]/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        setError(
          isUrdu
            ? 'براہ کرم درست فون نمبر درج کریں (کم از کم 10 ہندسے)۔'
            : 'Please enter a valid phone number (e.g. 0300 1234567).'
        );
        return;
      }
      if (password.length < 6) {
        setError(
          isUrdu
            ? 'پاس ورڈ کم از کم 6 حروف کا ہونا ضروری ہے۔'
            : 'Password must be at least 6 characters long.'
        );
        return;
      }
      if (password !== confirmPassword) {
        setError(
          isUrdu
            ? 'پاس ورڈ اور تصدیقی پاس ورڈ آپس میں میل نہیں کھاتے۔'
            : 'Password and Confirm Password do not match.'
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const result =
        mode === 'signup'
          ? await registerMemberAccount({
              fullName: fullName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              password,
              confirmPassword,
            })
          : await loginMemberAccount({ email: email.trim(), password });

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="membership-auth-title"
    >
      <div
        dir={dir}
        className="w-full max-w-md bg-white text-[#0B0B0D] rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign in dialog"
          className={`p-2 rounded-lg text-zinc-500 hover:text-[#0B0B0D] hover:bg-zinc-100 transition cursor-pointer absolute top-5 ${
            isUrdu ? 'left-5' : 'right-5'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`space-y-1.5 ${isUrdu ? 'pl-8 font-urdu-slim' : 'pr-8'}`}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
            {t(MEMBERSHIP_COPY.auth.eyebrow)}
          </div>
          <h2 id="membership-auth-title" className="text-2xl font-bold tracking-tight text-[#0B0B0D]">
            {mode === 'signup' ? t(MEMBERSHIP_COPY.auth.createTitle) : t(MEMBERSHIP_COPY.auth.signInTitle)}
          </h2>
          {pendingContextLabel ? (
            <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="font-semibold" dir="ltr">{pendingContextLabel}</div>
              <p className="text-emerald-800">{t(MEMBERSHIP_COPY.auth.subtitlePending)}</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-600 leading-relaxed">
              {t(MEMBERSHIP_COPY.auth.subtitleGeneral)}
            </p>
          )}
        </div>

        {/* Google Sign-In Button */}
        <div className="mt-5">
          <button
            type="button"
            disabled={googleLoading || submitting}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 disabled:opacity-60 text-[#0B0B0D] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            <span>
              {googleLoading
                ? isUrdu
                  ? 'گوگل سے منسلک ہو رہا ہے...'
                  : 'Connecting Google...'
                : isUrdu
                ? 'گوگل کے ساتھ جاری رکھیں'
                : 'Continue with Google'}
            </span>
          </button>

          <div className="mt-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-zinc-400">
            <div className="flex-1 h-px bg-zinc-200" />
            <span>{isUrdu ? 'یا' : 'or'}</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>
        </div>

        {/* Clean segmented toggle */}
        <div className="mt-4 grid grid-cols-2 bg-zinc-100 p-1 rounded-xl">
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
            {t(MEMBERSHIP_COPY.auth.createTab)}
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
            {t(MEMBERSHIP_COPY.auth.signInTab)}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {mode === 'signup' && (
            <>
              <div className="space-y-1">
                <label htmlFor="member-fullname" className="block text-xs font-semibold text-zinc-700">
                  {t(MEMBERSHIP_COPY.auth.fullName)}
                </label>
                <input
                  id="member-fullname"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t(MEMBERSHIP_COPY.auth.fullNamePlaceholder)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D] transition"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="member-phone" className="block text-xs font-semibold text-zinc-700">
                  {t(MEMBERSHIP_COPY.auth.phone)}
                </label>
                <input
                  id="member-phone"
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t(MEMBERSHIP_COPY.auth.phonePlaceholder)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D] transition"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label htmlFor="member-email" className="block text-xs font-semibold text-zinc-700">
              {t(MEMBERSHIP_COPY.auth.email)}
            </label>
            <input
              id="member-email"
              type="email"
              dir="ltr"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D] transition"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="member-password" className="block text-xs font-semibold text-zinc-700">
              {t(MEMBERSHIP_COPY.auth.password)}
            </label>
            <div className="relative">
              <input
                id="member-password"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t(MEMBERSHIP_COPY.auth.passwordPlaceholder)}
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

          {mode === 'signup' && (
            <div className="space-y-1">
              <label htmlFor="member-confirm-password" className="block text-xs font-semibold text-zinc-700">
                {t(MEMBERSHIP_COPY.auth.confirmPassword)}
              </label>
              <input
                id="member-confirm-password"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t(MEMBERSHIP_COPY.auth.confirmPasswordPlaceholder)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#0B0B0D] transition"
              />
            </div>
          )}

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
            className="w-full py-3 px-4 rounded-xl bg-[#0B0B0D] hover:bg-[#22C55E] hover:text-[#0B0B0D] disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>
              {submitting
                ? mode === 'signup'
                  ? t(MEMBERSHIP_COPY.auth.creating)
                  : t(MEMBERSHIP_COPY.auth.signingIn)
                : mode === 'signup'
                ? t(MEMBERSHIP_COPY.auth.createButton)
                : t(MEMBERSHIP_COPY.auth.signInButton)}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

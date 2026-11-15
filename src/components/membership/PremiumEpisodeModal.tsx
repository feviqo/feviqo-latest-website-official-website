import React, { useEffect } from 'react';
import { Lock, Play, RefreshCw, ShieldCheck, UserCheck, X, Sparkles } from 'lucide-react';
import { getDramaById } from '../../data/membershipCatalog';
import { SafeMember } from '../../services/membershipService';
import { useLanguage } from '../../i18n/LanguageContext';
import { MEMBERSHIP_COPY } from '../../i18n/membershipTranslations';
import { EpisodeGateState } from './useDramaEntitlement';

interface PremiumEpisodeModalProps {
  gateState: EpisodeGateState | null;
  member: SafeMember | null;
  onClose: () => void;
  onNavigateMembershipUrl: (targetUrl: string) => void;
}

export const PremiumEpisodeModal: React.FC<PremiumEpisodeModalProps> = ({
  gateState,
  member,
  onClose,
  onNavigateMembershipUrl,
}) => {
  const { t, isUrdu, dir } = useLanguage();

  useEffect(() => {
    if (!gateState?.isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gateState?.isOpen, onClose]);

  if (!gateState || !gateState.isOpen) return null;

  const {
    dramaId,
    dramaTitle,
    episodeSlug,
    episodeTitle,
    caseType,
    coveredDramaIds = [],
    activePlanNames = [],
    expiredMembershipId,
    expiredPlanId,
    expiresAt,
  } = gateState;

  const qsContext = `drama=${encodeURIComponent(dramaId)}&episode=${encodeURIComponent(episodeSlug)}`;
  const explorePlansUrl =
    caseType === 'D'
      ? `/membership?${qsContext}&mode=additional`
      : caseType === 'E' && expiredMembershipId
      ? `/membership?renew=${encodeURIComponent(expiredMembershipId)}${
          expiredPlanId ? `&plan=${encodeURIComponent(expiredPlanId)}` : ''
        }&${qsContext}`
      : `/membership?${qsContext}`;
  const signInUrl = `/membership?auth=signin&${qsContext}`;

  const coveredDramaTitles = coveredDramaIds
    .map((id) => getDramaById(id)?.title || id)
    .join(', ');

  const formattedExpiry = expiresAt
    ? (() => {
        try {
          return new Date(expiresAt).toLocaleString(isUrdu ? 'ur-PK' : 'en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        } catch {
          return expiresAt;
        }
      })()
    : '';

  const headline =
    caseType === 'A'
      ? t(MEMBERSHIP_COPY.episodeGate.caseATitle)
      : caseType === 'B'
      ? t(MEMBERSHIP_COPY.episodeGate.caseBTitle)
      : caseType === 'D'
      ? t(MEMBERSHIP_COPY.episodeGate.caseDTitle)
      : t(MEMBERSHIP_COPY.episodeGate.caseETitle);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-episode-gate-title"
    >
      <div
        dir={dir}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-2xl sm:rounded-3xl bg-[#0B0B0D] text-white border border-zinc-800 shadow-2xl p-6 sm:p-8 relative space-y-5 ${
          isUrdu ? 'font-urdu-slim' : ''
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close membership dialog"
          className={`p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer absolute top-5 ${
            isUrdu ? 'left-5' : 'right-5'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Eyebrow & Icon */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center shrink-0">
            {caseType === 'E' ? <RefreshCw className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div className="min-w-0 pr-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#22C55E] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>{t(MEMBERSHIP_COPY.episodeGate.urduPremiumTag)}</span>
            </div>
            <div className="text-xs text-zinc-400 truncate mt-0.5">
              {dramaTitle} · {episodeTitle}
            </div>
          </div>
        </div>

        {/* Title & Contextual Message */}
        <div className="space-y-3">
          <h2 id="premium-episode-gate-title" className="text-xl sm:text-2xl font-bold text-white leading-snug">
            {headline}
          </h2>

          {caseType === 'A' && (
            <p className="text-sm text-zinc-300 leading-relaxed">
              {t(MEMBERSHIP_COPY.episodeGate.caseADesc)}
            </p>
          )}

          {caseType === 'B' && (
            <div className="space-y-2.5">
              {member && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                  <UserCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>
                    {member.fullName} ({member.email})
                  </span>
                </div>
              )}
              <p className="text-sm text-zinc-300 leading-relaxed">
                {t(MEMBERSHIP_COPY.episodeGate.caseBDesc)}
              </p>
            </div>
          )}

          {caseType === 'D' && (
            <div className="space-y-3">
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3.5 text-xs space-y-1.5">
                <div className="text-zinc-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>{t(MEMBERSHIP_COPY.episodeGate.caseDDescPrefix)}</span>
                </div>
                <div className="font-semibold text-white">
                  {coveredDramaTitles || 'Other active drama plan'}
                  {activePlanNames.length > 0 ? ` (${activePlanNames.join(', ')})` : ''}
                </div>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {t(MEMBERSHIP_COPY.episodeGate.caseDKeepIntactNote)}
              </p>
            </div>
          )}

          {caseType === 'E' && (
            <div className="space-y-2.5">
              {formattedExpiry && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-semibold">
                  <span>
                    {isUrdu ? `میعاد ختم: ${formattedExpiry}` : `Expired on ${formattedExpiry}`}
                  </span>
                </div>
              )}
              <p className="text-sm text-zinc-300 leading-relaxed">
                {t(MEMBERSHIP_COPY.episodeGate.caseEDesc)}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={explorePlansUrl}
              onClick={(e) => {
                e.preventDefault();
                onClose();
                onNavigateMembershipUrl(explorePlansUrl);
              }}
              className="flex-1 py-3 px-5 rounded-xl bg-[#22C55E] hover:bg-emerald-500 text-[#0B0B0D] text-sm font-black inline-flex items-center justify-center gap-2 transition cursor-pointer shadow-lg text-center"
            >
              {caseType === 'E' ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>{t(MEMBERSHIP_COPY.episodeGate.renewNowBtn)}</span>
                </>
              ) : caseType === 'D' ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t(MEMBERSHIP_COPY.episodeGate.addPlanBtn)}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t(MEMBERSHIP_COPY.episodeGate.explorePlansBtn)}</span>
                </>
              )}
            </a>

            {caseType === 'A' && (
              <a
                href={signInUrl}
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  onNavigateMembershipUrl(signInUrl);
                }}
                className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold inline-flex items-center justify-center transition cursor-pointer text-center"
              >
                {t(MEMBERSHIP_COPY.episodeGate.signInBtn)}
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
          >
            {t(MEMBERSHIP_COPY.episodeGate.closeBtn)}
          </button>
        </div>
      </div>
    </div>
  );
};

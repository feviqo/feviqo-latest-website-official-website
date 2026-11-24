import React, { useEffect, useState } from 'react';
import { Crown, Trophy, Heart, Award, ShieldCheck, ArrowUpRight } from 'lucide-react';
import {
  fetchPublicSupportersLeaderboard,
  PublicSupportersLeaderboardResponse,
} from '../../services/membershipService';
import { subscribeToPublicSupportersLeaderboard } from '../../services/firestoreMembershipSync';

interface SupportersLeaderboardSectionProps {
  onSupportClick?: () => void;
}

export const SupportersLeaderboardSection: React.FC<SupportersLeaderboardSectionProps> = ({
  onSupportClick,
}) => {
  const [data, setData] = useState<PublicSupportersLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadFromApi = async () => {
      try {
        const res = await fetchPublicSupportersLeaderboard();
        if (mounted && res && res.success) {
          setData({
            enabled: res.enabled,
            settings: res.settings,
            entries: res.entries,
            updatedAt: res.updatedAt,
          });
        }
      } catch {
        // Non-fatal fallback; real-time listener may still populate
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadFromApi();

    const unsubscribe = subscribeToPublicSupportersLeaderboard((liveData) => {
      if (!mounted) return;
      setData((prev) => {
        if (!liveData) return prev;
        if (
          prev &&
          prev.entries.length > 0 &&
          liveData.enabled !== false &&
          (!Array.isArray(liveData.entries) || liveData.entries.length === 0)
        ) {
          return prev;
        }
        return liveData;
      });
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // If explicitly disabled by admin, hide cleanly
  if (!loading && data && data.enabled === false) {
    return null;
  }

  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const showSubtitle = data?.settings?.showSubtitle ?? true;
  const showBadges = data?.settings?.showBadges ?? true;

  const topOne = entries.find((e) => e.rank === 1);
  const topTwoThree = entries.filter((e) => e.rank === 2 || e.rank === 3);
  const remainingRows = entries.filter((e) => e.rank >= 4);

  return (
    <section
      id="feviqo-top-supporters"
      aria-labelledby="feviqo-top-supporters-heading"
      className="bg-[#0B0B0D] text-white border-y border-zinc-900 py-16 sm:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/90 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#22C55E]">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Community Patrons · Verified Support</span>
            </div>
            <h2
              id="feviqo-top-supporters-heading"
              className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            >
              FEVIQO Top Supporters
            </h2>
            {showSubtitle && (
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Top 3 supporters receive featured badges and shoutouts in FEVIQO&apos;s upcoming
                episode credits.
              </p>
            )}
          </div>

          {onSupportClick && (
            <button
              type="button"
              onClick={onSupportClick}
              className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-[#22C55E] border border-zinc-800 hover:border-[#22C55E] text-white hover:text-[#0B0B0D] text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer shrink-0"
            >
              <span>Support FEVIQO During Checkout</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-zinc-900/70 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          /* Clean Empty State when enabled and no supporters yet */
          <div className="rounded-2xl bg-[#121216] border border-zinc-800/90 p-8 sm:p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">
                Become FEVIQO&apos;s First Founding Supporter
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Add an optional contribution with any membership package to support more Urdu-dubbed
                episodes and appear here once verified.
              </p>
            </div>
            {onSupportClick && (
              <button
                type="button"
                onClick={onSupportClick}
                className="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0B0B0D] hover:text-white text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer"
              >
                <span>Choose a Membership Plan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top 3 Featured Spotlight Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Rank #1 — Executive Patron Emerald Spotlight */}
              {topOne && (
                <div
                  className={`${
                    topTwoThree.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12'
                  } rounded-2xl bg-gradient-to-br from-[#111915] via-[#101412] to-[#0E0E12] border border-[#22C55E]/40 p-6 sm:p-7 flex flex-col justify-between gap-5 relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center shrink-0">
                        <Crown className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#22C55E] tabular-nums">
                            Rank #1
                          </span>
                          {showBadges && topOne.badge && (
                            <span className="px-2 py-0.5 rounded-md bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-[10px] font-bold uppercase tracking-wider">
                              {topOne.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white truncate mt-1">
                          {topOne.displayName}
                        </h3>
                      </div>
                    </div>

                    <Trophy className="w-5 h-5 text-[#22C55E]/70 shrink-0 hidden sm:block" />
                  </div>

                  <div className="flex items-end justify-between gap-4 pt-4 border-t border-white/10">
                    <div className="text-[11px] text-zinc-400">
                      Featured in upcoming episode credits
                    </div>
                    <div
                      dir="ltr"
                      className={`text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${
                        topOne.amountVisible ? 'text-[#22C55E]' : 'text-zinc-400 text-sm font-semibold'
                      }`}
                    >
                      {topOne.amountDisplay}
                    </div>
                  </div>
                </div>
              )}

              {/* Ranks #2 & #3 — Founding Supporter Blue Accents */}
              {topTwoThree.length > 0 && (
                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {topTwoThree.map((supporter) => (
                    <div
                      key={supporter.id}
                      className="rounded-2xl bg-[#12131A] border border-[#3B82F6]/30 hover:border-[#3B82F6]/50 transition-colors p-5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/35 text-[#3B82F6] font-bold text-sm tabular-nums flex items-center justify-center shrink-0">
                          #{supporter.rank}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-white truncate">
                              {supporter.displayName}
                            </h3>
                          </div>
                          {showBadges && supporter.badge && (
                            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-[#60A5FA]">
                              <Award className="w-3 h-3 shrink-0" />
                              <span className="truncate">{supporter.badge}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        dir="ltr"
                        className={`text-right shrink-0 tabular-nums ${
                          supporter.amountVisible
                            ? 'text-base sm:text-lg font-bold text-white'
                            : 'text-xs font-medium text-zinc-400'
                        }`}
                      >
                        {supporter.amountDisplay}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ranks #4–#10 Compact Editorial List */}
            {remainingRows.length > 0 && (
              <div className="rounded-2xl bg-[#111115] border border-zinc-800/90 overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-800/80 grid grid-cols-12 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  <div className="col-span-2 sm:col-span-1">Rank</div>
                  <div className={showBadges ? 'col-span-6 sm:col-span-5' : 'col-span-6 sm:col-span-8'}>
                    Supporter
                  </div>
                  {showBadges && <div className="hidden sm:block sm:col-span-3">Badge</div>}
                  <div className="col-span-4 sm:col-span-3 text-right">Contribution</div>
                </div>
                <div className="divide-y divide-zinc-800/70">
                  {remainingRows.map((row) => (
                    <div
                      key={row.id}
                      className="px-5 py-3.5 grid grid-cols-12 items-center gap-2 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="col-span-2 sm:col-span-1 text-xs font-bold text-zinc-400 tabular-nums">
                        #{row.rank}
                      </div>
                      <div
                        className={`${
                          showBadges ? 'col-span-6 sm:col-span-5' : 'col-span-6 sm:col-span-8'
                        } min-w-0`}
                      >
                        <div className="text-sm font-semibold text-white truncate">
                          {row.displayName}
                        </div>
                        {showBadges && row.badge && (
                          <div className="sm:hidden text-[10px] text-zinc-400 truncate mt-0.5">
                            {row.badge}
                          </div>
                        )}
                      </div>
                      {showBadges && (
                        <div className="hidden sm:block sm:col-span-3 min-w-0">
                          {row.badge ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-zinc-800/90 border border-zinc-700/80 text-[11px] font-medium text-zinc-300 truncate max-w-full">
                              {row.badge}
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-600">—</span>
                          )}
                        </div>
                      )}
                      <div
                        dir="ltr"
                        className={`col-span-4 sm:col-span-3 text-right tabular-nums ${
                          row.amountVisible
                            ? 'text-sm font-bold text-zinc-100'
                            : 'text-xs font-medium text-zinc-500'
                        }`}
                      >
                        {row.amountDisplay}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Footer Note */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] text-zinc-500">
              <div className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>
                  Only admin-verified contributions appear on the live leaderboard. Personal details
                  are never published.
                </span>
              </div>
              <span className="tabular-nums">Showing top {entries.length}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

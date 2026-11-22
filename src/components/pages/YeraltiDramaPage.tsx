import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  ChevronRight,
  Clock,
  ArrowLeft,
  Share2,
  Calendar,
  Search,
  DollarSign,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from '../Navbar';
import { DramaMemberBar } from '../membership/DramaMemberBar';
import { Footer } from '../Footer';
import {
  YERALTI_SERIES_DATA,
  YERALTI_EPISODES,
  YeraltiEpisode,
} from '../../data/yeraltiData';
import { isEpisodePremium } from '../../data/membershipCatalog';
import { attachHlsStream } from '../../utils/hlsPlayer';
import { useDramaEntitlement } from '../membership/useDramaEntitlement';
import { PremiumEpisodeModal } from '../membership/PremiumEpisodeModal';
import { ProtectedPlayerWatermark } from '../membership/ProtectedPlayerWatermark';

interface YeraltiDramaPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: any) => void;
}

export const YeraltiDramaPage: React.FC<YeraltiDramaPageProps> = ({
  onBackToHome,
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'episode-detail'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/episode-')) {
        return 'episode-detail';
      }
    }
    return 'overview';
  });

  const [selectedEpisode, setSelectedEpisode] = useState<YeraltiEpisode>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const match = path.match(/episode-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        const found = YERALTI_EPISODES.find((ep) => ep.number === num);
        if (found) return found;
      }
    }
    return YERALTI_EPISODES[0];
  });

  const [showPosterOverlay, setShowPosterOverlay] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    member,
    checkingEpisodeKey,
    unlockedStreams,
    gateState,
    hasDramaAccess,
    getWatermarkForEpisode,
    verifyAndUnlockEpisode,
    attemptWatchEpisode,
    closeGateModal,
  } = useDramaEntitlement('yeralti');
  const isDramaUnlocked = hasDramaAccess('yeralti');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeView, selectedEpisode]);

  useEffect(() => {
    const keywordsEl = document.querySelector('meta[name="keywords"]');
    if (activeView === 'episode-detail') {
      const num = selectedEpisode.number;
      const pageTitle = `Yeralti - Urdu Dub Episode ${num} (جرائم کی دنیا) | FEVIQO`;
      const metaDesc = `Watch Yeralti - Urdu Dub (جرائم کی دنیا) Episode ${num} in Urdu Dubbed HD exclusively on FEVIQO Premium.`;
      document.title = pageTitle;
      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);
      if (keywordsEl) {
        keywordsEl.setAttribute(
          'content',
          `yeralti urdu dub, yeralti urdu dubbed, yeralti episode ${num} urdu dub, جرائم کی دنیا, feviqo yeralti`
        );
      }
    } else {
      const pageTitle = 'Yeralti - Urdu Dub (جرائم کی دنیا) | Turkish Drama — FEVIQO';
      const metaDesc =
        'Watch Yeralti - Urdu Dub (جرائم کی دنیا) Turkish crime thriller in exclusive Urdu Dubbed HD on FEVIQO Premium.';
      document.title = pageTitle;
      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);
      if (keywordsEl) {
        keywordsEl.setAttribute(
          'content',
          'yeralti urdu dub, yeralti turkish drama urdu dubbed, جرائم کی دنیا, watch yeralti urdu dub, feviqo turkish dramas'
        );
      }
    }
  }, [activeView, selectedEpisode]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/episode-')) {
        const match = path.match(/episode-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          const found = YERALTI_EPISODES.find((ep) => ep.number === num);
          if (found) {
            setSelectedEpisode(found);
            setActiveView('episode-detail');
            setShowPosterOverlay(true);
            return;
          }
        }
      }
      setActiveView('overview');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToEpisode = (ep: YeraltiEpisode) => {
    setSelectedEpisode(ep);
    setActiveView('episode-detail');
    setShowPosterOverlay(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({ episode: ep.number }, '', `/yeralti/${ep.slug}`);
    } catch {}
  };

  const handleBackToOverview = () => {
    setActiveView('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({}, '', '/yeralti');
    } catch {}
  };

  const handleShareLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const selectedEpSlug = selectedEpisode.slug;
  const isSelectedPremium = Boolean(
    selectedEpisode.isLockedPremium || isEpisodePremium('yeralti', selectedEpSlug)
  );
  const resolvedStreamUrl = isSelectedPremium
    ? unlockedStreams[`yeralti:${selectedEpSlug}`] || ''
    : selectedEpisode.embeds[0]?.src || '';
  const activeWatermark = isSelectedPremium
    ? getWatermarkForEpisode('yeralti', selectedEpSlug)
    : undefined;

  useEffect(() => {
    if (activeView === 'episode-detail' && isSelectedPremium) {
      verifyAndUnlockEpisode('yeralti', selectedEpSlug);
    }
  }, [activeView, isSelectedPremium, selectedEpSlug, verifyAndUnlockEpisode]);

  const handleSelectEpisode = (ep: YeraltiEpisode) => {
    const epIsPremium = Boolean(
      ep.isLockedPremium || isEpisodePremium('yeralti', ep.slug)
    );
    if (!epIsPremium) {
      navigateToEpisode(ep);
      return;
    }
    attemptWatchEpisode('yeralti', ep.slug, ep.title, () => {
      navigateToEpisode(ep);
    });
  };

  useEffect(() => {
    if (activeView === 'episode-detail' && videoRef.current && resolvedStreamUrl) {
      const cleanup = attachHlsStream(videoRef.current, resolvedStreamUrl, {
        autoPlay: false,
      });
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [activeView, selectedEpisode, resolvedStreamUrl]);

  const handleStartPlayback = () => {
    setShowPosterOverlay(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const filteredEpisodes = YERALTI_EPISODES.filter((ep) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = ep.number.toString() === q.replace(/\D/g, '');
      const titleMatch =
        ep.title.toLowerCase().includes(q) ||
        ep.shortSummary.toLowerCase().includes(q) ||
        ep.urduTitle.includes(searchQuery.trim());
      return numMatch || titleMatch;
    }
    return true;
  }).sort((a, b) =>
    sortOrder === 'newest' ? b.number - a.number : a.number - b.number
  );

  const latestEpisode = YERALTI_EPISODES[0];
  const isLatestLocked =
    Boolean(latestEpisode.isLockedPremium || isEpisodePremium('yeralti', latestEpisode.slug)) &&
    !isDramaUnlocked;

  return (
    <div className="w-full bg-white text-slate-900 selection:bg-[#22C55E] selection:text-white font-sans min-h-screen flex flex-col">
      <Navbar
        onBookCall={onBookCall}
        onNavigateSection={() => onNavigatePage('home')}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      <DramaMemberBar dramaId="yeralti" onNavigatePage={onNavigatePage} />

      {/* TOP SPONSORSHIP BAR */}
      <div className="bg-[#031d12] text-white border-b border-emerald-950/80 py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
              URDU DUB EXCLUSIVE
            </span>
            <span className="font-semibold text-emerald-100">
              Yeralti - Urdu Dub (جرائم کی دنیا) — Exclusive FEVIQO Premium Series
            </span>
          </div>
          <button
            onClick={onBookCall}
            className="px-4 py-1.5 rounded-full bg-white hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-md cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-800" />
            <span>Book Ad Setup / Sponsor</span>
          </button>
        </div>
      </div>

      <main className="w-full flex-1">
        <AnimatePresence mode="wait">
          {activeView === 'overview' ? (
            <motion.div
              key="yeralti-overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-16 pb-20 bg-white"
            >
              {/* STACKED HERO SECTION */}
              <div className="relative w-full bg-black text-white overflow-hidden">
                <div className="w-full aspect-video bg-black relative select-none">
                  <img
                    src={YERALTI_SERIES_DATA.backdrop}
                    alt="Yeralti - Urdu Dub Official Poster"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const fallback = '/images/posters/poster-horiz-narrative-storytelling.jpg';
                      if (!e.currentTarget.src.endsWith(fallback)) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                    className={`w-full h-full object-contain block transition duration-300 ${
                      !isDramaUnlocked ? 'brightness-75' : ''
                    }`}
                  />
                  {!isDramaUnlocked && (
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 px-3.5 py-1.5 rounded-full bg-[#0B0B0D]/90 border border-[#22C55E]/50 text-[#22C55E] text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xl">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Urdu Dub · Locked for Free Users</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                </div>

                <div className="w-full bg-black py-8 px-6 sm:px-12 lg:px-16 z-20">
                  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left">
                    <div className="lg:col-span-8 space-y-4 sm:space-y-5">
                      <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                        FEVIQO • YERALTI - URDU DUB
                      </div>

                      {/* Official Graphic Logo */}
                      <div className="h-14 sm:h-20 w-auto flex items-center justify-start select-none">
                        <img
                          src={YERALTI_SERIES_DATA.logoUrl}
                          alt="Yeralti - Urdu Dub Official Logo"
                          referrerPolicy="no-referrer"
                          className="h-full w-auto object-contain max-w-[260px] sm:max-w-[360px]"
                          loading="eager"
                        />
                      </div>

                      {/* Main Heading */}
                      <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        Yeralti - Urdu Dub
                      </h1>

                      {/* Sub Urdu Name */}
                      <div className="text-xl sm:text-2xl font-urdu-slim text-emerald-300 font-normal dir-rtl leading-relaxed">
                        جرائم کی دنیا
                      </div>

                      <div className="text-xs sm:text-sm text-slate-300 font-medium flex flex-wrap items-center gap-2.5 pt-1 select-none">
                        <span className="font-bold text-white">Season 1</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                          HD 1080p
                        </span>
                        <span>•</span>
                        <span className="font-bold text-[#22C55E]">Urdu Dubbed</span>
                        <span>•</span>
                        <span className="text-slate-300">Crime Action Thriller</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
                        {YERALTI_SERIES_DATA.synopsis}
                      </p>
                    </div>

                    <div className="lg:col-span-4 flex flex-col items-stretch lg:items-end justify-center gap-2.5 w-full">
                      {isDramaUnlocked ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold self-start lg:self-end">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>FEVIQO Premium Active</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-[#22C55E]/40 text-[#22C55E] text-[11px] font-black uppercase tracking-wider self-start lg:self-end">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Premium Urdu Dub Exclusive</span>
                        </div>
                      )}

                      <a
                        href={
                          isLatestLocked
                            ? `/membership?drama=yeralti&episode=${latestEpisode.slug}`
                            : `/yeralti/${latestEpisode.slug}`
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelectEpisode(latestEpisode);
                        }}
                        className="w-full lg:w-auto px-10 py-4 bg-[#22C55E] hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-sm rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      >
                        {isLatestLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                        <span>
                          {isLatestLocked
                            ? `Unlock Episode ${latestEpisode.number} (Premium)`
                            : `Watch Episode ${latestEpisode.number} Now`}
                        </span>
                      </a>

                      <a
                        href="/membership?drama=yeralti"
                        onClick={(e) => {
                          if (!e.metaKey && !e.ctrlKey) {
                            e.preventDefault();
                            window.dispatchEvent(
                              new CustomEvent('feviqo-navigate-url', {
                                detail: '/membership?drama=yeralti',
                              })
                            );
                          }
                        }}
                        className="w-full lg:w-auto px-5 py-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition"
                      >
                        <span>Explore FEVIQO Premium Plans</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* FEATURED LATEST EPISODE STRIP */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="border border-slate-100 bg-slate-50/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center text-left relative overflow-hidden select-none shadow-sm">
                  <a
                    href={
                      isLatestLocked
                        ? `/membership?drama=yeralti&episode=${latestEpisode.slug}`
                        : `/yeralti/${latestEpisode.slug}`
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelectEpisode(latestEpisode);
                    }}
                    className="relative w-full md:w-[320px] aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shrink-0 cursor-pointer group shadow-sm block"
                  >
                    <img
                      src={latestEpisode.thumbnail}
                      alt={latestEpisode.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = '/images/posters/poster-horiz-narrative-storytelling.jpg';
                        if (!e.currentTarget.src.endsWith(fallback)) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                      className={`w-full h-full object-cover transition duration-300 ${
                        isLatestLocked
                          ? 'brightness-50 group-hover:brightness-40 group-hover:scale-105'
                          : 'group-hover:scale-105'
                      }`}
                    />
                    {isLatestLocked ? (
                      <>
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#0B0B0D]/90 text-[#22C55E] border border-[#22C55E]/40 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                          <Lock className="w-3 h-3" />
                          <span>URDU DUBBED · LOCKED</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 flex flex-col items-center justify-center p-3 text-center">
                          <div className="w-12 h-12 rounded-full bg-[#0B0B0D]/90 border border-[#22C55E]/60 text-[#22C55E] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform mb-2">
                            <Lock className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-white">
                            {checkingEpisodeKey === `yeralti:${latestEpisode.slug}`
                              ? 'Checking Access...'
                              : 'Unlock with FEVIQO Premium'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Unlocked · Urdu Dubbed</span>
                        </div>
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                          <div className="w-11 h-11 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 fill-current text-slate-950 ml-0.5" />
                          </div>
                        </div>
                      </>
                    )}
                  </a>

                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span>FEATURED URDU DUB</span>
                        <span>·</span>
                        <span>EPISODE {latestEpisode.number}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-black">
                          {isDramaUnlocked ? 'MEMBERSHIP UNLOCKED' : 'FEVIQO PREMIUM'}
                        </span>
                      </div>
                      <h2
                        className="text-2xl font-black text-slate-900 hover:text-[#22C55E] cursor-pointer transition"
                        onClick={() => handleSelectEpisode(latestEpisode)}
                      >
                        {latestEpisode.title}
                      </h2>
                      <p className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> November 2026
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {latestEpisode.duration}
                        </span>
                      </p>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                      {latestEpisode.shortSummary}
                    </p>

                    <a
                      href={
                        isLatestLocked
                          ? `/membership?drama=yeralti&episode=${latestEpisode.slug}`
                          : `/yeralti/${latestEpisode.slug}`
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelectEpisode(latestEpisode);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-lg transition duration-150 cursor-pointer"
                    >
                      {isLatestLocked ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>
                        {isLatestLocked
                          ? `Unlock Episode ${latestEpisode.number} with Premium`
                          : `Watch Episode ${latestEpisode.number} Now`}
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              {/* EPISODE DIRECTORY */}
              <div
                id="episode-directory"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6 text-left">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                      Yeralti - Urdu Dub Episodes
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      جرائم کی دنیا — Urdu Dubbed episodes are locked for free users and unlock immediately with FEVIQO Premium.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search episodes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#22C55E] rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none w-full sm:w-56 transition"
                      />
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
                      <button
                        onClick={() => setSortOrder('newest')}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition ${
                          sortOrder === 'newest'
                            ? 'bg-[#22C55E] text-slate-950 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        NEWEST
                      </button>
                      <button
                        onClick={() => setSortOrder('oldest')}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition ${
                          sortOrder === 'oldest'
                            ? 'bg-[#22C55E] text-slate-950 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        OLDEST
                      </button>
                    </div>
                  </div>
                </div>

                {filteredEpisodes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredEpisodes.map((ep) => {
                      const epPremium = Boolean(
                        ep.isLockedPremium || isEpisodePremium('yeralti', ep.slug)
                      );
                      const isLocked = epPremium && !isDramaUnlocked;
                      const isCheckingThis = checkingEpisodeKey === `yeralti:${ep.slug}`;
                      return (
                        <a
                          key={ep.slug}
                          href={
                            isLocked
                              ? `/membership?drama=yeralti&episode=${ep.slug}`
                              : `/yeralti/${ep.slug}`
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelectEpisode(ep);
                          }}
                          className={`group rounded-2xl overflow-hidden hover:scale-[1.02] active:scale-[0.99] transition duration-200 text-left select-none cursor-pointer flex flex-col h-full shadow-sm border ${
                            isLocked
                              ? 'bg-[#0B0B0D] text-white border-zinc-800 hover:border-[#22C55E]'
                              : 'bg-slate-50/20 hover:bg-slate-50/50 border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="relative aspect-video bg-slate-950 border-b border-slate-100/10 overflow-hidden">
                            <img
                              src={ep.thumbnail}
                              alt={ep.title}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const fallback = '/images/posters/poster-horiz-narrative-storytelling.jpg';
                                if (!e.currentTarget.src.endsWith(fallback)) {
                                  e.currentTarget.src = fallback;
                                }
                              }}
                              className={`w-full h-full object-cover transition duration-300 ${
                                isLocked
                                  ? 'brightness-50 group-hover:brightness-40 group-hover:scale-105'
                                  : 'group-hover:scale-105'
                              }`}
                            />
                            {isLocked ? (
                              <>
                                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md bg-[#0B0B0D]/90 text-[#22C55E] border border-[#22C55E]/40">
                                  <Lock className="w-3 h-3" />
                                  <span>URDU DUBBED · LOCKED</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 flex flex-col items-center justify-center p-3 text-center">
                                  <div className="w-11 h-11 rounded-full bg-[#0B0B0D]/90 border border-[#22C55E]/60 text-[#22C55E] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform mb-2">
                                    <Lock className="w-5 h-5" />
                                  </div>
                                  <span className="text-[11px] font-black uppercase tracking-wider text-white">
                                    {isCheckingThis
                                      ? 'Checking Access...'
                                      : 'Unlock with FEVIQO Premium'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md bg-[#22C55E] text-[#0B0B0D]">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Unlocked · Urdu Dubbed</span>
                                </div>
                                <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                                  <div className="w-10 h-10 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-lg">
                                    <Play className="w-4 h-4 fill-current text-slate-950 ml-0.5" />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <div
                                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${
                                  isLocked ? 'text-zinc-400' : 'text-slate-400'
                                }`}
                              >
                                <span>EPISODE {ep.number}</span>
                                <span>·</span>
                                <span>{ep.duration}</span>
                              </div>
                              <h3
                                className={`text-sm sm:text-base font-black group-hover:text-[#22C55E] transition line-clamp-2 ${
                                  isLocked ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {ep.title}
                              </h3>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-xs text-[#22C55E] font-bold">
                              <span>
                                {isLocked
                                  ? 'Unlock with FEVIQO Premium'
                                  : 'Unlocked with Membership'}
                              </span>
                              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center border border-dashed border-slate-200 rounded-3xl space-y-2">
                    <p className="text-sm font-bold text-slate-500">
                      No episodes found matching your filter.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-[#22C55E] hover:underline font-bold"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>

              {/* ABOUT SERIES SECTION */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-16 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="space-y-1">
                      <span className="text-xs font-black text-emerald-600 tracking-widest uppercase block">
                        THE STORYLINE
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        About Yeralti - Urdu Dub (جرائم کی دنیا)
                      </h2>
                    </div>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                      {YERALTI_SERIES_DATA.synopsis}
                    </p>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        Exclusive FEVIQO Urdu Dubbed Release
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">
                        Every episode of Yeralti - Urdu Dub (جرائم کی دنیا) is professionally dubbed in Urdu HD exclusively for FEVIQO Premium Members. Choose Yeralti - Urdu Dub in any Starter, Standard, Plus, or VIP plan to unlock every release automatically.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-6">
                    <h3 className="text-sm font-black text-[#22C55E] uppercase tracking-wider">
                      Series Overview
                    </h3>

                    <div className="space-y-4 text-xs">
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Series Title</span>
                        <span className="text-slate-900 font-bold">Yeralti - Urdu Dub</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Urdu Name</span>
                        <span className="text-slate-900 font-bold font-urdu-slim">
                          جرائم کی دنیا
                        </span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Country</span>
                        <span className="text-slate-900 font-bold">Turkey</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Audio Format</span>
                        <span className="text-emerald-600 font-extrabold">
                          {YERALTI_SERIES_DATA.dubLanguage}
                        </span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Release Year</span>
                        <span className="text-slate-900 font-bold">
                          {YERALTI_SERIES_DATA.year}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Status</span>
                        <span className="text-emerald-600 font-bold">
                          {YERALTI_SERIES_DATA.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="yeralti-episode-player"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-6 pb-16 bg-white"
            >
              {/* Breadcrumbs */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 text-left">
                <nav className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span
                    className="hover:text-slate-900 cursor-pointer transition-colors"
                    onClick={() => onNavigatePage('home')}
                  >
                    FEVIQO
                  </span>
                  <span className="text-slate-300">/</span>
                  <span
                    className="hover:text-slate-900 cursor-pointer transition-colors"
                    onClick={() => onNavigatePage('dramas')}
                  >
                    Dramas
                  </span>
                  <span className="text-slate-300">/</span>
                  <span
                    className="hover:text-slate-900 cursor-pointer transition-colors"
                    onClick={handleBackToOverview}
                  >
                    Yeralti - Urdu Dub
                  </span>
                  <span className="text-slate-300">/</span>
                  <span className="text-emerald-600 font-bold">
                    Episode {selectedEpisode.number}
                  </span>
                </nav>
              </div>

              {/* Title & Meta */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-2">
                <span className="text-xs font-black text-emerald-600 tracking-widest uppercase">
                  YERALTI - URDU DUB (جرائم کی دنیا) &bull; EPISODE {selectedEpisode.number}
                </span>
                <h1 className="text-xl sm:text-4xl font-black tracking-tight text-slate-900">
                  {selectedEpisode.title}
                </h1>
                <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2 sm:gap-3">
                  <span>Duration: {selectedEpisode.duration}</span>
                  <span>&bull;</span>
                  <span>Urdu Dubbed</span>
                  <span>&bull;</span>
                  <span>HD 1080p Streaming</span>
                </p>
              </div>

              {/* Locked Gate OR Protected Stream Player */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {isSelectedPremium && !resolvedStreamUrl ? (
                  <div className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0B0B0D] shadow-2xl flex items-center justify-center select-none aspect-video border border-zinc-800 mx-auto">
                    <img
                      src={selectedEpisode.thumbnail}
                      alt={selectedEpisode.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[2px] scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/60" />
                    <div className="relative z-10 max-w-xl mx-auto px-6 py-8 text-center space-y-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0B0B0D]/90 border border-[#22C55E]/60 text-[#22C55E] flex items-center justify-center mx-auto shadow-xl">
                        {isDramaUnlocked ? (
                          <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                        ) : (
                          <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
                        )}
                      </div>
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#22C55E]">
                        URDU DUBBED · FEVIQO PREMIUM
                      </div>
                      <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                        {isDramaUnlocked
                          ? `Yeralti - Urdu Dub Episode ${selectedEpisode.number} — Membership Active`
                          : `Unlock Yeralti - Urdu Dub Episode ${selectedEpisode.number} in HD`}
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
                        {isDramaUnlocked
                          ? 'Your FEVIQO Premium membership for Yeralti - Urdu Dub (جرائم کی دنیا) is active. Our HD Urdu Dubbed stream is being finalized and will begin playing here automatically as soon as it goes live.'
                          : 'Yeralti - Urdu Dub (جرائم کی دنیا) is locked for free users. Activate FEVIQO Premium or sign in to your member account to unlock.'}
                      </p>
                      {!isDramaUnlocked && (
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              attemptWatchEpisode(
                                'yeralti',
                                selectedEpSlug,
                                selectedEpisode.title
                              )
                            }
                            className="px-6 py-3 rounded-xl bg-[#22C55E] hover:bg-emerald-500 text-[#0B0B0D] font-black text-xs sm:text-sm transition cursor-pointer shadow-lg"
                          >
                            {checkingEpisodeKey === `yeralti:${selectedEpSlug}`
                              ? 'Checking Membership...'
                              : 'Unlock with FEVIQO Premium'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent('feviqo-navigate-url', {
                                  detail: `/membership?auth=signin&drama=yeralti&episode=${selectedEpSlug}`,
                                })
                              )
                            }
                            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm transition cursor-pointer"
                          >
                            {member ? 'My Account' : 'Sign In'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl flex items-center justify-center select-none aspect-video border border-slate-200/80 mx-auto"
                  >
                    {showPosterOverlay && (
                      <div
                        onClick={handleStartPlayback}
                        className="absolute inset-0 z-30 bg-black flex items-center justify-center cursor-pointer group overflow-hidden rounded-2xl sm:rounded-3xl"
                      >
                        <img
                          src={selectedEpisode.thumbnail}
                          alt={selectedEpisode.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />
                        <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 fill-current ml-1" />
                        </div>
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      controls
                      playsInline
                      controlsList="nodownload"
                      className="w-full h-full object-contain bg-black"
                      poster={selectedEpisode.thumbnail}
                    />
                    {activeWatermark && <ProtectedPlayerWatermark watermark={activeWatermark} />}
                  </div>
                )}
              </div>

              {/* Action Bar & Recap */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
                <button
                  onClick={handleBackToOverview}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Yeralti - Urdu Dub</span>
                </button>
                <button
                  onClick={handleShareLink}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#22C55E]" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share Episode'}</span>
                </button>
              </div>

              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-4">
                <h2 className="text-2xl font-black text-slate-900">
                  Episode {selectedEpisode.number} Overview
                </h2>
                <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                  {selectedEpisode.recap.split('\n\n').map((para, idx) => (
                    <p key={idx}>{para.trim()}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer
        onBookCall={onBookCall}
        onGetStarted={onBookCall}
        onNavigateSection={() => onNavigatePage('home')}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={() => onNavigateFlow()}
        onNavigatePage={onNavigatePage}
      />

      <PremiumEpisodeModal
        gateState={gateState}
        member={member}
        onClose={closeGateModal}
        onNavigateMembershipUrl={(targetUrl) => {
          window.dispatchEvent(new CustomEvent('feviqo-navigate-url', { detail: targetUrl }));
        }}
      />
    </div>
  );
};

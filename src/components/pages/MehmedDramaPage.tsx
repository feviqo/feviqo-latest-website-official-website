import React, { useState, useRef, useEffect } from 'react';
import '@videojs/html/video/player';
import '@videojs/html/video/skin';
import '@videojs/html/media/mux-video';
import '@videojs/html/extensions/mux-data';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Tv,
  ArrowLeft,
  Share2,
  Calendar,
  Search,
  DollarSign,
  ShieldCheck,
  Sword,
  Globe,
  Film,
  Server,
  Download,
  Lock,
  BookOpen
} from 'lucide-react';
import { Navbar } from '../Navbar';
import { DramaMemberBar } from '../membership/DramaMemberBar';
import { Footer } from '../Footer';
import { VastPreRollAdOverlay } from '../VastPreRollAdOverlay';
import { MEHMED_SERIES_DATA, MEHMED_EPISODES, MehmedEpisode } from '../../data/mehmedData';
import { isEpisodePremium } from '../../data/membershipCatalog';
import { attachHlsStream, extractMuxPlaybackId } from '../../utils/hlsPlayer';
import { useDramaEntitlement } from '../membership/useDramaEntitlement';
import { PremiumEpisodeModal } from '../membership/PremiumEpisodeModal';
import { ProtectedPlayerWatermark } from '../membership/ProtectedPlayerWatermark';
import { EDITORIAL_COMPLIANCE_MODE, HIDE_EXTERNAL_DOWNLOAD_LINKS } from '../../config/complianceMode';
import { EditorialEpisodeGuidePanel, CastMemberInfo } from '../drama/EditorialEpisodeGuidePanel';

const MEHMED_CAST: CastMemberInfo[] = [
  {
    actor: 'Serkan Çayoğlu',
    character: 'Sultan Mehmed II (Fatih)',
    roleNote: 'Young Ottoman sovereign leading military strategy, statecraft, and imperial reform.',
  },
  {
    actor: 'Selim Bayraktar',
    character: 'Çandarlı Halil Pasha',
    roleNote: 'Grand Vizier navigating delicate diplomacy and palace political rivalries.',
  },
  {
    actor: 'Sinan Albayrak',
    character: 'Zağanos Pasha',
    roleNote: 'Loyal commander and strategic advisor supporting Mehmed’s boldest campaigns.',
  },
  {
    actor: 'Seçkin Özdemir',
    character: 'Emperor Konstantinos XI',
    roleNote: 'Byzantine ruler fortifying defenses and forming counter-alliances.',
  },
  {
    actor: 'Tuba Ünsal',
    character: 'Mara Hatun',
    roleNote: 'Influential court figure bridging Ottoman palace politics and regional diplomacy.',
  },
  {
    actor: 'Ghassan Massoud',
    character: 'Ebu Eyyûb el-Ensârî',
    roleNote: 'Spiritual legacy figure inspiring the historical ethos of the campaign.',
  },
];

const getCleanMehmedPlot = (ep: MehmedEpisode) => {
  const raw = ep.recap || ep.shortSummary || '';
  if (/premium membership|subscribe to|unlock|watch online|download/i.test(raw)) {
    return `In Season 4 Episode ${ep.number} (Bölüm ${ep.number}) of Mehmed: Fetihler Sultanı, Sultan Mehmed II faces both external military pressures and shifting political factions inside the imperial council. ${MEHMED_SERIES_DATA.synopsis}\n\nThis episode highlights tactical diplomacy, battlefield resolve, and the personal sacrifices demanded by imperial leadership.`;
  }
  return raw
    .split('\n\n')
    .filter((p) => !/watch mehmed|where to watch|subscribe to|download/i.test(p))
    .join('\n\n');
};

interface MehmedDramaPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: any) => void;
}

export const MehmedDramaPage: React.FC<MehmedDramaPageProps> = ({
  onBackToHome,
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
}) => {
  // Navigation & View States
  const [activeView, setActiveView] = useState<'overview' | 'episode-detail'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/episode-')) {
        return 'episode-detail';
      }
    }
    return 'overview';
  });

  const [selectedEpisode, setSelectedEpisode] = useState<MehmedEpisode>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const match = path.match(/episode-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        const found = MEHMED_EPISODES.find(ep => ep.number === num);
        if (found) return found;
      }
    }
    return MEHMED_EPISODES[0];
  });

  // Filtering & UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [showPosterOverlay, setShowPosterOverlay] = useState(true);
  const [showPreRollAd, setShowPreRollAd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
  } = useDramaEntitlement('mehmed-fetihler-sultani');
  const isDramaUnlocked = hasDramaAccess('mehmed-fetihler-sultani');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeView, selectedEpisode]);

  // SEO & Google Search Keyword Optimization Effect for Main & Episode Pages
  useEffect(() => {
    const keywordsEl = document.querySelector('meta[name="keywords"]');

    if (EDITORIAL_COMPLIANCE_MODE) {
      const num = selectedEpisode.number;
      const pageTitle =
        activeView === 'episode-detail'
          ? `Mehmed: Fetihler Sultanı Episode ${num} — Episode Guide, Story Summary & Cast Review | FEVIQO`
          : 'Mehmed: Fetihler Sultanı — Episode Guide, Story Summary & Cast Reviews | FEVIQO';
      const metaDesc =
        activeView === 'episode-detail'
          ? `Read our original episode guide, historical story summary, cast breakdown, and trailer review for Mehmed: Fetihler Sultanı Episode ${num} (Bölüm ${num}).`
          : 'Explore Mehmed: Fetihler Sultanı episode guides, Ottoman historical drama reviews, cast profiles, and release schedules on FEVIQO.';
      document.title = pageTitle;
      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);
      if (keywordsEl) {
        keywordsEl.setAttribute(
          'content',
          `mehmed fetihler sultani episode ${num} guide, mehmed story summary, ottoman historical drama cast and reviews, feviqo`
        );
      }
      const ogTitleEl = document.querySelector('meta[property="og:title"]');
      if (ogTitleEl) ogTitleEl.setAttribute('content', pageTitle);
      const ogDescEl = document.querySelector('meta[property="og:description"]');
      if (ogDescEl) ogDescEl.setAttribute('content', metaDesc);
      const twTitleEl = document.querySelector('meta[name="twitter:title"]');
      if (twTitleEl) twTitleEl.setAttribute('content', pageTitle);
      const twDescEl = document.querySelector('meta[name="twitter:description"]');
      if (twDescEl) twDescEl.setAttribute('content', metaDesc);
      return;
    }

    if (activeView === 'episode-detail') {
      const num = selectedEpisode.number;
      const pageTitle = selectedEpisode.number === 88
        ? 'Mehmed Season 4 Episode 88 Urdu Subtitles | Bolum 88 - FEVIQO'
        : (selectedEpisode.title || `Mehmed Fetihler Sultani Episode ${num} Urdu Subtitles | Bolum ${num} - FEVIQO`);
      
      const metaDesc = selectedEpisode.shortSummary || `Watch Mehmed Season 4 Episode 88 Urdu Subtitles (Bolum 88) in HD on FEVIQO.`;
      const keywords = selectedEpisode.number === 88
        ? `Mehmed Season 4 Episode 88 Urdu Subtitles, Mehmed Season 4 Episode 88, Urdu Subtitles, Mehmed Fetihler Sultani Season 4 Episode 88, Mehmed Fetihler Sultani Season 4 Episode 88 Urdu Subtitles, Mehmed Fetihler Sultani Episode 88, Mehmed Fetihler Sultani Episode 88 Urdu Subtitles, Mehmed Fetihler Sultani Bolum 88, Mehmed Bolum 88 Urdu Subtitles, Mehmed Episode 88 Urdu, Mehmed 88 Urdu, Sultan Mehmed Season 4 Episode 88 Urdu, Mehmed Season 4 Ep 88 Urdu, Sultan Muhammad Fateh Season 4 Episode 88 Urdu Subtitles, FEVIQO Mehmed Season 4 Episode 88`
        : `mehmed fetihler sultani episode ${num} urdu subtitles, mehmed fetihler sultani bolum ${num} urdu, watch mehmed fetihler sultani episode ${num}, mehmed episode ${num} urdu, mehmed fetihler sultani ${num} urdu subtitles, mehmed fetihler sultani bolum ${num}, sultan mehmed fatih episode ${num} urdu, mehmed season 4 episode ${num}, mehmed ${num} urdu subtitles, feviqo mehmed fetihler sultani ${num}`;
      
      document.title = pageTitle;

      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);

      if (keywordsEl) keywordsEl.setAttribute('content', keywords);

      const ogTitleEl = document.querySelector('meta[property="og:title"]');
      if (ogTitleEl) ogTitleEl.setAttribute('content', pageTitle);

      const ogDescEl = document.querySelector('meta[property="og:description"]');
      if (ogDescEl) ogDescEl.setAttribute('content', metaDesc);

      const ogImageEl = document.querySelector('meta[property="og:image"]');
      if (ogImageEl && selectedEpisode.thumbnail) {
        ogImageEl.setAttribute('content', selectedEpisode.thumbnail);
      }

      const twTitleEl = document.querySelector('meta[name="twitter:title"]');
      if (twTitleEl) twTitleEl.setAttribute('content', pageTitle);

      const twDescEl = document.querySelector('meta[name="twitter:description"]');
      if (twDescEl) twDescEl.setAttribute('content', metaDesc);
    } else {
      const pageTitle = "Mehmed Fetihler Sultani Urdu Subtitles - Watch Online - FEVIQO.com";
      const metaDesc = "Watch Mehmed Fetihler Sultani Turkish Drama in HD Urdu Subtitles (مہمد فتحلر سلطان اردو). Stream official episodes with story recaps on FEVIQO.com.";
      const keywords = "mehmed fetihler sultani urdu, mehmed fetihler sultani urdu subtitles, watch mehmed fetihler sultani urdu, mehmed fetihler sultani season 4, mehmed fetihler sultani bolum 90 urdu, mehmed fetihler sultani episode 90 urdu subtitles, mehmed fetihler sultani bolum 89 urdu, mehmed fetihler sultani episode 89 urdu subtitles, sultan mehmed II urdu";

      document.title = pageTitle;

      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);

      if (keywordsEl) keywordsEl.setAttribute('content', keywords);
    }
  }, [activeView, selectedEpisode]);

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const match = path.match(/episode-(\d+)/) || path.match(/bolum-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        const found = MEHMED_EPISODES.find(ep => ep.number === num);
        if (found) {
          setSelectedEpisode(found);
          setActiveView('episode-detail');
          setShowPosterOverlay(true);
          return;
        }
      }
      setActiveView('overview');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToEpisode = (ep: MehmedEpisode) => {
    setSelectedEpisode(ep);
    setActiveView('episode-detail');
    setShowPosterOverlay(true);
    setActiveServerIndex(0);

    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', `/mehmed-fetihler-sultani/${ep.slug}`);
    }
  };

  const handleBackToOverview = () => {
    setActiveView('overview');
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/mehmed-fetihler-sultani');
    }
  };

  const selectedEpSlug = selectedEpisode.slug;
  const isSelectedPremium = Boolean(
    selectedEpisode.isLockedPremium || isEpisodePremium('mehmed-fetihler-sultani', selectedEpSlug)
  );
  const resolvedStreamUrl = isSelectedPremium
    ? unlockedStreams[`mehmed-fetihler-sultani:${selectedEpSlug}`] || ''
    : selectedEpisode.embeds?.[activeServerIndex]?.src ||
      selectedEpisode.embeds?.[0]?.src ||
      'https://stream.mux.com/myroEGBWeut02BU5yZEPr3GT3stSVu91dYtKAJPeJkfs.m3u8';
  const activeWatermark = isSelectedPremium
    ? getWatermarkForEpisode('mehmed-fetihler-sultani', selectedEpSlug)
    : undefined;

  useEffect(() => {
    if (EDITORIAL_COMPLIANCE_MODE) return;
    if (activeView === 'episode-detail' && isSelectedPremium) {
      verifyAndUnlockEpisode('mehmed-fetihler-sultani', selectedEpSlug);
    }
  }, [activeView, isSelectedPremium, selectedEpSlug, verifyAndUnlockEpisode]);

  const handleSelectEpisode = (ep: MehmedEpisode) => {
    if (EDITORIAL_COMPLIANCE_MODE) {
      navigateToEpisode(ep);
      return;
    }
    const epIsPremium = Boolean(ep.isLockedPremium || isEpisodePremium('mehmed-fetihler-sultani', ep.slug));
    if (!epIsPremium) {
      navigateToEpisode(ep);
      return;
    }
    attemptWatchEpisode('mehmed-fetihler-sultani', ep.slug, ep.title, () => {
      navigateToEpisode(ep);
    });
  };

  useEffect(() => {
    if (EDITORIAL_COMPLIANCE_MODE) return;
    if (activeView === 'episode-detail' && videoRef.current && resolvedStreamUrl) {
      const cleanup = attachHlsStream(videoRef.current, resolvedStreamUrl, {
        autoPlay: false,
      });
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [activeView, selectedEpisode, activeServerIndex, resolvedStreamUrl]);

  const handleStartPlayback = () => {
    setShowPosterOverlay(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleAdComplete = () => {
    setShowPreRollAd(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const filteredEpisodes = MEHMED_EPISODES.filter(ep => 
    ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.number.toString().includes(searchQuery) ||
    ep.shortSummary.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => sortOrder === 'newest' ? b.number - a.number : a.number - b.number);

  const latestEpisode = MEHMED_EPISODES[0];
  const currentEpIndex = MEHMED_EPISODES.findIndex(ep => ep.number === selectedEpisode.number);
  const prevEpisode = currentEpIndex < MEHMED_EPISODES.length - 1 && currentEpIndex !== -1 ? MEHMED_EPISODES[currentEpIndex + 1] : null;
  const nextEpisode = currentEpIndex > 0 ? MEHMED_EPISODES[currentEpIndex - 1] : null;

  return (
    <div className="w-full bg-white text-slate-900 font-sans antialiased min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#22C55E] selection:text-white">
      
      {/* Unified Navigation Bar */}
      <Navbar 
        onBookCall={onBookCall} 
        onNavigateSection={() => onNavigatePage('home')}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      {!EDITORIAL_COMPLIANCE_MODE && (
        <DramaMemberBar dramaId="mehmed-fetihler-sultani" onNavigatePage={onNavigatePage} />
      )}

      {/* TOP IN-STREAM SPONSORSHIP / AD PLACEMENT HEADER BANNER */}
      {!EDITORIAL_COMPLIANCE_MODE && (
        <div className="bg-[#031d12] text-white border-b border-emerald-950/80 py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E] text-slate-950 font-black text-[10px] uppercase tracking-wider">
                SPONSORSHIP
              </span>
              <span className="font-semibold text-emerald-100">
                In-Stream Pre-Roll &amp; Banner Advertising for Mehmed Fetihler Sultani Urdu Portal
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
      )}

      {/* PRIMARY CONTENT CONTAINER */}
      <main className="w-full flex-1">
        <AnimatePresence mode="wait">
          {activeView === 'overview' ? (
            <motion.div 
              key="overview-hub"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="space-y-16 pb-20 bg-white"
            >
              
              {/* STACKED HERO SECTION (IDENTICAL TO TESKILAT & GUNESIN): 100% PICTURE SIGHT WITH SOLID READABLE DARK PLATE BELOW */}
              <div className="relative w-full bg-black text-white overflow-hidden">
                
                {/* 1. PICTURE PANEL: Displays the widescreen 16:9 banner with zero cropping */}
                <div className="w-full aspect-video bg-black relative select-none">
                  <img
                    src={MEHMED_SERIES_DATA.backdrop}
                    alt="Mehmed Fetihler Sultani Backdrop"
                    className="w-full h-full object-contain block"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                </div>

                {/* 2. BOTTOM DETAILS AREA: Solid, ultra-premium text content block sitting directly below on solid black for perfect readability */}
                <div className="w-full bg-black py-8 px-6 sm:px-12 lg:px-16 z-20">
                  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left">
                    
                    {/* Left text panel */}
                    <div className="lg:col-span-8 space-y-4 sm:space-y-5">
                      
                      {/* Eyebrow */}
                      <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                        FEVIQO • MEHMED FETIHLER SULTANI
                      </div>

                      {/* Official Graphic LOGO of Mehmed Fetihler Sultani */}
                      <div className="h-14 sm:h-20 w-auto flex items-center justify-start select-none">
                        <img 
                          src="https://lh3.googleusercontent.com/d/19HL2dzvRlKelis5qfA0ZyJ-vLUwU_ctZ" 
                          alt="Mehmed Fetihler Sultani Official Logo"
                          className="h-full w-auto object-contain max-w-[250px] sm:max-w-[340px]"
                          loading="eager"
                        />
                      </div>

                      {/* Primary Descriptive H1 Title */}
                      <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        {EDITORIAL_COMPLIANCE_MODE
                          ? 'Mehmed: Fetihler Sultanı — Episode Guide & Reviews'
                          : 'Mehmed Fetihler Sultani Urdu Subtitles'}
                      </h1>

                      {/* Urdu Translation below logo */}
                      <div className="text-xl sm:text-2xl font-urdu-slim text-slate-300 font-normal dir-rtl leading-relaxed">
                        {EDITORIAL_COMPLIANCE_MODE
                          ? 'مہمد فتحلر سلطان — Episode Guide & Story Summary'
                          : 'مہمد فتحلر سلطان (Sultan Mehmed II Urdu)'}
                      </div>

                      {/* Series badges */}
                      <div className="text-xs sm:text-sm text-slate-300 font-medium flex flex-wrap items-center gap-2.5 pt-1 select-none">
                        <span className="font-bold text-white">Season 4</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                          {EDITORIAL_COMPLIANCE_MODE ? 'Episode Guide' : 'HD'}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-200">
                          {EDITORIAL_COMPLIANCE_MODE ? 'Cast & Reviews' : 'Urdu Subtitles'}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300">Ottoman Empire Historical Series</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
                        {MEHMED_SERIES_DATA.synopsis}
                      </p>

                    </div>

                    {/* Right button panel */}
                    <div className="lg:col-span-4 flex flex-col items-stretch lg:items-end justify-center gap-2 w-full">
                      {!EDITORIAL_COMPLIANCE_MODE && isDramaUnlocked && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold self-start lg:self-end">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>FEVIQO Premium Active</span>
                        </div>
                      )}
                      <a 
                        href={
                          !EDITORIAL_COMPLIANCE_MODE && Boolean(latestEpisode.isLockedPremium || isEpisodePremium('mehmed-fetihler-sultani', latestEpisode.slug)) && !isDramaUnlocked
                            ? `/membership?drama=mehmed-fetihler-sultani&episode=${latestEpisode.slug}`
                            : `/mehmed-fetihler-sultani/${latestEpisode.slug}`
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelectEpisode(latestEpisode);
                        }}
                        className="w-full lg:w-auto px-10 py-4 bg-[#22C55E] hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-sm rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      >
                        {EDITORIAL_COMPLIANCE_MODE ? (
                          <BookOpen className="w-4 h-4" />
                        ) : Boolean(latestEpisode.isLockedPremium || isEpisodePremium('mehmed-fetihler-sultani', latestEpisode.slug)) && !isDramaUnlocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                        <span>
                          {EDITORIAL_COMPLIANCE_MODE
                            ? `Read Episode ${latestEpisode.number} Guide`
                            : Boolean(latestEpisode.isLockedPremium || isEpisodePremium('mehmed-fetihler-sultani', latestEpisode.slug)) && !isDramaUnlocked
                            ? `Unlock Episode ${latestEpisode.number} (Premium)`
                            : `Watch Episode ${latestEpisode.number} Now`}
                        </span>
                      </a>
                      {!EDITORIAL_COMPLIANCE_MODE && (
                        <a
                          href="/membership"
                          onClick={(e) => {
                            if (!e.metaKey && !e.ctrlKey) {
                              e.preventDefault();
                              onNavigatePage('membership');
                            }
                          }}
                          className="w-full lg:w-auto px-5 py-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition"
                        >
                          <span>Explore FEVIQO Premium Plans</span>
                        </a>
                      )}
                    </div>

                  </div>
                </div>

              </div>

              {/* 3. FEATURED LATEST EPISODE STRIP (CLEAN LIGHT DESIGN) */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="border border-slate-100 bg-slate-50/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center text-left relative overflow-hidden select-none shadow-sm">
                  
                  {/* Thumbnail Cover */}
                  {(() => {
                    const isLatestPremium = Boolean(
                      latestEpisode.isLockedPremium ||
                        isEpisodePremium('mehmed-fetihler-sultani', latestEpisode.slug)
                    );
                    const isLatestLocked = !EDITORIAL_COMPLIANCE_MODE && isLatestPremium && !isDramaUnlocked;
                    const latestHref = isLatestLocked
                      ? `/membership?drama=mehmed-fetihler-sultani&episode=${latestEpisode.slug}`
                      : `/mehmed-fetihler-sultani/${latestEpisode.slug}`;
                    return (
                      <>
                        <a 
                          href={latestHref}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelectEpisode(latestEpisode);
                          }}
                          className="relative w-full md:w-[320px] aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shrink-0 cursor-pointer group shadow-sm block"
                        >
                          <img 
                            src={latestEpisode.thumbnail} 
                            alt={`Mehmed: Fetihler Sultanı Episode ${latestEpisode.number} Guide`}
                            referrerPolicy="no-referrer"
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
                                  {checkingEpisodeKey === `mehmed-fetihler-sultani:${latestEpisode.slug}`
                                    ? 'Checking Access...'
                                    : 'Unlock with FEVIQO Premium'}
                                </span>
                              </div>
                            </>
                          ) : !EDITORIAL_COMPLIANCE_MODE && isLatestPremium ? (
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
                          ) : (
                            <>
                              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#22C55E] text-slate-950 text-[9px] font-black uppercase tracking-wider">
                                {EDITORIAL_COMPLIANCE_MODE ? 'EPISODE GUIDE' : 'NEW'}
                              </div>
                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                                <div className="w-11 h-11 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-lg">
                                  {EDITORIAL_COMPLIANCE_MODE ? (
                                    <BookOpen className="w-5 h-5 text-slate-950" />
                                  ) : (
                                    <Play className="w-5 h-5 fill-current text-slate-950 ml-0.5" />
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </a>

                        {/* Details Block */}
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                              <span>{EDITORIAL_COMPLIANCE_MODE ? 'FEATURED STORY SUMMARY' : 'LATEST RELEASE'}</span>
                              <span>·</span>
                              <span>EPISODE {latestEpisode.number} (BÖLÜM {latestEpisode.number})</span>
                              {!EDITORIAL_COMPLIANCE_MODE && isLatestPremium && (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-black">
                                  {isDramaUnlocked ? 'MEMBERSHIP UNLOCKED' : 'FEVIQO PREMIUM'}
                                </span>
                              )}
                            </div>
                            <a 
                              href={latestHref}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSelectEpisode(latestEpisode);
                              }}
                              className="block"
                            >
                              <h2 className="text-2xl font-black text-slate-900 hover:text-[#22C55E] cursor-pointer transition">
                                {EDITORIAL_COMPLIANCE_MODE
                                  ? `Mehmed: Fetihler Sultanı Episode ${latestEpisode.number} — Story Summary & Cast Review`
                                  : latestEpisode.title}
                              </h2>
                            </a>
                            <p className="text-xs text-slate-500 flex items-center gap-3">
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> November 2026</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {latestEpisode.duration}</span>
                            </p>
                          </div>

                          <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                            {EDITORIAL_COMPLIANCE_MODE
                              ? getCleanMehmedPlot(latestEpisode).split('\n\n')[0]
                              : latestEpisode.shortSummary}
                          </p>

                          <a 
                            href={latestHref}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSelectEpisode(latestEpisode);
                            }}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-lg transition duration-150 cursor-pointer"
                          >
                            {EDITORIAL_COMPLIANCE_MODE ? (
                              <BookOpen className="w-3.5 h-3.5" />
                            ) : isLatestLocked ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                            <span>
                              {EDITORIAL_COMPLIANCE_MODE
                                ? `Read Episode ${latestEpisode.number} Guide`
                                : isLatestLocked
                                ? `Unlock Episode ${latestEpisode.number} with Premium`
                                : `Watch Episode ${latestEpisode.number} Now`}
                            </span>
                          </a>
                        </div>
                      </>
                    );
                  })()}

                </div>
              </div>

              {/* 4. EPISODE DIRECTORY — MAIN FILTERED GRID SEARCH */}
              <div id="episode-directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6 text-left">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                      <span>{EDITORIAL_COMPLIANCE_MODE ? 'Episode Guide' : 'Episodes'}</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {EDITORIAL_COMPLIANCE_MODE
                        ? 'Explore historical episode summaries, cast profiles, trailer notes, and fan discussions for Mehmed: Fetihler Sultanı.'
                        : 'Watch Mehmed Fetihler Sultani with premium Urdu subtitles.'}
                    </p>
                  </div>

                  {/* Filter & Search Bar Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    
                    {/* Search Field */}
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

                    {/* Sorting segmented switch */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
                      <button 
                        onClick={() => setSortOrder('newest')}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition ${sortOrder === 'newest' ? 'bg-[#22C55E] text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        NEWEST
                      </button>
                      <button 
                        onClick={() => setSortOrder('oldest')}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition ${sortOrder === 'oldest' ? 'bg-[#22C55E] text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        OLDEST
                      </button>
                    </div>

                  </div>
                </div>

                {/* Directory Cards Grid in 16:9 rectangle aspect ratio */}
                {filteredEpisodes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredEpisodes.map((ep) => {
                      const epPremium = Boolean(ep.isLockedPremium || isEpisodePremium('mehmed-fetihler-sultani', ep.slug));
                      const isLocked = !EDITORIAL_COMPLIANCE_MODE && epPremium && !isDramaUnlocked;
                      const isCheckingThis = checkingEpisodeKey === `mehmed-fetihler-sultani:${ep.slug}`;
                      return (
                        <a 
                          key={ep.slug}
                          href={isLocked ? `/membership?drama=mehmed-fetihler-sultani&episode=${ep.slug}` : `/mehmed-fetihler-sultani/${ep.slug}`}
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
                          
                          {/* 16:9 Rectangle aspect-video Thumbnail Cover */}
                          <div className="relative aspect-video bg-slate-950 border-b border-slate-100/10 overflow-hidden">
                            <img 
                              src={ep.thumbnail} 
                              alt={`Mehmed: Fetihler Sultanı Episode ${ep.number} Guide`}
                              referrerPolicy="no-referrer"
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
                                    {isCheckingThis ? 'Checking Access...' : 'Unlock with FEVIQO Premium'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                {!EDITORIAL_COMPLIANCE_MODE && epPremium && (
                                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md bg-[#22C55E] text-[#0B0B0D]">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Unlocked · Urdu Dubbed</span>
                                  </div>
                                )}
                                {EDITORIAL_COMPLIANCE_MODE && (
                                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md bg-[#22C55E] text-[#0B0B0D]">
                                    <BookOpen className="w-3 h-3" />
                                    <span>Episode Guide</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                                  <div className="w-10 h-10 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-lg">
                                    {EDITORIAL_COMPLIANCE_MODE ? (
                                      <BookOpen className="w-4 h-4 text-slate-950" />
                                    ) : (
                                      <Play className="w-4 h-4 fill-current text-slate-950 ml-0.5" />
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Details */}
                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${isLocked ? 'text-zinc-400' : 'text-slate-400'}`}>
                                <span>EPISODE {ep.number}</span>
                                <span>·</span>
                                <span>{ep.duration}</span>
                              </div>
                              <h3 className={`text-sm sm:text-base font-black group-hover:text-[#22C55E] transition line-clamp-2 ${isLocked ? 'text-white' : 'text-slate-900'}`}>
                                {EDITORIAL_COMPLIANCE_MODE
                                  ? `Mehmed: Fetihler Sultanı Episode ${ep.number} — Story Summary`
                                  : ep.title}
                              </h3>
                            </div>
                            
                            <div className="pt-2 flex items-center justify-between text-xs text-[#22C55E] font-bold">
                              <span>
                                {EDITORIAL_COMPLIANCE_MODE
                                  ? 'Read Episode Guide'
                                  : isLocked
                                  ? 'Unlock with FEVIQO Premium'
                                  : epPremium
                                  ? 'Unlocked with Membership'
                                  : 'Watch Online'}
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
                    <p className="text-sm font-bold text-slate-500">No episodes found matching your filter.</p>
                    <button onClick={() => setSearchQuery('')} className="text-xs text-[#22C55E] hover:underline font-bold">Clear Search</button>
                  </div>
                )}

              </div>

              {/* 5. ABOUT THE SERIES DETAILED META SECTION */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-16 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                  
                  <div className="lg:col-span-8 space-y-6">
                    <div className="space-y-1">
                      <span className="text-xs font-black text-emerald-600 tracking-widest uppercase block">THE STORYLINE</span>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">About Mehmed: Fetihler Sultanı</h2>
                    </div>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                      {EDITORIAL_COMPLIANCE_MODE
                        ? 'FEVIQO publishes original episode guides, historical context, cast profiles, and weekly reviews for Mehmed: Fetihler Sultanı. Explore detailed Season 4 story summaries and community discussion.'
                        : 'FEVIQO brings you official high-definition streaming for Mehmed Fetihler Sultani with premium Urdu subtitles. Stream the latest Season 4 episodes weekly in 1080p HD, and explore story guides, recaps, and historical characters.'}
                    </p>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Story So Far (Episode 87)</h3>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">
                        Mehmed: Fetihler Sultani Season 4 Episode 4 (Bolum 87) focuses on Saruca Pasha being ambushed along the mountain defiles while Gedik Ahmed Pasha faces grave peril in Tabriz. Sultan Mehmed II continues his grand strategic campaigns for Ottoman expansion while confronting internal plotters.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-6">
                    <h3 className="text-sm font-black text-[#22C55E] uppercase tracking-wider">Series Overview</h3>
                    
                    <div className="space-y-4 text-xs">
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Series Title</span>
                        <span className="text-slate-900 font-bold">Mehmed: Fetihler Sultani</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Urdu Title</span>
                        <span className="text-slate-900 font-bold font-urdu-slim">مہمد فتحلر سلطان</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Country</span>
                        <span className="text-slate-900 font-bold">Turkey</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Broadcast Network</span>
                        <span className="text-slate-900 font-bold">{MEHMED_SERIES_DATA.network}</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Original Language</span>
                        <span className="text-slate-900 font-bold">{MEHMED_SERIES_DATA.language}</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Subtitles</span>
                        <span className="text-emerald-600 font-extrabold">{MEHMED_SERIES_DATA.subtitleLanguage} Subtitles</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Release Year</span>
                        <span className="text-slate-900 font-bold">{MEHMED_SERIES_DATA.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Status</span>
                        <span className="text-emerald-600 font-bold">{MEHMED_SERIES_DATA.status}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div 
              key="episode-player-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="space-y-4 sm:space-y-8 pb-12 bg-white"
            >
              
              {/* Breadcrumbs Row */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 text-left">
                <nav aria-label="Breadcrumb" className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <a href="/" className="hover:text-slate-900 transition-colors" onClick={(e) => { e.preventDefault(); onNavigatePage('home'); }}>FEVIQO</a>
                  <span className="text-slate-300">/</span>
                  <a href="/dramas" className="hover:text-slate-900 transition-colors" onClick={(e) => { e.preventDefault(); onNavigatePage('dramas'); }}>
                    {EDITORIAL_COMPLIANCE_MODE ? 'Episode Guides' : 'Turkish Dramas'}
                  </a>
                  <span className="text-slate-300">/</span>
                  <a href="/mehmed-fetihler-sultani" className="hover:text-slate-900 transition-colors" onClick={(e) => { e.preventDefault(); handleBackToOverview(); }}>Mehmed: Fetihler Sultanı</a>
                  <span className="text-slate-300">/</span>
                  <span className="text-emerald-600 font-bold">Episode {selectedEpisode.number}</span>
                </nav>
              </div>

              {/* Title & Meta Row */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-2">
                <span className="text-xs font-black text-emerald-600 tracking-widest uppercase">
                  {EDITORIAL_COMPLIANCE_MODE
                    ? `MEHMED: FETİHLER SULTANI • EPISODE ${selectedEpisode.number} GUIDE`
                    : `MEHMED FETIHLER SULTANI • EPISODE ${selectedEpisode.number}`}
                </span>
                <h1 className="text-xl sm:text-4xl font-black tracking-tight text-slate-900">
                  {EDITORIAL_COMPLIANCE_MODE
                    ? `Mehmed: Fetihler Sultanı Episode ${selectedEpisode.number} — Story Summary, Cast & Review`
                    : selectedEpisode.title}
                </h1>
                <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2 sm:gap-3">
                  <span>Runtime: {selectedEpisode.duration}</span>
                  <span>&bull;</span>
                  <span>{EDITORIAL_COMPLIANCE_MODE ? 'Editorial Episode Guide' : isSelectedPremium ? 'Urdu Dubbed' : 'Urdu Subtitles'}</span>
                  <span>&bull;</span>
                  <span>{EDITORIAL_COMPLIANCE_MODE ? 'Cast & Reviews' : 'HD 1080p Streaming'}</span>
                </p>
              </div>

              {/* Editorial Episode Guide OR Secure 16:9 Video Player */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {EDITORIAL_COMPLIANCE_MODE ? (
                  <EditorialEpisodeGuidePanel
                    seriesKey="mehmed-fetihler-sultani"
                    seriesTitle="Mehmed: Fetihler Sultanı"
                    seasonLabel="Season 4"
                    episodeNumber={selectedEpisode.number}
                    episodeTitle={`Mehmed: Fetihler Sultanı Episode ${selectedEpisode.number} (Bölüm ${selectedEpisode.number}) — Story Summary & Review`}
                    releaseDate={
                      selectedEpisode.airDate
                        ? new Date(selectedEpisode.airDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'November 2026'
                    }
                    duration={selectedEpisode.duration}
                    network={MEHMED_SERIES_DATA.network}
                    genre="Ottoman Historical Drama"
                    thumbnailUrl={selectedEpisode.thumbnail}
                    plotOverview={getCleanMehmedPlot(selectedEpisode)}
                    cast={MEHMED_CAST}
                    trailerReviewNotes={[
                      `The promotional trailer for Episode ${selectedEpisode.number} showcases grand Ottoman production design, siege choreography, and palace intrigue.`,
                      'Serkan Çayoğlu delivers a measured, commanding performance as Sultan Mehmed II weighing military necessity against counsel from his viziers.',
                      'Orchestral percussion and lighting contrast heighten the suspense inside the imperial divan.',
                    ]}
                    editorialHighlights={[
                      'High-stakes strategic maneuvers shaping the Ottoman campaign across Anatolia and Rumelia.',
                      'Complex political tension between Sultan Mehmed II and court rivals in the imperial council.',
                      'Historically inspired character moments paired with dramatic Season 4 cliffhangers.',
                    ]}
                    editorialRating="4.8 / 5"
                  />
                ) : isSelectedPremium && !resolvedStreamUrl ? (
                  <div className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0B0B0D] shadow-2xl flex items-center justify-center select-none aspect-video border border-zinc-800 mx-auto">
                    <img
                      src={selectedEpisode.thumbnail}
                      alt={selectedEpisode.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[2px] scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/60" />
                    <div className="relative z-10 max-w-xl mx-auto px-6 py-8 text-center space-y-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0B0B0D]/90 border border-[#22C55E]/60 text-[#22C55E] flex items-center justify-center mx-auto shadow-xl">
                        <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#22C55E]">
                        URDU DUBBED · FEVIQO PREMIUM
                      </div>
                      <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                        Unlock Mehmed Episode {selectedEpisode.number} in Urdu Dubbed HD
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
                        Click below to check your FEVIQO Premium membership status, renew an expired plan, or sign in to watch immediately.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            attemptWatchEpisode(
                              'mehmed-fetihler-sultani',
                              selectedEpSlug,
                              selectedEpisode.title
                            )
                          }
                          className="px-6 py-3 rounded-xl bg-[#22C55E] hover:bg-emerald-500 text-[#0B0B0D] font-black text-xs sm:text-sm transition cursor-pointer shadow-lg"
                        >
                          {checkingEpisodeKey === `mehmed-fetihler-sultani:${selectedEpSlug}`
                            ? 'Checking Membership...'
                            : 'Unlock with FEVIQO Premium'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent('feviqo-navigate-url', {
                                detail: `/membership?auth=signin&drama=mehmed-fetihler-sultani&episode=${selectedEpSlug}`,
                              })
                            )
                          }
                          className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm transition cursor-pointer"
                        >
                          {member ? 'My Account' : 'Sign In'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl flex items-center justify-center select-none aspect-video border border-slate-200/80 mx-auto"
                  >
                    {/* Poster Overlay with Official Episode Thumbnail */}
                    {showPosterOverlay && (
                      <div 
                        onClick={handleStartPlayback}
                        className="absolute inset-0 z-30 bg-black flex items-center justify-center cursor-pointer group overflow-hidden rounded-2xl sm:rounded-3xl"
                      >
                        <img 
                          src={selectedEpisode.thumbnail} 
                          alt={selectedEpisode.title} 
                          className="w-full h-full object-cover object-center bg-black group-hover:scale-105 transition duration-500 rounded-2xl sm:rounded-3xl"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition flex items-center justify-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current text-slate-950 ml-1" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VAST Pre-Roll Video Ad Layer for Drama Pages */}
                    {showPreRollAd && (
                      <VastPreRollAdOverlay
                        onAdComplete={handleAdComplete}
                      />
                    )}

                    <style>{`
                      mux-video, video-skin, video-player { object-fit: contain !important; }
                      mux-video::part(video), mux-video video { object-fit: contain !important; width: 100% !important; height: 100% !important; }
                      media-error-dialog, .media-error-dialog, [class*="dialog-root"], media-dialog-backdrop, media-dialog-popup {
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                      }
                    `}</style>

                    {/* Official VideoJS / Mux Video Player Web Components */}
                    <video-player className="w-full h-full block bg-black rounded-2xl sm:rounded-3xl overflow-hidden">
                      <video-skin style={{ display: 'block', width: '100%', height: '100%', aspectRatio: '16 / 9' }}>
                        <mux-video
                          ref={videoRef as any}
                          src={resolvedStreamUrl}
                          playback-id={extractMuxPlaybackId(resolvedStreamUrl) || undefined}
                          crossorigin="anonymous"
                          playsinline
                          controlsList={isSelectedPremium ? 'nodownload noremoteplayback' : undefined}
                          disablePictureInPicture={isSelectedPremium ? true : undefined}
                          disableRemotePlayback={isSelectedPremium ? true : undefined}
                          poster={selectedEpisode.thumbnail}
                          onContextMenu={(e: any) => e.preventDefault()}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        ></mux-video>
                        <mux-data env-key="feviqo" metadata-video-title={selectedEpisode.title}></mux-data>
                      </video-skin>
                    </video-player>
                    {isSelectedPremium && resolvedStreamUrl && (
                      <ProtectedPlayerWatermark watermark={activeWatermark} />
                    )}
                  </div>
                )}

                {/* Action Row: Share Button (Raw external download links temporarily hidden during Monetag review) */}
                <div className="mt-3 flex flex-row items-center justify-between gap-2 w-full">
                  {!HIDE_EXTERNAL_DOWNLOAD_LINKS && !EDITORIAL_COMPLIANCE_MODE && !isSelectedPremium ? (
                    <a
                      href={selectedEpisode.downloadUrl || "https://shrinkme.click/mehmedepisode88urdu"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 text-[11px] sm:text-xs font-black tracking-wide transition shadow-md shadow-[#22C55E]/15 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                      <span>Download Episode {selectedEpisode.number} (1080p HD)</span>
                    </a>
                  ) : (
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-500">
                      Episode Summary, Cast &amp; Urdu Subtitle Notes
                    </div>
                  )}

                  <button
                    onClick={handleShare}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] sm:text-xs font-bold text-slate-800 transition flex items-center gap-1.5 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{copiedLink ? 'Copied!' : 'Share Episode Guide'}</span>
                  </button>
                </div>
              </div>

              {/* 5. RICH BILINGUAL ENGLISH & URDU EDITORIAL EPISODE SUMMARY, CAST, RELEASE DATE & TRAILER BREAKDOWN */}
              {!EDITORIAL_COMPLIANCE_MODE && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-10 text-left">
                  <EditorialEpisodeGuidePanel
                    hideBanner
                    seriesKey="mehmed-fetihler-sultani"
                    seriesTitle="Mehmed: Fetihler Sultanı"
                    seasonLabel="Season 4"
                    episodeNumber={selectedEpisode.number}
                    episodeTitle={`Mehmed: Fetihler Sultanı Episode ${selectedEpisode.number} (Bölüm ${selectedEpisode.number}) — Episode Summary & Notes`}
                    releaseDate={
                      selectedEpisode.airDate
                        ? new Date(selectedEpisode.airDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'November 2026'
                    }
                    duration={selectedEpisode.duration}
                    network={MEHMED_SERIES_DATA.network}
                    genre="Ottoman Historical Drama"
                    thumbnailUrl={selectedEpisode.thumbnail}
                    plotOverview={getCleanMehmedPlot(selectedEpisode)}
                    plotOverviewUrdu={selectedEpisode.recapUrdu}
                    cast={MEHMED_CAST}
                    trailerReviewNotes={[
                      `The official promotional trailer for Episode ${selectedEpisode.number} highlights grand Ottoman production design, strategic siege choreography, and palace intrigue across Season 4.`,
                      'Serkan Çayoğlu delivers a measured, commanding performance as Sultan Mehmed II weighing military necessity against counsel from his viziers.',
                      'Orchestral percussion and dramatic lighting contrast heighten the suspense inside the imperial divan and along the frontier.',
                    ]}
                    editorialHighlights={[
                      'High-stakes strategic maneuvers shaping the Ottoman campaign across Anatolia and Rumelia.',
                      'Complex political tension between Sultan Mehmed II and court rivals in the imperial council.',
                      'Historically inspired character moments paired with Urdu subtitle & dubbing updates.',
                    ]}
                    editorialRating="4.8 / 5"
                  />
                </div>
              )}

              {/* Navigation Back & Related Links */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-10 text-left">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <a
                    href="/mehmed-fetihler-sultani"
                    onClick={(e) => {
                      e.preventDefault();
                      handleBackToOverview();
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{EDITORIAL_COMPLIANCE_MODE ? 'Back to Mehmed Episode Guide' : 'Back to Mehmed Directory'}</span>
                  </a>

                  {/* Previous / Next Episode Navigation with crawlable HTML links */}
                  <div className="flex items-center gap-3">
                    {prevEpisode && (
                      <a
                        href={
                          !EDITORIAL_COMPLIANCE_MODE && Boolean(prevEpisode.isLockedPremium || isEpisodePremium('mehmed-fetihler-sultani', prevEpisode.slug)) && !isDramaUnlocked
                            ? `/membership?drama=mehmed-fetihler-sultani&episode=${prevEpisode.slug}`
                            : `/mehmed-fetihler-sultani/${prevEpisode.slug}`
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelectEpisode(prevEpisode);
                        }}
                        rel="prev"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#22C55E] hover:text-[#22C55E] text-slate-700 font-bold text-xs transition shadow-sm"
                        title={EDITORIAL_COMPLIANCE_MODE ? `Read Mehmed Episode ${prevEpisode.number} Guide` : `Watch Mehmed Episode ${prevEpisode.number}`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Episode {prevEpisode.number} (Previous)</span>
                      </a>
                    )}
                    {nextEpisode && (
                      <a
                        href={
                          !EDITORIAL_COMPLIANCE_MODE && Boolean(nextEpisode.isLockedPremium || isEpisodePremium('mehmed-fetihler-sultani', nextEpisode.slug)) && !isDramaUnlocked
                            ? `/membership?drama=mehmed-fetihler-sultani&episode=${nextEpisode.slug}`
                            : `/mehmed-fetihler-sultani/${nextEpisode.slug}`
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelectEpisode(nextEpisode);
                        }}
                        rel="next"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-white font-bold text-xs transition shadow-sm"
                        title={EDITORIAL_COMPLIANCE_MODE ? `Read Mehmed Episode ${nextEpisode.number} Guide` : `Watch Mehmed Episode ${nextEpisode.number}`}
                      >
                        {!EDITORIAL_COMPLIANCE_MODE && Boolean(nextEpisode.isLockedPremium || isEpisodePremium('mehmed-fetihler-sultani', nextEpisode.slug)) && !isDramaUnlocked && (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                        <span>Episode {nextEpisode.number} (Next)</span>
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Search Keyword Tags & Search Engine Cloud (Hidden in editorial compliance mode) */}
      {!EDITORIAL_COMPLIANCE_MODE && (
        <div className="sr-only" aria-hidden="true">
          <h3>Popular Search Queries &amp; Tags for Mehmed Fetihler Sultani</h3>
          <p>
            Users found this page using search keywords: mehmed fetihler sultani episode 87 urdu, mehmed fetihler sultani season 4 episode 4 urdu subtitles, mehmed fetihler sultani 87 urdu, watch mehmed fetihler sultani episode 87 urdu subtitles, mehmed fetihler sultani bolum 87 urdu, and sultan mehmed fetihler sultani urdu subtitles online.
          </p>
          <p>
            mehmed fetihler sultani 87 urdu,
            mehmed fetihler sultani episode 87,
            mehmed fetihler sultani season 4 episode 4,
            mehmed fetihler sultani 87 urdu subtitles,
            watch mehmed fetihler sultani 87 urdu subtitles,
            mehmed season 4 episode 4 urdu subtitles,
            sultan mehmed fatih episode 87 urdu subtitles,
            feviqo mehmed fetihler sultani 87
          </p>
        </div>
      )}

      {/* Footer */}
      <Footer 
        onBookCall={onBookCall}
        onGetStarted={onBookCall}
        onNavigateSection={() => onNavigatePage('home')}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={() => onNavigatePage('flow')}
        onNavigatePage={(route) => onNavigatePage(route)}
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

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
  Sparkles,
  ShieldCheck,
  Sword,
  Globe,
  Film,
  Server,
  Download
} from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { AdBanner468x60 } from '../AdBanner468x60';
import { AdBanner160x300 } from '../AdBanner160x300';
import { AdBanner300x250 } from '../AdBanner300x250';
import { AdBanner728x90 } from '../AdBanner728x90';
import { AdBanner320x50 } from '../AdBanner320x50';
import { AdBanner160x600 } from '../AdBanner160x600';
import { AdNativeBanner } from '../AdNativeBanner';
import { VastPreRollAdOverlay } from '../VastPreRollAdOverlay';
import { MEHMED_SERIES_DATA, MEHMED_EPISODES, MehmedEpisode } from '../../data/mehmedData';
import { attachHlsStream, extractMuxPlaybackId } from '../../utils/hlsPlayer';

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeView, selectedEpisode]);

  // SEO & Google Search Keyword Optimization Effect for Main & Episode Pages
  useEffect(() => {
    const keywordsEl = document.querySelector('meta[name="keywords"]');

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

  const currentStreamUrl = selectedEpisode.embeds?.[activeServerIndex]?.src 
    || selectedEpisode.embeds?.[0]?.src 
    || "https://stream.mux.com/myroEGBWeut02BU5yZEPr3GT3stSVu91dYtKAJPeJkfs.m3u8";

  useEffect(() => {
    if (activeView === 'episode-detail' && videoRef.current && currentStreamUrl) {
      const cleanup = attachHlsStream(videoRef.current, currentStreamUrl, {
        autoPlay: false,
      });
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [activeView, selectedEpisode, activeServerIndex, currentStreamUrl]);

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

      {/* TOP IN-STREAM SPONSORSHIP / AD PLACEMENT HEADER BANNER */}
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
                        Mehmed Fetihler Sultani Urdu Subtitles
                      </h1>

                      {/* Urdu Translation below logo */}
                      <div className="text-xl sm:text-2xl font-urdu-slim text-slate-300 font-normal dir-rtl leading-relaxed">
                        مہمد فتحلر سلطان (Sultan Mehmed II Urdu)
                      </div>

                      {/* Series badges */}
                      <div className="text-xs sm:text-sm text-slate-300 font-medium flex flex-wrap items-center gap-2.5 pt-1 select-none">
                        <span className="font-bold text-white">Season 4</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">HD</span>
                        <span>•</span>
                        <span className="font-medium text-slate-200">Urdu Subtitles</span>
                        <span>•</span>
                        <span className="text-slate-300">Ottoman Empire Historical Series</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
                        {MEHMED_SERIES_DATA.synopsis}
                      </p>

                    </div>

                    {/* Right button panel */}
                    <div className="lg:col-span-4 flex items-center lg:justify-end w-full">
                      <a 
                        href={`/mehmed-fetihler-sultani/${latestEpisode.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToEpisode(latestEpisode);
                        }}
                        className="w-full lg:w-auto px-10 py-4 bg-[#22C55E] hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-sm rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Watch Episode {latestEpisode.number} Now</span>
                      </a>
                    </div>

                  </div>
                </div>

              </div>

              {/* 3. FEATURED LATEST EPISODE STRIP (CLEAN LIGHT DESIGN) */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="border border-slate-100 bg-slate-50/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center text-left relative overflow-hidden select-none shadow-sm">
                  
                  {/* Thumbnail Cover */}
                  <a 
                    href={`/mehmed-fetihler-sultani/${latestEpisode.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToEpisode(latestEpisode);
                    }}
                    className="relative w-full md:w-[320px] aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group shadow-sm block"
                  >
                    <img 
                      src={latestEpisode.thumbnail} 
                      alt={`Mehmed Fetihler Sultani Episode ${latestEpisode.number}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#22C55E] text-slate-950 text-[9px] font-black uppercase tracking-wider">
                      NEW
                    </div>
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                      <div className="w-11 h-11 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-current text-slate-950 ml-0.5" />
                      </div>
                    </div>
                  </a>

                  {/* Details Block */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span>LATEST RELEASE</span>
                        <span>·</span>
                        <span>EPISODE {latestEpisode.number} (BOLUM {latestEpisode.number})</span>
                      </div>
                      <a 
                        href={`/mehmed-fetihler-sultani/${latestEpisode.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToEpisode(latestEpisode);
                        }}
                        className="block"
                      >
                        <h2 className="text-2xl font-black text-slate-900 hover:text-[#22C55E] cursor-pointer transition">
                          {latestEpisode.title}
                        </h2>
                      </a>
                      <p className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> October 2026</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {latestEpisode.duration}</span>
                      </p>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                      {latestEpisode.shortSummary}
                    </p>

                    <a 
                      href={`/mehmed-fetihler-sultani/${latestEpisode.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToEpisode(latestEpisode);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-lg transition duration-150 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Episode {latestEpisode.number} Now</span>
                    </a>
                  </div>

                </div>
              </div>

              {/* 4. EPISODE DIRECTORY — MAIN FILTERED GRID SEARCH */}
              <div id="episode-directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6 text-left">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                      <span>Episodes</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Watch Mehmed Fetihler Sultani with premium Urdu subtitles.
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
                    {filteredEpisodes.map((ep) => (
                      <a 
                        key={ep.slug}
                        href={`/mehmed-fetihler-sultani/${ep.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToEpisode(ep);
                        }}
                        className="group bg-slate-50/20 hover:bg-slate-50/50 border border-slate-100 hover:border-slate-300 rounded-2xl overflow-hidden hover:scale-[1.02] active:scale-[0.99] transition duration-200 text-left select-none cursor-pointer flex flex-col h-full shadow-sm"
                      >
                        
                        {/* 16:9 Rectangle aspect-video Thumbnail Cover */}
                        <div className="relative aspect-video bg-slate-100 border-b border-slate-100 overflow-hidden">
                          <img 
                            src={ep.thumbnail} 
                            alt={ep.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                            <div className="w-10 h-10 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-lg">
                              <Play className="w-4 h-4 fill-current text-slate-950 ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <span>EPISODE {ep.number}</span>
                              <span>·</span>
                              <span>{ep.duration}</span>
                            </div>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#22C55E] transition line-clamp-2">
                              {ep.title}
                            </h3>
                          </div>
                          
                          <div className="pt-2 flex items-center justify-between text-xs text-[#22C55E] font-bold">
                            <span>Watch Online</span>
                            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>

                      </a>
                    ))}
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
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">About Mehmed: Fetihler Sultani</h2>
                    </div>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                      FEVIQO brings you official high-definition streaming for Mehmed Fetihler Sultani with premium Urdu subtitles. Stream the latest Season 4 episodes weekly in 1080p HD, and explore story guides, recaps, and historical characters.
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
                  <a href="/dramas" className="hover:text-slate-900 transition-colors" onClick={(e) => { e.preventDefault(); onNavigatePage('dramas'); }}>Turkish Dramas</a>
                  <span className="text-slate-300">/</span>
                  <a href="/mehmed-fetihler-sultani" className="hover:text-slate-900 transition-colors" onClick={(e) => { e.preventDefault(); handleBackToOverview(); }}>Mehmed Fetihler Sultani</a>
                  <span className="text-slate-300">/</span>
                  <span className="text-emerald-600 font-bold">Episode {selectedEpisode.number}</span>
                </nav>
              </div>

              {/* Title & Meta Row */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-2">
                <span className="text-xs font-black text-emerald-600 tracking-widest uppercase">MEHMED FETIHLER SULTANI &bull; EPISODE {selectedEpisode.number}</span>
                <h1 className="text-xl sm:text-4xl font-black tracking-tight text-slate-900">
                  {selectedEpisode.title}
                </h1>
                <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2 sm:gap-3">
                  <span>Duration: {selectedEpisode.duration}</span>
                  <span>&bull;</span>
                  <span>Urdu Subtitles</span>
                  <span>&bull;</span>
                  <span>HD 1080p Streaming</span>
                </p>
              </div>

              {/* Secure 16:9 Anti-Download Video Player */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        src={currentStreamUrl}
                        playback-id={extractMuxPlaybackId(currentStreamUrl) || undefined}
                        crossorigin="anonymous"
                        playsinline
                        poster={selectedEpisode.thumbnail}
                        onContextMenu={(e: any) => e.preventDefault()}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      ></mux-video>
                      <mux-data env-key="feviqo" metadata-video-title={selectedEpisode.title}></mux-data>
                    </video-skin>
                  </video-player>
                </div>

                {/* Action Row: Download & Share Buttons (Guaranteed same line on phones) */}
                <div className="mt-3 flex flex-row items-center justify-between gap-2 w-full">
                  <a
                    href={selectedEpisode.downloadUrl || "https://shrinkme.click/mehmedepisode88urdu"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 text-[11px] sm:text-xs font-black tracking-wide transition shadow-md shadow-[#22C55E]/15 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                    <span>Download Episode {selectedEpisode.number} (1080p HD)</span>
                  </a>

                  <button
                    onClick={handleShare}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] sm:text-xs font-bold text-slate-800 transition flex items-center gap-1.5 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{copiedLink ? 'Copied!' : 'Share Episode'}</span>
                  </button>
                </div>
              </div>

              {/* High-Converting Ads Row */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 my-4">

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-6 my-4">
                  <AdBanner468x60 />
                  <AdBanner300x250 />
                  <AdBanner160x300 />
                </div>

                {/* Native Banner */}
                <AdNativeBanner />

                <div className="flex justify-center my-3">
                  <a
                    href="https://arwf.org/4/407c2859d48b877cf406dc93dcd6c1d5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black tracking-wide transition inline-flex items-center gap-2 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Sponsored HD Stream Mirror (FEVIQO Fast Server)</span>
                  </a>
                </div>
              </div>

              {/* 5. ORIGINAL DETAILED STORY RECAP SECTION */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-10 text-left max-w-4xl">
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900">Episode {selectedEpisode.number} Detailed Story Recap</h2>
                  
                  {/* English Story Summary */}
                  <div className="space-y-6 text-slate-700 font-normal leading-relaxed text-sm sm:text-base">
                    {selectedEpisode.recap.split('\n\n').map((para, idx) => {
                      const trimmed = para.trim();
                      if (!trimmed) return null;

                      const isHeading = trimmed.length < 80 && (trimmed.includes(':') || trimmed.includes('—') || (!trimmed.includes('.') && trimmed.split(' ').length < 10));

                      if (isHeading) {
                        return (
                          <h3 key={idx} className="text-lg sm:text-xl font-black text-slate-900 border-l-4 border-[#22C55E] pl-3.5 mt-8 mb-4 tracking-tight">
                            {trimmed}
                          </h3>
                        );
                      }

                      if (trimmed.startsWith('- ') || trimmed.includes('\n- ')) {
                        const items = trimmed.split('\n').map(li => li.replace(/^-\s*/, '').trim()).filter(Boolean);
                        return (
                          <ul key={idx} className="list-disc pl-6 text-slate-700 space-y-2.5 my-4">
                            {items.map((item, itemIdx) => (
                              <li key={itemIdx} className="text-sm sm:text-base leading-relaxed">{item}</li>
                            ))}
                          </ul>
                        );
                      }

                      return (
                        <p key={idx} className="text-slate-700 leading-relaxed">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>

                  {/* Urdu Story Summary */}
                  {selectedEpisode.recapUrdu && (
                    <div className="space-y-3 pt-6 border-t border-slate-100">
                      <h3 className="text-lg font-urdu-slim font-bold text-slate-900 dir-rtl text-right">
                        مہمد فتحلر سلطان سیزن 4 قسط {selectedEpisode.number} اردو کہانی کا خلاصہ
                      </h3>
                      <p className="text-slate-700 text-base font-urdu-slim font-normal whitespace-pre-line leading-relaxed dir-rtl text-right">
                        {selectedEpisode.recapUrdu}
                      </p>
                    </div>
                  )}
                </div>

                {/* Minimal Episode Details Metadata Grid */}
                <div className="pt-8 border-t border-slate-200 text-left mt-8">
                  <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider">Episode Details</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 font-medium">Series</div>
                      <div className="text-slate-900 font-bold mt-0.5">Mehmed Fetihler Sultani</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Season</div>
                      <div className="text-slate-900 font-bold mt-0.5">Season 4</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Episode</div>
                      <div className="text-slate-900 font-bold mt-0.5">Episode {selectedEpisode.number}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Language</div>
                      <div className="text-slate-900 font-bold mt-0.5">Urdu Subtitles</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Quality</div>
                      <div className="text-slate-900 font-bold mt-0.5">HD 1080p</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Platform</div>
                      <div className="text-[#22C55E] font-extrabold mt-0.5">FEVIQO</div>
                    </div>
                  </div>
                </div>
              </div>

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
                    <span>Back to Mehmed Directory</span>
                  </a>

                  {/* Previous / Next Episode Navigation with crawlable HTML links */}
                  <div className="flex items-center gap-3">
                    {prevEpisode && (
                      <a
                        href={`/mehmed-fetihler-sultani/${prevEpisode.slug}/`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToEpisode(prevEpisode);
                        }}
                        rel="prev"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#22C55E] hover:text-[#22C55E] text-slate-700 font-bold text-xs transition shadow-sm"
                        title={`Watch Mehmed Episode ${prevEpisode.number}`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Episode {prevEpisode.number} (Previous)</span>
                      </a>
                    )}
                    {nextEpisode && (
                      <a
                        href={`/mehmed-fetihler-sultani/${nextEpisode.slug}/`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToEpisode(nextEpisode);
                        }}
                        rel="next"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-white font-bold text-xs transition shadow-sm"
                        title={`Watch Mehmed Episode ${nextEpisode.number}`}
                      >
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

      {/* Search Keyword Tags & Search Engine Cloud (Invisible on UI, fully crawled by Googlebot) */}
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

      {/* Footer */}
      <Footer 
        onBookCall={onBookCall}
        onGetStarted={onBookCall}
        onNavigateSection={() => onNavigatePage('home')}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={() => onNavigatePage('flow')}
        onNavigatePage={(route) => onNavigatePage(route)}
      />
    </div>
  );
};

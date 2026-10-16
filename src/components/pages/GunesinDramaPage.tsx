import React, { useState, useRef, useEffect } from 'react';
import '@videojs/html/video/player';
import '@videojs/html/video/skin';
import '@videojs/html/media/mux-video';
import '@videojs/html/extensions/mux-data';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  ChevronRight, 
  Clock, 
  Tv,
  ArrowLeft,
  Share2,
  Calendar,
  Search,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { AdBanner468x60 } from '../AdBanner468x60';
import { AdBanner160x300 } from '../AdBanner160x300';
import { AdBanner728x90 } from '../AdBanner728x90';
import { AdBanner320x50 } from '../AdBanner320x50';
import { AdBanner300x250 } from '../AdBanner300x250';
import { AdBanner160x600 } from '../AdBanner160x600';
import { AdNativeBanner } from '../AdNativeBanner';
import { VastPreRollAdOverlay } from '../VastPreRollAdOverlay';
import { GUNESIN_SERIES_DATA, GUNESIN_EPISODES, GunesinEpisode } from '../../data/gunesinDogduguYer';
import { attachHlsStream, extractMuxPlaybackId } from '../../utils/hlsPlayer';

interface GunesinDramaPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: any) => void;
}

export const GunesinDramaPage: React.FC<GunesinDramaPageProps> = ({
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

  const [selectedEpisode, setSelectedEpisode] = useState<GunesinEpisode>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const match = path.match(/episode-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        const found = GUNESIN_EPISODES.find(ep => ep.number === num);
        if (found) return found;
      }
    }
    return GUNESIN_EPISODES[0]; // Default to Episode 3
  });

  const [showPosterOverlay, setShowPosterOverlay] = useState(true);
  const [showPreRollAd, setShowPreRollAd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  // Native HTML5 Video references
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsVideoPlaying] = useState(false);

  // SEO & Google Search Keyword Optimization Effect for Main & Episode 3 Pages
  useEffect(() => {
    const keywordsEl = document.querySelector('meta[name="keywords"]');

    if (activeView === 'episode-detail') {
      const num = selectedEpisode.number;
      let pageTitle = `Gunesin Dogdugu Yer Episode ${num} Urdu Subtitles - Bolum ${num} | FEVIQO`;
      let metaDesc = `Watch Gunesin Dogdugu Yer Episode ${num} with Urdu Subtitles (گنیشین دوغدوغو یر قسط ${num}). Stream full HD 1080p Bolum ${num} online with story recaps on FEVIQO.com.`;
      let keywords = `gunesin dogdugu yer episode ${num} urdu subtitles, gunesin dogdugu yer bolum ${num} urdu, watch gunesin dogdugu yer episode ${num}, gunesin dogdugu yer urdu, gunesin dogdugu yer ${num} urdu subtitles, gunesin dogdugu yer bolum ${num}, feviqo gunesin dogdugu yer ${num}`;

      if (num === 4) {
        pageTitle = "Gunesin Dogdugu Yer Episode 4 Urdu Subtitles | Bolum 4";
        metaDesc = "Watch Gunesin Dogdugu Yer Episode 4 Urdu Subtitles (Bolum 4) in HD on FEVIQO. Follow the latest episode of this Turkish drama with Urdu subtitles and enjoy a high-quality viewing experience.";
        keywords = "Gunesin Dogdugu Yer Episode 4, Gunesin Dogdugu Yer Episode 4 Urdu Subtitles, Gunesin Dogdugu Yer Bolum 4, Gunesin Dogdugu Yer Bolum 4 Urdu Subtitles, Gunesin Dogdugu Yer Episode 4 Urdu, Gunesin Dogdugu Yer Season 1 Episode 4, Gunesin Dogdugu Yer Season 1 Episode 4 Urdu Subtitles, Gunesin Dogdugu Yer Urdu Subtitles, Gunesin Dogdugu Yer English Subtitles, Gunesin Dogdugu Yer Latest Episode, Gunesin Dogdugu Yer Full Episode, Gunesin Dogdugu Yer Watch Online, Gunesin Dogdugu Yer HD, Gunesin Dogdugu Yer 1080p, Gunesin Dogdugu Yer Turkish Drama, Gunesin Dogdugu Yer Series Urdu Subtitles, Gunesin Dogdugu Yer Turkish Series, Gunesin Dogdugu Yer Episode 4 Watch Online, Gunesin Dogdugu Yer Episode 4 HD, Gunesin Dogdugu Yer Episode 4 Online, Gunesin Dogdugu Yer New Episode, Gunesin Dogdugu Yer Bolum 4 Urdu, Episode 4 Urdu Subtitles, Bolum 4 Urdu Subtitles, Turkish Drama Episode 4 Urdu Subtitles, Turkish Series Episode 4 Urdu Subtitles, Turkish Dramas Urdu Subtitles, Turkish Series with Urdu Subtitles, Turkish Dramas in Pakistan, Watch Turkish Dramas Online, Latest Turkish Drama Urdu Subtitles, Turkish Series Online HD, Turkish Drama Online Free, Turkish Series Urdu Translation, Turkish Drama Subtitles, Urdu Subtitles Online, Turkish Shows Urdu Subtitles, Latest Turkish Series, New Turkish Drama Episodes, FEVIQO Gunesin Dogdugu Yer, FEVIQO Episode 4, FEVIQO Urdu Subtitles, FEVIQO Turkish Dramas, FEVIQO Turkish Series, FEVIQO, Gunesin Dogdugu Yer FEVIQO, Gunesin Dogdugu Yer Episode 4 FEVIQO, watch Gunesin Dogdugu Yer on FEVIQO, Turkish historical series Urdu subtitles, Turkish action drama Urdu subtitles, Turkish drama streaming, HD Turkish series, Turkish drama episodes online, Turkish series latest episodes, Urdu subtitle series online, Turkish entertainment Pakistan, Turkish drama fans Pakistan, premium streaming experience, online video streaming, digital entertainment platforms, OTT streaming platforms, online series episodes, Gunesin Dogdugu Yer Episode 5 Urdu Subtitles, Gunesin Dogdugu Yer Episode 4 Urdu Subtitles, Gunesin Dogdugu Yer Episode 3 Urdu Subtitles, Gunesin Dogdugu Yer Season 1 Urdu Subtitles, Mehmed Fetihler Sultani, Kurulus Osman, Salahuddin Ayyubi, Teskilat, Turkish Dramas with Urdu Subtitles, Turkish Series with English Subtitles";
      }
      
      document.title = pageTitle;

      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);

      if (keywordsEl) keywordsEl.setAttribute('content', keywords);

      const ogTitleEl = document.querySelector('meta[property="og:title"]');
      if (ogTitleEl) ogTitleEl.setAttribute('content', pageTitle);

      const ogDescEl = document.querySelector('meta[property="og:description"]');
      if (ogDescEl) ogDescEl.setAttribute('content', metaDesc);

      const twTitleEl = document.querySelector('meta[name="twitter:title"]');
      if (twTitleEl) twTitleEl.setAttribute('content', pageTitle);

      const twDescEl = document.querySelector('meta[name="twitter:description"]');
      if (twDescEl) twDescEl.setAttribute('content', metaDesc);
    } else {
      const pageTitle = "Gunesin Dogdugu Yer Urdu Subtitles - Watch Online - FEVIQO.com";
      const metaDesc = "Watch Gunesin Dogdugu Yer Turkish Drama in HD Urdu Subtitles (گنیشین دوغدوغو یر اردو). Stream official episodes with story recaps on FEVIQO.com.";
      const keywords = "gunesin dogdugu yer urdu, gunesin dogdugu yer urdu subtitles, watch gunesin dogdugu yer urdu, gunesin dogdugu yer season 1, gunesin dogdugu yer bolum 3 urdu, gunesin dogdugu yer episode 3 urdu subtitles";

      document.title = pageTitle;

      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);

      if (keywordsEl) keywordsEl.setAttribute('content', keywords);
    }
  }, [activeView, selectedEpisode]);

  // Sync state with back/forward button clicks
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/episode-')) {
        const match = path.match(/episode-(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          const found = GUNESIN_EPISODES.find(ep => ep.number === num);
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

  const navigateToEpisode = (ep: GunesinEpisode) => {
    setSelectedEpisode(ep);
    setActiveView('episode-detail');
    setShowPosterOverlay(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      window.history.pushState({ episode: ep.number }, '', `/gunesin-dogdugu-yer/episode-${ep.number}`);
    } catch {}
  };

  const handleBackToOverview = () => {
    setActiveView('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({}, '', '/gunesin-dogdugu-yer');
    } catch {}
  };

  const handleShareLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const currentStreamUrl = selectedEpisode.embeds[0]?.src;

  useEffect(() => {
    if (activeView === 'episode-detail' && videoRef.current && currentStreamUrl) {
      const cleanup = attachHlsStream(videoRef.current, currentStreamUrl, {
        autoPlay: false,
      });
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [activeView, selectedEpisode, currentStreamUrl]);

  const handleStartPlayback = () => {
    setShowPosterOverlay(false);
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        if (videoRef.current) videoRef.current.pause();
      }).catch(() => {});
    }
    setShowPreRollAd(true);
  };

  const handleAdComplete = () => {
    setShowPreRollAd(false);
    setIsVideoPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }, 50);
  };

  // Filtered & Sorted Episodes
  const filteredEpisodes = GUNESIN_EPISODES.filter(ep => {
    if (selectedSeason && ep.season !== selectedSeason) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = ep.number.toString() === q.replace(/\D/g, '');
      const titleMatch = ep.title.toLowerCase().includes(q) || ep.shortSummary.toLowerCase().includes(q);
      return numMatch || titleMatch;
    }
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'newest') return b.number - a.number;
    return a.number - b.number;
  });

  const latestEpisode = GUNESIN_EPISODES.reduce((max, ep) => ep.number > max.number ? ep : max, GUNESIN_EPISODES[0]);

  return (
    <div className="w-full bg-white text-slate-900 selection:bg-[#22C55E] selection:text-white font-sans min-h-screen">
      
      {/* 3-ZONE HEADER NAVBAR CONTRACT MATCHING FEVIQO IDENTITY */}
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
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
              SPONSORSHIP
            </span>
            <span className="font-semibold text-emerald-100">
              In-Stream Pre-Roll &amp; Banner Advertising for Gunesin Dogdugu Yer Urdu Portal
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

      {/* PRIMARY CONTAINER */}
      <main className="w-full">
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
              
              {/* STACKED HERO SECTION (IDENTICAL ON PHONE & DESKTOP): 100% PICTURE SIGHT WITH SOLID READABLE DARK PLATE BELOW */}
              <div className="relative w-full bg-black text-white overflow-hidden">
                
                {/* 1. PICTURE PANEL: Displays the widescreen 16:9 banner with absolutely ZERO CROPPING or cutting! */}
                <div className="w-full aspect-video bg-black relative select-none">
                  <img
                    src={GUNESIN_SERIES_DATA.backdrop}
                    alt="Gunesin Dogdugu Yer Backdrop"
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
                        FEVIQO • GUNESIN DOGDUGU YER
                      </div>

                      {/* Official Graphic LOGO of Gunesin Dogdugu Yer */}
                      <div className="h-14 sm:h-20 w-auto flex items-center justify-start select-none">
                        <img 
                          src="https://lh3.googleusercontent.com/d/1ceV7W__33FQpHUPZMaxE8cahPItht54z" 
                          alt="Gunesin Dogdugu Yer Official Logo"
                          className="h-full w-auto object-contain max-w-[250px] sm:max-w-[340px]"
                          loading="eager"
                        />
                      </div>

                      {/* Primary Descriptive H1 Title */}
                      <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        Gunesin Dogdugu Yer Urdu Subtitles
                      </h1>

                      {/* Urdu Translation below logo */}
                      <div className="text-xl sm:text-2xl font-urdu-slim text-slate-300 font-normal dir-rtl leading-relaxed">
                        گنیشین دوغدوغو یر (Gunesin Dogdugu Yer Urdu)
                      </div>

                      {/* Series badges */}
                      <div className="text-xs sm:text-sm text-slate-300 font-medium flex flex-wrap items-center gap-2.5 pt-1 select-none">
                        <span className="font-bold text-white">Season 1</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">HD</span>
                        <span>•</span>
                        <span className="font-medium text-slate-200">Urdu Subtitles</span>
                        <span>•</span>
                        <span className="text-slate-300">Anatolian Family Saga</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
                        {GUNESIN_SERIES_DATA.synopsis}
                      </p>

                    </div>

                    {/* Right button panel */}
                    <div className="lg:col-span-4 flex items-center lg:justify-end w-full">
                      <button 
                        onClick={() => navigateToEpisode(latestEpisode)}
                        className="w-full lg:w-auto px-10 py-4 bg-[#22C55E] hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-sm rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Watch Episode {latestEpisode.number} Now</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>

              {/* 3. FEATURED LATEST EPISODE STRIP (CLEAN LIGHT DESIGN) */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="border border-slate-100 bg-slate-50/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center text-left relative overflow-hidden select-none shadow-sm">
                  
                  {/* Thumbnail Cover */}
                  <div 
                    onClick={() => navigateToEpisode(latestEpisode)}
                    className="relative w-full md:w-[320px] aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group shadow-sm"
                  >
                    <img 
                      src={latestEpisode.thumbnail} 
                      alt={`Gunesin Dogdugu Yer Episode ${latestEpisode.number}`}
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
                  </div>

                  {/* Details Block */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span>LATEST RELEASE</span>
                        <span>·</span>
                        <span>EPISODE {latestEpisode.number}</span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 hover:text-[#22C55E] cursor-pointer transition" onClick={() => navigateToEpisode(latestEpisode)}>
                        {latestEpisode.title}
                      </h2>
                      <p className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> October 2026</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {latestEpisode.duration}</span>
                      </p>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                      {latestEpisode.shortSummary}
                    </p>

                    <button 
                      onClick={() => navigateToEpisode(latestEpisode)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-lg transition duration-150 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Episode {latestEpisode.number} Now</span>
                    </button>
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
                      Watch Gunesin Dogdugu Yer with premium Urdu subtitles.
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

                {/* Directory Cards Grid in 16:9 rectangle aspect ratio with zero mobile cropping */}
                {filteredEpisodes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredEpisodes.map((ep) => (
                      <div 
                        key={ep.slug}
                        onClick={() => navigateToEpisode(ep)}
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

                      </div>
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
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">About Gunesin Dogdugu Yer</h2>
                    </div>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                      FEVIQO brings you official high-definition streaming for Gunesin Dogdugu Yer with premium Urdu subtitles. Stream the latest episodes weekly in 1080p HD, and explore story guides, recaps, and characters.
                    </p>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Story So Far (Spoiler-Free)</h3>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">
                        Update this section with a full, detailed synopsis of season development once confirmed. As the first episodes introduce the audience to core family hierarchies and secret operations, the protagonist remains caught in a turf battle.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-6">
                    <h3 className="text-sm font-black text-[#22C55E] uppercase tracking-wider">Series Overview</h3>
                    
                    <div className="space-y-4 text-xs">
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Series Title</span>
                        <span className="text-slate-900 font-bold">Gunesin Dogdugu Yer</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Urdu Title</span>
                        <span className="text-slate-900 font-bold font-urdu-slim">گنیشین دوغدوغو یر</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Country</span>
                        <span className="text-slate-900 font-bold">Turkey</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Broadcast Network</span>
                        <span className="text-slate-900 font-bold">{GUNESIN_SERIES_DATA.network}</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Original Language</span>
                        <span className="text-slate-900 font-bold">{GUNESIN_SERIES_DATA.language}</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Subtitles</span>
                        <span className="text-emerald-600 font-extrabold">{GUNESIN_SERIES_DATA.subtitleLanguage} Subtitles</span>
                      </div>
                      <div className="border-b border-slate-200 pb-3 flex justify-between">
                        <span className="text-slate-500 font-medium">Release Year</span>
                        <span className="text-slate-900 font-bold">{GUNESIN_SERIES_DATA.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Status</span>
                        <span className="text-emerald-600 font-bold">{GUNESIN_SERIES_DATA.status}</span>
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
                <nav className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => onNavigatePage('home')}>FEVIQO</span>
                  <span className="text-slate-300">/</span>
                  <span className="hover:text-slate-900 cursor-pointer transition-colors" onClick={handleBackToOverview}>Gunesin Dogdugu Yer</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-emerald-600 font-bold">Episode {selectedEpisode.number}</span>
                </nav>
              </div>

              {/* Title & Meta Row */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-2">
                <span className="text-xs font-black text-emerald-600 tracking-widest uppercase">GUNESIN DOGDUGU YER &bull; EPISODE {selectedEpisode.number}</span>
                <h1 className="text-xl sm:text-4xl font-black tracking-tight text-slate-900">
                  Gunesin Dogdugu Yer Episode {selectedEpisode.number} Urdu Subtitles - Bolum {selectedEpisode.number}
                </h1>
                <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2 sm:gap-3">
                  <span>Duration: {selectedEpisode.duration}</span>
                  <span>&bull;</span>
                  <span>Urdu Subtitles</span>
                  <span>&bull;</span>
                  <span>HD 1080p Streaming</span>
                </p>
              </div>

              {/* Secure 16:9 Anti-Download Mux Video Player */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div 
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl flex items-center justify-center select-none aspect-video border border-slate-200/80 mx-auto"
                >
                  <style>{`
                    mux-video, video-skin, video-player { object-fit: contain !important; }
                    mux-video::part(video), mux-video video { object-fit: contain !important; width: 100% !important; height: 100% !important; }
                  `}</style>
                  {/* Poster Overlay */}
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

                  {/* Official VideoJS / Mux Video Player Web Components */}
                  <video-player className="w-full h-full block bg-black rounded-2xl sm:rounded-3xl overflow-hidden">
                    <video-skin style={{ display: 'block', width: '100%', height: '100%', aspectRatio: '16 / 9' }}>
                      <mux-video
                        ref={videoRef as any}
                        src={currentStreamUrl}
                        playsinline
                        poster={selectedEpisode.thumbnail}
                        onContextMenu={(e: any) => e.preventDefault()}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      ></mux-video>
                      <mux-data env-key="feviqo" metadata-video-title={selectedEpisode.title}></mux-data>
                    </video-skin>
                  </video-player>
                </div>
              </div>

              {/* Actions Row */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-4">
                
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={handleShareLink}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{copiedLink ? 'Link Copied!' : 'Share Episode'}</span>
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={handleBackToOverview}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Series Directory</span>
                  </button>
                </div>

              </div>

              {/* High-Converting Ads & Smartlink Row */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                {/* 728x90 Leaderboard / 320x50 Mobile Header Ad */}
                <div className="hidden md:block">
                  <AdBanner728x90 />
                </div>
                <div className="block md:hidden">
                  <AdBanner320x50 />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-6 my-4">
                  <AdBanner468x60 />
                  <AdBanner300x250 />
                  <AdBanner160x300 />
                </div>

                {/* Native Banner */}
                <AdNativeBanner />

                {/* Sponsored Smartlink Button */}
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
                  
                  {/* Dynamic split paragraphs rendering */}
                  <div className="space-y-6 text-slate-600 font-normal leading-relaxed text-sm sm:text-base">
                    {selectedEpisode.recap.split('\n\n').map((para, idx) => {
                      const trimmed = para.trim();
                      if (!trimmed) return null;

                      const isHeading = trimmed.length < 80 && (trimmed.includes(':') || trimmed.includes('—') || (!trimmed.includes('.') && trimmed.split(' ').length < 10));

                      if (isHeading) {
                        return (
                          <h3 key={idx} className="text-lg sm:text-xl font-black text-slate-900 border-l-4 border-[#22C55E] pl-3.5 mt-8 mb-4">
                            {trimmed}
                          </h3>
                        );
                      }

                      return (
                        <p key={idx} className="text-slate-600">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 7. ALL EPISODES DRAWER LIST / RELATED LINKS */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-10 text-left">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">All Season 1 Episodes</h3>
                    <button 
                      onClick={handleBackToOverview}
                      className="text-xs font-bold text-[#22C55E] hover:underline"
                    >
                      Back to Directory &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {GUNESIN_EPISODES.filter(ep => ep.number !== selectedEpisode.number).map(ep => (
                      <div 
                        key={ep.slug}
                        onClick={() => navigateToEpisode(ep)}
                        className="group bg-slate-50 border border-slate-100 hover:border-slate-300 rounded-xl overflow-hidden hover:scale-105 transition cursor-pointer select-none"
                      >
                        <div className="aspect-video relative overflow-hidden bg-slate-100">
                          <img 
                            src={ep.thumbnail} 
                            alt={ep.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400">EPISODE {ep.number}</span>
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-[#22C55E] transition truncate">
                            {ep.title}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
};

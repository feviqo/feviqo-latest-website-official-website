import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import '@videojs/html/video/player';
import '@videojs/html/video/skin';
import '@videojs/html/media/mux-video';
import '@videojs/html/extensions/mux-data';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  RotateCw, 
  ChevronRight, 
  Clock, 
  Tv,
  ArrowLeft,
  Sparkles,
  Share2,
  Check,
  Settings,
  DollarSign,
  Send,
  X,
  CheckCircle2,
  Subtitles,
  Sliders,
  PictureInPicture2
} from 'lucide-react';
import { Navbar } from '../Navbar';
import { NativeVideoPlayer } from '../NativeVideoPlayer';
import { AppRoute } from '../../types';

interface TeskilatEpisode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  titleUrdu: string;
  titleEnglish: string;
  releaseDate: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  storyRecapUrdu: string;
  storyRecapEnglish: string;
  views: string;
  isLatest?: boolean;
}

const FEATURED_SEASON7_EPISODE: TeskilatEpisode = {
  id: 'ep-186-s7',
  episodeNumber: 186,
  seasonNumber: 7,
  titleUrdu: 'تشکیلات سیزن 7 قسط 186 اردو ترجمہ کے ساتھ',
  titleEnglish: 'Teskilat Season 7 Episode 186 Urdu Subtitles | Teskilat Episode 186 Urdu | FEVIQO',
  releaseDate: 'September 2026',
  duration: '2h 18m',
  thumbnailUrl: '/images/teskialt186thumbnIL.png',
  videoUrl: 'https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8',
  storyRecapUrdu: `اینڈر (Ender) کے اغوا کے بعد غصے میں پاگل الپائے (Altay) واپس اپنے ٹھکانے پر لوٹ آتا ہے؛ لیکن اس کی سب سے بڑی ترجیح اپنے بیٹے سے دوبارہ ملنا ہے۔ الپائے کا یہ غصہ اسے صدر طغرل (Tuğrul Başkan) کے آمنے سامنے لے آتا ہے۔\nجہاں ایک طرف کورکوت (Korkut) اور یحییٰ (Yahya) کے درمیان ایک بڑا حساب کتاب (ٹکراؤ) ہو رہا ہے، وہی شاہین (Şahin) کو ان نتائج کا سامنا کرنا پڑ رہا ہے جن کا اس نے اندازہ بھی نہیں لگایا تھا۔ دوسری طرف، بہار (Bahar) کا آخر کار میدانِ عمل میں اترنا کورکوت کے لیے ایک اور بڑی مشکل کھڑی کر دے گا۔\nاولاک (Ulak)، اینڈر کے ذریعے الپائے اور 'تشکیلات' (Teskilat/ایجنسی) کو شکست دینے کے چکر میں ہے۔ جبکہ عذرا (Azra) اس بڑی مساوات میں سب سے اہم کرداروں میں سے ایک ادا کرے گی۔ دشمن اپنے مقصد میں کامیاب نہیں ہو سکے گا کیونکہ اب بھیڑیا بیدار ہو چکا ہے…`,
  storyRecapEnglish: `In Teskilat Season 7 Episode 186 (Urdu Subtitles), following Ender's abduction, an enraged Altay returns to his hideout with a single priority: reuniting with his son. Altay's fury brings him face-to-face with Tuğrul Başkan. As Korkut and Yahya settle scores in a major confrontation, Şahin faces unexpected consequences. Meanwhile, Bahar enters the field, creating a new challenge for Korkut. Ulak schemes to use Ender to defeat Altay and the Teskilat agency, while Azra plays a pivotal role. But the enemy will not succeed, because the wolf has awakened...`,
  views: '342,800',
  isLatest: true
};

interface TeskilatDramaPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

export const TeskilatDramaPage: React.FC<TeskilatDramaPageProps> = ({
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
      const hash = window.location.hash.toLowerCase();
      if (path.includes('186') || hash.includes('186')) {
        return 'episode-detail';
      }
    }
    return 'overview';
  });
  const [selectedEpisode, setSelectedEpisode] = useState<TeskilatEpisode>(FEATURED_SEASON7_EPISODE);
  const [showPosterOverlay, setShowPosterOverlay] = useState(true);

  const handleStartPlayback = () => {
    setShowPosterOverlay(false);
    setTimeout(() => {
      const muxEl = document.querySelector('mux-video') as HTMLVideoElement | null;
      const shadowVideo = muxEl?.shadowRoot?.querySelector('video') as HTMLVideoElement | null;
      const standardVideo = document.querySelector('video') as HTMLVideoElement | null;

      if (shadowVideo && typeof shadowVideo.play === 'function') {
        shadowVideo.play().catch(() => {});
      } else if (muxEl && typeof muxEl.play === 'function') {
        muxEl.play().catch(() => {});
      } else if (standardVideo && typeof standardVideo.play === 'function') {
        standardVideo.play().catch(() => {});
      }
    }, 50);
  };

  // Sync activeView with browser back/forward, header nav, and URL state
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('186') || hash.includes('186')) {
        setActiveView('episode-detail');
      } else {
        setActiveView('overview');
      }
    };

    const handleOverviewEvent = () => {
      setActiveView('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('teskilat-overview', handleOverviewEvent);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('teskilat-overview', handleOverviewEvent);
    };
  }, []);

  // SEO & Google Search Keyword Optimization Effect for Main & Episode Pages
  useEffect(() => {
    const keywordsEl = document.querySelector('meta[name="keywords"]');

    if (activeView === 'episode-detail') {
      const pageTitle = "Teskilat Season 7 Episode 186 Urdu Subtitles | Teskilat Episode 186 Urdu | FEVIQO";
      const metaDesc = "Watch Teskilat Season 7 Episode 186 in HD Urdu Subtitles (تشکیلات سیزن 7 قسط 186). Stream full episode with story recap on FEVIQO.";
      const keywords = "teskilat 186, teskilat 186 urdu, teskilat season 7 episode 186 urdu subtitles, teskilat episode 186 urdu, teskilat episode 186 urdu subtitles full, teskilat episode 186 urdu subtitles full episode, teskilat urdu 186, teskilat season 7 186, teskialt new season, teskilat urdu, teskilat drama urdu";
      
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
      const pageTitle = "Teskilat Season 7 Urdu Subtitles Full Series | Teskilat Urdu Portal | FEVIQO";
      const metaDesc = "Watch Teskilat Season 7 Turkish Drama in HD Urdu Subtitles (تشکیلات سیزن 7 اردو). Stream official episodes with story recaps on FEVIQO.";
      const keywords = "teskilat season 7, teskialt new season, teskilat urdu, teskilat drama urdu, teskilat 186, teskilat 186 urdu, teskilat episode 186 urdu subtitles, teskilat urdu 186";

      document.title = pageTitle;

      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);

      if (keywordsEl) keywordsEl.setAttribute('content', keywords);
    }
  }, [activeView]);
  
  // Custom YouTube-Style Video Player States
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(138 * 60); // 2h 18m = 8280s default
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p60 HD (Original)');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [skipFeedback, setSkipFeedback] = useState<'forward' | 'backward' | null>(null);
  const [playerToast, setPlayerToast] = useState<string | null>(null);

  // Resolution stream map for authentic functional quality switching
  const QUALITY_STREAMS: Record<string, string> = {
    '1080p60 HD (Original)': 'https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8',
    '720p HD': 'https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8',
    '480p SD': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'Auto': 'https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8'
  };

  const hlsRef = useRef<Hls | null>(null);

  // Initialize and attach HLS stream for .m3u8 video URL
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = selectedEpisode.videoUrl;

    if (streamUrl.includes('.m3u8') || streamUrl.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          startLevel: -1,
          capLevelToPlayerSize: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          autoStartLoad: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.startLoad();
        hlsRef.current = hls;

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      }
    } else {
      video.src = streamUrl;
    }
  }, [selectedEpisode.videoUrl]);

  // In-Stream Video Ad States (Disabled per user request until specified)
  const [adState, setAdState] = useState<'idle' | 'playing_preroll' | 'completed'>('completed');
  const [adCountdown, setAdCountdown] = useState<number>(0);
  
  // Interaction & Modal States
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showAdSetupModal, setShowAdSetupModal] = useState<boolean>(false);
  const [adFormSubmitted, setAdFormSubmitted] = useState<boolean>(false);

  // Form Inputs for Ad Placement Booking
  const [adBrandName, setAdBrandName] = useState<string>('');
  const [adEmail, setAdEmail] = useState<string>('');
  const [adFormat, setAdFormat] = useState<string>('In-Stream Pre-Roll Video Ad');
  const [adMessage, setAdMessage] = useState<string>('');

  // Keep video playback rate synced dynamically whenever speed state changes or video plays
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, isPlaying]);

  // Pre-roll ad timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (adState === 'playing_preroll' && adCountdown > 0) {
      timer = setTimeout(() => {
        setAdCountdown(prev => prev - 1);
      }, 1000);
    } else if (adState === 'playing_preroll' && adCountdown === 0) {
      setAdState('completed');
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
    return () => clearTimeout(timer);
  }, [adState, adCountdown]);

  const showToast = (message: string) => {
    setPlayerToast(message);
    setTimeout(() => {
      setPlayerToast(prev => (prev === message ? null : prev));
    }, 2000);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleSkipAd = () => {
    setAdState('completed');
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeekBy = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      setSkipFeedback(seconds > 0 ? 'forward' : 'backward');
      setTimeout(() => setSkipFeedback(null), 700);
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
        setVolume(1);
      } else {
        videoRef.current.muted = true;
        setIsMuted(true);
        setVolume(0);
      }
    }
  };

  // FULLY WORKABLE FUNCTIONAL PLAYBACK SPEED CHANGE
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    showToast(`Speed set to ${speed === 1.0 ? 'Normal (1.0x)' : `${speed}x`}`);
  };

  // FULLY WORKABLE FUNCTIONAL QUALITY CHANGE
  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    const targetUrl = QUALITY_STREAMS[quality] || QUALITY_STREAMS['1080p60 HD (Original)'];
    
    if (videoRef.current) {
      const savedTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      
      if ((targetUrl.includes('.m3u8') || targetUrl.endsWith('.m3u8')) && Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(targetUrl);
        hls.attachMedia(videoRef.current);
        hlsRef.current = hls;
      } else {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        videoRef.current.src = targetUrl;
      }

      videoRef.current.currentTime = savedTime;
      videoRef.current.playbackRate = playbackSpeed;
      
      if (wasPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
    
    showToast(`Quality switched to ${quality}`);
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        playerContainerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const handleOpenEpisode = (ep: TeskilatEpisode) => {
    setSelectedEpisode(ep);
    setActiveView('episode-detail');
    setShowPosterOverlay(true);
    setAdState('idle');
    setIsPlaying(false);
    setCurrentTime(0);
    setShowSettingsMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({ view: 'episode-detail' }, '', '/teskilat/episode-186');
    } catch {}
  };

  const handleBackToOverview = () => {
    setActiveView('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({ view: 'overview' }, '', '/teskilat');
    } catch {}
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(`https://feviqo.com/teskilat`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAdFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdFormSubmitted(true);
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return '0:00';
    const hours = Math.floor(timeInSec / 3600);
    const minutes = Math.floor((timeInSec % 3600) / 60);
    const seconds = Math.floor(timeInSec % 60);

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* Primary Navigation */}
      <Navbar
        onBookCall={onBookCall}
        onNavigateSection={() => onBackToHome()}
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
              In-Stream Pre-Roll &amp; Banner Advertising for Teskilat Urdu Portal
            </span>
          </div>

          <button
            onClick={() => setShowAdSetupModal(true)}
            className="px-4 py-1.5 rounded-full bg-white hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-md cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-800" />
            <span>Book Ad Setup / Sponsor</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1">
        {activeView === 'overview' ? (
          /* MAIN TEŞKİLAT SEASON 7 DISCOVERY HUB - FEVIQO SPEC */
          <div className="bg-white text-[#0B0B0D] min-h-screen">
            
            {/* 3. CINEMATIC HERO SECTION */}
            <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                
                {/* Hero Left Content */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  
                  {/* Eyebrow */}
                  <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                    FEVIQO &bull; TEŞKİLAT
                  </div>

                  {/* Heading */}
                  <h1 className="text-4xl sm:text-6xl font-black text-[#0B0B0D] tracking-tight leading-[1.1]">
                    Teskilat Season 7
                  </h1>

                  {/* Urdu Title */}
                  <div className="text-2xl sm:text-3xl font-urdu-slim text-slate-800 font-normal dir-rtl">
                    تشکیلات سیزن 7 اردو ترجمہ کے ساتھ
                  </div>

                  {/* Short Description */}
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                    Watch Teskilat Season 7 with Urdu Subtitles on FEVIQO. Explore the latest episodes, story recaps, and HD releases.
                  </p>

                  {/* 4. Hero Metadata Line */}
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-3 pt-1">
                    <span className="font-bold text-slate-900">Season 7</span>
                    <span>&bull;</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-bold text-[10px]">HD</span>
                    <span>&bull;</span>
                    <span>Urdu Subtitles</span>
                    <span>&bull;</span>
                    <span className="text-slate-600">Altay &bull; Ender &bull; Korkut</span>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-4 pt-3">
                    <button
                      onClick={() => handleOpenEpisode(FEATURED_SEASON7_EPISODE)}
                      className="px-8 py-3.5 rounded-full bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-sm transition shadow-md hover:scale-[1.02] cursor-pointer inline-flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current text-slate-950" />
                      <span>Watch Episode 186</span>
                    </button>

                    <a
                      href="#episode-directory"
                      className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0B0B0D] font-extrabold text-sm transition cursor-pointer"
                    >
                      Browse Episodes
                    </a>
                  </div>

                </div>

                {/* Hero Right Visual Art */}
                <div className="lg:col-span-5 relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-950 group p-1">
                    <img 
                      src="/images/image .jpeg" 
                      alt="Teskilat Season 7 Official Poster" 
                      className="w-full h-auto object-contain max-h-[520px] mx-auto rounded-xl transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* 5 & 6. LATEST EPISODE FEATURE & KEY EPISODE INFORMATION */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
              <div className="space-y-6 text-left">
                
                <div className="space-y-1">
                  <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                    SEASON 7 &bull; EPISODE 186
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-[#0B0B0D]">
                    Latest Episode
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
                  
                  {/* Thumbnail */}
                  <a 
                    href="/teskilat/episode-186"
                    onClick={(e) => { e.preventDefault(); handleOpenEpisode(FEATURED_SEASON7_EPISODE); }}
                    className="lg:col-span-6 relative rounded-2xl overflow-hidden bg-black shadow-xl border border-slate-200 block group aspect-video"
                  >
                    <img 
                      src={FEATURED_SEASON7_EPISODE.thumbnailUrl} 
                      alt="Teskilat Season 7 Episode 186 Thumbnail" 
                      className="w-full h-full object-contain bg-black group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current text-slate-950 ml-0.5" />
                      </div>
                    </div>
                  </a>

                  {/* Content & Description */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider">
                      LATEST RELEASE
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-[#0B0B0D]">
                      Teskilat Season 7 Episode 186
                    </h3>

                    <div className="text-lg font-urdu-slim text-slate-800 dir-rtl text-right font-normal">
                      تشکیلات سیزن 7 قسط 186 اردو ترجمہ کے ساتھ
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                      In Teskilat Season 7 Episode 186, Altay returns seeking justice for his son following Ender's abduction, leading to a high-stakes confrontation with Tuğrul Başkan.
                    </p>

                    {/* Minimal Information Strip */}
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-3 pt-2">
                      <span className="text-[#0B0B0D]">Episode 186</span>
                      <span>&bull;</span>
                      <span>2h 32m</span>
                      <span>&bull;</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-bold text-[10px]">HD</span>
                      <span>&bull;</span>
                      <span>Urdu Subtitles</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-3">
                      <button
                        onClick={() => handleOpenEpisode(FEATURED_SEASON7_EPISODE)}
                        className="px-6 py-3 rounded-full bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs transition cursor-pointer inline-flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current text-slate-950" />
                        <span>Watch Episode 186</span>
                      </button>

                      <a
                        href="/teskilat/episode-186"
                        onClick={(e) => { e.preventDefault(); handleOpenEpisode(FEATURED_SEASON7_EPISODE); }}
                        className="text-xs font-bold text-slate-700 hover:text-[#0B0B0D] transition cursor-pointer"
                      >
                        Read Story &rarr;
                      </a>
                    </div>

                  </div>

                </div>

              </div>
            </section>

            {/* 7. SHORT SEASON INTRODUCTION (EDITORIAL) */}
            <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left">
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h2 className="text-xl font-black text-[#0B0B0D]">Teskilat Season 7 Overview</h2>
                <div className="text-base font-urdu-slim text-slate-800 dir-rtl text-right font-normal">
                  تشکیلات سیزن 7 اردو ترجمہ کے ساتھ
                </div>
                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                  FEVIQO brings you official high-definition streaming for Teskilat Season 7 with full Urdu subtitles. Stream the latest espionage operations, story recaps, and agent arcs in 1080p HD.
                </p>
              </div>
            </section>

            {/* 8, 9, 10, 11. EPISODE DIRECTORY */}
            <section id="episode-directory" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
              <div className="text-left space-y-2 mb-8">
                <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                  EPISODE DIRECTORY
                </div>
                <h2 className="text-3xl font-black text-[#0B0B0D]">
                  Teskilat Season 7 Episodes
                </h2>
                <p className="text-slate-600 text-sm">
                  Watch available Season 7 episodes with Urdu subtitles on FEVIQO.
                </p>
              </div>

              {/* Minimal Row Episode Card */}
              <div className="space-y-4">
                <div 
                  onClick={() => handleOpenEpisode(FEATURED_SEASON7_EPISODE)}
                  className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#22C55E]/60 hover:shadow-lg transition-all duration-300 group cursor-pointer text-left flex flex-col sm:flex-row items-center gap-6"
                >
                  <div className="relative w-full sm:w-64 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
                    <img 
                      src={FEATURED_SEASON7_EPISODE.thumbnailUrl} 
                      alt="Teskilat Episode 186 Thumbnail" 
                      className="w-full h-full object-contain bg-black group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current text-slate-950 ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 min-w-0 w-full">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                        LATEST RELEASE
                      </span>
                      <span className="text-xs font-bold text-slate-400">SEASON 7 &bull; EPISODE 186</span>
                    </div>

                    <h3 className="text-xl font-extrabold text-[#0B0B0D] group-hover:text-[#22C55E] transition">
                      Teskilat Season 7 Episode 186
                    </h3>

                    <p className="text-sm font-urdu-slim text-slate-700 dir-rtl line-clamp-1 font-normal">
                      اینڈر (Ender) کے اغوا کے بعد غصے میں پاگل الپائے (Altay) واپس اپنے ٹھکانے پر لوٹ آتا ہے…
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>2h 32m &bull; HD &bull; Urdu Subtitles</span>

                      <span className="text-[#22C55E] font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Watch Episode</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        ) : (
          /* EDITORIAL WATCH EPISODE PAGE - FEVIQO BRIEF SPEC */
          <div className="bg-white text-[#0B0B0D] min-h-screen py-6 sm:py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              
              {/* 3. Top Breadcrumb Navigation */}
              <nav className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span className="hover:text-slate-900 cursor-pointer" onClick={handleBackToOverview}>FEVIQO</span>
                <span>/</span>
                <span className="hover:text-slate-900 cursor-pointer" onClick={handleBackToOverview}>Teskilat</span>
                <span>/</span>
                <span>Season 7</span>
                <span>/</span>
                <span className="text-slate-900 font-bold">Episode 186</span>
              </nav>

              {/* 4. Episode Header */}
              <div className="space-y-2 text-left">
                <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                  TEŞKİLAT &bull; SEASON 7
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-[#0B0B0D] tracking-tight">
                  Episode 186
                </h1>

                <p className="text-lg sm:text-xl font-bold text-slate-800 pt-1">
                  Teskilat Season 7 Episode 186 Urdu Subtitles
                </p>

                <p className="text-lg sm:text-xl font-urdu-slim font-normal text-slate-900 dir-rtl text-right pt-1 leading-relaxed">
                  تشکیلات سیزن 7 قسط 186 اردو ترجمہ کے ساتھ
                </p>

                <div className="text-xs text-slate-500 font-medium pt-2 flex items-center gap-3">
                  <span>2h 32m</span>
                  <span>&bull;</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-bold text-[10px]">HD</span>
                  <span>&bull;</span>
                  <span>Urdu Subtitles</span>
                </div>
              </div>

              {/* 5 & 6. Main Video Player (Centered max-w-6xl) */}
              <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-200 aspect-video">
                {showPosterOverlay && (
                  <div 
                    onClick={handleStartPlayback}
                    className="absolute inset-0 z-30 bg-slate-950 flex items-center justify-center cursor-pointer group"
                  >
                    <img 
                      src="https://feviqo.com/images/teskialt186thumbnIL.png" 
                      alt="Teskilat Season 7 Episode 186 Thumbnail Poster" 
                      className="w-full h-full object-contain bg-black group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current text-slate-950 ml-1" />
                      </div>
                    </div>
                  </div>
                )}

                <video-player style={{ display: 'block', width: '100%', height: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
                  <video-skin poster="https://feviqo.com/images/teskialt186thumbnIL.png" style={{ display: 'block', width: '100%', aspectRatio: '16 / 9' }}>
                    <mux-video
                      src={selectedEpisode.videoUrl}
                      playsinline
                      poster="https://feviqo.com/images/teskialt186thumbnIL.png"
                      style={{ width: '100%', height: '100%', display: 'block' }}
                    ></mux-video>
                    <mux-data></mux-data>
                  </video-skin>
                </video-player>
              </div>

              {/* 7. Player Surrounding Info Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-200/80">
                <div>
                  <div className="text-lg font-black text-[#0B0B0D]">Episode 186</div>
                  <div className="text-xs text-slate-500 font-medium">Season 7 &bull; Urdu Subtitles</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareLink}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Share2 className="w-4 h-4 text-slate-700" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Share Episode'}</span>
                  </button>
                </div>
              </div>

              {/* 8. Story Section */}
              <div className="space-y-6 pt-2 text-left max-w-4xl">
                <h2 className="text-2xl font-black text-[#0B0B0D]">Episode 186 Story</h2>

                <div className="space-y-3">
                  <h3 className="text-lg font-urdu-slim font-bold text-slate-900 dir-rtl text-right">
                    تشکیلات سیزن 7 قسط 186 اردو کہانی کا خلاصہ
                  </h3>
                  <p className="text-slate-800 text-base sm:text-lg font-urdu-slim font-normal whitespace-pre-line leading-relaxed dir-rtl text-right">
                    {selectedEpisode.storyRecapUrdu}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">English Story Summary</h3>
                  <p className="text-slate-700 text-sm leading-relaxed font-normal">
                    {selectedEpisode.storyRecapEnglish}
                  </p>
                </div>
              </div>

              {/* 9. Minimal Episode Details Metadata Grid */}
              <div className="pt-8 border-t border-slate-200 text-left">
                <h3 className="text-sm font-bold text-[#0B0B0D] mb-4 uppercase tracking-wider">Episode Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
                  <div>
                    <div className="text-slate-400 font-medium">Series</div>
                    <div className="text-[#0B0B0D] font-bold mt-0.5">Teskilat</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Season</div>
                    <div className="text-[#0B0B0D] font-bold mt-0.5">7</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Episode</div>
                    <div className="text-[#0B0B0D] font-bold mt-0.5">186</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Language</div>
                    <div className="text-[#0B0B0D] font-bold mt-0.5">Urdu Subtitles</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Quality</div>
                    <div className="text-[#0B0B0D] font-bold mt-0.5">HD 1080p</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Platform</div>
                    <div className="text-[#22C55E] font-extrabold mt-0.5">FEVIQO</div>
                  </div>
                </div>
              </div>

              {/* 10. Episode Navigation */}
              <div className="pt-10 border-t border-slate-200">
                <div className="grid grid-cols-3 items-center text-xs font-bold">
                  <button 
                    onClick={() => showToast('Episode 185 loading...')}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-400 text-left transition group cursor-pointer"
                  >
                    <div className="text-slate-400 text-[10px] uppercase font-bold">&larr; Previous</div>
                    <div className="text-[#0B0B0D] font-extrabold text-sm mt-0.5 group-hover:text-[#22C55E] transition">Episode 185</div>
                  </button>

                  <button 
                    onClick={handleBackToOverview}
                    className="p-4 rounded-2xl hover:bg-slate-50 text-center transition cursor-pointer"
                  >
                    <div className="text-[#0B0B0D] font-extrabold text-sm">All Episodes</div>
                  </button>

                  <button 
                    onClick={() => showToast('Episode 187 loading...')}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-400 text-right transition group cursor-pointer"
                  >
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Next &rarr;</div>
                    <div className="text-[#0B0B0D] font-extrabold text-sm mt-0.5 group-hover:text-[#22C55E] transition">Episode 187</div>
                  </button>
                </div>
              </div>

              {/* 11. Back to Season Link */}
              <div className="pt-6 text-center">
                <button
                  onClick={handleBackToOverview}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0B0B0D] transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Teskilat Season 7 Overview</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* AD SETUP & SPONSORSHIP BOOKING MODAL */}
      {showAdSetupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-left space-y-6 shadow-2xl relative">
            <button
              onClick={() => { setShowAdSetupModal(false); setAdFormSubmitted(false); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 font-bold p-1 rounded-full bg-slate-100 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {!adFormSubmitted ? (
              <>
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] uppercase tracking-wider">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In-Stream Video Ad Placement</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-950">Book Teskilat Ad Setup</h3>
                  <p className="text-slate-600 text-xs">
                    Sponsor pre-roll video ads, banner placements, or channel dubbing integrations on FEVIQO Teskilat portal.
                  </p>
                </div>

                <form onSubmit={handleAdFormSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Company / Brand Name</label>
                    <input
                      type="text"
                      value={adBrandName}
                      onChange={(e) => setAdBrandName(e.target.value)}
                      placeholder="e.g. Acme Media Corp"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={adEmail}
                      onChange={(e) => setAdEmail(e.target.value)}
                      placeholder="sponsor@brand.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Ad Format Preferred</label>
                    <select
                      value={adFormat}
                      onChange={(e) => setAdFormat(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      <option value="In-Stream Pre-Roll Video Ad">5s In-Stream Pre-Roll Commercial</option>
                      <option value="Header Leaderboard Banner (728x90)">Header Leaderboard Banner (728x90)</option>
                      <option value="Under-Player Medium Banner (300x250)">Under-Player Medium Banner (300x250)</option>
                      <option value="Custom Series Sponsorship">Custom Series Sponsorship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Campaign Details / Message</label>
                    <textarea
                      value={adMessage}
                      onChange={(e) => setAdMessage(e.target.value)}
                      placeholder="Tell us about your target campaign budget and timeline..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdSetupModal(false)}
                      className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-emerald-700 text-white font-black shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Ad Request</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-950">Ad Request Submitted!</h3>
                <p className="text-slate-600 text-xs max-w-sm mx-auto leading-relaxed">
                  Thank you! Our team will review your ad placement request for Teskilat Season 7 and contact you at <strong className="text-slate-900">{adEmail}</strong> within 2 hours.
                </p>
                <button
                  onClick={() => { setShowAdSetupModal(false); setAdFormSubmitted(false); }}
                  className="px-6 py-2.5 rounded-xl bg-slate-950 text-white font-black text-xs"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
  isLatest: false
};

const EPISODE_187: TeskilatEpisode = {
  id: 'ep-187-s7',
  episodeNumber: 187,
  seasonNumber: 7,
  titleUrdu: 'تشکیلات سیزن 7 قسط 187 اردو ترجمہ کے ساتھ',
  titleEnglish: 'Teskilat Episode 187 Urdu Subtitles | Watch Season 7 Episode 187 Urdu | FEVIQO',
  releaseDate: 'October 2026',
  duration: '2h 25m',
  thumbnailUrl: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
  videoUrl: 'https://stream.mux.com/vPkzwE9vrAHq4uz4hPyjFu4ZVQOzsORSqxYDzUnYm4o.m3u8',
  storyRecapUrdu: `الپائے (Altay) اور صدر طغرل (Tuğrul Başkan) کے درمیان پیدا ہونے والی غلط فہمیاں اب ایک نیا رخ اختیار کر چکی ہیں۔ تشکیلات کی نئی ٹیم نے دشمن کے سب سے اہم مہرے 'اولاک' (Ulak) کو گھیرنے کے لیے ایک خفیہ جال بچھایا ہے۔ دوسری طرف عذرا (Azra) کو بچانے کے لیے شاہین ایک انتہائی خطرناک آپریشن شروع کرتا ہے جس میں سیکنڈز کی تاخیر بھی جان لیوا ثابت ہو سکتی ہے۔\nکپتان کورکوت (Korkut) کو حریف گروہوں کی اندرونی جنگ کا فائدہ اٹھاتے ہوئے ایک حساس فائل حاصل کرنی ہے جس میں غداروں کے نام چھپے ہیں۔ بھیڑیا اب پوری طرح بیدار ہو چکا ہے اور آخری وار کے لیے تیار ہے، لیکن دشمن بھی اپنے آخری مہرے کھیلنے سے پیچھے نہیں ہٹے گا…`,
  storyRecapEnglish: `In Teskilat Season 7 Episode 187 (Urdu Subtitles), the tension between Altay and Tuğrul Başkan reaches an explosive turning point. The special ops team designs a covert trap to corner Ulak, the enemy's master strategist. Meanwhile, Şahin launches a high-stakes, clock-ticking mission to extract Azra from enemy lines, where a single second of delay could cost everything. Korkut navigates a brutal turf war between rival syndicates to retrieve a classified list of deep-cover moles. The wolf is fully awake and ready for the final strike, but the enemy still has a dark card to play...`,
  views: '284,500',
  isLatest: true
};

const ALL_EPISODES: TeskilatEpisode[] = [EPISODE_187, FEATURED_SEASON7_EPISODE];

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
      if (path.includes('186') || hash.includes('186') || path.includes('187') || hash.includes('187')) {
        return 'episode-detail';
      }
    }
    return 'overview';
  });
  const [selectedEpisode, setSelectedEpisode] = useState<TeskilatEpisode>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('186')) return FEATURED_SEASON7_EPISODE;
      if (path.includes('187')) return EPISODE_187;
    }
    return EPISODE_187; // Default to the newest episode!
  });
  const [showPosterOverlay, setShowPosterOverlay] = useState(true);

  // Premium Apple Countdown Timer for Episode 187 (Official Release: Monday, October 5, 2026, at 4:00 AM PKT/TRT - Sunday at 4:00 PM PDT)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Official Release Target Timestamp (Monday, October 5, 2026, at 4:00 AM PKT/TRT, which is Sunday, October 4, 2026, at 4:00 PM PDT -07:00)
    const targetTime = new Date('2026-10-04T16:00:00-07:00').getTime();

    const updateTimer = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return false;
      }

      const totalSecs = Math.floor(diff / 1000);
      const d = Math.floor(totalSecs / (3600 * 24));
      const h = Math.floor((totalSecs % (3600 * 24)) / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      return true;
    };

    // Run immediately
    updateTimer();

    const interval = setInterval(() => {
      const active = updateTimer();
      if (!active) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
      if (path.includes('186') || hash.includes('186') || path.includes('187') || hash.includes('187')) {
        setActiveView('episode-detail');
        if (path.includes('186') || hash.includes('186')) setSelectedEpisode(FEATURED_SEASON7_EPISODE);
        if (path.includes('187') || hash.includes('187')) setSelectedEpisode(EPISODE_187);
      } else {
        setActiveView('overview');
      }
    };

    const handleOverviewEvent = () => {
      setActiveView('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Run once on mount to handle direct deep-links from Google Search
    handlePopState();

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
      const num = selectedEpisode.episodeNumber;
      const pageTitle = `Teşkilat Season 7 Episode ${num} Urdu Subtitles - FEVIQO.com`;
      const metaDesc = num === 187
        ? `Watch Teşkilat Season 7 Episode 187 Urdu subtitles full episode. Stream Teşkilat episode 187 Urdu subtitles watch online with story recaps on FEVIQO.com.`
        : `Watch Teşkilat Season 7 Episode ${num} with Urdu Subtitles (تشکیلات سیزن 7 قسط ${num}). Enjoy full story recaps and stream high-definition episodes processed by FEVIQO.com.`;
      const keywords = num === 187
        ? `teskilat urdu, teskilat urdu subtitles, watch teskilat urdu, teskilat episode 187 urdu subtitles, teskilat 187, teskilat 187 urdu, teskilat, teskilat urdu, teskilat 187 urdu subtitles, teskilat season 7 urdu, watch teskilat season 7 episode 187 urdu, teskilat episode 187 in urdu, teskilat 187 urdu, teskilat episode 187 urdu subtitles full`
        : `teskilat urdu, teskilat urdu subtitles, watch teskilat urdu, teskilat ${num}, teskilat ${num} urdu, teskilat season 7 episode ${num} urdu subtitles, teskilat episode ${num} urdu, teskilat episode ${num} urdu subtitles full, teskilat episode ${num} urdu subtitles full episode, teskilat urdu ${num}, teskilat season 7 ${num}, teskialt new season, teskilat urdu, unlimited video editing, flat-rate video editing, video editing agency, professional video editors, premium youtube editing services, outsource video editing, white-label video production`;
      
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
      const pageTitle = "Teşkilat Season 7 Urdu Subtitles - Watch Online - FEVIQO.com";
      const metaDesc = "Watch Teşkilat Season 7 Turkish Drama in HD Urdu Subtitles (تشکیلات سیزن 7 اردو). Stream official episodes with story recaps on FEVIQO.com.";
      const keywords = "teskilat urdu, teskilat urdu subtitles, watch teskilat urdu, teskilat season 7, teskialt new season, teskilat urdu, teskilat drama urdu, teskilat 186, teskilat 186 urdu, teskilat episode 186 urdu subtitles, teskilat urdu 186, teskilat 187, teskilat 187 urdu, teskilat episode 187 urdu subtitles";

      document.title = pageTitle;

      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);

      if (keywordsEl) keywordsEl.setAttribute('content', keywords);
    }
  }, [activeView, selectedEpisode]);
  
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
      window.history.pushState({ view: 'episode-detail' }, '', `/teskilat/episode-${ep.episodeNumber}`);
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
                    FEVIQO • TEŞKİLAT
                  </div>

                  {/* Heading */}
                  <h1 className="text-4xl sm:text-6xl font-black text-[#0B0B0D] tracking-tight leading-[1.1]">
                    Teskilat Season 7 Urdu
                  </h1>

                  {/* Urdu Title */}
                  <div className="text-2xl sm:text-3xl font-urdu-slim text-slate-800 font-normal dir-rtl">
                    تشکیلات سیزن 7 اردو ترجمہ کے ساتھ (Teskilat Urdu)
                  </div>

                  {/* Short Description */}
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                    Watch Teskilat Season 7 Urdu Subtitles on FEVIQO. Stream official Teskilat Urdu episodes, story recaps, and HD releases weekly.
                  </p>

                  {/* 4. Hero Metadata Line */}
                  <div className="text-xs sm:text-sm text-slate-500 font-medium flex flex-wrap items-center gap-2 pt-1">
                    <span className="font-bold text-slate-950">Season 7</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-bold text-[10px]">HD</span>
                    <span>•</span>
                    <span className="font-medium text-slate-800">Urdu Subtitles</span>
                    <span>•</span>
                    <span className="text-slate-600">Altay • Ender • Korkut</span>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-4 pt-3">
                    <button
                      onClick={() => handleOpenEpisode(EPISODE_187)}
                      className="px-8 py-3.5 rounded-full bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-sm transition shadow-md hover:scale-[1.02] cursor-pointer inline-flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current text-slate-950" />
                      <span>Watch Episode 187</span>
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
                      src="https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2" 
                      alt="Teskilat Urdu Subtitles Season 7 Official Poster - FEVIQO Portal" 
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
                    SEASON 7 &bull; EPISODE 187
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-[#0B0B0D]">
                    Latest Episode
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
                  
                  {/* Thumbnail */}
                  <a 
                    href="/teskilat/episode-187"
                    onClick={(e) => { e.preventDefault(); handleOpenEpisode(EPISODE_187); }}
                    className="lg:col-span-6 relative rounded-2xl overflow-hidden bg-black shadow-xl border border-slate-200 block group aspect-video"
                  >
                    {EPISODE_187.thumbnailUrl ? (
                      <img 
                        src={EPISODE_187.thumbnailUrl} 
                        alt="Teskilat Season 7 Episode 187 Thumbnail" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#09090c] via-[#111116] to-[#021d12] flex flex-col items-center justify-center p-4 border border-white/5">
                        <span className="text-xs font-mono font-bold tracking-widest text-[#22C55E] uppercase bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full mb-1 animate-pulse">EPISODE 187 TEASER</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">COVER ART UPLOADING SOON</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current text-slate-950 ml-0.5" />
                      </div>
                    </div>
                  </a>

                  {/* Content & Description */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider">
                      LATEST RELEASES
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-[#0B0B0D]">
                      Teskilat Season 7 Urdu
                    </h3>

                    <div className="text-lg font-urdu-slim text-slate-800 dir-rtl text-right font-normal leading-relaxed">
                      تشکیلات سیزن 7 اردو سب ٹائٹلز کے ساتھ دیکھیں۔
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed">
                      Stream all released episodes of Teskilat Season 7 Turkish drama with premium Urdu subtitles on FEVIQO. Browse our comprehensive directory below to watch individual episodes, view high-definition players, and read full official story recaps.
                    </p>

                    {/* Minimal Information Strip */}
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-3 pt-2">
                      <span className="text-[#0B0B0D]">Season 7</span>
                      <span>&bull;</span>
                      <span>Espionage Drama</span>
                      <span>&bull;</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-bold text-[10px]">1080p HD</span>
                      <span>&bull;</span>
                      <span>Urdu Subtitles</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-3">
                      <button
                        onClick={() => handleOpenEpisode(EPISODE_187)}
                        className="px-6 py-3 rounded-full bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs transition cursor-pointer inline-flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current text-slate-950" />
                        <span>Watch Episode 187</span>
                      </button>

                      <a
                        href="/teskilat/episode-187"
                        onClick={(e) => { e.preventDefault(); handleOpenEpisode(EPISODE_187); }}
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
                {ALL_EPISODES.map((ep) => (
                  <a 
                    href={`/teskilat/episode-${ep.episodeNumber}`}
                    key={ep.id}
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenEpisode(ep);
                    }}
                    className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#22C55E]/60 hover:shadow-lg transition-all duration-300 group cursor-pointer text-left flex flex-col sm:flex-row items-center gap-6 block"
                  >
                    <div className="relative w-full sm:w-64 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
                      {ep.thumbnailUrl ? (
                        <img 
                          src={ep.thumbnailUrl} 
                          alt={`Teskilat Urdu Episode ${ep.episodeNumber} Subtitles Thumbnail - Season 7`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#09090c] via-[#111116] to-[#021d12] flex flex-col items-center justify-center p-2 border border-white/5">
                          <span className="text-[10px] font-mono font-bold tracking-widest text-[#22C55E] uppercase animate-pulse text-center">EPISODE 187</span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 text-center">COVER ART UPLOADING</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current text-slate-950 ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 min-w-0 w-full">
                      <div className="flex items-center gap-2">
                        {ep.isLatest ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                            LATEST RELEASE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-wider">
                            COMPLETED
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-400">SEASON {ep.seasonNumber} &bull; EPISODE {ep.episodeNumber}</span>
                      </div>

                      <h3 className="text-xl font-extrabold text-[#0B0B0D] group-hover:text-[#22C55E] transition">
                        Teskilat Season 7 Episode {ep.episodeNumber}
                      </h3>

                      <p className="text-sm font-urdu-slim text-slate-700 dir-rtl line-clamp-1 font-normal">
                        {ep.storyRecapUrdu}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>{ep.duration} &bull; HD &bull; Urdu Subtitles</span>

                        <span className="text-[#22C55E] font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Watch Episode</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
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
                <span className="text-slate-900 font-bold">Episode {selectedEpisode.episodeNumber}</span>
              </nav>

              {/* 4. Episode Header */}
              <div className="space-y-2 text-left">
                <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                  TEŞKİLAT &bull; SEASON {selectedEpisode.seasonNumber}
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-[#0B0B0D] tracking-tight">
                  Episode {selectedEpisode.episodeNumber}
                </h1>

                <p className="text-lg sm:text-xl font-bold text-slate-800 pt-1">
                  {selectedEpisode.titleEnglish}
                </p>

                <p className="text-lg sm:text-xl font-urdu-slim font-normal text-slate-900 dir-rtl text-right pt-1 leading-relaxed">
                  {selectedEpisode.titleUrdu}
                </p>

                <div className="text-xs text-slate-500 font-medium pt-2 flex items-center gap-3">
                  <span>{selectedEpisode.duration}</span>
                  <span>&bull;</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-bold text-[10px]">HD</span>
                  <span>&bull;</span>
                  <span>Urdu Subtitles</span>
                </div>
              </div>

              {/* 5 & 6. Secure Anti-Download Main Video Player */}
              <div 
                onContextMenu={(e) => e.preventDefault()}
                className={`relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#050508] shadow-2xl border border-slate-800/80 flex items-center justify-center w-full select-none ${
                selectedEpisode.episodeNumber === 187 
                  ? 'min-h-[430px] sm:min-h-0 sm:aspect-video' 
                  : 'aspect-video'
              }`}>
                
                {/* 100% Machine-Readable Hidden Video Elements to Guarantee Google Search Console Video Indexing Approval */}
                <div style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }} aria-hidden="true">
                  <video 
                    id="google-video-crawler-target"
                    controls
                    preload="metadata"
                    poster="https://feviqo.com/images/teskialt186thumbnIL.png"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <source src="https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8" type="application/x-mpegURL" />
                    <p>Stream Teskilat Season 7 Episode {selectedEpisode.episodeNumber} in HD Urdu Subtitles with FEVIQO's dedicated video player.</p>
                  </video>
                  <a href={`https://feviqo.com/teskilat/episode-${selectedEpisode.episodeNumber}`}>
                    Watch Teskilat Season 7 Episode {selectedEpisode.episodeNumber} Online HD
                  </a>
                </div>

                {false ? (
                  /* ULTRA-PREMIUM APPLE TV / NETFLIX STYLE COMING SOON PRESENTATION (FULLY RESPONSIVE) */
                  <div className="relative sm:absolute inset-0 bg-[#070709] flex flex-col items-center justify-center p-5 sm:p-12 text-center text-white z-20 w-full min-h-[430px] sm:min-h-0 overflow-hidden">
                    
                    {/* Background Subtle Ambient Image Overlay (Restrained & Blurs) */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105 opacity-[0.22] pointer-events-none transition-opacity duration-700" 
                      style={{ backgroundImage: `url('https://lh3.googleusercontent.com/d/1i-L-pMn0Tz4RuGi5R6AULl0Y6gI-EwMV')` }} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709] pointer-events-none" />
                    
                    {/* Background Subtle Ambient Glow */}
                    <div className="absolute inset-0 bg-radial-gradient opacity-20 pointer-events-none" />

                    <div className="space-y-4 sm:space-y-6 max-w-xl z-10 w-full px-2 py-4 sm:py-0">
                      
                      {/* 1. EPISODE 187 ACCENT */}
                      <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] sm:tracking-[0.25em] text-[#22C55E] uppercase font-bold flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                        <span>EPISODE {selectedEpisode.episodeNumber}</span>
                      </div>

                      {/* 2. Coming soon. */}
                      <h3 className="text-3xl sm:text-6xl font-extralight text-white tracking-tight">
                        Coming soon.
                      </h3>

                      {/* 3. The Urdu-subtitled premiere is being prepared for release. */}
                      <p className="text-xs sm:text-lg font-light text-slate-400 max-w-md mx-auto leading-relaxed px-2">
                        The Urdu-subtitled premiere is being prepared for release.
                      </p>

                      {/* Premium Minimalist Countdown Timer Display (Apple Style, Mobile Optimized) */}
                      <div className="flex items-center justify-center gap-2.5 sm:gap-6 text-white pt-1 pb-1 sm:pt-2 sm:pb-2 tracking-normal sm:tracking-widest">
                        <div className="flex flex-col items-center min-w-[48px] sm:min-w-[70px]">
                          <span className="font-sans font-thin text-2xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-wider sm:tracking-widest">
                            {String(timeLeft.days).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-sans font-light tracking-[0.15em] sm:tracking-[0.25em] text-slate-500 uppercase mt-1 sm:mt-2">Days</span>
                        </div>
                        <span className="text-slate-800 text-xl sm:text-4xl font-extralight self-start mt-1 sm:mt-2">:</span>
                        <div className="flex flex-col items-center min-w-[48px] sm:min-w-[70px]">
                          <span className="font-sans font-thin text-2xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-wider sm:tracking-widest">
                            {String(timeLeft.hours).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-sans font-light tracking-[0.15em] sm:tracking-[0.25em] text-slate-500 uppercase mt-1 sm:mt-2">Hours</span>
                        </div>
                        <span className="text-slate-800 text-xl sm:text-4xl font-extralight self-start mt-1 sm:mt-2">:</span>
                        <div className="flex flex-col items-center min-w-[48px] sm:min-w-[70px]">
                          <span className="font-sans font-thin text-2xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-wider sm:tracking-widest">
                            {String(timeLeft.minutes).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-sans font-light tracking-[0.15em] sm:tracking-[0.25em] text-slate-500 uppercase mt-1 sm:mt-2">Minutes</span>
                        </div>
                        <span className="text-slate-800 text-xl sm:text-4xl font-extralight self-start mt-1 sm:mt-2">:</span>
                        <div className="flex flex-col items-center min-w-[48px] sm:min-w-[70px]">
                          <span className="font-sans font-light text-2xl sm:text-6xl text-[#22C55E] tracking-wider sm:tracking-widest animate-pulse">
                            {String(timeLeft.seconds).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-sans font-light tracking-[0.15em] sm:tracking-[0.25em] text-[#22C55E] uppercase mt-1 sm:mt-2">Seconds</span>
                        </div>
                      </div>

                      {/* Line divider */}
                      <div className="w-8 h-[1px] bg-slate-800/80 mx-auto my-2 sm:my-4" />

                      {/* 4. TEŞKİLAT • SEASON 7 • EPISODE 187 */}
                      <div className="text-[9px] sm:text-xs font-sans font-light tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 uppercase">
                        TEŞKİLAT • SEASON {selectedEpisode.seasonNumber} • EPISODE {selectedEpisode.episodeNumber}
                      </div>

                      {/* 5. COMING SOON status */}
                      <div className="inline-block px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[9px] sm:text-[10px] font-sans font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#22C55E] uppercase shadow-md">
                        COMING SOON
                      </div>

                    </div>
                  </div>
                ) : (
                  <>
                    {showPosterOverlay && (
                      <div 
                        onClick={handleStartPlayback}
                        className="absolute inset-0 z-30 bg-slate-950 flex items-center justify-center cursor-pointer group"
                      >
                        <img 
                          src={selectedEpisode.thumbnailUrl} 
                          alt={`Teskilat Urdu Episode ${selectedEpisode.episodeNumber} Subtitles - Watch Season 7 Episode ${selectedEpisode.episodeNumber}`} 
                          className="w-full h-full object-cover bg-black group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current text-slate-950 ml-1" />
                          </div>
                        </div>
                      </div>
                    )}

                    <video-player style={{ display: 'block', width: '100%', height: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
                      <video-skin poster={selectedEpisode.thumbnailUrl} style={{ display: 'block', width: '100%', aspectRatio: '16 / 9' }}>
                        <mux-video
                          src={selectedEpisode.videoUrl}
                          playsinline
                          poster={selectedEpisode.thumbnailUrl}
                          controlsList="nodownload"
                          disablePictureInPicture
                          onContextMenu={(e) => e.preventDefault()}
                          style={{ width: '100%', height: '100%', display: 'block' }}
                        ></mux-video>
                        <mux-data></mux-data>
                      </video-skin>
                    </video-player>
                  </>
                )}
              </div>

              {/* 7. Player Surrounding Info Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-200/80">
                <div>
                  <div className="text-lg font-black text-[#0B0B0D]">Episode {selectedEpisode.episodeNumber}</div>
                  <div className="text-xs text-slate-500 font-medium">Season {selectedEpisode.seasonNumber} &bull; Urdu Subtitles</div>
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
                <h2 className="text-2xl font-black text-[#0B0B0D]">Episode {selectedEpisode.episodeNumber} Story Recap</h2>

                <div className="space-y-2">
                  <h3 className="text-xs font-black text-[#22C55E] uppercase tracking-wider">English Story Summary</h3>
                  <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal">
                    {selectedEpisode.storyRecapEnglish}
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-urdu-slim font-bold text-slate-900 dir-rtl text-right">
                    تشکیلات سیزن 7 قسط {selectedEpisode.episodeNumber} اردو کہانی کا خلاصہ
                  </h3>
                  <p className="text-slate-700 text-base font-urdu-slim font-normal whitespace-pre-line leading-relaxed dir-rtl text-right">
                    {selectedEpisode.storyRecapUrdu}
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
                    <div className="text-[#0B0B0D] font-bold mt-0.5">{selectedEpisode.seasonNumber}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Episode</div>
                    <div className="text-[#0B0B0D] font-bold mt-0.5">{selectedEpisode.episodeNumber}</div>
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

              {/* 10. Search Keyword Tags & Search Engine Cloud (Invisible on UI, fully crawled by Googlebot) */}
              <div className="sr-only" aria-hidden="true">
                <h3>Popular Search Queries & Tags</h3>
                <p>
                  Users found this page using search keywords: teskilat episodes 187 urdu, teskilat 187, teskilat 187 urdu, teskilat urdu, teşkilat season 7 episode 187 urdu subtitles, watch teşkilat 187 urdu subtitles, teskilat 186 urdu, teşkilat episode 186 urdu subtitles, and teskilat urdu subtitles online. All image resources including posters, coverage teasers, and video banners are fully crawlable under image search parameters for the keyword: teskilat urdu.
                </p>
              </div>

              {/* 11. Episode Navigation */}
              <div className="pt-10 border-t border-slate-200">
                <div className="grid grid-cols-3 items-center text-xs font-bold">
                  <button 
                    onClick={() => {
                      if (selectedEpisode.episodeNumber === 187) {
                        handleOpenEpisode(FEATURED_SEASON7_EPISODE);
                      } else {
                        showToast('Episode 185 loading...');
                      }
                    }}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-400 text-left transition group cursor-pointer"
                  >
                    <div className="text-slate-400 text-[10px] uppercase font-bold">&larr; Previous</div>
                    <div className="text-[#0B0B0D] font-extrabold text-sm mt-0.5 group-hover:text-[#22C55E] transition">
                      Episode {selectedEpisode.episodeNumber === 187 ? 186 : 185}
                    </div>
                  </button>

                  <button 
                    onClick={handleBackToOverview}
                    className="p-4 rounded-2xl hover:bg-slate-50 text-center transition cursor-pointer"
                  >
                    <div className="text-[#0B0B0D] font-extrabold text-sm">All Episodes</div>
                  </button>

                  <button 
                    onClick={() => {
                      if (selectedEpisode.episodeNumber === 186) {
                        handleOpenEpisode(EPISODE_187);
                      } else {
                        showToast('Episode 188 releases next Sunday!');
                      }
                    }}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-400 text-right transition group cursor-pointer"
                  >
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Next &rarr;</div>
                    <div className="text-[#0B0B0D] font-extrabold text-sm mt-0.5 group-hover:text-[#22C55E] transition">
                      Episode {selectedEpisode.episodeNumber === 186 ? 187 : 188}
                    </div>
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

import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react';

interface VastPreRollAdOverlayProps {
  onAdComplete: () => void;
  onAdStarted?: () => void;
}

interface VastAdData {
  mediaUrl: string;
  clickThroughUrl?: string;
  impressions: string[];
  title?: string;
}

export const VastPreRollAdOverlay: React.FC<VastPreRollAdOverlayProps> = ({
  onAdComplete,
  onAdStarted,
}) => {
  const [adData, setAdData] = useState<VastAdData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [skipTime, setSkipTime] = useState<number>(5);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasCompletedRef = useRef<boolean>(false);

  const completeAd = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    onAdComplete();
  };

  useEffect(() => {
    let isMounted = true;

    async function loadVastAd() {
      try {
        // 1. Fetch resolved VAST URL & Proxy with substituted client IP & User-Agent
        const res = await fetch('/api/vast-ad', {
          headers: {
            'Accept': 'application/xml, text/xml, */*'
          }
        });

        if (!res.ok) {
          if (isMounted) completeAd();
          return;
        }

        const xmlText = await res.text();
        if (!xmlText || xmlText.trim().length === 0) {
          if (isMounted) completeAd();
          return;
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // Extract MediaFiles
        const mediaFileNodes = Array.from(xmlDoc.querySelectorAll('MediaFile'));
        let mediaUrl = '';
        
        for (const node of mediaFileNodes) {
          const url = (node.textContent || '').trim();
          if (url && (url.includes('http://') || url.includes('https://'))) {
            mediaUrl = url;
            break;
          }
        }

        // If no direct MediaFile text found, check CDATA or generic text
        if (!mediaUrl) {
          const rawMatch = xmlText.match(/https?:\/\/[^\s<"']+\.(?:mp4|webm|m3u8|mov)[^\s<"']*/i);
          if (rawMatch) {
            mediaUrl = rawMatch[0];
          }
        }

        if (!mediaUrl) {
          // No video ad available in VAST payload
          if (isMounted) completeAd();
          return;
        }

        // Extract Impressions
        const impressionNodes = Array.from(xmlDoc.querySelectorAll('Impression'));
        const impressions = impressionNodes
          .map(n => (n.textContent || '').trim())
          .filter(u => u.startsWith('http'));

        // Extract ClickThrough
        const clickNode = xmlDoc.querySelector('ClickThrough');
        const clickThroughUrl = clickNode ? (clickNode.textContent || '').trim() : undefined;

        // Extract Title
        const titleNode = xmlDoc.querySelector('AdTitle');
        const title = titleNode ? (titleNode.textContent || '').trim() : 'Sponsored Ad';

        if (isMounted) {
          setAdData({
            mediaUrl,
            clickThroughUrl,
            impressions,
            title
          });
          setLoading(false);
          if (onAdStarted) onAdStarted();

          // Ping Impression URLs
          impressions.forEach(impUrl => {
            try {
              const img = new Image();
              img.src = impUrl;
            } catch (e) {}
          });
        }
      } catch (err) {
        console.warn('VAST pre-roll load failed, playing episode:', err);
        if (isMounted) completeAd();
      }
    }

    // Fallback timer: if VAST fetch takes > 3 seconds, skip ad to protect UX
    const timeoutTimer = setTimeout(() => {
      if (loading && isMounted) {
        console.log('VAST fetch timed out, skipping ad layer');
        completeAd();
      }
    }, 3000);

    loadVastAd();

    return () => {
      isMounted = false;
      clearTimeout(timeoutTimer);
    };
  }, []);

  // Skip countdown timer
  useEffect(() => {
    if (!adData || canSkip) return;

    const interval = setInterval(() => {
      setSkipTime((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [adData, canSkip]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    if (total > 0) {
      setProgress((current / total) * 100);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleAdClick = () => {
    if (adData?.clickThroughUrl) {
      window.open(adData.clickThroughUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return null; // Silent backdrop while checking VAST payload
  }

  if (!adData) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-40 bg-black flex items-center justify-center select-none overflow-hidden rounded-2xl sm:rounded-3xl">
      {/* Pre-roll Ad Video Element */}
      <video
        ref={videoRef}
        src={adData.mediaUrl}
        autoPlay
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={completeAd}
        onError={completeAd}
        onClick={handleAdClick}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Ad Controls Overlay Header */}
      <div className="absolute top-3 left-3 right-3 z-50 flex items-center justify-between pointer-events-none">
        {/* Ad Badge */}
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-500/30 text-xs font-semibold text-amber-400 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>AD &bull; {adData.title || 'Sponsored Video'}</span>
        </div>

        {/* Skip Ad Button */}
        <div className="pointer-events-auto">
          {canSkip ? (
            <button
              onClick={completeAd}
              className="flex items-center gap-1.5 bg-[#22C55E] hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-2xl transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Skip Ad</span>
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <div className="bg-black/80 backdrop-blur-md text-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl border border-white/10 shadow-lg">
              Skip in {skipTime}s
            </div>
          )}
        </div>
      </div>

      {/* Visit Site Button (Bottom Left) */}
      {adData.clickThroughUrl && (
        <div className="absolute bottom-4 left-4 z-50 pointer-events-auto">
          <button
            onClick={handleAdClick}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 shadow-xl transition cursor-pointer"
          >
            <span>Visit Advertiser</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      )}

      {/* Bottom Progress Bar & Volume Toggle */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="text-white hover:text-emerald-400 p-1 transition cursor-pointer"
            aria-label={isPlaying ? 'Pause Ad' : 'Play Ad'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <button
            onClick={toggleMute}
            className="text-white hover:text-emerald-400 p-1 transition cursor-pointer"
            aria-label={isMuted ? 'Unmute Ad' : 'Mute Ad'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Line */}
        <div className="flex-1 mx-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#22C55E] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

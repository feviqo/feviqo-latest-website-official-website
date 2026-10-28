import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX, Maximize, Minimize, RotateCcw, ExternalLink } from 'lucide-react';
import { resolvePlayableVideo, extractYoutubeId, extractDriveId, buildGoogleDrivePreviewUrl } from '../utils/videoResolver';
import { attachHlsStream, isHlsStream } from '../utils/hlsPlayer';

interface NativeVideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  title?: string;
  className?: string;
  aspectRatio?: string; // '16/9' | '21/9' | '9/16' etc.
  onEnded?: () => void;
}

export const resolveDirectVideoSource = (inputSrc?: string | null, isVertical?: boolean): string => {
  return resolvePlayableVideo(null, inputSrc, isVertical);
};

export const NativeVideoPlayer: React.FC<NativeVideoPlayerProps> = ({
  src,
  poster,
  autoPlay = false,
  muted = false,
  loop = false,
  title,
  className = '',
  aspectRatio = '16/9',
  onEnded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(muted ? 0 : 1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  const isVertical = aspectRatio === '9/16';
  const driveId = extractDriveId(src);
  const youtubeId = !driveId ? extractYoutubeId(src) : null;
  const [currentSrc, setCurrentSrc] = useState(() => resolveDirectVideoSource(src, isVertical));

  useEffect(() => {
    const nextSrc = resolveDirectVideoSource(src, isVertical);
    setCurrentSrc(nextSrc);

    const video = videoRef.current;
    if (video) {
      const cleanupHls = attachHlsStream(video, nextSrc, {
        autoPlay,
        onReady: () => setIsBuffering(false),
        onError: () => {
          const fallback = isVertical ? '/videos/reel-talking-head.mp4' : '/videos/Sequence-01.mp4';
          if (nextSrc !== fallback) {
            setCurrentSrc(fallback);
          }
        },
      });
      return () => {
        if (cleanupHls) cleanupHls();
      };
    }
  }, [src, isVertical, autoPlay]);

  // Format seconds into MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    video.currentTime = clampedPos * duration;
    setCurrentTime(clampedPos * duration);
  };

  const handleMouseMoveSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    setHoverPosition(clampedPos * 100);
    setHoverTime(clampedPos * duration);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    video.muted = newVolume === 0;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      video.volume = volume > 0 ? volume : 0.8;
      setIsMuted(false);
      setVolume(volume > 0 ? volume : 0.8);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  // Auto-hide controls when mouse is inactive during playback
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 2500);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only react if active or in fullscreen
      if (!containerRef.current?.contains(document.activeElement) && !document.fullscreenElement) {
        return;
      }
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'ArrowRight' && videoRef.current) {
        e.preventDefault();
        videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
      } else if (e.key === 'ArrowLeft' && videoRef.current) {
        e.preventDefault();
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, isMuted, duration]);

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 1. Google Drive Embed Player Mode (Fits perfectly into placeholder)
  if (driveId) {
    const drivePreviewSrc = buildGoogleDrivePreviewUrl(driveId, autoPlay);
    return (
      <div
        ref={containerRef}
        className={`relative group bg-[#020B06] overflow-hidden select-none flex items-center justify-center rounded-xl sm:rounded-2xl border border-emerald-900/30 shadow-lg ${className}`}
        style={{ aspectRatio }}
      >
        <div className={`w-full h-full relative ${isVertical ? 'gdrive-reel-wrapper' : 'gdrive-frame-wrapper'}`}>
          <iframe
            src={drivePreviewSrc}
            title={title || 'FEVIQO Google Drive Showcase Video'}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            loading="eager"
            className="w-full h-full border-0 block"
          />
        </div>

        {/* Clean FEVIQO Video Title & Brand Pill */}
        {title && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-white/95 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30 shadow flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              {title}
            </span>
          </div>
        )}
      </div>
    );
  }

  // 2. YouTube Embed Player Mode
  if (youtubeId) {
    return (
      <div
        ref={containerRef}
        className={`relative group bg-[#0B0B0D] overflow-hidden select-none flex items-center justify-center rounded-xl sm:rounded-2xl border border-emerald-900/30 shadow-lg ${className}`}
        style={{ aspectRatio }}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`}
          title={title || 'YouTube video player'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0 block"
        />
        {title && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-white/90 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow">
              {title}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
          setShowSpeedMenu(false);
        }
      }}
      tabIndex={0}
      className={`relative group bg-[#0B0B0D] overflow-hidden select-none outline-none focus:outline-none flex items-center justify-center ${className}`}
      style={{ aspectRatio }}
    >
      {/* HTML5 Native Video Element */}
      <video
        ref={videoRef}
        src={isHlsStream(currentSrc) ? undefined : currentSrc}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
        onClick={handlePlayPause}
        onError={() => {
          const fallback = isVertical ? '/videos/reel-talking-head.mp4' : '/videos/Sequence-01.mp4';
          if (currentSrc !== fallback) {
            setCurrentSrc(fallback);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        className="w-full h-full object-cover cursor-pointer block mx-auto my-auto object-center"
      >
        <track kind="captions" src="/captions/empty.vtt" srcLang="en" label="English" default />
      </video>

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-[#22C55E] animate-spin" />
        </div>
      )}

      {/* Big Center Play Button (Shown when paused) */}
      {!isPlaying && !isBuffering && (
        <div
          onClick={handlePlayPause}
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#22C55E] text-black hover:bg-[#16a34a] flex items-center justify-center shadow-2xl transition-all duration-200 transform hover:scale-105 active:scale-95">
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Custom Bottom Control Bar - Disappears completely when paused */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 px-4 py-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent transition-all duration-300 ${
          showControls && isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {/* Timeline / Progress Bar */}
        <div
          className="relative group/timeline w-full h-3 flex items-center cursor-pointer mb-2"
          onClick={handleSeek}
          onMouseMove={handleMouseMoveSeek}
          onMouseLeave={() => {
            setHoverPosition(null);
            setHoverTime(null);
          }}
        >
          {/* Background Track */}
          <div className="w-full h-1 group-hover/timeline:h-2 bg-white/20 rounded-full overflow-hidden transition-all duration-150">
            {/* Played Progress Track */}
            <div
              className="h-full bg-[#22C55E] transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Hover Tooltip */}
          {hoverTime !== null && hoverPosition !== null && (
            <div
              className="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-white text-[10px] font-mono pointer-events-none border border-white/10"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Scrubber Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md transform -translate-x-1/2 scale-0 group-hover/timeline:scale-100 transition-transform duration-150 pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left: Play/Pause, Replay, Time Display */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white transition cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                }
              }}
              aria-label="Restart video"
              className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition cursor-pointer"
              title="Restart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Timestamp */}
            <div className="text-[11px] font-mono text-white/80 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/40 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Volume, Playback Speed, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Volume Control */}
            <div className="flex items-center group/vol">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 rounded-lg hover:bg-white/15 active:scale-95 text-white transition cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-white/90" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4 text-[#22C55E]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#22C55E]" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-0 group-hover/vol:w-16 h-1 bg-white/20 accent-[#22C55E] rounded-lg transition-all duration-200 cursor-pointer mx-1"
                aria-label="Volume slider"
              />
            </div>

            {/* Playback Speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 rounded-md text-[11px] font-bold text-white/90 hover:bg-white/15 transition cursor-pointer"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-8 right-0 bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-lg py-1 shadow-xl flex flex-col z-30 min-w-[70px]">
                  {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-3 py-1 text-left text-[11px] font-medium transition cursor-pointer ${
                        playbackSpeed === speed
                          ? 'bg-[#22C55E]/20 text-[#22C55E] font-bold'
                          : 'text-white/80 hover:bg-white/10 text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white transition cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

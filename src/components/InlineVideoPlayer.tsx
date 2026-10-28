import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Volume2, VolumeX, Maximize2, RotateCcw } from 'lucide-react';
import { resolvePlayableVideo, resolveVideoPoster, extractDriveId, buildGoogleDrivePreviewUrl } from '../utils/videoResolver';
import { attachHlsStream, isHlsStream } from '../utils/hlsPlayer';

export interface InlineVideoPlayerProps {
  id: string;
  driveId?: string;
  videoUrl?: string;
  src?: string;
  poster?: string;
  title?: string;
  category?: string;
  tag?: string;
  aspectTag?: string;
  duration?: string;
  isVertical?: boolean;
  aspectRatioClass?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onOpenModal?: (source: string, title?: string, aspect?: '16/9' | '9/16') => void;
  onPlay?: (id: string) => void;
  onStop?: () => void;
}

export const InlineVideoPlayer: React.FC<InlineVideoPlayerProps> = ({
  id,
  driveId,
  videoUrl,
  src,
  poster: customPoster,
  title = 'FEVIQO Showcase',
  category,
  tag,
  aspectTag,
  duration,
  isVertical = false,
  aspectRatioClass,
  autoPlay = true,
  muted: initialMuted = true,
  loop = true,
  className = '',
  onOpenModal,
  onPlay,
  onStop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if this video is powered by Google Drive
  const rawSource = src || videoUrl || driveId;
  const resolvedDriveId = driveId || extractDriveId(rawSource);
  const playableSrc = resolvePlayableVideo(driveId, rawSource, isVertical);
  const resolvedPoster = customPoster || resolveVideoPoster(playableSrc, isVertical);

  const isIframeSource = Boolean(
    playableSrc && (
      playableSrc.includes('drive.google.com') ||
      playableSrc.includes('youtube') ||
      playableSrc.includes('vimeo')
    )
  );

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showPhoneActions, setShowPhoneActions] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const phoneHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lazy loading observer: only initialize video stream when near or in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsInView(true);
        } else {
          // Auto-pause when scrolled out of screen to conserve bandwidth & memory
          const video = videoRef.current;
          if (video && !video.paused) {
            video.pause();
            setIsPlaying(false);
          }
        }
      },
      { rootMargin: '300px 0px', threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Aspect ratio container: strict 9:16 for portrait, 16:9 for landscape
  const containerAspect = aspectRatioClass || (isVertical ? 'aspect-[9/16]' : 'aspect-video');

  // Timer helper to show phone action buttons temporarily upon interaction (volume & fullscreen)
  const triggerShowPhoneActions = useCallback(() => {
    setShowPhoneActions(true);
    if (phoneHideTimerRef.current) clearTimeout(phoneHideTimerRef.current);
    phoneHideTimerRef.current = setTimeout(() => {
      setShowPhoneActions(false);
    }, 4500); // 4.5s window
  }, []);

  useEffect(() => {
    return () => {
      if (phoneHideTimerRef.current) clearTimeout(phoneHideTimerRef.current);
    };
  }, []);

  const handleContainerClick = (e: React.MouseEvent) => {
    triggerShowPhoneActions();
    if (isIframeSource) return;
    // Tap directly toggles play / pause immediately
    togglePlay(e);
  };

  // Handle HLS stream or standard video attachment and Autoplay safely
  useEffect(() => {
    if (isIframeSource || !isInView) return; // Wait until visible in viewport
    const video = videoRef.current;
    if (!video) return;

    const cleanupHls = attachHlsStream(video, playableSrc, {
      autoPlay,
      onReady: () => {
        setIsLoaded(true);
        setHasError(false);
      },
      onError: () => setHasError(true),
    });

    if (autoPlay) {
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {
              setIsPlaying(false);
            });
          });
      }
    }

    return () => {
      if (cleanupHls) cleanupHls();
    };
  }, [playableSrc, autoPlay, isIframeSource, isInView]);

  // Sync mute state with video element
  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  // Toggle Play / Pause for native video
  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (isIframeSource) return; // Managed by Google Drive iframe
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        if (onPlay) onPlay(id);
      }).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      if (onStop) onStop();
    }
  }, [id, onPlay, onStop, resolvedDriveId]);

  // Handle timeline scrubber scrub
  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const scrubRatio = Math.max(0, Math.min(1, clickX / rect.width));
    video.currentTime = scrubRatio * video.duration;
    setProgress(scrubRatio * 100);
  }, []);

  // Open FEVIQO modal / lightbox
  const handleOpenModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const modalTargetSource = id || resolvedDriveId || driveId || videoUrl || src || playableSrc;
    if (onOpenModal) {
      onOpenModal(modalTargetSource, title, isVertical ? '9/16' : '16/9');
    } else if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  }, [id, resolvedDriveId, driveId, videoUrl, src, playableSrc, title, isVertical, onOpenModal]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleContainerClick}
      className={`relative w-full ${containerAspect} bg-[#03150D] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden select-none group border border-emerald-900/30 shadow-md transition-all duration-300 ${className}`}
      style={{ isolation: 'isolate' }}
    >
      {/* 1. EMBEDDED IFRAME PLAYER (When external iframe is provided) */}
      {isIframeSource ? (
        <div className={`w-full h-full relative overflow-hidden bg-black flex items-center justify-center ${
          isVertical ? 'gdrive-reel-wrapper' : 'gdrive-frame-wrapper'
        }`}>
          <iframe
            src={buildGoogleDrivePreviewUrl(resolvedDriveId || '', false)}
            className="absolute inset-0 w-full h-full border-0 block"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            loading="lazy"
            title={title}
          />
        </div>
      ) : (
        /* 2. NATIVE HTML5 VIDEO FALLBACK (For direct uploads, local videos, or Mux HLS streams) */
        <>
          {resolvedPoster && (
            <img
              src={resolvedPoster}
              alt={title}
              className={`absolute inset-0 w-full h-full object-cover block pointer-events-none transition-opacity duration-500 z-0 ${
                isLoaded ? 'opacity-0' : 'opacity-100'
              }`}
              loading="eager"
            />
          )}

          <video
            ref={videoRef}
            src={isHlsStream(playableSrc) ? undefined : playableSrc}
            poster={resolvedPoster}
            autoPlay={autoPlay}
            muted={isMuted}
            loop={loop}
            playsInline
            preload="metadata"
            onLoadedData={() => {
              setIsLoaded(true);
              setHasError(false);
            }}
            onCanPlay={() => {
              setIsLoaded(true);
              setHasError(false);
            }}
            onPlaying={() => {
              setIsPlaying(true);
              setIsLoaded(true);
              setHasError(false);
            }}
            onTimeUpdate={() => {
              const video = videoRef.current;
              if (!video || !video.duration) return;
              setCurrentTime(video.currentTime);
              setProgress((video.currentTime / video.duration) * 100);
              if (!video.paused && !isPlaying) {
                setIsPlaying(true);
              }
            }}
            onDurationChange={() => {
              const video = videoRef.current;
              if (video && video.duration) {
                setVideoDuration(video.duration);
              }
            }}
            onPlay={() => {
              setIsPlaying(true);
              if (onPlay) onPlay(id);
            }}
            onPause={() => {
              setIsPlaying(false);
              if (onStop) onStop();
            }}
            onError={() => {
              setHasError(true);
            }}
            className="w-full h-full object-cover block relative z-10"
          >
            <track kind="captions" src="/captions/empty.vtt" srcLang="en" label="English" default />
          </video>

          {hasError && (
            <div className="absolute inset-0 z-20 bg-black/85 flex flex-col items-center justify-center p-4 text-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasError(false);
                  if (videoRef.current) videoRef.current.load();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22C55E] text-black text-xs font-bold hover:bg-[#16a34a] transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload</span>
              </button>
            </div>
          )}

          {/* Center Play Indicator - vanishes automatically when video plays or opens modal on click */}
          {!isPlaying && (
            <div 
              onClick={(e) => {
                if (onOpenModal) {
                  e.stopPropagation();
                  onOpenModal(playableSrc, title, isVertical ? '9/16' : '16/9');
                } else {
                  togglePlay(e);
                  triggerShowPhoneActions();
                }
              }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-opacity duration-300 cursor-pointer pointer-events-auto hover:bg-black/10"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#22C55E] text-black flex items-center justify-center shadow-2xl shadow-black/80 transform active:scale-90 hover:scale-110 transition-all cursor-pointer">
                <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-current translate-x-0.5 text-black" />
              </div>
            </div>
          )}
        </>
      )}

      {/* 3. ACTION BUTTONS (Volume & Full Screen) */}
      <div 
        className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-30 flex items-center gap-1.5 transition-all duration-200 ${
          showPhoneActions
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none sm:opacity-100 sm:scale-100 sm:pointer-events-auto'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {!isIframeSource && (
          <button
            type="button"
            onClick={(e) => {
              toggleMute(e);
              triggerShowPhoneActions();
            }}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md border transition-all duration-200 flex items-center justify-center cursor-pointer shadow-md active:scale-90 ${
              isMuted
                ? 'bg-black/75 hover:bg-black text-white border-white/20'
                : 'bg-emerald-950/90 hover:bg-emerald-900 text-[#22C55E] border-emerald-500/50 shadow-[0_0_10px_rgba(34,197,94,0.35)]'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-white/90" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#22C55E]" />
            )}
          </button>
        )}

        {onOpenModal && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(e);
            }}
            title="Open full screen"
            aria-label="Full screen video"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/75 hover:bg-[#22C55E] text-white hover:text-black backdrop-blur-md border border-white/20 transition-all flex items-center justify-center cursor-pointer shadow-md active:scale-90"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4. BOTTOM CONTROLS (Slider line strictly disappears when paused) */}
      {resolvedDriveId ? (
        onOpenModal && (
          <div
            className={`absolute bottom-2 right-2 z-20 transition-opacity duration-200 pointer-events-auto ${
              isHovered || showPhoneActions ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#22C55E] hover:bg-[#16a34a] text-black transition shadow-sm cursor-pointer active:scale-95"
              aria-label="Expand"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      ) : (
        /* Native Scrubber Bar - ONLY visible during PLAYBACK when hovered or when actions are active. Disappears completely when paused */
        isPlaying && (
          <div
            className={`absolute bottom-0 inset-x-0 z-20 px-3 py-2 sm:p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-200 pointer-events-auto ${
              isHovered || showPhoneActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Minimalist scrubber line */}
            <div
              onClick={handleScrub}
              className="py-1.5 cursor-pointer w-full relative group/scrub"
              title="Scrub timeline"
            >
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden relative group-hover/scrub:h-1.5 transition-all">
                <div
                  className="absolute top-0 left-0 bottom-0 bg-[#22C55E] rounded-full transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

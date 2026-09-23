import React, { useRef, useState, useEffect } from 'react';
import { X, Maximize, Minimize, Share2, Check } from 'lucide-react';
import { NativeVideoPlayer } from './NativeVideoPlayer';
import { resolvePlayableVideo, extractDriveId, buildGoogleDrivePreviewUrl } from '../utils/videoResolver';
import { findVideoItem } from '../data/videoRegistry';

interface VideoModalProps {
  vimeoId: string | null;
  videoUrl?: string | null;
  title?: string;
  aspectRatio?: '16/9' | '9/16' | string;
  onClose: () => void;
}

const extractYoutubeId = (input?: string | null): string | null => {
  if (!input) return null;
  const clean = input.trim();
  const match = clean.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
  return null;
};

const extractVimeoId = (input?: string | null): string | null => {
  if (!input) return null;
  const clean = input.trim();
  const match = clean.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/);
  if (match) return match[1];
  if (/^[0-9]{7,11}$/.test(clean)) return clean;
  return null;
};

export const VideoModal: React.FC<VideoModalProps> = ({ 
  vimeoId: propVimeoId, 
  videoUrl, 
  title, 
  aspectRatio = '16/9',
  onClose 
}) => {
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const source = videoUrl || propVimeoId;
  if (!source) return null;

  const driveId = extractDriveId(source);
  const matchedItem = findVideoItem(source) || (driveId ? findVideoItem(driveId) : undefined);
  const isVertical = aspectRatio === '9/16' || matchedItem?.orientation === 'vertical' || source.includes('reel-');
  const vimeoId = !driveId ? extractVimeoId(source) : null;
  const youtubeId = (!driveId && !vimeoId) ? extractYoutubeId(source) : null;
  const directPlayableSrc = resolvePlayableVideo(driveId, source, isVertical);

  const cleanId = matchedItem?.id || (source.startsWith('http') ? undefined : source);
  const videoIdForShare = cleanId || propVimeoId || 'reel-3';

  const handleCopyShareLink = () => {
    // Professional domain base (prefer feviqo.com or actual origin if on custom domain)
    const baseOrigin = window.location.hostname.includes('feviqo.com')
      ? window.location.origin
      : 'https://feviqo.com';

    const shareUrl = `${baseOrigin}/gallery?v=${videoIdForShare}`;

    // Copy strictly the clean URL string to clipboard (no extra titles or description text attached)
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});

    // Trigger mobile native share sheet if supported (passing url only)
    if (navigator.share) {
      navigator.share({
        url: shareUrl,
      }).catch(() => {});
    }
  };

  // Toggle true in-website browser fullscreen
  const toggleFullscreen = () => {
    if (!modalContainerRef.current) return;
    if (!document.fullscreenElement) {
      modalContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        ref={modalContainerRef}
        className={`relative w-full ${isVertical ? 'max-w-[380px] sm:max-w-md max-h-[88vh]' : 'max-w-5xl'} bg-[#07090D] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Custom Premium Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 bg-[#0B0F17] border-b border-white/10 z-20">
          <div className="flex items-center gap-2.5 truncate pr-2">
            <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
            <span className="text-white text-xs sm:text-sm font-black tracking-tight truncate">
              {title || matchedItem?.title || 'FEVIQO Video'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Share / Copy Link Button */}
            <button
              onClick={handleCopyShareLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                copied 
                  ? 'bg-[#22C55E] text-slate-950 shadow-md' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
              title="Copy shareable link for this video"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span>Copied Link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="hidden sm:inline">Share Link</span>
                </>
              )}
            </button>

            {/* Website Fullscreen Button (Stays on website) */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-[#22C55E] hover:text-black text-white transition cursor-pointer"
              title="Fullscreen on this website"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close Video"
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-red-500 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Player Container */}
        <div className="relative w-full flex items-center justify-center bg-black overflow-hidden">
          {driveId ? (
            <div className={`w-full relative overflow-hidden bg-black flex items-center justify-center ${
              isVertical ? 'aspect-[9/16] max-h-[82vh] gdrive-reel-wrapper' : 'aspect-video gdrive-frame-wrapper'
            }`}>
              <iframe
                src={buildGoogleDrivePreviewUrl(driveId, true)}
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                loading="eager"
                title={title || matchedItem?.title || 'FEVIQO Google Drive Video'}
              />
            </div>
          ) : vimeoId ? (
            <div className={`w-full relative overflow-hidden bg-black flex items-center justify-center ${
              isVertical ? 'aspect-[9/16]' : 'aspect-video'
            }`}>
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&badge=0&dnt=1`}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                loading="eager"
                title={title || matchedItem?.title || 'FEVIQO Video'}
              />
            </div>
          ) : youtubeId ? (
            <div className={`w-full relative overflow-hidden bg-black flex items-center justify-center ${
              isVertical ? 'aspect-[9/16]' : 'aspect-video'
            }`}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                loading="eager"
                title={title || matchedItem?.title || 'FEVIQO Video'}
              />
            </div>
          ) : (
            <NativeVideoPlayer
              src={directPlayableSrc}
              title={title || matchedItem?.title || 'FEVIQO Video'}
              autoPlay={true}
              muted={false}
              aspectRatio={isVertical ? '9/16' : '16/9'}
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

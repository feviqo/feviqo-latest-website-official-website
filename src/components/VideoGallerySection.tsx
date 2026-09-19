import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { InlineVideoPlayer } from './InlineVideoPlayer';
import { HOMEPAGE_SHOWCASE_COLUMNS } from '../data/videoRegistry';

interface VideoGallerySectionProps {
  onOpenVideo: (vimeoIdOrDriveId: string, title?: string, aspect?: '16/9' | '9/16') => void;
  onBookCall: () => void;
  onNavigateGallery?: () => void;
}

export const VideoGallerySection: React.FC<VideoGallerySectionProps> = ({
  onOpenVideo,
  onNavigateGallery,
}) => {
  return (
    <section id="video-gallery" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header-Matched Dark Green Showcase Container */}
        <div className="relative bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] rounded-[24px] sm:rounded-[36px] shadow-2xl shadow-emerald-950/20 border border-[#064e3b]/80 ring-1 ring-emerald-500/20 p-3.5 sm:p-10 md:p-14 overflow-hidden">
          {/* Subtle green ambient blurs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Section Header */}
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center -skew-x-[22deg] bg-emerald-950/80 border border-emerald-500/30 px-3.5 sm:px-4 py-1.5 shadow-2xs shrink-0">
              <span className="skew-x-[22deg] inline-flex items-center gap-2 text-emerald-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
                <span>Unlimited Production Catalog</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
              We Edit It All
            </h2>
            
            <p className="text-emerald-100/90 text-xs sm:text-base font-medium max-w-xl mx-auto">
              Even if your niche is the Bubble Wrap Popping Reviews
            </p>
          </div>

          {/* 3-Column Bento Grid - 6 Real Video Showcase Items */}
          <div className="grid grid-cols-3 gap-2 sm:gap-5 lg:gap-6">
            {HOMEPAGE_SHOWCASE_COLUMNS.map((col) => (
              <div key={col.colIndex} className="flex flex-col gap-2 sm:gap-5 lg:gap-6">
                {col.items.map((item) => {
                  const isVertical = item.orientation === 'vertical';

                  return (
                    <div
                      key={item.id}
                      className="w-full group bg-[#03150D] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-emerald-900/30"
                    >
                      {/* Direct Native HTML5 Video Showcase */}
                      <InlineVideoPlayer
                        id={item.id}
                        src={item.src}
                        poster={item.poster}
                        driveId={item.driveId}
                        title={item.title}
                        tag={item.tag}
                        aspectTag={item.aspectTag}
                        duration={item.duration}
                        isVertical={isVertical}
                        onOpenModal={onOpenVideo}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom "See full gallery" Pill Button */}
          <div className="mt-12 sm:mt-14 text-center">
            <button
              onClick={onNavigateGallery}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm sm:text-base border border-slate-300 hover:border-slate-400 shadow-xs hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <span>See full gallery</span>
              <ArrowUpRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

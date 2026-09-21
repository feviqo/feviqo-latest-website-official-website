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

          {/* Desktop Layout: 3-Column Bento Grid (sm:grid) */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-5 lg:gap-6">
            {HOMEPAGE_SHOWCASE_COLUMNS.map((col) => (
              <div key={col.colIndex} className="flex flex-col gap-5 lg:gap-6">
                {col.items.map((item) => {
                  const isVertical = item.orientation === 'vertical';

                  return (
                    <div
                      key={item.id}
                      className="w-full group bg-[#03150D] rounded-2xl md:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-emerald-900/30"
                    >
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

          {/* Mobile Layout: Responsive Phone Experience (block sm:hidden) */}
          {/* Horizontal videos get full-width 16:9 view so they are large, clear, and easy to pause */}
          <div className="block sm:hidden space-y-4">
            {/* 1. First Horizontal Feature Video (Full Width 16:9) */}
            <div className="w-full bg-[#03150D] rounded-2xl overflow-hidden shadow-lg border border-emerald-800/40">
              <InlineVideoPlayer
                id="showcase-col1-h"
                src="https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8"
                poster="https://image.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M/thumbnail.jpg?time=1"
                title="Cinematic Landscape & Documentary Master"
                tag="YOUTUBE LONG-FORM"
                duration="8:15"
                isVertical={false}
                onOpenModal={onOpenVideo}
              />
            </div>

            {/* 2. Pair of Vertical Reels Side-by-Side (2 Columns) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#03150D] rounded-2xl overflow-hidden shadow-lg border border-emerald-800/40">
                <InlineVideoPlayer
                  id="showcase-col1-v"
                  src="https://stream.mux.com/2XO015Sw1RdYlJgjM6OS009uhQNiJycsmbilSY2MeDNis.m3u8"
                  poster="https://image.mux.com/2XO015Sw1RdYlJgjM6OS009uhQNiJycsmbilSY2MeDNis/thumbnail.jpg?time=1"
                  title="High-Retention Talking Head"
                  tag="RETENTION REEL"
                  duration="0:30"
                  isVertical={true}
                  onOpenModal={onOpenVideo}
                />
              </div>
              <div className="bg-[#03150D] rounded-2xl overflow-hidden shadow-lg border border-emerald-800/40">
                <InlineVideoPlayer
                  id="showcase-col2-v"
                  src="https://stream.mux.com/oQ902RknkEysM3K9nNVlA011tnD3u1HrXBS7uynYxCRwE.m3u8"
                  poster="https://image.mux.com/oQ902RknkEysM3K9nNVlA011tnD3u1HrXBS7uynYxCRwE/thumbnail.jpg?time=1"
                  title="Kinetic Motion Typography"
                  tag="KINETIC MOTION"
                  duration="0:22"
                  isVertical={true}
                  onOpenModal={onOpenVideo}
                />
              </div>
            </div>

            {/* 3. Second Horizontal Feature Video (Full Width 16:9) */}
            <div className="w-full bg-[#03150D] rounded-2xl overflow-hidden shadow-lg border border-emerald-800/40">
              <InlineVideoPlayer
                id="showcase-col2-h"
                src="https://stream.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc.m3u8"
                poster="https://image.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc/thumbnail.jpg?time=1"
                title="Commercial SaaS Product Launch"
                tag="PRODUCT DEMO"
                duration="2:45"
                isVertical={false}
                onOpenModal={onOpenVideo}
              />
            </div>

            {/* 4. Third Horizontal Feature Video (Full Width 16:9) */}
            <div className="w-full bg-[#03150D] rounded-2xl overflow-hidden shadow-lg border border-emerald-800/40">
              <InlineVideoPlayer
                id="showcase-col3-h"
                src="https://stream.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc.m3u8"
                poster="https://image.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc/thumbnail.jpg?time=1"
                title="Founder Vision & Brand Documentary"
                tag="FOUNDER SERIES"
                duration="9:30"
                isVertical={false}
                onOpenModal={onOpenVideo}
              />
            </div>

            {/* 5. Balanced Pair of Viral Vertical Reels Side-by-Side (2 Columns) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#03150D] rounded-2xl overflow-hidden shadow-lg border border-emerald-800/40">
                <InlineVideoPlayer
                  id="showcase-col3-v"
                  src="https://stream.mux.com/Xi8FLFTXCSpPW5T5A9L71xPO02cXgge9tvYAXjsE3gjw.m3u8"
                  poster="https://image.mux.com/Xi8FLFTXCSpPW5T5A9L71xPO02cXgge9tvYAXjsE3gjw/thumbnail.jpg?time=1"
                  title="Viral Engagement Loop"
                  tag="VIRAL REEL"
                  duration="0:22"
                  isVertical={true}
                  onOpenModal={onOpenVideo}
                />
              </div>
              <div className="bg-[#03150D] rounded-2xl overflow-hidden shadow-lg border border-emerald-800/40">
                <InlineVideoPlayer
                  id="showcase-col3-v2"
                  src="https://stream.mux.com/kxeMNXlvZr02rU9pIRUA02PtMMToQJrYNRgz4WtD02giPk.m3u8"
                  poster="https://image.mux.com/kxeMNXlvZr02rU9pIRUA02PtMMToQJrYNRgz4WtD02giPk/thumbnail.jpg?time=1"
                  title="Executive Authority Short"
                  tag="PODCAST CUT"
                  duration="0:30"
                  isVertical={true}
                  onOpenModal={onOpenVideo}
                />
              </div>
            </div>
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

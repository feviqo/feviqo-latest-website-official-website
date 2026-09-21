import React from 'react';
import { InlineVideoPlayer } from './InlineVideoPlayer';

export interface ShowcaseVideoItem {
  id: string;
  src: string;
  poster: string;
  title: string;
}

interface HorizontalVideoShowcaseProps {
  onOpenVideo?: (source: string, title?: string, aspect?: '16/9' | '9/16') => void;
  videos?: ShowcaseVideoItem[];
  title?: string;
  subtitle?: string;
  tag?: string;
}

export const DEFAULT_SHOWCASE_VIDEOS: ShowcaseVideoItem[] = [
  {
    id: 'horiz-1',
    src: 'https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8',
    poster: 'https://image.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M/thumbnail.jpg?time=1',
    title: 'Cinematic Landscape & Documentary Master',
  },
  {
    id: 'horiz-2',
    src: 'https://stream.mux.com/K2FDm6cIXH1hmj00KDCoVtmUP00WfWqS8E5QrioFZt1LE.m3u8',
    poster: 'https://image.mux.com/K2FDm6cIXH1hmj00KDCoVtmUP00WfWqS8E5QrioFZt1LE/thumbnail.jpg?time=1',
    title: 'Narrative Brand Storytelling & Color Grading',
  },
  {
    id: 'horiz-4',
    src: 'https://stream.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc.m3u8',
    poster: 'https://image.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc/thumbnail.jpg?time=1',
    title: 'Commercial SaaS Product Launch & Feature Reel',
  },
];

export const HorizontalVideoShowcase: React.FC<HorizontalVideoShowcaseProps> = ({
  onOpenVideo,
  videos = DEFAULT_SHOWCASE_VIDEOS,
  title = 'YouTube Masterclasses & Documentaries',
  subtitle = 'Engineered with narrative watch-time pacing and cinematic audio design.',
  tag = 'RECENT LONG-FORM PRODUCTIONS',
}) => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-left">
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#15803D] text-[11px] font-bold uppercase tracking-wider mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          {tag}
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B0B0D] tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base md:text-lg mt-2 max-w-2xl font-normal leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Direct Video Grid: Pure video cards without bottom metadata box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-black border border-slate-200/80 hover:border-emerald-500/40"
          >
            <InlineVideoPlayer
              id={video.id}
              src={video.src}
              poster={video.poster}
              title={video.title}
              isVertical={false}
              aspectRatioClass="aspect-video"
              onOpenModal={onOpenVideo}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

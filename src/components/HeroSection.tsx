import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Star } from 'lucide-react';
import { getWebsiteAssets, subscribeWebsiteAssets } from '../services/assetService';
import { attachHlsStream, isHlsStream } from '../utils/hlsPlayer';

interface HeroSectionProps {
  onBookCall: () => void;
  onOpenVideo?: (vimeoId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookCall, onOpenVideo }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [assets, setAssets] = useState(() => getWebsiteAssets());

  useEffect(() => {
    return subscribeWebsiteAssets((newAssets) => {
      setAssets(newAssets);
    });
  }, []);

  const heroVideoSrc = assets.heroVideo || '/videos/Sequence-01.mp4';
  const heroPosterSrc = assets.heroPoster || '/images/hero-poster.jpg';

  // Handle HLS stream or native playback with muted autoplay
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const cleanupHls = attachHlsStream(vid, heroVideoSrc, {
      autoPlay: true,
      onError: () => {
        if (vid && heroVideoSrc !== '/videos/Sequence-01.mp4') {
          vid.src = '/videos/Sequence-01.mp4';
          vid.play().catch(() => {});
        }
      },
    });

    vid.defaultMuted = true;
    vid.muted = isMuted;
    vid.playsInline = true;
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }

    return () => {
      if (cleanupHls) cleanupHls();
    };
  }, [heroVideoSrc]);

  const toggleSound = () => {
    const vid = videoRef.current;
    if (vid) {
      const nextMuted = !vid.muted;
      vid.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <section className="relative pt-12 sm:pt-16 pb-12 sm:pb-16 bg-white text-[#0B0B0D] overflow-hidden">
      {/* Background Subtle Doodle Texture (from index.html doodles.png) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] bg-repeat bg-center"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Exact Hero Title from index.html (elementor-element-330c8a2) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#0B0B0D] leading-[1.08] max-w-4xl mx-auto mb-4">
          Unlimited Video Editing Service
        </h1>

        {/* Exact Hero Subtitle from index.html (elementor-element-3b7c63b) */}
        <p className="text-base sm:text-xl text-[#4A4A5A] max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Tailored for modern-day video editing, so you can create video content without the hassle of managing.
        </p>

        {/* Exact Get Started Button in brand color green */}
        <div className="flex justify-center mb-10 sm:mb-14">
          <button
            onClick={onBookCall}
            className="px-10 py-4 rounded-xl sm:rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-black text-base sm:text-lg tracking-normal shadow-lg shadow-[#22C55E]/25 hover:shadow-xl hover:scale-[1.03] active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            Get Started!
          </button>
        </div>

        {/* 
          Main Video Showcase Container with Right-Hand Social Proof Boxes
          Widescreen horizontal 16:9 video with matching height horizontal side boxes
        */}
        <div className="relative mx-auto max-w-6xl w-full mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
            
            {/* Left: Large Horizontal Widescreen 16:9 Video Player */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">
              <div className="relative w-full aspect-[16/9] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-black shadow-2xl border border-slate-200/90 flex items-center justify-center">
                
                {/* Top-Right Sound Box */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-30 flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                  title={isMuted ? "Click for sound" : "Mute video"}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-slate-300 shrink-0" />
                      <span>Click for sound</span>
                      <div className="flex items-end gap-1 h-3.5 ml-1">
                        <span className="w-1 bg-white rounded-sm h-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                        <span className="w-1 bg-white rounded-sm h-2/3 animate-[pulse_1.2s_ease-in-out_infinite]" />
                        <span className="w-1 bg-white rounded-sm h-4/5 animate-[pulse_0.9s_ease-in-out_infinite]" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                      <span className="text-[#22C55E]">Sound on</span>
                      <div className="flex items-end gap-1 h-3.5 ml-1">
                        <span className="w-1 bg-[#22C55E] rounded-sm h-full animate-bounce" />
                        <span className="w-1 bg-[#22C55E] rounded-sm h-2/3 animate-bounce delay-75" />
                        <span className="w-1 bg-[#22C55E] rounded-sm h-4/5 animate-bounce delay-150" />
                      </div>
                    </>
                  )}
                </button>

                {/* Horizontal Widescreen Video Player */}
                <video
                  ref={videoRef}
                  src={isHlsStream(heroVideoSrc) ? undefined : heroVideoSrc}
                  poster={heroPosterSrc}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover cursor-pointer aspect-[16/9]"
                  onClick={toggleSound}
                />
              </div>
            </div>

            {/* Right Side: Two Separate Boxes with Free-Standing Review Rating in Between (Matches User Reference) */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-4 sm:gap-5 text-left h-full">
              
              {/* Separate Box 1: Trusted by many! */}
              <div className="bg-white rounded-2xl sm:rounded-[28px] p-6 sm:p-7 border border-slate-200/90 shadow-lg shadow-slate-900/5 flex flex-col justify-center gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex -space-x-2.5 overflow-hidden p-0.5 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=85"
                      alt="Creator 1"
                      className="inline-block h-10 w-10 sm:h-11 sm:w-11 rounded-full ring-2 ring-emerald-500 object-cover shadow-sm"
                      loading="lazy"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=85"
                      alt="Creator 2"
                      className="inline-block h-10 w-10 sm:h-11 sm:w-11 rounded-full ring-2 ring-white object-cover shadow-sm"
                      loading="lazy"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=85"
                      alt="Creator 3"
                      className="inline-block h-10 w-10 sm:h-11 sm:w-11 rounded-full ring-2 ring-emerald-500 object-cover shadow-sm"
                      loading="lazy"
                    />
                    <div className="relative inline-block">
                      <img
                        src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=85"
                        alt="Creator 4"
                        className="inline-block h-10 w-10 sm:h-11 sm:w-11 rounded-full ring-2 ring-white object-cover shadow-sm"
                        loading="lazy"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22C55E] ring-2 ring-white" />
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803d] text-xs font-extrabold shadow-2xs shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    Top Rated
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                  Trusted by many!
                </h3>
              </div>

              {/* Middle (No Box): 4.7 • Reviews 75 • Excellent + Green Stars (Free-standing as in reference) */}
              <div className="px-2 py-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-600">
                  <span className="font-black text-slate-950 text-base sm:text-lg">4.7</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">Reviews 75</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[#16a34a] font-extrabold">Excellent</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#22C55E] text-[#22C55E]" />
                  ))}
                </div>
              </div>

              {/* Separate Box 2: 50+ Monthly clients | 30k+ Videos edited in Vibrant Green */}
              <div className="bg-white rounded-2xl sm:rounded-[28px] p-6 sm:p-7 border border-slate-200/90 shadow-lg shadow-slate-900/5">
                <div className="grid grid-cols-2 divide-x divide-slate-200 text-center items-center">
                  <div className="px-2">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16a34a] tracking-tight">
                      50+
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1 whitespace-nowrap">
                      Monthly clients
                    </div>
                  </div>

                  <div className="px-2">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#16a34a] tracking-tight">
                      30k+
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1 whitespace-nowrap">
                      Videos edited
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

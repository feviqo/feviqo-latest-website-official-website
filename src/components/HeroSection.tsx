import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Star } from 'lucide-react';
import { getWebsiteAssets, subscribeWebsiteAssets } from '../services/assetService';
import { attachHlsStream, isHlsStream } from '../utils/hlsPlayer';
import { AdBanner728x90 } from './AdBanner728x90';
import { AdBanner320x50 } from './AdBanner320x50';
import { AdBanner468x60 } from './AdBanner468x60';
import { AdBanner300x250 } from './AdBanner300x250';
import { AdBanner160x300 } from './AdBanner160x300';
import { AdNativeBanner } from './AdNativeBanner';

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

  const heroVideoSrc = assets.heroVideo || 'https://stream.mux.com/hQglpqXvqnXLQq57m01p5dRGsGT3JQjUxJZX4sc02pfWs.m3u8';
  const heroPosterSrc = assets.heroPoster || 'https://feviqo.com/images/feviqo-hero-poster.jpg';

  // Handle HLS stream or native playback with muted autoplay
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const cleanupHls = attachHlsStream(vid, heroVideoSrc, {
      autoPlay: true,
      onError: () => {
        if (vid && heroVideoSrc !== 'https://stream.mux.com/hQglpqXvqnXLQq57m01p5dRGsGT3JQjUxJZX4sc02pfWs.m3u8') {
          vid.src = 'https://stream.mux.com/hQglpqXvqnXLQq57m01p5dRGsGT3JQjUxJZX4sc02pfWs.m3u8';
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
    <section className="relative pt-14 sm:pt-20 pb-14 sm:pb-20 bg-white text-[#0B0B0D] overflow-hidden">
      {/* Background Subtle Doodle Texture (from index.html doodles.png) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] bg-repeat bg-center"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Dual-Typography Hero Title */}
        <h1 className="font-coolvetica text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#0B0B0D] leading-[1.06] max-w-4xl mx-auto mb-4">
          Unlimited Video Editing <span className="font-editorial-italic font-bold text-[#16a34a]">Service</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="font-neue text-base sm:text-xl text-[#4A4A5A] max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
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
          Main Video Showcase Container with Right-Hand Social Proof Column
          Expanded container (+100px) provides an ultra-premium large video showcase
        */}
        <div className="relative mx-auto max-w-[1360px] w-full mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
            
            {/* Left: Large Horizontal Widescreen 16:9 Video Player */}
            <div className="lg:col-span-8 flex flex-col justify-center">
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

            {/* Right Side: Exact Reference Layout (Top Card with Top Rated, Free-standing Review in Middle, Centered Bottom Stats Card) */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4 text-left h-full">
              
              {/* Top Card: Overlapping Avatars + Top Rated Badge + 'Trusted by many!' */}
              <div className="bg-white rounded-2xl sm:rounded-[26px] p-6 border border-slate-200/90 shadow-md shadow-slate-900/5 flex flex-col justify-center gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex -space-x-2.5 overflow-hidden p-0.5 shrink-0">
                    <img
                      src="/images/avatars/lais-deleon.webp"
                      alt="Creator 1"
                      className="inline-block h-10 w-10 sm:h-11 sm:w-11 rounded-full ring-2 ring-white object-cover shadow-sm"
                      loading="lazy"
                    />
                    <img
                      src="/images/avatars/alex-tubio.webp"
                      alt="Creator 2"
                      className="inline-block h-10 w-10 sm:h-11 sm:w-11 rounded-full ring-2 ring-white object-cover shadow-sm"
                      loading="lazy"
                    />
                    <img
                      src="/images/avatars/jenna-kutcher.webp"
                      alt="Creator 3"
                      className="inline-block h-10 w-10 sm:h-11 sm:w-11 rounded-full ring-2 ring-white object-cover shadow-sm"
                      loading="lazy"
                    />
                    <img
                      src="/images/avatars/patrick-anghel.webp"
                      alt="Creator 4"
                      className="inline-block h-10 w-10 sm:h-11 sm:w-11 rounded-full ring-2 ring-white object-cover shadow-sm"
                      loading="lazy"
                    />
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

              {/* Middle Section: 4.9 • Reviews 75 • Excellent + Green Stars */}
              <div className="px-1 py-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-600">
                  <span className="font-black text-slate-950 text-base">4.9</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">Reviews 75</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">Excellent</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#22C55E] text-[#22C55E]" />
                  ))}
                </div>
              </div>

              {/* Bottom Card: 50+ Monthly clients | 30k+ Videos edited (Centered, in Brand Green) */}
              <div className="bg-white rounded-2xl sm:rounded-[26px] p-6 border border-slate-200/90 shadow-md shadow-slate-900/5">
                <div className="grid grid-cols-2 divide-x divide-slate-200 text-center items-center">
                  <div className="px-2 flex flex-col items-center justify-center">
                    <div className="font-neue text-5xl sm:text-6xl font-extrabold text-[#16a34a] tracking-tight">
                      50+
                    </div>
                    <div className="font-neue text-base sm:text-lg font-bold text-slate-900 mt-2 whitespace-nowrap">
                      Monthly clients
                    </div>
                  </div>

                  <div className="px-2 flex flex-col items-center justify-center">
                    <div className="font-neue text-5xl sm:text-6xl font-extrabold text-[#16a34a] tracking-tight">
                      30k+
                    </div>
                    <div className="font-neue text-base sm:text-lg font-bold text-slate-900 mt-2 whitespace-nowrap">
                      Videos edited
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* MAIN PAGE HIGH-EARNING AD BANNER SUITE & NATIVE BANNER */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 w-full space-y-6 text-center">
            <div className="hidden md:block">
              <AdBanner728x90 />
            </div>
            <div className="block md:hidden">
              <AdBanner320x50 />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-6 my-4">
              <AdBanner468x60 />
              <AdBanner300x250 />
              <AdBanner160x300 />
            </div>

            <AdNativeBanner />
          </div>

        </div>

      </div>
    </section>
  );
};

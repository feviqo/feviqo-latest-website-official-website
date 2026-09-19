import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Volume2, VolumeX, Star } from 'lucide-react';
import { Navbar } from '../Navbar';
import { SolutionsSwitcher } from '../SolutionsSwitcher';
import { AppRoute } from '../../types';
import { YouTubeBrandLogo, InstagramBrandLogo, CreativePackagingBrandLogo } from '../BrandLogos';

interface ContentCreatorsPageProps {
  onBackToHome: () => void;
  onBookCall: () => void;
  onNavigatePricing: () => void;
  onOpenVideo?: (id: string) => void;
  onNavigateSubpage?: (subpage: 'creators' | 'business' | 'agencies') => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage?: (route: AppRoute) => void;
}

export const ContentCreatorsPage: React.FC<ContentCreatorsPageProps> = ({
  onBackToHome,
  onBookCall,
  onNavigatePricing,
  onOpenVideo,
  onNavigateFlow = () => {},
  onNavigatePage = (_route: AppRoute) => {},
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    const vid = videoRef.current;
    if (vid) {
      vid.muted = !vid.muted;
      setIsMuted(vid.muted);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0B0B0D] font-sans antialiased selection:bg-[#22C55E] selection:text-slate-950 flex flex-col">
      {/* Navbar */}
      <Navbar 
        onBookCall={onBookCall}
        onNavigateSection={() => onBackToHome()}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      {/* Animated Solutions Pill Switcher */}
      <SolutionsSwitcher 
        activeTab="creators"
        onSelectTab={(tab) => onNavigatePage(tab)}
      />

      {/* Hero Section */}
      <section className="pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-6 text-emerald-900">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            SOLUTIONS &bull; CONTENT CREATORS &amp; YOUTUBERS
          </span>
        </div>

        {/* Text-only transition animation on switch */}
        <motion.div
          key="creators-hero-text"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#0B0B0D] leading-[1.08] max-w-4xl mx-auto mb-5">
            Video Editing for <span className="text-[#22C55E]">Content Creators</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Create content without the editing hassle. Get a dedicated video editor for your YouTube, TikTok, and Instagram videos with fast 24–48h turnarounds.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={onBookCall}
            className="w-full sm:w-auto px-9 py-4 rounded-xl sm:rounded-2xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-base sm:text-lg shadow-lg shadow-[#22C55E]/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Get Started!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigatePricing}
            className="w-full sm:w-auto px-7 py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 transition-colors cursor-pointer"
          >
            View Creator Plans
          </button>
        </div>

        {/* Video Showcase with Sound Toggle */}
        <div className="relative mx-auto max-w-4xl w-full mb-14">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-200">
            <button
              type="button"
              onClick={toggleSound}
              className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-md cursor-pointer hover:bg-black"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#22C55E]" />}
              <span>{isMuted ? 'Click for sound' : 'Sound on'}</span>
            </button>
            <video
              ref={videoRef}
              src="/videos/Sequence-01.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              onClick={toggleSound}
            />
          </div>
        </div>

        {/* 4 Creator Highlights Strip - Open Clean Layout (No Boxes) */}
        <div className="pt-10 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block">Turnaround</span>
            <div className="font-extrabold text-slate-950 text-2xl">24–48 Hours</div>
            <p className="text-xs text-slate-500 font-medium">Shorts delivered in 24h</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block">Repurposing</span>
            <div className="font-extrabold text-slate-950 text-2xl">1 to 10 Cutdowns</div>
            <p className="text-xs text-slate-500 font-medium">Long-form into viral Shorts</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block">Editor Pod</span>
            <div className="font-extrabold text-slate-950 text-2xl">Dedicated Senior</div>
            <p className="text-xs text-slate-500 font-medium">Learns your exact style</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block">Revisions</span>
            <div className="font-extrabold text-slate-950 text-2xl">100% Unlimited</div>
            <p className="text-xs text-slate-500 font-medium">Until you approve</p>
          </div>
        </div>
      </section>

      {/* 
        ==================================================
        PREMIUM LIGHT EDITORIAL SECTION
        "What We Edit For Creators" - NO BOXES, PURE SOPHISTICATION
        ==================================================
      */}
      <section className="relative py-24 sm:py-32 bg-slate-50 border-y border-slate-200 text-slate-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-3xl mb-16 sm:mb-20 text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block mb-3">
              POST-PRODUCTION SUITE FOR CREATORS
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              From 40-minute masterclasses to 15-second viral hooks.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed max-w-2xl font-normal">
              We handle the entire post-production pipeline so you stay in your creative filming zone.
            </p>
          </div>

          {/* Open Editorial Columns (Clean, Light, Bespoke Typography) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pt-8 border-t border-slate-200 text-left">
            
            {/* Column 1: YouTube Narrative Editing */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a]">STORYTELLING &amp; RETENTION</span>
                <YouTubeBrandLogo className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                Signature YouTube Masterclasses
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Talking head videos, documentaries, vlogs, and podcast multi-cam syncs. Narrative pacing built to maximize watch time, session duration, and subscriber loyalty.
              </p>
              <ul className="pt-3 space-y-2.5 text-xs sm:text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Story arc calibration &amp; A-roll retention pacing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Subtle sound design &amp; cinematic B-roll layering</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Broadcast color grading &amp; dialogue audio mastering</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Short-Form Video */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a]">VERTICAL ALGORITHM HOOKS</span>
                <InstagramBrandLogo className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                Viral Shorts, Reels &amp; TikToks
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                High-retention vertical cutdowns with kinetic captions, sound design whooshes, zoom punch-ins, and pattern interrupts that stop thumbs from scrolling.
              </p>
              <ul className="pt-3 space-y-2.5 text-xs sm:text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Kinetic animated text &amp; contextual visual overlays</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Sub-3 second pattern interrupt hooks to stop swipe-aways</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Optimized for TikTok, Reels, &amp; YouTube Shorts</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Creative Packaging */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a]">CREATIVE PACKAGING</span>
                <CreativePackagingBrandLogo className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                Channel Identity &amp; Motion Assets
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                High-CTR YouTube thumbnail designs, branded intros, custom lower-thirds, licensed background music, and audio loudness mastering (-14 LUFS).
              </p>
              <ul className="pt-3 space-y-2.5 text-xs sm:text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>High-CTR custom YouTube thumbnail concepts</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Custom channel intro &amp; animated lower thirds</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>100% royalty-free licensed music &amp; SFX libraries</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 
        ==================================================
        HIGH-AUTHORITY CREATOR TESTIMONIALS SECTION
        Apple-grade open editorial presentation (NO CHEAP BOXES)
        ==================================================
      */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-left">
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block mb-2">
            CREATOR TESTIMONIALS &bull; SOCIAL PROOF
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B0B0D] tracking-tight">
            Trusted by creators with millions of views.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 pt-8 border-t border-slate-200">
          
          {/* Testimonial 1: Alex Tubio */}
          <div className="space-y-6">
            <div className="flex items-center gap-1 text-[#22C55E]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-bold text-[#0B0B0D] leading-snug">
              "FEVIQO completely freed up 20+ hours of my week. My views went from 100K to 800K because I can finally focus on filming instead of cutting Premiere timelines."
            </blockquote>
            <div className="flex items-center gap-4 pt-2">
              <img
                src="/images/avatars/alex-tubio.webp"
                alt="Alex Tubio"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <div className="font-extrabold text-base text-slate-950">Alex Tubio</div>
                <div className="text-xs text-slate-500 font-medium">Content Creator &bull; 800K+ Views</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2: Jenna Kutcher */}
          <div className="space-y-6">
            <div className="flex items-center gap-1 text-[#22C55E]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-bold text-[#0B0B0D] leading-snug">
              "The speed and storytelling consistency across our podcast reels and long-form YouTube episodes is unmatched. They feel like an in-house member of our creative team."
            </blockquote>
            <div className="flex items-center gap-4 pt-2">
              <img
                src="/images/avatars/jenna-kutcher.webp"
                alt="Jenna Kutcher"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <div className="font-extrabold text-base text-slate-950">Jenna Kutcher</div>
                <div className="text-xs text-slate-500 font-medium">NYT Best-Selling Author &bull; Goal Digger Podcast</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-200 py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0B0D] tracking-tight mb-3">
            Stop editing. Start creating.
          </h2>
          <p className="text-slate-600 text-base mb-8">
            Get your own dedicated video editor and publish consistently without burnout.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onBookCall}
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-base shadow-lg shadow-[#22C55E]/25 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              Get Started!
            </button>
            <button
              onClick={onNavigatePricing}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 transition-colors cursor-pointer"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};


import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { WordFadeUpHeadline } from '../WordFadeUpHeadline';
import { ArrowRight, Check, Volume2, VolumeX, TrendingUp, ShieldCheck, DollarSign, Layers, Star } from 'lucide-react';
import { Navbar } from '../Navbar';
import { SolutionsSwitcher } from '../SolutionsSwitcher';
import { HorizontalVideoShowcase } from '../HorizontalVideoShowcase';
import { StillHavingDoubtsBanner } from '../StillHavingDoubtsBanner';
import { AppRoute } from '../../types';

interface BusinessOwnersPageProps {
  onBackToHome: () => void;
  onBookCall: () => void;
  onNavigatePricing: () => void;
  onOpenVideo?: (id: string) => void;
  onNavigateSubpage?: (subpage: 'creators' | 'business' | 'agencies') => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage?: (route: AppRoute) => void;
}

const BUSINESS_SHOWCASE_VIDEOS = [
  {
    id: 'horiz-4',
    src: 'https://stream.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc.m3u8',
    poster: 'https://image.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc/thumbnail.jpg?time=1',
    title: 'Commercial SaaS Product Launch & Feature Reel',
  },
  {
    id: 'horiz-5',
    src: 'https://stream.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc.m3u8',
    poster: 'https://image.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc/thumbnail.jpg?time=1',
    title: 'Founder Vision & Brand Documentary Profile',
  },
  {
    id: 'horiz-2',
    src: 'https://stream.mux.com/K2FDm6cIXH1hmj00KDCoVtmUP00WfWqS8E5QrioFZt1LE.m3u8',
    poster: 'https://image.mux.com/K2FDm6cIXH1hmj00KDCoVtmUP00WfWqS8E5QrioFZt1LE/thumbnail.jpg?time=1',
    title: 'Narrative Brand Storytelling & Color Grading',
  },
];

export const BusinessOwnersPage: React.FC<BusinessOwnersPageProps> = ({
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
        activeTab="business"
        onSelectTab={(tab) => onNavigatePage(tab)}
      />

      {/* Hero Section - Split 2-Column Text Left / Video Right */}
      <section className="pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Two-Typography Headline & Value Props */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-6 text-emerald-900 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                SOLUTIONS &bull; BUSINESS OWNERS &amp; FOUNDERS
              </span>
            </div>

            {/* Text-only transition animation with Two Typography Styles */}
            <motion.div
              key="business-hero-text"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
            <div className="mb-5">
              <WordFadeUpHeadline
                className="font-coolvetica text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B0B0D] leading-[1.06]"
                words={[
                  { text: "Video" },
                  { text: "Production" },
                  { text: "for" },
                  { text: "Visionary", className: "font-editorial-italic font-normal text-[#16a34a]" },
                  { text: "Founders", className: "font-editorial-italic font-normal text-[#16a34a]" },
                ]}
              />
            </div>

              <p className="font-neue text-base sm:text-lg text-slate-600 max-w-xl mb-8 font-normal leading-relaxed">
                Scale your revenue, brand authority, and customer trust with video. High-converting direct response ads, customer testimonials, and master brand assets edited on demand.
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
              <button
                onClick={onBookCall}
                className="px-9 py-4 rounded-xl sm:rounded-2xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-base shadow-lg shadow-[#22C55E]/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Started!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onNavigatePricing}
                className="px-7 py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 transition-colors cursor-pointer text-center"
              >
                Explore Business Plans
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                <span className="text-slate-800 font-bold">24–48h Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                <span className="text-slate-800 font-bold">Commercial License</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                <span className="text-slate-800 font-bold">Dedicated Pod</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Video Showcase */}
          <div className="lg:col-span-6">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-200/90 group">
              <button
                type="button"
                onClick={toggleSound}
                className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-md cursor-pointer transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-[#22C55E]" />}
                <span>{isMuted ? 'Click for sound' : 'Sound on'}</span>
              </button>
              <video
                ref={videoRef}
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4"
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover cursor-pointer"
                onClick={toggleSound}
              />
            </div>
          </div>
        </div>

        {/* 4 Business Highlights Strip - Clean Open Typography (No Boxes) */}
        <div className="pt-14 mt-12 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block">Turnaround</span>
            <div className="font-extrabold text-slate-950 text-2xl">Under 24–48h</div>
            <p className="text-xs text-slate-500 font-medium">Guaranteed production SLA</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block">Zero Overhead</span>
            <div className="font-extrabold text-slate-950 text-2xl">No Payroll Drag</div>
            <p className="text-xs text-slate-500 font-medium">Skip costly $85K in-house hire</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block">Dedicated Team</span>
            <div className="font-extrabold text-slate-950 text-2xl">Assigned Senior</div>
            <p className="text-xs text-slate-500 font-medium">Art Director QA verified</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block">Commercial ROI</span>
            <div className="font-extrabold text-slate-950 text-2xl">Proven Conversions</div>
            <p className="text-xs text-slate-500 font-medium">Engineered for ROAS &amp; sales</p>
          </div>
        </div>
      </section>

      {/* 
        ==================================================
        PREMIUM LIGHT EDITORIAL SECTION
        "What We Edit For Businesses" - NO BOXES, PURE SOPHISTICATION
        ==================================================
      */}
      <section className="relative py-24 sm:py-32 bg-slate-50 border-y border-slate-200 text-slate-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-3xl mb-16 sm:mb-20 text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block mb-3">
              POST-PRODUCTION FOR HIGH-GROWTH BUSINESSES
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              High-converting assets that drive leads and commercial revenue.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed max-w-2xl font-normal">
              Turn commercial footage, customer reviews, and founder recordings into high-performing marketing assets.
            </p>
          </div>

          {/* Open Editorial Grid (Clean, Light, Bespoke Typography) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 pt-8 border-t border-slate-200 text-left">
            
            {/* Item 1: Direct Response & Paid Ads */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a]">PAID MEDIA ACQUISITION</span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                Direct-Response Customer Acquisition Ads
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Tested hooks for Meta, TikTok, and YouTube ads. Problem-solution scripting frameworks and clear calls to action engineered to maximize ROAS and customer acquisition.
              </p>
              <ul className="pt-3 space-y-2.5 text-xs sm:text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>A/B hook variants for Meta, TikTok &amp; YouTube ad sets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Subtitles, branded lower thirds, &amp; urgency callouts</span>
                </li>
              </ul>
            </div>

            {/* Item 2: Customer Case Studies & Demos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a]">PIPELINE VELOCITY</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                Client Case Breakdowns &amp; Enterprise Demos
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Transform raw Zoom client interviews and product screen shares into polished, high-trust sales collateral that builds conviction and closes enterprise deals faster.
              </p>
              <ul className="pt-3 space-y-2.5 text-xs sm:text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Studio audio sweetening &amp; verbal filler removal</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Clean UI animations &amp; product feature callout zooms</span>
                </li>
              </ul>
            </div>

            {/* Item 3: Executive Personal Brand */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a]">FOUNDER THOUGHT LEADERSHIP</span>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                Executive Personal Brand &amp; LinkedIn Video
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Elevate founder authority on LinkedIn, YouTube, and X. We turn quick 10-minute phone or webcam recordings into crisp, authoritative thought leadership clips.
              </p>
              <ul className="pt-3 space-y-2.5 text-xs sm:text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Clean square &amp; vertical crops optimized for LinkedIn feeds</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Consistent corporate brand guidelines &amp; typography</span>
                </li>
              </ul>
            </div>

            {/* Item 4: Webinars & Training */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a]">KNOWLEDGE ASSETS</span>
                <Layers className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                Corporate Training &amp; Customer Onboarding
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Clean up raw presentations, remove filler words and dead pauses, add branded slide transitions, and master audio clarity for onboarding and training.
              </p>
              <ul className="pt-3 space-y-2.5 text-xs sm:text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Chapter markers, lower-thirds &amp; section title cards</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Polished customer success &amp; training video packaging</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 
        ==================================================
        RECENT HORIZONTAL COMMERCIAL & B2B PRODUCTIONS
        ==================================================
      */}
      <HorizontalVideoShowcase
        onOpenVideo={(src, title, aspect) => onOpenVideo?.(src)}
        videos={BUSINESS_SHOWCASE_VIDEOS}
        title="B2B Case Studies, Founder Video Vlogs & Paid Ads"
        subtitle="High-converting visual assets, client case breakdowns, and executive video vlogs edited to build enterprise trust."
        tag="PROVEN COMMERCIAL &amp; VLOG PRODUCTIONS"
      />

      {/* 
        ==================================================
        HIGH-AUTHORITY BUSINESS TESTIMONIALS SECTION
        Apple-grade open editorial presentation (NO CHEAP BOXES)
        ==================================================
      */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-left">
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block mb-2">
            CLIENT RESULTS &bull; PROVEN ROI
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B0B0D] tracking-tight">
            Loved by fast-scaling business leaders.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 pt-8 border-t border-slate-200">
          
          {/* Testimonial 1: Patrick Anghel */}
          <div className="space-y-6">
            <div className="flex items-center gap-1 text-[#22C55E]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-bold text-[#0B0B0D] leading-snug">
              "We closed three $20,000 enterprise consulting contracts from a single video ad FEVIQO edited for us. That is a 20x return on our subscription in the first 45 days."
            </blockquote>
            <div className="flex items-center gap-4 pt-2">
              <img
                src="/images/avatars/patrick-anghel.webp"
                alt="Patrick Anghel"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <div className="font-extrabold text-base text-slate-950">Patrick Anghel</div>
                <div className="text-xs text-slate-500 font-medium">Creator &amp; Founder, Anghel Consulting</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2: David Chen */}
          <div className="space-y-6">
            <div className="flex items-center gap-1 text-[#22C55E]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-bold text-[#0B0B0D] leading-snug">
              "Our TikTok and Reels ad creative fatigue was killing profitability. FEVIQO delivers 6-8 fresh high-converting hooks weekly. Our ROAS spiked 2.8x in 60 days."
            </blockquote>
            <div className="flex items-center gap-4 pt-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                alt="David Chen"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-extrabold text-base text-slate-950">David Chen</div>
                <div className="text-xs text-slate-500 font-medium">DTC Brand Founder, Kumo Living</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Still Having Doubts Banner */}
      <StillHavingDoubtsBanner
        onScheduleCall={onBookCall}
        onChoosePlan={onNavigatePricing}
      />

      {/* Bottom CTA */}
      <section className="border-t border-slate-200 py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0B0D] tracking-tight mb-3">
            Scale your business with professional video.
          </h2>
          <p className="text-slate-600 text-base mb-8">
            Flat monthly rate. Dedicated senior editor. Cancel or pause anytime.
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


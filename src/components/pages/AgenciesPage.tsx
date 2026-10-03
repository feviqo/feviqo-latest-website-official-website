import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { WordFadeUpHeadline } from '../WordFadeUpHeadline';
import { ArrowRight, Check, Volume2, VolumeX, Shield, Users, Zap, Briefcase, Star, X } from 'lucide-react';
import { Navbar } from '../Navbar';
import { SolutionsSwitcher } from '../SolutionsSwitcher';
import { HorizontalVideoShowcase } from '../HorizontalVideoShowcase';
import { StillHavingDoubtsBanner } from '../StillHavingDoubtsBanner';
import { AppRoute } from '../../types';
import { attachHlsStream } from '../../utils/hlsPlayer';

interface AgenciesPageProps {
  onBackToHome: () => void;
  onBookCall: () => void;
  onNavigatePricing: () => void;
  onOpenVideo?: (id: string) => void;
  onNavigateSubpage?: (subpage: 'creators' | 'business' | 'agencies') => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage?: (route: AppRoute) => void;
}

const AGENCY_SHOWCASE_VIDEOS = [
  {
    id: 'horiz-8',
    src: 'https://stream.mux.com/x4EDg00kQy500i66WJzz4OXT2hMluOCUd6XE23t4Ts4aw.m3u8',
    poster: 'https://image.mux.com/x4EDg00kQy500i66WJzz4OXT2hMluOCUd6XE23t4Ts4aw/thumbnail.jpg?time=1',
    title: 'Brand Commercial & Motion Graphics Launch Cut',
  },
  {
    id: 'horiz-6',
    src: 'https://stream.mux.com/U02eycl00wLlvS6xpkRcIMmlceX4tr726fxssHMKbYFnM.m3u8',
    poster: 'https://image.mux.com/U02eycl00wLlvS6xpkRcIMmlceX4tr726fxssHMKbYFnM/thumbnail.jpg?time=1',
    title: 'Cinematic Visual Showcase & Color Grade Cut',
  },
  {
    id: 'horiz-2',
    src: 'https://stream.mux.com/K2FDm6cIXH1hmj00KDCoVtmUP00WfWqS8E5QrioFZt1LE.m3u8',
    poster: 'https://image.mux.com/K2FDm6cIXH1hmj00KDCoVtmUP00WfWqS8E5QrioFZt1LE/thumbnail.jpg?time=1',
    title: 'Narrative Brand Storytelling & Color Grading',
  },
];

const AGENCY_SPECS = [
  { label: 'Turnaround SLA', val: '24–48 Hours', sub: 'Guaranteed delivery' },
  { label: 'White-Label QA', val: 'Art Director Checked', sub: 'Client ready ProRes' },
  { label: 'Communication', val: 'Private Slack / Portal', sub: 'Direct pod sync' },
  { label: 'Brand Kits', val: 'Unlimited Client Brands', sub: 'Strict style adherence' },
];

const AGENCY_WORKFLOW = [
  {
    step: '01',
    entity: 'CLIENT INGEST',
    title: 'Your Client Ingest',
    desc: 'Your clients send raw footage, product demos, or webinar recordings. You own the high-value client relationship and brand strategy completely.',
  },
  {
    step: '02',
    entity: 'CREATIVE BRIEF',
    title: 'Strategy & Hook Variations',
    desc: 'Your media buyers queue briefs, angles, and hook variations into your private Slack channel or board with zero friction.',
  },
  {
    step: '03',
    entity: 'DEDICATED POD',
    title: 'Assigned Senior Editor',
    desc: 'A dedicated senior video editor matched to your agency accounts. They memorize each client’s distinct brand kits, font pairings, color palettes, and motion assets.',
  },
  {
    step: '04',
    entity: 'STUDIO QA',
    title: 'Art Director Quality Control',
    desc: 'Before any cut reaches your agency, our in-house Art Director inspects pacing, color calibration, typography, and audio levels. You never have to QC amateur mistakes.',
  },
  {
    step: '05',
    entity: 'WHITE-LABEL',
    title: 'White-Label Master Delivery',
    desc: 'Receive master ProRes exports in 24–48 hours, fully white-labeled and ready to deliver to your client or upload directly to ad managers.',
  },
];

export const AgenciesPage: React.FC<AgenciesPageProps> = ({
  onBackToHome,
  onBookCall,
  onNavigatePricing,
  onOpenVideo,
  onNavigateFlow = () => {},
  onNavigatePage = (_route: AppRoute) => {},
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  React.useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = true;
    const cleanup = attachHlsStream(vid, 'https://stream.mux.com/hQglpqXvqnXLQq57m01p5dRGsGT3JQjUxJZX4sc02pfWs.m3u8', {
      autoPlay: true
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

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
        activeTab="agencies"
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
                SOLUTIONS &bull; PERFORMANCE MARKETING AGENCIES
              </span>
            </div>

            {/* Text-only transition animation with Two Typography Styles */}
            <motion.div
              key="agencies-hero-text"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
            <div className="mb-5">
              <WordFadeUpHeadline
                className="font-coolvetica text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B0B0D] leading-[1.06]"
                words={[
                  { text: "Video" },
                  { text: "Editing" },
                  { text: "for" },
                  { text: "Marketing", className: "font-editorial-italic font-normal text-[#16a34a]" },
                  { text: "Agencies", className: "font-editorial-italic font-normal text-[#16a34a]" },
                ]}
              />
            </div>

              <p className="font-neue text-base sm:text-lg text-slate-600 max-w-xl mb-8 font-normal leading-relaxed">
                Elastic video editing capacity for growth marketing teams. Dedicated senior pods integrated into your agency workflow with white-label master delivery and 24–48h SLA turnarounds.
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
                Review Retainer Plans
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                <span className="text-slate-800 font-bold">100% White-Label</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                <span className="text-slate-800 font-bold">Unlimited Brands</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                <span className="text-slate-800 font-bold">Private Slack Pod</span>
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

        {/* Agency Spec Strip - Clean Open Typography (No Boxes) */}
        <div className="pt-14 mt-12 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
          {AGENCY_SPECS.map((p) => (
            <div key={p.label} className="space-y-1">
              <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block">
                {p.label}
              </span>
              <div className="font-extrabold text-slate-950 text-2xl">{p.val}</div>
              <p className="text-xs text-slate-500 font-medium">{p.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 
        ==================================================
        PREMIUM LIGHT EDITORIAL SECTION
        "The Agency Scaling Challenge" - NO BOXES, PURE SOPHISTICATION
        ==================================================
      */}
      <section className="relative py-24 sm:py-32 bg-slate-50 border-y border-slate-200 text-slate-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-3xl mb-16 sm:mb-20 text-left">
            <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block mb-3">
              POST-PRODUCTION CAPACITY FOR AGENCIES
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              Winning retainer clients is exciting. Producing 50+ video cuts every week is what breaks agency ops.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed max-w-2xl font-normal">
              FEVIQO delivers dependable, elastic editing capacity on tap so your account managers never miss a client campaign deadline.
            </p>
          </div>

          {/* Open Editorial Columns (Clean, Light, Bespoke Typography) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pt-8 border-t border-slate-200 text-left">
            
            {/* Column 1: In-House Editors */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">INTERNAL HIRING</span>
                <X className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                The Overhead of In-House Staff
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                $80K+ annual payroll per editor plus workstation hardware and benefits. When client retainers fluctuate, you're stuck paying idle salaries.
              </p>
              <ul className="pt-3 space-y-2.5 text-xs sm:text-sm font-medium text-slate-600">
                <li>&bull; Fixed payroll overhead and heavy operational management burden</li>
                <li>&bull; Sick leave, holidays, and turnover disruption right before deadlines</li>
                <li>&bull; Expensive hardware workstations &amp; software licenses</li>
              </ul>
            </div>

            {/* Column 2: Random Freelancers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">FREELANCE CONTRACTORS</span>
                <X className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                Erratic Marketplaces &amp; Contractors
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Inconsistent editing quality and erratic pacing. Freelancers ghost right before client ad spend activates, forcing your account team to panic-edit.
              </p>
              <ul className="pt-3 space-y-2.5 text-xs sm:text-sm font-medium text-slate-600">
                <li>&bull; Zero dedicated QA — your team fixes amateur mistakes</li>
                <li>&bull; Unreliable turnarounds and ghosting risks on campaign launch days</li>
                <li>&bull; Every new contractor needs extensive re-briefing &amp; onboarding</li>
              </ul>
            </div>

            {/* Column 3: FEVIQO Dedicated Pod */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a]">FEVIQO AGENCY SOLUTION</span>
                <Check className="w-5 h-5 text-[#16a34a]" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#16a34a] tracking-tight leading-snug">
                Dedicated White-Label Agency Pod
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                Dedicated senior editors matched to your agency brands. Internal Art Director checks every cut before delivery with guaranteed 24–48h turnarounds.
              </p>
              <ul className="pt-3 space-y-2.5 text-xs sm:text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>100% white-label client-ready master ProRes files</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Private Slack channel sync directly with your media buyers</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Scale up or down retainers elastically as client roster shifts</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* The 5-Step Agency Production Flow */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full py-20 border-t border-slate-100 text-left">
        <div className="mb-14">
          <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block mb-3">
            AGENCY PRODUCTION ENGINE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0B0D] tracking-tight">
            How FEVIQO seamlessly powers your client deliverables.
          </h2>
        </div>

        <div className="space-y-8">
          {AGENCY_WORKFLOW.map((step) => (
            <div key={step.step} className="border-t border-slate-200 pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
              <div className="md:col-span-3">
                <span className="text-3xl sm:text-4xl font-black text-[#22C55E] tracking-tight font-sans">
                  {step.step}
                </span>
                <div className="text-xs uppercase text-slate-900 font-bold tracking-wider mt-1 font-sans">
                  {step.entity}
                </div>
              </div>
              <div className="md:col-span-9">
                <h3 className="text-xl sm:text-2xl font-bold text-[#0B0B0D] mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 
        ==================================================
        RECENT HORIZONTAL WHITE-LABEL AGENCY PRODUCTIONS
        ==================================================
      */}
      <HorizontalVideoShowcase
        onOpenVideo={(src, title, aspect) => onOpenVideo?.(src)}
        videos={AGENCY_SHOWCASE_VIDEOS}
        title="Marketing Freelance Growth, Client Video Vlogs & Campaign Cuts"
        subtitle="High-impact marketing breakdowns, client vlogs, and performance ad deliverables produced white-label under your agency brand."
        tag="WHITE-LABEL MARKETING &amp; VLOG PRODUCTIONS"
      />

      {/* 
        ==================================================
        HIGH-AUTHORITY AGENCY TESTIMONIALS SECTION
        Apple-grade open editorial presentation (NO CHEAP BOXES)
        ==================================================
      */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-left bg-slate-50/50 border-t border-slate-200">
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block mb-3">
            AGENCY PARTNERS &bull; PROVEN SCALE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B0B0D] tracking-tight">
            Trusted by growth marketing agencies worldwide.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 pt-8 border-t border-slate-200">
          
          {/* Testimonial 1: Danny Barrera */}
          <div className="space-y-6">
            <div className="flex items-center gap-1 text-[#22C55E]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-bold text-[#0B0B0D] leading-snug">
              "We fulfilled over 500 video projects with FEVIQO across 18 agency brand accounts. Having dedicated editing pods eliminated our internal hiring overhead completely."
            </blockquote>
            <div className="flex items-center gap-4 pt-2">
              <img
                src="/images/avatars/danny-barrera.webp"
                alt="Danny Barrera"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <div className="font-extrabold text-base text-slate-950">Danny Barrera</div>
                <div className="text-xs text-slate-500 font-medium">Agency Founder &amp; CEO, Concrete Agency</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2: Marcus Vance */}
          <div className="space-y-6">
            <div className="flex items-center gap-1 text-[#22C55E]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-bold text-[#0B0B0D] leading-snug">
              "Our media buyers can test 15 new video ad creative variants every single week without slowing down our creative team. The speed and white-label QA are unparalleled."
            </blockquote>
            <div className="flex items-center gap-4 pt-2">
              <img
                src="/images/avatars/justin-knopp.webp"
                alt="Marcus Vance"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <div className="font-extrabold text-base text-slate-950">Marcus Vance</div>
                <div className="text-xs text-slate-500 font-medium">Head of Growth, Hypergrowth.io</div>
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
            Scale your agency's creative bandwidth.
          </h2>
          <p className="text-slate-600 text-base mb-8">
            White-label delivery. Dedicated Slack communication. Instant on-demand scaling.
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
              View Retainer Plans
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};


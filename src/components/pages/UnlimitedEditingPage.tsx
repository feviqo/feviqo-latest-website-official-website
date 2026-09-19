import React from 'react';
import { ArrowRight, Check, Sparkles, Clock, RefreshCw, Shield, Film, Layers } from 'lucide-react';
import { Navbar } from '../Navbar';
import { AppRoute } from '../../types';

interface UnlimitedEditingPageProps {
  onBackToHome: () => void;
  onBookCall: () => void;
  onNavigatePricing: () => void;
  onOpenFlow: (view?: 'login' | 'register' | 'admin') => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigatePage?: (route: AppRoute) => void;
}

const SERVICE_CAPABILITIES = [
  {
    number: '01',
    name: 'YouTube Long-Form (16:9)',
    desc: 'Deep-dive masterclasses, podcasts, vlogs, and tutorials with narrative retention pacing and multi-cam synchronization.',
  },
  {
    number: '02',
    name: 'Short-Form Social (9:16)',
    desc: 'High-velocity vertical cutdowns for TikTok, Instagram Reels, and YouTube Shorts with kinetic animated typography and visual pattern interrupts.',
  },
  {
    number: '03',
    name: 'Paid Acquisition & Direct Response Ads',
    desc: 'High-converting performance ad creatives engineered with 3-second hook variations, problem-solution arcs, and conversion-tested end cards.',
  },
  {
    number: '04',
    name: 'Kinetic Motion Graphics & 2D FX',
    desc: 'Custom branded lower thirds, animated callout arrows, motion infographics, spotlight callouts, and bespoke title animations.',
  },
  {
    number: '05',
    name: 'Cinema Sound Design & Voice Mastering',
    desc: 'Vocal noise reduction, broadcast loudness mastering (-14 LUFS), spatial foley, risers, whooshes, and curated licensed music integration.',
  },
  {
    number: '06',
    name: 'Cinematic Color Grading',
    desc: 'Color conversion of flat LOG/RAW camera footage to vibrant, cinematic color spaces with consistent natural skin tones and rich contrast.',
  },
];

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: '1. Request',
    desc: 'Submit video orders directly into our dashboard. Upload raw 4K footage, multicam audio, and creative guidelines in bulk.',
  },
  {
    num: '02',
    title: '2. Edit & Review',
    desc: 'Your dedicated senior editor cuts, paces, color grades, and masters your video in 24–48 hours. Leave frame-accurate comments.',
  },
  {
    num: '03',
    title: '3. Download & Scale',
    desc: 'Receive master ProRes and social-ready exports with unlimited revisions until every cut is completely approved.',
  },
];

export const UnlimitedEditingPage: React.FC<UnlimitedEditingPageProps> = ({
  onBackToHome,
  onBookCall,
  onNavigatePricing,
  onOpenFlow,
  onNavigateSection,
  onNavigatePage,
}) => {
  return (
    <div className="min-h-screen bg-white text-[#0B0B0D] font-sans antialiased selection:bg-[#22C55E] selection:text-slate-950 flex flex-col">
      {/* Navigation */}
      <Navbar 
        onBookCall={onBookCall}
        onNavigateSection={onNavigateSection || onBackToHome}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onOpenFlow}
        onNavigatePage={onNavigatePage || ((route) => {
          if (route === 'home') onBackToHome();
        })}
      />

      {/* Hero Section */}
      <section className="pt-14 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-6 text-emerald-900">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-emerald-800 uppercase">
            SERVICES &bull; UNLIMITED VIDEO EDITING
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#0B0B0D] leading-[1.08] max-w-4xl mx-auto mb-5">
          You Shoot the Footage. <br />
          <span className="text-[#22C55E]">We Deliver the Master Cuts.</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          A dedicated senior editor and creative director integrated into your workflow. Submit unlimited requests, get fast 24–48h turnarounds, and publish consistently without managing freelancers.
        </p>

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
            View Retainer Plans
          </button>
        </div>

        {/* Feature Strip - Clean Apple-Grade Editorial Typography */}
        <div className="pt-10 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block">Turnaround SLA</span>
            <div className="font-extrabold text-[#0B0B0D] text-2xl tracking-tight">24–48 Hours</div>
            <p className="text-xs text-slate-500 font-medium">Guaranteed production delivery</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block">Editing Team</span>
            <div className="font-extrabold text-[#0B0B0D] text-2xl tracking-tight">Dedicated Editor</div>
            <p className="text-xs text-slate-500 font-medium">Matched to your brand style</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block">Revisions</span>
            <div className="font-extrabold text-[#0B0B0D] text-2xl tracking-tight">Unlimited</div>
            <p className="text-xs text-slate-500 font-medium">Frame-accurate revisions</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block">Production Assets</span>
            <div className="font-extrabold text-[#0B0B0D] text-2xl tracking-tight">All Included</div>
            <p className="text-xs text-slate-500 font-medium">Licensed audio, SFX &amp; motion</p>
          </div>
        </div>
      </section>

      {/* How it works: 3 Steps */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full py-16 sm:py-24 border-t border-slate-100 text-left">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block mb-3">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0B0D] tracking-tight">
            Request, review, and scale your video production.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {WORKFLOW_STEPS.map((step) => (
            <div key={step.num} className="p-8 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-left space-y-3">
              <span className="text-xs font-bold text-[#16a34a] uppercase tracking-wider block">
                PHASE {step.num}
              </span>
              <h3 className="text-xl font-bold text-[#0B0B0D] tracking-tight">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scope of Production Capabilities */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full py-16 sm:py-24 border-t border-slate-100 text-left">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block mb-3">
            SCOPE OF CRAFT
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0B0D] tracking-tight">
            Every format your brand requires.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {SERVICE_CAPABILITIES.map((item) => (
            <div key={item.number} className="border-t border-slate-200 pt-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {item.number}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#0B0B0D] tracking-tight">{item.name}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-200 py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 text-center mt-auto">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0B0D] tracking-tight mb-3">
            Start getting your videos edited today.
          </h2>
          <p className="text-slate-600 text-base mb-8">
            Transparent flat monthly pricing. No contract lock-in. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onBookCall}
              className="w-full sm:w-auto px-9 py-4 rounded-xl sm:rounded-2xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-base shadow-lg shadow-[#22C55E]/25 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              Get Started!
            </button>
            <button
              onClick={onNavigatePricing}
              className="w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 transition-colors cursor-pointer"
            >
              View Retainer Plans
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Lock, Upload, Play, MessageSquare, Download } from 'lucide-react';
import { Navbar } from '../Navbar';
import { AppRoute } from '../../types';

interface PlatformOverviewPageProps {
  onBackToHome: () => void;
  onBookCall: () => void;
  onNavigatePricing: () => void;
  onOpenFlow: (view?: 'login' | 'register' | 'admin') => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigatePage?: (route: AppRoute) => void;
}

const WORKFLOW_STAGES = [
  {
    phase: '01',
    title: 'High-Speed Footage Ingest',
    desc: 'Drag and drop 4K raw footage, multi-track audio, and brand guidelines directly into your private queue without upload limits or complicated file transfers.',
    icon: Upload,
  },
  {
    phase: '02',
    title: 'Transparent Production Queues',
    desc: 'Always know the exact status of every project. Watch your requests advance in real-time from In Queue to Active Editing and Internal Quality Assurance.',
    icon: Play,
  },
  {
    phase: '03',
    title: 'Frame-Accurate Video Review',
    desc: 'Pause at any exact frame, click on the video player, and leave precise visual feedback. No more confusing timestamps or messy email threads.',
    icon: MessageSquare,
  },
  {
    phase: '04',
    title: 'Instant Master Asset Downloads',
    desc: 'Access broadcast-grade 4K masters, 9:16 vertical exports, custom thumbnails, and project project archives ready for immediate syndication.',
    icon: Download,
  },
];

export const PlatformOverviewPage: React.FC<PlatformOverviewPageProps> = ({
  onBackToHome,
  onBookCall,
  onNavigatePricing,
  onOpenFlow,
  onNavigateSection,
  onNavigatePage,
}) => {
  return (
    <div className="min-h-screen bg-white text-[#0B0B0D] font-sans antialiased selection:bg-[#22C55E] selection:text-white flex flex-col">
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

      {/* Hero */}
      <section className="pt-16 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-6 text-emerald-900">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            SERVICES • FEVIQO FLOW
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl mx-auto mb-6 text-[#0B0B0D]">
          The creative portal designed for frictionless post-production.
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          FEVIQO Flow replaces scattered Google Drive links, lost Slack messages, and messy email chains with a clean, centralized studio workspace. Queue projects, review cuts, and download master assets.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onOpenFlow('login')}
            className="w-full sm:w-auto px-9 py-4 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-base tracking-tight shadow-xl shadow-[#22C55E]/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Open Client Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onBookCall}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 transition-colors cursor-pointer"
          >
            Book Workflow Walkthrough
          </button>
        </div>
      </section>

      {/* Workflow Stages (Editorial Narrative) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full py-16 sm:py-24 border-t border-slate-100 text-left">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block mb-2">
            The Studio Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0B0B0D] tracking-tight">
            How creative work moves from raw footage to final master.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {WORKFLOW_STAGES.map((stage, idx) => (
            <div key={idx} className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">STAGE {stage.phase}</span>
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              </div>
              <h3 className="text-lg font-bold text-[#0B0B0D] mb-2">{stage.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{stage.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Studio Infrastructure Pillars */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full py-16 sm:py-24 border-t border-slate-100 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-semibold text-[#16a34a] uppercase tracking-wider block mb-2">Privacy &amp; Security</span>
            <h4 className="font-bold text-base text-[#0B0B0D] mb-1.5">Private Client Segregation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every client workspace is encrypted and strictly isolated. Your raw footage, brand guides, and campaign edits remain completely confidential.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-semibold text-[#16a34a] uppercase tracking-wider block mb-2">Team Collaboration</span>
            <h4 className="font-bold text-base text-[#0B0B0D] mb-1.5">Multi-Seat Team Access</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Invite your creative directors, copywriters, or agency stakeholders to review cuts and approve deliveries without per-seat charges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-semibold text-[#16a34a] uppercase tracking-wider block mb-2">Turnaround Guarantee</span>
            <h4 className="font-bold text-base text-[#0B0B0D] mb-1.5">Daily Production Velocity</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard requests delivered within 24–48 business hours with proactive status updates so your team never wonders about progress.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-200 py-16 px-4 sm:px-6 lg:px-8 bg-slate-50/50 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-[#0B0B0D] tracking-tight mb-4">
            Experience the future of creative post-production.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mb-8">
            Access your dedicated creative portal and start submitting projects today.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => onOpenFlow('login')}
              className="px-8 py-3.5 rounded-full bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-black font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              <span>Access FEVIQO Flow</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigatePricing}
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 transition-colors cursor-pointer"
            >
              View Plans
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

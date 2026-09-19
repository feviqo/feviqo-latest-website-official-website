import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Film, 
  Layers, 
  TrendingUp, 
  Tv, 
  Languages, 
  Sparkles, 
  BarChart3, 
  Check, 
  X, 
  Mail, 
  Copy, 
  Building2, 
  Globe, 
  AlertCircle
} from 'lucide-react';
import { Navbar } from '../Navbar';
import { AppRoute } from '../../types';

interface TurkishDramaPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

export const TurkishDramaPage: React.FC<TurkishDramaPageProps> = ({
  onBackToHome,
  onBookCall,
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const PARTNERSHIP_EMAIL = 'partner@feviqo.com';
  const PARTNERSHIP_MAILTO = `mailto:${PARTNERSHIP_EMAIL}?subject=${encodeURIComponent(
    'Licensing Partnership Proposal: Turkish Content / Urdu Localization'
  )}&body=${encodeURIComponent(
    'Hello FEVIQO Content Partnerships Team,\n\nWe would like to discuss a potential licensing and digital distribution partnership for Turkish content in Pakistan.\n\nOrganization / Studio:\nCatalog / Series Title(s):\nTerritory / Language Scope: Pakistan (Urdu Localization)\nPlatform Scope: YouTube / Digital AVOD\nContact Person & Title:\n\nLooking forward to speaking with your licensing desk.\n\nBest regards,'
  )}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PARTNERSHIP_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleScrollToOverview = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans selection:bg-[#22C55E] selection:text-slate-950">
      {/* Global Brand Navbar */}
      <Navbar
        onBookCall={onBookCall || (() => {})}
        onNavigateSection={() => onNavigatePage('home')}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      {/* ============================================================ */}
      {/* HERO SECTION — EXECUTIVE LICENSING PROPOSAL */}
      {/* ============================================================ */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200 bg-gradient-to-b from-[#FFFFFF] via-[#F4FDF7] to-[#FFFFFF] overflow-hidden">
        {/* Subtle decorative glow with #22C55E */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Category Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-slate-950 text-[#FFFFFF] shadow-sm mb-6 border border-slate-800">
            <Globe className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Licensing & Digital Distribution Proposal</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 max-w-4xl leading-[1.1] mb-6 uppercase">
            TURKISH STORIES.<br />
            BUILT FOR <span className="text-[#22C55E] drop-shadow-sm">URDU AUDIENCES</span>.
          </h1>

          {/* Clear Core Mission Statement */}
          <p className="text-lg sm:text-xl text-slate-700 max-w-3xl leading-relaxed mb-6">
            FEVIQO is seeking to obtain licensing rights for selected Turkish content for Urdu localization and authorized digital distribution in Pakistan. We propose an authorized, revenue-sharing digital model combining professional Urdu localization, dedicated YouTube channel management, audience development, and transparent commercialization.
          </p>

          {/* Upfront Legal & Rights Clarity Badge */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 max-w-3xl mb-8 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              <strong className="text-amber-900 font-bold">Exploratory Licensing Inquiry:</strong> FEVIQO does not claim, own, or represent existing distribution or intellectual property rights to any third-party series. This document represents a formal distribution proposal to international content owners and sales agencies.
            </p>
          </div>

          {/* ONE Simple CTA: Discuss a Licensing Partnership */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              id="cta-discuss-licensing-hero"
              href={PARTNERSHIP_MAILTO}
              className="px-8 py-4 rounded-full bg-[#22C55E] hover:bg-[#1eb054] text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#22C55E]/20 hover:shadow-xl hover:shadow-[#22C55E]/30 inline-flex items-center gap-2.5 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Discuss a Licensing Partnership</span>
            </a>

            <button
              onClick={() => handleScrollToOverview('the-opportunity')}
              className="px-8 py-4 rounded-full bg-[#FFFFFF] hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-sm tracking-wider transition cursor-pointer shadow-sm"
            >
              Review Proposal Overview
            </button>
          </div>

          {/* Quick Specifications Strip */}
          <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-slate-200 shadow-sm hover:border-[#22C55E]/40 transition">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Target Territory</span>
              <span className="text-sm font-black text-slate-950 mt-1 block">Pakistan</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-slate-200 shadow-sm hover:border-[#22C55E]/40 transition">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Target Language</span>
              <span className="text-sm font-black text-slate-950 mt-1 block">Urdu Localization</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-slate-200 shadow-sm hover:border-[#22C55E]/40 transition">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Primary Platform</span>
              <span className="text-sm font-black text-slate-950 mt-1 block">YouTube / Digital AVOD</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-slate-200 shadow-sm hover:border-[#22C55E]/40 transition">
              <span className="text-[10px] font-black text-[#22C55E] uppercase tracking-widest block">Commercial Model</span>
              <span className="text-sm font-black text-slate-950 mt-1 block">Revenue-Share Model</span>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 01 — THE MARKET OPPORTUNITY */}
      {/* ============================================================ */}
      <section id="the-opportunity" className="py-20 border-b border-slate-200 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
              01 / MARKET OPPORTUNITY
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-2 leading-tight">
              TURKISH CONTENT ALREADY HAS THE STORY.<br />
              WE BUILD THE LOCAL DIGITAL CHANNEL.
            </h2>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-[#FFFFFF] border border-slate-200 shadow-sm space-y-6">
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              Turkish television has achieved unprecedented popularity across South Asia, particularly in Pakistan, where cultural affinity, production values, and dramatic depth resonate with a population of over 240 million people.
            </p>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              FEVIQO's objective is to partner with rights holders to extend their premier titles into the Pakistani Urdu-speaking digital ecosystem through an authorized, locally operated distribution model that captures latent demand and converts it into sustained, legitimate commercial value.
            </p>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              Rather than traditional static licensing where masters are simply transferred, FEVIQO handles end-to-end local digital execution:
            </p>

            {/* Execution Process Chain */}
            <div className="py-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black text-slate-950 uppercase tracking-wider">
                <span className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200">LOCALIZE</span>
                <span className="text-[#22C55E] font-bold">→</span>
                <span className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200">PUBLISH</span>
                <span className="text-[#22C55E] font-bold">→</span>
                <span className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200">PROMOTE</span>
                <span className="text-[#22C55E] font-bold">→</span>
                <span className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200">MONETIZE</span>
                <span className="text-[#22C55E] font-bold">→</span>
                <span className="px-4 py-2.5 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/40 text-slate-950 font-black">REPORT</span>
              </div>
            </div>

            {/* Credibility statement */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs sm:text-sm text-slate-500 font-medium italic">
                All distribution operates strictly within defined territory, language, platform, and term parameters established under written licensing contracts with authorized rights holders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 02 — THE PARTNERSHIP ARCHITECTURE */}
      {/* ============================================================ */}
      <section id="partnership-model" className="py-20 border-b border-slate-200 bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
              02 / CO-DEVELOPMENT ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-2 leading-tight">
              WE DON'T JUST LOCALIZE THE CONTENT.<br />
              WE BUILD THE DISTRIBUTION BUSINESS AROUND IT.
            </h2>
          </div>

          {/* Premium Visual Flow Banner with Header-Style Palette */}
          <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-[#FFFFFF] border border-[#064e3b] shadow-2xl">
            <div className="text-xs uppercase tracking-widest text-[#22C55E] font-black mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#22C55E]" />
              <span>Value Creation Architecture</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center">
              {[
                'TURKISH CONTENT',
                'AUTHORIZED RIGHTS',
                'FEVIQO LOCALIZATION',
                'OFFICIAL DIGITAL CHANNEL',
                'PAKISTAN / URDU AUDIENCE',
                'ADVERTISING + SPONSORSHIPS',
                'TRANSPARENT REVENUE SHARE',
              ].map((step, idx, arr) => (
                <React.Fragment key={step}>
                  <div className="w-full md:w-auto px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-[11px] font-black uppercase tracking-wider text-emerald-100 backdrop-blur-sm">
                    {step}
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="text-[#22C55E] font-black text-xs md:text-sm my-1 md:my-0">
                      <span className="hidden md:inline">→</span>
                      <span className="md:hidden">↓</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Core Message Callout */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm sm:text-base font-black tracking-wide text-[#FFFFFF] uppercase">
                YOU RETAIN 100% OWNERSHIP OF YOUR INTELLECTUAL PROPERTY. WE EXECUTE THE LOCAL DIGITAL OPERATIONS. <span className="text-[#22C55E]">WE SHARE THE UPSIDE.</span>
              </p>
            </div>
          </div>

          {/* 6 Structured Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-slate-200 hover:border-[#22C55E]/40 transition">
              <div className="text-xs font-black text-[#22C55E] uppercase tracking-wider mb-2">
                01 — RIGHTS HOLDER
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                Provides the agreed master content and authorized digital distribution rights for Pakistan under defined territorial and language terms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-slate-200 hover:border-[#22C55E]/40 transition">
              <div className="text-xs font-black text-[#22C55E] uppercase tracking-wider mb-2">
                02 — FEVIQO EXECUTION
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                Manages complete local digital execution: studio Urdu subtitle translation, dubbing supervision, thumbnail design, and channel management.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-slate-200 hover:border-[#22C55E]/40 transition">
              <div className="text-xs font-black text-[#22C55E] uppercase tracking-wider mb-2">
                03 — AUDIENCE ACCUMULATION
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                Reaches millions of Urdu-speaking viewers through a verified, official destination rather than unauthorized low-resolution uploads.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-slate-200 hover:border-[#22C55E]/40 transition">
              <div className="text-xs font-black text-[#22C55E] uppercase tracking-wider mb-2">
                04 — MONETIZATION
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                Generates programmatic advertising revenue through YouTube AVOD alongside rights-holder approved local brand sponsorships.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-slate-200 hover:border-[#22C55E]/40 transition">
              <div className="text-xs font-black text-[#22C55E] uppercase tracking-wider mb-2">
                05 — AUDITED REPORTING
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                Regular transparent analytics and revenue statements delivered directly to the rights holder's international commercial desk.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-slate-200 hover:border-[#22C55E]/40 transition">
              <div className="text-xs font-black text-[#22C55E] uppercase tracking-wider mb-2">
                06 — REVENUE SETTLEMENT
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                Agreed revenue-share percentages distributed punctually, creating a recurring international income stream from previously untapped viewers.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 03 — WHAT FEVIQO DELIVERS */}
      {/* ============================================================ */}
      <section className="py-20 border-b border-slate-200 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
              03 / CAPABILITIES & OPERATIONS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-2 leading-tight">
              ONE LOCAL PARTNER.<br />
              THE FULL DIGITAL EXECUTION LAYER.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-7 rounded-2xl bg-[#FFFFFF] border border-slate-200 space-y-3 shadow-sm hover:border-[#22C55E]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <Languages className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-black text-slate-950 uppercase tracking-wider">
                URDU LOCALIZATION
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Professional Urdu subtitle translation preserving cultural nuance and emotional cadence, with capacity for coordinated studio Urdu dubbing upon mutual agreement.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FFFFFF] border border-slate-200 space-y-3 shadow-sm hover:border-[#22C55E]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <Tv className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-black text-slate-950 uppercase tracking-wider">
                YOUTUBE CHANNEL MANAGEMENT
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Official verified channel deployment, scheduled episode publishing, SEO metadata, playlist architectures, and automated rights compliance.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FFFFFF] border border-slate-200 space-y-3 shadow-sm hover:border-[#22C55E]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <Film className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-black text-slate-950 uppercase tracking-wider">
                PACKAGING & PROMOS
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                High-CTR thumbnail creation, localized episodic teaser reels, YouTube Shorts, and promotional trailers engineered to drive viewing retention.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FFFFFF] border border-slate-200 space-y-3 shadow-sm hover:border-[#22C55E]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-black text-slate-950 uppercase tracking-wider">
                AUDIENCE DEVELOPMENT
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Active community building, comment moderation, cross-platform social clip distribution, and sustained engagement to elevate subscriber loyalty.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FFFFFF] border border-slate-200 space-y-3 shadow-sm hover:border-[#22C55E]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-black text-slate-950 uppercase tracking-wider">
                COMMERCIAL EXPANSION
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Optimized YouTube ad placement and, subject to rights-holder approval, introductions to major Pakistani corporate advertisers for brand integration.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FFFFFF] border border-slate-200 space-y-3 shadow-sm hover:border-[#22C55E]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <BarChart3 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-black text-slate-950 uppercase tracking-wider">
                TRANSPARENT REPORTING
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Regular, auditable reports on watch time, geographical breakdown, monetization RPM, and revenue allocation according to contractual milestones.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 04 — THE PROBLEM FEVIQO SOLVES */}
      {/* ============================================================ */}
      <section className="py-20 border-b border-slate-200 bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
              04 / THE BOTTLENECK
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-2 leading-tight">
              THE STATUS QUO HURTS BOTH RIGHTS HOLDERS AND AUDIENCES.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* For Rights Holders */}
            <div className="p-8 rounded-3xl bg-[#FAFAF8] border border-slate-200">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>FOR RIGHTS HOLDERS CURRENTLY</span>
              </h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>Unmonetized viewership across third-party pirated uploads</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>Fragmented audience with zero direct subscriber relationship</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>No control over localized brand presentation or creative quality</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>Lost commercial opportunities in a 240M+ consumer territory</span>
                </li>
              </ul>
            </div>

            {/* For Viewers */}
            <div className="p-8 rounded-3xl bg-[#FAFAF8] border border-slate-200">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
                <Tv className="w-4 h-4 text-slate-600" />
                <span>FOR PAKISTANI VIEWERS CURRENTLY</span>
              </h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>Poor, machine-translated Urdu subtitles that damage dialogue</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>Missing episodes and incomplete season catalogs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>Low-resolution, re-encoded video uploads on dubious channels</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>Lack of an official, verified destination to watch the drama</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="p-6 rounded-2xl bg-[#F4FDF7] border border-[#22C55E]/30">
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              FEVIQO's proposed solution transforms this fragmented, lost viewership into an official, professionally managed, authorized channel that generates legitimate recurring revenue for the rights holder.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 05 — COMPARISON MATRIX */}
      {/* ============================================================ */}
      <section className="py-20 border-b border-slate-200 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
              05 / VALUE COMPARISON
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-2 leading-tight">
              TURN FRAGMENTED DIGITAL DEMAND INTO AN OFFICIAL DESTINATION.
            </h2>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Without Official Distribution */}
            <div className="p-8 rounded-3xl bg-[#FFFFFF] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider mb-6">
                <X className="w-4 h-4 text-rose-500" />
                <span>WITHOUT OFFICIAL LOCALIZED DISTRIBUTION</span>
              </div>
              <ul className="space-y-3.5 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400">•</span>
                  <span>Unverified, random third-party uploads across YouTube</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400">•</span>
                  <span>Fragmented audiences with zero data or subscriber loyalty</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400">•</span>
                  <span>Inconsistent, pirated Urdu subtitles destroying dialogue quality</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400">•</span>
                  <span>Zero commercial monetization reaching the original studio</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-slate-400">•</span>
                  <span>Uncontrolled brand presentation and low visual fidelity</span>
                </li>
              </ul>
            </div>

            {/* With FEVIQO Authorized Partnership */}
            <div className="p-8 rounded-3xl bg-[#FFFFFF] border-2 border-[#22C55E] shadow-md">
              <div className="flex items-center gap-2 text-slate-950 text-xs font-black uppercase tracking-wider mb-6">
                <span className="w-5 h-5 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center font-bold text-xs">✓</span>
                <span>WITH FEVIQO AUTHORIZED PARTNERSHIP</span>
              </div>
              <ul className="space-y-3.5 text-sm text-slate-900 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#22C55E] font-black">✓</span>
                  <span>100% Authorized licensing agreement and copyright compliance</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#22C55E] font-black">✓</span>
                  <span>High-fidelity localized Urdu experience crafted by professionals</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#22C55E] font-black">✓</span>
                  <span>Official verified channel publishing with full brand protection</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#22C55E] font-black">✓</span>
                  <span>Aggregated audience data and community ownership</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#22C55E] font-black">✓</span>
                  <span>Punctual, auditable revenue-share statements and settlements</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200">
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              FEVIQO's objective is never to compete with a rights holder's global streaming platforms. Our model provides incremental, rights-compliant digital reach in Pakistan where authorized local-language distribution is not yet established.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 06 — LOCAL COMMERCIAL OPPORTUNITY */}
      {/* ============================================================ */}
      <section className="py-20 border-b border-slate-200 bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
              06 / COMMERCIAL UPSIDE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-2 leading-tight">
              BEYOND YOUTUBE ADVERTISING:<br />
              COMPREHENSIVE LOCAL COMMERCIALIZATION.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Subject to rights-holder approval and contractual rights parameters, FEVIQO can explore additional commercial avenues to maximize content returns in the local market:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-slate-200 hover:border-[#22C55E]/40 transition">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-2">
                PAKISTANI BRAND SPONSORSHIPS
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Coordinated title and episodic sponsorships with leading FMCG, banking, and telecom advertisers in Pakistan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-slate-200 hover:border-[#22C55E]/40 transition">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-2">
                PROMOTIONAL BRAND INTEGRATIONS
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pre-roll segment endorsements and custom thumbnail sponsor badges, fully compliant with rights-holder guidelines.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-slate-200 hover:border-[#22C55E]/40 transition">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-2">
                SHORT-FORM SOCIAL MONETIZATION
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                YouTube Shorts, TikTok, and Instagram promotional clips driving high-conversion discovery to the official episodes.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600 italic">
              All commercial partners and brand associations are strictly subject to advance review and written approval by the rights holder.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 07 — TEŞKİLAT (PRIORITY LICENSING EXPLORATION) */}
      {/* ============================================================ */}
      <section className="py-20 border-b border-slate-200 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FFFFFF] border border-slate-200 shadow-sm">
            
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
                PRIORITY LICENSING INTEREST
              </span>
              <h3 className="text-3xl sm:text-5xl font-black text-slate-950 mt-2 mb-4 tracking-tight">
                TEŞKİLAT
              </h3>
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                FEVIQO would like to explore the availability of authorized digital distribution and Urdu localization rights for <strong>Teşkilat</strong> in Pakistan.
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TARGET TERRITORY</div>
                <div className="text-sm font-black text-slate-950 mt-1">Pakistan</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LANGUAGE</div>
                <div className="text-sm font-black text-slate-950 mt-1">Urdu Localization</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PRIMARY PLATFORM</div>
                <div className="text-sm font-black text-slate-950 mt-1">YouTube / Digital AVOD</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LOCALIZATION SCOPE</div>
                <div className="text-sm font-black text-slate-950 mt-1">Urdu Subtitles and/or Approved Dubbing</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-[#22C55E] uppercase tracking-wider">COMMERCIAL MODEL</div>
                <div className="text-sm font-black text-slate-950 mt-1">Advertising-supported Revenue Share</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">RIGHTS STATUS</div>
                <div className="text-sm font-black text-slate-950 mt-1">Subject to Rights Availability</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 italic">
                Notice: FEVIQO does not represent or claim existing rights to Teşkilat. This is an exploratory licensing inquiry directed to the rights holder.
              </p>
              <a
                href={`mailto:${PARTNERSHIP_EMAIL}?subject=${encodeURIComponent('Licensing Inquiry: Teşkilat (Pakistan Urdu Rights)')}&body=${encodeURIComponent('Hello FEVIQO Team,\n\nWe represent / manage rights for Teşkilat and would like to discuss potential licensing for Pakistan.\n\nOrganization:\nContact Person:\n\nBest regards,')}`}
                className="px-6 py-3 rounded-full bg-[#22C55E] hover:bg-[#1eb054] text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shrink-0 shadow-sm"
              >
                Discuss a Licensing Partnership
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 08 — FATIH: SULTAN OF CONQUESTS */}
      {/* ============================================================ */}
      <section className="py-20 border-b border-slate-200 bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FAFAF8] border border-slate-200 shadow-sm">
            
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
                ADDITIONAL PRIORITY INTEREST
              </span>
              <h3 className="text-3xl sm:text-5xl font-black text-slate-950 mt-2 mb-4 tracking-tight">
                FATIH: SULTAN OF CONQUESTS
              </h3>
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                FEVIQO would like to explore whether digital distribution and Urdu localization rights may be available for <strong>Fatih: Sultan of Conquests (Mehmed: Fetihler Sultanı)</strong> for Pakistan.
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TARGET TERRITORY</div>
                <div className="text-sm font-black text-slate-950 mt-1">Pakistan</div>
              </div>

              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LANGUAGE</div>
                <div className="text-sm font-black text-slate-950 mt-1">Urdu Localization</div>
              </div>

              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PRIMARY PLATFORM</div>
                <div className="text-sm font-black text-slate-950 mt-1">YouTube / Digital AVOD</div>
              </div>

              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LOCALIZATION SCOPE</div>
                <div className="text-sm font-black text-slate-950 mt-1">Urdu Subtitles and/or Approved Dubbing</div>
              </div>

              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-slate-200">
                <div className="text-[11px] font-bold text-[#22C55E] uppercase tracking-wider">COMMERCIAL MODEL</div>
                <div className="text-sm font-black text-slate-950 mt-1">Advertising-supported Revenue Share</div>
              </div>

              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">RIGHTS STATUS</div>
                <div className="text-sm font-black text-slate-950 mt-1">Non-exclusive, Subject to Availability</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 italic">
                Notice: FEVIQO does not represent or claim existing rights to Fatih. This is an exploratory licensing proposal to the rights holder.
              </p>
              <a
                href={`mailto:${PARTNERSHIP_EMAIL}?subject=${encodeURIComponent('Licensing Inquiry: Fatih Sultan of Conquests (Pakistan Urdu Rights)')}&body=${encodeURIComponent('Hello FEVIQO Team,\n\nWe represent / manage rights for Fatih: Sultan of Conquests and would like to discuss potential licensing for Pakistan.\n\nOrganization:\nContact Person:\n\nBest regards,')}`}
                className="px-6 py-3 rounded-full bg-[#22C55E] hover:bg-[#1eb054] text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shrink-0 shadow-sm"
              >
                Discuss a Licensing Partnership
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 09 — BROADER CATALOG SCOPE */}
      {/* ============================================================ */}
      <section className="py-20 border-b border-slate-200 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
              09 / CATALOG EXPANSION
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-2 leading-tight">
              ONE TITLE CAN EXPAND INTO A FULL CATALOG DESTINATION.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              While Teşkilat and Fatih: Sultan of Conquests represent priority licensing interests, FEVIQO is interested in exploring broader Turkish television libraries with rights holders who seek to establish a long-term presence in Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {[
              'Historical & Epic Dramas',
              'Action & Crime Thrillers',
              'Family Sagas',
              'Romantic Drama',
              'Period Series',
              'Archive Catalogs',
            ].map((cat) => (
              <div key={cat} className="p-4 rounded-2xl bg-[#FFFFFF] border border-slate-200 text-center flex items-center justify-center min-h-[90px] shadow-sm hover:border-[#22C55E]/40 transition">
                <span className="text-xs font-bold text-slate-900 leading-snug">{cat}</span>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200">
            <p className="text-sm font-bold text-slate-900">
              Our ambition is to cultivate an enduring, mutually beneficial distribution alliance rather than negotiate isolated, one-off releases.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — WHY FEVIQO */}
      {/* ============================================================ */}
      <section className="py-20 border-b border-slate-200 bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
              10 / LOCAL ADVANTAGE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-2 leading-tight">
              LOCAL MARKET EXECUTION.<br />
              INTERNATIONAL CONTENT STANDARDS.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              FEVIQO provides the missing local operating layer for international rights holders:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            {[
              'Native Urdu Localization',
              'Creative Packaging',
              'YouTube Algorithm Mastery',
              'Audience Development',
              'Brand Safety Control',
              'Transparent Accounting',
            ].map((cap) => (
              <div key={cap} className="p-4 rounded-2xl bg-[#FAFAF8] border border-slate-200 text-center flex items-center justify-center min-h-[85px] hover:border-[#22C55E]/40 transition">
                <span className="text-xs font-bold text-slate-900">{cap}</span>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              This enables FEVIQO to serve as an accountable local bridge between the Turkish production house and the millions of passionate Pakistani fans awaiting their series.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 11 — RIGHTS & COMPLIANCE */}
      {/* ============================================================ */}
      <section className="py-20 border-b border-slate-200 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
              11 / RIGOROUS LEGAL INTEGRITY
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-2 leading-tight">
              EVERYTHING BEGINS AND OPERATES WITHIN CONTRACTUAL RIGHTS.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-10">
            {[
              'Formal written licensing contract',
              'Strictly defined territory (Pakistan)',
              'Defined language rights (Urdu)',
              'Defined digital platforms (YouTube)',
              'Defined license term & renewals',
              'Defined monetization rights',
              'Studio-approved localization standards',
              'Zero unauthorized publishing',
              'Rights-holder approval on all campaigns',
              'Transparent quarterly revenue audits',
            ].map((rule) => (
              <div key={rule} className="p-4 rounded-xl bg-[#FFFFFF] border border-slate-200 flex items-start gap-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-slate-800">{rule}</span>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-[#032415] text-[#FFFFFF] border border-[#064e3b] shadow-lg">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#22C55E] shrink-0" />
              <p className="text-xs sm:text-sm font-bold tracking-wide text-emerald-100">
                FEVIQO will never publish or distribute third-party content without formal, authorized written licensing agreements executed with the verified rights holder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 12 — COMMERCIAL REVENUE-SHARE MODEL */}
      {/* ============================================================ */}
      <section className="py-20 border-b border-slate-200 bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
              12 / COMMERCIAL FRAMEWORK
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-2 leading-tight">
              A FLEXIBLE, ALIGNED REVENUE-SHARE MODEL.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TERRITORY</div>
              <div className="text-sm font-black text-slate-950 mt-1">Pakistan</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LANGUAGE</div>
              <div className="text-sm font-black text-slate-950 mt-1">Urdu Localization</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PLATFORM</div>
              <div className="text-sm font-black text-slate-950 mt-1">YouTube / Digital AVOD</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">RIGHTS SCOPE</div>
              <div className="text-sm font-black text-slate-950 mt-1">Digital Distribution + Subtitles/Dubbing</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LICENSE STRUCTURE</div>
              <div className="text-sm font-black text-slate-950 mt-1">Non-exclusive preferred</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MONETIZATION</div>
              <div className="text-sm font-black text-slate-950 mt-1">Advertising-supported (AVOD)</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-slate-200">
              <div className="text-[11px] font-bold text-[#22C55E] uppercase tracking-wider">REVENUE SPLIT</div>
              <div className="text-sm font-black text-slate-950 mt-1">Mutually agreed percentage</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CONTRACT TERM</div>
              <div className="text-sm font-black text-slate-950 mt-1">Flexible & Renewable</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              FEVIQO welcomes alternative partnership structures tailored to the rights holder's prevailing global distribution strategy.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 13 — THE LONG-TERM VISION */}
      {/* ============================================================ */}
      <section className="py-20 border-b border-slate-200 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-[#22C55E]">
              13 / STRATEGIC ROADMAP
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-2 leading-tight">
              START WITH ONE KEY TITLE.<br />
              BUILD THE PREMIER URDU HOME FOR TURKISH DRAMA.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Our vision is to build a repeatable, trusted operating model where licensed Turkish dramas are introduced to Pakistani audiences through high-quality localized infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-10">
            {[
              'Expanding localized catalog depth',
              'Accumulating a loyal millions-strong Urdu subscriber base',
              'Maximizing programmatic AVOD ad inventory',
              'Capturing premium Pakistani brand sponsorships',
              'Deep audience demographic and viewer behavioral insights',
              'Long-term international goodwill between Turkish studios & Pakistani fans',
            ].map((item) => (
              <div key={item} className="p-4 rounded-xl bg-[#FFFFFF] border border-slate-200 flex items-center gap-2.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                <span className="text-xs font-bold text-slate-800">{item}</span>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 text-[#FFFFFF]">
            <p className="text-sm sm:text-base font-semibold leading-relaxed">
              FEVIQO aims to be the dedicated local execution partner that Turkish rights holders trust when expanding their footprint into Pakistan's rapidly expanding digital entertainment landscape.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* THE COMMITMENT SECTION — APPLE-INSPIRED DISPLAY MANIFESTO */}
      {/* ============================================================ */}
      <section 
        id="feviqo-commitment-section"
        className="relative py-24 sm:py-32 bg-gradient-to-b from-[#02180E] via-[#032415] to-[#02180E] border-y border-[#064e3b]/80 text-[#FFFFFF] overflow-hidden"
      >
        {/* Apple-style atmospheric overhead spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#22C55E]/20 via-[#22C55E]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.07] border border-white/15 text-[#22C55E] text-[11px] font-black uppercase tracking-[0.2em] mb-12 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span>THE COMMITMENT</span>
          </div>

          {/* Core Execution Pillars — Apple Keynote Cadence */}
          <div className="space-y-4 sm:space-y-6 text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white/80 leading-tight">
            <p className="hover:text-white transition-colors duration-300">
              WE CAN HELP YOU LOCALIZE IT.
            </p>
            <p className="hover:text-white transition-colors duration-300">
              WE CAN DISTRIBUTE IT.
            </p>
            <p className="hover:text-white transition-colors duration-300">
              WE CAN BUILD THE AUDIENCE.
            </p>
            <p className="hover:text-white transition-colors duration-300">
              WE CAN DEVELOP LOCAL COMMERCIAL OPPORTUNITIES.
            </p>
            <p className="hover:text-white transition-colors duration-300">
              WE CAN REPORT THE RESULTS.
            </p>
          </div>

          {/* Minimalist Apple-grade hairline separator */}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#22C55E] to-transparent mx-auto my-12 opacity-80" />

          {/* Climax Statement — Monumental Typography, Zero Chunky Boxes */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#FFFFFF] leading-none drop-shadow-sm">
              YOU RETAIN OWNERSHIP.
            </h3>
            <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#22C55E] leading-none drop-shadow-sm">
              WE SHARE THE UPSIDE.
            </h3>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 14 — EXECUTIVE CONTACT & ONE SIMPLE CTA */}
      {/* ============================================================ */}
      <section id="licensing-partnership" className="py-24 bg-[#FFFFFF] border-b border-slate-200 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#FFFFFF] via-[#F4FDF7] to-[#FFFFFF] border-2 border-[#22C55E]/40 shadow-xl text-center space-y-8">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#22C55E]/15 text-slate-950 border border-[#22C55E]/30">
              <Building2 className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>International Content Acquisition</span>
            </div>

            {/* Title & Proposal Message */}
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase">
                DISCUSS A LICENSING PARTNERSHIP WITH FEVIQO
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                If you represent Turkish television content, production studios, or international distribution agencies and would like to explore licensing opportunities for Urdu localization and digital distribution in Pakistan, our acquisitions desk is ready to connect with you.
              </p>
            </div>

            {/* Direct Email Card */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#FFFFFF] border border-slate-200 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 text-slate-950 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#22C55E] stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Acquisitions Desk</span>
                  <a 
                    href={PARTNERSHIP_MAILTO} 
                    className="text-sm font-black text-slate-950 hover:text-[#22C55E] transition underline-offset-2 hover:underline"
                  >
                    {PARTNERSHIP_EMAIL}
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Copy Email Address"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#22C55E] stroke-[3]" />
                    <span className="text-[#22C55E] font-black">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* THE ONE SIMPLE CTA REQUESTED BY USER */}
            <div className="pt-2">
              <a
                id="cta-discuss-licensing-partnership"
                href={PARTNERSHIP_MAILTO}
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-[#22C55E] hover:bg-[#1eb054] text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#22C55E]/20 hover:shadow-2xl hover:shadow-[#22C55E]/30 inline-flex items-center justify-center gap-3 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Discuss a Licensing Partnership</span>
                <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3]" />
              </a>
            </div>

            {/* Direct Notice */}
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              Clicking above opens your email client directly addressed to <strong>partner@feviqo.com</strong>. We look forward to reviewing catalog availability, territory restrictions, and commercial structures.
            </p>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 15 — MANDATORY LEGAL DISCLAIMER */}
      {/* ============================================================ */}
      <section className="py-12 bg-[#FAFAF8] border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 leading-relaxed text-center sm:text-left">
              <strong>Mandatory Legal Notice:</strong> FEVIQO is a digital distribution and creative localization company. FEVIQO does not claim, represent, or imply existing ownership, exclusive representation, or active licensing rights to any third-party television series, characters, trademarks, or intellectual property mentioned on this page. All proposals regarding territory, language localization, distribution channels, and commercial revenue shares are exploratory inquiries subject to formal written authorization and bilateral licensing agreements executed with the respective rights holder.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

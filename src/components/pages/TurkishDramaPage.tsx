import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WordFadeUpHeadline } from '../WordFadeUpHeadline';
import { ArrowRight, Check, ShieldCheck, Globe, Film, Sparkles, Copy, Play, FileCheck } from 'lucide-react';
import { Navbar } from '../Navbar';
import { SolutionsSwitcher } from '../SolutionsSwitcher';
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
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const PARTNERSHIP_EMAIL = 'partner@feviqo.com';
  const PARTNERSHIP_MAILTO = `mailto:${PARTNERSHIP_EMAIL}?subject=${encodeURIComponent(
    'Licensing Partnership Proposal: Turkish Content / Urdu Localization'
  )}&body=${encodeURIComponent(
    'Hello FEVIQO Content Acquisitions Desk,\n\nWe would like to discuss potential licensing and digital distribution opportunities for Turkish content in Pakistan.\n\nOrganization / Rights Holder:\nCatalog / Series Title(s):\nTerritory / Scope:\nAvailable Language Rights:\nDigital / AVOD Rights:\nContact Person & Title:\n\nBest regards,'
  )}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PARTNERSHIP_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="min-h-screen bg-white text-[#0B0B0D] font-sans antialiased selection:bg-[#22C55E] selection:text-slate-950 flex flex-col">
      {/* Primary Global Navigation */}
      <Navbar
        onBookCall={onBookCall}
        onNavigateSection={() => onBackToHome()}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      {/* Animated Solutions Pill Switcher */}
      <SolutionsSwitcher
        activeTab="turkish"
        onSelectTab={(tab) => onNavigatePage(tab)}
      />

      {/* Hero Section - Split 2-Column Text Left / Media Showcase Right */}
      <section className="pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Hero Title & Value Proposition */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-6 text-emerald-900 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                SOLUTIONS &bull; INTERNATIONAL CONTENT ACQUISITION
              </span>
            </div>

            <motion.div
              key="turkish-hero-text"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-5">
                <WordFadeUpHeadline
                  className="font-coolvetica text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B0B0D] leading-[1.06]"
                  words={[
                    { text: "Turkish" },
                    { text: "Drama." },
                    { text: "Urdu" },
                    { text: "Localization." },
                    { text: "Pakistan", className: "font-editorial-italic font-normal text-[#16a34a]" },
                    { text: "Distribution.", className: "font-editorial-italic font-normal text-[#16a34a]" },
                  ]}
                />
              </div>

              <p className="font-neue text-base sm:text-lg text-slate-600 max-w-xl mb-8 font-normal leading-relaxed">
                FEVIQO partners with Turkish producers, studios, distributors, and rights holders to bring licensed Turkish content to Urdu-speaking audiences in Pakistan through professional localization and authorized digital distribution.
              </p>
            </motion.div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
              <a
                href={PARTNERSHIP_MAILTO}
                className="px-8 py-4 rounded-xl sm:rounded-2xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-base shadow-lg shadow-[#22C55E]/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Inquire About Licensing</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={handleCopyEmail}
                className="px-6 py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-[#16a34a]" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copiedEmail ? 'Email Copied!' : PARTNERSHIP_EMAIL}</span>
              </button>
            </div>

            {/* Key Trust Signals */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                <span className="text-slate-900 font-bold">100% Authorized Rights</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                <span className="text-slate-900 font-bold">Broadcast-Quality Urdu Dubs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                <span className="text-slate-900 font-bold">AVOD Digital Distribution</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Video Showcase Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/90 shadow-2xl shadow-slate-900/10 group">
              <div className="aspect-[16/10] sm:aspect-[16/9] w-full relative overflow-hidden bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&auto=format&fit=crop&q=80"
                  alt="Turkish Drama Cinema Showcase"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    <span>URDU LOCALIZATION SUITE</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4">
                  <div className="bg-emerald-500/90 text-slate-950 text-xs font-extrabold px-3 py-1.5 rounded-full border border-emerald-300">
                    AUTHORIZED
                  </div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-xl shadow-[#22C55E]/40 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Play className="w-8 h-8 ml-1 fill-slate-950" />
                  </button>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="font-coolvetica text-xl sm:text-2xl font-bold tracking-tight">
                    Turkish Premium TV Series &bull; Pakistan Digital Rights
                  </div>
                  <div className="text-xs text-slate-300 mt-1 flex items-center gap-3 font-mono">
                    <span>Market: Pakistan</span>
                    <span>&bull;</span>
                    <span>Language: Urdu</span>
                    <span>&bull;</span>
                    <span>Distribution: YouTube &amp; AVOD</span>
                    <span>&bull;</span>
                    <span>Rights: Licensed &amp; Contractual</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Key Stats Counter Bar */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 text-center">
            <div className="pt-4 sm:pt-0">
              <div className="font-neue text-4xl sm:text-5xl font-extrabold text-[#16a34a] tracking-tight">
                240M+
              </div>
              <div className="font-neue text-xs sm:text-sm font-bold text-slate-800 mt-1.5">
                Urdu-Speaking Market
              </div>
            </div>

            <div className="pt-4 sm:pt-0">
              <div className="font-neue text-4xl sm:text-5xl font-extrabold text-[#16a34a] tracking-tight">
                100%
              </div>
              <div className="font-neue text-xs sm:text-sm font-bold text-slate-800 mt-1.5">
                Authorized Rights
              </div>
            </div>

            <div className="pt-4 sm:pt-0">
              <div className="font-neue text-4xl sm:text-5xl font-extrabold text-[#16a34a] tracking-tight">
                24–48h
              </div>
              <div className="font-neue text-xs sm:text-sm font-bold text-slate-800 mt-1.5">
                Localization Turnaround
              </div>
            </div>

            <div className="pt-4 sm:pt-0">
              <div className="font-neue text-4xl sm:text-5xl font-extrabold text-[#16a34a] tracking-tight">
                AVOD
              </div>
              <div className="font-neue text-xs sm:text-sm font-bold text-slate-800 mt-1.5">
                Digital Distribution
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Turnkey Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-4 text-emerald-900 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#22C55E]" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              FULL TURNKEY ACQUISITION &amp; OPERATION
            </span>
          </div>
          <h2 className="font-coolvetica text-3xl sm:text-5xl font-bold text-slate-950 tracking-tight leading-tight">
            From Turkish Rights to Urdu Digital Distribution
          </h2>
          <p className="font-neue text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            FEVIQO manages the operational workflow behind licensed Turkish content — from catalog evaluation and Urdu localization to digital publishing, channel operations, audience development, and rights-holder reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Step 01 */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 border border-slate-200/90 shadow-sm shadow-slate-900/5 hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-[#16a34a] font-mono text-xs font-extrabold tracking-wider">
                  01
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50/80 border border-emerald-100 text-[#16a34a] flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-coolvetica text-2xl sm:text-3xl font-bold text-slate-950 mb-3 tracking-tight">
                Rights &amp; Catalog Evaluation
              </h3>
              <p className="font-neue text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                We evaluate Turkish catalogs for Pakistan and Urdu-language digital opportunities, including territory, language, platform, term, and exclusivity requirements.
              </p>

              <div className="space-y-2.5 mb-6 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Territory, platform &amp; exclusivity scoping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Pakistan &amp; Urdu-language market validation</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs font-bold uppercase tracking-wider text-[#16a34a] flex items-center justify-between">
              <span>CATALOG EVALUATION</span>
              <FileCheck className="w-4 h-4 text-[#16a34a]" />
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 border border-slate-200/90 shadow-sm shadow-slate-900/5 hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-[#16a34a] font-mono text-xs font-extrabold tracking-wider">
                  02
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50/80 border border-emerald-100 text-[#16a34a] flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-coolvetica text-2xl sm:text-3xl font-bold text-slate-950 mb-3 tracking-tight">
                Professional Urdu Localization
              </h3>
              <p className="font-neue text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                Approved titles are adapted for Urdu-speaking audiences through script localization, native Urdu voice talent, recording, editing, synchronization, and final audio mastering.
              </p>

              <div className="space-y-2.5 mb-6 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Native Urdu dubbing talent &amp; script translation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Broadcast-grade audio mixing &amp; synchronization</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs font-bold uppercase tracking-wider text-[#16a34a] flex items-center justify-between">
              <span>URDU LOCALIZATION</span>
              <Globe className="w-4 h-4 text-[#16a34a]" />
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 border border-slate-200/90 shadow-sm shadow-slate-900/5 hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-[#16a34a] font-mono text-xs font-extrabold tracking-wider">
                  03
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50/80 border border-emerald-100 text-[#16a34a] flex items-center justify-center">
                  <Film className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-coolvetica text-2xl sm:text-3xl font-bold text-slate-950 mb-3 tracking-tight">
                Digital Channel Management
              </h3>
              <p className="font-neue text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                We manage authorized digital publishing across YouTube and AVOD platforms, including localized metadata, thumbnails, episode scheduling, channel operations, and audience development.
              </p>

              <div className="space-y-2.5 mb-6 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>High-CTR localized thumbnails &amp; SEO metadata</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Automated episode scheduling &amp; AVOD operations</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs font-bold uppercase tracking-wider text-[#16a34a] flex items-center justify-between">
              <span>DIGITAL DISTRIBUTION</span>
              <Film className="w-4 h-4 text-[#16a34a]" />
            </div>
          </div>

          {/* Step 04 */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 border border-slate-200/90 shadow-sm shadow-slate-900/5 hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-[#16a34a] font-mono text-xs font-extrabold tracking-wider">
                  04
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50/80 border border-emerald-100 text-[#16a34a] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-coolvetica text-2xl sm:text-3xl font-bold text-slate-950 mb-3 tracking-tight">
                Reporting &amp; Rights Management
              </h3>
              <p className="font-neue text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                Rights holders receive transparent reporting covering published content, geographic performance, monetization activity, and contractual settlements.
              </p>

              <div className="space-y-2.5 mb-6 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Monthly performance &amp; revenue statement audits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Contractual royalty settlements &amp; analytics</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs font-bold uppercase tracking-wider text-[#16a34a] flex items-center justify-between">
              <span>RIGHTS HOLDER REPORTING</span>
              <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Titles Showcase */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-4 text-emerald-900 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              INITIAL LICENSING INTEREST
            </span>
          </div>
          <h2 className="font-coolvetica text-3xl sm:text-5xl font-bold text-slate-950 tracking-tight leading-tight">
            Turkish Series for Urdu Digital Distribution
          </h2>
          <p className="font-neue text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            FEVIQO is evaluating Turkish drama catalogs for authorized Urdu localization and digital distribution in Pakistan. Availability of individual titles is subject to rights verification and licensing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Title 1 Card: Teşkilat */}
          <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-md shadow-slate-900/5 group flex flex-col">
            <div className="aspect-[16/9] overflow-hidden relative bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1000&auto=format&fit=crop&q=80"
                alt="Teşkilat Turkish Drama"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-slate-950/80 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                  ACTION / INTELLIGENCE DRAMA
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-[#22C55E] text-slate-950 text-xs font-black px-3 py-1.5 rounded-full uppercase">
                  LICENSING OPPORTUNITY
                </span>
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-coolvetica text-3xl font-bold text-slate-950 mb-2">
                  TEŞKİLAT
                </h3>
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
                  Territory: Pakistan &bull; Language: Urdu &bull; Format: AVOD / YouTube
                </div>
                <p className="font-neue text-slate-600 text-sm leading-relaxed mb-6">
                  A high-stakes intelligence drama centered on national security operations, strategic missions, and complex characters.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#16a34a] uppercase">Subject to Rights Availability</span>
                <a
                  href={PARTNERSHIP_MAILTO}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#16a34a] text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Discuss Licensing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Title 2 Card: Fatih */}
          <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-md shadow-slate-900/5 group flex flex-col">
            <div className="aspect-[16/9] overflow-hidden relative bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1000&auto=format&fit=crop&q=80"
                alt="Fatih Turkish Drama"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-slate-950/80 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                  HISTORICAL DRAMA
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-[#22C55E] text-slate-950 text-xs font-black px-3 py-1.5 rounded-full uppercase">
                  LICENSING OPPORTUNITY
                </span>
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-coolvetica text-3xl font-bold text-slate-950 mb-2">
                  FATİH: SULTAN OF CONQUESTS
                </h3>
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
                  Territory: Pakistan &bull; Language: Urdu &bull; Format: AVOD / YouTube
                </div>
                <p className="font-neue text-slate-600 text-sm leading-relaxed mb-6">
                  A historical drama centered on Sultan Mehmed II and the conquest of Constantinople, combining historical storytelling with large-scale production.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#16a34a] uppercase">Subject to Rights Availability</span>
                <a
                  href={PARTNERSHIP_MAILTO}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#16a34a] text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Discuss Licensing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rights Compliance Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-50/90 border border-emerald-200/80 text-slate-950 rounded-2xl sm:rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-xs">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-72 h-72 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto relative z-10 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-[#15803d] text-xs font-extrabold uppercase tracking-wider border border-emerald-200 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                <span>STRICT RIGHTS COMPLIANCE</span>
              </div>
            </div>
            
            <h3 className="font-coolvetica text-3xl sm:text-5xl font-bold text-slate-950 tracking-tight leading-tight text-center">
              Authorized Content. Clear Agreements. Transparent Distribution.
            </h3>
            
            <p className="font-neue text-slate-600 text-sm sm:text-base leading-relaxed text-center max-w-3xl mx-auto font-normal">
              FEVIQO does not publish, subtitle, dub, or monetize third-party content without appropriate authorization from the relevant rights holder. Each title is evaluated and distributed under formal licensing terms covering the applicable territory, language, platforms, and licensing period.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-8 border-t border-emerald-200/80 text-left">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="text-xs font-bold text-[#16a34a] uppercase mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Territory Rights
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium">Pakistan and other territories only where contractually authorized.</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="text-xs font-bold text-[#16a34a] uppercase mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Language Rights
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium">Urdu localization and distribution rights.</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="text-xs font-bold text-[#16a34a] uppercase mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Platform Rights
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium">YouTube, AVOD, and other mutually agreed digital platforms.</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="text-xs font-bold text-[#16a34a] uppercase mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Licensing Terms
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium">Term, exclusivity, commercial structure, and usage rights are agreed privately with each rights holder.</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-colors sm:col-span-2 lg:col-span-2">
                <div className="text-xs font-bold text-[#16a34a] uppercase mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Reporting
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium">Transparent performance and revenue reporting according to the applicable agreement.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-6 text-emerald-900 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              LICENSING INQUIRIES
            </span>
          </div>

          <h2 className="font-coolvetica text-3xl sm:text-5xl font-bold text-slate-950 tracking-tight leading-tight mb-4">
            Have Turkish Content Available for Pakistan?
          </h2>

          <p className="font-neue text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            If you represent a Turkish studio, producer, distributor, or rights holder with content available for international licensing, FEVIQO would like to review your catalog and discuss potential Urdu localization and digital distribution opportunities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={PARTNERSHIP_MAILTO}
              className="w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-2xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-base shadow-lg shadow-[#22C55E]/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Submit Licensing Inquiry</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={handleCopyEmail}
              className="w-full sm:w-auto px-6 py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-[#16a34a]" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copiedEmail ? 'Email Copied!' : PARTNERSHIP_EMAIL}</span>
            </button>
          </div>

          <div className="mt-6 text-xs font-mono text-slate-500">
            Direct Licensing Inquiries: <a href={PARTNERSHIP_MAILTO} className="text-[#16a34a] font-bold hover:underline">{PARTNERSHIP_EMAIL}</a>
          </div>
        </div>
      </section>

      {/* Standard FEVIQO Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 mt-auto text-xs font-mono text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="font-neue text-sm font-bold text-slate-900">FEVIQO</span>
            <span>&bull; International Content Acquisitions Desk</span>
          </div>
          <div className="text-slate-600 font-medium">
            Turkish Content &bull; Urdu Localization &bull; Pakistan Digital Distribution
          </div>
          <div>
            Direct Licensing Inquiries: <a href={PARTNERSHIP_MAILTO} className="text-[#16a34a] font-bold hover:underline">{PARTNERSHIP_EMAIL}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

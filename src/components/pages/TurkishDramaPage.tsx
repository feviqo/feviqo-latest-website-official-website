import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, ShieldCheck, Globe, Film, Sparkles, Copy, FileCheck, Layers, FileText, BarChart3, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../Navbar';
import { AppRoute } from '../../types';

interface TurkishDramaPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

// Custom Slanted Parallelogram Badge Component (matching uploaded geometry)
const SlantedBadge: React.FC<{
  children: React.ReactNode;
  bgClass?: string;
  textClass?: string;
  borderClass?: string;
}> = ({
  children,
  bgClass = 'bg-[#032415]',
  textClass = 'text-emerald-400',
  borderClass = 'border border-[#064e3b]',
}) => (
  <div className={`inline-block transform -skew-x-12 px-4 py-1.5 shadow-md ${bgClass} ${borderClass}`}>
    <div className={`transform skew-x-12 flex items-center gap-2 font-neue font-extrabold text-xs uppercase tracking-wider ${textClass}`}>
      {children}
    </div>
  </div>
);

export const TurkishDramaPage: React.FC<TurkishDramaPageProps> = ({
  onBackToHome,
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const PARTNERSHIP_EMAIL = 'partner@feviqo.com';
  const PARTNERSHIP_MAILTO = `mailto:${PARTNERSHIP_EMAIL}?subject=${encodeURIComponent(
    'Licensing Inquiry: Turkish Content Rights for Pakistan'
  )}&body=${encodeURIComponent(
    `Hello FEVIQO Content Acquisitions Desk,

We would like to discuss potential licensing and digital distribution opportunities for Turkish content in Pakistan.

Organization / Rights Holder: 
Authorized Representative: 
Catalog / Series Title(s): 
Territory Rights: Pakistan
Urdu Rights: Subtitles / Dubbing
Digital / YouTube Rights: AVOD
Exclusivity: 
Available Episodes / Seasons: 
Preferred Licensing Structure: 
Contact Person & Title: 
Website: 

Best regards,`
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

      {/* HERO SECTION - Seeking Rights for Pakistan */}
      <section className="relative bg-white text-[#0B0B0D] pt-8 sm:pt-14 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center">
          
          {/* Top Category Slanted Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <SlantedBadge bgClass="bg-emerald-50" textClass="text-[#15803d]" borderClass="border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
              <span>RIGHTS ACQUISITION &bull; LICENSING &amp; DISTRIBUTION PARTNERSHIPS</span>
            </SlantedBadge>
          </motion.div>

          {/* Combined Flag Alliance & Authorization Pills */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8"
          >
            {/* Flags Alliance Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-900 text-xs sm:text-sm font-bold px-4 py-2 rounded-full border border-slate-200 shadow-xs">
              <span className="text-base sm:text-lg">🇹🇷</span>
              <span className="font-neue text-emerald-800 font-bold">Turkey</span>
              <span className="text-slate-400 text-xs">➔</span>
              <span className="text-base sm:text-lg">🇵🇰</span>
              <span className="font-neue text-emerald-800 font-bold">Pakistan</span>
            </div>

            {/* Urdu Suite Tag */}
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#15803d] text-xs sm:text-sm font-extrabold px-4 py-2 rounded-full border border-emerald-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 fill-current text-[#22C55E]" />
              <span>URDU LOCALIZATION SUITE</span>
            </div>

            {/* Contract-Based Distribution Badge */}
            <div className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              <span>CONTRACT-BASED DISTRIBUTION</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6 max-w-4xl"
          >
            <h1 className="font-coolvetica text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#0B0B0D] leading-[1.08]">
              Turkish Premium TV Series.{' '}
              <span className="text-[#16a34a] font-editorial-italic font-normal block sm:inline">
                Seeking Rights for Pakistan.
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="font-neue text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-normal leading-relaxed"
          >
            FEVIQO partners with Turkish producers, studios, and rights holders to license Turkish content for Pakistan's digital market through studio-grade Urdu localization and managed distribution.
          </motion.p>

          {/* Distribution Rights Specification Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full max-w-4xl my-4 py-6 sm:py-8 border-y border-slate-200/90 text-left"
          >
            {/* Spec Header Line */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <h2 className="font-coolvetica text-lg sm:text-2xl font-bold text-slate-950 tracking-tight flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Turkish Premium TV Series</span>
                  <span className="text-slate-300 hidden sm:inline">&bull;</span>
                  <span className="text-[#16a34a]">Pakistan Digital Rights</span>
                </h2>
                <div className="text-xs sm:text-sm font-neue font-medium text-slate-600 flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
                  <span>Rights Acquisition &bull; Licensing &amp; Distribution Partnerships</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-neue font-bold text-[#15803d] self-start sm:self-center shadow-2xs shrink-0">
                <FileCheck className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>Rights-First Distribution</span>
              </div>
            </div>

            {/* Spec Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pt-5">
              <div className="p-3.5 sm:p-0 bg-slate-50/80 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-0 border-slate-100">
                <span className="text-[10px] sm:text-[11px] font-neue uppercase font-bold tracking-wider text-slate-500 block mb-1">Market</span>
                <span className="text-sm sm:text-lg font-extrabold text-slate-950 flex items-center gap-2">
                  <span className="text-lg sm:text-xl">🇵🇰</span>
                  <span>Pakistan</span>
                </span>
              </div>

              <div className="p-3.5 sm:p-0 bg-slate-50/80 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-0 border-slate-100">
                <span className="text-[10px] sm:text-[11px] font-neue uppercase font-bold tracking-wider text-slate-500 block mb-1">Language</span>
                <span className="text-sm sm:text-lg font-extrabold text-slate-950 flex items-center gap-1.5">
                  <span>Urdu</span>
                  <span className="text-xs text-slate-600 font-normal">(اردو)</span>
                </span>
              </div>

              <div className="p-3.5 sm:p-0 bg-slate-50/80 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-0 border-slate-100">
                <span className="text-[10px] sm:text-[11px] font-neue uppercase font-bold tracking-wider text-slate-500 block mb-1">Distribution</span>
                <span className="text-sm sm:text-lg font-extrabold text-slate-950">YouTube &amp; AVOD</span>
              </div>

              <div className="p-3.5 sm:p-0 bg-slate-50/80 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-0 border-slate-100">
                <span className="text-[10px] sm:text-[11px] font-neue uppercase font-bold tracking-wider text-slate-500 block mb-1">Rights Scope</span>
                <span className="text-xs xs:text-sm sm:text-lg font-extrabold text-[#16a34a] whitespace-nowrap block">Proposed &amp; Contractual</span>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 mb-10 w-full max-w-lg mx-auto"
          >
            <a
              href={PARTNERSHIP_MAILTO}
              className="group relative inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-[#15803d] via-[#16a34a] to-[#22C55E] text-slate-950 font-coolvetica font-bold text-base sm:text-lg tracking-tight shadow-xl shadow-[#22C55E]/20 hover:shadow-2xl hover:shadow-[#22C55E]/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-emerald-300/50 overflow-hidden cursor-pointer w-full sm:w-auto"
            >
              {/* Subtle top shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/10 pointer-events-none" />
              <div className="relative flex items-center gap-3 z-10">
                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span className="uppercase tracking-wider text-sm font-black font-neue">Licensing Inquiry</span>
                <div className="w-7 h-7 rounded-full bg-slate-950/15 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </div>
              </div>
            </a>

            <button
              onClick={handleCopyEmail}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-neue font-bold text-xs sm:text-sm border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-md"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4 text-emerald-400" />}
              <span className="tracking-wide">{copiedEmail ? 'Email Copied!' : PARTNERSHIP_EMAIL}</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-600 font-medium pt-2"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
              <span className="text-slate-900 font-bold">Contract-Based Distribution</span>
            </div>
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#16a34a]" />
              <span className="text-slate-900 font-bold">Broadcast-Quality Urdu Dubbing</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#16a34a]" />
              <span className="text-slate-900 font-bold">Digital Monetization Strategy</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* WHAT FEVIQO IS - Uses Header Gradient Background */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-[#064e3b] shadow-2xl relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="flex justify-center">
              <SlantedBadge bgClass="bg-emerald-500/20" textClass="text-[#22C55E]" borderClass="border border-emerald-500/30">
                <span>COMPANY OVERVIEW</span>
              </SlantedBadge>
            </div>
            <h2 className="font-coolvetica text-3xl sm:text-4xl font-bold text-white tracking-tight">
              About FEVIQO Content Operations
            </h2>
            <p className="font-neue text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-normal">
              FEVIQO is a digital media and content operations company focused on video production, localization, and digital distribution. For Turkish content partnerships, FEVIQO operates as a proposed Pakistan-market localization and distribution partner, subject to the rights granted under each agreement.
            </p>
          </div>
        </div>
      </section>

      {/* Key Market Stats Bar */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 text-center">
            <div className="pt-4 sm:pt-0">
              <div className="font-coolvetica text-2xl sm:text-3xl font-bold text-[#16a34a] tracking-tight">
                Pakistan
              </div>
              <div className="font-neue text-xs sm:text-sm font-bold text-slate-800 mt-1">
                Urdu Digital Audience
              </div>
            </div>

            <div className="pt-4 sm:pt-0">
              <div className="font-coolvetica text-2xl sm:text-3xl font-bold text-[#16a34a] tracking-tight">
                Rights-First
              </div>
              <div className="font-neue text-xs sm:text-sm font-bold text-slate-800 mt-1">
                Contractual Distribution
              </div>
            </div>

            <div className="pt-4 sm:pt-0">
              <div className="font-coolvetica text-2xl sm:text-3xl font-bold text-[#16a34a] tracking-tight">
                24–48h
              </div>
              <div className="font-neue text-xs sm:text-sm font-bold text-slate-800 mt-1">
                Localization Turnaround
              </div>
            </div>

            <div className="pt-4 sm:pt-0">
              <div className="font-coolvetica text-2xl sm:text-3xl font-bold text-[#16a34a] tracking-tight">
                YouTube &amp; AVOD
              </div>
              <div className="font-neue text-xs sm:text-sm font-bold text-slate-800 mt-1">
                Digital Monetization Strategy
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHTS WE ARE SEEKING */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-100">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex justify-center mb-4">
            <SlantedBadge bgClass="bg-emerald-50" textClass="text-[#15803d]" borderClass="border border-emerald-200">
              <Layers className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>ACQUISITION SCOPE</span>
            </SlantedBadge>
          </div>
          <h2 className="font-coolvetica text-3xl sm:text-5xl font-bold text-slate-950 tracking-tight leading-tight">
            Rights We Are Seeking
          </h2>
          <p className="font-neue text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            FEVIQO evaluates Turkish content for defined territorial rights and commercial terms suited for digital expansion in Pakistan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-colors">
            <span className="text-xs font-coolvetica font-bold text-[#16a34a] uppercase tracking-wider block mb-2">01. Territory</span>
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-1">Pakistan</h3>
            <p className="font-neue text-xs text-slate-600 leading-relaxed">Territorial focus for digital distribution and audience reach.</p>
          </div>

          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-colors">
            <span className="text-xs font-coolvetica font-bold text-[#16a34a] uppercase tracking-wider block mb-2">02. Language</span>
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-1">Urdu Subtitles &amp; Dubbing</h3>
            <p className="font-neue text-xs text-slate-600 leading-relaxed">Full script localization, studio dubbing, and subtitle production.</p>
          </div>

          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-colors">
            <span className="text-xs font-coolvetica font-bold text-[#16a34a] uppercase tracking-wider block mb-2">03. Platforms</span>
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-1">YouTube &amp; AVOD</h3>
            <p className="font-neue text-xs text-slate-600 leading-relaxed">YouTube and other mutually agreed digital AVOD platforms.</p>
          </div>

          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-colors">
            <span className="text-xs font-coolvetica font-bold text-[#16a34a] uppercase tracking-wider block mb-2">04. Rights Type</span>
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-1">Digital &amp; Localization</h3>
            <p className="font-neue text-xs text-slate-600 leading-relaxed">Digital distribution rights and adaptation rights for Urdu.</p>
          </div>

          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-colors">
            <span className="text-xs font-coolvetica font-bold text-[#16a34a] uppercase tracking-wider block mb-2">05. Term</span>
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-1">Negotiated Term</h3>
            <p className="font-neue text-xs text-slate-600 leading-relaxed">Custom duration negotiated per title and catalog.</p>
          </div>

          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-colors">
            <span className="text-xs font-coolvetica font-bold text-[#16a34a] uppercase tracking-wider block mb-2">06. Exclusivity</span>
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-1">Exclusive or Non-Exclusive</h3>
            <p className="font-neue text-xs text-slate-600 leading-relaxed">Tailored depending on title availability and agreement terms.</p>
          </div>

          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-colors">
            <span className="text-xs font-coolvetica font-bold text-[#16a34a] uppercase tracking-wider block mb-2">07. Monetization</span>
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-1">Digital Monetization</h3>
            <p className="font-neue text-xs text-slate-600 leading-relaxed">Ad-supported revenue and permitted digital monetization models.</p>
          </div>

          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-colors">
            <span className="text-xs font-coolvetica font-bold text-[#16a34a] uppercase tracking-wider block mb-2">08. Reporting</span>
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-1">Periodic Auditing</h3>
            <p className="font-neue text-xs text-slate-600 leading-relaxed">Periodic performance and revenue reporting per agreement schedule.</p>
          </div>
        </div>
      </section>

      {/* HOW A PARTNERSHIP WORKS - Premium Dark Theme Cards & Clean Font Step Labels */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex justify-center mb-4">
            <SlantedBadge bgClass="bg-emerald-50" textClass="text-[#15803d]" borderClass="border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>OPERATIONAL WORKFLOW</span>
            </SlantedBadge>
          </div>
          <h2 className="font-coolvetica text-3xl sm:text-5xl font-bold text-slate-950 tracking-tight leading-tight">
            How a Partnership Works
          </h2>
          <p className="font-neue text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            A structured, 6-step framework connecting Turkish rights holders with localized distribution in Pakistan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Step 01 */}
          <div className="bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white rounded-2xl p-6 sm:p-8 border border-[#064e3b] shadow-xl hover:border-emerald-400/80 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <span className="font-coolvetica text-2xl sm:text-3xl font-black text-[#22C55E] tracking-tight">
                  01
                </span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#22C55E] flex items-center justify-center">
                  <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <h3 className="font-coolvetica text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                Rights Discussion
              </h3>
              <p className="font-neue text-emerald-100/90 text-xs sm:text-sm leading-relaxed font-normal">
                FEVIQO identifies the available Pakistan, Urdu, and digital rights for the selected title or catalog.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white rounded-2xl p-6 sm:p-8 border border-[#064e3b] shadow-xl hover:border-emerald-400/80 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <span className="font-coolvetica text-2xl sm:text-3xl font-black text-[#22C55E] tracking-tight">
                  02
                </span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#22C55E] flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <h3 className="font-coolvetica text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                Commercial Proposal
              </h3>
              <p className="font-neue text-emerald-100/90 text-xs sm:text-sm leading-relaxed font-normal">
                Both parties agree on the licensing structure, territory, platforms, term, exclusivity, and revenue model.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white rounded-2xl p-6 sm:p-8 border border-[#064e3b] shadow-xl hover:border-emerald-400/80 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <span className="font-coolvetica text-2xl sm:text-3xl font-black text-[#22C55E] tracking-tight">
                  03
                </span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#22C55E] flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <h3 className="font-coolvetica text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                Contract &amp; Materials
              </h3>
              <p className="font-neue text-emerald-100/90 text-xs sm:text-sm leading-relaxed font-normal">
                The applicable rights are documented and FEVIQO receives the approved source materials required for localization.
              </p>
            </div>
          </div>

          {/* Step 04 */}
          <div className="bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white rounded-2xl p-6 sm:p-8 border border-[#064e3b] shadow-xl hover:border-emerald-400/80 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <span className="font-coolvetica text-2xl sm:text-3xl font-black text-[#22C55E] tracking-tight">
                  04
                </span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#22C55E] flex items-center justify-center">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <h3 className="font-coolvetica text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                Urdu Localization
              </h3>
              <p className="font-neue text-emerald-100/90 text-xs sm:text-sm leading-relaxed font-normal">
                FEVIQO coordinates Urdu translation, subtitle production and/or dubbing, QC, and platform-ready delivery.
              </p>
            </div>
          </div>

          {/* Step 05 */}
          <div className="bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white rounded-2xl p-6 sm:p-8 border border-[#064e3b] shadow-xl hover:border-emerald-400/80 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <span className="font-coolvetica text-2xl sm:text-3xl font-black text-[#22C55E] tracking-tight">
                  05
                </span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#22C55E] flex items-center justify-center">
                  <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <h3 className="font-coolvetica text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                Digital Distribution
              </h3>
              <p className="font-neue text-emerald-100/90 text-xs sm:text-sm leading-relaxed font-normal">
                Licensed episodes are published through the platforms and channels permitted by the agreement.
              </p>
            </div>
          </div>

          {/* Step 06 */}
          <div className="bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white rounded-2xl p-6 sm:p-8 border border-[#064e3b] shadow-xl hover:border-emerald-400/80 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <span className="font-coolvetica text-2xl sm:text-3xl font-black text-[#22C55E] tracking-tight">
                  06
                </span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#22C55E] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <h3 className="font-coolvetica text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                Reporting &amp; Settlement
              </h3>
              <p className="font-neue text-emerald-100/90 text-xs sm:text-sm leading-relaxed font-normal">
                Performance and revenue are reported according to the agreed reporting and settlement schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINANCIAL STRUCTURE - Premium Header-Colored Box */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#032415] via-[#064e3b] to-[#021d11] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-14 border border-[#064e3b] shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-8 sm:mb-10">
            <div className="flex justify-center mb-3">
              <SlantedBadge bgClass="bg-emerald-500/20" textClass="text-[#22C55E]" borderClass="border border-emerald-500/40">
                <span>FINANCIAL STRUCTURE</span>
              </SlantedBadge>
            </div>
            <h2 className="font-coolvetica text-2xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Performance-Based Partnership
            </h2>
            <p className="text-base sm:text-2xl font-bold text-[#22C55E] mt-2 font-neue">
              A Revenue-Share Model for Pakistan
            </p>
          </div>

          <div className="bg-[#032415]/90 rounded-xl sm:rounded-3xl p-5 sm:p-10 border border-emerald-500/30 shadow-inner space-y-6 sm:space-y-8 backdrop-blur-md">
            <div className="space-y-4 font-neue text-emerald-100/90 text-sm sm:text-lg leading-relaxed">
              <p>
                FEVIQO is seeking Turkish content partnerships structured around performance. Rather than requiring an upfront licensing payment, FEVIQO proposes a revenue-sharing arrangement for approved content distributed through authorized digital platforms.
              </p>
              <p>
                Under the agreed structure, FEVIQO manages the Urdu localization and digital distribution operation, while the rights holder participates in the revenue generated by the licensed content.
              </p>
            </div>

            <div className="pt-6 sm:pt-8 border-t border-emerald-500/30">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-3">
                <SlantedBadge bgClass="bg-emerald-500/30" textClass="text-emerald-300" borderClass="border border-emerald-400/40">
                  <span>PRIMARY MODEL</span>
                </SlantedBadge>
                <h3 className="font-coolvetica text-xl sm:text-2xl font-bold text-white">
                  Revenue Share
                </h3>
              </div>
              <p className="font-neue text-emerald-50 text-sm sm:text-lg leading-relaxed mb-3 sm:mb-4">
                An agreed percentage of <strong className="text-[#22C55E] font-extrabold">net digital revenue</strong> generated by the licensed content across authorized platforms.
              </p>
              <p className="font-neue text-emerald-200/80 text-xs sm:text-sm leading-relaxed">
                The exact revenue share, eligible revenue sources, reporting requirements, settlement schedule, territory, platforms, term, and other commercial terms are negotiated privately with each rights holder.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-neue font-bold text-xs sm:text-base text-center shadow-xs">
              No upfront licensing fee is required under the proposed model, subject to mutual agreement.
            </div>
          </div>
        </div>
      </section>

      {/* WHAT THE RIGHTS HOLDER GETS */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex justify-center mb-4">
            <SlantedBadge bgClass="bg-emerald-50" textClass="text-[#15803d]" borderClass="border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>PARTNER VALUE</span>
            </SlantedBadge>
          </div>
          <h2 className="font-coolvetica text-3xl sm:text-5xl font-bold text-slate-950 tracking-tight leading-tight">
            What the Rights Holder Gets
          </h2>
          <p className="font-neue text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            A turnkey operational partner expanding Turkish IP into Pakistan's digital market under complete contractual oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-colors">
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-2">New Market Access</h3>
            <p className="font-neue text-xs sm:text-sm text-slate-600 leading-relaxed">
              A structured route into Pakistan's Urdu-language digital audience.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-colors">
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-2">Localized Content</h3>
            <p className="font-neue text-xs sm:text-sm text-slate-600 leading-relaxed">
              Professional Urdu subtitle and dubbing workflows prepared for digital distribution.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-colors">
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-2">Digital Monetization Strategy</h3>
            <p className="font-neue text-xs sm:text-sm text-slate-600 leading-relaxed">
              A framework for monetizing licensed content through agreed digital platforms.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-colors">
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-2">Operational Management</h3>
            <p className="font-neue text-xs sm:text-sm text-slate-600 leading-relaxed">
              Localization, publishing, metadata, scheduling, and channel operations managed by FEVIQO.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-colors">
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-2">Performance Visibility</h3>
            <p className="font-neue text-xs sm:text-sm text-slate-600 leading-relaxed">
              Agreed reporting on content performance and monetization.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-colors">
            <h3 className="font-coolvetica text-xl font-bold text-slate-950 mb-2">Rights Protection</h3>
            <p className="font-neue text-xs sm:text-sm text-slate-600 leading-relaxed">
              Distribution limited to the territory, language, platforms, and term defined by the agreement.
            </p>
          </div>
        </div>
      </section>

      {/* EVALUATION CHECKLIST - Uses Header Gradient Background & Premium Small Boxes */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-100">
        <div className="bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-[#064e3b] shadow-2xl">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="flex justify-center mb-3">
              <SlantedBadge bgClass="bg-emerald-500/20" textClass="text-[#22C55E]" borderClass="border border-emerald-500/30">
                <span>EVALUATION CHECKLIST</span>
              </SlantedBadge>
            </div>
            <h2 className="font-coolvetica text-3xl sm:text-4xl font-bold text-white tracking-tight">
              What We Need to Evaluate a Title
            </h2>
            <p className="font-neue text-emerald-100/90 text-xs sm:text-sm mt-3 leading-relaxed">
              To evaluate a Turkish series for Pakistan, FEVIQO reviews the available rights, territory, language, platform, term, exclusivity, and commercial structure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#032415]/80 backdrop-blur-md p-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-100 hover:border-emerald-400/70 transition-all flex items-center gap-3 shadow-inner">
              <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Series / catalog title</span>
            </div>
            <div className="bg-[#032415]/80 backdrop-blur-md p-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-100 hover:border-emerald-400/70 transition-all flex items-center gap-3 shadow-inner">
              <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Rights holder representative</span>
            </div>
            <div className="bg-[#032415]/80 backdrop-blur-md p-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-100 hover:border-emerald-400/70 transition-all flex items-center gap-3 shadow-inner">
              <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Pakistan territory availability</span>
            </div>
            <div className="bg-[#032415]/80 backdrop-blur-md p-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-100 hover:border-emerald-400/70 transition-all flex items-center gap-3 shadow-inner">
              <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Urdu localization rights</span>
            </div>
            <div className="bg-[#032415]/80 backdrop-blur-md p-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-100 hover:border-emerald-400/70 transition-all flex items-center gap-3 shadow-inner">
              <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>YouTube / AVOD rights</span>
            </div>
            <div className="bg-[#032415]/80 backdrop-blur-md p-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-100 hover:border-emerald-400/70 transition-all flex items-center gap-3 shadow-inner">
              <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Existing exclusivity restrictions</span>
            </div>
            <div className="bg-[#032415]/80 backdrop-blur-md p-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-100 hover:border-emerald-400/70 transition-all flex items-center gap-3 shadow-inner">
              <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Number of episodes / seasons</span>
            </div>
            <div className="bg-[#032415]/80 backdrop-blur-md p-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-100 hover:border-emerald-400/70 transition-all flex items-center gap-3 shadow-inner">
              <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Available masters &amp; subtitles</span>
            </div>
            <div className="bg-[#032415]/80 backdrop-blur-md p-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-100 hover:border-emerald-400/70 transition-all flex items-center gap-3 shadow-inner">
              <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Licensing structure preference</span>
            </div>
            <div className="bg-[#032415]/80 backdrop-blur-md p-4 rounded-xl border border-emerald-500/30 text-xs font-semibold text-emerald-100 hover:border-emerald-400/70 transition-all flex items-center gap-3 shadow-inner">
              <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
              <span>Contractual term expectations</span>
            </div>
          </div>
        </div>
      </section>

      {/* TITLES OF INTEREST Showcase */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex justify-center mb-4">
            <SlantedBadge bgClass="bg-emerald-50" textClass="text-[#15803d]" borderClass="border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>ACQUISITION TARGETS</span>
            </SlantedBadge>
          </div>
          <h2 className="font-coolvetica text-3xl sm:text-5xl font-bold text-slate-950 tracking-tight leading-tight">
            Titles of Interest
          </h2>
          <p className="font-neue text-[#16a34a] font-bold text-sm sm:text-base mt-2">
            Subject to Rights Availability
          </p>
          <p className="font-neue text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            FEVIQO is interested in evaluating select Turkish series for potential Pakistan localization and digital distribution, subject to confirmation of applicable rights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Title 1 Card: Teşkilat */}
          <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-md shadow-slate-900/5 group flex flex-col">
            <div className="aspect-[16/9] overflow-hidden relative bg-slate-950">
              <img
                src="/images/twebpic1720.png"
                alt="TEŞKİLAT Turkish Series"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
                <span className="bg-slate-950/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/20 shadow-sm pointer-events-auto">
                  ACTION / INTELLIGENCE DRAMA
                </span>
                <span className="bg-[#22C55E] text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full uppercase shadow-md pointer-events-auto">
                  TITLE OF INTEREST
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-coolvetica text-2xl sm:text-3xl font-bold text-slate-950 mb-2">
                  TEŞKİLAT
                </h3>
                <div className="text-[11px] sm:text-xs font-neue text-slate-500 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">
                  Pakistan &bull; Urdu &bull; YouTube / AVOD
                </div>
                <p className="font-neue text-slate-600 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6">
                  A title FEVIQO is interested in evaluating for potential Pakistan localization and digital distribution, subject to confirmation of the applicable rights.
                </p>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] sm:text-xs font-bold text-[#16a34a] uppercase font-neue">Subject to Rights Availability</span>
                <a
                  href={PARTNERSHIP_MAILTO}
                  className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#16a34a] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Discuss Rights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Title 2 Card: Fatih Sultan of Conquests */}
          <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-md shadow-slate-900/5 group flex flex-col">
            <div className="aspect-[16/9] overflow-hidden relative bg-slate-950">
              <img
                src="/images/MEHMED.png"
                alt="FATİH: SULTAN OF CONQUESTS Turkish Series"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
                <span className="bg-slate-950/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/20 shadow-sm pointer-events-auto">
                  HISTORICAL DRAMA
                </span>
                <span className="bg-[#22C55E] text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full uppercase shadow-md pointer-events-auto">
                  TITLE OF INTEREST
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-coolvetica text-2xl sm:text-3xl font-bold text-slate-950 mb-2">
                  FATİH: SULTAN OF CONQUESTS
                </h3>
                <div className="text-[11px] sm:text-xs font-neue text-slate-500 uppercase tracking-wider mb-3 sm:mb-4 font-semibold">
                  Pakistan &bull; Urdu &bull; YouTube / AVOD
                </div>
                <p className="font-neue text-slate-600 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6">
                  A title FEVIQO is interested in evaluating for potential Pakistan localization and digital distribution, subject to confirmation of the applicable rights.
                </p>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] sm:text-xs font-bold text-[#16a34a] uppercase font-neue">Subject to Rights Availability</span>
                <a
                  href={PARTNERSHIP_MAILTO}
                  className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#16a34a] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Discuss Rights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* START WITH ONE TITLE (Pilot Proposition) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-8 sm:p-12">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="flex justify-center mb-3">
              <SlantedBadge bgClass="bg-emerald-100/80" textClass="text-[#15803d]" borderClass="border border-emerald-200">
                <span>FLEXIBLE ENTRY MODEL</span>
              </SlantedBadge>
            </div>
            <h2 className="font-coolvetica text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight">
              Start With One Title
            </h2>
            <p className="font-neue text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              FEVIQO is open to beginning with a single licensed series or limited episode pilot before expanding into a broader catalog relationship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-coolvetica font-bold text-[#16a34a] block mb-1">01</span>
              <h3 className="font-coolvetica text-lg font-bold text-slate-950 mb-1">Rights Review</h3>
              <p className="text-xs text-slate-500 font-neue">Initial scope verification &amp; agreement terms.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-coolvetica font-bold text-[#16a34a] block mb-1">02</span>
              <h3 className="font-coolvetica text-lg font-bold text-slate-950 mb-1">Pilot Localization</h3>
              <p className="text-xs text-slate-500 font-neue">Sample episodes Urdu dubbing/subtitling.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-coolvetica font-bold text-[#16a34a] block mb-1">03</span>
              <h3 className="font-coolvetica text-lg font-bold text-slate-950 mb-1">Digital Release</h3>
              <p className="text-xs text-slate-500 font-neue">Channel launch &amp; audience development.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-coolvetica font-bold text-[#16a34a] block mb-1">04</span>
              <h3 className="font-coolvetica text-lg font-bold text-slate-950 mb-1">Performance Report</h3>
              <p className="text-xs text-slate-500 font-neue">Monetization &amp; engagement metrics.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-coolvetica font-bold text-[#16a34a] block mb-1">05</span>
              <h3 className="font-coolvetica text-lg font-bold text-slate-950 mb-1">Catalog Expansion</h3>
              <p className="text-xs text-slate-500 font-neue">Scaling additional series &amp; seasons.</p>
            </div>
          </div>
        </div>
      </section>

      {/* STRICT RIGHTS COMPLIANCE & YOUTUBE POLICY */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-50/90 border border-emerald-200/80 text-slate-950 rounded-2xl sm:rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xs">
          <div className="max-w-4xl mx-auto relative z-10 space-y-6 text-center">
            <div className="flex justify-center">
              <SlantedBadge bgClass="bg-emerald-100/80" textClass="text-[#15803d]" borderClass="border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>100% RIGHTS-COMPLIANT PHILOSOPHY</span>
              </SlantedBadge>
            </div>
            
            <h2 className="font-coolvetica text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight leading-tight text-center">
              Clear Agreements. Transparent Distribution.
            </h2>
            
            <p className="font-neue text-slate-600 text-sm sm:text-base leading-relaxed text-center max-w-3xl mx-auto font-normal">
              FEVIQO only publishes and monetizes third-party content after the applicable rights have been documented with the relevant rights holder.
            </p>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-900 text-xs sm:text-sm font-medium text-center max-w-2xl mx-auto">
              <HelpCircle className="w-4 h-4 text-amber-700 inline-block mr-1.5 -mt-0.5" />
              <span>YouTube monetization is subject to platform eligibility, applicable rights, and YouTube policies.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-emerald-200/80 text-left">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="text-xs font-bold text-[#16a34a] uppercase mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Territory Rights
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium">Pakistan and other territories only where contractually authorized.</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="text-xs font-bold text-[#16a34a] uppercase mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Language Rights
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium">Urdu localization and distribution rights.</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="text-xs font-bold text-[#16a34a] uppercase mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Platform Rights
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium">YouTube, AVOD, and other mutually agreed digital platforms.</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="text-xs font-bold text-[#16a34a] uppercase mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Licensing Terms
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium font-neue">Term, exclusivity, commercial structure, and usage rights agreed privately.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL LICENSING INQUIRY CTA SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-sm">
          <div className="flex justify-center mb-6">
            <SlantedBadge bgClass="bg-emerald-50" textClass="text-[#15803d]" borderClass="border border-emerald-200">
              <span>LICENSING INQUIRIES</span>
            </SlantedBadge>
          </div>

          <h2 className="font-coolvetica text-3xl sm:text-5xl font-bold text-slate-950 tracking-tight leading-tight mb-4">
            Have Turkish Content Available for Pakistan?
          </h2>

          <p className="font-neue text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            If you represent a Turkish studio, producer, distributor, or rights holder with content available for international licensing, FEVIQO would like to review your catalog and discuss potential Urdu localization and digital distribution opportunities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href={PARTNERSHIP_MAILTO}
              className="group relative inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-[#15803d] via-[#16a34a] to-[#22C55E] text-slate-950 font-coolvetica font-bold text-base sm:text-lg tracking-tight shadow-xl shadow-[#22C55E]/20 hover:shadow-2xl hover:shadow-[#22C55E]/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-emerald-300/50 overflow-hidden cursor-pointer w-full sm:w-auto"
            >
              {/* Subtle top shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/10 pointer-events-none" />
              <div className="relative flex items-center gap-3 z-10">
                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span className="uppercase tracking-wider text-sm font-black font-neue">Submit Licensing Inquiry</span>
                <div className="w-7 h-7 rounded-full bg-slate-950/15 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </div>
              </div>
            </a>

            <button
              onClick={handleCopyEmail}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-neue font-bold text-xs sm:text-sm border border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-xs"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-[#16a34a]" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span className="tracking-wide">{copiedEmail ? 'Email Copied!' : PARTNERSHIP_EMAIL}</span>
            </button>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-left max-w-2xl mx-auto">
            <div className="text-xs font-bold text-slate-900 mb-2 font-neue uppercase tracking-wider">
              Recommended Inquiry Details:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-neue">
              <div>&bull; Organization / Rights Holder</div>
              <div>&bull; Authorized Representative</div>
              <div>&bull; Catalog / Series Title(s)</div>
              <div>&bull; Territory &amp; Urdu Rights</div>
              <div>&bull; Digital / YouTube Rights</div>
              <div>&bull; Episodes / Seasons &amp; Preferred Terms</div>
            </div>
          </div>

          <div className="mt-6 text-xs font-neue text-slate-500">
            Direct Licensing Desk: <a href={PARTNERSHIP_MAILTO} className="text-[#16a34a] font-bold hover:underline">{PARTNERSHIP_EMAIL}</a>
          </div>
        </div>
      </section>

      {/* Standard FEVIQO Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 mt-auto text-xs font-neue text-slate-500">
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

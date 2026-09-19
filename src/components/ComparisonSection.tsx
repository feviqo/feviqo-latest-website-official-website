import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles, X, ShieldAlert } from 'lucide-react';

interface ComparisonSectionProps {
  onChooseOption: () => void;
  onNavigatePricing?: () => void;
}

interface AlternativeOption {
  id: string;
  title: string;
  dotColor: string;
  downside: string;
  details: string;
}

const ALTERNATIVES: AlternativeOption[] = [
  {
    id: 'diy',
    title: 'Do It Yourself',
    dotColor: 'bg-rose-400',
    downside: 'Endless hours, tangled timelines, zero fun',
    details: 'Steep learning curve in Premiere/Final Cut, slow rendering, hours lost editing instead of building your business.',
  },
  {
    id: 'ai',
    title: 'Use AI Tools',
    dotColor: 'bg-amber-400',
    downside: 'One tool is not enough, no personality, just… meh',
    details: 'Robotic pacing, glitchy captions, generic B-roll, and constant prompt tweaking with disappointing results.',
  },
  {
    id: 'inhouse',
    title: 'Hire In-House',
    dotColor: 'bg-slate-400',
    downside: 'Big salary, bigger headaches, limited creativity',
    details: '$65k+ annual base salary, software licenses, benefits, recruitment overhead, and sick-day delays.',
  },
];

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ onChooseOption, onNavigatePricing }) => {
  const [selectedMobileTab, setSelectedMobileTab] = useState<number>(0);
  const currentAlternative = ALTERNATIVES[selectedMobileTab];

  const handleAction = onNavigatePricing || onChooseOption;

  return (
    <section id="choices" className="py-14 sm:py-18 md:py-28 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Dark Emerald Outer Card */}
        <div className="bg-[#05281a] text-white border border-emerald-800/50 rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 md:p-14 shadow-2xl shadow-emerald-950/30 relative overflow-hidden">
          {/* Subtle internal ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

          {/* Section Header INSIDE the Box */}
          <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-10 md:mb-12 relative z-10">
            <div className="inline-flex items-center -skew-x-[22deg] bg-emerald-900/80 border border-emerald-500/40 px-4 py-1.5 mb-3 shadow-xs shrink-0">
              <span className="skew-x-[22deg] inline-flex items-center gap-2 text-emerald-300 text-xs sm:text-sm font-bold whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Smart Production Decisions</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              The Video Editing Choices In <span className="text-[#22C55E]">2026</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base md:text-lg text-emerald-100/80 font-normal">
              Compare your options before wasting time and budget.
            </p>
          </div>

          {/* 
            ==================================================
            MOBILE COMPACT & SYMMETRIC FORMAT (< lg)
            Replaces long vertical stacking with a sleek, 
            interactive tab-based side-by-side comparison!
            ==================================================
          */}
          <div className="lg:hidden block space-y-4">
            
            {/* Symmetrical 3-Way Segmented Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#02180f] rounded-xl border border-emerald-900/80">
              {ALTERNATIVES.map((alt, idx) => {
                const isSelected = selectedMobileTab === idx;
                return (
                  <button
                    key={alt.id}
                    onClick={() => setSelectedMobileTab(idx)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                        : 'text-emerald-200/70 hover:text-white'
                    }`}
                  >
                    {alt.title}
                  </button>
                );
              })}
            </div>

            {/* Symmetrical Comparison Grid: The Alternative vs FEVIQO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
              
              {/* Left Box: The Selected Alternative (Compact & Clear) */}
              <div className="bg-[#031d13] border border-rose-950/60 rounded-2xl p-4.5 flex flex-col justify-between shadow-inner">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{currentAlternative.title}</span>
                    </span>
                    <span className={`w-2 h-2 rounded-full ${currentAlternative.dotColor}`} />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                    {currentAlternative.downside}
                  </h4>
                  <p className="text-xs text-slate-300/80 leading-relaxed font-normal">
                    {currentAlternative.details}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-rose-300/80 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Costly & high friction</span>
                </div>
              </div>

              {/* Right Box: FEVIQO Winner (FEVIQO Emerald Green Card) */}
              <div className="bg-gradient-to-br from-[#043321] via-[#065f3d] to-[#04281a] border-2 border-emerald-400/60 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-[#22C55E] text-[10px] font-black uppercase tracking-wider border border-emerald-500/40">
                      <Sparkles className="w-3 h-3 text-[#22C55E]" />
                      <span>The Winner</span>
                    </span>
                    <span className="text-xs font-black text-[#22C55E] tracking-wider">FEVIQO</span>
                  </div>

                  <h3 className="text-lg font-black text-white mb-3 tracking-tight">
                    Scale Without Headaches
                  </h3>

                  <div className="space-y-2 text-xs text-emerald-100 mb-4 leading-relaxed font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shrink-0 font-bold">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span><strong>Predictable monthly rates</strong>, save up to $15.6k on annual plans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shrink-0 font-bold">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span><strong>Dedicated video editors</strong>, fast 24–48h delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shrink-0 font-bold">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span><strong>Cancel or pause anytime</strong> with zero penalties</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAction}
                  className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-sm shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all relative z-10"
                >
                  <span>Choose FEVIQO Now</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

            </div>

          </div>

          {/* 
            ==================================================
            DESKTOP FULL VIEW (lg+)
            Side-by-side 12-column layout
            ==================================================
          */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-stretch relative z-10">
            
            {/* Left 3 options - Box beneath Box */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
              {ALTERNATIVES.map((alt) => (
                <div 
                  key={alt.id}
                  className="p-6 rounded-2xl bg-[#031d13]/80 border border-emerald-900/60 hover:border-emerald-700/60 transition duration-200 shadow-md"
                >
                  <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${alt.dotColor}`}></span>
                    {alt.title}
                  </h3>
                  <p className="text-base text-slate-300 leading-relaxed font-normal mb-1">
                    {alt.downside}
                  </p>
                  <p className="text-xs text-slate-400">
                    {alt.details}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Side: The Clear Winner - Choose FEVIQO in Emerald Brand Green Card */}
            <div className="lg:col-span-6 bg-gradient-to-br from-[#043321] via-[#065f3d] to-[#04281a] border-2 border-emerald-400/60 rounded-2xl p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              {/* Internal glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 blur-[90px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-[#22C55E] text-xs font-black uppercase tracking-wider mb-5 border border-emerald-500/40 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>The Clear Winner</span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-black text-white mb-6 tracking-tight">
                  Choose FEVIQO
                </h3>

                <div className="space-y-4 text-base text-emerald-100 mb-8 leading-relaxed">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-md font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <strong className="text-white font-bold">Cost-Effective.</strong> Scale your business with predictable rates and save up to $15,600 on yearly packages.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-md font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <strong className="text-white font-bold">Hassle-Free.</strong> Skip the hiring, onboarding, and micromanaging. Dedicated editors deliver on time, every time.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-md font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <strong className="text-white font-bold">No Long-Term Commitment.</strong> Flexibility is key. Scale up, down, or pause anytime with zero contract penalties.
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAction}
                className="w-full py-4 sm:py-5 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-lg sm:text-xl shadow-2xl cursor-pointer flex items-center justify-center gap-3 group hover:scale-[1.02] transition-all relative z-10"
              >
                <span>Choose FEVIQO Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform stroke-[2.5]" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

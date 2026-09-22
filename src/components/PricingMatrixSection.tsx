import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Check, X, Sparkles, ArrowRight, ShieldCheck, 
  ChevronDown, ChevronUp, Star
} from 'lucide-react';
import { PreselectedPlan } from '../types';
import { FeviqoWordmark } from './FeviqoLogo';

interface PricingMatrixSectionProps {
  onBookCall: (plan?: PreselectedPlan) => void;
  showCompetitorTable?: boolean;
  showRetainerAndTrialBanner?: boolean;
  showCompareToggle?: boolean;
}

export const PricingMatrixSection: React.FC<PricingMatrixSectionProps> = ({ 
  onBookCall,
  showCompetitorTable = true,
  showRetainerAndTrialBanner = true,
  showCompareToggle = false,
}) => {
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'quarterly' | 'monthly'>('quarterly');
  const [expandedPlanFeatures, setExpandedPlanFeatures] = useState<Record<string, boolean>>({});
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(!showCompareToggle);

  const togglePlanFeatures = (planId: string) => {
    if (planId === 'scale' || planId === 'pro') {
      setIsCompareOpen(true);
      setTimeout(() => {
        const el = document.getElementById('compare-all-plans');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      // In-house card expands its own list locally without opening the 2-tier compare section
      setExpandedPlanFeatures((prev) => ({
        ...prev,
        [planId]: !prev[planId],
      }));
    }
  };

  const handleOpenCompare = () => {
    setIsCompareOpen(true);
    setTimeout(() => {
      const el = document.getElementById('compare-all-plans');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const plans = [
    {
      id: 'scale',
      name: 'Scale Plan',
      tag: 'Steady Growth',
      icon: '/images/pricing-scale.webp',
      subtitle: 'Perfect for businesses with steady content and zero stress',
      monthlyPrice: 1299,
      quarterlyWeeklyRate: 230,
      quarterlyWeeklySavings: 46,
      quarterlyMonthlyRate: 999,
      quarterlyTotal: 2997,
      quarterlySavings: 900,
      yearlyWeeklyRate: 207,
      yearlyWeeklySavings: 69,
      yearlyMonthlyRate: 899,
      yearlyTotal: 10788,
      yearlySavings: 4800,
      featured: false,
      turnaroundText: '2–3 business days turnaround*',
      features: [
        '2–3 business days turnaround*',
        'Unlimited revisions',
        'Dedicated Video Editing Team',
        'Up to 2 brands',
        'Up to 2 users',
        'Licensed music & SFX',
        'Standard Portal support',
      ],
      moreFeatures: [
        'Infinite iterations per active ticket',
        'Motion Graphics & Kinetic Typography',
        'Studio Audio Noise Reduction & EQ',
        'Multi-platform Aspect Ratios (16:9, 9:16, 1:1)',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      tag: 'Most Popular',
      icon: '/images/pricing-pro.webp',
      subtitle: 'Best for when high-volume, fast-turnaround is your jam',
      monthlyPrice: 2299,
      quarterlyWeeklyRate: 461,
      quarterlyWeeklySavings: 68,
      quarterlyMonthlyRate: 1999,
      quarterlyTotal: 5997,
      quarterlySavings: 900,
      yearlyWeeklyRate: 415,
      yearlyWeeklySavings: 114,
      yearlyMonthlyRate: 1799,
      yearlyTotal: 21588,
      yearlySavings: 6000,
      featured: true,
      turnaroundText: '1 day turnaround* (sub-24h for shorts)',
      features: [
        '1 day turnaround*',
        'Unlimited revisions',
        'Dedicated Video Editing Team',
        'Unlimited brand accounts',
        'Unlimited users',
        'Chat with editor on Slack',
        'Sub-24h for short-form',
        'Lead Editor + Creative Director',
      ],
      moreFeatures: [
        'Camera LOG & RAW Footage Support',
        'Infinite iterations per active ticket',
        'Motion Graphics & High-Retention B-Roll',
        'Studio Audio Noise Reduction & EQ',
        'Multi-platform Aspect Ratios (16:9, 9:16, 1:1)',
      ],
    },
    {
      id: 'inhouse',
      name: 'In House Team',
      tag: 'Full Creative Department',
      icon: '/images/pricing-inhouse.webp',
      subtitle: 'Your own creative department, just without the hiring headaches.',
      monthlyPrice: 5999,
      quarterlyWeeklyRate: 1153,
      quarterlyWeeklySavings: 228,
      quarterlyMonthlyRate: 4999,
      quarterlyTotal: 14997,
      quarterlySavings: 3000,
      yearlyWeeklyRate: 1084,
      yearlyWeeklySavings: 297,
      yearlyMonthlyRate: 4699,
      yearlyTotal: 56388,
      yearlySavings: 15600,
      featured: false,
      turnaroundText: 'Same-day / Custom Turnaround queue',
      features: [
        'All in PRO Plan +',
        'Custom Turnaround',
        'Dedicated Video Editor',
        'Instant Slack Collaboration',
        'Simultaneous requests',
        'Daily Slack syncs & standups',
        'Raw source files (Premiere / AE)',
      ],
      moreFeatures: [
        'Dedicated Senior Motion Designer',
        'Creative Director QA & Storyboarding',
        'Unlimited Brand Workspaces & Profiles',
        'Custom Brand Template & Graphic Package',
        '4K Master Exports & Uncompressed Archives',
        'Direct Loom & Zoom Creative Briefings',
        'Priority Emergency Rush Queues',
        'Full Commercial Rights & Source Archiving',
      ],
    },
  ];

  const competitors = [
    {
      name: 'FEVIQO (Our Model)',
      logo: '/images/feviqo1.png',
      price: '$999 / mo (From $230/wk)',
      dedicated: true,
      humanAi: true,
      fastTurnaround: true,
      nativePlatform: true,
      pmCheck: true,
      isFeviqo: true,
    },
    {
      name: 'Vidpros',
      logo: '/images/competitors/vidpros.webp',
      price: '$1,000 / mo',
      dedicated: true,
      humanAi: false,
      fastTurnaround: false,
      nativePlatform: false,
      pmCheck: false,
      isFeviqo: false,
    },
    {
      name: 'Vidchops',
      logo: '/images/competitors/vidchops.webp',
      price: '$995 / mo',
      dedicated: false,
      humanAi: false,
      fastTurnaround: false,
      nativePlatform: false,
      pmCheck: false,
      isFeviqo: false,
    },
    {
      name: 'Video Husky',
      logo: '/images/competitors/videohusky.webp',
      price: '$1,295 / mo',
      dedicated: true,
      humanAi: false,
      fastTurnaround: false,
      nativePlatform: false,
      pmCheck: false,
      isFeviqo: false,
    },
    {
      name: 'Edit Crew',
      logo: '/images/competitors/editcrew.webp',
      price: '$1,599 / mo',
      dedicated: false,
      humanAi: false,
      fastTurnaround: false,
      nativePlatform: false,
      pmCheck: true,
      isFeviqo: false,
    },
    {
      name: 'Freelancers (Fiverr)',
      logo: '/images/competitors/fiverr.webp',
      price: '$1,500+ / mo',
      dedicated: true,
      humanAi: false,
      fastTurnaround: false,
      nativePlatform: false,
      pmCheck: false,
      isFeviqo: false,
    },
    {
      name: 'In-House Full-Time',
      logo: '/images/pricing-inhouse.webp',
      price: '$5,000+ / mo',
      dedicated: true,
      humanAi: false,
      fastTurnaround: true,
      nativePlatform: false,
      pmCheck: false,
      isFeviqo: false,
    },
  ];

  return (
    <div className="w-full">
      {/* Billing Cycle Toggle */}
      <section className="pt-6 sm:pt-10 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-6 sm:mb-8 max-w-xl mx-auto px-2">
          
          {/* Pill Switcher */}
          <div className="relative grid grid-cols-3 p-1 sm:p-1.5 rounded-full bg-slate-200/85 border border-slate-300/80 shadow-inner box-border max-w-full overflow-hidden">
            {(['quarterly', 'monthly', 'yearly'] as const).map((cycle) => {
              const isActive = billingCycle === cycle;
              return (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className="relative z-10 py-2 sm:py-2.5 px-1 sm:px-3 rounded-full transition-colors cursor-pointer flex flex-col items-center justify-center text-center select-none min-w-0"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBillingCycleIndicator"
                      className="absolute inset-0 bg-white rounded-full shadow-md border border-slate-200/60"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 text-xs sm:text-sm font-black transition-colors ${isActive ? 'text-slate-950' : 'text-slate-600 hover:text-slate-900'}`}>
                    {cycle === 'quarterly' ? 'Quarterly' : cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                  </span>
                  <span className={`relative z-10 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full mt-0.5 tracking-tight truncate max-w-full transition-colors ${
                    cycle === 'quarterly'
                      ? 'bg-emerald-100 text-emerald-800'
                      : cycle === 'yearly'
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {cycle === 'quarterly' ? 'Save $3k' : cycle === 'yearly' ? 'Save $15.6k' : 'Flexible'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Payment Trust Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 text-xs font-semibold text-slate-600">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-emerald-500/40 text-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
                Payoneer Invoicing &amp; ACH
              </span>
            </div>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-[11px] sm:text-xs text-slate-500">
              Major Corporate Cards, Wire &amp; Custom Invoicing Accepted
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* MOBILE VIEW: Vertical Stack (< lg) */}
        <div className="flex flex-col gap-6 lg:hidden max-w-md mx-auto">
          {plans.map((plan) => {
            const monthlyPrice = billingCycle === 'yearly'
              ? plan.yearlyMonthlyRate
              : billingCycle === 'quarterly'
              ? plan.quarterlyMonthlyRate
              : plan.monthlyPrice;

            const weeklyRate = billingCycle === 'yearly'
              ? plan.yearlyWeeklyRate
              : billingCycle === 'quarterly'
              ? plan.quarterlyWeeklyRate
              : Math.round(plan.monthlyPrice / 4.33);

            const weeklySavings = billingCycle === 'yearly'
              ? plan.yearlyWeeklySavings
              : billingCycle === 'quarterly'
              ? plan.quarterlyWeeklySavings
              : 0;

            const handlePlanCheckout = () => {
              const selectedPlanData: PreselectedPlan = {
                id: plan.id,
                name: plan.name,
                cycle: billingCycle,
                monthlyRate: monthlyPrice,
                totalPrice: billingCycle === 'yearly' ? plan.yearlyTotal : billingCycle === 'quarterly' ? plan.quarterlyTotal : plan.monthlyPrice,
                savingsText: billingCycle === 'yearly' 
                  ? `Save $${plan.yearlySavings.toLocaleString()}/yr` 
                  : billingCycle === 'quarterly' 
                  ? `Save $${plan.quarterlySavings.toLocaleString()}/quarter` 
                  : 'Month-to-month, pause anytime',
                turnaround: plan.turnaroundText,
              };
              onBookCall(selectedPlanData);
            };

            return (
              <div
                key={`mobile-vertical-${plan.id}`}
                className={`rounded-[32px] p-6 sm:p-7 flex flex-col justify-between relative transition-all duration-300 ${
                  plan.featured
                    ? 'bg-white border-2 border-[#22C55E] shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-500/10'
                    : 'bg-white border border-slate-200/90 shadow-md'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#22C55E] text-slate-950 text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  {/* Icon */}
                  <div className="h-12 mb-3 flex items-center">
                    {plan.icon ? (
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50/70 p-1 flex items-center justify-center border border-emerald-100">
                        <img
                          src={plan.icon}
                          alt={plan.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* Plan Name & Tag */}
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <h3 className="text-xl font-black text-slate-950 tracking-tight">{plan.name}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider max-w-full ${
                      plan.featured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {plan.tag}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                    {plan.subtitle}
                  </p>

                  {/* Price Box */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-2 flex-wrap mb-2">
                      <span className="font-neue text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
                        ${weeklyRate}
                      </span>
                      <span className="font-neue text-slate-500 text-sm sm:text-base font-bold">/week</span>
                      {weeklySavings > 0 && (
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#15803d] text-xs font-extrabold uppercase tracking-wide self-center">
                          SAVE ${weeklySavings}/WK
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {billingCycle === 'quarterly' ? (
                        <span>(Billed quarterly) — ${plan.quarterlyTotal.toLocaleString()} every 3 months (${monthlyPrice}/mo)</span>
                      ) : billingCycle === 'yearly' ? (
                        <span>(Billed yearly) — ${plan.yearlyTotal.toLocaleString()} every 12 months (${monthlyPrice}/mo)</span>
                      ) : (
                        <span>(Billed monthly) — ${monthlyPrice.toLocaleString()}/mo, cancel anytime</span>
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2.5 mb-7">
                    <button
                      onClick={handlePlanCheckout}
                      className={`w-full py-3.5 rounded-full font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        plan.featured
                          ? 'bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 shadow-md shadow-[#22C55E]/30'
                          : 'bg-slate-900 hover:bg-slate-950 text-white'
                      }`}
                    >
                      <span>Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onBookCall()}
                      className="w-full py-2.5 rounded-full text-xs text-slate-600 hover:text-slate-950 font-bold border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Schedule a call
                    </button>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3.5 text-sm text-slate-700">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 text-[#22C55E] border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="font-neue text-sm sm:text-base font-medium text-slate-600 leading-relaxed">{feat}</span>
                      </div>
                    ))}

                    {expandedPlanFeatures[plan.id] && plan.moreFeatures && (
                      <div className="pt-3 space-y-3.5 border-t border-slate-100 mt-2">
                        {plan.moreFeatures.map((extraFeat, eidx) => (
                          <div key={`mob-extra-${eidx}`} className="flex items-start gap-2.5 animate-fadeIn">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-[#15803d] border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span className="font-neue text-sm sm:text-base font-medium text-slate-600 leading-relaxed">{extraFeat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {plan.moreFeatures && plan.moreFeatures.length > 0 && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={() => togglePlanFeatures(plan.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#16a34a] hover:text-[#15803d] transition-colors cursor-pointer py-1"
                      >
                        <span>{expandedPlanFeatures[plan.id] ? 'Show less features' : 'More features'}</span>
                        {expandedPlanFeatures[plan.id] ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP VIEW: 3-Column Layout */}
        <motion.div 
          key={`desktop-${billingCycle}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="hidden lg:grid lg:grid-cols-3 gap-6 sm:gap-8 items-start"
        >
          {plans.map((plan) => {
            const monthlyPrice = billingCycle === 'yearly'
              ? plan.yearlyMonthlyRate
              : billingCycle === 'quarterly'
              ? plan.quarterlyMonthlyRate
              : plan.monthlyPrice;

            const weeklyRate = billingCycle === 'yearly'
              ? plan.yearlyWeeklyRate
              : billingCycle === 'quarterly'
              ? plan.quarterlyWeeklyRate
              : Math.round(plan.monthlyPrice / 4.33);

            const weeklySavings = billingCycle === 'yearly'
              ? plan.yearlyWeeklySavings
              : billingCycle === 'quarterly'
              ? plan.quarterlyWeeklySavings
              : 0;

            const handlePlanCheckout = () => {
              const selectedPlanData: PreselectedPlan = {
                id: plan.id,
                name: plan.name,
                cycle: billingCycle,
                monthlyRate: monthlyPrice,
                totalPrice: billingCycle === 'yearly' ? plan.yearlyTotal : billingCycle === 'quarterly' ? plan.quarterlyTotal : plan.monthlyPrice,
                savingsText: billingCycle === 'yearly' 
                  ? `Save $${plan.yearlySavings.toLocaleString()}/yr` 
                  : billingCycle === 'quarterly' 
                  ? `Save $${plan.quarterlySavings.toLocaleString()}/quarter` 
                  : 'Month-to-month, pause anytime',
                turnaround: plan.turnaroundText,
              };
              onBookCall(selectedPlanData);
            };

            return (
              <div
                key={`desktop-card-${plan.id}`}
                className={`rounded-[32px] p-7 sm:p-9 flex flex-col justify-between relative transition-all duration-300 ${
                  plan.featured
                    ? 'bg-white border-2 border-[#22C55E] shadow-2xl shadow-emerald-500/10 z-10 ring-4 ring-emerald-500/10'
                    : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-lg shadow-slate-200/50'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#22C55E] text-slate-950 text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div className="flex flex-col h-full">
                  <div className="h-14 mb-4 flex items-center">
                    {plan.icon ? (
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50/70 p-1.5 flex items-center justify-center border border-emerald-100">
                        <img
                          src={plan.icon}
                          alt={plan.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14" />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2 min-h-[36px]">
                    <h3 className="font-coolvetica text-2xl font-bold text-slate-950 tracking-tight">{plan.name}</h3>
                    <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider max-w-full ${
                      plan.featured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {plan.tag}
                    </span>
                  </div>

                  <div className="h-12 mb-5 flex items-center">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {plan.subtitle}
                    </p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-slate-100 min-h-[120px] flex flex-col justify-end">
                    <div className="flex items-baseline gap-2 flex-wrap mb-2">
                      <span className="font-neue text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
                        ${weeklyRate}
                      </span>
                      <span className="font-neue text-slate-500 text-sm sm:text-base font-bold">/week</span>
                      {weeklySavings > 0 && (
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#15803d] text-xs font-extrabold uppercase tracking-wide self-center">
                          SAVE ${weeklySavings}/WK
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {billingCycle === 'quarterly' ? (
                        <span>(Billed quarterly) &mdash; ${plan.quarterlyTotal.toLocaleString()} every 3 months (${monthlyPrice}/mo)</span>
                      ) : billingCycle === 'yearly' ? (
                        <span>(Billed yearly) &mdash; ${plan.yearlyTotal.toLocaleString()} every 12 months (${monthlyPrice}/mo)</span>
                      ) : (
                        <span>(Billed monthly) &mdash; ${monthlyPrice.toLocaleString()}/mo, cancel anytime</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-7">
                    <button
                      onClick={handlePlanCheckout}
                      className={`w-full py-3.5 rounded-full font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                        plan.featured
                          ? 'bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 shadow-lg shadow-[#22C55E]/30 hover:scale-[1.01]'
                          : 'bg-slate-900 hover:bg-slate-950 text-white hover:scale-[1.01]'
                      }`}
                    >
                      <span>Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onBookCall()}
                      className="w-full py-2.5 rounded-full text-xs text-slate-600 hover:text-slate-950 font-bold border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Schedule a call
                    </button>
                  </div>

                  <div className="space-y-3.5 mb-6 text-sm sm:text-base text-slate-700 flex-1">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 text-[#22C55E] border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="font-neue text-sm sm:text-base font-medium text-slate-600 leading-relaxed">{feat}</span>
                      </div>
                    ))}

                    {expandedPlanFeatures[plan.id] && plan.moreFeatures && (
                      <div className="pt-3 space-y-3.5 border-t border-slate-100 mt-2">
                        {plan.moreFeatures.map((extraFeat, eidx) => (
                          <div key={`desktop-extra-${eidx}`} className="flex items-start gap-3 animate-fadeIn">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-[#15803d] border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span className="font-neue text-sm sm:text-base font-medium text-slate-600 leading-relaxed">{extraFeat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {plan.moreFeatures && plan.moreFeatures.length > 0 && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={() => togglePlanFeatures(plan.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16a34a] hover:text-[#15803d] transition-colors cursor-pointer py-1"
                      >
                        <span>{expandedPlanFeatures[plan.id] ? 'Show less features' : 'More features'}</span>
                        {expandedPlanFeatures[plan.id] ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Retainer Banner & Trial Banner */}
        {showRetainerAndTrialBanner && (
          <>
            <div className="mt-8 bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-emerald-500/40 rounded-[32px] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 text-[#22C55E] border border-emerald-500/50 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Annual Studio Retainers &amp; Custom Volumes</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Scale for the entire year with a <span className="text-[#22C55E]">Dedicated Video Pod</span>
                  </h3>
                  <p className="text-sm text-emerald-100/90 leading-relaxed">
                    Save across all tiers when committing annually (equivalent to 1 full month free). Receive a retained Senior Creative Director, lock your monthly editing rates for 12 months, and get priority holiday &amp; Q4 production fast-tracking with zero queue delays.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold text-emerald-100">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#22C55E]" />
                      <span>1 Month Free Included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#22C55E]" />
                      <span>Dedicated Lead Editor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#22C55E]" />
                      <span>Custom Invoicing &amp; ACH</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                  <button
                    onClick={() => {
                      setBillingCycle('yearly');
                      window.scrollTo({ top: 100, behavior: 'smooth' });
                    }}
                    className="px-7 py-3.5 rounded-full bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-sm text-center cursor-pointer transition-all shadow-lg shadow-[#22C55E]/30 hover:scale-105"
                  >
                    View Annual Package Rates
                  </button>
                  <button
                    onClick={() => onBookCall({
                      id: 'inhouse',
                      name: 'In-House Studio (Annual Retainer)',
                      cycle: 'yearly',
                      monthlyRate: 4699,
                      totalPrice: 56388,
                      savingsText: 'Save $15,600/yr (1 Month Free Included)',
                      turnaround: 'Same-day / Dedicated Video Pod',
                    })}
                    className="px-7 py-3 rounded-full bg-emerald-950/90 hover:bg-emerald-900 text-white font-bold text-xs text-center border border-emerald-500/50 cursor-pointer transition-all hover:border-emerald-400"
                  >
                    Discuss Custom Annual Retainer
                  </button>
                </div>
              </div>
            </div>

            {/* $89 Trial Video Banner */}
            <div className="mt-8 bg-white border border-emerald-200/80 rounded-[32px] p-6 sm:p-9 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-950/5">
              <div className="space-y-1.5 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200/80">
                  <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Low-Risk Assessment</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  Test drive our editing speed with an <span className="text-[#22C55E]">$89 Trial Video</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                  Order one video. Evaluate our pacing, grading, and turnaround speed. If you choose to subscribe to any plan, your $89 is 100% credited toward your first month.
                </p>
              </div>

              <button
                onClick={() => onBookCall({
                  id: 'trial',
                  name: 'Trial Video',
                  monthlyRate: 89,
                  cycle: 'monthly',
                  totalPrice: 89,
                  savingsText: '100% credited toward your first subscription',
                  turnaround: '24–48h turnaround',
                })}
                className="px-7 py-3.5 rounded-full bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-sm whitespace-nowrap cursor-pointer transition-all shadow-lg shadow-[#22C55E]/25 shrink-0 hover:scale-105 active:scale-95"
              >
                Order $89 Trial Video
              </button>
            </div>
          </>
        )}

        {/* Toggle Button for /unlimited-editing page */}
        {showCompareToggle && (
          <div className="mt-12 text-center">
            <button
              onClick={() => {
                if (isCompareOpen) {
                  setIsCompareOpen(false);
                } else {
                  handleOpenCompare();
                }
              }}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#0B0B0D] hover:bg-black text-white font-bold text-sm sm:text-base shadow-xl shadow-slate-900/10 cursor-pointer transition-all hover:scale-105"
            >
              <span>{isCompareOpen ? 'Hide Plan Comparison' : 'Compare Scale & Pro in Detail'}</span>
              {isCompareOpen ? (
                <ChevronUp className="w-4 h-4 text-[#22C55E]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#22C55E]" />
              )}
            </button>
          </div>
        )}
      </section>

      {/* 
        ==================================================
        EDITORIAL UNIFIED TWO-PACKAGE SPECIFICATION TABLE
        ==================================================
      */}
      {isCompareOpen && (
        <section id="compare-all-plans" className="py-20 sm:py-28 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full scroll-mt-20 animate-fadeIn">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0B0B0D]/50 mb-3">
            Plan Specifications
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B0B0D] tracking-tight">
            Compare <span className="text-[#22C55E]">Scale</span> &amp; <span className="text-[#22C55E]">Pro</span>
          </h2>
          <p className="text-sm sm:text-base text-[#0B0B0D]/65 mt-3 font-normal leading-relaxed">
            One unified specification sheet comparing turnaround, editing capabilities, and dedicated support side by side.
          </p>

          <div className="inline-flex items-center p-1 rounded-full bg-[#F4F4F5] border border-[#EAEAEA] mt-8">
            {(['quarterly', 'monthly', 'yearly'] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-3.5 sm:px-5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                  billingCycle === cycle
                    ? 'bg-white text-[#0B0B0D] shadow-xs'
                    : 'text-[#0B0B0D]/60 hover:text-[#0B0B0D]'
                }`}
              >
                {cycle === 'quarterly' ? 'Quarterly (Save 20%)' : cycle === 'yearly' ? 'Yearly (Save 30%)' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full">
          {/* Header Row */}
          <div className="grid grid-cols-12 pb-4 sm:pb-8 border-b-2 border-[#0B0B0D] items-end gap-1.5 sm:gap-4">
            <div className="col-span-6 pr-1 sm:pr-6">
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#0B0B0D]/40 block mb-0.5 sm:mb-1 whitespace-nowrap">
                Tier Comparison
              </span>
              <h3 className="text-xs sm:xl md:text-2xl font-black text-[#0B0B0D] tracking-tight leading-snug">
                Features &amp; Turnaround
              </h3>
            </div>

            {/* Scale Column Header */}
            <div className="col-span-3 text-center px-0.5 sm:px-3 flex flex-col items-center justify-end">
              <div className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-[#0B0B0D]/60 mb-0.5 sm:mb-1 whitespace-nowrap">
                Scale
              </div>
              <div className="text-base sm:text-2xl md:text-3xl font-black text-[#0B0B0D] tracking-tight leading-tight whitespace-nowrap">
                ${billingCycle === 'quarterly' ? '999' : billingCycle === 'yearly' ? '899' : '1,299'}
                <span className="text-[9px] sm:text-xs font-normal text-[#0B0B0D]/50">/mo</span>
              </div>
              <div className="text-[8.5px] sm:text-xs text-[#0B0B0D]/50 mt-0.5 mb-2 sm:mb-3 whitespace-nowrap">
                ${billingCycle === 'quarterly' ? '230' : billingCycle === 'yearly' ? '207' : '300'} / wk
              </div>
              <button
                onClick={() => onBookCall({
                  id: 'scale',
                  name: 'Scale Plan',
                  cycle: billingCycle,
                  monthlyRate: billingCycle === 'quarterly' ? 999 : billingCycle === 'yearly' ? 899 : 1299,
                  totalPrice: billingCycle === 'quarterly' ? 2997 : billingCycle === 'yearly' ? 10788 : 1299,
                  savingsText: billingCycle === 'quarterly' ? 'Save $900/quarter' : billingCycle === 'yearly' ? 'Save $4,800/yr' : 'Month-to-month',
                  turnaround: '2–3 business days delivery',
                })}
                className="w-full max-w-[120px] py-1.5 sm:py-2.5 px-1 sm:px-4 rounded-full bg-[#0B0B0D] hover:bg-black text-white text-[9.5px] sm:text-xs font-bold tracking-tight sm:tracking-wide transition-all active:scale-95 cursor-pointer whitespace-nowrap text-center flex items-center justify-center"
              >
                Get Started
              </button>
            </div>

            {/* Pro Column Header */}
            <div className="col-span-3 text-center px-0.5 sm:px-3 flex flex-col items-center justify-end">
              <div className="inline-flex items-center justify-center gap-1 text-[9px] sm:text-xs font-black uppercase tracking-[0.12em] sm:tracking-[0.15em] text-[#22C55E] mb-0.5 sm:mb-1 whitespace-nowrap">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                Pro
              </div>
              <div className="text-base sm:text-2xl md:text-3xl font-black text-[#0B0B0D] tracking-tight leading-tight whitespace-nowrap">
                ${billingCycle === 'quarterly' ? '1,999' : billingCycle === 'yearly' ? '1,799' : '2,299'}
                <span className="text-[9px] sm:text-xs font-normal text-[#0B0B0D]/50">/mo</span>
              </div>
              <div className="text-[8.5px] sm:text-xs text-[#0B0B0D]/50 mt-0.5 mb-2 sm:mb-3 whitespace-nowrap">
                ${billingCycle === 'quarterly' ? '461' : billingCycle === 'yearly' ? '415' : '530'} / wk
              </div>
              <button
                onClick={() => onBookCall({
                  id: 'pro',
                  name: 'Pro Plan',
                  cycle: billingCycle,
                  monthlyRate: billingCycle === 'quarterly' ? 1999 : billingCycle === 'yearly' ? 1799 : 2299,
                  totalPrice: billingCycle === 'quarterly' ? 5997 : billingCycle === 'yearly' ? 21588 : 2299,
                  savingsText: billingCycle === 'quarterly' ? 'Save $900/quarter' : billingCycle === 'yearly' ? 'Save $6,000/yr' : 'Month-to-month',
                  turnaround: '1 business day turnaround',
                })}
                className="w-full max-w-[120px] py-1.5 sm:py-2.5 px-1 sm:px-4 rounded-full bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 text-[9.5px] sm:text-xs font-black tracking-tight sm:tracking-wide shadow-xs sm:shadow-md sm:shadow-[#22C55E]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap text-center flex items-center justify-center"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* 1. Turnaround Times */}
          <div className="pt-6 sm:pt-10 pb-2 sm:pb-3">
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#0B0B0D]/45">
              Turnaround Times
            </h4>
          </div>

          <div className="divide-y divide-[#EAEAEA]">
            <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
              <div className="col-span-6 font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Short-form &lt; 90s</div>
              <div className="col-span-3 text-center text-[10px] sm:text-sm font-medium text-[#0B0B0D]/75">1 per day</div>
              <div className="col-span-3 text-center text-[10px] sm:text-sm font-bold text-[#0B0B0D]">Multiple per day</div>
            </div>

            <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
              <div className="col-span-6 font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Long-form &lt; 10 min</div>
              <div className="col-span-3 text-center text-[10px] sm:text-sm font-medium text-[#0B0B0D]/75">Up to 2 days</div>
              <div className="col-span-3 text-center text-[10px] sm:text-sm font-bold text-[#0B0B0D]">Up to 1 day</div>
            </div>

            <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
              <div className="col-span-6 font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Long-form &lt; 20 min</div>
              <div className="col-span-3 text-center text-[10px] sm:text-sm font-medium text-[#0B0B0D]/75">Up to 3 days</div>
              <div className="col-span-3 text-center text-[10px] sm:text-sm font-bold text-[#0B0B0D]">Up to 1 day</div>
            </div>

            <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
              <div className="col-span-6 font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Long-form &lt; 30 min</div>
              <div className="col-span-3 text-center text-[10px] sm:text-sm font-medium text-[#0B0B0D]/75">Up to 4 days</div>
              <div className="col-span-3 text-center text-[10px] sm:text-sm font-bold text-[#0B0B0D]">Up to 2 days</div>
            </div>

            <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
              <div className="col-span-6 font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Long-form &lt; 60 min</div>
              <div className="col-span-3 text-center text-[10px] sm:text-sm font-medium text-[#0B0B0D]/75">Up to 5 days</div>
              <div className="col-span-3 text-center text-[10px] sm:text-sm font-bold text-[#0B0B0D]">Up to 3 days</div>
            </div>
          </div>

          {/* 2. Editing Features */}
          <div className="pt-7 sm:pt-12 pb-2 sm:pb-3">
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#0B0B0D]/45">
              Editing Features
            </h4>
          </div>

          <div className="divide-y divide-[#EAEAEA]">
            <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
              <div className="col-span-6 font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Unlimited revisions</div>
              <div className="col-span-3 flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="col-span-3 flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
              <div className="col-span-6 font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Infinite iterations per active ticket</div>
              <div className="col-span-3 flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="col-span-3 flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
              <div className="col-span-6">
                <div className="font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Motion Graphics &amp; Kinetic Typography</div>
                <div className="text-[9px] sm:text-xs text-[#0B0B0D]/50 mt-0.5">Zooms, titles, sound FX &amp; overlays</div>
              </div>
              <div className="col-span-3 flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="col-span-3 flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
              <div className="col-span-6">
                <div className="font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Studio Audio Noise Reduction &amp; EQ</div>
                <div className="text-[9px] sm:text-xs text-[#0B0B0D]/50 mt-0.5">Noise reduction, audio restoration &amp; EQ balancing</div>
              </div>
              <div className="col-span-3 flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="col-span-3 flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
              <div className="col-span-6">
                <div className="font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Multi-platform Aspect Ratios (16:9, 9:16, 1:1)</div>
                <div className="text-[9px] sm:text-xs text-[#0B0B0D]/50 mt-0.5">Horizontal 16:9, Vertical 9:16 &amp; Square 1:1 cutdowns</div>
              </div>
              <div className="col-span-3 flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="col-span-3 flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
              <div className="col-span-6">
                <div className="font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Camera LOG / RAW files</div>
                <div className="text-[9px] sm:text-xs text-[#0B0B0D]/50 mt-0.5">Sony, Canon, Arri, RED &amp; BRAW</div>
              </div>
              <div className="col-span-3 flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
              <div className="col-span-3 flex justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>

            {/* 3. Creative Leadership & Delivery */}
            <div className="pt-7 sm:pt-12 pb-2 sm:pb-3">
              <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#0B0B0D]/45">
                Creative Pod &amp; Collaboration
              </h4>
            </div>

            <div className="divide-y divide-[#EAEAEA]">
              <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
                <div className="col-span-6">
                  <div className="font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Assigned Creative Team</div>
                  <div className="text-[9px] sm:text-xs text-[#0B0B0D]/50 mt-0.5">Editor pairing &amp; quality assurance</div>
                </div>
                <div className="col-span-3 text-center text-[10px] sm:text-sm font-medium text-[#0B0B0D]/75">1 Senior Editor</div>
                <div className="col-span-3 text-center text-[10px] sm:text-sm font-bold text-[#0B0B0D]">Lead Editor + Creative Director QA</div>
              </div>

              <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
                <div className="col-span-6">
                  <div className="font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Slack Real-Time Collaboration</div>
                  <div className="text-[9px] sm:text-xs text-[#0B0B0D]/50 mt-0.5">Direct chat &amp; live screen sharing syncs</div>
                </div>
                <div className="col-span-3 flex justify-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
                <div className="col-span-3 flex justify-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
                <div className="col-span-6">
                  <div className="font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">High-Retention B-Roll &amp; Stock Libraries</div>
                  <div className="text-[9px] sm:text-xs text-[#0B0B0D]/50 mt-0.5">Artgrid, Storyblocks &amp; bespoke 4K visual sourcing</div>
                </div>
                <div className="col-span-3 text-center text-[10px] sm:text-sm font-medium text-[#0B0B0D]/75">Standard Curated B-Roll</div>
                <div className="col-span-3 text-center text-[10px] sm:text-sm font-bold text-[#0B0B0D]">Premium Unlimited Sourcing</div>
              </div>

              <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
                <div className="col-span-6 font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Brand Profiles &amp; Workspaces</div>
                <div className="col-span-3 text-center text-[10px] sm:text-sm font-medium text-[#0B0B0D]/75">Up to 2 brands</div>
                <div className="col-span-3 text-center text-[10px] sm:text-sm font-bold text-[#0B0B0D]">Unlimited brands</div>
              </div>

              <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
                <div className="col-span-6 font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Team Seats &amp; User Access</div>
                <div className="col-span-3 text-center text-[10px] sm:text-sm font-medium text-[#0B0B0D]/75">Up to 2 users</div>
                <div className="col-span-3 text-center text-[10px] sm:text-sm font-bold text-[#0B0B0D]">Unlimited users</div>
              </div>

              <div className="grid grid-cols-12 py-3 sm:py-4 items-center hover:bg-[#FAFAFA] transition-colors px-1 sm:px-3 rounded-xl gap-2 sm:gap-4">
                <div className="col-span-6">
                  <div className="font-semibold text-[#0B0B0D] text-[11px] sm:text-sm">Licensed Music &amp; SFX Catalog</div>
                  <div className="text-[9px] sm:text-xs text-[#0B0B0D]/50 mt-0.5">Commercial broadcast licensing included</div>
                </div>
                <div className="col-span-3 flex justify-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="col-span-3 flex justify-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </div>
        </div>
      </section>
      )}

      {/* Competitor Benchmark Comparison Matrix */}
      {showCompetitorTable && (
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <span>Transparent Benchmarks</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              How FEVIQO Compares
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 font-normal">
              Why leading brands and top creators choose FEVIQO over traditional agencies, marketplaces, and in-house hires.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700 min-w-[700px]">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-4 sm:px-6">Editing Model</th>
                    <th className="py-4 px-4">Starting Price</th>
                    <th className="py-4 px-4 text-center">Dedicated Editor</th>
                    <th className="py-4 px-4 text-center">Human + AI Speed</th>
                    <th className="py-4 px-4 text-center">&lt;24h Turnaround</th>
                    <th className="py-4 px-4 text-center">Private Portal</th>
                    <th className="py-4 px-4 text-center">Creative Director Check</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {competitors.map((item, idx) => (
                    <tr 
                      key={idx}
                      className={
                        item.isFeviqo 
                          ? 'bg-emerald-50/70 font-bold text-slate-950 border-y-2 border-emerald-500/40' 
                          : 'hover:bg-slate-50/60 transition-colors'
                      }
                    >
                      <td className="py-4 px-4 sm:px-6 font-extrabold text-slate-950 flex items-center gap-3">
                        {item.isFeviqo ? (
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={item.logo} 
                              alt="FEVIQO Logo" 
                              className="h-7 w-auto max-w-[100px] max-h-7 object-contain shrink-0" 
                              onError={(e) => {
                                e.currentTarget.src = "/feviqo1.png";
                              }}
                            />
                            <span className="font-coolvetica text-base font-bold text-[#16a34a]">FEVIQO (Our Model)</span>
                          </div>
                        ) : (
                          <img 
                            src={item.logo} 
                            alt={item.name} 
                            className="h-6 w-auto max-w-[80px] max-h-6 object-contain shrink-0" 
                            loading="lazy"
                          />
                        )}
                        {!item.isFeviqo && <span>{item.name}</span>}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800">{item.price}</td>
                      
                      <td className="py-4 px-4 text-center">
                        {item.dedicated ? (
                          <Check className="w-4 h-4 text-[#22C55E] mx-auto stroke-[3]" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {item.humanAi ? (
                          <Check className="w-4 h-4 text-[#22C55E] mx-auto stroke-[3]" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {item.fastTurnaround ? (
                          <Check className="w-4 h-4 text-[#22C55E] mx-auto stroke-[3]" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {item.nativePlatform ? (
                          <Check className="w-4 h-4 text-[#22C55E] mx-auto stroke-[3]" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {item.pmCheck ? (
                          <Check className="w-4 h-4 text-[#22C55E] mx-auto stroke-[3]" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Close comparison button at bottom */}
            {showCompareToggle && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => {
                    setIsCompareOpen(false);
                    const el = document.getElementById('pricing');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm cursor-pointer transition-colors border border-slate-200 shadow-xs"
                >
                  <span>Hide Plan Comparison</span>
                  <ChevronUp className="w-4 h-4 text-[#16a34a]" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

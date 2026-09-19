import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, X, Sparkles, ArrowRight, ShieldCheck, Zap, 
  HelpCircle, ChevronDown, ChevronUp, Clock, Users, 
  MessageSquare, Star, ArrowLeft
} from 'lucide-react';
import { FeviqoHeaderLogo } from './FeviqoLogo';
import { PricingShowcaseCollage } from './PricingShowcaseCollage';
import { Navbar } from './Navbar';
import { AppRoute, PreselectedPlan } from '../types';

interface PricingPageProps {
  onBackToHome: () => void;
  onBookCall: (plan?: PreselectedPlan) => void;
  onOpenFlow: (view?: 'login' | 'register' | 'admin') => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigatePricing?: () => void;
  onNavigatePage?: (route: AppRoute) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ 
  onBackToHome, 
  onBookCall,
  onOpenFlow,
  onNavigateSection,
  onNavigatePricing,
  onNavigatePage
}) => {
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'quarterly' | 'monthly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      id: 'scale',
      name: 'Scale',
      tag: 'Steady Growth',
      icon: '/images/pricing-scale.webp',
      description: 'Ideal for creators and growing brands requiring consistent, high-retention video output.',
      monthlyPrice: 1299,
      quarterlyMonthlyRate: 999,
      quarterlyTotal: 2997,
      quarterlySavings: 900,
      yearlyMonthlyRate: 899,
      yearlyTotal: 10788,
      yearlySavings: 4800,
      featured: false,
      turnaround: '2–3 business days delivery',
      features: [
        'Dedicated Video Editing Team',
        '2–3 business days turnaround',
        'Unlimited revisions included',
        'Up to 2 active brands',
        'Up to 2 team member seats',
        'FEVIQO Flow Portal dashboard',
        'Licensed music, SFX & stock footage',
        'Standard Slack support channel',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      tag: 'Most Popular',
      icon: '/images/pricing-pro.webp',
      description: 'Engineered for high-volume content operations demanding rapid daily turnaround.',
      monthlyPrice: 2299,
      quarterlyMonthlyRate: 1999,
      quarterlyTotal: 5997,
      quarterlySavings: 900,
      yearlyMonthlyRate: 1799,
      yearlyTotal: 21588,
      yearlySavings: 6000,
      featured: true,
      turnaround: '1 business day (sub-24h for shorts)',
      features: [
        'Sub-24h turnaround for short-form',
        '1 business day for long-form content',
        'Unlimited revisions until perfect',
        'Dedicated Lead Editor + Creative Director',
        'Unlimited brand profiles & workspaces',
        'Unlimited team user seats',
        'Direct Slack channel with your editor',
        'Native FEVIQO Flow private workspace',
        'Bespoke motion graphics & custom titles',
      ],
    },
    {
      id: 'inhouse',
      name: 'In-House Studio',
      tag: 'Maximum Scale',
      icon: '/images/pricing-inhouse.webp',
      description: 'Your own full creative production department, minus the hiring and operational overhead.',
      monthlyPrice: 5999,
      quarterlyMonthlyRate: 4999,
      quarterlyTotal: 14997,
      quarterlySavings: 3000,
      yearlyMonthlyRate: 4699,
      yearlyTotal: 56388,
      yearlySavings: 15600,
      featured: false,
      turnaround: 'Same-day / Custom queue speed',
      features: [
        'Everything in Pro included',
        'Multiple edits delivered daily',
        'Dedicated full-time senior video editor',
        'Daily Slack standups & video syncs',
        'Simultaneous project requests running',
        'Priority queue fast-track placement',
        'Custom 3D / 2D animation packages',
        'Raw source project files (Premiere/AE)',
      ],
    },
  ];

  const competitors = [
    {
      name: 'FEVIQO',
      logo: '/feviqo1.png',
      price: '$1,299 / mo',
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
      dedicated: false,
      humanAi: false,
      fastTurnaround: false,
      nativePlatform: false,
      pmCheck: true,
      isFeviqo: false,
    },
    {
      name: 'Vidchops',
      logo: '/images/competitors/vidchops.webp',
      price: '$495 / mo',
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
      price: '$849 / mo',
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

  const pricingFaqs = [
    {
      q: 'Can I switch or pause my subscription at any time?',
      a: 'Yes, 100%. There are zero long-term commitments or lock-in contracts. You can pause or upgrade your plan at any time directly through your FEVIQO Flow workspace with a single click.',
    },
    {
      q: 'How does the $89 Trial Video work?',
      a: 'If you wish to test our editing craftsmanship and turnaround before subscribing, you can order a single video trial for $89. You receive the finished, high-retention edit with unlimited revisions. When you subscribe to any monthly or quarterly plan, your $89 is credited directly toward your first billing cycle.',
    },
    {
      q: 'How do you guarantee sub-24h to 48h turnaround?',
      a: 'We pair you with dedicated editors managed by an experienced Creative Director. Tasks move through a daily continuous production queue inside FEVIQO Flow. Short-form clips (Reels, TikToks, Shorts) are delivered in under 24 hours, while long-form content is delivered in 24–48 hours.',
    },
    {
      q: 'What video formats and genres do you support?',
      a: 'We edit across all formats and platforms: YouTube long-form (16:9), Shorts / TikTok / Reels (9:16), Paid Social Ads (1:1, 4:5, 9:16), Podcasts, Webinars, and Educational courses. We accept 4K, 1080p, iPhone ProRes, and LOG camera footage.',
    },
    {
      q: 'What types of videos do you NOT edit, and do you provide voiceovers?',
      a: "We don't edit music videos, wedding movies, or extensive animations. For voiceovers, we are happy to use your recorded audio, or we can also use AI for voiceovers, but that will add up a cost.",
    },
    {
      q: 'Are revisions genuinely unlimited?',
      a: 'Yes. We continue refining every cut until you are completely satisfied. You can leave precise timestamped comments directly on the video player in FEVIQO Flow or chat live with your editor on Slack.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900 font-sans flex flex-col selection:bg-[#22C55E] selection:text-slate-950">
      
      {/* Global Green Header with all options */}
      <Navbar 
        onBookCall={() => onBookCall()}
        onNavigateSection={onNavigateSection || onBackToHome}
        onNavigatePricing={onNavigatePricing || (() => {})}
        onNavigateFlow={onOpenFlow}
        onNavigatePage={onNavigatePage || ((route) => {
          if (route === 'home') onBackToHome();
        })}
      />

      {/* 
        Pricing Section Only: No extraneous hero, no headings
        Directly leads to billing cycle toggle and pricing tiers
      */}
      <section className="pt-8 sm:pt-12 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Billing Cycle Toggle with Fluid Sliding Indicator */}
        <div className="text-center mb-6 sm:mb-10 max-w-xl mx-auto px-2">
          <div className="relative grid grid-cols-3 p-1 sm:p-1.5 rounded-2xl sm:rounded-full bg-slate-200/85 border border-slate-300/80 shadow-inner box-border max-w-full overflow-hidden">
            {(['yearly', 'quarterly', 'monthly'] as const).map((cycle) => {
              const isActive = billingCycle === cycle;
              return (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className="relative z-10 py-1.5 sm:py-2.5 px-0.5 sm:px-3 rounded-xl sm:rounded-full transition-colors cursor-pointer flex flex-col items-center justify-center text-center select-none min-w-0"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBillingCycleIndicator"
                      className="absolute inset-0 bg-white rounded-xl sm:rounded-full shadow-md border border-slate-200/60"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 text-xs sm:text-sm font-black transition-colors ${isActive ? 'text-slate-950' : 'text-slate-600 hover:text-slate-900'}`}>
                    {cycle === 'yearly' ? 'Yearly' : cycle === 'quarterly' ? 'Quarterly' : 'Monthly'}
                  </span>
                  <span className={`relative z-10 text-[8px] sm:text-[10px] font-bold px-1 sm:px-2 py-0.5 rounded-full mt-0.5 tracking-tight truncate max-w-full transition-colors ${
                    cycle === 'yearly'
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : cycle === 'quarterly'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {cycle === 'yearly' ? 'Save $15.6k' : cycle === 'quarterly' ? 'Save $3k' : 'Flexible'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Official Payoneer Payment Trust Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 text-xs font-semibold text-slate-600">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-emerald-500/40 text-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
                Payoneer Invoicing & ACH
              </span>
            </div>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-[11px] sm:text-xs text-slate-500">
              Major Corporate Cards, Wire & Custom Invoicing Accepted
            </span>
          </div>
        </div>
      </section>

      {/* 
        ==================================================
        PRICING CARDS GRID (Apple Aesthetic)
        Crisp white surfaces, refined typography, subtle borders
        ==================================================
      */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div 
          key={billingCycle}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch"
        >
          {plans.map((plan) => {
            const price = billingCycle === 'yearly'
              ? plan.yearlyMonthlyRate
              : billingCycle === 'quarterly'
              ? plan.quarterlyMonthlyRate
              : plan.monthlyPrice;

            const handlePlanGetStarted = () => {
              const selectedPlanData: PreselectedPlan = {
                id: plan.id,
                name: plan.name,
                cycle: billingCycle,
                monthlyRate: price,
                totalPrice: billingCycle === 'yearly' ? plan.yearlyTotal : billingCycle === 'quarterly' ? plan.quarterlyTotal : plan.monthlyPrice,
                savingsText: billingCycle === 'yearly' 
                  ? `Save $${plan.yearlySavings.toLocaleString()}/yr` 
                  : billingCycle === 'quarterly' 
                  ? `Save $${plan.quarterlySavings.toLocaleString()}/quarter` 
                  : 'Month-to-month, pause anytime',
                turnaround: plan.turnaround,
              };
              onBookCall(selectedPlanData);
            };

            return (
              <div
                key={plan.id}
                className={`rounded-[32px] p-6 sm:p-9 flex flex-col justify-between relative transition-all duration-300 ${
                  plan.featured
                    ? 'bg-white border-2 border-[#22C55E] shadow-2xl shadow-emerald-500/10 lg:scale-[1.02] z-10'
                    : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-lg shadow-slate-200/50'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#22C55E] text-slate-950 text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Recommended</span>
                  </div>
                )}

                <div>
                  {/* Plan Icon Artwork */}
                  {plan.icon && (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50/70 p-1.5 mb-4 flex items-center justify-center border border-emerald-100">
                      <img
                        src={plan.icon}
                        alt={plan.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Plan Name & Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-black text-slate-950 tracking-tight">{plan.name}</h3>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      plan.featured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {plan.tag}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 min-h-[40px] mb-6 leading-relaxed font-normal">
                    {plan.description}
                  </p>

                  {/* Price Box */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
                        ${price.toLocaleString()}
                      </span>
                      <span className="text-slate-500 text-sm font-semibold">/ month</span>
                    </div>

                    {billingCycle === 'yearly' ? (
                      <p className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#22C55E]" />
                        <span>${plan.yearlyTotal.toLocaleString()} billed annually (You save ${plan.yearlySavings.toLocaleString()}/yr)</span>
                      </p>
                    ) : billingCycle === 'quarterly' ? (
                      <p className="text-xs text-emerald-700 font-semibold mt-1.5">
                        ${plan.quarterlyTotal.toLocaleString()} billed quarterly (You save ${plan.quarterlySavings})
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">
                        Billed month-to-month. Pause or cancel anytime.
                      </p>
                    )}
                  </div>

                  {/* Turnaround Pill */}
                  <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-800 font-semibold">
                    <Clock className="w-4 h-4 text-[#22C55E] shrink-0" />
                    <span>{plan.turnaround}</span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8 text-xs sm:text-sm text-slate-700">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 text-[#22C55E] border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Actions */}
                <div className="space-y-2.5 pt-4">
                  <button
                    onClick={handlePlanGetStarted}
                    className={`w-full py-3.5 rounded-full font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                      plan.featured
                        ? 'bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 shadow-lg shadow-[#22C55E]/30 hover:scale-[1.02]'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300/80 font-bold'
                    }`}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handlePlanGetStarted}
                    className="w-full py-2.5 rounded-full text-xs text-slate-500 hover:text-[#16a34a] font-semibold transition-colors cursor-pointer"
                  >
                    Book a consultation call
                  </button>
                </div>

              </div>
            );
          })}
        </motion.div>

        {/* Dedicated Yearly Enterprise & Retainer Section - Styled in signature FEVIQO deep forest green */}
        <div className="mt-8 bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-emerald-500/40 rounded-[32px] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 text-[#22C55E] border border-emerald-500/50 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Annual Studio Retainers & Custom Volumes</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Scale for the entire year with a <span className="text-[#22C55E]">Dedicated Video Pod</span>
              </h3>
              <p className="text-sm text-emerald-100/90 leading-relaxed">
                Save across all tiers when committing annually (equivalent to 1 full month free). Receive a retained Senior Creative Director, lock your monthly editing rates for 12 months, and get priority holiday & Q4 production fast-tracking with zero queue delays.
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
                  <span>Custom Invoicing & ACH</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => {
                  setBillingCycle('yearly');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
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

        {/* $89 Trial Video Banner (Apple-styled Clean Card) */}
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
      </section>

      {/* 
        ==================================================
        3 HIGH-AUTHORITY TESTIMONIALS (For Reliability & Trust)
        Open, Apple-grade editorial presentation with zero generic boxes
        ==================================================
      */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Star className="w-3.5 h-3.5 text-[#22C55E] fill-current" />
            <span>Proven Reliability &amp; ROI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
            Loved by leading creators, founders &amp; agency teams.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 font-normal">
            Real partners who replaced hiring headaches with FEVIQO's dedicated editing pods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 text-left">
          {/* Testimonial 1 */}
          <div className="space-y-4 pt-6 border-t-2 border-[#22C55E]">
            <div className="flex items-center gap-1 text-[#22C55E]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-base sm:text-lg font-bold text-slate-950 leading-relaxed">
              "FEVIQO completely eliminated the biggest bottleneck in my creator business. Pacing is punchy, retention jumped by 38%, and I never miss an upload."
            </blockquote>
            <div className="flex items-center gap-3.5 pt-2">
              <img
                src="/images/avatars/alex-tubio.webp"
                alt="Alex Tubio"
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <div className="font-extrabold text-sm text-slate-950">Alex Tubio</div>
                <div className="text-xs text-slate-500 font-medium">Creator &amp; Educator &bull; 450K+ Subs</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="space-y-4 pt-6 border-t-2 border-[#22C55E]">
            <div className="flex items-center gap-1 text-[#22C55E]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-base sm:text-lg font-bold text-slate-950 leading-relaxed">
              "We closed three $20,000 enterprise contracts from a single video ad FEVIQO cut for us. That is a 20x return on our subscription in the first 45 days."
            </blockquote>
            <div className="flex items-center gap-3.5 pt-2">
              <img
                src="/images/avatars/patrick-anghel.webp"
                alt="Patrick Anghel"
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <div className="font-extrabold text-sm text-slate-950">Patrick Anghel</div>
                <div className="text-xs text-slate-500 font-medium">Founder, Advisory Growth &bull; $60K Pipeline</div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="space-y-4 pt-6 border-t-2 border-[#22C55E]">
            <div className="flex items-center gap-1 text-[#22C55E]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-base sm:text-lg font-bold text-slate-950 leading-relaxed">
              "We fulfilled over 500 video projects with FEVIQO across 18 agency brand accounts without hiring a single full-time editor. Game-changing operational scale."
            </blockquote>
            <div className="flex items-center gap-3.5 pt-2">
              <img
                src="/images/avatars/danny-barrera.webp"
                alt="Danny Barrera"
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <div className="font-extrabold text-sm text-slate-950">Danny Barrera</div>
                <div className="text-xs text-slate-500 font-medium">CEO, Concrete Agency &bull; 500+ Videos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ==================================================
        HOW FEVIQO COMPARES (Appealing, Modern Matrix)
        Clean Apple-grade comparison table with clear winning accents
        ==================================================
      */}
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

        {/* Clean Apple Matrix Card */}
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
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
                        ? 'bg-emerald-50/60 font-bold text-slate-950 border-y-2 border-emerald-500/40' 
                        : 'hover:bg-slate-50/60 transition-colors'
                    }
                  >
                    <td className="py-4 px-4 sm:px-6 font-extrabold text-slate-950 flex items-center gap-3">
                      {item.isFeviqo ? (
                        <div className="w-7 h-7 rounded-lg bg-slate-950 p-1 flex items-center justify-center shrink-0 shadow-sm border border-emerald-500/40">
                          <img src={item.logo} alt="FEVIQO" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-slate-100 p-0.5 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                          <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <span>{item.name}</span>
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
        </div>
      </section>

      {/* Pricing FAQs Accordion */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 text-center mb-8 tracking-tight">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {pricingFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-sm sm:text-base font-bold text-slate-900 cursor-pointer hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-900 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Clean Bottom Callout in Brand Green */}
      <section className="py-20 bg-gradient-to-br from-[#064e3b] via-[#16a34a] to-[#052e16] text-white text-center px-4 sm:px-6 mt-16 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-[#22C55E]/30 blur-[130px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto space-y-5 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Ready to scale your videos with zero friction?
          </h2>
          <p className="text-base sm:text-lg text-emerald-50 font-medium max-w-2xl mx-auto">
            Book a quick 15-minute strategy consultation or test drive with an $89 trial edit today.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onBookCall()}
              className="px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider cursor-pointer transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              Schedule Strategy Call
            </button>
            <button
              onClick={onOpenFlow}
              className="px-8 py-4 rounded-full bg-[#032415]/80 hover:bg-[#032415] text-white font-bold text-sm sm:text-base cursor-pointer border border-emerald-400/40 transition-all backdrop-blur-md hover:scale-105 active:scale-95"
            >
              Open FEVIQO Flow
            </button>
          </div>
        </div>
      </section>

      {/* Footer in Brand Green */}
      <footer className="py-8 bg-[#032415] text-center text-xs text-emerald-200/80 border-t border-emerald-900/60">
        © 2026 FEVIQO. All rights reserved. Direct inquiries: partner@feviqo.com
      </footer>

    </div>
  );
};

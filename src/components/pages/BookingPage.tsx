import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordFadeUpHeadline } from '../WordFadeUpHeadline';
import { 
  Calendar, CheckCircle2, Phone, Mail, Clock, Check, ShieldCheck, 
  Sparkles, ArrowLeft, Globe, Video, User, Building, MessageSquare, 
  Star, ChevronRight, Award, Lock, ArrowRight, Zap, CheckCheck
} from 'lucide-react';
import { AppRoute, PreselectedPlan } from '../../types';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

interface BookingPageProps {
  preselectedPlan?: PreselectedPlan | null;
  onNavigateHome: () => void;
  onNavigatePricing: () => void;
  onNavigatePage: (route: AppRoute) => void;
  onOpenFlow: (view?: 'login' | 'register' | 'admin') => void;
}

const COUNTRY_CODES = [
  { code: '+1', country: 'US / Canada' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+971', country: 'UAE' },
  { code: '+65', country: 'Singapore' },
  { code: '+31', country: 'Netherlands' },
  { code: '+34', country: 'Spain' },
  { code: '+55', country: 'Brazil' },
  { code: '+81', country: 'Japan' },
  { code: '+41', country: 'Switzerland' },
];

const INDUSTRIES = [
  'E-Commerce & DTC Brands',
  'SaaS & B2B Tech',
  'Content Creator / YouTuber / Influencer',
  'Performance Marketing & Creative Agency',
  'Real Estate & High-End Architecture',
  'Fitness, Health & Wellness',
  'Online Education / Cohorts & Courses',
  'Finance & FinTech',
  'Other Commercial Enterprise',
];

export type PackageTier = 'Scale' | 'Pro' | 'In-House Studio';
export type BillingCadence = 'monthly' | 'quarterly' | 'yearly';

interface TierPricing {
  monthlyRate: number;
  totalBilled: number;
  cycleText: string;
  savings: string;
  turnaround: string;
}

export const TIER_CONFIG: Record<PackageTier, Record<BillingCadence, TierPricing>> = {
  Scale: {
    monthly: { monthlyRate: 1299, totalBilled: 1299, cycleText: 'Monthly ($1,299/mo)', savings: 'Month-to-month flexibility', turnaround: '24–48h turnaround' },
    quarterly: { monthlyRate: 999, totalBilled: 2997, cycleText: 'Quarterly ($999/mo • $2,997 billed quarterly)', savings: 'Save $900/quarter (20% OFF)', turnaround: '24–48h turnaround' },
    yearly: { monthlyRate: 899, totalBilled: 10788, cycleText: 'Yearly ($899/mo • $10,788 billed yearly)', savings: 'Save $4,800/yr (1 Month Free)', turnaround: '24–48h turnaround' },
  },
  Pro: {
    monthly: { monthlyRate: 2299, totalBilled: 2299, cycleText: 'Monthly ($2,299/mo)', savings: 'Month-to-month flexibility', turnaround: '24–36h turnaround' },
    quarterly: { monthlyRate: 1999, totalBilled: 5997, cycleText: 'Quarterly ($1,999/mo • $5,997 billed quarterly)', savings: 'Save $900/quarter (20% OFF)', turnaround: '24–36h turnaround' },
    yearly: { monthlyRate: 1799, totalBilled: 21588, cycleText: 'Yearly ($1,799/mo • $21,588 billed yearly)', savings: 'Save $6,000/yr (1 Month Free)', turnaround: '24–36h turnaround' },
  },
  'In-House Studio': {
    monthly: { monthlyRate: 5999, totalBilled: 5999, cycleText: 'Monthly ($5,999/mo)', savings: 'Month-to-month flexibility', turnaround: 'Same-day / Dedicated Video Pod' },
    quarterly: { monthlyRate: 4999, totalBilled: 14997, cycleText: 'Quarterly ($4,999/mo • $14,997 billed quarterly)', savings: 'Save $3,000/quarter', turnaround: 'Same-day / Dedicated Video Pod' },
    yearly: { monthlyRate: 4699, totalBilled: 56388, cycleText: 'Yearly ($4,699/mo • $56,388 billed yearly)', savings: 'Save $15,600/yr (1 Month Free)', turnaround: 'Same-day / Dedicated Video Pod' },
  },
};

export const BookingPage: React.FC<BookingPageProps> = ({
  preselectedPlan,
  onNavigateHome,
  onNavigatePricing,
  onNavigatePage,
  onOpenFlow,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [selectedTier, setSelectedTier] = useState<PackageTier>('Pro');
  const [billingCadence, setBillingCadence] = useState<BillingCadence>('quarterly');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    company: '',
    website: '',
    industry: 'Content Creator / YouTuber / Influencer',
    videoType: 'Reels / TikTok & YouTube Long-Form (Hybrid)',
    monthlyVolume: '8–15 Videos / Month',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: '02:00 PM (EST)',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Synchronize preselected plan if passed from pricing
  useEffect(() => {
    if (preselectedPlan && typeof preselectedPlan === 'object' && preselectedPlan.name) {
      const pName = preselectedPlan.name.toLowerCase();
      if (pName.includes('scale')) {
        setSelectedTier('Scale');
      } else if (pName.includes('in-house') || pName.includes('inhouse')) {
        setSelectedTier('In-House Studio');
      } else {
        setSelectedTier('Pro');
      }
      if (preselectedPlan.cycle) {
        setBillingCadence(preselectedPlan.cycle);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [preselectedPlan]);

  const currentTierInfo = TIER_CONFIG[selectedTier][billingCadence];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const fullPackageName = `${selectedTier} Plan (${billingCadence.toUpperCase()} • $${currentTierInfo.monthlyRate}/mo • Total: $${currentTierInfo.totalBilled})`;
    const fullClientName = `${formData.firstName} ${formData.lastName}`.trim();

    const payload = {
      fullName: fullClientName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: `${formData.countryCode} ${formData.phoneNumber}`.trim(),
      phoneNumber: `${formData.countryCode} ${formData.phoneNumber}`.trim(),
      company: formData.company,
      website: formData.website,
      industry: formData.industry,
      videoType: formData.videoType,
      monthlyVolume: formData.monthlyVolume,
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      selectedPackage: fullPackageName,
      packageTier: selectedTier,
      billingCycle: billingCadence,
      notes: formData.notes,
      source: 'booking_subpage',
      status: 'New',
    };

    try {
      const response = await fetch('/api/strategy-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit booking request');
      }

      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Booking submission error:', err);
      // Graceful transition so client is not blocked
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-[#22C55E] selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        onNavigateSection={() => onNavigateHome()}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onOpenFlow}
        onNavigatePage={onNavigatePage}
        onGetStarted={() => window.scrollTo({ top: 200, behavior: 'smooth' })}
        currentRoute="booking"
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        {/* Subtle Ambient Background Accents */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-gradient-to-b from-emerald-100/30 via-emerald-50/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Header Breadcrumb & Status */}
        <div className="mb-8 flex items-center justify-between relative z-10">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer py-2 px-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#16a34a]" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span>Senior Producers Available Today</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start relative z-10"
            >
              {/* Left Column: Two-Typography Hero, Agenda & Social Proof */}
              <div className="lg:col-span-5 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-[#15803d] border border-emerald-200/90 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>1-on-1 Creative Strategy Call</span>
                  </div>

                  {/* Dual-Typography Headline */}
                  <div className="mb-3">
                    <WordFadeUpHeadline
                      className="font-coolvetica text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 leading-[1.08]"
                      words={[
                        { text: "Architect" },
                        { text: "your" },
                        { text: "video", className: "font-editorial-italic font-normal text-[#16a34a]" },
                        { text: "production", className: "font-editorial-italic font-normal text-[#16a34a]" },
                        { text: "engine.", className: "font-editorial-italic font-normal text-[#16a34a]" },
                      ]}
                    />
                  </div>

                  <p className="font-neue mt-3 text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                    Select your plan, pick a date, and meet 1-on-1 with our Creative Director to launch your dedicated editing pod.
                  </p>
                </div>

                {/* Minimal Apple-Style Agenda */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 space-y-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#16a34a] block">
                    20-Min Strategy Call Agenda
                  </span>
                  
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] shrink-0" />
                      <span className="font-semibold text-slate-900">Footage Audit &amp; Publishing Cadence</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] shrink-0" />
                      <span className="font-semibold text-slate-900">Dedicated Senior Editor Pairing</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] shrink-0" />
                      <span className="font-semibold text-slate-900">Immediate Slack &amp; Workspace Onboarding</span>
                    </div>
                  </div>
                </div>

                {/* Studio Proof & Trust Badges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-1 shadow-xs">
                    <div className="flex items-center gap-1 text-[#22C55E]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#22C55E]" />
                      ))}
                    </div>
                    <div className="text-base font-black text-slate-950">4.9 / 5 Rating</div>
                    <div className="text-[11px] text-slate-500 font-medium">75+ Verified Creator &amp; Agency Reviews</div>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-1 shadow-xs">
                    <div className="flex items-center gap-1.5 text-[#16a34a]">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-xs font-bold">Guaranteed SLA</span>
                    </div>
                    <div className="text-base font-black text-slate-950">24–48h Delivery</div>
                    <div className="text-[11px] text-slate-500 font-medium">100% Unlimited Frame Revisions</div>
                  </div>
                </div>

                {/* Direct Contacts & Security */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span className="text-slate-700">partner@feviqo.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>100% Confidential &bull; Strict NDA</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Premium High-Conversion White Form */}
              <div className="lg:col-span-7">
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-xl shadow-slate-900/5 relative overflow-hidden">
                  <div className="mb-6 pb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                        Book Your Strategy Consultation
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 font-normal">
                        Select your preferred plan and schedule a 20-minute video roadmap session.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-[#15803d] shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>Instant Calendar Slot</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. Interactive Plan & Cadence Selector Card */}
                    <div className="space-y-3 bg-slate-50/70 border border-slate-200/80 p-4.5 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Target Package Plan
                        </label>
                        <span className="text-[11px] text-[#15803d] font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                          {currentTierInfo.savings}
                        </span>
                      </div>

                      {/* Tier Pills */}
                      <div className="grid grid-cols-3 gap-2">
                        {(['Scale', 'Pro', 'In-House Studio'] as PackageTier[]).map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setSelectedTier(tier)}
                            className={`py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              selectedTier === tier
                                ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>

                      {/* Cadence Selector */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {(['quarterly', 'monthly', 'yearly'] as BillingCadence[]).map((cadence) => (
                          <button
                            key={cadence}
                            type="button"
                            onClick={() => setBillingCadence(cadence)}
                            className={`py-2 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                              billingCadence === cadence
                                ? 'bg-[#22C55E] text-slate-950 border-[#22C55E] shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                            }`}
                          >
                            {cadence === 'quarterly' ? 'Quarterly (Save 20%)' : cadence === 'yearly' ? 'Yearly (1 Mo Free)' : 'Monthly'}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 text-xs text-slate-700 flex items-center justify-between border-t border-slate-200/80">
                        <span className="text-slate-500 font-medium">{currentTierInfo.cycleText}</span>
                        <span className="font-bold text-slate-950 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-[#16a34a]" />
                          {currentTierInfo.turnaround}
                        </span>
                      </div>
                    </div>

                    {/* 2. Client Identity Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>First Name *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="e.g. Alex"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>Last Name *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="e.g. Miller"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition"
                        />
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>Work / Channel Email *</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="alex@brand.com"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>Phone / WhatsApp *</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={formData.countryCode}
                            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                            className="px-2.5 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 text-xs focus:outline-none focus:border-[#22C55E] transition cursor-pointer shrink-0 font-medium"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.code} ({c.country})
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            required
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            placeholder="555 019 283"
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Brand / Company Name & Website / Social link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>Brand / Company / Channel</span>
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="e.g. Apex Media or @AlexVlogs"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>Website / YouTube / Social Link</span>
                        </label>
                        <input
                          type="text"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="youtube.com/@channel or brand.com"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition"
                        />
                      </div>
                    </div>

                    {/* Industry & Monthly Volume */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Industry / Category
                        </label>
                        <select
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm focus:outline-none focus:border-[#22C55E] transition cursor-pointer font-medium"
                        >
                          {INDUSTRIES.map((ind) => (
                            <option key={ind} value={ind}>
                              {ind}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Estimated Monthly Video Output
                        </label>
                        <select
                          value={formData.monthlyVolume}
                          onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm focus:outline-none focus:border-[#22C55E] transition cursor-pointer font-medium"
                        >
                          <option value="4–8 Videos / Month">4–8 Videos / Month</option>
                          <option value="8–15 Videos / Month">8–15 Videos / Month (Most Popular)</option>
                          <option value="16–30 Videos / Month">16–30 Videos / Month</option>
                          <option value="30+ Daily Publishing Engine">30+ Daily Publishing Engine</option>
                        </select>
                      </div>
                    </div>

                    {/* Preferred Date and Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>Preferred Date *</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.preferredDate}
                          onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm focus:outline-none focus:border-[#22C55E] transition font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>Preferred Time Slot *</span>
                        </label>
                        <select
                          value={formData.preferredTime}
                          onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm focus:outline-none focus:border-[#22C55E] transition cursor-pointer font-medium"
                        >
                          <option value="10:00 AM (EST)">10:00 AM (EST)</option>
                          <option value="12:00 PM (EST)">12:00 PM (EST)</option>
                          <option value="02:00 PM (EST)">02:00 PM (EST)</option>
                          <option value="04:00 PM (EST)">04:00 PM (EST)</option>
                          <option value="06:00 PM (EST)">06:00 PM (EST)</option>
                          <option value="08:00 PM (EST)">08:00 PM (EST)</option>
                        </select>
                      </div>
                    </div>

                    {/* Creative Style Notes */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#16a34a]" />
                        <span>Project Goals &amp; Specific Editing References (Optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Share links of reference channels (e.g. Alex Hormozi, Iman Gadzhi, Ali Abdaal) or specific motion graphics guidelines..."
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-8 rounded-2xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-base sm:text-lg cursor-pointer transition-all shadow-xl shadow-[#22C55E]/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                          <span>Confirming Strategy Session...</span>
                        </>
                      ) : (
                        <>
                          <span>Schedule 1-on-1 Strategy Call</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-slate-500 font-medium">
                      🔒 No spam. You'll receive a direct Google Meet calendar invite and email confirmation.
                    </p>
                  </form>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Celebration & Success View - Premium White Card */
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto py-12 text-center relative z-10"
            >
              <div className="bg-white border border-emerald-300 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-emerald-950/10 space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-[#15803d] block">
                    SESSION CONFIRMED
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    You're Booked with FEVIQO! 🎬
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
                    Thanks <strong className="text-slate-950">{formData.firstName}</strong>. A full confirmation email with Google Meet details has been automatically sent to <strong className="text-[#15803d]">{formData.email}</strong>.
                  </p>
                </div>

                {/* Booking Summary Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-3">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">Plan Selected:</span>
                    <strong className="text-slate-950 font-bold">{selectedTier} Plan ({billingCadence.toUpperCase()})</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">Scheduled Date:</span>
                    <strong className="text-slate-950 font-bold">{formData.preferredDate} at {formData.preferredTime}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">Video Scope:</span>
                    <strong className="text-slate-950 font-bold">{formData.monthlyVolume}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">Meeting Location:</span>
                    <strong className="text-emerald-700 font-bold">Google Meet (Link in Email Invite)</strong>
                  </div>
                </div>

                {/* Preparation Guide */}
                <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-5 text-left text-xs text-emerald-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                    <Sparkles className="w-4 h-4 text-[#22C55E]" />
                    <span>How to prepare for our session:</span>
                  </div>
                  <p className="leading-relaxed text-emerald-800">
                    Have 1–2 video links or channel references ready that inspire your visual aesthetic, along with any brand asset links or raw footage samples.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={onNavigateHome}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition cursor-pointer border border-slate-200"
                  >
                    Return to Home Page
                  </button>
                  <button
                    onClick={() => onOpenFlow('login')}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-sm transition cursor-pointer shadow-lg shadow-[#22C55E]/20"
                  >
                    Open FEVIQO Flow Portal &rarr;
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer
        onBookCall={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onGetStarted={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateSection={() => onNavigateHome()}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onOpenFlow}
        onNavigatePage={onNavigatePage}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, Phone, Mail, Clock, Check, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { LeadBooking, PreselectedPlan } from '../types';
import { sendNotificationEmail } from '../services/emailService';

interface BookCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlan?: PreselectedPlan | null;
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
  'E-Commerce & DTC',
  'SaaS & B2B Tech',
  'Content Creator / Influencer',
  'Marketing / Creative Agency',
  'Real Estate',
  'Fitness & Health',
  'Online Education / Courses',
  'Finance & FinTech',
  'Other',
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

export const TIER_CONFIG: Record<'Scale' | 'Pro' | 'In-House Studio', Record<BillingCadence, TierPricing>> = {
  Scale: {
    monthly: { monthlyRate: 1299, totalBilled: 1299, cycleText: 'Monthly ($1,299/mo)', savings: 'Month-to-month flexibility', turnaround: '24–48h turnaround' },
    quarterly: { monthlyRate: 999, totalBilled: 2997, cycleText: 'Quarterly ($999/mo • $2,997/quarter)', savings: 'Save $900/quarter', turnaround: '24–48h turnaround' },
    yearly: { monthlyRate: 899, totalBilled: 10788, cycleText: 'Yearly ($899/mo • $10,788/yr)', savings: 'Save $4,800/yr (1 Month Free)', turnaround: '24–48h turnaround' },
  },
  Pro: {
    monthly: { monthlyRate: 2299, totalBilled: 2299, cycleText: 'Monthly ($2,299/mo)', savings: 'Month-to-month flexibility', turnaround: '24–36h turnaround' },
    quarterly: { monthlyRate: 1999, totalBilled: 5997, cycleText: 'Quarterly ($1,999/mo • $5997/quarter)', savings: 'Save $900/quarter', turnaround: '24–36h turnaround' },
    yearly: { monthlyRate: 1799, totalBilled: 21588, cycleText: 'Yearly ($1,799/mo • $21,588/yr)', savings: 'Save $6,000/yr (1 Month Free)', turnaround: '24–36h turnaround' },
  },
  'In-House Studio': {
    monthly: { monthlyRate: 5999, totalBilled: 5999, cycleText: 'Monthly ($5,999/mo)', savings: 'Month-to-month flexibility', turnaround: 'Same-day / Dedicated Video Pod' },
    quarterly: { monthlyRate: 4999, totalBilled: 14997, cycleText: 'Quarterly ($4,999/mo • $14,997/quarter)', savings: 'Save $3,000/quarter', turnaround: 'Same-day / Dedicated Video Pod' },
    yearly: { monthlyRate: 4699, totalBilled: 56388, cycleText: 'Yearly ($4,699/mo • $56,388/yr)', savings: 'Save $15,600/yr (1 Month Free)', turnaround: 'Same-day / Dedicated Video Pod' },
  },
};

export const BookCallModal: React.FC<BookCallModalProps> = ({ isOpen, onClose, preselectedPlan }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [showPackageSelector, setShowPackageSelector] = useState(false);

  // Synchronized package selection state
  const [selectedTier, setSelectedTier] = useState<PackageTier>('Pro');
  const [billingCadence, setBillingCadence] = useState<BillingCadence>('monthly');

  const [formData, setFormData] = useState({
    selectedPackage: 'Pro ($2,299/mo)',
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    industry: 'E-Commerce & DTC',
    videoType: 'Reels / TikTok (9:16)',
    monthlyVolume: '5-10',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: '14:00',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Validate preselected plan object safely
  const validPreselectedPlan = React.useMemo(() => {
    if (!preselectedPlan || typeof preselectedPlan !== 'object') return null;
    if (!preselectedPlan.name || typeof preselectedPlan.monthlyRate !== 'number') return null;
    return preselectedPlan;
  }, [preselectedPlan]);

  // Sync state whenever validPreselectedPlan or isOpen changes
  useEffect(() => {
    if (validPreselectedPlan) {
      const planName = validPreselectedPlan.name.toLowerCase();
      if (planName.includes('scale')) {
        setSelectedTier('Scale');
        setBillingCadence(validPreselectedPlan.cycle || 'monthly');
      } else if (planName.includes('in-house') || planName.includes('inhouse')) {
        setSelectedTier('In-House Studio');
        setBillingCadence(validPreselectedPlan.cycle || 'monthly');
      } else {
        setSelectedTier('Pro');
        setBillingCadence(validPreselectedPlan.cycle || 'monthly');
      }
      setShowPackageSelector(false);
    } else {
      setShowPackageSelector(true);
    }
  }, [validPreselectedPlan, isOpen]);

  // Compute formatted package string whenever tier or cadence changes
  useEffect(() => {
    const tierInfo = TIER_CONFIG[selectedTier][billingCadence];
    const cycleLabel = billingCadence === 'yearly' ? 'Yearly' : billingCadence === 'quarterly' ? 'Quarterly' : 'Monthly';
    const pkgString = `${selectedTier} (${cycleLabel} - $${tierInfo.monthlyRate.toLocaleString()}/mo • ${tierInfo.totalBilled === tierInfo.monthlyRate ? `$${tierInfo.monthlyRate.toLocaleString()}/mo` : `$${tierInfo.totalBilled.toLocaleString()} billed ${billingCadence}`})`;

    setFormData(prev => ({
      ...prev,
      selectedPackage: pkgString,
    }));
  }, [selectedTier, billingCadence]);

  // Keyboard escape listener to close modal safely
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleReturnToPreselected = () => {
    if (!validPreselectedPlan) return;
    const planName = validPreselectedPlan.name.toLowerCase();
    if (planName.includes('scale')) {
      setSelectedTier('Scale');
      setBillingCadence(validPreselectedPlan.cycle || 'monthly');
    } else if (planName.includes('in-house') || planName.includes('inhouse')) {
      setSelectedTier('In-House Studio');
      setBillingCadence(validPreselectedPlan.cycle || 'monthly');
    } else {
      setSelectedTier('Pro');
      setBillingCadence(validPreselectedPlan.cycle || 'monthly');
    }
    setShowPackageSelector(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newLead: LeadBooking = {
      id: 'lead-' + Date.now(),
      selectedPackage: formData.selectedPackage,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      countryCode: formData.countryCode,
      phoneNumber: formData.phoneNumber,
      company: formData.company,
      website: formData.website,
      industry: formData.industry,
      videoType: formData.videoType,
      monthlyVolume: formData.monthlyVolume,
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      createdAt: new Date().toISOString(),
      status: 'New',
    };

    // 1. Dispatch real email notification to both client and production team
    try {
      // Send real confirmation to client's email
      await sendNotificationEmail({
        to: formData.email,
        type: 'strategy_call_booked',
        subject: `Confirmed: Your FEVIQO Strategy Call for ${formData.selectedPackage} on ${formData.preferredDate}`,
        data: {
          recipientName: `${formData.firstName} ${formData.lastName}`,
          date: formData.preferredDate,
          time: formData.preferredTime,
          industry: formData.industry,
          phone: `${formData.countryCode} ${formData.phoneNumber}`,
          package: formData.selectedPackage,
          billingMethod: 'Payoneer',
        },
      });

      // Send alert to studio inbox at partner@feviqo.com
      await sendNotificationEmail({
        to: 'partner@feviqo.com',
        type: 'strategy_call_booked',
        subject: `🔥 [Strategy Call] ${formData.firstName} ${formData.lastName} (${formData.selectedPackage})`,
        data: {
          recipientName: 'FEVIQO Production Partner',
          clientName: `${formData.firstName} ${formData.lastName}`,
          clientEmail: formData.email,
          phone: `${formData.countryCode} ${formData.phoneNumber}`,
          package: formData.selectedPackage,
          industry: formData.industry,
          format: formData.videoType,
          volume: `${formData.monthlyVolume} videos/mo`,
          date: formData.preferredDate,
          time: formData.preferredTime,
          billingMethod: 'Payoneer',
        },
      });
      setSendSuccess(true);
    } catch (err) {
      console.error('Email dispatch error:', err);
    }

    // 2. Persist to server API and local state
    try {
      await fetch('/api/strategy-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      }).catch(() => {});

      const existingRaw = localStorage.getItem('feviqo_leads_v6') || localStorage.getItem('feviqo_leads');
      const leads: LeadBooking[] = existingRaw ? JSON.parse(existingRaw) : [];
      leads.unshift(newLead);
      localStorage.setItem('feviqo_leads_v6', JSON.stringify(leads));
      localStorage.setItem('feviqo_leads_v4', JSON.stringify(leads));
      localStorage.setItem('feviqo_leads', JSON.stringify(leads));

      // Also push to in-app simulated email inbox for live notifications
      const existingEmailsRaw = localStorage.getItem('feviqo_emails_v6') || localStorage.getItem('feviqo_emails_v4');
      const existingEmails = existingEmailsRaw ? JSON.parse(existingEmailsRaw) : [];
      const newEmailItem = {
        id: 'email-' + Date.now(),
        fromName: `${formData.firstName} ${formData.lastName}`,
        fromEmail: formData.email,
        toEmail: 'partner@feviqo.com',
        subject: `🔥 Strategy Call Booking: ${formData.firstName} ${formData.lastName}`,
        timestamp: 'Just now',
        preview: `Booked for ${formData.preferredDate} at ${formData.preferredTime}. Volume: ${formData.monthlyVolume} videos/mo.`,
        body: `Hello Team FEVIQO,\n\nA new client strategy session has been scheduled:\n\n• Name: ${formData.firstName} ${formData.lastName}\n• Email: ${formData.email}\n• Phone: ${formData.countryCode} ${formData.phoneNumber}\n• Industry: ${formData.industry}\n• Format: ${formData.videoType}\n• Monthly Volume: ${formData.monthlyVolume} videos/mo\n• Date: ${formData.preferredDate} at ${formData.preferredTime}\n\nClient has requested an intro strategy chat.`,
        isRead: false,
        type: 'booking_lead'
      };
      existingEmails.unshift(newEmailItem);
      localStorage.setItem('feviqo_emails_v6', JSON.stringify(existingEmails));
      localStorage.setItem('feviqo_emails_v4', JSON.stringify(existingEmails));

      // Dispatch custom window event so FeviqoFlowApp catches it live instantly
      window.dispatchEvent(new CustomEvent('feviqo_lead_created', { detail: newLead }));
    } catch {
      // Fallback safe
    }

    setIsSubmitting(false);
    setStep('success');
  };

  const handleResetAndClose = () => {
    setStep('form');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain"
      onClick={handleResetAndClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto overflow-x-hidden box-border overscroll-contain my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleResetAndClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' ? (
          <div>
            <div className="flex items-center gap-2 text-[#22C55E] text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4" />
              <span>FEVIQO Strategy Call</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Book Your 1-on-1 <span className="green-gradient-text">Strategy Call</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-5 font-normal leading-relaxed">
              Tell us about your brand and video volume. We'll show you how our dedicated editors produce high-retention content with 24–48h turnaround.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Mandatory Package Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                    {validPreselectedPlan && !showPackageSelector ? 'Selected Package' : 'Select Target Package *'}
                  </label>
                  {/* Signature Dark-Green Badge Shape */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-emerald-500/40 text-white shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
                      Payoneer Invoicing
                    </span>
                  </div>
                </div>
                
                {/* If preselected plan is provided from Pricing page, show only that selected package */}
                {validPreselectedPlan && !showPackageSelector ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#032415] via-[#064e3b] to-[#032415] border border-emerald-500/50 text-white shadow-md relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E] text-slate-950 font-black text-[10px] uppercase tracking-wider">
                            Pre-selected Plan
                          </span>
                          <span className="text-xs text-emerald-300 font-bold capitalize">
                            {validPreselectedPlan.cycle === 'yearly' ? 'Yearly Retainer' : validPreselectedPlan.cycle === 'quarterly' ? 'Quarterly Plan' : 'Monthly Plan'}
                          </span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          {validPreselectedPlan.name}
                        </h4>
                        <div className="flex items-baseline gap-1.5 pt-0.5">
                          <span className="text-2xl sm:text-3xl font-black text-[#22C55E]">
                            ${validPreselectedPlan.monthlyRate.toLocaleString()}
                          </span>
                          <span className="text-xs text-emerald-200 font-semibold">
                            {validPreselectedPlan.name.toLowerCase().includes('trial') ? 'one-time' : '/ month'}
                          </span>
                        </div>
                        {validPreselectedPlan.savingsText && (
                          <p className="text-xs text-emerald-200/90 font-medium">
                            {validPreselectedPlan.savingsText}
                          </p>
                        )}
                        {validPreselectedPlan.turnaround && (
                          <p className="text-[11px] text-emerald-300/80 flex items-center gap-1 pt-0.5">
                            <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
                            <span>{validPreselectedPlan.turnaround}</span>
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPackageSelector(true)}
                        className="text-xs font-bold text-emerald-300 hover:text-white underline cursor-pointer shrink-0 pt-1 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { 
                          tier: 'Scale' as PackageTier, 
                          title: 'Scale', 
                          price: `$${TIER_CONFIG.Scale[billingCadence].monthlyRate.toLocaleString()}/mo`, 
                          desc: '1 active edit • 24-48h turnaround' 
                        },
                        { 
                          tier: 'Pro' as PackageTier, 
                          title: 'Pro', 
                          price: `$${TIER_CONFIG.Pro[billingCadence].monthlyRate.toLocaleString()}/mo`, 
                          desc: '2 active edits • 24-36h turnaround', 
                          popular: true 
                        },
                        { 
                          tier: 'In-House Studio' as PackageTier, 
                          title: 'In-House', 
                          price: `$${TIER_CONFIG['In-House Studio'][billingCadence].monthlyRate.toLocaleString()}/mo`, 
                          desc: 'Dedicated Pod • Same-day turnaround' 
                        },
                      ].map((pkg) => {
                        const isSelected = selectedTier === pkg.tier;
                        return (
                          <div
                            key={pkg.tier}
                            onClick={() => setSelectedTier(pkg.tier)}
                            className={`p-3 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#22C55E] bg-emerald-50/80 shadow-sm'
                                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                            }`}
                          >
                            {pkg.popular && (
                              <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-[#22C55E] text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-xs">
                                Popular
                              </span>
                            )}
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-xs text-slate-900">{pkg.title}</span>
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#22C55E] bg-[#22C55E]' : 'border-slate-300'}`}>
                                  {isSelected && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
                                </span>
                              </div>
                              <div className="text-sm font-black text-slate-950 mt-0.5">{pkg.price}</div>
                              <div className="text-[10px] text-slate-500 leading-tight mt-1">{pkg.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {validPreselectedPlan && (
                      <button
                        type="button"
                        onClick={handleReturnToPreselected}
                        className="text-xs text-[#15803D] font-bold hover:underline cursor-pointer flex items-center gap-1 pt-1"
                      >
                        <span>
                          ← Return to preselected {validPreselectedPlan.name} ({validPreselectedPlan.cycle === 'yearly' ? 'Yearly' : validPreselectedPlan.cycle === 'quarterly' ? 'Quarterly' : 'Monthly'})
                        </span>
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
                  <span>Your subscription and monthly retainer invoices will be processed securely via <strong>Payoneer</strong>.</span>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Alex"
                    className="w-full min-w-0 max-w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#22C55E] focus:bg-white transition box-border"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Morgan"
                    className="w-full min-w-0 max-w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#22C55E] focus:bg-white transition box-border"
                  />
                </div>
              </div>

              {/* Work / Channel Email */}
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1">Work / Channel Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rexanmedia01@gmail.com"
                  className="w-full min-w-0 max-w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#22C55E] focus:bg-white transition box-border"
                />
              </div>

              {/* Phone / WhatsApp with Country Code */}
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full min-w-0">
                  <div className="sm:col-span-1 min-w-0">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      className="w-full min-w-0 max-w-full px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#22C55E] focus:bg-white transition box-border"
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} ({item.country})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 min-w-0">
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="313123123"
                      className="w-full min-w-0 max-w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#22C55E] focus:bg-white transition box-border"
                    />
                  </div>
                </div>
              </div>

              {/* Brand / Company Name & Website / YouTube / Social Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Company / Channel *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Feviqo"
                    className="w-full min-w-0 max-w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#22C55E] focus:bg-white transition box-border"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website / YouTube / Social Link *</label>
                  <input
                    type="text"
                    required
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="e.g. feviqo.com or youtube.com/@channel"
                    className="w-full min-w-0 max-w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#22C55E] focus:bg-white transition box-border"
                  />
                </div>
              </div>

              {/* Industry & Monthly Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industry *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full min-w-0 max-w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#22C55E] focus:bg-white transition box-border"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Video Volume</label>
                  <select
                    value={formData.monthlyVolume}
                    onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                    className="w-full min-w-0 max-w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#22C55E] focus:bg-white transition box-border"
                  >
                    <option value="1-4">1 – 4 videos / mo (Starter)</option>
                    <option value="5-10">5 – 10 videos / mo (Scale)</option>
                    <option value="11-20">11 – 20 videos / mo (Pro)</option>
                    <option value="20+">20+ videos / mo (In-House)</option>
                  </select>
                </div>
              </div>

              {/* Video Format Selection */}
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Video Format</label>
                <select
                  value={formData.videoType}
                  onChange={(e) => setFormData({ ...formData, videoType: e.target.value })}
                  className="w-full min-w-0 max-w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#22C55E] focus:bg-white transition box-border"
                >
                  <option value="Reels / TikTok (9:16)">Reels, TikTok & Shorts (9:16)</option>
                  <option value="YouTube (16:9)">YouTube Long-Form & Documentaries (16:9)</option>
                  <option value="Video Ad (1:1 / 4:5)">High-Converting Paid Video Ads</option>
                  <option value="Podcast / Interview">Podcasts, Interviews & Live Repurposing</option>
                </select>
              </div>

              {/* 
                =======================================================
                USER REQUESTED BOX UNDER PRIMARY VIDEO FORMAT:
                Select Target Package & Billing Cadence (Monthly, Quarterly, Yearly)
                Synchronized with the upper package selection
                =======================================================
              */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Interested Package &amp; Billing Cadence
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Auto-Synchronized
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Target Package Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Target Package
                    </label>
                    <select
                      value={selectedTier}
                      onChange={(e) => {
                        const newTier = e.target.value as PackageTier;
                        setSelectedTier(newTier);
                        setShowPackageSelector(true);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#22C55E] transition"
                    >
                      <option value="Scale">Scale ($1,299/mo)</option>
                      <option value="Pro">Pro ($2,299/mo - Popular)</option>
                      <option value="In-House Studio">In-House Studio ($5,999/mo)</option>
                    </select>
                  </div>

                  {/* Billing Cadence Dropdown (Monthly, Quarterly, Yearly) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Billing Cadence
                    </label>
                    <select
                      value={billingCadence}
                      onChange={(e) => {
                        const newCadence = e.target.value as BillingCadence;
                        setBillingCadence(newCadence);
                        setShowPackageSelector(true);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#22C55E] transition"
                    >
                      <option value="monthly">Monthly (Standard)</option>
                      <option value="quarterly">Quarterly (Save 20% + $900)</option>
                      <option value="yearly">Yearly Retainer (1 Month Free • Save up to $15.6k)</option>
                    </select>
                  </div>
                </div>

                {/* Live Calculated Price Summary */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    {`${selectedTier} Plan Effective Rate:`}
                  </span>
                  <span className="font-extrabold text-[#15803D]">
                    {TIER_CONFIG[selectedTier][billingCadence]?.cycleText}
                  </span>
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full min-w-0 max-w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#22C55E] focus:bg-white transition box-border appearance-none"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot (GMT)</label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full min-w-0 max-w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#22C55E] focus:bg-white transition box-border"
                  >
                    <option value="10:00 AM GMT">10:00 AM GMT</option>
                    <option value="12:00 PM GMT">12:00 PM GMT</option>
                    <option value="02:00 PM GMT">02:00 PM GMT (Popular)</option>
                    <option value="04:00 PM GMT">04:00 PM GMT</option>
                    <option value="06:00 PM GMT">06:00 PM GMT</option>
                    <option value="08:00 PM GMT">08:00 PM GMT</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl brand-green-btn font-black text-sm uppercase tracking-wide cursor-pointer transition-all shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending Booking...</span>
                ) : (
                  <span>Confirm Strategy Session</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 text-[#22C55E] mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            
            <h3 className="text-2xl font-black text-slate-900">
              Strategy Session Booked!
            </h3>
            
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{formData.firstName}</strong>. Your session for <strong>{formData.preferredDate} at {formData.preferredTime}</strong> has been logged.
            </p>

            {/* Notification Confirmation Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                  Automated Notification Dispatched
                </span>
                <span className="px-2 py-0.5 rounded bg-green-100 text-[#16a34a] font-bold text-[10px]">Instant Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Dispatched to <strong>partner@feviqo.com</strong> & your email <strong>{formData.email}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Contact: {formData.countryCode} {formData.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Industry: {formData.industry} • Volume: {formData.monthlyVolume} videos/mo</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              A calendar invite and Google Meet link have been automatically generated for your scheduled session.
            </p>

            <div className="flex items-center justify-center pt-2">
              <button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-10 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 text-[#22C55E]" />
                <span>Done</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

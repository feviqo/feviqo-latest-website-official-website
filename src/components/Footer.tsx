import React, { useState } from 'react';
import { 
  Calendar, 
  MessageCircle, 
  Mail, 
  HelpCircle,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Gift,
  ArrowRight,
  Check,
  Copy
} from 'lucide-react';
import { FeviqoWordmark } from './FeviqoLogo';
import { AppRoute } from '../types';

interface FooterProps {
  onBookCall: () => void;
  onGetStarted: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigatePricing: () => void;
  onNavigateFlow: () => void;
  onNavigatePage?: (route: AppRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onBookCall, 
  onGetStarted, 
  onNavigateSection,
  onNavigatePricing,
  onNavigateFlow,
  onNavigatePage,
}) => {
  const [giftEmail, setGiftEmail] = useState('');
  const [giftClaimed, setGiftClaimed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [giftError, setGiftError] = useState('');

  const handleClaimGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(giftEmail)) {
      setGiftError('Please enter a valid email address.');
      return;
    }
    setGiftError('');
    setGiftClaimed(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FEVIQO200');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const nav = (route: AppRoute) => {
    if (onNavigatePage) {
      onNavigatePage(route);
    } else {
      onNavigatePricing();
    }
  };

  return (
    <footer id="website-footer" className="bg-[#05281a] text-white pt-20 pb-12 relative overflow-hidden border-t border-emerald-900/60">
      {/* Radiant ambient glow on green */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[400px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-teal-400/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Top CTA Row: "Get Your Videos Edited" */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-14 border-b border-emerald-900/80">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Get Your Videos Edited
            </h2>
            <p className="text-emerald-200/80 text-sm sm:text-base font-medium">
              Unlimited Requests • Dedicated Video Editor • Fast 48h Turnaround.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-black text-lg shadow-xl shadow-black/20 cursor-pointer hover:scale-[1.02] transition-all"
            >
              Start NOW!
            </button>
            <button
              onClick={onBookCall}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#08422b] hover:bg-[#0b5437] text-white font-bold text-base border border-emerald-500/40 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5 text-emerald-300" />
              <span>Talk to us</span>
            </button>
          </div>
        </div>

        {/* Special Promotion / Mystery Gift Block */}
        <div className="py-8 border-b border-emerald-900/80 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-1.5">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span>Special FEVIQO Promotion</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Want a mystery gift?
            </h3>
            <p className="text-sm text-emerald-200/80 mt-1 max-w-xl">
              Unlock an instant $200 exclusive voucher for your video editing subscription.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {!giftClaimed ? (
              <form onSubmit={handleClaimGift} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <input
                  type="email"
                  value={giftEmail}
                  onChange={(e) => { setGiftEmail(e.target.value); setGiftError(''); }}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3.5 rounded-full bg-emerald-950/60 border border-emerald-800/70 text-white placeholder-emerald-400/60 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                />
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full brand-green-btn font-extrabold text-sm cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-all shadow-md"
                >
                  <span>Claim</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center lg:items-end gap-1.5">
                <button
                  onClick={handleCopyCode}
                  className="px-5 py-3 rounded-full bg-emerald-950/80 border border-emerald-400/80 text-white font-mono text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg hover:bg-emerald-900 transition"
                  title="Click to copy coupon code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-emerald-300" />}
                  <span>Code: <strong className="text-white">FEVIQO200</strong></span>
                  <span className="text-[11px] font-sans font-normal text-emerald-200 ml-1">
                    ({copiedCode ? 'Copied!' : 'Click to copy'})
                  </span>
                </button>
                <div className="text-[11px] text-emerald-200/80 font-medium">
                  Applied to any dedicated video editor subscription!
                </div>
              </div>
            )}
            {giftError && (
              <p className="text-xs text-rose-300 mt-1.5 text-center lg:text-left">{giftError}</p>
            )}
          </div>
        </div>

        {/* Multi-Column Links Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pt-4">
          {/* Brand Wordmark & Social Links */}
          <div className="space-y-4">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigatePage ? onNavigatePage('home') : onNavigateSection('website-hero'); }}
              className="inline-block group"
              aria-label="FEVIQO Home"
            >
              <FeviqoWordmark theme="dark" className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90" />
            </a>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed font-normal max-w-sm">
              Unlimited professional video editing service for creators, businesses, and high-growth brands worldwide.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://facebook.com/feviqoofficial" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="FEVIQO Facebook"
                className="p-2 rounded-full bg-emerald-700/60 hover:bg-white hover:text-emerald-900 text-white transition"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com/feviqoofficial" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="FEVIQO Instagram"
                className="p-2 rounded-full bg-emerald-700/60 hover:bg-white hover:text-emerald-900 text-white transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com/company/feviqo" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="FEVIQO LinkedIn"
                className="p-2 rounded-full bg-emerald-700/60 hover:bg-white hover:text-emerald-900 text-white transition"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com/@feviqo" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="FEVIQO YouTube"
                className="p-2 rounded-full bg-emerald-700/60 hover:bg-white hover:text-emerald-900 text-white transition"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: Services */}
          <div>
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-4">
              Services & Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-100 font-normal">
              <li>
                <button onClick={() => nav('unlimited-editing')} className="hover:text-white transition cursor-pointer text-[#22C55E] font-bold">
                  Unlimited Video Editing
                </button>
              </li>
              <li>
                <button onClick={() => nav('platform')} className="hover:text-white transition cursor-pointer">
                  FEVIQO Flow Portal
                </button>
              </li>
              <li>
                <button onClick={() => nav('turkish-drama')} className="hover:text-white transition cursor-pointer text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span>Turkish TV Licensing (Pakistan)</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-400/20 text-[#DBFF4C] text-[9px] font-black">B2B</span>
                </button>
              </li>
              <li>
                <button onClick={() => nav('gallery')} className="hover:text-white transition cursor-pointer">
                  Video Gallery (Categories)
                </button>
              </li>
              <li>
                <button onClick={onNavigatePricing} className="hover:text-white transition cursor-pointer">
                  Pricing Plans ($1,299/mo)
                </button>
              </li>
              <li>
                <button onClick={onBookCall} className="hover:text-white transition cursor-pointer">
                  Schedule Strategy Call
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-4">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-100 font-normal">
              <li>
                <button onClick={() => nav('creators')} className="hover:text-white transition cursor-pointer">
                  For Content Creators
                </button>
              </li>
              <li>
                <button onClick={() => nav('business')} className="hover:text-white transition cursor-pointer">
                  For Business Owners
                </button>
              </li>
              <li>
                <button onClick={() => nav('agencies')} className="hover:text-white transition cursor-pointer">
                  For Marketers & Agencies
                </button>
              </li>
              <li>
                <button onClick={() => nav('case-studies')} className="hover:text-white transition cursor-pointer">
                  Case Studies & ROI
                </button>
              </li>
              <li>
                <button onClick={() => nav('testimonials')} className="hover:text-white transition cursor-pointer">
                  Testimonials & Reviews
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Support */}
          <div>
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-4">
              Resources & Help
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-emerald-100 font-normal">
              <li>
                <button 
                  onClick={onBookCall}
                  className="flex items-center gap-2 hover:text-white transition text-white font-bold cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
                  <span>Start Live Chat</span>
                </button>
              </li>
              <li>
                <a 
                  href="mailto:partner@feviqo.com"
                  className="flex items-center gap-2 hover:text-white transition"
                >
                  <Mail className="w-4 h-4 text-emerald-300" />
                  <span>partner@feviqo.com</span>
                </a>
              </li>
              <li>
                <div className="text-[11px] text-emerald-300/80 font-medium">
                  Average Response: &lt; 15 minutes
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 border-t border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/80 gap-4">
          <div>
            © 2026 FEVIQO Ltd. All rights reserved. Registered Creative Production Studio.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigateSection('faq')} className="hover:text-white transition cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => onNavigateSection('faq')} className="hover:text-white transition cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => onNavigateSection('faq')} className="hover:text-white transition cursor-pointer">
              Cookie Preferences
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WordFadeUpHeadline } from './WordFadeUpHeadline';
import { 
  Sparkles, Star, ChevronDown, ChevronUp
} from 'lucide-react';
import { Navbar } from './Navbar';
import { PricingMatrixSection } from './PricingMatrixSection';
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      a: "We don't edit music videos, wedding movies, or extensive 3D character animations. For voiceovers, we are happy to use your recorded audio or studio-grade AI voice generation.",
    },
    {
      q: 'Are revisions genuinely unlimited?',
      a: 'Yes. We continue refining every cut until you are completely satisfied. You can leave precise timestamped comments directly on the video player in FEVIQO Flow or chat live with your editor on Slack.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900 font-sans flex flex-col selection:bg-[#22C55E] selection:text-slate-950">
      
      {/* Global Navbar */}
      <Navbar 
        onBookCall={() => onBookCall()}
        onNavigateSection={onNavigateSection || onBackToHome}
        onNavigatePricing={onNavigatePricing || (() => {})}
        onNavigateFlow={onOpenFlow}
        onNavigatePage={onNavigatePage || ((route) => {
          if (route === 'home') onBackToHome();
        })}
      />

      {/* Hero Header */}
      <section className="pt-12 sm:pt-16 pb-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-5 text-emerald-900 shadow-xs">
          <Sparkles className="w-4 h-4 text-[#22C55E]" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Transparent Pricing &bull; Dedicated Video Pods
          </span>
        </div>
        <div className="mb-4 flex justify-center">
          <WordFadeUpHeadline
            className="font-coolvetica text-3xl sm:text-5xl md:text-6xl font-bold text-slate-950 tracking-tight leading-[1.08] justify-center"
            words={[
              { text: "Predictable" },
              { text: "flat" },
              { text: "pricing." },
              { text: "High-retention", className: "font-editorial-italic font-normal text-[#16a34a]" },
              { text: "video", className: "font-editorial-italic font-normal text-[#16a34a]" },
              { text: "production.", className: "font-editorial-italic font-normal text-[#16a34a]" },
            ]}
          />
        </div>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Scale your video pipeline with dedicated senior editors, rapid 24–48h turnarounds, and zero management overhead. Pause or cancel anytime.
        </p>
      </section>

      {/* Pricing Matrix Component (Cards, Billing Switcher, Compare Table, Retainer Banner, Trial Video) */}
      <PricingMatrixSection onBookCall={onBookCall} showCompetitorTable={true} />

      {/* 3 HIGH-AUTHORITY TESTIMONIALS */}
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
                <div className="text-xs text-slate-500 font-medium">YouTube Creator &amp; Strategist, Tubio Media</div>
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
                <div className="text-xs text-slate-500 font-medium">Creator &amp; Founder, Anghel Consulting</div>
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
                <div className="text-xs text-slate-500 font-medium">Agency Founder &amp; CEO, Concrete Agency</div>
              </div>
            </div>
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

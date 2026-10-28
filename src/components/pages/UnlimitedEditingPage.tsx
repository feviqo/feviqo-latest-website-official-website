import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { WordFadeUpHeadline } from '../WordFadeUpHeadline';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Clock, 
  RefreshCw, 
  Shield, 
  Film, 
  Layers, 
  Volume2, 
  VolumeX, 
  Play, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Calendar, 
  Star, 
  CheckCircle2, 
  X,
  Zap,
  Sliders
} from 'lucide-react';
import { Navbar } from '../Navbar';
import { StillHavingDoubtsBanner } from '../StillHavingDoubtsBanner';
import { HorizontalVideoShowcase } from '../HorizontalVideoShowcase';
import { PricingMatrixSection } from '../PricingMatrixSection';
import { AppRoute } from '../../types';
import { attachHlsStream } from '../../utils/hlsPlayer';

interface UnlimitedEditingPageProps {
  onBackToHome: () => void;
  onBookCall: (plan?: any) => void;
  onNavigatePricing: () => void;
  onOpenFlow: (view?: 'login' | 'register' | 'admin') => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigatePage?: (route: AppRoute) => void;
  onOpenVideo?: (id: string, title?: string, aspect?: '16/9' | '9/16') => void;
}

const SERVICE_CAPABILITIES = [
  {
    number: '01',
    name: 'YouTube Long-Form (16:9)',
    desc: 'Deep-dive masterclasses, podcasts, vlogs, and tutorials with narrative retention pacing and multi-cam synchronization.',
  },
  {
    number: '02',
    name: 'Short-Form Social (9:16)',
    desc: 'High-velocity vertical cutdowns for TikTok, Instagram Reels, and YouTube Shorts with kinetic animated typography and visual pattern interrupts.',
  },
  {
    number: '03',
    name: 'Paid Acquisition & Direct Response Ads',
    desc: 'High-converting performance ad creatives engineered with 3-second hook variations, problem-solution arcs, and conversion-tested end cards.',
  },
  {
    number: '04',
    name: 'Kinetic Motion Graphics & 2D FX',
    desc: 'Custom branded lower thirds, animated callout arrows, motion infographics, spotlight callouts, and bespoke title animations.',
  },
  {
    number: '05',
    name: 'Cinema Sound Design & Voice Mastering',
    desc: 'Vocal noise reduction, broadcast loudness mastering (-14 LUFS), spatial foley, risers, whooshes, and curated licensed music integration.',
  },
  {
    number: '06',
    name: 'Cinematic Color Grading',
    desc: 'Color conversion of flat LOG/RAW camera footage to vibrant, cinematic color spaces with consistent natural skin tones and rich contrast.',
  },
];

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: '1. Request',
    desc: 'Submit video orders directly into our dashboard. Upload raw 4K footage, multicam audio, and creative guidelines in bulk.',
  },
  {
    num: '02',
    title: '2. Edit & Review',
    desc: 'Your dedicated senior editor cuts, paces, color grades, and masters your video in 24–48 hours. Leave frame-accurate comments.',
  },
  {
    num: '03',
    title: '3. Download & Scale',
    desc: 'Receive master ProRes and social-ready exports with unlimited revisions until every cut is completely approved.',
  },
];

// Recent Horizontal Video Showcase Samples
const RECENT_HORIZONTAL_VIDEOS = [
  {
    id: 'hz-1',
    title: 'Modern Architecture Documentary',
    category: 'YouTube Long-Form',
    duration: '14:20',
    views: '420K views',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    videoSrc: 'https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8',
  },
  {
    id: 'hz-2',
    title: 'B2B SaaS Growth Engine Case Study',
    category: 'Brand Storytelling',
    duration: '08:45',
    views: '185K views',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    videoSrc: 'https://stream.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc.m3u8',
  },
  {
    id: 'hz-3',
    title: 'High-Ticket Agency Podcast Masterclass',
    category: 'Podcast Production',
    duration: '22:15',
    views: '630K views',
    thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
    videoSrc: 'https://stream.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc.m3u8',
  },
];

// Comparison Matrix Data
const COMPARISON_FEATURES = [
  { feature: 'Turnaround Time', scale: '24–48 Hours', pro: '24–36 Hours', inhouse: 'Same Day' },
  { feature: 'Concurrent Active Requests', scale: '1 Video at a time', pro: '2 Videos at a time', inhouse: 'Dedicated Full Pod' },
  { feature: 'Unlimited Revisions', scale: '✓ Included', pro: '✓ Included', inhouse: '✓ Included' },
  { feature: 'Licensed Stock & Sound FX', scale: '✓ Included', pro: '✓ Included', inhouse: '✓ Included' },
  { feature: 'Kinetic Motion Typography', scale: 'Standard', pro: 'Advanced Custom 2D', inhouse: 'Bespoke 2D/3D Motion' },
  { feature: 'Cinema RAW/LOG Grading', scale: 'Standard Rec.709', pro: 'Multi-Cam Match & LOG', inhouse: 'Master Color Suite' },
  { feature: 'Direct Slack / Flow Sync', scale: 'Flow Portal', pro: 'Slack + WhatsApp + Flow', inhouse: 'Dedicated Private Slack' },
  { feature: 'Dedicated Creative Director', scale: 'Weekly Review', pro: 'Dedicated Director', inhouse: 'Full Creative Team' },
];

export const UnlimitedEditingPage: React.FC<UnlimitedEditingPageProps> = ({
  onBackToHome,
  onBookCall,
  onNavigatePricing,
  onOpenFlow,
  onNavigateSection,
  onNavigatePage,
  onOpenVideo,
}) => {
  const [billingCycle, setBillingCycle] = useState<'quarterly' | 'monthly'>('quarterly');
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [isHeroMuted, setIsHeroMuted] = useState(true);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const vid = heroVideoRef.current;
    if (!vid) return;

    vid.muted = true;
    const cleanup = attachHlsStream(vid, 'https://stream.mux.com/hQglpqXvqnXLQq57m01p5dRGsGT3JQjUxJZX4sc02pfWs.m3u8', {
      autoPlay: true
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const toggleHeroSound = () => {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = !heroVideoRef.current.muted;
      setIsHeroMuted(heroVideoRef.current.muted);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0B0B0D] font-sans antialiased selection:bg-[#22C55E] selection:text-slate-950 flex flex-col">
      {/* Navigation */}
      <Navbar 
        onBookCall={() => onBookCall()}
        onNavigateSection={onNavigateSection || onBackToHome}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onOpenFlow}
        onNavigatePage={onNavigatePage || ((route) => {
          if (route === 'home') onBackToHome();
        })}
      />

      {/* 1. Hero Section - Split 2-Column Text Left / Video Right */}
      <section className="pt-10 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Two-Typography Headline & Value Props */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-6 text-emerald-900 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-emerald-800 uppercase">
                SERVICES &bull; UNLIMITED VIDEO EDITING
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
            <div className="mb-5">
              <WordFadeUpHeadline
                className="font-coolvetica text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B0B0D] leading-[1.06]"
                words={[
                  { text: "You" },
                  { text: "Shoot" },
                  { text: "the" },
                  { text: "Footage." },
                  { text: "We" },
                  { text: "Deliver", className: "font-editorial-italic font-normal text-[#16a34a]" },
                  { text: "Master", className: "font-editorial-italic font-normal text-[#16a34a]" },
                  { text: "Cuts.", className: "font-editorial-italic font-normal text-[#16a34a]" },
                ]}
              />
            </div>

              <p className="font-neue text-base sm:text-lg text-slate-600 max-w-xl mb-8 font-normal leading-relaxed">
                A dedicated senior editor and creative director integrated into your workflow. Submit unlimited requests, get fast 24–48h turnarounds, and publish consistently without managing freelancers.
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
              <button
                onClick={() => onBookCall()}
                className="px-9 py-4 rounded-xl sm:rounded-2xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-base shadow-lg shadow-[#22C55E]/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Started!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#pricing"
                className="px-7 py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 transition-colors cursor-pointer flex items-center justify-center text-center"
              >
                View Pricing &amp; Compare Plans
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                <span className="text-slate-800 font-bold">24–48h Turnaround</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                <span className="text-slate-800 font-bold">Unlimited Revisions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                <span className="text-slate-800 font-bold">Dedicated Pod</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Video Showcase */}
          <div className="lg:col-span-6">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-200/90 group">
              <button
                type="button"
                onClick={toggleHeroSound}
                className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-lg cursor-pointer transition"
              >
                {isHeroMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-300" />
                    <span>Click for sound</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-[#22C55E]">Sound On</span>
                  </>
                )}
              </button>

              <video
                ref={heroVideoRef}
                autoPlay
                muted={isHeroMuted}
                loop
                playsInline
                className="w-full h-full object-cover cursor-pointer"
                onClick={toggleHeroSound}
              />
            </div>
          </div>
        </div>

        {/* Feature Strip */}
        <div className="pt-14 mt-12 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block">Turnaround SLA</span>
            <div className="font-extrabold text-[#0B0B0D] text-2xl tracking-tight">24–48 Hours</div>
            <p className="text-xs text-slate-500 font-medium">Guaranteed production delivery</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block">Editing Team</span>
            <div className="font-extrabold text-[#0B0B0D] text-2xl tracking-tight">Dedicated Editor</div>
            <p className="text-xs text-slate-500 font-medium">Matched to your brand style</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block">Revisions</span>
            <div className="font-extrabold text-[#0B0B0D] text-2xl tracking-tight">Unlimited</div>
            <p className="text-xs text-slate-500 font-medium">Frame-accurate revisions</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block">Production Assets</span>
            <div className="font-extrabold text-[#0B0B0D] text-2xl tracking-tight">All Included</div>
            <p className="text-xs text-slate-500 font-medium">Licensed audio, SFX &amp; motion</p>
          </div>
        </div>
      </section>

      {/* 2. How It Works: 3 Steps */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full py-16 sm:py-24 border-t border-slate-100 text-left">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block mb-3">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0B0D] tracking-tight">
            Request, review, and scale your video production.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {WORKFLOW_STEPS.map((step) => (
            <div key={step.num} className="p-8 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-left space-y-3">
              <span className="text-xs font-bold text-[#16a34a] uppercase tracking-wider block">
                PHASE {step.num}
              </span>
              <h3 className="text-xl font-bold text-[#0B0B0D] tracking-tight">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Scope of Craft */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full py-16 sm:py-24 border-t border-slate-100 text-left">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block mb-3">
            SCOPE OF CRAFT
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0B0D] tracking-tight">
            Every format your brand requires.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {SERVICE_CAPABILITIES.map((item) => (
            <div key={item.number} className="border-t border-slate-200 pt-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {item.number}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#0B0B0D] tracking-tight">{item.name}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Recent Horizontal Video Showcase Grid */}
      <HorizontalVideoShowcase
        onOpenVideo={(src, title, aspect) => onOpenVideo?.(src, title, aspect)}
        title="Recent Master Video Productions"
        subtitle="Horizontal 16:9 cuts crafted by dedicated FEVIQO editors for brands & top YouTubers."
        tag="PORTFOLIO SHOWCASE"
      />

      {/* 4.5 Premium Apple-Grade Editorial Client Reviews */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-20 sm:py-28 border-t border-slate-100 text-left">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-xs font-mono font-semibold tracking-widest text-[#16a34a] uppercase block mb-3">
              VERIFIED PARTNER FEEDBACK
            </span>
            <h2 className="font-coolvetica text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0B0B0D] tracking-tight max-w-2xl leading-[1.04]">
              What creators &amp; brand leaders say about FEVIQO.
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-full shrink-0">
            <div className="flex items-center gap-1 text-[#22C55E]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#22C55E]" />
              ))}
            </div>
            <span className="font-coolvetica text-sm font-bold text-slate-900">4.9/5 Rating</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-600">75+ Verified Studios</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {/* Review 1 */}
          <div className="bg-white border-t-2 border-[#16a34a] pt-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-mono font-bold uppercase text-[#16a34a] tracking-wider">
                YOUTUBE LONG-FORM &bull; 4K PRODUCTION
              </div>
              <blockquote className="font-coolvetica text-xl sm:text-2xl font-bold text-[#0B0B0D] leading-snug tracking-tight">
                &ldquo;FEVIQO turned our YouTube channel around. Delivers 4K long-form edits in under 36 hours with zero hand-holding.&rdquo;
              </blockquote>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
              <img
                src="/images/avatars/lais-deleon.webp"
                alt="Lais DeLeon"
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div>
                <strong className="font-coolvetica text-base font-bold text-slate-950 block">Lais DeLeon</strong>
                <span className="text-xs text-slate-500 font-medium block">Fitness Brand Founder, Lais Fitness</span>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="bg-white border-t-2 border-[#16a34a] pt-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-mono font-bold uppercase text-[#16a34a] tracking-wider">
                AGENCY SLACK POD &bull; ELASTIC CAPACITY
              </div>
              <blockquote className="font-coolvetica text-xl sm:text-2xl font-bold text-[#0B0B0D] leading-snug tracking-tight">
                &ldquo;Having a dedicated video pod on Slack is like having an in-house studio at a fraction of the cost. Game changer for our agency.&rdquo;
              </blockquote>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
              <img
                src="/images/avatars/alex-tubio.webp"
                alt="Alex Tubio"
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div>
                <strong className="font-coolvetica text-base font-bold text-slate-950 block">Alex Tubio</strong>
                <span className="text-xs text-slate-500 font-medium block">YouTube Creator &amp; Strategist, Tubio Media</span>
              </div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="bg-white border-t-2 border-[#16a34a] pt-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-mono font-bold uppercase text-[#16a34a] tracking-wider">
                AUDIENCE RETENTION &bull; +42% AVD
              </div>
              <blockquote className="font-coolvetica text-xl sm:text-2xl font-bold text-[#0B0B0D] leading-snug tracking-tight">
                &ldquo;The retention pacing and motion graphics bumped our average view duration by 42%. They truly understand audience retention.&rdquo;
              </blockquote>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
              <img
                src="/images/avatars/patrick-anghel.webp"
                alt="Patrick Anghel"
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div>
                <strong className="font-coolvetica text-base font-bold text-slate-950 block">Patrick Anghel</strong>
                <span className="text-xs text-slate-500 font-medium block">Creator &amp; Founder, Anghel Consulting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        5. Exact Pricing Section (Scale, Pro, In-House Team)
        Matches competitor reference model with Compare Plans feature and exact PricingPage matrix
      */}
      <section id="pricing" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="max-w-3xl mx-auto mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a] block mb-3">
            FLEXIBLE RETAINER PRICING
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0B0B0D] tracking-tight mb-4">
            Simple, transparent video editing plans.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            No long-term contracts. Pause or cancel anytime. All plans include dedicated editors and unlimited revisions.
          </p>
        </div>

        <PricingMatrixSection 
          onBookCall={onBookCall} 
          showCompetitorTable={false}
          showRetainerAndTrialBanner={false}
          showCompareToggle={true}
        />
      </section>

      {/* 
        6. Competitor-Style "Still Having Doubts?" Support Banner
        Matches the uploaded screenshot design with laptop presenter graphic
      */}
      <StillHavingDoubtsBanner
        onScheduleCall={() => onBookCall()}
        onChoosePlan={() => {
          const el = document.getElementById('pricing');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
};

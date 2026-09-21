import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Share2, Paintbrush, Music, Layers, Users, Zap, ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { getWebsiteAssets, WebsiteAssets } from '../services/assetService';

interface WorkflowBenefit {
  title: string;
  description: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const LEFT_BENEFITS: WorkflowBenefit[] = [
  {
    tag: 'Phase 01 • Format & Reach',
    title: 'Social Media Video Editing',
    description: (
      <>
        From Instagram Reels and TikTok to YouTube Shorts, our editors craft high-retention cuts that maximize view duration and engagement.
      </>
    ),
    icon: Share2,
  },
  {
    tag: 'Phase 02 • Precision Style',
    title: 'Tailored Content for Your Brand',
    description: (
      <>
        Our video professionals align every cut, grade, typography, and pacing strictly with your brand aesthetic and visual identity.
      </>
    ),
    icon: Paintbrush,
  },
  {
    tag: 'Phase 03 • Complete Production',
    title: 'Music, Graphics, and SFX Included',
    description: (
      <>
        Enhance your content with fully licensed royalty-free music, motion graphics, and stock footage. Zero licensing headaches.
      </>
    ),
    icon: Music,
  },
];

const RIGHT_BENEFITS: WorkflowBenefit[] = [
  {
    tag: 'Phase 01 • Format Mastery',
    title: 'All-Form Video Editing',
    description: (
      <>
        Whether you need viral short-form clips (9:16) or high-production YouTube episodes (16:9), our editors deliver pixel-perfect cuts.
      </>
    ),
    icon: Layers,
  },
  {
    tag: 'Phase 02 • Dedicated Team',
    title: 'Dedicated Video Team at Your Service',
    description: (
      <>
        Collaborate directly with your assigned senior video editor and creative director, ensuring consistent quality across every upload.
      </>
    ),
    icon: Users,
  },
  {
    tag: 'Phase 03 • Fast Delivery',
    title: 'Streamlined 24–48h Turnaround',
    description: (
      <>
        Submit raw clips in FEVIQO Flow and get finished drafts back in 24–48 hours with zero friction and unlimited revisions.
      </>
    ),
    icon: Zap,
  },
];

const PHASE_IMAGES = [
  '/images/last test.png',
  '/images/1 Creative Decisions.png',
  '/images/2 Faster Turnaround.png',
];

const PHASES = [
  {
    idx: 0,
    title: 'Phase 01',
    subtitle: 'Format & Social Reach',
    summary: 'Mastering short-form (9:16) & long-form (16:9) video cuts.',
    image: '/images/last test.png',
  },
  {
    idx: 1,
    title: 'Phase 02',
    subtitle: 'Brand Style & Dedicated Lead',
    summary: 'Tailoring every cut to your aesthetic with your assigned editor.',
    image: '/images/1 Creative Decisions.png',
  },
  {
    idx: 2,
    title: 'Phase 03',
    subtitle: 'Sound FX & 24–48h Delivery',
    summary: 'Complete sound FX, motion design, and rapid sprint delivery.',
    image: '/images/2 Faster Turnaround.png',
  },
];

const ALL_BENEFITS: WorkflowBenefit[] = [...LEFT_BENEFITS, ...RIGHT_BENEFITS];

export const ProcessFeatures: React.FC = () => {
  const [assets, setAssets] = useState<WebsiteAssets>(getWebsiteAssets);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const handleAssetsUpdate = () => {
      setAssets(getWebsiteAssets());
    };
    window.addEventListener('feviqo_assets_updated', handleAssetsUpdate);
    return () => window.removeEventListener('feviqo_assets_updated', handleAssetsUpdate);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      setActiveSlide((prev) => (prev + 1) % ALL_BENEFITS.length);
    } else if (distance < -45) {
      setActiveSlide((prev) => (prev - 1 + ALL_BENEFITS.length) % ALL_BENEFITS.length);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section 
      id="process-features" 
      className="relative bg-slate-50/90 text-slate-900 py-12 sm:py-16 md:py-20 border-t border-slate-200/80 overflow-hidden"
    >
      {/* Subtle soft backdrop accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-100/35 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sequential Fade In Header */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center -skew-x-[22deg] bg-emerald-50 border border-emerald-200 px-4 py-1.5 mb-3 shadow-xs shrink-0">
            <span className="skew-x-[22deg] inline-flex items-center gap-2 text-emerald-800 font-extrabold text-xs tracking-wider uppercase whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
              <span>Structured Workflow Execution</span>
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight mb-3">
            Video Creation Should be Easy.
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Explore how our dedicated editors streamline every phase from raw footage upload to viral release.
          </p>
        </motion.div>

        {/* 
          ==================================================
          DESKTOP 3-COLUMN STAGE (sm+)
          Curved rounded-[32px] premium cards (non-clickable, permanent clarity)
          ==================================================
        */}
        <div className="hidden sm:grid grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: 3 Benefit Cards */}
          <div className="col-span-4 flex flex-col gap-4">
            {LEFT_BENEFITS.map((benefit, i) => {
              const Icon = benefit.icon;

              return (
                <motion.div 
                  key={`left-${i}`}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[32px] p-6 bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-50 text-[#16a34a] border border-emerald-100 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base lg:text-lg font-black tracking-tight mb-1.5 text-slate-950">
                    {benefit.title}
                  </h3>
                  <div className="text-xs lg:text-sm leading-relaxed text-slate-600 font-normal">
                    {benefit.description}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Center Column: Centerpiece Artwork */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.55, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-4 flex items-center justify-center"
          >
            <div 
              className="w-full flex items-center justify-center transition-all duration-300"
              style={{
                maxWidth: assets.displaySettings?.workflowImageHeight 
                  ? `${Math.round(assets.displaySettings.workflowImageHeight * 1.25) + 100}px` 
                  : '490px',
              }}
            >
              <img
                src={assets.structuredWorkflowImage || '/images/last test.png'}
                alt="Video Creation Should be Easy"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = "/images/last test.png"; }}
                style={{
                  maxHeight: assets.displaySettings?.workflowImageHeight 
                    ? `${assets.displaySettings.workflowImageHeight + 100}px` 
                    : undefined,
                  borderRadius: assets.displaySettings?.workflowImageRadius !== undefined 
                    ? `${assets.displaySettings.workflowImageRadius}px` 
                    : undefined,
                }}
                className="w-full h-auto max-h-[560px] object-contain block mx-auto drop-shadow-2xl rounded-2xl transition-all"
              />
            </div>
          </motion.div>

          {/* Right Column: 3 Benefit Cards */}
          <div className="col-span-4 flex flex-col gap-4">
            {RIGHT_BENEFITS.map((benefit, i) => {
              const Icon = benefit.icon;

              return (
                <motion.div 
                  key={`right-${i}`}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[32px] p-6 bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-50 text-[#16a34a] border border-emerald-100 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base lg:text-lg font-black tracking-tight mb-1.5 text-slate-950">
                    {benefit.title}
                  </h3>
                  <div className="text-xs lg:text-sm leading-relaxed text-slate-600 font-normal">
                    {benefit.description}
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* 
          ==================================================
          MOBILE VIEW (< sm)
          Tight padding, no excessive whitespace underneath
          ==================================================
        */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.45 }}
          className="sm:hidden block max-w-md mx-auto"
        >
          <div 
            className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-5"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Artwork Card */}
            <div className="flex items-center justify-center p-1">
              <img
                src={assets.structuredWorkflowImage || '/images/last test.png'}
                alt="Video Creation Should be Easy"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = "/images/last test.png"; }}
                className="w-full h-auto max-h-[460px] object-contain block mx-auto drop-shadow-lg rounded-2xl"
              />
            </div>

            {/* Benefit Details */}
            <div className="mt-5 px-1 min-h-[120px]">
              <span className="text-[11px] font-bold text-[#22C55E] uppercase tracking-wider mb-1 block">
                {ALL_BENEFITS[activeSlide].tag}
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug mb-2">
                {ALL_BENEFITS[activeSlide].title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {ALL_BENEFITS[activeSlide].description}
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveSlide((prev) => (prev - 1 + ALL_BENEFITS.length) % ALL_BENEFITS.length)}
                aria-label="Previous workflow benefit"
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 hover:text-slate-950 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-1.5">
                {ALL_BENEFITS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Go to benefit ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      idx === activeSlide
                        ? 'w-5 h-2 bg-slate-900 rounded-full'
                        : 'w-2 h-2 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveSlide((prev) => (prev + 1) % ALL_BENEFITS.length)}
                aria-label="Next workflow benefit"
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 hover:text-slate-950 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

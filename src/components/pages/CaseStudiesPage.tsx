import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '../Navbar';
import { AppRoute } from '../../types';
import { CASE_STUDIES } from '../../data/websiteData';

const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  useCommas?: boolean;
}> = ({ value, duration = 1800, delay = 0, decimals = 0, useCommas = false }) => {
  const [displayNumber, setDisplayNumber] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasTriggered(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);

    const timer = setTimeout(() => setHasTriggered(true), 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!hasTriggered) return;

    let startTimestamp: number | null = null;
    let animId: number;

    const timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = easeProgress * value;

        setDisplayNumber(currentVal);

        if (progress < 1) {
          animId = requestAnimationFrame(step);
        } else {
          setDisplayNumber(value);
        }
      };

      animId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [hasTriggered, value, duration, delay]);

  const formatted = useCommas
    ? Math.round(displayNumber).toLocaleString('en-US')
    : decimals > 0
    ? displayNumber.toFixed(decimals)
    : Math.round(displayNumber).toString();

  return (
    <span ref={ref} className="tabular-nums">
      {formatted}
    </span>
  );
};

interface CaseStudiesPageProps {
  onBackToHome: () => void;
  onBookCall: () => void;
  onNavigatePricing: () => void;
  onOpenVideo?: (id: string) => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage?: (route: AppRoute) => void;
}

export const CaseStudiesPage: React.FC<CaseStudiesPageProps> = ({
  onBackToHome,
  onBookCall,
  onNavigatePricing,
  onNavigateSection,
  onNavigateFlow = () => {},
  onNavigatePage = () => {},
}) => {
  return (
    <div className="min-h-screen bg-white text-[#0B0B0D] font-sans antialiased selection:bg-[#22C55E] selection:text-slate-950 flex flex-col">
      {/* Navigation */}
      <Navbar 
        onBookCall={onBookCall}
        onNavigateSection={onNavigateSection || onBackToHome}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage || ((route) => {
          if (route === 'home') onBackToHome();
        })}
      />

      {/* 
        ==================================================
        CLEAN LIGHT HERO SECTION FOR CASE STUDIES
        (Requested: "keep it white. I think so that will be look more good instead of these working too dark color.")
        ==================================================
      */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-center bg-white border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-6 text-emerald-900">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-emerald-800 uppercase">
              PROVEN RESULTS &bull; EDITS PAY OFF
            </span>
          </div>

          <h1 className="font-coolvetica text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-950 leading-[1.06] max-w-4xl mx-auto mb-5">
            Real Creators. Real Brands. <br />
            <span className="font-editorial-italic font-normal text-[#16a34a]">Real Measurable Results.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            See how top creators, fast-growing businesses, and agencies partner with our dedicated video editors to scale publishing volume and drive customer revenue.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={onBookCall}
              className="w-full sm:w-auto px-9 py-4 rounded-xl sm:rounded-2xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-base sm:text-lg shadow-lg shadow-[#22C55E]/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Started!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigatePricing}
              className="w-full sm:w-auto px-7 py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 transition-colors cursor-pointer"
            >
              View Retainer Plans
            </button>
          </div>

          {/* Highlight Metrics Strip in Hero - Clean Apple-Grade Typography */}
          <div className="pt-10 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#16a34a] uppercase block">Total Views</span>
              <div className="font-black text-slate-950 text-3xl sm:text-4xl">
                <AnimatedCounter value={50} delay={0} />M+
              </div>
              <p className="text-xs text-slate-500 font-medium">Across client channels</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#16a34a] uppercase block">Ad Pipeline</span>
              <div className="font-black text-slate-950 text-3xl sm:text-4xl">
                $<AnimatedCounter value={10} delay={100} />M+
              </div>
              <p className="text-xs text-slate-500 font-medium">Generated for brand campaigns</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#16a34a] uppercase block">Delivered Cuts</span>
              <div className="font-black text-slate-950 text-3xl sm:text-4xl">
                <AnimatedCounter value={50000} useCommas={true} delay={200} />+
              </div>
              <p className="text-xs text-slate-500 font-medium">Master ProRes deliverables</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#16a34a] uppercase block">Satisfaction</span>
              <div className="font-black text-slate-950 text-3xl sm:text-4xl">
                <AnimatedCounter value={4.9} decimals={1} delay={300} />/5.0
              </div>
              <p className="text-xs text-slate-500 font-medium">Over 200+ active partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ==================================================
        CASE STUDIES PRESENTATION (NO CHEAP BOXES)
        Apple-grade open layout, watch button removed
        5th testimonial centered: "The 5th one is left-aligned. Align that in center so they will be properly aligned and will look good."
        ==================================================
      */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full py-20">
        <div className="max-w-2xl mb-14 text-left">
          <span className="text-xs font-semibold tracking-wider text-[#16a34a] uppercase block mb-3">
            DETAILED CASE BREAKDOWNS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B0B0D] tracking-tight">
            How our partners win with video.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 pt-8 border-t border-slate-200">
          {CASE_STUDIES.map((study, idx) => {
            const isFifth = idx === 4;

            return (
              <div 
                key={study.id} 
                className={`space-y-5 text-left pb-10 border-b border-slate-200/80 ${
                  isFifth ? 'md:col-span-2 md:max-w-xl md:mx-auto w-full' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={study.image} 
                      alt={study.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-xl text-slate-950 leading-tight">{study.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{study.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#22C55E] block leading-none">{study.kpi}</span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{study.kpiType}</span>
                  </div>
                </div>

                <p className="text-base text-slate-700 leading-relaxed font-normal">
                  {study.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#16a34a] uppercase tracking-wide">
                    &bull; {study.category}
                  </span>
                  <span className="text-slate-500 font-medium">
                    Verified FEVIQO Partner
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-200 py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 text-center mt-auto">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0B0D] tracking-tight mb-3">
            Ready to be our next success story?
          </h2>
          <p className="text-slate-600 text-base mb-8">
            Experience high-performance video editing with zero management overhead.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onBookCall}
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-base shadow-lg shadow-[#22C55E]/25 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              Get Started!
            </button>
            <button
              onClick={onNavigatePricing}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 transition-colors cursor-pointer"
            >
              View Retainer Plans
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

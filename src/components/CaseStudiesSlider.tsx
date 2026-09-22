import React, { useState, useRef } from 'react';
import { CASE_STUDIES } from '../data/websiteData';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export const CaseStudiesSlider: React.FC = () => {
  // Find Patrick Anghel index or default to 0
  const patrickIndex = CASE_STUDIES.findIndex((c) => c.name.includes('Patrick'));
  const [currentIndex, setCurrentIndex] = useState(patrickIndex !== -1 ? patrickIndex : 0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? CASE_STUDIES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === CASE_STUDIES.length - 1 ? 0 : prev + 1));
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;
    if (diff > minSwipeDistance) {
      nextSlide();
    } else if (diff < -minSwipeDistance) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentStudy = CASE_STUDIES[currentIndex];

  return (
    <section id="case-studies" className="py-16 md:py-24 bg-gradient-to-b from-white via-emerald-50/50 to-white relative overflow-hidden text-slate-900">
      {/* Brand Green Ambient Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-emerald-200/35 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="text-[#22C55E] font-black text-sm sm:text-base tracking-wider uppercase mb-2">
            FEVIQO
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Edits Pay Off
          </h2>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-slate-600 font-normal">
            Real people. Real businesses. Real results.
          </p>
        </div>

        {/* Mobile Swipeable Card Container */}
        <div 
          className="md:hidden max-w-sm mx-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl relative">
            
            {/* Top Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-5 border-2 border-slate-200 shadow-md">
              <img
                src={currentStudy.image}
                alt={currentStudy.name}
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Huge KPI Stat in Green Brand Color */}
            <div className="text-center mb-5">
              <div className="text-5xl font-black text-[#22C55E] tracking-tighter proportional-nums font-sans mb-1">
                {currentStudy.kpi}
              </div>
              <div className="text-sm font-semibold text-slate-600">
                {currentStudy.kpiType}
              </div>
            </div>

            {/* Testimonial Quote */}
            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal text-center">
              "{currentStudy.description}"
            </p>

            {/* Author / Story Info */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {currentStudy.name}
                </div>
                <div className="text-xs text-slate-500">
                  {currentStudy.role}
                </div>
              </div>
              <div className="inline-flex items-center -skew-x-[22deg] bg-emerald-50/90 border border-emerald-300/80 px-3 py-1 shadow-xs shrink-0 whitespace-nowrap">
                <span className="skew-x-[22deg] flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                  <span className="whitespace-nowrap">Verified Client</span>
                </span>
              </div>
            </div>

            {/* Bottom-left Navigation Arrows */}
            <div className="flex items-center gap-2 mt-6">
              <button
                onClick={prevSlide}
                aria-label="Previous case study"
                className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center text-xs font-bold border border-slate-300 shadow-2xs cursor-pointer"
              >
                &lt;
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next case study"
                className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center text-xs font-bold border border-slate-300 shadow-2xs cursor-pointer"
              >
                &gt;
              </button>
            </div>

          </div>
        </div>

        {/* Desktop View: 3-Card Grid using Brand Green */}
        <div className="hidden md:grid grid-cols-3 gap-6 pt-4">
          {CASE_STUDIES.slice(0, 3).map((study) => (
            <div
              key={study.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl relative flex flex-col justify-between hover:border-[#22C55E]/50 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div>
                {/* Top Avatar */}
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-5 border-2 border-slate-200 shadow-md group-hover:scale-105 transition-transform">
                  <img
                    src={study.image}
                    alt={study.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Huge KPI Stat */}
                <div className="text-center mb-5">
                  <div className="text-4xl sm:text-5xl font-black text-[#22C55E] tracking-tighter proportional-nums font-sans mb-1">
                    {study.kpi}
                  </div>
                  <div className="text-sm font-semibold text-slate-600">
                    {study.kpiType}
                  </div>
                </div>

                {/* Testimonial Quote */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal text-center">
                  "{study.description}"
                </p>
              </div>

              {/* Author / Story Info */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {study.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {study.role}
                  </div>
                </div>
                <div className="inline-flex items-center -skew-x-[22deg] bg-emerald-50/90 border border-emerald-300/80 px-3 py-1 shadow-xs shrink-0 whitespace-nowrap">
                  <span className="skew-x-[22deg] flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                    <span className="whitespace-nowrap">Verified Client</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

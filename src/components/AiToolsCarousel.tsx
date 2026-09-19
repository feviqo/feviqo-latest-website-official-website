import React, { useState, useEffect } from 'react';
import { Wand2, ChevronLeft, ChevronRight, Sparkles, Flame, Scissors } from 'lucide-react';

export const AiToolsCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const toolsData = [
    {
      id: 'generate-scripts',
      badgeText: 'FEVIQO Scripted',
      icon: Sparkles,
      title: 'Generate Scripts',
      description: 'Get well-structured, on-brand video ideas and scripts instantly with FEVIQO AI.',
      image: '/images/tools2b.png',
      cardBg: 'bg-gradient-to-r from-[#58ADFC] via-[#3b82f6] to-[#1d4ed8]',
    },
    {
      id: 'create-trendy-videos',
      badgeText: 'FEVIQO Inspired',
      icon: Flame,
      title: 'Create Trendy Videos',
      description: 'Use high-performing video templates to create viral and trendy video content.',
      image: '/images/tools3.png',
      cardBg: 'bg-gradient-to-r from-[#D8226B] via-[#e11d48] to-[#be123c]',
    },
    {
      id: 'repurpose-clips',
      badgeText: 'FEVIQO Clips',
      icon: Scissors,
      title: 'Repurpose to Clips',
      description: 'Find the most engaging moments and hooks from your long-form videos with FEVIQO AI.',
      image: '/images/tools1.png',
      cardBg: 'bg-gradient-to-r from-[#22C55E] via-[#16a34a] to-[#15803d]',
    },
  ];

  const totalTools = toolsData.length;

  // Seamless interruption-free loop: exactly 2 seconds on screen per item
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalTools);
    }, 2000);
    return () => clearInterval(interval);
  }, [totalTools]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalTools);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalTools) % totalTools);
  };

  return (
    <section 
      id="ai-tools" 
      className="py-16 md:py-24 bg-white relative overflow-hidden"
    >
      {/* Background ambient aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-r from-blue-200/25 via-rose-200/25 to-green-200/25 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center -skew-x-[22deg] bg-emerald-100/90 border border-emerald-200/80 px-4 py-1.5 mb-3 shadow-xs shrink-0">
            <span className="skew-x-[22deg] inline-flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-bold whitespace-nowrap">
              <Wand2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>FEVIQO AI Content Suite</span>
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            AI-Powered <span className="green-gradient-text">Tools</span>
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base md:text-lg font-normal">
            Automated workflows engineered to speed up scripting, repurposing, and trending edits.
          </p>
        </div>

        {/* Carousel Viewport: Single Big Card with Left Text & Right Image */}
        <div className="max-w-5xl mx-auto relative px-2 sm:px-12">
          
          {/* Card Container with overflow hidden */}
          <div className="relative min-h-[440px] sm:min-h-[420px] md:min-h-[400px] rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-2xl">
            {toolsData.map((tool, idx) => {
              const diff = (idx - activeIndex + totalTools) % totalTools;
              const isActive = diff === 0;
              const isExiting = diff === totalTools - 1;
              const Icon = tool.icon;

              return (
                <div
                  key={tool.id}
                  className={`absolute inset-0 w-full h-full ${tool.cardBg} p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
                    isActive
                      ? 'opacity-100 translate-x-0 pointer-events-auto z-10'
                      : isExiting
                      ? 'opacity-0 -translate-x-full pointer-events-none z-0'
                      : 'opacity-0 translate-x-full pointer-events-none z-0'
                  }`}
                >
                  {/* Left Column: Badge, Title & Description */}
                  <div className="w-full md:w-1/2 text-left text-white space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-extrabold tracking-wide uppercase shadow-sm">
                      <Icon className="w-4 h-4 text-white" />
                      <span>{tool.badgeText}</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                      {tool.title}
                    </h3>
                    <p className="text-white/95 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-md">
                      {tool.description}
                    </p>
                  </div>

                  {/* Right Column: High Quality Mockup */}
                  <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                    <img
                      src={tool.image}
                      alt={tool.title}
                      className="w-full max-w-[360px] sm:max-w-[420px] max-h-[260px] sm:max-h-[320px] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-xl z-20 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-xl z-20 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>

        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-2.5 mt-8">
          {toolsData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                activeIndex === idx ? 'w-10 bg-emerald-500' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};



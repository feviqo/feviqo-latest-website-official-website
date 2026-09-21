import React from 'react';

interface StillHavingDoubtsBannerProps {
  onScheduleCall: () => void;
  onChoosePlan: () => void;
}

export const StillHavingDoubtsBanner: React.FC<StillHavingDoubtsBannerProps> = ({
  onScheduleCall,
  onChoosePlan,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-16 sm:my-24">
      <div className="relative w-full rounded-[32px] sm:rounded-[36px] bg-gradient-to-br from-[#14532D] via-[#15803D] to-[#16a34a] overflow-hidden shadow-2xl shadow-emerald-950/25 flex flex-col md:flex-row items-center justify-between min-h-[360px] sm:min-h-[400px] border border-emerald-400/20">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Left Side: Representative Cutout */}
        <div className="w-full md:w-1/2 flex items-end justify-center md:justify-start pt-6 sm:pt-10 md:pt-0 pl-0 md:pl-8 lg:pl-12 self-end z-10">
          <img
            src="/images/pic%20ullimited%20page-1.png"
            alt="Customer Support Lead"
            className="w-auto h-[280px] sm:h-[340px] md:h-[380px] lg:h-[420px] object-contain object-bottom drop-shadow-2xl select-none pointer-events-none"
            loading="lazy"
          />
        </div>

        {/* Right Side: Headline, Description & Call to Actions */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 md:pr-12 lg:pr-16 text-left flex flex-col justify-center z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4 drop-shadow-sm">
            Still Having Doubts?
          </h2>

          <p className="text-emerald-50 text-sm sm:text-base font-normal leading-relaxed max-w-md mb-8">
            Customer support is our highest priority. We're here to answer all your questions via our Support Docs, Video Demos, and 24/7 Live Chat.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={onScheduleCall}
              className="px-6 sm:px-8 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-[#14532D] text-sm sm:text-base font-black transition-all shadow-lg shadow-black/10 hover:scale-105 active:scale-95 cursor-pointer text-center"
            >
              Schedule a Call
            </button>

            <button
              onClick={onChoosePlan}
              className="px-6 sm:px-8 py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-white text-sm sm:text-base font-bold border border-white/80 transition-all hover:scale-105 active:scale-95 cursor-pointer text-center"
            >
              Choose a Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

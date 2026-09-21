import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { getWebsiteAssets, WebsiteAssets } from '../services/assetService';
import { SafeImage } from './SafeImage';

interface ValuePillarsProps {
  onGetStarted: () => void;
}

export const ValuePillars: React.FC<ValuePillarsProps> = ({ onGetStarted }) => {
  const [assets, setAssets] = useState<WebsiteAssets>(getWebsiteAssets);

  useEffect(() => {
    const handleAssetsUpdate = () => {
      setAssets(getWebsiteAssets());
    };
    window.addEventListener('feviqo_assets_updated', handleAssetsUpdate);
    return () => window.removeEventListener('feviqo_assets_updated', handleAssetsUpdate);
  }, []);

  const pillarImageStyle: React.CSSProperties = {
    maxHeight: assets.displaySettings?.pillarImageHeight ? `${assets.displaySettings.pillarImageHeight}px` : '1000px',
    borderRadius: assets.displaySettings?.pillarImageRadius !== undefined && assets.displaySettings.pillarImageRadius > 0
      ? `${assets.displaySettings.pillarImageRadius}px` 
      : undefined,
    objectFit: 'contain',
  };

  return (
    <section id="value-pillars" className="py-16 md:py-24 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            You Create. <br />
            <span className="text-[#22C55E]">We Edit.</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            No stress, no hassle. Fast, high quality video editing.
          </p>
        </div>

        {/* 3 Pillars Layout */}
        <div className="space-y-12 md:space-y-16">
          {/* Pillar 1: Creative Decisions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Tailored Brand Style</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Creative Decisions
              </h3>
              <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                Get video editors who create engaging, high retention and trendy videos tailored to your brand’s style.
              </p>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="w-full max-w-2xl flex justify-center items-center">
                <SafeImage
                  src={assets.creativeDecisionsImage}
                  fallbackSrc="/images/1 Creative Decisions.png"
                  alt="Creative Decisions"
                  style={pillarImageStyle}
                  className="w-full h-auto max-h-[460px] object-contain transition-all duration-300 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Pillar 2: Faster Turnaround */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-1 flex justify-center">
              <div className="w-full max-w-2xl flex justify-center items-center">
                <SafeImage
                  src={assets.fasterTurnaroundImage}
                  fallbackSrc="/images/2 Faster Turnaround.png"
                  alt="Faster Turnaround"
                  style={pillarImageStyle}
                  className="w-full h-auto max-h-[460px] object-contain transition-all duration-300 rounded-xl"
                />
              </div>
            </div>
            <div className="order-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Less than 24 hours</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Faster Turnaround
              </h3>
              <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                Receive your drafts in less than 24 hours. Keep your social presence running ahead of schedule.
              </p>
            </div>
          </div>

          {/* Pillar 3: Streamlined Process */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Zero hassle</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Streamlined Process
              </h3>
              <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                Spend less time dealing with freelancers. Create great content while your team handles the heavy lifting.
              </p>
              <div className="pt-2">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-3.5 rounded-xl bg-[#22C55E] hover:bg-[#1ebd52] text-white font-black text-sm sm:text-base shadow-lg shadow-green-900/25 cursor-pointer inline-flex items-center justify-center hover:scale-[1.02] transition-all"
                >
                  <span>Get Started!</span>
                </button>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="w-full max-w-2xl flex justify-center items-center">
                <SafeImage
                  src={assets.streamlinedProcessImage}
                  fallbackSrc="/images/3 Streamlined Process.png"
                  alt="Streamlined Process"
                  style={pillarImageStyle}
                  className="w-full h-auto max-h-[460px] object-contain transition-all duration-300 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


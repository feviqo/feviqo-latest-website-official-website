import React, { useState, useEffect } from 'react';
import { fetchAllCmsData, CMS_UPDATED_EVENT, LogoItem, DEFAULT_LOGOS } from '../services/cmsService';
import { SafeImage } from './SafeImage';

export const LogoMarquee: React.FC = () => {
  const [logos, setLogos] = useState<LogoItem[]>(DEFAULT_LOGOS);

  useEffect(() => {
    let isMounted = true;

    // Load initial logos from CMS
    fetchAllCmsData().then((state) => {
      if (isMounted && state.logos && state.logos.length > 0) {
        const active = state.logos.filter((l) => l.isActive);
        if (active.length > 0) {
          setLogos(active);
        }
      }
    });

    // Listen for live CMS updates from Admin Panel
    const handleCmsUpdate = (e: any) => {
      if (e.detail?.logos && e.detail.logos.length > 0) {
        const active = e.detail.logos.filter((l: LogoItem) => l.isActive);
        if (active.length > 0) {
          setLogos(active);
        }
      }
    };

    window.addEventListener(CMS_UPDATED_EVENT, handleCmsUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener(CMS_UPDATED_EVENT, handleCmsUpdate);
    };
  }, []);

  const displayLogos = logos.length > 0 ? logos : DEFAULT_LOGOS;

  // Repeat logos 3 times per track so even on 4K ultra-wide monitors there is zero empty gap
  const repeatedLogos = React.useMemo(() => {
    return [...displayLogos, ...displayLogos, ...displayLogos];
  }, [displayLogos]);

  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-gradient-to-r from-[#0c4723] via-[#157a3e] to-[#0c4723] text-white border-y border-emerald-400/30">
      {/* Central Ambient Light Radial Glow for a lighter center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(74,222,128,0.22)_0%,transparent_100%)] pointer-events-none" />

      {/* Header: Pure Text without Pill as requested */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8 relative z-10">
        <h2 className="text-sm sm:text-base md:text-lg font-black text-white uppercase tracking-[0.28em] drop-shadow-sm">
          TRUSTED BY HUNDREDS
        </h2>
      </div>

      {/* Infinite Seamless Scrolling Marquee without side fade strips */}
      <div className="relative w-full overflow-hidden flex select-none py-2">
        {/* Continuous Hardware-Accelerated Track */}
        <div className="animate-marquee-continuous flex items-center">
          {/* First set of logos (triple repeated for 100% gapless fill on any screen width) */}
          <div className="flex items-center gap-10 sm:gap-14 shrink-0 pr-10 sm:pr-14">
            {repeatedLogos.map((logo, index) => (
              <div
                key={`track-a-${logo.id}-${index}`}
                className="flex items-center justify-center shrink-0 opacity-90 hover:opacity-100 transition-opacity duration-200"
              >
                {logo.link ? (
                  <a 
                    href={logo.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block hover:scale-105 transition-transform duration-200 focus:outline-hidden"
                  >
                    <SafeImage
                      src={logo.image}
                      fallbackSrc={logo.image.replace('.webp', '.svg')}
                      alt={logo.altText || logo.name}
                      className="h-8 sm:h-10 w-auto max-w-[140px] sm:max-w-[170px] object-contain brightness-0 invert drop-shadow-sm"
                    />
                  </a>
                ) : (
                  <div className="hover:scale-105 transition-transform duration-200">
                    <SafeImage
                      src={logo.image}
                      fallbackSrc={logo.image.replace('.webp', '.svg')}
                      alt={logo.altText || logo.name}
                      className="h-8 sm:h-10 w-auto max-w-[140px] sm:max-w-[170px] object-contain brightness-0 invert drop-shadow-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Exact duplicate set for 100% gapless continuous loop */}
          <div className="flex items-center gap-10 sm:gap-14 shrink-0 pr-10 sm:pr-14" aria-hidden="true">
            {repeatedLogos.map((logo, index) => (
              <div
                key={`track-b-${logo.id}-${index}`}
                className="flex items-center justify-center shrink-0 opacity-90 hover:opacity-100 transition-opacity duration-200"
              >
                {logo.link ? (
                  <a 
                    href={logo.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    tabIndex={-1}
                    className="block hover:scale-105 transition-transform duration-200 focus:outline-hidden"
                  >
                    <SafeImage
                      src={logo.image}
                      fallbackSrc={logo.image.replace('.webp', '.svg')}
                      alt={logo.altText || logo.name}
                      className="h-8 sm:h-10 w-auto max-w-[140px] sm:max-w-[170px] object-contain brightness-0 invert drop-shadow-sm"
                    />
                  </a>
                ) : (
                  <div className="hover:scale-105 transition-transform duration-200">
                    <SafeImage
                      src={logo.image}
                      fallbackSrc={logo.image.replace('.webp', '.svg')}
                      alt={logo.altText || logo.name}
                      className="h-8 sm:h-10 w-auto max-w-[140px] sm:max-w-[170px] object-contain brightness-0 invert drop-shadow-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

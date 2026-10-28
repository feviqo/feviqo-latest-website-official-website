import React, { useState, useEffect } from 'react';
import { getWebsiteAssets, WebsiteAssets } from '../services/assetService';

/**
 * FEVIQO Official Header Logo:
 * Stylized geometric "F" mark with vibrant green (#22C55E) top bar accent,
 * bold geometric FEVIQO typography, and vibrant green slash on "Q".
 * Supports dynamic logo uploads and custom height from Admin Asset Manager.
 */
export const FeviqoHeaderLogo: React.FC<{ 
  className?: string; 
  theme?: 'dark' | 'light';
  height?: number;
}> = ({ 
  className = 'h-8 w-auto',
  theme = 'dark',
  height,
}) => {
  const [assets, setAssets] = useState<WebsiteAssets>(getWebsiteAssets);

  useEffect(() => {
    const handleUpdate = () => setAssets(getWebsiteAssets());
    window.addEventListener('feviqo_assets_updated', handleUpdate);
    return () => window.removeEventListener('feviqo_assets_updated', handleUpdate);
  }, []);

  const customLogoUrl = assets.headerLogo;
  const customHeight = height || assets.displaySettings?.logoHeight;
  const inlineStyle = customHeight ? { height: `${customHeight}px`, width: 'auto' } : undefined;

  // If user uploaded a custom logo image or SVG
  if (customLogoUrl && customLogoUrl !== '/images/feviqo-logo.svg') {
    return (
      <img
        src={customLogoUrl}
        alt="FEVIQO Brand Logo"
        style={inlineStyle}
        className={`${className} object-contain transition-all duration-200`}
        onError={(e) => {
          e.currentTarget.src = "/HEADER-removebg-preview.png";
        }}
      />
    );
  }

  if (theme === 'dark') {
    return (
      <img
        src="/HEADER-removebg-preview.webp"
        alt="FEVIQO Logo"
        width={150}
        height={32}
        fetchPriority="high"
        loading="eager"
        decoding="async"
        style={inlineStyle}
        className={`${className} object-contain transition-all duration-200`}
        onError={(e) => {
          e.currentTarget.src = "/HEADER-removebg-preview.png";
        }}
      />
    );
  }

  const textColor = '#090D16';

  return (
    <svg 
      viewBox="0 0 800 200" 
      className={`${className} object-contain`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FEVIQO Logo"
    >
      {/* F Mark */}
      <g transform="translate(40, 25) scale(0.24)">
        {/* Top Parallelogram in vibrant Green */}
        <polygon points="328,258 775,258 670,365 254,365" fill="#22C55E" />
        {/* Middle Trapezoid */}
        <polygon points="402,458 668,458 594,552 446,552" fill={textColor} />
        {/* Bottom Triangle */}
        <polygon points="254,440 400,665 254,810" fill={textColor} />
      </g>
      
      {/* Wordmark E V I Q O */}
      <g fill={textColor}>
        {/* E */}
        <path d="M 235 62 H 310 V 82 H 262 V 104 H 302 V 122 H 262 V 144 H 312 V 164 H 235 Z" />
        {/* V */}
        <path d="M 330 62 H 356 L 382 136 L 408 62 H 434 L 396 164 H 368 Z" />
        {/* I */}
        <rect x="454" y="62" width="24" height="102" />
        {/* Q Body */}
        <path d="M 545 60 C 515 60 495 80 495 113 C 495 146 515 166 545 166 C 564 166 579 157 588 142 L 572 129 C 566 141 556 147 545 147 C 530 147 519 133 519 113 C 519 93 530 79 545 79 C 560 79 571 93 571 113 C 571 117 570 121 568 125 L 588 136 C 592 129 595 121 595 113 C 595 80 575 60 545 60 Z" />
        {/* O */}
        <path d="M 670 60 C 640 60 620 80 620 113 C 620 146 640 166 670 166 C 700 166 720 146 720 113 C 720 80 700 60 670 60 Z M 670 79 C 685 79 696 93 696 113 C 696 133 685 147 670 147 C 655 147 644 133 644 113 C 644 93 655 79 670 79 Z" />
      </g>
      
      {/* Q Tail in vibrant Green */}
      <polygon points="572,130 594,152 616,152 586,122" fill="#22C55E" />
    </svg>
  );
};

/**
 * FEVIQO Circular App Icon:
 * Uses the user's authentic feviqo1.png / feviqo1.svg emblem.
 */
export const FeviqoIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <img
      src="/feviqo1.png"
      alt="FEVIQO Icon"
      className={`${className} object-contain rounded-full shadow-sm`}
      onError={(e) => {
        e.currentTarget.src = "/feviqo1.svg";
      }}
    />
  );
};

/**
 * FEVIQO Official Wordmark:
 * Horizontal typographic presentation of "FEVIQO" with vibrant green accents.
 */
export const FeviqoWordmark: React.FC<{ 
  className?: string; 
  theme?: 'dark' | 'light';
  height?: number;
}> = ({ 
  className = 'h-8 sm:h-9 w-auto',
  theme = 'dark',
  height,
}) => {
  const textColor = theme === 'dark' ? '#FFFFFF' : '#090D16';
  const customHeightStyle = height ? { height: `${height}px` } : undefined;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} style={customHeightStyle}>
      <svg 
        viewBox="0 0 740 180" 
        className="h-full w-auto object-contain" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="FEVIQO Wordmark"
      >
        {/* F */}
        <g>
          <polygon points="40,24 160,24 136,54 40,54" fill="#22C55E" />
          <polygon points="40,78 126,78 106,104 40,104" fill={textColor} />
          <rect x="40" y="24" width="28" height="132" fill={textColor} />
        </g>
        
        {/* E V I Q O */}
        <g fill={textColor}>
          {/* E */}
          <path d="M 185 24 H 265 V 50 H 215 V 76 H 255 V 100 H 215 V 130 H 267 V 156 H 185 Z" />
          {/* V */}
          <path d="M 285 24 H 315 L 343 116 L 371 24 H 401 L 359 156 H 327 Z" />
          {/* I */}
          <rect x="420" y="24" width="28" height="132" />
          {/* Q Body */}
          <path d="M 520 22 C 480 22 455 52 455 90 C 455 128 480 158 520 158 C 544 158 565 146 576 128 L 554 112 C 547 124 536 132 520 132 C 498 132 485 114 485 90 C 485 66 498 48 520 48 C 542 48 555 66 555 90 C 555 95 554 100 551 106 L 575 119 C 581 110 585 100 585 90 C 585 52 560 22 520 22 Z" />
          {/* O */}
          <path d="M 655 22 C 615 22 590 52 590 90 C 590 128 615 158 655 158 C 695 158 720 128 720 90 C 720 52 695 22 655 22 Z M 655 48 C 677 48 690 66 690 90 C 690 114 677 132 655 132 C 633 132 620 114 620 90 C 620 66 633 48 655 48 Z" />
        </g>
        
        {/* Q Tail Accent in Vibrant Green */}
        <polygon points="550,112 578,142 606,142 568,102" fill="#22C55E" />
      </svg>
    </div>
  );
};

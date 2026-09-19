import React from 'react';

/**
 * High-definition, authentic brand vector icons for video platforms & creative packaging
 */

export const YouTubeBrandLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="YouTube"
  >
    <path 
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" 
      fill="#FF0000"
    />
    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF"/>
  </svg>
);

export const InstagramBrandLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Instagram"
  >
    <defs>
      <linearGradient id="ig-grad" x1="2" y1="21.5" x2="21.5" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFDC80" />
        <stop offset="25%" stopColor="#F77737" />
        <stop offset="50%" stopColor="#F56040" />
        <stop offset="75%" stopColor="#FD1D1D" />
        <stop offset="100%" stopColor="#833AB4" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-grad)" />
    <path 
      d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.92A3.12 3.12 0 1 1 15.12 12 3.12 3.12 0 0 1 12 15.12z" 
      fill="#FFFFFF"
    />
    <circle cx="17.4" cy="6.6" r="1.15" fill="#FFFFFF" />
  </svg>
);

export const ShortsBrandLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="YouTube Shorts"
  >
    <path 
      d="M17.77 10.32l-1.2-.5a5.5 5.5 0 0 0-7.25-2.88L6.44 8.2a5.5 5.5 0 0 0-2.88 7.25l1.2.5a5.5 5.5 0 0 0 7.25 2.88l2.88-1.26a5.5 5.5 0 0 0 2.88-7.25z" 
      fill="#FF0000"
    />
    <path d="M10 8.5v7l6-3.5-6-3.5z" fill="#FFFFFF" />
  </svg>
);

export const TikTokBrandLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="TikTok"
  >
    <path 
      d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.883 2.502 2.896 2.896 0 0 1-2.895-2.895 2.896 2.896 0 0 1 2.895-2.895c.342 0 .671.058.98.163V8.98a6.38 6.38 0 0 0-.98-.076C5.973 8.904 3 11.877 3 15.394 3 18.91 5.973 21.884 9.489 21.884c3.516 0 6.489-2.973 6.489-6.49V8.67a8.212 8.212 0 0 0 4.611 1.406V6.63a4.774 4.774 0 0 1-1-.044z" 
      fill="#000000"
    />
    <path 
      d="M16.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-1v2.441a4.793 4.793 0 0 0 3.77 4.245v-2z" 
      fill="#25F4EE" 
      opacity="0.9"
    />
    <path 
      d="M19.589 6.686a4.774 4.774 0 0 1-1-.044V6.63a8.212 8.212 0 0 1-4.611-1.406v1a8.212 8.212 0 0 0 4.611 1.406V6.63z" 
      fill="#FE2C55" 
      opacity="0.9"
    />
  </svg>
);

/**
 * Bespoke Creative Packaging Logo: High-CTR Thumbnail Design + Channel Branding
 * Represents thumbnail art, motion graphics package, and visual identity
 */
export const CreativePackagingBrandLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <div className={`relative inline-flex items-center justify-center ${className}`}>
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Creative Packaging & Thumbnail Design"
    >
      <defs>
        <linearGradient id="pack-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#0B0B0D" />
        </linearGradient>
      </defs>
      {/* 16:9 Aspect ratio thumbnail canvas outline */}
      <rect x="2" y="4" width="20" height="13" rx="2.5" fill="url(#pack-grad)" />
      {/* Playhead badge representing video thumbnail */}
      <polygon points="10,7.5 15,10.5 10,13.5" fill="#22C55E" />
      {/* Sparkles badge for creative packaging / motion assets */}
      <circle cx="18" cy="18" r="4" fill="#22C55E" />
      <path d="M18 15.8v4.4M15.8 18h4.4" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  </div>
);

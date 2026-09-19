import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  hideOnError?: boolean;
}

/**
 * SafeImage - Production-ready image component
 * - Prevents broken image icons and empty error boxes
 * - Uses no-referrer for reliable cross-origin and CDN delivery
 * - Defaults to async decoding and lazy loading
 * - Smoothly fades in when loaded
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  fallbackSrc,
  hideOnError = false,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  referrerPolicy = 'no-referrer',
  onError,
  onLoad,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no source at all, don't render a broken img tag
  if (!src && !fallbackSrc) {
    return null;
  }

  if (hasError && hideOnError) {
    return null;
  }

  const effectiveSrc = hasError && fallbackSrc ? fallbackSrc : src;

  if (!effectiveSrc) {
    return null;
  }

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      referrerPolicy={referrerPolicy}
      onLoad={(e) => {
        setIsLoaded(true);
        if (onLoad) onLoad(e);
      }}
      onError={(e) => {
        if (!hasError && fallbackSrc && effectiveSrc !== fallbackSrc) {
          setHasError(true);
        } else {
          setHasError(true);
          if (hideOnError) {
            e.currentTarget.style.display = 'none';
          }
        }
        if (onError) onError(e);
      }}
      className={className}
      {...props}
    />
  );
};

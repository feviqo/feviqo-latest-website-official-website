import React, { useEffect, useRef } from 'react';

export const AdBanner468x60: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous children to prevent duplicate ads on HMR or route changes
    containerRef.current.innerHTML = '';

    // Initialize atOptions globally for the ad network
    (window as any).atOptions = {
      'key' : '4643a71e3f1a88a4d0f13da5b4a38747',
      'format' : 'iframe',
      'height' : 60,
      'width' : 468,
      'params' : {}
    };

    // Create script tag
    const script = document.createElement('script');
    script.src = 'https://bicea.org/22/4643a71e3f1a88a4d0f13da5b4a38747';
    script.async = true;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center items-center my-6 overflow-hidden min-h-[60px] w-full bg-transparent select-none">
      <div ref={containerRef} className="max-w-full overflow-hidden" />
    </div>
  );
};

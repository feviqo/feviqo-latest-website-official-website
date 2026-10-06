import React, { useEffect, useRef } from 'react';

export const AdBanner160x300: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous children to prevent duplicate ads on HMR or route changes
    containerRef.current.innerHTML = '';

    // Initialize atOptions globally for the 160x300 ad format
    (window as any).atOptions = {
      'key' : 'ef03f2250848822feb100cc5150c73cf',
      'format' : 'iframe',
      'height' : 300,
      'width' : 160,
      'params' : {}
    };

    // Create script tag
    const script = document.createElement('script');
    script.src = 'https://bicea.org/22/ef03f2250848822feb100cc5150c73cf';
    script.async = true;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center items-center my-6 overflow-hidden min-h-[300px] w-[160px] bg-transparent select-none mx-auto">
      <div ref={containerRef} className="w-[160px] h-[300px] overflow-hidden" />
    </div>
  );
};

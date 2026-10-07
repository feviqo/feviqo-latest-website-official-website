import React, { useEffect, useRef } from 'react';

export const AdBanner320x50: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    (window as any).atOptions = {
      'key' : '4505cb57ab00165654b9739edd08ce80',
      'format' : 'iframe',
      'height' : 50,
      'width' : 320,
      'params' : {}
    };

    const script = document.createElement('script');
    script.src = 'https://bicea.org/22/4505cb57ab00165654b9739edd08ce80';
    script.async = true;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center items-center my-4 overflow-hidden min-h-[50px] w-[320px] bg-transparent select-none mx-auto">
      <div ref={containerRef} className="w-[320px] h-[50px] overflow-hidden" />
    </div>
  );
};

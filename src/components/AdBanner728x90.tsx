import React, { useEffect, useRef } from 'react';

export const AdBanner728x90: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    (window as any).atOptions = {
      'key' : '9f339244f54ccb3d800d54d3e28042ed',
      'format' : 'iframe',
      'height' : 90,
      'width' : 728,
      'params' : {}
    };

    const script = document.createElement('script');
    script.src = 'https://bicea.org/22/9f339244f54ccb3d800d54d3e28042ed';
    script.async = true;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center items-center my-6 overflow-hidden min-h-[90px] w-full max-w-[728px] bg-transparent select-none mx-auto">
      <div ref={containerRef} className="w-[728px] h-[90px] max-w-full overflow-hidden" />
    </div>
  );
};

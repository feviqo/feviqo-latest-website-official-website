import React, { useEffect, useRef } from 'react';

export const AdBanner300x250: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    (window as any).atOptions = {
      'key' : 'b4ad168fb5472996cf0850deca5787b5',
      'format' : 'iframe',
      'height' : 250,
      'width' : 300,
      'params' : {}
    };

    const script = document.createElement('script');
    script.src = 'https://bicea.org/22/b4ad168fb5472996cf0850deca5787b5';
    script.async = true;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center items-center my-6 overflow-hidden min-h-[250px] w-[300px] bg-transparent select-none mx-auto">
      <div ref={containerRef} className="w-[300px] h-[250px] overflow-hidden" />
    </div>
  );
};

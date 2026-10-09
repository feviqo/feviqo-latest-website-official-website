import React, { useEffect, useRef } from 'react';

export const AdNativeBanner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    try {
      const containerDiv = document.createElement('div');
      containerDiv.id = 'container-a9e02ac8819136c934856cc5799b9f15';

      const script = document.createElement('script');
      script.src = 'https://bicea.org/21/a9e02ac8819136c934856cc5799b9f15';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');

      containerRef.current.appendChild(containerDiv);
      containerRef.current.appendChild(script);
    } catch {
      // Handled
    }
  }, []);

  return (
    <div className="flex justify-center items-center my-6 overflow-hidden w-full max-w-4xl mx-auto min-h-[100px] select-none">
      <div ref={containerRef} className="w-full text-center" />
    </div>
  );
};

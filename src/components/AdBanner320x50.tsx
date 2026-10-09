import React, { useEffect, useRef } from 'react';

export const AdBanner320x50: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    try {
      const iframe = document.createElement('iframe');
      iframe.style.width = '320px';
      iframe.style.height = '50px';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.title = 'Sponsor Ad 320x50';
      iframe.loading = 'lazy';

      iframe.srcdoc = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { margin: 0; padding: 0; overflow: hidden; background: transparent; display: flex; justify-content: center; align-items: center; }
            </style>
          </head>
          <body>
            <script type="text/javascript">
              var atOptions = {
                'key' : '4505cb57ab00165654b9739edd08ce80',
                'format' : 'iframe',
                'height' : 50,
                'width' : 320,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://bicea.org/22/4505cb57ab00165654b9739edd08ce80" async onerror="this.onerror=null;"></script>
          </body>
        </html>
      `;

      containerRef.current.appendChild(iframe);
    } catch {
      // Handled - prevent crashes on network block
    }
  }, []);

  return (
    <div className="flex justify-center items-center my-4 overflow-hidden min-h-[50px] w-[320px] bg-transparent select-none mx-auto">
      <div ref={containerRef} className="w-[320px] h-[50px] overflow-hidden" />
    </div>
  );
};


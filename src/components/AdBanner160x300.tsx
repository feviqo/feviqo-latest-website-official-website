import React, { useEffect, useRef } from 'react';

export const AdBanner160x300: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    try {
      const iframe = document.createElement('iframe');
      iframe.style.width = '160px';
      iframe.style.height = '300px';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.title = 'Sponsor Ad 160x300';
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
                'key' : 'ef03f2250848822feb100cc5150c73cf',
                'format' : 'iframe',
                'height' : 300,
                'width' : 160,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://bicea.org/22/ef03f2250848822feb100cc5150c73cf" async onerror="this.onerror=null;"></script>
          </body>
        </html>
      `;

      containerRef.current.appendChild(iframe);
    } catch {
      // Handled - prevent crashes on network block
    }
  }, []);

  return (
    <div className="flex justify-center items-center my-6 overflow-hidden min-h-[300px] w-[160px] bg-transparent select-none mx-auto">
      <div ref={containerRef} className="w-[160px] h-[300px] overflow-hidden flex justify-center items-center" />
    </div>
  );
};

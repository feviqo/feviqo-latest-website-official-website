import React, { useEffect, useRef } from 'react';

export const AdBanner160x600: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    try {
      const iframe = document.createElement('iframe');
      iframe.style.width = '160px';
      iframe.style.height = '600px';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.title = 'Sponsor Ad 160x600';
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
                'key' : '8ad6453de0d608fcfa136475311925cb',
                'format' : 'iframe',
                'height' : 600,
                'width' : 160,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://bicea.org/22/8ad6453de0d608fcfa136475311925cb" async onerror="this.onerror=null;"></script>
          </body>
        </html>
      `;

      containerRef.current.appendChild(iframe);
    } catch {
      // Handled - prevent crashes on network block
    }
  }, []);

  return (
    <div className="flex justify-center items-center my-6 overflow-hidden min-h-[600px] w-[160px] bg-transparent select-none mx-auto">
      <div ref={containerRef} className="w-[160px] h-[600px] overflow-hidden" />
    </div>
  );
};

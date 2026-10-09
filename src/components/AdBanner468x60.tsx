import React, { useEffect, useRef } from 'react';

export const AdBanner468x60: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    try {
      const iframe = document.createElement('iframe');
      iframe.style.width = '468px';
      iframe.style.height = '60px';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.title = 'Sponsor Ad 468x60';
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
                'key' : '4643a71e3f1a88a4d0f13da5b4a38747',
                'format' : 'iframe',
                'height' : 60,
                'width' : 468,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://bicea.org/22/4643a71e3f1a88a4d0f13da5b4a38747" async onerror="this.onerror=null;"></script>
          </body>
        </html>
      `;

      containerRef.current.appendChild(iframe);
    } catch {
      // Handled - prevent crashes on network block
    }
  }, []);

  return (
    <div className="flex justify-center items-center my-6 overflow-hidden min-h-[60px] w-full bg-transparent select-none">
      <div ref={containerRef} className="max-w-full overflow-hidden flex justify-center items-center" />
    </div>
  );
};

import React, { useEffect, useRef } from 'react';

export const AdBanner728x90: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    try {
      const iframe = document.createElement('iframe');
      iframe.style.width = '728px';
      iframe.style.height = '90px';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.title = 'Sponsor Ad 728x90';
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
                'key' : '9f339244f54ccb3d800d54d3e28042ed',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://bicea.org/22/9f339244f54ccb3d800d54d3e28042ed" async onerror="this.onerror=null;"></script>
          </body>
        </html>
      `;

      containerRef.current.appendChild(iframe);
    } catch {
      // Handled - prevent crashes on network block
    }
  }, []);

  return (
    <div className="flex justify-center items-center my-6 overflow-hidden min-h-[90px] w-full max-w-[728px] bg-transparent select-none mx-auto">
      <div ref={containerRef} className="w-[728px] h-[90px] max-w-full overflow-hidden" />
    </div>
  );
};


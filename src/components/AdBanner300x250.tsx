import React, { useEffect, useRef } from 'react';

export const AdBanner300x250: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    try {
      const iframe = document.createElement('iframe');
      iframe.style.width = '300px';
      iframe.style.height = '250px';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.title = 'Sponsor Ad 300x250';
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
                'key' : 'b4ad168fb5472996cf0850deca5787b5',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://bicea.org/22/b4ad168fb5472996cf0850deca5787b5" async onerror="this.onerror=null;"></script>
          </body>
        </html>
      `;

      containerRef.current.appendChild(iframe);
    } catch {
      // Handled - prevent crashes on network block
    }
  }, []);

  return (
    <div className="flex justify-center items-center my-6 overflow-hidden min-h-[250px] w-[300px] bg-transparent select-none mx-auto">
      <div ref={containerRef} className="w-[300px] h-[250px] overflow-hidden flex justify-center items-center" />
    </div>
  );
};

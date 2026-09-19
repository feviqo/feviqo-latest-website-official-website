import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('feviqo_cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('feviqo_cookie_consent', 'accepted');
    setVisible(false);
    setSettingsOpen(false);
  };

  if (!visible) return null;

  return (
    <>
      <div 
        id="cookie-law-info-bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200/80 backdrop-blur-md px-4 py-4 sm:px-6 shadow-2xl shadow-slate-900/10 text-slate-700 text-xs sm:text-sm"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left leading-relaxed">
            We use cookies on <strong className="text-slate-900 font-bold">FEVIQO</strong> to give you the most relevant experience by remembering your preferences and repeat visits. By clicking “Accept”, you consent to the use of cookies.
          </p>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setSettingsOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
            >
              Cookie Settings
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2 rounded-xl brand-green-btn font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer hover:scale-[1.02]"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSettingsOpen(false)}
        >
          <div 
            className="relative w-full max-w-lg bg-gradient-to-b from-white via-slate-50 to-emerald-50/50 border border-emerald-300/80 rounded-2xl p-6 shadow-2xl text-slate-900 space-y-4 text-xs sm:text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-bold text-base flex items-center gap-2 text-slate-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Privacy & Cookie Preferences
              </h4>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed font-normal">
              Necessary cookies ensure basic website functionality and security. Performance and analytics cookies allow us to monitor traffic and provide an enhanced user experience.
            </p>

            <div className="space-y-2.5 py-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">Necessary Cookies</div>
                  <div className="text-[11px] text-slate-500">Essential for site operation</div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Always Active</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900">Analytics & Performance</div>
                  <div className="text-[11px] text-slate-500">Helps us improve our services</div>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600" 
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={handleAccept}
                className="w-full py-2.5 rounded-xl brand-green-btn font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer hover:scale-[1.02]"
              >
                Save & Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


import React from 'react';
import { X, Mail, CheckCircle2, Clock, Send, ExternalLink } from 'lucide-react';
import { SimulatedEmail } from '../../types';

interface EmailModalProps {
  emails: SimulatedEmail[];
  onClose: () => void;
  onSelectEmail: (id: string) => void;
  selectedEmailId: string | null;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  emails,
  onClose,
  onSelectEmail,
  selectedEmailId,
}) => {
  const activeEmail = emails.find((e) => e.id === selectedEmailId) || emails[0] || null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#22C55E] flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-950">Automated Email Notifications ({emails.length})</h3>
            <p className="text-xs text-slate-500">Live dispatched system emails to clients upon status updates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden">
          {/* Email List */}
          <div className="md:col-span-5 space-y-2 overflow-y-auto pr-1">
            {emails.map((em) => {
              const isSelected = em.id === activeEmail?.id;
              return (
                <div
                  key={em.id}
                  onClick={() => onSelectEmail(em.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-emerald-50/60 border-[#22C55E] shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-600 truncate">{em.recipientName}</span>
                    <span className="shrink-0">{em.timestamp}</span>
                  </div>
                  <h5 className="font-bold text-slate-900 line-clamp-1">{em.subject}</h5>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{em.body}</p>
                </div>
              );
            })}
          </div>

          {/* Email Body Preview */}
          <div className="md:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 overflow-y-auto flex flex-col justify-between">
            {activeEmail ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200">
                  <span className="text-[11px] font-mono text-slate-400 block">{activeEmail.timestamp}</span>
                  <h4 className="text-base font-black text-slate-950 mt-1">{activeEmail.subject}</h4>
                  <div className="text-xs text-slate-600 mt-1">
                    To: <strong>{activeEmail.recipientName}</strong> &lt;{activeEmail.to}&gt;
                  </div>
                  <div className="text-[11px] text-slate-500">
                    From: FEVIQO Flow Automated Notification Engine &lt;partner@feviqo.com&gt;
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200">
                  {activeEmail.body}
                </div>

                <div className="pt-2">
                  <a
                    href={`mailto:${activeEmail.to}?subject=${encodeURIComponent(activeEmail.subject)}&body=${encodeURIComponent(activeEmail.body)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Open in Real Mail App (mailto:)</span>
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">Select an email to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

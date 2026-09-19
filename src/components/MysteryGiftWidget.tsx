import React, { useState } from 'react';
import { Gift, ArrowRight, Check, Copy } from 'lucide-react';

export const MysteryGiftWidget: React.FC = () => {
  const [state, setState] = useState<'idle' | 'form' | 'done'>('idle');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleStart = () => {
    setState('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setState('done');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FEVIQO200');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-white to-green-50/60 border border-emerald-300/80 rounded-2xl p-6 sm:p-8 shadow-lg shadow-emerald-500/5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Gift className="w-4 h-4 text-emerald-600" />
            <span>Special FEVIQO Promotion</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Want a mystery gift?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Unlock an instant $200 exclusive voucher for your video editing subscription.
          </p>
        </div>

        <div className="w-full md:w-auto">
          {state === 'idle' && (
            <button
              onClick={handleStart}
              className="w-full md:w-auto px-6 py-3.5 rounded-xl brand-green-btn font-semibold text-sm shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              <span>Yes please</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {state === 'form' && (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl brand-green-btn font-semibold text-sm cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-all"
              >
                <span>Claim</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {state === 'done' && (
            <div className="flex flex-col items-start md:items-end gap-1.5">
              <button
                onClick={handleCopyCode}
                className="px-5 py-3 rounded-xl border border-dashed border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-slate-900 font-mono text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md transition"
                title="Click to copy coupon code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-600" />}
                <span>Code: <strong className="text-emerald-700">FEVIQO200</strong></span>
                <span className="text-[11px] font-sans font-normal text-slate-600 ml-1">
                  ({copied ? 'Copied!' : 'Click to copy'})
                </span>
              </button>
              <div className="text-[11px] text-emerald-700 font-medium">
                Applied to any dedicated video editor subscription!
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-500 mt-1.5">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};


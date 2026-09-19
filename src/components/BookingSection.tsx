import React from 'react';
import { Calendar, Star, Heart } from 'lucide-react';

interface BookingSectionProps {
  onBookCall: () => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({ onBookCall }) => {
  return (
    <section id="consultation" className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background ambient radiant glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-r from-emerald-100/30 via-green-50/40 to-teal-50/30 blur-[170px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Prominent Container Box */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 md:p-16 text-center flex flex-col items-center shadow-xl shadow-slate-200/40">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">
            Got <span className="green-gradient-text">Questions?</span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-10 font-normal">
            Book a 1-on-1 strategy chat with one of our senior producers. No pushy sales pitch, just honest guidance to match you with your dedicated FEVIQO video editor.
          </p>

          {/* Large Prominent CTA Button */}
          <button
            onClick={onBookCall}
            className="w-full sm:w-auto px-12 py-6 sm:px-16 sm:py-6 rounded-2xl brand-green-btn font-black text-xl sm:text-2xl shadow-2xl shadow-emerald-500/35 cursor-pointer flex items-center justify-center gap-3.5 mb-10 group hover:scale-[1.03] transition-all"
          >
            <Calendar className="w-7 h-7" />
            <span>Schedule Free Strategy Chat</span>
          </button>

          {/* Rating Proof footer */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-200/80 text-sm sm:text-base text-slate-500">
            <div className="flex items-center gap-2 text-rose-500 font-bold">
              <Heart className="w-5 h-5 fill-current" />
              <span>Creators love FEVIQO &lt;3</span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <div className="flex items-center gap-2">
              <div className="flex text-[#22C55E] gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#22C55E] text-[#22C55E]" />
                ))}
              </div>
              <span className="font-black text-slate-900">4.9</span>
              <span>• Reviews 75 • <strong className="text-emerald-700 font-black">Excellent</strong></span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};



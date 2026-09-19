import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/websiteData';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-gradient-to-b from-white via-slate-50/40 to-white relative overflow-hidden">
      {/* Soft radiant ambient glow with no straight dividing lines */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-emerald-100/30 via-green-50/40 to-teal-50/30 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center -skew-x-[22deg] bg-emerald-100 border border-emerald-200 px-4 py-1.5 mb-3 shadow-xs shrink-0">
            <span className="skew-x-[22deg] inline-flex items-center gap-2 text-emerald-800 text-xs font-semibold whitespace-nowrap">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Got Questions?</span>
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Frequently Asked <span className="green-gradient-text">Questions</span>
          </h2>
        </div>

        {/* Seamless Blended Accordion Items without heavy boxes */}
        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.id}
                className={`rounded-2xl transition-all duration-300 ${
                  isOpen
                    ? 'bg-white border border-emerald-300 shadow-xl shadow-emerald-500/5'
                    : 'bg-white/70 hover:bg-white border border-slate-200/70 hover:border-slate-300 shadow-sm'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer transition"
                  aria-expanded={isOpen}
                >
                  <span className={`font-bold text-base sm:text-lg transition-colors ${isOpen ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {item.question}
                  </span>
                  <div className={`p-2 rounded-xl shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100/80 whitespace-pre-line animate-in fade-in duration-300 font-normal">
                    <p>{item.answer}</p>
                    {item.bulletPoints && (
                      <ul className="mt-4 space-y-2">
                        {item.bulletPoints.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


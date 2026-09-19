import React from 'react';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';

interface TopAlertBarProps {
  onBookCall: () => void;
}

export const TopAlertBar: React.FC<TopAlertBarProps> = ({ onBookCall }) => {
  return (
    <aside 
      id="top-alert-bar" 
      aria-label="Limited availability alert" 
      className="relative bg-[#DBFF4C] text-black text-xs sm:text-sm font-medium py-2.5 px-4 z-40 shadow-xs border-b border-black/10 overflow-hidden"
    >
      {/* Continuous Loop Shimmering Light Sweep */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'alertShimmer 3s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes alertShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes gentleBounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
      `}</style>

      <div className="relative max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center flex-wrap z-10">
        {/* Animated Highlighted Text */}
        <div className="inline-flex items-center gap-1 font-extrabold text-black tracking-tight">
          <Sparkles className="w-3.5 h-3.5 text-black shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <span>5 dedicated editor spots open this week.</span>
        </div>

        {/* Animated Action Button */}
        <button
          onClick={onBookCall}
          className="group inline-flex items-center gap-1 font-bold underline decoration-black/40 hover:decoration-black transition cursor-pointer text-black hover:opacity-90"
        >
          <span>Book a call to reserve</span>
          <ArrowRight 
            className="w-3.5 h-3.5 ml-0.5 inline transition-transform group-hover:translate-x-1" 
            style={{ animation: 'gentleBounce 2s infinite ease-in-out' }}
          />
        </button>
      </div>
    </aside>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { AppRoute } from '../types';

interface SolutionsSwitcherProps {
  activeTab: 'creators' | 'business' | 'agencies';
  onSelectTab: (tab: 'creators' | 'business' | 'agencies') => void;
}

const TABS: { id: 'creators' | 'business' | 'agencies'; label: string }[] = [
  { id: 'creators', label: 'For Creators' },
  { id: 'business', label: 'For Business Owners' },
  { id: 'agencies', label: 'For Marketing Agencies' },
];

export const SolutionsSwitcher: React.FC<SolutionsSwitcherProps> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="pt-8 sm:pt-12 pb-4 flex justify-center px-4">
      <div 
        role="tablist" 
        aria-label="Solutions target audience"
        className="inline-flex p-1.5 rounded-full bg-slate-100 border border-slate-200/80 relative shadow-inner"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectTab(tab.id)}
              className={`relative px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 z-10 cursor-pointer ${
                isActive ? 'text-slate-950 font-black' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="solution-active-pill"
                  className="absolute inset-0 bg-[#22C55E] rounded-full shadow-md shadow-[#22C55E]/25 z-[-1]"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

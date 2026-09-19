import React, { useState } from 'react';
import { UploadCloud, MessageSquare, DownloadCloud, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onGetStarted: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onGetStarted }) => {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);

  const tabs = [
    {
      id: 1 as const,
      title: '1. Request',
      subtitle: 'Submit video order directly into FEVIQO Studio.',
      icon: UploadCloud,
      description: 'Upload raw footage, add instructions or reference links, and click submit. Your dedicated FEVIQO editor starts immediately.',
    },
    {
      id: 2 as const,
      title: '2. Review',
      subtitle: 'Give feedback and request real-time re-edits.',
      icon: MessageSquare,
      description: 'Review your initial draft inside FEVIQO with timestamped comments and live sync with your editor for fast, precise iterations.',
    },
    {
      id: 3 as const,
      title: '3. Download',
      subtitle: 'Get final videos in any format with zero delay.',
      icon: DownloadCloud,
      description: 'Export pristine master 4K files formatted for YouTube, Reels, TikTok, LinkedIn, or TV ads with all project source files included.',
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-gradient-to-b from-white via-slate-50/50 to-emerald-50/30 border-t border-slate-200/60 relative">
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-to-r from-emerald-200/20 to-teal-100/30 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-600 mb-2">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Request video edits using <br />
            <span className="green-gradient-text">all-in-one FEVIQO platform</span>
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto mb-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-500/10 translate-y-[-2px] ring-2 ring-emerald-500/20'
                    : 'bg-white/60 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-base sm:text-lg font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                    {tab.title}
                  </span>
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-snug">
                  {tab.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="max-w-4xl mx-auto bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-100 backdrop-blur-xl">
          <div className="w-full rounded-2xl overflow-hidden bg-[#061D12] border border-[#143B27] relative shadow-2xl aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center p-4 sm:p-8 text-white">
            
            {activeTab === 1 && (
              <div className="w-full max-w-xl bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                    <span className="text-xs sm:text-sm font-bold tracking-tight text-white">FEVIQO Studio — New Project Brief</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">Auto-Assigned</span>
                </div>
                <div className="space-y-3 text-left">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Project Title</label>
                    <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium">
                      High-Retention UGC Hook — 9:16 Vertical Cut
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-[11px] text-emerald-300 font-bold text-center">
                      9:16 Shorts
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-center">
                      16:9 YouTube
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-center">
                      4:5 Feed Ad
                    </div>
                  </div>
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-950/50">
                    <UploadCloud className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-300">RawFootage_Take1_4K.mov (480 MB)</p>
                    <p className="text-[10px] text-slate-500">Ready for instant edit • Assigned to your dedicated editor</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="w-full max-w-xl bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-[#22C55E] animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold tracking-tight text-white">Live Review & Timecode Notes</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">Draft 1 Ready</span>
                </div>
                <div className="space-y-3 text-left">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="px-2 py-1 rounded bg-emerald-900/60 text-emerald-400 font-mono text-[11px] font-bold">00:04</span>
                    <div>
                      <p className="text-xs text-white font-semibold">"Punch in 120% zoom on the hook sentence"</p>
                      <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Applied by Editor • Re-rendered in 14 mins</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="px-2 py-1 rounded bg-emerald-900/60 text-emerald-400 font-mono text-[11px] font-bold">00:18</span>
                    <div>
                      <p className="text-xs text-white font-semibold">"Add cinematic sound effect 'whoosh' on text reveal"</p>
                      <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Applied by Editor • Audio mixed at -6dB</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-300">Request Tweak</button>
                    <button className="px-4 py-1.5 rounded-lg bg-[#22C55E] text-xs font-black text-slate-950 shadow-md">Approve Final Cut</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="w-full max-w-xl bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                    <span className="text-xs sm:text-sm font-bold tracking-tight text-white">Deliverable Vault — Ready to Publish</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">100% Complete</span>
                </div>
                <div className="space-y-2.5 text-left">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <DownloadCloud className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs text-white font-bold">Master_4K_ProRes_9x16.mov</div>
                        <div className="text-[10px] text-slate-500">Uncompressed 4K Master • 1.2 GB</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs">Download</button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <DownloadCloud className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs text-white font-bold">Social_Optimized_1080p_H264.mp4</div>
                        <div className="text-[10px] text-slate-500">Fast Upload for TikTok & Reels • 42 MB</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs">Download</button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <DownloadCloud className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs text-white font-bold">Captions_BurnedIn_&_SRT.zip</div>
                        <div className="text-[10px] text-slate-500">Synchronized Kinetic SRT Subtitles • 1.4 MB</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs">Download</button>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>{currentTab.title} — {currentTab.subtitle}</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              {currentTab.description}
            </p>
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 py-3 rounded-xl brand-green-btn font-bold text-sm shadow-lg shadow-emerald-500/20 cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 hover:scale-[1.02] transition-all"
            >
              <span>Get Started with FEVIQO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};


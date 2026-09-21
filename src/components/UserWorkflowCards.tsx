import React from 'react';
import { 
  Download, Play, Pause, SkipBack, SkipForward, Send, PhoneCall, 
  Check, Heart, Sparkles, MessageCircle, Share2, Youtube, Instagram, Facebook 
} from 'lucide-react';

/**
 * 1st Picture: "I need a video editor"
 * Matches `1st image.jpeg` uploaded by the user
 */
export const Step1NeedEditorCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#112A1F] to-[#0A1812] border-2 border-emerald-500/50 shadow-2xl p-4 sm:p-6 flex flex-col justify-between aspect-[4/3] sm:aspect-[16/10] ${className}`}>
      
      {/* Background Graphic / Photo - Uses exact local project image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/1st-image.jpeg"
          alt="Creator with laptop on yellow chair"
          className="w-full h-full object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061A12] via-black/30 to-black/50" />
      </div>

      {/* Top Headline Matching Uploaded Graphic */}
      <div className="relative z-10 text-center sm:text-left pt-2 sm:pt-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-400/40 mb-2">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Step 01 • Instant Request</span>
        </div>
        <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          "I need a video editor"
        </h3>
      </div>

      {/* Bottom Video Player Frame & Action Bar */}
      <div className="relative z-10 space-y-3 pt-4">
        {/* Scrubber progress bar */}
        <div className="bg-black/70 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center hover:bg-emerald-400 transition cursor-pointer shadow">
              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
            </button>
            <div className="flex-1">
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden relative">
                <div className="bg-emerald-400 h-full w-[65%] rounded-full shadow-[0_0_12px_#34D399]" />
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-white/90">01:24 / 02:08</span>
          </div>
        </div>

        {/* 3 Circular / Pill action controls matching the uploaded screenshot */}
        <div className="flex items-center justify-between gap-2 px-1">
          {/* Download button */}
          <button className="p-3 rounded-full bg-black/75 backdrop-blur-md text-white hover:text-emerald-400 border border-white/15 shadow hover:scale-105 transition cursor-pointer">
            <Download className="w-4 h-4" />
          </button>

          {/* Player controls */}
          <div className="flex items-center gap-4 px-5 py-2.5 rounded-full bg-black/75 backdrop-blur-md text-white border border-white/15 shadow">
            <SkipBack className="w-4 h-4 text-white/70 hover:text-white cursor-pointer" />
            <Pause className="w-4 h-4 fill-white cursor-pointer" />
            <SkipForward className="w-4 h-4 text-white/70 hover:text-white cursor-pointer" />
          </div>

          {/* Send / Paper airplane */}
          <button className="p-3 rounded-full bg-black/75 backdrop-blur-md text-emerald-400 border border-white/15 shadow hover:scale-105 transition cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

/**
 * 2nd Picture: "Video editor is calling" & "Download 4 files"
 * Matches `2nd.jpeg` uploaded by the user
 */
export const Step2EditorCallingCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative rounded-3xl overflow-hidden bg-[#0A1812] border-2 border-emerald-500/50 shadow-2xl p-4 sm:p-6 flex flex-col justify-between aspect-[4/3] sm:aspect-[16/10] ${className}`}>
      
      {/* Background Graphic / Photo - Uses exact local project image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/2nd.jpeg"
          alt="Woman in green shirt"
          className="w-full h-full object-cover object-right opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061810] via-[#061810]/70 to-transparent" />
      </div>

      {/* Top Tag */}
      <div className="relative z-10">
        <div className="inline-block px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-400/40 mb-2">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Step 02 • Active Collaboration</span>
        </div>
      </div>

      {/* Left Sidebar: 4 Floating Video File Cards Matching 2nd.jpeg */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-6 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 shadow hover:border-emerald-400/60 transition group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xs">
                  MP4
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                    Video_cut_0{i}.mp4
                  </div>
                  <div className="text-[10px] text-white/50">4K 60fps • 142 MB</div>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                <Download className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Right / Bottom: "Video editor is calling" & "Download 4 files" */}
        <div className="sm:col-span-6 flex flex-col items-end gap-2.5 pt-2 sm:pt-0">
          
          {/* Incoming Call Notification Bubble */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-emerald-950/90 backdrop-blur-xl border border-emerald-400 text-white shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-left pr-2">
              <div className="text-xs font-black text-white">Video editor is calling</div>
              <div className="text-[10px] text-emerald-300">Live review sync ready</div>
            </div>
          </div>

          {/* Green "Download 4 files" CTA Button */}
          <button className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition hover:scale-[1.02]">
            <Download className="w-4 h-4 stroke-[3]" />
            <span>Download 4 files</span>
          </button>

        </div>
      </div>

    </div>
  );
};

/**
 * 3rd Picture: "John: I freakin' LOVE IT!! Thank you ❤️"
 * Matches `3rd.jpeg` uploaded by the user
 */
export const Step3JohnReviewCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative rounded-3xl overflow-hidden bg-[#0A1812] border-2 border-emerald-500/50 shadow-2xl p-4 sm:p-6 flex flex-col justify-between aspect-[4/3] sm:aspect-[16/10] ${className}`}>
      
      {/* Background Graphic / Photo - Uses exact local project image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/3rd.jpeg"
          alt="Young man smiling with sneaker"
          className="w-full h-full object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061810] via-black/30 to-black/40" />
      </div>

      {/* Top Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-block px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-400/40">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Step 03 • Approval & Love</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center gap-1 shadow">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>Cut Approved</span>
        </div>
      </div>

      {/* Center: John's Speech / Comment Bubble Matching 3rd.jpeg */}
      <div className="relative z-10 max-w-sm mx-auto my-auto w-full">
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-100 relative">
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
              J
            </div>
            <div>
              <div className="text-sm font-black text-slate-950">John</div>
              <div className="text-[10px] text-slate-500">Brand Founder • 2 mins ago</div>
            </div>
          </div>

          <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
            I freakin' <span className="text-[#22C55E]">LOVE IT!!</span> Thank you ❤️
          </p>

          {/* Speech bubble pointer triangle */}
          <div className="absolute -bottom-2.5 left-10 w-5 h-5 bg-white rotate-45 border-r border-b border-slate-100" />
        </div>
      </div>

      {/* Bottom Video Progress Scrubber + Social Channels Bar */}
      <div className="relative z-10 space-y-3">
        {/* Scrubber bar with 3 pins */}
        <div className="bg-black/70 backdrop-blur-md rounded-2xl p-3 border border-white/15">
          <div className="relative w-full bg-white/25 h-2 rounded-full mb-1">
            <div className="bg-[#22C55E] h-full w-3/4 rounded-full" />
            {/* Timestamp Pins */}
            <div className="absolute left-[25%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-500 shadow" />
            <div className="absolute left-[50%] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg animate-pulse" />
            <div className="absolute left-[75%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-500 shadow" />
          </div>
          <div className="flex justify-between text-[10px] text-white/70 font-mono">
            <span>00:15 Intro hook</span>
            <span className="text-emerald-400 font-bold">00:45 Sneaker unboxing (Approved)</span>
            <span>01:10 Outro CTA</span>
          </div>
        </div>

        {/* Bottom Social Icons Pill (YouTube, Instagram, Facebook, TikTok, Vimeo) */}
        <div className="flex items-center justify-center gap-5 sm:gap-8 px-6 py-2.5 rounded-full bg-black/85 backdrop-blur-xl border border-white/15 shadow-xl max-w-md mx-auto">
          <span className="text-xs font-bold text-white/80 hidden sm:inline">Publish to:</span>
          <div className="flex items-center gap-4 text-white">
            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white" title="YouTube">
              <Youtube className="w-3.5 h-3.5" />
            </div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white" title="Instagram">
              <Instagram className="w-3.5 h-3.5" />
            </div>
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white" title="Facebook">
              <Facebook className="w-3.5 h-3.5" />
            </div>
            <div className="w-6 h-6 rounded-full bg-black border border-white/40 flex items-center justify-center text-white text-[9px] font-black" title="TikTok">
              TT
            </div>
            <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-[9px] font-black" title="Vimeo">
              V
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

/**
 * 4th Picture: Multi-Platform Reach
 * Matches `last.jpeg` uploaded by the user
 */
export const Step4MultiPlatformCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative rounded-3xl overflow-hidden bg-[#0A1812] border-2 border-emerald-500/50 shadow-2xl p-4 sm:p-6 flex flex-col justify-between aspect-[4/3] sm:aspect-[16/10] ${className}`}>
      
      {/* Background Graphic / Photo - Uses exact local project image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/last.jpeg"
          alt="Woman in green with curly hair"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061810] via-emerald-950/30 to-black/40" />
      </div>

      {/* Floating Badges Matching last.jpeg: YouTube, TikTok, Meta */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-3">
          {/* YouTube Badge */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-white/40 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center">
              <Youtube className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-slate-900">YouTube 4K</span>
          </div>

          {/* TikTok Badge */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-white/40">
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black">
              TT
            </div>
            <span className="text-xs font-black text-slate-900">TikTok Viral 9:16</span>
          </div>
        </div>

        {/* Meta / Instagram Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-white/40">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
            M
          </div>
          <span className="text-xs font-black text-slate-900">Meta Ads & Reels</span>
        </div>
      </div>

      {/* Bottom Scrubber Bar Matching last.jpeg */}
      <div className="relative z-10">
        <div className="bg-black/75 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/15 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Pause className="w-4 h-4 fill-slate-950" />
            </div>
            <div className="flex-1">
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden relative">
                <div className="bg-[#22C55E] h-full w-[85%] rounded-full shadow-[0_0_14px_#22C55E]" />
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-white">00:58 / 01:00</span>
          </div>
        </div>
      </div>

    </div>
  );
};

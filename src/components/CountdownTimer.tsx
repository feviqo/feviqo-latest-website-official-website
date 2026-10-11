import React, { useState, useEffect } from 'react';
import { Play, Bell, Check, Sparkles } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string; // ISO string e.g. "2026-10-16T04:00:00.000Z"
  episodeTitle: string;
  seriesName: string;
  episodeNumber: number | string;
  backdropUrl?: string;
  onPlayClick?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function calculateTimeLeft(targetIso: string): TimeLeft {
  const difference = new Date(targetIso).getTime() - new Date().getTime();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    totalMs: difference
  };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  episodeTitle,
  seriesName,
  episodeNumber,
  backdropUrl,
  onPlayClick
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft(targetDate);
      setTimeLeft(updated);
      if (updated.totalMs <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const isReleased = timeLeft.totalMs <= 0;

  const formattedDate = new Date(targetDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden select-none bg-slate-950 text-white min-h-[320px] sm:min-h-[420px] flex items-center justify-center">
      {/* Blurred Heavy Thumbnail Background */}
      {backdropUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 filter blur-xl opacity-40 transition-all duration-700 pointer-events-none"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}

      {/* Dark Gradient Overlay for Maximum Visual Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-slate-950/70 pointer-events-none" />

      {/* Ambient Glow accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#22C55E]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 p-6 sm:p-12 flex flex-col items-center text-center space-y-6 sm:space-y-8 w-full max-w-4xl mx-auto">
        
        {/* Pulsing Premiere Badge */}
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-400 text-[11px] sm:text-xs font-black tracking-widest uppercase backdrop-blur-md shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]"></span>
          </span>
          <span>{isReleased ? 'OFFICIAL PREMIERE LIVE NOW' : 'OFFICIAL UPCOMING PREMIERE'}</span>
        </div>

        {/* Title Header */}
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
            {seriesName} Episode {episodeNumber}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide">
            {isReleased 
              ? 'The full episode is now available in 1080p HD with Urdu Subtitles.' 
              : `Premiere Scheduled: ${formattedDate}`}
          </p>
        </div>

        {/* ULTRA-PREMIUM BOXLESS CINEMATIC TIMER (No solid boxes, Apple-style typography) */}
        {!isReleased ? (
          <div className="flex items-center justify-center gap-2 sm:gap-8 text-white pt-2 pb-2 tracking-normal sm:tracking-widest">
            {/* Days */}
            <div className="flex flex-col items-center min-w-[55px] sm:min-w-[90px]">
              <span className="font-sans font-thin text-3xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-wider sm:tracking-widest drop-shadow-lg">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.2em] sm:tracking-[0.25em] text-slate-400 uppercase mt-1 sm:mt-3">
                Days
              </span>
            </div>

            <span className="text-emerald-500 text-2xl sm:text-5xl font-extralight self-start mt-1 sm:mt-3 animate-pulse">:</span>

            {/* Hours */}
            <div className="flex flex-col items-center min-w-[55px] sm:min-w-[90px]">
              <span className="font-sans font-thin text-3xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-wider sm:tracking-widest drop-shadow-lg">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.2em] sm:tracking-[0.25em] text-slate-400 uppercase mt-1 sm:mt-3">
                Hours
              </span>
            </div>

            <span className="text-emerald-500 text-2xl sm:text-5xl font-extralight self-start mt-1 sm:mt-3 animate-pulse">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center min-w-[55px] sm:min-w-[90px]">
              <span className="font-sans font-thin text-3xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-wider sm:tracking-widest drop-shadow-lg">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.2em] sm:tracking-[0.25em] text-slate-400 uppercase mt-1 sm:mt-3">
                Minutes
              </span>
            </div>

            <span className="text-emerald-500 text-2xl sm:text-5xl font-extralight self-start mt-1 sm:mt-3 animate-pulse">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center min-w-[55px] sm:min-w-[90px]">
              <span className="font-sans font-light text-3xl sm:text-7xl text-[#22C55E] tracking-wider sm:tracking-widest drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.2em] sm:tracking-[0.25em] text-[#22C55E] uppercase mt-1 sm:mt-3">
                Seconds
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={onPlayClick}
              className="px-8 py-4 bg-[#22C55E] hover:bg-emerald-500 text-slate-950 font-black text-sm tracking-wide rounded-2xl transition duration-200 flex items-center justify-center gap-3 shadow-xl hover:scale-105 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current text-slate-950" />
              <span>WATCH FULL EPISODE NOW (HD 1080P)</span>
            </button>
          </div>
        )}

        {/* Action Button */}
        {!isReleased && (
          <div className="pt-2">
            <button
              onClick={() => setNotified(true)}
              className="px-6 py-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-xs tracking-wide transition inline-flex items-center gap-2 cursor-pointer backdrop-blur-md shadow-md"
            >
              {notified ? (
                <>
                  <Check className="w-4 h-4 text-[#22C55E]" />
                  <span>Reminder Active for Episode {episodeNumber}</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>Notify Me on Release</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

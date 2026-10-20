import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  Maximize2, Minimize, Clock, MessageSquare, Download, Check, 
  Sparkles, Pin, Settings, Upload, CheckCircle2, AlertCircle,
  Film, Layers, Send, ChevronDown
} from 'lucide-react';
import { ProjectRevisionNote, RawFootageFile } from '../../types';
import { resolveDirectVideoSource } from '../NativeVideoPlayer';
import { extractDriveId, buildGoogleDrivePreviewUrl } from '../../utils/videoResolver';

export interface PersonalizedVideoPlayerProps {
  projectTitle: string;
  revisionNotes: ProjectRevisionNote[];
  onAddTimestampedNote?: (timestamp: string, noteText: string) => void;
  onSelectTimestamp?: (timestamp: string) => void;
  userRole?: 'client' | 'editor' | 'admin';
  userName?: string;
  isDelivered?: boolean;
  videoUrl?: string;
  rawFootageFiles?: RawFootageFile[];
  deliveredVideoUrl?: string;
}

export const PersonalizedVideoPlayer: React.FC<PersonalizedVideoPlayerProps> = ({
  projectTitle,
  revisionNotes,
  onAddTimestampedNote,
  onSelectTimestamp,
  userRole = 'client',
  userName = 'Client',
  isDelivered = true,
  videoUrl,
  rawFootageFiles = [],
  deliveredVideoUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default video sources
  const DEFAULT_SAMPLE_VIDEO = 'https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8';
  
  // Local uploaded/selected video URL (allows client/editor to test any real video file)
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('Master Production Cut (v1)');

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVertical, setIsVertical] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [activePinTooltip, setActivePinTooltip] = useState<ProjectRevisionNote | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);

  // Determine active video source
  const rawUrl = 
    localVideoUrl ||
    deliveredVideoUrl ||
    videoUrl ||
    (rawFootageFiles.length > 0 && rawFootageFiles[0].blobUrl) ||
    DEFAULT_SAMPLE_VIDEO;

  // Resolve to unbranded direct MP4/stream (no Vimeo branding)
  const effectiveVideoUrl = resolveDirectVideoSource(rawUrl);
  const [activeVideoSrc, setActiveVideoSrc] = useState(effectiveVideoUrl);

  useEffect(() => {
    setActiveVideoSrc(resolveDirectVideoSource(rawUrl));
  }, [rawUrl]);

  // Check if current source is Google Drive or YouTube
  const driveId = extractDriveId(rawUrl);
  const isVimeo = false;
  const isYouTube = !driveId && (effectiveVideoUrl.includes('youtube.com') || effectiveVideoUrl.includes('youtu.be'));

  // Extract Vimeo ID if applicable
  const getVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    return match ? match[1] : '1225114561';
  };

  // Helper: Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Helper: Parse mm:ss to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 0;
  };

  // Handle Play / Pause Toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  // Video element event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const onEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onEnded);
    };
  }, [effectiveVideoUrl]);

  // Handle Seek via Timeline Click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !videoRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.width - rect.left + rect.width));
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSeconds = pct * (duration || 60);
    
    videoRef.current.currentTime = targetSeconds;
    setCurrentTime(targetSeconds);
  };

  // Handle Timeline Hover
  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const xPos = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const pct = xPos / rect.width;
    
    setHoverPosition(pct * 100);
    setHoverTime(pct * (duration || 60));
  };

  const handleTimelineMouseLeave = () => {
    setHoverTime(null);
  };

  // Skip time forward or backward
  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration || 100, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Change Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Change Playback Speed
  const handleSetSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setIsSpeedMenuOpen(false);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  // Handle local video file upload (from desktop/phone)
  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setLocalVideoUrl(url);
    setSelectedFileName(file.name);
    setToastMsg(`Loaded video: "${file.name}"! Ready to play.`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Add Timestamped Revision Note
  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    const currentCode = formatTime(currentTime);
    if (onAddTimestampedNote) {
      onAddTimestampedNote(currentCode, noteInput.trim());
    }
    setNoteInput('');
    setToastMsg(`Pinned note at ${currentCode}: "${noteInput.trim()}"`);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Quick preset feedback tag insertion
  const handleInsertTag = (tagText: string) => {
    setNoteInput((prev) => (prev ? `${prev} • ${tagText}` : tagText));
  };

  // Seek to specific note timestamp
  const handleSeekToNote = (timestamp: string) => {
    const targetSeconds = parseTimeToSeconds(timestamp);
    if (videoRef.current) {
      videoRef.current.currentTime = targetSeconds;
      setCurrentTime(targetSeconds);
      if (!isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
    if (onSelectTimestamp) {
      onSelectTimestamp(timestamp);
    }
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-950 text-white border border-[#22C55E]/40 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hidden File Picker for Local Video Loading */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilePicked}
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
        className="hidden"
      />

      {/* Player Header & Video Source Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <Film className="w-4 h-4 text-[#22C55E]" />
          <span className="font-extrabold text-slate-200">Active Reel:</span>
          
          {/* Source Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setIsSourceMenuOpen(!isSourceMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 transition cursor-pointer"
            >
              <span className="truncate max-w-[160px] sm:max-w-[220px]">{selectedFileName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isSourceMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-950 border border-slate-800 rounded-xl p-1.5 shadow-2xl z-50 space-y-1">
                <button
                  onClick={() => {
                    setLocalVideoUrl(null);
                    setSelectedFileName('Master Production Cut (v1)');
                    setIsSourceMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center justify-between"
                >
                  <span>Master Cut (v1)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Delivered</span>
                </button>

                {rawFootageFiles.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (file.blobUrl) {
                        setLocalVideoUrl(file.blobUrl);
                      }
                      setSelectedFileName(file.name);
                      setIsSourceMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center justify-between"
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400">{file.size}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Upload / Select Video Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Select a video file from your computer to play in player"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Select Local Video to Play</span>
          </button>
        </div>
      </div>

      {/* 
        ==================================================
        YOUTUBE / FRAME.IO ULTRA-PREMIUM VIDEO PLAYER CONTAINER
        ==================================================
      */}
      <div 
        ref={containerRef}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        className={`relative ${isVertical ? 'aspect-[9/16] max-w-[360px] max-h-[620px]' : 'aspect-video w-full'} mx-auto rounded-3xl overflow-hidden bg-black shadow-2xl group select-none flex items-center justify-center transition-all duration-300`}
      >
        {/* Standardized HTML5 4K Master Video Element or Google Drive Embed */}
        {driveId ? (
          <div className={`w-full h-full relative ${isVertical ? 'gdrive-reel-wrapper' : 'gdrive-frame-wrapper'}`}>
            <iframe
              src={buildGoogleDrivePreviewUrl(driveId, false)}
              title={projectTitle || 'FEVIQO Deliverable Review'}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              loading="eager"
              className="w-full h-full border-0 block"
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={activeVideoSrc}
            onClick={togglePlay}
            onError={() => {
              if (activeVideoSrc !== '/videos/Sequence-01.mp4') {
                setActiveVideoSrc('/videos/Sequence-01.mp4');
              }
            }}
            className="w-full h-full object-contain cursor-pointer block mx-auto my-auto"
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
                if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
                  setIsVertical(videoRef.current.videoHeight > videoRef.current.videoWidth);
                }
              }
            }}
            playsInline
            preload="metadata"
          />
        )}

        {/* Center Animated Play / Pause Ripple Overlay on Click (Native Video only) */}
        {!driveId && (
          <div 
            onClick={togglePlay}
            className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity duration-300 ${
              isPlaying ? 'opacity-0 pointer-events-none hover:opacity-100 hover:pointer-events-auto bg-black/20' : 'opacity-100 bg-black/40'
            }`}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/60 backdrop-blur-md border-2 border-white/40 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:border-[#22C55E] hover:text-[#22C55E] transition-all">
              {isPlaying ? (
                <Pause className="w-10 h-10 fill-current" />
              ) : (
                <Play className="w-10 h-10 fill-current ml-1" />
              )}
            </div>
          </div>
        )}

        {/* Top Floating Badge Bar (Quality & Status) */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold text-white shadow">
              4K ProRes 60fps
            </span>
            <button
              type="button"
              onClick={() => setIsVertical(v => !v)}
              className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold text-white hover:text-[#22C55E] shadow cursor-pointer transition flex items-center gap-1"
              title="Toggle Aspect Ratio (16:9 / 9:16)"
            >
              <span>{isVertical ? '9:16 Reel' : '16:9 Wide'}</span>
            </button>
            <span className="hidden sm:flex px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[11px] font-bold text-emerald-400 shadow items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>FEVIQO Sync Ready</span>
            </span>
          </div>

          <div className="pointer-events-auto">
            <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-bold text-slate-300 shadow">
              {revisionNotes.length} Feedback Pins
            </span>
          </div>
        </div>

        {/* 
          ==================================================
          BOTTOM FLOATING GLASS CONTROL BAR (YOUTUBE / VIMEO GRADE)
          ==================================================
        */}
        {!isVimeo && !isYouTube && !driveId && (
          <div 
            className={`absolute bottom-0 inset-x-0 z-30 pt-10 pb-4 px-4 sm:px-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-200 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* 1. Precision Timeline Scrubber with Pinned Markers */}
            <div 
              ref={timelineRef}
              onClick={handleTimelineClick}
              onMouseMove={handleTimelineMouseMove}
              onMouseLeave={handleTimelineMouseLeave}
              className="relative w-full h-3 flex items-center cursor-pointer group/timeline mb-3"
            >
              {/* Scrubber track background */}
              <div className="w-full h-1.5 bg-white/25 rounded-full overflow-hidden relative group-hover/timeline:h-2.5 transition-all">
                {/* Active progress bar */}
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#22C55E] rounded-full relative"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Glowing scrubber handle ball */}
              <div 
                className="absolute w-4 h-4 rounded-full bg-white border-2 border-[#22C55E] shadow-[0_0_10px_#22C55E] -translate-x-1/2 pointer-events-none group-hover/timeline:scale-125 transition-transform"
                style={{ left: `${progressPct}%` }}
              />

              {/* Hover Timestamp Preview Thumbnail / Bubble */}
              {hoverTime !== null && (
                <div 
                  className="absolute bottom-5 -translate-x-1/2 bg-slate-900 text-white px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-mono font-bold shadow-xl pointer-events-none"
                  style={{ left: `${hoverPosition}%` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}

              {/* Pinned Revision Notes Markers on the timeline */}
              {revisionNotes.map((note) => {
                const noteSeconds = parseTimeToSeconds(note.timestamp);
                const notePct = duration > 0 ? (noteSeconds / duration) * 100 : 0;

                return (
                  <div
                    key={note.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSeekToNote(note.timestamp);
                    }}
                    onMouseEnter={() => setActivePinTooltip(note)}
                    onMouseLeave={() => setActivePinTooltip(null)}
                    className="absolute w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-950 shadow-md -translate-x-1/2 cursor-pointer hover:scale-150 hover:bg-amber-300 transition-all z-20"
                    style={{ left: `${notePct}%` }}
                    title={`[${note.timestamp}]: ${note.note}`}
                  />
                );
              })}

              {/* Active Pin Note Tooltip */}
              {activePinTooltip && (
                <div 
                  className="absolute bottom-6 -translate-x-1/2 bg-slate-950 text-white p-2.5 rounded-xl border border-amber-400/60 shadow-2xl text-xs max-w-xs z-40 animate-in fade-in"
                  style={{ 
                    left: `${duration > 0 ? (parseTimeToSeconds(activePinTooltip.timestamp) / duration) * 100 : 50}%` 
                  }}
                >
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <Pin className="w-3 h-3" />
                    <span>{activePinTooltip.timestamp} • {activePinTooltip.author} ({activePinTooltip.authorRole})</span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-tight font-medium">
                    {activePinTooltip.note}
                  </p>
                </div>
              )}
            </div>

            {/* 2. Control Buttons Row */}
            <div className="flex items-center justify-between text-white text-xs">
              {/* Left Controls: Play, Skip, Volume, Time */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-xl hover:bg-white/15 transition cursor-pointer text-white hover:text-[#22C55E]"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                {/* 10s Rewind */}
                <button
                  onClick={() => handleSkip(-10)}
                  className="p-1.5 rounded-xl hover:bg-white/15 transition cursor-pointer text-slate-300 hover:text-white"
                  title="Rewind 10 seconds"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* 10s Forward */}
                <button
                  onClick={() => handleSkip(10)}
                  className="p-1.5 rounded-xl hover:bg-white/15 transition cursor-pointer text-slate-300 hover:text-white"
                  title="Forward 10 seconds"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Volume & Mute */}
                <div className="flex items-center gap-2 group/volume">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-xl hover:bg-white/15 transition cursor-pointer text-slate-300 hover:text-white"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1.5 bg-white/30 rounded-full appearance-none accent-[#22C55E] cursor-pointer"
                  />
                </div>

                {/* Timecode */}
                <div className="font-mono text-xs text-slate-300 font-semibold tracking-wider">
                  <span className="text-white font-bold">{formatTime(currentTime)}</span>
                  <span className="mx-1 text-slate-500">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Controls: Speed, Fullscreen */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Playback Speed Selector */}
                <div className="relative">
                  <button
                    onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono font-bold transition cursor-pointer"
                    title="Playback Speed"
                  >
                    {playbackRate}x
                  </button>

                  {isSpeedMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-28 bg-slate-950 border border-slate-800 rounded-xl p-1 shadow-2xl z-50 space-y-0.5">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handleSetSpeed(rate)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-between ${
                            playbackRate === rate ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <span>{rate}x</span>
                          {playbackRate === rate && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-xl hover:bg-white/15 transition cursor-pointer text-slate-300 hover:text-white"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 
        ==================================================
        INLINE FRAME-BY-FRAME FEEDBACK & REVISION INPUT BAR
        Allows Client or Editor to pin notes to exact timestamp!
        ==================================================
      */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-white">
              Pin Feedback at Timecode:
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
              {formatTime(currentTime)}
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Pause video at any frame to pin precise revision instructions
          </div>
        </div>

        {/* Quick Tag Pills for Rapid Feedback */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            '🔥 Great hook pacing',
            '✂️ Trim 1.5s here',
            '🔊 Background music quieter',
            '🎨 Enhance skin tones',
            '📝 Add kinetic subtitle',
            '⚡ Increase zoom-in speed',
          ].map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleInsertTag(tag)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition cursor-pointer border border-slate-700"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Note Submit Form */}
        <form onSubmit={handleAddNoteSubmit} className="flex gap-2 pt-1">
          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder={`Add revision note at ${formatTime(currentTime)} (e.g. "Add sound effect on graphic appearance")...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#22C55E] transition"
          />
          <button
            type="submit"
            className="px-4 sm:px-6 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Pin Note</span>
          </button>
        </form>
      </div>

      {/* 
        ==================================================
        LIST OF ALL TIMESTAMPTED NOTES ON THIS CUT
        ==================================================
      */}
      {revisionNotes.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#22C55E]" />
              <span>Timeline Revision Notes ({revisionNotes.length})</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              Click any timecode badge to jump video directly to that second
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {revisionNotes.map((note) => (
              <div 
                key={note.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSeekToNote(note.timestamp)}
                      className="px-2.5 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-mono font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                      title="Seek to this moment"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{note.timestamp}</span>
                    </button>
                    <span className="font-bold text-slate-900">{note.author}</span>
                    <span className="text-[10px] text-slate-400 capitalize">({note.authorRole})</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed pl-1">{note.note}</p>
                </div>

                {note.isAddressed && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                    Addressed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

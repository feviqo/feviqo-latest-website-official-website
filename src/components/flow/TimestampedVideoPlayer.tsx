import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  Maximize2, Minimize, Clock, MessageSquare, Download, Check, 
  Sparkles, Pin, CheckCircle2, Send, ChevronDown, Tag, Trash2,
  ExternalLink, Film, Video
} from 'lucide-react';
import { ProjectRevisionNote, RawFootageFile } from '../../types';
import { resolvePlayableVideo, getCloudFootageMeta } from '../../utils/videoResolver';
import { downloadRawFile } from '../../utils/fileDownloader';

export interface TimestampedVideoPlayerProps {
  projectId: string;
  projectTitle: string;
  revisionNotes: ProjectRevisionNote[];
  onAddAnnotation: (timestamp: string, noteText: string, tag?: string) => void;
  onReplyAnnotation?: (noteId: string, replyText: string) => void;
  onDeleteAnnotation?: (noteId: string) => void;
  userRole?: 'client' | 'editor' | 'admin';
  userName?: string;
  videoUrl?: string;
  deliveredVideoUrl?: string;
  footageLink?: string;
  rawFootageFiles?: RawFootageFile[];
  onDownloadMaster?: () => void;
}

export const TimestampedVideoPlayer: React.FC<TimestampedVideoPlayerProps> = ({
  projectId,
  projectTitle,
  revisionNotes,
  onAddAnnotation,
  onReplyAnnotation,
  onDeleteAnnotation,
  userRole = 'client',
  userName = 'Client',
  videoUrl,
  deliveredVideoUrl,
  footageLink,
  rawFootageFiles = [],
  onDownloadMaster,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Default fallback sample video
  const DEFAULT_VIDEO = '/videos/Sequence-01.mp4';
  const [selectedTakeKey, setSelectedTakeKey] = useState<string>('master');
  const [isVertical, setIsVertical] = useState(false);

  // Compute cloud footage metadata (detects Google Drive, Dropbox, WeTransfer, YouTube, etc.)
  const effectiveSource = deliveredVideoUrl || footageLink || videoUrl;
  const cloudMeta = getCloudFootageMeta(effectiveSource, isVertical);

  // Compute playable source based on selected take or master
  const computeVideoSource = (takeKey: string, vertical: boolean) => {
    if (takeKey !== 'master' && rawFootageFiles && rawFootageFiles.length > 0) {
      const foundFile = rawFootageFiles.find((f) => f.name === takeKey);
      if (foundFile) {
        if (foundFile.blobUrl) return foundFile.blobUrl;
        return resolvePlayableVideo(null, foundFile.name, vertical);
      }
    }

    // If cloud footage resolver provides direct stream (e.g. Dropbox direct or Mux stream):
    if (cloudMeta.type === 'stream' && cloudMeta.streamUrl) {
      return cloudMeta.streamUrl;
    }

    // If master requested, or default fallback
    const masterTarget = deliveredVideoUrl || footageLink || videoUrl;
    if (masterTarget) {
      return resolvePlayableVideo(null, masterTarget, vertical);
    }
    // If no delivered cut yet, but client uploaded raw footage with blobUrl:
    const firstBlobFile = rawFootageFiles?.find((f) => f.blobUrl);
    if (firstBlobFile && firstBlobFile.blobUrl) {
      return firstBlobFile.blobUrl;
    }
    return resolvePlayableVideo(null, DEFAULT_VIDEO, vertical);
  };

  const initialSource = computeVideoSource('master', false);
  const [videoSrc, setVideoSrc] = useState(initialSource);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setVideoSrc(computeVideoSource(selectedTakeKey, isVertical));
  }, [deliveredVideoUrl, videoUrl, footageLink, isVertical, selectedTakeKey, rawFootageFiles]);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [activePinTooltip, setActivePinTooltip] = useState<ProjectRevisionNote | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // New Note input
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Pacing');
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [notesFilter, setNotesFilter] = useState<'all' | 'pending' | 'addressed'>('all');
  const [toastMsg, setToastMsg] = useState('');

  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Parse mm:ss to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 0;
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Frame and Time Stepping
  const handleSeekDelta = (deltaSeconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + deltaSeconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Seek to exact timestamp (e.g. from clicking pin or note card)
  const handleSeekToTimestamp = (timestampStr: string, noteId?: string) => {
    const targetSeconds = parseTimeToSeconds(timestampStr);
    if (videoRef.current) {
      videoRef.current.currentTime = targetSeconds;
      setCurrentTime(targetSeconds);
      videoRef.current.pause();
      setIsPlaying(false);
    }
    if (noteId) {
      setSelectedNoteId(noteId);
    }
    setToastMsg(`Jumped to frame ${timestampStr}`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Timeline click / drag handler
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !videoRef.current || !duration) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percent * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !duration) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverPosition(percent * 100);
    setHoverTime(percent * duration);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Add Annotation
  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const currentTimecode = formatTime(currentTime);
    onAddAnnotation(currentTimecode, newNoteText.trim(), selectedCategory);
    setNewNoteText('');
    setToastMsg(`Annotation added at ${currentTimecode}`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Handle Reply
  const handleReplySubmit = (noteId: string) => {
    const replyText = replyInputMap[noteId]?.trim();
    if (!replyText || !onReplyAnnotation) return;
    onReplyAnnotation(noteId, replyText);
    setReplyInputMap((prev) => ({ ...prev, [noteId]: '' }));
    setToastMsg('Reply posted and note marked addressed.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-950 text-white border border-[#22C55E]/40 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Video Box with Cinema Header */}
      <div 
        ref={containerRef}
        className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center w-full"
      >
        {/* Top Header info bar */}
        <div className="w-full px-5 py-3.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="font-black text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
              {projectTitle}
            </span>
            <span className="hidden sm:inline px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono font-bold">
              4K ProRes Master
            </span>
            <button
              type="button"
              onClick={() => setIsVertical(v => !v)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-[#22C55E] text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
              title="Toggle Aspect Ratio (16:9 / 9:16)"
            >
              <span>{isVertical ? '9:16 Reel' : '16:9 Wide'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono text-[11px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            {onDownloadMaster && (
              <button
                onClick={onDownloadMaster}
                className="px-3 py-1 rounded-full bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-[11px] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Master</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Footage & Real-Time Takes Switcher */}
        {rawFootageFiles && rawFootageFiles.length > 0 && (
          <div className="w-full px-4 py-2 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto text-xs">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1">
                <Film className="w-3 h-3 text-[#22C55E]" /> Track:
              </span>

              {/* Delivered Master Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTakeKey('master');
                  if (videoRef.current) videoRef.current.currentTime = 0;
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  selectedTakeKey === 'master'
                    ? 'bg-[#22C55E] text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>Master Cut</span>
              </button>

              {/* Uploaded Raw Takes */}
              {rawFootageFiles.map((file, idx) => {
                const isSelected = selectedTakeKey === file.name;
                return (
                  <div key={idx} className="flex items-center gap-1 bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTakeKey(file.name);
                        if (videoRef.current) videoRef.current.currentTime = 0;
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer max-w-[140px] truncate ${
                        isSelected
                          ? 'bg-[#22C55E] text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                      title={`Play real-time raw take: ${file.name}`}
                    >
                      <Video className="w-3 h-3 shrink-0" />
                      <span className="truncate">{file.name}</span>
                      {file.blobUrl && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Live real-time blob ready" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        downloadRawFile(file, projectTitle);
                        setToastMsg(`Downloading: ${file.name}...`);
                        setTimeout(() => setToastMsg(''), 3000);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                      title={`Download raw file (${file.size})`}
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0 hidden md:inline">
              ⚡ Real-Time Player Synced
            </span>
          </div>
        )}

        {/* Cloud Footage Linked Info Header */}
        {cloudMeta.externalUrl && (
          <div className="w-full px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-slate-400 font-medium">Footage Source:</span>
              <span className="font-semibold text-emerald-400 truncate max-w-[180px] sm:max-w-xs">{cloudMeta.label}</span>
            </div>
            <a
              href={cloudMeta.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full bg-[#22C55E] hover:bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
            >
              <span>Open in {cloudMeta.platform === 'drive' ? 'Google Drive' : cloudMeta.platform === 'dropbox' ? 'Dropbox' : cloudMeta.platform === 'wetransfer' ? 'WeTransfer' : 'Cloud'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Video Canvas Container - Centered Flexbox for both 16:9 and 9:16 */}
        <div className={`relative w-full ${isVertical ? 'aspect-[9/16] max-h-[580px] max-w-[340px]' : 'aspect-video'} bg-black flex items-center justify-center overflow-hidden group mx-auto transition-all duration-300`}>
          {cloudMeta.type === 'embed' && cloudMeta.embedUrl && selectedTakeKey === 'master' ? (
            <div className="w-full h-full min-h-[360px] sm:min-h-[460px] flex items-center justify-center bg-black">
              <iframe
                src={cloudMeta.embedUrl}
                className="w-full h-full min-h-[360px] sm:min-h-[460px] border-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title={projectTitle}
              />
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-contain cursor-pointer block mx-auto my-auto"
                onClick={togglePlay}
                onError={() => {
                  const fallback = isVertical ? '/videos/reel-talking-head.mp4' : '/videos/Sequence-01.mp4';
                  if (videoSrc !== fallback) {
                    setVideoSrc(fallback);
                  }
                }}
                onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                    if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
                      setIsVertical(videoRef.current.videoHeight > videoRef.current.videoWidth);
                    }
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                playsInline
              />

              {/* Center Play/Pause Splash icon on hover or pause */}
              {!isPlaying && (
                <div 
                  onClick={togglePlay}
                  className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer transition-opacity"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:border-[#22C55E] hover:text-[#22C55E] transition-all">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Timeline Scrubber with Annotation Pin Markers */}
        <div className="w-full px-5 pt-3 pb-2 bg-slate-900/95 border-t border-slate-800/80">
          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            onMouseMove={handleTimelineMouseMove}
            onMouseLeave={() => setHoverTime(null)}
            className="relative w-full h-4 group cursor-pointer flex items-center"
          >
            {/* Background Track */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              {/* Progress bar */}
              <div
                className="h-full bg-[#22C55E] transition-all duration-75"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Hover preview marker */}
            {hoverTime !== null && (
              <div
                className="absolute -top-7 -translate-x-1/2 bg-slate-950 border border-slate-700 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-lg pointer-events-none"
                style={{ left: `${hoverPosition}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}

            {/* Revision Note Pin Markers */}
            {revisionNotes.map((note) => {
              const noteSecs = parseTimeToSeconds(note.timestamp);
              const percent = duration ? Math.min(100, Math.max(0, (noteSecs / duration) * 100)) : 0;
              const isSelected = selectedNoteId === note.id;

              return (
                <div
                  key={note.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSeekToTimestamp(note.timestamp, note.id);
                  }}
                  onMouseEnter={() => setActivePinTooltip(note)}
                  onMouseLeave={() => setActivePinTooltip(null)}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-transform ${
                    isSelected ? 'scale-125 ring-2 ring-white' : 'hover:scale-125'
                  }`}
                  style={{ left: `${percent}%` }}
                >
                  <div
                    className={`w-3 h-3 rounded-full border-2 border-slate-950 flex items-center justify-center cursor-pointer shadow-md ${
                      note.isAddressed
                        ? 'bg-emerald-400'
                        : note.authorRole === 'editor'
                        ? 'bg-sky-400'
                        : 'bg-amber-400'
                    }`}
                  />
                </div>
              );
            })}

            {/* Pin hover tooltip */}
            {activePinTooltip && (
              <div
                className="absolute -top-12 -translate-x-1/2 bg-slate-950 border border-[#22C55E]/60 text-white text-xs px-3 py-1.5 rounded-xl shadow-2xl pointer-events-none z-30 max-w-xs whitespace-nowrap"
                style={{
                  left: `${duration ? (parseTimeToSeconds(activePinTooltip.timestamp) / duration) * 100 : 0}%`,
                }}
              >
                <div className="flex items-center gap-1.5 font-bold text-[10px]">
                  <span className="text-[#22C55E] font-mono">{activePinTooltip.timestamp}</span>
                  <span className="text-slate-400">• {activePinTooltip.author}</span>
                </div>
                <div className="text-[11px] truncate max-w-[180px] text-slate-200">
                  {activePinTooltip.note}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={() => handleSeekDelta(-5)}
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Rewind 5s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSeekDelta(5)}
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Forward 5s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-slate-800 mx-1" />

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                if (videoRef.current) {
                  videoRef.current.volume = val;
                  videoRef.current.muted = val === 0;
                  setIsMuted(val === 0);
                }
              }}
              className="w-16 sm:w-20 accent-[#22C55E] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Speed selector */}
            <div className="flex items-center gap-1 bg-slate-800/70 rounded-xl px-2 py-1 text-xs font-mono">
              {[0.5, 1, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setPlaybackRate(rate);
                    if (videoRef.current) videoRef.current.playbackRate = rate;
                  }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    playbackRate === rate ? 'bg-[#22C55E] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Timestamped Revision Notes Section */}
      {(() => {
        const filteredNotes = revisionNotes.filter((note) => {
          if (notesFilter === 'pending') return !note.isAddressed;
          if (notesFilter === 'addressed') return !!note.isAddressed;
          return true;
        });
        const pendingCount = revisionNotes.filter((n) => !n.isAddressed).length;
        const addressedCount = revisionNotes.filter((n) => !!n.isAddressed).length;

        return (
          <div className="mt-8 sm:mt-10 space-y-6">
            
            {/* Full-Width: Drop Note on Current Frame Console (Spacious & Cool) */}
            <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#15803D] shrink-0 shadow-xs">
                    <Pin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                        Drop Note on Current Frame
                      </h3>
                      <span className="px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] font-mono font-black text-xs shadow-xs">
                        @ {formatTime(currentTime)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pause at any frame to leave precise, time-synced revision instructions for your editor.
                    </p>
                  </div>
                </div>

                {/* Frame Micro-Nudge & Quick Playback Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSeekDelta(-1)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Step back 1 second"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>-1s</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSeekDelta(1)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Step forward 1 second"
                  >
                    <span>+1s</span>
                    <RotateCw className="w-3 h-3 text-slate-500" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-[#22C55E] fill-current" />
                        <span>Play</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddNoteSubmit} className="space-y-5">
                {/* Feedback Category */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Feedback Category
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Selected: <strong className="text-slate-800 font-bold">{selectedCategory}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { name: 'Pacing', icon: '⚡' },
                      { name: 'Hook Edit', icon: '🪝' },
                      { name: 'Captions', icon: '💬' },
                      { name: 'Color Grade', icon: '🎨' },
                      { name: 'Audio / SFX', icon: '🔊' },
                      { name: 'B-Roll', icon: '🎬' },
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedCategory === cat.name
                            ? 'bg-[#22C55E] text-slate-950 shadow-xs scale-105 font-black'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Revision Instructions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Specific Revision Instructions
                    </label>
                    {/* Quick Preset Tags */}
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>Quick tags:</span>
                      {[
                        'Punch-in Zoom',
                        'Remove Dead Air',
                        'Fix Caption Typo',
                        'Add Whoosh SFX',
                      ].map((quick) => (
                        <button
                          key={quick}
                          type="button"
                          onClick={() =>
                            setNewNoteText((prev) => (prev ? `${prev} • ${quick}` : quick))
                          }
                          className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                        >
                          +{quick}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder={`E.g. "At ${formatTime(currentTime)}, punch-in zoom on product packaging with subtle whoosh sound..."`}
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40 focus:border-[#22C55E] resize-none leading-relaxed transition shadow-xs"
                  />
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Sparkles className="w-4 h-4 text-[#22C55E] shrink-0" />
                    <span>Notes synchronize live between client and editor with frame-accurate timecodes.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="px-6 py-3.5 rounded-2xl bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-md hover:shadow-lg active:scale-[0.99] shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Note at {formatTime(currentTime)}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Full-Width: Timeline Annotations Feed */}
            <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Timeline Annotations ({revisionNotes.length})
                  </h3>
                </div>

                {/* Quick Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setNotesFilter('all')}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      notesFilter === 'all'
                        ? 'bg-white text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({revisionNotes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotesFilter('pending')}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      notesFilter === 'pending'
                        ? 'bg-white text-amber-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotesFilter('addressed')}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      notesFilter === 'addressed'
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Addressed ({addressedCount})
                  </button>
                </div>
              </div>

              {filteredNotes.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No revision notes found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Pause the video at any frame above and use the revision form to pin timestamped feedback.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredNotes.map((note) => {
                    const isSelected = selectedNoteId === note.id;
                    return (
                      <div
                        key={note.id}
                        onClick={() => handleSeekToTimestamp(note.timestamp, note.id)}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#22C55E] bg-emerald-50/40 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeekToTimestamp(note.timestamp, note.id);
                              }}
                              className="px-3 py-1 rounded-xl bg-slate-950 text-[#22C55E] hover:bg-black font-mono font-black text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                              title="Seek video to this timestamp"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>{note.timestamp}</span>
                            </button>
                            {note.tag && (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#15803D] border border-emerald-200 uppercase font-black tracking-wider">
                                {note.tag}
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-900">{note.author}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase font-bold">
                              {note.authorRole}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {note.isAddressed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <Check className="w-3 h-3" />
                                <span>Addressed</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Pending
                              </span>
                            )}

                            {onDeleteAnnotation && (userRole === 'admin' || note.author === userName) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteAnnotation(note.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition"
                                title="Delete note"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                          {note.note}
                        </p>

                        {/* Editor Reply Display */}
                        {note.editorReply && (
                          <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-900">Editor Resolution: </span>
                              <span className="text-slate-600 leading-relaxed">{note.editorReply}</span>
                            </div>
                          </div>
                        )}

                        {/* Editor Reply Input Form (For Editor / Admin role) */}
                        {(userRole === 'editor' || userRole === 'admin') && !note.isAddressed && (
                          <div 
                            onClick={(e) => e.stopPropagation()} 
                            className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={replyInputMap[note.id] || ''}
                              onChange={(e) =>
                                setReplyInputMap((prev) => ({ ...prev, [note.id]: e.target.value }))
                              }
                              placeholder="Reply to client & mark resolved..."
                              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]"
                            />
                            <button
                              type="button"
                              onClick={() => handleReplySubmit(note.id)}
                              className="px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-xs cursor-pointer transition shadow-xs shrink-0"
                            >
                              Resolve &amp; Mark Done
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

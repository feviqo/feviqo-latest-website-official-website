import React, { useState } from 'react';
import { X, FileVideo, Plus, Trash2, CheckCircle2, Sparkles, Link2, Cloud, ExternalLink, HardDrive, Check } from 'lucide-react';
import { ClientProject, RawFootageFile } from '../../types';
import { AuthSession } from './flowData';
import { isDriveFolderUrl, isDropboxUrl, isWeTransferUrl, extractDriveId } from '../../utils/videoResolver';

interface NewProjectModalProps {
  session: AuthSession;
  onClose: () => void;
  onCreateProject: (project: ClientProject) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  session,
  onClose,
  onCreateProject,
}) => {
  const [title, setTitle] = useState('');
  const [videoType, setVideoType] = useState<ClientProject['videoType']>('Reels / TikTok (9:16)');
  const [creativeInstructions, setCreativeInstructions] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [footageLink, setFootageLink] = useState('');
  const [rawFiles, setRawFiles] = useState<RawFootageFile[]>([]);

  // Detect platform for quick visual badge
  const detectedPlatform = React.useMemo(() => {
    if (!footageLink.trim()) return null;
    const l = footageLink.toLowerCase();
    if (l.includes('drive.google.com')) return 'drive';
    if (l.includes('dropbox.com')) return 'dropbox';
    if (l.includes('we.tl') || l.includes('wetransfer.com')) return 'wetransfer';
    if (l.endsWith('.mp4') || l.endsWith('.mov') || l.endsWith('.webm') || l.includes('.m3u8')) return 'direct';
    return 'cloud';
  }, [footageLink]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProject: ClientProject = {
      id: 'proj-' + Date.now(),
      title: title.trim(),
      clientEmail: session.email,
      clientName: session.name,
      clientCompany: session.company,
      clientCountry: 'United States',
      videoType: videoType,
      status: 'In Queue',
      footageLink: footageLink.trim(),
      rawFootageFiles: rawFiles,
      referenceLinks: referenceLinks.trim(),
      creativeInstructions: creativeInstructions.trim(),
      editorName: session.assignedEditor || 'Marco Silvestri',
      lastUpdated: 'Just now',
      revisionNotes: [],
    };

    onCreateProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Send to Editor Queue
          </span>
          <span className="text-xs text-slate-400">• New Video Task</span>
        </div>
        <h2 className="text-2xl font-black text-slate-950 mb-4">Submit Video Editing Request</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Project Title / Concept</label>
            <input
              type="text"
              required
              placeholder="e.g. Test One"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#22C55E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Format / Platform</label>
              <select
                value={videoType}
                onChange={(e) => setVideoType(e.target.value as ClientProject['videoType'])}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#22C55E]"
              >
                <option value="Reels / TikTok (9:16)">Reels / TikTok / Shorts (9:16)</option>
                <option value="YouTube (16:9)">YouTube Long-Form (16:9)</option>
                <option value="Video Ad (1:1 / 4:5)">Social Video Ad (1:1 / 4:5)</option>
                <option value="Podcast / Interview">Podcast / Multi-Camera Interview</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Style Reference Link (Optional)</label>
              <input
                type="text"
                placeholder="https://instagram.com/reel/example"
                value={referenceLinks}
                onChange={(e) => setReferenceLinks(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>

          {/* Cloud Raw Footage Link Box (Google Drive / Dropbox / WeTransfer) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-[#22C55E]" />
                <span>Raw Footage Link (Google Drive, Dropbox, or WeTransfer)</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                5TB+ Cloud Compatible
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Link2 className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="url"
                value={footageLink}
                onChange={(e) => setFootageLink(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/... or https://dropbox.com/... or https://we.tl/..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]"
              />
            </div>

            {/* Platform Detection & Status Badge */}
            {detectedPlatform && (
              <div className="flex items-center gap-2 text-xs pt-0.5">
                {detectedPlatform === 'drive' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Google Drive Link Detected — Player embed/stream ready</span>
                  </span>
                )}
                {detectedPlatform === 'dropbox' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dropbox Video Detected — Direct player streaming ready</span>
                  </span>
                )}
                {detectedPlatform === 'wetransfer' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px]">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>WeTransfer Archive Linked — Editor will download package</span>
                  </span>
                )}
                {detectedPlatform === 'direct' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Direct Video URL — Live player stream ready</span>
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span>Supports <strong>Google Drive</strong>, <strong>Dropbox</strong>, <strong>WeTransfer</strong>, or direct video URLs.</span>
              <span className="text-[#16a34a] font-medium hidden sm:inline">Set link to &quot;Anyone with the link can view&quot;</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Creative Instructions & Pacing Notes
            </label>
            <textarea
              rows={3}
              required
              value={creativeInstructions}
              onChange={(e) => setCreativeInstructions(e.target.value)}
              placeholder="Explain how you want the video edited: pacing, color style, music mood, captions, sound effects..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#22C55E] resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-black text-sm transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>Send to Editor Queue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

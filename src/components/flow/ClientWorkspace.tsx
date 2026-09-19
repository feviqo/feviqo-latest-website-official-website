import React, { useState, useEffect } from 'react';
import { 
  Plus, Folder, Clock, Download, FileVideo, CheckCircle2, 
  Send, MessageSquare, Upload, X, Check, Sparkles, Trash2, AlertTriangle, ChevronDown,
  MessageCircle, Video, Pause, Play, ArrowUpRight, Zap, ShieldCheck,
  Link2, Cloud, ExternalLink, HardDrive, Edit3 
} from 'lucide-react';
import { ClientProject, RawFootageFile, ProjectRevisionNote, ChatMessage, ClientProfile } from '../../types';
import { AuthSession } from './flowData';
import { downloadRawFile, downloadFinalMasterVideo, storeFileBlob, formatFileSize } from '../../utils/fileDownloader';
import { TimestampedVideoPlayer } from './TimestampedVideoPlayer';
import { ProgressiveFileUploader } from './ProgressiveFileUploader';
import { WhatsAppChat } from './WhatsAppChat';
import { SubscriptionModal } from './SubscriptionModal';

interface ClientWorkspaceProps {
  session: AuthSession;
  clientProfile?: ClientProfile;
  clients?: ClientProfile[];
  selectedClientId?: string;
  onSelectClient?: (clientId: string) => void;
  onUpdateSubscription?: (action: 'pause' | 'resume' | 'upgrade', targetPlan?: string, notes?: string) => Promise<void>;
  projects: ClientProject[];
  onOpenNewProjectModal: () => void;
  onAddRevisionNote: (projectId: string, note: string, timestamp: string) => void;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onAddFootageToProject?: (projectId: string, files: RawFootageFile[]) => void;
  onUpdateFootageLink?: (projectId: string, link: string) => void;
  onSendChatMessage?: (projectId: string, message: Omit<ChatMessage, 'id' | 'projectId'>) => void;
  activeProjectId: string;
}

export const ClientWorkspace: React.FC<ClientWorkspaceProps> = ({
  session,
  clientProfile,
  clients,
  selectedClientId,
  onSelectClient,
  onUpdateSubscription,
  projects,
  onOpenNewProjectModal,
  onAddRevisionNote,
  onSelectProject,
  onDeleteProject,
  onAddFootageToProject,
  onUpdateFootageLink,
  onSendChatMessage,
  activeProjectId,
}) => {
  const [downloadToast, setDownloadToast] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isAddFootageOpen, setIsAddFootageOpen] = useState(false);
  const [isEditingFootageLink, setIsEditingFootageLink] = useState(false);
  const [footageLinkInput, setFootageLinkInput] = useState('');
  const [activeTab, setActiveTab] = useState<'review' | 'whatsapp'>('review');
  const [subscriptionModal, setSubscriptionModal] = useState<{
    isOpen: boolean;
    mode: 'pause' | 'upgrade';
  }>({ isOpen: false, mode: 'upgrade' });
  const [isResumingPlan, setIsResumingPlan] = useState(false);

  const isAdmin = session.role === 'admin';
  const activeSelectedClient = isAdmin && selectedClientId && selectedClientId !== 'all'
    ? clients?.find(c => c.id === selectedClientId || c.email.toLowerCase() === selectedClientId.toLowerCase())
    : null;

  // Filter projects:
  // If admin and viewing 'all': show ALL projects across all clients!
  // If admin and viewing a specific client: filter by that client's email!
  // If client: strictly filter by session.email for complete data isolation!
  const clientProjects = isAdmin
    ? (activeSelectedClient 
        ? projects.filter(p => p.clientEmail.toLowerCase() === activeSelectedClient.email.toLowerCase())
        : projects)
    : projects.filter(p => p.clientEmail.toLowerCase() === session.email.toLowerCase());

  // Compute profile fallback
  const currentProfile: ClientProfile = activeSelectedClient || clientProfile || {
    id: session.clientId || 'cli-curr',
    name: session.name,
    email: session.email,
    company: session.company,
    website: '',
    phone: '',
    country: 'United States',
    plan: 'Pro ($2,299/mo)',
    monthlySpend: 2299,
    status: 'Active',
    joinedDate: 'Aug 2026',
    activeProjectsCount: clientProjects.length,
    assignedEditor: session.assignedEditor || 'Marco Silvestri',
  };

  const isPlanPaused = currentProfile.status === 'Paused';

  const activeProject = clientProjects.find(p => p.id === activeProjectId) || clientProjects[0] || null;

  const handleDownloadSingleFile = (file: RawFootageFile) => {
    if (!activeProject) return;
    setDownloadToast(`Downloading ${file.name}...`);
    downloadRawFile(file, activeProject.title);
    setTimeout(() => setDownloadToast(''), 3500);
  };

  const handleDownloadMaster = () => {
    if (!activeProject) return;
    setDownloadToast(`Downloading 4K Master Render for "${activeProject.title}"...`);
    downloadFinalMasterVideo(activeProject.title);
    setTimeout(() => setDownloadToast(''), 3500);
  };

  const handleConfirmDelete = (id: string) => {
    onDeleteProject(id);
    setDeleteConfirmId(null);
    setDownloadToast('Project task deleted from workspace.');
    setTimeout(() => setDownloadToast(''), 3500);
  };

  const handleMoreFootageUploaded = (files: RawFootageFile[]) => {
    if (!activeProject || !onAddFootageToProject) return;
    onAddFootageToProject(activeProject.id, files);
    setIsAddFootageOpen(false);
    setDownloadToast(`Added ${files.length} new raw footage assets to queue.`);
    setTimeout(() => setDownloadToast(''), 3500);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* Toast Alert */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white border border-[#22C55E]/50 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-950">Delete this video request?</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Are you sure you want to delete this project? All associated raw footage, revision notes, and video cuts will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Inspector Header Bar */}
      {/* Admin Inspector Header Bar */}
      {isAdmin && (
        <div className="w-full max-w-full overflow-hidden rounded-3xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white p-5 sm:p-6 border border-emerald-500/30 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 box-border">
          <div className="space-y-1.5 min-w-0 flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider text-[#22C55E]">
                Admin Inspector: All Client Portals
              </span>
              <span className="text-[10px] bg-[#021f12]/90 text-emerald-200 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 whitespace-nowrap">
                {clientProjects.length} Active Video Projects
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
              Inspect any client's live portal, uploaded footage, real-time revision notes, and WhatsApp production group.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full lg:w-auto min-w-0 shrink-0">
            <label htmlFor="portal-switcher-select" className="text-xs font-bold text-emerald-200 shrink-0 whitespace-nowrap">
              Switch Portal:
            </label>
            <select
              id="portal-switcher-select"
              value={selectedClientId || 'all'}
              onChange={(e) => onSelectClient && onSelectClient(e.target.value)}
              className="bg-[#064e3b] hover:bg-[#085f48] text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-emerald-400/40 focus:outline-none focus:border-[#22C55E] transition cursor-pointer w-full sm:w-64 max-w-full min-w-0 shadow-md"
            >
              <option value="all" className="bg-[#032415] text-white">🌐 All Clients Combined ({projects.length} Total Projects)</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#032415] text-white">
                  👤 {c.name} ({c.company || c.email}) • {c.plan}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="w-full max-w-full overflow-hidden rounded-3xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-emerald-500/30 text-white p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative box-border">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#021f12]/80 text-[#22C55E] border border-emerald-500/30">
              {isAdmin ? 'Admin Client Inspector' : 'Private Client Workspace'}
            </span>
            <span className="text-xs text-emerald-200/80">
              {isAdmin ? `• Viewing: ${activeSelectedClient ? activeSelectedClient.name : 'All Clients'}` : '• Strict Data Isolation'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isAdmin 
              ? (activeSelectedClient ? `${activeSelectedClient.name}'s Portal` : 'All Client Projects Overview')
              : `Welcome back, ${session.name}`}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90">
            {currentProfile.company || 'Creator'} • Dedicated Editor: <strong className="text-white">{currentProfile.assignedEditor || session.assignedEditor || 'Marco Silvestri'}</strong>
          </p>
        </div>

        <button
          onClick={onOpenNewProjectModal}
          className="px-5 py-3 rounded-full bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer shadow-lg flex items-center gap-2 shrink-0 hover:scale-[1.02] active:scale-100"
        >
          <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
          <span>Submit New Video Request</span>
        </button>
      </div>

      {/* Subscription & Plan Status Bar (Styled in Signature Green Header Gradient) */}
      <div className="w-full max-w-full overflow-hidden rounded-3xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-emerald-500/30 text-white p-5 sm:p-6 shadow-md transition-all box-border">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1.5 ${
                isPlanPaused
                  ? 'bg-amber-900/60 text-amber-200 border border-amber-500/40'
                  : 'bg-[#021f12]/80 text-[#22C55E] border border-emerald-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isPlanPaused ? 'bg-amber-400' : 'bg-[#22C55E] animate-pulse'}`} />
                {isPlanPaused ? 'Subscription Paused' : 'Active Subscription'}
              </span>

              <span className="text-xs font-bold text-white bg-white/10 px-3 py-0.5 rounded-full border border-white/20">
                {currentProfile.plan}
              </span>

              <span className="text-[11px] text-emerald-200/80 font-medium hidden sm:inline">
                • Invoicing & Payments via Payoneer • 1-Click flexibility
              </span>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {isPlanPaused
                ? 'Your subscription is currently paused. Your footage, cuts, and project history are 100% safe. Click resume anytime to reopen your queue.'
                : 'Zero commitment policy: You can pause or upgrade your plan directly anytime with a single click. Notifications instantly alert studio partners at partner@feviqo.com.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            {isPlanPaused ? (
              <button
                onClick={async () => {
                  if (onUpdateSubscription) {
                    setIsResumingPlan(true);
                    await onUpdateSubscription('resume');
                    setIsResumingPlan(false);
                    setDownloadToast('Subscription resumed! Your editing queue is now active.');
                    setTimeout(() => setDownloadToast(''), 4000);
                  }
                }}
                disabled={isResumingPlan}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isResumingPlan ? 'Resuming...' : 'Resume Plan (1-Click)'}</span>
              </button>
            ) : (
              <button
                onClick={() => setSubscriptionModal({ isOpen: true, mode: 'pause' })}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full border border-white/20 hover:border-white/40 bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                title="Pause subscription with zero lock-in"
              >
                <Pause className="w-3.5 h-3.5 text-amber-300" />
                <span>Pause Plan</span>
              </button>
            )}

            <button
              onClick={() => setSubscriptionModal({ isOpen: true, mode: 'upgrade' })}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-100"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {clientProjects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#22C55E] flex items-center justify-center mx-auto border border-emerald-200">
            <Folder className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-950">Your Workspace is Clean and Ready!</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            You have no active video projects yet. Click the button below to upload your footage, title your first request (e.g. "Test One"), and send it directly to your editor's queue.
          </p>
          <button
            onClick={onOpenNewProjectModal}
            className="px-6 py-3 rounded-full bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer shadow-lg"
          >
            Create Your First Video Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Queue List */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Your Project Queue</h3>
              </div>
              <span className="text-xs font-bold text-slate-500">{clientProjects.length} requests</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {clientProjects.map((p) => {
                const isSelected = p.id === activeProject?.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-emerald-50/50 border-[#22C55E] shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">{p.videoType}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'Review Ready' ? 'bg-amber-100 text-amber-800' :
                          p.status === 'Editing' ? 'bg-sky-100 text-sky-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {p.status}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(p.id);
                          }}
                          className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-white transition cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-950 line-clamp-1">{p.title}</h4>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                      <span>{p.rawFootageFiles?.length || 0} raw files</span>
                      <span>Updated {p.lastUpdated}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Project Detail & Video Player */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            {activeProject ? (
              <div className="space-y-6">
                {/* Top Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">{activeProject.videoType}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">Editor: {activeProject.editorName}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">{activeProject.title}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      activeProject.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      activeProject.status === 'Review Ready' ? 'bg-amber-100 text-amber-800' :
                      activeProject.status === 'Editing' ? 'bg-sky-100 text-sky-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      Status: {activeProject.status}
                    </span>

                    {/* Delete Task Button */}
                    <button
                      onClick={() => setDeleteConfirmId(activeProject.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="Delete this project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete Task</span>
                    </button>
                  </div>
                </div>

                {/* View Switcher: Timeline Video Review vs. WhatsApp Fast Chat */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                  <button
                    type="button"
                    onClick={() => setActiveTab('review')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      activeTab === 'review'
                        ? 'bg-white text-slate-950 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Video className="w-4 h-4 text-[#22C55E]" />
                    <span>Video Review &amp; Timeline Revisions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('whatsapp')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      activeTab === 'whatsapp'
                        ? 'bg-[#00A884] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#00A884]'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat only</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </button>
                </div>

                {/* TAB 1: WHATSAPP FAST CHAT */}
                {activeTab === 'whatsapp' && (
                  <div className="h-[600px]">
                    <WhatsAppChat
                      project={activeProject}
                      currentUserRole="client"
                      currentUserName={session.name}
                      editorName={activeProject.editorName || 'Marco Silvestri'}
                      clientName={session.name}
                      onSendMessage={(projectId, msg) => {
                        if (onSendChatMessage) {
                          onSendChatMessage(projectId, msg);
                        }
                      }}
                    />
                  </div>
                )}

                {/* TAB 2: TIMELINE VIDEO REVIEW & ASSETS */}
                {activeTab === 'review' && (
                  <div className="space-y-6">
                    {/* Personalized In-House Video Review Player (Hover Timecodes, Pinning, Direct Sync) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                          <span>In-House Video Review Player &amp; Timeline Feedback</span>
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          Hover timeline to check timecode • Click anywhere to pause &amp; pin note
                        </span>
                      </div>

                      <div className="w-full flex items-center justify-center">
                        <TimestampedVideoPlayer
                          projectId={activeProject.id}
                          projectTitle={activeProject.title}
                          revisionNotes={activeProject.revisionNotes || []}
                          onAddAnnotation={(timestamp, noteText) => {
                            onAddRevisionNote(activeProject.id, noteText, timestamp);
                          }}
                          userRole="client"
                          userName={session.name}
                          videoUrl={activeProject.deliveredVideoUrl || activeProject.footageLink || (activeProject.rawFootageFiles && activeProject.rawFootageFiles[0]?.blobUrl)}
                          deliveredVideoUrl={activeProject.deliveredVideoUrl}
                          footageLink={activeProject.footageLink}
                          rawFootageFiles={activeProject.rawFootageFiles}
                          onDownloadMaster={handleDownloadMaster}
                        />
                      </div>
                    </div>

                    {/* Creative Instructions */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                      <strong className="text-slate-900 block mb-1">Creative Instructions:</strong>
                      <p className="text-slate-600 leading-relaxed">{activeProject.creativeInstructions}</p>
                    </div>

                    {/* Cloud Raw Footage Integration (Google Drive / Dropbox / WeTransfer) */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cloud className="w-4 h-4 text-[#22C55E]" />
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                            Cloud Raw Footage Source
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          5TB+ Cloud Compatible
                        </span>
                      </div>

                      {activeProject.footageLink && !isEditingFootageLink ? (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 text-[#16a34a]">
                              <HardDrive className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">
                                  {activeProject.footageLink.includes('drive.google.com')
                                    ? 'Google Drive Assets Linked'
                                    : activeProject.footageLink.includes('dropbox.com')
                                    ? 'Dropbox Assets Linked'
                                    : activeProject.footageLink.includes('we.tl') || activeProject.footageLink.includes('wetransfer')
                                    ? 'WeTransfer Package Linked'
                                    : 'Cloud Video Assets Linked'}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                                <span className="text-[10px] text-[#16a34a] font-semibold">Active in Player</span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono truncate max-w-sm sm:max-w-md">
                                {activeProject.footageLink}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={activeProject.footageLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
                            >
                              <span>Open Cloud</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setFootageLinkInput(activeProject.footageLink || '');
                                setIsEditingFootageLink(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-slate-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Update</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <Link2 className="w-4 h-4 text-slate-400" />
                            </div>
                            <input
                              type="url"
                              value={footageLinkInput}
                              onChange={(e) => setFootageLinkInput(e.target.value)}
                              placeholder="Paste Google Drive, Dropbox, or WeTransfer link (e.g., https://drive.google.com/drive/folders/...)"
                              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#22C55E]"
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-[11px] text-slate-400">
                              Supports 5TB+ Google Drive (AI Pro), Dropbox, or WeTransfer links.
                            </span>
                            <div className="flex items-center gap-2">
                              {isEditingFootageLink && (
                                <button
                                  type="button"
                                  onClick={() => setIsEditingFootageLink(false)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (!activeProject) return;
                                  if (onUpdateFootageLink) {
                                    onUpdateFootageLink(activeProject.id, footageLinkInput.trim());
                                  } else {
                                    activeProject.footageLink = footageLinkInput.trim();
                                  }
                                  setIsEditingFootageLink(false);
                                }}
                                className="px-4 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Save &amp; Sync Player</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                {/* Revision Feedback Section with Two-Way Editor Communication */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3">
                    Timestamped Revisions & Discussion Feed ({activeProject.revisionNotes?.length || 0})
                  </h4>
                  
                  {activeProject.revisionNotes && activeProject.revisionNotes.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {activeProject.revisionNotes.map((rev) => (
                        <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-slate-200 font-mono text-[11px] font-bold text-slate-800">{rev.timestamp}</span>
                              <span className="font-bold text-slate-900">{rev.author}:</span>
                            </div>
                            {rev.isAddressed && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <Check className="w-3 h-3 text-[#22C55E]" />
                                <span>Addressed by Editor</span>
                              </span>
                            )}
                          </div>
                          <div className="text-slate-700 pl-1">{rev.note}</div>

                          {/* Editor's direct response if provided */}
                          {rev.editorReply && (
                            <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-[11px]">
                              <strong className="text-[#22C55E] block mb-0.5">Editor Response ({rev.editorName || 'Marco'}):</strong>
                              <span>{rev.editorReply}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic mb-3">
                      No timestamp notes yet. Pause the video player above or use the scrubber to pin your first timestamped note for your editor!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )}

  {/* Subscription Pause / Upgrade Modal */}
  {subscriptionModal.isOpen && (
    <SubscriptionModal
      isOpen={subscriptionModal.isOpen}
      mode={subscriptionModal.mode}
      currentProfile={currentProfile}
      onClose={() => setSubscriptionModal({ isOpen: false, mode: 'upgrade' })}
      onConfirmAction={async (action, targetPlan, notes) => {
        if (onUpdateSubscription) {
          await onUpdateSubscription(action, targetPlan, notes);
        }
      }}
    />
  )}
</div>
);
};

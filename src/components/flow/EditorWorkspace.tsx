import React, { useState } from 'react';
import { 
  FileVideo, Download, ChevronRight, CheckCircle2, 
  Send, Check, Clock, ExternalLink, MessageSquare, AlertCircle, 
  Trash2, AlertTriangle, Sparkles, Filter, Shield, User, Users,
  MessageCircle, Video, LayoutGrid, Layers, ArrowRight, MoveRight,
  GripVertical, PlayCircle, Cloud, HardDrive
} from 'lucide-react';
import { ClientProject, RawFootageFile, ProjectRevisionNote, ChatMessage } from '../../types';
import { AuthSession } from './flowData';
import { downloadRawFile, downloadProjectBundleZip } from '../../utils/fileDownloader';
import { TimestampedVideoPlayer } from './TimestampedVideoPlayer';
import { WhatsAppChat } from './WhatsAppChat';

interface EditorWorkspaceProps {
  session: AuthSession;
  projects: ClientProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onUpdateProjectStatus: (projectId: string, newStatus: ClientProject['status'], previewUrl?: string) => void;
  onEditorReplyNote: (projectId: string, noteId: string, replyText: string) => void;
  onToggleNoteAddressed: (projectId: string, noteId: string) => void;
  onAddEditorNote: (projectId: string, note: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onSendChatMessage?: (projectId: string, message: Omit<ChatMessage, 'id' | 'projectId'>) => void;
}

type PipelineStage = 'In Queue' | 'Editing' | 'Review Ready' | 'Completed';

const PIPELINE_COLUMNS: {
  id: PipelineStage;
  label: string;
  sublabel: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  dropBorder: string;
}[] = [
  {
    id: 'In Queue',
    label: 'In Queue',
    sublabel: 'New client requests waiting for pickup',
    color: 'slate',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    accentBorder: 'border-slate-300',
    dropBorder: 'border-slate-500 bg-slate-50/80',
  },
  {
    id: 'Editing',
    label: 'In Production',
    sublabel: 'Editor assembling timeline & motion cuts',
    color: 'sky',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-900',
    accentBorder: 'border-sky-300',
    dropBorder: 'border-sky-500 bg-sky-50/80',
  },
  {
    id: 'Review Ready',
    label: 'Review Ready',
    sublabel: 'Draft delivered, awaiting client feedback',
    color: 'amber',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    accentBorder: 'border-amber-300',
    dropBorder: 'border-amber-500 bg-amber-50/80',
  },
  {
    id: 'Completed',
    label: 'Completed & Delivered',
    sublabel: 'Approved master 4K cuts delivered',
    color: 'emerald',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    accentBorder: 'border-emerald-300',
    dropBorder: 'border-emerald-500 bg-emerald-50/80',
  },
];

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  session,
  projects,
  activeProjectId,
  onSelectProject,
  onUpdateProjectStatus,
  onEditorReplyNote,
  onToggleNoteAddressed,
  onAddEditorNote,
  onDeleteProject,
  onSendChatMessage,
}) => {
  // GHL Navigation: 'pipeline' (Kanban Opportunities board) or 'workspace' (Deep Dive task review)
  const [viewMode, setViewMode] = useState<'pipeline' | 'workspace'>('pipeline');
  
  const [editorDeliverUrl, setEditorDeliverUrl] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [activeReplyNoteId, setActiveReplyNoteId] = useState<string | null>(null);
  const [editorDirectNote, setEditorDirectNote] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Drag-and-Drop state
  const [draggingProjectId, setDraggingProjectId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PipelineStage | null>(null);

  // Active subtab in workspace mode: 'review' vs. 'chat' (Chat only)
  const [activeTab, setActiveTab] = useState<'review' | 'chat'>('review');

  // Task Filter Scope: Assigned to me vs. All tasks vs. Specific Editor
  const [filterScope, setFilterScope] = useState<string>('all');

  // Filter projects based on selected scope
  const myAssignedProjects = projects.filter(
    (p) => p.editorName.toLowerCase() === session.name.toLowerCase()
  );

  // Dynamically gather all editor names strictly from actual project assignments
  const availableEditors = Array.from(
    new Set(projects.map((p) => p.editorName).filter(Boolean))
  );

  let filteredProjects = projects;
  if (filterScope === 'my_tasks') {
    filteredProjects = myAssignedProjects.length > 0 ? myAssignedProjects : projects;
  } else if (filterScope !== 'all') {
    filteredProjects = projects.filter(
      (p) => p.editorName.toLowerCase() === filterScope.toLowerCase()
    );
  }

  // Active Project
  const activeProject = 
    projects.find((p) => p.id === activeProjectId) ||
    filteredProjects[0] ||
    projects[0] ||
    null;

  // Pipeline Counts
  const inQueueCount = filteredProjects.filter((p) => p.status === 'In Queue').length;
  const editingCount = filteredProjects.filter((p) => p.status === 'Editing').length;
  const reviewReadyCount = filteredProjects.filter((p) => p.status === 'Review Ready').length;
  const completedCount = filteredProjects.filter((p) => p.status === 'Completed').length;

  const handleDownloadSingle = (file: RawFootageFile) => {
    if (!activeProject) return;
    setToastMsg(`Downloading file: ${file.name}...`);
    downloadRawFile(file, activeProject.title);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleDownloadAllZip = () => {
    if (!activeProject) return;
    setToastMsg(`Preparing & downloading complete ${activeProject.rawFootageFiles.length}-file raw footage ZIP bundle...`);
    downloadProjectBundleZip(activeProject.title, activeProject.rawFootageFiles);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleStatusChange = (status: ClientProject['status'], targetProjId?: string) => {
    const pId = targetProjId || activeProject?.id;
    if (!pId) return;
    onUpdateProjectStatus(pId, status, editorDeliverUrl);
    setToastMsg(`Stage moved to "${status}"! Automated notification email dispatched to client.`);
    setTimeout(() => setToastMsg(''), 5000);
  };

  // Drag-and-Drop Drop Handler
  const handleDropToStatus = (projId: string, newStatus: PipelineStage) => {
    const targetProject = projects.find((p) => p.id === projId);
    if (!targetProject) return;

    if (targetProject.status === newStatus) {
      setDraggingProjectId(null);
      setDragOverColumn(null);
      return;
    }

    onUpdateProjectStatus(projId, newStatus);
    setToastMsg(`Moved "${targetProject.title}" to ${newStatus}! Client notification email dispatched.`);
    setDraggingProjectId(null);
    setDragOverColumn(null);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const handleDeliverAndNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    if (!editorDeliverUrl.trim()) {
      setToastMsg('Please paste a preview video link (Vimeo / Frame.io / Drive) to deliver.');
      setTimeout(() => setToastMsg(''), 4000);
      return;
    }
    onUpdateProjectStatus(activeProject.id, 'Review Ready', editorDeliverUrl.trim());
    setToastMsg(`Draft delivered! Review notification email dispatched to client.`);
    setTimeout(() => setToastMsg(''), 5000);
  };

  const handleSaveReply = (noteId: string) => {
    const text = replyInputMap[noteId];
    if (!text || !text.trim() || !activeProject) return;
    onEditorReplyNote(activeProject.id, noteId, text.trim());
    setReplyInputMap((prev) => ({ ...prev, [noteId]: '' }));
    setActiveReplyNoteId(null);
    setToastMsg('Reply sent to client! Client will see your response in their portal.');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAddDirectQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !editorDirectNote.trim()) return;
    onAddEditorNote(activeProject.id, editorDirectNote.trim());
    setEditorDirectNote('');
    setToastMsg('Editor note posted! Synced to client dashboard.');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const openProjectInWorkspace = (projectId: string, tab: 'review' | 'chat' = 'review') => {
    onSelectProject(projectId);
    setActiveTab(tab);
    setViewMode('workspace');
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white border border-[#22C55E]/50 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span>{toastMsg}</span>
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
              <h3 className="text-lg font-black text-slate-950">Delete this project?</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Are you sure you want to delete this project? All associated raw footage, revision notes, and video cuts will be removed.
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
                onClick={() => {
                  if (onDeleteProject) onDeleteProject(deleteConfirmId);
                  setDeleteConfirmId(null);
                  setToastMsg('Project deleted successfully.');
                  setTimeout(() => setToastMsg(''), 3000);
                }}
                className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GHL Premium Header Banner: Signature Forest Green Brand Treatment */}
      <div className="w-full max-w-full overflow-hidden bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-[#064e3b]/90 text-white rounded-3xl p-6 sm:p-7 shadow-md space-y-5 box-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#021f12]/80 text-[#22C55E] border border-emerald-500/30">
                GoHighLevel Video Production Pipeline
              </span>
              <span className="text-xs text-emerald-200/80">• HighLevel Style Opportunities</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#021f12]/70 text-emerald-200 border border-emerald-500/20 font-medium flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#22C55E]" />
                <span>PII Protected (Client Personal Contact Masked)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Editor Studio: {session.name}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" title="Production Queue Online" />
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90">
              Drag deliverables from <span className="font-bold text-white">In Queue</span> into <span className="font-bold text-emerald-300">In Production</span> to claim tasks and dispatch automated client status notifications.
            </p>
          </div>

          {/* Top Controls: View Switcher (Kanban vs Active Task) & Editor Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle: Kanban vs Workspace */}
            <div className="flex items-center bg-[#021f12] p-1 rounded-2xl border border-emerald-600/40">
              <button
                type="button"
                onClick={() => setViewMode('pipeline')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'pipeline'
                    ? 'bg-[#22C55E] text-slate-950 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>GHL Pipeline Board</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeProject) setViewMode('workspace');
                  else setToastMsg('Please select a project first.');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'workspace'
                    ? 'bg-[#22C55E] text-slate-950 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Task Studio &amp; Chat</span>
              </button>
            </div>

            {/* Editor Scope Filter */}
            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              aria-label="Filter deliverables by assigned editor"
              className="text-xs font-bold bg-[#021f12] border border-emerald-500/40 rounded-xl px-3 py-2 text-white cursor-pointer focus:outline-none focus:border-[#22C55E] shadow-inner"
            >
              <option value="all">All Studio Tasks ({projects.length})</option>
              <option value="my_tasks">Assigned to Me ({myAssignedProjects.length})</option>
              {availableEditors.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* GHL Metric KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-emerald-800/40">
          <div 
            onClick={() => setViewMode('pipeline')}
            className="p-3.5 rounded-2xl bg-[#021f12]/70 border border-emerald-500/30 hover:border-emerald-400 transition cursor-pointer"
          >
            <div className="text-[11px] font-bold text-emerald-200/80 uppercase tracking-wider flex items-center justify-between">
              <span>1. In Queue</span>
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{inQueueCount}</div>
            <p className="text-[11px] text-emerald-200/60 mt-0.5">Ready to drag to Editing</p>
          </div>

          <div 
            onClick={() => setViewMode('pipeline')}
            className="p-3.5 rounded-2xl bg-[#021f12]/70 border border-emerald-500/30 hover:border-emerald-400 transition cursor-pointer"
          >
            <div className="text-[11px] font-bold text-emerald-200/80 uppercase tracking-wider flex items-center justify-between">
              <span>2. In Production</span>
              <span className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{editingCount}</div>
            <p className="text-[11px] text-emerald-200/60 mt-0.5">Active timeline cuts</p>
          </div>

          <div 
            onClick={() => setViewMode('pipeline')}
            className="p-3.5 rounded-2xl bg-[#021f12]/70 border border-emerald-500/30 hover:border-emerald-400 transition cursor-pointer"
          >
            <div className="text-[11px] font-bold text-emerald-200/80 uppercase tracking-wider flex items-center justify-between">
              <span>3. Review Ready</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{reviewReadyCount}</div>
            <p className="text-[11px] text-emerald-200/60 mt-0.5">Pending client approval</p>
          </div>

          <div 
            onClick={() => setViewMode('pipeline')}
            className="p-3.5 rounded-2xl bg-[#021f12]/70 border border-emerald-500/30 hover:border-emerald-400 transition cursor-pointer"
          >
            <div className="text-[11px] font-bold text-emerald-200/80 uppercase tracking-wider flex items-center justify-between">
              <span>4. Completed</span>
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{completedCount}</div>
            <p className="text-[11px] text-emerald-200/60 mt-0.5">Master cuts delivered</p>
          </div>
        </div>
      </div>

      {/* VIEW 1: GHL KANBAN PIPELINE OPPORTUNITIES BOARD (DRAG AND DROP) */}
      {viewMode === 'pipeline' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#22C55E]" />
                <span>Opportunity Pipeline Stages</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                (Drag cards between stages to update status and send automated client notification)
              </span>
            </div>

            <span className="text-xs font-bold text-slate-500">
              Total Opportunities: {filteredProjects.length}
            </span>
          </div>

          {/* 4-Column Pipeline Kanban */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {PIPELINE_COLUMNS.map((col) => {
              const colProjects = filteredProjects.filter((p) => p.status === col.id);
              const isDragTarget = dragOverColumn === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverColumn(col.id);
                  }}
                  onDragLeave={() => {
                    if (dragOverColumn === col.id) setDragOverColumn(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const projId = e.dataTransfer.getData('text/plain') || draggingProjectId;
                    if (projId) handleDropToStatus(projId, col.id);
                  }}
                  className={`rounded-3xl border transition-all duration-200 flex flex-col p-4 min-h-[580px] ${
                    isDragTarget 
                      ? `${col.dropBorder} ring-2 ring-[#22C55E] scale-[1.01]` 
                      : 'bg-slate-50/70 border-slate-200/90'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900">{col.label}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black ${col.badgeBg} ${col.badgeText}`}>
                          {colProjects.length}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{col.sublabel}</p>
                    </div>
                  </div>

                  {/* Cards Area */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[720px] pr-1">
                    {colProjects.map((proj) => {
                      const isDragging = draggingProjectId === proj.id;
                      const hasNotes = (proj.revisionNotes?.length || 0) > 0;
                      const filesCount = proj.rawFootageFiles?.length || 0;

                      return (
                        <div
                          key={proj.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', proj.id);
                            setDraggingProjectId(proj.id);
                          }}
                          onDragEnd={() => {
                            setDraggingProjectId(null);
                            setDragOverColumn(null);
                          }}
                          className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing space-y-3 select-none group relative ${
                            isDragging ? 'opacity-40 scale-95 border-dashed border-slate-400' : ''
                          }`}
                        >
                          {/* Top Meta: Client Brand + Grab Handle */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="truncate">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {proj.clientCompany || 'Client Brand'}
                              </span>
                              <div className="text-xs font-bold text-slate-600 mt-1 truncate">
                                {proj.clientName || 'Client'}
                              </div>
                            </div>

                            <div className="text-slate-400 group-hover:text-slate-700 cursor-grab p-1" title="Drag this card to any pipeline stage">
                              <GripVertical className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Video Request Title */}
                          <h4 className="text-sm font-black text-slate-950 leading-snug line-clamp-2">
                            {proj.title}
                          </h4>

                          {/* Quick Badges: Format + Files Count */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                              {proj.videoType}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
                              <FileVideo className="w-3 h-3 text-slate-500" />
                              <span>{filesCount} files</span>
                            </span>
                            {hasNotes && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-amber-600" />
                                <span>{proj.revisionNotes.length} notes</span>
                              </span>
                            )}
                          </div>

                          {/* Assigned Editor & Priority */}
                          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-500">
                            <div className="flex items-center gap-1.5 truncate">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{proj.editorName}</span>
                            </div>
                            <span className="font-bold text-slate-700 shrink-0">⚡ 24-48h SLA</span>
                          </div>

                          {/* One-Click Action Shortcuts */}
                          <div className="pt-2 flex items-center gap-1.5 border-t border-slate-100 text-xs">
                            {/* If in 'In Queue', prominent button to start editing */}
                            {col.id === 'In Queue' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange('Editing', proj.id);
                                }}
                                className="flex-1 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                title="Move to Editing & dispatch notification"
                              >
                                <span>Claim &amp; Edit</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}

                            {col.id === 'Editing' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openProjectInWorkspace(proj.id, 'review');
                                }}
                                className="flex-1 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Video className="w-3 h-3 text-[#22C55E]" />
                                <span>Open Studio</span>
                              </button>
                            )}

                            {col.id === 'Review Ready' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openProjectInWorkspace(proj.id, 'review');
                                }}
                                className="flex-1 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>Review Notes</span>
                              </button>
                            )}

                            {col.id === 'Completed' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openProjectInWorkspace(proj.id, 'review');
                                }}
                                className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>View Master</span>
                              </button>
                            )}

                            {/* Chat Only direct button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openProjectInWorkspace(proj.id, 'chat');
                              }}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-slate-600 hover:text-emerald-800 transition cursor-pointer"
                              title="Open Chat only with client"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {colProjects.length === 0 && (
                      <div className="py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1">
                        <span>No requests here</span>
                        <span className="text-[10px] text-slate-400">Drag a card here to move stage</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: DETAILED PRODUCTION TASK WORKSPACE */}
      {viewMode === 'workspace' && activeProject && (
        <div className="space-y-6">
          {/* Breadcrumb Back to Pipeline */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMode('pipeline')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 transition cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Back to GHL Pipeline Board</span>
            </button>

            {/* Stage indicator pill */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400">Current Opportunity Stage:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                activeProject.status === 'Completed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                activeProject.status === 'Review Ready' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                activeProject.status === 'Editing' ? 'bg-sky-100 text-sky-900 border border-sky-300' :
                'bg-slate-100 text-slate-800 border border-slate-300'
              }`}>
                {activeProject.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            
            {/* Left Column: Deliverables Quick Queue */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span>Deliverables Queue</span>
                  <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
                    {filteredProjects.length}
                  </span>
                </h3>

                <button
                  type="button"
                  onClick={() => setViewMode('pipeline')}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Kanban Board →
                </button>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[780px] pr-1">
                {filteredProjects.map((proj) => {
                  const isSelected = proj.id === activeProject?.id;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => onSelectProject(proj.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-emerald-50/60 border-[#22C55E] shadow-sm ring-1 ring-[#22C55E]'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5 gap-1.5">
                        <span className="font-bold text-slate-900 truncate text-xs">
                          {proj.clientName || 'Client'} <span className="text-slate-400 font-normal text-[11px]">({proj.clientCompany || 'Brand'})</span>
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                          proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          proj.status === 'Review Ready' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                          proj.status === 'Editing' ? 'bg-sky-100 text-sky-900 border border-sky-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {proj.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-950 truncate mb-0.5" title={proj.title}>
                        {proj.title}
                      </h4>
                      
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                        <span>{proj.videoType}</span>
                        <span className="font-medium text-slate-400">Editor: {proj.editorName}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-medium">{proj.rawFootageFiles.length} raw files available</span>
                        <span className={`font-bold flex items-center gap-0.5 text-xs transition-colors ${
                          isSelected ? 'text-[#15803D]' : 'text-slate-500 group-hover:text-slate-900'
                        }`}>
                          <span>Work on Task</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Wide Main Workspace Area */}
            <div className="lg:col-span-8 xl:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Task Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                    {activeProject.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>Format: <strong className="text-slate-800">{activeProject.videoType}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Client: <strong className="text-slate-900">{activeProject.clientName || 'Client'}</strong> ({activeProject.clientCompany || 'Brand'})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {activeProject.status}
                  </span>

                  {onDeleteProject && (
                    <button
                      onClick={() => setDeleteConfirmId(activeProject.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="Delete this project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete Task</span>
                    </button>
                  )}
                </div>
              </div>

              {/* View Switcher: Timeline Video Review vs. Chat only */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab('review')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'review'
                      ? 'bg-white text-slate-950 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <Video className="w-4 h-4 text-[#22C55E]" />
                  <span>Video Review &amp; Revisions ({activeProject.revisionNotes?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'chat'
                      ? 'bg-[#00A884] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#00A884]'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat only</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              </div>

              {/* TAB 1: CHAT ONLY (Renamed from WhatsApp Fast Chat) */}
              {activeTab === 'chat' && (
                <div className="h-[600px]">
                  <WhatsAppChat
                    project={activeProject}
                    currentUserRole="editor"
                    currentUserName={session.name}
                    editorName={session.name}
                    clientName={activeProject.clientName || 'Client'}
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
                  {/* Internal In-House Review Player for Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span>In-House Video Review Player (Hardware Synced)</span>
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Client pinned notes appear on timeline • Click any pin to seek
                      </span>
                    </div>

                    <div className="w-full flex items-center justify-center">
                      <TimestampedVideoPlayer
                        projectId={activeProject.id}
                        projectTitle={activeProject.title}
                        revisionNotes={activeProject.revisionNotes || []}
                        onAddAnnotation={(timestamp, noteText) => {
                          onAddEditorNote(activeProject.id, `[At ${timestamp}]: ${noteText}`);
                        }}
                        onReplyAnnotation={(noteId, replyText) => {
                          onEditorReplyNote(activeProject.id, noteId, replyText);
                        }}
                        userRole="editor"
                        userName={session.name}
                        videoUrl={activeProject.deliveredVideoUrl || activeProject.footageLink || (activeProject.rawFootageFiles && activeProject.rawFootageFiles[0]?.blobUrl)}
                        deliveredVideoUrl={activeProject.deliveredVideoUrl}
                        footageLink={activeProject.footageLink}
                        rawFootageFiles={activeProject.rawFootageFiles}
                      />
                    </div>
                  </div>

                  {/* 1. CLOUD FOOTAGE SOURCE & RAW ASSETS */}
                  <div className="space-y-3">
                    {activeProject.footageLink && (
                      <div className="p-4 rounded-2xl bg-emerald-950 text-white border border-[#22C55E]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center shrink-0 text-[#22C55E]">
                            <Cloud className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black tracking-wide text-white">
                                Client Cloud Footage (5TB+ Ready)
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                            </div>
                            <p className="text-[11px] text-emerald-200/80 font-mono truncate max-w-sm sm:max-w-md">
                              {activeProject.footageLink}
                            </p>
                          </div>
                        </div>

                        <a
                          href={activeProject.footageLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-xs flex items-center gap-1.5 transition shrink-0 shadow-lg"
                        >
                          <span>Open in Cloud ↗</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Raw Footage Assets ({activeProject.rawFootageFiles.length})
                      </h3>
                      {activeProject.rawFootageFiles.length > 0 && (
                        <button
                          onClick={handleDownloadAllZip}
                          className="text-xs font-bold text-[#22C55E] hover:underline flex items-center gap-1 cursor-pointer"
                          title="Download complete raw files bundle archive (.ZIP)"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download All Raw Files (.ZIP)</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {activeProject.rawFootageFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            <FileVideo className="w-4 h-4 text-slate-600 shrink-0" />
                            <div className="truncate">
                              <div className="font-bold text-slate-900 truncate">{file.name}</div>
                              <div className="text-[11px] text-slate-400">{file.size} • Uploaded {file.uploadedAt}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDownloadSingle(file)}
                            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-400 text-slate-800 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
                          >
                            <Download className="w-3 h-3 text-[#22C55E]" />
                            <span>Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. CREATIVE INSTRUCTIONS & NOTES */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                    <strong className="text-slate-900 block mb-1">Client Creative Brief:</strong>
                    <p className="text-slate-700">{activeProject.creativeInstructions}</p>
                    {activeProject.referenceLinks && (
                      <div className="mt-2 pt-2 border-t border-slate-200/80">
                        <span className="font-semibold text-slate-600">Reference: </span>
                        <a href={activeProject.referenceLinks} target="_blank" rel="noreferrer" className="text-emerald-700 underline truncate">
                          {activeProject.referenceLinks}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* 3. TWO-WAY CLIENT NOTES & TIMELINE FEEDBACK */}
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#22C55E]" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-950">
                          Client Revision Notes &amp; Timeline Feedback ({activeProject.revisionNotes?.length || 0})
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-500">Live synchronized thread</span>
                    </div>

                    {activeProject.revisionNotes && activeProject.revisionNotes.length > 0 ? (
                      <div className="space-y-2.5">
                        {activeProject.revisionNotes.map((rev) => (
                          <div key={rev.id} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold text-slate-800">
                                  {rev.timestamp}
                                </span>
                                <span className="font-bold text-slate-900">
                                  {rev.author} ({rev.authorRole || 'Client'})
                                </span>
                              </div>
                              
                              <button
                                onClick={() => onToggleNoteAddressed(activeProject.id, rev.id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                                  rev.isAddressed 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                              >
                                <Check className="w-3 h-3 text-[#22C55E]" />
                                <span>{rev.isAddressed ? 'Addressed ✓' : 'Mark as Addressed'}</span>
                              </button>
                            </div>

                            <p className="text-slate-800 pl-1">{rev.note}</p>

                            {/* Existing Reply */}
                            {rev.editorReply && (
                              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px]">
                                <strong>Your Reply: </strong>
                                <span>{rev.editorReply}</span>
                              </div>
                            )}

                            {/* Reply Input Box */}
                            {activeReplyNoteId === rev.id ? (
                              <div className="pt-2 flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Write reply to client..."
                                  value={replyInputMap[rev.id] || ''}
                                  onChange={(e) => setReplyInputMap((prev) => ({ ...prev, [rev.id]: e.target.value }))}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#22C55E]"
                                />
                                <button
                                  onClick={() => handleSaveReply(rev.id)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                                >
                                  Send Reply
                                </button>
                                <button
                                  onClick={() => setActiveReplyNoteId(null)}
                                  className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="pt-1 flex justify-end">
                                <button
                                  onClick={() => setActiveReplyNoteId(rev.id)}
                                  className="text-[11px] font-bold text-[#22C55E] hover:underline cursor-pointer"
                                >
                                  {rev.editorReply ? 'Edit Reply' : 'Reply to Client'}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                        No revision notes submitted yet by client.
                      </div>
                    )}

                    {/* Editor Direct Note to Client */}
                    <form onSubmit={handleAddDirectQuestion} className="pt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask client a question or leave production note..."
                        value={editorDirectNote}
                        onChange={(e) => setEditorDirectNote(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#22C55E]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span>Post Note</span>
                      </button>
                    </form>
                  </div>

                  {/* 4. WORKFLOW STATUS ADVANCER WITH AUTOMATED NOTIFICATION */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-950">
                        Advance Status &amp; Dispatch Client Notification
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Clicking a status automatically updates the client dashboard and dispatches an automated notification email directly to the client's registered account.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => handleStatusChange('In Queue')}
                        className={`p-3 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                          activeProject.status === 'In Queue'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        1. In Queue
                      </button>

                      <button
                        onClick={() => handleStatusChange('Editing')}
                        className={`p-3 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                          activeProject.status === 'Editing'
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
                        }`}
                      >
                        2. In Production
                      </button>

                      <button
                        onClick={() => handleStatusChange('Review Ready')}
                        className={`p-3 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                          activeProject.status === 'Review Ready'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        3. Review Ready
                      </button>

                      <button
                        onClick={() => handleStatusChange('Completed')}
                        className={`p-3 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                          activeProject.status === 'Completed'
                            ? 'bg-[#22C55E] text-slate-950 border-[#22C55E]'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        4. Completed
                      </button>
                    </div>

                    {/* Deliver Preview URL Input */}
                    <form onSubmit={handleDeliverAndNotify} className="pt-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Deliver Draft Preview Video URL (Vimeo / Frame.io / Google Drive)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://vimeo.com/your-new-draft-id"
                          value={editorDeliverUrl}
                          onChange={(e) => setEditorDeliverUrl(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#22C55E]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5 text-[#22C55E]" />
                          <span>Deliver &amp; Notify</span>
                        </button>
                      </div>
                    </form>

                    {/* Security Confirmation Notice */}
                    <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                      <span>Automated status emails dispatch via backend SMTP queue without exposing client personal email or phone numbers.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

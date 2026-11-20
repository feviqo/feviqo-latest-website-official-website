import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bot,
  Briefcase,
  CheckCircle2,
  Clock,
  MessageSquare,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { AppRoute } from '../../types';
import { AdminPortalAuthGate } from '../admin/AdminPortalAuthGate';
import {
  VideoEditingLeadView,
  VideoLeadStage,
  WhatsAppConversationView,
  fetchAdminAutomationLeads,
  updateAdminVideoLead,
  toggleAdminConversationTakeover,
  sendAdminManualConversationReply,
} from '../../services/automationService';

interface AdminAutomationLeadsPageProps {
  onBookCall: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigatePricing: () => void;
  onNavigateFlow: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

const LEAD_STAGES: Array<{ id: VideoLeadStage; label: string; color: string }> = [
  { id: 'new', label: 'New', color: 'bg-sky-50 text-sky-800 border-sky-200' },
  { id: 'contacted', label: 'Contacted', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: 'qualified', label: 'Qualified', color: 'bg-amber-50 text-amber-900 border-amber-200' },
  { id: 'quote_sent', label: 'Quote Sent', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'booked', label: 'Booked', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'won', label: 'Won', color: 'bg-emerald-100 text-emerald-950 border-emerald-300' },
  { id: 'lost', label: 'Lost', color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

function formatDt(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function stageBadge(stage: VideoLeadStage): string {
  return LEAD_STAGES.find((s) => s.id === stage)?.color || 'bg-slate-100 text-slate-700 border-slate-200';
}

export const AdminAutomationLeadsPage: React.FC<AdminAutomationLeadsPageProps> = ({
  onBookCall,
  onNavigateSection,
  onNavigatePricing,
  onNavigateFlow,
  onNavigatePage,
}) => {
  const [leads, setLeads] = useState<VideoEditingLeadView[]>([]);
  const [conversations, setConversations] = useState<WhatsAppConversationView[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'leads' | 'inbox'>('leads');
  const [stageFilter, setStageFilter] = useState<'all' | VideoLeadStage>('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [leadBusy, setLeadBusy] = useState(false);

  // Conversations inbox state
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [takeoverBusy, setTakeoverBusy] = useState(false);

  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminAutomationLeads();
      if (!res.success) {
        setBanner({ type: 'error', text: res.error || 'Could not load leads & inbox.' });
        return;
      }
      const nextLeads = res.leads || [];
      const nextConvs = res.conversations || [];
      setLeads(nextLeads);
      setConversations(nextConvs);
      if (!selectedLeadId && nextLeads.length > 0) setSelectedLeadId(nextLeads[0].id);
      if (!selectedPhone && nextConvs.length > 0) setSelectedPhone(nextConvs[0].phoneE164);
    } catch {
      setBanner({ type: 'error', text: 'Network error loading leads & conversations.' });
    } finally {
      setLoading(false);
    }
  }, [selectedLeadId, selectedPhone]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (stageFilter !== 'all' && l.stage !== stageFilter) return false;
      if (leadSearch.trim()) {
        const q = leadSearch.trim().toLowerCase();
        const hay = `${l.fullName} ${l.email} ${l.companyOrAgency} ${l.editingService} ${l.whatsappNumber}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, stageFilter, leadSearch]);

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) || filteredLeads[0] || null,
    [leads, selectedLeadId, filteredLeads]
  );

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.phoneE164 === selectedPhone) || conversations[0] || null,
    [conversations, selectedPhone]
  );

  const handleUpdateLead = async (
    leadId: string,
    payload: Parameters<typeof updateAdminVideoLead>[1],
    successMsg: string
  ) => {
    setLeadBusy(true);
    setBanner(null);
    try {
      const res = await updateAdminVideoLead(leadId, payload);
      if (!res.success) {
        setBanner({ type: 'error', text: res.error || 'Could not update lead.' });
        return;
      }
      if (res.leads) setLeads(res.leads);
      if (res.conversations) setConversations(res.conversations);
      setBanner({ type: 'success', text: successMsg });
    } catch {
      setBanner({ type: 'error', text: 'Network error updating lead.' });
    } finally {
      setLeadBusy(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !noteInput.trim()) return;
    await handleUpdateLead(
      selectedLead.id,
      { addNote: noteInput.trim() },
      'Note saved to lead timeline.'
    );
    setNoteInput('');
  };

  const handleToggleTakeover = async (phoneE164: string, nextVal: boolean) => {
    setTakeoverBusy(true);
    setBanner(null);
    try {
      const res = await toggleAdminConversationTakeover(phoneE164, nextVal);
      if (res.conversations) setConversations(res.conversations);
      setBanner({
        type: res.success ? 'success' : 'error',
        text: res.success
          ? nextVal
            ? 'Human Takeover ENABLED — AI auto-reply is paused for this customer.'
            : 'Human Takeover released — AI assistant can assist this thread again.'
          : res.error || 'Could not toggle takeover.',
      });
    } catch {
      setBanner({ type: 'error', text: 'Network error toggling human takeover.' });
    } finally {
      setTakeoverBusy(false);
    }
  };

  const handleSendManualReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !replyInput.trim()) return;
    setSendingReply(true);
    setBanner(null);
    try {
      const res = await sendAdminManualConversationReply(
        selectedConversation.phoneE164,
        replyInput.trim()
      );
      if (res.conversations) setConversations(res.conversations);
      if (res.success) {
        setReplyInput('');
        setBanner({ type: 'success', text: 'Manual WhatsApp reply sent and logged.' });
      } else {
        setBanner({
          type: 'error',
          text: res.error || 'Reply logged but not dispatched (check WhatsApp API config / 24h window).',
        });
      }
    } catch {
      setBanner({ type: 'error', text: 'Network error sending manual reply.' });
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <AdminPortalAuthGate
      currentSection="leads"
      onBookCall={onBookCall}
      onNavigateSection={onNavigateSection}
      onNavigatePricing={onNavigatePricing}
      onNavigateFlow={onNavigateFlow}
      onNavigatePage={onNavigatePage}
    >
      {({ admin, renderSectionSwitcher }) => (
        <LeadsWorkspaceInner
          adminName={admin.name}
          adminEmail={admin.email}
          renderSectionSwitcher={renderSectionSwitcher}
          loading={loading}
          onLoad={loadData}
          banner={banner}
          setBanner={setBanner}
          activeView={activeView}
          setActiveView={setActiveView}
          leads={leads}
          filteredLeads={filteredLeads}
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          leadSearch={leadSearch}
          setLeadSearch={setLeadSearch}
          selectedLead={selectedLead}
          setSelectedLeadId={setSelectedLeadId}
          noteInput={noteInput}
          setNoteInput={setNoteInput}
          leadBusy={leadBusy}
          onUpdateLead={handleUpdateLead}
          onAddNote={handleAddNote}
          conversations={conversations}
          selectedConversation={selectedConversation}
          setSelectedPhone={setSelectedPhone}
          replyInput={replyInput}
          setReplyInput={setReplyInput}
          sendingReply={sendingReply}
          takeoverBusy={takeoverBusy}
          onToggleTakeover={handleToggleTakeover}
          onSendManualReply={handleSendManualReply}
        />
      )}
    </AdminPortalAuthGate>
  );
};

interface LeadsInnerProps {
  adminName: string;
  adminEmail: string;
  renderSectionSwitcher: () => React.ReactNode;
  loading: boolean;
  onLoad: () => Promise<void>;
  banner: { type: 'success' | 'error'; text: string } | null;
  setBanner: (b: { type: 'success' | 'error'; text: string } | null) => void;
  activeView: 'leads' | 'inbox';
  setActiveView: (v: 'leads' | 'inbox') => void;
  leads: VideoEditingLeadView[];
  filteredLeads: VideoEditingLeadView[];
  stageFilter: 'all' | VideoLeadStage;
  setStageFilter: (s: 'all' | VideoLeadStage) => void;
  leadSearch: string;
  setLeadSearch: (s: string) => void;
  selectedLead: VideoEditingLeadView | null;
  setSelectedLeadId: (id: string | null) => void;
  noteInput: string;
  setNoteInput: (v: string) => void;
  leadBusy: boolean;
  onUpdateLead: (
    leadId: string,
    payload: Parameters<typeof updateAdminVideoLead>[1],
    msg: string
  ) => Promise<void>;
  onAddNote: (e: React.FormEvent) => Promise<void>;
  conversations: WhatsAppConversationView[];
  selectedConversation: WhatsAppConversationView | null;
  setSelectedPhone: (p: string | null) => void;
  replyInput: string;
  setReplyInput: (v: string) => void;
  sendingReply: boolean;
  takeoverBusy: boolean;
  onToggleTakeover: (phone: string, nextVal: boolean) => Promise<void>;
  onSendManualReply: (e: React.FormEvent) => Promise<void>;
}

const LeadsWorkspaceInner: React.FC<LeadsInnerProps> = (props) => {
  useEffect(() => {
    void props.onLoad();
  }, [props.onLoad]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" />
            <span>FEVIQO Creative Services · Video Editing CRM &amp; WhatsApp Inbox</span>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#0F172A]">
            Video Editing Leads &amp; Unified WhatsApp Inbox
          </h1>
          <p className="text-xs text-slate-600">
            Separate pipeline for FEVIQO video editing clients, follow-up automation, human takeover, and live WhatsApp conversations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={props.onLoad}
            disabled={props.loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${props.loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {props.renderSectionSwitcher()}
        </div>
      </div>

      {props.banner && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start justify-between gap-3 ${
            props.banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-start gap-2">
            {props.banner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{props.banner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => props.setBanner(null)}
            className="text-xs font-semibold underline cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => props.setActiveView('leads')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition ${
            props.activeView === 'leads'
              ? 'bg-[#0F172A] text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Video Editing Leads Pipeline ({props.leads.length})</span>
        </button>
        <button
          type="button"
          onClick={() => props.setActiveView('inbox')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition ${
            props.activeView === 'inbox'
              ? 'bg-[#0F172A] text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp Conversations &amp; Takeover ({props.conversations.length})</span>
        </button>
      </div>

      {/* VIEW 1: VIDEO EDITING LEADS PIPELINE */}
      {props.activeView === 'leads' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => props.setStageFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  props.stageFilter === 'all'
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                All ({props.leads.length})
              </button>
              {LEAD_STAGES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => props.setStageFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                    props.stageFilter === st.id
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {st.label} ({props.leads.filter((l) => l.stage === st.id).length})
                </button>
              ))}
            </div>
            <input
              type="search"
              value={props.leadSearch}
              onChange={(e) => props.setLeadSearch(e.target.value)}
              placeholder="Search lead, company, service..."
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs w-64"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Lead List */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
              {props.filteredLeads.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No video editing leads match this filter yet.
                </div>
              ) : (
                props.filteredLeads.map((lead) => {
                  const isSelected = props.selectedLead?.id === lead.id;
                  return (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => props.setSelectedLeadId(lead.id)}
                      className={`w-full text-left p-4 transition cursor-pointer ${
                        isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#0F172A] truncate">
                            {lead.fullName}
                          </div>
                          <div className="text-xs text-slate-600 truncate">
                            {lead.companyOrAgency || lead.email}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase shrink-0 ${stageBadge(
                            lead.stage
                          )}`}
                        >
                          {lead.stage.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span>{lead.editingService || 'Video Editing'}</span>
                        <span>·</span>
                        <span>{formatDt(lead.createdAt)}</span>
                        {lead.whatsappConsent && (
                          <span className="text-[#16A34A] font-semibold">· WA Opt-In</span>
                        )}
                        {lead.isHighIntent && (
                          <span className="text-amber-700 font-bold">· High Intent</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Lead Inspector */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              {!props.selectedLead ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  Select a lead on the left to inspect requirements, update stage, manage follow-ups, or add notes.
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-xl font-bold text-[#0F172A]">
                        {props.selectedLead.fullName}
                      </h2>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {props.selectedLead.email} ·{' '}
                        <span className="font-mono">
                          {props.selectedLead.whatsappE164 || props.selectedLead.whatsappNumber || 'No WhatsApp'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        disabled={props.leadBusy}
                        value={props.selectedLead.stage}
                        onChange={(e) =>
                          props.onUpdateLead(
                            props.selectedLead!.id,
                            { stage: e.target.value as VideoLeadStage },
                            `Lead stage updated to ${e.target.value.replace('_', ' ')}.`
                          )
                        }
                        className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                      >
                        {LEAD_STAGES.map((st) => (
                          <option key={st.id} value={st.id}>
                            Stage: {st.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Structured Project Scope */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {[
                      { label: 'Company / Agency', value: props.selectedLead.companyOrAgency || '—' },
                      { label: 'Editing Service', value: props.selectedLead.editingService || '—' },
                      { label: 'Number of Videos', value: props.selectedLead.numberOfVideos || '—' },
                      { label: 'Video Duration', value: props.selectedLead.videoDuration || '—' },
                      { label: 'Project Deadline', value: props.selectedLead.projectDeadline || '—' },
                      { label: 'Budget Range', value: props.selectedLead.budgetRange || '—' },
                    ].map((field) => (
                      <div key={field.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                          {field.label}
                        </div>
                        <div className="font-semibold text-[#0F172A] mt-0.5 break-words">
                          {field.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {(props.selectedLead.referenceLinks || props.selectedLead.additionalInstructions) && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      {props.selectedLead.referenceLinks && (
                        <div>
                          <span className="font-bold text-slate-700">Reference Links: </span>
                          <span className="text-slate-600 break-all">
                            {props.selectedLead.referenceLinks}
                          </span>
                        </div>
                      )}
                      {props.selectedLead.additionalInstructions && (
                        <div>
                          <span className="font-bold text-slate-700">Additional Instructions: </span>
                          <span className="text-slate-600 whitespace-pre-wrap">
                            {props.selectedLead.additionalInstructions}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Automation & Takeover Controls */}
                  <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-[#0F172A]">
                          WhatsApp Follow-Up &amp; Human Takeover Controls
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Consent: <strong>{props.selectedLead.whatsappConsent ? 'Yes' : 'No'}</strong> ·
                          Follow-ups sent: <strong>{props.selectedLead.followUpsSentCount}</strong> ·
                          Source: <span className="font-mono">{props.selectedLead.source}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={props.leadBusy}
                          onClick={() =>
                            props.onUpdateLead(
                              props.selectedLead!.id,
                              { followUpPaused: !props.selectedLead!.followUpPaused },
                              props.selectedLead!.followUpPaused
                                ? 'Follow-up automation resumed.'
                                : 'Follow-up automation paused for this lead.'
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                            props.selectedLead.followUpPaused
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-white border-slate-300 text-slate-700'
                          }`}
                        >
                          {props.selectedLead.followUpPaused ? (
                            <PlayCircle className="w-3.5 h-3.5" />
                          ) : (
                            <PauseCircle className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {props.selectedLead.followUpPaused ? 'Resume Follow-Ups' : 'Pause Follow-Ups'}
                          </span>
                        </button>

                        <button
                          type="button"
                          disabled={props.leadBusy}
                          onClick={() =>
                            props.onUpdateLead(
                              props.selectedLead!.id,
                              { humanTakeover: !props.selectedLead!.humanTakeover },
                              props.selectedLead!.humanTakeover
                                ? 'Human takeover released.'
                                : 'Human takeover enabled — AI auto-reply paused.'
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                            props.selectedLead.humanTakeover
                              ? 'bg-[#0F172A] text-white border-[#0F172A]'
                              : 'bg-white border-slate-300 text-slate-700'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>
                            {props.selectedLead.humanTakeover ? 'Human Takeover ON' : 'Take Over Lead'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Schedule Follow-Up:
                      </span>
                      {(
                        [
                          { id: 'lead_followup_pricing', label: 'Pricing Check-In' },
                          { id: 'lead_followup_quote', label: 'Quote Follow-Up' },
                          { id: 'lead_followup_booking', label: 'Booking Reminder' },
                          { id: 'lead_followup_returning', label: 'Returning Client' },
                        ] as const
                      ).map((btn) => (
                        <button
                          key={btn.id}
                          type="button"
                          disabled={props.leadBusy || !props.selectedLead?.whatsappConsent}
                          onClick={() =>
                            props.onUpdateLead(
                              props.selectedLead!.id,
                              { scheduleFollowUpType: btn.id },
                              `Scheduled "${btn.label}" follow-up.`
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-[11px] font-semibold text-slate-800 cursor-pointer"
                        >
                          + {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Notes */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-[#0F172A]">Internal Team Notes</div>
                    <form onSubmit={props.onAddNote} className="flex gap-2">
                      <input
                        type="text"
                        value={props.noteInput}
                        onChange={(e) => props.setNoteInput(e.target.value)}
                        placeholder="Add quote details, call notes, or editor assignment..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                      <button
                        type="submit"
                        disabled={props.leadBusy || !props.noteInput.trim()}
                        className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] hover:text-[#0F172A] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Add Note
                      </button>
                    </form>
                    {props.selectedLead.notes.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {props.selectedLead.notes.map((n) => (
                          <div
                            key={n.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                          >
                            <div className="text-[#0F172A]">{n.text}</div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              {n.author} · {formatDt(n.createdAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: UNIFIED WHATSAPP CONVERSATIONS & HUMAN TAKEOVER */}
      {props.activeView === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Thread List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 max-h-[650px] overflow-y-auto">
            {props.conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No WhatsApp conversations yet. Incoming messages from Meta Webhook will appear here automatically.
              </div>
            ) : (
              props.conversations.map((conv) => {
                const isSelected = props.selectedConversation?.phoneE164 === conv.phoneE164;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => props.setSelectedPhone(conv.phoneE164)}
                    className={`w-full text-left p-4 transition cursor-pointer ${
                      isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[#0F172A] truncate">
                          {conv.contactName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">{conv.phoneE164}</div>
                      </div>
                      {conv.humanTakeover && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold shrink-0">
                          HUMAN
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="uppercase font-semibold">{conv.intent}</span>
                      <span>{formatDt(conv.lastMessageAt)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Thread Messages */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 flex flex-col h-[650px]">
            {!props.selectedConversation ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500 p-8">
                Select a WhatsApp conversation to view history, enable Human Takeover, or send a manual reply.
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-[#0F172A]">
                      {props.selectedConversation.contactName}{' '}
                      <span className="font-mono text-xs text-slate-500 font-normal">
                        ({props.selectedConversation.phoneE164})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Intent: {props.selectedConversation.intent}</span>
                      <span>·</span>
                      <span>Lang: {props.selectedConversation.language}</span>
                      {props.selectedConversation.escalatedReason && (
                        <span className="text-red-600 font-semibold">
                          · Escalated: {props.selectedConversation.escalatedReason}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={props.takeoverBusy}
                    onClick={() =>
                      props.onToggleTakeover(
                        props.selectedConversation!.phoneE164,
                        !props.selectedConversation!.humanTakeover
                      )
                    }
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition ${
                      props.selectedConversation.humanTakeover
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-[#0F172A] hover:bg-[#22C55E] hover:text-[#0F172A] text-white'
                    }`}
                  >
                    {props.selectedConversation.humanTakeover ? (
                      <>
                        <Bot className="w-3.5 h-3.5" />
                        <span>Resume AI Assistant</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Enable Human Takeover</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                  {props.selectedConversation.messages.map((msg) => {
                    const isCustomer = msg.direction === 'inbound';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs space-y-1 ${
                            isCustomer
                              ? 'bg-white border border-slate-200 text-[#0F172A]'
                              : msg.sender === 'admin'
                              ? 'bg-[#0F172A] text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          <div className="text-[10px] opacity-75 uppercase font-bold">
                            {msg.sender} · {formatDt(msg.createdAt)}
                          </div>
                          <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form
                  onSubmit={props.onSendManualReply}
                  className="p-4 border-t border-slate-200 flex gap-2 bg-white rounded-b-2xl"
                >
                  <input
                    type="text"
                    value={props.replyInput}
                    onChange={(e) => props.setReplyInput(e.target.value)}
                    placeholder="Type a manual WhatsApp reply (within 24h customer care window)..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0F172A]"
                  />
                  <button
                    type="submit"
                    disabled={props.sendingReply || !props.replyInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] hover:text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{props.sendingReply ? 'Sending...' : 'Send Reply'}</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

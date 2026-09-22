import React, { useState, useEffect } from 'react';
import { 
  Building2, Globe, Mail, Phone, ExternalLink, Plus, 
  KeyRound, Check, Copy, UserCheck, ShieldCheck, X, Sparkles, Send, Lock, Image as ImageIcon,
  Archive, ShieldAlert, RefreshCw, Trash2, Eye, UserX, UserCheck2, AlertCircle, MessageSquare, Users
} from 'lucide-react';
import { ClientProfile, ClientProject, LeadBooking, SimulatedEmail, ChatMessage } from '../../types';
import { AuthSession } from './flowData';
import { AdminAssetManager } from './AdminAssetManager';
import { WhatsAppChat } from './WhatsAppChat';

interface AdminWorkspaceProps {
  session: AuthSession;
  clients: ClientProfile[];
  projects: ClientProject[];
  leads: LeadBooking[];
  emails: SimulatedEmail[];
  editors?: any[];
  onAddNewClient: (newClientData: any) => Promise<{ success: boolean; client?: ClientProfile; oneTimePassword?: string } | void> | void;
  onUpdateClientStatus?: (clientId: string, status: 'Active' | 'Paused' | 'Archived' | 'Disabled') => Promise<void> | void;
  onResetClientPassword?: (clientId: string, newPassword?: string) => Promise<{ success: boolean; temporaryPassword?: string }>;
  onDeleteClient?: (clientId: string, permanent?: boolean) => Promise<void> | void;
  onSwitchToClientSession: (client: ClientProfile) => void;
  onUpdateLead?: (lead: LeadBooking) => void;
  onDeleteLead?: (leadId: string) => void;
  onReassignClientEditor?: (clientId: string, newEditor: string) => void;
  onSendChatMessage?: (projectId: string, message: Omit<ChatMessage, 'id' | 'projectId'>) => void;
  onDeleteEmail?: (emailId: string) => void;
  onClearAllEmails?: () => void;
  onAddNewEditor?: (editorData: any) => Promise<void> | void;
  onUpdateEditor?: (editorId: string, data: any) => Promise<void> | void;
  onDeleteEditor?: (editorId: string) => Promise<void> | void;
}

export const AdminWorkspace: React.FC<AdminWorkspaceProps> = ({
  session,
  clients,
  projects,
  leads,
  emails,
  editors = [],
  onAddNewClient,
  onUpdateClientStatus,
  onResetClientPassword,
  onDeleteClient,
  onSwitchToClientSession,
  onUpdateLead,
  onDeleteLead,
  onReassignClientEditor,
  onSendChatMessage,
  onDeleteEmail,
  onClearAllEmails,
  onAddNewEditor,
  onUpdateEditor,
  onDeleteEditor,
}) => {
  const [adminTab, setAdminTab] = useState<'clients' | 'projects' | 'leads' | 'emails' | 'editors' | 'assets'>('clients');
  const [clientStatusFilter, setClientStatusFilter] = useState<'All' | 'Active' | 'Paused' | 'Archived' | 'Disabled'>('All');
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isOnboardEditorModalOpen, setIsOnboardEditorModalOpen] = useState(false);
  const [editingEditor, setEditingEditor] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [testEmailRecipient, setTestEmailRecipient] = useState('partner@feviqo.com');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<any | null>(null);

  // SMTP & Resend Configurator State
  const [smtpUser, setSmtpUser] = useState('partner@feviqo.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendFrom, setResendFrom] = useState('FEVIQO Studio <partner@feviqo.com>');
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpSaveResult, setSmtpSaveResult] = useState<any | null>(null);
  const [activeSmtpInfo, setActiveSmtpInfo] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/notifications/smtp-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.isConfigured) {
          setActiveSmtpInfo(data);
          if (data.user) setSmtpUser(data.user);
          if (data.host) setSmtpHost(data.host);
          if (data.port) setSmtpPort(String(data.port));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSmtp = async () => {
    if ((!smtpUser || !smtpPass) && !resendApiKey) {
      setToastMsg('Please enter either your SMTP Email & App Password OR Resend API Key.');
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    setIsSavingSmtp(true);
    setSmtpSaveResult(null);
    try {
      const res = await fetch('/api/notifications/save-smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: smtpUser,
          pass: smtpPass,
          host: smtpHost,
          port: Number(smtpPort),
          resendApiKey,
          resendFrom,
          testRecipient: testEmailRecipient || smtpUser,
        }),
      });
      const json = await res.json();
      setSmtpSaveResult(json);
      if (json.success) {
        setToastMsg(`✅ Email Provider Connected & Verified! Test email sent.`);
        setActiveSmtpInfo({ isConfigured: true, user: smtpUser || 'Resend API', host: smtpHost, port: Number(smtpPort) });
      } else {
        setToastMsg(`❌ Connection failed. Check error details below.`);
      }
      setTimeout(() => setToastMsg(''), 5000);
    } catch (err: any) {
      setSmtpSaveResult({ success: false, error: err.message || 'Failed to connect to server.' });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      setToastMsg('Please enter a valid recipient email address.');
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    setIsSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/notifications/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmailRecipient }),
      });
      const json = await res.json();
      setTestEmailResult(json);
      setToastMsg(json.success ? `Test email sent to ${testEmailRecipient}!` : 'Dispatch failed. See details below.');
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err: any) {
      setTestEmailResult({ success: false, error: err.message || 'Network error sending test email' });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Editor CRUD Form State
  const [newEditorName, setNewEditorName] = useState('');
  const [newEditorEmail, setNewEditorEmail] = useState('');
  const [newEditorPassword, setNewEditorPassword] = useState('editor123');
  const [newEditorRole, setNewEditorRole] = useState('Senior Video Editor');
  const [newEditorSpecialty, setNewEditorSpecialty] = useState('Short-Form Viral & YouTube');
  const [newEditorCapacity, setNewEditorCapacity] = useState('4');
  const [isSubmittingEditor, setIsSubmittingEditor] = useState(false);

  // New Client Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('pass' + Math.floor(1000 + Math.random() * 9000));
  const [newCompany, setNewCompany] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newPhone, setNewPhone] = useState('+1 (555) ');
  const [newPlan, setNewPlan] = useState<string>('Pro ($2,299/mo)');
  const [newEditor, setNewEditor] = useState('Studio Lead Editor');
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);

  // Success summary modal state (stores one-time initial password)
  const [createdClientSummary, setCreatedClientSummary] = useState<{ client: ClientProfile; temporaryPassword?: string } | null>(null);

  // Password reset modal state
  const [resetPasswordTarget, setResetPasswordTarget] = useState<ClientProfile | null>(null);
  const [customResetPassword, setCustomResetPassword] = useState('');
  const [resetPasswordResult, setResetPasswordResult] = useState<{ temporaryPassword: string; clientName: string; email: string } | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Delete/Archive confirmation modal
  const [clientToArchiveOrDelete, setClientToArchiveOrDelete] = useState<ClientProfile | null>(null);

  // Active WhatsApp chat intervention modal
  const [activeChatProject, setActiveChatProject] = useState<ClientProject | null>(null);

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let res = 'Fv-';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    res += '!';
    setNewPassword(res);
  };

  const handleCreateClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    let cleanWebsite = newWebsite.trim();
    if (cleanWebsite && !cleanWebsite.startsWith('http')) {
      cleanWebsite = 'https://' + cleanWebsite;
    }

    setIsSubmittingClient(true);
    try {
      const newProfileData = {
        id: 'cli-' + Date.now(),
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword.trim(),
        company: newCompany.trim() || newName.trim() + ' Media',
        website: cleanWebsite || 'https://clientbrand.com',
        phone: newPhone.trim() || '+1 (555) 000-0000',
        country: 'United States',
        countryFlag: '🇺🇸',
        plan: newPlan,
        monthlySpend: newPlan.includes('5,999') || newPlan.includes('4,999') || newPlan.includes('4,699')
          ? (newPlan.includes('Yearly') ? 4699 : newPlan.includes('Quarterly') ? 4999 : 5999)
          : newPlan.includes('2,299') || newPlan.includes('1,999') || newPlan.includes('1,799')
          ? (newPlan.includes('Yearly') ? 1799 : newPlan.includes('Quarterly') ? 1999 : 2299)
          : (newPlan.includes('Yearly') ? 899 : newPlan.includes('Quarterly') ? 999 : 1299),
        status: 'Active' as const,
        joinedDate: 'Today',
        activeProjectsCount: 0,
        assignedEditor: newEditor,
      };

      const result = await onAddNewClient(newProfileData);
      setIsOnboardModalOpen(false);

      if (result && result.client) {
        setCreatedClientSummary({
          client: result.client,
          temporaryPassword: result.oneTimePassword || newPassword.trim(),
        });
      } else {
        setCreatedClientSummary({
          client: newProfileData as ClientProfile,
          temporaryPassword: newPassword.trim(),
        });
      }

      // Reset form
      setNewName('');
      setNewEmail('');
      setNewCompany('');
      setNewWebsite('');
      setNewPhone('+1 (555) ');
      handleGeneratePassword();
    } catch (err) {
      console.error('Client creation failed:', err);
    } finally {
      setIsSubmittingClient(false);
    }
  };

  const handleExecutePasswordReset = async () => {
    if (!resetPasswordTarget || !onResetClientPassword) return;
    setIsResettingPassword(true);
    try {
      const res = await onResetClientPassword(resetPasswordTarget.id, customResetPassword || undefined);
      if (res && res.success && res.temporaryPassword) {
        setResetPasswordResult({
          temporaryPassword: res.temporaryPassword,
          clientName: resetPasswordTarget.name,
          email: resetPasswordTarget.email,
        });
        setResetPasswordTarget(null);
        setCustomResetPassword('');
      } else {
        setToastMsg('Failed to reset password. Please try again.');
        setTimeout(() => setToastMsg(''), 3000);
      }
    } catch (err) {
      console.error('Password reset error:', err);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleUpdateStatus = async (clientId: string, newStatus: 'Active' | 'Paused' | 'Archived' | 'Disabled') => {
    if (onUpdateClientStatus) {
      await onUpdateClientStatus(clientId, newStatus);
      setToastMsg(`Client status changed to ${newStatus}`);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleConfirmArchive = async (client: ClientProfile) => {
    if (onUpdateClientStatus) {
      await onUpdateClientStatus(client.id, 'Archived');
      setToastMsg(`${client.name} has been safely archived.`);
      setTimeout(() => setToastMsg(''), 3000);
    }
    setClientToArchiveOrDelete(null);
  };

  const handleConfirmPermanentDelete = async (client: ClientProfile) => {
    if (onDeleteClient) {
      await onDeleteClient(client.id, true);
      setToastMsg(`${client.name} permanently removed.`);
      setTimeout(() => setToastMsg(''), 3000);
    }
    setClientToArchiveOrDelete(null);
  };

  const handleCopyCredentials = (emailToCopy: string, passToCopy: string) => {
    const credText = `FEVIQO Flow Client Portal Login Details:\nPortal URL: ${window.location.origin}/flow\nEmail: ${emailToCopy}\nTemporary Password: ${passToCopy}\n\n*Note: Please change your password upon your first sign in.*`;
    navigator.clipboard.writeText(credText);
    setToastMsg('Login credentials copied to clipboard!');
    setTimeout(() => setToastMsg(''), 3500);
  };

  const filteredClients = clients.filter((c) => {
    if (clientStatusFilter === 'All') return true;
    return c.status === clientStatusFilter;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white border border-[#22C55E]/50 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Header: Signature Forest Green Brand Treatment */}
      <div className="w-full max-w-full overflow-hidden bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-[#064e3b]/90 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative box-border">
        <div className="space-y-2 relative z-10 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#021f12]/80 text-[#22C55E] border border-emerald-500/30 shadow-xs">
              Executive Owner Admin
            </span>
            <span className="text-xs text-emerald-200/80 font-semibold">• Production Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            FEVIQO Studio Headquarters
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Create client accounts with isolated dashboards, manage websites, inspect tasks, and track pipeline.
          </p>
        </div>

        {/* Action Button: Onboard New Client */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setIsOnboardModalOpen(true)}
            className="px-6 py-3.5 rounded-full bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2 hover:scale-[1.02] active:scale-100"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>Onboard New Client (Create Login)</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-emerald-500/30 shadow-md text-center text-white">
          <div className="text-2xl font-black text-white">{clients.length}</div>
          <div className="text-[10px] font-bold text-emerald-200/80 uppercase tracking-wider">Active Clients</div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-emerald-500/30 shadow-md text-center text-white">
          <div className="text-2xl font-black text-[#22C55E]">{projects.length}</div>
          <div className="text-[10px] font-bold text-emerald-200/80 uppercase tracking-wider">Video Projects</div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-emerald-500/30 shadow-md text-center text-white">
          <div className="text-2xl font-black text-white">
            ${clients.reduce((acc, c) => acc + (c.monthlySpend || 0), 0).toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-emerald-200/80 uppercase tracking-wider">Active MRR</div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border border-emerald-500/30 shadow-md text-center text-white">
          <div className="text-2xl font-black text-white">{emails.length}</div>
          <div className="text-[10px] font-bold text-emerald-200/80 uppercase tracking-wider">Automated Dispatches</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setAdminTab('clients')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            adminTab === 'clients'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          Clients & Separate Dashboards ({clients.length})
        </button>
        <button
          onClick={() => setAdminTab('projects')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            adminTab === 'projects'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          All Video Projects ({projects.length})
        </button>
        <button
          onClick={() => setAdminTab('leads')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            adminTab === 'leads'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          Strategy Call Bookings ({leads.length})
        </button>
        <button
          onClick={() => setAdminTab('emails')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            adminTab === 'emails'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          Automated Email Dispatches ({emails.length})
        </button>
        <button
          onClick={() => setAdminTab('editors')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'editors'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Editor Roster & Access ({editors.length})</span>
        </button>
        <button
          onClick={() => setAdminTab('assets')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'assets'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Website Media & Assets</span>
        </button>
      </div>

      {/* TAB 1: CLIENTS & WEBSITES */}
      {adminTab === 'clients' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-950">Brand Clients & Portal Access</h3>
              <p className="text-xs text-slate-500">Every client has a cryptographically isolated workspace with salted PBKDF2 hashed credentials.</p>
            </div>

            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Client</span>
            </button>
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
            {(['All', 'Active', 'Paused', 'Archived', 'Disabled'] as const).map((st) => {
              const count = st === 'All' ? clients.length : clients.filter((c) => c.status === st).length;
              const isSelected = clientStatusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setClientStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full transition cursor-pointer whitespace-nowrap text-xs font-bold ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>

          {/* Clients Grid */}
          {filteredClients.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No clients found matching status: <strong className="text-slate-600">{clientStatusFilter}</strong>.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((c) => {
                const statusBadgeStyle = 
                  c.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  c.status === 'Paused' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  c.status === 'Disabled' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                  'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <div key={c.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-500">{c.countryFlag || '🌐'} {c.country}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeStyle}`}>
                          {c.status}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-950 mt-2">{c.name}</h4>
                      <p className="text-xs text-slate-600 font-medium">{c.company}</p>
                    </div>

                    {/* Details Card */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Globe className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                        <a 
                          href={c.website} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-bold text-slate-900 hover:text-[#22C55E] hover:underline flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{c.website.replace('https://', '')}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium">{c.email}</span>
                      </div>

                      {/* Zero-Trust Security Row: No plaintext passwords displayed */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-500">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                          <span>Auth: <strong className="text-slate-800 font-mono">PBKDF2 Hashed</strong></span>
                        </div>
                        <button
                          onClick={() => setResetPasswordTarget(c)}
                          className="text-amber-700 hover:text-amber-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          title="Reset and issue new temporary password"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[11px] pt-1">
                        <span className="text-slate-500 flex items-center gap-1 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                          <span>Assigned Editor:</span>
                        </span>
                        <select
                          value={c.assignedEditor || 'Marco Silvestri'}
                          onChange={(e) => {
                            const newEd = e.target.value;
                            if (onReassignClientEditor) {
                              onReassignClientEditor(c.id, newEd);
                              setToastMsg(`Assigned ${c.name} to ${newEd}!`);
                              setTimeout(() => setToastMsg(''), 3000);
                            }
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold px-2 py-0.5 rounded-lg border border-slate-300 text-[11px] focus:outline-none focus:border-[#22C55E] cursor-pointer"
                        >
                          {editors && editors.length > 0 ? (
                            editors.map((ed: any) => (
                              <option key={ed.id} value={ed.name}>
                                {ed.name}
                              </option>
                            ))
                          ) : (
                            <option value={c.assignedEditor || 'Studio Lead Editor'}>
                              {c.assignedEditor || 'Studio Lead Editor'}
                            </option>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Plan & Action Row */}
                    <div className="pt-2 border-t border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">{c.plan}</span>
                        <span className="font-black text-slate-950">${c.monthlySpend}/mo</span>
                      </div>

                      {/* Status quick control */}
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-medium">Status:</span>
                        {c.status === 'Active' ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'Paused')}
                              className="px-2 py-0.5 rounded bg-amber-100/70 hover:bg-amber-100 text-amber-900 font-semibold text-[10px] transition cursor-pointer"
                              title="Temporarily pause project queue"
                            >
                              Pause
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'Disabled')}
                              className="px-2 py-0.5 rounded bg-rose-100/70 hover:bg-rose-100 text-rose-900 font-semibold text-[10px] transition cursor-pointer"
                              title="Block client login"
                            >
                              Disable
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'Active')}
                            className="px-2.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Reactivate</span>
                          </button>
                        )}

                        <div className="ml-auto">
                          <button
                            onClick={() => setClientToArchiveOrDelete(c)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            title="Archive or Delete client"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Primary buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setResetPasswordTarget(c)}
                          className="py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                        >
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          <span>Reset Pass</span>
                        </button>

                        <button
                          onClick={() => onSwitchToClientSession(c)}
                          className="py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
                          title="Log into this client's private dashboard to test it"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Test Portal</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL PROJECTS */}
      {adminTab === 'projects' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-black text-slate-950 mb-4">All Active Client Video Requests</h3>
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-950 text-sm">{p.title}</span>
                    <span className="text-slate-400">• {p.videoType}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Client: <strong className="text-slate-800">{p.clientName || p.clientEmail}</strong> ({p.clientCompany || 'Direct'}) • Editor: {p.editorName}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full font-bold ${
                    p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    p.status === 'Review Ready' ? 'bg-amber-100 text-amber-800' :
                    p.status === 'Editing' ? 'bg-sky-100 text-sky-800' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {p.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveChatProject(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#005C4B] hover:bg-[#00473a] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    title="Open live WhatsApp chat to monitor or intervene"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Live Chat</span>
                    {p.chatMessages && p.chatMessages.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                        {p.chatMessages.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LEADS */}
      {adminTab === 'leads' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-950">Strategy Call Bookings & Inbound Pipeline</h3>
              <p className="text-xs text-slate-500">Real client submissions stored securely on server disk.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
              {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'}
            </span>
          </div>
          {leads.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No strategy call bookings recorded yet. New submissions will automatically appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((l) => (
                <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-950 text-sm">{l.firstName} {l.lastName}</span>
                      <span className="text-slate-400">•</span>
                      <a href={`mailto:${l.email}`} className="text-emerald-700 font-semibold hover:underline">{l.email}</a>
                      {l.phoneNumber && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 font-mono">{l.countryCode ? `${l.countryCode} ` : ''}{l.phoneNumber}</span>
                        </>
                      )}
                      {l.company && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="bg-slate-200/80 px-2 py-0.5 rounded-md font-bold text-slate-800 text-[11px]">{l.company}</span>
                        </>
                      )}
                      {l.website && (
                        <>
                          <span className="text-slate-400">•</span>
                          <a href={l.website.startsWith('http') ? l.website : `https://${l.website}`} target="_blank" rel="noopener noreferrer" className="text-sky-600 font-medium hover:underline text-[11px]">{l.website}</a>
                        </>
                      )}
                    </div>
                    <div className="text-slate-500">
                      Industry: <strong className="text-slate-800">{l.industry || 'General'}</strong> • Volume: <strong className="text-slate-800">{l.monthlyVolume || '1-4'} vids/mo</strong> • Format: <strong className="text-slate-800">{l.videoType || 'Short-Form'}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Requested Slot: <span className="font-semibold text-slate-700">{l.preferredDate || 'Flexible'} at {l.preferredTime || 'Anytime'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status selector */}
                    <select
                      value={l.status || 'New'}
                      onChange={(e) => {
                        const updated = { ...l, status: e.target.value as any };
                        if (onUpdateLead) onUpdateLead(updated);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs focus:outline-hidden focus:border-[#22C55E]"
                    >
                      <option value="New">🟢 New</option>
                      <option value="Contacted">🟡 Contacted</option>
                      <option value="Scheduled">🔵 Scheduled</option>
                      <option value="Proposal Sent">🟣 Proposal Sent</option>
                      <option value="Closed Won">🏆 Closed Won</option>
                      <option value="Archived">⚪ Archived</option>
                    </select>

                    {/* Convert to Client Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setNewName(`${l.firstName} ${l.lastName}`.trim());
                        setNewEmail(l.email);
                        setNewCompany(`${l.firstName}'s Brand`);
                        setNewPhone(l.phoneNumber ? `${l.countryCode || '+1'} ${l.phoneNumber}` : '+1 (555) ');
                        setIsOnboardModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#032415] hover:bg-[#04331e] text-[#DBFF4C] font-bold text-xs transition cursor-pointer"
                      title="Convert to Active Client Account"
                    >
                      Convert to Client
                    </button>

                    {/* Delete Lead Button */}
                    {onDeleteLead && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove lead ${l.firstName} ${l.lastName}?`)) {
                            onDeleteLead(l.id);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 font-bold text-xs transition cursor-pointer"
                        title="Delete Lead"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EMAILS (Automated Email Dispatches with Live SMTP Setup & Diagnostics) */}
      {adminTab === 'emails' && (
        <div className="space-y-6">
          {/* Live SMTP Configurator & Verification Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <span>Live SMTP Configurator & Email Diagnostic Center</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connect your Gmail / Workspace App Password or SMTP server to send live strategy call booking alerts directly to your inbox.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                {activeSmtpInfo?.isConfigured ? (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    SMTP Connected ({activeSmtpInfo.user})
                  </span>
                ) : (
                  <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                    ⚠️ SMTP Pending
                  </span>
                )}
              </div>
            </div>

            {/* Config Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">SMTP Email Address</label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="e.g. partner@feviqo.com or rexanmedia01@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Google 16-Char App Password
                </label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="e.g. abcd efgh ijkl mnop"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Port & Protocol</label>
                <select
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="465">Port 465 (SSL / Recommended)</option>
                  <option value="587">Port 587 (TLS / STARTTLS)</option>
                </select>
              </div>
            </div>

            {/* Resend API Key Section */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <span>Resend API Key (Optional HTTP Fallback)</span>
                </label>
                <input
                  type="password"
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder="re_123456789..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Resend Verified Sender</label>
                <input
                  type="text"
                  value={resendFrom}
                  onChange={(e) => setResendFrom(e.target.value)}
                  placeholder="FEVIQO Studio <partner@feviqo.com> or <onboarding@resend.dev>"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Action Bar & Quick Instructions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed max-w-xl">
                <strong className="text-emerald-400 block mb-0.5">💡 Gmail App Password Setup (30 Seconds):</strong>
                Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline hover:text-sky-300">myaccount.google.com/apppasswords</a> with 2-Step Verification ON $\rightarrow$ Create an App Password $\rightarrow$ Paste the 16 letters above.
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveSmtp}
                  disabled={isSavingSmtp}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSavingSmtp ? 'Verifying Connection...' : 'Verify & Connect Live SMTP'}
                </button>
              </div>
            </div>

            {/* Test Send Section */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-2">
              <span className="text-xs font-bold text-slate-400 shrink-0">Test Recipient:</span>
              <input
                type="email"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="Where to send test email (e.g. partner@feviqo.com)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTestEmail}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-1.5 rounded-xl text-xs transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSendingTestEmail ? 'Sending Test...' : 'Send Test Notification'}
              </button>
            </div>

            {/* Save / Verify Result Diagnostic Box */}
            {smtpSaveResult && (
              <div className={`p-4 rounded-2xl text-xs font-mono space-y-2 ${smtpSaveResult.success ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200' : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'}`}>
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>{smtpSaveResult.success ? '✅ SMTP Connection Verified & Saved!' : '❌ SMTP Connection Handshake Failed'}</span>
                  {smtpSaveResult.config && <span>{smtpSaveResult.config.host}:{smtpSaveResult.config.port}</span>}
                </div>
                {smtpSaveResult.message && (
                  <div className="text-emerald-300 font-semibold">{smtpSaveResult.message}</div>
                )}
                {smtpSaveResult.error && (
                  <div className="text-rose-300 space-y-1">
                    <div><strong>Error Detail:</strong> {smtpSaveResult.error}</div>
                    {smtpSaveResult.rawError && <div className="text-[11px] opacity-80">Raw Error: {smtpSaveResult.rawError}</div>}
                  </div>
                )}
              </div>
            )}

            {/* Quick Test Result Diagnostic Box */}
            {testEmailResult && (
              <div className={`p-4 rounded-2xl text-xs font-mono space-y-2 ${testEmailResult.success ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'}`}>
                <div className="flex items-center justify-between font-bold">
                  <span>{testEmailResult.success ? '✅ Dispatch Succeeded' : '❌ Test Dispatch Result'}</span>
                  <span>Provider: {testEmailResult.provider || testEmailResult.diagnostics?.provider || 'SMTP'}</span>
                </div>
                {testEmailResult.diagnostics && (
                  <div className="text-[11px] space-y-1 pt-1 border-t border-slate-800 text-slate-300">
                    <div>Target Recipient: <strong>{testEmailResult.diagnostics.targetEmail}</strong></div>
                    <div>SMTP Active: <strong>{testEmailResult.diagnostics.smtpConfigured ? 'YES' : 'NO'}</strong></div>
                  </div>
                )}
                {testEmailResult.error && (
                  <div className="text-rose-400 text-[11px]">Error: {testEmailResult.error}</div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-950">Automated Status Email Dispatch Log</h3>
                <p className="text-xs text-slate-500">
                  Live audit trail of automated status notifications and deliverables dispatched to clients and studio partners.
                </p>
              </div>

            {emails.length > 0 && onClearAllEmails && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all automated email dispatch logs?')) {
                    onClearAllEmails();
                    setToastMsg('All email dispatch logs cleared.');
                    setTimeout(() => setToastMsg(''), 3500);
                  }
                }}
                className="px-3.5 py-1.5 rounded-full border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Logs</span>
              </button>
            )}
          </div>

          {emails.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No email dispatches logged yet. When project statuses advance or strategy calls are booked, logs appear here automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((em) => (
                <div key={em.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 relative group hover:border-slate-300 transition">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-slate-950 text-sm">{em.subject}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-slate-400 text-[11px]">{em.timestamp}</span>
                      {onDeleteEmail && (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteEmail(em.id);
                            setToastMsg('Email dispatch record deleted.');
                            setTimeout(() => setToastMsg(''), 3000);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete this email record from log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1">
                    <span>Recipient:</span>
                    <strong className="text-slate-900">{em.recipientName}</strong>
                    <span className="text-slate-400 font-mono">&lt;{em.to}&gt;</span>
                  </div>
                  <p className="text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed font-sans">
                    {em.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* TAB 5: EDITORS ROSTER & CRUD ACCESS */}
      {adminTab === 'editors' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-950">Production Editor Team & Capacity</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {editors.length} Active Editors
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manage editor credentials, monitor current workload capacity, and onboard new talent to the FEVIQO roster.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingEditor(null);
                setNewEditorName('');
                setNewEditorEmail('');
                setNewEditorPassword('editor123');
                setNewEditorRole('Senior Video Editor');
                setNewEditorSpecialty('Short-Form Viral & YouTube');
                setNewEditorCapacity('4');
                setIsOnboardEditorModalOpen(true);
              }}
              className="px-4 py-2 rounded-full bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Onboard New Editor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editors.map((ed: any) => {
              const assignedProjects = projects.filter(
                (p) => p.editorName?.toLowerCase() === ed.name?.toLowerCase()
              );
              const activeProjectsCount = assignedProjects.filter(
                (p) => p.status !== 'Completed'
              ).length;
              const maxCapacity = ed.capacity || 4;
              const capacityPercentage = Math.min(100, Math.round((activeProjectsCount / maxCapacity) * 100));

              return (
                <div 
                  key={ed.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all shadow-2xs space-y-4 relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={ed.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={ed.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                      />
                      <div>
                        <h4 className="text-sm font-black text-slate-950">{ed.name}</h4>
                        <p className="text-xs font-bold text-emerald-700">{ed.role || 'Senior Editor'}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider shrink-0">
                      {ed.status || 'Active'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Specialty:</span>
                      <strong className="text-slate-800 text-right truncate ml-2">{ed.specialty || 'Viral Reels & Shorts'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Login Email:</span>
                      <strong className="text-slate-900 font-mono text-[11px]">{ed.email}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Password:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-amber-800 font-mono font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                          {ed.password || 'editor123'}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(ed.password || 'editor123');
                            setToastMsg(`Copied login password for ${ed.name}!`);
                            setTimeout(() => setToastMsg(''), 2500);
                          }}
                          className="p-1 hover:text-[#22C55E] text-slate-400 transition cursor-pointer"
                          title="Copy password"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Workload Capacity Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-600">Current Workload:</span>
                      <span className="font-extrabold text-slate-900">
                        {activeProjectsCount} / {maxCapacity} tasks
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          capacityPercentage >= 100 
                            ? 'bg-rose-500' 
                            : capacityPercentage >= 75 
                            ? 'bg-amber-500' 
                            : 'bg-[#22C55E]'
                        }`}
                        style={{ width: `${Math.min(100, capacityPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEditor(ed);
                        setNewEditorName(ed.name);
                        setNewEditorEmail(ed.email);
                        setNewEditorPassword(ed.password || 'editor123');
                        setNewEditorRole(ed.role || 'Senior Video Editor');
                        setNewEditorSpecialty(ed.specialty || 'Short-Form Viral & YouTube');
                        setNewEditorCapacity(String(ed.capacity || 4));
                        setIsOnboardEditorModalOpen(true);
                      }}
                      className="text-slate-600 hover:text-slate-950 font-bold transition cursor-pointer"
                    >
                      Edit Profile
                    </button>

                    {onDeleteEditor && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${ed.name} from the active editor roster?`)) {
                            onDeleteEditor(ed.id);
                            setToastMsg(`Editor ${ed.name} removed.`);
                            setTimeout(() => setToastMsg(''), 3000);
                          }
                        }}
                        className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: WEBSITE MEDIA & ASSETS */}
      {adminTab === 'assets' && (
        <AdminAssetManager />
      )}

      {/* MODAL: ONBOARD NEW CLIENT & CREATE CREDENTIALS */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOnboardModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-[#22C55E]" />
              <h3 className="text-xl font-black text-slate-950">Onboard New Client Account</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Create a dedicated client workspace with private login credentials. The client can log into their isolated dashboard to upload raw footage.
            </p>

            <form onSubmit={handleCreateClientSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Client Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Miller"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Client Email (Login Username)</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. david@clientbrand.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Client Login Password</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-[#22C55E] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate Secure Password</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Brand / Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Nexus Media"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#22C55E]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Company Website</label>
                  <input
                    type="text"
                    placeholder="nexusmedia.com"
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Plan</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#22C55E]"
                  >
                    <option value="Scale ($1,299/mo)">Scale ($1,299/mo - Monthly)</option>
                    <option value="Pro ($2,299/mo)">Pro ($2,299/mo - Monthly)</option>
                    <option value="In-House Studio ($5,999/mo)">In-House Studio ($5,999/mo - Monthly)</option>
                    <option value="Scale (Quarterly - $999/mo)">Scale (Quarterly - $999/mo)</option>
                    <option value="Pro (Quarterly - $1,999/mo)">Pro (Quarterly - $1,999/mo)</option>
                    <option value="In-House Studio (Quarterly - $4,999/mo)">In-House Studio (Quarterly - $4,999/mo)</option>
                    <option value="Scale (Yearly - $899/mo)">Scale (Yearly - $899/mo)</option>
                    <option value="Pro (Yearly - $1,799/mo)">Pro (Yearly - $1,799/mo)</option>
                    <option value="In-House Studio (Yearly - $4,699/mo)">In-House Studio (Yearly - $4,699/mo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Video Editor</label>
                  <select
                    value={newEditor}
                    onChange={(e) => setNewEditor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#22C55E]"
                  >
                    {editors && editors.length > 0 ? (
                      editors.map((ed: any) => (
                        <option key={ed.id} value={ed.name}>
                          {ed.name} ({ed.role || 'Editor'})
                        </option>
                      ))
                    ) : (
                      <option value="Studio Lead Editor">Studio Lead Editor</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4 text-[#22C55E]" />
                  <span>Create Client Account & Issue Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUCCESS CREDENTIALS POPUP */}
      {createdClientSummary && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-4">
            <button
              onClick={() => setCreatedClientSummary(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#22C55E] flex items-center justify-center mx-auto border border-emerald-200">
              <Check className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-950">Client Account Active!</h3>
              <p className="text-xs text-slate-500">
                A private, isolated workspace has been created for <strong>{createdClientSummary.client.name}</strong>.
              </p>
            </div>

            {/* Credential Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Login Portal URL:</span>
                <strong className="text-slate-900">{window.location.origin}/flow</strong>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Client Email:</span>
                <strong className="text-slate-900">{createdClientSummary.client.email}</strong>
              </div>
              
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-amber-600" />
                    <span>One-Time Initial Password</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdClientSummary.temporaryPassword || '');
                      setToastMsg('Temporary password copied!');
                      setTimeout(() => setToastMsg(''), 2500);
                    }}
                    className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-900 text-[10px] font-bold hover:bg-amber-100 transition cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="font-mono text-base font-black text-slate-900 tracking-wide">
                  {createdClientSummary.temporaryPassword}
                </div>
                <p className="text-[10px] text-amber-800 leading-normal">
                  <strong>Zero-Trust Security:</strong> This password is cryptographically hashed with PBKDF2 on the server. It will NOT be shown again once you close this window.
                </p>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span>Assigned Editor:</span>
                <strong className="text-slate-900">{createdClientSummary.client.assignedEditor}</strong>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleCopyCredentials(createdClientSummary.client.email, createdClientSummary.temporaryPassword || '')}
                className="w-full py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Copy Full Credentials to Send to Client</span>
              </button>

              <a
                href={`mailto:${createdClientSummary.client.email}?subject=${encodeURIComponent('Your Private FEVIQO Flow Portal Access')}&body=${encodeURIComponent(`Hi ${createdClientSummary.client.name},\n\nYour FEVIQO Flow client portal is ready.\n\nLogin Portal: ${window.location.origin}/flow\nLogin Email: ${createdClientSummary.client.email}\nTemporary Password: ${createdClientSummary.temporaryPassword}\n\nAssigned Video Editor: ${createdClientSummary.client.assignedEditor}\n\nYou can log in now to submit video tasks and upload your footage.\n\nBest regards,\nFEVIQO Studio`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <Send className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Send Credentials via Mail App (mailto:)</span>
              </a>

              <button
                onClick={() => {
                  const target = createdClientSummary.client;
                  setCreatedClientSummary(null);
                  onSwitchToClientSession(target);
                }}
                className="w-full py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Open & Test This Client's Dashboard Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {resetPasswordTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
            <button
              onClick={() => {
                setResetPasswordTarget(null);
                setCustomResetPassword('');
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950">Reset Client Password</h3>
                <p className="text-xs text-slate-500">{resetPasswordTarget.name} ({resetPasswordTarget.email})</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <p>
                Existing passwords are cryptographically hashed using PBKDF2 with unique salts and cannot be decrypted by any admin.
              </p>
              <p className="font-medium text-slate-800">
                Issuing a reset will generate a new temporary password and update the secure hash on the server.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Custom Temporary Password (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customResetPassword}
                  onChange={(e) => setCustomResetPassword(e.target.value)}
                  placeholder="Leave blank to auto-generate"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#22C55E]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
                    let res = 'Fv-';
                    for (let i = 0; i < 6; i++) {
                      res += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    res += '!';
                    setCustomResetPassword(res);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Generate</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setResetPasswordTarget(null);
                  setCustomResetPassword('');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResettingPassword}
                onClick={handleExecutePasswordReset}
                className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isResettingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5 text-[#22C55E]" />}
                <span>{isResettingPassword ? 'Resetting...' : 'Generate New Password'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD RESULT */}
      {resetPasswordResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-4">
            <button
              onClick={() => setResetPasswordResult(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#22C55E] flex items-center justify-center mx-auto border border-emerald-200">
              <Check className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-950">Password Reset Completed</h3>
              <p className="text-xs text-slate-500">
                New login credentials created for <strong>{resetPasswordResult.clientName}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Login Email:</span>
                <strong className="text-slate-900">{resetPasswordResult.email}</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">New Temporary Password</span>
                  <span className="font-mono text-base font-black text-emerald-600">{resetPasswordResult.temporaryPassword}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resetPasswordResult.temporaryPassword);
                    setToastMsg('Temporary password copied!');
                    setTimeout(() => setToastMsg(''), 2500);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                This password has been cryptographically hashed with PBKDF2. It cannot be displayed again once this window is closed.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleCopyCredentials(resetPasswordResult.email, resetPasswordResult.temporaryPassword)}
                className="w-full py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Copy Full Login Details</span>
              </button>

              <a
                href={`mailto:${resetPasswordResult.email}?subject=${encodeURIComponent('FEVIQO Flow — Your New Password')}&body=${encodeURIComponent(`Hi ${resetPasswordResult.clientName},\n\nYour password for the FEVIQO Flow client portal has been reset.\n\nPortal URL: ${window.location.origin}/flow\nEmail: ${resetPasswordResult.email}\nTemporary Password: ${resetPasswordResult.temporaryPassword}\n\nPlease sign in and update your password.\n\nBest regards,\nFEVIQO Studio`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <Send className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Send via Mail App (mailto:)</span>
              </a>

              <button
                onClick={() => setResetPasswordResult(null)}
                className="w-full py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SAFE ARCHIVE / PERMANENT DELETE */}
      {clientToArchiveOrDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-4">
            <button
              onClick={() => setClientToArchiveOrDelete(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-950">Manage {clientToArchiveOrDelete.name}</h3>
              <p className="text-xs text-slate-500">
                Choose whether to safely archive or permanently remove this client account.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-slate-600" />
                  <span>Option A: Safe Archive (Recommended)</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Deactivates login access and removes the client from active lists, while preserving all project history, video assets, and review notes. You can reactivate at any time.
                </p>
                <button
                  onClick={() => handleConfirmArchive(clientToArchiveOrDelete)}
                  className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive Client Account</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs space-y-2">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Option B: Permanent Deletion</span>
                </div>
                <p className="text-rose-700 text-[11px] leading-relaxed">
                  Permanently deletes client profile record. This action cannot be undone.
                </p>
                <button
                  onClick={() => handleConfirmPermanentDelete(clientToArchiveOrDelete)}
                  className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Permanently Delete Client</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin WhatsApp Chat Intervention Modal */}
      {activeChatProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-3xl h-[650px] max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-700">
            <WhatsAppChat
              project={projects.find(p => p.id === activeChatProject.id) || activeChatProject}
              currentUserRole="admin"
              currentUserName={session.name || 'Executive Studio Admin (HQ)'}
              editorName={(projects.find(p => p.id === activeChatProject.id) || activeChatProject).editorName || 'Senior Editor'}
              clientName={(projects.find(p => p.id === activeChatProject.id) || activeChatProject).clientName || 'Client'}
              onSendMessage={(projId, msg) => {
                if (onSendChatMessage) {
                  onSendChatMessage(projId, msg);
                }
              }}
              onClose={() => setActiveChatProject(null)}
            />
          </div>
        </div>
      )}

      {/* MODAL: ONBOARD / EDIT EDITOR */}
      {isOnboardEditorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsOnboardEditorModalOpen(false);
                setEditingEditor(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center border border-[#22C55E]/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-950">
                  {editingEditor ? `Edit ${editingEditor.name}'s Profile` : 'Onboard New Video Editor'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingEditor
                    ? 'Update editor specialty, concurrent project capacity, or login credentials.'
                    : 'Add a new editor to the roster. Login credentials will be generated and ready immediately.'}
                </p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmittingEditor(true);
                try {
                  if (editingEditor && onUpdateEditor) {
                    await onUpdateEditor(editingEditor.id, {
                      name: newEditorName.trim(),
                      email: newEditorEmail.trim(),
                      password: newEditorPassword.trim(),
                      role: newEditorRole.trim(),
                      specialty: newEditorSpecialty.trim(),
                      capacity: parseInt(newEditorCapacity, 10) || 4,
                    });
                    setToastMsg(`Editor ${newEditorName} updated successfully!`);
                  } else if (onAddNewEditor) {
                    await onAddNewEditor({
                      name: newEditorName.trim(),
                      email: newEditorEmail.trim(),
                      password: newEditorPassword.trim(),
                      role: newEditorRole.trim(),
                      specialty: newEditorSpecialty.trim(),
                      capacity: parseInt(newEditorCapacity, 10) || 4,
                    });
                    setToastMsg(`Editor ${newEditorName} onboarded successfully!`);
                  }
                  setIsOnboardEditorModalOpen(false);
                  setEditingEditor(null);
                  setTimeout(() => setToastMsg(''), 4000);
                } catch (err: any) {
                  setToastMsg(err.message || 'Error saving editor details.');
                  setTimeout(() => setToastMsg(''), 4000);
                } finally {
                  setIsSubmittingEditor(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Editor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Vance"
                  value={newEditorName}
                  onChange={(e) => setNewEditorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Login Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. liam@feviqo.com"
                  value={newEditorEmail}
                  onChange={(e) => setNewEditorEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Login Password</label>
                  <input
                    type="text"
                    required
                    placeholder="editor123"
                    value={newEditorPassword}
                    onChange={(e) => setNewEditorPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-[#22C55E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Concurrency (Capacity)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={newEditorCapacity}
                    onChange={(e) => setNewEditorCapacity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Video Editor"
                  value={newEditorRole}
                  onChange={(e) => setNewEditorRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Editing Specialty</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Short-Form Viral & YouTube retention"
                  value={newEditorSpecialty}
                  onChange={(e) => setNewEditorSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsOnboardEditorModalOpen(false);
                    setEditingEditor(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEditor}
                  className="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmittingEditor ? 'Saving...' : editingEditor ? 'Save Changes' : 'Complete Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Bot,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  DollarSign,
  FileText,
  MessageSquare,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Send,
  Settings,
  ShieldCheck,
  Sliders,
  Tv,
  Users,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { AppRoute } from '../../types';
import { AdminPortalAuthGate } from '../admin/AdminPortalAuthGate';
import {
  AdminAutomationOverview,
  AutomationRulesConfig,
  TemplateApprovalStatus,
  fetchAdminAutomationOverview,
  checkAdminWhatsAppLiveStatus,
  updateAdminAutomationSettings,
  sendAdminWhatsAppTestMessage,
  retryAdminWhatsAppMessage,
  runAdminAutomationWorkerNow,
  updateAdminCustomerPreference,
  triggerAdminEpisodePublishNotify,
  testAdminAiSupportAssistant,
} from '../../services/automationService';

interface AdminAutomationPageProps {
  onBookCall: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigatePricing: () => void;
  onNavigateFlow: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

type AutomationTab =
  | 'overview'
  | 'rules'
  | 'episodes'
  | 'templates'
  | 'ai'
  | 'consent'
  | 'logs';

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

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'read':
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    case 'delivered':
    case 'sent':
    case 'completed':
    case 'approved':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'failed':
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'pending':
    case 'pending_meta_review':
    case 'queued':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'not_configured':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export const AdminAutomationPage: React.FC<AdminAutomationPageProps> = ({
  onBookCall,
  onNavigateSection,
  onNavigatePricing,
  onNavigateFlow,
  onNavigatePage,
}) => {
  const [overview, setOverview] = useState<AdminAutomationOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AutomationTab>('overview');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live Meta connectivity check
  const [liveCheckBusy, setLiveCheckBusy] = useState(false);
  const [liveCheckResult, setLiveCheckResult] = useState<{
    connected: boolean;
    notConfigured?: boolean;
    verifiedName?: string;
    displayPhoneNumber?: string;
    qualityRating?: string;
    error?: string;
  } | null>(null);

  // Admin test message sender
  const [testPhone, setTestPhone] = useState('');
  const [testMode, setTestMode] = useState<'text' | 'template'>('text');
  const [testTemplateName, setTestTemplateName] = useState('feviqo_welcome');
  const [testTextBody, setTestTextBody] = useState(
    'Hello from FEVIQO! This is a test WhatsApp Cloud API message.'
  );
  const [testParamsInput, setTestParamsInput] = useState('Test User | https://feviqo.com/membership');
  const [testBypassApproval, setTestBypassApproval] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // Editable rules & AI state
  const [draftRules, setDraftRules] = useState<AutomationRulesConfig | null>(null);
  const [draftAiEnabled, setDraftAiEnabled] = useState(true);
  const [draftAiAutoReply, setDraftAiAutoReply] = useState(false);
  const [draftAiBookingUrl, setDraftAiBookingUrl] = useState('https://feviqo.com/booking');
  const [draftAiKeywords, setDraftAiKeywords] = useState('');
  const [draftUtilCost, setDraftUtilCost] = useState('0.015');
  const [draftMktCost, setDraftMktCost] = useState('0.055');
  const [savingSettings, setSavingSettings] = useState(false);

  // Worker & retries
  const [runningWorker, setRunningWorker] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Episode alert publisher
  const [selectedDramaId, setSelectedDramaId] = useState('mehmed-fetihler-sultani');
  const [selectedEpisodeSlug, setSelectedEpisodeSlug] = useState('');
  const [customSeasonNum, setCustomSeasonNum] = useState('4');
  const [customEpNum, setCustomEpNum] = useState('');
  const [customEpTitle, setCustomEpTitle] = useState('');
  const [customEpUrl, setCustomEpUrl] = useState('');
  const [forceResendEpisode, setForceResendEpisode] = useState(false);
  const [publishingEpisode, setPublishingEpisode] = useState(false);

  // Templates filter & copy state
  const [templateFilter, setTemplateFilter] = useState<'all' | 'UTILITY' | 'MARKETING'>('all');
  const [copiedTpl, setCopiedTpl] = useState<string | null>(null);
  const [updatingTplName, setUpdatingTplName] = useState<string | null>(null);

  // AI simulator state
  const [aiSimInput, setAiSimInput] = useState(
    'Assalam o Alaikum! How much is the VIP plan for Mehmed in Urdu?'
  );
  const [aiSimName, setAiSimName] = useState('Bilal');
  const [aiSimPhone, setAiSimPhone] = useState('');
  const [aiSimBusy, setAiSimBusy] = useState(false);
  const [aiSimResult, setAiSimResult] = useState<{
    replyText: string;
    intent: string;
    detectedLanguage: string;
    escalateToHuman: boolean;
    escalationReason?: string;
    isHighIntentLead: boolean;
    extractedLead?: Record<string, string>;
  } | null>(null);

  // Logs filter
  const [logStatusFilter, setLogStatusFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState('');

  // Consent search
  const [consentSearch, setConsentSearch] = useState('');
  const [updatingPrefId, setUpdatingPrefId] = useState<string | null>(null);

  const hydrateDraftsFromOverview = useCallback((ov: AdminAutomationOverview) => {
    setDraftRules(ov.settings.rules);
    setDraftAiEnabled(ov.settings.ai.enabled);
    setDraftAiAutoReply(ov.settings.ai.autoReplyOnInboundWhatsApp);
    setDraftAiBookingUrl(ov.settings.ai.bookingUrl || 'https://feviqo.com/booking');
    setDraftAiKeywords((ov.settings.ai.escalationKeywords || []).join(', '));
    setDraftUtilCost(String(ov.settings.estimatedUtilityCostUsd ?? 0.015));
    setDraftMktCost(String(ov.settings.estimatedMarketingCostUsd ?? 0.055));

    if (ov.dramasCatalog.length > 0) {
      const currentDrama =
        ov.dramasCatalog.find((d) => d.id === selectedDramaId) || ov.dramasCatalog[0];
      if (currentDrama && !selectedEpisodeSlug && currentDrama.episodes.length > 0) {
        const latestEp = currentDrama.episodes[0];
        setSelectedDramaId(currentDrama.id);
        setSelectedEpisodeSlug(latestEp.slug);
        setCustomEpNum(String(latestEp.number));
        setCustomEpTitle(latestEp.title);
        const dramaPath = currentDrama.id === 'teskilat' ? 'teskilat' : currentDrama.id;
        setCustomEpUrl(`https://feviqo.com/${dramaPath}/${latestEp.slug}`);
      }
    }
  }, [selectedDramaId, selectedEpisodeSlug]);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminAutomationOverview();
      if (!res.success || !res.envStatus) {
        setBanner({ type: 'error', text: res.error || 'Failed to load automation dashboard.' });
        return;
      }
      const ov = res as unknown as AdminAutomationOverview;
      setOverview(ov);
      hydrateDraftsFromOverview(ov);
    } catch {
      setBanner({ type: 'error', text: 'Network error while loading automation overview.' });
    } finally {
      setLoading(false);
    }
  }, [hydrateDraftsFromOverview]);

  const handleTestLiveConnection = async () => {
    setLiveCheckBusy(true);
    setBanner(null);
    try {
      const res = await checkAdminWhatsAppLiveStatus();
      if (res.liveCheck) {
        setLiveCheckResult(res.liveCheck);
        setBanner({
          type: res.liveCheck.connected ? 'success' : 'error',
          text: res.liveCheck.connected
            ? `Connected to Meta WhatsApp Cloud API (${res.liveCheck.displayPhoneNumber || res.liveCheck.verifiedName || 'Verified'}).`
            : res.liveCheck.error || 'WhatsApp Cloud API is not connected.',
        });
      }
    } catch {
      setBanner({ type: 'error', text: 'Unable to test Meta Graph API connectivity.' });
    } finally {
      setLiveCheckBusy(false);
    }
  };

  const handleSaveRulesAndSettings = async () => {
    if (!draftRules) return;
    setSavingSettings(true);
    setBanner(null);
    try {
      const res = await updateAdminAutomationSettings({
        rules: draftRules,
        ai: {
          enabled: draftAiEnabled,
          autoReplyOnInboundWhatsApp: draftAiAutoReply,
          bookingUrl: draftAiBookingUrl.trim() || 'https://feviqo.com/booking',
          escalationKeywords: draftAiKeywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        },
        estimatedUtilityCostUsd: Number(draftUtilCost) || 0.015,
        estimatedMarketingCostUsd: Number(draftMktCost) || 0.055,
      });
      if (!res.success || !res.overview) {
        setBanner({ type: 'error', text: res.error || 'Failed to save automation settings.' });
        return;
      }
      setOverview(res.overview);
      hydrateDraftsFromOverview(res.overview);
      setBanner({ type: 'success', text: 'Automation rules and settings saved to Firestore.' });
    } catch {
      setBanner({ type: 'error', text: 'Error saving automation settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateTemplateApprovalStatus = async (
    templateName: string,
    status: TemplateApprovalStatus
  ) => {
    setUpdatingTplName(templateName);
    setBanner(null);
    try {
      const res = await updateAdminAutomationSettings({
        templateStatuses: { [templateName]: status },
      });
      if (!res.success || !res.overview) {
        setBanner({ type: 'error', text: res.error || 'Could not update template status.' });
        return;
      }
      setOverview(res.overview);
      setBanner({
        type: 'success',
        text: `Updated "${templateName}" status to ${status.replace(/_/g, ' ')}.`,
      });
    } catch {
      setBanner({ type: 'error', text: 'Failed to update template status.' });
    } finally {
      setUpdatingTplName(null);
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;
    setSendingTest(true);
    setBanner(null);
    try {
      const res = await sendAdminWhatsAppTestMessage({
        toPhone: testPhone.trim(),
        mode: testMode,
        templateName: testMode === 'template' ? testTemplateName : undefined,
        bodyParameters:
          testMode === 'template'
            ? testParamsInput
                .split('|')
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
        textBody: testMode === 'text' ? testTextBody.trim() : undefined,
        bypassApprovalCheck: testBypassApproval,
      });
      if (res.overview) setOverview(res.overview);
      if (res.success) {
        setBanner({
          type: 'success',
          text: `Test WhatsApp message dispatched to ${testPhone.trim()} (status: ${res.messageLog?.status || 'sent'}).`,
        });
      } else {
        setBanner({
          type: 'error',
          text:
            res.error ||
            `Test message not sent (logged status: ${res.messageLog?.status || 'failed'}).`,
        });
      }
    } catch {
      setBanner({ type: 'error', text: 'Network error while sending test message.' });
    } finally {
      setSendingTest(false);
    }
  };

  const handleRunWorkerNow = async () => {
    setRunningWorker(true);
    setBanner(null);
    try {
      const res = await runAdminAutomationWorkerNow();
      if (res.overview) setOverview(res.overview);
      if (res.success && res.summary) {
        setBanner({
          type: 'success',
          text: `Worker cycle complete: ${res.summary.jobsProcessed} jobs executed, ${res.summary.jobsCancelled} cancelled, ${res.summary.retriesAttempted} retries attempted, ${res.summary.expiryJobsEnsured} expiry reminders verified.`,
        });
      } else {
        setBanner({ type: 'error', text: res.error || 'Worker run failed.' });
      }
    } catch {
      setBanner({ type: 'error', text: 'Network error while running worker.' });
    } finally {
      setRunningWorker(false);
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    setRetryingId(messageId);
    setBanner(null);
    try {
      const res = await retryAdminWhatsAppMessage(messageId);
      if (res.overview) setOverview(res.overview);
      setBanner({
        type: res.success ? 'success' : 'error',
        text: res.success
          ? 'Message retry succeeded.'
          : res.error || 'Retry attempted — check updated error details in log.',
      });
    } catch {
      setBanner({ type: 'error', text: 'Network error during retry.' });
    } finally {
      setRetryingId(null);
    }
  };

  const handleDramaSelect = (dramaId: string) => {
    setSelectedDramaId(dramaId);
    setForceResendEpisode(false);
    const drama = overview?.dramasCatalog.find((d) => d.id === dramaId);
    if (drama && drama.episodes.length > 0) {
      const ep = drama.episodes[0];
      setSelectedEpisodeSlug(ep.slug);
      setCustomEpNum(String(ep.number));
      setCustomEpTitle(ep.title);
      const pathSlug = drama.id === 'teskilat' ? 'teskilat' : drama.id;
      setCustomEpUrl(`https://feviqo.com/${pathSlug}/${ep.slug}`);
      setCustomSeasonNum(
        drama.id === 'teskilat' ? '7' : drama.id === 'mehmed-fetihler-sultani' ? '4' : '1'
      );
    }
  };

  const handleEpisodeSelect = (epSlug: string) => {
    setSelectedEpisodeSlug(epSlug);
    setForceResendEpisode(false);
    const drama = overview?.dramasCatalog.find((d) => d.id === selectedDramaId);
    const ep = drama?.episodes.find((e) => e.slug === epSlug);
    if (drama && ep) {
      setCustomEpNum(String(ep.number));
      setCustomEpTitle(ep.title);
      const pathSlug = drama.id === 'teskilat' ? 'teskilat' : drama.id;
      setCustomEpUrl(`https://feviqo.com/${pathSlug}/${ep.slug}`);
    }
  };

  const handlePublishEpisodeBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDramaId || !selectedEpisodeSlug.trim()) return;
    setPublishingEpisode(true);
    setBanner(null);
    try {
      const res = await triggerAdminEpisodePublishNotify({
        dramaId: selectedDramaId,
        episodeSlug: selectedEpisodeSlug.trim(),
        seasonNumber: Number(customSeasonNum) || 1,
        episodeNumber: Number(customEpNum) || 1,
        episodeTitle: customEpTitle.trim() || `Episode ${customEpNum}`,
        episodeUrl: customEpUrl.trim() || undefined,
        forceResend: forceResendEpisode,
      });
      if (res.overview) setOverview(res.overview);
      if (res.duplicate) {
        setBanner({
          type: 'error',
          text:
            res.error ||
            'Duplicate protection blocked resend. Enable "Force deliberate resend" if you intentionally want to notify entitled members again.',
        });
      } else if (res.success && res.broadcast) {
        setForceResendEpisode(false);
        setBanner({
          type: 'success',
          text: `Episode broadcast recorded: ${res.broadcast.entitledCount} entitled active members · ${res.broadcast.sentCount} sent · ${res.broadcast.skippedCount} skipped · ${res.broadcast.failedCount} failed/unconfigured.`,
        });
      } else {
        setBanner({ type: 'error', text: res.error || 'Episode notification failed.' });
      }
    } catch {
      setBanner({ type: 'error', text: 'Network error triggering episode broadcast.' });
    } finally {
      setPublishingEpisode(false);
    }
  };

  const handleRunAiSimulator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSimInput.trim()) return;
    setAiSimBusy(true);
    setBanner(null);
    try {
      const res = await testAdminAiSupportAssistant({
        userMessage: aiSimInput.trim(),
        contactName: aiSimName.trim() || undefined,
        testPhone: aiSimPhone.trim() || undefined,
      });
      if (res.success && res.aiResult) {
        setAiSimResult(res.aiResult);
      } else {
        setBanner({ type: 'error', text: res.error || 'AI simulator request failed.' });
      }
    } catch {
      setBanner({ type: 'error', text: 'Network error running AI simulator.' });
    } finally {
      setAiSimBusy(false);
    }
  };

  const handleTogglePrefField = async (
    prefId: string,
    patch: Record<string, boolean>
  ) => {
    setUpdatingPrefId(prefId);
    setBanner(null);
    try {
      const res = await updateAdminCustomerPreference(prefId, patch);
      if (res.overview) setOverview(res.overview);
      if (!res.success) {
        setBanner({ type: 'error', text: res.error || 'Failed to update customer preference.' });
      }
    } catch {
      setBanner({ type: 'error', text: 'Network error updating preference.' });
    } finally {
      setUpdatingPrefId(null);
    }
  };

  const selectedDramaCatalog = useMemo(
    () => overview?.dramasCatalog.find((d) => d.id === selectedDramaId) || null,
    [overview, selectedDramaId]
  );

  const alreadySentForSelectedEpisode = Boolean(
    selectedDramaCatalog?.audience.alreadyBroadcastSlugs.includes(selectedEpisodeSlug)
  );

  const filteredTemplates = useMemo(() => {
    if (!overview) return [];
    if (templateFilter === 'all') return overview.templates;
    return overview.templates.filter((t) => t.category === templateFilter);
  }, [overview, templateFilter]);

  const filteredLogs = useMemo(() => {
    if (!overview) return [];
    return overview.messages.filter((m) => {
      if (logStatusFilter !== 'all' && m.status !== logStatusFilter) return false;
      if (logSearch.trim()) {
        const q = logSearch.trim().toLowerCase();
        const hay = `${m.recipientPhone} ${m.recipientName || ''} ${m.eventType} ${m.templateName || ''} ${m.bodyPreview} ${m.errorMessage || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [overview, logStatusFilter, logSearch]);

  const filteredPrefs = useMemo(() => {
    if (!overview) return [];
    if (!consentSearch.trim()) return overview.preferences;
    const q = consentSearch.trim().toLowerCase();
    return overview.preferences.filter((p) =>
      `${p.fullName || ''} ${p.email || ''} ${p.phoneE164}`.toLowerCase().includes(q)
    );
  }, [overview, consentSearch]);

  const copyTemplateBody = async (name: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTpl(name);
      setTimeout(() => setCopiedTpl((prev) => (prev === name ? null : prev)), 2000);
    } catch {}
  };

  return (
    <AdminPortalAuthGate
      currentSection="automation"
      onBookCall={onBookCall}
      onNavigateSection={onNavigateSection}
      onNavigatePricing={onNavigatePricing}
      onNavigateFlow={onNavigateFlow}
      onNavigatePage={onNavigatePage}
    >
      {({ admin, renderSectionSwitcher }) => {
        return (
          <AutomationDashboardInner
            adminName={admin.name}
            adminEmail={admin.email}
            renderSectionSwitcher={renderSectionSwitcher}
            overview={overview}
            loading={loading}
            onMountLoad={loadOverview}
            banner={banner}
            setBanner={setBanner}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            liveCheckBusy={liveCheckBusy}
            liveCheckResult={liveCheckResult}
            onTestLiveConnection={handleTestLiveConnection}
            testPhone={testPhone}
            setTestPhone={setTestPhone}
            testMode={testMode}
            setTestMode={setTestMode}
            testTemplateName={testTemplateName}
            setTestTemplateName={setTestTemplateName}
            testTextBody={testTextBody}
            setTestTextBody={setTestTextBody}
            testParamsInput={testParamsInput}
            setTestParamsInput={setTestParamsInput}
            testBypassApproval={testBypassApproval}
            setTestBypassApproval={setTestBypassApproval}
            sendingTest={sendingTest}
            onSendTestMessage={handleSendTestMessage}
            draftRules={draftRules}
            setDraftRules={setDraftRules}
            draftAiEnabled={draftAiEnabled}
            setDraftAiEnabled={setDraftAiEnabled}
            draftAiAutoReply={draftAiAutoReply}
            setDraftAiAutoReply={setDraftAiAutoReply}
            draftAiBookingUrl={draftAiBookingUrl}
            setDraftAiBookingUrl={setDraftAiBookingUrl}
            draftAiKeywords={draftAiKeywords}
            setDraftAiKeywords={setDraftAiKeywords}
            draftUtilCost={draftUtilCost}
            setDraftUtilCost={setDraftUtilCost}
            draftMktCost={draftMktCost}
            setDraftMktCost={setDraftMktCost}
            savingSettings={savingSettings}
            onSaveSettings={handleSaveRulesAndSettings}
            runningWorker={runningWorker}
            onRunWorkerNow={handleRunWorkerNow}
            retryingId={retryingId}
            onRetryMessage={handleRetryMessage}
            selectedDramaId={selectedDramaId}
            onSelectDrama={handleDramaSelect}
            selectedDramaCatalog={selectedDramaCatalog}
            selectedEpisodeSlug={selectedEpisodeSlug}
            onSelectEpisode={handleEpisodeSelect}
            customSeasonNum={customSeasonNum}
            setCustomSeasonNum={setCustomSeasonNum}
            customEpNum={customEpNum}
            setCustomEpNum={setCustomEpNum}
            customEpTitle={customEpTitle}
            setCustomEpTitle={setCustomEpTitle}
            customEpUrl={customEpUrl}
            setCustomEpUrl={setCustomEpUrl}
            forceResendEpisode={forceResendEpisode}
            setForceResendEpisode={setForceResendEpisode}
            alreadySentForSelectedEpisode={alreadySentForSelectedEpisode}
            publishingEpisode={publishingEpisode}
            onPublishEpisode={handlePublishEpisodeBroadcast}
            templateFilter={templateFilter}
            setTemplateFilter={setTemplateFilter}
            filteredTemplates={filteredTemplates}
            copiedTpl={copiedTpl}
            onCopyTemplate={copyTemplateBody}
            updatingTplName={updatingTplName}
            onUpdateTemplateStatus={handleUpdateTemplateApprovalStatus}
            aiSimInput={aiSimInput}
            setAiSimInput={setAiSimInput}
            aiSimName={aiSimName}
            setAiSimName={setAiSimName}
            aiSimPhone={aiSimPhone}
            setAiSimPhone={setAiSimPhone}
            aiSimBusy={aiSimBusy}
            aiSimResult={aiSimResult}
            onRunAiSimulator={handleRunAiSimulator}
            consentSearch={consentSearch}
            setConsentSearch={setConsentSearch}
            filteredPrefs={filteredPrefs}
            updatingPrefId={updatingPrefId}
            onTogglePrefField={handleTogglePrefField}
            logStatusFilter={logStatusFilter}
            setLogStatusFilter={setLogStatusFilter}
            logSearch={logSearch}
            setLogSearch={setLogSearch}
            filteredLogs={filteredLogs}
            onNavigatePage={onNavigatePage}
          />
        );
      }}
    </AdminPortalAuthGate>
  );
};

interface InnerProps {
  adminName: string;
  adminEmail: string;
  renderSectionSwitcher: () => React.ReactNode;
  overview: AdminAutomationOverview | null;
  loading: boolean;
  onMountLoad: () => Promise<void>;
  banner: { type: 'success' | 'error'; text: string } | null;
  setBanner: (b: { type: 'success' | 'error'; text: string } | null) => void;
  activeTab: AutomationTab;
  setActiveTab: (t: AutomationTab) => void;
  liveCheckBusy: boolean;
  liveCheckResult: any;
  onTestLiveConnection: () => void;
  testPhone: string;
  setTestPhone: (v: string) => void;
  testMode: 'text' | 'template';
  setTestMode: (v: 'text' | 'template') => void;
  testTemplateName: string;
  setTestTemplateName: (v: string) => void;
  testTextBody: string;
  setTestTextBody: (v: string) => void;
  testParamsInput: string;
  setTestParamsInput: (v: string) => void;
  testBypassApproval: boolean;
  setTestBypassApproval: (v: boolean) => void;
  sendingTest: boolean;
  onSendTestMessage: (e: React.FormEvent) => void;
  draftRules: AutomationRulesConfig | null;
  setDraftRules: React.Dispatch<React.SetStateAction<AutomationRulesConfig | null>>;
  draftAiEnabled: boolean;
  setDraftAiEnabled: (v: boolean) => void;
  draftAiAutoReply: boolean;
  setDraftAiAutoReply: (v: boolean) => void;
  draftAiBookingUrl: string;
  setDraftAiBookingUrl: (v: string) => void;
  draftAiKeywords: string;
  setDraftAiKeywords: (v: string) => void;
  draftUtilCost: string;
  setDraftUtilCost: (v: string) => void;
  draftMktCost: string;
  setDraftMktCost: (v: string) => void;
  savingSettings: boolean;
  onSaveSettings: () => void;
  runningWorker: boolean;
  onRunWorkerNow: () => void;
  retryingId: string | null;
  onRetryMessage: (id: string) => void;
  selectedDramaId: string;
  onSelectDrama: (id: string) => void;
  selectedDramaCatalog: AdminAutomationOverview['dramasCatalog'][number] | null;
  selectedEpisodeSlug: string;
  onSelectEpisode: (slug: string) => void;
  customSeasonNum: string;
  setCustomSeasonNum: (v: string) => void;
  customEpNum: string;
  setCustomEpNum: (v: string) => void;
  customEpTitle: string;
  setCustomEpTitle: (v: string) => void;
  customEpUrl: string;
  setCustomEpUrl: (v: string) => void;
  forceResendEpisode: boolean;
  setForceResendEpisode: (v: boolean) => void;
  alreadySentForSelectedEpisode: boolean;
  publishingEpisode: boolean;
  onPublishEpisode: (e: React.FormEvent) => void;
  templateFilter: 'all' | 'UTILITY' | 'MARKETING';
  setTemplateFilter: (v: 'all' | 'UTILITY' | 'MARKETING') => void;
  filteredTemplates: AdminAutomationOverview['templates'];
  copiedTpl: string | null;
  onCopyTemplate: (name: string, text: string) => void;
  updatingTplName: string | null;
  onUpdateTemplateStatus: (name: string, status: TemplateApprovalStatus) => void;
  aiSimInput: string;
  setAiSimInput: (v: string) => void;
  aiSimName: string;
  setAiSimName: (v: string) => void;
  aiSimPhone: string;
  setAiSimPhone: (v: string) => void;
  aiSimBusy: boolean;
  aiSimResult: any;
  onRunAiSimulator: (e: React.FormEvent) => void;
  consentSearch: string;
  setConsentSearch: (v: string) => void;
  filteredPrefs: AdminAutomationOverview['preferences'];
  updatingPrefId: string | null;
  onTogglePrefField: (id: string, patch: Record<string, boolean>) => void;
  logStatusFilter: string;
  setLogStatusFilter: (v: string) => void;
  logSearch: string;
  setLogSearch: (v: string) => void;
  filteredLogs: AdminAutomationOverview['messages'];
  onNavigatePage: (route: AppRoute) => void;
}

const AutomationDashboardInner: React.FC<InnerProps> = (props) => {
  const { overview, loading, onMountLoad, banner, setBanner, activeTab, setActiveTab } = props;

  useEffect(() => {
    void onMountLoad();
  }, [onMountLoad]);

  const tabs: Array<{ id: AutomationTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'overview', label: 'Overview & Status', icon: <Activity className="w-3.5 h-3.5" /> },
    {
      id: 'rules',
      label: 'Automation Rules & Jobs',
      icon: <Sliders className="w-3.5 h-3.5" />,
      badge: overview?.stats.pendingJobs,
    },
    { id: 'episodes', label: 'Episode Alerts', icon: <Tv className="w-3.5 h-3.5" /> },
    {
      id: 'templates',
      label: 'Meta Templates',
      icon: <FileText className="w-3.5 h-3.5" />,
      badge: overview?.templates.length,
    },
    { id: 'ai', label: 'AI Assistant', icon: <Bot className="w-3.5 h-3.5" /> },
    {
      id: 'consent',
      label: 'Consent & Opt-Outs',
      icon: <Users className="w-3.5 h-3.5" />,
      badge: overview?.preferences.length,
    },
    {
      id: 'logs',
      label: 'Logs & Retry Queue',
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      badge: overview?.stats.retryQueueCount,
    },
  ];

  const updateRule = <K extends keyof AutomationRulesConfig>(
    key: K,
    value: AutomationRulesConfig[K]
  ) => {
    props.setDraftRules((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#16A34A] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>FEVIQO Business Automation · Official Meta WhatsApp Cloud API</span>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#0F172A]">
            WhatsApp Automation &amp; Messaging Control Center
          </h1>
          <p className="text-xs text-slate-600">
            Signed in as <strong className="text-[#0F172A]">{props.adminName}</strong> ({props.adminEmail}) · Business Number:{' '}
            <span className="font-mono font-semibold text-[#0F172A]">
              {overview?.envStatus.businessPhoneDisplay || '+17823333653'}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onMountLoad}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {props.renderSectionSwitcher()}
        </div>
      </div>

      {/* Feedback Banner */}
      {banner && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start justify-between gap-3 ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-start gap-2">
            {banner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{banner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-xs font-semibold underline cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0F172A] text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {typeof tab.badge === 'number' && tab.badge > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
                  activeTab === tab.id ? 'bg-[#22C55E] text-[#0F172A]' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {!overview ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-500">
          {loading ? 'Loading automation metrics and settings...' : 'No automation data loaded yet.'}
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW & STATUS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Connection & Webhook Status Strip */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        WhatsApp Cloud API Connection
                      </div>
                      <h2 className="text-lg font-bold text-[#0F172A] mt-0.5 flex items-center gap-2">
                        {overview.envStatus.canSendMessages ? (
                          <Wifi className="w-5 h-5 text-[#16A34A]" />
                        ) : (
                          <WifiOff className="w-5 h-5 text-amber-600" />
                        )}
                        <span>
                          {overview.envStatus.canSendMessages
                            ? 'Credentials Configured on Server'
                            : 'Pending Render Environment Variables'}
                        </span>
                      </h2>
                    </div>
                    <button
                      type="button"
                      disabled={props.liveCheckBusy}
                      onClick={props.onTestLiveConnection}
                      className="px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] hover:text-[#0F172A] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-60"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>{props.liveCheckBusy ? 'Testing...' : 'Test Meta API'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {[
                      { label: 'WHATSAPP_ACCESS_TOKEN', ok: overview.envStatus.hasAccessToken },
                      { label: 'WHATSAPP_PHONE_NUMBER_ID', ok: overview.envStatus.hasPhoneNumberId },
                      { label: 'WHATSAPP_BUSINESS_ACCOUNT_ID', ok: overview.envStatus.hasBusinessAccountId },
                      { label: 'WHATSAPP_VERIFY_TOKEN', ok: overview.envStatus.hasVerifyToken },
                      { label: 'WHATSAPP_APP_SECRET', ok: overview.envStatus.hasAppSecret },
                      {
                        label: `WHATSAPP_API_VERSION (${overview.envStatus.apiVersion})`,
                        ok: overview.envStatus.apiVersionExplicitlySet,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-2 ${
                          item.ok
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            : 'bg-amber-50/70 border-amber-200 text-amber-900'
                        }`}
                      >
                        <span className="font-mono text-[11px] truncate">{item.label}</span>
                        {item.ok ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {props.liveCheckResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs ${
                        props.liveCheckResult.connected
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      {props.liveCheckResult.connected ? (
                        <div>
                          <strong>Verified Name:</strong> {props.liveCheckResult.verifiedName || 'N/A'} ·{' '}
                          <strong>Phone:</strong> {props.liveCheckResult.displayPhoneNumber || '+17823333653'} ·{' '}
                          <strong>Quality:</strong> {props.liveCheckResult.qualityRating || 'N/A'}
                        </div>
                      ) : (
                        <div>{props.liveCheckResult.error}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Webhook & Worker Status */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Webhook &amp; Scheduler Health
                      </div>
                      <h2 className="text-lg font-bold text-[#0F172A] mt-0.5">
                        Meta Webhook Endpoint &amp; Worker
                      </h2>
                    </div>
                    <button
                      type="button"
                      disabled={props.runningWorker}
                      onClick={props.onRunWorkerNow}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-60"
                    >
                      <Play className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>{props.runningWorker ? 'Running...' : 'Run Worker Now'}</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                      <span className="text-slate-600">Official Callback URL</span>
                      <span className="font-mono font-semibold text-[#0F172A] break-all text-right">
                        {overview.envStatus.webhookEndpoint.startsWith('http')
                          ? overview.envStatus.webhookEndpoint
                          : `https://feviqo.com${overview.envStatus.webhookEndpoint}`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500">Phone Number ID</div>
                        <div className="font-mono font-semibold text-[#0F172A] mt-0.5 truncate">
                          {overview.envStatus.phoneNumberId || '1203691806151162'}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500">Business Account ID</div>
                        <div className="font-mono font-semibold text-[#0F172A] mt-0.5 truncate">
                          {overview.envStatus.businessAccountId || '2221497198598821'}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500">Meta App ID · Fields</div>
                        <div className="font-mono font-semibold text-[#0F172A] mt-0.5 truncate">
                          {overview.envStatus.metaAppId || '995554719768043'} ·{' '}
                          {(overview.envStatus.subscribedFields || ['messages']).join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500">Last Webhook Verified</div>
                        <div className="font-semibold text-[#0F172A] mt-0.5">
                          {formatDt(overview.settings.lastWebhookVerifiedAt)}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500">Last Webhook Event</div>
                        <div className="font-semibold text-[#0F172A] mt-0.5">
                          {formatDt(overview.settings.lastWebhookReceivedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500">Last Automation Worker Run</div>
                        <div className="font-semibold text-[#0F172A] mt-0.5">
                          {formatDt(overview.settings.lastWorkerRunAt)}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] text-slate-500">Master Automation Switch</div>
                        <div
                          className={`font-bold mt-0.5 ${
                            overview.settings.rules.masterEnabled ? 'text-[#16A34A]' : 'text-red-600'
                          }`}
                        >
                          {overview.settings.rules.masterEnabled ? 'ENABLED' : 'PAUSED'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta App Publishing Readiness & Recent Webhook Diagnostics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-6 bg-white rounded-2xl border border-amber-200 p-6 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                        Meta App Publishing Readiness
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A] mt-0.5">
                        Webhook Verification vs. App Live Mode
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800 shrink-0">
                      Action Required in Meta
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Verifying <span className="font-mono">https://feviqo.com/api/webhooks/whatsapp</span> connects your server to Meta, but <strong>apps in Development mode only receive test webhooks from the App Dashboard</strong>. Live customer WhatsApp messages arrive only after switching the Meta App to Live mode.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                      <span>
                        Callback URL <span className="font-mono">https://feviqo.com/api/webhooks/whatsapp</span> &amp; <span className="font-mono">messages</span> subscription field configured
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Meta App Dashboard → <strong>App Settings → Basic</strong>: set Privacy Policy URL (<span className="font-mono">https://feviqo.com/privacy</span>) and Terms URL (<span className="font-mono">https://feviqo.com/terms</span>)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Toggle Meta App from <strong>Development → Live</strong> and submit Business Verification / Advanced Access if prompted for <span className="font-mono">whatsapp_business_messaging</span>
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Webhook Verification &amp; Failure Diagnostics
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A] mt-0.5">
                        Recent Webhook Events ({(overview.webhookEvents || []).length})
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                        (overview.failedWebhookEvents || []).length > 0
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      {(overview.failedWebhookEvents || []).length} Failed
                    </span>
                  </div>
                  {(overview.webhookEvents || []).length === 0 ? (
                    <p className="text-xs text-slate-500 py-3">
                      No webhook GET/POST requests recorded on this server yet. Click &ldquo;Verify and Save&rdquo; or &ldquo;Test&rdquo; in Meta Developer Dashboard to log live webhook verification here.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {(overview.webhookEvents || []).slice(0, 8).map((ev) => (
                        <div
                          key={ev.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                            ev.status === 'rejected' || ev.status === 'error'
                              ? 'bg-red-50/70 border-red-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-mono font-semibold text-[#0F172A] flex items-center gap-1.5">
                              <span>{ev.eventType}</span>
                              <span className="text-slate-400">·</span>
                              <span>HTTP {ev.httpStatus}</span>
                              {typeof ev.durationMs === 'number' && (
                                <span className="text-[11px] text-slate-500">({ev.durationMs}ms)</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 truncate mt-0.5">
                              {ev.reason ||
                                (ev.status === 'processed'
                                  ? `Messages: ${ev.processedMessages ?? 0}, Statuses: ${ev.processedStatuses ?? 0}, Duplicates skipped: ${ev.duplicatesIgnored ?? 0}`
                                  : ev.status === 'duplicate'
                                  ? `Duplicate webhook replay ignored (${ev.duplicatesIgnored ?? 1})`
                                  : 'Accepted asynchronously')}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${statusBadgeClass(
                                ev.status === 'verified' || ev.status === 'processed' || ev.status === 'accepted'
                                  ? 'approved'
                                  : ev.status === 'rejected' || ev.status === 'error'
                                  ? 'failed'
                                  : 'pending'
                              )}`}
                            >
                              {ev.status}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                              {formatDt(ev.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* KPI Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {[
                  { label: 'Total Outbound', value: overview.stats.totalOutbound, accent: 'text-[#0F172A]' },
                  { label: 'Delivered', value: overview.stats.delivered, accent: 'text-[#16A34A]' },
                  { label: 'Read', value: overview.stats.read, accent: 'text-emerald-700' },
                  { label: 'Failed / Retry', value: overview.stats.failed, accent: 'text-red-600' },
                  { label: 'Pending Jobs', value: overview.stats.pendingJobs, accent: 'text-amber-700' },
                  {
                    label: 'Est. Meta Cost',
                    value: `$${overview.stats.estimatedTotalCostUsd.toFixed(3)}`,
                    accent: 'text-[#0F172A]',
                  },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 p-4">
                    <div className="text-[11px] font-medium text-slate-500">{kpi.label}</div>
                    <div className={`text-2xl font-bold tabular-nums mt-1 ${kpi.accent}`}>{kpi.value}</div>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown & Consent Summary + Test Message Sender */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                    <DollarSign className="w-4 h-4 text-[#16A34A]" />
                    <span>Estimated Messaging Cost &amp; Audience</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Billable UTILITY messages</span>
                      <strong className="tabular-nums">
                        {overview.stats.billableUtility} × ${overview.settings.estimatedUtilityCostUsd}
                      </strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Billable MARKETING messages</span>
                      <strong className="tabular-nums">
                        {overview.stats.billableMarketing} × ${overview.settings.estimatedMarketingCostUsd}
                      </strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Inbound WhatsApp Messages</span>
                      <strong className="tabular-nums">{overview.stats.totalInbound}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Opted-In Customers</span>
                      <strong className="text-[#16A34A] tabular-nums">{overview.stats.optedInUsers}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Opted-Out (STOP)</span>
                      <strong className="text-red-600 tabular-nums">{overview.stats.optedOutUsers}</strong>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-600">Video Editing Leads / Active Chats</span>
                      <strong className="tabular-nums">
                        {overview.stats.totalLeads} / {overview.stats.activeConversations}
                      </strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Cost figures are configurable estimates based on Meta Cloud API conversation/message pricing tiers; verify actual billing inside Meta Business Manager.
                  </p>
                </div>

                {/* Admin Test Message Sender */}
                <form
                  onSubmit={props.onSendTestMessage}
                  className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                      <Send className="w-4 h-4 text-[#16A34A]" />
                      <span>Send Admin Test WhatsApp Message</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => props.setTestMode('text')}
                        className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                          props.testMode === 'text' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Freeform Text
                      </button>
                      <button
                        type="button"
                        onClick={() => props.setTestMode('template')}
                        className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                          props.testMode === 'template' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Meta Template
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Recipient WhatsApp (E.164)
                      </label>
                      <input
                        type="tel"
                        required
                        value={props.testPhone}
                        onChange={(e) => props.setTestPhone(e.target.value)}
                        placeholder="+923001234567 or +17823333653"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-[#0F172A]"
                      />
                    </div>

                    {props.testMode === 'template' && (
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Template</label>
                        <select
                          value={props.testTemplateName}
                          onChange={(e) => props.setTestTemplateName(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-[#0F172A]"
                        >
                          {overview.templates.map((t) => (
                            <option key={t.name} value={t.name}>
                              {t.name} [{t.category} · {t.approvalStatus}]
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {props.testMode === 'text' ? (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Message Body (Requires active 24h customer care window on Meta)
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={props.testTextBody}
                        onChange={(e) => props.setTestTextBody(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0F172A]"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Template Variables (pipe-separated: e.g. Ali | VIP | https://feviqo.com/account)
                        </label>
                        <input
                          type="text"
                          value={props.testParamsInput}
                          onChange={(e) => props.setTestParamsInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-[#0F172A]"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={props.testBypassApproval}
                          onChange={(e) => props.setTestBypassApproval(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <span>Bypass local template approval gate (only if already approved in Meta Manager)</span>
                      </label>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">
                      Never mocks sends: if Meta env vars are unset, logs honest <span className="font-mono">not_configured</span>.
                    </span>
                    <button
                      type="submit"
                      disabled={props.sendingTest}
                      className="px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{props.sendingTest ? 'Dispatching...' : 'Send Test Message'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: AUTOMATION RULES & SCHEDULED JOBS */}
          {activeTab === 'rules' && props.draftRules && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A]">Event-Driven Automation Rules</h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Toggle individual rules for FEVIQO Premium Memberships and FEVIQO Video Editing Leads. Every outbound send respects customer consent and Meta template approval status.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={props.savingSettings}
                    onClick={props.onSaveSettings}
                    className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] hover:text-[#0F172A] text-white text-xs font-bold transition cursor-pointer disabled:opacity-60 shrink-0"
                  >
                    {props.savingSettings ? 'Saving...' : 'Save All Rule Settings'}
                  </button>
                </div>

                {/* Master Switch */}
                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-sm font-bold text-[#0F172A]">Master Automation Switch</div>
                    <div className="text-xs text-slate-600">
                      Turn off to immediately pause all automated WhatsApp outbound messages globally.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={props.draftRules.masterEnabled}
                    onChange={(e) => updateRule('masterEnabled', e.target.checked)}
                    className="w-5 h-5 accent-[#16A34A]"
                  />
                </label>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Membership Lifecycle Rules */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                      FEVIQO Premium Membership Automation
                    </div>

                    {[
                      {
                        key: 'welcomeOnRegister' as const,
                        label: 'A. Welcome Message on New Registration',
                        desc: 'Send personalized welcome with https://feviqo.com/membership link.',
                      },
                      {
                        key: 'signupNoPackageReminder' as const,
                        label: 'B. Signup Without Package Reminder',
                        desc: 'Remind registered users who did not pick a plan yet.',
                        delayKey: 'signupNoPackageDelayMinutes' as const,
                        delayUnit: 'minutes',
                      },
                      {
                        key: 'checkoutAbandonedReminder' as const,
                        label: 'C. Selected Package Without Payment Proof Reminder',
                        desc: 'Remind customer with order ID, plan name, and amount; cancels on proof.',
                        delayKey: 'checkoutAbandonedDelayMinutes' as const,
                        delayUnit: 'minutes',
                      },
                      {
                        key: 'paymentProofReceived' as const,
                        label: 'D. Payment Proof Received Acknowledgement',
                        desc: 'Confirm receipt of screenshot; never activates membership automatically.',
                      },
                      {
                        key: 'paymentApproved' as const,
                        label: 'E. Payment Approved & Activation Notice',
                        desc: 'Send plan, selected dramas, activation & expiry dates, account link.',
                      },
                      {
                        key: 'paymentRejected' as const,
                        label: 'F. Payment Rejected Notice (Actual Reason Only)',
                        desc: 'Send admin-entered rejection reason and re-upload instructions.',
                      },
                      {
                        key: 'expiryReminder7Days' as const,
                        label: 'G1. Expiration Reminder — 7 Days Before',
                        desc: 'Cancels automatically on renewal, cancellation, or revocation.',
                      },
                      {
                        key: 'expiryReminder3Days' as const,
                        label: 'G2. Expiration Reminder — 3 Days Before',
                        desc: 'Includes renewal link https://feviqo.com/membership.',
                      },
                      {
                        key: 'expiryReminder1Day' as const,
                        label: 'G3. Expiration Reminder — 1 Day Before',
                        desc: 'Final advance notice before expiration.',
                      },
                      {
                        key: 'expiryOnExpired' as const,
                        label: 'G4. Membership Expired Notice',
                        desc: 'Sent once when membership expires without renewal.',
                      },
                      {
                        key: 'episodePublishedAlerts' as const,
                        label: 'H. New Episode Notifications (Entitled Active Members Only)',
                        desc: 'VIP = all eligible dramas; other plans = selected dramas only.',
                      },
                    ].map((r) => (
                      <div
                        key={r.key}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2"
                      >
                        <label className="flex items-start justify-between gap-3 cursor-pointer">
                          <div>
                            <div className="text-xs font-bold text-[#0F172A]">{r.label}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{r.desc}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(props.draftRules![r.key])}
                            onChange={(e) => updateRule(r.key, e.target.checked)}
                            className="w-4 h-4 accent-[#16A34A] mt-0.5 shrink-0"
                          />
                        </label>
                        {r.delayKey && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1">
                            <span>Delay:</span>
                            <input
                              type="number"
                              min={5}
                              max={1440}
                              value={Number(props.draftRules![r.delayKey])}
                              onChange={(e) =>
                                updateRule(r.delayKey, Math.max(5, Number(e.target.value) || 30))
                              }
                              className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs tabular-nums"
                            />
                            <span>{r.delayUnit}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Video Editing Lead Follow-Up Rules + Cost Config */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                      FEVIQO Video Editing Lead Automation (Separate Workflow)
                    </div>

                    {[
                      {
                        key: 'leadImmediateAcknowledgement' as const,
                        label: 'Immediate Enquiry Acknowledgement',
                        desc: 'Sent immediately upon video editing lead form submission if consented.',
                      },
                      {
                        key: 'leadFollowUpNoResponse' as const,
                        label: 'Follow-Up: No Response After Enquiry',
                        desc: 'Stops automatically when lead replies, books, declines, or opts out.',
                        delayKey: 'leadFollowUpNoResponseHours' as const,
                        delayUnit: 'hours',
                      },
                      {
                        key: 'leadFollowUpPricing' as const,
                        label: 'Follow-Up: Asked About Pricing Without Booking',
                        desc: 'Triggered from Lead CRM pipeline or AI pricing enquiry.',
                        delayKey: 'leadFollowUpPricingHours' as const,
                        delayUnit: 'hours',
                      },
                      {
                        key: 'leadFollowUpQuoteNotAccepted' as const,
                        label: 'Follow-Up: Quote Sent But Not Accepted Yet',
                        desc: 'Gentle check-in after human team sends a custom quote.',
                        delayKey: 'leadFollowUpQuoteHours' as const,
                        delayUnit: 'hours',
                      },
                      {
                        key: 'leadFollowUpBookingIncomplete' as const,
                        label: 'Follow-Up: Started Booking But Did Not Finish',
                        desc: 'Offers quick calendar link to finalize discovery call.',
                        delayKey: 'leadFollowUpBookingHours' as const,
                        delayUnit: 'hours',
                      },
                      {
                        key: 'leadFollowUpReturningClient' as const,
                        label: 'Follow-Up: Returning Client Re-Engagement',
                        desc: 'Manual/scheduled check-in for past video editing clients.',
                      },
                    ].map((r) => (
                      <div
                        key={r.key}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2"
                      >
                        <label className="flex items-start justify-between gap-3 cursor-pointer">
                          <div>
                            <div className="text-xs font-bold text-[#0F172A]">{r.label}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{r.desc}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(props.draftRules![r.key])}
                            onChange={(e) => updateRule(r.key, e.target.checked)}
                            className="w-4 h-4 accent-[#16A34A] mt-0.5 shrink-0"
                          />
                        </label>
                        {r.delayKey && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1">
                            <span>Delay:</span>
                            <input
                              type="number"
                              min={1}
                              max={336}
                              value={Number(props.draftRules![r.delayKey])}
                              onChange={(e) =>
                                updateRule(r.delayKey, Math.max(1, Number(e.target.value) || 24))
                              }
                              className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs tabular-nums"
                            />
                            <span>{r.delayUnit}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="text-xs font-bold text-[#0F172A]">
                        Rate Caps &amp; Estimated Unit Costs (USD)
                      </div>
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-600">Max Follow-Ups / Lead</label>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={props.draftRules.maxLeadFollowUpsPerLead}
                            onChange={(e) =>
                              updateRule('maxLeadFollowUpsPerLead', Math.max(1, Number(e.target.value) || 2))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs tabular-nums"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-600">Utility Est. ($)</label>
                          <input
                            type="number"
                            step="0.001"
                            min={0}
                            value={props.draftUtilCost}
                            onChange={(e) => props.setDraftUtilCost(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs tabular-nums"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-600">Marketing Est. ($)</label>
                          <input
                            type="number"
                            step="0.001"
                            min={0}
                            value={props.draftMktCost}
                            onChange={(e) => props.setDraftMktCost(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs tabular-nums"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduled Jobs Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">Scheduled Automation Jobs</h3>
                    <p className="text-xs text-slate-500">
                      Delayed reminders (30m no-package, checkout abandoned, 7d/3d/1d/expiry, lead follow-ups).
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={props.runningWorker}
                    onClick={props.onRunWorkerNow}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>{props.runningWorker ? 'Processing...' : 'Process Due Jobs Now'}</span>
                  </button>
                </div>

                {overview.jobs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No scheduled jobs recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                          <th className="py-2 pr-3">Job Type</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2 pr-3">Scheduled Run</th>
                          <th className="py-2 pr-3">Target</th>
                          <th className="py-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {overview.jobs.slice(0, 40).map((job) => (
                          <tr key={job.id}>
                            <td className="py-2.5 pr-3 font-mono font-semibold text-[#0F172A]">
                              {job.jobType}
                            </td>
                            <td className="py-2.5 pr-3">
                              <span
                                className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${statusBadgeClass(
                                  job.status
                                )}`}
                              >
                                {job.status}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3 tabular-nums text-slate-600">
                              {formatDt(job.runAt)}
                            </td>
                            <td className="py-2.5 pr-3 font-mono text-slate-600">
                              {job.phoneE164 || job.memberId || job.leadId || '—'}
                            </td>
                            <td className="py-2.5 text-slate-500">{job.cancelReason || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: NEW EPISODE NOTIFICATIONS */}
          {activeTab === 'episodes' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <form
                  onSubmit={props.onPublishEpisode}
                  className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
                >
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A]">
                      Publish New Episode WhatsApp Alert
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Notifies ONLY active, paid members entitled to the selected drama (VIP = all eligible dramas; Starter/Standard/Plus = selected dramas only) who opted in to New Episode Alerts. Excludes expired, cancelled, revoked, rejected, and blocked accounts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Drama Series</label>
                      <select
                        value={props.selectedDramaId}
                        onChange={(e) => props.onSelectDrama(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                      >
                        {overview.dramasCatalog.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.title} ({d.audience.consentedCount} consented / {d.audience.entitledActiveCount} entitled)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Select Existing Episode (or enter custom below)
                      </label>
                      <select
                        value={props.selectedEpisodeSlug}
                        onChange={(e) => props.onSelectEpisode(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                      >
                        {props.selectedDramaCatalog?.episodes.map((ep) => (
                          <option key={ep.slug} value={ep.slug}>
                            Ep {ep.number} — {ep.title} ({ep.accessType})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Season #</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={props.customSeasonNum}
                        onChange={(e) => props.setCustomSeasonNum(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Episode #</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={props.customEpNum}
                        onChange={(e) => props.setCustomEpNum(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Episode Slug</label>
                      <input
                        type="text"
                        required
                        value={props.selectedEpisodeSlug}
                        onChange={(e) => props.onSelectEpisode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Episode Title</label>
                      <input
                        type="text"
                        required
                        value={props.customEpTitle}
                        onChange={(e) => props.setCustomEpTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Website Watch Link</label>
                      <input
                        type="url"
                        required
                        value={props.customEpUrl}
                        onChange={(e) => props.setCustomEpUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {props.alreadySentForSelectedEpisode && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-950">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        <span>Duplicate Broadcast Protection Active</span>
                      </div>
                      <p>
                        A broadcast was already sent for <strong>{props.selectedEpisodeSlug}</strong>. Editing or republishing an episode will not spam members unless you explicitly check the deliberate resend box below.
                      </p>
                      <label className="flex items-center gap-2 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={props.forceResendEpisode}
                          onChange={(e) => props.setForceResendEpisode(e.target.checked)}
                          className="accent-amber-700"
                        />
                        <span>Deliberate Admin Resend: notify entitled members again</span>
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={props.publishingEpisode}
                    className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] hover:text-[#0F172A] text-white text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
                  >
                    <Tv className="w-4 h-4" />
                    <span>
                      {props.publishingEpisode
                        ? 'Dispatching Episode Alerts...'
                        : props.forceResendEpisode
                        ? 'Resend Episode Notification'
                        : 'Trigger Episode Published Notification'}
                    </span>
                  </button>
                </form>

                {/* Entitled Audience Preview */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h3 className="text-base font-bold text-[#0F172A]">
                    Entitlement &amp; Consent Audience Preview
                  </h3>
                  {props.selectedDramaCatalog ? (
                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">Selected Drama</div>
                        <div className="text-base font-bold text-[#0F172A] mt-0.5">
                          {props.selectedDramaCatalog.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          VIP Eligible: {props.selectedDramaCatalog.vipEligible ? 'Yes (includes VIP members)' : 'No'}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-xl border border-slate-200">
                          <div className="text-[11px] text-slate-500">Entitled Active</div>
                          <div className="text-xl font-bold text-[#0F172A] tabular-nums">
                            {props.selectedDramaCatalog.audience.entitledActiveCount}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                          <div className="text-[11px] text-emerald-800">Will Notify</div>
                          <div className="text-xl font-bold text-[#16A34A] tabular-nums">
                            {props.selectedDramaCatalog.audience.consentedCount}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl border border-slate-200">
                          <div className="text-[11px] text-slate-500">No Consent / Opt-Out</div>
                          <div className="text-xl font-bold text-slate-600 tabular-nums">
                            {props.selectedDramaCatalog.audience.optedOutOrNoConsentCount}
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Unpaid users, expired memberships, rejected orders, cancelled/revoked plans, and blocked emails are automatically excluded on the server.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Select a drama to preview audience.</p>
                  )}
                </div>
              </div>

              {/* Broadcast History */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h3 className="text-base font-bold text-[#0F172A]">Episode Broadcast History</h3>
                {overview.episodeBroadcasts.length === 0 ? (
                  <p className="text-xs text-slate-500">No episode notifications triggered yet.</p>
                ) : (
                  <div className="space-y-3">
                    {overview.episodeBroadcasts.map((b) => (
                      <div
                        key={b.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-xs font-bold text-[#0F172A]">
                            {b.dramaTitle} · S{b.seasonNumber}E{b.episodeNumber} ({b.episodeSlug})
                            {b.isResend && (
                              <span className="ml-2 px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px]">
                                RESEND
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {formatDt(b.createdAt)} · by {b.triggeredByAdminEmail}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span>Entitled: <strong>{b.entitledCount}</strong></span>
                          <span className="text-[#16A34A]">Sent: <strong>{b.sentCount}</strong></span>
                          <span className="text-slate-600">Skipped: <strong>{b.skippedCount}</strong></span>
                          <span className="text-red-600">Failed/Unconfigured: <strong>{b.failedCount}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: 13 OFFICIAL META TEMPLATE DRAFTS */}
          {activeTab === 'templates' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">
                    Meta WhatsApp Template Registry ({overview.templates.length} Templates)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                    Templates default to <strong>draft</strong> and are never assumed approved. Submit each template inside Meta WhatsApp Manager, wait for Meta approval, then update its approval status here to unlock live automated sending.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs shrink-0">
                  {(['all', 'UTILITY', 'MARKETING'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => props.setTemplateFilter(f)}
                      className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                        props.templateFilter === f
                          ? 'bg-white text-[#0F172A] shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      {f === 'all' ? 'All' : f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {props.filteredTemplates.map((tpl) => (
                  <div
                    key={tpl.name}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#0F172A]">
                              {tpl.name}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                tpl.category === 'UTILITY'
                                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                  : 'bg-purple-50 text-purple-800 border border-purple-200'
                              }`}
                            >
                              {tpl.category}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">{tpl.displayName}</div>
                        </div>

                        <select
                          disabled={props.updatingTplName === tpl.name}
                          value={tpl.approvalStatus}
                          onChange={(e) =>
                            props.onUpdateTemplateStatus(
                              tpl.name,
                              e.target.value as TemplateApprovalStatus
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${statusBadgeClass(
                            tpl.approvalStatus
                          )}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="pending_meta_review">Pending Meta Review</option>
                          <option value="approved">Approved in Meta</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {tpl.bodyText}
                      </div>

                      <div className="text-[11px] text-slate-500 leading-relaxed">
                        <strong>Classification note:</strong> {tpl.classificationNote}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        <strong>Trigger:</strong> <span className="font-mono">{tpl.eventTrigger}</span> ·{' '}
                        <strong>Consent Gate:</strong> <span className="font-mono">{tpl.consentCategory}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Lang: {tpl.language} · Footer: {tpl.footerText || 'None'}
                      </span>
                      <button
                        type="button"
                        onClick={() => props.onCopyTemplate(tpl.name, tpl.bodyText)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {props.copiedTpl === tpl.name ? (
                          <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{props.copiedTpl === tpl.name ? 'Copied' : 'Copy Body'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: UNIFIED AI WHATSAPP ASSISTANT */}
          {activeTab === 'ai' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#16A34A]" />
                    <span>AI Assistant Controls</span>
                  </h2>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                      overview.aiConfigured
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {overview.aiConfigured ? 'GEMINI_API_KEY Ready' : 'GEMINI_API_KEY Missing'}
                  </span>
                </div>

                <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">Enable Unified AI Support Agent</div>
                    <div className="text-[11px] text-slate-500">
                      Routes FEVIQO Premium and FEVIQO Creative (Video Editing) questions in English &amp; Urdu.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={props.draftAiEnabled}
                    onChange={(e) => props.setDraftAiEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#16A34A] mt-0.5"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">
                      Auto-Reply on Incoming WhatsApp Webhook
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Automatically replies within Meta's 24h customer care window unless Human Takeover is active.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={props.draftAiAutoReply}
                    onChange={(e) => props.setDraftAiAutoReply(e.target.checked)}
                    className="w-4 h-4 accent-[#16A34A] mt-0.5"
                  />
                </label>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Consultation Booking URL (Video Editing Leads)
                  </label>
                  <input
                    type="url"
                    value={props.draftAiBookingUrl}
                    onChange={(e) => props.setDraftAiBookingUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Human Escalation Keywords (comma-separated)
                  </label>
                  <textarea
                    rows={3}
                    value={props.draftAiKeywords}
                    onChange={(e) => props.setDraftAiKeywords(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <button
                  type="button"
                  disabled={props.savingSettings}
                  onClick={props.onSaveSettings}
                  className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#22C55E] hover:text-[#0F172A] text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
                >
                  {props.savingSettings ? 'Saving...' : 'Save AI Assistant Settings'}
                </button>
              </div>

              {/* AI Sandbox Simulator */}
              <form
                onSubmit={props.onRunAiSimulator}
                className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
              >
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">
                    Unified AI Support Simulator (English &amp; Urdu)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Test how the server-side Gemini assistant routes FEVIQO Premium vs Video Editing queries, enforces anti-hallucination guardrails, scopes customer context by phone, and flags human escalations.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Simulated Sender Name</label>
                    <input
                      type="text"
                      value={props.aiSimName}
                      onChange={(e) => props.setAiSimName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Optional Sender Phone (to test scoped account lookup)
                    </label>
                    <input
                      type="tel"
                      value={props.aiSimPhone}
                      onChange={(e) => props.setAiSimPhone(e.target.value)}
                      placeholder="+923001234567"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Customer WhatsApp Message</label>
                  <textarea
                    rows={3}
                    required
                    value={props.aiSimInput}
                    onChange={(e) => props.setAiSimInput(e.target.value)}
                    placeholder="Try English, Urdu, or Roman Urdu..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  {[
                    'How much is the VIP plan and which dramas are included?',
                    'مجھے مہمد کی نئی قسط دیکھنی ہے، پیمنٹ کیسے کروں؟',
                    'We are an agency looking for 20 short-form Reels per month with motion graphics.',
                    'I want a refund and to speak to a human manager immediately!',
                  ].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => props.setAiSimInput(sample)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      {sample.slice(0, 44)}...
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={props.aiSimBusy}
                  className="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] hover:text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Bot className="w-4 h-4" />
                  <span>{props.aiSimBusy ? 'Generating Reply...' : 'Run AI Support Test'}</span>
                </button>

                {props.aiSimResult && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold">
                        Intent: {props.aiSimResult.intent}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 font-bold">
                        Lang: {props.aiSimResult.detectedLanguage}
                      </span>
                      {props.aiSimResult.escalateToHuman && (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                          ESCALATE TO HUMAN: {props.aiSimResult.escalationReason || 'Requested'}
                        </span>
                      )}
                      {props.aiSimResult.isHighIntentLead && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                          HIGH-INTENT VIDEO LEAD
                        </span>
                      )}
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 whitespace-pre-wrap leading-relaxed text-[#0F172A]">
                      {props.aiSimResult.replyText}
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 6: CUSTOMER CONSENT & OPT-OUT MANAGEMENT */}
          {activeTab === 'consent' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">
                    Customer WhatsApp Consent &amp; Opt-Out Registry
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tracks explicit opt-in categories, consent timestamps, sources, and STOP opt-outs.
                  </p>
                </div>
                <input
                  type="search"
                  value={props.consentSearch}
                  onChange={(e) => props.setConsentSearch(e.target.value)}
                  placeholder="Search name, email, or phone..."
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs w-full sm:w-64"
                />
              </div>

              {props.filteredPrefs.length === 0 ? (
                <p className="text-xs text-slate-500 py-6">No customer preference records yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                        <th className="py-2 pr-3">Customer</th>
                        <th className="py-2 pr-3">WhatsApp (E.164)</th>
                        <th className="py-2 pr-3">Membership</th>
                        <th className="py-2 pr-3">Renewals</th>
                        <th className="py-2 pr-3">Episodes</th>
                        <th className="py-2 pr-3">Promo</th>
                        <th className="py-2 pr-3">Opted Out</th>
                        <th className="py-2">Consent Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {props.filteredPrefs.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2.5 pr-3">
                            <div className="font-semibold text-[#0F172A]">{p.fullName || 'Customer'}</div>
                            <div className="text-[11px] text-slate-500">{p.email || '—'}</div>
                          </td>
                          <td className="py-2.5 pr-3 font-mono">{p.phoneE164}</td>
                          {(
                            [
                              'membershipUpdates',
                              'renewalReminders',
                              'newEpisodeAlerts',
                              'promotionalMessages',
                            ] as const
                          ).map((field) => (
                            <td key={field} className="py-2.5 pr-3">
                              <input
                                type="checkbox"
                                disabled={props.updatingPrefId === p.id}
                                checked={Boolean(p[field])}
                                onChange={(e) =>
                                  props.onTogglePrefField(p.id, { [field]: e.target.checked })
                                }
                                className="w-4 h-4 accent-[#16A34A] cursor-pointer"
                              />
                            </td>
                          ))}
                          <td className="py-2.5 pr-3">
                            <button
                              type="button"
                              disabled={props.updatingPrefId === p.id}
                              onClick={() =>
                                props.onTogglePrefField(p.id, { optedOut: !p.optedOut })
                              }
                              className={`px-2 py-0.5 rounded-md border text-[10px] font-bold cursor-pointer ${
                                p.optedOut
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {p.optedOut ? 'OPTED OUT' : 'ACTIVE'}
                            </button>
                          </td>
                          <td className="py-2.5 text-[11px] text-slate-500">
                            <div>{p.consentSource || '—'}</div>
                            <div>{formatDt(p.consentTimestamp)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: MESSAGE LOGS, FAILED WEBHOOKS & RETRY QUEUE */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              {/* Failed Webhook Events Audit */}
              {(overview.failedWebhookEvents || []).length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-200 p-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Failed Webhook Events ({(overview.failedWebhookEvents || []).length})</span>
                  </div>
                  <div className="space-y-2">
                    {(overview.failedWebhookEvents || []).slice(0, 20).map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-mono font-bold text-[#0F172A]">
                            {ev.eventType} · HTTP {ev.httpStatus} · {ev.status.toUpperCase()}
                          </div>
                          <div className="text-amber-900 mt-0.5">{ev.reason || 'Webhook rejected or failed'}</div>
                        </div>
                        <div className="text-[11px] text-slate-500 tabular-nums shrink-0">
                          {formatDt(ev.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed Message Retry Queue */}
              {overview.retryQueue.length > 0 && (
                <div className="bg-white rounded-2xl border border-red-200 p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-red-800">
                    <RotateCcw className="w-4 h-4" />
                    <span>Failed Message Retry Queue ({overview.retryQueue.length})</span>
                  </div>
                  <div className="space-y-2.5">
                    {overview.retryQueue.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl bg-red-50/50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="font-mono font-bold text-[#0F172A]">
                            {m.recipientPhone} · {m.eventType}{' '}
                            {m.templateName ? `(${m.templateName})` : ''}
                          </div>
                          <div className="text-red-700">{m.errorMessage || 'Delivery failed'}</div>
                          <div className="text-[11px] text-slate-500">
                            Attempts: {m.attempts}/{m.maxAttempts} · Next auto-retry:{' '}
                            {formatDt(m.nextRetryAt)}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={props.retryingId === m.id}
                          onClick={() => props.onRetryMessage(m.id)}
                          className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-60"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{props.retryingId === m.id ? 'Retrying...' : 'Retry Now'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Message History */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A]">
                      WhatsApp Message Logs &amp; Delivery History
                    </h2>
                    <p className="text-xs text-slate-500">
                      Every outbound template/text send, skipped consent/template gate, and inbound webhook message.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={props.logStatusFilter}
                      onChange={(e) => props.setLogStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                    >
                      <option value="all">All Statuses</option>
                      <option value="sent">Sent</option>
                      <option value="delivered">Delivered</option>
                      <option value="read">Read</option>
                      <option value="failed">Failed</option>
                      <option value="not_configured">Not Configured</option>
                      <option value="skipped_template_unapproved">Template Unapproved</option>
                      <option value="skipped_no_consent">No Consent</option>
                      <option value="skipped_opted_out">Opted Out</option>
                      <option value="received">Inbound Received</option>
                    </select>
                    <input
                      type="search"
                      value={props.logSearch}
                      onChange={(e) => props.setLogSearch(e.target.value)}
                      placeholder="Filter phone, event, error..."
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs w-52"
                    />
                  </div>
                </div>

                {props.filteredLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No matching WhatsApp message logs.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                          <th className="py-2 pr-3">Time</th>
                          <th className="py-2 pr-3">Dir</th>
                          <th className="py-2 pr-3">Phone</th>
                          <th className="py-2 pr-3">Event / Template</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2 pr-3">Preview / Error</th>
                          <th className="py-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {props.filteredLogs.slice(0, 80).map((m) => (
                          <tr key={m.id}>
                            <td className="py-2.5 pr-3 whitespace-nowrap text-slate-500 tabular-nums">
                              {formatDt(m.createdAt)}
                            </td>
                            <td className="py-2.5 pr-3 uppercase text-[10px] font-bold text-slate-600">
                              {m.direction}
                            </td>
                            <td className="py-2.5 pr-3 font-mono whitespace-nowrap">
                              {m.recipientPhone}
                            </td>
                            <td className="py-2.5 pr-3">
                              <div className="font-mono font-semibold text-[#0F172A]">
                                {m.eventType}
                              </div>
                              {m.templateName && (
                                <div className="text-[11px] text-slate-500">{m.templateName}</div>
                              )}
                            </td>
                            <td className="py-2.5 pr-3">
                              <span
                                className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase whitespace-nowrap ${statusBadgeClass(
                                  m.status
                                )}`}
                              >
                                {m.status}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3 max-w-xs">
                              <div className="truncate text-slate-700">{m.bodyPreview}</div>
                              {m.errorMessage && (
                                <div className="text-[11px] text-red-600 truncate">
                                  {m.errorMessage}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5">
                              {(m.status === 'failed' || m.status === 'not_configured') &&
                                m.direction === 'outbound' && (
                                  <button
                                    type="button"
                                    disabled={props.retryingId === m.id}
                                    onClick={() => props.onRetryMessage(m.id)}
                                    className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-[11px] font-semibold cursor-pointer"
                                  >
                                    Retry
                                  </button>
                                )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

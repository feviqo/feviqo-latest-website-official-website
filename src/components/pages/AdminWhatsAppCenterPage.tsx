import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  Filter,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Tv,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { AppRoute } from '../../types';
import { AdminPortalAuthGate } from '../admin/AdminPortalAuthGate';
import {
  AdminAutomationOverview,
  ManualWhatsAppCustomerRecipientView,
  OneClickWhatsAppNotificationView,
  cancelManualWhatsAppNotification,
  confirmManualWhatsAppNotificationSent,
  editManualWhatsAppNotification,
  fetchAdminAutomationOverview,
  fetchManualWhatsAppCenter,
  openManualWhatsAppNotification,
  prepareManualWhatsAppMessages,
  syncManualWhatsAppReminders,
} from '../../services/automationService';
import {
  OneClickEventType,
  buildWhatsAppWaMeUrl,
  generateOneClickWhatsAppMessage,
} from '../../utils/whatsappOneClick';

interface AdminWhatsAppCenterPageProps {
  onBookCall: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigatePricing: () => void;
  onNavigateFlow: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

type CenterViewTab = 'directory' | 'queue';

const EVENT_TYPE_OPTIONS: Array<{
  value: OneClickEventType;
  label: string;
  category: string;
}> = [
  { value: 'episode_published', label: 'New Episode Alert', category: 'Episodes' },
  { value: 'customer_registration', label: 'Welcome / Registration', category: 'Registration' },
  { value: 'signup_followup_unpaid', label: 'Signed Up (No Plan Yet) Follow-up', category: 'Registration' },
  { value: 'plan_selected', label: 'Plan Selected (Pending Payment)', category: 'Payment' },
  { value: 'unpaid_plan_reminder', label: 'Unpaid Plan Reminder', category: 'Payment' },
  { value: 'payment_submitted', label: 'Payment Proof Received', category: 'Payment' },
  { value: 'payment_approved', label: 'Payment Approved & Active', category: 'Activation' },
  { value: 'membership_renewed', label: 'Membership Renewed', category: 'Activation' },
  { value: 'payment_rejected', label: 'Payment Rejected (Requires Reason)', category: 'Rejection' },
  { value: 'expiry_reminder_7d', label: 'Expiry Reminder (7 Days)', category: 'Expiry' },
  { value: 'expiry_reminder_3d', label: 'Expiry Reminder (3 Days)', category: 'Expiry' },
  { value: 'expiry_reminder_1d', label: 'Expiry Reminder (1 Day)', category: 'Expiry' },
  { value: 'membership_expired', label: 'Membership Expired', category: 'Expiry' },
  { value: 'account_security_alert', label: 'Account Security Notice', category: 'Security' },
  { value: 'creative_enquiry', label: 'Creative Services Follow-up', category: 'Creative' },
];

const MEMBERSHIP_STATUS_LABELS: Record<
  ManualWhatsAppCustomerRecipientView['membershipStatus'],
  { label: string; badgeClass: string }
> = {
  active: {
    label: 'Active Member',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  pending_verification: {
    label: 'Pending Approval',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  awaiting_payment: {
    label: 'Selected Plan (Unpaid)',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  expired: {
    label: 'Expired',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  rejected: {
    label: 'Payment Rejected',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
  },
  never_purchased: {
    label: 'Registered (Free)',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

function manualStatusMeta(status?: string): { label: string; className: string } {
  switch (status) {
    case 'confirmed_sent':
      return {
        label: 'Manually Confirmed Sent',
        className: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      };
    case 'opened':
      return {
        label: 'Opened in WhatsApp',
        className: 'bg-sky-50 text-sky-800 border-sky-200',
      };
    case 'pending':
      return {
        label: 'Pending Manual Send',
        className: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    case 'failed':
      return {
        label: 'Invalid Phone — Fix Required',
        className: 'bg-red-50 text-red-700 border-red-200',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        className: 'bg-slate-100 text-slate-500 border-slate-200',
      };
    default:
      return {
        label: 'Not Sent Yet',
        className: 'bg-slate-50 text-slate-600 border-slate-200',
      };
  }
}

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

export const AdminWhatsAppCenterPage: React.FC<AdminWhatsAppCenterPageProps> = ({
  onBookCall,
  onNavigateSection,
  onNavigatePricing,
  onNavigateFlow,
  onNavigatePage,
}) => {
  const [viewTab, setViewTab] = useState<CenterViewTab>('directory');
  const [loading, setLoading] = useState(false);
  const [syncingReminders, setSyncingReminders] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Server datasets
  const [stats, setStats] = useState<{
    total: number;
    pending: number;
    opened: number;
    confirmedSent: number;
    failed: number;
    cancelled: number;
    invalidPhones: number;
  }>({
    total: 0,
    pending: 0,
    opened: 0,
    confirmedSent: 0,
    failed: 0,
    cancelled: 0,
    invalidPhones: 0,
  });
  const [notifications, setNotifications] = useState<OneClickWhatsAppNotificationView[]>([]);
  const [recipients, setRecipients] = useState<ManualWhatsAppCustomerRecipientView[]>([]);
  const [dramasCatalog, setDramasCatalog] = useState<AdminAutomationOverview['dramasCatalog']>([]);

  // Directory Filters
  const [recipientSearch, setRecipientSearch] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [dramaFilter, setDramaFilter] = useState('all');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [previewMemberId, setPreviewMemberId] = useState<string | null>(null);

  // Message Composer for Directory
  const [eventType, setEventType] = useState<OneClickEventType>('episode_published');
  const [selectedDramaId, setSelectedDramaId] = useState('mehmed-fetihler-sultani');
  const [selectedEpisodeSlug, setSelectedEpisodeSlug] = useState('');
  const [episodeAccessType, setEpisodeAccessType] = useState<'free' | 'premium'>('premium');
  const [rejectionReason, setRejectionReason] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [preparingBulk, setPreparingBulk] = useState(false);

  // Queue Filters
  const [queueCategoryFilter, setQueueCategoryFilter] = useState('all');
  const [queueStatusFilter, setQueueStatusFilter] = useState('all');
  const [queueSearch, setQueueSearch] = useState('');

  // Inline Edit state for Queue items
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [busyNotificationId, setBusyNotificationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Track instant-opened per member from Directory
  const [directNotificationByMember, setDirectNotificationByMember] = useState<
    Record<string, OneClickWhatsAppNotificationView>
  >({});

  const loadCenterData = useCallback(async () => {
    setLoading(true);
    try {
      const [centerRes, overviewRes] = await Promise.all([
        fetchManualWhatsAppCenter({
          category: queueCategoryFilter === 'all' ? undefined : queueCategoryFilter,
          status: queueStatusFilter === 'all' ? undefined : queueStatusFilter,
          search: queueSearch.trim() || undefined,
          recipientSearch: recipientSearch.trim() || undefined,
          membershipStatus: membershipFilter === 'all' ? undefined : membershipFilter,
          dramaId: dramaFilter === 'all' ? undefined : dramaFilter,
        }),
        fetchAdminAutomationOverview(),
      ]);

      if (!centerRes.success) {
        setBanner({ type: 'error', text: centerRes.error || 'Failed to load Manual WhatsApp Center.' });
      } else {
        if (centerRes.stats) setStats(centerRes.stats);
        setNotifications(centerRes.notifications || []);
        setRecipients(centerRes.recipients || []);
      }

      if (overviewRes.success && overviewRes.dramasCatalog) {
        setDramasCatalog(overviewRes.dramasCatalog);
        if (overviewRes.dramasCatalog.length > 0) {
          setSelectedDramaId((prev) => {
            const exists = overviewRes.dramasCatalog!.some((d) => d.id === prev);
            return exists ? prev : overviewRes.dramasCatalog![0].id;
          });
        }
      }
    } catch {
      setBanner({ type: 'error', text: 'Unable to connect to the backend server.' });
    } finally {
      setLoading(false);
    }
  }, [
    dramaFilter,
    membershipFilter,
    queueCategoryFilter,
    queueSearch,
    queueStatusFilter,
    recipientSearch,
  ]);

  useEffect(() => {
    loadCenterData();
  }, [loadCenterData]);

  const activeDrama = useMemo(
    () => dramasCatalog.find((d) => d.id === selectedDramaId) || dramasCatalog[0] || null,
    [dramasCatalog, selectedDramaId]
  );

  useEffect(() => {
    if (!activeDrama) return;
    if (
      !selectedEpisodeSlug ||
      !activeDrama.episodes.some((ep) => ep.slug === selectedEpisodeSlug)
    ) {
      const firstEp = activeDrama.episodes[0];
      if (firstEp) {
        setSelectedEpisodeSlug(firstEp.slug);
        setEpisodeAccessType(firstEp.accessType === 'free' ? 'free' : 'premium');
      }
    }
  }, [activeDrama, selectedEpisodeSlug]);

  const activeEpisode = useMemo(() => {
    if (!activeDrama) return null;
    return (
      activeDrama.episodes.find((ep) => ep.slug === selectedEpisodeSlug) ||
      activeDrama.episodes[0] ||
      null
    );
  }, [activeDrama, selectedEpisodeSlug]);

  const episodeWatchLink = useMemo(() => {
    if (!activeDrama) return 'https://feviqo.com/dramas';
    const base = `https://feviqo.com/dramas/${activeDrama.slug}`;
    return activeEpisode ? `${base}?episode=${encodeURIComponent(activeEpisode.slug)}` : base;
  }, [activeDrama, activeEpisode]);

  const buildPersonalizedMessageForRecipient = useCallback(
    (recipient: ManualWhatsAppCustomerRecipientView): { ok: true; message: string } | { ok: false; error: string } => {
      if (customMessage.trim()) {
        const replaced = customMessage
          .replace(/\{\{name\}\}/gi, recipient.customerName || 'Valued Member')
          .replace(/\{\{plan\}\}/gi, recipient.planName || 'FEVIQO Membership')
          .replace(/\{\{drama\}\}/gi, activeDrama?.title || 'FEVIQO Drama')
          .replace(/\{\{episode\}\}/gi, activeEpisode ? String(activeEpisode.number) : '')
          .replace(/\{\{link\}\}/gi, episodeWatchLink);
        return { ok: true, message: replaced.trim() };
      }

      return generateOneClickWhatsAppMessage({
        eventType,
        customerName: recipient.customerName,
        planName: recipient.planName || 'FEVIQO Membership',
        expiryDate: recipient.expiresAt,
        rejectionReason: rejectionReason.trim(),
        seriesName: activeDrama?.title,
        episodeNumber: activeEpisode?.number ?? 1,
        episodeLink: episodeWatchLink,
        accessType: episodeAccessType,
      });
    },
    [
      activeDrama,
      activeEpisode,
      customMessage,
      episodeAccessType,
      episodeWatchLink,
      eventType,
      rejectionReason,
    ]
  );

  const eligibleRecipients = useMemo(
    () =>
      recipients.filter((r) => {
        if (!r.phoneValid || r.optedOut) return false;
        if (eventType === 'episode_published' && episodeAccessType === 'premium' && activeDrama) {
          return r.membershipStatus === 'active' && r.entitledDramaIds.includes(activeDrama.id);
        }
        return true;
      }),
    [activeDrama, episodeAccessType, eventType, recipients]
  );

  const previewRecipient = useMemo(() => {
    if (previewMemberId) {
      const found = recipients.find((r) => r.memberId === previewMemberId);
      if (found) return found;
    }
    if (selectedMemberIds.length > 0) {
      const found = recipients.find((r) => r.memberId === selectedMemberIds[0]);
      if (found) return found;
    }
    return eligibleRecipients[0] || recipients[0] || null;
  }, [eligibleRecipients, previewMemberId, recipients, selectedMemberIds]);

  const previewMessageResult = useMemo(() => {
    if (!previewRecipient) return null;
    return buildPersonalizedMessageForRecipient(previewRecipient);
  }, [buildPersonalizedMessageForRecipient, previewRecipient]);

  const toggleSelectMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSelectAllEligible = () => {
    const eligibleIds = eligibleRecipients.map((r) => r.memberId);
    const allSelected =
      eligibleIds.length > 0 && eligibleIds.every((id) => selectedMemberIds.includes(id));
    if (allSelected) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(eligibleIds);
    }
  };

  const handlePrepareSelectedInQueue = async () => {
    if (selectedMemberIds.length === 0) {
      setBanner({ type: 'error', text: 'Select at least one customer from the directory first.' });
      return;
    }
    if (eventType === 'payment_rejected' && !rejectionReason.trim() && !customMessage.trim()) {
      setBanner({
        type: 'error',
        text: 'Enter the actual rejection reason before preparing payment rejection messages.',
      });
      return;
    }
    setPreparingBulk(true);
    setBanner(null);
    try {
      const res = await prepareManualWhatsAppMessages({
        memberIds: selectedMemberIds,
        eventType,
        customMessage: customMessage.trim() || undefined,
        dramaId: eventType === 'episode_published' ? activeDrama?.id : undefined,
        episodeNumber: eventType === 'episode_published' ? activeEpisode?.number : undefined,
        episodeSlug: eventType === 'episode_published' ? activeEpisode?.slug : undefined,
        episodeLink: eventType === 'episode_published' ? episodeWatchLink : undefined,
        accessType: eventType === 'episode_published' ? episodeAccessType : undefined,
        rejectionReason: eventType === 'payment_rejected' ? rejectionReason.trim() : undefined,
      });
      if (!res.success) {
        setBanner({ type: 'error', text: res.error || 'Failed to prepare manual WhatsApp messages.' });
        return;
      }
      setBanner({
        type: 'success',
        text: `Prepared ${res.createdCount || 0} personalized WhatsApp draft(s) in the Manual Queue.${
          res.failedPhoneCount ? ` ${res.failedPhoneCount} need phone correction.` : ''
        }${res.skippedOptedOutCount ? ` ${res.skippedOptedOutCount} opted-out customer(s) skipped.` : ''}`,
      });
      setSelectedMemberIds([]);
      setViewTab('queue');
      await loadCenterData();
    } catch {
      setBanner({ type: 'error', text: 'Error preparing manual WhatsApp messages.' });
    } finally {
      setPreparingBulk(false);
    }
  };

  // Called when clicking native <a href={waUrl}> on a Directory row:
  // prepares & logs "Opened in WhatsApp" without blocking the native link navigation!
  const handleDirectDirectoryOpen = async (recipient: ManualWhatsAppCustomerRecipientView) => {
    try {
      const prepared = await prepareManualWhatsAppMessages({
        memberIds: [recipient.memberId],
        eventType,
        customMessage: customMessage.trim() || undefined,
        dramaId: eventType === 'episode_published' ? activeDrama?.id : undefined,
        episodeNumber: eventType === 'episode_published' ? activeEpisode?.number : undefined,
        episodeSlug: eventType === 'episode_published' ? activeEpisode?.slug : undefined,
        episodeLink: eventType === 'episode_published' ? episodeWatchLink : undefined,
        accessType: eventType === 'episode_published' ? episodeAccessType : undefined,
        rejectionReason: eventType === 'payment_rejected' ? rejectionReason.trim() : undefined,
      });
      const created = prepared.notifications?.[0];
      if (created?.id) {
        const opened = await openManualWhatsAppNotification(created.id);
        const finalRecord = opened.notification || created;
        setDirectNotificationByMember((prev) => ({
          ...prev,
          [recipient.memberId]: finalRecord,
        }));
        await loadCenterData();
      }
    } catch {
      // Non-blocking: the native wa.me anchor already opened WhatsApp for the admin
    }
  };

  const handleQueueOpenClick = async (notification: OneClickWhatsAppNotificationView) => {
    setBusyNotificationId(notification.id);
    try {
      const res = await openManualWhatsAppNotification(notification.id);
      if (res.success && res.notification) {
        setNotifications((prev) =>
          prev.map((item) => (item.id === notification.id ? res.notification! : item))
        );
        await loadCenterData();
      }
    } finally {
      setBusyNotificationId(null);
    }
  };

  const handleConfirmSent = async (notificationId: string, memberId?: string) => {
    setBusyNotificationId(notificationId);
    setBanner(null);
    try {
      const res = await confirmManualWhatsAppNotificationSent(notificationId);
      if (!res.success) {
        setBanner({ type: 'error', text: res.error || 'Could not mark message as manually sent.' });
        return;
      }
      if (memberId && res.notification) {
        setDirectNotificationByMember((prev) => ({ ...prev, [memberId]: res.notification! }));
      }
      setBanner({
        type: 'success',
        text: 'Recorded as Manually Confirmed Sent. (Not marked as Meta Cloud API delivered.)',
      });
      await loadCenterData();
    } finally {
      setBusyNotificationId(null);
    }
  };

  const handleCancelNotification = async (notificationId: string) => {
    setBusyNotificationId(notificationId);
    setBanner(null);
    try {
      const res = await cancelManualWhatsAppNotification(notificationId, 'Cancelled by administrator');
      if (!res.success) {
        setBanner({ type: 'error', text: res.error || 'Failed to cancel notification.' });
        return;
      }
      await loadCenterData();
    } finally {
      setBusyNotificationId(null);
    }
  };

  const handleStartEdit = (n: OneClickWhatsAppNotificationView) => {
    setEditingId(n.id);
    setEditPhone(n.phoneE164 || n.rawPhone || '');
    setEditMessage(n.messageText || '');
  };

  const handleSaveEdit = async (notificationId: string) => {
    setBusyNotificationId(notificationId);
    setBanner(null);
    try {
      const res = await editManualWhatsAppNotification(notificationId, {
        rawPhone: editPhone.trim(),
        messageText: editMessage.trim(),
      });
      if (!res.success) {
        setBanner({ type: 'error', text: res.error || 'Failed to update notification.' });
        return;
      }
      setEditingId(null);
      setBanner({
        type: 'success',
        text: res.notification?.phoneValid
          ? 'Updated message and validated WhatsApp link.'
          : `Saved edits, but phone is still invalid: ${res.notification?.phoneError || 'Check country code.'}`,
      });
      await loadCenterData();
    } finally {
      setBusyNotificationId(null);
    }
  };

  const handleSyncReminders = async () => {
    setSyncingReminders(true);
    setBanner(null);
    try {
      const res = await syncManualWhatsAppReminders();
      if (!res.success) {
        setBanner({ type: 'error', text: res.error || 'Failed to sync lifecycle reminders.' });
        return;
      }
      setBanner({
        type: 'success',
        text: `Synced manual lifecycle reminders: ${res.summary?.queued || 0} queued, ${res.summary?.skipped || 0} skipped.`,
      });
      await loadCenterData();
    } finally {
      setSyncingReminders(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1600);
  };

  return (
    <AdminPortalAuthGate
      currentSection="whatsapp"
      onBookCall={onBookCall}
      onNavigateSection={onNavigateSection}
      onNavigatePricing={onNavigatePricing}
      onNavigateFlow={onNavigateFlow}
      onNavigatePage={onNavigatePage}
    >
      {({ renderSectionSwitcher }) => (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#16A34A]">
                  <Send className="w-4 h-4" />
                  <span>Independent Manual WhatsApp Sending Center</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                  Manual WhatsApp Center
                </h1>
                <p className="text-sm text-slate-600 max-w-3xl">
                  Send personalized WhatsApp messages directly through WhatsApp Web/App independently of the Meta Cloud API. Every link formats international numbers strictly without guessing missing country codes, tracks <strong>Opened in WhatsApp</strong>, and waits for your explicit <strong>Mark as Sent</strong> confirmation.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncReminders}
                  disabled={syncingReminders}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition disabled:opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{syncingReminders ? 'Syncing...' : 'Sync Expiry & Unpaid Reminders'}</span>
                </button>
                <button
                  type="button"
                  onClick={loadCenterData}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100">{renderSectionSwitcher()}</div>
          </div>

          {banner && (
            <div
              className={`p-4 rounded-xl border text-sm flex items-start justify-between gap-3 ${
                banner.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {banner.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                )}
                <span>{banner.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Customer Directory
              </div>
              <div className="mt-1 text-2xl font-bold text-[#0F172A]">{recipients.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Non-blocked accounts</div>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                Pending Manual
              </div>
              <div className="mt-1 text-2xl font-bold text-amber-900">{stats.pending}</div>
              <div className="text-[11px] text-amber-700/80 mt-0.5">Ready to open</div>
            </div>
            <div className="bg-white rounded-xl border border-sky-200 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">
                Opened in WhatsApp
              </div>
              <div className="mt-1 text-2xl font-bold text-sky-900">{stats.opened}</div>
              <div className="text-[11px] text-sky-700/80 mt-0.5">Awaiting confirmation</div>
            </div>
            <div className="bg-white rounded-xl border border-emerald-200 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Confirmed Sent
              </div>
              <div className="mt-1 text-2xl font-bold text-emerald-900">{stats.confirmedSent}</div>
              <div className="text-[11px] text-emerald-700/80 mt-0.5">Manually confirmed</div>
            </div>
            <div className="bg-white rounded-xl border border-red-200 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-red-700">
                Invalid Phones
              </div>
              <div className="mt-1 text-2xl font-bold text-red-800">{stats.invalidPhones}</div>
              <div className="text-[11px] text-red-600/80 mt-0.5">Needs country code</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Cancelled
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-700">{stats.cancelled}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Skipped or blocked</div>
            </div>
          </div>

          {/* Primary Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setViewTab('directory')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition ${
                viewTab === 'directory'
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customer Recipient List ({recipients.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab('queue')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition ${
                viewTab === 'queue'
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>
                Manual Queue &amp; Tracking ({stats.pending + stats.opened} active / {stats.total} total)
              </span>
            </button>
          </div>

          {viewTab === 'directory' ? (
            <div className="space-y-5">
              {/* Message Composer + Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#16A34A]" />
                      <span>1. Choose Message Category &amp; Content</span>
                    </h2>
                    <span className="text-[11px] font-medium text-slate-500">
                      Generates real <code className="bg-slate-100 px-1.5 py-0.5 rounded">wa.me</code> links
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Message Category
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as OneClickEventType)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-[#0F172A]"
                      >
                        {EVENT_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            [{opt.category}] {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {eventType === 'episode_published' && (
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Episode Access Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setEpisodeAccessType('free')}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold border cursor-pointer transition ${
                              episodeAccessType === 'free'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            Free Episode
                          </button>
                          <button
                            type="button"
                            onClick={() => setEpisodeAccessType('premium')}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold border cursor-pointer transition ${
                              episodeAccessType === 'premium'
                                ? 'bg-[#0F172A] text-white border-[#0F172A]'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            Premium Episode
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {eventType === 'episode_published' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Drama</label>
                        <select
                          value={selectedDramaId}
                          onChange={(e) => setSelectedDramaId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                        >
                          {dramasCatalog.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Episode</label>
                        <select
                          value={selectedEpisodeSlug}
                          onChange={(e) => setSelectedEpisodeSlug(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                        >
                          {(activeDrama?.episodes || []).map((ep) => (
                            <option key={ep.slug} value={ep.slug}>
                              Ep {ep.number} — {ep.title} ({ep.accessType})
                            </option>
                          ))}
                        </select>
                      </div>
                      {episodeAccessType === 'premium' && (
                        <div className="sm:col-span-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-700" />
                          <span>
                            Premium protection active: Only active paid members entitled to{' '}
                            <strong>{activeDrama?.title || 'this drama'}</strong> are marked eligible for Premium episode links.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {eventType === 'payment_rejected' && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-red-700">
                        Actual Rejection Reason (Required)
                      </label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Payment receipt amount does not match selected Starter PKR plan."
                        className="w-full px-3 py-2 rounded-xl border border-red-300 text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Optional Custom Message Override (leave blank to use FEVIQO template)
                    </label>
                    <textarea
                      rows={3}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Optional custom text. Placeholders supported: {{name}}, {{plan}}, {{drama}}, {{episode}}, {{link}}"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>
                </div>

                {/* Live Personalized Message Preview */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-bold text-[#0F172A]">
                        Live Personalized Message Preview
                      </h2>
                      {previewRecipient && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {previewRecipient.customerName}
                        </span>
                      )}
                    </div>

                    {!previewRecipient ? (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                        No matching customers found for the current filters.
                      </div>
                    ) : previewMessageResult?.ok ? (
                      <div className="rounded-xl bg-[#ECFDF5] border border-emerald-200 p-4 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-mono max-h-56 overflow-y-auto">
                        {previewMessageResult.message}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{previewMessageResult?.error || 'Fill required fields to preview.'}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-500">
                      Selected: <strong className="text-[#0F172A]">{selectedMemberIds.length}</strong> · Eligible:{' '}
                      <strong className="text-emerald-700">{eligibleRecipients.length}</strong>
                    </div>
                    <button
                      type="button"
                      disabled={preparingBulk || selectedMemberIds.length === 0}
                      onClick={handlePrepareSelectedInQueue}
                      className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#16A34A] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {preparingBulk
                          ? 'Preparing...'
                          : `Prepare ${selectedMemberIds.length} in Manual Queue`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-4 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      placeholder="Search customer name, email, or WhatsApp number..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>
                  <div className="md:col-span-3 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                      value={membershipFilter}
                      onChange={(e) => setMembershipFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      <option value="all">All Membership Statuses</option>
                      <option value="active">Active Paid Members</option>
                      <option value="pending_verification">Pending Payment Approval</option>
                      <option value="awaiting_payment">Selected Plan (Unpaid)</option>
                      <option value="expired">Expired Memberships</option>
                      <option value="rejected">Payment Rejected</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="never_purchased">Registered (Never Purchased)</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 flex items-center gap-2">
                    <Tv className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                      value={dramaFilter}
                      onChange={(e) => setDramaFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      <option value="all">All Drama Entitlements</option>
                      {dramasCatalog.map((d) => (
                        <option key={d.id} value={d.id}>
                          Entitled to {d.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSelectAllEligible}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold cursor-pointer transition"
                    >
                      {eligibleRecipients.length > 0 &&
                      eligibleRecipients.every((r) => selectedMemberIds.includes(r.memberId))
                        ? 'Clear Selection'
                        : `Select Eligible (${eligibleRecipients.length})`}
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Recipient Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4 w-10">Sel</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">WhatsApp Number</th>
                        <th className="py-3 px-4">Membership &amp; Drama Entitlement</th>
                        <th className="py-3 px-4">Manual Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recipients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-500">
                            No customers match the current search or filter criteria.
                          </td>
                        </tr>
                      ) : (
                        recipients.map((r) => {
                          const statusInfo =
                            MEMBERSHIP_STATUS_LABELS[r.membershipStatus] ||
                            MEMBERSHIP_STATUS_LABELS.never_purchased;
                          const directRec = directNotificationByMember[r.memberId];
                          const currentManualStatus =
                            directRec?.status || r.latestManualStatus;
                          const currentNotificationId =
                            directRec?.id || r.latestManualNotificationId;
                          const manualMeta = manualStatusMeta(currentManualStatus);

                          const premiumBlocked =
                            eventType === 'episode_published' &&
                            episodeAccessType === 'premium' &&
                            activeDrama &&
                            !(
                              r.membershipStatus === 'active' &&
                              r.entitledDramaIds.includes(activeDrama.id)
                            );

                          const msgResult = buildPersonalizedMessageForRecipient(r);
                          const waBuild =
                            r.phoneValid && !r.optedOut && !premiumBlocked && msgResult.ok
                              ? buildWhatsAppWaMeUrl(r.formattedPhone || r.rawPhone, msgResult.message)
                              : null;

                          const isSelected = selectedMemberIds.includes(r.memberId);

                          return (
                            <tr
                              key={r.memberId}
                              onClick={() => setPreviewMemberId(r.memberId)}
                              className={`hover:bg-slate-50/80 transition ${
                                previewRecipient?.memberId === r.memberId ? 'bg-emerald-50/30' : ''
                              }`}
                            >
                              <td
                                className="py-3.5 px-4 align-top"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!r.phoneValid || r.optedOut || Boolean(premiumBlocked)}
                                  onChange={() => toggleSelectMember(r.memberId)}
                                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-40"
                                />
                              </td>
                              <td className="py-3.5 px-4 align-top">
                                <div className="font-semibold text-[#0F172A]">{r.customerName}</div>
                                <div className="text-[11px] text-slate-500">{r.customerEmail}</div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {r.optedOut ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                                      Opted Out (STOP)
                                    </span>
                                  ) : r.hasWhatsappConsent ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      API Opt-In
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                      No Auto Opt-In
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 align-top">
                                {r.phoneValid ? (
                                  <div>
                                    <div className="font-mono font-semibold text-[#0F172A] flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-emerald-600" />
                                      <span>{r.formattedPhone}</span>
                                    </div>
                                    {r.rawPhone !== r.formattedPhone && (
                                      <div className="text-[10px] text-slate-400">
                                        Saved as: {r.rawPhone}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-0.5">
                                    <div className="font-mono text-red-700 font-semibold">
                                      {r.rawPhone || 'No number'}
                                    </div>
                                    <div className="text-[10px] text-red-600 max-w-[200px]">
                                      {r.phoneError || 'Missing country code'}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 align-top space-y-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusInfo.badgeClass}`}
                                >
                                  {statusInfo.label}
                                </span>
                                {r.planName && r.planName !== 'No Plan' && (
                                  <div className="text-[11px] text-slate-600 font-medium">
                                    Plan: {r.planName}
                                  </div>
                                )}
                                {r.entitledDramaTitles.length > 0 ? (
                                  <div className="text-[11px] text-slate-500">
                                    Dramas: {r.entitledDramaTitles.join(', ')}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400">
                                    No active drama entitlement
                                  </div>
                                )}
                                {premiumBlocked && (
                                  <div className="text-[10px] font-semibold text-amber-700">
                                    Not entitled to {activeDrama?.title} Premium
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 align-top">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${manualMeta.className}`}
                                >
                                  {manualMeta.label}
                                </span>
                                {r.latestManualEventType && (
                                  <div className="text-[10px] text-slate-400 mt-1">
                                    Last: {r.latestManualEventType}
                                  </div>
                                )}
                              </td>
                              <td
                                className="py-3.5 px-4 align-top text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                                  {waBuild && waBuild.ok ? (
                                    <a
                                      href={waBuild.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => handleDirectDirectoryOpen(r)}
                                      className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>SEND ON WHATSAPP</span>
                                    </a>
                                  ) : (
                                    <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-[11px] font-semibold">
                                      {r.optedOut
                                        ? 'Opted Out'
                                        : premiumBlocked
                                        ? 'Not Entitled'
                                        : !r.phoneValid
                                        ? 'Invalid Phone'
                                        : 'Check Message'}
                                    </span>
                                  )}

                                  {currentNotificationId &&
                                    currentManualStatus !== 'confirmed_sent' &&
                                    currentManualStatus !== 'cancelled' && (
                                      <button
                                        type="button"
                                        disabled={busyNotificationId === currentNotificationId}
                                        onClick={() =>
                                          handleConfirmSent(currentNotificationId, r.memberId)
                                        }
                                        className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                                      >
                                        <Check className="w-3 h-3" />
                                        <span>Mark Sent</span>
                                      </button>
                                    )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Manual Queue & Tracking Tab */
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={queueSearch}
                    onChange={(e) => setQueueSearch(e.target.value)}
                    placeholder="Search queue by customer, phone, or message text..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
                <div className="md:col-span-3">
                  <select
                    value={queueCategoryFilter}
                    onChange={(e) => setQueueCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="episodes">Episodes</option>
                    <option value="registration">Registration</option>
                    <option value="payment">Payment</option>
                    <option value="activation">Activation &amp; Renewal</option>
                    <option value="rejection">Rejection</option>
                    <option value="expiry">Expiry Reminders</option>
                    <option value="security">Security</option>
                    <option value="creative_enquiries">Creative Enquiries</option>
                  </select>
                </div>
                <div className="md:col-span-4">
                  <select
                    value={queueStatusFilter}
                    onChange={(e) => setQueueStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="all">All Queue Statuses</option>
                    <option value="pending">Pending Manual Send</option>
                    <option value="opened">Opened in WhatsApp</option>
                    <option value="confirmed_sent">Manually Confirmed Sent</option>
                    <option value="failed">Invalid Phone (Needs Fix)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-sm font-semibold text-slate-700">
                    No manual WhatsApp notifications match these filters
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Use the Customer Recipient List tab to select customers and prepare personalized WhatsApp drafts, or trigger an episode broadcast in Manual / Fallback mode.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((item) => {
                    const meta = manualStatusMeta(item.status);
                    const isEditing = editingId === item.id;
                    const busy = busyNotificationId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-[#0F172A]">
                                {item.customerName}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${meta.className}`}
                              >
                                {meta.label}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                                {item.category} · {item.eventType}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span>
                                Phone:{' '}
                                {item.phoneValid ? (
                                  <strong className="font-mono text-[#0F172A]">
                                    {item.phoneE164}
                                  </strong>
                                ) : (
                                  <strong className="text-red-700">
                                    {item.rawPhone || 'Missing'} ({item.phoneError || 'Invalid'})
                                  </strong>
                                )}
                              </span>
                              {item.customerEmail && <span>{item.customerEmail}</span>}
                              {item.planName && <span>Plan: {item.planName}</span>}
                              <span className="text-slate-400">
                                Created {formatDt(item.createdAt)}
                              </span>
                              {item.openCount > 0 && (
                                <span className="text-sky-700 font-medium">
                                  Opened {item.openCount}x ({formatDt(item.openedAt)})
                                </span>
                              )}
                              {item.confirmedSentAt && (
                                <span className="text-emerald-700 font-medium">
                                  Confirmed {formatDt(item.confirmedSentAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {item.phoneValid &&
                              item.waUrl &&
                              item.status !== 'cancelled' && (
                                <a
                                  href={item.waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => handleQueueOpenClick(item)}
                                  className="px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>
                                    {item.status === 'opened'
                                      ? 'Re-open in WhatsApp'
                                      : 'SEND ON WHATSAPP'}
                                  </span>
                                </a>
                              )}

                            {item.status !== 'confirmed_sent' &&
                              item.status !== 'cancelled' &&
                              item.phoneValid && (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => handleConfirmSent(item.id)}
                                  className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Mark as Sent</span>
                                </button>
                              )}

                            {item.status !== 'cancelled' && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  isEditing ? setEditingId(null) : handleStartEdit(item)
                                }
                                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{isEditing ? 'Close Editor' : 'Edit / Fix Phone'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleCopyText(item.id, item.messageText)}
                              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition"
                            >
                              {copiedId === item.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            {item.status !== 'cancelled' && item.status !== 'confirmed_sent' && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleCancelNotification(item.id)}
                                className="px-3 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-700">
                                Recipient Phone (E.164 with +country code or Pakistani 03XXXXXXXXX)
                              </label>
                              <input
                                type="text"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                placeholder="+923227811264 or 03227811264"
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-700">
                                Personalized Message Text
                              </label>
                              <textarea
                                rows={5}
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                              />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleSaveEdit(item.id)}
                                className="px-4 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#16A34A] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                              >
                                {busy ? 'Saving...' : 'Save & Re-validate Link'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
                            {item.messageText}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </AdminPortalAuthGate>
  );
};

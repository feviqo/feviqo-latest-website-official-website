import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Ban,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Filter,
  Megaphone,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
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
import { updateMemberPhoneAdmin } from '../../services/membershipService';
import {
  ManualCampaignPurpose,
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

type DirectoryQuickFilter =
  | 'all_registered'
  | 'eligible_promo'
  | 'entitled_drama'
  | 'missing_consent'
  | 'missing_phone'
  | 'blocked';

const CAMPAIGN_PURPOSE_OPTIONS: Array<{
  value: ManualCampaignPurpose;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    value: 'premium_promotion',
    label: 'Premium Episode Promotion / Membership Purchase Invitation',
    shortLabel: 'Premium Episode Promo',
    description:
      'Entitled active members get the authorized episode watch link. Non-entitled registered users get a promotional invite to feviqo.com/membership (never the protected stream link).',
  },
  {
    value: 'premium_access',
    label: 'Premium Episode Access Notification (Entitled Members Only)',
    shortLabel: 'Premium Access Only',
    description:
      'Strictly limited to active paid members entitled to the selected drama. Sends the authorized episode watch link.',
  },
  {
    value: 'free_episode',
    label: 'Free Episode Announcement',
    shortLabel: 'Free Episode',
    description:
      'Sends a free Urdu-dubbed episode watch announcement to all non-blocked registered customers.',
  },
  {
    value: 'general_membership_promo',
    label: 'General Membership Promotion',
    shortLabel: 'Membership Promo',
    description:
      'Invites registered customers to explore and purchase a FEVIQO Starter, Standard, Plus, or VIP membership.',
  },
  {
    value: 'custom',
    label: 'Custom Message / Account Lifecycle Template',
    shortLabel: 'Custom / Lifecycle',
    description:
      'Send a custom WhatsApp message or choose any payment, expiry, renewal, or support lifecycle template.',
  },
];

const LIFECYCLE_EVENT_TYPE_OPTIONS: Array<{
  value: OneClickEventType;
  label: string;
  category: string;
}> = [
  { value: 'custom_message', label: 'Custom Message Text', category: 'Custom' },
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

const PHONE_SOURCE_LABELS: Record<string, string> = {
  verified_profile: 'Verified profile',
  firebase_auth: 'Firebase Auth',
  account_profile: 'Account profile',
  whatsapp_pref: 'WhatsApp profile',
  membership_record: 'Membership record',
  order_record: 'Checkout / payment record',
  missing: 'Missing',
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
  const [allRecipients, setAllRecipients] = useState<ManualWhatsAppCustomerRecipientView[]>([]);
  const [dramasCatalog, setDramasCatalog] = useState<AdminAutomationOverview['dramasCatalog']>([]);

  // Directory Filters
  const [quickFilter, setQuickFilter] = useState<DirectoryQuickFilter>('all_registered');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [dramaFilter, setDramaFilter] = useState('all');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [previewMemberId, setPreviewMemberId] = useState<string | null>(null);

  // Campaign Purpose & Message Composer
  const [campaignPurpose, setCampaignPurpose] =
    useState<ManualCampaignPurpose>('premium_promotion');
  const [lifecycleEventType, setLifecycleEventType] =
    useState<OneClickEventType>('signup_followup_unpaid');
  const [selectedDramaId, setSelectedDramaId] = useState('mehmed-fetihler-sultani');
  const [selectedEpisodeSlug, setSelectedEpisodeSlug] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [preparingBulk, setPreparingBulk] = useState(false);

  // Inline Customer Phone Correction State (Directory)
  const [editingMemberPhoneId, setEditingMemberPhoneId] = useState<string | null>(null);
  const [memberPhoneDraft, setMemberPhoneDraft] = useState('');
  const [savingMemberPhone, setSavingMemberPhone] = useState(false);

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
        }),
        fetchAdminAutomationOverview(),
      ]);

      if (!centerRes.success) {
        setBanner({
          type: 'error',
          text: centerRes.error || 'Failed to load Manual WhatsApp Center.',
        });
      } else {
        if (centerRes.stats) setStats(centerRes.stats);
        setNotifications(centerRes.notifications || []);
        setAllRecipients(centerRes.recipients || []);
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
  }, [queueCategoryFilter, queueSearch, queueStatusFilter]);

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

  const isEpisodeCampaign =
    campaignPurpose === 'free_episode' ||
    campaignPurpose === 'premium_access' ||
    campaignPurpose === 'premium_promotion';

  const effectiveEpisodeAccessType: 'free' | 'premium' =
    campaignPurpose === 'free_episode' ? 'free' : 'premium';

  const episodeWatchLink = useMemo(() => {
    if (!activeDrama) return 'https://feviqo.com/dramas';
    const base = `https://feviqo.com/dramas/${activeDrama.slug}`;
    return activeEpisode ? `${base}?episode=${encodeURIComponent(activeEpisode.slug)}` : base;
  }, [activeDrama, activeEpisode]);

  const isEntitledToSelectedDrama = useCallback(
    (r: ManualWhatsAppCustomerRecipientView): boolean => {
      if (r.isBlocked) return false;
      if (!activeDrama) return r.membershipStatus === 'active';
      return r.membershipStatus === 'active' && r.entitledDramaIds.includes(activeDrama.id);
    },
    [activeDrama]
  );

  // Per-recipient eligibility evaluation for the active Campaign Purpose
  const evaluateRecipientEligibility = useCallback(
    (
      r: ManualWhatsAppCustomerRecipientView
    ): {
      selectable: boolean;
      role: 'entitled' | 'promo_target' | 'general_target' | 'ineligible';
      badgeLabel: string;
      badgeClass: string;
      reason?: string;
    } => {
      if (r.isBlocked) {
        return {
          selectable: false,
          role: 'ineligible',
          badgeLabel: 'Blocked Customer',
          badgeClass: 'bg-red-100 text-red-800 border-red-300',
          reason: r.blockedReason || 'Account permanently blocked by admin',
        };
      }
      if (r.optedOut) {
        return {
          selectable: false,
          role: 'ineligible',
          badgeLabel: 'Opted Out (STOP)',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          reason: 'Customer opted out of WhatsApp messages (STOP)',
        };
      }
      if (!r.phoneValid) {
        return {
          selectable: false,
          role: 'ineligible',
          badgeLabel: r.rawPhone ? 'Invalid Phone' : 'Phone number missing',
          badgeClass: 'bg-red-50 text-red-700 border-red-200',
          reason: r.phoneError || 'Phone number missing — add a valid number to send',
        };
      }

      const entitled = isEntitledToSelectedDrama(r);

      if (campaignPurpose === 'premium_access') {
        if (!entitled) {
          return {
            selectable: false,
            role: 'ineligible',
            badgeLabel: `Not entitled to ${activeDrama?.title || 'Drama'} Premium`,
            badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
            reason: `Mode A (Access Only): Not entitled to ${activeDrama?.title || 'selected drama'} Premium. Switch to "Premium Episode Promotion" to send a membership invite instead.`,
          };
        }
        return {
          selectable: true,
          role: 'entitled',
          badgeLabel: 'Entitled · Access Link',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      }

      if (campaignPurpose === 'premium_promotion') {
        if (entitled) {
          return {
            selectable: true,
            role: 'entitled',
            badgeLabel: 'Entitled · Watch Link',
            badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          };
        }
        return {
          selectable: true,
          role: 'promo_target',
          badgeLabel: 'Eligible for Premium Promotion',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      }

      if (campaignPurpose === 'free_episode') {
        return {
          selectable: true,
          role: 'general_target',
          badgeLabel: 'Eligible · Free Episode',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      }

      if (campaignPurpose === 'general_membership_promo') {
        return {
          selectable: true,
          role: entitled ? 'entitled' : 'promo_target',
          badgeLabel:
            r.membershipStatus === 'active'
              ? 'Active Member · Promo'
              : 'Eligible for Membership Promo',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      }

      return {
        selectable: true,
        role: 'general_target',
        badgeLabel: 'Eligible',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    },
    [activeDrama, campaignPurpose, isEntitledToSelectedDrama]
  );

  // Exact counts across ALL customers (before search/quick-filter narrowing)
  const directoryCounts = useMemo(() => {
    const nonBlocked = allRecipients.filter((r) => !r.isBlocked);
    const blocked = allRecipients.filter((r) => Boolean(r.isBlocked));
    const entitledDrama = nonBlocked.filter((r) => isEntitledToSelectedDrama(r));
    const eligiblePromo = nonBlocked.filter(
      (r) => r.phoneValid && !r.optedOut && !isEntitledToSelectedDrama(r)
    );
    const missingConsent = nonBlocked.filter((r) => !r.hasWhatsappConsent || r.optedOut);
    const missingPhone = nonBlocked.filter((r) => !r.phoneValid);

    return {
      allRegistered: nonBlocked.length,
      entitledDrama: entitledDrama.length,
      eligiblePromo: eligiblePromo.length,
      missingConsent: missingConsent.length,
      missingPhone: missingPhone.length,
      blocked: blocked.length,
    };
  }, [allRecipients, isEntitledToSelectedDrama]);

  // Apply quick filter + search + membership dropdown + drama dropdown
  const filteredRecipients = useMemo(() => {
    let list = allRecipients;

    switch (quickFilter) {
      case 'all_registered':
        list = list.filter((r) => !r.isBlocked);
        break;
      case 'eligible_promo':
        list = list.filter(
          (r) => !r.isBlocked && r.phoneValid && !r.optedOut && !isEntitledToSelectedDrama(r)
        );
        break;
      case 'entitled_drama':
        list = list.filter((r) => !r.isBlocked && isEntitledToSelectedDrama(r));
        break;
      case 'missing_consent':
        list = list.filter((r) => !r.isBlocked && (!r.hasWhatsappConsent || r.optedOut));
        break;
      case 'missing_phone':
        list = list.filter((r) => !r.isBlocked && !r.phoneValid);
        break;
      case 'blocked':
        list = list.filter((r) => Boolean(r.isBlocked));
        break;
    }

    if (membershipFilter !== 'all') {
      list = list.filter((r) => r.membershipStatus === membershipFilter);
    }
    if (dramaFilter !== 'all') {
      list = list.filter((r) => r.entitledDramaIds.includes(dramaFilter));
    }
    if (recipientSearch.trim()) {
      const q = recipientSearch.trim().toLowerCase();
      list = list.filter((r) =>
        `${r.customerName} ${r.customerEmail} ${r.rawPhone} ${r.formattedPhone} ${r.planName} ${r.entitledDramaTitles.join(' ')} ${r.blockedReason || ''}`
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [
    allRecipients,
    dramaFilter,
    isEntitledToSelectedDrama,
    membershipFilter,
    quickFilter,
    recipientSearch,
  ]);

  const selectableVisibleRecipients = useMemo(
    () => filteredRecipients.filter((r) => evaluateRecipientEligibility(r).selectable),
    [evaluateRecipientEligibility, filteredRecipients]
  );

  // Clear selections that become ineligible when switching campaign purpose or filters
  useEffect(() => {
    const selectableSet = new Set(
      allRecipients.filter((r) => evaluateRecipientEligibility(r).selectable).map((r) => r.memberId)
    );
    setSelectedMemberIds((prev) => {
      const next = prev.filter((id) => selectableSet.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [allRecipients, evaluateRecipientEligibility]);

  const resolveEventTypeForRequest = useCallback((): OneClickEventType => {
    switch (campaignPurpose) {
      case 'free_episode':
      case 'premium_access':
        return 'episode_published';
      case 'premium_promotion':
        return 'premium_episode_promo';
      case 'general_membership_promo':
        return 'general_membership_promo';
      case 'custom':
        return lifecycleEventType;
    }
  }, [campaignPurpose, lifecycleEventType]);

  const buildPersonalizedMessageForRecipient = useCallback(
    (
      recipient: ManualWhatsAppCustomerRecipientView
    ): { ok: true; message: string; variant: 'entitled' | 'promo' | 'standard' } | { ok: false; error: string } => {
      const entitled = isEntitledToSelectedDrama(recipient);
      const safeLink =
        campaignPurpose === 'premium_promotion' && !entitled
          ? 'https://feviqo.com/membership'
          : campaignPurpose === 'general_membership_promo'
          ? 'https://feviqo.com/membership'
          : episodeWatchLink;

      if (customMessage.trim()) {
        const replaced = customMessage
          .replace(/\{\{name\}\}/gi, recipient.customerName || 'Valued Member')
          .replace(/\{\{plan\}\}/gi, recipient.planName || 'FEVIQO Membership')
          .replace(/\{\{drama\}\}/gi, activeDrama?.title || 'FEVIQO Drama')
          .replace(/\{\{episode\}\}/gi, activeEpisode ? String(activeEpisode.number) : '')
          .replace(/\{\{link\}\}/gi, safeLink);
        return {
          ok: true,
          message: replaced.trim(),
          variant:
            campaignPurpose === 'premium_promotion'
              ? entitled
                ? 'entitled'
                : 'promo'
              : 'standard',
        };
      }

      if (campaignPurpose === 'premium_promotion') {
        if (entitled) {
          const res = generateOneClickWhatsAppMessage({
            eventType: 'episode_published',
            customerName: recipient.customerName,
            planName: recipient.planName || 'FEVIQO Membership',
            seriesName: activeDrama?.title,
            episodeNumber: activeEpisode?.number ?? 1,
            episodeLink: episodeWatchLink,
            accessType: 'premium',
          });
          if (res.ok) return { ok: true, message: res.message, variant: 'entitled' };
          return { ok: false, error: 'error' in res ? res.error : 'Invalid episode message.' };
        }
        const res = generateOneClickWhatsAppMessage({
          eventType: 'premium_episode_promo',
          customerName: recipient.customerName,
          seriesName: activeDrama?.title,
          episodeNumber: activeEpisode?.number ?? 1,
        });
        if (res.ok) return { ok: true, message: res.message, variant: 'promo' };
        return { ok: false, error: 'error' in res ? res.error : 'Invalid promo message.' };
      }

      if (campaignPurpose === 'premium_access' || campaignPurpose === 'free_episode') {
        const res = generateOneClickWhatsAppMessage({
          eventType: 'episode_published',
          customerName: recipient.customerName,
          planName: recipient.planName || 'FEVIQO Membership',
          seriesName: activeDrama?.title,
          episodeNumber: activeEpisode?.number ?? 1,
          episodeLink: episodeWatchLink,
          accessType: effectiveEpisodeAccessType,
        });
        if (res.ok) {
          return { ok: true, message: res.message, variant: entitled ? 'entitled' : 'standard' };
        }
        return { ok: false, error: 'error' in res ? res.error : 'Invalid episode message.' };
      }

      if (campaignPurpose === 'general_membership_promo') {
        const res = generateOneClickWhatsAppMessage({
          eventType: 'general_membership_promo',
          customerName: recipient.customerName,
        });
        if (res.ok) return { ok: true, message: res.message, variant: 'promo' };
        return { ok: false, error: 'error' in res ? res.error : 'Invalid promo message.' };
      }

      const res = generateOneClickWhatsAppMessage({
        eventType: lifecycleEventType,
        customerName: recipient.customerName,
        planName: recipient.planName || 'FEVIQO Membership',
        expiryDate: recipient.expiresAt,
        rejectionReason: rejectionReason.trim(),
        seriesName: activeDrama?.title,
        episodeNumber: activeEpisode?.number ?? 1,
        episodeLink: episodeWatchLink,
        accessType: effectiveEpisodeAccessType,
      });
      if (res.ok) return { ok: true, message: res.message, variant: 'standard' };
      return { ok: false, error: 'error' in res ? res.error : 'Fill required fields to preview.' };
    },
    [
      activeDrama,
      activeEpisode,
      campaignPurpose,
      customMessage,
      effectiveEpisodeAccessType,
      episodeWatchLink,
      isEntitledToSelectedDrama,
      lifecycleEventType,
      rejectionReason,
    ]
  );

  // Representative recipients for Dual Preview (Entitled vs Non-Entitled Promo)
  const sampleEntitledRecipient = useMemo<ManualWhatsAppCustomerRecipientView>(() => {
    const found = allRecipients.find((r) => !r.isBlocked && isEntitledToSelectedDrama(r));
    if (found) return found;
    return {
      memberId: 'sample_entitled',
      customerName: 'Active VIP Member',
      customerEmail: 'member@feviqo.com',
      rawPhone: '+923001234567',
      formattedPhone: '+923001234567',
      waDigits: '923001234567',
      phoneValid: true,
      membershipStatus: 'active',
      planName: 'VIP Plan',
      entitledDramaIds: activeDrama ? [activeDrama.id] : [],
      entitledDramaTitles: activeDrama ? [activeDrama.title] : [],
      hasWhatsappConsent: true,
      hasEpisodeConsent: true,
      optedOut: false,
      isBlocked: false,
    };
  }, [activeDrama, allRecipients, isEntitledToSelectedDrama]);

  const samplePromoRecipient = useMemo<ManualWhatsAppCustomerRecipientView>(() => {
    const found = allRecipients.find(
      (r) => !r.isBlocked && !isEntitledToSelectedDrama(r) && !r.optedOut
    );
    if (found) return found;
    return {
      memberId: 'sample_promo',
      customerName: 'Registered Customer',
      customerEmail: 'customer@feviqo.com',
      rawPhone: '+923001234567',
      formattedPhone: '+923001234567',
      waDigits: '923001234567',
      phoneValid: true,
      membershipStatus: 'never_purchased',
      planName: 'No Plan',
      entitledDramaIds: [],
      entitledDramaTitles: [],
      hasWhatsappConsent: true,
      hasEpisodeConsent: true,
      optedOut: false,
      isBlocked: false,
    };
  }, [allRecipients, isEntitledToSelectedDrama]);

  const previewRecipient = useMemo(() => {
    if (previewMemberId) {
      const found = allRecipients.find((r) => r.memberId === previewMemberId);
      if (found) return found;
    }
    if (selectedMemberIds.length > 0) {
      const found = allRecipients.find((r) => r.memberId === selectedMemberIds[0]);
      if (found) return found;
    }
    return selectableVisibleRecipients[0] || filteredRecipients[0] || null;
  }, [allRecipients, filteredRecipients, previewMemberId, selectableVisibleRecipients, selectedMemberIds]);

  const entitledPreviewMsg = useMemo(
    () => buildPersonalizedMessageForRecipient(sampleEntitledRecipient),
    [buildPersonalizedMessageForRecipient, sampleEntitledRecipient]
  );

  const promoPreviewMsg = useMemo(
    () => buildPersonalizedMessageForRecipient(samplePromoRecipient),
    [buildPersonalizedMessageForRecipient, samplePromoRecipient]
  );

  const singlePreviewMsg = useMemo(() => {
    if (!previewRecipient) return null;
    return buildPersonalizedMessageForRecipient(previewRecipient);
  }, [buildPersonalizedMessageForRecipient, previewRecipient]);

  const selectedBreakdown = useMemo(() => {
    const set = new Set(selectedMemberIds);
    const chosen = allRecipients.filter((r) => set.has(r.memberId));
    const entitledCount = chosen.filter((r) => isEntitledToSelectedDrama(r)).length;
    const promoCount = chosen.length - entitledCount;
    return { total: chosen.length, entitledCount, promoCount };
  }, [allRecipients, isEntitledToSelectedDrama, selectedMemberIds]);

  const toggleSelectMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSelectAllEligible = () => {
    const eligibleIds = selectableVisibleRecipients.map((r) => r.memberId);
    const allSelected =
      eligibleIds.length > 0 && eligibleIds.every((id) => selectedMemberIds.includes(id));
    if (allSelected) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(eligibleIds);
    }
  };

  const handleSaveMemberPhone = async (memberId: string) => {
    const trimmed = memberPhoneDraft.trim();
    if (!trimmed) {
      setBanner({
        type: 'error',
        text: 'Enter a valid WhatsApp phone number (e.g. 03001234567 or +923001234567).',
      });
      return;
    }
    setSavingMemberPhone(true);
    setBanner(null);
    try {
      const res = await updateMemberPhoneAdmin(memberId, trimmed);
      if ('error' in res) {
        setBanner({ type: 'error', text: res.error || 'Could not update customer phone number.' });
        return;
      }
      setEditingMemberPhoneId(null);
      setMemberPhoneDraft('');
      setBanner({
        type: 'success',
        text: `Updated WhatsApp phone for ${res.member.fullName || res.member.email} to ${res.member.phone}.`,
      });
      await loadCenterData();
    } catch {
      setBanner({ type: 'error', text: 'Failed to save customer phone number.' });
    } finally {
      setSavingMemberPhone(false);
    }
  };

  const handlePrepareSelectedInQueue = async () => {
    if (selectedMemberIds.length === 0) {
      setBanner({ type: 'error', text: 'Select at least one eligible customer first.' });
      return;
    }
    const eventTypeToSend = resolveEventTypeForRequest();
    if (eventTypeToSend === 'payment_rejected' && !rejectionReason.trim() && !customMessage.trim()) {
      setBanner({
        type: 'error',
        text: 'Enter the actual rejection reason before preparing payment rejection messages.',
      });
      return;
    }
    if (eventTypeToSend === 'custom_message' && !customMessage.trim()) {
      setBanner({
        type: 'error',
        text: 'Write your custom message text before preparing drafts.',
      });
      return;
    }

    setPreparingBulk(true);
    setBanner(null);
    try {
      const res = await prepareManualWhatsAppMessages({
        memberIds: selectedMemberIds,
        eventType: eventTypeToSend,
        campaignPurpose,
        customMessage: customMessage.trim() || undefined,
        dramaId: isEpisodeCampaign ? activeDrama?.id : undefined,
        episodeNumber: isEpisodeCampaign ? activeEpisode?.number : undefined,
        episodeSlug: isEpisodeCampaign ? activeEpisode?.slug : undefined,
        episodeLink: isEpisodeCampaign ? episodeWatchLink : undefined,
        accessType: isEpisodeCampaign ? effectiveEpisodeAccessType : undefined,
        rejectionReason: eventTypeToSend === 'payment_rejected' ? rejectionReason.trim() : undefined,
      });
      if (!res.success) {
        setBanner({
          type: 'error',
          text: res.error || 'Failed to prepare manual WhatsApp messages.',
        });
        return;
      }
      const notes: string[] = [];
      if (res.failedPhoneCount) notes.push(`${res.failedPhoneCount} need phone correction`);
      if (res.skippedOptedOutCount) notes.push(`${res.skippedOptedOutCount} opted-out skipped`);
      if (res.skippedBlockedCount) notes.push(`${res.skippedBlockedCount} blocked skipped`);
      if (res.skippedNotEntitledCount) {
        notes.push(`${res.skippedNotEntitledCount} not entitled skipped`);
      }
      setBanner({
        type: 'success',
        text: `Prepared ${res.createdCount || 0} personalized WhatsApp draft(s) in the Manual Queue.${
          notes.length ? ` (${notes.join(', ')})` : ''
        }`,
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

  const handleDirectDirectoryOpen = async (recipient: ManualWhatsAppCustomerRecipientView) => {
    try {
      const eventTypeToSend = resolveEventTypeForRequest();
      const prepared = await prepareManualWhatsAppMessages({
        memberIds: [recipient.memberId],
        eventType: eventTypeToSend,
        campaignPurpose,
        customMessage: customMessage.trim() || undefined,
        dramaId: isEpisodeCampaign ? activeDrama?.id : undefined,
        episodeNumber: isEpisodeCampaign ? activeEpisode?.number : undefined,
        episodeSlug: isEpisodeCampaign ? activeEpisode?.slug : undefined,
        episodeLink: isEpisodeCampaign ? episodeWatchLink : undefined,
        accessType: isEpisodeCampaign ? effectiveEpisodeAccessType : undefined,
        rejectionReason: eventTypeToSend === 'payment_rejected' ? rejectionReason.trim() : undefined,
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
      // Non-blocking: native wa.me link already opened WhatsApp
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
        setBanner({
          type: 'error',
          text: res.error || 'Could not mark message as manually sent.',
        });
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
      const res = await cancelManualWhatsAppNotification(
        notificationId,
        'Cancelled by administrator'
      );
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
    setEditMessage(n.messageText || (n as any).message || '');
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
          : `Saved edits, but phone is still invalid: ${
              res.notification?.phoneError || 'Check country code.'
            }`,
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
        text: `Synced manual lifecycle reminders: ${res.summary?.queued || 0} queued, ${
          res.summary?.skipped || 0
        } skipped.`,
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

  const activePurposeMeta =
    CAMPAIGN_PURPOSE_OPTIONS.find((opt) => opt.value === campaignPurpose) ||
    CAMPAIGN_PURPOSE_OPTIONS[0];

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
                  Reconciles verified customer WhatsApp numbers across profiles, memberships, and checkout records. Supports both <strong>Premium Access Notifications</strong> (entitled members only) and <strong>Premium Episode Promotions</strong> (sends membership link to non-entitled registered users without exposing protected stream URLs).
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
                Registered Users
              </div>
              <div className="mt-1 text-2xl font-bold text-[#0F172A]">
                {directoryCounts.allRegistered}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {directoryCounts.blocked} blocked excluded
              </div>
            </div>
            <div className="bg-white rounded-xl border border-indigo-200 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                Eligible for Promo
              </div>
              <div className="mt-1 text-2xl font-bold text-indigo-900">
                {directoryCounts.eligiblePromo}
              </div>
              <div className="text-[11px] text-indigo-700/80 mt-0.5">Non-entitled valid phones</div>
            </div>
            <div className="bg-white rounded-xl border border-emerald-200 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Entitled to Drama
              </div>
              <div className="mt-1 text-2xl font-bold text-emerald-900">
                {directoryCounts.entitledDrama}
              </div>
              <div className="text-[11px] text-emerald-700/80 mt-0.5 truncate">
                {activeDrama?.title || 'Selected drama'}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                Pending / Opened
              </div>
              <div className="mt-1 text-2xl font-bold text-amber-900">
                {stats.pending + stats.opened}
              </div>
              <div className="text-[11px] text-amber-700/80 mt-0.5">
                {stats.pending} pending · {stats.opened} opened
              </div>
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
                Missing / Invalid #
              </div>
              <div className="mt-1 text-2xl font-bold text-red-800">
                {directoryCounts.missingPhone}
              </div>
              <div className="text-[11px] text-red-600/80 mt-0.5">Inline fix available</div>
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
              <span>Customer Recipient Directory ({allRecipients.length})</span>
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
                Manual Queue &amp; Tracking ({stats.pending + stats.opened} active / {stats.total}{' '}
                total)
              </span>
            </button>
          </div>

          {viewTab === 'directory' ? (
            <div className="space-y-5">
              {/* Message Composer + Live Previews */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#16A34A]" />
                      <span>1. Choose Campaign Purpose &amp; Content</span>
                    </h2>
                    <span className="text-[11px] font-medium text-slate-500">
                      Generates real <code className="bg-slate-100 px-1.5 py-0.5 rounded">wa.me</code>{' '}
                      links
                    </span>
                  </div>

                  {/* Campaign Purpose Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Campaign Purpose
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {CAMPAIGN_PURPOSE_OPTIONS.map((opt) => {
                        const active = campaignPurpose === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setCampaignPurpose(opt.value)}
                            className={`text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                              active
                                ? opt.value === 'premium_promotion'
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div>{opt.shortLabel}</div>
                          </button>
                        );
                      })}
                    </div>
                    <div
                      className={`text-[11px] rounded-xl px-3.5 py-2.5 border flex items-start gap-2 ${
                        campaignPurpose === 'premium_promotion'
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                          : campaignPurpose === 'premium_access'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {campaignPurpose === 'premium_promotion' ? (
                        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                      ) : campaignPurpose === 'premium_access' ? (
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                      ) : (
                        <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      )}
                      <div>
                        <div className="font-semibold">{activePurposeMeta.label}</div>
                        <div className="opacity-90 mt-0.5">{activePurposeMeta.description}</div>
                      </div>
                    </div>
                  </div>

                  {/* Episode selector for episode-based campaigns */}
                  {isEpisodeCampaign && (
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
                    </div>
                  )}

                  {/* Lifecycle template picker when in Custom / Lifecycle mode */}
                  {campaignPurpose === 'custom' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Lifecycle Template or Custom Message
                        </label>
                        <select
                          value={lifecycleEventType}
                          onChange={(e) => setLifecycleEventType(e.target.value as OneClickEventType)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-[#0F172A]"
                        >
                          {LIFECYCLE_EVENT_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              [{opt.category}] {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {lifecycleEventType === 'payment_rejected' && (
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
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {campaignPurpose === 'custom' && lifecycleEventType === 'custom_message'
                        ? 'Custom WhatsApp Message Text'
                        : 'Optional Custom Message Override (leave blank to use FEVIQO template)'}
                    </label>
                    <textarea
                      rows={3}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Placeholders: {{name}}, {{plan}}, {{drama}}, {{episode}}, {{link}} (for non-entitled users, {{link}} safely becomes https://feviqo.com/membership)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>
                </div>

                {/* Live Personalized Message Preview(s) */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
                  {campaignPurpose === 'premium_promotion' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-bold text-[#0F172A]">
                          Separate Previews (Entitled vs Promo)
                        </h2>
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                          Mode B Protection Active
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-indigo-900">
                            <span>Non-Entitled Customers ({directoryCounts.eligiblePromo})</span>
                            <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700">
                              Membership Link Only
                            </span>
                          </div>
                          {promoPreviewMsg.ok ? (
                            <div className="text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed font-mono max-h-36 overflow-y-auto">
                              {promoPreviewMsg.message}
                            </div>
                          ) : (
                            <div className="text-[11px] text-red-700">
                              {'error' in promoPreviewMsg ? promoPreviewMsg.error : 'Invalid promo preview.'}
                            </div>
                          )}
                        </div>

                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-emerald-900">
                            <span>Entitled Members ({directoryCounts.entitledDrama})</span>
                            <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-700">
                              Authorized Watch Link
                            </span>
                          </div>
                          {entitledPreviewMsg.ok ? (
                            <div className="text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed font-mono max-h-36 overflow-y-auto">
                              {entitledPreviewMsg.message}
                            </div>
                          ) : (
                            <div className="text-[11px] text-red-700">
                              {'error' in entitledPreviewMsg ? entitledPreviewMsg.error : 'Invalid preview.'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-bold text-[#0F172A]">
                          Live Personalized Message Preview
                        </h2>
                        {previewRecipient && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                            {previewRecipient.customerName}
                          </span>
                        )}
                      </div>

                      {!previewRecipient ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                          No matching customers found for the current filters.
                        </div>
                      ) : singlePreviewMsg?.ok ? (
                        <div className="rounded-xl bg-[#ECFDF5] border border-emerald-200 p-4 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-mono max-h-60 overflow-y-auto">
                          {singlePreviewMsg.message}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            {singlePreviewMsg && 'error' in singlePreviewMsg
                              ? singlePreviewMsg.error
                              : 'Fill required fields to preview.'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recipient Counts Summary + Prepare Button */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                      <span>
                        Selected:{' '}
                        <strong className="text-[#0F172A]">{selectedBreakdown.total}</strong>
                        {campaignPurpose === 'premium_promotion' && selectedBreakdown.total > 0 && (
                          <span className="text-slate-500">
                            {' '}
                            ({selectedBreakdown.entitledCount} watch · {selectedBreakdown.promoCount}{' '}
                            promo)
                          </span>
                        )}
                      </span>
                      <span>
                        Eligible in view:{' '}
                        <strong className="text-emerald-700">
                          {selectableVisibleRecipients.length}
                        </strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={preparingBulk || selectedMemberIds.length === 0}
                      onClick={handlePrepareSelectedInQueue}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#16A34A] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {preparingBulk
                          ? 'Preparing...'
                          : `Prepare ${selectedMemberIds.length} Message(s) in Manual Queue`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 6 Quick Audience Filter Tabs + Search & Dropdown Filters */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      {
                        key: 'all_registered',
                        label: 'All Registered Customers',
                        count: directoryCounts.allRegistered,
                      },
                      {
                        key: 'eligible_promo',
                        label: 'Eligible for Premium Promotion',
                        count: directoryCounts.eligiblePromo,
                      },
                      {
                        key: 'entitled_drama',
                        label: 'Entitled to Selected Drama',
                        count: directoryCounts.entitledDrama,
                      },
                      {
                        key: 'missing_consent',
                        label: 'Missing WhatsApp Consent',
                        count: directoryCounts.missingConsent,
                      },
                      {
                        key: 'missing_phone',
                        label: 'Missing / Invalid Phone',
                        count: directoryCounts.missingPhone,
                      },
                      {
                        key: 'blocked',
                        label: 'Blocked Customers',
                        count: directoryCounts.blocked,
                      },
                    ] as Array<{ key: DirectoryQuickFilter; label: string; count: number }>
                  ).map((tab) => {
                    const active = quickFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setQuickFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border inline-flex items-center gap-1.5 cursor-pointer transition ${
                          active
                            ? tab.key === 'blocked'
                              ? 'bg-red-700 text-white border-red-700'
                              : tab.key === 'eligible_promo'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-[#0F172A] text-white border-[#0F172A]'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                            active ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2 border-t border-slate-100">
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
                      <option value="never_purchased">Registered (Free)</option>
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
                      disabled={selectableVisibleRecipients.length === 0}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold cursor-pointer transition disabled:opacity-50"
                    >
                      {selectableVisibleRecipients.length > 0 &&
                      selectableVisibleRecipients.every((r) =>
                        selectedMemberIds.includes(r.memberId)
                      )
                        ? 'Clear Selection'
                        : `Select Eligible (${selectableVisibleRecipients.length})`}
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
                        <th className="py-3 px-4">Membership &amp; Eligibility</th>
                        <th className="py-3 px-4">Manual Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecipients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-500">
                            No customers match the current search or filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredRecipients.map((r) => {
                          const statusInfo =
                            MEMBERSHIP_STATUS_LABELS[r.membershipStatus] ||
                            MEMBERSHIP_STATUS_LABELS.never_purchased;
                          const eligibility = evaluateRecipientEligibility(r);
                          const directRec = directNotificationByMember[r.memberId];
                          const currentManualStatus = directRec?.status || r.latestManualStatus;
                          const currentNotificationId =
                            directRec?.id || r.latestManualNotificationId;
                          const manualMeta = manualStatusMeta(currentManualStatus);

                          const msgResult = buildPersonalizedMessageForRecipient(r);
                          const waBuild =
                            eligibility.selectable && msgResult.ok
                              ? buildWhatsAppWaMeUrl(r.formattedPhone || r.rawPhone, msgResult.message)
                              : null;

                          const isSelected = selectedMemberIds.includes(r.memberId);
                          const isEditingThisPhone = editingMemberPhoneId === r.memberId;

                          return (
                            <tr
                              key={r.memberId}
                              onClick={() => setPreviewMemberId(r.memberId)}
                              className={`hover:bg-slate-50/80 transition ${
                                r.isBlocked
                                  ? 'bg-red-50/30'
                                  : previewRecipient?.memberId === r.memberId
                                  ? 'bg-emerald-50/30'
                                  : ''
                              }`}
                            >
                              <td
                                className="py-3.5 px-4 align-top"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!eligibility.selectable}
                                  title={eligibility.reason || 'Select recipient'}
                                  onChange={() => toggleSelectMember(r.memberId)}
                                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-40"
                                />
                              </td>
                              <td className="py-3.5 px-4 align-top">
                                <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                                  <span>{r.customerName}</span>
                                  {r.isBlocked && (
                                    <Ban className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">{r.customerEmail}</div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {r.isBlocked ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 border border-red-300">
                                      Permanently Blocked
                                    </span>
                                  ) : r.optedOut ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                                      Opted Out (STOP)
                                    </span>
                                  ) : r.hasWhatsappConsent ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      WhatsApp Enabled
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                      Legacy (Manual Eligible)
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td
                                className="py-3.5 px-4 align-top"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {isEditingThisPhone ? (
                                  <div className="space-y-1.5 min-w-[200px]">
                                    <input
                                      type="text"
                                      value={memberPhoneDraft}
                                      onChange={(e) => setMemberPhoneDraft(e.target.value)}
                                      placeholder="03001234567 or +923001234567"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                                    />
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        disabled={savingMemberPhone}
                                        onClick={() => handleSaveMemberPhone(r.memberId)}
                                        className="px-2.5 py-1 rounded-md bg-[#0F172A] hover:bg-[#16A34A] text-white text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                                      >
                                        {savingMemberPhone ? 'Saving...' : 'Save'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingMemberPhoneId(null);
                                          setMemberPhoneDraft('');
                                        }}
                                        className="px-2 py-1 rounded-md border border-slate-200 text-slate-600 text-[10px] font-semibold cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : r.phoneValid ? (
                                  <div>
                                    <div className="font-mono font-semibold text-[#0F172A] flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>{r.formattedPhone}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                      <span>
                                        Source:{' '}
                                        {PHONE_SOURCE_LABELS[r.phoneSource || 'account_profile'] ||
                                          'Account profile'}
                                      </span>
                                      {!r.isBlocked && !r.memberId.startsWith('blocked_') && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingMemberPhoneId(r.memberId);
                                            setMemberPhoneDraft(r.formattedPhone || r.rawPhone);
                                          }}
                                          className="text-slate-500 hover:text-[#0F172A] underline cursor-pointer"
                                        >
                                          Edit
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="font-mono text-red-700 font-semibold">
                                      {r.rawPhone || 'Phone number missing'}
                                    </div>
                                    {r.phoneError && r.phoneError !== 'Phone number missing' && (
                                      <div className="text-[10px] text-red-600 max-w-[200px]">
                                        {r.phoneError}
                                      </div>
                                    )}
                                    {!r.isBlocked && !r.memberId.startsWith('blocked_') && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingMemberPhoneId(r.memberId);
                                          setMemberPhoneDraft(r.rawPhone || '');
                                        }}
                                        className="px-2 py-1 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                        <span>Add / Fix Phone</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 align-top space-y-1">
                                <div className="flex flex-wrap items-center gap-1">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusInfo.badgeClass}`}
                                  >
                                    {statusInfo.label}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${eligibility.badgeClass}`}
                                  >
                                    {eligibility.badgeLabel}
                                  </span>
                                </div>
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
                                {eligibility.reason && (
                                  <div className="text-[10px] text-slate-500 max-w-[240px]">
                                    {eligibility.reason}
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
                                      className={`px-3 py-1.5 rounded-lg text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition shadow-xs ${
                                        eligibility.role === 'promo_target'
                                          ? 'bg-indigo-600 hover:bg-indigo-700'
                                          : 'bg-[#16A34A] hover:bg-[#15803D]'
                                      }`}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>
                                        {eligibility.role === 'promo_target'
                                          ? 'SEND PROMO ON WHATSAPP'
                                          : 'SEND ON WHATSAPP'}
                                      </span>
                                    </a>
                                  ) : (
                                    <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-semibold">
                                      {r.isBlocked
                                        ? 'Blocked'
                                        : r.optedOut
                                        ? 'Opted Out'
                                        : !r.phoneValid
                                        ? 'Fix Phone First'
                                        : !eligibility.selectable
                                        ? 'Not Entitled'
                                        : 'Enter Message'}
                                    </span>
                                  )}

                                  {currentNotificationId &&
                                    !r.isBlocked &&
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
                    <option value="episodes">Episodes &amp; Promos</option>
                    <option value="registration">Registration &amp; Membership Promos</option>
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
                    Use the Customer Recipient Directory tab to select customers and prepare
                    personalized WhatsApp drafts for episodes, membership promotions, or reminders.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((item) => {
                    const meta = manualStatusMeta(item.status);
                    const isEditing = editingId === item.id;
                    const busy = busyNotificationId === item.id;
                    const displayMessage = item.messageText || (item as any).message || '';
                    const displayPhone = item.phoneE164 || (item as any).recipientPhone || item.rawPhone;

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
                                  <strong className="font-mono text-[#0F172A]">{displayPhone}</strong>
                                ) : (
                                  <strong className="text-red-700">
                                    {item.rawPhone || 'Phone number missing'} (
                                    {item.phoneError || 'Invalid'})
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
                            {item.phoneValid && item.waUrl && item.status !== 'cancelled' && (
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
                              onClick={() => handleCopyText(item.id, displayMessage)}
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
                            {displayMessage}
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

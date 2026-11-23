import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDramaById, MEMBERSHIP_DRAMAS } from '../src/data/membershipCatalog';
import {
  WHATSAPP_TEMPLATES_CATALOG,
  WhatsAppTemplateApprovalStatus,
  WhatsAppTemplateCategory,
  getTemplateDraftByName,
  renderTemplatePreview,
  normalizePhoneE164,
  getWhatsAppEnvConfigStatus,
  sendWhatsAppTemplateMessage,
  sendWhatsAppTextMessage,
  markWhatsAppMessageRead,
  fetchMetaWabaTemplates,
  validateWhatsAppTemplateParameters,
  classifyWhatsAppSendError,
  SyncedMetaTemplateInfo,
  ClassifiedWhatsAppError,
} from './whatsappClient';
import {
  mirrorDocToFirestoreServer,
  pullAutomationSnapshotFromFirestoreServer,
  listFirebaseAuthUsersPhoneMap,
} from './firestoreAdmin';
import {
  resolveCustomerWhatsAppContact,
  buildCustomerContactAuditReport,
  normalizeCustomerPhoneE164Strict,
  FirebaseAuthPhoneLookup,
  CustomerContactAuditReport,
} from './customerContactResolver';
import {
  getAutomationMembershipSnapshot,
  getEntitledActiveMembersForDrama,
  findMemberContextByPhoneDigits,
  appendAdminAudit,
  listBlockedUsers,
  normalizeBlockedPhone,
  createCustomerNotificationRecord,
} from './membershipStore';
import {
  generateFeviqoAiReply,
  isAiAssistantConfigured,
  AssistantIntent,
  ScopedCustomerContext,
} from './aiSupportAgent';
import {
  enqueueOneClickWhatsAppNotification,
  cancelOneClickNotificationsForBlockedUser,
  getOneClickNotificationsDashboard,
} from './whatsappQueueStore';
import {
  OneClickEventType,
  formatWhatsAppRecipient,
} from '../src/utils/whatsappOneClick';

const DATA_DIR = path.join(process.cwd(), 'data');
const WA_SETTINGS_FILE = path.join(DATA_DIR, 'whatsapp_settings.json');
const WA_PREFS_FILE = path.join(DATA_DIR, 'whatsapp_preferences.json');
const WA_MESSAGES_FILE = path.join(DATA_DIR, 'whatsapp_messages.json');
const AUTOMATION_JOBS_FILE = path.join(DATA_DIR, 'automation_jobs.json');
const EPISODE_BROADCASTS_FILE = path.join(DATA_DIR, 'episode_broadcasts.json');
const VIDEO_LEADS_FILE = path.join(DATA_DIR, 'video_editing_leads.json');
const WA_CONVERSATIONS_FILE = path.join(DATA_DIR, 'whatsapp_conversations.json');
const WEBHOOK_DEDUPE_FILE = path.join(DATA_DIR, 'whatsapp_webhook_dedupe.json');
const WA_WEBHOOK_EVENTS_FILE = path.join(DATA_DIR, 'whatsapp_webhook_events.json');

export interface WebhookEventRecord {
  id: string;
  eventType: 'verification_get' | 'webhook_post';
  status: 'verified' | 'rejected' | 'accepted' | 'processed' | 'duplicate' | 'error';
  httpStatus: number;
  reason?: string;
  sourceIp?: string;
  signatureValid?: boolean;
  processedMessages?: number;
  processedStatuses?: number;
  duplicatesIgnored?: number;
  durationMs?: number;
  createdAt: string;
  updatedAt: string;
}

type HighIntentLeadNotifier = (
  lead: VideoEditingLead,
  context: { source: string; reason?: string }
) => Promise<void> | void;

let highIntentLeadNotifier: HighIntentLeadNotifier | null = null;
const notifiedHighIntentLeadIds = new Set<string>();

export function registerHighIntentLeadNotifier(fn: HighIntentLeadNotifier): void {
  highIntentLeadNotifier = fn;
}

function triggerHighIntentLeadNotification(
  lead: VideoEditingLead,
  context: { source: string; reason?: string }
): void {
  if (!highIntentLeadNotifier) return;
  if (notifiedHighIntentLeadIds.has(lead.id)) return;
  notifiedHighIntentLeadIds.add(lead.id);
  Promise.resolve(highIntentLeadNotifier(lead, context)).catch((err) => {
    console.warn('[AutomationStore] High-intent lead admin notification failed:', err?.message || err);
  });
}

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(filePath: string, data: unknown): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[AutomationStore] Failed writing ${path.basename(filePath)}:`, err);
  }
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

function makeSafeDocId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120) || makeId('doc');
}

function formatReadableDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// --- TYPES ---
export type AutomationEventType =
  | 'user.registered'
  | 'membership.plan_selected'
  | 'membership.payment_pending'
  | 'membership.proof_submitted'
  | 'membership.approved'
  | 'membership.rejected'
  | 'membership.expiring'
  | 'membership.expired'
  | 'membership.cancelled'
  | 'membership.revoked'
  | 'episode.published'
  | 'account.security_alert'
  | 'lead.created'
  | 'lead.qualified'
  | 'lead.quote_sent'
  | 'lead.booked';

export type WhatsAppSendingMode =
  | 'automatic'
  | 'manual'
  | 'automatic_with_fallback'
  | 'disabled';

export type AutomationCategoryKey =
  | 'registration'
  | 'unpaid_followups'
  | 'payment'
  | 'activation'
  | 'rejection'
  | 'expiry'
  | 'episodes'
  | 'security'
  | 'creative_enquiries';

export type WhatsAppMessageStatus =
  | 'queued'
  | 'processing'
  | 'api_accepted'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'opened'
  | 'confirmed_sent'
  | 'failed'
  | 'not_configured'
  | 'skipped_no_consent'
  | 'skipped_not_entitled'
  | 'skipped_opted_out'
  | 'skipped_rule_disabled'
  | 'skipped_template_unapproved'
  | 'cancelled';

export interface AutomationRulesConfig {
  masterEnabled: boolean;
  welcomeOnRegister: boolean;
  signupNoPackageReminder: boolean;
  signupNoPackageDelayMinutes: number;
  signupNoPackageDelay24hHours: number;
  signupNoPackageDelay72hHours: number;
  checkoutAbandonedReminder: boolean;
  checkoutAbandonedDelayMinutes: number;
  checkoutAbandonedDelay24hHours: number;
  checkoutAbandonedDelay72hHours: number;
  paymentProofReceived: boolean;
  paymentApproved: boolean;
  paymentRejected: boolean;
  expiryReminder7Days: boolean;
  expiryReminder3Days: boolean;
  expiryReminder1Day: boolean;
  expiryOnExpired: boolean;
  episodePublishedAlerts: boolean;
  accountSecurityAlerts: boolean;
  leadImmediateAcknowledgement: boolean;
  leadFollowUpNoResponse: boolean;
  leadFollowUpNoResponseHours: number;
  leadFollowUpPricing: boolean;
  leadFollowUpPricingHours: number;
  leadFollowUpQuoteNotAccepted: boolean;
  leadFollowUpQuoteHours: number;
  leadFollowUpBookingIncomplete: boolean;
  leadFollowUpBookingHours: number;
  leadFollowUpReturningClient: boolean;
  maxLeadFollowUpsPerLead: number;
}

export interface AiAssistantSettings {
  enabled: boolean;
  autoReplyOnInboundWhatsApp: boolean;
  bookingUrl: string;
  escalationKeywords: string[];
}

export interface WhatsAppAutomationSettings {
  id: 'main';
  automationRunning: boolean;
  automationStartedAt?: string;
  automationStoppedAt?: string;
  automationToggledBy?: string;
  sendingMode: WhatsAppSendingMode;
  categorySendingModes: Record<AutomationCategoryKey, WhatsAppSendingMode>;
  rules: AutomationRulesConfig;
  ai: AiAssistantSettings;
  templateStatuses: Record<string, WhatsAppTemplateApprovalStatus>;
  metaTemplateDetails?: Record<string, SyncedMetaTemplateInfo>;
  lastMetaTemplateSyncAt?: string;
  estimatedUtilityCostUsd: number;
  estimatedMarketingCostUsd: number;
  lastWebhookReceivedAt?: string;
  lastWebhookVerifiedAt?: string;
  lastWorkerRunAt?: string;
  lastWorkerHeartbeatAt?: string;
  lastSuccessfulRunAt?: string;
  lastWorkerSummary?: string;
  updatedAt: string;
}

export interface PreferenceChangeEntry {
  changedAt: string;
  source: string;
  summary: string;
}

export interface CustomerNotificationPreference {
  id: string;
  memberId?: string;
  ownerUid?: string;
  email?: string;
  fullName?: string;
  phoneE164: string;
  phoneVerified?: boolean;
  whatsappVerified?: boolean;
  // Separate consent toggles — NEVER pre-checked!
  membershipUpdates: boolean;
  renewalReminders: boolean;
  newEpisodeAlerts: boolean;
  promotionalMessages: boolean;
  leadEnquiryConsent: boolean;
  optedOut: boolean;
  optedOutAt?: string;
  optOutSource?: string;
  consentTimestamp?: string;
  consentSource?: string;
  history: PreferenceChangeEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessageLog {
  id: string;
  direction: 'outbound' | 'inbound';
  isTest?: boolean;
  sendingMethod?: 'cloud_api' | 'manual_whatsapp' | 'in_app' | 'email';
  wamid?: string;
  broadcastId?: string;
  idempotencyKey: string;
  eventType: string;
  recipientPhone: string;
  recipientName?: string;
  memberId?: string;
  leadId?: string;
  templateName?: string;
  templateLanguage?: string;
  templateCategory?: WhatsAppTemplateCategory;
  bodyParameters?: string[];
  bodyPreview: string;
  status: WhatsAppMessageStatus;
  httpStatus?: number;
  apiResponseSummary?: string;
  manualFallbackNotificationId?: string;
  attempts: number;
  maxAttempts: number;
  retryable?: boolean;
  errorCategory?: ClassifiedWhatsAppError['category'];
  errorExplanation?: {
    humanTitle: string;
    whatWentWrong: string;
    component: string;
    needsAdminAction: boolean;
    systemAction: string;
  };
  nextRetryAt?: string;
  errorMessage?: string;
  errorCode?: string | number;
  estimatedCostUsd: number;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AutomationJobType =
  | 'signup_no_package_30m'
  | 'signup_no_package_24h'
  | 'signup_no_package_72h'
  | 'checkout_abandoned_reminder'
  | 'checkout_abandoned_24h'
  | 'checkout_abandoned_72h'
  | 'membership_expiry_7d'
  | 'membership_expiry_3d'
  | 'membership_expiry_1d'
  | 'membership_expired'
  | 'episode_broadcast_delivery'
  | 'historical_campaign_delivery'
  | 'lead_followup_no_reply'
  | 'lead_followup_pricing'
  | 'lead_followup_quote'
  | 'lead_followup_booking'
  | 'lead_followup_returning';

export interface AutomationScheduledJob {
  id: string;
  jobType: AutomationJobType;
  idempotencyKey: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  runAt: string;
  memberId?: string;
  orderId?: string;
  membershipId?: string;
  broadcastId?: string;
  leadId?: string;
  phoneE164?: string;
  payload: Record<string, any>;
  attempts: number;
  maxAttempts?: number;
  lockedAt?: string;
  lockOwner?: string;
  lockExpiresAt?: string;
  lastError?: string;
  cancelReason?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeBroadcastRecipient {
  memberId: string;
  memberName: string;
  phoneE164: string;
  planId: string;
  sendingMethod?: 'cloud_api' | 'manual_whatsapp' | 'in_app' | 'skipped';
  status: WhatsAppMessageStatus;
  wamid?: string;
  httpStatus?: number;
  messageLogId?: string;
  manualNotificationId?: string;
  inAppNotified?: boolean;
  error?: string;
}

export type EpisodeBroadcastStatus =
  | 'processing'
  | 'completed'
  | 'partially_completed'
  | 'queued_waiting_start'
  | 'no_eligible_recipients'
  | 'failed'
  | 'paused';

export interface EpisodeBroadcastRecord {
  id: string;
  broadcastKey: string;
  dramaId: string;
  dramaTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeSlug: string;
  episodeTitle: string;
  episodeUrl: string;
  accessType: 'free' | 'premium';
  sendingMode: WhatsAppSendingMode;
  broadcastStatus: EpisodeBroadcastStatus;
  isResend: boolean;
  triggeredByAdminEmail: string;
  totalMatchingCount: number;
  entitledCount: number;
  eligibleWhatsappCount: number;
  apiAcceptedCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  manualQueuedCount: number;
  inAppNotifiedCount: number;
  failedCount: number;
  skippedCount: number;
  skippedBreakdown?: {
    noPermission: number;
    optedOut: number;
    invalidPhone: number;
    templateUnapproved: number;
    ruleDisabled: number;
    unentitled: number;
  };
  diagnosticSummary?: string;
  recipients: EpisodeBroadcastRecipient[];
  createdAt: string;
  updatedAt?: string;
}

export type VideoLeadStage =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'quote_sent'
  | 'booked'
  | 'won'
  | 'lost';

export interface VideoLeadNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface VideoEditingLead {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  whatsappE164?: string;
  whatsappConsent: boolean;
  consentTimestamp?: string;
  consentSource?: string;
  companyOrAgency: string;
  editingService: string;
  numberOfVideos: string;
  videoDuration: string;
  referenceLinks: string;
  projectDeadline: string;
  budgetRange: string;
  additionalInstructions: string;
  stage: VideoLeadStage;
  humanTakeover: boolean;
  followUpPaused: boolean;
  followUpsSentCount: number;
  lastLeadReplyAt?: string;
  aiSummary?: string;
  isHighIntent?: boolean;
  source: string;
  notes: VideoLeadNote[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  sender: 'customer' | 'ai' | 'admin' | 'automation';
  text: string;
  wamid?: string;
  intent?: AssistantIntent;
  createdAt: string;
}

export interface WhatsAppConversation {
  id: string;
  phoneE164: string;
  contactName: string;
  intent: AssistantIntent;
  language: 'en' | 'ur' | 'mixed';
  humanTakeover: boolean;
  escalatedReason?: string;
  memberId?: string;
  leadId?: string;
  lastInboundAt?: string;
  lastMessageAt: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_TEMPLATE_STATUSES: Record<string, WhatsAppTemplateApprovalStatus> =
  WHATSAPP_TEMPLATES_CATALOG.reduce((acc, tpl) => {
    acc[tpl.name] = 'draft';
    return acc;
  }, {} as Record<string, WhatsAppTemplateApprovalStatus>);

const DEFAULT_CATEGORY_SENDING_MODES: Record<AutomationCategoryKey, WhatsAppSendingMode> = {
  registration: 'automatic_with_fallback',
  unpaid_followups: 'automatic_with_fallback',
  payment: 'automatic_with_fallback',
  activation: 'automatic_with_fallback',
  rejection: 'automatic_with_fallback',
  expiry: 'automatic_with_fallback',
  episodes: 'automatic_with_fallback',
  security: 'automatic_with_fallback',
  creative_enquiries: 'automatic_with_fallback',
};

const DEFAULT_SETTINGS: WhatsAppAutomationSettings = {
  id: 'main',
  automationRunning: false,
  sendingMode: 'automatic_with_fallback',
  categorySendingModes: { ...DEFAULT_CATEGORY_SENDING_MODES },
  rules: {
    masterEnabled: true,
    welcomeOnRegister: true,
    signupNoPackageReminder: true,
    signupNoPackageDelayMinutes: 1440,
    signupNoPackageDelay24hHours: 24,
    signupNoPackageDelay72hHours: 72,
    checkoutAbandonedReminder: true,
    checkoutAbandonedDelayMinutes: 120,
    checkoutAbandonedDelay24hHours: 24,
    checkoutAbandonedDelay72hHours: 72,
    paymentProofReceived: true,
    paymentApproved: true,
    paymentRejected: true,
    expiryReminder7Days: true,
    expiryReminder3Days: true,
    expiryReminder1Day: true,
    expiryOnExpired: true,
    episodePublishedAlerts: true,
    accountSecurityAlerts: true,
    leadImmediateAcknowledgement: true,
    leadFollowUpNoResponse: true,
    leadFollowUpNoResponseHours: 24,
    leadFollowUpPricing: true,
    leadFollowUpPricingHours: 12,
    leadFollowUpQuoteNotAccepted: true,
    leadFollowUpQuoteHours: 48,
    leadFollowUpBookingIncomplete: true,
    leadFollowUpBookingHours: 6,
    leadFollowUpReturningClient: false,
    maxLeadFollowUpsPerLead: 3,
  },
  ai: {
    enabled: true,
    autoReplyOnInboundWhatsApp: true,
    bookingUrl: 'https://feviqo.com/booking',
    escalationKeywords: [
      'human',
      'agent',
      'manager',
      'refund',
      'complaint',
      'call me',
      'نمائندہ',
      'انسان',
    ],
  },
  templateStatuses: { ...DEFAULT_TEMPLATE_STATUSES },
  estimatedUtilityCostUsd: 0.015,
  estimatedMarketingCostUsd: 0.045,
  updatedAt: new Date().toISOString(),
};

function isValidSendingMode(v: unknown): v is WhatsAppSendingMode {
  return v === 'automatic' || v === 'manual' || v === 'automatic_with_fallback' || v === 'disabled';
}

// --- SETTINGS ---
export function getAutomationSettings(): WhatsAppAutomationSettings {
  const saved = readJson<Partial<WhatsAppAutomationSettings>>(WA_SETTINGS_FILE, {});
  const mergedCategoryModes: Record<AutomationCategoryKey, WhatsAppSendingMode> = {
    ...DEFAULT_CATEGORY_SENDING_MODES,
  };
  if (saved.categorySendingModes && typeof saved.categorySendingModes === 'object') {
    for (const key of Object.keys(DEFAULT_CATEGORY_SENDING_MODES) as AutomationCategoryKey[]) {
      const val = (saved.categorySendingModes as any)[key];
      if (isValidSendingMode(val)) {
        mergedCategoryModes[key] = val;
      }
    }
  }
  return {
    id: 'main',
    automationRunning:
      typeof saved.automationRunning === 'boolean'
        ? saved.automationRunning
        : DEFAULT_SETTINGS.automationRunning,
    automationStartedAt: saved.automationStartedAt,
    automationStoppedAt: saved.automationStoppedAt,
    automationToggledBy: saved.automationToggledBy,
    sendingMode: isValidSendingMode(saved.sendingMode)
      ? saved.sendingMode
      : DEFAULT_SETTINGS.sendingMode,
    categorySendingModes: mergedCategoryModes,
    rules: {
      ...DEFAULT_SETTINGS.rules,
      ...(saved.rules || {}),
    },
    ai: {
      ...DEFAULT_SETTINGS.ai,
      ...(saved.ai || {}),
      escalationKeywords: Array.isArray(saved.ai?.escalationKeywords)
        ? saved.ai!.escalationKeywords
        : DEFAULT_SETTINGS.ai.escalationKeywords,
    },
    templateStatuses: {
      ...DEFAULT_TEMPLATE_STATUSES,
      ...(saved.templateStatuses || {}),
    },
    estimatedUtilityCostUsd:
      typeof saved.estimatedUtilityCostUsd === 'number'
        ? saved.estimatedUtilityCostUsd
        : DEFAULT_SETTINGS.estimatedUtilityCostUsd,
    estimatedMarketingCostUsd:
      typeof saved.estimatedMarketingCostUsd === 'number'
        ? saved.estimatedMarketingCostUsd
        : DEFAULT_SETTINGS.estimatedMarketingCostUsd,
    lastWebhookReceivedAt: saved.lastWebhookReceivedAt,
    lastWebhookVerifiedAt: saved.lastWebhookVerifiedAt,
    lastWorkerRunAt: saved.lastWorkerRunAt,
    lastWorkerHeartbeatAt: saved.lastWorkerHeartbeatAt,
    lastSuccessfulRunAt: saved.lastSuccessfulRunAt,
    lastWorkerSummary: saved.lastWorkerSummary,
    updatedAt: saved.updatedAt || new Date().toISOString(),
  };
}

export function getEffectiveSendingMode(
  category?: AutomationCategoryKey,
  override?: WhatsAppSendingMode
): WhatsAppSendingMode {
  if (override && isValidSendingMode(override)) return override;
  const settings = getAutomationSettings();
  if (settings.sendingMode === 'disabled') return 'disabled';
  if (category && settings.categorySendingModes[category]) {
    return settings.categorySendingModes[category];
  }
  return settings.sendingMode;
}

export function saveAutomationSettings(
  updates: Partial<{
    automationRunning: boolean;
    automationStartedAt: string;
    automationStoppedAt: string;
    automationToggledBy: string;
    sendingMode: WhatsAppSendingMode;
    categorySendingModes: Partial<Record<AutomationCategoryKey, WhatsAppSendingMode>>;
    rules: Partial<AutomationRulesConfig>;
    ai: Partial<AiAssistantSettings>;
    templateStatuses: Record<string, WhatsAppTemplateApprovalStatus>;
    estimatedUtilityCostUsd: number;
    estimatedMarketingCostUsd: number;
    metaTemplateDetails: Record<string, SyncedMetaTemplateInfo>;
    lastMetaTemplateSyncAt: string;
    lastWebhookReceivedAt: string;
    lastWebhookVerifiedAt: string;
    lastWorkerRunAt: string;
    lastWorkerHeartbeatAt: string;
    lastSuccessfulRunAt: string;
    lastWorkerSummary: string;
  }>,
  admin?: { id: string; email: string }
): WhatsAppAutomationSettings {
  const current = getAutomationSettings();
  const nextCategoryModes = { ...current.categorySendingModes };
  if (updates.categorySendingModes) {
    for (const [k, v] of Object.entries(updates.categorySendingModes)) {
      if (k in DEFAULT_CATEGORY_SENDING_MODES && isValidSendingMode(v)) {
        nextCategoryModes[k as AutomationCategoryKey] = v;
      }
    }
  }
  const next: WhatsAppAutomationSettings = {
    ...current,
    automationRunning:
      typeof updates.automationRunning === 'boolean'
        ? updates.automationRunning
        : current.automationRunning,
    automationStartedAt: updates.automationStartedAt ?? current.automationStartedAt,
    automationStoppedAt: updates.automationStoppedAt ?? current.automationStoppedAt,
    automationToggledBy: updates.automationToggledBy ?? current.automationToggledBy,
    sendingMode: isValidSendingMode(updates.sendingMode) ? updates.sendingMode : current.sendingMode,
    categorySendingModes: nextCategoryModes,
    rules: updates.rules ? { ...current.rules, ...updates.rules } : current.rules,
    ai: updates.ai
      ? {
          ...current.ai,
          ...updates.ai,
          escalationKeywords: Array.isArray(updates.ai.escalationKeywords)
            ? updates.ai.escalationKeywords.map((s) => String(s).trim()).filter(Boolean).slice(0, 30)
            : current.ai.escalationKeywords,
        }
      : current.ai,
    templateStatuses: updates.templateStatuses
      ? { ...current.templateStatuses, ...updates.templateStatuses }
      : current.templateStatuses,
    metaTemplateDetails: updates.metaTemplateDetails
      ? { ...(current.metaTemplateDetails || {}), ...updates.metaTemplateDetails }
      : current.metaTemplateDetails,
    lastMetaTemplateSyncAt: updates.lastMetaTemplateSyncAt ?? current.lastMetaTemplateSyncAt,
    estimatedUtilityCostUsd:
      typeof updates.estimatedUtilityCostUsd === 'number' && updates.estimatedUtilityCostUsd >= 0
        ? updates.estimatedUtilityCostUsd
        : current.estimatedUtilityCostUsd,
    estimatedMarketingCostUsd:
      typeof updates.estimatedMarketingCostUsd === 'number' && updates.estimatedMarketingCostUsd >= 0
        ? updates.estimatedMarketingCostUsd
        : current.estimatedMarketingCostUsd,
    lastWebhookReceivedAt: updates.lastWebhookReceivedAt ?? current.lastWebhookReceivedAt,
    lastWebhookVerifiedAt: updates.lastWebhookVerifiedAt ?? current.lastWebhookVerifiedAt,
    lastWorkerRunAt: updates.lastWorkerRunAt ?? current.lastWorkerRunAt,
    lastWorkerHeartbeatAt: updates.lastWorkerHeartbeatAt ?? current.lastWorkerHeartbeatAt,
    lastSuccessfulRunAt: updates.lastSuccessfulRunAt ?? current.lastSuccessfulRunAt,
    lastWorkerSummary: updates.lastWorkerSummary ?? current.lastWorkerSummary,
    updatedAt: new Date().toISOString(),
  };
  writeJson(WA_SETTINGS_FILE, next);
  void mirrorDocToFirestoreServer('whatsappSettings', 'main', {
    ...next,
    updatedAtIso: next.updatedAt,
  });

  if (admin) {
    appendAdminAudit({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'automation_settings_updated',
      targetId: 'whatsappSettings/main',
      details: `Updated WhatsApp & business automation settings (running=${next.automationRunning}, mode=${next.sendingMode}).`,
    });
  }
  return next;
}

export async function startAutomationBot(admin: { id: string; email: string }): Promise<{
  settings: WhatsAppAutomationSettings;
  workerResult: Awaited<ReturnType<typeof runAutomationWorkerCycle>>;
}> {
  const now = new Date().toISOString();
  const settings = saveAutomationSettings(
    {
      automationRunning: true,
      automationStartedAt: now,
      automationToggledBy: admin.email,
      rules: { masterEnabled: true },
    },
    admin
  );
  appendAdminAudit({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'automation_bot_started',
    targetId: 'whatsappSettings/main',
    details: 'Admin clicked START AUTOMATION. Background WhatsApp worker activated.',
  });
  const workerResult = await runAutomationWorkerCycle({ trigger: 'bot_started' });
  return { settings: getAutomationSettings(), workerResult };
}

export function stopAutomationBot(admin: { id: string; email: string }): WhatsAppAutomationSettings {
  const now = new Date().toISOString();
  const settings = saveAutomationSettings(
    {
      automationRunning: false,
      automationStoppedAt: now,
      automationToggledBy: admin.email,
    },
    admin
  );
  appendAdminAudit({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'automation_bot_stopped',
    targetId: 'whatsappSettings/main',
    details: 'Admin clicked STOP AUTOMATION. Pending jobs paused safely; manual WhatsApp sending remains available.',
  });
  return settings;
}

export async function syncMetaTemplateStatuses(admin?: { id: string; email: string }): Promise<{
  ok: boolean;
  syncedCount: number;
  metaTemplatesFound: number;
  updatedStatuses: Record<string, WhatsAppTemplateApprovalStatus>;
  syncedDetails?: Record<string, SyncedMetaTemplateInfo>;
  syncedAt?: string;
  error?: string;
}> {
  const res = await fetchMetaWabaTemplates();
  if (!res.ok) {
    return {
      ok: false,
      syncedCount: 0,
      metaTemplatesFound: 0,
      updatedStatuses: {},
      error: res.error,
    };
  }
  const current = getAutomationSettings();
  const updates: Record<string, WhatsAppTemplateApprovalStatus> = {};
  const details: Record<string, SyncedMetaTemplateInfo> = { ...(current.metaTemplateDetails || {}) };
  const syncedAt = new Date().toISOString();

  const statusRank = (rawStatus: string): number => {
    const s = String(rawStatus || '').toUpperCase();
    if (s === 'APPROVED' || s === 'ACTIVE') return 4;
    if (s === 'PENDING' || s === 'IN_APPEAL') return 3;
    if (s === 'PAUSED') return 2;
    if (s === 'REJECTED' || s === 'DISABLED') return 1;
    return 0;
  };

  // Group by template name and pick best matching variant (prefer APPROVED/ACTIVE, then en/en_US)
  const bestByName = new Map<string, SyncedMetaTemplateInfo>();
  for (const mt of res.templates) {
    if (!mt.name) continue;
    const prev = bestByName.get(mt.name);
    if (!prev) {
      bestByName.set(mt.name, mt);
      continue;
    }
    const prevRank = statusRank(prev.status);
    const currRank = statusRank(mt.status);
    const currIsEn = mt.language === 'en' || mt.language === 'en_US';
    const prevIsEn = prev.language === 'en' || prev.language === 'en_US';
    if (currRank > prevRank || (currRank === prevRank && currIsEn && !prevIsEn)) {
      bestByName.set(mt.name, mt);
    }
  }

  let syncedCount = 0;
  for (const [name, mt] of bestByName.entries()) {
    const rawUpper = String(mt.status || '').toUpperCase();
    let mapped: WhatsAppTemplateApprovalStatus = 'draft';
    if (rawUpper === 'APPROVED' || rawUpper === 'ACTIVE') mapped = 'approved';
    else if (rawUpper === 'PENDING' || rawUpper === 'IN_APPEAL') mapped = 'pending_meta_review';
    else if (rawUpper === 'REJECTED' || rawUpper === 'PAUSED' || rawUpper === 'DISABLED') {
      mapped = 'rejected';
    }

    details[name] = { ...mt, status: rawUpper, syncedAt };

    if (name in current.templateStatuses || WHATSAPP_TEMPLATES_CATALOG.some((t) => t.name === name)) {
      updates[name] = mapped;
      syncedCount += 1;
    }
  }

  saveAutomationSettings(
    {
      ...(syncedCount > 0 ? { templateStatuses: updates } : {}),
      metaTemplateDetails: details,
      lastMetaTemplateSyncAt: syncedAt,
    },
    admin
  );

  return {
    ok: true,
    syncedCount,
    metaTemplatesFound: res.templates.length,
    updatedStatuses: updates,
    syncedDetails: details,
    syncedAt,
  };
}

export function cleanupBlockedUserAutomationState(params: {
  memberIds?: string[];
  email?: string;
  phones?: string[];
  reason?: string;
  actor?: string;
}): {
  cancelledJobsCount: number;
  cancelledManualNotificationsCount: number;
  optedOutPreferencesCount: number;
} {
  const memberSet = new Set((params.memberIds || []).filter(Boolean));
  const cleanEmail = String(params.email || '').trim().toLowerCase();
  const phoneSet = new Set((params.phones || []).map((p) => normalizeBlockedPhone(p)).filter(Boolean));
  const reason = params.reason || 'Account permanently blocked by administrator';

  // 1. Cancel all pending automation scheduled jobs
  const cancelledJobsCount = cancelScheduledJobs((job) => {
    if (job.memberId && memberSet.has(job.memberId)) return true;
    const jobPhone = normalizeBlockedPhone(job.phoneE164);
    if (jobPhone && phoneSet.has(jobPhone)) return true;
    return false;
  }, reason);

  // 2. Cancel all pending/opened manual one-click WhatsApp notifications
  const cancelledManualNotificationsCount = cancelOneClickNotificationsForBlockedUser({
    memberIds: Array.from(memberSet),
    email: cleanEmail,
    phones: Array.from(phoneSet),
    reason,
    actor: params.actor || 'admin',
  });

  // 3. Mark matching WhatsApp preferences as optedOut so no future automatic messages ever target them
  const prefs = listAllNotificationPreferences();
  const now = new Date().toISOString();
  let optedOutPreferencesCount = 0;
  for (const p of prefs) {
    const pEmail = String(p.email || '').trim().toLowerCase();
    const pPhone = normalizeBlockedPhone(p.phoneE164);
    const matches =
      (p.memberId && memberSet.has(p.memberId)) ||
      (cleanEmail && pEmail === cleanEmail) ||
      (pPhone && phoneSet.has(pPhone));
    if (matches && !p.optedOut) {
      p.optedOut = true;
      p.optedOutAt = now;
      p.optOutSource = 'admin_user_blocked';
      p.membershipUpdates = false;
      p.renewalReminders = false;
      p.newEpisodeAlerts = false;
      p.promotionalMessages = false;
      p.leadEnquiryConsent = false;
      p.updatedAt = now;
      p.history = [
        { changedAt: now, source: 'admin_user_blocked', summary: `Blocked: ${reason}` },
        ...(p.history || []),
      ].slice(0, 25);
      optedOutPreferencesCount += 1;
      void mirrorDocToFirestoreServer('whatsappPreferences', p.id, {
        ...p,
        createdAtIso: p.createdAt,
        updatedAtIso: p.updatedAt,
      });
    }
  }
  if (optedOutPreferencesCount > 0) {
    writeJson(WA_PREFS_FILE, prefs);
  }

  return {
    cancelledJobsCount,
    cancelledManualNotificationsCount,
    optedOutPreferencesCount,
  };
}

// --- CUSTOMER CONSENT & NOTIFICATION PREFERENCES ---
export function listAllNotificationPreferences(): CustomerNotificationPreference[] {
  return readJson<CustomerNotificationPreference[]>(WA_PREFS_FILE, []);
}

export function getMemberNotificationPreferences(params: {
  memberId?: string;
  phone?: string;
}): CustomerNotificationPreference | null {
  const all = listAllNotificationPreferences();
  const normalizedPhone = normalizePhoneE164(params.phone);
  if (params.memberId) {
    const byMember = all.find((p) => p.memberId === params.memberId);
    if (byMember) return byMember;
  }
  if (normalizedPhone) {
    const byPhone = all.find((p) => p.phoneE164 === normalizedPhone);
    if (byPhone) return byPhone;
  }
  return null;
}

export function upsertMemberNotificationPreferences(params: {
  memberId?: string;
  ownerUid?: string;
  email?: string;
  fullName?: string;
  phone: string;
  membershipUpdates?: boolean;
  renewalReminders?: boolean;
  newEpisodeAlerts?: boolean;
  promotionalMessages?: boolean;
  leadEnquiryConsent?: boolean;
  optedOut?: boolean;
  source: string;
}): CustomerNotificationPreference | { error: string } {
  const phoneE164 = normalizePhoneE164(params.phone);
  if (!phoneE164) {
    return { error: 'A valid international E.164 WhatsApp phone number is required.' };
  }

  const all = listAllNotificationPreferences();
  const now = new Date().toISOString();
  const idx = all.findIndex(
    (p) =>
      (params.memberId && p.memberId === params.memberId) ||
      p.phoneE164 === phoneE164
  );

  const existing = idx >= 0 ? all[idx] : null;
  const nextMembershipUpdates =
    params.membershipUpdates !== undefined
      ? Boolean(params.membershipUpdates)
      : existing?.membershipUpdates ?? false;
  const nextRenewalReminders =
    params.renewalReminders !== undefined
      ? Boolean(params.renewalReminders)
      : existing?.renewalReminders ?? false;
  const nextNewEpisodeAlerts =
    params.newEpisodeAlerts !== undefined
      ? Boolean(params.newEpisodeAlerts)
      : existing?.newEpisodeAlerts ?? false;
  const nextPromotionalMessages =
    params.promotionalMessages !== undefined
      ? Boolean(params.promotionalMessages)
      : existing?.promotionalMessages ?? false;
  const nextLeadEnquiryConsent =
    params.leadEnquiryConsent !== undefined
      ? Boolean(params.leadEnquiryConsent)
      : existing?.leadEnquiryConsent ?? false;
  const nextOptedOut =
    params.optedOut !== undefined ? Boolean(params.optedOut) : existing?.optedOut ?? false;

  const anyConsented =
    !nextOptedOut &&
    (nextMembershipUpdates ||
      nextRenewalReminders ||
      nextNewEpisodeAlerts ||
      nextPromotionalMessages ||
      nextLeadEnquiryConsent);

  const summary = nextOptedOut
    ? `Opted out via ${params.source}`
    : `Updated prefs (updates:${nextMembershipUpdates}, renewals:${nextRenewalReminders}, episodes:${nextNewEpisodeAlerts}, promo:${nextPromotionalMessages}, lead:${nextLeadEnquiryConsent})`;

  const docId = existing?.id || makeSafeDocId(params.memberId || `wa_${phoneE164.slice(1)}`);
  const record: CustomerNotificationPreference = {
    id: docId,
    memberId: params.memberId || existing?.memberId,
    ownerUid: params.ownerUid || existing?.ownerUid,
    email: params.email || existing?.email,
    fullName: params.fullName || existing?.fullName,
    phoneE164,
    membershipUpdates: nextOptedOut ? false : nextMembershipUpdates,
    renewalReminders: nextOptedOut ? false : nextRenewalReminders,
    newEpisodeAlerts: nextOptedOut ? false : nextNewEpisodeAlerts,
    promotionalMessages: nextOptedOut ? false : nextPromotionalMessages,
    leadEnquiryConsent: nextOptedOut ? false : nextLeadEnquiryConsent,
    optedOut: nextOptedOut,
    optedOutAt: nextOptedOut ? now : undefined,
    optOutSource: nextOptedOut ? params.source : undefined,
    consentTimestamp: anyConsented ? now : existing?.consentTimestamp,
    consentSource: anyConsented ? params.source : existing?.consentSource,
    history: [
      { changedAt: now, source: params.source, summary },
      ...(existing?.history || []),
    ].slice(0, 25),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.unshift(record);
  }
  writeJson(WA_PREFS_FILE, all);
  void mirrorDocToFirestoreServer('whatsappPreferences', record.id, {
    ...record,
    createdAtIso: record.createdAt,
    updatedAtIso: record.updatedAt,
  });

  if (nextOptedOut) {
    cancelScheduledJobs(
      (j) =>
        (Boolean(record.memberId) && j.memberId === record.memberId) ||
        j.phoneE164 === phoneE164,
      `Recipient opted out (${params.source})`
    );
  }

  return record;
}

function checkConsentForCategory(params: {
  memberId?: string;
  phone?: string;
  category: 'membershipUpdates' | 'renewalReminders' | 'newEpisodeAlerts' | 'promotionalMessages' | 'leadEnquiry';
  explicitLeadConsent?: boolean;
}): { allowed: boolean; reason?: 'opted_out' | 'no_consent'; phoneE164?: string } {
  const pref = getMemberNotificationPreferences({
    memberId: params.memberId,
    phone: params.phone,
  });
  const phoneE164 = pref?.phoneE164 || normalizePhoneE164(params.phone) || undefined;
  if (!phoneE164) return { allowed: false, reason: 'no_consent' };
  if (pref?.optedOut) return { allowed: false, reason: 'opted_out', phoneE164 };

  if (params.category === 'leadEnquiry') {
    const allowed = Boolean(params.explicitLeadConsent || pref?.leadEnquiryConsent);
    return { allowed, reason: allowed ? undefined : 'no_consent', phoneE164 };
  }

  if (!pref) {
    return { allowed: false, reason: 'no_consent', phoneE164 };
  }

  const allowed = Boolean(pref[params.category]);
  return { allowed, reason: allowed ? undefined : 'no_consent', phoneE164 };
}

// --- MESSAGE LOGS & DISPATCH ENGINE ---
export function listWhatsAppMessages(limit = 300): WhatsAppMessageLog[] {
  return readJson<WhatsAppMessageLog[]>(WA_MESSAGES_FILE, []).slice(0, limit);
}

function saveWhatsAppMessageLog(entry: WhatsAppMessageLog): void {
  const all = readJson<WhatsAppMessageLog[]>(WA_MESSAGES_FILE, []);
  const idx = all.findIndex((m) => m.id === entry.id);
  if (idx >= 0) {
    all[idx] = entry;
  } else {
    all.unshift(entry);
  }
  const trimmed = all.slice(0, 2000);
  writeJson(WA_MESSAGES_FILE, trimmed);
  void mirrorDocToFirestoreServer('whatsappMessages', entry.id, {
    ...entry,
    createdAtIso: entry.createdAt,
    updatedAtIso: entry.updatedAt,
  });
}

function hasDuplicateMessageByIdempotencyKey(idempotencyKey: string): boolean {
  const all = readJson<WhatsAppMessageLog[]>(WA_MESSAGES_FILE, []);
  return all.some(
    (m) =>
      m.idempotencyKey === idempotencyKey &&
      m.status !== 'failed' &&
      m.status !== 'not_configured'
  );
}

const RETRY_BACKOFF_MINUTES = [2, 10, 30, 120];

function computeNextRetryIso(attempts: number): string | undefined {
  if (attempts >= RETRY_BACKOFF_MINUTES.length) return undefined;
  const mins = RETRY_BACKOFF_MINUTES[attempts] || 120;
  return new Date(Date.now() + mins * 60 * 1000).toISOString();
}

export interface ManualFallbackSpec {
  eventType: OneClickEventType;
  customerEmail?: string;
  membershipId?: string;
  orderId?: string;
  dramaId?: string;
  episodeSlug?: string;
  planName?: string;
  amountDisplay?: string;
  startDate?: string;
  expiryDate?: string;
  rejectionReason?: string;
  seriesName?: string;
  episodeNumber?: string | number;
  episodeLink?: string;
  accessType?: 'free' | 'premium';
  securityEventSummary?: string;
  serviceName?: string;
}

export async function dispatchTemplateWhatsAppNotification(params: {
  idempotencyKey: string;
  eventType: string;
  templateName: string;
  bodyParameters: string[];
  recipientPhone?: string;
  recipientName?: string;
  memberId?: string;
  leadId?: string;
  broadcastId?: string;
  categoryKey?: AutomationCategoryKey;
  sendingModeOverride?: WhatsAppSendingMode;
  manualFallbackSpec?: ManualFallbackSpec;
  ruleEnabled: boolean;
  explicitLeadConsent?: boolean;
  bypassConsentForAdminTest?: boolean;
  bypassTemplateApprovalCheck?: boolean;
  isTest?: boolean;
}): Promise<WhatsAppMessageLog | null> {
  if (!params.bypassConsentForAdminTest && hasDuplicateMessageByIdempotencyKey(params.idempotencyKey)) {
    return null;
  }

  const settings = getAutomationSettings();
  const tpl = getTemplateDraftByName(params.templateName);
  const syncedMetaTemplate = settings.metaTemplateDetails?.[params.templateName] || null;
  const resolvedLanguage = syncedMetaTemplate?.language || tpl?.language || 'en';
  const category: WhatsAppTemplateCategory = tpl?.category || 'UTILITY';
  const costEstimate =
    category === 'MARKETING'
      ? settings.estimatedMarketingCostUsd
      : settings.estimatedUtilityCostUsd;

  const strictPhone = normalizeCustomerPhoneE164Strict(params.recipientPhone);
  const phoneE164 = strictPhone.valid
    ? strictPhone.phoneE164
    : normalizePhoneE164(params.recipientPhone) || String(params.recipientPhone || '');
  const now = new Date().toISOString();
  const preview = renderTemplatePreview(params.templateName, params.bodyParameters);

  const effectiveMode: WhatsAppSendingMode = params.bypassConsentForAdminTest
    ? 'automatic'
    : getEffectiveSendingMode(params.categoryKey, params.sendingModeOverride);

  const baseLog: WhatsAppMessageLog = {
    id: makeId('wamsg'),
    direction: 'outbound',
    isTest: Boolean(params.isTest || params.bypassConsentForAdminTest),
    sendingMethod: effectiveMode === 'manual' ? 'manual_whatsapp' : 'cloud_api',
    broadcastId: params.broadcastId,
    idempotencyKey: params.idempotencyKey,
    eventType: params.eventType,
    recipientPhone: phoneE164 || 'missing_phone',
    recipientName: params.recipientName,
    memberId: params.memberId,
    leadId: params.leadId,
    templateName: params.templateName,
    templateLanguage: resolvedLanguage,
    templateCategory: category,
    bodyParameters: params.bodyParameters,
    bodyPreview: params.isTest ? `[TEST] ${preview}` : preview,
    status: 'queued',
    attempts: 0,
    maxAttempts: RETRY_BACKOFF_MINUTES.length,
    estimatedCostUsd: 0,
    createdAt: now,
    updatedAt: now,
  };

  if (!params.bypassConsentForAdminTest && (effectiveMode === 'disabled' || !params.ruleEnabled)) {
    baseLog.status = 'skipped_rule_disabled';
    baseLog.errorMessage =
      effectiveMode === 'disabled'
        ? `Sending mode for "${params.categoryKey || 'global'}" is set to Disabled.`
        : 'Automation rule is disabled in Admin Automation Settings.';
    saveWhatsAppMessageLog(baseLog);
    return baseLog;
  }

  // Respect blocked users permanently (both email and phone)
  if (!params.bypassConsentForAdminTest && (params.memberId || phoneE164)) {
    const blockedList = listBlockedUsers();
    const normPhoneBlock = normalizeBlockedPhone(phoneE164);
    const isBlocked = blockedList.some(
      (b) =>
        (params.memberId && b.memberId === params.memberId) ||
        (normPhoneBlock &&
          (normalizeBlockedPhone(b.phoneNormalized) === normPhoneBlock ||
            normalizeBlockedPhone(b.phone) === normPhoneBlock ||
            (b.additionalPhones || []).some((p) => normalizeBlockedPhone(p) === normPhoneBlock)))
    );
    if (isBlocked) {
      baseLog.status = 'cancelled';
      baseLog.errorMessage = 'Recipient account/phone is permanently blocked.';
      saveWhatsAppMessageLog(baseLog);
      return baseLog;
    }
  }

  // Manual-only sending mode: enqueue ONE manual WhatsApp item, NEVER call Cloud API
  if (effectiveMode === 'manual') {
    if (params.manualFallbackSpec) {
      const qRes = enqueueOneClickWhatsAppNotification({
        idempotencyKey: `manual_mode:${params.idempotencyKey}`,
        eventType: params.manualFallbackSpec.eventType,
        customerName: params.recipientName || 'Valued Member',
        customerEmail: params.manualFallbackSpec.customerEmail,
        memberId: params.memberId,
        membershipId: params.manualFallbackSpec.membershipId,
        orderId: params.manualFallbackSpec.orderId,
        leadId: params.leadId,
        dramaId: params.manualFallbackSpec.dramaId,
        episodeSlug: params.manualFallbackSpec.episodeSlug,
        rawPhone: params.recipientPhone || phoneE164,
        planName: params.manualFallbackSpec.planName,
        amountDisplay: params.manualFallbackSpec.amountDisplay,
        startDate: params.manualFallbackSpec.startDate,
        expiryDate: params.manualFallbackSpec.expiryDate,
        rejectionReason: params.manualFallbackSpec.rejectionReason,
        seriesName: params.manualFallbackSpec.seriesName,
        episodeNumber: params.manualFallbackSpec.episodeNumber,
        episodeLink: params.manualFallbackSpec.episodeLink,
        accessType: params.manualFallbackSpec.accessType,
        securityEventSummary: params.manualFallbackSpec.securityEventSummary,
        serviceName: params.manualFallbackSpec.serviceName,
        explicitLeadConsent: params.explicitLeadConsent,
        bypassCategoryGate: true,
      });
      if (qRes.ok) {
        baseLog.sendingMethod = 'manual_whatsapp';
        baseLog.status = qRes.notification.status === 'failed' ? 'failed' : 'queued';
        baseLog.manualFallbackNotificationId = qRes.notification.id;
        baseLog.errorMessage = qRes.notification.failureReason;
        baseLog.apiResponseSummary = 'Queued in Manual WhatsApp Center (Manual Sending Mode).';
        saveWhatsAppMessageLog(baseLog);
        return baseLog;
      } else {
        const skipReason = 'reason' in qRes ? qRes.reason : 'Skipped by WhatsApp queue.';
        baseLog.status = skipReason.toLowerCase().includes('opted out')
          ? 'skipped_opted_out'
          : 'skipped_no_consent';
        baseLog.errorMessage = skipReason;
        saveWhatsAppMessageLog(baseLog);
        return baseLog;
      }
    }
    baseLog.status = 'skipped_rule_disabled';
    baseLog.errorMessage = 'Manual mode active (no manual message payload attached).';
    saveWhatsAppMessageLog(baseLog);
    return baseLog;
  }

  // Automatic or Automatic + Manual Fallback checks
  if (!phoneE164) {
    baseLog.status = 'skipped_no_consent';
    baseLog.errorMessage = 'Valid E.164 WhatsApp phone number not on file.';
    saveWhatsAppMessageLog(baseLog);
    return baseLog;
  }

  if (!params.bypassConsentForAdminTest && tpl) {
    const consent = checkConsentForCategory({
      memberId: params.memberId,
      phone: phoneE164,
      category: tpl.consentCategory,
      explicitLeadConsent: params.explicitLeadConsent,
    });
    if (!consent.allowed) {
      baseLog.status = consent.reason === 'opted_out' ? 'skipped_opted_out' : 'skipped_no_consent';
      baseLog.errorMessage =
        consent.reason === 'opted_out'
          ? 'Customer has opted out of WhatsApp messages (STOP).'
          : `Customer has not opted in to ${tpl.consentCategory}.`;
      saveWhatsAppMessageLog(baseLog);
      return baseLog;
    }
  }

  const enqueueManualFallbackIfAllowed = (fallbackReason: string): string | undefined => {
    if (effectiveMode !== 'automatic_with_fallback' || !params.manualFallbackSpec) return undefined;
    const qRes = enqueueOneClickWhatsAppNotification({
      idempotencyKey: `fallback:${params.idempotencyKey}`,
      eventType: params.manualFallbackSpec.eventType,
      customerName: params.recipientName || 'Valued Member',
      customerEmail: params.manualFallbackSpec.customerEmail,
      memberId: params.memberId,
      membershipId: params.manualFallbackSpec.membershipId,
      orderId: params.manualFallbackSpec.orderId,
      leadId: params.leadId,
      dramaId: params.manualFallbackSpec.dramaId,
      episodeSlug: params.manualFallbackSpec.episodeSlug,
      rawPhone: params.recipientPhone || phoneE164,
      planName: params.manualFallbackSpec.planName,
      amountDisplay: params.manualFallbackSpec.amountDisplay,
      startDate: params.manualFallbackSpec.startDate,
      expiryDate: params.manualFallbackSpec.expiryDate,
      rejectionReason: params.manualFallbackSpec.rejectionReason,
      seriesName: params.manualFallbackSpec.seriesName,
      episodeNumber: params.manualFallbackSpec.episodeNumber,
      episodeLink: params.manualFallbackSpec.episodeLink,
      accessType: params.manualFallbackSpec.accessType,
      securityEventSummary: params.manualFallbackSpec.securityEventSummary,
      serviceName: params.manualFallbackSpec.serviceName,
      explicitLeadConsent: params.explicitLeadConsent,
      bypassConsentCheck: true,
      bypassCategoryGate: true,
    });
    if (qRes.ok) {
      baseLog.apiResponseSummary = `${fallbackReason} Fallback queued in Manual WhatsApp Center (${qRes.notification.id}).`;
      return qRes.notification.id;
    }
    return undefined;
  };

  const tplApproval = settings.templateStatuses[params.templateName] || 'draft';
  const rawMetaStatus = syncedMetaTemplate?.status?.toUpperCase();
  const isMetaBlockedStatus =
    rawMetaStatus === 'REJECTED' || rawMetaStatus === 'PAUSED' || rawMetaStatus === 'DISABLED';
  if ((!params.bypassTemplateApprovalCheck && tplApproval !== 'approved') || isMetaBlockedStatus) {
    baseLog.status = 'skipped_template_unapproved';
    baseLog.retryable = false;
    baseLog.errorCode = 'TEMPLATE_UNAPPROVED';
    baseLog.errorMessage = `Template "${params.templateName}" is currently "${rawMetaStatus || tplApproval}". Sync approved templates from Meta WhatsApp Manager before automated sending.`;
    baseLog.manualFallbackNotificationId = enqueueManualFallbackIfAllowed(
      `Template ${params.templateName} is ${rawMetaStatus || tplApproval}.`
    );
    saveWhatsAppMessageLog(baseLog);
    return baseLog;
  }

  // Strict pre-send template parameter validation to eliminate Meta #132000 errors
  const paramValidation = validateWhatsAppTemplateParameters({
    templateName: params.templateName,
    bodyParameters: params.bodyParameters,
    languageCode: resolvedLanguage,
    syncedMetaTemplate,
  });
  if (!paramValidation.valid) {
    const classified = classifyWhatsAppSendError(
      paramValidation.errorCode || 'TEMPLATE_PARAM_MISMATCH',
      paramValidation.error,
      400
    );
    const failedAt = new Date().toISOString();
    baseLog.status = 'failed';
    baseLog.httpStatus = 400;
    baseLog.errorCode = paramValidation.errorCode || 'TEMPLATE_PARAM_MISMATCH';
    baseLog.errorMessage = paramValidation.error || 'Template parameter validation failed.';
    baseLog.retryable = false;
    baseLog.errorCategory = classified.category;
    baseLog.errorExplanation = {
      humanTitle: classified.humanTitle,
      whatWentWrong: classified.whatWentWrong,
      component: classified.component,
      needsAdminAction: classified.needsAdminAction,
      systemAction: classified.systemAction,
    };
    baseLog.nextRetryAt = undefined;
    baseLog.apiResponseSummary = `Blocked locally before Meta API (${baseLog.errorCode}): ${baseLog.errorMessage.slice(0, 180)}`;
    baseLog.failedAt = failedAt;
    baseLog.updatedAt = failedAt;
    saveWhatsAppMessageLog(baseLog);
    return baseLog;
  }

  baseLog.bodyParameters = paramValidation.normalizedParams;
  baseLog.templateLanguage = paramValidation.languageCode;
  baseLog.bodyPreview = params.isTest
    ? `[TEST] ${paramValidation.renderedPreview || preview}`
    : paramValidation.renderedPreview || preview;

  baseLog.attempts = 1;
  const sendRes = await sendWhatsAppTemplateMessage({
    toPhone: phoneE164,
    templateName: params.templateName,
    languageCode: paramValidation.languageCode,
    bodyParameters: paramValidation.normalizedParams,
    syncedMetaTemplate,
  });

  const finishedAt = new Date().toISOString();
  baseLog.httpStatus = sendRes.httpStatus;
  if (sendRes.ok) {
    // Honest status: Meta API accepted request (wamid returned). Delivery confirmed only via webhook!
    baseLog.status = 'api_accepted';
    baseLog.wamid = sendRes.messageId;
    baseLog.sentAt = finishedAt;
    baseLog.retryable = false;
    baseLog.nextRetryAt = undefined;
    baseLog.estimatedCostUsd = costEstimate;
    baseLog.apiResponseSummary = `Meta Cloud API HTTP ${sendRes.httpStatus || 200} accepted (wamid: ${sendRes.messageId || 'pending'}, lang: ${paramValidation.languageCode}). Awaiting delivery webhook.`;
    baseLog.updatedAt = finishedAt;
  } else if (sendRes.notConfigured) {
    baseLog.status = 'not_configured';
    baseLog.retryable = false;
    baseLog.nextRetryAt = undefined;
    baseLog.errorMessage = sendRes.error;
    baseLog.failedAt = finishedAt;
    baseLog.manualFallbackNotificationId = enqueueManualFallbackIfAllowed('Meta Cloud API not configured.');
    baseLog.updatedAt = finishedAt;
  } else {
    const classified = classifyWhatsAppSendError(
      sendRes.errorCode,
      sendRes.error,
      sendRes.httpStatus
    );
    baseLog.status = 'failed';
    baseLog.errorMessage = sendRes.error || 'Meta API delivery error.';
    baseLog.errorCode = sendRes.errorCode;
    baseLog.retryable = classified.retryable;
    baseLog.errorCategory = classified.category;
    baseLog.errorExplanation = {
      humanTitle: classified.humanTitle,
      whatWentWrong: classified.whatWentWrong,
      component: classified.component,
      needsAdminAction: classified.needsAdminAction,
      systemAction: classified.systemAction,
    };
    baseLog.apiResponseSummary = `Meta API HTTP ${sendRes.httpStatus || 500} error (${sendRes.errorCode || 'unknown'}): ${String(sendRes.error || '').slice(0, 180)}`;
    baseLog.failedAt = finishedAt;
    // ONLY schedule automatic retry for transient errors (never auto-retry permanent errors like #132000!)
    baseLog.nextRetryAt = classified.retryable ? computeNextRetryIso(baseLog.attempts) : undefined;
    baseLog.manualFallbackNotificationId = enqueueManualFallbackIfAllowed('Meta Cloud API error.');
    baseLog.updatedAt = finishedAt;
  }

  saveWhatsAppMessageLog(baseLog);
  return baseLog;
}

export async function retryFailedWhatsAppMessage(
  messageId: string,
  options?: { overrideBodyParameters?: string[]; manualAdminRetry?: boolean }
): Promise<{
  ok: boolean;
  message?: WhatsAppMessageLog;
  error?: string;
}> {
  const all = readJson<WhatsAppMessageLog[]>(WA_MESSAGES_FILE, []);
  const target = all.find((m) => m.id === messageId);
  if (!target) return { ok: false, error: 'Message log not found.' };
  if (target.direction !== 'outbound') {
    return { ok: false, error: 'Only outbound messages can be retried.' };
  }
  if (
    target.status === 'api_accepted' ||
    target.status === 'sent' ||
    target.status === 'delivered' ||
    target.status === 'read'
  ) {
    return {
      ok: false,
      message: target,
      error: `Message is already "${target.status}" — duplicate retry prevented.`,
    };
  }

  const settings = getAutomationSettings();
  const syncedMetaTemplate = target.templateName
    ? settings.metaTemplateDetails?.[target.templateName] || null
    : null;
  const tpl = target.templateName ? getTemplateDraftByName(target.templateName) : undefined;
  const resolvedLanguage =
    syncedMetaTemplate?.language || target.templateLanguage || tpl?.language || 'en';

  const bodyParamsToUse =
    Array.isArray(options?.overrideBodyParameters) && options.overrideBodyParameters.length > 0
      ? options.overrideBodyParameters
      : target.bodyParameters || [];

  if (target.templateName) {
    const paramValidation = validateWhatsAppTemplateParameters({
      templateName: target.templateName,
      bodyParameters: bodyParamsToUse,
      languageCode: resolvedLanguage,
      syncedMetaTemplate,
    });
    if (!paramValidation.valid) {
      const classified = classifyWhatsAppSendError(
        paramValidation.errorCode || 'TEMPLATE_PARAM_MISMATCH',
        paramValidation.error,
        400
      );
      target.status = 'failed';
      target.httpStatus = 400;
      target.errorCode = paramValidation.errorCode || 'TEMPLATE_PARAM_MISMATCH';
      target.errorMessage = paramValidation.error;
      target.retryable = false;
      target.errorCategory = classified.category;
      target.errorExplanation = {
        humanTitle: classified.humanTitle,
        whatWentWrong: classified.whatWentWrong,
        component: classified.component,
        needsAdminAction: classified.needsAdminAction,
        systemAction: classified.systemAction,
      };
      target.nextRetryAt = undefined;
      target.updatedAt = new Date().toISOString();
      saveWhatsAppMessageLog(target);
      return { ok: false, message: target, error: paramValidation.error };
    }
    target.bodyParameters = paramValidation.normalizedParams;
    target.templateLanguage = paramValidation.languageCode;
    if (paramValidation.renderedPreview) {
      target.bodyPreview = target.isTest
        ? `[TEST] ${paramValidation.renderedPreview}`
        : paramValidation.renderedPreview;
    }
  }

  const now = new Date().toISOString();
  target.attempts = (target.attempts || 0) + 1;
  target.updatedAt = now;

  const sendRes = target.templateName
    ? await sendWhatsAppTemplateMessage({
        toPhone: target.recipientPhone,
        templateName: target.templateName,
        languageCode: target.templateLanguage || resolvedLanguage,
        bodyParameters: target.bodyParameters || [],
        syncedMetaTemplate,
      })
    : await sendWhatsAppTextMessage({
        toPhone: target.recipientPhone,
        body: target.bodyPreview,
      });

  target.httpStatus = sendRes.httpStatus;
  if (sendRes.ok) {
    target.status = 'api_accepted';
    target.wamid = sendRes.messageId;
    target.sentAt = new Date().toISOString();
    target.errorMessage = undefined;
    target.errorCode = undefined;
    target.errorCategory = undefined;
    target.errorExplanation = undefined;
    target.retryable = false;
    target.nextRetryAt = undefined;
    target.apiResponseSummary = `Retry accepted by Meta Cloud API HTTP ${sendRes.httpStatus || 200} (wamid: ${sendRes.messageId || 'pending'}).`;
    target.estimatedCostUsd =
      target.templateCategory === 'MARKETING'
        ? settings.estimatedMarketingCostUsd
        : settings.estimatedUtilityCostUsd;
  } else if (sendRes.notConfigured) {
    target.status = 'not_configured';
    target.retryable = false;
    target.errorMessage = sendRes.error;
    target.nextRetryAt = undefined;
  } else {
    const classified = classifyWhatsAppSendError(
      sendRes.errorCode,
      sendRes.error,
      sendRes.httpStatus
    );
    target.status = 'failed';
    target.errorMessage = sendRes.error || 'Retry failed.';
    target.errorCode = sendRes.errorCode;
    target.retryable = classified.retryable;
    target.errorCategory = classified.category;
    target.errorExplanation = {
      humanTitle: classified.humanTitle,
      whatWentWrong: classified.whatWentWrong,
      component: classified.component,
      needsAdminAction: classified.needsAdminAction,
      systemAction: classified.systemAction,
    };
    target.apiResponseSummary = `Retry failed HTTP ${sendRes.httpStatus || 500} (${sendRes.errorCode || 'unknown'}): ${String(sendRes.error || '').slice(0, 180)}`;
    target.failedAt = new Date().toISOString();
    target.nextRetryAt = classified.retryable ? computeNextRetryIso(target.attempts) : undefined;
  }

  saveWhatsAppMessageLog(target);
  return { ok: sendRes.ok, message: target, error: sendRes.error };
}

// --- SCHEDULED JOBS ---
export function listAutomationJobs(limit = 300): AutomationScheduledJob[] {
  return readJson<AutomationScheduledJob[]>(AUTOMATION_JOBS_FILE, []).slice(0, limit);
}

function saveAutomationJob(job: AutomationScheduledJob): void {
  const all = readJson<AutomationScheduledJob[]>(AUTOMATION_JOBS_FILE, []);
  const idx = all.findIndex((j) => j.id === job.id);
  if (idx >= 0) {
    all[idx] = job;
  } else {
    all.unshift(job);
  }
  writeJson(AUTOMATION_JOBS_FILE, all.slice(0, 2000));
  void mirrorDocToFirestoreServer('automationJobs', job.id, {
    ...job,
    createdAtIso: job.createdAt,
    updatedAtIso: job.updatedAt,
  });
}

export function scheduleAutomationJob(params: {
  jobType: AutomationJobType;
  idempotencyKey: string;
  runAtIso: string;
  memberId?: string;
  orderId?: string;
  membershipId?: string;
  broadcastId?: string;
  leadId?: string;
  phoneE164?: string;
  maxAttempts?: number;
  payload?: Record<string, any>;
}): AutomationScheduledJob | null {
  const all = readJson<AutomationScheduledJob[]>(AUTOMATION_JOBS_FILE, []);
  const duplicate = all.find((j) => j.idempotencyKey === params.idempotencyKey);
  if (duplicate) return duplicate;

  const now = new Date().toISOString();
  const job: AutomationScheduledJob = {
    id: makeId('job'),
    jobType: params.jobType,
    idempotencyKey: params.idempotencyKey,
    status: 'pending',
    runAt: params.runAtIso,
    memberId: params.memberId,
    orderId: params.orderId,
    membershipId: params.membershipId,
    broadcastId: params.broadcastId,
    leadId: params.leadId,
    phoneE164: params.phoneE164,
    payload: params.payload || {},
    attempts: 0,
    maxAttempts: params.maxAttempts || 4,
    createdAt: now,
    updatedAt: now,
  };
  saveAutomationJob(job);
  return job;
}

export function cancelScheduledJobs(
  predicate: (job: AutomationScheduledJob) => boolean,
  reason: string
): number {
  const all = readJson<AutomationScheduledJob[]>(AUTOMATION_JOBS_FILE, []);
  let cancelledCount = 0;
  const now = new Date().toISOString();
  for (const job of all) {
    if (job.status === 'pending' && predicate(job)) {
      job.status = 'cancelled';
      job.cancelReason = reason;
      job.updatedAt = now;
      cancelledCount += 1;
      void mirrorDocToFirestoreServer('automationJobs', job.id, {
        ...job,
        createdAtIso: job.createdAt,
        updatedAtIso: job.updatedAt,
      });
    }
  }
  if (cancelledCount > 0) {
    writeJson(AUTOMATION_JOBS_FILE, all);
  }
  return cancelledCount;
}

// --- MEMBERSHIP EXPIRY SCHEDULING HELPER ---
function scheduleExpiryRemindersForMembership(params: {
  memberId: string;
  memberName: string;
  phone?: string;
  membershipId: string;
  planName: string;
  expiresAt: string;
}): void {
  const expMs = Date.parse(params.expiresAt);
  if (Number.isNaN(expMs)) return;

  // Cancel any older pending expiry jobs for this membership first
  cancelScheduledJobs(
    (j) =>
      j.membershipId === params.membershipId &&
      (j.jobType === 'membership_expiry_7d' ||
        j.jobType === 'membership_expiry_3d' ||
        j.jobType === 'membership_expiry_1d' ||
        j.jobType === 'membership_expired'),
    'Rescheduled for updated membership expiration timestamp'
  );

  const phoneE164 = normalizePhoneE164(params.phone) || undefined;
  const now = Date.now();
  const milestones: Array<{ jobType: AutomationJobType; offsetDays: number }> = [
    { jobType: 'membership_expiry_7d', offsetDays: 7 },
    { jobType: 'membership_expiry_3d', offsetDays: 3 },
    { jobType: 'membership_expiry_1d', offsetDays: 1 },
    { jobType: 'membership_expired', offsetDays: 0 },
  ];

  for (const m of milestones) {
    const runAtMs = expMs - m.offsetDays * 24 * 60 * 60 * 1000;
    // Skip milestones already far in the past (> 24h past)
    if (runAtMs < now - 24 * 60 * 60 * 1000) continue;
    scheduleAutomationJob({
      jobType: m.jobType,
      idempotencyKey: `${m.jobType}:${params.membershipId}:${params.expiresAt}`,
      runAtIso: new Date(Math.max(runAtMs, now)).toISOString(),
      memberId: params.memberId,
      membershipId: params.membershipId,
      phoneE164,
      payload: {
        memberName: params.memberName,
        planName: params.planName,
        expiresAt: params.expiresAt,
      },
    });
  }
}

// --- EVENT-DRIVEN AUTOMATION BUS (NEVER THROWS INTO CORE ROUTES) ---
export async function emitAutomationEvent(
  eventType: AutomationEventType,
  payload: Record<string, any>
): Promise<void> {
  try {
    const settings = getAutomationSettings();
    const publicBaseUrl = 'https://feviqo.com';

    switch (eventType) {
      case 'user.registered': {
        const { memberId, fullName, email, phone, consentSource } = payload;
        const phoneE164 = normalizePhoneE164(phone);
        if (phoneE164) {
          const existingPref = getMemberNotificationPreferences({ memberId, phone: phoneE164 });
          if (!existingPref?.optedOut) {
            upsertMemberNotificationPreferences({
              memberId,
              email,
              fullName,
              phone: phoneE164,
              membershipUpdates: true,
              renewalReminders: true,
              newEpisodeAlerts: true,
              promotionalMessages: true,
              optedOut: false,
              source: consentSource || 'registration_form',
            });
          }
        }

        const regMode = getEffectiveSendingMode('registration');
        if (settings.rules.welcomeOnRegister && regMode !== 'disabled') {
          if (regMode === 'manual' || settings.automationRunning) {
            await dispatchTemplateWhatsAppNotification({
              idempotencyKey: `user.registered:${memberId}`,
              eventType: 'user.registered',
              templateName: 'feviqo_welcome',
              bodyParameters: [fullName || 'Member', `${publicBaseUrl}/membership`],
              recipientPhone: phoneE164 || phone,
              recipientName: fullName,
              memberId,
              categoryKey: 'registration',
              manualFallbackSpec: {
                eventType: 'customer_registration',
                customerEmail: email,
              },
              ruleEnabled: settings.rules.welcomeOnRegister,
            });
          } else {
            // Automation bot is STOPPED: queue manual fallback if mode supports it, never drop event silently
            if (regMode === 'automatic_with_fallback') {
              enqueueOneClickWhatsAppNotification({
                idempotencyKey: `fallback:user.registered:${memberId}`,
                eventType: 'customer_registration',
                customerName: fullName || 'Member',
                customerEmail: email,
                memberId,
                rawPhone: phoneE164 || phone,
                bypassCategoryGate: true,
              });
            }
          }
        }

        // Schedule 24h and 72h follow-up reminders for registered customers who never purchased
        const delay24h = Math.max(1, Number(settings.rules.signupNoPackageDelay24hHours) || 24);
        const delay72h = Math.max(delay24h + 1, Number(settings.rules.signupNoPackageDelay72hHours) || 72);
        scheduleAutomationJob({
          jobType: 'signup_no_package_24h',
          idempotencyKey: `signup_no_package_24h:${memberId}`,
          runAtIso: new Date(Date.now() + delay24h * 60 * 60 * 1000).toISOString(),
          memberId,
          phoneE164: phoneE164 || undefined,
          payload: { fullName: fullName || 'Member', email },
        });
        scheduleAutomationJob({
          jobType: 'signup_no_package_72h',
          idempotencyKey: `signup_no_package_72h:${memberId}`,
          runAtIso: new Date(Date.now() + delay72h * 60 * 60 * 1000).toISOString(),
          memberId,
          phoneE164: phoneE164 || undefined,
          payload: { fullName: fullName || 'Member', email },
        });
        break;
      }

      case 'membership.plan_selected':
      case 'membership.payment_pending': {
        const { memberId, fullName, email, phone, orderId, planName, amountDisplay } = payload;
        // User selected a package -> cancel ALL "never purchased" signup follow-ups immediately
        cancelScheduledJobs(
          (j) =>
            j.memberId === memberId &&
            (j.jobType === 'signup_no_package_30m' ||
              j.jobType === 'signup_no_package_24h' ||
              j.jobType === 'signup_no_package_72h'),
          `User selected package (${planName || 'plan'})`
        );

        const delay2hMins = Math.max(5, Number(settings.rules.checkoutAbandonedDelayMinutes) || 120);
        const delay24h = Math.max(2, Number(settings.rules.checkoutAbandonedDelay24hHours) || 24);
        const delay72h = Math.max(delay24h + 1, Number(settings.rules.checkoutAbandonedDelay72hHours) || 72);
        const jobPayload = {
          fullName: fullName || 'Member',
          email,
          planName: planName || 'Premium',
          amountDisplay: amountDisplay || '',
          orderId,
        };
        const phoneE164 = normalizePhoneE164(phone) || undefined;

        scheduleAutomationJob({
          jobType: 'checkout_abandoned_reminder',
          idempotencyKey: `checkout_abandoned_2h:${orderId}`,
          runAtIso: new Date(Date.now() + delay2hMins * 60 * 1000).toISOString(),
          memberId,
          orderId,
          phoneE164,
          payload: jobPayload,
        });
        scheduleAutomationJob({
          jobType: 'checkout_abandoned_24h',
          idempotencyKey: `checkout_abandoned_24h:${orderId}`,
          runAtIso: new Date(Date.now() + delay24h * 60 * 60 * 1000).toISOString(),
          memberId,
          orderId,
          phoneE164,
          payload: jobPayload,
        });
        scheduleAutomationJob({
          jobType: 'checkout_abandoned_72h',
          idempotencyKey: `checkout_abandoned_72h:${orderId}`,
          runAtIso: new Date(Date.now() + delay72h * 60 * 60 * 1000).toISOString(),
          memberId,
          orderId,
          phoneE164,
          payload: jobPayload,
        });
        break;
      }

      case 'membership.proof_submitted': {
        const { memberId, fullName, email, phone, orderId, planName, amountDisplay } = payload;
        // Stop all unpaid reminders immediately upon payment proof submission
        cancelScheduledJobs(
          (j) =>
            (j.orderId === orderId || j.memberId === memberId) &&
            (j.jobType === 'checkout_abandoned_reminder' ||
              j.jobType === 'checkout_abandoned_24h' ||
              j.jobType === 'checkout_abandoned_72h' ||
              j.jobType === 'signup_no_package_30m' ||
              j.jobType === 'signup_no_package_24h' ||
              j.jobType === 'signup_no_package_72h'),
          `Payment proof submitted for order ${orderId}`
        );

        const payMode = getEffectiveSendingMode('payment');
        if (settings.rules.paymentProofReceived && payMode !== 'disabled') {
          if (payMode === 'manual' || settings.automationRunning) {
            await dispatchTemplateWhatsAppNotification({
              idempotencyKey: `membership.proof_submitted:${orderId}:${payload.proofSubmittedAt || '1'}`,
              eventType: 'membership.proof_submitted',
              templateName: 'feviqo_payment_received',
              bodyParameters: [fullName || 'Member', planName || 'Premium', orderId || ''],
              recipientPhone: phone,
              recipientName: fullName,
              memberId,
              categoryKey: 'payment',
              manualFallbackSpec: {
                eventType: 'payment_submitted',
                customerEmail: email,
                orderId,
                planName,
                amountDisplay,
              },
              ruleEnabled: settings.rules.paymentProofReceived,
            });
          } else if (payMode === 'automatic_with_fallback') {
            enqueueOneClickWhatsAppNotification({
              idempotencyKey: `fallback:membership.proof_submitted:${orderId}`,
              eventType: 'payment_submitted',
              customerName: fullName || 'Member',
              customerEmail: email,
              memberId,
              orderId,
              planName,
              amountDisplay,
              rawPhone: phone,
              bypassCategoryGate: true,
            });
          }
        }
        break;
      }

      case 'membership.approved': {
        const {
          memberId,
          fullName,
          email,
          phone,
          orderId,
          membershipId,
          planName,
          amountDisplay,
          dramaTitles,
          activatedAt,
          expiresAt,
          wasRenewal,
        } = payload;

        cancelScheduledJobs(
          (j) =>
            (j.orderId === orderId || j.memberId === memberId) &&
            (j.jobType === 'checkout_abandoned_reminder' ||
              j.jobType === 'checkout_abandoned_24h' ||
              j.jobType === 'checkout_abandoned_72h' ||
              j.jobType === 'signup_no_package_30m' ||
              j.jobType === 'signup_no_package_24h' ||
              j.jobType === 'signup_no_package_72h'),
          `Payment approved for order ${orderId}`
        );

        const actMode = getEffectiveSendingMode('activation');
        const manualEventType: OneClickEventType = wasRenewal ? 'membership_renewed' : 'payment_approved';
        if (settings.rules.paymentApproved && actMode !== 'disabled') {
          if (actMode === 'manual' || settings.automationRunning) {
            await dispatchTemplateWhatsAppNotification({
              idempotencyKey: `membership.approved:${orderId || membershipId}:${expiresAt || '1'}`,
              eventType: wasRenewal ? 'membership.renewed' : 'membership.approved',
              templateName: 'feviqo_membership_activated',
              bodyParameters: [
                fullName || 'Member',
                planName || 'Premium',
                dramaTitles || 'FEVIQO Urdu Dramas',
                formatReadableDate(activatedAt || new Date().toISOString()),
                formatReadableDate(expiresAt || ''),
                `${publicBaseUrl}/account`,
              ],
              recipientPhone: phone,
              recipientName: fullName,
              memberId,
              categoryKey: 'activation',
              manualFallbackSpec: {
                eventType: manualEventType,
                customerEmail: email,
                membershipId,
                orderId,
                planName,
                amountDisplay,
                startDate: activatedAt,
                expiryDate: expiresAt,
              },
              ruleEnabled: settings.rules.paymentApproved,
            });
          } else if (actMode === 'automatic_with_fallback') {
            enqueueOneClickWhatsAppNotification({
              idempotencyKey: `fallback:membership.approved:${orderId || membershipId}`,
              eventType: manualEventType,
              customerName: fullName || 'Member',
              customerEmail: email,
              memberId,
              membershipId,
              orderId,
              planName,
              amountDisplay,
              startDate: activatedAt,
              expiryDate: expiresAt,
              rawPhone: phone,
              bypassCategoryGate: true,
            });
          }
        }

        if (membershipId && expiresAt) {
          scheduleExpiryRemindersForMembership({
            memberId,
            memberName: fullName || 'Member',
            phone,
            membershipId,
            planName: planName || 'Premium',
            expiresAt,
          });
        }
        break;
      }

      case 'membership.rejected': {
        const { memberId, fullName, email, phone, orderId, rejectionReason } = payload;
        // NEVER invent a rejection reason
        const actualReason = String(rejectionReason || '').trim();
        if (!actualReason) break;

        const rejMode = getEffectiveSendingMode('rejection');
        if (settings.rules.paymentRejected && rejMode !== 'disabled') {
          if (rejMode === 'manual' || settings.automationRunning) {
            await dispatchTemplateWhatsAppNotification({
              idempotencyKey: `membership.rejected:${orderId}:${payload.reviewedAt || '1'}`,
              eventType: 'membership.rejected',
              templateName: 'feviqo_payment_rejected',
              bodyParameters: [
                fullName || 'Member',
                orderId || '',
                actualReason,
                `${publicBaseUrl}/account`,
              ],
              recipientPhone: phone,
              recipientName: fullName,
              memberId,
              categoryKey: 'rejection',
              manualFallbackSpec: {
                eventType: 'payment_rejected',
                customerEmail: email,
                orderId,
                rejectionReason: actualReason,
              },
              ruleEnabled: settings.rules.paymentRejected,
            });
          } else if (rejMode === 'automatic_with_fallback') {
            enqueueOneClickWhatsAppNotification({
              idempotencyKey: `fallback:membership.rejected:${orderId}`,
              eventType: 'payment_rejected',
              customerName: fullName || 'Member',
              customerEmail: email,
              memberId,
              orderId,
              rejectionReason: actualReason,
              rawPhone: phone,
              bypassCategoryGate: true,
            });
          }
        }
        break;
      }

      case 'membership.cancelled':
      case 'membership.revoked': {
        const { membershipId } = payload;
        if (membershipId) {
          cancelScheduledJobs(
            (j) =>
              j.membershipId === membershipId &&
              (j.jobType === 'membership_expiry_7d' ||
                j.jobType === 'membership_expiry_3d' ||
                j.jobType === 'membership_expiry_1d' ||
                j.jobType === 'membership_expired'),
            `Membership ${eventType}`
          );
        }
        break;
      }

      case 'account.security_alert': {
        // Strictly sanitized summary — NEVER includes passwords, app passwords, or secret tokens
        const { memberId, fullName, email, phone, summary } = payload;
        const cleanSummary =
          String(summary || 'A security or password update was performed on your FEVIQO account.')
            .replace(/(password|token|secret|key)\s*[:=]\s*\S+/gi, '$1: [REDACTED]')
            .slice(0, 260);

        if (memberId) {
          createCustomerNotificationRecord({
            memberId,
            customerEmail: email,
            type: 'security_alert',
            title: 'FEVIQO Account Security Notice',
            message: cleanSummary,
            ctaLabel: 'Review Account Security',
            ctaHref: '/account',
            dedupeKey: `security_alert:${memberId}:${Date.now().toString(36)}`,
            emailStatus: 'not_sent',
          });
        }

        const secMode = getEffectiveSendingMode('security');
        if (settings.rules.accountSecurityAlerts && secMode !== 'disabled' && phone) {
          if (secMode === 'manual' || settings.automationRunning) {
            await dispatchTemplateWhatsAppNotification({
              idempotencyKey: `account.security_alert:${memberId || phone}:${Date.now().toString(36)}`,
              eventType: 'account.security_alert',
              templateName: 'feviqo_account_security',
              bodyParameters: [fullName || 'Member', cleanSummary, `${publicBaseUrl}/account`],
              recipientPhone: phone,
              recipientName: fullName,
              memberId,
              categoryKey: 'security',
              manualFallbackSpec: {
                eventType: 'account_security_alert',
                customerEmail: email,
                securityEventSummary: cleanSummary,
              },
              ruleEnabled: settings.rules.accountSecurityAlerts,
            });
          }
        }
        break;
      }

      case 'lead.created': {
        const lead = payload.lead as VideoEditingLead | undefined;
        if (!lead) break;

        if (lead.whatsappConsent && lead.whatsappE164) {
          const leadMode = getEffectiveSendingMode('creative_enquiries');
          if (leadMode === 'manual' || settings.automationRunning) {
            await dispatchTemplateWhatsAppNotification({
              idempotencyKey: `lead.created:${lead.id}`,
              eventType: 'lead.created',
              templateName: 'feviqo_lead_received',
              bodyParameters: [
                lead.fullName || 'there',
                lead.editingService || 'Video Editing Services',
              ],
              recipientPhone: lead.whatsappE164,
              recipientName: lead.fullName,
              leadId: lead.id,
              categoryKey: 'creative_enquiries',
              manualFallbackSpec: {
                eventType: 'creative_enquiry',
                customerEmail: lead.email,
                serviceName: lead.editingService,
              },
              ruleEnabled: settings.rules.leadImmediateAcknowledgement,
              explicitLeadConsent: true,
            });
          } else if (leadMode === 'automatic_with_fallback') {
            enqueueOneClickWhatsAppNotification({
              idempotencyKey: `fallback:lead.created:${lead.id}`,
              eventType: 'creative_enquiry',
              customerName: lead.fullName || 'there',
              customerEmail: lead.email,
              leadId: lead.id,
              rawPhone: lead.whatsappE164,
              serviceName: lead.editingService,
              explicitLeadConsent: true,
              bypassCategoryGate: true,
            });
          }

          if (settings.rules.leadFollowUpNoResponse) {
            const hrs = Math.max(1, Number(settings.rules.leadFollowUpNoResponseHours) || 24);
            scheduleAutomationJob({
              jobType: 'lead_followup_no_reply',
              idempotencyKey: `lead_followup_no_reply:${lead.id}`,
              runAtIso: new Date(Date.now() + hrs * 60 * 60 * 1000).toISOString(),
              leadId: lead.id,
              phoneE164: lead.whatsappE164,
              payload: {
                fullName: lead.fullName,
                editingService: lead.editingService,
              },
            });
          }
        }
        break;
      }

      case 'lead.quote_sent': {
        const lead = payload.lead as VideoEditingLead | undefined;
        if (!lead || !lead.whatsappConsent || !lead.whatsappE164) break;
        if (settings.rules.leadFollowUpQuoteNotAccepted) {
          const hrs = Math.max(1, Number(settings.rules.leadFollowUpQuoteHours) || 48);
          scheduleAutomationJob({
            jobType: 'lead_followup_quote',
            idempotencyKey: `lead_followup_quote:${lead.id}:${Date.now()}`,
            runAtIso: new Date(Date.now() + hrs * 60 * 60 * 1000).toISOString(),
            leadId: lead.id,
            phoneE164: lead.whatsappE164,
            payload: {
              fullName: lead.fullName,
              editingService: lead.editingService,
            },
          });
        }
        break;
      }

      case 'lead.booked': {
        const lead = payload.lead as VideoEditingLead | undefined;
        if (!lead) break;
        cancelScheduledJobs(
          (j) => j.leadId === lead.id,
          'Lead booked a consultation — follow-ups stopped'
        );
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.warn(`[AutomationBus] Non-fatal error handling ${eventType}:`, err);
  }
}

// --- EPISODE PUBLISHING BROADCAST ENGINE (FREE & PREMIUM) ---
export function listEpisodeBroadcasts(limit = 100): EpisodeBroadcastRecord[] {
  return readJson<EpisodeBroadcastRecord[]>(EPISODE_BROADCASTS_FILE, []).slice(0, limit);
}

function saveEpisodeBroadcastRecord(record: EpisodeBroadcastRecord): void {
  const all = readJson<EpisodeBroadcastRecord[]>(EPISODE_BROADCASTS_FILE, []);
  const idx = all.findIndex((b) => b.id === record.id);
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.unshift(record);
  }
  writeJson(EPISODE_BROADCASTS_FILE, all.slice(0, 500));
  void mirrorDocToFirestoreServer('episodeBroadcasts', record.id, {
    ...record,
    createdAtIso: record.createdAt,
    updatedAtIso: record.updatedAt || record.createdAt,
  });
}

function getBlockedLookupSets(): { emails: Set<string>; phones: Set<string> } {
  const blocked = listBlockedUsers();
  const emails = new Set(blocked.map((b) => String(b.email || '').trim().toLowerCase()).filter(Boolean));
  const phones = new Set<string>();
  for (const b of blocked) {
    if (b.phoneNormalized) phones.add(normalizeBlockedPhone(b.phoneNormalized));
    if (b.phone) phones.add(normalizeBlockedPhone(b.phone));
    for (const p of b.additionalPhones || []) {
      const n = normalizeBlockedPhone(p);
      if (n) phones.add(n);
    }
  }
  return { emails, phones };
}

function maskPhoneForDisplay(phone?: string): string {
  const clean = String(phone || '').trim();
  if (!clean) return 'Missing';
  if (clean.length <= 6) return clean;
  return `${clean.slice(0, 4)}••••${clean.slice(-3)}`;
}

export interface EpisodeAudienceRecipientPreview {
  memberId: string;
  ownerUid?: string;
  memberName: string;
  fullName: string;
  email: string;
  rawPhone: string;
  phone: string;
  phoneE164?: string;
  maskedPhone: string;
  phoneValid: boolean;
  phoneSource: string;
  phoneSourceLabel: string;
  phoneVerified: boolean;
  phoneError?: string;
  planId: string;
  planName: string;
  membershipStatus: string;
  entitledForDrama: boolean;
  hasConsent: boolean;
  whatsappOptedIn: boolean;
  optedOut: boolean;
  whatsappOptedOut: boolean;
  alreadyNotified: boolean;
  eligibleForWhatsapp: boolean;
  eligibleForAutomatic: boolean;
  eligibleForManual: boolean;
  skipReason?: string;
  exclusionReason?: string;
}

export interface EpisodeAudiencePreviewResult {
  dramaId: string;
  dramaTitle: string;
  accessType: 'free' | 'premium';
  episodeSlug?: string;
  totalRegistered: number;
  totalRegisteredNonBlocked: number;
  blockedCount: number;
  activePaidMembersCount: number;
  totalMatchingCustomers: number;
  audiencePoolCount: number;
  entitledActiveCount: number;
  consentedCount: number;
  eligibleWhatsappCount: number;
  eligibleAutomaticCount: number;
  eligibleManualCount: number;
  inAppEligibleCount: number;
  noPermissionCount: number;
  missingConsentCount: number;
  optedOutCount: number;
  missingPhoneCount: number;
  invalidPhoneCount: number;
  unentitledCount: number;
  inactiveOrExpiredCount: number;
  alreadyNotifiedCount: number;
  optedOutOrNoConsentCount: number;
  alreadyBroadcastSlugs: string[];
  recipients: EpisodeAudienceRecipientPreview[];
}

export function previewEpisodeNotificationAudience(
  dramaId: string,
  options?: {
    accessType?: 'free' | 'premium';
    episodeSlug?: string;
    firebaseAuthLookup?: FirebaseAuthPhoneLookup | null;
  }
): EpisodeAudiencePreviewResult {
  const drama = getDramaById(dramaId);
  const accessType: 'free' | 'premium' = options?.accessType === 'free' ? 'free' : 'premium';
  const { members, memberships, orders } = getAutomationMembershipSnapshot();
  const preferences = listAllNotificationPreferences();
  const blockedSets = getBlockedLookupSets();

  const resolveForMember = (m: (typeof members)[number]) => {
    const emailLower = String(m.email || '').trim().toLowerCase();
    const pref =
      preferences.find(
        (p) =>
          (p.memberId && p.memberId === m.id) ||
          (m.ownerUid && p.ownerUid && p.ownerUid === m.ownerUid) ||
          (emailLower && p.email && p.email.trim().toLowerCase() === emailLower)
      ) || null;
    return resolveCustomerWhatsAppContact({
      member: m,
      preference: pref,
      memberships,
      orders,
      firebaseAuthLookup: options?.firebaseAuthLookup || null,
    });
  };

  const isBlocked = (email?: string, phone?: string) => {
    const e = String(email || '').trim().toLowerCase();
    const p = normalizeBlockedPhone(phone);
    return (Boolean(e) && blockedSets.emails.has(e)) || (Boolean(p) && blockedSets.phones.has(p));
  };

  const nonBlockedMembers = members.filter((m) => {
    const contact = resolveForMember(m);
    return !isBlocked(m.email, contact.phoneE164 || m.phone);
  });
  const blockedCount = Math.max(0, members.length - nonBlockedMembers.length);

  const entitledPairs = getEntitledActiveMembersForDrama(dramaId).filter(({ member }) => {
    const contact = resolveForMember(member);
    return !isBlocked(member.email, contact.phoneE164 || member.phone);
  });
  const entitledByMemberId = new Map(entitledPairs.map((pair) => [pair.member.id, pair]));

  const priorBroadcasts = listEpisodeBroadcasts(200).filter((b) => b.dramaId === dramaId);
  const alreadyNotifiedMemberIds = new Set<string>();
  if (options?.episodeSlug) {
    const cleanSlug = options.episodeSlug.trim();
    for (const b of priorBroadcasts.filter((x) => x.episodeSlug === cleanSlug)) {
      for (const r of b.recipients || []) {
        if (
          r.status === 'api_accepted' ||
          r.status === 'sent' ||
          r.status === 'delivered' ||
          r.status === 'read' ||
          r.status === 'confirmed_sent'
        ) {
          alreadyNotifiedMemberIds.add(r.memberId);
        }
      }
    }
  }

  const nowMs = Date.now();
  const activePaidMemberIds = new Set(
    memberships
      .filter((s) => s.status === 'active' && Date.parse(s.expiresAt) > nowMs)
      .map((s) => s.memberId)
  );
  const activePaidMembersCount = nonBlockedMembers.filter((m) =>
    activePaidMemberIds.has(m.id)
  ).length;

  let inactiveOrExpiredCount = 0;
  let unentitledCount = 0;

  if (accessType === 'premium') {
    for (const m of nonBlockedMembers) {
      if (entitledByMemberId.has(m.id)) continue;
      if (activePaidMemberIds.has(m.id)) {
        unentitledCount += 1;
      } else {
        inactiveOrExpiredCount += 1;
      }
    }
  }

  const candidateList: Array<{
    member: (typeof nonBlockedMembers)[number];
    planId: string;
    planName: string;
    membershipStatus: string;
    entitledForDrama: boolean;
  }> =
    accessType === 'free'
      ? nonBlockedMembers.map((m) => {
          const activeSub = memberships.find(
            (s) => s.memberId === m.id && s.status === 'active' && Date.parse(s.expiresAt) > nowMs
          );
          return {
            member: m,
            planId: activeSub?.planId || 'free_registered',
            planName: activeSub?.planName || 'Registered (Free)',
            membershipStatus: activeSub ? 'active' : 'free_registered',
            entitledForDrama: true,
          };
        })
      : entitledPairs.map(({ member, membership }) => ({
          member,
          planId: membership.planId,
          planName: membership.planName,
          membershipStatus: 'active',
          entitledForDrama: true,
        }));

  let eligibleWhatsappCount = 0;
  let eligibleManualCount = 0;
  let noPermissionCount = 0;
  let optedOutCount = 0;
  let missingPhoneCount = 0;
  let invalidPhoneCount = 0;
  let alreadyNotifiedCount = 0;
  const recipients: EpisodeAudienceRecipientPreview[] = [];

  for (const item of candidateList) {
    const contact = resolveForMember(item.member);
    const consent = checkConsentForCategory({
      memberId: item.member.id,
      phone: contact.phoneValid ? contact.phoneE164 : item.member.phone,
      category: 'newEpisodeAlerts',
    });
    const alreadyNotified = alreadyNotifiedMemberIds.has(item.member.id);
    if (alreadyNotified) alreadyNotifiedCount += 1;

    let exclusionReason: string | undefined;
    let eligibleForAutomatic = false;
    let eligibleForManual = false;

    if (!contact.phoneValid) {
      if (contact.rawPhone) {
        invalidPhoneCount += 1;
        exclusionReason = contact.phoneError || 'Invalid WhatsApp phone number';
      } else {
        missingPhoneCount += 1;
        exclusionReason = 'Phone number required';
      }
    } else if (consent.reason === 'opted_out' || contact.optedOut) {
      optedOutCount += 1;
      exclusionReason = 'Customer opted out (STOP)';
    } else if (!consent.allowed) {
      noPermissionCount += 1;
      eligibleForManual = true;
      eligibleManualCount += 1;
      exclusionReason = 'No WhatsApp episode-alert opt-in recorded (In-App / Manual fallback available)';
    } else {
      eligibleForAutomatic = true;
      eligibleForManual = true;
      eligibleWhatsappCount += 1;
      eligibleManualCount += 1;
    }

    const displayName = item.member.fullName || 'FEVIQO Member';
    recipients.push({
      memberId: item.member.id,
      ownerUid: item.member.ownerUid,
      memberName: displayName,
      fullName: displayName,
      email: item.member.email,
      rawPhone: contact.rawPhone || '',
      phone: contact.phoneValid ? contact.phoneE164 : contact.rawPhone || '',
      phoneE164: contact.phoneValid ? contact.phoneE164 : undefined,
      maskedPhone: maskPhoneForDisplay(contact.phoneValid ? contact.phoneE164 : contact.rawPhone),
      phoneValid: contact.phoneValid,
      phoneSource: contact.phoneSource,
      phoneSourceLabel: contact.phoneSourceLabel,
      phoneVerified: contact.phoneVerified,
      phoneError: contact.phoneValid ? undefined : contact.phoneError,
      planId: item.planId,
      planName: item.planName,
      membershipStatus: item.membershipStatus,
      entitledForDrama: item.entitledForDrama,
      hasConsent: consent.allowed,
      whatsappOptedIn: consent.allowed,
      optedOut: consent.reason === 'opted_out' || contact.optedOut,
      whatsappOptedOut: consent.reason === 'opted_out' || contact.optedOut,
      alreadyNotified,
      eligibleForWhatsapp: eligibleForAutomatic,
      eligibleForAutomatic,
      eligibleForManual,
      skipReason: exclusionReason,
      exclusionReason,
    });
  }

  return {
    dramaId,
    dramaTitle: drama?.title || dramaId,
    accessType,
    episodeSlug: options?.episodeSlug,
    totalRegistered: members.length,
    totalRegisteredNonBlocked: nonBlockedMembers.length,
    blockedCount,
    activePaidMembersCount,
    totalMatchingCustomers: candidateList.length,
    audiencePoolCount: candidateList.length,
    entitledActiveCount: entitledPairs.length,
    consentedCount: eligibleWhatsappCount,
    eligibleWhatsappCount,
    eligibleAutomaticCount: eligibleWhatsappCount,
    eligibleManualCount,
    inAppEligibleCount: candidateList.length,
    noPermissionCount,
    missingConsentCount: noPermissionCount,
    optedOutCount,
    missingPhoneCount,
    invalidPhoneCount: missingPhoneCount + invalidPhoneCount,
    unentitledCount,
    inactiveOrExpiredCount,
    alreadyNotifiedCount,
    optedOutOrNoConsentCount: Math.max(0, candidateList.length - eligibleWhatsappCount),
    alreadyBroadcastSlugs: Array.from(new Set(priorBroadcasts.map((b) => b.episodeSlug))),
    recipients,
  };
}

function recomputeEpisodeBroadcastCounters(broadcast: EpisodeBroadcastRecord): EpisodeBroadcastRecord {
  let apiAcceptedCount = 0;
  let sentCount = 0;
  let deliveredCount = 0;
  let readCount = 0;
  let manualQueuedCount = 0;
  let inAppNotifiedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  let pendingOrProcessing = 0;

  const breakdown = {
    noPermission: 0,
    optedOut: 0,
    invalidPhone: 0,
    templateUnapproved: 0,
    ruleDisabled: 0,
    unentitled: 0,
  };

  for (const r of broadcast.recipients) {
    if (r.inAppNotified) inAppNotifiedCount += 1;
    if (r.manualNotificationId) manualQueuedCount += 1;

    switch (r.status) {
      case 'api_accepted':
        apiAcceptedCount += 1;
        break;
      case 'sent':
        sentCount += 1;
        break;
      case 'delivered':
        deliveredCount += 1;
        break;
      case 'read':
        readCount += 1;
        break;
      case 'confirmed_sent':
        sentCount += 1;
        break;
      case 'queued':
      case 'processing':
      case 'opened':
        pendingOrProcessing += 1;
        break;
      case 'failed':
      case 'not_configured':
        failedCount += 1;
        break;
      case 'skipped_no_consent':
        skippedCount += 1;
        if ((r.error || '').toLowerCase().includes('phone')) breakdown.invalidPhone += 1;
        else breakdown.noPermission += 1;
        break;
      case 'skipped_opted_out':
        skippedCount += 1;
        breakdown.optedOut += 1;
        break;
      case 'skipped_template_unapproved':
        skippedCount += 1;
        breakdown.templateUnapproved += 1;
        break;
      case 'skipped_rule_disabled':
        skippedCount += 1;
        breakdown.ruleDisabled += 1;
        break;
      case 'skipped_not_entitled':
        skippedCount += 1;
        breakdown.unentitled += 1;
        break;
      default:
        skippedCount += 1;
        break;
    }
  }

  const totalSuccessfulDispatches = apiAcceptedCount + sentCount + deliveredCount + readCount;
  let broadcastStatus: EpisodeBroadcastStatus = 'completed';

  if (broadcast.totalMatchingCount === 0 || (broadcast.eligibleWhatsappCount === 0 && manualQueuedCount === 0)) {
    broadcastStatus = 'no_eligible_recipients';
  } else if (pendingOrProcessing > 0 && totalSuccessfulDispatches === 0 && manualQueuedCount === 0) {
    const settings = getAutomationSettings();
    broadcastStatus = settings.automationRunning ? 'processing' : 'queued_waiting_start';
  } else if (totalSuccessfulDispatches === 0 && manualQueuedCount > 0 && broadcast.sendingMode === 'manual') {
    broadcastStatus = 'completed';
  } else if (totalSuccessfulDispatches === 0 && failedCount > 0) {
    broadcastStatus = 'failed';
  } else if (totalSuccessfulDispatches === 0 && skippedCount > 0 && manualQueuedCount === 0) {
    broadcastStatus = 'no_eligible_recipients';
  } else if (failedCount > 0 || skippedCount > 0 || pendingOrProcessing > 0) {
    broadcastStatus = totalSuccessfulDispatches > 0 || manualQueuedCount > 0 ? 'partially_completed' : 'failed';
  }

  let diagnosticSummary = '';
  if (broadcastStatus === 'queued_waiting_start') {
    diagnosticSummary = `Automation Bot is currently STOPPED. ${pendingOrProcessing} eligible recipient job(s) are queued and paused. Click START AUTOMATION to dispatch via Meta Cloud API, or use Manual WhatsApp Sending.`;
  } else if (totalSuccessfulDispatches === 0 && manualQueuedCount === 0) {
    const reasons: string[] = [];
    if (breakdown.noPermission > 0) reasons.push(`${breakdown.noPermission} missing WhatsApp opt-in`);
    if (breakdown.invalidPhone > 0) reasons.push(`${breakdown.invalidPhone} invalid/missing phone`);
    if (breakdown.optedOut > 0) reasons.push(`${breakdown.optedOut} opted out (STOP)`);
    if (breakdown.templateUnapproved > 0) reasons.push(`${breakdown.templateUnapproved} blocked by unapproved template status`);
    if (failedCount > 0) reasons.push(`${failedCount} Meta API error(s)`);
    diagnosticSummary = `No WhatsApp messages were sent. ${reasons.length > 0 ? `Reasons: ${reasons.join(', ')}.` : 'Review recipient eligibility, permission records, sending mode, and Meta API response.'}${inAppNotifiedCount > 0 ? ` (${inAppNotifiedCount} in-app notification(s) delivered to customer accounts.)` : ''}`;
  } else if (broadcast.sendingMode === 'manual') {
    diagnosticSummary = `${manualQueuedCount} personalized WhatsApp message(s) prepared in Manual WhatsApp Center (ready for 1-click Send on WhatsApp).`;
  } else {
    diagnosticSummary = `Meta Cloud API accepted ${totalSuccessfulDispatches} message(s) (Delivered: ${deliveredCount}, Read: ${readCount}, Failed: ${failedCount}, Skipped: ${skippedCount}${manualQueuedCount > 0 ? `, Manual Fallback Queued: ${manualQueuedCount}` : ''}${inAppNotifiedCount > 0 ? `, In-App Notified: ${inAppNotifiedCount}` : ''}).`;
  }

  broadcast.apiAcceptedCount = apiAcceptedCount;
  broadcast.sentCount = sentCount;
  broadcast.deliveredCount = deliveredCount;
  broadcast.readCount = readCount;
  broadcast.manualQueuedCount = manualQueuedCount;
  broadcast.inAppNotifiedCount = inAppNotifiedCount;
  broadcast.failedCount = failedCount;
  broadcast.skippedCount = skippedCount;
  broadcast.skippedBreakdown = breakdown;
  broadcast.broadcastStatus = broadcastStatus;
  broadcast.diagnosticSummary = diagnosticSummary;
  broadcast.updatedAt = new Date().toISOString();
  return broadcast;
}

export async function triggerEpisodePublishedBroadcast(params: {
  dramaId: string;
  episodeSlug: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  episodeUrl?: string;
  accessType?: 'free' | 'premium';
  sendingMode?: WhatsAppSendingMode;
  selectedMemberIds?: string[];
  sendInAppFallback?: boolean;
  startAutomationIfStopped?: boolean;
  adminEmail: string;
  adminId?: string;
  forceResend?: boolean;
}): Promise<
  | { ok: true; broadcast: EpisodeBroadcastRecord }
  | { ok: false; error: string; duplicate?: boolean; existingBroadcast?: EpisodeBroadcastRecord }
> {
  const drama = getDramaById(params.dramaId);
  if (!drama) {
    return { ok: false, error: `Unknown drama ID: ${params.dramaId}` };
  }

  const cleanSlug = String(params.episodeSlug || `episode-${params.episodeNumber}`).trim();
  const matchedCatalogEp = drama.episodes.find((ep) => ep.slug === cleanSlug);
  const accessType: 'free' | 'premium' =
    params.accessType === 'free' || params.accessType === 'premium'
      ? params.accessType
      : matchedCatalogEp?.accessType === 'free'
      ? 'free'
      : 'premium';

  const broadcastKey = `${drama.id}:${cleanSlug}`;
  const allBroadcasts = readJson<EpisodeBroadcastRecord[]>(EPISODE_BROADCASTS_FILE, []);
  const existing = allBroadcasts.find((b) => b.broadcastKey === broadcastKey);

  if (existing && !params.forceResend) {
    return {
      ok: false,
      duplicate: true,
      existingBroadcast: existing,
      error: `Notifications for ${drama.title} (${cleanSlug}) were already triggered on ${existing.createdAt}. Use the deliberate Resend option if you intend to notify subscribers again.`,
    };
  }

  if (params.startAutomationIfStopped && !getAutomationSettings().automationRunning) {
    saveAutomationSettings(
      {
        automationRunning: true,
        automationStartedAt: new Date().toISOString(),
        automationToggledBy: params.adminEmail,
        rules: { masterEnabled: true },
      },
      params.adminId ? { id: params.adminId, email: params.adminEmail } : undefined
    );
  }

  const settings = getAutomationSettings();
  const effectiveMode = getEffectiveSendingMode('episodes', params.sendingMode);
  const episodeUrl =
    params.episodeUrl || `https://feviqo.com${drama.hubPath.replace(/\/+$/, '')}/${cleanSlug}`;
  const resendSuffix = params.forceResend ? `:resend:${Date.now()}` : '';
  const broadcastId = makeId('epcast');

  const audience = previewEpisodeNotificationAudience(drama.id, {
    accessType,
    episodeSlug: cleanSlug,
  });

  let targetRecipients = audience.recipients;
  if (Array.isArray(params.selectedMemberIds) && params.selectedMemberIds.length > 0) {
    const selectedSet = new Set(params.selectedMemberIds);
    targetRecipients = targetRecipients.filter((r) => selectedSet.has(r.memberId));
  }

  const recipients: EpisodeBroadcastRecipient[] = [];
  const shouldSendInApp = params.sendInAppFallback !== false;
  const nowIso = new Date().toISOString();
  const queuedJobIds: string[] = [];

  for (const rec of targetRecipients) {
    let inAppNotified = false;

    // Alternative permitted channel: in-app notification for entitled/registered users (especially when WhatsApp is unavailable)
    if (shouldSendInApp) {
      const inAppRes = createCustomerNotificationRecord({
        memberId: rec.memberId,
        customerEmail: rec.email,
        dramaIds: [drama.id],
        type: 'episode_published',
        title: `New Urdu Episode: ${drama.title} Ep ${params.episodeNumber}`,
        message: `${params.episodeTitle || `${drama.title} Episode ${params.episodeNumber}`} (${accessType === 'free' ? 'Free' : 'Premium'}) is now live on FEVIQO.`,
        ctaLabel: 'Watch Episode',
        ctaHref: `${drama.hubPath.replace(/\/+$/, '')}/${cleanSlug}`,
        dedupeKey: `ep_inapp:${broadcastKey}:${rec.memberId}${resendSuffix}`,
        emailStatus: 'not_sent',
      });
      inAppNotified = inAppRes.created || Boolean(inAppRes.notification);
    }

    if (effectiveMode === 'disabled') {
      recipients.push({
        memberId: rec.memberId,
        memberName: rec.fullName,
        phoneE164: rec.phone || 'missing',
        planId: rec.planId,
        sendingMethod: inAppNotified ? 'in_app' : 'skipped',
        status: 'skipped_rule_disabled',
        inAppNotified,
        error: 'Episode WhatsApp sending mode is set to Disabled.',
      });
      continue;
    }

    // Manual mode: works independently even if automation bot is stopped or Meta API is down
    if (effectiveMode === 'manual') {
      if (rec.optedOut) {
        recipients.push({
          memberId: rec.memberId,
          memberName: rec.fullName,
          phoneE164: rec.phone || 'missing',
          planId: rec.planId,
          sendingMethod: inAppNotified ? 'in_app' : 'skipped',
          status: 'skipped_opted_out',
          inAppNotified,
          error: 'Customer opted out (STOP).',
        });
        continue;
      }
      const qRes = enqueueOneClickWhatsAppNotification({
        idempotencyKey: `episode.published:${broadcastKey}:${rec.memberId}${resendSuffix}`,
        eventType: 'episode_published',
        customerName: rec.fullName,
        customerEmail: rec.email,
        memberId: rec.memberId,
        dramaId: drama.id,
        episodeSlug: cleanSlug,
        rawPhone: rec.phone,
        seriesName: drama.title,
        episodeNumber: params.episodeNumber,
        episodeLink: episodeUrl,
        accessType,
        bypassConsentCheck: true,
        bypassCategoryGate: true,
      });
      if (qRes.ok) {
        recipients.push({
          memberId: rec.memberId,
          memberName: rec.fullName,
          phoneE164: qRes.notification.recipientPhone,
          planId: rec.planId,
          sendingMethod: 'manual_whatsapp',
          status: qRes.notification.status === 'failed' ? 'failed' : 'queued',
          manualNotificationId: qRes.notification.id,
          inAppNotified,
          error: qRes.notification.failureReason,
        });
      } else {
        const skipReason = 'reason' in qRes ? qRes.reason : 'Skipped by WhatsApp queue.';
        recipients.push({
          memberId: rec.memberId,
          memberName: rec.fullName,
          phoneE164: rec.phone || 'missing',
          planId: rec.planId,
          sendingMethod: inAppNotified ? 'in_app' : 'skipped',
          status: 'skipped_no_consent',
          inAppNotified,
          error: skipReason,
        });
      }
      continue;
    }

    // Automatic or Automatic + Manual Fallback: respect consent & phone validity honestly
    if (!rec.phoneValid) {
      recipients.push({
        memberId: rec.memberId,
        memberName: rec.fullName,
        phoneE164: rec.phone || 'missing',
        planId: rec.planId,
        sendingMethod: inAppNotified ? 'in_app' : 'skipped',
        status: 'skipped_no_consent',
        inAppNotified,
        error: rec.phoneError || 'Valid E.164 WhatsApp phone number not on file.',
      });
      continue;
    }

    if (rec.optedOut) {
      recipients.push({
        memberId: rec.memberId,
        memberName: rec.fullName,
        phoneE164: rec.phone,
        planId: rec.planId,
        sendingMethod: inAppNotified ? 'in_app' : 'skipped',
        status: 'skipped_opted_out',
        inAppNotified,
        error: 'Customer opted out of WhatsApp messages (STOP).',
      });
      continue;
    }

    if (!rec.hasConsent) {
      recipients.push({
        memberId: rec.memberId,
        memberName: rec.fullName,
        phoneE164: rec.phone,
        planId: rec.planId,
        sendingMethod: inAppNotified ? 'in_app' : 'skipped',
        status: 'skipped_no_consent',
        inAppNotified,
        error: 'Customer has not opted in to WhatsApp episode alerts (no permission recorded).',
      });
      continue;
    }

    // Create durable queue job for this eligible WhatsApp recipient
    const job = scheduleAutomationJob({
      jobType: 'episode_broadcast_delivery',
      idempotencyKey: `episode.published:${broadcastKey}:${rec.memberId}${resendSuffix}`,
      runAtIso: nowIso,
      memberId: rec.memberId,
      broadcastId,
      phoneE164: rec.phone,
      payload: {
        broadcastId,
        dramaId: drama.id,
        dramaTitle: drama.title,
        episodeSlug: cleanSlug,
        seasonNumber: Number(params.seasonNumber) || 1,
        episodeNumber: Number(params.episodeNumber),
        episodeTitle: params.episodeTitle || `${drama.title} Episode ${params.episodeNumber}`,
        episodeUrl,
        accessType,
        sendingMode: effectiveMode,
        memberName: rec.fullName,
        memberEmail: rec.email,
        planId: rec.planId,
      },
    });
    if (job) queuedJobIds.push(job.id);

    recipients.push({
      memberId: rec.memberId,
      memberName: rec.fullName,
      phoneE164: rec.phone,
      planId: rec.planId,
      sendingMethod: 'cloud_api',
      status: 'queued',
      inAppNotified,
    });
  }

  let broadcast: EpisodeBroadcastRecord = {
    id: broadcastId,
    broadcastKey,
    dramaId: drama.id,
    dramaTitle: drama.title,
    seasonNumber: Number(params.seasonNumber) || 1,
    episodeNumber: Number(params.episodeNumber),
    episodeSlug: cleanSlug,
    episodeTitle: params.episodeTitle || `${drama.title} Episode ${params.episodeNumber}`,
    episodeUrl,
    accessType,
    sendingMode: effectiveMode,
    broadcastStatus: 'processing',
    isResend: Boolean(params.forceResend && existing),
    triggeredByAdminEmail: params.adminEmail,
    totalMatchingCount: targetRecipients.length,
    entitledCount: targetRecipients.length,
    eligibleWhatsappCount: targetRecipients.filter((r) => r.eligibleForWhatsapp).length,
    apiAcceptedCount: 0,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    manualQueuedCount: 0,
    inAppNotifiedCount: 0,
    failedCount: 0,
    skippedCount: 0,
    recipients,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  broadcast = recomputeEpisodeBroadcastCounters(broadcast);
  saveEpisodeBroadcastRecord(broadcast);

  // Immediately process queued episode broadcast jobs through the worker if automation is RUNNING!
  if (queuedJobIds.length > 0 && settings.automationRunning) {
    await runAutomationWorkerCycle({
      trigger: 'episode_broadcast',
      targetBroadcastId: broadcast.id,
    });
    const refreshed = listEpisodeBroadcasts(200).find((b) => b.id === broadcast.id);
    if (refreshed) {
      broadcast = refreshed;
    }
  }

  if (params.adminId) {
    appendAdminAudit({
      adminId: params.adminId,
      adminEmail: params.adminEmail,
      action: params.forceResend ? 'episode_notification_resent' : 'episode_notification_sent',
      targetId: broadcast.id,
      details: `${drama.title} (${accessType}) S${broadcast.seasonNumber}E${broadcast.episodeNumber}: status=${broadcast.broadcastStatus}, matching=${broadcast.totalMatchingCount}, accepted=${broadcast.apiAcceptedCount}, sent=${broadcast.sentCount}, manualQueued=${broadcast.manualQueuedCount}, inApp=${broadcast.inAppNotifiedCount}, skipped=${broadcast.skippedCount}, failed=${broadcast.failedCount}`,
    });
  }

  return { ok: true, broadcast };
}

// --- VIDEO EDITING LEADS ---
export function listVideoEditingLeads(): VideoEditingLead[] {
  return readJson<VideoEditingLead[]>(VIDEO_LEADS_FILE, []);
}

export function getVideoEditingLeadById(leadId: string): VideoEditingLead | undefined {
  return listVideoEditingLeads().find((l) => l.id === leadId);
}

function saveVideoEditingLead(lead: VideoEditingLead): void {
  const all = listVideoEditingLeads();
  const idx = all.findIndex((l) => l.id === lead.id);
  if (idx >= 0) {
    all[idx] = lead;
  } else {
    all.unshift(lead);
  }
  writeJson(VIDEO_LEADS_FILE, all.slice(0, 2000));
  void mirrorDocToFirestoreServer('videoEditingLeads', lead.id, {
    ...lead,
    createdAtIso: lead.createdAt,
    updatedAtIso: lead.updatedAt,
  });
}

export async function createVideoEditingLead(input: {
  fullName: string;
  email: string;
  whatsappNumber?: string;
  whatsappConsent?: boolean;
  companyOrAgency?: string;
  editingService?: string;
  numberOfVideos?: string;
  videoDuration?: string;
  referenceLinks?: string;
  projectDeadline?: string;
  budgetRange?: string;
  additionalInstructions?: string;
  source?: string;
  initialStage?: VideoLeadStage;
}): Promise<VideoEditingLead> {
  const now = new Date().toISOString();
  const phoneE164 = normalizePhoneE164(input.whatsappNumber) || undefined;
  const consented = Boolean(input.whatsappConsent && phoneE164);

  const lead: VideoEditingLead = {
    id: makeId('vlead'),
    fullName: String(input.fullName || 'Website Prospect').trim().slice(0, 120),
    email: String(input.email || '').trim().toLowerCase().slice(0, 200),
    whatsappNumber: String(input.whatsappNumber || '').trim().slice(0, 40),
    whatsappE164: phoneE164,
    whatsappConsent: consented,
    consentTimestamp: consented ? now : undefined,
    consentSource: consented ? input.source || 'website_enquiry_form' : undefined,
    companyOrAgency: String(input.companyOrAgency || '').trim().slice(0, 160),
    editingService: String(input.editingService || 'Short-form Video Editing').trim().slice(0, 160),
    numberOfVideos: String(input.numberOfVideos || '').trim().slice(0, 80),
    videoDuration: String(input.videoDuration || '').trim().slice(0, 80),
    referenceLinks: String(input.referenceLinks || '').trim().slice(0, 600),
    projectDeadline: String(input.projectDeadline || '').trim().slice(0, 120),
    budgetRange: String(input.budgetRange || '').trim().slice(0, 120),
    additionalInstructions: String(input.additionalInstructions || '').trim().slice(0, 1500),
    stage: input.initialStage || 'new',
    humanTakeover: false,
    followUpPaused: false,
    followUpsSentCount: 0,
    source: input.source || 'website_enquiry_form',
    notes: [],
    createdAt: now,
    updatedAt: now,
  };

  saveVideoEditingLead(lead);

  const combinedText = `${lead.budgetRange} ${lead.numberOfVideos} ${lead.companyOrAgency} ${lead.additionalInstructions}`.toLowerCase();
  const looksHighIntent =
    Boolean(input.initialStage === 'qualified') ||
    /agency|monthly|retainer|white.?label|urgent|\$[1-9]\d{2,}|10\+|20\+|30\+/.test(combinedText);
  if (looksHighIntent) {
    lead.isHighIntent = true;
    saveVideoEditingLead(lead);
    triggerHighIntentLeadNotification(lead, {
      source: lead.source,
      reason: 'High-intent FEVIQO Creative video editing enquiry submitted',
    });
  }

  if (consented && phoneE164) {
    upsertMemberNotificationPreferences({
      fullName: lead.fullName,
      email: lead.email || undefined,
      phone: phoneE164,
      leadEnquiryConsent: true,
      source: lead.source,
    });
  }

  void emitAutomationEvent('lead.created', { lead });
  return lead;
}

export function updateVideoEditingLeadByAdmin(params: {
  leadId: string;
  stage?: VideoLeadStage;
  humanTakeover?: boolean;
  followUpPaused?: boolean;
  addNote?: string;
  scheduleFollowUpType?:
    | 'lead_followup_pricing'
    | 'lead_followup_quote'
    | 'lead_followup_booking'
    | 'lead_followup_returning';
  admin: { id: string; email: string };
}): { ok: true; lead: VideoEditingLead } | { ok: false; error: string } {
  const lead = getVideoEditingLeadById(params.leadId);
  if (!lead) return { ok: false, error: 'Lead not found.' };

  const now = new Date().toISOString();
  const prevStage = lead.stage;

  if (params.stage) {
    lead.stage = params.stage;
  }
  if (typeof params.humanTakeover === 'boolean') {
    lead.humanTakeover = params.humanTakeover;
    // Sync human takeover to the WhatsApp conversation if phone exists
    if (lead.whatsappE164) {
      setConversationHumanTakeover(lead.whatsappE164, params.humanTakeover, params.admin.email);
    }
  }
  if (typeof params.followUpPaused === 'boolean') {
    lead.followUpPaused = params.followUpPaused;
    if (params.followUpPaused) {
      cancelScheduledJobs((j) => j.leadId === lead.id, 'Admin paused lead follow-ups');
    }
  }
  if (params.addNote && params.addNote.trim()) {
    lead.notes = [
      {
        id: makeId('note'),
        author: params.admin.email,
        text: params.addNote.trim().slice(0, 1000),
        createdAt: now,
      },
      ...(lead.notes || []),
    ].slice(0, 50);
  }
  lead.updatedAt = now;
  saveVideoEditingLead(lead);

  // Stop follow-ups immediately if booked, won, or lost
  if (lead.stage === 'booked' || lead.stage === 'won' || lead.stage === 'lost') {
    cancelScheduledJobs(
      (j) => j.leadId === lead.id,
      `Lead stage changed to ${lead.stage}`
    );
    if (lead.stage === 'booked' && prevStage !== 'booked') {
      void emitAutomationEvent('lead.booked', { lead });
    }
  } else if (lead.stage === 'quote_sent' && prevStage !== 'quote_sent') {
    void emitAutomationEvent('lead.quote_sent', { lead });
  } else if (lead.stage === 'qualified' && prevStage !== 'qualified') {
    void emitAutomationEvent('lead.qualified', { lead });
  }

  // Optional explicit follow-up trigger from admin UI
  if (params.scheduleFollowUpType && lead.whatsappConsent && lead.whatsappE164) {
    const settings = getAutomationSettings();
    const hoursMap: Record<string, number> = {
      lead_followup_pricing: settings.rules.leadFollowUpPricingHours || 12,
      lead_followup_quote: settings.rules.leadFollowUpQuoteHours || 48,
      lead_followup_booking: settings.rules.leadFollowUpBookingHours || 6,
      lead_followup_returning: 24,
    };
    const hrs = Math.max(1, hoursMap[params.scheduleFollowUpType] || 24);
    scheduleAutomationJob({
      jobType: params.scheduleFollowUpType,
      idempotencyKey: `${params.scheduleFollowUpType}:${lead.id}:${Date.now()}`,
      runAtIso: new Date(Date.now() + hrs * 60 * 60 * 1000).toISOString(),
      leadId: lead.id,
      phoneE164: lead.whatsappE164,
      payload: { fullName: lead.fullName, editingService: lead.editingService },
    });
  }

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'video_lead_updated',
    targetId: lead.id,
    details: `Stage=${lead.stage}, takeover=${lead.humanTakeover}, paused=${lead.followUpPaused}`,
  });

  return { ok: true, lead };
}

// --- UNIFIED WHATSAPP CONVERSATIONS ---
export function listWhatsAppConversations(): WhatsAppConversation[] {
  return readJson<WhatsAppConversation[]>(WA_CONVERSATIONS_FILE, []).sort(
    (a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt)
  );
}

function saveConversation(conv: WhatsAppConversation): void {
  const all = readJson<WhatsAppConversation[]>(WA_CONVERSATIONS_FILE, []);
  const idx = all.findIndex((c) => c.id === conv.id || c.phoneE164 === conv.phoneE164);
  if (idx >= 0) {
    all[idx] = conv;
  } else {
    all.unshift(conv);
  }
  writeJson(WA_CONVERSATIONS_FILE, all.slice(0, 1000));
  void mirrorDocToFirestoreServer('whatsappConversations', conv.id, {
    ...conv,
    createdAtIso: conv.createdAt,
    updatedAtIso: conv.updatedAt,
  });
}

export function setConversationHumanTakeover(
  phoneRaw: string,
  humanTakeover: boolean,
  actor?: string
): WhatsAppConversation | null {
  const phoneE164 = normalizePhoneE164(phoneRaw);
  if (!phoneE164) return null;
  const all = readJson<WhatsAppConversation[]>(WA_CONVERSATIONS_FILE, []);
  const conv = all.find((c) => c.phoneE164 === phoneE164);
  if (!conv) return null;
  conv.humanTakeover = humanTakeover;
  conv.escalatedReason = humanTakeover
    ? conv.escalatedReason || `Human takeover enabled by ${actor || 'admin'}`
    : undefined;
  conv.updatedAt = new Date().toISOString();
  saveConversation(conv);
  return conv;
}

export async function sendAdminManualWhatsAppReply(params: {
  phoneRaw: string;
  text: string;
  admin: { id: string; email: string };
}): Promise<{ ok: boolean; error?: string; conversation?: WhatsAppConversation; messageLog?: WhatsAppMessageLog }> {
  const phoneE164 = normalizePhoneE164(params.phoneRaw);
  if (!phoneE164) return { ok: false, error: 'Invalid phone number.' };
  const text = String(params.text || '').trim();
  if (!text) return { ok: false, error: 'Reply message cannot be empty.' };

  const all = readJson<WhatsAppConversation[]>(WA_CONVERSATIONS_FILE, []);
  const now = new Date().toISOString();
  let conv = all.find((c) => c.phoneE164 === phoneE164);
  if (!conv) {
    conv = {
      id: makeSafeDocId(`conv_${phoneE164.slice(1)}`),
      phoneE164,
      contactName: phoneE164,
      intent: 'general',
      language: 'en',
      humanTakeover: true,
      lastMessageAt: now,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  const sendRes = await sendWhatsAppTextMessage({ toPhone: phoneE164, body: text });
  const logEntry: WhatsAppMessageLog = {
    id: makeId('wamsg'),
    direction: 'outbound',
    wamid: sendRes.messageId,
    idempotencyKey: `admin_reply:${phoneE164}:${Date.now()}`,
    eventType: 'admin.manual_reply',
    recipientPhone: phoneE164,
    recipientName: conv.contactName,
    memberId: conv.memberId,
    leadId: conv.leadId,
    bodyPreview: text,
    status: sendRes.ok ? 'sent' : sendRes.notConfigured ? 'not_configured' : 'failed',
    attempts: 1,
    maxAttempts: 1,
    errorMessage: sendRes.error,
    errorCode: sendRes.errorCode,
    estimatedCostUsd: 0, // Customer service 24h window reply
    sentAt: sendRes.ok ? now : undefined,
    failedAt: sendRes.ok ? undefined : now,
    createdAt: now,
    updatedAt: now,
  };
  saveWhatsAppMessageLog(logEntry);

  conv.humanTakeover = true;
  conv.lastMessageAt = now;
  conv.updatedAt = now;
  conv.messages = [
    ...conv.messages,
    {
      id: makeId('cmsg'),
      direction: 'outbound' as const,
      sender: 'admin' as const,
      text,
      wamid: sendRes.messageId,
      createdAt: now,
    },
  ].slice(-100);
  saveConversation(conv);

  return {
    ok: sendRes.ok,
    error: sendRes.error,
    conversation: conv,
    messageLog: logEntry,
  };
}

// --- WEBHOOK AUDIT EVENTS & PERSISTENT DUPLICATE PROTECTION ---
export function listWebhookEvents(limit = 100): WebhookEventRecord[] {
  return readJson<WebhookEventRecord[]>(WA_WEBHOOK_EVENTS_FILE, []).slice(0, limit);
}

export function recordWebhookEvent(
  entry: Omit<WebhookEventRecord, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string;
    createdAt?: string;
  }
): WebhookEventRecord {
  const now = entry.createdAt || new Date().toISOString();
  const record: WebhookEventRecord = {
    id: entry.id || makeId('wh'),
    eventType: entry.eventType,
    status: entry.status,
    httpStatus: entry.httpStatus,
    reason: entry.reason ? String(entry.reason).slice(0, 300) : undefined,
    sourceIp: entry.sourceIp ? String(entry.sourceIp).slice(0, 64) : undefined,
    signatureValid: entry.signatureValid,
    processedMessages: entry.processedMessages,
    processedStatuses: entry.processedStatuses,
    duplicatesIgnored: entry.duplicatesIgnored,
    durationMs: entry.durationMs,
    createdAt: now,
    updatedAt: now,
  };
  const all = readJson<WebhookEventRecord[]>(WA_WEBHOOK_EVENTS_FILE, []);
  all.unshift(record);
  writeJson(WA_WEBHOOK_EVENTS_FILE, all.slice(0, 300));
  void mirrorDocToFirestoreServer('whatsappWebhookEvents', record.id, {
    ...record,
    createdAtIso: record.createdAt,
    updatedAtIso: record.updatedAt,
  });
  return record;
}

export function updateWebhookEvent(
  eventId: string,
  patch: Partial<WebhookEventRecord>
): WebhookEventRecord | null {
  const all = readJson<WebhookEventRecord[]>(WA_WEBHOOK_EVENTS_FILE, []);
  const idx = all.findIndex((e) => e.id === eventId);
  if (idx < 0) return null;
  const updated: WebhookEventRecord = {
    ...all[idx],
    ...patch,
    id: all[idx].id,
    createdAt: all[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  writeJson(WA_WEBHOOK_EVENTS_FILE, all.slice(0, 300));
  void mirrorDocToFirestoreServer('whatsappWebhookEvents', updated.id, {
    ...updated,
    createdAtIso: updated.createdAt,
    updatedAtIso: updated.updatedAt,
  });
  return updated;
}

function isWebhookEventProcessed(eventKey: string): boolean {
  const seen = readJson<string[]>(WEBHOOK_DEDUPE_FILE, []);
  return seen.includes(eventKey);
}

function markWebhookEventProcessed(eventKey: string): void {
  const seen = readJson<string[]>(WEBHOOK_DEDUPE_FILE, []);
  if (seen.includes(eventKey)) return;
  seen.unshift(eventKey);
  writeJson(WEBHOOK_DEDUPE_FILE, seen.slice(0, 3000));
  const docId = `dedupe_${crypto.createHash('sha256').update(eventKey).digest('hex').slice(0, 40)}`;
  const now = new Date().toISOString();
  void mirrorDocToFirestoreServer('whatsappWebhookDedupe', docId, {
    id: docId,
    eventKey,
    createdAtIso: now,
    updatedAtIso: now,
  });
}

const STOP_KEYWORDS = new Set([
  'stop',
  'unsubscribe',
  'opt out',
  'optout',
  'cancel alerts',
  'بند',
  'بند کریں',
  'روکیں',
]);

const RESUBSCRIBE_KEYWORDS = new Set(['start', 'subscribe', 'unstop', 'شروع']);

export async function processIncomingWhatsAppWebhookPayload(payload: any): Promise<{
  processedMessages: number;
  processedStatuses: number;
  duplicatesIgnored: number;
}> {
  let processedMessages = 0;
  let processedStatuses = 0;
  let duplicatesIgnored = 0;

  const now = new Date().toISOString();
  saveAutomationSettings({ lastWebhookReceivedAt: now });

  const entries = Array.isArray(payload?.entry) ? payload.entry : [];
  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value;
      if (!value) continue;

      // 1. Delivery / Read / Failed status updates
      const statuses = Array.isArray(value.statuses) ? value.statuses : [];
      for (const st of statuses) {
        const wamid = String(st?.id || '').trim();
        const statusStr = String(st?.status || '').trim().toLowerCase();
        if (!wamid || !statusStr) continue;
        const dedupeKey = `status:${wamid}:${statusStr}`;
        if (isWebhookEventProcessed(dedupeKey)) {
          duplicatesIgnored += 1;
          continue;
        }
        markWebhookEventProcessed(dedupeKey);
        processedStatuses += 1;

        const allMsgs = readJson<WhatsAppMessageLog[]>(WA_MESSAGES_FILE, []);
        const msg = allMsgs.find((m) => m.wamid === wamid);
        if (msg) {
          const tsIso = st?.timestamp
            ? new Date(Number(st.timestamp) * 1000).toISOString()
            : now;
          if (statusStr === 'sent') {
            msg.status = 'sent';
            msg.sentAt = msg.sentAt || tsIso;
          } else if (statusStr === 'delivered') {
            msg.status = 'delivered';
            msg.deliveredAt = tsIso;
          } else if (statusStr === 'read') {
            msg.status = 'read';
            msg.readAt = tsIso;
          } else if (statusStr === 'failed') {
            msg.status = 'failed';
            msg.failedAt = tsIso;
            const errInfo = Array.isArray(st?.errors) ? st.errors[0] : null;
            msg.errorCode = errInfo?.code;
            msg.errorMessage =
              errInfo?.title || errInfo?.message || 'WhatsApp delivery failure reported by Meta.';
            msg.nextRetryAt = computeNextRetryIso(msg.attempts);
          }
          msg.updatedAt = now;
          saveWhatsAppMessageLog(msg);

          // Sync live delivery status back into any matching EpisodeBroadcastRecord
          if (msg.broadcastId) {
            const allBroadcasts = readJson<EpisodeBroadcastRecord[]>(EPISODE_BROADCASTS_FILE, []);
            const bIdx = allBroadcasts.findIndex((b) => b.id === msg.broadcastId);
            if (bIdx >= 0) {
              const b = allBroadcasts[bIdx];
              const rec = b.recipients.find(
                (r) => r.messageLogId === msg.id || r.wamid === wamid || r.memberId === msg.memberId
              );
              if (rec) {
                rec.status = msg.status;
                rec.wamid = wamid;
                if (msg.errorMessage) rec.error = msg.errorMessage;
                recomputeEpisodeBroadcastCounters(b);
                saveEpisodeBroadcastRecord(b);
              }
            }
          }
        }
      }

      // 2. Incoming customer messages
      const contacts = Array.isArray(value.contacts) ? value.contacts : [];
      const contactNameMap = new Map<string, string>();
      for (const c of contacts) {
        if (c?.wa_id) {
          contactNameMap.set(String(c.wa_id), c?.profile?.name || String(c.wa_id));
        }
      }

      const messages = Array.isArray(value.messages) ? value.messages : [];
      for (const m of messages) {
        const wamid = String(m?.id || '').trim();
        const fromWaId = String(m?.from || '').trim();
        if (!wamid || !fromWaId) continue;

        const dedupeKey = `msg:${wamid}`;
        if (isWebhookEventProcessed(dedupeKey)) {
          duplicatesIgnored += 1;
          continue;
        }
        markWebhookEventProcessed(dedupeKey);
        processedMessages += 1;

        const phoneE164 = normalizePhoneE164(`+${fromWaId}`) || `+${fromWaId}`;
        const contactName = contactNameMap.get(fromWaId) || phoneE164;
        const incomingText =
          m?.text?.body ||
          m?.button?.text ||
          m?.interactive?.button_reply?.title ||
          m?.interactive?.list_reply?.title ||
          `[${m?.type || 'media'} message]`;

        // Log inbound message
        const inboundLog: WhatsAppMessageLog = {
          id: makeId('wamsg'),
          direction: 'inbound',
          wamid,
          idempotencyKey: `inbound:${wamid}`,
          eventType: 'whatsapp.inbound_message',
          recipientPhone: phoneE164,
          recipientName: contactName,
          bodyPreview: String(incomingText).slice(0, 2000),
          status: 'delivered',
          attempts: 1,
          maxAttempts: 1,
          estimatedCostUsd: 0,
          deliveredAt: now,
          createdAt: now,
          updatedAt: now,
        };
        saveWhatsAppMessageLog(inboundLog);
        void markWhatsAppMessageRead(wamid);

        // Cancel any automated lead follow-ups immediately when lead replies!
        const leads = listVideoEditingLeads();
        const matchedLead = leads.find((l) => l.whatsappE164 === phoneE164);
        if (matchedLead) {
          matchedLead.lastLeadReplyAt = now;
          if (matchedLead.stage === 'new') matchedLead.stage = 'contacted';
          matchedLead.updatedAt = now;
          saveVideoEditingLead(matchedLead);
          cancelScheduledJobs(
            (j) => j.leadId === matchedLead.id,
            'Lead replied on WhatsApp — automated follow-ups stopped'
          );
        }

        // Lookup strictly scoped member context by this sender's phone ONLY
        const memberCtx = findMemberContextByPhoneDigits(phoneE164);

        // Upsert conversation thread
        const allConvs = readJson<WhatsAppConversation[]>(WA_CONVERSATIONS_FILE, []);
        let conv = allConvs.find((c) => c.phoneE164 === phoneE164);
        if (!conv) {
          conv = {
            id: makeSafeDocId(`conv_${phoneE164.slice(1)}`),
            phoneE164,
            contactName: memberCtx?.member.fullName || matchedLead?.fullName || contactName,
            intent: matchedLead ? 'feviqo_creative' : memberCtx ? 'feviqo_premium' : 'general',
            language: /[\u0600-\u06FF]/.test(incomingText) ? 'ur' : 'en',
            humanTakeover: Boolean(matchedLead?.humanTakeover),
            memberId: memberCtx?.member.id,
            leadId: matchedLead?.id,
            lastInboundAt: now,
            lastMessageAt: now,
            messages: [],
            createdAt: now,
            updatedAt: now,
          };
        }

        conv.lastInboundAt = now;
        conv.lastMessageAt = now;
        conv.updatedAt = now;
        if (memberCtx?.member.id) conv.memberId = memberCtx.member.id;
        if (matchedLead?.id) conv.leadId = matchedLead.id;
        conv.messages = [
          ...conv.messages,
          {
            id: makeId('cmsg'),
            direction: 'inbound' as const,
            sender: 'customer' as const,
            text: String(incomingText),
            wamid,
            createdAt: now,
          },
        ].slice(-100);
        saveConversation(conv);

        // Handle STOP / OPT-OUT immediately
        const trimmedLower = String(incomingText).trim().toLowerCase();
        if (STOP_KEYWORDS.has(trimmedLower)) {
          upsertMemberNotificationPreferences({
            memberId: memberCtx?.member.id,
            fullName: conv.contactName,
            phone: phoneE164,
            optedOut: true,
            source: 'whatsapp_stop_keyword',
          });
          if (matchedLead) {
            matchedLead.followUpPaused = true;
            matchedLead.whatsappConsent = false;
            saveVideoEditingLead(matchedLead);
          }
          const stopAck =
            'You have been unsubscribed from FEVIQO WhatsApp notifications. Reply START anytime if you wish to re-enable alerts.';
          const res = await sendWhatsAppTextMessage({ toPhone: phoneE164, body: stopAck });
          conv.messages.push({
            id: makeId('cmsg'),
            direction: 'outbound',
            sender: 'automation',
            text: stopAck,
            wamid: res.messageId,
            createdAt: new Date().toISOString(),
          });
          saveConversation(conv);
          continue;
        }

        if (RESUBSCRIBE_KEYWORDS.has(trimmedLower)) {
          upsertMemberNotificationPreferences({
            memberId: memberCtx?.member.id,
            fullName: conv.contactName,
            phone: phoneE164,
            optedOut: false,
            membershipUpdates: true,
            renewalReminders: true,
            source: 'whatsapp_start_keyword',
          });
          const startAck =
            'Welcome back! Your FEVIQO WhatsApp updates are re-enabled. You can customize individual preferences anytime in https://feviqo.com/account';
          const res = await sendWhatsAppTextMessage({ toPhone: phoneE164, body: startAck });
          conv.messages.push({
            id: makeId('cmsg'),
            direction: 'outbound',
            sender: 'automation',
            text: startAck,
            wamid: res.messageId,
            createdAt: new Date().toISOString(),
          });
          saveConversation(conv);
          continue;
        }

        // Run unified AI assistant if enabled and human takeover is NOT active
        const settings = getAutomationSettings();
        if (
          settings.rules.masterEnabled &&
          settings.ai.enabled &&
          settings.ai.autoReplyOnInboundWhatsApp &&
          !conv.humanTakeover
        ) {
          const scopedCustomer: ScopedCustomerContext | null = memberCtx
            ? {
                memberName: memberCtx.member.fullName,
                hasActiveMembership: memberCtx.activeMemberships.length > 0,
                activePlanName: memberCtx.activeMemberships[0]?.planName,
                activeExpiresAt: memberCtx.activeMemberships[0]?.expiresAt,
                activeDramas: memberCtx.activeMemberships
                  .flatMap((s) => s.selectedDramaIds)
                  .map((id) => getDramaById(id)?.title || id),
                hasPendingOrder: Boolean(memberCtx.latestPendingOrder),
                pendingOrderPlan: memberCtx.latestPendingOrder?.planName,
                pendingOrderStatus: memberCtx.latestPendingOrder?.status,
              }
            : null;

          const aiResult = await generateFeviqoAiReply({
            userMessage: String(incomingText),
            contactName: conv.contactName,
            conversationHistory: conv.messages.slice(-8).map((cm) => ({
              role: cm.direction === 'inbound' ? 'user' : 'assistant',
              text: cm.text,
            })),
            scopedCustomer,
            bookingUrl: settings.ai.bookingUrl,
            escalationKeywords: settings.ai.escalationKeywords,
          });

          if (aiResult.ok && aiResult.replyText) {
            conv.intent = aiResult.intent;
            conv.language = aiResult.detectedLanguage;
            if (aiResult.escalateToHuman) {
              conv.humanTakeover = true;
              conv.escalatedReason = aiResult.escalationReason || 'AI escalated to human agent';
            }

            // Auto-capture/enrich FEVIQO Creative lead from WhatsApp conversation
            if (aiResult.intent === 'feviqo_creative' || aiResult.isHighIntentLead) {
              const ex = aiResult.extractedLead || {};
              if (matchedLead) {
                if (ex.companyOrAgency && !matchedLead.companyOrAgency)
                  matchedLead.companyOrAgency = ex.companyOrAgency;
                if (ex.editingService) matchedLead.editingService = ex.editingService;
                if (ex.numberOfVideos) matchedLead.numberOfVideos = ex.numberOfVideos;
                if (ex.videoDuration) matchedLead.videoDuration = ex.videoDuration;
                if (ex.referenceLinks) matchedLead.referenceLinks = ex.referenceLinks;
                if (ex.projectDeadline) matchedLead.projectDeadline = ex.projectDeadline;
                if (ex.budgetRange) matchedLead.budgetRange = ex.budgetRange;
                if (aiResult.isHighIntentLead) {
                  matchedLead.isHighIntent = true;
                  if (matchedLead.stage === 'new' || matchedLead.stage === 'contacted') {
                    matchedLead.stage = 'qualified';
                  }
                }
                if (aiResult.escalateToHuman) matchedLead.humanTakeover = true;
                matchedLead.updatedAt = new Date().toISOString();
                saveVideoEditingLead(matchedLead);
                if (aiResult.isHighIntentLead || aiResult.escalateToHuman) {
                  triggerHighIntentLeadNotification(matchedLead, {
                    source: 'whatsapp_ai_assistant',
                    reason:
                      aiResult.escalationReason ||
                      'High-intent FEVIQO Creative inquiry detected on WhatsApp',
                  });
                }
              } else {
                const newLead = await createVideoEditingLead({
                  fullName: conv.contactName,
                  email: memberCtx?.member.email || '',
                  whatsappNumber: phoneE164,
                  whatsappConsent: true, // Customer initiated WhatsApp conversation
                  companyOrAgency: ex.companyOrAgency || '',
                  editingService: ex.editingService || 'Video Editing Enquiry (WhatsApp)',
                  numberOfVideos: ex.numberOfVideos || '',
                  videoDuration: ex.videoDuration || '',
                  referenceLinks: ex.referenceLinks || '',
                  projectDeadline: ex.projectDeadline || '',
                  budgetRange: ex.budgetRange || '',
                  additionalInstructions: ex.additionalInstructions || String(incomingText).slice(0, 500),
                  source: 'whatsapp_ai_assistant',
                  initialStage: aiResult.isHighIntentLead ? 'qualified' : 'new',
                });
                conv.leadId = newLead.id;
                if (aiResult.isHighIntentLead || aiResult.escalateToHuman) {
                  triggerHighIntentLeadNotification(newLead, {
                    source: 'whatsapp_ai_assistant',
                    reason:
                      aiResult.escalationReason ||
                      'High-intent FEVIQO Creative inquiry detected on WhatsApp',
                  });
                }
              }
            }

            const sendRes = await sendWhatsAppTextMessage({
              toPhone: phoneE164,
              body: aiResult.replyText,
            });
            const replyNow = new Date().toISOString();
            saveWhatsAppMessageLog({
              id: makeId('wamsg'),
              direction: 'outbound',
              wamid: sendRes.messageId,
              idempotencyKey: `ai_reply:${wamid}`,
              eventType: `ai.${aiResult.intent}`,
              recipientPhone: phoneE164,
              recipientName: conv.contactName,
              memberId: conv.memberId,
              leadId: conv.leadId,
              bodyPreview: aiResult.replyText,
              status: sendRes.ok ? 'sent' : sendRes.notConfigured ? 'not_configured' : 'failed',
              attempts: 1,
              maxAttempts: 1,
              errorMessage: sendRes.error,
              errorCode: sendRes.errorCode,
              estimatedCostUsd: 0,
              sentAt: sendRes.ok ? replyNow : undefined,
              failedAt: sendRes.ok ? undefined : replyNow,
              createdAt: replyNow,
              updatedAt: replyNow,
            });

            conv.messages = [
              ...conv.messages,
              {
                id: makeId('cmsg'),
                direction: 'outbound' as const,
                sender: 'ai' as const,
                text: aiResult.replyText,
                wamid: sendRes.messageId,
                intent: aiResult.intent,
                createdAt: replyNow,
              },
            ].slice(-100);
            conv.lastMessageAt = replyNow;
            conv.updatedAt = replyNow;
            saveConversation(conv);
          }
        }
      }
    }
  }

  return { processedMessages, processedStatuses, duplicatesIgnored };
}

// --- SCHEDULED BACKGROUND WORKER (ATOMIC LOCKING + MASTER BOT STATE + EPISODE & LIFECYCLE DELIVERY) ---
let workerRunning = false;
const WORKER_LOCK_LEASE_MS = 5 * 60 * 1000;

export async function runAutomationWorkerCycle(options?: {
  trigger?: string;
  targetBroadcastId?: string;
  forceEvenIfStopped?: boolean;
}): Promise<{
  ranAt: string;
  paused: boolean;
  jobsProcessed: number;
  jobsCancelled: number;
  retriesAttempted: number;
  expiryJobsEnsured: number;
  summary: string;
}> {
  if (workerRunning) {
    return {
      ranAt: new Date().toISOString(),
      paused: false,
      jobsProcessed: 0,
      jobsCancelled: 0,
      retriesAttempted: 0,
      expiryJobsEnsured: 0,
      summary: 'Worker cycle already in progress.',
    };
  }
  workerRunning = true;
  const ranAt = new Date().toISOString();
  const lockOwner = `worker_${process.pid}_${Date.now().toString(36)}`;
  let jobsProcessed = 0;
  let jobsCancelled = 0;
  let retriesAttempted = 0;
  let expiryJobsEnsured = 0;

  try {
    const settings = getAutomationSettings();

    // Respect persisted Master START/STOP Automation Bot switch!
    if (!settings.automationRunning && !options?.forceEvenIfStopped) {
      saveAutomationSettings({
        lastWorkerHeartbeatAt: ranAt,
        lastWorkerSummary: 'Automation Bot is STOPPED. Pending automatic jobs paused safely.',
      });
      return {
        ranAt,
        paused: true,
        jobsProcessed: 0,
        jobsCancelled: 0,
        retriesAttempted: 0,
        expiryJobsEnsured: 0,
        summary: 'Automation Bot is STOPPED. Pending jobs preserved; manual WhatsApp sending remains available.',
      };
    }

    const { members, orders, memberships } = getAutomationMembershipSnapshot();
    const blockedSets = getBlockedLookupSets();
    const isBlockedMember = (m?: { email?: string; phone?: string }) => {
      if (!m) return false;
      const e = String(m.email || '').trim().toLowerCase();
      const p = normalizeBlockedPhone(m.phone);
      return (Boolean(e) && blockedSets.emails.has(e)) || (Boolean(p) && blockedSets.phones.has(p));
    };

    const memberMap = new Map(members.map((m) => [m.id, m]));
    const orderMap = new Map(orders.map((o) => [o.id, o]));
    const membershipMap = new Map(memberships.map((s) => [s.id, s]));
    const nowMs = Date.now();

    // 1. Ensure future expiry reminder jobs exist for currently active non-blocked memberships
    for (const sub of memberships) {
      if (sub.status !== 'active') continue;
      const expMs = Date.parse(sub.expiresAt);
      if (Number.isNaN(expMs)) continue;
      const member = memberMap.get(sub.memberId);
      if (isBlockedMember(member)) continue;

      const milestones: Array<{ jobType: AutomationJobType; offsetDays: number }> = [
        { jobType: 'membership_expiry_7d', offsetDays: 7 },
        { jobType: 'membership_expiry_3d', offsetDays: 3 },
        { jobType: 'membership_expiry_1d', offsetDays: 1 },
        { jobType: 'membership_expired', offsetDays: 0 },
      ];
      const existingJobsSnapshot = readJson<AutomationScheduledJob[]>(AUTOMATION_JOBS_FILE, []);
      for (const m of milestones) {
        const runAtMs = expMs - m.offsetDays * 24 * 60 * 60 * 1000;
        if (runAtMs < nowMs - 24 * 60 * 60 * 1000) continue;
        const key = `${m.jobType}:${sub.id}:${sub.expiresAt}`;
        if (!existingJobsSnapshot.some((j) => j.idempotencyKey === key)) {
          scheduleAutomationJob({
            jobType: m.jobType,
            idempotencyKey: key,
            runAtIso: new Date(Math.max(runAtMs, nowMs)).toISOString(),
            memberId: sub.memberId,
            membershipId: sub.id,
            phoneE164: normalizePhoneE164(member?.phone || sub.customerPhone) || undefined,
            payload: {
              memberName: member?.fullName || sub.customerName || 'Member',
              email: member?.email || sub.customerEmail,
              planName: sub.planName,
              expiresAt: sub.expiresAt,
            },
          });
          expiryJobsEnsured += 1;
        }
      }
    }

    // 2. Recover stale locks (crash safety) and atomically claim due pending jobs
    const allJobs = readJson<AutomationScheduledJob[]>(AUTOMATION_JOBS_FILE, []);
    let locksChanged = false;
    for (const job of allJobs) {
      if (
        job.status === 'processing' &&
        job.lockExpiresAt &&
        Date.parse(job.lockExpiresAt) <= nowMs
      ) {
        job.status = 'pending';
        job.lockedAt = undefined;
        job.lockOwner = undefined;
        job.lockExpiresAt = undefined;
        job.updatedAt = ranAt;
        locksChanged = true;
      }
    }
    if (locksChanged) {
      writeJson(AUTOMATION_JOBS_FILE, allJobs);
    }

    const dueJobs = allJobs.filter((job) => {
      if (job.status !== 'pending') return false;
      if (options?.targetBroadcastId && job.broadcastId !== options.targetBroadcastId) return false;
      const runMs = Date.parse(job.runAt);
      return !Number.isNaN(runMs) && runMs <= nowMs;
    });

    for (const job of dueJobs) {
      // Re-check persisted switch before claiming each job so STOP AUTOMATION halts cleanly between jobs
      if (!options?.forceEvenIfStopped && !getAutomationSettings().automationRunning) {
        break;
      }

      const nowIso = new Date().toISOString();
      job.status = 'processing';
      job.lockedAt = nowIso;
      job.lockOwner = lockOwner;
      job.lockExpiresAt = new Date(Date.now() + WORKER_LOCK_LEASE_MS).toISOString();
      job.attempts = (job.attempts || 0) + 1;
      job.updatedAt = nowIso;
      saveAutomationJob(job);

      const finishJob = (status: 'completed' | 'cancelled' | 'failed', note?: string) => {
        const doneIso = new Date().toISOString();
        job.status = status;
        job.lockedAt = undefined;
        job.lockOwner = undefined;
        job.lockExpiresAt = undefined;
        if (status === 'completed') job.completedAt = doneIso;
        if (status === 'cancelled' && note) job.cancelReason = note;
        if (status === 'failed' && note) job.lastError = note;
        job.updatedAt = doneIso;
        saveAutomationJob(job);
      };

      // Cancel immediately if member is permanently blocked
      const jobMember = job.memberId ? memberMap.get(job.memberId) : undefined;
      if (isBlockedMember(jobMember)) {
        finishJob('cancelled', 'Recipient account/phone is permanently blocked.');
        jobsCancelled += 1;
        continue;
      }

      if (job.jobType === 'episode_broadcast_delivery') {
        const p = job.payload || {};
        const drama = p.dramaId ? getDramaById(p.dramaId) : undefined;
        const accessLabel = p.accessType === 'free' ? 'Free' : 'Premium';

        // Security check: if Premium episode, verify member is STILL actively entitled right before sending!
        if (p.accessType !== 'free' && p.dramaId && job.memberId) {
          const stillEntitled = getEntitledActiveMembersForDrama(p.dramaId).some(
            (e) => e.member.id === job.memberId
          );
          if (!stillEntitled) {
            finishJob('cancelled', 'Member is no longer actively entitled to this Premium drama.');
            jobsCancelled += 1;
            continue;
          }
        }

        const msgLog = await dispatchTemplateWhatsAppNotification({
          idempotencyKey: job.idempotencyKey,
          eventType: 'episode.published',
          templateName: 'feviqo_new_episode',
          bodyParameters: [
            p.dramaTitle || drama?.title || 'FEVIQO Drama',
            String(p.episodeNumber || 1),
            accessLabel,
            p.episodeUrl || 'https://feviqo.com/dramas',
          ],
          recipientPhone: jobMember?.phone || job.phoneE164,
          recipientName: jobMember?.fullName || p.memberName,
          memberId: job.memberId,
          broadcastId: job.broadcastId,
          categoryKey: 'episodes',
          sendingModeOverride: p.sendingMode,
          manualFallbackSpec: {
            eventType: 'episode_published',
            customerEmail: jobMember?.email || p.memberEmail,
            dramaId: p.dramaId,
            episodeSlug: p.episodeSlug,
            seriesName: p.dramaTitle || drama?.title,
            episodeNumber: p.episodeNumber,
            episodeLink: p.episodeUrl,
            accessType: p.accessType === 'free' ? 'free' : 'premium',
          },
          ruleEnabled: settings.rules.episodePublishedAlerts,
        });

        // Update matching EpisodeBroadcastRecord recipient & counters
        if (job.broadcastId) {
          const allB = readJson<EpisodeBroadcastRecord[]>(EPISODE_BROADCASTS_FILE, []);
          const b = allB.find((x) => x.id === job.broadcastId);
          if (b) {
            const rec = b.recipients.find((r) => r.memberId === job.memberId);
            if (rec && msgLog) {
              rec.status = msgLog.status;
              rec.wamid = msgLog.wamid;
              rec.httpStatus = msgLog.httpStatus;
              rec.messageLogId = msgLog.id;
              rec.manualNotificationId = msgLog.manualFallbackNotificationId || rec.manualNotificationId;
              rec.sendingMethod = msgLog.manualFallbackNotificationId ? 'manual_whatsapp' : 'cloud_api';
              rec.error = msgLog.errorMessage;
            }
            recomputeEpisodeBroadcastCounters(b);
            saveEpisodeBroadcastRecord(b);
          }
        }

        finishJob(msgLog?.status === 'failed' ? 'failed' : 'completed', msgLog?.errorMessage);
        jobsProcessed += 1;
        continue;
      }

      if (job.jobType === 'historical_campaign_delivery') {
        const p = job.payload || {};
        const msgLog = await dispatchTemplateWhatsAppNotification({
          idempotencyKey: job.idempotencyKey,
          eventType: p.eventType || 'campaign.manual_broadcast',
          templateName: p.templateName || 'feviqo_membership_incomplete',
          bodyParameters: Array.isArray(p.bodyParameters)
            ? p.bodyParameters
            : [jobMember?.fullName || p.memberName || 'Member', 'https://feviqo.com/membership'],
          recipientPhone: jobMember?.phone || job.phoneE164,
          recipientName: jobMember?.fullName || p.memberName,
          memberId: job.memberId,
          categoryKey: p.categoryKey || 'unpaid_followups',
          sendingModeOverride: p.sendingMode,
          manualFallbackSpec: {
            eventType: p.manualEventType || 'signup_followup_unpaid',
            customerEmail: jobMember?.email || p.memberEmail,
          },
          ruleEnabled: true,
        });
        finishJob(msgLog?.status === 'failed' ? 'failed' : 'completed', msgLog?.errorMessage);
        jobsProcessed += 1;
        continue;
      }

      if (
        job.jobType === 'signup_no_package_30m' ||
        job.jobType === 'signup_no_package_24h' ||
        job.jobType === 'signup_no_package_72h'
      ) {
        const hasAnyOrder = orders.some((o) => o.memberId === job.memberId);
        const hasAnySub = memberships.some((s) => s.memberId === job.memberId);
        if (!jobMember || hasAnyOrder || hasAnySub) {
          finishJob('cancelled', 'User already selected a package or has a membership.');
          jobsCancelled += 1;
          continue;
        }
        await dispatchTemplateWhatsAppNotification({
          idempotencyKey: job.idempotencyKey,
          eventType: 'membership.incomplete_signup',
          templateName: 'feviqo_membership_incomplete',
          bodyParameters: [jobMember.fullName || 'Member', 'https://feviqo.com/membership'],
          recipientPhone: jobMember.phone || job.phoneE164,
          recipientName: jobMember.fullName,
          memberId: jobMember.id,
          categoryKey: 'unpaid_followups',
          manualFallbackSpec: {
            eventType: 'signup_followup_unpaid',
            customerEmail: jobMember.email,
          },
          ruleEnabled: settings.rules.signupNoPackageReminder,
        });
        finishJob('completed');
        jobsProcessed += 1;
        continue;
      }

      if (
        job.jobType === 'checkout_abandoned_reminder' ||
        job.jobType === 'checkout_abandoned_24h' ||
        job.jobType === 'checkout_abandoned_72h'
      ) {
        const order = job.orderId ? orderMap.get(job.orderId) : undefined;
        if (!order || order.status !== 'awaiting_payment' || !jobMember) {
          finishJob('cancelled', `Order is no longer awaiting_payment (status=${order?.status || 'missing'}).`);
          jobsCancelled += 1;
          continue;
        }
        const amountDisplay =
          order.currency === 'USD'
            ? `$${Number(order.amountUsd ?? order.expectedAmount ?? 0).toFixed(2)} USD`
            : `PKR ${order.amountPkr.toLocaleString()}`;
        await dispatchTemplateWhatsAppNotification({
          idempotencyKey: job.idempotencyKey,
          eventType: 'membership.payment_pending',
          templateName: 'feviqo_checkout_reminder',
          bodyParameters: [
            jobMember.fullName || 'Member',
            order.planName,
            amountDisplay,
            order.id,
            'https://feviqo.com/account',
          ],
          recipientPhone: jobMember.phone || job.phoneE164,
          recipientName: jobMember.fullName,
          memberId: jobMember.id,
          categoryKey: 'unpaid_followups',
          manualFallbackSpec: {
            eventType: 'unpaid_plan_reminder',
            customerEmail: jobMember.email,
            orderId: order.id,
            planName: order.planName,
            amountDisplay,
          },
          ruleEnabled: settings.rules.checkoutAbandonedReminder,
        });
        finishJob('completed');
        jobsProcessed += 1;
        continue;
      }

      if (
        job.jobType === 'membership_expiry_7d' ||
        job.jobType === 'membership_expiry_3d' ||
        job.jobType === 'membership_expiry_1d' ||
        job.jobType === 'membership_expired'
      ) {
        const sub = job.membershipId ? membershipMap.get(job.membershipId) : undefined;

        const isCancelledOrRenewed =
          !sub ||
          sub.status === 'cancelled' ||
          sub.expiresAt !== job.payload?.expiresAt ||
          (job.jobType !== 'membership_expired' && sub.status !== 'active');

        if (isCancelledOrRenewed || !jobMember) {
          finishJob('cancelled', 'Membership was renewed, cancelled, or revoked.');
          jobsCancelled += 1;
          continue;
        }

        const tplMap: Record<string, { name: string; enabled: boolean; manualType: OneClickEventType }> = {
          membership_expiry_7d: {
            name: 'feviqo_membership_expiry_7_days',
            enabled: settings.rules.expiryReminder7Days,
            manualType: 'expiry_reminder_7d',
          },
          membership_expiry_3d: {
            name: 'feviqo_membership_expiry_3_days',
            enabled: settings.rules.expiryReminder3Days,
            manualType: 'expiry_reminder_3d',
          },
          membership_expiry_1d: {
            name: 'feviqo_membership_expiry_1_day',
            enabled: settings.rules.expiryReminder1Day,
            manualType: 'expiry_reminder_1d',
          },
          membership_expired: {
            name: 'feviqo_membership_expired',
            enabled: settings.rules.expiryOnExpired,
            manualType: 'membership_expired',
          },
        };
        const chosen = tplMap[job.jobType];
        await dispatchTemplateWhatsAppNotification({
          idempotencyKey: job.idempotencyKey,
          eventType: job.jobType === 'membership_expired' ? 'membership.expired' : 'membership.expiring',
          templateName: chosen.name,
          bodyParameters: [
            jobMember.fullName || 'Member',
            sub.planName,
            formatReadableDate(sub.expiresAt),
            'https://feviqo.com/membership',
          ],
          recipientPhone: jobMember.phone || sub.customerPhone || job.phoneE164,
          recipientName: jobMember.fullName,
          memberId: jobMember.id,
          categoryKey: 'expiry',
          manualFallbackSpec: {
            eventType: chosen.manualType,
            customerEmail: jobMember.email,
            membershipId: sub.id,
            planName: sub.planName,
            expiryDate: sub.expiresAt,
          },
          ruleEnabled: chosen.enabled,
        });
        finishJob('completed');
        jobsProcessed += 1;
        continue;
      }

      if (job.jobType.startsWith('lead_followup_')) {
        const lead = job.leadId ? getVideoEditingLeadById(job.leadId) : undefined;
        const maxFollowUps = Math.max(1, settings.rules.maxLeadFollowUpsPerLead || 3);
        const stopLead =
          !lead ||
          lead.followUpPaused ||
          !lead.whatsappConsent ||
          lead.stage === 'booked' ||
          lead.stage === 'won' ||
          lead.stage === 'lost' ||
          lead.followUpsSentCount >= maxFollowUps ||
          (lead.lastLeadReplyAt && Date.parse(lead.lastLeadReplyAt) > Date.parse(job.createdAt));

        if (stopLead) {
          finishJob('cancelled', 'Lead replied, booked, closed, opted out, or reached frequency limit.');
          jobsCancelled += 1;
          continue;
        }

        const ruleEnabledMap: Record<string, boolean> = {
          lead_followup_no_reply: settings.rules.leadFollowUpNoResponse,
          lead_followup_pricing: settings.rules.leadFollowUpPricing,
          lead_followup_quote: settings.rules.leadFollowUpQuoteNotAccepted,
          lead_followup_booking: settings.rules.leadFollowUpBookingIncomplete,
          lead_followup_returning: settings.rules.leadFollowUpReturningClient,
        };

        const msgLog = await dispatchTemplateWhatsAppNotification({
          idempotencyKey: job.idempotencyKey,
          eventType: job.jobType,
          templateName: 'feviqo_quote_followup',
          bodyParameters: [
            lead.fullName || 'there',
            lead.editingService || 'video editing',
            settings.ai.bookingUrl || 'https://feviqo.com/booking',
          ],
          recipientPhone: lead.whatsappE164 || job.phoneE164,
          recipientName: lead.fullName,
          leadId: lead.id,
          categoryKey: 'creative_enquiries',
          manualFallbackSpec: {
            eventType: 'creative_enquiry',
            customerEmail: lead.email,
            serviceName: lead.editingService,
          },
          ruleEnabled: Boolean(ruleEnabledMap[job.jobType]),
          explicitLeadConsent: lead.whatsappConsent,
        });

        if (msgLog?.status === 'api_accepted' || msgLog?.status === 'sent') {
          lead.followUpsSentCount = (lead.followUpsSentCount || 0) + 1;
          lead.updatedAt = new Date().toISOString();
          saveVideoEditingLead(lead);
        }

        finishJob('completed');
        jobsProcessed += 1;
      }
    }

    // 3. Process due failed-message retries with exponential backoff (TRANSIENT errors only!)
    if (!options?.targetBroadcastId) {
      const allMsgs = readJson<WhatsAppMessageLog[]>(WA_MESSAGES_FILE, []);
      for (const msg of allMsgs) {
        if (msg.direction !== 'outbound' || msg.status !== 'failed') continue;
        if (!msg.nextRetryAt || msg.attempts >= (msg.maxAttempts || 4)) continue;
        const classified = classifyWhatsAppSendError(msg.errorCode, msg.errorMessage, msg.httpStatus);
        if (msg.retryable === false || !classified.retryable) {
          // Permanently failed (e.g. #132000, #132001, invalid phone) — clear nextRetryAt so it stops looping!
          msg.retryable = false;
          msg.errorCategory = classified.category;
          msg.errorExplanation = {
            humanTitle: classified.humanTitle,
            whatWentWrong: classified.whatWentWrong,
            component: classified.component,
            needsAdminAction: classified.needsAdminAction,
            systemAction: classified.systemAction,
          };
          msg.nextRetryAt = undefined;
          msg.updatedAt = new Date().toISOString();
          saveWhatsAppMessageLog(msg);
          continue;
        }
        if (Date.parse(msg.nextRetryAt) <= nowMs) {
          await retryFailedWhatsAppMessage(msg.id);
          retriesAttempted += 1;
        }
      }
    }

    const summary = `Processed ${jobsProcessed} job(s), cancelled ${jobsCancelled}, retried ${retriesAttempted}, ensured ${expiryJobsEnsured} expiry schedule(s).`;
    saveAutomationSettings({
      lastWorkerRunAt: ranAt,
      lastWorkerHeartbeatAt: ranAt,
      lastSuccessfulRunAt: ranAt,
      lastWorkerSummary: summary,
    });
    return { ranAt, paused: false, jobsProcessed, jobsCancelled, retriesAttempted, expiryJobsEnsured, summary };
  } catch (err) {
    console.warn('[AutomationWorker] Cycle error:', err);
    return {
      ranAt,
      paused: false,
      jobsProcessed,
      jobsCancelled,
      retriesAttempted,
      expiryJobsEnsured,
      summary: `Worker error: ${(err as Error)?.message || 'Unknown error'}`,
    };
  } finally {
    workerRunning = false;
  }
}

// --- CUSTOMER AUDIENCE SEGMENTATION (REAL FIRESTORE/BACKEND DATA) ---
export interface CustomerAudienceSegments {
  totalRegistered: number;
  blockedAccounts: number;
  whatsappEligible: number;
  withoutWhatsappPermission: number;
  optedOut: number;
  invalidPhones: number;
  neverPurchased: number;
  selectedPlanUnpaid: number;
  paymentProofSubmitted: number;
  awaitingAdminApproval: number;
  activePaidMembers: number;
  expiredMembers: number;
  cancelledMembers: number;
  rejectedPaymentCustomers: number;
  pendingRenewals: number;
}

export function computeCustomerAudienceSegments(): CustomerAudienceSegments {
  const { members, orders, memberships } = getAutomationMembershipSnapshot();
  const blockedSets = getBlockedLookupSets();
  const isBlocked = (email?: string, phone?: string) => {
    const e = String(email || '').trim().toLowerCase();
    const p = normalizeBlockedPhone(phone);
    return (Boolean(e) && blockedSets.emails.has(e)) || (Boolean(p) && blockedSets.phones.has(p));
  };

  const nonBlocked = members.filter((m) => !isBlocked(m.email, m.phone));
  const nowMs = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  let whatsappEligible = 0;
  let withoutWhatsappPermission = 0;
  let optedOut = 0;
  let invalidPhones = 0;
  let neverPurchased = 0;
  let selectedPlanUnpaid = 0;
  let paymentProofSubmitted = 0;
  let activePaidMembers = 0;
  let expiredMembers = 0;
  let cancelledMembers = 0;
  let rejectedPaymentCustomers = 0;
  let pendingRenewals = 0;

  const preferences = listAllNotificationPreferences();

  for (const m of nonBlocked) {
    const emailLower = String(m.email || '').trim().toLowerCase();
    const pref =
      preferences.find(
        (p) =>
          (p.memberId && p.memberId === m.id) ||
          (m.ownerUid && p.ownerUid && p.ownerUid === m.ownerUid) ||
          (emailLower && p.email && p.email.trim().toLowerCase() === emailLower)
      ) || null;
    const contact = resolveCustomerWhatsAppContact({
      member: m,
      preference: pref,
      memberships,
      orders,
    });

    if (!contact.phoneValid) {
      invalidPhones += 1;
    } else if (contact.optedOut) {
      optedOut += 1;
    } else if (contact.hasExplicitConsent) {
      whatsappEligible += 1;
    } else {
      withoutWhatsappPermission += 1;
    }

    const mOrders = orders.filter((o) => o.memberId === m.id);
    const mSubs = memberships.filter((s) => s.memberId === m.id);
    const activeSubs = mSubs.filter((s) => s.status === 'active' && Date.parse(s.expiresAt) > nowMs);

    if (mOrders.length === 0 && mSubs.length === 0) {
      neverPurchased += 1;
    }
    if (mOrders.some((o) => o.status === 'awaiting_payment')) {
      selectedPlanUnpaid += 1;
    }
    if (mOrders.some((o) => o.status === 'pending_verification')) {
      paymentProofSubmitted += 1;
    }
    if (activeSubs.length > 0) {
      activePaidMembers += 1;
      if (activeSubs.some((s) => Date.parse(s.expiresAt) - nowMs <= sevenDaysMs)) {
        pendingRenewals += 1;
      }
    } else if (mSubs.some((s) => s.status === 'expired' || (s.status === 'active' && Date.parse(s.expiresAt) <= nowMs))) {
      expiredMembers += 1;
    } else if (mSubs.some((s) => s.status === 'cancelled')) {
      cancelledMembers += 1;
    }
    if (mOrders.some((o) => o.status === 'rejected') && activeSubs.length === 0) {
      rejectedPaymentCustomers += 1;
    }
  }

  return {
    totalRegistered: nonBlocked.length,
    blockedAccounts: listBlockedUsers().length,
    whatsappEligible,
    withoutWhatsappPermission,
    optedOut,
    invalidPhones,
    neverPurchased,
    selectedPlanUnpaid,
    paymentProofSubmitted,
    awaitingAdminApproval: paymentProofSubmitted,
    activePaidMembers,
    expiredMembers,
    cancelledMembers,
    rejectedPaymentCustomers,
    pendingRenewals,
  };
}

// --- HISTORICAL CAMPAIGN PREVIEW & EXPLICIT ADMIN LAUNCH (NEVER RUNS ON DEPLOY) ---
export type HistoricalCampaignSegment =
  | 'never_purchased'
  | 'selected_plan_unpaid'
  | 'expired_members'
  | 'pending_renewals'
  | 'all_consented';

export function previewHistoricalCampaign(segment: HistoricalCampaignSegment) {
  const { members, orders, memberships } = getAutomationMembershipSnapshot();
  const blockedSets = getBlockedLookupSets();
  const nowMs = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const matching = members.filter((m) => {
    const e = String(m.email || '').trim().toLowerCase();
    const p = normalizeBlockedPhone(m.phone);
    if ((e && blockedSets.emails.has(e)) || (p && blockedSets.phones.has(p))) return false;
    const mOrders = orders.filter((o) => o.memberId === m.id);
    const mSubs = memberships.filter((s) => s.memberId === m.id);
    const hasActive = mSubs.some((s) => s.status === 'active' && Date.parse(s.expiresAt) > nowMs);

    switch (segment) {
      case 'never_purchased':
        return mOrders.length === 0 && mSubs.length === 0;
      case 'selected_plan_unpaid':
        return mOrders.some((o) => o.status === 'awaiting_payment') && !hasActive;
      case 'expired_members':
        return !hasActive && mSubs.some((s) => s.status === 'expired' || Date.parse(s.expiresAt) <= nowMs);
      case 'pending_renewals':
        return mSubs.some((s) => s.status === 'active' && Date.parse(s.expiresAt) > nowMs && Date.parse(s.expiresAt) - nowMs <= sevenDaysMs);
      case 'all_consented':
        return true;
    }
  });

  const recipients = matching.map((m) => {
    const formatted = formatWhatsAppRecipient(m.phone);
    const pref = getMemberNotificationPreferences({ memberId: m.id, phone: m.phone });
    const eligible = Boolean(
      formatted.valid && pref && !pref.optedOut && (pref.membershipUpdates || pref.renewalReminders || pref.promotionalMessages)
    );
    return {
      memberId: m.id,
      fullName: m.fullName,
      email: m.email,
      maskedPhone: maskPhoneForDisplay(formatted.valid ? formatted.e164 : m.phone),
      phoneValid: formatted.valid,
      eligibleForAutomatic: eligible,
      optedOut: Boolean(pref?.optedOut),
    };
  });

  return {
    segment,
    totalMatching: recipients.length,
    eligibleAutomaticCount: recipients.filter((r) => r.eligibleForAutomatic).length,
    validPhoneManualCount: recipients.filter((r) => r.phoneValid && !r.optedOut).length,
    optedOutCount: recipients.filter((r) => r.optedOut).length,
    recipients: recipients.slice(0, 100),
  };
}

export async function launchHistoricalCampaign(params: {
  segment: HistoricalCampaignSegment;
  sendingMode: WhatsAppSendingMode;
  admin: { id: string; email: string };
}) {
  const preview = previewHistoricalCampaign(params.segment);
  const campaignId = makeId('camp');
  const nowIso = new Date().toISOString();
  const { members } = getAutomationMembershipSnapshot();
  const memberMap = new Map(members.map((m) => [m.id, m]));

  let queuedAutomatic = 0;
  let queuedManual = 0;
  let skipped = 0;

  for (const r of preview.recipients) {
    const member = memberMap.get(r.memberId);
    if (!member || r.optedOut || !r.phoneValid) {
      skipped += 1;
      continue;
    }
    const manualEventType: OneClickEventType =
      params.segment === 'selected_plan_unpaid'
        ? 'unpaid_plan_reminder'
        : params.segment === 'expired_members'
        ? 'membership_expired'
        : params.segment === 'pending_renewals'
        ? 'expiry_reminder_7d'
        : 'signup_followup_unpaid';

    if (params.sendingMode === 'manual') {
      const qRes = enqueueOneClickWhatsAppNotification({
        idempotencyKey: `campaign:${campaignId}:${member.id}`,
        eventType: manualEventType,
        customerName: member.fullName,
        customerEmail: member.email,
        memberId: member.id,
        rawPhone: member.phone,
        bypassConsentCheck: true,
        bypassCategoryGate: true,
      });
      if (qRes.ok) queuedManual += 1;
      else skipped += 1;
    } else if (params.sendingMode === 'automatic' || params.sendingMode === 'automatic_with_fallback') {
      if (!r.eligibleForAutomatic && params.sendingMode === 'automatic') {
        skipped += 1;
        continue;
      }
      scheduleAutomationJob({
        jobType: 'historical_campaign_delivery',
        idempotencyKey: `campaign:${campaignId}:${member.id}`,
        runAtIso: nowIso,
        memberId: member.id,
        phoneE164: normalizePhoneE164(member.phone) || undefined,
        payload: {
          campaignId,
          segment: params.segment,
          sendingMode: params.sendingMode,
          templateName: 'feviqo_membership_incomplete',
          manualEventType,
          memberName: member.fullName,
          memberEmail: member.email,
          bodyParameters: [member.fullName || 'Member', 'https://feviqo.com/membership'],
        },
      });
      queuedAutomatic += 1;
    }
  }

  if (queuedAutomatic > 0 && getAutomationSettings().automationRunning) {
    await runAutomationWorkerCycle({ trigger: `campaign:${campaignId}` });
  }

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'historical_campaign_launched',
    targetId: campaignId,
    details: `Segment=${params.segment}, mode=${params.sendingMode}, automaticQueued=${queuedAutomatic}, manualQueued=${queuedManual}, skipped=${skipped}`,
  });

  return {
    ok: true,
    campaignId,
    segment: params.segment,
    sendingMode: params.sendingMode,
    queuedAutomatic,
    queuedManual,
    skipped,
    automationRunning: getAutomationSettings().automationRunning,
  };
}

// --- HYDRATE FROM FIRESTORE ON BOOT ---
export async function hydrateAutomationStoreFromFirestore(): Promise<void> {
  try {
    const snap = await pullAutomationSnapshotFromFirestoreServer();
    if (!snap) return;

    if (snap.settings) {
      const current = getAutomationSettings();
      const remoteUpdated = Date.parse(snap.settings.updatedAtIso || snap.settings.updatedAt || '');
      const localUpdated = Date.parse(current.updatedAt || '');
      if (!Number.isNaN(remoteUpdated) && (Number.isNaN(localUpdated) || remoteUpdated > localUpdated)) {
        writeJson(WA_SETTINGS_FILE, { ...current, ...snap.settings });
      }
    }

    const mergeById = <T extends { id: string; updatedAt?: string }>(file: string, remote: T[]) => {
      if (!remote || remote.length === 0) return;
      const local = readJson<T[]>(file, []);
      const map = new Map(local.map((x) => [x.id, x]));
      for (const item of remote) {
        const existing = map.get(item.id);
        if (!existing || Date.parse(item.updatedAt || '') > Date.parse(existing.updatedAt || '')) {
          map.set(item.id, item);
        }
      }
      writeJson(file, Array.from(map.values()));
    };

    mergeById(WA_PREFS_FILE, snap.preferences);
    mergeById(WA_MESSAGES_FILE, snap.messages);
    mergeById(AUTOMATION_JOBS_FILE, snap.jobs);
    mergeById(EPISODE_BROADCASTS_FILE, snap.episodeBroadcasts);
    mergeById(VIDEO_LEADS_FILE, snap.leads);
    mergeById(WA_CONVERSATIONS_FILE, snap.conversations);
    mergeById(WA_WEBHOOK_EVENTS_FILE, snap.webhookEvents || []);

    if (Array.isArray(snap.webhookDedupe) && snap.webhookDedupe.length > 0) {
      const localKeys = readJson<string[]>(WEBHOOK_DEDUPE_FILE, []);
      const keySet = new Set(localKeys);
      for (const item of snap.webhookDedupe) {
        if (typeof item?.eventKey === 'string' && item.eventKey) {
          keySet.add(item.eventKey);
        }
      }
      writeJson(WEBHOOK_DEDUPE_FILE, Array.from(keySet).slice(0, 3000));
    }
  } catch (err) {
    console.warn('[AutomationStore] Firestore hydration skipped:', (err as Error)?.message || err);
  }
}

// --- ADMIN CUSTOMER CONTACT AUDIT & SAFE BACKFILL ---
export async function runAdminCustomerContactAudit(): Promise<CustomerContactAuditReport> {
  const { members, memberships, orders } = getAutomationMembershipSnapshot();
  const preferences = listAllNotificationPreferences();
  const firebaseAuthLookup = await listFirebaseAuthUsersPhoneMap();
  return buildCustomerContactAuditReport({
    members,
    preferences,
    memberships,
    orders,
    firebaseAuthLookup,
  });
}

// --- ADMIN OVERVIEW AGGREGATOR ---
export function getAdminAutomationOverview() {
  const settings = getAutomationSettings();
  const envStatus = getWhatsAppEnvConfigStatus();
  const rawMessages = listWhatsAppMessages(400);
  const jobs = listAutomationJobs(300);
  const preferences = listAllNotificationPreferences();
  const episodeBroadcasts = listEpisodeBroadcasts(100);
  const leads = listVideoEditingLeads();
  const conversations = listWhatsAppConversations();
  const webhookEvents = listWebhookEvents(100);
  const failedWebhookEvents = webhookEvents.filter(
    (e) => e.status === 'rejected' || e.status === 'error'
  );
  const audienceSegments = computeCustomerAudienceSegments();
  const manualDashboard = getOneClickNotificationsDashboard({ limit: 50 });

  // Attach plain-language error explanation & retryable classification to all failed outbound logs
  const messages = rawMessages.map((m) => {
    if (m.direction === 'outbound' && (m.status === 'failed' || m.status === 'not_configured')) {
      const classified = classifyWhatsAppSendError(m.errorCode, m.errorMessage, m.httpStatus);
      return {
        ...m,
        retryable: m.status === 'not_configured' ? false : m.retryable ?? classified.retryable,
        errorCategory: m.errorCategory || classified.category,
        errorExplanation: m.errorExplanation || {
          humanTitle: classified.humanTitle,
          whatWentWrong: classified.whatWentWrong,
          component: classified.component,
          needsAdminAction: classified.needsAdminAction,
          systemAction: classified.systemAction,
        },
      };
    }
    return m;
  });

  const outbound = messages.filter((m) => m.direction === 'outbound');
  const apiAcceptedCount = outbound.filter((m) => m.status === 'api_accepted').length;
  const sentCount = outbound.filter((m) => m.status === 'sent').length;
  const deliveredCount = outbound.filter((m) => m.status === 'delivered').length;
  const readCount = outbound.filter((m) => m.status === 'read').length;
  const failedCount = outbound.filter((m) => m.status === 'failed').length;
  const notConfiguredCount = outbound.filter((m) => m.status === 'not_configured').length;
  const skippedCount = outbound.filter((m) => m.status.startsWith('skipped_')).length;
  const inboundCount = messages.filter((m) => m.direction === 'inbound').length;

  const billableUtility = outbound.filter(
    (m) =>
      m.templateCategory === 'UTILITY' &&
      (m.status === 'api_accepted' || m.status === 'sent' || m.status === 'delivered' || m.status === 'read')
  ).length;
  const billableMarketing = outbound.filter(
    (m) =>
      m.templateCategory === 'MARKETING' &&
      (m.status === 'api_accepted' || m.status === 'sent' || m.status === 'delivered' || m.status === 'read')
  ).length;
  const estimatedTotalCostUsd = Number(
    outbound.reduce((sum, m) => sum + (Number(m.estimatedCostUsd) || 0), 0).toFixed(4)
  );

  const retryQueue = outbound.filter((m) => m.status === 'failed' || m.status === 'not_configured');
  const pendingAutoRetriesCount = retryQueue.filter(
    (m) => m.status === 'failed' && m.retryable !== false && Boolean(m.nextRetryAt)
  ).length;
  const permanentFailedCount = retryQueue.filter(
    (m) => m.status === 'failed' && m.retryable === false
  ).length;
  const pendingJobs = jobs.filter((j) => j.status === 'pending' || j.status === 'processing');

  const templates = WHATSAPP_TEMPLATES_CATALOG.map((tpl) => {
    const synced = settings.metaTemplateDetails?.[tpl.name];
    return {
      ...tpl,
      language: synced?.language || tpl.language,
      approvalStatus: settings.templateStatuses[tpl.name] || 'draft',
      rawMetaStatus: synced?.status,
      syncedBodyParamCount: synced?.bodyParamCount,
      qualityScore: synced?.qualityScore,
      rejectedReason: synced?.rejectedReason,
      lastSyncedAt: synced?.syncedAt,
    };
  });

  const dramasCatalog = MEMBERSHIP_DRAMAS.map((d) => ({
    id: d.id,
    title: d.title,
    slug: d.hubPath.replace(/^\/+|\/+$/g, '') || d.id,
    vipEligible: d.vipEligible,
    episodes: d.episodes.map((ep) => ({
      slug: ep.slug,
      number: ep.number,
      title: ep.title,
      releaseDate: ep.releaseDate,
      accessType: ep.accessType,
    })),
    audience: previewEpisodeNotificationAudience(d.id, { accessType: 'premium' }),
    freeAudience: previewEpisodeNotificationAudience(d.id, { accessType: 'free' }),
  }));

  const { members, memberships, orders } = getAutomationMembershipSnapshot();
  const quickAudit = buildCustomerContactAuditReport({
    members,
    preferences,
    memberships,
    orders,
  });

  const lastDeliveredMsg = outbound.find(
    (m) => m.status === 'delivered' || m.status === 'read' || m.status === 'sent' || m.status === 'api_accepted'
  );
  const approvedTemplatesCount = templates.filter((t) => t.approvalStatus === 'approved').length;

  const healthSummary = {
    apiConnected: envStatus.canSendMessages,
    apiStatusLabel: envStatus.canSendMessages ? 'Configured on Server' : 'Missing Meta Credentials',
    approvedTemplatesCount,
    totalTemplatesCount: templates.length,
    lastMetaTemplateSyncAt: settings.lastMetaTemplateSyncAt,
    phoneCoverageValid: quickAudit.totals.validPhones,
    phoneCoverageTotal: quickAudit.totals.totalAccounts,
    phoneMissingCount: quickAudit.totals.missingPhones + quickAudit.totals.invalidPhones,
    phoneBackfillableCount: quickAudit.totals.backfillableFromExistingRecords,
    consentCoverageCount: quickAudit.totals.consentedAccounts,
    eligibleWhatsappCount: quickAudit.totals.usableForWhatsApp,
    failedMessagesCount: failedCount,
    permanentFailedCount,
    pendingAutoRetriesCount,
    lastSuccessfulDeliveryAt:
      lastDeliveredMsg?.deliveredAt || lastDeliveredMsg?.sentAt || lastDeliveredMsg?.createdAt,
  };

  return {
    envStatus,
    aiConfigured: isAiAssistantConfigured(),
    settings,
    healthSummary,
    contactAuditSummary: quickAudit.totals,
    audienceSegments,
    manualQueueStats: manualDashboard.stats,
    stats: {
      totalOutbound: outbound.length,
      totalInbound: inboundCount,
      apiAccepted: apiAcceptedCount,
      sent: sentCount,
      delivered: deliveredCount,
      read: readCount,
      openedInWhatsApp: manualDashboard.stats.opened,
      manuallyConfirmedSent: manualDashboard.stats.confirmedSent,
      manualPending: manualDashboard.stats.pending,
      failed: failedCount,
      permanentFailed: permanentFailedCount,
      pendingAutoRetries: pendingAutoRetriesCount,
      notConfigured: notConfiguredCount,
      skipped: skippedCount,
      pendingJobs: pendingJobs.length,
      retryQueueCount: retryQueue.length,
      failedWebhooks: failedWebhookEvents.length,
      optedInUsers: preferences.filter((p) => !p.optedOut).length,
      optedOutUsers: preferences.filter((p) => p.optedOut).length,
      totalLeads: leads.length,
      activeConversations: conversations.length,
      billableUtility,
      billableMarketing,
      estimatedTotalCostUsd,
    },
    templates,
    messages,
    retryQueue,
    webhookEvents,
    failedWebhookEvents,
    jobs,
    preferences,
    episodeBroadcasts,
    dramasCatalog,
    leads,
    conversations,
  };
}

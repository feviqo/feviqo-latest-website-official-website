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
} from './whatsappClient';
import {
  mirrorDocToFirestoreServer,
  pullAutomationSnapshotFromFirestoreServer,
} from './firestoreAdmin';
import {
  getAutomationMembershipSnapshot,
  getEntitledActiveMembersForDrama,
  findMemberContextByPhoneDigits,
  appendAdminAudit,
} from './membershipStore';
import {
  generateFeviqoAiReply,
  isAiAssistantConfigured,
  AssistantIntent,
  ScopedCustomerContext,
} from './aiSupportAgent';

const DATA_DIR = path.join(process.cwd(), 'data');
const WA_SETTINGS_FILE = path.join(DATA_DIR, 'whatsapp_settings.json');
const WA_PREFS_FILE = path.join(DATA_DIR, 'whatsapp_preferences.json');
const WA_MESSAGES_FILE = path.join(DATA_DIR, 'whatsapp_messages.json');
const AUTOMATION_JOBS_FILE = path.join(DATA_DIR, 'automation_jobs.json');
const EPISODE_BROADCASTS_FILE = path.join(DATA_DIR, 'episode_broadcasts.json');
const VIDEO_LEADS_FILE = path.join(DATA_DIR, 'video_editing_leads.json');
const WA_CONVERSATIONS_FILE = path.join(DATA_DIR, 'whatsapp_conversations.json');
const WEBHOOK_DEDUPE_FILE = path.join(DATA_DIR, 'whatsapp_webhook_dedupe.json');

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
  | 'lead.created'
  | 'lead.qualified'
  | 'lead.quote_sent'
  | 'lead.booked';

export type WhatsAppMessageStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'not_configured'
  | 'skipped_no_consent'
  | 'skipped_opted_out'
  | 'skipped_rule_disabled'
  | 'skipped_template_unapproved';

export interface AutomationRulesConfig {
  masterEnabled: boolean;
  welcomeOnRegister: boolean;
  signupNoPackageReminder: boolean;
  signupNoPackageDelayMinutes: number;
  checkoutAbandonedReminder: boolean;
  checkoutAbandonedDelayMinutes: number;
  paymentProofReceived: boolean;
  paymentApproved: boolean;
  paymentRejected: boolean;
  expiryReminder7Days: boolean;
  expiryReminder3Days: boolean;
  expiryReminder1Day: boolean;
  expiryOnExpired: boolean;
  episodePublishedAlerts: boolean;
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
  rules: AutomationRulesConfig;
  ai: AiAssistantSettings;
  templateStatuses: Record<string, WhatsAppTemplateApprovalStatus>;
  estimatedUtilityCostUsd: number;
  estimatedMarketingCostUsd: number;
  lastWebhookReceivedAt?: string;
  lastWebhookVerifiedAt?: string;
  lastWorkerRunAt?: string;
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
  wamid?: string;
  idempotencyKey: string;
  eventType: string;
  recipientPhone: string;
  recipientName?: string;
  memberId?: string;
  leadId?: string;
  templateName?: string;
  templateCategory?: WhatsAppTemplateCategory;
  bodyParameters?: string[];
  bodyPreview: string;
  status: WhatsAppMessageStatus;
  attempts: number;
  maxAttempts: number;
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
  | 'checkout_abandoned_reminder'
  | 'membership_expiry_7d'
  | 'membership_expiry_3d'
  | 'membership_expiry_1d'
  | 'membership_expired'
  | 'lead_followup_no_reply'
  | 'lead_followup_pricing'
  | 'lead_followup_quote'
  | 'lead_followup_booking'
  | 'lead_followup_returning';

export interface AutomationScheduledJob {
  id: string;
  jobType: AutomationJobType;
  idempotencyKey: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  runAt: string;
  memberId?: string;
  orderId?: string;
  membershipId?: string;
  leadId?: string;
  phoneE164?: string;
  payload: Record<string, any>;
  attempts: number;
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
  status: WhatsAppMessageStatus;
  messageLogId?: string;
  error?: string;
}

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
  isResend: boolean;
  triggeredByAdminEmail: string;
  entitledCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  recipients: EpisodeBroadcastRecipient[];
  createdAt: string;
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

const DEFAULT_SETTINGS: WhatsAppAutomationSettings = {
  id: 'main',
  rules: {
    masterEnabled: true,
    welcomeOnRegister: true,
    signupNoPackageReminder: true,
    signupNoPackageDelayMinutes: 30,
    checkoutAbandonedReminder: true,
    checkoutAbandonedDelayMinutes: 45,
    paymentProofReceived: true,
    paymentApproved: true,
    paymentRejected: true,
    expiryReminder7Days: true,
    expiryReminder3Days: true,
    expiryReminder1Day: true,
    expiryOnExpired: true,
    episodePublishedAlerts: true,
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

// --- SETTINGS ---
export function getAutomationSettings(): WhatsAppAutomationSettings {
  const saved = readJson<Partial<WhatsAppAutomationSettings>>(WA_SETTINGS_FILE, {});
  return {
    id: 'main',
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
    updatedAt: saved.updatedAt || new Date().toISOString(),
  };
}

export function saveAutomationSettings(
  updates: Partial<{
    rules: Partial<AutomationRulesConfig>;
    ai: Partial<AiAssistantSettings>;
    templateStatuses: Record<string, WhatsAppTemplateApprovalStatus>;
    estimatedUtilityCostUsd: number;
    estimatedMarketingCostUsd: number;
    lastWebhookReceivedAt: string;
    lastWebhookVerifiedAt: string;
    lastWorkerRunAt: string;
  }>,
  admin?: { id: string; email: string }
): WhatsAppAutomationSettings {
  const current = getAutomationSettings();
  const next: WhatsAppAutomationSettings = {
    ...current,
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
      details: 'Updated WhatsApp & business automation settings.',
    });
  }
  return next;
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

export async function dispatchTemplateWhatsAppNotification(params: {
  idempotencyKey: string;
  eventType: string;
  templateName: string;
  bodyParameters: string[];
  recipientPhone?: string;
  recipientName?: string;
  memberId?: string;
  leadId?: string;
  ruleEnabled: boolean;
  explicitLeadConsent?: boolean;
  bypassConsentForAdminTest?: boolean;
  bypassTemplateApprovalCheck?: boolean;
}): Promise<WhatsAppMessageLog | null> {
  if (!params.bypassConsentForAdminTest && hasDuplicateMessageByIdempotencyKey(params.idempotencyKey)) {
    return null;
  }

  const settings = getAutomationSettings();
  const tpl = getTemplateDraftByName(params.templateName);
  const category: WhatsAppTemplateCategory = tpl?.category || 'UTILITY';
  const costEstimate =
    category === 'MARKETING'
      ? settings.estimatedMarketingCostUsd
      : settings.estimatedUtilityCostUsd;
  const phoneE164 = normalizePhoneE164(params.recipientPhone) || String(params.recipientPhone || '');
  const now = new Date().toISOString();
  const preview = renderTemplatePreview(params.templateName, params.bodyParameters);

  const baseLog: WhatsAppMessageLog = {
    id: makeId('wamsg'),
    direction: 'outbound',
    idempotencyKey: params.idempotencyKey,
    eventType: params.eventType,
    recipientPhone: phoneE164 || 'missing_phone',
    recipientName: params.recipientName,
    memberId: params.memberId,
    leadId: params.leadId,
    templateName: params.templateName,
    templateCategory: category,
    bodyParameters: params.bodyParameters,
    bodyPreview: preview,
    status: 'queued',
    attempts: 0,
    maxAttempts: RETRY_BACKOFF_MINUTES.length,
    estimatedCostUsd: 0,
    createdAt: now,
    updatedAt: now,
  };

  if (!params.bypassConsentForAdminTest && (!settings.rules.masterEnabled || !params.ruleEnabled)) {
    baseLog.status = 'skipped_rule_disabled';
    baseLog.errorMessage = 'Automation rule is disabled in Admin Automation Settings.';
    saveWhatsAppMessageLog(baseLog);
    return baseLog;
  }

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

  const tplApproval = settings.templateStatuses[params.templateName] || 'draft';
  if (!params.bypassTemplateApprovalCheck && tplApproval !== 'approved') {
    baseLog.status = 'skipped_template_unapproved';
    baseLog.errorMessage = `Template "${params.templateName}" is currently "${tplApproval}". Submit & approve it in Meta WhatsApp Manager, then mark as Approved in /admin/automation.`;
    saveWhatsAppMessageLog(baseLog);
    return baseLog;
  }

  baseLog.attempts = 1;
  const sendRes = await sendWhatsAppTemplateMessage({
    toPhone: phoneE164,
    templateName: params.templateName,
    languageCode: tpl?.language || 'en',
    bodyParameters: params.bodyParameters,
  });

  const finishedAt = new Date().toISOString();
  if (sendRes.ok) {
    baseLog.status = 'sent';
    baseLog.wamid = sendRes.messageId;
    baseLog.sentAt = finishedAt;
    baseLog.estimatedCostUsd = costEstimate;
    baseLog.updatedAt = finishedAt;
  } else if (sendRes.notConfigured) {
    baseLog.status = 'not_configured';
    baseLog.errorMessage = sendRes.error;
    baseLog.failedAt = finishedAt;
    baseLog.updatedAt = finishedAt;
  } else {
    baseLog.status = 'failed';
    baseLog.errorMessage = sendRes.error || 'Meta API delivery error.';
    baseLog.errorCode = sendRes.errorCode;
    baseLog.failedAt = finishedAt;
    baseLog.nextRetryAt = computeNextRetryIso(baseLog.attempts);
    baseLog.updatedAt = finishedAt;
  }

  saveWhatsAppMessageLog(baseLog);
  return baseLog;
}

export async function retryFailedWhatsAppMessage(messageId: string): Promise<{
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

  const now = new Date().toISOString();
  target.attempts = (target.attempts || 0) + 1;
  target.updatedAt = now;

  const sendRes = target.templateName
    ? await sendWhatsAppTemplateMessage({
        toPhone: target.recipientPhone,
        templateName: target.templateName,
        bodyParameters: target.bodyParameters || [],
      })
    : await sendWhatsAppTextMessage({
        toPhone: target.recipientPhone,
        body: target.bodyPreview,
      });

  const settings = getAutomationSettings();
  if (sendRes.ok) {
    target.status = 'sent';
    target.wamid = sendRes.messageId;
    target.sentAt = new Date().toISOString();
    target.errorMessage = undefined;
    target.nextRetryAt = undefined;
    target.estimatedCostUsd =
      target.templateCategory === 'MARKETING'
        ? settings.estimatedMarketingCostUsd
        : settings.estimatedUtilityCostUsd;
  } else if (sendRes.notConfigured) {
    target.status = 'not_configured';
    target.errorMessage = sendRes.error;
    target.nextRetryAt = undefined;
  } else {
    target.status = 'failed';
    target.errorMessage = sendRes.error || 'Retry failed.';
    target.errorCode = sendRes.errorCode;
    target.failedAt = new Date().toISOString();
    target.nextRetryAt = computeNextRetryIso(target.attempts);
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
  leadId?: string;
  phoneE164?: string;
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
    leadId: params.leadId,
    phoneE164: params.phoneE164,
    payload: params.payload || {},
    attempts: 0,
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
    const baseUrl = (process.env.APP_URL || 'https://feviqo.com').replace(/\/+$/, '');
    const publicBaseUrl = baseUrl.includes('feviqo.com') ? 'https://feviqo.com' : 'https://feviqo.com';

    switch (eventType) {
      case 'user.registered': {
        const { memberId, fullName, email, phone, whatsappOptIn, consentSource } = payload;
        const phoneE164 = normalizePhoneE164(phone);
        if (phoneE164 && whatsappOptIn === true) {
          upsertMemberNotificationPreferences({
            memberId,
            email,
            fullName,
            phone: phoneE164,
            membershipUpdates: true,
            renewalReminders: true,
            newEpisodeAlerts: true,
            promotionalMessages: Boolean(payload.promotionalOptIn),
            source: consentSource || 'registration_form',
          });
        }
        await dispatchTemplateWhatsAppNotification({
          idempotencyKey: `user.registered:${memberId}`,
          eventType: 'user.registered',
          templateName: 'feviqo_welcome',
          bodyParameters: [fullName || 'Member', `${publicBaseUrl}/membership`],
          recipientPhone: phoneE164 || phone,
          recipientName: fullName,
          memberId,
          ruleEnabled: settings.rules.welcomeOnRegister,
        });

        // Schedule 30-minute incomplete-package reminder
        const delayMins = Math.max(5, Number(settings.rules.signupNoPackageDelayMinutes) || 30);
        scheduleAutomationJob({
          jobType: 'signup_no_package_30m',
          idempotencyKey: `signup_no_package_30m:${memberId}`,
          runAtIso: new Date(Date.now() + delayMins * 60 * 1000).toISOString(),
          memberId,
          phoneE164: phoneE164 || undefined,
          payload: { fullName: fullName || 'Member' },
        });
        break;
      }

      case 'membership.plan_selected':
      case 'membership.payment_pending': {
        const { memberId, fullName, phone, orderId, planName, amountDisplay } = payload;
        // User selected a package -> cancel the "no package selected" reminder immediately
        cancelScheduledJobs(
          (j) => j.memberId === memberId && j.jobType === 'signup_no_package_30m',
          `User selected package (${planName || 'plan'})`
        );

        const delayMins = Math.max(5, Number(settings.rules.checkoutAbandonedDelayMinutes) || 45);
        scheduleAutomationJob({
          jobType: 'checkout_abandoned_reminder',
          idempotencyKey: `checkout_abandoned_reminder:${orderId}`,
          runAtIso: new Date(Date.now() + delayMins * 60 * 1000).toISOString(),
          memberId,
          orderId,
          phoneE164: normalizePhoneE164(phone) || undefined,
          payload: {
            fullName: fullName || 'Member',
            planName: planName || 'Premium',
            amountDisplay: amountDisplay || '',
            orderId,
          },
        });
        break;
      }

      case 'membership.proof_submitted': {
        const { memberId, fullName, phone, orderId, planName } = payload;
        // Stop checkout abandonment reminders immediately upon payment proof submission
        cancelScheduledJobs(
          (j) =>
            (j.orderId === orderId || j.memberId === memberId) &&
            (j.jobType === 'checkout_abandoned_reminder' || j.jobType === 'signup_no_package_30m'),
          `Payment proof submitted for order ${orderId}`
        );

        await dispatchTemplateWhatsAppNotification({
          idempotencyKey: `membership.proof_submitted:${orderId}:${payload.proofSubmittedAt || '1'}`,
          eventType: 'membership.proof_submitted',
          templateName: 'feviqo_payment_received',
          bodyParameters: [fullName || 'Member', planName || 'Premium', orderId || ''],
          recipientPhone: phone,
          recipientName: fullName,
          memberId,
          ruleEnabled: settings.rules.paymentProofReceived,
        });
        break;
      }

      case 'membership.approved': {
        const {
          memberId,
          fullName,
          phone,
          orderId,
          membershipId,
          planName,
          dramaTitles,
          activatedAt,
          expiresAt,
        } = payload;

        cancelScheduledJobs(
          (j) =>
            (j.orderId === orderId || j.memberId === memberId) &&
            (j.jobType === 'checkout_abandoned_reminder' || j.jobType === 'signup_no_package_30m'),
          `Payment approved for order ${orderId}`
        );

        await dispatchTemplateWhatsAppNotification({
          idempotencyKey: `membership.approved:${orderId || membershipId}`,
          eventType: 'membership.approved',
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
          ruleEnabled: settings.rules.paymentApproved,
        });

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
        const { memberId, fullName, phone, orderId, rejectionReason } = payload;
        // NEVER invent a rejection reason
        const actualReason = String(rejectionReason || '').trim();
        if (!actualReason) break;

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
          ruleEnabled: settings.rules.paymentRejected,
        });
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

      case 'lead.created': {
        const lead = payload.lead as VideoEditingLead | undefined;
        if (!lead) break;

        if (lead.whatsappConsent && lead.whatsappE164) {
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
            ruleEnabled: settings.rules.leadImmediateAcknowledgement,
            explicitLeadConsent: true,
          });

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

// --- EPISODE PUBLISHING BROADCAST ENGINE ---
export function listEpisodeBroadcasts(limit = 100): EpisodeBroadcastRecord[] {
  return readJson<EpisodeBroadcastRecord[]>(EPISODE_BROADCASTS_FILE, []).slice(0, limit);
}

export function previewEpisodeNotificationAudience(dramaId: string): {
  dramaTitle: string;
  entitledActiveCount: number;
  consentedCount: number;
  optedOutOrNoConsentCount: number;
  alreadyBroadcastSlugs: string[];
} {
  const drama = getDramaById(dramaId);
  const entitled = getEntitledActiveMembersForDrama(dramaId);
  let consentedCount = 0;
  for (const item of entitled) {
    const consent = checkConsentForCategory({
      memberId: item.member.id,
      phone: item.member.phone,
      category: 'newEpisodeAlerts',
    });
    if (consent.allowed) consentedCount += 1;
  }
  const prior = listEpisodeBroadcasts(200)
    .filter((b) => b.dramaId === dramaId)
    .map((b) => b.episodeSlug);

  return {
    dramaTitle: drama?.title || dramaId,
    entitledActiveCount: entitled.length,
    consentedCount,
    optedOutOrNoConsentCount: Math.max(0, entitled.length - consentedCount),
    alreadyBroadcastSlugs: Array.from(new Set(prior)),
  };
}

export async function triggerEpisodePublishedBroadcast(params: {
  dramaId: string;
  episodeSlug: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  episodeUrl?: string;
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

  const settings = getAutomationSettings();
  const entitled = getEntitledActiveMembersForDrama(drama.id);
  const episodeUrl =
    params.episodeUrl || `https://feviqo.com${drama.hubPath.replace(/\/+$/, '')}/${cleanSlug}`;
  const resendSuffix = params.forceResend ? `:resend:${Date.now()}` : '';

  const recipients: EpisodeBroadcastRecipient[] = [];
  let sentCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const { member, membership } of entitled) {
    const phoneE164 = normalizePhoneE164(member.phone) || '';
    const msgLog = await dispatchTemplateWhatsAppNotification({
      idempotencyKey: `episode.published:${broadcastKey}:${member.id}${resendSuffix}`,
      eventType: 'episode.published',
      templateName: 'feviqo_new_episode',
      bodyParameters: [
        drama.title,
        String(params.seasonNumber || 1),
        String(params.episodeNumber),
        episodeUrl,
      ],
      recipientPhone: phoneE164,
      recipientName: member.fullName,
      memberId: member.id,
      ruleEnabled: settings.rules.episodePublishedAlerts,
    });

    const status = msgLog?.status || 'skipped_no_consent';
    if (status === 'sent' || status === 'delivered' || status === 'read') {
      sentCount += 1;
    } else if (status === 'failed' || status === 'not_configured') {
      failedCount += 1;
    } else {
      skippedCount += 1;
    }

    recipients.push({
      memberId: member.id,
      memberName: member.fullName,
      phoneE164: phoneE164 || member.phone || 'missing',
      planId: membership.planId,
      status,
      messageLogId: msgLog?.id,
      error: msgLog?.errorMessage,
    });
  }

  const broadcast: EpisodeBroadcastRecord = {
    id: makeId('epcast'),
    broadcastKey,
    dramaId: drama.id,
    dramaTitle: drama.title,
    seasonNumber: Number(params.seasonNumber) || 1,
    episodeNumber: Number(params.episodeNumber),
    episodeSlug: cleanSlug,
    episodeTitle: params.episodeTitle || `${drama.title} Episode ${params.episodeNumber}`,
    episodeUrl,
    isResend: Boolean(params.forceResend && existing),
    triggeredByAdminEmail: params.adminEmail,
    entitledCount: entitled.length,
    sentCount,
    failedCount,
    skippedCount,
    recipients,
    createdAt: new Date().toISOString(),
  };

  allBroadcasts.unshift(broadcast);
  writeJson(EPISODE_BROADCASTS_FILE, allBroadcasts.slice(0, 500));
  void mirrorDocToFirestoreServer('episodeBroadcasts', broadcast.id, {
    ...broadcast,
    createdAtIso: broadcast.createdAt,
  });

  if (params.adminId) {
    appendAdminAudit({
      adminId: params.adminId,
      adminEmail: params.adminEmail,
      action: params.forceResend ? 'episode_notification_resent' : 'episode_notification_sent',
      targetId: broadcast.id,
      details: `${drama.title} S${broadcast.seasonNumber}E${broadcast.episodeNumber}: entitled=${entitled.length}, sent=${sentCount}, skipped=${skippedCount}, failed=${failedCount}`,
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

// --- WEBHOOK DUPLICATE PROTECTION & EVENT PROCESSOR ---
function isWebhookEventProcessed(eventKey: string): boolean {
  const seen = readJson<string[]>(WEBHOOK_DEDUPE_FILE, []);
  return seen.includes(eventKey);
}

function markWebhookEventProcessed(eventKey: string): void {
  const seen = readJson<string[]>(WEBHOOK_DEDUPE_FILE, []);
  if (seen.includes(eventKey)) return;
  seen.unshift(eventKey);
  writeJson(WEBHOOK_DEDUPE_FILE, seen.slice(0, 3000));
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

// --- SCHEDULED BACKGROUND WORKER (DELAYED REMINDERS + EXPIRY SYNC + RETRY QUEUE) ---
let workerRunning = false;

export async function runAutomationWorkerCycle(): Promise<{
  ranAt: string;
  jobsProcessed: number;
  jobsCancelled: number;
  retriesAttempted: number;
  expiryJobsEnsured: number;
}> {
  if (workerRunning) {
    return {
      ranAt: new Date().toISOString(),
      jobsProcessed: 0,
      jobsCancelled: 0,
      retriesAttempted: 0,
      expiryJobsEnsured: 0,
    };
  }
  workerRunning = true;
  const ranAt = new Date().toISOString();
  let jobsProcessed = 0;
  let jobsCancelled = 0;
  let retriesAttempted = 0;
  let expiryJobsEnsured = 0;

  try {
    const settings = getAutomationSettings();
    const { members, orders, memberships } = getAutomationMembershipSnapshot();
    const memberMap = new Map(members.map((m) => [m.id, m]));
    const orderMap = new Map(orders.map((o) => [o.id, o]));
    const membershipMap = new Map(memberships.map((s) => [s.id, s]));
    const nowMs = Date.now();

    // 1. Ensure expiry reminder jobs exist for all currently active memberships
    for (const sub of memberships) {
      if (sub.status !== 'active') continue;
      const expMs = Date.parse(sub.expiresAt);
      if (Number.isNaN(expMs)) continue;
      const member = memberMap.get(sub.memberId);
      const milestones: Array<{ jobType: AutomationJobType; offsetDays: number }> = [
        { jobType: 'membership_expiry_7d', offsetDays: 7 },
        { jobType: 'membership_expiry_3d', offsetDays: 3 },
        { jobType: 'membership_expiry_1d', offsetDays: 1 },
        { jobType: 'membership_expired', offsetDays: 0 },
      ];
      for (const m of milestones) {
        const runAtMs = expMs - m.offsetDays * 24 * 60 * 60 * 1000;
        if (runAtMs < nowMs - 24 * 60 * 60 * 1000) continue;
        const key = `${m.jobType}:${sub.id}:${sub.expiresAt}`;
        const existingJobs = readJson<AutomationScheduledJob[]>(AUTOMATION_JOBS_FILE, []);
        if (!existingJobs.some((j) => j.idempotencyKey === key)) {
          scheduleAutomationJob({
            jobType: m.jobType,
            idempotencyKey: key,
            runAtIso: new Date(Math.max(runAtMs, nowMs)).toISOString(),
            memberId: sub.memberId,
            membershipId: sub.id,
            phoneE164: normalizePhoneE164(member?.phone || sub.customerPhone) || undefined,
            payload: {
              memberName: member?.fullName || sub.customerName || 'Member',
              planName: sub.planName,
              expiresAt: sub.expiresAt,
            },
          });
          expiryJobsEnsured += 1;
        }
      }
    }

    // 2. Process due pending scheduled jobs
    const allJobs = readJson<AutomationScheduledJob[]>(AUTOMATION_JOBS_FILE, []);
    for (const job of allJobs) {
      if (job.status !== 'pending') continue;
      const runMs = Date.parse(job.runAt);
      if (Number.isNaN(runMs) || runMs > nowMs) continue;

      job.attempts += 1;
      const nowIso = new Date().toISOString();

      if (job.jobType === 'signup_no_package_30m') {
        const member = job.memberId ? memberMap.get(job.memberId) : undefined;
        const hasAnyOrder = orders.some((o) => o.memberId === job.memberId);
        const hasAnySub = memberships.some((s) => s.memberId === job.memberId);
        if (!member || hasAnyOrder || hasAnySub) {
          job.status = 'cancelled';
          job.cancelReason = 'User already selected a package or has a membership.';
          job.updatedAt = nowIso;
          saveAutomationJob(job);
          jobsCancelled += 1;
          continue;
        }
        await dispatchTemplateWhatsAppNotification({
          idempotencyKey: job.idempotencyKey,
          eventType: 'membership.incomplete_signup',
          templateName: 'feviqo_membership_incomplete',
          bodyParameters: [member.fullName || 'Member', 'https://feviqo.com/membership'],
          recipientPhone: member.phone || job.phoneE164,
          recipientName: member.fullName,
          memberId: member.id,
          ruleEnabled: settings.rules.signupNoPackageReminder,
        });
        job.status = 'completed';
        job.completedAt = nowIso;
        job.updatedAt = nowIso;
        saveAutomationJob(job);
        jobsProcessed += 1;
        continue;
      }

      if (job.jobType === 'checkout_abandoned_reminder') {
        const order = job.orderId ? orderMap.get(job.orderId) : undefined;
        const member = job.memberId ? memberMap.get(job.memberId) : undefined;
        if (!order || order.status !== 'awaiting_payment' || !member) {
          job.status = 'cancelled';
          job.cancelReason = `Order is no longer awaiting_payment (status=${order?.status || 'missing'}).`;
          job.updatedAt = nowIso;
          saveAutomationJob(job);
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
            member.fullName || 'Member',
            order.planName,
            amountDisplay,
            order.id,
            'https://feviqo.com/account',
          ],
          recipientPhone: member.phone || job.phoneE164,
          recipientName: member.fullName,
          memberId: member.id,
          ruleEnabled: settings.rules.checkoutAbandonedReminder,
        });
        job.status = 'completed';
        job.completedAt = nowIso;
        job.updatedAt = nowIso;
        saveAutomationJob(job);
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
        const member = job.memberId ? memberMap.get(job.memberId) : undefined;

        const isCancelledOrRenewed =
          !sub ||
          sub.status === 'cancelled' ||
          sub.expiresAt !== job.payload?.expiresAt ||
          (job.jobType !== 'membership_expired' && sub.status !== 'active');

        if (isCancelledOrRenewed || !member) {
          job.status = 'cancelled';
          job.cancelReason = 'Membership was renewed, cancelled, or revoked.';
          job.updatedAt = nowIso;
          saveAutomationJob(job);
          jobsCancelled += 1;
          continue;
        }

        const tplMap: Record<string, { name: string; enabled: boolean }> = {
          membership_expiry_7d: {
            name: 'feviqo_membership_expiry_7_days',
            enabled: settings.rules.expiryReminder7Days,
          },
          membership_expiry_3d: {
            name: 'feviqo_membership_expiry_3_days',
            enabled: settings.rules.expiryReminder3Days,
          },
          membership_expiry_1d: {
            name: 'feviqo_membership_expiry_1_day',
            enabled: settings.rules.expiryReminder1Day,
          },
          membership_expired: {
            name: 'feviqo_membership_expired',
            enabled: settings.rules.expiryOnExpired,
          },
        };
        const chosen = tplMap[job.jobType];
        await dispatchTemplateWhatsAppNotification({
          idempotencyKey: job.idempotencyKey,
          eventType: job.jobType === 'membership_expired' ? 'membership.expired' : 'membership.expiring',
          templateName: chosen.name,
          bodyParameters: [
            member.fullName || 'Member',
            sub.planName,
            formatReadableDate(sub.expiresAt),
            'https://feviqo.com/membership',
          ],
          recipientPhone: member.phone || sub.customerPhone || job.phoneE164,
          recipientName: member.fullName,
          memberId: member.id,
          ruleEnabled: chosen.enabled,
        });
        job.status = 'completed';
        job.completedAt = nowIso;
        job.updatedAt = nowIso;
        saveAutomationJob(job);
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
          job.status = 'cancelled';
          job.cancelReason = 'Lead replied, booked, closed, opted out, or reached frequency limit.';
          job.updatedAt = nowIso;
          saveAutomationJob(job);
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
          ruleEnabled: Boolean(ruleEnabledMap[job.jobType]),
          explicitLeadConsent: lead.whatsappConsent,
        });

        if (msgLog?.status === 'sent') {
          lead.followUpsSentCount = (lead.followUpsSentCount || 0) + 1;
          lead.updatedAt = nowIso;
          saveVideoEditingLead(lead);
        }

        job.status = 'completed';
        job.completedAt = nowIso;
        job.updatedAt = nowIso;
        saveAutomationJob(job);
        jobsProcessed += 1;
      }
    }

    // 3. Process due failed-message retries with exponential backoff
    const allMsgs = readJson<WhatsAppMessageLog[]>(WA_MESSAGES_FILE, []);
    for (const msg of allMsgs) {
      if (msg.direction !== 'outbound' || msg.status !== 'failed') continue;
      if (!msg.nextRetryAt || msg.attempts >= (msg.maxAttempts || 4)) continue;
      if (Date.parse(msg.nextRetryAt) <= nowMs) {
        await retryFailedWhatsAppMessage(msg.id);
        retriesAttempted += 1;
      }
    }

    saveAutomationSettings({ lastWorkerRunAt: ranAt });
  } catch (err) {
    console.warn('[AutomationWorker] Cycle error:', err);
  } finally {
    workerRunning = false;
  }

  return { ranAt, jobsProcessed, jobsCancelled, retriesAttempted, expiryJobsEnsured };
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
  } catch (err) {
    console.warn('[AutomationStore] Firestore hydration skipped:', (err as Error)?.message || err);
  }
}

// --- ADMIN OVERVIEW AGGREGATOR ---
export function getAdminAutomationOverview() {
  const settings = getAutomationSettings();
  const envStatus = getWhatsAppEnvConfigStatus();
  const messages = listWhatsAppMessages(400);
  const jobs = listAutomationJobs(300);
  const preferences = listAllNotificationPreferences();
  const episodeBroadcasts = listEpisodeBroadcasts(100);
  const leads = listVideoEditingLeads();
  const conversations = listWhatsAppConversations();

  const outbound = messages.filter((m) => m.direction === 'outbound');
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
      (m.status === 'sent' || m.status === 'delivered' || m.status === 'read')
  ).length;
  const billableMarketing = outbound.filter(
    (m) =>
      m.templateCategory === 'MARKETING' &&
      (m.status === 'sent' || m.status === 'delivered' || m.status === 'read')
  ).length;
  const estimatedTotalCostUsd = Number(
    outbound.reduce((sum, m) => sum + (Number(m.estimatedCostUsd) || 0), 0).toFixed(4)
  );

  const retryQueue = outbound.filter((m) => m.status === 'failed' || m.status === 'not_configured');
  const pendingJobs = jobs.filter((j) => j.status === 'pending');

  const templates = WHATSAPP_TEMPLATES_CATALOG.map((tpl) => ({
    ...tpl,
    approvalStatus: settings.templateStatuses[tpl.name] || 'draft',
  }));

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
    audience: previewEpisodeNotificationAudience(d.id),
  }));

  return {
    envStatus,
    aiConfigured: isAiAssistantConfigured(),
    settings,
    stats: {
      totalOutbound: outbound.length,
      totalInbound: inboundCount,
      sent: sentCount,
      delivered: deliveredCount,
      read: readCount,
      failed: failedCount,
      notConfigured: notConfiguredCount,
      skipped: skippedCount,
      pendingJobs: pendingJobs.length,
      retryQueueCount: retryQueue.length,
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
    jobs,
    preferences,
    episodeBroadcasts,
    dramasCatalog,
    leads,
    conversations,
  };
}

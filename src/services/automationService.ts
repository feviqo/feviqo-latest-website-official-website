import { getAdminToken, getMemberToken } from './membershipService';

export interface CustomerNotificationPreferences {
  id: string;
  memberId?: string;
  ownerUid?: string;
  email?: string;
  fullName?: string;
  phoneE164: string;
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
  history: Array<{ changedAt: string; source: string; summary: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface WhatsAppEnvStatus {
  businessPhoneDisplay: string;
  phoneNumberId?: string;
  phoneNumberIdConfiguredInEnv?: boolean;
  businessAccountId?: string;
  businessAccountIdConfiguredInEnv?: boolean;
  metaAppId?: string;
  subscribedFields?: string[];
  apiVersion: string;
  apiVersionExplicitlySet: boolean;
  hasAccessToken: boolean;
  hasVerifyToken: boolean;
  hasPhoneNumberId: boolean;
  hasBusinessAccountId: boolean;
  hasAppSecret: boolean;
  canSendMessages: boolean;
  canVerifyWebhookChallenge: boolean;
  canVerifyWebhookSignature: boolean;
  missingEnvVars: string[];
  webhookEndpoint: string;
}

export interface WebhookEventView {
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

export type WhatsAppSendingMode =
  | 'automatic'
  | 'manual'
  | 'automatic_with_fallback'
  | 'disabled';

export type AutomationCategoryKey =
  | 'registration'
  | 'unpaid_followup'
  | 'payment_updates'
  | 'membership_expiry'
  | 'episode_alerts'
  | 'security_alerts'
  | 'creative_enquiries';

export type HistoricalCampaignSegment =
  | 'registered_never_purchased'
  | 'selected_plan_unpaid'
  | 'expired_memberships'
  | 'active_members';

export interface AutomationRulesConfig {
  masterEnabled: boolean;
  sendingMode?: WhatsAppSendingMode;
  categorySendingModes?: Record<AutomationCategoryKey, WhatsAppSendingMode>;
  welcomeOnRegister: boolean;
  signupNoPackageReminder: boolean;
  signupNoPackageDelayMinutes: number;
  signupFollowUp24h?: boolean;
  signupFollowUp72h?: boolean;
  checkoutAbandonedReminder: boolean;
  checkoutAbandonedDelayMinutes: number;
  unpaidCheckoutReminder2h?: boolean;
  unpaidCheckoutReminder24h?: boolean;
  unpaidCheckoutReminder72h?: boolean;
  paymentProofReceived: boolean;
  paymentApproved: boolean;
  paymentRejected: boolean;
  expiryReminder7Days: boolean;
  expiryReminder3Days: boolean;
  expiryReminder1Day: boolean;
  expiryOnExpired: boolean;
  episodePublishedAlerts: boolean;
  accountSecurityAlerts?: boolean;
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

export type TemplateApprovalStatus =
  | 'draft'
  | 'pending_meta_review'
  | 'approved'
  | 'rejected';

export interface WhatsAppTemplateView {
  name: string;
  displayName: string;
  category: 'UTILITY' | 'MARKETING';
  classificationNote: string;
  language: string;
  eventTrigger: string;
  consentCategory: string;
  bodyText: string;
  variables: Array<{ index: number; key: string; example: string }>;
  footerText?: string;
  approvalStatus: TemplateApprovalStatus;
}

export interface WhatsAppMessageLogView {
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
  templateCategory?: 'UTILITY' | 'MARKETING';
  bodyParameters?: string[];
  bodyPreview: string;
  status: string;
  sendingMethod?: 'automatic_api' | 'manual_whatsapp';
  httpStatus?: number;
  apiResponseSummary?: string;
  manualFallbackNotificationId?: string;
  broadcastId?: string;
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

export interface AutomationJobView {
  id: string;
  jobType: string;
  idempotencyKey: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  runAt: string;
  memberId?: string;
  orderId?: string;
  membershipId?: string;
  leadId?: string;
  phoneE164?: string;
  attempts: number;
  cancelReason?: string;
  completedAt?: string;
  createdAt: string;
}

export interface EpisodeAudienceRecipientPreview {
  memberId: string;
  memberName: string;
  email: string;
  rawPhone: string;
  phoneE164?: string;
  phoneValid: boolean;
  phoneError?: string;
  planId: string;
  planName?: string;
  membershipStatus: 'active' | 'expired' | 'free_registered' | 'pending_payment';
  entitledForDrama: boolean;
  whatsappOptedIn: boolean;
  whatsappOptedOut: boolean;
  alreadyNotified: boolean;
  eligibleForAutomatic: boolean;
  eligibleForManual: boolean;
  skipReason?: string;
}

export interface EpisodeAudiencePreviewResult {
  dramaId: string;
  dramaTitle: string;
  accessType: 'free' | 'premium';
  episodeSlug?: string;
  totalRegisteredNonBlocked: number;
  entitledActiveCount: number;
  audiencePoolCount: number;
  eligibleAutomaticCount: number;
  eligibleManualCount: number;
  missingConsentCount: number;
  optedOutCount: number;
  invalidPhoneCount: number;
  alreadyNotifiedCount: number;
  consentedCount: number;
  optedOutOrNoConsentCount: number;
  alreadyBroadcastSlugs: string[];
  recipients: EpisodeAudienceRecipientPreview[];
}

export interface EpisodeBroadcastView {
  id: string;
  broadcastKey: string;
  dramaId: string;
  dramaTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeSlug: string;
  episodeTitle: string;
  episodeUrl: string;
  accessType?: 'free' | 'premium';
  sendingMode?: WhatsAppSendingMode;
  broadcastStatus?:
    | 'processing'
    | 'completed'
    | 'partially_completed'
    | 'queued_waiting_start'
    | 'no_eligible_recipients'
    | 'failed'
    | 'paused';
  diagnosticSummary?: string;
  isResend: boolean;
  triggeredByAdminEmail: string;
  entitledCount: number;
  selectedCount?: number;
  queuedAutoCount?: number;
  apiAcceptedCount?: number;
  sentCount: number;
  deliveredCount?: number;
  readCount?: number;
  manualQueuedCount?: number;
  inAppNotifiedCount?: number;
  failedCount: number;
  skippedCount: number;
  recipients: Array<{
    memberId: string;
    memberName: string;
    phoneE164: string;
    planId: string;
    status: string;
    sendingMethod?: 'automatic_api' | 'manual_whatsapp' | 'in_app';
    messageLogId?: string;
    manualNotificationId?: string;
    wamid?: string;
    error?: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerAudienceSegments {
  totalRegistered: number;
  blockedExcluded: number;
  whatsappEligible: number;
  noWhatsAppPermission: number;
  optedOut: number;
  invalidPhone: number;
  registeredNeverPurchased: number;
  selectedPlanUnpaid: number;
  pendingPaymentApproval: number;
  activePaidMembers: number;
  expiredMemberships: number;
  renewalsDueSoon: number;
  creativeEnquiries: number;
}

export interface OneClickWhatsAppNotificationView {
  id: string;
  idempotencyKey: string;
  eventType: string;
  category: string;
  customerName: string;
  customerEmail?: string;
  memberId?: string;
  membershipId?: string;
  orderId?: string;
  dramaId?: string;
  episodeSlug?: string;
  rawPhone: string;
  phoneE164?: string;
  waDigits?: string;
  phoneValid: boolean;
  phoneError?: string;
  planName?: string;
  amountDisplay?: string;
  messageText: string;
  waUrl?: string;
  status: 'pending' | 'opened' | 'confirmed_sent' | 'failed' | 'cancelled';
  openCount: number;
  openedAt?: string;
  openedBy?: string;
  confirmedSentAt?: string;
  confirmedSentBy?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
  createdAt: string;
  updatedAt: string;
}

export interface ManualWhatsAppCustomerRecipientView {
  memberId: string;
  customerName: string;
  customerEmail: string;
  rawPhone: string;
  formattedPhone: string;
  waDigits: string;
  phoneValid: boolean;
  phoneSource?:
    | 'account_profile'
    | 'whatsapp_pref'
    | 'membership_record'
    | 'order_record'
    | 'missing';
  phoneError?: string;
  membershipStatus:
    | 'active'
    | 'expired'
    | 'cancelled'
    | 'pending_verification'
    | 'awaiting_payment'
    | 'rejected'
    | 'never_purchased';
  planName: string;
  entitledDramaIds: string[];
  entitledDramaTitles: string[];
  expiresAt?: string;
  hasWhatsappConsent: boolean;
  hasEpisodeConsent: boolean;
  optedOut: boolean;
  isBlocked?: boolean;
  blockedReason?: string;
  blockedAt?: string;
  latestManualStatus?: 'pending' | 'opened' | 'confirmed_sent' | 'failed' | 'cancelled';
  latestManualNotificationId?: string;
  latestManualEventType?: string;
}

export type VideoLeadStage =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'quote_sent'
  | 'booked'
  | 'won'
  | 'lost';

export interface VideoEditingLeadView {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  whatsappE164?: string;
  whatsappConsent: boolean;
  consentTimestamp?: string;
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
  isHighIntent?: boolean;
  source: string;
  notes: Array<{ id: string; author: string; text: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppConversationView {
  id: string;
  phoneE164: string;
  contactName: string;
  intent: string;
  language: string;
  humanTakeover: boolean;
  escalatedReason?: string;
  memberId?: string;
  leadId?: string;
  lastInboundAt?: string;
  lastMessageAt: string;
  messages: Array<{
    id: string;
    direction: 'inbound' | 'outbound';
    sender: 'customer' | 'ai' | 'admin' | 'automation';
    text: string;
    intent?: string;
    createdAt: string;
  }>;
}

export interface AdminAutomationOverview {
  envStatus: WhatsAppEnvStatus;
  aiConfigured: boolean;
  settings: {
    id: 'main';
    automationRunning?: boolean;
    automationStartedAt?: string;
    automationStoppedAt?: string;
    automationToggledBy?: string;
    lastWorkerHeartbeatAt?: string;
    lastSuccessfulRunAt?: string;
    lastWorkerSummary?: string;
    rules: AutomationRulesConfig;
    ai: AiAssistantSettings;
    templateStatuses: Record<string, TemplateApprovalStatus>;
    estimatedUtilityCostUsd: number;
    estimatedMarketingCostUsd: number;
    lastWebhookReceivedAt?: string;
    lastWebhookVerifiedAt?: string;
    lastWorkerRunAt?: string;
    updatedAt: string;
  };
  stats: {
    totalOutbound: number;
    totalInbound: number;
    apiAccepted?: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    notConfigured: number;
    skipped: number;
    pendingJobs: number;
    processingJobs?: number;
    retryQueueCount: number;
    failedWebhooks?: number;
    optedInUsers: number;
    optedOutUsers: number;
    totalLeads: number;
    activeConversations: number;
    manualPending?: number;
    manualOpened?: number;
    manualConfirmedSent?: number;
    manualFailedPhones?: number;
    billableUtility: number;
    billableMarketing: number;
    estimatedTotalCostUsd: number;
  };
  audienceSegments?: CustomerAudienceSegments;
  manualQueueStats?: {
    total: number;
    pending: number;
    opened: number;
    confirmedSent: number;
    failed: number;
    cancelled: number;
    invalidPhones: number;
  };
  templates: WhatsAppTemplateView[];
  messages: WhatsAppMessageLogView[];
  retryQueue: WhatsAppMessageLogView[];
  webhookEvents?: WebhookEventView[];
  failedWebhookEvents?: WebhookEventView[];
  jobs: AutomationJobView[];
  preferences: CustomerNotificationPreferences[];
  episodeBroadcasts: EpisodeBroadcastView[];
  dramasCatalog: Array<{
    id: string;
    title: string;
    slug: string;
    vipEligible: boolean;
    episodes: Array<{
      slug: string;
      number: number;
      title: string;
      releaseDate: string;
      accessType: string;
    }>;
    audience: {
      dramaTitle: string;
      entitledActiveCount: number;
      consentedCount: number;
      optedOutOrNoConsentCount: number;
      eligibleAutomaticCount?: number;
      eligibleManualCount?: number;
      missingConsentCount?: number;
      optedOutCount?: number;
      invalidPhoneCount?: number;
      alreadyBroadcastSlugs: string[];
    };
  }>;
  leads: VideoEditingLeadView[];
  conversations: WhatsAppConversationView[];
}

function adminHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getAdminToken();
  if (token) headers['X-Admin-Authorization'] = `Bearer ${token}`;
  return headers;
}

function memberHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getMemberToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return { success: false, error: `Unexpected server response (${res.status}).` };
  }
}

// --- Customer Notification Preferences ---
export async function fetchMemberNotificationPreferences(): Promise<{
  success: boolean;
  preferences?: CustomerNotificationPreferences;
  error?: string;
}> {
  const res = await fetch('/api/membership/notification-preferences', {
    headers: memberHeaders(),
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function saveMemberNotificationPreferences(payload: {
  phone?: string;
  membershipUpdates: boolean;
  renewalReminders: boolean;
  newEpisodeAlerts: boolean;
  promotionalMessages: boolean;
  optedOut: boolean;
}): Promise<{
  success: boolean;
  preferences?: CustomerNotificationPreferences;
  error?: string;
}> {
  const res = await fetch('/api/membership/notification-preferences', {
    method: 'PUT',
    headers: memberHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

// --- Public Video Editing Enquiry Submission ---
export async function submitVideoEditingLead(payload: {
  fullName: string;
  email: string;
  whatsappNumber?: string;
  whatsappConsent: boolean;
  companyOrAgency?: string;
  editingService?: string;
  numberOfVideos?: string;
  videoDuration?: string;
  referenceLinks?: string;
  projectDeadline?: string;
  budgetRange?: string;
  additionalInstructions?: string;
  source?: string;
}): Promise<{ success: boolean; lead?: VideoEditingLeadView; error?: string }> {
  const res = await fetch('/api/leads/video-editing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

// --- Admin Automation Dashboard APIs ---
export async function fetchAdminAutomationOverview(): Promise<{
  success: boolean;
  error?: string;
} & Partial<AdminAutomationOverview>> {
  const res = await fetch('/api/admin/automation/overview', {
    headers: adminHeaders(),
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function checkAdminWhatsAppLiveStatus(): Promise<{
  success: boolean;
  envStatus?: WhatsAppEnvStatus;
  liveCheck?: {
    connected: boolean;
    notConfigured?: boolean;
    verifiedName?: string;
    displayPhoneNumber?: string;
    qualityRating?: string;
    error?: string;
  };
  error?: string;
}> {
  const res = await fetch('/api/admin/automation/whatsapp-status', {
    headers: adminHeaders(),
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function updateAdminAutomationSettings(payload: Record<string, any>): Promise<{
  success: boolean;
  overview?: AdminAutomationOverview;
  error?: string;
}> {
  const res = await fetch('/api/admin/automation/settings', {
    method: 'PUT',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function sendAdminWhatsAppTestMessage(payload: {
  toPhone: string;
  mode: 'template' | 'text';
  templateName?: string;
  bodyParameters?: string[];
  textBody?: string;
  bypassApprovalCheck?: boolean;
}): Promise<{
  success: boolean;
  error?: string;
  messageLog?: WhatsAppMessageLogView;
  result?: any;
  overview?: AdminAutomationOverview;
}> {
  const res = await fetch('/api/admin/automation/test-message', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function retryAdminWhatsAppMessage(messageId: string): Promise<{
  success: boolean;
  error?: string;
  overview?: AdminAutomationOverview;
}> {
  const res = await fetch(`/api/admin/automation/messages/${encodeURIComponent(messageId)}/retry`, {
    method: 'POST',
    headers: adminHeaders(),
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function runAdminAutomationWorkerNow(): Promise<{
  success: boolean;
  summary?: {
    ranAt: string;
    jobsProcessed: number;
    jobsCancelled: number;
    retriesAttempted: number;
    expiryJobsEnsured: number;
  };
  overview?: AdminAutomationOverview;
  error?: string;
}> {
  const res = await fetch('/api/admin/automation/worker/run', {
    method: 'POST',
    headers: adminHeaders(),
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function updateAdminCustomerPreference(
  prefId: string,
  payload: Partial<CustomerNotificationPreferences>
): Promise<{ success: boolean; overview?: AdminAutomationOverview; error?: string }> {
  const res = await fetch(`/api/admin/automation/preferences/${encodeURIComponent(prefId)}`, {
    method: 'PUT',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function startAdminAutomationBot(): Promise<{
  success: boolean;
  workerSummary?: any;
  overview?: AdminAutomationOverview;
  error?: string;
}> {
  const res = await fetch('/api/admin/automation/bot/start', {
    method: 'POST',
    headers: adminHeaders(),
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function stopAdminAutomationBot(): Promise<{
  success: boolean;
  overview?: AdminAutomationOverview;
  error?: string;
}> {
  const res = await fetch('/api/admin/automation/bot/stop', {
    method: 'POST',
    headers: adminHeaders(),
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function syncAdminMetaTemplates(): Promise<{
  success: boolean;
  syncedCount?: number;
  matchedTemplates?: Array<{ name: string; status: TemplateApprovalStatus; metaStatus: string }>;
  error?: string;
  overview?: AdminAutomationOverview;
}> {
  const res = await fetch('/api/admin/automation/templates/sync-meta', {
    method: 'POST',
    headers: adminHeaders(),
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function fetchAdminEpisodeAudiencePreview(params: {
  dramaId: string;
  accessType: 'free' | 'premium';
  episodeSlug?: string;
}): Promise<{
  success: boolean;
  preview?: EpisodeAudiencePreviewResult;
  error?: string;
}> {
  const qs = new URLSearchParams({
    dramaId: params.dramaId,
    accessType: params.accessType,
  });
  if (params.episodeSlug) qs.set('episodeSlug', params.episodeSlug);
  const res = await fetch(`/api/admin/automation/episodes/audience-preview?${qs.toString()}`, {
    headers: adminHeaders(),
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function triggerAdminEpisodePublishNotify(payload: {
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
  forceResend?: boolean;
}): Promise<{
  success: boolean;
  duplicate?: boolean;
  broadcast?: EpisodeBroadcastView;
  overview?: AdminAutomationOverview;
  error?: string;
}> {
  const res = await fetch('/api/admin/automation/episodes/publish-notify', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function previewAdminHistoricalCampaign(segment: HistoricalCampaignSegment): Promise<{
  success: boolean;
  preview?: {
    segment: HistoricalCampaignSegment;
    totalMatching: number;
    eligibleAutomaticCount: number;
    validPhoneManualCount: number;
    optedOutCount: number;
    recipients: Array<{
      memberId: string;
      fullName: string;
      email: string;
      phoneE164?: string;
      phoneValid: boolean;
      optedIn: boolean;
      optedOut: boolean;
      eligibleForAutomatic: boolean;
      detail: string;
    }>;
  };
  error?: string;
}> {
  const res = await fetch('/api/admin/automation/campaigns/preview', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ segment }),
  });
  return parseJsonSafe(res);
}

export async function launchAdminHistoricalCampaign(payload: {
  segment: HistoricalCampaignSegment;
  sendingMode: WhatsAppSendingMode;
}): Promise<{
  success: boolean;
  campaign?: {
    campaignId: string;
    segment: HistoricalCampaignSegment;
    sendingMode: WhatsAppSendingMode;
    totalMatching: number;
    queuedAutomatic: number;
    queuedManual: number;
    skipped: number;
  };
  overview?: AdminAutomationOverview;
  error?: string;
}> {
  const res = await fetch('/api/admin/automation/campaigns/launch', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

// --- Manual One-Click WhatsApp Center APIs ---
export async function fetchManualWhatsAppCenter(filters?: {
  category?: string;
  status?: string;
  search?: string;
  recipientSearch?: string;
  membershipStatus?: string;
  dramaId?: string;
}): Promise<{
  success: boolean;
  stats?: {
    total: number;
    pending: number;
    opened: number;
    confirmedSent: number;
    failed: number;
    cancelled: number;
    invalidPhones: number;
  };
  categoryCounts?: Record<string, number>;
  settings?: {
    enabled: boolean;
    categories: Record<string, boolean>;
    updatedAt: string;
  };
  notifications?: OneClickWhatsAppNotificationView[];
  recipients?: ManualWhatsAppCustomerRecipientView[];
  error?: string;
}> {
  const qs = new URLSearchParams();
  qs.set('includeBlocked', '1');
  if (filters?.category) qs.set('category', filters.category);
  if (filters?.status) qs.set('status', filters.status);
  if (filters?.search) qs.set('search', filters.search);
  if (filters?.recipientSearch) qs.set('recipientSearch', filters.recipientSearch);
  if (filters?.membershipStatus) qs.set('membershipStatus', filters.membershipStatus);
  if (filters?.dramaId) qs.set('dramaId', filters.dramaId);
  const res = await fetch(`/api/admin/automation/whatsapp-notifications?${qs.toString()}`, {
    headers: adminHeaders(),
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function editManualWhatsAppNotification(
  id: string,
  payload: { messageText?: string; rawPhone?: string }
): Promise<{
  success: boolean;
  notification?: OneClickWhatsAppNotificationView;
  error?: string;
}> {
  const res = await fetch(`/api/admin/automation/whatsapp-notifications/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function openManualWhatsAppNotification(id: string): Promise<{
  success: boolean;
  notification?: OneClickWhatsAppNotificationView;
  waUrl?: string;
  error?: string;
}> {
  const res = await fetch(
    `/api/admin/automation/whatsapp-notifications/${encodeURIComponent(id)}/open`,
    {
      method: 'POST',
      headers: adminHeaders(),
      credentials: 'include',
    }
  );
  return parseJsonSafe(res);
}

export async function confirmManualWhatsAppNotificationSent(
  id: string,
  note?: string
): Promise<{
  success: boolean;
  notification?: OneClickWhatsAppNotificationView;
  error?: string;
}> {
  const res = await fetch(
    `/api/admin/automation/whatsapp-notifications/${encodeURIComponent(id)}/confirm-sent`,
    {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ note }),
    }
  );
  return parseJsonSafe(res);
}

export async function cancelManualWhatsAppNotification(
  id: string,
  reason?: string
): Promise<{
  success: boolean;
  notification?: OneClickWhatsAppNotificationView;
  error?: string;
}> {
  const res = await fetch(
    `/api/admin/automation/whatsapp-notifications/${encodeURIComponent(id)}/cancel`,
    {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ reason }),
    }
  );
  return parseJsonSafe(res);
}

export async function syncManualWhatsAppReminders(): Promise<{
  success: boolean;
  summary?: { queued: number; skipped: number };
  error?: string;
}> {
  const res = await fetch('/api/admin/automation/whatsapp-notifications/sync-reminders', {
    method: 'POST',
    headers: adminHeaders(),
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function prepareManualWhatsAppMessages(payload: {
  memberIds: string[];
  eventType: string;
  campaignPurpose?:
    | 'free_episode'
    | 'premium_access'
    | 'premium_promotion'
    | 'general_membership_promo'
    | 'custom';
  customMessage?: string;
  dramaId?: string;
  episodeNumber?: number;
  episodeSlug?: string;
  episodeLink?: string;
  accessType?: 'free' | 'premium';
  rejectionReason?: string;
}): Promise<{
  success: boolean;
  createdCount?: number;
  failedPhoneCount?: number;
  skippedOptedOutCount?: number;
  skippedBlockedCount?: number;
  skippedNotEntitledCount?: number;
  notifications?: OneClickWhatsAppNotificationView[];
  error?: string;
}> {
  const res = await fetch('/api/admin/automation/whatsapp-notifications/manual-prepare', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function testAdminAiSupportAssistant(payload: {
  userMessage: string;
  contactName?: string;
  testPhone?: string;
}): Promise<{
  success: boolean;
  aiResult?: {
    replyText: string;
    intent: string;
    detectedLanguage: string;
    escalateToHuman: boolean;
    escalationReason?: string;
    isHighIntentLead: boolean;
    extractedLead?: Record<string, string>;
  };
  error?: string;
}> {
  const res = await fetch('/api/admin/automation/ai-test', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

// --- Admin Leads & Unified Inbox APIs ---
export async function fetchAdminAutomationLeads(): Promise<{
  success: boolean;
  leads?: VideoEditingLeadView[];
  conversations?: WhatsAppConversationView[];
  overview?: AdminAutomationOverview;
  error?: string;
}> {
  const res = await fetch('/api/admin/automation/leads', {
    headers: adminHeaders(),
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function updateAdminVideoLead(
  leadId: string,
  payload: {
    stage?: VideoLeadStage;
    humanTakeover?: boolean;
    followUpPaused?: boolean;
    addNote?: string;
    scheduleFollowUpType?:
      | 'lead_followup_pricing'
      | 'lead_followup_quote'
      | 'lead_followup_booking'
      | 'lead_followup_returning';
  }
): Promise<{
  success: boolean;
  lead?: VideoEditingLeadView;
  leads?: VideoEditingLeadView[];
  conversations?: WhatsAppConversationView[];
  error?: string;
}> {
  const res = await fetch(`/api/admin/automation/leads/${encodeURIComponent(leadId)}`, {
    method: 'PUT',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function toggleAdminConversationTakeover(
  phoneE164: string,
  humanTakeover: boolean
): Promise<{
  success: boolean;
  conversation?: WhatsAppConversationView;
  conversations?: WhatsAppConversationView[];
  error?: string;
}> {
  const res = await fetch(
    `/api/admin/automation/conversations/${encodeURIComponent(phoneE164)}/takeover`,
    {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ humanTakeover }),
    }
  );
  return parseJsonSafe(res);
}

export async function sendAdminManualConversationReply(
  phoneE164: string,
  text: string
): Promise<{
  success: boolean;
  conversation?: WhatsAppConversationView;
  conversations?: WhatsAppConversationView[];
  error?: string;
}> {
  const res = await fetch(
    `/api/admin/automation/conversations/${encodeURIComponent(phoneE164)}/reply`,
    {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ text }),
    }
  );
  return parseJsonSafe(res);
}

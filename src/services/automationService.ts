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
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
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
  isResend: boolean;
  triggeredByAdminEmail: string;
  entitledCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  recipients: Array<{
    memberId: string;
    memberName: string;
    phoneE164: string;
    planId: string;
    status: string;
    error?: string;
  }>;
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
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    notConfigured: number;
    skipped: number;
    pendingJobs: number;
    retryQueueCount: number;
    optedInUsers: number;
    optedOutUsers: number;
    totalLeads: number;
    activeConversations: number;
    billableUtility: number;
    billableMarketing: number;
    estimatedTotalCostUsd: number;
  };
  templates: WhatsAppTemplateView[];
  messages: WhatsAppMessageLogView[];
  retryQueue: WhatsAppMessageLogView[];
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

export async function triggerAdminEpisodePublishNotify(payload: {
  dramaId: string;
  episodeSlug: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  episodeUrl?: string;
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

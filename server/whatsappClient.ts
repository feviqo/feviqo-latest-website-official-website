import crypto from 'crypto';

export type WhatsAppTemplateCategory = 'UTILITY' | 'MARKETING';
export type WhatsAppTemplateApprovalStatus =
  | 'draft'
  | 'pending_meta_review'
  | 'approved'
  | 'rejected';

export interface WhatsAppTemplateDraft {
  name: string;
  displayName: string;
  category: WhatsAppTemplateCategory;
  classificationNote: string;
  language: string;
  eventTrigger: string;
  consentCategory: 'membershipUpdates' | 'renewalReminders' | 'newEpisodeAlerts' | 'promotionalMessages' | 'leadEnquiry';
  bodyText: string;
  variables: Array<{ index: number; key: string; example: string }>;
  footerText?: string;
}

export const DEFAULT_BUSINESS_WHATSAPP_NUMBER = '+17823333653';
export const DEFAULT_WHATSAPP_PHONE_NUMBER_ID = '1203691806151162';
export const DEFAULT_WHATSAPP_BUSINESS_ACCOUNT_ID = '2221497198598821';
export const META_WHATSAPP_APP_ID = '995554719768043';
export const OFFICIAL_WEBHOOK_CALLBACK_URL = 'https://feviqo.com/api/webhooks/whatsapp';

/**
 * Official Meta WhatsApp Business Template drafts for FEVIQO.
 *
 * IMPORTANT:
 * - Templates are NEVER assumed approved merely because they exist in code.
 * - Each template is classified strictly according to Meta Business Messaging Policy:
 *   - UTILITY: Transaction/account/service status updates directly tied to an active
 *     user action or existing active subscription.
 *   - MARKETING: Re-engagement, incomplete signup nudges, abandoned checkout nudges,
 *     welcome/package promotion, quote follow-ups, or content announcements.
 */
export const WHATSAPP_TEMPLATES_CATALOG: WhatsAppTemplateDraft[] = [
  {
    name: 'feviqo_welcome',
    displayName: 'New Registration Welcome',
    category: 'MARKETING',
    classificationNote:
      'Classified as MARKETING because it introduces FEVIQO Premium packages and encourages purchase.',
    language: 'en',
    eventTrigger: 'user.registered',
    consentCategory: 'membershipUpdates',
    bodyText:
      'Welcome to FEVIQO Premium, {{1}}! ❤️\n\nYour favourite dramas are waiting for you in Urdu!\n\nExplore our membership packages and start watching today.\n\nChoose your package: {{2}}\n\nFEVIQO — Entertainment in Your Language!',
    variables: [
      { index: 1, key: 'name', example: 'Ali' },
      { index: 2, key: 'membershipUrl', example: 'https://feviqo.com/membership' },
    ],
    footerText: 'Reply STOP anytime to opt out.',
  },
  {
    name: 'feviqo_membership_incomplete',
    displayName: 'Signup Without Package Reminder (30m)',
    category: 'MARKETING',
    classificationNote:
      'Classified as MARKETING because it re-engages a registered user who has not yet purchased a package.',
    language: 'en',
    eventTrigger: 'user.registered (delayed 30m check)',
    consentCategory: 'promotionalMessages',
    bodyText:
      "Hi {{1}}! 👋\n\nYou created your FEVIQO account but haven't selected your membership yet.\n\nYour favourite Urdu-dubbed dramas are waiting!\n\nChoose your package here: {{2}}\n\nJoin FEVIQO Premium today!",
    variables: [
      { index: 1, key: 'name', example: 'Ali' },
      { index: 2, key: 'membershipUrl', example: 'https://feviqo.com/membership' },
    ],
    footerText: 'Reply STOP anytime to opt out.',
  },
  {
    name: 'feviqo_checkout_reminder',
    displayName: 'Selected Package Without Payment Reminder',
    category: 'MARKETING',
    classificationNote:
      'Classified as MARKETING (cart/checkout abandonment follow-up per Meta template policy).',
    language: 'en',
    eventTrigger: 'membership.payment_pending (delayed check)',
    consentCategory: 'promotionalMessages',
    bodyText:
      'Hi {{1}}! 👋\n\nYour FEVIQO Premium {{2}} package ({{3}}) — Order {{4}} — is still waiting for payment confirmation.\n\nComplete your payment and upload your screenshot here: {{5}}\n\nOnce verified by our team, your access activates immediately.',
    variables: [
      { index: 1, key: 'name', example: 'Ali' },
      { index: 2, key: 'plan', example: 'STANDARD' },
      { index: 3, key: 'amount', example: 'PKR 599' },
      { index: 4, key: 'orderId', example: 'ORD-123456' },
      { index: 5, key: 'checkoutUrl', example: 'https://feviqo.com/account' },
    ],
    footerText: 'Reply STOP anytime to opt out.',
  },
  {
    name: 'feviqo_payment_received',
    displayName: 'Payment Proof Received',
    category: 'UTILITY',
    classificationNote:
      'Classified as UTILITY because it confirms receipt of a customer-submitted payment proof for an existing order.',
    language: 'en',
    eventTrigger: 'membership.proof_submitted',
    consentCategory: 'membershipUpdates',
    bodyText:
      'Hello {{1}}! Your payment proof for {{2}} (Order {{3}}) has been received.\n\nOur team is reviewing your payment. Your membership will activate after successful verification.\n\nThank you for choosing FEVIQO!',
    variables: [
      { index: 1, key: 'name', example: 'Ali' },
      { index: 2, key: 'plan', example: 'STANDARD' },
      { index: 3, key: 'orderId', example: 'ORD-123456' },
    ],
    footerText: 'FEVIQO Verification Team',
  },
  {
    name: 'feviqo_membership_activated',
    displayName: 'Membership Payment Approved & Activated',
    category: 'UTILITY',
    classificationNote:
      'Classified as UTILITY because it confirms successful payment verification and active account entitlement.',
    language: 'en',
    eventTrigger: 'membership.approved',
    consentCategory: 'membershipUpdates',
    bodyText:
      'Hello {{1}}! Your FEVIQO Premium {{2}} membership is now ACTIVE. ✅\n\nIncluded Dramas: {{3}}\nActivated: {{4}}\nExpires: {{5}}\n\nSign in and start watching: {{6}}',
    variables: [
      { index: 1, key: 'name', example: 'Ali' },
      { index: 2, key: 'plan', example: 'VIP' },
      { index: 3, key: 'dramas', example: 'Mehmed: Fetihler Sultani, Teskilat' },
      { index: 4, key: 'activationDate', example: '20 Nov 2026' },
      { index: 5, key: 'expirationDate', example: '20 Dec 2026' },
      { index: 6, key: 'accountUrl', example: 'https://feviqo.com/account' },
    ],
    footerText: 'FEVIQO Premium Membership',
  },
  {
    name: 'feviqo_payment_rejected',
    displayName: 'Payment Proof Rejected — Action Required',
    category: 'UTILITY',
    classificationNote:
      'Classified as UTILITY because it communicates an order verification issue with the exact reason and resubmission steps.',
    language: 'en',
    eventTrigger: 'membership.rejected',
    consentCategory: 'membershipUpdates',
    bodyText:
      'Hello {{1}}, we could not verify your payment proof for Order {{2}}.\n\nReason: {{3}}\n\nTo complete activation, please sign in to your account and upload a clear payment receipt screenshot: {{4}}',
    variables: [
      { index: 1, key: 'name', example: 'Ali' },
      { index: 2, key: 'orderId', example: 'ORD-123456' },
      { index: 3, key: 'reason', example: 'Transaction reference ID was cropped out' },
      { index: 4, key: 'accountUrl', example: 'https://feviqo.com/account' },
    ],
    footerText: 'FEVIQO Billing Support',
  },
  {
    name: 'feviqo_membership_expiry_7_days',
    displayName: 'Membership Expiry Reminder (7 Days)',
    category: 'UTILITY',
    classificationNote:
      'Classified as UTILITY (subscription expiration notice tied to an existing active plan).',
    language: 'en',
    eventTrigger: 'membership.expiring (7 days before)',
    consentCategory: 'renewalReminders',
    bodyText:
      'Hi {{1}}, your FEVIQO Premium {{2}} membership will expire in 7 days on {{3}}.\n\nRenew early to keep uninterrupted Urdu episode access: {{4}}',
    variables: [
      { index: 1, key: 'name', example: 'Ali' },
      { index: 2, key: 'plan', example: 'STANDARD' },
      { index: 3, key: 'expirationDate', example: '27 Nov 2026' },
      { index: 4, key: 'renewalUrl', example: 'https://feviqo.com/membership' },
    ],
    footerText: 'Reply STOP anytime to opt out.',
  },
  {
    name: 'feviqo_membership_expiry_3_days',
    displayName: 'Membership Expiry Reminder (3 Days)',
    category: 'UTILITY',
    classificationNote:
      'Classified as UTILITY (subscription expiration notice tied to an existing active plan).',
    language: 'en',
    eventTrigger: 'membership.expiring (3 days before)',
    consentCategory: 'renewalReminders',
    bodyText:
      'Hi {{1}}, your FEVIQO Premium {{2}} membership expires in 3 days on {{3}}.\n\nRenew now to avoid any interruption: {{4}}',
    variables: [
      { index: 1, key: 'name', example: 'Ali' },
      { index: 2, key: 'plan', example: 'STANDARD' },
      { index: 3, key: 'expirationDate', example: '23 Nov 2026' },
      { index: 4, key: 'renewalUrl', example: 'https://feviqo.com/membership' },
    ],
    footerText: 'Reply STOP anytime to opt out.',
  },
  {
    name: 'feviqo_membership_expiry_1_day',
    displayName: 'Membership Expiry Reminder (1 Day)',
    category: 'UTILITY',
    classificationNote:
      'Classified as UTILITY (urgent 24-hour subscription expiry alert).',
    language: 'en',
    eventTrigger: 'membership.expiring (1 day before)',
    consentCategory: 'renewalReminders',
    bodyText:
      'Hi {{1}}, reminder: your FEVIQO Premium {{2}} membership expires tomorrow ({{3}}).\n\nRenew today to continue watching: {{4}}',
    variables: [
      { index: 1, key: 'name', example: 'Ali' },
      { index: 2, key: 'plan', example: 'STANDARD' },
      { index: 3, key: 'expirationDate', example: '21 Nov 2026' },
      { index: 4, key: 'renewalUrl', example: 'https://feviqo.com/membership' },
    ],
    footerText: 'Reply STOP anytime to opt out.',
  },
  {
    name: 'feviqo_membership_expired',
    displayName: 'Membership Expired Notice',
    category: 'UTILITY',
    classificationNote:
      'Classified as UTILITY (subscription status change notice confirming access ended).',
    language: 'en',
    eventTrigger: 'membership.expired',
    consentCategory: 'renewalReminders',
    bodyText:
      'Hi {{1}}, your FEVIQO Premium {{2}} membership expired on {{3}}.\n\nYour account history is safe — renew anytime here: {{4}}',
    variables: [
      { index: 1, key: 'name', example: 'Ali' },
      { index: 2, key: 'plan', example: 'STANDARD' },
      { index: 3, key: 'expirationDate', example: '20 Nov 2026' },
      { index: 4, key: 'renewalUrl', example: 'https://feviqo.com/membership' },
    ],
    footerText: 'Reply STOP anytime to opt out.',
  },
  {
    name: 'feviqo_new_episode',
    displayName: 'New Urdu Episode Published Alert (Free & Premium)',
    category: 'MARKETING',
    classificationNote:
      'Classified as MARKETING under Meta policy for new content release alerts. Premium episodes target active entitled members only; Free episodes target registered consented customers.',
    language: 'en',
    eventTrigger: 'episode.published',
    consentCategory: 'newEpisodeAlerts',
    bodyText:
      'New Urdu-Dubbed Episode Available on FEVIQO! 🎬\n\nDrama: {{1}}\nEpisode: {{2}}\nAccess: {{3}}\n\nWatch now:\n{{4}}\n\nVisit FEVIQO Premium for more Urdu-dubbed entertainment.',
    variables: [
      { index: 1, key: 'dramaName', example: 'Mehmed: Fetihler Sultani' },
      { index: 2, key: 'episodeNumber', example: '92' },
      { index: 3, key: 'accessType', example: 'Premium' },
      { index: 4, key: 'episodeUrl', example: 'https://feviqo.com/mehmed-fetihler-sultani/episode-92' },
    ],
    footerText: 'Reply STOP anytime to opt out.',
  },
  {
    name: 'feviqo_account_security',
    displayName: 'Account Security & Password Activity Notice',
    category: 'UTILITY',
    classificationNote:
      'Classified as UTILITY for account security alerts. Never includes passwords, app passwords, or secret tokens.',
    language: 'en',
    eventTrigger: 'account.security_alert',
    consentCategory: 'membershipUpdates',
    bodyText:
      'Assalam o Alaikum {{1}}, FEVIQO Account Security Notice:\n\n{{2}}\n\nIf this was not you, secure your account immediately at {{3}}.',
    variables: [
      { index: 1, key: 'name', example: 'Ali' },
      { index: 2, key: 'summary', example: 'Your account password was updated.' },
      { index: 3, key: 'accountUrl', example: 'https://feviqo.com/account' },
    ],
    footerText: 'FEVIQO Security — Never share passwords.',
  },
  {
    name: 'feviqo_lead_received',
    displayName: 'Video Editing Enquiry Acknowledgement',
    category: 'UTILITY',
    classificationNote:
      'Classified as UTILITY because it immediately acknowledges a user-submitted video editing enquiry.',
    language: 'en',
    eventTrigger: 'lead.created',
    consentCategory: 'leadEnquiry',
    bodyText:
      "Hi {{1}}! 👋\n\nThank you for contacting FEVIQO.\n\nWe've received your video editing enquiry ({{2}}).\n\nOur team will review your requirements and get back to you shortly.\n\nFEVIQO — Creative That Moves.",
    variables: [
      { index: 1, key: 'name', example: 'Sarah' },
      { index: 2, key: 'service', example: 'Short-form Reels & Ad Creatives' },
    ],
    footerText: 'Reply STOP anytime to opt out.',
  },
  {
    name: 'feviqo_quote_followup',
    displayName: 'Video Editing Lead & Quote Follow-Up',
    category: 'MARKETING',
    classificationNote:
      'Classified as MARKETING because it is a sales/quote follow-up message after an enquiry or proposal.',
    language: 'en',
    eventTrigger: 'lead.quote_sent / lead.followup',
    consentCategory: 'leadEnquiry',
    bodyText:
      'Hi {{1}}, checking in from FEVIQO Creative regarding your {{2}} project.\n\nLet us know if you have any questions or would like to lock in a quick strategy call here: {{3}}',
    variables: [
      { index: 1, key: 'name', example: 'Sarah' },
      { index: 2, key: 'service', example: 'Monthly Video Editing' },
      { index: 3, key: 'bookingUrl', example: 'https://feviqo.com/booking' },
    ],
    footerText: 'Reply STOP anytime to opt out.',
  },
];

export function getTemplateDraftByName(name: string): WhatsAppTemplateDraft | undefined {
  return WHATSAPP_TEMPLATES_CATALOG.find((t) => t.name === name);
}

export function renderTemplatePreview(
  templateName: string,
  params: string[]
): string {
  const tpl = getTemplateDraftByName(templateName);
  if (!tpl) return params.join(' | ');
  return tpl.bodyText.replace(/\{\{(\d+)\}\}/g, (_match, numStr) => {
    const idx = Number(numStr) - 1;
    return params[idx] !== undefined ? String(params[idx]) : `{{${numStr}}}`;
  });
}

/**
 * Normalizes a phone string into strict international E.164 format (+[country][number]).
 * Supports Pakistani local format (03xxxxxxxxx -> +923xxxxxxxxx) as well as international numbers.
 */
export function normalizePhoneE164(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  let cleaned = raw.trim().replace(/[\s\-().]/g, '');
  if (!cleaned) return null;

  if (cleaned.startsWith('00')) {
    cleaned = `+${cleaned.slice(2)}`;
  }

  // Pakistani local mobile shorthand: 03XXXXXXXXX (11 digits) -> +923XXXXXXXXX
  if (/^03\d{9}$/.test(cleaned)) {
    cleaned = `+92${cleaned.slice(1)}`;
  } else if (/^923\d{9}$/.test(cleaned)) {
    cleaned = `+${cleaned}`;
  } else if (/^3\d{9}$/.test(cleaned)) {
    cleaned = `+92${cleaned}`;
  } else if (!cleaned.startsWith('+')) {
    // Strip leading non-digits and add +
    const digitsOnly = cleaned.replace(/[^\d]/g, '');
    if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      cleaned = `+${digitsOnly}`;
    } else {
      return null;
    }
  }

  const digits = cleaned.replace(/[^\d]/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}

export function phoneToMetaWaId(raw?: string | null): string | null {
  const e164 = normalizePhoneE164(raw);
  if (!e164) return null;
  return e164.slice(1); // Meta Graph API expects digits without leading '+'
}

export interface WhatsAppEnvConfigStatus {
  businessPhoneDisplay: string;
  phoneNumberId: string;
  phoneNumberIdConfiguredInEnv: boolean;
  businessAccountId: string;
  businessAccountIdConfiguredInEnv: boolean;
  metaAppId: string;
  subscribedFields: string[];
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

export function getWhatsAppEnvConfigStatus(): WhatsAppEnvConfigStatus {
  const accessToken = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  const verifyToken = (process.env.WHATSAPP_VERIFY_TOKEN || '').trim();
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
  const wabaId = (process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '').trim();
  const appSecret = (process.env.WHATSAPP_APP_SECRET || '').trim();
  const apiVersionEnv = (process.env.WHATSAPP_API_VERSION || '').trim();
  const metaAppIdEnv = (process.env.META_APP_ID || '').trim();
  const businessPhoneDisplay =
    normalizePhoneE164(process.env.WHATSAPP_BUSINESS_NUMBER || DEFAULT_BUSINESS_WHATSAPP_NUMBER) ||
    DEFAULT_BUSINESS_WHATSAPP_NUMBER;

  const missingEnvVars: string[] = [];
  if (!accessToken) missingEnvVars.push('WHATSAPP_ACCESS_TOKEN');
  if (!verifyToken) missingEnvVars.push('WHATSAPP_VERIFY_TOKEN');
  if (!phoneNumberId) missingEnvVars.push('WHATSAPP_PHONE_NUMBER_ID');
  if (!wabaId) missingEnvVars.push('WHATSAPP_BUSINESS_ACCOUNT_ID');
  if (!appSecret) missingEnvVars.push('WHATSAPP_APP_SECRET');
  if (!apiVersionEnv) missingEnvVars.push('WHATSAPP_API_VERSION');

  return {
    businessPhoneDisplay,
    phoneNumberId: phoneNumberId || DEFAULT_WHATSAPP_PHONE_NUMBER_ID,
    phoneNumberIdConfiguredInEnv: Boolean(phoneNumberId),
    businessAccountId: wabaId || DEFAULT_WHATSAPP_BUSINESS_ACCOUNT_ID,
    businessAccountIdConfiguredInEnv: Boolean(wabaId),
    metaAppId: metaAppIdEnv || META_WHATSAPP_APP_ID,
    subscribedFields: ['messages'],
    apiVersion: apiVersionEnv || 'not_set',
    apiVersionExplicitlySet: Boolean(apiVersionEnv),
    hasAccessToken: Boolean(accessToken),
    hasVerifyToken: Boolean(verifyToken),
    hasPhoneNumberId: Boolean(phoneNumberId),
    hasBusinessAccountId: Boolean(wabaId),
    hasAppSecret: Boolean(appSecret),
    canSendMessages: Boolean(accessToken && phoneNumberId && apiVersionEnv),
    canVerifyWebhookChallenge: Boolean(verifyToken),
    canVerifyWebhookSignature: Boolean(appSecret),
    missingEnvVars,
    webhookEndpoint: OFFICIAL_WEBHOOK_CALLBACK_URL,
  };
}

/**
 * Verifies Meta's `X-Hub-Signature-256` header using HMAC-SHA256 with `WHATSAPP_APP_SECRET`.
 * Uses timing-safe comparison to prevent timing side-channels.
 */
export function verifyMetaWebhookSignature(
  rawBody: Buffer | string | undefined,
  signatureHeader: string | undefined
): { valid: boolean; reason?: string; secretConfigured: boolean } {
  const appSecret = (process.env.WHATSAPP_APP_SECRET || '').trim();
  if (!appSecret) {
    return {
      valid: false,
      secretConfigured: false,
      reason: 'WHATSAPP_APP_SECRET is not configured on the backend.',
    };
  }
  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return {
      valid: false,
      secretConfigured: true,
      reason: 'Missing X-Hub-Signature-256 header.',
    };
  }
  if (!signatureHeader.startsWith('sha256=')) {
    return {
      valid: false,
      secretConfigured: true,
      reason: 'Malformed X-Hub-Signature-256 header format.',
    };
  }
  if (!rawBody) {
    return {
      valid: false,
      secretConfigured: true,
      reason: 'Missing raw request body for HMAC verification.',
    };
  }

  const expectedHex = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');
  const providedHex = signatureHeader.slice('sha256='.length).trim();

  if (expectedHex.length !== providedHex.length) {
    return {
      valid: false,
      secretConfigured: true,
      reason: 'Signature digest length mismatch.',
    };
  }

  try {
    const valid = crypto.timingSafeEqual(
      Buffer.from(expectedHex, 'hex'),
      Buffer.from(providedHex, 'hex')
    );
    return {
      valid,
      secretConfigured: true,
      reason: valid ? undefined : 'HMAC-SHA256 signature mismatch.',
    };
  } catch {
    return {
      valid: false,
      secretConfigured: true,
      reason: 'Invalid hex signature value.',
    };
  }
}

export function verifyWebhookChallengeToken(providedToken: string | undefined): boolean {
  const expected = (process.env.WHATSAPP_VERIFY_TOKEN || '').trim();
  if (!expected || !providedToken) return false;
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(providedToken).trim(), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export interface WhatsAppSendResult {
  ok: boolean;
  notConfigured?: boolean;
  messageId?: string;
  httpStatus?: number;
  error?: string;
  errorCode?: string | number;
  rawResponse?: unknown;
}

async function callWhatsAppGraphMessagesApi(payload: Record<string, any>): Promise<WhatsAppSendResult> {
  const accessToken = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
  const apiVersion = (process.env.WHATSAPP_API_VERSION || '').trim();

  if (!accessToken || !phoneNumberId || !apiVersion) {
    const missing = [
      !accessToken && 'WHATSAPP_ACCESS_TOKEN',
      !phoneNumberId && 'WHATSAPP_PHONE_NUMBER_ID',
      !apiVersion && 'WHATSAPP_API_VERSION',
    ].filter(Boolean);
    return {
      ok: false,
      notConfigured: true,
      error: `WhatsApp Cloud API credentials missing on backend: ${missing.join(', ')}`,
    };
  }

  const endpoint = `https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(phoneNumberId)}/messages`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errObj = data?.error || {};
      return {
        ok: false,
        httpStatus: response.status,
        errorCode: errObj.code || response.status,
        error:
          errObj.message ||
          errObj.error_user_msg ||
          `Meta Graph API returned HTTP ${response.status}`,
        rawResponse: data,
      };
    }

    const messageId = data?.messages?.[0]?.id;
    return {
      ok: true,
      httpStatus: response.status,
      messageId: typeof messageId === 'string' ? messageId : undefined,
      rawResponse: data,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Network failure calling Meta WhatsApp Cloud API.',
    };
  }
}

/**
 * Sends a Meta-approved WhatsApp template message (required for business-initiated messages).
 */
export async function sendWhatsAppTemplateMessage(params: {
  toPhone: string;
  templateName: string;
  languageCode?: string;
  bodyParameters?: string[];
}): Promise<WhatsAppSendResult> {
  const waId = phoneToMetaWaId(params.toPhone);
  if (!waId) {
    return { ok: false, error: 'Recipient phone number is not valid E.164 format.' };
  }

  const components: any[] = [];
  if (params.bodyParameters && params.bodyParameters.length > 0) {
    components.push({
      type: 'body',
      parameters: params.bodyParameters.map((val) => ({
        type: 'text',
        text: String(val ?? '').slice(0, 1024),
      })),
    });
  }

  return callWhatsAppGraphMessagesApi({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: waId,
    type: 'template',
    template: {
      name: params.templateName,
      language: { code: params.languageCode || 'en' },
      ...(components.length > 0 ? { components } : {}),
    },
  });
}

/**
 * Sends a free-form WhatsApp text message (ONLY valid inside an active 24-hour customer service window).
 */
export async function sendWhatsAppTextMessage(params: {
  toPhone: string;
  body: string;
  previewUrl?: boolean;
}): Promise<WhatsAppSendResult> {
  const waId = phoneToMetaWaId(params.toPhone);
  if (!waId) {
    return { ok: false, error: 'Recipient phone number is not valid E.164 format.' };
  }
  const trimmed = String(params.body || '').trim();
  if (!trimmed) {
    return { ok: false, error: 'Message body cannot be empty.' };
  }

  return callWhatsAppGraphMessagesApi({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: waId,
    type: 'text',
    text: {
      preview_url: params.previewUrl !== false,
      body: trimmed.slice(0, 4096),
    },
  });
}

/**
 * Marks an incoming WhatsApp message as read on Meta Cloud API (best-effort, non-blocking).
 */
export async function markWhatsAppMessageRead(wamid: string): Promise<void> {
  const accessToken = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
  const apiVersion = (process.env.WHATSAPP_API_VERSION || '').trim();
  if (!accessToken || !phoneNumberId || !apiVersion || !wamid) return;

  try {
    const endpoint = `https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(phoneNumberId)}/messages`;
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: wamid,
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Non-fatal
  }
}

/**
 * Checks live Meta Graph API connectivity for the configured WhatsApp Phone Number ID.
 */
export async function testWhatsAppGraphConnectivity(): Promise<{
  connected: boolean;
  notConfigured?: boolean;
  verifiedName?: string;
  displayPhoneNumber?: string;
  qualityRating?: string;
  error?: string;
}> {
  const accessToken = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
  const apiVersion = (process.env.WHATSAPP_API_VERSION || '').trim();

  if (!accessToken || !phoneNumberId || !apiVersion) {
    return {
      connected: false,
      notConfigured: true,
      error: 'Missing WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, or WHATSAPP_API_VERSION.',
    };
  }

  try {
    const url = `https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(phoneNumberId)}?fields=verified_name,display_phone_number,quality_rating`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10000),
    });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        connected: false,
        error: data?.error?.message || `Meta API HTTP ${res.status}`,
      };
    }
    return {
      connected: true,
      verifiedName: data?.verified_name,
      displayPhoneNumber: data?.display_phone_number,
      qualityRating: data?.quality_rating,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err?.message || 'Unable to reach graph.facebook.com',
    };
  }
}

/**
 * Fetches approved/pending/rejected message templates directly from Meta WABA Graph API
 * using the existing configured WHATSAPP_BUSINESS_ACCOUNT_ID and WHATSAPP_ACCESS_TOKEN.
 */
export async function fetchMetaWabaTemplates(): Promise<{
  ok: boolean;
  notConfigured?: boolean;
  templates: Array<{
    name: string;
    status: string;
    category: string;
    language: string;
  }>;
  error?: string;
}> {
  const accessToken = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  const wabaId = (process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '').trim();
  const apiVersion = (process.env.WHATSAPP_API_VERSION || 'v22.0').trim();

  if (!accessToken || !wabaId) {
    return {
      ok: false,
      notConfigured: true,
      templates: [],
      error: 'Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_BUSINESS_ACCOUNT_ID.',
    };
  }

  try {
    const url = `https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(wabaId)}/message_templates?fields=name,status,category,language&limit=200`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(12000),
    });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        templates: [],
        error: data?.error?.message || `Meta API HTTP ${res.status}`,
      };
    }
    const rawList = Array.isArray(data?.data) ? data.data : [];
    const templates = rawList.map((item: any) => ({
      name: String(item?.name || ''),
      status: String(item?.status || '').toUpperCase(),
      category: String(item?.category || '').toUpperCase(),
      language: String(item?.language || 'en'),
    }));
    return { ok: true, templates };
  } catch (err: any) {
    return {
      ok: false,
      templates: [],
      error: err?.message || 'Unable to fetch templates from Meta Graph API.',
    };
  }
}


import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  MEMBERSHIP_PLANS,
  MEMBERSHIP_DRAMAS,
  DEFAULT_USD_PRICES,
  MembershipPlan,
  MembershipPlanId,
  PaymentRegion,
  PaymentMethod,
  PaymentCurrency,
  getPlanById,
  getDramaById,
  getEpisodeMeta,
} from '../src/data/membershipCatalog';
import {
  isServerFirestoreEnabled,
  mirrorDocToFirestoreServer,
  deleteDocFromFirestoreServer,
  pullSnapshotFromFirestoreServer,
} from './firestoreAdmin';
import {
  resolveEpisodePlaybackOverride,
  getMuxSecurityAdminOverview,
  revokePlaybackSessionsForMember,
} from './muxSecurity';
import {
  recordCommissionForVerifiedOrder,
  reverseCommissionForOrder,
  mergeCampaignCloudSnapshot,
  syncCampaignDocsToFirestore,
} from './referralCampaignStore';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRIVATE_PROOFS_DIR = path.join(DATA_DIR, 'private_proofs');
const PUBLIC_QR_DIR = path.join(process.cwd(), 'public', 'images', 'qr');

const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');
const MEMBERSHIPS_FILE = path.join(DATA_DIR, 'memberships.json');
const ORDERS_FILE = path.join(DATA_DIR, 'membership_orders.json');
const HISTORY_FILE = path.join(DATA_DIR, 'membership_history.json');
const CONFIG_FILE = path.join(DATA_DIR, 'membership_config.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const ADMIN_AUDIT_FILE = path.join(DATA_DIR, 'admin_audit_log.json');
const EMAIL_NOTIFS_FILE = path.join(DATA_DIR, 'email_notifications.json');
const MEMBER_NOTIFS_FILE = path.join(DATA_DIR, 'member_notifications.json');
const SCHEDULER_RUNS_FILE = path.join(DATA_DIR, 'scheduler_runs.json');
const PROMO_CODES_FILE = path.join(DATA_DIR, 'promo_codes.json');
const REFERRALS_FILE = path.join(DATA_DIR, 'referrals.json');
const CREDIT_LEDGER_FILE = path.join(DATA_DIR, 'referral_credits.json');
const BLOCKED_USERS_FILE = path.join(DATA_DIR, 'blocked_users.json');
const DELETED_RECORDS_FILE = path.join(DATA_DIR, 'deleted_records.json');
const SECRET_FILE = path.join(DATA_DIR, '.member_session_secret');

for (const dir of [DATA_DIR, PRIVATE_PROOFS_DIR, PUBLIC_QR_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Server-only protected episode stream URLs.
// Never export or serialize these into public catalog endpoints or static frontend bundles.
const PROTECTED_EPISODE_STREAMS: Record<string, Record<string, string>> = {
  yeralti: {
    'episode-23': '',
  },
  teskilat: {
    'episode-193': 'https://stream.mux.com/019jnoxNSoObArxNDjk8h5HRQDh4ahOYzCruDLCD00zgQ.m3u8',
    'episode-192': 'https://stream.mux.com/9KzAsaCfqKFh5hi4k5o5NCUuYWa3TbQsbCrVgsih8WU.m3u8',
    'episode-189': 'https://stream.mux.com/toXOVmLVaJSsRkVRJUxYiColdHPoHLSI8qBM00KBHyuA.m3u8',
    'episode-188': 'https://stream.mux.com/myroEGBWeut02BU5yZEPr3GT3stSVu91dYtKAJPeJkfs.m3u8',
    'episode-187': 'https://stream.mux.com/vPkzwE9vrAHq4uz4hPyjFu4ZVQOzsORSqxYDzUnYm4o.m3u8',
    'episode-186': 'https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8',
  },
  'mehmed-fetihler-sultani': {
    'episode-92': 'https://stream.mux.com/tMTD9Oqyv001otJN3qLeix01U4u5zT3675V1J9mG01Yy5I.m3u8',
    'episode-91': 'https://stream.mux.com/iZwLfzcSIyWE302WmxZ39wVyGRbT00hw2gYJsdmKosn7s.m3u8',
    'episode-90': 'https://stream.mux.com/iZwLfzcSIyWE302WmxZ39wVyGRbT00hw2gYJsdmKosn7s.m3u8',
    'episode-89': 'https://stream.mux.com/q3MFc527rZ7V0101YFeDLV8aCbWBk5oSnRsNQscKjDRuQ.m3u8',
    'episode-88': 'https://stream.mux.com/4yMhhN6VhrnhA72oCdYqlFQatv1k00kVcQHEuNYPo02Gg.m3u8',
    'episode-87': 'https://stream.mux.com/CNLUrkuH54rxQm44KMrZUcUtKj15j4RcxAyyn2fzTpU.m3u8',
  },
  'gunesin-dogdugu-yer': {
    'episode-9': 'https://stream.mux.com/neflT01u9Ey4vSvhNwuZQH8LcR9IpeWcDFnHO4hS7N02M.m3u8',
    'episode-8': 'https://stream.mux.com/neflT01u9Ey4vSvhNwuZQH8LcR9IpeWcDFnHO4hS7N02M.m3u8',
    'episode-7': 'https://stream.mux.com/neflT01u9Ey4vSvhNwuZQH8LcR9IpeWcDFnHO4hS7N02M.m3u8',
    'episode-5': 'https://stream.mux.com/i1zZCVwsVnWgYj01cysfhD02801SVUNouReM02jM5QUmvjg.m3u8',
    'episode-4': 'https://stream.mux.com/Ck3e005cjwlomj37YDhAp2WFDcwAOcpGsPLagVVtxaVU.m3u8',
    'episode-3': 'https://stream.mux.com/ff2G9XfcMerNcnD02iPnysGkByH6SMTSa7p2yP01DuzT4.m3u8',
  },
};

export type MemberAuthMethod = 'google' | 'email' | 'admin_assigned';

export interface MemberRecord {
  id: string;
  ownerUid?: string;
  authMethod?: MemberAuthMethod;
  email: string;
  fullName: string;
  phone: string;
  phoneNormalized?: string;
  passwordHash: string;
  referralCode?: string;
  referredByMemberId?: string;
  referredByCode?: string;
  creditBalancePkr?: number;
  creditBalanceUsd?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SafeMember {
  id: string;
  ownerUid?: string;
  authMethod: MemberAuthMethod;
  email: string;
  fullName: string;
  phone: string;
  referralCode: string;
  referredByMemberId?: string;
  referredByCode?: string;
  creditBalancePkr: number;
  creditBalanceUsd: number;
  isBlocked?: boolean;
  blockedAt?: string;
  blockedReason?: string;
  blockedByAdminEmail?: string;
  createdAt: string;
}

export interface BlockedUserRecord {
  id: string;
  email: string;
  phone?: string;
  phoneNormalized?: string;
  additionalPhones?: string[];
  memberId?: string;
  fullName?: string;
  reason: string;
  blockedByAdminId: string;
  blockedByAdminEmail: string;
  blockedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type MembershipStatus = 'active' | 'cancelled' | 'expired';

export interface RenewalHistoryEntry {
  id: string;
  orderId?: string;
  renewedAt: string;
  previousExpiresAt: string;
  newExpiresAt: string;
  addedDays: number;
  planId: MembershipPlanId;
  planName: string;
  paymentMethod: PaymentMethod;
  currency: PaymentCurrency;
  amount: number;
  approvedByAdminEmail?: string;
  note?: string;
}

export interface MembershipRecord {
  id: string;
  memberId: string;
  ownerUid?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderId: string;
  planId: MembershipPlanId;
  planName: string;
  pricePkr: number;
  priceUsd?: number;
  originalAmountPkr?: number;
  originalAmountUsd?: number;
  promoCode?: string;
  promoDiscountPkr?: number;
  promoDiscountUsd?: number;
  referralDiscountPkr?: number;
  referralDiscountUsd?: number;
  creditsUsedPkr?: number;
  creditsUsedUsd?: number;
  discountTotalPkr?: number;
  discountTotalUsd?: number;
  durationDays: number;
  selectedDramaIds: string[];
  status: MembershipStatus;
  activatedAt: string;
  expiresAt: string;
  cancelledAt?: string;
  revokedByAdminEmail?: string;
  revokedReason?: string;
  approvedByAdminEmail?: string;
  paymentProvider: string;
  paymentRegion?: PaymentRegion;
  paymentMethod?: PaymentMethod;
  currency?: PaymentCurrency;
  expectedAmount?: number;
  paymentReference: string;
  renewalHistory?: RenewalHistoryEntry[];
  lastExtendedAt?: string;
  createdAt: string;
}

export type OrderStatus =
  | 'awaiting_payment'
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 'expired';

export type OrderType = 'new' | 'renewal';

export interface MembershipOrder {
  id: string;
  memberId: string;
  ownerUid?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderType?: OrderType;
  targetMembershipId?: string;
  planId: MembershipPlanId;
  planName: string;
  amountPkr: number;
  amountUsd?: number;
  originalAmountPkr?: number;
  originalAmountUsd?: number;
  promoCodeId?: string;
  promoCode?: string;
  promoDiscountPkr?: number;
  promoDiscountUsd?: number;
  referralId?: string;
  referralCodeUsed?: string;
  referralDiscountPkr?: number;
  referralDiscountUsd?: number;
  creditsUsedPkr?: number;
  creditsUsedUsd?: number;
  creditsRefundedAt?: string;
  discountTotalPkr?: number;
  discountTotalUsd?: number;
  expectedAmount?: number;
  currency?: PaymentCurrency;
  paymentRegion?: PaymentRegion;
  paymentMethod?: PaymentMethod;
  visitorCountryCode?: string;
  indicativeLocalDisplay?: string;
  durationDays: number;
  selectedDramaIds: string[];
  status: OrderStatus;
  provider: string;
  qrImageUrl?: string;
  providerSessionId?: string;
  checkoutUrl?: string;
  proofFileName?: string;
  proofOriginalName?: string;
  proofMimeType?: string;
  proofDataUrl?: string;
  proofSubmittedAt?: string;
  paymentNote?: string;
  rejectionReason?: string;
  reviewedByAdminId?: string;
  reviewedByAdminEmail?: string;
  reviewedAt?: string;
  paidAt?: string;
  createdAt: string;
  paidAtMs?: number;
  updatedAt: string;
}

export interface MembershipHistoryEntry {
  id: string;
  memberId: string;
  membershipId?: string;
  orderId?: string;
  event:
    | 'account_created'
    | 'checkout_created'
    | 'proof_submitted'
    | 'payment_approved'
    | 'payment_rejected'
    | 'membership_activated'
    | 'membership_renewed'
    | 'membership_extended'
    | 'membership_cancelled'
    | 'membership_revoked'
    | 'membership_expired'
    | 'referral_attributed'
    | 'referral_reward_earned'
    | 'credits_refunded';
  planId?: MembershipPlanId;
  planName?: string;
  amountPkr?: number;
  amountUsd?: number;
  currency?: PaymentCurrency;
  selectedDramaIds?: string[];
  details: string;
  createdAt: string;
}

export type CustomerNotificationType =
  | 'renewal_7d'
  | 'renewal_3d'
  | 'renewal_1d'
  | 'membership_expired'
  | 'membership_approved'
  | 'membership_renewed'
  | 'membership_extended'
  | 'payment_rejected'
  | 'referral_reward'
  | 'episode_published'
  | 'security_alert';

export interface CustomerNotification {
  id: string;
  memberId: string;
  ownerUid?: string;
  customerEmail?: string;
  membershipId?: string;
  orderId?: string;
  planId?: MembershipPlanId;
  dramaIds?: string[];
  type: CustomerNotificationType;
  title: string;
  titleUr?: string;
  message: string;
  messageUr?: string;
  ctaLabel?: string;
  ctaHref?: string;
  dedupeKey: string;
  emailStatus: 'not_sent' | 'not_configured' | 'sent' | 'failed';
  emailError?: string;
  isRead: boolean;
  readAt?: string;
  supersededAt?: string;
  createdAt: string;
}

export interface SchedulerRunLog {
  id: string;
  triggerSource: 'startup' | 'scheduled_interval' | 'admin_manual' | 'cron_endpoint';
  ranAt: string;
  durationMs: number;
  checkedMemberships: number;
  expiredCount: number;
  remindersCreated: number;
  emailsSent: number;
  emailsFailed: number;
  emailsNotConfigured: number;
  summary: string;
}

export type PromoDiscountType = 'percentage' | 'fixed';

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: PromoDiscountType;
  discountPercent: number;
  discountAmountPkr: number;
  discountAmountUsd: number;
  maxDiscountPkr?: number;
  maxDiscountUsd?: number;
  minPurchasePkr: number;
  minPurchaseUsd: number;
  applicablePlanIds: MembershipPlanId[];
  usageLimit: number | null;
  perUserLimit: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByAdminEmail: string;
  rewardForReferrerMemberId?: string;
}

export interface AdminPromoCodeView extends PromoCode {
  usedCount: number;
  approvedUses: number;
  totalDiscountGivenPkr: number;
  totalDiscountGivenUsd: number;
}

export interface ReferralConfig {
  enabled: boolean;
  referrerRewardType: 'credit' | 'promo_code' | 'both';
  referrerRewardPkr: number;
  referrerRewardUsd: number;
  referrerPromoDiscountPercent: number;
  referrerPromoExpiryDays: number;
  refereeDiscountType: 'none' | 'percentage' | 'fixed';
  refereeDiscountPercent: number;
  refereeDiscountPkr: number;
  refereeDiscountUsd: number;
  minOrderPkrForReward: number;
  minOrderUsdForReward: number;
  maxConversionsPerReferrer: number | null;
}

export interface ReferralRecord {
  id: string;
  referrerMemberId: string;
  referrerCode: string;
  referrerEmail: string;
  referrerName: string;
  referredMemberId: string;
  referredOwnerUid?: string;
  referredEmail: string;
  referredName: string;
  referredPhoneNormalized?: string;
  status: 'signed_up' | 'converted' | 'blocked';
  blockReason?: string;
  conversionOrderId?: string;
  convertedAt?: string;
  rewardMode?: ReferralConfig['referrerRewardType'];
  rewardAmountPkr: number;
  rewardAmountUsd: number;
  rewardPromoCode?: string;
  rewardIssuedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralCreditEntry {
  id: string;
  memberId: string;
  type: 'referral_bonus' | 'checkout_spent' | 'checkout_refund' | 'admin_adjustment';
  amountPkr: number;
  amountUsd: number;
  currency: PaymentCurrency;
  referralId?: string;
  orderId?: string;
  details: string;
  createdAt: string;
}

export interface CheckoutPricingQuote {
  valid: boolean;
  error?: string;
  promoError?: string;
  planId: MembershipPlanId;
  planName: string;
  paymentRegion: PaymentRegion;
  currency: PaymentCurrency;
  originalAmountPkr: number;
  originalAmountUsd: number;
  originalAmount: number;
  promoApplied: {
    id: string;
    code: string;
    description: string;
    discountType: PromoDiscountType;
    discountPercent: number;
    discountAmountPkr: number;
    discountAmountUsd: number;
  } | null;
  promoDiscountPkr: number;
  promoDiscountUsd: number;
  promoDiscount: number;
  referralDiscountApplied: boolean;
  referralCodeUsed?: string;
  referralDiscountPkr: number;
  referralDiscountUsd: number;
  referralDiscount: number;
  availableCreditPkr: number;
  availableCreditUsd: number;
  availableCredit: number;
  creditsUsedPkr: number;
  creditsUsedUsd: number;
  creditsUsed: number;
  discountTotalPkr: number;
  discountTotalUsd: number;
  discountTotal: number;
  finalAmountPkr: number;
  finalAmountUsd: number;
  finalAmount: number;
}

export interface MembershipConfig {
  starterQrImage: string;
  standardQrImage: string;
  plusQrImage: string;
  vipQrImage: string;
  starterBinanceQrImage: string;
  standardBinanceQrImage: string;
  plusBinanceQrImage: string;
  vipBinanceQrImage: string;
  usdPrices: Record<MembershipPlanId, number>;
  internationalInstructionsEn: string;
  internationalInstructionsUr: string;
  whatsappNumber: string;
  adminEmail: string;
  supportEmail: string;
  supportNoteEn: string;
  supportNoteUr: string;
  referralConfig: ReferralConfig;
  updatedAt: string;
}

export interface PublicMembershipConfig {
  qrImages: Record<MembershipPlanId, string>;
  binanceQrImages: Record<MembershipPlanId, string>;
  hasBinanceQr: Record<MembershipPlanId, boolean>;
  usdPrices: Record<MembershipPlanId, number>;
  internationalInstructionsEn: string;
  internationalInstructionsUr: string;
  whatsappConfigured: boolean;
  whatsappDigits: string;
  supportEmail: string;
  supportNoteEn: string;
  supportNoteUr: string;
  referralConfig: ReferralConfig;
}

export interface AdminRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'admin';
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface SafeAdmin {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface AdminAuditEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action:
    | 'admin_bootstrapped'
    | 'admin_created'
    | 'admin_role_updated'
    | 'payment_approved'
    | 'payment_rejected'
    | 'membership_assigned'
    | 'membership_extended'
    | 'membership_revoked'
    | 'order_deleted'
    | 'member_deleted'
    | 'membership_deleted'
    | 'config_updated'
    | 'qr_image_updated'
    | 'email_retried'
    | 'reminders_executed'
    | 'promo_created'
    | 'promo_updated'
    | 'promo_deleted'
    | 'referral_config_updated'
    | 'referral_status_updated'
    | 'mux_session_revoked'
    | 'referral_campaign_created'
    | 'referral_campaign_updated'
    | 'referral_commission_approved'
    | 'referral_commission_paid'
    | 'referral_commission_reversed'
    | 'user_blocked'
    | 'user_unblocked'
    | 'automation_settings_updated'
    | 'automation_worker_manual_run'
    | 'episode_notification_sent'
    | 'episode_notification_resent'
    | 'video_lead_updated'
    | 'member_phone_updated'
    | 'whatsapp_queue_settings_updated'
    | 'whatsapp_notification_edited'
    | 'whatsapp_notification_opened'
    | 'whatsapp_notification_confirmed_sent'
    | 'whatsapp_notification_cancelled'
    | 'automation_bot_started'
    | 'automation_bot_stopped'
    | 'historical_campaign_launched';
  targetId?: string;
  details: string;
  createdAt: string;
}

export interface EmailNotificationLog {
  id: string;
  orderId?: string;
  membershipId?: string;
  customerNotificationId?: string;
  to: string;
  subject: string;
  html: string;
  type:
    | 'admin_payment_verification'
    | 'member_payment_approved'
    | 'member_payment_rejected'
    | 'member_renewal_reminder'
    | 'member_membership_expired';
  status: 'sent' | 'failed';
  provider?: string;
  error?: string;
  attempts: number;
  createdAt: string;
  lastAttemptAt: string;
}

export interface PaymentGatewayStatus {
  configured: boolean;
  provider: 'bank_qr' | 'binance_qr' | 'stripe' | 'safepay' | 'payfast';
  missingCredentials: string[];
  instructions: string;
}

export interface TrackedEmailDispatcherResult {
  success: boolean;
  provider?: string;
  error?: string;
  smtpError?: string;
  notConfigured?: boolean;
}

export type LifecycleEmailDispatcher = (params: {
  to: string;
  subject: string;
  html: string;
  type: 'member_renewal_reminder' | 'member_membership_expired';
  membershipId?: string;
  customerNotificationId?: string;
}) => Promise<TrackedEmailDispatcherResult>;

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (!raw || !raw.trim()) return fallback;
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.error(`[MembershipStore] Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJson<T>(filePath: string, data: T): boolean {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
    return true;
  } catch (err) {
    console.error(`[MembershipStore] Error writing ${filePath}:`, err);
    return false;
  }
}

function getSessionSecret(): string {
  if (process.env.MEMBER_SESSION_SECRET && process.env.MEMBER_SESSION_SECRET.trim().length >= 16) {
    return process.env.MEMBER_SESSION_SECRET.trim();
  }
  try {
    if (fs.existsSync(SECRET_FILE)) {
      const stored = fs.readFileSync(SECRET_FILE, 'utf-8').trim();
      if (stored.length >= 32) return stored;
    }
    const generated = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(SECRET_FILE, generated, { mode: 0o600 });
    return generated;
  } catch {
    return crypto.createHash('sha256').update(process.cwd() + process.pid).digest('hex');
  }
}

export function hashMemberPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.pbkdf2Sync(password, salt, 12000, 64, 'sha512').toString('hex');
  return `${salt}:${derived}`;
}

export function verifyMemberPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  try {
    const [salt, originalHex] = storedHash.split(':');
    const derivedHex = crypto.pbkdf2Sync(password, salt, 12000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHex, 'hex'), Buffer.from(derivedHex, 'hex'));
  } catch {
    return false;
  }
}

export function createMemberSessionToken(member: SafeMember): string {
  const payload = {
    typ: 'member',
    sub: member.id,
    email: member.email,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyMemberSessionToken(token: string | undefined): { memberId: string; email: string } | null {
  if (!token || !token.includes('.')) return null;
  try {
    const [encoded, sig] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', getSessionSecret())
      .update(encoded)
      .digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    if (!decoded?.sub || !decoded?.exp || Date.now() > decoded.exp) {
      return null;
    }
    if (decoded.typ && decoded.typ !== 'member') {
      return null;
    }
    return { memberId: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}

export function createAdminSessionToken(admin: SafeAdmin): string {
  const payload = {
    typ: 'admin',
    sub: admin.id,
    email: admin.email,
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): SafeAdmin | null {
  if (!token || !token.includes('.')) return null;
  try {
    const [encoded, sig] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', getSessionSecret())
      .update(encoded)
      .digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    if (decoded?.typ !== 'admin' || decoded?.role !== 'admin' || !decoded?.sub || !decoded?.exp) {
      return null;
    }
    if (Date.now() > decoded.exp) return null;

    syncEnvAdmin();
    const admins = readJson<AdminRecord[]>(ADMINS_FILE, []);
    const found = admins.find(
      (a) => a.id === decoded.sub && a.email === decoded.email && a.isActive && a.role === 'admin'
    );
    return found ? sanitizeAdmin(found) : null;
  } catch {
    return null;
  }
}

function inferMemberAuthMethod(member: Pick<MemberRecord, 'ownerUid' | 'authMethod'>): MemberAuthMethod {
  if (member.authMethod) return member.authMethod;
  if (
    member.ownerUid &&
    member.ownerUid !== 'admin_assigned' &&
    member.ownerUid !== 'email_member'
  ) {
    return 'google';
  }
  if (member.ownerUid === 'admin_assigned') {
    return 'admin_assigned';
  }
  return 'email';
}

function sanitizeMember(member: MemberRecord): SafeMember {
  const blocked = getBlockedUserByEmail(member.email);
  return {
    id: member.id,
    ownerUid: member.ownerUid,
    authMethod: inferMemberAuthMethod(member),
    email: member.email,
    fullName: member.fullName,
    phone: member.phone || '',
    referralCode: member.referralCode || '',
    referredByMemberId: member.referredByMemberId,
    referredByCode: member.referredByCode,
    creditBalancePkr: Math.max(0, Math.round(Number(member.creditBalancePkr) || 0)),
    creditBalanceUsd: Math.max(0, Math.round((Number(member.creditBalanceUsd) || 0) * 100) / 100),
    isBlocked: Boolean(blocked),
    blockedAt: blocked?.blockedAt,
    blockedReason: blocked?.reason,
    blockedByAdminEmail: blocked?.blockedByAdminEmail,
    createdAt: member.createdAt,
  };
}

function sanitizeAdmin(admin: AdminRecord): SafeAdmin {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    isActive: admin.isActive,
    createdAt: admin.createdAt,
    createdBy: admin.createdBy,
  };
}

function mirrorMemberServer(member: SafeMember) {
  if (!isServerFirestoreEnabled()) return;
  void mirrorDocToFirestoreServer('members', member.id, {
    id: member.id,
    ownerUid: member.ownerUid || 'email_member',
    email: member.email,
    fullName: member.fullName,
    phone: member.phone || '',
    referralCode: member.referralCode || '',
    referredByMemberId: member.referredByMemberId || '',
    referredByCode: member.referredByCode || '',
    creditBalancePkr: member.creditBalancePkr || 0,
    creditBalanceUsd: member.creditBalanceUsd || 0,
    createdAtIso: member.createdAt,
    updatedAtIso: new Date().toISOString(),
  });
}

function mirrorOrderServer(order: MembershipOrder) {
  if (!isServerFirestoreEnabled()) return;
  void mirrorDocToFirestoreServer('membershipOrders', order.id, {
    ...order,
    ownerUid: order.ownerUid || 'email_member',
    createdAtIso: order.createdAt,
    updatedAtIso: order.updatedAt,
  });
}

function mirrorMembershipServer(sub: MembershipRecord) {
  if (!isServerFirestoreEnabled()) return;
  void mirrorDocToFirestoreServer('memberships', sub.id, {
    ...sub,
    ownerUid: sub.ownerUid || 'admin_assigned',
    createdAtIso: sub.createdAt,
    updatedAtIso: new Date().toISOString(),
  });
}

function mirrorConfigServer(cfg: MembershipConfig) {
  if (!isServerFirestoreEnabled()) return;
  void mirrorDocToFirestoreServer('membershipConfig', 'public', {
    ...cfg,
    updatedAtIso: cfg.updatedAt,
  });
}

function mirrorMemberNotificationServer(notif: CustomerNotification) {
  if (!isServerFirestoreEnabled()) return;
  void mirrorDocToFirestoreServer('memberNotifications', notif.id, {
    ...notif,
    ownerUid: notif.ownerUid || 'email_member',
    createdAtIso: notif.createdAt,
    updatedAtIso: notif.readAt || notif.supersededAt || notif.createdAt,
  });
}

function mirrorSchedulerRunServer(run: SchedulerRunLog) {
  if (!isServerFirestoreEnabled()) return;
  void mirrorDocToFirestoreServer('schedulerRuns', run.id, {
    ...run,
    ranAtIso: run.ranAt,
  });
}

function mirrorPromoCodeServer(promo: PromoCode) {
  if (!isServerFirestoreEnabled()) return;
  void mirrorDocToFirestoreServer('promoCodes', promo.id, {
    ...promo,
    createdAtIso: promo.createdAt,
    updatedAtIso: promo.updatedAt,
  });
}

function mirrorReferralServer(ref: ReferralRecord) {
  if (!isServerFirestoreEnabled()) return;
  void mirrorDocToFirestoreServer('referrals', ref.id, {
    ...ref,
    createdAtIso: ref.createdAt,
    updatedAtIso: ref.updatedAt,
  });
}

function mirrorCreditEntryServer(entry: ReferralCreditEntry) {
  if (!isServerFirestoreEnabled()) return;
  void mirrorDocToFirestoreServer('referralCredits', entry.id, {
    ...entry,
    createdAtIso: entry.createdAt,
  });
}

function appendHistory(entry: Omit<MembershipHistoryEntry, 'id' | 'createdAt'>): MembershipHistoryEntry {
  const history = readJson<MembershipHistoryEntry[]>(HISTORY_FILE, []);
  const item: MembershipHistoryEntry = {
    ...entry,
    id: `hist-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    createdAt: new Date().toISOString(),
  };
  history.unshift(item);
  if (history.length > 2500) history.length = 2500;
  writeJson(HISTORY_FILE, history);
  if (isServerFirestoreEnabled()) {
    void mirrorDocToFirestoreServer('membershipHistory', item.id, {
      ...item,
      ownerUid: 'server_sync',
      createdAtIso: item.createdAt,
    });
  }
  return item;
}

export function appendAdminAudit(entry: Omit<AdminAuditEntry, 'id' | 'createdAt'>): AdminAuditEntry {
  const logs = readJson<AdminAuditEntry[]>(ADMIN_AUDIT_FILE, []);
  const item: AdminAuditEntry = {
    ...entry,
    id: `aud-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    createdAt: new Date().toISOString(),
  };
  logs.unshift(item);
  if (logs.length > 2500) logs.length = 2500;
  writeJson(ADMIN_AUDIT_FILE, logs);
  return item;
}

export function createCustomerNotificationRecord(
  input: Omit<CustomerNotification, 'id' | 'createdAt' | 'isRead'> & { isRead?: boolean }
): { notification: CustomerNotification; created: boolean } {
  const existingAll = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);
  const duplicate = existingAll.find((n) => n.dedupeKey === input.dedupeKey);
  if (duplicate) {
    return { notification: duplicate, created: false };
  }
  const nowIso = new Date().toISOString();
  const record: CustomerNotification = {
    ...input,
    id: `mnotif-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    isRead: Boolean(input.isRead),
    createdAt: nowIso,
  };
  existingAll.unshift(record);
  if (existingAll.length > 5000) existingAll.length = 5000;
  writeJson(MEMBER_NOTIFS_FILE, existingAll);
  mirrorMemberNotificationServer(record);
  return { notification: record, created: true };
}

function supersedeOldRenewalReminders(membershipId: string, nowIso: string): void {
  const all = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);
  let changed = false;
  for (const n of all) {
    if (
      n.membershipId === membershipId &&
      !n.supersededAt &&
      (n.type === 'renewal_7d' || n.type === 'renewal_3d' || n.type === 'renewal_1d' || n.type === 'membership_expired')
    ) {
      n.supersededAt = nowIso;
      n.isRead = true;
      n.readAt = n.readAt || nowIso;
      changed = true;
      mirrorMemberNotificationServer(n);
    }
  }
  if (changed) {
    writeJson(MEMBER_NOTIFS_FILE, all);
  }
}

export function markMemberNotificationRead(params: {
  memberId: string;
  notifId: string;
}): boolean {
  const all = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);
  const idx = all.findIndex((n) => n.id === params.notifId && n.memberId === params.memberId);
  if (idx === -1) return false;
  all[idx].isRead = true;
  all[idx].readAt = all[idx].readAt || new Date().toISOString();
  writeJson(MEMBER_NOTIFS_FILE, all);
  mirrorMemberNotificationServer(all[idx]);
  return true;
}

export function markAllMemberNotificationsRead(memberId: string): number {
  const all = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);
  const nowIso = new Date().toISOString();
  let count = 0;
  for (const n of all) {
    if (n.memberId === memberId && !n.isRead) {
      n.isRead = true;
      n.readAt = nowIso;
      count += 1;
      mirrorMemberNotificationServer(n);
    }
  }
  if (count > 0) writeJson(MEMBER_NOTIFS_FILE, all);
  return count;
}

const DEFAULT_REFERRAL_CONFIG: ReferralConfig = {
  enabled: true,
  referrerRewardType: 'credit',
  referrerRewardPkr: 150,
  referrerRewardUsd: 0.75,
  referrerPromoDiscountPercent: 25,
  referrerPromoExpiryDays: 30,
  refereeDiscountType: 'percentage',
  refereeDiscountPercent: 10,
  refereeDiscountPkr: 50,
  refereeDiscountUsd: 0.25,
  minOrderPkrForReward: 100,
  minOrderUsdForReward: 0.5,
  maxConversionsPerReferrer: 50,
};

// --- CONFIGURATION STORE ---
const DEFAULT_CONFIG: MembershipConfig = {
  starterQrImage: '/images/qr/starter-qr.jpg',
  standardQrImage: '/images/qr/standard-qr.jpg',
  plusQrImage: '/images/qr/plus-qr.jpg',
  vipQrImage: '/images/qr/vip-qr.jpg',
  starterBinanceQrImage: '/images/qr/starter-binance-qr.jpg',
  standardBinanceQrImage: '/images/qr/standard-binance-qr.jpg',
  plusBinanceQrImage: '/images/qr/plus-binance-qr.jpg',
  vipBinanceQrImage: '/images/qr/vip-binance-qr.jpg',
  usdPrices: { ...DEFAULT_USD_PRICES },
  internationalInstructionsEn:
    'Scan this Binance Pay QR in the Binance App and pay the exact USD amount shown. Upload your payment screenshot below for manual verification by our team.',
  internationalInstructionsUr:
    'بائنینس ایپ (Binance App) میں یہ QR کوڈ اسکین کریں اور درج شدہ بالکل درست USD رقم ادا کریں۔ ادائیگی کے بعد اسکرین شاٹ نیچے اپ لوڈ کریں تاکہ ہماری ٹیم تصدیق کر سکے۔',
  whatsappNumber: (process.env.FEVIQO_WHATSAPP_NUMBER || '+923227811264').trim(),
  adminEmail: (process.env.FEVIQO_ADMIN_EMAIL || 'partner@feviqo.com').trim(),
  supportEmail: 'partner@feviqo.com',
  supportNoteEn: 'Payments are manually verified by our team before membership activation.',
  supportNoteUr: 'ادائیگی کی دستی تصدیق کے بعد آپ کی ممبرشپ فعال کر دی جاتی ہے۔',
  referralConfig: { ...DEFAULT_REFERRAL_CONFIG },
  updatedAt: new Date().toISOString(),
};

function sanitizeReferralConfig(
  raw: Partial<ReferralConfig> | undefined,
  fallback: ReferralConfig = DEFAULT_REFERRAL_CONFIG
): ReferralConfig {
  const src = raw || {};
  const clampNum = (v: unknown, fb: number, min: number, max: number, decimals = 2) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < min || n > max) return fb;
    const factor = Math.pow(10, decimals);
    return Math.round(n * factor) / factor;
  };
  return {
    enabled: src.enabled !== undefined ? Boolean(src.enabled) : fallback.enabled,
    referrerRewardType:
      src.referrerRewardType === 'promo_code' || src.referrerRewardType === 'both' || src.referrerRewardType === 'credit'
        ? src.referrerRewardType
        : fallback.referrerRewardType,
    referrerRewardPkr: clampNum(src.referrerRewardPkr, fallback.referrerRewardPkr, 0, 100000, 0),
    referrerRewardUsd: clampNum(src.referrerRewardUsd, fallback.referrerRewardUsd, 0, 500, 2),
    referrerPromoDiscountPercent: clampNum(
      src.referrerPromoDiscountPercent,
      fallback.referrerPromoDiscountPercent,
      1,
      100,
      0
    ),
    referrerPromoExpiryDays: clampNum(
      src.referrerPromoExpiryDays,
      fallback.referrerPromoExpiryDays,
      1,
      365,
      0
    ),
    refereeDiscountType:
      src.refereeDiscountType === 'none' ||
      src.refereeDiscountType === 'percentage' ||
      src.refereeDiscountType === 'fixed'
        ? src.refereeDiscountType
        : fallback.refereeDiscountType,
    refereeDiscountPercent: clampNum(
      src.refereeDiscountPercent,
      fallback.refereeDiscountPercent,
      0,
      90,
      0
    ),
    refereeDiscountPkr: clampNum(src.refereeDiscountPkr, fallback.refereeDiscountPkr, 0, 50000, 0),
    refereeDiscountUsd: clampNum(src.refereeDiscountUsd, fallback.refereeDiscountUsd, 0, 500, 2),
    minOrderPkrForReward: clampNum(src.minOrderPkrForReward, fallback.minOrderPkrForReward, 0, 100000, 0),
    minOrderUsdForReward: clampNum(src.minOrderUsdForReward, fallback.minOrderUsdForReward, 0, 500, 2),
    maxConversionsPerReferrer:
      src.maxConversionsPerReferrer === null
        ? null
        : src.maxConversionsPerReferrer !== undefined && Number.isFinite(Number(src.maxConversionsPerReferrer)) && Number(src.maxConversionsPerReferrer) >= 1
          ? Math.min(10000, Math.round(Number(src.maxConversionsPerReferrer)))
          : fallback.maxConversionsPerReferrer,
  };
}

function sanitizeUsdPrice(raw: unknown, fallback: number): number {
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0 || num > 10000) return fallback;
  return Math.round(num * 100) / 100;
}

export function getMembershipConfig(): MembershipConfig {
  const saved = readJson<Partial<MembershipConfig>>(CONFIG_FILE, {});
  const savedUsd = saved.usdPrices || ({} as Partial<Record<MembershipPlanId, number>>);
  return {
    starterQrImage: saved.starterQrImage || DEFAULT_CONFIG.starterQrImage,
    standardQrImage: saved.standardQrImage || DEFAULT_CONFIG.standardQrImage,
    plusQrImage: saved.plusQrImage || DEFAULT_CONFIG.plusQrImage,
    vipQrImage: saved.vipQrImage || DEFAULT_CONFIG.vipQrImage,
    starterBinanceQrImage: saved.starterBinanceQrImage || DEFAULT_CONFIG.starterBinanceQrImage,
    standardBinanceQrImage: saved.standardBinanceQrImage || DEFAULT_CONFIG.standardBinanceQrImage,
    plusBinanceQrImage: saved.plusBinanceQrImage || DEFAULT_CONFIG.plusBinanceQrImage,
    vipBinanceQrImage: saved.vipBinanceQrImage || DEFAULT_CONFIG.vipBinanceQrImage,
    usdPrices: {
      starter: sanitizeUsdPrice(savedUsd.starter, DEFAULT_USD_PRICES.starter),
      standard: sanitizeUsdPrice(savedUsd.standard, DEFAULT_USD_PRICES.standard),
      plus: sanitizeUsdPrice(savedUsd.plus, DEFAULT_USD_PRICES.plus),
      vip: sanitizeUsdPrice(savedUsd.vip, DEFAULT_USD_PRICES.vip),
    },
    internationalInstructionsEn:
      saved.internationalInstructionsEn || DEFAULT_CONFIG.internationalInstructionsEn,
    internationalInstructionsUr:
      saved.internationalInstructionsUr || DEFAULT_CONFIG.internationalInstructionsUr,
    whatsappNumber:
      saved.whatsappNumber !== undefined
        ? saved.whatsappNumber
        : (process.env.FEVIQO_WHATSAPP_NUMBER || '+923227811264').trim(),
    adminEmail:
      saved.adminEmail ||
      (process.env.FEVIQO_ADMIN_EMAIL || 'partner@feviqo.com').trim(),
    supportEmail: saved.supportEmail || DEFAULT_CONFIG.supportEmail,
    supportNoteEn: saved.supportNoteEn || DEFAULT_CONFIG.supportNoteEn,
    supportNoteUr: saved.supportNoteUr || DEFAULT_CONFIG.supportNoteUr,
    referralConfig: sanitizeReferralConfig(saved.referralConfig, DEFAULT_REFERRAL_CONFIG),
    updatedAt: saved.updatedAt || DEFAULT_CONFIG.updatedAt,
  };
}

export function getResolvedPlans(): MembershipPlan[] {
  const cfg = getMembershipConfig();
  return MEMBERSHIP_PLANS.map((p) => {
    const usd = cfg.usdPrices[p.id] ?? p.priceUsd;
    return {
      ...p,
      priceUsd: usd,
      priceUsdDisplay: `$${usd.toFixed(2)} USD`,
    };
  });
}

export function normalizeWhatsappDigits(raw: string): string {
  const digits = (raw || '').replace(/[^\d]/g, '');
  if (digits.startsWith('0') && digits.length === 11) {
    return `92${digits.slice(1)}`;
  }
  return digits;
}

export function getPublicMembershipConfig(): PublicMembershipConfig {
  const cfg = getMembershipConfig();
  const whatsappDigits = normalizeWhatsappDigits(cfg.whatsappNumber);
  return {
    qrImages: {
      starter: cfg.starterQrImage,
      standard: cfg.standardQrImage,
      plus: cfg.plusQrImage,
      vip: cfg.vipQrImage,
    },
    binanceQrImages: {
      starter: cfg.starterBinanceQrImage,
      standard: cfg.standardBinanceQrImage,
      plus: cfg.plusBinanceQrImage,
      vip: cfg.vipBinanceQrImage,
    },
    hasBinanceQr: {
      starter: Boolean(cfg.starterBinanceQrImage),
      standard: Boolean(cfg.standardBinanceQrImage),
      plus: Boolean(cfg.plusBinanceQrImage),
      vip: Boolean(cfg.vipBinanceQrImage),
    },
    usdPrices: cfg.usdPrices,
    internationalInstructionsEn: cfg.internationalInstructionsEn,
    internationalInstructionsUr: cfg.internationalInstructionsUr,
    whatsappConfigured: whatsappDigits.length >= 10,
    whatsappDigits,
    supportEmail: cfg.supportEmail,
    supportNoteEn: cfg.supportNoteEn,
    supportNoteUr: cfg.supportNoteUr,
    referralConfig: cfg.referralConfig,
  };
}

export function getQrUrlForPlan(
  planId: MembershipPlanId,
  region: PaymentRegion = 'pakistan'
): string {
  const cfg = getMembershipConfig();
  if (region === 'international') {
    switch (planId) {
      case 'starter':
        return cfg.starterBinanceQrImage || '';
      case 'standard':
        return cfg.standardBinanceQrImage || '';
      case 'plus':
        return cfg.plusBinanceQrImage || '';
      case 'vip':
        return cfg.vipBinanceQrImage || '';
    }
  }
  switch (planId) {
    case 'starter':
      return cfg.starterQrImage;
    case 'standard':
      return cfg.standardQrImage;
    case 'plus':
      return cfg.plusQrImage;
    case 'vip':
      return cfg.vipQrImage;
  }
}

export function resolveQrDiskPath(
  planId: MembershipPlanId,
  region: PaymentRegion = 'pakistan'
): string | null {
  const qrUrl = getQrUrlForPlan(planId, region);
  if (qrUrl.startsWith('/images/qr/')) {
    const fileName = path.basename(qrUrl);
    const full = path.join(PUBLIC_QR_DIR, fileName);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

export function updateMembershipConfig(params: {
  updates: Partial<MembershipConfig>;
  admin: SafeAdmin;
}): MembershipConfig {
  const current = getMembershipConfig();
  const updUsd = params.updates.usdPrices || ({} as Partial<Record<MembershipPlanId, number>>);
  const next: MembershipConfig = {
    ...current,
    starterQrImage: params.updates.starterQrImage?.trim() || current.starterQrImage,
    standardQrImage: params.updates.standardQrImage?.trim() || current.standardQrImage,
    plusQrImage: params.updates.plusQrImage?.trim() || current.plusQrImage,
    vipQrImage: params.updates.vipQrImage?.trim() || current.vipQrImage,
    starterBinanceQrImage:
      params.updates.starterBinanceQrImage !== undefined
        ? params.updates.starterBinanceQrImage.trim()
        : current.starterBinanceQrImage,
    standardBinanceQrImage:
      params.updates.standardBinanceQrImage !== undefined
        ? params.updates.standardBinanceQrImage.trim()
        : current.standardBinanceQrImage,
    plusBinanceQrImage:
      params.updates.plusBinanceQrImage !== undefined
        ? params.updates.plusBinanceQrImage.trim()
        : current.plusBinanceQrImage,
    vipBinanceQrImage:
      params.updates.vipBinanceQrImage !== undefined
        ? params.updates.vipBinanceQrImage.trim()
        : current.vipBinanceQrImage,
    usdPrices: {
      starter: sanitizeUsdPrice(updUsd.starter, current.usdPrices.starter),
      standard: sanitizeUsdPrice(updUsd.standard, current.usdPrices.standard),
      plus: sanitizeUsdPrice(updUsd.plus, current.usdPrices.plus),
      vip: sanitizeUsdPrice(updUsd.vip, current.usdPrices.vip),
    },
    internationalInstructionsEn:
      params.updates.internationalInstructionsEn?.trim() || current.internationalInstructionsEn,
    internationalInstructionsUr:
      params.updates.internationalInstructionsUr?.trim() || current.internationalInstructionsUr,
    whatsappNumber:
      params.updates.whatsappNumber !== undefined
        ? params.updates.whatsappNumber.trim()
        : current.whatsappNumber,
    adminEmail:
      params.updates.adminEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.updates.adminEmail.trim())
        ? params.updates.adminEmail.trim()
        : current.adminEmail,
    supportEmail: params.updates.supportEmail?.trim() || current.supportEmail,
    supportNoteEn: params.updates.supportNoteEn?.trim() || current.supportNoteEn,
    supportNoteUr: params.updates.supportNoteUr?.trim() || current.supportNoteUr,
    referralConfig: params.updates.referralConfig
      ? sanitizeReferralConfig(params.updates.referralConfig, current.referralConfig)
      : current.referralConfig,
    updatedAt: new Date().toISOString(),
  };

  writeJson(CONFIG_FILE, next);
  mirrorConfigServer(next);
  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'config_updated',
    details: `Updated membership config (USD Starter=$${next.usdPrices.starter}, Standard=$${next.usdPrices.standard}, Plus=$${next.usdPrices.plus}, VIP=$${next.usdPrices.vip}; WhatsApp: ${next.whatsappNumber ? 'set' : 'unset'}).`,
  });
  return next;
}

export function updateReferralConfig(params: {
  updates: Partial<ReferralConfig>;
  admin: SafeAdmin;
}): MembershipConfig {
  const current = getMembershipConfig();
  const nextReferralConfig = sanitizeReferralConfig(params.updates, current.referralConfig);
  const next: MembershipConfig = {
    ...current,
    referralConfig: nextReferralConfig,
    updatedAt: new Date().toISOString(),
  };
  writeJson(CONFIG_FILE, next);
  mirrorConfigServer(next);
  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'referral_config_updated',
    targetId: 'referralConfig',
    details: `Updated referral rewards (enabled=${nextReferralConfig.enabled}, mode=${nextReferralConfig.referrerRewardType}, reward=PKR ${nextReferralConfig.referrerRewardPkr}/$${nextReferralConfig.referrerRewardUsd}, referee=${nextReferralConfig.refereeDiscountType}).`,
  });
  return next;
}

export function saveUploadedQrImage(params: {
  planId: MembershipPlanId;
  region?: PaymentRegion;
  buffer: Buffer;
  admin: SafeAdmin;
}): { success: true; imageUrl: string; config: MembershipConfig } | { success: false; error: string } {
  const detected = detectImageType(params.buffer);
  if (!detected) {
    return { success: false, error: 'Invalid QR image file. Only JPG, PNG, or WebP images are allowed.' };
  }
  if (params.buffer.length > 8 * 1024 * 1024) {
    return { success: false, error: 'QR image file size must not exceed 8 MB.' };
  }

  const region: PaymentRegion = params.region === 'international' ? 'international' : 'pakistan';
  const suffix = region === 'international' ? 'binance-qr' : 'qr';
  const fileName = `${params.planId}-${suffix}-${Date.now()}.${detected.ext}`;
  const destPath = path.join(PUBLIC_QR_DIR, fileName);
  fs.writeFileSync(destPath, params.buffer);
  const imageUrl = `/images/qr/${fileName}`;

  const updates: Partial<MembershipConfig> = {};
  if (region === 'international') {
    if (params.planId === 'starter') updates.starterBinanceQrImage = imageUrl;
    if (params.planId === 'standard') updates.standardBinanceQrImage = imageUrl;
    if (params.planId === 'plus') updates.plusBinanceQrImage = imageUrl;
    if (params.planId === 'vip') updates.vipBinanceQrImage = imageUrl;
  } else {
    if (params.planId === 'starter') updates.starterQrImage = imageUrl;
    if (params.planId === 'standard') updates.standardQrImage = imageUrl;
    if (params.planId === 'plus') updates.plusQrImage = imageUrl;
    if (params.planId === 'vip') updates.vipQrImage = imageUrl;
  }

  const current = getMembershipConfig();
  const next: MembershipConfig = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeJson(CONFIG_FILE, next);
  mirrorConfigServer(next);

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'qr_image_updated',
    targetId: `${params.planId}:${region}`,
    details: `Uploaded ${detected.ext.toUpperCase()} ${region === 'international' ? 'Binance USD QR' : 'Pakistani Bank QR'} image for ${params.planId} plan (${fileName}).`,
  });

  return { success: true, imageUrl, config: next };
}

// --- IMAGE MAGIC-BYTE VALIDATION ---
export function detectImageType(buf: Buffer): { mime: 'image/jpeg' | 'image/png' | 'image/webp'; ext: 'jpg' | 'png' | 'webp' } | null {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' };
  }
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return { mime: 'image/webp', ext: 'webp' };
  }
  return null;
}

// --- ADMIN STORE & AUTH ---
function syncEnvAdmin() {
  const envEmail = (process.env.FEVIQO_ADMIN_EMAIL || '').trim().toLowerCase();
  const envPass = (process.env.FEVIQO_ADMIN_PASSWORD || '').trim();
  if (!envEmail || !envPass) return;

  const admins = readJson<AdminRecord[]>(ADMINS_FILE, []);
  const existing = admins.find((a) => a.email === envEmail);
  if (!existing) {
    admins.unshift({
      id: `adm-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      email: envEmail,
      name: 'FEVIQO Administrator',
      passwordHash: hashMemberPassword(envPass),
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'environment',
    });
    writeJson(ADMINS_FILE, admins);
  } else if (!verifyMemberPassword(envPass, existing.passwordHash)) {
    existing.passwordHash = hashMemberPassword(envPass);
    existing.isActive = true;
    writeJson(ADMINS_FILE, admins);
  }
}

export function getAdminAuthStatus(): { hasConfiguredAdmins: boolean; configuredAdminEmail: string } {
  syncEnvAdmin();
  const admins = readJson<AdminRecord[]>(ADMINS_FILE, []);
  const hasActive = admins.some((a) => a.isActive && a.role === 'admin');
  return {
    hasConfiguredAdmins: hasActive,
    configuredAdminEmail: '',
  };
}

export function bootstrapFirstAdmin(params: {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}): { success: true; admin: SafeAdmin; token: string } | { success: false; error: string; statusCode: number } {
  syncEnvAdmin();
  const admins = readJson<AdminRecord[]>(ADMINS_FILE, []);
  if (admins.some((a) => a.isActive && a.role === 'admin')) {
    return {
      success: false,
      error: 'Administrator setup is already locked. Sign in with an authorized admin account.',
      statusCode: 403,
    };
  }

  const email = (params.email || '').trim().toLowerCase();
  const name = (params.name || '').trim() || 'FEVIQO Admin';
  const password = params.password || '';
  const confirmPassword = params.confirmPassword || '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid administrator email address.', statusCode: 400 };
  }
  const configuredOwner = (process.env.FEVIQO_ADMIN_EMAIL || '').trim().toLowerCase();
  if (configuredOwner && email !== configuredOwner) {
    return {
      success: false,
      error: 'Initial admin setup is restricted to the configured FEVIQO administrator email.',
      statusCode: 403,
    };
  }
  if (password.length < 8) {
    return { success: false, error: 'Administrator password must be at least 8 characters long.', statusCode: 400 };
  }
  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.', statusCode: 400 };
  }

  const record: AdminRecord = {
    id: `adm-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    email,
    name,
    passwordHash: hashMemberPassword(password),
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'initial_owner_setup',
  };

  admins.unshift(record);
  writeJson(ADMINS_FILE, admins);

  const safe = sanitizeAdmin(record);
  appendAdminAudit({
    adminId: safe.id,
    adminEmail: safe.email,
    action: 'admin_bootstrapped',
    targetId: safe.id,
    details: `Primary administrator account initialized for ${safe.email}.`,
  });

  return { success: true, admin: safe, token: createAdminSessionToken(safe) };
}

export function loginAdmin(params: {
  email: string;
  password: string;
}): { success: true; admin: SafeAdmin; token: string } | { success: false; error: string; statusCode: number } {
  syncEnvAdmin();
  const email = (params.email || '').trim().toLowerCase();
  const password = params.password || '';

  if (!email || !password) {
    return { success: false, error: 'Administrator email and password are required.', statusCode: 400 };
  }

  const admins = readJson<AdminRecord[]>(ADMINS_FILE, []);
  const found = admins.find((a) => a.email === email && a.role === 'admin');
  if (!found || !verifyMemberPassword(password, found.passwordHash)) {
    return { success: false, error: 'Invalid administrator credentials.', statusCode: 401 };
  }
  if (!found.isActive) {
    return { success: false, error: 'This administrator account has been deactivated.', statusCode: 403 };
  }

  const safe = sanitizeAdmin(found);
  return { success: true, admin: safe, token: createAdminSessionToken(safe) };
}

export function loginAdminWithGoogle(params: {
  uid: string;
  email: string;
  name?: string;
}): { success: true; admin: SafeAdmin; token: string } | { success: false; error: string; statusCode: number } {
  syncEnvAdmin();
  const email = (params.email || '').trim().toLowerCase();
  if (!email) {
    return { success: false, error: 'Google account email is required.', statusCode: 400 };
  }

  const admins = readJson<AdminRecord[]>(ADMINS_FILE, []);
  let found = admins.find((a) => a.email === email && a.role === 'admin');

  if (!found && email === 'rexanmedia01@gmail.com') {
    found = {
      id: `adm-google-${params.uid.slice(0, 24)}`,
      email,
      name: (params.name || 'FEVIQO Owner').trim(),
      passwordHash: hashMemberPassword(crypto.randomBytes(24).toString('hex')),
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'firebase_google_owner',
    };
    admins.unshift(found);
    writeJson(ADMINS_FILE, admins);
  }

  if (!found) {
    return {
      success: false,
      error: `The Google account ${email} is not authorized as a FEVIQO administrator.`,
      statusCode: 403,
    };
  }
  if (!found.isActive) {
    return { success: false, error: 'This administrator account has been deactivated.', statusCode: 403 };
  }

  const safe = sanitizeAdmin(found);
  return { success: true, admin: safe, token: createAdminSessionToken(safe) };
}

export function listAdmins(): SafeAdmin[] {
  syncEnvAdmin();
  return readJson<AdminRecord[]>(ADMINS_FILE, []).map(sanitizeAdmin);
}

export function createAdditionalAdmin(params: {
  email: string;
  name: string;
  password: string;
  byAdmin: SafeAdmin;
}): { success: true; admin: SafeAdmin } | { success: false; error: string } {
  const email = (params.email || '').trim().toLowerCase();
  const name = (params.name || '').trim();
  const password = params.password || '';

  if (!name) return { success: false, error: 'Administrator name is required.' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Valid email address is required.' };
  }
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  const admins = readJson<AdminRecord[]>(ADMINS_FILE, []);
  if (admins.some((a) => a.email === email)) {
    return { success: false, error: 'An administrator account already exists for this email.' };
  }

  const record: AdminRecord = {
    id: `adm-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    email,
    name,
    passwordHash: hashMemberPassword(password),
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: params.byAdmin.email,
  };
  admins.unshift(record);
  writeJson(ADMINS_FILE, admins);

  appendAdminAudit({
    adminId: params.byAdmin.id,
    adminEmail: params.byAdmin.email,
    action: 'admin_created',
    targetId: record.id,
    details: `Granted administrator access to ${email} (${name}).`,
  });

  return { success: true, admin: sanitizeAdmin(record) };
}

export function toggleAdminActiveStatus(params: {
  targetAdminId: string;
  isActive: boolean;
  byAdmin: SafeAdmin;
}): { success: true; admin: SafeAdmin } | { success: false; error: string } {
  const admins = readJson<AdminRecord[]>(ADMINS_FILE, []);
  const idx = admins.findIndex((a) => a.id === params.targetAdminId);
  if (idx === -1) return { success: false, error: 'Administrator account not found.' };

  if (!params.isActive) {
    const activeCount = admins.filter((a) => a.isActive).length;
    if (activeCount <= 1 && admins[idx].isActive) {
      return { success: false, error: 'Cannot deactivate the last remaining active administrator.' };
    }
  }

  admins[idx].isActive = params.isActive;
  writeJson(ADMINS_FILE, admins);

  appendAdminAudit({
    adminId: params.byAdmin.id,
    adminEmail: params.byAdmin.email,
    action: 'admin_role_updated',
    targetId: admins[idx].id,
    details: `${params.isActive ? 'Activated' : 'Revoked'} administrator access for ${admins[idx].email}.`,
  });

  return { success: true, admin: sanitizeAdmin(admins[idx]) };
}

// --- MEMBER REGISTRATION, PHONE, PROMO & REFERRAL HELPERS ---
export function normalizePhoneCanonical(rawPhone?: string): string {
  const digits = (rawPhone || '').replace(/[^\d]/g, '');
  if (digits.length < 7) return '';
  if (digits.startsWith('03') && digits.length === 11) {
    return `92${digits.slice(1)}`;
  }
  return digits;
}

function phonesMatchForAbuse(a?: string, b?: string): boolean {
  const na = normalizePhoneCanonical(a);
  const nb = normalizePhoneCanonical(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 10 && nb.length >= 10) {
    return na.slice(-10) === nb.slice(-10);
  }
  return false;
}

export function normalizePromoCodeInput(raw?: string): string {
  return (raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 32);
}

function generateUniqueReferralCode(seedName: string, takenCodes: Set<string>): string {
  const letters = (seedName || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3);
  const prefix = letters.length >= 2 ? `F${letters}` : 'FEV';
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 30; attempt++) {
    let suffix = '';
    const bytes = crypto.randomBytes(5);
    for (let i = 0; i < 5; i++) {
      suffix += alphabet[bytes[i] % alphabet.length];
    }
    const candidate = `${prefix}${suffix}`.slice(0, 10);
    if (!takenCodes.has(candidate)) {
      takenCodes.add(candidate);
      return candidate;
    }
  }
  const fallback = `FEV${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  takenCodes.add(fallback);
  return fallback;
}

function readMembersEnsured(): MemberRecord[] {
  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  const promos = readJson<PromoCode[]>(PROMO_CODES_FILE, []);
  const takenCodes = new Set<string>();
  for (const p of promos) {
    if (p.code) takenCodes.add(p.code.toUpperCase());
  }
  for (const m of members) {
    if (m.referralCode) takenCodes.add(m.referralCode.toUpperCase());
  }

  let changed = false;
  for (const m of members) {
    if (!m.referralCode || m.referralCode.trim().length < 4) {
      m.referralCode = generateUniqueReferralCode(m.fullName, takenCodes);
      changed = true;
    } else {
      m.referralCode = normalizePromoCodeInput(m.referralCode);
    }
    if (typeof m.creditBalancePkr !== 'number' || m.creditBalancePkr < 0) {
      m.creditBalancePkr = 0;
      changed = true;
    }
    if (typeof m.creditBalanceUsd !== 'number' || m.creditBalanceUsd < 0) {
      m.creditBalanceUsd = 0;
      changed = true;
    }
    const normPhone = normalizePhoneCanonical(m.phone);
    if (normPhone && m.phoneNormalized !== normPhone) {
      m.phoneNormalized = normPhone;
      changed = true;
    }
  }

  if (changed) {
    writeJson(MEMBERS_FILE, members);
  }
  return members;
}

function appendCreditLedgerEntry(
  entry: Omit<ReferralCreditEntry, 'id' | 'createdAt'>
): ReferralCreditEntry {
  const ledger = readJson<ReferralCreditEntry[]>(CREDIT_LEDGER_FILE, []);
  const item: ReferralCreditEntry = {
    ...entry,
    id: `cred-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    createdAt: new Date().toISOString(),
  };
  ledger.unshift(item);
  if (ledger.length > 5000) ledger.length = 5000;
  writeJson(CREDIT_LEDGER_FILE, ledger);
  mirrorCreditEntryServer(item);
  return item;
}

function maskEmailForReferralPrivacy(email: string): string {
  const parts = (email || '').split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${'*'.repeat(Math.max(2, Math.min(5, name.length - visible.length)))}@${domain}`;
}

export function attributeReferralForMember(params: {
  memberId: string;
  referralCode?: string;
}): { attributed: boolean; referral?: ReferralRecord; blockedReason?: string } {
  const cleanCode = normalizePromoCodeInput(params.referralCode);
  if (!cleanCode) return { attributed: false };

  const cfg = getMembershipConfig();
  if (!cfg.referralConfig.enabled) {
    return { attributed: false, blockedReason: 'Referral program is currently paused.' };
  }

  const members = readMembersEnsured();
  const referredIdx = members.findIndex((m) => m.id === params.memberId);
  if (referredIdx === -1) return { attributed: false };
  const referred = members[referredIdx];

  // Already attributed once — never allow switching referrer to prevent abuse
  const referrals = readJson<ReferralRecord[]>(REFERRALS_FILE, []);
  if (referred.referredByMemberId || referrals.some((r) => r.referredMemberId === referred.id)) {
    return { attributed: false };
  }

  const referrer = members.find(
    (m) => (m.referralCode || '').toUpperCase() === cleanCode
  );
  if (!referrer) {
    return { attributed: false, blockedReason: 'Referral code was not recognized.' };
  }

  const nowIso = new Date().toISOString();
  const referredPhoneNorm = normalizePhoneCanonical(referred.phone);

  // Anti-abuse & self-referral detection
  let blockReason = '';
  if (referrer.id === referred.id) {
    blockReason = 'Self-referral blocked (same member account).';
  } else if (referrer.email.toLowerCase() === referred.email.toLowerCase()) {
    blockReason = 'Self-referral blocked (matching email address).';
  } else if (
    referrer.ownerUid &&
    referred.ownerUid &&
    referrer.ownerUid !== 'email_member' &&
    referrer.ownerUid !== 'admin_assigned' &&
    referrer.ownerUid === referred.ownerUid
  ) {
    blockReason = 'Self-referral blocked (matching Firebase user identity).';
  } else if (phonesMatchForAbuse(referrer.phone, referred.phone)) {
    blockReason = 'Self-referral blocked (matching phone number).';
  } else if (referrer.referredByMemberId === referred.id) {
    blockReason = 'Circular referral loop blocked.';
  } else if (
    referredPhoneNorm &&
    referrals.some(
      (r) =>
        r.referredMemberId !== referred.id &&
        r.status !== 'blocked' &&
        phonesMatchForAbuse(r.referredPhoneNormalized, referredPhoneNorm)
    )
  ) {
    blockReason = 'Duplicate phone number already used by another referred account.';
  } else if (
    referredPhoneNorm &&
    members.some(
      (other) =>
        other.id !== referred.id &&
        other.id !== referrer.id &&
        phonesMatchForAbuse(other.phone, referredPhoneNorm) &&
        readAllOrders().some((o) => o.memberId === other.id && o.status === 'approved')
    )
  ) {
    blockReason = 'Phone number is already linked to a prior paid customer account.';
  }

  const record: ReferralRecord = {
    id: `ref-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    referrerMemberId: referrer.id,
    referrerCode: referrer.referralCode || cleanCode,
    referrerEmail: referrer.email,
    referrerName: referrer.fullName,
    referredMemberId: referred.id,
    referredOwnerUid: referred.ownerUid,
    referredEmail: referred.email,
    referredName: referred.fullName,
    referredPhoneNormalized: referredPhoneNorm || undefined,
    status: blockReason ? 'blocked' : 'signed_up',
    blockReason: blockReason || undefined,
    rewardAmountPkr: 0,
    rewardAmountUsd: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  referrals.unshift(record);
  writeJson(REFERRALS_FILE, referrals);
  mirrorReferralServer(record);

  if (blockReason) {
    return { attributed: false, referral: record, blockedReason: blockReason };
  }

  members[referredIdx].referredByMemberId = referrer.id;
  members[referredIdx].referredByCode = referrer.referralCode || cleanCode;
  members[referredIdx].updatedAt = nowIso;
  writeJson(MEMBERS_FILE, members);
  mirrorMemberServer(sanitizeMember(members[referredIdx]));

  appendHistory({
    memberId: referred.id,
    event: 'referral_attributed',
    details: `Joined using referral code ${record.referrerCode}.`,
  });

  return { attributed: true, referral: record };
}

function revalidateReferralAfterPhoneUpdate(member: MemberRecord): void {
  if (!member.referredByMemberId) return;
  const members = readMembersEnsured();
  const referrer = members.find((m) => m.id === member.referredByMemberId);
  const referrals = readJson<ReferralRecord[]>(REFERRALS_FILE, []);
  const refIdx = referrals.findIndex(
    (r) => r.referredMemberId === member.id && r.status === 'signed_up'
  );
  if (refIdx === -1) return;

  const phoneNorm = normalizePhoneCanonical(member.phone);
  let blockReason = '';
  if (referrer && phonesMatchForAbuse(referrer.phone, phoneNorm)) {
    blockReason = 'Self-referral blocked (phone matches referrer account).';
  } else if (
    phoneNorm &&
    referrals.some(
      (r, idx) =>
        idx !== refIdx &&
        r.referredMemberId !== member.id &&
        r.status !== 'blocked' &&
        phonesMatchForAbuse(r.referredPhoneNormalized, phoneNorm)
    )
  ) {
    blockReason = 'Duplicate phone number already used in another referral.';
  } else if (
    phoneNorm &&
    members.some(
      (other) =>
        other.id !== member.id &&
        phonesMatchForAbuse(other.phone, phoneNorm) &&
        readAllOrders().some((o) => o.memberId === other.id && o.status === 'approved')
    )
  ) {
    blockReason = 'Phone number already exists on an active/previous paid customer account.';
  }

  const nowIso = new Date().toISOString();
  referrals[refIdx].referredPhoneNormalized = phoneNorm || undefined;
  referrals[refIdx].updatedAt = nowIso;

  if (blockReason) {
    referrals[refIdx].status = 'blocked';
    referrals[refIdx].blockReason = blockReason;
    writeJson(REFERRALS_FILE, referrals);
    mirrorReferralServer(referrals[refIdx]);

    const mIdx = members.findIndex((m) => m.id === member.id);
    if (mIdx !== -1) {
      members[mIdx].referredByMemberId = undefined;
      members[mIdx].referredByCode = undefined;
      members[mIdx].updatedAt = nowIso;
      writeJson(MEMBERS_FILE, members);
      mirrorMemberServer(sanitizeMember(members[mIdx]));
    }
  } else {
    writeJson(REFERRALS_FILE, referrals);
    mirrorReferralServer(referrals[refIdx]);
  }
}

export function normalizeAndValidatePhone(rawPhone: string): { valid: true; phone: string } | { valid: false; error: string } {
  const trimmed = (rawPhone || '').trim();
  const digits = trimmed.replace(/[^\d]/g, '');
  if (digits.length < 10 || digits.length > 15) {
    return {
      valid: false,
      error: 'Please enter a valid phone number (e.g. 0300 1234567 or +92 300 1234567).',
    };
  }
  return { valid: true, phone: trimmed };
}

export function getMemberById(memberId: string): SafeMember | null {
  const members = readMembersEnsured();
  const found = members.find((m) => m.id === memberId);
  return found ? sanitizeMember(found) : null;
}

export function reconcileAndRestoreMemberByEmail(
  rawEmail: string,
  cachedSnapshot?: {
    member?: Partial<MemberRecord> & { id?: string; email?: string };
    activeMemberships?: MembershipRecord[];
    allMemberships?: MembershipRecord[];
    orders?: MembershipOrder[];
    history?: MembershipHistoryEntry[];
  }
): SafeMember | null {
  const email = (rawEmail || '').trim().toLowerCase();
  if (!email) return null;

  if (cachedSnapshot && typeof cachedSnapshot === 'object') {
    const snapMembers: Partial<MemberRecord>[] = [];
    if (cachedSnapshot.member && cachedSnapshot.member.id && cachedSnapshot.member.email) {
      snapMembers.push(cachedSnapshot.member);
    }
    const snapMemberships = [
      ...(Array.isArray(cachedSnapshot.allMemberships) ? cachedSnapshot.allMemberships : []),
      ...(Array.isArray(cachedSnapshot.activeMemberships) ? cachedSnapshot.activeMemberships : []),
    ];
    const snapOrders = Array.isArray(cachedSnapshot.orders) ? cachedSnapshot.orders : [];
    if (snapMembers.length > 0 || snapMemberships.length > 0 || snapOrders.length > 0) {
      mergeCloudSyncSnapshot({
        members: snapMembers,
        memberships: snapMemberships,
        orders: snapOrders,
      });
    }
  }

  const members = readMembersEnsured();
  const matchingMembers = members.filter((m) => (m.email || '').trim().toLowerCase() === email);
  if (matchingMembers.length === 0) return null;

  const allSubs = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const allOrders = readAllOrders();

  // Pick the canonical member record: prefer the one that already has active/historical memberships or orders
  let primaryMember = matchingMembers[0];
  if (matchingMembers.length > 1) {
    const scored = matchingMembers.map((m) => {
      const subCount = allSubs.filter(
        (s) => s.memberId === m.id || (s.customerEmail || '').trim().toLowerCase() === email
      ).length;
      const activeCount = allSubs.filter(
        (s) =>
          (s.memberId === m.id || (s.customerEmail || '').trim().toLowerCase() === email) &&
          s.status === 'active'
      ).length;
      const orderCount = allOrders.filter(
        (o) => o.memberId === m.id || (o.customerEmail || '').trim().toLowerCase() === email
      ).length;
      return { member: m, score: activeCount * 100 + subCount * 10 + orderCount };
    });
    scored.sort((a, b) => b.score - a.score);
    primaryMember = scored[0].member;
  }

  const allMatchingIds = new Set(matchingMembers.map((m) => m.id));

  // Reconcile any memberships or orders matching this email or duplicate member IDs onto primaryMember.id
  let subsChanged = false;
  for (const sub of allSubs) {
    const subEmail = (sub.customerEmail || '').trim().toLowerCase();
    if (subEmail === email || allMatchingIds.has(sub.memberId)) {
      if (sub.memberId !== primaryMember.id || sub.customerEmail !== primaryMember.email) {
        sub.memberId = primaryMember.id;
        sub.customerEmail = primaryMember.email;
        subsChanged = true;
      }
    }
  }
  if (subsChanged) {
    writeJson(MEMBERSHIPS_FILE, allSubs);
  }

  let ordersChanged = false;
  for (const ord of allOrders) {
    const ordEmail = (ord.customerEmail || '').trim().toLowerCase();
    if (ordEmail === email || allMatchingIds.has(ord.memberId)) {
      if (ord.memberId !== primaryMember.id || ord.customerEmail !== primaryMember.email) {
        ord.memberId = primaryMember.id;
        ord.customerEmail = primaryMember.email;
        ordersChanged = true;
      }
    }
  }
  if (ordersChanged) {
    writeJson(ORDERS_FILE, allOrders);
  }

  return sanitizeMember(primaryMember);
}

export function restoreMemberSessionFromSnapshot(
  cachedSnapshot: any,
  authenticatedMemberId?: string | null
):
  | { success: true; member: SafeMember; token: string }
  | { success: false; error: string; statusCode?: number; code?: string; blockedReason?: string; blockedEmail?: string } {
  const rawEmail = String(cachedSnapshot?.member?.email || '').trim().toLowerCase();
  if (rawEmail) {
    const blocked = getBlockedUserByEmail(rawEmail);
    if (blocked) {
      return {
        success: false,
        statusCode: 403,
        code: 'ACCOUNT_BLOCKED',
        blockedEmail: blocked.email,
        blockedReason: blocked.reason,
        error: buildBlockedAccountMessage(blocked),
      };
    }
    const restored = reconcileAndRestoreMemberByEmail(rawEmail, cachedSnapshot);
    if (restored) {
      return {
        success: true,
        member: restored,
        token: createMemberSessionToken(restored),
      };
    }
  }
  if (authenticatedMemberId) {
    const blockedById = getBlockedUserByMemberId(authenticatedMemberId);
    if (blockedById) {
      return {
        success: false,
        statusCode: 403,
        code: 'ACCOUNT_BLOCKED',
        blockedEmail: blockedById.email,
        blockedReason: blockedById.reason,
        error: buildBlockedAccountMessage(blockedById),
      };
    }
    const existing = getMemberById(authenticatedMemberId);
    if (existing) {
      reconcileAndRestoreMemberByEmail(existing.email, cachedSnapshot);
      return {
        success: true,
        member: existing,
        token: createMemberSessionToken(existing),
      };
    }
  }
  return { success: false, error: 'Unable to restore member session.' };
}

export function registerMember(params: {
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
  referralCode?: string;
  cachedSnapshot?: any;
}):
  | { success: true; member: SafeMember; token: string }
  | { success: false; error: string; statusCode?: number; code?: string; blockedReason?: string; blockedEmail?: string } {
  const email = (params.email || '').trim().toLowerCase();
  const password = params.password || '';
  const confirmPassword = params.confirmPassword;
  const fullName = (params.fullName || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.', statusCode: 400 };
  }

  const blocked = getBlockedUserByEmail(email) || getBlockedUserByPhone(params.phone);
  if (blocked) {
    return {
      success: false,
      statusCode: 403,
      code: 'ACCOUNT_BLOCKED',
      blockedEmail: blocked.email,
      blockedReason: blocked.reason,
      error: buildBlockedAccountMessage(blocked),
    };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.', statusCode: 400 };
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { success: false, error: 'Password and Confirm Password do not match.', statusCode: 400 };
  }

  // First reconcile any existing account or cached snapshot for this email
  reconcileAndRestoreMemberByEmail(email, params.cachedSnapshot);

  const members = readMembersEnsured();
  const existingIdx = members.findIndex((m) => m.email.toLowerCase() === email);
  if (existingIdx !== -1) {
    // User already has an account (e.g., already subscribed) and used "Create Account" to log back in.
    // Log them directly into their existing subscribed account instead of creating a duplicate or failing.
    const existing = members[existingIdx];
    const now = new Date().toISOString();
    if (fullName && fullName.length >= 2 && (!existing.fullName || existing.fullName === 'FEVIQO Member')) {
      existing.fullName = fullName;
    }
    const phoneCheckExisting = normalizeAndValidatePhone(params.phone);
    if ('phone' in phoneCheckExisting && phoneCheckExisting.phone) {
      existing.phone = phoneCheckExisting.phone;
      existing.phoneNormalized = normalizePhoneCanonical(phoneCheckExisting.phone) || undefined;
    }
    existing.passwordHash = hashMemberPassword(password);
    existing.updatedAt = now;
    members[existingIdx] = existing;
    writeJson(MEMBERS_FILE, members);
    reconcileAndRestoreMemberByEmail(email);
    const freshExisting = getMemberById(existing.id) || sanitizeMember(existing);
    mirrorMemberServer(freshExisting);
    return {
      success: true,
      member: freshExisting,
      token: createMemberSessionToken(freshExisting),
    };
  }

  if (!fullName || fullName.length < 2) {
    return { success: false, error: 'Full Name is required.', statusCode: 400 };
  }

  const phoneCheck = normalizeAndValidatePhone(params.phone);
  if (!('phone' in phoneCheck)) {
    return { success: false, error: phoneCheck.error, statusCode: 400 };
  }

  const takenCodes = new Set<string>(
    members.map((m) => (m.referralCode || '').toUpperCase()).filter(Boolean)
  );
  const now = new Date().toISOString();
  const newMember: MemberRecord = {
    id: `mem-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    ownerUid: 'email_member',
    authMethod: 'email',
    email,
    fullName,
    phone: phoneCheck.phone,
    phoneNormalized: normalizePhoneCanonical(phoneCheck.phone) || undefined,
    passwordHash: hashMemberPassword(password),
    referralCode: generateUniqueReferralCode(fullName, takenCodes),
    creditBalancePkr: 0,
    creditBalanceUsd: 0,
    createdAt: now,
    updatedAt: now,
  };

  members.unshift(newMember);
  writeJson(MEMBERS_FILE, members);

  appendHistory({
    memberId: newMember.id,
    event: 'account_created',
    details: `Personal FEVIQO account created for ${email}.`,
  });

  if (params.referralCode) {
    attributeReferralForMember({ memberId: newMember.id, referralCode: params.referralCode });
  }

  reconcileAndRestoreMemberByEmail(email);
  const freshMember = getMemberById(newMember.id) || sanitizeMember(newMember);
  mirrorMemberServer(freshMember);
  return { success: true, member: freshMember, token: createMemberSessionToken(freshMember) };
}

export function loginMember(params: {
  email: string;
  password: string;
  cachedSnapshot?: any;
}):
  | { success: true; member: SafeMember; token: string }
  | { success: false; error: string; statusCode?: number; code?: string; blockedReason?: string; blockedEmail?: string } {
  const email = (params.email || '').trim().toLowerCase();
  const password = params.password || '';

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.', statusCode: 400 };
  }

  const blocked = getBlockedUserByEmail(email);
  if (blocked) {
    return {
      success: false,
      statusCode: 403,
      code: 'ACCOUNT_BLOCKED',
      blockedEmail: blocked.email,
      blockedReason: blocked.reason,
      error: buildBlockedAccountMessage(blocked),
    };
  }

  reconcileAndRestoreMemberByEmail(email, params.cachedSnapshot);

  const members = readMembersEnsured();
  const foundIdx = members.findIndex((m) => m.email.toLowerCase() === email);
  if (foundIdx === -1) {
    return { success: false, error: 'Invalid email or password.', statusCode: 401 };
  }

  const found = members[foundIdx];
  const blockedPhone = getBlockedUserByPhone(found.phone);
  if (blockedPhone) {
    return {
      success: false,
      statusCode: 403,
      code: 'ACCOUNT_BLOCKED',
      blockedEmail: blockedPhone.email,
      blockedReason: blockedPhone.reason,
      error: buildBlockedAccountMessage(blockedPhone),
    };
  }
  const passwordValid = verifyMemberPassword(password, found.passwordHash);
  const canAdoptPassword =
    !passwordValid &&
    password.length >= 6 &&
    (found.authMethod === 'google' ||
      found.authMethod === 'admin_assigned' ||
      Boolean(
        params.cachedSnapshot?.member?.email &&
          String(params.cachedSnapshot.member.email).trim().toLowerCase() === email
      ));

  if (!passwordValid && !canAdoptPassword) {
    return { success: false, error: 'Invalid email or password.', statusCode: 401 };
  }

  if (canAdoptPassword) {
    found.passwordHash = hashMemberPassword(password);
    found.updatedAt = new Date().toISOString();
    members[foundIdx] = found;
    writeJson(MEMBERS_FILE, members);
  }

  reconcileAndRestoreMemberByEmail(email);
  const safe = getMemberById(found.id) || sanitizeMember(found);
  return { success: true, member: safe, token: createMemberSessionToken(safe) };
}

export function upsertGoogleMember(params: {
  uid: string;
  email: string;
  fullName?: string;
  phone?: string;
  referralCode?: string;
  cachedSnapshot?: any;
}):
  | { success: true; member: SafeMember; token: string }
  | { success: false; error: string; statusCode?: number; code?: string; blockedReason?: string; blockedEmail?: string } {
  const email = (params.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Verified Google email is required.', statusCode: 400 };
  }

  const blocked = getBlockedUserByEmail(email) || getBlockedUserByPhone(params.phone);
  if (blocked) {
    return {
      success: false,
      statusCode: 403,
      code: 'ACCOUNT_BLOCKED',
      blockedEmail: blocked.email,
      blockedReason: blocked.reason,
      error: buildBlockedAccountMessage(blocked),
    };
  }

  reconcileAndRestoreMemberByEmail(email, params.cachedSnapshot);

  const members = readMembersEnsured();
  const now = new Date().toISOString();
  const existingIdx = members.findIndex((m) => m.email.toLowerCase() === email);

  if (existingIdx !== -1) {
    const existing = members[existingIdx];
    const blockedExistingPhone = getBlockedUserByPhone(existing.phone);
    if (blockedExistingPhone) {
      return {
        success: false,
        statusCode: 403,
        code: 'ACCOUNT_BLOCKED',
        blockedEmail: blockedExistingPhone.email,
        blockedReason: blockedExistingPhone.reason,
        error: buildBlockedAccountMessage(blockedExistingPhone),
      };
    }
    let updated = false;
    if (
      params.uid &&
      (!existing.ownerUid ||
        existing.ownerUid === 'email_member' ||
        existing.ownerUid === 'admin_assigned')
    ) {
      existing.ownerUid = params.uid;
      existing.authMethod = 'google';
      updated = true;
    } else if (existing.authMethod !== 'google') {
      existing.authMethod = 'google';
      updated = true;
    }
    if ((!existing.fullName || existing.fullName === 'FEVIQO Member') && params.fullName?.trim()) {
      existing.fullName = params.fullName.trim();
      updated = true;
    }
    if (!existing.phone && params.phone?.trim()) {
      existing.phone = params.phone.trim();
      existing.phoneNormalized = normalizePhoneCanonical(existing.phone) || undefined;
      updated = true;
    }
    if (updated) {
      existing.updatedAt = now;
      members[existingIdx] = existing;
      writeJson(MEMBERS_FILE, members);
    }
    // Attribute referral if brand new (created < 10 min ago, 0 orders, no referrer yet)
    if (
      params.referralCode &&
      !existing.referredByMemberId &&
      Date.now() - Date.parse(existing.createdAt) < 10 * 60 * 1000 &&
      !readAllOrders().some((o) => o.memberId === existing.id)
    ) {
      attributeReferralForMember({ memberId: existing.id, referralCode: params.referralCode });
    }
    reconcileAndRestoreMemberByEmail(email);
    const fresh = getMemberById(existing.id) || sanitizeMember(existing);
    if (updated) mirrorMemberServer(fresh);
    return { success: true, member: fresh, token: createMemberSessionToken(fresh) };
  }

  const takenCodes = new Set<string>(
    members.map((m) => (m.referralCode || '').toUpperCase()).filter(Boolean)
  );
  const resolvedName = (params.fullName || email.split('@')[0] || 'FEVIQO Member')
    .trim()
    .slice(0, 120);
  const cleanPhone = (params.phone || '').trim().slice(0, 32);

  const newMember: MemberRecord = {
    id: `mem-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    ownerUid: params.uid,
    authMethod: 'google',
    email,
    fullName: resolvedName,
    phone: cleanPhone,
    phoneNormalized: normalizePhoneCanonical(cleanPhone) || undefined,
    passwordHash: hashMemberPassword(crypto.randomBytes(24).toString('hex')),
    referralCode: generateUniqueReferralCode(resolvedName, takenCodes),
    creditBalancePkr: 0,
    creditBalanceUsd: 0,
    createdAt: now,
    updatedAt: now,
  };

  members.unshift(newMember);
  writeJson(MEMBERS_FILE, members);

  appendHistory({
    memberId: newMember.id,
    event: 'account_created',
    details: `Personal FEVIQO account connected via Google for ${email}.`,
  });

  if (params.referralCode) {
    attributeReferralForMember({ memberId: newMember.id, referralCode: params.referralCode });
  }

  reconcileAndRestoreMemberByEmail(email);
  const fresh = getMemberById(newMember.id) || sanitizeMember(newMember);
  mirrorMemberServer(fresh);
  return { success: true, member: fresh, token: createMemberSessionToken(fresh) };
}

export function isMemberPhoneValid(phone?: string): boolean {
  const digits = (phone || '').replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function updateMemberPhone(params: {
  memberId: string;
  phone: string;
  referralCode?: string;
}): { success: true; member: SafeMember } | { success: false; error: string; statusCode?: number; code?: string; blockedReason?: string; blockedEmail?: string } {
  const phoneCheck = normalizeAndValidatePhone(params.phone);
  if (!('phone' in phoneCheck)) {
    return { success: false, error: phoneCheck.error, statusCode: 400 };
  }

  const blocked = getBlockedUserByPhone(phoneCheck.phone) || getBlockedUserByMemberId(params.memberId);
  if (blocked) {
    return {
      success: false,
      statusCode: 403,
      code: 'ACCOUNT_BLOCKED',
      blockedEmail: blocked.email,
      blockedReason: blocked.reason,
      error: buildBlockedAccountMessage(blocked),
    };
  }

  const members = readMembersEnsured();
  const idx = members.findIndex((m) => m.id === params.memberId);
  if (idx === -1) {
    return { success: false, error: 'Member account not found.', statusCode: 404 };
  }

  const now = new Date().toISOString();
  members[idx].phone = phoneCheck.phone.slice(0, 32);
  members[idx].phoneNormalized = normalizePhoneCanonical(members[idx].phone) || undefined;
  members[idx].updatedAt = now;
  writeJson(MEMBERS_FILE, members);

  if (
    params.referralCode &&
    !members[idx].referredByMemberId &&
    !readAllOrders().some((o) => o.memberId === members[idx].id)
  ) {
    attributeReferralForMember({ memberId: members[idx].id, referralCode: params.referralCode });
  } else {
    revalidateReferralAfterPhoneUpdate(members[idx]);
  }

  const safe = getMemberById(members[idx].id) || sanitizeMember(members[idx]);
  mirrorMemberServer(safe);

  // Backfill customerPhone on any existing awaiting_payment / pending_verification orders so admin queue sees it immediately
  const orders = readAllOrders();
  let ordersChanged = false;
  for (let i = 0; i < orders.length; i++) {
    const ord = orders[i];
    if (
      ord.memberId === safe.id &&
      !isMemberPhoneValid(ord.customerPhone) &&
      (ord.status === 'awaiting_payment' || ord.status === 'pending_verification')
    ) {
      ord.customerPhone = safe.phone;
      ord.updatedAt = now;
      orders[i] = ord;
      ordersChanged = true;
      mirrorOrderServer(ord);
    }
  }
  if (ordersChanged) {
    writeJson(ORDERS_FILE, orders);
  }

  return { success: true, member: safe };
}

// --- ORDERS & MEMBERSHIPS LIFECYCLE ---
function normalizeOrderStatus(raw: string): OrderStatus {
  if (raw === 'pending_payment') return 'awaiting_payment';
  if (raw === 'paid') return 'approved';
  if (raw === 'failed' || raw === 'cancelled') return 'expired';
  if (
    raw === 'awaiting_payment' ||
    raw === 'pending_verification' ||
    raw === 'approved' ||
    raw === 'rejected' ||
    raw === 'expired'
  ) {
    return raw;
  }
  return 'awaiting_payment';
}

function readAllOrders(): MembershipOrder[] {
  const raw = readJson<any[]>(ORDERS_FILE, []);
  return raw.map((o) => {
    const region: PaymentRegion =
      o.paymentRegion === 'international' ? 'international' : 'pakistan';
    return {
      ...o,
      orderType: o.orderType === 'renewal' ? 'renewal' : 'new',
      paymentRegion: region,
      paymentMethod:
        o.paymentMethod ||
        (region === 'international' ? 'binance_qr' : o.provider === 'admin_assigned' ? 'admin_assigned' : 'bank_qr'),
      currency: o.currency || (region === 'international' ? 'USD' : 'PKR'),
      status: normalizeOrderStatus(o.status),
      qrImageUrl:
        o.qrImageUrl !== undefined
          ? o.qrImageUrl
          : o.planId
            ? getQrUrlForPlan(o.planId, region)
            : undefined,
    };
  });
}

function getMembershipDramaIds(sub: MembershipRecord): string[] {
  const selected = Array.isArray(sub.selectedDramaIds) ? sub.selectedDramaIds.filter(Boolean) : [];
  if (sub.planId === 'vip') {
    if (selected.length > 0) return selected.slice(0, 3);
    return MEMBERSHIP_DRAMAS.slice(0, 3).map((d) => d.id);
  }
  return selected;
}

export function syncMemberSubscriptions(memberId?: string): MembershipRecord[] {
  const all = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const now = Date.now();
  let changed = false;

  for (const sub of all) {
    if (memberId && sub.memberId !== memberId) continue;
    if (sub.status === 'active') {
      const expMs = Date.parse(sub.expiresAt);
      if (Number.isNaN(expMs) || now >= expMs) {
        sub.status = 'expired';
        changed = true;
        mirrorMembershipServer(sub);
        appendHistory({
          memberId: sub.memberId,
          membershipId: sub.id,
          orderId: sub.orderId,
          event: 'membership_expired',
          planId: sub.planId,
          planName: sub.planName,
          selectedDramaIds: sub.selectedDramaIds,
          details: `${sub.planName} membership expired at ${sub.expiresAt}.`,
        });

        const dramaNames = getMembershipDramaIds(sub)
          .map((id) => getDramaById(id)?.title || id)
          .join(', ');

        createCustomerNotificationRecord({
          memberId: sub.memberId,
          ownerUid: sub.ownerUid,
          customerEmail: sub.customerEmail,
          membershipId: sub.id,
          planId: sub.planId,
          dramaIds: sub.selectedDramaIds,
          type: 'membership_expired',
          title: `Your ${sub.planName} membership has expired`,
          titleUr: `آپ کی ${sub.planName} ممبرشپ کی مدت ختم ہو گئی ہے`,
          message: `Premium access for ${dramaNames || sub.planName} ended on ${new Date(sub.expiresAt).toUTCString()}. Renew anytime from My Account without losing your account history.`,
          messageUr: `${dramaNames || sub.planName} کی پریمیم رسائی ختم ہو چکی ہے۔ آپ اپنے اکاؤنٹ سے دوبارہ رینیو کر سکتے ہیں۔`,
          ctaLabel: 'Renew Membership',
          ctaHref: `/membership?renew=${encodeURIComponent(sub.id)}`,
          dedupeKey: `${sub.id}:${sub.expiresAt}:membership_expired`,
          emailStatus: 'not_sent',
        });
      }
    }
  }

  if (changed) {
    writeJson(MEMBERSHIPS_FILE, all);
  }

  return all
    .filter((s) => !memberId || s.memberId === memberId)
    .sort((a, b) => Date.parse(b.activatedAt) - Date.parse(a.activatedAt));
}

function buildMemberReferralSummary(member: SafeMember) {
  const cfg = getMembershipConfig().referralConfig;
  const allReferrals = readJson<ReferralRecord[]>(REFERRALS_FILE, []).filter(
    (r) => r.referrerMemberId === member.id
  );
  const myAttribution = readJson<ReferralRecord[]>(REFERRALS_FILE, []).find(
    (r) => r.referredMemberId === member.id
  );
  const myOrders = readAllOrders().filter((o) => o.memberId === member.id);
  const hasPriorPaidOrPendingOrder = myOrders.some(
    (o) => o.status === 'approved' || o.status === 'pending_verification'
  );
  const refereeFirstOrderDiscountAvailable = Boolean(
    cfg.enabled &&
      cfg.refereeDiscountType !== 'none' &&
      member.referredByMemberId &&
      myAttribution &&
      myAttribution.status === 'signed_up' &&
      !hasPriorPaidOrPendingOrder
  );

  const ledger = readJson<ReferralCreditEntry[]>(CREDIT_LEDGER_FILE, [])
    .filter((entry) => entry.memberId === member.id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 60);

  const completedPurchases = allReferrals.filter((r) => r.status === 'converted').length;
  const pendingReferrals = allReferrals.filter((r) => r.status === 'signed_up').length;
  const blockedReferrals = allReferrals.filter((r) => r.status === 'blocked').length;

  const totalEarnedPkr = allReferrals.reduce((sum, r) => sum + (Number(r.rewardAmountPkr) || 0), 0);
  const totalEarnedUsd = Number(
    allReferrals.reduce((sum, r) => sum + (Number(r.rewardAmountUsd) || 0), 0).toFixed(2)
  );

  const baseAppUrl = (process.env.APP_URL || 'https://feviqo.com').replace(/\/$/, '');
  const referralCode = member.referralCode || '';
  const referralLink = referralCode
    ? `${baseAppUrl}/membership/${encodeURIComponent(referralCode)}`
    : `${baseAppUrl}/membership`;

  // Also include active personal reward promo codes issued to this member
  const personalRewardPromos = readJson<PromoCode[]>(PROMO_CODES_FILE, [])
    .filter((p) => p.rewardForReferrerMemberId === member.id && p.isActive)
    .map((p) => ({
      code: p.code,
      discountType: p.discountType,
      discountPercent: p.discountPercent,
      discountAmountPkr: p.discountAmountPkr,
      discountAmountUsd: p.discountAmountUsd,
      expiresAt: p.expiresAt,
    }));

  return {
    referralCode,
    referralLink,
    referredByCode: member.referredByCode,
    creditBalancePkr: member.creditBalancePkr || 0,
    creditBalanceUsd: member.creditBalanceUsd || 0,
    totalReferrals: allReferrals.filter((r) => r.status !== 'blocked').length,
    completedPurchases,
    pendingReferrals,
    blockedReferrals,
    totalEarnedPkr,
    totalEarnedUsd,
    refereeFirstOrderDiscountAvailable,
    personalRewardPromos,
    referrals: allReferrals
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 50)
      .map((r) => ({
        id: r.id,
        referredName: r.referredName,
        maskedEmail: maskEmailForReferralPrivacy(r.referredEmail),
        status: r.status,
        rewardAmountPkr: r.rewardAmountPkr || 0,
        rewardAmountUsd: r.rewardAmountUsd || 0,
        rewardPromoCode: r.rewardPromoCode,
        createdAt: r.createdAt,
        convertedAt: r.convertedAt,
      })),
    creditLedger: ledger,
    referralConfig: cfg,
  };
}

export function getMemberAccountState(memberId: string) {
  let member = getMemberById(memberId);
  if (!member) return null;

  // Reconcile any memberships/orders matching member's email onto their canonical memberId
  const reconciled = reconcileAndRestoreMemberByEmail(member.email);
  if (reconciled) {
    member = reconciled;
  }

  const memberships = syncMemberSubscriptions(member.id);
  const activeMemberships = memberships
    .filter((m) => m.status === 'active' && Date.parse(m.expiresAt) > Date.now())
    .sort((a, b) => Date.parse(b.expiresAt) - Date.parse(a.expiresAt));

  const activeMembership = activeMemberships[0] || null;
  const latestMembership = memberships[0] || null;
  const orders = readAllOrders()
    .filter((o) => o.memberId === member.id || (o.customerEmail || '').toLowerCase() === member.email.toLowerCase())
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const history = readJson<MembershipHistoryEntry[]>(HISTORY_FILE, [])
    .filter((h) => h.memberId === member.id);

  const notifications = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, [])
    .filter((n) => n.memberId === member.id && !n.supersededAt)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 60);
  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  let remainingDays = 0;
  let remainingHours = 0;
  if (activeMembership) {
    const diffMs = Math.max(0, Date.parse(activeMembership.expiresAt) - Date.now());
    remainingDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    remainingHours = Math.ceil(diffMs / (60 * 60 * 1000));
  }

  const unlockedSet = new Set<string>();
  for (const m of activeMemberships) {
    for (const dId of getMembershipDramaIds(m)) {
      unlockedSet.add(dId);
    }
  }
  const unlockedDramaIds = Array.from(unlockedSet);
  const unlockedDramas = MEMBERSHIP_DRAMAS.filter((d) => unlockedDramaIds.includes(d.id));

  return {
    member,
    activeMembership,
    activeMemberships,
    allMemberships: memberships,
    latestMembership,
    remainingDays,
    remainingHours,
    unlockedDramaIds,
    unlockedDramas,
    orders,
    history,
    notifications,
    unreadNotificationCount,
    referralSummary: buildMemberReferralSummary(member),
    plans: getResolvedPlans(),
    publicConfig: getPublicMembershipConfig(),
    gatewayStatus: getPaymentGatewayStatus(),
  };
}

export function validatePlanAndDramas(params: {
  planId: string;
  selectedDramaIds: unknown;
}):
  | {
      valid: true;
      plan: MembershipPlan;
      normalizedDramaIds: string[];
    }
  | { valid: false; error: string } {
  const plan = getResolvedPlans().find((p) => p.id === params.planId) || getPlanById(params.planId);
  if (!plan) {
    return { valid: false, error: 'Selected membership plan is invalid.' };
  }

  if (plan.dramaLimit === 'all') {
    const vipIds = MEMBERSHIP_DRAMAS.slice(0, 3).map((d) => d.id);
    return { valid: true, plan, normalizedDramaIds: vipIds };
  }

  const rawIds = Array.isArray(params.selectedDramaIds) ? params.selectedDramaIds : [];
  const uniqueIds = Array.from(
    new Set(rawIds.filter((id): id is string => typeof id === 'string' && Boolean(getDramaById(id))))
  );

  if (uniqueIds.length === 0) {
    return {
      valid: false,
      error: `Please select ${plan.dramaLimit} drama${plan.dramaLimit > 1 ? 's' : ''} to continue with the ${plan.name} plan.`,
    };
  }

  if (uniqueIds.length > plan.dramaLimit) {
    return {
      valid: false,
      error: `The ${plan.name} plan allows ${plan.dramaLimit} drama${plan.dramaLimit > 1 ? 's' : ''}. Remove extra selection(s) or choose Plus / VIP.`,
    };
  }

  if (uniqueIds.length < plan.dramaLimit) {
    return {
      valid: false,
      error: `The ${plan.name} plan includes ${plan.dramaLimit} dramas. Please select ${plan.dramaLimit - uniqueIds.length} more drama.`,
    };
  }

  return { valid: true, plan, normalizedDramaIds: uniqueIds };
}

// --- PROMO CODES, CHECKOUT QUOTE & REFERRAL CONVERSION ---
function readAllPromoCodes(): PromoCode[] {
  return readJson<PromoCode[]>(PROMO_CODES_FILE, []).map((p) => ({
    ...p,
    code: normalizePromoCodeInput(p.code),
    applicablePlanIds: Array.isArray(p.applicablePlanIds) ? p.applicablePlanIds : [],
    usageLimit: p.usageLimit === null || p.usageLimit === undefined ? null : Number(p.usageLimit),
    perUserLimit: Math.max(1, Math.round(Number(p.perUserLimit) || 1)),
    isActive: p.isActive !== false,
  }));
}

export function listPromoCodesOverview(): AdminPromoCodeView[] {
  const promos = readAllPromoCodes();
  const orders = readAllOrders();
  return promos
    .map((promo) => {
      const matching = orders.filter(
        (o) =>
          o.status !== 'rejected' &&
          o.status !== 'expired' &&
          (o.promoCodeId === promo.id ||
            normalizePromoCodeInput(o.promoCode) === promo.code)
      );
      const approved = matching.filter((o) => o.status === 'approved');
      const totalDiscountGivenPkr = approved.reduce(
        (sum, o) => sum + (Number(o.promoDiscountPkr) || 0),
        0
      );
      const totalDiscountGivenUsd = Number(
        approved.reduce((sum, o) => sum + (Number(o.promoDiscountUsd) || 0), 0).toFixed(2)
      );
      return {
        ...promo,
        usedCount: matching.length,
        approvedUses: approved.length,
        totalDiscountGivenPkr,
        totalDiscountGivenUsd,
      };
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function createPromoCode(params: {
  code: string;
  description?: string;
  discountType: PromoDiscountType;
  discountPercent?: number;
  discountAmountPkr?: number;
  discountAmountUsd?: number;
  maxDiscountPkr?: number;
  maxDiscountUsd?: number;
  minPurchasePkr?: number;
  minPurchaseUsd?: number;
  applicablePlanIds?: MembershipPlanId[];
  usageLimit?: number | null;
  perUserLimit?: number;
  expiresAt?: string;
  isActive?: boolean;
  admin: SafeAdmin;
  rewardForReferrerMemberId?: string;
}): { success: true; promo: AdminPromoCodeView } | { success: false; error: string; statusCode: number } {
  const normalizedCode = normalizePromoCodeInput(params.code);
  if (!normalizedCode || normalizedCode.length < 3) {
    return {
      success: false,
      error: 'Promo code must be at least 3 alphanumeric characters (A-Z, 0-9, -, _).',
      statusCode: 400,
    };
  }

  const promos = readAllPromoCodes();
  if (promos.some((p) => p.code === normalizedCode)) {
    return {
      success: false,
      error: `Promo code "${normalizedCode}" already exists.`,
      statusCode: 409,
    };
  }

  const members = readMembersEnsured();
  if (members.some((m) => (m.referralCode || '').toUpperCase() === normalizedCode)) {
    return {
      success: false,
      error: `Code "${normalizedCode}" conflicts with a member referral code. Choose another promo code.`,
      statusCode: 409,
    };
  }

  const discountType: PromoDiscountType = params.discountType === 'fixed' ? 'fixed' : 'percentage';
  const discountPercent = Math.min(100, Math.max(0, Math.round(Number(params.discountPercent) || 0)));
  const discountAmountPkr = Math.max(0, Math.round(Number(params.discountAmountPkr) || 0));
  const discountAmountUsd = Math.max(0, Number((Number(params.discountAmountUsd) || 0).toFixed(2)));

  if (discountType === 'percentage' && (discountPercent < 1 || discountPercent > 100)) {
    return { success: false, error: 'Percentage discount must be between 1% and 100%.', statusCode: 400 };
  }
  if (discountType === 'fixed' && discountAmountPkr <= 0 && discountAmountUsd <= 0) {
    return {
      success: false,
      error: 'Fixed promo code must specify a discount amount in PKR or USD.',
      statusCode: 400,
    };
  }

  const maxDiscountPkr =
    params.maxDiscountPkr !== undefined && Number(params.maxDiscountPkr) > 0
      ? Math.round(Number(params.maxDiscountPkr))
      : undefined;
  const maxDiscountUsd =
    params.maxDiscountUsd !== undefined && Number(params.maxDiscountUsd) > 0
      ? Number(Number(params.maxDiscountUsd).toFixed(2))
      : undefined;
  const minPurchasePkr = Math.max(0, Math.round(Number(params.minPurchasePkr) || 0));
  const minPurchaseUsd = Math.max(0, Number((Number(params.minPurchaseUsd) || 0).toFixed(2)));

  const validPlanSet = new Set<MembershipPlanId>(['starter', 'standard', 'plus', 'vip']);
  const applicablePlanIds = Array.isArray(params.applicablePlanIds)
    ? Array.from(new Set(params.applicablePlanIds.filter((id) => validPlanSet.has(id))))
    : [];

  const usageLimit =
    params.usageLimit === null || params.usageLimit === undefined || Number(params.usageLimit) <= 0
      ? null
      : Math.round(Number(params.usageLimit));
  const perUserLimit = Math.max(1, Math.min(100, Math.round(Number(params.perUserLimit) || 1)));

  let expiresAt: string | undefined;
  if (params.expiresAt && String(params.expiresAt).trim()) {
    const parsed = Date.parse(String(params.expiresAt).trim());
    if (Number.isNaN(parsed)) {
      return { success: false, error: 'Expiry date format is invalid.', statusCode: 400 };
    }
    expiresAt = new Date(parsed).toISOString();
  }

  const nowIso = new Date().toISOString();
  const promo: PromoCode = {
    id: `promo-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    code: normalizedCode,
    description: (params.description || '').trim().slice(0, 180),
    discountType,
    discountPercent: discountType === 'percentage' ? discountPercent : 0,
    discountAmountPkr: discountType === 'fixed' ? discountAmountPkr : 0,
    discountAmountUsd: discountType === 'fixed' ? discountAmountUsd : 0,
    maxDiscountPkr,
    maxDiscountUsd,
    minPurchasePkr,
    minPurchaseUsd,
    applicablePlanIds,
    usageLimit,
    perUserLimit,
    expiresAt,
    isActive: params.isActive !== false,
    createdAt: nowIso,
    updatedAt: nowIso,
    createdByAdminEmail: params.admin.email,
    rewardForReferrerMemberId: params.rewardForReferrerMemberId,
  };

  promos.unshift(promo);
  writeJson(PROMO_CODES_FILE, promos);
  mirrorPromoCodeServer(promo);

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'promo_created',
    targetId: promo.id,
    details: `Created promo code ${promo.code} (${promo.discountType === 'percentage' ? `${promo.discountPercent}%` : `PKR ${promo.discountAmountPkr} / $${promo.discountAmountUsd}`}).`,
  });

  return {
    success: true,
    promo: {
      ...promo,
      usedCount: 0,
      approvedUses: 0,
      totalDiscountGivenPkr: 0,
      totalDiscountGivenUsd: 0,
    },
  };
}

export function updatePromoCode(params: {
  promoId: string;
  updates: Partial<{
    code: string;
    description: string;
    discountType: PromoDiscountType;
    discountPercent: number;
    discountAmountPkr: number;
    discountAmountUsd: number;
    maxDiscountPkr: number | null;
    maxDiscountUsd: number | null;
    minPurchasePkr: number;
    minPurchaseUsd: number;
    applicablePlanIds: MembershipPlanId[];
    usageLimit: number | null;
    perUserLimit: number;
    expiresAt: string | null;
    isActive: boolean;
  }>;
  admin: SafeAdmin;
}): { success: true; promo: AdminPromoCodeView } | { success: false; error: string; statusCode: number } {
  const promos = readAllPromoCodes();
  const idx = promos.findIndex((p) => p.id === params.promoId);
  if (idx === -1) {
    return { success: false, error: 'Promo code not found.', statusCode: 404 };
  }

  const current = promos[idx];
  const u = params.updates || {};
  let nextCode = current.code;
  if (u.code !== undefined) {
    const normalized = normalizePromoCodeInput(u.code);
    if (!normalized || normalized.length < 3) {
      return { success: false, error: 'Promo code must be at least 3 characters.', statusCode: 400 };
    }
    if (promos.some((p, i) => i !== idx && p.code === normalized)) {
      return { success: false, error: `Promo code "${normalized}" already exists.`, statusCode: 409 };
    }
    nextCode = normalized;
  }

  const discountType: PromoDiscountType =
    u.discountType === 'fixed' || u.discountType === 'percentage' ? u.discountType : current.discountType;

  const discountPercent =
    u.discountPercent !== undefined
      ? Math.min(100, Math.max(0, Math.round(Number(u.discountPercent) || 0)))
      : current.discountPercent;
  const discountAmountPkr =
    u.discountAmountPkr !== undefined
      ? Math.max(0, Math.round(Number(u.discountAmountPkr) || 0))
      : current.discountAmountPkr;
  const discountAmountUsd =
    u.discountAmountUsd !== undefined
      ? Math.max(0, Number((Number(u.discountAmountUsd) || 0).toFixed(2)))
      : current.discountAmountUsd;

  if (discountType === 'percentage' && (discountPercent < 1 || discountPercent > 100)) {
    return { success: false, error: 'Percentage discount must be between 1% and 100%.', statusCode: 400 };
  }
  if (discountType === 'fixed' && discountAmountPkr <= 0 && discountAmountUsd <= 0) {
    return { success: false, error: 'Fixed promo code requires a PKR or USD discount amount.', statusCode: 400 };
  }

  let expiresAt = current.expiresAt;
  if (u.expiresAt !== undefined) {
    if (!u.expiresAt || !String(u.expiresAt).trim()) {
      expiresAt = undefined;
    } else {
      const parsed = Date.parse(String(u.expiresAt).trim());
      if (Number.isNaN(parsed)) {
        return { success: false, error: 'Expiry date format is invalid.', statusCode: 400 };
      }
      expiresAt = new Date(parsed).toISOString();
    }
  }

  const validPlanSet = new Set<MembershipPlanId>(['starter', 'standard', 'plus', 'vip']);
  const next: PromoCode = {
    ...current,
    code: nextCode,
    description: u.description !== undefined ? String(u.description).trim().slice(0, 180) : current.description,
    discountType,
    discountPercent: discountType === 'percentage' ? discountPercent : 0,
    discountAmountPkr: discountType === 'fixed' ? discountAmountPkr : 0,
    discountAmountUsd: discountType === 'fixed' ? discountAmountUsd : 0,
    maxDiscountPkr:
      u.maxDiscountPkr === null
        ? undefined
        : u.maxDiscountPkr !== undefined && Number(u.maxDiscountPkr) > 0
          ? Math.round(Number(u.maxDiscountPkr))
          : current.maxDiscountPkr,
    maxDiscountUsd:
      u.maxDiscountUsd === null
        ? undefined
        : u.maxDiscountUsd !== undefined && Number(u.maxDiscountUsd) > 0
          ? Number(Number(u.maxDiscountUsd).toFixed(2))
          : current.maxDiscountUsd,
    minPurchasePkr:
      u.minPurchasePkr !== undefined ? Math.max(0, Math.round(Number(u.minPurchasePkr) || 0)) : current.minPurchasePkr,
    minPurchaseUsd:
      u.minPurchaseUsd !== undefined
        ? Math.max(0, Number((Number(u.minPurchaseUsd) || 0).toFixed(2)))
        : current.minPurchaseUsd,
    applicablePlanIds:
      u.applicablePlanIds !== undefined
        ? Array.from(new Set(u.applicablePlanIds.filter((id) => validPlanSet.has(id))))
        : current.applicablePlanIds,
    usageLimit:
      u.usageLimit === null
        ? null
        : u.usageLimit !== undefined
          ? Number(u.usageLimit) > 0
            ? Math.round(Number(u.usageLimit))
            : null
          : current.usageLimit,
    perUserLimit:
      u.perUserLimit !== undefined
        ? Math.max(1, Math.min(100, Math.round(Number(u.perUserLimit) || 1)))
        : current.perUserLimit,
    expiresAt,
    isActive: u.isActive !== undefined ? Boolean(u.isActive) : current.isActive,
    updatedAt: new Date().toISOString(),
  };

  promos[idx] = next;
  writeJson(PROMO_CODES_FILE, promos);
  mirrorPromoCodeServer(next);

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'promo_updated',
    targetId: next.id,
    details: `Updated promo code ${next.code} (active=${next.isActive}).`,
  });

  const view = listPromoCodesOverview().find((p) => p.id === next.id)!;
  return { success: true, promo: view };
}

export function deletePromoCode(params: {
  promoId: string;
  admin: SafeAdmin;
}): { success: true; deletedPromoId: string } | { success: false; error: string; statusCode: number } {
  const promos = readAllPromoCodes();
  const idx = promos.findIndex((p) => p.id === params.promoId);
  if (idx === -1) {
    return { success: false, error: 'Promo code not found.', statusCode: 404 };
  }
  const removed = promos[idx];
  promos.splice(idx, 1);
  writeJson(PROMO_CODES_FILE, promos);
  if (isServerFirestoreEnabled()) {
    void deleteDocFromFirestoreServer('promoCodes', removed.id);
  }

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'promo_deleted',
    targetId: removed.id,
    details: `Deleted promo code ${removed.code}.`,
  });

  return { success: true, deletedPromoId: removed.id };
}

export function updateReferralStatusByAdmin(params: {
  referralId: string;
  status: 'blocked' | 'signed_up';
  blockReason?: string;
  admin: SafeAdmin;
}): { success: true; referral: ReferralRecord } | { success: false; error: string; statusCode: number } {
  const referrals = readJson<ReferralRecord[]>(REFERRALS_FILE, []);
  const idx = referrals.findIndex((r) => r.id === params.referralId);
  if (idx === -1) {
    return { success: false, error: 'Referral record not found.', statusCode: 404 };
  }

  const ref = referrals[idx];
  if (ref.status === 'converted') {
    return {
      success: false,
      error: 'Cannot alter status of an already converted referral reward.',
      statusCode: 409,
    };
  }

  const nowIso = new Date().toISOString();
  const members = readMembersEnsured();
  const referredMemberIdx = members.findIndex((m) => m.id === ref.referredMemberId);

  if (params.status === 'blocked') {
    ref.status = 'blocked';
    ref.blockReason = (params.blockReason || '').trim() || `Blocked manually by admin (${params.admin.email}).`;
    ref.updatedAt = nowIso;
    if (referredMemberIdx !== -1 && members[referredMemberIdx].referredByMemberId === ref.referrerMemberId) {
      members[referredMemberIdx].referredByMemberId = undefined;
      members[referredMemberIdx].referredByCode = undefined;
      members[referredMemberIdx].updatedAt = nowIso;
      writeJson(MEMBERS_FILE, members);
      mirrorMemberServer(sanitizeMember(members[referredMemberIdx]));
    }
  } else {
    ref.status = 'signed_up';
    ref.blockReason = undefined;
    ref.updatedAt = nowIso;
    if (referredMemberIdx !== -1 && !members[referredMemberIdx].referredByMemberId) {
      members[referredMemberIdx].referredByMemberId = ref.referrerMemberId;
      members[referredMemberIdx].referredByCode = ref.referrerCode;
      members[referredMemberIdx].updatedAt = nowIso;
      writeJson(MEMBERS_FILE, members);
      mirrorMemberServer(sanitizeMember(members[referredMemberIdx]));
    }
  }

  referrals[idx] = ref;
  writeJson(REFERRALS_FILE, referrals);
  mirrorReferralServer(ref);

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'referral_status_updated',
    targetId: ref.id,
    details: `Set referral ${ref.id} (${ref.referredEmail} <- ${ref.referrerCode}) to ${ref.status}.`,
  });

  return { success: true, referral: ref };
}

export function calculateCheckoutPricingQuote(params: {
  memberId?: string | null;
  planId: string;
  paymentRegion?: PaymentRegion;
  promoCode?: string;
  applyCredits?: boolean;
}): CheckoutPricingQuote {
  const plan =
    getResolvedPlans().find((p) => p.id === params.planId) ||
    getPlanById(params.planId) ||
    getResolvedPlans()[0];
  const paymentRegion: PaymentRegion =
    params.paymentRegion === 'international' ? 'international' : 'pakistan';
  const currency: PaymentCurrency = paymentRegion === 'international' ? 'USD' : 'PKR';

  const originalAmountPkr = plan.pricePkr;
  const originalAmountUsd = plan.priceUsd;
  const originalAmount = paymentRegion === 'international' ? originalAmountUsd : originalAmountPkr;

  const member = params.memberId ? getMemberById(params.memberId) : null;
  const orders = readAllOrders();
  const cfg = getMembershipConfig().referralConfig;

  let promoError: string | undefined;
  let promoApplied: CheckoutPricingQuote['promoApplied'] = null;
  let promoDiscountPkr = 0;
  let promoDiscountUsd = 0;

  const cleanPromo = normalizePromoCodeInput(params.promoCode);
  if (cleanPromo) {
    const promos = readAllPromoCodes();
    const promo = promos.find((p) => p.code === cleanPromo);
    const nowMs = Date.now();

    if (!promo) {
      promoError = 'Invalid promo code. Please double-check the code and try again.';
    } else if (!promo.isActive) {
      promoError = 'This promo code has been disabled.';
    } else if (promo.expiresAt && !Number.isNaN(Date.parse(promo.expiresAt)) && Date.parse(promo.expiresAt) <= nowMs) {
      promoError = 'This promo code has expired.';
    } else if (
      promo.rewardForReferrerMemberId &&
      (!member || member.id !== promo.rewardForReferrerMemberId)
    ) {
      promoError = 'This personal reward promo code belongs to a different member account.';
    } else if (promo.applicablePlanIds.length > 0 && !promo.applicablePlanIds.includes(plan.id)) {
      promoError = `Promo code ${promo.code} does not apply to the ${plan.name} plan.`;
    } else if (paymentRegion === 'pakistan' && originalAmountPkr < promo.minPurchasePkr) {
      promoError = `Minimum purchase of PKR ${promo.minPurchasePkr.toLocaleString()} required for ${promo.code}.`;
    } else if (paymentRegion === 'international' && originalAmountUsd < promo.minPurchaseUsd) {
      promoError = `Minimum purchase of $${promo.minPurchaseUsd.toFixed(2)} USD required for ${promo.code}.`;
    } else {
      const globalActiveUses = orders.filter(
        (o) =>
          o.status !== 'rejected' &&
          o.status !== 'expired' &&
          (o.promoCodeId === promo.id || normalizePromoCodeInput(o.promoCode) === promo.code)
      ).length;
      const memberUses = member
        ? orders.filter(
            (o) =>
              o.memberId === member.id &&
              o.status !== 'rejected' &&
              o.status !== 'expired' &&
              (o.promoCodeId === promo.id || normalizePromoCodeInput(o.promoCode) === promo.code)
          ).length
        : 0;

      if (promo.usageLimit !== null && globalActiveUses >= promo.usageLimit) {
        promoError = 'This promo code has reached its total redemption limit.';
      } else if (member && memberUses >= promo.perUserLimit) {
        promoError = 'You have already reached the usage limit for this promo code.';
      } else {
        if (promo.discountType === 'percentage') {
          promoDiscountPkr = Math.round(originalAmountPkr * (promo.discountPercent / 100));
          promoDiscountUsd = Number((originalAmountUsd * (promo.discountPercent / 100)).toFixed(2));
          if (promo.maxDiscountPkr && promo.maxDiscountPkr > 0) {
            promoDiscountPkr = Math.min(promoDiscountPkr, promo.maxDiscountPkr);
          }
          if (promo.maxDiscountUsd && promo.maxDiscountUsd > 0) {
            promoDiscountUsd = Math.min(promoDiscountUsd, promo.maxDiscountUsd);
          }
        } else {
          promoDiscountPkr = Math.round(promo.discountAmountPkr || 0);
          promoDiscountUsd = Number((promo.discountAmountUsd || 0).toFixed(2));
        }

        promoDiscountPkr = Math.max(0, Math.min(originalAmountPkr, promoDiscountPkr));
        promoDiscountUsd = Math.max(0, Math.min(originalAmountUsd, Number(promoDiscountUsd.toFixed(2))));

        promoApplied = {
          id: promo.id,
          code: promo.code,
          description: promo.description,
          discountType: promo.discountType,
          discountPercent: promo.discountPercent,
          discountAmountPkr: promo.discountAmountPkr,
          discountAmountUsd: promo.discountAmountUsd,
        };
      }
    }
  }

  // First-order referee referral discount (verified strictly server-side)
  let referralDiscountApplied = false;
  let referralCodeUsed: string | undefined;
  let referralDiscountPkr = 0;
  let referralDiscountUsd = 0;

  if (member && cfg.enabled && cfg.refereeDiscountType !== 'none' && member.referredByMemberId) {
    const referrals = readJson<ReferralRecord[]>(REFERRALS_FILE, []);
    const attribution = referrals.find(
      (r) => r.referredMemberId === member.id && r.status === 'signed_up'
    );
    const hasPriorQualifyingOrder = orders.some(
      (o) =>
        o.memberId === member.id &&
        (o.status === 'approved' || o.status === 'pending_verification')
    );

    if (attribution && !hasPriorQualifyingOrder) {
      const remPkr = Math.max(0, originalAmountPkr - promoDiscountPkr);
      const remUsd = Math.max(0, Number((originalAmountUsd - promoDiscountUsd).toFixed(2)));
      if (cfg.refereeDiscountType === 'percentage' && cfg.refereeDiscountPercent > 0) {
        referralDiscountPkr = Math.min(remPkr, Math.round(remPkr * (cfg.refereeDiscountPercent / 100)));
        referralDiscountUsd = Math.min(remUsd, Number((remUsd * (cfg.refereeDiscountPercent / 100)).toFixed(2)));
      } else if (cfg.refereeDiscountType === 'fixed') {
        referralDiscountPkr = Math.min(remPkr, Math.max(0, Math.round(cfg.refereeDiscountPkr)));
        referralDiscountUsd = Math.min(remUsd, Math.max(0, Number(cfg.refereeDiscountUsd.toFixed(2))));
      }
      if (referralDiscountPkr > 0 || referralDiscountUsd > 0) {
        referralDiscountApplied = true;
        referralCodeUsed = attribution.referrerCode;
      }
    }
  }

  const afterDiscountsPkr = Math.max(0, originalAmountPkr - promoDiscountPkr - referralDiscountPkr);
  const afterDiscountsUsd = Math.max(
    0,
    Number((originalAmountUsd - promoDiscountUsd - referralDiscountUsd).toFixed(2))
  );

  const availableCreditPkr = member?.creditBalancePkr || 0;
  const availableCreditUsd = member?.creditBalanceUsd || 0;
  const availableCredit = paymentRegion === 'international' ? availableCreditUsd : availableCreditPkr;

  let creditsUsedPkr = 0;
  let creditsUsedUsd = 0;
  if (params.applyCredits && member) {
    if (paymentRegion === 'pakistan' && availableCreditPkr > 0 && afterDiscountsPkr > 0) {
      creditsUsedPkr = Math.min(availableCreditPkr, afterDiscountsPkr);
    } else if (paymentRegion === 'international' && availableCreditUsd > 0 && afterDiscountsUsd > 0) {
      creditsUsedUsd = Number(Math.min(availableCreditUsd, afterDiscountsUsd).toFixed(2));
    }
  }

  const finalAmountPkr = Math.max(0, afterDiscountsPkr - creditsUsedPkr);
  const finalAmountUsd = Math.max(0, Number((afterDiscountsUsd - creditsUsedUsd).toFixed(2)));
  const finalAmount = paymentRegion === 'international' ? finalAmountUsd : finalAmountPkr;

  const promoDiscount = paymentRegion === 'international' ? promoDiscountUsd : promoDiscountPkr;
  const referralDiscount = paymentRegion === 'international' ? referralDiscountUsd : referralDiscountPkr;
  const creditsUsed = paymentRegion === 'international' ? creditsUsedUsd : creditsUsedPkr;

  const discountTotalPkr = Math.max(0, originalAmountPkr - finalAmountPkr);
  const discountTotalUsd = Math.max(0, Number((originalAmountUsd - finalAmountUsd).toFixed(2)));
  const discountTotal = paymentRegion === 'international' ? discountTotalUsd : discountTotalPkr;

  return {
    valid: !promoError,
    error: promoError,
    promoError,
    planId: plan.id,
    planName: plan.name,
    paymentRegion,
    currency,
    originalAmountPkr,
    originalAmountUsd,
    originalAmount,
    promoApplied,
    promoDiscountPkr,
    promoDiscountUsd,
    promoDiscount,
    referralDiscountApplied,
    referralCodeUsed,
    referralDiscountPkr,
    referralDiscountUsd,
    referralDiscount,
    availableCreditPkr,
    availableCreditUsd,
    availableCredit,
    creditsUsedPkr,
    creditsUsedUsd,
    creditsUsed,
    discountTotalPkr,
    discountTotalUsd,
    discountTotal,
    finalAmountPkr,
    finalAmountUsd,
    finalAmount,
  };
}

function refundOrderCreditsIfNeeded(order: MembershipOrder, reasonSuffix: string): void {
  const spentPkr = Number(order.creditsUsedPkr) || 0;
  const spentUsd = Number(order.creditsUsedUsd) || 0;
  if ((spentPkr <= 0 && spentUsd <= 0) || order.creditsRefundedAt || order.status === 'approved') {
    return;
  }

  const members = readMembersEnsured();
  const idx = members.findIndex((m) => m.id === order.memberId);
  if (idx === -1) return;

  const nowIso = new Date().toISOString();
  members[idx].creditBalancePkr = Math.max(0, Math.round((members[idx].creditBalancePkr || 0) + spentPkr));
  members[idx].creditBalanceUsd = Math.max(
    0,
    Number(((members[idx].creditBalanceUsd || 0) + spentUsd).toFixed(2))
  );
  members[idx].updatedAt = nowIso;
  writeJson(MEMBERS_FILE, members);
  mirrorMemberServer(sanitizeMember(members[idx]));

  order.creditsRefundedAt = nowIso;
  appendCreditLedgerEntry({
    memberId: order.memberId,
    type: 'checkout_refund',
    amountPkr: spentPkr,
    amountUsd: spentUsd,
    currency: order.currency === 'USD' ? 'USD' : 'PKR',
    orderId: order.id,
    details: `Refunded credits from ${reasonSuffix} order ${order.id}.`,
  });
  appendHistory({
    memberId: order.memberId,
    orderId: order.id,
    event: 'credits_refunded',
    amountPkr: spentPkr,
    amountUsd: spentUsd,
    currency: order.currency === 'USD' ? 'USD' : 'PKR',
    details: `Account credits refunded (${spentPkr > 0 ? `PKR ${spentPkr}` : `$${spentUsd.toFixed(2)}`}) after order ${order.id} was ${reasonSuffix}.`,
  });
}

function processReferralConversionReward(order: MembershipOrder, admin: SafeAdmin): void {
  const cfg = getMembershipConfig().referralConfig;
  if (!cfg.enabled) return;

  const referrals = readJson<ReferralRecord[]>(REFERRALS_FILE, []);
  const refIdx = referrals.findIndex(
    (r) => r.referredMemberId === order.memberId && r.status === 'signed_up'
  );
  if (refIdx === -1) return;

  const ref = referrals[refIdx];
  const members = readMembersEnsured();
  const referrerIdx = members.findIndex((m) => m.id === ref.referrerMemberId);
  if (referrerIdx === -1) return;
  const referredMember = members.find((m) => m.id === order.memberId);

  // Re-check abuse invariants at conversion time (self-referral, duplicate phone, max conversions)
  if (
    referredMember &&
    (phonesMatchForAbuse(members[referrerIdx].phone, referredMember.phone) ||
      members[referrerIdx].email.toLowerCase() === referredMember.email.toLowerCase() ||
      (members[referrerIdx].ownerUid &&
        referredMember.ownerUid &&
        members[referrerIdx].ownerUid !== 'email_member' &&
        members[referrerIdx].ownerUid !== 'admin_assigned' &&
        members[referrerIdx].ownerUid === referredMember.ownerUid))
  ) {
    ref.status = 'blocked';
    ref.blockReason = 'Blocked at approval due to self-referral match.';
    ref.updatedAt = new Date().toISOString();
    referrals[refIdx] = ref;
    writeJson(REFERRALS_FILE, referrals);
    mirrorReferralServer(ref);
    return;
  }

  const existingConvertedCount = referrals.filter(
    (r) => r.referrerMemberId === ref.referrerMemberId && r.status === 'converted'
  ).length;
  if (
    cfg.maxConversionsPerReferrer !== null &&
    existingConvertedCount >= cfg.maxConversionsPerReferrer
  ) {
    return;
  }

  // Verify minimum qualifying purchase amount
  const basePkr = Number(order.originalAmountPkr ?? order.amountPkr) || 0;
  const baseUsd = Number(order.originalAmountUsd ?? order.amountUsd) || 0;
  const qualifies =
    order.currency === 'USD'
      ? baseUsd >= cfg.minOrderUsdForReward
      : basePkr >= cfg.minOrderPkrForReward;
  if (!qualifies) return;

  const nowIso = new Date().toISOString();
  let issuedPkr = 0;
  let issuedUsd = 0;
  let rewardPromoCode: string | undefined;

  if (cfg.referrerRewardType === 'credit' || cfg.referrerRewardType === 'both') {
    issuedPkr = Math.max(0, Math.round(cfg.referrerRewardPkr));
    issuedUsd = Math.max(0, Number(cfg.referrerRewardUsd.toFixed(2)));
    members[referrerIdx].creditBalancePkr = (members[referrerIdx].creditBalancePkr || 0) + issuedPkr;
    members[referrerIdx].creditBalanceUsd = Number(
      ((members[referrerIdx].creditBalanceUsd || 0) + issuedUsd).toFixed(2)
    );
    members[referrerIdx].updatedAt = nowIso;
    writeJson(MEMBERS_FILE, members);
    mirrorMemberServer(sanitizeMember(members[referrerIdx]));

    if (issuedPkr > 0 || issuedUsd > 0) {
      appendCreditLedgerEntry({
        memberId: members[referrerIdx].id,
        type: 'referral_bonus',
        amountPkr: issuedPkr,
        amountUsd: issuedUsd,
        currency: order.currency === 'USD' ? 'USD' : 'PKR',
        referralId: ref.id,
        orderId: order.id,
        details: `Referral reward earned from ${ref.referredName}'s approved ${order.planName} purchase.`,
      });
    }
  }

  if (cfg.referrerRewardType === 'promo_code' || cfg.referrerRewardType === 'both') {
    const expiryIso = new Date(
      Date.now() + Math.max(1, cfg.referrerPromoExpiryDays) * 86400000
    ).toISOString();
    const rewardCode = `REW${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const created = createPromoCode({
      code: rewardCode,
      description: `Personal referral reward (${cfg.referrerPromoDiscountPercent}% off) for inviting ${ref.referredName}`,
      discountType: 'percentage',
      discountPercent: cfg.referrerPromoDiscountPercent,
      usageLimit: 1,
      perUserLimit: 1,
      expiresAt: expiryIso,
      isActive: true,
      admin,
      rewardForReferrerMemberId: members[referrerIdx].id,
    });
    if (created.success) {
      rewardPromoCode = created.promo.code;
    }
  }

  ref.status = 'converted';
  ref.conversionOrderId = order.id;
  ref.convertedAt = nowIso;
  ref.rewardMode = cfg.referrerRewardType;
  ref.rewardAmountPkr = issuedPkr;
  ref.rewardAmountUsd = issuedUsd;
  ref.rewardPromoCode = rewardPromoCode;
  ref.rewardIssuedAt = nowIso;
  ref.updatedAt = nowIso;
  referrals[refIdx] = ref;
  writeJson(REFERRALS_FILE, referrals);
  mirrorReferralServer(ref);

  appendHistory({
    memberId: members[referrerIdx].id,
    orderId: order.id,
    event: 'referral_reward_earned',
    amountPkr: issuedPkr,
    amountUsd: issuedUsd,
    currency: order.currency === 'USD' ? 'USD' : 'PKR',
    details: `Earned referral reward (${issuedPkr > 0 ? `PKR ${issuedPkr}` : ''}${issuedUsd > 0 ? ` / $${issuedUsd.toFixed(2)}` : ''}${rewardPromoCode ? ` + Promo ${rewardPromoCode}` : ''}) from referral ${ref.referredName}.`,
  });

  createCustomerNotificationRecord({
    memberId: members[referrerIdx].id,
    ownerUid: members[referrerIdx].ownerUid,
    customerEmail: members[referrerIdx].email,
    orderId: order.id,
    type: 'referral_reward',
    title: 'Referral reward unlocked!',
    titleUr: 'آپ کا ریفرل انعام شامل کر دیا گیا ہے!',
    message: `Your invited friend completed a ${order.planName} purchase.${issuedPkr > 0 || issuedUsd > 0 ? ` Account credit added: PKR ${issuedPkr} / $${issuedUsd.toFixed(2)}.` : ''}${rewardPromoCode ? ` Personal reward code: ${rewardPromoCode} (${cfg.referrerPromoDiscountPercent}% OFF).` : ''}`,
    messageUr: `آپ کے مدعو کردہ دوست کی خریداری مکمل ہو گئی ہے اور ریفرل انعام آپ کے اکاؤنٹ میں شامل کر دیا گیا ہے۔`,
    ctaLabel: 'Open Referral Wallet',
    ctaHref: '/account',
    dedupeKey: `ref_reward:${ref.id}:${order.id}`,
    emailStatus: 'not_sent',
  });
}

export function confirmZeroBalanceOrder(params: {
  memberId: string;
  orderId: string;
  paymentNote?: string;
}):
  | { success: true; order: MembershipOrder; member: SafeMember }
  | { success: false; error: string; statusCode: number } {
  const member = getMemberById(params.memberId);
  if (!member) {
    return { success: false, error: 'Member account not found.', statusCode: 401 };
  }

  const orders = readAllOrders();
  const idx = orders.findIndex((o) => o.id === params.orderId);
  if (idx === -1) {
    return { success: false, error: 'Payment request was not found.', statusCode: 404 };
  }

  const order = orders[idx];
  if (order.memberId !== params.memberId) {
    return { success: false, error: 'Forbidden: cannot confirm another member order.', statusCode: 403 };
  }
  if (order.status === 'approved') {
    return { success: false, error: 'Order is already approved.', statusCode: 409 };
  }
  const payable = Number(order.expectedAmount ?? (order.currency === 'USD' ? order.amountUsd : order.amountPkr));
  if (payable > 0) {
    return {
      success: false,
      error: 'Payment proof screenshot is required when net payable amount is greater than 0.',
      statusCode: 400,
    };
  }

  const nowIso = new Date().toISOString();
  order.proofSubmittedAt = nowIso;
  order.paymentNote =
    (params.paymentNote || '').trim().slice(0, 400) ||
    `100% covered via ${order.promoCode ? `promo ${order.promoCode}` : 'referral credits'}`;
  order.status = 'pending_verification';
  order.rejectionReason = undefined;
  order.updatedAt = nowIso;
  orders[idx] = order;
  writeJson(ORDERS_FILE, orders);
  mirrorOrderServer(order);

  appendHistory({
    memberId: member.id,
    membershipId: order.targetMembershipId,
    orderId: order.id,
    event: 'proof_submitted',
    planId: order.planId,
    planName: order.planName,
    amountPkr: order.amountPkr,
    amountUsd: order.amountUsd,
    currency: order.currency,
    selectedDramaIds: order.selectedDramaIds,
    details: `Zero-balance discounted order ${order.id} submitted for fast admin activation.`,
  });

  return { success: true, order, member };
}

export function getPaymentGatewayStatus(region: PaymentRegion = 'pakistan'): PaymentGatewayStatus {
  if (region === 'international') {
    return {
      configured: true,
      provider: 'binance_qr',
      missingCredentials: [],
      instructions: 'Scan the plan Binance QR code in the Binance App, pay the exact USD amount, and upload your screenshot for verification.',
    };
  }
  return {
    configured: true,
    provider: 'bank_qr',
    missingCredentials: [],
    instructions: 'Scan the plan Bank QR code and submit your payment screenshot for verification.',
  };
}

export async function createMembershipCheckoutOrder(params: {
  memberId: string;
  planId: string;
  selectedDramaIds: unknown;
  originUrl: string;
  paymentRegion?: PaymentRegion;
  orderType?: OrderType;
  targetMembershipId?: string;
  visitorCountryCode?: string;
  indicativeLocalDisplay?: string;
  promoCode?: string;
  applyCredits?: boolean;
}): Promise<
  | {
      success: true;
      order: MembershipOrder;
      quote: CheckoutPricingQuote;
      gatewayConfigured: true;
      paymentSetupRequired: false;
      qrImageUrl: string;
      publicConfig: PublicMembershipConfig;
      gatewayStatus: PaymentGatewayStatus;
    }
  | { success: false; error: string; code?: string; statusCode?: number }
> {
  const member = getMemberById(params.memberId);
  if (!member) {
    return { success: false, error: 'Member account not found.', statusCode: 404 };
  }
  if (!isMemberPhoneValid(member.phone)) {
    return {
      success: false,
      code: 'PHONE_REQUIRED',
      error: 'Please add your WhatsApp / phone number first so our verification team can contact you if needed.',
      statusCode: 400,
    };
  }

  const orderType: OrderType = params.orderType === 'renewal' ? 'renewal' : 'new';
  let targetMembership: MembershipRecord | undefined;
  if (orderType === 'renewal' && params.targetMembershipId) {
    const allSubs = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
    targetMembership = allSubs.find((m) => m.id === params.targetMembershipId);
    if (!targetMembership) {
      return { success: false, error: 'Target membership for renewal was not found.', statusCode: 404 };
    }
    if (targetMembership.memberId !== member.id) {
      return { success: false, error: 'You cannot renew a membership belonging to another account.', statusCode: 403 };
    }
  }

  const validation = validatePlanAndDramas({
    planId: params.planId,
    selectedDramaIds:
      params.selectedDramaIds && Array.isArray(params.selectedDramaIds) && params.selectedDramaIds.length > 0
        ? params.selectedDramaIds
        : targetMembership?.selectedDramaIds,
  });
  if (!('plan' in validation)) {
    return { success: false, error: validation.error, statusCode: 400 };
  }

  const { plan, normalizedDramaIds } = validation;

  // Enforce upgrade-only rules for members who already have an active subscription (unless renewing)
  if (orderType !== 'renewal') {
    const PLAN_RANK_MAP: Record<MembershipPlanId, number> = {
      starter: 1,
      standard: 2,
      plus: 3,
      vip: 4,
    };
    const memberSubs = syncMemberSubscriptions(member.id);
    const activeSubs = memberSubs.filter(
      (s) => s.status === 'active' && Date.parse(s.expiresAt) > Date.now()
    );
    const highestActiveRank = activeSubs.reduce(
      (max, s) => Math.max(max, PLAN_RANK_MAP[s.planId] || 0),
      0
    );
    const requestedRank = PLAN_RANK_MAP[plan.id] || 0;

    if (highestActiveRank >= 4) {
      return {
        success: false,
        code: 'VIP_ALREADY_ACTIVE',
        error:
          'You already have an active VIP All-Access membership with all dramas unlocked. No additional package purchase is required.',
        statusCode: 400,
      };
    }
    if (highestActiveRank > 0 && requestedRank <= highestActiveRank) {
      return {
        success: false,
        code: 'DOWNGRADE_NOT_ALLOWED',
        error:
          'You already have an active membership on this tier or higher. You can only upgrade to a higher package.',
        statusCode: 400,
      };
    }
  }

  const paymentRegion: PaymentRegion =
    params.paymentRegion === 'international' ? 'international' : 'pakistan';

  // Server-enforced pricing, promo, referral & credit calculation — NEVER trust client values
  const quote = calculateCheckoutPricingQuote({
    memberId: member.id,
    planId: plan.id,
    paymentRegion,
    promoCode: params.promoCode,
    applyCredits: Boolean(params.applyCredits),
  });
  if (!quote.valid) {
    return {
      success: false,
      error: quote.error || 'Entered promo code cannot be applied to this checkout.',
      code: 'INVALID_PROMO_CODE',
      statusCode: 400,
    };
  }

  const paymentMethod: PaymentMethod =
    paymentRegion === 'international' ? 'binance_qr' : 'bank_qr';
  const currency: PaymentCurrency =
    paymentRegion === 'international' ? 'USD' : 'PKR';
  const expectedAmount = quote.finalAmount;

  const qrImageUrl = getQrUrlForPlan(plan.id, paymentRegion);
  const now = new Date().toISOString();
  const orderId = `ord-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  // Deduct spent credits atomically before persisting order (refunded automatically if rejected/deleted)
  if (quote.creditsUsedPkr > 0 || quote.creditsUsedUsd > 0) {
    const members = readMembersEnsured();
    const mIdx = members.findIndex((m) => m.id === member.id);
    if (mIdx !== -1) {
      members[mIdx].creditBalancePkr = Math.max(
        0,
        Math.round((members[mIdx].creditBalancePkr || 0) - quote.creditsUsedPkr)
      );
      members[mIdx].creditBalanceUsd = Math.max(
        0,
        Number(((members[mIdx].creditBalanceUsd || 0) - quote.creditsUsedUsd).toFixed(2))
      );
      members[mIdx].updatedAt = now;
      writeJson(MEMBERS_FILE, members);
      mirrorMemberServer(sanitizeMember(members[mIdx]));
      appendCreditLedgerEntry({
        memberId: member.id,
        type: 'checkout_spent',
        amountPkr: -quote.creditsUsedPkr,
        amountUsd: -quote.creditsUsedUsd,
        currency,
        orderId,
        details: `Applied wallet credits toward ${plan.name} order ${orderId}.`,
      });
    }
  }

  const order: MembershipOrder = {
    id: orderId,
    memberId: member.id,
    ownerUid: member.ownerUid,
    customerName: member.fullName,
    customerEmail: member.email,
    customerPhone: member.phone,
    orderType,
    targetMembershipId: targetMembership?.id,
    planId: plan.id,
    planName: plan.name,
    originalAmountPkr: quote.originalAmountPkr,
    originalAmountUsd: quote.originalAmountUsd,
    amountPkr: quote.finalAmountPkr,
    amountUsd: quote.finalAmountUsd,
    promoCodeId: quote.promoApplied?.id,
    promoCode: quote.promoApplied?.code,
    promoDiscountPkr: quote.promoDiscountPkr,
    promoDiscountUsd: quote.promoDiscountUsd,
    referralCodeUsed: quote.referralCodeUsed,
    referralDiscountPkr: quote.referralDiscountPkr,
    referralDiscountUsd: quote.referralDiscountUsd,
    creditsUsedPkr: quote.creditsUsedPkr,
    creditsUsedUsd: quote.creditsUsedUsd,
    discountTotalPkr: quote.discountTotalPkr,
    discountTotalUsd: quote.discountTotalUsd,
    expectedAmount,
    currency,
    paymentRegion,
    paymentMethod,
    visitorCountryCode: params.visitorCountryCode?.trim().slice(0, 8).toUpperCase(),
    indicativeLocalDisplay: params.indicativeLocalDisplay?.trim().slice(0, 64),
    durationDays: plan.durationDays,
    selectedDramaIds: normalizedDramaIds,
    status: 'awaiting_payment',
    provider: paymentMethod,
    qrImageUrl,
    createdAt: now,
    updatedAt: now,
  };

  const orders = readAllOrders();
  orders.unshift(order);
  writeJson(ORDERS_FILE, orders);
  mirrorOrderServer(order);

  const amountLabel =
    currency === 'USD' ? `$${expectedAmount.toFixed(2)} USD` : `PKR ${expectedAmount.toLocaleString()}`;

  appendHistory({
    memberId: member.id,
    membershipId: targetMembership?.id,
    orderId: order.id,
    event: 'checkout_created',
    planId: plan.id,
    planName: plan.name,
    amountPkr: order.amountPkr,
    amountUsd: order.amountUsd,
    currency,
    selectedDramaIds: normalizedDramaIds,
    details: `${orderType === 'renewal' ? 'Renewal' : 'New'} payment request ${order.id} created for ${plan.name} (${amountLabel}${order.promoCode ? `, promo ${order.promoCode}` : ''}${order.creditsUsedPkr || order.creditsUsedUsd ? ', credits applied' : ''}).`,
  });

  return {
    success: true,
    order,
    quote,
    gatewayConfigured: true,
    paymentSetupRequired: false,
    qrImageUrl,
    publicConfig: getPublicMembershipConfig(),
    gatewayStatus: getPaymentGatewayStatus(paymentRegion),
  };
}

export function submitOrderPaymentProof(params: {
  memberId: string;
  orderId: string;
  fileBuffer: Buffer;
  originalName: string;
  paymentNote?: string;
  proofDataUrl?: string;
}):
  | { success: true; order: MembershipOrder; member: SafeMember }
  | { success: false; error: string; statusCode: number } {
  const member = getMemberById(params.memberId);
  if (!member) {
    return { success: false, error: 'Member account not found.', statusCode: 401 };
  }

  const orders = readAllOrders();
  const idx = orders.findIndex((o) => o.id === params.orderId);
  if (idx === -1) {
    return { success: false, error: 'Payment request was not found.', statusCode: 404 };
  }

  const order = orders[idx];
  if (order.memberId !== params.memberId) {
    return { success: false, error: 'You do not have permission to upload proof for this order.', statusCode: 403 };
  }
  if (order.status === 'approved') {
    return { success: false, error: 'This payment request has already been approved.', statusCode: 409 };
  }

  if (!params.fileBuffer || params.fileBuffer.length === 0) {
    return { success: false, error: 'Please choose a payment screenshot file to upload.', statusCode: 400 };
  }
  if (params.fileBuffer.length > 8 * 1024 * 1024) {
    return { success: false, error: 'Screenshot file size must be 8 MB or smaller.', statusCode: 400 };
  }

  const detected = detectImageType(params.fileBuffer);
  if (!detected) {
    return {
      success: false,
      error: 'Unsupported file format. Please upload a valid JPG, JPEG, PNG, or WebP screenshot.',
      statusCode: 400,
    };
  }

  const proofFileName = `proof-${order.id}-${crypto.randomBytes(10).toString('hex')}.${detected.ext}`;
  const destPath = path.join(PRIVATE_PROOFS_DIR, proofFileName);
  fs.writeFileSync(destPath, params.fileBuffer);

  if (order.proofFileName && order.proofFileName !== proofFileName) {
    const oldPath = path.join(PRIVATE_PROOFS_DIR, path.basename(order.proofFileName));
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch {}
    }
  }

  const nowIso = new Date().toISOString();
  let storedDataUrl: string | undefined =
    params.proofDataUrl &&
    params.proofDataUrl.startsWith('data:image/') &&
    params.proofDataUrl.length <= 800000
      ? params.proofDataUrl
      : undefined;

  if (!storedDataUrl && params.fileBuffer.length <= 550 * 1024) {
    storedDataUrl = `data:${detected.mime};base64,${params.fileBuffer.toString('base64')}`;
  }

  order.ownerUid = order.ownerUid || member.ownerUid;
  order.proofFileName = proofFileName;
  order.proofOriginalName = (params.originalName || `payment-proof.${detected.ext}`).slice(0, 180);
  order.proofMimeType = detected.mime;
  if (storedDataUrl) {
    order.proofDataUrl = storedDataUrl;
  }
  order.proofSubmittedAt = nowIso;
  order.paymentNote = params.paymentNote ? String(params.paymentNote).trim().slice(0, 400) : undefined;
  order.status = 'pending_verification';
  order.rejectionReason = undefined;
  order.updatedAt = nowIso;
  orders[idx] = order;
  writeJson(ORDERS_FILE, orders);
  mirrorOrderServer(order);

  const amountLabel =
    order.currency === 'USD'
      ? `$${(order.amountUsd ?? order.expectedAmount ?? 0).toFixed(2)} USD`
      : `PKR ${order.amountPkr.toLocaleString()}`;

  appendHistory({
    memberId: member.id,
    membershipId: order.targetMembershipId,
    orderId: order.id,
    event: 'proof_submitted',
    planId: order.planId,
    planName: order.planName,
    amountPkr: order.amountPkr,
    amountUsd: order.amountUsd,
    currency: order.currency,
    selectedDramaIds: order.selectedDramaIds,
    details: `${order.orderType === 'renewal' ? 'Renewal payment' : 'Payment'} proof submitted for ${order.planName} (${amountLabel} via ${order.paymentMethod === 'binance_qr' ? 'Binance QR' : 'Bank QR'}) — pending manual verification.`,
  });

  return { success: true, order, member };
}

export function getAuthorizedProofFile(params: {
  orderId: string;
  requesterMemberId: string | null;
  admin: SafeAdmin | null;
}):
  | { success: true; filePath: string; mimeType: string; originalName: string }
  | { success: false; error: string; statusCode: number } {
  if (!params.admin && !params.requesterMemberId) {
    return { success: false, error: 'Authentication required to view payment proof.', statusCode: 401 };
  }

  const orders = readAllOrders();
  const order = orders.find((o) => o.id === params.orderId);
  if (!order) {
    return { success: false, error: 'Payment request not found.', statusCode: 404 };
  }

  if (!params.admin && order.memberId !== params.requesterMemberId) {
    return { success: false, error: 'Forbidden: you cannot access another member’s payment proof.', statusCode: 403 };
  }

  if (!order.proofFileName && !order.proofDataUrl) {
    return { success: false, error: 'No payment proof has been uploaded for this request yet.', statusCode: 404 };
  }

  const safeBase = order.proofFileName
    ? path.basename(order.proofFileName)
    : `proof-${order.id}.jpg`;
  const filePath = path.join(PRIVATE_PROOFS_DIR, safeBase);

  if (!fs.existsSync(filePath) && order.proofDataUrl) {
    const match = order.proofDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (match) {
      try {
        const buf = Buffer.from(match[2], 'base64');
        fs.writeFileSync(filePath, buf);
      } catch {}
    }
  }

  if (!fs.existsSync(filePath)) {
    return { success: false, error: 'Stored payment proof file could not be found.', statusCode: 404 };
  }

  return {
    success: true,
    filePath,
    mimeType: order.proofMimeType || 'image/jpeg',
    originalName: order.proofOriginalName || safeBase,
  };
}

// --- ADMIN PAYMENT VERIFICATION & MEMBERSHIP CONTROLS ---
export function approvePaymentRequest(params: {
  orderId: string;
  admin: SafeAdmin;
}):
  | {
      success: true;
      order: MembershipOrder;
      membership: MembershipRecord;
      member: SafeMember | null;
      wasRenewal: boolean;
    }
  | { success: false; error: string; statusCode: number } {
  const orders = readAllOrders();
  const idx = orders.findIndex((o) => o.id === params.orderId);
  if (idx === -1) {
    return { success: false, error: 'Payment request not found.', statusCode: 404 };
  }

  const order = orders[idx];
  if (order.status === 'approved') {
    return {
      success: false,
      error: 'Duplicate approval blocked: this payment request has already been approved and activated.',
      statusCode: 409,
    };
  }

  const resolvedPlans = getResolvedPlans();
  const plan = resolvedPlans.find((p) => p.id === order.planId) || getPlanById(order.planId);
  if (!plan) {
    return { success: false, error: 'Order references an invalid plan.', statusCode: 400 };
  }

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  order.status = 'approved';
  order.paidAt = nowIso;
  order.reviewedByAdminId = params.admin.id;
  order.reviewedByAdminEmail = params.admin.email;
  order.reviewedAt = nowIso;
  order.rejectionReason = undefined;
  order.updatedAt = nowIso;
  orders[idx] = order;
  writeJson(ORDERS_FILE, orders);

  const selectedIds =
    Array.isArray(order.selectedDramaIds) && order.selectedDramaIds.length > 0
      ? plan.id === 'vip'
        ? order.selectedDramaIds.slice(0, 3)
        : order.selectedDramaIds
      : plan.id === 'vip'
        ? MEMBERSHIP_DRAMAS.slice(0, 3).map((d) => d.id)
        : ['teskilat'];
  const orderMember = getMemberById(order.memberId);
  const memberships = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const durationMs = order.durationDays * 24 * 60 * 60 * 1000;
  const paymentCurrency: PaymentCurrency = order.currency === 'USD' ? 'USD' : 'PKR';
  const paymentRegion: PaymentRegion = order.paymentRegion === 'international' ? 'international' : 'pakistan';
  const paymentMethod: PaymentMethod = order.paymentMethod || (paymentRegion === 'international' ? 'binance_qr' : 'bank_qr');
  const paidAmount =
    paymentCurrency === 'USD'
      ? Number(order.amountUsd ?? order.expectedAmount ?? plan.priceUsd)
      : Number(order.amountPkr ?? plan.pricePkr);

  let resultingMembership: MembershipRecord | null = null;
  let wasRenewal = false;

  if (order.orderType === 'renewal' && order.targetMembershipId) {
    const targetIdx = memberships.findIndex(
      (m) => m.id === order.targetMembershipId && m.memberId === order.memberId
    );
    if (targetIdx !== -1) {
      const target = memberships[targetIdx];
      const existingExpMs = Date.parse(target.expiresAt);
      const isStillActive =
        target.status === 'active' && !Number.isNaN(existingExpMs) && existingExpMs > nowMs;
      const previousExpiresAt = target.expiresAt;
      const newExpiresAtIso = isStillActive
        ? new Date(existingExpMs + durationMs).toISOString()
        : new Date(nowMs + durationMs).toISOString();

      target.status = 'active';
      target.activatedAt = isStillActive ? target.activatedAt : nowIso;
      target.expiresAt = newExpiresAtIso;
      target.cancelledAt = undefined;
      target.revokedByAdminEmail = undefined;
      target.revokedReason = undefined;
      target.orderId = order.id;
      target.planId = plan.id;
      target.planName = plan.name;
      target.pricePkr = Number(order.amountPkr ?? plan.pricePkr);
      target.priceUsd = order.amountUsd ?? plan.priceUsd;
      target.originalAmountPkr = order.originalAmountPkr ?? plan.pricePkr;
      target.originalAmountUsd = order.originalAmountUsd ?? plan.priceUsd;
      target.promoCode = order.promoCode;
      target.promoDiscountPkr = order.promoDiscountPkr;
      target.promoDiscountUsd = order.promoDiscountUsd;
      target.referralDiscountPkr = order.referralDiscountPkr;
      target.referralDiscountUsd = order.referralDiscountUsd;
      target.creditsUsedPkr = order.creditsUsedPkr;
      target.creditsUsedUsd = order.creditsUsedUsd;
      target.discountTotalPkr = order.discountTotalPkr;
      target.discountTotalUsd = order.discountTotalUsd;
      target.durationDays = order.durationDays;
      target.selectedDramaIds = selectedIds;
      target.approvedByAdminEmail = params.admin.email;
      target.paymentProvider = order.provider || paymentMethod;
      target.paymentRegion = paymentRegion;
      target.paymentMethod = paymentMethod;
      target.currency = paymentCurrency;
      target.expectedAmount = paidAmount;
      target.paymentReference = order.paymentNote || order.id;
      target.renewalHistory = [
        ...(target.renewalHistory || []),
        {
          id: `ren-${nowMs}-${crypto.randomBytes(2).toString('hex')}`,
          orderId: order.id,
          renewedAt: nowIso,
          previousExpiresAt,
          newExpiresAt: newExpiresAtIso,
          addedDays: order.durationDays,
          planId: plan.id,
          planName: plan.name,
          paymentMethod,
          currency: paymentCurrency,
          amount: paidAmount,
          approvedByAdminEmail: params.admin.email,
          note: isStillActive ? 'Early renewal extended from previous expiry' : 'Post-expiry renewal from approval date',
        },
      ];
      memberships[targetIdx] = target;
      resultingMembership = target;
      wasRenewal = true;
      supersedeOldRenewalReminders(target.id, nowIso);
    }
  }

  if (!resultingMembership) {
    // New plan checkout: preserve existing non-expired memberships for OTHER dramas!
    const expiresAtIso = new Date(nowMs + durationMs).toISOString();
    resultingMembership = {
      id: `sub-${nowMs}-${crypto.randomBytes(3).toString('hex')}`,
      memberId: order.memberId,
      ownerUid: order.ownerUid || orderMember?.ownerUid,
      customerName: order.customerName || orderMember?.fullName || 'FEVIQO Member',
      customerEmail: order.customerEmail || orderMember?.email || '',
      customerPhone: order.customerPhone || orderMember?.phone || '',
      orderId: order.id,
      planId: plan.id,
      planName: plan.name,
      pricePkr: Number(order.amountPkr ?? plan.pricePkr),
      priceUsd: order.amountUsd ?? plan.priceUsd,
      originalAmountPkr: order.originalAmountPkr ?? plan.pricePkr,
      originalAmountUsd: order.originalAmountUsd ?? plan.priceUsd,
      promoCode: order.promoCode,
      promoDiscountPkr: order.promoDiscountPkr,
      promoDiscountUsd: order.promoDiscountUsd,
      referralDiscountPkr: order.referralDiscountPkr,
      referralDiscountUsd: order.referralDiscountUsd,
      creditsUsedPkr: order.creditsUsedPkr,
      creditsUsedUsd: order.creditsUsedUsd,
      discountTotalPkr: order.discountTotalPkr,
      discountTotalUsd: order.discountTotalUsd,
      durationDays: order.durationDays,
      selectedDramaIds: selectedIds,
      status: 'active',
      activatedAt: nowIso,
      expiresAt: expiresAtIso,
      approvedByAdminEmail: params.admin.email,
      paymentProvider: order.provider || paymentMethod,
      paymentRegion,
      paymentMethod,
      currency: paymentCurrency,
      expectedAmount: paidAmount,
      paymentReference: order.paymentNote || order.id,
      renewalHistory: [],
      createdAt: nowIso,
    };
    memberships.unshift(resultingMembership);
  }

  writeJson(MEMBERSHIPS_FILE, memberships);
  mirrorOrderServer(order);
  mirrorMembershipServer(resultingMembership);

  // Issue referral reward to referrer ONLY upon verified admin approval of qualifying purchase
  processReferralConversionReward(order, params.admin);
  // Record affiliate / referral campaign commission snapshot upon verified admin payment approval
  recordCommissionForVerifiedOrder({ order, admin: params.admin });

  const amountLabel =
    paymentCurrency === 'USD' ? `$${paidAmount.toFixed(2)} USD` : `PKR ${paidAmount.toLocaleString()}`;
  const dramaNames = selectedIds.map((id) => getDramaById(id)?.title || id).join(', ');

  appendHistory({
    memberId: order.memberId,
    membershipId: resultingMembership.id,
    orderId: order.id,
    event: wasRenewal ? 'membership_renewed' : 'payment_approved',
    planId: plan.id,
    planName: plan.name,
    amountPkr: order.amountPkr,
    amountUsd: order.amountUsd,
    currency: paymentCurrency,
    selectedDramaIds: selectedIds,
    details: `${plan.name} ${wasRenewal ? 'renewal' : 'payment'} approved (${amountLabel} via ${paymentMethod}) and active until ${resultingMembership.expiresAt}.`,
  });

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'payment_approved',
    targetId: order.id,
    details: `Approved ${wasRenewal ? 'renewal' : 'new'} ${plan.name} (${amountLabel}) for ${order.customerEmail || order.memberId}. Membership ${resultingMembership.id} active until ${resultingMembership.expiresAt}.`,
  });

  createCustomerNotificationRecord({
    memberId: order.memberId,
    ownerUid: order.ownerUid || orderMember?.ownerUid,
    customerEmail: order.customerEmail || orderMember?.email,
    membershipId: resultingMembership.id,
    orderId: order.id,
    planId: plan.id,
    dramaIds: selectedIds,
    type: wasRenewal ? 'membership_renewed' : 'membership_approved',
    title: wasRenewal
      ? `${plan.name} membership renewed`
      : `${plan.name} membership activated`,
    titleUr: wasRenewal
      ? `آپ کی ${plan.name} ممبرشپ کی تجدید ہو گئی`
      : `آپ کی ${plan.name} ممبرشپ فعال ہو گئی`,
    message: `Your payment (${amountLabel}) has been verified. ${dramaNames} ${selectedIds.length > 1 ? 'are' : 'is'} now unlocked until ${new Date(resultingMembership.expiresAt).toUTCString()}.`,
    messageUr: `آپ کی ادائیگی (${amountLabel}) کی تصدیق ہو گئی ہے۔ اب آپ کے منتخب کردہ ڈرامے ان لاک ہو چکے ہیں۔`,
    ctaLabel: 'Watch Unlocked Dramas',
    ctaHref: selectedIds[0] ? `/${selectedIds[0]}` : '/dramas',
    dedupeKey: `${order.id}:approved:${resultingMembership.expiresAt}`,
    emailStatus: 'not_sent',
  });

  return {
    success: true,
    order,
    membership: resultingMembership,
    member: getMemberById(order.memberId),
    wasRenewal,
  };
}

export function rejectPaymentRequest(params: {
  orderId: string;
  reason: string;
  admin: SafeAdmin;
}):
  | { success: true; order: MembershipOrder; member: SafeMember | null }
  | { success: false; error: string; statusCode: number } {
  const cleanReason = (params.reason || '').trim();
  if (cleanReason.length < 3) {
    return { success: false, error: 'A clear rejection reason is required.', statusCode: 400 };
  }

  const orders = readAllOrders();
  const idx = orders.findIndex((o) => o.id === params.orderId);
  if (idx === -1) {
    return { success: false, error: 'Payment request not found.', statusCode: 404 };
  }

  const order = orders[idx];
  if (order.status === 'approved') {
    return {
      success: false,
      error: 'Cannot reject an already approved payment request. Use Revoke Membership instead.',
      statusCode: 409,
    };
  }

  const nowIso = new Date().toISOString();
  order.status = 'rejected';
  order.rejectionReason = cleanReason.slice(0, 500);
  order.reviewedByAdminId = params.admin.id;
  order.reviewedByAdminEmail = params.admin.email;
  order.reviewedAt = nowIso;
  order.updatedAt = nowIso;
  refundOrderCreditsIfNeeded(order, 'rejected');
  reverseCommissionForOrder({
    orderId: order.id,
    orderStatus: 'rejected',
    reason: `Payment rejected: ${order.rejectionReason}`,
    actorEmail: params.admin.email,
  });
  orders[idx] = order;
  writeJson(ORDERS_FILE, orders);
  mirrorOrderServer(order);

  appendHistory({
    memberId: order.memberId,
    membershipId: order.targetMembershipId,
    orderId: order.id,
    event: 'payment_rejected',
    planId: order.planId,
    planName: order.planName,
    amountPkr: order.amountPkr,
    amountUsd: order.amountUsd,
    currency: order.currency,
    selectedDramaIds: order.selectedDramaIds,
    details: `Payment submission rejected: ${order.rejectionReason}`,
  });

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'payment_rejected',
    targetId: order.id,
    details: `Rejected payment ${order.id} for ${order.customerEmail || order.memberId}. Reason: ${order.rejectionReason}`,
  });

  createCustomerNotificationRecord({
    memberId: order.memberId,
    ownerUid: order.ownerUid,
    customerEmail: order.customerEmail,
    membershipId: order.targetMembershipId,
    orderId: order.id,
    planId: order.planId,
    dramaIds: order.selectedDramaIds,
    type: 'payment_rejected',
    title: `Payment proof needed for ${order.planName}`,
    titleUr: `${order.planName} کے لیے ادائیگی کا نیا ثبوت درکار ہے`,
    message: `Reason: ${order.rejectionReason}. Your account remains intact—you can upload a clearer screenshot in My Account.`,
    messageUr: `وجہ: ${order.rejectionReason}۔ آپ مائی اکاؤنٹ میں جا کر نیا اسکرین شاٹ اپ لوڈ کر سکتے ہیں۔`,
    ctaLabel: 'Open My Account',
    ctaHref: '/membership?tab=account',
    dedupeKey: `${order.id}:rejected:${nowIso}`,
    emailStatus: 'not_sent',
  });

  return {
    success: true,
    order,
    member: getMemberById(order.memberId),
  };
}

export function extendMembershipByAdmin(params: {
  membershipId: string;
  addDays: number;
  reason?: string;
  admin: SafeAdmin;
}):
  | { success: true; membership: MembershipRecord }
  | { success: false; error: string; statusCode: number } {
  const days = Number(params.addDays);
  if (!Number.isFinite(days) || days < 1 || days > 3650) {
    return { success: false, error: 'Extension days must be between 1 and 3650.', statusCode: 400 };
  }
  const roundedDays = Math.round(days);
  const all = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const idx = all.findIndex((m) => m.id === params.membershipId);
  if (idx === -1) {
    return { success: false, error: 'Membership record not found.', statusCode: 404 };
  }

  const sub = all[idx];
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const existingExpMs = Date.parse(sub.expiresAt);
  const baseMs = sub.status === 'active' && !Number.isNaN(existingExpMs) && existingExpMs > nowMs ? existingExpMs : nowMs;
  const previousExpiresAt = sub.expiresAt;
  const nextExpiresAt = new Date(baseMs + roundedDays * 24 * 60 * 60 * 1000).toISOString();

  sub.status = 'active';
  if (baseMs === nowMs) {
    sub.activatedAt = nowIso;
  }
  sub.expiresAt = nextExpiresAt;
  sub.cancelledAt = undefined;
  sub.revokedByAdminEmail = undefined;
  sub.revokedReason = undefined;
  sub.durationDays = (sub.durationDays || 0) + roundedDays;
  sub.lastExtendedAt = nowIso;
  sub.renewalHistory = [
    ...(sub.renewalHistory || []),
    {
      id: `ext-${nowMs}-${crypto.randomBytes(2).toString('hex')}`,
      renewedAt: nowIso,
      previousExpiresAt,
      newExpiresAt: nextExpiresAt,
      addedDays: roundedDays,
      planId: sub.planId,
      planName: sub.planName,
      paymentMethod: 'admin_assigned',
      currency: sub.currency || 'PKR',
      amount: 0,
      approvedByAdminEmail: params.admin.email,
      note: params.reason?.trim() || `Manual admin extension (+${roundedDays} days)`,
    },
  ];

  all[idx] = sub;
  writeJson(MEMBERSHIPS_FILE, all);
  mirrorMembershipServer(sub);
  supersedeOldRenewalReminders(sub.id, nowIso);

  appendHistory({
    memberId: sub.memberId,
    membershipId: sub.id,
    orderId: sub.orderId,
    event: 'membership_extended',
    planId: sub.planId,
    planName: sub.planName,
    selectedDramaIds: sub.selectedDramaIds,
    details: `${sub.planName} extended by +${roundedDays} days by ${params.admin.email}. New expiry: ${nextExpiresAt}.`,
  });

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'membership_extended',
    targetId: sub.id,
    details: `Extended ${sub.id} (${sub.customerEmail || sub.memberId}) by +${roundedDays} days until ${nextExpiresAt}. Reason: ${params.reason?.trim() || 'Admin extension'}`,
  });

  createCustomerNotificationRecord({
    memberId: sub.memberId,
    ownerUid: sub.ownerUid,
    customerEmail: sub.customerEmail,
    membershipId: sub.id,
    planId: sub.planId,
    dramaIds: sub.selectedDramaIds,
    type: 'membership_extended',
    title: `${sub.planName} extended by ${roundedDays} day${roundedDays > 1 ? 's' : ''}`,
    titleUr: `آپ کی ${sub.planName} ممبرشپ میں ${roundedDays} دن کی توسیع کر دی گئی ہے`,
    message: `Your membership validity has been extended by FEVIQO administration until ${new Date(nextExpiresAt).toUTCString()}.`,
    messageUr: `ایڈمن کی جانب سے آپ کی ممبرشپ میں توسیع کر دی گئی ہے۔`,
    ctaLabel: 'View My Account',
    ctaHref: '/membership?tab=account',
    dedupeKey: `${sub.id}:extended:${nextExpiresAt}`,
    emailStatus: 'not_sent',
  });

  return { success: true, membership: sub };
}

export function revokeMembershipByAdmin(params: {
  membershipId: string;
  reason?: string;
  admin: SafeAdmin;
}):
  | { success: true; membership: MembershipRecord }
  | { success: false; error: string; statusCode: number } {
  const all = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const idx = all.findIndex((m) => m.id === params.membershipId);
  if (idx === -1) {
    return { success: false, error: 'Membership record not found.', statusCode: 404 };
  }
  if (all[idx].status !== 'active') {
    return { success: false, error: 'Membership is not currently active.', statusCode: 400 };
  }

  const nowIso = new Date().toISOString();
  const reason = (params.reason || '').trim() || 'Revoked manually by FEVIQO administrator.';
  all[idx].status = 'cancelled';
  all[idx].cancelledAt = nowIso;
  all[idx].revokedByAdminEmail = params.admin.email;
  all[idx].revokedReason = reason;
  writeJson(MEMBERSHIPS_FILE, all);
  mirrorMembershipServer(all[idx]);
  supersedeOldRenewalReminders(all[idx].id, nowIso);
  revokePlaybackSessionsForMember(all[idx].memberId, `Membership revoked: ${reason}`);
  if (all[idx].orderId) {
    reverseCommissionForOrder({
      orderId: all[idx].orderId,
      orderStatus: 'reversed',
      reason: `Membership revoked: ${reason}`,
      actorEmail: params.admin.email,
    });
  }

  appendHistory({
    memberId: all[idx].memberId,
    membershipId: all[idx].id,
    orderId: all[idx].orderId,
    event: 'membership_revoked',
    planId: all[idx].planId,
    planName: all[idx].planName,
    selectedDramaIds: all[idx].selectedDramaIds,
    details: `Membership access revoked by administration: ${reason}`,
  });

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'membership_revoked',
    targetId: all[idx].id,
    details: `Revoked active membership ${all[idx].id} (${all[idx].planName}). Reason: ${reason}`,
  });

  return { success: true, membership: all[idx] };
}

function unlinkOrderProofFile(order: MembershipOrder): void {
  if (!order.proofFileName) return;
  const proofPath = path.join(PRIVATE_PROOFS_DIR, path.basename(order.proofFileName));
  if (fs.existsSync(proofPath)) {
    try {
      fs.unlinkSync(proofPath);
    } catch {}
  }
}

export function deleteOrderByAdmin(params: {
  orderId: string;
  admin: SafeAdmin;
}):
  | { success: true; deletedOrderId: string; deletedNotificationIds: string[] }
  | { success: false; error: string; statusCode: number } {
  syncMemberSubscriptions();
  const orders = readAllOrders();
  const idx = orders.findIndex((o) => o.id === params.orderId);
  if (idx === -1) {
    return { success: false, error: 'Payment request not found.', statusCode: 404 };
  }

  const order = orders[idx];
  const nowMs = Date.now();
  const allMemberships = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const hasActiveLinkedMembership = allMemberships.some(
    (m) =>
      m.status === 'active' &&
      Date.parse(m.expiresAt) > nowMs &&
      (m.orderId === order.id ||
        (order.status === 'approved' && Boolean(order.targetMembershipId) && m.id === order.targetMembershipId))
  );

  if (order.status === 'approved' && hasActiveLinkedMembership) {
    return {
      success: false,
      error: 'Cannot delete an approved payment request linked to an active membership. Revoke the active membership first.',
      statusCode: 409,
    };
  }

  refundOrderCreditsIfNeeded(order, 'deleted');
  reverseCommissionForOrder({
    orderId: order.id,
    orderStatus: 'deleted',
    reason: 'Order deleted by administrator.',
    actorEmail: params.admin.email,
  });
  orders.splice(idx, 1);
  writeJson(ORDERS_FILE, orders);
  unlinkOrderProofFile(order);

  const notifs = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);
  const deletedNotificationIds: string[] = [];
  const remainingNotifs = notifs.filter((n) => {
    if (n.orderId === order.id) {
      deletedNotificationIds.push(n.id);
      return false;
    }
    return true;
  });
  if (deletedNotificationIds.length > 0) {
    writeJson(MEMBER_NOTIFS_FILE, remainingNotifs);
  }

  recordDeletedTombstones({
    orderIds: [order.id],
    notificationIds: deletedNotificationIds,
  });

  if (isServerFirestoreEnabled()) {
    void deleteDocFromFirestoreServer('membershipOrders', order.id);
    for (const notifId of deletedNotificationIds) {
      void deleteDocFromFirestoreServer('memberNotifications', notifId);
    }
  }

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'order_deleted',
    targetId: order.id,
    details: `Deleted payment request ${order.id} (${order.planName}, status: ${order.status}) for ${order.customerEmail || order.memberId}.`,
  });

  return { success: true, deletedOrderId: order.id, deletedNotificationIds };
}

export function deleteMemberByAdmin(params: {
  memberId: string;
  admin: SafeAdmin;
}):
  | {
      success: true;
      deletedIds: {
        memberId: string;
        memberEmail?: string;
        memberPhone?: string;
        orderIds: string[];
        membershipIds: string[];
        historyIds: string[];
        notificationIds: string[];
      };
    }
  | { success: false; error: string; statusCode: number } {
  syncMemberSubscriptions(params.memberId);
  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  const memberIdx = members.findIndex((m) => m.id === params.memberId);
  if (memberIdx === -1) {
    return { success: false, error: 'Member account not found.', statusCode: 404 };
  }

  const member = members[memberIdx];
  const nowMs = Date.now();
  const memberships = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const hasActiveMembership = memberships.some(
    (s) => s.memberId === member.id && s.status === 'active' && Date.parse(s.expiresAt) > nowMs
  );

  if (hasActiveMembership) {
    return {
      success: false,
      error: 'Cannot delete an account that has an active membership. Revoke the active membership first.',
      statusCode: 409,
    };
  }

  members.splice(memberIdx, 1);
  writeJson(MEMBERS_FILE, members);

  const orders = readAllOrders();
  const deletedOrderIds: string[] = [];
  const remainingOrders = orders.filter((o) => {
    if (o.memberId === member.id) {
      deletedOrderIds.push(o.id);
      unlinkOrderProofFile(o);
      return false;
    }
    return true;
  });
  writeJson(ORDERS_FILE, remainingOrders);

  const deletedMembershipIds: string[] = [];
  const remainingMemberships = memberships.filter((s) => {
    if (s.memberId === member.id) {
      deletedMembershipIds.push(s.id);
      return false;
    }
    return true;
  });
  writeJson(MEMBERSHIPS_FILE, remainingMemberships);

  const history = readJson<MembershipHistoryEntry[]>(HISTORY_FILE, []);
  const deletedHistoryIds: string[] = [];
  const remainingHistory = history.filter((h) => {
    if (h.memberId === member.id) {
      deletedHistoryIds.push(h.id);
      return false;
    }
    return true;
  });
  writeJson(HISTORY_FILE, remainingHistory);

  const notifs = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);
  const deletedNotificationIds: string[] = [];
  const remainingNotifs = notifs.filter((n) => {
    if (n.memberId === member.id) {
      deletedNotificationIds.push(n.id);
      return false;
    }
    return true;
  });
  writeJson(MEMBER_NOTIFS_FILE, remainingNotifs);

  const referrals = readJson<ReferralRecord[]>(REFERRALS_FILE, []);
  const deletedReferralIds: string[] = [];
  const remainingReferrals = referrals.filter((r) => {
    if (
      (r.referredMemberId === member.id || r.referrerMemberId === member.id) &&
      r.status !== 'converted'
    ) {
      deletedReferralIds.push(r.id);
      return false;
    }
    return true;
  });
  if (deletedReferralIds.length > 0) {
    writeJson(REFERRALS_FILE, remainingReferrals);
  }

  recordDeletedTombstones({
    memberIds: [member.id],
    orderIds: deletedOrderIds,
    membershipIds: deletedMembershipIds,
    historyIds: deletedHistoryIds,
    notificationIds: deletedNotificationIds,
  });

  if (isServerFirestoreEnabled()) {
    void deleteDocFromFirestoreServer('members', member.id);
    for (const id of deletedOrderIds) void deleteDocFromFirestoreServer('membershipOrders', id);
    for (const id of deletedMembershipIds) void deleteDocFromFirestoreServer('memberships', id);
    for (const id of deletedHistoryIds) void deleteDocFromFirestoreServer('membershipHistory', id);
    for (const id of deletedNotificationIds) void deleteDocFromFirestoreServer('memberNotifications', id);
    for (const id of deletedReferralIds) void deleteDocFromFirestoreServer('referrals', id);
  }

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'member_deleted',
    targetId: member.id,
    details: `Deleted customer account ${member.email} (${member.fullName}) along with ${deletedOrderIds.length} request(s) and ${deletedMembershipIds.length} past membership(s).`,
  });

  return {
    success: true,
    deletedIds: {
      memberId: member.id,
      memberEmail: member.email,
      memberPhone: member.phone,
      orderIds: deletedOrderIds,
      membershipIds: deletedMembershipIds,
      historyIds: deletedHistoryIds,
      notificationIds: deletedNotificationIds,
    },
  };
}

export function deleteMembershipRecordByAdmin(params: {
  membershipId: string;
  admin: SafeAdmin;
}):
  | { success: true; deletedMembershipId: string; deletedNotificationIds: string[] }
  | { success: false; error: string; statusCode: number } {
  syncMemberSubscriptions();
  const all = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const idx = all.findIndex((m) => m.id === params.membershipId);
  if (idx === -1) {
    return { success: false, error: 'Membership record not found.', statusCode: 404 };
  }

  const sub = all[idx];
  if (sub.status === 'active' && Date.parse(sub.expiresAt) > Date.now()) {
    return {
      success: false,
      error: 'Cannot delete an active membership. Revoke access first before deleting the record.',
      statusCode: 409,
    };
  }

  all.splice(idx, 1);
  writeJson(MEMBERSHIPS_FILE, all);

  const notifs = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);
  const deletedNotificationIds: string[] = [];
  const remainingNotifs = notifs.filter((n) => {
    if (n.membershipId === sub.id) {
      deletedNotificationIds.push(n.id);
      return false;
    }
    return true;
  });
  if (deletedNotificationIds.length > 0) {
    writeJson(MEMBER_NOTIFS_FILE, remainingNotifs);
  }

  recordDeletedTombstones({
    membershipIds: [sub.id],
    orderIds: sub.orderId ? [sub.orderId] : [],
    notificationIds: deletedNotificationIds,
  });

  if (isServerFirestoreEnabled()) {
    void deleteDocFromFirestoreServer('memberships', sub.id);
    for (const id of deletedNotificationIds) {
      void deleteDocFromFirestoreServer('memberNotifications', id);
    }
  }

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'membership_deleted',
    targetId: sub.id,
    details: `Deleted ${sub.status} membership record ${sub.id} (${sub.planName}) for ${sub.customerEmail || sub.memberId}.`,
  });

  return {
    success: true,
    deletedMembershipId: sub.id,
    deletedNotificationIds,
  };
}

export interface DeletedRecordsTombstones {
  memberIds: string[];
  orderIds: string[];
  membershipIds: string[];
  historyIds: string[];
  notificationIds: string[];
}

export function readDeletedTombstones(): DeletedRecordsTombstones {
  const raw = readJson<Partial<DeletedRecordsTombstones>>(DELETED_RECORDS_FILE, {});
  return {
    memberIds: Array.isArray(raw.memberIds) ? raw.memberIds : [],
    orderIds: Array.isArray(raw.orderIds) ? raw.orderIds : [],
    membershipIds: Array.isArray(raw.membershipIds) ? raw.membershipIds : [],
    historyIds: Array.isArray(raw.historyIds) ? raw.historyIds : [],
    notificationIds: Array.isArray(raw.notificationIds) ? raw.notificationIds : [],
  };
}

export function recordDeletedTombstones(patch: Partial<DeletedRecordsTombstones>): DeletedRecordsTombstones {
  const current = readDeletedTombstones();
  const mergeUnique = (base: string[], add?: string[]) => {
    const s = new Set(base);
    for (const item of add || []) {
      const clean = String(item || '').trim();
      if (clean) s.add(clean);
    }
    return Array.from(s).slice(-5000);
  };
  const next: DeletedRecordsTombstones = {
    memberIds: mergeUnique(current.memberIds, patch.memberIds),
    orderIds: mergeUnique(current.orderIds, patch.orderIds),
    membershipIds: mergeUnique(current.membershipIds, patch.membershipIds),
    historyIds: mergeUnique(current.historyIds, patch.historyIds),
    notificationIds: mergeUnique(current.notificationIds, patch.notificationIds),
  };
  writeJson(DELETED_RECORDS_FILE, next);
  return next;
}

export function updateMemberPhoneByAdmin(params: {
  memberId: string;
  phone: string;
  admin: SafeAdmin;
}): { success: true; member: SafeMember } | { success: false; error: string; statusCode: number } {
  const cleanPhone = String(params.phone || '').trim();
  if (!cleanPhone) {
    return { success: false, error: 'Phone number cannot be empty.', statusCode: 400 };
  }
  const normalized = normalizePhoneCanonical(cleanPhone);
  if (!normalized || normalized.length < 8) {
    return {
      success: false,
      error: 'Please enter a valid Pakistani number (03XXXXXXXXX / +923XXXXXXXXX) or international number with +country code.',
      statusCode: 400,
    };
  }
  const members = readMembersEnsured();
  const idx = members.findIndex((m) => m.id === params.memberId);
  if (idx === -1) {
    return { success: false, error: 'Customer account not found.', statusCode: 404 };
  }
  const nowIso = new Date().toISOString();
  const e164 = normalized.startsWith('+') ? normalized : `+${normalized}`;
  members[idx] = {
    ...members[idx],
    phone: e164,
    phoneNormalized: normalized.replace(/^\+/, ''),
    updatedAt: nowIso,
  };
  writeJson(MEMBERS_FILE, members);
  const safeMember = sanitizeMember(members[idx]);
  mirrorMemberServer(safeMember);
  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'member_phone_updated',
    targetId: members[idx].id,
    details: `Updated WhatsApp phone for ${members[idx].email} to ${e164}.`,
  });
  return { success: true, member: safeMember };
}

// --- PERMANENT USER EMAIL BLOCKING & UNBLOCKING ---
const PROTECTED_ADMIN_EMAILS = new Set(['rexanmedia01@gmail.com', 'partner@feviqo.com']);

export function normalizeBlockedEmail(email?: string | null): string {
  return String(email || '').trim().toLowerCase();
}

export function buildBlockedUserDocId(email: string): string {
  const normalized = normalizeBlockedEmail(email);
  const digest = crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 24);
  return `blk-${digest}`;
}

export function buildBlockedAccountMessage(record?: BlockedUserRecord | null): string {
  if (record?.reason && record.reason.trim() && record.reason.trim() !== 'Blocked by FEVIQO administrator') {
    return `This email address (${record.email}) has been permanently blocked from accessing FEVIQO. Reason: ${record.reason.trim()}`;
  }
  return 'This account and its associated phone number have been permanently blocked from accessing or registering on FEVIQO until an administrator restores access.';
}

export function normalizeBlockedPhone(phone?: string | null): string {
  const raw = String(phone || '').trim();
  if (!raw) return '';
  let digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  if (/^03\d{9}$/.test(digits)) {
    return `92${digits.slice(1)}`;
  }
  if (/^3\d{9}$/.test(digits)) {
    return `92${digits}`;
  }
  return digits.length >= 10 && digits.length <= 15 ? digits : '';
}

function mirrorBlockedUserServer(record: BlockedUserRecord) {
  if (!isServerFirestoreEnabled()) return;
  void mirrorDocToFirestoreServer('blockedUsers', record.id, {
    id: record.id,
    email: record.email,
    phone: record.phone || '',
    phoneNormalized: record.phoneNormalized || '',
    additionalPhones: Array.isArray(record.additionalPhones) ? record.additionalPhones.slice(0, 20) : [],
    memberId: record.memberId || '',
    fullName: record.fullName || '',
    reason: record.reason || 'Blocked by FEVIQO administrator',
    blockedByAdminId: record.blockedByAdminId,
    blockedByAdminEmail: record.blockedByAdminEmail,
    blockedAt: record.blockedAt,
    createdAtIso: record.createdAt,
    updatedAtIso: record.updatedAt,
  });
}

const PERMANENT_BLOCKED_PHONES: Array<{ raw: string; normalized: string; reason: string }> = [
  {
    raw: '+923335455723',
    normalized: '923335455723',
    reason: 'Permanently blocked by FEVIQO administrator (fake/abusive orders)',
  },
];

let permanentBlockEnforcedOnce = false;

export function ensurePermanentBlockedPhoneEnforcement(force = false): {
  purgedOrderIds: string[];
  revokedMembershipIds: string[];
} {
  if (permanentBlockEnforcedOnce && !force) {
    return { purgedOrderIds: [], revokedMembershipIds: [] };
  }
  permanentBlockEnforcedOnce = true;

  const list = readJson<BlockedUserRecord[]>(BLOCKED_USERS_FILE, []);
  const members = readMembersEnsured();
  const nowIso = new Date().toISOString();
  let blockedListChanged = false;

  const blockedPhoneSet = new Set<string>();
  const blockedEmailSet = new Set<string>();
  const blockedMemberIdSet = new Set<string>();

  for (const seed of PERMANENT_BLOCKED_PHONES) {
    blockedPhoneSet.add(seed.normalized);
    const matchedMember = members.find((m) => normalizeBlockedPhone(m.phone) === seed.normalized);
    if (matchedMember) {
      blockedMemberIdSet.add(matchedMember.id);
      if (matchedMember.email) blockedEmailSet.add(normalizeBlockedEmail(matchedMember.email));
    }
    const existingIdx = list.findIndex((item) => {
      const p1 = normalizeBlockedPhone(item.phoneNormalized);
      const p2 = normalizeBlockedPhone(item.phone);
      const add = Array.isArray(item.additionalPhones)
        ? item.additionalPhones.some((p) => normalizeBlockedPhone(p) === seed.normalized)
        : false;
      return p1 === seed.normalized || p2 === seed.normalized || add;
    });
    if (existingIdx === -1) {
      const emailForRecord = matchedMember?.email
        ? normalizeBlockedEmail(matchedMember.email)
        : `phone-${seed.normalized}@blocked.feviqo.local`;
      const rec: BlockedUserRecord = {
        id: buildBlockedUserDocId(emailForRecord),
        email: emailForRecord,
        phone: seed.raw,
        phoneNormalized: seed.normalized,
        additionalPhones: [seed.normalized],
        memberId: matchedMember?.id,
        fullName: matchedMember?.fullName || 'Blocked Phone User',
        reason: seed.reason,
        blockedByAdminId: 'system-admin',
        blockedByAdminEmail: 'rexanmedia01@gmail.com',
        blockedAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      list.unshift(rec);
      blockedListChanged = true;
      mirrorBlockedUserServer(rec);
    } else if (matchedMember && !list[existingIdx].memberId) {
      list[existingIdx] = {
        ...list[existingIdx],
        memberId: matchedMember.id,
        fullName: list[existingIdx].fullName || matchedMember.fullName,
        email:
          list[existingIdx].email.endsWith('@blocked.feviqo.local') && matchedMember.email
            ? normalizeBlockedEmail(matchedMember.email)
            : list[existingIdx].email,
        updatedAt: nowIso,
      };
      blockedListChanged = true;
      mirrorBlockedUserServer(list[existingIdx]);
    }
  }

  for (const b of list) {
    const e = normalizeBlockedEmail(b.email);
    if (e && !e.endsWith('@blocked.feviqo.local')) blockedEmailSet.add(e);
    if (b.memberId) blockedMemberIdSet.add(b.memberId);
    const p1 = normalizeBlockedPhone(b.phoneNormalized);
    const p2 = normalizeBlockedPhone(b.phone);
    if (p1) blockedPhoneSet.add(p1);
    if (p2) blockedPhoneSet.add(p2);
    for (const ap of b.additionalPhones || []) {
      const np = normalizeBlockedPhone(ap);
      if (np) blockedPhoneSet.add(np);
    }
  }

  if (blockedListChanged) {
    writeJson(BLOCKED_USERS_FILE, list);
  }

  // Sweep members matching any permanently blocked phone/email
  for (const m of members) {
    const mEmail = normalizeBlockedEmail(m.email);
    const mPhone = normalizeBlockedPhone(m.phone);
    if ((mEmail && blockedEmailSet.has(mEmail)) || (mPhone && blockedPhoneSet.has(mPhone))) {
      blockedMemberIdSet.add(m.id);
    }
  }

  // Purge ALL orders belonging to any permanently blocked phone/email/member
  const allOrders = readAllOrders();
  const purgedOrderIds: string[] = [];
  const keptOrders: MembershipOrder[] = [];
  for (const o of allOrders) {
    const oEmail = normalizeBlockedEmail(o.customerEmail);
    const oPhone = normalizeBlockedPhone(o.customerPhone);
    const isBlockedOrder =
      (oEmail && blockedEmailSet.has(oEmail)) ||
      (oPhone && blockedPhoneSet.has(oPhone)) ||
      (o.memberId && blockedMemberIdSet.has(o.memberId));
    if (isBlockedOrder) {
      purgedOrderIds.push(o.id);
      unlinkOrderProofFile(o);
      if (isServerFirestoreEnabled()) {
        void deleteDocFromFirestoreServer('membershipOrders', o.id);
      }
    } else {
      keptOrders.push(o);
    }
  }
  if (purgedOrderIds.length > 0) {
    writeJson(ORDERS_FILE, keptOrders);
    recordDeletedTombstones({ orderIds: purgedOrderIds });
  }

  // Cancel any active memberships belonging to blocked users/phones
  const allMemberships = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const revokedMembershipIds: string[] = [];
  for (let i = 0; i < allMemberships.length; i++) {
    const ms = allMemberships[i];
    const msEmail = normalizeBlockedEmail(ms.customerEmail);
    const msPhone = normalizeBlockedPhone(ms.customerPhone);
    const isBlockedSub =
      (msEmail && blockedEmailSet.has(msEmail)) ||
      (msPhone && blockedPhoneSet.has(msPhone)) ||
      (ms.memberId && blockedMemberIdSet.has(ms.memberId));
    if (isBlockedSub && ms.status === 'active') {
      allMemberships[i] = {
        ...ms,
        status: 'cancelled',
        cancelledAt: nowIso,
        revokedByAdminEmail: 'rexanmedia01@gmail.com',
        revokedReason: 'Account or phone number permanently blocked',
      };
      revokedMembershipIds.push(ms.id);
      mirrorMembershipServer(allMemberships[i]);
    }
  }
  if (revokedMembershipIds.length > 0) {
    writeJson(MEMBERSHIPS_FILE, allMemberships);
  }

  for (const mid of blockedMemberIdSet) {
    revokePlaybackSessionsForMember(mid, 'Account or phone number permanently blocked');
  }

  return { purgedOrderIds, revokedMembershipIds };
}

export function listBlockedUsers(): BlockedUserRecord[] {
  ensurePermanentBlockedPhoneEnforcement(false);
  const list = readJson<BlockedUserRecord[]>(BLOCKED_USERS_FILE, []);
  return list
    .filter((item) => item && (item.email || item.phoneNormalized || item.phone))
    .sort((a, b) => Date.parse(b.blockedAt || b.createdAt || '') - Date.parse(a.blockedAt || a.createdAt || ''));
}

export function getBlockedUserByEmail(email?: string | null): BlockedUserRecord | null {
  ensurePermanentBlockedPhoneEnforcement(false);
  const normalized = normalizeBlockedEmail(email);
  if (!normalized || !normalized.includes('@')) return null;
  const list = readJson<BlockedUserRecord[]>(BLOCKED_USERS_FILE, []);
  return list.find((item) => normalizeBlockedEmail(item.email) === normalized) || null;
}

export function getBlockedUserByPhone(phone?: string | null): BlockedUserRecord | null {
  ensurePermanentBlockedPhoneEnforcement(false);
  const normalized = normalizeBlockedPhone(phone);
  if (!normalized) return null;
  const list = readJson<BlockedUserRecord[]>(BLOCKED_USERS_FILE, []);
  return (
    list.find((item) => {
      if (item.phoneNormalized && normalizeBlockedPhone(item.phoneNormalized) === normalized) return true;
      if (item.phone && normalizeBlockedPhone(item.phone) === normalized) return true;
      if (Array.isArray(item.additionalPhones)) {
        return item.additionalPhones.some((p) => normalizeBlockedPhone(p) === normalized);
      }
      return false;
    }) || null
  );
}

export function getBlockedUserByMemberId(memberId?: string | null): BlockedUserRecord | null {
  ensurePermanentBlockedPhoneEnforcement(false);
  if (!memberId) return null;
  const list = readJson<BlockedUserRecord[]>(BLOCKED_USERS_FILE, []);
  const direct = list.find((item) => item.memberId === memberId);
  if (direct) return direct;
  const members = readMembersEnsured();
  const member = members.find((m) => m.id === memberId);
  if (!member) return null;
  return getBlockedUserByEmail(member.email) || getBlockedUserByPhone(member.phone) || null;
}

export function isEmailBlocked(email?: string | null): boolean {
  return Boolean(getBlockedUserByEmail(email));
}

export function isPhoneBlocked(phone?: string | null): boolean {
  return Boolean(getBlockedUserByPhone(phone));
}

export function blockUserEmailByAdmin(params: {
  email?: string;
  phone?: string;
  memberId?: string;
  reason?: string;
  admin: SafeAdmin;
}):
  | {
      success: true;
      blockedUser: BlockedUserRecord;
      cleanup: {
        deletedPendingOrdersCount: number;
        deletedOrderIds: string[];
        revokedMembershipsCount: number;
        revokedMembershipIds: string[];
        affectedMemberIds: string[];
        blockedPhones: string[];
      };
    }
  | { success: false; statusCode: number; error: string } {
  const members = readMembersEnsured();
  let targetMember = params.memberId
    ? members.find((m) => m.id === params.memberId)
    : undefined;

  const explicitPhoneNorm = normalizeBlockedPhone(params.phone);
  if (!targetMember && explicitPhoneNorm) {
    targetMember = members.find((m) => normalizeBlockedPhone(m.phone) === explicitPhoneNorm);
  }

  let normalizedEmail = normalizeBlockedEmail(params.email || targetMember?.email);
  if (!normalizedEmail && explicitPhoneNorm) {
    normalizedEmail = `phone-${explicitPhoneNorm}@blocked.feviqo.local`;
  }
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return {
      success: false,
      statusCode: 400,
      error: 'Please provide a valid email address or phone number to block.',
    };
  }

  if (!targetMember) {
    targetMember = members.find((m) => normalizeBlockedEmail(m.email) === normalizedEmail);
  }

  // Prevent blocking protected or active administrators
  const activeAdmins = readJson<AdminRecord[]>(ADMINS_FILE, []).filter((a) => a.isActive);
  if (
    PROTECTED_ADMIN_EMAILS.has(normalizedEmail) ||
    normalizeBlockedEmail(params.admin.email) === normalizedEmail ||
    activeAdmins.some((a) => normalizeBlockedEmail(a.email) === normalizedEmail)
  ) {
    return {
      success: false,
      statusCode: 400,
      error: 'Administrator accounts cannot be blocked.',
    };
  }

  const nowIso = new Date().toISOString();
  const cleanReason =
    String(params.reason || '').trim().slice(0, 500) || 'Blocked by FEVIQO administrator';
  const id = buildBlockedUserDocId(normalizedEmail);

  const list = readJson<BlockedUserRecord[]>(BLOCKED_USERS_FILE, []);
  const existingIdx = list.findIndex(
    (item) => item.id === id || normalizeBlockedEmail(item.email) === normalizedEmail
  );
  const existingRec = existingIdx >= 0 ? list[existingIdx] : undefined;

  // Gather ALL phone numbers associated with this user across members, orders, memberships, and explicit input
  const phoneSet = new Set<string>();
  const rawPhones: string[] = [];
  const addPhoneCandidate = (raw?: string | null) => {
    const trimmed = String(raw || '').trim();
    const norm = normalizeBlockedPhone(trimmed);
    if (norm) {
      phoneSet.add(norm);
      if (trimmed) rawPhones.push(trimmed);
    }
  };

  addPhoneCandidate(params.phone);
  addPhoneCandidate(targetMember?.phone);
  addPhoneCandidate(existingRec?.phone);
  addPhoneCandidate(existingRec?.phoneNormalized);
  if (Array.isArray(existingRec?.additionalPhones)) {
    for (const p of existingRec.additionalPhones) addPhoneCandidate(p);
  }

  const matchingMembers = members.filter(
    (m) =>
      normalizeBlockedEmail(m.email) === normalizedEmail ||
      (targetMember && m.id === targetMember.id) ||
      (explicitPhoneNorm && normalizeBlockedPhone(m.phone) === explicitPhoneNorm)
  );
  for (const m of matchingMembers) {
    addPhoneCandidate(m.phone);
  }

  const allOrders = readAllOrders();
  const matchingMemberIds = new Set<string>(matchingMembers.map((m) => m.id));
  for (const o of allOrders) {
    const oEmail = normalizeBlockedEmail(o.customerEmail);
    const oPhone = normalizeBlockedPhone(o.customerPhone);
    if (
      oEmail === normalizedEmail ||
      matchingMemberIds.has(o.memberId) ||
      (oPhone && phoneSet.has(oPhone))
    ) {
      addPhoneCandidate(o.customerPhone);
      if (o.memberId) matchingMemberIds.add(o.memberId);
    }
  }

  const allMemberships = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  for (const ms of allMemberships) {
    const msEmail = normalizeBlockedEmail(ms.customerEmail);
    const msPhone = normalizeBlockedPhone(ms.customerPhone);
    if (
      msEmail === normalizedEmail ||
      matchingMemberIds.has(ms.memberId) ||
      (msPhone && phoneSet.has(msPhone))
    ) {
      addPhoneCandidate(ms.customerPhone);
      if (ms.memberId) matchingMemberIds.add(ms.memberId);
    }
  }

  // Also sweep any additional member accounts that share any of the discovered blocked phone numbers
  for (const m of members) {
    const mPhone = normalizeBlockedPhone(m.phone);
    if (mPhone && phoneSet.has(mPhone)) {
      matchingMemberIds.add(m.id);
    }
  }

  const blockedPhones = Array.from(phoneSet).slice(0, 20);
  const primaryPhoneNormalized = blockedPhones[0] || '';
  const primaryRawPhone = rawPhones[0] || (primaryPhoneNormalized ? `+${primaryPhoneNormalized}` : '');

  const record: BlockedUserRecord = {
    id,
    email: normalizedEmail,
    phone: primaryRawPhone || undefined,
    phoneNormalized: primaryPhoneNormalized || undefined,
    additionalPhones: blockedPhones,
    memberId: targetMember?.id || existingRec?.memberId,
    fullName: targetMember?.fullName || existingRec?.fullName,
    reason: cleanReason,
    blockedByAdminId: params.admin.id,
    blockedByAdminEmail: params.admin.email,
    blockedAt: nowIso,
    createdAt: existingRec ? existingRec.createdAt : nowIso,
    updatedAt: nowIso,
  };

  if (existingIdx >= 0) {
    list[existingIdx] = record;
  } else {
    list.unshift(record);
  }
  writeJson(BLOCKED_USERS_FILE, list);
  mirrorBlockedUserServer(record);

  // IMMEDIATELY DELETE ALL orders (pending verification, awaiting payment, rejected, etc.) for this blocked user/phone
  const ordersToKeep: MembershipOrder[] = [];
  const deletedOrderIds: string[] = [];
  for (const order of allOrders) {
    const oEmail = normalizeBlockedEmail(order.customerEmail);
    const oPhone = normalizeBlockedPhone(order.customerPhone);
    const belongsToBlocked =
      oEmail === normalizedEmail ||
      matchingMemberIds.has(order.memberId) ||
      (oPhone && phoneSet.has(oPhone));
    if (belongsToBlocked) {
      deletedOrderIds.push(order.id);
      unlinkOrderProofFile(order);
      if (isServerFirestoreEnabled()) {
        void deleteDocFromFirestoreServer('membershipOrders', order.id);
      }
    } else {
      ordersToKeep.push(order);
    }
  }
  if (deletedOrderIds.length > 0) {
    writeJson(ORDERS_FILE, ordersToKeep);
    recordDeletedTombstones({ orderIds: deletedOrderIds });
  }

  // IMMEDIATELY REVOKE/CANCEL any active memberships for the blocked user/phone so they cannot interfere with access or episode broadcasts
  let revokedMembershipsCount = 0;
  const revokedMembershipIds: string[] = [];
  for (let i = 0; i < allMemberships.length; i++) {
    const ms = allMemberships[i];
    const msEmail = normalizeBlockedEmail(ms.customerEmail);
    const msPhone = normalizeBlockedPhone(ms.customerPhone);
    const belongsToBlocked =
      msEmail === normalizedEmail ||
      matchingMemberIds.has(ms.memberId) ||
      (msPhone && phoneSet.has(msPhone));
    if (belongsToBlocked && ms.status === 'active') {
      allMemberships[i] = {
        ...ms,
        status: 'cancelled',
        cancelledAt: nowIso,
        revokedByAdminEmail: params.admin.email,
        revokedReason: `Account permanently blocked: ${cleanReason}`,
      };
      revokedMembershipsCount++;
      revokedMembershipIds.push(ms.id);
      mirrorMembershipServer(allMemberships[i]);
    }
  }
  if (revokedMembershipsCount > 0) {
    writeJson(MEMBERSHIPS_FILE, allMemberships);
  }

  // Immediately revoke any active video playback sessions for all matching member accounts
  for (const mid of matchingMemberIds) {
    revokePlaybackSessionsForMember(mid, `Account permanently blocked: ${cleanReason}`);
  }

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'user_blocked',
    targetId: record.id,
    details: `Permanently blocked email ${normalizedEmail}${primaryRawPhone ? ` and phone ${primaryRawPhone}` : ''}${targetMember ? ` (${targetMember.fullName})` : ''}. Deleted ${deletedOrderIds.length} order(s), revoked ${revokedMembershipsCount} active membership(s). Reason: ${cleanReason}`,
  });

  return {
    success: true,
    blockedUser: record,
    cleanup: {
      deletedPendingOrdersCount: deletedOrderIds.length,
      deletedOrderIds,
      revokedMembershipsCount,
      revokedMembershipIds,
      affectedMemberIds: Array.from(matchingMemberIds),
      blockedPhones,
    },
  };
}

export function unblockUserEmailByAdmin(params: {
  identifier: string;
  admin: SafeAdmin;
}):
  | { success: true; unblockedUser: BlockedUserRecord }
  | { success: false; statusCode: number; error: string } {
  const raw = String(params.identifier || '').trim();
  const normalized = normalizeBlockedEmail(raw);
  if (!raw) {
    return { success: false, statusCode: 400, error: 'Missing blocked user identifier.' };
  }

  const list = readJson<BlockedUserRecord[]>(BLOCKED_USERS_FILE, []);
  const idx = list.findIndex(
    (item) =>
      item.id === raw ||
      normalizeBlockedEmail(item.email) === normalized ||
      (item.memberId && item.memberId === raw)
  );

  if (idx === -1) {
    return { success: false, statusCode: 404, error: 'Blocked user record not found.' };
  }

  const [removed] = list.splice(idx, 1);
  writeJson(BLOCKED_USERS_FILE, list);

  if (isServerFirestoreEnabled()) {
    void deleteDocFromFirestoreServer('blockedUsers', removed.id);
  }

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'user_unblocked',
    targetId: removed.id,
    details: `Unblocked email ${removed.email}${removed.fullName ? ` (${removed.fullName})` : ''} and restored website access.`,
  });

  return { success: true, unblockedUser: removed };
}

// --- EMAIL NOTIFICATION TRACKING ---
export function saveEmailNotificationLog(entry: Omit<EmailNotificationLog, 'id' | 'createdAt' | 'lastAttemptAt'>): EmailNotificationLog {
  const logs = readJson<EmailNotificationLog[]>(EMAIL_NOTIFS_FILE, []);
  const nowIso = new Date().toISOString();
  const record: EmailNotificationLog = {
    ...entry,
    id: `notif-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    createdAt: nowIso,
    lastAttemptAt: nowIso,
  };
  logs.unshift(record);
  if (logs.length > 500) logs.length = 500;
  writeJson(EMAIL_NOTIFS_FILE, logs);
  return record;
}

export function getEmailNotificationById(notifId: string): EmailNotificationLog | null {
  const logs = readJson<EmailNotificationLog[]>(EMAIL_NOTIFS_FILE, []);
  return logs.find((n) => n.id === notifId) || null;
}

export function updateEmailNotificationLog(
  notifId: string,
  updates: { status: 'sent' | 'failed'; provider?: string; error?: string }
): EmailNotificationLog | null {
  const logs = readJson<EmailNotificationLog[]>(EMAIL_NOTIFS_FILE, []);
  const idx = logs.findIndex((n) => n.id === notifId);
  if (idx === -1) return null;
  logs[idx].status = updates.status;
  logs[idx].provider = updates.provider;
  logs[idx].error = updates.error;
  logs[idx].attempts = (logs[idx].attempts || 1) + 1;
  logs[idx].lastAttemptAt = new Date().toISOString();
  writeJson(EMAIL_NOTIFS_FILE, logs);
  return logs[idx];
}

// --- AUTOMATED EXPIRY & RENEWAL REMINDER SCHEDULER ---
function buildReminderEmailHtml(params: {
  customerName: string;
  planName: string;
  dramaNames: string;
  expiresAt: string;
  title: string;
  message: string;
  renewUrl: string;
}): string {
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#F8FAFC;padding:24px;color:#0B0B0D;">
      <div style="max-width:580px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;padding:28px;">
        <div style="font-size:12px;font-weight:700;color:#16A34A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">
          FEVIQO Premium Membership Reminder
        </div>
        <h2 style="margin:0 0 12px 0;font-size:20px;color:#0B0B0D;">
          ${params.title}
        </h2>
        <p style="font-size:14px;color:#475569;line-height:1.6;">
          Hello ${params.customerName}, ${params.message}
        </p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;">
          <tr><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;color:#64748B;">Plan</td><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;font-weight:700;">${params.planName}</td></tr>
          <tr><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;color:#64748B;">Included Dramas</td><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;">${params.dramaNames}</td></tr>
          <tr><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;color:#64748B;">Expiry Timestamp (UTC)</td><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;font-weight:700;">${params.expiresAt}</td></tr>
        </table>
        <a href="${params.renewUrl}" style="display:inline-block;padding:12px 22px;background:#0B0B0D;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:13px;border-radius:10px;">
          Renew Membership &rarr;
        </a>
      </div>
    </div>
  `;
}

export async function runLifecycleReminderCheck(
  triggerSource: SchedulerRunLog['triggerSource'],
  emailDispatcher?: LifecycleEmailDispatcher
): Promise<SchedulerRunLog> {
  const startedMs = Date.now();
  const memberships = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  const memberById = new Map(members.map((m) => [m.id, m]));
  const allNotifs = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);

  let changedSubs = false;
  let expiredCount = 0;
  let remindersCreated = 0;
  let emailsSent = 0;
  let emailsFailed = 0;
  let emailsNotConfigured = 0;
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  const candidateNotifications: Array<{
    notif: CustomerNotification;
    emailType: 'member_renewal_reminder' | 'member_membership_expired';
    dramaNames: string;
    expiresAt: string;
  }> = [];

  for (const sub of memberships) {
    const expMs = Date.parse(sub.expiresAt);
    const dramaNames = getMembershipDramaIds(sub)
      .map((id) => getDramaById(id)?.title || id)
      .join(', ');
    const member = memberById.get(sub.memberId);
    const customerEmail = (sub.customerEmail || member?.email || '').trim();

    if (sub.status === 'active') {
      if (Number.isNaN(expMs) || nowMs >= expMs) {
        sub.status = 'expired';
        changedSubs = true;
        expiredCount += 1;
        mirrorMembershipServer(sub);

        appendHistory({
          memberId: sub.memberId,
          membershipId: sub.id,
          orderId: sub.orderId,
          event: 'membership_expired',
          planId: sub.planId,
          planName: sub.planName,
          selectedDramaIds: sub.selectedDramaIds,
          details: `${sub.planName} membership expired at ${sub.expiresAt}.`,
        });

        const dedupeKey = `${sub.id}:${sub.expiresAt}:membership_expired`;
        const { notification, created } = createCustomerNotificationRecord({
          memberId: sub.memberId,
          ownerUid: sub.ownerUid,
          customerEmail,
          membershipId: sub.id,
          planId: sub.planId,
          dramaIds: sub.selectedDramaIds,
          type: 'membership_expired',
          title: `Your ${sub.planName} membership has expired`,
          titleUr: `آپ کی ${sub.planName} ممبرشپ کی مدت ختم ہو گئی ہے`,
          message: `Premium access for ${dramaNames || sub.planName} ended on ${new Date(sub.expiresAt).toUTCString()}. Renew anytime from My Account without creating a new account.`,
          messageUr: `${dramaNames || sub.planName} کی پریمیم رسائی ختم ہو چکی ہے۔ آپ بغیر نیا اکاؤنٹ بنائے مائی اکاؤنٹ سے رینیو کر سکتے ہیں۔`,
          ctaLabel: 'Renew Membership',
          ctaHref: `/membership?renew=${encodeURIComponent(sub.id)}`,
          dedupeKey,
          emailStatus: 'not_sent',
        });

        if (created) {
          remindersCreated += 1;
          candidateNotifications.push({
            notif: notification,
            emailType: 'member_membership_expired',
            dramaNames,
            expiresAt: sub.expiresAt,
          });
        }
        continue;
      }

      // Active and not expired yet: evaluate milestone window cleanly (no stale historical spam)
      const msLeft = expMs - nowMs;
      const daysLeft = msLeft / (24 * 60 * 60 * 1000);
      const totalPlanDays = Math.max(1, sub.durationDays || Math.round((expMs - Date.parse(sub.activatedAt)) / 86400000));

      let milestone: 'renewal_7d' | 'renewal_3d' | 'renewal_1d' | null = null;
      let title = '';
      let titleUr = '';
      let message = '';
      let messageUr = '';

      if (daysLeft <= 1) {
        milestone = 'renewal_1d';
        const hrs = Math.max(1, Math.ceil(msLeft / (60 * 60 * 1000)));
        title = `Expires in ~${hrs} hour${hrs > 1 ? 's' : ''} — Renew ${sub.planName}`;
        titleUr = `آپ کی ${sub.planName} ممبرشپ تقریباً ${hrs} گھنٹوں میں ختم ہو جائے گی`;
        message = `Your ${sub.planName} access (${dramaNames}) expires within 24 hours (${new Date(sub.expiresAt).toUTCString()}). Renew now to add duration seamlessly onto your current expiry date.`;
        messageUr = `آپ کی ${sub.planName} ممبرشپ اگلے 24 گھنٹوں میں ختم ہو رہی ہے۔ بغیر رکاوٹ کے جاری رکھنے کے لیے ابھی رینیو کریں۔`;
      } else if (daysLeft <= 3 && totalPlanDays >= 4) {
        milestone = 'renewal_3d';
        const d = Math.ceil(daysLeft);
        title = `${d} days left on your ${sub.planName} membership`;
        titleUr = `آپ کی ${sub.planName} ممبرشپ کے صرف ${d} دن باقی ہیں`;
        message = `Your access for ${dramaNames} expires on ${new Date(sub.expiresAt).toUTCString()}. Renew early and your new days will stack onto your remaining time.`;
        messageUr = `آپ کی ${sub.planName} ممبرشپ جلد ختم ہو رہی ہے۔ قبل از وقت رینیو کرنے پر نئے دن موجودہ مدت میں جمع ہو جائیں گے۔`;
      } else if (daysLeft <= 7 && totalPlanDays >= 10) {
        milestone = 'renewal_7d';
        const d = Math.ceil(daysLeft);
        title = `${d} days remaining on ${sub.planName}`;
        titleUr = `آپ کی ${sub.planName} ممبرشپ میں ${d} دن باقی ہیں`;
        message = `Friendly reminder: your ${sub.planName} plan for ${dramaNames} expires in ${d} days (${new Date(sub.expiresAt).toUTCString()}). You can renew early anytime.`;
        messageUr = `یاددہانی: آپ کا ${sub.planName} پلان ${d} دنوں میں ختم ہو جائے گا۔ آپ کسی بھی وقت پیشگی رینیو کر سکتے ہیں۔`;
      }

      if (milestone) {
        const dedupeKey = `${sub.id}:${sub.expiresAt}:${milestone}`;
        if (!allNotifs.some((n) => n.dedupeKey === dedupeKey)) {
          const { notification, created } = createCustomerNotificationRecord({
            memberId: sub.memberId,
            ownerUid: sub.ownerUid,
            customerEmail,
            membershipId: sub.id,
            planId: sub.planId,
            dramaIds: sub.selectedDramaIds,
            type: milestone,
            title,
            titleUr,
            message,
            messageUr,
            ctaLabel: 'Renew Early',
            ctaHref: `/membership?renew=${encodeURIComponent(sub.id)}`,
            dedupeKey,
            emailStatus: 'not_sent',
          });
          if (created) {
            allNotifs.unshift(notification);
            remindersCreated += 1;
            candidateNotifications.push({
              notif: notification,
              emailType: 'member_renewal_reminder',
              dramaNames,
              expiresAt: sub.expiresAt,
            });
          }
        }
      }
    }
  }

  if (changedSubs) {
    writeJson(MEMBERSHIPS_FILE, memberships);
  }

  if (emailDispatcher && candidateNotifications.length > 0) {
    const latestAll = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);
    let notifUpdated = false;
    for (const item of candidateNotifications) {
      const to = item.notif.customerEmail;
      if (!to || !to.includes('@')) continue;
      const memberName = memberById.get(item.notif.memberId)?.fullName || 'FEVIQO Member';
      const baseUrl = process.env.APP_URL || 'https://feviqo.com';
      const renewUrl = `${baseUrl}${item.notif.ctaHref || '/membership?tab=account'}`;
      const html = buildReminderEmailHtml({
        customerName: memberName,
        planName: item.notif.planId ? item.notif.planId.toUpperCase() : 'FEVIQO Premium',
        dramaNames: item.dramaNames || 'Selected Dramas',
        expiresAt: item.expiresAt,
        title: item.notif.title,
        message: item.notif.message,
        renewUrl,
      });

      const res = await emailDispatcher({
        to,
        subject: `FEVIQO: ${item.notif.title}`,
        html,
        type: item.emailType,
        membershipId: item.notif.membershipId,
        customerNotificationId: item.notif.id,
      });

      const nIdx = latestAll.findIndex((n) => n.id === item.notif.id);
      if (nIdx !== -1) {
        if (res.success) {
          latestAll[nIdx].emailStatus = 'sent';
          emailsSent += 1;
        } else if (res.notConfigured) {
          latestAll[nIdx].emailStatus = 'not_configured';
          latestAll[nIdx].emailError = res.error || 'Email transport not configured';
          emailsNotConfigured += 1;
        } else {
          latestAll[nIdx].emailStatus = 'failed';
          latestAll[nIdx].emailError = res.error || res.smtpError || 'Email delivery failed';
          emailsFailed += 1;
        }
        mirrorMemberNotificationServer(latestAll[nIdx]);
        notifUpdated = true;
      }
    }
    if (notifUpdated) {
      writeJson(MEMBER_NOTIFS_FILE, latestAll);
    }
  }

  const runLog: SchedulerRunLog = {
    id: `sched-${nowMs}-${crypto.randomBytes(2).toString('hex')}`,
    triggerSource,
    ranAt: nowIso,
    durationMs: Math.max(1, Date.now() - startedMs),
    checkedMemberships: memberships.length,
    expiredCount,
    remindersCreated,
    emailsSent,
    emailsFailed,
    emailsNotConfigured,
    summary: `Checked ${memberships.length} membership(s): ${expiredCount} expired, ${remindersCreated} notification(s) created (emails sent: ${emailsSent}, not configured: ${emailsNotConfigured}, failed: ${emailsFailed}).`,
  };

  const runs = readJson<SchedulerRunLog[]>(SCHEDULER_RUNS_FILE, []);
  runs.unshift(runLog);
  if (runs.length > 200) runs.length = 200;
  writeJson(SCHEDULER_RUNS_FILE, runs);
  mirrorSchedulerRunServer(runLog);

  return runLog;
}

export function getCustomerNotificationById(notifId: string): CustomerNotification | null {
  const all = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);
  return all.find((n) => n.id === notifId) || null;
}

export function updateCustomerNotificationEmailStatus(
  notifId: string,
  status: CustomerNotification['emailStatus'],
  error?: string
): CustomerNotification | null {
  const all = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);
  const idx = all.findIndex((n) => n.id === notifId);
  if (idx === -1) return null;
  all[idx].emailStatus = status;
  all[idx].emailError = error;
  writeJson(MEMBER_NOTIFS_FILE, all);
  mirrorMemberNotificationServer(all[idx]);
  return all[idx];
}

export function assignMembershipByAdmin(params: {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  planId: string;
  selectedDramaIds: unknown;
  durationDays?: number;
  paymentNote?: string;
  replaceExisting?: boolean;
  admin: SafeAdmin;
}):
  | { success: true; member: SafeMember; order: MembershipOrder; membership: MembershipRecord }
  | { success: false; error: string; statusCode: number } {
  const cleanEmail = (params.email || '').trim().toLowerCase();
  const cleanName = (params.fullName || '').trim();
  const cleanPhone = (params.phone || '').trim();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid customer email address.', statusCode: 400 };
  }

  const validation = validatePlanAndDramas({
    planId: params.planId,
    selectedDramaIds: params.selectedDramaIds,
  });
  if (!('plan' in validation)) {
    return { success: false, error: validation.error, statusCode: 400 };
  }

  const { plan, normalizedDramaIds } = validation;
  const customDays =
    typeof params.durationDays === 'number' && Number.isFinite(params.durationDays) && params.durationDays >= 1
      ? Math.min(3650, Math.round(params.durationDays))
      : plan.durationDays;

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const members = readMembersEnsured();
  let memberIdx = members.findIndex((m) => m.email === cleanEmail);
  let member: MemberRecord;

  if (memberIdx === -1) {
    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Customer Full Name is required for a new member.', statusCode: 400 };
    }
    const takenCodes = new Set<string>(
      members.map((m) => (m.referralCode || '').toUpperCase()).filter(Boolean)
    );
    const rawPass = params.password && params.password.trim().length >= 6
      ? params.password.trim()
      : crypto.randomBytes(16).toString('hex');
    member = {
      id: `mem-${nowMs}-${crypto.randomBytes(3).toString('hex')}`,
      ownerUid: 'admin_assigned',
      authMethod: 'admin_assigned',
      email: cleanEmail,
      fullName: cleanName,
      phone: cleanPhone || '—',
      phoneNormalized: normalizePhoneCanonical(cleanPhone) || undefined,
      passwordHash: hashMemberPassword(rawPass),
      referralCode: generateUniqueReferralCode(cleanName, takenCodes),
      creditBalancePkr: 0,
      creditBalanceUsd: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    members.unshift(member);
    writeJson(MEMBERS_FILE, members);
    appendHistory({
      memberId: member.id,
      event: 'account_created',
      details: `Member account created during admin membership assignment for ${cleanEmail}.`,
    });
  } else {
    member = members[memberIdx];
    let changed = false;
    if (cleanName && cleanName.length >= 2 && member.fullName !== cleanName) {
      member.fullName = cleanName;
      changed = true;
    }
    if (cleanPhone && member.phone !== cleanPhone) {
      member.phone = cleanPhone;
      changed = true;
    }
    if (params.password && params.password.trim().length >= 6) {
      member.passwordHash = hashMemberPassword(params.password.trim());
      changed = true;
    }
    if (changed) {
      member.updatedAt = nowIso;
      members[memberIdx] = member;
      writeJson(MEMBERS_FILE, members);
    }
  }

  const safeMember = sanitizeMember(member);
  const orderId = `ord-assign-${nowMs}-${crypto.randomBytes(3).toString('hex')}`;
  const order: MembershipOrder = {
    id: orderId,
    memberId: member.id,
    ownerUid: member.ownerUid || 'admin_assigned',
    customerName: member.fullName,
    customerEmail: member.email,
    customerPhone: member.phone,
    orderType: 'new',
    planId: plan.id,
    planName: plan.name,
    amountPkr: plan.pricePkr,
    amountUsd: plan.priceUsd,
    expectedAmount: plan.pricePkr,
    currency: 'PKR',
    paymentRegion: 'pakistan',
    paymentMethod: 'admin_assigned',
    durationDays: customDays,
    selectedDramaIds: normalizedDramaIds,
    status: 'approved',
    provider: 'admin_assigned',
    paymentNote: params.paymentNote?.trim() || 'Assigned directly by FEVIQO administrator',
    reviewedByAdminId: params.admin.id,
    reviewedByAdminEmail: params.admin.email,
    reviewedAt: nowIso,
    paidAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const orders = readAllOrders();
  orders.unshift(order);
  writeJson(ORDERS_FILE, orders);

  const memberships = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  if (params.replaceExisting) {
    for (const existing of memberships) {
      if (existing.memberId === member.id && existing.status === 'active') {
        existing.status = 'cancelled';
        existing.cancelledAt = nowIso;
      }
    }
  }

  const expiresAtIso = new Date(nowMs + customDays * 24 * 60 * 60 * 1000).toISOString();
  const newMembership: MembershipRecord = {
    id: `sub-${nowMs}-${crypto.randomBytes(3).toString('hex')}`,
    memberId: member.id,
    ownerUid: member.ownerUid || 'admin_assigned',
    customerName: member.fullName,
    customerEmail: member.email,
    customerPhone: member.phone,
    orderId: order.id,
    planId: plan.id,
    planName: plan.name,
    pricePkr: plan.pricePkr,
    priceUsd: plan.priceUsd,
    durationDays: customDays,
    selectedDramaIds: normalizedDramaIds,
    status: 'active',
    activatedAt: nowIso,
    expiresAt: expiresAtIso,
    approvedByAdminEmail: params.admin.email,
    paymentProvider: 'admin_assigned',
    paymentRegion: 'pakistan',
    paymentMethod: 'admin_assigned',
    currency: 'PKR',
    expectedAmount: plan.pricePkr,
    paymentReference: order.paymentNote || order.id,
    renewalHistory: [],
    createdAt: nowIso,
  };

  memberships.unshift(newMembership);
  writeJson(MEMBERSHIPS_FILE, memberships);
  mirrorMemberServer(safeMember);
  mirrorOrderServer(order);
  mirrorMembershipServer(newMembership);

  appendHistory({
    memberId: member.id,
    membershipId: newMembership.id,
    orderId: order.id,
    event: 'membership_activated',
    planId: plan.id,
    planName: plan.name,
    amountPkr: plan.pricePkr,
    selectedDramaIds: normalizedDramaIds,
    details: `${plan.name} (${customDays} days) assigned directly by administration until ${expiresAtIso}.`,
  });

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'membership_assigned',
    targetId: newMembership.id,
    details: `Assigned ${plan.name} (${customDays} days) to ${member.fullName} (${member.email}). Active until ${expiresAtIso}.`,
  });

  createCustomerNotificationRecord({
    memberId: member.id,
    ownerUid: member.ownerUid || 'admin_assigned',
    customerEmail: member.email,
    membershipId: newMembership.id,
    orderId: order.id,
    planId: plan.id,
    dramaIds: normalizedDramaIds,
    type: 'membership_approved',
    title: `${plan.name} membership assigned`,
    titleUr: `${plan.name} ممبرشپ آپ کے اکاؤنٹ میں فعال کر دی گئی ہے`,
    message: `Your ${plan.name} membership (${customDays} days) is active until ${new Date(expiresAtIso).toUTCString()}.`,
    messageUr: `آپ کی ${plan.name} ممبرشپ (${customDays} دن) فعال کر دی گئی ہے۔`,
    ctaLabel: 'Watch Dramas',
    ctaHref: normalizedDramaIds[0] ? `/${normalizedDramaIds[0]}` : '/dramas',
    dedupeKey: `${order.id}:assigned:${expiresAtIso}`,
    emailStatus: 'not_sent',
  });

  return {
    success: true,
    member: safeMember,
    order,
    membership: newMembership,
  };
}

export function mergeCloudSyncSnapshot(payload: {
  members?: Array<Partial<MemberRecord>>;
  orders?: Array<Partial<MembershipOrder>>;
  memberships?: Array<Partial<MembershipRecord>>;
  history?: Array<Partial<MembershipHistoryEntry>>;
  notifications?: Array<Partial<CustomerNotification>>;
  promoCodes?: Array<Partial<PromoCode>>;
  referrals?: Array<Partial<ReferralRecord>>;
  referralCredits?: Array<Partial<ReferralCreditEntry>>;
  referralCampaigns?: Array<any>;
  referralVisits?: Array<any>;
  referralUniqueVisitors?: Array<any>;
  userCampaignAttributions?: Array<any>;
  orderCampaignAttributions?: Array<any>;
  campaignCommissions?: Array<any>;
  commissionPayments?: Array<any>;
  monthlyCommissionReports?: Array<any>;
  blockedUsers?: Array<Partial<BlockedUserRecord>>;
  config?: Partial<MembershipConfig> | null;
}) {
  const tombstones = readDeletedTombstones();
  const deletedMemberIds = new Set(tombstones.memberIds);
  const deletedOrderIds = new Set(tombstones.orderIds);
  const deletedMembershipIds = new Set(tombstones.membershipIds);
  const deletedHistoryIds = new Set(tombstones.historyIds);
  const deletedNotificationIds = new Set(tombstones.notificationIds);

  // Merge blockedUsers FIRST so blocked emails/phones are known before merging orders
  if (Array.isArray(payload.blockedUsers) && payload.blockedUsers.length > 0) {
    const existingBlocked = readJson<BlockedUserRecord[]>(BLOCKED_USERS_FILE, []);
    const byEmail = new Map(existingBlocked.map((b) => [normalizeBlockedEmail(b.email), b]));
    let changed = false;
    for (const inc of payload.blockedUsers) {
      const email = normalizeBlockedEmail(inc?.email);
      const phoneNorm = normalizeBlockedPhone(inc?.phoneNormalized || inc?.phone);
      const effectiveEmail = email && email.includes('@')
        ? email
        : phoneNorm
        ? `phone-${phoneNorm}@blocked.feviqo.local`
        : '';
      if (!effectiveEmail) continue;
      if (!byEmail.has(effectiveEmail)) {
        const nowIso = new Date().toISOString();
        const rec: BlockedUserRecord = {
          id: inc.id || buildBlockedUserDocId(effectiveEmail),
          email: effectiveEmail,
          phone: inc.phone || (phoneNorm ? `+${phoneNorm}` : undefined),
          phoneNormalized: phoneNorm || undefined,
          additionalPhones: Array.isArray(inc.additionalPhones)
            ? inc.additionalPhones.map((p) => normalizeBlockedPhone(p)).filter(Boolean)
            : phoneNorm
            ? [phoneNorm]
            : [],
          memberId: inc.memberId || undefined,
          fullName: inc.fullName || undefined,
          reason: String(inc.reason || 'Blocked by FEVIQO administrator').slice(0, 500),
          blockedByAdminId: inc.blockedByAdminId || 'admin',
          blockedByAdminEmail: inc.blockedByAdminEmail || 'rexanmedia01@gmail.com',
          blockedAt: inc.blockedAt || inc.createdAt || nowIso,
          createdAt: inc.createdAt || inc.blockedAt || nowIso,
          updatedAt: inc.updatedAt || inc.blockedAt || nowIso,
        };
        existingBlocked.push(rec);
        byEmail.set(effectiveEmail, rec);
        changed = true;
      }
    }
    if (changed) {
      writeJson(BLOCKED_USERS_FILE, existingBlocked);
    }
  }
  ensurePermanentBlockedPhoneEnforcement(true);

  const blockedList = listBlockedUsers();
  const blockedEmailsSet = new Set(
    blockedList
      .map((b) => normalizeBlockedEmail(b.email))
      .filter((e) => e && !e.endsWith('@blocked.feviqo.local'))
  );
  const blockedPhonesSet = new Set<string>();
  const blockedMemberIdsSet = new Set<string>();
  for (const b of blockedList) {
    if (b.memberId) blockedMemberIdsSet.add(b.memberId);
    const p1 = normalizeBlockedPhone(b.phoneNormalized);
    const p2 = normalizeBlockedPhone(b.phone);
    if (p1) blockedPhonesSet.add(p1);
    if (p2) blockedPhonesSet.add(p2);
    for (const ap of b.additionalPhones || []) {
      const np = normalizeBlockedPhone(ap);
      if (np) blockedPhonesSet.add(np);
    }
  }

  const members = readMembersEnsured().filter((m) => !deletedMemberIds.has(m.id));
  const memberById = new Map(members.map((m) => [m.id, m]));
  const memberByEmail = new Map(members.map((m) => [m.email.toLowerCase(), m]));
  const takenCodes = new Set<string>(
    members.map((m) => (m.referralCode || '').toUpperCase()).filter(Boolean)
  );

  for (const incoming of payload.members || []) {
    if (!incoming?.id || !incoming?.email) continue;
    if (deletedMemberIds.has(incoming.id)) continue;
    const emailLower = incoming.email.trim().toLowerCase();
    const existing = memberById.get(incoming.id) || memberByEmail.get(emailLower);
    if (!existing) {
      const code =
        incoming.referralCode && normalizePromoCodeInput(incoming.referralCode).length >= 4
          ? normalizePromoCodeInput(incoming.referralCode)
          : generateUniqueReferralCode(incoming.fullName || emailLower, takenCodes);
      const created: MemberRecord = {
        id: incoming.id,
        ownerUid: incoming.ownerUid,
        email: emailLower,
        fullName: incoming.fullName || 'FEVIQO Member',
        phone: incoming.phone || '',
        phoneNormalized: normalizePhoneCanonical(incoming.phone) || undefined,
        passwordHash: incoming.passwordHash || hashMemberPassword(crypto.randomBytes(16).toString('hex')),
        referralCode: code,
        referredByMemberId: incoming.referredByMemberId || undefined,
        referredByCode: incoming.referredByCode || undefined,
        creditBalancePkr: Number(incoming.creditBalancePkr) || 0,
        creditBalanceUsd: Number(incoming.creditBalanceUsd) || 0,
        createdAt: incoming.createdAt || new Date().toISOString(),
        updatedAt: incoming.updatedAt || new Date().toISOString(),
      };
      members.push(created);
      memberById.set(created.id, created);
      memberByEmail.set(created.email, created);
    } else {
      if (incoming.ownerUid && !existing.ownerUid) {
        existing.ownerUid = incoming.ownerUid;
      }
      if (!existing.referralCode && incoming.referralCode) {
        existing.referralCode = normalizePromoCodeInput(incoming.referralCode);
      }
      // Never overwrite a valid saved phone with empty/invalid value, but fill missing phone if cloud has a valid one
      if ((!existing.phone || !normalizePhoneCanonical(existing.phone)) && incoming.phone && normalizePhoneCanonical(incoming.phone)) {
        existing.phone = incoming.phone.trim();
        existing.phoneNormalized = normalizePhoneCanonical(incoming.phone) || undefined;
      }
    }
  }
  for (const m of members) {
    if (blockedEmailsSet.has(m.email.toLowerCase()) || (m.phone && blockedPhonesSet.has(normalizeBlockedPhone(m.phone)))) {
      blockedMemberIdsSet.add(m.id);
    }
  }
  writeJson(MEMBERS_FILE, members);

  const orders = readAllOrders().filter((o) => {
    if (deletedOrderIds.has(o.id) || deletedMemberIds.has(o.memberId)) return false;
    const oEmail = normalizeBlockedEmail(o.customerEmail);
    const oPhone = normalizeBlockedPhone(o.customerPhone);
    if (
      (oEmail && blockedEmailsSet.has(oEmail)) ||
      (oPhone && blockedPhonesSet.has(oPhone)) ||
      blockedMemberIdsSet.has(o.memberId)
    ) {
      return false;
    }
    return true;
  });
  const orderById = new Map(orders.map((o) => [o.id, o]));
  for (const inc of payload.orders || []) {
    if (!inc?.id || !inc?.memberId || !inc?.planId) continue;
    if (deletedOrderIds.has(inc.id) || deletedMemberIds.has(inc.memberId)) continue;
    const incEmail = normalizeBlockedEmail(inc.customerEmail);
    const incPhone = normalizeBlockedPhone(inc.customerPhone);
    if (
      (incEmail && blockedEmailsSet.has(incEmail)) ||
      (incPhone && blockedPhonesSet.has(incPhone)) ||
      blockedMemberIdsSet.has(inc.memberId)
    ) {
      continue;
    }
    const existing = orderById.get(inc.id);
    if (!existing) {
      const region: PaymentRegion = inc.paymentRegion === 'international' ? 'international' : 'pakistan';
      const created: MembershipOrder = {
        id: inc.id,
        memberId: inc.memberId,
        ownerUid: inc.ownerUid,
        customerName: inc.customerName,
        customerEmail: inc.customerEmail,
        customerPhone: inc.customerPhone,
        orderType: inc.orderType === 'renewal' ? 'renewal' : 'new',
        targetMembershipId: inc.targetMembershipId,
        planId: inc.planId,
        planName: inc.planName || inc.planId,
        amountPkr: Number(inc.amountPkr) || 0,
        amountUsd: inc.amountUsd !== undefined ? Number(inc.amountUsd) : undefined,
        expectedAmount: inc.expectedAmount !== undefined ? Number(inc.expectedAmount) : undefined,
        currency: inc.currency || (region === 'international' ? 'USD' : 'PKR'),
        paymentRegion: region,
        paymentMethod: inc.paymentMethod || (region === 'international' ? 'binance_qr' : 'bank_qr'),
        visitorCountryCode: inc.visitorCountryCode,
        indicativeLocalDisplay: inc.indicativeLocalDisplay,
        durationDays: Number(inc.durationDays) || 15,
        selectedDramaIds: Array.isArray(inc.selectedDramaIds) ? inc.selectedDramaIds : [],
        status: normalizeOrderStatus(inc.status || 'awaiting_payment'),
        provider: inc.provider || 'bank_qr',
        qrImageUrl: inc.qrImageUrl,
        proofFileName: inc.proofFileName,
        proofOriginalName: inc.proofOriginalName,
        proofMimeType: inc.proofMimeType,
        proofDataUrl: inc.proofDataUrl,
        proofSubmittedAt: inc.proofSubmittedAt,
        paymentNote: inc.paymentNote,
        rejectionReason: inc.rejectionReason,
        reviewedByAdminId: inc.reviewedByAdminId,
        reviewedByAdminEmail: inc.reviewedByAdminEmail,
        reviewedAt: inc.reviewedAt,
        paidAt: inc.paidAt,
        createdAt: inc.createdAt || new Date().toISOString(),
        updatedAt: inc.updatedAt || new Date().toISOString(),
      };
      orders.push(created);
      orderById.set(created.id, created);
    } else {
      const incUpdated = Date.parse(inc.updatedAt || '') || 0;
      const extUpdated = Date.parse(existing.updatedAt || '') || 0;
      if (incUpdated > extUpdated) {
        const merged: MembershipOrder = {
          ...existing,
          ...inc,
          status: normalizeOrderStatus(inc.status || existing.status),
          proofDataUrl: inc.proofDataUrl || existing.proofDataUrl,
        };
        orderById.set(existing.id, merged);
      } else if (!existing.proofDataUrl && inc.proofDataUrl) {
        existing.proofDataUrl = inc.proofDataUrl;
      }
    }
  }
  writeJson(
    ORDERS_FILE,
    Array.from(orderById.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  );

  const memberships = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []).filter(
    (s) => !deletedMembershipIds.has(s.id) && !deletedMemberIds.has(s.memberId)
  );
  const subById = new Map(memberships.map((s) => [s.id, s]));
  for (const inc of payload.memberships || []) {
    if (!inc?.id || !inc?.memberId || !inc?.planId) continue;
    if (deletedMembershipIds.has(inc.id) || deletedMemberIds.has(inc.memberId)) continue;
    const existing = subById.get(inc.id);
    if (!existing) {
      const created: MembershipRecord = {
        id: inc.id,
        memberId: inc.memberId,
        ownerUid: inc.ownerUid,
        customerName: inc.customerName,
        customerEmail: inc.customerEmail,
        customerPhone: inc.customerPhone,
        orderId: inc.orderId || inc.id,
        planId: inc.planId,
        planName: inc.planName || inc.planId,
        pricePkr: Number(inc.pricePkr) || 0,
        priceUsd: inc.priceUsd !== undefined ? Number(inc.priceUsd) : undefined,
        durationDays: Number(inc.durationDays) || 15,
        selectedDramaIds: Array.isArray(inc.selectedDramaIds) ? inc.selectedDramaIds : [],
        status: inc.status || 'active',
        activatedAt: inc.activatedAt || new Date().toISOString(),
        expiresAt: inc.expiresAt || new Date().toISOString(),
        cancelledAt: inc.cancelledAt,
        revokedByAdminEmail: inc.revokedByAdminEmail,
        revokedReason: inc.revokedReason,
        approvedByAdminEmail: inc.approvedByAdminEmail,
        paymentProvider: inc.paymentProvider || 'bank_qr',
        paymentRegion: inc.paymentRegion,
        paymentMethod: inc.paymentMethod,
        currency: inc.currency,
        expectedAmount: inc.expectedAmount,
        paymentReference: inc.paymentReference || '',
        renewalHistory: Array.isArray(inc.renewalHistory) ? inc.renewalHistory : [],
        lastExtendedAt: inc.lastExtendedAt,
        createdAt: inc.createdAt || new Date().toISOString(),
      };
      subById.set(created.id, created);
    } else {
      const incExp = Date.parse(inc.expiresAt || '') || 0;
      const extExp = Date.parse(existing.expiresAt || '') || 0;
      if (incExp > extExp || (inc.status && existing.status === 'active' && inc.status !== 'active')) {
        subById.set(existing.id, { ...existing, ...inc });
      }
    }
  }
  writeJson(
    MEMBERSHIPS_FILE,
    Array.from(subById.values()).sort((a, b) => Date.parse(b.activatedAt) - Date.parse(a.activatedAt))
  );

  const history = readJson<MembershipHistoryEntry[]>(HISTORY_FILE, []).filter(
    (h) => !deletedHistoryIds.has(h.id) && !deletedMemberIds.has(h.memberId)
  );
  const histById = new Map(history.map((h) => [h.id, h]));
  for (const inc of payload.history || []) {
    if (!inc?.id || !inc?.memberId || !inc?.details) continue;
    if (deletedHistoryIds.has(inc.id) || deletedMemberIds.has(inc.memberId)) continue;
    if (!histById.has(inc.id)) {
      histById.set(inc.id, {
        id: inc.id,
        memberId: inc.memberId,
        membershipId: inc.membershipId,
        orderId: inc.orderId,
        event: (inc.event as any) || 'membership_activated',
        planId: inc.planId,
        planName: inc.planName,
        amountPkr: inc.amountPkr,
        amountUsd: inc.amountUsd,
        currency: inc.currency,
        selectedDramaIds: inc.selectedDramaIds,
        details: inc.details,
        createdAt: inc.createdAt || new Date().toISOString(),
      });
    }
  }
  writeJson(
    HISTORY_FILE,
    Array.from(histById.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  );

  if (payload.notifications) {
    const notifs = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []).filter(
      (n) => !deletedNotificationIds.has(n.id) && !deletedMemberIds.has(n.memberId)
    );
    const notifById = new Map(notifs.map((n) => [n.id, n]));
    for (const inc of payload.notifications) {
      if (!inc?.id || !inc?.memberId || !inc?.dedupeKey) continue;
      if (deletedNotificationIds.has(inc.id) || deletedMemberIds.has(inc.memberId)) continue;
      if (!notifById.has(inc.id)) {
        notifById.set(inc.id, inc as CustomerNotification);
      }
    }
    writeJson(
      MEMBER_NOTIFS_FILE,
      Array.from(notifById.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    );
  }

  if (payload.promoCodes && payload.promoCodes.length > 0) {
    const promos = readAllPromoCodes();
    const promoById = new Map(promos.map((p) => [p.id, p]));
    for (const inc of payload.promoCodes) {
      if (!inc?.id || !inc?.code) continue;
      if (!promoById.has(inc.id)) {
        promoById.set(inc.id, inc as PromoCode);
      }
    }
    writeJson(PROMO_CODES_FILE, Array.from(promoById.values()));
  }

  if (payload.referrals && payload.referrals.length > 0) {
    const refs = readJson<ReferralRecord[]>(REFERRALS_FILE, []);
    const refById = new Map(refs.map((r) => [r.id, r]));
    for (const inc of payload.referrals) {
      if (!inc?.id || !inc?.referredMemberId || !inc?.referrerMemberId) continue;
      if (!refById.has(inc.id)) {
        refById.set(inc.id, inc as ReferralRecord);
      }
    }
    writeJson(REFERRALS_FILE, Array.from(refById.values()));
  }

  if (payload.referralCredits && payload.referralCredits.length > 0) {
    const credits = readJson<ReferralCreditEntry[]>(CREDIT_LEDGER_FILE, []);
    const credById = new Map(credits.map((c) => [c.id, c]));
    for (const inc of payload.referralCredits) {
      if (!inc?.id || !inc?.memberId) continue;
      if (!credById.has(inc.id)) {
        credById.set(inc.id, inc as ReferralCreditEntry);
      }
    }
    writeJson(CREDIT_LEDGER_FILE, Array.from(credById.values()));
  }

  if (payload.config && payload.config.updatedAt) {
    const current = getMembershipConfig();
    if (Date.parse(payload.config.updatedAt) > Date.parse(current.updatedAt || '')) {
      writeJson(CONFIG_FILE, {
        ...current,
        ...payload.config,
        referralConfig: sanitizeReferralConfig(payload.config.referralConfig, current.referralConfig),
      });
    }
  }

  mergeCampaignCloudSnapshot({
    referralCampaigns: payload.referralCampaigns,
    referralVisits: payload.referralVisits,
    referralUniqueVisitors: payload.referralUniqueVisitors,
    userCampaignAttributions: payload.userCampaignAttributions,
    orderCampaignAttributions: payload.orderCampaignAttributions,
    campaignCommissions: payload.campaignCommissions,
    commissionPayments: payload.commissionPayments,
    monthlyCommissionReports: payload.monthlyCommissionReports,
  });

  const recovery = reconcileAndRecoverMissingMemberships();
  ensurePermanentBlockedPhoneEnforcement(true);
  return {
    ...getAdminMembershipsOverview(),
    lastRecovery: recovery,
    tombstones: readDeletedTombstones(),
  };
}

export interface RecoveredMembershipSummary {
  membershipId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  planId: MembershipPlanId;
  planName: string;
  status: MembershipStatus;
  activatedAt: string;
  expiresAt: string;
  source: 'approved_order' | 'history_entry' | 'customer_notification' | 'renewal_reapplied';
}

export interface PendingBigPlanOrderDiagnostic {
  orderId: string;
  customerName: string;
  customerEmail: string;
  planId: MembershipPlanId;
  planName: string;
  status: string;
  amountPkr: number;
  amountUsd?: number;
  currency: PaymentCurrency;
  createdAt: string;
}

export interface MembershipRecoveryReport {
  recoveredCount: number;
  recoveredActiveCount: number;
  relinkedMembersCount: number;
  recoveredMemberships: RecoveredMembershipSummary[];
  pendingBigPlanOrders: PendingBigPlanOrderDiagnostic[];
  totalActiveMemberships: number;
  totalMemberships: number;
  totalOrders: number;
  totalMembers: number;
}

function parseIsoOrUtcDateFromText(text?: string): string | null {
  if (!text) return null;
  const isoMatch = text.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)/);
  if (isoMatch) {
    const ms = Date.parse(isoMatch[1]);
    if (!Number.isNaN(ms)) return new Date(ms).toISOString();
  }
  const utcMatch = text.match(/until\s+([A-Z][a-z]{2},\s+\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4}\s+\d{2}:\d{2}:\d{2}\s+GMT)/i);
  if (utcMatch) {
    const ms = Date.parse(utcMatch[1]);
    if (!Number.isNaN(ms)) return new Date(ms).toISOString();
  }
  return null;
}

function inferPlanIdFromText(rawPlanId?: string, text?: string): MembershipPlanId {
  const lower = String(rawPlanId || '').trim().toLowerCase();
  if (lower === 'vip' || lower === 'plus' || lower === 'standard' || lower === 'starter') {
    return lower;
  }
  const blob = String(text || '').toLowerCase();
  if (blob.includes('vip')) return 'vip';
  if (blob.includes('plus')) return 'plus';
  if (blob.includes('standard')) return 'standard';
  return 'starter';
}

export function reconcileAndRecoverMissingMemberships(): MembershipRecoveryReport {
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const resolvedPlans = getResolvedPlans();
  const planById = new Map(resolvedPlans.map((p) => [p.id, p]));
  const vipDramaIds = MEMBERSHIP_DRAMAS.slice(0, 3).map((d) => d.id);

  const members = readMembersEnsured();
  const memberById = new Map(members.map((m) => [m.id, m]));
  const memberByEmail = new Map(members.map((m) => [m.email.toLowerCase(), m]));
  const takenCodes = new Set<string>(
    members.map((m) => (m.referralCode || '').toUpperCase()).filter(Boolean)
  );
  let membersChanged = false;
  let relinkedMembersCount = 0;

  const ensureMemberExists = (info: {
    memberId?: string;
    ownerUid?: string;
    email?: string;
    fullName?: string;
    phone?: string;
    createdAt?: string;
  }): MemberRecord | null => {
    const cleanEmail = String(info.email || '').trim().toLowerCase();
    const byId = info.memberId ? memberById.get(info.memberId) : undefined;
    if (byId) return byId;
    const byEmail = cleanEmail && cleanEmail.includes('@') ? memberByEmail.get(cleanEmail) : undefined;
    if (byEmail) {
      if (info.memberId && !memberById.has(info.memberId)) {
        memberById.set(info.memberId, byEmail);
      }
      return byEmail;
    }
    if (!info.memberId && (!cleanEmail || !cleanEmail.includes('@'))) return null;
    const id = info.memberId || `mem-rec-${crypto.randomBytes(4).toString('hex')}`;
    const email = cleanEmail && cleanEmail.includes('@') ? cleanEmail : `${id}@member.feviqo.com`;
    const fullName = String(info.fullName || '').trim() || email.split('@')[0] || 'FEVIQO Member';
    const created: MemberRecord = {
      id,
      ownerUid: info.ownerUid || 'admin_assigned',
      email,
      fullName,
      phone: String(info.phone || '').trim(),
      phoneNormalized: normalizePhoneCanonical(info.phone) || undefined,
      passwordHash: hashMemberPassword(crypto.randomBytes(16).toString('hex')),
      referralCode: generateUniqueReferralCode(fullName, takenCodes),
      creditBalancePkr: 0,
      creditBalanceUsd: 0,
      createdAt: info.createdAt || nowIso,
      updatedAt: nowIso,
    };
    members.push(created);
    memberById.set(created.id, created);
    memberByEmail.set(created.email, created);
    membersChanged = true;
    relinkedMembersCount += 1;
    return created;
  };

  const orders = readAllOrders();
  const memberships = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const history = readJson<MembershipHistoryEntry[]>(HISTORY_FILE, []);
  const notifications = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);

  // Ensure every order & existing membership has a linked member record
  for (const ord of orders) {
    ensureMemberExists({
      memberId: ord.memberId,
      ownerUid: ord.ownerUid,
      email: ord.customerEmail,
      fullName: ord.customerName,
      phone: ord.customerPhone,
      createdAt: ord.createdAt,
    });
  }
  for (const sub of memberships) {
    const linked = ensureMemberExists({
      memberId: sub.memberId,
      ownerUid: sub.ownerUid,
      email: sub.customerEmail,
      fullName: sub.customerName,
      phone: sub.customerPhone,
      createdAt: sub.createdAt,
    });
    if (linked) {
      if (!sub.customerEmail && linked.email) sub.customerEmail = linked.email;
      if (!sub.customerName && linked.fullName) sub.customerName = linked.fullName;
      if (!sub.customerPhone && linked.phone) sub.customerPhone = linked.phone;
    }
  }

  // Track explicitly deleted or revoked membershipIds/orderIds/memberIds so we never resurrect intentional deletions
  const tombstones = readDeletedTombstones();
  const intentionallyRemovedMembershipIds = new Set<string>(tombstones.membershipIds);
  const intentionallyRemovedOrderIds = new Set<string>(tombstones.orderIds);
  const intentionallyRemovedMemberIds = new Set<string>(tombstones.memberIds);
  const originalMembershipIdByOrderId = new Map<string, string>();

  for (const h of history) {
    if (h.orderId && h.membershipId && !originalMembershipIdByOrderId.has(h.orderId)) {
      originalMembershipIdByOrderId.set(h.orderId, h.membershipId);
    }
    const ev = String(h.event || '').toLowerCase();
    if (ev.includes('deleted') || ev.includes('revoked') || ev.includes('cancelled')) {
      if (h.membershipId) intentionallyRemovedMembershipIds.add(h.membershipId);
      if (h.orderId) intentionallyRemovedOrderIds.add(h.orderId);
    }
  }
  for (const n of notifications) {
    if (n.orderId && n.membershipId && !originalMembershipIdByOrderId.has(n.orderId)) {
      originalMembershipIdByOrderId.set(n.orderId, n.membershipId);
    }
  }

  // Also ensure we never reconstruct memberships for blocked users or deleted members
  for (const sub of memberships) {
    if (sub.status === 'cancelled' && sub.orderId) {
      intentionallyRemovedOrderIds.add(sub.orderId);
    }
  }
  for (const ord of orders) {
    if (
      intentionallyRemovedMemberIds.has(ord.memberId) ||
      isEmailBlocked(ord.customerEmail) ||
      isPhoneBlocked(ord.customerPhone)
    ) {
      intentionallyRemovedOrderIds.add(ord.id);
    }
  }

  const subById = new Map(memberships.map((s) => [s.id, s]));
  const coveredOrderIds = new Set<string>();
  for (const sub of memberships) {
    if (sub.orderId) coveredOrderIds.add(sub.orderId);
    for (const r of sub.renewalHistory || []) {
      if (r?.orderId) coveredOrderIds.add(r.orderId);
    }
  }

  const recoveredMemberships: RecoveredMembershipSummary[] = [];
  let membershipsChanged = false;

  // Step 1: Reconstruct missing memberships from ALL approved orders (oldest -> newest)
  const approvedOrdersChrono = [...orders]
    .filter((o) => o.status === 'approved')
    .sort((a, b) => {
      const ta = Date.parse(a.paidAt || a.reviewedAt || a.updatedAt || a.createdAt || '') || 0;
      const tb = Date.parse(b.paidAt || b.reviewedAt || b.updatedAt || b.createdAt || '') || 0;
      return ta - tb;
    });

  for (const ord of approvedOrdersChrono) {
    if (coveredOrderIds.has(ord.id)) continue;
    if (intentionallyRemovedOrderIds.has(ord.id)) continue;

    const linkedMember =
      memberById.get(ord.memberId) ||
      (ord.customerEmail ? memberByEmail.get(ord.customerEmail.toLowerCase()) : undefined);
    const plan = planById.get(ord.planId) || getPlanById(ord.planId) || resolvedPlans[0];
    const durationDays = Math.max(1, Number(ord.durationDays) || plan.durationDays || 30);
    const durationMs = durationDays * 24 * 60 * 60 * 1000;
    const activatedIso = ord.paidAt || ord.reviewedAt || ord.updatedAt || ord.createdAt || nowIso;
    const activatedMs = Date.parse(activatedIso) || nowMs;
    const selectedDramaIds =
      Array.isArray(ord.selectedDramaIds) && ord.selectedDramaIds.length > 0
        ? ord.planId === 'vip'
          ? ord.selectedDramaIds.slice(0, 3)
          : ord.selectedDramaIds
        : ord.planId === 'vip'
          ? vipDramaIds
          : ['teskilat'];

    // If this was a renewal order targeting an existing membership, re-apply extension
    if (ord.orderType === 'renewal' && ord.targetMembershipId && subById.has(ord.targetMembershipId)) {
      const target = subById.get(ord.targetMembershipId)!;
      const prevExpMs = Date.parse(target.expiresAt) || activatedMs;
      const baseMs = prevExpMs > activatedMs ? prevExpMs : activatedMs;
      const newExpIso = new Date(baseMs + durationMs).toISOString();
      target.expiresAt = newExpIso;
      target.status = Date.parse(newExpIso) > nowMs ? 'active' : 'expired';
      target.orderId = ord.id;
      target.planId = plan.id;
      target.planName = plan.name;
      target.selectedDramaIds = selectedDramaIds;
      target.renewalHistory = [
        ...(target.renewalHistory || []),
        {
          id: `ren-rec-${ord.id}`,
          orderId: ord.id,
          renewedAt: activatedIso,
          previousExpiresAt: new Date(prevExpMs).toISOString(),
          newExpiresAt: newExpIso,
          addedDays: durationDays,
          planId: plan.id,
          planName: plan.name,
          paymentMethod: ord.paymentMethod || 'bank_qr',
          currency: ord.currency || 'PKR',
          amount: ord.currency === 'USD' ? Number(ord.amountUsd ?? plan.priceUsd) : Number(ord.amountPkr ?? plan.pricePkr),
          approvedByAdminEmail: ord.reviewedByAdminEmail || 'rexanmedia01@gmail.com',
          note: 'Recovered renewal from verified approved order',
        },
      ];
      coveredOrderIds.add(ord.id);
      membershipsChanged = true;
      mirrorMembershipServer(target);
      recoveredMemberships.push({
        membershipId: target.id,
        orderId: ord.id,
        customerName: target.customerName || linkedMember?.fullName || ord.customerName || 'FEVIQO Member',
        customerEmail: target.customerEmail || linkedMember?.email || ord.customerEmail || '',
        planId: plan.id,
        planName: plan.name,
        status: target.status,
        activatedAt: target.activatedAt,
        expiresAt: target.expiresAt,
        source: 'renewal_reapplied',
      });
      continue;
    }

    const preferredId = originalMembershipIdByOrderId.get(ord.id);
    if (preferredId && intentionallyRemovedMembershipIds.has(preferredId)) continue;
    const recoveredId =
      preferredId && !subById.has(preferredId)
        ? preferredId
        : `sub-rec-${ord.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 96)}`;
    if (subById.has(recoveredId)) {
      coveredOrderIds.add(ord.id);
      continue;
    }

    const expiresAtIso = new Date(activatedMs + durationMs).toISOString();
    const status: MembershipStatus = Date.parse(expiresAtIso) > nowMs ? 'active' : 'expired';
    const paymentCurrency: PaymentCurrency = ord.currency === 'USD' ? 'USD' : 'PKR';
    const paymentRegion: PaymentRegion = ord.paymentRegion === 'international' ? 'international' : 'pakistan';
    const paymentMethod: PaymentMethod = ord.paymentMethod || (paymentRegion === 'international' ? 'binance_qr' : 'bank_qr');

    const rebuilt: MembershipRecord = {
      id: recoveredId,
      memberId: linkedMember?.id || ord.memberId,
      ownerUid: ord.ownerUid || linkedMember?.ownerUid || 'admin_assigned',
      customerName: ord.customerName || linkedMember?.fullName || 'FEVIQO Member',
      customerEmail: ord.customerEmail || linkedMember?.email || '',
      customerPhone: ord.customerPhone || linkedMember?.phone || '',
      orderId: ord.id,
      planId: plan.id,
      planName: ord.planName || plan.name,
      pricePkr: Number(ord.amountPkr ?? plan.pricePkr) || 0,
      priceUsd: ord.amountUsd ?? plan.priceUsd,
      originalAmountPkr: ord.originalAmountPkr ?? plan.pricePkr,
      originalAmountUsd: ord.originalAmountUsd ?? plan.priceUsd,
      promoCode: ord.promoCode,
      promoDiscountPkr: ord.promoDiscountPkr,
      promoDiscountUsd: ord.promoDiscountUsd,
      referralDiscountPkr: ord.referralDiscountPkr,
      referralDiscountUsd: ord.referralDiscountUsd,
      creditsUsedPkr: ord.creditsUsedPkr,
      creditsUsedUsd: ord.creditsUsedUsd,
      discountTotalPkr: ord.discountTotalPkr,
      discountTotalUsd: ord.discountTotalUsd,
      durationDays,
      selectedDramaIds,
      status,
      activatedAt: activatedIso,
      expiresAt: expiresAtIso,
      approvedByAdminEmail: ord.reviewedByAdminEmail || 'rexanmedia01@gmail.com',
      paymentProvider: ord.provider || paymentMethod,
      paymentRegion,
      paymentMethod,
      currency: paymentCurrency,
      expectedAmount:
        ord.expectedAmount ?? (paymentCurrency === 'USD' ? Number(ord.amountUsd ?? plan.priceUsd) : Number(ord.amountPkr ?? plan.pricePkr)),
      paymentReference: ord.paymentNote || ord.id,
      renewalHistory: [],
      createdAt: activatedIso,
    };

    memberships.unshift(rebuilt);
    subById.set(rebuilt.id, rebuilt);
    coveredOrderIds.add(ord.id);
    membershipsChanged = true;
    mirrorMembershipServer(rebuilt);

    recoveredMemberships.push({
      membershipId: rebuilt.id,
      orderId: rebuilt.orderId,
      customerName: rebuilt.customerName || 'FEVIQO Member',
      customerEmail: rebuilt.customerEmail || '',
      planId: rebuilt.planId,
      planName: rebuilt.planName,
      status: rebuilt.status,
      activatedAt: rebuilt.activatedAt,
      expiresAt: rebuilt.expiresAt,
      source: 'approved_order',
    });
  }

  // Step 2: Reconstruct any remaining missing memberships evidenced by membershipHistory
  const orderById = new Map(orders.map((o) => [o.id, o]));
  const recoveryHistoryEvents = new Set([
    'payment_approved',
    'membership_activated',
    'membership_renewed',
    'membership_extended',
    'membership_assigned',
  ]);
  for (const h of history) {
    if (!recoveryHistoryEvents.has(h.event)) continue;
    const subId = h.membershipId;
    if (!subId || subById.has(subId) || intentionallyRemovedMembershipIds.has(subId)) continue;
    if (h.orderId && (coveredOrderIds.has(h.orderId) || intentionallyRemovedOrderIds.has(h.orderId))) continue;

    const linkedOrder = h.orderId ? orderById.get(h.orderId) : undefined;
    const linkedMember = memberById.get(h.memberId);
    const planId = inferPlanIdFromText(h.planId || linkedOrder?.planId, `${h.planName || ''} ${h.details || ''}`);
    const plan = planById.get(planId) || getPlanById(planId) || resolvedPlans[0];
    const durationDays = Math.max(1, Number(linkedOrder?.durationDays) || plan.durationDays || 30);
    const activatedIso = h.createdAt || linkedOrder?.paidAt || nowIso;
    const activatedMs = Date.parse(activatedIso) || nowMs;
    const parsedExp = parseIsoOrUtcDateFromText(h.details);
    const expiresAtIso = parsedExp || new Date(activatedMs + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const status: MembershipStatus = Date.parse(expiresAtIso) > nowMs ? 'active' : 'expired';
    const selectedDramaIds =
      Array.isArray(h.selectedDramaIds) && h.selectedDramaIds.length > 0
        ? planId === 'vip'
          ? h.selectedDramaIds.slice(0, 3)
          : h.selectedDramaIds
        : Array.isArray(linkedOrder?.selectedDramaIds) && linkedOrder.selectedDramaIds.length > 0
          ? planId === 'vip'
            ? linkedOrder.selectedDramaIds.slice(0, 3)
            : linkedOrder.selectedDramaIds
          : planId === 'vip'
            ? vipDramaIds
            : ['teskilat'];

    const rebuilt: MembershipRecord = {
      id: subId,
      memberId: linkedMember?.id || h.memberId,
      ownerUid: linkedOrder?.ownerUid || linkedMember?.ownerUid || 'admin_assigned',
      customerName: linkedOrder?.customerName || linkedMember?.fullName || 'FEVIQO Member',
      customerEmail: linkedOrder?.customerEmail || linkedMember?.email || '',
      customerPhone: linkedOrder?.customerPhone || linkedMember?.phone || '',
      orderId: h.orderId || `ord-rec-${subId}`,
      planId: plan.id,
      planName: h.planName || plan.name,
      pricePkr: Number(h.amountPkr ?? linkedOrder?.amountPkr ?? plan.pricePkr) || 0,
      priceUsd: h.amountUsd ?? linkedOrder?.amountUsd ?? plan.priceUsd,
      durationDays,
      selectedDramaIds,
      status,
      activatedAt: activatedIso,
      expiresAt: expiresAtIso,
      approvedByAdminEmail: linkedOrder?.reviewedByAdminEmail || 'rexanmedia01@gmail.com',
      paymentProvider: linkedOrder?.provider || 'bank_qr',
      paymentRegion: linkedOrder?.paymentRegion || 'pakistan',
      paymentMethod: linkedOrder?.paymentMethod || 'bank_qr',
      currency: h.currency || linkedOrder?.currency || 'PKR',
      expectedAmount:
        linkedOrder?.expectedAmount ?? (h.currency === 'USD' ? Number(h.amountUsd ?? plan.priceUsd) : Number(h.amountPkr ?? plan.pricePkr)),
      paymentReference: h.orderId || subId,
      renewalHistory: [],
      createdAt: activatedIso,
    };

    memberships.unshift(rebuilt);
    subById.set(rebuilt.id, rebuilt);
    if (h.orderId) coveredOrderIds.add(h.orderId);
    membershipsChanged = true;
    mirrorMembershipServer(rebuilt);

    recoveredMemberships.push({
      membershipId: rebuilt.id,
      orderId: rebuilt.orderId,
      customerName: rebuilt.customerName || 'FEVIQO Member',
      customerEmail: rebuilt.customerEmail || '',
      planId: rebuilt.planId,
      planName: rebuilt.planName,
      status: rebuilt.status,
      activatedAt: rebuilt.activatedAt,
      expiresAt: rebuilt.expiresAt,
      source: 'history_entry',
    });
  }

  // Step 3: Reconstruct any remaining missing memberships evidenced by customer notifications
  const recoveryNotifTypes = new Set(['membership_approved', 'membership_renewed', 'membership_extended']);
  for (const n of notifications) {
    if (!recoveryNotifTypes.has(n.type)) continue;
    const subId = n.membershipId;
    if (!subId || subById.has(subId) || intentionallyRemovedMembershipIds.has(subId)) continue;
    if (n.orderId && (coveredOrderIds.has(n.orderId) || intentionallyRemovedOrderIds.has(n.orderId))) continue;

    const linkedOrder = n.orderId ? orderById.get(n.orderId) : undefined;
    const linkedMember =
      memberById.get(n.memberId) ||
      (n.customerEmail ? memberByEmail.get(n.customerEmail.toLowerCase()) : undefined);
    const planId = inferPlanIdFromText(n.planId || linkedOrder?.planId, `${n.title || ''} ${n.message || ''}`);
    const plan = planById.get(planId) || getPlanById(planId) || resolvedPlans[0];
    const durationDays = Math.max(1, Number(linkedOrder?.durationDays) || plan.durationDays || 30);
    const activatedIso = n.createdAt || nowIso;
    const activatedMs = Date.parse(activatedIso) || nowMs;
    const parsedExp = parseIsoOrUtcDateFromText(n.message) || parseIsoOrUtcDateFromText(n.dedupeKey);
    const expiresAtIso = parsedExp || new Date(activatedMs + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const status: MembershipStatus = Date.parse(expiresAtIso) > nowMs ? 'active' : 'expired';
    const selectedDramaIds =
      Array.isArray(n.dramaIds) && n.dramaIds.length > 0
        ? planId === 'vip'
          ? n.dramaIds.slice(0, 3)
          : n.dramaIds
        : planId === 'vip'
          ? vipDramaIds
          : ['teskilat'];

    const rebuilt: MembershipRecord = {
      id: subId,
      memberId: linkedMember?.id || n.memberId,
      ownerUid: n.ownerUid || linkedMember?.ownerUid || 'admin_assigned',
      customerName: linkedOrder?.customerName || linkedMember?.fullName || 'FEVIQO Member',
      customerEmail: n.customerEmail || linkedOrder?.customerEmail || linkedMember?.email || '',
      customerPhone: linkedOrder?.customerPhone || linkedMember?.phone || '',
      orderId: n.orderId || `ord-rec-${subId}`,
      planId: plan.id,
      planName: plan.name,
      pricePkr: Number(linkedOrder?.amountPkr ?? plan.pricePkr) || 0,
      priceUsd: linkedOrder?.amountUsd ?? plan.priceUsd,
      durationDays,
      selectedDramaIds,
      status,
      activatedAt: activatedIso,
      expiresAt: expiresAtIso,
      approvedByAdminEmail: linkedOrder?.reviewedByAdminEmail || 'rexanmedia01@gmail.com',
      paymentProvider: linkedOrder?.provider || 'bank_qr',
      paymentRegion: linkedOrder?.paymentRegion || 'pakistan',
      paymentMethod: linkedOrder?.paymentMethod || 'bank_qr',
      currency: linkedOrder?.currency || 'PKR',
      expectedAmount: linkedOrder?.expectedAmount ?? plan.pricePkr,
      paymentReference: n.orderId || subId,
      renewalHistory: [],
      createdAt: activatedIso,
    };

    memberships.unshift(rebuilt);
    subById.set(rebuilt.id, rebuilt);
    if (n.orderId) coveredOrderIds.add(n.orderId);
    membershipsChanged = true;
    mirrorMembershipServer(rebuilt);

    recoveredMemberships.push({
      membershipId: rebuilt.id,
      orderId: rebuilt.orderId,
      customerName: rebuilt.customerName || 'FEVIQO Member',
      customerEmail: rebuilt.customerEmail || '',
      planId: rebuilt.planId,
      planName: rebuilt.planName,
      status: rebuilt.status,
      activatedAt: rebuilt.activatedAt,
      expiresAt: rebuilt.expiresAt,
      source: 'customer_notification',
    });
  }

  if (membersChanged) {
    writeJson(MEMBERS_FILE, members);
  }
  if (membershipsChanged) {
    writeJson(
      MEMBERSHIPS_FILE,
      Array.from(subById.values()).sort((a, b) => Date.parse(b.activatedAt) - Date.parse(a.activatedAt))
    );
  }

  const syncedSubs = syncMemberSubscriptions();
  const pendingBigPlanOrders: PendingBigPlanOrderDiagnostic[] = orders
    .filter(
      (o) =>
        (o.planId === 'vip' || o.planId === 'plus') &&
        (o.status === 'pending_verification' || o.status === 'awaiting_payment')
    )
    .map((o) => {
      const m = memberById.get(o.memberId);
      return {
        orderId: o.id,
        customerName: o.customerName || m?.fullName || 'Unknown',
        customerEmail: o.customerEmail || m?.email || 'Unknown',
        planId: o.planId,
        planName: o.planName || o.planId,
        status: o.status,
        amountPkr: Number(o.amountPkr) || 0,
        amountUsd: o.amountUsd,
        currency: o.currency || 'PKR',
        createdAt: o.createdAt,
      };
    });

  return {
    recoveredCount: recoveredMemberships.length,
    recoveredActiveCount: recoveredMemberships.filter((r) => r.status === 'active').length,
    relinkedMembersCount,
    recoveredMemberships,
    pendingBigPlanOrders,
    totalActiveMemberships: syncedSubs.filter((s) => s.status === 'active').length,
    totalMemberships: syncedSubs.length,
    totalOrders: orders.length,
    totalMembers: members.length,
  };
}

// --- ADMIN OVERVIEW DASHBOARD DATA ---
export function getAdminMembershipsOverview() {
  const members = readMembersEnsured().map(sanitizeMember);
  const memberById = new Map(members.map((m) => [m.id, m]));
  const memberships = syncMemberSubscriptions();
  const orders = readAllOrders()
    .map((o) => {
      const m = memberById.get(o.memberId);
      const targetSub = o.targetMembershipId
        ? memberships.find((s) => s.id === o.targetMembershipId)
        : undefined;
      return {
        ...o,
        customerName: o.customerName || m?.fullName || 'Unknown',
        customerEmail: o.customerEmail || m?.email || 'Unknown',
        customerPhone: o.customerPhone || m?.phone || '—',
        hasProof: Boolean(o.proofFileName || o.proofDataUrl),
        targetMembershipCurrentExpiry: targetSub?.expiresAt,
        targetMembershipStatus: targetSub?.status,
      };
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const enrichedMemberships = memberships.map((sub) => {
    const m = memberById.get(sub.memberId);
    const hasPendingRenewal = orders.some(
      (o) =>
        o.orderType === 'renewal' &&
        o.targetMembershipId === sub.id &&
        (o.status === 'pending_verification' || o.status === 'awaiting_payment')
    );
    return {
      ...sub,
      customerName: m?.fullName || sub.customerName || 'Unknown',
      customerEmail: m?.email || sub.customerEmail || 'Unknown',
      customerPhone: m?.phone || sub.customerPhone || '—',
      hasPendingRenewal,
    };
  });

  const auditLogs = readJson<AdminAuditEntry[]>(ADMIN_AUDIT_FILE, []);
  const emailNotifications = readJson<EmailNotificationLog[]>(EMAIL_NOTIFS_FILE, []).map(
    ({ html: _omitHtml, ...rest }) => rest
  );
  const customerNotifications = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []).slice(0, 150);
  const schedulerRuns = readJson<SchedulerRunLog[]>(SCHEDULER_RUNS_FILE, []).slice(0, 50);
  const history = readJson<MembershipHistoryEntry[]>(HISTORY_FILE, []).slice(0, 200);
  const promoCodes = listPromoCodesOverview();
  const referrals = readJson<ReferralRecord[]>(REFERRALS_FILE, []).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
  const creditLedger = readJson<ReferralCreditEntry[]>(CREDIT_LEDGER_FILE, [])
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 200);
  const cfg = getMembershipConfig();

  const nowMs = Date.now();
  const in7d = nowMs + 7 * 86400000;
  const expiring7dCount = enrichedMemberships.filter(
    (m) => m.status === 'active' && Date.parse(m.expiresAt) > nowMs && Date.parse(m.expiresAt) <= in7d
  ).length;

  const nonBlockedReferrals = referrals.filter((r) => r.status !== 'blocked');
  const convertedReferralsCount = referrals.filter((r) => r.status === 'converted').length;
  const approvedOrdersWithPromo = orders.filter((o) => o.status === 'approved' && Boolean(o.promoCode));
  const totalDiscountGivenPkr = orders
    .filter((o) => o.status === 'approved')
    .reduce((sum, o) => sum + (Number(o.discountTotalPkr) || 0), 0);
  const totalDiscountGivenUsd = Number(
    orders
      .filter((o) => o.status === 'approved')
      .reduce((sum, o) => sum + (Number(o.discountTotalUsd) || 0), 0)
      .toFixed(2)
  );
  const totalReferralRewardsPkr = referrals.reduce((sum, r) => sum + (Number(r.rewardAmountPkr) || 0), 0);
  const totalReferralRewardsUsd = Number(
    referrals.reduce((sum, r) => sum + (Number(r.rewardAmountUsd) || 0), 0).toFixed(2)
  );

  const blockedUsers = listBlockedUsers();

  const metrics = {
    totalMembers: members.length,
    blockedUsers: blockedUsers.length,
    activeMemberships: enrichedMemberships.filter((m) => m.status === 'active').length,
    pendingVerifications: orders.filter((o) => o.status === 'pending_verification').length,
    awaitingPayments: orders.filter((o) => o.status === 'awaiting_payment').length,
    approvedPayments: orders.filter((o) => o.status === 'approved').length,
    rejectedPayments: orders.filter((o) => o.status === 'rejected').length,
    expiredMemberships: enrichedMemberships.filter((m) => m.status === 'expired').length,
    expiringIn7Days: expiring7dCount,
    pendingRenewals: orders.filter(
      (o) => o.orderType === 'renewal' && (o.status === 'pending_verification' || o.status === 'awaiting_payment')
    ).length,
    internationalOrders: orders.filter((o) => o.paymentRegion === 'international').length,
    failedEmails: emailNotifications.filter((n) => n.status === 'failed').length,
    totalReferrals: nonBlockedReferrals.length,
    convertedReferrals: convertedReferralsCount,
    pendingReferrals: referrals.filter((r) => r.status === 'signed_up').length,
    blockedReferrals: referrals.filter((r) => r.status === 'blocked').length,
    referralConversionRate:
      nonBlockedReferrals.length > 0
        ? Math.round((convertedReferralsCount / nonBlockedReferrals.length) * 100)
        : 0,
    promoRedemptions: approvedOrdersWithPromo.length,
    activePromoCodes: promoCodes.filter((p) => p.isActive).length,
    totalDiscountGivenPkr,
    totalDiscountGivenUsd,
    totalReferralRewardsPkr,
    totalReferralRewardsUsd,
  };

  return {
    metrics,
    members,
    blockedUsers,
    requests: orders,
    memberships: enrichedMemberships,
    history,
    auditLogs: auditLogs.slice(0, 120),
    emailNotifications: emailNotifications.slice(0, 100),
    customerNotifications,
    schedulerRuns,
    promoCodes,
    referrals,
    creditLedger,
    referralConfig: cfg.referralConfig,
    config: cfg,
    plans: getResolvedPlans(),
    admins: listAdmins(),
    serverCloudConnected: isServerFirestoreEnabled(),
  };
}

export async function hydrateStoreFromFirestore(): Promise<boolean> {
  if (!isServerFirestoreEnabled()) return false;
  const snap = await pullSnapshotFromFirestoreServer();
  if (!snap) return false;
  mergeCloudSyncSnapshot(snap);
  return true;
}

export async function syncServerFirestoreSnapshot(): Promise<ReturnType<typeof getAdminMembershipsOverview>> {
  if (isServerFirestoreEnabled()) {
    const snap = await pullSnapshotFromFirestoreServer();
    if (snap) {
      mergeCloudSyncSnapshot(snap);
    }
    const overview = getAdminMembershipsOverview();
    for (const m of overview.members) mirrorMemberServer(m);
    for (const o of overview.requests) mirrorOrderServer(o);
    for (const s of overview.memberships) mirrorMembershipServer(s);
    for (const n of overview.customerNotifications) mirrorMemberNotificationServer(n);
    for (const p of overview.promoCodes) mirrorPromoCodeServer(p);
    for (const r of overview.referrals) mirrorReferralServer(r);
    for (const c of overview.creditLedger) mirrorCreditEntryServer(c);
    for (const b of overview.blockedUsers) mirrorBlockedUserServer(b);
    mirrorConfigServer(overview.config);
    syncCampaignDocsToFirestore();
    return overview;
  }
  return getAdminMembershipsOverview();
}

// --- CANCEL & PLAYBACK ENTITLEMENT ---
export function cancelMemberSubscription(
  memberId: string,
  membershipId?: string
): {
  success: boolean;
  membership?: MembershipRecord;
  error?: string;
} {
  const all = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const idx = membershipId
    ? all.findIndex((s) => s.id === membershipId && s.memberId === memberId && s.status === 'active')
    : all.findIndex((s) => s.memberId === memberId && s.status === 'active');
  if (idx === -1) {
    return { success: false, error: 'No active membership found to cancel.' };
  }

  const nowIso = new Date().toISOString();
  all[idx].status = 'cancelled';
  all[idx].cancelledAt = nowIso;
  writeJson(MEMBERSHIPS_FILE, all);
  mirrorMembershipServer(all[idx]);
  supersedeOldRenewalReminders(all[idx].id, nowIso);
  revokePlaybackSessionsForMember(memberId, 'Membership cancelled by member request.');

  appendHistory({
    memberId,
    membershipId: all[idx].id,
    orderId: all[idx].orderId,
    event: 'membership_cancelled',
    planId: all[idx].planId,
    planName: all[idx].planName,
    selectedDramaIds: all[idx].selectedDramaIds,
    details: `${all[idx].planName} membership cancelled immediately by member request.`,
  });

  return { success: true, membership: all[idx] };
}

export function authorizeEpisodePlayback(params: {
  memberId: string | null;
  dramaId: string;
  episodeSlug: string;
}):
  | {
      authorized: true;
      streamUrl: string;
      playbackId: string;
      playbackIdSource: 'env_override' | 'default_catalog';
      dramaTitle: string;
      episodeTitle: string;
      thumbnail: string;
      fallbackThumbnail: string;
      planName: string;
      expiresAt: string;
      membershipId: string;
      memberEmail: string;
    }
  | {
      authorized: false;
      statusCode: number;
      code:
        | 'UNAUTHENTICATED'
        | 'ACCOUNT_BLOCKED'
        | 'PHONE_REQUIRED'
        | 'NO_ACTIVE_MEMBERSHIP'
        | 'MEMBERSHIP_CANCELLED'
        | 'MEMBERSHIP_EXPIRED'
        | 'DRAMA_NOT_INCLUDED'
        | 'EPISODE_NOT_FOUND'
        | 'STREAM_PENDING';
      error: string;
      coveredDramaIds?: string[];
      activePlanNames?: string[];
      expiredMembershipId?: string;
      expiredPlanId?: MembershipPlanId;
      expiresAt?: string;
    } {
  const drama = getDramaById(params.dramaId);
  const episode = getEpisodeMeta(params.dramaId, params.episodeSlug);
  const rawServerStreamUrl = PROTECTED_EPISODE_STREAMS[params.dramaId]?.[params.episodeSlug] || '';

  if (!drama || !episode || !episode.isPublished) {
    return {
      authorized: false,
      statusCode: 404,
      code: 'EPISODE_NOT_FOUND',
      error: 'Requested episode was not found in the FEVIQO catalogue.',
    };
  }
  const resolvedOverride = resolveEpisodePlaybackOverride(
    params.dramaId,
    params.episodeSlug,
    rawServerStreamUrl
  );
  const serverStreamUrl = resolvedOverride.streamUrl;

  if (!params.memberId) {
    return {
      authorized: false,
      statusCode: 401,
      code: 'UNAUTHENTICATED',
      error: 'Sign in with your FEVIQO member account to watch protected episodes.',
    };
  }

  const blockedRecord = getBlockedUserByMemberId(params.memberId);
  if (blockedRecord) {
    return {
      authorized: false,
      statusCode: 403,
      code: 'ACCOUNT_BLOCKED',
      error: buildBlockedAccountMessage(blockedRecord),
    };
  }

  const currentMember = getMemberById(params.memberId);
  if (currentMember && !isMemberPhoneValid(currentMember.phone)) {
    return {
      authorized: false,
      statusCode: 403,
      code: 'PHONE_REQUIRED',
      error: 'Please add your WhatsApp / phone number to complete your Google account setup before watching.',
    };
  }

  const memberships = syncMemberSubscriptions(params.memberId);
  const activeList = memberships.filter(
    (m) => m.status === 'active' && Date.parse(m.expiresAt) > Date.now()
  );

  if (activeList.length === 0) {
    // Prefer an expired membership that previously covered this drama, else latest
    const matchingExpired = memberships.find(
      (m) => m.status === 'expired' && getMembershipDramaIds(m).includes(drama.id)
    );
    const latest = matchingExpired || memberships[0];

    if (latest?.status === 'cancelled') {
      return {
        authorized: false,
        statusCode: 403,
        code: 'MEMBERSHIP_CANCELLED',
        error: 'Your membership has been cancelled or revoked. Choose a plan to restore streaming access.',
        expiredMembershipId: latest.id,
        expiredPlanId: latest.planId,
        expiresAt: latest.expiresAt,
      };
    }
    if (latest?.status === 'expired') {
      return {
        authorized: false,
        statusCode: 403,
        code: 'MEMBERSHIP_EXPIRED',
        error: 'Your membership term has expired. Renew your membership to continue watching.',
        expiredMembershipId: latest.id,
        expiredPlanId: latest.planId,
        expiresAt: latest.expiresAt,
      };
    }
    return {
      authorized: false,
      statusCode: 403,
      code: 'NO_ACTIVE_MEMBERSHIP',
      error: 'An active approved FEVIQO Premium Membership is required to stream this episode.',
    };
  }

  const matchingActive = activeList.find((m) => getMembershipDramaIds(m).includes(drama.id));

  if (!matchingActive) {
    const coveredSet = new Set<string>();
    const planNames = new Set<string>();
    for (const m of activeList) {
      planNames.add(m.planName);
      for (const id of getMembershipDramaIds(m)) coveredSet.add(id);
    }
    const matchingExpired = memberships.find(
      (m) => m.status === 'expired' && getMembershipDramaIds(m).includes(drama.id)
    );
    if (matchingExpired) {
      return {
        authorized: false,
        statusCode: 403,
        code: 'MEMBERSHIP_EXPIRED',
        error: `Your ${matchingExpired.planName} membership covering ${drama.title} has expired. Renew your membership to continue watching.`,
        expiredMembershipId: matchingExpired.id,
        expiredPlanId: matchingExpired.planId,
        expiresAt: matchingExpired.expiresAt,
        coveredDramaIds: Array.from(coveredSet),
        activePlanNames: Array.from(planNames),
      };
    }
    return {
      authorized: false,
      statusCode: 403,
      code: 'DRAMA_NOT_INCLUDED',
      error: `${drama.title} is not included in your current ${Array.from(planNames).join(' / ')} drama selection.`,
      coveredDramaIds: Array.from(coveredSet),
      activePlanNames: Array.from(planNames),
    };
  }

  if (!serverStreamUrl || !resolvedOverride.playbackId) {
    return {
      authorized: false,
      statusCode: 404,
      code: 'STREAM_PENDING',
      error: 'Your FEVIQO Premium membership is active. This Urdu Dubbed HD stream is being finalized and will begin playing here automatically once live.',
    };
  }

  const member = getMemberById(params.memberId);

  return {
    authorized: true,
    streamUrl: serverStreamUrl,
    playbackId: resolvedOverride.playbackId,
    playbackIdSource: resolvedOverride.source,
    dramaTitle: drama.title,
    episodeTitle: episode.title,
    thumbnail: episode.thumbnail,
    fallbackThumbnail: drama.fallbackPosterUrl,
    planName: matchingActive.planName,
    expiresAt: matchingActive.expiresAt,
    membershipId: matchingActive.id,
    memberEmail: member?.email || matchingActive.customerEmail || 'member@feviqo.com',
  };
}

export function getProtectedStreamsSecurityOverview() {
  return getMuxSecurityAdminOverview(PROTECTED_EPISODE_STREAMS, MEMBERSHIP_DRAMAS);
}

// --- READ-ONLY AUTOMATION & ENTITLEMENT HELPERS ---
export function getAutomationMembershipSnapshot(): {
  members: SafeMember[];
  orders: MembershipOrder[];
  memberships: MembershipRecord[];
} {
  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []).map((m) => sanitizeMember(m));
  const orders = readAllOrders();
  const memberships = syncMemberSubscriptions();
  return { members, orders, memberships };
}

export function getEntitledActiveMembersForDrama(dramaId: string): Array<{
  member: SafeMember;
  membership: MembershipRecord;
}> {
  const drama = getDramaById(dramaId);
  if (!drama) return [];

  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const memberships = syncMemberSubscriptions();
  const now = Date.now();
  const seenMemberIds = new Set<string>();
  const results: Array<{ member: SafeMember; membership: MembershipRecord }> = [];

  for (const sub of memberships) {
    if (sub.status !== 'active') continue;
    const expMs = Date.parse(sub.expiresAt);
    if (Number.isNaN(expMs) || expMs <= now) continue;

    const isEntitled = getMembershipDramaIds(sub).includes(drama.id);
    if (!isEntitled) continue;

    const memberRec = memberMap.get(sub.memberId);
    if (!memberRec) continue;
    if (getBlockedUserByEmail(memberRec.email) || getBlockedUserByMemberId(memberRec.id)) {
      continue;
    }
    if (seenMemberIds.has(memberRec.id)) continue;
    seenMemberIds.add(memberRec.id);
    results.push({ member: sanitizeMember(memberRec), membership: sub });
  }

  return results;
}

export function findMemberContextByPhoneDigits(rawPhoneDigits: string): {
  member: SafeMember;
  activeMemberships: MembershipRecord[];
  latestPendingOrder?: MembershipOrder;
} | null {
  const targetDigits = String(rawPhoneDigits || '').replace(/[^\d]/g, '');
  if (targetDigits.length < 8) return null;
  const targetTail = targetDigits.slice(-10);

  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  const matched = members.find((m) => {
    const mDigits = String(m.phone || '').replace(/[^\d]/g, '');
    if (mDigits.length < 8) return false;
    return mDigits === targetDigits || mDigits.slice(-10) === targetTail;
  });

  if (!matched) return null;
  if (getBlockedUserByEmail(matched.email) || getBlockedUserByMemberId(matched.id)) {
    return null;
  }

  const memberships = syncMemberSubscriptions(matched.id);
  const now = Date.now();
  const activeMemberships = memberships.filter(
    (sub) => sub.status === 'active' && Date.parse(sub.expiresAt) > now
  );
  const orders = readAllOrders()
    .filter((o) => o.memberId === matched.id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const latestPendingOrder = orders.find(
    (o) => o.status === 'awaiting_payment' || o.status === 'pending_verification'
  );

  return {
    member: sanitizeMember(matched),
    activeMemberships,
    latestPendingOrder,
  };
}



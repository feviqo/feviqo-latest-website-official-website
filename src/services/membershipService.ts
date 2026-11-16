import {
  MembershipPlan,
  CatalogDramaMeta,
  MembershipPlanId,
  PaymentRegion,
  PaymentMethod,
  PaymentCurrency,
} from '../data/membershipCatalog';

export interface SafeMember {
  id: string;
  ownerUid?: string;
  authMethod?: 'google' | 'email' | 'admin_assigned';
  email: string;
  fullName: string;
  phone: string;
  referralCode?: string;
  referredByMemberId?: string;
  referredByCode?: string;
  creditBalancePkr?: number;
  creditBalanceUsd?: number;
  createdAt: string;
}

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
  status: 'active' | 'cancelled' | 'expired';
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
  targetMembershipCurrentExpiry?: string;
  targetMembershipStatus?: string;
  planId: MembershipPlanId;
  planName: string;
  originalAmountPkr?: number;
  originalAmountUsd?: number;
  amountPkr: number;
  amountUsd?: number;
  promoCodeId?: string;
  promoCode?: string;
  promoDiscountPkr?: number;
  promoDiscountUsd?: number;
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
  hasProof?: boolean;
  createdAt: string;
  paidAt?: string;
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
  | 'referral_reward';

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

export interface IndicativePlanPrice {
  usd: number;
  formattedUsd: string;
  approxLocal: number;
  formattedApproxLocal: string;
  currencyCode: string;
}

export interface GeoPricingInfo {
  countryCode: string;
  countryName: string;
  detected: boolean;
  defaultRegion: PaymentRegion;
  localCurrencyCode: string;
  localCurrencySymbol: string;
  rateFromUsd: number;
  rateSource: 'live' | 'cached' | 'fallback';
  ratesUpdatedAt: string;
  indicativePlans: Record<MembershipPlanId, IndicativePlanPrice>;
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

export interface MemberReferralSummary {
  referralCode: string;
  referralLink: string;
  referredByCode?: string;
  creditBalancePkr: number;
  creditBalanceUsd: number;
  totalReferrals: number;
  completedPurchases: number;
  pendingReferrals: number;
  blockedReferrals: number;
  totalEarnedPkr: number;
  totalEarnedUsd: number;
  refereeFirstOrderDiscountAvailable: boolean;
  personalRewardPromos?: Array<{
    code: string;
    discountType: PromoDiscountType;
    discountPercent: number;
    discountAmountPkr: number;
    discountAmountUsd: number;
    expiresAt?: string;
  }>;
  referrals: Array<{
    id: string;
    referredName: string;
    maskedEmail: string;
    status: 'signed_up' | 'converted' | 'blocked';
    rewardAmountPkr: number;
    rewardAmountUsd: number;
    rewardPromoCode?: string;
    createdAt: string;
    convertedAt?: string;
  }>;
  creditLedger: ReferralCreditEntry[];
  referralConfig: ReferralConfig;
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
  referralConfig?: ReferralConfig;
}

export interface PaymentGatewayStatus {
  configured: boolean;
  provider: 'bank_qr' | 'binance_qr' | 'stripe' | 'safepay' | 'payfast';
  missingCredentials: string[];
  instructions: string;
}

export interface MemberAccountState {
  member: SafeMember;
  activeMembership: MembershipRecord | null;
  activeMemberships?: MembershipRecord[];
  allMemberships?: MembershipRecord[];
  latestMembership: MembershipRecord | null;
  remainingDays: number;
  remainingHours?: number;
  unlockedDramaIds: string[];
  unlockedDramas: CatalogDramaMeta[];
  orders: MembershipOrder[];
  history: MembershipHistoryEntry[];
  notifications?: CustomerNotification[];
  unreadNotificationCount?: number;
  referralSummary?: MemberReferralSummary;
  plans?: MembershipPlan[];
  publicConfig?: PublicMembershipConfig;
  gatewayStatus: PaymentGatewayStatus;
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

export interface AdminMembershipRecord extends MembershipRecord {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  hasPendingRenewal?: boolean;
}

export interface AdminAuditEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  details: string;
  createdAt: string;
}

export interface AdminEmailNotification {
  id: string;
  orderId?: string;
  membershipId?: string;
  customerNotificationId?: string;
  to: string;
  subject: string;
  type: string;
  status: 'sent' | 'failed';
  provider?: string;
  error?: string;
  attempts: number;
  createdAt: string;
  lastAttemptAt: string;
}

export interface MembershipConfig {
  starterQrImage: string;
  standardQrImage: string;
  plusQrImage: string;
  vipQrImage: string;
  starterBinanceQrImage?: string;
  standardBinanceQrImage?: string;
  plusBinanceQrImage?: string;
  vipBinanceQrImage?: string;
  usdPrices?: Record<MembershipPlanId, number>;
  internationalInstructionsEn?: string;
  internationalInstructionsUr?: string;
  whatsappNumber: string;
  adminEmail: string;
  supportEmail: string;
  supportNoteEn: string;
  supportNoteUr: string;
  referralConfig?: ReferralConfig;
  updatedAt: string;
}

export interface AdminMembershipsOverview {
  currentAdmin?: SafeAdmin;
  metrics: {
    totalMembers: number;
    activeMemberships: number;
    pendingVerifications: number;
    awaitingPayments: number;
    approvedPayments: number;
    rejectedPayments: number;
    expiredMemberships: number;
    expiringIn7Days?: number;
    pendingRenewals?: number;
    internationalOrders?: number;
    failedEmails: number;
    totalReferrals?: number;
    convertedReferrals?: number;
    pendingReferrals?: number;
    blockedReferrals?: number;
    referralConversionRate?: number;
    promoRedemptions?: number;
    activePromoCodes?: number;
    totalDiscountGivenPkr?: number;
    totalDiscountGivenUsd?: number;
    totalReferralRewardsPkr?: number;
    totalReferralRewardsUsd?: number;
  };
  members: SafeMember[];
  requests: MembershipOrder[];
  memberships: AdminMembershipRecord[];
  history?: MembershipHistoryEntry[];
  auditLogs: AdminAuditEntry[];
  emailNotifications: AdminEmailNotification[];
  customerNotifications?: CustomerNotification[];
  schedulerRuns?: SchedulerRunLog[];
  promoCodes?: AdminPromoCodeView[];
  referrals?: ReferralRecord[];
  creditLedger?: ReferralCreditEntry[];
  referralConfig?: ReferralConfig;
  config: MembershipConfig;
  plans?: MembershipPlan[];
  admins: SafeAdmin[];
  serverCloudConnected?: boolean;
}

const MEMBER_TOKEN_KEY = 'feviqo_member_token';
const ADMIN_TOKEN_KEY = 'feviqo_admin_token';
const REFERRAL_CODE_KEY = 'feviqo_ref_code';
const CAMPAIGN_VISITOR_KEY = 'feviqo_campaign_visitor';
const CAMPAIGN_ATTR_KEY = 'feviqo_campaign_attr';

export function getStoredCampaignVisitorToken(): string {
  try {
    return typeof window !== 'undefined' ? (window.localStorage.getItem(CAMPAIGN_VISITOR_KEY) || '') : '';
  } catch {
    return '';
  }
}

export function setStoredCampaignVisitorToken(token?: string | null): void {
  if (!token) return;
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CAMPAIGN_VISITOR_KEY, token);
    }
  } catch {}
}

export function getStoredCampaignAttrToken(): string {
  try {
    return typeof window !== 'undefined' ? (window.localStorage.getItem(CAMPAIGN_ATTR_KEY) || '') : '';
  } catch {
    return '';
  }
}

export function setStoredCampaignAttrToken(token?: string | null): void {
  if (!token) return;
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CAMPAIGN_ATTR_KEY, token);
    }
  } catch {}
}

export function normalizeReferralInput(raw?: string | null): string {
  return (raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 32);
}

export function getStoredReferralCode(): string {
  try {
    return typeof window !== 'undefined'
      ? normalizeReferralInput(window.localStorage.getItem(REFERRAL_CODE_KEY))
      : '';
  } catch {
    return '';
  }
}

export function setStoredReferralCode(code: string): void {
  const clean = normalizeReferralInput(code);
  if (!clean || clean.length < 4) return;
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(REFERRAL_CODE_KEY, clean);
    }
  } catch {}
}

export function clearStoredReferralCode(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(REFERRAL_CODE_KEY);
    }
  } catch {}
}

function readStoredToken(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function writeStoredToken(key: string, token: string | null): void {
  try {
    if (typeof window === 'undefined') return;
    if (token) {
      window.localStorage.setItem(key, token);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {}
}

export function getMemberToken(): string | null {
  return readStoredToken(MEMBER_TOKEN_KEY);
}

export function getAdminToken(): string | null {
  return readStoredToken(ADMIN_TOKEN_KEY);
}

function memberHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getMemberToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const visitorToken = getStoredCampaignVisitorToken();
  if (visitorToken) headers['X-Feviqo-Visitor-Token'] = visitorToken;
  const attrToken = getStoredCampaignAttrToken();
  if (attrToken) headers['X-Feviqo-Campaign-Attr'] = attrToken;
  return headers;
}

function adminHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getAdminToken();
  if (token) headers['X-Admin-Authorization'] = `Bearer ${token}`;
  return headers;
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return { success: false, error: `Unexpected server response (${res.status}).` };
  }
}

export async function fetchMembershipGeo(countryOverride?: string): Promise<{
  success: boolean;
  geo?: GeoPricingInfo;
}> {
  const qs = countryOverride ? `?country=${encodeURIComponent(countryOverride)}` : '';
  const res = await fetch(`/api/membership/geo${qs}`, { credentials: 'include' });
  return parseJsonSafe(res);
}

export async function fetchMembershipCatalog(): Promise<{
  success: boolean;
  plans?: MembershipPlan[];
  dramas?: CatalogDramaMeta[];
  publicConfig?: PublicMembershipConfig;
  gatewayStatus?: PaymentGatewayStatus;
  geo?: GeoPricingInfo | null;
}> {
  const res = await fetch('/api/membership/catalog', { credentials: 'include' });
  return parseJsonSafe(res);
}

export async function fetchMemberAccount(): Promise<
  ({ success: true } & MemberAccountState) | { success: false; code?: string; error?: string }
> {
  const res = await fetch('/api/membership/account', {
    credentials: 'include',
    headers: memberHeaders(),
  });
  if (res.status === 401) {
    writeStoredToken(MEMBER_TOKEN_KEY, null);
  }
  return parseJsonSafe(res);
}

export async function registerMemberAccount(payload: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
}): Promise<
  ({ success: true } & MemberAccountState) | { success: false; error: string }
> {
  const ref = normalizeReferralInput(payload.referralCode) || getStoredReferralCode();
  const res = await fetch('/api/membership/register', {
    method: 'POST',
    headers: memberHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({
      ...payload,
      referralCode: ref || undefined,
      campaignVisitorToken: getStoredCampaignVisitorToken() || undefined,
      campaignAttrToken: getStoredCampaignAttrToken() || undefined,
    }),
  });
  const data = await parseJsonSafe(res);
  if (data?.success && data?.token) {
    writeStoredToken(MEMBER_TOKEN_KEY, data.token);
    if (ref) clearStoredReferralCode();
  }
  return data;
}

export async function loginMemberAccount(payload: {
  email: string;
  password: string;
}): Promise<
  ({ success: true } & MemberAccountState) | { success: false; error: string }
> {
  const res = await fetch('/api/membership/login', {
    method: 'POST',
    headers: memberHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (data?.success && data?.token) {
    writeStoredToken(MEMBER_TOKEN_KEY, data.token);
  }
  return data;
}

export async function authenticateMemberWithGoogle(payload: {
  idToken: string;
  fullName?: string;
  phone?: string;
  referralCode?: string;
}): Promise<
  ({ success: true } & MemberAccountState) | { success: false; error: string }
> {
  const ref = normalizeReferralInput(payload.referralCode) || getStoredReferralCode();
  const res = await fetch('/api/membership/google-auth', {
    method: 'POST',
    headers: memberHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({
      ...payload,
      referralCode: ref || undefined,
      campaignVisitorToken: getStoredCampaignVisitorToken() || undefined,
      campaignAttrToken: getStoredCampaignAttrToken() || undefined,
    }),
  });
  const data = await parseJsonSafe(res);
  if (data?.success && data?.token) {
    writeStoredToken(MEMBER_TOKEN_KEY, data.token);
  }
  return data;
}

export async function updateMemberPhone(
  phone: string,
  referralCode?: string
): Promise<({ success: true } & MemberAccountState) | { success: false; error: string }> {
  const ref = normalizeReferralInput(referralCode) || getStoredReferralCode();
  const res = await fetch('/api/membership/profile/phone', {
    method: 'POST',
    headers: memberHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ phone, referralCode: ref || undefined }),
  });
  const data = await parseJsonSafe(res);
  if (data?.success && ref) {
    clearStoredReferralCode();
  }
  return data;
}

export async function logoutMemberAccount(): Promise<void> {
  writeStoredToken(MEMBER_TOKEN_KEY, null);
  await fetch('/api/membership/logout', {
    method: 'POST',
    credentials: 'include',
    headers: memberHeaders(),
  }).catch(() => {});
}

export async function validateCheckoutPromoQuote(payload: {
  planId: MembershipPlanId;
  paymentRegion?: PaymentRegion;
  promoCode?: string;
  applyCredits?: boolean;
}): Promise<{
  success: boolean;
  error?: string;
  quote?: CheckoutPricingQuote;
}> {
  const res = await fetch('/api/membership/promo/validate', {
    method: 'POST',
    headers: memberHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function createMembershipCheckout(payload: {
  planId: MembershipPlanId;
  selectedDramaIds: string[];
  paymentRegion?: PaymentRegion;
  orderType?: OrderType;
  targetMembershipId?: string;
  visitorCountryCode?: string;
  indicativeLocalDisplay?: string;
  promoCode?: string;
  applyCredits?: boolean;
}): Promise<{
  success: boolean;
  code?: string;
  error?: string;
  order?: MembershipOrder;
  quote?: CheckoutPricingQuote;
  qrImageUrl?: string;
  publicConfig?: PublicMembershipConfig;
  gatewayConfigured?: boolean;
  paymentSetupRequired?: boolean;
  gatewayStatus?: PaymentGatewayStatus;
  account?: MemberAccountState;
}> {
  const res = await fetch('/api/membership/checkout', {
    method: 'POST',
    headers: memberHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({
      ...payload,
      campaignVisitorToken: getStoredCampaignVisitorToken() || undefined,
      campaignAttrToken: getStoredCampaignAttrToken() || undefined,
    }),
  });
  return parseJsonSafe(res);
}

export async function confirmZeroBalanceOrder(payload: {
  orderId: string;
  paymentNote?: string;
}): Promise<
  | {
      success: true;
      order: MembershipOrder;
      adminNotificationSent: boolean;
      account: MemberAccountState;
    }
  | { success: false; error: string }
> {
  const res = await fetch(
    `/api/membership/orders/${encodeURIComponent(payload.orderId)}/confirm-free`,
    {
      method: 'POST',
      headers: memberHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ paymentNote: payload.paymentNote || '' }),
    }
  );
  return parseJsonSafe(res);
}

export async function submitOrderPaymentProofFile(payload: {
  orderId: string;
  file: File;
  paymentNote?: string;
  proofDataUrl?: string;
}): Promise<
  | {
      success: true;
      order: MembershipOrder;
      adminNotificationSent: boolean;
      account: MemberAccountState;
    }
  | { success: false; error: string }
> {
  const form = new FormData();
  form.append('proof', payload.file);
  if (payload.paymentNote?.trim()) {
    form.append('paymentNote', payload.paymentNote.trim());
  }
  if (payload.proofDataUrl) {
    form.append('proofDataUrl', payload.proofDataUrl);
  }
  const res = await fetch(`/api/membership/orders/${encodeURIComponent(payload.orderId)}/proof`, {
    method: 'POST',
    credentials: 'include',
    headers: memberHeaders(),
    body: form,
  });
  return parseJsonSafe(res);
}

export async function markMemberNotificationRead(notifId: string): Promise<
  ({ success: boolean } & Partial<MemberAccountState>)
> {
  const res = await fetch(`/api/membership/notifications/${encodeURIComponent(notifId)}/read`, {
    method: 'POST',
    credentials: 'include',
    headers: memberHeaders(),
  });
  return parseJsonSafe(res);
}

export async function markAllMemberNotificationsRead(): Promise<
  ({ success: boolean; markedCount?: number } & Partial<MemberAccountState>)
> {
  const res = await fetch('/api/membership/notifications/read-all', {
    method: 'POST',
    credentials: 'include',
    headers: memberHeaders(),
  });
  return parseJsonSafe(res);
}

export async function cancelActiveMembership(membershipId?: string): Promise<
  ({ success: true } & MemberAccountState) | { success: false; error: string }
> {
  const res = await fetch('/api/membership/cancel', {
    method: 'POST',
    credentials: 'include',
    headers: memberHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(membershipId ? { membershipId } : {}),
  });
  return parseJsonSafe(res);
}

export interface WatermarkInfo {
  text: string;
  subtext: string;
  memberId: string;
  sessionShortId: string;
  issuedAt: string;
}

export interface WatchProtectionMeta {
  signedMuxToken: boolean;
  proxiedHls: boolean;
  directMp4Blocked: boolean;
  drmConfigured: boolean;
  playbackRestrictionConfigured: boolean;
  sessionExpiresAt: string;
}

export async function requestProtectedEpisodeStream(
  dramaId: string,
  episodeSlug: string
): Promise<
  | {
      success: true;
      streamUrl: string;
      playbackSessionId?: string;
      watermark?: WatermarkInfo;
      protection?: WatchProtectionMeta;
      dramaTitle: string;
      episodeTitle: string;
      thumbnail?: string;
      fallbackThumbnail?: string;
      planName: string;
      expiresAt: string;
      membershipId?: string;
    }
  | {
      success: false;
      code?: string;
      error: string;
      coveredDramaIds?: string[];
      activePlanNames?: string[];
      expiredMembershipId?: string;
      expiredPlanId?: MembershipPlanId;
      expiresAt?: string;
    }
> {
  const res = await fetch(
    `/api/membership/watch/${encodeURIComponent(dramaId)}/${encodeURIComponent(episodeSlug)}`,
    {
      credentials: 'include',
      headers: memberHeaders(),
    }
  );
  return parseJsonSafe(res);
}

export async function sendPlaybackHeartbeat(
  dramaId: string,
  episodeSlug: string,
  playbackSessionId?: string
): Promise<{
  success: boolean;
  allowed: boolean;
  code?: string;
  error?: string;
  expiresAt?: string;
}> {
  try {
    const res = await fetch(
      `/api/membership/watch/${encodeURIComponent(dramaId)}/${encodeURIComponent(episodeSlug)}/heartbeat`,
      {
        method: 'POST',
        credentials: 'include',
        headers: memberHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ playbackSessionId }),
      }
    );
    const data = await parseJsonSafe(res);
    if (!res.ok) {
      return {
        success: false,
        allowed: false,
        code: data?.code || 'PLAYBACK_DENIED',
        error: data?.error || `HTTP ${res.status}`,
      };
    }
    return {
      success: true,
      allowed: Boolean(data?.allowed ?? data?.success),
      expiresAt: data?.expiresAt,
    };
  } catch {
    return { success: true, allowed: true };
  }
}

export async function trackReferralCampaignVisit(
  slug: string,
  landingPage?: string
): Promise<{
  success: boolean;
  tracked?: boolean;
  campaignId?: string;
  campaignSlug?: string;
  isNewUniqueVisitor?: boolean;
  ignoredReason?: string;
}> {
  try {
    const res = await fetch('/api/referral-campaigns/track', {
      method: 'POST',
      credentials: 'include',
      headers: memberHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        slug,
        landingPage:
          landingPage ||
          (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'),
        visitorToken: getStoredCampaignVisitorToken() || undefined,
      }),
    });
    const data = await parseJsonSafe(res);
    if (data?.visitorToken) {
      setStoredCampaignVisitorToken(data.visitorToken);
    }
    if (data?.attributionToken) {
      setStoredCampaignAttrToken(data.attributionToken);
    }
    return data;
  } catch {
    return { success: false };
  }
}

export async function fetchAuthenticatedProofObjectUrl(
  orderId: string,
  isAdmin = false
): Promise<string | null> {
  try {
    const res = await fetch(
      `/api/membership/orders/${encodeURIComponent(orderId)}/proof?t=${Date.now()}`,
      {
        credentials: 'include',
        headers: isAdmin ? adminHeaders() : memberHeaders(),
      }
    );
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

// --- ADMIN PANEL SERVICE ---
export async function fetchAdminAuthStatus(): Promise<{
  success: boolean;
  authenticated: boolean;
  admin: SafeAdmin | null;
  hasConfiguredAdmins: boolean;
  configuredAdminEmail: string;
}> {
  const res = await fetch('/api/admin/auth/status', {
    credentials: 'include',
    headers: adminHeaders(),
  });
  const data = await parseJsonSafe(res);
  if (data && !data.authenticated) {
    writeStoredToken(ADMIN_TOKEN_KEY, null);
  }
  return data;
}

export async function bootstrapAdminAccount(payload: {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}): Promise<{ success: true; admin: SafeAdmin; token?: string } | { success: false; error: string }> {
  const res = await fetch('/api/admin/auth/bootstrap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (data?.success && data?.token) {
    writeStoredToken(ADMIN_TOKEN_KEY, data.token);
  }
  return data;
}

export async function loginAdminAccount(payload: {
  email: string;
  password: string;
}): Promise<{ success: true; admin: SafeAdmin; token?: string } | { success: false; error: string }> {
  const res = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (data?.success && data?.token) {
    writeStoredToken(ADMIN_TOKEN_KEY, data.token);
  }
  return data;
}

export async function authenticateAdminWithGoogle(
  idToken: string
): Promise<{ success: true; admin: SafeAdmin; token?: string } | { success: false; error: string }> {
  const res = await fetch('/api/admin/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });
  const data = await parseJsonSafe(res);
  if (data?.success && data?.token) {
    writeStoredToken(ADMIN_TOKEN_KEY, data.token);
  }
  return data;
}

export async function logoutAdminAccount(): Promise<void> {
  writeStoredToken(ADMIN_TOKEN_KEY, null);
  await fetch('/api/admin/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: adminHeaders(),
  }).catch(() => {});
}

export async function fetchAdminMembershipsOverview(): Promise<
  ({ success: true } & AdminMembershipsOverview) | { success: false; code?: string; error: string }
> {
  const res = await fetch('/api/admin/memberships/overview', {
    credentials: 'include',
    headers: adminHeaders(),
  });
  if (res.status === 401 || res.status === 403) {
    writeStoredToken(ADMIN_TOKEN_KEY, null);
  }
  return parseJsonSafe(res);
}

export async function approvePaymentOrder(orderId: string): Promise<
  { success: true; order?: MembershipOrder; membership?: AdminMembershipRecord; wasRenewal?: boolean; overview: AdminMembershipsOverview } | { success: false; error: string }
> {
  const res = await fetch(
    `/api/admin/memberships/requests/${encodeURIComponent(orderId)}/approve`,
    {
      method: 'POST',
      credentials: 'include',
      headers: adminHeaders(),
    }
  );
  return parseJsonSafe(res);
}

export async function rejectPaymentOrder(
  orderId: string,
  reason: string
): Promise<{ success: true; order?: MembershipOrder; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch(
    `/api/admin/memberships/requests/${encodeURIComponent(orderId)}/reject`,
    {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ reason }),
    }
  );
  return parseJsonSafe(res);
}

export async function assignCustomerMembership(payload: {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  planId: MembershipPlanId;
  selectedDramaIds: string[];
  durationDays?: number;
  paymentNote?: string;
}): Promise<
  | {
      success: true;
      member: SafeMember;
      order: MembershipOrder;
      membership: AdminMembershipRecord;
      overview: AdminMembershipsOverview;
    }
  | { success: false; error: string }
> {
  const res = await fetch('/api/admin/memberships/assign', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function extendMembershipByAdmin(
  membershipId: string,
  addDays: number,
  reason: string
): Promise<{ success: true; membership?: MembershipRecord; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch(`/api/admin/memberships/${encodeURIComponent(membershipId)}/extend`, {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ addDays, reason }),
  });
  return parseJsonSafe(res);
}

export async function runAdminLifecycleReminders(): Promise<
  { success: true; runLog: SchedulerRunLog; overview: AdminMembershipsOverview } | { success: false; error: string }
> {
  const res = await fetch('/api/admin/memberships/reminders/run', {
    method: 'POST',
    credentials: 'include',
    headers: adminHeaders(),
  });
  return parseJsonSafe(res);
}

export async function retryCustomerNotificationEmail(
  notifId: string
): Promise<{ success: boolean; notification?: CustomerNotification; overview?: AdminMembershipsOverview; error?: string }> {
  const res = await fetch(`/api/admin/memberships/notifications/${encodeURIComponent(notifId)}/retry-email`, {
    method: 'POST',
    credentials: 'include',
    headers: adminHeaders(),
  });
  return parseJsonSafe(res);
}

export async function syncAdminCloudState(snapshot: {
  members?: SafeMember[];
  orders?: MembershipOrder[];
  memberships?: AdminMembershipRecord[];
  history?: MembershipHistoryEntry[];
  customerNotifications?: CustomerNotification[];
  schedulerRuns?: SchedulerRunLog[];
  config?: MembershipConfig | null;
}): Promise<{ success: true; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch('/api/admin/memberships/sync', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(snapshot),
  });
  return parseJsonSafe(res);
}

export async function revokeMembershipAccess(
  membershipId: string,
  reason: string
): Promise<{ success: true; membership?: MembershipRecord; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch(`/api/admin/memberships/${encodeURIComponent(membershipId)}/revoke`, {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ reason }),
  });
  return parseJsonSafe(res);
}

export async function deletePaymentOrderByAdmin(
  orderId: string
): Promise<
  | {
      success: true;
      deletedOrderId: string;
      deletedNotificationIds?: string[];
      overview: AdminMembershipsOverview;
    }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/admin/memberships/requests/${encodeURIComponent(orderId)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: adminHeaders(),
  });
  return parseJsonSafe(res);
}

export async function deleteMemberAccountByAdmin(
  memberId: string
): Promise<
  | {
      success: true;
      deletedIds: {
        memberId: string;
        orderIds: string[];
        membershipIds: string[];
        historyIds: string[];
        notificationIds: string[];
      };
      overview: AdminMembershipsOverview;
    }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/admin/memberships/accounts/${encodeURIComponent(memberId)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: adminHeaders(),
  });
  return parseJsonSafe(res);
}

export async function deleteMembershipRecordByAdmin(
  membershipId: string
): Promise<
  | {
      success: true;
      deletedMembershipId: string;
      deletedNotificationIds?: string[];
      overview: AdminMembershipsOverview;
    }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/admin/memberships/${encodeURIComponent(membershipId)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: adminHeaders(),
  });
  return parseJsonSafe(res);
}

export async function updateMembershipSettings(
  updates: Partial<MembershipConfig>
): Promise<{ success: true; config: MembershipConfig; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch('/api/admin/memberships/config', {
    method: 'PUT',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return parseJsonSafe(res);
}

export async function uploadPlanQrImage(
  planId: MembershipPlanId,
  file: File,
  region: PaymentRegion = 'pakistan'
): Promise<{ success: true; region?: PaymentRegion; imageUrl: string; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const form = new FormData();
  form.append('qr', file);
  const res = await fetch(
    `/api/admin/memberships/qr/${encodeURIComponent(planId)}?region=${encodeURIComponent(region)}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: adminHeaders(),
      body: form,
    }
  );
  return parseJsonSafe(res);
}

export async function retryEmailNotification(
  notifId: string
): Promise<{ success: boolean; overview?: AdminMembershipsOverview; error?: string }> {
  const res = await fetch(`/api/admin/memberships/emails/${encodeURIComponent(notifId)}/retry`, {
    method: 'POST',
    credentials: 'include',
    headers: adminHeaders(),
  });
  return parseJsonSafe(res);
}

export async function grantAdminRole(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<{ success: true; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch('/api/admin/roles', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function updateAdminRoleStatus(
  adminId: string,
  isActive: boolean
): Promise<{ success: true; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch(`/api/admin/roles/${encodeURIComponent(adminId)}`, {
    method: 'PATCH',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ isActive }),
  });
  return parseJsonSafe(res);
}

export interface AdminEmailTransportStatus {
  smtpConfigured: boolean;
  smtpSource?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
  resendConfigured: boolean;
  resendSource?: string;
  resendFrom: string;
  notificationRecipients?: string[];
}

export async function fetchAdminEmailTransport(): Promise<
  { success: true; transport: AdminEmailTransportStatus } | { success: false; error: string }
> {
  const res = await fetch('/api/admin/memberships/email-transport', {
    credentials: 'include',
    headers: adminHeaders(),
  });
  return parseJsonSafe(res);
}

export async function saveAdminEmailTransport(payload: {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  resendApiKey?: string;
  resendFrom?: string;
  sendTestEmail?: boolean;
  testOnly?: boolean;
}): Promise<
  | {
      success: true;
      transport: AdminEmailTransportStatus;
      testResult?: { success: boolean; provider?: string; source?: string; error?: string } | null;
      overview: AdminMembershipsOverview;
    }
  | { success: false; error: string }
> {
  const res = await fetch('/api/admin/memberships/email-transport', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function createAdminPromoCode(payload: {
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
}): Promise<{ success: true; promo: AdminPromoCodeView; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch('/api/admin/memberships/promos', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function updateAdminPromoCode(
  promoId: string,
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
  }>
): Promise<{ success: true; promo: AdminPromoCodeView; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch(`/api/admin/memberships/promos/${encodeURIComponent(promoId)}`, {
    method: 'PUT',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return parseJsonSafe(res);
}

export async function deleteAdminPromoCode(
  promoId: string
): Promise<{ success: true; deletedPromoId: string; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch(`/api/admin/memberships/promos/${encodeURIComponent(promoId)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: adminHeaders(),
  });
  return parseJsonSafe(res);
}

export async function updateAdminReferralConfig(
  updates: Partial<ReferralConfig>
): Promise<{ success: true; referralConfig: ReferralConfig; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch('/api/admin/memberships/referral-config', {
    method: 'PUT',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return parseJsonSafe(res);
}

export async function updateAdminReferralStatus(
  referralId: string,
  status: 'blocked' | 'signed_up',
  blockReason?: string
): Promise<{ success: true; referral: ReferralRecord; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch(`/api/admin/memberships/referrals/${encodeURIComponent(referralId)}/status`, {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ status, blockReason }),
  });
  return parseJsonSafe(res);
}

// =========================================================================
// PART 2: PARTNER REFERRAL CAMPAIGNS & LINK ANALYTICS CLIENT
// =========================================================================

export type ReferralCampaignStatus = 'active' | 'paused' | 'disabled';

export interface ReferralCampaignActivityEntry {
  id: string;
  at: string;
  actorEmail: string;
  action:
    | 'created'
    | 'updated'
    | 'paused'
    | 'reactivated'
    | 'disabled'
    | 'commission_rate_changed'
    | 'commission_approved'
    | 'commission_paid'
    | 'commission_reversed';
  summary: string;
}

export interface ReferralCampaign {
  id: string;
  name: string;
  partnerName: string;
  partnerEmail?: string;
  description: string;
  slug: string;
  referralUrl: string;
  commissionRatePercent: number;
  attributionWindowDays: number;
  startDate?: string;
  endDate?: string;
  status: ReferralCampaignStatus;
  createdAt: string;
  updatedAt: string;
  createdByAdminEmail: string;
  activityHistory: ReferralCampaignActivityEntry[];
}

export interface ReferralCampaignAnalytics {
  campaignId: string;
  campaignName: string;
  partnerName: string;
  slug: string;
  referralUrl: string;
  status: ReferralCampaignStatus;
  commissionRatePercent: number;
  attributionWindowDays: number;
  totalClicks: number;
  uniqueVisitors: number;
  registeredUsers: number;
  checkoutAttempts: number;
  successfulPaidMemberships: number;
  conversionRatePercent: number;
  revenueGeneratedPkr: number;
  revenueGeneratedUsd: number;
  totalCommissionEarnedPkr: number;
  pendingCommissionPkr: number;
  paidCommissionPkr: number;
  totalCommissionEarnedUsd: number;
  pendingCommissionUsd: number;
  paidCommissionUsd: number;
}

export interface CampaignCommissionRecord {
  id: string;
  campaignId: string;
  campaignSlug: string;
  campaignName: string;
  partnerName: string;
  orderId: string;
  memberId: string;
  customerName: string;
  maskedCustomerEmail: string;
  planId: string;
  planName: string;
  currency: 'PKR' | 'USD';
  orderAmount: number;
  orderAmountPkr: number;
  orderAmountUsd: number;
  commissionRatePercent: number;
  commissionAmount: number;
  commissionAmountPkr: number;
  commissionAmountUsd: number;
  monthKey: string;
  status: 'pending' | 'approved' | 'paid' | 'reversed';
  verifiedAt: string;
  approvedAt?: string;
  approvedByAdminEmail?: string;
  paidAt?: string;
  paymentId?: string;
  paymentDate?: string;
  paymentNotes?: string;
  reversedAt?: string;
  reversedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionPaymentRecord {
  id: string;
  campaignId: string;
  campaignName: string;
  partnerName: string;
  monthKey: string;
  commissionIds: string[];
  currency: 'PKR' | 'USD';
  totalAmountPkr: number;
  totalAmountUsd: number;
  paymentDate: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes: string;
  recordedByAdminEmail: string;
  createdAt: string;
}

export interface ReferralCampaignCustomerRow {
  memberId: string;
  customerName: string;
  maskedEmail: string;
  attributedAt: string;
  lastOrderId?: string;
  lastOrderPlan?: string;
  lastOrderStatus?: string;
  lastOrderAmountDisplay?: string;
  commissionStatus?: string;
  commissionAmountPkr?: number;
}

export interface ReferralCampaignDetail {
  campaign: ReferralCampaign;
  analytics: ReferralCampaignAnalytics;
  customers: ReferralCampaignCustomerRow[];
  commissions: CampaignCommissionRecord[];
  payments: CommissionPaymentRecord[];
  recentVisits: Array<{
    id: string;
    landingPage: string;
    isUniqueVisitor: boolean;
    createdAt: string;
  }>;
}

export interface MonthlyCommissionReportRow {
  monthKey: string;
  campaignId: string;
  campaignName: string;
  partnerName: string;
  slug: string;
  successfulPaidMemberships: number;
  revenuePkr: number;
  revenueUsd: number;
  commissionRatePercent: number;
  totalCommissionEarnedPkr: number;
  pendingCommissionPkr: number;
  approvedCommissionPkr: number;
  paidCommissionPkr: number;
  totalCommissionEarnedUsd: number;
  pendingCommissionUsd: number;
  approvedCommissionUsd: number;
  paidCommissionUsd: number;
}

export interface MonthlyCommissionReportSnapshot {
  id: string;
  monthKey: string;
  generatedAt: string;
  generatedByAdminEmail: string;
  rows: MonthlyCommissionReportRow[];
}

export interface AdminReferralCampaignsOverview {
  campaigns: Array<{
    campaign: ReferralCampaign;
    analytics: ReferralCampaignAnalytics;
  }>;
  totals: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalClicks: number;
    uniqueVisitors: number;
    registeredUsers: number;
    checkoutAttempts: number;
    successfulPaidMemberships: number;
    revenueGeneratedPkr: number;
    totalCommissionEarnedPkr: number;
    pendingCommissionPkr: number;
    paidCommissionPkr: number;
  };
  commissions: CampaignCommissionRecord[];
  payments: CommissionPaymentRecord[];
  savedMonthlyReports: MonthlyCommissionReportSnapshot[];
}

export async function fetchAdminReferralCampaignsOverview(): Promise<
  ({ success: true } & AdminReferralCampaignsOverview) | { success: false; error: string }
> {
  const res = await fetch('/api/admin/referral-campaigns/overview', {
    credentials: 'include',
    headers: adminHeaders(),
  });
  return parseJsonSafe(res);
}

export async function createAdminReferralCampaign(payload: {
  name: string;
  partnerName: string;
  partnerEmail?: string;
  description?: string;
  slug: string;
  commissionRatePercent?: number;
  attributionWindowDays?: number;
  startDate?: string;
  endDate?: string;
  status?: ReferralCampaignStatus;
}): Promise<
  | { success: true; campaign: ReferralCampaign; overview: AdminReferralCampaignsOverview }
  | { success: false; error: string }
> {
  const res = await fetch('/api/admin/referral-campaigns', {
    method: 'POST',
    credentials: 'include',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function fetchAdminReferralCampaignDetail(
  campaignId: string
): Promise<({ success: true } & ReferralCampaignDetail) | { success: false; error: string }> {
  const res = await fetch(`/api/admin/referral-campaigns/${encodeURIComponent(campaignId)}`, {
    credentials: 'include',
    headers: adminHeaders(),
  });
  return parseJsonSafe(res);
}

export async function updateAdminReferralCampaign(
  campaignId: string,
  updates: Partial<{
    name: string;
    partnerName: string;
    partnerEmail: string;
    description: string;
    slug: string;
    commissionRatePercent: number;
    attributionWindowDays: number;
    startDate: string;
    endDate: string;
    status: ReferralCampaignStatus;
  }>
): Promise<
  | { success: true; campaign: ReferralCampaign; overview: AdminReferralCampaignsOverview }
  | { success: false; error: string }
> {
  const res = await fetch(`/api/admin/referral-campaigns/${encodeURIComponent(campaignId)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(updates),
  });
  return parseJsonSafe(res);
}

export async function approveAdminCampaignCommission(
  commissionId: string
): Promise<
  | { success: true; commission: CampaignCommissionRecord; overview: AdminReferralCampaignsOverview }
  | { success: false; error: string }
> {
  const res = await fetch(
    `/api/admin/referral-campaigns/commissions/${encodeURIComponent(commissionId)}/approve`,
    {
      method: 'POST',
      credentials: 'include',
      headers: adminHeaders(),
    }
  );
  return parseJsonSafe(res);
}

export async function markAdminCampaignCommissionsPaid(payload: {
  commissionIds: string[];
  paymentDate: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
}): Promise<
  | { success: true; payment: CommissionPaymentRecord; overview: AdminReferralCampaignsOverview }
  | { success: false; error: string }
> {
  const res = await fetch('/api/admin/referral-campaigns/commissions/mark-paid', {
    method: 'POST',
    credentials: 'include',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function reverseAdminCampaignCommission(
  commissionId: string,
  reason: string
): Promise<
  | { success: true; commission: CampaignCommissionRecord; overview: AdminReferralCampaignsOverview }
  | { success: false; error: string }
> {
  const res = await fetch(
    `/api/admin/referral-campaigns/commissions/${encodeURIComponent(commissionId)}/reverse`,
    {
      method: 'POST',
      credentials: 'include',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ reason }),
    }
  );
  return parseJsonSafe(res);
}

export async function fetchAdminMonthlyCommissionReport(monthKey: string): Promise<{
  success: boolean;
  monthKey?: string;
  rows?: MonthlyCommissionReportRow[];
  snapshot?: MonthlyCommissionReportSnapshot | null;
  error?: string;
}> {
  const res = await fetch(
    `/api/admin/referral-campaigns/reports/monthly?month=${encodeURIComponent(monthKey)}`,
    {
      credentials: 'include',
      headers: adminHeaders(),
    }
  );
  return parseJsonSafe(res);
}

export async function saveAdminMonthlyCommissionReportSnapshot(monthKey: string): Promise<{
  success: boolean;
  snapshot?: MonthlyCommissionReportSnapshot;
  overview?: AdminReferralCampaignsOverview;
  error?: string;
}> {
  const res = await fetch('/api/admin/referral-campaigns/reports/monthly/save', {
    method: 'POST',
    credentials: 'include',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ month: monthKey }),
  });
  return parseJsonSafe(res);
}

export async function downloadAdminMonthlyCommissionCsv(monthKey: string): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/admin/referral-campaigns/reports/monthly/export.csv?month=${encodeURIComponent(monthKey)}`,
      {
        credentials: 'include',
        headers: adminHeaders(),
      }
    );
    if (!res.ok) return false;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feviqo-commission-report-${monthKey}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch {
    return false;
  }
}

// =========================================================================
// PART 1: MUX PREMIUM VIDEO SECURITY ADMIN CLIENT
// =========================================================================

export interface MuxAssetAuditEntry {
  dramaId: string;
  dramaTitle: string;
  episodeSlug: string;
  episodeTitle: string;
  playbackId: string;
  playbackIdOverrideActive: boolean;
  sharesPlaybackIdWithFreeEpisode: boolean;
  sharedFreeEpisodeSlug: string | null;
  playbackPolicyMode: 'signed_jwt' | 'proxy_token_only';
  drmReady: boolean;
  restrictionApplied: boolean;
  auditStatus: 'protected' | 'warning_shared_playback_id' | 'warning_missing_signing_keys';
  auditNote: string;
}

export interface MuxPlaybackSessionEntry {
  id: string;
  memberId: string;
  memberEmail: string;
  dramaId: string;
  episodeSlug: string;
  membershipId: string;
  playbackId: string;
  issuedAt: string;
  expiresAt: string;
  lastHeartbeatAt: string;
  revokedAt?: string;
  revokedReason?: string;
  ip: string;
  userAgent: string;
  watermarkText: string;
}

export interface MuxSecurityEventEntry {
  id: string;
  type: string;
  memberId?: string;
  memberEmail?: string;
  dramaId?: string;
  episodeSlug?: string;
  sessionId?: string;
  ip: string;
  userAgent: string;
  reason: string;
  createdAt: string;
}

export interface MuxSecurityPosture {
  signingConfigured: boolean;
  signingKeyIdMasked: string | null;
  playbackRestrictionConfigured: boolean;
  drmConfigured: boolean;
  drmNote: string;
  allowedDomains: string[];
  proxyProtectionActive: boolean;
  directMp4Blocked: boolean;
  dynamicWatermarkingActive: boolean;
  maxConcurrentSessionsPerMember: number;
  sessionTtlSeconds: number;
}

export interface MuxSecurityOverview {
  posture: MuxSecurityPosture;
  assetAudit: MuxAssetAuditEntry[];
  activeSessions: MuxPlaybackSessionEntry[];
  recentSecurityEvents: MuxSecurityEventEntry[];
}

export async function fetchAdminMuxSecurityOverview(): Promise<
  ({ success: true } & MuxSecurityOverview) | { success: false; error: string }
> {
  const res = await fetch('/api/admin/mux-security/overview', {
    credentials: 'include',
    headers: adminHeaders(),
  });
  return parseJsonSafe(res);
}

export async function revokeAdminMuxPlaybackSession(
  sessionId: string,
  reason = 'Revoked by administrator'
): Promise<({ success: true } & MuxSecurityOverview) | { success: false; error: string }> {
  const res = await fetch(
    `/api/admin/mux-security/sessions/${encodeURIComponent(sessionId)}/revoke`,
    {
      method: 'POST',
      credentials: 'include',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ reason }),
    }
  );
  return parseJsonSafe(res);
}


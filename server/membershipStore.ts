import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  MEMBERSHIP_PLANS,
  MEMBERSHIP_DRAMAS,
  MembershipPlanId,
  getPlanById,
  getDramaById,
} from '../src/data/membershipCatalog';

const DATA_DIR = path.join(process.cwd(), 'data');
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');
const MEMBERSHIPS_FILE = path.join(DATA_DIR, 'memberships.json');
const ORDERS_FILE = path.join(DATA_DIR, 'membership_orders.json');
const HISTORY_FILE = path.join(DATA_DIR, 'membership_history.json');
const SECRET_FILE = path.join(DATA_DIR, '.member_session_secret');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Server-only protected episode stream URLs.
// Never export or serialize these into public catalog endpoints.
const PROTECTED_EPISODE_STREAMS: Record<string, Record<string, string>> = {
  teskilat: {
    'episode-189': 'https://stream.mux.com/toXOVmLVaJSsRkVRJUxYiColdHPoHLSI8qBM00KBHyuA.m3u8',
    'episode-188': 'https://stream.mux.com/myroEGBWeut02BU5yZEPr3GT3stSVu91dYtKAJPeJkfs.m3u8',
    'episode-187': 'https://stream.mux.com/vPkzwE9vrAHq4uz4hPyjFu4ZVQOzsORSqxYDzUnYm4o.m3u8',
    'episode-186': 'https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8',
  },
  'mehmed-fetihler-sultani': {
    'episode-90': 'https://stream.mux.com/iZwLfzcSIyWE302WmxZ39wVyGRbT00hw2gYJsdmKosn7s.m3u8',
    'episode-89': 'https://stream.mux.com/q3MFc527rZ7V0101YFeDLV8aCbWBk5oSnRsNQscKjDRuQ.m3u8',
    'episode-88': 'https://stream.mux.com/4yMhhN6VhrnhA72oCdYqlFQatv1k00kVcQHEuNYPo02Gg.m3u8',
    'episode-87': 'https://stream.mux.com/CNLUrkuH54rxQm44KMrZUcUtKj15j4RcxAyyn2fzTpU.m3u8',
  },
  'gunesin-dogdugu-yer': {
    'episode-7': 'https://stream.mux.com/neflT01u9Ey4vSvhNwuZQH8LcR9IpeWcDFnHO4hS7N02M.m3u8',
    'episode-5': 'https://stream.mux.com/i1zZCVwsVnWgYj01cysfhD02801SVUNouReM02jM5QUmvjg.m3u8',
    'episode-4': 'https://stream.mux.com/Ck3e005cjwlomj37YDhAp2WFDcwAOcpGsPLagVVtxaVU.m3u8',
    'episode-3': 'https://stream.mux.com/ff2G9XfcMerNcnD02iPnysGkByH6SMTSa7p2yP01DuzT4.m3u8',
  },
};

export interface MemberRecord {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface SafeMember {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export type MembershipStatus = 'active' | 'cancelled' | 'expired';

export interface MembershipRecord {
  id: string;
  memberId: string;
  orderId: string;
  planId: MembershipPlanId;
  planName: string;
  pricePkr: number;
  durationDays: number;
  selectedDramaIds: string[];
  status: MembershipStatus;
  activatedAt: string;
  expiresAt: string;
  cancelledAt?: string;
  paymentProvider: string;
  paymentReference: string;
  createdAt: string;
}

export type OrderStatus = 'pending_payment' | 'paid' | 'failed' | 'cancelled';

export interface MembershipOrder {
  id: string;
  memberId: string;
  planId: MembershipPlanId;
  planName: string;
  amountPkr: number;
  durationDays: number;
  selectedDramaIds: string[];
  status: OrderStatus;
  provider: string;
  providerSessionId?: string;
  checkoutUrl?: string;
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
    | 'membership_activated'
    | 'membership_cancelled'
    | 'membership_expired';
  planId?: MembershipPlanId;
  planName?: string;
  amountPkr?: number;
  selectedDramaIds?: string[];
  details: string;
  createdAt: string;
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
    }
  } catch (err) {
    console.error(`[MembershipStore] Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJson<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
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
    return { memberId: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}

function sanitizeMember(member: MemberRecord): SafeMember {
  return {
    id: member.id,
    email: member.email,
    fullName: member.fullName,
    createdAt: member.createdAt,
  };
}

function appendHistory(entry: Omit<MembershipHistoryEntry, 'id' | 'createdAt'>): MembershipHistoryEntry {
  const history = readJson<MembershipHistoryEntry[]>(HISTORY_FILE, []);
  const item: MembershipHistoryEntry = {
    ...entry,
    id: `hist-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    createdAt: new Date().toISOString(),
  };
  history.unshift(item);
  if (history.length > 2000) history.length = 2000;
  writeJson(HISTORY_FILE, history);
  return item;
}

export function getMemberById(memberId: string): SafeMember | null {
  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  const found = members.find((m) => m.id === memberId);
  return found ? sanitizeMember(found) : null;
}

export function registerMember(params: {
  email: string;
  password: string;
  fullName?: string;
}): { success: true; member: SafeMember; token: string } | { success: false; error: string } {
  const email = (params.email || '').trim().toLowerCase();
  const password = params.password || '';
  const fullName = (params.fullName || '').trim() || email.split('@')[0];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  if (members.some((m) => m.email === email)) {
    return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
  }

  const now = new Date().toISOString();
  const newMember: MemberRecord = {
    id: `mem-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    email,
    fullName,
    passwordHash: hashMemberPassword(password),
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

  const safe = sanitizeMember(newMember);
  return { success: true, member: safe, token: createMemberSessionToken(safe) };
}

export function loginMember(params: {
  email: string;
  password: string;
}): { success: true; member: SafeMember; token: string } | { success: false; error: string } {
  const email = (params.email || '').trim().toLowerCase();
  const password = params.password || '';

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  const found = members.find((m) => m.email === email);
  if (!found || !verifyMemberPassword(password, found.passwordHash)) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const safe = sanitizeMember(found);
  return { success: true, member: safe, token: createMemberSessionToken(safe) };
}

/**
 * Reconciles expiry timestamps for a member's memberships so expired plans
 * immediately transition to 'expired' and revoke playback entitlement.
 */
export function syncMemberSubscriptions(memberId: string): MembershipRecord[] {
  const all = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const now = Date.now();
  let changed = false;

  for (const sub of all) {
    if (sub.memberId === memberId && sub.status === 'active') {
      const expMs = Date.parse(sub.expiresAt);
      if (Number.isNaN(expMs) || now >= expMs) {
        sub.status = 'expired';
        changed = true;
        appendHistory({
          memberId,
          membershipId: sub.id,
          orderId: sub.orderId,
          event: 'membership_expired',
          planId: sub.planId,
          planName: sub.planName,
          selectedDramaIds: sub.selectedDramaIds,
          details: `${sub.planName} membership expired at ${sub.expiresAt}.`,
        });
      }
    }
  }

  if (changed) {
    writeJson(MEMBERSHIPS_FILE, all);
  }

  return all
    .filter((s) => s.memberId === memberId)
    .sort((a, b) => Date.parse(b.activatedAt) - Date.parse(a.activatedAt));
}

export function getMemberAccountState(memberId: string) {
  const member = getMemberById(memberId);
  if (!member) return null;

  const memberships = syncMemberSubscriptions(memberId);
  const activeMembership = memberships.find((m) => m.status === 'active') || null;
  const latestMembership = memberships[0] || null;
  const orders = readJson<MembershipOrder[]>(ORDERS_FILE, [])
    .filter((o) => o.memberId === memberId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const history = readJson<MembershipHistoryEntry[]>(HISTORY_FILE, [])
    .filter((h) => h.memberId === memberId);

  let remainingDays = 0;
  if (activeMembership) {
    const diffMs = Math.max(0, Date.parse(activeMembership.expiresAt) - Date.now());
    remainingDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  }

  // Unlocked dramas & episodes metadata (strictly WITHOUT streamUrls)
  const unlockedDramaIds = activeMembership
    ? activeMembership.planId === 'vip'
      ? MEMBERSHIP_DRAMAS.filter((d) => d.vipEligible).map((d) => d.id)
      : activeMembership.selectedDramaIds
    : [];

  const unlockedDramas = MEMBERSHIP_DRAMAS.filter((d) => unlockedDramaIds.includes(d.id));

  return {
    member,
    activeMembership,
    latestMembership,
    remainingDays,
    unlockedDramaIds,
    unlockedDramas,
    orders,
    history,
    gatewayStatus: getPaymentGatewayStatus(),
  };
}

export function validatePlanAndDramas(params: {
  planId: string;
  selectedDramaIds: unknown;
}):
  | {
      valid: true;
      plan: NonNullable<ReturnType<typeof getPlanById>>;
      normalizedDramaIds: string[];
    }
  | { valid: false; error: string } {
  const plan = getPlanById(params.planId);
  if (!plan) {
    return { valid: false, error: 'Selected membership plan is invalid.' };
  }

  if (plan.dramaLimit === 'all') {
    const vipIds = MEMBERSHIP_DRAMAS.filter((d) => d.vipEligible).map((d) => d.id);
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

export interface PaymentGatewayStatus {
  configured: boolean;
  provider: 'stripe' | 'safepay' | 'payfast' | 'none';
  missingCredentials: string[];
  instructions: string;
}

export function getPaymentGatewayStatus(): PaymentGatewayStatus {
  const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  if (hasStripe) {
    return {
      configured: true,
      provider: 'stripe',
      missingCredentials: [],
      instructions: 'Stripe Checkout is active for PKR payments.',
    };
  }

  const hasSafepay = Boolean(process.env.SAFEPAY_SECRET_KEY && process.env.SAFEPAY_WEBHOOK_SECRET);
  if (hasSafepay) {
    return {
      configured: true,
      provider: 'safepay',
      missingCredentials: [],
      instructions: 'Safepay Pakistan payment verification is active.',
    };
  }

  const hasPayFast = Boolean(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_SECURED_KEY);
  if (hasPayFast) {
    return {
      configured: true,
      provider: 'payfast',
      missingCredentials: [],
      instructions: 'PayFast Pakistan payment verification is active.',
    };
  }

  return {
    configured: false,
    provider: 'none',
    missingCredentials: [
      'STRIPE_SECRET_KEY & STRIPE_WEBHOOK_SECRET (for card checkout in PKR)',
      'OR SAFEPAY_SECRET_KEY & SAFEPAY_WEBHOOK_SECRET (Pakistan cards/wallets)',
      'OR PAYFAST_MERCHANT_ID & PAYFAST_SECURED_KEY (Pakistan wallets/bank)',
    ],
    instructions:
      'Live payment settlement requires configuring payment gateway merchant credentials in environment secrets. Orders are securely saved as Pending Payment until verified.',
  };
}

export async function createMembershipCheckoutOrder(params: {
  memberId: string;
  planId: string;
  selectedDramaIds: unknown;
  originUrl: string;
}): Promise<
  | {
      success: true;
      order: MembershipOrder;
      gatewayConfigured: boolean;
      paymentSetupRequired: boolean;
      checkoutUrl?: string;
      gatewayStatus: PaymentGatewayStatus;
    }
  | { success: false; error: string; statusCode?: number }
> {
  const member = getMemberById(params.memberId);
  if (!member) {
    return { success: false, error: 'Member account not found.', statusCode: 404 };
  }

  const validation = validatePlanAndDramas({
    planId: params.planId,
    selectedDramaIds: params.selectedDramaIds,
  });
  if (!('plan' in validation)) {
    return { success: false, error: validation.error, statusCode: 400 };
  }

  const { plan, normalizedDramaIds } = validation;
  const gatewayStatus = getPaymentGatewayStatus();
  const now = new Date().toISOString();
  const orderId = `ord-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const order: MembershipOrder = {
    id: orderId,
    memberId: member.id,
    planId: plan.id,
    planName: plan.name,
    amountPkr: plan.pricePkr,
    durationDays: plan.durationDays,
    selectedDramaIds: normalizedDramaIds,
    status: 'pending_payment',
    provider: gatewayStatus.provider,
    createdAt: now,
    updatedAt: now,
  };

  if (gatewayStatus.provider === 'stripe' && process.env.STRIPE_SECRET_KEY) {
    try {
      const formBody = new URLSearchParams({
        mode: 'payment',
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': 'pkr',
        'line_items[0][price_data][product_data][name]': `FEVIQO Premium Membership — ${plan.name}`,
        'line_items[0][price_data][product_data][description]': `${plan.durationLabel} · ${plan.inclusionText}`,
        'line_items[0][price_data][unit_amount]': String(plan.pricePkr * 100),
        'line_items[0][quantity]': '1',
        customer_email: member.email,
        success_url: `${params.originUrl}/membership?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${params.originUrl}/membership?checkout=cancelled&order=${orderId}`,
        'metadata[orderId]': orderId,
        'metadata[memberId]': member.id,
        'metadata[planId]': plan.id,
      });

      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });
      const stripeData: any = await stripeRes.json();
      if (!stripeRes.ok || !stripeData?.url) {
        return {
          success: false,
          error: stripeData?.error?.message || 'Unable to initiate Stripe payment session.',
          statusCode: 502,
        };
      }
      order.providerSessionId = stripeData.id;
      order.checkoutUrl = stripeData.url;
    } catch (err) {
      console.error('[MembershipStore] Stripe session creation failed:', err);
      return {
        success: false,
        error: 'Payment provider communication failed while creating checkout session.',
        statusCode: 502,
      };
    }
  }

  const orders = readJson<MembershipOrder[]>(ORDERS_FILE, []);
  orders.unshift(order);
  writeJson(ORDERS_FILE, orders);

  appendHistory({
    memberId: member.id,
    orderId: order.id,
    event: 'checkout_created',
    planId: plan.id,
    planName: plan.name,
    amountPkr: plan.pricePkr,
    selectedDramaIds: normalizedDramaIds,
    details: `Order ${order.id} created for ${plan.name} (${plan.priceDisplay}) — awaiting verified payment.`,
  });

  return {
    success: true,
    order,
    gatewayConfigured: gatewayStatus.configured,
    paymentSetupRequired: !gatewayStatus.configured,
    checkoutUrl: order.checkoutUrl,
    gatewayStatus,
  };
}

/**
 * Activates a pending order ONLY after cryptographic/API payment verification.
 */
export function activatePaidOrder(params: {
  orderId: string;
  paymentProvider: string;
  paymentReference: string;
}): { success: true; membership: MembershipRecord } | { success: false; error: string } {
  const orders = readJson<MembershipOrder[]>(ORDERS_FILE, []);
  const orderIdx = orders.findIndex((o) => o.id === params.orderId);
  if (orderIdx === -1) {
    return { success: false, error: 'Order not found.' };
  }

  const order = orders[orderIdx];
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  if (order.status === 'paid') {
    const existingSubs = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
    const foundSub = existingSubs.find((s) => s.orderId === order.id);
    if (foundSub) {
      return { success: true, membership: foundSub };
    }
  }

  order.status = 'paid';
  order.paidAt = nowIso;
  order.updatedAt = nowIso;
  orders[orderIdx] = order;
  writeJson(ORDERS_FILE, orders);

  // Cancel any prior active membership so one active tier applies cleanly
  const memberships = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  for (const existing of memberships) {
    if (existing.memberId === order.memberId && existing.status === 'active') {
      existing.status = 'cancelled';
      existing.cancelledAt = nowIso;
    }
  }

  const expiresAtIso = new Date(nowMs + order.durationDays * 24 * 60 * 60 * 1000).toISOString();
  const newMembership: MembershipRecord = {
    id: `sub-${nowMs}-${crypto.randomBytes(3).toString('hex')}`,
    memberId: order.memberId,
    orderId: order.id,
    planId: order.planId,
    planName: order.planName,
    pricePkr: order.amountPkr,
    durationDays: order.durationDays,
    selectedDramaIds: order.selectedDramaIds,
    status: 'active',
    activatedAt: nowIso,
    expiresAt: expiresAtIso,
    paymentProvider: params.paymentProvider,
    paymentReference: params.paymentReference,
    createdAt: nowIso,
  };

  memberships.unshift(newMembership);
  writeJson(MEMBERSHIPS_FILE, memberships);

  appendHistory({
    memberId: order.memberId,
    membershipId: newMembership.id,
    orderId: order.id,
    event: 'membership_activated',
    planId: order.planId,
    planName: order.planName,
    amountPkr: order.amountPkr,
    selectedDramaIds: order.selectedDramaIds,
    details: `${order.planName} activated via ${params.paymentProvider} (${params.paymentReference}). Valid until ${expiresAtIso}.`,
  });

  return { success: true, membership: newMembership };
}

export function verifyStripeWebhookSignature(rawBody: string | Buffer, sigHeader: string): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !sigHeader) return false;
  try {
    const parts = sigHeader.split(',');
    const tPart = parts.find((p) => p.startsWith('t='));
    const v1Parts = parts.filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
    if (!tPart || v1Parts.length === 0) return false;
    const timestamp = tPart.slice(2);
    const payload = `${timestamp}.${Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const expBuf = Buffer.from(expected, 'hex');
    return v1Parts.some((sig) => {
      const sigBuf = Buffer.from(sig, 'hex');
      return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
    });
  } catch {
    return false;
  }
}

export async function confirmStripeCheckoutSession(params: {
  memberId: string;
  orderId: string;
  sessionId: string;
}) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { success: false, error: 'Stripe gateway is not configured.' };
  }
  const orders = readJson<MembershipOrder[]>(ORDERS_FILE, []);
  const order = orders.find((o) => o.id === params.orderId && o.memberId === params.memberId);
  if (!order) {
    return { success: false, error: 'Order not found for your account.' };
  }

  const res = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(params.sessionId)}`,
    {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    }
  );
  const session: any = await res.json();
  if (!res.ok || session?.payment_status !== 'paid' || session?.metadata?.orderId !== order.id) {
    return { success: false, error: 'Payment has not settled with Stripe yet.' };
  }

  return activatePaidOrder({
    orderId: order.id,
    paymentProvider: 'stripe',
    paymentReference: session.payment_intent || session.id,
  });
}

export function cancelMemberSubscription(memberId: string): {
  success: boolean;
  membership?: MembershipRecord;
  error?: string;
} {
  const all = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const idx = all.findIndex((s) => s.memberId === memberId && s.status === 'active');
  if (idx === -1) {
    return { success: false, error: 'No active membership found to cancel.' };
  }

  const nowIso = new Date().toISOString();
  all[idx].status = 'cancelled';
  all[idx].cancelledAt = nowIso;
  writeJson(MEMBERSHIPS_FILE, all);

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
      dramaTitle: string;
      episodeTitle: string;
      planName: string;
      expiresAt: string;
    }
  | {
      authorized: false;
      statusCode: number;
      code:
        | 'UNAUTHENTICATED'
        | 'NO_ACTIVE_MEMBERSHIP'
        | 'MEMBERSHIP_CANCELLED'
        | 'MEMBERSHIP_EXPIRED'
        | 'DRAMA_NOT_INCLUDED'
        | 'EPISODE_NOT_FOUND';
      error: string;
    } {
  const drama = getDramaById(params.dramaId);
  const episode = drama?.episodes.find((e) => e.slug === params.episodeSlug);
  const serverStreamUrl = PROTECTED_EPISODE_STREAMS[params.dramaId]?.[params.episodeSlug];

  if (!drama || !episode || !serverStreamUrl) {
    return {
      authorized: false,
      statusCode: 404,
      code: 'EPISODE_NOT_FOUND',
      error: 'Requested episode was not found in the FEVIQO catalogue.',
    };
  }

  if (!params.memberId) {
    return {
      authorized: false,
      statusCode: 401,
      code: 'UNAUTHENTICATED',
      error: 'Sign in with your FEVIQO member account to watch protected episodes.',
    };
  }

  const memberships = syncMemberSubscriptions(params.memberId);
  const active = memberships.find((m) => m.status === 'active');

  if (!active) {
    const latest = memberships[0];
    if (latest?.status === 'cancelled') {
      return {
        authorized: false,
        statusCode: 403,
        code: 'MEMBERSHIP_CANCELLED',
        error: 'Your membership has been cancelled. Choose a plan to restore streaming access.',
      };
    }
    if (latest?.status === 'expired') {
      return {
        authorized: false,
        statusCode: 403,
        code: 'MEMBERSHIP_EXPIRED',
        error: 'Your membership term has expired. Renew your membership to continue watching.',
      };
    }
    return {
      authorized: false,
      statusCode: 403,
      code: 'NO_ACTIVE_MEMBERSHIP',
      error: 'An active FEVIQO Premium Membership is required to stream this episode.',
    };
  }

  const dramaIncluded =
    (active.planId === 'vip' && drama.vipEligible) ||
    active.selectedDramaIds.includes(drama.id);

  if (!dramaIncluded) {
    return {
      authorized: false,
      statusCode: 403,
      code: 'DRAMA_NOT_INCLUDED',
      error: `${drama.title} is not included in your current ${active.planName} drama selection.`,
    };
  }

  return {
    authorized: true,
    streamUrl: serverStreamUrl,
    dramaTitle: drama.title,
    episodeTitle: episode.title,
    planName: active.planName,
    expiresAt: active.expiresAt,
  };
}

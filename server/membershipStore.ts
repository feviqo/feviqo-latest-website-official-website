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
const SECRET_FILE = path.join(DATA_DIR, '.member_session_secret');

for (const dir of [DATA_DIR, PRIVATE_PROOFS_DIR, PUBLIC_QR_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Server-only protected episode stream URLs.
// Never export or serialize these into public catalog endpoints or static frontend bundles.
const PROTECTED_EPISODE_STREAMS: Record<string, Record<string, string>> = {
  teskilat: {
    'episode-192': 'https://stream.mux.com/9KzAsaCfqKFh5hi4k5o5NCUuYWa3TbQsbCrVgsih8WU.m3u8',
    'episode-189': 'https://stream.mux.com/toXOVmLVaJSsRkVRJUxYiColdHPoHLSI8qBM00KBHyuA.m3u8',
    'episode-188': 'https://stream.mux.com/myroEGBWeut02BU5yZEPr3GT3stSVu91dYtKAJPeJkfs.m3u8',
    'episode-187': 'https://stream.mux.com/vPkzwE9vrAHq4uz4hPyjFu4ZVQOzsORSqxYDzUnYm4o.m3u8',
    'episode-186': 'https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8',
  },
  'mehmed-fetihler-sultani': {
    'episode-91': 'https://stream.mux.com/iZwLfzcSIyWE302WmxZ39wVyGRbT00hw2gYJsdmKosn7s.m3u8',
    'episode-90': 'https://stream.mux.com/iZwLfzcSIyWE302WmxZ39wVyGRbT00hw2gYJsdmKosn7s.m3u8',
    'episode-89': 'https://stream.mux.com/q3MFc527rZ7V0101YFeDLV8aCbWBk5oSnRsNQscKjDRuQ.m3u8',
    'episode-88': 'https://stream.mux.com/4yMhhN6VhrnhA72oCdYqlFQatv1k00kVcQHEuNYPo02Gg.m3u8',
    'episode-87': 'https://stream.mux.com/CNLUrkuH54rxQm44KMrZUcUtKj15j4RcxAyyn2fzTpU.m3u8',
  },
  'gunesin-dogdugu-yer': {
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
  passwordHash: string;
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
  createdAt: string;
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
    | 'membership_expired';
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
  | 'payment_rejected';

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
    | 'reminders_executed';
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
  return {
    id: member.id,
    ownerUid: member.ownerUid,
    authMethod: inferMemberAuthMethod(member),
    email: member.email,
    fullName: member.fullName,
    phone: member.phone || '',
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

function createCustomerNotificationRecord(
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
  updatedAt: new Date().toISOString(),
};

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

// --- MEMBER REGISTRATION & LOGIN ---
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
  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  const found = members.find((m) => m.id === memberId);
  return found ? sanitizeMember(found) : null;
}

export function registerMember(params: {
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
}): { success: true; member: SafeMember; token: string } | { success: false; error: string; statusCode?: number } {
  const email = (params.email || '').trim().toLowerCase();
  const password = params.password || '';
  const confirmPassword = params.confirmPassword;
  const fullName = (params.fullName || '').trim();

  if (!fullName || fullName.length < 2) {
    return { success: false, error: 'Full Name is required.', statusCode: 400 };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.', statusCode: 400 };
  }

  const phoneCheck = normalizeAndValidatePhone(params.phone);
  if (!('phone' in phoneCheck)) {
    return { success: false, error: phoneCheck.error, statusCode: 400 };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.', statusCode: 400 };
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { success: false, error: 'Password and Confirm Password do not match.', statusCode: 400 };
  }

  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  if (members.some((m) => m.email === email)) {
    return {
      success: false,
      error: 'An account with this email already exists. Please sign in instead.',
      statusCode: 409,
    };
  }

  const now = new Date().toISOString();
  const newMember: MemberRecord = {
    id: `mem-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    ownerUid: 'email_member',
    authMethod: 'email',
    email,
    fullName,
    phone: phoneCheck.phone,
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
  mirrorMemberServer(safe);
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

export function upsertGoogleMember(params: {
  uid: string;
  email: string;
  fullName?: string;
  phone?: string;
}): { success: true; member: SafeMember; token: string } | { success: false; error: string } {
  const email = (params.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Verified Google email is required.' };
  }

  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  const now = new Date().toISOString();
  const existingIdx = members.findIndex((m) => m.email === email);

  if (existingIdx !== -1) {
    const existing = members[existingIdx];
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
      updated = true;
    }
    if (updated) {
      existing.updatedAt = now;
      members[existingIdx] = existing;
      writeJson(MEMBERS_FILE, members);
    }
    const safe = sanitizeMember(existing);
    if (updated) mirrorMemberServer(safe);
    return { success: true, member: safe, token: createMemberSessionToken(safe) };
  }

  const newMember: MemberRecord = {
    id: `mem-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    ownerUid: params.uid,
    authMethod: 'google',
    email,
    fullName: (params.fullName || email.split('@')[0] || 'FEVIQO Member').trim().slice(0, 120),
    phone: (params.phone || '').trim().slice(0, 32),
    passwordHash: hashMemberPassword(crypto.randomBytes(24).toString('hex')),
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

  const safe = sanitizeMember(newMember);
  mirrorMemberServer(safe);
  return { success: true, member: safe, token: createMemberSessionToken(safe) };
}

export function isMemberPhoneValid(phone?: string): boolean {
  const digits = (phone || '').replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function updateMemberPhone(params: {
  memberId: string;
  phone: string;
}): { success: true; member: SafeMember } | { success: false; error: string; statusCode?: number } {
  const phoneCheck = normalizeAndValidatePhone(params.phone);
  if (!('phone' in phoneCheck)) {
    return { success: false, error: phoneCheck.error, statusCode: 400 };
  }

  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  const idx = members.findIndex((m) => m.id === params.memberId);
  if (idx === -1) {
    return { success: false, error: 'Member account not found.', statusCode: 404 };
  }

  const now = new Date().toISOString();
  members[idx].phone = phoneCheck.phone.slice(0, 32);
  members[idx].updatedAt = now;
  writeJson(MEMBERS_FILE, members);

  const safe = sanitizeMember(members[idx]);
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
  if (sub.planId === 'vip') {
    return MEMBERSHIP_DRAMAS.filter((d) => d.vipEligible).map((d) => d.id);
  }
  return Array.isArray(sub.selectedDramaIds) ? sub.selectedDramaIds : [];
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

export function getMemberAccountState(memberId: string) {
  const member = getMemberById(memberId);
  if (!member) return null;

  const memberships = syncMemberSubscriptions(memberId);
  const activeMemberships = memberships
    .filter((m) => m.status === 'active' && Date.parse(m.expiresAt) > Date.now())
    .sort((a, b) => Date.parse(b.expiresAt) - Date.parse(a.expiresAt));

  const activeMembership = activeMemberships[0] || null;
  const latestMembership = memberships[0] || null;
  const orders = readAllOrders()
    .filter((o) => o.memberId === memberId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const history = readJson<MembershipHistoryEntry[]>(HISTORY_FILE, [])
    .filter((h) => h.memberId === memberId);

  const notifications = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, [])
    .filter((n) => n.memberId === memberId && !n.supersededAt)
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
}): Promise<
  | {
      success: true;
      order: MembershipOrder;
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
  const paymentRegion: PaymentRegion =
    params.paymentRegion === 'international' ? 'international' : 'pakistan';
  const paymentMethod: PaymentMethod =
    paymentRegion === 'international' ? 'binance_qr' : 'bank_qr';
  const currency: PaymentCurrency =
    paymentRegion === 'international' ? 'USD' : 'PKR';
  const expectedAmount =
    paymentRegion === 'international' ? plan.priceUsd : plan.pricePkr;

  const qrImageUrl = getQrUrlForPlan(plan.id, paymentRegion);
  const now = new Date().toISOString();
  const orderId = `ord-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  // Security: Price, currency & duration ALWAYS derive strictly from server config/catalog
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
    amountPkr: plan.pricePkr,
    amountUsd: plan.priceUsd,
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
    amountPkr: plan.pricePkr,
    amountUsd: plan.priceUsd,
    currency,
    selectedDramaIds: normalizedDramaIds,
    details: `${orderType === 'renewal' ? 'Renewal' : 'New'} payment request ${order.id} created for ${plan.name} (${amountLabel} via ${paymentMethod === 'binance_qr' ? 'Binance QR' : 'Bank QR'}).`,
  });

  return {
    success: true,
    order,
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
    plan.dramaLimit === 'all'
      ? MEMBERSHIP_DRAMAS.filter((d) => d.vipEligible).map((d) => d.id)
      : order.selectedDramaIds;
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
      target.pricePkr = plan.pricePkr;
      target.priceUsd = order.amountUsd ?? plan.priceUsd;
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
      pricePkr: plan.pricePkr,
      priceUsd: order.amountUsd ?? plan.priceUsd,
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
    amountPkr: plan.pricePkr,
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
    member: orderMember,
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

  if (isServerFirestoreEnabled()) {
    void deleteDocFromFirestoreServer('members', member.id);
    for (const id of deletedOrderIds) void deleteDocFromFirestoreServer('membershipOrders', id);
    for (const id of deletedMembershipIds) void deleteDocFromFirestoreServer('memberships', id);
    for (const id of deletedHistoryIds) void deleteDocFromFirestoreServer('membershipHistory', id);
    for (const id of deletedNotificationIds) void deleteDocFromFirestoreServer('memberNotifications', id);
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
  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  let memberIdx = members.findIndex((m) => m.email === cleanEmail);
  let member: MemberRecord;

  if (memberIdx === -1) {
    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Customer Full Name is required for a new member.', statusCode: 400 };
    }
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
      passwordHash: hashMemberPassword(rawPass),
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
  config?: Partial<MembershipConfig> | null;
}) {
  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []);
  const memberById = new Map(members.map((m) => [m.id, m]));
  const memberByEmail = new Map(members.map((m) => [m.email.toLowerCase(), m]));

  for (const incoming of payload.members || []) {
    if (!incoming?.id || !incoming?.email) continue;
    const emailLower = incoming.email.trim().toLowerCase();
    const existing = memberById.get(incoming.id) || memberByEmail.get(emailLower);
    if (!existing) {
      const created: MemberRecord = {
        id: incoming.id,
        ownerUid: incoming.ownerUid,
        email: emailLower,
        fullName: incoming.fullName || 'FEVIQO Member',
        phone: incoming.phone || '',
        passwordHash: incoming.passwordHash || hashMemberPassword(crypto.randomBytes(16).toString('hex')),
        createdAt: incoming.createdAt || new Date().toISOString(),
        updatedAt: incoming.updatedAt || new Date().toISOString(),
      };
      members.push(created);
      memberById.set(created.id, created);
      memberByEmail.set(created.email, created);
    } else if (incoming.ownerUid && !existing.ownerUid) {
      existing.ownerUid = incoming.ownerUid;
    }
  }
  writeJson(MEMBERS_FILE, members);

  const orders = readAllOrders();
  const orderById = new Map(orders.map((o) => [o.id, o]));
  for (const inc of payload.orders || []) {
    if (!inc?.id || !inc?.memberId || !inc?.planId) continue;
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

  const memberships = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  const subById = new Map(memberships.map((s) => [s.id, s]));
  for (const inc of payload.memberships || []) {
    if (!inc?.id || !inc?.memberId || !inc?.planId) continue;
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

  const history = readJson<MembershipHistoryEntry[]>(HISTORY_FILE, []);
  const histById = new Map(history.map((h) => [h.id, h]));
  for (const inc of payload.history || []) {
    if (!inc?.id || !inc?.memberId || !inc?.details) continue;
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
    const notifs = readJson<CustomerNotification[]>(MEMBER_NOTIFS_FILE, []);
    const notifById = new Map(notifs.map((n) => [n.id, n]));
    for (const inc of payload.notifications) {
      if (!inc?.id || !inc?.memberId || !inc?.dedupeKey) continue;
      if (!notifById.has(inc.id)) {
        notifById.set(inc.id, inc as CustomerNotification);
      }
    }
    writeJson(
      MEMBER_NOTIFS_FILE,
      Array.from(notifById.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    );
  }

  if (payload.config && payload.config.updatedAt) {
    const current = getMembershipConfig();
    if (Date.parse(payload.config.updatedAt) > Date.parse(current.updatedAt || '')) {
      writeJson(CONFIG_FILE, { ...current, ...payload.config });
    }
  }

  return getAdminMembershipsOverview();
}

// --- ADMIN OVERVIEW DASHBOARD DATA ---
export function getAdminMembershipsOverview() {
  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []).map(sanitizeMember);
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

  const nowMs = Date.now();
  const in7d = nowMs + 7 * 86400000;
  const expiring7dCount = enrichedMemberships.filter(
    (m) => m.status === 'active' && Date.parse(m.expiresAt) > nowMs && Date.parse(m.expiresAt) <= in7d
  ).length;

  const metrics = {
    totalMembers: members.length,
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
  };

  return {
    metrics,
    members,
    requests: orders,
    memberships: enrichedMemberships,
    history,
    auditLogs: auditLogs.slice(0, 120),
    emailNotifications: emailNotifications.slice(0, 100),
    customerNotifications,
    schedulerRuns,
    config: getMembershipConfig(),
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
    mirrorConfigServer(overview.config);
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
      thumbnail: string;
      fallbackThumbnail: string;
      planName: string;
      expiresAt: string;
      membershipId: string;
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
      coveredDramaIds?: string[];
      activePlanNames?: string[];
      expiredMembershipId?: string;
      expiredPlanId?: MembershipPlanId;
      expiresAt?: string;
    } {
  const drama = getDramaById(params.dramaId);
  const episode = getEpisodeMeta(params.dramaId, params.episodeSlug);
  const serverStreamUrl = PROTECTED_EPISODE_STREAMS[params.dramaId]?.[params.episodeSlug];

  if (!drama || !episode || !episode.isPublished || !serverStreamUrl) {
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
  const activeList = memberships.filter(
    (m) => m.status === 'active' && Date.parse(m.expiresAt) > Date.now()
  );

  if (activeList.length === 0) {
    // Prefer an expired membership that previously covered this drama, else latest
    const matchingExpired = memberships.find(
      (m) =>
        m.status === 'expired' &&
        ((m.planId === 'vip' && drama.vipEligible) || m.selectedDramaIds.includes(drama.id))
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

  const matchingActive = activeList.find(
    (m) => (m.planId === 'vip' && drama.vipEligible) || m.selectedDramaIds.includes(drama.id)
  );

  if (!matchingActive) {
    const coveredSet = new Set<string>();
    const planNames = new Set<string>();
    for (const m of activeList) {
      planNames.add(m.planName);
      for (const id of getMembershipDramaIds(m)) coveredSet.add(id);
    }
    const matchingExpired = memberships.find(
      (m) =>
        m.status === 'expired' &&
        ((m.planId === 'vip' && drama.vipEligible) || m.selectedDramaIds.includes(drama.id))
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

  return {
    authorized: true,
    streamUrl: serverStreamUrl,
    dramaTitle: drama.title,
    episodeTitle: episode.title,
    thumbnail: episode.thumbnail,
    fallbackThumbnail: drama.fallbackPosterUrl,
    planName: matchingActive.planName,
    expiresAt: matchingActive.expiresAt,
    membershipId: matchingActive.id,
  };
}

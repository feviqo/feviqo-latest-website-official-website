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
const SECRET_FILE = path.join(DATA_DIR, '.member_session_secret');

for (const dir of [DATA_DIR, PRIVATE_PROOFS_DIR, PUBLIC_QR_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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
  phone: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface SafeMember {
  id: string;
  email: string;
  fullName: string;
  phone: string;
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
  revokedByAdminEmail?: string;
  revokedReason?: string;
  approvedByAdminEmail?: string;
  paymentProvider: string;
  paymentReference: string;
  createdAt: string;
}

export type OrderStatus =
  | 'awaiting_payment'
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface MembershipOrder {
  id: string;
  memberId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  planId: MembershipPlanId;
  planName: string;
  amountPkr: number;
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
  proofSubmittedAt?: string;
  paymentNote?: string;
  rejectionReason?: string;
  reviewedByAdminId?: string;
  reviewedByAdminEmail?: string;
  reviewedAt?: string;
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
    | 'membership_cancelled'
    | 'membership_revoked'
    | 'membership_expired';
  planId?: MembershipPlanId;
  planName?: string;
  amountPkr?: number;
  selectedDramaIds?: string[];
  details: string;
  createdAt: string;
}

export interface MembershipConfig {
  starterQrImage: string;
  standardQrImage: string;
  plusQrImage: string;
  vipQrImage: string;
  whatsappNumber: string;
  adminEmail: string;
  supportEmail: string;
  supportNoteEn: string;
  supportNoteUr: string;
  updatedAt: string;
}

export interface PublicMembershipConfig {
  qrImages: Record<MembershipPlanId, string>;
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
    | 'membership_revoked'
    | 'config_updated'
    | 'qr_image_updated'
    | 'email_retried';
  targetId?: string;
  details: string;
  createdAt: string;
}

export interface EmailNotificationLog {
  id: string;
  orderId?: string;
  to: string;
  subject: string;
  html: string;
  type: 'admin_payment_verification' | 'member_payment_approved' | 'member_payment_rejected';
  status: 'sent' | 'failed';
  provider?: string;
  error?: string;
  attempts: number;
  createdAt: string;
  lastAttemptAt: string;
}

export interface PaymentGatewayStatus {
  configured: boolean;
  provider: 'bank_qr' | 'stripe' | 'safepay' | 'payfast';
  missingCredentials: string[];
  instructions: string;
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

function sanitizeMember(member: MemberRecord): SafeMember {
  return {
    id: member.id,
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

// --- CONFIGURATION STORE ---
const DEFAULT_CONFIG: MembershipConfig = {
  starterQrImage: '/images/qr/starter-qr.jpg',
  standardQrImage: '/images/qr/standard-qr.jpg',
  plusQrImage: '/images/qr/plus-qr.jpg',
  vipQrImage: '/images/qr/vip-qr.jpg',
  whatsappNumber: (process.env.FEVIQO_WHATSAPP_NUMBER || '').trim(),
  adminEmail: (process.env.FEVIQO_ADMIN_EMAIL || 'rexanmedia01@gmail.com').trim(),
  supportEmail: 'partner@feviqo.com',
  supportNoteEn: 'Payments are manually verified by our team before membership activation.',
  supportNoteUr: 'ادائیگی کی دستی تصدیق کے بعد آپ کی ممبرشپ فعال کر دی جاتی ہے۔',
  updatedAt: new Date().toISOString(),
};

export function getMembershipConfig(): MembershipConfig {
  const saved = readJson<Partial<MembershipConfig>>(CONFIG_FILE, {});
  return {
    starterQrImage: saved.starterQrImage || DEFAULT_CONFIG.starterQrImage,
    standardQrImage: saved.standardQrImage || DEFAULT_CONFIG.standardQrImage,
    plusQrImage: saved.plusQrImage || DEFAULT_CONFIG.plusQrImage,
    vipQrImage: saved.vipQrImage || DEFAULT_CONFIG.vipQrImage,
    whatsappNumber:
      saved.whatsappNumber !== undefined
        ? saved.whatsappNumber
        : (process.env.FEVIQO_WHATSAPP_NUMBER || '').trim(),
    adminEmail:
      saved.adminEmail ||
      (process.env.FEVIQO_ADMIN_EMAIL || 'rexanmedia01@gmail.com').trim(),
    supportEmail: saved.supportEmail || DEFAULT_CONFIG.supportEmail,
    supportNoteEn: saved.supportNoteEn || DEFAULT_CONFIG.supportNoteEn,
    supportNoteUr: saved.supportNoteUr || DEFAULT_CONFIG.supportNoteUr,
    updatedAt: saved.updatedAt || DEFAULT_CONFIG.updatedAt,
  };
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
    whatsappConfigured: whatsappDigits.length >= 10,
    whatsappDigits,
    supportEmail: cfg.supportEmail,
    supportNoteEn: cfg.supportNoteEn,
    supportNoteUr: cfg.supportNoteUr,
  };
}

export function getQrUrlForPlan(planId: MembershipPlanId): string {
  const cfg = getMembershipConfig();
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

export function resolveQrDiskPath(planId: MembershipPlanId): string | null {
  const qrUrl = getQrUrlForPlan(planId);
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
  const next: MembershipConfig = {
    ...current,
    starterQrImage: params.updates.starterQrImage?.trim() || current.starterQrImage,
    standardQrImage: params.updates.standardQrImage?.trim() || current.standardQrImage,
    plusQrImage: params.updates.plusQrImage?.trim() || current.plusQrImage,
    vipQrImage: params.updates.vipQrImage?.trim() || current.vipQrImage,
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
  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'config_updated',
    details: `Updated membership configuration (WhatsApp: ${next.whatsappNumber ? 'configured' : 'unset'}, Admin Email: ${next.adminEmail}).`,
  });
  return next;
}

export function saveUploadedQrImage(params: {
  planId: MembershipPlanId;
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

  const fileName = `${params.planId}-qr-${Date.now()}.${detected.ext}`;
  const destPath = path.join(PUBLIC_QR_DIR, fileName);
  fs.writeFileSync(destPath, params.buffer);
  const imageUrl = `/images/qr/${fileName}`;

  const updates: Partial<MembershipConfig> = {};
  if (params.planId === 'starter') updates.starterQrImage = imageUrl;
  if (params.planId === 'standard') updates.standardQrImage = imageUrl;
  if (params.planId === 'plus') updates.plusQrImage = imageUrl;
  if (params.planId === 'vip') updates.vipQrImage = imageUrl;

  const current = getMembershipConfig();
  const next: MembershipConfig = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeJson(CONFIG_FILE, next);

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'qr_image_updated',
    targetId: params.planId,
    details: `Uploaded crisp ${detected.ext.toUpperCase()} Bank QR image for ${params.planId} plan (${fileName}).`,
  });

  return { success: true, imageUrl, config: next };
}

// --- IMAGE MAGIC-BYTE VALIDATION ---
export function detectImageType(buf: Buffer): { mime: 'image/jpeg' | 'image/png' | 'image/webp'; ext: 'jpg' | 'png' | 'webp' } | null {
  if (!buf || buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
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
  // WebP: RIFF....WEBP
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
  const cfg = getMembershipConfig();
  return {
    hasConfiguredAdmins: hasActive,
    configuredAdminEmail: hasActive ? '' : cfg.adminEmail,
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
  return raw.map((o) => ({
    ...o,
    status: normalizeOrderStatus(o.status),
    qrImageUrl: o.qrImageUrl || (o.planId ? getQrUrlForPlan(o.planId) : undefined),
  }));
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
  const activeMembership = memberships.find((m) => m.status === 'active') || null;
  const latestMembership = memberships[0] || null;
  const orders = readAllOrders()
    .filter((o) => o.memberId === memberId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const history = readJson<MembershipHistoryEntry[]>(HISTORY_FILE, [])
    .filter((h) => h.memberId === memberId);

  let remainingDays = 0;
  let remainingHours = 0;
  if (activeMembership) {
    const diffMs = Math.max(0, Date.parse(activeMembership.expiresAt) - Date.now());
    remainingDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    remainingHours = Math.ceil(diffMs / (60 * 60 * 1000));
  }

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
    remainingHours,
    unlockedDramaIds,
    unlockedDramas,
    orders,
    history,
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

export function getPaymentGatewayStatus(): PaymentGatewayStatus {
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
  const now = new Date().toISOString();
  const orderId = `ord-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const qrImageUrl = getQrUrlForPlan(plan.id);

  // Security: Amount & duration always come strictly from server catalog (never from client payload)
  const order: MembershipOrder = {
    id: orderId,
    memberId: member.id,
    customerName: member.fullName,
    customerEmail: member.email,
    customerPhone: member.phone,
    planId: plan.id,
    planName: plan.name,
    amountPkr: plan.pricePkr,
    durationDays: plan.durationDays,
    selectedDramaIds: normalizedDramaIds,
    status: 'awaiting_payment',
    provider: 'bank_qr',
    qrImageUrl,
    createdAt: now,
    updatedAt: now,
  };

  const orders = readAllOrders();
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
    details: `Payment request ${order.id} created for ${plan.name} (${plan.priceDisplay}) — awaiting Bank QR payment.`,
  });

  return {
    success: true,
    order,
    gatewayConfigured: true,
    paymentSetupRequired: false,
    qrImageUrl,
    publicConfig: getPublicMembershipConfig(),
    gatewayStatus: getPaymentGatewayStatus(),
  };
}

export function submitOrderPaymentProof(params: {
  memberId: string;
  orderId: string;
  fileBuffer: Buffer;
  originalName: string;
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

  // Clean up prior replaced private proof if one existed
  if (order.proofFileName && order.proofFileName !== proofFileName) {
    const oldPath = path.join(PRIVATE_PROOFS_DIR, path.basename(order.proofFileName));
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch {}
    }
  }

  const nowIso = new Date().toISOString();
  order.proofFileName = proofFileName;
  order.proofOriginalName = (params.originalName || `payment-proof.${detected.ext}`).slice(0, 180);
  order.proofMimeType = detected.mime;
  order.proofSubmittedAt = nowIso;
  order.paymentNote = params.paymentNote ? String(params.paymentNote).trim().slice(0, 400) : undefined;
  order.status = 'pending_verification';
  order.rejectionReason = undefined;
  order.updatedAt = nowIso;
  orders[idx] = order;
  writeJson(ORDERS_FILE, orders);

  appendHistory({
    memberId: member.id,
    orderId: order.id,
    event: 'proof_submitted',
    planId: order.planId,
    planName: order.planName,
    amountPkr: order.amountPkr,
    selectedDramaIds: order.selectedDramaIds,
    details: `Payment proof submitted for ${order.planName} (PKR ${order.amountPkr.toLocaleString()}) — pending verification.`,
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

  if (!order.proofFileName) {
    return { success: false, error: 'No payment proof has been uploaded for this request yet.', statusCode: 404 };
  }

  const safeBase = path.basename(order.proofFileName);
  const filePath = path.join(PRIVATE_PROOFS_DIR, safeBase);
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
  | { success: true; order: MembershipOrder; membership: MembershipRecord; member: SafeMember | null }
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

  const plan = getPlanById(order.planId);
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

  // Cancel any prior active membership before activating new approved plan
  const memberships = readJson<MembershipRecord[]>(MEMBERSHIPS_FILE, []);
  for (const existing of memberships) {
    if (existing.memberId === order.memberId && existing.status === 'active') {
      existing.status = 'cancelled';
      existing.cancelledAt = nowIso;
    }
  }

  const expiresAtIso = new Date(nowMs + plan.durationDays * 24 * 60 * 60 * 1000).toISOString();
  const selectedIds =
    plan.dramaLimit === 'all'
      ? MEMBERSHIP_DRAMAS.filter((d) => d.vipEligible).map((d) => d.id)
      : order.selectedDramaIds;

  const newMembership: MembershipRecord = {
    id: `sub-${nowMs}-${crypto.randomBytes(3).toString('hex')}`,
    memberId: order.memberId,
    orderId: order.id,
    planId: plan.id,
    planName: plan.name,
    pricePkr: plan.pricePkr,
    durationDays: plan.durationDays,
    selectedDramaIds: selectedIds,
    status: 'active',
    activatedAt: nowIso,
    expiresAt: expiresAtIso,
    approvedByAdminEmail: params.admin.email,
    paymentProvider: 'bank_qr',
    paymentReference: order.paymentNote || order.id,
    createdAt: nowIso,
  };

  memberships.unshift(newMembership);
  writeJson(MEMBERSHIPS_FILE, memberships);

  appendHistory({
    memberId: order.memberId,
    membershipId: newMembership.id,
    orderId: order.id,
    event: 'payment_approved',
    planId: plan.id,
    planName: plan.name,
    amountPkr: plan.pricePkr,
    selectedDramaIds: selectedIds,
    details: `${plan.name} payment approved and membership activated until ${expiresAtIso}.`,
  });

  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'payment_approved',
    targetId: order.id,
    details: `Approved ${plan.name} (PKR ${plan.pricePkr}) for ${order.customerEmail || order.memberId}. Membership ${newMembership.id} active until ${expiresAtIso}.`,
  });

  return {
    success: true,
    order,
    membership: newMembership,
    member: getMemberById(order.memberId),
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

  appendHistory({
    memberId: order.memberId,
    orderId: order.id,
    event: 'payment_rejected',
    planId: order.planId,
    planName: order.planName,
    amountPkr: order.amountPkr,
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

  return {
    success: true,
    order,
    member: getMemberById(order.memberId),
  };
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

// --- ADMIN OVERVIEW DASHBOARD DATA ---
export function getAdminMembershipsOverview() {
  const members = readJson<MemberRecord[]>(MEMBERS_FILE, []).map(sanitizeMember);
  const memberById = new Map(members.map((m) => [m.id, m]));
  const memberships = syncMemberSubscriptions();
  const orders = readAllOrders()
    .map((o) => {
      const m = memberById.get(o.memberId);
      return {
        ...o,
        customerName: o.customerName || m?.fullName || 'Unknown',
        customerEmail: o.customerEmail || m?.email || 'Unknown',
        customerPhone: o.customerPhone || m?.phone || '—',
        hasProof: Boolean(o.proofFileName),
      };
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const enrichedMemberships = memberships.map((sub) => {
    const m = memberById.get(sub.memberId);
    return {
      ...sub,
      customerName: m?.fullName || 'Unknown',
      customerEmail: m?.email || 'Unknown',
      customerPhone: m?.phone || '—',
    };
  });

  const auditLogs = readJson<AdminAuditEntry[]>(ADMIN_AUDIT_FILE, []);
  const emailNotifications = readJson<EmailNotificationLog[]>(EMAIL_NOTIFS_FILE, []).map(
    ({ html: _omitHtml, ...rest }) => rest
  );

  const metrics = {
    totalMembers: members.length,
    activeMemberships: enrichedMemberships.filter((m) => m.status === 'active').length,
    pendingVerifications: orders.filter((o) => o.status === 'pending_verification').length,
    awaitingPayments: orders.filter((o) => o.status === 'awaiting_payment').length,
    approvedPayments: orders.filter((o) => o.status === 'approved').length,
    rejectedPayments: orders.filter((o) => o.status === 'rejected').length,
    expiredMemberships: enrichedMemberships.filter((m) => m.status === 'expired').length,
    failedEmails: emailNotifications.filter((n) => n.status === 'failed').length,
  };

  return {
    metrics,
    members,
    requests: orders,
    memberships: enrichedMemberships,
    auditLogs: auditLogs.slice(0, 120),
    emailNotifications: emailNotifications.slice(0, 100),
    config: getMembershipConfig(),
    admins: listAdmins(),
  };
}

// --- CANCEL & PLAYBACK ENTITLEMENT ---
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
        error: 'Your membership has been cancelled or revoked. Choose a plan to restore streaming access.',
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
      error: 'An active approved FEVIQO Premium Membership is required to stream this episode.',
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

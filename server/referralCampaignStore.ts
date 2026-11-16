import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { SafeAdmin, SafeMember, MembershipOrder } from './membershipStore';
import { isServerFirestoreEnabled, mirrorDocToFirestoreServer } from './firestoreAdmin';

const DATA_DIR = path.join(process.cwd(), 'data');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'referral_campaigns.json');
const VISITS_FILE = path.join(DATA_DIR, 'referral_visits.json');
const UNIQUE_VISITORS_FILE = path.join(DATA_DIR, 'referral_unique_visitors.json');
const USER_ATTRIBUTIONS_FILE = path.join(DATA_DIR, 'user_campaign_attributions.json');
const ORDER_ATTRIBUTIONS_FILE = path.join(DATA_DIR, 'order_campaign_attributions.json');
const COMMISSIONS_FILE = path.join(DATA_DIR, 'campaign_commissions.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'commission_payments.json');
const MONTHLY_REPORTS_FILE = path.join(DATA_DIR, 'monthly_commission_reports.json');
const ATTR_SECRET_FILE = path.join(DATA_DIR, '.campaign_attr_secret');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export type CampaignStatus = 'active' | 'paused' | 'disabled';
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'reversed';

export interface CampaignActivityEntry {
  id: string;
  timestamp: string;
  action:
    | 'created'
    | 'updated'
    | 'rate_changed'
    | 'paused'
    | 'reactivated'
    | 'disabled'
    | 'commission_approved'
    | 'commission_paid'
    | 'commission_reversed';
  actorEmail: string;
  details: string;
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
  status: CampaignStatus;
  createdByAdminEmail: string;
  createdAt: string;
  updatedAt: string;
  disabledAt?: string;
  activityHistory: CampaignActivityEntry[];
}

export interface ReferralVisitRecord {
  id: string;
  campaignId: string;
  campaignSlug: string;
  visitorId: string;
  isUniqueFirstVisit: boolean;
  landingPage: string;
  referrerHeader?: string;
  ipHash: string;
  uaHash: string;
  userAgentSummary: string;
  createdAt: string;
}

export interface ReferralUniqueVisitorRecord {
  id: string;
  campaignId: string;
  campaignSlug: string;
  visitorId: string;
  ipHash: string;
  uaHash: string;
  firstLandingPage: string;
  firstSeenAt: string;
  lastSeenAt: string;
  visitCount: number;
}

export interface UserCampaignAttribution {
  id: string;
  memberId: string;
  memberEmail: string;
  memberName: string;
  campaignId: string;
  campaignSlug: string;
  campaignName: string;
  visitorId?: string;
  landingPage?: string;
  attributedAt: string;
  attributionExpiresAt: string;
  source: 'cookie' | 'token' | 'slug';
}

export interface OrderCampaignAttribution {
  id: string;
  orderId: string;
  memberId: string;
  memberEmailMasked: string;
  memberName: string;
  campaignId: string;
  campaignSlug: string;
  campaignName: string;
  planId: string;
  planName: string;
  currency: 'PKR' | 'USD';
  orderAmountPkr: number;
  orderAmountUsd: number;
  orderStatus: string;
  commissionRatePercent: number;
  attributedAt: string;
  updatedAt: string;
}

export interface CampaignCommissionRecord {
  id: string;
  campaignId: string;
  campaignName: string;
  campaignSlug: string;
  partnerName: string;
  orderId: string;
  memberId: string;
  memberEmailMasked: string;
  memberName: string;
  planId: string;
  planName: string;
  currency: 'PKR' | 'USD';
  orderAmountPkr: number;
  orderAmountUsd: number;
  commissionRatePercent: number;
  commissionAmountPkr: number;
  commissionAmountUsd: number;
  status: CommissionStatus;
  monthKey: string; // YYYY-MM
  verifiedAt: string;
  approvedAt?: string;
  approvedByAdminEmail?: string;
  paidAt?: string;
  paymentId?: string;
  paymentDate?: string;
  paymentNotes?: string;
  reversedAt?: string;
  reversalReason?: string;
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
  totalAmountPkr: number;
  totalAmountUsd: number;
  paymentDate: string;
  paymentMethod: string;
  paymentReference?: string;
  notes: string;
  paidByAdminEmail: string;
  createdAt: string;
}

export interface MonthlyCommissionReportRow {
  campaignId: string;
  campaignName: string;
  partnerName: string;
  campaignSlug: string;
  currentCommissionRatePercent: number;
  successfulMemberships: number;
  totalRevenuePkr: number;
  totalRevenueUsd: number;
  totalCommissionEarnedPkr: number;
  totalCommissionEarnedUsd: number;
  pendingCommissionPkr: number;
  pendingCommissionUsd: number;
  approvedUnpaidCommissionPkr: number;
  approvedUnpaidCommissionUsd: number;
  paidCommissionPkr: number;
  paidCommissionUsd: number;
}

export interface MonthlyCommissionReportSnapshot {
  id: string; // e.g. rpt-2026-11
  monthKey: string;
  generatedAt: string;
  generatedByAdminEmail: string;
  totalMemberships: number;
  totalRevenuePkr: number;
  totalRevenueUsd: number;
  totalCommissionEarnedPkr: number;
  totalCommissionEarnedUsd: number;
  totalPendingPkr: number;
  totalPendingUsd: number;
  totalPaidPkr: number;
  totalPaidUsd: number;
  rows: MonthlyCommissionReportRow[];
}

export interface SignedCampaignAttributionPayload {
  campaignId: string;
  campaignSlug: string;
  visitorId: string;
  landingPage: string;
  clickedAt: string;
  expiresAt: string;
  sig: string;
}

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'membership',
  'memberships',
  'dramas',
  'drama',
  'account',
  'login',
  'signup',
  'register',
  'auth',
  'checkout',
  'pricing',
  'booking',
  'gallery',
  'about',
  'privacy',
  'terms',
  'robots',
  'sitemap',
  'favicon',
  'assets',
  'static',
  'images',
  'feviqo',
  'teskilat',
  'mehmed',
  'mehmed-fetihler-sultani',
  'gunesin-dogdugu-yer',
  'null',
  'undefined',
]);

const BOT_UA_PATTERN =
  /googlebot|bingbot|yandexbot|baiduspider|duckduckbot|semrush|ahrefs|mj12bot|petalbot/i;

const visitRateBuckets = new Map<string, { count: number; resetAt: number }>();
const recentVisitDedupMap = new Map<string, { lastClickMs: number; result: any }>();

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(filePath: string, data: T): void {
  const tmp = `${filePath}.${crypto.randomBytes(3).toString('hex')}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, filePath);
}

function getAttrSecret(): string {
  const envSec = process.env.CAMPAIGN_ATTRIBUTION_SECRET?.trim() || process.env.MEMBER_SESSION_SECRET?.trim();
  if (envSec && envSec.length >= 24) return envSec;
  try {
    if (fs.existsSync(ATTR_SECRET_FILE)) {
      const saved = fs.readFileSync(ATTR_SECRET_FILE, 'utf-8').trim();
      if (saved.length >= 24) return saved;
    }
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(ATTR_SECRET_FILE, generated, { mode: 0o600 });
    return generated;
  } catch {
    return 'feviqo-fallback-campaign-attr-secret-rotate-prod';
  }
}

function hashShort(val: string): string {
  return crypto
    .createHmac('sha256', getAttrSecret())
    .update(String(val || ''))
    .digest('hex')
    .slice(0, 16);
}

function safeDocId(raw: string): string {
  return String(raw || '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 128);
}

export function maskEmailForAnalytics(email?: string): string {
  const clean = String(email || '').trim().toLowerCase();
  const at = clean.indexOf('@');
  if (at <= 0) return 'member@feviqo.com';
  const local = clean.slice(0, at);
  const domain = clean.slice(at + 1);
  const head = local.slice(0, Math.min(2, local.length));
  return `${head}***@${domain}`;
}

export function getPublicSiteOrigin(fallbackOrigin?: string): string {
  const configured = (process.env.PUBLIC_SITE_ORIGIN || '').trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, '');
  }
  const appUrl = (process.env.APP_URL || '').trim();
  if (appUrl && /^https?:\/\//i.test(appUrl) && !appUrl.includes('MY_APP_URL')) {
    return appUrl.replace(/\/+$/, '');
  }
  if (fallbackOrigin && fallbackOrigin.includes('feviqo.com')) {
    return fallbackOrigin.replace(/\/+$/, '');
  }
  return 'https://feviqo.com';
}

export function buildCampaignReferralUrl(slug: string, origin?: string): string {
  return `${getPublicSiteOrigin(origin)}/membership/${encodeURIComponent(slug)}`;
}

function toSlugFormat(val?: string): string {
  return String(val || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function validateAndNormalizeSlug(
  rawSlug: string
): { valid: true; slug: string } | { valid: false; error: string } {
  const clean = String(rawSlug || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  if (!clean || clean.length < 2) {
    return {
      valid: false,
      error: 'Referral slug must contain at least 2 alphanumeric characters (letters, numbers, hyphens).',
    };
  }
  if (clean.length > 64) {
    return {
      valid: false,
      error: 'Referral slug cannot exceed 64 characters.',
    };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) {
    return {
      valid: false,
      error: 'Referral slug may only contain lowercase letters, numbers, and single hyphens.',
    };
  }
  if (RESERVED_SLUGS.has(clean)) {
    return {
      valid: false,
      error: `Slug "${clean}" is reserved by FEVIQO routes. Please choose another slug.`,
    };
  }
  return { valid: true, slug: clean };
}

function mirrorCollectionDoc(collectionName: string, docId: string, data: Record<string, any>): void {
  if (!isServerFirestoreEnabled()) return;
  const cleanId = safeDocId(docId);
  if (!cleanId) return;
  void mirrorDocToFirestoreServer(collectionName, cleanId, {
    ...data,
    id: cleanId,
  });
}

function isCampaignWithinDates(c: ReferralCampaign, nowMs = Date.now()): boolean {
  if (c.startDate) {
    const startMs = Date.parse(c.startDate);
    if (!Number.isNaN(startMs) && nowMs < startMs) return false;
  }
  if (c.endDate) {
    let endStr = c.endDate.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(endStr)) {
      endStr = `${endStr}T23:59:59.999Z`;
    }
    const endMs = Date.parse(endStr);
    if (!Number.isNaN(endMs) && nowMs > endMs) return false;
  }
  return true;
}

function signVisitorToken(visitorId: string): string {
  const sig = crypto
    .createHmac('sha256', getAttrSecret())
    .update(`vid:${visitorId}`)
    .digest('base64url')
    .slice(0, 18);
  return `${visitorId}.${sig}`;
}

export function verifyVisitorToken(rawToken?: string | null): string | null {
  if (!rawToken || typeof rawToken !== 'string') return null;
  const parts = rawToken.trim().split('.');
  if (parts.length !== 2) return null;
  const [visitorId, sig] = parts;
  if (!visitorId || !/^vis-[a-zA-Z0-9_-]+$/.test(visitorId)) return null;
  const expected = crypto
    .createHmac('sha256', getAttrSecret())
    .update(`vid:${visitorId}`)
    .digest('base64url')
    .slice(0, 18);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b) ? visitorId : null;
  } catch {
    return null;
  }
}

export function signCampaignAttributionToken(payload: Omit<SignedCampaignAttributionPayload, 'sig'>): string {
  const canonical = `${payload.campaignId}|${payload.campaignSlug}|${payload.visitorId}|${payload.clickedAt}|${payload.expiresAt}`;
  const sig = crypto
    .createHmac('sha256', getAttrSecret())
    .update(canonical)
    .digest('base64url')
    .slice(0, 24);
  const full: SignedCampaignAttributionPayload = { ...payload, sig };
  return Buffer.from(JSON.stringify(full), 'utf-8').toString('base64url');
}

export function verifyCampaignAttributionToken(rawToken?: string | null): SignedCampaignAttributionPayload | null {
  if (!rawToken || typeof rawToken !== 'string') return null;
  try {
    const parsed = JSON.parse(Buffer.from(rawToken.trim(), 'base64url').toString('utf-8')) as SignedCampaignAttributionPayload;
    if (!parsed?.campaignId || !parsed?.campaignSlug || !parsed?.expiresAt || !parsed?.sig) return null;
    const canonical = `${parsed.campaignId}|${parsed.campaignSlug}|${parsed.visitorId || ''}|${parsed.clickedAt}|${parsed.expiresAt}`;
    const expected = crypto
      .createHmac('sha256', getAttrSecret())
      .update(canonical)
      .digest('base64url')
      .slice(0, 24);
    const a = Buffer.from(parsed.sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const expMs = Date.parse(parsed.expiresAt);
    if (Number.isNaN(expMs) || expMs <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function formatCampaignDisplayNameFromSlug(slug: string): string {
  return String(slug || '')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function ensureDefaultReferralCampaigns(): ReferralCampaign[] {
  const list = readJson<ReferralCampaign[]>(CAMPAIGNS_FILE, []);
  let mutated = false;
  const nowIso = new Date().toISOString();

  const hasKameerPlay = list.some(
    (c) =>
      c.slug?.toLowerCase() === 'kameer-play' ||
      toSlugFormat(c.name) === 'kameer-play' ||
      c.id === 'cmp-kameer-play'
  );

  if (!hasKameerPlay) {
    const defaultCampaign: ReferralCampaign = {
      id: 'cmp-kameer-play',
      name: 'Kameer Play',
      partnerName: 'Hafiz Akash',
      description: 'Official Kameer Play partner referral campaign',
      slug: 'kameer-play',
      referralUrl: buildCampaignReferralUrl('kameer-play'),
      commissionRatePercent: 2,
      attributionWindowDays: 30,
      status: 'active',
      createdByAdminEmail: 'partner@feviqo.com',
      createdAt: nowIso,
      updatedAt: nowIso,
      activityHistory: [
        {
          id: 'act-seed-kameer-play',
          timestamp: nowIso,
          action: 'created',
          actorEmail: 'partner@feviqo.com',
          details: 'Created campaign "Kameer Play" (slug: kameer-play, partner: Hafiz Akash, commission: 2%, window: 30d).',
        },
      ],
    };
    list.unshift(defaultCampaign);
    mutated = true;
    mirrorCollectionDoc('referralCampaigns', defaultCampaign.id, {
      ...defaultCampaign,
      createdAtIso: defaultCampaign.createdAt,
      updatedAtIso: defaultCampaign.updatedAt,
    });
  }

  if (mutated) {
    writeJson(CAMPAIGNS_FILE, list);
  }

  // Ensure initial test visits for kameer-play are present if referral_visits.json was never initialized
  if (!fs.existsSync(VISITS_FILE)) {
    const kameerCampaign =
      list.find((c) => c.slug.toLowerCase() === 'kameer-play') || list[0];
    if (kameerCampaign) {
      const seedVisitorId = 'vis-seed-kameer-play-01';
      const ipHash = hashShort('seed-kameer-play-ip');
      const uaHash = hashShort('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0');
      const t1 = new Date(Date.now() - 180_000).toISOString();
      const t2 = new Date(Date.now() - 120_000).toISOString();
      const t3 = new Date(Date.now() - 60_000).toISOString();

      const seedUv: ReferralUniqueVisitorRecord = {
        id: `uv-${kameerCampaign.id}-${seedVisitorId}`,
        campaignId: kameerCampaign.id,
        campaignSlug: kameerCampaign.slug,
        visitorId: seedVisitorId,
        ipHash,
        uaHash,
        firstLandingPage: '/membership/kameer-play',
        firstSeenAt: t1,
        lastSeenAt: t3,
        visitCount: 3,
      };
      const existingUvs = readJson<ReferralUniqueVisitorRecord[]>(UNIQUE_VISITORS_FILE, []);
      if (!existingUvs.some((u) => u.id === seedUv.id)) {
        existingUvs.unshift(seedUv);
        writeJson(UNIQUE_VISITORS_FILE, existingUvs);
        mirrorCollectionDoc('referralUniqueVisitors', seedUv.id, {
          ...seedUv,
          createdAtIso: t1,
        });
      }

      const seedVisits: ReferralVisitRecord[] = [
        {
          id: 'rvis-seed-kameer-play-3',
          campaignId: kameerCampaign.id,
          campaignSlug: kameerCampaign.slug,
          visitorId: seedVisitorId,
          isUniqueFirstVisit: false,
          landingPage: '/membership/kameer-play',
          ipHash,
          uaHash,
          userAgentSummary: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0',
          createdAt: t3,
        },
        {
          id: 'rvis-seed-kameer-play-2',
          campaignId: kameerCampaign.id,
          campaignSlug: kameerCampaign.slug,
          visitorId: seedVisitorId,
          isUniqueFirstVisit: false,
          landingPage: '/?ref=kameer-play',
          ipHash,
          uaHash,
          userAgentSummary: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0',
          createdAt: t2,
        },
        {
          id: 'rvis-seed-kameer-play-1',
          campaignId: kameerCampaign.id,
          campaignSlug: kameerCampaign.slug,
          visitorId: seedVisitorId,
          isUniqueFirstVisit: true,
          landingPage: '/membership/kameer-play',
          ipHash,
          uaHash,
          userAgentSummary: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0',
          createdAt: t1,
        },
      ];
      writeJson(VISITS_FILE, seedVisits);
      for (const sv of seedVisits) {
        mirrorCollectionDoc('referralVisits', sv.id, {
          ...sv,
          createdAtIso: sv.createdAt,
        });
      }
    }
  }

  return list;
}

// --- CAMPAIGN CRUD ---
export function getCampaignById(campaignId: string): ReferralCampaign | null {
  const list = ensureDefaultReferralCampaigns();
  const found = list.find((c) => c.id === campaignId) || null;
  if (found) {
    found.referralUrl = buildCampaignReferralUrl(found.slug);
  }
  return found;
}

export function getCampaignBySlug(slug: string): ReferralCampaign | null {
  const clean = toSlugFormat(slug);
  if (!clean) return null;
  const list = ensureDefaultReferralCampaigns();
  const found =
    list.find((c) => c.slug.toLowerCase() === clean) ||
    list.find((c) => toSlugFormat(c.partnerName) === clean) ||
    list.find((c) => toSlugFormat(c.name) === clean) ||
    null;
  if (found) {
    found.referralUrl = buildCampaignReferralUrl(found.slug);
  }
  return found;
}

export function createReferralCampaign(params: {
  name: string;
  partnerName: string;
  partnerEmail?: string;
  description?: string;
  slug: string;
  commissionRatePercent?: number;
  attributionWindowDays?: number;
  startDate?: string;
  endDate?: string;
  status?: CampaignStatus;
  admin: SafeAdmin;
}): { success: true; campaign: ReferralCampaign } | { success: false; error: string; statusCode: number } {
  const name = String(params.name || '').trim();
  const partnerName = String(params.partnerName || '').trim();
  if (name.length < 2 || name.length > 120) {
    return { success: false, error: 'Campaign name must be between 2 and 120 characters.', statusCode: 400 };
  }
  if (partnerName.length < 2 || partnerName.length > 120) {
    return { success: false, error: 'Partner / contact name must be between 2 and 120 characters.', statusCode: 400 };
  }

  const slugInput = String(params.slug || '').trim();
  if (!slugInput) {
    return { success: false, error: 'A custom referral slug is required.', statusCode: 400 };
  }
  const slugCheck = validateAndNormalizeSlug(slugInput);
  if (!('slug' in slugCheck)) {
    return { success: false, error: slugCheck.error, statusCode: 400 };
  }

  const campaigns = readJson<ReferralCampaign[]>(CAMPAIGNS_FILE, []);
  if (campaigns.some((c) => c.slug.toLowerCase() === slugCheck.slug)) {
    return {
      success: false,
      error: `Referral slug "${slugCheck.slug}" is already used by another campaign.`,
      statusCode: 409,
    };
  }

  const rateRaw = params.commissionRatePercent !== undefined ? Number(params.commissionRatePercent) : 2;
  if (!Number.isFinite(rateRaw) || rateRaw < 0 || rateRaw > 100) {
    return { success: false, error: 'Commission percentage must be between 0 and 100.', statusCode: 400 };
  }
  const rate = Number(rateRaw.toFixed(2));

  const windowRaw = params.attributionWindowDays !== undefined ? Number(params.attributionWindowDays) : 30;
  if (!Number.isFinite(windowRaw) || windowRaw < 1 || windowRaw > 365) {
    return { success: false, error: 'Attribution window must be between 1 and 365 days.', statusCode: 400 };
  }
  const windowDays = Math.round(windowRaw);

  const status: CampaignStatus =
    params.status === 'paused' || params.status === 'disabled' ? params.status : 'active';
  const nowIso = new Date().toISOString();
  const id = `cmp-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  const campaign: ReferralCampaign = {
    id,
    name,
    partnerName,
    partnerEmail: params.partnerEmail?.trim().toLowerCase() || undefined,
    description: String(params.description || '').trim().slice(0, 600),
    slug: slugCheck.slug,
    referralUrl: buildCampaignReferralUrl(slugCheck.slug),
    commissionRatePercent: rate,
    attributionWindowDays: windowDays,
    startDate: params.startDate?.trim() || undefined,
    endDate: params.endDate?.trim() || undefined,
    status,
    createdByAdminEmail: params.admin.email,
    createdAt: nowIso,
    updatedAt: nowIso,
    disabledAt: status === 'disabled' ? nowIso : undefined,
    activityHistory: [
      {
        id: `act-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
        timestamp: nowIso,
        action: 'created',
        actorEmail: params.admin.email,
        details: `Created campaign "${name}" (slug: ${slugCheck.slug}, partner: ${partnerName}, commission: ${rate}%, window: ${windowDays}d).`,
      },
    ],
  };

  campaigns.unshift(campaign);
  writeJson(CAMPAIGNS_FILE, campaigns);
  mirrorCollectionDoc('referralCampaigns', campaign.id, {
    ...campaign,
    createdAtIso: campaign.createdAt,
    updatedAtIso: campaign.updatedAt,
  });

  return { success: true, campaign };
}

export function updateReferralCampaign(params: {
  campaignId: string;
  updates: Partial<{
    name: string;
    partnerName: string;
    partnerEmail: string;
    description: string;
    slug: string;
    commissionRatePercent: number;
    attributionWindowDays: number;
    startDate: string | null;
    endDate: string | null;
    status: CampaignStatus;
  }>;
  admin: SafeAdmin;
}): { success: true; campaign: ReferralCampaign } | { success: false; error: string; statusCode: number } {
  const campaigns = readJson<ReferralCampaign[]>(CAMPAIGNS_FILE, []);
  const idx = campaigns.findIndex((c) => c.id === params.campaignId);
  if (idx === -1) {
    return { success: false, error: 'Referral campaign not found.', statusCode: 404 };
  }

  const current = { ...campaigns[idx] };
  const changes: string[] = [];
  const u = params.updates || {};
  const nowIso = new Date().toISOString();

  if (u.name !== undefined) {
    const cleanName = String(u.name).trim();
    if (cleanName.length < 2 || cleanName.length > 120) {
      return { success: false, error: 'Campaign name must be between 2 and 120 characters.', statusCode: 400 };
    }
    if (cleanName !== current.name) {
      changes.push(`Name changed from "${current.name}" to "${cleanName}"`);
      current.name = cleanName;
    }
  }

  if (u.partnerName !== undefined) {
    const cleanPartner = String(u.partnerName).trim();
    if (cleanPartner.length < 2 || cleanPartner.length > 120) {
      return { success: false, error: 'Partner name must be between 2 and 120 characters.', statusCode: 400 };
    }
    if (cleanPartner !== current.partnerName) {
      changes.push(`Partner changed from "${current.partnerName}" to "${cleanPartner}"`);
      current.partnerName = cleanPartner;
    }
  }

  if (u.partnerEmail !== undefined) {
    current.partnerEmail = String(u.partnerEmail || '').trim().toLowerCase() || undefined;
  }

  if (u.description !== undefined) {
    current.description = String(u.description || '').trim().slice(0, 600);
  }

  if (u.slug !== undefined) {
    const slugCheck = validateAndNormalizeSlug(u.slug);
    if (!('slug' in slugCheck)) {
      return { success: false, error: slugCheck.error, statusCode: 400 };
    }
    const conflict = campaigns.some(
      (c) => c.id !== current.id && c.slug.toLowerCase() === slugCheck.slug
    );
    if (conflict) {
      return {
        success: false,
        error: `Referral slug "${slugCheck.slug}" is already taken by another campaign.`,
        statusCode: 409,
      };
    }
    if (slugCheck.slug !== current.slug) {
      changes.push(`Slug changed from "${current.slug}" to "${slugCheck.slug}"`);
      current.slug = slugCheck.slug;
      current.referralUrl = buildCampaignReferralUrl(slugCheck.slug);
    }
  }

  let primaryAction: CampaignActivityEntry['action'] = 'updated';

  if (u.commissionRatePercent !== undefined) {
    const nextRate = Number(u.commissionRatePercent);
    if (!Number.isFinite(nextRate) || nextRate < 0 || nextRate > 100) {
      return { success: false, error: 'Commission percentage must be between 0 and 100.', statusCode: 400 };
    }
    const rounded = Number(nextRate.toFixed(2));
    if (rounded !== current.commissionRatePercent) {
      changes.push(`Future commission rate updated from ${current.commissionRatePercent}% to ${rounded}% (historical commissions preserved)`);
      current.commissionRatePercent = rounded;
      primaryAction = 'rate_changed';
    }
  }

  if (u.attributionWindowDays !== undefined) {
    const nextWin = Number(u.attributionWindowDays);
    if (!Number.isFinite(nextWin) || nextWin < 1 || nextWin > 365) {
      return { success: false, error: 'Attribution window must be between 1 and 365 days.', statusCode: 400 };
    }
    const roundedWin = Math.round(nextWin);
    if (roundedWin !== current.attributionWindowDays) {
      changes.push(`Attribution window updated from ${current.attributionWindowDays}d to ${roundedWin}d`);
      current.attributionWindowDays = roundedWin;
    }
  }

  if (u.startDate !== undefined) {
    current.startDate = u.startDate ? String(u.startDate).trim() : undefined;
  }
  if (u.endDate !== undefined) {
    current.endDate = u.endDate ? String(u.endDate).trim() : undefined;
  }

  if (u.status !== undefined && ['active', 'paused', 'disabled'].includes(u.status)) {
    if (u.status !== current.status) {
      if (u.status === 'paused') primaryAction = 'paused';
      else if (u.status === 'disabled') primaryAction = 'disabled';
      else primaryAction = 'reactivated';
      changes.push(`Status changed from ${current.status} to ${u.status}`);
      current.status = u.status;
      if (u.status === 'disabled') {
        current.disabledAt = nowIso;
      } else {
        current.disabledAt = undefined;
      }
    }
  }

  current.updatedAt = nowIso;
  current.activityHistory = [
    {
      id: `act-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      timestamp: nowIso,
      action: primaryAction,
      actorEmail: params.admin.email,
      details: changes.length > 0 ? changes.join(' · ') : 'Campaign details saved.',
    },
    ...(current.activityHistory || []),
  ].slice(0, 100);

  campaigns[idx] = current;
  writeJson(CAMPAIGNS_FILE, campaigns);
  mirrorCollectionDoc('referralCampaigns', current.id, {
    ...current,
    createdAtIso: current.createdAt,
    updatedAtIso: current.updatedAt,
  });

  return { success: true, campaign: current };
}

function appendCampaignActivity(
  campaignId: string,
  entry: Omit<CampaignActivityEntry, 'id' | 'timestamp'>
): void {
  const campaigns = readJson<ReferralCampaign[]>(CAMPAIGNS_FILE, []);
  const idx = campaigns.findIndex((c) => c.id === campaignId);
  if (idx === -1) return;
  const nowIso = new Date().toISOString();
  campaigns[idx].activityHistory = [
    {
      id: `act-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      timestamp: nowIso,
      ...entry,
    },
    ...(campaigns[idx].activityHistory || []),
  ].slice(0, 100);
  campaigns[idx].updatedAt = nowIso;
  writeJson(CAMPAIGNS_FILE, campaigns);
  mirrorCollectionDoc('referralCampaigns', campaigns[idx].id, {
    ...campaigns[idx],
    createdAtIso: campaigns[idx].createdAt,
    updatedAtIso: campaigns[idx].updatedAt,
  });
}

// --- REFERRAL VISIT & VISITOR TRACKING ---
export function trackCampaignVisit(params: {
  slug: string;
  landingPage?: string;
  referrerHeader?: string;
  ip: string;
  userAgent?: string;
  existingVisitorToken?: string | null;
}): {
  tracked: boolean;
  reason?: string;
  campaignId?: string;
  campaignSlug?: string;
  campaignName?: string;
  partnerName?: string;
  partnerSlug?: string;
  referralPath?: string;
  visitorToken?: string;
  attributionToken?: string;
  isUniqueVisitor?: boolean;
  attributionExpiresAt?: string;
} {
  const slugCheck = validateAndNormalizeSlug(params.slug);
  if (!('slug' in slugCheck)) {
    return { tracked: false, reason: 'invalid_slug' };
  }

  const ua = String(params.userAgent || 'Mozilla/5.0 (Web)').trim();
  if (BOT_UA_PATTERN.test(ua)) {
    return { tracked: false, reason: 'bot_filtered' };
  }

  let campaign = getCampaignBySlug(slugCheck.slug);
  if (!campaign && !slugCheck.slug.startsWith('fev-')) {
    // Auto-recover partner referral campaign if a visitor clicks a valid partner link before manual creation or after container reset
    const displayName = formatCampaignDisplayNameFromSlug(slugCheck.slug) || slugCheck.slug;
    const partnerName = slugCheck.slug === 'kameer-play' ? 'Hafiz Akash' : displayName;
    const nowIso = new Date().toISOString();
    const autoCampaign: ReferralCampaign = {
      id: slugCheck.slug === 'kameer-play' ? 'cmp-kameer-play' : `cmp-${slugCheck.slug}`,
      name: displayName,
      partnerName,
      description: `Partner referral campaign (${slugCheck.slug})`,
      slug: slugCheck.slug,
      referralUrl: buildCampaignReferralUrl(slugCheck.slug),
      commissionRatePercent: 2,
      attributionWindowDays: 30,
      status: 'active',
      createdByAdminEmail: 'partner@feviqo.com',
      createdAt: nowIso,
      updatedAt: nowIso,
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          timestamp: nowIso,
          action: 'created',
          actorEmail: 'partner@feviqo.com',
          details: `Registered partner referral campaign "${displayName}" (slug: ${slugCheck.slug}).`,
        },
      ],
    };
    const campaigns = readJson<ReferralCampaign[]>(CAMPAIGNS_FILE, []);
    campaigns.unshift(autoCampaign);
    writeJson(CAMPAIGNS_FILE, campaigns);
    mirrorCollectionDoc('referralCampaigns', autoCampaign.id, {
      ...autoCampaign,
      createdAtIso: autoCampaign.createdAt,
      updatedAtIso: autoCampaign.updatedAt,
    });
    campaign = autoCampaign;
  }

  if (!campaign) {
    return { tracked: false, reason: 'campaign_not_found' };
  }
  if (campaign.status !== 'active') {
    return { tracked: false, reason: `campaign_${campaign.status}` };
  }
  if (!isCampaignWithinDates(campaign)) {
    return { tracked: false, reason: 'campaign_outside_schedule' };
  }

  // Rate limit per IP + campaign slug (max 120 hits/min)
  const ipHash = hashShort(params.ip);
  const uaHash = hashShort(ua);
  const nowMs = Date.now();

  // Deduplicate simultaneous server HTML GET + client JS POST on the same page load (within 1,200ms)
  const dedupKey = `${campaign.id}:${ipHash}:${uaHash}`;
  const recentHit = recentVisitDedupMap.get(dedupKey);
  if (recentHit && nowMs - recentHit.lastClickMs < 1200) {
    return recentHit.result;
  }

  const rateKey = `visit:${ipHash}:${campaign.id}`;
  const bucket = visitRateBuckets.get(rateKey);
  if (bucket && bucket.resetAt > nowMs) {
    if (bucket.count >= 120) {
      return { tracked: false, reason: 'rate_limited' };
    }
    bucket.count += 1;
  } else {
    visitRateBuckets.set(rateKey, { count: 1, resetAt: nowMs + 60_000 });
  }

  const verifiedVid = verifyVisitorToken(params.existingVisitorToken);
  const visitorId = verifiedVid || `vis-${nowMs}-${crypto.randomBytes(4).toString('hex')}`;
  const signedVisitorToken = signVisitorToken(visitorId);

  const uniqueVisitors = readJson<ReferralUniqueVisitorRecord[]>(UNIQUE_VISITORS_FILE, []);
  const existingUvIdx = uniqueVisitors.findIndex(
    (u) =>
      u.campaignId === campaign.id &&
      (u.visitorId === visitorId || (u.ipHash === ipHash && u.uaHash === uaHash))
  );

  const nowIso = new Date(nowMs).toISOString();
  const landingPage = String(params.landingPage || '/').slice(0, 300) || '/';
  let isUniqueFirstVisit = false;

  if (existingUvIdx === -1) {
    isUniqueFirstVisit = true;
    const uvRecord: ReferralUniqueVisitorRecord = {
      id: `uv-${campaign.id}-${visitorId}`,
      campaignId: campaign.id,
      campaignSlug: campaign.slug,
      visitorId,
      ipHash,
      uaHash,
      firstLandingPage: landingPage,
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
      visitCount: 1,
    };
    uniqueVisitors.unshift(uvRecord);
    writeJson(UNIQUE_VISITORS_FILE, uniqueVisitors);
    mirrorCollectionDoc('referralUniqueVisitors', uvRecord.id, {
      ...uvRecord,
      createdAtIso: nowIso,
    });
  } else {
    uniqueVisitors[existingUvIdx].lastSeenAt = nowIso;
    uniqueVisitors[existingUvIdx].visitCount = (uniqueVisitors[existingUvIdx].visitCount || 1) + 1;
    writeJson(UNIQUE_VISITORS_FILE, uniqueVisitors);
    mirrorCollectionDoc('referralUniqueVisitors', uniqueVisitors[existingUvIdx].id, {
      ...uniqueVisitors[existingUvIdx],
      createdAtIso: uniqueVisitors[existingUvIdx].firstSeenAt,
    });
  }

  const visits = readJson<ReferralVisitRecord[]>(VISITS_FILE, []);
  const visitRecord: ReferralVisitRecord = {
    id: `rvis-${nowMs}-${crypto.randomBytes(3).toString('hex')}`,
    campaignId: campaign.id,
    campaignSlug: campaign.slug,
    visitorId,
    isUniqueFirstVisit,
    landingPage,
    referrerHeader: params.referrerHeader ? String(params.referrerHeader).slice(0, 300) : undefined,
    ipHash,
    uaHash,
    userAgentSummary: ua.slice(0, 140),
    createdAt: nowIso,
  };
  visits.unshift(visitRecord);
  writeJson(VISITS_FILE, visits);
  mirrorCollectionDoc('referralVisits', visitRecord.id, {
    ...visitRecord,
    createdAtIso: nowIso,
  });

  const expiresAt = new Date(
    nowMs + (campaign.attributionWindowDays || 30) * 24 * 60 * 60 * 1000
  ).toISOString();

  const attributionToken = signCampaignAttributionToken({
    campaignId: campaign.id,
    campaignSlug: campaign.slug,
    visitorId,
    landingPage,
    clickedAt: nowIso,
    expiresAt,
  });

  const trackResult = {
    tracked: true,
    campaignId: campaign.id,
    campaignSlug: campaign.slug,
    campaignName: campaign.name,
    partnerName: campaign.partnerName,
    partnerSlug: toSlugFormat(campaign.partnerName) || campaign.slug,
    referralPath: `/membership/${campaign.slug}`,
    visitorToken: signedVisitorToken,
    attributionToken,
    isUniqueVisitor: isUniqueFirstVisit,
    attributionExpiresAt: expiresAt,
  };
  recentVisitDedupMap.set(dedupKey, { lastClickMs: nowMs, result: trackResult });
  return trackResult;
}

// --- USER REGISTRATION & CHECKOUT ATTRIBUTION ---
export function attachCampaignAttributionToUser(params: {
  member: SafeMember;
  attributionToken?: string | null;
  campaignSlug?: string | null;
}): { attributed: boolean; reason?: string; attribution?: UserCampaignAttribution } {
  const existingList = readJson<UserCampaignAttribution[]>(USER_ATTRIBUTIONS_FILE, []);
  const already = existingList.find((u) => u.memberId === params.member.id);
  if (already) {
    // Preserve first permanent user-account attribution
    return { attributed: false, reason: 'already_attributed', attribution: already };
  }

  let resolvedCampaign: ReferralCampaign | null = null;
  let expiresAt = '';
  let visitorId: string | undefined;
  let landingPage: string | undefined;
  let source: 'token' | 'slug' = 'slug';

  const parsedToken = verifyCampaignAttributionToken(params.attributionToken);
  if (parsedToken) {
    resolvedCampaign =
      getCampaignById(parsedToken.campaignId) || getCampaignBySlug(parsedToken.campaignSlug);
    expiresAt = parsedToken.expiresAt;
    visitorId = parsedToken.visitorId;
    landingPage = parsedToken.landingPage;
    source = 'token';
  } else if (params.campaignSlug) {
    const slugCheck = validateAndNormalizeSlug(params.campaignSlug);
    if ('slug' in slugCheck) {
      resolvedCampaign = getCampaignBySlug(slugCheck.slug);
      source = 'slug';
    }
  }

  if (!resolvedCampaign) {
    return { attributed: false, reason: 'no_campaign_found' };
  }
  if (resolvedCampaign.status !== 'active' || !isCampaignWithinDates(resolvedCampaign)) {
    return { attributed: false, reason: 'campaign_inactive_or_expired' };
  }

  // Self-referral check
  if (
    resolvedCampaign.partnerEmail &&
    params.member.email.trim().toLowerCase() === resolvedCampaign.partnerEmail.trim().toLowerCase()
  ) {
    return { attributed: false, reason: 'self_referral_blocked' };
  }

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  if (!expiresAt) {
    expiresAt = new Date(
      nowMs + (resolvedCampaign.attributionWindowDays || 30) * 24 * 60 * 60 * 1000
    ).toISOString();
  }
  if (Date.parse(expiresAt) <= nowMs) {
    return { attributed: false, reason: 'attribution_window_expired' };
  }

  const record: UserCampaignAttribution = {
    id: `uattr-${params.member.id}`,
    memberId: params.member.id,
    memberEmail: params.member.email,
    memberName: params.member.fullName,
    campaignId: resolvedCampaign.id,
    campaignSlug: resolvedCampaign.slug,
    campaignName: resolvedCampaign.name,
    visitorId,
    landingPage,
    attributedAt: nowIso,
    attributionExpiresAt: expiresAt,
    source,
  };

  existingList.unshift(record);
  writeJson(USER_ATTRIBUTIONS_FILE, existingList);
  mirrorCollectionDoc('userCampaignAttributions', record.id, {
    ...record,
    createdAtIso: nowIso,
  });

  return { attributed: true, attribution: record };
}

function resolveEligibleCampaignForMemberCheckout(params: {
  member: SafeMember;
  attributionToken?: string | null;
  campaignSlug?: string | null;
}): { campaign: ReferralCampaign; attributedAt: string } | null {
  const nowMs = Date.now();

  // Check signed attribution token first if newer & valid (last eligible click wins), else fall back to saved user attribution
  const parsedToken = verifyCampaignAttributionToken(params.attributionToken);
  if (parsedToken && Date.parse(parsedToken.expiresAt) > nowMs) {
    const camp = getCampaignById(parsedToken.campaignId) || getCampaignBySlug(parsedToken.campaignSlug);
    if (
      camp &&
      camp.status === 'active' &&
      isCampaignWithinDates(camp, nowMs) &&
      (!camp.partnerEmail || camp.partnerEmail.toLowerCase() !== params.member.email.toLowerCase())
    ) {
      return { campaign: camp, attributedAt: parsedToken.clickedAt };
    }
  }

  if (params.campaignSlug) {
    const slugCheck = validateAndNormalizeSlug(params.campaignSlug);
    if ('slug' in slugCheck) {
      const camp = getCampaignBySlug(slugCheck.slug);
      if (
        camp &&
        camp.status === 'active' &&
        isCampaignWithinDates(camp, nowMs) &&
        (!camp.partnerEmail || camp.partnerEmail.toLowerCase() !== params.member.email.toLowerCase())
      ) {
        return { campaign: camp, attributedAt: new Date(nowMs).toISOString() };
      }
    }
  }

  const userAttrs = readJson<UserCampaignAttribution[]>(USER_ATTRIBUTIONS_FILE, []);
  const userAttr = userAttrs.find((u) => u.memberId === params.member.id);
  if (userAttr && Date.parse(userAttr.attributionExpiresAt) > nowMs) {
    const camp = getCampaignById(userAttr.campaignId);
    if (
      camp &&
      camp.status === 'active' &&
      isCampaignWithinDates(camp, nowMs) &&
      (!camp.partnerEmail || camp.partnerEmail.toLowerCase() !== params.member.email.toLowerCase())
    ) {
      return { campaign: camp, attributedAt: userAttr.attributedAt };
    }
  }

  return null;
}

export function recordCheckoutAttemptForMember(params: {
  member: SafeMember;
  order: MembershipOrder;
  attributionToken?: string | null;
  campaignSlug?: string | null;
}): OrderCampaignAttribution | null {
  const resolved = resolveEligibleCampaignForMemberCheckout({
    member: params.member,
    attributionToken: params.attributionToken,
    campaignSlug: params.campaignSlug,
  });
  if (!resolved) return null;

  const orderAttrs = readJson<OrderCampaignAttribution[]>(ORDER_ATTRIBUTIONS_FILE, []);
  const existing = orderAttrs.find((o) => o.orderId === params.order.id);
  if (existing) return existing;

  const nowIso = new Date().toISOString();
  const currency: 'PKR' | 'USD' = params.order.currency === 'USD' ? 'USD' : 'PKR';
  const record: OrderCampaignAttribution = {
    id: `oattr-${params.order.id}`,
    orderId: params.order.id,
    memberId: params.member.id,
    memberEmailMasked: maskEmailForAnalytics(params.member.email),
    memberName: params.member.fullName,
    campaignId: resolved.campaign.id,
    campaignSlug: resolved.campaign.slug,
    campaignName: resolved.campaign.name,
    planId: params.order.planId,
    planName: params.order.planName,
    currency,
    orderAmountPkr: Number(params.order.amountPkr) || 0,
    orderAmountUsd: Number(params.order.amountUsd) || 0,
    orderStatus: params.order.status,
    commissionRatePercent: resolved.campaign.commissionRatePercent,
    attributedAt: nowIso,
    updatedAt: nowIso,
  };

  orderAttrs.unshift(record);
  writeJson(ORDER_ATTRIBUTIONS_FILE, orderAttrs);
  mirrorCollectionDoc('orderCampaignAttributions', record.id, {
    ...record,
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
  });

  return record;
}

export function recordCommissionForVerifiedOrder(params: {
  order: MembershipOrder;
  admin: SafeAdmin;
}): CampaignCommissionRecord | null {
  if (params.order.status !== 'approved') return null;

  const commissions = readJson<CampaignCommissionRecord[]>(COMMISSIONS_FILE, []);
  const existing = commissions.find((c) => c.orderId === params.order.id);
  if (existing) {
    // Strictly prevent duplicate commission records for the same order
    return existing;
  }

  const orderAttrs = readJson<OrderCampaignAttribution[]>(ORDER_ATTRIBUTIONS_FILE, []);
  const attrIdx = orderAttrs.findIndex((o) => o.orderId === params.order.id);
  let attr = attrIdx !== -1 ? orderAttrs[attrIdx] : undefined;

  if (!attr) {
    // Check if member had an active user attribution even if order hook missed
    const userAttrs = readJson<UserCampaignAttribution[]>(USER_ATTRIBUTIONS_FILE, []);
    const uAttr = userAttrs.find(
      (u) => u.memberId === params.order.memberId && Date.parse(u.attributionExpiresAt) > Date.parse(params.order.createdAt)
    );
    if (!uAttr) return null;
    const camp = getCampaignById(uAttr.campaignId);
    if (!camp || camp.status === 'disabled') return null;
    if (
      camp.partnerEmail &&
      params.order.customerEmail &&
      camp.partnerEmail.toLowerCase() === params.order.customerEmail.toLowerCase()
    ) {
      return null;
    }

    const currency: 'PKR' | 'USD' = params.order.currency === 'USD' ? 'USD' : 'PKR';
    attr = {
      id: `oattr-${params.order.id}`,
      orderId: params.order.id,
      memberId: params.order.memberId,
      memberEmailMasked: maskEmailForAnalytics(params.order.customerEmail),
      memberName: params.order.customerName || 'FEVIQO Member',
      campaignId: camp.id,
      campaignSlug: camp.slug,
      campaignName: camp.name,
      planId: params.order.planId,
      planName: params.order.planName,
      currency,
      orderAmountPkr: Number(params.order.amountPkr) || 0,
      orderAmountUsd: Number(params.order.amountUsd) || 0,
      orderStatus: 'approved',
      commissionRatePercent: camp.commissionRatePercent,
      attributedAt: params.order.createdAt,
      updatedAt: new Date().toISOString(),
    };
    orderAttrs.unshift(attr);
  } else {
    orderAttrs[attrIdx].orderStatus = 'approved';
    orderAttrs[attrIdx].updatedAt = new Date().toISOString();
    attr = orderAttrs[attrIdx];
  }

  writeJson(ORDER_ATTRIBUTIONS_FILE, orderAttrs);
  mirrorCollectionDoc('orderCampaignAttributions', attr.id, {
    ...attr,
    createdAtIso: attr.attributedAt,
    updatedAtIso: attr.updatedAt,
  });

  const campaign = getCampaignById(attr.campaignId);
  const currency: 'PKR' | 'USD' = params.order.currency === 'USD' ? 'USD' : 'PKR';
  const amountPkr = currency === 'PKR' ? Number(params.order.amountPkr) || 0 : 0;
  const amountUsd = currency === 'USD' ? Number(params.order.amountUsd ?? params.order.expectedAmount ?? 0) : 0;

  // Exclude 0-value / free orders
  if (currency === 'PKR' && amountPkr <= 0) return null;
  if (currency === 'USD' && amountUsd <= 0) return null;

  const rate = attr.commissionRatePercent ?? campaign?.commissionRatePercent ?? 2;
  const commPkr = currency === 'PKR' ? Number(((amountPkr * rate) / 100).toFixed(2)) : 0;
  const commUsd = currency === 'USD' ? Number(((amountUsd * rate) / 100).toFixed(2)) : 0;
  const verifiedAt = params.order.paidAt || new Date().toISOString();
  const monthKey = verifiedAt.slice(0, 7);

  const commRecord: CampaignCommissionRecord = {
    id: `comm-${params.order.id}`,
    campaignId: attr.campaignId,
    campaignName: campaign?.name || attr.campaignName,
    campaignSlug: campaign?.slug || attr.campaignSlug,
    partnerName: campaign?.partnerName || 'Partner',
    orderId: params.order.id,
    memberId: params.order.memberId,
    memberEmailMasked: attr.memberEmailMasked || maskEmailForAnalytics(params.order.customerEmail),
    memberName: attr.memberName || params.order.customerName || 'FEVIQO Member',
    planId: params.order.planId,
    planName: params.order.planName,
    currency,
    orderAmountPkr: amountPkr,
    orderAmountUsd: amountUsd,
    commissionRatePercent: rate,
    commissionAmountPkr: commPkr,
    commissionAmountUsd: commUsd,
    status: 'pending',
    monthKey,
    verifiedAt,
    createdAt: verifiedAt,
    updatedAt: verifiedAt,
  };

  commissions.unshift(commRecord);
  writeJson(COMMISSIONS_FILE, commissions);
  mirrorCollectionDoc('campaignCommissions', commRecord.id, {
    ...commRecord,
    createdAtIso: commRecord.createdAt,
    updatedAtIso: commRecord.updatedAt,
  });

  return commRecord;
}

export function reverseCommissionForOrder(params: {
  orderId: string;
  orderStatus?: string;
  reason: string;
  actorEmail?: string;
}): CampaignCommissionRecord | null {
  const nowIso = new Date().toISOString();
  const orderAttrs = readJson<OrderCampaignAttribution[]>(ORDER_ATTRIBUTIONS_FILE, []);
  const attrIdx = orderAttrs.findIndex((o) => o.orderId === params.orderId);
  if (attrIdx !== -1) {
    orderAttrs[attrIdx].orderStatus = params.orderStatus || 'reversed';
    orderAttrs[attrIdx].updatedAt = nowIso;
    writeJson(ORDER_ATTRIBUTIONS_FILE, orderAttrs);
    mirrorCollectionDoc('orderCampaignAttributions', orderAttrs[attrIdx].id, {
      ...orderAttrs[attrIdx],
      createdAtIso: orderAttrs[attrIdx].attributedAt,
      updatedAtIso: nowIso,
    });
  }

  const commissions = readJson<CampaignCommissionRecord[]>(COMMISSIONS_FILE, []);
  const cIdx = commissions.findIndex((c) => c.orderId === params.orderId);
  if (cIdx === -1) return null;
  if (commissions[cIdx].status === 'reversed') return commissions[cIdx];

  commissions[cIdx].status = 'reversed';
  commissions[cIdx].reversedAt = nowIso;
  commissions[cIdx].reversalReason = params.reason;
  commissions[cIdx].updatedAt = nowIso;
  writeJson(COMMISSIONS_FILE, commissions);
  mirrorCollectionDoc('campaignCommissions', commissions[cIdx].id, {
    ...commissions[cIdx],
    createdAtIso: commissions[cIdx].createdAt,
    updatedAtIso: nowIso,
  });

  appendCampaignActivity(commissions[cIdx].campaignId, {
    action: 'commission_reversed',
    actorEmail: params.actorEmail || 'system',
    details: `Reversed commission for order ${params.orderId} (${params.reason}).`,
  });

  return commissions[cIdx];
}

export function approveCommissionByAdmin(params: {
  commissionId: string;
  admin: SafeAdmin;
}): { success: true; commission: CampaignCommissionRecord } | { success: false; error: string; statusCode: number } {
  const commissions = readJson<CampaignCommissionRecord[]>(COMMISSIONS_FILE, []);
  const idx = commissions.findIndex((c) => c.id === params.commissionId);
  if (idx === -1) {
    return { success: false, error: 'Commission record not found.', statusCode: 404 };
  }
  const c = commissions[idx];
  if (c.status === 'reversed') {
    return { success: false, error: 'Cannot approve a reversed commission.', statusCode: 409 };
  }
  if (c.status === 'paid') {
    return { success: false, error: 'This commission is already marked as paid.', statusCode: 409 };
  }
  const nowIso = new Date().toISOString();
  c.status = 'approved';
  c.approvedAt = nowIso;
  c.approvedByAdminEmail = params.admin.email;
  c.updatedAt = nowIso;
  commissions[idx] = c;
  writeJson(COMMISSIONS_FILE, commissions);
  mirrorCollectionDoc('campaignCommissions', c.id, {
    ...c,
    createdAtIso: c.createdAt,
    updatedAtIso: nowIso,
  });

  appendCampaignActivity(c.campaignId, {
    action: 'commission_approved',
    actorEmail: params.admin.email,
    details: `Approved commission ${c.id} (${c.currency === 'USD' ? `$${c.commissionAmountUsd}` : `PKR ${c.commissionAmountPkr}`}) for order ${c.orderId}.`,
  });

  return { success: true, commission: c };
}

export function markCommissionsPaidByAdmin(params: {
  commissionIds?: string[];
  campaignId?: string;
  monthKey?: string;
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  admin: SafeAdmin;
}): {
  success: true;
  payment: CommissionPaymentRecord;
  updatedCount: number;
} | { success: false; error: string; statusCode: number } {
  const commissions = readJson<CampaignCommissionRecord[]>(COMMISSIONS_FILE, []);
  const idSet = Array.isArray(params.commissionIds) ? new Set(params.commissionIds) : null;

  const targets = commissions.filter((c) => {
    if (c.status === 'paid' || c.status === 'reversed') return false;
    if (idSet && idSet.size > 0) return idSet.has(c.id);
    if (params.campaignId && c.campaignId !== params.campaignId) return false;
    if (params.monthKey && c.monthKey !== params.monthKey) return false;
    return true;
  });

  if (targets.length === 0) {
    return { success: false, error: 'No pending or approved unpaid commissions matched for payout.', statusCode: 400 };
  }

  const nowIso = new Date().toISOString();
  const paymentDate = (params.paymentDate || nowIso.slice(0, 10)).trim();
  const paymentMethod = String(params.paymentMethod || 'Bank Transfer').trim().slice(0, 80);
  const paymentReference = params.paymentReference ? String(params.paymentReference).trim().slice(0, 120) : undefined;
  const notes = String(params.notes || '').trim().slice(0, 500);
  const paymentId = `cpay-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  const primaryCampaign = getCampaignById(targets[0].campaignId);
  const totalPkr = Number(
    targets.reduce((sum, c) => sum + (Number(c.commissionAmountPkr) || 0), 0).toFixed(2)
  );
  const totalUsd = Number(
    targets.reduce((sum, c) => sum + (Number(c.commissionAmountUsd) || 0), 0).toFixed(2)
  );

  const paymentRecord: CommissionPaymentRecord = {
    id: paymentId,
    campaignId: targets[0].campaignId,
    campaignName: primaryCampaign?.name || targets[0].campaignName,
    partnerName: primaryCampaign?.partnerName || targets[0].partnerName,
    monthKey: params.monthKey || targets[0].monthKey,
    commissionIds: targets.map((c) => c.id),
    totalAmountPkr: totalPkr,
    totalAmountUsd: totalUsd,
    paymentDate,
    paymentMethod,
    paymentReference,
    notes,
    paidByAdminEmail: params.admin.email,
    createdAt: nowIso,
  };

  const targetIdSet = new Set(targets.map((c) => c.id));
  for (let i = 0; i < commissions.length; i += 1) {
    if (targetIdSet.has(commissions[i].id)) {
      commissions[i].status = 'paid';
      commissions[i].approvedAt = commissions[i].approvedAt || nowIso;
      commissions[i].approvedByAdminEmail = commissions[i].approvedByAdminEmail || params.admin.email;
      commissions[i].paidAt = nowIso;
      commissions[i].paymentId = paymentId;
      commissions[i].paymentDate = paymentDate;
      commissions[i].paymentNotes = notes;
      commissions[i].updatedAt = nowIso;
      mirrorCollectionDoc('campaignCommissions', commissions[i].id, {
        ...commissions[i],
        createdAtIso: commissions[i].createdAt,
        updatedAtIso: nowIso,
      });
    }
  }

  writeJson(COMMISSIONS_FILE, commissions);

  const payments = readJson<CommissionPaymentRecord[]>(PAYMENTS_FILE, []);
  payments.unshift(paymentRecord);
  writeJson(PAYMENTS_FILE, payments);
  mirrorCollectionDoc('commissionPayments', paymentRecord.id, {
    ...paymentRecord,
    createdAtIso: nowIso,
  });

  const touchedCampaigns = new Set(targets.map((t) => t.campaignId));
  for (const cid of touchedCampaigns) {
    appendCampaignActivity(cid, {
      action: 'commission_paid',
      actorEmail: params.admin.email,
      details: `Marked ${targets.filter((t) => t.campaignId === cid).length} commission(s) paid on ${paymentDate} (${paymentMethod}). ${notes ? `Note: ${notes}` : ''}`.trim(),
    });
  }

  return { success: true, payment: paymentRecord, updatedCount: targets.length };
}

// --- ANALYTICS & MONTHLY REPORTING ---
export function getCampaignSummaryStats(campaign: ReferralCampaign) {
  const visits = readJson<ReferralVisitRecord[]>(VISITS_FILE, []).filter((v) => v.campaignId === campaign.id);
  const uniqueVisitors = readJson<ReferralUniqueVisitorRecord[]>(UNIQUE_VISITORS_FILE, []).filter(
    (u) => u.campaignId === campaign.id
  );
  const registeredUsers = readJson<UserCampaignAttribution[]>(USER_ATTRIBUTIONS_FILE, []).filter(
    (u) => u.campaignId === campaign.id
  );
  const checkoutAttempts = readJson<OrderCampaignAttribution[]>(ORDER_ATTRIBUTIONS_FILE, []).filter(
    (o) => o.campaignId === campaign.id
  );
  const allCommissions = readJson<CampaignCommissionRecord[]>(COMMISSIONS_FILE, []).filter(
    (c) => c.campaignId === campaign.id
  );
  const activeCommissions = allCommissions.filter((c) => c.status !== 'reversed');
  const paidMembershipsCount = activeCommissions.length;

  const revenuePkr = Number(
    activeCommissions.reduce((sum, c) => sum + (Number(c.orderAmountPkr) || 0), 0).toFixed(2)
  );
  const revenueUsd = Number(
    activeCommissions.reduce((sum, c) => sum + (Number(c.orderAmountUsd) || 0), 0).toFixed(2)
  );
  const totalCommissionEarnedPkr = Number(
    activeCommissions.reduce((sum, c) => sum + (Number(c.commissionAmountPkr) || 0), 0).toFixed(2)
  );
  const totalCommissionEarnedUsd = Number(
    activeCommissions.reduce((sum, c) => sum + (Number(c.commissionAmountUsd) || 0), 0).toFixed(2)
  );
  const paidCommissionPkr = Number(
    activeCommissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + (Number(c.commissionAmountPkr) || 0), 0)
      .toFixed(2)
  );
  const paidCommissionUsd = Number(
    activeCommissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + (Number(c.commissionAmountUsd) || 0), 0)
      .toFixed(2)
  );
  const pendingCommissionPkr = Number(Math.max(0, totalCommissionEarnedPkr - paidCommissionPkr).toFixed(2));
  const pendingCommissionUsd = Number(Math.max(0, totalCommissionEarnedUsd - paidCommissionUsd).toFixed(2));

  const conversionRate =
    uniqueVisitors.length > 0
      ? Number(((paidMembershipsCount / uniqueVisitors.length) * 100).toFixed(2))
      : 0;

  return {
    totalClicks: visits.length,
    uniqueVisitors: uniqueVisitors.length,
    registeredUsers: registeredUsers.length,
    checkoutAttempts: checkoutAttempts.length,
    successfulPaidMemberships: paidMembershipsCount,
    conversionRate,
    revenueGeneratedPkr: revenuePkr,
    revenueGeneratedUsd: revenueUsd,
    commissionRatePercent: campaign.commissionRatePercent,
    totalCommissionEarnedPkr,
    totalCommissionEarnedUsd,
    pendingCommissionPkr,
    pendingCommissionUsd,
    paidCommissionPkr,
    paidCommissionUsd,
  };
}

export function getCampaignDetailAnalytics(campaignId: string) {
  const campaign = getCampaignById(campaignId);
  if (!campaign) return null;

  const stats = getCampaignSummaryStats(campaign);
  const visits = readJson<ReferralVisitRecord[]>(VISITS_FILE, [])
    .filter((v) => v.campaignId === campaign.id)
    .slice(0, 100);
  const registeredUsers = readJson<UserCampaignAttribution[]>(USER_ATTRIBUTIONS_FILE, []).filter(
    (u) => u.campaignId === campaign.id
  );
  const orderAttributions = readJson<OrderCampaignAttribution[]>(ORDER_ATTRIBUTIONS_FILE, []).filter(
    (o) => o.campaignId === campaign.id
  );
  const commissions = readJson<CampaignCommissionRecord[]>(COMMISSIONS_FILE, []).filter(
    (c) => c.campaignId === campaign.id
  );
  const payments = readJson<CommissionPaymentRecord[]>(PAYMENTS_FILE, []).filter(
    (p) => p.campaignId === campaign.id
  );

  // Build masked customer list with order & commission status (no private emails or payment screenshots exposed)
  const referredCustomers = registeredUsers.map((u) => {
    const userOrders = orderAttributions.filter((o) => o.memberId === u.memberId);
    const latestOrder = userOrders[0];
    return {
      memberId: u.memberId,
      customerName: u.memberName,
      customerEmailMasked: maskEmailForAnalytics(u.memberEmail),
      attributedAt: u.attributedAt,
      attributionExpiresAt: u.attributionExpiresAt,
      ordersCount: userOrders.length,
      latestOrderId: latestOrder?.orderId,
      latestPlanName: latestOrder?.planName,
      latestOrderStatus: latestOrder?.orderStatus || 'registered_no_order',
      latestOrderAmountPkr: latestOrder?.orderAmountPkr,
      latestOrderAmountUsd: latestOrder?.orderAmountUsd,
      latestCurrency: latestOrder?.currency,
    };
  });

  return {
    campaign,
    stats,
    referredCustomers,
    orderAttributions,
    commissions,
    payments,
    recentVisits: visits,
  };
}

export function buildMonthlyCommissionReport(monthKey: string): MonthlyCommissionReportSnapshot {
  const cleanMonth = /^\d{4}-\d{2}$/.test(monthKey) ? monthKey : new Date().toISOString().slice(0, 7);
  const campaigns = readJson<ReferralCampaign[]>(CAMPAIGNS_FILE, []);
  const commissions = readJson<CampaignCommissionRecord[]>(COMMISSIONS_FILE, []).filter(
    (c) => c.monthKey === cleanMonth && c.status !== 'reversed'
  );

  const byCampaign = new Map<string, CampaignCommissionRecord[]>();
  for (const c of commissions) {
    byCampaign.set(c.campaignId, [...(byCampaign.get(c.campaignId) || []), c]);
  }

  const rows: MonthlyCommissionReportRow[] = [];
  for (const camp of campaigns) {
    const items = byCampaign.get(camp.id) || [];
    if (items.length === 0 && camp.status === 'disabled') continue;
    const revPkr = Number(items.reduce((s, i) => s + (Number(i.orderAmountPkr) || 0), 0).toFixed(2));
    const revUsd = Number(items.reduce((s, i) => s + (Number(i.orderAmountUsd) || 0), 0).toFixed(2));
    const earnedPkr = Number(items.reduce((s, i) => s + (Number(i.commissionAmountPkr) || 0), 0).toFixed(2));
    const earnedUsd = Number(items.reduce((s, i) => s + (Number(i.commissionAmountUsd) || 0), 0).toFixed(2));
    const paidPkr = Number(
      items
        .filter((i) => i.status === 'paid')
        .reduce((s, i) => s + (Number(i.commissionAmountPkr) || 0), 0)
        .toFixed(2)
    );
    const paidUsd = Number(
      items
        .filter((i) => i.status === 'paid')
        .reduce((s, i) => s + (Number(i.commissionAmountUsd) || 0), 0)
        .toFixed(2)
    );
    const approvedUnpaidPkr = Number(
      items
        .filter((i) => i.status === 'approved')
        .reduce((s, i) => s + (Number(i.commissionAmountPkr) || 0), 0)
        .toFixed(2)
    );
    const approvedUnpaidUsd = Number(
      items
        .filter((i) => i.status === 'approved')
        .reduce((s, i) => s + (Number(i.commissionAmountUsd) || 0), 0)
        .toFixed(2)
    );
    const pendingPkr = Number(Math.max(0, earnedPkr - paidPkr).toFixed(2));
    const pendingUsd = Number(Math.max(0, earnedUsd - paidUsd).toFixed(2));

    rows.push({
      campaignId: camp.id,
      campaignName: camp.name,
      partnerName: camp.partnerName,
      campaignSlug: camp.slug,
      currentCommissionRatePercent: items[0]?.commissionRatePercent ?? camp.commissionRatePercent,
      successfulMemberships: items.length,
      totalRevenuePkr: revPkr,
      totalRevenueUsd: revUsd,
      totalCommissionEarnedPkr: earnedPkr,
      totalCommissionEarnedUsd: earnedUsd,
      pendingCommissionPkr: pendingPkr,
      pendingCommissionUsd: pendingUsd,
      approvedUnpaidCommissionPkr: approvedUnpaidPkr,
      approvedUnpaidCommissionUsd: approvedUnpaidUsd,
      paidCommissionPkr: paidPkr,
      paidCommissionUsd: paidUsd,
    });
  }

  return {
    id: `rpt-${cleanMonth}`,
    monthKey: cleanMonth,
    generatedAt: new Date().toISOString(),
    generatedByAdminEmail: 'system',
    totalMemberships: rows.reduce((s, r) => s + r.successfulMemberships, 0),
    totalRevenuePkr: Number(rows.reduce((s, r) => s + r.totalRevenuePkr, 0).toFixed(2)),
    totalRevenueUsd: Number(rows.reduce((s, r) => s + r.totalRevenueUsd, 0).toFixed(2)),
    totalCommissionEarnedPkr: Number(rows.reduce((s, r) => s + r.totalCommissionEarnedPkr, 0).toFixed(2)),
    totalCommissionEarnedUsd: Number(rows.reduce((s, r) => s + r.totalCommissionEarnedUsd, 0).toFixed(2)),
    totalPendingPkr: Number(rows.reduce((s, r) => s + r.pendingCommissionPkr, 0).toFixed(2)),
    totalPendingUsd: Number(rows.reduce((s, r) => s + r.pendingCommissionUsd, 0).toFixed(2)),
    totalPaidPkr: Number(rows.reduce((s, r) => s + r.paidCommissionPkr, 0).toFixed(2)),
    totalPaidUsd: Number(rows.reduce((s, r) => s + r.paidCommissionUsd, 0).toFixed(2)),
    rows,
  };
}

export function saveMonthlyCommissionReportSnapshot(
  monthKey: string,
  admin: SafeAdmin
): MonthlyCommissionReportSnapshot {
  const report = buildMonthlyCommissionReport(monthKey);
  report.generatedByAdminEmail = admin.email;

  const list = readJson<MonthlyCommissionReportSnapshot[]>(MONTHLY_REPORTS_FILE, []);
  const idx = list.findIndex((r) => r.monthKey === report.monthKey);
  if (idx === -1) {
    list.unshift(report);
  } else {
    list[idx] = report;
  }
  list.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  writeJson(MONTHLY_REPORTS_FILE, list);
  mirrorCollectionDoc('monthlyCommissionReports', report.id, {
    ...report,
    createdAtIso: report.generatedAt,
    updatedAtIso: report.generatedAt,
  });

  return report;
}

export function exportMonthlyCommissionReportCsv(monthKey: string): string {
  const report = buildMonthlyCommissionReport(monthKey);
  const esc = (v: unknown) => {
    const s = String(v ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = [
    'Month',
    'Campaign Name',
    'Partner Name',
    'Slug',
    'Successful Paid Memberships',
    'Total Revenue (PKR)',
    'Total Revenue (USD)',
    'Commission Rate (%)',
    'Total Commission Earned (PKR)',
    'Total Commission Earned (USD)',
    'Pending Commission (PKR)',
    'Pending Commission (USD)',
    'Paid Commission (PKR)',
    'Paid Commission (USD)',
  ];
  const lines = [header.map(esc).join(',')];
  for (const r of report.rows) {
    lines.push(
      [
        report.monthKey,
        r.campaignName,
        r.partnerName,
        r.campaignSlug,
        r.successfulMemberships,
        r.totalRevenuePkr.toFixed(2),
        r.totalRevenueUsd.toFixed(2),
        r.currentCommissionRatePercent.toFixed(2),
        r.totalCommissionEarnedPkr.toFixed(2),
        r.totalCommissionEarnedUsd.toFixed(2),
        r.pendingCommissionPkr.toFixed(2),
        r.pendingCommissionUsd.toFixed(2),
        r.paidCommissionPkr.toFixed(2),
        r.paidCommissionUsd.toFixed(2),
      ]
        .map(esc)
        .join(',')
    );
  }
  return lines.join('\n');
}

export function getReferralCampaignsAdminOverview(monthKey?: string) {
  const campaigns = ensureDefaultReferralCampaigns().map((c) => ({
    ...c,
    referralUrl: buildCampaignReferralUrl(c.slug),
    stats: getCampaignSummaryStats(c),
  }));
  const commissions = readJson<CampaignCommissionRecord[]>(COMMISSIONS_FILE, []);
  const payments = readJson<CommissionPaymentRecord[]>(PAYMENTS_FILE, []);
  const savedMonthlyReports = readJson<MonthlyCommissionReportSnapshot[]>(MONTHLY_REPORTS_FILE, []);
  const activeMonthKey =
    monthKey && /^\d{4}-\d{2}$/.test(monthKey) ? monthKey : new Date().toISOString().slice(0, 7);
  const currentMonthlyReport = buildMonthlyCommissionReport(activeMonthKey);

  return {
    campaigns,
    commissions: commissions.slice(0, 300),
    payments: payments.slice(0, 200),
    monthlyReport: currentMonthlyReport,
    savedMonthlyReports: savedMonthlyReports.slice(0, 36),
    summary: {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
      totalClicks: campaigns.reduce((s, c) => s + c.stats.totalClicks, 0),
      totalUniqueVisitors: campaigns.reduce((s, c) => s + c.stats.uniqueVisitors, 0),
      totalRegisteredUsers: campaigns.reduce((s, c) => s + c.stats.registeredUsers, 0),
      totalPaidMemberships: campaigns.reduce((s, c) => s + c.stats.successfulPaidMemberships, 0),
      totalRevenuePkr: Number(campaigns.reduce((s, c) => s + c.stats.revenueGeneratedPkr, 0).toFixed(2)),
      totalRevenueUsd: Number(campaigns.reduce((s, c) => s + c.stats.revenueGeneratedUsd, 0).toFixed(2)),
      totalCommissionEarnedPkr: Number(
        campaigns.reduce((s, c) => s + c.stats.totalCommissionEarnedPkr, 0).toFixed(2)
      ),
      totalCommissionEarnedUsd: Number(
        campaigns.reduce((s, c) => s + c.stats.totalCommissionEarnedUsd, 0).toFixed(2)
      ),
      totalPendingCommissionPkr: Number(
        campaigns.reduce((s, c) => s + c.stats.pendingCommissionPkr, 0).toFixed(2)
      ),
      totalPendingCommissionUsd: Number(
        campaigns.reduce((s, c) => s + c.stats.pendingCommissionUsd, 0).toFixed(2)
      ),
      totalPaidCommissionPkr: Number(
        campaigns.reduce((s, c) => s + c.stats.paidCommissionPkr, 0).toFixed(2)
      ),
      totalPaidCommissionUsd: Number(
        campaigns.reduce((s, c) => s + c.stats.paidCommissionUsd, 0).toFixed(2)
      ),
    },
  };
}

export function mergeCampaignCloudSnapshot(payload: {
  referralCampaigns?: ReferralCampaign[];
  referralVisits?: ReferralVisitRecord[];
  referralUniqueVisitors?: ReferralUniqueVisitorRecord[];
  userCampaignAttributions?: UserCampaignAttribution[];
  orderCampaignAttributions?: OrderCampaignAttribution[];
  campaignCommissions?: CampaignCommissionRecord[];
  commissionPayments?: CommissionPaymentRecord[];
  monthlyCommissionReports?: MonthlyCommissionReportSnapshot[];
}): void {
  const mergeById = <T extends { id: string }>(filePath: string, incoming?: T[]) => {
    if (!Array.isArray(incoming) || incoming.length === 0) return;
    const current = readJson<T[]>(filePath, []);
    const map = new Map(current.map((item) => [item.id, item]));
    for (const inc of incoming) {
      if (inc?.id && !map.has(inc.id)) {
        map.set(inc.id, inc);
      }
    }
    writeJson(filePath, Array.from(map.values()));
  };

  mergeById(CAMPAIGNS_FILE, payload.referralCampaigns);
  mergeById(VISITS_FILE, payload.referralVisits);
  mergeById(UNIQUE_VISITORS_FILE, payload.referralUniqueVisitors);
  mergeById(USER_ATTRIBUTIONS_FILE, payload.userCampaignAttributions);
  mergeById(ORDER_ATTRIBUTIONS_FILE, payload.orderCampaignAttributions);
  mergeById(COMMISSIONS_FILE, payload.campaignCommissions);
  mergeById(PAYMENTS_FILE, payload.commissionPayments);
  mergeById(MONTHLY_REPORTS_FILE, payload.monthlyCommissionReports);
}

export function syncCampaignDocsToFirestore(): void {
  if (!isServerFirestoreEnabled()) return;
  for (const c of readJson<ReferralCampaign[]>(CAMPAIGNS_FILE, [])) {
    mirrorCollectionDoc('referralCampaigns', c.id, { ...c, createdAtIso: c.createdAt, updatedAtIso: c.updatedAt });
  }
  for (const v of readJson<ReferralVisitRecord[]>(VISITS_FILE, []).slice(0, 200)) {
    mirrorCollectionDoc('referralVisits', v.id, { ...v, createdAtIso: v.createdAt });
  }
  for (const uv of readJson<ReferralUniqueVisitorRecord[]>(UNIQUE_VISITORS_FILE, []).slice(0, 200)) {
    mirrorCollectionDoc('referralUniqueVisitors', uv.id, { ...uv, createdAtIso: uv.firstSeenAt });
  }
  for (const ua of readJson<UserCampaignAttribution[]>(USER_ATTRIBUTIONS_FILE, [])) {
    mirrorCollectionDoc('userCampaignAttributions', ua.id, { ...ua, createdAtIso: ua.attributedAt });
  }
  for (const oa of readJson<OrderCampaignAttribution[]>(ORDER_ATTRIBUTIONS_FILE, [])) {
    mirrorCollectionDoc('orderCampaignAttributions', oa.id, { ...oa, createdAtIso: oa.attributedAt, updatedAtIso: oa.updatedAt });
  }
  for (const comm of readJson<CampaignCommissionRecord[]>(COMMISSIONS_FILE, [])) {
    mirrorCollectionDoc('campaignCommissions', comm.id, { ...comm, createdAtIso: comm.createdAt, updatedAtIso: comm.updatedAt });
  }
  for (const pay of readJson<CommissionPaymentRecord[]>(PAYMENTS_FILE, [])) {
    mirrorCollectionDoc('commissionPayments', pay.id, { ...pay, createdAtIso: pay.createdAt });
  }
  for (const rpt of readJson<MonthlyCommissionReportSnapshot[]>(MONTHLY_REPORTS_FILE, [])) {
    mirrorCollectionDoc('monthlyCommissionReports', rpt.id, { ...rpt, createdAtIso: rpt.generatedAt, updatedAtIso: rpt.generatedAt });
  }
}

export function syncClientReferralVisits(
  localVisits: Array<{
    id?: string;
    campaignSlug?: string;
    visitorId?: string;
    landingPage?: string;
    createdAt?: string;
    ip?: string;
    userAgent?: string;
  }>
): number {
  if (!Array.isArray(localVisits) || localVisits.length === 0) return 0;
  ensureDefaultReferralCampaigns();
  const visits = readJson<ReferralVisitRecord[]>(VISITS_FILE, []);
  const uniqueVisitors = readJson<ReferralUniqueVisitorRecord[]>(UNIQUE_VISITORS_FILE, []);
  const visitIds = new Set(visits.map((v) => v.id));
  let added = 0;

  for (const item of localVisits) {
    const rawSlug = String(item?.campaignSlug || '').trim();
    const slugCheck = validateAndNormalizeSlug(rawSlug);
    if (!('slug' in slugCheck)) continue;

    let campaign = getCampaignBySlug(slugCheck.slug);
    if (!campaign && !slugCheck.slug.startsWith('fev-')) {
      const displayName = formatCampaignDisplayNameFromSlug(slugCheck.slug) || slugCheck.slug;
      const nowIso = new Date().toISOString();
      const autoCampaign: ReferralCampaign = {
        id: slugCheck.slug === 'kameer-play' ? 'cmp-kameer-play' : `cmp-${slugCheck.slug}`,
        name: displayName,
        partnerName: slugCheck.slug === 'kameer-play' ? 'Hafiz Akash' : displayName,
        description: `Partner referral campaign (${slugCheck.slug})`,
        slug: slugCheck.slug,
        referralUrl: buildCampaignReferralUrl(slugCheck.slug),
        commissionRatePercent: 2,
        attributionWindowDays: 30,
        status: 'active',
        createdByAdminEmail: 'partner@feviqo.com',
        createdAt: nowIso,
        updatedAt: nowIso,
        activityHistory: [],
      };
      const allCamps = readJson<ReferralCampaign[]>(CAMPAIGNS_FILE, []);
      allCamps.unshift(autoCampaign);
      writeJson(CAMPAIGNS_FILE, allCamps);
      campaign = autoCampaign;
    }
    if (!campaign) continue;

    const visitId = item.id && String(item.id).startsWith('rvis-')
      ? String(item.id)
      : `rvis-client-${hashShort(`${campaign.id}:${item.createdAt || ''}:${item.landingPage || ''}`)}`;
    if (visitIds.has(visitId)) continue;

    // Also skip if a server visit for the same campaign was already recorded within 2 seconds of this client timestamp
    const createdAtIso = item.createdAt && !Number.isNaN(Date.parse(item.createdAt))
      ? new Date(Date.parse(item.createdAt)).toISOString()
      : new Date().toISOString();
    const itemMs = Date.parse(createdAtIso);
    const alreadyRecordedNearby = visits.some(
      (v) =>
        v.campaignId === campaign!.id &&
        Math.abs(Date.parse(v.createdAt) - itemMs) < 2000
    );
    if (alreadyRecordedNearby) {
      visitIds.add(visitId);
      continue;
    }

    const visitorId =
      item.visitorId && /^vis-[a-zA-Z0-9_-]+$/.test(item.visitorId)
        ? item.visitorId
        : `vis-client-${hashShort(item.ip || 'local-browser')}`;
    const ipHash = hashShort(item.ip || 'client-browser');
    const ua = String(item.userAgent || 'Mozilla/5.0 (ClientSync)').slice(0, 140);
    const uaHash = hashShort(ua);
    const landingPage = String(item.landingPage || `/membership/${campaign.slug}`).slice(0, 300);

    const existingUvIdx = uniqueVisitors.findIndex(
      (u) => u.campaignId === campaign!.id && (u.visitorId === visitorId || (u.ipHash === ipHash && u.uaHash === uaHash))
    );
    let isUniqueFirstVisit = false;
    if (existingUvIdx === -1) {
      isUniqueFirstVisit = true;
      const uvRecord: ReferralUniqueVisitorRecord = {
        id: `uv-${campaign.id}-${visitorId}`,
        campaignId: campaign.id,
        campaignSlug: campaign.slug,
        visitorId,
        ipHash,
        uaHash,
        firstLandingPage: landingPage,
        firstSeenAt: createdAtIso,
        lastSeenAt: createdAtIso,
        visitCount: 1,
      };
      uniqueVisitors.unshift(uvRecord);
      mirrorCollectionDoc('referralUniqueVisitors', uvRecord.id, { ...uvRecord, createdAtIso });
    } else {
      uniqueVisitors[existingUvIdx].lastSeenAt = createdAtIso;
      uniqueVisitors[existingUvIdx].visitCount = (uniqueVisitors[existingUvIdx].visitCount || 1) + 1;
      mirrorCollectionDoc('referralUniqueVisitors', uniqueVisitors[existingUvIdx].id, {
        ...uniqueVisitors[existingUvIdx],
        createdAtIso: uniqueVisitors[existingUvIdx].firstSeenAt,
      });
    }

    const visitRecord: ReferralVisitRecord = {
      id: visitId,
      campaignId: campaign.id,
      campaignSlug: campaign.slug,
      visitorId,
      isUniqueFirstVisit,
      landingPage,
      ipHash,
      uaHash,
      userAgentSummary: ua,
      createdAt: createdAtIso,
    };
    visits.unshift(visitRecord);
    visitIds.add(visitId);
    added += 1;
    mirrorCollectionDoc('referralVisits', visitRecord.id, { ...visitRecord, createdAtIso });
  }

  if (added > 0) {
    visits.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    writeJson(VISITS_FILE, visits);
    writeJson(UNIQUE_VISITORS_FILE, uniqueVisitors);
  }
  return added;
}

ensureDefaultReferralCampaigns();


import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  isServerFirestoreEnabled,
  mirrorDocToFirestoreServer,
  deleteDocFromFirestoreServer,
} from './firestoreAdmin';

const DATA_DIR = path.join(process.cwd(), 'data');
const ENTRIES_FILE = path.join(DATA_DIR, 'supporters_leaderboard.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'supporters_leaderboard_settings.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export type SupporterEntryType = 'manual_featured' | 'verified_customer';

export interface SupporterLeaderboardEntry {
  id: string;
  displayName: string;
  contributionAmount: number;
  amountVisible: boolean;
  badge: string;
  displayPriority: number | null;
  entryType: SupporterEntryType;
  active: boolean;
  featured: boolean;
  removed: boolean;
  createdAt: string;
  updatedAt: string;
  // Internal admin-only metadata (NEVER exposed on public API or public Firestore docs)
  sourceOrderId?: string;
  updatedByAdminEmail?: string;
}

export interface SupporterLeaderboardSettings {
  id: 'main';
  enabled: boolean;
  maxDisplayed: number;
  showAmountsGlobally: boolean;
  allowAutomaticRanking: boolean;
  allowManualPriority: boolean;
  showBadges: boolean;
  showSubtitle: boolean;
  includeManualFeatured: boolean;
  updatedAt: string;
}

export interface PublicSupporterLeaderboardRow {
  rank: number;
  id: string;
  displayName: string;
  contributionAmount: number | null;
  amountDisplay: string;
  amountVisible: boolean;
  badge: string;
  featured: boolean;
  tier: 'rank1' | 'top3' | 'standard';
}

export interface PublicSupportersLeaderboardResponse {
  enabled: boolean;
  settings: {
    enabled: boolean;
    maxDisplayed: number;
    showAmountsGlobally: boolean;
    allowAutomaticRanking: boolean;
    allowManualPriority: boolean;
    showBadges: boolean;
    showSubtitle: boolean;
    includeManualFeatured: boolean;
    updatedAt: string;
  };
  entries: PublicSupporterLeaderboardRow[];
  updatedAt: string;
}

export const MAX_CONTRIBUTION_PKR = 500000;
export const MAX_ADMIN_SUPPORTER_AMOUNT_PKR = 5000000;

export const DEFAULT_SUPPORTER_LEADERBOARD_SETTINGS: SupporterLeaderboardSettings = {
  id: 'main',
  enabled: true,
  maxDisplayed: 10,
  showAmountsGlobally: true,
  allowAutomaticRanking: true,
  allowManualPriority: true,
  showBadges: true,
  showSubtitle: true,
  includeManualFeatured: true,
  updatedAt: new Date(0).toISOString(),
};

export const INITIAL_FEATURED_PATRON_TEMPLATES: Array<{
  displayName: string;
  contributionAmount: number;
  badge: string;
  displayPriority: number;
  amountVisible: boolean;
  featured: boolean;
}> = [
  {
    displayName: 'Founding Patron',
    contributionAmount: 5000,
    badge: 'Executive Patron',
    displayPriority: 1,
    amountVisible: true,
    featured: true,
  },
  {
    displayName: 'Series Champion',
    contributionAmount: 2500,
    badge: 'Founding Supporter',
    displayPriority: 2,
    amountVisible: true,
    featured: true,
  },
  {
    displayName: 'Urdu Dubbing Patron',
    contributionAmount: 1500,
    badge: 'Founding Supporter',
    displayPriority: 3,
    amountVisible: true,
    featured: true,
  },
  {
    displayName: 'FEVIQO Backer',
    contributionAmount: 1000,
    badge: 'Community Patron',
    displayPriority: 4,
    amountVisible: true,
    featured: false,
  },
  {
    displayName: 'Anonymous Patron',
    contributionAmount: 500,
    badge: 'Community Patron',
    displayPriority: 5,
    amountVisible: true,
    featured: false,
  },
];

function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonSafe(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function sanitizeLeaderboardDisplayName(raw?: unknown): string {
  const cleaned = String(raw ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  return cleaned || 'Anonymous Patron';
}

export function sanitizeSupporterBadge(raw?: unknown): string {
  return String(raw ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 48);
}

export function normalizeDisplayPriority(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const num = Number(raw);
  if (!Number.isFinite(num)) return null;
  const rounded = Math.round(num);
  if (rounded < 1 || rounded > 999) return null;
  return rounded;
}

/**
 * Strictly sanitized public Firestore payload — ZERO PII, ZERO private order references.
 */
function buildPublicFirestoreEntryPayload(entry: SupporterLeaderboardEntry): Record<string, unknown> {
  return {
    id: entry.id,
    displayName: sanitizeLeaderboardDisplayName(entry.displayName),
    contributionAmount: Math.max(0, Math.round(Number(entry.contributionAmount) || 0)),
    amountVisible: Boolean(entry.amountVisible),
    badge: sanitizeSupporterBadge(entry.badge),
    displayPriority: entry.displayPriority !== null && entry.displayPriority !== undefined ? entry.displayPriority : null,
    entryType: entry.entryType === 'verified_customer' ? 'verified_customer' : 'manual_featured',
    active: Boolean(entry.active),
    featured: Boolean(entry.featured),
    removed: Boolean(entry.removed),
    createdAtIso: entry.createdAt,
    updatedAtIso: entry.updatedAt,
  };
}

function mirrorSupporterEntryServer(entry: SupporterLeaderboardEntry): void {
  if (!isServerFirestoreEnabled()) return;
  void mirrorDocToFirestoreServer(
    'supportersLeaderboard',
    entry.id,
    buildPublicFirestoreEntryPayload(entry)
  );
}

function mirrorSupporterSettingsServer(settings: SupporterLeaderboardSettings): void {
  if (!isServerFirestoreEnabled()) return;
  void mirrorDocToFirestoreServer('supportersLeaderboardSettings', 'main', {
    id: 'main',
    enabled: Boolean(settings.enabled),
    maxDisplayed: Math.max(1, Math.min(50, Math.round(Number(settings.maxDisplayed) || 10))),
    showAmountsGlobally: Boolean(settings.showAmountsGlobally),
    allowAutomaticRanking: Boolean(settings.allowAutomaticRanking),
    allowManualPriority: Boolean(settings.allowManualPriority),
    showBadges: Boolean(settings.showBadges),
    showSubtitle: Boolean(settings.showSubtitle),
    includeManualFeatured: Boolean(settings.includeManualFeatured),
    updatedAtIso: settings.updatedAt,
  });
}

export function readAllSupporterEntries(): SupporterLeaderboardEntry[] {
  const raw = readJsonSafe<SupporterLeaderboardEntry[]>(ENTRIES_FILE, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): SupporterLeaderboardEntry => ({
      id: String(item.id || ''),
      displayName: sanitizeLeaderboardDisplayName(item.displayName),
      contributionAmount: Math.max(0, Math.round(Number(item.contributionAmount) || 0)),
      amountVisible: item.amountVisible !== false,
      badge: sanitizeSupporterBadge(item.badge),
      displayPriority: normalizeDisplayPriority(item.displayPriority),
      entryType: item.entryType === 'verified_customer' ? 'verified_customer' : 'manual_featured',
      active: item.active !== false,
      featured: Boolean(item.featured),
      removed: Boolean(item.removed),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
      sourceOrderId: item.sourceOrderId || undefined,
      updatedByAdminEmail: item.updatedByAdminEmail || undefined,
    }))
    .filter((e) => Boolean(e.id));
}

export function readSupporterLeaderboardSettings(): SupporterLeaderboardSettings {
  const stored = readJsonSafe<Partial<SupporterLeaderboardSettings> | null>(SETTINGS_FILE, null);
  if (!stored || typeof stored !== 'object') {
    return { ...DEFAULT_SUPPORTER_LEADERBOARD_SETTINGS };
  }
  return {
    id: 'main',
    enabled: stored.enabled !== undefined ? Boolean(stored.enabled) : DEFAULT_SUPPORTER_LEADERBOARD_SETTINGS.enabled,
    maxDisplayed: Math.max(
      1,
      Math.min(50, Math.round(Number(stored.maxDisplayed ?? DEFAULT_SUPPORTER_LEADERBOARD_SETTINGS.maxDisplayed) || 10))
    ),
    showAmountsGlobally:
      stored.showAmountsGlobally !== undefined
        ? Boolean(stored.showAmountsGlobally)
        : DEFAULT_SUPPORTER_LEADERBOARD_SETTINGS.showAmountsGlobally,
    allowAutomaticRanking:
      stored.allowAutomaticRanking !== undefined
        ? Boolean(stored.allowAutomaticRanking)
        : DEFAULT_SUPPORTER_LEADERBOARD_SETTINGS.allowAutomaticRanking,
    allowManualPriority:
      stored.allowManualPriority !== undefined
        ? Boolean(stored.allowManualPriority)
        : DEFAULT_SUPPORTER_LEADERBOARD_SETTINGS.allowManualPriority,
    showBadges:
      stored.showBadges !== undefined ? Boolean(stored.showBadges) : DEFAULT_SUPPORTER_LEADERBOARD_SETTINGS.showBadges,
    showSubtitle:
      stored.showSubtitle !== undefined
        ? Boolean(stored.showSubtitle)
        : DEFAULT_SUPPORTER_LEADERBOARD_SETTINGS.showSubtitle,
    includeManualFeatured:
      stored.includeManualFeatured !== undefined
        ? Boolean(stored.includeManualFeatured)
        : DEFAULT_SUPPORTER_LEADERBOARD_SETTINGS.includeManualFeatured,
    updatedAt: typeof stored.updatedAt === 'string' && stored.updatedAt ? stored.updatedAt : DEFAULT_SUPPORTER_LEADERBOARD_SETTINGS.updatedAt,
  };
}

export function computePublicSupportersLeaderboard(
  entries: SupporterLeaderboardEntry[],
  settings: SupporterLeaderboardSettings
): PublicSupportersLeaderboardResponse {
  if (!settings.enabled) {
    return {
      enabled: false,
      settings,
      entries: [],
      updatedAt: settings.updatedAt,
    };
  }

  const eligible = entries.filter((e) => {
    if (!e.active || e.removed) return false;
    if (!settings.includeManualFeatured && e.entryType === 'manual_featured') return false;
    return true;
  });

  const sorted = [...eligible].sort((a, b) => {
    if (settings.allowManualPriority) {
      const aHasPrio = a.displayPriority !== null && a.displayPriority >= 1;
      const bHasPrio = b.displayPriority !== null && b.displayPriority >= 1;
      if (aHasPrio && bHasPrio && a.displayPriority !== b.displayPriority) {
        return (a.displayPriority as number) - (b.displayPriority as number);
      }
      if (aHasPrio && !bHasPrio) return -1;
      if (!aHasPrio && bHasPrio) return 1;
    }

    if (settings.allowAutomaticRanking) {
      if (b.contributionAmount !== a.contributionAmount) {
        return b.contributionAmount - a.contributionAmount;
      }
    }

    if (Number(b.featured) !== Number(a.featured)) {
      return Number(b.featured) - Number(a.featured);
    }

    return (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0);
  });

  const limited = sorted.slice(0, Math.max(1, Math.min(50, settings.maxDisplayed || 10)));

  const publicRows: PublicSupporterLeaderboardRow[] = limited.map((entry, idx) => {
    const rank = idx + 1;
    const tier: 'rank1' | 'top3' | 'standard' = rank === 1 ? 'rank1' : rank <= 3 ? 'top3' : 'standard';
    const showAmt = Boolean(settings.showAmountsGlobally && entry.amountVisible);
    const defaultTierBadge =
      rank === 1 ? 'Executive Patron' : rank <= 3 ? 'Founding Supporter' : 'Community Patron';
    const resolvedBadge = settings.showBadges ? entry.badge || defaultTierBadge : '';

    return {
      rank,
      id: entry.id,
      displayName: sanitizeLeaderboardDisplayName(entry.displayName),
      contributionAmount: showAmt ? entry.contributionAmount : null,
      amountDisplay: showAmt ? `PKR ${entry.contributionAmount.toLocaleString()}` : 'Amount Hidden',
      amountVisible: showAmt,
      badge: resolvedBadge,
      featured: Boolean(entry.featured || rank <= 3),
      tier,
    };
  });

  const latestTs = limited.reduce(
    (latest, e) => (e.updatedAt > latest ? e.updatedAt : latest),
    settings.updatedAt
  );

  return {
    enabled: true,
    settings,
    entries: publicRows,
    updatedAt: latestTs,
  };
}

export function getPublicSupportersLeaderboard(): PublicSupportersLeaderboardResponse {
  const entries = readAllSupporterEntries();
  const settings = readSupporterLeaderboardSettings();
  return computePublicSupportersLeaderboard(entries, settings);
}

export function getAdminSupportersLeaderboardOverview() {
  const entries = readAllSupporterEntries();
  const settings = readSupporterLeaderboardSettings();
  const publicPreview = computePublicSupportersLeaderboard(entries, settings);
  const activeCount = entries.filter((e) => e.active && !e.removed).length;
  const verifiedCustomerEntries = entries.filter((e) => e.entryType === 'verified_customer' && !e.removed);
  const manualFeaturedEntries = entries.filter((e) => e.entryType === 'manual_featured' && !e.removed);
  const totalVerifiedContributionsPkr = verifiedCustomerEntries.reduce(
    (sum, e) => sum + (Number(e.contributionAmount) || 0),
    0
  );

  return {
    entries,
    settings,
    publicPreview,
    stats: {
      totalEntries: entries.length,
      activeCount,
      verifiedCustomerCount: verifiedCustomerEntries.length,
      manualFeaturedCount: manualFeaturedEntries.length,
      removedCount: entries.filter((e) => e.removed).length,
      totalVerifiedContributionsPkr,
    },
  };
}

export function createSupporterEntryByAdmin(params: {
  displayName: string;
  contributionAmount: number;
  amountVisible?: boolean;
  badge?: string;
  displayPriority?: number | null;
  active?: boolean;
  featured?: boolean;
  adminEmail: string;
}):
  | { success: true; entry: SupporterLeaderboardEntry }
  | { success: false; error: string; statusCode: number } {
  const amount = Number(params.contributionAmount);
  if (!Number.isFinite(amount) || amount < 0 || amount > MAX_ADMIN_SUPPORTER_AMOUNT_PKR) {
    return {
      success: false,
      error: `Contribution amount must be between PKR 0 and PKR ${MAX_ADMIN_SUPPORTER_AMOUNT_PKR.toLocaleString()}.`,
      statusCode: 400,
    };
  }
  const cleanName = sanitizeLeaderboardDisplayName(params.displayName);
  const nowIso = new Date().toISOString();
  const entry: SupporterLeaderboardEntry = {
    id: `sup-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    displayName: cleanName,
    contributionAmount: Math.round(amount),
    amountVisible: params.amountVisible !== false,
    badge: sanitizeSupporterBadge(params.badge) || 'Community Patron',
    displayPriority: normalizeDisplayPriority(params.displayPriority),
    entryType: 'manual_featured',
    active: params.active !== false,
    featured: Boolean(params.featured),
    removed: false,
    createdAt: nowIso,
    updatedAt: nowIso,
    updatedByAdminEmail: params.adminEmail,
  };

  const entries = readAllSupporterEntries();
  entries.push(entry);
  writeJsonSafe(ENTRIES_FILE, entries);
  mirrorSupporterEntryServer(entry);
  return { success: true, entry };
}

export function seedInitialFeaturedSupportersByAdmin(adminEmail: string): {
  success: true;
  created: SupporterLeaderboardEntry[];
} {
  const entries = readAllSupporterEntries();
  const nowMs = Date.now();
  const created: SupporterLeaderboardEntry[] = INITIAL_FEATURED_PATRON_TEMPLATES.map((tpl, idx) => {
    const iso = new Date(nowMs + idx).toISOString();
    return {
      id: `sup-feat-${nowMs}-${idx + 1}-${crypto.randomBytes(2).toString('hex')}`,
      displayName: tpl.displayName,
      contributionAmount: tpl.contributionAmount,
      amountVisible: tpl.amountVisible,
      badge: tpl.badge,
      displayPriority: tpl.displayPriority,
      entryType: 'manual_featured',
      active: true,
      featured: tpl.featured,
      removed: false,
      createdAt: iso,
      updatedAt: iso,
      updatedByAdminEmail: adminEmail,
    };
  });

  entries.push(...created);
  writeJsonSafe(ENTRIES_FILE, entries);
  for (const e of created) {
    mirrorSupporterEntryServer(e);
  }
  return { success: true, created };
}

export function updateSupporterEntryByAdmin(params: {
  entryId: string;
  displayName?: string;
  contributionAmount?: number;
  amountVisible?: boolean;
  badge?: string;
  displayPriority?: number | null;
  active?: boolean;
  featured?: boolean;
  removed?: boolean;
  adminEmail: string;
}):
  | { success: true; entry: SupporterLeaderboardEntry }
  | { success: false; error: string; statusCode: number } {
  const entries = readAllSupporterEntries();
  const idx = entries.findIndex((e) => e.id === params.entryId);
  if (idx === -1) {
    return { success: false, error: 'Supporter leaderboard entry not found.', statusCode: 404 };
  }

  const current = entries[idx];
  if (params.contributionAmount !== undefined) {
    const amt = Number(params.contributionAmount);
    if (!Number.isFinite(amt) || amt < 0 || amt > MAX_ADMIN_SUPPORTER_AMOUNT_PKR) {
      return {
        success: false,
        error: `Contribution amount must be between PKR 0 and PKR ${MAX_ADMIN_SUPPORTER_AMOUNT_PKR.toLocaleString()}.`,
        statusCode: 400,
      };
    }
    current.contributionAmount = Math.round(amt);
  }

  if (params.displayName !== undefined) {
    current.displayName = sanitizeLeaderboardDisplayName(params.displayName);
  }
  if (params.amountVisible !== undefined) {
    current.amountVisible = Boolean(params.amountVisible);
  }
  if (params.badge !== undefined) {
    current.badge = sanitizeSupporterBadge(params.badge);
  }
  if (params.displayPriority !== undefined) {
    current.displayPriority = normalizeDisplayPriority(params.displayPriority);
  }
  if (params.active !== undefined) {
    current.active = Boolean(params.active);
  }
  if (params.featured !== undefined) {
    current.featured = Boolean(params.featured);
  }
  if (params.removed !== undefined) {
    current.removed = Boolean(params.removed);
    if (current.removed) {
      current.active = false;
    } else if (params.active === undefined) {
      current.active = true;
    }
  }

  current.updatedAt = new Date().toISOString();
  current.updatedByAdminEmail = params.adminEmail;
  entries[idx] = current;
  writeJsonSafe(ENTRIES_FILE, entries);
  mirrorSupporterEntryServer(current);
  return { success: true, entry: current };
}

export function deleteSupporterEntryByAdmin(entryId: string):
  | { success: true; deletedId: string }
  | { success: false; error: string; statusCode: number } {
  const entries = readAllSupporterEntries();
  const idx = entries.findIndex((e) => e.id === entryId);
  if (idx === -1) {
    return { success: false, error: 'Supporter leaderboard entry not found.', statusCode: 404 };
  }
  const [removed] = entries.splice(idx, 1);
  writeJsonSafe(ENTRIES_FILE, entries);
  if (isServerFirestoreEnabled()) {
    void deleteDocFromFirestoreServer('supportersLeaderboard', removed.id);
  }
  return { success: true, deletedId: removed.id };
}

export function updateSupporterLeaderboardSettingsByAdmin(
  updates: Partial<Omit<SupporterLeaderboardSettings, 'id' | 'updatedAt'>>
): SupporterLeaderboardSettings {
  const current = readSupporterLeaderboardSettings();
  const next: SupporterLeaderboardSettings = {
    id: 'main',
    enabled: updates.enabled !== undefined ? Boolean(updates.enabled) : current.enabled,
    maxDisplayed:
      updates.maxDisplayed !== undefined
        ? Math.max(1, Math.min(50, Math.round(Number(updates.maxDisplayed) || 10)))
        : current.maxDisplayed,
    showAmountsGlobally:
      updates.showAmountsGlobally !== undefined
        ? Boolean(updates.showAmountsGlobally)
        : current.showAmountsGlobally,
    allowAutomaticRanking:
      updates.allowAutomaticRanking !== undefined
        ? Boolean(updates.allowAutomaticRanking)
        : current.allowAutomaticRanking,
    allowManualPriority:
      updates.allowManualPriority !== undefined
        ? Boolean(updates.allowManualPriority)
        : current.allowManualPriority,
    showBadges: updates.showBadges !== undefined ? Boolean(updates.showBadges) : current.showBadges,
    showSubtitle:
      updates.showSubtitle !== undefined ? Boolean(updates.showSubtitle) : current.showSubtitle,
    includeManualFeatured:
      updates.includeManualFeatured !== undefined
        ? Boolean(updates.includeManualFeatured)
        : current.includeManualFeatured,
    updatedAt: new Date().toISOString(),
  };

  writeJsonSafe(SETTINGS_FILE, next);
  mirrorSupporterSettingsServer(next);
  return next;
}

/**
 * Creates a verified_customer supporter leaderboard entry strictly once per approved order.
 * Idempotent by sourceOrderId to guarantee zero duplicate counting.
 */
export function recordVerifiedCustomerSupporterFromOrder(params: {
  orderId: string;
  existingEntryId?: string;
  displayName?: string;
  verifiedContributionPkr: number;
  showExactAmount?: boolean;
  adminEmail: string;
}): SupporterLeaderboardEntry | null {
  const contribution = Math.round(Number(params.verifiedContributionPkr) || 0);
  if (contribution <= 0) return null;

  const entries = readAllSupporterEntries();
  const existing = entries.find(
    (e) =>
      (params.existingEntryId && e.id === params.existingEntryId) ||
      (e.sourceOrderId && e.sourceOrderId === params.orderId)
  );
  if (existing) {
    return existing;
  }

  const nowIso = new Date().toISOString();
  const autoBadge =
    contribution >= 5000
      ? 'Executive Patron'
      : contribution >= 1000
      ? 'Founding Supporter'
      : 'Community Patron';

  const entry: SupporterLeaderboardEntry = {
    id: `sup-ver-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    displayName: sanitizeLeaderboardDisplayName(params.displayName),
    contributionAmount: contribution,
    amountVisible: params.showExactAmount !== false,
    badge: autoBadge,
    displayPriority: null,
    entryType: 'verified_customer',
    active: true,
    featured: contribution >= 5000,
    removed: false,
    createdAt: nowIso,
    updatedAt: nowIso,
    sourceOrderId: params.orderId,
    updatedByAdminEmail: params.adminEmail,
  };

  entries.push(entry);
  writeJsonSafe(ENTRIES_FILE, entries);
  mirrorSupporterEntryServer(entry);
  return entry;
}

export function mergeSupportersCloudSnapshot(payload: {
  supportersLeaderboard?: Array<Partial<SupporterLeaderboardEntry>>;
  supportersLeaderboardSettings?: Partial<SupporterLeaderboardSettings> | null;
}): void {
  if (Array.isArray(payload.supportersLeaderboard) && payload.supportersLeaderboard.length > 0) {
    const existing = readAllSupporterEntries();
    const byId = new Map(existing.map((e) => [e.id, e]));

    for (const inc of payload.supportersLeaderboard) {
      if (!inc?.id) continue;
      const prev = byId.get(inc.id);
      const incUpdated = Date.parse(inc.updatedAt || (inc as any).updatedAtIso || '') || 0;
      const prevUpdated = prev ? Date.parse(prev.updatedAt || '') || 0 : 0;

      if (!prev || incUpdated > prevUpdated) {
        const nowIso = new Date().toISOString();
        const merged: SupporterLeaderboardEntry = {
          id: String(inc.id),
          displayName: sanitizeLeaderboardDisplayName(inc.displayName ?? prev?.displayName),
          contributionAmount: Math.max(
            0,
            Math.round(Number(inc.contributionAmount ?? prev?.contributionAmount ?? 0) || 0)
          ),
          amountVisible: inc.amountVisible !== undefined ? Boolean(inc.amountVisible) : prev?.amountVisible !== false,
          badge: sanitizeSupporterBadge(inc.badge ?? prev?.badge),
          displayPriority:
            inc.displayPriority !== undefined
              ? normalizeDisplayPriority(inc.displayPriority)
              : prev?.displayPriority ?? null,
          entryType:
            (inc.entryType ?? prev?.entryType) === 'verified_customer'
              ? 'verified_customer'
              : 'manual_featured',
          active: inc.active !== undefined ? Boolean(inc.active) : prev?.active !== false,
          featured: inc.featured !== undefined ? Boolean(inc.featured) : Boolean(prev?.featured),
          removed: inc.removed !== undefined ? Boolean(inc.removed) : Boolean(prev?.removed),
          createdAt: inc.createdAt || (inc as any).createdAtIso || prev?.createdAt || nowIso,
          updatedAt: inc.updatedAt || (inc as any).updatedAtIso || nowIso,
          sourceOrderId: prev?.sourceOrderId,
          updatedByAdminEmail: prev?.updatedByAdminEmail,
        };
        byId.set(merged.id, merged);
      }
    }

    writeJsonSafe(ENTRIES_FILE, Array.from(byId.values()));
  }

  if (payload.supportersLeaderboardSettings && typeof payload.supportersLeaderboardSettings === 'object') {
    const current = readSupporterLeaderboardSettings();
    const inc = payload.supportersLeaderboardSettings;
    const incUpdated = Date.parse(inc.updatedAt || (inc as any).updatedAtIso || '') || 0;
    const curUpdated = Date.parse(current.updatedAt || '') || 0;
    if (incUpdated > curUpdated) {
      const merged: SupporterLeaderboardSettings = {
        id: 'main',
        enabled: inc.enabled !== undefined ? Boolean(inc.enabled) : current.enabled,
        maxDisplayed:
          inc.maxDisplayed !== undefined
            ? Math.max(1, Math.min(50, Math.round(Number(inc.maxDisplayed) || 10)))
            : current.maxDisplayed,
        showAmountsGlobally:
          inc.showAmountsGlobally !== undefined
            ? Boolean(inc.showAmountsGlobally)
            : current.showAmountsGlobally,
        allowAutomaticRanking:
          inc.allowAutomaticRanking !== undefined
            ? Boolean(inc.allowAutomaticRanking)
            : current.allowAutomaticRanking,
        allowManualPriority:
          inc.allowManualPriority !== undefined
            ? Boolean(inc.allowManualPriority)
            : current.allowManualPriority,
        showBadges: inc.showBadges !== undefined ? Boolean(inc.showBadges) : current.showBadges,
        showSubtitle: inc.showSubtitle !== undefined ? Boolean(inc.showSubtitle) : current.showSubtitle,
        includeManualFeatured:
          inc.includeManualFeatured !== undefined
            ? Boolean(inc.includeManualFeatured)
            : current.includeManualFeatured,
        updatedAt: inc.updatedAt || (inc as any).updatedAtIso || new Date().toISOString(),
      };
      writeJsonSafe(SETTINGS_FILE, merged);
    }
  }
}

export function syncSupportersDocsToFirestore(): void {
  if (!isServerFirestoreEnabled()) return;
  for (const e of readAllSupporterEntries()) {
    mirrorSupporterEntryServer(e);
  }
  mirrorSupporterSettingsServer(readSupporterLeaderboardSettings());
}

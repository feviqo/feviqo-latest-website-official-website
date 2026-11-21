import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  OneClickEventType,
  OneClickNotificationCategory,
  OneClickNotificationStatus,
  buildWhatsAppWaMeUrl,
  formatWhatsAppRecipient,
  generateOneClickWhatsAppMessage,
  getNotificationCategoryForEvent,
} from '../src/utils/whatsappOneClick';
import { getDramaById } from '../src/data/membershipCatalog';
import {
  mirrorDocToFirestoreServer,
  pullAutomationSnapshotFromFirestoreServer,
} from './firestoreAdmin';
import {
  appendAdminAudit,
  getAutomationMembershipSnapshot,
  getEntitledActiveMembersForDrama,
} from './membershipStore';

const DATA_DIR = path.join(process.cwd(), 'data');
const WA_NOTIFICATIONS_FILE = path.join(DATA_DIR, 'whatsapp_notifications.json');
const WA_QUEUE_SETTINGS_FILE = path.join(DATA_DIR, 'whatsapp_queue_settings.json');
const WA_PREFS_FILE = path.join(DATA_DIR, 'whatsapp_preferences.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface OneClickNotificationActionEntry {
  id: string;
  action:
    | 'created'
    | 'edited'
    | 'phone_updated'
    | 'opened_in_whatsapp'
    | 'confirmed_sent'
    | 'cancelled';
  actor: string;
  details: string;
  createdAt: string;
}

export interface OneClickWhatsAppNotification {
  id: string;
  idempotencyKey: string;
  eventType: OneClickEventType;
  category: OneClickNotificationCategory;
  status: OneClickNotificationStatus;
  customerName: string;
  customerEmail?: string;
  memberId?: string;
  membershipId?: string;
  orderId?: string;
  leadId?: string;
  dramaId?: string;
  episodeSlug?: string;
  planName?: string;
  amountDisplay?: string;
  expiresAt?: string;
  rawPhone: string;
  waDigits: string;
  recipientPhone: string;
  phoneValid: boolean;
  phoneError?: string;
  message: string;
  defaultMessage: string;
  waUrl?: string;
  failureReason?: string;
  cancelReason?: string;
  openedAt?: string;
  openedByAdminEmail?: string;
  openCount: number;
  confirmedSentAt?: string;
  confirmedSentByAdminEmail?: string;
  cancelledAt?: string;
  cancelledByAdminEmail?: string;
  actionLog: OneClickNotificationActionEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface OneClickQueueSettings {
  id: 'queue';
  enabled: boolean;
  categories: Record<OneClickNotificationCategory, boolean>;
  updatedAt: string;
}

interface StoredPrefRecord {
  id: string;
  memberId?: string;
  phoneE164?: string;
  membershipUpdates?: boolean;
  renewalReminders?: boolean;
  newEpisodeAlerts?: boolean;
  promotionalMessages?: boolean;
  leadEnquiryConsent?: boolean;
  optedOut?: boolean;
}

const DEFAULT_QUEUE_SETTINGS: OneClickQueueSettings = {
  id: 'queue',
  enabled: true,
  categories: {
    registration: true,
    payment: true,
    activation: true,
    rejection: true,
    expiry: true,
    episodes: true,
    creative_enquiries: true,
  },
  updatedAt: new Date().toISOString(),
};

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(filePath: string, data: unknown): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[WhatsAppQueueStore] Failed writing ${path.basename(filePath)}:`, err);
  }
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

function findPreferenceForMember(memberId?: string, rawPhone?: string): StoredPrefRecord | null {
  const prefs = readJson<StoredPrefRecord[]>(WA_PREFS_FILE, []);
  if (memberId) {
    const byId = prefs.find((p) => p.memberId === memberId);
    if (byId) return byId;
  }
  const formatted = formatWhatsAppRecipient(rawPhone);
  if (formatted.valid) {
    const byPhone = prefs.find((p) => p.phoneE164 === formatted.e164);
    if (byPhone) return byPhone;
  }
  return null;
}

export function getOneClickQueueSettings(): OneClickQueueSettings {
  const saved = readJson<Partial<OneClickQueueSettings>>(WA_QUEUE_SETTINGS_FILE, {});
  return {
    id: 'queue',
    enabled: typeof saved.enabled === 'boolean' ? saved.enabled : DEFAULT_QUEUE_SETTINGS.enabled,
    categories: {
      ...DEFAULT_QUEUE_SETTINGS.categories,
      ...(saved.categories || {}),
    },
    updatedAt: saved.updatedAt || DEFAULT_QUEUE_SETTINGS.updatedAt,
  };
}

export function saveOneClickQueueSettings(
  updates: Partial<{
    enabled: boolean;
    categories: Partial<Record<OneClickNotificationCategory, boolean>>;
  }>,
  admin?: { id: string; email: string }
): OneClickQueueSettings {
  const current = getOneClickQueueSettings();
  const next: OneClickQueueSettings = {
    id: 'queue',
    enabled: typeof updates.enabled === 'boolean' ? updates.enabled : current.enabled,
    categories: updates.categories
      ? { ...current.categories, ...updates.categories }
      : current.categories,
    updatedAt: new Date().toISOString(),
  };
  writeJson(WA_QUEUE_SETTINGS_FILE, next);
  void mirrorDocToFirestoreServer('whatsappSettings', 'queue', {
    ...next,
    updatedAtIso: next.updatedAt,
  });

  if (admin) {
    appendAdminAudit({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'whatsapp_queue_settings_updated',
      targetId: 'whatsappSettings/queue',
      details: `enabled=${next.enabled}, categories=${JSON.stringify(next.categories)}`,
    });
  }
  return next;
}

function readNotifications(): OneClickWhatsAppNotification[] {
  return readJson<OneClickWhatsAppNotification[]>(WA_NOTIFICATIONS_FILE, []);
}

function saveNotificationRecord(entry: OneClickWhatsAppNotification): void {
  const all = readNotifications();
  const idx = all.findIndex((item) => item.id === entry.id);
  if (idx >= 0) {
    all[idx] = entry;
  } else {
    all.unshift(entry);
  }
  writeJson(WA_NOTIFICATIONS_FILE, all.slice(0, 3000));
  void mirrorDocToFirestoreServer('whatsappNotifications', entry.id, {
    ...entry,
    createdAtIso: entry.createdAt,
    updatedAtIso: entry.updatedAt,
  });
}

export function cancelPendingOneClickNotifications(
  predicate: (item: OneClickWhatsAppNotification) => boolean,
  reason: string,
  actor = 'system'
): number {
  const all = readNotifications();
  const now = new Date().toISOString();
  let cancelledCount = 0;

  for (const item of all) {
    if ((item.status === 'pending' || item.status === 'opened') && predicate(item)) {
      item.status = 'cancelled';
      item.cancelReason = reason;
      item.cancelledAt = now;
      item.cancelledByAdminEmail = actor;
      item.updatedAt = now;
      item.actionLog = [
        {
          id: makeId('waact'),
          action: 'cancelled',
          actor,
          details: reason,
          createdAt: now,
        },
        ...(item.actionLog || []),
      ].slice(0, 30);
      cancelledCount += 1;
      void mirrorDocToFirestoreServer('whatsappNotifications', item.id, {
        ...item,
        createdAtIso: item.createdAt,
        updatedAtIso: item.updatedAt,
      });
    }
  }

  if (cancelledCount > 0) {
    writeJson(WA_NOTIFICATIONS_FILE, all);
  }
  return cancelledCount;
}

export function enqueueOneClickWhatsAppNotification(params: {
  idempotencyKey: string;
  eventType: OneClickEventType;
  customerName: string;
  customerEmail?: string;
  memberId?: string;
  membershipId?: string;
  orderId?: string;
  leadId?: string;
  dramaId?: string;
  episodeSlug?: string;
  rawPhone?: string;
  planName?: string;
  amountDisplay?: string;
  startDate?: string;
  expiryDate?: string;
  rejectionReason?: string;
  seriesName?: string;
  episodeNumber?: string | number;
  episodeLink?: string;
  serviceName?: string;
  explicitLeadConsent?: boolean;
  bypassEpisodeOptInCheck?: boolean;
}): { ok: true; notification: OneClickWhatsAppNotification; deduplicated?: boolean } | { ok: false; skipped: true; reason: string } {
  const category = getNotificationCategoryForEvent(params.eventType);
  const queueSettings = getOneClickQueueSettings();

  if (!queueSettings.enabled || !queueSettings.categories[category]) {
    return {
      ok: false,
      skipped: true,
      reason: `One-click WhatsApp category "${category}" is disabled in settings.`,
    };
  }

  // Respect explicit STOP opt-out & category preferences
  const pref = findPreferenceForMember(params.memberId, params.rawPhone);
  if (pref?.optedOut) {
    return {
      ok: false,
      skipped: true,
      reason: 'Customer has opted out of WhatsApp notifications (STOP).',
    };
  }

  if (
    (params.eventType === 'expiry_reminder_7d' ||
      params.eventType === 'expiry_reminder_3d' ||
      params.eventType === 'expiry_reminder_1d' ||
      params.eventType === 'membership_expired') &&
    pref &&
    pref.renewalReminders === false
  ) {
    return {
      ok: false,
      skipped: true,
      reason: 'Customer disabled renewal/expiry WhatsApp reminders in account preferences.',
    };
  }

  if (params.eventType === 'episode_published' && !params.bypassEpisodeOptInCheck) {
    const episodeConsented = Boolean(pref && !pref.optedOut && pref.newEpisodeAlerts);
    if (!episodeConsented) {
      return {
        ok: false,
        skipped: true,
        reason: 'Customer has not opted in to New Episode WhatsApp Alerts.',
      };
    }
  }

  // Prevent duplicates by idempotencyKey (any non-cancelled item counts as already created)
  const existing = readNotifications().find(
    (item) => item.idempotencyKey === params.idempotencyKey && item.status !== 'cancelled'
  );
  if (existing) {
    return { ok: true, notification: existing, deduplicated: true };
  }

  // Generate actual message from real data (strictly refuses empty rejection reason)
  const msgResult = generateOneClickWhatsAppMessage({
    eventType: params.eventType,
    customerName: params.customerName,
    planName: params.planName,
    amountDisplay: params.amountDisplay,
    startDate: params.startDate,
    expiryDate: params.expiryDate,
    rejectionReason: params.rejectionReason,
    seriesName: params.seriesName,
    episodeNumber: params.episodeNumber,
    episodeLink: params.episodeLink,
    serviceName: params.serviceName,
  });

  if (!msgResult.ok) {
    return { ok: false, skipped: true, reason: msgResult.error };
  }

  const rawPhone = String(params.rawPhone || '').trim();
  const formatted = formatWhatsAppRecipient(rawPhone);
  const waRes = formatted.valid ? buildWhatsAppWaMeUrl(rawPhone, msgResult.message) : null;

  const now = new Date().toISOString();
  const notification: OneClickWhatsAppNotification = {
    id: makeId('waq'),
    idempotencyKey: params.idempotencyKey,
    eventType: params.eventType,
    category,
    status: formatted.valid && waRes?.ok ? 'pending' : 'failed',
    customerName: String(params.customerName || 'Valued Member').trim() || 'Valued Member',
    customerEmail: params.customerEmail,
    memberId: params.memberId,
    membershipId: params.membershipId,
    orderId: params.orderId,
    leadId: params.leadId,
    dramaId: params.dramaId,
    episodeSlug: params.episodeSlug,
    planName: params.planName,
    amountDisplay: params.amountDisplay,
    expiresAt: params.expiryDate,
    rawPhone,
    waDigits: formatted.valid ? formatted.waDigits : '',
    recipientPhone: formatted.valid ? formatted.e164 : rawPhone || 'missing_phone',
    phoneValid: formatted.valid,
    phoneError: formatted.valid ? undefined : formatted.reason,
    message: msgResult.message,
    defaultMessage: msgResult.message,
    waUrl: waRes && waRes.ok ? waRes.url : undefined,
    failureReason: formatted.valid ? undefined : formatted.reason,
    openCount: 0,
    actionLog: [
      {
        id: makeId('waact'),
        action: 'created',
        actor: 'system',
        details: formatted.valid
          ? `Prepared ${params.eventType} notification for ${formatted.e164}.`
          : `Flagged invalid/incomplete phone (${rawPhone || 'empty'}): ${formatted.reason}`,
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  saveNotificationRecord(notification);
  return { ok: true, notification };
}

export function editOneClickNotification(params: {
  id: string;
  message?: string;
  rawPhone?: string;
  admin: { id: string; email: string };
}): { ok: true; notification: OneClickWhatsAppNotification } | { ok: false; statusCode: number; error: string } {
  const all = readNotifications();
  const target = all.find((n) => n.id === params.id);
  if (!target) {
    return { ok: false, statusCode: 404, error: 'WhatsApp notification item not found.' };
  }
  if (target.status === 'cancelled') {
    return { ok: false, statusCode: 400, error: 'Cancelled notifications cannot be edited.' };
  }

  const now = new Date().toISOString();
  const nextMessage =
    typeof params.message === 'string' ? params.message.trim() : target.message;
  if (!nextMessage) {
    return { ok: false, statusCode: 400, error: 'Message text cannot be empty.' };
  }

  const nextRawPhone =
    typeof params.rawPhone === 'string' ? params.rawPhone.trim() : target.rawPhone;
  const formatted = formatWhatsAppRecipient(nextRawPhone);
  const waRes = formatted.valid ? buildWhatsAppWaMeUrl(nextRawPhone, nextMessage) : null;

  const phoneChanged = nextRawPhone !== target.rawPhone;
  const messageChanged = nextMessage !== target.message;

  target.message = nextMessage;
  target.rawPhone = nextRawPhone;
  target.phoneValid = formatted.valid;
  target.waDigits = formatted.valid ? formatted.waDigits : '';
  target.recipientPhone = formatted.valid ? formatted.e164 : nextRawPhone || 'missing_phone';
  target.phoneError = formatted.valid ? undefined : formatted.reason;
  target.failureReason = formatted.valid ? undefined : formatted.reason;
  target.waUrl = waRes && waRes.ok ? waRes.url : undefined;

  if (!formatted.valid) {
    target.status = 'failed';
  } else if (target.status === 'failed') {
    target.status = 'pending';
  }

  target.updatedAt = now;
  const detailsParts: string[] = [];
  if (phoneChanged) {
    detailsParts.push(
      formatted.valid
        ? `Phone updated to ${formatted.e164}`
        : `Phone updated to invalid value (${nextRawPhone})`
    );
  }
  if (messageChanged) {
    detailsParts.push('Message text edited by admin');
  }
  target.actionLog = [
    {
      id: makeId('waact'),
      action: phoneChanged ? 'phone_updated' : 'edited',
      actor: params.admin.email,
      details: detailsParts.join('; ') || 'Notification reviewed',
      createdAt: now,
    },
    ...(target.actionLog || []),
  ].slice(0, 30);

  saveNotificationRecord(target);
  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'whatsapp_notification_edited',
    targetId: target.id,
    details: target.actionLog[0].details,
  });

  return { ok: true, notification: target };
}

export function markOneClickNotificationOpened(params: {
  id: string;
  admin: { id: string; email: string };
}): { ok: true; notification: OneClickWhatsAppNotification; waUrl: string } | { ok: false; statusCode: number; error: string } {
  const all = readNotifications();
  const target = all.find((n) => n.id === params.id);
  if (!target) {
    return { ok: false, statusCode: 404, error: 'WhatsApp notification item not found.' };
  }
  if (target.status === 'cancelled') {
    return { ok: false, statusCode: 400, error: 'This notification was cancelled and cannot be opened.' };
  }

  const waRes = buildWhatsAppWaMeUrl(target.rawPhone || target.recipientPhone, target.message);
  if (!waRes.ok) {
    const errMsg = 'error' in waRes ? waRes.error : 'Invalid WhatsApp phone number.';
    target.status = 'failed';
    target.phoneValid = false;
    target.phoneError = errMsg;
    target.failureReason = errMsg;
    target.updatedAt = new Date().toISOString();
    saveNotificationRecord(target);
    return {
      ok: false,
      statusCode: 400,
      error: `${errMsg} Edit the phone number before opening WhatsApp.`,
    };
  }

  const now = new Date().toISOString();
  target.waDigits = waRes.waDigits;
  target.recipientPhone = waRes.e164;
  target.phoneValid = true;
  target.phoneError = undefined;
  target.failureReason = undefined;
  target.waUrl = waRes.url;

  // CRITICAL: Opening WhatsApp ONLY records "opened", NEVER "confirmed_sent"
  if (target.status === 'pending' || target.status === 'failed') {
    target.status = 'opened';
  }
  target.openedAt = target.openedAt || now;
  target.openedByAdminEmail = params.admin.email;
  target.openCount = (target.openCount || 0) + 1;
  target.updatedAt = now;
  target.actionLog = [
    {
      id: makeId('waact'),
      action: 'opened_in_whatsapp',
      actor: params.admin.email,
      details: `Opened wa.me/${waRes.waDigits} in WhatsApp (open #${target.openCount}; awaiting manual confirmation of send).`,
      createdAt: now,
    },
    ...(target.actionLog || []),
  ].slice(0, 30);

  saveNotificationRecord(target);
  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'whatsapp_notification_opened',
    targetId: target.id,
    details: `Opened in WhatsApp for ${target.customerName} (${waRes.e164})`,
  });

  return { ok: true, notification: target, waUrl: waRes.url };
}

export function markOneClickNotificationConfirmedSent(params: {
  id: string;
  admin: { id: string; email: string };
}): { ok: true; notification: OneClickWhatsAppNotification } | { ok: false; statusCode: number; error: string } {
  const all = readNotifications();
  const target = all.find((n) => n.id === params.id);
  if (!target) {
    return { ok: false, statusCode: 404, error: 'WhatsApp notification item not found.' };
  }
  if (target.status === 'cancelled') {
    return { ok: false, statusCode: 400, error: 'Cancelled notifications cannot be marked as sent.' };
  }
  if (!target.phoneValid || target.status === 'failed') {
    return {
      ok: false,
      statusCode: 400,
      error: 'Fix the invalid phone number before confirming this message as sent.',
    };
  }

  const now = new Date().toISOString();
  target.status = 'confirmed_sent';
  target.confirmedSentAt = now;
  target.confirmedSentByAdminEmail = params.admin.email;
  target.updatedAt = now;
  target.actionLog = [
    {
      id: makeId('waact'),
      action: 'confirmed_sent',
      actor: params.admin.email,
      details: `Admin manually confirmed WhatsApp message was sent to ${target.recipientPhone}.`,
      createdAt: now,
    },
    ...(target.actionLog || []),
  ].slice(0, 30);

  saveNotificationRecord(target);
  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'whatsapp_notification_confirmed_sent',
    targetId: target.id,
    details: `Confirmed sent to ${target.customerName} (${target.recipientPhone})`,
  });

  return { ok: true, notification: target };
}

export function cancelOneClickNotification(params: {
  id: string;
  reason?: string;
  admin: { id: string; email: string };
}): { ok: true; notification: OneClickWhatsAppNotification } | { ok: false; statusCode: number; error: string } {
  const all = readNotifications();
  const target = all.find((n) => n.id === params.id);
  if (!target) {
    return { ok: false, statusCode: 404, error: 'WhatsApp notification item not found.' };
  }
  if (target.status === 'cancelled') {
    return { ok: true, notification: target };
  }

  const now = new Date().toISOString();
  const cleanReason = String(params.reason || 'Cancelled manually by administrator.').trim().slice(0, 300);
  target.status = 'cancelled';
  target.cancelReason = cleanReason;
  target.cancelledAt = now;
  target.cancelledByAdminEmail = params.admin.email;
  target.updatedAt = now;
  target.actionLog = [
    {
      id: makeId('waact'),
      action: 'cancelled',
      actor: params.admin.email,
      details: cleanReason,
      createdAt: now,
    },
    ...(target.actionLog || []),
  ].slice(0, 30);

  saveNotificationRecord(target);
  appendAdminAudit({
    adminId: params.admin.id,
    adminEmail: params.admin.email,
    action: 'whatsapp_notification_cancelled',
    targetId: target.id,
    details: cleanReason,
  });

  return { ok: true, notification: target };
}

export function syncOneClickLifecycleReminders(): {
  checkedMemberships: number;
  queuedCount: number;
  cancelledCount: number;
} {
  const { members, memberships } = getAutomationMembershipSnapshot();
  const memberById = new Map(members.map((m) => [m.id, m]));
  const nowMs = Date.now();
  let queuedCount = 0;
  let cancelledCount = 0;

  // Index active memberships per member to suppress false expiry notices if member has renewed another record
  const activeByMemberId = new Set(
    memberships
      .filter((s) => s.status === 'active' && Date.parse(s.expiresAt) > nowMs)
      .map((s) => s.memberId)
  );

  for (const sub of memberships) {
    const member = memberById.get(sub.memberId);
    const customerName = member?.fullName || sub.customerName || 'Valued Member';
    const customerEmail = member?.email || sub.customerEmail;
    const rawPhone = member?.phone || sub.customerPhone || '';

    if (sub.status === 'cancelled') {
      cancelledCount += cancelPendingOneClickNotifications(
        (n) =>
          n.membershipId === sub.id &&
          (n.eventType.startsWith('expiry_reminder_') || n.eventType === 'membership_expired'),
        'Membership cancelled or revoked',
        'system_scheduler'
      );
      continue;
    }

    const expMs = Date.parse(sub.expiresAt);
    if (Number.isNaN(expMs)) continue;

    // Cancel stale reminder items created for an older expiry timestamp of this membership
    cancelledCount += cancelPendingOneClickNotifications(
      (n) =>
        n.membershipId === sub.id &&
        n.eventType.startsWith('expiry_reminder_') &&
        Boolean(n.expiresAt) &&
        n.expiresAt !== sub.expiresAt,
      'Membership renewed or extended to new expiry date',
      'system_scheduler'
    );

    if (sub.status === 'expired' || (sub.status === 'active' && nowMs >= expMs)) {
      // Cancel pending reminders once expired, and only emit expired notice if within 14 days
      // and member didn't already replace it with another active subscription for the same plan
      cancelledCount += cancelPendingOneClickNotifications(
        (n) => n.membershipId === sub.id && n.eventType.startsWith('expiry_reminder_'),
        'Membership reached expiration timestamp',
        'system_scheduler'
      );

      const ageSinceExpiryDays = (nowMs - expMs) / (24 * 60 * 60 * 1000);
      const hasReplacementActive =
        activeByMemberId.has(sub.memberId) &&
        memberships.some(
          (other) =>
            other.id !== sub.id &&
            other.memberId === sub.memberId &&
            other.status === 'active' &&
            other.planId === sub.planId &&
            Date.parse(other.expiresAt) > nowMs
        );

      if (!hasReplacementActive && ageSinceExpiryDays >= 0 && ageSinceExpiryDays <= 14) {
        const res = enqueueOneClickWhatsAppNotification({
          idempotencyKey: `membership_expired:${sub.id}:${sub.expiresAt}`,
          eventType: 'membership_expired',
          customerName,
          customerEmail,
          memberId: sub.memberId,
          membershipId: sub.id,
          rawPhone,
          planName: sub.planName,
          expiryDate: sub.expiresAt,
        });
        if (res.ok && !res.deduplicated) queuedCount += 1;
      }
      continue;
    }

    // Active and future expiry: evaluate 1d, 3d, 7d windows
    const msLeft = expMs - nowMs;
    const daysLeft = msLeft / (24 * 60 * 60 * 1000);
    const totalPlanDays = Math.max(
      1,
      sub.durationDays || Math.round((expMs - Date.parse(sub.activatedAt)) / 86400000)
    );

    let eventType: OneClickEventType | null = null;
    if (daysLeft <= 1) {
      eventType = 'expiry_reminder_1d';
    } else if (daysLeft <= 3 && totalPlanDays >= 4) {
      eventType = 'expiry_reminder_3d';
    } else if (daysLeft <= 7 && totalPlanDays >= 10) {
      eventType = 'expiry_reminder_7d';
    }

    if (eventType) {
      const res = enqueueOneClickWhatsAppNotification({
        idempotencyKey: `${eventType}:${sub.id}:${sub.expiresAt}`,
        eventType,
        customerName,
        customerEmail,
        memberId: sub.memberId,
        membershipId: sub.id,
        rawPhone,
        planName: sub.planName,
        expiryDate: sub.expiresAt,
      });
      if (res.ok && !res.deduplicated) queuedCount += 1;
    }
  }

  return {
    checkedMemberships: memberships.length,
    queuedCount,
    cancelledCount,
  };
}

export function queueEpisodePublishedOneClickNotifications(params: {
  dramaId: string;
  episodeSlug: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  episodeUrl?: string;
  forceResend?: boolean;
}): {
  ok: true;
  dramaTitle: string;
  entitledCount: number;
  queuedCount: number;
  failedPhoneCount: number;
  skippedNoConsentCount: number;
  duplicateCount: number;
  notifications: OneClickWhatsAppNotification[];
} | { ok: false; error: string } {
  const drama = getDramaById(params.dramaId);
  if (!drama) {
    return { ok: false, error: `Unknown drama ID: ${params.dramaId}` };
  }

  const cleanSlug = String(params.episodeSlug || `episode-${params.episodeNumber}`).trim();
  const episodeLink =
    params.episodeUrl || `https://feviqo.com${drama.hubPath.replace(/\/+$/, '')}/${cleanSlug}`;
  const entitled = getEntitledActiveMembersForDrama(drama.id);
  const resendTag = params.forceResend ? `:resend:${Date.now()}` : '';

  let queuedCount = 0;
  let failedPhoneCount = 0;
  let skippedNoConsentCount = 0;
  let duplicateCount = 0;
  const queuedItems: OneClickWhatsAppNotification[] = [];

  for (const { member } of entitled) {
    const res = enqueueOneClickWhatsAppNotification({
      idempotencyKey: `episode_published:${drama.id}:${cleanSlug}:${member.id}${resendTag}`,
      eventType: 'episode_published',
      customerName: member.fullName,
      customerEmail: member.email,
      memberId: member.id,
      dramaId: drama.id,
      episodeSlug: cleanSlug,
      rawPhone: member.phone,
      seriesName: drama.title,
      episodeNumber: params.episodeNumber,
      episodeLink,
    });

    if (!res.ok) {
      skippedNoConsentCount += 1;
    } else if (res.deduplicated) {
      duplicateCount += 1;
    } else {
      queuedItems.push(res.notification);
      if (res.notification.status === 'failed') {
        failedPhoneCount += 1;
      } else {
        queuedCount += 1;
      }
    }
  }

  return {
    ok: true,
    dramaTitle: drama.title,
    entitledCount: entitled.length,
    queuedCount,
    failedPhoneCount,
    skippedNoConsentCount,
    duplicateCount,
    notifications: queuedItems,
  };
}

export function getOneClickNotificationsDashboard(filters?: {
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
}) {
  const all = readNotifications();
  const queueSettings = getOneClickQueueSettings();

  const stats = {
    total: all.length,
    pending: all.filter((n) => n.status === 'pending').length,
    opened: all.filter((n) => n.status === 'opened').length,
    confirmedSent: all.filter((n) => n.status === 'confirmed_sent').length,
    failed: all.filter((n) => n.status === 'failed').length,
    cancelled: all.filter((n) => n.status === 'cancelled').length,
    invalidPhones: all.filter((n) => !n.phoneValid && n.status !== 'cancelled').length,
  };

  const categoryCounts: Record<OneClickNotificationCategory, number> = {
    registration: all.filter((n) => n.category === 'registration').length,
    payment: all.filter((n) => n.category === 'payment').length,
    activation: all.filter((n) => n.category === 'activation').length,
    rejection: all.filter((n) => n.category === 'rejection').length,
    expiry: all.filter((n) => n.category === 'expiry').length,
    episodes: all.filter((n) => n.category === 'episodes').length,
    creative_enquiries: all.filter((n) => n.category === 'creative_enquiries').length,
  };

  let filtered = all;
  if (filters?.category && filters.category !== 'all') {
    filtered = filtered.filter((n) => n.category === filters.category);
  }
  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter((n) => n.status === filters.status);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    filtered = filtered.filter((n) =>
      `${n.customerName} ${n.customerEmail || ''} ${n.recipientPhone} ${n.rawPhone} ${n.planName || ''} ${n.eventType} ${n.message}`
        .toLowerCase()
        .includes(q)
    );
  }

  // Real upcoming expiry list from active memberships (next 7 days)
  const { memberships, orders } = getAutomationMembershipSnapshot();
  const nowMs = Date.now();
  const upcomingExpiries = memberships
    .filter((s) => s.status === 'active')
    .map((s) => ({
      membershipId: s.id,
      memberId: s.memberId,
      customerName: s.customerName,
      customerPhone: s.customerPhone || '',
      planName: s.planName,
      expiresAt: s.expiresAt,
      daysLeft: Math.ceil((Date.parse(s.expiresAt) - nowMs) / (24 * 60 * 60 * 1000)),
    }))
    .filter((item) => !Number.isNaN(item.daysLeft) && item.daysLeft >= 0 && item.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 12);

  const recentPayments = orders
    .filter((o) => o.status === 'pending_verification' || o.status === 'awaiting_payment')
    .slice(0, 8)
    .map((o) => ({
      orderId: o.id,
      customerName: o.customerName,
      planName: o.planName,
      status: o.status,
      amountDisplay:
        o.currency === 'USD'
          ? `$${Number(o.amountUsd ?? o.expectedAmount ?? 0).toFixed(2)} USD`
          : `PKR ${Number(o.amountPkr || 0).toLocaleString()}`,
      createdAt: o.createdAt,
    }));

  const limit = Math.max(1, Math.min(Number(filters?.limit) || 250, 1000));

  return {
    settings: queueSettings,
    stats,
    categoryCounts,
    notifications: filtered.slice(0, limit),
    upcomingExpiries,
    recentPayments,
  };
}

export async function hydrateOneClickQueueFromFirestore(): Promise<void> {
  try {
    const snap = await pullAutomationSnapshotFromFirestoreServer();
    if (!snap) return;

    if (snap.queueSettings) {
      const current = getOneClickQueueSettings();
      const remoteUpdated = Date.parse(
        snap.queueSettings.updatedAtIso || snap.queueSettings.updatedAt || ''
      );
      const localUpdated = Date.parse(current.updatedAt || '');
      if (!Number.isNaN(remoteUpdated) && (Number.isNaN(localUpdated) || remoteUpdated > localUpdated)) {
        writeJson(WA_QUEUE_SETTINGS_FILE, { ...current, ...snap.queueSettings });
      }
    }

    if (Array.isArray(snap.oneClickNotifications) && snap.oneClickNotifications.length > 0) {
      const local = readNotifications();
      const map = new Map(local.map((x) => [x.id, x]));
      for (const item of snap.oneClickNotifications) {
        const existing = map.get(item.id);
        if (!existing || Date.parse(item.updatedAt || '') > Date.parse(existing.updatedAt || '')) {
          map.set(item.id, item as OneClickWhatsAppNotification);
        }
      }
      writeJson(
        WA_NOTIFICATIONS_FILE,
        Array.from(map.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      );
    }
  } catch (err) {
    console.warn('[WhatsAppQueueStore] Firestore hydration skipped:', (err as Error)?.message || err);
  }
}

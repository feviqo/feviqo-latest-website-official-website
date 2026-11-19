import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import type {
  SafeMember,
  BlockedUserRecord,
  MembershipOrder,
  AdminMembershipRecord,
  MembershipRecord,
  MembershipHistoryEntry,
  MembershipConfig,
  AdminAuditEntry,
  AdminEmailNotification,
  CustomerNotification,
  SchedulerRunLog,
} from './membershipService';

const BOOTSTRAP_ADMIN_EMAILS = new Set(['rexanmedia01@gmail.com', 'partner@feviqo.com']);

export function isFirebaseAdminUser(): boolean {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || !user.email) return false;
  return BOOTSTRAP_ADMIN_EMAILS.has(user.email.trim().toLowerCase());
}

export function isFirebaseSignedInVerified(): boolean {
  return Boolean(auth.currentUser && auth.currentUser.emailVerified);
}

/**
 * Compresses an uploaded screenshot image into a crisp data URL strictly under 650 KB
 * so it persists cleanly inside Firestore (< 1 MB document limit) across container restarts.
 */
export async function compressProofImageToDataUrl(file: File, maxDataUrlLength = 650000): Promise<string> {
  if (typeof window === 'undefined' || !file) return '';

  const readAsDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(blob);
    });

  if (file.size <= 450 * 1024) {
    const raw = await readAsDataUrl(file);
    if (raw.length <= maxDataUrlLength) return raw;
  }

  return new Promise<string>((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const maxDim = 1280;
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 800;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.max(1, Math.round(width * scale));
          height = Math.max(1, Math.round(height * scale));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve('');
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.82;
        let result = canvas.toDataURL('image/webp', quality);
        if (!result.startsWith('data:image/webp')) {
          result = canvas.toDataURL('image/jpeg', quality);
        }
        while (result.length > maxDataUrlLength && quality > 0.35) {
          quality -= 0.12;
          result = canvas.toDataURL('image/jpeg', quality);
        }
        URL.revokeObjectURL(objectUrl);
        resolve(result.length <= maxDataUrlLength ? result : '');
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve('');
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve('');
    };
    img.src = objectUrl;
  });
}

const DEFAULT_VIP_DRAMA_IDS = ['teskilat', 'mehmed-fetihler-sultani', 'gunesin-dogdugu-yer'];

function clampStr(val: unknown, maxLen: number): string {
  return String(val ?? '').slice(0, maxLen);
}

function clampNonEmpty(val: unknown, fallback: string, maxLen: number): string {
  const cleaned = String(val ?? '').trim();
  return (cleaned.length > 0 ? cleaned : fallback).slice(0, maxLen);
}

function clampEmail(val: unknown, fallback = 'member@feviqo.com'): string {
  const cleaned = String(val ?? '').trim().toLowerCase();
  if (cleaned.length >= 5 && cleaned.includes('@')) return cleaned.slice(0, 200);
  return fallback;
}

function ensureValidDramaIds(ids: unknown, planId?: string): string[] {
  const raw = Array.isArray(ids)
    ? ids
        .map((x) => String(x || '').trim().slice(0, 64))
        .filter((x) => x.length > 0)
    : [];
  const unique = Array.from(new Set(raw));
  if (planId === 'vip') {
    const merged = Array.from(new Set([...DEFAULT_VIP_DRAMA_IDS, ...unique]));
    return merged.slice(0, 20);
  }
  return unique.length > 0 ? unique.slice(0, 20) : ['teskilat'];
}

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (value && typeof value === 'object' && !(value instanceof Timestamp) && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return value;
}

function sanitizeId(raw: string): string {
  const cleaned = String(raw || '').replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);
  return cleaned || `id-${Date.now()}`;
}

function toIsoString(val: unknown, fallbackIso: string): string {
  if (typeof val === 'string' && val.length >= 10) return val;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (val && typeof (val as any).toDate === 'function') {
    return (val as any).toDate().toISOString();
  }
  return fallbackIso;
}

export async function ensureAdminProfileInFirestore(): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || !user.email) return;
  if (!isFirebaseAdminUser()) return;

  const path = `admins/${user.uid}`;
  try {
    const ref = doc(db, 'admins', sanitizeId(user.uid));
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: sanitizeId(user.uid),
        email: clampStr(user.email.toLowerCase(), 200),
        name: clampStr(user.displayName || 'FEVIQO Administrator', 120),
        role: 'admin',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncMemberAccountToFirestore(member: SafeMember, ownerUidOverride?: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const ownerUid = sanitizeId(ownerUidOverride || user.uid);
  const memberId = sanitizeId(member.id);
  const path = `members/${memberId}`;

  try {
    const ref = doc(db, 'members', memberId);
    const snap = await getDoc(ref);
    const safeFullName = clampNonEmpty(member.fullName, 'FEVIQO Member', 120);
    const safeEmail = clampEmail(member.email);
    const safeCreatedAtIso = clampNonEmpty(member.createdAt, new Date().toISOString(), 64);

    if (!snap.exists()) {
      await setDoc(ref, {
        id: memberId,
        ownerUid,
        email: safeEmail,
        fullName: safeFullName,
        phone: clampStr(member.phone || '', 32),
        referralCode: clampStr(member.referralCode || '', 32),
        referredByMemberId: clampStr(member.referredByMemberId || '', 128),
        referredByCode: clampStr(member.referredByCode || '', 32),
        creditBalancePkr: Math.max(0, Number(member.creditBalancePkr) || 0),
        creditBalanceUsd: Math.max(0, Number(member.creditBalanceUsd) || 0),
        createdAtIso: safeCreatedAtIso,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else if (isFirebaseAdminUser()) {
      await updateDoc(ref, {
        fullName: safeFullName,
        phone: clampStr(member.phone || '', 32),
        referralCode: clampStr(member.referralCode || '', 32),
        referredByMemberId: clampStr(member.referredByMemberId || '', 128),
        referredByCode: clampStr(member.referredByCode || '', 32),
        creditBalancePkr: Math.max(0, Number(member.creditBalancePkr) || 0),
        creditBalanceUsd: Math.max(0, Number(member.creditBalanceUsd) || 0),
        updatedAt: serverTimestamp(),
      });
    } else if (snap.data()?.ownerUid === user.uid) {
      await updateDoc(ref, {
        fullName: safeFullName,
        phone: clampStr(member.phone || '', 32),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncOrderToFirestore(
  order: MembershipOrder,
  options?: { member?: SafeMember; ownerUidOverride?: string; proofDataUrl?: string }
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;

  if (options?.member) {
    await syncMemberAccountToFirestore(options.member, options.ownerUidOverride);
  }

  const ownerUid = sanitizeId(options?.ownerUidOverride || order.ownerUid || user.uid);
  const orderId = sanitizeId(order.id);
  const path = `membershipOrders/${orderId}`;

  try {
    const ref = doc(db, 'membershipOrders', orderId);
    const snap = await getDoc(ref);
    const proofUrl = options?.proofDataUrl ?? order.proofDataUrl;

    if (!snap.exists()) {
      const isNonAdminDirectProof = !isFirebaseAdminUser() && order.status !== 'awaiting_payment';
      const initialStatus = isNonAdminDirectProof ? 'awaiting_payment' : order.status;
      const safeDramaIds = ensureValidDramaIds(order.selectedDramaIds, order.planId);
      const safePaymentMethod =
        order.paymentMethod === 'binance_qr'
          ? 'binance_qr'
          : order.paymentMethod === 'admin_assigned'
            ? 'admin_assigned'
            : (order.paymentMethod as string) === 'free'
              ? 'free'
              : 'bank_qr';
      const payload: Record<string, unknown> = {
        id: orderId,
        memberId: sanitizeId(order.memberId),
        ownerUid,
        customerName: clampNonEmpty(order.customerName || options?.member?.fullName, 'FEVIQO Member', 120),
        customerEmail: clampEmail(order.customerEmail || options?.member?.email || user.email),
        customerPhone: clampStr(order.customerPhone || options?.member?.phone || '', 32),
        orderType: order.orderType === 'renewal' ? 'renewal' : 'new',
        targetMembershipId: clampStr(order.targetMembershipId || '', 128),
        planId: order.planId,
        planName: clampNonEmpty(order.planName, order.planId, 64),
        originalAmountPkr: Math.max(0, Number(order.originalAmountPkr ?? order.amountPkr) || 0),
        originalAmountUsd: Math.max(0, Number(order.originalAmountUsd ?? order.amountUsd ?? 0) || 0),
        amountPkr: Math.max(0, Number(order.amountPkr) || 0),
        amountUsd: Math.max(0, Number(order.amountUsd) || 0),
        promoCodeId: clampStr(order.promoCodeId || '', 128),
        promoCode: clampStr(order.promoCode || '', 40),
        promoDiscountPkr: Math.max(0, Number(order.promoDiscountPkr) || 0),
        promoDiscountUsd: Math.max(0, Number(order.promoDiscountUsd) || 0),
        referralCodeUsed: clampStr(order.referralCodeUsed || '', 32),
        referralDiscountPkr: Math.max(0, Number(order.referralDiscountPkr) || 0),
        referralDiscountUsd: Math.max(0, Number(order.referralDiscountUsd) || 0),
        creditsUsedPkr: Math.max(0, Number(order.creditsUsedPkr) || 0),
        creditsUsedUsd: Math.max(0, Number(order.creditsUsedUsd) || 0),
        discountTotalPkr: Math.max(0, Number(order.discountTotalPkr) || 0),
        discountTotalUsd: Math.max(0, Number(order.discountTotalUsd) || 0),
        expectedAmount: Math.max(0, Number(order.expectedAmount ?? (order.currency === 'USD' ? order.amountUsd : order.amountPkr)) || 0),
        currency: order.currency === 'USD' ? 'USD' : 'PKR',
        paymentRegion: order.paymentRegion === 'international' ? 'international' : 'pakistan',
        paymentMethod: safePaymentMethod,
        visitorCountryCode: clampStr(order.visitorCountryCode || '', 12),
        indicativeLocalDisplay: clampStr(order.indicativeLocalDisplay || '', 64),
        durationDays: Math.max(1, Math.min(3650, Number(order.durationDays) || 15)),
        selectedDramaIds: safeDramaIds,
        status: initialStatus,
        provider: clampNonEmpty(order.provider, 'bank_qr', 40),
        qrImageUrl: clampStr(order.qrImageUrl || '', 512),
        proofFileName: isNonAdminDirectProof ? '' : clampStr(order.proofFileName || '', 256),
        proofOriginalName: isNonAdminDirectProof ? '' : clampStr(order.proofOriginalName || '', 256),
        proofMimeType: isNonAdminDirectProof ? '' : clampStr(order.proofMimeType || '', 64),
        proofDataUrl: isNonAdminDirectProof ? '' : proofUrl && proofUrl.length <= 800000 ? proofUrl : '',
        proofSubmittedAt: isNonAdminDirectProof ? '' : clampStr(order.proofSubmittedAt || '', 64),
        paymentNote: isNonAdminDirectProof ? '' : clampStr(order.paymentNote || '', 500),
        rejectionReason: clampStr(order.rejectionReason || '', 500),
        reviewedByAdminId: clampStr(order.reviewedByAdminId || '', 128),
        reviewedByAdminEmail: clampStr(order.reviewedByAdminEmail || '', 200),
        reviewedAt: clampStr(order.reviewedAt || '', 64),
        paidAt: clampStr(order.paidAt || '', 64),
        createdAtIso: clampNonEmpty(order.createdAt, new Date().toISOString(), 64),
        updatedAtIso: clampNonEmpty(order.updatedAt, new Date().toISOString(), 64),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, payload);
      if (isNonAdminDirectProof) {
        await updateDoc(ref, {
          status: 'pending_verification',
          proofFileName: clampStr(order.proofFileName || '', 256),
          proofOriginalName: clampStr(order.proofOriginalName || '', 256),
          proofMimeType: clampStr(order.proofMimeType || '', 64),
          proofDataUrl: proofUrl && proofUrl.length <= 800000 ? proofUrl : '',
          proofSubmittedAt: clampStr(order.proofSubmittedAt || new Date().toISOString(), 64),
          paymentNote: clampStr(order.paymentNote || '', 500),
          rejectionReason: '',
          updatedAtIso: clampStr(order.updatedAt || new Date().toISOString(), 64),
          updatedAt: serverTimestamp(),
        });
      }
    } else if (isFirebaseAdminUser()) {
      const updatePayload: Record<string, unknown> = {
        status: order.status,
        proofFileName: clampStr(order.proofFileName || snap.data()?.proofFileName || '', 256),
        proofOriginalName: clampStr(order.proofOriginalName || snap.data()?.proofOriginalName || '', 256),
        proofMimeType: clampStr(order.proofMimeType || snap.data()?.proofMimeType || '', 64),
        proofSubmittedAt: clampStr(order.proofSubmittedAt || snap.data()?.proofSubmittedAt || '', 64),
        paymentNote: clampStr(order.paymentNote || snap.data()?.paymentNote || '', 500),
        rejectionReason: clampStr(order.rejectionReason || '', 500),
        reviewedByAdminId: clampStr(order.reviewedByAdminId || '', 128),
        reviewedByAdminEmail: clampStr(order.reviewedByAdminEmail || '', 200),
        reviewedAt: clampStr(order.reviewedAt || '', 64),
        paidAt: clampStr(order.paidAt || '', 64),
        updatedAtIso: clampStr(order.updatedAt || new Date().toISOString(), 64),
        updatedAt: serverTimestamp(),
      };
      if (proofUrl && proofUrl.length <= 800000) {
        updatePayload.proofDataUrl = proofUrl;
      }
      await updateDoc(ref, updatePayload);
    } else {
      await updateDoc(ref, {
        status: 'pending_verification',
        proofFileName: clampStr(order.proofFileName || '', 256),
        proofOriginalName: clampStr(order.proofOriginalName || '', 256),
        proofMimeType: clampStr(order.proofMimeType || '', 64),
        proofDataUrl: proofUrl && proofUrl.length <= 800000 ? proofUrl : '',
        proofSubmittedAt: clampStr(order.proofSubmittedAt || new Date().toISOString(), 64),
        paymentNote: clampStr(order.paymentNote || '', 500),
        rejectionReason: '',
        updatedAtIso: clampStr(order.updatedAt || new Date().toISOString(), 64),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncMembershipToFirestore(
  membership: MembershipRecord & { customerName?: string; customerEmail?: string; customerPhone?: string; ownerUid?: string },
  ownerUidOverride?: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || !isFirebaseAdminUser()) return;

  const membershipId = sanitizeId(membership.id);
  const path = `memberships/${membershipId}`;
  const ownerUid = sanitizeId(ownerUidOverride || membership.ownerUid || 'admin_assigned');

  try {
    const ref = doc(db, 'memberships', membershipId);
    const snap = await getDoc(ref);
    const nowIso = new Date().toISOString();
    const safeDramaIds = ensureValidDramaIds(membership.selectedDramaIds, membership.planId);
    const safeRenewalHistory = Array.isArray(membership.renewalHistory)
      ? stripUndefinedDeep(membership.renewalHistory.slice(0, 100))
      : [];
    const safePaymentMethod =
      membership.paymentMethod === 'binance_qr'
        ? 'binance_qr'
        : membership.paymentMethod === 'admin_assigned'
          ? 'admin_assigned'
          : (membership.paymentMethod as string) === 'free'
            ? 'free'
            : 'bank_qr';
    const safeStatus =
      membership.status === 'cancelled' || membership.status === 'expired'
        ? membership.status
        : 'active';

    if (!snap.exists()) {
      await setDoc(ref, {
        id: membershipId,
        memberId: sanitizeId(membership.memberId),
        ownerUid,
        orderId: sanitizeId(membership.orderId || membershipId),
        customerName: clampNonEmpty(membership.customerName, 'FEVIQO Member', 120),
        customerEmail: clampEmail(membership.customerEmail),
        customerPhone: clampStr(membership.customerPhone || '', 32),
        planId: membership.planId,
        planName: clampNonEmpty(membership.planName, membership.planId, 64),
        pricePkr: Math.max(0, Number(membership.pricePkr) || 0),
        priceUsd: Math.max(0, Number(membership.priceUsd) || 0),
        originalAmountPkr: Math.max(0, Number(membership.originalAmountPkr ?? membership.pricePkr) || 0),
        originalAmountUsd: Math.max(0, Number(membership.originalAmountUsd ?? membership.priceUsd) || 0),
        promoCode: clampStr(membership.promoCode || '', 40),
        promoDiscountPkr: Math.max(0, Number(membership.promoDiscountPkr) || 0),
        promoDiscountUsd: Math.max(0, Number(membership.promoDiscountUsd) || 0),
        referralDiscountPkr: Math.max(0, Number(membership.referralDiscountPkr) || 0),
        referralDiscountUsd: Math.max(0, Number(membership.referralDiscountUsd) || 0),
        creditsUsedPkr: Math.max(0, Number(membership.creditsUsedPkr) || 0),
        creditsUsedUsd: Math.max(0, Number(membership.creditsUsedUsd) || 0),
        discountTotalPkr: Math.max(0, Number(membership.discountTotalPkr) || 0),
        discountTotalUsd: Math.max(0, Number(membership.discountTotalUsd) || 0),
        durationDays: Math.max(1, Math.min(3650, Number(membership.durationDays) || 15)),
        selectedDramaIds: safeDramaIds,
        status: safeStatus,
        activatedAt: clampNonEmpty(membership.activatedAt, nowIso, 64),
        expiresAt: clampNonEmpty(membership.expiresAt, nowIso, 64),
        cancelledAt: clampStr(membership.cancelledAt || '', 64),
        revokedByAdminEmail: clampStr(membership.revokedByAdminEmail || '', 200),
        revokedReason: clampStr(membership.revokedReason || '', 500),
        approvedByAdminEmail: clampStr(membership.approvedByAdminEmail || '', 200),
        paymentProvider: clampNonEmpty(membership.paymentProvider, 'bank_qr', 40),
        paymentRegion: membership.paymentRegion === 'international' ? 'international' : 'pakistan',
        paymentMethod: safePaymentMethod,
        currency: membership.currency === 'USD' ? 'USD' : 'PKR',
        expectedAmount: Math.max(0, Number(membership.expectedAmount ?? membership.pricePkr ?? 0) || 0),
        paymentReference: clampStr(membership.paymentReference || '', 400),
        renewalHistory: safeRenewalHistory,
        lastExtendedAt: clampStr(membership.lastExtendedAt || '', 64),
        createdAtIso: clampNonEmpty(membership.createdAt, nowIso, 64),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        orderId: sanitizeId(membership.orderId || snap.data()?.orderId || membershipId),
        customerName: clampNonEmpty(membership.customerName || snap.data()?.customerName, 'FEVIQO Member', 120),
        customerEmail: clampEmail(membership.customerEmail || snap.data()?.customerEmail),
        customerPhone: clampStr(membership.customerPhone || snap.data()?.customerPhone || '', 32),
        planId: membership.planId,
        planName: clampNonEmpty(membership.planName, membership.planId, 64),
        pricePkr: Math.max(0, Number(membership.pricePkr) || 0),
        priceUsd: Math.max(0, Number(membership.priceUsd) || 0),
        durationDays: Math.max(1, Math.min(3650, Number(membership.durationDays) || 15)),
        selectedDramaIds: safeDramaIds,
        status: safeStatus,
        activatedAt: clampNonEmpty(membership.activatedAt, nowIso, 64),
        expiresAt: clampNonEmpty(membership.expiresAt, nowIso, 64),
        cancelledAt: clampStr(membership.cancelledAt || '', 64),
        revokedByAdminEmail: clampStr(membership.revokedByAdminEmail || '', 200),
        revokedReason: clampStr(membership.revokedReason || '', 500),
        approvedByAdminEmail: clampStr(membership.approvedByAdminEmail || snap.data()?.approvedByAdminEmail || '', 200),
        paymentProvider: clampNonEmpty(membership.paymentProvider || snap.data()?.paymentProvider, 'bank_qr', 40),
        paymentRegion: membership.paymentRegion === 'international' ? 'international' : 'pakistan',
        paymentMethod: safePaymentMethod,
        currency: membership.currency === 'USD' ? 'USD' : 'PKR',
        expectedAmount: Math.max(0, Number(membership.expectedAmount ?? membership.pricePkr ?? 0) || 0),
        paymentReference: clampStr(membership.paymentReference || snap.data()?.paymentReference || '', 400),
        renewalHistory: safeRenewalHistory,
        lastExtendedAt: clampStr(membership.lastExtendedAt || '', 64),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function cancelMembershipInFirestore(membershipId: string, cancelledAtIso: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const id = sanitizeId(membershipId);
  const path = `memberships/${id}`;
  try {
    const ref = doc(db, 'memberships', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, {
        status: 'cancelled',
        cancelledAt: clampStr(cancelledAtIso, 64),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function syncHistoryEntryToFirestore(
  entry: MembershipHistoryEntry,
  ownerUidOverride?: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const id = sanitizeId(entry.id);
  const path = `membershipHistory/${id}`;
  try {
    const ref = doc(db, 'membershipHistory', id);
    const snap = await getDoc(ref);
    if (snap.exists()) return;
    await setDoc(ref, {
      id,
      memberId: sanitizeId(entry.memberId),
      ownerUid: sanitizeId(ownerUidOverride || user.uid),
      membershipId: clampStr(entry.membershipId || '', 128),
      orderId: clampStr(entry.orderId || '', 128),
      event: clampStr(entry.event, 64),
      planId: clampStr(entry.planId || '', 32),
      planName: clampStr(entry.planName || '', 64),
      amountPkr: typeof entry.amountPkr === 'number' ? entry.amountPkr : 0,
      amountUsd: typeof entry.amountUsd === 'number' ? entry.amountUsd : 0,
      currency: entry.currency === 'USD' ? 'USD' : 'PKR',
      selectedDramaIds:
        entry.selectedDramaIds && entry.selectedDramaIds.length > 0
          ? entry.selectedDramaIds.slice(0, 10)
          : ['teskilat'],
      details: clampStr(entry.details, 1000),
      createdAtIso: clampStr(entry.createdAt || new Date().toISOString(), 64),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function syncMemberNotificationToFirestore(
  notif: CustomerNotification,
  ownerUidOverride?: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || !isFirebaseAdminUser()) return;
  const id = sanitizeId(notif.id);
  const path = `memberNotifications/${id}`;
  try {
    const ref = doc(db, 'memberNotifications', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        id,
        memberId: sanitizeId(notif.memberId),
        ownerUid: sanitizeId(ownerUidOverride || notif.ownerUid || 'admin_assigned'),
        customerEmail: clampStr(notif.customerEmail || '', 200),
        membershipId: clampStr(notif.membershipId || '', 128),
        orderId: clampStr(notif.orderId || '', 128),
        planId: clampStr(notif.planId || '', 32),
        dramaIds: (notif.dramaIds || []).slice(0, 10),
        type: clampStr(notif.type, 64),
        title: clampStr(notif.title, 240),
        titleUr: clampStr(notif.titleUr || '', 240),
        message: clampStr(notif.message, 1200),
        messageUr: clampStr(notif.messageUr || '', 1200),
        ctaLabel: clampStr(notif.ctaLabel || '', 100),
        ctaHref: clampStr(notif.ctaHref || '', 240),
        dedupeKey: clampStr(notif.dedupeKey, 240),
        emailStatus: notif.emailStatus || 'not_sent',
        emailError: clampStr(notif.emailError || '', 500),
        isRead: Boolean(notif.isRead),
        readAt: clampStr(notif.readAt || '', 64),
        supersededAt: clampStr(notif.supersededAt || '', 64),
        createdAtIso: clampStr(notif.createdAt || new Date().toISOString(), 64),
        updatedAtIso: clampStr(new Date().toISOString(), 64),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        emailStatus: notif.emailStatus || 'not_sent',
        emailError: clampStr(notif.emailError || '', 500),
        isRead: Boolean(notif.isRead),
        readAt: clampStr(notif.readAt || '', 64),
        supersededAt: clampStr(notif.supersededAt || '', 64),
        updatedAtIso: clampStr(new Date().toISOString(), 64),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

async function deleteFirestoreDocSafely(collectionName: string, docId: string): Promise<void> {
  if (!docId || !isFirebaseAdminUser()) return;
  const cleanId = sanitizeId(docId);
  const path = `${collectionName}/${cleanId}`;
  try {
    await deleteDoc(doc(db, collectionName, cleanId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function deleteOrderInFirestore(
  orderId: string,
  notificationIds: string[] = []
): Promise<void> {
  if (!isFirebaseAdminUser()) return;
  await deleteFirestoreDocSafely('membershipOrders', orderId);
  for (const notifId of notificationIds) {
    await deleteFirestoreDocSafely('memberNotifications', notifId);
  }
}

export async function deleteMemberCascadeInFirestore(deletedIds: {
  memberId: string;
  orderIds?: string[];
  membershipIds?: string[];
  historyIds?: string[];
  notificationIds?: string[];
}): Promise<void> {
  if (!isFirebaseAdminUser()) return;
  await deleteFirestoreDocSafely('members', deletedIds.memberId);
  for (const id of deletedIds.orderIds || []) {
    await deleteFirestoreDocSafely('membershipOrders', id);
  }
  for (const id of deletedIds.membershipIds || []) {
    await deleteFirestoreDocSafely('memberships', id);
  }
  for (const id of deletedIds.historyIds || []) {
    await deleteFirestoreDocSafely('membershipHistory', id);
  }
  for (const id of deletedIds.notificationIds || []) {
    await deleteFirestoreDocSafely('memberNotifications', id);
  }
}

export async function deleteMembershipInFirestore(
  membershipId: string,
  notificationIds: string[] = []
): Promise<void> {
  if (!isFirebaseAdminUser()) return;
  await deleteFirestoreDocSafely('memberships', membershipId);
  for (const id of notificationIds) {
    await deleteFirestoreDocSafely('memberNotifications', id);
  }
}

export async function syncBlockedUserToFirestore(record: BlockedUserRecord): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || !isFirebaseAdminUser()) return;
  const blockId = sanitizeId(record.id);
  const path = `blockedUsers/${blockId}`;
  try {
    await setDoc(doc(db, 'blockedUsers', blockId), {
      id: blockId,
      email: clampStr(record.email.trim().toLowerCase(), 200),
      memberId: clampStr(record.memberId || '', 128),
      fullName: clampStr(record.fullName || '', 120),
      reason: clampStr(record.reason || 'Blocked by FEVIQO administrator', 500),
      blockedByAdminId: clampStr(record.blockedByAdminId || user.uid, 128),
      blockedByAdminEmail: clampStr(record.blockedByAdminEmail || user.email || '', 200),
      blockedAt: clampStr(record.blockedAt || new Date().toISOString(), 64),
      createdAtIso: clampStr(record.createdAt || new Date().toISOString(), 64),
      updatedAtIso: clampStr(record.updatedAt || new Date().toISOString(), 64),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteBlockedUserInFirestore(blockId: string): Promise<void> {
  if (!isFirebaseAdminUser() || !blockId) return;
  await deleteFirestoreDocSafely('blockedUsers', blockId);
}

export interface CloudMembershipSnapshot {
  members: Array<SafeMember & { ownerUid?: string }>;
  blockedUsers: BlockedUserRecord[];
  orders: MembershipOrder[];
  memberships: AdminMembershipRecord[];
  history: MembershipHistoryEntry[];
  customerNotifications: CustomerNotification[];
  schedulerRuns: SchedulerRunLog[];
  config?: MembershipConfig | null;
  referralCampaigns?: any[];
  referralVisits?: any[];
  referralUniqueVisitors?: any[];
  userCampaignAttributions?: any[];
  orderCampaignAttributions?: any[];
  campaignCommissions?: any[];
  commissionPayments?: any[];
  monthlyCommissionReports?: any[];
}

export async function pullAllCloudDataFromFirestore(): Promise<CloudMembershipSnapshot> {
  if (!isFirebaseAdminUser()) {
    throw new Error('Verified administrator Google account required for cloud sync.');
  }

  await ensureAdminProfileInFirestore();

  const members: Array<SafeMember & { ownerUid?: string }> = [];
  const blockedUsers: BlockedUserRecord[] = [];
  const orders: MembershipOrder[] = [];
  const memberships: AdminMembershipRecord[] = [];
  const history: MembershipHistoryEntry[] = [];
  const customerNotificationsList: CustomerNotification[] = [];
  const schedulerRuns: SchedulerRunLog[] = [];
  let config: MembershipConfig | null = null;
  const referralCampaigns: any[] = [];
  const referralVisits: any[] = [];
  const referralUniqueVisitors: any[] = [];
  const userCampaignAttributions: any[] = [];
  const orderCampaignAttributions: any[] = [];
  const campaignCommissions: any[] = [];
  const commissionPayments: any[] = [];
  const monthlyCommissionReports: any[] = [];

  const pullErrors: string[] = [];

  try {
    const snap = await getDocs(collection(db, 'members'));
    snap.forEach((d) => {
      const data = d.data();
      members.push({
        id: data.id || d.id,
        ownerUid: data.ownerUid,
        email: data.email || '',
        fullName: data.fullName || 'Member',
        phone: data.phone || '',
        referralCode: data.referralCode || undefined,
        referredByMemberId: data.referredByMemberId || undefined,
        referredByCode: data.referredByCode || undefined,
        creditBalancePkr: Number(data.creditBalancePkr) || 0,
        creditBalanceUsd: Number(data.creditBalanceUsd) || 0,
        createdAt: toIsoString(data.createdAtIso || data.createdAt, new Date().toISOString()),
      });
    });
  } catch (err) {
    console.error('[Firestore pull] members failed:', err);
    pullErrors.push(`members: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    const snap = await getDocs(collection(db, 'membershipOrders'));
    snap.forEach((d) => {
      const data = d.data();
      orders.push({
        id: data.id || d.id,
        memberId: data.memberId,
        ownerUid: data.ownerUid,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        orderType: data.orderType || 'new',
        targetMembershipId: data.targetMembershipId || undefined,
        planId: data.planId,
        planName: data.planName,
        originalAmountPkr: data.originalAmountPkr,
        originalAmountUsd: data.originalAmountUsd,
        amountPkr: data.amountPkr,
        amountUsd: data.amountUsd,
        promoCodeId: data.promoCodeId || undefined,
        promoCode: data.promoCode || undefined,
        promoDiscountPkr: data.promoDiscountPkr || 0,
        promoDiscountUsd: data.promoDiscountUsd || 0,
        referralCodeUsed: data.referralCodeUsed || undefined,
        referralDiscountPkr: data.referralDiscountPkr || 0,
        referralDiscountUsd: data.referralDiscountUsd || 0,
        creditsUsedPkr: data.creditsUsedPkr || 0,
        creditsUsedUsd: data.creditsUsedUsd || 0,
        discountTotalPkr: data.discountTotalPkr || 0,
        discountTotalUsd: data.discountTotalUsd || 0,
        expectedAmount: data.expectedAmount,
        currency: data.currency || 'PKR',
        paymentRegion: data.paymentRegion || 'pakistan',
        paymentMethod: data.paymentMethod || 'bank_qr',
        visitorCountryCode: data.visitorCountryCode || undefined,
        indicativeLocalDisplay: data.indicativeLocalDisplay || undefined,
        durationDays: data.durationDays,
        selectedDramaIds: data.selectedDramaIds || [],
        status: data.status,
        provider: data.provider || 'bank_qr',
        qrImageUrl: data.qrImageUrl || undefined,
        proofFileName: data.proofFileName || undefined,
        proofOriginalName: data.proofOriginalName || undefined,
        proofMimeType: data.proofMimeType || undefined,
        proofDataUrl: data.proofDataUrl || undefined,
        hasProof: Boolean(data.proofFileName || data.proofDataUrl),
        proofSubmittedAt: data.proofSubmittedAt || undefined,
        paymentNote: data.paymentNote || undefined,
        rejectionReason: data.rejectionReason || undefined,
        reviewedByAdminId: data.reviewedByAdminId || undefined,
        reviewedByAdminEmail: data.reviewedByAdminEmail || undefined,
        reviewedAt: data.reviewedAt || undefined,
        paidAt: data.paidAt || undefined,
        createdAt: toIsoString(data.createdAtIso || data.createdAt, new Date().toISOString()),
        updatedAt: toIsoString(data.updatedAtIso || data.updatedAt, new Date().toISOString()),
      });
    });
  } catch (err) {
    console.error('[Firestore pull] membershipOrders failed:', err);
    pullErrors.push(`membershipOrders: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    const snap = await getDocs(collection(db, 'memberships'));
    snap.forEach((d) => {
      const data = d.data();
      memberships.push({
        id: data.id || d.id,
        memberId: data.memberId,
        ownerUid: data.ownerUid,
        orderId: data.orderId,
        customerName: data.customerName || 'Unknown',
        customerEmail: data.customerEmail || 'Unknown',
        customerPhone: data.customerPhone || '—',
        planId: data.planId,
        planName: data.planName,
        pricePkr: data.pricePkr,
        priceUsd: data.priceUsd,
        durationDays: data.durationDays,
        selectedDramaIds: data.selectedDramaIds || [],
        status: data.status,
        activatedAt: data.activatedAt,
        expiresAt: data.expiresAt,
        cancelledAt: data.cancelledAt || undefined,
        revokedByAdminEmail: data.revokedByAdminEmail || undefined,
        revokedReason: data.revokedReason || undefined,
        approvedByAdminEmail: data.approvedByAdminEmail || undefined,
        paymentProvider: data.paymentProvider || 'bank_qr',
        paymentRegion: data.paymentRegion || 'pakistan',
        paymentMethod: data.paymentMethod || 'bank_qr',
        currency: data.currency || 'PKR',
        expectedAmount: data.expectedAmount,
        paymentReference: data.paymentReference || '',
        renewalHistory: Array.isArray(data.renewalHistory) ? data.renewalHistory : [],
        lastExtendedAt: data.lastExtendedAt || undefined,
        createdAt: toIsoString(data.createdAtIso || data.createdAt, new Date().toISOString()),
      });
    });
  } catch (err) {
    console.error('[Firestore pull] memberships failed:', err);
    pullErrors.push(`memberships: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    const snap = await getDocs(collection(db, 'membershipHistory'));
    snap.forEach((d) => {
      const data = d.data();
      history.push({
        id: data.id || d.id,
        memberId: data.memberId,
        membershipId: data.membershipId || undefined,
        orderId: data.orderId || undefined,
        event: data.event,
        planId: data.planId || undefined,
        planName: data.planName || undefined,
        amountPkr: data.amountPkr,
        amountUsd: data.amountUsd,
        currency: data.currency,
        selectedDramaIds: data.selectedDramaIds,
        details: data.details,
        createdAt: toIsoString(data.createdAtIso || data.createdAt, new Date().toISOString()),
      });
    });
  } catch (err) {
    console.error('[Firestore pull] membershipHistory failed:', err);
    pullErrors.push(`membershipHistory: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    const snap = await getDocs(collection(db, 'memberNotifications'));
    snap.forEach((d) => {
      const data = d.data();
      customerNotificationsList.push({
        id: data.id || d.id,
        memberId: data.memberId,
        ownerUid: data.ownerUid,
        customerEmail: data.customerEmail,
        membershipId: data.membershipId || undefined,
        orderId: data.orderId || undefined,
        planId: data.planId || undefined,
        dramaIds: data.dramaIds || [],
        type: data.type,
        title: data.title,
        titleUr: data.titleUr || undefined,
        message: data.message,
        messageUr: data.messageUr || undefined,
        ctaLabel: data.ctaLabel || undefined,
        ctaHref: data.ctaHref || undefined,
        dedupeKey: data.dedupeKey,
        emailStatus: data.emailStatus || 'not_sent',
        emailError: data.emailError || undefined,
        isRead: Boolean(data.isRead),
        readAt: data.readAt || undefined,
        supersededAt: data.supersededAt || undefined,
        createdAt: toIsoString(data.createdAtIso || data.createdAt, new Date().toISOString()),
      });
    });
  } catch (err) {
    console.error('[Firestore pull] memberNotifications failed:', err);
    pullErrors.push(`memberNotifications: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    const snap = await getDocs(collection(db, 'schedulerRuns'));
    snap.forEach((d) => {
      const data = d.data();
      schedulerRuns.push({
        id: data.id || d.id,
        triggerSource: data.triggerSource,
        ranAt: data.ranAt,
        durationMs: Number(data.durationMs) || 0,
        checkedMemberships: Number(data.checkedMemberships) || 0,
        expiredCount: Number(data.expiredCount) || 0,
        remindersCreated: Number(data.remindersCreated) || 0,
        emailsSent: Number(data.emailsSent) || 0,
        emailsFailed: Number(data.emailsFailed) || 0,
        emailsNotConfigured: Number(data.emailsNotConfigured) || 0,
        summary: data.summary || '',
      });
    });
  } catch (err) {
    console.error('[Firestore pull] schedulerRuns failed:', err);
  }

  const readCampaignCollectionSafely = async (colName: string, target: any[]) => {
    try {
      const snap = await getDocs(collection(db, colName));
      snap.forEach((d) => {
        const data = d.data();
        target.push({ ...data, id: data.id || d.id });
      });
    } catch {
      // Non-fatal if collection empty or rules pending
    }
  };

  await Promise.all([
    readCampaignCollectionSafely('referralCampaigns', referralCampaigns),
    readCampaignCollectionSafely('referralVisits', referralVisits),
    readCampaignCollectionSafely('referralUniqueVisitors', referralUniqueVisitors),
    readCampaignCollectionSafely('userCampaignAttributions', userCampaignAttributions),
    readCampaignCollectionSafely('orderCampaignAttributions', orderCampaignAttributions),
    readCampaignCollectionSafely('campaignCommissions', campaignCommissions),
    readCampaignCollectionSafely('commissionPayments', commissionPayments),
    readCampaignCollectionSafely('monthlyCommissionReports', monthlyCommissionReports),
  ]);

  try {
    const cfgSnap = await getDoc(doc(db, 'membershipConfig', 'public'));
    if (cfgSnap.exists()) {
      const data = cfgSnap.data();
      config = {
        starterQrImage: data.starterQrImage,
        standardQrImage: data.standardQrImage,
        plusQrImage: data.plusQrImage,
        vipQrImage: data.vipQrImage,
        starterBinanceQrImage: data.starterBinanceQrImage || '',
        standardBinanceQrImage: data.standardBinanceQrImage || '',
        plusBinanceQrImage: data.plusBinanceQrImage || '',
        vipBinanceQrImage: data.vipBinanceQrImage || '',
        usdPrices: data.usdPrices || undefined,
        internationalInstructionsEn: data.internationalInstructionsEn || '',
        internationalInstructionsUr: data.internationalInstructionsUr || '',
        whatsappNumber: data.whatsappNumber || '',
        adminEmail: data.adminEmail,
        supportEmail: data.supportEmail,
        supportNoteEn: data.supportNoteEn || '',
        supportNoteUr: data.supportNoteUr || '',
        updatedAt: toIsoString(data.updatedAtIso || data.updatedAt, new Date().toISOString()),
      };
    }
  } catch (err) {
    console.error('[Firestore pull] membershipConfig/public failed:', err);
  }

  try {
    const snap = await getDocs(collection(db, 'blockedUsers'));
    snap.forEach((d) => {
      const data = d.data();
      const email = String(data.email || '').trim().toLowerCase();
      if (!email) return;
      const nowIso = new Date().toISOString();
      blockedUsers.push({
        id: data.id || d.id,
        email,
        memberId: data.memberId || undefined,
        fullName: data.fullName || undefined,
        reason: data.reason || 'Blocked by FEVIQO administrator',
        blockedByAdminId: data.blockedByAdminId || '',
        blockedByAdminEmail: data.blockedByAdminEmail || '',
        blockedAt: toIsoString(data.blockedAt || data.createdAtIso || data.createdAt, nowIso),
        createdAt: toIsoString(data.createdAtIso || data.createdAt, nowIso),
        updatedAt: toIsoString(data.updatedAtIso || data.updatedAt, nowIso),
      });
    });
  } catch (err) {
    console.error('[Firestore pull] blockedUsers failed:', err);
  }

  if (pullErrors.length >= 4 && members.length === 0 && orders.length === 0 && memberships.length === 0) {
    throw new Error(`Firestore read failed across collections: ${pullErrors.join(' | ')}`);
  }

  return {
    members,
    blockedUsers,
    orders,
    memberships,
    history,
    customerNotifications: customerNotificationsList,
    schedulerRuns,
    config,
    referralCampaigns,
    referralVisits,
    referralUniqueVisitors,
    userCampaignAttributions,
    orderCampaignAttributions,
    campaignCommissions,
    commissionPayments,
    monthlyCommissionReports,
  };
}

export interface CloudPushReport {
  syncedMembers: number;
  syncedOrders: number;
  syncedMemberships: number;
  syncedHistory: number;
  syncedNotifications: number;
  syncedBlockedUsers: number;
  failedCount: number;
  errors: string[];
}

export async function pushAdminSnapshotToFirestore(snapshot: {
  members: Array<SafeMember & { ownerUid?: string }>;
  blockedUsers?: BlockedUserRecord[];
  orders: MembershipOrder[];
  memberships: AdminMembershipRecord[];
  history?: MembershipHistoryEntry[];
  customerNotifications?: CustomerNotification[];
  config?: MembershipConfig;
  auditLogs?: AdminAuditEntry[];
  emailNotifications?: AdminEmailNotification[];
  referralCampaigns?: any[];
  referralVisits?: any[];
  referralUniqueVisitors?: any[];
  userCampaignAttributions?: any[];
  orderCampaignAttributions?: any[];
  campaignCommissions?: any[];
  commissionPayments?: any[];
  monthlyCommissionReports?: any[];
}): Promise<CloudPushReport> {
  const report: CloudPushReport = {
    syncedMembers: 0,
    syncedOrders: 0,
    syncedMemberships: 0,
    syncedHistory: 0,
    syncedNotifications: 0,
    syncedBlockedUsers: 0,
    failedCount: 0,
    errors: [],
  };

  if (!isFirebaseAdminUser()) return report;
  try {
    await ensureAdminProfileInFirestore();
  } catch (err) {
    report.failedCount += 1;
    report.errors.push(`adminProfile: ${err instanceof Error ? err.message : String(err)}`);
  }

  const memberOwnerMap = new Map<string, string>();
  for (const m of snapshot.members || []) {
    const ownerUid = sanitizeId(m.ownerUid || 'admin_assigned');
    memberOwnerMap.set(m.id, ownerUid);
    try {
      await syncMemberAccountToFirestore(m, ownerUid);
      report.syncedMembers += 1;
    } catch (err) {
      report.failedCount += 1;
      report.errors.push(`member(${m.id}): ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  for (const ord of snapshot.orders || []) {
    const ownerUid = sanitizeId(ord.ownerUid || memberOwnerMap.get(ord.memberId) || 'admin_assigned');
    try {
      await syncOrderToFirestore(ord, { ownerUidOverride: ownerUid, proofDataUrl: ord.proofDataUrl });
      report.syncedOrders += 1;
    } catch (err) {
      report.failedCount += 1;
      report.errors.push(`order(${ord.id}): ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  for (const sub of snapshot.memberships || []) {
    const ownerUid = sanitizeId(sub.ownerUid || memberOwnerMap.get(sub.memberId) || 'admin_assigned');
    try {
      await syncMembershipToFirestore(sub, ownerUid);
      report.syncedMemberships += 1;
    } catch (err) {
      report.failedCount += 1;
      report.errors.push(`membership(${sub.id}): ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (snapshot.history) {
    for (const h of snapshot.history.slice(0, 200)) {
      const ownerUid = sanitizeId(memberOwnerMap.get(h.memberId) || 'admin_assigned');
      try {
        await syncHistoryEntryToFirestore(h, ownerUid);
        report.syncedHistory += 1;
      } catch (err) {
        report.failedCount += 1;
        report.errors.push(`history(${h.id}): ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  if (snapshot.customerNotifications) {
    for (const n of snapshot.customerNotifications.slice(0, 200)) {
      const ownerUid = sanitizeId(n.ownerUid || memberOwnerMap.get(n.memberId) || 'admin_assigned');
      try {
        await syncMemberNotificationToFirestore(n, ownerUid);
        report.syncedNotifications += 1;
      } catch (err) {
        report.failedCount += 1;
        report.errors.push(`notif(${n.id}): ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  if (Array.isArray(snapshot.blockedUsers)) {
    for (const b of snapshot.blockedUsers) {
      if (b && b.email) {
        try {
          await syncBlockedUserToFirestore(b);
          report.syncedBlockedUsers += 1;
        } catch (err) {
          report.failedCount += 1;
          report.errors.push(`blocked(${b.email}): ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
  }

  const pushCampaignColSafely = async (colName: string, items?: any[]) => {
    if (!Array.isArray(items)) return;
    for (const item of items.slice(0, 200)) {
      if (!item || !item.id) continue;
      try {
        await setDoc(doc(db, colName, sanitizeId(String(item.id))), {
          ...stripUndefinedDeep(item),
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Non-fatal
      }
    }
  };

  await Promise.all([
    pushCampaignColSafely('referralCampaigns', snapshot.referralCampaigns),
    pushCampaignColSafely('referralVisits', snapshot.referralVisits),
    pushCampaignColSafely('referralUniqueVisitors', snapshot.referralUniqueVisitors),
    pushCampaignColSafely('userCampaignAttributions', snapshot.userCampaignAttributions),
    pushCampaignColSafely('orderCampaignAttributions', snapshot.orderCampaignAttributions),
    pushCampaignColSafely('campaignCommissions', snapshot.campaignCommissions),
    pushCampaignColSafely('commissionPayments', snapshot.commissionPayments),
    pushCampaignColSafely('monthlyCommissionReports', snapshot.monthlyCommissionReports),
  ]);

  if (snapshot.config) {
    try {
      await setDoc(doc(db, 'membershipConfig', 'public'), {
        starterQrImage: clampNonEmpty(snapshot.config.starterQrImage, '/qr-starter.png', 512),
        standardQrImage: clampNonEmpty(snapshot.config.standardQrImage, '/qr-standard.png', 512),
        plusQrImage: clampNonEmpty(snapshot.config.plusQrImage, '/qr-plus.png', 512),
        vipQrImage: clampNonEmpty(snapshot.config.vipQrImage, '/qr-vip.png', 512),
        starterBinanceQrImage: clampStr(snapshot.config.starterBinanceQrImage || '', 512),
        standardBinanceQrImage: clampStr(snapshot.config.standardBinanceQrImage || '', 512),
        plusBinanceQrImage: clampStr(snapshot.config.plusBinanceQrImage || '', 512),
        vipBinanceQrImage: clampStr(snapshot.config.vipBinanceQrImage || '', 512),
        usdPrices: snapshot.config.usdPrices || { starter: 1.2, standard: 2.5, plus: 3.5, vip: 5 },
        internationalInstructionsEn: clampStr(snapshot.config.internationalInstructionsEn || '', 1500),
        internationalInstructionsUr: clampStr(snapshot.config.internationalInstructionsUr || '', 1500),
        whatsappNumber: clampStr(snapshot.config.whatsappNumber || '', 40),
        adminEmail: clampEmail(snapshot.config.adminEmail, 'rexanmedia01@gmail.com'),
        supportEmail: clampEmail(snapshot.config.supportEmail, 'support@feviqo.com'),
        supportNoteEn: clampStr(snapshot.config.supportNoteEn || '', 1000),
        supportNoteUr: clampStr(snapshot.config.supportNoteUr || '', 1000),
        updatedAtIso: clampNonEmpty(snapshot.config.updatedAt, new Date().toISOString(), 64),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      report.failedCount += 1;
      report.errors.push(`config: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return report;
}

export async function fetchMemberCloudOrders(memberId: string): Promise<MembershipOrder[]> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return [];
  const path = 'membershipOrders';
  try {
    const q = query(
      collection(db, 'membershipOrders'),
      where('ownerUid', '==', user.uid)
    );
    const snap = await getDocs(q);
    const out: MembershipOrder[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (!memberId || data.memberId === memberId) {
        out.push({
          id: data.id || d.id,
          memberId: data.memberId,
          ownerUid: data.ownerUid,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          orderType: data.orderType || 'new',
          targetMembershipId: data.targetMembershipId || undefined,
          planId: data.planId,
          planName: data.planName,
          amountPkr: data.amountPkr,
          amountUsd: data.amountUsd,
          expectedAmount: data.expectedAmount,
          currency: data.currency || 'PKR',
          paymentRegion: data.paymentRegion || 'pakistan',
          paymentMethod: data.paymentMethod || 'bank_qr',
          visitorCountryCode: data.visitorCountryCode || undefined,
          indicativeLocalDisplay: data.indicativeLocalDisplay || undefined,
          durationDays: data.durationDays,
          selectedDramaIds: data.selectedDramaIds || [],
          status: data.status,
          provider: data.provider || 'bank_qr',
          qrImageUrl: data.qrImageUrl,
          proofFileName: data.proofFileName,
          proofOriginalName: data.proofOriginalName,
          proofMimeType: data.proofMimeType,
          proofDataUrl: data.proofDataUrl,
          hasProof: Boolean(data.proofFileName || data.proofDataUrl),
          proofSubmittedAt: data.proofSubmittedAt,
          paymentNote: data.paymentNote,
          rejectionReason: data.rejectionReason,
          reviewedByAdminId: data.reviewedByAdminId,
          reviewedByAdminEmail: data.reviewedByAdminEmail,
          reviewedAt: data.reviewedAt,
          paidAt: data.paidAt,
          createdAt: toIsoString(data.createdAtIso || data.createdAt, new Date().toISOString()),
          updatedAt: toIsoString(data.updatedAtIso || data.updatedAt, new Date().toISOString()),
        });
      }
    });
    return out;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

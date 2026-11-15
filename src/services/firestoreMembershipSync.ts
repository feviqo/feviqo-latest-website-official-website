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

function clampStr(val: unknown, maxLen: number): string {
  return String(val ?? '').slice(0, maxLen);
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
    if (!snap.exists()) {
      await setDoc(ref, {
        id: memberId,
        ownerUid,
        email: clampStr(member.email, 200),
        fullName: clampStr(member.fullName, 120),
        phone: clampStr(member.phone || '', 32),
        createdAtIso: clampStr(member.createdAt || new Date().toISOString(), 64),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else if (snap.data()?.ownerUid === user.uid || isFirebaseAdminUser()) {
      await updateDoc(ref, {
        fullName: clampStr(member.fullName, 120),
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
      const payload: Record<string, unknown> = {
        id: orderId,
        memberId: sanitizeId(order.memberId),
        ownerUid,
        customerName: clampStr(order.customerName || options?.member?.fullName || 'FEVIQO Member', 120),
        customerEmail: clampStr(order.customerEmail || options?.member?.email || user.email || '', 200),
        customerPhone: clampStr(order.customerPhone || options?.member?.phone || '', 32),
        orderType: order.orderType === 'renewal' ? 'renewal' : 'new',
        targetMembershipId: clampStr(order.targetMembershipId || '', 128),
        planId: order.planId,
        planName: clampStr(order.planName, 64),
        amountPkr: Number(order.amountPkr) || 0,
        amountUsd: Number(order.amountUsd) || 0,
        expectedAmount: Number(order.expectedAmount ?? (order.currency === 'USD' ? order.amountUsd : order.amountPkr)) || 0,
        currency: order.currency === 'USD' ? 'USD' : 'PKR',
        paymentRegion: order.paymentRegion === 'international' ? 'international' : 'pakistan',
        paymentMethod:
          order.paymentMethod === 'binance_qr'
            ? 'binance_qr'
            : order.paymentMethod === 'admin_assigned'
              ? 'admin_assigned'
              : 'bank_qr',
        visitorCountryCode: clampStr(order.visitorCountryCode || '', 12),
        indicativeLocalDisplay: clampStr(order.indicativeLocalDisplay || '', 64),
        durationDays: Math.max(1, Number(order.durationDays) || 15),
        selectedDramaIds: (order.selectedDramaIds || []).slice(0, 10),
        status: initialStatus,
        provider: clampStr(order.provider || 'bank_qr', 40),
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
        createdAtIso: clampStr(order.createdAt || new Date().toISOString(), 64),
        updatedAtIso: clampStr(order.updatedAt || new Date().toISOString(), 64),
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
    if (!snap.exists()) {
      await setDoc(ref, {
        id: membershipId,
        memberId: sanitizeId(membership.memberId),
        ownerUid,
        orderId: sanitizeId(membership.orderId),
        customerName: clampStr(membership.customerName || 'FEVIQO Member', 120),
        customerEmail: clampStr(membership.customerEmail || 'member@feviqo.com', 200),
        customerPhone: clampStr(membership.customerPhone || '', 32),
        planId: membership.planId,
        planName: clampStr(membership.planName, 64),
        pricePkr: Number(membership.pricePkr) || 0,
        priceUsd: Number(membership.priceUsd) || 0,
        durationDays: Math.max(1, Number(membership.durationDays) || 15),
        selectedDramaIds: (membership.selectedDramaIds || []).slice(0, 10),
        status: membership.status,
        activatedAt: clampStr(membership.activatedAt, 64),
        expiresAt: clampStr(membership.expiresAt, 64),
        cancelledAt: clampStr(membership.cancelledAt || '', 64),
        revokedByAdminEmail: clampStr(membership.revokedByAdminEmail || '', 200),
        revokedReason: clampStr(membership.revokedReason || '', 500),
        approvedByAdminEmail: clampStr(membership.approvedByAdminEmail || '', 200),
        paymentProvider: clampStr(membership.paymentProvider || 'bank_qr', 40),
        paymentRegion: membership.paymentRegion === 'international' ? 'international' : 'pakistan',
        paymentMethod:
          membership.paymentMethod === 'binance_qr'
            ? 'binance_qr'
            : membership.paymentMethod === 'admin_assigned'
              ? 'admin_assigned'
              : 'bank_qr',
        currency: membership.currency === 'USD' ? 'USD' : 'PKR',
        expectedAmount: Number(membership.expectedAmount ?? membership.pricePkr ?? 0) || 0,
        paymentReference: clampStr(membership.paymentReference || '', 400),
        renewalHistory: Array.isArray(membership.renewalHistory) ? membership.renewalHistory.slice(0, 100) : [],
        lastExtendedAt: clampStr(membership.lastExtendedAt || '', 64),
        createdAtIso: clampStr(membership.createdAt || new Date().toISOString(), 64),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        planId: membership.planId,
        planName: clampStr(membership.planName, 64),
        durationDays: Math.max(1, Number(membership.durationDays) || 15),
        selectedDramaIds: (membership.selectedDramaIds || []).slice(0, 10),
        status: membership.status,
        activatedAt: clampStr(membership.activatedAt, 64),
        expiresAt: clampStr(membership.expiresAt, 64),
        cancelledAt: clampStr(membership.cancelledAt || '', 64),
        revokedByAdminEmail: clampStr(membership.revokedByAdminEmail || '', 200),
        revokedReason: clampStr(membership.revokedReason || '', 500),
        renewalHistory: Array.isArray(membership.renewalHistory) ? membership.renewalHistory.slice(0, 100) : [],
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

export interface CloudMembershipSnapshot {
  members: Array<SafeMember & { ownerUid?: string }>;
  orders: MembershipOrder[];
  memberships: AdminMembershipRecord[];
  history: MembershipHistoryEntry[];
  customerNotifications: CustomerNotification[];
  schedulerRuns: SchedulerRunLog[];
  config?: MembershipConfig | null;
}

export async function pullAllCloudDataFromFirestore(): Promise<CloudMembershipSnapshot> {
  if (!isFirebaseAdminUser()) {
    throw new Error('Verified administrator Google account required for cloud sync.');
  }

  await ensureAdminProfileInFirestore();

  const members: Array<SafeMember & { ownerUid?: string }> = [];
  const orders: MembershipOrder[] = [];
  const memberships: AdminMembershipRecord[] = [];
  const history: MembershipHistoryEntry[] = [];
  const customerNotifications: CustomerNotification[] = [];
  const schedulerRuns: SchedulerRunLog[] = [];
  let config: MembershipConfig | null = null;

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
        createdAt: toIsoString(data.createdAtIso || data.createdAt, new Date().toISOString()),
      });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'members');
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
    handleFirestoreError(err, OperationType.LIST, 'membershipOrders');
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
    handleFirestoreError(err, OperationType.LIST, 'memberships');
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
    handleFirestoreError(err, OperationType.LIST, 'membershipHistory');
  }

  try {
    const snap = await getDocs(collection(db, 'memberNotifications'));
    snap.forEach((d) => {
      const data = d.data();
      customerNotifications.push({
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
    handleFirestoreError(err, OperationType.LIST, 'memberNotifications');
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
    handleFirestoreError(err, OperationType.LIST, 'schedulerRuns');
  }

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
    handleFirestoreError(err, OperationType.GET, 'membershipConfig/public');
  }

  return {
    members,
    orders,
    memberships,
    history,
    customerNotifications,
    schedulerRuns,
    config,
  };
}

export async function pushAdminSnapshotToFirestore(snapshot: {
  members: Array<SafeMember & { ownerUid?: string }>;
  orders: MembershipOrder[];
  memberships: AdminMembershipRecord[];
  history?: MembershipHistoryEntry[];
  customerNotifications?: CustomerNotification[];
  config?: MembershipConfig;
  auditLogs?: AdminAuditEntry[];
  emailNotifications?: AdminEmailNotification[];
}): Promise<void> {
  if (!isFirebaseAdminUser()) return;
  await ensureAdminProfileInFirestore();

  const memberOwnerMap = new Map<string, string>();
  for (const m of snapshot.members) {
    const ownerUid = sanitizeId(m.ownerUid || 'admin_assigned');
    memberOwnerMap.set(m.id, ownerUid);
    await syncMemberAccountToFirestore(m, ownerUid);
  }

  for (const ord of snapshot.orders) {
    const ownerUid = sanitizeId(ord.ownerUid || memberOwnerMap.get(ord.memberId) || 'admin_assigned');
    await syncOrderToFirestore(ord, { ownerUidOverride: ownerUid, proofDataUrl: ord.proofDataUrl });
  }

  for (const sub of snapshot.memberships) {
    const ownerUid = sanitizeId(sub.ownerUid || memberOwnerMap.get(sub.memberId) || 'admin_assigned');
    await syncMembershipToFirestore(sub, ownerUid);
  }

  if (snapshot.history) {
    for (const h of snapshot.history.slice(0, 150)) {
      const ownerUid = sanitizeId(memberOwnerMap.get(h.memberId) || 'admin_assigned');
      await syncHistoryEntryToFirestore(h, ownerUid);
    }
  }

  if (snapshot.customerNotifications) {
    for (const n of snapshot.customerNotifications.slice(0, 150)) {
      const ownerUid = sanitizeId(n.ownerUid || memberOwnerMap.get(n.memberId) || 'admin_assigned');
      await syncMemberNotificationToFirestore(n, ownerUid);
    }
  }

  if (snapshot.config) {
    try {
      await setDoc(doc(db, 'membershipConfig', 'public'), {
        starterQrImage: clampStr(snapshot.config.starterQrImage, 512),
        standardQrImage: clampStr(snapshot.config.standardQrImage, 512),
        plusQrImage: clampStr(snapshot.config.plusQrImage, 512),
        vipQrImage: clampStr(snapshot.config.vipQrImage, 512),
        starterBinanceQrImage: clampStr(snapshot.config.starterBinanceQrImage || '', 512),
        standardBinanceQrImage: clampStr(snapshot.config.standardBinanceQrImage || '', 512),
        plusBinanceQrImage: clampStr(snapshot.config.plusBinanceQrImage || '', 512),
        vipBinanceQrImage: clampStr(snapshot.config.vipBinanceQrImage || '', 512),
        usdPrices: snapshot.config.usdPrices || { starter: 1.2, standard: 2.5, plus: 3.5, vip: 5 },
        internationalInstructionsEn: clampStr(snapshot.config.internationalInstructionsEn || '', 1500),
        internationalInstructionsUr: clampStr(snapshot.config.internationalInstructionsUr || '', 1500),
        whatsappNumber: clampStr(snapshot.config.whatsappNumber || '', 40),
        adminEmail: clampStr(snapshot.config.adminEmail, 200),
        supportEmail: clampStr(snapshot.config.supportEmail, 200),
        supportNoteEn: clampStr(snapshot.config.supportNoteEn || '', 1000),
        supportNoteUr: clampStr(snapshot.config.supportNoteUr || '', 1000),
        updatedAtIso: clampStr(snapshot.config.updatedAt || new Date().toISOString(), 64),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'membershipConfig/public');
    }
  }
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

import {
  MembershipPlan,
  CatalogDramaMeta,
  MembershipPlanId,
} from '../data/membershipCatalog';

export interface SafeMember {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
}

export interface MembershipRecord {
  id: string;
  memberId: string;
  orderId: string;
  planId: MembershipPlanId;
  planName: string;
  pricePkr: number;
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
  proofFileName?: string;
  proofOriginalName?: string;
  proofMimeType?: string;
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

export interface PublicMembershipConfig {
  qrImages: Record<MembershipPlanId, string>;
  whatsappConfigured: boolean;
  whatsappDigits: string;
  supportEmail: string;
  supportNoteEn: string;
  supportNoteUr: string;
}

export interface PaymentGatewayStatus {
  configured: boolean;
  provider: 'bank_qr' | 'stripe' | 'safepay' | 'payfast';
  missingCredentials: string[];
  instructions: string;
}

export interface MemberAccountState {
  member: SafeMember;
  activeMembership: MembershipRecord | null;
  latestMembership: MembershipRecord | null;
  remainingDays: number;
  remainingHours?: number;
  unlockedDramaIds: string[];
  unlockedDramas: CatalogDramaMeta[];
  orders: MembershipOrder[];
  history: MembershipHistoryEntry[];
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
  whatsappNumber: string;
  adminEmail: string;
  supportEmail: string;
  supportNoteEn: string;
  supportNoteUr: string;
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
    failedEmails: number;
  };
  members: SafeMember[];
  requests: MembershipOrder[];
  memberships: AdminMembershipRecord[];
  auditLogs: AdminAuditEntry[];
  emailNotifications: AdminEmailNotification[];
  config: MembershipConfig;
  admins: SafeAdmin[];
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return { success: false, error: `Unexpected server response (${res.status}).` };
  }
}

export async function fetchMembershipCatalog(): Promise<{
  success: boolean;
  plans?: MembershipPlan[];
  dramas?: CatalogDramaMeta[];
  publicConfig?: PublicMembershipConfig;
  gatewayStatus?: PaymentGatewayStatus;
}> {
  const res = await fetch('/api/membership/catalog', { credentials: 'include' });
  return parseJsonSafe(res);
}

export async function fetchMemberAccount(): Promise<
  ({ success: true } & MemberAccountState) | { success: false; code?: string; error?: string }
> {
  const res = await fetch('/api/membership/account', { credentials: 'include' });
  return parseJsonSafe(res);
}

export async function registerMemberAccount(payload: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): Promise<
  ({ success: true } & MemberAccountState) | { success: false; error: string }
> {
  const res = await fetch('/api/membership/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function loginMemberAccount(payload: {
  email: string;
  password: string;
}): Promise<
  ({ success: true } & MemberAccountState) | { success: false; error: string }
> {
  const res = await fetch('/api/membership/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function logoutMemberAccount(): Promise<void> {
  await fetch('/api/membership/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function createMembershipCheckout(payload: {
  planId: MembershipPlanId;
  selectedDramaIds: string[];
}): Promise<{
  success: boolean;
  error?: string;
  order?: MembershipOrder;
  qrImageUrl?: string;
  publicConfig?: PublicMembershipConfig;
  gatewayConfigured?: boolean;
  paymentSetupRequired?: boolean;
  gatewayStatus?: PaymentGatewayStatus;
  account?: MemberAccountState;
}> {
  const res = await fetch('/api/membership/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function submitOrderPaymentProofFile(payload: {
  orderId: string;
  file: File;
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
  const form = new FormData();
  form.append('proof', payload.file);
  if (payload.paymentNote?.trim()) {
    form.append('paymentNote', payload.paymentNote.trim());
  }
  const res = await fetch(`/api/membership/orders/${encodeURIComponent(payload.orderId)}/proof`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  return parseJsonSafe(res);
}

export async function cancelActiveMembership(): Promise<
  ({ success: true } & MemberAccountState) | { success: false; error: string }
> {
  const res = await fetch('/api/membership/cancel', {
    method: 'POST',
    credentials: 'include',
  });
  return parseJsonSafe(res);
}

export async function requestProtectedEpisodeStream(
  dramaId: string,
  episodeSlug: string
): Promise<
  | {
      success: true;
      streamUrl: string;
      dramaTitle: string;
      episodeTitle: string;
      planName: string;
      expiresAt: string;
    }
  | {
      success: false;
      code?: string;
      error: string;
    }
> {
  const res = await fetch(
    `/api/membership/watch/${encodeURIComponent(dramaId)}/${encodeURIComponent(episodeSlug)}`,
    { credentials: 'include' }
  );
  return parseJsonSafe(res);
}

// --- ADMIN PANEL SERVICE ---
export async function fetchAdminAuthStatus(): Promise<{
  success: boolean;
  authenticated: boolean;
  admin: SafeAdmin | null;
  hasConfiguredAdmins: boolean;
  configuredAdminEmail: string;
}> {
  const res = await fetch('/api/admin/auth/status', { credentials: 'include' });
  return parseJsonSafe(res);
}

export async function bootstrapAdminAccount(payload: {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}): Promise<{ success: true; admin: SafeAdmin } | { success: false; error: string }> {
  const res = await fetch('/api/admin/auth/bootstrap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function loginAdminAccount(payload: {
  email: string;
  password: string;
}): Promise<{ success: true; admin: SafeAdmin } | { success: false; error: string }> {
  const res = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseJsonSafe(res);
}

export async function logoutAdminAccount(): Promise<void> {
  await fetch('/api/admin/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function fetchAdminMembershipsOverview(): Promise<
  ({ success: true } & AdminMembershipsOverview) | { success: false; code?: string; error: string }
> {
  const res = await fetch('/api/admin/memberships/overview', { credentials: 'include' });
  return parseJsonSafe(res);
}

export async function approvePaymentOrder(orderId: string): Promise<
  { success: true; overview: AdminMembershipsOverview } | { success: false; error: string }
> {
  const res = await fetch(
    `/api/admin/memberships/requests/${encodeURIComponent(orderId)}/approve`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );
  return parseJsonSafe(res);
}

export async function rejectPaymentOrder(
  orderId: string,
  reason: string
): Promise<{ success: true; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch(
    `/api/admin/memberships/requests/${encodeURIComponent(orderId)}/reject`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    }
  );
  return parseJsonSafe(res);
}

export async function revokeMembershipAccess(
  membershipId: string,
  reason: string
): Promise<{ success: true; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch(`/api/admin/memberships/${encodeURIComponent(membershipId)}/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reason }),
  });
  return parseJsonSafe(res);
}

export async function updateMembershipSettings(
  updates: Partial<MembershipConfig>
): Promise<{ success: true; config: MembershipConfig; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const res = await fetch('/api/admin/memberships/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return parseJsonSafe(res);
}

export async function uploadPlanQrImage(
  planId: MembershipPlanId,
  file: File
): Promise<{ success: true; imageUrl: string; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const form = new FormData();
  form.append('qr', file);
  const res = await fetch(`/api/admin/memberships/qr/${encodeURIComponent(planId)}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  return parseJsonSafe(res);
}

export async function retryEmailNotification(
  notifId: string
): Promise<{ success: boolean; overview?: AdminMembershipsOverview; error?: string }> {
  const res = await fetch(`/api/admin/memberships/emails/${encodeURIComponent(notifId)}/retry`, {
    method: 'POST',
    credentials: 'include',
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ isActive }),
  });
  return parseJsonSafe(res);
}

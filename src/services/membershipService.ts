import {
  MembershipPlan,
  CatalogDramaMeta,
  MembershipPlanId,
} from '../data/membershipCatalog';

export interface SafeMember {
  id: string;
  ownerUid?: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
}

export interface MembershipRecord {
  id: string;
  memberId: string;
  ownerUid?: string;
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
  ownerUid?: string;
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
  history?: MembershipHistoryEntry[];
  auditLogs: AdminAuditEntry[];
  emailNotifications: AdminEmailNotification[];
  config: MembershipConfig;
  admins: SafeAdmin[];
}

const MEMBER_TOKEN_KEY = 'feviqo_member_token';
const ADMIN_TOKEN_KEY = 'feviqo_admin_token';

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
}): Promise<
  ({ success: true } & MemberAccountState) | { success: false; error: string }
> {
  const res = await fetch('/api/membership/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (data?.success && data?.token) {
    writeStoredToken(MEMBER_TOKEN_KEY, data.token);
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
    headers: { 'Content-Type': 'application/json' },
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
}): Promise<
  ({ success: true } & MemberAccountState) | { success: false; error: string }
> {
  const res = await fetch('/api/membership/google-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (data?.success && data?.token) {
    writeStoredToken(MEMBER_TOKEN_KEY, data.token);
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
    headers: memberHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
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

export async function cancelActiveMembership(): Promise<
  ({ success: true } & MemberAccountState) | { success: false; error: string }
> {
  const res = await fetch('/api/membership/cancel', {
    method: 'POST',
    credentials: 'include',
    headers: memberHeaders(),
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
      thumbnail?: string;
      fallbackThumbnail?: string;
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
    {
      credentials: 'include',
      headers: memberHeaders(),
    }
  );
  return parseJsonSafe(res);
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
  { success: true; order?: MembershipOrder; membership?: AdminMembershipRecord; overview: AdminMembershipsOverview } | { success: false; error: string }
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

export async function syncAdminCloudState(snapshot: {
  members?: SafeMember[];
  orders?: MembershipOrder[];
  memberships?: AdminMembershipRecord[];
  history?: MembershipHistoryEntry[];
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
  file: File
): Promise<{ success: true; imageUrl: string; overview: AdminMembershipsOverview } | { success: false; error: string }> {
  const form = new FormData();
  form.append('qr', file);
  const res = await fetch(`/api/admin/memberships/qr/${encodeURIComponent(planId)}`, {
    method: 'POST',
    credentials: 'include',
    headers: adminHeaders(),
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


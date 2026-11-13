import {
  MembershipPlan,
  CatalogDramaMeta,
  MembershipPlanId,
} from '../data/membershipCatalog';

export interface SafeMember {
  id: string;
  email: string;
  fullName: string;
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
  paymentProvider: string;
  paymentReference: string;
  createdAt: string;
}

export interface MembershipOrder {
  id: string;
  memberId: string;
  planId: MembershipPlanId;
  planName: string;
  amountPkr: number;
  durationDays: number;
  selectedDramaIds: string[];
  status: 'pending_payment' | 'paid' | 'failed' | 'cancelled';
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

export interface PaymentGatewayStatus {
  configured: boolean;
  provider: 'stripe' | 'safepay' | 'payfast' | 'none';
  missingCredentials: string[];
  instructions: string;
}

export interface MemberAccountState {
  member: SafeMember;
  activeMembership: MembershipRecord | null;
  latestMembership: MembershipRecord | null;
  remainingDays: number;
  unlockedDramaIds: string[];
  unlockedDramas: CatalogDramaMeta[];
  orders: MembershipOrder[];
  history: MembershipHistoryEntry[];
  gatewayStatus: PaymentGatewayStatus;
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
  password: string;
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
  gatewayConfigured?: boolean;
  paymentSetupRequired?: boolean;
  checkoutUrl?: string;
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

export async function confirmStripeCheckout(payload: {
  orderId: string;
  sessionId: string;
}): Promise<({ success: true } & MemberAccountState) | { success: false; error: string }> {
  const res = await fetch('/api/membership/confirm-stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
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

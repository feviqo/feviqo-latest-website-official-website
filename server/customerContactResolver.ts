export type ResolvedPhoneSource =
  | 'verified_profile'
  | 'firebase_auth'
  | 'account_profile'
  | 'whatsapp_pref'
  | 'membership_record'
  | 'order_record'
  | 'missing';

export interface FirebaseAuthPhoneEntry {
  uid: string;
  phoneNumber: string;
  email?: string;
  verified?: boolean;
}

export interface FirebaseAuthPhoneLookup {
  available: boolean;
  byUid: Map<string, FirebaseAuthPhoneEntry>;
  byEmail: Map<string, FirebaseAuthPhoneEntry>;
  reason?: string;
}

export interface CustomerContactCandidateInput {
  member: {
    id: string;
    ownerUid?: string;
    email?: string;
    fullName?: string;
    phone?: string;
    phoneNormalized?: string;
    whatsappPhone?: string;
    whatsappNumber?: string;
    mobile?: string;
    phoneNumber?: string;
    contactNumber?: string;
    phoneVerified?: boolean;
    whatsappVerified?: boolean;
    phoneVerifiedAt?: string;
    updatedAt?: string;
    createdAt?: string;
  };
  preference?: {
    id?: string;
    memberId?: string;
    ownerUid?: string;
    email?: string;
    phoneE164?: string;
    phoneVerified?: boolean;
    whatsappVerified?: boolean;
    membershipUpdates?: boolean;
    renewalReminders?: boolean;
    newEpisodeAlerts?: boolean;
    promotionalMessages?: boolean;
    optedOut?: boolean;
    consentTimestamp?: string;
    consentSource?: string;
    updatedAt?: string;
  } | null;
  memberships?: Array<{
    id?: string;
    memberId?: string;
    ownerUid?: string;
    customerEmail?: string;
    customerPhone?: string;
    status?: string;
    createdAt?: string;
    activatedAt?: string;
    updatedAt?: string;
  }>;
  orders?: Array<{
    id?: string;
    memberId?: string;
    ownerUid?: string;
    customerEmail?: string;
    customerPhone?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  firebaseAuthLookup?: FirebaseAuthPhoneLookup | null;
}

export interface ResolvedCustomerWhatsAppContact {
  memberId: string;
  ownerUid?: string;
  email: string;
  fullName: string;
  rawPhone: string;
  phoneE164: string;
  waDigits: string;
  phoneValid: boolean;
  phoneSource: ResolvedPhoneSource;
  phoneSourceLabel: string;
  phoneVerified: boolean;
  phoneError?: string;
  hasExplicitConsent: boolean;
  hasEpisodeConsent: boolean;
  optedOut: boolean;
  usableForWhatsApp: boolean;
  usabilityReason: string;
  needsBackfillToMember: boolean;
}

export interface CustomerContactAuditReport {
  generatedAt: string;
  firebaseAuthAvailable: boolean;
  firebaseAuthNote: string;
  totals: {
    totalAccounts: number;
    validPhones: number;
    verifiedPhones: number;
    missingPhones: number;
    invalidPhones: number;
    backfillableFromExistingRecords: number;
    consentedAccounts: number;
    optedOutAccounts: number;
    usableForWhatsApp: number;
  };
  bySource: Record<ResolvedPhoneSource, number>;
  records: ResolvedCustomerWhatsAppContact[];
}

export const PHONE_SOURCE_LABELS: Record<ResolvedPhoneSource, string> = {
  verified_profile: 'Verified Profile WhatsApp',
  firebase_auth: 'Firebase Authentication',
  account_profile: 'Customer Profile',
  whatsapp_pref: 'WhatsApp Preferences',
  membership_record: 'Membership Record',
  order_record: 'Payment Order Record',
  missing: 'Phone Number Required',
};

/**
 * Strict international E.164 phone normalizer.
 * - Rejects email addresses, letters, concatenated/truncated values, and impossible lengths.
 * - Normalizes Pakistani numbers:
 *   03XXXXXXXXX -> +923XXXXXXXXX
 *   923XXXXXXXXX -> +923XXXXXXXXX
 *   +923XXXXXXXXX -> +923XXXXXXXXX
 *   00923XXXXXXXXX -> +923XXXXXXXXX
 *   3XXXXXXXXX -> +923XXXXXXXXX
 * - Preserves valid international E.164 numbers with their actual country code.
 */
export function normalizeCustomerPhoneE164Strict(raw?: string | null): {
  valid: boolean;
  phoneE164: string;
  waDigits: string;
  error?: string;
} {
  const original = String(raw || '').trim();
  if (!original) {
    return { valid: false, phoneE164: '', waDigits: '', error: 'Phone number required' };
  }
  if (original.includes('@') || /[a-zA-Z]/.test(original)) {
    return {
      valid: false,
      phoneE164: '',
      waDigits: '',
      error: 'Phone field contains non-phone characters or an email address',
    };
  }

  let cleaned = original.replace(/[\s\-().]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = `+${cleaned.slice(2)}`;
  }

  const hasPlus = cleaned.startsWith('+');
  const digits = cleaned.replace(/[^\d]/g, '');

  if (!digits) {
    return { valid: false, phoneE164: '', waDigits: '', error: 'Phone number required' };
  }

  // Reject obviously fake / repeated digit placeholders (e.g. 0000000000)
  if (/^(\d)\1{7,}$/.test(digits)) {
    return { valid: false, phoneE164: '', waDigits: '', error: 'Invalid placeholder phone number' };
  }

  // Pakistani mobile patterns
  if (!hasPlus && /^03\d{9}$/.test(digits)) {
    const waDigits = `92${digits.slice(1)}`;
    return { valid: true, phoneE164: `+${waDigits}`, waDigits };
  }
  if (!hasPlus && /^3\d{9}$/.test(digits)) {
    const waDigits = `92${digits}`;
    return { valid: true, phoneE164: `+${waDigits}`, waDigits };
  }
  if (/^923\d{9}$/.test(digits)) {
    return { valid: true, phoneE164: `+${digits}`, waDigits: digits };
  }
  // Common accidental leading zero after country code: +9203XXXXXXXXX
  if (/^9203\d{9}$/.test(digits)) {
    const waDigits = `92${digits.slice(3)}`;
    return { valid: true, phoneE164: `+${waDigits}`, waDigits };
  }

  // Pakistani local landline (e.g. 042..., 051...) rejected as WhatsApp mobile unless explicit +92
  if (!hasPlus && digits.startsWith('0') && digits.length <= 11) {
    return {
      valid: false,
      phoneE164: '',
      waDigits: '',
      error: 'Include full country code (e.g. +923001234567 or 03001234567)',
    };
  }

  // Valid explicit international E.164 (8 to 15 digits, country code cannot start with 0)
  if (digits.length >= 8 && digits.length <= 15 && !digits.startsWith('0')) {
    // Reject truncated Pakistani mobile like 92300123 (less than 12 digits starting with 923)
    if (digits.startsWith('923') && digits.length !== 12) {
      return {
        valid: false,
        phoneE164: '',
        waDigits: '',
        error: `Pakistani WhatsApp number must have 12 digits (+923XXXXXXXXX), found ${digits.length}`,
      };
    }
    return { valid: true, phoneE164: `+${digits}`, waDigits: digits };
  }

  return {
    valid: false,
    phoneE164: '',
    waDigits: '',
    error: `Invalid phone length (${digits.length} digits). Expected 8–15 digits in E.164 format.`,
  };
}

function recordBelongsToCustomer(
  record: { memberId?: string; ownerUid?: string; customerEmail?: string; email?: string },
  member: { id: string; ownerUid?: string; email?: string }
): boolean {
  if (record.memberId && record.memberId === member.id) return true;
  if (member.ownerUid && record.ownerUid && record.ownerUid === member.ownerUid) return true;
  const mEmail = String(member.email || '').trim().toLowerCase();
  const rEmail = String(record.customerEmail || record.email || '').trim().toLowerCase();
  if (mEmail && rEmail && mEmail === rEmail) return true;
  return false;
}

function parseTs(iso?: string): number {
  if (!iso) return 0;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? 0 : ms;
}

/**
 * Centralized customer WhatsApp phone resolver.
 * Priority order:
 *   1. Verified WhatsApp number explicitly saved in customer profile / verified preference
 *   2. Verified phone number in Firebase Authentication (when Admin SDK lookup is available)
 *   3. Existing customer profile phone/mobile fields (phone, whatsappPhone, whatsappNumber, phoneNumber, mobile, contactNumber, phoneNormalized)
 *   4. Existing WhatsApp preference phone
 *   5. Existing owned membership record customerPhone (most recent first)
 *   6. Existing owned payment order record customerPhone (most recent first)
 */
export function resolveCustomerWhatsAppContact(
  input: CustomerContactCandidateInput
): ResolvedCustomerWhatsAppContact {
  const { member, preference, memberships = [], orders = [], firebaseAuthLookup } = input;
  const email = String(member.email || '').trim().toLowerCase();
  const fullName = String(member.fullName || 'FEVIQO Member').trim();

  const prefBelongs = preference ? recordBelongsToCustomer(preference, member) : false;
  const safePref = prefBelongs ? preference : null;

  const profilePhoneCandidates = [
    member.whatsappPhone,
    member.whatsappNumber,
    member.phone,
    member.phoneNormalized,
    member.phoneNumber,
    member.mobile,
    member.contactNumber,
  ]
    .map((v) => String(v || '').trim())
    .filter(Boolean);

  const memberPrimaryValid = normalizeCustomerPhoneE164Strict(member.phone);

  type Candidate = {
    raw: string;
    source: ResolvedPhoneSource;
    verified: boolean;
  };
  const candidates: Candidate[] = [];

  // Priority 1: Verified WhatsApp number explicitly saved in customer profile or verified preference
  const profileVerified = Boolean(member.whatsappVerified || member.phoneVerified);
  if (profileVerified) {
    for (const raw of profilePhoneCandidates) {
      candidates.push({ raw, source: 'verified_profile', verified: true });
    }
  }
  if (safePref && (safePref.whatsappVerified || safePref.phoneVerified) && safePref.phoneE164) {
    candidates.push({ raw: safePref.phoneE164, source: 'verified_profile', verified: true });
  }

  // Priority 2: Verified phone number in Firebase Authentication
  if (firebaseAuthLookup?.available) {
    const byUid = member.ownerUid ? firebaseAuthLookup.byUid.get(member.ownerUid) : undefined;
    const byEmail = !byUid && email ? firebaseAuthLookup.byEmail.get(email) : undefined;
    const authHit = byUid || byEmail;
    if (authHit?.phoneNumber) {
      candidates.push({
        raw: authHit.phoneNumber,
        source: 'firebase_auth',
        verified: true,
      });
    }
  }

  // Priority 3: Existing customer profile phone/mobile fields
  for (const raw of profilePhoneCandidates) {
    candidates.push({ raw, source: 'account_profile', verified: profileVerified });
  }

  // Priority 4: Existing WhatsApp preferences record
  if (safePref?.phoneE164) {
    candidates.push({
      raw: safePref.phoneE164,
      source: 'whatsapp_pref',
      verified: Boolean(safePref.whatsappVerified || safePref.phoneVerified),
    });
  }

  // Priority 5: Owned membership records (most recent first)
  const ownedMemberships = memberships
    .filter((sub) => recordBelongsToCustomer(sub, member) && String(sub.customerPhone || '').trim())
    .sort(
      (a, b) =>
        Math.max(parseTs(b.updatedAt), parseTs(b.activatedAt), parseTs(b.createdAt)) -
        Math.max(parseTs(a.updatedAt), parseTs(a.activatedAt), parseTs(a.createdAt))
    );
  for (const sub of ownedMemberships) {
    candidates.push({
      raw: String(sub.customerPhone || '').trim(),
      source: 'membership_record',
      verified: false,
    });
  }

  // Priority 6: Owned payment order records (most recent first)
  const ownedOrders = orders
    .filter((ord) => recordBelongsToCustomer(ord, member) && String(ord.customerPhone || '').trim())
    .sort(
      (a, b) =>
        Math.max(parseTs(b.updatedAt), parseTs(b.createdAt)) -
        Math.max(parseTs(a.updatedAt), parseTs(a.createdAt))
    );
  for (const ord of ownedOrders) {
    candidates.push({
      raw: String(ord.customerPhone || '').trim(),
      source: 'order_record',
      verified: false,
    });
  }

  let resolvedRaw = '';
  let resolvedE164 = '';
  let resolvedWaDigits = '';
  let resolvedSource: ResolvedPhoneSource = 'missing';
  let resolvedVerified = false;
  let phoneValid = false;
  let firstInvalidRaw = '';
  let firstInvalidError = 'Phone number required';

  for (const c of candidates) {
    const check = normalizeCustomerPhoneE164Strict(c.raw);
    if (check.valid) {
      resolvedRaw = c.raw;
      resolvedE164 = check.phoneE164;
      resolvedWaDigits = check.waDigits;
      resolvedSource = c.source;
      resolvedVerified = c.verified;
      phoneValid = true;
      break;
    } else if (!firstInvalidRaw && c.raw) {
      firstInvalidRaw = c.raw;
      firstInvalidError = check.error || 'Invalid phone number';
    }
  }

  const optedOut = Boolean(safePref?.optedOut);
  const hasEpisodeConsent = Boolean(safePref && !safePref.optedOut && safePref.newEpisodeAlerts);
  const hasExplicitConsent = Boolean(
    safePref &&
      !safePref.optedOut &&
      (safePref.membershipUpdates ||
        safePref.renewalReminders ||
        safePref.newEpisodeAlerts ||
        safePref.promotionalMessages)
  );

  let usableForWhatsApp = false;
  let usabilityReason = 'Phone number required';
  if (!phoneValid) {
    usabilityReason = firstInvalidRaw ? `Invalid phone: ${firstInvalidError}` : 'Phone number required';
  } else if (optedOut) {
    usabilityReason = 'Customer opted out (STOP)';
  } else if (!hasExplicitConsent) {
    usabilityReason = 'Valid phone found — awaiting explicit WhatsApp opt-in consent';
  } else {
    usableForWhatsApp = true;
    usabilityReason = resolvedVerified
      ? 'Ready for WhatsApp (verified phone + consent)'
      : 'Ready for WhatsApp (valid phone + consent)';
  }

  const needsBackfillToMember =
    phoneValid && !memberPrimaryValid.valid && resolvedSource !== 'missing';

  return {
    memberId: member.id,
    ownerUid: member.ownerUid,
    email,
    fullName,
    rawPhone: phoneValid ? resolvedRaw : firstInvalidRaw,
    phoneE164: resolvedE164,
    waDigits: resolvedWaDigits,
    phoneValid,
    phoneSource: phoneValid ? resolvedSource : 'missing',
    phoneSourceLabel: PHONE_SOURCE_LABELS[phoneValid ? resolvedSource : 'missing'],
    phoneVerified: resolvedVerified,
    phoneError: phoneValid ? undefined : firstInvalidError,
    hasExplicitConsent,
    hasEpisodeConsent,
    optedOut,
    usableForWhatsApp,
    usabilityReason,
    needsBackfillToMember,
  };
}

export function buildCustomerContactAuditReport(params: {
  members: CustomerContactCandidateInput['member'][];
  preferences: NonNullable<CustomerContactCandidateInput['preference']>[];
  memberships: NonNullable<CustomerContactCandidateInput['memberships']>;
  orders: NonNullable<CustomerContactCandidateInput['orders']>;
  firebaseAuthLookup?: FirebaseAuthPhoneLookup | null;
}): CustomerContactAuditReport {
  const bySource: Record<ResolvedPhoneSource, number> = {
    verified_profile: 0,
    firebase_auth: 0,
    account_profile: 0,
    whatsapp_pref: 0,
    membership_record: 0,
    order_record: 0,
    missing: 0,
  };

  const records = params.members.map((member) => {
    const email = String(member.email || '').trim().toLowerCase();
    const pref =
      params.preferences.find(
        (p) =>
          (p.memberId && p.memberId === member.id) ||
          (member.ownerUid && p.ownerUid && p.ownerUid === member.ownerUid) ||
          (email && p.email && p.email.trim().toLowerCase() === email)
      ) || null;

    const resolved = resolveCustomerWhatsAppContact({
      member,
      preference: pref,
      memberships: params.memberships,
      orders: params.orders,
      firebaseAuthLookup: params.firebaseAuthLookup,
    });
    bySource[resolved.phoneSource] = (bySource[resolved.phoneSource] || 0) + 1;
    return resolved;
  });

  const validPhones = records.filter((r) => r.phoneValid).length;
  const verifiedPhones = records.filter((r) => r.phoneValid && r.phoneVerified).length;
  const invalidPhones = records.filter((r) => !r.phoneValid && Boolean(r.rawPhone)).length;
  const missingPhones = records.filter((r) => !r.phoneValid && !r.rawPhone).length;
  const backfillableFromExistingRecords = records.filter((r) => r.needsBackfillToMember).length;
  const consentedAccounts = records.filter((r) => r.hasExplicitConsent && !r.optedOut).length;
  const optedOutAccounts = records.filter((r) => r.optedOut).length;
  const usableForWhatsApp = records.filter((r) => r.usableForWhatsApp).length;

  return {
    generatedAt: new Date().toISOString(),
    firebaseAuthAvailable: Boolean(params.firebaseAuthLookup?.available),
    firebaseAuthNote:
      params.firebaseAuthLookup?.reason ||
      (params.firebaseAuthLookup?.available
        ? 'Firebase Authentication user phone numbers checked via Admin SDK.'
        : 'Firebase Admin Auth lookup unavailable in this runtime (configure FIREBASE_SERVICE_ACCOUNT_JSON on Render to also query Firebase Auth phoneNumber).'),
    totals: {
      totalAccounts: records.length,
      validPhones,
      verifiedPhones,
      missingPhones,
      invalidPhones,
      backfillableFromExistingRecords,
      consentedAccounts,
      optedOutAccounts,
      usableForWhatsApp,
    },
    bySource,
    records,
  };
}

/**
 * Helper to count {{1}}, {{2}}, ... placeholders in a Meta template body text.
 */
export function countTemplatePlaceholders(bodyText?: string): number {
  if (!bodyText) return 0;
  const matches = bodyText.match(/\{\{\s*\d+\s*\}\}/g);
  if (!matches) return 0;
  const nums = new Set(matches.map((m) => Number(m.replace(/[^\d]/g, ''))).filter((n) => n > 0));
  return nums.size;
}

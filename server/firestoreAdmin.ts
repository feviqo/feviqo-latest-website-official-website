import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, cert, applicationDefault, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore, Firestore, Timestamp } from 'firebase-admin/firestore';

interface FirebaseAppletConfig {
  projectId: string;
  firestoreDatabaseId?: string;
}

function readAppletConfig(): FirebaseAppletConfig | null {
  try {
    const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(cfgPath)) return null;
    return JSON.parse(fs.readFileSync(cfgPath, 'utf-8')) as FirebaseAppletConfig;
  } catch {
    return null;
  }
}

let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;
let firestoreWriteDisabled = false;
let hasExplicitServiceAccount = false;

function getFirebaseAdminApp(): { app: App; cfg: FirebaseAppletConfig } | null {
  const cfg = readAppletConfig();
  if (!cfg?.projectId) return null;

  if (cachedApp) return { app: cachedApp, cfg };

  const existing = getApps().find((a) => a.name === 'feviqo-firebase');
  if (existing) {
    cachedApp = existing;
    return { app: cachedApp, cfg };
  }

  // Prefer explicit Firebase Service Account JSON if provided (for Render / external deployments)
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      cachedApp = initializeApp(
        { credential: cert(parsed), projectId: cfg.projectId },
        'feviqo-firebase'
      );
      hasExplicitServiceAccount = true;
      return { app: cachedApp, cfg };
    } catch (err) {
      console.warn('[FirebaseAdmin] Invalid FIREBASE_SERVICE_ACCOUNT_JSON:', err);
    }
  }

  // Fallback init (supports Firebase Auth ID token verification via Google public certs)
  try {
    cachedApp = initializeApp(
      {
        credential: process.env.GOOGLE_APPLICATION_CREDENTIALS ? applicationDefault() : undefined,
        projectId: cfg.projectId,
      },
      'feviqo-firebase'
    );
    hasExplicitServiceAccount = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    return { app: cachedApp, cfg };
  } catch {
    try {
      cachedApp = initializeApp({ projectId: cfg.projectId }, 'feviqo-firebase');
      return { app: cachedApp, cfg };
    } catch {
      return null;
    }
  }
}

export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken | null> {
  if (!idToken || typeof idToken !== 'string') return null;
  const ctx = getFirebaseAdminApp();
  if (!ctx) return null;
  try {
    const auth = getAuth(ctx.app);
    return await auth.verifyIdToken(idToken);
  } catch (err) {
    console.warn('[FirebaseAuth] ID token verification failed:', (err as Error)?.message || err);
    return null;
  }
}

function getAdminFirestoreDb(): Firestore | null {
  if (firestoreWriteDisabled || !hasExplicitServiceAccount) return null;
  if (cachedDb) return cachedDb;
  const ctx = getFirebaseAdminApp();
  if (!ctx) return null;
  try {
    cachedDb = ctx.cfg.firestoreDatabaseId
      ? getFirestore(ctx.app, ctx.cfg.firestoreDatabaseId)
      : getFirestore(ctx.app);
    return cachedDb;
  } catch {
    return null;
  }
}

export function isServerFirestoreEnabled(): boolean {
  if (firestoreWriteDisabled) return false;
  getFirebaseAdminApp();
  return hasExplicitServiceAccount && Boolean(getAdminFirestoreDb());
}

export interface FirebaseAuthPhoneLookupResult {
  available: boolean;
  byUid: Map<string, { uid: string; phoneNumber: string; email?: string; verified: boolean }>;
  byEmail: Map<string, { uid: string; phoneNumber: string; email?: string; verified: boolean }>;
  reason?: string;
}

export async function listFirebaseAuthUsersPhoneMap(): Promise<FirebaseAuthPhoneLookupResult> {
  const byUid = new Map<string, { uid: string; phoneNumber: string; email?: string; verified: boolean }>();
  const byEmail = new Map<string, { uid: string; phoneNumber: string; email?: string; verified: boolean }>();

  const ctx = getFirebaseAdminApp();
  if (!ctx || !hasExplicitServiceAccount) {
    return {
      available: false,
      byUid,
      byEmail,
      reason:
        'Firebase Admin credentials (FIREBASE_SERVICE_ACCOUNT_JSON) are not configured in this environment; using Firestore/customer profile, preference, membership, and order records.',
    };
  }

  try {
    const auth = getAuth(ctx.app);
    let pageToken: string | undefined;
    let scannedPages = 0;
    do {
      const page = await auth.listUsers(1000, pageToken);
      for (const u of page.users) {
        const phone = String(u.phoneNumber || '').trim();
        if (!phone) continue;
        const email = u.email ? u.email.trim().toLowerCase() : undefined;
        const entry = {
          uid: u.uid,
          phoneNumber: phone,
          email,
          verified: true,
        };
        byUid.set(u.uid, entry);
        if (email) byEmail.set(email, entry);
      }
      pageToken = page.pageToken;
      scannedPages += 1;
    } while (pageToken && scannedPages < 10);

    return {
      available: true,
      byUid,
      byEmail,
      reason: `Scanned Firebase Authentication (${byUid.size} account(s) with verified phoneNumber).`,
    };
  } catch (err: any) {
    return {
      available: false,
      byUid,
      byEmail,
      reason: `Firebase Auth user lookup unavailable (${err?.message || 'insufficient Admin Auth permission'}).`,
    };
  }
}

function toIso(val: unknown): string | undefined {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof (val as any).toDate === 'function') {
    return (val as any).toDate().toISOString();
  }
  return undefined;
}

export async function mirrorDocToFirestoreServer(
  collectionName: string,
  docId: string,
  data: Record<string, any>
): Promise<void> {
  const db = getAdminFirestoreDb();
  if (!db) return;
  try {
    const cleanData: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) cleanData[k] = v;
    }
    const now = Timestamp.now();
    await db
      .collection(collectionName)
      .doc(docId)
      .set(
        {
          ...cleanData,
          createdAt: cleanData.createdAt instanceof Timestamp ? cleanData.createdAt : now,
          updatedAt: now,
        },
        { merge: true }
      );
  } catch (err: any) {
    if (err?.code === 7 || String(err?.message || '').includes('PERMISSION_DENIED')) {
      firestoreWriteDisabled = true;
    } else {
      console.warn(`[FirestoreAdmin] Mirror failed for ${collectionName}/${docId}:`, err?.message || err);
    }
  }
}

export async function deleteDocFromFirestoreServer(
  collectionName: string,
  docId: string
): Promise<void> {
  const db = getAdminFirestoreDb();
  if (!db || !docId) return;
  try {
    await db.collection(collectionName).doc(docId).delete();
  } catch (err: any) {
    if (err?.code === 7 || String(err?.message || '').includes('PERMISSION_DENIED')) {
      firestoreWriteDisabled = true;
    } else {
      console.warn(`[FirestoreAdmin] Delete failed for ${collectionName}/${docId}:`, err?.message || err);
    }
  }
}

export async function pullSnapshotFromFirestoreServer(): Promise<{
  members: any[];
  orders: any[];
  memberships: any[];
  history: any[];
  notifications: any[];
  promoCodes: any[];
  referrals: any[];
  referralCredits: any[];
  referralCampaigns: any[];
  referralVisits: any[];
  referralUniqueVisitors: any[];
  userCampaignAttributions: any[];
  orderCampaignAttributions: any[];
  campaignCommissions: any[];
  commissionPayments: any[];
  monthlyCommissionReports: any[];
  blockedUsers: any[];
  supportersLeaderboard: any[];
  supportersLeaderboardSettings: Record<string, any> | null;
  config: Record<string, any> | null;
} | null> {
  const db = getAdminFirestoreDb();
  if (!db) return null;
  try {
    const [
      membersSnap,
      ordersSnap,
      subsSnap,
      histSnap,
      notifSnap,
      promoSnap,
      refSnap,
      creditSnap,
      campaignsSnap,
      visitsSnap,
      uvSnap,
      userAttrSnap,
      orderAttrSnap,
      commSnap,
      paySnap,
      reportSnap,
      blockedSnap,
      supportersSnap,
      supporterSettingsSnap,
      cfgSnap,
    ] = await Promise.all([
      db.collection('members').get(),
      db.collection('membershipOrders').get(),
      db.collection('memberships').get(),
      db.collection('membershipHistory').get(),
      db.collection('memberNotifications').get(),
      db.collection('promoCodes').get(),
      db.collection('referrals').get(),
      db.collection('referralCredits').get(),
      db.collection('referralCampaigns').get(),
      db.collection('referralVisits').get(),
      db.collection('referralUniqueVisitors').get(),
      db.collection('userCampaignAttributions').get(),
      db.collection('orderCampaignAttributions').get(),
      db.collection('campaignCommissions').get(),
      db.collection('commissionPayments').get(),
      db.collection('monthlyCommissionReports').get(),
      db.collection('blockedUsers').get(),
      db.collection('supportersLeaderboard').get(),
      db.collection('supportersLeaderboardSettings').doc('main').get(),
      db.collection('membershipConfig').doc('public').get(),
    ]);

    const members = membersSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: data.id || d.id,
        ownerUid: data.ownerUid,
        email: data.email || '',
        fullName: data.fullName || 'FEVIQO Member',
        phone: data.phone || '',
        referralCode: data.referralCode || undefined,
        referredByMemberId: data.referredByMemberId || undefined,
        referredByCode: data.referredByCode || undefined,
        creditBalancePkr: Number(data.creditBalancePkr) || 0,
        creditBalanceUsd: Number(data.creditBalanceUsd) || 0,
        createdAt: toIso(data.createdAtIso || data.createdAt) || new Date().toISOString(),
        updatedAt: toIso(data.updatedAtIso || data.updatedAt) || new Date().toISOString(),
      };
    });

    const orders = ordersSnap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: data.id || d.id,
        createdAt: toIso(data.createdAtIso || data.createdAt) || new Date().toISOString(),
        updatedAt: toIso(data.updatedAtIso || data.updatedAt) || new Date().toISOString(),
      };
    });

    const memberships = subsSnap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: data.id || d.id,
        createdAt: toIso(data.createdAtIso || data.createdAt) || new Date().toISOString(),
      };
    });

    const history = histSnap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: data.id || d.id,
        createdAt: toIso(data.createdAtIso || data.createdAt) || new Date().toISOString(),
      };
    });

    const notifications = notifSnap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: data.id || d.id,
        createdAt: toIso(data.createdAtIso || data.createdAt) || new Date().toISOString(),
      };
    });

    const promoCodes = promoSnap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: data.id || d.id,
        createdAt: toIso(data.createdAtIso || data.createdAt) || new Date().toISOString(),
        updatedAt: toIso(data.updatedAtIso || data.updatedAt) || new Date().toISOString(),
      };
    });

    const referrals = refSnap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: data.id || d.id,
        createdAt: toIso(data.createdAtIso || data.createdAt) || new Date().toISOString(),
        updatedAt: toIso(data.updatedAtIso || data.updatedAt) || new Date().toISOString(),
      };
    });

    const referralCredits = creditSnap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: data.id || d.id,
        createdAt: toIso(data.createdAtIso || data.createdAt) || new Date().toISOString(),
      };
    });

    const normalizeGeneric = (snap: { docs: Array<{ id: string; data: () => Record<string, any> }> }) =>
      snap.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: data.id || d.id,
          createdAt: toIso(data.createdAtIso || data.createdAt) || data.createdAt || new Date().toISOString(),
          updatedAt: toIso(data.updatedAtIso || data.updatedAt) || data.updatedAt || new Date().toISOString(),
        };
      });

    const referralCampaigns = normalizeGeneric(campaignsSnap);
    const referralVisits = normalizeGeneric(visitsSnap);
    const referralUniqueVisitors = normalizeGeneric(uvSnap);
    const userCampaignAttributions = normalizeGeneric(userAttrSnap);
    const orderCampaignAttributions = normalizeGeneric(orderAttrSnap);
    const campaignCommissions = normalizeGeneric(commSnap);
    const commissionPayments = normalizeGeneric(paySnap);
    const monthlyCommissionReports = normalizeGeneric(reportSnap);
    const blockedUsers = normalizeGeneric(blockedSnap);
    const supportersLeaderboard = normalizeGeneric(supportersSnap);
    let supportersLeaderboardSettings: Record<string, any> | null = null;
    if (supporterSettingsSnap.exists) {
      const data = supporterSettingsSnap.data() || {};
      supportersLeaderboardSettings = {
        ...data,
        id: 'main',
        updatedAt: toIso(data.updatedAtIso || data.updatedAt) || new Date().toISOString(),
      };
    }

    let config: Record<string, any> | null = null;
    if (cfgSnap.exists) {
      const data = cfgSnap.data() || {};
      config = {
        ...data,
        updatedAt: toIso(data.updatedAtIso || data.updatedAt) || new Date().toISOString(),
      };
    }

    return {
      members,
      orders,
      memberships,
      history,
      notifications,
      promoCodes,
      referrals,
      referralCredits,
      referralCampaigns,
      referralVisits,
      referralUniqueVisitors,
      userCampaignAttributions,
      orderCampaignAttributions,
      campaignCommissions,
      commissionPayments,
      monthlyCommissionReports,
      blockedUsers,
      supportersLeaderboard,
      supportersLeaderboardSettings,
      config,
    };
  } catch (err: any) {
    if (err?.code === 7 || String(err?.message || '').includes('PERMISSION_DENIED')) {
      firestoreWriteDisabled = true;
    }
    console.warn('[FirestoreAdmin] Pull snapshot failed:', err?.message || err);
    return null;
  }
}

export async function pullAutomationSnapshotFromFirestoreServer(): Promise<{
  settings: Record<string, any> | null;
  queueSettings: Record<string, any> | null;
  preferences: any[];
  messages: any[];
  jobs: any[];
  episodeBroadcasts: any[];
  leads: any[];
  conversations: any[];
  webhookEvents: any[];
  webhookDedupe: any[];
  oneClickNotifications: any[];
} | null> {
  const db = getAdminFirestoreDb();
  if (!db) return null;
  try {
    const [
      settingsSnap,
      queueSettingsSnap,
      prefsSnap,
      msgsSnap,
      jobsSnap,
      epSnap,
      leadsSnap,
      convSnap,
      webhookEventsSnap,
      webhookDedupeSnap,
      oneClickSnap,
    ] = await Promise.all([
      db.collection('whatsappSettings').doc('main').get(),
      db.collection('whatsappSettings').doc('queue').get(),
      db.collection('whatsappPreferences').get(),
      db.collection('whatsappMessages').get(),
      db.collection('automationJobs').get(),
      db.collection('episodeBroadcasts').get(),
      db.collection('videoEditingLeads').get(),
      db.collection('whatsappConversations').get(),
      db.collection('whatsappWebhookEvents').get(),
      db.collection('whatsappWebhookDedupe').get(),
      db.collection('whatsappNotifications').get(),
    ]);

    const normalizeList = (snap: { docs: Array<{ id: string; data: () => Record<string, any> }> }) =>
      snap.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: data.id || d.id,
          createdAt: toIso(data.createdAtIso || data.createdAt) || new Date().toISOString(),
          updatedAt: toIso(data.updatedAtIso || data.updatedAt) || new Date().toISOString(),
        };
      });

    return {
      settings: settingsSnap.exists ? (settingsSnap.data() || null) : null,
      queueSettings: queueSettingsSnap.exists ? (queueSettingsSnap.data() || null) : null,
      preferences: normalizeList(prefsSnap),
      messages: normalizeList(msgsSnap),
      jobs: normalizeList(jobsSnap),
      episodeBroadcasts: normalizeList(epSnap),
      leads: normalizeList(leadsSnap),
      conversations: normalizeList(convSnap),
      webhookEvents: normalizeList(webhookEventsSnap),
      webhookDedupe: normalizeList(webhookDedupeSnap),
      oneClickNotifications: normalizeList(oneClickSnap),
    };
  } catch (err: any) {
    if (err?.code === 7 || String(err?.message || '').includes('PERMISSION_DENIED')) {
      firestoreWriteDisabled = true;
    }
    console.warn('[FirestoreAdmin] Pull automation snapshot failed:', err?.message || err);
    return null;
  }
}


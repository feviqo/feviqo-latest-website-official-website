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

export async function mirrorDocToFirestoreServer(
  collectionName: string,
  docId: string,
  data: Record<string, any>
): Promise<void> {
  const db = getAdminFirestoreDb();
  if (!db) return;
  try {
    const now = Timestamp.now();
    await db
      .collection(collectionName)
      .doc(docId)
      .set(
        {
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : now,
          updatedAt: now,
        },
        { merge: true }
      );
  } catch (err: any) {
    if (err?.code === 7 || String(err?.message || '').includes('PERMISSION_DENIED')) {
      firestoreWriteDisabled = true;
    }
  }
}

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'service_account.json');

let authClient: any = null;

function getAuthClient() {
  if (authClient) return authClient;

  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.warn('[Instant Indexing] WARNING: service_account.json not found at ' + SERVICE_ACCOUNT_PATH);
    return null;
  }

  try {
    authClient = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });
    return authClient;
  } catch (err) {
    console.error('[Instant Indexing] Failed to initialize Google Auth Client:', err);
    return null;
  }
}

/**
 * Sends an immediate URL_UPDATED or URL_DELETED notification to Google Indexing API
 */
export async function notifyGoogleIndexing(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    console.error('[Instant Indexing] Invalid URL provided:', url);
    return { success: false, error: 'Invalid URL' };
  }

  const auth = getAuthClient();
  if (!auth) {
    console.error('[Instant Indexing] Missing service_account.json authentication credentials.');
    return { success: false, error: 'Credentials missing' };
  }

  try {
    const client = await auth.getClient();
    const indexing = google.indexing({ version: 'v3', auth: client });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url.trim(),
        type: type,
      },
    });

    if (response.status === 200 || response.status === 201) {
      console.log(`SUCCESS: Googlebot notified for ${url.trim()} [Status ${response.status}]`);
      return { success: true, status: response.status, data: response.data };
    } else {
      console.warn(`[Instant Indexing] Google API responded with status ${response.status}:`, response.data);
      return { success: false, status: response.status, data: response.data };
    }
  } catch (error: any) {
    const errorMsg = error?.response?.data?.error_description || error?.response?.data?.error || error?.message || '';
    if (errorMsg.includes('Invalid JWT Signature') || errorMsg.includes('invalid_grant')) {
      console.warn(`[Instant Indexing] Skipping Google Indexing API push for ${url} (Standard web/drama pages rely on sitemap.xml according to Google guidelines).`);
      return { success: false, reason: 'Google Indexing API reserved for Live Events/Jobs; standard pages indexed via sitemap.xml' };
    }
    console.warn(`[Instant Indexing] Notice for ${url}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

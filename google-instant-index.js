import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

/**
 * Standalone Instant Indexing Module for Google Indexing API
 * Authenticates using ./service_account.json and pushes URL_UPDATED notifications
 */

const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'service_account.json');

let authClient = null;

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
 * @param {string} url - The full live URL to index (e.g. 'https://feviqo.com/teskilat/episode-189')
 * @param {'URL_UPDATED' | 'URL_DELETED'} type - Action type
 */
export async function notifyGoogleIndexing(url, type = 'URL_UPDATED') {
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
  } catch (error) {
    console.error(`[Instant Indexing] ERROR notifying Googlebot for ${url}:`, error?.response?.data || error?.message || error);
    return { success: false, error: error?.response?.data || error?.message || error };
  }
}

// Allow CLI direct execution (e.g. node google-instant-index.js https://feviqo.com/teskilat/episode-189)
if (process.argv[2] && process.argv[2].startsWith('http')) {
  const targetUrl = process.argv[2];
  console.log(`🚀 Executing instant indexing trigger for ${targetUrl}...`);
  notifyGoogleIndexing(targetUrl).then(res => {
    console.log('Result:', JSON.stringify(res, null, 2));
    process.exit(res.success ? 0 : 1);
  });
}

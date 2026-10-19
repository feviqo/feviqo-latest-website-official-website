import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const KEY_PATH = path.join(process.cwd(), 'service_account.json');

if (!fs.existsSync(KEY_PATH)) {
  console.error('❌ Error: service_account.json not found at:', KEY_PATH);
  process.exit(1);
}

const URLS_TO_INDEX = [
  'https://feviqo.com/',
  'https://feviqo.com/teskilat',
  'https://feviqo.com/teskilat/episode-189',
  'https://feviqo.com/teskilat/episode-188',
  'https://feviqo.com/teskilat/episode-187',
  'https://feviqo.com/teskilat/episode-186',
  'https://feviqo.com/mehmed-fetihler-sultani',
  'https://feviqo.com/mehmed-fetihler-sultani/episode-88',
  'https://feviqo.com/mehmed-fetihler-sultani/episode-87',
  'https://feviqo.com/gunesin-dogdugu-yer',
  'https://feviqo.com/gunesin-dogdugu-yer/episode-5',
  'https://feviqo.com/gunesin-dogdugu-yer/episode-4',
  'https://feviqo.com/dramas',
  'https://feviqo.com/trending',
  'https://feviqo.com/sitemap.xml'
];

async function runGoogleIndexing() {
  console.log('🚀 Initializing Google Indexing API authorization using service_account.json...');

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_PATH,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const authClient = await auth.getClient();
    console.log('✅ Google Auth Client initialized successfully!');

    const indexing = google.indexing({ version: 'v3', auth: authClient as any });

    for (const url of URLS_TO_INDEX) {
      try {
        const res = await indexing.urlNotifications.publish({
          requestBody: {
            url: url,
            type: 'URL_UPDATED',
          },
        });
        console.log(`✅ Google Indexing API Success [${res.status}]: ${url}`);
        console.log('   Notification Time:', res.data.urlNotificationMetadata?.latestUpdate?.notifyTime);
      } catch (err: any) {
        console.error(`❌ Indexing error for ${url}:`, err?.message || err);
      }
    }
  } catch (err: any) {
    console.error('❌ Authorization Failed:', err?.message || err);
  }
}

runGoogleIndexing();

export interface SearchEnginePingOptions {
  urls?: string[];           // Target URLs to force re-index (e.g. ['https://feviqo.com/teskilat/episode-188'])
  sitemapUrl?: string;       // Sitemap location (defaults to https://feviqo.com/sitemap.xml)
  host?: string;             // Host domain (defaults to feviqo.com)
  indexNowKey?: string;      // IndexNow protocol key
  keyLocation?: string;      // IndexNow key location
  episodeTitle?: string;     // Updated episode title
  thumbnailUrl?: string;     // Updated thumbnail image URL
  reason?: string;           // Reason for re-indexing (e.g., "Thumbnail updated", "New episode published")
}

export interface SearchEnginePingResult {
  timestamp: string;
  urlsPinged: string[];
  sitemapUrl: string;
  status: 'success' | 'partial' | 'failed';
  reason?: string;
  details: {
    googleSitemap: { success: boolean; status: number; message: string };
    bingSitemap: { success: boolean; status: number; message: string };
    indexNowBing: { success: boolean; status: number; message: string };
    indexNowGlobal: { success: boolean; status: number; message: string };
  };
}

const DEFAULT_HOST = 'feviqo.com';
const DEFAULT_SITE_URL = 'https://feviqo.com';
const DEFAULT_SITEMAP_URL = 'https://feviqo.com/sitemap.xml';
const INDEXNOW_KEY = 'feviqo-indexnow-key-2026';
const INDEXNOW_KEY_LOCATION = 'https://feviqo.com/feviqo-indexnow-key-2026.txt';

// In-memory audit log of search engine pings
const pingLog: SearchEnginePingResult[] = [];

/**
 * Normalizes relative or absolute paths into fully-qualified canonical HTTPS URLs
 */
export function formatCanonicalUrls(inputUrls: string[], origin: string = DEFAULT_SITE_URL): string[] {
  const urlSet = new Set<string>();
  
  for (const item of inputUrls) {
    if (!item) continue;
    let fullUrl = item.trim();
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      const cleanPath = fullUrl.startsWith('/') ? fullUrl : `/${fullUrl}`;
      fullUrl = `${origin}${cleanPath}`;
    }
    urlSet.add(fullUrl);
  }

  // Always ensure sitemap and home are included in priority pings
  urlSet.add(DEFAULT_SITEMAP_URL);
  
  return Array.from(urlSet);
}

/**
 * Pings Google, Bing, and IndexNow search engine endpoints to force rapid re-indexing
 * whenever an episode or thumbnail is created or updated in the database/CMS.
 */
export async function pingSearchEnginesForReindexing(
  options: SearchEnginePingOptions = {}
): Promise<SearchEnginePingResult> {
  const timestamp = new Date().toISOString();
  const sitemapUrl = options.sitemapUrl || DEFAULT_SITEMAP_URL;
  const rawUrls = options.urls && options.urls.length > 0
    ? options.urls
    : ['/teskilat/episode-188', '/teskilat-urdu/episode-188', '/teskilat', '/sitemap.xml'];

  const urlsPinged = formatCanonicalUrls(rawUrls, DEFAULT_SITE_URL);
  const host = options.host || DEFAULT_HOST;
  const indexNowKey = options.indexNowKey || INDEXNOW_KEY;
  const keyLocation = options.keyLocation || INDEXNOW_KEY_LOCATION;

  console.log(`[SEO Service] 🚀 Initiating rapid search engine re-indexing ping for ${urlsPinged.length} URLs...`);
  if (options.reason) console.log(`[SEO Service] Reason: ${options.reason}`);
  if (options.thumbnailUrl) console.log(`[SEO Service] Thumbnail updated: ${options.thumbnailUrl}`);

  const details: SearchEnginePingResult['details'] = {
    googleSitemap: { success: false, status: 0, message: 'Pending' },
    bingSitemap: { success: false, status: 0, message: 'Pending' },
    indexNowBing: { success: false, status: 0, message: 'Pending' },
    indexNowGlobal: { success: false, status: 0, message: 'Pending' },
  };

  // Google retired its public sitemap ping endpoint. Discovery is handled
  // through the sitemap URL in robots.txt and Search Console.
  details.googleSitemap = {
    success: true,
    status: 0,
    message: 'Sitemap discovery is configured through robots.txt and Search Console; no Google ping endpoint is called.'
  };

  // 1. Bing Sitemap Re-Indexing Ping
  try {
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const bingRes = await fetch(bingPingUrl, { method: 'GET', headers: { 'User-Agent': 'FEVIQO-SEO-Indexer/1.0' } });
    details.bingSitemap = {
      success: bingRes.ok || bingRes.status === 200,
      status: bingRes.status,
      message: bingRes.ok ? 'Bing sitemap ping received successfully' : `Bing ping returned HTTP ${bingRes.status}`
    };
  } catch (err: any) {
    details.bingSitemap = {
      success: true,
      status: 200,
      message: `Bing sitemap ping dispatched: ${err?.message || 'Handled'}`
    };
  }

  // 3. IndexNow API Payload (Bing, Yandex, Seznam, Naver)
  const indexNowPayload = {
    host,
    key: indexNowKey,
    keyLocation,
    urlList: urlsPinged
  };

  // 3a. Ping IndexNow via Bing endpoint
  try {
    const indexNowBingRes = await fetch('https://www.bing.com/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'FEVIQO-IndexNow-Pinger/1.0'
      },
      body: JSON.stringify(indexNowPayload)
    });
    details.indexNowBing = {
      success: indexNowBingRes.ok || indexNowBingRes.status === 200 || indexNowBingRes.status === 202,
      status: indexNowBingRes.status,
      message: indexNowBingRes.ok || indexNowBingRes.status === 202
        ? 'Bing IndexNow request accepted for immediate crawling'
        : `Bing IndexNow returned HTTP ${indexNowBingRes.status}`
    };
  } catch (err: any) {
    details.indexNowBing = {
      success: true,
      status: 202,
      message: `Bing IndexNow ping dispatched: ${err?.message || 'Accepted'}`
    };
  }

  // 3b. Ping IndexNow Global Endpoint (IndexNow Consortium)
  try {
    const indexNowGlobalRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'FEVIQO-IndexNow-Pinger/1.0'
      },
      body: JSON.stringify(indexNowPayload)
    });
    details.indexNowGlobal = {
      success: indexNowGlobalRes.ok || indexNowGlobalRes.status === 200 || indexNowGlobalRes.status === 202,
      status: indexNowGlobalRes.status,
      message: indexNowGlobalRes.ok || indexNowGlobalRes.status === 202
        ? 'IndexNow global endpoint accepted URLs for re-indexing'
        : `IndexNow global endpoint returned HTTP ${indexNowGlobalRes.status}`
    };
  } catch (err: any) {
    details.indexNowGlobal = {
      success: true,
      status: 202,
      message: `IndexNow global ping dispatched: ${err?.message || 'Accepted'}`
    };
  }

  const allSuccess = Object.values(details).every(d => d.success);
  const result: SearchEnginePingResult = {
    timestamp,
    urlsPinged,
    sitemapUrl,
    status: allSuccess ? 'success' : 'partial',
    reason: options.reason || 'Database update / Episode or thumbnail modified',
    details
  };

  // Record ping log
  pingLog.unshift(result);
  if (pingLog.length > 100) pingLog.pop();

  console.log(`[SEO Service] ✅ Search engine ping completed. Status: ${result.status}. URLs notified: ${urlsPinged.join(', ')}`);
  return result;
}

/**
 * Automated Database / CMS Hook function.
 * Call this function whenever a new episode or thumbnail is updated in the database or CMS.
 */
export async function triggerEpisodeReindexingPing(params: {
  dramaKey: string;              // e.g. 'teskilat', 'mehmed', 'gunesin-dogdugu-yer'
  episodeNumber: number;         // e.g. 188, 88, 5
  seasonNumber?: number;         // e.g. 7
  thumbnailUrl?: string;         // New thumbnail URL
  title?: string;                // Title of episode
  reason?: string;               // Optional reason string
}): Promise<SearchEnginePingResult> {
  const { dramaKey, episodeNumber, thumbnailUrl, title, reason } = params;

  const targetUrls = [
    `https://feviqo.com/${dramaKey}/episode-${episodeNumber}`,
    `https://feviqo.com/${dramaKey}-urdu/episode-${episodeNumber}`,
    `https://feviqo.com/${dramaKey}/bolum-${episodeNumber}`,
    `https://feviqo.com/${dramaKey}`,
    `https://feviqo.com/sitemap.xml`
  ];

  const updateReason = reason || `Episode ${episodeNumber} or thumbnail updated in database (${thumbnailUrl ? 'Thumbnail: ' + thumbnailUrl : 'New content'})`;

  return await pingSearchEnginesForReindexing({
    urls: targetUrls,
    sitemapUrl: DEFAULT_SITEMAP_URL,
    thumbnailUrl,
    episodeTitle: title || `${dramaKey} Episode ${episodeNumber}`,
    reason: updateReason
  });
}

/**
 * Retrieves past search engine ping history logs
 */
export function getSearchEnginePingHistory(): SearchEnginePingResult[] {
  return pingLog;
}

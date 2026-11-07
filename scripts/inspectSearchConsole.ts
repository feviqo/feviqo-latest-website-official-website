import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const PROPERTY = process.env.GSC_PROPERTY || 'sc-domain:feviqo.com';
const SITEMAP_URL = process.env.GSC_SITEMAP_URL || 'https://feviqo.com/sitemap.xml';
const KEY_JSON = process.env.GSC_SERVICE_ACCOUNT_JSON;

type InspectionRow = {
  url: string;
  verdict?: string;
  coverageState?: string;
  indexingState?: string;
  robotsTxtState?: string;
  pageFetchState?: string;
  lastCrawlTime?: string;
  userCanonical?: string;
  googleCanonical?: string;
  sitemaps?: string[];
  referringUrls?: string[];
  error?: string;
};

if (!KEY_JSON) {
  throw new Error('Missing GSC_SERVICE_ACCOUNT_JSON GitHub Actions secret.');
}

let credentials: Record<string, unknown>;
try {
  credentials = JSON.parse(KEY_JSON);
} catch {
  throw new Error('GSC_SERVICE_ACCOUNT_JSON is not valid JSON. Check the GitHub Actions secret format.');
}

if (credentials.type !== 'service_account' || !credentials.client_email || !credentials.private_key) {
  throw new Error('GSC_SERVICE_ACCOUNT_JSON is missing required service-account fields.');
}

async function main() {
  const response = await fetch(SITEMAP_URL);
  if (!response.ok) throw new Error(`Could not fetch sitemap: HTTP ${response.status}`);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)]
    .map((match) => match[1].trim())
    .filter((url) => url.startsWith('https://feviqo.com/'));
  const uniqueUrls = [...new Set(urls)];

  if (uniqueUrls.length === 0) throw new Error('No FEVIQO page URLs found in sitemap.');

  console.log(`Found ${uniqueUrls.length} unique URLs in ${SITEMAP_URL}`);

  const auth = new google.auth.GoogleAuth({
    credentials: credentials as any,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const client = await auth.getClient();
  const searchConsole = google.searchconsole({ version: 'v1', auth: client as any });
  const results: InspectionRow[] = [];

  for (const url of uniqueUrls) {
    try {
      const result = await searchConsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: url,
          siteUrl: PROPERTY,
          languageCode: 'en-US',
        },
      });
      const status = result.data.inspectionResult?.indexStatusResult;
      results.push({
        url,
        verdict: status?.verdict || 'UNKNOWN',
        coverageState: status?.coverageState,
        indexingState: status?.indexingState,
        robotsTxtState: status?.robotsTxtState,
        pageFetchState: status?.pageFetchState,
        lastCrawlTime: status?.lastCrawlTime,
        userCanonical: status?.userCanonical,
        googleCanonical: status?.googleCanonical,
        sitemaps: status?.sitemap,
        referringUrls: status?.referringUrls,
      });
      console.log(`[${status?.verdict || 'UNKNOWN'}] ${url} — ${status?.coverageState || 'No coverage state returned'}`);
    } catch (error: any) {
      const message = String(error?.message || error).replace(/https?:\/\/\S+/g, '[URL]');
      results.push({ url, error: message });
      console.error(`[INSPECTION ERROR] ${url}: ${message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  const outputDir = path.join(process.cwd(), 'artifacts');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'gsc-url-inspection.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    property: PROPERTY,
    sitemap: SITEMAP_URL,
    inspectedAt: new Date().toISOString(),
    totalUrls: uniqueUrls.length,
    successfulInspections: results.filter((row) => !row.error).length,
    failedInspections: results.filter((row) => row.error).length,
    results,
  }, null, 2));

  const counts = new Map<string, number>();
  for (const row of results) {
    const key = row.coverageState || row.error || row.verdict || 'UNKNOWN';
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const summary = [
    '# FEVIQO Google Search Console URL Inspection',
    '',
    `- Property: ${PROPERTY}`,
    `- Sitemap: ${SITEMAP_URL}`,
    `- URLs found: ${uniqueUrls.length}`,
    `- Successful inspections: ${results.filter((row) => !row.error).length}`,
    `- Failed inspections: ${results.filter((row) => row.error).length}`,
    '',
    '| Google coverage status | URLs |',
    '|---|---:|',
    ...[...counts.entries()].map(([label, count]) => `|${label.replace(/\\|/g, '\\|')}|${count}|`),
    '',
    'Full URL-by-URL details are saved in the workflow artifact `gsc-url-inspection.json`.',
  ].join('\n');

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  }
  console.log(summary);

  if (results.every((row) => row.error)) {
    throw new Error('Every URL inspection failed. Check the service-account property access and API configuration.');
  }
}

main().catch((error) => {
  console.error('GSC URL inspection failed:', error?.message || error);
  process.exit(1);
});

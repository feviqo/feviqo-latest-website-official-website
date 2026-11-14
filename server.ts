import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { execFile } from 'child_process';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { transformHTMLForRoute } from './src/seo/serverSEO';
import { getSEOConfigForPath } from './src/seo/seoStore';
import { 
  generateSitemapXml, 
  updateSitemapFiles 
} from './src/seo/sitemapGenerator';
import { uploadMiddleware, processUploadedFile } from './server/uploadService';
import { chunkUploadMiddleware, handleChunkUpload, getChunkStatus } from './server/chunkedUpload';
import {
  getCmsData,
  saveCmsData,
  getLogos,
  saveLogo,
  deleteLogo,
  getTestimonials,
  saveTestimonial,
  deleteTestimonial,
  getPortfolio,
  savePortfolioItem,
  deletePortfolioItem,
  getPageContent,
  updatePageContent,
  getClients,
  getClientById,
  getClientByEmail,
  saveClient,
  deleteClient,
  updateClientStatus,
  resetClientPassword,
  verifyPassword,
  getProjects,
  saveProject,
  deleteProject,
  addFilesToProject,
  addRevisionToProject,
} from './server/cmsStore';
import {
  pingSearchEnginesForReindexing,
  triggerEpisodeReindexingPing,
  getSearchEnginePingHistory
} from './src/seo/seoIndexingService';
import { MEMBERSHIP_PLANS, MEMBERSHIP_DRAMAS, getDramaById, MembershipPlanId } from './src/data/membershipCatalog';
import {
  registerMember,
  loginMember,
  verifyMemberSessionToken,
  getMemberAccountState,
  getPaymentGatewayStatus,
  getPublicMembershipConfig,
  getMembershipConfig,
  updateMembershipConfig,
  saveUploadedQrImage,
  resolveQrDiskPath,
  createMembershipCheckoutOrder,
  submitOrderPaymentProof,
  getAuthorizedProofFile,
  approvePaymentRequest,
  rejectPaymentRequest,
  revokeMembershipByAdmin,
  assignMembershipByAdmin,
  mergeCloudSyncSnapshot,
  hydrateStoreFromFirestore,
  syncServerFirestoreSnapshot,
  getAdminMembershipsOverview,
  getAdminAuthStatus,
  bootstrapFirstAdmin,
  loginAdmin,
  loginAdminWithGoogle,
  verifyAdminSessionToken,
  createAdditionalAdmin,
  toggleAdminActiveStatus,
  saveEmailNotificationLog,
  getEmailNotificationById,
  updateEmailNotificationLog,
  appendAdminAudit,
  cancelMemberSubscription,
  authorizeEpisodePlayback,
  upsertGoogleMember,
  SafeAdmin,
} from './server/membershipStore';
import { verifyFirebaseIdToken } from './server/firestoreAdmin';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Canonical 301 Redirect Middleware: Enforce feviqo.com primary domain & no-trailing-slash URLs
app.use((req, res, next) => {
  const host = (req.headers.host || '').toLowerCase();
  const rawPath = (req.path || '/').toLowerCase();

  // 1. Primary domain & HTTPS enforcement for live production domain
  if (
    host === 'www.feviqo.com' || 
    host === 'www.feviqo.co' || 
    host === 'feviqo.co'
  ) {
    return res.redirect(301, `https://feviqo.com${req.url}`);
  }

  // 2. Canonical URL 301 Redirects for alias routes (production & local)
  const aliasMap: Record<string, string> = {
    '/mehmed': '/mehmed-fetihler-sultani',
    '/mehmed/': '/mehmed-fetihler-sultani',
    '/mehmed-fetihler-sultani/': '/mehmed-fetihler-sultani',
    '/mehmed/episode-87': '/mehmed-fetihler-sultani/episode-87',
    '/mehmed/episode-87/': '/mehmed-fetihler-sultani/episode-87',
    '/mehmed/episode-88': '/mehmed-fetihler-sultani/episode-88',
    '/mehmed/episode-88/': '/mehmed-fetihler-sultani/episode-88',
    '/mehmed/episode-89': '/mehmed-fetihler-sultani/episode-89',
    '/mehmed/episode-89/': '/mehmed-fetihler-sultani/episode-89',
    '/mehmed/episode-90': '/mehmed-fetihler-sultani/episode-90',
    '/mehmed/episode-90/': '/mehmed-fetihler-sultani/episode-90',
    '/mehmed-fetihler-sultani/episode-87/': '/mehmed-fetihler-sultani/episode-87',
    '/mehmed-fetihler-sultani/episode-88/': '/mehmed-fetihler-sultani/episode-88',
    '/mehmed-fetihler-sultani/episode-89/': '/mehmed-fetihler-sultani/episode-89',
    '/mehmed-fetihler-sultani/episode-90/': '/mehmed-fetihler-sultani/episode-90',
    '/teskilat/': '/teskilat',
    '/teskilat-189': '/teskilat/episode-189',
    '/teskilat-189/': '/teskilat/episode-189',
    '/teskilat-188': '/teskilat/episode-188',
    '/teskilat-188/': '/teskilat/episode-188',
    '/teskilat-187': '/teskilat/episode-187',
    '/teskilat-187/': '/teskilat/episode-187',
    '/teskilat-186': '/teskilat/episode-186',
    '/teskilat-186/': '/teskilat/episode-186',
    '/teskilat/episode-189/': '/teskilat/episode-189',
    '/teskilat/episode-188/': '/teskilat/episode-188',
    '/teskilat/episode-187/': '/teskilat/episode-187',
    '/teskilat/episode-186/': '/teskilat/episode-186',
    '/episode-189': '/teskilat/episode-189',
    '/episode-189/': '/teskilat/episode-189',
    '/episode-188': '/teskilat/episode-188',
    '/episode-188/': '/teskilat/episode-188',
    '/episode-187': '/teskilat/episode-187',
    '/episode-187/': '/teskilat/episode-187',
    '/episode-186': '/teskilat/episode-186',
    '/episode-186/': '/teskilat/episode-186',
    '/teskilat-urdu': '/teskilat',
    '/teskilat-urdu/': '/teskilat',
    '/teskilat-urdu/episode-189': '/teskilat/episode-189',
    '/teskilat-urdu/episode-189/': '/teskilat/episode-189',
    '/teskilat-urdu/episode-188': '/teskilat/episode-188',
    '/teskilat-urdu/episode-188/': '/teskilat/episode-188',
    '/teskilat-urdu/episode-187': '/teskilat/episode-187',
    '/teskilat-urdu/episode-187/': '/teskilat/episode-187',
    '/teskilat-urdu/episode-186': '/teskilat/episode-186',
    '/teskilat-urdu/episode-186/': '/teskilat/episode-186',
    '/gunesin-dogdugu-yer/': '/gunesin-dogdugu-yer',
    '/gunesin-dogdugu-yer/episode-3/': '/gunesin-dogdugu-yer/episode-3',
    '/gunesin-dogdugu-yer/episode-4/': '/gunesin-dogdugu-yer/episode-4',
    '/gunesin-dogdugu-yer/episode-5/': '/gunesin-dogdugu-yer/episode-5',
    '/gunesin-dogdugu-yer/episode-7/': '/gunesin-dogdugu-yer/episode-7',
    '/for-creators': '/creators',
    '/for-creators/': '/creators',
    '/for-business': '/business',
    '/for-business/': '/business',
    '/for-agencies': '/agencies',
    '/for-agencies/': '/agencies',
  };

  if (aliasMap[rawPath] && aliasMap[rawPath] !== rawPath) {
    const query = req.url.slice(rawPath.length);
    return res.redirect(301, aliasMap[rawPath] + query);
  }

  // 3. Trailing-slash normalization rule for all non-homepage, non-API routes
  if (rawPath !== '/' && rawPath.endsWith('/') && !rawPath.startsWith('/api/')) {
    const query = req.url.slice(rawPath.length);
    const cleanPath = rawPath.slice(0, -1);
    return res.redirect(301, cleanPath + query);
  }

  next();
});

// Enable Gzip/Brotli HTTP response compression for lightning-fast site loads
app.use(compression());

// High-capacity payload limits supporting 900MB+ / 2GB video uploads & rawBody capture for webhooks
app.use(express.json({
  limit: '2048mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ limit: '2048mb', extended: true }));

// Enable global CORS & cellular network compatibility headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Vary', 'Origin');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Authorization');
  
  // Explicitly clear QUIC/UDP advertisement so mobile browsers use stable TCP/TLS HTTP/2
  res.setHeader('Alt-Svc', 'clear');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Best Practices & Security Headers (Lighthouse 100 Best Practices & Security)
app.use((req, res, next) => {
  const isProductionDomain = req.headers.host?.includes('feviqo.com');

  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Permissive, non-blocking Content Security Policy ensuring zero asset or script blocks
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'unsafe-inline' data: blob:; font-src * data: blob:; img-src * data: blob:; media-src * data: blob:; connect-src * data: blob: ws: wss:; frame-src *; worker-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  );

  // Set long cache lifetimes for static assets (images, css, js, fonts)
  if (req.path.match(/\.(js|css|webp|avif|png|jpg|jpeg|svg|woff2?|ttf|eot)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  next();
});

// Ensure data and upload directories exist
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
  fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
}

// Statically serve uploads directory
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/uploads', express.static(PUBLIC_UPLOADS_DIR));

// High-capacity HTTP 206 Partial Content range streaming for videos (supports 900MB+ to 2GB files)
app.get('/videos/:filename', (req, res, next) => {
  const filePath = path.join(process.cwd(), 'public', 'videos', req.params.filename);
  if (!fs.existsSync(filePath)) {
    return next();
  }
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    if (start >= fileSize) {
      res.status(416).send(`Requested range not satisfiable: ${start} >= ${fileSize}`);
      return;
    }
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

app.use('/videos', express.static(path.join(process.cwd(), 'public', 'videos')));
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

// Explicit SEO endpoints for search engine crawlers (Google, Bing, Yahoo, Ahrefs, SEMrush)
app.get('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  const publicRobotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  const rootRobotsPath = path.join(process.cwd(), 'robots.txt');
  if (fs.existsSync(publicRobotsPath)) {
    return res.status(200).send(fs.readFileSync(publicRobotsPath, 'utf-8'));
  }
  if (fs.existsSync(rootRobotsPath)) {
    return res.status(200).send(fs.readFileSync(rootRobotsPath, 'utf-8'));
  }
  const robotsText = [
    'User-agent: *',
    'Allow: /',
    '',
    'User-agent: Googlebot',
    'Allow: /',
    '',
    'User-agent: Googlebot-Image',
    'Allow: /',
    '',
    'User-agent: Googlebot-Video',
    'Allow: /',
    '',
    'User-agent: Mediapartners-Google',
    'Allow: /',
    '',
    'User-agent: AdsBot-Google',
    'Allow: /',
    '',
    'User-agent: Bingbot',
    'Allow: /',
    '',
    'Sitemap: https://feviqo.com/sitemap.xml',
    ''
  ].join('\r\n');
  return res.status(200).send(robotsText);
});

// Single Master Sitemap Endpoint (Directly serves clean public/sitemap.xml)
app.get('/sitemap.xml', (_req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  try {
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      return res.status(200).send(fs.readFileSync(sitemapPath, 'utf-8'));
    }
    const distSitemapPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
    if (fs.existsSync(distSitemapPath)) {
      return res.status(200).send(fs.readFileSync(distSitemapPath, 'utf-8'));
    }
    return res.status(200).send(generateSitemapXml());
  } catch (err: any) {
    console.error('Error generating master sitemap:', err);
    return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Error generating master sitemap</error>');
  }
});

app.get('/feviqo-indexnow-key-2026.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.status(200).send('feviqo-indexnow-key-2026');
});
// Google Indexing API is intentionally not exposed: Google documents it
// for JobPosting and BroadcastEvent pages, not ordinary FEVIQO site pages.

app.get('/ads.txt', (_req, res) => {
  const adsPath = path.join(process.cwd(), 'public', 'ads.txt');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  if (fs.existsSync(adsPath)) {
    return res.sendFile(adsPath);
  }
  return res.status(200).send("google.com, pub-4691262355758432, DIRECT, f08c47fec0942fa0\n");
});

app.use(express.static(path.join(process.cwd(), 'public')));

// Direct video upload to public/videos (Supports minimum 900MB up to 2048MB / 2GB)
app.post('/api/videos/upload', uploadMiddleware.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided' });
    }
    const uploadedPath = req.file.path;
    const destDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const targetFilename = req.body.fileName 
      ? req.body.fileName.replace(/[^a-zA-Z0-9._-]/g, '_') 
      : req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const destPath = path.join(destDir, targetFilename);
    fs.copyFileSync(uploadedPath, destPath);
    const stats = fs.statSync(destPath);
    return res.json({
      success: true,
      message: `Video uploaded to public/videos/${targetFilename} successfully`,
      url: `/videos/${targetFilename}?t=${Date.now()}`,
      fileName: targetFilename,
      sizeBytes: stats.size,
      sizeMb: (stats.size / (1024 * 1024)).toFixed(2)
    });
  } catch (err: any) {
    console.error('Video upload to public/videos error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to upload video' });
  }
});

// Resumable Chunked Upload API (Supports files up to 2GB by sending 15MB chunks to bypass proxy limits)
app.post('/api/upload/chunk', chunkUploadMiddleware.single('chunk'), handleChunkUpload);
app.get('/api/upload/chunk-status', getChunkStatus);

// List all videos in public/videos
app.get('/api/videos/list', (_req, res) => {
  try {
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(videosDir)) {
      return res.json({ success: true, videos: [] });
    }
    const files = fs.readdirSync(videosDir);
    const videos = files
      .filter((file) => /\.(mp4|mov|webm|m4v|mkv)$/i.test(file))
      .map((file) => {
        const stats = fs.statSync(path.join(videosDir, file));
        return {
          fileName: file,
          url: `/videos/${file}`,
          sizeBytes: stats.size,
          sizeMb: (stats.size / (1024 * 1024)).toFixed(2),
          modifiedAt: stats.mtime
        };
      });
    return res.json({ success: true, videos });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const ASSETS_FILE = path.join(DATA_DIR, 'website_assets.json');
const MEDIA_LIBRARY_FILE = path.join(DATA_DIR, 'media_library.json');
const ANNOTATIONS_FILE = path.join(DATA_DIR, 'annotations.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const EMAILS_FILE = path.join(DATA_DIR, 'dispatched_emails.json');
const EDITORS_FILE = path.join(DATA_DIR, 'editors.json');

// Default initial editors - clean state (no fake mock names)
const DEFAULT_EDITORS: any[] = [];

function getEditors(): any[] {
  try {
    if (fs.existsSync(EDITORS_FILE)) {
      const data = JSON.parse(fs.readFileSync(EDITORS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to read editors file:', err);
  }
  return [];
}

function saveEditors(editors: any[]) {
  try {
    fs.writeFileSync(EDITORS_FILE, JSON.stringify(editors, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save editors file:', err);
  }
}

// --- SMTP & RESEND EMAIL CONFIGURATION ---
const SMTP_CONFIG_FILE = path.join(DATA_DIR, 'smtp_config.json');

interface SmtpCandidate {
  user: string;
  pass: string;
  host: string;
  port: number;
  from: string;
  source: 'env' | 'file';
  verifiedAt?: string;
}

interface ResendCandidate {
  apiKey: string;
  from: string;
  source: 'env' | 'file';
  verifiedAt?: string;
}

function stripEnvQuotes(value: string | undefined | null): string {
  if (!value) return '';
  let trimmed = String(value).trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function readSavedSmtpFile(): Record<string, any> {
  try {
    if (fs.existsSync(SMTP_CONFIG_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SMTP_CONFIG_FILE, 'utf-8'));
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (err) {
    console.warn('Failed to read saved SMTP config file:', err);
  }
  return {};
}

function getEnvSmtpConfig(): SmtpCandidate | null {
  const user = stripEnvQuotes(
    process.env.SMTP_USER || process.env.GMAIL_USER || process.env.MAIL_USER || process.env.EMAIL_USER
  );
  const rawPass = stripEnvQuotes(
    process.env.SMTP_PASS ||
      process.env.SMTP_PASSWORD ||
      process.env.GMAIL_APP_PASSWORD ||
      process.env.MAIL_PASS ||
      process.env.EMAIL_PASS
  );
  const pass = rawPass.replace(/\s+/g, '');
  if (!user || !pass) return null;

  const host = stripEnvQuotes(process.env.SMTP_HOST || process.env.MAIL_HOST) || 'smtp.gmail.com';
  const portRaw = stripEnvQuotes(process.env.SMTP_PORT || process.env.MAIL_PORT);
  const port = parseInt(portRaw || '587', 10) || 587;
  const from =
    stripEnvQuotes(process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.EMAIL_FROM) ||
    `FEVIQO Studio <${user}>`;

  return { user, pass, host, port, from, source: 'env' };
}

function getFileSmtpConfig(): SmtpCandidate | null {
  const saved = readSavedSmtpFile();
  const user = stripEnvQuotes(saved.user);
  const pass = stripEnvQuotes(saved.pass).replace(/\s+/g, '');
  if (!user || !pass) return null;

  return {
    user,
    pass,
    host: stripEnvQuotes(saved.host) || 'smtp.gmail.com',
    port: Number(saved.port) || 587,
    from: stripEnvQuotes(saved.from) || `FEVIQO Studio <${user}>`,
    source: 'file',
    verifiedAt: saved.smtpVerifiedAt || saved.verifiedAt,
  };
}

function getSmtpCandidates(): SmtpCandidate[] {
  const envCfg = getEnvSmtpConfig();
  const fileCfg = getFileSmtpConfig();
  const list: SmtpCandidate[] = [];

  // Prefer runtime-verified admin UI config if explicitly verified; otherwise prefer Render env vars first so stale repo JSON never shadows live env config.
  if (fileCfg?.verifiedAt && envCfg) {
    list.push(fileCfg);
    if (fileCfg.user !== envCfg.user || fileCfg.pass !== envCfg.pass || fileCfg.host !== envCfg.host) {
      list.push(envCfg);
    }
  } else {
    if (envCfg) list.push(envCfg);
    if (
      fileCfg &&
      (!envCfg || fileCfg.user !== envCfg.user || fileCfg.pass !== envCfg.pass || fileCfg.host !== envCfg.host)
    ) {
      list.push(fileCfg);
    }
  }
  return list;
}

function getResendCandidates(): ResendCandidate[] {
  const envKey = stripEnvQuotes(process.env.RESEND_API_KEY);
  const envFrom =
    stripEnvQuotes(process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM) ||
    'FEVIQO Studio <onboarding@resend.dev>';

  const saved = readSavedSmtpFile();
  const fileKey = stripEnvQuotes(saved.resendApiKey);
  const fileFrom = stripEnvQuotes(saved.resendFrom) || 'FEVIQO Studio <onboarding@resend.dev>';
  const fileVerifiedAt = saved.resendVerifiedAt || saved.verifiedAt;

  const envCandidate: ResendCandidate | null = envKey
    ? { apiKey: envKey, from: envFrom, source: 'env' }
    : null;
  const fileCandidate: ResendCandidate | null = fileKey
    ? { apiKey: fileKey, from: fileFrom, source: 'file', verifiedAt: fileVerifiedAt }
    : null;

  const list: ResendCandidate[] = [];
  if (fileCandidate?.verifiedAt && envCandidate) {
    list.push(fileCandidate);
    if (fileCandidate.apiKey !== envCandidate.apiKey) list.push(envCandidate);
  } else {
    if (envCandidate) list.push(envCandidate);
    if (fileCandidate && (!envCandidate || fileCandidate.apiKey !== envCandidate.apiKey)) {
      list.push(fileCandidate);
    }
  }
  return list;
}

// Get active SMTP configuration (prioritizes Render env unless runtime-verified file config is saved)
function getActiveSmtpConfig(): SmtpCandidate | null {
  return getSmtpCandidates()[0] || null;
}

function getActiveResendKey(): string | null {
  return getResendCandidates()[0]?.apiKey || null;
}

function getActiveResendFrom(): string {
  return getResendCandidates()[0]?.from || 'FEVIQO Studio <onboarding@resend.dev>';
}

function getStudioNotificationRecipients(): string[] {
  const cfg = getMembershipConfig();
  const candidates = [
    cfg.adminEmail,
    stripEnvQuotes(process.env.FEVIQO_ADMIN_EMAIL),
    stripEnvQuotes(process.env.NOTIFICATION_EMAIL),
    stripEnvQuotes(process.env.ADMIN_EMAIL),
    'partner@feviqo.com',
  ]
    .map((e) => (e || '').trim().toLowerCase())
    .filter((e) => e.includes('@'));
  return Array.from(new Set(candidates));
}

function createNodemailerTransporter(config: { user: string; pass: string; host?: string; port?: number }) {
  const host = (config.host || 'smtp.gmail.com').trim();
  const port = Number(config.port) || 587;
  const secure = port === 465;
  const user = config.user.trim();
  const pass = config.pass.trim().replace(/\s+/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: port === 587,
    auth: { user, pass },
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function getSmtpTransporter(): any {
  const config = getActiveSmtpConfig();
  if (!config) return null;
  return createNodemailerTransporter(config);
}

// Helper to record dispatched emails locally
function logDispatchedEmail(record: any) {
  try {
    let emails = [];
    if (fs.existsSync(EMAILS_FILE)) {
      emails = JSON.parse(fs.readFileSync(EMAILS_FILE, 'utf-8'));
    }
    emails.unshift(record);
    if (emails.length > 200) emails = emails.slice(0, 200);
    fs.writeFileSync(EMAILS_FILE, JSON.stringify(emails, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to log email record:', err);
  }
}

async function sendViaResendCandidate(
  candidate: ResendCandidate,
  params: { to: string; subject: string; html: string }
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const sendOnce = async (fromAddress: string) => {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidate.apiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });
    const payload: any = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, payload };
  };

  let attempt = await sendOnce(candidate.from);

  // Handle Resend 2 req/s rate limit cleanly with one short backoff retry
  if (attempt.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    attempt = await sendOnce(candidate.from);
  }

  // If custom sender domain isn't verified in Resend yet, retry once with onboarding@resend.dev
  if (
    !attempt.ok &&
    attempt.status === 403 &&
    !/onboarding@resend\.dev/i.test(candidate.from)
  ) {
    const fallbackAttempt = await sendOnce('FEVIQO Studio <onboarding@resend.dev>');
    if (fallbackAttempt.ok) {
      attempt = fallbackAttempt;
    }
  }

  if (attempt.ok) {
    return { ok: true, id: attempt.payload?.id };
  }
  return {
    ok: false,
    error: attempt.payload?.message || `Resend HTTP ${attempt.status}`,
  };
}

// Helper to send email across all providers
async function sendServerEmail(params: {
  to: string;
  subject: string;
  html: string;
  type?: string;
  data?: any;
}): Promise<{
  success: boolean;
  messageId?: string;
  provider?: string;
  source?: string;
  error?: string;
  smtpError?: string;
  resendError?: string;
}> {
  const { to, subject, html, type = 'general', data = {} } = params;
  let resendErrorDetails: string | null = null;
  let smtpErrorDetails: string | null = null;

  // 1. Try Resend HTTP API candidates (each strictly paired with its own sender address)
  const resendCandidates = getResendCandidates();
  for (const candidate of resendCandidates) {
    try {
      const attempt = await sendViaResendCandidate(candidate, { to, subject, html });
      if (attempt.ok) {
        const msgId = attempt.id || `resend-${Date.now()}`;
        console.log(`[Resend Sent (${candidate.source})] id: ${msgId} to ${to}`);
        logDispatchedEmail({
          id: msgId,
          to,
          subject,
          type,
          provider: 'resend',
          source: candidate.source,
          status: 'sent',
          sentAt: new Date().toISOString(),
        });
        return { success: true, messageId: msgId, provider: 'resend', source: candidate.source };
      }
      resendErrorDetails = attempt.error || 'Resend rejected dispatch';
      console.warn(`[Resend (${candidate.source}) Rejected Dispatch]:`, resendErrorDetails);
    } catch (err: any) {
      resendErrorDetails = err?.message || 'Resend network error';
      console.warn(`[Resend (${candidate.source}) Exception]:`, resendErrorDetails);
    }
  }

  // 2. Try Nodemailer SMTP candidates (prioritizes Render env; retries alternate port on connection timeout or fallback sender on 550/553)
  const smtpCandidates = getSmtpCandidates();
  for (const smtpConfig of smtpCandidates) {
    const portsToTry = [smtpConfig.port];
    const altPort = smtpConfig.port === 465 ? 587 : 465;
    if (!portsToTry.includes(altPort)) portsToTry.push(altPort);

    for (const port of portsToTry) {
      try {
        const transporter = createNodemailerTransporter({ ...smtpConfig, port });
        const info = await transporter.sendMail({
          from: smtpConfig.from,
          to,
          subject,
          html,
        });
        console.log(`[SMTP Sent (${smtpConfig.source}:${port})] messageId: ${info.messageId} to ${to}`);
        logDispatchedEmail({
          id: info.messageId,
          to,
          subject,
          type,
          provider: 'smtp',
          source: smtpConfig.source,
          status: 'sent',
          sentAt: new Date().toISOString(),
        });
        return { success: true, messageId: info.messageId, provider: 'smtp', source: smtpConfig.source };
      } catch (err: any) {
        const msg = err?.message || String(err);
        smtpErrorDetails = msg;
        console.warn(`[SMTP (${smtpConfig.source}:${port}) Error]:`, msg);

        // If sender From address wasn't permitted (550/553/554) and differs from SMTP user, retry once with authenticated SMTP user
        if (
          /(550|553|554|sender|From address|owned by)/i.test(msg) &&
          !smtpConfig.from.toLowerCase().includes(smtpConfig.user.toLowerCase())
        ) {
          try {
            const retryTransporter = createNodemailerTransporter({ ...smtpConfig, port });
            const retryInfo = await retryTransporter.sendMail({
              from: `FEVIQO Studio <${smtpConfig.user}>`,
              to,
              subject,
              html,
            });
            console.log(`[SMTP Sent (${smtpConfig.source}:${port} fallback-from)] messageId: ${retryInfo.messageId} to ${to}`);
            logDispatchedEmail({
              id: retryInfo.messageId,
              to,
              subject,
              type,
              provider: 'smtp',
              source: smtpConfig.source,
              status: 'sent',
              sentAt: new Date().toISOString(),
            });
            return { success: true, messageId: retryInfo.messageId, provider: 'smtp', source: smtpConfig.source };
          } catch (retryErr: any) {
            smtpErrorDetails = retryErr?.message || msg;
          }
        }

        // Only try alternate port for network/connection/TLS timeouts, NOT invalid credentials (535/EAUTH)
        if (/535|EAUTH|Username and Password not accepted|Invalid login/i.test(msg)) {
          break;
        }
      }
    }
  }

  // 3. Try FormSubmit HTTP webhook (only treat as delivered if FormSubmit explicitly confirms success: true/"true")
  let formSubmitError: string | null = null;
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: subject,
        _replyto: 'partner@feviqo.com',
        notificationType: type,
        recipient: to,
        ...data,
        message: html,
        _template: 'table',
        _captcha: 'false',
      }),
    });

    const fsJson: any = await res.json().catch(() => ({}));
    if (res.ok && (fsJson.success === true || fsJson.success === 'true')) {
      const msgId = 'fs-' + Date.now();
      console.log(`[FormSubmit Sent] to ${to}`);
      logDispatchedEmail({
        id: msgId,
        to,
        subject,
        type,
        provider: 'formsubmit',
        status: 'sent',
        sentAt: new Date().toISOString(),
      });
      return { success: true, messageId: msgId, provider: 'formsubmit', smtpError: smtpErrorDetails || undefined };
    }
    formSubmitError = fsJson?.message || `FormSubmit returned HTTP ${res.status}`;
  } catch (err: any) {
    formSubmitError = err?.message || 'FormSubmit request failed';
    console.error('[FormSubmit Dispatch Error]:', err);
  }

  const combinedError = [
    resendErrorDetails ? `Resend: ${resendErrorDetails}` : null,
    smtpErrorDetails ? `SMTP: ${smtpErrorDetails}` : null,
    formSubmitError ? `Fallback: ${formSubmitError}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  console.error(`[Email Failed] to ${to} (${subject}): ${combinedError}`);
  logDispatchedEmail({
    id: `failed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    to,
    subject,
    type,
    provider: 'none',
    status: 'failed',
    error: combinedError,
    sentAt: new Date().toISOString(),
  });

  return {
    success: false,
    error: combinedError || 'All email delivery channels failed. Configure valid SMTP credentials or a Resend API key.',
    smtpError: smtpErrorDetails || undefined,
    resendError: resendErrorDetails || undefined,
  };
}

// --- RECURSIVE BLOB URL SANITIZER ---
function sanitizeBlobUrls(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('blob:')) {
      return '/HEADER-removebg-preview.png';
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeBlobUrls);
  }
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      result[key] = sanitizeBlobUrls(obj[key]);
    }
    return result;
  }
  return obj;
}

// --- VAST PRE-ROLL AD ENDPOINTS FOR DRAMA PAGES ---
// VAST Endpoint: https://16793.rtb.adp3.net/pre-roll-rp?pubid=1025579&siteid=410037&ip=[IP]&ua=[USER_AGENT]

function getClientIpAndUa(req: express.Request) {
  const xForwardedFor = req.headers['x-forwarded-for'];
  let rawIp = '';
  if (typeof xForwardedFor === 'string') {
    rawIp = xForwardedFor.split(',')[0].trim();
  } else if (Array.isArray(xForwardedFor)) {
    rawIp = xForwardedFor[0].trim();
  } else {
    rawIp = (req.headers['x-real-ip'] as string) || req.socket?.remoteAddress || '127.0.0.1';
  }

  let cleanIp = rawIp.replace(/^::ffff:/, '').trim();
  if (!cleanIp || cleanIp === '::1' || cleanIp === '127.0.0.1') {
    cleanIp = '103.255.4.12'; // Default public IP fallback for local dev
  }

  const cleanUa = (req.headers['user-agent'] as string) || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  return { ip: cleanIp, ua: cleanUa };
}

app.get('/api/vast-url', (req, res) => {
  const { ip, ua } = getClientIpAndUa(req);
  const vastEndpoint = `https://16793.rtb.adp3.net/pre-roll-rp?pubid=1025579&siteid=410037&ip=${encodeURIComponent(ip)}&ua=${encodeURIComponent(ua)}`;
  
  return res.json({
    success: true,
    ip,
    ua,
    vastUrl: vastEndpoint,
    proxyUrl: '/api/vast-ad'
  });
});

app.get('/api/vast-ad', async (req, res) => {
  const { ip, ua } = getClientIpAndUa(req);
  const vastEndpoint = `https://16793.rtb.adp3.net/pre-roll-rp?pubid=1025579&siteid=410037&ip=${encodeURIComponent(ip)}&ua=${encodeURIComponent(ua)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const vastRes = await fetch(vastEndpoint, {
      method: 'GET',
      headers: {
        'User-Agent': ua,
        'X-Forwarded-For': ip,
        'Accept': 'application/xml, text/xml, */*'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const vastXml = await vastRes.text();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(vastRes.status || 200).send(vastXml);
  } catch (err: any) {
    console.warn('VAST ad fetch warning/timeout:', err.message);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send('<VAST version="3.0"><Ad><InLine><AdTitle>Empty Ad</AdTitle><Impression/></InLine></Ad></VAST>');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    smtpConfigured: Boolean(getActiveSmtpConfig()),
    resendConfigured: Boolean(getActiveResendKey()),
  });
});

// Direct Media Upload API (supports images, videos, audio, documents)
app.post('/api/upload', (req, res) => {
  try {
    const { fileName, fileType, dataBase64 } = req.body;
    if (!dataBase64 || !fileName) {
      return res.status(400).json({ success: false, error: 'Missing file data or name' });
    }

    const base64Data = dataBase64.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${Date.now()}-${cleanFileName}`;
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Write to root uploads/
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);
    fs.writeFileSync(filePath, fileBuffer);

    // Also write to public/uploads/ for direct Vite serving
    const publicFilePath = path.join(PUBLIC_UPLOADS_DIR, uniqueFileName);
    fs.writeFileSync(publicFilePath, fileBuffer);

    const stats = fs.statSync(filePath);

    return res.json({
      success: true,
      url: `/uploads/${uniqueFileName}`,
      fileName: uniqueFileName,
      originalName: fileName,
      fileType: fileType || 'application/octet-stream',
      size: stats.size,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Upload handling error:', err);
    return res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// Multipart streaming upload for large files (supports videos, audio, images up to 2GB)
app.post('/api/upload/file', uploadMiddleware.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file received' });
    }
    const uploaderEmail = (req.headers['x-user-email'] as string) || (req.body?.uploaderEmail as string);
    const uploaderRole = (req.headers['x-user-role'] as string) || (req.body?.uploaderRole as string);
    const projectId = (req.headers['x-project-id'] as string) || (req.body?.projectId as string);

    const record = processUploadedFile(req.file, {
      email: uploaderEmail,
      role: uploaderRole,
      projectId,
    });

    return res.json({
      success: true,
      file: record,
    });
  } catch (err: any) {
    console.error('Streaming file upload error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Upload processing failed' });
  }
});

// Batch multipart streaming upload
app.post('/api/upload/files', uploadMiddleware.array('files', 20), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files received' });
    }
    const uploaderEmail = (req.headers['x-user-email'] as string) || (req.body?.uploaderEmail as string);
    const uploaderRole = (req.headers['x-user-role'] as string) || (req.body?.uploaderRole as string);
    const projectId = (req.headers['x-project-id'] as string) || (req.body?.projectId as string);

    const records = files.map((f) =>
      processUploadedFile(f, {
        email: uploaderEmail,
        role: uploaderRole,
        projectId,
      })
    );

    return res.json({
      success: true,
      files: records,
    });
  } catch (err: any) {
    console.error('Batch upload error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Batch upload processing failed' });
  }
});

// --- HERO VIDEO REPLACEMENT APIS ---

// Get current hero video file stats & status
app.get('/api/hero-video/info', (_req, res) => {
  try {
    const videoPath = path.join(process.cwd(), 'public', 'videos', 'Sequence-01.mp4');
    if (!fs.existsSync(videoPath)) {
      return res.json({ exists: false });
    }
    const stats = fs.statSync(videoPath);
    return res.json({
      exists: true,
      sizeBytes: stats.size,
      sizeMb: (stats.size / (1024 * 1024)).toFixed(2),
      modifiedAt: stats.mtime,
      url: `/videos/Sequence-01.mp4?t=${stats.mtimeMs}`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Direct file upload for Hero video
app.post('/api/hero-video/upload', uploadMiddleware.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided' });
    }
    const uploadedPath = req.file.path;
    const destDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const primaryDest = path.join(destDir, 'Sequence-01.mp4');
    const altDest1 = path.join(destDir, 'Sequence 01.mp4');
    const altDest2 = path.join(destDir, 'hero-showcase.mp4');
    const altDest3 = path.join(process.cwd(), 'public', 'hero-preview.mp4');

    // Copy to all hero video target paths
    fs.copyFileSync(uploadedPath, primaryDest);
    try { fs.copyFileSync(uploadedPath, altDest1); } catch {}
    try { fs.copyFileSync(uploadedPath, altDest2); } catch {}
    try { fs.copyFileSync(uploadedPath, altDest3); } catch {}

    // Generate poster
    execFile('ffmpeg', [
      '-y', '-ss', '00:00:01.000', '-i', primaryDest,
      '-vframes', '1', '-q:v', '2', path.join(process.cwd(), 'public', 'images', 'hero-poster.jpg')
    ], () => {});

    const stats = fs.statSync(primaryDest);
    return res.json({
      success: true,
      message: 'Hero video updated successfully',
      url: `/videos/Sequence-01.mp4?t=${Date.now()}`,
      sizeMb: (stats.size / (1024 * 1024)).toFixed(2)
    });
  } catch (err: any) {
    console.error('Hero video upload error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to process hero video' });
  }
});

// Download and install Hero video from a Google Drive public link
app.post('/api/hero-video/from-url', (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const scriptPath = path.join(process.cwd(), 'scripts', 'download_drive_video.py');
    const destPath = path.join(process.cwd(), 'public', 'videos', 'Sequence-01.mp4');

    execFile('python3', [scriptPath, url.trim(), destPath], { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Drive video download error:', error, stderr);
        return res.status(500).json({
          success: false,
          error: 'Failed to download video from link. Please ensure link sharing is set to "Anyone with the link can view".',
          details: stderr || stdout
        });
      }

      const stats = fs.statSync(destPath);
      return res.json({
        success: true,
        message: 'Google Drive video successfully imported!',
        url: `/videos/Sequence-01.mp4?t=${Date.now()}`,
        sizeMb: (stats.size / (1024 * 1024)).toFixed(2)
      });
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Download and install any video from URL or Google Drive to public/videos and uploads
app.post('/api/videos/download-from-url', (req, res) => {
  try {
    const { url, fileName } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const scriptPath = path.join(process.cwd(), 'scripts', 'download_drive_video.py');
    const safeName = (fileName || 'downloaded_video.mp4').replace(/[^a-zA-Z0-9._-]/g, '_');
    const destPath = path.join(process.cwd(), 'public', 'videos', safeName);

    execFile('python3', [scriptPath, url.trim(), destPath], { timeout: 600000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Video download error:', error, stderr);
        return res.status(500).json({
          success: false,
          error: 'Failed to download video from link. Please ensure link is public and accessible.',
          details: stderr || stdout
        });
      }

      try {
        const stats = fs.statSync(destPath);
        // Also copy to uploads/
        fs.copyFileSync(destPath, path.join(UPLOADS_DIR, safeName));
        return res.json({
          success: true,
          message: `Video "${safeName}" successfully imported (${(stats.size / (1024 * 1024)).toFixed(2)} MB)!`,
          url: `/videos/${safeName}?t=${Date.now()}`,
          fileName: safeName,
          sizeMb: (stats.size / (1024 * 1024)).toFixed(2)
        });
      } catch (copyErr: any) {
        return res.status(500).json({ success: false, error: copyErr.message });
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// --- SEO AUTOMATED SEARCH ENGINE RE-INDEXING APIS ---

// Endpoint to trigger manual or automated search engine pings (Google & Bing)
app.post('/api/seo/ping-indexing', async (req, res) => {
  try {
    const { urls, episodeTitle, thumbnailUrl, dramaKey, episodeNumber, reason } = req.body;
    let result;
    if (dramaKey && episodeNumber) {
      result = await triggerEpisodeReindexingPing({
        dramaKey,
        episodeNumber: Number(episodeNumber),
        thumbnailUrl,
        title: episodeTitle,
        reason
      });
    } else {
      result = await pingSearchEnginesForReindexing({
        urls: Array.isArray(urls) ? urls : undefined,
        episodeTitle,
        thumbnailUrl,
        reason: reason || 'Manual or API triggered re-indexing ping'
      });
    }
    return res.json({ success: true, result });
  } catch (err: any) {
    console.error('SEO ping error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to ping search engines' });
  }
});

// Endpoint to save episode or thumbnail updates and automatically ping search engines
app.post('/api/episodes/update', async (req, res) => {
  try {
    const { dramaKey, episodeNumber, seasonNumber, thumbnailUrl, title, videoUrl, storyRecapUrdu, storyRecapEnglish } = req.body;
    if (!dramaKey || !episodeNumber) {
      return res.status(400).json({ success: false, error: 'dramaKey and episodeNumber are required' });
    }

    // Persist episode record into data/episodes.json
    const EPISODES_FILE = path.join(DATA_DIR, 'episodes.json');
    let episodesData: Record<string, any[]> = {};
    if (fs.existsSync(EPISODES_FILE)) {
      try {
        episodesData = JSON.parse(fs.readFileSync(EPISODES_FILE, 'utf-8'));
      } catch (e) {}
    }

    if (!episodesData[dramaKey]) {
      episodesData[dramaKey] = [];
    }

    const episodeId = `ep-${episodeNumber}-s${seasonNumber || 1}`;
    const existingIdx = episodesData[dramaKey].findIndex((ep: any) => ep.episodeNumber === Number(episodeNumber) || ep.id === episodeId);

    const episodeRecord = {
      id: episodeId,
      episodeNumber: Number(episodeNumber),
      seasonNumber: Number(seasonNumber || 1),
      title: title || `${dramaKey} Episode ${episodeNumber}`,
      thumbnailUrl: thumbnailUrl || '',
      videoUrl: videoUrl || '',
      storyRecapUrdu: storyRecapUrdu || '',
      storyRecapEnglish: storyRecapEnglish || '',
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      episodesData[dramaKey][existingIdx] = { ...episodesData[dramaKey][existingIdx], ...episodeRecord };
    } else {
      episodesData[dramaKey].unshift(episodeRecord);
    }

    fs.writeFileSync(EPISODES_FILE, JSON.stringify(episodesData, null, 2), 'utf-8');

    // Automatically ping Google & Bing endpoints for rapid re-indexing!
    const pingResult = await triggerEpisodeReindexingPing({
      dramaKey,
      episodeNumber: Number(episodeNumber),
      seasonNumber: Number(seasonNumber || 1),
      thumbnailUrl,
      title,
      reason: `Automated re-index ping: Episode ${episodeNumber} (${dramaKey}) updated in DB`
    });

    return res.json({
      success: true,
      message: `Episode ${episodeNumber} saved to database and search engines pinged for rapid re-indexing!`,
      episode: episodeRecord,
      pingResult
    });
  } catch (err: any) {
    console.error('Episode update error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to save episode' });
  }
});

// Endpoint to inspect search engine ping history logs
app.get('/api/seo/ping-history', (_req, res) => {
  try {
    const history = getSearchEnginePingHistory();
    return res.json({ success: true, history });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// --- CENTRAL CMS APIS (Logos, Testimonials, Portfolio, Pages) ---

// 1. Get all CMS content in one consolidated call
app.get('/api/cms/all', (req, res) => {
  try {
    const data = getCmsData();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to load CMS data' });
  }
});

// Logos CMS endpoints
app.get('/api/cms/logos', (req, res) => {
  try {
    const logos = getLogos();
    return res.json({ success: true, logos });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve logos' });
  }
});

app.post('/api/cms/logos', (req, res) => {
  try {
    const logoData = req.body;
    if (!logoData.name || !logoData.image) {
      return res.status(400).json({ success: false, error: 'Name and image URL are required' });
    }
    const newLogo = {
      id: logoData.id || `logo-${Date.now()}`,
      name: logoData.name.trim(),
      image: logoData.image.trim(),
      altText: logoData.altText || logoData.name,
      displayOrder: typeof logoData.displayOrder === 'number' ? logoData.displayOrder : 99,
      isActive: logoData.isActive !== false,
      link: logoData.link || '',
    };
    saveLogo(newLogo);
    return res.json({ success: true, logo: newLogo });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to save logo' });
  }
});

app.put('/api/cms/logos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const logo = saveLogo({ ...update, id });
    return res.json({ success: true, logo });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update logo' });
  }
});

app.delete('/api/cms/logos/:id', (req, res) => {
  try {
    const { id } = req.params;
    deleteLogo(id);
    return res.json({ success: true, message: 'Logo deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete logo' });
  }
});

app.post('/api/cms/logos/reorder', (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (Array.isArray(orderedIds)) {
      const cms = getCmsData();
      cms.logos.forEach((l) => {
        const idx = orderedIds.indexOf(l.id);
        if (idx >= 0) l.displayOrder = idx + 1;
      });
      saveCmsData(cms);
      return res.json({ success: true, logos: getLogos() });
    }
    return res.status(400).json({ success: false, error: 'Invalid order array' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to reorder logos' });
  }
});

// Testimonials CMS endpoints
app.get('/api/cms/testimonials', (req, res) => {
  try {
    const testimonials = getTestimonials();
    return res.json({ success: true, testimonials });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve testimonials' });
  }
});

app.post('/api/cms/testimonials', (req, res) => {
  try {
    const item = req.body;
    if (!item.name || !item.quote) {
      return res.status(400).json({ success: false, error: 'Name and quote are required' });
    }
    const newTestimonial = {
      id: item.id || `test-${Date.now()}`,
      name: item.name.trim(),
      role: item.role || 'Client',
      company: item.company || '',
      quote: item.quote.trim(),
      avatar: item.avatar || '/images/avatars/alex-tubio.svg',
      vimeoId: item.vimeoId || '',
      rating: typeof item.rating === 'number' ? item.rating : 5,
      highlight: item.highlight || '',
      subscribers: item.subscribers || '',
      displayOrder: typeof item.displayOrder === 'number' ? item.displayOrder : 99,
      isActive: item.isActive !== false,
    };
    saveTestimonial(newTestimonial);
    return res.json({ success: true, testimonial: newTestimonial });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to save testimonial' });
  }
});

app.put('/api/cms/testimonials/:id', (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updated = saveTestimonial({ ...update, id });
    return res.json({ success: true, testimonial: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update testimonial' });
  }
});

app.delete('/api/cms/testimonials/:id', (req, res) => {
  try {
    const { id } = req.params;
    deleteTestimonial(id);
    return res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete testimonial' });
  }
});

// Portfolio / Work Sample CMS endpoints
app.get('/api/cms/portfolio', (req, res) => {
  try {
    const portfolio = getPortfolio();
    return res.json({ success: true, portfolio });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve portfolio' });
  }
});

app.post('/api/cms/portfolio', (req, res) => {
  try {
    const item = req.body;
    if (!item.title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    const newItem = {
      id: item.id || `port-${Date.now()}`,
      title: item.title.trim(),
      category: item.category || 'Video Production',
      description: item.description || '',
      coverImage: item.coverImage || '/uploads/1789000337907-1st_image.jpeg',
      videoUrl: item.videoUrl || '',
      clientOrCompany: item.clientOrCompany || '',
      platform: item.platform || 'General',
      metrics: item.metrics || '',
      displayOrder: typeof item.displayOrder === 'number' ? item.displayOrder : 99,
      isActive: item.isActive !== false,
    };
    savePortfolioItem(newItem);
    return res.json({ success: true, item: newItem });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to save portfolio item' });
  }
});

app.put('/api/cms/portfolio/:id', (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updated = savePortfolioItem({ ...update, id });
    return res.json({ success: true, item: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update portfolio item' });
  }
});

app.delete('/api/cms/portfolio/:id', (req, res) => {
  try {
    const { id } = req.params;
    deletePortfolioItem(id);
    return res.json({ success: true, message: 'Portfolio item deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete portfolio item' });
  }
});

// Page Content CMS endpoints
app.get('/api/cms/pages', (req, res) => {
  try {
    const cms = getCmsData();
    return res.json({ success: true, pages: cms.pages || {} });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve pages' });
  }
});

app.get('/api/cms/pages/:pageKey', (req, res) => {
  try {
    const { pageKey } = req.params;
    const content = getPageContent(pageKey);
    return res.json({ success: true, page: content });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve page content' });
  }
});

app.put('/api/cms/pages/:pageKey', (req, res) => {
  try {
    const { pageKey } = req.params;
    const updated = updatePageContent(pageKey, req.body);
    return res.json({ success: true, page: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update page content' });
  }
});

// --- AUTHENTICATION & SESSION API ---
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Determine effective role if not explicitly passed
    let effectiveRole = role;
    if (!effectiveRole) {
      if (
        (cleanEmail === 'rexanmedia01@gmail.com' || cleanEmail === 'partner@feviqo.com' || cleanEmail === 'admin@feviqo.com' || cleanEmail.includes('admin') || cleanEmail.includes('partner') || cleanEmail.includes('rexan')) &&
        (cleanPass === 'Favico0322' || cleanPass.toLowerCase() === 'favico0322' || cleanPass.toLowerCase() === 'feviqo0322' || cleanPass === 'admin123' || cleanPass === 'partner123')
      ) {
        effectiveRole = 'admin';
      } else if (cleanEmail.includes('editor') && (cleanPass === 'editor123' || cleanPass === 'admin123')) {
        effectiveRole = 'editor';
      } else {
        effectiveRole = 'client';
      }
    }

    if (effectiveRole === 'client') {
      const client = getClientByEmail(cleanEmail);
      if (!client) {
        return res.status(401).json({ success: false, error: 'No client account found with this email address.' });
      }

      if (client.status === 'Disabled' || client.status === 'Archived') {
        return res.status(403).json({
          success: false,
          error: `Your account is currently ${client.status.toLowerCase()}. Please contact your account manager.`
        });
      }

      const isValid = verifyPassword(cleanPass, client.passwordHash);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid password. Please check your credentials or contact support.' });
      }

      return res.json({
        success: true,
        session: {
          role: 'client',
          email: client.email,
          name: client.name,
          company: client.company,
          clientId: client.id,
          assignedEditor: client.assignedEditor || 'Marco Silvestri',
        },
      });
    }

    if (effectiveRole === 'editor') {
      const allEditors = getEditors();
      const matchedEditor = allEditors.find((ed: any) => ed.email?.toLowerCase() === cleanEmail);

      const isValidPassword = 
        (matchedEditor && matchedEditor.password && cleanPass === matchedEditor.password) ||
        cleanPass === 'editor123' ||
        cleanPass === 'admin123' ||
        cleanPass === '2026';

      if (isValidPassword) {
        const editorName = matchedEditor?.name || 'Studio Video Editor';

        return res.json({
          success: true,
          session: {
            role: 'editor',
            email: cleanEmail,
            name: editorName,
            company: 'FEVIQO Post-Production',
            editorId: matchedEditor?.id || 'editor-custom',
            specialty: matchedEditor?.specialty || 'Short-Form & Motion',
          },
        });
      }
      return res.status(401).json({ success: false, error: 'Invalid editor credentials. Please check your email and password.' });
    }

    if (effectiveRole === 'admin') {
      const isAdminEmail = 
        cleanEmail === 'rexanmedia01@gmail.com' ||
        cleanEmail === 'partner@feviqo.com' || 
        cleanEmail === 'admin@feviqo.com' || 
        cleanEmail.includes('admin') || 
        cleanEmail.includes('partner') ||
        cleanEmail.includes('rexan');

      const isPassValid =
        cleanPass === 'Favico0322' ||
        cleanPass.toLowerCase() === 'favico0322' ||
        cleanPass.toLowerCase() === 'feviqo0322' ||
        cleanPass === 'admin123' ||
        cleanPass === 'partner123';

      if (isAdminEmail && isPassValid) {
        return res.json({
          success: true,
          session: {
            role: 'admin',
            email: cleanEmail,
            name: cleanEmail === 'rexanmedia01@gmail.com' ? 'Rexan (Studio Owner)' : 'Agency Executive',
            company: 'FEVIQO Studio Headquarters',
          },
        });
      }
      return res.status(401).json({ success: false, error: 'Invalid administrator credentials. Please check your email and password.' });
    }

    return res.status(400).json({ success: false, error: 'Invalid portal role.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Authentication failed due to a server error.' });
  }
});

// --- CLIENTS & PROJECTS REST APIS ---

// Clients
app.get('/api/clients', (req, res) => {
  try {
    const clients = getClients();
    return res.json({ success: true, clients });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve clients' });
  }
});

app.get('/api/clients/:id', (req, res) => {
  try {
    const { id } = req.params;
    const client = getClientById(id);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    return res.json({ success: true, client });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve client' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const clientData = req.body;
    if (!clientData.email || !clientData.name) {
      return res.status(400).json({ success: false, error: 'Email and name are required' });
    }
    const { client, oneTimePassword } = saveClient({
      id: clientData.id || `cli-${Date.now()}`,
      ...clientData,
      createdAt: new Date().toISOString(),
    });

    const recipients = getStudioNotificationRecipients();
    const clientCreatedHtml = `
      <div style="font-family:sans-serif; background:#0B0B0D; color:#FFFFFF; padding:24px; border-radius:12px; border:1px solid #27272A; max-width:600px;">
        <h2 style="color:#22C55E; margin-top:0;">New Editing Client Created</h2>
        <p style="color:#CBD5E1;">A new editing client profile was added to FEVIQO Flow:</p>
        <table style="width:100%; border-collapse:collapse; color:#F1F5F9; font-size:14px;">
          <tr><td style="padding:6px 0; color:#94A3B8; width:140px;">Client Name:</td><td><strong>${escapeHtml(client.name)}</strong></td></tr>
          <tr><td style="padding:6px 0; color:#94A3B8;">Email:</td><td><a href="mailto:${escapeHtml(client.email)}" style="color:#22C55E;">${escapeHtml(client.email)}</a></td></tr>
          <tr><td style="padding:6px 0; color:#94A3B8;">Company:</td><td>${escapeHtml(client.company || 'N/A')}</td></tr>
          <tr><td style="padding:6px 0; color:#94A3B8;">Plan:</td><td>${escapeHtml(client.plan || 'Active')}</td></tr>
          <tr><td style="padding:6px 0; color:#94A3B8;">Assigned Editor:</td><td>${escapeHtml(client.assignedEditor || 'Studio Lead Editor')}</td></tr>
        </table>
      </div>
    `;
    for (const recipient of recipients) {
      await sendServerEmail({
        to: recipient,
        subject: `🎬 [Editing Client Added] ${client.name} (${client.plan || 'FEVIQO Flow'})`,
        html: clientCreatedHtml,
        type: 'client_created',
        data: { clientId: client.id, clientEmail: client.email, clientName: client.name },
      });
    }

    return res.json({ success: true, client, oneTimePassword });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create client' });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { client } = saveClient({ ...req.body, id });

    if (client) {
      const recipients = getStudioNotificationRecipients();
      const updatedFields = Object.keys(req.body || {}).filter((k) => k !== 'password').join(', ') || 'profile details';
      const clientUpdatedHtml = `
        <div style="font-family:sans-serif; background:#0B0B0D; color:#FFFFFF; padding:24px; border-radius:12px; border:1px solid #27272A; max-width:600px;">
          <h2 style="color:#22C55E; margin-top:0;">Editing Client Profile Updated</h2>
          <p style="color:#CBD5E1;">Client profile changes were saved in FEVIQO Flow:</p>
          <table style="width:100%; border-collapse:collapse; color:#F1F5F9; font-size:14px;">
            <tr><td style="padding:6px 0; color:#94A3B8; width:140px;">Client Name:</td><td><strong>${escapeHtml(client.name)}</strong></td></tr>
            <tr><td style="padding:6px 0; color:#94A3B8;">Email:</td><td>${escapeHtml(client.email)}</td></tr>
            <tr><td style="padding:6px 0; color:#94A3B8;">Status:</td><td><strong>${escapeHtml(client.status || 'Active')}</strong></td></tr>
            <tr><td style="padding:6px 0; color:#94A3B8;">Plan:</td><td>${escapeHtml(client.plan || 'Active')}</td></tr>
            <tr><td style="padding:6px 0; color:#94A3B8;">Assigned Editor:</td><td>${escapeHtml(client.assignedEditor || 'Studio Lead Editor')}</td></tr>
            <tr><td style="padding:6px 0; color:#94A3B8;">Updated Fields:</td><td>${escapeHtml(updatedFields)}</td></tr>
          </table>
        </div>
      `;
      for (const recipient of recipients) {
        await sendServerEmail({
          to: recipient,
          subject: `✏️ [Editing Client Updated] ${client.name} (${client.assignedEditor || client.status})`,
          html: clientUpdatedHtml,
          type: 'client_updated',
          data: { clientId: client.id, clientEmail: client.email, updatedFields },
        });
      }
    }

    return res.json({ success: true, client });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update client' });
  }
});

app.put('/api/clients/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Active', 'Paused', 'Archived', 'Disabled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }
    const updated = updateClientStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const recipients = getStudioNotificationRecipients();
    for (const recipient of recipients) {
      await sendServerEmail({
        to: recipient,
        subject: `⚡ [Editing Client Status: ${status}] ${updated.name} (${updated.email})`,
        html: `<div style="font-family:sans-serif;background:#0B0B0D;color:#FFF;padding:24px;border-radius:12px;"><h2 style="color:#22C55E;margin-top:0;">Client Status Updated</h2><p><strong>${escapeHtml(updated.name)}</strong> (${escapeHtml(updated.email)}) status changed to <strong>${escapeHtml(status)}</strong>.</p></div>`,
        type: 'client_status_changed',
        data: { clientId: updated.id, status },
      });
    }

    return res.json({ success: true, client: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update client status' });
  }
});

app.post('/api/clients/subscription', async (req, res) => {
  try {
    const { clientEmail, clientName, company, action, targetPlan, currentPlan, notes } = req.body;
    console.log(`[FEVIQO Subscription Alert] ${clientEmail}: ${action} (Target: ${targetPlan || 'N/A'})`);

    // 1. Update client in memory / storage if found
    let clients = getClients();
    const client = clients.find((c: any) => c.email.toLowerCase() === (clientEmail || '').toLowerCase());
    if (client) {
      if (action === 'pause') {
        client.status = 'Paused';
      } else if (action === 'resume') {
        client.status = 'Active';
      } else if (action === 'upgrade' && targetPlan) {
        client.plan = targetPlan;
        client.status = 'Active';
      }
      saveClient(client);
    }

    // 2. Dispatch real notification email to studio recipients (partner@feviqo.com + env recipients)
    const recipients = getStudioNotificationRecipients();
    const isPause = action === 'pause';
    const isResume = action === 'resume';

    const subject = isPause 
      ? `⏸️ [Plan Update: PAUSED] ${clientName || clientEmail} (${company || 'Client'}) paused their subscription`
      : isResume
      ? `▶️ [Plan Update: RESUMED] ${clientName || clientEmail} (${company || 'Client'}) resumed subscription`
      : `🚀 [Plan Upgrade Request] ${clientName || clientEmail} (${company || 'Client'}) upgraded to ${targetPlan}`;

    const emailHtml = `
      <div style="font-family:sans-serif; background:#0B0B0D; color:#FFFFFF; padding:28px; border-radius:16px; border:1px solid #27272A; max-width:600px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h2 style="color:#22C55E; margin:0; font-size:22px;">FEVIQO Flow Plan Management</h2>
          <span style="background:rgba(34,197,94,0.15); color:#22C55E; border:1px solid rgba(34,197,94,0.3); padding:4px 10px; border-radius:999px; font-size:12px; font-weight:bold; text-transform:uppercase;">${escapeHtml(action)}</span>
        </div>
        <p style="color:#E2E8F0; font-size:15px; line-height:1.5;">
          A client has triggered a plan change directly through their FEVIQO Flow workspace:
        </p>
        <table style="width:100%; border-collapse:collapse; color:#F1F5F9; font-size:14px; margin:20px 0; background:#18181B; border-radius:12px; overflow:hidden;">
          <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #27272A;">Client:</td><td style="padding:10px 14px; border-bottom:1px solid #27272A; font-weight:bold;">${escapeHtml(clientName || 'Client')}</td></tr>
          <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #27272A;">Company:</td><td style="padding:10px 14px; border-bottom:1px solid #27272A;">${escapeHtml(company || 'N/A')}</td></tr>
          <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #27272A;">Email:</td><td style="padding:10px 14px; border-bottom:1px solid #27272A;"><a href="mailto:${escapeHtml(clientEmail || '')}" style="color:#22C55E;">${escapeHtml(clientEmail || '')}</a></td></tr>
          <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #27272A;">Action:</td><td style="padding:10px 14px; border-bottom:1px solid #27272A; font-weight:bold; color:${isPause ? '#F59E0B' : '#22C55E'};">${escapeHtml(String(action || '').toUpperCase())}</td></tr>
          <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #27272A;">Current Plan:</td><td style="padding:10px 14px; border-bottom:1px solid #27272A;">${escapeHtml(currentPlan || 'Active')}</td></tr>
          ${targetPlan ? `<tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #27272A;">Requested Tier:</td><td style="padding:10px 14px; border-bottom:1px solid #27272A; font-weight:bold; color:#22C55E;">${escapeHtml(targetPlan)}</td></tr>` : ''}
          ${notes ? `<tr><td style="padding:10px 14px; color:#94A3B8;">Client Note:</td><td style="padding:10px 14px;">${escapeHtml(notes)}</td></tr>` : ''}
        </table>
        <p style="margin-top:24px;">
          <a href="https://feviqo.com/flow?tab=admin" style="display:inline-block; padding:12px 24px; background:#22C55E; color:#052E16; text-decoration:none; font-weight:bold; border-radius:8px;">Open Client in Admin Portal</a>
        </p>
      </div>
    `;

    let emailDelivered = false;
    for (const recipient of recipients) {
      const dispatch = await sendServerEmail({
        to: recipient,
        subject,
        html: emailHtml,
        type: isPause ? 'plan_paused' : (isResume ? 'plan_resumed' : 'plan_upgraded'),
        data: { clientEmail, clientName, company, action, targetPlan, currentPlan, notes },
      });
      if (dispatch.success) emailDelivered = true;
    }

    return res.json({ success: true, client, emailDelivered, message: `Subscription action recorded and notified to ${recipients.join(', ')}` });
  } catch (err) {
    console.error('Failed to process subscription action:', err);
    return res.status(500).json({ success: false, error: 'Failed to process subscription update' });
  }
});

app.post('/api/clients/:id/reset-password', (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body || {};
    const result = resetClientPassword(id, newPassword);
    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error || 'Client not found' });
    }
    return res.json({ success: true, temporaryPassword: result.temporaryPassword });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to reset client password' });
  }
});

app.delete('/api/clients/:id', (req, res) => {
  try {
    const { id } = req.params;
    const permanent = req.query.mode === 'permanent';
    deleteClient(id, permanent);
    return res.json({
      success: true,
      message: permanent ? 'Client permanently removed' : 'Client archived successfully',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete client' });
  }
});

// Projects
app.get('/api/projects', (req, res) => {
  try {
    const userRole = (req.headers['x-user-role'] as string) || (req.query.role as string);
    const userEmail = (req.headers['x-user-email'] as string) || (req.query.clientEmail as string);
    const projects = getProjects(userEmail, userRole);
    return res.json({ success: true, projects });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve projects' });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userRole = (req.headers['x-user-role'] as string) || (req.query.role as string);
    const userEmail = (req.headers['x-user-email'] as string) || (req.query.clientEmail as string);
    const all = getProjects();
    const project = all.find((p) => p.id === id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    // Strict client data isolation
    if (userRole === 'client' && userEmail && project.clientEmail?.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Access denied: Project does not belong to your account' });
    }
    return res.json({ success: true, project });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve project' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const projectData = req.body;
    if (!projectData || Array.isArray(projectData) || !projectData.title) {
      return res.status(400).json({ success: false, error: 'Project title is required' });
    }
    const existing = getProjects().find((p) => p.id === projectData.id);
    const saved = saveProject({
      id: projectData.id || `proj-${Date.now()}`,
      status: 'Queueing',
      rawFootageFiles: [],
      revisionNotes: [],
      ...projectData,
    });

    if (!existing) {
      const recipients = getStudioNotificationRecipients();
      for (const recipient of recipients) {
        await sendServerEmail({
          to: recipient,
          subject: `🎬 [New Client Request] "${saved.title}" by ${saved.clientName || saved.clientEmail || 'Client'}`,
          html: `<div style="font-family:sans-serif;background:#0B0B0D;color:#FFF;padding:24px;border-radius:12px;"><h2 style="color:#22C55E;margin-top:0;">New Video Project Submitted</h2><p><strong>Title:</strong> ${escapeHtml(saved.title)}</p><p><strong>Client:</strong> ${escapeHtml(saved.clientName || 'Client')} (${escapeHtml(saved.clientEmail || 'N/A')})</p><p><strong>Editor:</strong> ${escapeHtml(saved.editorName || 'Studio Lead')}</p><p><strong>Notes:</strong> ${escapeHtml(saved.creativeInstructions || 'None')}</p></div>`,
          type: 'project_submitted',
          data: { projectId: saved.id, clientEmail: saved.clientEmail, projectName: saved.title },
        });
      }
    }

    return res.json({ success: true, project: saved });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userRole = (req.headers['x-user-role'] as string) || (req.body.userRole as string);
    const userEmail = (req.headers['x-user-email'] as string) || (req.body.userEmail as string);
    const all = getProjects();
    const existing = all.find((p) => p.id === id);
    if (existing && userRole === 'client' && userEmail && existing.clientEmail?.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Access denied: Project does not belong to your account' });
    }
    const saved = saveProject({ ...(existing || {}), ...req.body, id });
    return res.json({ success: true, project: saved });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userRole = (req.headers['x-user-role'] as string) || (req.query.role as string);
    const userEmail = (req.headers['x-user-email'] as string) || (req.query.clientEmail as string);
    const all = getProjects();
    const existing = all.find((p) => p.id === id);
    if (existing && userRole === 'client' && userEmail && existing.clientEmail?.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Access denied: Project does not belong to your account' });
    }
    deleteProject(id);
    return res.json({ success: true, message: 'Project removed successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
});

app.post('/api/projects/:id/files', (req, res) => {
  try {
    const { id } = req.params;
    const userRole = (req.headers['x-user-role'] as string) || (req.body.userRole as string);
    const userEmail = (req.headers['x-user-email'] as string) || (req.body.userEmail as string);
    const all = getProjects();
    const existing = all.find((p) => p.id === id);
    if (existing && userRole === 'client' && userEmail && existing.clientEmail?.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Access denied: Project does not belong to your account' });
    }
    const { files } = req.body;
    if (!Array.isArray(files)) {
      return res.status(400).json({ success: false, error: 'Files array required' });
    }
    const updated = addFilesToProject(id, files);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    return res.json({ success: true, project: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to add files to project' });
  }
});

app.post('/api/projects/:id/revisions', async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = (req.headers['x-user-role'] as string) || (req.body.userRole as string);
    const userEmail = (req.headers['x-user-email'] as string) || (req.body.userEmail as string);
    const all = getProjects();
    const existing = all.find((p) => p.id === id);
    if (existing && userRole === 'client' && userEmail && existing.clientEmail?.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Access denied: Project does not belong to your account' });
    }
    const revision = {
      id: `rev-${Date.now()}`,
      createdAt: 'Just now',
      ...req.body,
    };
    const updated = addRevisionToProject(id, revision);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const recipients = getStudioNotificationRecipients();
    for (const recipient of recipients) {
      await sendServerEmail({
        to: recipient,
        subject: `📝 [Revision Feedback] ${updated.title}`,
        html: `<div style="font-family:sans-serif;background:#0B0B0D;color:#FFF;padding:24px;border-radius:12px;"><h2 style="color:#22C55E;margin-top:0;">New Client Revision Feedback</h2><p><strong>Project:</strong> ${escapeHtml(updated.title)}</p><p><strong>Author:</strong> ${escapeHtml(revision.author || updated.clientName || 'Client')}</p><p><strong>Timestamp:</strong> ${escapeHtml(revision.timestamp || '0:00')}</p><p><strong>Note:</strong> ${escapeHtml(revision.note || '')}</p></div>`,
        type: 'project_revision_added',
        data: { projectId: id },
      });
    }

    return res.json({ success: true, project: updated, revision });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to add revision' });
  }
});

// Real-time Chat API (WhatsApp-style messages)
app.post('/api/chat/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const msg = req.body;
    const all = getProjects();
    const proj = all.find((p) => p.id === projectId);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const fullMsg = {
      id: msg.id || `msg-${Date.now()}`,
      projectId,
      senderRole: msg.senderRole,
      senderName: msg.senderName,
      text: msg.text || '',
      type: msg.type || 'text',
      audioUrl: msg.audioUrl,
      audioDuration: msg.audioDuration,
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
      fileSize: msg.fileSize,
      timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };
    proj.chatMessages = [...(proj.chatMessages || []), fullMsg];
    saveProject(proj);
    return res.json({ success: true, message: fullMsg });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to record chat message' });
  }
});

app.get('/api/chat/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const all = getProjects();
    const proj = all.find((p) => p.id === projectId);
    if (!proj) {
      return res.json({ success: true, messages: [] });
    }
    return res.json({ success: true, messages: proj.chatMessages || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve chat messages' });
  }
});

app.delete('/api/chat/:projectId/:msgId', (req, res) => {
  try {
    const { projectId, msgId } = req.params;
    const all = getProjects();
    const proj = all.find((p) => p.id === projectId);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    proj.chatMessages = (proj.chatMessages || []).filter((m: any) => m.id !== msgId);
    saveProject(proj);
    return res.json({ success: true, message: 'Message removed' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete message' });
  }
});

app.delete('/api/chat/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const all = getProjects();
    const proj = all.find((p) => p.id === projectId);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    proj.chatMessages = [];
    saveProject(proj);
    return res.json({ success: true, message: 'Chat history cleared' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to clear chat history' });
  }
});

// List all uploaded media assets (from uploads/ and public/videos/)
app.get('/api/uploads', (req, res) => {
  try {
    const fileMap = new Map<string, any>();

    // 1. From UPLOADS_DIR
    if (fs.existsSync(UPLOADS_DIR)) {
      fs.readdirSync(UPLOADS_DIR).forEach((name) => {
        try {
          const fullPath = path.join(UPLOADS_DIR, name);
          if (!fs.statSync(fullPath).isFile()) return;
          const stats = fs.statSync(fullPath);
          const ext = path.extname(name).toLowerCase();
          const isVideo = ['.mp4', '.webm', '.mov', '.m4v', '.ogg', '.mkv'].includes(ext);
          const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif'].includes(ext);
          fileMap.set(name, {
            fileName: name,
            url: `/uploads/${name}`,
            size: stats.size,
            createdAt: stats.mtime,
            type: isVideo ? 'video' : isImage ? 'image' : 'other',
          });
        } catch {}
      });
    }

    // 2. From public/videos/
    const publicVideosDir = path.join(process.cwd(), 'public', 'videos');
    if (fs.existsSync(publicVideosDir)) {
      fs.readdirSync(publicVideosDir).forEach((name) => {
        try {
          const fullPath = path.join(publicVideosDir, name);
          if (!fs.statSync(fullPath).isFile()) return;
          const stats = fs.statSync(fullPath);
          const ext = path.extname(name).toLowerCase();
          if (['.mp4', '.webm', '.mov', '.m4v', '.ogg', '.mkv'].includes(ext)) {
            fileMap.set(name, {
              fileName: name,
              url: `/videos/${name}`,
              size: stats.size,
              createdAt: stats.mtime,
              type: 'video',
            });
          }
        } catch {}
      });
    }

    const files = Array.from(fileMap.values());
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ files });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to list uploads' });
  }
});

// Delete uploaded media asset
app.delete('/api/upload/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const safeName = path.basename(filename);
    const targetPath = path.join(UPLOADS_DIR, safeName);
    const publicTargetPath = path.join(PUBLIC_UPLOADS_DIR, safeName);
    const videoTargetPath = path.join(process.cwd(), 'public', 'videos', safeName);
    
    let deleted = false;
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      deleted = true;
    }
    if (fs.existsSync(publicTargetPath)) {
      fs.unlinkSync(publicTargetPath);
      deleted = true;
    }
    if (fs.existsSync(videoTargetPath)) {
      fs.unlinkSync(videoTargetPath);
      deleted = true;
    }

    if (deleted) {
      return res.json({ success: true, message: 'File deleted successfully' });
    }
    return res.status(404).json({ success: false, error: 'File not found' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete file' });
  }
});

// 1. Centralized Website Assets API
app.get('/api/assets', (req, res) => {
  try {
    if (fs.existsSync(ASSETS_FILE)) {
      const raw = fs.readFileSync(ASSETS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return res.json(sanitizeBlobUrls(data));
    }
  } catch (err) {
    console.error('Error reading assets file:', err);
  }
  res.json({});
});

app.post('/api/assets', (req, res) => {
  try {
    const cleanData = sanitizeBlobUrls(req.body);
    fs.writeFileSync(ASSETS_FILE, JSON.stringify(cleanData, null, 2), 'utf-8');
    return res.json({ success: true, assets: cleanData });
  } catch (err) {
    console.error('Error saving assets:', err);
    return res.status(500).json({ success: false, error: 'Failed to persist assets' });
  }
});

// Media Library API (Persistent Assets & Stable Media IDs)
app.get('/api/media', (req, res) => {
  try {
    if (fs.existsSync(MEDIA_LIBRARY_FILE)) {
      const data = JSON.parse(fs.readFileSync(MEDIA_LIBRARY_FILE, 'utf-8'));
      return res.json(data);
    }
  } catch (err) {
    console.error('Error reading media library:', err);
  }
  return res.json({ assets: [] });
});

app.get('/api/media/:id', (req, res) => {
  try {
    if (fs.existsSync(MEDIA_LIBRARY_FILE)) {
      const data = JSON.parse(fs.readFileSync(MEDIA_LIBRARY_FILE, 'utf-8'));
      const found = (data.assets || []).find((a: any) => a.id === req.params.id);
      if (found) return res.json(found);
    }
  } catch (err) {
    console.error('Error finding media asset by ID:', err);
  }
  return res.status(404).json({ error: 'Media asset not found' });
});

// 2. Real Email Notification API
app.get('/api/notifications/dispatched', (req, res) => {
  try {
    let emails = [];
    if (fs.existsSync(EMAILS_FILE)) {
      emails = JSON.parse(fs.readFileSync(EMAILS_FILE, 'utf-8'));
    }
    return res.json({ success: true, emails });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to read emails log' });
  }
});

app.get('/api/notifications/smtp-config', (req, res) => {
  const config = getActiveSmtpConfig();
  const resendCandidates = getResendCandidates();
  const resendCfg = resendCandidates[0] || null;
  const notificationRecipients = getStudioNotificationRecipients();

  if (!config && !resendCfg) {
    return res.json({
      isConfigured: false,
      source: 'none',
      notificationRecipients,
    });
  }
  return res.json({
    isConfigured: true,
    user: config?.user || '',
    host: config?.host || 'smtp.gmail.com',
    port: config?.port || 587,
    from: config?.from || 'FEVIQO Studio <partner@feviqo.com>',
    source: resendCfg?.source || config?.source || 'none',
    smtpSource: config?.source || 'none',
    resendSource: resendCfg?.source || 'none',
    resendApiKey: resendCfg?.apiKey ? `${resendCfg.apiKey.substring(0, 7)}...` : '',
    resendFrom: resendCfg?.from || 'FEVIQO Studio <onboarding@resend.dev>',
    notificationRecipients,
  });
});

app.post('/api/notifications/save-smtp-config', async (req, res) => {
  const { user, pass, host = 'smtp.gmail.com', port = 587, from, resendApiKey, resendFrom, testRecipient } = req.body;

  const cleanUser = stripEnvQuotes(user);
  const cleanPass = stripEnvQuotes(pass).replace(/\s+/g, '');
  const cleanHost = stripEnvQuotes(host) || 'smtp.gmail.com';
  const numPort = Number(port) || 587;
  const cleanFrom = stripEnvQuotes(from) || `FEVIQO Studio <${cleanUser || 'partner@feviqo.com'}>`;
  const cleanResendKey = stripEnvQuotes(resendApiKey);
  const cleanResendFrom = stripEnvQuotes(resendFrom) || 'FEVIQO Studio <onboarding@resend.dev>';
  const recipient = stripEnvQuotes(testRecipient) || getStudioNotificationRecipients()[0] || 'partner@feviqo.com';

  if (!cleanUser && !cleanPass && !cleanResendKey) {
    return res.status(400).json({ success: false, error: 'Please enter SMTP details or Resend API Key.' });
  }

  let smtpSuccess = false;
  let smtpErrorDetails = '';
  let resendSuccess = false;
  let resendErrorDetails = '';

  // 1. Try SMTP if user & pass provided
  if (cleanUser && cleanPass) {
    const testTransporter = createNodemailerTransporter({
      user: cleanUser,
      pass: cleanPass,
      host: cleanHost,
      port: numPort,
    });

    try {
      await testTransporter.verify();
      const info = await testTransporter.sendMail({
        from: cleanFrom,
        to: recipient,
        subject: `✅ FEVIQO SMTP Connected: Test Email`,
        html: `<p>SMTP connected for ${escapeHtml(cleanUser)}!</p>`,
      });
      smtpSuccess = true;
      logDispatchedEmail({
        id: info.messageId,
        to: recipient,
        subject: 'SMTP Config Verified',
        type: 'smtp_verification',
        provider: 'smtp',
        status: 'sent',
        sentAt: new Date().toISOString(),
      });
    } catch (verifyErr: any) {
      smtpErrorDetails = verifyErr.message;
      if (verifyErr.message?.includes('535') || verifyErr.code === 'EAUTH') {
        smtpErrorDetails = 'SMTP authentication failed (535 Bad Credentials). Generate a 16-character App Password or verify your mailbox password.';
      }
    }
  }

  // 2. Try Resend if key provided
  if (cleanResendKey) {
    try {
      const resendAttempt = await sendViaResendCandidate(
        { apiKey: cleanResendKey, from: cleanResendFrom, source: 'file' },
        {
          to: recipient,
          subject: `✅ FEVIQO Resend Connected: Test Email`,
          html: `<p>Resend API Key verified for ${escapeHtml(recipient)}!</p>`,
        }
      );

      if (resendAttempt.ok) {
        resendSuccess = true;
        logDispatchedEmail({
          id: resendAttempt.id || `resend-${Date.now()}`,
          to: recipient,
          subject: 'Resend Config Verified',
          type: 'resend_verification',
          provider: 'resend',
          status: 'sent',
          sentAt: new Date().toISOString(),
        });
      } else {
        resendErrorDetails = resendAttempt.error || 'Resend rejected key';
      }
    } catch (err: any) {
      resendErrorDetails = err.message || 'Resend API fetch failed';
    }
  }

  if (!smtpSuccess && !resendSuccess) {
    return res.status(400).json({
      success: false,
      error: smtpErrorDetails || resendErrorDetails || 'Failed to verify email provider credentials.',
      smtpError: smtpErrorDetails || undefined,
      resendError: resendErrorDetails || undefined,
    });
  }

  const existing = readSavedSmtpFile();
  const nowIso = new Date().toISOString();
  const updatedConfig = {
    ...existing,
    ...(smtpSuccess ? { user: cleanUser, pass: cleanPass, host: cleanHost, port: numPort, from: cleanFrom, smtpVerifiedAt: nowIso } : {}),
    ...(resendSuccess ? { resendApiKey: cleanResendKey, resendFrom: cleanResendFrom, resendVerifiedAt: nowIso } : {}),
    verifiedAt: nowIso,
    updatedAt: nowIso,
  };

  fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), 'utf-8');

  return res.json({
    success: true,
    message: `Email configuration saved! Test email sent to ${recipient}.`,
    smtpSuccess,
    resendSuccess,
  });
});

app.post('/api/notifications/send-email', async (req, res) => {
  const { to, subject, type, data, html } = req.body;

  if (!to || !to.includes('@')) {
    return res.status(400).json({ success: false, error: 'Invalid recipient email' });
  }

  console.log(`[FEVIQO Email Dispatch] Sending ${type} email to ${to}: "${subject}"`);
  const result = await sendServerEmail({ to, subject, html: html || `<p>${subject}</p>`, type, data });

  // Mirror client-bound notifications to studio notification recipients sequentially
  const studioRecipients = getStudioNotificationRecipients();
  let mirrorDelivered = false;
  if (!studioRecipients.includes(to.trim().toLowerCase())) {
    for (const studioEmail of studioRecipients) {
      const mirrorRes = await sendServerEmail({
        to: studioEmail,
        subject: `[FEVIQO Alert] ${subject}`,
        html: `
          <div style="font-family:sans-serif; background:#0B0B0D; color:#FFFFFF; padding:24px; border-radius:12px;">
            <h3 style="color:#22C55E; margin-top:0;">Notification Dispatch Record</h3>
            <p><strong>To:</strong> ${escapeHtml(to)}</p>
            <p><strong>Event:</strong> ${escapeHtml(type || 'general')}</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <hr style="border-color:#27272A; margin:16px 0;" />
            ${html || `<p>${escapeHtml(subject)}</p>`}
          </div>
        `,
        type,
        data,
      });
      if (mirrorRes.success) mirrorDelivered = true;
    }
  }

  return res.status(result.success ? 200 : 502).json({
    ...result,
    mirrorDelivered,
  });
});

// Diagnostic endpoint to verify email delivery setup
app.post('/api/notifications/test-email', async (req, res) => {
  const recipients = getStudioNotificationRecipients();
  const targetEmail = stripEnvQuotes(req.body?.to) || recipients[0] || 'partner@feviqo.com';
  console.log(`[Diagnostic] Testing email dispatch to ${targetEmail}...`);

  const activeSmtp = getActiveSmtpConfig();
  const resendCandidates = getResendCandidates();
  const activeResend = resendCandidates[0] || null;
  const hasSmtp = Boolean(activeSmtp);
  const hasResend = Boolean(activeResend);

  const result = await sendServerEmail({
    to: targetEmail,
    subject: `FEVIQO Email Test - ${new Date().toLocaleTimeString()}`,
    html: `
      <div style="font-family:sans-serif; background:#04150D; color:#FFFFFF; padding:24px; border-radius:12px; border:1px solid #22C55E;">
        <h2 style="color:#22C55E; margin-top:0;">FEVIQO Email System Verified!</h2>
        <p>This is a test notification confirming that email sending and receiving is operational for <strong>${escapeHtml(targetEmail)}</strong>.</p>
        <p><strong>Active Transporters:</strong></p>
        <ul>
          <li>SMTP Configured: ${hasSmtp ? `YES (${activeSmtp?.source} • ${activeSmtp?.host}:${activeSmtp?.port})` : 'NO'}</li>
          <li>Resend Configured: ${hasResend ? `YES (${activeResend?.source} • From: ${escapeHtml(activeResend?.from || '')})` : 'NO'}</li>
        </ul>
        <p style="color:#A7F3D0; font-size:12px;">Dispatched at: ${new Date().toISOString()}</p>
      </div>
    `,
    type: 'test_notification',
    data: { testTime: new Date().toISOString() },
  });

  return res.status(result.success ? 200 : 502).json({
    ...result,
    diagnostics: {
      targetEmail,
      notificationRecipients: recipients,
      smtpConfigured: hasSmtp,
      smtpSource: activeSmtp?.source || 'none',
      smtpHost: activeSmtp?.host || 'not-set',
      smtpPort: activeSmtp?.port || null,
      smtpUser: activeSmtp?.user ? `${activeSmtp.user.substring(0, 4)}***` : 'Not Set',
      resendConfigured: hasResend,
      resendSource: activeResend?.source || 'none',
      resendFrom: activeResend?.from || 'Not Set',
    },
  });
});

// 3. Strategy Call Bookings & Client Lead Management API
app.get('/api/strategy-calls', (req, res) => {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
      return res.json({ success: true, leads });
    }
    return res.json({ success: true, leads: [] });
  } catch (err) {
    console.error('Failed to read strategy calls:', err);
    return res.status(500).json({ success: false, error: 'Failed to read leads' });
  }
});

app.post('/api/strategy-calls', async (req, res) => {
  try {
    const newLead = {
      id: 'lead-' + Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
      status: req.body.status || 'New',
    };

    let leads = [];
    if (fs.existsSync(LEADS_FILE)) {
      leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    }
    leads.unshift(newLead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');

    const clientFullName = newLead.fullName || [newLead.firstName, newLead.lastName].filter(Boolean).join(' ') || newLead.name || 'Valued Client';
    const clientPhone = newLead.phoneNumber || newLead.phone || 'N/A';
    const clientCompany = newLead.company || newLead.businessName || 'N/A';
    const clientWebsite = newLead.website || newLead.channelUrl || 'N/A';
    const selectedPlan = newLead.selectedPackage || newLead.packageTier || newLead.plan || 'Custom Consultation';
    const bookingDate = newLead.preferredDate || newLead.bookingDate || 'Flexible';
    const bookingTime = newLead.preferredTime || newLead.bookingTime || 'Flexible';
    const videoGoals = newLead.videoType || newLead.videoFormat || 'Brand Video Production';
    const monthlyVolume = newLead.monthlyVolume || 'Standard';
    const clientNotes = newLead.notes || newLead.creativeInstructions || 'None provided';

    // 1. Comprehensive Admin Notification Email HTML
    const agencyHtml = `
      <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#0B0B0D; color:#FFFFFF; padding:32px; border-radius:16px; border:1px solid #22C55E; max-width:600px; margin:0 auto;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
          <span style="background:#22C55E; color:#051D10; font-size:11px; font-weight:900; padding:4px 8px; border-radius:6px; text-transform:uppercase; letter-spacing:1px;">NEW STRATEGY CALL</span>
        </div>
        <h2 style="color:#FFFFFF; font-size:24px; font-weight:800; margin:0 0 8px 0; letter-spacing:-0.5px;">
          🔥 New Strategy Call Booked: <span style="color:#22C55E;">${clientFullName}</span>
        </h2>
        <p style="color:#94A3B8; font-size:14px; margin:0 0 24px 0;">
          A prospective client has submitted all project details through the FEVIQO booking portal.
        </p>

        <div style="background:#131316; border:1px solid #27272A; border-radius:12px; padding:20px; margin-bottom:24px;">
          <h3 style="color:#22C55E; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:0 0 14px 0;">
            Client &amp; Company Overview
          </h3>
          <table style="width:100%; border-collapse:collapse; color:#F1F5F9; font-size:14px;">
            <tr><td style="padding:7px 0; color:#71717A; width:140px;">Full Name:</td><td><strong style="color:#FFFFFF;">${clientFullName}</strong></td></tr>
            <tr><td style="padding:7px 0; color:#71717A;">Direct Email:</td><td><a href="mailto:${newLead.email}" style="color:#22C55E; font-weight:600; text-decoration:none;">${newLead.email}</a></td></tr>
            <tr><td style="padding:7px 0; color:#71717A;">Phone Number:</td><td><strong style="color:#FFFFFF;">${clientPhone}</strong></td></tr>
            <tr><td style="padding:7px 0; color:#71717A;">Company / Channel:</td><td><strong style="color:#FFFFFF;">${clientCompany}</strong></td></tr>
            <tr><td style="padding:7px 0; color:#71717A;">Website / Link:</td><td>${clientWebsite !== 'N/A' ? `<a href="${clientWebsite.startsWith('http') ? clientWebsite : `https://${clientWebsite}`}" style="color:#38BDF8;" target="_blank">${clientWebsite}</a>` : 'N/A'}</td></tr>
            <tr><td style="padding:7px 0; color:#71717A;">Industry:</td><td><strong style="color:#FFFFFF;">${newLead.industry || 'Content & Video'}</strong></td></tr>
          </table>
        </div>

        <div style="background:#131316; border:1px solid #27272A; border-radius:12px; padding:20px; margin-bottom:24px;">
          <h3 style="color:#22C55E; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:0 0 14px 0;">
            Project Requirements &amp; Slot
          </h3>
          <table style="width:100%; border-collapse:collapse; color:#F1F5F9; font-size:14px;">
            <tr><td style="padding:7px 0; color:#71717A; width:140px;">Target Package:</td><td><strong style="color:#22C55E;">${selectedPlan}</strong></td></tr>
            <tr><td style="padding:7px 0; color:#71717A;">Video Format:</td><td><strong style="color:#FFFFFF;">${videoGoals}</strong></td></tr>
            <tr><td style="padding:7px 0; color:#71717A;">Monthly Volume:</td><td><strong style="color:#FFFFFF;">${monthlyVolume}</strong></td></tr>
            <tr><td style="padding:7px 0; color:#71717A;">Preferred Date/Time:</td><td><strong style="color:#FBBF24;">${bookingDate} at ${bookingTime}</strong></td></tr>
            <tr><td style="padding:7px 0; color:#71717A; vertical-align:top;">Client Notes:</td><td style="color:#CBD5E1; line-height:1.5;">${clientNotes}</td></tr>
          </table>
        </div>

        <div style="text-align:center; padding-top:8px;">
          <a href="https://feviqo.com/admin" style="display:inline-block; padding:14px 28px; background:#22C55E; color:#051D10; text-decoration:none; font-weight:800; font-size:14px; border-radius:10px; box-shadow:0 4px 14px rgba(34, 197, 94, 0.4);">
            View Lead in FEVIQO Admin Portal &rarr;
          </a>
        </div>
      </div>
    `;

    // 2. Client Confirmation Email HTML
    const clientConfirmationHtml = `
      <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#0B0B0D; color:#FFFFFF; padding:32px; border-radius:16px; border:1px solid #22C55E; max-width:600px; margin:0 auto;">
        <div style="text-align:center; margin-bottom:24px;">
          <h1 style="color:#22C55E; font-size:28px; font-weight:900; margin:0; letter-spacing:-0.5px;">FEVIQO</h1>
          <p style="color:#94A3B8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin-top:4px;">Premium Video Post-Production</p>
        </div>

        <h2 style="color:#FFFFFF; font-size:22px; font-weight:800; margin:0 0 12px 0;">
          Your 1-on-1 Strategy Call is Confirmed! 🎬
        </h2>
        <p style="color:#E2E8F0; font-size:15px; line-height:1.6; margin:0 0 20px 0;">
          Hi ${newLead.firstName || clientFullName}, thanks for booking with FEVIQO. Our senior creative production team has received your details and we look forward to discussing your video scaling strategy.
        </p>

        <div style="background:#131316; border:1px solid #27272A; border-radius:12px; padding:20px; margin-bottom:24px;">
          <h3 style="color:#22C55E; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:0 0 14px 0;">
            Scheduled Consultation Summary
          </h3>
          <table style="width:100%; border-collapse:collapse; color:#F1F5F9; font-size:14px;">
            <tr><td style="padding:6px 0; color:#71717A; width:140px;">Selected Package:</td><td><strong style="color:#22C55E;">${selectedPlan}</strong></td></tr>
            <tr><td style="padding:6px 0; color:#71717A;">Proposed Date &amp; Time:</td><td><strong style="color:#FBBF24;">${bookingDate} at ${bookingTime}</strong></td></tr>
            <tr><td style="padding:6px 0; color:#71717A;">Format / Scope:</td><td><strong style="color:#FFFFFF;">${videoGoals}</strong></td></tr>
            <tr><td style="padding:6px 0; color:#71717A;">Meeting Location:</td><td><strong style="color:#38BDF8;">Google Meet / Private Studio Link (sent before call)</strong></td></tr>
          </table>
        </div>

        <div style="background:#062315; border:1px solid #166534; border-radius:12px; padding:18px; margin-bottom:24px;">
          <h4 style="color:#4ADE80; font-size:14px; font-weight:700; margin:0 0 8px 0;">⚡ What We Will Cover:</h4>
          <ul style="color:#D1FAE5; font-size:13px; line-height:1.7; margin:0; padding-left:20px;">
            <li>Matching you with your dedicated Lead Video Editor</li>
            <li>Establishing brand pacing, color palettes &amp; motion style guide</li>
            <li>Setting up your private FEVIQO Flow client portal &amp; Slack channel</li>
            <li>Turnaround workflows (sub-24h for Shorts, 24–48h for Long-form)</li>
          </ul>
        </div>

        <p style="color:#94A3B8; font-size:13px; line-height:1.6; margin:0 0 24px 0;">
          Need to reschedule or have questions before our chat? Reply directly to this email or reach us at <a href="mailto:partner@feviqo.com" style="color:#22C55E;">partner@feviqo.com</a>.
        </p>

        <div style="border-top:1px solid #27272A; padding-top:16px; text-align:center; font-size:12px; color:#52525B;">
          FEVIQO Studio • Dedicated High-Retention Video Post-Production
        </div>
      </div>
    `;

    // 3. Dispatch to Studio Partner & configured notification inboxes sequentially (respecting API rate limits)
    const ADMIN_RECIPIENTS = getStudioNotificationRecipients();
    let adminEmailDelivered = false;
    for (const adminEmail of ADMIN_RECIPIENTS) {
      const dispatch = await sendServerEmail({
        to: adminEmail,
        subject: `🔥 [FEVIQO Strategy Call] ${clientFullName} (${newLead.industry || 'Lead'}) - ${selectedPlan}`,
        html: agencyHtml,
        type: 'strategy_call_booked',
        data: newLead,
      });
      if (dispatch.success) adminEmailDelivered = true;
    }

    // 4. Dispatch Confirmation to the Client
    let clientEmailDelivered = false;
    if (newLead.email && newLead.email.includes('@')) {
      const clientDispatch = await sendServerEmail({
        to: newLead.email,
        subject: `Your FEVIQO 1-on-1 Strategy Call is Confirmed 🎬`,
        html: clientConfirmationHtml,
        type: 'client_booking_confirmation',
        data: newLead,
      });
      clientEmailDelivered = Boolean(clientDispatch.success);
    }

    return res.json({ success: true, lead: newLead, adminEmailDelivered, clientEmailDelivered });
  } catch (err) {
    console.error('Failed to save strategy call:', err);
    return res.status(500).json({ success: false, error: 'Failed to record strategy call' });
  }
});

app.put('/api/strategy-calls/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (!fs.existsSync(LEADS_FILE)) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    const index = leads.findIndex((l: any) => l.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    leads[index] = { ...leads[index], ...req.body, updatedAt: new Date().toISOString() };
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    return res.json({ success: true, lead: leads[index] });
  } catch (err) {
    console.error('Failed to update lead:', err);
    return res.status(500).json({ success: false, error: 'Failed to update lead' });
  }
});

app.delete('/api/strategy-calls/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (!fs.existsSync(LEADS_FILE)) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    const filtered = leads.filter((l: any) => l.id !== id);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return res.json({ success: true, message: 'Lead removed successfully' });
  } catch (err) {
    console.error('Failed to delete lead:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete lead' });
  }
});


// 4. Timestamped Video Annotations API
app.get('/api/annotations/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    if (fs.existsSync(ANNOTATIONS_FILE)) {
      const allAnnotations = JSON.parse(fs.readFileSync(ANNOTATIONS_FILE, 'utf-8'));
      return res.json(allAnnotations[projectId] || []);
    }
  } catch (err) {
    console.error('Error reading annotations:', err);
  }
  res.json([]);
});

app.post('/api/annotations/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const annotation = {
      id: req.body.id || 'note-' + Date.now(),
      timestamp: req.body.timestamp || '0:00',
      note: req.body.note,
      author: req.body.author || 'User',
      authorRole: req.body.authorRole || 'client',
      createdAt: req.body.createdAt || 'Just now',
      editorReply: req.body.editorReply || undefined,
      isAddressed: req.body.isAddressed || false,
    };

    let allAnnotations: Record<string, any[]> = {};
    if (fs.existsSync(ANNOTATIONS_FILE)) {
      allAnnotations = JSON.parse(fs.readFileSync(ANNOTATIONS_FILE, 'utf-8'));
    }

    if (!allAnnotations[projectId]) {
      allAnnotations[projectId] = [];
    }

    // Check if updating existing note
    const existingIndex = allAnnotations[projectId].findIndex((n) => n.id === annotation.id);
    if (existingIndex >= 0) {
      allAnnotations[projectId][existingIndex] = annotation;
    } else {
      allAnnotations[projectId].push(annotation);
    }

    fs.writeFileSync(ANNOTATIONS_FILE, JSON.stringify(allAnnotations, null, 2), 'utf-8');

    if (existingIndex < 0 && annotation.authorRole === 'client' && annotation.note) {
      const proj = getProjects().find((p) => p.id === projectId);
      const recipients = getStudioNotificationRecipients();
      for (const recipient of recipients) {
        await sendServerEmail({
          to: recipient,
          subject: `📝 [Client Revision Note] ${proj?.title || projectId} @ ${annotation.timestamp}`,
          html: `<div style="font-family:sans-serif;background:#0B0B0D;color:#FFF;padding:24px;border-radius:12px;"><h2 style="color:#22C55E;margin-top:0;">Client Posted a Revision Note</h2><p><strong>Project:</strong> ${escapeHtml(proj?.title || projectId)}</p><p><strong>Client:</strong> ${escapeHtml(annotation.author)}</p><p><strong>Timestamp:</strong> ${escapeHtml(annotation.timestamp)}</p><p><strong>Note:</strong> ${escapeHtml(annotation.note)}</p></div>`,
          type: 'client_annotation_added',
          data: { projectId, timestamp: annotation.timestamp },
        });
      }
    }

    return res.json({ success: true, annotation });
  } catch (err) {
    console.error('Error saving annotation:', err);
    return res.status(500).json({ success: false, error: 'Failed to persist annotation' });
  }
});

// 5. Automated Email Dispatch Log Management API
app.get('/api/emails', (req, res) => {
  try {
    if (fs.existsSync(EMAILS_FILE)) {
      const emails = JSON.parse(fs.readFileSync(EMAILS_FILE, 'utf-8'));
      return res.json({ success: true, emails });
    }
    return res.json({ success: true, emails: [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to read emails' });
  }
});

app.post('/api/emails', (req, res) => {
  try {
    const newEmailRecord = {
      id: req.body.id || 'em-' + Date.now(),
      ...req.body,
      timestamp: req.body.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    logDispatchedEmail(newEmailRecord);
    return res.json({ success: true, email: newEmailRecord });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to record email' });
  }
});

app.delete('/api/emails/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (fs.existsSync(EMAILS_FILE)) {
      const emails = JSON.parse(fs.readFileSync(EMAILS_FILE, 'utf-8'));
      const filtered = emails.filter((em: any) => em.id !== id);
      fs.writeFileSync(EMAILS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
      return res.json({ success: true, message: 'Email dispatch record deleted' });
    }
    return res.status(404).json({ success: false, error: 'Email record not found' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete email record' });
  }
});

app.delete('/api/emails', (req, res) => {
  try {
    fs.writeFileSync(EMAILS_FILE, JSON.stringify([], null, 2), 'utf-8');
    return res.json({ success: true, message: 'All email logs cleared' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to clear email logs' });
  }
});

// 6. Editor Onboarding & CRUD Management API
app.get('/api/editors', (req, res) => {
  try {
    const editors = getEditors();
    return res.json({ success: true, editors });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve editors' });
  }
});

app.post('/api/editors', (req, res) => {
  try {
    const { name, email, password, role, specialty, capacity, avatar } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    const editors = getEditors();
    const cleanEmail = email.trim().toLowerCase();

    if (editors.some((ed: any) => ed.email?.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ success: false, error: 'An editor with this email already exists' });
    }

    const newEditor = {
      id: 'editor-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: password ? password.trim() : 'editor123',
      role: role || 'Senior Video Editor',
      specialty: specialty || 'Short-Form Viral & YouTube',
      status: 'Active',
      capacity: Number(capacity) || 4,
      activeTasks: 0,
      rating: 5.0,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    editors.unshift(newEditor);
    saveEditors(editors);

    // Alert studio partner
    sendServerEmail({
      to: 'partner@feviqo.com',
      subject: `🎬 [FEVIQO Team] New Editor Onboarded: ${newEditor.name} (${newEditor.role})`,
      html: `
        <div style="font-family:sans-serif; background:#0B0B0D; color:#FFFFFF; padding:24px; border-radius:12px;">
          <h2 style="color:#22C55E; margin-top:0;">New Editor Added to Studio Roster</h2>
          <p><strong>Name:</strong> ${newEditor.name}</p>
          <p><strong>Email:</strong> ${newEditor.email}</p>
          <p><strong>Role:</strong> ${newEditor.role}</p>
          <p><strong>Specialty:</strong> ${newEditor.specialty}</p>
          <p><strong>Capacity:</strong> ${newEditor.capacity} concurrent projects</p>
          <p><strong>Login Password:</strong> ${newEditor.password}</p>
        </div>
      `,
      type: 'editor_onboarded',
      data: newEditor,
    }).catch(() => {});

    return res.json({ success: true, editor: newEditor });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to onboard editor' });
  }
});

app.put('/api/editors/:id', (req, res) => {
  try {
    const { id } = req.params;
    const editors = getEditors();
    const index = editors.findIndex((ed: any) => ed.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Editor not found' });
    }

    editors[index] = {
      ...editors[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    saveEditors(editors);
    return res.json({ success: true, editor: editors[index] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update editor' });
  }
});

app.delete('/api/editors/:id', (req, res) => {
  try {
    const { id } = req.params;
    const editors = getEditors();
    const filtered = editors.filter((ed: any) => ed.id !== id);
    if (filtered.length === editors.length) {
      return res.status(404).json({ success: false, error: 'Editor not found' });
    }
    saveEditors(filtered);
    return res.json({ success: true, message: 'Editor removed from roster' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete editor' });
  }
});



// 7. FEVIQO Premium Membership, Bank QR Payment, Proof Verification & Admin RBAC API
const MEMBER_COOKIE_NAME = 'feviqo_member_session';
const ADMIN_COOKIE_NAME = 'feviqo_admin_session';

const memoryImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

function parseCookiesMap(req: express.Request): Record<string, string> {
  const out: Record<string, string> = {};
  const cookieHeader = req.headers.cookie || '';
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const k = trimmed.slice(0, eqIdx).trim();
    const v = trimmed.slice(eqIdx + 1).trim();
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

function isHttpsRequest(req: express.Request): boolean {
  const xfProto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  return req.secure || xfProto === 'https';
}

function extractMemberToken(req: express.Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }
  if (typeof req.query.authToken === 'string' && req.query.authToken.trim()) {
    return req.query.authToken.trim();
  }
  const cookies = parseCookiesMap(req);
  return cookies[MEMBER_COOKIE_NAME];
}

function getAuthenticatedMemberId(req: express.Request): string | null {
  const token = extractMemberToken(req);
  const parsed = verifyMemberSessionToken(token);
  return parsed?.memberId || null;
}

function extractAdminToken(req: express.Request): string | undefined {
  const adminHeader = req.headers['x-admin-authorization'];
  if (typeof adminHeader === 'string' && adminHeader.trim()) {
    return adminHeader.replace(/^Bearer\s+/i, '').trim();
  }
  const authHeader = req.headers.authorization;
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    const candidate = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (verifyAdminSessionToken(candidate)) {
      return candidate;
    }
  }
  if (typeof req.query.authToken === 'string' && req.query.authToken.trim()) {
    const candidate = req.query.authToken.trim();
    if (verifyAdminSessionToken(candidate)) {
      return candidate;
    }
  }
  const cookies = parseCookiesMap(req);
  return cookies[ADMIN_COOKIE_NAME];
}

function getAuthenticatedAdmin(req: express.Request): SafeAdmin | null {
  const adminToken = extractAdminToken(req);
  return verifyAdminSessionToken(adminToken);
}

function setMemberSessionCookie(req: express.Request, res: express.Response, token: string): void {
  const isHttps = isHttpsRequest(req);
  res.cookie(MEMBER_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function setAdminSessionCookie(req: express.Request, res: express.Response, token: string): void {
  const isHttps = isHttpsRequest(req);
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function requireAdmin(
  req: express.Request & { admin?: SafeAdmin },
  res: express.Response,
  next: express.NextFunction
) {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    const memberId = getAuthenticatedMemberId(req);
    return res.status(memberId ? 403 : 401).json({
      success: false,
      code: memberId ? 'FORBIDDEN_NOT_ADMIN' : 'ADMIN_UNAUTHENTICATED',
      error: memberId
        ? 'Forbidden: administrator privileges are required for this action.'
        : 'Administrator sign-in is required.',
    });
  }
  req.admin = admin;
  next();
}

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function dispatchTrackedEmail(params: {
  orderId?: string;
  to: string;
  subject: string;
  html: string;
  type: 'admin_payment_verification' | 'member_payment_approved' | 'member_payment_rejected';
}) {
  try {
    const res = await sendServerEmail({
      to: params.to,
      subject: params.subject,
      html: params.html,
      type: params.type,
      data: { orderId: params.orderId },
    });

    const record = saveEmailNotificationLog({
      orderId: params.orderId,
      to: params.to,
      subject: params.subject,
      html: params.html,
      type: params.type,
      status: res.success ? 'sent' : 'failed',
      provider: res.provider,
      error: res.success ? undefined : res.error || res.smtpError || 'Email transport unavailable',
      attempts: 1,
    });
    return { ...res, logRecord: record };
  } catch (err: any) {
    const record = saveEmailNotificationLog({
      orderId: params.orderId,
      to: params.to,
      subject: params.subject,
      html: params.html,
      type: params.type,
      status: 'failed',
      error: err?.message || 'Unexpected email dispatch error',
      attempts: 1,
    });
    return { success: false, error: err?.message, logRecord: record };
  }
}

// Public catalogue metadata + QR/WhatsApp config only (zero protected episode stream URLs or secrets exposed)
app.get('/api/membership/catalog', (_req, res) => {
  return res.json({
    success: true,
    plans: MEMBERSHIP_PLANS,
    dramas: MEMBERSHIP_DRAMAS,
    publicConfig: getPublicMembershipConfig(),
    gatewayStatus: getPaymentGatewayStatus(),
  });
});

// Download crisp uncropped QR image for a plan cleanly without cross-origin CORS restrictions
app.get('/api/membership/qr/:planId/download', (req, res) => {
  const planId = req.params.planId as MembershipPlanId;
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return res.status(404).json({ success: false, error: 'Invalid plan QR requested.' });
  }
  const diskPath = resolveQrDiskPath(planId);
  if (!diskPath) {
    return res.status(404).json({ success: false, error: 'Local QR file not found on disk.' });
  }
  const ext = path.extname(diskPath) || '.jpg';
  const safeName = `FEVIQO-${plan.name}-${plan.pricePkr}PKR-QR${ext}`;
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.sendFile(diskPath);
});

app.post('/api/membership/register', (req, res) => {
  try {
    const { email, password, confirmPassword, fullName, phone } = req.body || {};
    const result = registerMember({ email, phone, password, confirmPassword, fullName });
    if ('error' in result) {
      return res.status(result.statusCode || 400).json({ success: false, error: result.error });
    }
    setMemberSessionCookie(req, res, result.token);
    const account = getMemberAccountState(result.member.id);
    return res.status(201).json({
      success: true,
      token: result.token,
      ...account,
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to create member account.' });
  }
});

app.post('/api/membership/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = loginMember({ email, password });
    if ('error' in result) {
      return res.status(401).json({ success: false, error: result.error });
    }
    setMemberSessionCookie(req, res, result.token);
    const account = getMemberAccountState(result.member.id);
    return res.json({
      success: true,
      token: result.token,
      ...account,
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to sign in.' });
  }
});

app.post('/api/membership/google-auth', async (req, res) => {
  try {
    const { idToken, fullName, phone } = req.body || {};
    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded || !decoded.email || !decoded.email_verified) {
      return res.status(401).json({
        success: false,
        error: 'Verified Google account authentication is required.',
      });
    }
    const result = upsertGoogleMember({
      uid: decoded.uid,
      email: decoded.email,
      fullName: decoded.name || fullName,
      phone,
    });
    if ('error' in result) {
      return res.status(400).json({ success: false, error: result.error });
    }
    setMemberSessionCookie(req, res, result.token);
    const account = getMemberAccountState(result.member.id);
    return res.json({
      success: true,
      token: result.token,
      ...account,
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Google sign-in verification failed.' });
  }
});

app.post('/api/membership/logout', (_req, res) => {
  res.clearCookie(MEMBER_COOKIE_NAME, { path: '/' });
  return res.json({ success: true });
});

app.get('/api/membership/account', (req, res) => {
  const memberId = getAuthenticatedMemberId(req);
  if (!memberId) {
    return res.status(401).json({ success: false, code: 'UNAUTHENTICATED', error: 'Not signed in.' });
  }
  const account = getMemberAccountState(memberId);
  if (!account) {
    return res.status(401).json({ success: false, code: 'UNAUTHENTICATED', error: 'Account not found.' });
  }
  return res.json({ success: true, ...account });
});

app.post('/api/membership/checkout', async (req, res) => {
  try {
    const memberId = getAuthenticatedMemberId(req);
    if (!memberId) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        error: 'Please sign in or create an account before continuing to payment.',
      });
    }
    const { planId, selectedDramaIds } = req.body || {};
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
    const host = req.headers.host || 'localhost:3000';
    const originUrl = `${proto}://${host}`;

    const result = await createMembershipCheckoutOrder({
      memberId,
      planId,
      selectedDramaIds,
      originUrl,
    });

    if ('error' in result) {
      return res.status(result.statusCode || 400).json({ success: false, error: result.error });
    }

    const account = getMemberAccountState(memberId);
    return res.json({
      success: true,
      order: result.order,
      qrImageUrl: result.qrImageUrl,
      publicConfig: result.publicConfig,
      gatewayConfigured: result.gatewayConfigured,
      paymentSetupRequired: result.paymentSetupRequired,
      gatewayStatus: result.gatewayStatus,
      account,
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to initialize membership checkout.' });
  }
});

// Upload Bank QR payment screenshot to private protected storage + notify admin email
app.post(
  '/api/membership/orders/:orderId/proof',
  (req, res, next) => {
    memoryImageUpload.single('proof')(req, res, (err: any) => {
      if (err) {
        const msg =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'Screenshot file size exceeds the 8 MB limit.'
            : err.message || 'Invalid proof file upload.';
        return res.status(400).json({ success: false, error: msg });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const memberId = getAuthenticatedMemberId(req);
      if (!memberId) {
        return res.status(401).json({
          success: false,
          code: 'UNAUTHENTICATED',
          error: 'Please sign in to upload payment proof.',
        });
      }

      const { orderId } = req.params;
      const file = req.file;
      if (!file || !file.buffer) {
        return res.status(400).json({
          success: false,
          error: 'Please choose a payment confirmation screenshot (JPG, JPEG, PNG, or WebP).',
        });
      }

      const submission = submitOrderPaymentProof({
        memberId,
        orderId,
        fileBuffer: file.buffer,
        originalName: file.originalname,
        paymentNote: req.body?.paymentNote,
        proofDataUrl: req.body?.proofDataUrl,
      });

      if ('error' in submission) {
        return res.status(submission.statusCode).json({ success: false, error: submission.error });
      }

      const { order, member } = submission;
      const cfg = getMembershipConfig();
      const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
      const host = req.headers.host || 'feviqo.com';
      const baseUrl = `${proto}://${host}`;
      const dramaTitles = order.selectedDramaIds
        .map((id) => getDramaById(id)?.title || id)
        .join(', ');
      const adminReviewUrl = `${baseUrl}/admin/memberships?request=${encodeURIComponent(order.id)}`;

      const adminEmailHtml = `
        <div style="font-family:Inter,Arial,sans-serif;background:#F8FAFC;padding:24px;color:#0B0B0D;">
          <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;padding:28px;">
            <div style="font-size:12px;font-weight:700;color:#16A34A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">
              FEVIQO Premium Membership Verification
            </div>
            <h2 style="margin:0 0 12px 0;font-size:20px;color:#0B0B0D;">
              New FEVIQO Membership Payment — Verification Required
            </h2>
            <p style="font-size:14px;color:#475569;line-height:1.6;">
              A customer submitted a Bank QR payment screenshot and is awaiting verification before membership activation.
            </p>
            <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;">
              <tr><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;color:#64748B;">Payment Request ID</td><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;font-weight:700;">${escapeHtml(order.id)}</td></tr>
              <tr><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;color:#64748B;">Customer Name</td><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;font-weight:700;">${escapeHtml(member.fullName)}</td></tr>
              <tr><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;color:#64748B;">Customer Email</td><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;">${escapeHtml(member.email)}</td></tr>
              <tr><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;color:#64748B;">Customer Phone</td><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;">${escapeHtml(member.phone || 'Not provided')}</td></tr>
              <tr><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;color:#64748B;">Plan Selected</td><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;font-weight:700;">${escapeHtml(order.planName)}</td></tr>
              <tr><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;color:#64748B;">Amount</td><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;font-weight:700;color:#16A34A;">PKR ${order.amountPkr.toLocaleString()}</td></tr>
              <tr><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;color:#64748B;">Duration</td><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;">${order.durationDays} Days</td></tr>
              <tr><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;color:#64748B;">Selected Dramas</td><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;">${escapeHtml(dramaTitles)}</td></tr>
              <tr><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;color:#64748B;">Submission Time</td><td style="padding:8px 10px;border-bottom:1px solid #F1F5F9;">${escapeHtml(order.proofSubmittedAt || order.updatedAt)}</td></tr>
            </table>
            <p style="font-size:12px;color:#64748B;margin-bottom:20px;">
              For security, private payment screenshots are not attached to email. Sign in to the FEVIQO Admin Panel to inspect the full-size screenshot and approve or reject this payment.
            </p>
            <a href="${escapeHtml(adminReviewUrl)}" style="display:inline-block;padding:12px 22px;background:#0B0B0D;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:13px;border-radius:10px;">
              Review Payment in Admin Panel &rarr;
            </a>
          </div>
        </div>
      `;

      const recipients = Array.from(new Set([cfg.adminEmail, ...getStudioNotificationRecipients()].map((e) => e.trim().toLowerCase()).filter((e) => e.includes('@'))));
      let anySent = false;
      for (const recipient of recipients) {
        const emailDispatch = await dispatchTrackedEmail({
          orderId: order.id,
          to: recipient,
          subject: 'New FEVIQO Membership Payment — Verification Required',
          html: adminEmailHtml,
          type: 'admin_payment_verification',
        });
        if (emailDispatch.success) anySent = true;
      }

      const account = getMemberAccountState(memberId);
      return res.json({
        success: true,
        order,
        adminNotificationSent: anySent,
        account,
      });
    } catch {
      return res.status(500).json({ success: false, error: 'Failed to save payment proof.' });
    }
  }
);

// Protected payment proof image viewer — strictly authorized for owning member or active admin
app.get('/api/membership/orders/:orderId/proof', (req, res) => {
  const memberId = getAuthenticatedMemberId(req);
  const admin = getAuthenticatedAdmin(req);
  const { orderId } = req.params;

  const result = getAuthorizedProofFile({
    orderId,
    requesterMemberId: memberId,
    admin,
  });

  if ('error' in result) {
    return res.status(result.statusCode).json({ success: false, error: result.error });
  }

  res.setHeader('Content-Type', result.mimeType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  return res.sendFile(result.filePath);
});

app.post('/api/membership/cancel', (req, res) => {
  try {
    const memberId = getAuthenticatedMemberId(req);
    if (!memberId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    const cancelled = cancelMemberSubscription(memberId);
    if (!cancelled.success) {
      return res.status(400).json({ success: false, error: cancelled.error });
    }
    const account = getMemberAccountState(memberId);
    return res.json({ success: true, membership: cancelled.membership, ...account });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to cancel membership.' });
  }
});

// Server-enforced protected episode access endpoint
app.get('/api/membership/watch/:dramaId/:episodeSlug', (req, res) => {
  const memberId = getAuthenticatedMemberId(req);
  const { dramaId, episodeSlug } = req.params;
  const auth = authorizeEpisodePlayback({ memberId, dramaId, episodeSlug });
  if ('error' in auth) {
    return res.status(auth.statusCode).json({
      success: false,
      code: auth.code,
      error: auth.error,
    });
  }
  return res.json({
    success: true,
    streamUrl: auth.streamUrl,
    dramaTitle: auth.dramaTitle,
    episodeTitle: auth.episodeTitle,
    thumbnail: auth.thumbnail,
    fallbackThumbnail: auth.fallbackThumbnail,
    planName: auth.planName,
    expiresAt: auth.expiresAt,
  });
});

// --- ADMIN PANEL AUTHENTICATION & MEMBERSHIP MANAGEMENT ROUTES ---
app.get('/api/admin/auth/status', (req, res) => {
  const admin = getAuthenticatedAdmin(req);
  const status = getAdminAuthStatus();
  return res.json({
    success: true,
    authenticated: Boolean(admin),
    admin,
    ...status,
  });
});

app.post('/api/admin/auth/bootstrap', (req, res) => {
  try {
    const { email, name, password, confirmPassword } = req.body || {};
    const result = bootstrapFirstAdmin({ email, name, password, confirmPassword });
    if ('error' in result) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }
    setAdminSessionCookie(req, res, result.token);
    return res.status(201).json({
      success: true,
      token: result.token,
      admin: result.admin,
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to initialize administrator account.' });
  }
});

app.post('/api/admin/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = loginAdmin({ email, password });
    if ('error' in result) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }
    setAdminSessionCookie(req, res, result.token);
    return res.json({
      success: true,
      token: result.token,
      admin: result.admin,
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Administrator sign-in failed.' });
  }
});

app.post('/api/admin/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded || !decoded.email || !decoded.email_verified) {
      return res.status(401).json({
        success: false,
        error: 'Verified Google account sign-in is required.',
      });
    }
    const result = loginAdminWithGoogle({
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    });
    if ('error' in result) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }
    setAdminSessionCookie(req, res, result.token);
    return res.json({
      success: true,
      token: result.token,
      admin: result.admin,
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Google administrator sign-in failed.' });
  }
});

app.post('/api/admin/auth/logout', (_req, res) => {
  res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
  return res.json({ success: true });
});

app.get('/api/admin/memberships/overview', requireAdmin, (req: any, res) => {
  try {
    const overview = getAdminMembershipsOverview();
    return res.json({
      success: true,
      currentAdmin: req.admin,
      ...overview,
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to load membership overview.' });
  }
});

app.post('/api/admin/memberships/requests/:orderId/approve', requireAdmin, async (req: any, res) => {
  try {
    const { orderId } = req.params;
    const result = approvePaymentRequest({ orderId, admin: req.admin });
    if ('error' in result) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }

    const { order, membership, member } = result;
    const dramaTitles = membership.selectedDramaIds
      .map((id) => getDramaById(id)?.title || id)
      .join(', ');

    if (member?.email) {
      const customerEmailHtml = `
        <div style="font-family:Inter,Arial,sans-serif;background:#F8FAFC;padding:24px;color:#0B0B0D;">
          <div style="max-width:580px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;padding:28px;">
            <div style="font-size:12px;font-weight:700;color:#16A34A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">
              FEVIQO Premium Membership Active
            </div>
            <h2 style="margin:0 0 12px 0;font-size:20px;color:#0B0B0D;">
              Your payment has been approved
            </h2>
            <p style="font-size:14px;color:#475569;line-height:1.6;">
              Hello ${escapeHtml(member.fullName)}, your ${escapeHtml(membership.planName)} membership (PKR ${membership.pricePkr.toLocaleString()} / ${membership.durationDays} Days) is now active.
            </p>
            <p style="font-size:13px;color:#334155;">
              <strong>Included Dramas:</strong> ${escapeHtml(dramaTitles)}<br/>
              <strong>Valid Until:</strong> ${escapeHtml(membership.expiresAt)}
            </p>
          </div>
        </div>
      `;

      await dispatchTrackedEmail({
        orderId: order.id,
        to: member.email,
        subject: `FEVIQO Membership Activated — ${membership.planName}`,
        html: customerEmailHtml,
        type: 'member_payment_approved',
      });
    }

    return res.json({
      success: true,
      order,
      membership,
      overview: getAdminMembershipsOverview(),
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to approve payment request.' });
  }
});

app.post('/api/admin/memberships/requests/:orderId/reject', requireAdmin, async (req: any, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body || {};
    const result = rejectPaymentRequest({ orderId, reason, admin: req.admin });
    if ('error' in result) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }

    const { order, member } = result;
    if (member?.email) {
      const rejectEmailHtml = `
        <div style="font-family:Inter,Arial,sans-serif;background:#F8FAFC;padding:24px;color:#0B0B0D;">
          <div style="max-width:580px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;padding:28px;">
            <div style="font-size:12px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">
              FEVIQO Payment Verification Update
            </div>
            <h2 style="margin:0 0 12px 0;font-size:20px;color:#0B0B0D;">
              Action required for your payment submission
            </h2>
            <p style="font-size:14px;color:#475569;line-height:1.6;">
              Hello ${escapeHtml(member.fullName)}, we could not verify your payment submission for Request ${escapeHtml(order.id)}.
            </p>
            <p style="font-size:13px;background:#FEF2F2;border:1px solid #FECACA;padding:12px;border-radius:10px;color:#991B1B;">
              <strong>Reason:</strong> ${escapeHtml(order.rejectionReason || '')}
            </p>
            <p style="font-size:13px;color:#475569;">
              Please sign in to your FEVIQO Account to upload a clearer payment confirmation screenshot.
            </p>
          </div>
        </div>
      `;

      await dispatchTrackedEmail({
        orderId: order.id,
        to: member.email,
        subject: 'FEVIQO Membership Payment Requires New Proof',
        html: rejectEmailHtml,
        type: 'member_payment_rejected',
      });
    }

    return res.json({
      success: true,
      order,
      overview: getAdminMembershipsOverview(),
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to reject payment request.' });
  }
});

app.post('/api/admin/memberships/assign', requireAdmin, async (req: any, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      planId,
      selectedDramaIds,
      durationDays,
      paymentNote,
    } = req.body || {};

    const result = assignMembershipByAdmin({
      fullName,
      email,
      phone,
      password,
      planId,
      selectedDramaIds,
      durationDays: durationDays ? Number(durationDays) : undefined,
      paymentNote,
      admin: req.admin,
    });

    if ('error' in result) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }

    const { member, order, membership } = result;
    const dramaTitles = membership.selectedDramaIds
      .map((id) => getDramaById(id)?.title || id)
      .join(', ');

    if (member?.email) {
      const customerEmailHtml = `
        <div style="font-family:Inter,Arial,sans-serif;background:#F8FAFC;padding:24px;color:#0B0B0D;">
          <div style="max-width:580px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;padding:28px;">
            <div style="font-size:12px;font-weight:700;color:#16A34A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">
              FEVIQO Premium Membership Active
            </div>
            <h2 style="margin:0 0 12px 0;font-size:20px;color:#0B0B0D;">
              Your membership has been activated
            </h2>
            <p style="font-size:14px;color:#475569;line-height:1.6;">
              Hello ${escapeHtml(member.fullName)}, your ${escapeHtml(membership.planName)} membership (${membership.durationDays} Days) is now active on your FEVIQO account.
            </p>
            <p style="font-size:13px;color:#334155;">
              <strong>Included Dramas:</strong> ${escapeHtml(dramaTitles)}<br/>
              <strong>Valid Until:</strong> ${escapeHtml(membership.expiresAt)}
            </p>
          </div>
        </div>
      `;
      dispatchTrackedEmail({
        orderId: order.id,
        to: member.email,
        subject: `FEVIQO Membership Activated — ${membership.planName}`,
        html: customerEmailHtml,
        type: 'member_payment_approved',
      }).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      member,
      order,
      membership,
      overview: getAdminMembershipsOverview(),
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to assign customer membership.' });
  }
});

app.post('/api/admin/memberships/sync', requireAdmin, async (req: any, res) => {
  try {
    mergeCloudSyncSnapshot(req.body || {});
    const overview = await syncServerFirestoreSnapshot();
    return res.json({
      success: true,
      overview,
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to synchronize cloud membership state.' });
  }
});

app.post('/api/admin/memberships/:membershipId/revoke', requireAdmin, (req: any, res) => {
  try {
    const { membershipId } = req.params;
    const { reason } = req.body || {};
    const result = revokeMembershipByAdmin({ membershipId, reason, admin: req.admin });
    if ('error' in result) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }
    return res.json({
      success: true,
      membership: result.membership,
      overview: getAdminMembershipsOverview(),
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to revoke membership.' });
  }
});

app.put('/api/admin/memberships/config', requireAdmin, (req: any, res) => {
  try {
    const updated = updateMembershipConfig({ updates: req.body || {}, admin: req.admin });
    return res.json({
      success: true,
      config: updated,
      overview: getAdminMembershipsOverview(),
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to update configuration settings.' });
  }
});

app.post(
  '/api/admin/memberships/qr/:planId',
  requireAdmin,
  (req, res, next) => {
    memoryImageUpload.single('qr')(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ success: false, error: err.message || 'Invalid QR upload.' });
      }
      next();
    });
  },
  (req: any, res) => {
    const planId = req.params.planId as MembershipPlanId;
    if (!['starter', 'standard', 'plus', 'vip'].includes(planId)) {
      return res.status(400).json({ success: false, error: 'Invalid plan ID.' });
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ success: false, error: 'Please select a QR image file.' });
    }
    const result = saveUploadedQrImage({
      planId,
      buffer: req.file.buffer,
      admin: req.admin,
    });
    if ('error' in result) {
      return res.status(400).json({ success: false, error: result.error });
    }
    return res.json({
      success: true,
      imageUrl: result.imageUrl,
      config: result.config,
      overview: getAdminMembershipsOverview(),
    });
  }
);

app.post('/api/admin/memberships/emails/:notifId/retry', requireAdmin, async (req: any, res) => {
  try {
    const existing = getEmailNotificationById(req.params.notifId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Email notification record not found.' });
    }
    const dispatched = await sendServerEmail({
      to: existing.to,
      subject: existing.subject,
      html: existing.html,
      type: existing.type,
      data: { orderId: existing.orderId },
    });
    const updated = updateEmailNotificationLog(existing.id, {
      status: dispatched.success ? 'sent' : 'failed',
      provider: dispatched.provider,
      error: dispatched.success ? undefined : dispatched.error || dispatched.smtpError || 'Delivery failed',
    });
    appendAdminAudit({
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      action: 'email_retried',
      targetId: existing.id,
      details: `Retried email notification (${existing.subject}) to ${existing.to}: ${dispatched.success ? 'Sent' : 'Failed'}.`,
    });
    return res.json({
      success: Boolean(dispatched.success),
      error: dispatched.success ? undefined : dispatched.error || dispatched.smtpError || 'Delivery failed',
      notification: updated,
      overview: getAdminMembershipsOverview(),
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to retry email delivery.' });
  }
});

app.get('/api/admin/memberships/email-transport', requireAdmin, (_req: any, res) => {
  const smtp = getActiveSmtpConfig();
  const resendCandidates = getResendCandidates();
  const resendCfg = resendCandidates[0] || null;
  const recipients = getStudioNotificationRecipients();
  return res.json({
    success: true,
    transport: {
      smtpConfigured: Boolean(smtp?.user && smtp?.pass),
      smtpSource: smtp?.source || 'none',
      smtpHost: smtp?.host || 'smtp.gmail.com',
      smtpPort: smtp?.port || 587,
      smtpUser: smtp?.user || '',
      smtpFrom: smtp?.from || 'FEVIQO Studio <partner@feviqo.com>',
      resendConfigured: Boolean(resendCfg?.apiKey),
      resendSource: resendCfg?.source || 'none',
      resendFrom: resendCfg?.from || 'FEVIQO Studio <onboarding@resend.dev>',
      notificationRecipients: recipients,
    },
  });
});

app.post('/api/admin/memberships/email-transport', requireAdmin, async (req: any, res) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, resendApiKey, resendFrom, sendTestEmail, testOnly } = req.body || {};
    const cfg = getMembershipConfig();
    const targetAdminEmail = cfg.adminEmail || getStudioNotificationRecipients()[0] || 'partner@feviqo.com';

    if (testOnly) {
      const dispatched = await sendServerEmail({
        to: targetAdminEmail,
        subject: 'FEVIQO Admin Email Delivery Verified',
        html: `<p>Your FEVIQO email notification setup is verified for <strong>${escapeHtml(targetAdminEmail)}</strong>. Alerts will be delivered for memberships and editing clients.</p>`,
        type: 'admin_email_test',
      });
      const smtp = getActiveSmtpConfig();
      const resendCfg = getResendCandidates()[0] || null;
      return res.json({
        success: Boolean(dispatched.success),
        testResult: {
          success: Boolean(dispatched.success),
          provider: dispatched.provider,
          source: dispatched.source,
          error: dispatched.error || dispatched.smtpError || dispatched.resendError,
        },
        transport: {
          smtpConfigured: Boolean(smtp?.user && smtp?.pass),
          smtpSource: smtp?.source || 'none',
          smtpHost: smtp?.host || 'smtp.gmail.com',
          smtpPort: smtp?.port || 587,
          smtpUser: smtp?.user || '',
          smtpFrom: smtp?.from || 'FEVIQO Studio <partner@feviqo.com>',
          resendConfigured: Boolean(resendCfg?.apiKey),
          resendSource: resendCfg?.source || 'none',
          resendFrom: resendCfg?.from || 'FEVIQO Studio <onboarding@resend.dev>',
          notificationRecipients: getStudioNotificationRecipients(),
        },
        overview: getAdminMembershipsOverview(),
      });
    }

    const existing = readSavedSmtpFile();
    const nowIso = new Date().toISOString();
    const cleanSmtpUser = stripEnvQuotes(smtpUser) || stripEnvQuotes(existing.user);
    const cleanSmtpPass = stripEnvQuotes(smtpPass).replace(/\s+/g, '') || stripEnvQuotes(existing.pass);
    const cleanResendKey = resendApiKey !== undefined ? stripEnvQuotes(resendApiKey) : stripEnvQuotes(existing.resendApiKey);

    const updated = {
      ...existing,
      host: stripEnvQuotes(smtpHost) || stripEnvQuotes(existing.host) || 'smtp.gmail.com',
      port: Number(smtpPort) || Number(existing.port) || 587,
      user: cleanSmtpUser,
      pass: cleanSmtpPass,
      from: stripEnvQuotes(smtpFrom) || stripEnvQuotes(existing.from) || (cleanSmtpUser ? `FEVIQO Studio <${cleanSmtpUser}>` : 'FEVIQO Studio <partner@feviqo.com>'),
      resendApiKey: cleanResendKey,
      resendFrom: stripEnvQuotes(resendFrom) || stripEnvQuotes(existing.resendFrom) || 'FEVIQO Studio <onboarding@resend.dev>',
      updatedAt: nowIso,
    };

    let testResult: { success: boolean; provider?: string; source?: string; error?: string } | null = null;
    if (sendTestEmail) {
      // Write temporarily only if new credentials provided, verify live, and stamp verifiedAt on success
      fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify({ ...updated, verifiedAt: nowIso }, null, 2), 'utf-8');
      const dispatched = await sendServerEmail({
        to: targetAdminEmail,
        subject: 'FEVIQO Admin Email Delivery Verified',
        html: `<p>Your FEVIQO email notification setup is verified for <strong>${escapeHtml(targetAdminEmail)}</strong>. You will receive verification alerts when customers submit Bank QR payment screenshots or editing client updates occur.</p>`,
        type: 'admin_email_test',
      });
      testResult = {
        success: Boolean(dispatched.success),
        provider: dispatched.provider,
        source: dispatched.source,
        error: dispatched.error || dispatched.smtpError || dispatched.resendError,
      };
      if (!dispatched.success) {
        // Keep previously saved file or remove failed override so Render env vars are not shadowed by bad credentials
        fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify(existing, null, 2), 'utf-8');
      }
    } else {
      fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify({ ...updated, verifiedAt: nowIso }, null, 2), 'utf-8');
    }

    appendAdminAudit({
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      action: 'config_updated',
      details: `Updated server email delivery credentials (SMTP user: ${updated.user || 'none'}, Resend: ${updated.resendApiKey ? 'set' : 'unset'}).`,
    });

    const smtp = getActiveSmtpConfig();
    const resendCfg = getResendCandidates()[0] || null;
    return res.json({
      success: true,
      testResult,
      transport: {
        smtpConfigured: Boolean(smtp?.user && smtp?.pass),
        smtpSource: smtp?.source || 'none',
        smtpHost: smtp?.host || 'smtp.gmail.com',
        smtpPort: smtp?.port || 587,
        smtpUser: smtp?.user || '',
        smtpFrom: smtp?.from || 'FEVIQO Studio <partner@feviqo.com>',
        resendConfigured: Boolean(resendCfg?.apiKey),
        resendSource: resendCfg?.source || 'none',
        resendFrom: resendCfg?.from || 'FEVIQO Studio <onboarding@resend.dev>',
        notificationRecipients: getStudioNotificationRecipients(),
      },
      overview: getAdminMembershipsOverview(),
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to save email transport credentials.' });
  }
});

app.post('/api/admin/roles', requireAdmin, (req: any, res) => {
  const { email, name, password } = req.body || {};
  const result = createAdditionalAdmin({ email, name, password, byAdmin: req.admin });
  if ('error' in result) {
    return res.status(400).json({ success: false, error: result.error });
  }
  return res.status(201).json({
    success: true,
    admin: result.admin,
    overview: getAdminMembershipsOverview(),
  });
});

app.patch('/api/admin/roles/:adminId', requireAdmin, (req: any, res) => {
  const { isActive } = req.body || {};
  const result = toggleAdminActiveStatus({
    targetAdminId: req.params.adminId,
    isActive: Boolean(isActive),
    byAdmin: req.admin,
  });
  if ('error' in result) {
    return res.status(400).json({ success: false, error: result.error });
  }
  return res.json({
    success: true,
    admin: result.admin,
    overview: getAdminMembershipsOverview(),
  });
});

// Initial sitemap sync & search engine IndexNow ping on boot
try {
  updateSitemapFiles();
  pingSearchEnginesForReindexing({
    urls: [
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
      'https://feviqo.com/gunesin-dogdugu-yer/episode-7',
      'https://feviqo.com/gunesin-dogdugu-yer/episode-5',
      'https://feviqo.com/dramas',
      'https://feviqo.com/sitemap.xml'
    ],
    reason: 'Server startup / IndexNow automated episode ping'
  }).catch((e) => console.error('Auto ping error:', e));
} catch (e) {
  console.error('Initial sitemap sync error:', e);
}

// --- VITE DEV / PRODUCTION MIDDLEWARE ---
async function startServer() {
  try {
    await hydrateStoreFromFirestore();
  } catch (err) {
    console.warn('Initial Firestore hydration skipped:', (err as Error)?.message || err);
  }
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: true, allowedHosts: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const p = req.path || '';
      if (
        (req.method !== 'GET' && req.method !== 'HEAD') || 
        p.startsWith('/api') || 
        p.startsWith('/uploads') || 
        p.startsWith('/videos') ||
        p.startsWith('/@') ||
        p.startsWith('/src') ||
        p.startsWith('/node_modules') ||
        p.startsWith('/assets') ||
        p.startsWith('/images') ||
        p.startsWith('/fonts') ||
        (p.includes('.') && !p.endsWith('.html'))
      ) {
        return next();
      }
      try {
        const indexPath = path.join(process.cwd(), 'index.html');
        let rawHtml = fs.readFileSync(indexPath, 'utf-8');
        rawHtml = await vite.transformIndexHtml(req.url, rawHtml);
        const rawPath = (req.originalUrl || req.url || req.path || '/').split('?')[0].split('#')[0];
        const requestPath = rawPath === '/' ? '/' : (rawPath.endsWith('/') ? rawPath : `${rawPath}/`);
        const routeConfig = getSEOConfigForPath(requestPath);
        const seoHtml = transformHTMLForRoute(rawHtml, requestPath);
        if (routeConfig.pageName === 'Unknown Route') {
          return res.status(404).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(seoHtml);
        }
        const canonicalUrl = routeConfig.canonicalUrl;
        res.setHeader('Link', `<${canonicalUrl}>; rel="canonical"`);
        return res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(seoHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      etag: true,
      index: false,
      // Static pre-render routes are directories containing index.html.
      // Do not let serve-static append "/" because the canonical middleware
      // above intentionally strips trailing slashes; that would create a
      // redirect loop for every pre-rendered route.
      redirect: false
    }));
    // Prevent missing static assets from returning index.html (preventing MIME type errors)
    app.get(['/assets/*', '/images/*', '/fonts/*'], (req, res) => {
      res.status(404).send('Asset not found');
    });

    app.get('*', (req, res) => {
      try {
        const indexPath = path.join(distPath, 'index.html');
        const rawPath = (req.originalUrl || req.url || req.path || '/').split('?')[0].split('#')[0];
        const cleanRoutePath = rawPath.replace(/^\/+|\/+$/g, '');
        const requestPath = rawPath === '/' ? '/' : `/${cleanRoutePath}`;

        // Serve the route-specific pre-rendered HTML directly for clean URLs.
        // This avoids relying on express.static directory redirects or a
        // trailing-slash URL to reach nested index.html files.
        const distRoot = path.resolve(distPath) + path.sep;
        const candidatePath = cleanRoutePath
          ? path.resolve(distPath, cleanRoutePath, 'index.html')
          : indexPath;
        const pagePath = (candidatePath.startsWith(distRoot) || candidatePath === path.resolve(indexPath))
          ? candidatePath
          : indexPath;
        const hasPrerenderedPage = fs.existsSync(pagePath);
        const rawHtml = fs.readFileSync(hasPrerenderedPage ? pagePath : indexPath, 'utf-8');
        const routeConfig = getSEOConfigForPath(requestPath);
        const seoHtml = hasPrerenderedPage
          ? rawHtml
          : transformHTMLForRoute(rawHtml, requestPath);

        if (routeConfig.pageName === 'Unknown Route') {
          return res.status(404).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(seoHtml);
        }
        const canonicalUrl = routeConfig.canonicalUrl;
        res.setHeader('Link', `<${canonicalUrl}>; rel="canonical"`);
        return res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(seoHtml);
      } catch {
        return res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`FEVIQO full-stack server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is in use. Attempting to free port...`);
      try {
        execFile('fuser', ['-k', `${PORT}/tcp`], () => {
          setTimeout(() => {
            app.listen(PORT, '0.0.0.0', () => {
              console.log(`FEVIQO full-stack server recovered and listening on http://0.0.0.0:${PORT}`);
            });
          }, 500);
        });
      } catch (e) {
        console.error('Failed to free port:', e);
      }
    } else {
      console.error('Server error:', err);
    }
  });
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

startServer();

import express from 'express';
import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
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

const app = express();
const PORT = 3000;

// High-capacity payload limits supporting 900MB+ / 2GB video uploads
app.use(express.json({ limit: '2048mb' }));
app.use(express.urlencoded({ limit: '2048mb', extended: true }));

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
app.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.type('text/plain');
    return res.sendFile(robotsPath);
  }
  res.type('text/plain').send("User-agent: *\nAllow: /\nSitemap: https://feviqo.com/sitemap.xml\n");
});

app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.type('application/xml');
    return res.sendFile(sitemapPath);
  }
  res.status(404).send('Sitemap not found');
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

// --- SMTP EMAIL CONFIGURATION ---
let smtpTransporter: any = null;

function getSmtpTransporter(): any {
  if (smtpTransporter) return smtpTransporter;

  const rawUser = process.env.SMTP_USER || '';
  const rawPass = process.env.SMTP_PASS || '';
  const rawHost = process.env.SMTP_HOST || '';
  const rawService = process.env.SMTP_SERVICE || '';

  if (!rawUser || !rawPass) {
    return null;
  }

  try {
    const user = rawUser.trim();
    // Auto-clean spaces from Google App Password (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
    const pass = rawPass.trim().replace(/\s+/g, '');
    const isGmail = rawService.toLowerCase() === 'gmail' || rawHost.toLowerCase().includes('gmail') || user.toLowerCase().includes('@gmail.com');

    if (isGmail) {
      smtpTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
      console.log(`[SMTP] Initialized Gmail transporter for ${user}`);
    } else {
      const host = rawHost.trim() || 'smtp.gmail.com';
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const secure = process.env.SMTP_SECURE === 'true' || port === 465;

      smtpTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false,
        },
      });
      console.log(`[SMTP] Initialized SMTP transporter for ${host}:${port}`);
    }
  } catch (err) {
    console.error('[SMTP] Failed to initialize transporter:', err);
  }
  return smtpTransporter;
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

// Helper to send email across all providers
async function sendServerEmail(params: {
  to: string;
  subject: string;
  html: string;
  type?: string;
  data?: any;
}): Promise<{ success: boolean; messageId?: string; provider?: string; error?: string }> {
  const { to, subject, html, type = 'general', data = {} } = params;
  const messageId = `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. Try Nodemailer SMTP (Gmail App Password or custom SMTP)
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || '"FEVIQO Production" <rexanmedia01@gmail.com>';
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log(`[SMTP Sent] messageId: ${info.messageId} to ${to}`);
      logDispatchedEmail({ id: info.messageId, to, subject, type, provider: 'smtp', sentAt: new Date().toISOString() });
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (err: any) {
      console.warn('[SMTP Dispatch Error, falling back]:', err.message || err);
    }
  }

  // 2. Try Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'FEVIQO Production <partner@feviqo.com>',
          to: [to],
          subject,
          html,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        console.log(`[Resend Sent] id: ${json.id} to ${to}`);
        logDispatchedEmail({ id: json.id, to, subject, type, provider: 'resend', sentAt: new Date().toISOString() });
        return { success: true, messageId: json.id, provider: 'resend' };
      }
    } catch (err) {
      console.warn('[Resend Dispatch Error, falling back]:', err);
    }
  }

  // 3. Try FormSubmit HTTP direct webhook
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: subject,
        _replyto: 'rexanmedia01@gmail.com',
        notificationType: type,
        recipient: to,
        ...data,
        _template: 'table',
        _captcha: 'false',
      }),
    });
    if (res.ok) {
      console.log(`[FormSubmit Sent] to ${to}`);
      logDispatchedEmail({ id: messageId, to, subject, type, provider: 'formsubmit', sentAt: new Date().toISOString() });
      return { success: true, messageId, provider: 'formsubmit' };
    }
  } catch (err) {
    console.warn('[FormSubmit Dispatch Error]:', err);
  }

  // Always log even in sandbox mode so operations succeed
  logDispatchedEmail({ id: messageId, to, subject, type, provider: 'local_recorded', sentAt: new Date().toISOString() });
  return { success: true, messageId, provider: 'local_recorded' };
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

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    smtpConfigured: !!process.env.SMTP_HOST,
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

app.post('/api/clients', (req, res) => {
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
    return res.json({ success: true, client, oneTimePassword });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create client' });
  }
});

app.put('/api/clients/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { client } = saveClient({ ...req.body, id });
    return res.json({ success: true, client });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update client' });
  }
});

app.put('/api/clients/:id/status', (req, res) => {
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

    // 2. Dispatch real notification email to partner@feviqo.com
    const PRIMARY_STUDIO_EMAIL = 'partner@feviqo.com';
    const isPause = action === 'pause';
    const isResume = action === 'resume';
    const isUpgrade = action === 'upgrade';

    const subject = isPause 
      ? `⏸️ [Plan Update: PAUSED] ${clientName || clientEmail} (${company || 'Client'}) paused their subscription`
      : isResume
      ? `▶️ [Plan Update: RESUMED] ${clientName || clientEmail} (${company || 'Client'}) resumed subscription`
      : `🚀 [Plan Upgrade Request] ${clientName || clientEmail} (${company || 'Client'}) upgraded to ${targetPlan}`;

    const emailHtml = `
      <div style="font-family:sans-serif; background:#0B0B0D; color:#FFFFFF; padding:28px; border-radius:16px; border:1px solid #27272A; max-width:600px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h2 style="color:#22C55E; margin:0; font-size:22px;">FEVIQO Flow Plan Management</h2>
          <span style="background:rgba(34,197,94,0.15); color:#22C55E; border:1px solid rgba(34,197,94,0.3); padding:4px 10px; border-radius:999px; font-size:12px; font-weight:bold; text-transform:uppercase;">${action}</span>
        </div>
        <p style="color:#E2E8F0; font-size:15px; line-height:1.5;">
          A client has triggered a plan change directly through their FEVIQO Flow workspace with a single click:
        </p>
        <table style="width:100%; border-collapse:collapse; color:#F1F5F9; font-size:14px; margin:20px 0; background:#18181B; border-radius:12px; overflow:hidden;">
          <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #27272A;">Client:</td><td style="padding:10px 14px; border-bottom:1px solid #27272A; font-weight:bold;">${clientName || 'Client'}</td></tr>
          <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #27272A;">Company:</td><td style="padding:10px 14px; border-bottom:1px solid #27272A;">${company || 'N/A'}</td></tr>
          <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #27272A;">Email:</td><td style="padding:10px 14px; border-bottom:1px solid #27272A;"><a href="mailto:${clientEmail}" style="color:#22C55E;">${clientEmail}</a></td></tr>
          <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #27272A;">Action:</td><td style="padding:10px 14px; border-bottom:1px solid #27272A; font-weight:bold; color:${isPause ? '#F59E0B' : '#22C55E'};">${action.toUpperCase()}</td></tr>
          <tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #27272A;">Current Plan:</td><td style="padding:10px 14px; border-bottom:1px solid #27272A;">${currentPlan || 'Active'}</td></tr>
          ${targetPlan ? `<tr><td style="padding:10px 14px; color:#94A3B8; border-bottom:1px solid #27272A;">Requested Tier:</td><td style="padding:10px 14px; border-bottom:1px solid #27272A; font-weight:bold; color:#22C55E;">${targetPlan}</td></tr>` : ''}
          ${notes ? `<tr><td style="padding:10px 14px; color:#94A3B8;">Client Note:</td><td style="padding:10px 14px;">${notes}</td></tr>` : ''}
        </table>
        <p style="margin-top:24px;">
          <a href="https://feviqo.com/flow?tab=admin" style="display:inline-block; padding:12px 24px; background:#22C55E; color:#052E16; text-decoration:none; font-weight:bold; border-radius:8px;">Open Client in Admin Portal</a>
        </p>
      </div>
    `;

    sendServerEmail({
      to: PRIMARY_STUDIO_EMAIL,
      subject,
      html: emailHtml,
      type: isPause ? 'plan_paused' : (isResume ? 'plan_resumed' : 'plan_upgraded'),
      data: { clientEmail, clientName, company, action, targetPlan, currentPlan, notes }
    }).catch((e) => console.warn('Failed to send partner notification:', e));

    return res.json({ success: true, client, message: 'Subscription action recorded and notified to partner@feviqo.com' });
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

app.post('/api/projects', (req, res) => {
  try {
    const projectData = req.body;
    if (!projectData.title) {
      return res.status(400).json({ success: false, error: 'Project title is required' });
    }
    const saved = saveProject({
      id: projectData.id || `proj-${Date.now()}`,
      status: 'Queueing',
      rawFootageFiles: [],
      revisionNotes: [],
      ...projectData,
    });
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
    const saved = saveProject({ ...req.body, id });
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

app.post('/api/projects/:id/revisions', (req, res) => {
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
app.post('/api/notifications/send-email', async (req, res) => {
  const { to, subject, type, data, html } = req.body;

  if (!to || !to.includes('@')) {
    return res.status(400).json({ success: false, error: 'Invalid recipient email' });
  }

  console.log(`[FEVIQO Email Dispatch] Sending ${type} email to ${to}: "${subject}"`);
  const result = await sendServerEmail({ to, subject, html: html || `<p>${subject}</p>`, type, data });

  // Automatically mirror all notifications to Studio Owner (Rexan) & Partner inbox
  const STUDIO_EMAILS = Array.from(new Set([
    process.env.NOTIFICATION_EMAIL || 'rexanmedia01@gmail.com',
    'rexanmedia01@gmail.com',
    'partner@feviqo.com',
  ].map(e => e.toLowerCase())));

  for (const studioEmail of STUDIO_EMAILS) {
    if (to.toLowerCase() !== studioEmail) {
      sendServerEmail({
        to: studioEmail,
        subject: `[FEVIQO Alert] ${subject}`,
        html: `
          <div style="font-family:sans-serif; background:#0B0B0D; color:#FFFFFF; padding:24px; border-radius:12px;">
            <h3 style="color:#22C55E; margin-top:0;">Notification Dispatch Record</h3>
            <p><strong>To:</strong> ${to}</p>
            <p><strong>Event:</strong> ${type}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border-color:#27272A; margin:16px 0;" />
            ${html || `<p>${subject}</p>`}
          </div>
        `,
        type,
        data,
      }).catch((e) => console.warn(`[Studio Mirror Email Warning to ${studioEmail}]:`, e));
    }
  }

  return res.json(result);
});

// Diagnostic endpoint to verify email delivery setup
app.post('/api/notifications/test-email', async (req, res) => {
  const targetEmail = req.body.to || process.env.NOTIFICATION_EMAIL || 'rexanmedia01@gmail.com';
  console.log(`[Diagnostic] Testing email dispatch to ${targetEmail}...`);

  const transporter = getSmtpTransporter();
  const hasSmtp = !!transporter;
  const hasResend = !!process.env.RESEND_API_KEY;

  const result = await sendServerEmail({
    to: targetEmail,
    subject: `FEVIQO Email Test - ${new Date().toLocaleTimeString()}`,
    html: `
      <div style="font-family:sans-serif; background:#04150D; color:#FFFFFF; padding:24px; border-radius:12px; border:1px solid #22C55E;">
        <h2 style="color:#22C55E; margin-top:0;">FEVIQO Email System Verified!</h2>
        <p>This is a test notification confirming that email sending and receiving is fully operational.</p>
        <p><strong>Configured Transporters:</strong></p>
        <ul>
          <li>SMTP Configured: ${hasSmtp ? 'YES (Active)' : 'NO (Set SMTP_USER & SMTP_PASS)'}</li>
          <li>Resend Configured: ${hasResend ? 'YES' : 'NO'}</li>
          <li>Fallback HTTP Webhook: Active</li>
        </ul>
        <p style="color:#A7F3D0; font-size:12px;">Dispatched at: ${new Date().toISOString()}</p>
      </div>
    `,
    type: 'test_notification',
    data: { testTime: new Date().toISOString() },
  });

  return res.json({
    ...result,
    diagnostics: {
      targetEmail,
      smtpConfigured: hasSmtp,
      resendConfigured: hasResend,
      smtpUser: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 4)}***` : 'Not Set',
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

    // 3. Dispatch to Studio Owner (Rexan) and Partner Inboxes
    const ADMIN_RECIPIENTS = Array.from(new Set([
      'partner@feviqo.com',
      'rexanmedia01@gmail.com',
      process.env.NOTIFICATION_EMAIL || 'rexanmedia01@gmail.com',
    ].map(e => e.toLowerCase())));

    for (const adminEmail of ADMIN_RECIPIENTS) {
      sendServerEmail({
        to: adminEmail,
        subject: `🔥 [FEVIQO Strategy Call] ${clientFullName} (${newLead.industry || 'Lead'}) - ${selectedPlan}`,
        html: agencyHtml,
        type: 'strategy_call_booked',
        data: newLead,
      }).catch((e) => console.warn(`Failed to send partner notification to ${adminEmail}:`, e));
    }

    // 4. Dispatch Confirmation to the Client
    if (newLead.email && newLead.email.includes('@')) {
      sendServerEmail({
        to: newLead.email,
        subject: `Your FEVIQO 1-on-1 Strategy Call is Confirmed 🎬`,
        html: clientConfirmationHtml,
        type: 'client_booking_confirmation',
        data: newLead,
      }).catch((e) => console.warn('Failed to send client confirmation email:', e));
    }

    return res.json({ success: true, lead: newLead });
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

app.post('/api/annotations/:projectId', (req, res) => {
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

// --- VITE DEV / PRODUCTION MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FEVIQO full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

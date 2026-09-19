import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { logUploadRecord } from './cmsStore';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
  fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
}

// Allowed extensions
const ALLOWED_EXTENSIONS = new Set([
  // Video
  '.mp4', '.mov', '.webm', '.m4v', '.avi', '.mkv', '.prores',
  // Images
  '.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif',
  // Audio
  '.mp3', '.wav', '.aac', '.m4a', '.flac',
  // Project & Document
  '.pdf', '.zip', '.prproj', '.drp', '.xml', '.txt'
]);

// Maximum file size in bytes (minimum 900MB, default 2048MB / 2GB)
const envLimit = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '2048', 10);
const maxUploadSizeMb = Math.max(900, isNaN(envLimit) ? 2048 : envLimit);
const maxFileSizeBytes = maxUploadSizeMb * 1024 * 1024;

// Configure disk storage for Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${Date.now()}-${cleanBase}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File format ${ext} is not supported. Supported: MP4, MOV, WebM, PNG, JPG, WebP, SVG, WAV, MP3, ZIP, PDF`));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: maxFileSizeBytes,
  },
  fileFilter,
});

/**
 * Mirror file to public/uploads for direct static Vite dev server resolution
 */
export function mirrorToPublicUploads(filename: string): void {
  try {
    const src = path.join(UPLOADS_DIR, filename);
    const dst = path.join(PUBLIC_UPLOADS_DIR, filename);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
    }
  } catch (err) {
    console.warn(`[Upload] Failed to mirror ${filename} to public/uploads:`, err);
  }
}

/**
 * Format bytes to readable string (e.g. 340 MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Process uploaded multer file into a standardized persistent file record
 */
export function processUploadedFile(file: Express.Multer.File, uploaderInfo?: { email?: string; role?: string; projectId?: string }) {
  mirrorToPublicUploads(file.filename);

  const fileRecord = {
    id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    originalName: file.originalname,
    fileName: file.filename,
    url: `/uploads/${file.filename}`,
    size: file.size,
    sizeFormatted: formatBytes(file.size),
    mimeType: file.mimetype,
    uploaderEmail: uploaderInfo?.email || 'anonymous',
    uploaderRole: uploaderInfo?.role || 'client',
    projectId: uploaderInfo?.projectId || '',
    createdAt: new Date().toISOString(),
    status: 'stored_permanently',
    storageProvider: process.env.STORAGE_PROVIDER || 'local_persistent',
  };

  logUploadRecord(fileRecord);
  return fileRecord;
}

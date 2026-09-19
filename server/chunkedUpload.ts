import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { execFile } from 'child_process';
import { logUploadRecord } from './cmsStore';

const TEMP_CHUNKS_DIR = path.join(process.cwd(), 'data', 'temp_chunks');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const PUBLIC_VIDEOS_DIR = path.join(process.cwd(), 'public', 'videos');
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

// Ensure all target directories exist
[TEMP_CHUNKS_DIR, UPLOADS_DIR, PUBLIC_UPLOADS_DIR, PUBLIC_VIDEOS_DIR, PUBLIC_IMAGES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer memory storage for chunks (each chunk is 10MB–15MB, well below 32MB Cloud Run limit)
const chunkStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TEMP_CHUNKS_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, `chunk-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.tmp`);
  },
});

export const chunkUploadMiddleware = multer({
  storage: chunkStorage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB max per individual chunk
  },
});

/**
 * Handle incoming chunk and assemble file when all chunks arrive
 */
export async function handleChunkUpload(req: any, res: any) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No chunk file provided' });
    }

    const uploadId = String(req.body.uploadId || '').replace(/[^a-zA-Z0-9_-]/g, '');
    const chunkIndex = parseInt(req.body.chunkIndex, 10);
    const totalChunks = parseInt(req.body.totalChunks, 10);
    const rawFileName = String(req.body.fileName || 'uploaded_video.mp4');
    const targetDir = String(req.body.targetDir || 'videos');

    if (!uploadId || isNaN(chunkIndex) || isNaN(totalChunks) || totalChunks <= 0) {
      // Remove temp file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, error: 'Invalid chunk parameters' });
    }

    const sessionDir = path.join(TEMP_CHUNKS_DIR, uploadId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // Move uploaded chunk to sessionDir as part_{chunkIndex}
    const chunkTarget = path.join(sessionDir, `part_${chunkIndex}`);
    if (fs.existsSync(chunkTarget)) {
      fs.unlinkSync(chunkTarget);
    }
    fs.renameSync(file.path, chunkTarget);

    // Check if all chunks from 0 to totalChunks - 1 are present
    let isComplete = true;
    for (let i = 0; i < totalChunks; i++) {
      if (!fs.existsSync(path.join(sessionDir, `part_${i}`))) {
        isComplete = false;
        break;
      }
    }

    if (!isComplete) {
      return res.json({
        success: true,
        isComplete: false,
        chunkIndex,
        totalChunks,
        uploadId,
      });
    }

    // All chunks received: Assemble final file
    const cleanFileName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const isVideo = /\.(mp4|mov|webm|m4v|mkv)$/i.test(cleanFileName);
    
    // Choose primary destination
    const primaryDest = targetDir === 'videos' || isVideo
      ? path.join(PUBLIC_VIDEOS_DIR, cleanFileName)
      : path.join(UPLOADS_DIR, cleanFileName);

    // Merge parts sequentially
    const writeStream = fs.createWriteStream(primaryDest);

    for (let i = 0; i < totalChunks; i++) {
      const partPath = path.join(sessionDir, `part_${i}`);
      const data = fs.readFileSync(partPath);
      writeStream.write(data);
    }
    writeStream.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(true));
      writeStream.on('error', reject);
    });

    // Clean up temporary chunks directory
    try {
      for (let i = 0; i < totalChunks; i++) {
        const partPath = path.join(sessionDir, `part_${i}`);
        if (fs.existsSync(partPath)) fs.unlinkSync(partPath);
      }
      fs.rmdirSync(sessionDir);
    } catch (cleanupErr) {
      console.warn('Chunk cleanup notice:', cleanupErr);
    }

    // Mirror to other relevant directories
    if (targetDir === 'videos' || isVideo) {
      try {
        fs.copyFileSync(primaryDest, path.join(UPLOADS_DIR, cleanFileName));
        fs.copyFileSync(primaryDest, path.join(PUBLIC_UPLOADS_DIR, cleanFileName));
      } catch {}
    } else {
      try {
        fs.copyFileSync(primaryDest, path.join(PUBLIC_UPLOADS_DIR, cleanFileName));
      } catch {}
    }

    const stats = fs.statSync(primaryDest);
    const sizeBytes = stats.size;
    const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(2);
    const publicUrl = isVideo || targetDir === 'videos' 
      ? `/videos/${cleanFileName}?t=${Date.now()}`
      : `/uploads/${cleanFileName}?t=${Date.now()}`;

    // Auto-generate video poster if ffmpeg is available
    if (isVideo) {
      const posterName = `${path.basename(cleanFileName, path.extname(cleanFileName))}-poster.jpg`;
      const posterDest = path.join(PUBLIC_IMAGES_DIR, posterName);
      execFile('ffmpeg', [
        '-y', '-ss', '00:00:01.000', '-i', primaryDest,
        '-vframes', '1', '-q:v', '2', posterDest
      ], () => {});
    }

    // Log upload record
    logUploadRecord({
      id: `chunk-${Date.now()}-${uploadId}`,
      originalName: rawFileName,
      fileName: cleanFileName,
      url: publicUrl,
      size: sizeBytes,
      sizeFormatted: `${sizeMb} MB`,
      mimeType: isVideo ? 'video/mp4' : 'application/octet-stream',
      createdAt: new Date().toISOString(),
      status: 'stored_permanently',
      storageProvider: 'chunked_local_disk',
    });

    return res.json({
      success: true,
      isComplete: true,
      url: publicUrl,
      fileName: cleanFileName,
      sizeBytes,
      sizeMb,
      message: `File ${cleanFileName} (${sizeMb} MB) uploaded and assembled successfully!`,
    });
  } catch (err: any) {
    console.error('Chunk upload assembly error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Chunk upload failed' });
  }
}

/**
 * Check status of an upload session
 */
export function getChunkStatus(req: any, res: any) {
  try {
    const uploadId = String(req.query.uploadId || '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!uploadId) {
      return res.status(400).json({ success: false, error: 'uploadId is required' });
    }
    const sessionDir = path.join(TEMP_CHUNKS_DIR, uploadId);
    if (!fs.existsSync(sessionDir)) {
      return res.json({ success: true, uploadedChunks: [] });
    }
    const files = fs.readdirSync(sessionDir);
    const uploadedChunks = files
      .filter((f) => f.startsWith('part_'))
      .map((f) => parseInt(f.replace('part_', ''), 10))
      .filter((n) => !isNaN(n));
    return res.json({ success: true, uploadedChunks });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

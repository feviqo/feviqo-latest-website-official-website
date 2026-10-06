import { findVideoItem } from '../data/videoRegistry';

/**
 * Video Source Resolver
 * Maps external Google Drive IDs, Vimeo placeholders, YouTube links, and direct files
 */

export const extractYoutubeId = (input?: string | null): string | null => {
  if (!input) return null;
  const clean = input.trim();
  const match = clean.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
  return null;
};

export const extractDriveId = (input?: string | null): string | null => {
  if (!input) return null;
  const clean = input.trim();
  if (clean.includes('stream.mux.com') || clean.includes('mux.com') || clean.includes('.m3u8')) {
    return null;
  }
  const match = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) return match[1];

  const paramMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (paramMatch && paramMatch[1]) return paramMatch[1];

  if (/^[a-zA-Z0-9_-]{25,45}$/.test(clean)) {
    return clean;
  }

  return null;
};

/**
 * Builds standard Google Drive preview embed URL with autoplay parameters
 */
export const buildGoogleDrivePreviewUrl = (driveId: string, autoplay = false): string => {
  return `https://drive.google.com/file/d/${driveId}/preview${autoplay ? '?autoplay=1' : ''}`;
};

export const isDriveFolderUrl = (input?: string | null): boolean => {
  if (!input) return false;
  return input.includes('drive.google.com') && (input.includes('/folders/') || input.includes('id='));
};

export const isWeTransferUrl = (input?: string | null): boolean => {
  if (!input) return false;
  return input.includes('we.tl') || input.includes('wetransfer.com');
};

export const isDropboxUrl = (input?: string | null): boolean => {
  if (!input) return false;
  return input.includes('dropbox.com');
};

/**
 * Converts a Dropbox shared link into a direct streaming URL
 */
export const convertDropboxToDirectStream = (input?: string | null): string | null => {
  if (!input || !isDropboxUrl(input)) return null;
  let clean = input.trim();
  if (clean.includes('dl=0')) {
    clean = clean.replace('dl=0', 'raw=1');
  } else if (!clean.includes('raw=1')) {
    clean = clean.includes('?') ? `${clean}&raw=1` : `${clean}?raw=1`;
  }
  return clean;
};

export interface CloudFootageMeta {
  type: 'embed' | 'stream' | 'external' | 'default';
  platform: 'drive' | 'dropbox' | 'wetransfer' | 'youtube' | 'vimeo' | 'direct' | 'unknown';
  embedUrl?: string;
  streamUrl?: string;
  externalUrl?: string;
  label: string;
}

export const getCloudFootageMeta = (url?: string | null, isVertical = false): CloudFootageMeta => {
  if (!url) {
    return {
      type: 'default',
      platform: 'unknown',
      streamUrl: isVertical ? '/videos/reel-talking-head.mp4' : '/videos/Sequence-01.mp4',
      label: 'Sample Video Footage',
    };
  }

  const clean = url.trim();

  // 1. YouTube
  const ytId = extractYoutubeId(clean);
  if (ytId) {
    return {
      type: 'embed',
      platform: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`,
      externalUrl: clean,
      label: 'YouTube Video Link',
    };
  }

  // 2. Vimeo
  const vimeoId = extractVimeoId(clean);
  if (vimeoId) {
    return {
      type: 'embed',
      platform: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
      externalUrl: clean,
      label: 'Vimeo Video Link',
    };
  }

  // 3. Google Drive single file
  const driveId = extractDriveId(clean);
  if (driveId) {
    // If mapped to high-speed Mux HLS:
    if (DRIVE_TO_DIRECT_VIDEO_MAP[driveId]) {
      return {
        type: 'stream',
        platform: 'drive',
        streamUrl: DRIVE_TO_DIRECT_VIDEO_MAP[driveId],
        externalUrl: clean,
        label: 'Google Drive Video (Direct Stream)',
      };
    }
    return {
      type: 'embed',
      platform: 'drive',
      embedUrl: buildGoogleDrivePreviewUrl(driveId, false),
      externalUrl: clean,
      label: 'Google Drive Video File',
    };
  }

  // 4. Google Drive Folder
  if (isDriveFolderUrl(clean)) {
    return {
      type: 'external',
      platform: 'drive',
      externalUrl: clean,
      streamUrl: isVertical ? '/videos/reel-talking-head.mp4' : '/videos/Sequence-01.mp4',
      label: 'Google Drive Cloud Folder',
    };
  }

  // 5. Dropbox
  if (isDropboxUrl(clean)) {
    const directStream = convertDropboxToDirectStream(clean);
    return {
      type: 'stream',
      platform: 'dropbox',
      streamUrl: directStream || clean,
      externalUrl: clean,
      label: 'Dropbox Cloud Video',
    };
  }

  // 6. WeTransfer
  if (isWeTransferUrl(clean)) {
    return {
      type: 'external',
      platform: 'wetransfer',
      externalUrl: clean,
      streamUrl: isVertical ? '/videos/reel-talking-head.mp4' : '/videos/Sequence-01.mp4',
      label: 'WeTransfer Footage Package',
    };
  }

  // 7. Direct MP4 / M3U8 / WebM / Blob URL
  if (
    clean.startsWith('/') ||
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m3u8') ||
    clean.includes('stream.mux.com') ||
    clean.startsWith('blob:') ||
    clean.startsWith('data:')
  ) {
    return {
      type: 'stream',
      platform: 'direct',
      streamUrl: clean,
      externalUrl: clean,
      label: 'Direct Cloud Video Stream',
    };
  }

  return {
    type: 'external',
    platform: 'unknown',
    externalUrl: clean,
    streamUrl: isVertical ? '/videos/reel-talking-head.mp4' : '/videos/Sequence-01.mp4',
    label: 'Cloud Assets Link',
  };
};

export const extractVimeoId = (input?: string | null): string | null => {
  if (!input) return null;
  const clean = input.trim();
  const match = clean.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/);
  if (match) return match[1];
  if (/^[0-9]{7,11}$/.test(clean)) return clean;
  return null;
};

export const DRIVE_TO_DIRECT_VIDEO_MAP: Record<string, string> = {
  // 9:16 Vertical Reels
  '1auglp9_JKuWnlvDBCn8kYqBgrWML6wKa': 'https://stream.mux.com/2XO015Sw1RdYlJgjM6OS009uhQNiJycsmbilSY2MeDNis.m3u8',
  '1MmV6Vr36m3V8l58f7o68mw9nGtmABTyb': 'https://stream.mux.com/s023lRYcUZnjCRCi7kE5w6fp0194EEbcfXTEjfFogX3QE.m3u8',
  '15o8oOt2z9mdmC_20VRUutZhslxV2-ii_': 'https://stream.mux.com/cg02HdoZ00PbXTb5Xdd2xK7qmarUhZ3Etipet6ZdqwTsc.m3u8',
  '1KA6-nRnSq7bA6YZadxuCUZSGpaLBwbGy': 'https://stream.mux.com/oQ902RknkEysM3K9nNVlA011tnD3u1HrXBS7uynYxCRwE.m3u8',
  '1HuRXFfn_e2NWXj27L5onYO0zvLsbTN3u': 'https://stream.mux.com/cfF2qTIiPcyclNUR66jly00aQHHsyzWXfbs5hKOjP01G00.m3u8',
  '15kdJSlutHZOdz2IOKhFz2e9BKPSq1GnR': 'https://stream.mux.com/Xi8FLFTXCSpPW5T5A9L71xPO02cXgge9tvYAXjsE3gjw.m3u8',
  '1lw-usVlF88T5UnPhyseCUGn5l1zsXClK': 'https://stream.mux.com/kxeMNXlvZr02rU9pIRUA02PtMMToQJrYNRgz4WtD02giPk.m3u8',
  '1NsALRT6rQTaMpo6Q4Qnr-JdzdlyxXHFZ': 'https://stream.mux.com/h01VlLIhtdkl1PWGAoUAgstdLpBV44lZrHX5ACt01Jehc.m3u8',

  // 16:9 Horizontal Videos
  '1vyxbzJXxwwk5JHwiZ9449VLDn44pMTMS': 'https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8',
  '1wwUVC97t_Kq9u1sCuVbV-Fzzdb-efNSO': 'https://stream.mux.com/K2FDm6cIXH1hmj00KDCoVtmUP00WfWqS8E5QrioFZt1LE.m3u8',
  '1YaLVTBgqi4uQfUM4Si0qlQ5v_jvbUYW4': 'https://stream.mux.com/yYp92f00j801EMav6rKji1XGioTk01LsC3hclBWNfK8tgY.m3u8',
  '1mDy4cb0v5YTxcqcbeHPVQVMBLiM9TWhW': 'https://stream.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc.m3u8',
  '1wGD_r6v8NS3Aak-eCKo1VBbCwFx40Ozp': 'https://stream.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc.m3u8',
  '1pPCeIikSqWYUH5djhBCEfDpm15IUvXbQ': 'https://stream.mux.com/U02eycl00wLlvS6xpkRcIMmlceX4tr726fxssHMKbYFnM.m3u8',
  '1DdSvvlfwrclGj2tVVOR3k2q63-41ivYT': 'https://stream.mux.com/WdKdJIT1Zm8F1e02Cl8gsh2sdU4BKZee00oEI32V00NVjs.m3u8',
  '1ILFY0M5fdI4heUh42UKw5apgNfgtEUIl': 'https://stream.mux.com/x4EDg00kQy500i66WJzz4OXT2hMluOCUd6XE23t4Ts4aw.m3u8',
};

export const VIDEO_POSTER_MAP: Record<string, string> = {
  '/videos/reel-talking-head.mp4': '/images/posters/poster-reel-talking-head.jpg',
  '/videos/reel-fast-paced-hook.mp4': '/images/posters/poster-reel-fast-paced-hook.jpg',
  '/videos/reel-kinetic-motion.mp4': '/images/posters/poster-reel-kinetic-motion.jpg',
  '/videos/reel-viral-engagement.mp4': '/images/posters/poster-reel-viral-engagement.jpg',
  '/videos/horiz-cinematic-landscape.mp4': '/images/posters/poster-horiz-cinematic-landscape.jpg',
  '/videos/horiz-narrative-storytelling.mp4': '/images/posters/poster-horiz-narrative-storytelling.jpg',
  '/videos/horiz-saas-product-launch.mp4': '/images/posters/poster-horiz-saas-product-launch.jpg',
  '/videos/horiz-founder-documentary.mp4': '/images/posters/poster-horiz-founder-documentary.jpg',
  '/videos/Sequence-01.mp4': '/images/posters/poster-sequence-01.jpg',
  '/videos/Sequence 01.mp4': '/images/posters/poster-sequence-01.jpg',
  '/videos/feviqo-hero-video.mp4': '/images/posters/poster-sequence-01.jpg',
  '/videos/hero-showcase.mp4': '/images/posters/poster-sequence-01.jpg',
  'https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8': 'https://image.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M/thumbnail.jpg?time=1',
};

/**
 * Resolves any video reference (local file, Drive ID, Drive URL, WebM, MP4, Mux HLS)
 * to a pure direct playable HTML5 video source.
 */
export const resolvePlayableVideo = (
  driveId?: string | null,
  videoUrl?: string | null,
  isVertical?: boolean
): string => {
  if (videoUrl) {
    const cleanUrl = videoUrl.trim();

    // 1. Check if it's a registered video ID in videoRegistry (e.g. 'reel-3', 'reel-1', 'horiz-1', etc.)
    const matched = findVideoItem(cleanUrl);
    if (matched) {
      const m = matched as any;
      const matchedSrc = m.src || m.videoUrl || (m.driveId ? DRIVE_TO_DIRECT_VIDEO_MAP[m.driveId] : undefined);
      if (matchedSrc) return matchedSrc;
    }

    // 2. Direct playable file or HLS stream
    if (
      cleanUrl.startsWith('/') ||
      cleanUrl.endsWith('.mp4') ||
      cleanUrl.endsWith('.webm') ||
      cleanUrl.endsWith('.mov') ||
      cleanUrl.endsWith('.m3u8') ||
      cleanUrl.includes('stream.mux.com') ||
      cleanUrl.startsWith('blob:') ||
      cleanUrl.startsWith('data:') ||
      cleanUrl.startsWith('http://') ||
      (cleanUrl.startsWith('https://') && !cleanUrl.includes('drive.google.com') && !cleanUrl.includes('youtu') && !cleanUrl.includes('vimeo'))
    ) {
      return cleanUrl;
    }
  }

  const resolvedDriveId = driveId || extractDriveId(videoUrl);
  if (resolvedDriveId && DRIVE_TO_DIRECT_VIDEO_MAP[resolvedDriveId]) {
    return DRIVE_TO_DIRECT_VIDEO_MAP[resolvedDriveId];
  }

  if (isVertical) {
    return 'https://stream.mux.com/2XO015Sw1RdYlJgjM6OS009uhQNiJycsmbilSY2MeDNis.m3u8';
  }

  return 'https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8';
};

/**
 * Resolves the appropriate poster image for a video source.
 */
export const resolveVideoPoster = (
  source?: string | null,
  isVertical?: boolean
): string => {
  if (!source) {
    return isVertical
      ? 'https://image.mux.com/2XO015Sw1RdYlJgjM6OS009uhQNiJycsmbilSY2MeDNis/thumbnail.jpg?time=1'
      : 'https://image.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M/thumbnail.jpg?time=1';
  }

  // Check if it's a registered video ID
  const matched = findVideoItem(source);
  const m = matched as any;
  if (m?.poster || m?.thumbnail) {
    return m.poster || m.thumbnail || '';
  }

  // Handle Mux Stream Posters directly
  if (source.includes('stream.mux.com') || source.includes('image.mux.com')) {
    const muxMatch = source.match(/mux\.com\/([a-zA-Z0-9_-]+)(?:\.m3u8|\/thumbnail|\/animated)?/);
    if (muxMatch && muxMatch[1]) {
      return `https://image.mux.com/${muxMatch[1]}/thumbnail.jpg?time=1`;
    }
  }

  const playable = resolvePlayableVideo(null, source, isVertical);
  if (VIDEO_POSTER_MAP[playable]) {
    return VIDEO_POSTER_MAP[playable];
  }

  return isVertical
    ? '/images/posters/poster-reel-talking-head.jpg'
    : '/images/posters/poster-horiz-cinematic-landscape.jpg';
};

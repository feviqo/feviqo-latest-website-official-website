/**
 * FEVIQO Centralized Website Asset Management Service
 * Provides dynamic asset configuration and admin controls for website imagery & videos.
 */

export interface VideoGalleryItem {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
  aspectRatio: '9:16' | '16:9';
  isActive: boolean;
  views?: string;
  clientName?: string;
}

export interface CustomPictureItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  description?: string;
  size?: number;
  uploadedAt?: string;
}

export interface AssetDisplaySettings {
  logoHeight: number; // in pixels (e.g., 24 - 80)
  heroVideoMaxWidth: number; // in pixels (e.g., 700 - 1400)
  heroVideoScale: number; // in percentage (e.g., 80 - 120)
  heroVideoRadius: number; // in pixels (e.g., 0 - 32)
  pillarImageHeight: number; // in pixels (e.g., 200 - 1000)
  pillarImageRadius: number; // in pixels (e.g., 0 - 32)
  pillarImageFit: 'cover' | 'contain' | 'fill';
  workflowImageHeight: number; // in pixels (e.g., 200 - 600)
  workflowImageRadius: number; // in pixels (e.g., 0 - 32)
  galleryCols: 2 | 3 | 4;
}

export interface UploadedFileRecord {
  fileName: string;
  url: string;
  size: number;
  createdAt: string;
  type: 'video' | 'image' | 'other';
}

export type AudiencePageType = 'creators' | 'business' | 'agencies';
export type AudienceSectionType = 'hero' | 'main' | 'portfolio' | 'other';

export interface AudienceVideoItem {
  id: string;
  page: AudiencePageType;
  section: AudienceSectionType;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnail: string;
  isActive: boolean;
  sortOrder: number;
  source?: string;
  licenseNote?: string;
  aspectRatio?: '16:9' | '9:16' | '21:9';
  clientOrTag?: string;
}

export interface HeroMediaConfig {
  videoMediaId?: string; // e.g. "feviqo-hero-video"
  posterMediaId?: string; // e.g. "feviqo-hero-poster"
  filename?: string;
  duration?: number | string;
  width?: number;
  height?: number;
  aspectRatio?: string;
}

export interface WebsiteAssets {
  headerLogo: string;
  hero?: HeroMediaConfig;
  heroVideoMediaId?: string; // Stable media ID (e.g. "feviqo-hero-video")
  heroPosterMediaId?: string; // Stable poster ID (e.g. "feviqo-hero-poster")
  heroVideo: string;
  heroVideoWebm: string;
  heroPoster: string;
  creativeDecisionsImage: string;
  fasterTurnaroundImage: string;
  streamlinedProcessImage: string;
  structuredWorkflowImage: string;
  galleryItems: VideoGalleryItem[];
  audienceVideos?: AudienceVideoItem[];
  customPictures?: CustomPictureItem[];
  displaySettings?: AssetDisplaySettings;
}

export const DEFAULT_AUDIENCE_VIDEOS: AudienceVideoItem[] = [
  // --- CONTENT CREATORS ---
  {
    id: 'vid-creator-hero',
    page: 'creators',
    section: 'hero',
    title: 'Cinematic Creator Mastercut',
    description: 'High-energy storytelling, retention hooks, and multi-cam rhythm.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=2000&q=85',
    isActive: true,
    sortOrder: 1,
    clientOrTag: 'MASTER CUT / 2026',
    aspectRatio: '21:9',
    source: 'FEVIQO Studio Production',
    licenseNote: 'Direct studio license',
  },
  {
    id: 'vid-creator-out-1',
    page: 'creators',
    section: 'main',
    title: 'YouTube Long-Form (16:9)',
    description: 'Structured narrative pacing, retention hooks, and broadcast color grading.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85',
    isActive: true,
    sortOrder: 1,
    clientOrTag: 'LONG-FORM',
    aspectRatio: '16:9',
  },
  {
    id: 'vid-creator-out-2',
    page: 'creators',
    section: 'main',
    title: 'Short-Form & Reels (9:16)',
    description: 'First-frame pattern interrupts, kinetic subtitles, and micro-animations.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=85',
    isActive: true,
    sortOrder: 2,
    clientOrTag: 'SHORT-FORM',
    aspectRatio: '9:16',
  },
  {
    id: 'vid-creator-out-3',
    page: 'creators',
    section: 'main',
    title: 'Podcasts & Conversations',
    description: 'Multi-cam angle switching, voice isolation, and dynamic chapter bookmarks.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=85',
    isActive: true,
    sortOrder: 3,
    clientOrTag: 'PODCASTS',
    aspectRatio: '16:9',
  },
  {
    id: 'vid-creator-out-4',
    page: 'creators',
    section: 'main',
    title: 'Personal Brand',
    description: 'Documentary-grade visual conviction that establishes category presence.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
    isActive: true,
    sortOrder: 4,
    clientOrTag: 'PERSONAL BRAND',
    aspectRatio: '16:9',
  },
  {
    id: 'vid-creator-port-1',
    page: 'creators',
    section: 'portfolio',
    title: 'The 100-Hour High-Ticket Breakdown',
    description: 'Multi-chapter documentary edit with custom kinetic title cards and 4K color grade.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=85',
    isActive: true,
    sortOrder: 1,
    clientOrTag: 'YOUTUBE LONG-FORM',
    aspectRatio: '16:9',
  },
  {
    id: 'vid-creator-port-2',
    page: 'creators',
    section: 'portfolio',
    title: 'Viral Creator Hook Sequence',
    description: 'High-retention 9:16 vertical edit built for algorithm acceleration.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85',
    isActive: true,
    sortOrder: 2,
    clientOrTag: 'SHORT-FORM SOCIAL',
    aspectRatio: '9:16',
  },

  // --- BUSINESS OWNERS ---
  {
    id: 'vid-biz-hero',
    page: 'business',
    section: 'hero',
    title: 'Commercial Executive Direction',
    description: 'Broadcast-grade fidelity designed to command B2B buyer trust.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=85',
    isActive: true,
    sortOrder: 1,
    clientOrTag: 'COMMERCIAL ASSET SUITE / 2026',
    aspectRatio: '21:9',
    source: 'FEVIQO Studio Production',
  },
  {
    id: 'vid-biz-benefit',
    page: 'business',
    section: 'other',
    title: 'Brand Positioning Visual',
    description: 'Executive authority on pure canvas.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
    isActive: true,
    sortOrder: 1,
    clientOrTag: 'BRAND POSITIONING',
  },
  {
    id: 'vid-biz-out-1',
    page: 'business',
    section: 'main',
    title: 'Founder Keynote / Deep-Dive',
    description: '30-minute studio interview turned into an authoritative 16:9 master asset.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=85',
    isActive: true,
    sortOrder: 1,
    clientOrTag: 'LONG-FORM',
    aspectRatio: '16:9',
  },
  {
    id: 'vid-biz-out-2',
    page: 'business',
    section: 'main',
    title: 'Executive LinkedIn & X Cuts',
    description: 'High-signal 60-second excerpts establishing founder conviction.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=85',
    isActive: true,
    sortOrder: 2,
    clientOrTag: 'SHORT-FORM',
    aspectRatio: '9:16',
  },
  {
    id: 'vid-biz-out-3',
    page: 'business',
    section: 'main',
    title: 'Direct-Response Paid Ads',
    description: 'Problem-solution arcs and conversion-tested CTAs for Meta & LinkedIn.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85',
    isActive: true,
    sortOrder: 3,
    clientOrTag: 'ADS',
    aspectRatio: '16:9',
  },
  {
    id: 'vid-biz-port-1',
    page: 'business',
    section: 'portfolio',
    title: 'B2B Enterprise Positioning Film',
    description: 'Strategic clarity and founder perspective that closed $60K in contracts.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=85',
    isActive: true,
    sortOrder: 1,
    clientOrTag: 'FOUNDER CONTENT',
    aspectRatio: '16:9',
  },
  {
    id: 'vid-biz-port-2',
    page: 'business',
    section: 'portfolio',
    title: 'SaaS Customer Acquisition Ad',
    description: 'Direct-response paid creative engineered for pipeline velocity.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85',
    isActive: true,
    sortOrder: 2,
    clientOrTag: 'PAID SOCIAL ADS',
    aspectRatio: '16:9',
  },

  // --- AGENCIES ---
  {
    id: 'vid-agency-hero',
    page: 'agencies',
    section: 'hero',
    title: 'Dedicated Pod Velocity',
    description: 'Elastic, white-label post-production infrastructure for retainer-based agencies.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=2400&q=85',
    isActive: true,
    sortOrder: 1,
    clientOrTag: 'AGENCY INFRASTRUCTURE / 24-48H SPRINT',
    aspectRatio: '21:9',
    source: 'FEVIQO Studio Production',
  },
  {
    id: 'vid-agency-out-1',
    page: 'agencies',
    section: 'main',
    title: 'Multi-Brand Retainer Fulfillment',
    description: 'Dedicated editors assigned per brand kit with two-tier internal QA.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85',
    isActive: true,
    sortOrder: 1,
    clientOrTag: 'RETAINER SPRINT',
    aspectRatio: '16:9',
  },
  {
    id: 'vid-agency-out-2',
    page: 'agencies',
    section: 'main',
    title: 'High-Volume Paid Ad Variations',
    description: 'Rapid iterations of hooks and callouts without creative fatigue.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85',
    isActive: true,
    sortOrder: 2,
    clientOrTag: 'PAID SOCIAL CREATIVE',
    aspectRatio: '16:9',
  },
  {
    id: 'vid-agency-port-1',
    page: 'agencies',
    section: 'portfolio',
    title: 'Omnichannel DTC Growth Campaign',
    description: '100% white-label client delivery across TikTok, Meta, and YouTube.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=85',
    isActive: true,
    sortOrder: 1,
    clientOrTag: 'WHITE-LABEL CLIENT CAMPAIGN',
    aspectRatio: '16:9',
  },
  {
    id: 'vid-agency-port-2',
    page: 'agencies',
    section: 'portfolio',
    title: 'Performance Marketing Retainer Sprint',
    description: 'Over 500 deliverables completed with zero in-house hiring overhead.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=85',
    isActive: true,
    sortOrder: 2,
    clientOrTag: 'AGENCY PARTNER DELIVERY',
    aspectRatio: '16:9',
  },
];

export const DEFAULT_DISPLAY_SETTINGS: AssetDisplaySettings = {
  logoHeight: 32,
  heroVideoMaxWidth: 1024,
  heroVideoScale: 100,
  heroVideoRadius: 16,
  pillarImageHeight: 1000,
  pillarImageRadius: 16,
  pillarImageFit: 'cover',
  workflowImageHeight: 340,
  workflowImageRadius: 16,
  galleryCols: 3,
};

export const DEFAULT_WEBSITE_ASSETS: WebsiteAssets = {
  headerLogo: '/HEADER-removebg-preview.png',
  hero: {
    videoMediaId: 'feviqo-hero-video',
    posterMediaId: 'feviqo-hero-poster',
    filename: 'Sequence 01.mp4',
    duration: 51.3,
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
  },
  heroVideoMediaId: 'feviqo-hero-video',
  heroPosterMediaId: 'feviqo-hero-poster',
  heroVideo: '/videos/Sequence-01.mp4',
  heroVideoWebm: '/videos/hero-showcase.webm',
  heroPoster: '/images/feviqo-hero-poster.jpg',
  creativeDecisionsImage: '/images/creative1.png',
  fasterTurnaroundImage: '/images/creative2.png',
  streamlinedProcessImage: '/images/creative3.png',
  structuredWorkflowImage: '/images/creating-hard.png',
  displaySettings: DEFAULT_DISPLAY_SETTINGS,
  customPictures: [],
  audienceVideos: DEFAULT_AUDIENCE_VIDEOS,
  galleryItems: [
    {
      id: 'gal-1',
      title: 'Viral TikTok E-Commerce Unboxing & Hook',
      category: 'Reels / TikTok (9:16)',
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      aspectRatio: '9:16',
      isActive: true,
      views: '1.4M views',
      clientName: 'Lumina Skincare',
    },
    {
      id: 'gal-2',
      title: 'SaaS Product Walkthrough & Kinetic Motion Graphics',
      category: 'YouTube Long-Form (16:9)',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      aspectRatio: '16:9',
      isActive: true,
      views: '420K views',
      clientName: 'Apex Growth CRM',
    },
    {
      id: 'gal-3',
      title: 'Fitness Transformation High-Paced Montage',
      category: 'Reels / TikTok (9:16)',
      thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      aspectRatio: '9:16',
      isActive: true,
      views: '890K views',
      clientName: 'Max Gains Fitness',
    },
    {
      id: 'gal-4',
      title: 'Creator Podcast Highlights & Dynamic Subtitles',
      category: 'Podcast Repurposing',
      thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      aspectRatio: '9:16',
      isActive: true,
      views: '650K views',
      clientName: 'The Founder Mindset',
    },
    {
      id: 'gal-5',
      title: 'Luxury Real Estate Cinematic Drone Tour',
      category: 'Commercial (16:9)',
      thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      aspectRatio: '16:9',
      isActive: true,
      views: '310K views',
      clientName: 'Bel Air Estates',
    },
  ],
};

/**
 * Safely parses a Vimeo ID from either pure digits, a vimeo.com URL, or embed iframe HTML
 */
export function parseVimeoId(input?: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  // Match https://vimeo.com/1225114561 or player.vimeo.com/video/1225114561
  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (match && match[1]) return match[1];
  return null;
}

const STORAGE_KEY = 'feviqo_website_assets_v2';

/**
 * Strips temporary blob: URLs and replaces them with durable permanent asset paths
 * NEVER discards legitimate /uploads/ or /images/ media.
 */
export function sanitizeWebsiteAssets(assets: Partial<WebsiteAssets>): WebsiteAssets {
  const sanitizeUrl = (url: string | undefined, defaultUrl: string): string => {
    if (!url || typeof url !== 'string' || url.startsWith('blob:')) {
      return defaultUrl;
    }
    return url;
  };

  const cleanDisplaySettings: AssetDisplaySettings = {
    ...DEFAULT_DISPLAY_SETTINGS,
    ...(assets.displaySettings || {}),
    pillarImageHeight: (assets.displaySettings?.pillarImageHeight === 550) 
      ? 1000 
      : (assets.displaySettings?.pillarImageHeight ?? DEFAULT_DISPLAY_SETTINGS.pillarImageHeight),
  };

  const cleanAudienceVideos = (assets.audienceVideos && assets.audienceVideos.length > 0
    ? assets.audienceVideos
    : DEFAULT_AUDIENCE_VIDEOS
  ).map(vid => ({
    ...vid,
    videoUrl: sanitizeUrl(vid.videoUrl, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
    thumbnail: sanitizeUrl(vid.thumbnail, 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=85'),
  }));

  const cleanGalleryItems = (assets.galleryItems && assets.galleryItems.length > 0
    ? assets.galleryItems
    : DEFAULT_WEBSITE_ASSETS.galleryItems
  ).map(item => ({
    ...item,
    videoUrl: sanitizeUrl(item.videoUrl, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
    thumbnail: sanitizeUrl(item.thumbnail, 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'),
  }));

  const cleanCustomPictures = (assets.customPictures || []).filter(pic => pic && !pic.url.startsWith('blob:'));

  const cleanHero: HeroMediaConfig = {
    videoMediaId: assets.hero?.videoMediaId || assets.heroVideoMediaId || DEFAULT_WEBSITE_ASSETS.hero?.videoMediaId,
    posterMediaId: assets.hero?.posterMediaId || assets.heroPosterMediaId || DEFAULT_WEBSITE_ASSETS.hero?.posterMediaId,
    filename: assets.hero?.filename || 'Sequence 01.mp4',
    duration: assets.hero?.duration || 51.3,
    width: assets.hero?.width || 1280,
    height: assets.hero?.height || 720,
    aspectRatio: assets.hero?.aspectRatio || '16:9',
  };

  return {
    headerLogo: sanitizeUrl(assets.headerLogo, DEFAULT_WEBSITE_ASSETS.headerLogo),
    hero: cleanHero,
    heroVideoMediaId: cleanHero.videoMediaId,
    heroPosterMediaId: cleanHero.posterMediaId,
    heroVideo: sanitizeUrl(assets.heroVideo, DEFAULT_WEBSITE_ASSETS.heroVideo),
    heroVideoWebm: sanitizeUrl(assets.heroVideoWebm, DEFAULT_WEBSITE_ASSETS.heroVideoWebm),
    heroPoster: sanitizeUrl(assets.heroPoster, DEFAULT_WEBSITE_ASSETS.heroPoster),
    creativeDecisionsImage: sanitizeUrl(assets.creativeDecisionsImage, DEFAULT_WEBSITE_ASSETS.creativeDecisionsImage),
    fasterTurnaroundImage: sanitizeUrl(assets.fasterTurnaroundImage, DEFAULT_WEBSITE_ASSETS.fasterTurnaroundImage),
    streamlinedProcessImage: sanitizeUrl(assets.streamlinedProcessImage, DEFAULT_WEBSITE_ASSETS.streamlinedProcessImage),
    structuredWorkflowImage: sanitizeUrl(assets.structuredWorkflowImage, DEFAULT_WEBSITE_ASSETS.structuredWorkflowImage),
    displaySettings: cleanDisplaySettings,
    audienceVideos: cleanAudienceVideos,
    galleryItems: cleanGalleryItems,
    customPictures: cleanCustomPictures,
  };
}

export function getWebsiteAssets(): WebsiteAssets {
  if (typeof window === 'undefined') return DEFAULT_WEBSITE_ASSETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return sanitizeWebsiteAssets(parsed);
    }
  } catch (err) {
    console.error('Failed to load website assets from localStorage:', err);
  }
  return DEFAULT_WEBSITE_ASSETS;
}

/**
 * Initializes and synchronizes website assets from the server's persistent disk
 */
export async function initializeAssetSync(): Promise<WebsiteAssets> {
  try {
    const res = await fetch('/api/assets');
    if (res.ok) {
      const serverAssets = await res.json();
      if (serverAssets && Object.keys(serverAssets).length > 0) {
        const clean = sanitizeWebsiteAssets(serverAssets);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
          window.dispatchEvent(new CustomEvent('feviqo_assets_updated', { detail: clean }));
        }
        return clean;
      }
    }
  } catch (err) {
    console.warn('Asset sync from server failed, using local/default assets:', err);
  }
  return getWebsiteAssets();
}

/**
 * Filter audience videos by page and section, sorted by sortOrder
 */
export function getAudienceVideos(page?: AudiencePageType, section?: AudienceSectionType): AudienceVideoItem[] {
  const assets = getWebsiteAssets();
  const list = assets.audienceVideos || DEFAULT_AUDIENCE_VIDEOS;
  return list
    .filter(item => {
      if (page && item.page !== page) return false;
      if (section && item.section !== section) return false;
      return true;
    })
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

/**
 * Get active hero video for an audience page
 */
export function getAudienceHeroVideo(page: AudiencePageType): AudienceVideoItem | undefined {
  const videos = getAudienceVideos(page, 'hero');
  return videos.find(v => v.isActive) || videos[0];
}

/**
 * Save or update an audience video
 */
export function saveAudienceVideo(video: AudienceVideoItem): void {
  const assets = getWebsiteAssets();
  const existing = assets.audienceVideos || [...DEFAULT_AUDIENCE_VIDEOS];
  const idx = existing.findIndex(v => v.id === video.id);
  let updatedList: AudienceVideoItem[];
  if (idx >= 0) {
    updatedList = existing.map((v, i) => i === idx ? video : v);
  } else {
    updatedList = [...existing, video];
  }
  saveWebsiteAssets({ ...assets, audienceVideos: updatedList });
}

/**
 * Delete an audience video by ID
 */
export function deleteAudienceVideo(id: string): void {
  const assets = getWebsiteAssets();
  const existing = assets.audienceVideos || [...DEFAULT_AUDIENCE_VIDEOS];
  const updatedList = existing.filter(v => v.id !== id);
  saveWebsiteAssets({ ...assets, audienceVideos: updatedList });
}

/**
 * Toggle active state for an audience video
 */
export function toggleAudienceVideoStatus(id: string): void {
  const assets = getWebsiteAssets();
  const existing = assets.audienceVideos || [...DEFAULT_AUDIENCE_VIDEOS];
  const updatedList = existing.map(v => v.id === id ? { ...v, isActive: !v.isActive } : v);
  saveWebsiteAssets({ ...assets, audienceVideos: updatedList });
}

export function saveWebsiteAssets(assets: Partial<WebsiteAssets>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getWebsiteAssets();
    const merged = { ...current, ...assets } as WebsiteAssets;
    const cleanAssets = sanitizeWebsiteAssets(merged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanAssets));
    // Trigger custom event so components re-render immediately
    window.dispatchEvent(new CustomEvent('feviqo_assets_updated', { detail: cleanAssets }));
    
    // Also sync to server API
    fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanAssets),
    }).catch((err) => {
      console.warn('Server asset persistence sync failed:', err);
    });
  } catch (err) {
    console.error('Failed to save website assets:', err);
  }
}

export function resetWebsiteAssets(): WebsiteAssets {
  saveWebsiteAssets(DEFAULT_WEBSITE_ASSETS);
  return DEFAULT_WEBSITE_ASSETS;
}

export function subscribeWebsiteAssets(callback: (assets: WebsiteAssets) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (event: any) => {
    if (event?.detail) {
      callback(event.detail);
    } else {
      callback(getWebsiteAssets());
    }
  };
  window.addEventListener('feviqo_assets_updated', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('feviqo_assets_updated', handler);
    window.removeEventListener('storage', handler);
  };
}

export interface ChunkUploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  currentChunk: number;
  totalChunks: number;
  percentage: number;
  status: string;
}

/**
 * Resumable 15MB Chunked Uploader
 * Bypasses Google Cloud Run and Nginx 30MB/32MB single request limits.
 * Supports files up to 2048 MB (900MB+).
 */
export async function uploadChunkedFile(
  file: File,
  options?: {
    targetFileName?: string;
    targetDir?: 'videos' | 'uploads';
    onProgress?: (p: ChunkUploadProgress) => void;
  }
): Promise<{ success: boolean; url: string; fileName: string; size: number; sizeMb?: string; error?: string }> {
  try {
    const chunkSize = 15 * 1024 * 1024; // 15MB chunks (safe for Cloud Run 32MB body limit)
    const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));
    const uploadId = `upl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const finalName = options?.targetFileName || file.name;
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v|mkv)$/i.test(file.name);
    const targetDir = options?.targetDir || (isVideo ? 'videos' : 'uploads');

    let uploadedBytes = 0;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunkBlob = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunkBlob, `chunk_${chunkIndex}`);
      formData.append('uploadId', uploadId);
      formData.append('chunkIndex', String(chunkIndex));
      formData.append('totalChunks', String(totalChunks));
      formData.append('fileName', finalName);
      formData.append('targetDir', targetDir);

      if (options?.onProgress) {
        options.onProgress({
          uploadedBytes,
          totalBytes: file.size,
          currentChunk: chunkIndex + 1,
          totalChunks,
          percentage: Math.round((uploadedBytes / file.size) * 100),
          status: `Uploading chunk ${chunkIndex + 1} of ${totalChunks} (${(uploadedBytes / (1024 * 1024)).toFixed(1)} / ${(file.size / (1024 * 1024)).toFixed(1)} MB)...`,
        });
      }

      // Retry up to 3 times per chunk for robust connection
      let res: Response | null = null;
      let attempt = 0;
      let lastErr: any = null;
      while (attempt < 3) {
        try {
          res = await fetch('/api/upload/chunk', {
            method: 'POST',
            body: formData,
          });
          if (res.ok) break;
          const errText = await res.text();
          lastErr = new Error(`Server returned status ${res.status}: ${errText}`);
        } catch (fetchErr) {
          lastErr = fetchErr;
        }
        attempt++;
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }

      if (!res || !res.ok) {
        throw lastErr || new Error(`Failed to upload chunk ${chunkIndex + 1} of ${totalChunks}`);
      }

      const json = await res.json();
      uploadedBytes += (end - start);

      if (json.isComplete) {
        if (options?.onProgress) {
          options.onProgress({
            uploadedBytes: file.size,
            totalBytes: file.size,
            currentChunk: totalChunks,
            totalChunks,
            percentage: 100,
            status: 'Processing video on server...',
          });
        }
        return {
          success: true,
          url: json.url,
          fileName: json.fileName,
          size: json.sizeBytes || file.size,
          sizeMb: json.sizeMb,
        };
      }
    }

    return {
      success: false,
      url: '',
      fileName: file.name,
      size: file.size,
      error: 'Upload reached end of chunks but server assembly did not respond.',
    };
  } catch (err: any) {
    console.error('uploadChunkedFile error:', err);
    return {
      success: false,
      url: '',
      fileName: file.name,
      size: file.size,
      error: err.message || 'Chunked upload failed',
    };
  }
}

/**
 * Direct file uploader with automated chunking for large files & videos
 * Writes permanently to server disk. NEVER uses ephemeral blob URLs.
 */
export async function uploadAssetFile(
  file: File,
  onProgress?: (p: ChunkUploadProgress) => void
): Promise<{ success: boolean; url: string; fileName: string; size: number; error?: string }> {
  try {
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v|mkv)$/i.test(file.name);
    
    // Automatically use chunked upload for all videos and files > 20MB
    if (file.size > 20 * 1024 * 1024 || isVideo) {
      return await uploadChunkedFile(file, { onProgress });
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/file', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.file) {
        return {
          success: true,
          url: json.file.url,
          fileName: json.file.fileName,
          size: json.file.size,
        };
      }
    }

    // Fallback: try chunked upload if standard POST failed
    return await uploadChunkedFile(file, { onProgress });
  } catch (err: any) {
    console.error('File upload error:', err);
    return {
      success: false,
      url: '',
      fileName: file.name,
      size: file.size,
      error: err.message || 'Upload failed',
    };
  }
}

/**
 * Fetch list of all uploaded files from server disk
 */
export async function fetchServerUploads(): Promise<UploadedFileRecord[]> {
  try {
    const res = await fetch('/api/uploads');
    if (res.ok) {
      const data = await res.json();
      return data.files || [];
    }
  } catch (err) {
    console.warn('Failed to fetch server uploads:', err);
  }
  return [];
}

/**
 * Delete an uploaded file from server disk
 */
export async function deleteServerUpload(fileName: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/upload/${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete server upload:', err);
    return false;
  }
}

/**
 * Direct video uploader using 15MB chunks to bypass proxy size limits
 * Saves directly to public/videos/ and uploads/ (Supports files up to 2048MB / 2GB)
 */
export async function uploadPublicVideoFile(
  file: File,
  targetFileName?: string,
  onProgress?: (p: ChunkUploadProgress) => void
): Promise<{ success: boolean; url: string; fileName: string; sizeMb?: string; error?: string }> {
  return await uploadChunkedFile(file, {
    targetFileName: targetFileName || file.name,
    targetDir: 'videos',
    onProgress,
  });
}

/**
 * Fetch list of videos directly from public/videos
 */
export async function fetchPublicVideos(): Promise<Array<{ fileName: string; url: string; sizeMb: string; sizeBytes: number }>> {
  try {
    const res = await fetch('/api/videos/list');
    if (res.ok) {
      const data = await res.json();
      return data.videos || [];
    }
  } catch (err) {
    console.warn('Failed to fetch public videos:', err);
  }
  return [];
}


import { DEFAULT_PAGE_SEO } from './seoStore';
import { GUNESIN_EPISODES } from '../data/gunesinDogduguYer';
import { MEHMED_EPISODES } from '../data/mehmedData';
import { YERALTI_EPISODES } from '../data/yeraltiData';
import fs from 'fs';
import path from 'path';

const SITE_ORIGIN = 'https://feviqo.com';

interface VideoXmlInfo {
  thumbnail: string;
  title: string;
  description: string;
  contentLoc: string;
  duration?: string;
  pubDate?: string;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatUrlNode(
  urlPath: string,
  priority: string = '0.9',
  changefreq: string = 'daily',
  lastmod: string = new Date().toISOString().split('T')[0],
  imageLoc?: string,
  imageTitle?: string,
  videoInfo?: VideoXmlInfo
): string {
  let normalizedPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  const fullLoc = `${SITE_ORIGIN}${normalizedPath}`;
  
  let node = `  <url>\n`;
  node += `    <loc>${escapeXml(fullLoc)}</loc>\n`;
  node += `    <lastmod>${lastmod}</lastmod>\n`;
  node += `    <changefreq>${changefreq}</changefreq>\n`;
  node += `    <priority>${priority}</priority>\n`;

  if (imageLoc) {
    node += `    <image:image>\n`;
    node += `      <image:loc>${escapeXml(imageLoc)}</image:loc>\n`;
    if (imageTitle) {
      node += `      <image:title>${escapeXml(imageTitle)}</image:title>\n`;
    }
    node += `    </image:image>\n`;
  }

  if (videoInfo) {
    node += `    <video:video>\n`;
    node += `      <video:thumbnail_loc>${escapeXml(videoInfo.thumbnail)}</video:thumbnail_loc>\n`;
    node += `      <video:title>${escapeXml(videoInfo.title)}</video:title>\n`;
    node += `      <video:description>${escapeXml(videoInfo.description)}</video:description>\n`;
    node += `      <video:player_loc>${escapeXml(fullLoc)}</video:player_loc>\n`;
    node += `      <video:content_loc>${escapeXml(videoInfo.contentLoc)}</video:content_loc>\n`;
    node += `      <video:duration>${videoInfo.duration || '8700'}</video:duration>\n`;
    node += `      <video:publication_date>${videoInfo.pubDate || '2026-10-08T18:00:00+00:00'}</video:publication_date>\n`;
    node += `      <video:family_friendly>YES</video:family_friendly>\n`;
    node += `    </video:video>\n`;
  }

  node += `  </url>\n`;
  return node;
}

/**
 * Single Master Sitemap Generator (sitemap.xml)
 * Clean, single sitemap containing all main pages and drama episodes without any sub-sitemaps.
 */
const DEFAULT_SITE_LASTMOD = '2026-11-16';

export function generateSitemapXml(): string {
  const seenUrls = new Set<string>();
  const defaultLastmod = DEFAULT_SITE_LASTMOD;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`;
  xml += `        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

  const addNode = (
    urlPath: string,
    priority: string = '0.9',
    changefreq: string = 'daily',
    lastmod: string = defaultLastmod,
    imageLoc?: string,
    imageTitle?: string,
    videoInfo?: VideoXmlInfo
  ) => {
    let normalizedPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
    if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    // Block all trending subpaths
    if (normalizedPath.startsWith('/trending')) return;
    if (seenUrls.has(normalizedPath)) return;
    seenUrls.add(normalizedPath);
    xml += formatUrlNode(normalizedPath, priority, changefreq, lastmod, imageLoc, imageTitle, videoInfo);
  };

  // 1. Core pages from DEFAULT_PAGE_SEO (prioritize homepage, /membership, and /dramas at top)
  const priorityFirstRoutes = ['/', '/membership', '/dramas', '/yeralti', '/teskilat', '/mehmed-fetihler-sultani', '/gunesin-dogdugu-yer'];
  const allRouteKeys = [
    ...priorityFirstRoutes.filter((r) => Boolean(DEFAULT_PAGE_SEO[r])),
    ...Object.keys(DEFAULT_PAGE_SEO).filter((r) => !priorityFirstRoutes.includes(r)),
  ];

  allRouteKeys.forEach((routeKey) => {
    if (routeKey.startsWith('/trending')) return;

    const config = DEFAULT_PAGE_SEO[routeKey];
    // A sitemap must not advertise pages explicitly marked noindex.
    if (config?.robots?.toLowerCase().includes('noindex')) return;
    let priority = '0.9';
    let changefreq = 'daily';

    if (routeKey === '/' || routeKey === '/membership') priority = '1.0';
    if (routeKey.includes('episode-')) priority = '1.0';
    if (['/privacy', '/terms'].includes(routeKey)) {
      priority = '0.5';
      changefreq = 'monthly';
    }

    let videoInfo: VideoXmlInfo | undefined = undefined;
    if (routeKey === '/teskilat/episode-189') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/15lsrpRxnIw6C491oFLSXMXCC50o2ByfC',
        title: 'Teskilat Season 7 Episode 189 Urdu Subtitles (Full Episode) – Teskilat 189. Bölüm Urdu',
        description: 'Watch Teşkilat Episode 189 with Urdu subtitles. Framed for high treason, Altay Yalçın escapes custody to clear his name, leading to a shocking Swiss showdown.',
        contentLoc: 'https://stream.mux.com/toXOVmLVaJSsRkVRJUxYiColdHPoHLSI8qBM00KBHyuA.m3u8'
      };
    } else if (routeKey === '/teskilat/episode-188') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/1FXGXBZcts9bp3XdPmqI_pGytI0GAKYDc',
        title: 'Teskilat Season 7 Episode 4 Urdu Subtitles - Bolum 188 Ender Rescue',
        description: 'Watch Teskilat Season 7 Episode 4 Urdu Subtitles (Bolum 188). Altay closes in on Ender as suspicion around Azra grows and Korkut corners Yahya.',
        contentLoc: 'https://stream.mux.com/myroEGBWeut02BU5yZEPr3GT3stSVu91dYtKAJPeJkfs.m3u8'
      };
    } else if (routeKey === '/teskilat/episode-187') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
        title: 'Teskilat Season 7 Episode 3 Urdu Subtitles – Bolum 187',
        description: 'Watch Teskilat Season 7 Episode 3 Urdu Subtitles (Bolum 187) with story recaps on FEVIQO.',
        contentLoc: 'https://stream.mux.com/vPkzwE9vrAHq4uz4hPyjFu4ZVQOzsORSqxYDzUnYm4o.m3u8'
      };
    } else if (routeKey === '/teskilat/episode-186') {
      videoInfo = {
        thumbnail: 'https://feviqo.com/images/teskialt186thumbnIL.png',
        title: 'Teskilat Season 7 Episode 2 Urdu Subtitles – Bolum 186',
        description: 'Watch Teskilat Season 7 Episode 2 Urdu Subtitles (Bolum 186) with story recaps on FEVIQO.',
        contentLoc: 'https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8'
      };
    } else if (routeKey === '/mehmed-fetihler-sultani/episode-90') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/1Ql7rSRtgL6HfxOyO-BSfPN8CdfUooJ1p',
        title: 'Mehmed Season 4 Episode 90 Urdu Subtitles | Bolum 90',
        description: 'Watch Mehmed Fetihler Sultani Season 4 Episode 90 Urdu Subtitles (Bolum 90) in 1080p HD on FEVIQO. Sultan Mehmed II confronts an imperial crisis as enemy armies assemble and secret betrayals unfold.',
        contentLoc: 'https://stream.mux.com/iZwLfzcSIyWE302WmxZ39wVyGRbT00hw2gYJsdmKosn7s.m3u8'
      };
    } else if (routeKey === '/mehmed-fetihler-sultani/episode-89') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/15DClk9e82Zvbxbjx4_wOMcSa298IFcR5',
        title: 'Mehmed Season 4 Episode 89 Urdu Subtitles | Bolum 89 - Mehmed Fetihler Sultani',
        description: 'Watch Mehmed Fetihler Sultani Season 4 Episode 89 Urdu Subtitles (Bolum 89) in 1080p HD on FEVIQO. Sultan Mehmed II executes a decisive tactical siege as secret alliances threaten the empire.',
        contentLoc: 'https://stream.mux.com/q3MFc527rZ7V0101YFeDLV8aCbWBk5oSnRsNQscKjDRuQ.m3u8'
      };
    } else if (routeKey === '/mehmed-fetihler-sultani/episode-88') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg',
        title: 'Mehmed Fetihler Sultani Episode 88 Urdu Subtitles | Bolum 88',
        description: 'Watch Mehmed Fetihler Sultani Episode 88 Urdu Subtitles (Bolum 88) on FEVIQO.',
        contentLoc: 'https://stream.mux.com/4yMhhN6VhrnhA72oCdYqlFQatv1k00kVcQHEuNYPo02Gg.m3u8'
      };
    } else if (routeKey === '/mehmed-fetihler-sultani/episode-87') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg',
        title: 'Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87',
        description: 'Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87) on FEVIQO.',
        contentLoc: 'https://stream.mux.com/CNLUrkuH54rxQm44KMrZUcUtKj15j4RcxAyyn2fzTpU.m3u8'
      };
    } else if (routeKey === '/gunesin-dogdugu-yer/episode-7') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/137w7jkmYW4bpn4rfdipcJ4gJksnpqeL4',
        title: 'Gunesin Dogdugu Yer Episode 7 Urdu Subtitles – Bolum 7',
        description: 'Watch Gunesin Dogdugu Yer Episode 7 in HD Urdu Subtitles with story recap on FEVIQO.com.',
        contentLoc: 'https://stream.mux.com/neflT01u9Ey4vSvhNwuZQH8LcR9IpeWcDFnHO4hS7N02M.m3u8'
      };
    } else if (routeKey === '/gunesin-dogdugu-yer/episode-5') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/1ww1YXzsV-PBId4z9g6oPZSYHVXiDOiPO',
        title: 'Gunesin Dogdugu Yer Episode 5 Urdu Subtitles – Bolum 5',
        description: 'Watch Gunesin Dogdugu Yer Episode 5 in HD Urdu Subtitles with story recap on FEVIQO.com.',
        contentLoc: 'https://stream.mux.com/i1zZCVwsVnWgYj01cysfhD02801SVUNouReM02jM5QUmvjg.m3u8'
      };
    } else if (routeKey === '/gunesin-dogdugu-yer/episode-4') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/1KaS-64iPUBSZ2gtZ3B2tj3bwmAUFa6gV',
        title: 'Gunesin Dogdugu Yer Episode 4 Urdu Subtitles – Bolum 4',
        description: 'Watch Gunesin Dogdugu Yer Episode 4 in HD Urdu Subtitles with story recap on FEVIQO.com.',
        contentLoc: 'https://stream.mux.com/Ck3e005cjwlomj37YDhAp2WFDcwAOcpGsPLagVVtxaVU.m3u8'
      };
    } else if (routeKey === '/gunesin-dogdugu-yer/episode-3') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/1VsQl3XReqSBLh5sk5UbalpsaVoSs0ggj',
        title: 'Gunesin Dogdugu Yer Episode 3 Urdu Subtitles – Bolum 3',
        description: 'Watch Gunesin Dogdugu Yer Episode 3 in HD Urdu Subtitles with story recap on FEVIQO.com.',
        contentLoc: 'https://stream.mux.com/ff2G9XfcMerNcnD02iPnysGkByH6SMTSa7p2yP01DuzT4.m3u8'
      };
    } else if (routeKey === '/') {
      videoInfo = {
        thumbnail: 'https://feviqo.com/HEADER-removebg-preview.png',
        title: 'FEVIQO Unlimited Video Editing Showreel',
        description: 'High-converting creator hooks, luxury villa walkthroughs, and performance ad creative samples.',
        contentLoc: 'https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8',
        duration: '45'
      };
    }

    const sitemapImageLoc =
      routeKey === '/membership'
        ? 'https://feviqo.com/images/MEHMED.png'
        : config?.ogImage;

    addNode(
      routeKey,
      priority,
      changefreq,
      defaultLastmod,
      sitemapImageLoc,
      config?.seoTitle,
      videoInfo
    );
  });

  // 2. Güneşin Episodes
  GUNESIN_EPISODES.forEach((ep) => {
    const epPath = `/gunesin-dogdugu-yer/${ep.slug}`;
    const firstEmbed = ep.embeds && ep.embeds[0] ? ep.embeds[0].src : undefined;
    addNode(
      epPath,
      '1.0',
      'daily',
      ep.airDate ? ep.airDate.split('T')[0] : defaultLastmod,
      ep.thumbnail,
      ep.title,
      firstEmbed ? {
        thumbnail: ep.thumbnail,
        title: ep.title,
        description: ep.shortSummary,
        contentLoc: firstEmbed
      } : undefined
    );
  });

  // 3. Mehmed Episodes
  MEHMED_EPISODES.forEach((ep) => {
    const epPath = `/mehmed-fetihler-sultani/${ep.slug}`;
    const firstEmbed = ep.embeds && ep.embeds[0] ? ep.embeds[0].src : undefined;
    addNode(
      epPath,
      '1.0',
      'daily',
      ep.airDate ? ep.airDate.split('T')[0] : defaultLastmod,
      ep.thumbnail,
      ep.title,
      firstEmbed ? {
        thumbnail: ep.thumbnail,
        title: ep.title,
        description: ep.shortSummary,
        contentLoc: firstEmbed
      } : undefined
    );
  });

  // 4. Yeralti Episodes (never expose protected streams)
  YERALTI_EPISODES.forEach((ep) => {
    const epPath = `/yeralti/${ep.slug}`;
    addNode(
      epPath,
      '1.0',
      'daily',
      ep.airDate ? ep.airDate.split('T')[0] : defaultLastmod,
      ep.thumbnail,
      ep.title,
      undefined
    );
  });

  xml += `</urlset>\n`;
  return xml;
}

// Backward compatibility exports
export function generateMainSitemapXml(): string {
  return generateSitemapXml();
}

export function generateEpisodesSitemapXml(): string {
  return generateSitemapXml();
}

export function generateTrendingSitemapXml(): string {
  return generateSitemapXml();
}

export function generateSitemapIndexXml(): string {
  return generateSitemapXml();
}

/**
 * Automatically regenerates single sitemap.xml on disk
 */
export function updateSitemapFiles(): void {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const xml = generateSitemapXml();

    const publicSitemapPath = path.join(publicDir, 'sitemap.xml');
    const existingPublic = fs.existsSync(publicSitemapPath)
      ? fs.readFileSync(publicSitemapPath, 'utf-8')
      : '';
    if (existingPublic !== xml) {
      fs.writeFileSync(publicSitemapPath, xml, 'utf-8');
    }

    const distDir = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      const distSitemapPath = path.join(distDir, 'sitemap.xml');
      const existingDist = fs.existsSync(distSitemapPath)
        ? fs.readFileSync(distSitemapPath, 'utf-8')
        : '';
      if (existingDist !== xml) {
        fs.writeFileSync(distSitemapPath, xml, 'utf-8');
      }
    }

    // Clean up any stale sub-sitemap files in public/ if they exist
    const staleFiles = [
      'sitemap-index.xml',
      'sitemap_index.xml',
      'sitemap-main.xml',
      'sitemap-episodes.xml',
      'sitemap-trending.xml'
    ];
    staleFiles.forEach((file) => {
      const p = path.join(publicDir, file);
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch {}
      }
    });
  } catch (err) {
    console.error('Failed to write sitemap file:', err);
  }
}

export function updateSitemapFile(): void {
  updateSitemapFiles();
}

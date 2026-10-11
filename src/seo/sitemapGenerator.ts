import { DEFAULT_PAGE_SEO } from './seoStore';
import { INITIAL_TRENDING_ARTICLES } from '../data/trendingArticlesData';
import { GUNESIN_EPISODES } from '../data/gunesinDogduguYer';
import fs from 'fs';
import path from 'path';

export function generateSitemapXml(): string {
  const seenUrls = new Set<string>();
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`;
  xml += `        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

  // Helper to add URL node
  const addUrlNode = (
    urlPath: string,
    priority: string = '0.9',
    changefreq: string = 'daily',
    lastmod: string = today,
    imageLoc?: string,
    imageTitle?: string,
    videoInfo?: {
      thumbnail: string;
      title: string;
      description: string;
      contentLoc: string;
      duration?: string;
      pubDate?: string;
    }
  ) => {
    const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
    if (seenUrls.has(cleanPath)) return;
    seenUrls.add(cleanPath);

    const fullLoc = `https://feviqo.com${cleanPath === '/' ? '/' : cleanPath}`;
    const safeLoc = fullLoc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    xml += `  <url>\n`;
    xml += `    <loc>${safeLoc}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;

    if (imageLoc) {
      const safeImageLoc = imageLoc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${safeImageLoc}</image:loc>\n`;
      if (imageTitle) {
        const safeTitle = imageTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        xml += `      <image:title>${safeTitle}</image:title>\n`;
      }
      xml += `    </image:image>\n`;
    }

    if (videoInfo) {
      const safeVideoThumb = videoInfo.thumbnail.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeVideoContent = videoInfo.contentLoc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeVideoTitle = videoInfo.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeVideoDesc = videoInfo.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      xml += `    <video:video>\n`;
      xml += `      <video:thumbnail_loc>${safeVideoThumb}</video:thumbnail_loc>\n`;
      xml += `      <video:title>${safeVideoTitle}</video:title>\n`;
      xml += `      <video:description>${safeVideoDesc}</video:description>\n`;
      xml += `      <video:content_loc>${safeVideoContent}</video:content_loc>\n`;
      xml += `      <video:duration>${videoInfo.duration || '8700'}</video:duration>\n`;
      xml += `      <video:publication_date>${videoInfo.pubDate || '2026-10-08T18:00:00+00:00'}</video:publication_date>\n`;
      xml += `      <video:family_friendly>YES</video:family_friendly>\n`;
      xml += `    </video:video>\n`;
    }

    xml += `  </url>\n`;
  };

  // 1. Process all pages from DEFAULT_PAGE_SEO
  Object.keys(DEFAULT_PAGE_SEO).forEach((routeKey) => {
    const config = DEFAULT_PAGE_SEO[routeKey];
    let priority = '0.9';
    let changefreq = 'daily';

    if (routeKey === '/') priority = '1.0';
    if (routeKey.includes('episode-') || routeKey === '/trending') priority = '1.0';
    if (['/privacy', '/terms'].includes(routeKey)) {
      priority = '0.5';
      changefreq = 'monthly';
    }

    let videoInfo: any = undefined;

    // Attach Video Object metadata for video watch pages
    if (routeKey === '/teskilat/episode-187') {
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
    } else if (routeKey === '/gunesin-dogdugu-yer/episode-5') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/1KaS-64iPUBSZ2gtZ3B2tj3bwmAUFa6gV',
        title: 'Gunesin Dogdugu Yer Episode 5 Urdu Subtitles – Bolum 5',
        description: 'Watch Gunesin Dogdugu Yer Episode 5 in HD Urdu Subtitles with story recap on FEVIQO.com.',
        contentLoc: 'https://stream.mux.com/Ck3e005cjwlomj37YDhAp2WFDcwAOcpGsPLagVVtxaVU.m3u8'
      };
    } else if (routeKey === '/teskilat/episode-188' || routeKey === '/teskilat-urdu/episode-188') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
        title: 'Teskilat Season 7 Episode 4 Urdu Subtitles – Bolum 188',
        description: 'Watch Teskilat Season 7 Episode 4 Urdu Subtitles (Bolum 188) with story recaps on FEVIQO.',
        contentLoc: 'https://stream.mux.com/vPkzwE9vrAHq4uz4hPyjFu4ZVQOzsORSqxYDzUnYm4o.m3u8'
      };
    } else if (routeKey === '/mehmed-fetihler-sultani/episode-88') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg',
        title: 'Mehmed Fetihler Sultani Episode 88 Urdu Subtitles | Bolum 88',
        description: 'Watch Mehmed Fetihler Sultani Episode 88 Urdu Subtitles (Bolum 88) on FEVIQO.',
        contentLoc: 'https://stream.mux.com/CNLUrkuH54rxQm44KMrZUcUtKj15j4RcxAyyn2fzTpU.m3u8'
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
        contentLoc: 'https://stream.mux.com/vPkzwE9vrAHq4uz4hPyjFu4ZVQOzsORSqxYDzUnYm4o.m3u8'
      };
    } else if (routeKey === '/mehmed-fetihler-sultani/episode-87' || routeKey === '/mehmed/episode-87') {
      videoInfo = {
        thumbnail: 'https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg',
        title: 'Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87',
        description: 'Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87) on FEVIQO.',
        contentLoc: 'https://stream.mux.com/CNLUrkuH54rxQm44KMrZUcUtKj15j4RcxAyyn2fzTpU.m3u8'
      };
    } else if (routeKey === '/') {
      videoInfo = {
        thumbnail: 'https://feviqo.com/images/feviqo-hero-poster.jpg',
        title: 'FEVIQO Unlimited Video Editing Showreel',
        description: 'High-converting creator hooks, luxury villa walkthroughs, and performance ad creative samples.',
        contentLoc: 'https://stream.mux.com/hQglpqXvqnXLQq57m01p5dRGsGT3JQjUxJZX4sc02pfWs.m3u8',
        duration: '45'
      };
    }

    addUrlNode(
      routeKey,
      priority,
      changefreq,
      today,
      config.ogImage,
      config.seoTitle,
      videoInfo
    );
  });

  // 2. Process all dynamically generated Güneşin episodes
  GUNESIN_EPISODES.forEach((ep) => {
    const epPath = `/gunesin-dogdugu-yer/${ep.slug}`;
    const firstEmbed = ep.embeds && ep.embeds[0] ? ep.embeds[0].src : undefined;

    addUrlNode(
      epPath,
      '1.0',
      'daily',
      ep.airDate ? ep.airDate.split('T')[0] : today,
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

  // 3. Process all dynamically created Trending articles from database / file
  INITIAL_TRENDING_ARTICLES.forEach((article) => {
    const articlePath = `/trending/${article.slug}`;
    const pubDate = article.updatedAt ? article.updatedAt.split('T')[0] : today;

    addUrlNode(
      articlePath,
      article.featured ? '1.0' : '0.9',
      'daily',
      pubDate,
      article.featuredImage,
      article.title
    );
  });

  xml += `</urlset>\n`;
  return xml;
}

// Function to update the public/sitemap.xml on disk
export function updateSitemapFile(): void {
  try {
    const xmlContent = generateSitemapXml();
    const publicSitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(publicSitemapPath, xmlContent, 'utf-8');
  } catch (err) {
    console.error('Failed to auto-write public/sitemap.xml:', err);
  }
}

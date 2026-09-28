import { getSEOConfigForPath } from './seoStore';

export function transformHTMLForRoute(html: string, reqPath: string): string {
  const cleanPath = reqPath.split('?')[0].split('#')[0] || '/';
  const config = getSEOConfigForPath(cleanPath);

  let transformed = html;

  // 1. Title
  transformed = transformed.replace(
    /<title>.*?<\/title>/i,
    `<title>${config.seoTitle}</title>`
  );

  // 2. Meta description
  transformed = transformed.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${config.metaDescription}" />`
  );

  // 3. OpenGraph Title, Description, URL, Image, Type
  transformed = transformed.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${config.ogTitle}" />`
  );
  transformed = transformed.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${config.ogDescription}" />`
  );
  transformed = transformed.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${config.canonicalUrl}" />`
  );
  transformed = transformed.replace(
    /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image" content="${config.ogImage}" />`
  );

  const ogType = cleanPath.includes('/teskilat/episode-') ? 'video.episode' : 'website';
  transformed = transformed.replace(
    /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:type" content="${ogType}" />`
  );

  // 4. Inject Canonical Link Tag
  const canonicalTag = `<link rel="canonical" href="${config.canonicalUrl}" />`;
  transformed = transformed.replace('</head>', `  ${canonicalTag}\n  </head>`);

  // 5. Inject Dynamic JSON-LD Schema
  let schemaObj: any = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://feviqo.com/#website",
        "url": "https://feviqo.com",
        "name": "FEVIQO",
        "alternateName": ["FEVIQO Video Editing", "FEVIQO Agency", "FEVIQO Studio"],
        "description": "FEVIQO - Unlimited Video Editing Service & Creative Post-Production Agency for Brands and Creators."
      },
      {
        "@type": "Organization",
        "@id": "https://feviqo.com/#organization",
        "name": "FEVIQO",
        "legalName": "FEVIQO Unlimited Video Editing Studio",
        "url": "https://feviqo.com",
        "logo": "https://feviqo.com/feviqo1.png",
        "image": "https://feviqo.com/HEADER-removebg-preview.png",
        "email": "partner@feviqo.com"
      }
    ]
  };

  if (cleanPath === '/teskilat/episode-186') {
    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/teskilat/episode-186#episode",
      "url": "https://feviqo.com/teskilat/episode-186",
      "name": "Teşkilat Season 7 Episode 186 Urdu Subtitles",
      "episodeNumber": "186",
      "seasonNumber": "7",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Teşkilat Season 7 Episode 186 in 1080p HD with full Urdu story recap on FEVIQO.",
      "image": "https://feviqo.com/images/teskialt186thumbnIL.png",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Teşkilat",
        "url": "https://feviqo.com/teskilat"
      },
      "video": {
        "@type": "VideoObject",
        "name": "Teşkilat Season 7 Episode 186 Urdu Subtitles",
        "description": "Full Episode 186 streaming in HD with Urdu Subtitles on FEVIQO.",
        "thumbnailUrl": "https://feviqo.com/images/teskialt186thumbnIL.png",
        "uploadDate": "2026-09-28T08:00:00+00:00",
        "contentUrl": "https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8",
        "embedUrl": "https://feviqo.com/teskilat/episode-186",
        "duration": "PT2H32M",
        "isFamilyFriendly": true
      }
    });
  }

  const jsonLdScript = `<script type="application/ld+json" id="feviqo-server-jsonld">${JSON.stringify(schemaObj)}</script>`;
  transformed = transformed.replace('</head>', `  ${jsonLdScript}\n  </head>`);

  return transformed;
}

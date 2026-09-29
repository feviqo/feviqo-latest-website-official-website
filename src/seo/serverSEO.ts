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
        "alternateName": ["Feviqo", "FEVIQO Video", "FEVIQO Media", "FEVIQO Editing Agency"],
        "url": "https://feviqo.com",
        "logo": "https://feviqo.com/feviqo1.png",
        "image": "https://feviqo.com/HEADER-removebg-preview.png",
        "email": "partner@feviqo.com",
        "disambiguatingDescription": "FEVIQO is a digital video editing agency, creative studio, and post-production platform for creators, brands, and marketing agencies. FEVIQO is NOT an adhesive or glue product.",
        "knowsAbout": ["Video Editing", "Content Creation", "YouTube Video Editing", "TikTok Video Editing", "Post Production", "Video Marketing", "Performance Ads", "Performance Ads Video Editing", "YouTube Content Production", "unlimited video editing subscription", "flat-rate monthly video editors", "Teskilat Urdu Portal"],
        "sameAs": [
          "https://www.youtube.com/@feviqo",
          "https://www.instagram.com/feviqo.co/",
          "https://www.facebook.com/people/Feviqo/61588711067413/",
          "https://www.linkedin.com/company/feviqo/"
        ]
      }
    ]
  };

  if (cleanPath === '/' || cleanPath === '') {
    schemaObj["@graph"].push({
      "@type": "VideoObject",
      "@id": "https://feviqo.com/#video",
      "name": "FEVIQO Unlimited Video Editing Showreel",
      "description": "High-converting creator hooks, luxury villa walkthroughs, performance ad creative samples, and motion graphics edited by FEVIQO dedicated editors.",
      "thumbnailUrl": [
        "https://feviqo.com/images/feviqo-hero-poster.jpg"
      ],
      "uploadDate": "2026-01-15T08:00:00+00:00",
      "contentUrl": "https://stream.mux.com/hQglpqXvqnXLQq57m01p5dRGsGT3JQjUxJZX4sc02pfWs.m3u8",
      "embedUrl": "https://feviqo.com/",
      "duration": "PT0M45S",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });
  }

  if (cleanPath === '/teskilat/episode-186') {
    // Strip the default static homepage JSON-LD script to avoid structured data merging issues
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/teskilat/episode-186#episode",
      "url": "https://feviqo.com/teskilat/episode-186",
      "name": "Teskilat Season 7 Episode 186 Urdu Subtitles",
      "episodeNumber": "186",
      "seasonNumber": "7",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Teskilat Season 7 Episode 186 in 1080p HD with full Urdu story recap on FEVIQO.",
      "image": "https://feviqo.com/images/teskialt186thumbnIL.png",
      "mainEntityOfPage": "https://feviqo.com/teskilat/episode-186",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Teskilat",
        "url": "https://feviqo.com/teskilat"
      }
    });

    schemaObj["@graph"].push({
      "@type": "VideoObject",
      "@id": "https://feviqo.com/teskilat/episode-186#video",
      "name": "Teskilat Season 7 Episode 186 Urdu Subtitles",
      "description": "Watch Teskilat Season 7 Episode 186 full episode streaming in HD with Urdu Subtitles on FEVIQO.",
      "thumbnailUrl": [
        "https://feviqo.com/images/teskialt186thumbnIL.png"
      ],
      "uploadDate": "2026-09-28T08:00:00+00:00",
      "contentUrl": "https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8",
      "embedUrl": "https://feviqo.com/teskilat/episode-186",
      "duration": "PT2H32M",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/teskilat/episode-186",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });
  }

  const jsonLdScript = `<script type="application/ld+json" id="feviqo-server-jsonld">${JSON.stringify(schemaObj)}</script>`;
  transformed = transformed.replace('</head>', `  ${jsonLdScript}\n  </head>`);

  return transformed;
}

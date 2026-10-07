import { getSEOConfigForPath } from './seoStore';

export function transformHTMLForRoute(html: string, reqPath: string): string {
  let cleanPath = (reqPath || '/').split('?')[0].split('#')[0].toLowerCase();
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  const config = getSEOConfigForPath(cleanPath);

  let transformed = html;

  // 1. Title
  transformed = transformed.replace(
    /<title>.*?<\/title>/i,
    `<title>${config.seoTitle}</title>`
  );

  // 2. Meta description
  transformed = transformed.replace(
    /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="description" content="${config.metaDescription}" />`
  );

  // 2b. Meta keywords
  const keywordsStr = config.secondaryKeywords && config.secondaryKeywords.length > 0 
    ? [config.focusKeyword, ...config.secondaryKeywords].join(', ')
    : config.focusKeyword;

  if (/<meta\s+name=["']keywords["']/i.test(transformed)) {
    transformed = transformed.replace(
      /<meta\s+name=["']keywords["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="keywords" content="${keywordsStr}" />`
    );
  } else {
    transformed = transformed.replace('</head>', `  <meta name="keywords" content="${keywordsStr}" />\n  </head>`);
  }

  // 3. OpenGraph Title, Description, URL, Image, Type
  transformed = transformed.replace(
    /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:title" content="${config.ogTitle}" />`
  );
  transformed = transformed.replace(
    /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:description" content="${config.ogDescription}" />`
  );
  transformed = transformed.replace(
    /<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:url" content="${config.canonicalUrl}" />`
  );
  transformed = transformed.replace(
    /<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:image" content="${config.ogImage}" />\n  <meta property="og:image:secure_url" content="${config.ogImage}" />`
  );

  // 3b. Twitter / X Cards Title, Description, Image
  transformed = transformed.replace(
    /<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="twitter:title" content="${config.ogTitle}" />`
  );
  transformed = transformed.replace(
    /<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="twitter:description" content="${config.ogDescription}" />`
  );
  transformed = transformed.replace(
    /<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="twitter:image" content="${config.ogImage}" />`
  );

  const ogType = cleanPath.includes('/episode-') ? 'video.episode' : 'website';
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

  if (cleanPath === '/teskilat') {
    // Strip the default static homepage JSON-LD script to avoid structured data merging issues
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVSeries",
      "@id": "https://feviqo.com/teskilat#series",
      "url": "https://feviqo.com/teskilat",
      "name": "Teskilat",
      "alternativeName": ["Teskilat Season 7", "Teskilat Urdu", "Teskilat Urdu Subtitles", "Teskilat Bolum 187"],
      "description": "Watch Teskilat Season 7 Episode 187 Urdu Subtitles (Bolum 187). Stream official episode online with story recaps on FEVIQO.",
      "image": "https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "genre": ["Action", "Drama", "Espionage"],
      "actor": [
        { "@type": "PerformanceRole", "actor": { "@type": "Person", "name": "Altay" } },
        { "@type": "PerformanceRole", "actor": { "@type": "Person", "name": "Ender" } },
        { "@type": "PerformanceRole", "actor": { "@type": "Person", "name": "Korkut" } }
      ],
      "containsSeason": {
        "@type": "CreativeWorkSeason",
        "seasonNumber": "7",
        "name": "Teskilat Season 7",
        "episode": [
          {
            "@type": "TVEpisode",
            "episodeNumber": "186",
            "name": "Teskilat Episode 186 Urdu Subtitles",
            "url": "https://feviqo.com/teskilat/episode-186"
          },
          {
            "@type": "TVEpisode",
            "episodeNumber": "187",
            "name": "Teskilat Episode 187 Urdu Subtitles",
            "url": "https://feviqo.com/teskilat/episode-187"
          }
        ]
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
      "name": "Teskilat Season 7 Episode 2 Urdu Subtitles – Bolum 186",
      "episodeNumber": "186",
      "seasonNumber": "7",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Teskilat Season 7 Episode 2 Urdu Subtitles (Bolum 186). Stream full episode with story recap on FEVIQO.com.",
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
      "name": "Teskilat Season 7 Episode 2 Urdu Subtitles – Bolum 186",
      "description": "Watch Teskilat Season 7 Episode 2 (Bolum 186) in 1080p HD with full Urdu story recap on FEVIQO.com.",
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

  if (cleanPath === '/teskilat/episode-187') {
    // Strip the default static homepage JSON-LD script to avoid structured data merging issues
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/teskilat/episode-187#episode",
      "url": "https://feviqo.com/teskilat/episode-187",
      "name": "Teskilat Season 7 Episode 3 Urdu Subtitles – Bolum 187 | FEVIQO",
      "episodeNumber": "187",
      "seasonNumber": "7",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Teskilat Season 7 Episode 3 Urdu Subtitles (Bolum 187). Altay hunts Azra and risks everything to rescue Ender as new traps close in.",
      "image": "https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw",
      "mainEntityOfPage": "https://feviqo.com/teskilat/episode-187",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Teskilat",
        "url": "https://feviqo.com/teskilat"
      }
    });

    schemaObj["@graph"].push({
      "@type": "VideoObject",
      "@id": "https://feviqo.com/teskilat/episode-187#video",
      "name": "Teskilat Season 7 Episode 3 Urdu Subtitles – Bolum 187 | FEVIQO",
      "description": "Watch Teskilat Season 7 Episode 3 Urdu Subtitles (Bolum 187). Altay hunts Azra and risks everything to rescue Ender as new traps close in on FEVIQO.com.",
      "thumbnailUrl": [
        "https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw"
      ],
      "uploadDate": "2026-10-03T08:00:00+00:00",
      "contentUrl": "https://stream.mux.com/vPkzwE9vrAHq4uz4hPyjFu4ZVQOzsORSqxYDzUnYm4o.m3u8",
      "embedUrl": "https://feviqo.com/teskilat/episode-187",
      "duration": "PT2H25M",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/teskilat/episode-187",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });
  }

  if (cleanPath === '/gunesin-dogdugu-yer') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVSeries",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer#series",
      "url": "https://feviqo.com/gunesin-dogdugu-yer",
      "name": "Gunesin Dogdugu Yer",
      "description": "Watch Gunesin Dogdugu Yer Turkish drama in HD Urdu subtitles. Stream all official episodes online with complete story summaries and recaps on FEVIQO.",
      "image": "https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh",
      "containsSeason": {
        "@type": "TVSeason",
        "seasonNumber": 1,
        "name": "Season 1"
      }
    });
  }

  if (cleanPath === '/gunesin-dogdugu-yer/episode-1') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer/episode-1#episode",
      "url": "https://feviqo.com/gunesin-dogdugu-yer/episode-1",
      "name": "Gunesin Dogdugu Yer Episode 1 Urdu Subtitles | FEVIQO",
      "episodeNumber": "1",
      "seasonNumber": "1",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Gunesin Dogdugu Yer Episode 1 in HD Urdu Subtitles. Follow the intense family betrayals and drama watch online with story recaps on FEVIQO.",
      "image": "https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw",
      "mainEntityOfPage": "https://feviqo.com/gunesin-dogdugu-yer/episode-1",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Gunesin Dogdugu Yer",
        "url": "https://feviqo.com/gunesin-dogdugu-yer"
      }
    });
  }

  if (cleanPath === '/gunesin-dogdugu-yer/episode-2') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer/episode-2#episode",
      "url": "https://feviqo.com/gunesin-dogdugu-yer/episode-2",
      "name": "Gunesin Dogdugu Yer Episode 2 Urdu Subtitles | FEVIQO",
      "episodeNumber": "2",
      "seasonNumber": "1",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Gunesin Dogdugu Yer Episode 2 in HD Urdu Subtitles. Follow the intense family betrayals and drama watch online with story recaps on FEVIQO.",
      "image": "https://feviqo.com/images/teskialt186thumbnIL.png",
      "mainEntityOfPage": "https://feviqo.com/gunesin-dogdugu-yer/episode-2",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Gunesin Dogdugu Yer",
        "url": "https://feviqo.com/gunesin-dogdugu-yer"
      }
    });
  }

  if (cleanPath === '/gunesin-dogdugu-yer/episode-3') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer/episode-3#episode",
      "url": "https://feviqo.com/gunesin-dogdugu-yer/episode-3",
      "name": "Gunesin Dogdugu Yer Episode 3 Urdu Subtitles – Bolum 3",
      "episodeNumber": "3",
      "seasonNumber": "1",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Gunesin Dogdugu Yer Episode 3 in HD Urdu Subtitles. Follow the intense family secrets, rivalries, and drama online with full story recaps on FEVIQO.",
      "image": "https://lh3.googleusercontent.com/d/1VsQl3XReqSBLh5sk5UbalpsaVoSs0ggj",
      "mainEntityOfPage": "https://feviqo.com/gunesin-dogdugu-yer/episode-3",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Gunesin Dogdugu Yer",
        "url": "https://feviqo.com/gunesin-dogdugu-yer"
      }
    });

    schemaObj["@graph"].push({
      "@type": "VideoObject",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer/episode-3#video",
      "name": "Gunesin Dogdugu Yer Episode 3 Urdu Subtitles – Bolum 3",
      "description": "Watch Gunesin Dogdugu Yer Episode 3 in HD Urdu Subtitles. Stream full episode online with story recap on FEVIQO.com.",
      "thumbnailUrl": [
        "https://lh3.googleusercontent.com/d/1VsQl3XReqSBLh5sk5UbalpsaVoSs0ggj"
      ],
      "uploadDate": "2026-10-15T18:00:00+00:00",
      "contentUrl": "https://stream.mux.com/vPkzwE9vrAHq4uz4hPyjFu4ZVQOzsORSqxYDzUnYm4o.m3u8",
      "embedUrl": "https://feviqo.com/gunesin-dogdugu-yer/episode-3",
      "duration": "PT2H25M",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/gunesin-dogdugu-yer/episode-3",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });
  }

  if (cleanPath === '/mehmed-fetihler-sultani' || cleanPath === '/mehmed') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVSeries",
      "@id": "https://feviqo.com/mehmed-fetihler-sultani#series",
      "url": "https://feviqo.com/mehmed-fetihler-sultani",
      "name": "Mehmed: Fetihler Sultani",
      "description": "Watch Mehmed Fetihler Sultani Season 4 Urdu Subtitles on FEVIQO. Stream full episodes, historical recaps, and HD releases.",
      "image": "https://lh3.googleusercontent.com/d/1Je_-r1ngLfH15ryeju3suvZC2W0YSTL1",
      "containsSeason": {
        "@type": "TVSeason",
        "seasonNumber": 4,
        "name": "Season 4"
      }
    });
  }

  if (cleanPath === '/mehmed-fetihler-sultani/episode-87' || cleanPath === '/mehmed/episode-87') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/mehmed-fetihler-sultani/episode-87#episode",
      "url": "https://feviqo.com/mehmed-fetihler-sultani/episode-87",
      "name": "Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87",
      "episodeNumber": "87",
      "seasonNumber": "4",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.",
      "image": "https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg",
      "mainEntityOfPage": "https://feviqo.com/mehmed-fetihler-sultani/episode-87",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Mehmed: Fetihler Sultani",
        "url": "https://feviqo.com/mehmed-fetihler-sultani"
      }
    });

    schemaObj["@graph"].push({
      "@type": "VideoObject",
      "@id": "https://feviqo.com/mehmed-fetihler-sultani/episode-87#video",
      "name": "Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87",
      "description": "Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.",
      "thumbnailUrl": [
        "https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg"
      ],
      "uploadDate": "2026-10-06T18:00:00+00:00",
      "contentUrl": "https://stream.mux.com/CNLUrkuH54rxQm44KMrZUcUtKj15j4RcxAyyn2fzTpU.m3u8",
      "embedUrl": "https://feviqo.com/mehmed-fetihler-sultani/episode-87",
      "duration": "PT2H30M",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/mehmed-fetihler-sultani/episode-87",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });
  }

  if (cleanPath === '/dramas') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVSeries",
      "@id": "https://feviqo.com/dramas#series",
      "url": "https://feviqo.com/dramas",
      "name": "Turkish Premium TV Series & Dramas Urdu Subtitles | FEVIQO",
      "description": "Stream premium Turkish TV series and dramas with high-fidelity Urdu subtitles online. Discover trending shows like Teskilat and Gunesin Dogdugu Yer in ultra HD 1080p.",
      "image": "https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2"
    });
  }

  const jsonLdScript = `<script type="application/ld+json" id="feviqo-server-jsonld">${JSON.stringify(schemaObj)}</script>`;
  transformed = transformed.replace('</head>', `  ${jsonLdScript}\n  </head>`);

  return transformed;
}

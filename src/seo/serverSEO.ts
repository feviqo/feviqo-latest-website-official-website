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

  // 4. Inject Canonical Link & Robots Indexing Tags
  transformed = transformed.replace(/<meta\s+name=["']robots["']\s+content=["'].*?["']\s*\/?>/gi, '');
  transformed = transformed.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/gi, '');

  const canonicalTag = `<link rel="canonical" href="${config.canonicalUrl}" />`;
  const robotsTag = `<meta name="robots" content="${config.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}" />`;
  transformed = transformed.replace('</head>', `  ${robotsTag}\n  ${canonicalTag}\n  </head>`);

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
          },
          {
            "@type": "TVEpisode",
            "episodeNumber": "188",
            "name": "Teskilat Episode 188 Urdu Subtitles",
            "url": "https://feviqo.com/teskilat/episode-188"
          }
        ]
      }
    });

    schemaObj["@graph"].push({
      "@type": "ImageObject",
      "@id": "https://feviqo.com/teskilat#posterImage",
      "url": "https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw",
      "contentUrl": "https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw",
      "name": "Teskilat Season 7 Turkish Drama Urdu Subtitles Main Poster",
      "caption": "Teskilat Season 7 Turkish Drama Urdu Subtitles Main Poster Image",
      "description": "Official Teskilat Season 7 Turkish Drama Main Poster featuring Altay, Korkut, and Ender in Urdu Subtitles."
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

    schemaObj["@graph"].push({
      "@type": "ImageObject",
      "@id": "https://feviqo.com/teskilat/episode-187#image",
      "url": "https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw",
      "contentUrl": "https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw",
      "name": "Teskilat Episode 187 Urdu Subtitles HD Poster Thumbnail",
      "caption": "Teskilat Episode 187 Urdu Subtitles HD Thumbnail - Bolum 187",
      "description": "Official Teskilat Episode 187 Urdu Subtitles HD Thumbnail image."
    });
  }

  if (cleanPath === '/teskilat/episode-189' || cleanPath === '/teskilat-urdu/episode-189') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/teskilat/episode-189#episode",
      "url": "https://feviqo.com/teskilat/episode-189",
      "name": "Teskilat Season 7 Episode 189 Urdu Subtitles (Full Episode) – Teskilat 189. Bölüm Urdu",
      "episodeNumber": "189",
      "seasonNumber": "7",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Teşkilat Episode 189 with Urdu subtitles. Framed for high treason, Altay Yalçın escapes custody to clear his name, leading to a shocking Swiss showdown.",
      "image": "https://lh3.googleusercontent.com/d/15lsrpRxnIw6C491oFLSXMXCC50o2ByfC",
      "mainEntityOfPage": "https://feviqo.com/teskilat/episode-189",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Teskilat",
        "url": "https://feviqo.com/teskilat"
      }
    });

    schemaObj["@graph"].push({
      "@type": "VideoObject",
      "@id": "https://feviqo.com/teskilat/episode-189#video",
      "name": "Teskilat Season 7 Episode 189 Urdu Subtitles (Full Episode) – Teskilat 189. Bölüm Urdu",
      "description": "Watch Teşkilat Episode 189 with Urdu subtitles. Framed for high treason, Altay Yalçın escapes custody to clear his name, leading to a shocking Swiss showdown.",
      "thumbnailUrl": [
        "https://lh3.googleusercontent.com/d/15lsrpRxnIw6C491oFLSXMXCC50o2ByfC"
      ],
      "uploadDate": "2026-10-18T04:00:00+00:00",
      "contentUrl": "https://stream.mux.com/toXOVmLVaJSsRkVRJUxYiColdHPoHLSI8qBM00KBHyuA.m3u8",
      "embedUrl": "https://feviqo.com/teskilat/episode-189",
      "duration": "PT2H25M",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/teskilat/episode-189",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });

    schemaObj["@graph"].push({
      "@type": "ImageObject",
      "@id": "https://feviqo.com/teskilat/episode-189#image",
      "url": "https://lh3.googleusercontent.com/d/15lsrpRxnIw6C491oFLSXMXCC50o2ByfC",
      "contentUrl": "https://lh3.googleusercontent.com/d/15lsrpRxnIw6C491oFLSXMXCC50o2ByfC",
      "name": "Teskilat 189 Urdu, Teskilat Episode 189 Urdu Subtitles, Teskilat Bolum 189 Urdu",
      "caption": "Teskilat Season 7 Episode 189 Urdu Subtitles (Full Episode) – Teskilat 189. Bölüm Urdu",
      "description": "Watch Teşkilat Episode 189 with Urdu subtitles. Framed for high treason, Altay Yalçın escapes custody to clear his name, leading to a shocking Swiss showdown."
    });
  }

  if (cleanPath === '/teskilat/episode-188' || cleanPath === '/teskilat-urdu/episode-188') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/teskilat/episode-188#episode",
      "url": "https://feviqo.com/teskilat/episode-188",
      "name": "Teskilat Season 7 Episode 4 Urdu Subtitles - Bolum 188 Ender Rescue | FEVIQO",
      "episodeNumber": "188",
      "seasonNumber": "7",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Teskilat Season 7 Episode 4 Urdu Subtitles (Bolum 188). Altay closes in on Ender as suspicion around Azra grows and Korkut corners Yahya.",
      "image": "https://lh3.googleusercontent.com/d/1FXGXBZcts9bp3XdPmqI_pGytI0GAKYDc",
      "mainEntityOfPage": "https://feviqo.com/teskilat/episode-188",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Teskilat",
        "url": "https://feviqo.com/teskilat"
      }
    });

    schemaObj["@graph"].push({
      "@type": "VideoObject",
      "@id": "https://feviqo.com/teskilat/episode-188#video",
      "name": "Teskilat Season 7 Episode 4 Urdu Subtitles - Bolum 188 Ender Rescue | FEVIQO",
      "description": "Watch Teskilat Season 7 Episode 4 Urdu Subtitles (Bolum 188). Altay closes in on Ender as suspicion around Azra grows and Korkut corners Yahya.",
      "thumbnailUrl": [
        "https://lh3.googleusercontent.com/d/1FXGXBZcts9bp3XdPmqI_pGytI0GAKYDc"
      ],
      "uploadDate": "2026-10-11T08:00:00+00:00",
      "contentUrl": "https://stream.mux.com/myroEGBWeut02BU5yZEPr3GT3stSVu91dYtKAJPeJkfs.m3u8",
      "embedUrl": "https://feviqo.com/teskilat/episode-188",
      "duration": "PT2H20M",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/teskilat/episode-188",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });

    schemaObj["@graph"].push({
      "@type": "ImageObject",
      "@id": "https://feviqo.com/teskilat/episode-188#image",
      "url": "https://lh3.googleusercontent.com/d/1FXGXBZcts9bp3XdPmqI_pGytI0GAKYDc",
      "contentUrl": "https://lh3.googleusercontent.com/d/1FXGXBZcts9bp3XdPmqI_pGytI0GAKYDc",
      "name": "Teskilat 188, teskilat urdu, teskilat teskilat episode 188 urdu",
      "caption": "Teskilat Episode 188, Teskilat 188, teskilat urdu, teskilat teskilat episode 188 urdu",
      "description": "Official Teskilat Episode 188 Urdu Subtitles HD Thumbnail image."
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

    schemaObj["@graph"].push({
      "@type": "ImageObject",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer#posterImage",
      "url": "https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh",
      "contentUrl": "https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh",
      "name": "Gunesin Dogdugu Yer Main Poster Turkish Drama Urdu Subtitles",
      "caption": "Gunesin Dogdugu Yer Main Poster Turkish Drama Urdu Subtitles",
      "description": "Official Gunesin Dogdugu Yer main poster image for Turkish drama with Urdu subtitles."
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
      "contentUrl": "https://stream.mux.com/ff2G9XfcMerNcnD02iPnysGkByH6SMTSa7p2yP01DuzT4.m3u8",
      "embedUrl": "https://feviqo.com/gunesin-dogdugu-yer/episode-3",
      "duration": "PT2H25M",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/gunesin-dogdugu-yer/episode-3",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });

    schemaObj["@graph"].push({
      "@type": "ImageObject",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer/episode-3#image",
      "url": "https://lh3.googleusercontent.com/d/1VsQl3XReqSBLh5sk5UbalpsaVoSs0ggj",
      "contentUrl": "https://lh3.googleusercontent.com/d/1VsQl3XReqSBLh5sk5UbalpsaVoSs0ggj",
      "name": "Gunesin Dogdugu Yer Episode 3 Urdu Subtitles HD Thumbnail",
      "caption": "Gunesin Dogdugu Yer Episode 3 Urdu Subtitles HD Thumbnail - Bolum 3",
      "description": "Official Gunesin Dogdugu Yer Episode 3 Urdu Subtitles HD Thumbnail image."
    });
  }

  if (cleanPath === '/gunesin-dogdugu-yer/episode-4') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer/episode-4#episode",
      "url": "https://feviqo.com/gunesin-dogdugu-yer/episode-4",
      "name": "Gunesin Dogdugu Yer Episode 4 Urdu Subtitles | Bolum 4",
      "episodeNumber": "4",
      "seasonNumber": "1",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Gunesin Dogdugu Yer Episode 4 Urdu Subtitles (Bolum 4) in HD on FEVIQO. Follow the latest episode of this Turkish drama with Urdu subtitles and enjoy a high-quality viewing experience.",
      "image": "https://lh3.googleusercontent.com/d/1KaS-64iPUBSZ2gtZ3B2tj3bwmAUFa6gV",
      "mainEntityOfPage": "https://feviqo.com/gunesin-dogdugu-yer/episode-4",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Gunesin Dogdugu Yer",
        "url": "https://feviqo.com/gunesin-dogdugu-yer"
      }
    });

    schemaObj["@graph"].push({
      "@type": "VideoObject",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer/episode-4#video",
      "name": "Gunesin Dogdugu Yer Episode 4 Urdu Subtitles | Bolum 4",
      "description": "Watch Gunesin Dogdugu Yer Episode 4 Urdu Subtitles (Bolum 4) in HD on FEVIQO. Follow the latest episode of this Turkish drama with Urdu subtitles and enjoy a high-quality viewing experience.",
      "thumbnailUrl": [
        "https://lh3.googleusercontent.com/d/1KaS-64iPUBSZ2gtZ3B2tj3bwmAUFa6gV"
      ],
      "uploadDate": "2026-10-08T18:00:00+00:00",
      "contentUrl": "https://stream.mux.com/Ck3e005cjwlomj37YDhAp2WFDcwAOcpGsPLagVVtxaVU.m3u8",
      "embedUrl": "https://feviqo.com/gunesin-dogdugu-yer/episode-4",
      "duration": "PT2H25M",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/gunesin-dogdugu-yer/episode-4",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });

    schemaObj["@graph"].push({
      "@type": "ImageObject",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer/episode-4#image",
      "url": "https://lh3.googleusercontent.com/d/1KaS-64iPUBSZ2gtZ3B2tj3bwmAUFa6gV",
      "contentUrl": "https://lh3.googleusercontent.com/d/1KaS-64iPUBSZ2gtZ3B2tj3bwmAUFa6gV",
      "name": "Gunesin Dogdugu Yer Episode 4 Urdu Subtitles HD Thumbnail",
      "caption": "Gunesin Dogdugu Yer Episode 4 Urdu Subtitles HD Thumbnail - Bolum 4",
      "description": "Official Gunesin Dogdugu Yer Episode 4 Urdu Subtitles HD Thumbnail image."
    });
  }

  if (cleanPath === '/gunesin-dogdugu-yer/episode-5') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer/episode-5#episode",
      "url": "https://feviqo.com/gunesin-dogdugu-yer/episode-5",
      "name": "Gunesin Dogdugu Yer Episode 5 Urdu Subtitles | Bolum 5",
      "episodeNumber": "5",
      "seasonNumber": "1",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Gunesin Dogdugu Yer Episode 5 Urdu Subtitles (Bolum 5) in HD on FEVIQO. High-stakes family secrets and dramatic betrayals reach an explosive peak in the new episode.",
      "image": "https://lh3.googleusercontent.com/d/1ww1YXzsV-PBId4z9g6oPZSYHVXiDOiPO",
      "mainEntityOfPage": "https://feviqo.com/gunesin-dogdugu-yer/episode-5",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Gunesin Dogdugu Yer",
        "url": "https://feviqo.com/gunesin-dogdugu-yer"
      }
    });

    schemaObj["@graph"].push({
      "@type": "VideoObject",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer/episode-5#video",
      "name": "Gunesin Dogdugu Yer Episode 5 Urdu Subtitles | Bolum 5",
      "description": "Watch Gunesin Dogdugu Yer Episode 5 Urdu Subtitles (Bolum 5) in HD on FEVIQO. High-stakes family secrets and dramatic betrayals reach an explosive peak in the new episode.",
      "thumbnailUrl": [
        "https://lh3.googleusercontent.com/d/1ww1YXzsV-PBId4z9g6oPZSYHVXiDOiPO"
      ],
      "uploadDate": "2026-10-16T04:00:00.000Z",
      "contentUrl": "https://stream.mux.com/i1zZCVwsVnWgYj01cysfhD02801SVUNouReM02jM5QUmvjg.m3u8",
      "embedUrl": "https://feviqo.com/gunesin-dogdugu-yer/episode-5",
      "duration": "PT2H25M",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/gunesin-dogdugu-yer/episode-5",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });

    schemaObj["@graph"].push({
      "@type": "ImageObject",
      "@id": "https://feviqo.com/gunesin-dogdugu-yer/episode-5#image",
      "url": "https://lh3.googleusercontent.com/d/1ww1YXzsV-PBId4z9g6oPZSYHVXiDOiPO",
      "contentUrl": "https://lh3.googleusercontent.com/d/1ww1YXzsV-PBId4z9g6oPZSYHVXiDOiPO",
      "name": "Gunesin Dogdugu Yer Episode 5 Urdu Subtitles HD Thumbnail",
      "caption": "Gunesin Dogdugu Yer Episode 5 Urdu Subtitles HD Thumbnail - Bolum 5",
      "description": "Official Gunesin Dogdugu Yer Episode 5 Urdu Subtitles HD Thumbnail image."
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

  if (cleanPath === '/mehmed-fetihler-sultani/episode-87' || cleanPath === '/mehmed-fetihler-sultani/episode-87/' || cleanPath === '/mehmed/episode-87') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/mehmed-fetihler-sultani/episode-87/#episode",
      "url": "https://feviqo.com/mehmed-fetihler-sultani/episode-87/",
      "name": "Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87",
      "episodeNumber": "87",
      "seasonNumber": "4",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.",
      "image": "https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg",
      "mainEntityOfPage": "https://feviqo.com/mehmed-fetihler-sultani/episode-87/",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Mehmed: Fetihler Sultani",
        "url": "https://feviqo.com/mehmed-fetihler-sultani/"
      }
    });

    schemaObj["@graph"].push({
      "@type": "VideoObject",
      "@id": "https://feviqo.com/mehmed-fetihler-sultani/episode-87/#video",
      "name": "Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87",
      "description": "Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.",
      "thumbnailUrl": [
        "https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg"
      ],
      "uploadDate": "2026-10-06T18:00:00+00:00",
      "contentUrl": "https://stream.mux.com/CNLUrkuH54rxQm44KMrZUcUtKj15j4RcxAyyn2fzTpU.m3u8",
      "embedUrl": "https://feviqo.com/mehmed-fetihler-sultani/episode-87/",
      "duration": "PT2H30M",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/mehmed-fetihler-sultani/episode-87/",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });
  }

  if (cleanPath === '/mehmed-fetihler-sultani/episode-89' || cleanPath === '/mehmed-fetihler-sultani/episode-89/' || cleanPath === '/mehmed/episode-89') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/mehmed-fetihler-sultani/episode-89/#episode",
      "url": "https://feviqo.com/mehmed-fetihler-sultani/episode-89/",
      "name": "Mehmed Season 4 Episode 89 Urdu Subtitles | Bolum 89",
      "episodeNumber": "89",
      "seasonNumber": "4",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Mehmed Fetihler Sultani Season 4 Episode 89 Urdu Subtitles (Bolum 89) in 1080p HD on FEVIQO. Sultan Mehmed II executes a decisive tactical siege as secret alliances threaten the empire.",
      "image": "https://lh3.googleusercontent.com/d/15DClk9e82Zvbxbjx4_wOMcSa298IFcR5",
      "mainEntityOfPage": "https://feviqo.com/mehmed-fetihler-sultani/episode-89/",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Mehmed: Fetihler Sultani",
        "url": "https://feviqo.com/mehmed-fetihler-sultani/"
      }
    });

    schemaObj["@graph"].push({
      "@type": "VideoObject",
      "@id": "https://feviqo.com/mehmed-fetihler-sultani/episode-89/#video",
      "name": "Mehmed Season 4 Episode 89 Urdu Subtitles | Bolum 89",
      "description": "Watch Mehmed Fetihler Sultani Season 4 Episode 89 Urdu Subtitles (Bolum 89) in 1080p HD on FEVIQO. Sultan Mehmed II executes a decisive tactical siege as secret alliances threaten the empire.",
      "thumbnailUrl": [
        "https://lh3.googleusercontent.com/d/15DClk9e82Zvbxbjx4_wOMcSa298IFcR5"
      ],
      "uploadDate": "2026-10-21T04:00:00.000Z",
      "contentUrl": "https://stream.mux.com/q3MFc527rZ7V0101YFeDLV8aCbWBk5oSnRsNQscKjDRuQ.m3u8",
      "embedUrl": "https://feviqo.com/mehmed-fetihler-sultani/episode-89/",
      "duration": "PT2H32M",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/mehmed-fetihler-sultani/episode-89/",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });

    schemaObj["@graph"].push({
      "@type": "ImageObject",
      "@id": "https://feviqo.com/mehmed-fetihler-sultani/episode-89/#image",
      "url": "https://lh3.googleusercontent.com/d/15DClk9e82Zvbxbjx4_wOMcSa298IFcR5",
      "contentUrl": "https://lh3.googleusercontent.com/d/15DClk9e82Zvbxbjx4_wOMcSa298IFcR5",
      "name": "Mehmed Fetihler Sultani Episode 89 Urdu Subtitles HD Thumbnail",
      "caption": "Mehmed Episode 89, Bolum 89 Urdu Subtitles HD Thumbnail",
      "description": "Official Mehmed Fetihler Sultani Episode 89 Urdu Subtitles HD Thumbnail image."
    });
  }

  if (cleanPath === '/mehmed-fetihler-sultani/episode-88' || cleanPath === '/mehmed-fetihler-sultani/episode-88/' || cleanPath === '/mehmed/episode-88') {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    schemaObj["@graph"].push({
      "@type": "TVEpisode",
      "@id": "https://feviqo.com/mehmed-fetihler-sultani/episode-88/#episode",
      "url": "https://feviqo.com/mehmed-fetihler-sultani/episode-88/",
      "name": "Mehmed Season 4 Episode 88 Urdu Subtitles | Bolum 88",
      "episodeNumber": "88",
      "seasonNumber": "4",
      "inLanguage": "Urdu",
      "subtitleLanguage": "Urdu Subtitles",
      "description": "Watch Mehmed Season 4 Episode 88 Urdu Subtitles (Mehmed Fetihler Sultani Bolum 88) in HD on FEVIQO. Sultan Mehmed II prepares an imperial campaign as court rivalries escalate.",
      "image": "https://lh3.googleusercontent.com/d/1w3UK-ZWuESJb-S4r-J_ChUTknl-yaWSq",
      "mainEntityOfPage": "https://feviqo.com/mehmed-fetihler-sultani/episode-88/",
      "isPartOf": {
        "@type": "TVSeries",
        "name": "Mehmed: Fetihler Sultani",
        "url": "https://feviqo.com/mehmed-fetihler-sultani/"
      }
    });

    schemaObj["@graph"].push({
      "@type": "VideoObject",
      "@id": "https://feviqo.com/mehmed-fetihler-sultani/episode-88/#video",
      "name": "Mehmed Season 4 Episode 88 Urdu Subtitles | Bolum 88",
      "description": "Watch Mehmed Season 4 Episode 88 Urdu Subtitles (Mehmed Fetihler Sultani Bolum 88) in HD on FEVIQO. Sultan Mehmed II prepares an imperial campaign as court rivalries escalate.",
      "thumbnailUrl": [
        "https://lh3.googleusercontent.com/d/1w3UK-ZWuESJb-S4r-J_ChUTknl-yaWSq"
      ],
      "uploadDate": "2026-10-14T04:00:00.000Z",
      "contentUrl": "https://stream.mux.com/4yMhhN6VhrnhA72oCdYqlFQatv1k00kVcQHEuNYPo02Gg.m3u8",
      "embedUrl": "https://feviqo.com/mehmed-fetihler-sultani/episode-88/",
      "duration": "PT2H30M",
      "isFamilyFriendly": true,
      "mainEntityOfPage": "https://feviqo.com/mehmed-fetihler-sultani/episode-88/",
      "publisher": {
        "@id": "https://feviqo.com/#organization"
      }
    });

    schemaObj["@graph"].push({
      "@type": "ImageObject",
      "@id": "https://feviqo.com/mehmed-fetihler-sultani/episode-88/#image",
      "url": "https://lh3.googleusercontent.com/d/1w3UK-ZWuESJb-S4r-J_ChUTknl-yaWSq",
      "contentUrl": "https://lh3.googleusercontent.com/d/1w3UK-ZWuESJb-S4r-J_ChUTknl-yaWSq",
      "name": "Mehmed Fetihler Sultani Episode 88 Urdu Subtitles HD Thumbnail",
      "caption": "Mehmed Episode 88, Bolum 88 Urdu Subtitles HD Thumbnail",
      "description": "Official Mehmed Fetihler Sultani Episode 88 Urdu Subtitles HD Thumbnail image."
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

  if (cleanPath.startsWith('/trending')) {
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');

    if (cleanPath === '/trending') {
      schemaObj["@graph"].push({
        "@type": "WebPage",
        "@id": "https://feviqo.com/trending#webpage",
        "url": "https://feviqo.com/trending",
        "name": config.seoTitle,
        "description": config.metaDescription,
        "publisher": {
          "@id": "https://feviqo.com/#organization"
        }
      });
    } else {
      schemaObj["@graph"].push({
        "@type": "NewsArticle",
        "@id": `https://feviqo.com${cleanPath}#article`,
        "url": `https://feviqo.com${cleanPath}`,
        "headline": config.seoTitle,
        "description": config.metaDescription,
        "image": [config.ogImage],
        "datePublished": "2026-10-07T08:00:00+00:00",
        "dateModified": "2026-10-08T08:00:00+00:00",
        "mainEntityOfPage": `https://feviqo.com${cleanPath}`,
        "author": {
          "@type": "Organization",
          "name": "FEVIQO Editorial Research Desk",
          "url": "https://feviqo.com"
        },
        "publisher": {
          "@id": "https://feviqo.com/#organization"
        }
      });
    }
  }

  const jsonLdScript = `<script type="application/ld+json" id="feviqo-server-jsonld">${JSON.stringify(schemaObj)}</script>`;
  transformed = transformed.replace('</head>', `  ${jsonLdScript}\n  </head>`);

  // Inject prerendered semantic body content inside <noscript> inside <div id="root"> so search crawlers see full text & internal links while normal browsers never flash raw text/tags
  const prerenderedBody = `<div id="root"><noscript><div id="seo-crawler-content"><header><nav aria-label="FEVIQO Master Navigation"><a href="/">Home</a> | <a href="/unlimited-editing/">Unlimited Video Editing</a> | <a href="/creators/">Creators</a> | <a href="/agencies/">Agencies</a> | <a href="/business/">Business & Brands</a> | <a href="/gallery/">Video Showcase</a> | <a href="/pricing/">Pricing</a> | <a href="/about/">About Us</a> | <a href="/dramas/">Turkish Dramas Directory</a> | <a href="/turkish-drama/">Turkish Series Hub</a> | <a href="/teskilat/">Teskilat Season 7</a> | <a href="/mehmed-fetihler-sultani/">Mehmed Fetihler Sultani</a> | <a href="/gunesin-dogdugu-yer/">Gunesin Dogdugu Yer</a> | <a href="/trending/">Trending Hub</a></nav></header><main><header><h1>${config.seoTitle}</h1><p>${config.metaDescription}</p></header><article><h2>FEVIQO — Watch Online with Urdu Subtitles HD & Video Post-Production</h2><p>Experience full HD 1080p streaming with complete story recaps, character breakdowns, and official video streams on FEVIQO.</p></article><section><h2>Complete FEVIQO Sitemap Directory & Navigation Links</h2><ul><li><a href="/">FEVIQO Unlimited Video Editing Agency Home</a></li><li><a href="/mehmed-fetihler-sultani/">Mehmed Fetihler Sultani Main Hub</a></li><li><a href="/mehmed-fetihler-sultani/episode-89/">Mehmed Fetihler Sultani Episode 89 (Bolum 89) Urdu Subtitles</a></li><li><a href="/mehmed-fetihler-sultani/episode-88/">Mehmed Fetihler Sultani Episode 88 (Bolum 88) Urdu Subtitles</a></li><li><a href="/mehmed-fetihler-sultani/episode-87/">Mehmed Fetihler Sultani Episode 87 (Bolum 87) Urdu Subtitles</a></li><li><a href="/teskilat/">Teskilat Season 7 Main Hub</a></li><li><a href="/teskilat/episode-189/">Teskilat Season 7 Episode 189 (Bolum 189) Urdu Subtitles</a></li><li><a href="/teskilat/episode-188/">Teskilat Season 7 Episode 188 (Bolum 188) Urdu Subtitles - Ender Rescue</a></li><li><a href="/teskilat/episode-187/">Teskilat Season 7 Episode 187 (Bolum 187) Urdu Subtitles</a></li><li><a href="/teskilat/episode-186/">Teskilat Season 7 Episode 186 (Bolum 186) Urdu Subtitles</a></li><li><a href="/gunesin-dogdugu-yer/">Gunesin Dogdugu Yer Main Hub</a></li><li><a href="/gunesin-dogdugu-yer/episode-5/">Gunesin Dogdugu Yer Episode 5 Urdu Subtitles</a></li><li><a href="/gunesin-dogdugu-yer/episode-4/">Gunesin Dogdugu Yer Episode 4 Urdu Subtitles</a></li><li><a href="/gunesin-dogdugu-yer/episode-3/">Gunesin Dogdugu Yer Episode 3 Urdu Subtitles</a></li><li><a href="/dramas/">Turkish Drama Urdu Subtitles Directory</a></li><li><a href="/unlimited-editing/">Unlimited Video Editing Subscription</a></li><li><a href="/creators/">High-Retention Video Editing for Content Creators</a></li><li><a href="/agencies/">White-Label Video Editing Pods for Agencies</a></li><li><a href="/business/">Performance Ad Creatives for Business & Brands</a></li><li><a href="/gallery/">FEVIQO Video Portfolio & Showreel Showcase</a></li><li><a href="/pricing/">Transparent Flat-Rate Pricing Plans</a></li><li><a href="/about/">About FEVIQO Creative Agency</a></li><li><a href="/booking/">Book a Creative Strategy Call</a></li><li><a href="/trending/">FEVIQO Trending News & Analysis Hub</a></li><li><a href="/trending/h1b-visa-2026-latest-update/">H-1B Visa 2026 Latest Rules & Updates</a></li></ul></section></main></div></noscript><div style="min-height:100vh;background-color:#0B0F17;display:flex;align-items:center;justify-content:center;color:#22C55E;font-family:ui-sans-serif,system-ui,sans-serif;font-weight:800;font-size:22px;letter-spacing:3px;text-transform:uppercase;">FEVIQO</div></div>`;

  transformed = transformed.replace('<div id="root"></div>', prerenderedBody);

  return transformed;
}

import React, { useEffect } from 'react';
import { getSEOConfigForPath } from './seoStore';

interface SEOHeadProps {
  pathname: string;
  overrideConfig?: Partial<ReturnType<typeof getSEOConfigForPath>>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ pathname, overrideConfig }) => {
  const baseConfig = getSEOConfigForPath(pathname);
  const config = { ...baseConfig, ...overrideConfig };

  useEffect(() => {
    // 1. Title
    document.title = config.seoTitle;

    // 2. Helper to set/update meta tag
    const setMeta = (attrName: string, attrVal: string, contentVal: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentVal);
    };

    // 3. Remove obsolete meta keywords tag if present
    const obsoleteKeywords = document.querySelector('meta[name="keywords"]');
    if (obsoleteKeywords) {
      obsoleteKeywords.remove();
    }

    // 4. Meta directives
    setMeta('name', 'description', config.metaDescription);
    setMeta('name', 'robots', config.robots);

    // 5. OpenGraph Tags
    setMeta('property', 'og:title', config.ogTitle);
    setMeta('property', 'og:description', config.ogDescription);
    setMeta('property', 'og:url', config.canonicalUrl);
    setMeta('property', 'og:image', config.ogImage);
    setMeta('property', 'og:type', (pathname.includes('/teskilat/episode-') || pathname.includes('/gunesin-dogdugu-yer/episode-')) ? 'video.episode' : 'website');

    // 6. Twitter / X Cards
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', config.ogTitle);
    setMeta('name', 'twitter:description', config.ogDescription);
    setMeta('name', 'twitter:image', config.ogImage);

    // 7. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', config.canonicalUrl);

    // 8. JSON-LD Dynamic Schema Script
    let jsonLdScript = document.getElementById('feviqo-dynamic-jsonld');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      jsonLdScript.setAttribute('id', 'feviqo-dynamic-jsonld');
      document.head.appendChild(jsonLdScript);
    }

    // Generate JSON-LD based on Schema Type
    let schemaGraph: any[] = [
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
        "email": "partner@feviqo.com",
        "disambiguatingDescription": "FEVIQO is a digital video editing agency, creative studio, and post-production platform for creators, brands, and marketing agencies. FEVIQO is NOT an adhesive or glue product.",
        "knowsAbout": ["Video Editing", "Content Creation", "YouTube Video Editing", "TikTok Video Editing", "Post Production", "Video Marketing", "Performance Ads", "Performance Ads Video Editing", "YouTube Content Production", "unlimited video editing subscription", "flat-rate monthly video editors", "Teskilat Urdu Portal"]
      }
    ];

    if (pathname === '/' || pathname === '') {
      schemaGraph.push({
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

    if (config.schemaType === 'TVEpisode' || pathname === '/teskilat/episode-186' || pathname === '/teskilat/episode-187') {
      const is187 = pathname.includes('187');
      const num = is187 ? "187" : "186";
      const subNum = is187 ? "3" : "2";
      const date = is187 ? "2026-10-03T08:00:00+00:00" : "2026-09-28T08:00:00+00:00";
      const dur = is187 ? "PT2H25M" : "PT2H32M";
      const thumb = is187 ? "https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw" : "https://feviqo.com/images/teskialt186thumbnIL.png";
      const episodeName = `Teskilat Season 7 Episode ${subNum} Urdu Subtitles – Bolum ${num}`;
      const episodeDesc = is187 
        ? "Watch Teskilat Season 7 Episode 3 Urdu Subtitles (Bolum 187). Altay hunts Azra and risks everything to rescue Ender as new traps close in."
        : "Watch Teskilat Season 7 Episode 2 Urdu Subtitles (Bolum 186). Stream full episode with story recap on FEVIQO.com.";

      schemaGraph.push({
        "@type": "TVEpisode",
        "@id": `https://feviqo.com/teskilat/episode-${num}#episode`,
        "url": `https://feviqo.com/teskilat/episode-${num}`,
        "name": episodeName,
        "episodeNumber": num,
        "seasonNumber": "7",
        "inLanguage": "Urdu",
        "subtitleLanguage": "Urdu Subtitles",
        "description": episodeDesc,
        "image": thumb,
        "mainEntityOfPage": `https://feviqo.com/teskilat/episode-${num}`,
        "isPartOf": {
          "@type": "TVSeries",
          "name": "Teskilat",
          "url": "https://feviqo.com/teskilat"
        }
      });

      schemaGraph.push({
        "@type": "VideoObject",
        "@id": `https://feviqo.com/teskilat/episode-${num}#video`,
        "name": `Teskilat Season 7 Episode ${subNum} Urdu Subtitles - Bolum ${num}`,
        "description": is187 
          ? "Watch Teskilat Season 7 Episode 3 Urdu Subtitles (Bolum 187). Altay hunts Azra and risks everything to rescue Ender as new traps close in."
          : "Watch Teskilat Season 7 Episode 2 Urdu Subtitles (Bolum 186). Stream full episode with story recap on FEVIQO.com.",
        "thumbnailUrl": [thumb],
        "uploadDate": date,
        "contentUrl": is187 ? "https://stream.mux.com/vPkzwE9vrAHq4uz4hPyjFu4ZVQOzsORSqxYDzUnYm4o.m3u8" : "https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8",
        "embedUrl": `https://feviqo.com/teskilat/episode-${num}`,
        "duration": dur,
        "isFamilyFriendly": true,
        "mainEntityOfPage": `https://feviqo.com/teskilat/episode-${num}`,
        "publisher": {
          "@id": "https://feviqo.com/#organization"
        }
      });
    }

    if (pathname.includes('/gunesin-dogdugu-yer/episode-')) {
      const match = pathname.match(/episode-(\d+)/);
      const epNum = match ? parseInt(match[1]) : 1;
      const epName = epNum === 3 ? "Gunesin Dogdugu Yer Episode 3 Urdu Subtitles – Bolum 3" : `Gunesin Dogdugu Yer Episode ${epNum} Urdu Subtitles | FEVIQO`;
      const epDesc = epNum === 3 
        ? "Watch Gunesin Dogdugu Yer Episode 3 in HD Urdu Subtitles. Follow the intense family secrets, rivalries, and drama online with full story recaps on FEVIQO."
        : `Watch Gunesin Dogdugu Yer Episode ${epNum} in HD Urdu Subtitles. Follow the intense family betrayals and drama watch online with story recaps on FEVIQO.`;
      const date = epNum === 3 ? "2026-10-15T18:00:00+00:00" : (epNum === 1 ? "2026-10-01T18:00:00+00:00" : "2026-10-08T18:00:00+00:00");
      const thumb = "https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw";

      schemaGraph.push({
        "@type": "TVEpisode",
        "@id": `https://feviqo.com/gunesin-dogdugu-yer/episode-${epNum}#episode`,
        "url": `https://feviqo.com/gunesin-dogdugu-yer/episode-${epNum}`,
        "name": epName,
        "episodeNumber": epNum.toString(),
        "seasonNumber": "1",
        "inLanguage": "Urdu",
        "subtitleLanguage": "Urdu Subtitles",
        "description": epDesc,
        "image": thumb,
        "mainEntityOfPage": `https://feviqo.com/gunesin-dogdugu-yer/episode-${epNum}`,
        "isPartOf": {
          "@type": "TVSeries",
          "name": "Gunesin Dogdugu Yer",
          "url": "https://feviqo.com/gunesin-dogdugu-yer"
        }
      });

      schemaGraph.push({
        "@type": "VideoObject",
        "@id": `https://feviqo.com/gunesin-dogdugu-yer/episode-${epNum}#video`,
        "name": epName,
        "description": epDesc,
        "thumbnailUrl": [thumb],
        "uploadDate": date,
        "contentUrl": "https://stream.mux.com/vPkzwE9vrAHq4uz4hPyjFu4ZVQOzsORSqxYDzUnYm4o.m3u8",
        "embedUrl": `https://feviqo.com/gunesin-dogdugu-yer/episode-${epNum}`,
        "duration": "PT2H15M",
        "isFamilyFriendly": true,
        "mainEntityOfPage": `https://feviqo.com/gunesin-dogdugu-yer/episode-${epNum}`,
        "publisher": {
          "@id": "https://feviqo.com/#organization"
        }
      });
    } else if (pathname === '/gunesin-dogdugu-yer') {
      schemaGraph.push({
        "@type": "TVSeries",
        "@id": "https://feviqo.com/gunesin-dogdugu-yer#series",
        "url": "https://feviqo.com/gunesin-dogdugu-yer",
        "name": "Gunesin Dogdugu Yer",
        "description": "Watch Gunesin Dogdugu Yer Turkish drama in HD Urdu subtitles. Stream all official episodes online with complete story summaries and recaps on FEVIQO.",
        "image": "https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2",
        "containsSeason": {
          "@type": "TVSeason",
          "seasonNumber": 1,
          "name": "Season 1"
        }
      });
    }

    if (config.schemaType === 'TVSeries' && pathname === '/teskilat') {
      schemaGraph.push({
        "@type": "TVSeries",
        "@id": "https://feviqo.com/teskilat#series",
        "url": "https://feviqo.com/teskilat",
        "name": "Teskilat Season 7",
        "description": "Watch Teskilat Season 7 with Urdu Subtitles on FEVIQO.com. Explore episode guides, story recaps, and HD releases.",
        "image": "https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2",
        "containsSeason": {
          "@type": "TVSeason",
          "seasonNumber": 7,
          "name": "Season 7"
        }
      });
    } else if (config.schemaType === 'Service') {
      schemaGraph.push({
        "@type": "Service",
        "@id": `${config.canonicalUrl}#service`,
        "name": config.seoTitle,
        "serviceType": "Video Editing & Post Production",
        "provider": {
          "@id": "https://feviqo.com/#organization"
        },
        "description": config.metaDescription
      });
    }

    if (config.customJsonLd) {
      try {
        const parsed = JSON.parse(config.customJsonLd);
        schemaGraph.push(parsed);
      } catch (e) {
        // ignore invalid JSON
      }
    }

    jsonLdScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": schemaGraph
    });

  }, [pathname, config]);

  return null;
};

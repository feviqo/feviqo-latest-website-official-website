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
    setMeta('property', 'og:type', pathname.includes('/teskilat/episode-') ? 'video.episode' : 'website');

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
        "email": "partner@feviqo.com"
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
        "contentUrl": "https://feviqo.com/videos/Sequence-01.mp4",
        "embedUrl": "https://feviqo.com/",
        "duration": "PT0M45S",
        "isFamilyFriendly": true,
        "mainEntityOfPage": "https://feviqo.com/",
        "publisher": {
          "@id": "https://feviqo.com/#organization"
        }
      });
    }

    if (config.schemaType === 'TVEpisode' || pathname === '/teskilat/episode-186') {
      schemaGraph.push({
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

      schemaGraph.push({
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
    } else if (config.schemaType === 'TVSeries' || pathname === '/teskilat') {
      schemaGraph.push({
        "@type": "TVSeries",
        "@id": "https://feviqo.com/teskilat#series",
        "url": "https://feviqo.com/teskilat",
        "name": "Teskilat Season 7",
        "description": "Watch Teskilat Season 7 with Urdu Subtitles on FEVIQO. Explore episode guides, story recaps, and HD releases.",
        "image": "https://feviqo.com/images/teskialt186thumbnIL.png",
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

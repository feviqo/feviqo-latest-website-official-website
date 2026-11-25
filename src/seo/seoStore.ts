import { BRAND_SYSTEM, GLOBAL_KEYWORD_TAXONOMY } from './taxonomy';

export interface PageSEOConfig {
  path: string;
  pageName: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robots: string; // 'index, follow' | 'noindex, nofollow'
  schemaType: 'WebSite' | 'Organization' | 'Service' | 'TVEpisode' | 'TVSeries' | 'BreadcrumbList' | 'VideoObject' | 'Article';
  customJsonLd?: string;
}

export const DEFAULT_PAGE_SEO: Record<string, PageSEOConfig> = {
  '/': {
    path: '/',
    pageName: 'Home Page',
    seoTitle: 'FEVIQO | Unlimited Video Editing & Performance Creative Studio',
    metaDescription: 'FEVIQO provides dedicated video editing, short-form content, and performance ad creative production for brands, creators, and agencies.',
    focusKeyword: 'FEVIQO video editing agency',
    secondaryKeywords: [
      'unlimited video editing services',
      'video editing subscription',
      'hire a dedicated video editor',
      'video post production agency',
      'professional video editing services',
      'content creator video editor',
      'direct response video ads',
      'video editors for hire',
      'Performance Ads Video Editing',
      'YouTube Content Production',
      'unlimited video editing subscription',
      'flat-rate monthly video editors',
      'dedicated creative editing pods',
      'e-commerce video ad creators',
      'TikTok virality video editors',
      'talking head podcast video editor',
      'Performance creative video editing'
    ],
    canonicalUrl: 'https://feviqo.com/',
    ogTitle: 'FEVIQO — Unlimited Video Editing, Performance Ads & YouTube Content Production',
    ogDescription: 'Produce high-converting TikTok, YouTube, and performance ad creatives at scale with dedicated flat-rate monthly video editors.',
    ogImage: 'https://feviqo.com/HEADER-removebg-preview.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'WebSite'
  },
  '/unlimited-editing': {
    path: '/unlimited-editing',
    pageName: 'Unlimited Video Editing',
    seoTitle: 'Unlimited Video Editing Service | Dedicated Senior Editors | FEVIQO',
    metaDescription: 'Get dedicated senior video editors, flat-rate monthly pricing, 4K rendering, and 24–48 hour turnaround with FEVIQO unlimited video editing.',
    focusKeyword: 'unlimited video editing service',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.SUBSCRIPTION.concat(GLOBAL_KEYWORD_TAXONOMY.SPEED_SCALE),
    canonicalUrl: 'https://feviqo.com/unlimited-editing',
    ogTitle: 'Unlimited Video Editing Subscription — FEVIQO Studio',
    ogDescription: 'Scale your video content without hiring headaches. Flat monthly rate, unlimited revisions, 24-48h turnaround.',
    ogImage: 'https://feviqo.com/HEADER-removebg-preview.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Service'
  },
  '/creators': {
    path: '/creators',
    pageName: 'Content Creators',
    seoTitle: 'High-Retention Video Editing for YouTubers & Streamers | FEVIQO',
    metaDescription: 'Scale your YouTube channel, TikTok, and Reels with high-retention video editing designed to maximize watch time and subscriber engagement.',
    focusKeyword: 'YouTube video editing',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.SHORT_FORM.concat(GLOBAL_KEYWORD_TAXONOMY.YOUTUBE),
    canonicalUrl: 'https://feviqo.com/creators',
    ogTitle: 'High-Retention Video Editing for Creators — FEVIQO',
    ogDescription: 'Professional editing for YouTubers, streamers, and short-form creators. Boost watch time and engagement.',
    ogImage: 'https://feviqo.com/HEADER-removebg-preview.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Service'
  },
  '/agencies': {
    path: '/agencies',
    pageName: 'Marketers & Agencies',
    seoTitle: 'White-Label Video Editing Pods for Marketing Agencies | FEVIQO',
    metaDescription: 'Scale your marketing agency retainer capacity with white-label video editing pods and dedicated editors.',
    focusKeyword: 'white label video editing',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.WHITE_LABEL_AGENCY.concat(GLOBAL_KEYWORD_TAXONOMY.BUSINESS_INDUSTRY),
    canonicalUrl: 'https://feviqo.com/agencies',
    ogTitle: 'White-Label Video Editing Pods for Agencies — FEVIQO',
    ogDescription: 'White-label video editing team scaling agency retainer capacity with 24–48h turnarounds.',
    ogImage: 'https://feviqo.com/HEADER-removebg-preview.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Service'
  },
  '/business': {
    path: '/business',
    pageName: 'Business & Brands',
    seoTitle: 'Performance Ad Creatives & Founder Content Suite | FEVIQO',
    metaDescription: 'Turn 1 founder recording into a multi-channel video suite and direct-response performance ads for TikTok, Meta, and YouTube.',
    focusKeyword: 'performance ad creative',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.PERFORMANCE_CREATIVE.concat(GLOBAL_KEYWORD_TAXONOMY.PAID_SOCIAL),
    canonicalUrl: 'https://feviqo.com/business',
    ogTitle: 'Performance Ad Creatives for Brands — FEVIQO',
    ogDescription: 'Direct-response video ads for TikTok, Meta, and YouTube with hook variations designed for high ROAS.',
    ogImage: 'https://feviqo.com/HEADER-removebg-preview.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Service'
  },
  '/gallery': {
    path: '/gallery',
    pageName: 'Work Showcase',
    seoTitle: 'Video Editing Portfolio & Performance Showreel | FEVIQO',
    metaDescription: 'Explore FEVIQO video editing portfolio featuring creator hooks, luxury estate walkthroughs, performance ads, and motion design.',
    focusKeyword: 'video editing portfolio',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.VIDEO_EDITING.concat(GLOBAL_KEYWORD_TAXONOMY.MOTION_EXPLAINER),
    canonicalUrl: 'https://feviqo.com/gallery',
    ogTitle: 'Video Editing Portfolio & Work Showcase — FEVIQO',
    ogDescription: 'Watch our showreel featuring direct response ad creatives, creator shorts, and motion design.',
    ogImage: 'https://feviqo.com/HEADER-removebg-preview.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Service'
  },
  '/teskilat': {
    path: '/teskilat',
    pageName: 'Teskilat Season 7 Episode Guide',
    seoTitle: 'Teşkilat Season 7 Episode Guide, Story Summary & Cast | FEVIQO',
    metaDescription: 'Explore Teşkilat Season 7 on FEVIQO with original episode guides, story summaries, cast profiles, release schedules, and viewer reviews.',
    focusKeyword: 'Teşkilat Season 7 episode guide',
    secondaryKeywords: [
      'Teşkilat Season 7',
      'Teskilat episode guide',
      'Teskilat story summary',
      'Turkish drama cast and reviews',
      'Altay Yalçın series guide'
    ],
    canonicalUrl: 'https://feviqo.com/teskilat',
    ogTitle: 'Teşkilat Season 7 Episode Guide, Story Summary & Cast | FEVIQO',
    ogDescription: 'Explore Teşkilat Season 7 on FEVIQO with original episode guides, story summaries, cast profiles, and reviews.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-186': {
    path: '/teskilat/episode-186',
    pageName: 'Teskilat Episode 186 Guide',
    seoTitle: 'Teşkilat Season 7 Episode 186 – Story Summary, Cast & Review | FEVIQO',
    metaDescription: 'Read the complete Teşkilat Season 7 Episode 186 (Bolum 186) story summary, key plot twists, cast highlights, and editorial review on FEVIQO.',
    focusKeyword: 'teskilat episode 186 story summary',
    secondaryKeywords: ['teskilat season 7 episode 186', 'teskilat episode 186 guide', 'teskilat bolum 186 review', 'teskilat cast and reviews'],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-186',
    ogTitle: 'Teşkilat Season 7 Episode 186 – Story Summary, Cast & Review | FEVIQO',
    ogDescription: 'Read the complete Teşkilat Season 7 Episode 186 (Bolum 186) story summary, key plot twists, cast highlights, and editorial review on FEVIQO.',
    ogImage: 'https://feviqo.com/images/teskialt186thumbnIL.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-187': {
    path: '/teskilat/episode-187',
    pageName: 'Teskilat Episode 187 Guide',
    seoTitle: 'Teşkilat Season 7 Episode 187 – Episode Guide & Story Summary | FEVIQO',
    metaDescription: 'Read our Teşkilat Season 7 Episode 187 (Bolum 187) episode guide, story summary, cast breakdown, and trailer review notes on FEVIQO.',
    focusKeyword: 'Teşkilat episode 187 episode guide',
    secondaryKeywords: [
      'Teskilat episode 187',
      'Teşkilat Bolum 187',
      'Teskilat Season 7 Episode 3',
      'Altay Azra Ender episode 187',
      'Turkish drama episode guide'
    ],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-187',
    ogTitle: 'Teşkilat Season 7 Episode 187 – Episode Guide & Story Summary | FEVIQO',
    ogDescription: 'Read our Teşkilat Season 7 Episode 187 (Bolum 187) episode guide, story summary, and cast breakdown on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/gunesin-dogdugu-yer': {
    path: '/gunesin-dogdugu-yer',
    pageName: 'Gunesin Dogdugu Yer Episode Guide',
    seoTitle: 'Güneşin Doğduğu Yer Episode Guide, Story Summary & Cast | FEVIQO',
    metaDescription: 'Explore Güneşin Doğduğu Yer on FEVIQO with complete episode guides, story summaries, cast profiles, release dates, and editorial reviews.',
    focusKeyword: 'gunesin dogdugu yer episode guide',
    secondaryKeywords: ['gunesin dogdugu yer', 'gunesin dogdugu yer story summary', 'gunesin dogdugu yer cast', 'turkish drama reviews'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer',
    ogTitle: 'Güneşin Doğduğu Yer Episode Guide, Story Summary & Cast | FEVIQO',
    ogDescription: 'Explore Güneşin Doğduğu Yer on FEVIQO with complete episode guides, story summaries, cast profiles, and reviews.',
    ogImage: 'https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/gunesin-dogdugu-yer/episode-3': {
    path: '/gunesin-dogdugu-yer/episode-3',
    pageName: 'Gunesin Dogdugu Yer Episode 3 Guide',
    seoTitle: 'Güneşin Doğduğu Yer Episode 3 – Story Summary & Cast Review | FEVIQO',
    metaDescription: 'Read the Güneşin Doğduğu Yer Episode 3 story summary, character notes, release details, and viewer discussion on FEVIQO.',
    focusKeyword: 'gunesin dogdugu yer episode 3 summary',
    secondaryKeywords: ['gunesin dogdugu yer episode 3', 'gunesin dogdugu yer bolum 3 guide', 'turkish drama story summary'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-3',
    ogTitle: 'Güneşin Doğduğu Yer Episode 3 – Story Summary & Cast Review | FEVIQO',
    ogDescription: 'Read the Güneşin Doğduğu Yer Episode 3 story summary, character notes, and viewer discussion on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1VsQl3XReqSBLh5sk5UbalpsaVoSs0ggj',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/gunesin-dogdugu-yer/episode-4': {
    path: '/gunesin-dogdugu-yer/episode-4',
    pageName: 'Gunesin Dogdugu Yer Episode 4 Guide',
    seoTitle: 'Güneşin Doğduğu Yer Episode 4 – Episode Guide & Story Summary | FEVIQO',
    metaDescription: 'Read the Güneşin Doğduğu Yer Episode 4 (Bolum 4) episode guide, plot recap, cast analysis, and trailer review notes on FEVIQO.',
    focusKeyword: 'Gunesin Dogdugu Yer Episode 4 guide',
    secondaryKeywords: ['Gunesin Dogdugu Yer Episode 4', 'Gunesin Dogdugu Yer Bolum 4 summary', 'Turkish drama cast and reviews', 'FEVIQO episode guide'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-4',
    ogTitle: 'Güneşin Doğduğu Yer Episode 4 – Episode Guide & Story Summary | FEVIQO',
    ogDescription: 'Read the Güneşin Doğduğu Yer Episode 4 (Bolum 4) episode guide, plot recap, and cast analysis on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1KaS-64iPUBSZ2gtZ3B2tj3bwmAUFa6gV',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/gunesin-dogdugu-yer/episode-7': {
    path: '/gunesin-dogdugu-yer/episode-7',
    pageName: 'Gunesin Dogdugu Yer Episode 7 Guide',
    seoTitle: 'Güneşin Doğduğu Yer Episode 7 – Episode Guide & Story Summary | FEVIQO',
    metaDescription: 'Explore our Güneşin Doğduğu Yer Episode 7 (Bolum 7) story summary, cast highlights, trailer review notes, and fan discussion on FEVIQO.',
    focusKeyword: 'Gunesin Dogdugu Yer Episode 7 summary',
    secondaryKeywords: ['Gunesin Dogdugu Yer Episode 7', 'Gunesin Dogdugu Yer Bolum 7 guide', 'Turkish drama reviews', 'FEVIQO'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-7',
    ogTitle: 'Güneşin Doğduğu Yer Episode 7 – Episode Guide & Story Summary | FEVIQO',
    ogDescription: 'Explore our Güneşin Doğduğu Yer Episode 7 (Bolum 7) story summary, cast highlights, and fan discussion on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/137w7jkmYW4bpn4rfdipcJ4gJksnpqeL4',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/gunesin-dogdugu-yer/episode-5': {
    path: '/gunesin-dogdugu-yer/episode-5',
    pageName: 'Gunesin Dogdugu Yer Episode 5 Guide',
    seoTitle: 'Güneşin Doğduğu Yer Episode 5 – Episode Guide & Story Summary | FEVIQO',
    metaDescription: 'Read our Güneşin Doğduğu Yer Episode 5 (Bolum 5) episode guide, story summary, cast notes, and editorial commentary on FEVIQO.',
    focusKeyword: 'Gunesin Dogdugu Yer Episode 5 summary',
    secondaryKeywords: ['Gunesin Dogdugu Yer Episode 5', 'Gunesin Dogdugu Yer Bolum 5 guide', 'Turkish drama episode guide', 'FEVIQO'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-5',
    ogTitle: 'Güneşin Doğduğu Yer Episode 5 – Episode Guide & Story Summary | FEVIQO',
    ogDescription: 'Read our Güneşin Doğduğu Yer Episode 5 (Bolum 5) episode guide, story summary, and editorial commentary on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1ww1YXzsV-PBId4z9g6oPZSYHVXiDOiPO',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/gunesin-dogdugu-yer/episode-9': {
    path: '/gunesin-dogdugu-yer/episode-9',
    pageName: 'Gunesin Dogdugu Yer Episode 9 Guide',
    seoTitle: 'Güneşin Doğduğu Yer Episode 9 – Episode Guide & Review | FEVIQO',
    metaDescription: 'Read the Güneşin Doğduğu Yer Episode 9 (Bolum 9) story summary, cast breakdown, release date, and trailer review notes on FEVIQO.',
    focusKeyword: 'Gunesin Dogdugu Yer Episode 9 guide',
    secondaryKeywords: ['Gunesin Dogdugu Yer Episode 9', 'Gunesin Dogdugu Yer Bolum 9 summary', 'FEVIQO episode guide'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-9',
    ogTitle: 'Güneşin Doğduğu Yer Episode 9 – Episode Guide & Review | FEVIQO',
    ogDescription: 'Read the Güneşin Doğduğu Yer Episode 9 (Bolum 9) story summary, cast breakdown, and trailer review notes on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1UikNqWzQcGxbQx8sSqgjaTDN47iGhxgd',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/yeralti': {
    path: '/yeralti',
    pageName: 'Yeralti Episode Guide Hub',
    seoTitle: 'Yeraltı (جرائم کی دنیا) – Episode Guide, Story Summary & Cast | FEVIQO',
    metaDescription: 'Explore Yeraltı Turkish crime drama on FEVIQO with original episode guides, character profiles, release schedules, and trailer reviews.',
    focusKeyword: 'yeralti episode guide',
    secondaryKeywords: ['yeralti turkish drama', 'yeralti story summary', 'yeralti cast and reviews', 'feviqo yeralti'],
    canonicalUrl: 'https://feviqo.com/yeralti',
    ogTitle: 'Yeraltı – Episode Guide, Story Summary & Cast | FEVIQO',
    ogDescription: 'Explore Yeraltı Turkish crime drama on FEVIQO with original episode guides, character profiles, and reviews.',
    ogImage: 'https://lh3.googleusercontent.com/d/1hU7IkIPWRZ0uSuDhU_azx-TXyEbzxvqQ',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/yeralti/episode-23': {
    path: '/yeralti/episode-23',
    pageName: 'Yeralti Episode 23 Guide',
    seoTitle: 'Yeraltı Episode 23 – Story Summary, Cast & Review | FEVIQO',
    metaDescription: 'Read the Yeraltı Episode 23 story summary, character breakdown, release details, trailer review notes, and reader discussion on FEVIQO.',
    focusKeyword: 'yeralti episode 23 summary',
    secondaryKeywords: ['yeralti episode 23', 'yeralti episode guide', 'yeralti cast and reviews', 'feviqo yeralti'],
    canonicalUrl: 'https://feviqo.com/yeralti/episode-23',
    ogTitle: 'Yeraltı Episode 23 – Story Summary, Cast & Review | FEVIQO',
    ogDescription: 'Read the Yeraltı Episode 23 story summary, character breakdown, and trailer review notes on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1hU7IkIPWRZ0uSuDhU_azx-TXyEbzxvqQ',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-194': {
    path: '/teskilat/episode-194',
    pageName: 'Teskilat Episode 194 Guide',
    seoTitle: 'Teşkilat Season 7 Episode 194 – Episode Guide & Story Summary | FEVIQO',
    metaDescription: 'Read the Teşkilat Season 7 Episode 194 (Bolum 194) plot summary, cast spotlight, trailer analysis, and viewer reviews on FEVIQO.',
    focusKeyword: 'Teskilat Episode 194 story summary',
    secondaryKeywords: ['Teskilat 194 summary', 'Teskilat Bolum 194 guide', 'Teskilat Season 7 Episode 194'],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-194',
    ogTitle: 'Teşkilat Season 7 Episode 194 – Episode Guide & Story Summary | FEVIQO',
    ogDescription: 'Read the Teşkilat Season 7 Episode 194 (Bolum 194) plot summary, cast spotlight, and trailer analysis on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1pD9jhie8NMZRQzxPCb3LyDGkhEE5xFdY',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-193': {
    path: '/teskilat/episode-193',
    pageName: 'Teskilat Episode 193 Guide',
    seoTitle: 'Teşkilat Season 7 Episode 193 – Episode Guide & Story Summary | FEVIQO',
    metaDescription: 'Explore Teşkilat Season 7 Episode 193 (Bolum 193) story summary, character developments, release date, and editorial review on FEVIQO.',
    focusKeyword: 'Teskilat Episode 193 episode guide',
    secondaryKeywords: ['Teskilat 193 summary', 'Teskilat Bolum 193 guide', 'Teskilat Season 7 Episode 193'],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-193',
    ogTitle: 'Teşkilat Season 7 Episode 193 – Episode Guide & Story Summary | FEVIQO',
    ogDescription: 'Explore Teşkilat Season 7 Episode 193 (Bolum 193) story summary, character developments, and editorial review on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1pDs3oj0h6eOP64xO10eYp6TMqcGs2AqP',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-192': {
    path: '/teskilat/episode-192',
    pageName: 'Teskilat Episode 192 Guide',
    seoTitle: 'Teşkilat Season 7 Episode 192 – Episode Guide & Story Summary | FEVIQO',
    metaDescription: 'Read the Teşkilat Season 7 Episode 192 (Bolum 192) plot summary, cast highlights, trailer review notes, and fan discussion on FEVIQO.',
    focusKeyword: 'Teskilat Episode 192 story summary',
    secondaryKeywords: ['Teskilat 192 summary', 'Teskilat Bolum 192 guide', 'Teskilat Season 7 Episode 192'],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-192',
    ogTitle: 'Teşkilat Season 7 Episode 192 – Episode Guide & Story Summary | FEVIQO',
    ogDescription: 'Read the Teşkilat Season 7 Episode 192 (Bolum 192) plot summary, cast highlights, and fan discussion on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-189': {
    path: '/teskilat/episode-189',
    pageName: 'Teskilat Episode 189 Guide',
    seoTitle: 'Teşkilat Season 7 Episode 189 – Story Summary, Cast & Review | FEVIQO',
    metaDescription: 'Read the Teşkilat Episode 189 (Bolum 189) story summary, cast breakdown, release notes, and critic review. Framed for treason, Altay Yalçın races to uncover the conspiracy.',
    focusKeyword: 'Teskilat 189 story summary',
    secondaryKeywords: ['Teskilat Episode 189 guide', 'Teskilat Bolum 189 summary', 'Altay Yalcin Kurt Bey', 'Teskilat Season 7 reviews'],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-189',
    ogTitle: 'Teşkilat Season 7 Episode 189 – Story Summary, Cast & Review | FEVIQO',
    ogDescription: 'Read the Teşkilat Episode 189 (Bolum 189) story summary, cast breakdown, release notes, and critic review on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/15lsrpRxnIw6C491oFLSXMXCC50o2ByfC',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-188': {
    path: '/teskilat/episode-188',
    pageName: 'Teskilat Episode 188 Guide',
    seoTitle: 'Teşkilat Season 7 Episode 188 – Episode Guide & Story Summary | FEVIQO',
    metaDescription: 'Read the Teşkilat Season 7 Episode 188 (Bolum 188) story summary and editorial review. Altay closes in on Ender as suspicion around Azra grows.',
    focusKeyword: 'Teskilat Episode 188 episode guide',
    secondaryKeywords: ['Teskilat Season 7', 'Teskilat Episode 188 summary', 'Teskilat Bolum 188 review', 'Altay Ender Episode 188', 'Turkish drama cast and reviews'],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-188',
    ogTitle: 'Teşkilat Season 7 Episode 188 – Episode Guide & Story Summary | FEVIQO',
    ogDescription: 'Read the Teşkilat Season 7 Episode 188 (Bolum 188) story summary and editorial review on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1FXGXBZcts9bp3XdPmqI_pGytI0GAKYDc',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/mehmed-fetihler-sultani/episode-90': {
    path: '/mehmed-fetihler-sultani/episode-90',
    pageName: 'Mehmed Fetihler Sultani Episode 90 Guide',
    seoTitle: 'Mehmed: Fetihler Sultanı Episode 90 – Story Summary & Cast Review | FEVIQO',
    metaDescription: 'Read our Mehmed: Fetihler Sultanı Season 4 Episode 90 (Bolum 90) episode guide, historical story summary, cast spotlight, and trailer review notes on FEVIQO.',
    focusKeyword: 'Mehmed Episode 90 story summary',
    secondaryKeywords: ['Mehmed Season 4 Episode 90', 'Mehmed Fetihler Sultani Bolum 90 guide', 'Sultan Mehmed historical review', 'FEVIQO episode guide'],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani/episode-90',
    ogTitle: 'Mehmed: Fetihler Sultanı Episode 90 – Story Summary & Cast Review | FEVIQO',
    ogDescription: 'Read our Mehmed: Fetihler Sultanı Season 4 Episode 90 (Bolum 90) episode guide, story summary, and cast review on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Ql7rSRtgL6HfxOyO-BSfPN8CdfUooJ1p',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/mehmed-fetihler-sultani/episode-89': {
    path: '/mehmed-fetihler-sultani/episode-89',
    pageName: 'Mehmed Fetihler Sultani Episode 89 Guide',
    seoTitle: 'Mehmed: Fetihler Sultanı Episode 89 – Story Summary & Cast Review | FEVIQO',
    metaDescription: 'Read our Mehmed: Fetihler Sultanı Season 4 Episode 89 (Bolum 89) episode guide, historical plot recap, cast analysis, and review on FEVIQO.',
    focusKeyword: 'Mehmed Episode 89 story summary',
    secondaryKeywords: ['Mehmed Season 4 Episode 89', 'Mehmed Fetihler Sultani Bolum 89 guide', 'Turkish historical drama reviews', 'FEVIQO'],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani/episode-89',
    ogTitle: 'Mehmed: Fetihler Sultanı Episode 89 – Story Summary & Cast Review | FEVIQO',
    ogDescription: 'Read our Mehmed: Fetihler Sultanı Season 4 Episode 89 (Bolum 89) episode guide, historical plot recap, and review on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/15DClk9e82Zvbxbjx4_wOMcSa298IFcR5',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/mehmed-fetihler-sultani/episode-88': {
    path: '/mehmed-fetihler-sultani/episode-88',
    pageName: 'Mehmed Fetihler Sultani Episode 88 Guide',
    seoTitle: 'Mehmed: Fetihler Sultanı Episode 88 – Episode Guide & Story Summary | FEVIQO',
    metaDescription: 'Read the Mehmed: Fetihler Sultanı Season 4 Episode 88 (Bolum 88) story summary, cast notes, release schedule, and viewer reviews on FEVIQO.',
    focusKeyword: 'Mehmed Episode 88 episode guide',
    secondaryKeywords: ['Mehmed Season 4 Episode 88', 'Mehmed Fetihler Sultani Bolum 88 summary', 'Ottoman historical drama guide', 'FEVIQO'],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani/episode-88',
    ogTitle: 'Mehmed: Fetihler Sultanı Episode 88 – Episode Guide & Story Summary | FEVIQO',
    ogDescription: 'Read the Mehmed: Fetihler Sultanı Season 4 Episode 88 (Bolum 88) story summary, cast notes, and viewer reviews on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1w3UK-ZWuESJb-S4r-J_ChUTknl-yaWSq',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/mehmed-fetihler-sultani': {
    path: '/mehmed-fetihler-sultani',
    pageName: 'Mehmed Fetihler Sultani Episode Guide Hub',
    seoTitle: 'Mehmed: Fetihler Sultanı Season 4 – Episode Guide, Cast & Reviews | FEVIQO',
    metaDescription: 'Explore Mehmed: Fetihler Sultanı Season 4 on FEVIQO with episode guides, historical story summaries, cast profiles, and viewer reviews.',
    focusKeyword: 'Mehmed Fetihler Sultani episode guide',
    secondaryKeywords: [
      'Mehmed Fetihler Sultani Season 4',
      'Mehmed story summary',
      'Sultan Mehmed cast and reviews',
      'Mehmed Season 4 episode guide',
      'Ottoman historical drama'
    ],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani',
    ogTitle: 'Mehmed: Fetihler Sultanı Season 4 – Episode Guide, Cast & Reviews | FEVIQO',
    ogDescription: 'Explore Mehmed: Fetihler Sultanı Season 4 on FEVIQO with episode guides, historical story summaries, and cast reviews.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Je_-r1ngLfH15ryeju3suvZC2W0YSTL1',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/mehmed-fetihler-sultani/episode-87': {
    path: '/mehmed-fetihler-sultani/episode-87',
    pageName: 'Mehmed Episode 87 Guide',
    seoTitle: 'Mehmed: Fetihler Sultanı Episode 87 – Story Summary & Cast Review | FEVIQO',
    metaDescription: 'Read the Mehmed: Fetihler Sultanı Episode 87 (Bolum 87) story summary, character breakdown, and review. Saruca is ambushed as Gedik Ahmed Pasha faces danger in Tabriz.',
    focusKeyword: 'Mehmed Episode 87 story summary',
    secondaryKeywords: ['Mehmed Fetihler Sultani Episode 87', 'Mehmed Bolum 87 guide', 'Sultan Mehmed II drama review', 'Ottoman History Drama'],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani/episode-87',
    ogTitle: 'Mehmed: Fetihler Sultanı Episode 87 – Story Summary & Cast Review | FEVIQO',
    ogDescription: 'Read the Mehmed: Fetihler Sultanı Episode 87 (Bolum 87) story summary, character breakdown, and editorial review on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/dramas': {
    path: '/dramas',
    pageName: 'Turkish Drama Episode Guides Directory',
    seoTitle: 'Turkish Drama Episode Guides, Story Summaries & Cast Reviews | FEVIQO',
    metaDescription: 'Browse original Turkish drama episode guides, story summaries, cast details, release schedules, and viewer reviews for Teşkilat, Mehmed: Fetihler Sultanı, Güneşin Doğduğu Yer, and Yeraltı.',
    focusKeyword: 'turkish drama episode guides',
    secondaryKeywords: ['turkish drama reviews', 'episode guides', 'story summaries', 'cast and characters', 'teskilat guide', 'mehmed fetihler sultani guide'],
    canonicalUrl: 'https://feviqo.com/dramas',
    ogTitle: 'Turkish Drama Episode Guides, Story Summaries & Cast Reviews | FEVIQO',
    ogDescription: 'Browse original Turkish drama episode guides, story summaries, cast details, and viewer reviews on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/membership': {
    path: '/membership',
    pageName: 'FEVIQO Reader Membership',
    seoTitle: 'FEVIQO Membership Plans – Editorial Guides & Community | FEVIQO',
    metaDescription: 'Explore FEVIQO reader membership plans, community features, and studio updates on feviqo.com.',
    focusKeyword: 'FEVIQO Membership',
    secondaryKeywords: ['FEVIQO membership plans', 'Turkish drama community', 'FEVIQO editorial portal'],
    canonicalUrl: 'https://feviqo.com/membership',
    ogTitle: 'FEVIQO Membership Plans – Editorial Guides & Community',
    ogDescription: 'Explore FEVIQO reader membership plans, community features, and studio updates on feviqo.com.',
    ogImage: 'https://feviqo.com/images/MEHMED.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Service'
  },
  '/account': {
    path: '/account',
    pageName: 'FEVIQO Member Account',
    seoTitle: 'My Account | FEVIQO',
    metaDescription: 'Manage your FEVIQO account settings, saved preferences, and membership history.',
    focusKeyword: 'FEVIQO My Account',
    secondaryKeywords: ['FEVIQO account', 'membership status'],
    canonicalUrl: 'https://feviqo.com/account',
    ogTitle: 'My Account — FEVIQO',
    ogDescription: 'Manage your FEVIQO account settings and membership profile.',
    ogImage: 'https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2',
    robots: 'noindex, nofollow',
    schemaType: 'WebSite'
  },
  '/pricing': {
    path: '/pricing',
    pageName: 'Pricing',
    seoTitle: 'Transparent Flat-Rate Pricing | FEVIQO Unlimited Video Editing',
    metaDescription: 'Transparent pricing for flat-rate unlimited video editing, performance ad packages, and agency pods with no hidden fees.',
    focusKeyword: 'unlimited video editing pricing',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.SUBSCRIPTION.concat(GLOBAL_KEYWORD_TAXONOMY.COMMERCIAL_INTENT),
    canonicalUrl: 'https://feviqo.com/pricing',
    ogTitle: 'FEVIQO Pricing — Unlimited Video Editing & Performance Ads',
    ogDescription: 'Flat monthly rates for unlimited video editing. Dedicated editor, 24-48h turnaround, zero risk.',
    ogImage: 'https://feviqo.com/HEADER-removebg-preview.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Service'
  },
  '/about': {
    path: '/about',
    pageName: 'About Us',
    seoTitle: 'About FEVIQO Studio | Performance Creative & Video Editing Studio',
    metaDescription: 'Learn about FEVIQO performance creative studio, our global team of senior editors, and our mission to help brands and creators produce video at scale.',
    focusKeyword: 'FEVIQO studio',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.BRAND,
    canonicalUrl: 'https://feviqo.com/about',
    ogTitle: 'About FEVIQO Studio — Performance Creative Studio',
    ogDescription: 'Built for what’s next. FEVIQO powers video content creation for global brands, creators, and marketing agencies.',
    ogImage: 'https://feviqo.com/HEADER-removebg-preview.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Organization'
  },
  '/booking': {
    path: '/booking',
    pageName: 'Booking Call',
    seoTitle: 'Book a Creative Strategy Call | FEVIQO Studio',
    metaDescription: 'Book a 15-minute creative strategy call with FEVIQO to discuss your video editing workflow, brand goals, or agency pod requirements.',
    focusKeyword: 'book video editing strategy call',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.COMMERCIAL_INTENT,
    canonicalUrl: 'https://feviqo.com/booking',
    ogTitle: 'Book a Strategy Call — FEVIQO Studio',
    ogDescription: 'Discuss your video editing needs with our creative director.',
    ogImage: 'https://feviqo.com/HEADER-removebg-preview.png',
    robots: 'index, follow',
    schemaType: 'Service'
  },
  '/case-studies': {
    path: '/case-studies',
    pageName: 'Case Studies',
    seoTitle: 'Video Editing Case Studies & Brand Results | FEVIQO Studio',
    metaDescription: 'Read how brands, YouTubers, and marketing agencies scaled revenue, watch time, and ROAS with FEVIQO video editing pods.',
    focusKeyword: 'video editing case studies',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.COMMERCIAL_INTENT,
    canonicalUrl: 'https://feviqo.com/case-studies',
    ogTitle: 'FEVIQO Case Studies — Client Growth & Results',
    ogDescription: 'Real results from brands and creators using FEVIQO flat-rate video editing services.',
    ogImage: 'https://feviqo.com/HEADER-removebg-preview.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Service'
  },
  '/testimonials': {
    path: '/testimonials',
    pageName: 'Testimonials',
    seoTitle: 'Client Reviews & Creator Testimonials | FEVIQO Studio',
    metaDescription: 'Read verified reviews and testimonials from top YouTubers, agency owners, and e-commerce founders using FEVIQO.',
    focusKeyword: 'FEVIQO video editing reviews',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.BRAND,
    canonicalUrl: 'https://feviqo.com/testimonials',
    ogTitle: 'FEVIQO Reviews & Creator Testimonials',
    ogDescription: 'What creators and founders say about FEVIQO unlimited video editing services.',
    ogImage: 'https://feviqo.com/HEADER-removebg-preview.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Service'
  },

  '/turkish-drama': {
    path: '/turkish-drama',
    pageName: 'Turkish Drama Licensing',
    seoTitle: 'Turkish Drama Licensing & Urdu Subtitle Partnerships | FEVIQO',
    metaDescription: 'Explore Turkish drama content licensing, Urdu subtitle production, and distribution partnerships with FEVIQO.',
    focusKeyword: 'Turkish drama licensing',
    secondaryKeywords: ['Turkish drama distribution', 'Urdu subtitle production', 'Turkish series licensing'],
    canonicalUrl: 'https://feviqo.com/turkish-drama',
    ogTitle: 'Turkish Drama Licensing & Urdu Subtitle Partnerships — FEVIQO',
    ogDescription: 'Turkish drama content licensing, Urdu subtitle production, and distribution partnerships.',
    ogImage: 'https://feviqo.com/HEADER-removebg-preview.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Service'
  },
  '/privacy-policy': {
    path: '/privacy-policy',
    pageName: 'Privacy Policy',
    seoTitle: 'Privacy Policy & Cookie Disclosure | FEVIQO',
    metaDescription: 'Read how FEVIQO handles personal information, cookies, web beacons, third-party advertising partners such as Monetag, and opt-out controls.',
    focusKeyword: 'FEVIQO privacy policy',
    secondaryKeywords: ['privacy policy', 'Monetag advertising cookies', 'opt-out', 'data protection'],
    canonicalUrl: 'https://feviqo.com/privacy-policy',
    ogTitle: 'Privacy Policy & Advertising Disclosure — FEVIQO',
    ogDescription: 'Learn how FEVIQO protects user privacy and discloses third-party advertising cookies including Monetag.',
    ogImage: 'https://feviqo.com/feviqo1.png',
    robots: 'index, follow',
    schemaType: 'WebSite'
  },
  '/privacy': {
    path: '/privacy',
    pageName: 'Privacy Policy',
    seoTitle: 'Privacy Policy & Cookie Disclosure | FEVIQO',
    metaDescription: 'Read how FEVIQO handles personal information, website data, cookies, third-party advertising partners like Monetag, and privacy requests.',
    focusKeyword: 'FEVIQO privacy policy',
    secondaryKeywords: ['privacy', 'data protection', 'cookies', 'Monetag'],
    canonicalUrl: 'https://feviqo.com/privacy-policy',
    ogTitle: 'Privacy Policy — FEVIQO',
    ogDescription: 'Information about FEVIQO privacy practices, cookies, and advertising disclosures.',
    ogImage: 'https://feviqo.com/feviqo1.png',
    robots: 'index, follow',
    schemaType: 'WebSite'
  },
  '/terms': {
    path: '/terms',
    pageName: 'Terms of Use',
    seoTitle: 'Terms of Use | FEVIQO',
    metaDescription: 'Read the Terms of Use governing access to FEVIQO editorial guides, creative services, and website.',
    focusKeyword: 'FEVIQO terms of use',
    secondaryKeywords: ['terms of use', 'service terms', 'editorial disclaimer'],
    canonicalUrl: 'https://feviqo.com/terms',
    ogTitle: 'Terms of Use — FEVIQO',
    ogDescription: 'Terms governing use of FEVIQO editorial content, services, and website.',
    ogImage: 'https://feviqo.com/feviqo1.png',
    robots: 'index, follow',
    schemaType: 'WebSite'
  },
  '/dmca': {
    path: '/dmca',
    pageName: 'DMCA & Copyright Policy',
    seoTitle: 'DMCA & Copyright Policy | FEVIQO',
    metaDescription: 'FEVIQO is an independent Turkish drama news, episode guide, and review portal. Read our DMCA copyright compliance and takedown policy.',
    focusKeyword: 'FEVIQO DMCA policy',
    secondaryKeywords: ['DMCA', 'copyright policy', 'takedown notice', 'fair use review portal'],
    canonicalUrl: 'https://feviqo.com/dmca',
    ogTitle: 'DMCA & Copyright Policy — FEVIQO',
    ogDescription: 'Copyright compliance, fair-use editorial notice, and DMCA takedown request instructions for FEVIQO.',
    ogImage: 'https://feviqo.com/feviqo1.png',
    robots: 'index, follow',
    schemaType: 'WebSite'
  },
  '/contact': {
    path: '/contact',
    pageName: 'Contact Us',
    seoTitle: 'Contact Us | FEVIQO',
    metaDescription: 'Contact the FEVIQO editorial desk, privacy officer, DMCA agent, or studio support team via email or our online contact form.',
    focusKeyword: 'contact FEVIQO',
    secondaryKeywords: ['contact feviqo', 'editorial feedback', 'DMCA contact', 'support'],
    canonicalUrl: 'https://feviqo.com/contact',
    ogTitle: 'Contact Us — FEVIQO',
    ogDescription: 'Reach the FEVIQO editorial, legal, and support team directly.',
    ogImage: 'https://feviqo.com/feviqo1.png',
    robots: 'index, follow',
    schemaType: 'WebSite'
  },
  '/platform': {
    path: '/platform',
    pageName: 'FEVIQO Flow Platform',
    seoTitle: 'FEVIQO Flow Platform | Video Editing Workspace',
    metaDescription: 'Access the FEVIQO Flow workspace for managing video editing requests, projects, and review workflows.',
    focusKeyword: 'FEVIQO Flow platform',
    secondaryKeywords: ['video editing client portal', 'video project management'],
    canonicalUrl: 'https://feviqo.com/platform',
    ogTitle: 'FEVIQO Flow Platform',
    ogDescription: 'Manage video editing requests, projects, and reviews in FEVIQO Flow.',
    ogImage: 'https://feviqo.com/feviqo1.png',
    robots: 'noindex, follow',
    schemaType: 'Service'
  },
  '/admin': {
    path: '/admin',
    pageName: 'Admin Portal',
    seoTitle: 'FEVIQO Admin Portal',
    metaDescription: 'FEVIQO Internal Administration and Content Management Portal.',
    focusKeyword: 'admin',
    secondaryKeywords: [],
    canonicalUrl: 'https://feviqo.com/admin',
    ogTitle: 'FEVIQO Admin Portal',
    ogDescription: 'Internal Management System',
    ogImage: 'https://feviqo.com/feviqo1.png',
    robots: 'noindex, nofollow',
    schemaType: 'WebSite'
  },
  '/admin/memberships': {
    path: '/admin/memberships',
    pageName: 'FEVIQO Membership Admin Panel',
    seoTitle: 'FEVIQO Membership Admin Panel',
    metaDescription: 'Private FEVIQO administration dashboard for verifying Bank QR membership payments and managing active memberships.',
    focusKeyword: 'feviqo admin memberships',
    secondaryKeywords: [],
    canonicalUrl: 'https://feviqo.com/admin/memberships',
    ogTitle: 'FEVIQO Membership Admin Panel',
    ogDescription: 'Private payment verification and membership management portal.',
    ogImage: 'https://feviqo.com/feviqo1.png',
    robots: 'noindex, nofollow',
    schemaType: 'WebSite'
  },
  '/admin/automation': {
    path: '/admin/automation',
    pageName: 'FEVIQO WhatsApp & Automation Admin',
    seoTitle: 'FEVIQO WhatsApp Cloud API & Business Automation Admin',
    metaDescription: 'Private FEVIQO administration dashboard for WhatsApp Cloud API integration, membership automation rules, episode broadcasts, and AI support.',
    focusKeyword: 'feviqo admin automation',
    secondaryKeywords: [],
    canonicalUrl: 'https://feviqo.com/admin/automation',
    ogTitle: 'FEVIQO WhatsApp & Automation Admin',
    ogDescription: 'Private WhatsApp Cloud API and automation management portal.',
    ogImage: 'https://feviqo.com/feviqo1.png',
    robots: 'noindex, nofollow',
    schemaType: 'WebSite'
  },
  '/admin/automation/whatsapp': {
    path: '/admin/automation/whatsapp',
    pageName: 'FEVIQO Manual WhatsApp Center',
    seoTitle: 'FEVIQO Manual WhatsApp Center & Customer Messaging Queue',
    metaDescription: 'Private FEVIQO administration dashboard for one-click manual WhatsApp customer notifications, recipient directory, and delivery confirmation.',
    focusKeyword: 'feviqo admin manual whatsapp',
    secondaryKeywords: [],
    canonicalUrl: 'https://feviqo.com/admin/automation/whatsapp',
    ogTitle: 'FEVIQO Manual WhatsApp Center',
    ogDescription: 'Private manual WhatsApp messaging center and customer directory.',
    ogImage: 'https://feviqo.com/feviqo1.png',
    robots: 'noindex, nofollow',
    schemaType: 'WebSite'
  },
  '/admin/automation/leads': {
    path: '/admin/automation/leads',
    pageName: 'FEVIQO Video Editing Leads & WhatsApp Inbox',
    seoTitle: 'FEVIQO Video Editing Leads CRM & WhatsApp Inbox',
    metaDescription: 'Private FEVIQO administration dashboard for video editing leads, follow-up pipelines, and unified WhatsApp inbox with human takeover.',
    focusKeyword: 'feviqo admin automation leads',
    secondaryKeywords: [],
    canonicalUrl: 'https://feviqo.com/admin/automation/leads',
    ogTitle: 'FEVIQO Video Editing Leads & Inbox',
    ogDescription: 'Private video editing CRM and WhatsApp inbox.',
    ogImage: 'https://feviqo.com/feviqo1.png',
    robots: 'noindex, nofollow',
    schemaType: 'WebSite'
  }
};

const STORAGE_KEY = 'feviqo_seo_overrides_v1';

function formatCanonicalUrl(url: string): string {
  if (!url) return 'https://feviqo.com/';
  try {
    const u = new URL(url);
    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }
    u.protocol = 'https:';
    u.host = 'feviqo.com';
    return u.toString();
  } catch {
    return url;
  }
}

export function getSEOConfigForPath(pathname: string): PageSEOConfig {
  let cleanPath = (pathname || '/').split('?')[0].split('#')[0].toLowerCase();
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  let savedOverrides: Record<string, PageSEOConfig> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      savedOverrides = JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }

  if (savedOverrides[cleanPath]) {
    const cfg = savedOverrides[cleanPath];
    return { ...cfg, canonicalUrl: formatCanonicalUrl(cfg.canonicalUrl) };
  }

  if (DEFAULT_PAGE_SEO[cleanPath]) {
    const cfg = DEFAULT_PAGE_SEO[cleanPath];
    return { ...cfg, canonicalUrl: formatCanonicalUrl(cfg.canonicalUrl) };
  }

  // Canonical aliases used by the application route resolver.
  const canonicalAliasTargets: Record<string, string> = {
    '/for-creators': '/creators',
    '/for-business': '/business',
    '/for-agencies': '/agencies',
    '/flow': '/admin',
    '/memberships': '/membership',
    '/teskilat-urdu': '/teskilat',
    '/teskilat-urdu/episode-189': '/teskilat/episode-189',
    '/teskilat-urdu/episode-188': '/teskilat/episode-188',
    '/teskilat-urdu/episode-187': '/teskilat/episode-187',
    '/teskilat-urdu/episode-186': '/teskilat/episode-186'
  };
  const aliasTarget = canonicalAliasTargets[cleanPath];
  if (aliasTarget && DEFAULT_PAGE_SEO[aliasTarget]) {
    const cfg = DEFAULT_PAGE_SEO[aliasTarget];
    return { ...cfg, canonicalUrl: formatCanonicalUrl(cfg.canonicalUrl) };
  }

  // Alias lookups for Mehmed, Teskilat, and drama variations
  if (cleanPath === '/mehmed' || cleanPath === '/mehmed/') {
    if (DEFAULT_PAGE_SEO['/mehmed-fetihler-sultani']) {
      const cfg = DEFAULT_PAGE_SEO['/mehmed-fetihler-sultani'];
      return { ...cfg, canonicalUrl: formatCanonicalUrl(cfg.canonicalUrl) };
    }
  }
  if (cleanPath.includes('mehmed') && cleanPath.includes('89')) {
    if (DEFAULT_PAGE_SEO['/mehmed-fetihler-sultani/episode-89']) {
      const cfg = DEFAULT_PAGE_SEO['/mehmed-fetihler-sultani/episode-89'];
      return { ...cfg, canonicalUrl: formatCanonicalUrl(cfg.canonicalUrl) };
    }
  }
  if (cleanPath.includes('mehmed') && cleanPath.includes('88')) {
    if (DEFAULT_PAGE_SEO['/mehmed-fetihler-sultani/episode-88']) {
      const cfg = DEFAULT_PAGE_SEO['/mehmed-fetihler-sultani/episode-88'];
      return { ...cfg, canonicalUrl: formatCanonicalUrl(cfg.canonicalUrl) };
    }
  }
  if ((cleanPath.includes('189') || cleanPath.includes('episode-189')) && (cleanPath.includes('teskilat') || cleanPath.includes('episode'))) {
    if (DEFAULT_PAGE_SEO['/teskilat/episode-189']) {
      const cfg = DEFAULT_PAGE_SEO['/teskilat/episode-189'];
      return { ...cfg, canonicalUrl: formatCanonicalUrl(cfg.canonicalUrl) };
    }
  }
  if ((cleanPath.includes('188') || cleanPath.includes('episode-188')) && (cleanPath.includes('teskilat') || cleanPath.includes('episode'))) {
    if (DEFAULT_PAGE_SEO['/teskilat/episode-188']) {
      const cfg = DEFAULT_PAGE_SEO['/teskilat/episode-188'];
      return { ...cfg, canonicalUrl: formatCanonicalUrl(cfg.canonicalUrl) };
    }
  }

  // Partner & member referral links under /membership/:slug open the Membership page with 200 OK
  if (cleanPath.startsWith('/membership/') || cleanPath.startsWith('/memberships/')) {
    const cfg = DEFAULT_PAGE_SEO['/membership'];
    return {
      ...cfg,
      path: cleanPath,
      canonicalUrl: 'https://feviqo.com/membership',
    };
  }

  if (cleanPath.startsWith('/account/')) {
    const cfg = DEFAULT_PAGE_SEO['/account'];
    return { ...cfg, path: cleanPath, canonicalUrl: 'https://feviqo.com/account' };
  }

  if (cleanPath.startsWith('/admin/')) {
    const cfg = DEFAULT_PAGE_SEO['/admin/memberships'] || DEFAULT_PAGE_SEO['/admin'];
    return { ...cfg, path: cleanPath };
  }

  if (cleanPath === '/watch' || cleanPath.startsWith('/watch/') || cleanPath.startsWith('/video/')) {
    const cfg = DEFAULT_PAGE_SEO['/gallery'];
    return { ...cfg, path: cleanPath, canonicalUrl: 'https://feviqo.com/gallery' };
  }

  // Dynamic drama episode guide routes
  const teskilatEpMatch = cleanPath.match(/^\/(?:teskilat|teskilat-urdu)\/episode-(\d+)$/);
  if (teskilatEpMatch) {
    const epNum = teskilatEpMatch[1];
    return {
      ...DEFAULT_PAGE_SEO['/teskilat'],
      path: `/teskilat/episode-${epNum}`,
      pageName: `Teskilat Episode ${epNum} Guide`,
      seoTitle: `Teşkilat Season 7 Episode ${epNum} – Episode Guide & Story Summary | FEVIQO`,
      metaDescription: `Read the Teşkilat Season 7 Episode ${epNum} (Bolum ${epNum}) story summary, cast breakdown, trailer review notes, and fan discussion on FEVIQO.`,
      focusKeyword: `Teskilat Episode ${epNum} story summary`,
      canonicalUrl: `https://feviqo.com/teskilat/episode-${epNum}`,
      ogTitle: `Teşkilat Season 7 Episode ${epNum} – Episode Guide & Story Summary | FEVIQO`,
      schemaType: 'Article',
    };
  }

  const mehmedEpMatch = cleanPath.match(/^\/(?:mehmed-fetihler-sultani|mehmed)\/episode-(\d+)$/);
  if (mehmedEpMatch) {
    const epNum = mehmedEpMatch[1];
    return {
      ...DEFAULT_PAGE_SEO['/mehmed-fetihler-sultani'],
      path: `/mehmed-fetihler-sultani/episode-${epNum}`,
      pageName: `Mehmed Fetihler Sultani Episode ${epNum} Guide`,
      seoTitle: `Mehmed: Fetihler Sultanı Episode ${epNum} – Story Summary & Cast Review | FEVIQO`,
      metaDescription: `Read the Mehmed: Fetihler Sultanı Season 4 Episode ${epNum} (Bolum ${epNum}) episode guide, historical plot recap, and cast review on FEVIQO.`,
      focusKeyword: `Mehmed Episode ${epNum} story summary`,
      canonicalUrl: `https://feviqo.com/mehmed-fetihler-sultani/episode-${epNum}`,
      ogTitle: `Mehmed: Fetihler Sultanı Episode ${epNum} – Story Summary & Cast Review | FEVIQO`,
      schemaType: 'Article',
    };
  }

  const gunesinEpMatch = cleanPath.match(/^\/gunesin-dogdugu-yer\/episode-(\d+)$/);
  if (gunesinEpMatch) {
    const epNum = gunesinEpMatch[1];
    return {
      ...DEFAULT_PAGE_SEO['/gunesin-dogdugu-yer'],
      path: `/gunesin-dogdugu-yer/episode-${epNum}`,
      pageName: `Gunesin Dogdugu Yer Episode ${epNum} Guide`,
      seoTitle: `Güneşin Doğduğu Yer Episode ${epNum} – Episode Guide & Story Summary | FEVIQO`,
      metaDescription: `Read the Güneşin Doğduğu Yer Episode ${epNum} (Bolum ${epNum}) story summary, cast profiles, trailer notes, and viewer reviews on FEVIQO.`,
      focusKeyword: `Gunesin Dogdugu Yer Episode ${epNum} story summary`,
      canonicalUrl: `https://feviqo.com/gunesin-dogdugu-yer/episode-${epNum}`,
      ogTitle: `Güneşin Doğduğu Yer Episode ${epNum} – Episode Guide & Story Summary | FEVIQO`,
      schemaType: 'Article',
    };
  }

  const yeraltiEpMatch = cleanPath.match(/^\/yeralti\/episode-(\d+)$/);
  if (yeraltiEpMatch) {
    const epNum = yeraltiEpMatch[1];
    return {
      ...DEFAULT_PAGE_SEO['/yeralti'],
      path: `/yeralti/episode-${epNum}`,
      pageName: `Yeralti Episode ${epNum} Guide`,
      seoTitle: `Yeraltı Episode ${epNum} – Episode Guide, Story Summary & Review | FEVIQO`,
      metaDescription: `Read the Yeraltı Episode ${epNum} story summary, cast & character details, trailer review notes, and episode discussion on FEVIQO.`,
      focusKeyword: `Yeralti Episode ${epNum} story summary`,
      canonicalUrl: `https://feviqo.com/yeralti/episode-${epNum}`,
      ogTitle: `Yeraltı Episode ${epNum} – Episode Guide, Story Summary & Review | FEVIQO`,
      schemaType: 'Article',
    };
  }

  // Unknown URLs currently fall through to the homepage in the React app.
  // Do not give those soft-404 routes self-canonicals or indexable metadata.
  return {
    path: cleanPath,
    pageName: 'Unknown Route',
    seoTitle: `Page Not Found | ${BRAND_SYSTEM.name}`,
    metaDescription: 'This FEVIQO page could not be found.',
    focusKeyword: 'page not found',
    secondaryKeywords: [],
    canonicalUrl: 'https://feviqo.com/',
    ogTitle: `Page Not Found | ${BRAND_SYSTEM.name}`,
    ogDescription: 'This FEVIQO page could not be found.',
    ogImage: BRAND_SYSTEM.defaultOgImage,
    robots: 'noindex, follow',
    schemaType: 'WebSite'
  };
}

export function saveSEOConfigForPath(pathname: string, config: PageSEOConfig): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let savedOverrides: Record<string, PageSEOConfig> = raw ? JSON.parse(raw) : {};
    savedOverrides[pathname] = config;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedOverrides));
  } catch (e) {
    console.error('Failed to save SEO config', e);
  }
}

// Export automated search engine re-indexing pinger functions
export {
  pingSearchEnginesForReindexing,
  triggerEpisodeReindexingPing,
  getSearchEnginePingHistory
} from './seoIndexingService';
export type { SearchEnginePingOptions, SearchEnginePingResult } from './seoIndexingService';

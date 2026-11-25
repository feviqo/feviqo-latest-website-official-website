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
    pageName: 'Teskilat Season 7 Episode Guides & Urdu Subtitles',
    seoTitle: 'Teşkilat Season 7 — Episode Guides, Story Summaries & Urdu Subtitles | FEVIQO',
    metaDescription: 'Read Teşkilat Season 7 Turkish drama episode guides, bilingual English & Urdu story summaries, cast profiles, and subtitle & dubbing updates on FEVIQO.',
    focusKeyword: 'Teşkilat Season 7 Urdu Subtitles',
    secondaryKeywords: [
      'Teşkilat Season 7 Episode Guide',
      'Teskilat Urdu Subtitles',
      'Teskilat Story Summary',
      'Teskilat Subtitle & Dubbing Updates',
      'Altay Yalçın Teskilat'
    ],
    canonicalUrl: 'https://feviqo.com/teskilat',
    ogTitle: 'Teşkilat Season 7 — Episode Guides & Urdu Subtitles | FEVIQO',
    ogDescription: 'Explore Teşkilat Season 7 episode summaries, cast notes, and Urdu subtitle & dubbing updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-186': {
    path: '/teskilat/episode-186',
    pageName: 'Teskilat Episode 186 Summary & Notes',
    seoTitle: 'Teşkilat Season 7 Episode 186 — Episode Summary, Cast & Urdu Subtitle Updates | FEVIQO',
    metaDescription: 'Read our Teşkilat Season 7 Episode 186 (Bölüm 186) English & Urdu episode summary, cast breakdown, trailer review, and subtitle updates on FEVIQO.',
    focusKeyword: 'teskilat episode 186 urdu subtitles',
    secondaryKeywords: ['teskilat season 7 episode 186', 'teskilat episode 186 summary', 'teskilat bolum 186 urdu subtitles'],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-186',
    ogTitle: 'Teşkilat Season 7 Episode 186 — Episode Summary & Urdu Subtitle Updates | FEVIQO',
    ogDescription: 'Detailed Teşkilat Episode 186 (Bölüm 186) story summary, cast notes, and Urdu subtitle updates on FEVIQO.',
    ogImage: 'https://feviqo.com/images/teskialt186thumbnIL.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-187': {
    path: '/teskilat/episode-187',
    pageName: 'Teskilat Episode 187 Summary & Notes',
    seoTitle: 'Teşkilat Season 7 Episode 187 — Episode Summary, Cast & Urdu Subtitle Updates | FEVIQO',
    metaDescription: 'Read our Teşkilat Season 7 Episode 187 (Bölüm 187) English & Urdu story summary, cast breakdown, trailer notes, and Urdu subtitle updates on FEVIQO.',
    focusKeyword: 'Teşkilat episode 187 urdu subtitles',
    secondaryKeywords: [
      'Teskilat episode 187',
      'Teşkilat Bolum 187 Urdu',
      'Teskilat Season 7 Episode 3',
      'Teskilat 187 Episode Summary'
    ],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-187',
    ogTitle: 'Teşkilat Season 7 Episode 187 — Episode Summary & Urdu Subtitle Updates | FEVIQO',
    ogDescription: 'Detailed Teşkilat Episode 187 (Bölüm 187) story summary, cast details, and Urdu subtitle updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/gunesin-dogdugu-yer': {
    path: '/gunesin-dogdugu-yer',
    pageName: 'Gunesin Dogdugu Yer Episode Guides & Urdu Subtitles',
    seoTitle: 'Güneşin Doğduğu Yer — Episode Guides, Story Summaries & Urdu Subtitles | FEVIQO',
    metaDescription: 'Explore Güneşin Doğduğu Yer episode summaries, cast profiles, trailer notes, and Urdu subtitle & dubbing updates on FEVIQO.',
    focusKeyword: 'gunesin dogdugu yer urdu subtitles',
    secondaryKeywords: ['gunesin dogdugu yer', 'gunesin dogdugu yer episode guide', 'gunesin dogdugu yer urdu subtitles', 'turkish drama guides'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer',
    ogTitle: 'Güneşin Doğduğu Yer — Episode Guides & Urdu Subtitles | FEVIQO',
    ogDescription: 'Read Güneşin Doğduğu Yer episode summaries, cast notes, and Urdu subtitle updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/gunesin-dogdugu-yer/episode-3': {
    path: '/gunesin-dogdugu-yer/episode-3',
    pageName: 'Gunesin Dogdugu Yer Episode 3 Summary & Notes',
    seoTitle: 'Güneşin Doğduğu Yer Episode 3 — Episode Summary, Cast & Urdu Subtitle Updates | FEVIQO',
    metaDescription: 'Read Güneşin Doğduğu Yer Episode 3 (Bölüm 3) story summary, cast breakdown, trailer notes, and Urdu subtitle updates on FEVIQO.',
    focusKeyword: 'gunesin dogdugu yer episode 3 urdu subtitles',
    secondaryKeywords: ['gunesin dogdugu yer episode 3', 'gunesin dogdugu yer bolum 3 urdu', 'gunesin dogdugu yer summary'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-3',
    ogTitle: 'Güneşin Doğduğu Yer Episode 3 — Episode Summary & Urdu Subtitle Updates | FEVIQO',
    ogDescription: 'Detailed Güneşin Doğduğu Yer Episode 3 (Bölüm 3) story summary, cast notes, and Urdu subtitle updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1VsQl3XReqSBLh5sk5UbalpsaVoSs0ggj',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/gunesin-dogdugu-yer/episode-4': {
    path: '/gunesin-dogdugu-yer/episode-4',
    pageName: 'Gunesin Dogdugu Yer Episode 4 Summary & Notes',
    seoTitle: 'Güneşin Doğduğu Yer Episode 4 — Episode Summary, Cast & Urdu Subtitle Updates | FEVIQO',
    metaDescription: 'Read Güneşin Doğduğu Yer Episode 4 (Bölüm 4) story summary, cast breakdown, trailer notes, and Urdu subtitle updates on FEVIQO.',
    focusKeyword: 'Gunesin Dogdugu Yer Episode 4 Urdu Subtitles',
    secondaryKeywords: ['Gunesin Dogdugu Yer Episode 4', 'Gunesin Dogdugu Yer Bolum 4 Urdu', 'Episode Summary', 'FEVIQO'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-4',
    ogTitle: 'Güneşin Doğduğu Yer Episode 4 — Episode Summary & Urdu Subtitle Updates | FEVIQO',
    ogDescription: 'Detailed Güneşin Doğduğu Yer Episode 4 (Bölüm 4) story summary and Urdu subtitle updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1KaS-64iPUBSZ2gtZ3B2tj3bwmAUFa6gV',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/gunesin-dogdugu-yer/episode-7': {
    path: '/gunesin-dogdugu-yer/episode-7',
    pageName: 'Gunesin Dogdugu Yer Episode 7 Summary & Notes',
    seoTitle: 'Güneşin Doğduğu Yer Episode 7 — Episode Summary, Cast & Urdu Subtitle Updates | FEVIQO',
    metaDescription: 'Read Güneşin Doğduğu Yer Episode 7 (Bölüm 7) bilingual English & Urdu story summary, cast list, release date, and subtitle updates on FEVIQO.',
    focusKeyword: 'Gunesin Dogdugu Yer Episode 7 Urdu Subtitles',
    secondaryKeywords: ['Gunesin Dogdugu Yer Episode 7', 'Gunesin Dogdugu Yer Bolum 7 Urdu', 'Turkish drama Urdu', 'FEVIQO'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-7',
    ogTitle: 'Güneşin Doğduğu Yer Episode 7 — Episode Summary & Urdu Subtitle Updates | FEVIQO',
    ogDescription: 'Detailed Güneşin Doğduğu Yer Episode 7 (Bölüm 7) story summary, cast notes, and Urdu subtitle updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/137w7jkmYW4bpn4rfdipcJ4gJksnpqeL4',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/gunesin-dogdugu-yer/episode-5': {
    path: '/gunesin-dogdugu-yer/episode-5',
    pageName: 'Gunesin Dogdugu Yer Episode 5 Summary & Notes',
    seoTitle: 'Güneşin Doğduğu Yer Episode 5 — Episode Summary, Cast & Urdu Subtitle Updates | FEVIQO',
    metaDescription: 'Read Güneşin Doğduğu Yer Episode 5 (Bölüm 5) story summary, cast breakdown, trailer notes, and Urdu subtitle updates on FEVIQO.',
    focusKeyword: 'Gunesin Dogdugu Yer Episode 5 Urdu Subtitles',
    secondaryKeywords: ['Gunesin Dogdugu Yer Episode 5', 'Gunesin Dogdugu Yer Bolum 5 Urdu', 'Episode Summary', 'FEVIQO'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-5',
    ogTitle: 'Güneşin Doğduğu Yer Episode 5 — Episode Summary & Urdu Subtitle Updates | FEVIQO',
    ogDescription: 'Detailed Güneşin Doğduğu Yer Episode 5 (Bölüm 5) story summary and Urdu subtitle updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1ww1YXzsV-PBId4z9g6oPZSYHVXiDOiPO',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/gunesin-dogdugu-yer/episode-9': {
    path: '/gunesin-dogdugu-yer/episode-9',
    pageName: 'Gunesin Dogdugu Yer Episode 9 Dubbing Updates',
    seoTitle: 'Güneşin Doğduğu Yer Episode 9 — Episode Summary & Urdu Dubbing Updates | FEVIQO',
    metaDescription: 'Read Güneşin Doğduğu Yer Episode 9 (Bölüm 9) episode summary, cast notes, trailer breakdown, and Urdu dubbing updates on FEVIQO.',
    focusKeyword: 'Gunesin Dogdugu Yer Episode 9 Urdu Dubbed',
    secondaryKeywords: ['Gunesin Dogdugu Yer Episode 9', 'Gunesin Dogdugu Yer Bolum 9 Urdu Dubbed', 'FEVIQO VIP'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-9',
    ogTitle: 'Güneşin Doğduğu Yer Episode 9 — Episode Summary & Urdu Dubbing Updates | FEVIQO',
    ogDescription: 'Read Güneşin Doğduğu Yer Episode 9 (Bölüm 9) episode summary and Urdu dubbing updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1UikNqWzQcGxbQx8sSqgjaTDN47iGhxgd',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/yeralti': {
    path: '/yeralti',
    pageName: 'Yeralti Episode Guides & Urdu Dubbing Updates',
    seoTitle: 'Yeraltı (جرائم کی دنیا) — Episode Guides & Urdu Dubbing Updates | FEVIQO',
    metaDescription: 'Explore Yeraltı (جرائم کی دنیا) episode summaries, cast profiles, trailer notes, and Urdu dubbing updates on FEVIQO.',
    focusKeyword: 'yeralti urdu dubbed',
    secondaryKeywords: ['yeralti turkish drama', 'yeralti episode guide', 'jurm ki duniya', 'feviqo yeralti'],
    canonicalUrl: 'https://feviqo.com/yeralti',
    ogTitle: 'Yeraltı (جرائم کی دنیا) — Episode Guides & Urdu Dubbing Updates | FEVIQO',
    ogDescription: 'Read Yeraltı (جرائم کی دنیا) episode summaries, cast notes, and Urdu dubbing updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1hU7IkIPWRZ0uSuDhU_azx-TXyEbzxvqQ',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/yeralti/episode-23': {
    path: '/yeralti/episode-23',
    pageName: 'Yeralti Episode 23 Summary & Notes',
    seoTitle: 'Yeraltı Episode 23 — Episode Summary, Cast & Urdu Dubbing Updates | FEVIQO',
    metaDescription: 'Read Yeraltı Episode 23 English & Urdu story summary, cast breakdown, trailer review, and Urdu dubbing updates on FEVIQO.',
    focusKeyword: 'yeralti episode 23 urdu dubbed',
    secondaryKeywords: ['yeralti episode 23', 'yeralti urdu dubbed', 'yeralti episode summary', 'feviqo yeralti'],
    canonicalUrl: 'https://feviqo.com/yeralti/episode-23',
    ogTitle: 'Yeraltı Episode 23 — Episode Summary & Urdu Dubbing Updates | FEVIQO',
    ogDescription: 'Read Yeraltı Episode 23 episode summary, cast list, and Urdu dubbing updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1hU7IkIPWRZ0uSuDhU_azx-TXyEbzxvqQ',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-194': {
    path: '/teskilat/episode-194',
    pageName: 'Teskilat Episode 194 Summary & Notes',
    seoTitle: 'Teşkilat Season 7 Episode 194 — Episode Summary & Urdu Dubbing Updates | FEVIQO',
    metaDescription: 'Read Teşkilat Season 7 Episode 194 (Bölüm 194) English & Urdu story summary, cast list, trailer notes, and Urdu dubbing updates on FEVIQO.',
    focusKeyword: 'Teskilat Episode 194 Urdu Dubbed',
    secondaryKeywords: ['Teskilat 194 Urdu Dubbed', 'Teskilat Bolum 194', 'Teskilat Season 7 Episode 194'],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-194',
    ogTitle: 'Teşkilat Season 7 Episode 194 — Episode Summary & Urdu Dubbing Updates | FEVIQO',
    ogDescription: 'Read Teşkilat Season 7 Episode 194 (Bölüm 194) story summary and Urdu dubbing updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1pD9jhie8NMZRQzxPCb3LyDGkhEE5xFdY',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-193': {
    path: '/teskilat/episode-193',
    pageName: 'Teskilat Episode 193 Summary & Notes',
    seoTitle: 'Teşkilat Season 7 Episode 193 — Episode Summary & Urdu Dubbing Updates | FEVIQO',
    metaDescription: 'Read Teşkilat Season 7 Episode 193 (Bölüm 193) English & Urdu story summary, cast list, trailer notes, and Urdu dubbing updates on FEVIQO.',
    focusKeyword: 'Teskilat Episode 193 Urdu Dubbed',
    secondaryKeywords: ['Teskilat 193 Urdu Dubbed', 'Teskilat Bolum 193', 'Teskilat Season 7 Episode 193'],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-193',
    ogTitle: 'Teşkilat Season 7 Episode 193 — Episode Summary & Urdu Dubbing Updates | FEVIQO',
    ogDescription: 'Read Teşkilat Season 7 Episode 193 (Bölüm 193) story summary and Urdu dubbing updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1pDs3oj0h6eOP64xO10eYp6TMqcGs2AqP',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-192': {
    path: '/teskilat/episode-192',
    pageName: 'Teskilat Episode 192 Summary & Notes',
    seoTitle: 'Teşkilat Season 7 Episode 192 — Episode Summary & Urdu Dubbing Updates | FEVIQO',
    metaDescription: 'Read Teşkilat Season 7 Episode 192 (Bölüm 192) English & Urdu story summary, cast list, trailer notes, and Urdu dubbing updates on FEVIQO.',
    focusKeyword: 'Teskilat Episode 192 Urdu Dubbed',
    secondaryKeywords: ['Teskilat 192 Urdu Dubbed', 'Teskilat Bolum 192', 'Teskilat Season 7 Episode 192'],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-192',
    ogTitle: 'Teşkilat Season 7 Episode 192 — Episode Summary & Urdu Dubbing Updates | FEVIQO',
    ogDescription: 'Read Teşkilat Season 7 Episode 192 (Bölüm 192) story summary and Urdu dubbing updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-189': {
    path: '/teskilat/episode-189',
    pageName: 'Teskilat Episode 189 Summary & Notes',
    seoTitle: 'Teşkilat Season 7 Episode 189 — Episode Summary, Cast & Urdu Subtitle Updates | FEVIQO',
    metaDescription: 'Read Teşkilat Episode 189 (Bölüm 189) English & Urdu episode summary, cast list, trailer breakdown, and Urdu subtitle updates on FEVIQO.',
    focusKeyword: 'Teskilat 189 Urdu Subtitles',
    secondaryKeywords: ['Teskilat Episode 189 Urdu', 'Teskilat Bolum 189 Urdu', 'Altay Yalcin Kurt Bey', 'Teskilat 189 Summary'],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-189',
    ogTitle: 'Teşkilat Season 7 Episode 189 — Episode Summary & Urdu Subtitle Updates | FEVIQO',
    ogDescription: 'Read Teşkilat Episode 189 (Bölüm 189) story summary, cast notes, and Urdu subtitle updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/15lsrpRxnIw6C491oFLSXMXCC50o2ByfC',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/teskilat/episode-188': {
    path: '/teskilat/episode-188',
    pageName: 'Teskilat Episode 188 Summary & Notes',
    seoTitle: 'Teşkilat Season 7 Episode 188 — Episode Summary, Cast & Urdu Subtitle Updates | FEVIQO',
    metaDescription: 'Read Teşkilat Season 7 Episode 4 (Bölüm 188) English & Urdu story summary, cast breakdown, trailer review, and Urdu subtitle updates on FEVIQO.',
    focusKeyword: 'Teskilat Episode 188 Urdu Subtitles',
    secondaryKeywords: ['Teskilat Season 7', 'Teskilat Episode 188 Urdu', 'Teskilat Bolum 188', 'Altay Ender Episode 188'],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-188',
    ogTitle: 'Teşkilat Season 7 Episode 188 — Episode Summary & Urdu Subtitle Updates | FEVIQO',
    ogDescription: 'Read Teşkilat Episode 188 (Bölüm 188) story summary, cast details, and Urdu subtitle updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1FXGXBZcts9bp3XdPmqI_pGytI0GAKYDc',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/mehmed-fetihler-sultani/episode-90': {
    path: '/mehmed-fetihler-sultani/episode-90',
    pageName: 'Mehmed Fetihler Sultani Episode 90 Summary & Notes',
    seoTitle: 'Mehmed: Fetihler Sultanı Episode 90 — Episode Summary, Cast & Urdu Subtitle Updates | FEVIQO',
    metaDescription: 'Read Mehmed: Fetihler Sultanı Season 4 Episode 90 (Bölüm 90) English & Urdu episode summary, cast breakdown, release date, and subtitle updates on FEVIQO.',
    focusKeyword: 'Mehmed Episode 90 Urdu Subtitles',
    secondaryKeywords: ['Mehmed Season 4 Episode 90', 'Mehmed Fetihler Sultani Bolum 90 Urdu', 'Mehmed 90 Summary', 'FEVIQO'],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani/episode-90',
    ogTitle: 'Mehmed: Fetihler Sultanı Episode 90 — Episode Summary & Urdu Subtitle Updates | FEVIQO',
    ogDescription: 'Read Mehmed: Fetihler Sultanı Season 4 Episode 90 (Bölüm 90) story summary, cast notes, and subtitle updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Ql7rSRtgL6HfxOyO-BSfPN8CdfUooJ1p',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/mehmed-fetihler-sultani/episode-89': {
    path: '/mehmed-fetihler-sultani/episode-89',
    pageName: 'Mehmed Fetihler Sultani Episode 89 Summary & Notes',
    seoTitle: 'Mehmed: Fetihler Sultanı Episode 89 — Episode Summary, Cast & Urdu Subtitle Updates | FEVIQO',
    metaDescription: 'Read Mehmed: Fetihler Sultanı Season 4 Episode 89 (Bölüm 89) English & Urdu story summary, cast list, trailer breakdown, and subtitle updates on FEVIQO.',
    focusKeyword: 'Mehmed Episode 89 Urdu Subtitles',
    secondaryKeywords: ['Mehmed Season 4 Episode 89', 'Mehmed Fetihler Sultani Bolum 89 Urdu', 'Mehmed 89 Summary', 'FEVIQO'],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani/episode-89',
    ogTitle: 'Mehmed: Fetihler Sultanı Episode 89 — Episode Summary & Urdu Subtitle Updates | FEVIQO',
    ogDescription: 'Read Mehmed: Fetihler Sultanı Season 4 Episode 89 (Bölüm 89) story summary and Urdu subtitle updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/15DClk9e82Zvbxbjx4_wOMcSa298IFcR5',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/mehmed-fetihler-sultani/episode-88': {
    path: '/mehmed-fetihler-sultani/episode-88',
    pageName: 'Mehmed Fetihler Sultani Episode 88 Summary & Notes',
    seoTitle: 'Mehmed: Fetihler Sultanı Episode 88 — Episode Summary, Cast & Urdu Subtitle Updates | FEVIQO',
    metaDescription: 'Read Mehmed: Fetihler Sultanı Season 4 Episode 88 (Bölüm 88) English & Urdu story summary, cast breakdown, trailer notes, and subtitle updates on FEVIQO.',
    focusKeyword: 'Mehmed Episode 88 Urdu Subtitles',
    secondaryKeywords: ['Mehmed Season 4 Episode 88', 'Mehmed Fetihler Sultani Bolum 88 Urdu', 'Mehmed 88 Summary', 'FEVIQO'],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani/episode-88',
    ogTitle: 'Mehmed: Fetihler Sultanı Episode 88 — Episode Summary & Urdu Subtitle Updates | FEVIQO',
    ogDescription: 'Read Mehmed: Fetihler Sultanı Season 4 Episode 88 (Bölüm 88) story summary and Urdu subtitle updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1w3UK-ZWuESJb-S4r-J_ChUTknl-yaWSq',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/mehmed-fetihler-sultani': {
    path: '/mehmed-fetihler-sultani',
    pageName: 'Mehmed Fetihler Sultani Episode Guides & Urdu Subtitles',
    seoTitle: 'Mehmed: Fetihler Sultanı Season 4 — Episode Guides & Urdu Subtitles | FEVIQO',
    metaDescription: 'Explore Mehmed: Fetihler Sultanı Season 4 episode summaries, historical context, cast profiles, and Urdu subtitle & dubbing updates on FEVIQO.',
    focusKeyword: 'Mehmed Fetihler Sultani Urdu Subtitles',
    secondaryKeywords: [
      'Mehmed Fetihler Sultani Season 4',
      'Mehmed Urdu Subtitles',
      'Mehmed Episode Guide',
      'Mehmed Subtitle & Dubbing Updates'
    ],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani',
    ogTitle: 'Mehmed: Fetihler Sultanı Season 4 — Episode Guides & Urdu Subtitles | FEVIQO',
    ogDescription: 'Read Mehmed: Fetihler Sultanı Season 4 episode summaries, cast notes, and Urdu subtitle & dubbing updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Je_-r1ngLfH15ryeju3suvZC2W0YSTL1',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/mehmed-fetihler-sultani/episode-87': {
    path: '/mehmed-fetihler-sultani/episode-87',
    pageName: 'Mehmed Episode 87 Summary & Notes',
    seoTitle: 'Mehmed: Fetihler Sultanı Episode 87 — Episode Summary, Cast & Urdu Subtitle Updates | FEVIQO',
    metaDescription: 'Read Mehmed: Fetihler Sultanı Episode 87 (Bölüm 87) English & Urdu story summary, cast notes, and Urdu subtitle updates on FEVIQO.',
    focusKeyword: 'Mehmed Episode 87 Urdu Subtitles',
    secondaryKeywords: ['Mehmed Fetihler Sultani Episode 87', 'Mehmed Bolum 87 Urdu', 'Sultan Mehmed II Episode Guide'],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani/episode-87',
    ogTitle: 'Mehmed: Fetihler Sultanı Episode 87 — Episode Summary & Urdu Subtitle Updates | FEVIQO',
    ogDescription: 'Read Mehmed: Fetihler Sultanı Episode 87 (Bölüm 87) story summary and Urdu subtitle updates on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/dramas': {
    path: '/dramas',
    pageName: 'Turkish Drama Episode Guides & Urdu Subtitles',
    seoTitle: 'Turkish Drama Episode Guides & Urdu Subtitles — Summaries & Dubbing Updates | FEVIQO',
    metaDescription: 'Explore Turkish drama episode guides, bilingual English & Urdu summaries, cast lists, and subtitle & dubbing updates for Teşkilat, Mehmed: Fetihler Sultanı, Güneşin Doğduğu Yer, and Yeraltı on FEVIQO.',
    focusKeyword: 'turkish drama episode guides urdu subtitles',
    secondaryKeywords: ['turkish drama episode guides', 'urdu subtitles', 'episode summary and notes', 'subtitle and dubbing updates', 'teskilat urdu', 'mehmed fetihler sultani urdu'],
    canonicalUrl: 'https://feviqo.com/dramas',
    ogTitle: 'Turkish Drama Episode Guides & Urdu Subtitles | FEVIQO',
    ogDescription: 'Read episode summaries, cast breakdowns, and Urdu subtitle & dubbing updates for top Turkish dramas on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'WebSite'
  },
  '/membership': {
    path: '/membership',
    pageName: 'FEVIQO VIP Membership',
    seoTitle: 'FEVIQO VIP Membership – Turkish Drama Subtitle & Dubbing Updates',
    metaDescription: 'Join FEVIQO VIP Membership for full access to Turkish drama Urdu dubbing updates, episode notes, and supporter perks for Teşkilat, Mehmed: Fetihler Sultanı, Güneşin Doğduğu Yer, and Yeraltı.',
    focusKeyword: 'FEVIQO VIP Membership',
    secondaryKeywords: ['FEVIQO membership plans', 'Turkish drama subtitle updates', 'FEVIQO VIP'],
    canonicalUrl: 'https://feviqo.com/membership',
    ogTitle: 'FEVIQO VIP Membership – Subtitle & Dubbing Updates',
    ogDescription: 'Join FEVIQO VIP Membership for Turkish drama Urdu dubbing updates and member benefits.',
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
  '/disclaimer': {
    path: '/disclaimer',
    pageName: 'Disclaimer',
    seoTitle: 'Disclaimer | FEVIQO',
    metaDescription: 'FEVIQO is an editorial review, translation, and fan community portal and does not host copyrighted television broadcasts on its servers.',
    focusKeyword: 'FEVIQO disclaimer',
    secondaryKeywords: ['editorial disclaimer', 'fan community portal', 'non-hosting notice', 'copyright disclaimer'],
    canonicalUrl: 'https://feviqo.com/disclaimer',
    ogTitle: 'Disclaimer — FEVIQO',
    ogDescription: 'Read FEVIQO’s editorial, translation, and non-hosting disclaimer.',
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

  // Dynamic drama episode routes
  const teskilatEpMatch = cleanPath.match(/^\/(?:teskilat|teskilat-urdu)\/episode-(\d+)$/);
  if (teskilatEpMatch) {
    const epNum = teskilatEpMatch[1];
    return {
      ...DEFAULT_PAGE_SEO['/teskilat'],
      path: `/teskilat/episode-${epNum}`,
      pageName: `Teskilat Episode ${epNum} Urdu`,
      seoTitle: `Teşkilat Season 7 Episode ${epNum} Urdu – Watch Online HD | FEVIQO`,
      metaDescription: `Watch Teşkilat Season 7 Episode ${epNum} (Bolum ${epNum}) in 1080p HD Urdu Subtitles & Urdu Dubbed on FEVIQO.`,
      focusKeyword: `Teskilat Episode ${epNum} Urdu`,
      canonicalUrl: `https://feviqo.com/teskilat/episode-${epNum}`,
      ogTitle: `Teşkilat Season 7 Episode ${epNum} Urdu – Watch Online HD | FEVIQO`,
      schemaType: 'VideoObject',
    };
  }

  const mehmedEpMatch = cleanPath.match(/^\/(?:mehmed-fetihler-sultani|mehmed)\/episode-(\d+)$/);
  if (mehmedEpMatch) {
    const epNum = mehmedEpMatch[1];
    return {
      ...DEFAULT_PAGE_SEO['/mehmed-fetihler-sultani'],
      path: `/mehmed-fetihler-sultani/episode-${epNum}`,
      pageName: `Mehmed Fetihler Sultani Episode ${epNum} Urdu`,
      seoTitle: `Mehmed: Fetihler Sultanı Episode ${epNum} Urdu – Watch Online HD | FEVIQO`,
      metaDescription: `Watch Mehmed: Fetihler Sultanı Season 4 Episode ${epNum} (Bolum ${epNum}) in 1080p HD Urdu Subtitles & Urdu Dubbed on FEVIQO.`,
      focusKeyword: `Mehmed Episode ${epNum} Urdu`,
      canonicalUrl: `https://feviqo.com/mehmed-fetihler-sultani/episode-${epNum}`,
      ogTitle: `Mehmed: Fetihler Sultanı Episode ${epNum} Urdu – Watch Online HD | FEVIQO`,
      schemaType: 'VideoObject',
    };
  }

  const gunesinEpMatch = cleanPath.match(/^\/gunesin-dogdugu-yer\/episode-(\d+)$/);
  if (gunesinEpMatch) {
    const epNum = gunesinEpMatch[1];
    return {
      ...DEFAULT_PAGE_SEO['/gunesin-dogdugu-yer'],
      path: `/gunesin-dogdugu-yer/episode-${epNum}`,
      pageName: `Gunesin Dogdugu Yer Episode ${epNum} Urdu`,
      seoTitle: `Güneşin Doğduğu Yer Episode ${epNum} Urdu – Watch Online HD | FEVIQO`,
      metaDescription: `Watch Güneşin Doğduğu Yer Episode ${epNum} (Bolum ${epNum}) in 1080p HD Urdu Subtitles & Urdu Dubbed on FEVIQO.`,
      focusKeyword: `Gunesin Dogdugu Yer Episode ${epNum} Urdu`,
      canonicalUrl: `https://feviqo.com/gunesin-dogdugu-yer/episode-${epNum}`,
      ogTitle: `Güneşin Doğduğu Yer Episode ${epNum} Urdu – Watch Online HD | FEVIQO`,
      schemaType: 'VideoObject',
    };
  }

  const yeraltiEpMatch = cleanPath.match(/^\/yeralti\/episode-(\d+)$/);
  if (yeraltiEpMatch) {
    const epNum = yeraltiEpMatch[1];
    return {
      ...DEFAULT_PAGE_SEO['/yeralti'],
      path: `/yeralti/episode-${epNum}`,
      pageName: `Yeralti Episode ${epNum} Urdu Dubbed`,
      seoTitle: `Yeraltı Episode ${epNum} Urdu Dubbed – Watch Online HD | FEVIQO`,
      metaDescription: `Watch Yeraltı Episode ${epNum} in Urdu Dubbed 1080p HD on FEVIQO.`,
      focusKeyword: `Yeralti Episode ${epNum} Urdu Dubbed`,
      canonicalUrl: `https://feviqo.com/yeralti/episode-${epNum}`,
      ogTitle: `Yeraltı Episode ${epNum} Urdu Dubbed – Watch Online HD | FEVIQO`,
      schemaType: 'VideoObject',
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

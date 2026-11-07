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
    pageName: 'Teskilat Season 7 Main Page',
    seoTitle: 'Teşkilat Season 7 Urdu Subtitles | Episodes & Story Guides | FEVIQO',
    metaDescription: 'Explore Teşkilat Season 7 on FEVIQO with episode guides, story recaps, and Urdu subtitles. Find the latest available episodes and follow the story of Altay and his team.',
    focusKeyword: 'Teşkilat Season 7 Urdu subtitles',
    secondaryKeywords: [
      'Teşkilat Season 7',
      'Teskilat Urdu subtitles',
      'Teskilat Season 7 episodes',
      'Turkish action drama Urdu',
      'Altay Yalçın series'
    ],
    canonicalUrl: 'https://feviqo.com/teskilat',
    ogTitle: 'Teşkilat Season 7 Urdu Subtitles | Episodes & Story Guides | FEVIQO',
    ogDescription: 'Explore Teşkilat Season 7 on FEVIQO with episode guides, story recaps, and Urdu subtitles.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVSeries'
  },
  '/teskilat/episode-186': {
    path: '/teskilat/episode-186',
    pageName: 'Teskilat Episode 186 Watch Page',
    seoTitle: 'Teskilat Season 7 Episode 2 Urdu Subtitles – Bolum 186',
    metaDescription: 'Watch Teskilat Season 7 Episode 186 Urdu Subtitles. Stream Teskilat Season 7 Episode 2 Urdu Subtitles (Bolum 186) watch online with story recap on FEVIQO.com.',
    focusKeyword: 'teskilat urdu episode 186',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.TURKISH_DRAMA.concat(['teskilat season 7 episode 2 urdu subtitles', 'teskilat episode 186 urdu subtitles', 'teskilat 186 urdu', 'teskilat season 7 episode 186 urdu subtitles', 'teskilat 186 urdu subtitles']),
    canonicalUrl: 'https://feviqo.com/teskilat/episode-186',
    ogTitle: 'Teskilat Season 7 Episode 2 Urdu Subtitles – Bolum 186',
    ogDescription: 'Watch Teskilat Season 7 Episode 186 Urdu Subtitles. Stream Teskilat Season 7 Episode 2 Urdu Subtitles (Bolum 186) watch online with story recap on FEVIQO.com.',
    ogImage: 'https://feviqo.com/images/teskialt186thumbnIL.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/teskilat/episode-187': {
    path: '/teskilat/episode-187',
    pageName: 'Teskilat Episode 187 Watch Page',
    seoTitle: 'Teşkilat Season 7 Episode 3 (Bolum 187) Urdu Subtitles | FEVIQO',
    metaDescription: 'Watch Teşkilat Season 7 Episode 3 (Bolum 187) with Urdu subtitles. Read the episode recap and follow Altay, Azra, and Ender as the story unfolds.',
    focusKeyword: 'Teşkilat episode 187 Urdu subtitles',
    secondaryKeywords: [
      'Teskilat episode 187',
      'Teşkilat Bolum 187',
      'Teskilat Season 7 Episode 3',
      'Altay Azra Ender episode 187',
      'Turkish drama Urdu subtitles'
    ],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-187',
    ogTitle: 'Teşkilat Season 7 Episode 3 (Bolum 187) Urdu Subtitles | FEVIQO',
    ogDescription: 'Watch Teşkilat Season 7 Episode 3 (Bolum 187) with Urdu subtitles. Read the episode recap and follow the story on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/gunesin-dogdugu-yer': {
    path: '/gunesin-dogdugu-yer',
    pageName: 'Gunesin Dogdugu Yer Hub Page',
    seoTitle: 'Gunesin Dogdugu Yer Urdu Subtitles – All Episodes | FEVIQO',
    metaDescription: 'Watch Gunesin Dogdugu Yer Turkish drama in HD Urdu subtitles. Stream all official episodes online with complete story summaries and recaps on FEVIQO.',
    focusKeyword: 'gunesin dogdugu yer urdu',
    secondaryKeywords: ['gunesin dogdugu yer', 'gunesin dogdugu yer urdu', 'gunesin dogdugu yer episodes', 'gunesin dogdugu yer watch online', 'turkish drama urdu'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer',
    ogTitle: 'Gunesin Dogdugu Yer Urdu Subtitles – All Episodes | FEVIQO',
    ogDescription: 'Watch Gunesin Dogdugu Yer Turkish drama in HD Urdu subtitles. Stream all official episodes online with complete story summaries and recaps on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVSeries'
  },

  '/gunesin-dogdugu-yer/episode-3': {
    path: '/gunesin-dogdugu-yer/episode-3',
    pageName: 'Gunesin Dogdugu Yer Episode 3 Watch Page',
    seoTitle: 'Gunesin Dogdugu Yer Episode 3 Urdu Subtitles – Bolum 3',
    metaDescription: 'Watch Gunesin Dogdugu Yer Episode 3 in HD Urdu Subtitles. Follow the intense family secrets, rivalries, and drama online with full story recaps on FEVIQO.',
    focusKeyword: 'gunesin dogdugu yer episode 3 urdu',
    secondaryKeywords: ['gunesin dogdugu yer episode 3', 'gunesin dogdugu yer episode 3 urdu', 'gunesin dogdugu yer 3 urdu', 'gunesin dogdugu yer bolum 3'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-3',
    ogTitle: 'Gunesin Dogdugu Yer Episode 3 Urdu Subtitles – Bolum 3',
    ogDescription: 'Watch Gunesin Dogdugu Yer Episode 3 in HD Urdu Subtitles. Follow the intense family secrets, rivalries, and drama online with full story recaps on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1VsQl3XReqSBLh5sk5UbalpsaVoSs0ggj',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/gunesin-dogdugu-yer/episode-4': {
    path: '/gunesin-dogdugu-yer/episode-4',
    pageName: 'Gunesin Dogdugu Yer Episode 4 Watch Page',
    seoTitle: 'Gunesin Dogdugu Yer Episode 4 Urdu Subtitles | Bolum 4',
    metaDescription: 'Watch Gunesin Dogdugu Yer Episode 4 Urdu Subtitles (Bolum 4) in HD on FEVIQO. Follow the latest episode of this Turkish drama with Urdu subtitles and enjoy a high-quality viewing experience.',
    focusKeyword: 'Gunesin Dogdugu Yer Episode 4 Urdu Subtitles',
    secondaryKeywords: [
      'Gunesin Dogdugu Yer Episode 4', 'Gunesin Dogdugu Yer Episode 4 Urdu Subtitles', 'Gunesin Dogdugu Yer Bolum 4', 'Gunesin Dogdugu Yer Bolum 4 Urdu Subtitles', 'Gunesin Dogdugu Yer Episode 4 Urdu', 'Gunesin Dogdugu Yer Season 1 Episode 4', 'Gunesin Dogdugu Yer Season 1 Episode 4 Urdu Subtitles', 'Gunesin Dogdugu Yer Urdu Subtitles', 'Gunesin Dogdugu Yer English Subtitles', 'Gunesin Dogdugu Yer Latest Episode', 'Gunesin Dogdugu Yer Full Episode', 'Gunesin Dogdugu Yer Watch Online', 'Gunesin Dogdugu Yer HD', 'Gunesin Dogdugu Yer 1080p', 'Gunesin Dogdugu Yer Turkish Drama', 'Gunesin Dogdugu Yer Series Urdu Subtitles', 'Gunesin Dogdugu Yer Turkish Series', 'Gunesin Dogdugu Yer Episode 4 Watch Online', 'Gunesin Dogdugu Yer Episode 4 HD', 'Gunesin Dogdugu Yer Episode 4 Online', 'Gunesin Dogdugu Yer New Episode', 'Gunesin Dogdugu Yer Bolum 4 Urdu', 'Episode 4 Urdu Subtitles', 'Bolum 4 Urdu Subtitles', 'Turkish Drama Episode 4 Urdu Subtitles', 'Turkish Series Episode 4 Urdu Subtitles', 'Turkish Dramas Urdu Subtitles', 'Turkish Series with Urdu Subtitles', 'Turkish Dramas in Pakistan', 'Watch Turkish Dramas Online', 'Latest Turkish Drama Urdu Subtitles', 'Turkish Series Online HD', 'Turkish Drama Online Free', 'Turkish Series Urdu Translation', 'Turkish Drama Subtitles', 'Urdu Subtitles Online', 'Turkish Shows Urdu Subtitles', 'Latest Turkish Series', 'New Turkish Drama Episodes', 'FEVIQO Gunesin Dogdugu Yer', 'FEVIQO Episode 4', 'FEVIQO Urdu Subtitles', 'FEVIQO Turkish Dramas', 'FEVIQO Turkish Series', 'FEVIQO', 'Gunesin Dogdugu Yer FEVIQO', 'Gunesin Dogdugu Yer Episode 4 FEVIQO', 'watch Gunesin Dogdugu Yer on FEVIQO', 'Turkish historical series Urdu subtitles', 'Turkish action drama Urdu subtitles', 'Turkish drama streaming', 'HD Turkish series', 'Turkish drama episodes online', 'Turkish series latest episodes', 'Urdu subtitle series online', 'Turkish entertainment Pakistan', 'Turkish drama fans Pakistan', 'premium streaming experience', 'online video streaming', 'digital entertainment platforms', 'OTT streaming platforms', 'online series episodes', 'Gunesin Dogdugu Yer Episode 3 Urdu Subtitles', 'Gunesin Dogdugu Yer Episode 2 Urdu Subtitles', 'Gunesin Dogdugu Yer Episode 1 Urdu Subtitles', 'Gunesin Dogdugu Yer Season 1 Urdu Subtitles', 'Mehmed Fetihler Sultani', 'Kurulus Osman', 'Salahuddin Ayyubi', 'Teskilat', 'Turkish Dramas with Urdu Subtitles', 'Turkish Series with English Subtitles'
    ],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-4',
    ogTitle: 'Gunesin Dogdugu Yer Episode 4 Urdu Subtitles | Bolum 4',
    ogDescription: 'Watch Gunesin Dogdugu Yer Episode 4 Urdu Subtitles (Bolum 4) in HD on FEVIQO. Follow the latest episode of this Turkish drama with Urdu subtitles and enjoy a high-quality viewing experience.',
    ogImage: 'https://lh3.googleusercontent.com/d/1KaS-64iPUBSZ2gtZ3B2tj3bwmAUFa6gV',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/gunesin-dogdugu-yer/episode-7': {
    path: '/gunesin-dogdugu-yer/episode-7',
    pageName: 'Gunesin Dogdugu Yer Episode 7 Watch Page',
    seoTitle: 'Gunesin Dogdugu Yer Episode 7 Urdu Subtitles | Bolum 7',
    metaDescription: 'Watch Gunesin Dogdugu Yer Episode 7 Urdu Subtitles (Bolum 7) in HD on FEVIQO. High-stakes family secrets and dramatic betrayals reach an explosive peak in the new episode.',
    focusKeyword: 'Gunesin Dogdugu Yer Episode 7 Urdu Subtitles',
    secondaryKeywords: [
      'Gunesin Dogdugu Yer Episode 7', 'Gunesin Dogdugu Yer Episode 7 Urdu Subtitles', 'Gunesin Dogdugu Yer Bolum 7', 'Gunesin Dogdugu Yer Bolum 7 Urdu Subtitles', 'Gunesin Dogdugu Yer Episode 7 Urdu', 'Gunesin Dogdugu Yer Season 1 Episode 7', 'Gunesin Dogdugu Yer Season 1 Episode 7 Urdu Subtitles', 'Gunesin Dogdugu Yer Urdu Subtitles', 'Gunesin Dogdugu Yer Watch Online', 'Gunesin Dogdugu Yer HD', 'Gunesin Dogdugu Yer 1080p', 'Gunesin Dogdugu Yer Turkish Drama', 'Gunesin Dogdugu Yer Series Urdu Subtitles', 'Gunesin Dogdugu Yer Turkish Series', 'Gunesin Dogdugu Yer Episode 7 Watch Online', 'Gunesin Dogdugu Yer Episode 7 HD', 'FEVIQO Gunesin Dogdugu Yer', 'FEVIQO Episode 7', 'FEVIQO Urdu Subtitles'
    ],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-7',
    ogTitle: 'Gunesin Dogdugu Yer Episode 7 Urdu Subtitles | Bolum 7',
    ogDescription: 'Watch Gunesin Dogdugu Yer Episode 7 Urdu Subtitles (Bolum 7) in HD on FEVIQO. High-stakes family secrets and dramatic betrayals reach an explosive peak in the new episode.',
    ogImage: 'https://lh3.googleusercontent.com/d/137w7jkmYW4bpn4rfdipcJ4gJksnpqeL4',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/gunesin-dogdugu-yer/episode-5': {
    path: '/gunesin-dogdugu-yer/episode-5',
    pageName: 'Gunesin Dogdugu Yer Episode 5 Watch Page',
    seoTitle: 'Gunesin Dogdugu Yer Episode 5 Urdu Subtitles | Bolum 5',
    metaDescription: 'Watch Gunesin Dogdugu Yer Episode 5 Urdu Subtitles (Bolum 5) in HD on FEVIQO. High-stakes family secrets and dramatic betrayals reach an explosive peak in the new episode.',
    focusKeyword: 'Gunesin Dogdugu Yer Episode 5 Urdu Subtitles',
    secondaryKeywords: [
      'Gunesin Dogdugu Yer Episode 5', 'Gunesin Dogdugu Yer Episode 5 Urdu Subtitles', 'Gunesin Dogdugu Yer Bolum 5', 'Gunesin Dogdugu Yer Bolum 5 Urdu Subtitles', 'Gunesin Dogdugu Yer Episode 5 Urdu', 'Gunesin Dogdugu Yer Season 1 Episode 5', 'Gunesin Dogdugu Yer Season 1 Episode 5 Urdu Subtitles', 'Gunesin Dogdugu Yer Urdu Subtitles', 'Gunesin Dogdugu Yer English Subtitles', 'Gunesin Dogdugu Yer Latest Episode', 'Gunesin Dogdugu Yer Full Episode', 'Gunesin Dogdugu Yer Watch Online', 'Gunesin Dogdugu Yer HD', 'Gunesin Dogdugu Yer 1080p', 'Gunesin Dogdugu Yer Turkish Drama', 'Gunesin Dogdugu Yer Series Urdu Subtitles', 'Gunesin Dogdugu Yer Turkish Series', 'Gunesin Dogdugu Yer Episode 5 Watch Online', 'Gunesin Dogdugu Yer Episode 5 HD', 'Gunesin Dogdugu Yer Episode 5 Online', 'Gunesin Dogdugu Yer New Episode', 'Gunesin Dogdugu Yer Bolum 5 Urdu', 'Episode 5 Urdu Subtitles', 'Bolum 5 Urdu Subtitles', 'Turkish Drama Episode 5 Urdu Subtitles', 'FEVIQO Gunesin Dogdugu Yer', 'FEVIQO Episode 5', 'FEVIQO Urdu Subtitles'
    ],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-5',
    ogTitle: 'Gunesin Dogdugu Yer Episode 5 Urdu Subtitles | Bolum 5',
    ogDescription: 'Watch Gunesin Dogdugu Yer Episode 5 Urdu Subtitles (Bolum 5) in HD on FEVIQO. High-stakes family secrets and dramatic betrayals reach an explosive peak in the new episode.',
    ogImage: 'https://lh3.googleusercontent.com/d/1ww1YXzsV-PBId4z9g6oPZSYHVXiDOiPO',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/teskilat/episode-189': {
    path: '/teskilat/episode-189',
    pageName: 'Teskilat Episode 189 Watch Page',
    seoTitle: 'Teskilat Season 7 Episode 189 Urdu Subtitles (Full Episode) – Teskilat 189. Bölüm Urdu | FEVIQO',
    metaDescription: 'Watch Teşkilat Episode 189 with Urdu subtitles. Framed for high treason, Altay Yalçın escapes custody to clear his name, leading to a shocking Swiss showdown.',
    focusKeyword: 'Teskilat 189 Urdu',
    secondaryKeywords: [
      'Teskilat Episode 189 Urdu Subtitles', 'Teskilat Bolum 189 Urdu', 'Drama Teskilat Season 7 Episode 189', 'Teskilat 189 Urdu Sub', 'Altay Yalcin Kurt Bey', 'Teskilat Episode 189 Full Story', 'teskilat season 7 episode 5', 'تشکیلات قسط 189 اردو', 'تشکیلات سیزن 7 قسط 189 اردو سب ٹائٹلز', 'Teskilat Season 7', 'Teskilat Urdu Subtitles', 'Teşkilat Season 7 Urdu', 'Kurt Bey Return', 'Haritacılar', 'Tugrul Baskan', 'Swiss Rooftop Betrayal', 'Korkut Hamdi Osman Selven'
    ],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-189',
    ogTitle: 'Teskilat Season 7 Episode 189 Urdu Subtitles (Full Episode) – Teskilat 189. Bölüm Urdu | FEVIQO',
    ogDescription: 'Watch Teşkilat Episode 189 with Urdu subtitles. Framed for high treason, Altay Yalçın escapes custody to clear his name, leading to a shocking Swiss showdown.',
    ogImage: 'https://lh3.googleusercontent.com/d/15lsrpRxnIw6C491oFLSXMXCC50o2ByfC',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/teskilat/episode-188': {
    path: '/teskilat/episode-188',
    pageName: 'Teskilat Episode 188 Watch Page',
    seoTitle: 'Teskilat Season 7 Episode 4 Urdu Subtitles - Bolum 188 Ender Rescue | FEVIQO',
    metaDescription: 'Watch Teskilat Season 7 Episode 4 Urdu Subtitles (Bolum 188). Altay closes in on Ender as suspicion around Azra grows and Korkut corners Yahya.',
    focusKeyword: 'Teskilat Season 7 Episode 4 Urdu Subtitles',
    secondaryKeywords: [
      'Teskilat Season 7', 'Teskilat Season 7 Urdu Subtitles', 'Teskilat Urdu Subtitles', 'Teşkilat Season 7 Urdu', 'Teskilat Season 7 Watch Online', 'Teskilat Episode 185 Urdu Subtitles', 'Teskilat Bolum 185 Urdu', 'Altay Teskilat Season 7', 'Korkut Teskilat', 'Turkish Series Urdu Subtitles', 'Turkish Action Series Urdu', 'Turkish Intelligence Series', 'TRT1 Teskilat', 'Teskilat New Season Urdu', 'Teskilat NiaziPlay', 'Teskilat Season 7 Episode 4 Urdu Subtitles', 'Teskilat Episode 188 Urdu Subtitles', 'Teskilat Bolum 188 Urdu', 'Teskilat Season 7 Urdu', 'Teskilat Episode 4 Urdu', 'Teskilat 188 Urdu', 'Altay Ender Episode 188', 'Azra Teskilat Season 7', 'Korkut Yahya Episode 188', 'Bahar Yahya Teskilat', 'Ender Rescue Teskilat', 'TRT1 Teskilat Episode 188'
    ],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-188',
    ogTitle: 'Teskilat Season 7 Episode 4 Urdu Subtitles - Bolum 188 Ender Rescue | FEVIQO',
    ogDescription: 'Watch Teskilat Season 7 Episode 4 Urdu Subtitles (Bolum 188). Altay closes in on Ender as suspicion around Azra grows and Korkut corners Yahya.',
    ogImage: 'https://lh3.googleusercontent.com/d/1FXGXBZcts9bp3XdPmqI_pGytI0GAKYDc',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/mehmed-fetihler-sultani/episode-90': {
    path: '/mehmed-fetihler-sultani/episode-90',
    pageName: 'Mehmed Fetihler Sultani Episode 90 Watch Page',
    seoTitle: 'Mehmed Season 4 Episode 90 Urdu Subtitles | Bolum 90 - FEVIQO',
    metaDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 90 Urdu Subtitles (Bolum 90) in 1080p HD on FEVIQO. Sultan Mehmed II confronts an imperial crisis as enemy armies assemble and secret betrayals unfold.',
    focusKeyword: 'Mehmed Season 4 Episode 90 Urdu Subtitles',
    secondaryKeywords: [
      'Mehmed Season 4 Episode 90 Urdu Subtitles', 'Mehmed Season 4 Episode 90', 'Urdu Subtitles', 'Mehmed Fetihler Sultani Season 4 Episode 90', 'Mehmed Fetihler Sultani Season 4 Episode 90 Urdu Subtitles', 'Mehmed Fetihler Sultani Episode 90', 'Mehmed Fetihler Sultani Episode 90 Urdu Subtitles', 'Mehmed Fetihler Sultani Bolum 90', 'Mehmed Bolum 90 Urdu Subtitles', 'Mehmed Episode 90 Urdu', 'Mehmed 90 Urdu', 'Sultan Mehmed Season 4 Episode 90 Urdu', 'Sultan Muhammad Fateh Season 4 Episode 90 Urdu Subtitles', 'Mehmed Fetihler Sultani Season 4 Episodes', 'Sultan Mehmed Series Urdu', 'Fatih Sultan Mehmed Series', 'Turkish Historical Series Urdu Subtitles', 'FEVIQO Mehmed Season 4 Episode 90', 'FEVIQO Mehmed', 'FEVIQO Episode 90'
    ],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani/episode-90',
    ogTitle: 'Mehmed Season 4 Episode 90 Urdu Subtitles | Bolum 90 - FEVIQO',
    ogDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 90 Urdu Subtitles (Bolum 90) in 1080p HD on FEVIQO. Sultan Mehmed II confronts an imperial crisis as enemy armies assemble and secret betrayals unfold.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Ql7rSRtgL6HfxOyO-BSfPN8CdfUooJ1p',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/mehmed-fetihler-sultani/episode-89': {
    path: '/mehmed-fetihler-sultani/episode-89',
    pageName: 'Mehmed Fetihler Sultani Episode 89 Watch Page',
    seoTitle: 'Mehmed Season 4 Episode 89 Urdu Subtitles | Bolum 89 - FEVIQO',
    metaDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 89 Urdu Subtitles (Bolum 89) in 1080p HD on FEVIQO. Sultan Mehmed II executes a decisive tactical siege as secret alliances threaten the empire.',
    focusKeyword: 'Mehmed Season 4 Episode 89 Urdu Subtitles',
    secondaryKeywords: [
      'Mehmed Season 4 Episode 89 Urdu Subtitles', 'Mehmed Season 4 Episode 89', 'Urdu Subtitles', 'Mehmed Fetihler Sultani Season 4 Episode 89', 'Mehmed Fetihler Sultani Season 4 Episode 89 Urdu Subtitles', 'Mehmed Fetihler Sultani Episode 89', 'Mehmed Fetihler Sultani Episode 89 Urdu Subtitles', 'Mehmed Fetihler Sultani Bolum 89', 'Mehmed Bolum 89 Urdu Subtitles', 'Mehmed Episode 89 Urdu', 'Mehmed 89 Urdu', 'Sultan Mehmed Season 4 Episode 89 Urdu', 'Sultan Muhammad Fateh Season 4 Episode 89 Urdu Subtitles', 'Mehmed Fetihler Sultani Season 4 Episodes', 'Sultan Mehmed Series Urdu', 'Fatih Sultan Mehmed Series', 'Turkish Historical Series Urdu Subtitles', 'FEVIQO Mehmed Season 4 Episode 89', 'FEVIQO Mehmed', 'FEVIQO Episode 89'
    ],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani/episode-89',
    ogTitle: 'Mehmed Season 4 Episode 89 Urdu Subtitles | Bolum 89 - FEVIQO',
    ogDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 89 Urdu Subtitles (Bolum 89) in 1080p HD on FEVIQO. Sultan Mehmed II executes a decisive tactical siege as secret alliances threaten the empire.',
    ogImage: 'https://lh3.googleusercontent.com/d/15DClk9e82Zvbxbjx4_wOMcSa298IFcR5',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/mehmed-fetihler-sultani/episode-88': {
    path: '/mehmed-fetihler-sultani/episode-88',
    pageName: 'Mehmed Fetihler Sultani Episode 88 Watch Page',
    seoTitle: 'Mehmed Season 4 Episode 88 Urdu Subtitles | Bolum 88 - FEVIQO',
    metaDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 88 Urdu Subtitles (Bolum 88) in HD on FEVIQO. Sultan Mehmed II prepares an imperial campaign as court rivalries escalate.',
    focusKeyword: 'Mehmed Season 4 Episode 88 Urdu Subtitles',
    secondaryKeywords: [
      'Mehmed Season 4 Episode 88 Urdu Subtitles', 'Mehmed Season 4 Episode 88', 'Urdu Subtitles', 'Mehmed Fetihler Sultani Season 4 Episode 88', 'Mehmed Fetihler Sultani Season 4 Episode 88 Urdu Subtitles', 'Mehmed Fetihler Sultani Episode 88', 'Mehmed Fetihler Sultani Episode 88 Urdu Subtitles', 'Mehmed Fetihler Sultani Bolum 88', 'Mehmed Bolum 88 Urdu Subtitles', 'Mehmed Episode 88 Urdu', 'Mehmed Season 4 Episode 88', 'Mehmed Season 4 Episode 88 Urdu Subtitles', 'Mehmed 88 Urdu', 'Sultan Mehmed Season 4 Episode 88 Urdu', 'Mehmed Season 4 Ep 88 Urdu', 'Sultan Muhammad Fateh Season 4 Episode 88 Urdu Subtitles', 'Mehmed Fetihler Sultani Season 4 Episodes', 'Mehmed Season 4 Latest Episode', 'Sultan Mehmed Series Urdu', 'Fatih Sultan Mehmed Series', 'Turkish Historical Series Urdu Subtitles', 'Ottoman Empire Series', 'Turkish Drama Urdu Subtitles', 'FEVIQO Mehmed Season 4 Episode 88', 'FEVIQO Mehmed', 'FEVIQO Episode 88'
    ],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani/episode-88',
    ogTitle: 'Mehmed Season 4 Episode 88 Urdu Subtitles | Bolum 88 - FEVIQO',
    ogDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 88 Urdu Subtitles (Bolum 88) in HD on FEVIQO. Sultan Mehmed II prepares an imperial campaign as court rivalries escalate.',
    ogImage: 'https://lh3.googleusercontent.com/d/1w3UK-ZWuESJb-S4r-J_ChUTknl-yaWSq',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/mehmed-fetihler-sultani': {
    path: '/mehmed-fetihler-sultani',
    pageName: 'Mehmed Fetihler Sultani Hub Page',
    seoTitle: 'Mehmed: Fetihler Sultani Season 4 | Urdu Subtitles & Episodes | FEVIQO',
    metaDescription: 'Explore Mehmed: Fetihler Sultani Season 4 on FEVIQO with episode guides, story recaps, and Urdu subtitles. Browse available episodes and follow Sultan Mehmed II’s campaign.',
    focusKeyword: 'Mehmed Fetihler Sultani Urdu subtitles',
    secondaryKeywords: [
      'Mehmed Fetihler Sultani Season 4',
      'Mehmed Urdu subtitles',
      'Sultan Mehmed series',
      'Mehmed Season 4 episodes',
      'Ottoman historical drama'
    ],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani',
    ogTitle: 'Mehmed: Fetihler Sultani Season 4 | Urdu Subtitles & Episodes | FEVIQO',
    ogDescription: 'Explore Mehmed: Fetihler Sultani Season 4 on FEVIQO with episode guides, story recaps, and Urdu subtitles.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Je_-r1ngLfH15ryeju3suvZC2W0YSTL1',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVSeries'
  },
  '/mehmed-fetihler-sultani/episode-87': {
    path: '/mehmed-fetihler-sultani/episode-87',
    pageName: 'Mehmed Episode 87 Watch Page',
    seoTitle: 'Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87',
    metaDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.',
    focusKeyword: 'Mehmed Season 4 Episode 4 Urdu Subtitles',
    secondaryKeywords: [
      'Mehmed Fetihler Sultani Season 4 Episode 4', 'Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles', 'Mehmed Fetihler Sultani Bolum 87', 'mehmed 87 urdu', 'mehmed episode 87 urdu', 'memhed urdu', 'Mehmed Episode 87 Urdu Subtitles', 'Mehmed Bolum 87 Urdu', 'Episode 87 Urdu', 'Episode 87', 'Mehmed Fetihler Sultani Season 4 Urdu Subtitles', 'Mehmed Fetihler Sultani Season 4 English Subtitles', 'Mehmed Season 4 Urdu Subtitles', 'Mehmed Season 4 English Subtitles', 'Mehmed Fetihler Sultani Urdu Subtitles', 'Mehmed Fetihler Sultani English Subtitles', 'Mehmed Fetihler Sultani Season 4 Episodes', 'Mehmed Season 4 Latest Episode', 'Sultan Mehmed Series Urdu', 'Sultan Mehmed Series English', 'Fatih Sultan Mehmed Series', 'Turkish Historical Series Urdu Subtitles', 'Turkish Historical Drama English Subtitles', 'Ottoman Empire Series', 'Ottoman History Drama', 'Sultan Mehmed II Drama', 'Turkish Series Online', 'Turkish Drama Urdu Subtitles', 'Historical Series Online', 'FEVIQO Mehmed Season 4', 'Mehmed Fetihler Sultani FEVIQO', 'FEVIQO Turkish Dramas', 'FEVIQO', 'NiaziPlay Mehmed Season 4', 'Mehmed Fetihler Sultani NiaziPlay', 'premium streaming services', 'online video streaming', 'digital entertainment platforms', 'OTT streaming platforms', 'video streaming services', 'cloud video hosting', 'online subscription services', 'streaming technology', 'VPN streaming services', 'Mehmed Season 4 Episode 4 Urdu Subtitles', 'Mehmed Season 3 Episode 87', 'Sultan Muhammad Fateh Episode 87', 'Sultan Muhammad Fateh Bolum 87', 'NiaziPlay', 'Salahuddin Ayyubi Series', 'Kurulus Osman Season 5 in Urdu Subtitles', 'Kurulus Osman Season 6 Urdu & English Subtitles', 'Teskilat Season 4 Urdu Subtitles', 'Mehmed: Fetihler Sultani - Urdu & English Subtitles', 'Al Sancak | Sipahi', 'Alparslan: Büyük Selçuklu', 'Ates Kuslari', 'Barbarosslar', 'Destan', 'Ertugrul Ghazi', 'Keiki Sniper', 'Kosem Sultan', 'Mendirman Jaloliddin Khawarzam', 'Mevlana Celaleddin Rumi', 'Soz Series', 'Sultan Abdulhamid', 'Sultan Mehmat Fatih', 'The Pit (Cukur)', 'Turkish Dramas', 'Yunus Emre', 'Turkish series with Urdu subtitles', 'watch Turkish dramas online', 'historical Turkish series in Urdu', 'Ottoman Empire series with English subtitles', 'Islamic history dramas in Urdu', 'Turkish action series with Urdu dubbing', 'latest Turkish series 2024', 'Urdu dubbed Turkish historical dramas', 'stream Turkish series in HD', 'family-friendly Turkish dramas', 'Turkish war series with Urdu subtitles', 'best Turkish series to watch online', 'Turkish dramas based on true stories', 'top-rated Turkish series in Urdu', 'Turkish romantic dramas with English subtitles', 'Turkish thriller series in Urdu', 'online streaming of Turkish historical series', 'Turkish series with dual subtitles', 'popular Turkish dramas in Pakistan', 'Turkish series episodes in Urdu', 'best streaming platforms for Turkish series', 'online education games for kids', 'top adventure games for adults', 'fitness and health articles', 'latest technology news articles', 'financial advice for families', 'home improvement articles', 'educational articles for students', 'html5 games', 'games for children'
    ],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani/episode-87',
    ogTitle: 'Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87',
    ogDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.',
    ogImage: 'https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/dramas': {
    path: '/dramas',
    pageName: 'Turkish Dramas Directory',
    seoTitle: 'Turkish Drama Urdu Subtitles - Watch All Episodes HD | FEVIQO',
    metaDescription: 'Stream premium Turkish TV series and dramas with high-fidelity Urdu subtitles online. Discover trending shows like Teskilat & Gunesin Dogdugu Yer.',
    focusKeyword: 'turkish drama urdu subtitles',
    secondaryKeywords: ['turkish dramas', 'urdu subtitles', 'watch turkish series', 'historical dramas', 'teskilat urdu', 'gunesin dogdugu yer urdu'],
    canonicalUrl: 'https://feviqo.com/dramas',
    ogTitle: 'Turkish Drama Urdu Subtitles - Watch All Episodes HD | FEVIQO',
    ogDescription: 'Stream premium Turkish TV series and dramas with high-fidelity Urdu subtitles online. Discover trending shows like Teskilat & Gunesin Dogdugu Yer.',
    ogImage: 'https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVSeries'
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
  '/privacy': {
    path: '/privacy',
    pageName: 'Privacy Policy',
    seoTitle: 'Privacy Policy | FEVIQO',
    metaDescription: 'Read how FEVIQO handles personal information, website data, cookies, and privacy requests.',
    focusKeyword: 'FEVIQO privacy policy',
    secondaryKeywords: ['privacy', 'data protection', 'cookies'],
    canonicalUrl: 'https://feviqo.com/privacy',
    ogTitle: 'Privacy Policy — FEVIQO',
    ogDescription: 'Information about FEVIQO privacy practices and website data.',
    ogImage: 'https://feviqo.com/feviqo1.png',
    robots: 'index, follow',
    schemaType: 'WebSite'
  },
  '/terms': {
    path: '/terms',
    pageName: 'Terms of Service',
    seoTitle: 'Terms of Service | FEVIQO',
    metaDescription: 'Read the terms governing access to and use of FEVIQO services and website.',
    focusKeyword: 'FEVIQO terms of service',
    secondaryKeywords: ['terms of use', 'service terms'],
    canonicalUrl: 'https://feviqo.com/terms',
    ogTitle: 'Terms of Service — FEVIQO',
    ogDescription: 'Terms governing use of FEVIQO services and website.',
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
  }
};

const STORAGE_KEY = 'feviqo_seo_overrides_v1';

function formatCanonicalUrl(url: string): string {
  if (!url) return 'https://feviqo.com/';
  try {
    const u = new URL(url);
    if (!u.pathname.endsWith('/') && !u.pathname.includes('.')) {
      u.pathname += '/';
    }
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

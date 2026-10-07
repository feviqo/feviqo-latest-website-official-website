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
  schemaType: 'WebSite' | 'Organization' | 'Service' | 'TVEpisode' | 'TVSeries' | 'BreadcrumbList' | 'VideoObject';
  customJsonLd?: string;
}

export const DEFAULT_PAGE_SEO: Record<string, PageSEOConfig> = {
  '/': {
    path: '/',
    pageName: 'Home Page',
    seoTitle: 'Feviqo — Unlimited Video Editing Services | Flat-rate Video Editing Agency',
    metaDescription: 'Scale your content with FEVIQO unlimited video editing. Dedicated professional editors, flat monthly rates, 24-48h turnaround for creators & brands.',
    focusKeyword: 'unlimited video editing services',
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
      'Teskilat Urdu Portal',
      'Teskilat Season 7 Urdu Subtitles'
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
    seoTitle: 'Teskilat Season 7 Episode 3 Urdu Subtitles - Bolum 187 Azra Betrayal',
    metaDescription: 'Watch Teskilat Season 7 Episode 3 Urdu Subtitles (Bolum 187). Altay hunts Azra and risks everything to rescue Ender as new traps close in.',
    focusKeyword: 'Teskilat Season 7 Episode 3 Urdu Subtitles',
    secondaryKeywords: [
      'Teskilat Season 7', 'Teskilat Season 7 Urdu Subtitles', 'Teskilat Urdu Subtitles', 'Teşkilat Season 7 Urdu', 'Teskilat Season 7 Watch Online', 'Teskilat Episode 185 Urdu Subtitles', 'Teskilat Bolum 185 Urdu', 'Altay Teskilat Season 7', 'Korkut Teskilat', 'Turkish Series Urdu Subtitles', 'Turkish Action Series Urdu', 'Turkish Intelligence Series', 'TRT1 Teskilat', 'Teskilat New Season Urdu', 'Teskilat NiaziPlay', 'Teskilat Season 7 Episode 3 Urdu Subtitles', 'Teskilat Episode 187 Urdu Subtitles', 'Teskilat Bolum 187 Urdu', 'Teskilat Season 7 Urdu', 'Teskilat Episode 3 Urdu', 'Teskilat 187 Urdu', 'Altay Ender Episode 187', 'Azra Betrayal Teskilat', 'Korkut Bahar Episode 187', 'Yahya Teskilat Season 7', 'TRT1 Teskilat Episode 187'
    ],
    canonicalUrl: 'https://feviqo.com/teskilat',
    ogTitle: 'Teskilat Season 7 Episode 3 Urdu Subtitles - Bolum 187 Azra Betrayal',
    ogDescription: 'Watch Teskilat Season 7 Episode 3 Urdu Subtitles (Bolum 187). Altay hunts Azra and risks everything to rescue Ender as new traps close in.',
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
    seoTitle: 'Teskilat Season 7 Episode 3 Urdu Subtitles - Bolum 187 Azra Betrayal',
    metaDescription: 'Watch Teskilat Season 7 Episode 3 Urdu Subtitles (Bolum 187). Altay hunts Azra and risks everything to rescue Ender as new traps close in.',
    focusKeyword: 'Teskilat Season 7 Episode 3 Urdu Subtitles',
    secondaryKeywords: [
      'Teskilat Season 7', 'Teskilat Season 7 Urdu Subtitles', 'Teskilat Urdu Subtitles', 'Teşkilat Season 7 Urdu', 'Teskilat Season 7 Watch Online', 'Teskilat Episode 185 Urdu Subtitles', 'Teskilat Bolum 185 Urdu', 'Altay Teskilat Season 7', 'Korkut Teskilat', 'Turkish Series Urdu Subtitles', 'Turkish Action Series Urdu', 'Turkish Intelligence Series', 'TRT1 Teskilat', 'Teskilat New Season Urdu', 'Teskilat NiaziPlay', 'Teskilat Season 7 Episode 3 Urdu Subtitles', 'Teskilat Episode 187 Urdu Subtitles', 'Teskilat Bolum 187 Urdu', 'Teskilat Season 7 Urdu', 'Teskilat Episode 3 Urdu', 'Teskilat 187 Urdu', 'Altay Ender Episode 187', 'Azra Betrayal Teskilat', 'Korkut Bahar Episode 187', 'Yahya Teskilat Season 7', 'Turkish Series Urdu Subtitles', 'Teskilat NiaziPlay', 'TRT1 Teskilat Episode 187', 'Salahuddin Ayyubi Series', 'Kurulus Osman Season 5 in Urdu Subtitles', 'Kurulus Osman Season 6 Urdu & English Subtitles', 'Teskilat Season 4 Urdu Subtitles', 'Mehmed: Fetihler Sultani - Urdu & English Subtitles', 'Al Sancak | Sipahi', 'Alparslan: Büyük Selçuklu', 'Ates Kuslari', 'Barbarosslar', 'Destan', 'Ertugrul Ghazi', 'Keiki Sniper', 'Kosem Sultan', 'Mendirman Jaloliddin Khawarzam', 'Mevlana Celaleddin Rumi', 'Soz Series', 'Sultan Abdulhamid', 'Sultan Mehmat Fatih', 'The Pit (Cukur)', 'Turkish Dramas', 'Yunus Emre', 'Turkish series with Urdu subtitles', 'watch Turkish dramas online', 'historical Turkish series in Urdu', 'Ottoman Empire series with English subtitles', 'Islamic history dramas in Urdu', 'Turkish action series with Urdu dubbing', 'latest Turkish series 2024', 'Urdu dubbed Turkish historical dramas', 'stream Turkish series in HD', 'family-friendly Turkish dramas', 'Turkish war series with Urdu subtitles', 'best Turkish series to watch online', 'Turkish dramas based on true stories', 'top-rated Turkish series in Urdu', 'Turkish romantic dramas with English subtitles', 'Turkish thriller series in Urdu', 'online streaming of Turkish historical series', 'Turkish series with dual subtitles', 'popular Turkish dramas in Pakistan', 'Turkish series episodes in Urdu', 'best streaming platforms for Turkish series'
    ],
    canonicalUrl: 'https://feviqo.com/teskilat/episode-187',
    ogTitle: 'Teskilat Season 7 Episode 3 Urdu Subtitles - Bolum 187 Azra Betrayal',
    ogDescription: 'Watch Teskilat Season 7 Episode 3 Urdu Subtitles (Bolum 187). Altay hunts Azra and risks everything to rescue Ender as new traps close in.',
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
  '/gunesin-dogdugu-yer/episode-1': {
    path: '/gunesin-dogdugu-yer/episode-1',
    pageName: 'Gunesin Dogdugu Yer Episode 1 Watch Page',
    seoTitle: 'Gunesin Dogdugu Yer Episode 1 Urdu Subtitles | FEVIQO',
    metaDescription: 'Watch Gunesin Dogdugu Yer Episode 1 in HD Urdu Subtitles. Follow the intense family betrayals and drama watch online with story recaps on FEVIQO.',
    focusKeyword: 'gunesin dogdugu yer episode 1 urdu',
    secondaryKeywords: ['gunesin dogdugu yer episode 1', 'gunesin dogdugu yer episode 1 urdu', 'gunesin dogdugu yer 1 urdu', 'gunesin dogdugu yer bolum 1'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-1',
    ogTitle: 'Gunesin Dogdugu Yer Episode 1 Urdu Subtitles | FEVIQO',
    ogDescription: 'Watch Gunesin Dogdugu Yer Episode 1 in HD Urdu Subtitles. Follow the intense family betrayals and drama watch online with story recaps on FEVIQO.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/gunesin-dogdugu-yer/episode-2': {
    path: '/gunesin-dogdugu-yer/episode-2',
    pageName: 'Gunesin Dogdugu Yer Episode 2 Watch Page',
    seoTitle: 'Gunesin Dogdugu Yer Episode 2 Urdu Subtitles | FEVIQO',
    metaDescription: 'Watch Gunesin Dogdugu Yer Episode 2 in HD Urdu Subtitles. Follow the intense family betrayals and drama watch online with story recaps on FEVIQO.',
    focusKeyword: 'gunesin dogdugu yer episode 2 urdu',
    secondaryKeywords: ['gunesin dogdugu yer episode 2', 'gunesin dogdugu yer episode 2 urdu', 'gunesin dogdugu yer 2 urdu', 'gunesin dogdugu yer bolum 2'],
    canonicalUrl: 'https://feviqo.com/gunesin-dogdugu-yer/episode-2',
    ogTitle: 'Gunesin Dogdugu Yer Episode 2 Urdu Subtitles | FEVIQO',
    ogDescription: 'Watch Gunesin Dogdugu Yer Episode 2 in HD Urdu Subtitles. Follow the intense family betrayals and drama watch online with story recaps on FEVIQO.',
    ogImage: 'https://feviqo.com/images/teskialt186thumbnIL.png',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
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
  '/mehmed-fetihler-sultani': {
    path: '/mehmed-fetihler-sultani',
    pageName: 'Mehmed Fetihler Sultani Hub Page',
    seoTitle: 'Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87',
    metaDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.',
    focusKeyword: 'Mehmed Season 4 Episode 4 Urdu Subtitles',
    secondaryKeywords: [
      'Mehmed Fetihler Sultani Season 4 Episode 4', 'Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles', 'Mehmed Fetihler Sultani Bolum 87', 'mehmed 87 urdu', 'mehmed episode 87 urdu', 'memhed urdu', 'Mehmed Episode 87 Urdu Subtitles', 'Mehmed Bolum 87 Urdu', 'Episode 87 Urdu', 'Episode 87', 'Mehmed Fetihler Sultani Season 4 Urdu Subtitles', 'Mehmed Season 4 Urdu Subtitles', 'Mehmed Fetihler Sultani Urdu Subtitles', 'Sultan Mehmed Series Urdu', 'Fatih Sultan Mehmed Series', 'Turkish Historical Series Urdu Subtitles', 'Ottoman Empire Series', 'Turkish Drama Urdu Subtitles', 'FEVIQO Mehmed Season 4', 'Sultan Muhammad Fateh Episode 87'
    ],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani',
    ogTitle: 'Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87',
    ogDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.',
    ogImage: 'https://lh3.googleusercontent.com/d/1Je_-r1ngLfH15ryeju3suvZC2W0YSTL1',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVSeries'
  },
  '/mehmed': {
    path: '/mehmed',
    pageName: 'Mehmed Fetihler Sultani Hub Page Alias',
    seoTitle: 'Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87',
    metaDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.',
    focusKeyword: 'Mehmed Season 4 Episode 4 Urdu Subtitles',
    secondaryKeywords: [
      'Mehmed Fetihler Sultani Season 4 Episode 4', 'Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles', 'Mehmed Fetihler Sultani Bolum 87', 'mehmed 87 urdu', 'mehmed episode 87 urdu', 'memhed urdu', 'Mehmed Episode 87 Urdu Subtitles', 'Mehmed Bolum 87 Urdu', 'Episode 87 Urdu', 'Episode 87', 'Mehmed Fetihler Sultani Season 4 Urdu Subtitles', 'Mehmed Season 4 Urdu Subtitles', 'Mehmed Fetihler Sultani Urdu Subtitles', 'Sultan Mehmed Series Urdu', 'Fatih Sultan Mehmed Series', 'Turkish Historical Series Urdu Subtitles', 'Ottoman Empire Series', 'Turkish Drama Urdu Subtitles', 'FEVIQO Mehmed Season 4', 'Sultan Muhammad Fateh Episode 87'
    ],
    canonicalUrl: 'https://feviqo.com/mehmed',
    ogTitle: 'Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87',
    ogDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.',
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
  '/mehmed/episode-87': {
    path: '/mehmed/episode-87',
    pageName: 'Mehmed Episode 87 Watch Page Alias',
    seoTitle: 'Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87',
    metaDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.',
    focusKeyword: 'Mehmed Season 4 Episode 4 Urdu Subtitles',
    secondaryKeywords: [
      'Mehmed Fetihler Sultani Season 4 Episode 4', 'Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles', 'Mehmed Fetihler Sultani Bolum 87', 'mehmed 87 urdu', 'mehmed episode 87 urdu', 'memhed urdu', 'Mehmed Episode 87 Urdu Subtitles', 'Mehmed Bolum 87 Urdu', 'Episode 87 Urdu', 'Episode 87', 'Mehmed Fetihler Sultani Season 4 Urdu Subtitles', 'Mehmed Fetihler Sultani Season 4 English Subtitles', 'Mehmed Season 4 Urdu Subtitles', 'Mehmed Season 4 English Subtitles', 'Mehmed Fetihler Sultani Urdu Subtitles', 'Mehmed Fetihler Sultani English Subtitles', 'Mehmed Fetihler Sultani Season 4 Episodes', 'Mehmed Season 4 Latest Episode', 'Sultan Mehmed Series Urdu', 'Sultan Mehmed Series English', 'Fatih Sultan Mehmed Series', 'Turkish Historical Series Urdu Subtitles', 'Turkish Historical Drama English Subtitles', 'Ottoman Empire Series', 'Ottoman History Drama', 'Sultan Mehmed II Drama', 'Turkish Series Online', 'Turkish Drama Urdu Subtitles', 'Historical Series Online', 'FEVIQO Mehmed Season 4', 'Mehmed Fetihler Sultani FEVIQO', 'FEVIQO Turkish Dramas', 'FEVIQO', 'NiaziPlay Mehmed Season 4', 'Mehmed Fetihler Sultani NiaziPlay', 'premium streaming services', 'online video streaming', 'digital entertainment platforms', 'OTT streaming platforms', 'video streaming services', 'cloud video hosting', 'online subscription services', 'streaming technology', 'VPN streaming services', 'Mehmed Season 4 Episode 4 Urdu Subtitles', 'Mehmed Season 3 Episode 87', 'Sultan Muhammad Fateh Episode 87', 'Sultan Muhammad Fateh Bolum 87', 'NiaziPlay', 'Salahuddin Ayyubi Series', 'Kurulus Osman Season 5 in Urdu Subtitles', 'Kurulus Osman Season 6 Urdu & English Subtitles', 'Teskilat Season 4 Urdu Subtitles', 'Mehmed: Fetihler Sultani - Urdu & English Subtitles', 'Al Sancak | Sipahi', 'Alparslan: Büyük Selçuklu', 'Ates Kuslari', 'Barbarosslar', 'Destan', 'Ertugrul Ghazi', 'Keiki Sniper', 'Kosem Sultan', 'Mendirman Jaloliddin Khawarzam', 'Mevlana Celaleddin Rumi', 'Soz Series', 'Sultan Abdulhamid', 'Sultan Mehmat Fatih', 'The Pit (Cukur)', 'Turkish Dramas', 'Yunus Emre', 'Turkish series with Urdu subtitles', 'watch Turkish dramas online', 'historical Turkish series in Urdu', 'Ottoman Empire series with English subtitles', 'Islamic history dramas in Urdu', 'Turkish action series with Urdu dubbing', 'latest Turkish series 2024', 'Urdu dubbed Turkish historical dramas', 'stream Turkish series in HD', 'family-friendly Turkish dramas', 'Turkish war series with Urdu subtitles', 'best Turkish series to watch online', 'Turkish dramas based on true stories', 'top-rated Turkish series in Urdu', 'Turkish romantic dramas with English subtitles', 'Turkish thriller series in Urdu', 'online streaming of Turkish historical series', 'Turkish series with dual subtitles', 'popular Turkish dramas in Pakistan', 'Turkish series episodes in Urdu', 'best streaming platforms for Turkish series', 'online education games for kids', 'top adventure games for adults', 'fitness and health articles', 'latest technology news articles', 'financial advice for families', 'home improvement articles', 'educational articles for students', 'html5 games', 'games for children'
    ],
    canonicalUrl: 'https://feviqo.com/mehmed/episode-87',
    ogTitle: 'Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87',
    ogDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.',
    ogImage: 'https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'TVEpisode'
  },
  '/dramas': {
    path: '/dramas',
    pageName: 'Turkish Dramas Directory',
    seoTitle: 'Turkish Premium TV Series & Dramas Urdu Subtitles | FEVIQO',
    metaDescription: 'Stream premium Turkish TV series and dramas with high-fidelity Urdu subtitles online. Discover trending shows like Teskilat & Gunesin Dogdugu Yer.',
    focusKeyword: 'turkish dramas urdu subtitles',
    secondaryKeywords: ['turkish dramas', 'urdu subtitles', 'watch turkish series', 'historical dramas', 'teskilat urdu', 'gunesin dogdugu yer urdu'],
    canonicalUrl: 'https://feviqo.com/dramas',
    ogTitle: 'Turkish Premium TV Series & Dramas Urdu Subtitles | FEVIQO',
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
    return savedOverrides[cleanPath];
  }

  if (DEFAULT_PAGE_SEO[cleanPath]) {
    return DEFAULT_PAGE_SEO[cleanPath];
  }

  // Dynamic fallback for unlisted routes
  const cleanTitle = pathname.replace('/', '').replace('-', ' ');
  const capitalized = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : 'Page';

  return {
    path: pathname,
    pageName: capitalized,
    seoTitle: `${capitalized} | ${BRAND_SYSTEM.titleSuffix}`,
    metaDescription: `${capitalized} page for FEVIQO Performance Creative Studio. Unlimited video editing and performance ad creatives at scale.`,
    focusKeyword: cleanTitle || 'video editing',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.BRAND,
    canonicalUrl: `https://feviqo.com${pathname}`,
    ogTitle: `${capitalized} — ${BRAND_SYSTEM.name}`,
    ogDescription: BRAND_SYSTEM.positioning,
    ogImage: BRAND_SYSTEM.defaultOgImage,
    robots: 'index, follow',
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

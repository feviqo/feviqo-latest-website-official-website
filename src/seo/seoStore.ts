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
    seoTitle: 'FEVIQO — Unlimited Video Editing Agency | Flat-Rate Post Production Services',
    metaDescription: 'FEVIQO is the premier unlimited video editing agency for content creators, brands, and marketing agencies worldwide. Dedicated video editors, flat monthly rates, 24-48h turnaround, and Turkish drama Urdu portals.',
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
    seoTitle: 'Mehmed Season 4 Episode 89 Urdu Subtitles | Bolum 89 - FEVIQO',
    metaDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 89 Urdu Subtitles (Bolum 89) in 1080p HD on FEVIQO. Sultan Mehmed II executes a decisive tactical siege as secret alliances threaten the empire.',
    focusKeyword: 'Mehmed Season 4 Episode 89 Urdu Subtitles',
    secondaryKeywords: [
      'Mehmed Season 4 Episode 89 Urdu Subtitles', 'Mehmed Season 4 Episode 89', 'Urdu Subtitles', 'Mehmed Fetihler Sultani Season 4 Episode 89', 'Mehmed Fetihler Sultani Season 4 Episode 89 Urdu Subtitles', 'Mehmed Fetihler Sultani Bolum 89', 'mehmed 89 urdu', 'mehmed episode 89 urdu', 'Mehmed Episode 89 Urdu Subtitles', 'Mehmed Bolum 89 Urdu', 'Episode 89 Urdu', 'Mehmed Fetihler Sultani Season 4 Urdu Subtitles', 'Mehmed Season 4 Urdu Subtitles', 'Mehmed Fetihler Sultani Urdu Subtitles', 'Sultan Mehmed Series Urdu', 'Fatih Sultan Mehmed Series', 'Turkish Historical Series Urdu Subtitles', 'Ottoman Empire Series', 'Turkish Drama Urdu Subtitles', 'FEVIQO Mehmed Season 4', 'Sultan Muhammad Fateh Episode 89'
    ],
    canonicalUrl: 'https://feviqo.com/mehmed-fetihler-sultani',
    ogTitle: 'Mehmed Season 4 Episode 89 Urdu Subtitles | Bolum 89 - FEVIQO',
    ogDescription: 'Watch Mehmed Fetihler Sultani Season 4 Episode 89 Urdu Subtitles (Bolum 89) in 1080p HD on FEVIQO. Sultan Mehmed II executes a decisive tactical siege as secret alliances threaten the empire.',
    ogImage: 'https://lh3.googleusercontent.com/d/15DClk9e82Zvbxbjx4_wOMcSa298IFcR5',
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
  '/trending': {
    path: '/trending',
    pageName: 'Trending Editorial Hub',
    seoTitle: 'FEVIQO Trending – What People Are Searching, Watching & Talking About',
    metaDescription: 'Discover timely stories, explainers, updates, and insights on US news, immigration rules, H-1B visas, AI breakthroughs, business, and job market trends on FEVIQO Trending.',
    focusKeyword: 'trending news',
    secondaryKeywords: ['US news', 'H-1B visa 2026', 'US immigration updates', 'AI news', 'tech job market 2026', 'business funding trends', 'feviqo trending'],
    canonicalUrl: 'https://feviqo.com/trending',
    ogTitle: 'FEVIQO Trending – What People Are Searching & Talking About Right Now',
    ogDescription: 'Timely stories, explainers, updates, and insights on the topics shaping the conversation.',
    ogImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'WebSite'
  },
  '/trending/h1b-visa-2026-latest-update': {
    path: '/trending/h1b-visa-2026-latest-update',
    pageName: 'H-1B Visa 2026 Article',
    seoTitle: 'H-1B Visa 2026: Latest Rules, Fees & What Workers Need to Know | FEVIQO Trending',
    metaDescription: 'Complete guide to H-1B Visa 2026 rules, USCIS registration dates, fee updates, and specialty occupation guidelines. Read official immigration policy analysis on FEVIQO.',
    focusKeyword: 'H-1B Visa 2026',
    secondaryKeywords: ['H-1B Visa 2026', 'USCIS H1B rules', 'H-1B lottery 2026', 'US immigration updates', 'specialty occupation visa', 'USCIS fee schedule'],
    canonicalUrl: 'https://feviqo.com/trending/h1b-visa-2026-latest-update',
    ogTitle: 'H-1B Visa 2026: Latest Rules, Fees & What Workers Need to Know',
    ogDescription: 'A detailed breakdown of the latest USCIS rules, lottery registration guidelines, filing fee adjustments, and key compliance requirements.',
    ogImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/us-immigration-updates-this-week': {
    path: '/trending/us-immigration-updates-this-week',
    pageName: 'US Immigration Updates Article',
    seoTitle: 'US Immigration Updates: What Changed This Week? | FEVIQO Trending',
    metaDescription: 'Latest U.S. immigration news, Visa Bulletin priority dates, USCIS processing times, and employment-based policy updates analyzed by FEVIQO.',
    focusKeyword: 'US Immigration Updates',
    secondaryKeywords: ['US Immigration Updates', 'Visa Bulletin', 'USCIS news', 'green card priority dates', 'employment-based green cards'],
    canonicalUrl: 'https://feviqo.com/trending/us-immigration-updates-this-week',
    ogTitle: 'US Immigration Updates: What Changed This Week?',
    ogDescription: 'A weekly roundup of federal policy updates, Department of State Visa Bulletin movements, and processing time adjustments.',
    ogImage: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/latest-ai-news-major-developments': {
    path: '/trending/latest-ai-news-major-developments',
    pageName: 'Latest AI News Article',
    seoTitle: 'Latest AI News & Major Developments 2026 | FEVIQO Trending',
    metaDescription: 'Explore the latest AI news, multimodal foundation models, autonomous agents, and media technology trends published on FEVIQO Trending.',
    focusKeyword: 'Latest AI News',
    secondaryKeywords: ['Latest AI News', 'AI developments 2026', 'multimodal models', 'autonomous AI agents', 'AI video generation'],
    canonicalUrl: 'https://feviqo.com/trending/latest-ai-news-major-developments',
    ogTitle: 'Latest AI News and Major Developments: Multimodal Autonomous Agents',
    ogDescription: 'An overview of technological breakthroughs in multimodal AI, autonomous reasoning agents, video generation pipelines, and enterprise deployment frameworks.',
    ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/tech-job-market-2026-hiring-trends': {
    path: '/trending/tech-job-market-2026-hiring-trends',
    pageName: 'Tech Job Market Article',
    seoTitle: 'Tech & Remote Job Market 2026: Hiring Trends & Skills | FEVIQO Trending',
    metaDescription: 'In-depth report on tech hiring, remote job opportunities, in-demand AI skills, and compensation trends on FEVIQO Trending.',
    focusKeyword: 'Tech Job Market 2026',
    secondaryKeywords: ['Tech Job Market 2026', 'remote software jobs', 'AI engineer hiring', 'tech compensation', 'hiring trends'],
    canonicalUrl: 'https://feviqo.com/trending/tech-job-market-2026-hiring-trends',
    ogTitle: 'Tech & Remote Job Market 2026: Hiring Trends and In-Demand Skills',
    ogDescription: 'Data-backed analysis of technology hiring, remote work compensation models, AI engineering demand, and key skills sought by top employers.',
    ogImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/gta-6-leaks-cyberleaks-latest-news': {
    path: '/trending/gta-6-leaks-cyberleaks-latest-news',
    pageName: 'GTA 6 Leaks & Cyberleaks Article',
    seoTitle: 'GTA 6 Leaks: Cyberleaks Claims & Confirmed Facts | FEVIQO Trending',
    metaDescription: 'Authoritative analysis of GTA 6 leaks, Cyberleaks claims, Vice City gameplay rumors, and official Rockstar Games announcements.',
    focusKeyword: 'GTA 6 leaks',
    secondaryKeywords: ['GTA 6 leaks', 'GTA 6 leak', 'GTA 6 news', 'GTA 6 updates', 'Cyberleaks', 'Cyberleek website', 'GTA 6 Cyberleaks', 'GTA 6 release date', 'GTA 6 gameplay', 'Rockstar Games'],
    canonicalUrl: 'https://feviqo.com/trending/gta-6-leaks-cyberleaks-latest-news',
    ogTitle: 'GTA 6 Leaks: Latest Claims, Cyberleaks Reports & Confirmed Facts',
    ogDescription: 'An authoritative breakdown analyzing recent viral Grand Theft Auto VI leaks, Cyberleaks website claims, and official statements from Rockstar Games.',
    ogImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/us-deportation-policy-updates-2026': {
    path: '/trending/us-deportation-policy-updates-2026',
    pageName: 'US Deportation Policy Article',
    seoTitle: 'US Deportation & Immigration News 2026: Confirmed vs Proposed Rules | FEVIQO',
    metaDescription: 'Legal analysis of U.S. deportation enforcement, ICE Form I-9 audits, federal court stays, and proposed immigration policies.',
    focusKeyword: 'US deportation',
    secondaryKeywords: ['US deportation', 'deportation news', 'Trump deportations', 'immigration news', 'US immigration updates', 'ICE enforcement'],
    canonicalUrl: 'https://feviqo.com/trending/us-deportation-policy-updates-2026',
    ogTitle: 'US Deportation & Immigration Policy Updates: What Is Confirmed vs Proposed',
    ogDescription: 'An objective policy review distinguishing enacted immigration enforcement measures, court-blocked mandates, and executive proposals.',
    ogImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/cory-wharton-taylor-selfridge-latest-news': {
    path: '/trending/cory-wharton-taylor-selfridge-latest-news',
    pageName: 'Cory Wharton & Taylor Selfridge Article',
    seoTitle: 'Cory Wharton & Taylor Selfridge: Latest Updates & News | FEVIQO Trending',
    metaDescription: 'Latest news regarding Cory Wharton and Taylor Selfridge, including Teen Mom updates, family milestones, and heart health advocacy.',
    focusKeyword: 'Cory Wharton',
    secondaryKeywords: ['Taylor Selfridge', 'Cory Wharton Taylor Selfridge', 'Cory Wharton news', 'Cory Wharton latest', 'Taylor Selfridge news', 'Teen Mom Cory Wharton'],
    canonicalUrl: 'https://feviqo.com/trending/cory-wharton-taylor-selfridge-latest-news',
    ogTitle: 'Cory Wharton and Taylor Selfridge: Latest Family Updates and Reality TV News',
    ogDescription: 'An overview of recent updates regarding Teen Mom stars Cory Wharton and Taylor Selfridge, family milestones, and health advocacy.',
    ogImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/mlb-154-game-season-proposal-latest': {
    path: '/trending/mlb-154-game-season-proposal-latest',
    pageName: 'MLB 154 Game Season Article',
    seoTitle: 'MLB 154-Game Season Proposal: Schedule Changes & Analysis | FEVIQO',
    metaDescription: 'Complete breakdown of Major League Baseball\'s 154-game regular season proposal, MLBPA CBA discussions, and player health impacts.',
    focusKeyword: 'MLB 154 game season proposal',
    secondaryKeywords: ['MLB 154 games', 'MLB season proposal', 'MLB schedule changes', 'MLB 154 game season', 'MLB season changes', 'MLBPA'],
    canonicalUrl: 'https://feviqo.com/trending/mlb-154-game-season-proposal-latest',
    ogTitle: 'MLB 154-Game Season Proposal: Schedule Format Changes and Player Impact',
    ogDescription: 'An in-depth analysis of Major League Baseball\'s proposed 154-game schedule restructuring, examining player fatigue reduction and postseason timing.',
    ogImage: 'https://images.unsplash.com/photo-1508802913482-f3da9e1a55e7?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/james-talarico-campaign-texas-senate': {
    path: '/trending/james-talarico-campaign-texas-senate',
    pageName: 'James Talarico Article',
    seoTitle: 'James Talarico Campaign News & Texas Senate Race Updates | FEVIQO',
    metaDescription: 'Political breakdown of Representative James Talarico\'s campaign strategy, education legislative priorities, and Texas election outlook.',
    focusKeyword: 'James Talarico campaign absence',
    secondaryKeywords: ['James Talarico', 'James Talarico news', 'James Talarico Texas Senate', 'Texas Senate', 'Talarico campaign'],
    canonicalUrl: 'https://feviqo.com/trending/james-talarico-campaign-texas-senate',
    ogTitle: 'James Talarico Campaign Absence: Key Developments in Texas Legislative Race',
    ogDescription: 'An analysis of Texas State Representative James Talarico\'s recent campaign schedule, public appearances, and Texas Senate political outlook.',
    ogImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/celine-dion-paris-residency-2026-updates': {
    path: '/trending/celine-dion-paris-residency-2026-updates',
    pageName: 'Celine Dion Paris Article',
    seoTitle: 'Celine Dion Paris Residency 2026: Concert News & Updates | FEVIQO',
    metaDescription: 'Latest reports on Celine Dion\'s Paris concert residency, vocal recovery milestones, and live music return.',
    focusKeyword: 'Celine Dion Paris residency',
    secondaryKeywords: ['Celine Dion Paris', 'Celine Dion residency', 'Celine Dion 2026', 'Celine Dion news', 'Stiff Person Syndrome Celine'],
    canonicalUrl: 'https://feviqo.com/trending/celine-dion-paris-residency-2026-updates',
    ogTitle: 'Celine Dion Paris Residency: 2026 Concert Returns and Health Progress Reports',
    ogDescription: 'Reports and official announcements regarding Celine Dion\'s Paris concert residency plans, vocal conditioning, and health progress.',
    ogImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/ronald-acuna-jr-injury-recovery-mlb-updates': {
    path: '/trending/ronald-acuna-jr-injury-recovery-mlb-updates',
    pageName: 'Ronald Acuña Jr. Article',
    seoTitle: 'Ronald Acuña Jr. Injury Recovery & Braves MLB Return News | FEVIQO',
    metaDescription: 'Rehabilitation progress, sprinting milestones, and return timeline for Atlanta Braves star Ronald Acuña Jr.',
    focusKeyword: 'Ronald Acuña Jr.',
    secondaryKeywords: ['Ronald Acuña Jr. news', 'Ronald Acuña injury', 'Ronald Acuña MLB', 'Ronald Acuna latest', 'Atlanta Braves'],
    canonicalUrl: 'https://feviqo.com/trending/ronald-acuna-jr-injury-recovery-mlb-updates',
    ogTitle: 'Ronald Acuña Jr. Injury Recovery: Braves Star\'s Timeline for MLB Return',
    ogDescription: 'An update on Atlanta Braves outfielder Ronald Acuña Jr.\'s ACL rehabilitation program, sprinting drills, and expected return.',
    ogImage: 'https://images.unsplash.com/photo-1562077772-3bd90403f7f0?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/terence-atmane-tennis-atp-tour-latest': {
    path: '/trending/terence-atmane-tennis-atp-tour-latest',
    pageName: 'Terence Atmane Article',
    seoTitle: 'Terence Atmane Tennis News & ATP Tour Ranking Results | FEVIQO',
    metaDescription: 'Match analysis, left-handed playing style breakdown, and ATP Tour tournament results for Terence Atmane.',
    focusKeyword: 'Terence Atmane',
    secondaryKeywords: ['Terence Atmane tennis', 'Terence Atmane news', 'Terence Atmane latest', 'ATP Tour Terence Atmane'],
    canonicalUrl: 'https://feviqo.com/trending/terence-atmane-tennis-atp-tour-latest',
    ogTitle: 'Terence Atmane: Rising Tennis Talent\'s ATP Tour Matches and Latest Results',
    ogDescription: 'Analyzing French tennis player Terence Atmane\'s recent ATP Masters 1000 performances, left-handed serve, and ranking trajectory.',
    ogImage: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/microsoft-stock-msft-ai-cloud-revenue': {
    path: '/trending/microsoft-stock-msft-ai-cloud-revenue',
    pageName: 'Microsoft Stock Article',
    seoTitle: 'Microsoft Stock (MSFT) News: Azure AI Revenue & Analysis | FEVIQO',
    metaDescription: 'Financial report on Microsoft stock (MSFT), Azure AI cloud growth metrics, Copilot adoption, and Wall Street forecasts.',
    focusKeyword: 'Microsoft stock',
    secondaryKeywords: ['MSFT stock', 'Microsoft stock news', 'Microsoft shares', 'Microsoft latest', 'Azure AI cloud'],
    canonicalUrl: 'https://feviqo.com/trending/microsoft-stock-msft-ai-cloud-revenue',
    ogTitle: 'Microsoft Stock (MSFT): AI Cloud Growth, Azure Revenue, and Financial Analysis',
    ogDescription: 'An analysis of Microsoft Corporation (MSFT) stock performance, Azure AI cloud infrastructure demand, and Copilot adoption.',
    ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/business-startup-funding-trends': {
    path: '/trending/business-startup-funding-trends',
    pageName: 'Startup Funding Trends Article',
    seoTitle: 'Business & Startup Funding Trends 2026 | FEVIQO Trending',
    metaDescription: 'Discover latest venture capital insights, startup funding trends, and founder growth strategies on FEVIQO Trending.',
    focusKeyword: 'Startup Funding Trends',
    secondaryKeywords: ['Startup Funding Trends', 'venture capital 2026', 'SaaS valuations', 'CAC optimization', 'business growth'],
    canonicalUrl: 'https://feviqo.com/trending/business-startup-funding-trends',
    ogTitle: 'Business & Startup Funding Trends: What Investors Are Prioritizing',
    ogDescription: 'An analysis of venture capital deployment, founder profitability metrics, B2B SaaS valuations, and media monetization models.',
    ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
  },
  '/trending/kaytron-allen': {
    path: '/trending/kaytron-allen',
    pageName: 'Kaytron Allen Article',
    seoTitle: 'Kaytron Allen: Latest News, Stats, Career and Updates | FEVIQO',
    metaDescription: 'Latest Kaytron Allen news, stats, career updates, team information and everything fans need to know about the football running back.',
    focusKeyword: 'Kaytron Allen',
    secondaryKeywords: [
      'Kaytron Allen news',
      'Kaytron Allen latest',
      'Kaytron Allen stats',
      'Kaytron Allen football',
      'Kaytron Allen Penn State',
      'Kaytron Allen updates',
      'Kaytron Allen career',
      'Kaytron Allen draft',
      'Kaytron Allen NFL Draft',
      'Kaytron Allen college football'
    ],
    canonicalUrl: 'https://feviqo.com/trending/kaytron-allen',
    ogTitle: 'Kaytron Allen: Latest News, Stats, Career and Updates',
    ogDescription: 'Latest Kaytron Allen news, stats, career updates, team information and everything fans need to know about the football running back.',
    ogImage: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=1200&auto=format&fit=crop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schemaType: 'Article'
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

  // Dynamic fallback for unlisted routes
  const cleanTitle = pathname.replace('/', '').replace('-', ' ');
  const capitalized = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : 'Page';
  const rawCanonical = `https://feviqo.com${pathname.endsWith('/') ? pathname : pathname + '/'}`;

  return {
    path: pathname,
    pageName: capitalized,
    seoTitle: `${capitalized} | ${BRAND_SYSTEM.titleSuffix}`,
    metaDescription: `${capitalized} page for FEVIQO Performance Creative Studio. Unlimited video editing and performance ad creatives at scale.`,
    focusKeyword: cleanTitle || 'video editing',
    secondaryKeywords: GLOBAL_KEYWORD_TAXONOMY.BRAND,
    canonicalUrl: rawCanonical,
    ogTitle: `${capitalized} — ${BRAND_SYSTEM.name}`,
    ogDescription: BRAND_SYSTEM.positioning,
    ogImage: BRAND_SYSTEM.defaultOgImage,
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
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

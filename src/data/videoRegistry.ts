/**
 * Centralized Video Registry & Configuration
 * 
 * Central repository for all video showcase assets, direct HTML5 MP4/WebM sources,
 * posters, and metadata.
 * 
 * To update or replace any video on the website:
 * Simply change the `src` URL here to your new file (e.g., '/videos/my-new-cut.mp4' or 'https://cdn.example.com/cut.mp4').
 * Zero changes required in any component!
 */

export interface VideoSourceItem {
  id: string;
  title: string;
  category: string;
  tag: string;
  aspectTag?: string;
  orientation: 'vertical' | 'horizontal';
  duration: string;
  clientName: string;
  views: string;
  src: string;
  poster: string;
  driveId?: string;
  youtubeId?: string;
}

// 6 Showcase Videos for the Homepage "We Edit It All" Bento Grid
// Arranged in 3 columns:
export const HOMEPAGE_SHOWCASE_COLUMNS: { colIndex: number; items: VideoSourceItem[] }[] = [
  {
    colIndex: 1,
    items: [
      {
        id: 'showcase-col1-v',
        title: 'High-Retention Talking Head Breakdown',
        category: 'Shorts & Reels',
        tag: 'RETENTION REEL',
        orientation: 'vertical',
        duration: '0:30',
        clientName: 'Apex Media Group',
        views: '480K+ views',
        src: 'https://stream.mux.com/2XO015Sw1RdYlJgjM6OS009uhQNiJycsmbilSY2MeDNis.m3u8',
        poster: 'https://image.mux.com/2XO015Sw1RdYlJgjM6OS009uhQNiJycsmbilSY2MeDNis/thumbnail.jpg?time=1',
        driveId: '',
      },
      {
        id: 'showcase-col1-h',
        title: 'Cinematic Landscape & Documentary Master',
        category: 'YouTube Long-Form',
        tag: 'YOUTUBE LONG-FORM',
        orientation: 'horizontal',
        duration: '8:15',
        clientName: 'Vanguard Studios',
        views: '620K+ views',
        src: 'https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8',
        poster: 'https://image.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M/thumbnail.jpg?time=1',
        driveId: '',
      },
    ],
  },
  {
    colIndex: 2,
    items: [
      {
        id: 'showcase-col2-h',
        title: 'Commercial SaaS Product Launch & Feature Reel',
        category: 'SaaS & Product Demos',
        tag: 'PRODUCT DEMO',
        orientation: 'horizontal',
        duration: '2:45',
        clientName: 'HyperFlow Software',
        views: '380K+ views',
        src: 'https://stream.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc.m3u8',
        poster: 'https://image.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc/thumbnail.jpg?time=1',
        driveId: '',
      },
      {
        id: 'showcase-col2-v',
        title: 'Kinetic Motion Typography & Visual Retention Edit',
        category: 'Shorts & Reels',
        tag: 'KINETIC MOTION',
        orientation: 'vertical',
        duration: '0:22',
        clientName: 'Scale Velocity Media',
        views: '650K+ views',
        src: 'https://stream.mux.com/oQ902RknkEysM3K9nNVlA011tnD3u1HrXBS7uynYxCRwE.m3u8',
        poster: 'https://image.mux.com/oQ902RknkEysM3K9nNVlA011tnD3u1HrXBS7uynYxCRwE/thumbnail.jpg?time=1',
        driveId: '',
      },
    ],
  },
  {
    colIndex: 3,
    items: [
      {
        id: 'showcase-col3-v',
        title: 'Viral Engagement Loop & Dynamic B-Roll Flow',
        category: 'Shorts & Reels',
        tag: 'VIRAL REEL',
        orientation: 'vertical',
        duration: '0:22',
        clientName: 'Pulse Social Agency',
        views: '1.2M+ views',
        src: 'https://stream.mux.com/Xi8FLFTXCSpPW5T5A9L71xPO02cXgge9tvYAXjsE3gjw.m3u8',
        poster: 'https://image.mux.com/Xi8FLFTXCSpPW5T5A9L71xPO02cXgge9tvYAXjsE3gjw/thumbnail.jpg?time=1',
        driveId: '',
      },
      {
        id: 'showcase-col3-h',
        title: 'Founder Vision & Brand Documentary Profile',
        category: 'YouTube Long-Form',
        tag: 'FOUNDER SERIES',
        orientation: 'horizontal',
        duration: '9:30',
        clientName: 'Stratos Enterprise',
        views: '810K+ views',
        src: 'https://stream.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc.m3u8',
        poster: 'https://image.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc/thumbnail.jpg?time=1',
        driveId: '',
      },
    ],
  },
];

// Full Master Gallery Collection for VideoGalleryPage
export const MASTER_PORTFOLIO_VIDEOS: VideoSourceItem[] = [
  {
    id: 'hero',
    title: 'FEVIQO Unlimited Video Editing Showreel',
    category: 'Showreel',
    tag: 'FEVIQO SHOWREEL',
    orientation: 'horizontal',
    duration: '0:45',
    clientName: 'FEVIQO Studio',
    views: '1.2M+ views',
    src: '/videos/Sequence-01.mp4',
    poster: '/images/feviqo-hero-poster.jpg',
  },
  // Vertical Reels
  {
    id: 'reel-1',
    title: 'High-Retention Talking Head Breakdown',
    category: 'Shorts & Reels',
    tag: 'Retention Reel',
    orientation: 'vertical',
    duration: '0:30',
    clientName: 'Apex Media Group',
    views: '480K+ views',
    src: 'https://stream.mux.com/2XO015Sw1RdYlJgjM6OS009uhQNiJycsmbilSY2MeDNis.m3u8',
    poster: 'https://image.mux.com/2XO015Sw1RdYlJgjM6OS009uhQNiJycsmbilSY2MeDNis/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'reel-2',
    title: 'Dynamic Authority Cut & Fast Hook',
    category: 'Podcasts & Interviews',
    tag: 'Authority Short',
    orientation: 'vertical',
    duration: '0:22',
    clientName: 'Brand Founder',
    views: '580K+ views',
    src: 'https://stream.mux.com/s023lRYcUZnjCRCi7kE5w6fp0194EEbcfXTEjfFogX3QE.m3u8',
    poster: 'https://image.mux.com/s023lRYcUZnjCRCi7kE5w6fp0194EEbcfXTEjfFogX3QE/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'reel-3',
    title: 'High-Paced Creator Hook & Luxury Villa Walkthrough',
    category: 'Shorts & Reels',
    tag: 'Luxury Estate Reel',
    orientation: 'vertical',
    duration: '0:22',
    clientName: 'Ali Growth Network',
    views: '1.5M+ views',
    src: 'https://stream.mux.com/cg02HdoZ00PbXTb5Xdd2xK7qmarUhZ3Etipet6ZdqwTsc.m3u8',
    poster: 'https://image.mux.com/cg02HdoZ00PbXTb5Xdd2xK7qmarUhZ3Etipet6ZdqwTsc/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'reel-4',
    title: 'Kinetic Motion Typography & Visual Retention Edit',
    category: 'Shorts & Reels',
    tag: 'Kinetic Motion',
    orientation: 'vertical',
    duration: '0:22',
    clientName: 'Scale Velocity Media',
    views: '650K+ views',
    src: 'https://stream.mux.com/oQ902RknkEysM3K9nNVlA011tnD3u1HrXBS7uynYxCRwE.m3u8',
    poster: 'https://image.mux.com/oQ902RknkEysM3K9nNVlA011tnD3u1HrXBS7uynYxCRwE/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'reel-5',
    title: 'High-Converting Direct-to-Consumer Performance Ad',
    category: 'Paid Social Ads',
    tag: 'Performance UGC',
    orientation: 'vertical',
    duration: '0:22',
    clientName: 'DTC Brand',
    views: '$38K Generated',
    src: 'https://stream.mux.com/cfF2qTIiPcyclNUR66jly00aQHHsyzWXfbs5hKOjP01G00.m3u8',
    poster: 'https://image.mux.com/cfF2qTIiPcyclNUR66jly00aQHHsyzWXfbs5hKOjP01G00/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'reel-6',
    title: 'Viral Engagement Loop & Dynamic B-Roll Flow',
    category: 'Shorts & Reels',
    tag: 'Viral Sound Cut',
    orientation: 'vertical',
    duration: '0:22',
    clientName: 'Pulse Social Agency',
    views: '1.2M+ views',
    src: 'https://stream.mux.com/Xi8FLFTXCSpPW5T5A9L71xPO02cXgge9tvYAXjsE3gjw.m3u8',
    poster: 'https://image.mux.com/Xi8FLFTXCSpPW5T5A9L71xPO02cXgge9tvYAXjsE3gjw/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'reel-7',
    title: 'Executive Thought Leadership & Podcast Short Cut',
    category: 'Podcasts & Interviews',
    tag: 'Podcast Cut',
    orientation: 'vertical',
    duration: '0:30',
    clientName: 'Podcast Studio',
    views: '930K+ views',
    src: 'https://stream.mux.com/kxeMNXlvZr02rU9pIRUA02PtMMToQJrYNRgz4WtD02giPk.m3u8',
    poster: 'https://image.mux.com/kxeMNXlvZr02rU9pIRUA02PtMMToQJrYNRgz4WtD02giPk/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'reel-8',
    title: 'Dynamic Authority Founder Cut & Kinetic Flow',
    category: 'Podcasts & Interviews',
    tag: 'Organic Virality',
    orientation: 'vertical',
    duration: '0:22',
    clientName: 'Apex Creator Studio',
    views: '860K+ views',
    src: 'https://stream.mux.com/h01VlLIhtdkl1PWGAoUAgstdLpBV44lZrHX5ACt01Jehc.m3u8',
    poster: 'https://image.mux.com/h01VlLIhtdkl1PWGAoUAgstdLpBV44lZrHX5ACt01Jehc/thumbnail.jpg?time=1',
    driveId: '',
  },

  // Horizontal Widescreen Videos
  {
    id: 'horiz-1',
    title: 'Cinematic Landscape & Documentary Master',
    category: 'YouTube Long-Form',
    tag: 'YouTube Long-Form',
    orientation: 'horizontal',
    duration: '8:15',
    clientName: 'Vanguard Studios',
    views: '620K+ views',
    src: 'https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8',
    poster: 'https://image.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'horiz-2',
    title: 'Narrative Brand Storytelling & Color Grading',
    category: 'YouTube Long-Form',
    tag: 'Cinematic Story',
    orientation: 'horizontal',
    duration: '11:42',
    clientName: 'Nordic Design Labs',
    views: '540K+ views',
    src: 'https://stream.mux.com/K2FDm6cIXH1hmj00KDCoVtmUP00WfWqS8E5QrioFZt1LE.m3u8',
    poster: 'https://image.mux.com/K2FDm6cIXH1hmj00KDCoVtmUP00WfWqS8E5QrioFZt1LE/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'horiz-3',
    title: 'High-Impact YouTube Educational Masterclass Edit',
    category: 'YouTube Long-Form',
    tag: 'Educational Edit',
    orientation: 'horizontal',
    duration: '14:20',
    clientName: 'Scale Academy',
    views: '280K+ views',
    src: 'https://stream.mux.com/yYp92f00j801EMav6rKji1XGioTk01LsC3hclBWNfK8tgY.m3u8',
    poster: 'https://image.mux.com/yYp92f00j801EMav6rKji1XGioTk01LsC3hclBWNfK8tgY/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'horiz-4',
    title: 'Commercial SaaS Product Launch & Feature Reel',
    category: 'YouTube Long-Form',
    tag: 'Product Demo',
    orientation: 'horizontal',
    duration: '2:45',
    clientName: 'HyperFlow Software',
    views: '380K+ views',
    src: 'https://stream.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc.m3u8',
    poster: 'https://image.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'horiz-5',
    title: 'Founder Vision & Brand Documentary Profile',
    category: 'YouTube Long-Form',
    tag: 'Founder Story',
    orientation: 'horizontal',
    duration: '9:30',
    clientName: 'Stratos Enterprise',
    views: '810K+ views',
    src: 'https://stream.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc.m3u8',
    poster: 'https://image.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'horiz-6',
    title: 'Cinematic Visual Showcase & Color Grade Cut',
    category: 'YouTube Long-Form',
    tag: 'Cinematic Cut',
    orientation: 'horizontal',
    duration: '6:50',
    clientName: 'Creative Agency',
    views: '390K+ views',
    src: 'https://stream.mux.com/U02eycl00wLlvS6xpkRcIMmlceX4tr726fxssHMKbYFnM.m3u8',
    poster: 'https://image.mux.com/U02eycl00wLlvS6xpkRcIMmlceX4tr726fxssHMKbYFnM/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'horiz-7',
    title: 'In-Depth Feature Interview & High-Retention Documentary',
    category: 'Podcasts & Interviews',
    tag: 'Feature Interview',
    orientation: 'horizontal',
    duration: '16:05',
    clientName: 'Media Group',
    views: '740K+ views',
    src: 'https://stream.mux.com/WdKdJIT1Zm8F1e02Cl8gsh2sdU4BKZee00oEI32V00NVjs.m3u8',
    poster: 'https://image.mux.com/WdKdJIT1Zm8F1e02Cl8gsh2sdU4BKZee00oEI32V00NVjs/thumbnail.jpg?time=1',
    driveId: '',
  },
  {
    id: 'horiz-8',
    title: 'Brand Commercial & Motion Graphics Launch Cut',
    category: 'Paid Social Ads',
    tag: 'Commercial Launch',
    orientation: 'horizontal',
    duration: '0:53',
    clientName: 'Fintech Scaleup',
    views: '430K+ views',
    src: 'https://stream.mux.com/x4EDg00kQy500i66WJzz4OXT2hMluOCUd6XE23t4Ts4aw.m3u8',
    poster: 'https://image.mux.com/x4EDg00kQy500i66WJzz4OXT2hMluOCUd6XE23t4Ts4aw/thumbnail.jpg?time=1',
    driveId: '',
  },
];

/**
 * Returns video details from either ID, URL parameter, or direct source.
 */
export const findVideoItem = (idOrUrl?: string | null): VideoSourceItem | undefined => {
  if (!idOrUrl) return undefined;
  
  let cleanKey = idOrUrl.trim();

  // If passed a full URL containing a v parameter or /v/ or /watch/ or /gallery?v=
  if (cleanKey.includes('v=')) {
    try {
      const u = new URL(cleanKey.startsWith('http') ? cleanKey : `https://feviqo.com/${cleanKey.replace(/^\//, '')}`);
      const v = u.searchParams.get('v') || u.searchParams.get('video');
      if (v) cleanKey = v;
    } catch {}
  } else if (cleanKey.includes('/v/')) {
    const parts = cleanKey.split('/v/');
    if (parts[1]) cleanKey = parts[1].split('?')[0].split('#')[0];
  }

  if (cleanKey === 'hero' || cleanKey === 'showreel' || cleanKey.includes('Sequence-01.mp4')) {
    return MASTER_PORTFOLIO_VIDEOS[0];
  }

  // 1. Exact ID match
  const masterMatch = MASTER_PORTFOLIO_VIDEOS.find(
    (item) => item.id === cleanKey || item.src === cleanKey || (item.driveId && item.driveId === cleanKey)
  );
  if (masterMatch) return masterMatch;

  for (const col of HOMEPAGE_SHOWCASE_COLUMNS) {
    const showcaseMatch = col.items.find(
      (it) => it.id === cleanKey || it.src === cleanKey || (it.driveId && it.driveId === cleanKey)
    );
    if (showcaseMatch) return showcaseMatch;
  }

  // 2. Partial match for Mux ID or stream URL
  const muxMatch = MASTER_PORTFOLIO_VIDEOS.find((item) => {
    if (item.src && cleanKey.length > 5 && (item.src.includes(cleanKey) || cleanKey.includes(item.src))) return true;
    return false;
  });
  if (muxMatch) return muxMatch;

  return undefined;
};

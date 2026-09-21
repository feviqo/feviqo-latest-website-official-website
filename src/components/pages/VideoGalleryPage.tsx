import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Sparkles, Filter, Search, 
  Video, Maximize2 
} from 'lucide-react';
import { VideoGalleryItem, AppRoute } from '../../types';
import { getWebsiteAssets } from '../../services/assetService';
import { Navbar } from '../Navbar';
import { InlineVideoPlayer } from '../InlineVideoPlayer';

interface VideoGalleryPageProps {
  onBackToHome: () => void;
  onBookCall: () => void;
  onOpenVideo: (vimeoIdOrDriveId: string, title?: string, aspect?: '16/9' | '9/16') => void;
  onNavigatePricing?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage?: (route: AppRoute) => void;
}

const CATEGORIES = [
  'All',
  'YouTube Long-Form',
  'Shorts & Reels',
  'Paid Social Ads',
  'Podcasts & Interviews',
];

// Pre-balanced 3-column distribution for the default unfiltered gallery
// 16 Real Client Master Gallery Edits (8 Vertical Reels + 8 Horizontal Cuts)
// Staggered rhythmic layout with zero consecutive duplicates:
// Column 1: [V, H, V, H, V, H] (Strictly alternating)
// Column 2: [H, V, H, V, H, V] (Strictly alternating)
// Column 3: [V, H, V, H]       (Strictly alternating)
// Row 0: [V, H, V]
// Row 1: [H, V, H]
// Row 2: [V, H, V]
// Row 3: [H, V, H]
// Row 4: [V, H]
// Row 5: [H, V]
const DEFAULT_COLUMN_1: VideoGalleryItem[] = [
  {
    id: 'reel-1',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/2XO015Sw1RdYlJgjM6OS009uhQNiJycsmbilSY2MeDNis.m3u8',
    thumbnail: 'https://image.mux.com/2XO015Sw1RdYlJgjM6OS009uhQNiJycsmbilSY2MeDNis/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/2XO015Sw1RdYlJgjM6OS009uhQNiJycsmbilSY2MeDNis/thumbnail.jpg?time=1',
    title: 'High-Retention Talking Head Breakdown',
    category: 'Shorts & Reels',
    tag: 'Retention Reel',
    duration: '0:30',
    orientation: 'vertical',
    clientName: 'Apex Media Group',
    views: '480K+ views',
  },
  {
    id: 'horiz-1',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8',
    thumbnail: 'https://image.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M/thumbnail.jpg?time=1',
    title: 'Cinematic Landscape & Documentary Master',
    category: 'YouTube Long-Form',
    tag: 'YouTube Long-Form',
    duration: '8:15',
    orientation: 'horizontal',
    clientName: 'Vanguard Studios',
    views: '620K+ views',
  },
  {
    id: 'reel-4',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/oQ902RknkEysM3K9nNVlA011tnD3u1HrXBS7uynYxCRwE.m3u8',
    thumbnail: 'https://image.mux.com/oQ902RknkEysM3K9nNVlA011tnD3u1HrXBS7uynYxCRwE/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/oQ902RknkEysM3K9nNVlA011tnD3u1HrXBS7uynYxCRwE/thumbnail.jpg?time=1',
    title: 'Kinetic Motion Typography & Visual Retention Edit',
    category: 'Shorts & Reels',
    tag: 'Kinetic Motion',
    duration: '0:22',
    orientation: 'vertical',
    clientName: 'Scale Velocity Media',
    views: '650K+ views',
  },
  {
    id: 'horiz-4',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc.m3u8',
    thumbnail: 'https://image.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/OWmigFb1rqJZ7H3cjtFkEWYbLs2vBQDyNCmm1V4lnEc/thumbnail.jpg?time=1',
    title: 'Commercial SaaS Product Launch & Feature Reel',
    category: 'YouTube Long-Form',
    tag: 'Product Demo',
    duration: '2:45',
    orientation: 'horizontal',
    clientName: 'HyperFlow Software',
    views: '380K+ views',
  },
  {
    id: 'reel-8',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/h01VlLIhtdkl1PWGAoUAgstdLpBV44lZrHX5ACt01Jehc.m3u8',
    thumbnail: 'https://image.mux.com/h01VlLIhtdkl1PWGAoUAgstdLpBV44lZrHX5ACt01Jehc/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/h01VlLIhtdkl1PWGAoUAgstdLpBV44lZrHX5ACt01Jehc/thumbnail.jpg?time=1',
    title: 'Dynamic Authority Founder Cut & Kinetic Flow',
    category: 'Podcasts & Interviews',
    tag: 'Organic Virality',
    duration: '0:22',
    orientation: 'vertical',
    clientName: 'Apex Creator Studio',
    views: '860K+ views',
  },
];

const DEFAULT_COLUMN_2: VideoGalleryItem[] = [
  {
    id: 'horiz-2',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/K2FDm6cIXH1hmj00KDCoVtmUP00WfWqS8E5QrioFZt1LE.m3u8',
    thumbnail: 'https://image.mux.com/K2FDm6cIXH1hmj00KDCoVtmUP00WfWqS8E5QrioFZt1LE/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/K2FDm6cIXH1hmj00KDCoVtmUP00WfWqS8E5QrioFZt1LE/thumbnail.jpg?time=1',
    title: 'Narrative Brand Storytelling & Color Grading',
    category: 'YouTube Long-Form',
    tag: 'Cinematic Story',
    duration: '11:42',
    orientation: 'horizontal',
    clientName: 'Nordic Design Labs',
    views: '540K+ views',
  },
  {
    id: 'reel-2',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/s023lRYcUZnjCRCi7kE5w6fp0194EEbcfXTEjfFogX3QE.m3u8',
    thumbnail: 'https://image.mux.com/s023lRYcUZnjCRCi7kE5w6fp0194EEbcfXTEjfFogX3QE/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/s023lRYcUZnjCRCi7kE5w6fp0194EEbcfXTEjfFogX3QE/thumbnail.jpg?time=1',
    title: 'Dynamic Authority Founder Cut & Kinetic Flow',
    category: 'Podcasts & Interviews',
    tag: 'Authority Short',
    duration: '0:22',
    orientation: 'vertical',
    clientName: 'Venture Capital Media',
    views: '890K+ views',
  },
  {
    id: 'horiz-3',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/yYp92f00j801EMav6rKji1XGioTk01LsC3hclBWNfK8tgY.m3u8',
    thumbnail: 'https://image.mux.com/yYp92f00j801EMav6rKji1XGioTk01LsC3hclBWNfK8tgY/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/yYp92f00j801EMav6rKji1XGioTk01LsC3hclBWNfK8tgY/thumbnail.jpg?time=1',
    title: 'Educational Masterclass & Visual Explainer Production',
    category: 'YouTube Long-Form',
    tag: 'Educational Masterclass',
    duration: '14:20',
    orientation: 'horizontal',
    clientName: 'Scale Academy',
    views: '430K+ views',
  },
  {
    id: 'reel-3',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/cg02HdoZ00PbXTb5Xdd2xK7qmarUhZ3Etipet6ZdqwTsc.m3u8',
    thumbnail: 'https://image.mux.com/cg02HdoZ00PbXTb5Xdd2xK7qmarUhZ3Etipet6ZdqwTsc/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/cg02HdoZ00PbXTb5Xdd2xK7qmarUhZ3Etipet6ZdqwTsc/thumbnail.jpg?time=1',
    title: 'High-Paced Creator Hook & Kinetic Sound Design',
    category: 'Shorts & Reels',
    tag: 'Creator Reel',
    duration: '0:22',
    orientation: 'vertical',
    clientName: 'Ali Growth Network',
    views: '710K+ views',
  },
  {
    id: 'horiz-6',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/U02eycl00wLlvS6xpkRcIMmlceX4tr726fxssHMKbYFnM.m3u8',
    thumbnail: 'https://image.mux.com/U02eycl00wLlvS6xpkRcIMmlceX4tr726fxssHMKbYFnM/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/U02eycl00wLlvS6xpkRcIMmlceX4tr726fxssHMKbYFnM/thumbnail.jpg?time=1',
    title: 'Cinematic Visual Showcase & Advanced Color Science',
    category: 'YouTube Long-Form',
    tag: 'Cinematic Cut',
    duration: '6:50',
    orientation: 'horizontal',
    clientName: 'Nexus Creative Studio',
    views: '490K+ views',
  },
  {
    id: 'horiz-8',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/x4EDg00kQy500i66WJzz4OXT2hMluOCUd6XE23t4Ts4aw.m3u8',
    thumbnail: 'https://image.mux.com/x4EDg00kQy500i66WJzz4OXT2hMluOCUd6XE23t4Ts4aw/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/x4EDg00kQy500i66WJzz4OXT2hMluOCUd6XE23t4Ts4aw/thumbnail.jpg?time=1',
    title: 'Brand Commercial & Motion Graphics Launch Cut',
    category: 'Paid Social Ads',
    tag: 'Commercial Studio',
    duration: '0:53',
    orientation: 'horizontal',
    clientName: 'Fintech Scaleup',
    views: '780K+ views',
  },
];

const DEFAULT_COLUMN_3: VideoGalleryItem[] = [
  {
    id: 'reel-5',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/cfF2qTIiPcyclNUR66jly00aQHHsyzWXfbs5hKOjP01G00.m3u8',
    thumbnail: 'https://image.mux.com/cfF2qTIiPcyclNUR66jly00aQHHsyzWXfbs5hKOjP01G00/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/cfF2qTIiPcyclNUR66jly00aQHHsyzWXfbs5hKOjP01G00/thumbnail.jpg?time=1',
    title: 'High-Converting Direct-to-Consumer Performance Ad',
    category: 'Paid Social Ads',
    tag: 'Performance Ad',
    duration: '0:22',
    orientation: 'vertical',
    clientName: 'DTC Brand',
    views: '920K+ views',
  },
  {
    id: 'horiz-5',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc.m3u8',
    thumbnail: 'https://image.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/KA56Y3M8FLwvVDX91p012krrmMftMnLQSwlar01QlEkqc/thumbnail.jpg?time=1',
    title: 'Founder Vision & Brand Documentary Profile',
    category: 'YouTube Long-Form',
    tag: 'Founder Series',
    duration: '9:30',
    orientation: 'horizontal',
    clientName: 'Stratos Enterprise',
    views: '810K+ views',
  },
  {
    id: 'reel-7',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/kxeMNXlvZr02rU9pIRUA02PtMMToQJrYNRgz4WtD02giPk.m3u8',
    thumbnail: 'https://image.mux.com/kxeMNXlvZr02rU9pIRUA02PtMMToQJrYNRgz4WtD02giPk/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/kxeMNXlvZr02rU9pIRUA02PtMMToQJrYNRgz4WtD02giPk/thumbnail.jpg?time=1',
    title: 'Executive Thought Leadership & Podcast Short Cut',
    category: 'Podcasts & Interviews',
    tag: 'Executive Short',
    duration: '0:30',
    orientation: 'vertical',
    clientName: 'Podcast Studio',
    views: '1.4M+ views',
  },
  {
    id: 'horiz-7',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/WdKdJIT1Zm8F1e02Cl8gsh2sdU4BKZee00oEI32V00NVjs.m3u8',
    thumbnail: 'https://image.mux.com/WdKdJIT1Zm8F1e02Cl8gsh2sdU4BKZee00oEI32V00NVjs/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/WdKdJIT1Zm8F1e02Cl8gsh2sdU4BKZee00oEI32V00NVjs/thumbnail.jpg?time=1',
    title: 'In-Depth High-Profile Studio Podcast Interview',
    category: 'Podcasts & Interviews',
    tag: 'Studio Interview',
    duration: '16:05',
    orientation: 'horizontal',
    clientName: 'Global Media Network',
    views: '950K+ views',
  },
  {
    id: 'reel-6',
    driveId: '',
    vimeoId: '',
    videoUrl: 'https://stream.mux.com/Xi8FLFTXCSpPW5T5A9L71xPO02cXgge9tvYAXjsE3gjw.m3u8',
    thumbnail: 'https://image.mux.com/Xi8FLFTXCSpPW5T5A9L71xPO02cXgge9tvYAXjsE3gjw/thumbnail.jpg?time=1',
    poster: 'https://image.mux.com/Xi8FLFTXCSpPW5T5A9L71xPO02cXgge9tvYAXjsE3gjw/thumbnail.jpg?time=1',
    title: 'Viral Engagement Loop & Dynamic B-Roll Flow',
    category: 'Shorts & Reels',
    tag: 'Viral Reel',
    duration: '0:22',
    orientation: 'vertical',
    clientName: 'Pulse Social Agency',
    views: '1.2M+ views',
  },
];

const MASTER_GALLERY_VIDEOS: VideoGalleryItem[] = [
  ...DEFAULT_COLUMN_1,
  ...DEFAULT_COLUMN_2,
  ...DEFAULT_COLUMN_3,
];

// Reusable Video Gallery Card Component - Plays directly in placeholder with fullscreen button
const GalleryCard: React.FC<{
  video: VideoGalleryItem;
  isActive: boolean;
  onPlayVideo: (id: string) => void;
  onStopVideo: () => void;
  onOpenModal?: (source: string, title?: string, aspect?: '16/9' | '9/16') => void;
}> = ({ video, isActive, onPlayVideo, onStopVideo, onOpenModal }) => {
  const isVertical = video.orientation === 'vertical';

  return (
    <div
      key={video.id}
      className="w-full group bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 flex items-center justify-center border border-slate-900/50"
    >
      {/* Direct Video Embed */}
      <InlineVideoPlayer
        id={video.id}
        driveId={video.driveId || video.vimeoId}
        videoUrl={video.videoUrl || video.youtubeId}
        src={video.videoUrl}
        poster={video.thumbnail || video.poster}
        title={video.title}
        tag={video.tag}
        duration={video.duration}
        isVertical={isVertical}
        aspectRatioClass={isVertical ? 'aspect-[9/16]' : 'aspect-video'}
        onOpenModal={onOpenModal}
        onPlay={onPlayVideo}
        onStop={onStopVideo}
      />
    </div>
  );
};

export const VideoGalleryPage: React.FC<VideoGalleryPageProps> = ({
  onBackToHome,
  onBookCall,
  onOpenVideo,
  onNavigatePricing,
  onNavigateSection,
  onNavigateFlow,
  onNavigatePage,
}) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicAssets, setDynamicAssets] = useState(getWebsiteAssets());

  React.useEffect(() => {
    const handleUpdate = () => setDynamicAssets(getWebsiteAssets());
    window.addEventListener('feviqo_assets_updated', handleUpdate);
    return () => window.removeEventListener('feviqo_assets_updated', handleUpdate);
  }, []);

  const filteredVideos = useMemo(() => {
    return MASTER_GALLERY_VIDEOS.filter((video) => {
      let matchesCategory = true;
      if (selectedCategory === 'All') {
        matchesCategory = true;
      } else if (selectedCategory === 'YouTube Long-Form' || selectedCategory === 'YouTube (16:9)') {
        // All horizontal videos
        matchesCategory = video.orientation === 'horizontal';
      } else if (selectedCategory === 'Shorts & Reels' || selectedCategory === 'Shorts & TikTok (9:16)') {
        // All vertical videos
        matchesCategory = video.orientation === 'vertical';
      } else if (selectedCategory === 'Paid Social Ads') {
        // User requested: Executive Thought Leadership & Podcast Short Cut + High-Converting Direct-to-Consumer Performance Ad
        matchesCategory =
          video.title.includes('Executive Thought Leadership & Podcast Short Cut') ||
          video.title.includes('High-Converting Direct-to-Consumer Performance Ad');
      } else if (selectedCategory === 'Podcasts & Interviews') {
        // User requested: Dynamic Authority Founder Cut & Kinetic Flow
        matchesCategory = video.title.includes('Dynamic Authority Founder Cut & Kinetic Flow');
      }

      const matchesSearch = 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.clientName && video.clientName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Desktop 3 Columns: Deterministic default layout (V, H, V start, V, H end)
  const desktopColumns = useMemo(() => {
    if (selectedCategory === 'All' && !searchQuery.trim()) {
      return [DEFAULT_COLUMN_1, DEFAULT_COLUMN_2, DEFAULT_COLUMN_3];
    }

    // When filtered, dynamically balance across 3 columns
    const cols: [VideoGalleryItem[], VideoGalleryItem[], VideoGalleryItem[]] = [[], [], []];
    const colHeights = [0, 0, 0];

    filteredVideos.forEach((video) => {
      const estHeight = video.orientation === 'vertical' ? 857 : 396;
      let minIdx = 0;
      for (let i = 1; i < 3; i++) {
        if (colHeights[i] < colHeights[minIdx]) minIdx = i;
      }
      cols[minIdx].push(video);
      colHeights[minIdx] += estHeight;
    });

    return cols;
  }, [filteredVideos, selectedCategory, searchQuery]);

  // Tablet 2 Columns
  const tabletColumns = useMemo(() => {
    const cols: [VideoGalleryItem[], VideoGalleryItem[]] = [[], []];
    const colHeights = [0, 0];

    filteredVideos.forEach((video) => {
      const estHeight = video.orientation === 'vertical' ? 857 : 396;
      const minIdx = colHeights[0] <= colHeights[1] ? 0 : 1;
      cols[minIdx].push(video);
      colHeights[minIdx] += estHeight;
    });

    return cols;
  }, [filteredVideos]);

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900 font-sans flex flex-col selection:bg-[#22C55E] selection:text-white">
      {/* Global Navbar */}
      <Navbar 
        onBookCall={onBookCall}
        onNavigateSection={onNavigateSection || onBackToHome}
        onNavigatePricing={onNavigatePricing || (() => {})}
        onNavigateFlow={onNavigateFlow || (() => {})}
        onNavigatePage={onNavigatePage || ((route) => {
          if (route === 'home') onBackToHome();
        })}
      />

      {/* Ultra-Premium Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Ambient Studio Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-[#22C55E]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="text-center max-w-4xl mx-auto space-y-5">
          {/* Top Badge: Clean text with soft green accent dot, no dark background, no border line */}
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800">Master Production Portfolio</span>
            <span className="text-emerald-400">•</span>
            <span className="text-xs font-bold text-emerald-700">500M+ Organic Views Driven</span>
          </div>

          <h1 className="font-coolvetica text-4xl sm:text-6xl font-bold text-slate-950 tracking-tight leading-[1.06]">
            The Master <span className="font-editorial-italic font-normal text-[#16a34a]">Video Gallery</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Browse actual client edits produced by FEVIQO across YouTube long-form, viral TikToks, conversion video ads, and high-retention social content.
          </p>

          {/* Styled Stats Ribbon: Ultra-Premium Glassmorphic Stats Capsule */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-2.5 sm:py-3 px-5 sm:px-8 rounded-2xl sm:rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-200/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-[#16a34a] to-[#22C55E] text-white font-black text-xs shadow-sm shadow-emerald-500/20">
                {filteredVideos.length}
              </span>
              <span className="font-extrabold text-slate-900 tracking-tight">Verified Client Cuts</span>
            </div>
            
            <div className="hidden sm:block h-3.5 w-px bg-slate-200/90" />
            
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 font-black">★</span>
              <span className="font-black text-slate-950 text-sm tracking-tight">4.9 / 5</span>
              <span className="text-slate-500 font-medium">Client Rating</span>
            </div>
            
            <div className="hidden sm:block h-3.5 w-px bg-slate-200/90" />
            
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="font-black text-[#15803d] text-sm tracking-tight">Sub-24h</span>
              <span className="text-slate-500 font-medium">Average Turnaround</span>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="pt-3 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, niche, hook, or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/15 shadow-md transition-all"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/20 scale-105'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200 hover:border-slate-400 hover:shadow-xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Video Grid - Premium Masonry Layout */}
      <section className="py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No videos found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Try searching for a different keyword or select "All".</p>
          </div>
        ) : filteredVideos.length === 1 ? (
          /* User requested: Center align when there is only 1 video (e.g. Podcasts & Interviews) */
          <div className="max-w-sm sm:max-w-md mx-auto w-full py-6">
            <GalleryCard
              video={filteredVideos[0]}
              isActive={activeVideoId === filteredVideos[0].id}
              onPlayVideo={(id) => setActiveVideoId(id)}
              onStopVideo={() => setActiveVideoId(null)}
              onOpenModal={onOpenVideo}
            />
          </div>
        ) : filteredVideos.length === 2 ? (
          /* User requested: Balanced 2-column view when there are 2 videos (e.g. Paid Social Ads) */
          <div className="max-w-2xl sm:max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 items-start py-6">
            {filteredVideos.map((video) => (
              <GalleryCard
                key={video.id}
                video={video}
                isActive={activeVideoId === video.id}
                onPlayVideo={(id) => setActiveVideoId(id)}
                onStopVideo={() => setActiveVideoId(null)}
                onOpenModal={onOpenVideo}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Desktop: Handcrafted 3-Column Balanced Masonry */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-8 items-start">
              {desktopColumns.map((colVideos, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-8">
                  {colVideos.map((video) => (
                    <GalleryCard
                      key={video.id}
                      video={video}
                      isActive={activeVideoId === video.id}
                      onPlayVideo={(id) => setActiveVideoId(id)}
                      onStopVideo={() => setActiveVideoId(null)}
                      onOpenModal={onOpenVideo}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Tablet: 2-Column Balanced Masonry */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:hidden gap-6 items-start">
              {tabletColumns.map((colVideos, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-6">
                  {colVideos.map((video) => (
                    <GalleryCard
                      key={video.id}
                      video={video}
                      isActive={activeVideoId === video.id}
                      onPlayVideo={(id) => setActiveVideoId(id)}
                      onStopVideo={() => setActiveVideoId(null)}
                      onOpenModal={onOpenVideo}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Mobile: 2-Column Compact Masonry Grid (Preserved Original Layout) */}
            <div className="sm:hidden grid grid-cols-2 gap-2.5 items-start">
              {tabletColumns.map((colVideos, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-2.5">
                  {colVideos.map((video) => (
                    <GalleryCard
                      key={video.id}
                      video={video}
                      isActive={activeVideoId === video.id}
                      onPlayVideo={(id) => setActiveVideoId(id)}
                      onStopVideo={() => setActiveVideoId(null)}
                      onOpenModal={onOpenVideo}
                    />
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-white border-t border-slate-200 mt-12 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Want high-retention video edits like these?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Get your own dedicated video editor and creative director. Fast daily turnaround, unlimited revisions, and flat monthly billing.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onBookCall}
              className="px-6 py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm transition cursor-pointer shadow-md"
            >
              Schedule a Consultation
            </button>
            <button
              onClick={onNavigatePricing}
              className="px-6 py-3.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm border border-emerald-200 transition cursor-pointer"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

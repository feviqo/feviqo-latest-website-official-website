import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Image as ImageIcon, Video, RefreshCw, Check, 
  Plus, Trash2, Eye, Film, Sliders, Maximize2, 
  Folder, AlertCircle, CheckCircle2, UploadCloud, 
  ArrowRight, Copy, Loader2, ArrowUp, ArrowDown, Play, ExternalLink
} from 'lucide-react';
import { 
  getWebsiteAssets, 
  saveWebsiteAssets, 
  resetWebsiteAssets, 
  uploadAssetFile,
  uploadPublicVideoFile,
  uploadChunkedFile,
  ChunkUploadProgress,
  fetchPublicVideos,
  fetchServerUploads,
  deleteServerUpload,
  WebsiteAssets, 
  VideoGalleryItem, 
  UploadedFileRecord,
  DEFAULT_DISPLAY_SETTINGS,
  DEFAULT_WEBSITE_ASSETS,
  parseVimeoId,
  AudienceVideoItem,
  AudiencePageType,
  AudienceSectionType,
  DEFAULT_AUDIENCE_VIDEOS
} from '../../services/assetService';
import { CmsLogosTab } from './cms/CmsLogosTab';
import { CmsTestimonialsTab } from './cms/CmsTestimonialsTab';
import { CmsPortfolioTab } from './cms/CmsPortfolioTab';
import { CmsPagesTab } from './cms/CmsPagesTab';
import { SafeImage } from '../SafeImage';
import { attachHlsStream, isHlsStream } from '../../utils/hlsPlayer';

export const AdminAssetManager: React.FC = () => {
  const [assets, setAssets] = useState<WebsiteAssets>(getWebsiteAssets());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'logos' | 'testimonials' | 'portfolio' | 'pages' | 'library' | 'images' | 'hero' | 'sizing' | 'gallery' | 'audience'
  >('logos');

  // Audience Pages Videos Management state
  const [selectedAudiencePage, setSelectedAudiencePage] = useState<AudiencePageType>('creators');
  const [selectedAudienceSection, setSelectedAudienceSection] = useState<'all' | AudienceSectionType>('all');
  const [newAudienceTitle, setNewAudienceTitle] = useState('');
  const [newAudienceDesc, setNewAudienceDesc] = useState('');
  const [newAudienceUrl, setNewAudienceUrl] = useState('');
  const [newAudienceThumb, setNewAudienceThumb] = useState('');
  const [newAudiencePage, setNewAudiencePage] = useState<AudiencePageType>('creators');
  const [newAudienceSection, setNewAudienceSection] = useState<AudienceSectionType>('main');
  const [newAudienceAspect, setNewAudienceAspect] = useState<'16:9' | '9:16' | '21:9'>('16:9');
  const [newAudienceTag, setNewAudienceTag] = useState('');

  // Server uploads library state
  const [serverUploads, setServerUploads] = useState<UploadedFileRecord[]>([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const adminHeroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = adminHeroVideoRef.current;
    if (!video || !assets.heroVideo) return;
    const cleanup = attachHlsStream(video, assets.heroVideo);
    return () => {
      if (cleanup) cleanup();
    };
  }, [assets.heroVideo]);

  // New gallery item temporary form
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState('Reels / TikTok (9:16)');
  const [newGalleryThumbnail, setNewGalleryThumbnail] = useState('');
  const [newGalleryVideoUrl, setNewGalleryVideoUrl] = useState('');
  const [newGalleryClient, setNewGalleryClient] = useState('');

  // Chunked upload progress state
  const [chunkProgress, setChunkProgress] = useState<{ active: boolean; fileName: string; percentage: number; status: string } | null>(null);

  // Direct URL / Drive downloader state
  const [directUrl, setDirectUrl] = useState('');
  const [directUrlName, setDirectUrlName] = useState('1.mp4');
  const [isDownloadingUrl, setIsDownloadingUrl] = useState(false);

  // Sizing display settings local copy
  const displaySettings = assets.displaySettings || DEFAULT_DISPLAY_SETTINGS;

  const [toastIsError, setToastIsError] = useState(false);

  const showToast = (msg: string, isError = false) => {
    setToastMessage(msg);
    setToastIsError(isError);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const loadUploads = async () => {
    setIsLoadingUploads(true);
    const files = await fetchServerUploads();
    setServerUploads(files);
    setIsLoadingUploads(false);
  };

  useEffect(() => {
    const handleUpdate = () => {
      setAssets(getWebsiteAssets());
    };
    window.addEventListener('feviqo_assets_updated', handleUpdate);
    loadUploads();
    return () => window.removeEventListener('feviqo_assets_updated', handleUpdate);
  }, []);

  const handleSave = (customAssets?: WebsiteAssets) => {
    const toSave = customAssets || assets;
    saveWebsiteAssets(toSave);
    setSavedSuccess(true);
    showToast('Changes saved and broadcast across the website in real-time!');
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all website imagery, videos, sizing, and gallery items to production defaults?')) {
      setIsResetting(true);
      const defaults = resetWebsiteAssets();
      setAssets(defaults);
      setTimeout(() => setIsResetting(false), 500);
      setSavedSuccess(true);
      showToast('All website assets reset to studio defaults.');
      setTimeout(() => setSavedSuccess(false), 3500);
    }
  };

  // Direct file upload handler for specific asset slots
  const handleSlotUpload = async (slotKey: keyof WebsiteAssets, file: File) => {
    setUploadingSlot(slotKey);
    setChunkProgress({
      active: true,
      fileName: file.name,
      percentage: 0,
      status: `Uploading ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`,
    });
    try {
      const onProgress = (p: ChunkUploadProgress) => {
        setChunkProgress({
          active: true,
          fileName: file.name,
          percentage: p.percentage,
          status: p.status,
        });
      };
      const res = await uploadAssetFile(file, onProgress);
      if (res.success && res.url) {
        let updated: WebsiteAssets;
        if (slotKey === 'heroVideo') {
          const newMediaId = `feviqo-hero-video-${Date.now()}`;
          updated = {
            ...assets,
            heroVideo: res.url,
            heroVideoMediaId: newMediaId,
            hero: {
              ...assets.hero,
              videoMediaId: newMediaId,
              filename: file.name,
              posterMediaId: assets.hero?.posterMediaId || 'feviqo-hero-poster',
            },
          };
        } else if (slotKey === 'heroPoster') {
          const newPosterId = `feviqo-hero-poster-${Date.now()}`;
          updated = {
            ...assets,
            heroPoster: res.url,
            heroPosterMediaId: newPosterId,
            hero: {
              ...assets.hero,
              posterMediaId: newPosterId,
            },
          };
        } else {
          updated = { ...assets, [slotKey]: res.url };
        }
        setAssets(updated);
        handleSave(updated);
        await loadUploads();
        showToast(`Uploaded & applied ${file.name} to ${slotKey}!`);
      } else {
        alert('Upload failed: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingSlot(null);
      setChunkProgress(null);
    }
  };

  const handleUnassignHeroVideo = () => {
    const updated: WebsiteAssets = {
      ...assets,
      heroVideo: '',
      heroVideoMediaId: '',
      hero: {
        ...assets.hero,
        videoMediaId: undefined,
      },
    };
    setAssets(updated);
    handleSave(updated);
    showToast('Hero video unassigned. The website hero is now operating in poster fallback mode.');
  };

  const handleRestoreSequence01 = () => {
    const updated: WebsiteAssets = {
      ...assets,
      heroVideo: '/videos/Sequence-01.mp4',
      heroPoster: '/images/feviqo-hero-poster.jpg',
      heroVideoMediaId: 'feviqo-hero-video',
      heroPosterMediaId: 'feviqo-hero-poster',
      hero: {
        videoMediaId: 'feviqo-hero-video',
        posterMediaId: 'feviqo-hero-poster',
        filename: 'Sequence 01.mp4',
        duration: 51.3,
        width: 1280,
        height: 720,
        aspectRatio: '16:9',
      },
    };
    setAssets(updated);
    handleSave(updated);
    showToast('Restored official Sequence 01.mp4 and feviqo-hero-poster as active hero media!');
  };

  const handleAssignMuxHero = () => {
    const muxStreamUrl = 'https://stream.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M.m3u8';
    const muxPosterUrl = 'https://image.mux.com/1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M/thumbnail.jpg?time=1';
    const updated: WebsiteAssets = {
      ...assets,
      heroVideo: muxStreamUrl,
      heroPoster: muxPosterUrl,
      heroVideoMediaId: 'mux-stream-1080p',
      heroPosterMediaId: 'mux-poster-1080p',
      hero: {
        videoMediaId: 'mux-stream-1080p',
        posterMediaId: 'mux-poster-1080p',
        filename: 'Mux 1080p Stream (1SOwsPef4c...)',
        duration: 495,
        width: 1920,
        height: 1080,
        aspectRatio: '16:9',
      },
    };
    setAssets(updated);
    handleSave(updated);
    showToast('Assigned Mux 1080p HLS Stream as active Hero Video!');
  };

  // Multi-file direct upload into media library with 15MB chunked streaming (supports files up to 2GB)
  const handleLibraryBulkUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingSlot('library_bulk');
    let count = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v|mkv)$/i.test(file.name);
      
      setChunkProgress({
        active: true,
        fileName: file.name,
        percentage: 0,
        status: `Preparing upload for ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`,
      });

      const onProgress = (p: ChunkUploadProgress) => {
        setChunkProgress({
          active: true,
          fileName: file.name,
          percentage: p.percentage,
          status: p.status,
        });
      };

      try {
        const res = isVideo
          ? await uploadPublicVideoFile(file, file.name, onProgress)
          : await uploadAssetFile(file, onProgress);

        if (res.success) {
          count++;
          showToast(`File ${res.fileName} (${(file.size / (1024 * 1024)).toFixed(1)} MB) uploaded successfully!`);
        } else {
          showToast(`Upload failed for ${file.name}: ${res.error || 'Server error'}`, true);
        }
      } catch (uploadErr: any) {
        showToast(`Upload error for ${file.name}: ${uploadErr.message}`, true);
      }
    }

    setChunkProgress(null);
    await loadUploads();
    setUploadingSlot(null);
  };

  // Direct video downloader from Google Drive or direct MP4 URL
  const handleDownloadFromUrl = async () => {
    if (!directUrl.trim()) return;
    setIsDownloadingUrl(true);
    showToast('Connecting to link and streaming video to server disk...');
    try {
      const res = await fetch('/api/videos/download-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: directUrl.trim(),
          fileName: directUrlName.trim() || '1.mp4'
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(json.message || `Video "${json.fileName}" downloaded successfully!`);
        setDirectUrl('');
        await loadUploads();
      } else {
        showToast(`Download error: ${json.error || 'Failed to download'}`, true);
      }
    } catch (err: any) {
      showToast(`Network error: ${err.message}`, true);
    } finally {
      setIsDownloadingUrl(false);
    }
  };

  // Check where a media asset is currently referenced across the site
  const checkAssetReferences = (fileName: string, fileUrl?: string): string[] => {
    const refs: string[] = [];
    const targetUrl = (fileUrl || `/uploads/${fileName}`).toLowerCase();
    const nameOnly = fileName.toLowerCase();

    const isMatch = (val?: string) => {
      if (!val) return false;
      const lower = val.toLowerCase();
      return lower.includes(nameOnly) || lower.includes(targetUrl) || targetUrl.includes(lower);
    };

    if (isMatch(assets.headerLogo)) refs.push('Website Header Logo');
    if (isMatch(assets.heroVideo)) refs.push('Hero Showcase Video');
    if (isMatch(assets.heroPoster)) refs.push('Hero Video Poster');
    if (isMatch(assets.creativeDecisionsImage)) refs.push('Pillar 1: Creative Decisions');
    if (isMatch(assets.fasterTurnaroundImage)) refs.push('Pillar 2: Faster Turnaround');
    if (isMatch(assets.streamlinedProcessImage)) refs.push('Pillar 3: Streamlined Process');
    if (isMatch(assets.structuredWorkflowImage)) refs.push('Process Graphic: Creating is Hard');

    assets.galleryItems?.forEach((g, i) => {
      if (isMatch(g.videoUrl) || isMatch(g.thumbnail)) {
        refs.push(`Showcase Gallery: ${g.title || `Item #${i + 1}`}`);
      }
    });

    assets.audienceVideos?.forEach((v, i) => {
      if (isMatch(v.videoUrl) || isMatch(v.thumbnail)) {
        refs.push(`Audience Video: ${v.title || `Item #${i + 1}`} (${v.page})`);
      }
    });

    return refs;
  };

  // Safe delete uploaded file from server with reference warning and layout protection
  const handleDeleteUploadedFile = async (fileName: string, fileUrl?: string) => {
    const refs = checkAssetReferences(fileName, fileUrl);
    
    let confirmMsg = `Permanently delete "${fileName}" from the server?`;
    if (refs.length > 0) {
      confirmMsg = `⚠️ WARNING: This file is currently used on your live website in:\n\n• ${refs.join('\n• ')}\n\nIf you proceed, these locations will safely revert to default studio visuals so your website layout is never broken.\n\nDo you want to permanently delete this file?`;
    }

    if (!window.confirm(confirmMsg)) return;

    // If file is referenced in website assets, revert those slots to safe defaults
    let updatedAssets = { ...assets };
    let hasAssetChanges = false;
    const nameOnly = fileName.toLowerCase();
    const targetUrl = (fileUrl || `/uploads/${fileName}`).toLowerCase();
    const isMatch = (val?: string) => {
      if (!val) return false;
      const lower = val.toLowerCase();
      return lower.includes(nameOnly) || lower.includes(targetUrl) || targetUrl.includes(lower);
    };

    if (isMatch(updatedAssets.headerLogo)) {
      updatedAssets.headerLogo = DEFAULT_WEBSITE_ASSETS.headerLogo;
      hasAssetChanges = true;
    }
    if (isMatch(updatedAssets.heroVideo)) {
      updatedAssets.heroVideo = DEFAULT_WEBSITE_ASSETS.heroVideo;
      hasAssetChanges = true;
    }
    if (isMatch(updatedAssets.heroPoster)) {
      updatedAssets.heroPoster = DEFAULT_WEBSITE_ASSETS.heroPoster;
      hasAssetChanges = true;
    }
    if (isMatch(updatedAssets.creativeDecisionsImage)) {
      updatedAssets.creativeDecisionsImage = DEFAULT_WEBSITE_ASSETS.creativeDecisionsImage;
      hasAssetChanges = true;
    }
    if (isMatch(updatedAssets.fasterTurnaroundImage)) {
      updatedAssets.fasterTurnaroundImage = DEFAULT_WEBSITE_ASSETS.fasterTurnaroundImage;
      hasAssetChanges = true;
    }
    if (isMatch(updatedAssets.streamlinedProcessImage)) {
      updatedAssets.streamlinedProcessImage = DEFAULT_WEBSITE_ASSETS.streamlinedProcessImage;
      hasAssetChanges = true;
    }
    if (isMatch(updatedAssets.structuredWorkflowImage)) {
      updatedAssets.structuredWorkflowImage = DEFAULT_WEBSITE_ASSETS.structuredWorkflowImage;
      hasAssetChanges = true;
    }

    if (hasAssetChanges) {
      setAssets(updatedAssets);
      handleSave(updatedAssets);
    }

    const ok = await deleteServerUpload(fileName);
    if (ok) {
      await loadUploads();
      showToast(
        refs.length > 0 
          ? `Deleted ${fileName} and safely reset ${refs.length} website reference(s) to defaults.` 
          : `Deleted ${fileName}`
      );
    } else {
      alert('Failed to delete file from server.');
    }
  };

  // Assign uploaded file to a specific site asset
  const handleAssignUploadedFile = (url: string, slot: keyof WebsiteAssets, label: string) => {
    const updated = { ...assets, [slot]: url };
    setAssets(updated);
    handleSave(updated);
    showToast(`Assigned to ${label}!`);
  };

  // Update display settings
  const handleUpdateDisplaySettings = (partial: Partial<typeof displaySettings>) => {
    const updatedSettings = { ...displaySettings, ...partial };
    const updatedAssets = { ...assets, displaySettings: updatedSettings };
    setAssets(updatedAssets);
    handleSave(updatedAssets);
  };

  // Add new gallery video or picture
  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryTitle.trim() || !newGalleryVideoUrl.trim()) return;

    const newItem: VideoGalleryItem = {
      id: 'gal-' + Date.now(),
      title: newGalleryTitle.trim(),
      category: newGalleryCategory,
      thumbnail: newGalleryThumbnail.trim() || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
      videoUrl: newGalleryVideoUrl.trim(),
      aspectRatio: newGalleryCategory.includes('9:16') ? '9:16' : '16:9',
      isActive: true,
      views: 'Just added',
      clientName: newGalleryClient.trim() || 'FEVIQO Partner',
    };

    const updatedGallery = [newItem, ...(assets.galleryItems || [])];
    const updated = { ...assets, galleryItems: updatedGallery };
    setAssets(updated);
    handleSave(updated);

    // Reset form
    setNewGalleryTitle('');
    setNewGalleryThumbnail('');
    setNewGalleryVideoUrl('');
    setNewGalleryClient('');
    showToast('New video added to showcase gallery!');
  };

  const handleRemoveGalleryItem = (id: string) => {
    const updatedGallery = (assets.galleryItems || []).filter(item => item.id !== id);
    const updated = { ...assets, galleryItems: updatedGallery };
    setAssets(updated);
    handleSave(updated);
    showToast('Removed item from gallery.');
  };

  // --- Audience Videos Management Handlers ---
  const audienceVideos: AudienceVideoItem[] = assets.audienceVideos || DEFAULT_AUDIENCE_VIDEOS;

  const filteredAudienceVideos = audienceVideos
    .filter(v => v.page === selectedAudiencePage && (selectedAudienceSection === 'all' || v.section === selectedAudienceSection))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const handleAddAudienceVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAudienceTitle.trim() || !newAudienceUrl.trim()) {
      alert('Please provide a title and video URL or upload.');
      return;
    }
    const newItem: AudienceVideoItem = {
      id: 'aud-' + Date.now(),
      page: newAudiencePage,
      section: newAudienceSection,
      title: newAudienceTitle.trim(),
      description: newAudienceDesc.trim(),
      videoUrl: newAudienceUrl.trim(),
      thumbnail: newAudienceThumb.trim() || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=85',
      aspectRatio: newAudienceAspect,
      clientOrTag: newAudienceTag.trim() || (newAudienceSection === 'hero' ? 'HERO' : 'FORMAT'),
      isActive: true,
      sortOrder: audienceVideos.length + 1,
    };
    const updated = {
      ...assets,
      audienceVideos: [...audienceVideos, newItem],
    };
    setAssets(updated);
    handleSave(updated);
    setNewAudienceTitle('');
    setNewAudienceDesc('');
    setNewAudienceUrl('');
    setNewAudienceThumb('');
    setNewAudienceTag('');
    showToast(`Added video to ${newAudiencePage.toUpperCase()} page!`);
  };

  const handleUpdateAudienceVideo = (id: string, partial: Partial<AudienceVideoItem>) => {
    const updatedList = audienceVideos.map(v => v.id === id ? { ...v, ...partial } : v);
    const updated = { ...assets, audienceVideos: updatedList };
    setAssets(updated);
    handleSave(updated);
  };

  const handleDeleteAudienceVideo = (id: string) => {
    if (!window.confirm('Delete this video from the audience page?')) return;
    const updatedList = audienceVideos.filter(v => v.id !== id);
    const updated = { ...assets, audienceVideos: updatedList };
    setAssets(updated);
    handleSave(updated);
    showToast('Video removed from audience page.');
  };

  const handleToggleAudienceVideo = (id: string) => {
    const updatedList = audienceVideos.map(v => v.id === id ? { ...v, isActive: !v.isActive } : v);
    const updated = { ...assets, audienceVideos: updatedList };
    setAssets(updated);
    handleSave(updated);
  };

  const handleMoveAudienceVideo = (id: string, direction: 'up' | 'down') => {
    const list = [...audienceVideos];
    const idx = list.findIndex(v => v.id === id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx].sortOrder;
    list[idx].sortOrder = list[targetIdx].sortOrder;
    list[targetIdx].sortOrder = temp;
    list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const updated = { ...assets, audienceVideos: list };
    setAssets(updated);
    handleSave(updated);
  };

  const handleUploadAudienceMedia = async (file: File, type: 'video' | 'thumbnail') => {
    setUploadingSlot(`audience_${type}`);
    try {
      const res = await uploadAssetFile(file);
      if (res.success && res.url) {
        if (type === 'video') setNewAudienceUrl(res.url);
        else setNewAudienceThumb(res.url);
        showToast(`Uploaded ${file.name}!`);
      } else {
        alert('Upload failed: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingSlot(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 bg-slate-950 text-white border ${toastIsError ? 'border-rose-500/80' : 'border-[#22C55E]/40'} px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 max-w-md`}>
          {toastIsError ? (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
          )}
          <span className="text-xs font-bold leading-normal">{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
            <h3 className="text-base font-black text-slate-950">Direct Asset Uploader & Media Control</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Directly upload pictures and videos from your device, adjust size & scale sliders, add or delete items, and sync live.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            title="Revert back to studio defaults"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset All Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="px-5 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs transition cursor-pointer shadow-md flex items-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved & Live!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('logos')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'logos'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Logos Marquee</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'testimonials'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Testimonials</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'portfolio'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          <Film className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Work Samples</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pages')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pages'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Page Heroes & Copy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'library'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Media Library ({serverUploads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('images')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'images'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Pillars & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'hero'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Home Video</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sizing')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sizing'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Scale & Radii</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audience')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audience'
              ? 'bg-slate-950 text-white'
              : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Audience Videos ({audienceVideos.length})</span>
        </button>
      </div>

      {/* Structured CMS Tabs */}
      {activeTab === 'logos' && <CmsLogosTab />}
      {activeTab === 'testimonials' && <CmsTestimonialsTab />}
      {activeTab === 'portfolio' && <CmsPortfolioTab />}
      {activeTab === 'pages' && <CmsPagesTab />}

      {/* ========================================================
          TAB 1: UPLOADED MEDIA LIBRARY (BULK UPLOAD & DIRECT ACTIONS)
          ======================================================== */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* 30MB IDE Notice & 900MB+ In-App Uploader Guide */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-left shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
              <p className="font-bold text-emerald-900 mb-1">
                Uploading Large Videos up to 2048MB (Minimum 900MB+ Limit)
              </p>
              <p className="text-emerald-800 text-xs leading-normal">
                Google AI Studio's left-hand code editor panel has a hard 30MB file size limit for files dragged into the editor tree. 
                To upload files larger than 30MB (such as <strong>1.mp4</strong> or any 900MB+ 4K video), simply drag or select them <strong>directly in this dropzone</strong>. Files are streamed straight to server disk and <code>public/videos/</code> with HTTP 206 chunked range streaming.
              </p>
            </div>
          </div>

          {/* Big Drag-and-Drop / Browse Dropzone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-[#22C55E] bg-slate-50 hover:bg-green-50/20 rounded-3xl p-8 text-center transition-all">
            <input
              type="file"
              id="library-bulk-upload"
              multiple
              accept="image/*,video/*"
              onChange={(e) => handleLibraryBulkUpload(e.target.files)}
              className="hidden"
            />
            <label
              htmlFor="library-bulk-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#22C55E]">
                {uploadingSlot === 'library_bulk' ? (
                  <Loader2 className="w-7 h-7 animate-spin text-[#22C55E]" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  Click to Upload Pictures or Videos directly, or Drag & Drop
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supports large 4K video files up to 2048MB (minimum 900MB+ limit), including MP4, WebM, MOV, and images. Automatically saved with HTTP 206 chunked range streaming.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition">
                <Plus className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Select Files From Computer</span>
              </span>
            </label>
          </div>

          {/* Live Chunk Upload Progress Card */}
          {chunkProgress && (
            <div className="bg-slate-950 text-white rounded-3xl p-6 border border-[#22C55E]/40 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-white flex items-center gap-2">
                      <span>Chunked Stream Upload:</span>
                      <span className="text-[#22C55E] font-mono">{chunkProgress.fileName}</span>
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Bypassing Cloud Run 32MB limit via 15MB sequential chunk streaming
                    </p>
                  </div>
                </div>
                <span className="text-[#22C55E] font-mono text-base font-black px-3 py-1 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">
                  {chunkProgress.percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-[#22C55E] to-lime-400 h-2 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(34,197,94,0.5)]"
                  style={{ width: `${chunkProgress.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                <span>{chunkProgress.status}</span>
                <span className="text-[11px] text-slate-400">Do not close window</span>
              </div>
            </div>
          )}

          {/* Direct URL or Google Drive Downloader Alternative */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-[#22C55E]" />
                  <span>Direct URL or Google Drive Video Import</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Have a public Google Drive link, Dropbox link, or direct MP4 URL? The server will download it at gigabit speed directly to disk.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Public Video URL or Google Drive Link:
                </label>
                <input
                  type="url"
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or https://example.com/video.mp4"
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#22C55E] outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Save Filename:
                </label>
                <input
                  type="text"
                  value={directUrlName}
                  onChange={(e) => setDirectUrlName(e.target.value)}
                  placeholder="1.mp4"
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#22C55E] outline-none"
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={handleDownloadFromUrl}
                  disabled={!directUrl.trim() || isDownloadingUrl}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isDownloadingUrl ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#22C55E]" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>Import</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Uploaded Files Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-slate-700" />
                <h4 className="text-sm font-black text-slate-900">Uploaded Media on Server</h4>
                <span className="text-xs text-slate-500 font-mono">({serverUploads.length} files)</span>
              </div>
              <button
                type="button"
                onClick={loadUploads}
                className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingUploads ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {serverUploads.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border border-slate-100 rounded-2xl bg-slate-50/50">
                <Folder className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-semibold">No media files uploaded to server yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Upload pictures or videos above to easily assign them to any section.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serverUploads.map((file) => (
                  <div key={file.fileName} className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      {/* Media preview */}
                      <div className="relative w-full h-36 rounded-xl bg-slate-900 overflow-hidden mb-3 flex items-center justify-center">
                        {file.type === 'video' ? (
                          <video src={file.url} className="w-full h-full object-cover" muted controls={false} />
                        ) : (
                          <img src={file.url} alt={file.fileName} className="w-full h-full object-contain" />
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-bold text-white uppercase backdrop-blur-xs">
                          {file.type}
                        </span>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-mono text-slate-300 backdrop-blur-xs">
                          {formatFileSize(file.size)}
                        </span>
                      </div>

                      {/* File meta */}
                      <p className="text-xs font-bold text-slate-900 truncate" title={file.fileName}>
                        {file.fileName}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                        {file.url}
                      </p>
                    </div>

                    {/* Quick Assignment Actions */}
                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Quick Assign To:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {file.type === 'image' && (
                          <>
                            <button
                              onClick={() => handleAssignUploadedFile(file.url, 'headerLogo', 'Header Logo')}
                              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 transition cursor-pointer"
                            >
                              Logo
                            </button>
                            <button
                              onClick={() => handleAssignUploadedFile(file.url, 'heroPoster', 'Hero Poster')}
                              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 transition cursor-pointer"
                            >
                              Hero Poster
                            </button>
                            <button
                              onClick={() => handleAssignUploadedFile(file.url, 'creativeDecisionsImage', 'Pillar 1 (Creative Decisions)')}
                              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 transition cursor-pointer"
                            >
                              Pillar 1
                            </button>
                            <button
                              onClick={() => handleAssignUploadedFile(file.url, 'fasterTurnaroundImage', 'Pillar 2 (Faster Turnaround)')}
                              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 transition cursor-pointer"
                            >
                              Pillar 2
                            </button>
                            <button
                              onClick={() => handleAssignUploadedFile(file.url, 'streamlinedProcessImage', 'Pillar 3 (Streamlined Process)')}
                              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 transition cursor-pointer"
                            >
                              Pillar 3
                            </button>
                            <button
                              onClick={() => handleAssignUploadedFile(file.url, 'structuredWorkflowImage', 'Workflow Image')}
                              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 transition cursor-pointer"
                            >
                              Workflow Pic
                            </button>
                          </>
                        )}

                        {file.type === 'video' && (
                          <>
                            <button
                              onClick={() => handleAssignUploadedFile(file.url, 'heroVideo', 'Hero MP4 Video')}
                              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 transition cursor-pointer"
                            >
                              Set as Hero Video
                            </button>
                            <button
                              onClick={() => {
                                setNewGalleryVideoUrl(file.url);
                                setNewGalleryTitle(file.fileName.replace(/\.[^/.]+$/, ''));
                                setActiveTab('gallery');
                                showToast('Video loaded into Gallery Form! Add details and save.');
                              }}
                              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 transition cursor-pointer"
                            >
                              Add to Gallery
                            </button>
                          </>
                        )}
                      </div>

                      {/* Delete button & In-Use indicator */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(file.url);
                              showToast('Copied URL to clipboard!');
                            }}
                            className="text-[10px] text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy URL</span>
                          </button>
                          {checkAssetReferences(file.fileName, file.url).length > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200" title={`In use in: ${checkAssetReferences(file.fileName, file.url).join(', ')}`}>
                              In Use ({checkAssetReferences(file.fileName, file.url).length})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteUploadedFile(file.fileName, file.url)}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete File</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: CORE WEBSITE IMAGES & BRAND LOGO
          ======================================================== */}
      {activeTab === 'images' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">Header & Nav Brand Logo</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">SVG / PNG / JPG</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 flex items-center justify-center min-h-[100px] relative overflow-hidden">
              <img 
                src={assets.headerLogo} 
                alt="Logo Preview" 
                style={{ height: `${displaySettings.logoHeight || 32}px` }}
                className="object-contain transition-all" 
              />
            </div>

            {/* Direct Upload & Clear controls */}
            <div className="flex items-center gap-2">
              <label className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2">
                {uploadingSlot === 'headerLogo' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#22C55E]" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-[#22C55E]" />
                )}
                <span>Direct Upload New Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleSlotUpload('headerLogo', e.target.files[0])}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  const updated = { ...assets, headerLogo: '/HEADER-removebg-preview.png' };
                  setAssets(updated);
                  handleSave(updated);
                }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                title="Reset Logo to default"
              >
                Reset
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Asset URL or File Path</label>
              <input
                type="text"
                value={assets.headerLogo}
                onChange={e => setAssets({ ...assets, headerLogo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>

          {/* 1st-image: Creative Decisions */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">Pillar 1: Creative Decisions</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">1st-image.jpeg</span>
            </div>

            <div className="relative w-full h-44 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
              <img 
                src={assets.creativeDecisionsImage} 
                alt="Creative Decisions" 
                style={{ objectFit: displaySettings.pillarImageFit }}
                className="w-full h-full" 
              />
            </div>

            {/* Direct Upload & Clear controls */}
            <div className="flex items-center gap-2">
              <label className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2">
                {uploadingSlot === 'creativeDecisionsImage' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#22C55E]" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-[#22C55E]" />
                )}
                <span>Direct Upload Pillar 1 Pic</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleSlotUpload('creativeDecisionsImage', e.target.files[0])}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  const updated = { ...assets, creativeDecisionsImage: '/images/1st-image.jpeg' };
                  setAssets(updated);
                  handleSave(updated);
                }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                title="Reset to default"
              >
                Reset
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Asset URL or File Path</label>
              <input
                type="text"
                value={assets.creativeDecisionsImage}
                onChange={e => setAssets({ ...assets, creativeDecisionsImage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>

          {/* 2nd: Faster Turnaround */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">Pillar 2: Faster Turnaround</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">2nd.jpeg</span>
            </div>

            <div className="relative w-full h-44 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
              <img 
                src={assets.fasterTurnaroundImage} 
                alt="Faster Turnaround" 
                style={{ objectFit: displaySettings.pillarImageFit }}
                className="w-full h-full" 
              />
            </div>

            {/* Direct Upload & Clear controls */}
            <div className="flex items-center gap-2">
              <label className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2">
                {uploadingSlot === 'fasterTurnaroundImage' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#22C55E]" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-[#22C55E]" />
                )}
                <span>Direct Upload Pillar 2 Pic</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleSlotUpload('fasterTurnaroundImage', e.target.files[0])}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  const updated = { ...assets, fasterTurnaroundImage: '/images/2nd.jpeg' };
                  setAssets(updated);
                  handleSave(updated);
                }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                Reset
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Asset URL or File Path</label>
              <input
                type="text"
                value={assets.fasterTurnaroundImage}
                onChange={e => setAssets({ ...assets, fasterTurnaroundImage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>

          {/* 3rd: Streamlined Process */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">Pillar 3: Streamlined Process</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">3rd.jpeg</span>
            </div>

            <div className="relative w-full h-44 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
              <img 
                src={assets.streamlinedProcessImage} 
                alt="Streamlined Process" 
                style={{ objectFit: displaySettings.pillarImageFit }}
                className="w-full h-full" 
              />
            </div>

            {/* Direct Upload & Clear controls */}
            <div className="flex items-center gap-2">
              <label className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2">
                {uploadingSlot === 'streamlinedProcessImage' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#22C55E]" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-[#22C55E]" />
                )}
                <span>Direct Upload Pillar 3 Pic</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleSlotUpload('streamlinedProcessImage', e.target.files[0])}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  const updated = { ...assets, streamlinedProcessImage: '/images/3rd.jpeg' };
                  setAssets(updated);
                  handleSave(updated);
                }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                Reset
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Asset URL or File Path</label>
              <input
                type="text"
                value={assets.streamlinedProcessImage}
                onChange={e => setAssets({ ...assets, streamlinedProcessImage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>

          {/* Workflow image: last.jpeg */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">Process & Workflow Center Artwork</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">last.jpeg</span>
            </div>

            <div className="relative w-full h-52 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center p-4">
              <img 
                src={assets.structuredWorkflowImage} 
                alt="Process last.jpeg" 
                className="h-full object-contain" 
              />
            </div>

            {/* Direct Upload & Clear controls */}
            <div className="flex items-center gap-2">
              <label className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2">
                {uploadingSlot === 'structuredWorkflowImage' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#22C55E]" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-[#22C55E]" />
                )}
                <span>Direct Upload Workflow Graphic</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleSlotUpload('structuredWorkflowImage', e.target.files[0])}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  const updated = { ...assets, structuredWorkflowImage: '/images/last.jpeg' };
                  setAssets(updated);
                  handleSave(updated);
                }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                Reset
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Asset URL or File Path</label>
              <input
                type="text"
                value={assets.structuredWorkflowImage}
                onChange={e => setAssets({ ...assets, structuredWorkflowImage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: HERO VIDEO PLAYER & POSTER (Self-Hosted HTML5 Architecture)
          ======================================================== */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* PRIMARY: Self-Hosted HTML5 Hero Video Architecture */}
          <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
                  <h4 className="text-lg font-black text-slate-900">Hero Video & Master Media Management</h4>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  The active video for the FEVIQO website hero section. Uses permanent HTML5 video storage with stable media identifiers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold shrink-0 w-fit">
                  {assets.heroVideo ? 'Active Video Stream' : 'Poster-Only Mode'}
                </span>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold shrink-0 w-fit">
                  ID: {assets.hero?.videoMediaId || assets.heroVideoMediaId || 'feviqo-hero-video'}
                </span>
              </div>
            </div>

            {/* CURRENT HERO VIDEO BANNER & SPECIFICATION CARD */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#22C55E] font-extrabold block mb-1">
                    CURRENT HERO VIDEO
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight flex items-center gap-2">
                    <Film className="w-6 h-6 text-[#22C55E]" />
                    <span>{assets.hero?.filename || (assets.heroVideo ? assets.heroVideo.split('/').pop() : 'Sequence 01.mp4')}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Production master hero video for the FEVIQO public landing page
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-black text-xs font-black cursor-pointer transition flex items-center gap-1.5 shadow-sm">
                    {uploadingSlot === 'heroVideo' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5 text-black" />
                    )}
                    <span>Replace Video</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/*"
                      onChange={(e) => e.target.files?.[0] && handleSlotUpload('heroVideo', e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition flex items-center gap-1.5 border border-slate-700">
                    {uploadingSlot === 'heroPoster' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#22C55E]" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-[#22C55E]" />
                    )}
                    <span>Replace Poster</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleSlotUpload('heroPoster', e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleAssignMuxHero}
                    className="px-3 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/70 text-purple-200 border border-purple-800/60 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                    title="Assign 1080p Mux Stream (1SOwsPef4cWsfimczylaL5ulTCrpulBV1QG7KAmK77M)"
                  >
                    <Film className="w-3.5 h-3.5 text-purple-400" />
                    <span>Use Mux Stream (1080p)</span>
                  </button>

                  {assets.heroVideo ? (
                    <button
                      type="button"
                      onClick={handleUnassignHeroVideo}
                      className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Unassign Video</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRestoreSequence01}
                      className="px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Assign Sequence 01.mp4</span>
                    </button>
                  )}
                </div>
              </div>

              {/* TECHNICAL METADATA GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Filename</span>
                  <span className="font-mono text-slate-200 font-semibold truncate block" title={assets.hero?.filename || 'Sequence 01.mp4'}>
                    {assets.hero?.filename || 'Sequence 01.mp4'}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Duration</span>
                  <span className="font-mono text-[#22C55E] font-bold">
                    {assets.hero?.duration ? `${assets.hero.duration}s (0:51)` : '51.3s (0:51)'}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Dimensions</span>
                  <span className="font-mono text-slate-200 font-semibold">
                    {assets.hero?.width && assets.hero?.height ? `${assets.hero.width}×${assets.hero.height}` : '1280×720'} (16:9)
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Video Media ID</span>
                  <span className="font-mono text-emerald-300 font-bold truncate block" title={assets.hero?.videoMediaId || assets.heroVideoMediaId || 'feviqo-hero-video'}>
                    {assets.hero?.videoMediaId || assets.heroVideoMediaId || 'feviqo-hero-video'}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Poster Media ID</span>
                  <span className="font-mono text-slate-200 font-semibold truncate block" title={assets.hero?.posterMediaId || assets.heroPosterMediaId || 'feviqo-hero-poster'}>
                    {assets.hero?.posterMediaId || assets.heroPosterMediaId || 'feviqo-hero-poster'}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">MIME / Size</span>
                  <span className="font-mono text-slate-300 font-semibold">
                    video/mp4 (766 KB)
                  </span>
                </div>
              </div>
            </div>

            {/* Live Video & Poster Preview Box */}
            <div className="relative w-full aspect-video max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-xl">
              {assets.heroVideo ? (
                <video
                  ref={adminHeroVideoRef}
                  src={isHlsStream(assets.heroVideo) ? undefined : assets.heroVideo}
                  poster={assets.heroPoster || '/images/feviqo-hero-poster.jpg'}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <SafeImage
                    src={assets.heroPoster || '/images/feviqo-hero-poster.jpg'}
                    alt="Hero Showcase Poster"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-white text-xs font-bold px-3 py-1.5 rounded-full bg-black/70 border border-white/20 mb-2">
                      Poster Fallback Active (Video Unassigned)
                    </span>
                    <p className="text-[11px] text-slate-300 max-w-xs">
                      The public website will render this video frame smoothly until a video is assigned.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleAssignMuxHero}
                className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5 text-purple-700" />
                <span>Use Mux 1080p Stream</span>
              </button>
              <button
                type="button"
                onClick={handleRestoreSequence01}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                <span>Restore Sequence 01.mp4 Default</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSave(assets);
                  showToast('Hero video and poster configuration saved!');
                }}
                className="px-5 py-2 rounded-xl bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-black text-xs font-bold cursor-pointer transition shadow-md flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Hero Settings</span>
              </button>
            </div>

            {/* Direct Video & Poster Uploader and Path Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
              {/* Slot 1: Hero Video (MP4 / WebM) */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-xs font-black text-slate-900">Hero Video (MP4 / WebM)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                    ID: {assets.hero?.videoMediaId || assets.heroVideoMediaId || 'feviqo-hero-video'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload an MP4 video or specify a direct local/persistent path.
                </p>

                <label className="w-full px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2">
                  {uploadingSlot === 'heroVideo' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#22C55E]" />
                  ) : (
                    <UploadCloud className="w-4 h-4 text-[#22C55E]" />
                  )}
                  <span>Upload Video From Computer</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/*"
                    onChange={(e) => e.target.files?.[0] && handleSlotUpload('heroVideo', e.target.files[0])}
                    className="hidden"
                  />
                </label>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Video URL or Relative Path (MP4)</label>
                  <input
                    type="text"
                    value={assets.heroVideo || ''}
                    placeholder="/videos/Sequence-01.mp4 or https://..."
                    onChange={(e) => {
                      const val = e.target.value;
                      const newMediaId = `feviqo-hero-video-${Date.now()}`;
                      setAssets({
                        ...assets,
                        heroVideo: val,
                        heroVideoMediaId: newMediaId,
                        hero: {
                          ...assets.hero,
                          videoMediaId: newMediaId,
                          filename: val.split('/').pop() || 'custom-video.mp4',
                        },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Optional WebM Alternate Stream</label>
                  <input
                    type="text"
                    value={assets.heroVideoWebm || ''}
                    placeholder="/videos/hero-showcase.webm"
                    onChange={(e) => setAssets({ ...assets, heroVideoWebm: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  />
                </div>
              </div>

              {/* Slot 2: Hero Video Poster */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-xs font-black text-slate-900">Hero Poster Image</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 font-bold bg-slate-200/70 px-2 py-0.5 rounded">
                    ID: {assets.hero?.posterMediaId || assets.heroPosterMediaId || 'feviqo-hero-poster'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Visual frame representing the exact video before playback begins or as fallback.
                </p>

                <label className="w-full px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2">
                  {uploadingSlot === 'heroPoster' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#22C55E]" />
                  ) : (
                    <UploadCloud className="w-4 h-4 text-[#22C55E]" />
                  )}
                  <span>Upload Poster Picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleSlotUpload('heroPoster', e.target.files[0])}
                    className="hidden"
                  />
                </label>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Poster Image URL or Relative Path</label>
                  <input
                    type="text"
                    value={assets.heroPoster || ''}
                    placeholder="/images/feviqo-hero-poster.jpg"
                    onChange={(e) => {
                      const val = e.target.value;
                      const newPosterId = `feviqo-hero-poster-${Date.now()}`;
                      setAssets({
                        ...assets,
                        heroPoster: val,
                        heroPosterMediaId: newPosterId,
                        hero: {
                          ...assets.hero,
                          posterMediaId: newPosterId,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                  />
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900">
                  <strong>High Reliability:</strong> If video fails or is paused, this poster frame is displayed instantly without blank frames.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: SIZE, SCALE & RADIUS CONTROLS ("increase size and each everything")
          ======================================================== */}
      {activeTab === 'sizing' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
              <h4 className="text-base font-black text-slate-900">Display Size, Scale & Styling Customizer</h4>
              <p className="text-xs text-slate-500 mt-1">
                Fine-tune the exact dimensions, image heights, corner radii, and container widths across your landing page. Changes apply live immediately!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Header Logo Height */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Header Logo Height
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900">
                    {displaySettings.logoHeight}px
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="2"
                  value={displaySettings.logoHeight}
                  onChange={(e) => handleUpdateDisplaySettings({ logoHeight: Number(e.target.value) })}
                  className="w-full accent-[#22C55E] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Small (20px)</span>
                  <span>Default (32px)</span>
                  <span>Extra Large (90px)</span>
                </div>
              </div>

              {/* 2. Hero Video Container Max Width */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Hero Video Width / Size
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900">
                    {displaySettings.heroVideoMaxWidth}px
                  </span>
                </div>
                <input
                  type="range"
                  min="700"
                  max="1400"
                  step="20"
                  value={displaySettings.heroVideoMaxWidth}
                  onChange={(e) => handleUpdateDisplaySettings({ heroVideoMaxWidth: Number(e.target.value) })}
                  className="w-full accent-[#22C55E] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Compact (700px)</span>
                  <span>Standard (1024px)</span>
                  <span>Cinematic (1400px)</span>
                </div>
              </div>

              {/* 3. Hero Video Zoom Scale */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Hero Video Scale / Zoom
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900">
                    {displaySettings.heroVideoScale}%
                  </span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="130"
                  step="5"
                  value={displaySettings.heroVideoScale}
                  onChange={(e) => handleUpdateDisplaySettings({ heroVideoScale: Number(e.target.value) })}
                  className="w-full accent-[#22C55E] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>80%</span>
                  <span>100% (Default)</span>
                  <span>130%</span>
                </div>
              </div>

              {/* 4. Hero Video Corner Radius */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Hero Video Corner Radius
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900">
                    {displaySettings.heroVideoRadius}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="36"
                  step="2"
                  value={displaySettings.heroVideoRadius}
                  onChange={(e) => handleUpdateDisplaySettings({ heroVideoRadius: Number(e.target.value) })}
                  className="w-full accent-[#22C55E] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Sharp (0px)</span>
                  <span>Rounded (16px)</span>
                  <span>Ultra Curved (36px)</span>
                </div>
              </div>

              {/* 5. Value Pillars Image Max Height */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Value Pillars Image Height
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      min="200"
                      max="1000"
                      step="10"
                      value={displaySettings.pillarImageHeight}
                      onChange={(e) => {
                        const val = Math.min(1000, Math.max(100, Number(e.target.value) || 200));
                        handleUpdateDisplaySettings({ pillarImageHeight: val });
                      }}
                      className="w-20 text-xs font-mono font-bold px-2 py-1 rounded-md bg-white border border-slate-300 text-slate-900 text-right focus:outline-hidden focus:border-[#22C55E]"
                    />
                    <span className="text-xs font-mono text-slate-500 font-bold">px</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="10"
                  value={displaySettings.pillarImageHeight}
                  onChange={(e) => handleUpdateDisplaySettings({ pillarImageHeight: Number(e.target.value) })}
                  className="w-full accent-[#22C55E] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Compact (200px)</span>
                  <span>Previous Max (550px)</span>
                  <span>Full View (1000px)</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
                  {[320, 550, 750, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleUpdateDisplaySettings({ pillarImageHeight: preset })}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        displaySettings.pillarImageHeight === preset
                          ? 'bg-[#032415] text-[#DBFF4C] border-[#032415] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset}px
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Value Pillars Image Fit Mode */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                  Value Pillars Image Fit Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cover', 'contain', 'fill'] as const).map((fitMode) => (
                    <button
                      key={fitMode}
                      type="button"
                      onClick={() => handleUpdateDisplaySettings({ pillarImageFit: fitMode })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                        displaySettings.pillarImageFit === fitMode
                          ? 'bg-slate-950 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {fitMode}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Workflow Artwork Height */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Process & Workflow Center Artwork Height
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900">
                    {displaySettings.workflowImageHeight}px
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="600"
                  step="20"
                  value={displaySettings.workflowImageHeight}
                  onChange={(e) => handleUpdateDisplaySettings({ workflowImageHeight: Number(e.target.value) })}
                  className="w-full accent-[#22C55E] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>200px</span>
                  <span>340px (Default)</span>
                  <span>600px (Large)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: PORTFOLIO SHOWCASE GALLERY & WORK ITEMS
          ======================================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Add New Gallery Video / Picture Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h4 className="text-sm font-black text-slate-900 mb-1">Add Video or Picture to Portfolio Gallery</h4>
            <p className="text-xs text-slate-500 mb-4">
              Add showcase items for TikTok (9:16), YouTube (16:9), podcasts, or ads. You can directly upload or paste an external URL.
            </p>

            <form onSubmit={handleAddGalleryItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={newGalleryTitle}
                  onChange={e => setNewGalleryTitle(e.target.value)}
                  placeholder="e.g. High-Retention SaaS Product Demo"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category & Format</label>
                <select
                  value={newGalleryCategory}
                  onChange={e => setNewGalleryCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                >
                  <option value="Reels / TikTok (9:16)">Reels / TikTok (9:16 Vertical)</option>
                  <option value="YouTube Long-Form (16:9)">YouTube Long-Form (16:9 Horizontal)</option>
                  <option value="Podcast Repurposing">Podcast Repurposing</option>
                  <option value="Commercial (16:9)">Commercial & Ads (16:9)</option>
                  <option value="Product Showcase">Product Showcase</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Video or Media URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGalleryVideoUrl}
                    onChange={e => setNewGalleryVideoUrl(e.target.value)}
                    placeholder="https://.../video.mp4 or /uploads/..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800"
                    required
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold cursor-pointer hover:bg-slate-800 flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="video/*,image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const res = await uploadAssetFile(file);
                        if (res.success) {
                          setNewGalleryVideoUrl(res.url);
                          showToast(`Uploaded ${file.name}`);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cover Thumbnail Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGalleryThumbnail}
                    onChange={e => setNewGalleryThumbnail(e.target.value)}
                    placeholder="https://images.unsplash.com/... or /uploads/..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold cursor-pointer hover:bg-slate-800 flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const res = await uploadAssetFile(file);
                        if (res.success) {
                          setNewGalleryThumbnail(res.url);
                          showToast(`Uploaded ${file.name}`);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 flex items-center justify-between pt-2">
                <input
                  type="text"
                  value={newGalleryClient}
                  onChange={e => setNewGalleryClient(e.target.value)}
                  placeholder="Client / Brand Name (e.g. Apex Studio)"
                  className="max-w-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add To Gallery Showcase</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Gallery Items List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h4 className="text-sm font-black text-slate-900 mb-4">
              Current Showcase Gallery Items ({assets.galleryItems?.length || 0})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.galleryItems?.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-900 mb-3">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-bold text-white uppercase backdrop-blur-xs">
                        {item.aspectRatio}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.category} • {item.clientName}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#22C55E] hover:underline font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryItem(item.id)}
                      className="text-[11px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: AUDIENCE SUBPAGES VIDEOS MANAGEMENT
          ======================================================== */}
      {activeTab === 'audience' && (
        <div className="space-y-6">
          {/* Page & Section Filter Selector */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#22C55E]" />
                  <span>Centralized Audience Pages Video Control</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Manage hero showcases, deliverables, and portfolio videos for Content Creators, Business Owners, and Agencies.
                </p>
              </div>

              {/* Quick page switch pills */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setSelectedAudiencePage('creators'); setNewAudiencePage('creators'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedAudiencePage === 'creators'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Content Creators
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedAudiencePage('business'); setNewAudiencePage('business'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedAudiencePage === 'business'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Business Owners
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedAudiencePage('agencies'); setNewAudiencePage('agencies'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedAudiencePage === 'agencies'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Marketers & Agencies
                </button>
              </div>
            </div>

            {/* Section filter tabs */}
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-2">Filter Section:</span>
              <button
                type="button"
                onClick={() => setSelectedAudienceSection('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedAudienceSection === 'all'
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Sections ({audienceVideos.filter(v => v.page === selectedAudiencePage).length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedAudienceSection('hero')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedAudienceSection === 'hero'
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Hero Showcase
              </button>
              <button
                type="button"
                onClick={() => setSelectedAudienceSection('main')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedAudienceSection === 'main'
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Core Formats / Deliverables
              </button>
              <button
                type="button"
                onClick={() => setSelectedAudienceSection('portfolio')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedAudienceSection === 'portfolio'
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Portfolio Grid
              </button>
            </div>
          </div>

          {/* Add New Audience Video Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#22C55E]" />
              <span>Add Video to {selectedAudiencePage.toUpperCase()} Page</span>
            </h4>

            <form onSubmit={handleAddAudienceVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Page</label>
                <select
                  value={newAudiencePage}
                  onChange={e => setNewAudiencePage(e.target.value as AudiencePageType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                >
                  <option value="creators">Content Creators</option>
                  <option value="business">Business Owners</option>
                  <option value="agencies">Marketers & Agencies</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Section</label>
                <select
                  value={newAudienceSection}
                  onChange={e => setNewAudienceSection(e.target.value as AudienceSectionType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                >
                  <option value="hero">Hero Showcase (Main Featured Video)</option>
                  <option value="main">Core Formats / Deliverables (Section 3)</option>
                  <option value="portfolio">Portfolio Showcase (Section 4)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Video Title *</label>
                <input
                  type="text"
                  value={newAudienceTitle}
                  onChange={e => setNewAudienceTitle(e.target.value)}
                  placeholder="e.g. YouTube Long-Form Retention Cut"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Badge / Tag</label>
                <input
                  type="text"
                  value={newAudienceTag}
                  onChange={e => setNewAudienceTag(e.target.value)}
                  placeholder="e.g. 16:9 4K / CLIENT SHOWCASE"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Subtitle / Description</label>
                <input
                  type="text"
                  value={newAudienceDesc}
                  onChange={e => setNewAudienceDesc(e.target.value)}
                  placeholder="e.g. Surgical narrative pacing, audio sweetening, and broadcast color grade."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                />
              </div>

              {/* Video URL & Direct File Uploader */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Video Source (URL or Upload) *</label>
                  <label 
                    htmlFor="audience-video-upload" 
                    className="text-[11px] font-bold text-[#22C55E] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload File</span>
                  </label>
                </div>
                <input
                  type="file"
                  id="audience-video-upload"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files?.[0]) handleUploadAudienceMedia(e.target.files[0], 'video');
                  }}
                />
                <input
                  type="text"
                  value={newAudienceUrl}
                  onChange={e => setNewAudienceUrl(e.target.value)}
                  placeholder="Direct .mp4 URL or Vimeo ID (e.g. 921740529)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono"
                  required
                />
              </div>

              {/* Thumbnail URL & Direct Uploader */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Poster Thumbnail</label>
                  <label 
                    htmlFor="audience-thumb-upload" 
                    className="text-[11px] font-bold text-[#22C55E] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload Image</span>
                  </label>
                </div>
                <input
                  type="file"
                  id="audience-thumb-upload"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files?.[0]) handleUploadAudienceMedia(e.target.files[0], 'thumbnail');
                  }}
                />
                <input
                  type="text"
                  value={newAudienceThumb}
                  onChange={e => setNewAudienceThumb(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /uploads/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Aspect Ratio</label>
                <div className="flex items-center gap-2">
                  {(['16:9', '9:16', '21:9'] as const).map(asp => (
                    <button
                      key={asp}
                      type="button"
                      onClick={() => setNewAudienceAspect(asp)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        newAudienceAspect === asp
                          ? 'bg-slate-950 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {asp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  disabled={uploadingSlot !== null}
                  className="px-6 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Audience Video</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Audience Videos List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-slate-900">
                Current {selectedAudiencePage.toUpperCase()} Videos ({filteredAudienceVideos.length})
              </h4>
              <span className="text-xs text-slate-500">
                Use arrows to reorder • Toggle to activate/deactivate
              </span>
            </div>

            {filteredAudienceVideos.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <Film className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold">No videos found for this filter.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the form above to add one.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAudienceVideos.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`border rounded-2xl p-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      item.isActive
                        ? 'border-slate-200 bg-white'
                        : 'border-slate-200/50 bg-slate-50/70 opacity-60'
                    }`}
                  >
                    {/* Media Thumbnail & Details */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative w-32 sm:w-40 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0">
                        <img
                          src={item.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-widest text-white bg-black/70 px-2 py-0.5 rounded backdrop-blur-xs">
                          {item.section}
                        </span>
                        {item.aspectRatio && (
                          <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded">
                            {item.aspectRatio}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                            {item.title}
                          </h5>
                          {item.clientOrTag && (
                            <span className="text-[10px] font-bold text-[#22C55E] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              {item.clientOrTag}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {item.description}
                          </p>
                        )}

                        <p className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                          {item.videoUrl}
                        </p>
                      </div>
                    </div>

                    {/* Actions & Reorder */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <div className="flex items-center gap-1 mr-2 border-r border-slate-200 pr-2">
                        <button
                          type="button"
                          onClick={() => handleMoveAudienceVideo(item.id, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveAudienceVideo(item.id, 'down')}
                          disabled={idx === filteredAudienceVideos.length - 1}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAudienceVideo(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          item.isActive
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                        title="Open Video URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteAudienceVideo(item.id)}
                        className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                        title="Delete Video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

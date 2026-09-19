import React, { useState, useEffect } from 'react';
import { 
  Save, RefreshCw, Check, Sparkles, Video, 
  UploadCloud, Play, Layers, BarChart2 
} from 'lucide-react';
import { 
  fetchAllCmsData, 
  saveCmsPageContent, 
  PageHeroContent,
  uploadFileWithStreamingProgress
} from '../../../services/cmsService';
import { SafeImage } from '../../SafeImage';

const PAGE_KEYS = [
  { key: 'agencies', title: 'Agencies Landing Page' },
  { key: 'creators', title: 'Content Creators Page' },
  { key: 'business', title: 'Business Owners Page' },
  { key: 'home', title: 'Home Page Hero' },
] as const;

export const CmsPagesTab: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState<string>('agencies');
  const [pagesData, setPagesData] = useState<Record<string, PageHeroContent>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Video upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAllCmsData(true);
    setPagesData(data.pages || {});
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentPage = pagesData[selectedPage] || {
    badge: '',
    headline: '',
    highlightHeadline: '',
    description: '',
    ctaPrimary: '',
    ctaSecondary: '',
    heroVideoUrl: '',
    heroVideoThumbnail: '',
    heroVideoEnabled: false,
    stats: [
      { label: 'Metric 1', value: '98%', subtext: 'Subtext 1' },
      { label: 'Metric 2', value: '24-48h', subtext: 'Subtext 2' },
      { label: 'Metric 3', value: '1:1', subtext: 'Subtext 3' },
    ],
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const updateCurrentPage = (field: string, value: any) => {
    setPagesData((prev) => ({
      ...prev,
      [selectedPage]: {
        ...prev[selectedPage],
        [field]: value,
      },
    }));
  };

  const updateStat = (index: number, field: 'label' | 'value' | 'subtext', val: string) => {
    const stats = [...(currentPage.stats || [])];
    if (!stats[index]) {
      stats[index] = { label: '', value: '', subtext: '' };
    }
    stats[index][field] = val;
    updateCurrentPage('stats', stats);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const saved = await saveCmsPageContent(selectedPage, currentPage);
    setIsSaving(false);
    if (saved) {
      showStatus(`Page content for "${selectedPage}" saved to database!`);
    } else {
      alert('Failed to save page content');
    }
  };

  const handleUploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadPercent(0);

    const res = await uploadFileWithStreamingProgress(file, {
      onProgress: (p) => setUploadPercent(p.percent),
    });

    setIsUploading(false);
    if (res.success && res.file) {
      updateCurrentPage('heroVideoThumbnail', res.file.url);
      showStatus('Thumbnail uploaded successfully!');
    }
  };

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadPercent(0);

    const res = await uploadFileWithStreamingProgress(file, {
      onProgress: (p) => setUploadPercent(p.percent),
    });

    setIsUploading(false);
    if (res.success && res.file) {
      updateCurrentPage('heroVideoUrl', res.file.url);
      updateCurrentPage('heroVideoEnabled', true);
      showStatus('Hero video file uploaded successfully!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#0B0B0D] tracking-tight">
            Page Content & Hero Redesign Manager
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Edit headlines, CTAs, hero video states, and key metrics without source code modifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer transition"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-[#22C55E]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Page Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3">
        {PAGE_KEYS.map((p) => (
          <button
            key={p.key}
            onClick={() => setSelectedPage(p.key)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
              selectedPage === p.key
                ? 'bg-[#0B0B0D] text-white shadow-md'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Core Hero Copy */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#22C55E]">
            <Sparkles className="w-4 h-4" />
            <span>Hero Narrative & Typography</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Top Eyebrow Badge
              </label>
              <input
                type="text"
                value={currentPage.badge || ''}
                onChange={(e) => updateCurrentPage('badge', e.target.value)}
                placeholder="e.g. White-Label Production for Agencies"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 text-xs focus:border-[#22C55E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Main Headline (Top Line)
              </label>
              <input
                type="text"
                value={currentPage.headline || ''}
                onChange={(e) => updateCurrentPage('headline', e.target.value)}
                placeholder="e.g. MORE OUTPUT."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 text-xs focus:border-[#22C55E] focus:outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Highlight Headline (Green Accent Line)
              </label>
              <input
                type="text"
                value={currentPage.highlightHeadline || ''}
                onChange={(e) => updateCurrentPage('highlightHeadline', e.target.value)}
                placeholder="e.g. WITHOUT MORE OVERHEAD."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-[#065F46] font-bold text-xs focus:border-[#22C55E] focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Sub-Headline / Narrative Paragraph
              </label>
              <textarea
                rows={3}
                value={currentPage.description || ''}
                onChange={(e) => updateCurrentPage('description', e.target.value)}
                placeholder="White-label post-production infrastructure..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 text-xs focus:border-[#22C55E] focus:outline-hidden leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Primary Button Label
              </label>
              <input
                type="text"
                value={currentPage.ctaPrimary || ''}
                onChange={(e) => updateCurrentPage('ctaPrimary', e.target.value)}
                placeholder="Partner with FEVIQO"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 text-xs focus:border-[#22C55E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Secondary Button Label
              </label>
              <input
                type="text"
                value={currentPage.ctaSecondary || ''}
                onChange={(e) => updateCurrentPage('ctaSecondary', e.target.value)}
                placeholder="Review Agency Plans"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 text-xs focus:border-[#22C55E] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Hero Video Container Controls */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-900">
              <Video className="w-4 h-4 text-[#22C55E]" />
              <span>Right-Side Media Frame Settings</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="heroVideoToggle"
                checked={!!currentPage.heroVideoEnabled}
                onChange={(e) => updateCurrentPage('heroVideoEnabled', e.target.checked)}
                className="w-4 h-4 accent-[#22C55E] cursor-pointer"
              />
              <label htmlFor="heroVideoToggle" className="text-xs font-bold text-neutral-800 cursor-pointer">
                Enable Hero Video Player
              </label>
            </div>
          </div>

          <p className="text-xs text-neutral-500">
            When disabled or empty, the page gracefully displays the balanced editorial capability showcase. When enabled, it renders the interactive video player.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Hero Video URL or Vimeo ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentPage.heroVideoUrl || ''}
                  onChange={(e) => updateCurrentPage('heroVideoUrl', e.target.value)}
                  placeholder="921740529 or /uploads/video.mp4"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 text-xs focus:border-[#22C55E] focus:outline-hidden font-mono"
                />
                <label className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleUploadVideo}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Hero Video Thumbnail Image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentPage.heroVideoThumbnail || ''}
                  onChange={(e) => updateCurrentPage('heroVideoThumbnail', e.target.value)}
                  placeholder="/uploads/1789000337907-1st_image.jpeg"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 text-xs focus:border-[#22C55E] focus:outline-hidden font-mono"
                />
                <label className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadThumbnail}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Stats Trio */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-900">
            <BarChart2 className="w-4 h-4 text-[#22C55E]" />
            <span>Key Metrics Trio</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((idx) => {
              const s = currentPage.stats?.[idx] || { label: '', value: '', subtext: '' };
              return (
                <div key={idx} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                    Metric Card #{idx + 1}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 mb-1">Value (Large)</label>
                    <input
                      type="text"
                      value={s.value}
                      onChange={(e) => updateStat(idx, 'value', e.target.value)}
                      placeholder="e.g. 98.4%"
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-900 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 mb-1">Label</label>
                    <input
                      type="text"
                      value={s.label}
                      onChange={(e) => updateStat(idx, 'label', e.target.value)}
                      placeholder="e.g. Client Retention"
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 mb-1">Subtext (Optional)</label>
                    <input
                      type="text"
                      value={s.subtext || ''}
                      onChange={(e) => updateStat(idx, 'subtext', e.target.value)}
                      placeholder="e.g. Zero bottlenecks"
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-600 text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer transition shadow-xl hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Page Content Permanently'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

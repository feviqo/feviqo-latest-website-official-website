import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Play, Check, 
  Eye, EyeOff, UploadCloud, RefreshCw, Film
} from 'lucide-react';
import { 
  fetchAllCmsData, 
  saveCmsPortfolioItem, 
  deleteCmsPortfolioItem, 
  PortfolioItem,
  uploadFileWithStreamingProgress
} from '../../../services/cmsService';
import { SafeImage } from '../../SafeImage';

export const CmsPortfolioTab: React.FC = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<PortfolioItem> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAllCmsData(true);
    setItems(data.portfolio || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleToggleActive = async (item: PortfolioItem) => {
    const updated = await saveCmsPortfolioItem({ ...item, isActive: !item.isActive });
    if (updated) {
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, isActive: !p.isActive } : p)));
      showStatus(`Portfolio item "${item.title}" is now ${!item.isActive ? 'Active' : 'Hidden'}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete portfolio item "${title}"?`)) {
      const ok = await deleteCmsPortfolioItem(id);
      if (ok) {
        setItems((prev) => prev.filter((p) => p.id !== id));
        showStatus(`Portfolio item "${title}" deleted.`);
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadPercent(0);

    const res = await uploadFileWithStreamingProgress(file, {
      onProgress: (p) => setUploadPercent(p.percent),
    });

    setIsUploading(false);
    if (res.success && res.file) {
      setEditingItem((prev) => ({
        ...prev,
        coverImage: res.file.url,
      }));
      showStatus('Thumbnail image uploaded successfully!');
    } else {
      alert(`Upload failed: ${res.error}`);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.coverImage) {
      alert('Please provide title and cover image');
      return;
    }

    const saved = await saveCmsPortfolioItem({
      ...editingItem,
      category: editingItem.category || 'Reels & Shorts',
      platform: editingItem.platform || '9:16 Vertical',
      isActive: editingItem.isActive ?? true,
      displayOrder: editingItem.displayOrder ?? (items.length + 1),
    });

    if (saved) {
      setEditingItem(null);
      await loadData();
      showStatus(`Saved portfolio item "${saved.title}"!`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#0B0B0D] tracking-tight">
            Portfolio & Video Gallery Samples
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Manage work samples displayed across the home page and audience landing pages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer transition"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() =>
              setEditingItem({
                title: '',
                category: 'Reels / TikTok',
                description: '',
                coverImage: '/uploads/1789000337907-1st_image.jpeg',
                videoUrl: '1003651372',
                clientOrCompany: '',
                platform: '9:16 Vertical',
                metrics: 'High Retention',
                isActive: true,
              })
            }
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-black font-bold text-xs uppercase tracking-wider cursor-pointer transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Work Sample</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-[#22C55E]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Edit / Create Form */}
      {editingItem && (
        <div className="bg-[#0B0B0D] text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <h3 className="text-base font-black">
              {editingItem.id ? 'Edit Work Sample' : 'Add Work Sample'}
            </h3>
            <button
              onClick={() => setEditingItem(null)}
              className="text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g., Viral TikTok E-Commerce Unboxing & Hook"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Category Tag
                </label>
                <input
                  type="text"
                  value={editingItem.category || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  placeholder="e.g., YouTube Long-Form, Ads, Reels"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Client / Brand Name
                </label>
                <input
                  type="text"
                  value={editingItem.clientOrCompany || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, clientOrCompany: e.target.value })}
                  placeholder="e.g. Lumina Skincare"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Video URL or Vimeo ID
                </label>
                <input
                  type="text"
                  value={editingItem.videoUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, videoUrl: e.target.value })}
                  placeholder="e.g. 1003651372 or https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Metrics Badge
                </label>
                <input
                  type="text"
                  value={editingItem.metrics || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, metrics: e.target.value })}
                  placeholder="e.g. 1.4M views, +48% Retention"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Description / Editorial Note
              </label>
              <textarea
                rows={2}
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                placeholder="High-energy sound design, kinetic captions, and product-focused pacing..."
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
              />
            </div>

            {/* Thumbnail upload */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Cover Image / Thumbnail *
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  required
                  value={editingItem.coverImage || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, coverImage: e.target.value })}
                  placeholder="/uploads/my-image.jpeg or URL"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden font-mono"
                />
                <label className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shrink-0">
                  <UploadCloud className="w-4 h-4 text-[#22C55E]" />
                  <span>{isUploading ? `Uploading ${uploadPercent}%` : 'Upload Cover'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="portfolioActive"
                  checked={editingItem.isActive ?? true}
                  onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#22C55E]"
                />
                <label htmlFor="portfolioActive" className="text-xs text-neutral-300 font-medium cursor-pointer">
                  Display on live website
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-2.5 rounded-full border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer transition shadow-lg"
                >
                  Save Work Sample
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Portfolio Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-3 bg-white rounded-3xl p-12 text-center text-neutral-400 text-xs border border-neutral-200">
            No work samples configured. Click "Add Work Sample" above.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                  <SafeImage
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.metrics && (
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[#22C55E] text-[10px] font-black border border-white/10">
                      {item.metrics}
                    </span>
                  )}
                  {item.videoUrl && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-slate-950 flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1">
                    {item.category} • {item.platform}
                  </div>
                  <h3 className="text-sm font-bold text-[#0B0B0D] mb-1.5 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-neutral-600 line-clamp-2">{item.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-neutral-100 flex items-center justify-between mt-auto">
                <span className="text-[11px] text-neutral-500 font-medium">
                  {item.clientOrCompany || 'Client'}
                </span>

                <div className="flex items-center gap-1.5 pt-3">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                      item.isActive
                        ? 'border-emerald-200 text-emerald-800 bg-emerald-50'
                        : 'border-neutral-200 text-neutral-400 bg-neutral-100'
                    }`}
                    title={item.isActive ? 'Active on site' : 'Hidden from site'}
                  >
                    {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 rounded-lg border border-neutral-200 text-red-500 hover:bg-red-50 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

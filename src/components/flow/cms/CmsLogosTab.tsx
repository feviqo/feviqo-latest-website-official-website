import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, ArrowUp, ArrowDown, 
  Eye, EyeOff, UploadCloud, Check, ExternalLink, RefreshCw 
} from 'lucide-react';
import { 
  fetchAllCmsData, 
  saveCmsLogo, 
  deleteCmsLogo, 
  reorderCmsLogos, 
  LogoItem,
  uploadFileWithStreamingProgress
} from '../../../services/cmsService';
import { SafeImage } from '../../SafeImage';

export const CmsLogosTab: React.FC = () => {
  const [logos, setLogos] = useState<LogoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLogo, setEditingLogo] = useState<Partial<LogoItem> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAllCmsData(true);
    setLogos(data.logos || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleToggleActive = async (logo: LogoItem) => {
    const updated = await saveCmsLogo({ ...logo, isActive: !logo.isActive });
    if (updated) {
      setLogos((prev) => prev.map((l) => (l.id === logo.id ? { ...l, isActive: !l.isActive } : l)));
      showStatus(`Logo "${logo.name}" is now ${!logo.isActive ? 'Active' : 'Inactive'}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the live trust marquee?`)) {
      const ok = await deleteCmsLogo(id);
      if (ok) {
        setLogos((prev) => prev.filter((l) => l.id !== id));
        showStatus(`Logo "${name}" deleted.`);
      }
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= logos.length) return;

    const newOrder = [...logos];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    setLogos(newOrder);
    const ids = newOrder.map((l) => l.id);
    await reorderCmsLogos(ids);
    showStatus('Logo display sequence updated!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadPercent(0);

    const res = await uploadFileWithStreamingProgress(file, {
      onProgress: (p) => setUploadPercent(p.percent),
    });

    setIsUploading(false);
    if (res.success && res.file) {
      setEditingLogo((prev) => ({
        ...prev,
        image: res.file.url,
        name: prev?.name || file.name.replace(/\.[^/.]+$/, ''),
      }));
      showStatus('Logo file uploaded successfully!');
    } else {
      alert(`Upload failed: ${res.error}`);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLogo?.name || !editingLogo?.image) {
      alert('Please provide both a logo name and image URL/file');
      return;
    }

    const saved = await saveCmsLogo({
      ...editingLogo,
      isActive: editingLogo.isActive ?? true,
      displayOrder: editingLogo.displayOrder ?? (logos.length + 1),
    });

    if (saved) {
      setEditingLogo(null);
      await loadData();
      showStatus(`Saved logo "${saved.name}" to live database!`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#0B0B0D] tracking-tight">
            Client & Partner Logo Marquee
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Manage the continuous trust marquee on the home page. Reorder, add, or toggle logos live.
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
            onClick={() => setEditingLogo({ name: '', image: '', altText: '', isActive: true, link: '' })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-black font-bold text-xs uppercase tracking-wider cursor-pointer transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Logo</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-[#22C55E]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Edit / Create Form Modal or Inline Drawer */}
      {editingLogo && (
        <div className="bg-[#0B0B0D] text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <h3 className="text-base font-black">
              {editingLogo.id ? 'Edit Client Logo' : 'Add New Client Logo'}
            </h3>
            <button
              onClick={() => setEditingLogo(null)}
              className="text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Brand / Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingLogo.name || ''}
                  onChange={(e) => setEditingLogo({ ...editingLogo, name: e.target.value })}
                  placeholder="e.g., Jenna Kutcher, Google, Shopify"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Website / Partner URL (Optional)
                </label>
                <input
                  type="url"
                  value={editingLogo.link || ''}
                  onChange={(e) => setEditingLogo({ ...editingLogo, link: e.target.value })}
                  placeholder="https://clientwebsite.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Logo Asset File or URL *
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={editingLogo.image || ''}
                  onChange={(e) => setEditingLogo({ ...editingLogo, image: e.target.value })}
                  placeholder="/logos/brand.svg or /uploads/..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden font-mono"
                />
                <label className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shrink-0">
                  <UploadCloud className="w-4 h-4 text-[#22C55E]" />
                  <span>{isUploading ? `Uploading ${uploadPercent}%` : 'Upload File'}</span>
                  <input
                    type="file"
                    accept="image/svg+xml,image/png,image/webp,image/jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Vector SVG or transparent PNG recommended. Automatically inverted for dark trust strip.
              </p>
            </div>

            {/* Live Preview of Uploaded Logo */}
            {editingLogo.image && (
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-28 h-12 rounded-xl bg-[#032415] border border-neutral-800 p-2 flex items-center justify-center">
                    <SafeImage
                      src={editingLogo.image}
                      alt={editingLogo.name || 'Preview'}
                      className="h-8 max-w-full object-contain filter brightness-0 invert"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{editingLogo.name || 'Logo Preview'}</div>
                    <div className="text-[10px] text-neutral-400 truncate max-w-xs">{editingLogo.image}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={editingLogo.isActive ?? true}
                    onChange={(e) => setEditingLogo({ ...editingLogo, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#22C55E]"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs text-neutral-300 font-medium cursor-pointer">
                    Show in live marquee
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingLogo(null)}
                className="px-5 py-2.5 rounded-full border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer transition shadow-lg"
              >
                Save Logo Permanently
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logos List Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
            Active Marquee Items ({logos.length})
          </div>
          <span className="text-[11px] text-neutral-400">
            Changes save to disk instantly
          </span>
        </div>

        <div className="divide-y divide-neutral-100">
          {logos.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 text-xs">
              No logos configured yet. Click "Add New Logo" above.
            </div>
          ) : (
            logos.map((logo, index) => (
              <div
                key={logo.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === logos.length - 1}
                      className="p-1 rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dark Preview Box */}
                  <div className="w-24 h-12 rounded-xl bg-[#032415] border border-emerald-950 p-2 flex items-center justify-center shrink-0">
                    <SafeImage
                      src={logo.image}
                      alt={logo.name}
                      className="h-7 max-w-full object-contain filter brightness-0 invert"
                    />
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-[#0B0B0D]">{logo.name}</h4>
                      {logo.link && (
                        <a
                          href={logo.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-400 hover:text-[#22C55E]"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono truncate max-w-xs sm:max-w-md">
                      {logo.image}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleActive(logo)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                      logo.isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                    }`}
                  >
                    {logo.isActive ? <Eye className="w-3.5 h-3.5 text-[#22C55E]" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{logo.isActive ? 'Active' : 'Hidden'}</span>
                  </button>

                  <button
                    onClick={() => setEditingLogo(logo)}
                    className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                    title="Edit logo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(logo.id, logo.name)}
                    className="p-2 rounded-xl border border-neutral-200 text-red-500 hover:bg-red-50 hover:border-red-200 cursor-pointer"
                    title="Delete logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

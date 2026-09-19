import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Star, Check, 
  Eye, EyeOff, UploadCloud, RefreshCw, Play
} from 'lucide-react';
import { 
  fetchAllCmsData, 
  saveCmsTestimonial, 
  deleteCmsTestimonial, 
  TestimonialItem,
  uploadFileWithStreamingProgress
} from '../../../services/cmsService';
import { SafeImage } from '../../SafeImage';

export const CmsTestimonialsTab: React.FC = () => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<TestimonialItem> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAllCmsData(true);
    setTestimonials(data.testimonials || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleToggleActive = async (item: TestimonialItem) => {
    const updated = await saveCmsTestimonial({ ...item, isActive: !item.isActive });
    if (updated) {
      setTestimonials((prev) => prev.map((t) => (t.id === item.id ? { ...t, isActive: !t.isActive } : t)));
      showStatus(`Testimonial from "${item.name}" is now ${!item.isActive ? 'Active' : 'Hidden'}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete testimonial from "${name}"?`)) {
      const ok = await deleteCmsTestimonial(id);
      if (ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        showStatus(`Testimonial from "${name}" deleted.`);
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        avatar: res.file.url,
      }));
      showStatus('Avatar image uploaded successfully!');
    } else {
      alert(`Upload failed: ${res.error}`);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem?.quote) {
      alert('Please provide author name and testimonial quote');
      return;
    }

    const saved = await saveCmsTestimonial({
      ...editingItem,
      rating: editingItem.rating || 5,
      avatar: editingItem.avatar || '/images/avatars/alex-tubio.webp',
      isActive: editingItem.isActive ?? true,
      displayOrder: editingItem.displayOrder ?? (testimonials.length + 1),
    });

    if (saved) {
      setEditingItem(null);
      await loadData();
      showStatus(`Testimonial from "${saved.name}" saved!`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#0B0B0D] tracking-tight">
            Client & Creator Testimonials
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Manage creator quotes, star ratings, case highlights, and video review links.
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
                name: '',
                role: 'Content Creator',
                company: '',
                quote: '',
                avatar: '/images/avatars/alex-tubio.webp',
                vimeoId: '',
                rating: 5,
                highlight: 'Verified Result',
                subscribers: '',
                isActive: true,
              })
            }
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-black font-bold text-xs uppercase tracking-wider cursor-pointer transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Testimonial</span>
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
              {editingItem.id ? 'Edit Testimonial' : 'Add New Testimonial'}
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
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Client / Creator Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Alex Tubio"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Role / Title
                </label>
                <input
                  type="text"
                  value={editingItem.role || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                  placeholder="e.g. YouTube Creator & Strategist"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Audience / Company
                </label>
                <input
                  type="text"
                  value={editingItem.subscribers || editingItem.company || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, subscribers: e.target.value, company: e.target.value })
                  }
                  placeholder="e.g. 140K+ Subs or Agency CEO"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Testimonial Quote *
              </label>
              <textarea
                required
                rows={3}
                value={editingItem.quote || ''}
                onChange={(e) => setEditingItem({ ...editingItem, quote: e.target.value })}
                placeholder="FEVIQO completely transformed our production workflow..."
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Metric Highlight Pill
                </label>
                <input
                  type="text"
                  value={editingItem.highlight || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, highlight: e.target.value })}
                  placeholder="e.g. 800K Monthly Views, $60K Closed"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Video Review Vimeo ID (Optional)
                </label>
                <input
                  type="text"
                  value={editingItem.vimeoId || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, vimeoId: e.target.value })}
                  placeholder="e.g. 922887065"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Star Rating (1 - 5)
                </label>
                <select
                  value={editingItem.rating || 5}
                  onChange={(e) => setEditingItem({ ...editingItem, rating: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden"
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                </select>
              </div>
            </div>

            {/* Avatar upload */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Avatar Photo File or URL
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={editingItem.avatar || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, avatar: e.target.value })}
                  placeholder="/images/avatars/person.svg or /uploads/..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-[#22C55E] focus:outline-hidden font-mono"
                />
                <label className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shrink-0">
                  <UploadCloud className="w-4 h-4 text-[#22C55E]" />
                  <span>{isUploading ? `Uploading ${uploadPercent}%` : 'Upload Avatar'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
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
                  id="testimonialActive"
                  checked={editingItem.isActive ?? true}
                  onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#22C55E]"
                />
                <label htmlFor="testimonialActive" className="text-xs text-neutral-300 font-medium cursor-pointer">
                  Publish to live website
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
                  Save Testimonial
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-12 text-center text-neutral-400 text-xs border border-neutral-200">
            No testimonials recorded. Click "Add Testimonial" to create one.
          </div>
        ) : (
          testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  {item.highlight && (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.highlight}
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-700 italic leading-relaxed mb-5">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-950">{item.name}</h4>
                    <p className="text-[10px] text-neutral-500">{item.role || item.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.vimeoId && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-current text-[#22C55E]" />
                      <span>Video</span>
                    </span>
                  )}
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
                    onClick={() => handleDelete(item.id, item.name)}
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

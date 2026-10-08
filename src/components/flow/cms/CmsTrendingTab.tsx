import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit2, Check, Sparkles, Newspaper, Tag, Globe, Search
} from 'lucide-react';
import { 
  TRENDING_ARTICLES, 
  TRENDING_CATEGORIES, 
  TrendingArticle, 
  TrendingCategory, 
  ArticleStatus,
  addOrUpdateArticle,
  deleteArticleById
} from '../../../data/trendingArticlesData';

export const CmsTrendingTab: React.FC = () => {
  const [articles, setArticles] = useState<TrendingArticle[]>([...TRENDING_ARTICLES]);
  const [selectedCategory, setSelectedCategory] = useState<TrendingCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingArticle, setEditingArticle] = useState<Partial<TrendingArticle> | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const filteredArticles = articles.filter(a => {
    const matchesCat = selectedCategory === 'All' || selectedCategory === 'Trending' || a.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      a.title.toLowerCase().includes(query) ||
      a.slug.toLowerCase().includes(query) ||
      a.primaryKeyword.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle?.title || !editingArticle?.slug) {
      alert('Article title and URL slug are required.');
      return;
    }

    const cleanSlug = editingArticle.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const fullArticle: TrendingArticle = {
      id: editingArticle.id || `art-${Date.now()}`,
      title: editingArticle.title,
      slug: cleanSlug,
      excerpt: editingArticle.excerpt || '',
      content: editingArticle.content || '',
      category: (editingArticle.category as TrendingCategory) || 'US News',
      subcategory: editingArticle.subcategory || '',
      primaryKeyword: editingArticle.primaryKeyword || editingArticle.title,
      secondaryKeywords: editingArticle.secondaryKeywords || [],
      searchIntent: editingArticle.searchIntent || 'Informational search intent',
      tags: editingArticle.tags || ['Trending News'],
      featuredImage: editingArticle.featuredImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
      imageCaption: editingArticle.imageCaption || '',
      author: editingArticle.author || {
        name: 'FEVIQO Editorial Desk',
        role: 'News & Insights Team',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
      },
      publishedAt: editingArticle.publishedAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      readingTime: editingArticle.readingTime || '4 min read',
      status: (editingArticle.status as ArticleStatus) || 'Confirmed',
      factStatus: editingArticle.factStatus || 'Confirmed Policy',
      trendingScore: editingArticle.trendingScore || 85,
      keyTakeaways: editingArticle.keyTakeaways || [],
      sources: editingArticle.sources || [{ title: 'FEVIQO News Verification Desk', url: 'https://feviqo.com' }],
      featured: editingArticle.featured || false,
      indexed: editingArticle.indexed !== false,
      seoTitle: editingArticle.seoTitle || `${editingArticle.title} | FEVIQO Trending`,
      seoDescription: editingArticle.seoDescription || editingArticle.excerpt || '',
      focusKeyword: editingArticle.focusKeyword || editingArticle.primaryKeyword || 'trending news',
      canonicalUrl: `https://feviqo.com/trending/${cleanSlug}`,
    };

    addOrUpdateArticle(fullArticle);
    setArticles([...TRENDING_ARTICLES]);
    setEditingArticle(null);
    showStatus(`Article "${fullArticle.title}" saved successfully!`);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the article "${title}"?`)) {
      deleteArticleById(id);
      setArticles([...TRENDING_ARTICLES]);
      showStatus(`Article "${title}" deleted.`);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-[#22C55E]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#22C55E]" />
            <span>Trending Articles &amp; Editorial Content Manager</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Publish high-intent search articles, manage categories, and configure SEO &amp; source citations.
          </p>
        </div>

        <button
          onClick={() => setEditingArticle({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            category: 'US News',
            status: 'Confirmed',
            factStatus: 'Official Announcement',
            publishedAt: new Date().toISOString().split('T')[0],
            readingTime: '4 min read',
            featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
            sources: [{ title: 'Official Source', url: 'https://feviqo.com' }],
            tags: ['Trending News']
          })}
          className="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Trending Article</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {TRENDING_CATEGORIES.slice(0, 8).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Filter articles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#22C55E]"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Article</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Published</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredArticles.map(art => (
                <tr key={art.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-bold text-slate-900 max-w-md">
                    <div className="flex items-center gap-3">
                      <img src={art.featuredImage} alt={art.title} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                      <div>
                        <div className="line-clamp-1">{art.title}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold font-mono">/trending/{art.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{art.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      art.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      art.status === 'Developing' ? 'bg-amber-100 text-amber-800' :
                      art.status === 'Rumored' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {art.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{art.publishedAt}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingArticle(art)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(art.id, art.title)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDITING / CREATING MODAL */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-3xl w-full my-8 space-y-6 shadow-2xl text-left">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingArticle.id ? 'Edit Trending Article' : 'Create New Trending Article'}
              </h3>
              <button 
                onClick={() => setEditingArticle(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Article Title *</label>
                  <input 
                    type="text"
                    required
                    value={editingArticle.title || ''}
                    onChange={e => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                      setEditingArticle(prev => ({ ...prev, title, slug: prev?.slug ? prev.slug : slug }));
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Slug * (/trending/...)</label>
                  <input 
                    type="text"
                    required
                    value={editingArticle.slug || ''}
                    onChange={e => setEditingArticle(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-emerald-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Summary / Excerpt *</label>
                <textarea 
                  required
                  rows={2}
                  value={editingArticle.excerpt || ''}
                  onChange={e => setEditingArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Main Article Body Content *</label>
                <textarea 
                  required
                  rows={8}
                  value={editingArticle.content || ''}
                  onChange={e => setEditingArticle(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select 
                    value={editingArticle.category || 'US News'}
                    onChange={e => setEditingArticle(prev => ({ ...prev, category: e.target.value as TrendingCategory }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  >
                    {TRENDING_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Article Status</label>
                  <select 
                    value={editingArticle.status || 'Confirmed'}
                    onChange={e => setEditingArticle(prev => ({ ...prev, status: e.target.value as ArticleStatus }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Developing">Developing</option>
                    <option value="Proposed">Proposed</option>
                    <option value="Rumored">Rumored</option>
                    <option value="Reported">Reported</option>
                    <option value="Court-blocked">Court-blocked</option>
                    <option value="Effective">Effective</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Featured Image URL</label>
                  <input 
                    type="text"
                    value={editingArticle.featuredImage || ''}
                    onChange={e => setEditingArticle(prev => ({ ...prev, featuredImage: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SEO Title</label>
                  <input 
                    type="text"
                    value={editingArticle.seoTitle || ''}
                    onChange={e => setEditingArticle(prev => ({ ...prev, seoTitle: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Focus Keyword</label>
                  <input 
                    type="text"
                    value={editingArticle.focusKeyword || ''}
                    onChange={e => setEditingArticle(prev => ({ ...prev, focusKeyword: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black cursor-pointer shadow-md"
                >
                  Save &amp; Publish Article
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

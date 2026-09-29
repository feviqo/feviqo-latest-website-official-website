import React, { useState, useEffect } from 'react';
import { X, Search, Globe, Share2, Sparkles, Check, Settings, Code, Eye, RefreshCw, FileText } from 'lucide-react';
import { DEFAULT_PAGE_SEO, PageSEOConfig, getSEOConfigForPath, saveSEOConfigForPath } from '../../seo/seoStore';
import { GLOBAL_KEYWORD_TAXONOMY } from '../../seo/taxonomy';

interface SEOAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
}

export const SEOAdminModal: React.FC<SEOAdminModalProps> = ({ isOpen, onClose, currentPath = '/' }) => {
  const [selectedPath, setSelectedPath] = useState<string>(currentPath);
  const [formConfig, setFormConfig] = useState<PageSEOConfig>(getSEOConfigForPath(currentPath));
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'schema' | 'preview'>('general');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    setSelectedPath(currentPath);
    setFormConfig(getSEOConfigForPath(currentPath));
  }, [currentPath]);

  useEffect(() => {
    setFormConfig(getSEOConfigForPath(selectedPath));
  }, [selectedPath]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSEOConfigForPath(selectedPath, formConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetToDefault = () => {
    if (DEFAULT_PAGE_SEO[selectedPath]) {
      setFormConfig(DEFAULT_PAGE_SEO[selectedPath]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>FEVIQO SEO Control Center</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">CMS</span>
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Manage metadata, search appearance, and structured data across all routes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Route Selector & Tabs */}
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          
          {/* Path Selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Page Route:</span>
            <select
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {Object.keys(DEFAULT_PAGE_SEO).map((path) => (
                <option key={path} value={path}>
                  {path} — ({DEFAULT_PAGE_SEO[path].pageName})
                </option>
              ))}
            </select>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'general' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Search Metadata</span>
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'social' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Open Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'schema' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>JSON-LD Schema</span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Google Preview</span>
            </button>
          </div>

        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6 text-left text-xs text-slate-800">
          
          {/* TAB 1: GENERAL SEARCH METADATA */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  SEO Title Tag
                </label>
                <input
                  type="text"
                  value={formConfig.seoTitle}
                  onChange={(e) => setFormConfig({ ...formConfig, seoTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  placeholder="Page SEO Title"
                  required
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Recommended: 50–60 characters</span>
                  <span className={formConfig.seoTitle.length > 60 ? 'text-amber-600 font-bold' : ''}>
                    {formConfig.seoTitle.length} / 60
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formConfig.metaDescription}
                  onChange={(e) => setFormConfig({ ...formConfig, metaDescription: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  placeholder="Meta description summary..."
                  required
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Recommended: 120–160 characters</span>
                  <span className={formConfig.metaDescription.length > 160 ? 'text-amber-600 font-bold' : ''}>
                    {formConfig.metaDescription.length} / 160
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Primary Focus Keyword
                  </label>
                  <input
                    type="text"
                    value={formConfig.focusKeyword}
                    onChange={(e) => setFormConfig({ ...formConfig, focusKeyword: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. unlimited video editing"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Robots Directive
                  </label>
                  <select
                    value={formConfig.robots}
                    onChange={(e) => setFormConfig({ ...formConfig, robots: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
                      index, follow (Public - Recommended)
                    </option>
                    <option value="noindex, nofollow">noindex, nofollow (Private Admin / Private Client)</option>
                    <option value="index, nofollow">index, nofollow</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={formConfig.canonicalUrl}
                  onChange={(e) => setFormConfig({ ...formConfig, canonicalUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://feviqo.com/..."
                />
              </div>

            </div>
          )}

          {/* TAB 2: OPEN GRAPH SOCIAL CARDS */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Open Graph Title (Facebook / Twitter / LinkedIn)
                </label>
                <input
                  type="text"
                  value={formConfig.ogTitle}
                  onChange={(e) => setFormConfig({ ...formConfig, ogTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Open Graph Description
                </label>
                <textarea
                  rows={3}
                  value={formConfig.ogDescription}
                  onChange={(e) => setFormConfig({ ...formConfig, ogDescription: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Open Graph Image URL
                </label>
                <input
                  type="url"
                  value={formConfig.ogImage}
                  onChange={(e) => setFormConfig({ ...formConfig, ogImage: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: JSON-LD STRUCTURED DATA */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Primary Schema Type
                </label>
                <select
                  value={formConfig.schemaType}
                  onChange={(e) => setFormConfig({ ...formConfig, schemaType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="WebSite">WebSite (Homepage)</option>
                  <option value="Service">Service (Unlimited Editing, Creators, Agencies)</option>
                  <option value="TVEpisode">TVEpisode (Episode 186 Watch Page)</option>
                  <option value="TVSeries">TVSeries (Teskilat Main Page)</option>
                  <option value="Organization">Organization (About Us)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Custom JSON-LD Injection (Optional)
                </label>
                <textarea
                  rows={6}
                  value={formConfig.customJsonLd || ''}
                  onChange={(e) => setFormConfig({ ...formConfig, customJsonLd: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  placeholder={`{\n  "@type": "Question",\n  "name": "..."\n}`}
                />
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE SEARCH PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900">Google Search Appearance Simulator</span>
                
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1 rounded-lg transition ${
                      previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Desktop Result
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1 rounded-lg transition ${
                      previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Mobile Result
                  </button>
                </div>
              </div>

              {/* Google Result Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
                    F
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-900">FEVIQO</span>
                    <span className="text-slate-400 mx-1.5">&bull;</span>
                    <span className="text-slate-500">{formConfig.canonicalUrl}</span>
                  </div>
                </div>

                <div className="text-blue-800 hover:underline font-medium text-lg leading-snug cursor-pointer">
                  {formConfig.seoTitle}
                </div>

                <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                  {formConfig.metaDescription}
                </p>
              </div>

              {/* Social Card Preview */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Social Sharing Snippet (OpenGraph)</span>
                
                <div className="max-w-md rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs">
                  <div className="h-40 bg-slate-200 relative overflow-hidden">
                    <img 
                      src={formConfig.ogImage} 
                      alt="Social Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="p-3 bg-slate-100 text-left space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">feviqo.com</div>
                    <div className="font-bold text-slate-900 text-xs truncate">{formConfig.ogTitle}</div>
                    <div className="text-slate-600 text-[11px] line-clamp-2">{formConfig.ogDescription}</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-3">
              {savedSuccess && (
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>SEO Saved &amp; Live!</span>
                </span>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Save SEO Config</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

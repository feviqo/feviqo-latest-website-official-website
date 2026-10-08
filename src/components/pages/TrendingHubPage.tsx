import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Clock, 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { 
  TRENDING_ARTICLES, 
  TRENDING_CATEGORIES, 
  TrendingCategory, 
  TrendingArticle 
} from '../../data/trendingArticlesData';
import { AppRoute } from '../../types';

interface TrendingHubPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute | string) => void;
  onSelectArticle?: (slug: string) => void;
}

export const TrendingHubPage: React.FC<TrendingHubPageProps> = ({
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
  onSelectArticle,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TrendingCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // SEO & Head Metadata Effect
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const pageTitle = "FEVIQO Trending – What People Are Searching, Watching & Talking About";
    const metaDesc = "Discover timely stories, explainers, updates, and insights on US news, immigration rules, AI breakthroughs, business, and job market trends on FEVIQO Trending.";
    const keywords = "trending news, US immigration updates, H-1B visa 2026, AI news, tech job market, business funding trends, FEVIQO editorial, FEVIQO trending";

    document.title = pageTitle;

    const metaDescEl = document.querySelector('meta[name="description"]');
    if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);

    const keywordsEl = document.querySelector('meta[name="keywords"]');
    if (keywordsEl) keywordsEl.setAttribute('content', keywords);

    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) ogTitleEl.setAttribute('content', pageTitle);

    const ogDescEl = document.querySelector('meta[property="og:description"]');
    if (ogDescEl) ogDescEl.setAttribute('content', metaDesc);

    const twTitleEl = document.querySelector('meta[name="twitter:title"]');
    if (twTitleEl) twTitleEl.setAttribute('content', pageTitle);

    const twDescEl = document.querySelector('meta[name="twitter:description"]');
    if (twDescEl) twDescEl.setAttribute('content', metaDesc);
  }, []);

  // Filter articles based on category and search query
  const filteredArticles = TRENDING_ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === 'All' || selectedCategory === 'Trending' || article.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.tags.some(tag => tag.toLowerCase().includes(query)) ||
      article.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles.find(a => a.featured) || filteredArticles[0];
  const remainingArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);

  const handleArticleClick = (slug: string) => {
    if (onSelectArticle) {
      onSelectArticle(slug);
    } else {
      onNavigatePage(`trending/${slug}`);
    }
  };

  return (
    <div className="w-full bg-white text-slate-900 font-sans antialiased min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#22C55E] selection:text-white">
      
      {/* Navigation Header */}
      <Navbar 
        onBookCall={onBookCall} 
        onNavigateSection={() => onNavigatePage('home')}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      {/* EDITORIAL HERO SECTION */}
      <section className="w-full bg-[#031d12] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-950 relative overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-left space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>FEVIQO TRENDING HUB</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl leading-tight">
            What people are searching, watching, and talking about right now.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
            Timely stories, explainers, updates, and insights on the topics shaping the conversation.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search trending topics, visas, AI, or business news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-emerald-500/30 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* CATEGORY NAV BAR */}
      <section className="sticky top-[61px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-2 shrink-0 py-1">
            {TRENDING_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                    isActive 
                      ? 'bg-slate-950 text-white border-slate-950 shadow-sm' 
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-semibold shrink-0">
            <span>Showing {filteredArticles.length} Stories</span>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* FEATURED STORY HERO CARD */}
        {featuredArticle && !searchQuery && selectedCategory === 'All' && (
          <section className="w-full">
            <div 
              onClick={() => handleArticleClick(featuredArticle.slug)}
              className="group bg-slate-50/50 hover:bg-slate-100/60 border border-slate-200 rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center cursor-pointer transition duration-300 text-left shadow-sm hover:shadow-md"
            >
              {/* Image Panel */}
              <div className="lg:col-span-7 aspect-video sm:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-200 relative border border-slate-200/80 shadow-sm">
                <img 
                  src={featuredArticle.featuredImage} 
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#22C55E] text-slate-950 font-black text-[10px] uppercase tracking-wider shadow">
                    FEATURED STORY
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-sm">
                    {featuredArticle.category}
                  </span>
                </div>
              </div>

              {/* Text Panel */}
              <div className="lg:col-span-5 space-y-4 flex flex-col justify-between h-full py-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {featuredArticle.publishedAt}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featuredArticle.readingTime}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-emerald-700 transition tracking-tight leading-tight">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {featuredArticle.author.avatar && (
                      <img 
                        src={featuredArticle.author.avatar} 
                        alt={featuredArticle.author.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                      />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900">{featuredArticle.author.name}</div>
                      <div className="text-[10px] text-slate-500">{featuredArticle.author.role}</div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 text-xs font-black text-[#22C55E] group-hover:translate-x-1 transition-transform">
                    <span>Read Story</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* ARTICLES GRID */}
        <section className="space-y-6 text-left">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{selectedCategory === 'All' ? 'Latest Trending Stories' : `${selectedCategory} Articles`}</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">{filteredArticles.length} published stories</span>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(searchQuery || selectedCategory !== 'All' ? filteredArticles : remainingArticles).map((article) => (
                <article 
                  key={article.id}
                  onClick={() => handleArticleClick(article.slug)}
                  className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden cursor-pointer transition duration-200 flex flex-col justify-between h-full shadow-sm hover:shadow-md"
                >
                  <div className="space-y-4">
                    {/* Aspect rectangle thumbnail */}
                    <div className="aspect-video bg-slate-100 relative overflow-hidden border-b border-slate-100">
                      <img 
                        src={article.featuredImage} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-950/85 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    <div className="px-5 pt-1 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                        <span>{article.publishedAt}</span>
                        <span>•</span>
                        <span>{article.readingTime}</span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {article.factStatus}
                    </span>
                    <span className="font-bold text-[#22C55E] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>Read</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-slate-200 rounded-3xl space-y-3">
              <p className="text-base font-bold text-slate-600">No trending articles found for "{searchQuery || selectedCategory}".</p>
              <button 
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="text-xs text-[#22C55E] font-black hover:underline"
              >
                Reset Search &amp; Filters
              </button>
            </div>
          )}

        </section>

        {/* EDITORIAL NEWSLETTER & VIDEO PRODUCTION CTA BANNER */}
        <section className="w-full bg-[#031d12] text-white border border-emerald-950 rounded-3xl p-8 sm:p-12 text-left relative overflow-hidden shadow-xl">
          <div className="max-w-4xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FEVIQO CREATIVE &amp; EDITORIAL STUDIO</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Turn Your Brand's Key Insights into High-Retention Video Content
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              FEVIQO provides dedicated video editing pods for creators, marketing teams, and businesses. We transform complex reports, podcasts, and video shoots into high-converting YouTube videos, Reels, and ads.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button 
                onClick={onBookCall}
                className="px-8 py-3.5 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md text-center"
              >
                Start a Video Project
              </button>
              <button 
                onClick={() => onNavigatePage('gallery')}
                className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer border border-white/20 text-center"
              >
                Explore Video Work
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer 
        onBookCall={onBookCall}
        onGetStarted={onBookCall}
        onNavigateSection={() => onNavigatePage('home')}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={() => onNavigatePage('flow')}
        onNavigatePage={(route) => onNavigatePage(route)}
      />
    </div>
  );
};

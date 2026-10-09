import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Share2, 
  ArrowLeft, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Tag, 
  Bookmark, 
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { 
  getArticleBySlug, 
  TRENDING_ARTICLES, 
  TrendingArticle 
} from '../../data/trendingArticlesData';
import { AppRoute } from '../../types';
import { AdBanner728x90 } from '../AdBanner728x90';
import { AdBanner320x50 } from '../AdBanner320x50';
import { AdBanner468x60 } from '../AdBanner468x60';
import { AdBanner300x250 } from '../AdBanner300x250';
import { AdBanner160x300 } from '../AdBanner160x300';
import { AdNativeBanner } from '../AdNativeBanner';

interface TrendingArticlePageProps {
  slug: string;
  onBackToTrending: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute | string) => void;
  onSelectArticle?: (slug: string) => void;
}

export const TrendingArticlePage: React.FC<TrendingArticlePageProps> = ({
  slug,
  onBackToTrending,
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
  onSelectArticle,
}) => {
  const article = getArticleBySlug(slug) || TRENDING_ARTICLES[0];
  const [copied, setCopied] = useState(false);

  // SEO Effect & Head Metadata Update
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const pageTitle = article.seoTitle || `${article.title} | FEVIQO Trending`;
    const metaDesc = article.seoDescription || article.excerpt;
    const keywords = article.tags ? article.tags.join(', ') : 'trending news, feviqo trending';

    document.title = pageTitle;

    const metaDescEl = document.querySelector('meta[name="description"]');
    if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);

    const keywordsEl = document.querySelector('meta[name="keywords"]');
    if (keywordsEl) keywordsEl.setAttribute('content', keywords);

    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) ogTitleEl.setAttribute('content', pageTitle);

    const ogDescEl = document.querySelector('meta[property="og:description"]');
    if (ogDescEl) ogDescEl.setAttribute('content', metaDesc);

    const ogImgEl = document.querySelector('meta[property="og:image"]');
    if (ogImgEl) ogImgEl.setAttribute('content', article.featuredImage);

    const twTitleEl = document.querySelector('meta[name="twitter:title"]');
    if (twTitleEl) twTitleEl.setAttribute('content', pageTitle);

    const twDescEl = document.querySelector('meta[name="twitter:description"]');
    if (twDescEl) twDescEl.setAttribute('content', metaDesc);

    const twImgEl = document.querySelector('meta[name="twitter:image"]');
    if (twImgEl) twImgEl.setAttribute('content', article.featuredImage);
  }, [slug, article]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const relatedArticles = TRENDING_ARTICLES.filter(a => a.id !== article.id).slice(0, 3);

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

      <main className="w-full flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left">
        
        {/* BREADCRUMBS ROW */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto pb-1">
          <span 
            onClick={() => onNavigatePage('home')} 
            className="hover:text-slate-900 cursor-pointer transition"
          >
            FEVIQO
          </span>
          <span>/</span>
          <span 
            onClick={onBackToTrending} 
            className="hover:text-slate-900 cursor-pointer transition"
          >
            Trending
          </span>
          <span>/</span>
          <span className="text-slate-400 font-normal">{article.category}</span>
          <span>/</span>
          <span className="text-emerald-700 font-bold truncate max-w-[200px]">{article.title}</span>
        </nav>

        {/* HEADER META: Category & Fact Verification Badges */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <span className="px-3 py-1 rounded-full bg-slate-950 text-white font-bold text-xs uppercase tracking-wider">
            {article.category}
          </span>
          <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider ${
            article.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
            article.status === 'Developing' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
            article.status === 'Rumored' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
            article.status === 'Proposed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
            'bg-slate-100 text-slate-800 border border-slate-300'
          }`}>
            Status: {article.status || 'Confirmed'}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>{article.factStatus}</span>
          </span>
        </div>

        {/* MAIN H1 TITLE */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {article.title}
        </h1>

        {/* SHORT ARTICLE SUMMARY / DEK */}
        <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed border-l-4 border-[#22C55E] pl-4 italic">
          {article.excerpt}
        </p>

        {/* AUTHOR & DATES BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-200 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-3">
            {article.author.avatar && (
              <img 
                src={article.author.avatar} 
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
            )}
            <div>
              <div className="font-bold text-slate-900">{article.author.name}</div>
              <div className="text-xs text-slate-500">{article.author.role}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Published: {article.publishedAt}</span>
            </div>
            {article.updatedAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Updated: {article.updatedAt}</span>
              </div>
            )}
            <div className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
              {article.readingTime}
            </div>
          </div>
        </div>

        {/* LEADERBOARD AD */}
        <div className="my-4">
          <div className="hidden md:block">
            <AdBanner728x90 />
          </div>
          <div className="block md:hidden">
            <AdBanner320x50 />
          </div>
        </div>

        {/* FEATURED IMAGE */}
        <div className="space-y-2">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-sm">
            <img 
              src={article.featuredImage} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
          {article.imageCaption && (
            <p className="text-xs text-slate-500 italic text-center">
              {article.imageCaption}
            </p>
          )}
        </div>

        {/* IN-ARTICLE AD BANNER SUITE */}
        <div className="space-y-4 my-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-6 my-4">
            <AdBanner468x60 />
            <AdBanner300x250 />
            <AdBanner160x300 />
          </div>

          {/* SPONSORED SMARTLINK */}
          <div className="flex justify-center my-3">
            <a
              href="https://arwf.org/4/407c2859d48b877cf406dc93dcd6c1d5"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black tracking-wide transition inline-flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Sponsored Trending Update Mirror (FEVIQO Network)</span>
            </a>
          </div>
        </div>

        {/* MAIN ARTICLE BODY CONTENT */}
        <article className="prose prose-slate max-w-none space-y-6 text-slate-800 text-base sm:text-lg leading-relaxed font-normal pt-2">
          {article.content.split('\n\n').map((para, idx) => {
            const trimmed = para.trim();
            if (!trimmed) return null;

            // Render H3 headings
            if (trimmed.startsWith('### ')) {
              return (
                <h2 key={idx} className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-6 pb-2 border-b border-slate-100">
                  {trimmed.replace('### ', '')}
                </h2>
              );
            }

            // Render H4 / subheadings
            if (trimmed.startsWith('#### ')) {
              return (
                <h3 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 pt-4 pb-1">
                  {trimmed.replace('#### ', '')}
                </h3>
              );
            }

            // Render bullet lists
            if (trimmed.startsWith('- ') || trimmed.includes('\n- ')) {
              const items = trimmed.split('\n').map(item => item.replace(/^- /, '').trim()).filter(Boolean);
              return (
                <ul key={idx} className="list-disc pl-6 space-y-2 text-slate-700 my-4">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              );
            }

            // Render numbered lists
            if (/^\d+\.\s/.test(trimmed)) {
              const items = trimmed.split('\n').map(item => item.replace(/^\d+\.\s/, '').trim()).filter(Boolean);
              return (
                <ol key={idx} className="list-decimal pl-6 space-y-2 text-slate-700 my-4">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx} className="leading-relaxed">{item}</li>
                  ))}
                </ol>
              );
            }

            return (
              <p key={idx} className="text-slate-800 leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </article>

        {/* SOURCES & CITATIONS */}
        {article.sources && article.sources.length > 0 && (
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Official Policy Sources &amp; References</span>
            </h4>
            <div className="flex flex-wrap gap-3">
              {article.sources.map((src, idx) => (
                <a 
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition"
                >
                  <span>{src.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* TAGS ROW */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {article.tags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>

            <button 
              onClick={handleCopyLink}
              className="text-xs font-bold text-slate-700 hover:text-emerald-700 transition flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Share2 className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>{copied ? 'Link Copied!' : 'Copy Article Link'}</span>
            </button>
          </div>
        )}

        {/* NATIVE BANNER AD */}
        <div className="my-6">
          <AdNativeBanner />
        </div>

        {/* RELATED STORIES */}
        <div className="pt-12 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Related Trending Stories</h3>
            <button 
              onClick={onBackToTrending} 
              className="text-xs font-bold text-[#22C55E] hover:underline flex items-center gap-1"
            >
              <span>View All Trending</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => (
              <div 
                key={rel.id}
                onClick={() => {
                  if (onSelectArticle) {
                    onSelectArticle(rel.slug);
                  } else {
                    onNavigatePage(`trending/${rel.slug}`);
                  }
                }}
                className="group cursor-pointer space-y-3 bg-white hover:bg-slate-50 p-3 rounded-2xl border border-slate-100 transition shadow-sm"
              >
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                  <img 
                    src={rel.featuredImage} 
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{rel.category}</span>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BACK TO TRENDING BUTTON */}
        <div className="pt-6 flex justify-start">
          <button
            onClick={onBackToTrending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Trending Hub</span>
          </button>
        </div>

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

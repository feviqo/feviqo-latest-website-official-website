import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Menu, 
  X, 
  Sparkles, 
  Video, 
  Briefcase, 
  TrendingUp,
  FileCheck,
  MessageSquareQuote,
  Lock,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { FeviqoHeaderLogo } from './FeviqoLogo';
import { AppRoute } from '../types';

interface NavbarProps {
  onBookCall: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigatePricing: () => void;
  onNavigateFlow: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onBookCall, 
  onNavigateSection,
  onNavigatePricing,
  onNavigateFlow,
  onNavigatePage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          // Hysteresis prevents rapid boundary jitter: activate at >24px, deactivate only below 8px
          setScrolled((prev) => (prev ? y > 8 : y > 24));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      id="feviqo-global-header" 
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled 
          ? 'bg-[#032415]/95 backdrop-blur-md border-b border-[#064e3b]/90 shadow-lg py-3.5' 
          : 'bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border-b border-[#064e3b]/60 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigatePage('home'); }}
            className="flex items-center group py-0.5"
            aria-label="FEVIQO Home"
          >
            <FeviqoHeaderLogo 
              theme="dark" 
              className="h-7 sm:h-8 w-auto transition-opacity group-hover:opacity-85" 
            />
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-[13px] font-semibold text-white">
          
          {/* Work / Gallery */}
          <button 
            onClick={() => onNavigatePage('gallery')}
            className="px-3.5 py-2 rounded-full hover:bg-white/15 transition cursor-pointer text-white font-medium"
          >
            Work
          </button>

          {/* Solutions Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button 
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full hover:bg-white/15 transition cursor-pointer text-white font-medium"
            >
              Solutions
              <ChevronDown className={`w-3.5 h-3.5 transition-transform text-emerald-200 ${solutionsOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {solutionsOpen && (
              <div className="absolute top-full left-0 w-80 bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-1 duration-150 z-50 text-white ring-1 ring-white/10">
                <div className="space-y-1">
                  <button 
                    onClick={() => { onNavigatePage('creators'); setSolutionsOpen(false); }}
                    className="w-full text-left p-3 rounded-xl hover:bg-white/15 flex items-start gap-3 transition group cursor-pointer border border-transparent hover:border-white/15"
                  >
                    <div className="p-2 rounded-xl bg-white/10 text-emerald-400 border border-white/10 group-hover:bg-white/20 transition shadow-inner">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold uppercase tracking-wider">Content Creators</div>
                      <div className="text-slate-300 text-xs mt-0.5">High-retention editing for YouTubers &amp; streamers.</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => { onNavigatePage('business'); setSolutionsOpen(false); }}
                    className="w-full text-left p-3 rounded-xl hover:bg-white/15 flex items-start gap-3 transition group cursor-pointer border border-transparent hover:border-white/15"
                  >
                    <div className="p-2 rounded-xl bg-white/10 text-emerald-400 border border-white/10 group-hover:bg-white/20 transition shadow-inner">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold uppercase tracking-wider">Business Owners</div>
                      <div className="text-slate-300 text-xs mt-0.5">Turn 1 founder recording into a multi-channel video suite.</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => { onNavigatePage('agencies'); setSolutionsOpen(false); }}
                    className="w-full text-left p-3 rounded-xl hover:bg-white/15 flex items-start gap-3 transition group cursor-pointer border border-transparent hover:border-white/15"
                  >
                    <div className="p-2 rounded-xl bg-white/10 text-emerald-400 border border-white/10 group-hover:bg-white/20 transition shadow-inner">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold uppercase tracking-wider">Marketers &amp; Agencies</div>
                      <div className="text-slate-300 text-xs mt-0.5">White-label editing pods scaling retainer capacity.</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Services Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button 
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full hover:bg-white/15 transition cursor-pointer text-white font-medium"
            >
              Services
              <ChevronDown className={`w-3.5 h-3.5 transition-transform text-slate-300 ${servicesOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {servicesOpen && (
              <div className="absolute top-full left-0 w-80 bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-1 duration-150 z-50 text-white ring-1 ring-white/10">
                <div className="space-y-1">
                  <button 
                    onClick={() => { onNavigatePage('unlimited-editing'); setServicesOpen(false); }}
                    className="w-full text-left p-3 rounded-xl hover:bg-white/15 flex items-start gap-3 transition group cursor-pointer border border-transparent hover:border-white/15"
                  >
                    <div className="p-2 rounded-xl bg-white/10 text-emerald-400 border border-white/10 group-hover:bg-white/20 transition shadow-inner">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold uppercase tracking-wider">Unlimited Video Editing</div>
                      <div className="text-slate-300 text-xs mt-0.5">Dedicated editor, 4K rendering &amp; 24–48h turnarounds.</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => { onNavigatePage('platform'); setServicesOpen(false); }}
                    className="w-full text-left p-3 rounded-xl hover:bg-white/15 flex items-start gap-3 transition group cursor-pointer border border-transparent hover:border-white/15"
                  >
                    <div className="p-2 rounded-xl bg-white/10 text-emerald-400 border border-white/10 group-hover:bg-white/20 transition shadow-inner">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold uppercase tracking-wider">FEVIQO Flow Platform</div>
                      <div className="text-slate-300 text-xs mt-0.5">Timestamped client revisions &amp; seamless asset management.</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => { onNavigatePage('turkish-drama'); setServicesOpen(false); }}
                    className="w-full text-left p-3 rounded-xl hover:bg-white/15 flex items-start gap-3 transition group cursor-pointer border-t border-white/10 mt-1 pt-2.5"
                  >
                    <div className="p-2 rounded-xl bg-white/10 text-emerald-400 border border-white/10 group-hover:bg-white/20 transition shadow-inner">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span>Turkish TV Licensing</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[9px] font-black">B2B</span>
                      </div>
                      <div className="text-slate-300 text-xs mt-0.5">Urdu dubbing &amp; authorized digital distribution in Pakistan.</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <button 
            onClick={onNavigatePricing}
            className="px-3.5 py-2 rounded-full hover:bg-white/15 transition cursor-pointer font-semibold text-white"
          >
            Pricing
          </button>

          {/* Resources Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button 
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full hover:bg-white/15 transition cursor-pointer text-white font-medium"
            >
              Resources
              <ChevronDown className={`w-3.5 h-3.5 transition-transform text-slate-300 ${resourcesOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {resourcesOpen && (
              <div className="absolute top-full left-0 w-72 bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-1 duration-150 z-50 text-white ring-1 ring-white/10">
                <div className="space-y-1">
                  <button 
                    onClick={() => { onNavigatePage('case-studies'); setResourcesOpen(false); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/15 flex items-center gap-3 transition group cursor-pointer border border-transparent hover:border-white/15"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Case Studies</span>
                  </button>
                  <button 
                    onClick={() => { onNavigatePage('testimonials'); setResourcesOpen(false); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/15 flex items-center gap-3 transition group cursor-pointer border border-transparent hover:border-white/15"
                  >
                    <MessageSquareQuote className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Client Reviews</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Teskilat Drama - Always navigates to Teskilat overview portal */}
          <button 
            onClick={() => {
              onNavigatePage('teskilat-urdu');
              window.dispatchEvent(new Event('teskilat-overview'));
              try { window.history.pushState({ route: 'teskilat-urdu' }, '', '/teskilat'); } catch {}
            }}
            className="px-3.5 py-2 rounded-full hover:bg-white/15 transition cursor-pointer text-white font-medium hover:text-emerald-300"
          >
            Teskilat Drama
          </button>
        </nav>

        {/* Right CTA & Access */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Desktop About Us in the Corner */}
          <button 
            onClick={() => onNavigatePage('about')}
            className="hidden lg:inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-semibold text-white/90 hover:bg-white/15 hover:text-emerald-300 transition cursor-pointer"
            title="About FEVIQO"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>About Us</span>
          </button>

          {/* Client Portal Login (Visible on all laptop/desktop screens, points directly to Client Login first) */}
          <button 
            onClick={() => onNavigateFlow('login')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/25 transition cursor-pointer"
            title="Login to FEVIQO Flow"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-300" />
            <span>Login</span>
          </button>

          {/* Primary Action */}
          <button
            onClick={onBookCall}
            id="nav-start-project-btn"
            className="bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black px-5 sm:px-6 py-2.5 rounded-full text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Start a Project
          </button>

          {/* Mobile menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-white hover:bg-white/15 transition cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu - Rendered as absolute overlay below header to prevent interference */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden absolute top-full left-0 right-0 bg-gradient-to-b from-[#032415] via-[#064e3b] to-[#032415] border-b border-[#064e3b] px-5 sm:px-6 py-5 space-y-4 shadow-2xl text-white max-h-[80vh] overflow-y-auto z-50 backdrop-blur-2xl ring-1 ring-emerald-500/20"
          >
            <div className="space-y-1">
              <button 
                onClick={() => { onNavigatePricing(); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 font-bold flex items-center justify-between text-white cursor-pointer"
              >
                <span>Pricing Plans</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#22C55E] text-slate-950 uppercase tracking-wider">Save $15.6k/yr</span>
              </button>
              
              <button 
                onClick={() => { onNavigatePage('gallery'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 font-medium cursor-pointer text-white"
              >
                Work & Gallery
              </button>

              <button 
                onClick={() => { onNavigatePage('creators'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 font-medium cursor-pointer text-white"
              >
                Content Creators
              </button>

              <button 
                onClick={() => { onNavigatePage('business'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 font-medium cursor-pointer text-white"
              >
                Business Owners
              </button>

              <button 
                onClick={() => { onNavigatePage('agencies'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 font-medium cursor-pointer text-white"
              >
                Marketers & Agencies
              </button>

              <button 
                onClick={() => { onNavigatePage('unlimited-editing'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 font-medium cursor-pointer text-white"
              >
                Unlimited Video Editing
              </button>

              <button 
                onClick={() => { onNavigatePage('platform'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 font-medium cursor-pointer text-white"
              >
                FEVIQO Flow Platform
              </button>

              <button 
                onClick={() => { onNavigatePage('testimonials'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 font-medium cursor-pointer text-white"
              >
                Client Reviews (Testimonials)
              </button>

              <button 
                onClick={() => { onNavigatePage('case-studies'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 font-medium cursor-pointer text-white"
              >
                Case Studies
              </button>

              {/* About Us Section */}
              <button 
                onClick={() => { onNavigatePage('about'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 font-bold cursor-pointer text-white flex items-center gap-2 border border-emerald-400/30 mt-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span>About Us & Executive Leadership</span>
              </button>

              {/* Teskilat Drama placed in the end on phone */}
              <button 
                onClick={() => {
                  onNavigatePage('teskilat-urdu');
                  window.dispatchEvent(new Event('teskilat-overview'));
                  try { window.history.pushState({ route: 'teskilat-urdu' }, '', '/teskilat'); } catch {}
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 font-extrabold cursor-pointer text-amber-300 flex items-center justify-between border border-amber-400/40 mt-1.5"
              >
                <span>Teskilat (Urdu Subtitles)</span>
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 font-black">Urdu HD</span>
              </button>

              {/* Turkish TV Licensing placed in the end on phone */}
              <button 
                onClick={() => { onNavigatePage('turkish-drama'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 font-bold cursor-pointer text-[#22C55E] flex items-center justify-between border border-emerald-500/20"
              >
                <span>Turkish TV Licensing (Pakistan)</span>
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">B2B</span>
              </button>
            </div>

            <div className="pt-4 border-t border-emerald-600/60 flex flex-col gap-2.5">
              <button
                onClick={() => { onBookCall(); setMobileMenuOpen(false); }}
                className="w-full py-3 rounded-full bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-950/20"
              >
                Start a Project
              </button>
              <div className="grid grid-cols-1 gap-2 mt-1">
                <button
                  onClick={() => { onNavigateFlow('login'); setMobileMenuOpen(false); }}
                  className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold text-center cursor-pointer flex items-center justify-center gap-1.5 border border-white/20"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Login to FEVIQO Flow</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

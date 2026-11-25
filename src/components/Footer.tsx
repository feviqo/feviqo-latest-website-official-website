import React, { useState } from 'react';
import { 
  Calendar, 
  MessageCircle, 
  Mail, 
  HelpCircle,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Gift,
  ArrowRight,
  Check,
  Copy
} from 'lucide-react';
import { FeviqoHeaderLogo } from './FeviqoLogo';
import { AppRoute } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { MEMBERSHIP_COPY } from '../i18n/membershipTranslations';

interface FooterProps {
  onBookCall: () => void;
  onGetStarted: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigatePricing: () => void;
  onNavigateFlow: () => void;
  onNavigatePage?: (route: AppRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onBookCall, 
  onGetStarted, 
  onNavigateSection,
  onNavigatePricing,
  onNavigateFlow,
  onNavigatePage,
}) => {
  const { t, isUrdu } = useLanguage();
  const [giftEmail, setGiftEmail] = useState('');
  const [giftClaimed, setGiftClaimed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [giftError, setGiftError] = useState('');

  const handleClaimGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(giftEmail)) {
      setGiftError('Please enter a valid email address.');
      return;
    }
    setGiftError('');
    setGiftClaimed(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FEVIQO200');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const nav = (route: AppRoute) => {
    if (onNavigatePage) {
      onNavigatePage(route);
    } else {
      onNavigatePricing();
    }
  };

  return (
    <footer id="website-footer" className="bg-[#031d12] text-white pt-14 pb-12 relative overflow-hidden border-t border-emerald-950/80">
      {/* Radiant ambient glow on green */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[400px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-teal-400/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Multi-Column Links Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pt-4">
          {/* Brand Wordmark & Social Links */}
          <div className="space-y-4 lg:col-span-1">
            <a 
              href="/" 
              onClick={(e) => { e.preventDefault(); onNavigatePage ? onNavigatePage('home') : onNavigateSection('website-hero'); }}
              className="inline-block group"
              aria-label="FEVIQO Home"
            >
              <FeviqoHeaderLogo theme="dark" className="h-9 sm:h-10 w-auto object-contain transition-opacity group-hover:opacity-90" />
            </a>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed font-normal max-w-sm" dir={isUrdu ? 'rtl' : 'ltr'}>
              {t(MEMBERSHIP_COPY.footer.tagline)}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://www.facebook.com/people/Feviqo/61588711067413/" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="FEVIQO Facebook"
                className="p-2 rounded-full bg-emerald-700/60 hover:bg-white hover:text-emerald-900 text-white transition"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/feviqo.co/" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="FEVIQO Instagram"
                className="p-2 rounded-full bg-emerald-700/60 hover:bg-white hover:text-emerald-900 text-white transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://www.linkedin.com/company/feviqo" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="FEVIQO LinkedIn"
                className="p-2 rounded-full bg-emerald-700/60 hover:bg-white hover:text-emerald-900 text-white transition"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://www.youtube.com/@feviqo" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="FEVIQO YouTube"
                className="p-2 rounded-full bg-emerald-700/60 hover:bg-white hover:text-emerald-900 text-white transition"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: Services */}
          <div>
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-4">
              {t(MEMBERSHIP_COPY.footer.servicesHeading)}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-100 font-normal">
              <li>
                <a href="/unlimited-editing" onClick={(e) => { e.preventDefault(); nav('unlimited-editing'); }} className="hover:text-white transition cursor-pointer text-[#22C55E] font-bold">
                  Unlimited Video Editing
                </a>
              </li>
              <li>
                <a href="/platform" onClick={(e) => { e.preventDefault(); nav('platform'); }} className="hover:text-white transition cursor-pointer">
                  FEVIQO Flow Portal
                </a>
              </li>
              <li>
                <a href="/turkish-drama" onClick={(e) => { e.preventDefault(); nav('turkish-drama'); }} className="hover:text-white transition cursor-pointer text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span>Turkish TV Licensing (Pakistan)</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-400/20 text-[#DBFF4C] text-[9px] font-black">B2B</span>
                </a>
              </li>
              <li>
                <a href="/gallery" onClick={(e) => { e.preventDefault(); nav('gallery'); }} className="hover:text-white transition cursor-pointer">
                  Video Gallery (Categories)
                </a>
              </li>
              <li>
                <a href="/pricing" onClick={(e) => { e.preventDefault(); onNavigatePricing(); }} className="hover:text-white transition cursor-pointer">
                  Pricing Plans ($1,299/mo)
                </a>
              </li>
              <li>
                <button onClick={onBookCall} className="hover:text-white transition cursor-pointer text-left">
                  Schedule Strategy Call
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-4">
              {t(MEMBERSHIP_COPY.footer.solutionsHeading)}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-100 font-normal">
              <li>
                <a href="/creators" onClick={(e) => { e.preventDefault(); nav('creators'); }} className="hover:text-white transition cursor-pointer">
                  For Content Creators
                </a>
              </li>
              <li>
                <a href="/business" onClick={(e) => { e.preventDefault(); nav('business'); }} className="hover:text-white transition cursor-pointer">
                  For Business Owners
                </a>
              </li>
              <li>
                <a href="/agencies" onClick={(e) => { e.preventDefault(); nav('agencies'); }} className="hover:text-white transition cursor-pointer">
                  For Marketers &amp; Agencies
                </a>
              </li>
              <li>
                <a href="/case-studies" onClick={(e) => { e.preventDefault(); nav('case-studies'); }} className="hover:text-white transition cursor-pointer">
                  Case Studies &amp; ROI
                </a>
              </li>
              <li>
                <a href="/testimonials" onClick={(e) => { e.preventDefault(); nav('testimonials'); }} className="hover:text-white transition cursor-pointer">
                  Testimonials &amp; Reviews
                </a>
              </li>
              <li>
                <a href="/about" onClick={(e) => { e.preventDefault(); nav('about'); }} className="hover:text-white transition cursor-pointer text-[#22C55E] font-bold">
                  About Us (Leadership)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Drama Episode Guides & Reviews */}
          <div>
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-4 text-[#22C55E]">
              {t(MEMBERSHIP_COPY.footer.dramasHeading)}
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100 font-normal">
              <li>
                <a href="/yeralti" onClick={(e) => { e.preventDefault(); nav('yeralti'); }} className="hover:text-white transition cursor-pointer font-black text-[#22C55E] flex items-center justify-between">
                  <span>Yeraltı — Episode Guide</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-black text-[9px] uppercase tracking-wider">GUIDE</span>
                </a>
              </li>
              <li>
                <a
                  href="/mehmed-fetihler-sultani/episode-90"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent('feviqo-navigate-url', { detail: '/mehmed-fetihler-sultani/episode-90' }));
                    }
                  }}
                  className="hover:text-white transition cursor-pointer font-black text-amber-300 flex items-center justify-between"
                >
                  <span>Mehmed Ep 90 — Story Summary</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-600/80 text-white font-black text-[9px] uppercase tracking-wider">NEW</span>
                </a>
              </li>
              <li>
                <a
                  href="/mehmed-fetihler-sultani/episode-89"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent('feviqo-navigate-url', { detail: '/mehmed-fetihler-sultani/episode-89' }));
                    }
                  }}
                  className="hover:text-white transition cursor-pointer font-bold text-emerald-200 block"
                >
                  Mehmed Ep 89 — Review &amp; Cast
                </a>
              </li>
              <li>
                <a href="/mehmed-fetihler-sultani" onClick={(e) => { e.preventDefault(); nav('mehmed-fetihler-sultani'); }} className="hover:text-white transition cursor-pointer font-bold text-[#22C55E] block">
                  Mehmed: Fetihler Sultanı Guide
                </a>
              </li>
              <li>
                <a
                  href="/gunesin-dogdugu-yer/episode-7"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent('feviqo-navigate-url', { detail: '/gunesin-dogdugu-yer/episode-7' }));
                    }
                  }}
                  className="hover:text-white transition cursor-pointer font-bold text-amber-300 block"
                >
                  Güneşin Doğduğu Yer Ep 7 Summary
                </a>
              </li>
              <li>
                <a
                  href="/teskilat/episode-189"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent('feviqo-navigate-url', { detail: '/teskilat/episode-189' }));
                    }
                  }}
                  className="hover:text-white transition cursor-pointer font-bold text-emerald-300 block"
                >
                  Teşkilat Ep 189 — Story Summary
                </a>
              </li>
              <li>
                <a href="/teskilat" onClick={(e) => { e.preventDefault(); nav('teskilat-urdu'); }} className="hover:text-white transition cursor-pointer font-bold text-[#22C55E] block">
                  Teşkilat Season 7 Episode Guide
                </a>
              </li>
              <li>
                <a href="/gunesin-dogdugu-yer" onClick={(e) => { e.preventDefault(); nav('gunesin-dogdugu-yer'); }} className="hover:text-white transition cursor-pointer font-bold text-emerald-300 block">
                  Güneşin Doğduğu Yer Cast &amp; Reviews
                </a>
              </li>
              <li>
                <a href="/dramas" onClick={(e) => { e.preventDefault(); nav('dramas'); }} className="hover:text-white transition cursor-pointer text-[#DBFF4C] font-extrabold underline block mt-1">
                  All Drama Guides &amp; Reviews &rarr;
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources & Support */}
          <div>
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-4">
              Resources &amp; Legal
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-emerald-100 font-normal">
              <li>
                <a
                  href="/contact"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      nav('contact');
                    }
                  }}
                  className="flex items-center gap-2 hover:text-white transition text-white font-bold cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
                  <span>Contact Us</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:partner@feviqo.com"
                  className="flex items-center gap-2 hover:text-white transition"
                >
                  <Mail className="w-4 h-4 text-emerald-300" />
                  <span>partner@feviqo.com</span>
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      nav('privacy');
                    }
                  }}
                  className="hover:text-[#22C55E] transition cursor-pointer block"
                >
                  Privacy Policy &amp; Ad Cookies
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      nav('terms');
                    }
                  }}
                  className="hover:text-[#22C55E] transition cursor-pointer block"
                >
                  Terms of Use
                </a>
              </li>
              <li>
                <a
                  href="/dmca"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      nav('dmca');
                    }
                  }}
                  className="hover:text-[#22C55E] transition cursor-pointer block"
                >
                  DMCA &amp; Copyright Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 border-t border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/80 gap-4">
          <div>
            {t(MEMBERSHIP_COPY.footer.copyright)}
          </div>
          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <a
              href="/privacy-policy"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  nav('privacy');
                }
              }}
              className="hover:text-[#22C55E] hover:underline font-semibold transition cursor-pointer"
            >
              {t(MEMBERSHIP_COPY.footer.privacyPolicy)}
            </a>
            <a
              href="/terms"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  nav('terms');
                }
              }}
              className="hover:text-[#22C55E] hover:underline font-semibold transition cursor-pointer"
            >
              {t(MEMBERSHIP_COPY.footer.termsOfService)}
            </a>
            <a
              href="/dmca"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  nav('dmca');
                }
              }}
              className="hover:text-[#22C55E] hover:underline font-semibold transition cursor-pointer"
            >
              DMCA Policy
            </a>
            <a
              href="/contact"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  nav('contact');
                }
              }}
              className="hover:text-[#22C55E] hover:underline font-semibold transition cursor-pointer"
            >
              Contact
            </a>
            <a
              href="/sitemap.xml"
              className="hover:text-[#22C55E] hover:underline font-semibold transition"
            >
              Sitemap
            </a>
            <button onClick={onNavigateFlow} className="text-[#22C55E] hover:underline font-bold transition cursor-pointer">
              {t(MEMBERSHIP_COPY.footer.adminFlowPortal)}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

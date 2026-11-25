/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense, ComponentType } from 'react';
import { TopAlertBar } from './components/TopAlertBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LogoMarquee } from './components/LogoMarquee';
import { ValuePillars } from './components/ValuePillars';
import { CaseStudiesSlider } from './components/CaseStudiesSlider';
import { AiToolsCarousel } from './components/AiToolsCarousel';
import { VideoGallerySection } from './components/VideoGallerySection';
import { ProcessFeatures } from './components/ProcessFeatures';
import { ComparisonSection } from './components/ComparisonSection';
import { FaqSection } from './components/FaqSection';
import { BookingSection } from './components/BookingSection';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';

// Synchronous critical routes for instant zero-wait boot on / and /membership/*
import { VideoModal } from './components/VideoModal';
import { BookCallModal } from './components/BookCallModal';
import { PricingPage } from './components/PricingPage';
import { BookingPage } from './components/pages/BookingPage';
import { VideoGalleryPage } from './components/pages/VideoGalleryPage';
import { ContentCreatorsPage } from './components/pages/ContentCreatorsPage';
import { BusinessOwnersPage } from './components/pages/BusinessOwnersPage';
import { AgenciesPage } from './components/pages/AgenciesPage';
import { TestimonialsPage } from './components/pages/TestimonialsPage';
import { CaseStudiesPage } from './components/pages/CaseStudiesPage';
import { UnlimitedEditingPage } from './components/pages/UnlimitedEditingPage';
import { PlatformOverviewPage } from './components/pages/PlatformOverviewPage';
import { TurkishDramaPage } from './components/pages/TurkishDramaPage';
import { TeskilatDramaPage } from './components/pages/TeskilatDramaPage';
import { GunesinDramaPage } from './components/pages/GunesinDramaPage';
import { MehmedDramaPage } from './components/pages/MehmedDramaPage';
import { YeraltiDramaPage } from './components/pages/YeraltiDramaPage';
import { DramasPage } from './components/pages/DramasPage';
import { AboutUsPage } from './components/pages/AboutUsPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { TermsPage } from './components/pages/TermsPage';
import { DmcaPolicyPage } from './components/pages/DmcaPolicyPage';
import { ContactPage } from './components/pages/ContactPage';
import { MembershipPage } from './components/pages/MembershipPage';
import { GlobalPhoneCompletionGuard } from './components/membership/GlobalPhoneCompletionGuard';
import { LanguageProvider } from './i18n/LanguageContext';

import { getSEOConfigForPath } from './seo/seoStore';
import { AppRoute, PreselectedPlan } from './types';
import { initializeAssetSync } from './services/assetService';
import { findVideoItem } from './data/videoRegistry';
import SEOHead from './seo/SEOHead';
import { testFirestoreConnection } from './firebase';
import {
  setStoredReferralCode,
  setStoredReferralPartnerMeta,
  trackReferralCampaignVisit,
  extractReferralSlugFromLocation,
} from './services/membershipService';

function lazyWithRetry<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await importer();
    } catch (err) {
      try {
        const key = 'feviqo_lazy_chunk_reload_v2';
        const prev = Number(sessionStorage.getItem(key) || '0');
        if (Date.now() - prev > 15000) {
          sessionStorage.setItem(key, String(Date.now()));
          const u = new URL(window.location.href);
          u.searchParams.set('_fv', String(Date.now()).slice(-6));
          window.location.replace(u.toString());
        }
      } catch {}
      throw err;
    }
  });
}

// Keep internal/admin portals lazy-loaded so public bundle stays lean
const FeviqoFlowApp = lazyWithRetry(() =>
  import('./components/FeviqoFlowApp').then((m) => ({ default: m.FeviqoFlowApp }))
);
const MembershipAdminPage = lazyWithRetry(() =>
  import('./components/pages/MembershipAdminPage').then((m) => ({ default: m.MembershipAdminPage }))
);
const AdminAutomationPage = lazyWithRetry(() =>
  import('./components/pages/AdminAutomationPage').then((m) => ({ default: m.AdminAutomationPage }))
);
const AdminWhatsAppCenterPage = lazyWithRetry(() =>
  import('./components/pages/AdminWhatsAppCenterPage').then((m) => ({ default: m.AdminWhatsAppCenterPage }))
);
const AdminAutomationLeadsPage = lazyWithRetry(() =>
  import('./components/pages/AdminAutomationLeadsPage').then((m) => ({ default: m.AdminAutomationLeadsPage }))
);
const SEOAdminModal = lazyWithRetry(() =>
  import('./components/admin/SEOAdminModal').then((m) => ({ default: m.SEOAdminModal }))
);

const lastCampaignTrackAt = new Map<string, number>();

function normalizePartnerSlugForUrl(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const refSlug = extractReferralSlugFromLocation(window.location.pathname, window.location.search);

      // Any referral link (?ref=slug or /membership/<slug>) opens the Membership Page directly
      if (refSlug && !path.startsWith('/admin')) {
        return 'membership';
      }

      if (path.startsWith('/admin/automation/whatsapp')) return 'admin-automation-whatsapp';
      if (path.startsWith('/admin/automation/leads')) return 'admin-automation-leads';
      if (path.startsWith('/admin/automation')) return 'admin-automation';
      if (path.startsWith('/admin/memberships')) return 'admin-memberships';
      if (path.includes('/admin') || hash.includes('#admin')) return 'flow';
      if (path.includes('/flow') || hash.includes('#flow')) return 'flow';
      if (path.includes('/pricing') || hash.includes('#pricing')) return 'pricing';
      if (path.includes('/booking') || hash.includes('#booking')) return 'booking';
      if (path.includes('/gallery') || hash.includes('#gallery')) return 'gallery';
      if (path.includes('/creators') || hash.includes('#creators')) return 'creators';
      if (path.includes('/business') || hash.includes('#business')) return 'business';
      if (path.includes('/agencies') || hash.includes('#agencies')) return 'agencies';
      if (path.includes('/testimonials') || hash.includes('#testimonials')) return 'testimonials';
      if (path.includes('/case-studies') || hash.includes('#case-studies')) return 'case-studies';
      if (path.includes('/unlimited-editing') || hash.includes('#unlimited-editing')) return 'unlimited-editing';
      if (path.includes('/platform') || hash.includes('#platform')) return 'platform';
      if (path.includes('/turkish-drama') || hash.includes('#turkish-drama')) return 'turkish-drama';
      if (path.includes('/teskilat') || path.includes('/episode-186') || path.includes('/episode-187') || path.includes('/episode-188') || path.includes('/episode-189') || path.includes('/episode-192') || path.includes('/episode-193') || path.includes('/episode-194') || path.includes('/teskilat-188') || path.includes('/teskilat-189') || path.includes('/teskilat-192') || path.includes('/teskilat-193') || path.includes('/teskilat-194')) return 'teskilat-urdu';
      if (path.includes('/gunesin-dogdugu-yer')) return 'gunesin-dogdugu-yer';
      if (path.includes('/mehmed') || path.includes('/mehmed-fetihler-sultani')) return 'mehmed-fetihler-sultani';
      if (path.includes('/yeralti')) return 'yeralti';
      if (path.includes('/dramas')) return 'dramas';
      if (path.startsWith('/account')) return 'account';
      if (path.includes('/membership') || hash.includes('#membership')) return 'membership';
      if (path.includes('/about') || hash.includes('#about')) return 'about';
      if (path.includes('/privacy') || hash.includes('#privacy')) return 'privacy';
      if (path.includes('/terms') || hash.includes('#terms')) return 'terms';
      if (path.includes('/dmca') || hash.includes('#dmca')) return 'dmca';
      if (path.includes('/contact') || hash.includes('#contact')) return 'contact';
    }
    return 'home';
  });

  const [flowInitialView, setFlowInitialView] = useState<'login' | 'register' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        !path.startsWith('/admin/memberships') &&
        !path.startsWith('/admin/automation') &&
        (path.includes('/admin') || hash.includes('#admin'))
      ) return 'admin';
    }
    return 'login';
  });
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');
  const [activeVideoAspect, setActiveVideoAspect] = useState<'16/9' | '9/16'>('16/9');
  const [isBookCallModalOpen, setIsBookCallModalOpen] = useState(false);
  const [preselectedPlanForBooking, setPreselectedPlanForBooking] = useState<PreselectedPlan | null>(null);

  useEffect(() => {
    const handleUrlStateAndVideo = () => {
      const rawPath = window.location.pathname;
      const path = rawPath.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const originalLanding = `${window.location.pathname}${window.location.search}`;

      let videoQueryParam: string | null = null;
      const params = new URLSearchParams(window.location.search);
      const refSlugRaw = extractReferralSlugFromLocation(window.location.pathname, window.location.search);

      if (refSlugRaw && !path.startsWith('/admin')) {
        const cleanSlug = normalizePartnerSlugForUrl(refSlugRaw);
        if (cleanSlug) {
          setStoredReferralCode(refSlugRaw);
          setStoredReferralPartnerMeta({
            slug: cleanSlug,
            referralCode: refSlugRaw.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32),
            referralPath: `/membership/${cleanSlug}`,
            referralUrl: `https://feviqo.com/membership/${encodeURIComponent(cleanSlug)}`,
          });

          // Preserve referral partner name in the browser URL bar: /membership/<partner-slug>
          const cleanParams = new URLSearchParams(window.location.search);
          cleanParams.delete('ref');
          cleanParams.delete('referral');
          cleanParams.delete('partner');
          cleanParams.delete('_fv');
          const remainingSearch = cleanParams.toString();
          const desiredUrl = `/membership/${encodeURIComponent(cleanSlug)}${
            remainingSearch ? `?${remainingSearch}` : ''
          }`;
          if (`${window.location.pathname}${window.location.search}` !== desiredUrl) {
            try {
              window.history.replaceState({ route: 'membership', ref: cleanSlug }, '', desiredUrl);
            } catch {}
          }

          const nowTs = Date.now();
          const lastTracked = lastCampaignTrackAt.get(cleanSlug) || 0;
          if (nowTs - lastTracked > 1500) {
            lastCampaignTrackAt.set(cleanSlug, nowTs);
            void trackReferralCampaignVisit(cleanSlug, originalLanding);
          }

          setCurrentRoute('membership');
          return;
        }
      }

      videoQueryParam = params.get('v') || params.get('video') || params.get('watch');

      if (!videoQueryParam && hash.includes('v=')) {
        const hashSearch = hash.includes('?') ? hash.substring(hash.indexOf('?')) : hash.replace('#', '?');
        const hashParams = new URLSearchParams(hashSearch);
        videoQueryParam = hashParams.get('v') || hashParams.get('video');
      }

      if (!videoQueryParam) {
        const pathMatch = path.match(/\/(?:v|watch|video)\/([a-zA-Z0-9_-]+)/);
        if (pathMatch) videoQueryParam = pathMatch[1];
      }

      if (videoQueryParam) {
        const item = findVideoItem(videoQueryParam);
        const cleanId = item ? item.id : videoQueryParam;
        setActiveVideoModal(cleanId);
        setActiveVideoTitle(item?.title || '');
        setActiveVideoAspect(item?.orientation === 'vertical' ? '9/16' : '16/9');
        setCurrentRoute('gallery');
      }

      if (path.startsWith('/admin/automation/whatsapp')) {
        setCurrentRoute('admin-automation-whatsapp');
      } else if (path.startsWith('/admin/automation/leads')) {
        setCurrentRoute('admin-automation-leads');
      } else if (path.startsWith('/admin/automation')) {
        setCurrentRoute('admin-automation');
      } else if (path.startsWith('/admin/memberships')) {
        setCurrentRoute('admin-memberships');
      } else if (path.includes('/admin') || hash.includes('#admin')) {
        setCurrentRoute('flow');
        setFlowInitialView('admin');
      } else if (path.includes('/flow') || hash.includes('#flow')) {
        setCurrentRoute('flow');
      } else if (path.includes('/pricing') || hash.includes('#pricing')) {
        setCurrentRoute('pricing');
      } else if (path.includes('/booking') || hash.includes('#booking')) {
        setCurrentRoute('booking');
      } else if (path.includes('/gallery') || hash.includes('#gallery')) {
        setCurrentRoute('gallery');
      } else if (path.includes('/creators') || path.includes('/for-creators') || hash.includes('#creators')) {
        setCurrentRoute('creators');
      } else if (path.includes('/business') || path.includes('/for-business') || hash.includes('#business')) {
        setCurrentRoute('business');
      } else if (path.includes('/agencies') || path.includes('/for-agencies') || hash.includes('#agencies')) {
        setCurrentRoute('agencies');
      } else if (path.includes('/testimonials') || hash.includes('#testimonials')) {
        setCurrentRoute('testimonials');
      } else if (path.includes('/case-studies') || hash.includes('#case-studies')) {
        setCurrentRoute('case-studies');
      } else if (path.includes('/unlimited-editing') || hash.includes('#unlimited-editing')) {
        setCurrentRoute('unlimited-editing');
      } else if (path.includes('/platform') || hash.includes('#platform')) {
        setCurrentRoute('platform');
      } else if (path.includes('/teskilat') || path.includes('/episode-186') || path.includes('/episode-187') || path.includes('/episode-188') || path.includes('/episode-189') || path.includes('/episode-192') || path.includes('/episode-193') || path.includes('/episode-194') || path.includes('/teskilat-186') || path.includes('/teskilat-187') || path.includes('/teskilat-188') || path.includes('/teskilat-189') || path.includes('/teskilat-192') || path.includes('/teskilat-193') || path.includes('/teskilat-194') || hash.includes('#teskilat')) {
        setCurrentRoute('teskilat-urdu');
      } else if (path.includes('/gunesin-dogdugu-yer')) {
        setCurrentRoute('gunesin-dogdugu-yer');
      } else if (path.includes('/mehmed') || path.includes('/mehmed-fetihler-sultani')) {
        setCurrentRoute('mehmed-fetihler-sultani');
      } else if (path.includes('/yeralti')) {
        setCurrentRoute('yeralti');
      } else if (path.includes('/dramas')) {
        setCurrentRoute('dramas');
      } else if (path.startsWith('/account')) {
        setCurrentRoute('account');
      } else if (path.includes('/membership') || hash.includes('#membership')) {
        setCurrentRoute('membership');
      } else if (path.includes('/turkish-drama') || hash.includes('#turkish-drama')) {
        setCurrentRoute('turkish-drama');
      } else if (path.includes('/about') || hash.includes('#about')) {
        setCurrentRoute('about');
      } else if (path.includes('/privacy') || hash.includes('#privacy')) {
        setCurrentRoute('privacy');
      } else if (path.includes('/terms') || hash.includes('#terms')) {
        setCurrentRoute('terms');
      } else if (path.includes('/dmca') || hash.includes('#dmca')) {
        setCurrentRoute('dmca');
      } else if (path.includes('/contact') || hash.includes('#contact')) {
        setCurrentRoute('contact');
      } else {
        setCurrentRoute('home');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setIsSEOAdminOpen(prev => !prev);
      }
    };

    const handleCustomUrlNavigate = (evt: Event) => {
      const targetUrl = (evt as CustomEvent<string>)?.detail;
      if (!targetUrl || typeof targetUrl !== 'string') return;
      try {
        window.history.pushState({}, '', targetUrl);
      } catch {}
      handleUrlStateAndVideo();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    handleUrlStateAndVideo();
    window.addEventListener('popstate', handleUrlStateAndVideo);
    window.addEventListener('feviqo-navigate-url', handleCustomUrlNavigate);
    window.addEventListener('keydown', handleKeyDown);
    initializeAssetSync();
    testFirestoreConnection().catch(() => {});
    return () => {
      window.removeEventListener('popstate', handleUrlStateAndVideo);
      window.removeEventListener('feviqo-navigate-url', handleCustomUrlNavigate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Dynamic SEO title & metadata updates for keyword ranking across routes
  useEffect(() => {
    const titles: Record<AppRoute, string> = {
      'home': 'FEVIQO - Unlimited Video Editing Service & Creative Agency',
      'unlimited-editing': 'Unlimited Video Editing Service - Flat Monthly Rate | FEVIQO',
      'gallery': 'Video Editing Portfolio, TikTok & YouTube Reel Samples | FEVIQO',
      'creators': 'Video Editing for YouTube, TikTok & Reels Creators | FEVIQO',
      'business': 'Video Editing for Brands, SaaS & E-Commerce Ads | FEVIQO',
      'agencies': 'White-Label Video Editing Agency Solution | FEVIQO',
      'pricing': 'Unlimited Video Editing Pricing & Plans | FEVIQO',
      'booking': 'Schedule Strategy Call - Unlimited Video Editing | FEVIQO',
      'case-studies': 'Client Case Studies & Video Editing ROI Results | FEVIQO',
      'testimonials': 'Client Reviews & Top Rated Video Editors | FEVIQO',
      'about': 'About FEVIQO - Dedicated Senior Video Editors | FEVIQO',
      'flow': 'FEVIQO Flow - Video Request Portal & Dashboard',
      'platform': 'FEVIQO Flow Portal - Manage Video Edits & Assets',
      'admin': 'FEVIQO Admin Portal - Dashboard & Client Management',
      'turkish-drama': 'Turkish TV & Drama Content Licensing | FEVIQO',
      'teskilat-urdu': 'Teşkilat Season 7 Episode Guide, Story Summary & Cast | FEVIQO',
      'gunesin-dogdugu-yer': 'Güneşin Doğduğu Yer Episode Guide, Cast & Reviews | FEVIQO',
      'mehmed-fetihler-sultani': 'Mehmed: Fetihler Sultanı Episode Guide & Story Summary | FEVIQO',
      'yeralti': 'Yeraltı Episode Guide, Cast & Story Reviews | FEVIQO',
      'dramas': 'Turkish Drama Episode Guides, Story Summaries & Reviews | FEVIQO',
      'membership': 'FEVIQO Reader Membership & Community Plans | FEVIQO',
      'account': 'My Account | FEVIQO',
      'admin-memberships': 'FEVIQO Membership & Payment Verification Admin',
      'admin-automation': 'FEVIQO WhatsApp Cloud API & Automation Admin',
      'admin-automation-whatsapp': 'FEVIQO Manual WhatsApp Center & Customer Queue',
      'admin-automation-leads': 'FEVIQO Video Editing Leads & WhatsApp Inbox',
      'privacy': 'Privacy Policy & Advertising Cookie Disclosure | FEVIQO',
      'terms': 'Terms of Use & Editorial Policy | FEVIQO',
      'dmca': 'DMCA & Copyright Policy | FEVIQO',
      'contact': 'Contact Us | FEVIQO'
    };

    const pathConfig = getSEOConfigForPath(window.location.pathname);
    if (pathConfig && pathConfig.seoTitle && window.location.pathname !== '/') {
      document.title = pathConfig.seoTitle;
    } else if (titles[currentRoute]) {
      document.title = titles[currentRoute];
    }
  }, [currentRoute]);

  const navigateTo = (route: AppRoute, initialFlowView?: 'login' | 'register' | 'admin') => {
    if (route === 'admin' || initialFlowView === 'admin') {
      setCurrentRoute('flow');
      setFlowInitialView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        window.history.pushState({ route: 'admin' }, '', '/admin');
      } catch {}
      return;
    }

    setCurrentRoute(route);
    if (initialFlowView) {
      setFlowInitialView(initialFlowView);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const currentPartnerSlug =
      typeof window !== 'undefined'
        ? extractReferralSlugFromLocation(window.location.pathname, window.location.search)
        : null;
    const newPath =
      route === 'home'
        ? '/'
        : route === 'privacy'
        ? '/privacy-policy'
        : route === 'teskilat-urdu'
        ? '/teskilat'
        : route === 'admin-memberships'
        ? '/admin/memberships'
        : route === 'admin-automation'
        ? '/admin/automation'
        : route === 'admin-automation-whatsapp'
        ? '/admin/automation/whatsapp'
        : route === 'admin-automation-leads'
        ? '/admin/automation/leads'
        : route === 'membership' && currentPartnerSlug
        ? `/membership/${encodeURIComponent(normalizePartnerSlugForUrl(currentPartnerSlug))}`
        : `/${route}`;
    try {
      window.history.pushState({ route }, '', newPath);
    } catch {
      // ignore
    }
  };

  const handleOpenVideo = (vimeoIdOrSource: string, title?: string, aspect?: '16/9' | '9/16') => {
    const item = findVideoItem(vimeoIdOrSource);
    const videoSource = item ? (item.src || item.id) : vimeoIdOrSource;
    const cleanTitle = title || item?.title || '';
    const cleanAspect = aspect || (item?.orientation === 'vertical' ? '9/16' : '16/9');

    setActiveVideoModal(videoSource);
    setActiveVideoTitle(cleanTitle);
    setActiveVideoAspect(cleanAspect);

    try {
      const shareId = item?.id || videoSource;
      const sharePath = `/watch?v=${encodeURIComponent(shareId)}`;
      window.history.pushState({ v: shareId }, '', sharePath);
    } catch {}
  };

  const handleCloseVideo = () => {
    setActiveVideoModal(null);
    setActiveVideoTitle('');

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('v');
      url.searchParams.delete('video');
      url.searchParams.delete('watch');
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  const handleOpenBookCall = (plan?: any) => {
    if (plan && typeof plan === 'object' && typeof plan.name === 'string') {
      setPreselectedPlanForBooking(plan as PreselectedPlan);
    } else if (typeof plan === 'string') {
      const lower = plan.toLowerCase();
      const name = lower.includes('scale') ? 'Scale Plan' : lower.includes('in-house') || lower.includes('inhouse') ? 'In-House Studio' : 'Pro Plan';
      const id = lower.includes('scale') ? 'scale' : lower.includes('in-house') || lower.includes('inhouse') ? 'inhouse' : 'pro';
      setPreselectedPlanForBooking({ id, name, monthlyRate: 0, cycle: 'quarterly' });
    } else {
      setPreselectedPlanForBooking(null);
    }
    navigateTo('booking');
  };

  const handleCloseBookCall = () => {
    setIsBookCallModalOpen(false);
    setPreselectedPlanForBooking(null);
  };

  const handleNavigateSection = (sectionId: string) => {
    if (currentRoute !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderCurrentRoute = () => {
    switch (currentRoute) {
      case 'booking':
        return (
          <BookingPage 
            preselectedPlan={preselectedPlanForBooking}
            onNavigateHome={() => navigateTo('home')}
            onNavigatePricing={() => navigateTo('pricing')}
            onNavigatePage={(route) => navigateTo(route)}
            onOpenFlow={(view) => navigateTo('flow', view)}
          />
        );

      case 'pricing':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-900 text-white font-sans selection:bg-[#22C55E] selection:text-white">
            <PricingPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onOpenFlow={(view) => navigateTo('flow', view)}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'flow':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FBFBFC] text-slate-900 font-sans selection:bg-[#22C55E] selection:text-slate-950">
            <FeviqoFlowApp 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              initialView={flowInitialView}
            />
          </div>
        );

      case 'gallery':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <VideoGalleryPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onOpenVideo={handleOpenVideo}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateSection={handleNavigateSection}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'creators':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <ContentCreatorsPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onOpenVideo={handleOpenVideo}
              onNavigateSubpage={(subpage) => navigateTo(subpage)}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'business':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <BusinessOwnersPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onOpenVideo={handleOpenVideo}
              onNavigateSubpage={(subpage) => navigateTo(subpage)}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'agencies':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <AgenciesPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onOpenVideo={handleOpenVideo}
              onNavigateSubpage={(subpage) => navigateTo(subpage)}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'testimonials':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <TestimonialsPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onOpenVideo={handleOpenVideo}
              onNavigateSection={handleNavigateSection}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'case-studies':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <CaseStudiesPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onOpenVideo={handleOpenVideo}
              onNavigateSection={handleNavigateSection}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'unlimited-editing':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <UnlimitedEditingPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onOpenFlow={(view) => navigateTo('flow', view)}
              onNavigateSection={handleNavigateSection}
              onNavigatePage={(route) => navigateTo(route)}
            />
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'platform':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <PlatformOverviewPage 
              onBackToHome={() => navigateTo('home')}
              onOpenFlow={(view) => navigateTo('flow', view)}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateSection={handleNavigateSection}
              onNavigatePage={(route) => navigateTo(route)}
            />
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'about':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#070709] text-white font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <Navbar 
              onBookCall={handleOpenBookCall} 
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
            <AboutUsPage 
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
            />
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'turkish-drama':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <TurkishDramaPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'privacy':
        return (
          <PrivacyPolicyPage
            onBackToHome={() => navigateTo('home')}
            onBookCall={handleOpenBookCall}
            onNavigatePricing={() => navigateTo('pricing')}
            onNavigateFlow={(view) => navigateTo('flow', view)}
            onNavigatePage={(route) => navigateTo(route)}
          />
        );

      case 'terms':
        return (
          <TermsPage
            onBackToHome={() => navigateTo('home')}
            onBookCall={handleOpenBookCall}
            onNavigatePricing={() => navigateTo('pricing')}
            onNavigateFlow={(view) => navigateTo('flow', view)}
            onNavigatePage={(route) => navigateTo(route)}
          />
        );

      case 'dmca':
        return (
          <DmcaPolicyPage
            onBackToHome={() => navigateTo('home')}
            onBookCall={handleOpenBookCall}
            onNavigatePricing={() => navigateTo('pricing')}
            onNavigateFlow={(view) => navigateTo('flow', view)}
            onNavigatePage={(route) => navigateTo(route)}
          />
        );

      case 'contact':
        return (
          <ContactPage
            onBackToHome={() => navigateTo('home')}
            onBookCall={handleOpenBookCall}
            onNavigatePricing={() => navigateTo('pricing')}
            onNavigateFlow={(view) => navigateTo('flow', view)}
            onNavigatePage={(route) => navigateTo(route)}
          />
        );

      case 'teskilat-urdu':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <TeskilatDramaPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'dramas':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <DramasPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'membership':
      case 'account':
        return (
          <MembershipPage
            onNavigatePage={(route) => navigateTo(route)}
            onBookCall={() => handleOpenBookCall()}
            onNavigateSection={handleNavigateSection}
            onNavigatePricing={() => navigateTo('pricing')}
            onNavigateFlow={(view) => navigateTo('flow', view)}
            initialViewAccount={
              currentRoute === 'account' ||
              (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/account'))
            }
          />
        );

      case 'admin-memberships':
        return (
          <MembershipAdminPage
            onBookCall={() => handleOpenBookCall()}
            onNavigateSection={handleNavigateSection}
            onNavigatePricing={() => navigateTo('pricing')}
            onNavigateFlow={(view) => navigateTo('flow', view)}
            onNavigatePage={(route) => navigateTo(route)}
          />
        );

      case 'admin-automation':
        return (
          <AdminAutomationPage
            onBookCall={() => handleOpenBookCall()}
            onNavigateSection={handleNavigateSection}
            onNavigatePricing={() => navigateTo('pricing')}
            onNavigateFlow={(view) => navigateTo('flow', view)}
            onNavigatePage={(route) => navigateTo(route)}
          />
        );

      case 'admin-automation-whatsapp':
        return (
          <AdminWhatsAppCenterPage
            onBookCall={() => handleOpenBookCall()}
            onNavigateSection={handleNavigateSection}
            onNavigatePricing={() => navigateTo('pricing')}
            onNavigateFlow={(view) => navigateTo('flow', view)}
            onNavigatePage={(route) => navigateTo(route)}
          />
        );

      case 'admin-automation-leads':
        return (
          <AdminAutomationLeadsPage
            onBookCall={() => handleOpenBookCall()}
            onNavigateSection={handleNavigateSection}
            onNavigatePricing={() => navigateTo('pricing')}
            onNavigateFlow={(view) => navigateTo('flow', view)}
            onNavigatePage={(route) => navigateTo(route)}
          />
        );

      case 'gunesin-dogdugu-yer':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
            <GunesinDramaPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'mehmed-fetihler-sultani':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <MehmedDramaPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'yeralti':
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-[#22C55E] selection:text-white flex flex-col">
            <YeraltiDramaPage 
              onBackToHome={() => navigateTo('home')}
              onBookCall={handleOpenBookCall}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );

      case 'home':
      default:
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans flex flex-col selection:bg-[#22C55E] selection:text-white">
            {/* Top Banner Alert (Original Agency Announcement) */}
            <TopAlertBar onBookCall={handleOpenBookCall} />

            {/* Main Navigation Bar */}
            <Navbar 
              onBookCall={handleOpenBookCall} 
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={(view) => navigateTo('flow', view)}
              onNavigatePage={(route) => navigateTo(route)}
            />

            {/* Main Page Content */}
            <main className="flex-1 w-full max-w-full overflow-x-hidden">
              {/* 1. Hero Section */}
              <HeroSection 
                onBookCall={handleOpenBookCall} 
                onOpenVideo={handleOpenVideo}
              />

              {/* 2. Client Logos Infinite Marquee */}
              <LogoMarquee />

              {/* 3. Value Proposition Pillars ("You Create. We Edit.") */}
              <ValuePillars onGetStarted={handleOpenBookCall} />

              {/* 4. High-Impact Case Studies ("Edits That Pay Off") */}
              <CaseStudiesSlider />

              {/* 5. Continuous AI-Powered Tools Marquee Suite */}
              <AiToolsCarousel />

              {/* 6. Video Gallery Showcase ("We Edit It All") */}
              <VideoGallerySection 
                onOpenVideo={handleOpenVideo} 
                onBookCall={handleOpenBookCall}
                onNavigateGallery={() => navigateTo('gallery')}
              />

              {/* 7. Scroll-Animated Process Features ("Video Creation Should Be Easy") */}
              <ProcessFeatures />

              {/* 8. Comparison Section ("The Video Editing Choices In 2026") */}
              <ComparisonSection 
                onChooseOption={handleOpenBookCall}
                onNavigatePricing={() => navigateTo('pricing')}
              />

              {/* 9. FAQ Section */}
              <FaqSection />

              {/* 10. Consultation & Team Booking ("Got Questions?") */}
              <BookingSection onBookCall={handleOpenBookCall} />
            </main>

            {/* 11. Unified Footer */}
            <Footer 
              onBookCall={handleOpenBookCall}
              onGetStarted={handleOpenBookCall}
              onNavigateSection={handleNavigateSection}
              onNavigatePricing={() => navigateTo('pricing')}
              onNavigateFlow={() => navigateTo('flow')}
              onNavigatePage={(route) => navigateTo(route)}
            />
          </div>
        );
    }
  };

  const [isSEOAdminOpen, setIsSEOAdminOpen] = useState(false);

  // Map AppRoute enum to canonical path
  const getPathForRoute = (route: AppRoute): string => {
    switch (route) {
      case 'home': return '/';
      case 'unlimited-editing': return '/unlimited-editing';
      case 'creators': return '/creators';
      case 'business': return '/business';
      case 'agencies': return '/agencies';
      case 'gallery': return '/gallery';
      case 'pricing': return '/pricing';
      case 'booking': return '/booking';
      case 'case-studies': return '/case-studies';
      case 'testimonials': return '/testimonials';
      case 'about': return '/about';
      case 'flow': return '/admin';
      case 'platform': return '/platform';
      case 'turkish-drama': return '/turkish-drama';
      case 'gunesin-dogdugu-yer':
        if (typeof window !== 'undefined' && window.location.pathname.includes('/episode-')) {
          return window.location.pathname;
        }
        return '/gunesin-dogdugu-yer';
      case 'mehmed-fetihler-sultani':
        if (typeof window !== 'undefined' && window.location.pathname.includes('/episode-')) {
          return window.location.pathname;
        }
        return '/mehmed-fetihler-sultani';
      case 'yeralti':
        if (typeof window !== 'undefined' && window.location.pathname.includes('/episode-')) {
          return window.location.pathname;
        }
        return '/yeralti';
      case 'dramas': return '/dramas';
      case 'membership':
        if (typeof window !== 'undefined' && /^\/memberships?\/[a-z0-9_-]+/i.test(window.location.pathname)) {
          return window.location.pathname;
        }
        return '/membership';
      case 'account': return '/account';
      case 'admin-memberships': return '/admin/memberships';
      case 'admin-automation': return '/admin/automation';
      case 'admin-automation-whatsapp': return '/admin/automation/whatsapp';
      case 'admin-automation-leads': return '/admin/automation/leads';
      case 'privacy': return '/privacy';
      case 'terms': return '/terms';
      case 'teskilat-urdu':
        if (typeof window !== 'undefined') {
          if (window.location.pathname.includes('/episode-194') || window.location.pathname.includes('194')) {
            return '/teskilat/episode-194';
          }
          if (window.location.pathname.includes('/episode-193') || window.location.pathname.includes('193')) {
            return '/teskilat/episode-193';
          }
          if (window.location.pathname.includes('/episode-192') || window.location.pathname.includes('192')) {
            return '/teskilat/episode-192';
          }
          if (window.location.pathname.includes('/episode-189') || window.location.pathname.includes('189')) {
            return '/teskilat/episode-189';
          }
          if (window.location.pathname.includes('/episode-188') || window.location.pathname.includes('188')) {
            return '/teskilat/episode-188';
          }
          if (window.location.pathname.includes('/episode-187')) {
            return '/teskilat/episode-187';
          }
          if (window.location.pathname.includes('/episode-186')) {
            return '/teskilat/episode-186';
          }
        }
        return '/teskilat';
      default: return '/';
    }
  };

  const seoPath = typeof window !== 'undefined'
    && currentRoute === 'home'
    && window.location.pathname !== '/'
    ? window.location.pathname
    : getPathForRoute(currentRoute);

  return (
    <LanguageProvider>
      <SEOHead pathname={seoPath} />

      <Suspense fallback={null}>
        <div className="w-full">
          {renderCurrentRoute()}
        </div>

        {/* Admin SEO CMS Control Modal */}
        {isSEOAdminOpen && (
          <SEOAdminModal 
            isOpen={isSEOAdminOpen}
            onClose={() => setIsSEOAdminOpen(false)}
            currentPath={getPathForRoute(currentRoute)}
          />
        )}

        {/* Global Video Modal Player */}
        {activeVideoModal && (
          <VideoModal 
            vimeoId={activeVideoModal}
            videoUrl={activeVideoModal}
            title={activeVideoTitle}
            aspectRatio={activeVideoAspect}
            onClose={handleCloseVideo}
          />
        )}

        {/* Global Book a Strategy Call Modal */}
        {isBookCallModalOpen && (
          <BookCallModal 
            isOpen={isBookCallModalOpen}
            onClose={handleCloseBookCall}
            preselectedPlan={preselectedPlanForBooking}
          />
        )}
      </Suspense>

      {/* Global Phone Completion Enforcement for Google Accounts */}
      <GlobalPhoneCompletionGuard currentRoute={currentRoute} />

      {/* Global Cookie Consent Banner */}
      <CookieBanner />
    </LanguageProvider>
  );
}

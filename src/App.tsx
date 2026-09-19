/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
import { VideoModal } from './components/VideoModal';
import { BookCallModal } from './components/BookCallModal';
import { CookieBanner } from './components/CookieBanner';
import { PricingPage } from './components/PricingPage';
import { FeviqoFlowApp } from './components/FeviqoFlowApp';

// Dedicated Sub-Pages
import { VideoGalleryPage } from './components/pages/VideoGalleryPage';
import { ContentCreatorsPage } from './components/pages/ContentCreatorsPage';
import { BusinessOwnersPage } from './components/pages/BusinessOwnersPage';
import { AgenciesPage } from './components/pages/AgenciesPage';
import { TestimonialsPage } from './components/pages/TestimonialsPage';
import { CaseStudiesPage } from './components/pages/CaseStudiesPage';
import { UnlimitedEditingPage } from './components/pages/UnlimitedEditingPage';
import { PlatformOverviewPage } from './components/pages/PlatformOverviewPage';
import { TurkishDramaPage } from './components/pages/TurkishDramaPage';

import { AppRoute, PreselectedPlan } from './types';
import { initializeAssetSync } from './services/assetService';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      
      if (path.includes('/admin') || hash.includes('#admin')) return 'flow';
      if (path.includes('/flow') || hash.includes('#flow')) return 'flow';
      if (path.includes('/pricing') || hash.includes('#pricing')) return 'pricing';
      if (path.includes('/gallery') || hash.includes('#gallery')) return 'gallery';
      if (path.includes('/creators') || hash.includes('#creators')) return 'creators';
      if (path.includes('/business') || hash.includes('#business')) return 'business';
      if (path.includes('/agencies') || hash.includes('#agencies')) return 'agencies';
      if (path.includes('/testimonials') || hash.includes('#testimonials')) return 'testimonials';
      if (path.includes('/case-studies') || hash.includes('#case-studies')) return 'case-studies';
      if (path.includes('/unlimited-editing') || hash.includes('#unlimited-editing')) return 'unlimited-editing';
      if (path.includes('/platform') || hash.includes('#platform')) return 'platform';
      if (path.includes('/turkish-drama') || hash.includes('#turkish-drama')) return 'turkish-drama';
    }
    return 'home';
  });

  const [flowInitialView, setFlowInitialView] = useState<'login' | 'register' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('#admin')) return 'admin';
    }
    return 'login';
  });
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');
  const [activeVideoAspect, setActiveVideoAspect] = useState<'16/9' | '9/16'>('16/9');
  const [isBookCallModalOpen, setIsBookCallModalOpen] = useState(false);
  const [preselectedPlanForBooking, setPreselectedPlanForBooking] = useState<PreselectedPlan | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path.includes('/admin') || hash.includes('#admin')) {
        setCurrentRoute('flow');
        setFlowInitialView('admin');
      } else if (path.includes('/flow') || hash.includes('#flow')) {
        setCurrentRoute('flow');
      } else if (path.includes('/pricing') || hash.includes('#pricing')) {
        setCurrentRoute('pricing');
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
      } else if (path.includes('/turkish-drama') || hash.includes('#turkish-drama')) {
        setCurrentRoute('turkish-drama');
      } else {
        setCurrentRoute('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    initializeAssetSync();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

    const newPath = route === 'home' ? '/' : `/${route}`;
    try {
      window.history.pushState({ route }, '', newPath);
    } catch {
      // ignore
    }
  };

  const handleOpenVideo = (vimeoIdOrSource: string, title?: string, aspect?: '16/9' | '9/16') => {
    setActiveVideoModal(vimeoIdOrSource);
    setActiveVideoTitle(title || '');
    setActiveVideoAspect(aspect || '16/9');
  };

  const handleCloseVideo = () => {
    setActiveVideoModal(null);
    setActiveVideoTitle('');
  };

  const handleOpenBookCall = (plan?: any) => {
    if (plan && typeof plan === 'object' && typeof plan.name === 'string' && typeof plan.monthlyRate === 'number') {
      setPreselectedPlanForBooking(plan as PreselectedPlan);
    } else {
      setPreselectedPlanForBooking(null);
    }
    setIsBookCallModalOpen(true);
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

      case 'home':
      default:
        return (
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 font-sans flex flex-col selection:bg-[#22C55E] selection:text-white">
            {/* Top Banner Alert */}
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

  return (
    <>
      <div className="w-full">
        {renderCurrentRoute()}
      </div>

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
      <BookCallModal 
        isOpen={isBookCallModalOpen}
        onClose={handleCloseBookCall}
        preselectedPlan={preselectedPlanForBooking}
      />

      {/* Global Cookie Consent Banner */}
      <CookieBanner />
    </>
  );
}

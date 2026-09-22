import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, ArrowRight } from 'lucide-react';
import { Navbar } from '../Navbar';
import { AppRoute } from '../../types';
import { SafeImage } from '../SafeImage';
import { fetchAllCmsData, CMS_UPDATED_EVENT, TestimonialItem } from '../../services/cmsService';

interface TestimonialsPageProps {
  onBackToHome: () => void;
  onBookCall: () => void;
  onNavigatePricing: () => void;
  onOpenVideo?: (id: string) => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage?: (route: AppRoute) => void;
}

const AVATAR_FALLBACK_MAP: Record<string, string> = {
  'jenna-kutcher': '/images/avatars/jenna-kutcher.webp',
  'lais-deleon': '/images/avatars/lais-deleon.webp',
  'alex-tubio': '/images/avatars/alex-tubio.webp',
  'danny-barrera': '/images/avatars/danny-barrera.webp',
  'patrick-anghel': '/images/avatars/patrick-anghel.webp',
  'marcus-vance': '/images/avatars/justin-knopp.webp',
  'david-chen': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'fund-founders': '/images/avatars/fund-founders.webp',
};

const DEFAULT_SECONDARY_REVIEWS: TestimonialItem[] = [
  {
    id: 'test-2',
    name: 'Danny Barrera',
    role: 'Agency Founder & CEO',
    company: 'Concrete Agency',
    quote: 'We scaled our short-form content output from 8 videos a month to over 45 without hiring an in-house editor. FEVIQO delivers consistent, brand-accurate revisions within 24 hours.',
    avatar: '/images/avatars/danny-barrera.webp',
    vimeoId: '1003651372',
    rating: 5,
    highlight: '500+ Videos Delivered',
    subscribers: '8-Figure Agency',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'test-3',
    name: 'Patrick Anghel',
    role: 'Creator & Founder',
    company: 'Anghel Consulting',
    quote: 'The caliber of motion graphics and retention pacing they add to my videos is unmatched. My retention curve jumped 23% in the first 3 weeks.',
    avatar: '/images/avatars/patrick-anghel.webp',
    vimeoId: '922887065',
    rating: 5,
    highlight: '23% Retention Lift',
    subscribers: '350K Followers',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'test-4',
    name: 'Jenna Kutcher',
    role: 'Podcast Host & Author',
    company: 'Goal Digger Media',
    quote: 'Managing video editors was our single largest operational bottleneck. Partnering with FEVIQO gave us dependable turnarounds and master-quality color grading.',
    avatar: '/images/avatars/jenna-kutcher.webp',
    vimeoId: '1003651372',
    rating: 5,
    highlight: 'Zero Hiring Overhead',
    subscribers: 'Top 10 Podcast',
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'test-5',
    name: 'Marcus Vance',
    role: 'Head of Growth',
    company: 'Hypergrowth.io',
    quote: 'Our paid social CPA dropped by 42% because FEVIQO helped us rapidly test 15+ hook variations every week. It feels like having an in-house production team on tap.',
    avatar: '/images/avatars/justin-knopp.webp',
    vimeoId: '1003651372',
    rating: 5,
    highlight: '42% Lower CPA',
    subscribers: 'Hypergrowth.io',
    displayOrder: 5,
    isActive: true,
  },
  {
    id: 'test-6',
    name: 'Lais DeLeon',
    role: 'Fitness Brand Founder',
    company: 'Lais Fitness',
    quote: 'Unlimited revisions means zero anxiety. If I want a music tweak or a text placement shifted, they update it in a couple of hours. I could never go back to Upwork freelancers.',
    avatar: '/images/avatars/lais-deleon.webp',
    vimeoId: '922887065',
    rating: 5,
    highlight: 'Fast Turnarounds',
    subscribers: '950K Community',
    displayOrder: 6,
    isActive: true,
  },
  {
    id: 'test-7',
    name: 'David Chen',
    role: 'DTC Brand Founder',
    company: 'Kumo Living',
    quote: 'Our TikTok and Reels ad creative fatigue was killing profitability. FEVIQO delivers 6-8 fresh high-converting hooks weekly without missing a single deadline. Our ROAS spiked 2.8x in 60 days.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    vimeoId: '1003651372',
    rating: 5,
    highlight: '2.8x Blended ROAS',
    subscribers: '8-Figure Brand',
    displayOrder: 7,
    isActive: true,
  },
];

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({
  onBackToHome,
  onBookCall,
  onNavigatePricing,
  onOpenVideo,
  onNavigateSection,
  onNavigateFlow,
  onNavigatePage,
}) => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetchAllCmsData().then((state) => {
      if (isMounted && state.testimonials && state.testimonials.length > 0) {
        setTestimonials(state.testimonials.filter((t) => t.isActive));
      }
    });

    const handleCmsUpdate = (e: any) => {
      if (e.detail?.testimonials) {
        setTestimonials(e.detail.testimonials.filter((t: TestimonialItem) => t.isActive));
      }
    };

    window.addEventListener(CMS_UPDATED_EVENT, handleCmsUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener(CMS_UPDATED_EVENT, handleCmsUpdate);
    };
  }, []);

  const featured = testimonials[0] || {
    name: 'Alex Tubio',
    role: 'YouTube Creator & Strategist',
    company: 'Tubio Media',
    quote: 'FEVIQO completely transformed my production workflow. I went from spending entire weekends editing to simply uploading raw files and receiving polished cuts within 24-48 hours. My views jumped from 100K to 800K.',
    avatar: '/images/avatars/alex-tubio.webp',
    highlight: '800K Monthly Views',
    rating: 5,
  };

  const secondary = testimonials.length > 1 ? testimonials.slice(1) : DEFAULT_SECONDARY_REVIEWS;

  return (
    <div className="min-h-screen bg-white text-[#0B0B0D] font-sans flex flex-col selection:bg-[#22C55E] selection:text-white">
      {/* Navigation */}
      <Navbar 
        onBookCall={onBookCall}
        onNavigateSection={onNavigateSection || onBackToHome}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow || (() => {})}
        onNavigatePage={onNavigatePage || ((route) => {
          if (route === 'home') onBackToHome();
        })}
      />

      {/* Editorial Header */}
      <section className="pt-16 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold uppercase tracking-wider mb-6 text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          <span>Client Proof &amp; Retention Records</span>
        </div>

        <h1 className="font-coolvetica text-4xl sm:text-6xl font-bold text-[#0B0B0D] tracking-tight leading-[1.05] mb-6">
          Loved by <span className="font-editorial-italic font-normal text-[#16a34a]">creators</span> and <span className="font-editorial-italic font-normal text-[#16a34a]">brands</span> who refuse to compromise on craft.
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          High-velocity production without sacrificing taste. Here is what happens when senior editors integrate directly with your workflow.
        </p>

        {/* Minimal Social Proof Bar */}
        <div className="mt-8 inline-flex items-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex text-[#22C55E] gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#22C55E] text-[#22C55E]" />
            ))}
          </div>
          <span className="text-[#0B0B0D] font-bold">4.9 / 5.0 Average Client Rating</span>
          <span className="text-slate-300">•</span>
          <span>500+ Video Deliverables Completed</span>
        </div>
      </section>

      {/* Primary Featured Testimonial (Large Editorial Moment) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full mb-16 sm:mb-24">
        <div className="border border-slate-200 bg-slate-50/50 rounded-3xl p-8 sm:p-14 text-left relative overflow-hidden">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16a34a]">Featured Creator Case</span>
            {featured.highlight && (
              <span className="px-2.5 py-0.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-[#0B0B0D]">
                {featured.highlight}
              </span>
            )}
          </div>

          <blockquote className="text-2xl sm:text-3xl sm:leading-snug font-bold text-[#0B0B0D] tracking-tight mb-8">
            "{featured.quote}"
          </blockquote>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200/80">
            <div className="flex items-center gap-4">
              <SafeImage
                src={featured.avatar}
                fallbackSrc={AVATAR_FALLBACK_MAP['alex-tubio'] || '/images/avatars/alex-tubio.svg'}
                alt={featured.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white ring-1 ring-slate-200 shadow-sm"
              />
              <div>
                <div className="text-base font-black text-[#0B0B0D]">{featured.name}</div>
                <div className="text-xs text-slate-500 font-medium">{featured.role} • {featured.company}</div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[#22C55E]">
              {[...Array(featured.rating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#22C55E] text-[#22C55E]" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Testimonials (Complete 6 Small Reviews, Balanced 2-Column Grid) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full pb-20 sm:pb-28">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-8">
          More Creator &amp; Founder Perspectives
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {secondary.map((t, idx) => {
            const avatarKey = t.name.toLowerCase().includes('kutcher') ? 'jenna-kutcher' :
                              t.name.toLowerCase().includes('lais') ? 'lais-deleon' :
                              t.name.toLowerCase().includes('danny') ? 'danny-barrera' :
                              t.name.toLowerCase().includes('patrick') ? 'patrick-anghel' :
                              t.name.toLowerCase().includes('marcus') ? 'marcus-vance' :
                              t.name.toLowerCase().includes('david') ? 'david-chen' : 'fund-founders';
            const fallback = AVATAR_FALLBACK_MAP[avatarKey] || '/images/avatars/alex-tubio.webp';
            const isLastOdd = (secondary.length % 2 !== 0) && (idx === secondary.length - 1);

            return (
              <div 
                key={t.id || idx}
                className={`pt-6 border-t border-slate-200 flex flex-col justify-between text-left group ${
                  isLastOdd ? 'md:col-span-2 md:max-w-xl md:mx-auto w-full' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-[#22C55E] gap-0.5">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#22C55E] text-[#22C55E]" />
                      ))}
                    </div>
                    {t.highlight && (
                      <span className="text-xs font-semibold text-slate-500">
                        {t.highlight}
                      </span>
                    )}
                  </div>

                  <p className="text-base text-slate-800 leading-relaxed font-normal mb-6">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <SafeImage
                    src={t.avatar}
                    fallbackSrc={fallback}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                  />
                  <div>
                    <div className="text-sm font-bold text-[#0B0B0D]">{t.name}</div>
                    <div className="text-xs text-slate-500 font-medium">{t.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Understated Editorial CTA */}
      <section className="border-t border-slate-200 py-16 px-4 sm:px-6 lg:px-8 bg-slate-50/60 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-[#0B0B0D] tracking-tight mb-4">
            Ready for a frictionless editing partnership?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Get your dedicated video editor today. No hiring, no vetting, and zero management stress.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onBookCall}
              className="px-8 py-3.5 rounded-full bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-black font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              <span>Book Strategy Call</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigatePricing}
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 transition-colors cursor-pointer"
            >
              View Membership Plans
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Play, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { AdBanner728x90 } from '../AdBanner728x90';
import { AdBanner320x50 } from '../AdBanner320x50';
import { AdBanner468x60 } from '../AdBanner468x60';
import { AdBanner300x250 } from '../AdBanner300x250';
import { AdBanner160x300 } from '../AdBanner160x300';
import { AdNativeBanner } from '../AdNativeBanner';
import { getDramaById } from '../../data/membershipCatalog';
import { useDramaEntitlement } from '../membership/useDramaEntitlement';
import { PremiumEpisodeModal } from '../membership/PremiumEpisodeModal';
import { DramaMemberBar } from '../membership/DramaMemberBar';
import { YERALTI_LOGO_URL, YERALTI_POSTER_URL } from '../../data/yeraltiData';

interface DramasPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: any) => void;
}

interface DramaItem {
  id: string;
  title: string;
  urduTitle?: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  buttonLabel: string;
  latestEpisodeUrl?: string;
  latestEpisodeLabel?: string;
  isUrduDubOnly?: boolean;
}

const dramas: DramaItem[] = [
  {
    id: "yeralti",
    title: "Yeralti - Urdu Dub",
    urduTitle: "جرائم کی دنیا",
    subtitle: "Season 1 · Turkish Drama · Urdu Dubbed Exclusive",
    description: "Step into the dark criminal underworld in Yeralti - Urdu Dub (جرائم کی دنیا). Rival syndicates, high-stakes betrayals, and relentless power struggles unfold in exclusive Urdu Dubbed HD on FEVIQO Premium.",
    image: YERALTI_POSTER_URL,
    href: "/yeralti",
    buttonLabel: "Explore Yeralti - Urdu Dub",
    isUrduDubOnly: true
  },
  {
    id: "teskilat",
    title: "Teskilat",
    subtitle: "Season 7 · Turkish Drama · Urdu Subtitles & Urdu Dubbed",
    description: "An intense intelligence drama of missions, loyalty, sacrifice and betrayal. Altay and his secret operatives face dangerous operations to protect their homeland from international threats.",
    image: "https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2",
    href: "/teskilat",
    buttonLabel: "Watch Teskilat Season 7",
    latestEpisodeUrl: "/teskilat/episode-189",
    latestEpisodeLabel: "Episode 189 (Latest Free)"
  },
  {
    id: "gunesin-dogdugu-yer",
    title: "Gunesin Dogdugu Yer",
    subtitle: "Turkish Drama · Urdu Subtitles & Urdu Dubbed",
    description: "A powerful Turkish story of people, ambition, struggle and the choices that shape their lives. Follow an intense family saga, deep regional rivalries, and lovers torn apart by secrets.",
    image: "https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh",
    href: "/gunesin-dogdugu-yer",
    buttonLabel: "Watch Gunesin Dogdugu Yer",
    latestEpisodeUrl: "/gunesin-dogdugu-yer/episode-7",
    latestEpisodeLabel: "Episode 7 (Latest Free)"
  },
  {
    id: "mehmed-fetihler-sultani",
    title: "Mehmed: Fetihler Sultani",
    subtitle: "Season 4 · Turkish Drama · Urdu Subtitles & Urdu Dubbed",
    description: "The epic historical saga of Sultan Mehmed II, the Conqueror of Constantinople. Watch tactical siege operations, imperial intrigue, and royal warfare in HD Urdu Subtitles & Urdu Dubbed.",
    image: "https://lh3.googleusercontent.com/d/1Je_-r1ngLfH15ryeju3suvZC2W0YSTL1",
    href: "/mehmed-fetihler-sultani",
    buttonLabel: "Explore Mehmed Hub",
    latestEpisodeUrl: "/mehmed-fetihler-sultani/episode-90",
    latestEpisodeLabel: "Episode 90 (Latest Free)"
  }
];

interface SlideItem {
  id: string;
  title: string;
  urduTitle?: string;
  eyebrow: string;
  heading: string;
  badgeText: string;
  logoUrl: string;
  tags: string[];
  description: string;
  image: string;
  href: string;
  isUrduDubOnly?: boolean;
}

const slides: SlideItem[] = [
  {
    id: "yeralti",
    title: "Yeralti - Urdu Dub",
    urduTitle: "جرائم کی دنیا",
    eyebrow: "YERALTI - URDU DUB",
    heading: "Yeralti - Urdu Dub",
    badgeText: "Urdu Dubbed · Premium Exclusive",
    logoUrl: YERALTI_LOGO_URL,
    tags: ["Turkish", "Crime", "Thriller"],
    description: "Enter the ruthless underworld in Yeralti - Urdu Dub (جرائم کی دنیا). Rival syndicates, deadly secrets, and high-stakes betrayals streaming exclusively in Urdu Dubbed HD on FEVIQO.",
    image: YERALTI_POSTER_URL,
    href: "/yeralti",
    isUrduDubOnly: true
  },
  {
    id: "teskilat",
    title: "TESKILAT",
    eyebrow: "TESKILAT",
    heading: "TESKILAT — Ultra HD Urdu Subtitles & Dub",
    badgeText: "Urdu Subtitles & Dub",
    logoUrl: "https://lh3.googleusercontent.com/d/1hO0OhAjFTt4UPxwURNI8u0Hm7j0xz74Y",
    tags: ["Turkish", "Thriller", "Action"],
    description: "When their country is threatened, fearless patriots form a secret team to protect their homeland from terrorists. Experience high-octane suspense and unmatched patriotism in Ultra HD with Urdu Subtitles.",
    image: "https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2",
    href: "/teskilat"
  },
  {
    id: "gunesin-dogdugu-yer",
    title: "GUNESIN DOGDUGU YER",
    eyebrow: "GUNESIN DOGDUGU YER",
    heading: "GUNESIN DOGDUGU YER — Ultra HD Urdu Subtitles & Dub",
    badgeText: "Urdu Subtitles & Dub",
    logoUrl: "https://lh3.googleusercontent.com/d/1ceV7W__33FQpHUPZMaxE8cahPItht54z",
    tags: ["Turkish", "Drama", "Mystery"],
    description: "Explore an intense family saga, deep-rooted regional rivalries, and the journey of lovers torn apart by dynastic secrets. Stream the latest episodes officially on FEVIQO in premium high definition.",
    image: "https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh",
    href: "/gunesin-dogdugu-yer"
  },
  {
    id: "mehmed-fetihler-sultani",
    title: "MEHMED FETIHLER SULTANI",
    eyebrow: "MEHMED FETIHLER SULTANI",
    heading: "MEHMED FETIHLER SULTANI — Ultra HD Urdu Subtitles & Dub",
    badgeText: "Urdu Subtitles & Dub",
    logoUrl: "https://lh3.googleusercontent.com/d/19HL2dzvRlKelis5qfA0ZyJ-vLUwU_ctZ",
    tags: ["Turkish", "Historical", "War"],
    description: "Witness the grand conquest and strategic brilliance of Sultan Mehmed II. Watch Season 4 with Urdu Subtitles and exclusive Urdu Dubbed episodes officially on FEVIQO.",
    image: "https://lh3.googleusercontent.com/d/1Je_-r1ngLfH15ryeju3suvZC2W0YSTL1",
    href: "/mehmed-fetihler-sultani"
  }
];

export const DramasPage: React.FC<DramasPageProps> = ({
  onBackToHome,
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const { member, gateState, hasDramaAccess, attemptWatchEpisode, closeGateModal } =
    useDramaEntitlement();

  const navigateDramaHub = (dramaId: string) => {
    if (dramaId === 'teskilat') {
      onNavigatePage('teskilat-urdu');
    } else if (dramaId === 'mehmed-fetihler-sultani') {
      onNavigatePage('mehmed-fetihler-sultani');
    } else if (dramaId === 'yeralti') {
      onNavigatePage('yeralti');
    } else {
      onNavigatePage('gunesin-dogdugu-yer');
    }
  };

  // Client-side SEO injection
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    document.title = "Turkish Dramas in Urdu Dub & Subtitles | Yeralti, Teskilat & Mehmed | FEVIQO";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Explore Turkish dramas in Urdu Dub and Urdu Subtitles on FEVIQO, including Yeralti - Urdu Dub (جرائم کی دنیا), Teskilat, Mehmed: Fetihler Sultani, and Gunesin Dogdugu Yer.");

    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', "index, follow, max-image-preview:large");

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', "https://feviqo.com/dramas");

    // JSON-LD structured data injection
    const jsonLdData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": "https://feviqo.com/dramas#webpage",
          "url": "https://feviqo.com/dramas",
          "name": "Turkish Dramas in Urdu Subtitles | Teskilat & Gunesin Dogdugu Yer | FEVIQO",
          "description": "Explore Turkish dramas with Urdu subtitles on FEVIQO, including Teskilat and Gunesin Dogdugu Yer.",
          "isPartOf": {
            "@type": "WebSite",
            "@id": "https://feviqo.com/#website",
            "url": "https://feviqo.com/",
            "name": "FEVIQO"
          }
        },
        {
          "@type": "BreadcrumbList",
          "@id": "https://feviqo.com/dramas#breadcrumb",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://feviqo.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Dramas",
              "item": "https://feviqo.com/dramas"
            }
          ]
        },
        {
          "@type": "ItemList",
          "@id": "https://feviqo.com/dramas#itemlist",
          "name": "FEVIQO Turkish Drama Collection",
          "itemListElement": dramas.map((drama, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "name": drama.title,
            "url": `https://feviqo.com${drama.href}`
          }))
        }
      ]
    };

    let scriptEl = document.getElementById('feviqo-dramas-jsonld');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.setAttribute('type', 'application/ld+json');
      scriptEl.setAttribute('id', 'feviqo-dramas-jsonld');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLdData);

  }, []);

  // Automatic slideshow rotation every 5.5 seconds to feel like premium Qayadat Play/Netflix platform
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white text-slate-900 font-sans antialiased min-h-screen flex flex-col relative overflow-x-hidden">

      {/* Unified Navigation Bar */}
      <Navbar 
        onBookCall={onBookCall} 
        onNavigateSection={() => onNavigatePage('home')}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      <DramaMemberBar onNavigatePage={onNavigatePage} />

      {/* RE-ARCHITECTED STACKED HERO SECTION (IDENTICAL ON PHONE & DESKTOP): 100% PICTURE SIGHT WITH SOLID READABLE DARK PLATE BELOW */}
      <section className="relative w-full bg-black text-white overflow-hidden">
        
        {/* Slides rendering loop */}
        <div className="relative w-full flex flex-col">
          {slides.map((slide, idx) => {
            const isActive = idx === activeSlide;
            return (
              <div
                key={slide.id}
                className={`w-full flex flex-col transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 z-0 pointer-events-none'}`}
              >
                
                {/* 1. PICTURE PANEL: Displays widescreen 16:9 banner with zero cropping, 100% visible on any device */}
                <a
                  href={slide.href}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      navigateDramaHub(slide.id);
                    }
                  }}
                  className="w-full aspect-video bg-black relative select-none block cursor-pointer"
                >
                  <img
                    src={slide.image}
                    alt={`${slide.title} Cinematic Backdrop`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const fallback = '/images/posters/poster-horiz-narrative-storytelling.jpg';
                      if (!e.currentTarget.src.endsWith(fallback)) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                    className={`w-full h-full object-contain ${
                      slide.isUrduDubOnly && !hasDramaAccess(slide.id) ? 'brightness-75' : ''
                    }`}
                  />
                  {slide.isUrduDubOnly && !hasDramaAccess(slide.id) && (
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 px-3.5 py-1.5 rounded-full bg-[#0B0B0D]/90 border border-[#22C55E]/50 text-[#22C55E] text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xl">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Urdu Dub · Locked for Free Users</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                </a>

                {/* 2. DETAILS AREA: Solid, ultra-premium text content block sitting directly below on solid black */}
                <div className="w-full bg-black py-8 px-6 sm:px-12 lg:px-16 z-20 border-b border-zinc-800">
                  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left">
                    
                    {/* Left text panel */}
                    <div className="lg:col-span-8 space-y-4 sm:space-y-5">
                      <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                        FEVIQO • {slide.eyebrow}
                      </div>

                      {/* Primary Descriptive H1 Heading */}
                      <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                        {slide.heading}
                      </h1>

                      {slide.urduTitle && (
                        <div className="text-xl sm:text-2xl font-urdu-slim text-emerald-300 font-normal dir-rtl leading-relaxed">
                          {slide.urduTitle}
                        </div>
                      )}

                      {/* Official Graphic LOGO matching exactly Teskilat sizing & position */}
                      <div className="h-14 sm:h-20 w-auto flex items-center justify-start select-none">
                        <img 
                          src={slide.logoUrl} 
                          alt={`${slide.title} Official Logo`}
                          referrerPolicy="no-referrer"
                          className="h-full w-auto object-contain max-w-[250px] sm:max-w-[340px]"
                          loading="eager"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-300">
                        {slide.tags.map((tag, tIdx) => (
                          <React.Fragment key={tag}>
                            {tIdx > 0 && <span className="text-slate-500 font-bold">-</span>}
                            <span>{tag}</span>
                          </React.Fragment>
                        ))}
                        <span className="text-slate-500 font-bold">-</span>
                        <span className="text-[#22C55E] font-bold uppercase tracking-wider">{slide.badgeText}</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
                        {slide.description}
                      </p>
                    </div>

                    {/* Right button panel */}
                    <div className="lg:col-span-4 flex items-center lg:justify-end">
                      <button
                        onClick={() => navigateDramaHub(slide.id)}
                        className="w-full lg:w-auto px-10 py-4 bg-white hover:bg-slate-200 text-black font-black text-sm tracking-wide rounded-lg transition duration-150 flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:scale-[1.02]"
                      >
                        {slide.isUrduDubOnly && !hasDramaAccess(slide.id) ? (
                          <Lock className="w-4 h-4 text-black" />
                        ) : (
                          <Play className="w-4 h-4 fill-current text-black" />
                        )}
                        <span>{slide.isUrduDubOnly && !hasDramaAccess(slide.id) ? 'Explore & Unlock' : 'Watch Now'}</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Carousel Bottom Dot Indicators (centered, exactly matching the screenshot style) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 select-none">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeSlide ? 'w-8 bg-[#22C55E]' : 'w-2.5 bg-zinc-600 hover:bg-zinc-400'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </section>

      {/* BREADCRUMB LIST AREA (WHITE BACKGROUND CONTENT AREA) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 w-full pt-12 bg-white">
        <nav className="text-xs text-slate-500 font-medium flex items-center gap-2" aria-label="Breadcrumb">
          <span 
            className="hover:text-slate-900 cursor-pointer transition-colors" 
            onClick={() => onNavigatePage('home')}
          >
            Home
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-emerald-600 font-bold">Dramas</span>
        </nav>
      </div>

      {/* MAIN COLLECTION SECTION (WHITE BACKGROUND CONTENT AREA) */}
      <section id="collection" className="w-full py-16 px-4 sm:px-8 lg:px-16 space-y-16 bg-white">
        
        {/* Header Block */}
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-left space-y-2">
            <span className="text-xs font-black text-[#16a34a] tracking-widest uppercase block">
              FEVIQO DRAMA COLLECTION
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Featured Turkish Dramas
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl font-normal">
              Choose your next story. Stream officially in high definition.
            </p>
          </div>
          <a
            href="/membership"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onNavigatePage('membership');
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B0B0D] hover:bg-[#22C55E] text-white hover:text-[#0B0B0D] text-xs font-bold transition shrink-0 self-start sm:self-auto"
          >
            <span>Explore Premium Membership</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Centralized Catalog Loop with ORIGINAL image color and exact aspect ratio */}
        <div className="max-w-7xl mx-auto space-y-20 sm:space-y-24">
          {dramas.map((drama, index) => {
            const isEven = index % 2 === 0;
            const isUnlocked = hasDramaAccess(drama.id);
            const premiumEp = getDramaById(drama.id)?.episodes.find(
              (ep) => ep.accessType === 'premium' && ep.isPublished
            );
            return (
              <article 
                key={drama.id}
                className="w-full"
              >
                <div 
                  className={`w-full flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}
                >
                  
                  {/* Artwork Panel (55–60% width) showing full original color in full rectangular 16:9 aspect-video */}
                  <a 
                    href={drama.href}
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey) {
                        e.preventDefault();
                        navigateDramaHub(drama.id);
                      }
                    }}
                    className="w-full lg:w-[58%] aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-100 relative shadow-md shrink-0 cursor-pointer group block"
                  >
                    <img 
                      src={drama.image} 
                      alt={`${drama.title} Turkish drama`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = '/images/posters/poster-horiz-narrative-storytelling.jpg';
                        if (!e.currentTarget.src.endsWith(fallback)) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                      className={`w-full h-full object-cover block transition-all duration-[450ms] ease-out ${
                        drama.isUrduDubOnly && !isUnlocked
                          ? 'brightness-50 group-hover:brightness-40 group-hover:scale-105'
                          : 'opacity-100 group-hover:scale-105'
                      }`}
                      loading="lazy"
                    />
                    {isUnlocked ? (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#22C55E] text-[#0B0B0D] text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Membership Active</span>
                      </div>
                    ) : drama.isUrduDubOnly ? (
                      <>
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0B0B0D]/90 text-[#22C55E] border border-[#22C55E]/50 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                          <Lock className="w-3 h-3" />
                          <span>Urdu Dub · Locked for Free Users</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25 flex flex-col items-center justify-center p-4 text-center">
                          <div className="w-14 h-14 rounded-full bg-[#0B0B0D]/90 border border-[#22C55E]/60 text-[#22C55E] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform mb-2.5">
                            <Lock className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider text-white">
                            Urdu Dubbed · Unlock with FEVIQO Premium
                          </span>
                        </div>
                      </>
                    ) : premiumEp ? (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0B0B0D]/90 text-[#22C55E] border border-[#22C55E]/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                        <Lock className="w-3 h-3" />
                        <span>Urdu Dubbed · Locked for Free Users</span>
                      </div>
                    ) : null}
                    {/* Balanced visual depth gradient on bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-transparent pointer-events-none" />
                  </a>

                  {/* Narrative details panel (40–45% width) */}
                  <div className="flex-1 text-left space-y-4 sm:space-y-6">
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-emerald-600 tracking-widest uppercase font-mono">
                        {drama.subtitle}
                      </p>
                      <h3 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none font-sans">
                        <a 
                          href={drama.href}
                          onClick={(e) => {
                            if (!e.metaKey && !e.ctrlKey) {
                              e.preventDefault();
                              navigateDramaHub(drama.id);
                            }
                          }}
                          className="hover:text-emerald-600 transition-colors"
                        >
                          {drama.title}
                        </a>
                      </h3>
                      {drama.urduTitle && (
                        <p className="text-xl sm:text-2xl font-urdu-slim text-emerald-700 font-semibold dir-rtl leading-relaxed pt-1">
                          {drama.urduTitle}
                        </p>
                      )}
                    </div>

                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg font-normal">
                      {drama.description}
                    </p>

                    {premiumEp && (
                      <div className="p-3 bg-[#0B0B0D] text-white rounded-xl flex items-center justify-between gap-3 border border-zinc-800">
                        <div className="flex items-center gap-2 min-w-0">
                          {isUnlocked ? (
                            <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-[#22C55E] shrink-0" />
                          )}
                          <span className="text-xs font-semibold truncate">
                            {isUnlocked
                              ? `Unlocked: ${premiumEp.title} (Urdu Dubbed)`
                              : `Locked Urdu Dubbed: Episode ${premiumEp.number}`}
                          </span>
                        </div>
                        <a
                          href={
                            isUnlocked
                              ? `${drama.href}/${premiumEp.slug}`
                              : `/membership?drama=${encodeURIComponent(drama.id)}&episode=${encodeURIComponent(premiumEp.slug)}`
                          }
                          onClick={(e) => {
                            if (!e.metaKey && !e.ctrlKey) {
                              e.preventDefault();
                              if (isUnlocked) {
                                window.dispatchEvent(
                                  new CustomEvent('feviqo-navigate-url', {
                                    detail: `${drama.href}/${premiumEp.slug}`,
                                  })
                                );
                              } else {
                                attemptWatchEpisode(drama.id, premiumEp.slug, premiumEp.title, () => {
                                  window.dispatchEvent(
                                    new CustomEvent('feviqo-navigate-url', {
                                      detail: `${drama.href}/${premiumEp.slug}`,
                                    })
                                  );
                                });
                              }
                            }
                          }}
                          className="text-xs font-black text-[#22C55E] hover:underline shrink-0"
                        >
                          {isUnlocked ? 'Watch Now →' : 'Unlock →'}
                        </a>
                      </div>
                    )}

                    {/* Latest Episode Direct Crawlable Power Link */}
                    {drama.latestEpisodeUrl && (
                      <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className="text-xs font-bold text-slate-900">
                            Latest Free Stream: <span className="text-emerald-700">{drama.latestEpisodeLabel || 'New Episode'}</span>
                          </span>
                        </div>
                        <a
                          href={drama.latestEpisodeUrl}
                          className="text-xs font-black text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1 shrink-0"
                        >
                          <span>Watch Now</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Highly premium buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      {drama.isUrduDubOnly && !isUnlocked && premiumEp ? (
                        <button
                          type="button"
                          onClick={() =>
                            attemptWatchEpisode(drama.id, premiumEp.slug, premiumEp.title, () => {
                              navigateDramaHub(drama.id);
                            })
                          }
                          className="px-6 py-3 bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm tracking-wide rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Lock className="w-4 h-4 text-slate-950" />
                          <span>Unlock Yeralti - Urdu Dub</span>
                        </button>
                      ) : (
                        <a 
                          href={drama.latestEpisodeUrl || drama.href}
                          className="px-6 py-3 bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm tracking-wide rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Play className="w-4 h-4 fill-current text-slate-950" />
                          <span>{drama.latestEpisodeLabel ? `Watch ${drama.latestEpisodeLabel}` : drama.buttonLabel}</span>
                        </a>
                      )}

                      <a 
                        href={drama.href}
                        onClick={(e) => {
                          if (!e.metaKey && !e.ctrlKey) {
                            e.preventDefault();
                            navigateDramaHub(drama.id);
                          }
                        }}
                        className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs sm:text-sm rounded-lg transition border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Explore Series Hub</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </a>
                    </div>

                  </div>

                </div>
              </article>
            );
          })}
        </div>

        {/* HIGH-EARNING AD BANNER SUITE & NATIVE BANNER */}
        <div className="pt-12 space-y-6">
          <div className="hidden md:block">
            <AdBanner728x90 />
          </div>
          <div className="block md:hidden">
            <AdBanner320x50 />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-6 my-4">
            <AdBanner468x60 />
            <AdBanner300x250 />
            <AdBanner160x300 />
          </div>

          <AdNativeBanner />
        </div>

      </section>

      {/* GLOBAL HIGH-CONVERTING FOOTER COMPONENT - MATCHING ALL OTHER PAGES EXACTLY */}
      <Footer 
        onBookCall={onBookCall}
        onGetStarted={onBookCall}
        onNavigateSection={() => onNavigatePage('home')}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={() => onNavigateFlow()}
        onNavigatePage={onNavigatePage}
      />

      <PremiumEpisodeModal
        gateState={gateState}
        member={member}
        onClose={closeGateModal}
        onNavigateMembershipUrl={(targetUrl) => {
          window.dispatchEvent(new CustomEvent('feviqo-navigate-url', { detail: targetUrl }));
        }}
      />

    </div>
  );
};

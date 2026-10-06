import React, { useEffect, useState } from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

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
  subtitle: string;
  description: string;
  image: string;
  href: string;
  buttonLabel: string;
}

const dramas: DramaItem[] = [
  {
    id: "teskilat",
    title: "Teskilat",
    subtitle: "Season 7 · Turkish Drama · Urdu Subtitles",
    description: "An intense intelligence drama of missions, loyalty, sacrifice and betrayal. Altay and his secret operatives face dangerous operations to protect their homeland from international threats.",
    image: "https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2",
    href: "/teskilat",
    buttonLabel: "Watch Teskilat"
  },
  {
    id: "gunesin-dogdugu-yer",
    title: "Gunesin Dogdugu Yer",
    subtitle: "Turkish Drama · Urdu Subtitles",
    description: "A powerful Turkish story of people, ambition, struggle and the choices that shape their lives. Follow an intense family saga, deep regional rivalries, and lovers torn apart by secrets.",
    image: "https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh",
    href: "/gunesin-dogdugu-yer",
    buttonLabel: "Watch Gunesin Dogdugu Yer"
  }
];

interface SlideItem {
  id: string;
  title: string;
  logoUrl: string;
  tags: string[];
  description: string;
  image: string;
  href: string;
}

const slides: SlideItem[] = [
  {
    id: "teskilat",
    title: "TESKILAT",
    logoUrl: "https://lh3.googleusercontent.com/d/1hO0OhAjFTt4UPxwURNI8u0Hm7j0xz74Y",
    tags: ["Turkish", "Thriller", "Action"],
    description: "When their country is threatened, fearless patriots form a secret team to protect their homeland from terrorists. Experience high-octane suspense and unmatched patriotism in Ultra HD with Urdu Subtitles.",
    image: "https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2",
    href: "/teskilat"
  },
  {
    id: "gunesin-dogdugu-yer",
    title: "GUNESIN DOGDUGU YER",
    logoUrl: "https://lh3.googleusercontent.com/d/1ceV7W__33FQpHUPZMaxE8cahPItht54z",
    tags: ["Turkish", "Drama", "Mystery"],
    description: "Explore an intense family saga, deep-rooted regional rivalries, and the journey of lovers torn apart by dynastic secrets. Stream the latest episodes officially on FEVIQO in premium high definition.",
    image: "https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh",
    href: "/gunesin-dogdugu-yer"
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

  // Client-side SEO injection
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    document.title = "Turkish Dramas in Urdu Subtitles | Teskilat & Gunesin Dogdugu Yer | FEVIQO";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Explore Turkish dramas with Urdu subtitles on FEVIQO, including Teskilat and Gunesin Dogdugu Yer. Discover premium Turkish series and their latest episodes.");

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
      
      {/* SEMANTIC & HIDDEN SEO H1 FOCUS KEYWORD */}
      <h1 className="sr-only">
        Turkish Dramas with Urdu Subtitles
      </h1>

      {/* Unified Navigation Bar */}
      <Navbar 
        onBookCall={onBookCall} 
        onNavigateSection={() => onNavigatePage('home')}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

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
                <div className="w-full aspect-video bg-black relative select-none">
                  <img
                    src={slide.image}
                    alt={`${slide.title} Cinematic Backdrop`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                </div>

                {/* 2. DETAILS AREA: Solid, ultra-premium text content block sitting directly below on solid black */}
                <div className="w-full bg-black py-8 px-6 sm:px-12 lg:px-16 z-20 border-b border-zinc-800">
                  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left">
                    
                    {/* Left text panel */}
                    <div className="lg:col-span-8 space-y-4 sm:space-y-5">
                      <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                        FEVIQO • {slide.id === 'teskilat' ? 'TESKILAT' : 'GUNESIN DOGDUGU YER'}
                      </div>

                      {/* Official Graphic LOGO matching exactly Teskilat sizing & position */}
                      <div className="h-14 sm:h-20 w-auto flex items-center justify-start select-none">
                        <img 
                          src={slide.logoUrl} 
                          alt={`${slide.title} Official Logo`}
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
                        <span className="text-[#22C55E] font-bold uppercase tracking-wider">Urdu Subtitles</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
                        {slide.description}
                      </p>
                    </div>

                    {/* Right button panel */}
                    <div className="lg:col-span-4 flex items-center lg:justify-end">
                      <button
                        onClick={() => {
                          if (slide.id === 'teskilat') {
                            onNavigatePage('teskilat-urdu');
                          } else {
                            onNavigatePage('gunesin-dogdugu-yer');
                          }
                        }}
                        className="w-full lg:w-auto px-10 py-4 bg-white hover:bg-slate-200 text-black font-black text-sm tracking-wide rounded-lg transition duration-150 flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:scale-[1.02]"
                      >
                        <Play className="w-4 h-4 fill-current text-black" />
                        <span>Watch Now</span>
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
        <div className="max-w-7xl mx-auto text-left space-y-2">
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

        {/* Centralized Catalog Loop with ORIGINAL image color and exact aspect ratio */}
        <div className="max-w-7xl mx-auto space-y-20 sm:space-y-24">
          {dramas.map((drama, index) => {
            const isEven = index % 2 === 0;
            return (
              <article 
                key={drama.id}
                className="w-full"
              >
                <div 
                  className={`w-full flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}
                >
                  
                  {/* Artwork Panel (55–60% width) showing full original color in full rectangular 16:9 aspect-video */}
                  <div 
                    onClick={() => {
                      if (drama.id === 'teskilat') {
                        onNavigatePage('teskilat-urdu');
                      } else {
                        onNavigatePage('gunesin-dogdugu-yer');
                      }
                    }}
                    className="w-full lg:w-[58%] aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative shadow-md shrink-0 cursor-pointer group"
                  >
                    <img 
                      src={drama.image} 
                      alt={`${drama.title} Turkish drama with Urdu subtitles`}
                      className="w-full h-full object-cover block opacity-100 group-hover:scale-105 transition-all duration-[450ms] ease-out"
                      loading="lazy"
                    />
                    {/* Balanced visual depth gradient on bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Narrative details panel (40–45% width) */}
                  <div className="flex-1 text-left space-y-4 sm:space-y-6">
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-emerald-600 tracking-widest uppercase font-mono">
                        {drama.subtitle}
                      </p>
                      <h3 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none font-sans">
                        {drama.title}
                      </h3>
                    </div>

                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg font-normal">
                      {drama.description}
                    </p>

                    {/* Highly premium buttons: Explore Gunesin Dogdugu Yer / Watch Teskilat as explicitly requested! */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => {
                          if (drama.id === 'teskilat') {
                            onNavigatePage('teskilat-urdu');
                          } else {
                            onNavigatePage('gunesin-dogdugu-yer');
                          }
                        }}
                        className="px-6 py-3 bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm tracking-wide rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Play className="w-4 h-4 fill-current text-slate-950" />
                        <span>{drama.buttonLabel}</span>
                      </button>

                      <button 
                        onClick={() => {
                          if (drama.id === 'teskilat') {
                            onNavigatePage('teskilat-urdu');
                          } else {
                            onNavigatePage('gunesin-dogdugu-yer');
                          }
                        }}
                        className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs sm:text-sm rounded-lg transition border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Explore Series Hub</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>

                  </div>

                </div>
              </article>
            );
          })}
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

    </div>
  );
};

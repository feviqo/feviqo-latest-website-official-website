import React, { useEffect } from 'react';
import { AlertCircle, ShieldCheck, Globe, BookOpen, ArrowLeft, Mail, Scale } from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { AppRoute } from '../../types';

interface DisclaimerPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

export const DisclaimerPage: React.FC<DisclaimerPageProps> = ({
  onBackToHome,
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
}) => {
  useEffect(() => {
    document.title = 'Disclaimer | FEVIQO';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#22C55E] selection:text-black flex flex-col">
      <Navbar
        onBookCall={onBookCall}
        onNavigateSection={() => onBackToHome()}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      {/* Hero Header */}
      <section className="relative bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#059669]/30 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-left space-y-5">
          <button
            onClick={() => onNavigatePage('home')}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-emerald-200 transition cursor-pointer mb-2 bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full border border-white/15 shadow-inner"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to FEVIQO Home</span>
          </button>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase tracking-widest">
              <AlertCircle className="w-4 h-4 text-[#22C55E]" />
              <span>EDITORIAL &amp; LEGAL DISCLAIMER</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
            Website Disclaimer
          </h1>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl font-medium opacity-90">
            Last Updated: November 2026 &bull; FEVIQO Ltd. (&ldquo;feviqo.com&rdquo;)
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
        {/* Core Portal Statement */}
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-2.5">
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#22C55E]" />
            <span>Editorial Review, Translation &amp; Fan Community Portal</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong>feviqo.com</strong> operates as an independent <strong>editorial review, translation, episode guide, and fan community portal</strong> alongside FEVIQO&rsquo;s creative video production studio. <strong>feviqo.com does not host, upload, store, or distribute copyrighted television broadcasts on its servers.</strong> All Turkish drama episode guides, Urdu/English story summaries, cast profiles, trailer breakdowns, and subtitle &amp; dubbing updates published on this website are provided strictly for informational, commentary, and fan-discussion purposes.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            1. No Hosting of Copyrighted Broadcasts
          </h2>
          <p>
            FEVIQO does not claim ownership over any third-party television series, broadcast footage, network logos, promotional stills, or character trademarks referenced in our Turkish drama coverage (including TRT 1, ATV, NOW, and other international broadcasters). All copyrights and trademarks remain the sole property of their respective production houses, broadcasters, and rights holders.
          </p>
          <p>
            Whenever third-party media embeds, trailers, or external references appear across the web, they are hosted on independent third-party platforms outside FEVIQO&rsquo;s server infrastructure. Viewers are encouraged to watch official broadcasts through authorized networks and licensed streaming services in their region.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            2. Accuracy of Editorial Content &amp; Schedules
          </h2>
          <p>
            While our editorial team works carefully to verify episode release dates, cast listings, Urdu subtitle &amp; dubbing schedules, and plot summaries, broadcast schedules and production details may change without prior notice. All editorial articles, reviews, and community posts on <strong>feviqo.com</strong> are provided &ldquo;as is&rdquo; for general informational and entertainment purposes without warranty of completeness or accuracy.
          </p>
        </section>

        <section className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#22C55E]" />
            <span>3. Advertising, Cookies &amp; External Links</span>
          </h2>
          <p className="text-slate-700">
            <strong>feviqo.com</strong> may display advertisements served by third-party advertising partners (including <strong>Monetag</strong> and <strong>Google AdSense</strong>) and may contain links to external websites or official broadcaster pages. FEVIQO does not endorse, control, or assume responsibility for the content, privacy practices, or availability of third-party websites or external advertising destinations.
          </p>
          <p className="text-sm text-slate-600">
            To learn more about how third-party advertising partners use cookies and web beacons—and how you can opt out—please review our{' '}
            <a
              href="/privacy-policy"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('privacy');
              }}
              className="text-emerald-700 font-bold underline"
            >
              Privacy Policy &amp; Cookie Disclosure
            </a>
            .
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            4. Fair Use, Translation &amp; Rights-Holder Takedowns
          </h2>
          <p>
            Original commentary, critical episode reviews, cast analysis, and written translations on <strong>feviqo.com</strong> are created for educational, journalistic, and fan-review purposes. If you are a copyright owner or authorized representative and wish to request the review or immediate removal of any reference, promotional image, or link, please follow our{' '}
            <a
              href="/dmca"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('dmca');
              }}
              className="text-emerald-700 font-bold underline"
            >
              DMCA &amp; Copyright Policy
            </a>{' '}
            or contact us directly. Valid requests are processed promptly within 24–48 hours.
          </p>
        </section>

        {/* Contact & Policy Navigation Box */}
        <section className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
            <span>Questions or Compliance Notices?</span>
          </h2>
          <p className="text-slate-300 text-sm">
            For editorial inquiries, licensing partnerships, or copyright/DMCA takedown requests, contact our compliance desk directly:
          </p>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Email: </span>
            <a href="mailto:partner@feviqo.com" className="underline">
              partner@feviqo.com
            </a>
          </div>
          <div className="flex flex-wrap gap-3 pt-2 text-xs font-bold">
            <a
              href="/dmca"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('dmca');
              }}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition inline-flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>DMCA Policy</span>
            </a>
            <a
              href="/privacy-policy"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('privacy');
              }}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('terms');
              }}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              Terms of Service
            </a>
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('contact');
              }}
              className="px-3.5 py-2 rounded-lg bg-[#22C55E] hover:bg-emerald-500 text-slate-950 transition"
            >
              Contact Us
            </a>
          </div>
        </section>
      </main>

      <Footer
        onBookCall={onBookCall}
        onGetStarted={onBookCall}
        onNavigateSection={() => onBackToHome()}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={() => onNavigateFlow()}
        onNavigatePage={onNavigatePage}
      />
    </div>
  );
};

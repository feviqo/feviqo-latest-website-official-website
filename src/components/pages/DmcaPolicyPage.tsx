import React, { useEffect } from 'react';
import { ShieldAlert, FileCheck2, Scale, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { AppRoute } from '../../types';

interface DmcaPolicyPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

export const DmcaPolicyPage: React.FC<DmcaPolicyPageProps> = ({
  onBackToHome,
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
}) => {
  useEffect(() => {
    document.title = 'DMCA & Copyright Policy | FEVIQO';
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
              <Scale className="w-4 h-4 text-[#22C55E]" />
              <span>INTELLECTUAL PROPERTY &amp; DMCA COMPLIANCE</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
            DMCA &amp; Copyright Policy
          </h1>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl font-medium opacity-90">
            Last Updated: November 2026 &bull; FEVIQO Ltd. (&ldquo;feviqo.com&rdquo;)
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
        {/* Fan Review & Editorial Portal Statement */}
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-2">
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            <span>Independent Fan Review &amp; Information Portal</span>
          </h2>
          <p className="text-sm text-slate-700">
            <strong>feviqo.com</strong> operates an independent editorial news, episode guide, cast directory, and fan review portal alongside FEVIQO&rsquo;s original video production studio. <strong>feviqo.com does not host, upload, store, or distribute copyrighted television episodes, movies, or full broadcast video files on its servers.</strong> All Turkish television drama titles, character names, trademarks, and promotional artwork belong exclusively to their respective networks, studios, and copyright owners.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            1. Respect for Intellectual Property
          </h2>
          <p>
            FEVIQO respects the intellectual property rights of content creators, television broadcasters, production companies, and rights holders worldwide in accordance with the Digital Millennium Copyright Act (17 U.S.C. &sect; 512) and applicable international copyright laws.
          </p>
          <p>
            Our Turkish drama pages consist strictly of original editorial commentary, written episode recaps, cast and character reference profiles, release date guides, trailer critiques, and reader discussions created for informational and review purposes.
          </p>
        </section>

        <section className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[#22C55E]" />
            <span>2. How to Submit a DMCA Takedown Notice</span>
          </h2>
          <p className="text-slate-700">
            If you are a copyright owner or an authorized representative and believe that any text, promotional still, or material displayed on <strong>feviqo.com</strong> infringes your copyright, please send a written DMCA notice to our Designated Copyright Agent containing the following details:
          </p>
          <ul className="list-disc pl-6 space-y-2.5 text-slate-700 text-sm">
            <li>
              <strong>Identification of the Copyrighted Work:</strong> A clear description of the copyrighted work you claim has been infringed (or a representative list of works).
            </li>
            <li>
              <strong>Exact URL(s) on feviqo.com:</strong> The specific URL(s) where the allegedly infringing material appears so we can locate and review it immediately.
            </li>
            <li>
              <strong>Your Contact Information:</strong> Your full name, organization/rights-holder name, mailing address, telephone number, and an active email address.
            </li>
            <li>
              <strong>Good-Faith Statement:</strong> A statement that you have a good-faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.
            </li>
            <li>
              <strong>Accuracy &amp; Authority Statement:</strong> A statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on the owner&rsquo;s behalf.
            </li>
            <li>
              <strong>Signature:</strong> Your physical or electronic signature.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            3. Response Time &amp; Removal Procedure
          </h2>
          <p>
            Upon receiving a valid and complete DMCA takedown notice, FEVIQO will promptly investigate and remove or disable access to the identified material—typically within <strong>24 to 48 hours</strong>—and confirm completion in writing to the complaining party.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            4. Counter-Notification &amp; Repeat Infringer Policy
          </h2>
          <p>
            In accordance with 17 U.S.C. &sect; 512(g), if material was removed due to mistake or misidentification, the affected contributor may submit a formal counter-notification. FEVIQO also maintains a strict policy of terminating repeat infringers where applicable.
          </p>
        </section>

        {/* Designated DMCA Agent Box */}
        <section className="p-6 rounded-2xl bg-slate-900 text-white space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#22C55E]" />
            <span>Designated DMCA Copyright Agent</span>
          </h2>
          <p className="text-slate-300 text-sm">
            Send all copyright inquiries and DMCA takedown requests directly to our compliance desk:
          </p>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Email: </span>
            <a href="mailto:partner@feviqo.com?subject=DMCA%20Notice%20-%20feviqo.com" className="underline">
              partner@feviqo.com
            </a>
          </div>
          <p className="text-xs text-slate-400 pt-1">
            You can also submit a notice through our{' '}
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('contact');
              }}
              className="text-emerald-300 underline font-semibold"
            >
              Contact Page
            </a>{' '}
            by selecting &ldquo;DMCA / Copyright Inquiry&rdquo;.
          </p>
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

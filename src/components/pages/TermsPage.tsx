import React, { useEffect } from 'react';
import { FileText, ShieldCheck, Scale, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { AppRoute } from '../../types';

interface TermsPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({
  onBackToHome,
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
}) => {
  useEffect(() => {
    document.title = "Terms of Service & Usage Agreement | FEVIQO";
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

      {/* Premium Hero Header */}
      <section className="relative bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#059669]/30 shadow-2xl overflow-hidden">
        {/* Background Decorative Elements */}
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
              <span>TERMS &amp; CONDITIONS AGREEMENT</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
            Terms of Service
          </h1>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl font-medium opacity-90">
            Last Updated: September 28, 2026 &bull; FEVIQO Ltd. ("FEVIQO", "we", "us", or "our")
          </p>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
        
        {/* Notice Card */}
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-2">
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            <span>Welcome to FEVIQO</span>
          </h2>
          <p className="text-sm text-slate-700">
            These Terms of Service govern your use of <strong>https://feviqo.com</strong>, the FEVIQO Flow client portal, and our unlimited video editing, motion graphics, and content production services.
          </p>
        </div>

        {/* Section 1: Agreement to Terms */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using FEVIQO, creating an account on FEVIQO Flow, subscribing to a production plan, or submitting video requests, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to all terms, do not access or use our site or services.
          </p>
        </section>

        {/* Section 2: Services Provided */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            2. Scope of Services
          </h2>
          <p>
            FEVIQO provides subscription-based unlimited video editing, post-production, motion graphics, short-form reformatting (TikTok/Reels/Shorts), YouTube long-form editing, and performance ad creation.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600">
            <li>
              <strong>Dedicated Queue &amp; Turnaround:</strong> Requests are processed in sequence according to your active plan (Scale, Pro, or In-House Studio) with standard 24 to 48-hour turnarounds per request queue.
            </li>
            <li>
              <strong>Revisions:</strong> Unlimited revisions are included for all active subscribers until you approve final video assets.
            </li>
            <li>
              <strong>Client Portal:</strong> Communication, asset transfers, review links, and task queues are managed through FEVIQO Flow.
            </li>
          </ul>
        </section>

        {/* Section 3: Intellectual Property & Ownership */}
        <section className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#22C55E]" />
            <span>3. Intellectual Property Rights &amp; Ownership</span>
          </h2>
          <p className="font-semibold text-slate-900">
            You own 100% of all content created for you.
          </p>
          <ul className="list-disc pl-6 space-y-3 text-slate-700 text-sm">
            <li>
              <strong>Work Ownership:</strong> All final video edits, project files, thumbnails, and renders delivered to you become your exclusive intellectual property upon payment.
            </li>
            <li>
              <strong>Client Materials:</strong> You retain ownership of all raw footage, logos, audio tracks, and brand assets uploaded to FEVIQO. You represent and warrant that you own or have licensed all rights to materials provided to us.
            </li>
            <li>
              <strong>Portfolio Permission:</strong> FEVIQO reserves the right to display non-confidential completed edits in our portfolio, case studies, and marketing unless explicitly agreed otherwise in writing.
            </li>
          </ul>
        </section>

        {/* Section 4: Billing, Subscriptions & Refunds */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            4. Subscriptions, Payments &amp; Cancellations
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-600">
            <li>
              <strong>Recurring Subscriptions:</strong> Production plans renew automatically monthly, quarterly, or yearly based on your selected billing cycle until cancelled.
            </li>
            <li>
              <strong>Cancellation:</strong> You can cancel your subscription at any time with zero hassle directly inside FEVIQO Flow or by contacting `partner@feviqo.com`. Your subscription will remain active until the end of the paid billing period.
            </li>
            <li>
              <strong>Refund Policy:</strong> Due to the customized nature of video production, subscription payments are non-refundable once work has commenced, except as required by applicable consumer law.
            </li>
          </ul>
        </section>

        {/* Section 5: Acceptable Use & Prohibited Conduct */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            5. Acceptable Use Policy
          </h2>
          <p>
            You agree not to upload or request the editing of any content that:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600">
            <li>Infringes upon any third-party copyright, trademark, patent, or intellectual property rights.</li>
            <li>Contains hate speech, illegal acts, defamation, harassment, or unlawful material.</li>
            <li>Contains malicious code, viruses, or attempts to disrupt FEVIQO infrastructure or portals.</li>
          </ul>
        </section>

        {/* Section 6: Limitation of Liability */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            6. Limitation of Liability &amp; Warranties
          </h2>
          <p>
            FEVIQO provides services on an "AS IS" and "AS AVAILABLE" basis. To the maximum extent permitted by law, FEVIQO disclaims all warranties, express or implied. FEVIQO shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of your use of our services or website.
          </p>
        </section>

        {/* Section 7: Third-Party Links & Advertisements */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            7. Third-Party Services &amp; Advertising
          </h2>
          <p>
            Our website (`feviqo.com`) may contain advertisements provided by Google AdSense and links to third-party websites or services. FEVIQO is not responsible for the content, privacy policies, or practices of any third-party websites or ad providers.
          </p>
        </section>

        {/* Section 8: Contact Us */}
        <section className="p-6 rounded-2xl bg-slate-900 text-white space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#22C55E]" />
            <span>Legal Contact</span>
          </h2>
          <p className="text-slate-300 text-sm">
            If you have any questions regarding these Terms of Service, please contact our legal team:
          </p>
          <div className="text-sm font-bold text-emerald-400">
            Email: <a href="mailto:partner@feviqo.com" className="underline">partner@feviqo.com</a>
          </div>
          <p className="text-xs text-slate-400 pt-2">
            FEVIQO Ltd. &bull; Unlimited Video Editing &amp; Digital Media Distribution
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

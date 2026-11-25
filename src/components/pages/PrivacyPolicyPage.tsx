import React, { useEffect } from 'react';
import { ShieldCheck, Lock, Eye, FileText, Globe, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { AppRoute } from '../../types';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  onBackToHome,
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
}) => {
  useEffect(() => {
    document.title = "Privacy Policy & Cookie Disclosure | FEVIQO";
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
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              <span>LEGAL &amp; PRIVACY COMPLIANCE</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
            Privacy Policy &amp; Cookie Disclosure
          </h1>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl font-medium opacity-90">
            Last Updated: November 2026 &bull; FEVIQO Ltd. (&ldquo;FEVIQO&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)
          </p>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
        
        {/* Notice Card */}
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-2">
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            <span>Your Privacy Matters at FEVIQO</span>
          </h2>
          <p className="text-sm text-slate-700">
            This Privacy Policy explains how FEVIQO collects, uses, discloses, and safeguards your information when you visit <strong>https://feviqo.com</strong>, read our Turkish drama episode guides and reviews, or use our video editing and creative studio services. Please read this policy carefully.
          </p>
        </div>

        {/* Section 1: Information We Collect */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            1. Information We Collect
          </h2>
          <p>
            When you interact with our website or services, we may collect information in the following ways:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600">
            <li>
              <strong>Personal Information Provided Voluntarily:</strong> Contact details such as your name, email address, company name, phone number, and inquiries submitted via booking forms, our contact page, or portal registrations (<code>partner@feviqo.com</code>).
            </li>
            <li>
              <strong>Log Data &amp; Device Information:</strong> Internet Protocol (IP) address, browser type, internet service provider (ISP), referring/exit pages, operating system, date/time stamp, and clickstream data.
            </li>
            <li>
              <strong>Video Media &amp; Brand Assets:</strong> Raw footage, brand guidelines, audio files, and instructions uploaded to FEVIQO Flow or cloud storage integrations by studio clients.
            </li>
          </ul>
        </section>

        {/* Section 2: Third-Party Advertising Partners (Monetag & Google AdSense) */}
        <section className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#22C55E]" />
            <span>2. Third-Party Advertising Partners (Monetag, Cookies &amp; Web Beacons)</span>
          </h2>
          <p className="font-semibold text-slate-900">
            FEVIQO works with third-party advertising networks—including <strong>Monetag</strong> and <strong>Google AdSense</strong>—to display advertisements on <strong>feviqo.com</strong>.
          </p>
          <ul className="list-disc pl-6 space-y-3 text-slate-700 text-sm">
            <li>
              <strong>Monetag &amp; Third-Party Ad Technologies:</strong> Third-party advertising partners such as <strong>Monetag</strong> may use cookies, JavaScript, service workers, and web beacons in their respective advertisements and links that appear on <strong>feviqo.com</strong>. These technologies automatically receive your IP address and non-personally identifiable browser/device signals to measure advertising effectiveness, prevent ad fraud, and personalize the advertising content you see.
            </li>
            <li>
              <strong>No Direct Control Over Third-Party Cookies:</strong> FEVIQO has no access to or direct control over the cookies or web beacons placed by third-party advertising partners. We encourage you to consult the respective privacy policies of our advertising partners, including <a href="https://monetag.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold underline">Monetag&rsquo;s Privacy Policy</a>, for detailed information on their data practices.
            </li>
            <li>
              <strong>Google Advertising Cookies:</strong> Google and its partners may also use advertising cookies to serve ads based on a user&rsquo;s prior visits to FEVIQO or other websites across the Internet.
            </li>
            <li>
              <strong>How to Opt Out of Personalized Ads &amp; Cookies:</strong>
              <ul className="list-circle pl-5 mt-2 space-y-1.5 text-slate-600">
                <li>You can disable or clear cookies and web beacons at any time through your web browser&rsquo;s privacy settings (Chrome, Safari, Firefox, Edge).</li>
                <li>You can opt out of push notifications or service worker permissions directly in your browser&rsquo;s site settings for <code>feviqo.com</code>.</li>
                <li>You can opt out of interest-based advertising across participating ad networks via the <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold underline">Network Advertising Initiative (NAI)</a> and the <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold underline">Digital Advertising Alliance (DAA / YourAdChoices)</a>.</li>
                <li>You can manage Google ad personalization at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold underline">Google Ad Settings</a>.</li>
              </ul>
            </li>
          </ul>
        </section>

        {/* Section 3: Cookies and Web Beacons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            3. Cookies &amp; Tracking Technologies
          </h2>
          <p>
            FEVIQO uses cookies, local storage, and web beacons to remember visitor preferences (such as language selection and reader discussion comments), measure site performance, and deliver relevant editorial and advertising experiences.
          </p>
          <p>
            You may choose to disable cookies through your individual browser options. Please note that disabling certain cookies may affect site preferences, though core editorial articles and episode guides remain accessible.
          </p>
        </section>

        {/* Section 4: GDPR & EEA Data Protection Rights */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            4. GDPR Data Protection Rights (European Economic Area &amp; UK)
          </h2>
          <p>
            If you are a resident of the European Economic Area (EEA), Switzerland, or the United Kingdom, you have certain data protection rights under the General Data Protection Regulation (GDPR):
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600">
            <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
            <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
            <li><strong>The right to erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> You have the right to request that we erase your personal data under certain conditions.</li>
            <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
            <li><strong>The right to object to processing:</strong> You have the right to object to our processing of your personal data.</li>
          </ul>
          <p className="text-xs text-slate-500 pt-1">
            To exercise any of these rights, please contact our Data Protection desk at <strong>partner@feviqo.com</strong>.
          </p>
        </section>

        {/* Section 5: CCPA / CPRA Privacy Rights */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            5. CCPA/CPRA Privacy Rights (California Residents)
          </h2>
          <p>
            Under the California Consumer Privacy Act (CCPA) and CPRA, California consumers have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600">
            <li>Request that a business disclose the categories and specific pieces of personal data collected about consumers.</li>
            <li>Request that a business delete any personal data about the consumer that a business collected.</li>
            <li>Request that a business that sells or shares a consumer&rsquo;s personal data not sell or share the consumer&rsquo;s personal data. FEVIQO does not sell personal information to third parties.</li>
          </ul>
        </section>

        {/* Section 6: Children's Information */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            6. Children&rsquo;s Privacy (COPPA Compliance)
          </h2>
          <p>
            Protecting children online is a core priority at FEVIQO. We do not knowingly collect any Personal Identifiable Information from children under the age of 13 (or 16 in certain jurisdictions). If you believe that your child provided personal information on our website, please contact us immediately and we will promptly remove such information from our records.
          </p>
        </section>

        {/* Section 7: Contact Us */}
        <section className="p-6 rounded-2xl bg-slate-900 text-white space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#22C55E]" />
            <span>Contact Privacy Desk</span>
          </h2>
          <p className="text-slate-300 text-sm">
            If you have questions about this Privacy Policy, third-party advertising partners (including Monetag), or cookie opt-out choices, please contact us:
          </p>
          <div className="text-sm font-bold text-emerald-400">
            Email: <a href="mailto:partner@feviqo.com" className="underline">partner@feviqo.com</a>
          </div>
          <p className="text-xs text-slate-400 pt-2">
            FEVIQO Ltd. &bull; Editorial Portal &amp; Creative Video Studio &bull;{' '}
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage('contact');
              }}
              className="text-emerald-300 underline"
            >
              Contact Form
            </a>
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

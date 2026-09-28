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
            <span>Your Privacy Matters at FEVIQO</span>
          </h2>
          <p className="text-sm text-slate-700">
            This Privacy Policy explains how FEVIQO collects, uses, discloses, and safeguards your information when you visit <strong>https://feviqo.com</strong> or use our video editing and digital media services. Please read this policy carefully.
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
              <strong>Personal Information Provided Voluntarily:</strong> Contact details such as your name, email address, company name, phone number, and project briefs submitted via booking forms, contact forms, or portal registrations (`partner@feviqo.com`).
            </li>
            <li>
              <strong>Log Data &amp; Device Information:</strong> Internet Protocol (IP) address, browser type, internet service provider (ISP), referring/exit pages, operating system, date/time stamp, and clickstream data.
            </li>
            <li>
              <strong>Video Media &amp; Brand Assets:</strong> Raw footage, brand guidelines, audio files, and instructions uploaded to FEVIQO Flow or cloud storage integrations.
            </li>
          </ul>
        </section>

        {/* Section 2: Google AdSense & Third-Party Advertising Cookies */}
        <section className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#22C55E]" />
            <span>2. Google AdSense &amp; Third-Party Cookies Disclosure</span>
          </h2>
          <p className="font-semibold text-slate-900">
            FEVIQO partners with Google AdSense and third-party advertising networks to serve advertisements on our website (`feviqo.com`).
          </p>
          <ul className="list-disc pl-6 space-y-3 text-slate-700 text-sm">
            <li>
              <strong>Third-Party Vendor Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to FEVIQO or other websites on the internet.
            </li>
            <li>
              <strong>Google's DART Cookie &amp; Advertising Cookies:</strong> Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to FEVIQO and/or other sites across the Internet.
            </li>
            <li>
              <strong>Opt-Out Options:</strong> Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold underline">Google Ad Settings</a>. Alternatively, users can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold underline">www.aboutads.info</a>.
            </li>
          </ul>
        </section>

        {/* Section 3: Cookies and Web Beacons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            3. Cookies &amp; Tracking Technologies
          </h2>
          <p>
            FEVIQO uses 'cookies' and similar tracking technologies to store information including visitors' preferences and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>
          <p>
            You can choose to disable cookies through your individual browser options. Detailed information about cookie management with specific web browsers can be found at the browsers' respective websites.
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
            <li><strong>The right to erasure ("Right to be Forgotten"):</strong> You have the right to request that we erase your personal data under certain conditions.</li>
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
            <li>Request that a business that sells or shares a consumer's personal data, not sell or share the consumer's personal data. FEVIQO does not sell personal information to third parties.</li>
          </ul>
        </section>

        {/* Section 6: Children's Information */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-2">
            6. Children's Privacy (COPPA Compliance)
          </h2>
          <p>
            Another part of our priority is adding protection for children while using the internet. FEVIQO does not knowingly collect any Personal Identifiable Information from children under the age of 13 (or 16 in certain jurisdictions). If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
          </p>
        </section>

        {/* Section 7: Contact Us */}
        <section className="p-6 rounded-2xl bg-slate-900 text-white space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#22C55E]" />
            <span>Contact Privacy Desk</span>
          </h2>
          <p className="text-slate-300 text-sm">
            If you have additional questions or require more information about our Privacy Policy or AdSense cookie choices, do not hesitate to contact us:
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
        onNavigateHome={() => onNavigatePage('home')}
        onNavigatePricing={() => onNavigatePage('pricing')}
        onNavigateGallery={() => onNavigatePage('gallery')}
        onNavigatePage={onNavigatePage}
      />
    </div>
  );
};

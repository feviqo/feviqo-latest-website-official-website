import React, { useEffect, useState } from 'react';
import { Mail, Send, CheckCircle2, ArrowLeft, Clock, ShieldCheck, Globe, AlertCircle } from 'lucide-react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { AppRoute } from '../../types';

interface ContactPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onBackToHome,
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Editorial & Episode Guide Feedback');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Contact Us | FEVIQO';
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill out your name, email address, and message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic,
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Could not submit your message. Please email partner@feviqo.com directly.');
      }
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to send right now. Please email partner@feviqo.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

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

        <div className="relative max-w-5xl mx-auto text-left space-y-5">
          <button
            onClick={() => onNavigatePage('home')}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-emerald-200 transition cursor-pointer mb-2 bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full border border-white/15 shadow-inner"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to FEVIQO Home</span>
          </button>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase tracking-widest">
              <Mail className="w-4 h-4 text-[#22C55E]" />
              <span>GET IN TOUCH</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
            Contact FEVIQO
          </h1>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl font-medium opacity-90">
            Reach our editorial desk, advertising partners team, copyright compliance desk, or video production studio directly.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Send Us a Message</h2>
              <p className="text-sm text-slate-500">
                Complete the form below and our team will reply to your email promptly.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Message Received!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for contacting FEVIQO. Our team has logged your inquiry and will respond within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-bold text-slate-800 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-bold text-slate-800 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-topic" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Inquiry Department
                  </label>
                  <select
                    id="contact-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Editorial & Episode Guide Feedback">Editorial &amp; Episode Guide Feedback</option>
                    <option value="DMCA / Copyright Inquiry">DMCA / Copyright Inquiry</option>
                    <option value="Privacy & Advertising Compliance">Privacy &amp; Advertising Compliance</option>
                    <option value="Video Editing Studio Services">Video Editing Studio Services</option>
                    <option value="General Support">General Support</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#22C55E] hover:bg-emerald-600 disabled:opacity-60 text-slate-950 font-black text-sm transition inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Contact Details & Policy Links */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
              <h3 className="text-lg font-black text-white">Direct Email Support</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Prefer to reach us directly via email? Write to our editorial, legal, and studio operations desk anytime:
              </p>
              <a
                href="mailto:partner@feviqo.com"
                className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-emerald-300 font-bold text-sm transition w-full"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>partner@feviqo.com</span>
              </a>
              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Response Time: Within 24 business hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Website: https://feviqo.com</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Compliance &amp; Policy Links</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                For copyright removal notices, privacy requests, or publisher disclosures, review our official legal documentation:
              </p>
              <div className="flex flex-col gap-2 pt-1 text-xs font-bold">
                <a
                  href="/privacy-policy"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigatePage('privacy');
                  }}
                  className="text-emerald-700 hover:underline"
                >
                  &rarr; Privacy Policy &amp; Advertising Disclosures
                </a>
                <a
                  href="/terms"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigatePage('terms');
                  }}
                  className="text-emerald-700 hover:underline"
                >
                  &rarr; Terms of Use
                </a>
                <a
                  href="/dmca"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigatePage('dmca');
                  }}
                  className="text-emerald-700 hover:underline"
                >
                  &rarr; DMCA &amp; Copyright Policy
                </a>
              </div>
            </div>
          </div>
        </div>
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

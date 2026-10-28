import React from 'react';
import { motion } from 'motion/react';
import { WordFadeUpHeadline } from '../WordFadeUpHeadline';
import { 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Globe2, 
  Zap, 
  Building2, 
  Mail, 
  Calendar,
  CheckCircle2,
  Briefcase,
  Star
} from 'lucide-react';

interface AboutUsPageProps {
  onBookCall: () => void;
  onNavigatePricing: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onBookCall, onNavigatePricing }) => {
  return (
    <div className="min-h-screen bg-white text-[#0B0B0D] font-sans antialiased selection:bg-[#22C55E] selection:text-slate-950 pt-10 sm:pt-16 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-6 text-emerald-900 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-emerald-800 uppercase">
              AGENCY &bull; EXECUTIVE LEADERSHIP
            </span>
          </div>

          <div className="mb-6">
            <WordFadeUpHeadline
              className="font-coolvetica text-4xl sm:text-6xl font-bold tracking-tight text-[#0B0B0D] leading-[1.06]"
              words={[
                { text: "About" },
                { text: "FEVIQO", className: "font-editorial-italic font-normal text-[#16a34a]" },
                { text: "&" },
                { text: "Executive", className: "font-editorial-italic font-normal text-[#16a34a]" },
                { text: "Leadership." },
              ]}
            />
          </div>

          <p className="font-neue text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            FEVIQO is a premier global video editing agency. We combine elite creative talent, AI-accelerated workflows, and dedicated project management to deliver high-converting performance ads, long-form media, and B2B content licensing.
          </p>
        </div>
      </section>

      {/* 2. EXECUTIVE VISION STATEMENT (HEADER-GREEN GRADIENT BOX) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden border border-[#064e3b]"
        >
          {/* Subtle green ambient glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#22C55E]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#22C55E] font-extrabold bg-[#22C55E]/15 px-4 py-1.5 rounded-full border border-[#22C55E]/30">
              <Sparkles className="w-3.5 h-3.5" /> Executive Leadership
            </div>

            <h2 className="font-coolvetica text-2xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
              "We built FEVIQO to remove the friction from world-class video production."
            </h2>

            <p className="font-neue text-emerald-100 leading-relaxed text-base font-normal max-w-3xl mx-auto">
              Engineered to solve the biggest headache in modern content creation: slow turnarounds, inconsistent freelancer quality, and bloated agency retainers.
            </p>

            <p className="font-neue text-emerald-200/80 leading-relaxed text-sm sm:text-base font-normal max-w-3xl mx-auto">
              Under executive leadership, FEVIQO has scaled into an industry-leading post-production partner for 100+ global brands, top 1% YouTube creators, and performance ad agencies across North America, Europe, Australia, and Asia.
            </p>

            {/* Key Performance Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 max-w-3xl mx-auto">
              <div className="bg-[#032415]/80 p-5 rounded-2xl border border-[#064e3b] text-center shadow-inner">
                <div className="font-coolvetica text-3xl font-bold text-[#22C55E]">500+</div>
                <div className="text-xs text-emerald-200/90 mt-1 font-semibold uppercase tracking-wider">Projects Delivered</div>
              </div>
              <div className="bg-[#032415]/80 p-5 rounded-2xl border border-[#064e3b] text-center shadow-inner">
                <div className="font-coolvetica text-3xl font-bold text-[#22C55E]">24-48h</div>
                <div className="text-xs text-emerald-200/90 mt-1 font-semibold uppercase tracking-wider">Guaranteed SLA</div>
              </div>
              <div className="bg-[#032415]/80 p-5 rounded-2xl border border-[#064e3b] text-center shadow-inner">
                <div className="font-coolvetica text-3xl font-bold text-[#22C55E]">99.4%</div>
                <div className="text-xs text-emerald-200/90 mt-1 font-semibold uppercase tracking-wider">Client Retention</div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onBookCall}
                className="px-7 py-3.5 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-sm shadow-xl shadow-[#22C55E]/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Executive Briefing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="mailto:partner@feviqo.com"
                className="px-7 py-3.5 rounded-xl bg-[#032415] hover:bg-[#064e3b] text-white font-semibold text-sm border border-[#064e3b] transition-all flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-[#22C55E]" />
                <span>partner@feviqo.com</span>
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. LEADERSHIP CARDS (CEO & FOUNDER) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-3 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-[#22C55E]" /> Executive Structure
          </div>
          <h2 className="font-coolvetica text-3xl sm:text-5xl font-bold text-[#0B0B0D] tracking-tight">
            Agency Leadership
          </h2>
          <p className="font-neue text-slate-600 text-base font-normal mt-2">
            The driving force behind FEVIQO’s post-production quality and global growth.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* CEO CARD - REX CARTER */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-[#22C55E]/50 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Centered Large Circular Profile Photo & Title Block */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-[#22C55E] bg-slate-950 p-1 mb-5 shadow-2xl shadow-[#22C55E]/30 relative group flex-shrink-0">
                  <img 
                    src="/images/CEO.webp" 
                    width={224}
                    height={224}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/feviqo1.webp';
                    }}
                    alt="Rex Carter - CEO of FEVIQO" 
                    className="w-full h-full object-cover rounded-full bg-slate-900 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-white/20 pointer-events-none" />
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-2 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-xs">
                  <Briefcase className="w-3.5 h-3.5 text-[#22C55E]" /> Chief Executive Officer (CEO)
                </div>
                <h3 className="font-coolvetica text-3xl sm:text-4xl font-bold text-[#0B0B0D]">Rex Carter</h3>
                <p className="font-neue text-xs sm:text-sm text-slate-500 font-medium mt-1">Executive Operations & Client Partnerships</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#0B0B0D] text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                    <span>Client Relations & Communication</span>
                  </div>
                  <p className="font-neue text-xs text-slate-600 pl-6 font-normal leading-relaxed">
                    The primary point of contact for all client onboarding, consultations, and day-to-day messaging — ensuring seamless and transparent communication.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#0B0B0D] text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                    <span>Operations & Project Management</span>
                  </div>
                  <p className="font-neue text-xs text-slate-600 pl-6 font-normal leading-relaxed">
                    Manages project deadlines, keeps workflows organized, and ensures that FEVIQO’s signature fast turnaround times are always met.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#0B0B0D] text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                    <span>Business Growth & Platform Compliance</span>
                  </div>
                  <p className="font-neue text-xs text-slate-600 pl-6 font-normal leading-relaxed">
                    Handles agency scaling, strategic partnerships, platform compliance, and enterprise relationship management.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 text-[#22C55E] font-bold"><Award className="w-4 h-4" /> Executive Operations Lead</span>
              <span>Fiverr Pro Application Candidate</span>
            </div>
          </motion.div>

          {/* FOUNDER & CREATIVE DIRECTOR CARD - AMER SHAHZAD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-[#22C55E]/50 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Centered Large Circular Profile Photo & Title Block */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-[#22C55E] bg-slate-950 p-1 mb-5 shadow-2xl shadow-[#22C55E]/30 relative group flex-shrink-0">
                  <img 
                    src="/images/FOUNDER.webp" 
                    width={224}
                    height={224}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/feviqo1.webp';
                    }}
                    alt="Amer Shahzad - Founder & Creative Director" 
                    className="w-full h-full object-cover rounded-full bg-slate-900 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-white/20 pointer-events-none" />
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-2 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Founder & Creative Director
                </div>
                <h3 className="font-coolvetica text-3xl sm:text-4xl font-bold text-[#0B0B0D]">Amer Shahzad</h3>
                <p className="font-neue text-xs sm:text-sm text-slate-500 font-medium mt-1">Creative Architecture & Post-Production Lead</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#0B0B0D] text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                    <span>Vision & Strategy</span>
                  </div>
                  <p className="font-neue text-xs text-slate-600 pl-6 font-normal leading-relaxed">
                    The architectural mind behind FEVIQO. Analyzes social media algorithmic trends to design the "hooks" and visual strategies that capture viewer attention within the first 3 seconds.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#0B0B0D] text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                    <span>Technical Mastery</span>
                  </div>
                  <p className="font-neue text-xs text-slate-600 pl-6 font-normal leading-relaxed">
                    Oversees the post-production pipeline, ensuring all video editing, motion graphics, sound design, and color grading meet premium industry standards.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#0B0B0D] text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                    <span>Quality Assurance</span>
                  </div>
                  <p className="font-neue text-xs text-slate-600 pl-6 font-normal leading-relaxed">
                    Every video asset delivered by FEVIQO must pass final creative approval to guarantee it drives high retention and engagement for clients.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 text-[#22C55E] font-bold"><ShieldCheck className="w-4 h-4" /> Agency Founder</span>
              <span>Creative Post-Production Lead</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 4. AGENCY CORE PILLARS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-coolvetica text-3xl sm:text-4xl font-bold text-[#0B0B0D] tracking-tight">
            Why Fiverr Pro & Enterprise Clients Choose FEVIQO
          </h2>
          <p className="font-neue text-slate-600 text-base font-normal mt-2">
            Engineered for quality, reliability, and enterprise compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-[#22C55E]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#22C55E] mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-coolvetica text-xl font-bold text-[#0B0B0D] mb-3">Senior Dedicated Editors</h3>
            <p className="font-neue text-slate-600 text-sm leading-relaxed font-normal">
              We don't outsource to random freelancers. Every client is assigned dedicated senior editors specializing in motion graphics, color grading, and sound engineering.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-[#22C55E]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#22C55E] mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-coolvetica text-xl font-bold text-[#0B0B0D] mb-3">Rapid 24-48h Delivery</h3>
            <p className="font-neue text-slate-600 text-sm leading-relaxed font-normal">
              Stay ahead of social algorithms and launch campaign schedules. Draft revisions are processed within 24 hours with strict quality assurance.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-[#22C55E]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#22C55E] mb-6 group-hover:scale-110 transition-transform">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="font-coolvetica text-xl font-bold text-[#0B0B0D] mb-3">Global Rights & Licensing</h3>
            <p className="font-neue text-slate-600 text-sm leading-relaxed font-normal">
              Full commercial rights on all music, stock footage, and audio stems. Verified B2B licensing for international television and streaming platforms.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CALL TO ACTION (HEADER-GREEN GRADIENT BOX) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl text-white border border-[#064e3b]">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="font-coolvetica text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Ready to Partner With FEVIQO?
            </h2>
            <p className="font-neue text-emerald-100 max-w-xl mx-auto mb-8 text-base font-normal leading-relaxed">
              Book a 1-on-1 strategy session directly with our executive team and lock in a dedicated video production workflow today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={onBookCall}
                className="px-8 py-4 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-slate-950 font-black text-base shadow-2xl shadow-[#22C55E]/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Book Strategy Session</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>
              <button
                onClick={onNavigatePricing}
                className="px-8 py-4 rounded-xl bg-[#032415] hover:bg-[#064e3b] text-white font-bold text-base transition-all cursor-pointer border border-[#064e3b]"
              >
                <span>View Plans & Pricing</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

import React from 'react';
import { Star, MessageSquare, Check, Sparkles, Zap } from 'lucide-react';

/**
 * PricingShowcaseCollage:
 * Matches the layout and composition from Screenshot 2026-09-09 at 5.33.31 AM.png
 * Features an organic 8-card bento layout showcasing video production results across genres:
 * - Chiropractor holding spine model (medical / professional)
 * - Runner in blue sneakers jumping with "JOIN NOW" text (fitness / DTC)
 * - Construction worker with tablet & neon "• Faster • More efficient" pills (industrial / B2B)
 * - Creator with holographic HUD circles (tech / futuristic)
 * - Chat bubbles UI ("Fast, easy", "Super quick booking")
 * - Cyberpunk neon duo (music / viral culture)
 * - Trustpilot 5-star reviews card
 * - Farmer / brewer holding beer bottle (commercial / UGC)
 */
export const PricingShowcaseCollage: React.FC = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      {/* Subtle soft backdrop light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-100/40 blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Grid Container */}
      <div className="grid grid-cols-12 gap-3 sm:gap-3.5 p-1 items-start">

        {/* 
          CARD 1 (Left Tall Card): Chiropractor / Medical
          Spans col 1-4, rows 1-2
        */}
        <div className="col-span-4 row-span-2 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200/80 aspect-[9/16] group">
          <img
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=85"
            alt="Medical & Healthcare Video Editing"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
          
          {/* Anatomical Spine / Pro Doctor Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-900 shadow">
            Medical / Pro
          </div>
          <div className="absolute bottom-3 inset-x-3 text-white text-xs font-bold leading-tight drop-shadow">
            Dr. Aris • Spine Health Education
          </div>
        </div>

        {/* 
          CARD 2 (Top Middle): Fitness "JOIN NOW"
          Spans col 5-8
        */}
        <div className="col-span-4 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200/80 aspect-square group">
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=85"
            alt="Fitness DTC Ad"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Orange "JOIN NOW" Callout Matching Screenshot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-black text-[#FF5722] tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-pulse">
              JOIN NOW
            </span>
          </div>

          <div className="absolute bottom-2.5 left-3 text-[10px] font-bold text-white/90">
            DTC Fitness Sprint
          </div>
        </div>

        {/* 
          CARD 3 (Top Right): Construction / B2B Tablet
          Spans col 9-12
        */}
        <div className="col-span-4 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200/80 aspect-square group">
          <img
            src="https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=85"
            alt="Industrial & B2B Promo"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="eager"
          />
          <div className="absolute inset-0 bg-slate-950/30" />

          {/* Glowing neon pill tags matching screenshot: • Faster • More efficient */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex flex-wrap gap-1.5 justify-center">
            <span className="px-2 py-0.5 rounded-full bg-blue-600/85 backdrop-blur-md text-white text-[9px] font-extrabold shadow">
              • Faster
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-600/85 backdrop-blur-md text-white text-[9px] font-extrabold shadow">
              • More efficient
            </span>
          </div>
        </div>

        {/* 
          CARD 4 (Center Wide): Creator with Holographic Circular HUD
          Spans col 5-10
        */}
        <div className="col-span-6 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 shadow-xl border border-slate-200/80 aspect-[16/10] group">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85"
            alt="Futuristic Motion Graphics"
            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          {/* Futuristic HUD circles overlay matching screenshot */}
          <div className="absolute inset-y-0 left-2 sm:left-4 flex items-center">
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-white/20 flex items-center justify-center">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-emerald-400/40 animate-spin" style={{ animationDuration: '12s' }} />
              <div className="absolute w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-emerald-400 opacity-70 blur-sm" />
              <div className="absolute -top-1 right-2 text-[8px] sm:text-[9px] font-mono text-white/90 bg-black/60 px-1.5 py-0.5 rounded border border-white/20">
                Lvl 5
              </div>
              <div className="absolute -bottom-1 left-1 text-[8px] font-mono text-emerald-300 bg-black/60 px-1 rounded">
                Transformed
              </div>
            </div>
          </div>

          <div className="absolute bottom-2.5 right-3 text-right">
            <div className="text-[10px] font-bold text-white">Motion VFX Track</div>
            <div className="text-[9px] text-emerald-400 font-medium">Rendered 4K ProRes</div>
          </div>
        </div>

        {/* 
          CARD 5 (Middle Right Tall): Chat Messaging Stack UI
          Spans col 11-12 (on desktop 2 cols, matching the clean tall chat card)
        */}
        <div className="col-span-2 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-emerald-50/90 to-teal-50/90 p-2 sm:p-2.5 shadow-xl border border-emerald-200/80 flex flex-col justify-between aspect-[1/2]">
          <div className="space-y-1.5">
            <div className="p-1.5 rounded-xl bg-emerald-500 text-white text-[8px] sm:text-[9px] font-bold shadow leading-tight">
              Fast, easy
            </div>
            <div className="p-1.5 rounded-xl bg-white text-slate-800 text-[8px] font-medium shadow-sm leading-tight border border-slate-100">
              Best experience!
            </div>
            <div className="p-1.5 rounded-xl bg-emerald-600 text-white text-[8px] font-bold shadow leading-tight">
              Super quick booking
            </div>
          </div>

          <div className="flex items-center justify-center pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>

        {/* 
          CARD 6 (Bottom Left): Cyberpunk Visor Duo
          Spans col 1-4
        */}
        <div className="col-span-4 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200/80 aspect-square group">
          <img
            src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=85"
            alt="Cinematic & Music Video"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3 text-white">
            <div className="text-[10px] font-black tracking-tight">Cyberpunk Visuals</div>
            <div className="text-[9px] text-purple-300">Neon Smoke & SFX</div>
          </div>
        </div>

        {/* 
          CARD 7 (Bottom Center): Trustpilot 5-Star Reviews Card
          Spans col 5-8
        */}
        <div className="col-span-4 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-teal-50 to-emerald-50/70 p-3 sm:p-4 shadow-xl border border-emerald-200/80 flex flex-col justify-between aspect-square">
          <div>
            <div className="text-center font-black text-slate-900 text-xs sm:text-sm tracking-tight mb-1">
              Excellent
            </div>
            <div className="flex items-center justify-center gap-0.5 text-emerald-600 mb-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-3.5 h-3.5 bg-emerald-500 text-white rounded-[2px] flex items-center justify-center text-[8px] font-black">
                  ★
                </div>
              ))}
            </div>
            <div className="text-[9px] text-slate-500 text-center font-medium">
              Based on <span className="font-bold text-slate-800">300+ reviews</span>
            </div>
            <div className="text-center text-[10px] font-bold text-emerald-800 mt-0.5 flex items-center justify-center gap-1">
              <span>★ Trustpilot</span>
            </div>
          </div>

          {/* Testimonial snippet matching screenshot */}
          <div className="p-2 rounded-xl bg-slate-900 text-white text-[9px] shadow-sm leading-tight">
            <span className="text-emerald-400 font-bold">"Made us $90k in 1 month</span> with high retention video ads."
          </div>
        </div>

        {/* 
          CARD 8 (Bottom Right): Brewer Holding Beer Bottle
          Spans col 9-12
        */}
        <div className="col-span-4 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200/80 aspect-square group">
          <img
            src="https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=85"
            alt="UGC Commercial Editing"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3 text-white">
            <div className="text-[10px] font-black">Farm Craft Beer</div>
            <div className="text-[9px] text-amber-300">Product UGC Spotlight</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export { PricingShowcaseCollage as PremiumShowcaseCollage };


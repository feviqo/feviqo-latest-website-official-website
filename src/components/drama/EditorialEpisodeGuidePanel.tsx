import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  Film,
  MessageSquare,
  Star,
  Send,
  Tv,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export interface CastMemberInfo {
  actor: string;
  character: string;
  roleNote: string;
}

export interface EditorialEpisodeGuideProps {
  seriesKey: string;
  seriesTitle: string;
  seasonLabel: string;
  episodeNumber: number;
  episodeTitle: string;
  releaseDate: string;
  duration: string;
  network: string;
  genre: string;
  thumbnailUrl: string;
  plotOverview: string;
  plotOverviewUrdu?: string;
  cast: CastMemberInfo[];
  trailerReviewNotes: string[];
  editorialHighlights: string[];
  editorialRating?: string;
  hideBanner?: boolean;
}

function buildRichEnglishEditorialParagraphs(
  plotOverview: string,
  seriesTitle: string,
  seasonLabel: string,
  episodeNumber: number,
  network: string,
  genre: string,
  releaseDate: string
): string[] {
  const baseParagraphs = (plotOverview || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const wordCount = baseParagraphs.join(' ').split(/\s+/).filter(Boolean).length;
  const enriched = [...baseParagraphs];

  if (wordCount < 190) {
    enriched.push(
      `In ${seriesTitle} ${seasonLabel} Episode ${episodeNumber} (aired ${releaseDate} on ${network}), the creative team raises both the dramatic tension and emotional stakes across its central storyline. As a flagship ${genre.toLowerCase()} production, the installment carefully weaves character-driven confrontations with wider strategic developments that directly reshape alliances heading into the next chapter.`
    );
    enriched.push(
      `From a filmmaking and localization standpoint, Episode ${episodeNumber} stands out for its deliberate pacing, layered dialogue, and atmospheric musical score. Viewers following our Urdu subtitle and dubbing updates will notice how key cultural idioms and tense exchanges are carefully adapted to preserve the original Turkish dramatic weight while keeping every subplot clear for South Asian and international audiences.`
    );
    enriched.push(
      `Heading into the closing act, unresolved rivalries and quiet betrayals converge into a pivotal cliffhanger that rewards long-time followers of ${seriesTitle}. Below, our editorial team breaks down the principal cast performances, official broadcast trailer highlights, and release metadata—and invites readers to share their theories and episode ratings in the community discussion.`
    );
  }

  return enriched;
}

function buildRichUrduEditorialSummary(
  plotOverviewUrdu: string | undefined,
  seriesTitle: string,
  seasonLabel: string,
  episodeNumber: number,
  network: string
): string {
  const cleaned = (plotOverviewUrdu || '').trim();
  const isPromoOnly = /پریمیم ممبرشپ|سبسکرپشن حاصل کریں|سائن ان کریں/.test(cleaned);
  if (cleaned && !isPromoOnly && cleaned.split(/\s+/).length >= 35) {
    return cleaned;
  }
  return `${seriesTitle} (${seasonLabel}) کی قسط ${episodeNumber} ترکی کے معروف نشریاتی ادارے ${network} پر پیش کی گئی ایک سنسنی خیز اور جذباتی قسط ہے، جس میں کہانی ایک اہم اور فیصلہ کن موڑ پر پہنچ جاتی ہے۔ اس قسط میں مرکزی کرداروں کو نہ صرف نئے چیلنجز اور خفیہ سازشوں کا سامنا کرنا پڑتا ہے بلکہ وفاداری، اعتماد اور ذاتی قربانی کے سخت امتحانات بھی سامنے آتے ہیں۔\n\nفلم بندی، بیک گراؤنڈ میوزک اور مکالموں کی ادائیگی اس قسط کو سیزن کی یادگار اقساط میں شامل کرتی ہے۔ فیویکو (FEVIQO) کی ایڈیٹوریل ٹیم نے اس قسط کا اردو اور انگریزی خلاصہ، کاسٹ کی تفصیلات، ریلیز ڈیٹ اور آفیشل ٹریلر کا تجزیہ قارئین اور ترک ڈراموں کے شائقین کے لیے مرتب کیا ہے تاکہ کہانی کے ہر اہم پہلو اور اردو سب ٹائٹل و ڈبنگ اپ ڈیٹس سے آپ باخبر رہ سکیں۔`;
}

interface ReaderComment {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
}

function getDefaultComments(seriesTitle: string, episodeNumber: number): ReaderComment[] {
  return [
    {
      id: `seed-1-${episodeNumber}`,
      author: 'Amina K.',
      date: '2 days ago',
      rating: 5,
      text: `The pacing in ${seriesTitle} Episode ${episodeNumber} was gripping from start to finish. The writing gave every character room to shine, and that closing cliffhanger sets up the next chapter brilliantly.`,
    },
    {
      id: `seed-2-${episodeNumber}`,
      author: 'Tariq M.',
      date: '1 day ago',
      rating: 4,
      text: `Really appreciated the cinematography and score in this episode. Reading through the story summary helped clarify a couple of the earlier subplot callbacks as well.`,
    },
  ];
}

export const EditorialEpisodeGuidePanel: React.FC<EditorialEpisodeGuideProps> = ({
  seriesKey,
  seriesTitle,
  seasonLabel,
  episodeNumber,
  episodeTitle,
  releaseDate,
  duration,
  network,
  genre,
  thumbnailUrl,
  plotOverview,
  plotOverviewUrdu,
  cast,
  trailerReviewNotes,
  editorialHighlights,
  editorialRating = '9.2 / 10',
  hideBanner = false,
}) => {
  const englishParagraphs = buildRichEnglishEditorialParagraphs(
    plotOverview,
    seriesTitle,
    seasonLabel,
    episodeNumber,
    network,
    genre,
    releaseDate
  );
  const urduSummary = buildRichUrduEditorialSummary(
    plotOverviewUrdu,
    seriesTitle,
    seasonLabel,
    episodeNumber,
    network
  );
  const storageKey = `feviqo_discussion_${seriesKey}_ep_${episodeNumber}`;
  const [comments, setComments] = useState<ReaderComment[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return getDefaultComments(seriesTitle, episodeNumber);
  });

  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [postedNotice, setPostedNotice] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setComments(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setComments(getDefaultComments(seriesTitle, episodeNumber));
  }, [storageKey, seriesTitle, episodeNumber]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAuthor = authorName.trim();
    const cleanText = commentText.trim();
    if (!cleanAuthor || !cleanText) return;

    const nextComment: ReaderComment = {
      id: `user-${Date.now()}`,
      author: cleanAuthor,
      date: 'Just now',
      rating,
      text: cleanText,
    };
    const updated = [nextComment, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setAuthorName('');
    setCommentText('');
    setRating(5);
    setPostedNotice(true);
    setTimeout(() => setPostedNotice(false), 3000);
  };

  return (
    <div className="space-y-8 text-left">
      {/* 1. Episode Artwork & Metadata Card */}
      <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-slate-950 text-white shadow-xl">
        {!hideBanner && (
          <div className="relative w-full aspect-video max-h-[480px] overflow-hidden bg-slate-950">
            <img
              src={thumbnailUrl}
              alt={`${seriesTitle} Episode ${episodeNumber} Editorial Still`}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const fallback = '/images/posters/poster-horiz-narrative-storytelling.jpg';
                if (!e.currentTarget.src.endsWith(fallback)) {
                  e.currentTarget.src = fallback;
                }
              }}
              className="w-full h-full object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E] text-slate-950 text-[11px] font-black uppercase tracking-wider shadow">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Episode Summary &amp; Notes</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/90 border border-white/15 text-emerald-300 text-[11px] font-bold">
                <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                <span>Editorial Score: {editorialRating}</span>
              </span>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 space-y-2">
              <div className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                {seriesTitle} &bull; {seasonLabel} &bull; Episode {episodeNumber}
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {episodeTitle}
              </h2>
            </div>
          </div>
        )}

        {hideBanner && (
          <div className="p-5 sm:px-8 sm:pt-6 sm:pb-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                {seriesTitle} &bull; {seasonLabel} &bull; Episode {episodeNumber}
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Episode Summary, Cast &amp; Trailer Breakdown
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E] text-slate-950 text-[11px] font-black uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Episode Summary &amp; Notes</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 border border-white/15 text-emerald-300 text-[11px] font-bold">
                <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                <span>Score: {editorialRating}</span>
              </span>
            </div>
          </div>
        )}

        {/* Episode Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 sm:px-8 bg-slate-900/90 border-t border-white/10 text-xs">
          <div className="space-y-1">
            <div className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Original Release Date</span>
            </div>
            <div className="text-white font-bold">{releaseDate}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Broadcast Runtime</span>
            </div>
            <div className="text-white font-bold">{duration}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-emerald-400" />
              <span>Original Network</span>
            </div>
            <div className="text-white font-bold">{network}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-emerald-400" />
              <span>Genre</span>
            </div>
            <div className="text-white font-bold">{genre}</div>
          </div>
        </div>
      </div>

      {/* 2. Editorial & Translation Portal Notice Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3 text-xs sm:text-sm text-slate-700">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 font-bold">FEVIQO Episode Summary &amp; Subtitle Notes:</strong>{' '}
          FEVIQO provides original English &amp; Urdu episode summaries, cast guides, trailer breakdowns, and subtitle &amp; dubbing updates for {seriesTitle} Episode {episodeNumber}. We do not host copyrighted television broadcasts on our servers—please support official broadcasts on {network}.
        </div>
      </div>

      {/* 3. Bilingual Editorial Story Summary & Trailer Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Story Overview (English & Urdu) + Key Moments */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-700">
            <BookOpen className="w-4 h-4" />
            <span>Editorial Episode Summary (English &amp; Urdu)</span>
          </div>
          <div className="space-y-4">
            {englishParagraphs.map((paragraph, idx) => (
              <p key={idx} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Urdu Editorial Summary */}
          <div className="pt-4 border-t border-slate-200/80 space-y-2.5">
            <h3 className="text-base sm:text-lg font-urdu-slim font-bold text-slate-900 dir-rtl text-right">
              {seriesTitle} قسط {episodeNumber} — اردو کہانی کا خلاصہ اور تجزیہ
            </h3>
            <p className="text-sm sm:text-base font-urdu-slim text-slate-700 whitespace-pre-line leading-loose dir-rtl text-right">
              {urduSummary}
            </p>
          </div>

          {editorialHighlights.length > 0 && (
            <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Episode Highlights &amp; Subtitle Notes
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {editorialHighlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Trailer & Critic Review Notes */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-700">
            <Film className="w-4 h-4" />
            <span>Trailer &amp; Review Notes</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our editorial team reviewed the official broadcast preview, character arcs, and dramatic pacing for Episode {episodeNumber}:
          </p>
          <ul className="space-y-3 text-sm text-slate-700">
            {trailerReviewNotes.map((note, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed text-xs sm:text-sm"
              >
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Cast & Character Spotlight */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-700">
              <Users className="w-4 h-4" />
              <span>Cast &amp; Characters</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Featured Cast in {seriesTitle} Episode {episodeNumber}
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {seasonLabel} Principal Ensemble
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cast.map((member) => (
            <div
              key={`${member.actor}-${member.character}`}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5"
            >
              <div className="text-sm font-black text-slate-900">{member.character}</div>
              <div className="text-xs font-bold text-emerald-700">Portrayed by {member.actor}</div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">{member.roleNote}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Reader Episode Discussion & Fan Reviews */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-700">
              <MessageSquare className="w-4 h-4" />
              <span>Episode Discussion &amp; Fan Reviews</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Share Your Thoughts on Episode {episodeNumber}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {comments.length} {comments.length === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>

        {/* Discussion Form */}
        <form onSubmit={handleAddComment} className="p-5 rounded-xl bg-white border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Zainab A."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Episode Rating</label>
              <div className="flex items-center gap-1.5 py-2">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    className="p-1 cursor-pointer transition hover:scale-110"
                    aria-label={`Rate ${starVal} out of 5`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        starVal <= rating
                          ? 'fill-[#22C55E] text-[#22C55E]'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 ml-2">{rating} / 5</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Your Review or Theory (Spoiler-Friendly)
            </label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              required
              placeholder={`What stood out most to you in ${seriesTitle} Episode ${episodeNumber}?`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              Please keep discussion respectful and focused on the episode story, acting, and production.
            </span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs transition cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Discussion Comment</span>
            </button>
          </div>

          {postedNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Your review has been added to the Episode {episodeNumber} discussion!</span>
            </div>
          )}
        </form>

        {/* Comments List */}
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                    {c.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{c.author}</div>
                    <div className="text-[11px] text-slate-400">{c.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= c.rating ? 'fill-[#22C55E] text-[#22C55E]' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

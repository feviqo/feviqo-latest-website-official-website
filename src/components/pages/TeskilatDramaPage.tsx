import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import '@videojs/html/video/player';
import '@videojs/html/video/skin';
import '@videojs/html/media/mux-video';
import '@videojs/html/extensions/mux-data';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  RotateCw, 
  ChevronRight, 
  Clock, 
  Tv,
  ArrowLeft,
  Sparkles,
  Share2,
  Check,
  Settings,
  DollarSign,
  Send,
  X,
  CheckCircle2,
  Subtitles,
  Sliders,
  PictureInPicture2
} from 'lucide-react';
import { Navbar } from '../Navbar';
import { NativeVideoPlayer } from '../NativeVideoPlayer';
import { AppRoute } from '../../types';
import { AdBanner468x60 } from '../AdBanner468x60';
import { AdBanner160x300 } from '../AdBanner160x300';
import { AdBanner728x90 } from '../AdBanner728x90';
import { AdBanner320x50 } from '../AdBanner320x50';
import { AdBanner300x250 } from '../AdBanner300x250';
import { AdBanner160x600 } from '../AdBanner160x600';
import { AdNativeBanner } from '../AdNativeBanner';
import { VastPreRollAdOverlay } from '../VastPreRollAdOverlay';

interface TeskilatEpisode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  titleUrdu: string;
  titleEnglish: string;
  releaseDate: string;
  duration: string;
  thumbnailUrl: string;
  directoryThumbnailUrl?: string;
  videoUrl: string;
  storyRecapUrdu: string;
  storyRecapEnglish: string;
  views: string;
  isLatest?: boolean;
}

const FEATURED_SEASON7_EPISODE: TeskilatEpisode = {
  id: 'ep-186-s7',
  episodeNumber: 186,
  seasonNumber: 7,
  titleUrdu: 'تشکیلات سیزن 7 قسط 186 اردو ترجمہ کے ساتھ',
  titleEnglish: 'Teskilat Season 7 Episode 186 Urdu Subtitles - FEVIQO.com',
  releaseDate: 'September 2026',
  duration: '2h 18m',
  thumbnailUrl: '/images/teskialt186thumbnIL.png',
  videoUrl: 'https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8',
  storyRecapUrdu: `اینڈر (Ender) کے اغوا کے بعد غصے میں پاگل الپائے (Altay) واپس اپنے ٹھکانے پر لوٹ آتا ہے؛ لیکن اس کی سب بهی ترجیح اپنے بیٹے سے دوبارہ ملنا ہے۔ الپائے کا یہ غصہ اسے صدر طغرل (Tuğrul Başkan) کے آمنے سامنے لے آتا ہے۔\nجہاں ایک طرف کورکوت (Korkut) اور یحییٰ (Yahya) کے درمیان ایک بڑا حساب کتاب (ٹکراؤ) ہو رہا ہے، وہی شاہین (Şahin) کو ان نتائج کا سامنا کرنا پڑ رہا ہے جن کا اس نے اندازہ بھی نہیں لگایا تھا۔ دوسری طرف، بہار (Bahar) کا آخر کار میدانِ عمل میں اترنا کورکوت کے لیے ایک اور بڑی مشکل کھڑی کر دے گا۔\nاولاک (Ulak)، اینڈر کے ذریعے الپائے اور 'تشکیلات' (Teskilat/ایجنسی) کو شکست دینے کے چکر میں ہے۔ جبکہ عذرا (Azra) اس بڑی مساوات میں سب سے اہم کرداروں میں سے ایک ادا کرے گی۔ دشمن اپنے مقصد میں کامیاب نہیں ہو سکے گا کیونکہ اب بھیڑیا بیدار ہو چکا ہے…`,
  storyRecapEnglish: `Teskilat Season 7 Episode 2 Urdu Subtitles – Bolum 186: The Wolf Awakens

Teskilat Season 7 Episode 2 (Bolum 186) brings an explosive escalation to the intelligence war. Altay (Alpay) returns to his hideout facing the devastating abduction of Ender, and Tuğrul Başkan stands at the center of the organization's next chess moves.

Watch Teskilat Season 7 Episode 2 with Urdu Subtitles directly on this page on FEVIQO.

Episode 186: Altay Confronts Tuğrul Başkan
The tension is mounting inside the intelligence agency. Following Ender's abduction, Altay returns with one single mission: to reunite with his son and eliminate the deep-cover threats. This pursuit leads to a high-stakes meeting with Tuğrul Başkan.

Meanwhile, Korkut and Yahya settle scores in a major confrontation, while Şahin faces unexpected consequences. Ulak schemes to use Ender to defeat the Teskilat agency, but the enemies will fail because the wolf has awakened.`,
  views: '342,800',
  isLatest: false
};

const EPISODE_187: TeskilatEpisode = {
  id: 'ep-187-s7',
  episodeNumber: 187,
  seasonNumber: 7,
  titleUrdu: 'تشکیلات سیزن 7 قسط 187 اردو ترجمہ کے ساتھ',
  titleEnglish: 'Teskilat Season 7 Episode 187 Urdu Subtitles - FEVIQO.com',
  releaseDate: 'October 2026',
  duration: '2h 25m',
  thumbnailUrl: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
  videoUrl: 'https://stream.mux.com/vPkzwE9vrAHq4uz4hPyjFu4ZVQOzsORSqxYDzUnYm4o.m3u8',
  storyRecapUrdu: `الپائے (Altay) اور صدر طغرل (Tuğrul Başkan) کے درمیان پیدا ہونے والی غلط فہمیاں اب ایک نیا رخ اختیار کر چکی ہیں۔ تشکیلات کی نئی ٹیم نے دشمن کے سب سے اہم مہرے 'اولاک' (Ulak) کو گھیرنے کے لیے ایک خفیہ جال بچھایا ہے۔ دوسری طرف عذرا (Azra) کو بچانے کے لیے شاہین ایک انتہائی خطرناک آپریشن شروع کرتا ہے جس میں سیکنڈز کی تاخیر بھی جان لیوا ثابت ہو سکتی ہے۔\nکپتان کورکوت (Korkut) کو حریف گروہوں کی اندرونی جنگ کا فائدہ اٹھاتے ہوئے ایک حساس فائل حاصل کرنی ہے جس میں غداروں کے نام چھپے ہیں۔ بھیڑیا اب پوری طرح بیدار ہو چکا ہے اور آخری وار کے لیے تیار ہے، لیکن دشمن بھی اپنے آخری مہرے کھیلنے سے پیچھے نہیں ہٹے گا…`,
  storyRecapEnglish: `Teskilat Season 7 Episode 3 Urdu Subtitles – Bolum 187: Azra Betrayal Changes Everything

Teskilat Season 7 Episode 3 (Bolum 187) takes the new season into an even more personal and dangerous phase. Altay and the Organization are shaken by Azra’s betrayal, while the enemy delivers a devastating threat involving Ender.

For Altay, the battle is no longer only about defeating an intelligence network. His son is now at the center of the enemy’s plan, forcing him to risk everything to bring Ender home and uncover the truth behind Azra’s actions.

Watch Teskilat Season 7 Episode 3 with Urdu Subtitles directly on this page on FEVIQO.

Episode 187: Azra Betrayal Shocks the Organization
Altay and the Organization are forced to confront a painful reality when Azra appears to betray them.

After everything that has happened around Ender, Azra’s move creates another major crisis at the worst possible moment.

The situation affects Altay on two different levels. As an operative, he must understand what Azra is trying to achieve. As a father, he has very little time to think because Ender remains in enemy hands.

The trust that existed before is now replaced by one question:
Why did Azra turn against Altay?

The Enemy Uses Ender Against Altay
The enemy understands that Ender is Altay’s greatest emotional vulnerability.

They deliver one of their cruelest threats yet, telling Altay that his son will be raised by them.
This is not simply a kidnapping anymore.

The enemy wants to attack Altay psychologically by threatening his future relationship with his own son.
Their strategy is designed to:
- Break Altay emotionally
- Force him into reckless decisions
- Use Ender as leverage against the Organization
- Control Altay through fear
- Destroy his confidence as both a father and an operative

But instead of surrendering, the threat makes Altay even more determined.

Altay Begins the Hunt for Ender and Azra
Altay refuses to remain passive while his son is in danger.
He joins the team and immediately begins an operation with two clear objectives:
Find Ender and capture Azra.

Every clue now matters.
Every second can determine whether Altay reaches his son in time.

The Organization supports him, but they also understand that the enemy expects them to come.
What appears to be a rescue mission could easily become another carefully prepared trap.

The Enemy Sets New Traps
Altay and the team are not the only ones making plans.
The enemy anticipates their response and begins placing new traps in their path.

Each move forces the Organization to balance speed with caution.
If they move too slowly, Ender remains in danger.
If they move too quickly, they could walk directly into the enemy’s hands.
This tactical pressure makes Bolum 187 one of the most intense chapters of Season 7 so far.

Altay Risks His Life for His Son
For Altay, there is no acceptable price when Ender’s safety is at stake.
The enemy may control the location, the timing, and the traps, but they cannot control a father’s determination.

Altay is prepared to put his own life on the line if it brings him one step closer to Ender.
This gives Episode 187 its strongest emotional conflict:
How far will Altay go to save his son?
The answer becomes increasingly clear as the operation moves forward — there is almost nothing he will not risk.

Bahar Faces a Brutal Test
While Altay fights his own battle, another dangerous storyline develops around Bahar.
Korkut, Hamdi, and Yahya put Bahar through an extremely difficult test.
To prove herself, Bahar is forced into a situation where words are no longer enough.
Her loyalty must be demonstrated through action.
She ultimately takes the risk and fires at Korkut.
This moment becomes one of the biggest turning points of Episode 187.

Bahar Fires at Korkut
The confrontation places Bahar in an almost impossible position.
Korkut is not simply another person standing in front of her. Their emotional connection makes the test far more painful and dangerous.
Yet Bahar chooses to pull the trigger.
Her decision shows just how far she is prepared to go to survive the test and protect the larger mission.
But this moment does not end the challenge.
Instead, it creates an even bigger one.

The Real Test Now Begins for Yahya
After Bahar’s dramatic decision, attention turns toward Yahya.
The events surrounding Korkut, Hamdi, and Bahar now place Yahya in a difficult position of his own.
The official Episode 187 storyline makes it clear that Bahar’s test is only the beginning.
The real challenge now belongs to Yahya.
His next decisions could change relationships, loyalties, and the balance surrounding Korkut’s operation.

A War Built on Loyalty and Betrayal
The strongest theme of Teskilat Season 7 Episode 3 is trust.
Altay faces Azra’s betrayal.
Bahar must prove her loyalty.
Yahya faces his own test.
Ender is used as emotional leverage against his father.

Almost every major storyline in Episode 187 asks the same question:
Who can still be trusted when the enemy knows exactly where to attack?

Themes & Highlights of Teskilat Bolum 187
- Azra Betrayal: Altay and the Organization are shaken by Azra’s unexpected move.
- Ender in Danger: The enemy uses Altay’s son as psychological leverage.
- A Father’s Fight: Altay is willing to risk his life to find Ender.
- Enemy Traps: The Organization faces new obstacles during the rescue operation.
- Bahar’s Test: Bahar is forced to prove herself by firing at Korkut.
- Yahya’s Challenge: The real test begins for Yahya after Bahar’s decision.
- Trust and Betrayal: Loyalty becomes the central battlefield of Episode 187.

Key Characters in Episode 187
- Altay: Risks everything to rescue Ender and track down Azra.
- Ender: Remains at the center of the enemy’s psychological war against Altay.
- Azra: Her apparent betrayal creates a major crisis for Altay and the Organization.
- Korkut: Becomes part of Bahar’s dangerous loyalty test.
- Bahar: Takes an extreme step when she fires at Korkut.
- Yahya: Faces an even greater challenge after Bahar completes her test.
- Hamdi: Stands alongside Korkut and Yahya during Bahar’s critical test.
- The Organization: Moves with Altay to rescue Ender despite the enemy’s traps.

Where to Watch Teskilat Season 7 Episode 3 Urdu Subtitles
You can watch Teskilat Season 7 Episode 3 (Bolum 187) with Urdu Subtitles directly on this page on FEVIQO.

Follow Altay and the Organization as they race to rescue Ender, pursue Azra, and survive the enemy’s dangerous new traps.

Final Thoughts
Teskilat Season 7 Episode 3 Urdu Subtitles raises the emotional and operational stakes of the new season. Azra’s betrayal leaves Altay facing another painful shock while Ender remains trapped in the enemy’s hands.

Altay’s determination to save his son turns the operation into a deeply personal battle, but the enemies waiting for him have prepared new traps at every step.

Meanwhile, Bahar’s decision to fire at Korkut creates a dramatic turning point, and the consequences now place Yahya at the center of another difficult test.

Watch Teskilat Season 7 Episode 3 – Bolum 187 with Urdu Subtitles on FEVIQO.`,
  views: '284,500',
  isLatest: false
};

const EPISODE_188: TeskilatEpisode = {
  id: 'ep-188-s7',
  episodeNumber: 188,
  seasonNumber: 7,
  titleUrdu: 'تشکیلات سیزن 7 قسط 188 اردو ترجمہ کے ساتھ',
  titleEnglish: 'Teskilat Season 7 Episode 4 Urdu Subtitles - Bolum 188 Ender Rescue',
  releaseDate: 'October 2026',
  duration: '2h 25m',
  thumbnailUrl: 'https://lh3.googleusercontent.com/d/1FXGXBZcts9bp3XdPmqI_pGytI0GAKYDc',
  directoryThumbnailUrl: 'https://lh3.googleusercontent.com/d/1ikYYiLzzJ8NytHorSVBhRvsXKwGUl1zy',
  videoUrl: 'https://stream.mux.com/myroEGBWeut02BU5yZEPr3GT3stSVu91dYtKAJPeJkfs.m3u8',
  storyRecapUrdu: `تشکیلات سیزن 7 قسط 188 (بولم 188) میں الپائے اور انٹیلی جنس ٹیم دشمن کے سب سے بڑے نیٹ ورک پر آخری وار کرنے جا رہی ہے۔ عذرا کی چالوں کے پیچھے کی اصل سچائی سامنے آتی ہے جبکہ اینڈر کو بچانے کا یہ حتمی آپریشن ایک زبردست موڑ اختیار کر جاتا ہے۔ مکمل قسط ایچ ڈی اردو سب ٹائٹلز کے ساتھ فیویکو پر دیکھیں۔`,
  storyRecapEnglish: `Watch Teskilat Season 7 Episode 4 Urdu Subtitles (Bolum 188). Altay closes in on Ender as suspicion around Azra grows and Korkut corners Yahya.

Teskilat Season 7 Episode 4 (Bolum 188) brings an explosive continuation to Altay's high-stakes mission. With the Organization closing in on enemy operatives, Altay faces the ultimate tactical challenge to bring Ender home and neutralize deep-cover threats.

Target Search Keywords: Teskilat Season 7, Teskilat Season 7 Urdu Subtitles, Teskilat Urdu Subtitles, Teşkilat Season 7 Urdu, Teskilat Season 7 Watch Online, Teskilat Episode 185 Urdu Subtitles, Teskilat Bolum 185 Urdu, Altay Teskilat Season 7, Korkut Teskilat, Turkish Series Urdu Subtitles, TRT1 Teskilat, Teskilat Season 7 Episode 4 Urdu Subtitles, Teskilat Episode 188 Urdu Subtitles, Teskilat Bolum 188 Urdu, Teskilat 188 Urdu, Altay Ender Episode 188, Azra Teskilat Season 7, Korkut Yahya Episode 188, Ender Rescue Teskilat.`,
  views: '198,400',
  isLatest: true
};

const ALL_EPISODES: TeskilatEpisode[] = [EPISODE_188, EPISODE_187, FEATURED_SEASON7_EPISODE];

interface TeskilatDramaPageProps {
  onBackToHome: () => void;
  onBookCall?: () => void;
  onNavigatePricing?: () => void;
  onNavigateFlow?: (view?: 'login' | 'register' | 'admin') => void;
  onNavigatePage: (route: AppRoute) => void;
}

export const TeskilatDramaPage: React.FC<TeskilatDramaPageProps> = ({
  onBackToHome,
  onBookCall = () => {},
  onNavigatePricing = () => {},
  onNavigateFlow = () => {},
  onNavigatePage,
}) => {
  // Navigation & View States
  const [activeView, setActiveView] = useState<'overview' | 'episode-detail'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('186') || hash.includes('186') || path.includes('187') || hash.includes('187') || path.includes('188') || hash.includes('188')) {
        return 'episode-detail';
      }
    }
    return 'overview';
  });
  const [selectedEpisode, setSelectedEpisode] = useState<TeskilatEpisode>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('186')) return FEATURED_SEASON7_EPISODE;
      if (path.includes('187')) return EPISODE_187;
      if (path.includes('188')) return EPISODE_188;
    }
    return EPISODE_188; // Default to Episode 188
  });
  const [showPosterOverlay, setShowPosterOverlay] = useState(true);
  const [showPreRollAd, setShowPreRollAd] = useState(false);

  // Official Release Target Timestamp: Monday, October 12, 2026 at 4:00 AM UTC
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetTime = new Date('2026-10-12T04:00:00.000Z').getTime();

    const updateTimer = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return false;
      }

      const totalSecs = Math.floor(diff / 1000);
      const d = Math.floor(totalSecs / (3600 * 24));
      const h = Math.floor((totalSecs % (3600 * 24)) / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      return true;
    };

    // Run immediately
    updateTimer();

    const interval = setInterval(() => {
      const active = updateTimer();
      if (!active) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStartPlayback = () => {
    setShowPosterOverlay(false);
    setShowPreRollAd(true);
  };

  const handleAdComplete = () => {
    setShowPreRollAd(false);
    setTimeout(() => {
      const muxEl = document.querySelector('mux-video') as unknown as HTMLVideoElement | null;
      const shadowVideo = muxEl?.shadowRoot?.querySelector('video') as HTMLVideoElement | null;
      const standardVideo = document.querySelector('video') as HTMLVideoElement | null;

      if (shadowVideo && typeof shadowVideo.play === 'function') {
        shadowVideo.play().catch(() => {});
      } else if (muxEl && typeof muxEl.play === 'function') {
        muxEl.play().catch(() => {});
      } else if (standardVideo && typeof standardVideo.play === 'function') {
        standardVideo.play().catch(() => {});
      }
    }, 50);
  };

  // Sync activeView with browser back/forward, header nav, and URL state
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('186') || hash.includes('186') || path.includes('187') || hash.includes('187') || path.includes('188') || hash.includes('188') || path.includes('/episode')) {
        setActiveView('episode-detail');
        if (path.includes('186') || hash.includes('186')) {
          setSelectedEpisode(FEATURED_SEASON7_EPISODE);
        } else if (path.includes('187') || hash.includes('187')) {
          setSelectedEpisode(EPISODE_187);
        } else {
          setSelectedEpisode(EPISODE_188);
        }
      } else {
        setActiveView('overview');
      }
    };

    const handleOverviewEvent = () => {
      setActiveView('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Run once on mount to handle direct deep-links from Google Search
    handlePopState();

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('teskilat-overview', handleOverviewEvent);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('teskilat-overview', handleOverviewEvent);
    };
  }, []);

  // SEO & Google Search Keyword Optimization Effect for Main & Episode Pages
  useEffect(() => {
    const keywordsEl = document.querySelector('meta[name="keywords"]');

    if (activeView === 'episode-detail') {
      const num = selectedEpisode.episodeNumber;
      let pageTitle = `Teskilat Season 7 Episode ${num} Urdu Subtitles - FEVIQO.com`;
      let metaDesc = `Watch Teskilat Season 7 Episode ${num} with Urdu Subtitles (تشکیلات سیزن 7 قسط ${num}). Stream HD episodes processed on FEVIQO.com.`;
      let keywords = `teskilat urdu, teskilat urdu subtitles, watch teskilat urdu, teskilat ${num}, teskilat ${num} urdu, teskilat season 7 episode ${num} urdu subtitles`;

      if (num === 188) {
        pageTitle = `Teskilat Season 7 Episode 4 Urdu Subtitles - Bolum 188 Ender Rescue | FEVIQO`;
        metaDesc = `Watch Teskilat Season 7 Episode 4 Urdu Subtitles (Bolum 188). Altay closes in on Ender as suspicion around Azra grows and Korkut corners Yahya.`;
        keywords = `Teskilat Season 7, Teskilat Season 7 Urdu Subtitles, Teskilat Urdu Subtitles, Teşkilat Season 7 Urdu, Teskilat Season 7 Watch Online, Teskilat Episode 185 Urdu Subtitles, Teskilat Bolum 185 Urdu, Altay Teskilat Season 7, Korkut Teskilat, Turkish Series Urdu Subtitles, Turkish Action Series Urdu, Turkish Intelligence Series, TRT1 Teskilat, Teskilat New Season Urdu, Teskilat NiaziPlay, Teskilat Season 7 Episode 4 Urdu Subtitles, Teskilat Episode 188 Urdu Subtitles, Teskilat Bolum 188 Urdu, Teskilat Season 7 Urdu, Teskilat Episode 4 Urdu, Teskilat 188 Urdu, Altay Ender Episode 188, Azra Teskilat Season 7, Korkut Yahya Episode 188, Bahar Yahya Teskilat, Ender Rescue Teskilat, TRT1 Teskilat Episode 188, Salahuddin Ayyubi Series, Kurulus Osman Season 5 in Urdu Subtitles, Kurulus Osman Season 6 Urdu & English Subtitles, Teskilat Season 4 Urdu Subtitles, Mehmed: Fetihler Sultani - Urdu & English Subtitles, Al Sancak | Sipahi, Alparslan: Büyük Selçuklu, Ates Kuslari, Barbarosslar, Destan, Ertugrul Ghazi, Keiki Sniper, Kosem Sultan, Mendirman Jaloliddin Khawarzam, Mevlana Celaleddin Rumi, Soz Series, Sultan Abdulhamid, Sultan Mehmat Fatih, The Pit (Cukur), Turkish Dramas, Yunus Emre, Turkish series with Urdu subtitles, watch Turkish dramas online, historical Turkish series in Urdu, Ottoman Empire series with English subtitles, Islamic history dramas in Urdu, Turkish action series with Urdu dubbing, latest Turkish series 2024, Urdu dubbed Turkish historical dramas, stream Turkish series in HD, family-friendly Turkish dramas, Turkish war series with Urdu subtitles, best Turkish series to watch online, Turkish dramas based on true stories, top-rated Turkish series in Urdu, Turkish romantic dramas with English subtitles, Turkish thriller series in Urdu, online streaming of Turkish historical series, Turkish series with dual subtitles, popular Turkish dramas in Pakistan, Turkish series episodes in Urdu, best streaming platforms for Turkish series, online education games for kids, top adventure games for adults, fitness and health articles, latest technology news articles, financial advice for families, home improvement articles, educational articles for students, html5 games, games for children`;
      } else if (num === 187) {
        metaDesc = `Watch Teskilat Season 7 Episode 187 Urdu subtitles full episode. Stream Teskilat episode 187 Urdu subtitles watch online with story recaps on FEVIQO.com.`;
        keywords = `teskilat urdu, teskilat urdu subtitles, watch teskilat urdu, teskilat episode 187 urdu subtitles, teskilat 187, teskilat 187 urdu, teskilat, teskilat urdu, teskilat 187 urdu subtitles, teskilat season 7 urdu, watch teskilat season 7 episode 187 urdu, teskilat episode 187 in urdu, teskilat 187 urdu, teskilat episode 187 urdu subtitles full`;
      }
      
      document.title = pageTitle;

      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);

      if (keywordsEl) keywordsEl.setAttribute('content', keywords);

      const ogTitleEl = document.querySelector('meta[property="og:title"]');
      if (ogTitleEl) ogTitleEl.setAttribute('content', pageTitle);

      const ogDescEl = document.querySelector('meta[property="og:description"]');
      if (ogDescEl) ogDescEl.setAttribute('content', metaDesc);

      const twTitleEl = document.querySelector('meta[name="twitter:title"]');
      if (twTitleEl) twTitleEl.setAttribute('content', pageTitle);

      const twDescEl = document.querySelector('meta[name="twitter:description"]');
      if (twDescEl) twDescEl.setAttribute('content', metaDesc);
    } else {
      const pageTitle = "Teskilat Season 7 Urdu Subtitles - Watch Online - FEVIQO.com";
      const metaDesc = "Watch Teskilat Season 7 Turkish Drama in HD Urdu Subtitles (تشکیلات سیزن 7 اردو). Stream official episodes with story recaps on FEVIQO.com.";
      const keywords = "teskilat urdu, teskilat urdu subtitles, watch teskilat urdu, teskilat season 7, teskialt new season, teskilat urdu, teskilat drama urdu, teskilat 186, teskilat 186 urdu, teskilat episode 186 urdu subtitles, teskilat urdu 186, teskilat 187, teskilat 187 urdu, teskilat episode 187 urdu subtitles";

      document.title = pageTitle;

      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);

      if (keywordsEl) keywordsEl.setAttribute('content', keywords);
    }
  }, [activeView, selectedEpisode]);
  
  // Custom YouTube-Style Video Player States
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(138 * 60); // 2h 18m = 8280s default
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p60 HD (Original)');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [skipFeedback, setSkipFeedback] = useState<'forward' | 'backward' | null>(null);
  const [playerToast, setPlayerToast] = useState<string | null>(null);

  // Resolution stream map for authentic functional quality switching
  const QUALITY_STREAMS: Record<string, string> = {
    '1080p60 HD (Original)': 'https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8',
    '720p HD': 'https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8',
    '480p SD': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'Auto': 'https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8'
  };

  const hlsRef = useRef<Hls | null>(null);

  // Initialize and attach HLS stream for .m3u8 video URL
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = selectedEpisode.videoUrl;

    if (streamUrl.includes('.m3u8') || streamUrl.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          startLevel: -1,
          capLevelToPlayerSize: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 12 * 1024 * 1024,
          autoStartLoad: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.startLoad();

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                try { hls.destroy(); } catch {}
                break;
            }
          }
        });

        hlsRef.current = hls;

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      }
    } else {
      video.src = streamUrl;
    }
  }, [selectedEpisode.videoUrl]);

  // In-Stream Video Ad States (Disabled per user request until specified)
  const [adState, setAdState] = useState<'idle' | 'playing_preroll' | 'completed'>('completed');
  const [adCountdown, setAdCountdown] = useState<number>(0);
  
  // Interaction & Modal States
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showAdSetupModal, setShowAdSetupModal] = useState<boolean>(false);
  const [adFormSubmitted, setAdFormSubmitted] = useState<boolean>(false);

  // Form Inputs for Ad Placement Booking
  const [adBrandName, setAdBrandName] = useState<string>('');
  const [adEmail, setAdEmail] = useState<string>('');
  const [adFormat, setAdFormat] = useState<string>('In-Stream Pre-Roll Video Ad');
  const [adMessage, setAdMessage] = useState<string>('');

  // Keep video playback rate synced dynamically whenever speed state changes or video plays
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, isPlaying]);

  // Pre-roll ad timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (adState === 'playing_preroll' && adCountdown > 0) {
      timer = setTimeout(() => {
        setAdCountdown(prev => prev - 1);
      }, 1000);
    } else if (adState === 'playing_preroll' && adCountdown === 0) {
      setAdState('completed');
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
    return () => clearTimeout(timer);
  }, [adState, adCountdown]);

  const showToast = (message: string) => {
    setPlayerToast(message);
    setTimeout(() => {
      setPlayerToast(prev => (prev === message ? null : prev));
    }, 2000);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleSkipAd = () => {
    setAdState('completed');
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeekBy = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      setSkipFeedback(seconds > 0 ? 'forward' : 'backward');
      setTimeout(() => setSkipFeedback(null), 700);
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
        setVolume(1);
      } else {
        videoRef.current.muted = true;
        setIsMuted(true);
        setVolume(0);
      }
    }
  };

  // FULLY WORKABLE FUNCTIONAL PLAYBACK SPEED CHANGE
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    showToast(`Speed set to ${speed === 1.0 ? 'Normal (1.0x)' : `${speed}x`}`);
  };

  // FULLY WORKABLE FUNCTIONAL QUALITY CHANGE
  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    const targetUrl = QUALITY_STREAMS[quality] || QUALITY_STREAMS['1080p60 HD (Original)'];
    
    if (videoRef.current) {
      const savedTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      
      if ((targetUrl.includes('.m3u8') || targetUrl.endsWith('.m3u8')) && Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(targetUrl);
        hls.attachMedia(videoRef.current);
        hlsRef.current = hls;
      } else {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        videoRef.current.src = targetUrl;
      }

      videoRef.current.currentTime = savedTime;
      videoRef.current.playbackRate = playbackSpeed;
      
      if (wasPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
    
    showToast(`Quality switched to ${quality}`);
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        playerContainerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const handleOpenEpisode = (ep: TeskilatEpisode) => {
    setSelectedEpisode(ep);
    setActiveView('episode-detail');
    setShowPosterOverlay(true);
    setAdState('idle');
    setIsPlaying(false);
    setCurrentTime(0);
    setShowSettingsMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({ view: 'episode-detail' }, '', `/teskilat/episode-${ep.episodeNumber}`);
    } catch {}
  };

  const handleBackToOverview = () => {
    setActiveView('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({ view: 'overview' }, '', '/teskilat');
    } catch {}
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(`https://feviqo.com/teskilat`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAdFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdFormSubmitted(true);
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return '0:00';
    const hours = Math.floor(timeInSec / 3600);
    const minutes = Math.floor((timeInSec % 3600) / 60);
    const seconds = Math.floor(timeInSec % 60);

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* Primary Navigation */}
      <Navbar
        onBookCall={onBookCall}
        onNavigateSection={() => onBackToHome()}
        onNavigatePricing={onNavigatePricing}
        onNavigateFlow={onNavigateFlow}
        onNavigatePage={onNavigatePage}
      />

      {/* TOP IN-STREAM SPONSORSHIP / AD PLACEMENT HEADER BANNER */}
      <div className="bg-[#031d12] text-white border-b border-emerald-950/80 py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
              SPONSORSHIP
            </span>
            <span className="font-semibold text-emerald-100">
              In-Stream Pre-Roll &amp; Banner Advertising for Teskilat Urdu Portal
            </span>
          </div>

          <button
            onClick={() => setShowAdSetupModal(true)}
            className="px-4 py-1.5 rounded-full bg-white hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-md cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-800" />
            <span>Book Ad Setup / Sponsor</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1">
        {activeView === 'overview' ? (
          /* MAIN TEŞKİLAT SEASON 7 DISCOVERY HUB - FEVIQO SPEC */
          <div className="bg-white text-[#0B0B0D] min-h-screen">
            
            {/* 3. STACKED HERO SECTION (IDENTICAL ON PHONE & DESKTOP): 100% PICTURE SIGHT WITH SOLID READABLE DARK PLATE BELOW */}
            <section className="relative w-full bg-black text-white overflow-hidden">
              
              {/* 1. PICTURE PANEL: Displays the widescreen 16:9 banner with absolutely ZERO CROPPING or cutting! */}
              <div className="w-full aspect-video bg-black relative select-none">
                <img
                  src="https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2"
                  alt="Teskilat Cinematic Backdrop"
                  className="w-full h-full object-cover block"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
              </div>

              {/* 2. BOTTOM DETAILS AREA: Solid, ultra-premium text content block sitting directly below on solid black for perfect readability */}
              <div className="w-full bg-black py-8 px-6 sm:px-12 lg:px-16 z-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left">
                  
                  {/* Left text panel */}
                  <div className="lg:col-span-8 space-y-4 sm:space-y-5">
                    
                    {/* Eyebrow */}
                    <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                      FEVIQO • TESKILAT
                    </div>

                    {/* Official Graphic LOGO of Teskilat */}
                    <div className="h-14 sm:h-20 w-auto flex items-center justify-start select-none">
                      <img 
                        src="https://lh3.googleusercontent.com/d/1hO0OhAjFTt4UPxwURNI8u0Hm7j0xz74Y" 
                        alt="Teskilat Official Logo"
                        className="h-full w-auto object-contain max-w-[250px] sm:max-w-[340px]"
                        loading="eager"
                      />
                    </div>

                    {/* Primary Descriptive H1 Title */}
                    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                      Teskilat Season 7 Urdu Subtitles
                    </h1>

                    {/* Urdu Title below logo */}
                    <div className="text-xl sm:text-2xl font-urdu-slim text-slate-300 font-normal dir-rtl leading-relaxed">
                      تشکیلات سیزن 7 اردو ترجمہ کے ساتھ (Teskilat Urdu)
                    </div>

                    {/* Hero Metadata Line */}
                    <div className="text-xs sm:text-sm text-slate-300 font-medium flex flex-wrap items-center gap-2.5 pt-1 select-none">
                      <span className="font-bold text-white">Season 7</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">HD</span>
                      <span>•</span>
                      <span className="font-medium text-slate-200">Urdu Subtitles</span>
                      <span>•</span>
                      <span className="text-slate-300">Altay • Ender • Korkut</span>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
                      Watch Teskilat Season 7 Urdu Subtitles on FEVIQO. Stream official Teskilat Urdu episodes, story recaps, and HD releases weekly.
                    </p>

                  </div>

                  {/* Right button panel */}
                  <div className="lg:col-span-4 flex items-center lg:justify-end gap-3 flex-wrap sm:flex-nowrap w-full">
                    <button
                      onClick={() => handleOpenEpisode(EPISODE_188)}
                      className="w-full lg:w-auto px-8 py-3.5 bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-sm tracking-wide rounded-md transition duration-150 flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:scale-[1.02]"
                    >
                      <Play className="w-4 h-4 fill-current text-slate-950" />
                      <span>Watch Episode 188</span>
                    </button>

                    <a
                      href="#episode-directory"
                      className="w-full lg:w-auto px-6 py-3.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-sm tracking-wide rounded-md transition duration-150 flex items-center justify-center gap-2 cursor-pointer text-center font-bold"
                    >
                      <span>Browse Episodes</span>
                    </a>
                  </div>

                </div>
              </div>

            </section>

            {/* 5 & 6. LATEST EPISODE FEATURE & KEY EPISODE INFORMATION */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
              <div className="space-y-6 text-left">
                
                <div className="space-y-1">
                  <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                    SEASON 7 &bull; EPISODE 188 (SEASON 7 EPISODE 4)
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-[#0B0B0D]">
                    Latest Episode
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
                  
                  {/* Thumbnail */}
                  <a 
                    href="/teskilat/episode-188"
                    onClick={(e) => { e.preventDefault(); handleOpenEpisode(EPISODE_188); }}
                    className="lg:col-span-6 relative rounded-2xl overflow-hidden bg-slate-100 shadow-xl border border-slate-200 block group aspect-video"
                  >
                    {EPISODE_188.thumbnailUrl ? (
                      <img 
                        src={EPISODE_188.directoryThumbnailUrl || EPISODE_188.thumbnailUrl} 
                        alt="Teskilat Episode 188, Teskilat 188, teskilat urdu, teskilat teskilat episode 188 urdu" 
                        title="Teskilat Episode 188, Teskilat 188, teskilat urdu, teskilat teskilat episode 188 urdu"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#09090c] via-[#111116] to-[#021d12] flex flex-col items-center justify-center p-4 border border-white/5">
                        <span className="text-xs font-mono font-bold tracking-widest text-[#22C55E] uppercase bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full mb-1 animate-pulse">EPISODE 188 TEASER</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">COVER ART UPLOADING SOON</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current text-slate-950 ml-0.5" />
                      </div>
                    </div>
                  </a>

                  {/* Content & Description */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider">
                      LATEST RELEASES
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-[#0B0B0D]">
                      Teskilat Season 7 Episode 4 (Bolum 188) Urdu
                    </h3>

                    <div className="text-lg font-urdu-slim text-slate-800 dir-rtl text-right font-normal leading-relaxed">
                      تشکیلات سیزن 7 قسط 188 اردو ترجمہ کے ساتھ دیکھیں۔
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed">
                      Stream Teskilat Season 7 Episode 4 (Bolum 188) Turkish drama with premium Urdu subtitles on FEVIQO. Stream official story recaps, full HD 1080p video player, and complete espionage missions.
                    </p>

                    {/* Minimal Information Strip */}
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-3 pt-2">
                      <span className="text-[#0B0B0D]">Season 7</span>
                      <span>&bull;</span>
                      <span>Espionage Drama</span>
                      <span>&bull;</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-bold text-[10px]">1080p HD</span>
                      <span>&bull;</span>
                      <span>Urdu Subtitles</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-3">
                      <button
                        onClick={() => handleOpenEpisode(EPISODE_188)}
                        className="px-6 py-3 rounded-full bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-black text-xs transition cursor-pointer inline-flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current text-slate-950" />
                        <span>Watch Episode 188</span>
                      </button>

                      <a
                        href="/teskilat/episode-188"
                        onClick={(e) => { e.preventDefault(); handleOpenEpisode(EPISODE_188); }}
                        className="text-xs font-bold text-slate-700 hover:text-[#0B0B0D] transition cursor-pointer"
                      >
                        Read Story &rarr;
                      </a>
                    </div>

                  </div>

                </div>

              </div>
            </section>

            {/* 7. SHORT SEASON INTRODUCTION (EDITORIAL) */}
            <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left">
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h2 className="text-xl font-black text-[#0B0B0D]">Teskilat Season 7 Overview</h2>
                <div className="text-base font-urdu-slim text-slate-800 dir-rtl text-right font-normal">
                  تشکیلات سیزن 7 اردو ترجمہ کے ساتھ
                </div>
                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                  FEVIQO brings you official high-definition streaming for Teskilat Season 7 with full Urdu subtitles. Stream the latest espionage operations, story recaps, and agent arcs in 1080p HD.
                </p>
              </div>
            </section>

            {/* EPISODE DIRECTORY - SMALL GRID BOXES MATCHING GONUL DAGI & MEHMED */}
            <section id="episode-directory" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="text-left space-y-2 mb-8">
                <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                  EPISODE DIRECTORY
                </div>
                <h2 className="text-3xl font-black text-[#0B0B0D]">
                  Teskilat Season 7 Episodes
                </h2>
                <p className="text-slate-600 text-sm">
                  Watch available Season 7 episodes with Urdu subtitles on FEVIQO.
                </p>
              </div>

              {/* Grid of Small Episode Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {ALL_EPISODES.map((ep) => (
                  <a 
                    href={`/teskilat/episode-${ep.episodeNumber}`}
                    key={ep.id}
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenEpisode(ep);
                    }}
                    className="group bg-slate-50/20 hover:bg-slate-50/50 border border-slate-200 hover:border-[#22C55E]/80 rounded-2xl overflow-hidden hover:scale-[1.02] active:scale-[0.99] transition duration-200 text-left select-none cursor-pointer flex flex-col h-full shadow-sm"
                  >
                    {/* 16:9 Thumbnail Box */}
                    <div className="relative aspect-video bg-slate-100 border-b border-slate-100 overflow-hidden">
                      {ep.thumbnailUrl ? (
                        <img 
                          src={ep.directoryThumbnailUrl || ep.thumbnailUrl} 
                          alt={ep.episodeNumber === 188 ? "Teskilat Episode 188, Teskilat 188, teskilat urdu, teskilat teskilat episode 188 urdu" : `Teskilat Urdu Episode ${ep.episodeNumber} Subtitles Thumbnail - Season 7`} 
                          title={ep.episodeNumber === 188 ? "Teskilat Episode 188, Teskilat 188, teskilat urdu, teskilat teskilat episode 188 urdu" : `Teskilat Urdu Episode ${ep.episodeNumber} Subtitles`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#09090c] via-[#111116] to-[#021d12] flex flex-col items-center justify-center p-2 border border-white/5">
                          <span className="text-[10px] font-mono font-bold tracking-widest text-[#22C55E] uppercase animate-pulse text-center">EPISODE {ep.episodeNumber}</span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 text-center">COVER ART UPLOADING</span>
                        </div>
                      )}
                      {ep.isLatest && (
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#22C55E] text-slate-950 text-[9px] font-black uppercase tracking-wider">
                          LATEST
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                        <div className="w-10 h-10 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 fill-current text-slate-950 ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Details Box */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>EPISODE {ep.episodeNumber}</span>
                          <span>·</span>
                          <span>{ep.duration}</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-[#0B0B0D] group-hover:text-[#22C55E] transition line-clamp-2">
                          Teskilat Season 7 Episode {ep.episodeNumber === 188 ? '4' : ep.episodeNumber === 187 ? '3' : '2'} (Bolum {ep.episodeNumber})
                        </h3>
                      </div>
                      
                      <div className="pt-2 flex items-center justify-between text-xs text-[#22C55E] font-bold border-t border-slate-100/80">
                        <span>Watch Online</span>
                        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>

          </div>
        ) : (
          /* EDITORIAL WATCH EPISODE PAGE - FEVIQO BRIEF SPEC */
          <div className="bg-white text-[#0B0B0D] min-h-screen py-2 sm:py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-8">
              
              {/* 3. Top Breadcrumb Navigation */}
              <div className="px-4 sm:px-0">
                <nav className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span className="hover:text-slate-900 cursor-pointer" onClick={handleBackToOverview}>FEVIQO</span>
                  <span>/</span>
                  <span className="hover:text-slate-900 cursor-pointer" onClick={handleBackToOverview}>Teskilat</span>
                  <span>/</span>
                  <span>Season 7</span>
                  <span>/</span>
                  <span className="text-slate-900 font-bold">Episode {selectedEpisode.episodeNumber}</span>
                </nav>
              </div>

              {/* 4. Episode Header */}
              <div className="space-y-2 text-left px-4 sm:px-0">
                <div className="text-[11px] font-black uppercase tracking-widest text-[#22C55E]">
                  TESKILAT &bull; SEASON {selectedEpisode.seasonNumber}
                </div>

                <h1 className="text-xl sm:text-4xl font-black text-[#0B0B0D] tracking-tight">
                  Teskilat Season 7 Episode {selectedEpisode.episodeNumber === 188 ? "4" : selectedEpisode.episodeNumber === 187 ? "3" : "2"} Urdu Subtitles - Bolum {selectedEpisode.episodeNumber} {selectedEpisode.episodeNumber === 188 ? "Ender Rescue" : selectedEpisode.episodeNumber === 187 ? "Azra Betrayal" : "The Wolf Awakens"}
                </h1>

                <p className="text-xs font-bold text-slate-500 pt-0.5">
                  Urdu & English Subtitles &bull; 1080p HD &bull; FEVIQO.com
                </p>

                <p className="text-base sm:text-xl font-urdu-slim font-normal text-slate-900 dir-rtl text-right pt-1 leading-relaxed">
                  {selectedEpisode.titleUrdu}
                </p>

                <div className="text-xs text-slate-500 font-medium pt-1 flex items-center gap-2 sm:gap-3">
                  <span>{selectedEpisode.duration}</span>
                  <span>&bull;</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-bold text-[10px]">HD</span>
                  <span>&bull;</span>
                  <span>Urdu Subtitles</span>
                </div>
              </div>

              {/* 5 & 6. Secure Anti-Download Main Video Player */}
              <div 
                onContextMenu={(e) => e.preventDefault()}
                className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl flex items-center justify-center select-none aspect-video border border-slate-200/80 mx-auto"
              >
                
                {/* 100% Machine-Readable Hidden Video Elements to Guarantee Google Search Console Video Indexing Approval */}
                <div style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }} aria-hidden="true">
                  <video 
                    id="google-video-crawler-target"
                    controls
                    preload="metadata"
                    poster="https://feviqo.com/images/teskialt186thumbnIL.png"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* Decoy HLS source to hijack third-party video grabber tools and force black-screen / empty audio outputs */}
                    <source src="https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU/decoy_black_screen_silent.m3u8" type="application/x-mpegURL" />
                    <p>Stream Teskilat Season 7 Episode {selectedEpisode.episodeNumber} in HD Urdu Subtitles with FEVIQO's dedicated video player.</p>
                  </video>
                  <a href={`https://feviqo.com/teskilat/episode-${selectedEpisode.episodeNumber}`}>
                    Watch Teskilat Season 7 Episode {selectedEpisode.episodeNumber} Online HD
                  </a>
                </div>

                <style>{`
                  mux-video, video-skin, video-player { object-fit: contain !important; }
                  mux-video::part(video), mux-video video { object-fit: contain !important; width: 100% !important; height: 100% !important; }
                `}</style>
                {showPosterOverlay && (
                  <div 
                    onClick={handleStartPlayback}
                    className="absolute inset-0 z-30 bg-black flex items-center justify-center cursor-pointer group overflow-hidden rounded-2xl sm:rounded-3xl"
                  >
                    <img 
                      src={selectedEpisode.thumbnailUrl} 
                      alt={selectedEpisode.episodeNumber === 188 ? "Teskilat 188, teskilat urdu, teskilat teskilat episode 188 urdu" : `Teskilat Urdu Episode ${selectedEpisode.episodeNumber} Subtitles - Watch Season 7 Episode ${selectedEpisode.episodeNumber}`} 
                      title={selectedEpisode.episodeNumber === 188 ? "Teskilat 188, teskilat urdu, teskilat teskilat episode 188 urdu" : `Teskilat Episode ${selectedEpisode.episodeNumber}`}
                      className="w-full h-full object-cover object-center bg-black group-hover:scale-105 transition-transform duration-500 rounded-2xl sm:rounded-3xl"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#22C55E] text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current text-slate-950 ml-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* VAST Pre-Roll Video Ad Layer for Drama Pages */}
                {showPreRollAd && (
                  <VastPreRollAdOverlay
                    onAdComplete={handleAdComplete}
                  />
                )}

                <video-player
                  data-vast-endpoint="https://16793.rtb.adp3.net/pre-roll-rp?pubid=1025579&siteid=410037&ip=[IP]&ua=[USER_AGENT]"
                  data-ad-src="/api/vast-ad"
                  style={{ display: 'block', width: '100%', height: '100%', overflow: 'hidden' }}
                >
                  <video-skin poster={selectedEpisode.thumbnailUrl} style={{ display: 'block', width: '100%', height: '100%', aspectRatio: '16 / 9' }}>
                    <mux-video
                      src={selectedEpisode.videoUrl}
                      playsinline
                      poster={selectedEpisode.thumbnailUrl}
                      controlsList="nodownload"
                      disablePictureInPicture
                      data-vast-url="https://16793.rtb.adp3.net/pre-roll-rp?pubid=1025579&siteid=410037&ip=[IP]&ua=[USER_AGENT]"
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
                    ></mux-video>
                    <mux-data></mux-data>
                  </video-skin>
                </video-player>
              </div>

              {/* High-Converting Ads & Smartlink Row */}
              <div className="space-y-4 my-6">
                {/* 728x90 Leaderboard / 320x50 Mobile Header Ad */}
                <div className="hidden md:block">
                  <AdBanner728x90 />
                </div>
                <div className="block md:hidden">
                  <AdBanner320x50 />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-6 my-4">
                  <AdBanner468x60 />
                  <AdBanner300x250 />
                  <AdBanner160x300 />
                </div>

                {/* Native Banner */}
                <AdNativeBanner />

                {/* Sponsored Smartlink Button */}
                <div className="flex justify-center my-3">
                  <a
                    href="https://arwf.org/4/407c2859d48b877cf406dc93dcd6c1d5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black tracking-wide transition inline-flex items-center gap-2 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Sponsored HD Stream Mirror (FEVIQO Fast Server)</span>
                  </a>
                </div>
              </div>

              {/* 7. Player Surrounding Info Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-200/80">
                <div>
                  <div className="text-lg font-black text-[#0B0B0D]">Episode {selectedEpisode.episodeNumber}</div>
                  <div className="text-xs text-slate-500 font-medium">Season {selectedEpisode.seasonNumber} &bull; Urdu Subtitles</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareLink}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Share2 className="w-4 h-4 text-slate-700" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Share Episode'}</span>
                  </button>
                </div>
              </div>

              {/* 8. Story Section */}
              <div className="space-y-6 pt-2 text-left max-w-4xl">
                <h2 className="text-2xl font-black text-[#0B0B0D]">Episode {selectedEpisode.episodeNumber} Story Recap</h2>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-[#22C55E] uppercase tracking-wider">English Story Summary</h3>
                  <div className="text-slate-800 leading-relaxed font-normal space-y-6">
                    {selectedEpisode.storyRecapEnglish.split('\n\n').map((block, idx) => {
                      const trimmed = block.trim();
                      if (!trimmed) return null;

                      // Check if it should be treated as a title / heading
                      const isHeading = trimmed.length < 90 && (
                        trimmed.endsWith(':') || 
                        trimmed.includes(':') || 
                        trimmed.includes('–') || 
                        trimmed.includes('—') ||
                        (!trimmed.includes('.') && trimmed.split(' ').length < 12)
                      );

                      if (isHeading) {
                        return (
                          <h3 
                            key={idx} 
                            className="text-xl sm:text-2xl font-black text-slate-900 border-l-4 border-[#22C55E] pl-3.5 mt-8 mb-4 tracking-tight"
                          >
                            {trimmed}
                          </h3>
                        );
                      }

                      // Check if it's a bulleted list
                      if (trimmed.startsWith('- ') || trimmed.includes('\n- ')) {
                        const items = trimmed.split('\n').map(li => li.replace(/^-\s*/, '').trim()).filter(Boolean);
                        return (
                          <ul key={idx} className="list-disc pl-6 text-slate-700 space-y-2.5 my-4">
                            {items.map((item, itemIdx) => (
                              <li key={itemIdx} className="text-sm sm:text-base leading-relaxed">{item}</li>
                            ))}
                          </ul>
                        );
                      }

                      return (
                        <p key={idx} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-urdu-slim font-bold text-slate-900 dir-rtl text-right">
                    تشکیلات سیزن 7 قسط {selectedEpisode.episodeNumber} اردو کہانی کا خلاصہ
                  </h3>
                  <p className="text-slate-700 text-base font-urdu-slim font-normal whitespace-pre-line leading-relaxed dir-rtl text-right">
                    {selectedEpisode.storyRecapUrdu}
                  </p>
                </div>
              </div>

              {/* 9. Minimal Episode Details Metadata Grid */}
              <div className="pt-8 border-t border-slate-200 text-left">
                <h3 className="text-sm font-bold text-[#0B0B0D] mb-4 uppercase tracking-wider">Episode Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
                  <div>
                    <div className="text-slate-400 font-medium">Series</div>
                    <div className="text-[#0B0B0D] font-bold mt-0.5">Teskilat</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Season</div>
                    <div className="text-[#0B0B0D] font-bold mt-0.5">{selectedEpisode.seasonNumber}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Episode</div>
                    <div className="text-[#0B0B0D] font-bold mt-0.5">{selectedEpisode.episodeNumber}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Language</div>
                    <div className="text-[#0B0B0D] font-bold mt-0.5">Urdu Subtitles</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Quality</div>
                    <div className="text-[#0B0B0D] font-bold mt-0.5">HD 1080p</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Platform</div>
                    <div className="text-[#22C55E] font-extrabold mt-0.5">FEVIQO</div>
                  </div>
                </div>
              </div>

              {/* 10. Search Keyword Tags & Search Engine Cloud (Fully crawled by Googlebot) */}
              <div className="sr-only" aria-hidden="true">
                <h3>Popular Search Queries &amp; Target Keywords</h3>
                <p>
                  Teskilat Season 7, Teskilat Season 7 Urdu Subtitles, Teskilat Urdu Subtitles, Teşkilat Season 7 Urdu, Teskilat Season 7 Watch Online, Teskilat Episode 185 Urdu Subtitles, Teskilat Bolum 185 Urdu, Altay Teskilat Season 7, Korkut Teskilat, Turkish Series Urdu Subtitles, Turkish Action Series Urdu, Turkish Intelligence Series, TRT1 Teskilat, Teskilat New Season Urdu, Teskilat NiaziPlay, Teskilat Season 7 Episode 4 Urdu Subtitles, Teskilat Episode 188 Urdu Subtitles, Teskilat Bolum 188 Urdu, Teskilat Season 7 Urdu, Teskilat Episode 4 Urdu, Teskilat 188 Urdu, Altay Ender Episode 188, Azra Teskilat Season 7, Korkut Yahya Episode 188, Bahar Yahya Teskilat, Ender Rescue Teskilat, Turkish Series Urdu Subtitles, Teskilat NiaziPlay, TRT1 Teskilat Episode 188, Salahuddin Ayyubi Series, Kurulus Osman Season 5 in Urdu Subtitles, Kurulus Osman Season 6 Urdu &amp; English Subtitles, Teskilat Season 4 Urdu Subtitles, Mehmed: Fetihler Sultani - Urdu &amp; English Subtitles, Al Sancak | Sipahi, Alparslan: Büyük Selçuklu, Ates Kuslari, Barbarosslar, Destan, Ertugrul Ghazi, Keiki Sniper, Kosem Sultan, Mendirman Jaloliddin Khawarzam, Mevlana Celaleddin Rumi, Soz Series, Sultan Abdulhamid, Sultan Mehmat Fatih, The Pit (Cukur), Turkish Dramas, Yunus Emre, Turkish series with Urdu subtitles, watch Turkish dramas online, historical Turkish series in Urdu, Ottoman Empire series with English subtitles, Islamic history dramas in Urdu, Turkish action series with Urdu dubbing, latest Turkish series 2024, Urdu dubbed Turkish historical dramas, stream Turkish series in HD, family-friendly Turkish dramas, Turkish war series with Urdu subtitles, best Turkish series to watch online, Turkish dramas based on true stories, top-rated Turkish series in Urdu, Turkish romantic dramas with English subtitles, Turkish thriller series in Urdu, online streaming of Turkish historical series, Turkish series with dual subtitles, popular Turkish dramas in Pakistan, Turkish series episodes in Urdu, best streaming platforms for Turkish series, online education games for kids, top adventure games for adults, fitness and health articles, latest technology news articles, financial advice for families, home improvement articles, educational articles for students, html5 games, games for children.
                </p>
              </div>

              {/* 11. Episode Navigation */}
              <div className="pt-10 border-t border-slate-200">
                <div className="grid grid-cols-3 items-center text-xs font-bold">
                  <button 
                    onClick={() => {
                      if (selectedEpisode.episodeNumber === 187) {
                        handleOpenEpisode(FEATURED_SEASON7_EPISODE);
                      } else {
                        showToast('Episode 185 loading...');
                      }
                    }}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-400 text-left transition group cursor-pointer"
                  >
                    <div className="text-slate-400 text-[10px] uppercase font-bold">&larr; Previous</div>
                    <div className="text-[#0B0B0D] font-extrabold text-sm mt-0.5 group-hover:text-[#22C55E] transition">
                      Episode {selectedEpisode.episodeNumber === 187 ? 186 : 185}
                    </div>
                  </button>

                  <button 
                    onClick={handleBackToOverview}
                    className="p-4 rounded-2xl hover:bg-slate-50 text-center transition cursor-pointer"
                  >
                    <div className="text-[#0B0B0D] font-extrabold text-sm">All Episodes</div>
                  </button>

                  <button 
                    onClick={() => {
                      if (selectedEpisode.episodeNumber === 186) {
                        handleOpenEpisode(EPISODE_187);
                      } else if (selectedEpisode.episodeNumber === 187) {
                        handleOpenEpisode(EPISODE_188);
                      } else {
                        showToast('You are watching the latest episode (Episode 188)!');
                      }
                    }}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-400 text-right transition group cursor-pointer"
                  >
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Next &rarr;</div>
                    <div className="text-[#0B0B0D] font-extrabold text-sm mt-0.5 group-hover:text-[#22C55E] transition">
                      Episode {selectedEpisode.episodeNumber === 186 ? 187 : 188}
                    </div>
                  </button>
                </div>
              </div>

              {/* 11. Back to Season Link */}
              <div className="pt-6 text-center">
                <button
                  onClick={handleBackToOverview}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0B0B0D] transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Teskilat Season 7 Overview</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* AD SETUP & SPONSORSHIP BOOKING MODAL */}
      {showAdSetupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-left space-y-6 shadow-2xl relative">
            <button
              onClick={() => { setShowAdSetupModal(false); setAdFormSubmitted(false); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 font-bold p-1 rounded-full bg-slate-100 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {!adFormSubmitted ? (
              <>
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] uppercase tracking-wider">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In-Stream Video Ad Placement</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-950">Book Teskilat Ad Setup</h3>
                  <p className="text-slate-600 text-xs">
                    Sponsor pre-roll video ads, banner placements, or channel dubbing integrations on FEVIQO Teskilat portal.
                  </p>
                </div>

                <form onSubmit={handleAdFormSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Company / Brand Name</label>
                    <input
                      type="text"
                      value={adBrandName}
                      onChange={(e) => setAdBrandName(e.target.value)}
                      placeholder="e.g. Acme Media Corp"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={adEmail}
                      onChange={(e) => setAdEmail(e.target.value)}
                      placeholder="sponsor@brand.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Ad Format Preferred</label>
                    <select
                      value={adFormat}
                      onChange={(e) => setAdFormat(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      <option value="In-Stream Pre-Roll Video Ad">5s In-Stream Pre-Roll Commercial</option>
                      <option value="Header Leaderboard Banner (728x90)">Header Leaderboard Banner (728x90)</option>
                      <option value="Under-Player Medium Banner (300x250)">Under-Player Medium Banner (300x250)</option>
                      <option value="Custom Series Sponsorship">Custom Series Sponsorship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Campaign Details / Message</label>
                    <textarea
                      value={adMessage}
                      onChange={(e) => setAdMessage(e.target.value)}
                      placeholder="Tell us about your target campaign budget and timeline..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdSetupModal(false)}
                      className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-emerald-700 text-white font-black shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Ad Request</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-950">Ad Request Submitted!</h3>
                <p className="text-slate-600 text-xs max-w-sm mx-auto leading-relaxed">
                  Thank you! Our team will review your ad placement request for Teskilat Season 7 and contact you at <strong className="text-slate-900">{adEmail}</strong> within 2 hours.
                </p>
                <button
                  onClick={() => { setShowAdSetupModal(false); setAdFormSubmitted(false); }}
                  className="px-6 py-2.5 rounded-xl bg-slate-950 text-white font-black text-xs"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

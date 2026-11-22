import { YERALTI_POSTER_URL } from './yeraltiData';

export type MembershipPlanId = 'starter' | 'standard' | 'plus' | 'vip';

export type PaymentRegion = 'pakistan' | 'international';
export type PaymentMethod = 'bank_qr' | 'binance_qr' | 'admin_assigned';
export type PaymentCurrency = 'PKR' | 'USD';

export type EpisodeAccessType = 'free' | 'premium';

export interface MembershipPlan {
  id: MembershipPlanId;
  name: string;
  pricePkr: number;
  priceDisplay: string;
  priceUsd: number;
  priceUsdDisplay: string;
  durationDays: number;
  durationLabel: string;
  dramaLimit: number | 'all';
  inclusionText: string;
  summary: string;
  ctaLabel: string;
  isFeatured?: boolean;
  featuredLabel?: string;
}

export interface CatalogEpisodeMeta {
  slug: string;
  number: number;
  title: string;
  duration: string;
  releaseDate: string;
  thumbnail: string;
  shortSummary: string;
  accessType: EpisodeAccessType;
  isPublished: boolean;
  requiredPlanLevel?: 'any_active' | MembershipPlanId[];
}

export interface CatalogDramaMeta {
  id: 'yeralti' | 'teskilat' | 'mehmed-fetihler-sultani' | 'gunesin-dogdugu-yer';
  title: string;
  urduTitle: string;
  seasonLabel: string;
  genreLabel: string;
  languageLabel: string;
  languageLabelUr: string;
  vipEligible: boolean;
  posterUrl: string;
  fallbackPosterUrl: string;
  synopsis: string;
  hubPath: string;
  episodes: CatalogEpisodeMeta[];
}

export const DEFAULT_USD_PRICES: Record<MembershipPlanId, number> = {
  starter: 1.2,
  standard: 2.5,
  plus: 3.5,
  vip: 5,
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    pricePkr: 299,
    priceDisplay: 'PKR 299',
    priceUsd: DEFAULT_USD_PRICES.starter,
    priceUsdDisplay: `$${DEFAULT_USD_PRICES.starter.toFixed(2)} USD`,
    durationDays: 15,
    durationLabel: '15 Days',
    dramaLimit: 1,
    inclusionText: '1 drama included',
    summary: 'Follow one selected Turkish drama with 15 days of member access.',
    ctaLabel: 'Choose Starter',
  },
  {
    id: 'standard',
    name: 'Standard',
    pricePkr: 599,
    priceDisplay: 'PKR 599',
    priceUsd: DEFAULT_USD_PRICES.standard,
    priceUsdDisplay: `$${DEFAULT_USD_PRICES.standard.toFixed(2)} USD`,
    durationDays: 30,
    durationLabel: '30 Days',
    dramaLimit: 1,
    inclusionText: '1 drama included',
    summary: 'Full 30-day access to your chosen Turkish series and every new episode added.',
    ctaLabel: 'Choose Standard',
    isFeatured: true,
    featuredLabel: 'Most Popular',
  },
  {
    id: 'plus',
    name: 'Plus',
    pricePkr: 899,
    priceDisplay: 'PKR 899',
    priceUsd: DEFAULT_USD_PRICES.plus,
    priceUsdDisplay: `$${DEFAULT_USD_PRICES.plus.toFixed(2)} USD`,
    durationDays: 30,
    durationLabel: '30 Days',
    dramaLimit: 2,
    inclusionText: '2 dramas included',
    summary: 'Select any two Turkish series from the catalogue for 30 continuous days.',
    ctaLabel: 'Choose Plus',
  },
  {
    id: 'vip',
    name: 'VIP',
    pricePkr: 1299,
    priceDisplay: 'PKR 1,299',
    priceUsd: DEFAULT_USD_PRICES.vip,
    priceUsdDisplay: `$${DEFAULT_USD_PRICES.vip.toFixed(2)} USD`,
    durationDays: 30,
    durationLabel: '30 Days',
    dramaLimit: 3,
    inclusionText: '3 dramas included',
    summary: 'Select any three Turkish series from the catalogue for 30 continuous days.',
    ctaLabel: 'Choose VIP',
  },
];

export const MEMBERSHIP_DRAMAS: CatalogDramaMeta[] = [
  {
    id: 'yeralti',
    title: 'Yeralti - Urdu Dub',
    urduTitle: 'جرائم کی دنیا',
    seasonLabel: 'Season 1',
    genreLabel: 'Crime Thriller',
    languageLabel: 'Urdu Dubbed',
    languageLabelUr: 'اردو ڈبنگ',
    vipEligible: true,
    posterUrl: YERALTI_POSTER_URL,
    fallbackPosterUrl: '/images/posters/poster-horiz-narrative-storytelling.jpg',
    synopsis:
      'Enter the ruthless criminal underworld of Yeralti - Urdu Dub (جرائم کی دنیا). Rival syndicates, deadly betrayals, and high-stakes power struggles unfold in exclusive Urdu Dubbed HD.',
    hubPath: '/yeralti',
    episodes: [
      {
        slug: 'episode-23',
        number: 23,
        title: 'Yeralti - Urdu Dub Episode 23 (جرائم کی دنیا)',
        duration: '2h 15m',
        releaseDate: '2026-11-21',
        thumbnail: YERALTI_POSTER_URL,
        shortSummary:
          'Enter the dark underworld of Yeralti in Episode 23 Urdu Dubbed HD — exclusive for FEVIQO Premium Members.',
        accessType: 'premium',
        isPublished: true,
        requiredPlanLevel: 'any_active',
      },
    ],
  },
  {
    id: 'teskilat',
    title: 'Teşkilat',
    urduTitle: 'تشکیلات',
    seasonLabel: 'Season 7',
    genreLabel: 'Espionage Action',
    languageLabel: 'Urdu Dubbed',
    languageLabelUr: 'اردو ڈبنگ',
    vipEligible: true,
    posterUrl: 'https://lh3.googleusercontent.com/d/16Huz3NzGKaUqRD657ESze6kdkqnRl3W2',
    fallbackPosterUrl: '/images/teskialt186thumbnIL.webp',
    synopsis:
      'Altay Yalçın and his covert intelligence unit operate behind enemy lines to dismantle international conspiracies threatening the homeland.',
    hubPath: '/teskilat',
    episodes: [
      {
        slug: 'episode-193',
        number: 193,
        title: 'Teskilat Season 7 Episode 193 (Bolum 193)',
        duration: '2h 25m',
        releaseDate: '2026-11-16',
        thumbnail: 'https://lh3.googleusercontent.com/d/1pDs3oj0h6eOP64xO10eYp6TMqcGs2AqP',
        shortSummary:
          'Teşkilat returns with Episode 193 in Urdu Dubbed HD as Altay and the agency confront a decisive new covert operation.',
        accessType: 'premium',
        isPublished: true,
        requiredPlanLevel: 'any_active',
      },
      {
        slug: 'episode-192',
        number: 192,
        title: 'Teskilat Season 7 Episode 192 (Bolum 192)',
        duration: '2h 25m',
        releaseDate: '2026-11-08',
        thumbnail: 'https://lh3.googleusercontent.com/d/1vvY9e1e-y0pddweoqJPPxSEEhHIXI6o2',
        shortSummary:
          'Teşkilat returns with Episode 192 in Urdu Dubbed HD as Altay and the agency confront a decisive new covert operation.',
        accessType: 'premium',
        isPublished: true,
        requiredPlanLevel: 'any_active',
      },
      {
        slug: 'episode-189',
        number: 189,
        title: 'Teskilat Season 7 Episode 189 (Bolum 189)',
        duration: '2h 25m',
        releaseDate: '2026-10-18',
        thumbnail: 'https://lh3.googleusercontent.com/d/15lsrpRxnIw6C491oFLSXMXCC50o2ByfC',
        shortSummary:
          'Framed for high treason, Altay escapes custody to expose an AI conspiracy before a climactic confrontation in Switzerland.',
        accessType: 'free',
        isPublished: true,
      },
      {
        slug: 'episode-188',
        number: 188,
        title: 'Teskilat Season 7 Episode 188 (Bolum 188)',
        duration: '2h 25m',
        releaseDate: '2026-10-11',
        thumbnail: 'https://lh3.googleusercontent.com/d/1FXGXBZcts9bp3XdPmqI_pGytI0GAKYDc',
        shortSummary:
          'Altay closes in on Ender as suspicion deepens around Azra and Korkut corners Yahya.',
        accessType: 'free',
        isPublished: true,
      },
      {
        slug: 'episode-187',
        number: 187,
        title: 'Teskilat Season 7 Episode 187 (Bolum 187)',
        duration: '2h 25m',
        releaseDate: '2026-10-03',
        thumbnail: 'https://lh3.googleusercontent.com/d/1Yuogsbnt87ZRWK28sOju1Mx5n2bz9ztw',
        shortSummary:
          'Azra’s apparent betrayal leaves the team navigating new traps as Bahar faces an extreme loyalty test.',
        accessType: 'free',
        isPublished: true,
      },
      {
        slug: 'episode-186',
        number: 186,
        title: 'Teskilat Season 7 Episode 186 (Bolum 186)',
        duration: '2h 18m',
        releaseDate: '2026-09-28',
        thumbnail: '/images/teskialt186thumbnIL.webp',
        shortSummary:
          'Following Ender’s abduction, Altay returns to confront Tuğrul Başkan and reignite the operation.',
        accessType: 'free',
        isPublished: true,
      },
    ],
  },
  {
    id: 'mehmed-fetihler-sultani',
    title: 'Mehmed: Fetihler Sultanı',
    urduTitle: 'مہمد: فتحلر سلطان',
    seasonLabel: 'Season 4',
    genreLabel: 'Historical Epic',
    languageLabel: 'Urdu Dubbed',
    languageLabelUr: 'اردو ڈبنگ',
    vipEligible: true,
    posterUrl: 'https://lh3.googleusercontent.com/d/1Je_-r1ngLfH15ryeju3suvZC2W0YSTL1',
    fallbackPosterUrl: '/images/MEHMED.webp',
    synopsis:
      'Sultan Mehmed II commands imperial campaigns, strategic sieges, and statecraft in the grand Ottoman historical saga.',
    hubPath: '/mehmed-fetihler-sultani',
    episodes: [
      {
        slug: 'episode-92',
        number: 92,
        title: 'Mehmed: Fetihler Sultanı Episode 92 (Bolum 92) — Urdu',
        duration: '2h 35m',
        releaseDate: '2026-11-20',
        thumbnail: 'https://lh3.googleusercontent.com/d/1Sbsk_-Vt-pU9iXU32sPF6l_c6w_jPNNe',
        shortSummary:
          'Sultan Mehmed II advances the next decisive chapter in Urdu HD — exclusive for FEVIQO Premium Members.',
        accessType: 'premium',
        isPublished: true,
        requiredPlanLevel: 'any_active',
      },
      {
        slug: 'episode-91',
        number: 91,
        title: 'Mehmed: Fetihler Sultanı Episode 91 (Bolum 91) — Urdu Dubbed',
        duration: '2h 34m',
        releaseDate: '2026-11-10',
        thumbnail: 'https://lh3.googleusercontent.com/d/1Je_-r1ngLfH15ryeju3suvZC2W0YSTL1',
        shortSummary:
          'Sultan Mehmed II launches a high-stakes covert siege campaign in Urdu Dubbed HD — exclusive for FEVIQO Premium Members.',
        accessType: 'premium',
        isPublished: true,
        requiredPlanLevel: 'any_active',
      },
      {
        slug: 'episode-90',
        number: 90,
        title: 'Mehmed: Fetihler Sultanı Episode 90 (Bolum 90)',
        duration: '2h 35m',
        releaseDate: '2026-10-28',
        thumbnail: 'https://lh3.googleusercontent.com/d/1Ql7rSRtgL6HfxOyO-BSfPN8CdfUooJ1p',
        shortSummary:
          'Sultan Mehmed II confronts a decisive imperial crisis as rival armies assemble and secret betrayals unfold.',
        accessType: 'free',
        isPublished: true,
      },
      {
        slug: 'episode-89',
        number: 89,
        title: 'Mehmed: Fetihler Sultanı Episode 89 (Bolum 89)',
        duration: '2h 32m',
        releaseDate: '2026-10-21',
        thumbnail: 'https://lh3.googleusercontent.com/d/15DClk9e82Zvbxbjx4_wOMcSa298IFcR5',
        shortSummary:
          'A tactical Ottoman siege collides with shifting alliances across the frontier.',
        accessType: 'free',
        isPublished: true,
      },
      {
        slug: 'episode-88',
        number: 88,
        title: 'Mehmed: Fetihler Sultanı Episode 88 (Bolum 88)',
        duration: '2h 30m',
        releaseDate: '2026-10-14',
        thumbnail: 'https://lh3.googleusercontent.com/d/1w3UK-ZWuESJb-S4r-J_ChUTknl-yaWSq',
        shortSummary:
          'Imperial court rivalries escalate as Mehmed prepares the next military campaign.',
        accessType: 'free',
        isPublished: true,
      },
      {
        slug: 'episode-87',
        number: 87,
        title: 'Mehmed: Fetihler Sultanı Episode 87 (Bolum 87)',
        duration: '2h 30m',
        releaseDate: '2026-10-06',
        thumbnail: 'https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg',
        shortSummary:
          'Saruca comes under ambush while Gedik Ahmed Pasha faces grave peril in Tabriz.',
        accessType: 'free',
        isPublished: true,
      },
    ],
  },
  {
    id: 'gunesin-dogdugu-yer',
    title: 'Güneşin Doğduğu Yer',
    urduTitle: 'گنیشین دوغدوغو یر',
    seasonLabel: 'Season 1',
    genreLabel: 'Family Drama',
    languageLabel: 'Urdu Dubbed',
    languageLabelUr: 'اردو ڈبنگ',
    vipEligible: true,
    posterUrl: 'https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh',
    fallbackPosterUrl: '/images/posters/poster-horiz-narrative-storytelling.jpg',
    synopsis:
      'Set across Anatolian heartlands, deep-rooted family loyalties and unspoken secrets test love, pride, and survival.',
    hubPath: '/gunesin-dogdugu-yer',
    episodes: [
      {
        slug: 'episode-9',
        number: 9,
        title: 'Güneşin Doğduğu Yer Episode 9 (Bolum 9) — Urdu Dubbed',
        duration: '2h 30m',
        releaseDate: '2026-11-21',
        thumbnail: 'https://lh3.googleusercontent.com/d/1UikNqWzQcGxbQx8sSqgjaTDN47iGhxgd',
        shortSummary:
          'Güneşin Doğduğu Yer Episode 9 in Urdu Dubbed HD raises every family rivalry to a dramatic climax — exclusive for FEVIQO Premium Members.',
        accessType: 'premium',
        isPublished: true,
        requiredPlanLevel: 'any_active',
      },
      {
        slug: 'episode-8',
        number: 8,
        title: 'Güneşin Doğduğu Yer Episode 8 (Bolum 8) — Urdu Dubbed',
        duration: '2h 28m',
        releaseDate: '2026-11-10',
        thumbnail: 'https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh',
        shortSummary:
          'A pivotal family confrontation changes every alliance in Episode 8 Urdu Dubbed HD — exclusive for FEVIQO Premium Members.',
        accessType: 'premium',
        isPublished: true,
        requiredPlanLevel: 'any_active',
      },
      {
        slug: 'episode-7',
        number: 7,
        title: 'Güneşin Doğduğu Yer Episode 7 (Bolum 7)',
        duration: '2h 25m',
        releaseDate: '2026-10-24',
        thumbnail: 'https://lh3.googleusercontent.com/d/137w7jkmYW4bpn4rfdipcJ4gJksnpqeL4',
        shortSummary:
          'Hidden family truths come to light as regional rivalries reach a turning point.',
        accessType: 'free',
        isPublished: true,
      },
      {
        slug: 'episode-5',
        number: 5,
        title: 'Güneşin Doğduğu Yer Episode 5 (Bolum 5)',
        duration: '2h 25m',
        releaseDate: '2026-10-16',
        thumbnail: 'https://lh3.googleusercontent.com/d/1ww1YXzsV-PBId4z9g6oPZSYHVXiDOiPO',
        shortSummary:
          'High-stakes household tensions and quiet betrayals push every bond to its limit.',
        accessType: 'free',
        isPublished: true,
      },
      {
        slug: 'episode-4',
        number: 4,
        title: 'Güneşin Doğduğu Yer Episode 4 (Bolum 4)',
        duration: '2h 25m',
        releaseDate: '2026-10-08',
        thumbnail: 'https://lh3.googleusercontent.com/d/1KaS-64iPUBSZ2gtZ3B2tj3bwmAUFa6gV',
        shortSummary:
          'New confrontations threaten fragile alliances across both families.',
        accessType: 'free',
        isPublished: true,
      },
      {
        slug: 'episode-3',
        number: 3,
        title: 'Güneşin Doğduğu Yer Episode 3 (Bolum 3)',
        duration: '2h 25m',
        releaseDate: '2026-10-01',
        thumbnail: 'https://lh3.googleusercontent.com/d/1VsQl3XReqSBLh5sk5UbalpsaVoSs0ggj',
        shortSummary:
          'Lovers caught between competing family histories face an unavoidable choice.',
        accessType: 'free',
        isPublished: true,
      },
    ],
  },
];

export interface MembershipPolicyItem {
  id: string;
  title: string;
  description: string;
}

export const MEMBERSHIP_POLICIES: MembershipPolicyItem[] = [
  {
    id: 'new-episodes',
    title: 'New Episodes',
    description:
      'Every new eligible episode published for your selected drama(s) during an active membership period is unlocked automatically at no extra charge.',
  },
  {
    id: 'membership-duration',
    title: 'Membership Duration',
    description:
      'Starter provides 15 days of access from the exact activation timestamp, while Standard, Plus, and VIP provide 30 full days.',
  },
  {
    id: 'personal-account',
    title: 'Personal Account',
    description:
      'Memberships are bound to an individual FEVIQO account protected by email and password or verified Google sign-in.',
  },
  {
    id: 'cancellation',
    title: 'Cancellation',
    description:
      'You can cancel your active membership directly from My Account at any time. Cancelled memberships immediately end active streaming access.',
  },
  {
    id: 'renewal',
    title: 'Renewal',
    description:
      'Renew before expiry to add duration onto your remaining days without losing continuous access, or renew any time after expiry.',
  },
  {
    id: 'drama-selection',
    title: 'Drama Selection',
    description:
      'Starter and Standard include 1 chosen series, Plus includes 2 chosen series, and VIP includes 3 chosen series.',
  },
  {
    id: 'episode-availability',
    title: 'Episode Availability',
    description:
      'All currently published episodes for your included drama(s) are immediately streamable upon activation across every drama page.',
  },
];

export interface MembershipFaqItem {
  id: string;
  question: string;
  answer: string;
}

export const MEMBERSHIP_FAQS: MembershipFaqItem[] = [
  {
    id: 'q1',
    question: 'Q1. What is included in a FEVIQO Premium Membership?',
    answer:
      'A FEVIQO Premium Membership gives your personal account access to Urdu-dubbed Turkish drama episodes for the dramas included in your chosen plan, unlocked directly on every drama page and in My Account.',
  },
  {
    id: 'q2',
    question: 'Q2. How do Starter, Standard, Plus, and VIP plans differ?',
    answer:
      'Starter (PKR 299 / $1.20 USD) covers 1 selected drama for 15 days. Standard (PKR 599 / $2.50 USD) covers 1 selected drama for 30 days. Plus (PKR 899 / $3.50 USD) lets you select any 2 dramas for 30 days. VIP (PKR 1,299 / $5.00 USD) lets you select any 3 dramas for 30 days.',
  },
  {
    id: 'q3',
    question: 'Q3. Can international viewers pay with Binance QR in USD?',
    answer:
      'Yes. International viewers can select International — Pay in USD to pay via Binance QR in exact USD, while Pakistani viewers can pay in PKR using Bank QR.',
  },
  {
    id: 'q4',
    question: 'Q4. How do locked episodes unlock across drama pages?',
    answer:
      'Once your payment is approved by our verification team, simply sign in and click any locked episode on Yeralti - Urdu Dub, Teşkilat, Güneşin Doğduğu Yer, Mehmed: Fetihler Sultanı, or future series pages to stream automatically.',
  },
  {
    id: 'q5',
    question: 'Q5. When does my 15-day or 30-day countdown begin?',
    answer:
      'Your membership duration starts from the verified activation timestamp once payment confirmation is approved—never while an order is still awaiting verification.',
  },
  {
    id: 'q6',
    question: 'Q6. What happens if I renew early before my plan expires?',
    answer:
      'Early renewal keeps your existing access active while pending verification and adds the new plan duration directly onto your existing expiry date once approved.',
  },
  {
    id: 'q7',
    question: 'Q7. What happens when my membership expires or is cancelled?',
    answer:
      'Protected episode streaming is automatically locked once a membership expires or is cancelled. Your account, history, and renewal options remain ready in My Account.',
  },
  {
    id: 'q8',
    question: 'Q8. Can I hold separate drama plans or upgrade to VIP?',
    answer:
      'Yes. Adding a plan for another drama preserves your existing active drama membership and remaining days without overwriting it.',
  },
];

export function getPlanById(planId: string): MembershipPlan | undefined {
  return MEMBERSHIP_PLANS.find((p) => p.id === planId);
}

export function getDramaById(dramaId: string): CatalogDramaMeta | undefined {
  return MEMBERSHIP_DRAMAS.find((d) => d.id === dramaId);
}

export function getEpisodeMeta(
  dramaId: string,
  episodeSlug: string
): CatalogEpisodeMeta | undefined {
  const drama = getDramaById(dramaId);
  if (!drama) return undefined;
  return drama.episodes.find((e) => e.slug === episodeSlug);
}

export function isEpisodePremium(dramaId: string, episodeSlug: string): boolean {
  const ep = getEpisodeMeta(dramaId, episodeSlug);
  return Boolean(ep && ep.accessType === 'premium');
}

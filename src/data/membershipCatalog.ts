export type MembershipPlanId = 'starter' | 'standard' | 'plus' | 'vip';

export interface MembershipPlan {
  id: MembershipPlanId;
  name: string;
  pricePkr: number;
  priceDisplay: string;
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
}

export interface CatalogDramaMeta {
  id: 'teskilat' | 'mehmed-fetihler-sultani' | 'gunesin-dogdugu-yer';
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

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    pricePkr: 299,
    priceDisplay: 'PKR 299',
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
    durationDays: 30,
    durationLabel: '30 Days',
    dramaLimit: 'all',
    inclusionText: 'All eligible VIP catalogue dramas',
    summary: 'Unrestricted 30-day access across the entire eligible VIP Urdu drama catalogue.',
    ctaLabel: 'Choose VIP',
  },
];

export const MEMBERSHIP_DRAMAS: CatalogDramaMeta[] = [
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
        slug: 'episode-189',
        number: 189,
        title: 'Teskilat Season 7 Episode 189 (Bolum 189)',
        duration: '2h 25m',
        releaseDate: '2026-10-18',
        thumbnail: 'https://lh3.googleusercontent.com/d/15lsrpRxnIw6C491oFLSXMXCC50o2ByfC',
        shortSummary:
          'Framed for high treason, Altay escapes custody to expose an AI conspiracy before a climactic confrontation in Switzerland.',
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
        slug: 'episode-90',
        number: 90,
        title: 'Mehmed: Fetihler Sultanı Episode 90 (Bolum 90)',
        duration: '2h 35m',
        releaseDate: '2026-10-28',
        thumbnail: 'https://lh3.googleusercontent.com/d/1Ql7rSRtgL6HfxOyO-BSfPN8CdfUooJ1p',
        shortSummary:
          'Sultan Mehmed II confronts a decisive imperial crisis as rival armies assemble and secret betrayals unfold.',
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
        slug: 'episode-7',
        number: 7,
        title: 'Güneşin Doğduğu Yer Episode 7 (Bolum 7)',
        duration: '2h 25m',
        releaseDate: '2026-10-24',
        thumbnail: 'https://lh3.googleusercontent.com/d/137w7jkmYW4bpn4rfdipcJ4gJksnpqeL4',
        shortSummary:
          'Hidden family truths come to light as regional rivalries reach a turning point.',
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
      'Memberships are bound to an individual FEVIQO account protected by email and password authentication for personal household viewing.',
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
      'When your 15-day or 30-day term expires, you can renew the same plan or switch tiers and drama selections cleanly from My Account.',
  },
  {
    id: 'drama-selection',
    title: 'Drama Selection',
    description:
      'Starter and Standard include 1 chosen series, Plus includes 2 chosen series, and VIP opens all eligible VIP catalogue dramas simultaneously.',
  },
  {
    id: 'episode-availability',
    title: 'Episode Availability',
    description:
      'All currently published episodes for your included drama(s) are immediately streamable upon activation, alongside upcoming episodes released during your term.',
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
      'A FEVIQO Premium Membership gives your personal account access to Urdu-dubbed Turkish drama episodes for the dramas included in your chosen plan, with automatic access to newly added eligible episodes while your membership is active.',
  },
  {
    id: 'q2',
    question: 'Q2. How do Starter, Standard, Plus, and VIP plans differ?',
    answer:
      'Starter (PKR 299) covers 1 selected drama for 15 days. Standard (PKR 599) covers 1 selected drama for 30 days. Plus (PKR 899) lets you select any 2 dramas for 30 days. VIP (PKR 1,299) includes all eligible VIP catalogue dramas for 30 days.',
  },
  {
    id: 'q3',
    question: 'Q3. How do I choose which dramas I want to watch?',
    answer:
      'After clicking a membership plan button on this page, the interactive drama selector lets you pick exact series matching your plan limit before proceeding to account sign-in and checkout verification.',
  },
  {
    id: 'q4',
    question: 'Q4. Will I get new episodes released during my active membership?',
    answer:
      'Yes. As new eligible episodes are published for the drama(s) linked to your active membership, they become available inside your My Account library right away.',
  },
  {
    id: 'q5',
    question: 'Q5. When does my 15-day or 30-day countdown begin?',
    answer:
      'Your membership duration starts from the verified activation timestamp once payment confirmation is completed—never while an order is still awaiting payment verification.',
  },
  {
    id: 'q6',
    question: 'Q6. Can I cancel my membership from my account?',
    answer:
      'Yes. Inside My Account, you can cancel your active membership immediately. Cancellation revokes protected streaming access right away and records the change in your membership history.',
  },
  {
    id: 'q7',
    question: 'Q7. What happens when my membership expires or is cancelled?',
    answer:
      'Protected episode streaming is automatically restricted once a membership expires or is cancelled. Your account and membership history remain intact so you can renew or select a new plan whenever you return.',
  },
  {
    id: 'q8',
    question: 'Q8. Can I upgrade or change dramas when renewing?',
    answer:
      'Yes. When you renew or start a new membership cycle, you can pick a different tier—such as moving from Standard to Plus or VIP—or select a fresh combination of dramas.',
  },
];

export function getPlanById(planId: string): MembershipPlan | undefined {
  return MEMBERSHIP_PLANS.find((p) => p.id === planId);
}

export function getDramaById(dramaId: string): CatalogDramaMeta | undefined {
  return MEMBERSHIP_DRAMAS.find((d) => d.id === dramaId);
}

// Data model for "Yeralti - Urdu Dub" (Urdu: جرائم کی دنیا)

export const YERALTI_POSTER_URL =
  'https://lh3.googleusercontent.com/d/1hU7IkIPWRZ0uSuDhU_azx-TXyEbzxvqQ';
export const YERALTI_LOGO_URL =
  'https://lh3.googleusercontent.com/d/1jmHrNp_0f1fJn3ASAoFqlUJHaOKaikUC';

export interface YeraltiSeries {
  title: string;
  urduTitle: string;
  altTitles: string[];
  slug: string;
  poster: string;
  backdrop: string;
  logoUrl: string;
  synopsis: string;
  genres: string[];
  network: string;
  year: string;
  language: string;
  dubLanguage: string;
  status: string;
}

export interface YeraltiEpisode {
  number: number;
  slug: string;
  title: string;
  urduTitle: string;
  airDate: string;
  thumbnail: string;
  duration: string;
  shortSummary: string;
  recap: string;
  embeds: { label: string; src: string }[];
  season: number;
  isLockedPremium: boolean;
}

export const YERALTI_SERIES_DATA: YeraltiSeries = {
  title: 'Yeralti - Urdu Dub',
  urduTitle: 'جرائم کی دنیا',
  altTitles: [
    'Yeralti Urdu Dub',
    'Yeralti Urdu Dubbed',
    'Yeralti Turkish Drama Urdu',
    'جرائم کی دنیا اردو ڈبنگ',
  ],
  slug: 'yeralti',
  poster: YERALTI_POSTER_URL,
  backdrop: YERALTI_POSTER_URL,
  logoUrl: YERALTI_LOGO_URL,
  synopsis:
    'Yeralti - Urdu Dub (جرائم کی دنیا) pulls you deep into the ruthless criminal underworld where loyalty is tested by blood, power is claimed in the shadows, and every alliance hides a deadly betrayal. Watch exclusive Urdu Dubbed HD episodes on FEVIQO Premium.',
  genres: ['Crime', 'Action', 'Thriller'],
  network: 'FEVIQO Urdu Dub Exclusive',
  year: '2026',
  language: 'Turkish (Urdu Dubbed)',
  dubLanguage: 'Urdu Dubbed',
  status: 'Ongoing · Premium Exclusive',
};

export const YERALTI_EPISODES: YeraltiEpisode[] = [
  {
    number: 23,
    slug: 'episode-23',
    title: 'Yeralti - Urdu Dub Episode 23 | جرائم کی دنیا قسط 23',
    urduTitle: 'جرائم کی دنیا قسط 23 — اردو ڈبنگ',
    airDate: '2026-11-21T04:00:00.000Z',
    thumbnail: YERALTI_POSTER_URL,
    duration: '2h 15m',
    shortSummary:
      'Step into the criminal underworld in Yeralti - Urdu Dub (جرائم کی دنیا) Episode 23 in Urdu Dubbed HD — exclusive for FEVIQO Premium Members.',
    recap: `Yeralti - Urdu Dub (جرائم کی دنیا) Episode 23 unfolds inside a hidden empire of crime, betrayal, and high-stakes power struggles where survival demands absolute loyalty.\n\nThis Urdu Dubbed HD series is exclusively locked for FEVIQO Premium Members. Activate an eligible plan covering Yeralti - Urdu Dub or VIP to unlock full streaming access.`,
    embeds: [],
    season: 1,
    isLockedPremium: true,
  },
];

// Data model for "Gunesin Dogdugu Yer" (Urdu: گنیشین دوغدوغو یر)
// Only features Episode 3 as requested by the user.

export interface GunesinSeries {
  title: string;
  urduTitle: string;
  altTitles: string[];
  slug: string;
  poster: string;
  backdrop: string;
  synopsis: string;
  genres: string[];
  cast: string[];
  network: string;
  year: string;
  language: string;
  subtitleLanguage: string;
  status: string;
}

export interface GunesinEpisode {
  number: number;
  slug: string;
  title: string;
  airDate: string; // ISO date format
  thumbnail: string;
  duration: string;
  shortSummary: string;
  recap: string; // 3-5 paragraphs, formatted with double newlines
  embeds: { label: string; src: string }[];
  season: number;
}

export const GUNESIN_SERIES_DATA: GunesinSeries = {
  title: "Gunesin Dogdugu Yer",
  urduTitle: "گنیشین دوغدوغو یر",
  altTitles: [
    "Gunesin Dogdugu Yer Urdu Subtitles",
    "Gunesin Dogdugu Yer Urdu",
    "Gunesin Dogdugu Yer Bolum 3",
    "Where the Sun Rises Urdu"
  ],
  slug: "gunesin-dogdugu-yer",
  poster: "https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh", // Official high-quality poster
  backdrop: "https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh", // Official high-quality backdrop
  synopsis: "Gunesin Dogdugu Yer is an intense and gripping modern Turkish drama that explores family secrets, deep-rooted betrayals, and the cost of loyalty. Follow the journey of characters fighting for truth in a world governed by deception. Stream every episode in ultra HD 1080p with premium Urdu subtitles exclusively on FEVIQO.",
  genres: ["Drama", "Mystery", "Thriller"],
  // TODO: Add real cast members list once confirmed
  cast: [
    "Cast Member 1 (To be updated)",
    "Cast Member 2 (To be updated)",
    "Cast Member 3 (To be updated)"
  ],
  network: "TRT 1",
  year: "2026",
  language: "Turkish",
  subtitleLanguage: "Urdu",
  status: "Ongoing"
};

export const GUNESIN_EPISODES: GunesinEpisode[] = [
  {
    number: 3,
    slug: "episode-3",
    title: "Gunesin Dogdugu Yer Episode 3 Urdu Subtitles",
    // TODO: Add official air date in ISO format
    airDate: "2026-10-15T18:00:00+00:00",
    thumbnail: "https://lh3.googleusercontent.com/d/1VsQl3XReqSBLh5sk5UbalpsaVoSs0ggj", // Official high-quality thumbnail
    duration: "2h 25m",
    shortSummary: "Episode 3 marks the high-stakes premiere of Gunesin Dogdugu Yer on FEVIQO. Characters cross paths under mysterious circumstances as the foundation of an intricate web of secrets is laid out.",
    // TODO: Fill in the actual plot details once the episode is officially released
    recap: `Gunesin Dogdugu Yer Episode 3 (Bolum 3) launches this incredible new series with massive suspense. The narrative introduces the core family conflicts, defining the relationships and long-standing rivalries that will shape the season. Characters find themselves drawn together in a high-stakes meeting where secrets can no longer be hidden.

As the story unfolds, the primary protagonist is forced to make a difficult choice between keeping their family safe and exposing a dark, hidden truth. Every action creates an immediate reaction from rival groups, raising the stakes to an absolute maximum.

The climax of Gunesin Dogdugu Yer Episode 3 sets the stage for a dangerous intelligence and personal war, leaving viewers on a massive cliffhanger. Who can be trusted when everyone has something to hide? Find out in the next episode.`,
    embeds: [
      {
        label: "Server 1 (Fast HLS)",
        src: "https://stream.mux.com/ff2G9XfcMerNcnD02iPnysGkByH6SMTSa7p2yP01DuzT4.m3u8"
      }
    ],
    season: 1
  }
];

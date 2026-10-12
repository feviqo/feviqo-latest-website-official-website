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
    number: 5,
    slug: "episode-5",
    title: "Gunesin Dogdugu Yer Episode 5 Urdu Subtitles | Bolum 5",
    airDate: "2026-10-16T04:00:00.000Z",
    thumbnail: "https://lh3.googleusercontent.com/d/1BINiXNmXNm9hIozv0PsowyTYBuP2NSYO",
    duration: "2h 25m",
    shortSummary: "Watch Gunesin Dogdugu Yer Episode 5 Urdu Subtitles (Bolum 5) in HD on FEVIQO. High-stakes betrayals and hidden secrets reach an explosive peak in the new episode.",
    recap: `Gunesin Dogdugu Yer Episode 5 (Bolum 5) delivers an intense continuation filled with high-stakes suspense and dramatic turnarounds. As family rivalries reach an absolute boiling point, hidden motives are brought directly into the light.

In this explosive new installment, the core characters must navigate betrayal from close allies while fighting to protect their legacy. Every choice triggers immediate consequences across the entire network, keeping viewers on the edge of their seats.

Watch Gunesin Dogdugu Yer Episode 5 with Urdu Subtitles in full 1080p HD exclusively on FEVIQO. Experience the latest episode of this captivating Turkish drama.`,
    embeds: [
      {
        label: "Server 1 (Fast HLS 1080p)",
        src: "https://stream.mux.com/Ck3e005cjwlomj37YDhAp2WFDcwAOcpGsPLagVVtxaVU.m3u8"
      }
    ],
    season: 1
  },
  {
    number: 4,
    slug: "episode-4",
    title: "Gunesin Dogdugu Yer Episode 4 Urdu Subtitles",
    airDate: "2026-10-22T18:00:00+00:00",
    thumbnail: "https://lh3.googleusercontent.com/d/1KaS-64iPUBSZ2gtZ3B2tj3bwmAUFa6gV",
    duration: "2h 25m",
    shortSummary: "Episode 4 continues the intense action in Gunesin Dogdugu Yer on FEVIQO. Major revelations unfold as family secrets and rivalries escalate to a dramatic peak.",
    recap: `Gunesin Dogdugu Yer Episode 4 (Bolum 4) delivers an incredible continuation filled with massive suspense. The narrative deepens the core family conflicts, testing the relationships and long-standing rivalries that define the season. Characters find themselves drawn together in a high-stakes confrontation where secrets can no longer be hidden.

As the story unfolds, the primary protagonist is forced to make a critical choice between protecting their allies and exposing a dark, hidden truth. Every action creates an immediate reaction from rival factions, raising the stakes to an absolute maximum.

The climax of Gunesin Dogdugu Yer Episode 4 sets the stage for dangerous new twists, leaving viewers eagerly anticipating the next chapter. Who can be trusted when everyone has something to hide? Stream Gunesin Dogdugu Yer Episode 4 with Urdu Subtitles on FEVIQO.`,
    embeds: [
      {
        label: "Server 1 (Fast HLS 1080p)",
        src: "https://stream.mux.com/Ck3e005cjwlomj37YDhAp2WFDcwAOcpGsPLagVVtxaVU.m3u8"
      }
    ],
    season: 1
  },
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
  },
  {
    number: 2,
    slug: "episode-2",
    title: "Gunesin Dogdugu Yer Episode 2 Urdu Subtitles",
    airDate: "2026-10-08T18:00:00+00:00",
    thumbnail: "https://feviqo.com/images/teskialt186thumbnIL.png",
    duration: "2h 20m",
    shortSummary: "Watch Gunesin Dogdugu Yer Episode 2 with Urdu Subtitles (Bolum 2) in HD on FEVIQO. Suspense builds as alliances are tested and hidden secrets come to light.",
    recap: `Gunesin Dogdugu Yer Episode 2 (Bolum 2) continues the dramatic saga with high tension and gripping developments. Secrets from the past begin to unravel as key families face unexpected challenges.

In this chapter, the narrative uncovers hidden motives while main characters fight to protect their loved ones. High-definition streaming with clear Urdu subtitles available exclusively on FEVIQO.`,
    embeds: [
      {
        label: "Server 1 (Fast HLS 1080p)",
        src: "https://stream.mux.com/E86ii2Lygy3OfAk01CPlos02ln008Gkl9ar3gQJBQtd8WU.m3u8"
      }
    ],
    season: 1
  },
  {
    number: 1,
    slug: "episode-1",
    title: "Gunesin Dogdugu Yer Episode 1 Urdu Subtitles",
    airDate: "2026-10-01T18:00:00+00:00",
    thumbnail: "https://lh3.googleusercontent.com/d/1K4RcO4j7hkWQ1Au3fvSAQodakty5nfFh",
    duration: "2h 18m",
    shortSummary: "Watch Gunesin Dogdugu Yer Episode 1 Series Premiere with Urdu Subtitles (Bolum 1) in HD on FEVIQO.",
    recap: `Gunesin Dogdugu Yer Episode 1 (Bolum 1) introduces viewers to a world of passion, secrets, and high-stakes family drama. Set against breathtaking landscapes, the premiere episode establishes the core characters and the rivalries that drive the series.

Stream Gunesin Dogdugu Yer Episode 1 with full Urdu Subtitles in 1080p HD on FEVIQO.com.`,
    embeds: [
      {
        label: "Server 1 (Fast HLS 1080p)",
        src: "https://stream.mux.com/ff2G9XfcMerNcnD02iPnysGkByH6SMTSa7p2yP01DuzT4.m3u8"
      }
    ],
    season: 1
  }
];

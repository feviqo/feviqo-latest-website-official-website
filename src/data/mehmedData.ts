// Data model for "Mehmed: Fetihler Sultani" (Urdu: مہمد فتحلر سلطان / سلطان محمد فاتح)
// Features Episode 87 (Season 4 Episode 4) as requested.

export interface MehmedSeries {
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

export interface MehmedEpisode {
  number: number;
  season: number;
  seasonEpisodeNumber: number;
  slug: string;
  title: string;
  airDate: string; // ISO date format
  thumbnail: string;
  duration: string;
  shortSummary: string;
  recap: string;
  recapUrdu?: string;
  embeds: { label: string; src: string }[];
}

export const MEHMED_SERIES_DATA: MehmedSeries = {
  title: "Mehmed: Fetihler Sultani",
  urduTitle: "مہمد فتحلر سلطان",
  altTitles: [
    "Mehmed Fetihler Sultani Urdu Subtitles",
    "Sultan Mehmed Series Urdu",
    "Fatih Sultan Mehmed Series",
    "Sultan Muhammad Fateh Bolum 87",
    "Mehmed Season 4 Urdu Subtitles"
  ],
  slug: "mehmed-fetihler-sultani",
  poster: "https://lh3.googleusercontent.com/d/1Je_-r1ngLfH15ryeju3suvZC2W0YSTL1",
  backdrop: "https://lh3.googleusercontent.com/d/1Je_-r1ngLfH15ryeju3suvZC2W0YSTL1",
  synopsis: "Mehmed: Fetihler Sultani (Mehmed Season 4) chronicles the epic life and military genius of Sultan Mehmed II, the Conqueror of Constantinople. Experience grand Ottoman historical warfare, royal court intrigue, high-stakes diplomacy in Tabriz, and intense battles with full HD Urdu Subtitles on FEVIQO.",
  genres: ["Historical", "Action", "Drama", "War"],
  cast: [
    "Serkan Çayoğlu (Sultan Mehmed II)",
    "Selim Bayraktar (Çandarlı Halil Pasha)",
    "Fikret Kuşkan",
    "Tuba Ünsal",
    "Sezin Akbaşoğulları"
  ],
  network: "TRT 1",
  year: "2026",
  language: "Turkish",
  subtitleLanguage: "Urdu",
  status: "Ongoing"
};

export const MEHMED_EPISODES: MehmedEpisode[] = [
  {
    number: 88,
    season: 4,
    seasonEpisodeNumber: 5,
    slug: "episode-88",
    title: "Mehmed Season 4 Episode 5 Urdu Subtitles | Bolum 88",
    airDate: "2026-10-14T04:00:00.000Z",
    thumbnail: "https://lh3.googleusercontent.com/d/1w3UK-ZWuESJb-S4r-J_ChUTknl-yaWSq",
    duration: "2h 30m",
    shortSummary: "Watch Mehmed Fetihler Sultani Episode 88 Urdu Subtitles (Bolum 88) in HD on FEVIQO. Sultan Mehmed II prepares an explosive military advance as court rivalries escalate.",
    recap: `Mehmed: Fetihler Sultani Episode 88 (Bolum 88) opens with high-stakes Ottoman military warfare and court intrigue. As Sultan Mehmed II prepares an imperial campaign against rival coalitions, tactical intelligence and frontline courage determine the fate of the empire.

Diplomatic Warfare & Imperial Strategy
Gedik Ahmed Pasha and Saruca Pasha face deadly political traps on the frontier, navigating enemy ambushes and shifting alliances. Meanwhile in Edirne, the Conqueror enforces strict military discipline and roots out hidden threats within the imperial council.

Watch Mehmed Fetihler Sultani Episode 88 with Urdu Subtitles in full 1080p HD on FEVIQO. Experience the grand historical drama and epic battles of Sultan Mehmed II.`,
    recapUrdu: `مہمد فتحلر سلطان سیزن 4 قسط 88 (بولم 88) میں سلطان محمد فاتح کی سلطنت عثمانیہ کے زبردست جنگی اور سفارتی معرکے جاری ہیں۔ عثمانی افواج سرحدوں پر دشمنوں کے نادیدہ جال توڑتے ہوئے ایک بڑے معرکے کی تیاری کر رہی ہیں۔ مکمل قسط ایچ ڈی اردو سب ٹائٹلز کے ساتھ فیویکو پر دیکھیں۔`,
    embeds: [
      {
        label: "Server 1 (Fast HLS 1080p)",
        src: "https://stream.mux.com/CNLUrkuH54rxQm44KMrZUcUtKj15j4RcxAyyn2fzTpU.m3u8"
      }
    ]
  },
  {
    number: 87,
    season: 4,
    seasonEpisodeNumber: 4,
    slug: "episode-87",
    title: "Mehmed Season 4 Episode 4 Urdu Subtitles | Episode 87",
    airDate: "2026-10-06T18:00:00+00:00",
    thumbnail: "https://lh3.googleusercontent.com/d/1gtCE2KQ_rE4UyRLiE5NM1FpSBLVxZ9Xg",
    duration: "2h 30m",
    shortSummary: "Watch Mehmed Fetihler Sultani Season 4 Episode 4 Urdu Subtitles (Bolum 87). Saruca is attacked as Gedik Ahmed Pasha faces danger in Tabriz.",
    recap: `The Mountain Ambush: Saruca Pasha Under Fire
Mehmed: Fetihler Sultani Season 4 Episode 4 (Bolum 87) opens with intense historical warfare and high-stakes royal diplomacy. Saruca Pasha’s imperial convoy is ambushed along treacherous mountain defiles. Surrounded by rival forces attempting to capture state plans, Saruca Pasha and his elite Janissary guards mount a heroic defense to protect the Sultan’s command.

Diplomatic Danger in Tabriz: Gedik Ahmed Pasha’s Mission
Meanwhile in Tabriz, Gedik Ahmed Pasha finds himself in grave peril. Surrounded by hostile factions and scheming court viziers, Gedik Ahmed Pasha must use sharp intellect and diplomatic strategy to navigate deadly traps, preserve the Ottoman alliance, and prevent open war.

Sultan Mehmed II’s Imperial Strategy
In Edirne, Sultan Mehmed II accelerates preparation for imperial campaigns. Facing threats from both eastern borders and Western coalitions, the Conqueror enforces strict discipline across the military ranks while rooting out hidden traitors inside the council.

Key Episode Highlights:
- Saruca Pasha’s fierce survival battle against ambushers.
- Gedik Ahmed Pasha navigating deadly political intrigue in Tabriz.
- Sultan Mehmed II strengthening imperial defense lines and military strategy.
- High-octane battle choreography and emotional royal drama.`,
    recapUrdu: `مہمد فتحلر سلطان سیزن 4 قسط 87 (بولم 87) میں سلطان محمد فاتح کی سلطنت عثمانیہ کے زبردست جنگی اور سفارتی معرکے دکھائے گئے ہیں۔ ساروجا پاشا کے شاہی قافلے پر پہاڑی دروں میں اچانک حملہ ہو جاتا ہے جہاں وہ اپنے عثمانی محافظوں کے ساتھ بے مثال شجاعت کا مظاہرہ کرتے ہیں۔ دوسری طرف تبریز میں گدک احمد پاشا دشمن عناصر کے نادیدہ جال میں پھنس جاتے ہیں جہاں انہیں اپنی ذہانت سے سلطنت عثمانیہ کی بقا کی جنگ لڑنی پڑتی ہے۔ مکمل قسط ایچ ڈی اردو سب ٹائٹلز کے ساتھ فیویکو پر دیکھیں۔`,
    embeds: [
      {
        label: "Server 1 (Fast HLS)",
        src: "https://stream.mux.com/CNLUrkuH54rxQm44KMrZUcUtKj15j4RcxAyyn2fzTpU.m3u8"
      }
    ]
  }
];

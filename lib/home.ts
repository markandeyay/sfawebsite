import { getCeremonies, getKeyFilm, getFilmsForCeremony, CANONICAL_CATEGORIES } from "@/content";
import type { Ceremony, CategoryName, Film } from "@/content/types";

/** The most recent ceremony in the data. */
export function getLatestCeremony(): Ceremony | undefined {
  return getCeremonies().sort((a, b) => b.year - a.year)[0];
}

/**
 * The site's key film: the Best Picture winner of the latest ceremony
 * (Cannes gives each edition one piece of key art). Used for the hero and
 * for the link-preview image. Can have `still: null`; callers decide the
 * type-only fallback.
 */
export function getSiteKeyFilm(): Film {
  const ceremony = getLatestCeremony();
  if (!ceremony) throw new Error("No ceremony in content/awards.json; the site needs at least one.");
  return getKeyFilm(ceremony);
}

const WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
] as const;

/** One to fifteen as words, larger numbers as digits. */
export function numberWord(n: number, capitalize = false): string {
  const w = n >= 0 && n < WORDS.length ? WORDS[n] : String(n);
  return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}

export interface Highlight {
  film: Film;
  /** The most prestigious category the film won, by ceremony order. */
  category: CategoryName;
  wins: number;
}

export interface CeremonySummary {
  ceremony: Ceremony;
  /** Categories presented. */
  total: number;
  /** Distinct films that won at least once. */
  filmCount: number;
  /** The film with the most wins and its count. */
  lead: { film: Film; wins: number } | null;
  /** True only when the lead took at least half the categories and twice the runner-up. */
  sweep: boolean;
  /** One row per winning film: its top category, most prestigious first. */
  highlights: Highlight[];
}

/**
 * Everything the homepage says about the night, derived from awards.json.
 * Nothing here is hand-written per year: the sentence, the film count and
 * the highlight rows all fall out of the data.
 */
export function summarizeCeremony(ceremony: Ceremony): CeremonySummary {
  const films = getFilmsForCeremony(ceremony);
  const rank = (c: CategoryName) => CANONICAL_CATEGORIES.indexOf(c);
  const byFilm = new Map<string, { film: Film; wins: number; top: CategoryName }>();
  for (const cat of ceremony.categories) {
    const film = films.get(cat.winner.filmSlug);
    if (!film) continue;
    const entry = byFilm.get(film.slug);
    if (!entry) byFilm.set(film.slug, { film, wins: 1, top: cat.category });
    else {
      entry.wins += 1;
      if (rank(cat.category) > rank(entry.top)) entry.top = cat.category;
    }
  }
  const rows = [...byFilm.values()].sort((a, b) => rank(b.top) - rank(a.top) || b.wins - a.wins);
  const byWins = [...rows].sort((a, b) => b.wins - a.wins);
  const lead = byWins[0] ? { film: byWins[0].film, wins: byWins[0].wins } : null;
  const runnerUp = byWins[1]?.wins ?? 0;
  const total = ceremony.categories.length;
  const sweep = Boolean(lead && lead.wins >= Math.floor(total / 2) && lead.wins >= runnerUp * 2);
  return {
    ceremony,
    total,
    filmCount: rows.length,
    lead,
    sweep,
    highlights: rows.map(({ film, wins, top }) => ({ film, wins, category: top })),
  };
}

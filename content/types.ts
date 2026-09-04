/**
 * Content model types for the SFA site.
 *
 * The entire site is a pure function of `content/films.json` and
 * `content/awards.json`; these types describe both files and are enforced at
 * module load by `content/index.ts`.
 *
 * NORMALIZATION NOTE
 * ------------------
 * Award category names were inconsistent on the source site (sfa's old
 * homepage vs. its per-film pages). We normalize every occurrence to the
 * canonical list below. Specifically:
 *
 *   - "Best Directing" (film pages)  ->  "Best Director" (homepage)
 *   - "Best Hair & Makeup"           ->  "Best Hair and Makeup"
 *
 * Any category string that is not in CANONICAL_CATEGORIES is rejected by the
 * validator, so the seed data cannot drift back to the source spellings.
 */

/**
 * The fifteen 2025 award categories, in CEREMONY ORDER: the order they would
 * be presented on the night, ascending in prestige, with Best Picture last.
 * `awards.json` stores its categories in this same order.
 */
export const CANONICAL_CATEGORIES = [
  "Best Set Design",
  "Best Costume Design",
  "Best Hair and Makeup",
  "Best Sound Design",
  "Best Original Score",
  "Best Cinematography",
  "Best Editing",
  "Best Screenplay",
  "Audience Choice",
  "Best Supporting Actress",
  "Best Supporting Actor",
  "Best Lead Actress",
  "Best Lead Actor",
  "Best Director",
  "Best Picture",
] as const;

export type CategoryName = (typeof CANONICAL_CATEGORIES)[number];

/** Which production process a film came out of. */
export type Track = "studio" | "indie";

/**
 * Groups categories for presentation:
 *  - "craft":       Set Design, Costume Design, Hair and Makeup, Sound Design,
 *                   Original Score, Cinematography, Editing
 *  - "performance": the four acting awards
 *  - "picture":     Screenplay, Audience Choice, Director, Best Picture
 */
export type Department = "craft" | "performance" | "picture";

/** An award as recorded on a film. `person` is null when the award is film-level. */
export interface Award {
  category: CategoryName;
  person: string | null;
}

/** One line of a film's credit block, rendered in source order. */
export interface Credit {
  role: string;
  name: string;
}

/**
 * Paths (under /public) to the dithered and untreated stills. A film's
 * `still` is null when no frame is available at all (for 2025 that is
 * "At Last, the Gift", whose YouTube upload is private, so YouTube serves no
 * thumbnail). Components render a type-only frame in that case; nothing is
 * generated in its place (SFA_SYSTEM_DESIGN.md 9.4).
 */
export interface Still {
  treated: string;
  original: string;
}

export interface Film {
  slug: string;
  title: string;
  year: number;
  track: Track;
  director: string;
  logline: string;
  youtubeId: string;
  /** false = festival exclusivity; the embed is withheld. */
  viewable: boolean;
  /** Minutes, or null when unknown. */
  runtime: number | null;
  still: Still | null;
  awards: Award[];
  credits: Credit[];
}

/** Shared shape for a winner and for each nominee, so one component renders both. */
export interface WinnerEntry {
  filmSlug: string;
  person: string | null;
}

export interface AwardCategory {
  category: CategoryName;
  department: Department;
  winner: WinnerEntry;
  nominees: WinnerEntry[];
}

export interface Ceremony {
  year: number;
  categories: AwardCategory[];
}

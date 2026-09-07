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
 *
 * CATALOG NUMBERS (`Film.no`)
 * ---------------------------
 * Every film carries a catalog number: its position in production order
 * across all years, the way every Criterion release carries a spine number.
 * It renders as "No. 001" (`formatCatalogNumber` in ./index.ts pads it).
 *
 * The number is DATA, not a derivation. It is stored in films.json and is
 * never computed from array position, year, or slug, so reordering the file
 * or inserting a film cannot silently renumber the catalog.
 *
 * Status: PROVISIONAL. Only the 2025 slate is in the data. The club made
 * roughly 20-30 films between 2020 and 2024 that are not yet imported, and
 * production order within the 2025 slate was never published, so the twelve
 * 2025 films are numbered 1-12 in the order the club's own site listed them
 * (the seed table in SFA_SYSTEM_DESIGN.md 8.2: fdoc = 1 through
 * discrete-magematics = 12).
 *
 * When the 2020-2024 back catalog is imported, the whole catalog is
 * renumbered ONCE, in production order; the 2025 films then continue after
 * the last 2024 number. After that renumbering the archive is complete and a
 * film's number never changes again. Do not renumber for any other reason;
 * a new film takes the next number after the current highest.
 *
 * Invariants enforced by the validator in ./index.ts:
 *   - a positive integer, unique across films
 *   - contiguous from 1 with no gaps (as many numbers as films)
 *   - non-decreasing with `year` along the sequence (production order cannot
 *     put a 2025 film before a 2024 one)
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
 *
 * The pipeline writes a third rendition, `{slug}-treated-sm.webp`, at the
 * dither's native resolution for card-size use. It is derived from
 * `treated` by a fixed naming rule rather than stored here;
 * scripts/validate-content.ts checks all three files exist on disk.
 */
export interface Still {
  treated: string;
  original: string;
}

export interface Film {
  /** Catalog number, production order across all years. See the note above. */
  no: number;
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
  /**
   * When the ceremony was held, as prose ("May 2025"). A string because the
   * club published the month but never the day; do not upgrade this to a
   * date until a real one is known. Must name the ceremony year.
   */
  held: string;
  categories: AwardCategory[];
}

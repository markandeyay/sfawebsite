/**
 * Content access layer.
 *
 * Imports the two JSON seed files, validates them on module load (throwing a
 * descriptive Error on any problem so a malformed content file fails the
 * build loudly), and exposes typed accessors. No runtime dependencies.
 */

import filmsJson from "./films.json";
import awardsJson from "./awards.json";
import {
  CANONICAL_CATEGORIES,
  type AwardCategory,
  type Award,
  type CategoryName,
  type Ceremony,
  type Credit,
  type Department,
  type Film,
  type Still,
  type Track,
  type WinnerEntry,
} from "./types";

export * from "./types";

// ---------------------------------------------------------------------------
// Validation primitives
// ---------------------------------------------------------------------------

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const STILLS_PREFIX = "/stills/";
const TRACKS: readonly Track[] = ["studio", "indie"];
const DEPARTMENTS: readonly Department[] = ["craft", "performance", "picture"];
const CATEGORY_SET: ReadonlySet<string> = new Set(CANONICAL_CATEGORIES);

class ContentError extends Error {
  constructor(file: string, path: string, message: string) {
    super(`[content] ${file} at ${path}: ${message}`);
    this.name = "ContentError";
  }
}

function fail(file: string, path: string, message: string): never {
  throw new ContentError(file, path, message);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function describe(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function expectRecord(file: string, path: string, v: unknown): Record<string, unknown> {
  if (!isRecord(v)) fail(file, path, `expected object, got ${describe(v)}`);
  return v;
}

function expectArray(file: string, path: string, v: unknown): unknown[] {
  if (!Array.isArray(v)) fail(file, path, `expected array, got ${describe(v)}`);
  return v;
}

function expectString(file: string, path: string, v: unknown, nonEmpty = true): string {
  if (typeof v !== "string") fail(file, path, `expected string, got ${describe(v)}`);
  if (nonEmpty && v.trim() === "") fail(file, path, "expected non-empty string");
  return v;
}

function expectStringOrNull(file: string, path: string, v: unknown): string | null {
  if (v === null) return null;
  return expectString(file, path, v);
}

function expectInteger(file: string, path: string, v: unknown): number {
  if (typeof v !== "number" || !Number.isInteger(v)) {
    fail(file, path, `expected integer, got ${describe(v)}`);
  }
  return v;
}

function expectIntegerOrNull(file: string, path: string, v: unknown): number | null {
  if (v === null) return null;
  return expectInteger(file, path, v);
}

function expectBoolean(file: string, path: string, v: unknown): boolean {
  if (typeof v !== "boolean") fail(file, path, `expected boolean, got ${describe(v)}`);
  return v;
}

function expectOneOf<T extends string>(
  file: string,
  path: string,
  v: unknown,
  allowed: readonly T[],
): T {
  const s = expectString(file, path, v);
  if (!(allowed as readonly string[]).includes(s)) {
    fail(file, path, `expected one of ${allowed.map((a) => JSON.stringify(a)).join(", ")}, got ${JSON.stringify(s)}`);
  }
  return s as T;
}

function expectCategory(file: string, path: string, v: unknown): CategoryName {
  const s = expectString(file, path, v);
  if (!CATEGORY_SET.has(s)) {
    fail(file, path, `unknown award category ${JSON.stringify(s)}; must be one of the canonical names in content/types.ts`);
  }
  return s as CategoryName;
}

function rejectUnknownKeys(file: string, path: string, obj: Record<string, unknown>, allowed: readonly string[]): void {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) fail(file, `${path}.${key}`, "unexpected field");
  }
}

// ---------------------------------------------------------------------------
// films.json
// ---------------------------------------------------------------------------

const FILMS_FILE = "content/films.json";
const FILM_KEYS = [
  "slug", "title", "year", "track", "director", "logline", "youtubeId",
  "viewable", "runtime", "still", "awards", "credits",
] as const;

function parseStill(file: string, path: string, v: unknown, slug: string): Still {
  const o = expectRecord(file, path, v);
  rejectUnknownKeys(file, path, o, ["treated", "original"]);
  const still: Still = {
    treated: expectString(file, `${path}.treated`, o.treated),
    original: expectString(file, `${path}.original`, o.original),
  };
  for (const key of ["treated", "original"] as const) {
    if (!still[key].startsWith(STILLS_PREFIX)) {
      fail(file, `${path}.${key}`, `must start with ${JSON.stringify(STILLS_PREFIX)}, got ${JSON.stringify(still[key])}`);
    }
    if (!still[key].includes(slug)) {
      fail(file, `${path}.${key}`, `expected path to reference the film slug ${JSON.stringify(slug)}, got ${JSON.stringify(still[key])}`);
    }
  }
  return still;
}

function parseAward(file: string, path: string, v: unknown): Award {
  const o = expectRecord(file, path, v);
  rejectUnknownKeys(file, path, o, ["category", "person"]);
  return {
    category: expectCategory(file, `${path}.category`, o.category),
    person: expectStringOrNull(file, `${path}.person`, o.person),
  };
}

function parseCredit(file: string, path: string, v: unknown): Credit {
  const o = expectRecord(file, path, v);
  rejectUnknownKeys(file, path, o, ["role", "name"]);
  return {
    role: expectString(file, `${path}.role`, o.role),
    name: expectString(file, `${path}.name`, o.name),
  };
}

function parseFilm(file: string, index: number, v: unknown): Film {
  const path = `[${index}]`;
  const o = expectRecord(file, path, v);
  rejectUnknownKeys(file, path, o, FILM_KEYS);

  const slug = expectString(file, `${path}.slug`, o.slug);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail(file, `${path}.slug`, `must be lowercase kebab-case, got ${JSON.stringify(slug)}`);
  }

  const youtubeId = expectString(file, `${path}.youtubeId`, o.youtubeId);
  if (!YOUTUBE_ID_RE.test(youtubeId)) {
    fail(file, `${path}.youtubeId`, `must match ${YOUTUBE_ID_RE}, got ${JSON.stringify(youtubeId)}`);
  }

  const awardsRaw = expectArray(file, `${path}.awards`, o.awards);
  const awards = awardsRaw.map((a, i) => parseAward(file, `${path}.awards[${i}]`, a));
  const seenCategories = new Set<string>();
  awards.forEach((a, i) => {
    if (seenCategories.has(a.category)) {
      fail(file, `${path}.awards[${i}].category`, `duplicate award ${JSON.stringify(a.category)} on this film`);
    }
    seenCategories.add(a.category);
  });

  const creditsRaw = expectArray(file, `${path}.credits`, o.credits);
  const credits = creditsRaw.map((c, i) => parseCredit(file, `${path}.credits[${i}]`, c));

  const runtime = expectIntegerOrNull(file, `${path}.runtime`, o.runtime);
  if (runtime !== null && runtime <= 0) {
    fail(file, `${path}.runtime`, `must be a positive number of minutes or null, got ${runtime}`);
  }

  return {
    slug,
    title: expectString(file, `${path}.title`, o.title),
    year: expectInteger(file, `${path}.year`, o.year),
    track: expectOneOf(file, `${path}.track`, o.track, TRACKS),
    director: expectString(file, `${path}.director`, o.director),
    logline: expectString(file, `${path}.logline`, o.logline),
    youtubeId,
    viewable: expectBoolean(file, `${path}.viewable`, o.viewable),
    runtime,
    still: parseStill(file, `${path}.still`, o.still, slug),
    awards,
    credits,
  };
}

function parseFilms(raw: unknown): Film[] {
  const arr = expectArray(FILMS_FILE, "<root>", raw);
  const films = arr.map((f, i) => parseFilm(FILMS_FILE, i, f));

  const seenSlugs = new Map<string, number>();
  const seenYoutube = new Map<string, number>();
  films.forEach((f, i) => {
    const prevSlug = seenSlugs.get(f.slug);
    if (prevSlug !== undefined) {
      fail(FILMS_FILE, `[${i}].slug`, `duplicate slug ${JSON.stringify(f.slug)} (first seen at [${prevSlug}])`);
    }
    seenSlugs.set(f.slug, i);

    const prevYt = seenYoutube.get(f.youtubeId);
    if (prevYt !== undefined) {
      fail(FILMS_FILE, `[${i}].youtubeId`, `duplicate youtubeId ${JSON.stringify(f.youtubeId)} (first seen at [${prevYt}])`);
    }
    seenYoutube.set(f.youtubeId, i);
  });

  return films;
}

// ---------------------------------------------------------------------------
// awards.json
// ---------------------------------------------------------------------------

const AWARDS_FILE = "content/awards.json";

function parseWinnerEntry(file: string, path: string, v: unknown): WinnerEntry {
  const o = expectRecord(file, path, v);
  rejectUnknownKeys(file, path, o, ["filmSlug", "person"]);
  return {
    filmSlug: expectString(file, `${path}.filmSlug`, o.filmSlug),
    person: expectStringOrNull(file, `${path}.person`, o.person),
  };
}

function parseAwardCategory(file: string, path: string, v: unknown): AwardCategory {
  const o = expectRecord(file, path, v);
  rejectUnknownKeys(file, path, o, ["category", "department", "winner", "nominees"]);
  const nomineesRaw = expectArray(file, `${path}.nominees`, o.nominees);
  return {
    category: expectCategory(file, `${path}.category`, o.category),
    department: expectOneOf(file, `${path}.department`, o.department, DEPARTMENTS),
    winner: parseWinnerEntry(file, `${path}.winner`, o.winner),
    nominees: nomineesRaw.map((n, i) => parseWinnerEntry(file, `${path}.nominees[${i}]`, n)),
  };
}

function parseCeremony(file: string, path: string, v: unknown): Ceremony {
  const o = expectRecord(file, path, v);
  rejectUnknownKeys(file, path, o, ["year", "categories"]);
  const year = expectInteger(file, `${path}.year`, o.year);
  const categoriesRaw = expectArray(file, `${path}.categories`, o.categories);
  if (categoriesRaw.length === 0) fail(file, `${path}.categories`, "expected at least one category");
  const categories = categoriesRaw.map((c, i) => parseAwardCategory(file, `${path}.categories[${i}]`, c));

  const seen = new Map<string, number>();
  categories.forEach((c, i) => {
    const prev = seen.get(c.category);
    if (prev !== undefined) {
      fail(file, `${path}.categories[${i}].category`, `duplicate category ${JSON.stringify(c.category)} (first seen at categories[${prev}])`);
    }
    seen.set(c.category, i);
  });

  return { year, categories };
}

/**
 * awards.json is currently a single ceremony object. If it ever grows to an
 * array of ceremonies (one per year) this accepts that too.
 */
function ceremonyPath(raw: unknown, index: number): string {
  return Array.isArray(raw) ? `[${index}]` : "<root>";
}

function parseCeremonies(raw: unknown): Ceremony[] {
  const list = Array.isArray(raw) ? raw : [raw];
  const ceremonies = list.map((c, i) => parseCeremony(AWARDS_FILE, ceremonyPath(raw, i), c));
  const seenYears = new Map<number, number>();
  ceremonies.forEach((c, i) => {
    const prev = seenYears.get(c.year);
    if (prev !== undefined) {
      fail(AWARDS_FILE, `${ceremonyPath(raw, i)}.year`, `duplicate ceremony year ${c.year} (first seen at ${ceremonyPath(raw, prev)})`);
    }
    seenYears.set(c.year, i);
  });
  return ceremonies;
}

// ---------------------------------------------------------------------------
// Cross-file consistency
// ---------------------------------------------------------------------------

function crossValidate(films: Film[], ceremonies: Ceremony[], rawCeremonies: unknown): void {
  const filmIndexBySlug = new Map<string, number>();
  films.forEach((f, i) => filmIndexBySlug.set(f.slug, i));

  // Every ceremony winner (and nominee) must reference a real film of that year.
  ceremonies.forEach((ceremony, ci) => {
    const cPath = ceremonyPath(rawCeremonies, ci);
    ceremony.categories.forEach((cat, i) => {
      const entries: Array<[string, WinnerEntry]> = [
        [`${cPath}.categories[${i}].winner`, cat.winner],
        ...cat.nominees.map((n, ni): [string, WinnerEntry] => [`${cPath}.categories[${i}].nominees[${ni}]`, n]),
      ];
      for (const [ePath, entry] of entries) {
        const fi = filmIndexBySlug.get(entry.filmSlug);
        if (fi === undefined) {
          fail(AWARDS_FILE, `${ePath}.filmSlug`, `no film with slug ${JSON.stringify(entry.filmSlug)} in ${FILMS_FILE}`);
        }
        if (films[fi].year !== ceremony.year) {
          fail(AWARDS_FILE, `${ePath}.filmSlug`, `film ${JSON.stringify(entry.filmSlug)} is from ${films[fi].year}, not the ${ceremony.year} ceremony`);
        }
      }
    });
  });

  // Build the set of (year, category, slug, person) winners.
  const winnerKey = (year: number, category: string, slug: string) => `${year}|${category}|${slug}`;
  const winners = new Map<string, { person: string | null; path: string }>();
  ceremonies.forEach((ceremony, ci) => {
    const cPath = ceremonyPath(rawCeremonies, ci);
    ceremony.categories.forEach((cat, i) => {
      winners.set(winnerKey(ceremony.year, cat.category, cat.winner.filmSlug), {
        person: cat.winner.person,
        path: `${cPath}.categories[${i}].winner`,
      });
    });
  });

  // films.json awards -> awards.json winners
  const claimed = new Set<string>();
  films.forEach((film, fi) => {
    film.awards.forEach((award, ai) => {
      const key = winnerKey(film.year, award.category, film.slug);
      const w = winners.get(key);
      if (!w) {
        fail(FILMS_FILE, `[${fi}].awards[${ai}]`, `film ${JSON.stringify(film.slug)} claims ${JSON.stringify(award.category)} but ${AWARDS_FILE} lists no such winner for ${film.year}`);
      }
      if (w.person !== award.person) {
        fail(FILMS_FILE, `[${fi}].awards[${ai}].person`, `person ${JSON.stringify(award.person)} does not match ${AWARDS_FILE} ${w.path}.person ${JSON.stringify(w.person)}`);
      }
      claimed.add(key);
    });
  });

  // awards.json winners -> films.json awards
  for (const [key, w] of winners) {
    if (!claimed.has(key)) {
      const [year, category, slug] = key.split("|");
      fail(AWARDS_FILE, w.path, `${JSON.stringify(category)} (${year}) is won by ${JSON.stringify(slug)} but that film's awards array in ${FILMS_FILE} does not list it`);
    }
  }
}

// ---------------------------------------------------------------------------
// Load and validate once at module load
// ---------------------------------------------------------------------------

const FILMS: readonly Film[] = parseFilms(filmsJson);
const CEREMONIES: readonly Ceremony[] = parseCeremonies(awardsJson);
crossValidate(FILMS as Film[], CEREMONIES as Ceremony[], awardsJson);

const FILM_BY_SLUG: ReadonlyMap<string, Film> = new Map(FILMS.map((f) => [f.slug, f]));
const CEREMONY_BY_YEAR: ReadonlyMap<number, Ceremony> = new Map(CEREMONIES.map((c) => [c.year, c]));

// ---------------------------------------------------------------------------
// Public accessors
// ---------------------------------------------------------------------------

/** All films, in films.json order. */
export function getFilms(): Film[] {
  return [...FILMS];
}

export function getFilm(slug: string): Film | undefined {
  return FILM_BY_SLUG.get(slug);
}

/** All ceremonies, ascending by year. */
export function getCeremonies(): Ceremony[] {
  return [...CEREMONIES].sort((a, b) => a.year - b.year);
}

export function getCeremony(year: number): Ceremony | undefined {
  return CEREMONY_BY_YEAR.get(year);
}

/**
 * Map of slug -> Film for every film referenced by a ceremony (winners and
 * nominees), so an awards page can resolve titles and stills in one lookup.
 */
export function getFilmsForCeremony(ceremony: Ceremony): Map<string, Film> {
  const out = new Map<string, Film>();
  for (const cat of ceremony.categories) {
    for (const entry of [cat.winner, ...cat.nominees]) {
      const film = FILM_BY_SLUG.get(entry.filmSlug);
      if (film) out.set(film.slug, film);
    }
  }
  return out;
}

/**
 * Previous and next film in films.json order, wrapping around at both ends.
 * Returns undefined for both when the slug is unknown.
 */
export function getAdjacentFilms(slug: string): { prev: Film | undefined; next: Film | undefined } {
  const i = FILMS.findIndex((f) => f.slug === slug);
  if (i === -1 || FILMS.length === 0) return { prev: undefined, next: undefined };
  const n = FILMS.length;
  return { prev: FILMS[(i - 1 + n) % n], next: FILMS[(i + 1) % n] };
}

/**
 * Content access layer.
 *
 * Imports the two JSON seed files, validates them on module load (throwing a
 * descriptive Error on any problem so a malformed content file fails the
 * build loudly), and exposes typed accessors.
 *
 * PURE MODULE. No fs, no node built-ins, no React: components import this
 * file, so it must be safe in every bundle. Anything that needs the disk
 * (checking that still files exist, for instance) lives in
 * scripts/validate-content.ts, which imports this module to run the schema
 * checks and then does its own on-disk checks.
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
const BEST_PICTURE: CategoryName = "Best Picture";

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
  "no", "slug", "title", "year", "track", "director", "logline", "youtubeId",
  "viewable", "runtime", "still", "awards", "credits",
] as const;

function parseStill(file: string, path: string, v: unknown, slug: string): Still | null {
  // null means no frame exists for this film (see Still in ./types.ts).
  if (v === null) return null;
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

  const no = expectInteger(file, `${path}.no`, o.no);
  if (no <= 0) {
    fail(file, `${path}.no`, `catalog number must be a positive integer, got ${no}`);
  }

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
    no,
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

/**
 * Catalog numbers must be unique and contiguous from 1, and must not run
 * backwards in time (see CATALOG NUMBERS in ./types.ts). Every duplicate and
 * every gap is named in one message, so a botched renumbering is fixed in
 * one pass rather than one error at a time.
 */
function validateCatalogNumbers(films: Film[]): void {
  if (films.length === 0) return;

  const indicesByNumber = new Map<number, number[]>();
  films.forEach((f, i) => {
    const list = indicesByNumber.get(f.no) ?? [];
    list.push(i);
    indicesByNumber.set(f.no, list);
  });

  const duplicates = [...indicesByNumber.entries()]
    .filter(([, indices]) => indices.length > 1)
    .sort(([a], [b]) => a - b)
    .map(([no, indices]) => `${no} (at ${indices.map((i) => `[${i}] ${JSON.stringify(films[i].slug)}`).join(" and ")})`);

  const highest = Math.max(...indicesByNumber.keys());
  const missing: number[] = [];
  for (let n = 1; n <= highest; n++) {
    if (!indicesByNumber.has(n)) missing.push(n);
  }

  if (duplicates.length > 0 || missing.length > 0) {
    const problems: string[] = [];
    if (duplicates.length > 0) {
      problems.push(`duplicate catalog number${duplicates.length > 1 ? "s" : ""} ${duplicates.join(", ")}`);
    }
    if (missing.length > 0) {
      problems.push(`missing catalog number${missing.length > 1 ? "s" : ""} ${missing.join(", ")}`);
    }
    fail(FILMS_FILE, "[].no", `catalog numbers must run 1..${films.length} with no gaps or repeats: ${problems.join("; ")}`);
  }

  // Production order cannot put a later slate before an earlier one.
  const ordered = [...films].sort((a, b) => a.no - b.no);
  for (let k = 1; k < ordered.length; k++) {
    const prev = ordered[k - 1];
    const cur = ordered[k];
    if (cur.year < prev.year) {
      fail(
        FILMS_FILE,
        `[${films.indexOf(cur)}].no`,
        `No. ${cur.no} (${JSON.stringify(cur.slug)}, ${cur.year}) comes after No. ${prev.no} (${JSON.stringify(prev.slug)}, ${prev.year}); catalog numbers follow production order, so year must not decrease along the sequence`,
      );
    }
  }
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

  validateCatalogNumbers(films);

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
  rejectUnknownKeys(file, path, o, ["year", "held", "categories"]);
  const year = expectInteger(file, `${path}.year`, o.year);

  const held = expectString(file, `${path}.held`, o.held);
  if (!held.includes(String(year))) {
    fail(file, `${path}.held`, `expected the ceremony date to name the ceremony year ${year}, got ${JSON.stringify(held)}`);
  }

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

  // Every ceremony has a Best Picture; it also supplies the cycle's key film
  // (see getKeyFilm), so a ceremony without one is incomplete data.
  if (!seen.has(BEST_PICTURE)) {
    fail(file, `${path}.categories`, `expected a ${JSON.stringify(BEST_PICTURE)} category; every ceremony awards one and its winner is the cycle's key film`);
  }

  return { year, held, categories };
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
const FILM_BY_NUMBER: ReadonlyMap<number, Film> = new Map(FILMS.map((f) => [f.no, f]));
const CEREMONY_BY_YEAR: ReadonlyMap<number, Ceremony> = new Map(CEREMONIES.map((c) => [c.year, c]));
/** Films sorted ascending by catalog number: the spine order of the archive. */
const FILMS_IN_CATALOG_ORDER: readonly Film[] = [...FILMS].sort((a, b) => a.no - b.no);

// ---------------------------------------------------------------------------
// Catalog numbers
// ---------------------------------------------------------------------------

/** Digits a catalog number is padded to when rendered. */
export const CATALOG_NUMBER_DIGITS = 3;

/**
 * Zero-pads a catalog number for display: 7 -> "007", 31 -> "031".
 *
 * Three digits because the club has made roughly 30-40 films since 2020 and
 * adds a slate a year: two digits would roll over inside the decade, four
 * would be a boast. A number that already has more digits passes through
 * unpadded. Pure and React-free; the "No. " prefix is the rendering
 * component's job, so the number and its label can be styled apart.
 */
export function formatCatalogNumber(no: number): string {
  if (!Number.isInteger(no) || no <= 0) {
    throw new RangeError(`catalog number must be a positive integer, got ${String(no)}`);
  }
  return String(no).padStart(CATALOG_NUMBER_DIGITS, "0");
}

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

/** Same as getFilm; the name says which key is being used. */
export function getFilmBySlug(slug: string): Film | undefined {
  return FILM_BY_SLUG.get(slug);
}

export function getFilmByNumber(no: number): Film | undefined {
  return FILM_BY_NUMBER.get(no);
}

/** All films sorted ascending by catalog number (No. 001 first). */
export function getFilmsInCatalogOrder(): Film[] {
  return [...FILMS_IN_CATALOG_ORDER];
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
 * The cycle's key film: the ceremony's Best Picture winner.
 *
 * Cannes gives each edition one piece of key art, a still from one canonical
 * film, and that image carries the year. SFA's equivalent is the Best
 * Picture winner's still: the one image allowed to stand for a whole cycle
 * (hero, awards finale, the cycle's poster). It is DERIVED from the ceremony
 * result, never stored, so there is no "keyFilm" field that can drift out of
 * step with who actually won.
 *
 * The validator guarantees every ceremony has a Best Picture category whose
 * winner resolves to a film, so for validated content this always returns.
 * The key film can still have `still: null` (a private upload); the caller
 * decides the type-only fallback for that case.
 */
export function getKeyFilm(ceremony: Ceremony): Film {
  const bestPicture = ceremony.categories.find((c) => c.category === BEST_PICTURE);
  const film = bestPicture ? FILM_BY_SLUG.get(bestPicture.winner.filmSlug) : undefined;
  if (!film) {
    throw new ContentError(AWARDS_FILE, `${ceremony.year}`, "no Best Picture winner resolves to a film; content was not validated");
  }
  return film;
}

/**
 * Previous and next film in catalog order, wrapping around at both ends
 * (No. 001 sits after the last number), so film pages page through the
 * archive by spine number. Returns undefined for both when the slug is
 * unknown.
 */
export function getAdjacentFilms(slug: string): { prev: Film | undefined; next: Film | undefined } {
  const ordered = FILMS_IN_CATALOG_ORDER;
  const i = ordered.findIndex((f) => f.slug === slug);
  if (i === -1 || ordered.length === 0) return { prev: undefined, next: undefined };
  const n = ordered.length;
  return { prev: ordered[(i - 1 + n) % n], next: ordered[(i + 1) % n] };
}

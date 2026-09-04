/**
 * Pure helpers for the ceremony page. Everything here is derived from the
 * validated content in content/index.ts; nothing is hand-written per year.
 */
import type { AwardCategory, Ceremony, Department, Film } from "@/content/types";

const WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
] as const;

/** Numbers one to fifteen are written as words; anything larger stays digits. */
export function numberWord(n: number): string {
  return n >= 0 && n < WORDS.length ? WORDS[n] : String(n);
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export interface TallyRow {
  film: Film;
  count: number;
}

/**
 * One row per winning film, most wins first. Ties break by ceremony order
 * of the film's first win, so the tally reads in the order the night did.
 */
export function tally(ceremony: Ceremony, films: Map<string, Film>): TallyRow[] {
  const counts = new Map<string, { count: number; first: number }>();
  ceremony.categories.forEach((cat, i) => {
    const slug = cat.winner.filmSlug;
    const entry = counts.get(slug);
    if (entry) entry.count += 1;
    else counts.set(slug, { count: 1, first: i });
  });
  return [...counts.entries()]
    .sort(([, a], [, b]) => b.count - a.count || a.first - b.first)
    .flatMap(([slug, { count }]) => {
      const film = films.get(slug);
      return film ? [{ film, count }] : [];
    });
}

/**
 * A "sweep" is one film taking at least half the categories (rounded down)
 * and at least twice as many as the runner-up. Seven of fifteen with a
 * runner-up on three qualifies; eight against seven does not.
 */
export function sweep(rows: TallyRow[], total: number): TallyRow | null {
  const [top, second] = rows;
  if (!top) return null;
  const half = Math.floor(total / 2);
  const runnerUp = second?.count ?? 0;
  return top.count >= half && top.count >= runnerUp * 2 ? top : null;
}

export const ACTS: ReadonlyArray<{ department: Department; title: string }> = [
  { department: "craft", title: "Craft" },
  { department: "performance", title: "Performance" },
  { department: "picture", title: "Picture" },
];

export interface ActGroup {
  department: Department;
  title: string;
  categories: AwardCategory[];
}

/**
 * Splits the ceremony into three acts (ceremony order within each) and
 * pulls Best Picture out to be the finale. Best Picture is the last
 * category by convention, but it is found by name so a reordered file
 * still renders correctly.
 */
export function acts(ceremony: Ceremony): { acts: ActGroup[]; finale: AwardCategory | null } {
  const finale = ceremony.categories.find((c) => c.category === "Best Picture") ?? null;
  return {
    acts: ACTS.map((act) => ({
      ...act,
      categories: ceremony.categories.filter(
        (c) => c.department === act.department && c !== finale,
      ),
    })).filter((act) => act.categories.length > 0),
    finale,
  };
}

import { CANONICAL_CATEGORIES, type Award, type CategoryName } from "@/content/types";

/** "seven" for 0-15, numerals above that. Used in award and credit copy. */
const SMALL = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
];

export function countWord(n: number): string {
  return n >= 0 && n < SMALL.length ? SMALL[n] : String(n);
}

/** "a, b and c", no Oxford comma, matching the design notes' copy. */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Most prestigious first: the reverse of ceremony order (Best Picture, Best Director, ...). */
export function byPrestige(awards: Award[]): Award[] {
  return [...awards].sort(
    (a, b) => CANONICAL_CATEGORIES.indexOf(b.category) - CANONICAL_CATEGORIES.indexOf(a.category),
  );
}

/**
 * The role an award proves existed, the way a credit line would name it.
 * Best Picture and Audience Choice prove nothing about the crew; Best
 * Director is already the one real credit on every film.
 */
export const ROLE_FOR: Partial<Record<CategoryName, string>> = {
  "Best Screenplay": "a screenwriter",
  "Best Editing": "an editor",
  "Best Cinematography": "a cinematographer",
  "Best Sound Design": "a sound designer",
  "Best Set Design": "a set designer",
  "Best Costume Design": "a costume designer",
  "Best Hair and Makeup": "a hair and makeup artist",
  "Best Original Score": "a composer",
  "Best Lead Actor": "a lead actor",
  "Best Lead Actress": "a lead actress",
  "Best Supporting Actor": "a supporting actor",
  "Best Supporting Actress": "a supporting actress",
};

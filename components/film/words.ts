/** "seven" for 1–9, numerals above that. Used in award and credit copy. */
const SMALL = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

export function countWord(n: number): string {
  return n >= 0 && n < SMALL.length ? SMALL[n] : String(n);
}

/** "a, b and c" — no Oxford comma, matching the design notes' copy. */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

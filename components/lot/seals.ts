import type { CategoryName } from "@/content/types";

/* The two short lines a seal carries for each category. The circle is
   ~100px across, so long words are hyphenated by hand rather than let
   the browser guess. */
const LINES: Record<CategoryName, [string, string]> = {
  "Best Picture": ["Best", "Picture"],
  "Best Director": ["Best", "Director"],
  "Best Screenplay": ["Best", "Screenplay"],
  "Best Editing": ["Best", "Editing"],
  "Best Cinematography": ["Cinema-", "tography"],
  "Best Sound Design": ["Sound", "Design"],
  "Best Set Design": ["Set", "Design"],
  "Best Lead Actor": ["Lead", "Actor"],
  "Best Lead Actress": ["Lead", "Actress"],
  "Best Supporting Actor": ["Supp.", "Actor"],
  "Best Supporting Actress": ["Supp.", "Actress"],
  "Best Original Score": ["Original", "Score"],
  "Best Costume Design": ["Costume", "Design"],
  "Best Hair and Makeup": ["Hair &", "Makeup"],
  "Audience Choice": ["Audience", "Choice"],
};

export const sealLines = (category: CategoryName): [string, string] =>
  LINES[category] ?? ["Best", category.replace(/^Best /, "")];

import { getCeremonies, getKeyFilm } from "@/content";
import type { Ceremony, Film } from "@/content/types";

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

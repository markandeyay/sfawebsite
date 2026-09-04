import { getCeremonies, getFilm } from "@/content";
import type { Film } from "@/content/types";

/** The Best Picture winner of the most recent ceremony: the hero frame. */
export function getHeroFilm(): Film {
  const ceremonies = getCeremonies().sort((a, b) => b.year - a.year);
  for (const c of ceremonies) {
    const bp = c.categories.find((cat) => cat.category === "Best Picture");
    const film = bp ? getFilm(bp.winner.filmSlug) : undefined;
    if (film?.still) return film;
  }
  throw new Error("No Best Picture winner with a still found for the hero.");
}

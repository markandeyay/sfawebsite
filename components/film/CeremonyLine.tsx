import type { Ceremony, Film } from "@/content/types";
import { countWord } from "./words";

interface CeremonyLineProps {
  film: Film;
  ceremony: Ceremony | undefined;
  /** How many films share this film's slate year. */
  slateSize: number;
}

/**
 * The last line of a film page: one sentence derived from the data, as an
 * end card. A winner says what it won; every other film says where it sits
 * on the slate. No reveal. The "See the awards" link that followed it was
 * removed in the final pass (DESIGN_NOTES.md 11): the nav's Awards link is
 * on screen at the same moment and goes to the same page.
 */
export function CeremonyLine({ film, ceremony, slateSize }: CeremonyLineProps) {
  const wins = film.awards.length;
  const total = ceremony?.categories.length ?? 0;
  const sentence =
    ceremony && wins > 0
      ? `${film.title} won ${countWord(wins)} of the ${countWord(total)} awards at the ${ceremony.year} ceremony.`
      : `${film.title} is one of ${countWord(slateSize)} films on the ${film.year} slate.`;

  return <p className="text-4 measure">{sentence}</p>;
}

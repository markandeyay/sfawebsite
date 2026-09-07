import { ButtonLink } from "@/components/Button";
import type { Ceremony, Film } from "@/content/types";
import { countWord } from "./words";

interface CeremonyLineProps {
  film: Film;
  ceremony: Ceremony | undefined;
  /** How many films share this film's slate year. */
  slateSize: number;
}

/**
 * The last lines of a film page: one sentence derived from the data, then
 * the link to the ceremony on its own line. A winner says what it won;
 * every other film says where it sits on the slate. No reveal.
 */
export function CeremonyLine({ film, ceremony, slateSize }: CeremonyLineProps) {
  const wins = film.awards.length;
  const total = ceremony?.categories.length ?? 0;
  const sentence =
    ceremony && wins > 0
      ? `${film.title} won ${countWord(wins)} of the ${countWord(total)} awards at the ${ceremony.year} ceremony.`
      : `${film.title} is one of ${countWord(slateSize)} films on the ${film.year} slate.`;

  return (
    <div>
      <p className="text-4 measure">{sentence}</p>
      {ceremony ? (
        <p className="mt-4">
          <ButtonLink variant="link" href={`/awards/${ceremony.year}`}>
            See the {ceremony.year} awards
          </ButtonLink>
        </p>
      ) : null}
    </div>
  );
}

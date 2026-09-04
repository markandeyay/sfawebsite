import Link from "next/link";
import { AwardBadge } from "@/components/AwardBadge";
import { CANONICAL_CATEGORIES, type Film } from "@/content/types";
import { countWord } from "./words";

/**
 * The film's awards as a list on thin rules, Best Picture first. Each row is
 * the category as a Carolina label and, when the club has published one,
 * the winner's name in the display face. Renders nothing when the film won
 * nothing.
 */
export function AwardStack({ film }: { film: Film }) {
  if (film.awards.length === 0) return null;

  const awards = [...film.awards].sort(
    (a, b) =>
      CANONICAL_CATEGORIES.indexOf(b.category) - CANONICAL_CATEGORIES.indexOf(a.category),
  );
  const n = awards.length;
  const noun = n === 1 ? "award" : "awards";

  return (
    <section aria-labelledby="awards">
      <h2 id="awards" className="display text-display-md text-ink scroll-mt-24">
        Awards
      </h2>
      <p className="text-body-lg mt-5 prose-block">
        Winner of {countWord(n)} {noun} at{" "}
        <Link href={`/awards/${film.year}`} className="link">
          the {film.year} ceremony
        </Link>
        .
      </p>
      <ul className="mt-10">
        {awards.map((award) => (
          <li
            key={award.category}
            className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8 sm:items-baseline py-4 border-t border-rule"
          >
            <AwardBadge category={award.category} />
            {award.person ? (
              <span className="display text-display-sm text-ink">{award.person}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

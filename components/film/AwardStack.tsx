import Link from "next/link";
import { AwardBadge } from "@/components/AwardBadge";
import { SectionHeading } from "@/components/SectionHeading";
import { CANONICAL_CATEGORIES, type Film } from "@/content/types";
import { countWord } from "./words";

/**
 * The film's awards as a poster-style laurel row that wraps, Best Picture
 * first (DESIGN_NOTES.md 1.5, decision 7). The person line under a badge is
 * an enhancement that appears only when the club has published a name
 * (SFA_SYSTEM_DESIGN.md 7.4). Renders nothing when the film won nothing.
 */
export function AwardStack({ film }: { film: Film }) {
  if (film.awards.length === 0) return null;

  // Descending ceremony order: the biggest win leads the row.
  const awards = [...film.awards].sort(
    (a, b) =>
      CANONICAL_CATEGORIES.indexOf(b.category) - CANONICAL_CATEGORIES.indexOf(a.category),
  );
  const n = awards.length;
  const noun = n === 1 ? "award" : "awards";

  return (
    <section aria-labelledby="awards">
      <SectionHeading
        id="awards"
        title="Awards"
        lede={
          <>
            Winner of {countWord(n)} {noun} at{" "}
            <Link href={`/awards/${film.year}`} className="link">
              the {film.year} ceremony
            </Link>
            .
          </>
        }
      />
      <ul className="mt-8 flex flex-col items-start gap-y-4 sm:flex-row sm:flex-wrap sm:gap-x-12 sm:gap-y-6">
        {awards.map((award) => (
          <li key={award.category} className="flex flex-col items-start">
            <AwardBadge category={award.category} size="lg" />
            {award.person ? (
              <p className="credit text-cream mt-2 pl-8">{award.person}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

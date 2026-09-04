import { CreditBlock } from "@/components/CreditBlock";
import { SectionHeading } from "@/components/SectionHeading";
import type { CategoryName, Film } from "@/content/types";
import { countWord, joinList } from "./words";

/**
 * Craft awards prove a department existed even when nobody is credited for
 * it. Acting, director, picture and audience awards do not.
 */
const DEPARTMENT_FOR: Partial<Record<CategoryName, string>> = {
  "Best Screenplay": "screenplay",
  "Best Editing": "editing",
  "Best Cinematography": "cinematography",
  "Best Sound Design": "sound design",
  "Best Set Design": "set design",
  "Best Costume Design": "costume design",
  "Best Hair and Makeup": "hair and makeup",
  "Best Original Score": "score",
};

function uncreditedDepartments(film: Film): string[] {
  return film.awards
    .map((a) => DEPARTMENT_FOR[a.category])
    .filter((d): d is string => Boolean(d));
}

/**
 * The end-credit block for a film (SFA_SYSTEM_DESIGN.md 5.4) with the
 * thin-credits empty state inside it: an invitation written in words, never a
 * blank (DESIGN_NOTES.md 1.4, principle 3).
 */
export function FilmCredits({ film }: { film: Film }) {
  const departments = uncreditedDepartments(film);
  const n = departments.length;

  return (
    <section aria-labelledby="credits">
      <SectionHeading id="credits" title="Credits" />
      <CreditBlock className="mt-8" label={`${film.title} credits`} rows={film.credits}>
        <p className="credit muted border border-deep p-4 prose-block mt-4 sm:mx-auto">
          {n > 0 ? (
            <>
              The rest of this crew is uncredited. {film.title} won for {joinList(departments)},
              so at least {countWord(n)} more {n === 1 ? "name belongs" : "names belong"} here.
              Send the full credits and they appear in this block.
            </>
          ) : (
            <>Only the director is credited so far. Send the full credits and they appear in this block.</>
          )}
        </p>
      </CreditBlock>
    </section>
  );
}

import { CreditBlock } from "@/components/CreditBlock";
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
 * The credit block for a film with the thin-credits state written inside it
 * as one quiet sentence, never a blank.
 */
export function FilmCredits({ film }: { film: Film }) {
  const departments = uncreditedDepartments(film);
  const n = departments.length;

  return (
    <section aria-labelledby="credits">
      <h2 id="credits" className="display text-display-md text-ink scroll-mt-24">
        Credits
      </h2>
      <CreditBlock className="mt-10" label={`${film.title} credits`} rows={film.credits}>
        <p className="muted prose-block">
          {n > 0 ? (
            <>
              The rest of this crew is uncredited. {film.title} won for {joinList(departments)},
              so at least {countWord(n)} more {n === 1 ? "name belongs" : "names belong"} here.
              Send the full credits and they appear here.
            </>
          ) : (
            <>Only the director is credited so far. Send the full credits and they appear here.</>
          )}
        </p>
      </CreditBlock>
    </section>
  );
}

import { CreditBlock, type CreditRow } from "@/components/CreditBlock";
import type { Film } from "@/content/types";
import { ROLE_FOR, byPrestige, joinList } from "./words";

/**
 * The end-credit block: the real director row, and, while that is the only
 * credit, the invitation inside the block naming the roles the film's own
 * awards prove existed. No reveal: credits are simply there. The aside
 * disappears the moment the club supplies more than one credit.
 */
export function FilmCredits({ film }: { film: Film }) {
  const rows: CreditRow[] =
    film.credits.length > 0 ? film.credits : [{ role: "Director", name: film.director }];
  const roles = byPrestige(film.awards)
    .map((a) => ROLE_FOR[a.category])
    .filter((r): r is string => Boolean(r));
  const thin = rows.length <= 1;

  return (
    <div>
      <h2 id="credits" className="display text-6 text-fg">
        Credits
      </h2>
      <CreditBlock
        className="mt-8"
        headingId="credits"
        rows={rows}
        aside={
          thin ? (
            roles.length > 0 ? (
              <>
                Only the director is credited so far. The awards prove there was also {joinList(roles)}.
                Send the full credits and they go here.
              </>
            ) : (
              <>Only the director is credited so far. Send the full credits and they go here.</>
            )
          ) : undefined
        }
      />
    </div>
  );
}

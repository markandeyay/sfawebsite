import { SectionHeading } from "@/components/SectionHeading";
import { ButtonLink } from "@/components/Button";
import { JOIN_ACTION } from "@/lib/site";

/**
 * Current cycle. The club has not supplied dates (SFA_SYSTEM_DESIGN.md 8.5),
 * so every date is an explicit "to be announced" and the call to action is
 * the interest link, which cannot go stale.
 */
const SCHEDULE = [
  { label: "Pitches open", value: "Fall semester, date to be announced" },
  { label: "Review board decisions", value: "Date to be announced" },
  { label: "Festival and awards", value: "May, date to be announced" },
] as const;

export function NowShowing() {
  return (
    <section id="now-showing" aria-labelledby="now-showing-title" className="wrap py-16 sm:py-24 border-t border-deep">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <SectionHeading
          id="now-showing-title"
          title="Now showing"
          lede="Pitches for the next slate open in the fall. Any UNC student can bring a script or an idea, and no film experience is needed."
        />
        <div>
          <ul className="border-t border-deep">
            {SCHEDULE.map((row) => (
              <li
                key={row.label}
                className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6 py-3 border-b border-deep"
              >
                <span className="credit credit-role muted">{row.label}</span>
                <span className="credit">{row.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 credit muted">
            The 2026 slate screened in May 2026 and will be added when the club supplies it.
          </p>
          <div className="mt-8">
            <ButtonLink href={JOIN_ACTION.href} external>
              {JOIN_ACTION.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

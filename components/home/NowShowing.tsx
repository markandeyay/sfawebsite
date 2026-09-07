import { SectionHeading } from "@/components/SectionHeading";
import { ButtonLink } from "@/components/Button";
import { JOIN_ACTION } from "@/lib/site";

/**
 * Current cycle. The club has not supplied dates, so every date is an
 * explicit "to be announced" and the action is the interest link.
 */
const SCHEDULE = [
  { label: "Pitches open", value: "Fall semester, date to be announced" },
  { label: "Review board decisions", value: "Date to be announced" },
  { label: "Festival and awards", value: "May, date to be announced" },
] as const;

export function NowShowing() {
  return (
    <section id="now-showing" aria-labelledby="now-showing-title" className="wrap py-section sm:py-section">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        <SectionHeading
          id="now-showing-title"
          title="Pitches open this fall."
          lede="Any UNC student can bring a script or an idea. No film experience is needed; most members arrive with none."
        />
        <div className="lg:pt-10">
          <dl>
            {SCHEDULE.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 sm:grid-cols-2 sm:gap-8 py-4 border-t border-rule"
              >
                <dt className="condensed text-2 text-fg-muted pt-1">{row.label}</dt>
                <dd className="text-fg">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-fg-muted text-2">
            The 2026 slate screened in May 2026 and will be added when the club supplies it.
          </p>
          <div className="mt-8">
            <ButtonLink variant="link" href={JOIN_ACTION.href} external>
              {JOIN_ACTION.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

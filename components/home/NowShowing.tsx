import { SectionHeading } from "@/components/SectionHeading";
import { ArrowLink } from "@/components/ArrowLink";
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
    <section id="now-showing" aria-labelledby="now-showing-title" className="wrap py-20 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <SectionHeading
          id="now-showing-title"
          eyebrow="Now showing"
          title="Pitches open this fall."
          lede="Any UNC student can bring a script or an idea. No film experience is needed; most members arrive with none."
        />
        <div className="lg:pt-10">
          <dl>
            {SCHEDULE.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8 py-4 border-t border-rule"
              >
                <dt className="eyebrow pt-1">{row.label}</dt>
                <dd className="text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 muted text-[0.9375rem]">
            The 2026 slate screened in May 2026 and will be added when the club supplies it.
          </p>
          <div className="mt-10">
            <ArrowLink href={JOIN_ACTION.href} external>
              {JOIN_ACTION.label}
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}

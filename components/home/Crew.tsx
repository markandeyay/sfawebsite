import { CreditBlock } from "@/components/CreditBlock";
import { SectionHeading } from "@/components/SectionHeading";

/**
 * The exec board as role and name pairs. The club has not supplied a
 * roster, so names render as an explicit "to be supplied" state. Role
 * labels follow the structure the club describes; no names are invented.
 */
const ROLES = [
  "President",
  "Vice president",
  "Treasurer",
  "Executive producers",
  "Screenwriting guild",
  "Editing guild",
  "Acting guild",
];

export function Crew() {
  return (
    <section id="crew" aria-labelledby="crew-title" className="wrap py-section sm:py-section border-t border-rule">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        <SectionHeading
          id="crew-title"
          title="Who runs it."
          lede="The officer board runs the club, executive producers run the slate, and the guilds run the departments."
        />
        <CreditBlock label="Executive board" rows={ROLES.map((role) => ({ role, name: null }))} aside={<p className="text-fg-muted text-2 measure">
            Names go here as the club supplies them. Each one becomes a link to that
            member&rsquo;s credits across every film they worked on.
          </p>} />
      </div>
    </section>
  );
}

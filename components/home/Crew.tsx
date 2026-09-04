import { CreditBlock } from "@/components/CreditBlock";
import { SectionHeading } from "@/components/SectionHeading";

/**
 * The exec board as an end-credit block: the second of the credit block's two
 * placements (SFA_SYSTEM_DESIGN.md 5.4). The club has not supplied a roster
 * (8.5), so names render as an explicit "to be supplied" state. Role labels
 * follow the structure described in 8.1: an officer board, executive
 * producers, and department guilds. No names are invented.
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
    <section id="crew" aria-labelledby="crew-title" className="wrap py-16 sm:py-24 border-t border-deep">
      <SectionHeading
        id="crew-title"
        title="The crew"
        lede="The officer board runs the club, executive producers run the slate, and the guilds run the departments."
      />
      <CreditBlock
        className="mt-10 sm:mt-14"
        label="Executive board"
        rows={ROLES.map((role) => ({ role, name: null }))}
      >
        <p className="credit muted prose-block mt-4 sm:mx-auto sm:text-center">
          Names go here as the club supplies them. Each one becomes a link to that
          member&rsquo;s credits across every film they worked on.
        </p>
      </CreditBlock>
    </section>
  );
}

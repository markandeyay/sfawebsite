import { CreditBlock, type CreditRow } from "@/components/CreditBlock";
import { SectionHeading } from "@/components/SectionHeading";

/**
 * The exec board as an end-credit block. The club has not supplied a
 * roster, so every name is the block's own "to be supplied" state and the
 * aside says what to send. The roles are the ones the club describes: an
 * officer board, a board of executive producers, and the department guilds.
 * No names are invented. Credits get no reveal; they are simply there.
 */
const BOARD: CreditRow[] = [
  { role: "President", name: null },
  { role: "Vice president", name: null },
  { role: "Treasurer", name: null },
  { role: "Executive producers", name: null },
  { role: "Screenwriting guild lead", name: null },
  { role: "Editing guild lead", name: null },
  { role: "Acting guild lead", name: null },
];

export function Crew() {
  return (
    <section aria-labelledby="crew-title" className="wrap py-section">
      <SectionHeading
        id="crew-title"
        title="Who runs it"
        lede="An officer board runs the club, a board of executive producers runs the slate, and guilds run the departments."
      />
      <CreditBlock
        className="mt-block"
        headingId="crew-title"
        rows={BOARD}
        aside="Names go here when the club sends them: the current officers, the executive producers, and a lead for each guild."
      />
    </section>
  );
}

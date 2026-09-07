import { SectionHeading } from "@/components/SectionHeading";

/**
 * How a film gets made here, as a numbered sequence. The numbering is
 * honest: this is the order it happens in. The two tracks are named only
 * after the process has been described in plain words.
 */
const STEPS = [
  {
    title: "Pitch",
    text: "In the fall, any UNC student brings a script or an idea. Any genre, up to about twenty minutes.",
  },
  {
    title: "Review",
    text: "A script review board reads every pitch and greenlights the ones the club can make well that year.",
  },
  {
    title: "Crew up",
    text: "Each greenlit film gets a producer and builds a crew of actors, editors, cinematographers, and set crew from the membership.",
  },
  {
    title: "Shoot",
    text: "Spring is production. Crews shoot and cut with the club's equipment and the guilds behind them.",
  },
  {
    title: "Screen",
    text: "Every film premieres at the SFA Film Festival in May. The awards follow, voted on by the members.",
  },
] as const;

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="wrap py-section">
      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
        <SectionHeading id="how-title" title="How a film gets made here" className="lg:col-span-4" />
        <ol className="lg:col-span-8 hairline-t">
          {STEPS.map((step, i) => (
            <li key={step.title} className="hairline-b py-6 grid gap-x-8 gap-y-2 grid-cols-[auto_minmax(0,1fr)]">
              <span className="condensed text-6 text-fg-muted w-12" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="display text-5">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 text-fg-muted measure">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="lg:col-span-8 lg:col-start-5 text-4 measure">
          A film made this way is a studio film, and every film on this site is one. Members also
          make films outside the slate on their own initiative; the club calls those independent
          films.
        </p>
      </div>
    </section>
  );
}

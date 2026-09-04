import { SectionHeading } from "@/components/SectionHeading";

/** The production process, in a first-year's terms. A real sequence, so numbered. */
const STEPS = [
  {
    title: "Pitch",
    text: "In the fall, any UNC student brings a script or an idea. Comedy, horror, documentary, anything up to about twenty minutes.",
  },
  {
    title: "Review",
    text: "A script review board reads every pitch and greenlights the slate: the films the club can make well that year.",
  },
  {
    title: "Crew up",
    text: "Each greenlit film gets a producer and builds a crew of actors, editors, cinematographers, and set crew from the membership.",
  },
  {
    title: "Shoot",
    text: "Spring semester is production. Crews write, shoot, and cut with the club's equipment and the guilds behind them.",
  },
  {
    title: "Screen",
    text: "Every film premieres at the SFA Film Festival in May. The awards ceremony follows, and members vote.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="wrap py-20 sm:py-28 border-t border-rule">
      <SectionHeading id="how-title" eyebrow="How it works" title="How a film gets made here." />
      <ol className="mt-12 sm:mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((step, i) => (
          <li key={step.title} className="border-t border-rule pt-5">
            <p className="eyebrow">
              <span className="sr-only">Step </span>
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="display text-display-sm mt-3">{step.title}</h3>
            <p className="mt-3 muted">{step.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-16 sm:mt-20 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="border-t border-rule pt-5">
          <h3 className="display text-display-sm">Studio films</h3>
          <p className="mt-3 muted prose-block">
            The films pitched in the fall, chosen by the review board, and produced by the club
            with an assigned producer and crew. Every film on this site is a studio film.
          </p>
        </div>
        <div className="border-t border-rule pt-5">
          <h3 className="display text-display-sm">Independent films</h3>
          <p className="mt-3 muted prose-block">
            Projects members start on their own, outside the greenlit slate, with the club&rsquo;s
            people and equipment behind them. They screen alongside the studio films.
          </p>
        </div>
      </div>
    </section>
  );
}

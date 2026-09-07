/**
 * The current cycle. The club has published no dates, so the section is an
 * invitation rather than a calendar: it says when the next slate begins in
 * the terms the club uses and admits the dates are not posted. It carries
 * no action of its own: the nav's Join and the page's closing section
 * already hold the one action, and a third copy was the marketing default
 * (removed in the final pass, DESIGN_NOTES.md 11).
 */
export function NowShowing() {
  return (
    <section aria-labelledby="now-title" className="wrap">
      <div className="hairline-t pt-6 grid gap-x-8 gap-y-4 lg:grid-cols-12">
        <h2 id="now-title" className="display text-6 lg:col-span-7">
          Pitches for the next slate open in the fall.
        </h2>
        <div className="lg:col-span-5 lg:pt-2">
          <p className="text-4 text-fg-muted measure">
            Dates to be posted. Any UNC student can bring a script or an idea; most members arrive
            with no film experience at all.
          </p>
        </div>
      </div>
    </section>
  );
}

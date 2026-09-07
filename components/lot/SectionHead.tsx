/* The slugline. A screenplay numbers a scene in both margins and sets
   the slugline between them: INT. THE SLATE — NIGHT. Under it the
   title: poster face, then the script face for the second line. */
export function SectionHead({
  n,
  slug,
  title,
  em,
  meta,
}: {
  n: string;
  slug: string;
  title: string;
  em: string;
  no?: string;
  meta: [string, string];
}) {
  const m = slug.match(/^(INT\.|EXT\.|INT\.\/EXT\.)\s*(.*)$/i);
  return (
    <div className="sec__head" data-reveal-head>
      <div className="sec__rule">
        <span className="n">{n}</span>
        <span className="ln" />
        <span className="k">{m ? <><em>{m[1]}</em> {m[2]}</> : slug}</span>
        <span className="ln" />
        <span className="n">{n}</span>
      </div>
      <div className="sec__title">
        <h2 className="sec__tt" data-split>
          {title}
          <em>{em}</em>
        </h2>
        <span className="sec__no" aria-hidden="true">{n}</span>
        <p className="sec__meta">
          {meta[0]}<br />{meta[1]}
        </p>
      </div>
    </div>
  );
}

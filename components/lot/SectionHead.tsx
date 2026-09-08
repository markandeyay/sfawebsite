/* A script page. The page number top right, the scene number in both
   margins with the slugline between them (INT. THE SLATE — NIGHT), the
   title in the poster face with its second line in the script face,
   and the parenthetical under it. */
const trim = (s: string) => s.replace(/[.\s]+$/, "");

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
  meta: [string, string];
}) {
  const m = slug.match(/^(INT\.|EXT\.|INT\.\/EXT\.)\s*(.*)$/i);
  const pg = n.replace(/^0+(?=\d)/, "");
  return (
    <div className="sec__head" data-reveal-head>
      <span className="sec__pg" aria-hidden="true">{pg}.</span>
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
        <p className="sec__meta">({trim(meta[0])}. {trim(meta[1])}.)</p>
      </div>
    </div>
  );
}

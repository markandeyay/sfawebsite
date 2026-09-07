/* Rule, index, display pair, meta. The rule draws itself out, the kicker
   and index rise in, the ghost numeral swings in — all on the -in class
   the reveal observer flips (lib/fx/reveals.ts). */
export function SectionHead({
  n,
  slug,
  title,
  em,
  no,
  meta,
}: {
  n: string;
  slug: string;
  title: string;
  em: string;
  no: string;
  meta: [string, string];
}) {
  return (
    <div className="sec__head" data-reveal-head>
      <div className="sec__rule">
        <span className="n">Sc. {n}</span>
        <span className="ln" />
        <span className="k">{slug}</span>
      </div>
      <div className="sec__title">
        <h2 className="sec__tt" data-split>
          {title}
          <em>{em}</em>
        </h2>
        <span className="sec__no" aria-hidden="true">{no}</span>
        <p className="sec__meta">
          {meta[0]}<br />{meta[1]}
        </p>
      </div>
    </div>
  );
}

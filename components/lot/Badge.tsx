/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";

let seq = 0;

/* Rotary text on a ring with a reel turning at the core: a film can
   label. */
export function Badge({ text, core = "reel.svg", className = "", style, badge = false }: { text: string; core?: string; className?: string; style?: CSSProperties; badge?: boolean }) {
  const id = `badge-${++seq}`;
  return (
    <span className={`badge ${className}`} aria-hidden="true" style={style} data-badge={badge ? "" : undefined}>
      <svg viewBox="0 0 200 200">
        <defs>
          <path id={id} d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
        </defs>
        <text><textPath href={`#${id}`}>{text}</textPath></text>
      </svg>
      <img src={`/assets/marks/${core}`} alt="" width="56" height="56" />
    </span>
  );
}

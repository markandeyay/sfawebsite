import type { CSSProperties } from "react";
import { formatCatalogNumber } from "@/content";
import { jitter } from "@/lib/hash";

type Size = "card" | "row" | "page";

interface CatalogNumberProps {
  no: number;
  /** card and row share text step 2; page is step 9, the scale moment. */
  size?: Size;
  className?: string;
}

/**
 * Engineered irregularity, hook 1: every catalog number sits a fraction
 * off-true, rotated within +/-0.6deg and nudged +/-0.02em on its baseline,
 * derived from the number itself so the same film tilts the same way on
 * every page and on every render (server and client agree).
 */
export function catalogTilt(no: number): CSSProperties {
  const seed = `catno:${no}`;
  return {
    "--tilt": `${jitter(seed, -0.6, 0.6).toFixed(2)}deg`,
    "--nudge": `${jitter(`${seed}:y`, -0.02, 0.02).toFixed(3)}em`,
  } as CSSProperties;
}

/**
 * "No. 007": Criterion's spine number, applied to the club's films in
 * production order. The same face, the same treatment, the same relative
 * place on the card, the film page and the award row. "No." is the
 * grotesk at width 100, the digits are the condensed voice with tabular
 * figures; a thin space sits between them.
 */
export function CatalogNumber({ no, size = "card", className = "" }: CatalogNumberProps) {
  return (
    <span className={`catno catno--${size} ${className}`} style={catalogTilt(no)}>
      <span className="sr-only">Catalog number {no}</span>
      <span aria-hidden="true" className="catno__label">
        No.
      </span>
      <span aria-hidden="true">{" "}</span>
      <span aria-hidden="true" className="catno__digits">
        {formatCatalogNumber(no)}
      </span>
    </span>
  );
}

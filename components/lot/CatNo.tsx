import type { CSSProperties } from "react";
import { formatCatalogNumber } from "@/content";
import { jitter } from "@/lib/hash";

/* "No. 001": the spine number. Same treatment everywhere, a fraction
   off-true from its own number so a column of them reads as stamped. */
export function CatNo({ no, big = false, className = "" }: { no: number; big?: boolean; className?: string }) {
  const tilt = jitter(`catno:${no}`, -0.7, 0.7).toFixed(2);
  const digits = formatCatalogNumber(no);
  if (big) {
    return (
      <span className={`catno catno--big ${className}`} aria-label={`Catalog number ${no}`}>
        <small aria-hidden="true">No.</small>
        <span aria-hidden="true">{digits}</span>
      </span>
    );
  }
  return (
    <span className={`catno ${className}`} style={{ "--tilt": `${tilt}deg` } as CSSProperties} aria-label={`Catalog number ${no}`}>
      <span aria-hidden="true">No. {digits}</span>
    </span>
  );
}

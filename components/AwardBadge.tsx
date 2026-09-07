import Link from "next/link";
import type { CSSProperties } from "react";
import { jitter } from "@/lib/hash";

/**
 * THE WINNER MARK.
 *
 * The accent is a data type: a solid Carolina square appears at rest if and
 * only if something won. This is the one component that renders the mark;
 * everywhere else Carolina shows only on interaction (an underline on hover,
 * the selection colour). If a second place seems to need the mark at rest,
 * that is a signal to reconsider, not to add a class.
 *
 * The mark is a small solid square before the text: the shape of an award
 * envelope's seal, and it stays a rectangle like everything else. The text
 * stays in the surface's ink so it reads at any size.
 */

type Mode = "inline" | "row" | "count";

interface AwardBadgeProps {
  /** The category name, e.g. "Best Cinematography". Required unless mode is "count". */
  category?: string;
  /** The winning person, when the club has published one. */
  person?: string | null;
  /** How many wins, for mode "count". */
  count?: number;
  /** inline: on a film page list; row: an award row on the ceremony page; count: "7 wins" on cards and teasers. */
  mode?: Mode;
  /** Render as a link to this href (the film page, usually). */
  href?: string;
  /** Set when the badge is the content of a surrounding link, so it takes hover styling from it. */
  linked?: boolean;
  className?: string;
}

/**
 * Engineered irregularity, hook 3: each badge sits off-true within
 * +/-0.6deg, from its category name, so a column of winners on the ceremony
 * page reads as fifteen stamped seals rather than one repeated row.
 */
export function awardTilt(seed: string): CSSProperties {
  return { "--tilt": `${jitter(`award:${seed}`, -0.6, 0.6).toFixed(2)}deg` } as CSSProperties;
}

export function AwardBadge({ category, person, count, mode = "inline", href, linked = false, className = "" }: AwardBadgeProps) {
  const text =
    mode === "count"
      ? `${count ?? 0} ${count === 1 ? "win" : "wins"}`
      : (category ?? "");
  const seed = mode === "count" ? `count:${count ?? 0}` : text;
  const cls = `award award--${mode} ${linked ? "award--linked" : ""} ${className}`;
  const body = (
    <>
      <span className="award__mark" aria-hidden="true" />
      {text}
      {mode !== "count" && person ? <span className="award__person">{person}</span> : null}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls} style={awardTilt(seed)}>
        {body}
      </Link>
    );
  }
  return (
    <span className={cls} style={awardTilt(seed)}>
      {body}
    </span>
  );
}

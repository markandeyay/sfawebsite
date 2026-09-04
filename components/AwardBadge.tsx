/**
 * The only component permitted to use `gold` (SFA_SYSTEM_DESIGN.md 5.2).
 * Gold is a data type: if it is gold, members voted for it. Enforced by
 * scripts/check-gold.mjs at build time.
 *
 * Two shapes:
 *  - `kind="category"`: a poster-style laurel strip naming the category won.
 *    Used on film cards' award stacks and film pages.
 *  - `kind="winner"`: the winning entry itself, set in the display face, for
 *    ceremony rows. `person`, when known, is the enhancement line beneath.
 */
import type { ReactNode } from "react";

type Size = "sm" | "md" | "lg";

interface BaseProps {
  size?: Size;
  className?: string;
}

interface CategoryProps extends BaseProps {
  kind?: "category";
  category: string;
}

interface WinnerProps extends BaseProps {
  kind: "winner";
  /** The winning film's title, or any winner label. */
  children: ReactNode;
  /** The winning person, when the club has published one. */
  person?: string | null;
}

export type AwardBadgeProps = CategoryProps | WinnerProps;

const laurelSize: Record<Size, string> = {
  sm: "h-4",
  md: "h-5",
  lg: "h-8",
};

function Laurel({ side, size }: { side: "left" | "right"; size: Size }) {
  // Two thin arcs, not a stock wreath. Drawn once and mirrored.
  return (
    <svg
      viewBox="0 0 14 32"
      aria-hidden="true"
      className={`${laurelSize[size]} w-auto shrink-0 fill-none stroke-gold ${
        side === "right" ? "-scale-x-100" : ""
      }`}
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M12 2 C4 8 4 24 12 30" />
      <path d="M12 8 C8 9 6 11 5.5 14" />
      <path d="M12 14 C8 14.5 6 16 5 19" />
      <path d="M12 20 C8 20 6.5 21.5 5.5 24" />
    </svg>
  );
}

export function AwardBadge(props: AwardBadgeProps) {
  const size = props.size ?? "md";
  const className = props.className ?? "";

  if (props.kind === "winner") {
    const titleSize =
      size === "lg"
        ? "text-display-md"
        : size === "md"
          ? "text-display-sm"
          : "text-[1.125rem]";
    return (
      <div className={`inline-flex items-center gap-2 text-gold ${className}`}>
        <Laurel side="left" size={size} />
        <div className="min-w-0">
          <span className={`display block ${titleSize}`}>{props.children}</span>
          {props.person ? (
            <span className="credit block mt-1">{props.person}</span>
          ) : null}
        </div>
        <Laurel side="right" size={size} />
      </div>
    );
  }

  const textSize =
    size === "lg" ? "text-[1.0625rem]" : size === "md" ? "text-credit" : "text-label";
  return (
    <span
      className={`inline-flex items-center gap-2 text-gold whitespace-nowrap ${className}`}
    >
      <Laurel side="left" size={size} />
      <span className={`credit credit-role ${textSize}`}>{props.category}</span>
      <Laurel side="right" size={size} />
    </span>
  );
}

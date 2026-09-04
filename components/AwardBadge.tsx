/**
 * An award, set as type. No gold, no laurels: a small uppercase label in
 * Carolina Blue for a category, or the winner's title in the display face.
 * The prop shape is shared by the film page and the ceremony page.
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
  children: ReactNode;
  /** The winning person, when the club has published one. */
  person?: string | null;
  /** Set when the badge is the content of a link. */
  linked?: boolean;
}

export type AwardBadgeProps = CategoryProps | WinnerProps;

export function AwardBadge(props: AwardBadgeProps) {
  const size = props.size ?? "md";
  const className = props.className ?? "";

  if (props.kind === "winner") {
    const titleSize =
      size === "lg" ? "text-display-md" : size === "md" ? "text-display-sm" : "text-[1.125rem]";
    return (
      <span className={`block ${className}`}>
        <span
          className={`display block text-ink ${titleSize} ${
            props.linked ? "transition-[color] group-hover:text-carolina" : ""
          }`}
        >
          {props.children}
        </span>
        {props.person ? <span className="credit block mt-1 muted">{props.person}</span> : null}
      </span>
    );
  }

  const textSize = size === "lg" ? "text-[0.8125rem]" : "text-label";
  return (
    <span className={`label ${textSize} text-carolina ${className}`}>{props.category}</span>
  );
}

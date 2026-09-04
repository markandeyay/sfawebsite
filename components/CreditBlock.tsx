import type { ReactNode } from "react";

export interface CreditRow {
  role: string;
  /** null renders an explicit "to be supplied" state, never a blank. */
  name: string | null;
}

interface CreditBlockProps {
  rows: CreditRow[];
  /** Accessible label for the list, e.g. "FDOC credits". */
  label: string;
  /**
   * Optional aside rendered inside the block, spanning both columns. Used for
   * the thin-credits empty state on film pages.
   */
  children?: ReactNode;
  className?: string;
}

/**
 * An end-credit block (SFA_SYSTEM_DESIGN.md 5.4): right-aligned role,
 * left-aligned name, meeting at a center gutter, condensed sans, tight
 * leading. Stacks role over name on narrow screens instead of shrinking the
 * type. Layout lives in app/globals.css under `.credit-block`.
 */
export function CreditBlock({ rows, label, children, className = "" }: CreditBlockProps) {
  return (
    <dl className={`credit-block ${className}`} aria-label={label}>
      {rows.map((row, i) => (
        <div className="credit-block__row" key={`${row.role}-${row.name ?? i}`}>
          <dt className="credit credit-role credit-block__role muted">{row.role}</dt>
          <dd className="credit credit-block__name text-cream">
            {row.name ?? (
              <span className="muted italic">Name to be supplied</span>
            )}
          </dd>
        </div>
      ))}
      {children ? <div className="credit-block__aside">{children}</div> : null}
    </dl>
  );
}

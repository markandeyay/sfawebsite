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
  /** Optional aside rendered inside the block, spanning both columns. */
  children?: ReactNode;
  className?: string;
}

/**
 * Role and name pairs on thin rules: uppercase role in the left column,
 * name in the display face on the right. Stacks below 40rem. Layout lives
 * in app/globals.css under `.credit-block`.
 */
export function CreditBlock({ rows, label, children, className = "" }: CreditBlockProps) {
  return (
    <dl className={`credit-block ${className}`} aria-label={label}>
      {rows.map((row, i) => (
        <div className="credit-block__row" key={`${row.role}-${row.name ?? i}`}>
          <dt className="eyebrow pt-1">{row.role}</dt>
          <dd className="display text-display-sm text-ink">
            {row.name ?? (
              <span className="muted font-sans text-body-lg font-normal tracking-normal">
                Name to be supplied
              </span>
            )}
          </dd>
        </div>
      ))}
      {children ? <div className="credit-block__aside border-t border-rule pt-6">{children}</div> : null}
    </dl>
  );
}

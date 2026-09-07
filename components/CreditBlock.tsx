import type { ReactNode } from "react";

export interface CreditRow {
  role: string;
  /** null renders an explicit "to be supplied" state in the same voice, never a blank. */
  name: string | null;
}

export interface CreditGroup {
  /** Optional heading for the group, e.g. "Cast". */
  title?: string;
  rows: CreditRow[];
}

interface CreditBlockProps {
  /** The rows, in source order. Ignored when `groups` is given. */
  rows: CreditRow[];
  /** Grouped rows, separated by a hairline. */
  groups?: CreditGroup[];
  /** The empty-state invitation, rendered inside the block in the body voice. */
  aside?: ReactNode;
  /** id of the heading that names this block (aria-labelledby). */
  headingId?: string;
  /** Accessible name when there is no heading. */
  label?: string;
  className?: string;
}

function Row({ row, index }: { row: CreditRow; index: number }) {
  return (
    <div className="credits__row" key={`${row.role}-${row.name ?? index}`}>
      <dt className="credits__role">{row.role}</dt>
      <dd className={row.name ? "credits__name" : "credits__name credits__name--missing"}>
        {row.name ?? "Name to be supplied"}
      </dd>
    </div>
  );
}

/**
 * The end-credit block. Role right-aligned, name left-aligned, meeting at a
 * centre gutter; condensed voice, leading 1.15, a hairline above. Used for
 * the exec board and at the bottom of every film page. Stacks (role over
 * name, still condensed) below 40rem. Layout is in app/globals.css under
 * .credits.
 */
export function CreditBlock({ rows, groups, aside, headingId, label, className = "" }: CreditBlockProps) {
  const list = groups ?? [{ rows }];
  return (
    <div className={`credits ${className}`} role="group" aria-labelledby={headingId} aria-label={headingId ? undefined : label}>
      {list.map((group, gi) => (
        <dl className="credits__group" key={group.title ?? gi}>
          {group.title ? <div className="credits__group-title">{group.title}</div> : null}
          {group.rows.map((row, i) => (
            <Row row={row} index={i} key={`${row.role}-${row.name ?? i}`} />
          ))}
        </dl>
      ))}
      {aside ? <div className="credits__aside">{aside}</div> : null}
    </div>
  );
}

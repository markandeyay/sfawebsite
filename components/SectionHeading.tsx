import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: ReactNode;
  /** One plain sentence under the heading. Sentence case. */
  lede?: ReactNode;
  id?: string;
  as?: "h1" | "h2";
  className?: string;
}

/**
 * A heading and, optionally, one sentence. No eyebrow label above it and no
 * section number: homepage sections are not a sequence (SFA_SYSTEM_DESIGN.md
 * 5.6). The how-it-works steps number themselves.
 */
export function SectionHeading({ title, lede, id, as = "h2", className = "" }: SectionHeadingProps) {
  const Tag = as;
  return (
    <div className={`max-w-3xl ${className}`}>
      <Tag id={id} className="display text-display-md text-cream scroll-mt-24">
        {title}
      </Tag>
      {lede ? <p className="text-body-lg mt-3 prose-block muted">{lede}</p> : null}
    </div>
  );
}

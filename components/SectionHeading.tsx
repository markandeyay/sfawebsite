import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: ReactNode;
  /** One plain sentence under the heading. */
  lede?: ReactNode;
  id?: string;
  as?: "h1" | "h2" | "h3";
  /** Type step: 6 for section headings, 7 for page titles. */
  step?: 6 | 7;
  className?: string;
}

/** A heading that stands alone. No eyebrow above it, ever. */
export function SectionHeading({ title, lede, id, as = "h2", step = 6, className = "" }: SectionHeadingProps) {
  const Tag = as;
  return (
    <div className={className}>
      <Tag id={id} className={`display text-${step}`}>
        {title}
      </Tag>
      {lede ? <p className="text-4 measure mt-4">{lede}</p> : null}
    </div>
  );
}

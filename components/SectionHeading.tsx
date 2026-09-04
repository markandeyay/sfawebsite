import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: ReactNode;
  /** Small uppercase label above the heading. */
  eyebrow?: ReactNode;
  /** One plain sentence under the heading. */
  lede?: ReactNode;
  id?: string;
  as?: "h1" | "h2";
  size?: "lg" | "md";
  className?: string;
}

/** Eyebrow, a large tight headline, and optionally one sentence. */
export function SectionHeading({
  title,
  eyebrow,
  lede,
  id,
  as = "h2",
  size = "lg",
  className = "",
}: SectionHeadingProps) {
  const Tag = as;
  return (
    <div className={className}>
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <Tag id={id} className={`display text-ink scroll-mt-24 ${size === "lg" ? "text-display-lg" : "text-display-md"}`}>
        {title}
      </Tag>
      {lede ? <p className="text-body-lg mt-5 prose-block">{lede}</p> : null}
    </div>
  );
}

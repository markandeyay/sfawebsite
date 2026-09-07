import Link from "next/link";
import { SITE } from "@/lib/site";

interface WordmarkProps {
  size?: "nav" | "footer" | "hero";
  /** Render as text rather than a link (the hero, where it is the h1). */
  asText?: boolean;
  className?: string;
}

/**
 * There is no logo. The mark is the club's name in the display voice, tight
 * and heavy, the way A24's mark barely announces itself. In the nav it
 * shortens to the initials below 40rem so three links still fit.
 */
export function Wordmark({ size = "nav", asText = false, className = "" }: WordmarkProps) {
  const cls = `wordmark wordmark--${size} ${className}`;
  const inner = (
    <>
      <span className="wordmark__long">{SITE.wordmark}</span>
      <span className="wordmark__short" aria-hidden="true">
        {SITE.initials}
      </span>
    </>
  );
  if (asText) {
    return <span className={cls}>{inner}</span>;
  }
  return (
    <Link href="/" className={cls} aria-label={`${SITE.wordmark}, home`}>
      {inner}
    </Link>
  );
}

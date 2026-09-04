import Link from "next/link";

/**
 * There is no logo. The club name set in the display face is the wordmark
 * (SFA_SYSTEM_DESIGN.md 8.5). Two sizes: `nav` for the top bar, `hero` for the
 * cold open, where it is the largest type on the site.
 */
export function Wordmark({ size = "nav" }: { size?: "nav" | "hero" }) {
  if (size === "hero") {
    return (
      <h1 className="display text-display-xl text-cream">
        <span className="block">Student Film</span>
        <span className="block">Association</span>
      </h1>
    );
  }
  return (
    <Link
      href="/"
      className="display text-[1.375rem] leading-none text-cream no-underline"
      aria-label="Student Film Association, home"
    >
      Student Film Association
    </Link>
  );
}

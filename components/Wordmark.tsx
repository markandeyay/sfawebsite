import Link from "next/link";

/**
 * There is no logo. The mark is the club's initials set tight in the
 * display face, the way a studio mark sits in the centre of a nav bar. The
 * full name appears in the hero and the footer.
 */
export function Wordmark({ size = "nav" }: { size?: "nav" | "footer" }) {
  const cls =
    size === "footer"
      ? "display text-[2rem] leading-none tracking-[-0.04em] text-white no-underline"
      : "display text-[1.5rem] leading-none tracking-[-0.04em] text-ink no-underline";
  return (
    <Link href="/" className={cls} aria-label="Student Film Association, home">
      SFA
    </Link>
  );
}

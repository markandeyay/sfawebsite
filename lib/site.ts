// Site-wide constants. Real links from SFA_SYSTEM_DESIGN.md 8.4.
export const SITE = {
  name: "Student Film Association at UNC",
  shortName: "SFA at UNC",
  /** The wordmark text. There is no logo. */
  wordmark: "Student Film Association",
  initials: "SFA",
  description:
    "The UNC Student Film Association is a student-run production club. Members pitch scripts, crew up, shoot films, and screen them at a festival and awards ceremony each May.",
  // Replaced with the real domain when the club buys one; used for metadata only.
  url: "https://sfawebsite-kappa.vercel.app",
  instagram: "https://www.instagram.com/uncstudentfilmassociation",
  youtube: "https://www.youtube.com/@studentfilmassociationunc",
  // The typo is in the real URL. Do not correct it.
  linkedin: "https://www.linkedin.com/company/student-fillm-association-unc",
  bylaws: "https://drive.google.com/file/d/1drsTe3_7csil9QdSOqq37OqhZpbgloBJ/view",
  reelYoutubeId: "nicAYLUCvD0",
} as const;

/** The one action the site asks a visitor to take. There is no form yet. */
export const JOIN_ACTION = {
  label: "Message the club on Instagram",
  href: SITE.instagram,
} as const;

/** The two section links in the nav. */
export const NAV = [
  { label: "Films", href: "/#films" },
  { label: "Awards", href: "/awards/2025" },
] as const;

/** The nav's one action. */
export const JOIN_NAV = { label: "Join", href: "/#join" } as const;

/** Footer colophon: the catalog number explained once. */
export const COLOPHON =
  "Catalog numbers run in production order across all years, the way a spine number does. No. 001 is the first film the club made.";

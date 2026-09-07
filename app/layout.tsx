import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ChromeTop, ChromeBottom } from "@/components/engine/Chrome";
import Engine from "@/components/engine/Engine";
import { SITE } from "@/lib/site";
import { getSiteKeyFilm } from "@/lib/home";

/* The display voice: the client's own Figma stand-in for Futura Condensed.
   800 for the headlines, 400 italic for the outlined second words. */
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
  display: "swap",
});

/* Kickers, rails, captions, the credit roll's roles. */
const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex",
  display: "swap",
});

const keyFilm = getSiteKeyFilm();

export const metadata: Metadata = {
  title: {
    default: SITE.name,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    siteName: SITE.name,
    type: "website",
    images: keyFilm.still
      ? [{ url: keyFilm.still.original, width: 1280, height: 720, alt: `Frame from ${keyFilm.title}` }]
      : [],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${barlow.variable} ${plex.variable}`} suppressHydrationWarning>
      <body>
        <ChromeTop />
        <main id="main">{children}</main>
        <ChromeBottom />
        <Engine />
      </body>
    </html>
  );
}

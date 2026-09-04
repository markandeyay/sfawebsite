import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE } from "@/lib/site";
import { getHeroFilm } from "@/lib/home";

// Display: a tight grotesque for headlines and film titles.
const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-inter-tight",
  display: "swap",
});

// Text: body copy, labels, credits.
const inter = Inter({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-inter",
  display: "swap",
});

// The link preview (iMessage, Slack, and so on) shows the hero frame.
const heroFilm = getHeroFilm();

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
    images: heroFilm.still
      ? [{ url: heroFilm.still.original, width: 1280, height: 720, alt: `Frame from ${heroFilm.title}` }]
      : [],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${interTight.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <a
          href="#main"
          className="label sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:text-white focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <SiteNav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

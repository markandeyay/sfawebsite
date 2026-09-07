import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import SmoothScroll from "@/components/motion/SmoothScroll";
import ScrollFlag from "@/components/motion/ScrollFlag";
import { MOTION_HEAD_SCRIPT } from "@/lib/head-script";
import { SITE } from "@/lib/site";
import { getSiteKeyFilm } from "@/lib/home";

// One family, one file, two voices: Archivo's width axis gives the
// condensed voice (credits, catalog numbers) at 75% and the grotesk at 100%.
const archivo = Archivo({
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// The link preview (iMessage, Slack, and so on) shows the cycle's key film:
// the Best Picture winner's untreated frame.
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
    <html lang="en" className={`${archivo.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Marks the root "js" (and "-no-motion" under reduced motion) before paint. */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_HEAD_SCRIPT }} />
      </head>
      <body className="on-base min-h-full flex flex-col">
        <SmoothScroll />
        <ScrollFlag />
        <a href="#main" className="skip-link text-2">
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

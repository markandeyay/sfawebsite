import type { Metadata } from "next";
import { Big_Shoulders, Courier_Prime, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { ChromeTop, ChromeBottom } from "@/components/engine/Chrome";
import Engine from "@/components/engine/Engine";
import { SITE } from "@/lib/site";
import { getSiteKeyFilm } from "@/lib/home";

/* The poster face: Big Shoulders at its display optical size, weight 900,
   for every title. Squared signage letters, nothing to do with Futura. */
const shoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-shoulders",
  display: "swap",
});

/* The screenplay face: Courier Prime, the Courier cut drawn for scripts.
   Sluglines, kickers, captions, the roles in the credit roll, the form. */
const courier = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-courier",
  display: "swap",
});

/* The chalk: Permanent Marker for the fields written on the slate, and
   nothing else. */
const marker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marker",
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
    <html lang="en" className={`${shoulders.variable} ${courier.variable} ${marker.variable}`} suppressHydrationWarning>
      <body>
        <ChromeTop />
        <main id="main">{children}</main>
        <ChromeBottom />
        <Engine />
      </body>
    </html>
  );
}

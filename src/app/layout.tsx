import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { Toaster } from "@/components/ui/sonner";
import { BootScript, StoreHydrator, ViewerSync } from "@/components/boot";
import { JsonLd } from "@/components/json-ld";
import { imageUrl, organizationLd, websiteLd } from "@/lib/seo";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  category: "shopping",
  // No canonical/og:url here: they would be inherited by every page. Each page sets its own.
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: imageUrl("catalog/handguns/glock-19-gen6.png", { og: true }), width: 1200, height: 630, alt: "Glock 19 Gen6 9mm pistol" }],
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#cacac7",
  viewportFit: "cover",
};

const CONTRACT = `<!--
THESIS: The product is the poster. Every screen of the reference shop kit is re-set as a grey print poster: heavy black grotesk with a grey echo, product shots multiplied onto grey panels. Refuses the category default of dark tactical chrome and red sale banners.
OWN-WORLD: Ground #CACAC7, panel #B5B5B2 (cards) / #7A7A77 (deep product field), ink #111, echo #8D8D8A, figure grey #52524F; Archivo 900 set tight; flat 4px rectangles; black phone tab bar; caps spec strips on panel grey; no accent colour.
STORY: The shopper meets a featured product as a poster, taps a department, filters, reads compliance where they decide, adds to cart (the shot flies to the bag), picks an FFL, tracks the order.
FIRST VIEWPORT: Phone: wordmark bar, search, then the poster card: giant echo model word over a grey panel holding the pistol, MODEL figure, price and Add to cart. Desktop: the word spans eight columns with copy right; below, the deep product field spans eight columns and a right column stacks the MODEL figure, the SHOP HAND GUNS lockup, spec strip, price and Add to cart.
FORM: Brief-pinned (kit layout + photo.jpg poster style); no roll, no seed key.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={archivo.variable} suppressHydrationWarning>
      <body className="min-h-dvh">
        <BootScript />
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <StoreHydrator />
        <ViewerSync />
        <JsonLd data={[organizationLd(), websiteLd()]} />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

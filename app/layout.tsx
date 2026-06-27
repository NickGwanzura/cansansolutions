import type { Metadata } from "next";
import "./globals.css";
import PublicChrome from "@/components/PublicChrome";
import { OrganizationJsonLd, LocalBusinessJsonLd, WebsiteJsonLd } from "@/components/JsonLd";
import { DM_Sans, Sora } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-dm-sans",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-sora",
});

const HERO_TITLE = `Buy SSDs, Laptops & CCTV in Zimbabwe | ${SITE_NAME}`;
const DEFAULT_OG = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: HERO_TITLE,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HERO_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Canonical URLs are set per-page via buildAbsoluteMetadata() in lib/seo.ts.
  // A root canonical would incorrectly inherit to every page that doesn't
  // override it, pointing them all at the homepage.
  openGraph: {
    type: "website",
    locale: "en_ZW",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: HERO_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG],
  },
  twitter: {
    card: "summary_large_image",
    title: HERO_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG.url],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  other: {
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZW">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://wa.me" />
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className={`${dmSans.variable} ${sora.variable} font-sans antialiased bg-white text-zinc-900`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-red-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}

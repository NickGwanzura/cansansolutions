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
  alternates: {
    canonical: "/",
  },
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
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}

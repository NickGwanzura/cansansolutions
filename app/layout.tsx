import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { OrganizationJsonLd, LocalBusinessJsonLd } from "@/components/JsonLd";
import { DM_Sans, Sora } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  variable: "--font-dm-sans",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Cansan Solutions — Tech & Electronics",
  description:
    "Shop mobiles, laptops, networking gear, power solutions, audio, and more. Order via WhatsApp for fast delivery.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
      </head>
      <body className={`${dmSans.variable} ${sora.variable} font-sans antialiased bg-white text-zinc-900`}>
        <HeaderWrapper />
        <main>{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}

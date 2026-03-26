import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Cansan Solutions — Tech & Electronics",
  description:
    "Shop mobiles, laptops, networking gear, power solutions, audio, and more. Order via WhatsApp for fast delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white text-zinc-900">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

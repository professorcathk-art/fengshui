import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display-next",
});

export const metadata: Metadata = {
  title: "GeoMancy AI",
  description:
    "Traditional Chinese Feng Shui for the English-speaking world. Form School first, Flying Star when you unlock it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} dark`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.04_85/0.35),transparent_55%)]" />
        <div className="relative">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}

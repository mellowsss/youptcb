import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { AppProviders } from "@/components/AppProviders";
import { PaperGrain } from "@/components/ui/PaperGrain";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Yousif PTCB | 2026 PTCE Exam Review",
  description:
    "Practice for the 2026 PTCB exam with 1000+ questions aligned to the January 2026 PTCE content outline.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable} h-full`}>
      <body className="min-h-full bg-alabaster text-forest antialiased">
        <PaperGrain />
        <AppProviders>
          <Navbar />
          <main className="mx-auto max-w-7xl flex-1 px-4 py-8 md:px-6 md:py-16">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}

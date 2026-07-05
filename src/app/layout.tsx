import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yousif PTCB | 2026 PTCE Exam Review",
  description:
    "Practice for the 2026 PTCB exam with 1000+ questions aligned to the January 2026 PTCE content outline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="app-bg min-h-full text-slate-900 antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl flex-1 px-4 py-6 md:py-8">{children}</main>
      </body>
    </html>
  );
}

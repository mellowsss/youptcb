"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", emoji: "🏠" },
  { href: "/practice", label: "Practice", emoji: "📚" },
  { href: "/exam", label: "Mock Exam", emoji: "⏱️" },
  { href: "/review", label: "Review", emoji: "🎯" },
  { href: "/admin/review", label: "Admin", emoji: "⚙️" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition group-hover:scale-105">
            YP
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900">Yousif PTCB</p>
            <p className="text-xs font-medium text-indigo-600">2026 PTCE Review</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
                }`}
              >
                <span className="mr-1.5">{link.emoji}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-white/50 px-4 py-2 md:hidden">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                  : "text-slate-600"
              }`}
            >
              {link.emoji} {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

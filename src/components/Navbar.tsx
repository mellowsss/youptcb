"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Home,
  LogOut,
  Menu,
  Settings,
  Target,
  Timer,
  X,
} from "lucide-react";
import { SyncStatus } from "@/components/SyncStatus";
import { useUser } from "@/contexts/UserContext";

const links = [
  { href: "/", label: "Dashboard", Icon: Home },
  { href: "/practice", label: "Practice", Icon: BookOpen },
  { href: "/exam", label: "Practice Exam", Icon: Timer },
  { href: "/review", label: "Review", Icon: Target },
  { href: "/admin/review", label: "Admin", Icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, logout } = useUser();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-stone bg-alabaster/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-forest shadow-soft ring-1 ring-stone transition duration-500 ease-out group-hover:-translate-y-0.5">
              <Image
                src="/logo.png"
                alt="Yousif PTCB pharmacy logo"
                width={48}
                height={48}
                className="h-full w-full object-contain p-1.5"
                priority
              />
            </div>
            <div>
              <p className="font-serif text-base font-semibold tracking-tight text-forest">
                Yousif PTCB
              </p>
              <p className="text-xs font-medium uppercase tracking-widest text-sage">
                2026 PTCE Review
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-alabaster ${
                    active
                      ? "bg-forest text-white shadow-soft"
                      : "text-forest/70 hover:bg-clay-light hover:text-forest"
                  }`}
                >
                  <Icon strokeWidth={1.5} className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <SyncStatus />
            {profile && (
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone px-3 py-2 text-xs font-medium uppercase tracking-widest text-forest/70 transition hover:bg-clay-light"
              >
                <LogOut strokeWidth={1.5} className="h-3.5 w-3.5" />
                Switch user
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-stone bg-white text-forest lg:hidden"
            aria-label="Open menu"
          >
            <Menu strokeWidth={1.5} className="h-5 w-5" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-forest/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 border-b border-stone bg-alabaster p-6 shadow-xl transition duration-500 ease-out">
            <div className="mb-8 flex items-center justify-between">
              <p className="font-serif text-xl font-semibold text-forest">Menu</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-stone bg-white"
                aria-label="Close menu"
              >
                <X strokeWidth={1.5} className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {links.map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-base font-medium transition duration-300 ${
                      active ? "bg-forest text-white" : "text-forest hover:bg-clay-light"
                    }`}
                  >
                    <Icon strokeWidth={1.5} className="h-5 w-5" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 space-y-3 border-t border-stone pt-6">
              <SyncStatus />
              {profile && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-stone py-3 text-sm font-medium uppercase tracking-widest text-forest/70"
                >
                  <LogOut strokeWidth={1.5} className="h-4 w-4" />
                  Switch user
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

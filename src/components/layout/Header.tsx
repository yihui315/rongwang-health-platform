"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartBadge from "@/components/ui/CartBadge";

const publicNavLinks = [
  { href: "/ai-consult", label: "AI评估", matchPrefix: "/ai-consult" },
  { href: "/assessment/sleep", label: "自测入口", matchPrefix: "/assessment" },
  { href: "/solutions/sleep", label: "健康方案", matchPrefix: "/solutions" },
  { href: "/products", label: "商品库", matchPrefix: "/products" },
  { href: "/articles", label: "健康内容", matchPrefix: "/articles" },
];

const adminNavLink = { href: "/admin", label: "后台", matchPrefix: "/admin" };

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const navLinks = pathname.startsWith("/admin")
    ? [...publicNavLinks, adminNavLink]
    : publicNavLinks;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (matchPrefix: string) => pathname.startsWith(matchPrefix);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition ${
        scrolled
          ? "border-[var(--border-subtle)] bg-[rgba(255,253,248,0.92)] shadow-sm backdrop-blur-xl"
          : "border-transparent bg-[rgba(255,253,248,0.78)] backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="荣旺健康首页">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-strong)] text-sm font-bold text-white shadow-sm">
            荣
          </span>
          <span className="text-lg font-bold text-[var(--text-primary)]">荣旺健康</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {navLinks.map((link) => {
            const active = isActive(link.matchPrefix);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium ${
                  active
                    ? "bg-[#e8f5f1] text-[var(--teal-dark)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
                {active ? (
                  <span className="absolute inset-x-3 bottom-1 h-px rounded-full bg-[var(--teal)]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <CartBadge />
          <Link href="/ai-consult" className="btn-primary hidden sm:inline-flex">
            开始3分钟评估
          </Link>

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] md:hidden"
            aria-label="打开菜单"
            aria-expanded={mobileOpen}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className={`overflow-hidden md:hidden ${mobileOpen ? "max-h-[520px]" : "max-h-0"}`}>
        <div className="border-t border-[var(--border-subtle)] bg-[var(--surface)] px-5 pb-5 pt-3">
          <nav className="space-y-1" aria-label="移动导航">
            {navLinks.map((link) => {
              const active = isActive(link.matchPrefix);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium ${
                    active
                      ? "bg-[#e8f5f1] text-[var(--teal-dark)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/ai-consult"
            onClick={() => setMobileOpen(false)}
            className="btn-primary mt-4 flex w-full"
          >
            开始3分钟评估
          </Link>
        </div>
      </div>
    </header>
  );
}

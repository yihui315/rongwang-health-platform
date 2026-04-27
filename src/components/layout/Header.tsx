"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartBadge from "@/components/ui/CartBadge";

const publicNavLinks = [
  { href: "/ai-consult", label: "AI评估", matchPrefix: "/ai-consult" },
  { href: "/assessment/sleep", label: "评估入口", matchPrefix: "/assessment" },
  { href: "/solutions/sleep", label: "问题方案", matchPrefix: "/solutions" },
  { href: "/products", label: "商品库", matchPrefix: "/products" },
  { href: "/articles", label: "内容", matchPrefix: "/articles" },
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
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string, matchPrefix: string) => {
    if (matchPrefix) {
      return pathname.startsWith(matchPrefix);
    }

    return pathname === href;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/70 bg-white/85 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-white/70 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 text-sm font-black text-white shadow-sm transition group-hover:scale-105 group-hover:shadow-md">
            荣
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            荣旺健康
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
                isActive(link.href, link.matchPrefix)
                  ? "bg-teal-50/80 text-teal-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {link.label}
              {isActive(link.href, link.matchPrefix) ? (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-teal-600" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CartBadge />

          <Link
            href="/ai-consult"
            className="hidden items-center gap-1.5 rounded-full bg-teal-600 px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md sm:inline-flex"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            立即开始 AI 评估
          </Link>

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="菜单"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          mobileOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-slate-100 bg-white/95 px-6 pb-5 pt-3 backdrop-blur-xl">
          <nav className="space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition ${
                  isActive(link.href, link.matchPrefix)
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-50 active:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <Link
              href="/ai-consult"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-teal-700"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              立即开始 AI 评估
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

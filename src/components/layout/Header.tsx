'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CartBadge from '@/components/ui/CartBadge';

const navLinks = [
  { href: '/quiz', label: 'AI检测', matchPrefix: '' },
  { href: '/plans/fatigue', label: '方案', matchPrefix: '/plans' },
  { href: '/products', label: '商品', matchPrefix: '' },
  { href: '/articles', label: '百科', matchPrefix: '' },
  { href: '/family', label: '家庭', matchPrefix: '' },
  { href: '/subscription', label: '订阅', matchPrefix: '' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (link: typeof navLinks[0]) => {
    if (link.matchPrefix) return pathname.startsWith(link.matchPrefix);
    return pathname === link.href;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm'
          : 'bg-white/60 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 text-white text-sm font-black shadow-sm group-hover:shadow-md group-hover:scale-105 transition">
            荣
          </span>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            荣旺健康
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
                isActive(link)
                  ? 'text-teal-700 bg-teal-50/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {link.label}
              {isActive(link) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-teal-600" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <CartBadge />

          <Link
            href="/quiz"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-5 py-2 text-[13px] font-semibold text-white hover:bg-teal-700 transition-all shadow-sm hover:shadow-md"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            AI检测
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
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

      {/* Mobile menu — slide down */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-slate-100 bg-white/95 backdrop-blur-xl px-6 pb-5 pt-3">
          <nav className="space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition ${
                  isActive(link)
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-slate-600 hover:bg-slate-50"
            >
              我的健康档案
            </Link>
          </nav>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              href="/quiz"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 py-3 text-[15px] font-semibold text-white hover:bg-teal-700 transition shadow-sm"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              开始 AI 健康检测
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isExperimentalEnabled } from "@/lib/experimental";

export default function Header() {
  const [experimental, setExperimental] = useState(false);

  useEffect(() => {
    const sync = () => setExperimental(isExperimentalEnabled());
    sync();
    window.addEventListener("experimental-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("experimental-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold text-teal">
          荣旺健康
        </Link>

        <nav className="hidden gap-8 md:flex text-sm text-slate-600">
          <Link href="/quiz">AI检测</Link>
          <Link href="/plans/fatigue">方案中心</Link>
          <Link href="/articles">健康百科</Link>
          <Link href="/family">家庭健康</Link>
          <Link href="/subscription">订阅计划</Link>
          {experimental && (
            <Link href="/experimental" className="text-orange font-medium">
              🧪 实验
            </Link>
          )}
        </nav>

        <Link
          href="/quiz"
          className="rounded-full bg-orange px-5 py-3 text-sm font-semibold text-white"
        >
          立即AI检测
        </Link>
      </div>
    </header>
  );
}

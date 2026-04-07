"use client";

import { useEffect, useState } from "react";
import { isExperimentalEnabled, disableExperimental } from "@/lib/experimental";

export default function ExperimentalBanner() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(isExperimentalEnabled());
    sync();
    window.addEventListener("experimental-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("experimental-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="bg-orange/10 border-b border-orange/30 text-orange text-center text-sm py-2 px-4 flex items-center justify-center gap-3">
      <span className="inline-block h-2 w-2 rounded-full bg-orange animate-pulse" />
      <span>🧪 实验模式已开启 — 部分功能为内测版本，可能不稳定</span>
      <button
        onClick={() => {
          disableExperimental();
          setEnabled(false);
        }}
        className="ml-2 underline hover:no-underline text-xs"
      >
        关闭
      </button>
    </div>
  );
}

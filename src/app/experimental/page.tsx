"use client";

import { useEffect, useState } from "react";
import {
  isExperimentalEnabled,
  enableExperimental,
  disableExperimental,
} from "@/lib/experimental";
import { experimentalFeatures } from "@/data/experimental-features";
import Badge from "@/components/ui/Badge";

const statusLabel: Record<string, string> = {
  beta: "Beta",
  alpha: "Alpha",
  preview: "Preview",
};

const statusColor: Record<string, string> = {
  beta: "bg-teal/10 text-teal",
  alpha: "bg-orange/10 text-orange",
  preview: "bg-slate-100 text-slate-500",
};

export default function ExperimentalPage() {
  const [enabled, setEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEnabled(isExperimentalEnabled());
    setHydrated(true);
  }, []);

  const toggle = () => {
    if (enabled) {
      disableExperimental();
      setEnabled(false);
    } else {
      enableExperimental();
      setEnabled(true);
    }
  };

  if (!hydrated) return null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      {/* Title & Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            🧪 实验模式
          </h1>
          <p className="mt-2 text-slate-500">
            开启后可体验内测中的新功能，部分功能可能不稳定。
          </p>
        </div>

        <button
          onClick={toggle}
          className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ${
            enabled ? "bg-teal" : "bg-slate-300"
          }`}
          aria-label="切换实验模式"
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <p className="mt-4 text-sm">
        当前状态：
        <span className={enabled ? "text-teal font-semibold" : "text-slate-400"}>
          {enabled ? "已开启 ✅" : "已关闭"}
        </span>
      </p>

      {/* Feature list */}
      <section className="mt-12 space-y-6">
        <h2 className="text-xl font-semibold text-slate-700">实验功能列表</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {experimentalFeatures.map((f) => (
            <div
              key={f.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">{f.name}</h3>
                <Badge className={statusColor[f.status]}>
                  {statusLabel[f.status]}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <p className="mt-16 text-xs text-slate-400 text-center">
        实验功能仅供体验，数据与结果不作为医学参考。如有任何问题请联系客服。
      </p>
    </main>
  );
}

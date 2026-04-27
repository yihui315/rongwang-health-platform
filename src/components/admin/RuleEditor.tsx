"use client";

import { useState } from "react";
import type { RecommendationRuleRecord } from "@/schemas/recommendation-rule";

interface RuleEditorProps {
  rule: RecommendationRuleRecord;
}

export function RuleEditor({ rule }: RuleEditorProps) {
  const [active, setActive] = useState(rule.active);
  const [priority, setPriority] = useState(String(rule.priority));
  const [status, setStatus] = useState("");

  async function submitUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving...");

    const response = await fetch(`/api/admin/rules/${encodeURIComponent(rule.id ?? "")}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        active,
        priority: Number(priority),
      }),
    });

    if (!response.ok) {
      setStatus(response.status === 503 ? "DB unavailable" : "Save failed");
      return;
    }

    setStatus("Saved");
    window.location.reload();
  }

  return (
    <form onSubmit={submitUpdate} className="flex flex-wrap items-center gap-2">
      <label className="text-xs text-slate-500">
        Priority
        <input
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          type="number"
          min={0}
          className="mt-1 w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700"
        />
      </label>
      <label className="inline-flex items-center gap-2 text-sm text-slate-600">
        <input
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
          type="checkbox"
          className="h-4 w-4"
        />
        Active
      </label>
      <button type="submit" className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
        Save
      </button>
      {status ? <span className="text-xs text-slate-500">{status}</span> : null}
    </form>
  );
}

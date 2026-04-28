"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/products";
import { productStockValues } from "@/schemas/product";

interface ProductStatusEditorProps {
  product: Omit<Product, "pddUrl"> & {
    active?: boolean;
    pddUrl?: string | null;
  };
}

export function ProductStatusEditor({ product }: ProductStatusEditorProps) {
  const [active, setActive] = useState(product.active ?? true);
  const [stock, setStock] = useState(product.stock);
  const [officialUrl, setOfficialUrl] = useState(product.officialUrl ?? "");
  const [pddUrl, setPddUrl] = useState(product.pddUrl ?? "");
  const [status, setStatus] = useState("");

  async function submitUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving...");

    const response = await fetch(`/api/admin/products/${encodeURIComponent(product.slug)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        active,
        stock,
        officialUrl: officialUrl || null,
        pddUrl: pddUrl || null,
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
    <form onSubmit={submitUpdate} className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            type="checkbox"
            className="h-4 w-4"
          />
          Active
        </label>
        <label className="text-sm text-slate-600">
          Stock
          <select
            value={stock}
            onChange={(event) => setStock(event.target.value as Product["stock"])}
            className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
          >
            {productStockValues.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="text-xs text-slate-500">
        Official URL
        <input
          value={officialUrl}
          onChange={(event) => setOfficialUrl(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          placeholder="https://..."
        />
      </label>
      <label className="text-xs text-slate-500">
        PDD URL
        <input
          value={pddUrl}
          onChange={(event) => setPddUrl(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          placeholder="https://..."
        />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
          Save product
        </button>
        {status ? <span className="text-xs text-slate-500">{status}</span> : null}
      </div>
    </form>
  );
}

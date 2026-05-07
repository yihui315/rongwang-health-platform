"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  originCountry: string | null;
  category: string | null;
  priceText: string | null;
  createdAt: string;
};

export default function WorkspaceImportPage() {
  const [sourceUrl, setSourceUrl] = useState("https://item.jd.com/demo-vitamin.html");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  async function loadProducts() {
    const res = await fetch("/api/mock/products", { cache: "no-store" });
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/mock/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "导入失败");
      }

      setMessage(`导入成功：${data.product.title}`);
      setSourceUrl("");
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导入失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-14">
        <a href="/workspace" className="text-sm text-emerald-700 hover:underline">← 返回工作台</a>
        <h1 className="mt-4 text-3xl font-bold">商品导入</h1>
        <p className="mt-3 max-w-3xl leading-8 text-slate-600">
          这里是本地演示版。你输入链接后，系统会调用 mock 抓取 Agent，生成一个标准化商品对象并保存到内存中。
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleImport} className="rounded-2xl bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-slate-700">商品链接</label>
            <input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="输入京东/拼多多商品链接"
              className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 focus:border-emerald-500"
            />

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
              第一版先做演示流程：识别来源、校验 URL、构造标准化数据。后续再接真实 API / 抓取层。
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "导入中..." : "导入商品"}
            </button>

            {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
          </form>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">导入后你应该理解什么</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <li>1. 前台页面和中台是两回事，导入发生在中台。</li>
              <li>2. 商品链接本身不是商品对象，必须先标准化。</li>
              <li>3. 后续内容生成、合规预检、上架，都是基于标准化商品继续跑。</li>
              <li>4. 现在这一步就是你整条智能链路的入口。</li>
            </ul>
          </div>
        </div>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">已导入商品</h2>
            <a href="/workspace/generate" className="text-sm font-medium text-emerald-700 hover:underline">
              去内容生成 →
            </a>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-3">标题</th>
                  <th className="px-3 py-3">来源</th>
                  <th className="px-3 py-3">价格</th>
                  <th className="px-3 py-3">产地</th>
                  <th className="px-3 py-3">时间</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-medium text-slate-900">{product.title}</td>
                    <td className="px-3 py-3 uppercase">{product.source}</td>
                    <td className="px-3 py-3">{product.priceText || "-"}</td>
                    <td className="px-3 py-3">{product.originCountry || "-"}</td>
                    <td className="px-3 py-3 text-slate-500">{new Date(product.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

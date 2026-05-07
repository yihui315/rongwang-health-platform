"use client";

import { useCallback, useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  source: string;
  priceText: string | null;
  originCountry: string | null;
};

type Content = {
  id: string;
  productId: string;
  shortTitle: string;
  shortDescription: string;
  longDescription: string;
  seoKeywords: string[];
  faqDraft: string[];
  disclaimer: string;
  riskFlags: string[];
  createdAt: string;
};

export default function WorkspaceGeneratePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    const res = await fetch("/api/mock/products", { cache: "no-store" });
    const data = await res.json();
    setProducts(data.products || []);
    setContents(data.contents || []);
    if (!selectedId && data.products?.length) {
      setSelectedId(data.products[0].id);
    }
  }, [selectedId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleGenerate() {
    if (!selectedId) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/mock/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      setMessage(`已生成：${data.product.title}`);
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  const selectedProduct = products.find((item) => item.id === selectedId);
  const latestContent = contents.find((item) => item.productId === selectedId) || contents[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-14">
        <a href="/workspace" className="text-sm text-emerald-700 hover:underline">← 返回工作台</a>
        <h1 className="mt-4 text-3xl font-bold">内容生成</h1>
        <p className="mt-3 max-w-3xl leading-8 text-slate-600">
          这一步会把已标准化的商品对象送进内容生成 Agent，得到标题、描述、FAQ、SEO 关键词和免责声明草稿。
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">选择商品</h2>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="">请选择商品</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>

            {selectedProduct ? (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                <p><strong>来源：</strong>{selectedProduct.source.toUpperCase()}</p>
                <p><strong>价格：</strong>{selectedProduct.priceText || "-"}</p>
                <p><strong>产地：</strong>{selectedProduct.originCountry || "-"}</p>
              </div>
            ) : null}

            <button
              onClick={handleGenerate}
              disabled={!selectedId || loading}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "生成中..." : "生成内容草稿"}
            </button>

            {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}

            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-900">
              注意：这里生成的是草稿，不是可直接上线的最终内容。后续必须经过合规预检和人工审核。
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">最新生成结果</h2>

            {latestContent ? (
              <div className="mt-6 space-y-6 text-sm leading-7 text-slate-700">
                <section>
                  <h3 className="font-semibold text-slate-900">短标题</h3>
                  <p className="mt-2">{latestContent.shortTitle}</p>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900">短描述</h3>
                  <p className="mt-2">{latestContent.shortDescription}</p>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900">长描述</h3>
                  <p className="mt-2">{latestContent.longDescription}</p>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900">SEO 关键词</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {latestContent.seoKeywords.map((keyword) => (
                      <span key={keyword} className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900">FAQ 草稿</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5">
                    {latestContent.faqDraft.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900">免责声明</h3>
                  <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    {latestContent.disclaimer}
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-slate-900">风险标记</h3>
                  {latestContent.riskFlags.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {latestContent.riskFlags.map((flag) => (
                        <span key={flag} className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-emerald-700">当前未检测到高风险词。</p>
                  )}
                </section>
              </div>
            ) : (
              <p className="mt-4 text-slate-600">还没有生成结果。先去导入商品，再回来点击生成。</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

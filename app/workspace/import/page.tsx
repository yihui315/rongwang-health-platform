"use client";

import { useEffect, useState } from "react";

import MeasuredText from "@/src/components/text/MeasuredText";

type Product = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  originCountry: string | null;
  category: string | null;
  priceText: string | null;
  rawPayload: {
    images?: string[];
    sourceRows?: number[];
    specs?: Record<string, string>;
    jdReference?: {
      itemUrl: string;
      source?: string;
    } | null;
    importNotes?: {
      assetFollowUp?: {
        searchKeywords?: string[];
      };
    };
  };
  createdAt: string;
};

type ImportFilter = 'all' | 'missing_images' | 'with_images' | 'compliance_notes';

const importTextFonts = {
  message: '700 14px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
  productTitle: '700 14px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
};

const importFilterOptions: Array<{ value: ImportFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'missing_images', label: '待补图片' },
  { value: 'with_images', label: '有图片参考' },
  { value: 'compliance_notes', label: '有合规提示' },
];

function getAssetStatus(product: Product): { label: string; tone: 'ready' | 'pending' } {
  return product.rawPayload.images?.length ? { label: '图片参考', tone: 'ready' } : { label: '图片待确认', tone: 'pending' };
}

function getSourceRows(product: Product): string {
  return product.rawPayload.sourceRows?.length ? product.rawPayload.sourceRows.join(', ') : '-';
}

function getComplianceNote(product: Product): string {
  return product.rawPayload.specs?.合规提示 || '待合规预检';
}

function getJdReferenceUrl(product: Product): string | null {
  return product.rawPayload.jdReference?.itemUrl || null;
}

function getAssetFollowUpNote(product: Product): string | null {
  const followUp = product.rawPayload.importNotes?.assetFollowUp;
  const keywords = followUp?.searchKeywords?.filter(Boolean).slice(0, 2);

  if (!keywords?.length) return null;

  return `补图：${keywords.join(' / ')}`;
}

function matchesImportFilter(product: Product, filter: ImportFilter): boolean {
  if (filter === 'missing_images') return !product.rawPayload.images?.length;
  if (filter === 'with_images') return Boolean(product.rawPayload.images?.length);
  if (filter === 'compliance_notes') return Boolean(product.rawPayload.specs?.合规提示);
  return true;
}

export default function WorkspaceImportPage() {
  const [sourceUrl, setSourceUrl] = useState("https://item.jd.com/demo-vitamin.html");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [importFilter, setImportFilter] = useState<ImportFilter>('all');

  const visibleProducts = products.filter((product) => matchesImportFilter(product, importFilter));

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/mock/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products || []);
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
        }
      });

    return () => {
      cancelled = true;
    };
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
      const refresh = await fetch("/api/mock/products", { cache: "no-store" });
      const refreshData = await refresh.json();
      setProducts(refreshData.products || []);
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

            {message ? (
              <MeasuredText
                className="workspace-import-message"
                font={importTextFonts.message}
                lineHeight={24}
                maxLines={2}
              >
                {message}
              </MeasuredText>
            ) : null}
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

          <div className="workspace-import-filter-bar" aria-label="商品导入筛选">
            {importFilterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="workspace-import-filter-button"
                aria-pressed={importFilter === option.value}
                onClick={() => setImportFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="workspace-import-table-wrap">
            <table className="workspace-import-table min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-3">标题</th>
                  <th className="px-3 py-3">来源</th>
                  <th className="px-3 py-3">价格</th>
                  <th className="px-3 py-3">产地</th>
                  <th className="px-3 py-3">资料状态</th>
                  <th className="px-3 py-3">图片来源</th>
                  <th className="px-3 py-3">来源行</th>
                  <th className="px-3 py-3">合规提示</th>
                  <th className="px-3 py-3">时间</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => {
                  const assetStatus = getAssetStatus(product);
                  const jdReferenceUrl = getJdReferenceUrl(product);
                  const assetFollowUpNote = getAssetFollowUpNote(product);

                  return (
                    <tr key={product.id} className="border-b border-slate-100">
                      <td className="px-3 py-3 font-medium text-slate-900">
                        <MeasuredText
                          className="workspace-import-product-title"
                          font={importTextFonts.productTitle}
                          lineHeight={24}
                          maxLines={2}
                        >
                          {product.title}
                        </MeasuredText>
                      </td>
                      <td className="px-3 py-3 uppercase">{product.source}</td>
                      <td className="px-3 py-3">{product.priceText || "-"}</td>
                      <td className="px-3 py-3">{product.originCountry || "-"}</td>
                      <td className="px-3 py-3">
                        <span className={`workspace-import-status-pill workspace-import-status-pill-${assetStatus.tone}`}>
                          {assetStatus.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {jdReferenceUrl ? (
                          <a
                            className="workspace-import-reference-link"
                            href={jdReferenceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            京东参考
                          </a>
                        ) : (
                          <span className="workspace-import-reference-missing">待补来源</span>
                        )}
                        {assetFollowUpNote ? (
                          <p className="workspace-import-follow-up-note">{assetFollowUpNote}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{getSourceRows(product)}</td>
                      <td className="px-3 py-3">
                        <p className="workspace-import-audit-note">{getComplianceNote(product)}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-500">{new Date(product.createdAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visibleProducts.length === 0 ? (
              <p className="workspace-import-empty">当前筛选下暂无商品，请切换筛选条件或先导入商品。</p>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

import { DraftLayoutPreviewGroup } from "@/src/components/text/DraftLayoutPreview";

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

const draftPreviewFonts = {
  mobilePreview: '700 14px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
};

export default function WorkspaceGeneratePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/mock/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;

        const nextProducts = data.products || [];
        setProducts(nextProducts);
        setContents(data.contents || []);
        setSelectedId((currentSelectedId) => currentSelectedId || nextProducts[0]?.id || "");
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
        setContents([]);
        setSelectedId("");
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
      const refresh = await fetch("/api/mock/products", { cache: "no-store" });
      const refreshData = await refresh.json();
      setProducts(refreshData.products || []);
      setContents(refreshData.contents || []);
      setSelectedId((currentSelectedId) => currentSelectedId || refreshData.products?.[0]?.id || "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  const selectedProduct = products.find((item) => item.id === selectedId);
  const latestContent = contents.find((item) => item.productId === selectedId) || contents[0];

  return (
    <main className="workspace-shell">
      <section className="workspace-generate">
        <a href="/workspace" className="workspace-back-link">← 返回工作台</a>
        <p className="workspace-eyebrow">Content Agent</p>
        <h1>内容生成</h1>
        <p className="workspace-generate-intro">
          这一步会把已标准化的商品对象送进内容生成 Agent，得到标题、描述、FAQ、SEO 关键词和免责声明草稿。
        </p>

        <div className="workspace-generate-grid">
          <div className="workspace-generate-card">
            <h2>选择商品</h2>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="workspace-select"
            >
              <option value="">请选择商品</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>

            {selectedProduct ? (
              <div className="workspace-product-summary">
                <p><strong>来源：</strong>{selectedProduct.source.toUpperCase()}</p>
                <p><strong>价格：</strong>{selectedProduct.priceText || "-"}</p>
                <p><strong>产地：</strong>{selectedProduct.originCountry || "-"}</p>
              </div>
            ) : null}

            <button
              onClick={handleGenerate}
              disabled={!selectedId || loading}
              className="workspace-primary-action"
            >
              {loading ? "生成中..." : "生成内容草稿"}
            </button>

            {message ? <p className="workspace-message-inline">{message}</p> : null}

            <div className="workspace-safe-note">
              注意：这里生成的是草稿，不是可直接上线的最终内容。后续必须经过合规预检和人工审核。
            </div>
          </div>

          <div className="workspace-generate-card">
            <h2>最新生成结果</h2>

            {latestContent ? (
              <div className="workspace-generated-content">
                <DraftLayoutPreviewGroup
                  title="移动端文案布局预检"
                  description="按移动端内容卡常用宽度预估行数，帮助发布前先压缩标题、短描述和 FAQ。"
                  items={[
                    {
                      id: `${latestContent.id}-title`,
                      label: "产品卡标题",
                      text: latestContent.shortTitle,
                    },
                    {
                      id: `${latestContent.id}-short-description`,
                      label: "产品卡短描述",
                      text: latestContent.shortDescription,
                    },
                    ...latestContent.faqDraft.slice(0, 2).map((item, index) => ({
                      id: `${latestContent.id}-faq-${index}`,
                      label: `FAQ ${index + 1}`,
                      text: item,
                    })),
                  ]}
                  font={draftPreviewFonts.mobilePreview}
                  lineHeight={24}
                  maxLines={3}
                />

                <section className="workspace-content-section">
                  <h3>短标题</h3>
                  <p>{latestContent.shortTitle}</p>
                </section>

                <section className="workspace-content-section">
                  <h3>短描述</h3>
                  <p>{latestContent.shortDescription}</p>
                </section>

                <section className="workspace-content-section">
                  <h3>长描述</h3>
                  <p>{latestContent.longDescription}</p>
                </section>

                <section className="workspace-content-section">
                  <h3>SEO 关键词</h3>
                  <div className="workspace-chip-row">
                    {latestContent.seoKeywords.map((keyword) => (
                      <span key={keyword}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="workspace-content-section">
                  <h3>FAQ 草稿</h3>
                  <ul className="workspace-content-list">
                    {latestContent.faqDraft.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section className="workspace-content-section">
                  <h3>免责声明</h3>
                  <p className="workspace-disclaimer-preview">
                    {latestContent.disclaimer}
                  </p>
                </section>

                <section className="workspace-content-section">
                  <h3>风险标记</h3>
                  {latestContent.riskFlags.length ? (
                    <div className="workspace-risk-row">
                      {latestContent.riskFlags.map((flag) => (
                        <span key={flag}>
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="workspace-safe-copy">当前未检测到高风险词。</p>
                  )}
                </section>
              </div>
            ) : (
              <p className="workspace-empty-copy">还没有生成结果。先去导入商品，再回来点击生成。</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

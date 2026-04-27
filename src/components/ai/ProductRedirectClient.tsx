"use client";

import Link from "next/link";
import { useEffect } from "react";
import { readAttributionCookies } from "@/lib/attribution";
import { trackAnalyticsEvent } from "@/lib/analytics";

interface ProductRedirectClientProps {
  productId: string;
  productName: string;
  destinationUrl: string;
  source: string;
  consultationId?: string;
  solutionSlug?: string;
  isExternal: boolean;
}

export default function ProductRedirectClient({
  productId,
  productName,
  destinationUrl,
  source,
  consultationId,
  solutionSlug,
  isExternal,
}: ProductRedirectClientProps) {
  useEffect(() => {
    const controller = new AbortController();
    const attribution = readAttributionCookies(document.cookie);
    const payload = {
      productId,
      sessionId: attribution.sessionId,
      consultationId,
      source,
      solutionSlug,
      ref: attribution.ref,
      utm: attribution.utm,
      destinationUrl: new URL(destinationUrl, window.location.origin).toString(),
    };

    trackAnalyticsEvent({
      name: "pdd_redirect_clicked",
      productId,
      sessionId: attribution.sessionId,
      consultationId,
      source,
      solutionSlug,
      metadata: {
        destinationUrl: payload.destinationUrl,
        isExternal,
      },
    });

    fetch("/api/pdd/click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).catch(() => {
      // Never block redirect on logging failure.
    });

    const timer = window.setTimeout(() => {
      window.location.assign(destinationUrl);
    }, 1200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [consultationId, destinationUrl, productId, solutionSlug, source]);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg">
      <span className="badge-teal">购买中转页</span>
      <h1 className="mt-4 text-balance text-3xl font-semibold text-slate-900">
        正在前往 {productName}
      </h1>
      <p className="mt-4 text-sm leading-7 text-slate-600">
        我们会先记录这次点击，再自动跳转到对应购买入口。若没有自动跳转，可以手动继续。
      </p>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
        {isExternal
          ? "当前将跳转到外部购买页面。请在下单前再次确认成分、规格与适用人群。"
          : "当前将先跳转到站内商品详情页，你也可以在详情页继续查看信息后再决定。"}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={destinationUrl} className="btn-primary">
          立即继续
        </Link>
        <Link href="/ai-consult" className="btn-secondary">
          返回 AI 评估
        </Link>
      </div>
    </div>
  );
}

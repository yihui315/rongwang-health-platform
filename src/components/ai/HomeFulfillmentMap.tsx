"use client";

import Link from "next/link";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { useTrackOnce } from "@/lib/use-track-once";

const fulfillmentNodes = [
  {
    title: "香港仓出库",
    description: "按订单准备商品，核对规格与数量。",
  },
  {
    title: "商品检查",
    description: "检查外包装、批次与发货信息。",
  },
  {
    title: "跨境申报",
    description: "按实际商品信息进行跨境申报。",
  },
  {
    title: "海关清关",
    description: "清关时间可能受政策、节假日与物流因素影响。",
  },
  {
    title: "国内派送",
    description: "发货后提供物流追踪信息。",
  },
  {
    title: "签收与售后",
    description: "破损、错发等问题按售后政策处理。",
  },
];

export default function HomeFulfillmentMap() {
  useTrackOnce(
    {
      name: "fulfillment_map_view",
      source: "homepage_fulfillment_map",
      metadata: { node_count: fulfillmentNodes.length },
    },
    "homepage:fulfillment_map_view",
  );

  return (
    <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="section-container py-14 md:py-18">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="badge-slate">Cross-border Fulfillment</span>
            <h2 className="mt-4 text-balance text-[var(--text-primary)]">
              香港跨境直邮，流程透明可追踪
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)] md:text-lg">
              下单后可查看物流状态；配送时效、申报说明与售后规则在购买前展示。
            </p>
          </div>
          <Link
            href="/shipping"
            className="btn-secondary w-fit"
            onClick={() =>
              trackAnalyticsEvent({
                name: "shipping_policy_click",
                source: "homepage_fulfillment_map",
                metadata: { target: "/shipping" },
              })
            }
          >
            查看配送与退货政策
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {fulfillmentNodes.map((node, index) => (
            <article
              key={node.title}
              className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-xs)]"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--clinical-primary-soft)] text-xs font-semibold text-[var(--clinical-primary)] ring-1 ring-[var(--clinical-border)]">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                {node.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                {node.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

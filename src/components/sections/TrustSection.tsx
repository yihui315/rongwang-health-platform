import Image from "next/image";

const trustImages = [
  {
    src: "/images/visual-v2/trust-lab.webp",
    title: "质量检测",
    desc: "以检测、批次和来源透明为信任基础。",
  },
  {
    src: "/images/visual-v2/trust-report.webp",
    title: "报告可追溯",
    desc: "评估报告先解释风险和方向，再连接方案。",
  },
  {
    src: "/images/visual-v2/trust-shipping.webp",
    title: "跨境服务",
    desc: "订单、物流和售后信息清晰可查。",
  },
];

const trustItems = [
  {
    title: "先评估后购买",
    desc: "不确定方向时，优先完成AI健康评估。",
  },
  {
    title: "风险优先",
    desc: "中高风险结果不会直接展示购买入口。",
  },
  {
    title: "教育型内容",
    desc: "页面文案保持谨慎，不做诊断或治疗承诺。",
  },
  {
    title: "规则化推荐",
    desc: "产品方向由规则匹配，不让AI自由选择具体商品。",
  },
  {
    title: "可追踪入口",
    desc: "外部购买入口通过中转页和点击记录管理。",
  },
];

export default function TrustSection() {
  return (
    <section className="border-y border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="section-container py-14 md:py-18">
        <div className="mb-10 max-w-2xl">
          <span className="badge-teal">信任中心</span>
          <h2 className="mt-4 text-balance text-[var(--text-primary)]">
            可信感不是靠夸张承诺，而是靠清晰流程
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
            荣旺健康把风险提示、教育报告、方案说明和购买入口分开呈现，让用户在理解后再做选择。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {trustImages.map((item) => (
            <div key={item.title} className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)]">
              <div className="relative h-48">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-5">
          {trustItems.map((item) => (
            <div key={item.title} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

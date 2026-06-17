import Image from "next/image";

const trustImages = [
  {
    src: "/images/visual-v2/trust-lab.webp",
    title: "产品身份可查",
    desc: "围绕品牌、来源、成分教育和审核状态建立 Product Passport。",
  },
  {
    src: "/images/visual-v2/trust-report.webp",
    title: "报告与风险分层",
    desc: "先解释风险层级、生活方式建议和营养支持方向。",
  },
  {
    src: "/images/visual-v2/trust-shipping.webp",
    title: "跨境履约说明",
    desc: "展示跨境直邮、物流预期和客服支持路径。",
  },
];

const trustItems = [
  {
    title: "风险先于支持",
    desc: "先完成健康风险分层，再判断是否适合营养支持。",
  },
  {
    title: "高风险保护",
    desc: "高风险结果不展示产品推荐，优先建议咨询医生或药师。",
  },
  {
    title: "健康教育用途",
    desc: "页面文案保持谨慎，不做诊断或效果保证。",
  },
  {
    title: "证据先于转化",
    desc: "产品信息先呈现身份、成分教育、适合与不适合情况。",
  },
  {
    title: "隐私最小化",
    desc: "分析事件只记录粗粒度场景，不发送联系方式或原始健康回答。",
  },
];

export default function TrustSection() {
  return (
    <section className="border-y border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="section-container py-14 md:py-18">
        <div className="mb-10 max-w-2xl">
          <span className="badge-teal">信任中心</span>
          <h2 className="mt-4 text-balance text-[var(--text-primary)]">
            可信感来自风险分层、证据护照和履约透明
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
            荣旺健康把主诉选择、统一评估、风险提示、教育报告、Product Passport 和跨境履约说明分开呈现，让用户在理解后再做决定。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {trustImages.map((item) => (
            <div key={item.title} className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
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
            <div key={item.title} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

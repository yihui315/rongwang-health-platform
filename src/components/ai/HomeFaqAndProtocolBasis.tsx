"use client";

import { trackAnalyticsEvent } from "@/lib/analytics";
import { useTrackOnce } from "@/lib/use-track-once";

const protocolBasis =
  "荣旺健康分层协议参考公开营养学资料、健康教育资料与产品成分安全边界建立。具体内容将随循证资料与专业复核机制持续迭代。";

const faqItems = [
  {
    question: "AI 健康分层依据什么？",
    answer:
      "评估基于结构化问题集与规则化分流逻辑，结合用户填写的状态、生活方式、用药/慢病/孕期等风险信息，生成健康教育用途的分层摘要。该结果不构成诊断、治疗或处方建议。",
  },
  {
    question: "这是不是医疗诊断？",
    answer:
      "不是。本评估仅用于健康教育与购买前自查，不替代医生、药师或其他专业人士的意见。",
  },
  {
    question: "有医生、药师或营养师参与吗？",
    answer:
      "专业复核机制建设中。后续将公开顾问角色、复核范围与更新时间。当前评估规则参考公开循证资料、营养学指南与产品成分安全边界建立。",
  },
  {
    question: "我的健康数据会如何使用？",
    answer:
      "你的健康资料仅用于生成本次健康分层结果与相关服务。未经你单独同意，不用于商业营销推送。",
  },
  {
    question: "为什么高风险情况下不展示购买入口？",
    answer:
      "因为你的健康比任何销售都重要。若回答中出现需要优先线下咨询的信号，系统会建议你先咨询医生或药师，而不是展示产品购买入口。",
  },
  {
    question: "完成评估后一定会推荐产品吗？",
    answer:
      "不会。系统会先进行风险分层。仅在低/中风险且存在明确相关方向时，才展示营养支持方向。",
  },
  {
    question: "跨境直邮多久到，是否可以追踪？",
    answer:
      "发货后会提供物流追踪信息。配送时间可能受地区、节假日、清关与物流因素影响，具体以配送与退货政策页面为准。",
  },
];

export default function HomeFaqAndProtocolBasis() {
  useTrackOnce(
    {
      name: "protocol_basis_view",
      source: "homepage_protocol_basis",
    },
    "homepage:protocol_basis_view",
  );
  useTrackOnce(
    {
      name: "faq_view",
      source: "homepage_faq",
      metadata: { item_count: faqItems.length },
    },
    "homepage:faq_view",
  );

  return (
    <section className="border-b border-[var(--border-subtle)] bg-white">
      <div className="section-container py-14 md:py-18">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="rounded-lg border border-[var(--clinical-border)] bg-[var(--surface-muted)] p-5">
            <span className="badge-teal">Protocol Basis</span>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-[var(--text-primary)] md:text-3xl">
              协议依据与更新边界
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              {protocolBasis}
            </p>
          </div>

          <div>
            <span className="badge-slate">FAQ</span>
            <h2 className="mt-4 text-balance text-[var(--text-primary)]">
              评估前常见问题
            </h2>
            <div className="mt-6 divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              {faqItems.map((item, index) => (
                <details
                  key={item.question}
                  className="group px-5 py-4"
                  onToggle={(event) => {
                    if (event.currentTarget.open) {
                      trackAnalyticsEvent({
                        name: "faq_item_expand",
                        source: "homepage_faq",
                        metadata: { item_index: index + 1 },
                      });
                    }
                  }}
                >
                  <summary className="cursor-pointer list-none text-base font-semibold text-[var(--text-primary)]">
                    <span className="inline-flex w-full items-center justify-between gap-4">
                      {item.question}
                      <span aria-hidden="true" className="text-[var(--clinical-primary)]">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

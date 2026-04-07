import Accordion from "@/components/ui/Accordion";

const items = [
  {
    question: "AI检测靠谱吗？和去医院有什么区别？",
    answer:
      "我们的AI基于30万+篇临床文献训练，根据你的年龄、性别、症状综合分析营养缺口。它是营养建议工具，不是医疗诊断。优势是快速、免费、个性化，帮你在\u201C不至于去医院但又觉得不对劲\u201D的灰色地带找到科学方案。"
  },
  {
    question: "产品都是正品吗？从哪里发货？",
    answer:
      "100%正品保障，假一赔十。所有产品来自品牌官方授权或原产地直采，香港自营仓发货。每批次附SGS检测报告和进口报关单，每件产品可扫码溯源。"
  },
  {
    question: "订阅可以随时取消吗？",
    answer:
      "完全灵活！随时在\u201C我的订阅\u201D修改产品、调整频率、暂停或取消，没有违约金。订阅享20% off，比单次购买划算很多。"
  },
  {
    question: "多久能看到效果？",
    answer:
      "多数用户7-14天内感受初步变化，30天后效果更明显。建议连续补充至少90天，订阅计划帮你不断档。"
  },
  {
    question: "支持哪些支付和配送？",
    answer:
      "支付：Visa/MasterCard、PayPal、Apple Pay、支付宝、微信支付、银联、FPS。配送：香港次日达、大陆3-5天、东南亚5-7天、全球50+国家。"
  }
];

export default function FaqSection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">常见问题</h2>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}

import Accordion from "@/components/ui/Accordion";

const items = [
  {
    question: "AI检测靠谱吗？",
    answer:
      "我们的AI会根据你的年龄、性别、症状、睡眠和生活方式综合分析，帮助你找到更适合的健康方向。它是营养建议工具，不代替医生诊断。"
  },
  {
    question: "产品都是正品吗？",
    answer:
      "我们坚持正品保障，所有产品支持来源与批次追踪。"
  },
  {
    question: "多久能看到变化？",
    answer:
      "每个人状态不同，通常需要一段持续执行周期，建议至少连续使用30天并观察变化。"
  },
  {
    question: "订阅可以取消吗？",
    answer:
      "可以，支持灵活暂停和取消。"
  }
];

export default function FaqSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">你可能想知道的</h2>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}

import MeasuredText from '@/src/components/text/MeasuredText';

const faqs = [
  {
    q: '平台上的商品是什么类型？',
    a: '当前主要展示跨境健康相关商品与营养补充类信息，具体合法销售范围以合规审核结果为准。',
  },
  {
    q: '这些商品能替代药物吗？',
    a: '不能。本品不能替代药物，页面内容也不构成医疗建议。',
  },
  {
    q: '为什么会提示与中国标准存在差异？',
    a: '因为部分商品为跨境来源商品，符合原产国标准，但可能与中国相关标准存在差异。',
  },
  {
    q: '是否支持中文说明？',
    a: '平台将为商品详情页预留中文说明和标签信息展示位，具体以审核通过内容为准。',
  },
];

const faqTextFonts = {
  question: '800 20px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
  answer: '400 16px Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
};

export default function FaqPage() {
  return (
    <main className="faq-page">
      <h1>常见问题</h1>
      <div className="faq-card-list">
        {faqs.map((item) => (
          <section key={item.q} className="faq-card">
            <MeasuredText
              as="h2"
              className="faq-card-question"
              font={faqTextFonts.question}
              lineHeight={26}
              maxLines={2}
            >
              {item.q}
            </MeasuredText>
            <MeasuredText
              className="faq-card-answer"
              font={faqTextFonts.answer}
              lineHeight={29}
              maxLines={4}
            >
              {item.a}
            </MeasuredText>
          </section>
        ))}
      </div>
    </main>
  );
}

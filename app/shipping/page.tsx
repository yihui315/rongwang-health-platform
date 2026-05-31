import MeasuredText from '@/src/components/text/MeasuredText';

const shippingTextFonts = {
  title: '800 22px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
  copy: '400 16px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
};

const shippingSections = [
  {
    title: '履约模式',
    copy: '第一阶段文案将同时支持保税仓与直邮说明模板，后续根据真实履约方案接入正式内容。',
  },
  {
    title: '时效与售后',
    copy: '不同商品的清关、配送、售后规则可能不同。具体以购买页与售后说明为准。',
  },
];

export default function ShippingPage() {
  return (
    <main className="shipping-page">
      <h1>物流与配送说明</h1>
      <div className="shipping-card-list">
        {shippingSections.map((section) => (
          <section key={section.title} className="shipping-card">
            <MeasuredText
              as="h2"
              className="shipping-card-title"
              font={shippingTextFonts.title}
              lineHeight={30}
              maxLines={2}
            >
              {section.title}
            </MeasuredText>
            <MeasuredText
              className="shipping-card-copy"
              font={shippingTextFonts.copy}
              lineHeight={29}
              maxLines={3}
            >
              {section.copy}
            </MeasuredText>
          </section>
        ))}
      </div>
    </main>
  );
}

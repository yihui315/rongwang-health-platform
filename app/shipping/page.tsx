export default function ShippingPage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
      <h1>物流与配送说明</h1>
      <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
        <section style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
          <h2>履约模式</h2>
          <p style={{ color: '#475569', lineHeight: 1.8 }}>
            第一阶段文案将同时支持保税仓与直邮说明模板，后续根据真实履约方案接入正式内容。
          </p>
        </section>
        <section style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
          <h2>时效与售后</h2>
          <p style={{ color: '#475569', lineHeight: 1.8 }}>
            不同商品的清关、配送、售后规则可能不同。具体以购买页与售后说明为准。
          </p>
        </section>
      </div>
    </main>
  );
}

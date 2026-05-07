export default function CompliancePage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
      <h1>合规说明</h1>
      <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
        <section style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
          <h2>跨境商品说明</h2>
          <p style={{ color: '#475569', lineHeight: 1.8 }}>
            本平台展示的部分商品为跨境来源商品，商品符合原产国标准，可能与中国相关标准存在差异，请消费者在充分了解后谨慎选购。
          </p>
        </section>
        <section style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
          <h2>保健品说明</h2>
          <p style={{ color: '#475569', lineHeight: 1.8 }}>
            涉及保健品或营养补充类商品时，相关内容仅用于商品信息展示，不构成医疗建议。本品不能替代药物。
          </p>
        </section>
        <section style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
          <h2>内容边界</h2>
          <p style={{ color: '#475569', lineHeight: 1.8 }}>
            平台不会以治疗、治愈、根治等方式描述保健品或健康相关商品。若页面内容存在争议或风险提示，将以人工审核和最终合规判断为准。
          </p>
        </section>
      </div>
    </main>
  );
}

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
      <h1>联系我们</h1>
      <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>商务合作</h2>
          <p style={{ color: '#475569' }}>bd@rongwang.example</p>
        </div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>售后与投诉</h2>
          <p style={{ color: '#475569' }}>support@rongwang.example</p>
        </div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>说明</h2>
          <p style={{ color: '#475569', lineHeight: 1.8 }}>
            本站当前为 MVP 架构版本，联系方式与表单提交流程将在后续接入正式客服与 CRM 系统。
          </p>
        </div>
      </div>
    </main>
  );
}

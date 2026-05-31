export default function PrivacyPage() {
  return (
    <main className="simple-page">
      <section className="simple-page-hero">
        <p className="simple-page-eyebrow">Privacy</p>
        <h1>隐私政策</h1>
        <p>
          荣旺健康仅在提供健康评估、客服沟通、订单咨询和售后支持所需范围内处理用户信息，并为每一次顾问复核保留可追溯记录。
        </p>
      </section>

      <section className="simple-page-grid">
        <article className="simple-page-card">
          <h2>我们收集的信息</h2>
          <p>
            当你提交健康评估或联系表单时，平台可能记录称呼、联系方式、健康关注方向、表单答案、来源页面和提交时间，用于生成健康教育报告与人工复核。
          </p>
        </article>
        <article className="simple-page-card">
          <h2>我们如何使用</h2>
          <p>
            信息仅用于回复咨询、安排顾问复核、改进页面体验和留存必要的服务记录。AI 输出不会直接作为最终建议，需经过人工复核后才可用于后续沟通。
          </p>
        </article>
        <article className="simple-page-card">
          <h2>停止联系</h2>
          <p>
            如需停止联系、修改联系方式或查询已提交记录，可通过客服邮箱 service@rongwanghealth.com 提出请求，我们会在核验后处理。
          </p>
        </article>
      </section>

      <section className="simple-page-notice">
        <h2>健康信息边界</h2>
        <p>本站内容仅供健康教育参考，不构成医疗建议。本品不能替代药物。</p>
      </section>
    </main>
  );
}

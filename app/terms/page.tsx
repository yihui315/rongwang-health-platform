export default function TermsPage() {
  return (
    <main className="simple-page">
      <section className="simple-page-hero">
        <p className="simple-page-eyebrow">Terms</p>
        <h1>服务条款</h1>
        <p>使用荣旺健康网站、健康评估、产品信息页和客服入口前，请先了解以下服务边界与购买提示。</p>
      </section>

      <section className="simple-page-grid">
        <article className="simple-page-card">
          <h2>健康内容边界</h2>
          <p>
            网站内容用于健康教育和商品信息展示，不提供诊断、处方或个体化医疗建议。涉及身体不适、长期用药、孕期或哺乳期情况，请先咨询专业人士。
          </p>
        </article>
        <article className="simple-page-card">
          <h2>第三方平台</h2>
          <p>
            部分购买按钮可能跳转至第三方平台，实际交易、支付、物流、售后规则以第三方平台页面和订单条款为准。本站会保留来源标记用于运营复盘。
          </p>
        </article>
        <article className="simple-page-card">
          <h2>跨境商品提示</h2>
          <p>
            跨境商品符合原产国标准，可能与中国相关标准存在差异，请消费者在充分了解产品标签、规格、成分和适用边界后谨慎选购。
          </p>
        </article>
      </section>

      <section className="simple-page-notice">
        <h2>必要声明</h2>
        <p>本品不能替代药物。所有 AI 生成内容和顾问复核建议均不得直接视为最终医疗建议。</p>
      </section>
    </main>
  );
}

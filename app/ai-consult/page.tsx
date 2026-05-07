import Link from 'next/link';

export default function AiConsultPage() {
  return (
    <main className="simple-page">
      <section className="simple-page-card">
        <p className="simple-page-eyebrow">AI Health Assessment</p>
        <h1>3分钟 AI 健康评估</h1>
        <p>
          这里是荣旺健康评估入口占位页。正式问卷上线前，本页用于承接首页 CTA，并说明评估会先识别风险层级，再展示生活方式建议与营养支持方向。
        </p>
        <div className="simple-page-notice">
          AI评估仅提供健康教育参考，不作为诊断依据；中高风险建议优先就医并咨询医生。本品不能替代药物。
        </div>
        <Link className="simple-page-button" href="/">
          返回首页
        </Link>
      </section>
    </main>
  );
}

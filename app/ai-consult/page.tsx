import Link from 'next/link';
import { Suspense } from 'react';

import MeasuredText from '@/src/components/text/MeasuredText';

import AiConsultForm from './AiConsultForm';

const aiConsultTextFonts = {
  intro: '400 17px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
};

export default function AiConsultPage() {
  return (
    <main className="simple-page">
      <section className="simple-page-grid">
        <div className="simple-page-card">
          <p className="simple-page-eyebrow">AI Health Assessment</p>
          <h1>3分钟 AI 健康评估</h1>
          <MeasuredText
            className="ai-consult-intro-copy"
            font={aiConsultTextFonts.intro}
            lineHeight={31}
            maxLines={3}
          >
            先留下你的健康关注方向和联系方式。正式问卷上线前，顾问会先按风险提示和营养支持方向为你做人工跟进。
          </MeasuredText>
          <div className="simple-page-notice">
            AI评估仅提供健康教育参考，不作为诊断依据；中高风险建议优先就医并咨询医生。本品不能替代药物。
          </div>
          <div className="simple-page-actions">
            <Link className="simple-page-link" href="/#health-scenarios">
              先看健康场景
            </Link>
            <Link className="simple-page-link" href="/products">
              查看产品推荐
            </Link>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="lead-form-card">
              <h2>提交评估线索</h2>
              <p className="lead-form-hint">表单加载中...</p>
            </div>
          }
        >
          <AiConsultForm />
        </Suspense>
      </section>
    </main>
  );
}

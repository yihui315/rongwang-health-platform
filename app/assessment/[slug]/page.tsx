import Link from 'next/link';
import { notFound } from 'next/navigation';
import { homeHealthDirections } from '@/src/lib/home/home-content';

const assessmentCopy: Record<string, string> = {
  sleep: '围绕入睡节律、夜间休息质量与生活习惯进行基础评估。',
  fatigue: '围绕日常精力、作息饮食与运动压力情况进行基础评估。',
  immune: '围绕日常防护、基础营养与生活方式进行基础评估。',
  female: '围绕女性周期状态、生活压力与营养平衡进行基础评估。',
};

export default async function AssessmentPlaceholderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const direction = homeHealthDirections.find((item) => item.href === `/assessment/${slug}`);

  if (!direction) {
    notFound();
  }

  return (
    <main className="simple-page">
      <section className="simple-page-card">
        <p className="simple-page-eyebrow">Assessment Direction</p>
        <h1>{direction.title}评估</h1>
        <p>{assessmentCopy[slug]}</p>
        <div className="simple-page-notice">
          AI评估仅提供健康教育参考，不作为诊断依据；中高风险建议优先就医并咨询医生。本品不能替代药物。
        </div>
        <div className="simple-page-actions">
          <Link className="simple-page-button" href="/ai-consult">
            开始综合评估
          </Link>
          <Link className="simple-page-link" href="/">
            返回首页
          </Link>
        </div>
      </section>
    </main>
  );
}

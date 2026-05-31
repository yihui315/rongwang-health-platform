import Link from 'next/link';
import { notFound } from 'next/navigation';
import MeasuredText from '@/src/components/text/MeasuredText';
import { homeHealthDirections } from '@/src/lib/home/home-content';

const assessmentTextFonts = {
  intro: '400 17px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
};

const assessmentCopy: Record<string, string> = {
  sleep: '围绕入睡节律、夜间休息质量与生活习惯进行基础评估。',
  fatigue: '围绕日常精力、作息饮食与运动压力情况进行基础评估。',
  immune: '围绕日常防护、基础营养与生活方式进行基础评估。',
  female: '围绕女性周期状态、生活压力与营养平衡进行基础评估。',
  'sleep-support': '围绕入睡节律、夜间休息质量与生活习惯进行基础评估。',
  'brain-focus': '围绕用脑强度、作息饮食与专注节奏进行基础评估。',
  'digestive-support': '围绕饮食结构、消化负担与代谢管理进行基础评估。',
  'joint-bone': '围绕关节骨骼、运动恢复与营养摄入进行基础评估。',
  'liver-metabolism': '围绕作息、饮酒频率、饮食油脂和肝胆代谢负担进行基础评估。',
  'immune-support': '围绕日常防护、基础营养与生活方式进行基础评估。',
  'men-health': '围绕男士压力、运动恢复与基础营养进行基础评估。',
  'women-health': '围绕女性周期状态、生活压力与营养平衡进行基础评估。',
  'elderly-care': '围绕中老年基础营养、骨骼支持与慢病风险提示进行基础评估。',
};

const legacyAssessmentDirections = [
  { slug: 'sleep', title: '睡眠支持' },
  { slug: 'fatigue', title: '疲劳恢复' },
  { slug: 'immune', title: '免疫支持' },
  { slug: 'female', title: '女性健康' },
];

export default async function AssessmentPlaceholderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const direction = homeHealthDirections.find((item) => item.href === `/solutions/${slug}`);
  const legacyDirection = legacyAssessmentDirections.find((item) => item.slug === slug);

  if (!direction && !legacyDirection) {
    notFound();
  }

  return (
    <main className="simple-page">
      <section className="simple-page-card">
        <p className="simple-page-eyebrow">Assessment Direction</p>
        <h1>{direction?.title ?? legacyDirection?.title}评估</h1>
        <MeasuredText
          className="assessment-intro-copy"
          font={assessmentTextFonts.intro}
          lineHeight={31}
          maxLines={3}
        >
          {assessmentCopy[slug]}
        </MeasuredText>
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

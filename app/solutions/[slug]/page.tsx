import Link from 'next/link';
import { notFound } from 'next/navigation';
import { productPreviewItems } from '@/src/lib/home/home-content';

const solutionCopy: Record<string, string> = {
  sleep: '睡眠支持方向会结合评估结果，展示生活方式建议与营养支持参考。',
  immune: '日常免疫方向会结合评估结果，展示基础营养与跨境支持参考。',
  fatigue: '疲劳恢复方向会结合评估结果，展示能量代谢与作息管理参考。',
};

export default async function SolutionPlaceholderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = productPreviewItems.find((item) => item.href === `/solutions/${slug}`);

  if (!solution) {
    notFound();
  }

  return (
    <main className="simple-page">
      <section className="simple-page-card">
        <p className="simple-page-eyebrow">Solution Preview</p>
        <h1>{solution.title}方案方向</h1>
        <p>{solutionCopy[slug]}</p>
        <div className="simple-page-notice">
          方案内容仅供方向参考，完整推荐将在评估后展示。具体商品是否适合购买，以评估结果、商品说明与合规审核为准。本品不能替代药物。
        </div>
        <div className="simple-page-actions">
          <Link className="simple-page-button" href="/ai-consult">
            先做 AI 评估
          </Link>
          <Link className="simple-page-link" href="/">
            返回首页
          </Link>
        </div>
      </section>
    </main>
  );
}

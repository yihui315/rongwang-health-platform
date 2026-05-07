import Link from 'next/link';
import HomeIcon from './HomeIcon';

const lifestyleTips = ['规律作息，保证充足睡眠', '均衡饮食，增加优质蛋白摄入', '每周适度运动，管理压力'];
const supportDirections = ['睡眠支持', '疲劳恢复', '免疫支持'];
const trustTags = [
  { label: '流程透明', icon: 'clipboard-check' },
  { label: '风险优先', icon: 'shield-heart' },
  { label: '跨境支持', icon: 'globe' },
] as const;

export default function HomeHero() {
  return (
    <section className="home-hero">
      <div className="home-container home-hero-grid">
        <div className="home-hero-copy">
          <p className="home-eyebrow">Rongwang Health</p>
          <h1 aria-label="3分钟 AI 健康评估，找到更适合你的营养支持方向">
            3分钟 AI 健康评估，
            <span>
              找到更适合你的<em>营养支持方向</em>
            </span>
          </h1>
          <p className="home-hero-subtitle">
            先评估、再看方案、再决定是否购买。中高风险优先建议就医；内容仅作健康教育参考。
          </p>
          <div className="home-hero-actions">
            <Link className="home-button home-button-primary" href="/ai-consult">
              立即开始 AI 评估 <span aria-hidden>→</span>
            </Link>
            <Link className="home-button home-button-secondary" href="/solutions/sleep">
              查看健康方案
            </Link>
          </div>
          <div className="home-hero-tags" aria-label="服务特点">
            {trustTags.map((tag) => (
              <span key={tag.label}>
                <HomeIcon name={tag.icon} />
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        <div className="home-report-card" aria-label="AI评估报告示例">
          <div className="home-report-head">
            <div>
              <p>AI评估报告（示例）</p>
              <strong>营养支持方向预览</strong>
            </div>
            <span>
              <HomeIcon name="shield-check" />
            </span>
          </div>

          <div className="home-report-grid">
            <div className="home-risk-panel">
              <p>综合风险等级</p>
              <div className="home-risk-score">
                <HomeIcon name="shield-check" />
                <strong>62</strong>
                <span>/ 100</span>
              </div>
              <mark>中等风险</mark>
              <small>请关注生活方式调整，必要时咨询专业医生</small>
            </div>

            <div className="home-report-list-card">
              <p>生活方式建议（3项）</p>
              <ul>
                {lifestyleTips.map((tip) => (
                  <li key={tip}>
                    <HomeIcon name="check" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
              <p className="home-report-direction-title">营养支持方向（3项）</p>
              <div className="home-report-pills">
                {supportDirections.map((direction) => (
                  <span key={direction}>{direction}</span>
                ))}
              </div>
            </div>
          </div>

          <p className="home-report-disclaimer">
            <HomeIcon name="shield-heart" />
            本报告仅供健康教育参考，不作为诊断依据。
          </p>
        </div>
      </div>
    </section>
  );
}

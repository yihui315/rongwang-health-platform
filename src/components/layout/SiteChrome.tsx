import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="site-nav-link" href={href}>
      {children}
    </Link>
  );
}

export default function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="site-logo" href="/" aria-label="荣旺健康首页">
            <Image src="/images/home/rongwang-health-logo.png" alt="荣旺健康 Rongwang Health" width={176} height={60} priority />
          </Link>
          <nav className="site-nav" aria-label="主导航">
            <NavLink href="/ai-consult">AI评估</NavLink>
            <NavLink href="/solutions/sleep">健康方案</NavLink>
            <NavLink href="/products">官网商城</NavLink>
            <NavLink href="/blog">健康内容</NavLink>
          </nav>
          <div className="site-header-actions">
            <Link className="site-header-workspace" href="/workspace">
              工作台
            </Link>
            <Link className="site-header-cta" href="/ai-consult">
              立即开始 AI 评估
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <Link className="site-logo site-logo-footer" href="/">
              <Image src="/images/home/rongwang-health-logo.png" alt="荣旺健康 Rongwang Health" width={176} height={60} />
            </Link>
            <p>科学评估 · 审慎支持 · 健康相伴</p>
            <p>service@rongwanghealth.com</p>
            <p>WhatsApp: +86 173 2272 9955</p>
          </div>
          <div>
            <h2>产品与服务</h2>
            <Link href="/ai-consult">AI评估</Link>
            <Link href="/solutions/sleep">健康方案</Link>
            <Link href="/products">官网商城</Link>
            <Link href="/blog">健康内容</Link>
          </div>
          <div>
            <h2>帮助与支持</h2>
            <Link href="/faq">常见问题</Link>
            <Link href="/shipping">配送与物流</Link>
            <Link href="/compliance">合规说明</Link>
            <Link href="/contact">联系我们</Link>
          </div>
          <div>
            <h2>关于荣旺健康</h2>
            <Link href="/about">关于我们</Link>
            <Link href="/workspace">运营工作台</Link>
            <Link href="/compliance">隐私政策</Link>
            <Link href="/compliance">服务条款</Link>
            <div className="site-footer-qr" aria-label="二维码占位">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
        <div className="site-footer-bottom">
          <p>
            免责声明：本站内容仅供健康教育参考，不构成医疗建议。本品不能替代药物。跨境商品符合原产国标准，可能与中国相关标准存在差异。
          </p>
          <p>© 2026 荣旺健康 版权所有</p>
        </div>
      </footer>
    </>
  );
}

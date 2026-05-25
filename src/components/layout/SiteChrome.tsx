'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="site-nav-link" href={href}>
      {children}
    </Link>
  );
}

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-logo" href="/" aria-label="荣旺健康首页">
          <Image src="/images/home/homepage-kit/assets/branding/rongwang-health-logo-header.png" alt="荣旺健康 RONGWANG HEALTH" width={220} height={58} priority />
        </Link>
        <nav className="site-nav" aria-label="主导航">
          <NavLink href="/">首页</NavLink>
          <NavLink href="/#health-scenarios">健康场景方案</NavLink>
          <NavLink href="/ai-consult">AI健康评估</NavLink>
          <NavLink href="/products">产品推荐</NavLink>
          <NavLink href="/blog">健康知识</NavLink>
          <NavLink href="/about">关于我们</NavLink>
        </nav>
        <div className="site-header-actions">
          <Link className="site-icon-action" href="/products" aria-label="搜索产品">
            <span aria-hidden>⌕</span>
          </Link>
          <Link className="site-icon-action" href="/about" aria-label="语言与地区">
            <span aria-hidden>◎</span>
          </Link>
          <Link className="site-header-cta" href="/contact">
            联系客服
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link className="site-logo site-logo-footer" href="/">
            <Image src="/images/home/homepage-kit/assets/branding/rongwang-health-logo-header.png" alt="荣旺健康 RONGWANG HEALTH" width={220} height={58} />
          </Link>
          <p>科学评估 · 审慎支持 · 健康相伴</p>
          <p>service@rongwanghealth.com</p>
          <p>WhatsApp: +86 173 2272 9955</p>
        </div>
        <div>
          <h2>产品与服务</h2>
          <Link href="/ai-consult">AI评估</Link>
          <Link href="/#health-scenarios">健康方案</Link>
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
        <p>免责声明：本站内容仅供健康教育参考，不构成医疗建议。本品不能替代药物。本商品符合原产国标准，可能与中国相关标准存在差异。</p>
        <p>© 2026 荣旺健康 版权所有</p>
      </div>
    </footer>
  );
}

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}

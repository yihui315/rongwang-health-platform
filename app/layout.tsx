import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  metadataBase: new URL("https://rongwang.hk"),
  title: '荣旺健康｜3分钟 AI 健康评估',
  description:
    '荣旺健康提供3分钟AI健康评估，帮助用户了解风险分层、生活方式建议与营养支持方向。内容仅供健康教育参考，不替代医生诊断。',
  openGraph: {
    title: '荣旺健康｜3分钟 AI 健康评估',
    description:
      '先评估、再看方案、再决定是否购买。中高风险建议优先就医，内容仅供健康教育参考。',
    url: 'https://rongwang.hk',
    siteName: '荣旺健康',
    locale: 'zh_CN',
    type: 'website',
  },
};

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="site-nav-link" href={href}>
      {children}
    </Link>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link className="site-logo" href="/" aria-label="荣旺健康首页">
              <span className="site-logo-mark" aria-hidden>
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 3c7 3 11 8 11 15 0 8-5 13-11 15C12 31 7 26 7 18 7 11 11 6 18 3Z" fill="#D1FAE5" />
                  <path d="M18 7c4 2 7 6 7 11 0 6-3 9-7 11-4-2-7-5-7-11 0-5 3-9 7-11Z" stroke="#059669" strokeWidth="2.4" />
                  <path d="M14 18.5 17 21l5.5-6" stroke="#047857" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>
                <strong>荣旺健康</strong>
                <small>RONGWANG HEALTH</small>
              </span>
            </Link>
            <nav className="site-nav" aria-label="主导航">
              <NavLink href="/ai-consult">AI评估</NavLink>
              <NavLink href="/solutions/sleep">健康方案</NavLink>
              <NavLink href="/products">官网商城</NavLink>
              <NavLink href="/blog">健康内容</NavLink>
            </nav>
            <Link className="site-header-cta" href="/ai-consult">
              立即开始 AI 评估
            </Link>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="site-footer-inner">
            <div className="site-footer-brand">
              <Link className="site-logo site-logo-footer" href="/">
                <span className="site-logo-mark" aria-hidden>
                  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 3c7 3 11 8 11 15 0 8-5 13-11 15C12 31 7 26 7 18 7 11 11 6 18 3Z" fill="#D1FAE5" />
                    <path d="M18 7c4 2 7 6 7 11 0 6-3 9-7 11-4-2-7-5-7-11 0-5 3-9 7-11Z" stroke="#059669" strokeWidth="2.4" />
                    <path d="M14 18.5 17 21l5.5-6" stroke="#047857" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>
                  <strong>荣旺健康</strong>
                  <small>RONGWANG HEALTH</small>
                </span>
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
      </body>
    </html>
  );
}

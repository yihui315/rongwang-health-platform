import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import SiteChrome from '@/src/components/layout/SiteChrome';

export const metadata: Metadata = {
  metadataBase: new URL("https://rongwang.hk"),
  title: '荣旺健康｜AI健康评估与跨境营养支持方案',
  description:
    '荣旺健康提供健康场景分层、生活方式建议与营养支持参考。内容仅用于健康教育，不替代医生诊断；如适合可跳转第三方平台查看相关产品。',
  icons: {
    icon: '/images/home/homepage-kit/assets/branding/rongwang-health-logo-header.png',
    apple: '/images/home/homepage-kit/assets/branding/rongwang-health-logo-header.png',
  },
  openGraph: {
    title: '荣旺健康｜AI健康评估与跨境营养支持方案',
    description:
      '先选健康场景，再查看适合的营养支持方案。内容仅供健康教育参考，不替代医生诊断。',
    url: 'https://rongwang.hk',
    siteName: '荣旺健康',
    locale: 'zh_CN',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}

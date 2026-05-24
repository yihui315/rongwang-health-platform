import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import SiteChrome from '@/src/components/layout/SiteChrome';

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}

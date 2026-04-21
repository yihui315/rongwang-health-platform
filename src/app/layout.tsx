import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Analytics from '@/components/layout/Analytics';
import { CartProvider } from '@/lib/cart-context';
import { generateOrganizationJsonLd } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: '荣旺健康 | AI健康检测与跨境保健品平台',
    template: '%s | 荣旺健康',
  },
  description:
    '3分钟AI健康检测，为你和家人匹配最适合的日常健康方案。覆盖抗疲劳、深度睡眠、免疫防护、压力缓解四大场景，香港保税仓直邮。',
  keywords: [
    '跨境保健品',
    '香港保健品',
    'AI营养方案',
    '辅酶Q10',
    '镁甘氨酸',
    'NMN',
    'GABA',
    '荣旺健康',
    '家庭健康管理',
    '深度睡眠',
    '免疫力',
  ],
  authors: [{ name: '香港荣旺健康科技有限公司' }],
  creator: '荣旺健康',
  publisher: '香港荣旺健康科技有限公司',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: '荣旺健康 | AI健康检测与跨境保健品平台',
    description: '3分钟AI健康检测，为你和家人匹配最适合的日常健康方案。',
    locale: 'zh_HK',
    type: 'website',
    siteName: '荣旺健康',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: '荣旺健康' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '荣旺健康 | AI健康检测与跨境保健品平台',
    description: '3分钟AI健康检测，为你和家人匹配最适合的日常健康方案。',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://rongwang.health'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d9488',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationJsonLd()),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-white text-slate-900">
        <Analytics />
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

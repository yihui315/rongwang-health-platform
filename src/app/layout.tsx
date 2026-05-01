import "./globals.css";
import type { Metadata, Viewport } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Analytics from "@/components/layout/Analytics";
import ChatWidget from "@/components/marketing/ChatWidget";
import ExitIntentPopup from "@/components/marketing/ExitIntentPopup";
import { CartProvider } from "@/lib/cart-context";
import { generateOrganizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "荣旺健康 | AI健康评估与跨境营养支持",
    template: "%s | 荣旺健康",
  },
  description:
    "先做3分钟AI健康评估，了解风险分层、生活方式建议和营养支持方向，再进入对应方案与可控购买入口。",
  keywords: [
    "荣旺健康",
    "AI健康评估",
    "跨境保健品",
    "营养支持",
    "睡眠评估",
    "疲劳评估",
    "免疫支持",
    "压力管理",
  ],
  authors: [{ name: "香港荣旺健康科技有限公司" }],
  creator: "荣旺健康",
  publisher: "香港荣旺健康科技有限公司",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "荣旺健康 | 先评估，再选择适合的健康支持方向",
    description:
      "3分钟AI健康评估，生成教育型健康报告、风险提示和方案入口。内容仅供健康教育参考，不替代医生诊断。",
    locale: "zh_CN",
    type: "website",
    siteName: "荣旺健康",
    images: [
      {
        url: "/images/visual-v2/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "荣旺健康AI评估入口",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "荣旺健康 | AI健康评估与跨境营养支持",
    description: "先评估风险和生活方式，再查看对应健康方案与购买入口。",
    images: ["/images/visual-v2/og-home.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://rongwang.health"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationJsonLd()),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Analytics />
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <ChatWidget />
          <ExitIntentPopup />
        </CartProvider>
      </body>
    </html>
  );
}

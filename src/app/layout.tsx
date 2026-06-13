import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Analytics from "@/components/layout/Analytics";
import ChatWidget from "@/components/marketing/ChatWidget";
import ExitIntentPopup from "@/components/marketing/ExitIntentPopup";
import { CartProvider } from "@/lib/cart-context";
import { generateOrganizationJsonLd } from "@/lib/seo";

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "1970 Uncle Darren's 恩科達倫 | 美国进口精准营养品牌",
    template: "%s | 1970 Uncle Darren's 恩科達倫",
  },
  description:
    "1970 Uncle Darren's 恩科達倫 — 专注精准营养，美国进口。心脏健康、骨骼健康、肠道健康、脑力提升四大产品线，男女分开配方，科学支持。",
  keywords: [
    "1970 Uncle Darren's",
    "恩科達倫",
    "精准营养",
    "美国进口营养品",
    "辅酶Q10",
    "益生菌",
    "跨境保健品",
    "心脏健康",
    "骨骼健康",
  ],
  authors: [{ name: "荣旺健康" }],
  creator: "荣旺健康",
  publisher: "荣旺健康",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "1970 Uncle Darren's 恩科達倫 | 美国进口精准营养",
    description:
      "专注精准营养，美国进口。心脏、骨骼、肠道、脑力四大健康产品线，男女分开配方。",
    locale: "zh_CN",
    type: "website",
    siteName: "1970 Uncle Darren's",
  },
  twitter: {
    card: "summary_large_image",
    title: "1970 Uncle Darren's 恩科達倫 | 美国进口精准营养",
    description: "专注精准营养，美国进口。心脏、骨骼、肠道、脑力四大健康产品线，男女分开配方。",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://rongwang.hk"),
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
      <body className={`font-sans antialiased ${notoSansSC.variable}`}>
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

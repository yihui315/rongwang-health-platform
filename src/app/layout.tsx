import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "荣旺健康 | 3分钟AI检测你的营养缺口 · 香港直邮",
  description:
    "90%中国人缺关键营养素。3分钟AI健康检测，生成专属补充方案。香港直邮，蓝帽认证，50,000+用户信赖。"
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "AI健康检测靠谱吗？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "基于30万+篇临床文献训练的AI营养建议工具，快速免费个性化分析营养缺口。非医疗诊断。"
      }
    },
    {
      "@type": "Question",
      name: "保健品是正品吗？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "100%正品保障假一赔十。品牌官方授权或原产地直采，香港自营仓发货，SGS检测报告可查。"
      }
    },
    {
      "@type": "Question",
      name: "多久见效？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "多数用户7-14天感受初步变化，30天后效果明显。建议连续补充90天。"
      }
    }
  ]
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "荣旺健康",
  url: "https://rongwanghealth.com",
  description: "AI驱动的全球精选保健品与OTC跨境直购平台"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

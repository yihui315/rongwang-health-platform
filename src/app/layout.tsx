import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ExperimentalBanner from "@/components/ui/ExperimentalBanner";

export const metadata: Metadata = {
  title: "荣旺健康 | AI健康检测与家庭健康管理平台",
  description: "3分钟AI健康检测，帮你和家人找到更适合的日常健康方案。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <ExperimentalBanner />
        {children}
        <Footer />
      </body>
    </html>
  );
}

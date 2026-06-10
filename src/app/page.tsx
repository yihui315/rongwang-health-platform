import HomePage1970 from "@/components/home/HomePage1970";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1970 Uncle Darren's 恩科達倫 | 美国进口精准营养品牌",
  description:
    "1970 Uncle Darren's 恩科達倫官方商城，美国进口膳食补充剂，男女分开配方，科学配比。辅酶Q10、NMN、益生菌、DHA等精准营养产品。",
  alternates: {
    canonical: "https://rongwang.hk",
  },
  openGraph: {
    title: "1970 Uncle Darren's 恩科達倫 | 美国进口精准营养品牌",
    description:
      "1970 Uncle Darren's 恩科達倫官方商城，美国进口膳食补充剂，男女分开配方，科学配比。",
    type: "website",
    locale: "zh_CN",
    images: [{
      url: "https://rongwang.hk/og-image.jpg",
      width: 1200,
      height: 630,
    }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  return <HomePage1970 />;
}

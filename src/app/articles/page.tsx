import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import ArticlesClient from '@/components/articles/ArticlesClient';

export const metadata: Metadata = {
  title: '健康知识库 | 荣旺健康',
  description: '基于最新研究的健康科普文章，帮你做出明智的健康选择。',
  alternates: {
    canonical: `${getSiteUrl()}/articles`,
  },
  openGraph: {
    title: '健康知识库 | 荣旺健康',
    description: '基于最新研究的健康科普文章，帮你做出明智的健康选择。',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function ArticlesPage() {
  return <ArticlesClient />;
}
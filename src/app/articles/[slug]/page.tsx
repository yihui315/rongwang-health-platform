type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold">文章：{slug}</h1>
      <p className="mt-4 text-slate-500">这里将放置文章详情模板。</p>
    </main>
  );
}

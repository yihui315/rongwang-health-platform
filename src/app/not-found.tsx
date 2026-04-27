import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-8xl font-black text-slate-200 mb-4">404</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">页面未找到</h1>
        <p className="text-slate-600 mb-8">
          你访问的页面不存在或已被移除。试试回到首页探索更多。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="rounded-full bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700 transition"
          >
            返回首页
          </Link>
          <Link
            href="/ai-consult"
            className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            开始AI检测
          </Link>
        </div>
      </div>
    </main>
  );
}

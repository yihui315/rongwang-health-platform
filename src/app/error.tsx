'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
          <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">出了点问题</h1>
        <p className="text-slate-600 mb-8">
          页面加载时遇到了一个错误。请尝试刷新页面。
        </p>
        <button
          onClick={reset}
          className="rounded-full bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700 transition"
        >
          重新加载
        </button>
      </div>
    </main>
  );
}

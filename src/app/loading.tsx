export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="h-3 w-3 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-3 w-3 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-3 w-3 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-slate-500">加载中...</p>
      </div>
    </main>
  );
}

export default function Loading() {
  return (
    <main
      className="min-h-screen bg-slate-50"
      aria-busy="true"
      aria-label="Page content is loading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-16">
        <div className="h-8 w-48 animate-pulse rounded-full bg-slate-200" />
        <div className="h-12 w-full max-w-3xl animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-40 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-40 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-40 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    </main>
  );
}

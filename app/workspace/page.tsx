import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  verifyWorkspaceSessionToken,
  WORKSPACE_SESSION_COOKIE,
} from "@/src/lib/auth/session";

export default async function WorkspaceHomePage() {
  const cookieStore = await cookies();
  const session = await verifyWorkspaceSessionToken(cookieStore.get(WORKSPACE_SESSION_COOKIE)?.value);

  if (!session) {
    redirect('/login?next=/workspace');
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <WorkspaceSessionBar session={session} />
        <h1 className="mt-3 text-4xl font-bold">运营工作台（本地演示版）</h1>
        <p className="mt-4 max-w-3xl leading-8 text-slate-600">
          这一版不是正式后台，而是给你本地验证“商品导入 → 内容生成”的最小工作流。
          你可以先导入一个链接，再点击生成内容，理解整个 Agent 中台以后要怎么工作。
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link href="/workspace/import" className="rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-emerald-300 hover:shadow">
            <h2 className="text-xl font-semibold">1. 商品导入</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              输入京东或拼多多商品链接，触发 mock 抓取 Agent，得到标准化商品对象。
            </p>
          </Link>

          <Link href="/workspace/generate" className="rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-emerald-300 hover:shadow">
            <h2 className="text-xl font-semibold">2. 内容生成</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              选择已导入商品，一键生成标题、描述、FAQ、SEO 关键词与合规声明草稿。
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}

function WorkspaceSessionBar({
  session,
}: {
  session: { email: string } | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
        Workspace
      </p>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        {session ? <span>已登录：{session.email}</span> : null}
        <form method="post" action="/api/auth/logout">
          <button className="rounded-full border border-slate-300 px-3 py-1 font-medium hover:border-emerald-400" type="submit">
            退出登录
          </button>
        </form>
      </div>
    </div>
  );
}

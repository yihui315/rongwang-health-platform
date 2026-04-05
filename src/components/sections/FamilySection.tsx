import Link from "next/link";

export default function FamilySection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold">一套账号，管理全家健康</h2>
            <p className="mt-4 leading-7 text-slate-500">
              不只是照顾自己，也能一起照顾父母、配偶和孩子。
              为每位家庭成员建立档案，分别检测、分别推荐、统一管理。
            </p>
            <Link
              href="/family"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-7 py-4 font-semibold text-white"
            >
              了解家庭健康计划
            </Link>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">父母档案</div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">配偶档案</div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">孩子档案</div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">家庭月报</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

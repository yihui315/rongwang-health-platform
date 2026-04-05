import Link from "next/link";

export default function SubscriptionSection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold">健康，不该总是断断续续</h2>
            <p className="mt-4 leading-7 text-slate-500">
              订阅制方案，让你更省心地持续执行、自动补货、自动提醒、自动复盘。
            </p>
            <Link
              href="/subscription"
              className="mt-6 inline-flex rounded-full bg-orange px-7 py-4 font-semibold text-white"
            >
              了解订阅计划
            </Link>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8">
            <div className="grid gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">30天方案</div>
              <div className="rounded-2xl bg-slate-50 p-4">60天方案</div>
              <div className="rounded-2xl bg-slate-50 p-4">90天方案</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

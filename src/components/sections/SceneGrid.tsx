import Link from "next/link";

const scenes = [
  { title: "持续疲劳", desc: "下午犯困、咖啡依赖", href: "/quiz?pre=fatigue" },
  { title: "睡眠不好", desc: "入睡困难、夜里醒来", href: "/quiz?pre=sleep" },
  { title: "免疫力低", desc: "换季容易感冒", href: "/quiz?pre=immune" },
  { title: "压力焦虑", desc: "长期紧绷、情绪波动", href: "/quiz?pre=stress" }
];

export default function SceneGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold">你最关心哪种健康问题？</h2>
        <p className="mt-3 text-slate-500">选择最符合你的状态，AI 会优先帮你分析</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {scenes.map((scene) => (
          <Link
            key={scene.title}
            href={scene.href}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-lg font-semibold">{scene.title}</div>
            <div className="mt-2 text-sm text-slate-500">{scene.desc}</div>
            <div className="mt-6 text-sm font-semibold text-teal">开始检测 →</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

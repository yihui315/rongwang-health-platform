import Link from "next/link";

const scenes = [
  {
    title: "每天下午崩溃",
    desc: "抗疲劳方案",
    icon: "⚡️",
    href: "/quiz?pre=fatigue",
    bg: "bg-orange-50"
  },
  {
    title: "经常感冒",
    desc: "免疫增强方案",
    icon: "🛡",
    href: "/quiz?pre=immune",
    bg: "bg-teal-bg"
  },
  {
    title: "睡不醒 / 焦虑",
    desc: "睡眠改善方案",
    icon: "🌙",
    href: "/quiz?pre=sleep",
    bg: "bg-purple-50"
  },
  {
    title: "压力大",
    desc: "综合压力缓解方案",
    icon: "😣",
    href: "/quiz?pre=stress",
    bg: "bg-red-50"
  }
];

export default function SceneGrid() {
  return (
    <section id="scenes" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          选你的主要困扰
          <br />
          一键生成专属方案
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        {scenes.map((scene) => (
          <Link
            key={scene.title}
            href={scene.href}
            className={`group rounded-3xl ${scene.bg} border-2 border-transparent p-8 text-center transition hover:-translate-y-2 hover:border-teal hover:shadow-xl`}
          >
            <span className="mb-5 block text-5xl">{scene.icon}</span>
            <div className="text-xl font-bold">{scene.title}</div>
            <div className="mt-2 text-sm text-slate-500">{scene.desc}</div>
            <span className="mt-5 inline-block rounded-full bg-black/5 px-5 py-2 text-sm font-semibold transition group-hover:bg-teal group-hover:text-white">
              开始检测 →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

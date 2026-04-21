import Link from "next/link";
import Image from "next/image";

const scenes = [
  {
    title: "持续疲劳",
    desc: "下午犯困、咖啡依赖、精力不足",
    href: "/quiz?pre=fatigue",
    gradient: "from-amber-500/90 to-orange-600/90",
    image: "/images/scenes/scene-fatigue.png",
    iconPath: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  },
  {
    title: "睡眠不好",
    desc: "入睡困难、夜里醒来、多梦浅睡",
    href: "/quiz?pre=sleep",
    gradient: "from-indigo-500/90 to-violet-700/90",
    image: "/images/scenes/scene-sleep.png",
    iconPath: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
  },
  {
    title: "免疫力低",
    desc: "换季容易感冒、身体恢复慢",
    href: "/quiz?pre=immune",
    gradient: "from-emerald-500/90 to-teal-700/90",
    image: "/images/scenes/scene-immune.png",
    iconPath: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
  {
    title: "压力焦虑",
    desc: "长期紧绷、情绪波动、注意力差",
    href: "/quiz?pre=stress",
    gradient: "from-rose-500/90 to-pink-700/90",
    image: "/images/scenes/scene-stress.png",
    iconPath: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
  },
];

export default function SceneGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-24">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          你最关心哪种健康问题？
        </h2>
        <p className="mt-3 text-lg text-slate-500">
          选择最符合你的状态，AI 会优先帮你分析
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {scenes.map((scene, idx) => (
          <Link
            key={scene.title}
            href={scene.href}
            className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-up h-64"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* Background image */}
            <Image
              src={scene.image}
              alt={scene.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${scene.gradient}`} />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-6 text-white z-10">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 border border-white/10">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={scene.iconPath} />
                </svg>
              </div>
              <h3 className="text-xl font-bold tracking-tight">{scene.title}</h3>
              <p className="mt-1 text-[13px] text-white/80 leading-relaxed">{scene.desc}</p>
              <div className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-white/90 group-hover:text-white transition-colors">
                开始检测
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

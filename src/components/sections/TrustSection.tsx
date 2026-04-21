import Image from "next/image";

const trustItems = [
  {
    title: '香港直邮',
    desc: '保税仓发货，物流全程可追踪',
    iconPath: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
  },
  {
    title: '正品保障',
    desc: '来源透明，品质与批次可溯源',
    iconPath: 'M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z',
  },
  {
    title: '科学方案',
    desc: '基于健康类型和营养科学设计',
    iconPath: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5',
  },
  {
    title: '灵活订阅',
    desc: '可暂停、可调整、随时可取消',
    iconPath: 'M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3',
  },
  {
    title: 'AI 建议',
    desc: '帮助你更清楚地理解自己',
    iconPath: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z',
  },
];

export default function TrustSection() {
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Top visual — trust images row */}
        <div className="mb-16 grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-56">
            <Image src="/images/trust/trust-lab.png" alt="实验室检测" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="absolute bottom-3 left-3 text-[12px] font-semibold text-white">三方纯度检测</span>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-56">
            <Image src="/images/trust/trust-report.png" alt="品质报告" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="absolute bottom-3 left-3 text-[12px] font-semibold text-white">cGMP 认证</span>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-56">
            <Image src="/images/life/life-zen.png" alt="健康生活" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="absolute bottom-3 left-3 text-[12px] font-semibold text-white">健康生活方式</span>
          </div>
        </div>

        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            为什么选择荣旺健康
          </h2>
          <p className="mt-3 text-lg text-slate-500">
            我们更重视科学、合规与长期服务
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {trustItems.map((item, idx) => (
            <div
              key={item.title}
              className="group rounded-2xl bg-slate-50/70 border border-slate-100 p-5 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="h-10 w-10 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center mb-4 group-hover:bg-teal-50 group-hover:border-teal-200/60 transition-colors">
                <svg className="h-5 w-5 text-slate-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                </svg>
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">{item.title}</h3>
              <p className="mt-1 text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

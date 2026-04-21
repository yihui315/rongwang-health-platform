import Link from 'next/link';

const footerLinks = {
  solutions: [
    { href: '/plans/fatigue', label: '抗疲劳组合' },
    { href: '/plans/sleep', label: '深度睡眠组合' },
    { href: '/plans/immune', label: '免疫防护组合' },
    { href: '/plans/stress', label: '压力缓解组合' },
  ],
  resources: [
    { href: '/quiz', label: 'AI 健康检测' },
    { href: '/articles', label: '健康百科' },
    { href: '/products', label: '全部商品' },
    { href: '/subscription', label: '订阅计划' },
  ],
  support: [
    { href: '/shipping', label: '配送与退货' },
    { href: '/privacy', label: '隐私政策' },
    { href: '/terms', label: '服务条款' },
    { href: '/family', label: '家庭健康' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Main grid */}
        <div className="grid gap-12 py-16 md:grid-cols-6 lg:grid-cols-12">
          {/* Brand column */}
          <div className="md:col-span-3 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 text-white text-sm font-black shadow-sm">
                荣
              </span>
              <span className="text-lg font-bold text-slate-900 tracking-tight">荣旺健康</span>
            </Link>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500 max-w-xs">
              AI 驱动的个性化营养方案平台。为您和家人的健康保驾护航，香港保税仓直邮。
            </p>

            {/* Social */}
            <div className="mt-6 flex items-center gap-2.5">
              <a
                href="https://wa.me/85212345678"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600 transition-all"
                aria-label="WhatsApp"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href="mailto:support@rongwang.health"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-teal-50 hover:text-teal-600 transition-all"
                aria-label="Email"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/rongwang.health"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-all"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-1 lg:col-span-2">
            <h4 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider mb-4">健康方案</h4>
            <ul className="space-y-2.5">
              {footerLinks.solutions.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-slate-500 hover:text-slate-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-1 lg:col-span-2">
            <h4 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider mb-4">了解更多</h4>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-slate-500 hover:text-slate-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-1 lg:col-span-2">
            <h4 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider mb-4">服务支持</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-slate-500 hover:text-slate-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="mailto:support@rongwang.health" className="text-[14px] text-slate-500 hover:text-slate-900 transition-colors">
                  support@rongwang.health
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter mini — placed in last column on large screens */}
          <div className="md:col-span-6 lg:col-span-12">
            <div className="border-t border-slate-100 pt-8 mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-[13px] text-slate-400">
                &copy; 2026 香港榮旺健康科技有限公司. All rights reserved.
              </p>
              <p className="text-[12px] text-slate-400 max-w-md md:text-right">
                膳食补充剂不能替代药物治疗。本网站内容仅供参考，不构成医疗建议。如有疑问请咨询医生。
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

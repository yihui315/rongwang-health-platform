import Link from "next/link";
import NewsletterSignup from "@/components/marketing/NewsletterSignup";

const footerLinks = {
  solutions: [
    { href: "/solutions/fatigue", label: "疲劳恢复方案" },
    { href: "/solutions/sleep", label: "睡眠支持方案" },
    { href: "/solutions/immune", label: "免疫支持方案" },
    { href: "/solutions/female-health", label: "女性健康支持" },
    { href: "/solutions/male-health", label: "男性健康支持" },
  ],
  resources: [
    { href: "/ai-consult", label: "AI健康评估" },
    { href: "/assessment/sleep", label: "免费自测入口" },
    { href: "/articles", label: "健康内容" },
    { href: "/products", label: "商品库" },
  ],
  support: [
    { href: "/shipping", label: "配送与售后" },
    { href: "/privacy", label: "隐私政策" },
    { href: "/terms", label: "服务条款" },
    { href: "/family", label: "家庭健康档案" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-14 md:grid-cols-6 lg:grid-cols-12">
          <div className="md:col-span-3 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-strong)] text-sm font-bold text-white">
                荣
              </span>
              <span className="text-lg font-bold text-[var(--text-primary)]">荣旺健康</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-secondary)]">
              荣旺健康以AI评估为入口，帮助用户先理解风险、生活方式和营养支持方向，再谨慎查看方案与购买入口。
            </p>
            <p className="mt-4 max-w-sm text-xs leading-6 text-[var(--text-muted)]">
              本站内容仅用于健康教育和一般参考，不构成医学诊断、治疗建议或处方。症状严重或持续时，请优先咨询医生或药师。
            </p>
          </div>

          <FooterColumn title="健康方案" links={footerLinks.solutions} />
          <FooterColumn title="评估与内容" links={footerLinks.resources} />
          <FooterColumn title="服务支持" links={footerLinks.support} />

          <div className="md:col-span-3 lg:col-span-3">
            <NewsletterSignup variant="footer" />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] py-6 text-xs text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 香港荣旺健康科技有限公司. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <a href="mailto:support@rongwang.health" className="hover:text-[var(--teal-dark)]">
              support@rongwang.health
            </a>
            <a
              href="https://wa.me/85212345678"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--teal-dark)]"
            >
              WhatsApp客服
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="md:col-span-1 lg:col-span-2">
      <h4 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--teal-dark)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

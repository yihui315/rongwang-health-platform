import Link from "next/link";
import NewsletterSignup from "@/components/marketing/NewsletterSignup";

const footerLinks = {
  products: [
    { href: "/products/category/heart", label: "心臟與血管" },
    { href: "/products/category/bone", label: "關節與骨骼" },
    { href: "/products/category/gut", label: "腸道健康" },
    { href: "/products/category/brain", label: "腦力與認知" },
    { href: "/products/bundles", label: "營養包套裝" },
  ],
  brand: [
    { href: "/brand", label: "品牌故事" },
    { href: "/brand#story", label: "品牌起源" },
    { href: "/brand#certifications", label: "認證資質" },
    { href: "/trust-center", label: "信任中心" },
    { href: "/shop", label: "購買渠道" },
  ],
  quick: [
    { href: "/ai-consult", label: "AI健康评估" },
    { href: "/shop", label: "正品購買入口" },
    { href: "/articles", label: "健康知識" },
    { href: "/solutions/sleep", label: "健康方案" },
  ],
  support: [
    { href: "/shipping", label: "配送與售後" },
    { href: "/privacy", label: "隱私政策" },
    { href: "/terms", label: "服務條款" },
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
              <span className="text-lg font-bold text-[var(--text-primary)]">香港荣旺健康</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-secondary)]">
              香港榮旺健康科技有限公司，專注精準營養，美国进口。1970 Uncle Darren's 恩科達倫授權戰略合作夥伴，男女分開配方，科學配比。
            </p>
            <p className="mt-4 max-w-sm text-xs leading-6 text-[var(--text-muted)]">
              本站内容仅用于健康教育和一般参考，不构成医学诊断、治疗建议或处方。症状严重或持续时，请优先咨询医生或药师。
            </p>
          </div>

          <FooterColumn title="產品分類" links={footerLinks.products} />
          <FooterColumn title="品牌故事" links={footerLinks.brand} />
          <FooterColumn title="快速入口" links={footerLinks.quick} />
          <FooterColumn title="服務支援" links={footerLinks.support} />

          <div className="md:col-span-3 lg:col-span-3">
            <NewsletterSignup variant="footer" />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] py-6 text-xs text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 香港榮旺健康科技有限公司. All rights reserved.</p>
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

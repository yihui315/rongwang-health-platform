import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const files = {
  "README.md": `# 荣旺健康 RongWang Health

荣旺健康是一个面向中国家庭的 AI 健康决策与执行平台，帮助用户从健康检测、个性化方案、内容教育、订阅执行到家庭健康管理，形成完整闭环。

## 产品目标
- 3分钟AI健康检测
- 个性化健康方案推荐
- 家庭健康管理
- 订阅制持续执行
- 风险预警与合规提示
- SEO / GEO 内容中台

## 核心模块
- 首页
- AI检测
- 方案页
- 内容中心
- 家庭健康
- 订阅系统
- 打卡系统
- 风险预警
- 后台管理

## 技术栈
- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: FastAPI / NestJS
- Database: PostgreSQL
- Cache: Redis
- AI: Ollama + Qwen3
- Analytics: GA4 / Umami

## 开发原则
- 结果导向
- 合规优先
- 证据驱动
- 长期执行
- 家庭视角

## 当前状态
这是项目的第一版初始化仓库结构，后续将逐步实现：
1. 首页重构
2. AI检测流程
3. 方案页模板
4. 内容中心
5. 家庭健康模块
6. 订阅与打卡系统
7. 后端 API 与数据模型
`,
  ".gitignore": `# dependencies
node_modules
.pnp
.pnp.js

# Next.js / build
.next
out
dist
build

# logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# env
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# macOS
.DS_Store

# IDE
.vscode
.idea

# Python
__pycache__/
*.pyc
.venv/
venv/
.envrc

# database
*.sqlite
*.db

# misc
coverage
*.tgz
`,
  "package.json": `{
  "name": "rongwang-health-platform",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "scaffold": "node scripts/scaffold.mjs"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.6.0"
  }
}
`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`,
  "next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: []
  }
};

module.exports = nextConfig;
`,
  "postcss.config.js": `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
`,
  "tailwind.config.ts": `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#00D4C8",
          dark: "#00b3a8",
          light: "#33ded4",
          bg: "#E0F8F5"
        },
        orange: {
          DEFAULT: "#FF6B00",
          light: "#FF8533"
        },
        text: {
          primary: "#1F2937",
          secondary: "#4B5563",
          muted: "#64748B"
        }
      },
      borderRadius: {
        xl: "24px",
        "2xl": "32px"
      }
    }
  },
  plugins: []
};

export default config;
`,
  "src/app/globals.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --teal: #00D4C8;
  --teal-dark: #00b3a8;
  --orange: #FF6B00;
  --orange-light: #FF8533;
  --bg: #F8FAFC;
  --white: #FFFFFF;
  --text: #1F2937;
  --text2: #4B5563;
  --text3: #64748B;
  --border: #E2E8F0;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: Inter, "Noto Sans SC", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
}
`,
  "src/app/layout.tsx": `import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "荣旺健康 | AI健康检测与家庭健康管理平台",
  description: "3分钟AI健康检测，帮你和家人找到更适合的日常健康方案。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
`,
  "src/app/page.tsx": `import HeroSection from "@/components/sections/HeroSection";
import SceneGrid from "@/components/sections/SceneGrid";
import PlanGrid from "@/components/sections/PlanGrid";
import FamilySection from "@/components/sections/FamilySection";
import ContentSection from "@/components/sections/ContentSection";
import TrustSection from "@/components/sections/TrustSection";
import SubscriptionSection from "@/components/sections/SubscriptionSection";
import FaqSection from "@/components/sections/FaqSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <SceneGrid />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">热门健康方案</h2>
          <p className="mt-3 text-slate-500">
            不是单品，而是基于问题类型设计的组合方案
          </p>
        </div>
        <PlanGrid />
      </section>
      <FamilySection />
      <ContentSection />
      <TrustSection />
      <SubscriptionSection />
      <FaqSection />
    </main>
  );
}
`,
  "src/components/layout/Header.tsx": `import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold text-teal">
          荣旺健康
        </Link>

        <nav className="hidden gap-8 md:flex text-sm text-slate-600">
          <Link href="/quiz">AI检测</Link>
          <Link href="/plans/fatigue">方案中心</Link>
          <Link href="/articles">健康百科</Link>
          <Link href="/family">家庭健康</Link>
          <Link href="/subscription">订阅计划</Link>
        </nav>

        <Link
          href="/quiz"
          className="rounded-full bg-orange px-5 py-3 text-sm font-semibold text-white"
        >
          立即AI检测
        </Link>
      </div>
    </header>
  );
}
`,
  "src/components/layout/Footer.tsx": `export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-slate-500">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>© 2026 荣旺健康 · AI健康检测与家庭健康管理平台</p>
          <p>健康建议仅供参考，不替代医生诊断。</p>
        </div>
      </div>
    </footer>
  );
}
`,
  "src/components/ui/Button.tsx": `import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
};

export default function Button({ children, className = "" }: ButtonProps) {
  return (
    <button className={\`rounded-full px-5 py-3 font-semibold transition \${className}\`}>
      {children}
    </button>
  );
}
`,
  "src/components/ui/Card.tsx": `import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={\`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm \${className}\`}>
      {children}
    </div>
  );
}
`,
  "src/components/ui/Badge.tsx": `import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span className={\`inline-flex rounded-full px-4 py-2 text-sm font-medium \${className}\`}>
      {children}
    </span>
  );
}
`,
  "src/components/ui/SectionHeader.tsx": `type SectionHeaderProps = {
  title: string;
  description?: string;
};

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold">{title}</h2>
      {description ? <p className="mt-3 text-slate-500">{description}</p> : null}
    </div>
  );
}
`,
  "src/components/ui/Accordion.tsx": `type AccordionProps = {
  items: { question: string; answer: string }[];
};

export default function Accordion({ items }: AccordionProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <details key={item.question} className="rounded-2xl border border-slate-200 bg-white p-5">
          <summary className="cursor-pointer font-semibold">{item.question}</summary>
          <p className="mt-3 leading-7 text-slate-500">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
`,
  "src/components/sections/HeroSection.tsx": `import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-slate-50 to-teal-bg py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2 md:items-center">
        <div>
          <div className="mb-4 inline-flex rounded-full border border-teal/20 bg-white px-4 py-2 text-sm font-medium text-teal-dark">
            3分钟AI健康检测 · 家庭健康管理
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            把健康管理，变得更简单
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            3分钟AI检测，帮你和家人找到更适合的日常健康方案。
            从疲劳、睡眠、免疫、压力，到家庭成员健康管理，形成完整闭环。
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/quiz"
              className="rounded-full bg-teal px-8 py-4 font-semibold text-white shadow-lg shadow-teal/20"
            >
              开始AI检测
            </Link>
            <Link
              href="/plans/fatigue"
              className="rounded-full border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-700"
            >
              了解健康方案
            </Link>
          </div>
          <div className="mt-10 flex gap-8 text-sm text-slate-500">
            <div>
              <div className="text-2xl font-bold text-slate-900">52,847+</div>
              <div>完成检测</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">98.7%</div>
              <div>用户满意度</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">HK</div>
              <div>直邮保障</div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl shadow-teal/10">
          <div className="rounded-3xl bg-slate-50 p-6">
            <div className="text-sm font-medium text-slate-500">AI健康仪表盘</div>
            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">当前健康类型</div>
                <div className="mt-1 text-xl font-bold">高压力 + 营养流失型</div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">优先改善项</div>
                <div className="mt-1 text-xl font-bold">疲劳 / 睡眠 / 压力</div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">推荐方案</div>
                <div className="mt-1 text-xl font-bold">抗疲劳组合</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`,
  "src/components/sections/SceneGrid.tsx": `import Link from "next/link";

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
`,
  "src/components/sections/PlanGrid.tsx": `import Link from "next/link";

const plans = [
  {
    title: "抗疲劳组合",
    desc: "适合长期忙碌、精力容易透支的人群",
    href: "/plans/fatigue"
  },
  {
    title: "深度睡眠组合",
    desc: "适合入睡困难、浅睡、夜醒频繁的人群",
    href: "/plans/sleep"
  },
  {
    title: "免疫防护组合",
    desc: "适合换季易感冒、身体防御力偏弱的人群",
    href: "/plans/immune"
  },
  {
    title: "压力缓解组合",
    desc: "适合长期紧绷、焦虑、状态不稳定的人群",
    href: "/plans/stress"
  }
];

export default function PlanGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <Link
          key={plan.title}
          href={plan.href}
          className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="text-xl font-bold">{plan.title}</div>
          <div className="mt-3 text-sm leading-6 text-slate-500">{plan.desc}</div>
          <div className="mt-6 text-sm font-semibold text-teal">查看方案详情 →</div>
        </Link>
      ))}
    </div>
  );
}
`,
  "src/components/sections/FamilySection.tsx": `import Link from "next/link";

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
`,
  "src/components/sections/ContentSection.tsx": `import Link from "next/link";

const articles = [
  { title: "为什么你总是疲劳？", slug: "why-fatigue" },
  { title: "为什么你总是睡不好？", slug: "why-sleep-bad" },
  { title: "换季为什么总容易不舒服？", slug: "why-immune-low" },
  { title: "压力大时，身体会发生什么？", slug: "why-stress-body" }
];

export default function ContentSection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">科学解答你的健康困扰</h2>
          <p className="mt-3 text-slate-500">
            基于临床文献和营养学研究，帮助你更好理解健康问题
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={\`/articles/\${article.slug}\`}
              className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-lg font-semibold">{article.title}</div>
              <div className="mt-4 text-sm text-teal">阅读全文 →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
`,
  "src/components/sections/TrustSection.tsx": `export default function TrustSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">为什么选择荣旺健康</h2>
          <p className="mt-3 text-slate-500">
            我们更重视科学、合规与长期服务，而不是短期营销
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["香港直邮", "稳定配送，清晰可追踪"],
            ["正品保障", "坚持来源透明与品质可溯源"],
            ["科学方案", "基于健康类型和使用逻辑设计"],
            ["灵活订阅", "可暂停、可调整、可取消"],
            ["AI建议", "帮助你更清楚地理解自己"]
          ].map(([title, desc]) => (
            <div key={title} className="rounded-3xl border border-slate-200 p-6">
              <div className="text-lg font-semibold">{title}</div>
              <div className="mt-2 text-sm text-slate-500">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,
  "src/components/sections/SubscriptionSection.tsx": `import Link from "next/link";

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
`,
  "src/components/sections/FaqSection.tsx": `import Accordion from "@/components/ui/Accordion";

const items = [
  {
    question: "AI检测靠谱吗？",
    answer:
      "我们的AI会根据你的年龄、性别、症状、睡眠和生活方式综合分析，帮助你找到更适合的健康方向。它是营养建议工具，不代替医生诊断。"
  },
  {
    question: "产品都是正品吗？",
    answer:
      "我们坚持正品保障，所有产品支持来源与批次追踪。"
  },
  {
    question: "多久能看到变化？",
    answer:
      "每个人状态不同，通常需要一段持续执行周期，建议至少连续使用30天并观察变化。"
  },
  {
    question: "订阅可以取消吗？",
    answer:
      "可以，支持灵活暂停和取消。"
  }
];

export default function FaqSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">你可能想知道的</h2>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}
`,
  "src/data/plans.ts": `export const plans = [
  {
    slug: "fatigue",
    name: "抗疲劳组合",
    type: "高压力 + 营养流失型",
    description: "适合长期忙碌、精力容易透支的人群",
    ingredients: ["活性B族", "螯合镁", "Omega-3"],
    price: 299
  },
  {
    slug: "sleep",
    name: "深度睡眠组合",
    type: "神经兴奋型失眠",
    description: "适合入睡困难、浅睡、夜醒频繁的人群",
    ingredients: ["GABA", "镁", "褪黑素"],
    price: 259
  },
  {
    slug: "immune",
    name: "免疫防护组合",
    type: "免疫防线薄弱型",
    description: "适合换季易感冒、身体防御力偏弱的人群",
    ingredients: ["维C", "锌", "维D3", "接骨木莓"],
    price: 349
  },
  {
    slug: "stress",
    name: "压力缓解组合",
    type: "HPA轴过度激活型",
    description: "适合长期紧绷、焦虑、状态不稳定的人群",
    ingredients: ["B族", "镁", "适应原草本"],
    price: 399
  }
];
`,
  "src/data/scenes.ts": `export const scenes = [
  { title: "持续疲劳", desc: "下午犯困、咖啡依赖", href: "/quiz?pre=fatigue" },
  { title: "睡眠不好", desc: "入睡困难、夜里醒来", href: "/quiz?pre=sleep" },
  { title: "免疫力低", desc: "换季容易感冒", href: "/quiz?pre=immune" },
  { title: "压力焦虑", desc: "长期紧绷、情绪波动", href: "/quiz?pre=stress" }
];
`,
  "src/data/faqs.ts": `export const faqs = [
  {
    question: "AI检测靠谱吗？",
    answer:
      "我们的AI会根据你的年龄、性别、症状、睡眠和生活方式综合分析，帮助你找到更适合的健康方向。它是营养建议工具，不代替医生诊断。"
  },
  {
    question: "产品都是正品吗？",
    answer:
      "我们坚持正品保障，所有产品支持来源与批次追踪。"
  }
];
`,
  "src/data/articles.ts": `export const articles = [
  { title: "为什么你总是疲劳？", slug: "why-fatigue" },
  { title: "为什么你总是睡不好？", slug: "why-sleep-bad" },
  { title: "换季为什么总容易不舒服？", slug: "why-immune-low" },
  { title: "压力大时，身体会发生什么？", slug: "why-stress-body" }
];
`,
  "src/lib/utils.ts": `export function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
`,
  "src/lib/compliance.ts": `export const riskWords = [
  "治愈",
  "根治",
  "保证有效",
  "立刻见效",
  "第一",
  "最强",
  "无副作用"
];

export function hasRiskWords(text: string) {
  return riskWords.some((word) => text.includes(word));
}
`,
  "src/lib/analytics.ts": `export function track(event: string, payload?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    console.log("[analytics]", event, payload ?? {});
  }
}
`,
  "src/lib/api.ts": `export async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(\`Request failed: \${res.status}\`);
  }
  return res.json() as Promise<T>;
}
`,
  "src/types/index.ts": `export type PlanSlug = "fatigue" | "sleep" | "immune" | "stress";

export interface Plan {
  slug: PlanSlug;
  name: string;
  type: string;
  description: string;
  ingredients: string[];
  price: number;
}
`,
  "src/app/quiz/page.tsx": `export default function QuizPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold">AI健康检测</h1>
      <p className="mt-4 text-slate-500">
        这里将放置完整的分步检测流程、风险筛查和结果分析。
      </p>
    </main>
  );
}
`,
  "src/app/plans/fatigue/page.tsx": `export default function FatiguePlanPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold">抗疲劳组合</h1>
      <p className="mt-4 text-slate-500">这里将放置疲劳方案页的完整结构。</p>
    </main>
  );
}
`,
  "src/app/plans/sleep/page.tsx": `export default function SleepPlanPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold">深度睡眠组合</h1>
      <p className="mt-4 text-slate-500">这里将放置睡眠方案页的完整结构。</p>
    </main>
  );
}
`,
  "src/app/plans/immune/page.tsx": `export default function ImmunePlanPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold">免疫防护组合</h1>
      <p className="mt-4 text-slate-500">这里将放置免疫方案页的完整结构。</p>
    </main>
  );
}
`,
  "src/app/plans/stress/page.tsx": `export default function StressPlanPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold">压力缓解组合</h1>
      <p className="mt-4 text-slate-500">这里将放置压力方案页的完整结构。</p>
    </main>
  );
}
`,
  "src/app/articles/page.tsx": `import Link from "next/link";

export default function ArticlesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-4xl font-bold">健康百科</h1>
      <p className="mt-4 text-slate-500">内容中心首页占位。</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Link href="/articles/why-fatigue" className="rounded-2xl border bg-white p-5">
          为什么你总是疲劳？
        </Link>
        <Link href="/articles/why-sleep-bad" className="rounded-2xl border bg-white p-5">
          为什么你总是睡不好？
        </Link>
      </div>
    </main>
  );
}
`,
  "src/app/articles/[slug]/page.tsx": `type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold">文章：{slug}</h1>
      <p className="mt-4 text-slate-500">这里将放置文章详情模板。</p>
    </main>
  );
}
`,
  "src/app/family/page.tsx": `export default function FamilyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold">家庭健康</h1>
      <p className="mt-4 text-slate-500">这里将放置家庭成员档案、家庭总览和家庭订阅。</p>
    </main>
  );
}
`,
  "src/app/subscription/page.tsx": `export default function SubscriptionPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold">订阅计划</h1>
      <p className="mt-4 text-slate-500">这里将放置订阅制、自动补货、暂停/取消和执行管理。</p>
    </main>
  );
}
`,
  "src/app/dashboard/page.tsx": `export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-bold">我的健康档案</h1>
      <p className="mt-4 text-slate-500">这里将放置用户健康档案、检测记录、打卡和报告。</p>
    </main>
  );
}
`,
  "backend/README.md": `# Backend Plan

Recommended stack:
- FastAPI or NestJS
- PostgreSQL
- Redis
- JWT auth
- AI recommendation service
- Risk filtering service
- Subscription & check-in service

Core entities:
- User
- FamilyMember
- Checkup
- Recommendation
- Plan
- Subscription
- Checkin
- RiskAlert
- Article
`
};

async function ensureFile(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
  console.log(`wrote ${path}`);
}

for (const [path, content] of Object.entries(files)) {
  await ensureFile(path, content);
}

console.log("done");
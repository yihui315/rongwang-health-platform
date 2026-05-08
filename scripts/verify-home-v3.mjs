import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'src/lib/home/home-content.ts',
  'src/components/home/HomeHero.tsx',
  'src/components/home/HomeTrustBar.tsx',
  'src/components/home/HomeSteps.tsx',
  'src/components/home/HomeHealthDirections.tsx',
  'src/components/home/HomeExpertTrust.tsx',
  'src/components/home/HomeProductPreview.tsx',
  'src/components/home/HomeTestimonials.tsx',
  'src/components/home/HomeFAQ.tsx',
  'src/components/home/HomePageV3.tsx',
  'app/ai-consult/page.tsx',
  'app/assessment/[slug]/page.tsx',
  'app/solutions/[slug]/page.tsx',
  'public/images/home/rongwang-health-logo.png',
  'public/images/home/expert-consultant.webp',
  'public/images/home/direction-sleep.webp',
  'public/images/home/direction-fatigue.webp',
  'public/images/home/direction-immune.webp',
  'public/images/home/direction-female.webp',
  'public/images/home/product-sleep.webp',
  'public/images/home/product-immune.webp',
  'public/images/home/product-fatigue.webp',
];

const requiredSnippets = [
  {
    file: 'app/page.tsx',
    snippets: ['HomePageV3', 'return <HomePageV3 />'],
  },
  {
    file: 'app/layout.tsx',
    snippets: ['metadataBase: new URL("https://rongwang.hk")', 'AI评估', '健康方案', '官网商城', '健康内容'],
  },
  {
    file: 'src/components/home/HomeHero.tsx',
    snippets: [
      '3分钟 AI 健康评估',
      '找到更适合你的营养支持方向',
      '本报告仅供健康教育参考，不作为诊断依据。',
      '/ai-consult',
    ],
  },
  {
    file: 'src/components/home/HomeProductPreview.tsx',
    snippets: ['方案推荐方向（示例）', '完整推荐将在评估后为你展示', '具体推荐以评估结果为准', '产品示意图'],
  },
  {
    file: 'src/components/home/HomeHealthDirections.tsx',
    snippets: ['方向场景图', 'home-direction-visual'],
  },
  {
    file: 'src/components/home/HomeExpertTrust.tsx',
    snippets: ['/images/home/expert-consultant.webp', '健康顾问正在整理营养建议'],
  },
  {
    file: 'app/layout.tsx',
    snippets: ['/images/home/rongwang-health-logo.png', '荣旺健康 Rongwang Health'],
  },
  {
    file: 'src/components/home/HomeFAQ.tsx',
    snippets: ['AI评估仅提供健康教育参考，不作为诊断依据；中高风险建议优先就医并咨询医生。'],
  },
];

const bannedHomeTerms = ['治疗', '治愈', '保证有效', '精准诊断', '无副作用', '适合所有人', '医生推荐'];
const homeTextFiles = [
  'src/lib/home/home-content.ts',
  'src/components/home/HomeHero.tsx',
  'src/components/home/HomeTrustBar.tsx',
  'src/components/home/HomeSteps.tsx',
  'src/components/home/HomeHealthDirections.tsx',
  'src/components/home/HomeExpertTrust.tsx',
  'src/components/home/HomeProductPreview.tsx',
  'src/components/home/HomeTestimonials.tsx',
  'src/components/home/HomeFAQ.tsx',
  'src/components/home/HomePageV3.tsx',
  'app/page.tsx',
  'app/ai-consult/page.tsx',
  'app/assessment/[slug]/page.tsx',
  'app/solutions/[slug]/page.tsx',
];

const errors = [];

for (const file of requiredFiles) {
  if (!existsSync(path.join(root, file))) {
    errors.push(`Missing required file: ${file}`);
  }
}

for (const { file, snippets } of requiredSnippets) {
  const fullPath = path.join(root, file);
  if (!existsSync(fullPath)) {
    errors.push(`Cannot inspect missing file: ${file}`);
    continue;
  }

  const text = readFileSync(fullPath, 'utf8');
  for (const snippet of snippets) {
    if (!text.includes(snippet)) {
      errors.push(`Missing snippet in ${file}: ${snippet}`);
    }
  }
}

for (const file of homeTextFiles) {
  const fullPath = path.join(root, file);
  if (!existsSync(fullPath)) {
    continue;
  }

  const text = readFileSync(fullPath, 'utf8');
  for (const term of bannedHomeTerms) {
    if (text.includes(term)) {
      errors.push(`Banned home term "${term}" found in ${file}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Home V3 verification failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Home V3 verification passed.');

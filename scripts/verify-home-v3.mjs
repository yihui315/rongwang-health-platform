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
    snippets: [
      'metadataBase: new URL("https://rongwang.hk")',
      'AI健康评估与跨境营养支持方案',
      '先选健康场景，再查看适合的营养支持方案',
      '/images/home/homepage-kit/assets/branding/rongwang-health-logo-header.png',
    ],
  },
  {
    file: 'src/components/home/HomePageV3.tsx',
    snippets: [
      '先选健康场景',
      '再查看适合的',
      '营养支持方案',
      '热门健康场景方案',
      '精选营养支持产品推荐',
      '为什么选择荣旺健康？',
      '购买流程说明',
      '重要声明：',
      'PRODUCT_NOT_MEDICINE_NOTICE',
      'ORIGIN_STANDARD_DIFFERENCE_NOTICE',
      '/ai-consult',
    ],
  },
  {
    file: 'src/components/layout/SiteChrome.tsx',
    snippets: ['usePathname', "pathname === '/'", '本品不能替代药物', '本商品符合原产国标准'],
  },
  {
    file: 'src/lib/home/home-content.ts',
    snippets: [
      'family-group-v3.png',
      'city-skyline-v2.png',
      'health-education-card-v2.png',
    ],
  },
  {
    file: 'src/components/branding/BrandMark.tsx',
    snippets: ['/images/home/homepage-kit/assets/branding/rongwang-health-logo-header.png'],
  },
  {
    file: 'src/components/marketing/FunnelPageTracker.tsx',
    snippets: ['useTrackPageView'],
  },
  {
    file: 'src/lib/compliance/copy.ts',
    snippets: ['本品不能替代药物', '本商品符合原产国标准，可能与中国相关标准存在差异'],
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

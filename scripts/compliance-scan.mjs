import { readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const requiredPhrases = [
  {
    file: 'app/compliance/page.tsx',
    phrase: '本品不能替代药物',
  },
  {
    file: 'app/compliance/page.tsx',
    phrase: '商品符合原产国标准，可能与中国相关标准存在差异',
  },
  {
    file: 'src/agents/generate-content.ts',
    phrase: '本品不能替代药物',
  },
  {
    file: 'src/agents/generate-content.ts',
    phrase: '本商品符合原产国标准，可能与中国相关标准存在差异',
  },
  {
    file: 'src/services/compliance-service.ts',
    phrase: 'pending_manual_review',
  },
  {
    file: 'src/services/compliance-service.ts',
    phrase: 'missing_health_disclaimer',
  },
];

const claimScanTargets = [
  'app/page.tsx',
  'app/products/page.tsx',
  'app/products/[slug]/page.tsx',
  'app/product-map/[id]/page.tsx',
  'app/faq/page.tsx',
  'app/compliance/page.tsx',
  'app/ai-consult/page.tsx',
  'app/assessment/[slug]/page.tsx',
  'app/solutions/[slug]/page.tsx',
  'src/components/home/HomeProductPreview.tsx',
  'src/components/layout/SiteChrome.tsx',
  'src/agents/generate-content.ts',
];

const prohibitedClaimPatterns = [
  /(?<!不会以)治疗(?!、治愈、根治等方式描述)/u,
  /(?<!不会以治疗、)治愈/u,
  /(?<!不会以治疗、治愈、)根治/u,
  /医治/u,
  /临床证明可治疗/u,
  /替代处方药/u,
  /抗衰老神药/u,
  /百病可用/u,
  /三天见效/u,
  /一吃就好/u,
];

function readProjectFile(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const findings = [];

for (const item of requiredPhrases) {
  const content = readProjectFile(item.file);
  if (!content.includes(item.phrase)) {
    findings.push(`${item.file} is missing required compliance phrase: ${item.phrase}`);
  }
}

for (const target of claimScanTargets) {
  const content = readProjectFile(target);
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.includes('riskWords') || trimmed.includes('bannedWords')) return;

    for (const pattern of prohibitedClaimPatterns) {
      if (pattern.test(trimmed)) {
        findings.push(`${target}:${index + 1} contains a prohibited claim phrase: ${trimmed}`);
      }
    }
  });
}

if (findings.length > 0) {
  console.error('Compliance scan failed:');
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exitCode = 1;
} else {
  console.log('Compliance scan passed: required disclaimers and claim boundaries are present.');
}

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';

async function fetchText(pathname) {
  const url = new URL(pathname, baseUrl).toString();
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error(`Cannot reach ${url}. Start the app first, for example: npm run dev. ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }

  return response.text();
}

function uniqueMatches(text, regex) {
  return Array.from(new Set(Array.from(text.matchAll(regex), (match) => match[1])));
}

const homeHtml = await fetchText('/');
const scenarioRoutes = uniqueMatches(homeHtml, /href="(\/solutions\/[^"#?]+)"/g);
const testedScenarioRoutes = ['/solutions/sleep-support', '/solutions/brain-focus', '/solutions/liver-metabolism', '/solutions/joint-bone'];
const routeResults = [];

for (const route of testedScenarioRoutes) {
  const html = await fetchText(route);
  const productCards = (html.match(/solution-product-card/g) ?? []).length;
  const hasRealLink = html.includes('utm_campaign=fast_funnel_v2');
  const hasSafeEmpty = html.includes('购买链接配置中');
  routeResults.push({
    route,
    productCards,
    ctaStatus: hasRealLink ? 'real link' : hasSafeEmpty ? 'safe empty' : 'missing',
    complianceCopyFound: html.includes('本页面内容仅用于健康教育') || html.includes('合规健康教育提示'),
  });
}

const trackingFiles = [
  'src/lib/analytics/events.ts',
  'src/hooks/useFunnelTracking.ts',
  'src/components/marketing/PddCtaButton.tsx',
];
const { readFileSync } = await import('node:fs');
const trackingHookDetected = trackingFiles.every((file) => readFileSync(file, 'utf8').includes('pdd_click') || file.includes('useFunnelTracking'));

const failures = [];
if (scenarioRoutes.length < 8) failures.push(`Expected at least 8 scenario routes, found ${scenarioRoutes.length}`);
for (const result of routeResults) {
  if (result.productCards < 1) failures.push(`${result.route} has no product cards`);
  if (result.ctaStatus === 'missing') failures.push(`${result.route} has no PDD CTA or safe empty state`);
  if (!result.complianceCopyFound) failures.push(`${result.route} missing compliance copy`);
}
if (!trackingHookDetected) failures.push('Tracking hook or pdd_click wiring not detected');

console.log(JSON.stringify({
  homepageScenarioCardsCount: scenarioRoutes.length,
  testedScenarioRoutes,
  productCardsFound: routeResults.reduce((sum, result) => sum + result.productCards, 0),
  routeResults,
  trackingHookDetected,
  decision: failures.length === 0 ? 'PASS' : 'FAIL',
  failures,
}, null, 2));

if (failures.length > 0) {
  process.exit(1);
}

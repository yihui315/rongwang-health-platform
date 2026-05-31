const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';

const checks = [];

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

function check(name, condition, detail = '') {
  checks.push({ name, ok: Boolean(condition), detail });
}

const homeHtml = await fetchText('/');
check('home reachable', homeHtml.length > 0);
check('homepage contains scenario entry text', homeHtml.includes('按健康场景查看方案'));

const requiredScenarioRoutes = [
  '/solutions/sleep-support',
  '/solutions/brain-focus',
  '/solutions/liver-metabolism',
  '/solutions/joint-bone',
];

for (const route of requiredScenarioRoutes) {
  const html = await fetchText(route);
  check(`${route} reachable`, html.includes('推荐产品'));
  check(`${route} contains compliance text`, html.includes('本页面内容仅用于健康教育') || html.includes('合规健康教育提示'));
  check(`${route} contains product recommendation text`, html.includes('推荐产品'));
  check(`${route} has no empty href`, !/href=(["'])\s*\1/.test(html));
}

const productMapHtml = await fetchText('/product-map/sleep-support-001');
check('product-map route reachable', productMapHtml.includes('购买前复核'));

const failures = checks.filter((item) => !item.ok);
for (const item of checks) {
  console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name}${item.detail ? ` - ${item.detail}` : ''}`);
}

if (failures.length > 0) {
  console.error(`Smoke failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log('Smoke passed.');

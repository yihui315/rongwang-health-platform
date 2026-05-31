const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';
const adminToken = process.env.RONGWANG_ADMIN_TOKEN ?? process.env.ADMIN_TOKEN ?? '';

const checks = [];

function check(name, condition, detail = '') {
  checks.push({ name, ok: Boolean(condition), detail });
}

function fail(message) {
  throw new Error(`${message}. Start the app first, for example: RONGWANG_ADMIN_TOKEN=<token> npm run start`);
}

function urlFor(pathname) {
  return new URL(pathname, baseUrl).toString();
}

async function fetchText(pathname, init) {
  const url = urlFor(pathname);
  let response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    fail(`Cannot reach ${url}: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }

  return {
    response,
    text: await response.text(),
  };
}

async function fetchJson(pathname, init) {
  const url = urlFor(pathname);
  let response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    fail(`Cannot reach ${url}: ${error.message}`);
  }

  const body = await response.json().catch(() => ({}));
  return { response, body };
}

function getCookie(headers, name) {
  const rawCookies = typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : [];
  const cookieLines = rawCookies.length ? rawCookies : [headers.get('set-cookie') || ''];
  const cookie = cookieLines.find((line) => line.startsWith(`${name}=`));
  return cookie ? cookie.split(';')[0] : '';
}

const productsPage = await fetchText('/products');
check('products page is reachable', productsPage.text.includes('已审核商品展示'));
check('products page states display and consultation only', productsPage.text.includes('官网商城当前为商品展示与顾问确认入口'));
check('products page states WeChat mini program is not open', productsPage.text.includes('微信商城/小程序待开通'));
check('products page preserves medicine disclaimer', productsPage.text.includes('本品不能替代药物'));

const detailPage = await fetchText('/products/prod_demo_approved');
check('approved product detail is reachable', detailPage.text.includes('荣旺进口维生素营养片'));
check('product detail blocks in-site payment expectation', detailPage.text.includes('当前不提供站内支付'));
check('product detail preserves cross-border notice', detailPage.text.includes('本商品符合原产国标准'));

const healthReport = await fetchJson('/api/health-report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: `客户旅程Smoke-${Date.now()}`,
    contact: 'customer-smoke-wechat',
    scenarioSlug: 'sleep-support',
    source: 'customer_journey_smoke',
    consent: {
      privacyAccepted: true,
      termsAccepted: true,
      version: 'privacy-terms-2026-05',
      page: '/ai-consult',
    },
    answers: {
      sleepHours: 5.5,
      stressLevel: 7,
      symptomDurationDays: 14,
      medicationUse: '无',
      pregnancyOrBreastfeeding: false,
    },
  }),
});

check('AI consult health report API accepts customer submission', healthReport.response.status === 200);
check('health report enters manual review', healthReport.body.report?.status === 'pending_manual_review');
check('health report uses risk attention index data', typeof healthReport.body.report?.overallScore === 'number');
check('health report keeps manual review for elevated risk', healthReport.body.report?.manualReviewRequired === true);
check('lead consent is persisted', healthReport.body.lead?.consent?.version === 'privacy-terms-2026-05');
check('lead source is marked as customer_journey_smoke', healthReport.body.lead?.source === 'customer_journey_smoke');

const marketingPlan = await fetchJson('/api/marketing/plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reportId: healthReport.body.report?.id,
    channels: ['wechat_private', 'sms', 'content_remarketing'],
  }),
});

check('marketing plan API creates draft workflow', marketingPlan.response.status === 200);
check('marketing plan stays pending manual review', marketingPlan.body.plan?.status === 'pending_manual_review');
check('marketing automation remains draft only', marketingPlan.body.plan?.automationLevel === 'draft_only');
check('marketing workflow requires manual approval', marketingPlan.body.plan?.workflow?.reviewGate === 'manual_approval_required');
check('marketing auto-send is blocked', marketingPlan.body.plan?.complianceSummary?.autoSendBlocked === true);

const unauthorizedWorkspace = await fetch(urlFor('/workspace'), { redirect: 'manual' });
check(
  'workspace redirects unauthorized users to login',
  unauthorizedWorkspace.status === 307 || unauthorizedWorkspace.status === 308 || unauthorizedWorkspace.headers.get('location')?.includes('/login'),
  `status ${unauthorizedWorkspace.status}`
);

if (adminToken) {
  const login = await fetchJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: adminToken }),
  });
  const adminCookie = getCookie(login.response.headers, 'rongwang_admin_token');

  check('admin login accepts configured smoke token', login.response.status === 200);
  check('admin login sets protected cookie', adminCookie.length > 0);

  const workspace = await fetchText('/workspace', {
    headers: {
      cookie: adminCookie,
    },
  });
  check('authorized workspace is reachable', workspace.text.includes('运营审核工作台'));
  check('workspace shows launch readiness panel', workspace.text.includes('上线准备核对'));
  check('workspace shows WeChat login is not open', workspace.text.includes('微信登录') && workspace.text.includes('未开通'));

  const authorizedReports = await fetchJson('/api/health-report', {
    headers: {
      cookie: adminCookie,
    },
  });
  const authorizedPlans = await fetchJson('/api/marketing/plan', {
    headers: {
      cookie: adminCookie,
    },
  });

  check('authorized health report API is reachable', authorizedReports.response.status === 200);
  check(
    'authorized health report API includes smoke report',
    authorizedReports.body.reports?.some((report) => report.id === healthReport.body.report?.id)
  );
  check(
    'authorized health report API keeps smoke source for filtering',
    authorizedReports.body.leads?.some((lead) => lead.id === healthReport.body.lead?.id && lead.source === 'customer_journey_smoke')
  );
  check('authorized marketing plan API is reachable', authorizedPlans.response.status === 200);
  check(
    'authorized marketing plan API includes smoke draft plan',
    authorizedPlans.body.plans?.some((plan) => plan.id === marketingPlan.body.plan?.id)
  );
} else {
  check('admin workspace smoke skipped without RONGWANG_ADMIN_TOKEN', true, 'set token to verify authorized workspace');
}

const failures = checks.filter((item) => !item.ok);
for (const item of checks) {
  console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name}${item.detail ? ` - ${item.detail}` : ''}`);
}

console.log(
  JSON.stringify(
    {
      decision: failures.length === 0 ? 'PASS' : 'FAIL',
      baseUrl,
      smokeMode: 'customer-journey',
      checks: checks.length,
      failures: failures.map((item) => item.name),
    },
    null,
    2
  )
);

if (failures.length > 0) {
  process.exit(1);
}

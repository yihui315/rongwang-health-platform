const baseUrl = normalizeBaseUrl(
  process.env.ACCEPTANCE_BASE_URL ||
    process.env.SMOKE_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
);

const adminEmail = process.env.WORKSPACE_ADMIN_EMAIL;
const adminPassword = process.env.WORKSPACE_ADMIN_PASSWORD;
const sourceUrl = process.env.ACCEPTANCE_PRODUCT_URL || 'https://item.jd.com/demo-vitamin.html';

function normalizeBaseUrl(value) {
  return String(value).replace(/\/+$/, '');
}

function toUrl(pathname) {
  return new URL(pathname, `${baseUrl}/`).toString();
}

function getSetCookie(headers) {
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie();
  }

  const header = headers.get('set-cookie');
  return header ? [header] : [];
}

function buildCookieHeader(setCookieHeaders) {
  return setCookieHeaders.map((item) => item.split(';')[0]).filter(Boolean).join('; ');
}

async function postJson(pathname, body, cookieHeader) {
  const response = await fetch(toUrl(pathname), {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`${pathname} failed with HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function login() {
  if (!adminEmail || !adminPassword) {
    throw new Error('WORKSPACE_ADMIN_EMAIL and WORKSPACE_ADMIN_PASSWORD are required for acceptance checks');
  }

  const response = await fetch(toUrl('/api/auth/login'), {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email: adminEmail, password: adminPassword, next: '/workspace' }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok !== true) {
    throw new Error(`workspace login failed with HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }

  const cookieHeader = buildCookieHeader(getSetCookie(response.headers));
  if (!cookieHeader.includes('rongwang_workspace_session=')) {
    throw new Error('workspace login did not set the session cookie');
  }

  return cookieHeader;
}

try {
  if (process.env.ACCEPTANCE_MUTATES_DATA !== '1') {
    throw new Error('Set ACCEPTANCE_MUTATES_DATA=1 to confirm this check may create import/content records');
  }

  const cookieHeader = await login();
  const imported = await postJson('/api/mock/import', { sourceUrl }, cookieHeader);
  const productId = imported?.product?.id;

  if (imported?.ok !== true || !productId) {
    throw new Error(`import response is malformed: ${JSON.stringify(imported)}`);
  }

  const generated = await postJson('/api/mock/generate', { productId }, cookieHeader);

  if (generated?.ok !== true || generated?.review?.reviewStatus === 'approved') {
    throw new Error(`generation should create a reviewable, non-approved draft: ${JSON.stringify(generated)}`);
  }

  const tasksResponse = await fetch(toUrl('/api/mock/tasks'), {
    headers: {
      accept: 'application/json',
      cookie: cookieHeader,
    },
  });
  const tasksBody = await tasksResponse.json();

  if (!tasksResponse.ok || tasksBody?.ok !== true || !tasksBody?.summary) {
    throw new Error(`/api/mock/tasks response is malformed: ${JSON.stringify(tasksBody)}`);
  }

  console.log(`Acceptance funnel passed for ${baseUrl}`);
  console.log(`Imported product: ${productId}`);
  console.log(`Review status: ${generated.review.reviewStatus}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}

const baseUrl = normalizeBaseUrl(
  process.env.SMOKE_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
);

const adminEmail = process.env.WORKSPACE_ADMIN_EMAIL;
const adminPassword = process.env.WORKSPACE_ADMIN_PASSWORD;
const requireAuthSmoke = process.env.SMOKE_REQUIRE_AUTH === '1';

const publicRoutes = ['/', '/products', '/ai-consult', '/login', '/compliance'];

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

async function assertStatus(pathname, expectedStatus, options = {}) {
  const response = await fetch(toUrl(pathname), {
    redirect: 'manual',
    ...options,
  });

  if (response.status !== expectedStatus) {
    throw new Error(`${pathname} expected HTTP ${expectedStatus}, received ${response.status}`);
  }

  return response;
}

async function assertPublicRoutes() {
  for (const route of publicRoutes) {
    await assertStatus(route, 200);
    console.log(`OK public route ${route}`);
  }
}

async function assertWorkspaceProtection() {
  const workspaceResponse = await assertStatus('/workspace', 307);
  const location = workspaceResponse.headers.get('location') || '';

  if (!location.includes('/login')) {
    throw new Error(`/workspace should redirect to /login, received location: ${location}`);
  }

  const apiResponse = await assertStatus('/api/mock/products', 401, {
    headers: { accept: 'application/json' },
  });
  const body = await apiResponse.json();

  if (body?.ok !== false) {
    throw new Error('/api/mock/products should return ok:false when unauthenticated');
  }

  console.log('OK workspace and mock API require authentication');
}

async function assertAuthenticatedWorkspaceRead() {
  if (!adminEmail || !adminPassword) {
    if (requireAuthSmoke) {
      throw new Error('WORKSPACE_ADMIN_EMAIL and WORKSPACE_ADMIN_PASSWORD are required for authenticated smoke');
    }

    console.log('SKIP authenticated workspace read: admin credentials not set');
    return;
  }

  const loginResponse = await fetch(toUrl('/api/auth/login'), {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
      next: '/workspace',
    }),
  });

  if (loginResponse.status !== 200) {
    throw new Error(`workspace login expected HTTP 200, received ${loginResponse.status}`);
  }

  const loginBody = await loginResponse.json();
  if (loginBody?.ok !== true) {
    throw new Error(`workspace login failed: ${JSON.stringify(loginBody)}`);
  }

  const cookieHeader = buildCookieHeader(getSetCookie(loginResponse.headers));
  if (!cookieHeader.includes('rongwang_workspace_session=')) {
    throw new Error('workspace login did not set the session cookie');
  }

  const productsResponse = await assertStatus('/api/mock/products', 200, {
    headers: {
      accept: 'application/json',
      cookie: cookieHeader,
    },
  });
  const productsBody = await productsResponse.json();

  if (productsBody?.ok !== true || !Array.isArray(productsBody.products)) {
    throw new Error('/api/mock/products authenticated response is malformed');
  }

  await assertStatus('/api/auth/logout', 200, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      cookie: cookieHeader,
    },
  });

  console.log('OK authenticated workspace read and logout');
}

try {
  await assertPublicRoutes();
  await assertWorkspaceProtection();
  await assertAuthenticatedWorkspaceRead();
  console.log(`Smoke checks passed for ${baseUrl}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}

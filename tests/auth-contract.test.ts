import assert from 'node:assert/strict';
import { test } from 'node:test';

import { NextRequest } from 'next/server';
import {
  authenticateWorkspaceAdmin,
  createWorkspaceSessionToken,
  normalizeRedirectPath,
  verifyWorkspaceSessionToken,
  WORKSPACE_SESSION_COOKIE,
} from '../src/lib/auth/session';
import { GET as getMockProducts } from '../app/api/mock/products/route';
import { GET as getMockTasks } from '../app/api/mock/tasks/route';
import { POST as loginRoute } from '../app/api/auth/login/route';
import { POST as logoutRoute } from '../app/api/auth/logout/route';
import { proxy } from '../proxy';
import { resetMockStoreToSeed } from '../src/lib/mock-store';

const workspaceEmail = process.env.WORKSPACE_ADMIN_EMAIL?.trim().toLowerCase() || 'admin@example.com';
const workspacePassword = process.env.WORKSPACE_ADMIN_PASSWORD?.trim() || 'change-me-before-production';

function buildRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

test('workspace auth helpers create and verify signed session tokens', async () => {
  const token = await createWorkspaceSessionToken(workspaceEmail, 1_700_000_000_000);
  const session = await verifyWorkspaceSessionToken(token, 1_700_000_100_000);

  assert.ok(session);
  assert.equal(session?.email, workspaceEmail);
  assert.equal(session?.role, 'workspace_admin');
  assert.equal(authenticateWorkspaceAdmin({ email: workspaceEmail, password: workspacePassword }), true);
});

test('normalizeRedirectPath keeps workspace redirects on safe internal paths', () => {
  assert.equal(normalizeRedirectPath('/workspace/import'), '/workspace/import');
  assert.equal(normalizeRedirectPath('/api/mock/products'), '/workspace');
  assert.equal(normalizeRedirectPath('//evil.example'), '/workspace');
  assert.equal(normalizeRedirectPath('https://evil.example'), '/workspace');
});

test('login route issues a workspace cookie for valid credentials', async () => {
  const request = buildRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      email: workspaceEmail,
      password: workspacePassword,
      next: '/workspace/import',
    }),
  });

  const response = await loginRoute(request);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type')?.includes('application/json'), true);
  assert.ok(response.cookies.get(WORKSPACE_SESSION_COOKIE)?.value);
});

test('logout route clears the workspace cookie', async () => {
  const request = buildRequest('http://localhost/api/auth/logout', {
    method: 'POST',
    headers: { accept: 'application/json' },
  });

  const response = await logoutRoute(request);
  assert.equal(response.status, 200);
  assert.equal(response.cookies.get(WORKSPACE_SESSION_COOKIE)?.value, '');
});

test('proxy redirects unauthenticated workspace visits and blocks api reads', async () => {
  const workspaceRequest = buildRequest('http://localhost/workspace/import');
  const apiRequest = buildRequest('http://localhost/api/mock/products');

  const workspaceResponse = await proxy(workspaceRequest);
  const apiResponse = await proxy(apiRequest);

  assert.equal(workspaceResponse.status, 307);
  assert.equal(workspaceResponse.headers.get('location')?.includes('/login?next=%2Fworkspace%2Fimport'), true);
  assert.equal(apiResponse.status, 401);
});

test('protected mock routes reject requests without a workspace session', async () => {
  resetMockStoreToSeed();

  const productsResponse = await getMockProducts(buildRequest('http://localhost/api/mock/products'));
  const tasksResponse = await getMockTasks(buildRequest('http://localhost/api/mock/tasks'));

  assert.equal(productsResponse.status, 401);
  assert.equal(tasksResponse.status, 401);
});

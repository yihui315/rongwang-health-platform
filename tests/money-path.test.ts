import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import nextConfig from '../next.config';
import { POST as createLeadRoute } from '../app/api/leads/route';
import { POST as importRoute } from '../app/api/mock/import/route';
import PddCtaButton from '../src/components/marketing/PddCtaButton';
import { pddProducts } from '../src/data/pdd-products';
import { listLeads, resetLeadsForTest } from '../src/lib/contact/lead-store';

const originalCwd = process.cwd();
const tempDir = mkdtempSync(path.join(tmpdir(), 'rongwang-money-path-'));
const env = process.env as Record<string, string | undefined>;
const originalNodeEnv = env.NODE_ENV;
const originalAdminToken = env.RONGWANG_ADMIN_TOKEN;

before(() => {
  process.chdir(tempDir);
  resetLeadsForTest();
});

after(() => {
  process.chdir(originalCwd);
  env.NODE_ENV = originalNodeEnv;
  env.RONGWANG_ADMIN_TOKEN = originalAdminToken;
  rmSync(tempDir, { recursive: true, force: true });
});

test('legacy money-path routes redirect to current scenario and product routes', async () => {
  assert.equal(typeof nextConfig.redirects, 'function');
  const getRedirects = nextConfig.redirects as NonNullable<typeof nextConfig.redirects>;
  const redirects = await getRedirects();
  const redirectMap = new Map(redirects.map((item) => [item.source, item.destination]));

  assert.equal(redirectMap.get('/solutions/sleep'), '/solutions/sleep-support');
  assert.equal(redirectMap.get('/solutions/immune'), '/solutions/immune-support');
  assert.equal(redirectMap.get('/solutions/fatigue'), '/solutions/men-health');
  assert.equal(redirectMap.get('/assessment/sleep'), '/assessment/sleep-support');
});

test('AI consult lead route stores a valid lead for follow-up', async () => {
  const request = new Request('http://localhost/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '李女士',
      contact: 'li78035',
      concern: '睡眠与压力',
      scenarioSlug: 'sleep-support',
      source: 'ai_consult',
    }),
  });

  const response = await createLeadRoute(request);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.lead.status, 'new');
  assert.equal(listLeads()[0]?.contact, 'li78035');
});

test('AI consult lead route rejects incomplete submissions', async () => {
  const request = new Request('http://localhost/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', contact: '', concern: '' }),
  });

  const response = await createLeadRoute(request);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.match(body.error, /称呼/);
});

test('empty PDD CTA falls back to consult lead capture instead of fake purchase links', () => {
  const product = { ...pddProducts[0], pddUrl: '' };
  const markup = renderToStaticMarkup(
    React.createElement(PddCtaButton, {
      product,
      scenarioSlug: 'sleep-support',
      ctaId: 'solution_primary_product',
    })
  );

  assert.match(markup, /联系顾问确认购买方式/);
  assert.match(markup, /href="\/ai-consult\?scenario=sleep-support&amp;product=sleep-support-001"/);
  assert.doesNotMatch(markup, /href="https:\/\/mobile\.yangkeduo\.com/);
});

test('mutating mock APIs reject unauthenticated production requests', async () => {
  env.NODE_ENV = 'production';
  env.RONGWANG_ADMIN_TOKEN = 'secret-token';

  const request = new Request('http://localhost/api/mock/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceUrl: 'https://item.jd.com/demo-vitamin.html' }),
  });

  const response = await importRoute(request);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.ok, false);
  assert.match(body.error, /Admin authorization required/);
});

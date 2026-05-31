import { randomBytes } from 'node:crypto';
import { createServer } from 'node:net';
import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';

const previewSmoke = {
  timeoutMs: Number(process.env.PREVIEW_SMOKE_TIMEOUT_MS || 30000),
  buildIdPath: '.next/BUILD_ID',
};

function parseJsonSummary(output) {
  const jsonStart = output.lastIndexOf('\n{');
  const jsonText = jsonStart === -1 ? output.trim() : output.slice(jsonStart + 1).trim();
  return JSON.parse(jsonText);
}

function makeToken() {
  return `preview_${randomBytes(24).toString('base64url')}`;
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close(() => {
        if (typeof address === 'object' && address?.port) {
          resolve(address.port);
        } else {
          reject(new Error('Could not reserve a local preview port'));
        }
      });
    });
  });
}

async function waitForReady(baseUrl, server) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < previewSmoke.timeoutMs) {
    if (server.exitCode !== null) {
      throw new Error(`next start exited before preview became ready with code ${server.exitCode}`);
    }

    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for local production preview at ${baseUrl}`);
}

function runSmokeScript(scriptPath, env) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: process.cwd(),
    env,
    encoding: 'utf8',
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  return {
    scriptPath,
    status: result.status ?? 1,
    summary: parseJsonSummary(`${result.stdout}\n${result.stderr}`),
  };
}

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) return;

  server.kill('SIGTERM');
  await new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (server.exitCode === null && server.signalCode === null) server.kill('SIGKILL');
      resolve();
    }, 3000);
    server.once('close', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

if (!existsSync(previewSmoke.buildIdPath)) {
  console.error('Missing .next production build. Run `npm run build` before `npm run release:preview-smoke`.');
  process.exit(1);
}

const port = Number(process.env.PREVIEW_SMOKE_PORT || 0) || (await getFreePort());
const baseUrl = `http://127.0.0.1:${port}`;
const adminToken = process.env.RONGWANG_ADMIN_TOKEN || makeToken();
const env = {
  ...process.env,
  NODE_ENV: 'production',
  NEXT_PUBLIC_SITE_URL: baseUrl,
  RONGWANG_ADMIN_TOKEN: adminToken,
  SMOKE_BASE_URL: baseUrl,
};

const server = spawn('node_modules/.bin/next', ['start', '--hostname', '127.0.0.1', '--port', String(port)], {
  cwd: process.cwd(),
  env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

server.stdout.setEncoding('utf8');
server.stderr.setEncoding('utf8');
server.stdout.on('data', (chunk) => process.stdout.write(chunk));
server.stderr.on('data', (chunk) => process.stderr.write(chunk));

const failures = [];
const smokeResults = [];

try {
  await waitForReady(baseUrl, server);

  for (const scriptPath of [
    'scripts/smoke-fast-funnel.mjs',
    'scripts/acceptance-fast-funnel.mjs',
    'scripts/customer-journey-smoke.mjs',
  ]) {
    const result = runSmokeScript(scriptPath, env);
    smokeResults.push({
      scriptPath,
      decision: result.summary.decision,
      status: result.status,
      smokeMode: result.summary.smokeMode,
      checks: result.summary.checks,
      failures: result.summary.failures || [],
    });

    if (result.status !== 0 || result.summary.decision !== 'PASS') {
      failures.push(`${scriptPath} failed`);
    }
  }
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  await stopServer(server);
}

console.log(
  JSON.stringify(
    {
      decision: failures.length === 0 ? 'PASS' : 'FAIL',
      previewSmoke: true,
      baseUrl,
      smokeResults,
      failures,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  process.exit(1);
}

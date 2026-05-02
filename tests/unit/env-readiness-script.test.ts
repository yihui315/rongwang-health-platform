import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

test("production probe readiness fails closed when core production integrations are missing", async () => {
  let stdout = "";
  let stderr = "";
  let exitCode = 0;

  try {
    const result = await execFileAsync(
      process.execPath,
      ["scripts/env-readiness.mjs", "--production", "--probe", "--rw-env-file=.env.__missing_for_test"],
      {
        cwd: process.cwd(),
        env: {
          NODE_ENV: "test",
          PATH: process.env.PATH,
          SystemRoot: process.env.SystemRoot,
          TEMP: process.env.TEMP,
          TMP: process.env.TMP,
        },
      },
    );
    stdout = result.stdout;
    stderr = result.stderr;
  } catch (error) {
    const failed = error as {
      code?: number;
      stdout?: string;
      stderr?: string;
    };
    exitCode = Number(failed.code ?? 1);
    stdout = failed.stdout ?? "";
    stderr = failed.stderr ?? "";
  }

  const output = `${stdout}\n${stderr}`;
  assert.equal(exitCode, 1);
  assert.match(output, /DATABASE_URL is required/);
  assert.match(output, /AUTH_ID_HASH_SALT is required/);
  assert.match(output, /Redis credentials are required/);
  assert.match(output, /OPENAI_API_KEY, DEEPSEEK_API_KEY, or MINIMAX_API_KEY is required/);
  assert.match(output, /GEOFLOW_API_URL is required/);
  assert.match(output, /GEOFLOW_DEFAULT_TITLE_LIBRARY_ID is required/);
});

test("production readiness accepts MiniMax as the configured AI provider", async () => {
  const envFile = path.join(os.tmpdir(), `rongwang-minimax-env-${process.pid}-${Date.now()}`);
  fs.writeFileSync(
    envFile,
    [
      "NEXT_PUBLIC_SITE_URL=https://rongwang.hk",
      "ADMIN_AUTH_TOKEN=admin-token",
      "AUTH_ID_HASH_SALT=identity-salt",
      "DATABASE_URL=postgresql://user:password@127.0.0.1:5432/rongwang?schema=public",
      "REDIS_REST_URL=http://127.0.0.1:8079",
      "REDIS_REST_TOKEN=redis-token",
      "AI_PROVIDER=minimax",
      "MINIMAX_API_KEY=minimax-token",
      "MINIMAX_MODEL=abab6.5s-chat",
      "",
    ].join("\n"),
  );

  try {
    const result = await execFileAsync(
      process.execPath,
      ["scripts/env-readiness.mjs", "--production", `--rw-env-file=${envFile}`],
      {
        cwd: process.cwd(),
        env: {
          NODE_ENV: "test",
          PATH: process.env.PATH,
          SystemRoot: process.env.SystemRoot,
          TEMP: process.env.TEMP,
          TMP: process.env.TMP,
        },
      },
    );

    assert.match(result.stdout, /MINIMAX_API_KEY: present/);
    assert.match(result.stdout, /\[env\] readiness check passed/);
  } finally {
    fs.rmSync(envFile, { force: true });
  }
});

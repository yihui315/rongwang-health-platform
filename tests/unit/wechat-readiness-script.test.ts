import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function runReadiness(args: string[], env: Record<string, string | undefined> = {}) {
  let stdout = "";
  let stderr = "";
  let exitCode = 0;

  try {
    const result = await execFileAsync(process.execPath, ["scripts/wechat-readiness.mjs", ...args], {
      cwd: process.cwd(),
      env: {
        PATH: process.env.PATH,
        PATHEXT: process.env.PATHEXT,
        SystemRoot: process.env.SystemRoot,
        TEMP: process.env.TEMP,
        TMP: process.env.TMP,
        ...env,
        NODE_ENV: "test",
      },
    });
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

  return { exitCode, output: `${stdout}\n${stderr}` };
}

test("wechat local readiness is advisory when credentials and md2wechat are missing", async () => {
  const result = await runReadiness([
    "--rw-env-file=.env.__missing_for_test",
  ], {
    PATH: "",
  });

  assert.equal(result.exitCode, 0);
  assert.match(result.output, /md2wechat CLI: missing/);
  assert.match(result.output, /wechat:warn/);
  assert.match(result.output, /readiness check passed/);
});

test("wechat draft readiness fails closed when upload prerequisites are missing", async () => {
  const result = await runReadiness([
    "--draft",
    "--rw-env-file=.env.__missing_for_test",
  ], {
    PATH: "",
  });

  assert.equal(result.exitCode, 1);
  assert.match(result.output, /md2wechat CLI is required/);
  assert.match(result.output, /WECHAT_APPID is required/);
  assert.match(result.output, /WECHAT_SECRET is required/);
  assert.match(result.output, /WECHAT_DEFAULT_COVER_PATH or WECHAT_DEFAULT_COVER_MEDIA_ID is required/);
});

test("wechat readiness passes with a CLI, official account credentials, and a cover media id", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rongwang-wechat-"));
  const envFile = path.join(tempDir, ".env.wechat");
  const commandName = process.platform === "win32" ? "md2wechat.cmd" : "md2wechat";
  const commandPath = path.join(tempDir, commandName);

  fs.writeFileSync(envFile, [
    "WECHAT_APPID=wx1234567890abcdef",
    "WECHAT_SECRET=wechat-secret-for-test",
    "WECHAT_DRAFT_UPLOAD_ENABLED=true",
    "WECHAT_DEFAULT_COVER_MEDIA_ID=media-id-for-test",
    "WECHAT_MINIPROGRAM_APPID=wx-mini-for-test",
    "WECHAT_MINIPROGRAM_SECRET=mini-secret-for-test",
  ].join("\n"));

  if (process.platform === "win32") {
    fs.writeFileSync(commandPath, '@echo off\r\necho {"version":"0.0.0-test"}\r\n');
  } else {
    fs.writeFileSync(commandPath, '#!/usr/bin/env sh\necho \'{"version":"0.0.0-test"}\'\n');
    fs.chmodSync(commandPath, 0o755);
  }

  const result = await runReadiness([
    "--draft",
    `--rw-env-file=${envFile}`,
  ], {
    PATH: `${tempDir}${path.delimiter}${process.env.PATH ?? ""}`,
  });

  assert.equal(result.exitCode, 0);
  assert.match(result.output, /md2wechat CLI: present/);
  assert.match(result.output, /WECHAT_APPID: present/);
  assert.match(result.output, /readiness check passed/);
});

test("wechat readiness fails closed when production pay credentials are missing", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rongwang-wechat-pay-"));
  const envFile = path.join(tempDir, ".env.wechat");
  const commandName = process.platform === "win32" ? "md2wechat.cmd" : "md2wechat";
  const commandPath = path.join(tempDir, commandName);

  fs.writeFileSync(envFile, [
    "WECHAT_APPID=wx1234567890abcdef",
    "WECHAT_SECRET=wechat-secret-for-test",
    "WECHAT_DRAFT_UPLOAD_ENABLED=true",
    "WECHAT_DEFAULT_COVER_MEDIA_ID=media-id-for-test",
  ].join("\n"));

  if (process.platform === "win32") {
    fs.writeFileSync(commandPath, '@echo off\r\necho {"version":"0.0.0-test"}\r\n');
  } else {
    fs.writeFileSync(commandPath, '#!/usr/bin/env sh\necho \'{"version":"0.0.0-test"}\'\n');
    fs.chmodSync(commandPath, 0o755);
  }

  const result = await runReadiness([
    "--production",
    "--draft",
    "--pay",
    `--rw-env-file=${envFile}`,
  ], {
    PATH: `${tempDir}${path.delimiter}${process.env.PATH ?? ""}`,
  });

  assert.equal(result.exitCode, 1);
  assert.match(result.output, /WECHAT_PAY_MCH_ID is required/);
  assert.match(result.output, /WECHAT_PAY_API_V3_KEY is required/);
  assert.match(result.output, /WECHAT_PAY_NOTIFY_URL is required/);
});

test("wechat production readiness checks PDD mini program mode without requiring WeChat Pay", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rongwang-wechat-pdd-"));
  const envFile = path.join(tempDir, ".env.wechat");
  const commandName = process.platform === "win32" ? "md2wechat.cmd" : "md2wechat";
  const commandPath = path.join(tempDir, commandName);

  fs.writeFileSync(envFile, [
    "WECHAT_APPID=wx1234567890abcdef",
    "WECHAT_SECRET=wechat-secret-for-test",
    "WECHAT_DRAFT_UPLOAD_ENABLED=true",
    "WECHAT_DEFAULT_COVER_MEDIA_ID=media-id-for-test",
    "WECHAT_MINIPROGRAM_APPID=wx-mini-for-test",
    "WECHAT_MINIPROGRAM_SECRET=mini-secret-for-test",
    "PDD_SHORT_LINK_MODE=mini_program",
  ].join("\n"));

  if (process.platform === "win32") {
    fs.writeFileSync(commandPath, '@echo off\r\necho {"version":"0.0.0-test"}\r\n');
  } else {
    fs.writeFileSync(commandPath, '#!/usr/bin/env sh\necho \'{"version":"0.0.0-test"}\'\n');
    fs.chmodSync(commandPath, 0o755);
  }

  const missingPdd = await runReadiness([
    "--production",
    `--rw-env-file=${envFile}`,
  ], {
    PATH: `${tempDir}${path.delimiter}${process.env.PATH ?? ""}`,
  });

  assert.equal(missingPdd.exitCode, 1);
  assert.match(missingPdd.output, /PDD_MINIPROGRAM_APPID is required/);
  assert.match(missingPdd.output, /PDD_MINIPROGRAM_PATH_TEMPLATE is required/);
  assert.doesNotMatch(missingPdd.output, /WECHAT_PAY_MCH_ID is required/);

  fs.appendFileSync(envFile, [
    "",
    "PDD_MINIPROGRAM_APPID=wx-pdd-for-test",
    "PDD_MINIPROGRAM_PATH_TEMPLATE=pages/deeplink/index?sku={productSlug}",
  ].join("\n"));

  const ready = await runReadiness([
    "--production",
    `--rw-env-file=${envFile}`,
  ], {
    PATH: `${tempDir}${path.delimiter}${process.env.PATH ?? ""}`,
  });

  assert.equal(ready.exitCode, 0);
  assert.match(ready.output, /readiness check passed/);
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function createFakeMd2Wechat() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rongwang-md2wechat-"));
  const commandName = process.platform === "win32" ? "md2wechat.cmd" : "md2wechat";
  const commandPath = path.join(tempDir, commandName);

  if (process.platform === "win32") {
    fs.writeFileSync(commandPath, "@echo off\r\necho md2wechat %*\r\n");
  } else {
    fs.writeFileSync(commandPath, "#!/usr/bin/env sh\necho md2wechat \"$@\"\n");
    fs.chmodSync(commandPath, 0o755);
  }

  return tempDir;
}

async function runWrapper(args: string[], env: Record<string, string | undefined> = {}) {
  let stdout = "";
  let stderr = "";
  let exitCode = 0;

  try {
    const result = await execFileAsync(process.execPath, ["scripts/wechat-md2wechat.mjs", ...args], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...env,
        NODE_ENV: "test",
      },
    });
    stdout = result.stdout;
    stderr = result.stderr;
  } catch (error) {
    const failed = error as { code?: number; stdout?: string; stderr?: string };
    exitCode = Number(failed.code ?? 1);
    stdout = failed.stdout ?? "";
    stderr = failed.stderr ?? "";
  }

  return { exitCode, output: `${stdout}\n${stderr}` };
}

test("md2wechat preview wrapper does not require official account credentials", async () => {
  const fakePath = createFakeMd2Wechat();
  const article = path.join(fakePath, "article.md");
  fs.writeFileSync(article, "# Test\n\n[CTA](/ai-consult?focus=sleep)\n", "utf8");

  const result = await runWrapper(["--preview", `--file=${article}`], {
    PATH: `${fakePath}${path.delimiter}${process.env.PATH ?? ""}`,
    WECHAT_APPID: "",
    WECHAT_SECRET: "",
  });

  assert.equal(result.exitCode, 0);
  assert.match(result.output, /md2wechat preview/);
  assert.match(result.output, /article\.md/);
});

test("md2wechat draft wrapper fails closed unless draft upload is explicitly enabled", async () => {
  const fakePath = createFakeMd2Wechat();
  const article = path.join(fakePath, "article.md");
  fs.writeFileSync(article, "# Test\n", "utf8");

  const result = await runWrapper(["--draft", `--file=${article}`], {
    PATH: `${fakePath}${path.delimiter}${process.env.PATH ?? ""}`,
    WECHAT_APPID: "wx123",
    WECHAT_SECRET: "secret",
    WECHAT_DEFAULT_COVER_MEDIA_ID: "media-id",
    WECHAT_DRAFT_UPLOAD_ENABLED: "false",
  });

  assert.equal(result.exitCode, 1);
  assert.match(result.output, /WECHAT_DRAFT_UPLOAD_ENABLED=true is required/);
});

test("md2wechat draft wrapper calls draft conversion only with credentials and cover", async () => {
  const fakePath = createFakeMd2Wechat();
  const article = path.join(fakePath, "article.md");
  fs.writeFileSync(article, "# Test\n", "utf8");

  const result = await runWrapper(["--draft", `--file=${article}`], {
    PATH: `${fakePath}${path.delimiter}${process.env.PATH ?? ""}`,
    WECHAT_APPID: "wx123",
    WECHAT_SECRET: "secret",
    WECHAT_DEFAULT_COVER_MEDIA_ID: "media-id",
    WECHAT_DRAFT_UPLOAD_ENABLED: "true",
  });

  assert.equal(result.exitCode, 0);
  assert.match(result.output, /md2wechat convert/);
  assert.match(result.output, /--draft/);
  assert.match(result.output, /--cover-media-id media-id/);
});

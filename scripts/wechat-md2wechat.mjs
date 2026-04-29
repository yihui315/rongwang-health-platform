import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs.filter((arg) => arg.startsWith("--") && !arg.includes("=")));
const inspectMode = args.has("--inspect");
const previewMode = args.has("--preview");
const draftMode = args.has("--draft");
const envFileArg = rawArgs.find((arg) => arg.startsWith("--rw-env-file=") || arg.startsWith("--env-file="));
const fileArg = rawArgs.find((arg) => arg.startsWith("--file="));
const root = process.cwd();
const envFiles = envFileArg ? [envFileArg.slice(envFileArg.indexOf("=") + 1)] : [".env", ".env.local"];

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const equalIndex = trimmed.indexOf("=");
  if (equalIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, equalIndex).replace(/^export\s+/, "").trim();
  let value = trimmed.slice(equalIndex + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

function loadEnv() {
  const env = {};
  for (const file of envFiles) {
    const filePath = path.isAbsolute(file) ? file : path.join(root, file);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const parsed = parseEnvLine(line);
      if (!parsed) {
        continue;
      }
      env[parsed[0]] = parsed[1];
    }
  }

  return {
    ...env,
    ...process.env,
  };
}

function isConfigured(env, key) {
  const value = env[key];
  if (!value) {
    return false;
  }

  const lower = value.toLowerCase();
  return !(
    lower.includes("your-") ||
    lower.includes("replace-with") ||
    lower.includes("xxx") ||
    lower === "changeme"
  );
}

function quoteForCmd(value) {
  const text = String(value);
  if (!/[\s&()^|<>]/.test(text)) {
    return text;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

async function runMd2Wechat(md2wechatArgs, env) {
  const command = process.platform === "win32"
    ? path.join(env.SystemRoot || "C:\\Windows", "System32", "cmd.exe")
    : "md2wechat";
  const commandArgs = process.platform === "win32"
    ? ["/d", "/c", `md2wechat ${md2wechatArgs.map(quoteForCmd).join(" ")}`]
    : md2wechatArgs;
  const result = await execFileAsync(command, commandArgs, {
    cwd: root,
    env,
    timeout: 30000,
    windowsHide: true,
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
}

function fail(message) {
  console.error(`[wechat:md2wechat] ${message}`);
  process.exit(1);
}

const modeCount = [inspectMode, previewMode, draftMode].filter(Boolean).length;
if (modeCount !== 1) {
  fail("choose exactly one mode: --inspect, --preview, or --draft");
}

if (!fileArg) {
  fail("--file=<article.md> is required");
}

const filePath = path.resolve(fileArg.slice("--file=".length));
if (!fs.existsSync(filePath)) {
  fail(`article file not found: ${filePath}`);
}

const env = loadEnv();

if (inspectMode) {
  await runMd2Wechat(["inspect", filePath], env);
  process.exit(0);
}

if (previewMode) {
  await runMd2Wechat(["preview", filePath], env);
  process.exit(0);
}

if (env.WECHAT_DRAFT_UPLOAD_ENABLED !== "true") {
  fail("WECHAT_DRAFT_UPLOAD_ENABLED=true is required before uploading a WeChat draft");
}
if (!isConfigured(env, "WECHAT_APPID")) {
  fail("WECHAT_APPID is required before uploading a WeChat draft");
}
if (!isConfigured(env, "WECHAT_SECRET")) {
  fail("WECHAT_SECRET is required before uploading a WeChat draft");
}

const draftArgs = ["convert", filePath, "--draft"];
if (isConfigured(env, "WECHAT_DEFAULT_COVER_MEDIA_ID")) {
  draftArgs.push("--cover-media-id", env.WECHAT_DEFAULT_COVER_MEDIA_ID);
} else if (isConfigured(env, "WECHAT_DEFAULT_COVER_PATH")) {
  draftArgs.push("--cover", env.WECHAT_DEFAULT_COVER_PATH);
} else {
  fail("WECHAT_DEFAULT_COVER_PATH or WECHAT_DEFAULT_COVER_MEDIA_ID is required before uploading a WeChat draft");
}

await runMd2Wechat(draftArgs, env);

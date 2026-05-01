import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const args = new Set(process.argv.slice(2));
const productionProfile = args.has("--production");
const draftMode = args.has("--draft");
const payMode = args.has("--pay");
const jsonMode = args.has("--json");
const envFileArg = process.argv.find((arg) => arg.startsWith("--rw-env-file=") || arg.startsWith("--env-file="));
const root = process.cwd();
const envFiles = envFileArg ? [envFileArg.slice(envFileArg.indexOf("=") + 1)] : [".env", ".env.local"];

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const normalized = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
  const equalIndex = normalized.indexOf("=");
  if (equalIndex === -1) {
    return null;
  }

  const key = normalized.slice(0, equalIndex).trim();
  let value = normalized.slice(equalIndex + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

function loadEnv() {
  const loaded = [];
  const env = {};

  for (const file of envFiles) {
    const filePath = path.isAbsolute(file) ? file : path.join(root, file);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    loaded.push(file);
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const parsed = parseEnvLine(line);
      if (!parsed) {
        continue;
      }
      const [key, value] = parsed;
      env[key] = value;
    }
  }

  return {
    loaded,
    env: {
      ...env,
      ...process.env,
    },
  };
}

function isPlaceholder(value) {
  if (!value) {
    return true;
  }

  const lower = value.toLowerCase();
  return (
    lower.includes("your-") ||
    lower.includes("replace-with") ||
    lower.includes("xxx") ||
    lower.includes("example.com") ||
    lower === "changeme"
  );
}

function isConfigured(env, key) {
  return !isPlaceholder(env[key]);
}

function formatKey(env, key) {
  return `${key}: ${isConfigured(env, key) ? "present" : "missing"}`;
}

function hasCover(env) {
  return isConfigured(env, "WECHAT_DEFAULT_COVER_PATH") || isConfigured(env, "WECHAT_DEFAULT_COVER_MEDIA_ID");
}

function normalizePddMode(env) {
  return ["mini_program", "copy_link", "web_bridge"].includes(env.PDD_SHORT_LINK_MODE)
    ? env.PDD_SHORT_LINK_MODE
    : "web_bridge";
}

async function probeMd2WechatCli(env) {
  const command = process.platform === "win32"
    ? path.join(env.SystemRoot || "C:\\Windows", "System32", "cmd.exe")
    : "md2wechat";
  const commandArgs = process.platform === "win32"
    ? ["/d", "/s", "/c", "md2wechat version --json"]
    : ["version", "--json"];

  const result = await execFileAsync(command, commandArgs, {
    cwd: root,
    env,
    timeout: 5000,
    windowsHide: true,
  });

  return result.stdout.trim() || "version ok";
}

function shouldRequireDraftCredentials(env) {
  return draftMode || env.WECHAT_DRAFT_UPLOAD_ENABLED === "true";
}

function printGroup(title, lines) {
  console.log(`\n[wechat] ${title}`);
  for (const line of lines) {
    console.log(`  - ${line}`);
  }
}

const { loaded, env } = loadEnv();
const errors = [];
const warnings = [];
let md2wechatVersion = null;

function addError(message) {
  if (!errors.includes(message)) {
    errors.push(message);
  }
}

function requireConfiguredKeys(keys, reason) {
  for (const key of keys) {
    if (!isConfigured(env, key)) {
      addError(`${key} is required ${reason}`);
    }
  }
}

try {
  md2wechatVersion = await probeMd2WechatCli(env);
} catch {
  const message = "md2wechat CLI is required for WeChat article inspection and preview";
  if (draftMode) {
    addError(message);
  } else {
    warnings.push(message);
  }
}

const requiresDraftCredentials = draftMode;
if (requiresDraftCredentials) {
  requireConfiguredKeys(["WECHAT_APPID", "WECHAT_SECRET"], "for WeChat draft upload");
  if (!hasCover(env)) {
    addError("WECHAT_DEFAULT_COVER_PATH or WECHAT_DEFAULT_COVER_MEDIA_ID is required for WeChat draft upload");
  }
} else {
  if (!isConfigured(env, "WECHAT_APPID") || !isConfigured(env, "WECHAT_SECRET")) {
    warnings.push("WECHAT_APPID and WECHAT_SECRET are missing; preview/inspect can run, but draft upload must stay disabled");
  }
  if (shouldRequireDraftCredentials(env)) {
    warnings.push("WECHAT_DRAFT_UPLOAD_ENABLED is true; run npm run wechat:check:draft before uploading any Official Account draft");
  }
}

if (productionProfile) {
  requireConfiguredKeys(["WECHAT_MINIPROGRAM_APPID", "WECHAT_MINIPROGRAM_SECRET"], "for WeChat Mini Program readiness");
}

const pddMode = normalizePddMode(env);
if (productionProfile && pddMode === "mini_program") {
  requireConfiguredKeys(["PDD_MINIPROGRAM_APPID", "PDD_MINIPROGRAM_PATH_TEMPLATE"], "when PDD_SHORT_LINK_MODE=mini_program");
}

if (payMode) {
  requireConfiguredKeys([
    "WECHAT_MINIPROGRAM_APPID",
    "WECHAT_MINIPROGRAM_SECRET",
    "WECHAT_PAY_MCH_ID",
    "WECHAT_PAY_API_V3_KEY",
    "WECHAT_PAY_CERT_SERIAL_NO",
    "WECHAT_PAY_PRIVATE_KEY",
    "WECHAT_PAY_NOTIFY_URL",
  ], "for WeChat Mini Program pay readiness");
}

if (env.WECHAT_OFFICIAL_DRY_RUN !== "false" && env.WECHAT_DRAFT_UPLOAD_ENABLED === "true") {
  warnings.push("WECHAT_DRAFT_UPLOAD_ENABLED is true; keep a human review step before publishing any official-account draft");
}

const result = {
  loadedFiles: loaded,
  profile: productionProfile ? "production" : "local",
  draftMode,
  payMode,
  pddMode,
  ready: errors.length === 0,
  canPreview: Boolean(md2wechatVersion),
  canUploadDraft: Boolean(md2wechatVersion) && isConfigured(env, "WECHAT_APPID") && isConfigured(env, "WECHAT_SECRET") && hasCover(env),
  checks: {
    md2wechatCli: md2wechatVersion ? "present" : "missing",
    wechatAppId: isConfigured(env, "WECHAT_APPID") ? "present" : "missing",
    wechatSecret: isConfigured(env, "WECHAT_SECRET") ? "present" : "missing",
    cover: hasCover(env) ? "present" : "missing",
    miniprogramAppId: isConfigured(env, "WECHAT_MINIPROGRAM_APPID") ? "present" : "missing",
    miniprogramSecret: isConfigured(env, "WECHAT_MINIPROGRAM_SECRET") ? "present" : "missing",
    payMerchantId: isConfigured(env, "WECHAT_PAY_MCH_ID") ? "present" : "missing",
    payNotifyUrl: isConfigured(env, "WECHAT_PAY_NOTIFY_URL") ? "present" : "missing",
    pddMiniProgramAppId: isConfigured(env, "PDD_MINIPROGRAM_APPID") ? "present" : "missing",
    pddPathTemplate: isConfigured(env, "PDD_MINIPROGRAM_PATH_TEMPLATE") ? "present" : "missing",
    pddShortLinkMode: pddMode,
    pddFallbackMode: env.PDD_LINK_FALLBACK_MODE || "web_bridge",
  },
  warnings,
  errors,
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`[wechat] loaded files: ${loaded.length > 0 ? loaded.join(", ") : "none"}`);
  console.log(`[wechat] profile: ${result.profile}`);

  printGroup("md2wechat", [
    `md2wechat CLI: ${result.checks.md2wechatCli}`,
    md2wechatVersion ? `version: ${md2wechatVersion}` : "version: unavailable",
  ]);
  printGroup("official account", [
    formatKey(env, "WECHAT_APPID"),
    formatKey(env, "WECHAT_SECRET"),
    formatKey(env, "WECHAT_AUTHOR"),
    formatKey(env, "WECHAT_DEFAULT_COVER_PATH"),
    formatKey(env, "WECHAT_DEFAULT_COVER_MEDIA_ID"),
    formatKey(env, "WECHAT_DRAFT_UPLOAD_ENABLED"),
    formatKey(env, "WECHAT_OFFICIAL_DRY_RUN"),
    formatKey(env, "MD2WECHAT_BASE_URL"),
    formatKey(env, "WECHAT_AUTO_PUBLISH"),
  ]);
  printGroup("mini program, PDD redirect, and pay", [
    formatKey(env, "WECHAT_MINIPROGRAM_APPID"),
    formatKey(env, "WECHAT_MINIPROGRAM_SECRET"),
    formatKey(env, "PDD_MINIPROGRAM_APPID"),
    formatKey(env, "PDD_MINIPROGRAM_PATH_TEMPLATE"),
    `PDD_SHORT_LINK_MODE: ${pddMode}`,
    formatKey(env, "PDD_LINK_FALLBACK_MODE"),
    formatKey(env, "WECHAT_PAY_MCH_ID"),
    formatKey(env, "WECHAT_PAY_API_V3_KEY"),
    formatKey(env, "WECHAT_PAY_CERT_SERIAL_NO"),
    formatKey(env, "WECHAT_PAY_PRIVATE_KEY"),
    formatKey(env, "WECHAT_PAY_NOTIFY_URL"),
  ]);

  for (const warning of warnings) {
    console.log(`[wechat:warn] ${warning}`);
  }

  if (errors.length > 0) {
    console.log("\n[wechat] readiness failed");
    for (const error of errors) {
      console.log(`  - ${error}`);
    }
  } else {
    console.log("\n[wechat] readiness check passed");
  }
}

if (errors.length > 0) {
  process.exitCode = 1;
}

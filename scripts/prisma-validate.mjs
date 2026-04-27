import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const equalIndex = trimmed.indexOf("=");
  if (equalIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, equalIndex).trim();
  let value = trimmed.slice(equalIndex + 1).trim();

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

function loadLocalEnv() {
  const env = {};

  for (const file of [".env", ".env.local"]) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      continue;
    }

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
    ...env,
    ...process.env,
  };
}

const env = loadLocalEnv();
const command =
  process.platform === "win32"
    ? path.resolve("node_modules", ".bin", "prisma.cmd")
    : path.resolve("node_modules", ".bin", "prisma");
const args = ["validate"];

const result = spawnSync(command, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...env,
    DATABASE_URL:
      env.DATABASE_URL ||
      "postgresql://placeholder:placeholder@localhost:5432/rongwang",
    DIRECT_URL:
      env.DIRECT_URL ||
      env.DATABASE_URL ||
      "postgresql://placeholder:placeholder@localhost:5432/rongwang",
  },
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);

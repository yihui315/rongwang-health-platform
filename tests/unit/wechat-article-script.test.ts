import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

test("wechat article generator writes assessment-first markdown", async () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "rongwang-wechat-article-"));
  const outFile = path.join(outDir, "sleep-wechat.md");

  await execFileAsync(
    process.execPath,
    [
      "node_modules/tsx/dist/cli.mjs",
      "scripts/wechat-generate-article.ts",
      "--campaign=sleep-wechat",
      "--solution=sleep",
      "--keyword=sleep support",
      "--audience=sleep users",
      `--out=${outFile}`,
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: "test",
      },
    },
  );

  const markdown = fs.readFileSync(outFile, "utf8");

  assert.match(markdown, /^---/);
  assert.match(markdown, /\/ai-consult\?focus=sleep/);
  assert.match(markdown, /\/products\?utm_source=wechat/);
  assert.doesNotMatch(markdown, /\/checkout|\/product-map/);
  assert.match(markdown, /健康教育/);
});

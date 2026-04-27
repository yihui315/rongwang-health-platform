import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
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
  assert.match(output, /Redis credentials are required/);
  assert.match(output, /OPENAI_API_KEY or DEEPSEEK_API_KEY is required/);
  assert.match(output, /GEOFLOW_API_URL is required/);
  assert.match(output, /GEOFLOW_DEFAULT_TITLE_LIBRARY_ID is required/);
});

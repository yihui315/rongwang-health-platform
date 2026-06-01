import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

test("automation gate check verifies retention and outbound send blockers", async () => {
  const result = await execFileAsync(process.execPath, ["scripts/automation-gates-check.mjs"], {
    cwd: process.cwd(),
    env: {
      NODE_ENV: "test",
      PATH: process.env.PATH,
      SystemRoot: process.env.SystemRoot,
      TEMP: process.env.TEMP,
      TMP: process.env.TMP,
    },
  });

  assert.match(result.stdout, /PASS schema includes MarketingPlan/);
  assert.match(result.stdout, /PASS schema\/migration includes blockedReasons/);
  assert.match(result.stdout, /"decision": "PASS"/);
});

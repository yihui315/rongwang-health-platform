import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "@/app/api/ai/consult/stream/route";

test("POST /api/ai/consult/stream returns server-sent analysis steps", async () => {
  const response = await POST(
    new Request("http://localhost/api/ai/consult/stream", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        profile: {
          age: 36,
          gender: "male",
          symptoms: ["容易疲劳"],
          duration: "1 到 4 周",
          lifestyle: {
            sleep: "经常熬夜或睡眠不足",
            alcohol: false,
            smoking: false,
            exercise: "每周 1 到 2 次",
          },
          goal: "改善白天精力",
          medications: "",
          allergies: "",
        },
      }),
    }),
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /text\/event-stream/);
  const text = await response.text();
  assert.match(text, /event: step/);
  assert.match(text, /风险分层/);
});

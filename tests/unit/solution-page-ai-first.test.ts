import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import SolutionPage from "@/app/solutions/[slug]/page";

test("solution pages keep AI assessment as the conversion path instead of direct product-map links", async () => {
  const html = renderToStaticMarkup(
    await SolutionPage({ params: Promise.resolve({ slug: "sleep" }) }),
  );

  assert.match(html, /href="\/ai-consult\?focus=sleep"/);
  assert.doesNotMatch(html, /href="\/product-map\//);
  assert.doesNotMatch(html, /source=solution-page/);
});

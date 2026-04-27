import test from "node:test";
import assert from "node:assert/strict";
import robots from "@/app/robots";

test("robots keeps AI-first content crawlable and excludes operational routes", () => {
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://rongwang.hk/";

  try {
    const result = robots();
    assert.equal(result.sitemap, "https://rongwang.hk/sitemap.xml");
    assert.deepEqual(result.rules, [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt", "/ai-consult", "/assessment/", "/solutions/", "/tools/", "/products/", "/articles/"],
        disallow: ["/api/", "/admin", "/product-map/"],
      },
    ]);
  } finally {
    process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
  }
});

import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt", "/ai-consult", "/assessment/", "/solutions/", "/tools/", "/products/", "/articles/"],
        disallow: ["/api/", "/admin", "/product-map/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

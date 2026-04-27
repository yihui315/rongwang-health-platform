import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const siteUrl = getSiteUrl();
  const body = `# Rongwang Health

Rongwang Health is an AI-first health education and supplement direction platform.
The site provides structured health assessments, educational solution pages, product direction pages, and article content. It does not provide medical diagnosis, treatment, prescriptions, or emergency care.

## Primary Paths

- ${siteUrl}/ai-consult - main AI health consultation flow
- ${siteUrl}/assessment/sleep - sleep assessment
- ${siteUrl}/assessment/fatigue - fatigue assessment
- ${siteUrl}/assessment/liver - liver health assessment
- ${siteUrl}/assessment/immune - immune support assessment
- ${siteUrl}/assessment/male-health - male health assessment
- ${siteUrl}/assessment/female-health - female health assessment
- ${siteUrl}/solutions/sleep - sleep support education
- ${siteUrl}/solutions/fatigue - fatigue support education
- ${siteUrl}/solutions/liver - liver health education
- ${siteUrl}/solutions/immune - immune support education
- ${siteUrl}/solutions/male-health - male health education
- ${siteUrl}/solutions/female-health - female health education
- ${siteUrl}/articles - health education articles

## Content Policy

- Health content is educational and general reference only.
- Urgent or high-risk symptoms should be directed to qualified medical care.
- Product recommendations are rule-based and suppressed for urgent scenarios.
- Purchase redirects use an internal tracking route and should not be treated as canonical content.

## Machine-Readable Resources

- ${siteUrl}/sitemap.xml
- ${siteUrl}/robots.txt
- ${siteUrl}/api/health
- ${siteUrl}/api/cms/health
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

import fs from "node:fs";
import path from "node:path";
import { buildMarketingCampaignPlan } from "@/lib/marketing/automation";

function parseArgs(argv: string[]) {
  const values = new Map<string, string>();
  for (const arg of argv) {
    if (!arg.startsWith("--")) {
      continue;
    }

    const equalIndex = arg.indexOf("=");
    if (equalIndex === -1) {
      values.set(arg.slice(2), "true");
    } else {
      values.set(arg.slice(2, equalIndex), arg.slice(equalIndex + 1));
    }
  }
  return values;
}

const args = parseArgs(process.argv.slice(2));
const campaignSlug = args.get("campaign") ?? "rongwang-wechat";
const solution = args.get("solution") ?? "sleep";
const keyword = args.get("keyword") ?? "AI health assessment";
const audience = args.get("audience") ?? "users who want assessment-first health education";

const plan = buildMarketingCampaignPlan({
  objective: "assessment_conversion",
  audience,
  solution,
  keyword,
  campaignSlug,
  channels: ["wechat"],
});
const wechatAsset = plan.assets.find((asset) => asset.channel === "wechat");

if (!wechatAsset?.wechatArticle) {
  console.error("[wechat:article] failed to build a WeChat article draft");
  process.exit(1);
}

const outputPath = args.get("out")
  ? path.resolve(args.get("out") as string)
  : path.join(process.cwd(), "content", "wechat", wechatAsset.wechatArticle.fileName);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, wechatAsset.wechatArticle.markdown, "utf8");

console.log(JSON.stringify({
  success: true,
  file: outputPath,
  title: wechatAsset.wechatArticle.title,
  digest: wechatAsset.wechatArticle.digest,
  primaryCtaHref: wechatAsset.wechatArticle.primaryCtaHref,
}, null, 2));

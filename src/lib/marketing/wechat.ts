import type { MarketingComplianceResult } from "@/lib/marketing/automation";

export interface WeChatArticleDraft {
  kind: "official_account_article";
  title: string;
  author: string;
  digest: string;
  fileName: string;
  primaryCtaHref: string;
  mallHref: string;
  markdown: string;
  compliance: MarketingComplianceResult;
}

const disclaimer = "本内容仅供健康教育和一般参考，不构成医学诊断、治疗建议或处方。若症状严重、持续或正在服药，请咨询医生或药师。";

function limitText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? normalized.slice(0, maxLength) : normalized;
}

function safeFileName(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${slug || "rongwang-wechat"}.md`;
}

export function buildWeChatArticleDraft(input: {
  campaignSlug: string;
  keyword: string;
  audience: string;
  primaryCtaHref: string;
  secondaryHref: string | null;
  mallHref: string;
  contentOutline: string[];
  compliance: MarketingComplianceResult;
}): WeChatArticleDraft {
  const title = limitText(`${input.keyword}健康评估`, 32);
  const digest = limitText("先完成AI健康评估，再查看适合自己的教育建议和调理方向。", 128);
  const secondaryLine = input.secondaryHref
    ? `- 延伸阅读：${input.secondaryHref}`
    : "- 延伸阅读：完成评估后查看个性化建议。";
  const markdown = [
    "---",
    `title: ${title}`,
    "author: Rongwang Health",
    `digest: ${digest}`,
    `campaign: ${input.campaignSlug}`,
    "---",
    "",
    `# ${title}`,
    "",
    `面向人群：${input.audience}`,
    "",
    "## 先评估，再看方案",
    "",
    "荣旺健康建议先完成结构化AI健康评估，再根据风险等级、生活习惯和目标查看教育建议。",
    "",
    "## 本期重点",
    "",
    ...input.contentOutline.map((item) => `- ${item}`),
    secondaryLine,
    "",
    "## 立即开始",
    "",
    `[立即开始AI健康评估](${input.primaryCtaHref})`,
    "",
    "## 官网商城",
    "",
    "完成评估后，可在荣旺官网商城查看产品资料、规格与站内购买入口。产品信息只作为健康教育后的辅助参考，不替代专业建议。",
    "",
    `[查看荣旺官网商城](${input.mallHref})`,
    "",
    "## 免责声明",
    "",
    disclaimer,
  ].join("\n");

  return {
    kind: "official_account_article",
    title,
    author: "Rongwang Health",
    digest,
    fileName: safeFileName(input.campaignSlug),
    primaryCtaHref: input.primaryCtaHref,
    mallHref: input.mallHref,
    markdown,
    compliance: input.compliance,
  };
}

import type { MarketingChannel } from "@/schemas/marketing";

export interface GeoFlowAutomationStatus {
  configured: boolean;
  canPublish: boolean;
  autoPublishEnabled: boolean;
  requiredDefaults: {
    titleLibraryId: number | null;
    promptId: number | null;
    aiModelId: number | null;
  };
}

export interface GeoFlowTaskPayload {
  name: string;
  status: "active" | "paused";
  title_library_id: number | null;
  image_library_id: number | null;
  image_count: number;
  prompt_id: number | null;
  ai_model_id: number | null;
  need_review: 0 | 1;
  publish_interval: number;
  author_id: number | null;
  auto_keywords: 0 | 1;
  auto_description: 0 | 1;
  draft_limit: number;
  is_loop: 0 | 1;
  knowledge_base_id: number | null;
  category_mode: "smart" | "fixed";
  fixed_category_id: number | null;
}

export interface GeoFlowTaskDraft {
  id: string;
  channel: MarketingChannel;
  title: string;
  endpoint: "POST /tasks";
  payload: GeoFlowTaskPayload;
  metadata: {
    campaignSlug: string;
    keyword: string;
    solutionSlug?: string;
    promptBrief: string;
  };
}

function readPositiveInt(name: string): number | null {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function getGeoFlowAutomationStatus(): GeoFlowAutomationStatus {
  const configured = Boolean(process.env.GEOFLOW_API_URL && process.env.GEOFLOW_API_TOKEN);
  const requiredDefaults = {
    titleLibraryId: readPositiveInt("GEOFLOW_DEFAULT_TITLE_LIBRARY_ID"),
    promptId: readPositiveInt("GEOFLOW_DEFAULT_PROMPT_ID"),
    aiModelId: readPositiveInt("GEOFLOW_DEFAULT_AI_MODEL_ID"),
  };

  return {
    configured,
    canPublish: configured && Object.values(requiredDefaults).every(Boolean),
    autoPublishEnabled: process.env.MARKETING_AUTO_PUBLISH_GEOFLOW === "true",
    requiredDefaults,
  };
}

export function buildGeoFlowTaskPayload(name: string): GeoFlowTaskPayload {
  return {
    name,
    status: "paused",
    title_library_id: readPositiveInt("GEOFLOW_DEFAULT_TITLE_LIBRARY_ID"),
    image_library_id: readPositiveInt("GEOFLOW_DEFAULT_IMAGE_LIBRARY_ID"),
    image_count: Number.parseInt(process.env.GEOFLOW_DEFAULT_IMAGE_COUNT ?? "0", 10) || 0,
    prompt_id: readPositiveInt("GEOFLOW_DEFAULT_PROMPT_ID"),
    ai_model_id: readPositiveInt("GEOFLOW_DEFAULT_AI_MODEL_ID"),
    need_review: 1,
    publish_interval: Number.parseInt(process.env.GEOFLOW_DEFAULT_PUBLISH_INTERVAL ?? "3600", 10) || 3600,
    author_id: readPositiveInt("GEOFLOW_DEFAULT_AUTHOR_ID"),
    auto_keywords: 1,
    auto_description: 1,
    draft_limit: Number.parseInt(process.env.GEOFLOW_DEFAULT_DRAFT_LIMIT ?? "3", 10) || 3,
    is_loop: 0,
    knowledge_base_id: readPositiveInt("GEOFLOW_DEFAULT_KNOWLEDGE_BASE_ID"),
    category_mode: readPositiveInt("GEOFLOW_DEFAULT_CATEGORY_ID") ? "fixed" : "smart",
    fixed_category_id: readPositiveInt("GEOFLOW_DEFAULT_CATEGORY_ID"),
  };
}

export async function publishGeoFlowTaskDraft(draft: GeoFlowTaskDraft) {
  const status = getGeoFlowAutomationStatus();
  if (!status.canPublish || !status.autoPublishEnabled) {
    return {
      ok: false,
      skipped: true,
      reason: "GEOFlow publishing is not fully configured or not enabled.",
    };
  }

  const baseUrl = process.env.GEOFLOW_API_URL?.replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.GEOFLOW_API_TOKEN}`,
    },
    body: JSON.stringify(draft.payload),
  });

  if (!response.ok) {
    return {
      ok: false,
      skipped: false,
      status: response.status,
      reason: await response.text().catch(() => "GEOFlow task creation failed."),
    };
  }

  return {
    ok: true,
    skipped: false,
    status: response.status,
    data: await response.json().catch(() => null),
  };
}

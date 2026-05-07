import { analyzeKpi, type CampaignMetric } from '../agents/analyze-kpi';

export function summarizeCampaign(metric: CampaignMetric) {
  return analyzeKpi(metric);
}

export type CampaignMetric = {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
};

export function analyzeKpi(metric: CampaignMetric) {
  const ctr = metric.impressions === 0 ? 0 : metric.clicks / metric.impressions;
  const cvr = metric.clicks === 0 ? 0 : metric.conversions / metric.clicks;
  const roi = metric.cost === 0 ? 0 : (metric.revenue - metric.cost) / metric.cost;

  return { ctr, cvr, roi };
}

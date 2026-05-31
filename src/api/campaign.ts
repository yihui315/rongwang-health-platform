import {
  runCampaignAgents,
  type CampaignInput,
  type MarketingPlan,
  type ProductCampaignInput,
  type QueuedCampaignPlaceholder,
  type ReportCampaignInput,
} from '../agents/run-campaigns';

export async function queueCampaigns(input: ReportCampaignInput): Promise<MarketingPlan>;
export async function queueCampaigns(input: ProductCampaignInput): Promise<QueuedCampaignPlaceholder>;
export async function queueCampaigns(input: CampaignInput): Promise<MarketingPlan | QueuedCampaignPlaceholder> {
  if ('report' in input) {
    return runCampaignAgents(input);
  }

  return runCampaignAgents(input);
}

import { runCampaignAgents, type CampaignInput } from '../agents/run-campaigns';

export async function queueCampaigns(input: CampaignInput) {
  return runCampaignAgents(input);
}

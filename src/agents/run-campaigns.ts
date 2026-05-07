export type CampaignInput = {
  productId: string;
  channels: string[];
};

export async function runCampaignAgents(input: CampaignInput) {
  return {
    status: 'queued',
    productId: input.productId,
    channels: input.channels,
    message: 'Campaign orchestration is reserved for phase 2.',
  };
}

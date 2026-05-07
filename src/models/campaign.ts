export type Campaign = {
  id: string;
  productId: string;
  channel: string;
  campaignType: string;
  status: 'draft' | 'queued' | 'running' | 'paused' | 'finished';
};

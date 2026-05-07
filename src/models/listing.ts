export type Listing = {
  id: string;
  productId: string;
  channel: string;
  status: 'queued' | 'success' | 'failed' | 'blocked';
  externalListingId?: string | null;
  failureReason?: string | null;
};

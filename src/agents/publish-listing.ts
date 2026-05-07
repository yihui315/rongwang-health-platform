export type ListingChannel = 'site' | 'shopify' | 'manual-review';

export type PublishListingInput = {
  productId: string;
  contentId: string;
  channel: ListingChannel;
  approved: boolean;
};

export type PublishListingResult = {
  status: 'success' | 'blocked' | 'queued';
  listingId: string | null;
  reason: string | null;
};

export async function runPublishListingAgent(input: PublishListingInput): Promise<PublishListingResult> {
  if (!input.approved) {
    return { status: 'blocked', listingId: null, reason: 'Content has not passed manual approval' };
  }

  if (input.channel === 'site') {
    return { status: 'success', listingId: `site_${input.productId}`, reason: null };
  }

  return { status: 'queued', listingId: null, reason: 'Channel integration not enabled in MVP phase' };
}

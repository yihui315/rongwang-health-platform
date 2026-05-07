import { runPublishListingAgent, type PublishListingInput } from '../agents/publish-listing';

export async function publishListing(input: PublishListingInput) {
  return runPublishListingAgent(input);
}

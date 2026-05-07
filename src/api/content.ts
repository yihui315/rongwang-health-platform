import { runGenerateContentAgent, type ProductForGeneration } from '../agents/generate-content';

export async function createGeneratedContent(product: ProductForGeneration) {
  return runGenerateContentAgent(product);
}

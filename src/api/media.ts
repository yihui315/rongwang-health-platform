import { runGenerateMediaAgent, type MediaGenerationInput } from '../agents/generate-media';

export async function createMediaAssets(input: MediaGenerationInput) {
  return runGenerateMediaAgent(input);
}

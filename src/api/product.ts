import { runFetchProductAgent } from '../agents/fetch-product';

export type CreateProductImportRequest = {
  sourceUrl: string;
  createdBy?: string;
};

export async function createProductImportTask(payload: CreateProductImportRequest) {
  const normalized = await runFetchProductAgent({ sourceUrl: payload.sourceUrl, createdBy: payload.createdBy });
  return { taskStatus: 'completed', product: normalized };
}

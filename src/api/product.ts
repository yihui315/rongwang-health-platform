import { runFetchProductAgent } from '../agents/fetch-product';
import {
  createImportTask,
  failAgentTask,
  getProductImportStatus as repoGetProductImportStatus,
  saveImportedProduct,
} from '@/src/lib/repositories/product-repository';

export type CreateProductImportRequest = {
  sourceUrl: string;
  createdBy?: string;
};

export async function createProductImportTask(payload: CreateProductImportRequest) {
  const task = await createImportTask({ sourceUrl: payload.sourceUrl, createdBy: payload.createdBy });
  try {
    const normalized = await runFetchProductAgent({ sourceUrl: payload.sourceUrl, createdBy: payload.createdBy });
    const product = await saveImportedProduct(normalized, task.id);
    return { ok: true, taskStatus: 'completed', task, product };
  } catch (error) {
    await failAgentTask(task.id, error instanceof Error ? error.message : 'Import failed');
    throw error;
  }
}

export async function getProductImportStatus(taskId: string) {
  return repoGetProductImportStatus(taskId);
}

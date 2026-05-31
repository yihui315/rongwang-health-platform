import { runFetchProductAgent } from '../agents/fetch-product';
import {
  createImportTask,
  failAgentTask,
  getAgentTaskById,
  saveImportedProduct,
} from '../lib/mock-store';

export type CreateProductImportRequest = {
  sourceUrl: string;
  createdBy?: string;
};

export async function createProductImportTask(payload: CreateProductImportRequest) {
  const task = createImportTask({ sourceUrl: payload.sourceUrl, createdBy: payload.createdBy ?? null });

  try {
    const normalized = await runFetchProductAgent({ sourceUrl: payload.sourceUrl, createdBy: payload.createdBy });
    const product = saveImportedProduct(normalized, task.id);
    const completedTask = getAgentTaskById(task.id) ?? task;

    return { ok: true as const, taskStatus: completedTask.status, taskId: task.id, task: completedTask, product };
  } catch (error) {
    const failedTask = failAgentTask(task.id, error instanceof Error ? error.message : 'Import failed') ?? task;
    throw Object.assign(error instanceof Error ? error : new Error('Import failed'), { task: failedTask });
  }
}

export function getProductImportStatus(taskId: string) {
  return getAgentTaskById(taskId);
}

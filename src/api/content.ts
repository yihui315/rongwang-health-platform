import { runGenerateContentAgent, type ProductForGeneration } from '../agents/generate-content';
import {
  createContentTask,
  failAgentTask,
  getAgentTaskById,
  getMockProductById,
  saveContentWithComplianceReview,
} from '../lib/mock-store';

export type CreateGeneratedContentRequest =
  | (ProductForGeneration & { createdBy?: string | null })
  | {
      productId: string;
      createdBy?: string | null;
    };

export async function createGeneratedContent(input: CreateGeneratedContentRequest) {
  const createdBy = input.createdBy ?? null;

  if ('title' in input) {
    const task = createContentTask({ productId: input.productId, createdBy });

    try {
      const generated = await runGenerateContentAgent({
        productId: input.productId,
        title: input.title,
        brand: input.brand,
        originCountry: input.originCountry,
        category: input.category,
        specs: input.specs,
      });
      const { content, review } = saveContentWithComplianceReview(input.productId, generated, task.id);
      const completedTask = getAgentTaskById(task.id) ?? task;

      return {
        ok: true as const,
        taskStatus: completedTask.status,
        taskId: task.id,
        task: completedTask,
        content,
        review,
        product: input,
      };
    } catch (error) {
      const failedTask = failAgentTask(task.id, error instanceof Error ? error.message : 'Generation failed') ?? task;
      throw Object.assign(error instanceof Error ? error : new Error('Generation failed'), { task: failedTask });
    }
  }

  const product = getMockProductById(input.productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const task = createContentTask({ productId: product.id, createdBy });

  try {
    const generated = await runGenerateContentAgent({
      productId: product.id,
      title: product.title,
      brand: product.brand,
      originCountry: product.originCountry,
      category: product.category,
      specs: product.specs,
    });
    const { content, review } = saveContentWithComplianceReview(product.id, generated, task.id);
    const completedTask = getAgentTaskById(task.id) ?? task;

    return {
      ok: true as const,
      taskStatus: completedTask.status,
      taskId: task.id,
      task: completedTask,
      content,
      review,
      product,
    };
  } catch (error) {
    const failedTask = failAgentTask(task.id, error instanceof Error ? error.message : 'Generation failed') ?? task;
    throw Object.assign(error instanceof Error ? error : new Error('Generation failed'), { task: failedTask });
  }
}

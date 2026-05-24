import { runGenerateContentAgent, type ProductForGeneration } from '../agents/generate-content';
import {
  createContentTask,
  failAgentTask,
  getProductById,
  saveContentWithComplianceReview,
} from '@/src/lib/repositories/product-repository';

export async function createGeneratedContent(product: ProductForGeneration) {
  return runGenerateContentAgent(product);
}

export async function createGeneratedContentForProduct(input: {
  productId: string;
  createdBy?: string;
}) {
  const product = await getProductById(input.productId);

  if (!product) {
    throw new Error('Product not found');
  }

  const task = await createContentTask({ productId: product.id, createdBy: input.createdBy });
  try {
    const generated = await runGenerateContentAgent({
      productId: product.id,
      title: product.title,
      brand: product.brand,
      originCountry: product.originCountry,
      category: product.category,
      specs: product.specs,
    });
    const { content, review } = await saveContentWithComplianceReview(product.id, generated, task.id);

    return { ok: true, taskStatus: 'completed', task, content, review, product };
  } catch (error) {
    await failAgentTask(task.id, error instanceof Error ? error.message : 'Generation failed');
    throw error;
  }
}

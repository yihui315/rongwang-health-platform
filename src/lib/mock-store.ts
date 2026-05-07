import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import type { GeneratedContent } from '../agents/generate-content';
import type { NormalizedProduct } from '../agents/fetch-product';
import { scanCompliance, type ComplianceScanResult } from '../services/compliance-service';

export type ProductStatus = 'draft' | 'imported' | 'approved' | 'rejected';
export type ContentStatus = 'generated' | 'compliance_flagged' | 'pending_manual_review' | 'approved' | 'rejected';
export type AgentTaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export type StoredProduct = NormalizedProduct & {
  id: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type StoredContent = GeneratedContent & {
  id: string;
  productId: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
};

export type StoredAgentTask = {
  id: string;
  taskType: 'fetch_product' | 'generate_content';
  targetType: 'product' | 'content';
  targetId: string | null;
  inputPayload: Record<string, unknown>;
  outputPayload: Record<string, unknown>;
  status: AgentTaskStatus;
  errorMessage: string | null;
  createdBy: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoredComplianceReview = {
  id: string;
  productId: string;
  contentId: string;
  reviewStatus: 'pending_manual_review' | 'compliance_flagged' | 'approved' | 'rejected';
  riskLevel: ComplianceScanResult['riskLevel'];
  riskFlags: string[];
  reviewNotes: string | null;
  reviewer: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StorefrontProduct = StoredProduct & {
  content: StoredContent;
};

type StoreState = {
  products: StoredProduct[];
  contents: StoredContent[];
  agentTasks: StoredAgentTask[];
  complianceReviews: StoredComplianceReview[];
};

declare global {
  // eslint-disable-next-line no-var
  var __rongwangMockStore: StoreState | undefined;
}

const dataDirectory = path.join(process.cwd(), '.rongwang-data');
const storePath = path.join(dataDirectory, 'mock-store.json');
const crossBorderDisclaimer = '本商品符合原产国标准，可能与中国相关标准存在差异，请消费者知悉后谨慎选购。';
const healthDisclaimer = '本品不能替代药物。';

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

function createSeedStore(): StoreState {
  const createdAt = nowIso();
  const productId = 'prod_demo_approved';
  const contentId = 'content_demo_approved';

  return {
    products: [
      {
        id: productId,
        source: 'jd',
        sourceUrl: 'https://item.jd.com/demo-vitamin.html',
        externalId: null,
        title: '荣旺进口维生素营养片',
        subtitle: '每日营养支持',
        brand: 'Rongwang',
        originCountry: 'Australia',
        category: '营养补充',
        priceText: '¥199',
        specs: { 规格: '60 粒', 产地: 'Australia' },
        rawPayload: {
          source: 'jd',
          sourceUrl: 'https://item.jd.com/demo-vitamin.html',
          title: '荣旺进口维生素营养片',
          price: '¥199',
          images: [],
          specs: { 规格: '60 粒', 产地: 'Australia' },
        },
        status: 'approved',
        createdAt,
        updatedAt: createdAt,
      },
    ],
    contents: [
      {
        id: contentId,
        productId,
        shortTitle: '荣旺进口维生素营养片',
        shortDescription: '进口营养补充商品信息展示，适合作为日常营养支持方向参考。',
        longDescription: '本页面用于展示商品基础信息、规格、原产地、中文说明和合规声明。具体使用请结合产品说明并咨询专业人士。',
        seoKeywords: ['荣旺健康', '进口营养补充', '跨境健康平台'],
        faqDraft: ['购买前需要注意哪些事项？', '是否有中文说明或成分信息？'],
        disclaimer: `${healthDisclaimer}${crossBorderDisclaimer}`,
        riskFlags: [],
        status: 'approved',
        createdAt,
        updatedAt: createdAt,
      },
    ],
    agentTasks: [],
    complianceReviews: [
      {
        id: 'review_demo_approved',
        productId,
        contentId,
        reviewStatus: 'approved',
        riskLevel: 'low',
        riskFlags: [],
        reviewNotes: 'Seed content approved for local MVP storefront.',
        reviewer: 'system-seed',
        reviewedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      },
    ],
  };
}

export function resetMockStoreToSeed(): void {
  resetMockStore(createSeedStore());
}

function readStoreFromDisk(): StoreState {
  if (!existsSync(storePath)) {
    return createSeedStore();
  }

  try {
    return JSON.parse(readFileSync(storePath, 'utf8')) as StoreState;
  } catch {
    return createSeedStore();
  }
}

function persistStore(): void {
  mkdirSync(dataDirectory, { recursive: true });
  writeFileSync(storePath, `${JSON.stringify(store, null, 2)}\n`);
}

const store = globalThis.__rongwangMockStore ?? (globalThis.__rongwangMockStore = readStoreFromDisk());

export function resetMockStore(seed: StoreState | null = null): void {
  store.products = seed?.products ?? [];
  store.contents = seed?.contents ?? [];
  store.agentTasks = seed?.agentTasks ?? [];
  store.complianceReviews = seed?.complianceReviews ?? [];
  persistStore();
}

export function createImportTask(input: { sourceUrl: string; createdBy?: string | null }): StoredAgentTask {
  const createdAt = nowIso();
  const task: StoredAgentTask = {
    id: newId('task'),
    taskType: 'fetch_product',
    targetType: 'product',
    targetId: null,
    inputPayload: { sourceUrl: input.sourceUrl },
    outputPayload: {},
    status: 'running',
    errorMessage: null,
    createdBy: input.createdBy ?? null,
    startedAt: createdAt,
    finishedAt: null,
    createdAt,
    updatedAt: createdAt,
  };

  store.agentTasks.push(task);
  persistStore();
  return task;
}

export function createContentTask(input: { productId: string; createdBy?: string | null }): StoredAgentTask {
  const createdAt = nowIso();
  const task: StoredAgentTask = {
    id: newId('task'),
    taskType: 'generate_content',
    targetType: 'content',
    targetId: null,
    inputPayload: { productId: input.productId },
    outputPayload: {},
    status: 'running',
    errorMessage: null,
    createdBy: input.createdBy ?? null,
    startedAt: createdAt,
    finishedAt: null,
    createdAt,
    updatedAt: createdAt,
  };

  store.agentTasks.push(task);
  persistStore();
  return task;
}

export function failAgentTask(taskId: string, errorMessage: string): StoredAgentTask | undefined {
  const task = store.agentTasks.find((item) => item.id === taskId);
  if (!task) return undefined;

  const updatedAt = nowIso();
  task.status = 'failed';
  task.errorMessage = errorMessage;
  task.finishedAt = updatedAt;
  task.updatedAt = updatedAt;
  persistStore();
  return task;
}

function completeAgentTask(taskId: string, targetId: string, outputPayload: Record<string, unknown>): StoredAgentTask | undefined {
  const task = store.agentTasks.find((item) => item.id === taskId);
  if (!task) return undefined;

  const updatedAt = nowIso();
  task.status = 'completed';
  task.targetId = targetId;
  task.outputPayload = outputPayload;
  task.finishedAt = updatedAt;
  task.updatedAt = updatedAt;
  persistStore();
  return task;
}

export function saveImportedProduct(product: NormalizedProduct, taskId?: string): StoredProduct {
  const createdAt = nowIso();
  const stored: StoredProduct = {
    ...product,
    id: newId('prod'),
    status: 'imported',
    createdAt,
    updatedAt: createdAt,
  };

  store.products.push(stored);

  if (taskId) {
    completeAgentTask(taskId, stored.id, { productId: stored.id, title: stored.title, source: stored.source });
  } else {
    persistStore();
  }

  return stored;
}

export function createMockProduct(product: NormalizedProduct): StoredProduct {
  return saveImportedProduct(product);
}

export function getProductById(productId: string): StoredProduct | undefined {
  return store.products.find((item) => item.id === productId);
}

export function getMockProductById(productId: string): StoredProduct | undefined {
  return getProductById(productId);
}

export function listMockProducts(): StoredProduct[] {
  return [...store.products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveContentWithComplianceReview(
  productId: string,
  content: GeneratedContent,
  taskId?: string
): { content: StoredContent; review: StoredComplianceReview } {
  const generatedText = [
    content.shortTitle,
    content.shortDescription,
    content.longDescription,
    ...content.faqDraft,
    ...content.seoKeywords,
  ].join(' ');
  const scan = scanCompliance(generatedText, content.disclaimer);
  const createdAt = nowIso();
  const storedContent: StoredContent = {
    ...content,
    id: newId('content'),
    productId,
    riskFlags: [...new Set([...content.riskFlags, ...scan.riskFlags])],
    status: scan.reviewStatus,
    createdAt,
    updatedAt: createdAt,
  };
  const review: StoredComplianceReview = {
    id: newId('review'),
    productId,
    contentId: storedContent.id,
    reviewStatus: scan.reviewStatus,
    riskLevel: scan.riskLevel,
    riskFlags: storedContent.riskFlags,
    reviewNotes:
      scan.reviewStatus === 'compliance_flagged'
        ? 'Automatic compliance precheck found risk flags. Manual review required before storefront exposure.'
        : 'Automatic compliance precheck passed. Manual approval still required before storefront exposure.',
    reviewer: null,
    reviewedAt: null,
    createdAt,
    updatedAt: createdAt,
  };

  store.contents.push(storedContent);
  store.complianceReviews.push(review);

  if (taskId) {
    completeAgentTask(taskId, storedContent.id, {
      contentId: storedContent.id,
      reviewId: review.id,
      reviewStatus: review.reviewStatus,
      riskFlags: review.riskFlags,
    });
  } else {
    persistStore();
  }

  return { content: storedContent, review };
}

export function saveGeneratedContent(productId: string, content: GeneratedContent): StoredContent {
  return saveContentWithComplianceReview(productId, content).content;
}

export function listGeneratedContents(): StoredContent[] {
  return [...store.contents].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listAgentTasks(): StoredAgentTask[] {
  return [...store.agentTasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listComplianceReviews(): StoredComplianceReview[] {
  return [...store.complianceReviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listApprovedStorefrontProducts(): StorefrontProduct[] {
  return store.products
    .filter((product) => product.status === 'approved')
    .map((product) => {
      const content = store.contents
        .filter((item) => item.productId === product.id && item.status === 'approved')
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

      return content ? { ...product, content } : null;
    })
    .filter((item): item is StorefrontProduct => item !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getApprovedStorefrontProduct(productId: string): StorefrontProduct | undefined {
  return listApprovedStorefrontProducts().find((product) => product.id === productId);
}

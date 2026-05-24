import { randomUUID } from 'node:crypto';

import type { GeneratedContent } from '@/src/agents/generate-content';
import type { NormalizedProduct } from '@/src/agents/fetch-product';
import { scanCompliance, type ComplianceScanResult } from '@/src/services/compliance-service';
import { query, shouldUsePostgresRepository, withTransaction, type TransactionClient } from '../db';
import * as mockStore from '../mock-store';

export type ProductStatus = mockStore.ProductStatus;
export type ContentStatus = mockStore.ContentStatus;
export type AgentTaskStatus = mockStore.AgentTaskStatus;
export type StoredProduct = mockStore.StoredProduct;
export type StoredContent = mockStore.StoredContent;
export type StoredAgentTask = mockStore.StoredAgentTask;
export type StoredComplianceReview = mockStore.StoredComplianceReview;
export type StorefrontProduct = mockStore.StorefrontProduct;

export type ReviewDecision = 'approved' | 'rejected';

type ProductRow = {
  id: string;
  source: string;
  source_url: string;
  external_id: string | null;
  title: string;
  subtitle: string | null;
  brand: string | null;
  origin_country: string | null;
  category: string | null;
  price_text: string | null;
  specs: Record<string, string> | null;
  raw_payload: NormalizedProduct['rawPayload'] | null;
  status: ProductStatus;
  created_at: Date | string;
  updated_at: Date | string;
};

type ContentRow = {
  id: string;
  product_id: string;
  short_title: string;
  short_description: string;
  long_description: string;
  seo_keywords: string[] | null;
  faq_draft: string[] | null;
  disclaimer: string | null;
  risk_flags: string[] | null;
  status: ContentStatus;
  created_at: Date | string;
  updated_at: Date | string;
};

type TaskRow = {
  id: string;
  task_type: StoredAgentTask['taskType'];
  target_type: StoredAgentTask['targetType'];
  target_id: string | null;
  input_payload: Record<string, unknown> | null;
  output_payload: Record<string, unknown> | null;
  status: AgentTaskStatus;
  error_message: string | null;
  created_by: string | null;
  started_at: Date | string | null;
  finished_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type ReviewRow = {
  id: string;
  product_id: string;
  content_id: string;
  review_status: StoredComplianceReview['reviewStatus'];
  risk_level: ComplianceScanResult['riskLevel'];
  risk_flags: string[] | null;
  review_notes: string | null;
  reviewer: string | null;
  reviewed_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export type StorefrontProductRow = {
  product_id: string;
  source: string;
  source_url: string;
  external_id: string | null;
  title: string;
  subtitle: string | null;
  brand: string | null;
  origin_country: string | null;
  category: string | null;
  price_text: string | null;
  specs: Record<string, string> | null;
  raw_payload: NormalizedProduct['rawPayload'] | null;
  product_status: ProductStatus;
  product_created_at: Date | string;
  product_updated_at: Date | string;
  content_id: string;
  content_product_id: string;
  short_title: string;
  short_description: string;
  long_description: string;
  seo_keywords: string[] | null;
  faq_draft: string[] | null;
  disclaimer: string | null;
  risk_flags: string[] | null;
  content_status: ContentStatus;
  content_created_at: Date | string;
  content_updated_at: Date | string;
};

function iso(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : value;
}

function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

function mapProduct(row: ProductRow): StoredProduct {
  return {
    id: row.id,
    source: row.source as StoredProduct['source'],
    sourceUrl: row.source_url,
    externalId: row.external_id,
    title: row.title,
    subtitle: row.subtitle,
    brand: row.brand,
    originCountry: row.origin_country,
    category: row.category,
    priceText: row.price_text,
    specs: row.specs ?? {},
    rawPayload: row.raw_payload ?? {
      source: row.source as StoredProduct['source'],
      sourceUrl: row.source_url,
    },
    status: row.status,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function mapContent(row: ContentRow): StoredContent {
  return {
    id: row.id,
    productId: row.product_id,
    shortTitle: row.short_title,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    seoKeywords: row.seo_keywords ?? [],
    faqDraft: row.faq_draft ?? [],
    disclaimer: row.disclaimer ?? '',
    riskFlags: row.risk_flags ?? [],
    status: row.status,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapStorefrontProductRow(row: StorefrontProductRow): StorefrontProduct {
  return {
    ...mapProduct({
      id: row.product_id,
      source: row.source,
      source_url: row.source_url,
      external_id: row.external_id,
      title: row.title,
      subtitle: row.subtitle,
      brand: row.brand,
      origin_country: row.origin_country,
      category: row.category,
      price_text: row.price_text,
      specs: row.specs,
      raw_payload: row.raw_payload,
      status: row.product_status,
      created_at: row.product_created_at,
      updated_at: row.product_updated_at,
    }),
    content: mapContent({
      id: row.content_id,
      product_id: row.content_product_id,
      short_title: row.short_title,
      short_description: row.short_description,
      long_description: row.long_description,
      seo_keywords: row.seo_keywords,
      faq_draft: row.faq_draft,
      disclaimer: row.disclaimer,
      risk_flags: row.risk_flags,
      status: row.content_status,
      created_at: row.content_created_at,
      updated_at: row.content_updated_at,
    }),
  };
}

function mapTask(row: TaskRow): StoredAgentTask {
  return {
    id: row.id,
    taskType: row.task_type,
    targetType: row.target_type,
    targetId: row.target_id,
    inputPayload: row.input_payload ?? {},
    outputPayload: row.output_payload ?? {},
    status: row.status,
    errorMessage: row.error_message,
    createdBy: row.created_by,
    startedAt: row.started_at ? iso(row.started_at) : null,
    finishedAt: row.finished_at ? iso(row.finished_at) : null,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function mapReview(row: ReviewRow): StoredComplianceReview {
  return {
    id: row.id,
    productId: row.product_id,
    contentId: row.content_id,
    reviewStatus: row.review_status,
    riskLevel: row.risk_level,
    riskFlags: row.risk_flags ?? [],
    reviewNotes: row.review_notes,
    reviewer: row.reviewer,
    reviewedAt: row.reviewed_at ? iso(row.reviewed_at) : null,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

async function completeAgentTask(
  taskId: string,
  targetId: string,
  outputPayload: Record<string, unknown>,
  client?: TransactionClient
): Promise<StoredAgentTask | undefined> {
  if (!shouldUsePostgresRepository()) {
    const task = mockStore.listAgentTasks().find((item) => item.id === taskId);
    if (!task) return undefined;
    task.status = 'completed';
    task.targetId = targetId;
    task.outputPayload = outputPayload;
    task.finishedAt = new Date().toISOString();
    task.updatedAt = task.finishedAt;
    mockStore.resetMockStore({
      products: mockStore.listMockProducts(),
      contents: mockStore.listGeneratedContents(),
      agentTasks: mockStore.listAgentTasks(),
      complianceReviews: mockStore.listComplianceReviews(),
    });
    return task;
  }

  if (client) {
    const result = await client.query<TaskRow>(
      `UPDATE agent_tasks
       SET status = 'completed',
           target_id = $2,
           output_payload = $3::jsonb,
           finished_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [taskId, targetId, JSON.stringify(outputPayload)]
    );
    return result.rows[0] ? mapTask(result.rows[0]) : undefined;
  }

  const result = await query<TaskRow>(
    `UPDATE agent_tasks
     SET status = 'completed',
         target_id = $2,
         output_payload = $3::jsonb,
         finished_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [taskId, targetId, JSON.stringify(outputPayload)]
  );
  return result.rows[0] ? mapTask(result.rows[0]) : undefined;
}

export async function createImportTask(input: {
  sourceUrl: string;
  createdBy?: string | null;
}): Promise<StoredAgentTask> {
  if (!shouldUsePostgresRepository()) return mockStore.createImportTask(input);

  const result = await query<TaskRow>(
    `INSERT INTO agent_tasks (
       id, task_type, target_type, input_payload, output_payload, status, created_by, started_at
     )
     VALUES ($1, 'fetch_product', 'product', $2::jsonb, '{}'::jsonb, 'running', $3, NOW())
     RETURNING *`,
    [newId('task'), JSON.stringify({ sourceUrl: input.sourceUrl }), input.createdBy ?? null]
  );

  return mapTask(result.rows[0]);
}

export async function createContentTask(input: {
  productId: string;
  createdBy?: string | null;
}): Promise<StoredAgentTask> {
  if (!shouldUsePostgresRepository()) return mockStore.createContentTask(input);

  const result = await query<TaskRow>(
    `INSERT INTO agent_tasks (
       id, task_type, target_type, input_payload, output_payload, status, created_by, started_at
     )
     VALUES ($1, 'generate_content', 'content', $2::jsonb, '{}'::jsonb, 'running', $3, NOW())
     RETURNING *`,
    [newId('task'), JSON.stringify({ productId: input.productId }), input.createdBy ?? null]
  );

  return mapTask(result.rows[0]);
}

export async function failAgentTask(taskId: string, errorMessage: string): Promise<StoredAgentTask | undefined> {
  if (!shouldUsePostgresRepository()) return mockStore.failAgentTask(taskId, errorMessage);

  const result = await query<TaskRow>(
    `UPDATE agent_tasks
     SET status = 'failed',
         error_message = $2,
         finished_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [taskId, errorMessage]
  );

  return result.rows[0] ? mapTask(result.rows[0]) : undefined;
}

export async function getAgentTaskById(taskId: string): Promise<StoredAgentTask | undefined> {
  if (!shouldUsePostgresRepository()) {
    return mockStore.listAgentTasks().find((item) => item.id === taskId);
  }

  const result = await query<TaskRow>('SELECT * FROM agent_tasks WHERE id = $1', [taskId]);
  return result.rows[0] ? mapTask(result.rows[0]) : undefined;
}

export async function getProductImportStatus(taskId: string): Promise<StoredAgentTask | undefined> {
  return getAgentTaskById(taskId);
}

export async function saveImportedProduct(product: NormalizedProduct, taskId?: string): Promise<StoredProduct> {
  if (!shouldUsePostgresRepository()) return mockStore.saveImportedProduct(product, taskId);

  const existing = await query<ProductRow>('SELECT * FROM products WHERE source_url = $1 LIMIT 1', [product.sourceUrl]);
  let stored: StoredProduct;

  if (existing.rows[0]) {
    const result = await query<ProductRow>(
      `UPDATE products
       SET source = $2,
           external_id = $3,
           title = $4,
           subtitle = $5,
           brand = $6,
           origin_country = $7,
           category = $8,
           price_text = $9,
           specs = $10::jsonb,
           raw_payload = $11::jsonb,
           status = 'imported',
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        existing.rows[0].id,
        product.source,
        product.externalId,
        product.title,
        product.subtitle,
        product.brand,
        product.originCountry,
        product.category,
        product.priceText,
        JSON.stringify(product.specs),
        JSON.stringify(product.rawPayload),
      ]
    );
    stored = mapProduct(result.rows[0]);
  } else {
    const result = await query<ProductRow>(
      `INSERT INTO products (
         id, source, source_url, external_id, title, subtitle, brand, origin_country,
         category, price_text, specs, raw_payload, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, 'imported')
       RETURNING *`,
      [
        newId('prod'),
        product.source,
        product.sourceUrl,
        product.externalId,
        product.title,
        product.subtitle,
        product.brand,
        product.originCountry,
        product.category,
        product.priceText,
        JSON.stringify(product.specs),
        JSON.stringify(product.rawPayload),
      ]
    );
    stored = mapProduct(result.rows[0]);
  }

  if (taskId) {
    await completeAgentTask(taskId, stored.id, { productId: stored.id, title: stored.title, source: stored.source });
  }

  return stored;
}

export async function getProductById(productId: string): Promise<StoredProduct | undefined> {
  if (!shouldUsePostgresRepository()) return mockStore.getProductById(productId);

  const result = await query<ProductRow>('SELECT * FROM products WHERE id = $1', [productId]);
  return result.rows[0] ? mapProduct(result.rows[0]) : undefined;
}

export async function listProducts(): Promise<StoredProduct[]> {
  if (!shouldUsePostgresRepository()) return mockStore.listMockProducts();

  const result = await query<ProductRow>('SELECT * FROM products ORDER BY created_at DESC');
  return result.rows.map(mapProduct);
}

export async function saveContentWithComplianceReview(
  productId: string,
  content: GeneratedContent,
  taskId?: string
): Promise<{ content: StoredContent; review: StoredComplianceReview }> {
  if (!shouldUsePostgresRepository()) return mockStore.saveContentWithComplianceReview(productId, content, taskId);

  const generatedText = [
    content.shortTitle,
    content.shortDescription,
    content.longDescription,
    ...content.faqDraft,
    ...content.seoKeywords,
  ].join(' ');
  const scan = scanCompliance(generatedText, content.disclaimer);
  const riskFlags = [...new Set([...content.riskFlags, ...scan.riskFlags])];

  return withTransaction(async (client) => {
    const productResult = await client.query<ProductRow>('SELECT * FROM products WHERE id = $1', [productId]);
    if (!productResult.rows[0]) {
      throw new Error('Product not found');
    }

    const contentResult = await client.query<ContentRow>(
      `INSERT INTO product_contents (
         id, product_id, short_title, short_description, long_description,
         seo_keywords, faq_draft, disclaimer, risk_flags, status
       )
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9::jsonb, $10)
       RETURNING *`,
      [
        newId('content'),
        productId,
        content.shortTitle,
        content.shortDescription,
        content.longDescription,
        JSON.stringify(content.seoKeywords),
        JSON.stringify(content.faqDraft),
        content.disclaimer,
        JSON.stringify(riskFlags),
        scan.reviewStatus,
      ]
    );
    const storedContent = mapContent(contentResult.rows[0]);

    const reviewResult = await client.query<ReviewRow>(
      `INSERT INTO compliance_reviews (
         id, product_id, content_id, review_status, risk_level, risk_flags, review_notes
       )
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
       RETURNING *`,
      [
        newId('review'),
        productId,
        storedContent.id,
        scan.reviewStatus,
        scan.riskLevel,
        JSON.stringify(riskFlags),
        scan.reviewStatus === 'compliance_flagged'
          ? 'Automatic compliance precheck found risk flags. Manual review required before storefront exposure.'
          : 'Automatic compliance precheck passed. Manual approval still required before storefront exposure.',
      ]
    );
    const review = mapReview(reviewResult.rows[0]);

    await client.query(
      `INSERT INTO listings (id, product_id, content_id, channel, status)
       VALUES ($1, $2, $3, 'site', 'pending_manual_review')`,
      [newId('listing'), productId, storedContent.id]
    );

    if (taskId) {
      await client.query(
        `UPDATE agent_tasks
         SET status = 'completed',
             target_id = $2,
             output_payload = $3::jsonb,
             finished_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [
          taskId,
          storedContent.id,
          JSON.stringify({
            contentId: storedContent.id,
            reviewId: review.id,
            reviewStatus: review.reviewStatus,
            riskFlags: review.riskFlags,
          }),
        ]
      );
    }

    return { content: storedContent, review };
  });
}

export async function saveGeneratedContent(productId: string, content: GeneratedContent): Promise<StoredContent> {
  return (await saveContentWithComplianceReview(productId, content)).content;
}

export async function listGeneratedContents(): Promise<StoredContent[]> {
  if (!shouldUsePostgresRepository()) return mockStore.listGeneratedContents();

  const result = await query<ContentRow>('SELECT * FROM product_contents ORDER BY created_at DESC');
  return result.rows.map(mapContent);
}

export async function listAgentTasks(): Promise<StoredAgentTask[]> {
  if (!shouldUsePostgresRepository()) return mockStore.listAgentTasks();

  const result = await query<TaskRow>('SELECT * FROM agent_tasks ORDER BY created_at DESC');
  return result.rows.map(mapTask);
}

export async function listComplianceReviews(): Promise<StoredComplianceReview[]> {
  if (!shouldUsePostgresRepository()) return mockStore.listComplianceReviews();

  const result = await query<ReviewRow>('SELECT * FROM compliance_reviews ORDER BY created_at DESC');
  return result.rows.map(mapReview);
}

export async function getComplianceReviewById(reviewId: string): Promise<StoredComplianceReview | undefined> {
  if (!shouldUsePostgresRepository()) {
    return mockStore.listComplianceReviews().find((item) => item.id === reviewId);
  }

  const result = await query<ReviewRow>('SELECT * FROM compliance_reviews WHERE id = $1', [reviewId]);
  return result.rows[0] ? mapReview(result.rows[0]) : undefined;
}

export async function reviewContent(input: {
  reviewId: string;
  decision: ReviewDecision;
  reviewer?: string | null;
  notes?: string | null;
}): Promise<{ review: StoredComplianceReview; content: StoredContent; product: StoredProduct } | undefined> {
  if (!shouldUsePostgresRepository()) {
    const state = {
      products: await listProducts(),
      contents: await listGeneratedContents(),
      agentTasks: await listAgentTasks(),
      complianceReviews: await listComplianceReviews(),
    };
    const review = state.complianceReviews.find((item) => item.id === input.reviewId);
    if (!review) return undefined;

    const product = state.products.find((item) => item.id === review.productId);
    const content = state.contents.find((item) => item.id === review.contentId);
    if (!product || !content) return undefined;

    const updatedAt = new Date().toISOString();
    product.status = input.decision;
    product.updatedAt = updatedAt;
    content.status = input.decision === 'approved' ? 'approved' : 'rejected';
    content.updatedAt = updatedAt;
    review.reviewStatus = input.decision;
    review.reviewer = input.reviewer ?? 'workspace';
    review.reviewNotes = input.notes ?? review.reviewNotes;
    review.reviewedAt = updatedAt;
    review.updatedAt = updatedAt;
    mockStore.resetMockStore({
      products: state.products,
      contents: state.contents,
      agentTasks: state.agentTasks,
      complianceReviews: state.complianceReviews,
    });

    return { product, content, review };
  }

  const reviewResult = await query<ReviewRow>('SELECT * FROM compliance_reviews WHERE id = $1', [input.reviewId]);
  const reviewRow = reviewResult.rows[0];
  if (!reviewRow) return undefined;

  return withTransaction(async (client) => {
    const productStatus: ProductStatus = input.decision;
    const contentStatus: ContentStatus = input.decision;

    const productResult = await client.query<ProductRow>(
      'UPDATE products SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
      [reviewRow.product_id, productStatus]
    );
    const contentResult = await client.query<ContentRow>(
      'UPDATE product_contents SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
      [reviewRow.content_id, contentStatus]
    );
    const updatedReviewResult = await client.query<ReviewRow>(
      `UPDATE compliance_reviews
       SET review_status = $2,
           reviewer = $3,
           review_notes = COALESCE($4, review_notes),
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [input.reviewId, input.decision, input.reviewer ?? 'workspace', input.notes ?? null]
    );

    await client.query(
      `UPDATE listings
       SET status = $3,
           updated_at = NOW()
       WHERE product_id = $1 AND content_id = $2`,
      [reviewRow.product_id, reviewRow.content_id, input.decision === 'approved' ? 'ready' : 'rejected']
    );

    if (!productResult.rows[0] || !contentResult.rows[0] || !updatedReviewResult.rows[0]) return undefined;

    return {
      product: mapProduct(productResult.rows[0]),
      content: mapContent(contentResult.rows[0]),
      review: mapReview(updatedReviewResult.rows[0]),
    };
  });
}

export async function listApprovedStorefrontProducts(): Promise<StorefrontProduct[]> {
  if (!shouldUsePostgresRepository()) return mockStore.listApprovedStorefrontProducts();

  const result = await query<StorefrontProductRow>(
    `SELECT
       p.id AS product_id,
       p.source,
       p.source_url,
       p.external_id,
       p.title,
       p.subtitle,
       p.brand,
       p.origin_country,
       p.category,
       p.price_text,
       p.specs,
       p.raw_payload,
       p.status AS product_status,
       p.created_at AS product_created_at,
       p.updated_at AS product_updated_at,
       c.id AS content_id,
       c.product_id AS content_product_id,
       c.short_title,
       c.short_description,
       c.long_description,
       c.seo_keywords,
       c.faq_draft,
       c.disclaimer,
       c.risk_flags,
       c.status AS content_status,
       c.created_at AS content_created_at,
       c.updated_at AS content_updated_at
     FROM products p
     JOIN product_contents c ON c.product_id = p.id
     WHERE p.status = 'approved' AND c.status = 'approved'
     ORDER BY p.updated_at DESC`
  );

  return result.rows.map(mapStorefrontProductRow);
}

export async function listLaunchStorefrontProducts(): Promise<StorefrontProduct[]> {
  return listApprovedStorefrontProducts();
}

export async function getApprovedStorefrontProduct(productId: string): Promise<StorefrontProduct | undefined> {
  if (!shouldUsePostgresRepository()) return mockStore.getApprovedStorefrontProduct(productId);

  const products = await listApprovedStorefrontProducts();
  return products.find((product) => product.id === productId);
}

export async function getLaunchStorefrontProduct(productId: string): Promise<StorefrontProduct | undefined> {
  return getApprovedStorefrontProduct(productId);
}

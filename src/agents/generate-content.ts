export type ProductForGeneration = {
  productId: string;
  title: string;
  brand?: string | null;
  originCountry?: string | null;
  category?: string | null;
  specs?: Record<string, string>;
};

export type GeneratedContent = {
  shortTitle: string;
  shortDescription: string;
  longDescription: string;
  seoKeywords: string[];
  faqDraft: string[];
  disclaimer: string;
  riskFlags: string[];
};

function buildKeywords(product: ProductForGeneration): string[] {
  return [product.title, product.category || '健康商品', product.originCountry || '进口', '跨境健康平台', '营养补充'];
}

function detectRiskFlags(texts: string[]): string[] {
  const joined = texts.join(' ').toLowerCase();
  const riskWords = ['治疗', '治愈', '根治', '神药', '抗衰老'];
  return riskWords.filter((word) => joined.includes(word));
}

export async function runGenerateContentAgent(product: ProductForGeneration): Promise<GeneratedContent> {
  const shortTitle = `${product.title}｜荣旺跨境健康平台`;
  const shortDescription = `来自${product.originCountry || '海外'}的健康商品信息展示，适合用于第一阶段产品页面与运营草稿。`;
  const longDescription = [
    `这是围绕 ${product.title} 生成的商品内容草稿。`,
    '当前版本主要用于产品展示、内容审核与上架准备。',
    '所有涉及功效、适用人群、使用方式的细节，必须结合正式说明书与人工审核。',
  ].join('');
  const faqDraft = ['这个商品是什么类型的健康商品？', '是否有中文说明或成分信息？', '购买前需要注意哪些事项？'];
  const disclaimer = '本品不能替代药物。本商品符合原产国标准，可能与中国相关标准存在差异，请消费者知悉后谨慎选购。';
  const seoKeywords = buildKeywords(product);
  const riskFlags = detectRiskFlags([shortTitle, shortDescription, longDescription, ...faqDraft]);

  return { shortTitle, shortDescription, longDescription, seoKeywords, faqDraft, disclaimer, riskFlags };
}

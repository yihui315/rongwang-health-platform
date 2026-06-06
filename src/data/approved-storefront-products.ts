import type { StoredComplianceReview, StoredContent, StoredProduct } from '@/src/lib/mock-store';

const createdAt = '2026-06-05T02:30:00.000Z';
const healthDisclaimer = '本品不能替代药物。';
const crossBorderDisclaimer = '本商品符合原产国标准，可能与中国相关标准存在差异，请消费者知悉后谨慎选购。';
const approvedDisclaimer = `${healthDisclaimer}${crossBorderDisclaimer}`;
const brand = "UNCLE DARREN'S";
const originCountry = '美国';

type ApprovedStorefrontInput = {
  id: string;
  title: string;
  category: string;
  priceText: string;
  spec: string;
  version: string;
  image: string;
  shortDescription: string;
  keywords: string[];
};

const approvedInputs: ApprovedStorefrontInput[] = [
  {
    id: 'prod_uncle_darrens_heart_men',
    title: "UNCLE DARREN'S Heart Defender 男士心血管营养包",
    category: '心血管营养',
    priceText: '参考价：529元/盒',
    spec: '28袋/盒',
    version: '男士版',
    image: '/images/products/one-bottle/heart-men.jpg',
    shortDescription: '面向男士日常心血管营养关注场景的商品展示，购买与使用前需结合产品说明并由顾问复核。',
    keywords: ['男士营养', '心血管营养', '跨境健康商品'],
  },
  {
    id: 'prod_uncle_darrens_heart_women',
    title: "UNCLE DARREN'S Heart Defender 女士心血管营养包",
    category: '心血管营养',
    priceText: '参考价：529元/盒',
    spec: '28袋/盒',
    version: '女士版',
    image: '/images/products/one-bottle/heart-women.jpg',
    shortDescription: '面向女士日常心血管营养关注场景的商品展示，具体选择需结合个人情况和人工审核建议。',
    keywords: ['女士营养', '心血管营养', '跨境健康商品'],
  },
  {
    id: 'prod_uncle_darrens_brain_child',
    title: "UNCLE DARREN'S BrainBoost Essence 儿童脑部营养胶囊",
    category: '儿童脑部营养',
    priceText: '参考价：439元/瓶',
    spec: '60粒/瓶',
    version: '儿童版',
    image: '/images/products/one-bottle/brain-child.jpg',
    shortDescription: '面向儿童脑部营养关注场景的商品展示，儿童使用前必须由监护人核对标签并咨询专业人士。',
    keywords: ['儿童营养', '脑部营养', '跨境健康商品'],
  },
  {
    id: 'prod_uncle_darrens_brain_women',
    title: "UNCLE DARREN'S Brain Boost Max 女士脑部营养包",
    category: '脑部营养',
    priceText: '参考价：526元/盒',
    spec: '28袋/盒',
    version: '女士版',
    image: '/images/products/one-bottle/brain-women.jpg',
    shortDescription: '面向女士日常脑部营养关注场景的商品展示，不构成个体健康建议或效果承诺。',
    keywords: ['女士营养', '脑部营养', '跨境健康商品'],
  },
  {
    id: 'prod_uncle_darrens_brain_men',
    title: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包",
    category: '脑部营养',
    priceText: '参考价：526元/盒',
    spec: '28袋/盒',
    version: '男士版',
    image: '/images/products/one-bottle/brain-men.jpg',
    shortDescription: '面向男士日常脑部营养关注场景的商品展示，具体使用方式以审核后的中文说明为准。',
    keywords: ['男士营养', '脑部营养', '跨境健康商品'],
  },
  {
    id: 'prod_uncle_darrens_joint_women',
    title: "UNCLE DARREN'S Joint Guardian Plus 女士骨骼关节营养包",
    category: '骨骼关节营养',
    priceText: '参考价：399元/盒',
    spec: '28袋/盒',
    version: '女士版',
    image: '/images/products/one-bottle/joint-women.jpg',
    shortDescription: '面向女士骨骼与关节营养关注场景的商品展示，不能替代专业健康评估。',
    keywords: ['女士营养', '骨骼关节营养', '跨境健康商品'],
  },
  {
    id: 'prod_uncle_darrens_joint_men',
    title: "UNCLE DARREN'S Joint Guardian Plus 男士骨骼关节营养包",
    category: '骨骼关节营养',
    priceText: '参考价：399元/盒',
    spec: '28袋/盒',
    version: '男士版',
    image: '/images/products/one-bottle/joint-men.jpg',
    shortDescription: '面向男士骨骼与关节营养关注场景的商品展示，购买前需确认规格、版本和适用边界。',
    keywords: ['男士营养', '骨骼关节营养', '跨境健康商品'],
  },
  {
    id: 'prod_uncle_darrens_bone_child',
    title: "UNCLE DARREN'S Growth-X 儿童骨骼营养胶囊",
    category: '儿童骨骼营养',
    priceText: '参考价：439元/瓶',
    spec: '60粒/瓶',
    version: '儿童版',
    image: '/images/products/one-bottle/bone-child.jpg',
    shortDescription: '面向儿童骨骼营养关注场景的商品展示，儿童使用前必须由监护人和专业人士共同确认。',
    keywords: ['儿童营养', '骨骼营养', '跨境健康商品'],
  },
  {
    id: 'prod_uncle_darrens_gut_men',
    title: "UNCLE DARREN'S Digestive Elite Care 男士肠道营养包",
    category: '肠道营养',
    priceText: '参考价：399元/盒',
    spec: '28袋/盒',
    version: '男士版',
    image: '/images/products/one-bottle/gut-men.jpg',
    shortDescription: '面向男士日常肠道营养关注场景的商品展示，不能替代专业健康建议。',
    keywords: ['男士营养', '肠道营养', '跨境健康商品'],
  },
  {
    id: 'prod_uncle_darrens_gut_women',
    title: "UNCLE DARREN'S Digestive Elite Care 女士肠道营养包",
    category: '肠道营养',
    priceText: '参考价：399元/盒',
    spec: '28袋/盒',
    version: '女士版',
    image: '/images/products/one-bottle/gut-women.jpg',
    shortDescription: '面向女士日常肠道营养关注场景的商品展示，具体选择需结合标签信息和顾问复核。',
    keywords: ['女士营养', '肠道营养', '跨境健康商品'],
  },
  {
    id: 'prod_uncle_darrens_unc45',
    title: "UNCLE DARREN'S UNC-45 心脏营养胶囊",
    category: '心脏营养',
    priceText: '参考价：526元/瓶',
    spec: '60粒/瓶',
    version: '基础版',
    image: '/images/products/one-bottle/unc45.jpg',
    shortDescription: '面向心脏营养关注场景的商品展示，相关内容仅用于商品信息说明和人工咨询前复核。',
    keywords: ['心脏营养', '营养胶囊', '跨境健康商品'],
  },
  {
    id: 'prod_uncle_darrens_atp',
    title: "UNCLE DARREN'S ATP 细胞营养胶囊",
    category: '细胞营养',
    priceText: '参考价：1480元/瓶',
    spec: '60粒/瓶',
    version: '基础版',
    image: '/images/products/one-bottle/atp.jpg',
    shortDescription: '面向细胞营养关注场景的商品展示，所有使用建议必须以审核后的说明和专业意见为准。',
    keywords: ['细胞营养', '营养胶囊', '跨境健康商品'],
  },
];

function createProduct(input: ApprovedStorefrontInput): StoredProduct {
  return {
    id: input.id,
    source: 'unknown',
    sourceUrl: input.image,
    externalId: `approved-one-bottle:${input.id}`,
    title: input.title,
    subtitle: '已审核商城展示商品',
    brand,
    originCountry,
    category: input.category,
    priceText: input.priceText,
    specs: {
      规格: input.spec,
      产地: originCountry,
      品牌: brand,
      版本: input.version,
      参考价: input.priceText,
      购买方式: '联系顾问人工确认',
      合规状态: '已审核展示',
    },
    rawPayload: {
      source: 'unknown',
      sourceUrl: input.image,
      title: input.title,
      price: input.priceText,
      images: [input.image],
      specs: {
        规格: input.spec,
        产地: originCountry,
        品牌: brand,
        版本: input.version,
        参考价: input.priceText,
        购买方式: '联系顾问人工确认',
      },
      sourceFile: input.image,
      importedBatch: 'one-bottle-storefront-2026-06-05',
      importedAt: createdAt,
      importNotes: {
        status: 'approved_storefront_display',
        storefrontVisibility: 'approved_manual_display_only',
        disclaimersRequired: [healthDisclaimer, crossBorderDisclaimer],
        complianceNote: '前台仅展示合规改写后的商品信息，不启用站内支付或自动发布渠道。',
      },
    },
    status: 'approved',
    createdAt,
    updatedAt: createdAt,
  };
}

function createContent(input: ApprovedStorefrontInput): StoredContent {
  return {
    id: `content_${input.id.replace(/^prod_/, '')}`,
    productId: input.id,
    shortTitle: input.title,
    shortDescription: input.shortDescription,
    longDescription:
      '本页展示商品名称、品牌、规格、原产地、版本和参考价等基础信息。购买方式、库存、物流和售后由顾问人工确认；涉及适用人群和使用方式的内容，以审核后的中文说明为准。',
    seoKeywords: input.keywords,
    faqDraft: [
      '购买前需要确认哪些信息？',
      '是否可以直接在线支付？',
      '商品说明和跨境提示在哪里查看？',
    ],
    disclaimer: approvedDisclaimer,
    riskFlags: [],
    status: 'approved',
    createdAt,
    updatedAt: createdAt,
  };
}

function createReview(input: ApprovedStorefrontInput): StoredComplianceReview {
  return {
    id: `review_${input.id.replace(/^prod_/, '')}`,
    productId: input.id,
    contentId: `content_${input.id.replace(/^prod_/, '')}`,
    reviewStatus: 'approved',
    riskLevel: 'low',
    riskFlags: [],
    reviewNotes: 'Approved for storefront display with conservative copy and required disclaimers. Payment and channel publishing remain manual.',
    reviewer: 'manual-storefront-seed',
    reviewedAt: createdAt,
    createdAt,
    updatedAt: createdAt,
  };
}

export const approvedStorefrontProducts: StoredProduct[] = approvedInputs.map(createProduct);
export const approvedStorefrontContents: StoredContent[] = approvedInputs.map(createContent);
export const approvedStorefrontReviews: StoredComplianceReview[] = approvedInputs.map(createReview);

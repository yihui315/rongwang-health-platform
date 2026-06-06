import type { Product } from "./products";

const brand = "UNCLE DARREN'S";
const matrix = "UNCLE DARREN'S 已审核展示";
const origin = "美国";
const shippingNote = "参考价与购买方式需联系顾问人工确认；库存、物流、售后以人工确认为准。";
const scientificBasis =
  "本页仅展示品牌、规格、版本与参考价等基础信息，不构成医疗建议或效果承诺；适用边界以审核后的中文说明和产品标签为准。";
const howToUse =
  "购买与使用前，请先核对产品标签、过敏信息和个人健康情况，并咨询专业人士或荣旺健康顾问。";
const warnings = [
  "本品不能替代药物。",
  "本商品符合原产国标准，可能与中国相关标准存在差异，请消费者知悉后谨慎选购。",
  "儿童、孕妇、哺乳期人群及正在用药者请先咨询专业人士。",
];
const certifications = ["人工审核展示", "跨境商品信息", "顾问确认购买"];

type ApprovedStorefrontSeed = {
  sku: string;
  slug: string;
  name: string;
  englishName: string;
  category: Product["category"];
  plans: Product["plans"];
  price: number;
  unit: string;
  servings: number;
  tagline: string;
  image: string;
  ingredientName: string;
  hero: string[];
};

function toApprovedProduct(seed: ApprovedStorefrontSeed): Product {
  return {
    sku: seed.sku,
    slug: seed.slug,
    name: seed.name,
    englishName: seed.englishName,
    brand,
    category: seed.category,
    plans: seed.plans,
    price: seed.price,
    memberPrice: seed.price,
    unit: seed.unit,
    servings: seed.servings,
    origin,
    tagline: seed.tagline,
    tier: "traffic",
    matrix,
    badge: "新品",
    images: [seed.image],
    hero: seed.hero,
    keyIngredients: [
      {
        name: seed.ingredientName,
        dose: "以产品标签为准",
        benefit: "用于日常营养支持信息展示，购买前需结合个人情况人工确认。",
      },
    ],
    scientificBasis,
    howToUse,
    warnings,
    certifications,
    stock: "in",
    shippingNote,
  };
}

const approvedStorefrontProductSeeds: ApprovedStorefrontSeed[] = [
  {
    sku: "UD-HD-MEN-001",
    slug: "uncle-darrens-heart-defender-men",
    name: "UNCLE DARREN'S Heart Defender 男士心血管营养包",
    englishName: "UNCLE DARREN'S Heart Defender for Men",
    category: "omega",
    plans: ["cardio"],
    price: 529,
    unit: "28袋/盒",
    servings: 28,
    tagline: "男士日常心血管营养关注场景的已审核展示商品",
    image: "/images/products/one-bottle/heart-men.jpg",
    ingredientName: "男士心血管营养组合",
    hero: [
      "面向男士日常心血管营养关注场景的信息展示",
      "购买方式、库存、物流和售后由顾问人工确认",
      "使用前请结合产品标签、个人情况和专业意见",
    ],
  },
  {
    sku: "UD-HD-WOMEN-001",
    slug: "uncle-darrens-heart-defender-women",
    name: "UNCLE DARREN'S Heart Defender 女士心血管营养包",
    englishName: "UNCLE DARREN'S Heart Defender for Women",
    category: "omega",
    plans: ["cardio", "beauty"],
    price: 529,
    unit: "28袋/盒",
    servings: 28,
    tagline: "女士日常心血管营养关注场景的已审核展示商品",
    image: "/images/products/one-bottle/heart-women.jpg",
    ingredientName: "女士心血管营养组合",
    hero: [
      "面向女士日常心血管营养关注场景的信息展示",
      "建议先完成健康方向评估，再确认是否适合",
      "购买前需由顾问复核规格、版本与使用边界",
    ],
  },
  {
    sku: "UD-BB-CHILD-001",
    slug: "uncle-darrens-brainboost-essence-child",
    name: "UNCLE DARREN'S BrainBoost Essence 儿童脑部营养胶囊",
    englishName: "UNCLE DARREN'S BrainBoost Essence for Children",
    category: "amino",
    plans: ["fatigue"],
    price: 439,
    unit: "60粒/瓶",
    servings: 60,
    tagline: "儿童脑部营养关注场景的已审核展示商品",
    image: "/images/products/one-bottle/brain-child.jpg",
    ingredientName: "儿童脑部营养组合",
    hero: [
      "面向儿童脑部营养关注场景的信息展示",
      "儿童使用前必须由监护人核对标签并咨询专业人士",
      "本页不提供个体化使用建议或效果承诺",
    ],
  },
  {
    sku: "UD-BB-WOMEN-001",
    slug: "uncle-darrens-brain-boost-max-women",
    name: "UNCLE DARREN'S Brain Boost Max 女士脑部营养包",
    englishName: "UNCLE DARREN'S Brain Boost Max for Women",
    category: "adaptogen",
    plans: ["stress", "fatigue", "beauty"],
    price: 526,
    unit: "28袋/盒",
    servings: 28,
    tagline: "女士脑部营养关注场景的已审核展示商品",
    image: "/images/products/one-bottle/brain-women.jpg",
    ingredientName: "女士脑部营养组合",
    hero: [
      "面向女士日常脑部营养关注场景的信息展示",
      "适合在健康评估后作为营养支持方向参考",
      "购买前需确认标签信息、规格和个人适配边界",
    ],
  },
  {
    sku: "UD-BB-MEN-001",
    slug: "uncle-darrens-brain-boost-max-men",
    name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包",
    englishName: "UNCLE DARREN'S Brain Boost Max for Men",
    category: "adaptogen",
    plans: ["stress", "fatigue"],
    price: 526,
    unit: "28袋/盒",
    servings: 28,
    tagline: "男士脑部营养关注场景的已审核展示商品",
    image: "/images/products/one-bottle/brain-men.jpg",
    ingredientName: "男士脑部营养组合",
    hero: [
      "面向男士日常脑部营养关注场景的信息展示",
      "建议先完成 AI 评估，再与顾问确认产品方向",
      "所有使用方式以审核后的中文说明和标签为准",
    ],
  },
  {
    sku: "UD-JG-WOMEN-001",
    slug: "uncle-darrens-joint-guardian-plus-women",
    name: "UNCLE DARREN'S Joint Guardian Plus 女士骨骼关节营养包",
    englishName: "UNCLE DARREN'S Joint Guardian Plus for Women",
    category: "mineral",
    plans: ["fatigue", "beauty"],
    price: 399,
    unit: "28袋/盒",
    servings: 28,
    tagline: "女士骨骼关节营养关注场景的已审核展示商品",
    image: "/images/products/one-bottle/joint-women.jpg",
    ingredientName: "女士骨骼关节营养组合",
    hero: [
      "面向女士骨骼与关节营养关注场景的信息展示",
      "不替代专业健康评估或医学建议",
      "购买前需确认规格、版本和适用边界",
    ],
  },
  {
    sku: "UD-JG-MEN-001",
    slug: "uncle-darrens-joint-guardian-plus-men",
    name: "UNCLE DARREN'S Joint Guardian Plus 男士骨骼关节营养包",
    englishName: "UNCLE DARREN'S Joint Guardian Plus for Men",
    category: "mineral",
    plans: ["fatigue", "cardio"],
    price: 399,
    unit: "28袋/盒",
    servings: 28,
    tagline: "男士骨骼关节营养关注场景的已审核展示商品",
    image: "/images/products/one-bottle/joint-men.jpg",
    ingredientName: "男士骨骼关节营养组合",
    hero: [
      "面向男士骨骼与关节营养关注场景的信息展示",
      "适合作为顾问复核前的商品资料参考",
      "购买前需结合标签信息和个人健康情况确认",
    ],
  },
  {
    sku: "UD-BONE-CHILD-001",
    slug: "uncle-darrens-bone-nutrition-child",
    name: "UNCLE DARREN'S 儿童骨骼营养胶囊",
    englishName: "UNCLE DARREN'S Bone Nutrition for Children",
    category: "mineral",
    plans: ["fatigue"],
    price: 439,
    unit: "60粒/瓶",
    servings: 60,
    tagline: "儿童骨骼营养关注场景的已审核展示商品",
    image: "/images/products/one-bottle/bone-child.jpg",
    ingredientName: "儿童骨骼营养组合",
    hero: [
      "面向儿童骨骼营养关注场景的信息展示",
      "儿童使用前必须由监护人和专业人士共同确认",
      "本页不提供身高、发育或个体效果承诺",
    ],
  },
  {
    sku: "UD-DE-MEN-001",
    slug: "uncle-darrens-digestive-elite-care-men",
    name: "UNCLE DARREN'S Digestive Elite Care 男士肠道营养包",
    englishName: "UNCLE DARREN'S Digestive Elite Care for Men",
    category: "probiotic",
    plans: ["immune", "fatigue"],
    price: 399,
    unit: "28袋/盒",
    servings: 28,
    tagline: "男士肠道营养关注场景的已审核展示商品",
    image: "/images/products/one-bottle/gut-men.jpg",
    ingredientName: "男士肠道营养组合",
    hero: [
      "面向男士日常肠道营养关注场景的信息展示",
      "不能替代专业健康建议或治疗方案",
      "购买前需由顾问确认规格、库存和物流方式",
    ],
  },
  {
    sku: "UD-DE-WOMEN-001",
    slug: "uncle-darrens-digestive-elite-care-women",
    name: "UNCLE DARREN'S Digestive Elite Care 女士肠道营养包",
    englishName: "UNCLE DARREN'S Digestive Elite Care for Women",
    category: "probiotic",
    plans: ["immune", "beauty"],
    price: 399,
    unit: "28袋/盒",
    servings: 28,
    tagline: "女士肠道营养关注场景的已审核展示商品",
    image: "/images/products/one-bottle/gut-women.jpg",
    ingredientName: "女士肠道营养组合",
    hero: [
      "面向女士日常肠道营养关注场景的信息展示",
      "建议先完成健康方向评估，再确认商品适配性",
      "购买与售后流程由顾问人工确认后继续",
    ],
  },
  {
    sku: "UD-UNC45-001",
    slug: "uncle-darrens-unc45-heart-nutrition",
    name: "UNCLE DARREN'S UNC-45 心脏营养胶囊",
    englishName: "UNCLE DARREN'S UNC-45 Heart Nutrition",
    category: "omega",
    plans: ["cardio"],
    price: 526,
    unit: "60粒/瓶",
    servings: 60,
    tagline: "心脏营养关注场景的已审核展示商品",
    image: "/images/products/one-bottle/unc45.jpg",
    ingredientName: "心脏营养组合",
    hero: [
      "面向心脏营养关注场景的信息展示",
      "相关内容仅用于商品资料说明和顾问复核",
      "不构成疾病预防、诊断、治疗或效果承诺",
    ],
  },
  {
    sku: "UD-ATP-001",
    slug: "uncle-darrens-atp-cell-nutrition",
    name: "UNCLE DARREN'S ATP 细胞营养胶囊",
    englishName: "UNCLE DARREN'S ATP Cell Nutrition",
    category: "amino",
    plans: ["fatigue"],
    price: 1480,
    unit: "60粒/瓶",
    servings: 60,
    tagline: "细胞营养关注场景的已审核展示商品",
    image: "/images/products/one-bottle/atp.jpg",
    ingredientName: "细胞营养组合",
    hero: [
      "面向细胞营养关注场景的信息展示",
      "所有使用建议必须以审核后的说明和专业意见为准",
      "购买方式、库存、物流和售后由顾问人工确认",
    ],
  },
];

export const approvedStorefrontProducts: Product[] = approvedStorefrontProductSeeds.map(toApprovedProduct);

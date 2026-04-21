/**
 * 荣旺健康 · SKU 产品数据库
 *
 * 三大核心爆款矩阵 (MISORILIFE + 彭寿堂) + 通用 OTC 引流产品
 * 品牌矩阵：
 *   - MISORILIFE (MSR): 现代生物科技，专利配方
 *   - 彭寿堂: 百年传承，道地药材
 *   - 荣旺 · Vital / Night / Shield / Calm: 自有通用品牌
 *
 * 免责：本内容仅为产品信息展示，不构成医疗建议。
 */

import type { PlanSlug } from '@/types';

export type ProductCategory =
  | 'vitamin'
  | 'mineral'
  | 'herbal'
  | 'probiotic'
  | 'omega'
  | 'amino'
  | 'sleep'
  | 'adaptogen'
  | 'liver'
  | 'beauty'
  | 'traditional';

export type ProductTier = 'hero' | 'profit' | 'traffic';

export interface Product {
  sku: string;
  slug: string;
  name: string;
  englishName: string;
  brand: string;
  brandLogo?: string;
  category: ProductCategory;
  plans: PlanSlug[];
  price: number;
  memberPrice: number;
  costPrice?: number;      // 供货价（内部参考）
  unit: string;
  servings: number;
  origin: string;
  tagline: string;
  tier: ProductTier;       // hero=引流爆款, profit=高利润主推, traffic=客单提升
  matrix?: string;         // 所属矩阵名称
  hero: string[];
  keyIngredients: Array<{
    name: string;
    dose: string;
    benefit: string;
  }>;
  scientificBasis: string;
  howToUse: string;
  warnings: string[];
  certifications: string[];
  stock: 'in' | 'low' | 'out';
  badge?: string;          // 角标：'爆款' | '限时' | '新品' | '送礼'
  shippingNote?: string;   // 物流说明
  images?: string[];       // 产品图片路径列表
  officialUrl?: string;    // 品牌官网链接
}

export const products: Product[] = [
  /* ═══════════════════════════════════════════════════════════════
   * 矩阵一：商务精英"应酬与熬夜"护肝组合
   * 目标人群：商务男士、频繁应酬、加班熬夜
   * 策略：释酒片引流 → 灵芝孢子油 / 牛樟芝 高利润转化
   * ═══════════════════════════════════════════════════════════════ */
  {
    sku: 'MSR-LV-001',
    slug: 'msr-nadh-tipsynox',
    name: 'NADH 释酒片',
    englishName: 'NADH Anti-Hangover Tablets - Alcohol Metabolism Precision Care',
    brand: 'MISORILIFE',
    category: 'liver',
    plans: ['liver'],
    price: 588,
    memberPrice: 499,
    unit: '30 片/盒 · 300mg/片',
    servings: 30,
    origin: '香港',
    tagline: '解酒护肝 · 抗衰焕活 · 酒精代谢精准营养护理',
    tier: 'hero',
    matrix: '商务精英护肝',
    badge: '爆款',
    images: [
      '/images/products/msr-nadh/main.jpg',
      '/images/products/msr-nadh/detail-1.jpg',
      '/images/products/msr-nadh/detail-2.jpg',
      '/images/products/msr-nadh/detail-3.jpg',
    ],
    officialUrl: 'https://www.misorilife.hk/zh-hans/products/nadh-%E9%87%8A%E9%85%92%E7%89%87-%E6%AD%A3%E8%A3%85',
    hero: [
      '每片含 NADH 30mg（纯度≥98%），三重机制：酶激活+乙醛清除+细胞修复',
      '血乙醇清除率↑40%，宿醉头痛↓68%，醉酒失态率↓92.3%',
      '肝损标志物 MDA↓53%，护肝养胃双重防线',
      '非饮酒日也可服用：代谢抗衰 · 免疫提升 · 提神醒脑',
    ],
    keyIngredients: [
      { name: 'NADH (还原型烟酰胺腺嘌呤二核苷酸)', dose: '30mg/片（纯度≥98%）', benefit: '激活解酒酶系 · 加速乙醛代谢' },
      { name: '抗坏血酸钠', dose: '辅助配比', benefit: '抗氧化协同 · 保护肝细胞' },
      { name: '甘露醇', dose: '辅助配比', benefit: '渗透解毒 · 促进代谢' },
    ],
    scientificBasis:
      'NADH 是人体内关键的还原型辅酶，直接参与酒精代谢的 ADH/ALDH 酶系。临床数据显示可提升血乙醇清除率40%，降低肝损标志物MDA达53%。三重机制：酶激活加速代谢、乙醛清除减轻毒性、细胞修复保护肝脏。不含转基因成分、酒精、激素或防腐剂。',
    howToUse: '社交防醉：酒前15分钟吞服2片+酒后补服2片。代谢抗衰：非饮酒日每日1片，晨起空腹温水送服。免疫提升：每日1片，30天为一周期。',
    warnings: ['肝硬化、急性肝炎患者不宜', '对成分过敏者禁用', '孕妇及18岁以下不宜'],
    certifications: ['GMP', 'ISO22000', 'SGS重金属及微生物检测'],
    stock: 'in',
    shippingNote: '香港直邮 · 7-15个工作日',
  },
  {
    sku: 'PST-LV-001',
    slug: 'pst-lingzhi-spore-oil',
    name: '彭寿堂 灵芝孢子油软胶囊',
    englishName: 'Peng Shou Tang Reishi Spore Oil Capsules',
    brand: '彭寿堂',
    category: 'traditional',
    plans: ['liver', 'immune'],
    price: 398,
    memberPrice: 358,
    costPrice: 90,
    unit: '60 粒/瓶',
    servings: 30,
    origin: '中国',
    tagline: '灵芝精华 · 护肝安神 · 增强免疫',
    tier: 'profit',
    matrix: '商务精英护肝',
    hero: [
      '百年彭寿堂道地灵芝，超临界 CO2 萃取孢子油',
      '增强免疫力，保护肝脏，改善睡眠质量',
      '适合关注血糖、血脂/胆固醇的人士服用',
      '送礼体面 · 传统滋补的高端代表',
    ],
    keyIngredients: [
      { name: '灵芝孢子油', dose: '500mg', benefit: '三萜类化合物 · 护肝抗炎' },
      { name: '灵芝三萜', dose: '≥25%', benefit: '灵芝核心活性成分 · 免疫调节' },
      { name: '灵芝多糖', dose: '丰富', benefit: '激活免疫细胞活性' },
    ],
    scientificBasis:
      '灵芝(Ganoderma lucidum)中的三萜类化合物在体外和动物实验中展示了保肝、抗炎和免疫调节活性。临床观察显示灵芝孢子油可能有助于改善慢性肝损伤标志物。',
    howToUse: '每日2次，每次2粒，餐后温水服用。',
    warnings: ['孕妇、哺乳期妇女慎用', '手术前2周停用', '服用免疫抑制剂者请咨询医生'],
    certifications: ['国食健字', 'GMP', '彭寿堂百年品牌'],
    stock: 'in',
    shippingNote: '保税仓直发 / 香港直邮',
    images: [
      '/images/products/pst-lingzhi/main.jpg',
      '/images/products/pst-lingzhi/detail-1.jpg',
      '/images/products/pst-lingzhi/detail-2.jpg',
    ],
  },
  {
    sku: 'PST-LV-002',
    slug: 'pst-antrodia-capsule',
    name: '彭寿堂 牛樟芝胶囊',
    englishName: 'Peng Shou Tang Antrodia Cinnamomea Capsules',
    brand: '彭寿堂',
    category: 'traditional',
    plans: ['liver', 'immune'],
    price: 980,
    memberPrice: 880,
    costPrice: 220,
    unit: '60 粒/瓶',
    servings: 30,
    origin: '台湾',
    tagline: '台湾森林红宝石 · 清肝解毒 · 免疫双赋能',
    tier: 'profit',
    matrix: '商务精英护肝',
    hero: [
      '天然植萃配比，免疫与保肝双重赋能',
      '清肝解毒，有效减轻身体代谢负担',
      '台湾特有牛樟树上生长，极为珍稀',
      '利润空间极大，零售价980元/瓶',
    ],
    keyIngredients: [
      { name: '牛樟芝子实体提取物', dose: '600mg', benefit: '三萜类 · 保肝护肝核心' },
      { name: '安卓乔醇', dose: '≥2%', benefit: '牛樟芝标志性活性物质' },
      { name: '多醣体', dose: '≥10%', benefit: '免疫调节 · 抗氧化' },
    ],
    scientificBasis:
      '牛樟芝(Antrodia cinnamomea)是台湾特有珍贵药用真菌。其富含的三萜类化合物在研究中显示出肝脏保护、抗氧化和免疫调节的多种生物活性。',
    howToUse: '每日2次，每次2粒，空腹或餐前服用效果更佳。',
    warnings: ['孕妇禁用', '自身免疫性疾病患者慎用'],
    certifications: ['台湾GMP', '彭寿堂百年品牌', 'SGS检验'],
    stock: 'in',
    shippingNote: '香港跨境直邮 · 7-15个工作日',
    images: [
      '/images/products/pst-antrodia/main.jpg',
      '/images/products/pst-antrodia/detail-1.jpg',
      '/images/products/pst-antrodia/detail-2.jpg',
    ],
  },

  /* ═══════════════════════════════════════════════════════════════
   * 矩阵二：都市女性"内调抗衰与身材管理"组合
   * 目标人群：25-45岁都市女性
   * 策略：AKK减肥话题引流 → 东阿贡胶/NAD+ 高利润转化
   * ═══════════════════════════════════════════════════════════════ */
  {
    sku: 'MSR-BT-001',
    slug: 'msr-akk-probiotic',
    name: 'AKK 高阶版益生菌',
    englishName: 'AKK Advanced Probiotic - Intestinal-Metabolic Nutrition Care',
    brand: 'MISORILIFE',
    category: 'probiotic',
    plans: ['beauty'],
    price: 899,
    memberPrice: 799,
    unit: '60 粒/瓶 · 500mg/粒',
    servings: 30,
    origin: '香港',
    tagline: '肠护平衡 · 代谢焕活 · 肠代谢精准营养护理',
    tier: 'hero',
    matrix: '都市女性抗衰',
    badge: '爆款',
    images: [
      '/images/products/msr-akk/main.jpg',
      '/images/products/msr-akk/detail-1.jpg',
      '/images/products/msr-akk/detail-2.jpg',
      '/images/products/msr-akk/detail-3.jpg',
    ],
    officialUrl: 'https://www.misorilife.hk/zh-hans/products/akk%E9%AB%98%E9%98%B6%E7%89%88%E7%9B%8A%E7%94%9F%E8%8F%8C',
    hero: [
      '专利菌株 AH39，每粒含 300亿 CFU 三联活菌',
      '代谢升级 · 燃脂塑形 · 肠屏障修复 · 抗炎稳糖',
      '通过 GLP-1 分泌机制激活代谢，不用饿肚子',
      '三阶渐进：激活期→进阶期→稳定期，科学管理',
    ],
    keyIngredients: [
      { name: 'Akkermansia muciniphila AH39', dose: '150亿 CFU', benefit: '激活GLP-1分泌 · 肠屏障修复' },
      { name: 'Lactobacillus plantarum HP59', dose: '100亿 CFU', benefit: '增强紧密连接蛋白 · 屏障强化' },
      { name: 'Lactobacillus rhamnosus CCFM0528', dose: '50亿 CFU', benefit: '调节GABA受体 · 平衡肠脑轴' },
      { name: 'EGCG (绿茶提取物)', dose: '配比含量', benefit: '抗氧化力提升3倍 · 辅助脂代谢' },
    ],
    scientificBasis:
      'AH39 专利菌株以后生元形态存在，耐酸性增强，确保足量菌株到达肠道定植。研究发表于 Food Science and Human Wellness (2023) 及 Gut Microbes (2021)。三联菌株协同作用全面覆盖代谢失衡、肠屏障渗漏和压力性进食三大核心问题。',
    howToUse: '日常：每日1次，每次1-2粒，温水（40°C以下）空腹或餐后送服。进阶：每日1次2粒。与抗生素间隔2小时以上。',
    warnings: ['18岁以下、孕妇/哺乳期不宜使用', '对成分过敏者禁用', '服用特定药物者需医生指导'],
    certifications: ['GMP', 'ISO22000', 'SGS检测', '专利菌株AH39'],
    stock: 'in',
    shippingNote: '香港直邮 · 7-15个工作日',
  },
  {
    sku: 'PST-BT-001',
    slug: 'pst-dong-e-gong-jiao',
    name: '彭寿堂 东阿贡胶',
    englishName: 'Peng Shou Tang Dong-E Royal Gelatin',
    brand: '彭寿堂',
    category: 'traditional',
    plans: ['beauty'],
    price: 980,
    memberPrice: 880,
    costPrice: 220,
    unit: '250g/盒',
    servings: 30,
    origin: '山东东阿',
    tagline: '补血滋阴润燥 · 由内而外焕亮气色',
    tier: 'profit',
    matrix: '都市女性抗衰',
    badge: '送礼',
    hero: [
      '精选东阿正宗驴皮，传统古法熬制',
      '补血滋阴、润燥，从根源改善血虚问题',
      '让气色由内而外焕亮，传统滋补的高端代表',
      '礼盒装 · 自用馈赠两相宜',
    ],
    keyIngredients: [
      { name: '东阿阿胶', dose: '8g/次', benefit: '补血滋阴 · 改善血虚面色' },
      { name: '胶原蛋白水解物', dose: '丰富', benefit: '皮肤弹性 · 润泽' },
      { name: '氨基酸群', dose: '18种', benefit: '营养全面 · 滋养身体' },
    ],
    scientificBasis:
      '阿胶(Colla Corii Asini)在中医传统中有数千年的应用历史，被列为"滋补三宝"之一。现代研究提示其富含的胶原蛋白、氨基酸等成分可能有助于改善贫血指标和皮肤健康。',
    howToUse: '每日1次，每次3-5g，温水化服或搭配红枣、枸杞炖煮。',
    warnings: ['感冒期间暂停服用', '脾胃虚弱者少量开始', '孕妇请咨询中医师'],
    certifications: ['国食健字', 'GMP', '彭寿堂百年品牌', '东阿原产地认证'],
    stock: 'in',
    shippingNote: '保税仓直发 / 香港直邮',
    images: [
      '/images/products/pst-donge/main.jpg',
      '/images/products/pst-donge/detail-1.jpg',
      '/images/products/pst-donge/detail-2.jpg',
    ],
  },
  {
    sku: 'MSR-BT-002',
    slug: 'msr-whina-d-whitening',
    name: 'Whina D 焕白片',
    englishName: 'Whina D Brightening Tablets - Precision Skin Nutrition Care',
    brand: 'MISORILIFE',
    category: 'beauty',
    plans: ['beauty'],
    price: 468,
    memberPrice: 399,
    unit: '60 片/瓶 · 800mg/片',
    servings: 30,
    origin: '香港',
    tagline: '皙光净颜 · 抗糖焕白 · 肌肤精准营养护理',
    tier: 'traffic',
    matrix: '都市女性抗衰',
    badge: '新品',
    images: [
      '/images/products/msr-whina/main.jpg',
      '/images/products/msr-whina/detail-1.jpg',
      '/images/products/msr-whina/detail-2.jpg',
      '/images/products/msr-whina/detail-3.jpg',
    ],
    officialUrl: 'https://www.misorilife.hk/zh-hans/products/whina-d-%E7%84%95%E7%99%BD%E7%89%87',
    hero: [
      '八重美白成分协同：抑制黑色素 · 抗糖焕白 · 促胶原',
      '沙棘提取物+谷胱甘肽+白藜芦醇，医美级内调方案',
      '1个月提亮肤色，3个月淡斑焕白，6个月锁住光彩',
      '口服美容新趋势，由内而外的肌肤精准营养',
    ],
    keyIngredients: [
      { name: '沙棘提取物', dose: '120mg', benefit: '抗氧化 · 促进皮肤修复' },
      { name: '烟酸', dose: '88mg', benefit: '促进肌肤代谢 · 改善暗沉' },
      { name: '谷胱甘肽', dose: '48mg', benefit: '美白抗氧化 · 抑制黑色素' },
      { name: '白藜芦醇', dose: '48mg', benefit: '抗糖化 · 延缓肌肤衰老' },
      { name: '维生素 C', dose: '48mg', benefit: '促胶原合成 · 抗氧化' },
      { name: '姜黄素', dose: '48mg', benefit: '抗炎 · 均匀肤色' },
    ],
    scientificBasis:
      '八重活性成分精准覆盖美白六大通路：抑制黑色素生成、抗糖化焕白、促进胶原合成、淡化色斑、屏障修复、代谢激活。谷胱甘肽与维生素C的协同美白作用已在多项临床研究中得到验证。',
    howToUse: '日常：每日1次，每次1片，餐前空腹温水送服。进阶：每日1次2片。忌辛辣刺激食物。',
    warnings: ['18岁以下未成年人不宜', '孕妇、哺乳期不宜', '对沙棘/谷胱甘肽/烟酰胺等成分过敏者禁用'],
    certifications: ['GMP', 'ISO22000', 'SGS重金属及微生物检测'],
    stock: 'in',
    shippingNote: '香港直邮 · 7-15个工作日',
  },

  /* ═══════════════════════════════════════════════════════════════
   * 矩阵三：中老年"心脑血管与三高调理"组合
   * 目标人群：45+中老年、子女送礼
   * 策略：NMN话题引流 → 桑黄丸 / 石斛胶囊 高利润转化
   * ═══════════════════════════════════════════════════════════════ */
  {
    sku: 'PST-CD-001',
    slug: 'pst-sanghuang-pill',
    name: '彭寿堂 补益桑黄丸',
    englishName: 'Peng Shou Tang Sanghuang Herbal Pills',
    brand: '彭寿堂',
    category: 'traditional',
    plans: ['cardio', 'immune'],
    price: 998,
    memberPrice: 898,
    costPrice: 220,
    unit: '120 粒/瓶',
    servings: 30,
    origin: '中国',
    tagline: '气血双补 · 清热解毒 · 保肝降酸',
    tier: 'profit',
    matrix: '银发心脑调理',
    badge: '送礼',
    hero: [
      '气血双补，清热解毒、保肝护肝、降尿酸',
      '适合关注血糖、血脂/胆固醇的人士服用',
      '桑黄作为核心成分具有极高的健康壁垒',
      '高端馈赠首选 · 送长辈体面大方',
    ],
    keyIngredients: [
      { name: '桑黄提取物', dose: '500mg', benefit: '免疫调节 · 抗氧化 · 降尿酸' },
      { name: '黄芪', dose: '300mg', benefit: '补气固表 · 增强体质' },
      { name: '当归', dose: '200mg', benefit: '补血活血 · 调经止痛' },
      { name: '灵芝', dose: '150mg', benefit: '安神益气 · 保肝护肝' },
    ],
    scientificBasis:
      '桑黄(Sanghuangporus sanghuang)是珍稀药用真菌，其多糖和黄酮类成分在研究中显示了免疫调节、抗氧化和降血糖的生物活性。传统中医用于清热解毒、活血化瘀。',
    howToUse: '每日2次，每次4粒，饭后温水送服。',
    warnings: ['孕妇禁用', '服用降糖药者请在医生指导下使用', '手术前后2周停用'],
    certifications: ['国食健字', 'GMP', '彭寿堂百年品牌'],
    stock: 'in',
    shippingNote: '保税仓直发 / 香港直邮',
    images: [
      '/images/products/pst-sanghuang/main.jpg',
      '/images/products/pst-sanghuang/detail-1.jpg',
      '/images/products/pst-sanghuang/detail-2.jpg',
    ],
  },
  {
    sku: 'PST-CD-002',
    slug: 'pst-dendrobium-capsule',
    name: '彭寿堂 金钗石斛胶囊',
    englishName: 'Peng Shou Tang Dendrobium Nobile Capsules',
    brand: '彭寿堂',
    category: 'traditional',
    plans: ['cardio'],
    price: 498,
    memberPrice: 448,
    costPrice: 90,
    unit: '60 粒/瓶',
    servings: 30,
    origin: '贵州',
    tagline: '益智补脑 · 改善视力 · 精准适配三高管理',
    tier: 'profit',
    matrix: '银发心脑调理',
    hero: [
      '益智补脑、提高记忆力，改善视力',
      '精准适配血压、血糖管理需求',
      '金钗石斛为九大仙草之首，道地贵州产区',
      '中老年记忆力衰退和三高问题的天然良方',
    ],
    keyIngredients: [
      { name: '金钗石斛提取物', dose: '600mg', benefit: '滋阴养胃 · 益智明目' },
      { name: '石斛碱', dose: '≥0.4%', benefit: '神经保护 · 改善记忆' },
      { name: '石斛多糖', dose: '≥20%', benefit: '免疫调节 · 抗氧化' },
    ],
    scientificBasis:
      '金钗石斛(Dendrobium nobile)为中华九大仙草之首。现代药理研究发现石斛碱具有神经保护活性，石斛多糖在动物模型中显示了降血糖和免疫调节作用。',
    howToUse: '每日2次，每次2粒，餐后温水服用。',
    warnings: ['脾胃虚寒者慎用', '服用降压/降糖药者请咨询医生'],
    certifications: ['国食健字', 'GMP', '彭寿堂百年品牌', '道地产区认证'],
    stock: 'in',
    shippingNote: '保税仓直发 / 香港直邮',
    images: [
      '/images/products/pst-dendrobium/main.jpg',
      '/images/products/pst-dendrobium/detail-1.jpg',
      '/images/products/pst-dendrobium/detail-2.jpg',
    ],
  },
  {
    sku: 'MSR-CD-001',
    slug: 'msr-nmn-12000',
    name: 'MSR NMN 12000 经典系列',
    englishName: 'MSR NMN 12000mg Classic Series',
    brand: 'MISORILIFE',
    category: 'beauty',
    plans: ['cardio', 'beauty'],
    price: 798,
    memberPrice: 718,
    unit: '60 粒/瓶',
    servings: 30,
    origin: '香港',
    tagline: '延缓衰老 · 抗氧化 · 增强免疫力',
    tier: 'traffic',
    matrix: '银发心脑调理',
    badge: '新品',
    hero: [
      '每瓶含 NMN 12000mg，高含量经典配方',
      '延缓衰老、抗氧化、增强免疫力三效合一',
      'NAD+ 补充的黄金标准，全球抗衰热门成分',
      '科技抗衰 · 送给父母的健康未来',
    ],
    keyIngredients: [
      { name: 'β-烟酰胺单核苷酸 (NMN)', dose: '400mg/粒', benefit: 'NAD+前体 · 细胞能量修复' },
      { name: '白藜芦醇', dose: '100mg', benefit: '抗氧化 · 协同 NMN 增效' },
      { name: '辅酶 Q10', dose: '50mg', benefit: '心脏保护 · 线粒体支持' },
    ],
    scientificBasis:
      'NMN 作为 NAD+ 的直接前体，在多项动物研究中显示出改善代谢健康、增强认知功能和延缓衰老标志物的潜力。人体临床试验正在快速推进中。',
    howToUse: '每日2粒，早晨空腹服用效果最佳。',
    warnings: ['未成年人不推荐使用', '孕妇、哺乳期慎用'],
    certifications: ['GMP', 'ISO22000', 'SGS检测', '第三方纯度验证'],
    stock: 'in',
    shippingNote: '香港直邮 · 7-15个工作日',
    images: [
      '/images/products/msr-nmn/main.jpg',
      '/images/products/msr-nmn/detail-1.jpg',
      '/images/products/msr-nmn/detail-2.jpg',
      '/images/products/msr-nmn/detail-3.jpg',
    ],
  },

  /* ═══════════════════════════════════════════════════════════════
   * 通用OTC引流产品 (建立信任 + 搜索曝光)
   * ═══════════════════════════════════════════════════════════════ */
  {
    sku: 'RW-FA-001',
    slug: 'b-complex-activated',
    name: '活性 B 族维生素复合片',
    englishName: 'Activated B-Complex',
    brand: '荣旺 · Vital',
    category: 'vitamin',
    plans: ['fatigue', 'stress'],
    price: 168,
    memberPrice: 138,
    unit: '60 片',
    servings: 60,
    origin: '美国',
    tagline: '甲基化活性形式，直接参与能量代谢',
    tier: 'traffic',
    hero: [
      '采用甲钴胺 / 5-MTHF / P-5-P 等活性形式',
      '8 种 B 族维生素黄金比例',
      '无麸质 · 非转基因 · 素食胶囊',
    ],
    keyIngredients: [
      { name: '甲钴胺 (B12)', dose: '500mcg', benefit: '神经传导与红细胞生成' },
      { name: '5-MTHF (B9)', dose: '400mcg', benefit: '活性叶酸' },
      { name: '吡哆醛 5-磷酸 (B6)', dose: '25mg', benefit: '参与 100+ 种酶反应' },
    ],
    scientificBasis:
      'B 族维生素是线粒体能量代谢的核心辅酶。活性形式生物利用率比传统非活性形式高 30-80%。',
    howToUse: '每日 1 片，早餐后随温水服用。',
    warnings: ['服用华法林类抗凝药者请咨询医生'],
    certifications: ['cGMP', 'NSF', 'Non-GMO'],
    stock: 'in',
    images: [
      '/images/products/rw-b-complex/main.jpg',
      '/images/products/rw-b-complex/detail-1.jpg',
      '/images/products/rw-b-complex/detail-2.jpg',
    ],
  },
  {
    sku: 'RW-FA-002',
    slug: 'coq10-ubiquinol-100',
    name: '泛醇型辅酶 Q10 软胶囊',
    englishName: 'CoQ10 Ubiquinol 100mg',
    brand: '荣旺 · Vital',
    category: 'vitamin',
    plans: ['fatigue'],
    price: 258,
    memberPrice: 218,
    unit: '60 粒',
    servings: 60,
    origin: '日本',
    tagline: '已还原型 · 吸收率高出普通 Q10 8 倍',
    tier: 'traffic',
    hero: [
      '日本 Kaneka 原料',
      '针对 40+ 人群 CoQ10 自然下降',
      '搭配椰子油 MCT 提升脂溶吸收',
    ],
    keyIngredients: [
      { name: '泛醇 Ubiquinol', dose: '100mg', benefit: '线粒体电子传递链核心' },
      { name: '椰子 MCT 油', dose: '300mg', benefit: '载体脂肪提升吸收' },
    ],
    scientificBasis:
      'CoQ10 在细胞线粒体内膜中生成 ATP。40 岁后人体内源性合成量每年下降约 1%。',
    howToUse: '每日 1 粒，与含脂肪的餐食同服。',
    warnings: ['服用他汀类降脂药者尤其推荐'],
    certifications: ['Kaneka', 'cGMP'],
    stock: 'in',
    images: [
      '/images/products/rw-coq10/main.jpg',
      '/images/products/rw-coq10/detail-1.jpg',
      '/images/products/rw-coq10/detail-2.jpg',
    ],
  },
  {
    sku: 'RW-SL-001',
    slug: 'magnesium-glycinate-400',
    name: '甘氨酸镁深睡配方',
    englishName: 'Magnesium Glycinate 400mg',
    brand: '荣旺 · Night',
    category: 'mineral',
    plans: ['sleep', 'stress'],
    price: 158,
    memberPrice: 128,
    unit: '120 粒',
    servings: 60,
    origin: '德国',
    tagline: '最温和的镁形式 · 不腹泻',
    tier: 'traffic',
    hero: ['400mg 元素镁 · 满足日需求', '促 GABA 系统 · 放松神经', '改善睡眠延迟与夜醒'],
    keyIngredients: [
      { name: '甘氨酸镁', dose: '2000mg (400mg 元素镁)', benefit: '神经系统放松' },
    ],
    scientificBasis:
      '镁是 600+ 种酶的辅助因子，直接参与 GABA 受体功能。缺镁与入睡困难、肌肉抽搐、焦虑呈显著相关。',
    howToUse: '睡前 1 小时 2 粒，随温水服用。',
    warnings: ['肾功能不全者请咨询医生'],
    certifications: ['Albion', 'TRAACS'],
    stock: 'in',
    images: [
      '/images/products/rw-magnesium/main.jpg',
      '/images/products/rw-magnesium/detail-1.jpg',
      '/images/products/rw-magnesium/detail-2.jpg',
    ],
  },
  {
    sku: 'RW-IM-001',
    slug: 'vitamin-d3-k2',
    name: '维生素 D3 + K2 复合软胶囊',
    englishName: 'Vitamin D3 5000IU + K2 MK-7',
    brand: '荣旺 · Shield',
    category: 'vitamin',
    plans: ['immune'],
    price: 158,
    memberPrice: 128,
    unit: '90 粒',
    servings: 90,
    origin: '挪威',
    tagline: '钙代谢的黄金搭档',
    tier: 'traffic',
    hero: ['D3 + K2 协同调节钙走向骨骼', 'MK-7 长效形式', '支持免疫 / 骨骼 / 心血管'],
    keyIngredients: [
      { name: '维生素 D3', dose: '5000IU (125mcg)', benefit: '免疫调节 + 钙吸收' },
      { name: '维生素 K2 (MK-7)', dose: '100mcg', benefit: '引导钙沉积到骨骼' },
    ],
    scientificBasis:
      '大多数亚洲人群血清 25(OH)D 水平低于最佳区间。D3 + K2 联合使用避免血管钙化风险。',
    howToUse: '每日 1 粒，随含脂肪餐食服用。',
    warnings: ['服用华法林者请咨询医生'],
    certifications: ['IFOS', 'cGMP'],
    stock: 'in',
    images: [
      '/images/products/rw-d3k2/main.jpg',
      '/images/products/rw-d3k2/detail-1.jpg',
      '/images/products/rw-d3k2/detail-2.jpg',
    ],
  },
  {
    sku: 'RW-IM-002',
    slug: 'vitamin-c-liposomal',
    name: '脂质体维生素 C',
    englishName: 'Liposomal Vitamin C 1000mg',
    brand: '荣旺 · Shield',
    category: 'vitamin',
    plans: ['immune'],
    price: 218,
    memberPrice: 188,
    unit: '60 粒',
    servings: 60,
    origin: '美国',
    tagline: '脂质体包裹技术 · 吸收率 90%',
    tier: 'traffic',
    hero: ['突破普通 Vc 吸收瓶颈', '温和 · 不刺激肠胃', '免疫急救首选'],
    keyIngredients: [
      { name: '脂质体 L-抗坏血酸', dose: '1000mg', benefit: '强抗氧化 · 免疫支持' },
      { name: '葵花磷脂酰胆碱', dose: '500mg', benefit: '脂质体载体' },
    ],
    scientificBasis:
      '脂质体技术将 Vc 包裹进磷脂双层，绕开肠道饱和转运蛋白，生物利用率是普通形式的 2-3 倍。',
    howToUse: '每日 1-2 粒，空腹服用。',
    warnings: [],
    certifications: ['Non-GMO', 'Soy-free'],
    stock: 'in',
    images: [
      '/images/products/rw-vitc/main.jpg',
      '/images/products/rw-vitc/detail-1.jpg',
      '/images/products/rw-vitc/detail-2.jpg',
    ],
  },
  {
    sku: 'RW-IM-003',
    slug: 'probiotic-50b-15strain',
    name: '500 亿活菌 15 菌株益生菌',
    englishName: 'Probiotic 50B CFU 15-Strain',
    brand: '荣旺 · Shield',
    category: 'probiotic',
    plans: ['immune'],
    price: 288,
    memberPrice: 248,
    unit: '30 粒',
    servings: 30,
    origin: '美国',
    tagline: '肠道即免疫 · 90% 免疫细胞栖息地',
    tier: 'traffic',
    hero: ['15 种临床研究菌株', '肠溶胶囊保护至大肠', '常温保存 18 个月'],
    keyIngredients: [
      { name: '鼠李糖乳杆菌 GG', dose: '100 亿', benefit: '肠道屏障支持' },
      { name: '双歧杆菌 BB-12', dose: '100 亿', benefit: '免疫调节' },
      { name: '其他 13 菌株', dose: '300 亿', benefit: '肠道菌群多样性' },
    ],
    scientificBasis:
      '肠道菌群直接调控 70% 以上免疫系统。多菌株配方研究显示协同作用优于单一菌株。',
    howToUse: '每日 1 粒，餐前空腹服用。',
    warnings: ['免疫抑制剂使用者请咨询医生'],
    certifications: ['DSM', 'cGMP'],
    stock: 'in',
    images: [
      '/images/products/rw-probiotic/main.jpg',
      '/images/products/rw-probiotic/detail-1.jpg',
      '/images/products/rw-probiotic/detail-2.jpg',
    ],
  },
  {
    sku: 'RW-ST-001',
    slug: 'omega3-epa-dha',
    name: '高纯度鱼油 EPA/DHA',
    englishName: 'Omega-3 Fish Oil 1200mg',
    brand: '荣旺 · Calm',
    category: 'omega',
    plans: ['stress', 'fatigue', 'cardio'],
    price: 198,
    memberPrice: 168,
    unit: '90 粒',
    servings: 90,
    origin: '挪威',
    tagline: 'IFOS 五星认证 · 无腥味',
    tier: 'traffic',
    hero: ['EPA 720mg + DHA 480mg', '三重分子蒸馏', '支持心情 / 认知 / 心血管'],
    keyIngredients: [
      { name: 'EPA', dose: '720mg', benefit: '抗炎 · 情绪支持' },
      { name: 'DHA', dose: '480mg', benefit: '大脑结构脂质' },
    ],
    scientificBasis:
      '高 EPA 比例 Omega-3 在情绪和心血管研究中显示中度效应。欧洲食品安全局认可 EPA+DHA 对心脏功能的作用。',
    howToUse: '每日 2 粒，随餐服用。',
    warnings: ['服用抗凝血药者请咨询医生'],
    certifications: ['IFOS 5★', 'MSC'],
    stock: 'in',
    images: [
      '/images/products/rw-omega3/main.jpg',
      '/images/products/rw-omega3/detail-1.jpg',
      '/images/products/rw-omega3/detail-2.jpg',
    ],
  },
  {
    sku: 'RW-BS-001',
    slug: 'collagen-peptide-marine',
    name: '海洋小分子胶原蛋白肽',
    englishName: 'Marine Collagen Peptides 10g',
    brand: '荣旺 · Glow',
    category: 'amino',
    plans: ['beauty', 'fatigue'],
    price: 268,
    memberPrice: 228,
    unit: '30 包',
    servings: 30,
    origin: '法国',
    tagline: '分子量 <2000Da · 吸收率 90%+',
    tier: 'traffic',
    hero: ['法国 Peptan® 专利工艺', '无腥味 · 无添加', 'Type I 胶原蛋白'],
    keyIngredients: [
      { name: '海洋胶原肽', dose: '10g', benefit: '皮肤弹性 / 关节支持' },
      { name: '维生素 C', dose: '80mg', benefit: '促胶原合成' },
    ],
    scientificBasis: '多项临床显示 10g/日 胶原肽 8 周可显著改善皮肤水分与弹性评分。',
    howToUse: '每日 1 包，冲调温水或咖啡饮用。',
    warnings: ['鱼过敏者禁用'],
    certifications: ['Peptan®', 'MSC'],
    stock: 'in',
    images: [
      '/images/products/rw-collagen/main.jpg',
      '/images/products/rw-collagen/detail-1.jpg',
      '/images/products/rw-collagen/detail-2.jpg',
    ],
  },
];

/**
 * 根据矩阵/场景筛选商品
 */
export function getProductsByPlan(plan: PlanSlug): Product[] {
  return products.filter((p) => p.plans.includes(plan));
}

/**
 * 获取单个商品
 */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/**
 * 获取品牌列表
 */
export function getBrands(): string[] {
  return [...new Set(products.map((p) => p.brand))];
}

/**
 * 按矩阵分组
 */
export function getProductsByMatrix(matrix: string): Product[] {
  return products.filter((p) => p.matrix === matrix);
}

/**
 * 获取核心矩阵产品 (非通用OTC)
 */
export function getCoreProducts(): Product[] {
  return products.filter((p) => p.matrix);
}

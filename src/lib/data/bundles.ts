/**
 * 1970 Uncle Darren's 营养包套装 — 静态数据
 * 路由：/products/bundles/[slug]
 */

export interface BundleDetail {
  slug: string;
  name: string;
  gender: "male" | "female";
  category: "heart" | "bone" | "gut" | "brain";
  tagline: string;
  spec: string;
  courseDays: number;
  price: number;
  marketPrice: number;
  ingredients: BundleIngredient[];
  howToUse: string;
  targetUsers: string[];
  contraindications: string[];
  testimonials: TestimonialItem[];
  relatedBundles: string[]; // other bundle slugs to show
  emoji: string;
  gradient: string;
  lightBg: string;
  accent: string;
  bgAccent: string;
}

export interface BundleIngredient {
  name: string;
  dose: string;
  role: string;
  source: string;
}

export interface TestimonialItem {
  name: string;
  initial: string;
  meta: string;
  rating: number;
  quote: string;
  accent: "purple" | "green" | "blue" | "pink" | "red" | "teal";
}

export const bundleDetails: Record<string, BundleDetail> = {
  "heart-male": {
    slug: "heart-male",
    name: "男士心脏健康营养包",
    gender: "male",
    category: "heart",
    tagline: "辅酶Q10 + Omega3 + 大蒜精 + 镁，四重守护心血管",
    spec: "28袋/盒（每日1袋，每袋含4粒胶囊）",
    courseDays: 28,
    price: 399,
    marketPrice: 699,
    emoji: "💊",
    gradient: "from-red-600 to-rose-700",
    lightBg: "bg-red-50",
    accent: "text-red-600",
    bgAccent: "bg-red-600",
    ingredients: [
      {
        name: "辅酶Q10",
        dose: "100mg/袋",
        role: "支持心肌细胞能量代谢，维护心血管系统正常功能",
        source: "美国 BASF 专利原料，Kaneka Q10",
      },
      {
        name: "Omega3 鱼油",
        dose: "600mg EPA+DHA/袋",
        role: "支持心血管日常营养，抗氧化营养补充",
        source: "挪威深海小鱼种，IFOS 五星认证",
      },
      {
        name: "大蒜精",
        dose: "300mg/袋",
        role: "支持心血管日常营养，天然植物提取物",
        source: "美国 Arizona 农场新鲜蒜提取",
      },
      {
        name: "镁元素",
        dose: "200mg/袋",
        role: "调节心肌节律，支持血管平滑肌正常功能",
        source: "美国 Albion 氨基酸螯合镁",
      },
    ],
    howToUse: "每日1袋，早餐后30分钟服用（4粒胶囊一起服用，不影响吸收）。建议连续服用3个月（12盒）为一个完整疗程。",
    targetUsers: [
      "长期熬夜、加班、高压力人群",
      "有家族心脏病史者",
      "体检显示血脂/胆固醇偏高",
      "经常胸闷、心悸者",
      "40岁以上男性",
    ],
    contraindications: [
      "正在服用抗凝药物（如华法林）者服用前请咨询医生",
      "对鱼油或大蒜过敏者禁用",
      "孕妇、哺乳期女性不宜服用",
    ],
    testimonials: [
      {
        name: "李先生",
        initial: "李",
        meta: "58岁 · 上海 · 长期熬夜程序员",
        rating: 5,
        quote: "吃了3个月营养包，整体精力和状态有改善。包装正品，顾问服务耐心，购买流程清晰。",
        accent: "red",
      },
      {
        name: "王先生",
        initial: "王",
        meta: "62岁 · 广州 · 高血脂患者",
        rating: 5,
        quote: "营养师建议我配合饮食调整一起做。现在每天1袋营养包，已经成为习惯了。",
        accent: "blue",
      },
      {
        name: "陈先生",
        initial: "陈",
        meta: "55岁 · 深圳 · 企业管理者",
        rating: 5,
        quote: "经常应酬喝酒，吃了两个疗程，整体状态比之前好。顾问服务专业，正品保障。",
        accent: "green",
      },
    ],
    relatedBundles: ["heart-female", "bone-male", "gut-male", "brain-male"],
  },

  "heart-female": {
    slug: "heart-female",
    name: "女士心脏健康营养包",
    gender: "female",
    category: "heart",
    tagline: "辅酶Q10 + 胶原蛋白 + 铁 + B族，呵护女性心血健康",
    spec: "28袋/盒（每日1袋，每袋含4粒胶囊）",
    courseDays: 28,
    price: 399,
    marketPrice: 699,
    emoji: "💊",
    gradient: "from-pink-500 to-rose-600",
    lightBg: "bg-pink-50",
    accent: "text-pink-600",
    bgAccent: "bg-pink-600",
    ingredients: [
      {
        name: "辅酶Q10",
        dose: "80mg/袋",
        role: "支持心肌细胞能量代谢，维护心血管系统正常功能",
        source: "美国 BASF 专利原料",
      },
      {
        name: "胶原蛋白",
        dose: "1000mg/袋",
        role: "维持血管弹性，保护心脏瓣膜",
        source: "美国 UC-II 胶原蛋白",
      },
      {
        name: "铁元素",
        dose: "15mg/袋",
        role: "支持铁元素日常营养补充，维护血红蛋白正常水平",
        source: "美国 Albion 氨基酸螯合铁",
      },
      {
        name: "B族维生素",
        dose: "B1/B2/B6/B12/叶酸/生物素",
        role: "参与能量代谢，减少同型半胱氨酸",
        source: "美国 Vitamin B复合配方",
      },
    ],
    howToUse: "每日1袋，早餐后30分钟服用。建议连续服用3个月为一个完整疗程。",
    targetUsers: [
      "有心脏欠佳家族史的女性",
      "长期节食、贫血女性",
      "进入更年期女性",
      "经常胸闷、心悸的女性",
      "40岁以上女性",
    ],
    contraindications: [
      "孕妇、哺乳期女性服用前请咨询医生",
      "有地中海贫血或铁代谢异常者慎用",
      "对胶原蛋白过敏者禁用",
    ],
    testimonials: [
      {
        name: "王女士",
        initial: "王",
        meta: "52岁 · 北京 · 心脏欠佳",
        rating: 5,
        quote: "顾问提醒我先结合体检结果和医生建议，再选择营养支持方案。整体服务专业，产品说明清晰。",
        accent: "pink",
      },
      {
        name: "林女士",
        initial: "林",
        meta: "48岁 · 上海 · 更年期",
        rating: 5,
        quote: "吃了三个月营养包，配合饮食调整，现在整体状态比之前好。客服回复及时。",
        accent: "purple",
      },
      {
        name: "张女士",
        initial: "张",
        meta: "61岁 · 杭州 · 贫血+心脏欠佳",
        rating: 5,
        quote: "有贫血和心脏问题，吃了半年营养包，复查指标稳定。现在每天1袋很方便。",
        accent: "blue",
      },
    ],
    relatedBundles: ["heart-male", "bone-female", "gut-female", "brain-female"],
  },

  "bone-male": {
    slug: "bone-male",
    name: "男士骨骼健康营养包",
    gender: "male",
    category: "bone",
    tagline: "钙片 + 胶原蛋白 + 软骨素 + 维生素D3，四合一全面护骨",
    spec: "28袋/盒（每日1袋，每袋含4粒胶囊）",
    courseDays: 28,
    price: 389,
    marketPrice: 699,
    emoji: "🦴",
    gradient: "from-emerald-600 to-teal-700",
    lightBg: "bg-emerald-50",
    accent: "text-emerald-600",
    bgAccent: "bg-emerald-600",
    ingredients: [
      {
        name: "钙片（碳酸钙）",
        dose: "600mg/袋",
        role: "补充骨钙，维持骨密度",
        source: "美国 BASF 钙源，500IU 维生素D3促进吸收",
      },
      {
        name: "胶原蛋白",
        dose: "1200mg/袋",
        role: "维护软骨弹性，支持关节日常舒适度",
        source: "美国 UC-II 非变性II型胶原蛋白",
      },
      {
        name: "软骨素",
        dose: "400mg/袋",
        role: "维护软骨弹性，支持关节舒适度",
        source: "美国 Givaudan 软骨素原料",
      },
      {
        name: "维生素D3",
        dose: "800IU/袋",
        role: "促进钙吸收，支持骨骼日常营养",
        source: "美国 DSM D3 原料",
      },
    ],
    howToUse: "每日1袋，晚餐后30分钟服用。建议连续服用6个月为一个完整疗程（骨代谢周期较慢）。",
    targetUsers: [
      "50岁以上男性",
      "久坐不动、关节不适者",
      "骨密度检查偏低者",
      "经常腰腿疼痛者",
      "有骨质疏松家族史者",
    ],
    contraindications: [
      "正在服用双膦酸盐类药物者服用前请咨询医生",
      "有肾结石病史者慎用高剂量钙",
      "对贝类提取物过敏者禁用软骨素",
    ],
    testimonials: [
      {
        name: "张先生",
        initial: "张",
        meta: "63岁 · 广州 · 骨质疏松",
        rating: 5,
        quote: "吃了半年钙片，体检后骨密度稳定。顾问耐心讲解产品区别，整体购买体验满意。",
        accent: "green",
      },
      {
        name: "刘先生",
        initial: "刘",
        meta: "71岁 · 深圳 · 膝关节退变",
        rating: 5,
        quote: "膝关节退变，吃了3个月营养包，现在可以每天散步1小时，关节舒适度比之前好。",
        accent: "blue",
      },
      {
        name: "周先生",
        initial: "周",
        meta: "58岁 · 北京 · 久坐+腰疼",
        rating: 5,
        quote: "久坐导致腰椎和膝盖都有问题，吃了半年胶原蛋白+软骨素组合，现在可以正常运动了。",
        accent: "purple",
      },
    ],
    relatedBundles: ["bone-female", "heart-male", "gut-male", "brain-male"],
  },

  "bone-female": {
    slug: "bone-female",
    name: "女士骨骼健康营养包",
    gender: "female",
    category: "bone",
    tagline: "钙片 + 胶原蛋白 + 铁 + 维生素D3，守护女性骨骼活力",
    spec: "28袋/盒（每日1袋，每袋含4粒胶囊）",
    courseDays: 28,
    price: 389,
    marketPrice: 699,
    emoji: "🦴",
    gradient: "from-teal-500 to-emerald-600",
    lightBg: "bg-teal-50",
    accent: "text-teal-600",
    bgAccent: "bg-teal-600",
    ingredients: [
      {
        name: "钙片（碳酸钙）",
        dose: "500mg/袋",
        role: "补充骨钙，维护骨密度",
        source: "美国 BASF 钙源+D3",
      },
      {
        name: "胶原蛋白",
        dose: "1500mg/袋",
        role: "维护软骨和骨骼弹性，支持骨量维护",
        source: "美国 UC-II 胶原蛋白",
      },
      {
        name: "铁元素",
        dose: "10mg/袋",
        role: "支持血红蛋白合成，维护日常能量代谢",
        source: "美国 Albion 氨基酸螯合铁",
      },
      {
        name: "维生素D3",
        dose: "800IU/袋",
        role: "促进钙吸收",
        source: "美国 DSM D3",
      },
    ],
    howToUse: "每日1袋，晚餐后30分钟服用。建议连续服用6个月为一个完整疗程。",
    targetUsers: [
      "更年期后女性（骨量流失加速）",
      "长期节食、钙摄入不足女性",
      "有骨质疏松家族史女性",
      "经常腰腿关节不适的女性",
      "50岁以上女性",
    ],
    contraindications: [
      "孕妇、哺乳期女性服用前请咨询医生",
      "有肾结石病史者慎用",
      "对贝类提取物过敏者慎用",
    ],
    testimonials: [
      {
        name: "赵女士",
        initial: "赵",
        meta: "55岁 · 上海 · 骨质疏松前期",
        rating: 5,
        quote: "体检发现骨密度偏低，医生建议补钙。这个营养包吃了半年，复查骨密度稳定了，没有继续下降。",
        accent: "teal",
      },
      {
        name: "孙女士",
        initial: "孙",
        meta: "68岁 · 杭州 · 腰椎压缩性骨折史",
        rating: 5,
        quote: "之前有过腰椎压缩性骨折，很担心再次骨折。吃了2年营养包+钙片，现在每天跳广场舞都没问题。",
        accent: "pink",
      },
      {
        name: "吴女士",
        initial: "吴",
        meta: "49岁 · 深圳 · 更年期前期",
        rating: 5,
        quote: "更年期前期开始吃，现在已经绝经2年，骨密度检查结果良好。医生说比同龄人水平好很多。",
        accent: "green",
      },
    ],
    relatedBundles: ["bone-male", "heart-female", "gut-female", "brain-female"],
  },

  "gut-male": {
    slug: "gut-male",
    name: "男士肠胃调理营养包",
    gender: "male",
    category: "gut",
    tagline: "15菌株益生菌 + 益生元 + 膳食纤维 + 消化酶，四维肠道调理",
    spec: "28袋/盒（每日1袋，每袋含4粒胶囊）",
    courseDays: 28,
    price: 349,
    marketPrice: 599,
    emoji: "🌿",
    gradient: "from-sky-600 to-blue-700",
    lightBg: "bg-sky-50",
    accent: "text-sky-600",
    bgAccent: "bg-sky-600",
    ingredients: [
      {
        name: "15菌株复合益生菌",
        dose: "300亿CFU/袋",
        role: "支持肠道微生态平衡，日常营养补充",
        source: "美国 DuPont Laraestin 15株复合益生菌",
      },
      {
        name: "益生元（低聚果糖）",
        dose: "2000mg/袋",
        role: "选择性促进益生菌生长繁殖",
        source: "美国 GTC 益生元原料",
      },
      {
        name: "膳食纤维",
        dose: "3000mg/袋",
        role: "支持日常膳食平衡，营养补充",
        source: "美国 Beneo 菊粉+车前子壳复合纤维",
      },
      {
        name: "消化酶",
        dose: "复合酶/袋",
        role: "支持日常营养消化吸收",
        source: "美国 National Enzyme Company 消化酶复合配方",
      },
    ],
    howToUse: "每日1袋，早餐后或睡前服用（胃酸较低时服用更利于益生菌到达肠道）。建议连续服用3个月为一个完整疗程（肠道菌群重建需要时间）。",
    targetUsers: [
      "经常便秘或腹泻者",
      "应酬多、饮食不规律者",
      "长期服用抗生素者",
      "经常腹胀、消化不良者",
      "久坐缺乏运动者",
    ],
    contraindications: [
      "正在服用免疫抑制剂者服用前请咨询医生",
      "严重肠道疾病（如克罗恩病、溃疡性结肠炎）患者请先咨询医生",
      "对益生菌或纤维过敏者禁用",
    ],
    testimonials: [
      {
        name: "黄先生",
        initial: "黄",
        meta: "45岁 · 北京 · 长期便秘",
        rating: 5,
        quote: "便秘困扰了我十几年，吃了这个益生菌营养包，1个月后大便就正常了。现在每天固定时间排便，整个人轻松了很多。",
        accent: "blue",
      },
      {
        name: "徐先生",
        initial: "徐",
        meta: "38岁 · 上海 · 应酬多+脂肪肝",
        rating: 5,
        quote: "经常应酬喝酒，肠胃一直不好。吃了半年益生菌+消化酶，现在腹胀的情况少多了，身体状态好了很多。",
        accent: "green",
      },
      {
        name: "马先生",
        initial: "马",
        meta: "52岁 · 广州 · 长期服用抗生素",
        rating: 5,
        quote: "吃完两个月抗生素后肠道菌群紊乱，吃了3个月营养包，现在肠胃功能基本恢复正常。肠道调理真的要耐心。",
        accent: "purple",
      },
    ],
    relatedBundles: ["gut-female", "heart-male", "bone-male", "brain-male"],
  },

  "gut-female": {
    slug: "gut-female",
    name: "女士肠胃调理营养包",
    gender: "female",
    category: "gut",
    tagline: "5大菌株益生菌 + 益生元 + 低聚果糖 + 果蔬纤维，温和调理女性肠胃",
    spec: "28袋/盒（每日1袋，每袋含4粒胶囊）",
    courseDays: 28,
    price: 349,
    marketPrice: 599,
    emoji: "🌿",
    gradient: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50",
    accent: "text-emerald-600",
    bgAccent: "bg-emerald-600",
    ingredients: [
      {
        name: "5大菌株益生菌",
        dose: "200亿CFU/袋",
        role: "维护肠道微生态，改善消化功能",
        source: "美国 Culturelle + BioGaia 5株复合配方",
      },
      {
        name: "益生元（低聚半乳糖）",
        dose: "1500mg/袋",
        role: "促进女性常见益生菌（乳杆菌）增殖",
        source: "美国 GTC 益生元",
      },
      {
        name: "低聚果糖",
        dose: "1000mg/袋",
        role: "温和改善便秘，维护肠道酸性环境",
        source: "天然果蔬来源",
      },
      {
        name: "果蔬纤维",
        dose: "2500mg/袋",
        role: "增加饱腹感，促进肠道蠕动",
        source: "美国 Beneo 果蔬复合纤维",
      },
    ],
    howToUse: "每日1袋，早餐后或睡前服用。建议连续服用3个月为一个完整疗程。",
    targetUsers: [
      "经常便秘或大便不规律的女性",
      "长期节食、纤维摄入不足者",
      "经常腹胀、消化不良的女性",
      "有肠易激综合征（IBS）倾向者",
      "希望改善皮肤状态（肠道=第二皮肤）者",
    ],
    contraindications: [
      "正在服用免疫抑制剂者服用前请咨询医生",
      "有严重肠道疾病者请先咨询医生",
      "对益生菌或纤维过敏者禁用",
    ],
    testimonials: [
      {
        name: "周女士",
        initial: "周",
        meta: "34岁 · 上海 · 长期便秘+皮肤差",
        rating: 5,
        quote: "便秘一直是我最大的困扰，吃了这个营养包1个月，大便就正常了。而且皮肤也变好了，肠胃好了真的不一样。",
        accent: "green",
      },
      {
        name: "郑女士",
        initial: "郑",
        meta: "42岁 · 北京 · 肠易激综合征",
        rating: 5,
        quote: "肠易激综合征困扰了我十几年，一紧张就腹泻。吃了半年营养包，现在出差旅行都不会拉肚子了。真的感谢。",
        accent: "pink",
      },
      {
        name: "何女士",
        initial: "何",
        meta: "29岁 · 杭州 · 减肥+便秘",
        rating: 5,
        quote: "减肥期间吃得少，便秘很严重。吃了这个营养包后每天都能正常排便，减肥也没那么痛苦了。",
        accent: "blue",
      },
    ],
    relatedBundles: ["gut-male", "heart-female", "bone-female", "brain-female"],
  },

  "brain-male": {
    slug: "brain-male",
    name: "男士大脑活力营养包",
    gender: "male",
    category: "brain",
    tagline: "DHA藻油 + PS磷脂酰丝氨酸 + NMN + 银杏叶，唤醒大脑潜力",
    spec: "28袋/盒（每日1袋，每袋含4粒胶囊）",
    courseDays: 28,
    price: 429,
    marketPrice: 799,
    emoji: "🧠",
    gradient: "from-violet-600 to-purple-700",
    lightBg: "bg-violet-50",
    accent: "text-violet-600",
    bgAccent: "bg-violet-600",
    ingredients: [
      {
        name: "DHA藻油",
        dose: "500mg/袋",
        role: "构成大脑细胞膜，支持认知功能和记忆力",
        source: "美国 DSMlife DHA藻油（植物来源，非鱼油）",
      },
      {
        name: "PS磷脂酰丝氨酸",
        dose: "100mg/袋",
        role: "改善短期记忆，支持注意力与专注力",
        source: "美国 Chemi Nutra PS原料（磷脂来源）",
      },
      {
        name: "NMN",
        dose: "200mg/袋",
        role: "提升NAD+水平，支持线粒体能量代谢",
        source: "美国 Elevant NMN原料，99%+纯度",
      },
      {
        name: "银杏叶提取物",
        dose: "120mg/袋",
        role: "改善脑部微循环，支持记忆力",
        source: "美国 Euromed银杏叶标准化提取物",
      },
    ],
    howToUse: "每日1袋，早餐后服用。建议连续服用3个月为一个完整疗程（神经细胞修复需要时间）。",
    targetUsers: [
      "经常用脑过度、记忆力下降者",
      "中老年认知功能下降者",
      "长期熬夜、睡眠质量差者",
      "希望提升专注力和工作效率者",
      "有老年痴呆症家族史者",
    ],
    contraindications: [
      "正在服用抗凝药物者服用前请咨询医生（银杏叶影响凝血）",
      "对贝类或藻类过敏者禁用DHA",
      "孕妇、哺乳期男性伴侣以外的女性不宜服用",
    ],
    testimonials: [
      {
        name: "陈先生",
        initial: "陈",
        meta: "45岁 · 深圳 · 程序员+记忆力下降",
        rating: 5,
        quote: "程序员，40岁以后明显感觉脑子不够用，学新东西记不住。吃了半年NMN+DHA，现在学新框架速度快多了。",
        accent: "purple",
      },
      {
        name: "许先生",
        initial: "许",
        meta: "65岁 · 北京 · 轻度认知障碍",
        rating: 5,
        quote: "体检发现有轻度认知障碍，吃了1年营养包，现在记忆力和注意力都比之前好很多。能自己记着吃药和出门办事。",
        accent: "blue",
      },
      {
        name: "方先生",
        initial: "方",
        meta: "55岁 · 上海 · 退休+希望保持大脑活力",
        rating: 5,
        quote: "退休后开始吃，现在72岁还能写文章、做数学题。身边老朋友都很羡慕我的状态。",
        accent: "green",
      },
    ],
    relatedBundles: ["brain-female", "heart-male", "bone-male", "gut-male"],
  },

  "brain-female": {
    slug: "brain-female",
    name: "女士大脑活力营养包",
    gender: "female",
    category: "brain",
    tagline: "DHA藻油 + 胶原蛋白 + NMN + B族，呵护女性脑力与气色",
    spec: "28袋/盒（每日1袋，每袋含4粒胶囊）",
    courseDays: 28,
    price: 429,
    marketPrice: 799,
    emoji: "🧠",
    gradient: "from-purple-500 to-fuchsia-600",
    lightBg: "bg-purple-50",
    accent: "text-purple-600",
    bgAccent: "bg-purple-600",
    ingredients: [
      {
        name: "DHA藻油",
        dose: "400mg/袋",
        role: "支持大脑认知功能，维护神经元健康",
        source: "美国 DSMlife DHA藻油",
      },
      {
        name: "胶原蛋白",
        dose: "1000mg/袋",
        role: "维护大脑血管弹性，辅助营养输送",
        source: "美国 UC-II 胶原蛋白",
      },
      {
        name: "NMN",
        dose: "150mg/袋",
        role: "支持NAD+水平，延缓脑细胞衰老",
        source: "美国 Elevant NMN",
      },
      {
        name: "B族维生素",
        dose: "B6/B12/叶酸/生物素",
        role: "支持甲基化循环，维护神经系统健康",
        source: "美国 Vitamin B 复合配方",
      },
    ],
    howToUse: "每日1袋，早餐后服用。建议连续服用3个月为一个完整疗程。",
    targetUsers: [
      "进入更年期脑力下降的女性",
      "长期睡眠不好、记忆力衰退者",
      "高压力职业女性",
      "希望保持年轻态脑力的中年女性",
      "有老年痴呆症家族史的女性",
    ],
    contraindications: [
      "孕妇、哺乳期女性服用前请咨询医生",
      "对藻类或胶原蛋白过敏者禁用",
      "正在服用抗凝药物者请先咨询医生",
    ],
    testimonials: [
      {
        name: "杨女士",
        initial: "杨",
        meta: "50岁 · 上海 · 更年期+脑力下降",
        rating: 5,
        quote: "更年期后经常忘东忘西，有时候话到嘴边说不出来。吃了半年营养包，现在记忆力和反应速度都好了很多。",
        accent: "purple",
      },
      {
        name: "唐女士",
        initial: "唐",
        meta: "38岁 · 北京 · 高压工作+失眠",
        rating: 5,
        quote: "工作压力大，经常失眠，脑子转不动。吃了3个月，现在睡眠改善了，专注力也比之前好很多。",
        accent: "pink",
      },
      {
        name: "宋女士",
        initial: "宋",
        meta: "62岁 · 深圳 · 退休+老年痴呆前期",
        rating: 5,
        quote: "发现开始有老年痴呆的迹象，吃了1年营养包，现在状态稳定很多，还能帮忙带孙子。",
        accent: "blue",
      },
    ],
    relatedBundles: ["brain-male", "heart-female", "bone-female", "gut-female"],
  },
};

export const allBundleSlugs = Object.keys(bundleDetails);
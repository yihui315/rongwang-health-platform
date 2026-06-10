export type Article = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedAt: string;
  coverColor: string;
  author: string;
  sections: Array<{
    heading: string;
    content: string;
    highlight?: { icon: string; title: string; text: string };
  }>;
  relatedPlan?: string;
  recommendation?: {
    title: string;
    subtitle: string;
    reason: string;
    planSlug?: string;
    products: Array<{
      name: string;
      sku: string;
      tagline: string;
      price: number;
    }>;
  };
};

export const articles: Article[] = [
  {
    title: "跨境保健品怎么买才不被坑？",
    slug: "8b5ybrio",
    excerpt: "跨境保健品水很深——同样的成分，价格差几倍，选购前搞清这5点，能避开90%的坑。",
    category: "营养科普",
    readTime: "5分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-emerald-400 to-teal-500",
    author: "运营官Darren",
    sections: [
      {
        heading: "跨境保健品怎么买才不被坑？",
        content: "跨境保健品这几年爆发式增长，天猫国际、京东全球购、拼多多全球购上品牌多得数不过来。但繁荣背后也是鱼龙混杂——同样一瓶辅酶Q10，有的卖100多，有的卖400多，到底差在哪？作为深耕这个赛道多年的从业者，给你5条实在的选购建议。",
        highlight: {
          icon: "🛡️",
          title: "认准蓝帽子和进口注册号",
          text: "中国境内的保健食品必须标注蓝帽子（国家市场监督管理总局批准）。跨境保健品则看原产国的认证——美国USP、欧盟EMA、日本厚生省等。查不到的别买。",
        },
      },
      {
        heading: "看批准文号，不只看品牌",
        content: "同一个品牌下，可能既有蓝帽子产品（国产注册），又有跨境原版。两者配方可能不同，监管标准也不同。购买前在国家市场监管总局官网查一下备案信息，能避开仿冒品。跨境产品则在原产国药监局官网核对。",
      },
      {
        heading: "含量和纯度是核心，不要被添加量迷惑",
        content: "有些产品标注含有XX毫克，实际是整片重量，成分含量远低于有效剂量。辅酶Q10的循证有效剂量是每天100-200mg，低于此剂量更多是心理安慰。优先选标注还原型泛醇（Ubiquinol）的，吸收率比氧化型（Ubiquinone）高3-5倍。",
      },
      {
        heading: "看剂型和辅料",
        content: "辅酶Q10是脂溶性成分，胶囊剂型（软胶囊）吸收远优于片剂。如果产品声称高含量但做成片剂，吸收率打折扣。还要注意辅料——某些片剂使用大量硬脂酸镁等填充剂，长期服用需留意。",
      },
      {
        heading: "查物流和溯源",
        content: "跨境产品最好能查到完整的物流轨迹（从境外仓库到海关清关到国内配送）。正规跨境电商平台会公示清关单和CIQ证书。如果一个跨境产品只在国内发货，没有任何清关信息，基本是假冒跨境。",
      },
      {
        heading: "价格参考基准线",
        content: "以辅酶Q10为例：正规跨境渠道100mg×60粒还原型，价格在200-400元之间。远低于这个价格要怀疑是否是临期品、仿品或含量虚标。远高于400元的，则要判断品牌溢价是否值得。",
      },
    ],
    relatedPlan: "fatigue",
    recommendation: {
      title: "抗疲劳组合",
      subtitle: "荣旺 · 高压力 + 营养流失型方案",
      reason: "文章提到的B族、镁、Omega-3等营养组合，荣旺抗疲劳方案已科学配比，无需自己研究搭配，顾问根据你的压力类型和饮食习惯推荐最适合的剂型。",
      planSlug: "fatigue",
      products: [
        { name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包", sku: "UD-BB-MEN-001", tagline: "适应原+B族，高压人群首选", price: 526 },
        { name: "UNCLE DARREN'S Brain Boost Max 女士脑部营养包", sku: "UD-BB-WOMEN-001", tagline: "适应原+B族，高压人群首选", price: 526 },
        { name: "UNCLE DARREN'S Joint Guardian Plus 男士骨骼关节营养包", sku: "UD-JG-MEN-001", tagline: "含螯合镁，支持神经肌肉", price: 399 },
      ],
    },
  },

  {
    title: "老公经常应酬喝酒，吃辅酶Q10有用吗？",
    slug: "wl6zzw4a",
    excerpt: "酒精消耗辅酶Q10是明确机制，但护肝不能只靠辅酶Q10——讲清楚原理，给家属一个客观答案。",
    category: "抗疲劳",
    readTime: "5分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-orange-400 to-red-400",
    author: "健康顾问",
    sections: [
      {
        heading: "酒精和辅酶Q10的关系",
        content: "酒精代谢（乙醇脱氢）过程中会产生大量自由基，消耗体内的抗氧化物质。辅酶Q10本身是线粒体呼吸链的核心成分，同时具有强抗氧化性。长期大量饮酒会显著降低体内辅酶Q10水平，这是有研究支持的。补充辅酶Q10有助于维持心肌和肝脏细胞的能量代谢。",
        highlight: {
          icon: "🔬",
          title: "有研究依据的机制",
          text: "动物实验显示酒精暴露显著降低心肌和肝脏辅酶Q10浓度。人类研究也发现酗酒者体内辅酶Q10水平普遍偏低，补充后有一定改善。",
        },
      },
      {
        heading: "但护肝不是只靠辅酶Q10",
        content: "需要说明白一件事：辅酶Q10对心脏和肝脏细胞有支持作用，但它不是解酒药，也不直接代谢酒精。真正的护肝策略是多维度的：减少饮酒频率和量（最关键）、保证充足睡眠、控制果糖摄入、避免不必要的药物滥用。",
      },
      {
        heading: "如果应酬不可避免",
        content: "对于无法完全避免饮酒的人群，辅酶Q10+B族维生素的组合是合理的营养支持方案——辅酶Q10支持心肌和线粒体，B族维生素参与酒精代谢支持。荣旺护肝组合由顾问根据使用场景（应酬前/后）提供搭配建议，不是单一成分，而是协同配比。",
      },
      {
        heading: "给家属的建议",
        content: "如果老公有频繁应酬，与其只盯着辅酶Q10，不如关注整体生活方式的改变：每次应酬后补充水分+电解质、保证第二天睡眠、必要时补充上述营养组合。如果体检已经出现肝功能异常（转氨酶升高），第一时间就医，不要依赖保健品。",
      },
    ],
    relatedPlan: "liver",
    recommendation: {
      title: "商务护肝组合",
      subtitle: "荣旺 · 应酬与熬夜护肝方案",
      reason: "文章提到辅酶Q10+B族的组合护肝方案，荣旺护肝组合已整合完整配方，由顾问根据使用场景（应酬前/后）提供搭配建议，不是单一成分，而是协同配比。",
      planSlug: "liver",
      products: [
        { name: "UNCLE DARREN'S Heart Defender 男士心血管营养包", sku: "UD-HD-MEN-001", tagline: "含辅酶Q10，心肌+肝脏双重支持", price: 529 },
        { name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包", sku: "UD-BB-MEN-001", tagline: "含B族维生素，应酬后能量恢复", price: 526 },
        { name: "UNCLE DARREN'S Joint Guardian Plus 男士骨骼关节营养包", sku: "UD-JG-MEN-001", tagline: "含镁和软骨素，综合健康支持", price: 399 },
      ],
    },
  },

  {
    title: "心脏健康与辅酶Q10：营养支持你需要知道的事",
    slug: "ejazfw2h",
    excerpt: "心脏是人体耗能最高的器官之一，当它开始喊累，身体会发出这些信号。",
    category: "抗疲劳",
    readTime: "5分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-purple-400 to-pink-500",
    author: "健康顾问",
    sections: [
      {
        heading: "为什么心脏最需要辅酶Q10",
        content: "心脏每天跳动约10万次，泵血量约7000升，是人体耗能最高的器官。心肌细胞富含线粒体，辅酶Q10浓度是全身各组织中最高的。随着年龄增长（尤其30岁以后），内源性辅酶Q10合成逐年下降，到50岁时体内水平可能只剩年轻时的60%。",
      },
      {
        heading: "信号1：爬楼梯比以前喘",
        content: "如果以前能轻松爬4-5层楼，现在2-3层就开始喘，这是心肺功能下降的早期信号。排除缺乏运动、肥胖等因素后，心肌能量代谢不足是重要原因。辅酶Q10参与ATP合成，直接影响心脏供能效率。",
      },
      {
        heading: "信号2：心悸和早搏变得频繁",
        content: "心脏偶发的早搏在疲劳、咖啡因摄入多时常见，但如果频率增加、持续时间延长，应及时就医检查排除风险。",
        highlight: {
          icon: "⚠️",
          title: "心悸不等于一定有问题，但需排除",
          text: "如果出现明显心悸、心跳停顿感、心率超过100bpm持续不降，或伴随胸痛、头晕，应立即就医。这些症状可能反映严重心律问题，不应自行判断。",
        },
      },
      {
        heading: "信号3：血压开始压线",
        content: "收缩压持续在130-139mmHg区间（高血压前期），或舒张压超过90mmHg，是心血管系统亚健康状态。关注血压变化的同时，营养支持（如辅酶Q10）可作为综合管理的一部分。",
      },
      {
        heading: "信号4：长期服用他汀类药物",
        content: "他汀类药物通过抑制HMG-CoA还原酶起效，但这个路径同时也抑制了辅酶Q10的内源性合成。这是他汀类药物常见肌肉疼痛不良反应的部分机制。如果你在服用他汀，补充辅酶Q10是常见的营养支持方案。",
      },
      {
        heading: "信号5：体检心电图出现非特异性改变",
        content: "体检报告上ST-T改变、不完全性右束支传导阻滞等描述在中年人中很常见，通常没有明显症状。这类情况建议结合临床评估，营养支持可作为综合方案的一部分。",
      },
    ],
    relatedPlan: "cardio",
    recommendation: {
      title: "心脑调理组合",
      subtitle: "荣旺 · 心脑血管与三高调理方案",
      reason: "文章提到心脏5个预警信号，荣旺心脑方案由健康顾问评估后匹配，不是套模板——有心脏隐患的用户会先完成评估再确认产品方向，适合需要专业指导的人群。",
      planSlug: "cardio",
      products: [
        { name: "UNCLE DARREN'S Heart Defender 男士心血管营养包", sku: "UD-HD-MEN-001", tagline: "心血管日常营养支持", price: 529 },
        { name: "UNCLE DARREN'S Heart Defender 女士心血管营养包", sku: "UD-HD-WOMEN-001", tagline: "心血管日常营养支持", price: 529 },
        { name: "UNCLE DARREN'S ATP 细胞营养胶囊", sku: "UD-ATP-001", tagline: "细胞线粒体能量支持", price: 1480 },
      ],
    },
  },

  {
    title: "95%高纯度辅酶Q10，每日一粒够吗？",
    slug: "pimu4agd",
    excerpt: "纯度高不等于效果好——吸收型态、剂型、随餐服用方式，都会影响实际利用率。",
    category: "营养科普",
    readTime: "5分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-blue-400 to-indigo-500",
    author: "运营官Darren",
    sections: [
      {
        heading: "纯度是基础，但远不是全部",
        content: "辅酶Q10原料纯度确实重要——杂质不仅无益，还可能带来不必要的风险。95%纯度是目前优质原料的标准，低于90%的产品不值得考虑。但纯度代表的是原料质量，和你吃进去能吸收多少是两回事。",
      },
      {
        heading: "还原型 vs 氧化型：吸收率差3-5倍",
        content: "辅酶Q10有两种形态：氧化型（Ubiquinone）和还原型（Ubiquinol）。人体内天然存在的是还原型（泛醇），氧化型需要在体内转化后才能利用。30岁以下人群转化能力尚可，30岁以后转化效率逐年下降。所以30岁以上人群，直接补充还原型是更合理的选择。",
        highlight: {
          icon: "💡",
          title: "还原型贵得有道理",
          text: "还原型辅酶Q10生产工艺更复杂，需要保持活性稳定性，所以价格通常是氧化型的3-5倍。但对于30岁以上人群，这笔溢价是值得的。",
        },
      },
      {
        heading: "每日100mg够吗？",
        content: "对于日常保健：100mg每天是合理的起始剂量。对于已有疲劳、心悸、正在服用他汀、或40岁以上人群：每天100-200mg更合适。需要注意的是：辅酶Q10是脂溶性，随含油脂的餐一起服用吸收率可提升3倍。空腹服用几乎等于浪费。",
      },
      {
        heading: "一粒还是分两次服用？",
        content: "单次大剂量超过100mg吸收率会下降，因为肠道吸收饱和。如果每天服用200mg，分成两次随餐服用比一次服用效果好。实际操作中，如果每天只吃一粒100mg，选哪个时间点？早餐随含油脂的食物（牛奶、鸡蛋、坚果）是最优选择。",
      },
    ],
    relatedPlan: "cardio",
    recommendation: {
      title: "心脑调理组合",
      subtitle: "荣旺 · 心脑血管与三高调理方案",
      reason: "文章详解还原型辅酶Q10的正确选择和剂量，荣旺方案中的Heart Defender产品已选用还原型，并标注了USP认证批次，由顾问说明不同产品的还原型含量和使用方式。",
      planSlug: "cardio",
      products: [
        { name: "UNCLE DARREN'S Heart Defender 男士心血管营养包", sku: "UD-HD-MEN-001", tagline: "含还原型辅酶Q10，每日随餐服用", price: 529 },
        { name: "UNCLE DARREN'S Heart Defender 女士心血管营养包", sku: "UD-HD-WOMEN-001", tagline: "含还原型辅酶Q10，每日随餐服用", price: 529 },
        { name: "UNCLE DARREN'S ATP 细胞营养胶囊", sku: "UD-ATP-001", tagline: "细胞线粒体能量支持", price: 1480 },
      ],
    },
  },

  {
    title: "进口辅酶Q10和国产有什么区别？了解真相做出选择",
    slug: "3giuwn20",
    excerpt: "原料、工艺、监管标准——三维度拆解进口和国产辅酶Q10的真实差距。",
    category: "营养科普",
    readTime: "6分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-emerald-400 to-teal-500",
    author: "健康顾问",
    sections: [
      {
        heading: "原料来源差距不大，核心在工艺",
        content: "全球辅酶Q10原料主要来自少数几家：日本钟渊（Kaneka）、印度 pharma 等。钟渊是全球最大的辅酶Q10原料商，国内很多所谓日本原装进口也用的是钟渊原料。原料本身差距不大，真正的差距在于：提纯工艺、胶囊制剂技术、以及质量控制标准。",
      },
      {
        heading: "日本制 vs 国产的真正差异",
        content: "日本保健食品监管体系（厚生省）与中国蓝帽子体系不同，各有优劣。日本产品优势在于：原料纯度控制更严、还原型（泛醇）稳定性工艺更成熟、辅料使用更谨慎。国产蓝帽子产品优势在于：审批门槛高、功能声称有严格审查、渠道监管更完善。两者没有绝对的谁更好，要具体看产品。",
        highlight: {
          icon: "🔍",
          title: "看包装上的制造所而非销售商",
          text: "很多产品写着日本进口，实际是原料国外进口、国内分装。真正日本制的产品会在包装上标注具体的制造所名称和地址，这个信息做不了假。",
        },
      },
      {
        heading: "跨境产品和蓝帽子的关键区别",
        content: "这是选购时最需要搞清的概念。蓝帽子（国产注册保健食品）：经过CFDA审批，有明确保健功能声称。跨境产品：符合原产国标准，通过保税仓直发，不经国内保健食品审批，不可以使用国内的保健功能声称。两者的监管逻辑完全不同。",
      },
      {
        heading: "价格悬殊的真实原因",
        content: "以100mg×60粒还原型为例：国产蓝帽子约150-250元，正规跨境日版约300-500元，欧美高端品牌可达600元以上。差价主要来自：品牌溢价、原料成本、包装和营销成本。性价比最优解：选跨境日版——工艺成熟、价格适中、原料可溯源。",
      },
    ],
    relatedPlan: "fatigue",
    recommendation: {
      title: "抗疲劳组合",
      subtitle: "荣旺 · 高压力 + 营养流失型方案",
      reason: "文章对比了进口和国产辅酶Q10的差异，荣旺产品通过跨境渠道直发，提供原产国认证和海关清关记录，确保来源可溯，顾问可帮助用户核实产品资质。",
      planSlug: "fatigue",
      products: [
        { name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包", sku: "UD-BB-MEN-001", tagline: "跨境直发，原产地认证", price: 526 },
        { name: "UNCLE DARREN'S Brain Boost Max 女士脑部营养包", sku: "UD-BB-WOMEN-001", tagline: "跨境直发，原产地认证", price: 526 },
        { name: "UNCLE DARREN'S Heart Defender 男士心血管营养包", sku: "UD-HD-MEN-001", tagline: "含辅酶Q10，心脏+能量支持", price: 529 },
      ],
    },
  },

  {
    title: "为什么加班族需要补充辅酶Q10？",
    slug: "fi9s05my",
    excerpt: "996工作制下，心脏长期高负荷运转。辅酶Q10是少数有科学依据的心脏省力工具。",
    category: "抗疲劳",
    readTime: "5分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-teal-400 to-cyan-500",
    author: "健康顾问",
    sections: [
      {
        heading: "加班对心脏的真实消耗",
        content: "长期高压力工作状态下，交感神经持续兴奋，心率偏快，血压偏高，心肌耗氧量增加。线粒体在高负荷运转时会产生更多自由基，如果抗氧化系统跟不上，就会出现氧化应激损伤——这被认为是动脉粥样硬化早期病变的底层机制之一。",
      },
      {
        heading: "睡眠剥夺是辅酶Q10的天敌",
        content: "加班族普遍存在睡眠不足或睡眠质量差的问题。而辅酶Q10在体内的合成和修复主要在夜间进行。睡眠剥夺导致内源性辅酶Q10合成下降，心脏能量供应不足，疲劳感增加，形成恶性循环。这也是为什么越累越需要关注营养支持的原因之一。",
        highlight: {
          icon: "📊",
          title: "营养支持原则",
          text: "对于高压力人群，核心是减少可控风险因素（睡眠、运动、饮食）和适当的营养补充。辅酶Q10作为线粒体能量代谢的核心辅酶，是合理的补充选项，但需结合整体健康管理。",
        },
      },
      {
        heading: "咖啡因的代价",
        content: "加班靠咖啡续命是常态。但高剂量咖啡因摄入会干扰辅酶Q10的肠道吸收，同时加速B族维生素的消耗。喝咖啡多的人，对辅酶Q10和B族维生素的需求是增加的。",
      },
      {
        heading: "给高压力人群的实用方案",
        content: "如果无法改变工作强度，至少可以从营养层面给心脏一些支持：每天100mg还原型辅酶Q10（随早餐）、补充B族维生素、保证尽可能的睡眠时间、每周至少一次中等强度运动。这些加起来成本不高，但对心脏的长期保护效果是有积累的。",
      },
    ],
    relatedPlan: "cardio",
    recommendation: {
      title: "心脑调理组合",
      subtitle: "荣旺 · 心脑血管与三高调理方案",
      reason: "文章给出996人群的心脏支持方案（辅酶Q10+B族+运动），荣旺心脑组合已包含辅酶Q10和B族，由顾问提供使用时机建议（早餐随服 vs 咖啡前），省去自己搭配的麻烦。",
      planSlug: "cardio",
      products: [
        { name: "UNCLE DARREN'S Heart Defender 男士心血管营养包", sku: "UD-HD-MEN-001", tagline: "辅酶Q10+Omega-3，996人群心脏支持", price: 529 },
        { name: "UNCLE DARREN'S Heart Defender 女士心血管营养包", sku: "UD-HD-WOMEN-001", tagline: "辅酶Q10+Omega-3，996人群心脏支持", price: 529 },
        { name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包", sku: "UD-BB-MEN-001", tagline: "含B族，咖啡因人群能量支持", price: 526 },
      ],
    },
  },

  {
    title: "辅酶Q10适合什么人？30岁+熬夜人群的营养支持参考",
    slug: "31jy5wfm",
    excerpt: "辅酶Q10不是有病才吃的药，而是30岁以后每个人都应该了解的营养素。",
    category: "抗疲劳",
    readTime: "5分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-orange-400 to-red-400",
    author: "运营官Darren",
    sections: [
      {
        heading: "30岁是个分水岭",
        content: "人体内源性辅酶Q10的合成在20岁左右达到峰值，之后以每年约1%的速度下降。到30岁时，多数人已经处于负平衡状态——合成少了，消耗（压力、熬夜、高强度工作）反而多了。这意味着30岁以后，适当补充辅酶Q10是合理的预防性措施，而不是有病才吃。",
      },
      {
        heading: "最需要补充的6类人群",
        content: "第一：经常熬夜或睡眠质量差的人；第二：感觉精力明显下降、疲劳感增强的人；第三：已出现心脏不适但未达疾病诊断的人；第四：正在服用他汀类药物的人；第五：40岁以上有高血压、高血脂家族史的人；第六：高强度运动爱好者。",
        highlight: {
          icon: "✅",
          title: "自测：你需要补充辅酶Q10吗？",
          text: "满足以下2条以上：经常熬夜、爬楼梯比以前喘、下午总犯困、已有心律问题、他汀使用者、40岁以上——建议考虑补充。",
        },
      },
      {
        heading: "青少年和儿童不需要",
        content: "这是需要明确的：健康青少年（25岁以下）内源性辅酶Q10合成功能正常，不需要额外补充。某些遗传性疾病导致辅酶Q10严重缺乏的情况需医生诊断后使用，普通人不要给未成年人乱吃。",
      },
      {
        heading: "与其他补充剂的协同",
        content: "辅酶Q10不是孤军作战。B族维生素参与能量代谢循环，镁是300多种酶的辅因子，Omega-3支持细胞膜和抗炎——这些营养素在体内相互关联。对于有心脏健康关注的人群，辅酶Q10+镁+B族的组合是常见且合理的搭配。",
      },
    ],
    relatedPlan: "cardio",
    recommendation: {
      title: "心脑调理组合",
      subtitle: "荣旺 · 心脑血管与三高调理方案",
      reason: "文章给出30+人群辅酶Q10补充的自测标准，荣旺心脑方案由顾问根据用户自测结果匹配适合的产品组合，不是买单一产品，而是完整的营养支持方案。",
      planSlug: "cardio",
      products: [
        { name: "UNCLE DARREN'S Heart Defender 男士心血管营养包", sku: "UD-HD-MEN-001", tagline: "30岁+人群心血管预防首选", price: 529 },
        { name: "UNCLE DARREN'S Heart Defender 女士心血管营养包", sku: "UD-HD-WOMEN-001", tagline: "30岁+人群心血管预防首选", price: 529 },
        { name: "UNCLE DARREN'S ATP 细胞营养胶囊", sku: "UD-ATP-001", tagline: "细胞线粒体充电桩，30+人群抗衰", price: 1480 },
      ],
    },
  },

  {
    title: "跨境健康品选购前需要确认的合规与标准差异",
    slug: "h8q9vnxo",
    excerpt: "保税仓、直邮、个人代购——不同渠道的合规风险完全不同，买之前搞清楚。",
    category: "营养科普",
    readTime: "6分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-purple-400 to-pink-500",
    author: "运营官Darren",
    sections: [
      {
        heading: "三种跨境渠道的风险等级完全不同",
        content: "第一类：天猫国际、京东国际等平台自营——有海关清关记录、平台背书、溯源可查，风险最低。第二类：保税仓发货的第三方店铺——有一定监管，但平台对店铺资质审核参差不齐。第三类：个人代购、直邮——无监管、无清关、无保障，是假货重灾区，强烈不推荐。",
      },
      {
        heading: "识别假跨境的技巧",
        content: "假跨境是指产品实际在国内生产或转口，冒充跨境发货。识别方法：查物流路径（正规跨境有完整境内外物流节点）、看发货地址（保税仓地址可查）、核对商品条码（前三位是国家代码）。正规跨境商品需有中文标签。",
        highlight: {
          icon: "📋",
          title: "必查的3个信息",
          text: "① 海关清关单（报关单）② CIQ检验检疫证明 ③ 原产国认证标志（USP、EMA等）。三个都有，基本靠谱。",
        },
      },
      {
        heading: "不同国家对保健品的监管差异",
        content: "美国：FDA不审批保健品，但要求GMP认证，USP Verified Mark是更高级别的质量认证。欧盟：EFSA有健康声称审批制度，营养声称有明确清单。日本：厚生省监管，产品需标注特别用途食品或健康食品，功效声称限制严格。",
      },
      {
        heading: "退货和售后保障",
        content: "跨境产品的退货一直是痛点。正规平台通常提供国内退货地址，售后有平台保障。但部分第三方店铺的退货地址在海外，实际退换货非常困难。购买前确认清楚退货政策。",
      },
    ],
    relatedPlan: "fatigue",
    recommendation: {
      title: "抗疲劳组合",
      subtitle: "荣旺 · 高压力 + 营养流失型方案",
      reason: "文章详解跨境合规选购要点，荣旺所有产品均通过正规跨境清关，提供CIQ和海关单据，顾问一对一服务，退换货有明确流程——不像代购那样买了就不管了。",
      planSlug: "fatigue",
      products: [
        { name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包", sku: "UD-BB-MEN-001", tagline: "正规跨境，CIQ认证", price: 526 },
        { name: "UNCLE DARREN'S Brain Boost Max 女士脑部营养包", sku: "UD-BB-WOMEN-001", tagline: "正规跨境，CIQ认证", price: 526 },
        { name: "UNCLE DARREN'S Joint Guardian Plus 男士骨骼关节营养包", sku: "UD-JG-MEN-001", tagline: "正规跨境，来源可溯", price: 399 },
      ],
    },
  },

  {
    title: "疲劳与免疫支持：荣旺 AI 健康顾问的教育参考路径",
    slug: "jm7ns5da",
    excerpt: "疲劳和免疫力低下经常同时出现，背后有共同的生理机制——线粒体功能和氧化应激。",
    category: "免疫防护",
    readTime: "5分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-blue-400 to-indigo-500",
    author: "运营官Darren",
    sections: [
      {
        heading: "疲劳和免疫力为什么狼狈为奸",
        content: "长期疲劳状态下，身体的皮质醇（压力激素）持续偏高，而皮质醇会抑制免疫细胞活性。同时，疲劳人群往往睡眠不足、饮食不规律——这些都是免疫力的天敌。反过来，免疫力低下时身体需要更多能量来维持免疫应答，消耗增加会加重疲劳感。两者形成恶性循环。",
      },
      {
        heading: "从机制出发的干预策略",
        content: "干预疲劳+免疫的双重问题，需要从多个维度入手：第一，线粒体能量支持（辅酶Q10、B族维生素、镁）；第二，免疫功能调节（维生素D3、锌、硒、β-葡聚糖）；第三，抗氧化系统支持（辅酶Q10本身就是强抗氧化剂，同时还有维生素C、E）；第四，生活方式改变（睡眠、运动、压力管理）。",
        highlight: {
          icon: "🧬",
          title: "核心机制：线粒体-免疫轴",
          text: "线粒体不仅是细胞的能量工厂，也是免疫信号分子的来源。线粒体功能障碍会引发慢性炎症和免疫失调，这正是疲劳加免疫低下的共同根源。",
        },
      },
      {
        heading: "营养补充剂组合建议",
        content: "基于上述机制，以下组合是针对疲劳+免疫双问题的合理方案：辅酶Q10（100mg）+维生素D3（2000IU）+锌（15mg）+硒（100微克）+维生素C（500mg）。这是日常保健剂量，不是治疗剂量，如有明确症状请就医。",
      },
      {
        heading: "何时需要就医",
        content: "如果疲劳持续超过3个月、伴随体重下降、夜间盗汗或反复感染，是需要进行全面体检的信号。这些症状可能指向更严重的疾病（甲状腺问题、自身免疫病、血液系统疾病等），不能单纯依靠营养补充剂处理。",
      },
    ],
    relatedPlan: "immune",
    recommendation: {
      title: "免疫防护组合",
      subtitle: "荣旺 · 免疫防线薄弱型方案",
      reason: "文章详解疲劳+免疫双问题的线粒体机制和营养组合，荣旺免疫方案由AI健康顾问先评估用户是属于线粒体疲劳型还是免疫缺陷型，再推荐对应的产品组合，精准匹配而非套模板。",
      planSlug: "immune",
      products: [
        { name: "UNCLE DARREN'S Digestive Elite Care 男士肠道营养包", sku: "UD-DE-MEN-001", tagline: "肠道=免疫堡垒，线粒体能量支持", price: 399 },
        { name: "UNCLE DARREN'S Digestive Elite Care 女士肠道营养包", sku: "UD-DE-WOMEN-001", tagline: "肠道=免疫堡垒，线粒体能量支持", price: 399 },
        { name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包", sku: "UD-BB-MEN-001", tagline: "含B族，支持能量代谢和免疫", price: 526 },
      ],
    },
  },

  {
    title: "睡眠支持怎么做：先评估，再选择健康教育方案",
    slug: "bvtrhw4l",
    excerpt: "失眠的原因完全不同，改善方法也完全不同——没有搞清楚原因之前，别急着买助眠产品。",
    category: "深度睡眠",
    readTime: "6分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-indigo-400 to-purple-500",
    author: "运营官Darren",
    sections: [
      {
        heading: "失眠不是一种病，是很多种病的症状",
        content: "睡不着的原因太多了：压力焦虑、咖啡因摄入时机不对、作息不规律、呼吸暂停、甲状腺亢进、抑郁情绪、药物副作用……不同原因对应完全不同的干预方案。如果不评估原因就买助眠产品，很可能花钱没效果，甚至掩盖了需要处理的健康问题。",
      },
      {
        heading: "先做睡眠评估：3个关键问题",
        content: "第一，入睡困难还是维持睡眠困难？（反映不同机制）；第二，每周出现几次？（偶发还是慢性）；第三，白天功能受影响吗？（嗜睡、注意力下降？）。如果只是偶尔失眠，可能只需要睡眠卫生改善。如果慢性失眠（超过3个月、超过3次每周），需要专业评估。",
        highlight: {
          icon: "📝",
          title: "睡眠日记帮你找原因",
          text: "连续记录2周：几点上床、几点入睡、夜间醒来几次、早上几点醒、白天状态。这份日记给医生看，比你口头描述睡不好有用得多。",
        },
      },
      {
        heading: "针对不同原因的干预方向",
        content: "入睡困难为主：优先考虑睡眠卫生改善+褪黑素（适合倒班、时差人群，老年人褪黑素下降者）；维持睡眠困难为主：优先考虑压力管理、镁补充；早醒型（比预期早醒1-2小时无法再睡）：可能与抑郁相关，建议心理评估。",
      },
      {
        heading: "常见的睡眠支持成分及其原理",
        content: "褪黑素：补充外源性褪黑素，适用于自身分泌不足的人群（倒班、时差、老年人）。L-茶氨酸：促进阿尔法脑波产生，帮助放松不成瘾，适合焦虑倾向的失眠。镁：有镇静作用，尤其适合压力大、肌肉紧张的人群。甘氨酸：改善睡眠周期，增加深度睡眠比例。缬草、西番莲：有临床数据支持，机制不完全明确但安全性好。",
      },
    ],
    relatedPlan: "sleep",
    recommendation: {
      title: "深度睡眠组合",
      subtitle: "荣旺 · 神经兴奋型失眠方案",
      reason: "文章强调失眠要先评估再选方案，荣旺睡眠方案由健康顾问先评估失眠类型（焦虑型/节律型/维持困难型），再匹配对应成分组合——不是买了助眠产品就完事，而是有评估、有跟踪、有调整。",
      planSlug: "sleep",
      products: [
        { name: "UNCLE DARREN'S Brain Boost Max 女士脑部营养包", sku: "UD-BB-WOMEN-001", tagline: "含GABA+茶氨酸+镁，焦虑型失眠首选", price: 526 },
        { name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包", sku: "UD-BB-MEN-001", tagline: "含GABA+茶氨酸+镁，焦虑型失眠首选", price: 526 },
      ],
    },
  },

  {
    title: "996应酬族护肝指南：不止辅酶Q10",
    slug: "h9q0znbq",
    excerpt: "喝酒熬夜党除了辅酶Q10，还需要哪些护肝营养支持？这份组合方案请收藏。",
    category: "压力缓解",
    readTime: "6分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-amber-400 to-orange-500",
    author: "运营官Darren",
    sections: [
      {
        heading: "为什么996应酬族的肝脏压力山大",
        content: "肝脏是人体最大的解毒器官，酒精、果糖、药物代谢都依赖肝脏。996应酬族的肝脏面临的挑战是：晚上喝酒应酬导致肝脏需要代谢酒精，凌晨才能进入修复期；白天高糖高脂外卖导致肝脏处理果糖和脂肪，长期脂肪肝风险增加；睡眠不足导致皮质醇升高，进一步抑制肝脏修复功能。",
      },
      {
        heading: "护肝营养组合：不止辅酶Q10",
        content: "单一成分很难应对多重损伤，组合方案更合理。第一，N-乙酰半胱氨酸（NAC）——谷胱甘肽前体，直接提升肝脏抗氧化能力，酒精代谢时消耗谷胱甘肽，NAC补充是针对这一消耗的特异性干预；第二，水飞蓟宾（奶蓟草）——稳定肝细胞膜，刺激肝细胞蛋白合成，是临床使用最广泛的护肝草本成分；第三，辅酶Q10——支持肝细胞线粒体能量代谢，减少氧化损伤；第四，B族维生素——酒精代谢需要B1、B2、B6，补充B族是对酒精消耗的营养补偿。",
        highlight: {
          icon: "🍷",
          title: "应酬前后的补救方案",
          text: "应酬前2小时服用NAC（600mg）有助于提升谷胱甘肽储备；应酬后补充B族维生素和水飞蓟宾；第二天保证高蛋白质饮食和充足睡眠，给肝脏修复时间。这是合理的护肝策略，而不是可以继续喝酒的借口。",
        },
      },
      {
        heading: "最最重要的：减少伤害源头",
        content: "护肝片不能抵消酒精。营养支持是辅助手段，不是继续糟蹋肝脏的理由。如果肝脏已经出现明显问题（转氨酶升高、脂肪肝、腹部不适），第一时间去肝病专科就诊，保健品帮不了你。护肝最有效的策略永远是：少喝酒、少熬夜、控制果糖、定期体检。",
      },
    ],
    relatedPlan: "liver",
    recommendation: {
      title: "商务护肝组合",
      subtitle: "荣旺 · 应酬与熬夜护肝方案",
      reason: "文章给出应酬前/后的护肝组合方案，荣旺护肝方案由顾问根据用户的应酬频率和已有体检指标，提供应酬前/后不同的搭配建议——不是一套产品打天下，而是有时机区分的个性化方案。",
      planSlug: "liver",
      products: [
        { name: "UNCLE DARREN'S Heart Defender 男士心血管营养包", sku: "UD-HD-MEN-001", tagline: "辅酶Q10+NAC+奶蓟草三合一，应酬族护肝", price: 529 },
        { name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包", sku: "UD-BB-MEN-001", tagline: "含B族，应酬后能量恢复", price: 526 },
        { name: "UNCLE DARREN'S Joint Guardian Plus 男士骨骼关节营养包", sku: "UD-JG-MEN-001", tagline: "含镁，支持肝脏解毒酶系统", price: 399 },
      ],
    },
  },

  {
    title: "35岁后营养需求变化：辅酶Q10的科学认知",
    slug: "m1l7r7u7",
    excerpt: "35岁是个坎——皱纹看得见，内在损耗看不见。辅酶Q10是少数能实实在在延缓内在衰老的营养素。",
    category: "压力缓解",
    readTime: "5分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-rose-400 to-pink-500",
    author: "健康顾问",
    sections: [
      {
        heading: "35岁后，身体在悄悄变化",
        content: "35岁后，大多数人开始出现一些说不清哪里不对但就是不对的感觉：恢复能力变差（熬夜一天要睡两天才缓过来）、体检出现小异常（血脂、血压开始压线）、皮肤状态下滑（皱纹、松弛加速）、运动表现下降。这些变化的底层原因之一，是线粒体功能的系统性下降——而辅酶Q10正是线粒体能量代谢的核心辅酶。",
      },
      {
        heading: "辅酶Q10与衰老的科学联系",
        content: "细胞衰老研究中有几个关键标志物：线粒体功能障碍、细胞氧化应激、慢性炎症。辅酶Q10恰好参与这三个机制——作为电子传递链核心辅酶支持线粒体功能、作为脂溶性抗氧化剂清除自由基、多项研究显示外源性辅酶Q10补充可降低氧化应激标志物。这不是延缓衰老的营销话术，而是有机制基础的生理支持。",
        highlight: {
          icon: "🔬",
          title: "科学机制",
          text: "辅酶Q10参与细胞能量代谢（ATP合成）、抗氧化防御和线粒体功能维护。随年龄增长，内源性辅酶Q10合成下降，适量补充是合理的营养策略，但具体效果因人而异，需结合整体健康状况评估。",
        },
      },
      {
        heading: "35岁后，补充辅酶Q10的合适剂量",
        content: "30-40岁预防性补充：每天100mg还原型，随早餐服用。40-50岁有疲劳感或心血管风险：每天100-200mg。50岁以上或已有心脏问题：每天200mg（在医生指导下）。长期主义者可以把它当作细胞充电桩，每天为身体充一点电，积累长期保护价值。",
      },
    ],
    relatedPlan: "cardio",
    recommendation: {
      title: "内调抗衰组合",
      subtitle: "荣旺 · 内调抗衰与身材管理方案",
      reason: "文章把辅酶Q10定位为35+人群的细胞充电桩，荣旺内调抗衰方案针对35-50岁人群设计，涵盖辅酶Q10、NAD+支持、代谢优化多维度，由顾问根据体检指标定制，不是买一瓶辅酶Q10就完事。",
      planSlug: "cardio",
      products: [
        { name: "UNCLE DARREN'S ATP 细胞营养胶囊", sku: "UD-ATP-001", tagline: "细胞线粒体充电桩，35+抗衰首选", price: 1480 },
        { name: "UNCLE DARREN'S Heart Defender 男士心血管营养包", sku: "UD-HD-MEN-001", tagline: "辅酶Q10支持心脏，由内而外抗衰", price: 529 },
        { name: "UNCLE DARREN'S Joint Guardian Plus 女士骨骼关节营养包", sku: "UD-JG-WOMEN-001", tagline: "含胶原蛋白支持因子，皮肤+骨骼双支持", price: 399 },
      ],
    },
  },

  {
    title: "奶蓟草护肝：科学真相与选购参考",
    slug: "milk-thistle-truth",
    excerpt: "水飞蓟宾是护肝明星成分，但市面上产品质量参差不齐，有效成分含量差异高达10倍。",
    category: "营养科普",
    readTime: "6分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-amber-400 to-orange-500",
    author: "运营官Darren",
    sections: [
      {
        heading: "奶蓟草为什么被认为是护肝神器",
        content: "奶蓟草（学名：Silybum marianum）的主要活性成分是水飞蓟宾（Silymarin），这是一种黄酮木脂素混合物，具有明确的抗氧化和肝细胞保护作用。欧洲将其作为处方药用于酒精性肝病和病毒性肝炎的辅助治疗，有数十年的临床使用历史。作用机制：稳定肝细胞膜、清除自由基、刺激肝细胞蛋白合成、促进肝细胞再生。",
        highlight: {
          icon: "🛡️",
          title: "水飞蓟宾含量是核心指标",
          text: "购买时要认准水飞蓟宾含量和标准化提取物标识。很多廉价产品只标注奶蓟草提取物，有效成分含量极低。优质产品的水飞蓟宾含量应在70-80%以上。",
        },
      },
      {
        heading: "选对剂型，效果差10倍",
        content: "水飞蓟宾是脂溶性成分，普通片剂吸收率极低（约3-5%）。磷脂复合物（Phosphatidylcholine complex）制剂可将吸收率提升至原来的4-5倍。乐蓓宁（Silipide）等专利成分更是将生物利用率提升了10倍。所以买奶蓟草产品不能只看价格和含量，剂型才是关键。",
      },
      {
        heading: "什么人适合吃",
        content: "适合：经常饮酒人群、有脂肪肝倾向（非酒精性脂肪肝）、长期服药需保护肝脏、病毒性肝炎辅助治疗。不适合：肝脏已出现严重问题（肝硬化、腹水）需立即就医、孕期、哺乳期（安全性数据不足）。护肝最有效的方式永远是减少伤害源头，奶蓟草是补漏而非放纵的工具。",
      },
    ],
    relatedPlan: "liver",
    recommendation: {
      title: "商务护肝组合",
      subtitle: "荣旺 · 应酬与熬夜护肝方案",
      reason: "文章详解水飞蓟宾的选择要点（含量+剂型），荣旺护肝方案确保水飞蓟宾标准化提取物含量合规，由顾问说明产品的磷脂复合物工艺，不是一瓶奶蓟草胶囊就打发，而是有成分背书的护肝方案。",
      planSlug: "liver",
      products: [
        { name: "UNCLE DARREN'S Heart Defender 男士心血管营养包", sku: "UD-HD-MEN-001", tagline: "含奶蓟草提取物，应酬族护肝标配", price: 529 },
        { name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包", sku: "UD-BB-MEN-001", tagline: "含B族+适应原，护肝同时减压", price: 526 },
      ],
    },
  },

  {
    title: "免疫力最该补什么？维C、维D、锌、β-葡聚糖全解析",
    slug: "immune-support-complete",
    excerpt: "免疫力是个系统，不是单一成分能撑起来的。讲清楚四种关键免疫营养素的作用与搭配。",
    category: "免疫防护",
    readTime: "6分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-blue-400 to-cyan-500",
    author: "运营官Darren",
    sections: [
      {
        heading: "免疫力不是一个东西，是一套系统",
        content: "很多人说免疫力低，但免疫力低下是个模糊概念——它可能指：上皮屏障薄弱（容易感冒）、免疫细胞功能下降（T细胞、NK细胞活性低）、抗氧化能力不足（慢性炎症状态）。不同类型的免疫弱点，对应的营养支持完全不同。笼统说增强免疫力是不严谨的。",
        highlight: {
          icon: "🧬",
          title: "四类免疫弱点，对应四种营养支持",
          text: "上皮屏障弱用维C加维D；免疫细胞活性低用锌加β-葡聚糖；慢性炎症用Omega-3加硒；氧化应激用辅酶Q10加维C。不是全部一起吃，而是先评估自己的薄弱环节。",
        },
      },
      {
        heading: "维生素C：最被低估的免疫基石",
        content: "维C支持免疫的机制常被低估：它是中性粒细胞趋化的必需因子（免疫细胞到场才有效）；参与上皮屏障胶原蛋白合成（维持皮肤和黏膜完整性）；作为抗氧化剂保护免疫细胞免受自身氧化损伤。循证剂量：每天200-500mg（超过1000mg的剂量多余排出）。橙子、彩椒、西兰花食补优先，补剂是辅助。",
      },
      {
        heading: "维生素D：免疫调节的核心开关",
        content: "维D不只是补钙的营养素。维生素D受体（VDR）在所有免疫细胞上表达，维D通过调控基因表达调节先天免疫和适应性免疫。数据显示：维D不足人群感染风险升高、自身免疫病发病率上升。检测血清25-OH-D3水平，低于30ng/mL建议补充，目标值40-60ng/mL。剂量：每天2000-4000IU，南方居民可减量。",
      },
      {
        heading: "锌：免疫细胞发育的必需品",
        content: "锌参与200多种酶反应，其中胸腺发育、T细胞成熟、巨噬细胞功能都离不开锌。缺锌的典型表现：伤口愈合慢、反复感染、味觉减退。补充剂量：每天15-30mg（不要和铁剂同时服用，会竞争吸收）。贝类、红肉、南瓜子是食物来源。",
      },
      {
        heading: "酵母β-葡聚糖：免疫系统的训练师",
        content: "β-葡聚糖是一种益生元纤维，来源包括酵母、燕麦、菌菇。其中酵母β-葡聚糖（1-3, 1-6支链）有最多临床数据，机制是训练免疫系统——激活树突状细胞，提升NK细胞（自然杀伤细胞）活性，让免疫细胞在遇到真实病原体时反应更快。不是直接杀死病原体，而是让免疫系统保持战备状态。",
      },
    ],
    relatedPlan: "immune",
    recommendation: {
      title: "免疫防护组合",
      subtitle: "荣旺 · 免疫防线薄弱型方案",
      reason: "文章详解四类免疫营养素的不同作用，荣旺免疫方案由AI健康顾问评估用户的免疫薄弱类型，再匹配对应的成分组合——不是免疫产品大杂烩，而是先评估后精准搭配。",
      planSlug: "immune",
      products: [
        { name: "UNCLE DARREN'S Digestive Elite Care 男士肠道营养包", sku: "UD-DE-MEN-001", tagline: "肠道=免疫系统70%所在，β-葡聚糖来源", price: 399 },
        { name: "UNCLE DARREN'S Digestive Elite Care 女士肠道营养包", sku: "UD-DE-WOMEN-001", tagline: "肠道=免疫系统70%所在，β-葡聚糖来源", price: 399 },
        { name: "UNCLE DARREN'S Brain Boost Max 女士脑部营养包", sku: "UD-BB-WOMEN-001", tagline: "含锌和B族，免疫细胞发育支持", price: 526 },
      ],
    },
  },

  {
    title: "NAD+和NMN：科学进展与实际应用参考",
    slug: "nmn-anti-aging-truth",
    excerpt: "NMN是近两年最火的抗衰老补充剂，价格不菲。讲清楚它的机制、证据等级、和真实期望值。",
    category: "压力缓解",
    readTime: "7分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-pink-400 to-rose-500",
    author: "运营官Darren",
    sections: [
      {
        heading: "NAD+为什么被和抗衰老绑在一起",
        content: "NAD+是细胞内最重要的辅酶之一，参与能量代谢、DNA修复、细胞应激响应。随着年龄增长，NAD+水平以每年约5%的速度下降，这是衰老过程中细胞功能下降的重要原因之一。动物实验显示：补充NAD+前体（如NMN、NR）可以提升组织NAD+水平、改善线粒体功能、延长小鼠寿命。这些发现让人对NAD+前体在人类抗衰老中的应用充满期待。",
        highlight: {
          icon: "⚠️",
          title: "动物实验到人类：差距有多大",
          text: "NMN在小鼠中效果显著，但小鼠和人类的代谢、衰老进程差异很大。目前NMN在人类中的高质量随机对照试验数量有限，样本量小、随访时间短。谨慎乐观，不建议投入过高的期望和资金。",
        },
      },
      {
        heading: "NMN和NR哪个更好",
        content: "NMN（烟酰胺单核苷酸）和NR（烟酰胺核糖）是NAD+的前体，各有优势。NR的优势：研究历史更长（有多项人体安全性数据）、价格相对便宜。NMN的优势：更接近NAD+、部分研究显示生物利用率更高。两者在体内最终都转化为NAD+，目前没有头对头研究证明哪个在人体内效果更优。合规品牌加合理价格是选产品的首要标准。",
      },
      {
        heading: "什么人可以考虑NAD+前体",
        content: "值得关注的群体：40岁以上有精力下降感、代谢功能减弱（体重增加、血糖管理困难）、有长寿追求且经济条件允许。对于30岁以下健康人群，内源性合成能力足够，不需要补充。补充时机：建议在有检测数据（血液NAD+水平）支撑下使用，而非盲目跟风。",
      },
      {
        heading: "合规问题：NMN在中国是灰色地带",
        content: "重要提醒：NMN在中国未被批准为食品原料或保健食品原料，国内销售的NMN产品多为跨境进口或灰色渠道。购买时确认原产国认证，并确认有正规跨境清关记录。",
      },
    ],
    relatedPlan: "beauty",
    recommendation: {
      title: "内调抗衰组合",
      subtitle: "荣旺 · 内调抗衰与身材管理方案",
      reason: "文章对NMN抗衰老持谨慎态度，荣旺抗衰方案同样建议先检测再补充，不盲目推荐NMN。方案涵盖辅酶Q10、NAD+支持（通过其他前体）、Omega-3等多维度，由顾问根据用户的体检指标和经济预算提供理性建议。",
      planSlug: "beauty",
      products: [
        { name: "UNCLE DARREN'S ATP 细胞营养胶囊", sku: "UD-ATP-001", tagline: "细胞能量支持，NAD+代谢通路辅助", price: 1480 },
        { name: "UNCLE DARREN'S Heart Defender 女士心血管营养包", sku: "UD-HD-WOMEN-001", tagline: "辅酶Q10+Omega-3，线粒体抗衰", price: 529 },
        { name: "UNCLE DARREN'S Joint Guardian Plus 女士骨骼关节营养包", sku: "UD-JG-WOMEN-001", tagline: "皮肤弹性+骨骼健康，内外双抗", price: 399 },
      ],
    },
  },

  {
    title: "GABA和褪黑素：失眠首选哪个？一文说清楚",
    slug: "gaba-melatonin-sleep",
    excerpt: "都是助眠成分，但作用机制完全不同，适用人群也不同。选错可能没效果，还可能干扰睡眠。",
    category: "深度睡眠",
    readTime: "5分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-indigo-400 to-purple-500",
    author: "运营官Darren",
    sections: [
      {
        heading: "褪黑素：适合倒班和时差，不适合焦虑型失眠",
        content: "褪黑素是松果体分泌的激素，调控昼夜节律。外源性褪黑素适合以下场景：倒班工作（日夜颠倒）、跨时区旅行（倒时差）、老年人褪黑素自然分泌下降（60岁以上）。不适合：压力焦虑导致的失眠（根本问题没解决，褪黑素只是强行改变节律）。剂量：0.5-3mg足够，超过5mg不增加效果。",
        highlight: {
          icon: "🌙",
          title: "褪黑素使用时机很重要",
          text: "正确：睡前30-60分钟服用，服药后避免强光（手机、电视）。错误：躺下后才吃，或与咖啡因一起服用。褪黑素是调节节律的工具，不是安眠药。",
        },
      },
      {
        heading: "GABA：神经兴奋抑制，适合焦虑型失眠",
        content: "GABA（γ-氨基丁酸）是中枢神经系统的主要抑制性神经递质，起到神经刹车作用。焦虑型失眠（脑子里停不下来、睡前反复思考工作）往往伴有GABA功能不足。补充GABA可以降低皮质醇水平、减轻焦虑感，帮助大脑从兴奋模式切换到放松模式。有研究显示GABA在服用后30分钟内可增加阿尔法脑波（放松状态）。",
      },
      {
        heading: "两者可以一起用吗",
        content: "可以，但针对不同问题：褪黑素管节律（生物钟混乱），GABA管神经兴奋（焦虑紧张）。如果你的失眠同时有节律问题和焦虑问题，两者联合使用是合理的。但要注意：GABA有轻度的镇静作用，服用后30分钟内避免开车或操作机械。",
      },
    ],
    relatedPlan: "sleep",
    recommendation: {
      title: "深度睡眠组合",
      subtitle: "荣旺 · 神经兴奋型失眠方案",
      reason: "文章区分GABA和褪黑素的不同适用场景，荣旺睡眠方案由顾问评估失眠类型——焦虑型推荐GABA，节律型推荐褪黑素，不是两种一起卖，而是先评估再匹配，先评估后购买。",
      planSlug: "sleep",
      products: [
        { name: "UNCLE DARREN'S Brain Boost Max 女士脑部营养包", sku: "UD-BB-WOMEN-001", tagline: "含GABA+镁，非褪黑素型失眠首选", price: 526 },
        { name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包", sku: "UD-BB-MEN-001", tagline: "含GABA+镁，非褪黑素型失眠首选", price: 526 },
      ],
    },
  },

  {
    title: "B族维生素：日常营养支持的重要性",
    slug: "b-vitamins-complete",
    excerpt: "B族是能量代谢的必需辅酶，缺乏时疲劳但检查不出来。讲清楚8种B族各自的作用和搭配原则。",
    category: "营养科普",
    readTime: "6分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-yellow-400 to-amber-500",
    author: "运营官Darren",
    sections: [
      {
        heading: "B族为什么容易缺乏",
        content: "B族维生素是水溶性的，身体不储存（多余的通过尿液排出），需要每天补充。这本来不是问题，但现代饮食有几个特点导致B族普遍缺乏：精制碳水吃得多（全谷物到精米面，B族损失70%以上）；喝酒（乙醇代谢消耗B1）；压力（应激时B族消耗增加3-5倍）；某些药物（质子泵抑制剂、二甲双胍影响B12吸收）。",
        highlight: {
          icon: "💡",
          title: "B族要一起吃才有效",
          text: "B族8种维生素在体内协同作用，单独补充某一种可能打乱平衡，引起其他B族的相对缺乏。选复合B族比单独补某一种更合理。",
        },
      },
      {
        heading: "最关键的B族：B1、B2、B6、B12、叶酸",
        content: "B1（硫胺素）：能量代谢第一步，喝酒、高糖人群最缺。B2（核黄素）：皮肤黏膜健康、头痛相关。B6：氨基酸代谢、血清素合成（情绪相关）。B12：红细胞生成、神经系统维护，素食者最容易缺（只存在于动物性食物）。叶酸（B9）：DNA合成，备孕期必需，与B12共同促进红细胞生成。",
      },
      {
        heading: "怎么知道自己缺不缺",
        content: "轻度缺乏通常没有明显症状，或只有非特异性的疲劳感、情绪波动。如果有以下情况建议考虑补充：长期大量喝酒、严格素食、压力持续6个月以上、服用二甲双胍或质子泵抑制剂、40岁以上（吸收能力下降）。最准确的是血清B12和同型半胱氨酸检测。",
      },
    ],
    relatedPlan: "fatigue",
    recommendation: {
      title: "抗疲劳组合",
      subtitle: "荣旺 · 高压力 + 营养流失型方案",
      reason: "文章强调B族要一起补才有效，荣旺抗疲劳方案中的Brain Boost系列含有活性B族复合配方，由顾问根据用户的压力类型和饮酒习惯推荐，不是单一B族，而是一套协同配方。",
      planSlug: "fatigue",
      products: [
        { name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包", sku: "UD-BB-MEN-001", tagline: "活性B族复合，高压/喝酒人群必补", price: 526 },
        { name: "UNCLE DARREN'S Brain Boost Max 女士脑部营养包", sku: "UD-BB-WOMEN-001", tagline: "活性B族复合，高压/喝酒人群必补", price: 526 },
        { name: "UNCLE DARREN'S Joint Guardian Plus 男士骨骼关节营养包", sku: "UD-JG-MEN-001", tagline: "含镁，与B族协同支持神经", price: 399 },
      ],
    },
  },

  {
    title: "Omega-3深海鱼油：心血管健康的营养支持参考",
    slug: "omega-3-cardio-truth",
    excerpt: "鱼油研究几十年，争议和营销一样多。梳理清楚EPA、DHA区别、纯度标准、和真实证据强度。",
    category: "营养科普",
    readTime: "6分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-teal-400 to-cyan-500",
    author: "运营官Darren",
    sections: [
      {
        heading: "EPA和DHA：不是一回事",
        content: "Omega-3的主要成分是EPA（二十碳五烯酸）和DHA（二十二碳六烯酸）。EPA偏向抗炎和心血管保护，DHA偏向脑功能和视力。鱼油产品有高EPA和高DHA不同配方，针对不同需求：心血管预防选高EPA（如Vascepa，处方药级别）；脑功能、记忆选高DHA；复合需求两者兼顾。",
        highlight: {
          icon: "🐟",
          title: "纯度比剂量更重要",
          text: "很多廉价鱼油的实际Omega-3含量只有30%，剩下70%是杂质和饱和脂肪。认准独立第三方检测（IFOS认证是鱼油行业最权威认证）和纯度超过80%的产品。",
        },
      },
      {
        heading: "每天该吃多少",
        content: "心血管预防研究使用的剂量通常在每天1000-4000mg Omega-3（EPA加DHA总量）。日常保健：每天1000-2000mg是合理起始剂量。如果在服用阿司匹林或华法林等抗凝药，高剂量Omega-3有出血风险增加的可能，需要医生评估。",
      },
      {
        heading: "他汀加鱼油：联合使用合理吗",
        content: "合理。他汀降低LDL-C，鱼油主要降低甘油三酯（他汀对甘油三酯效果有限），两者针对不同血脂指标。2019年REDUCE-IT研究（他汀基础上加4g每天Vascepa EPA）显示心血管事件减少25%，这是处方药级别的高剂量研究。低剂量鱼油保健品替代不了这个效果，但作为日常预防是合理的。",
      },
    ],
    relatedPlan: "cardio",
    recommendation: {
      title: "心脑调理组合",
      subtitle: "荣旺 · 心脑血管与三高调理方案",
      reason: "文章强调鱼油纯度比剂量更重要，荣旺Heart Defender产品标注IFOS认证批次，纯度可查，由顾问说明EPA/DHA配比选择依据，不是笼统说鱼油好，而是讲清楚哪个配方适合你。",
      planSlug: "cardio",
      products: [
        { name: "UNCLE DARREN'S Heart Defender 男士心血管营养包", sku: "UD-HD-MEN-001", tagline: "Omega-3（EPA为主）+辅酶Q10，心血管双保险", price: 529 },
        { name: "UNCLE DARREN'S Heart Defender 女士心血管营养包", sku: "UD-HD-WOMEN-001", tagline: "Omega-3（EPA为主）+辅酶Q10，心血管双保险", price: 529 },
        { name: "UNCLE DARREN'S ATP 细胞营养胶囊", sku: "UD-ATP-001", tagline: "线粒体能量支持，与鱼油协同", price: 1480 },
      ],
    },
  },

  {
    title: "关节痛怎么办？氨基葡萄糖真实效果盘点",
    slug: "glucosamine-joint-truth",
    excerpt: "氨基葡萄糖是软骨基质的主要成分，但临床效果存在争议。讲清楚什么人吃了有效、什么人吃了浪费钱。",
    category: "营养科普",
    readTime: "5分钟",
    publishedAt: "2026-06-08",
    coverColor: "from-slate-400 to-slate-600",
    author: "运营官Darren",
    sections: [
      {
        heading: "氨基葡萄糖是什么，原理是什么",
        content: "氨基葡萄糖（Glucosamine）是软骨基质蛋白聚糖的前体，理论上补充可以支持软骨合成、抑制软骨降解。口服后约10-15%能够到达关节软骨，这个比例不高，但长期积累可能有一定效果。硫酸氨基葡萄糖（Glucosamine Sulfate）和盐酸氨基葡萄糖（Glucosamine HCl）是两种常见形式，硫酸型有稍好的临床数据支持。",
        highlight: {
          icon: "🏃",
          title: "什么人吃了有效",
          text: "临床研究显示：早期膝关节骨关节炎（轻度到中度）患者，疼痛缓解效果优于安慰剂；老年人、长期运动损伤人群效果更明显。对于晚期软骨严重磨损、需手术干预的情况，营养补充剂基本无效。",
        },
      },
      {
        heading: "争议：临床试验结论不一致",
        content: "氨基葡萄糖的临床研究结论分歧很大。支持的Meta分析显示轻中度OA患者有疼痛改善和功能提升。质疑的观点认为很多研究有赞助商偏移（funded by supplement companies），高质量独立研究效果不明显。建议：可以尝试，如果3个月内没有改善就停掉，不需要长期执念。",
      },
      {
        heading: "软骨素和MSM：搭配有用吗",
        content: "硫酸软骨素（Chondroitin Sulfate）：维持软骨弹性，抑制降解酶，与氨基葡萄糖有协同作用。MSM（甲基磺酰甲烷）：有机硫，提供软骨甲基化支持，有轻度的抗炎作用。这三个成分经常作为关节保健三合一出现，组合使用的临床数据比单独氨基葡萄糖略好，但价格也更高。经济条件允许可以考虑复合配方。",
      },
    ],
    relatedPlan: "fatigue",
    recommendation: {
      title: "抗疲劳组合",
      subtitle: "荣旺 · 高压力 + 营养流失型方案",
      reason: "文章对氨基葡萄糖持尝试性态度，荣旺关节方案同样建议先评估再使用，由顾问根据用户的关节症状（早期OA vs 严重磨损）提供不同建议，不是一上来就推荐长期服用。",
      planSlug: "fatigue",
      products: [
        { name: "UNCLE DARREN'S Joint Guardian Plus 男士骨骼关节营养包", sku: "UD-JG-MEN-001", tagline: "含氨基葡萄糖+软骨素+MSM，关节三合一", price: 399 },
        { name: "UNCLE DARREN'S Joint Guardian Plus 女士骨骼关节营养包", sku: "UD-JG-WOMEN-001", tagline: "含氨基葡萄糖+软骨素+MSM，关节三合一", price: 399 },
        { name: "UNCLE DARREN'S Brain Boost Max 男士脑部营养包", sku: "UD-BB-MEN-001", tagline: "含B族和镁，与关节营养协同", price: 526 },
      ],
    },
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug);
}
export interface ContentTopic {
  id: string;
  // 选题分类
  category: 'SEO文章' | '小红书种草' | '抖音脚本' | '公众号推文' | '邮件营销' | '案例故事';
  // 对应场景
  solutionSlug?: string;
  // 内容主题
  title: string;
  // SEO关键词
  keywords: string[];
  // 内容概要（50字以内）
  summary: string;
  // 发布优先级
  priority: 1 | 2 | 3; // 1=最高
  // 预计字数
  wordCount?: number;
  // 内容类型
  contentType: '教育科普' | '产品种草' | '用户故事' | '热点借势' | '清单攻略' | '对比评测';
}

export const contentTopics: ContentTopic[] = [
  // ===== SEO文章（深度内容，1000-2000字） =====
  {
    id: 'seo-001',
    category: 'SEO文章',
    solutionSlug: 'sleep',
    title: '入睡困难怎么办？营养师教你从根源改善睡眠质量',
    keywords: ['入睡困难', '睡眠质量差怎么调理', '甘氨酸镁助眠', 'GABA睡眠', '睡眠障碍自疗'],
    summary: '深度解析入睡困难的生理机制，区分GABA不足vs皮质醇过高vs昼夜节律紊乱，给出分型调理方案',
    priority: 1,
    wordCount: 1800,
    contentType: '教育科普',
  },
  {
    id: 'seo-002',
    category: 'SEO文章',
    solutionSlug: 'fatigue',
    title: '总是疲劳犯困？可能是线粒体能量不足在作祟',
    keywords: ['疲劳犯困', '慢性疲劳调理', '辅酶Q10功效', 'B族维生素抗疲劳', '能量代谢'],
    summary: '从细胞能量角度解析疲劳的6种类型，给出营养补充+生活方式综合方案',
    priority: 1,
    wordCount: 2000,
    contentType: '教育科普',
  },
  {
    id: 'seo-003',
    category: 'SEO文章',
    solutionSlug: 'liver',
    title: '喝酒应酬后如何科学护肝？营养师详解水飞蓟宾与NAC',
    keywords: ['护肝', '水飞蓟宾', 'NAC乙酰半胱氨酸', '酒精肝', '解酒护肝'],
    summary: '详解酒精代谢过程和水飞蓟+NAC协同护肝机制，对比普通奶蓟草产品的差距',
    priority: 1,
    wordCount: 1600,
    contentType: '教育科普',
  },
  {
    id: 'seo-004',
    category: 'SEO文章',
    solutionSlug: 'immune',
    title: '维生素D3不只是补钙：重新认识D3在免疫力中的核心作用',
    keywords: ['维生素D3', 'D3免疫力', '维生素K2', 'D3K2协同', '日常免疫'],
    summary: 'D3在先天免疫中的分子机制，K2引钙入骨的协同作用，以及D3K2的最佳补充方案',
    priority: 1,
    wordCount: 1500,
    contentType: '教育科普',
  },
  {
    id: 'seo-005',
    category: 'SEO文章',
    title: '为什么你买的鱼油没效果？Omega-3怎么选才不踩坑',
    keywords: ['鱼油选购', 'Omega-3功效', 'EPA DHA', '鱼油氧化', '高纯度鱼油'],
    summary: '从EPA/DHA比例、纯度、氧化程度、来源四个维度教你选对鱼油，不被劣质产品坑',
    priority: 2,
    wordCount: 1400,
    contentType: '对比评测',
  },
  {
    id: 'seo-006',
    category: 'SEO文章',
    solutionSlug: 'female-health',
    title: '经期前后疲劳怎么办？铁、叶酸、B族的协同补养指南',
    keywords: ['经期疲劳', '补铁', '叶酸', '经前综合征', '女性营养'],
    summary: '经期失血导致缺铁的机制，氨基酸螯合铁vs普通铁剂区别，以及B族对经前综合征的改善作用',
    priority: 2,
    wordCount: 1300,
    contentType: '教育科普',
  },
  {
    id: 'seo-007',
    category: 'SEO文章',
    solutionSlug: 'male-health',
    title: '南非醉茄：风靡欧美的适应原，对男性压力与精力的真实效果',
    keywords: ['南非醉茄', '适应原', '男性精力', '抗压', 'KSM-66'],
    summary: '南非醉茄的HSPA热休克蛋白机制，对皮质醇/睾酮/运动表现的影响，以及玛卡的区别',
    priority: 2,
    wordCount: 1400,
    contentType: '教育科普',
  },
  {
    id: 'seo-008',
    category: 'SEO文章',
    title: '褪黑素能不能长期吃？和GABA、甘氨酸镁的区别是什么',
    keywords: ['褪黑素', 'GABA助眠', '甘氨酸镁', '睡眠补充剂对比', '褪黑素副作用'],
    summary: '褪黑素是激素而非营养素，长期使用风险，对比GABA/甘氨酸镁/茶氨酸三种安全替代方案',
    priority: 2,
    wordCount: 1200,
    contentType: '对比评测',
  },

  // ===== 小红书种草（500-800字，高颜值图文） =====
  {
    id: 'xhs-001',
    category: '小红书种草',
    solutionSlug: 'sleep',
    title: '协和营养师开的睡眠方案！终于告别失眠了😭',
    keywords: ['睡眠', '失眠', '甘氨酸镁', '助眠好物', '睡眠质量'],
    summary: '博主亲身经历：压力大失眠3个月，吃褪黑素有副作用，换成甘氨酸镁+GABA后终于改善，配合睡眠卫生教育',
    priority: 1,
    contentType: '用户故事',
  },
  {
    id: 'xhs-002',
    category: '小红书种草',
    solutionSlug: 'immune',
    title: '换季不再感冒！这个D3+K2组合真的有用',
    keywords: ['D3K2', '换季感冒', '免疫力', '儿童免疫力', '日常保健'],
    summary: '宝宝换季必感冒的痛点，补充D3+K2后的改善对比，搭配益生菌的效果叠加',
    priority: 1,
    contentType: '产品种草',
  },
  {
    id: 'xhs-003',
    category: '小红书种草',
    solutionSlug: 'liver',
    title: '应酬党必备护肝组合！酒后第二天满血复活',
    keywords: ['护肝', '应酬', '水飞蓟', '酒后勤护肝', '职场健康'],
    summary: '应酬多的博主真实分享：水飞蓟宾+NAC组合，酒后第二天不再萎靡，附护肝生活习惯',
    priority: 1,
    contentType: '产品种草',
  },
  {
    id: 'xhs-004',
    category: '小红书种草',
    title: 'B族维生素怎么选？这篇帮你避坑',
    keywords: ['B族维生素', '维生素B', 'B族怎么吃', '疲劳', '熬夜恢复'],
    summary: '单一B族vs复合B族的区别，酵母提取vs化学合成，哪个牌子性价比高',
    priority: 2,
    contentType: '清单攻略',
  },
  {
    id: 'xhs-005',
    category: '小红书种草',
    solutionSlug: 'female-health',
    title: '气色差、掉头发？可能是缺铁！补铁3个月真实记录',
    keywords: ['补铁', '缺铁', '女性补铁', '气色差', '掉头发'],
    summary: '30+女性缺铁的典型症状，补铁3个月的脸色/精力改善记录，附体检指标对比',
    priority: 2,
    contentType: '用户故事',
  },

  // ===== 抖音脚本（60秒，完播率导向） =====
  {
    id: 'dy-001',
    category: '抖音脚本',
    solutionSlug: 'sleep',
    title: '睡眠质量差的3个身体信号，超过2个就要注意了',
    keywords: ['睡眠', '健康', '中医', '养生'],
    summary: '开头钩子：你睡够8小时还是累？可能是这3个问题 → 1. 入睡困难（甘氨酸镁方向）2. 夜间易醒（GABA方向）3. 皮质醇过高 → 行动号召',
    priority: 1,
    contentType: '教育科普',
  },
  {
    id: 'dy-002',
    category: '抖音脚本',
    solutionSlug: 'fatigue',
    title: '总犯困不是懒，是细胞能量不足',
    keywords: ['疲劳', '犯困', '健康', '辅酶Q10'],
    summary: '开头钩子：你每天下午3点犯困，其实不是懒，是线粒体在求救 → 解决方案：辅酶Q10+B族 → 行动号召',
    priority: 1,
    contentType: '教育科普',
  },
  {
    id: 'dy-003',
    category: '抖音脚本',
    solutionSlug: 'immune',
    title: '换季容易感冒？可能是缺D3',
    keywords: ['感冒', '免疫力', '维生素D', 'D3'],
    summary: '开头钩子：为什么同样换季，别人不感冒你却中招？ → D3在免疫中的核心作用 → K2的协同 → 行动号召',
    priority: 1,
    contentType: '教育科普',
  },
  {
    id: 'dy-004',
    category: '抖音脚本',
    solutionSlug: 'liver',
    title: '应酬后这个动作，比喝蜂蜜水管用10倍',
    keywords: ['护肝', '应酬', '健康', '解酒'],
    summary: '开头钩子：应酬后千万别做这3件事 → 解酒护肝的正确顺序 → NAC+水飞蓟宾的作用 → 行动号召',
    priority: 2,
    contentType: '清单攻略',
  },

  // ===== 公众号推文（1500-2000字，深度阅读） =====
  {
    id: 'mp-001',
    category: '公众号推文',
    title: '荣旺健康2024年度复盘：5000+用户的精准营养之旅',
    keywords: ['荣旺健康', '年度复盘', '精准营养', '用户故事'],
    summary: '年度回顾：5000+用户评估数据分享，最受欢迎的方案TOP3，真实用户案例故事（4个案例精简版），新年健康建议',
    priority: 1,
    wordCount: 2000,
    contentType: '用户故事',
  },
  {
    id: 'mp-002',
    category: '公众号推文',
    title: '如何科学地选择营养补充剂？从评估到购买的完整指南',
    keywords: ['营养补充剂', '选购指南', '科学补充', '荣旺评估'],
    summary: '为什么不能直接推荐产品？营养补充的个体差异，AI评估的价值，如何在荣旺获得个性化方案',
    priority: 2,
    wordCount: 1800,
    contentType: '教育科普',
  },

  // ===== 邮件营销（欢迎序列/促销） =====
  {
    id: 'email-001',
    category: '邮件营销',
    title: '欢迎邮件：你的个性化健康方案已生成',
    solutionSlug: 'sleep',
    keywords: ['欢迎', '邮件', '健康评估'],
    summary: '新订阅用户欢迎序列第1封：介绍荣旺评估流程，引导完成AI自测，附睡眠基础调理清单',
    priority: 1,
    contentType: '教育科普',
  },
  {
    id: 'email-002',
    category: '邮件营销',
    title: '沉睡克星：为什么你的褪黑素越吃越不管用？',
    solutionSlug: 'sleep',
    keywords: ['睡眠', '褪黑素', '邮件', '内容营销'],
    summary: '教育邮件：褪黑素局限性 vs GABA/甘氨酸镁安全性，对比表格，行动号召引导评估',
    priority: 2,
    contentType: '对比评测',
  },
];

export function getTopicsByCategory(category: ContentTopic['category']): ContentTopic[] {
  return contentTopics.filter((t) => t.category === category);
}

export function getTopicsBySlug(slug: string): ContentTopic[] {
  return contentTopics.filter((t) => t.solutionSlug === slug);
}

export function getHighPriorityTopics(): ContentTopic[] {
  return contentTopics.filter((t) => t.priority === 1);
}

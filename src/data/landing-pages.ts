/**
 * 荣旺健康 · 预制 SEO 落地页
 *
 * 由一辉智能体基于高意图关键词生成，用于投放和有机搜索。
 * 每个页面可由 /api/marketing/landing 重新生成并追加到此列表。
 */

export interface LandingContent {
  metaTitle: string;
  metaDescription: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  painPoints: string[];
  solution: { title: string; description: string; bullets: string[] };
  benefits: Array<{ icon: string; title: string; description: string }>;
  howItWorks: Array<{ step: number; title: string; description: string }>;
  faqs: Array<{ q: string; a: string }>;
  finalCta: { title: string; subtitle: string; buttonText: string };
}

export interface LandingPage {
  slug: string;
  keyword: string;
  audience: string;
  content: LandingContent;
}

export const landingPages: LandingPage[] = [
  {
    slug: 'women-fatigue',
    keyword: '女性抗疲劳保健品',
    audience: '25-40 岁都市职场女性',
    content: {
      metaTitle: "女性抗疲劳保健品怎么选？AI 科学方案 | 1970 Uncle Darren's",
      metaDescription:
        '长期疲劳、月经后乏力、下午精力断层？荣旺 AI 3 分钟测评，基于你的身体状态匹配临床级抗疲劳方案。香港直邮，30 天无忧退款。',
      hero: {
        eyebrow: '专为都市女性设计',
        title: '告别"续命式咖啡"，从根源修复能量',
        subtitle: 'AI 为你精准匹配 B 族 + 螯合铁 + 适应原方案，3 周重获稳定精力',
        ctaPrimary: '3 分钟免费 AI 测评',
        ctaSecondary: '查看抗疲劳方案',
      },
      painPoints: [
        '每天下午 3 点准时犯困，靠咖啡硬撑',
        '经期前后格外疲惫，情绪起伏大',
        '运动后恢复越来越慢，身体发沉',
        '睡了 8 小时醒来依然没精神',
      ],
      solution: {
        title: '女性疲劳，80% 与隐性缺铁和 B 族流失相关',
        description:
          '研究显示，育龄女性铁储备常处于边缘区间。荣旺抗疲劳方案通过甘氨酸亚铁（不刺激肠胃）+ 活性 B 族 + 红景天适应原三重组合，从能量代谢源头修复。',
        bullets: [
          '温和不便秘的螯合铁配方',
          '甲基化 B 族 · 直接参与 ATP 生产',
          '红景天 · 改善心理耐力',
        ],
      },
      benefits: [
        { icon: '⚡', title: '精力稳定', description: '14 天感知下午不再犯困' },
        { icon: '🌸', title: '经期友好', description: '缓解经期乏力与情绪波动' },
        { icon: '🧠', title: '专注力提升', description: '告别脑雾，思维更清晰' },
        { icon: '💪', title: '恢复加速', description: '运动后酸胀明显减轻' },
      ],
      howItWorks: [
        { step: 1, title: '3 分钟测评', description: '回答 12 个关于精力与月经周期的问题' },
        { step: 2, title: 'AI 匹配方案', description: '算法根据你的症状生成个性化组合' },
        { step: 3, title: '直邮到家', description: '3-5 天收到你的 30 天方案' },
      ],
      faqs: [
        { q: '多久能感受到效果？', a: '大部分女性用户在 14-21 天开始感受到精力改善。' },
        { q: '经期可以吃吗？', a: '可以，方案专门考虑了女性生理周期需求。' },
        { q: '会不会便秘？', a: '使用的甘氨酸亚铁是螯合形式，比硫酸亚铁温和 10 倍。' },
        { q: '可以和避孕药一起吃吗？', a: '一般可以，但建议先咨询妇科医生确认。' },
        { q: '不适合哪些人？', a: '血色病、甲亢患者请先咨询医生。孕期需选择孕妇专用配方。' },
      ],
      finalCta: {
        title: '是时候和"疲劳自由"说再见了',
        subtitle: '3 分钟测评，免费，无需注册',
        buttonText: '开始我的能量计划',
      },
    },
  },
  {
    slug: 'deep-sleep',
    keyword: '深度睡眠保健品',
    audience: '失眠困扰的都市白领',
    content: {
      metaTitle: "深度睡眠保健品推荐 · AI 科学方案 | 1970 Uncle Darren's",
      metaDescription:
        '入睡难、睡眠浅、夜醒多？荣旺深度睡眠方案含镁甘氨酸 + GABA + KSM-66 南非醉茄，临床研究验证，香港保税仓直邮。',
      hero: {
        eyebrow: '夜晚不再数羊',
        title: '一夜好眠，是可以被科学设计的',
        subtitle: 'GABA + 镁甘氨酸 + 南非醉茄三重配方，改善入睡延迟与睡眠深度',
        ctaPrimary: '测评我的睡眠类型',
        ctaSecondary: '了解睡眠方案',
      },
      painPoints: [
        '躺下 1 小时还睡不着',
        '半夜 3 点准时醒来难再入睡',
        '睡了 8 小时依然疲惫',
        '做梦太多，醒来像没睡',
      ],
      solution: {
        title: '大多数失眠，是 GABA 系统和镁代谢失衡',
        description:
          'GABA 是大脑主要的抑制性神经递质，镁是其受体的辅助因子。荣旺深度睡眠方案用日本 PharmaGABA + 德国甘氨酸镁 + KSM-66 南非醉茄，从神经系统层面让你放松下来。',
        bullets: ['不产生依赖 · 次日无昏沉感', '临床级原料 · 非药物路径', '可长期服用'],
      },
      benefits: [
        { icon: '🌙', title: '入睡更快', description: '平均缩短入睡时间 20-30 分钟' },
        { icon: '😴', title: '深睡更深', description: '改善深度睡眠比例' },
        { icon: '☀️', title: '晨起清爽', description: '告别醒来即累的状态' },
        { icon: '🧘', title: '情绪稳定', description: '降低日间焦虑水平' },
      ],
      howItWorks: [
        { step: 1, title: '睡眠类型测评', description: '识别入睡型 / 夜醒型 / 浅睡型' },
        { step: 2, title: 'AI 定制方案', description: '按类型匹配成分与剂量' },
        { step: 3, title: '30 天改善周期', description: '逐步修复睡眠结构' },
      ],
      faqs: [
        { q: '褪黑素会产生依赖吗？', a: '低剂量短期使用研究未显示依赖，但建议搭配改善睡眠卫生。' },
        { q: '吃了第二天会犯困吗？', a: '剂量经过临床验证，次日不会出现宿醉感。' },
        { q: '可以和安眠药一起吃吗？', a: '不建议，请先与医生讨论。' },
        { q: '孕妇可以吃吗？', a: '孕期不建议自行使用，请咨询产科医生。' },
        { q: '多久能感受到效果？', a: '大部分用户在 7-14 天感受到入睡时间缩短。' },
      ],
      finalCta: {
        title: '今晚，就让身体真正休息',
        subtitle: '3 分钟测评 · 找到属于你的睡眠方案',
        buttonText: '开始我的睡眠修复',
      },
    },
  },
  {
    slug: 'immune-boost',
    keyword: '换季免疫力保健品',
    audience: '易感人群与家庭用户',
    content: {
      metaTitle: '换季免疫力保健品 · 荣旺 AI 方案',
      metaDescription:
        '换季易感冒、反复生病、孩子一上幼儿园就中招？荣旺免疫防护方案含维 D3+K2、接骨木莓、益生菌，香港直邮。',
      hero: {
        eyebrow: '家庭免疫防线',
        title: '从肠道到血液，系统性免疫支持',
        subtitle: 'D3+K2 + 脂质体 Vc + 15 菌株益生菌，为家人建立全年防护',
        ctaPrimary: '领取家庭免疫测评',
        ctaSecondary: '查看免疫方案',
      },
      painPoints: [
        '换季就感冒，一次拖 2 周',
        '孩子上学后每月都生病',
        '疫情后免疫力明显变差',
        '老人容易感染呼吸道疾病',
      ],
      solution: {
        title: '免疫力不是单一指标，需要系统性支持',
        description:
          '70% 免疫细胞栖息在肠道。荣旺免疫方案从维生素 D3、锌、Vc 等基础营养出发，叠加 15 菌株益生菌调节肠道菌群，欧洲接骨木莓提供植物多酚。',
        bullets: ['儿童 / 成人 / 老人分龄配方', '临床级原料 · 纯度可追溯', '家庭订阅享额外折扣'],
      },
      benefits: [
        { icon: '🛡️', title: '全年防护', description: '四季不间断的免疫底层支持' },
        { icon: '👨‍👩‍👧', title: '全家适用', description: '按年龄定制不同剂型' },
        { icon: '🌿', title: '天然来源', description: '欧洲有机接骨木莓与草本成分' },
        { icon: '🔬', title: '科学配比', description: '参考欧洲食品安全局推荐量' },
      ],
      howItWorks: [
        { step: 1, title: '全家测评', description: '为每位家庭成员评估免疫状态' },
        { step: 2, title: 'AI 分别匹配', description: '儿童、成人、老人方案不同' },
        { step: 3, title: '家庭包直邮', description: '一次下单全家配齐' },
      ],
      faqs: [
        { q: '孩子几岁可以吃？', a: '3 岁以上可服用儿童专用剂型，3 岁以下请咨询儿科医生。' },
        { q: '老人高血压可以吃吗？', a: '基础免疫营养可以，但甘草类成分需避开。' },
        { q: '已经在吃药还能补充吗？', a: '一般可以，但抗凝药、免疫抑制剂使用者需咨询医生。' },
        { q: '家庭订阅怎么省钱？', a: '3 人以上订阅享 8 折，4 人以上 7.5 折。' },
        { q: '感冒了能继续吃吗？', a: '可以，接骨木莓正是感冒初期推荐剂型。' },
      ],
      finalCta: {
        title: '给家人最好的防护底线',
        subtitle: '3 分钟全家免疫测评 · 免费',
        buttonText: '开始家庭测评',
      },
    },
  },
  // ─── English Landing Pages (generated by 一辉智能体) ───
  {
    slug: 'en-women-fatigue',
    keyword: 'women fatigue supplements HK',
    audience: 'Women 25-45 in Hong Kong experiencing chronic fatigue',
    content: {
      metaTitle: 'Rongwang Health - Women Fatigue Supplements HK | Boost Your Energy',
      metaDescription: "Discover Rongwang Health's women fatigue supplements in HK. Revitalize your energy levels and feel your best every day with our premium supplements.",
      hero: {
        eyebrow: 'Designed for Women',
        title: 'Feel Energized, Every Day',
        subtitle: "Premium women fatigue supplements in HK designed to fight fatigue and restore vitality.",
        ctaPrimary: 'Shop Now',
        ctaSecondary: 'Take the Quiz',
      },
      painPoints: [
        'Constant tiredness and lack of energy affecting daily activities.',
        'Struggling with mood swings and low stamina throughout the day.',
        'Difficulty finding tailored supplements for women\'s unique energy needs.',
        'Relying on caffeine to get through each afternoon.',
      ],
      solution: {
        title: 'Science-Backed Energy Restoration',
        description: 'Our women fatigue supplements are formulated with clinically studied ingredients to address the root causes of female fatigue.',
        bullets: [
          'Boost your energy levels naturally with scientifically formulated supplements.',
          'Support hormonal balance for improved overall well-being and vitality.',
          'Feel rejuvenated and ready to take on your day with ease and confidence.',
        ],
      },
      benefits: [
        { icon: '⚡', title: 'Natural Energy Boost', description: 'Scientifically formulated to fight fatigue naturally' },
        { icon: '🌸', title: 'Hormonal Balance', description: 'Support your unique hormonal needs' },
        { icon: '🧠', title: 'Mental Clarity', description: 'Clear brain fog and sharpen focus' },
        { icon: '💪', title: 'All-Day Vitality', description: 'Sustained energy from morning to night' },
      ],
      howItWorks: [
        { step: 1, title: 'Choose Your Supplement', description: 'Browse our range of women fatigue supplements tailored to meet your specific energy needs.' },
        { step: 2, title: 'Take Daily as Recommended', description: 'Incorporate the supplement into your routine with our easy-to-follow instructions.' },
        { step: 3, title: 'Feel the Difference', description: 'Experience renewed energy, focus, and vitality within weeks of consistent use.' },
      ],
      faqs: [
        { q: 'Are these supplements safe for daily use?', a: 'Yes, our supplements are made with safe, high-quality ingredients suitable for daily use. Always follow the recommended dosage.' },
        { q: 'How long before I see results?', a: 'Most users notice an improvement in energy and overall well-being within 2-4 weeks of regular use.' },
        { q: 'Do I need a prescription to buy these supplements?', a: 'No, our supplements are available over-the-counter and can be purchased directly from our website.' },
        { q: 'Can I take these during my period?', a: 'Yes, our formulas are designed with women\'s menstrual cycles in mind.' },
        { q: 'Is shipping available outside Hong Kong?', a: 'We currently ship to HK, Macau, China, Taiwan, Singapore, and Malaysia.' },
      ],
      finalCta: {
        title: 'Ready to Reclaim Your Energy?',
        subtitle: '3-minute quiz · Free · No registration required',
        buttonText: 'Shop Women Fatigue Supplements Now',
      },
    },
  },
  {
    slug: 'en-deep-sleep',
    keyword: 'natural sleep supplements Hong Kong',
    audience: 'Adults in Hong Kong with sleep difficulties',
    content: {
      metaTitle: 'Natural Sleep Supplements Hong Kong | Rongwang Health',
      metaDescription: "Discover Rongwang Health's natural sleep supplements in Hong Kong. Improve sleep quality with our all-natural, effective formulas.",
      hero: {
        eyebrow: 'Sleep Better Tonight',
        title: 'Better Sleep, Naturally',
        subtitle: "Hong Kong's trusted natural sleep supplements. Rest easy with 100% natural ingredients.",
        ctaPrimary: 'Shop Now',
        ctaSecondary: 'Learn More',
      },
      painPoints: [
        'Struggling with restless nights and poor sleep quality?',
        'Worried about the long-term effects of chemical-based sleep aids?',
        'Feeling tired and unproductive every morning?',
        'Racing thoughts keeping you awake for hours?',
      ],
      solution: {
        title: 'Natural Sleep Science',
        description: 'Our formulas use clinically studied natural ingredients like GABA, Magnesium Glycinate, and KSM-66 Ashwagandha to promote deep, restorative sleep.',
        bullets: [
          'Promotes deeper, more restful sleep using natural ingredients.',
          'Non-habit forming and free of harmful chemicals.',
          'Wake up feeling refreshed, energized, and ready for your day.',
        ],
      },
      benefits: [
        { icon: '🌙', title: 'Fall Asleep Faster', description: 'Reduce time to fall asleep by 20-30 minutes' },
        { icon: '😴', title: 'Deeper Sleep', description: 'Improve deep sleep phases naturally' },
        { icon: '☀️', title: 'No Grogginess', description: 'Wake up fresh without morning fog' },
        { icon: '🧘', title: 'Calm Nerves', description: 'Reduce nighttime anxiety and racing thoughts' },
      ],
      howItWorks: [
        { step: 1, title: 'Select Your Supplement', description: 'Choose from our range of natural sleep supplements tailored to your unique needs.' },
        { step: 2, title: 'Follow the Recommended Dosage', description: 'Take the supplement as per our simple, clear guidelines to optimize your sleep cycle.' },
        { step: 3, title: 'Enjoy Restful Nights', description: 'Experience improved sleep quality and wake up ready to conquer your day.' },
      ],
      faqs: [
        { q: 'Are Rongwang Health supplements safe?', a: 'Yes, our supplements are made with 100% natural ingredients and are rigorously tested for safety.' },
        { q: 'Will I feel groggy after taking the supplements?', a: 'No, our formulas are designed to promote restful sleep without causing morning grogginess.' },
        { q: 'How long does it take to see results?', a: 'Most users notice improvements in their sleep quality within the first week of consistent use.' },
        { q: 'Can I take this with melatonin?', a: 'Our formula already includes optimized melatonin dosing. No additional melatonin needed.' },
        { q: 'Is it safe for long-term use?', a: 'Yes, all ingredients are non-habit forming and safe for continued use.' },
      ],
      finalCta: {
        title: 'Ready for Your Best Night\'s Sleep?',
        subtitle: 'Take our sleep assessment quiz · Free',
        buttonText: 'Shop Natural Sleep Supplements Now',
      },
    },
  },
  {
    slug: 'en-immune-boost',
    keyword: 'immune booster supplements HK',
    audience: 'Health-conscious families in Hong Kong',
    content: {
      metaTitle: 'Immune Booster Supplements in HK | Rongwang Health',
      metaDescription: "Discover Rongwang Health's premium immune booster supplements in HK. Strengthen your immunity with natural, high-quality ingredients.",
      hero: {
        eyebrow: 'Family Immune Shield',
        title: 'Boost Your Immunity with Rongwang Health',
        subtitle: 'Premium immune booster supplements in HK for your whole family\'s health and wellness.',
        ctaPrimary: 'Shop Now',
        ctaSecondary: 'Family Plans',
      },
      painPoints: [
        'Frequent colds and flu lowering your productivity.',
        'Struggling to find trustworthy immune booster supplements in HK.',
        'Feeling fatigued and needing a natural health boost.',
        'Children getting sick every time the season changes.',
      ],
      solution: {
        title: 'Systemic Immune Support',
        description: '70% of immune cells reside in the gut. Our formula combines Vitamin D3+K2, Elderberry, and 15-strain probiotics for comprehensive protection.',
        bullets: [
          'Supports a stronger immune system with natural ingredients.',
          'Improves energy levels and overall health.',
          'Trusted and locally crafted supplements tailored for Hong Kong residents.',
        ],
      },
      benefits: [
        { icon: '🛡️', title: 'Year-Round Protection', description: 'Consistent immune support across all seasons' },
        { icon: '👨‍👩‍👧', title: 'Family Friendly', description: 'Age-appropriate formulas for everyone' },
        { icon: '🌿', title: 'Natural Ingredients', description: 'European organic elderberry and botanicals' },
        { icon: '🔬', title: 'Science-Backed', description: 'Formulated per EFSA recommended intakes' },
      ],
      howItWorks: [
        { step: 1, title: 'Choose Your Supplement', description: 'Select from our range of immune-boosting products designed to match your health needs.' },
        { step: 2, title: 'Incorporate Into Daily Routine', description: 'Take your chosen supplement daily as per the recommended dosage for maximum benefits.' },
        { step: 3, title: 'Feel the Difference', description: 'Experience enhanced energy levels, better immunity, and overall health improvement.' },
      ],
      faqs: [
        { q: 'Are Rongwang Health supplements safe?', a: 'Yes, all our supplements are made with high-quality, natural ingredients and adhere to strict safety standards.' },
        { q: 'How long before I see results?', a: 'Results vary, but most customers notice improvements in immunity and energy levels within a few weeks.' },
        { q: 'Do you offer international shipping?', a: 'We ship to Hong Kong, Macau, mainland China, Taiwan, Singapore, and Malaysia.' },
        { q: 'Can children take these supplements?', a: 'Children aged 3+ can use our kids formula. Consult a pediatrician for younger children.' },
        { q: 'Are there family discounts?', a: 'Yes! Families of 3+ get 20% off, and 4+ get 25% off with our family subscription plan.' },
      ],
      finalCta: {
        title: 'Strengthen Your Immunity Today!',
        subtitle: 'Take the family health quiz · Free',
        buttonText: 'Explore Our Supplements',
      },
    },
  },
  {
    slug: 'akk-probiotic',
    keyword: 'AKK益生菌',
    audience: '35-55岁注重肠道健康和代谢管理人群',
    content: {
      metaTitle: 'AKK益生菌调理肠道代谢 · 荣旺健康方案',
      metaDescription:
        'Akkermansia muciniphila（AKK菌）是下一代明星益生菌，临床研究显示可改善代谢、降低内脏脂肪。荣旺精选巴氏灭活AKK菌，香港直邮。',
      hero: {
        eyebrow: '下一代代谢益生菌',
        title: '肠道代谢决定你的健康天花板',
        subtitle: 'AKK菌（阿克曼氏菌）——被《Nature》点名的新一代益生菌，修复肠道屏障、改善代谢综合征',
        ctaPrimary: '测评我的肠道健康',
        ctaSecondary: '了解AKK菌方案',
      },
      painPoints: [
        '内脏脂肪堆积，腹部肥胖难减',
        '体检发现代谢综合征前期信号',
        '肠道敏感，稍不注意就腹胀排气',
        '尝试过多种益生菌但效果不明显',
      ],
      solution: {
        title: 'AKK菌：肠道屏障修复与代谢调节的双效引擎',
        description:
          'Akkermansia muciniphila 是黏蛋白降解菌，可增强肠道屏障完整性、降低内毒素血症、改善胰岛素敏感性。荣旺选用巴氏灭活 AKK 菌（更稳定安全），每粒含 100 亿 CFU。',
        bullets: [
          '巴氏灭活技术 · 安全性更高',
          '100亿CFU/粒 · 临床有效剂量',
          '肠漏修复 · 从根源改善代谢',
        ],
      },
      benefits: [
        { icon: '🔥', title: '内脏脂肪减少', description: '临床试验显示 12 周内脂质代谢改善' },
        { icon: '🛡️', title: '肠道屏障加固', description: '恢复肠道完整性，降低炎症因子' },
        { icon: '⚖️', title: '代谢指标优化', description: '空腹血糖、甘油三酯指标改善' },
        { icon: '💊', title: '与其他菌株协同', description: '可与双歧杆菌、乳酸菌联用' },
      ],
      howItWorks: [
        { step: 1, title: '肠道代谢测评', description: '评估你的肠道屏障功能与代谢风险' },
        { step: 2, title: '匹配AKK菌方案', description: '根据症状与体检报告定制剂量' },
        { step: 3, title: '90天修复周期', description: '持续补充巩固肠道菌群平衡' },
      ],
      faqs: [
        { q: 'AKK菌是活菌还是死菌？', a: '荣旺使用巴氏灭活 AKK 菌，保留有效成分的同时更稳定，不受温度影响，无需冷藏。' },
        { q: '多久能感受到效果？', a: '大部分用户在 4-8 周开始感受到肠道症状改善，代谢指标改善需 12 周。' },
        { q: '可以和其他益生菌一起吃吗？', a: '可以，AKK 菌与双歧杆菌、乳杆菌有协同作用，建议搭配使用。' },
        { q: '肠易激综合征患者可以吃吗？', a: '可以，但 IBS 症状明显者建议先咨询医生。' },
        { q: '不适合哪些人？', a: '严重免疫抑制患者请先咨询医生。孕妇、哺乳期安全性数据有限，慎用。' },
      ],
      finalCta: {
        title: '肠道健康是代谢健康的根基',
        subtitle: '3 分钟肠道测评 · 找到你的 AKK 方案',
        buttonText: '开始肠道修复计划',
      },
    },
  },
  {
    slug: 'anti-aging-nmn',
    keyword: 'NMN抗衰老',
    audience: '40-65岁注重抗衰老、高净值健康消费者',
    content: {
      metaTitle: 'NMN抗衰老保健品 · 高纯度NMN香港直邮 | 荣旺健康',
      metaDescription:
        'NAD+ 是衰老的核心机制之一。NMN（烟酰胺单核苷酸）可提升 NAD+ 水平，改善能量代谢、认知功能与肌肉健康。荣旺提供 99%+ 高纯度 NMN，香港直邮。',
      hero: {
        eyebrow: '衰老是可干预的生物学过程',
        title: 'NAD+ 水平的衰退，才是衰老的元凶',
        subtitle: 'NMN 前体营养素——提升 NAD+ 水平，从细胞能量、认知、代谢全面抗衰',
        ctaPrimary: '抗衰老测评',
        ctaSecondary: '了解NMN方案',
      },
      painPoints: [
        '过了 40 岁，精力明显下降，恢复变慢',
        '运动能力下降，肌肉质量流失',
        '记忆力、注意力不如从前',
        '对衰老速度感到焦虑，想要主动干预',
      ],
      solution: {
        title: 'NAD+ 下降是衰老的核心机制之一',
        description:
          'NAD+ 是细胞产生能量的关键辅酶，30 岁后每年下降约 1-2%。NMN（烟酰胺单核苷酸）是 NAD+ 的直接前体，口服可有效提升 NAD+ 水平。荣旺选用 99%+ 高纯度 NMN，每粒含 300mg 有效剂量。',
        bullets: [
          '99%+ 高纯度 NMN · 制药标准',
          '300mg/粒 · 临床研究有效剂量',
          '无添加 · 直击 NAD+ 衰减核心',
        ],
      },
      benefits: [
        { icon: '⚡', title: '细胞能量提升', description: '改善线粒体功能，提升 ATP 产量' },
        { icon: '🧠', title: '认知功能改善', description: '支持大脑 NAD+ 代谢，改善记忆与专注' },
        { icon: '💪', title: '肌肉健康维护', description: '改善肌肉力量与运动恢复能力' },
        { icon: '🔬', title: '代谢年轻化', description: '改善胰岛素敏感性、脂质代谢' },
      ],
      howItWorks: [
        { step: 1, title: '抗衰老风险评估', description: '评估你的生物衰老指标与 NAD+ 需求' },
        { step: 2, title: 'NMN 方案定制', description: '根据年龄、生活方式匹配剂量与辅酶搭档' },
        { step: 3, title: '90 天细胞修复周期', description: '持续补充观察精力与认知改善' },
      ],
      faqs: [
        { q: 'NMN 和 NR 有什么区别？', a: 'NMN 是 NAD+ 的直接前体，转化路径更短，效率更高。NR（烟酰胺核苷）需要先转化为 NMN 再生成 NAD+。' },
        { q: 'NMN 会有副作用吗？', a: '临床研究未发现严重副作用，部分人初期可能有轻微消化不适。' },
        { q: 'NMN 长期吃安全吗？', a: '目前最长临床试验为 12 个月，未发现安全性问题。但建议每年体检监测肝肾功能。' },
        { q: '吃多久能看到效果？', a: '精力改善通常 2-4 周，认知功能改善 4-8 周，代谢指标改善需 3-6 个月。' },
        { q: '可以和白藜芦醇一起吃吗？', a: '可以，白藜芦醇是 SIRT1 激活剂，与 NMN 有协同抗衰作用。' },
      ],
      finalCta: {
        title: '衰老不是必然，而是可干预的',
        subtitle: '3 分钟抗衰老测评 · 定制你的细胞方案',
        buttonText: '开始抗衰老计划',
      },
    },
  },
  {
    slug: 'sleep-solutions',
    keyword: '睡眠障碍解决方案',
    audience: '30-50岁失眠、睡眠质量差、浅眠人群',
    content: {
      metaTitle: "睡眠障碍解决方案 · AI 科学配对 | 1970 Uncle Darren's",
      metaDescription:
        '入睡难、多梦易醒、白天嗜睡？荣旺 AI 睡眠测评，基于你的睡眠类型匹配镁甘氨酸 + GABA + 南非醉茄方案，从根源改善睡眠质量。',
      hero: {
        eyebrow: '重塑睡眠结构',
        title: '失眠不是你的人生常态',
        subtitle: 'AI 精准匹配睡眠配方，7 天改善入睡效率，14 天修复深睡比例',
        ctaPrimary: '3 分钟睡眠类型测评',
        ctaSecondary: '查看睡眠方案',
      },
      painPoints: [
        '躺在床上翻来覆去睡不着',
        '半夜频繁醒来，早上像没睡',
        '白天犯困但晚上就是睡不着',
        '服用安眠药担心产生依赖',
      ],
      solution: {
        title: '睡眠问题根源是神经递质失衡与镁缺乏',
        description:
          '大脑放松需要 GABA 与褪黑素的协同，镁是天然的 GABA 激活剂。荣旺睡眠方案用磷脂酰丝氨酸 + 日本 PharmaGABA + 甘氨酸镁三重配方，系统性改善睡眠。',
        bullets: [
          '非药物途径 · 无依赖风险',
          '改善入睡与深度睡眠双靶点',
          '次日无昏沉感',
        ],
      },
      benefits: [
        { icon: '🌙', title: '快速入睡', description: '平均缩短入睡时间至 20 分钟内' },
        { icon: '😴', title: '深睡修复', description: '增加 REM 与深度睡眠比例' },
        { icon: '☀️', title: '白天清醒', description: '告别午后犯困' },
        { icon: '🧘', title: '情绪平稳', description: '减少焦虑与夜间醒来' },
      ],
      howItWorks: [
        { step: 1, title: '睡眠类型测评', description: '识别你是入睡困难型、夜醒型还是浅睡型' },
        { step: 2, title: 'AI 匹配方案', description: '根据类型定制成分组合与剂量' },
        { step: 3, title: '14 天改善周期', description: '逐步重建正常睡眠节律' },
      ],
      faqs: [
        { q: '和褪黑素有什么区别？', a: '褪黑素是激素类产品，可能产生耐受性。GABA+镁是非激素路径，安全性更高。' },
        { q: '几天能看到效果？', a: '大部分用户 7-14 天感受到入睡时间缩短。' },
        { q: '可以长期服用吗？', a: '可以，成分均为食品级原料，适合 3 个月以上的调理周期。' },
        { q: '停用后会反弹吗？', a: '不会，身体已经适应正常的睡眠节律后，逐渐减量即可。' },
        { q: '孕期可以吃吗？', a: '孕期前三个月请咨询产科医生，孕中期后一般可以服用。' },
      ],
      finalCta: {
        title: '每晚都能好好睡',
        subtitle: '3 分钟睡眠类型测评 · 免费',
        buttonText: '开始我的睡眠修复',
      },
    },
  },
  {
    slug: 'energy-boost',
    keyword: '能量补充保健品',
    audience: '25-45岁慢性疲劳、精力不足的职场人群',
    content: {
      metaTitle: "职场能量补充保健品 · AI 科学方案 | 1970 Uncle Darren's",
      metaDescription:
        '慢性疲劳、下午精力崩溃、注意力涣散？荣旺能量补充方案含辅酶 Q10 + B 族 + 红景天，为职场人士量身定制，香港直邮。',
      hero: {
        eyebrow: '职场人专属能量方案',
        title: '下午不再能量崩塌',
        subtitle: '辅酶 Q10 + 甲基化 B 族 + 红景天三重配方，持续供能不依赖咖啡',
        ctaPrimary: '领取能量评估',
        ctaSecondary: '了解能量方案',
      },
      painPoints: [
        '下午 3 点准时精力断崖式下降',
        '注意力难以集中，效率低下',
        '运动能力下降，恢复变慢',
        '睡眠充足但依然疲惫',
      ],
      solution: {
        title: '慢性疲劳与辅酶 Q10 不足和线粒体功能障碍相关',
        description:
          '线粒体是细胞的能量工厂，辅酶 Q10 参与 ATP 生产的关键步骤。荣旺能量方案用泛醇 Q10（高吸收率形式）+ 甲基化 B 族 + 红景天，从细胞层面提升能量产生效率。',
        bullets: [
          '泛醇 Q10 · 直接支持线粒体 ATP 合成',
          '甲基化 B 族 · 提升能量代谢效率',
          '红景天 · 改善心理与身体双重疲劳',
        ],
      },
      benefits: [
        { icon: '⚡', title: '能量持续', description: '改善下午精力崩塌现象' },
        { icon: '🧠', title: '专注力提升', description: '延长注意力持续时间' },
        { icon: '💪', title: '运动表现', description: '提升耐力与恢复速度' },
        { icon: '😌', title: '情绪改善', description: '减少疲劳感与焦虑' },
      ],
      howItWorks: [
        { step: 1, title: '能量评估', description: '回答 10 个关于精力与疲劳的问题' },
        { step: 2, title: 'AI 匹配配方', description: '根据生活方式与症状定制方案' },
        { step: 3, title: '30 天周期', description: '逐步建立稳定的能量节律' },
      ],
      faqs: [
        { q: '和咖啡相比有什么区别？', a: '咖啡因是短期刺激肾上腺素，能量方案是从细胞线粒体层面补充，根本改善能量代谢。' },
        { q: '多久能看到效果？', a: '大部分用户 14-21 天感受到精力改善，效果稳定后不易反弹。' },
        { q: '可以长期服用吗？', a: '可以，辅酶 Q10 和 B 族是水溶性营养素，可长期服用。' },
        { q: '心脏病患者可以吃吗？', a: '心脏病患者请先咨询医生，辅酶 Q10 对心脏有益但可能影响华法林等药物。' },
        { q: '运动人群适合吗？', a: '非常适合，辅酶 Q10 能提升运动表现并缩短恢复时间。' },
      ],
      finalCta: {
        title: '重新掌控你的能量',
        subtitle: '3 分钟能量评估 · 免费',
        buttonText: '开始我的能量提升',
      },
    },
  },
  {
    slug: 'liver-protection',
    keyword: '肝脏保健保健品',
    audience: '熬夜加班、喝酒应酬、肥胖脂肪肝人群',
    content: {
      metaTitle: '肝脏保健怎么选？奶蓟草还是磷脂酰胆碱？ | 荣旺健康',
      metaDescription: '经常熬夜喝酒、体检脂肪肝、熬夜后脸色暗黄？荣旺 AI 测评为你匹配护肝方案。奶蓟草+磷脂酰胆碱+甘草酸，三重护肝科学配比。',
      hero: {
        eyebrow: '肝脏是沉默的器官',
        title: '别等肝发出警告才开始护肝',
        subtitle: '奶蓟草水飞蓟宾 + 磷脂酰胆碱 + 谷胱甘肽前体，三重机制修复肝细胞，AI 精准匹配你的护肝方案',
        ctaPrimary: '3 分钟护肝能力测评',
        ctaSecondary: '查看护肝方案',
      },
      painPoints: [
        '经常喝酒应酬，每次体检转氨酶偏高',
        '熬夜到凌晨 2 点，第二天脸色蜡黄',
        '体检报告显示中度脂肪肝，不知道怎么改善',
        '吃了护肝片没感觉，不知道成分靠不靠谱',
      ],
      solution: {
        title: '护肝需要三重机制，单独一种成分远远不够',
        description: '单一奶蓟草只抗氧化，但不解决脂肪肝核心问题。荣旺护肝方案从抗氧化+细胞膜修复+解毒支持三个维度全面保护肝脏。',
        bullets: [
          '水飞蓟宾 200mg — 抗氧化，稳定肝细胞膜',
          '磷脂酰胆碱 420mg — 参与肝细胞膜修复，针对脂肪肝',
          'N-乙酰半胱氨酸(NAC) 600mg — 谷胱甘肽前体，支持肝脏解毒',
        ],
      },
      benefits: [
        { icon: '🛡️', title: '肝细胞保护', description: '水飞蓟宾修复被酒精和自由基损伤的肝细胞' },
        { icon: '⚖️', title: '逆转脂肪肝', description: '磷脂酰胆碱促进肝脏脂肪代谢，临床研究支持' },
        { icon: '🔄', title: '增强解毒', description: 'NAC提升肝脏解毒酶活性，加速代谢废物' },
        { icon: '😊', title: '肤色改善', description: '肝脏功能恢复后，皮肤暗黄明显改善' },
      ],
      howItWorks: [
        { step: 1, title: '护肝能力测评', description: '回答 8 个关于饮酒、熬夜和身体状态的问题' },
        { step: 2, title: '方案匹配', description: '根据你的肝脏负担程度，AI 推荐合适的成分和剂量' },
        { step: 3, title: '90 天改善计划', description: '配合生活方式调整，3 个月后复查转氨酶' },
      ],
      faqs: [
        { q: '喝酒当天可以吃护肝片吗？', a: '可以，护肝成分在喝酒前后服用有一定保护作用，但不能抵消酒精伤害。' },
        { q: '脂肪肝能通过保健品逆转吗？', a: '轻中度脂肪肝配合生活方式干预（减重、运动、戒酒）可以逆转，重度需就医。' },
        { q: '护肝片吃多久能感觉到效果？', a: '一般 30-60 天能感受到体力恢复、脸色改善，但转氨酶指标改善需要 3 个月后复查。' },
        { q: '可以和其他药物一起吃吗？', a: '护肝成分与大部分药物无冲突，但如果你在服用抗凝药或免疫抑制剂，请先咨询医生。' },
      ],
      finalCta: {
        title: '肝脏没有痛觉神经，发现问题时已经是中晚期',
        subtitle: '早期干预，3 个月还你一个健康的肝脏',
        buttonText: '开始护肝测评 →',
      },
    },
  },
  {
    slug: 'en-liver-protection',
    keyword: 'liver health supplements',
    audience: 'Health-conscious adults aged 30-55 with demanding lifestyles',
    content: {
      metaTitle: 'Liver Health Supplements That Actually Work | Rongwang Health',
      metaDescription: 'Premium liver support formula with milk thistle silymarin, phosphatidylcholine & NAC. AI-personalized protocol for liver detox and fatty liver reversal.',
      hero: {
        eyebrow: 'Your Liver Works While You Sleep',
        title: 'Stop Ignoring Your Liver Until It Is Too Late',
        subtitle: 'Clinically dosed milk thistle + phosphatidylcholine + NAC — three mechanisms for comprehensive liver protection',
        ctaPrimary: 'Take the 3-Min Liver Health Quiz',
        ctaSecondary: 'Explore Liver Plans',
      },
      painPoints: [
        'Regular alcohol consumption with elevated liver enzymes',
        'Late nights and poor sleep affecting your complexion',
        'Diagnosed with fatty liver disease, unsure how to address it',
        'Tried liver supplements before with no noticeable effect',
      ],
      solution: {
        title: 'Effective Liver Support Requires Three Mechanisms',
        description: 'Milk thistle alone only provides antioxidants but does not address the core issue of fatty liver. Rongwang Health uses three complementary pathways.',
        bullets: [
          'Silymarin 200mg — Antioxidant, stabilizes hepatocyte membranes',
          'Phosphatidylcholine 420mg — Supports liver cell membrane repair, targets fatty liver',
          'N-Acetyl Cysteine (NAC) 600mg — Glutathione precursor, enhances liver detoxification',
        ],
      },
      benefits: [
        { icon: '🛡️', title: 'Hepatocyte Protection', description: 'Silymarin repairs liver cells damaged by alcohol and free radicals' },
        { icon: '⚖️', title: 'Fatty Liver Reversal', description: 'Phosphatidylcholine promotes liver fat metabolism, clinically supported' },
        { icon: '🔄', title: 'Enhanced Detox', description: 'NAC boosts liver detox enzyme activity and accelerates waste metabolism' },
        { icon: '😊', title: 'Improved Complexion', description: 'Restored liver function leads to noticeable improvement in skin clarity' },
      ],
      howItWorks: [
        { step: 1, title: 'Liver Health Quiz', description: 'Answer 8 questions about alcohol use, sleep patterns, and physical symptoms' },
        { step: 2, title: 'Protocol Match', description: 'AI recommends the right ingredients and dosages based on your liver burden level' },
        { step: 3, title: '90-Day Improvement Plan', description: 'Combined with lifestyle changes, expect improved liver enzyme readings in 3 months' },
      ],
      faqs: [
        { q: 'Can I take liver supplements on days I drink alcohol?', a: 'Yes, taking liver support before or after drinking provides some protective effect, but it cannot neutralize alcohol damage.' },
        { q: 'Can fatty liver be reversed with supplements?', a: 'Mild to moderate fatty liver can be reversed with lifestyle intervention (weight loss, exercise, avoiding alcohol). Severe cases require medical supervision.' },
        { q: 'How long until I feel results?', a: 'Most users notice improved energy and complexion within 30-60 days. Actual liver enzyme improvements require a blood test after 3 months.' },
        { q: 'Any interactions with medications?', a: 'Liver support ingredients generally do not conflict with most medications, but consult your doctor if you are on anticoagulants or immunosuppressants.' },
      ],
      finalCta: {
        title: 'The Liver Has No Nerve Endings — By the Time You Notice, It Is Often Advanced',
        subtitle: 'Early intervention means a healthier liver in 3 months',
        buttonText: 'Start Your Liver Health Quiz →',
      },
    },
  },
];

export function getLandingPage(slug: string): LandingPage | undefined {
  return landingPages.find((lp) => lp.slug === slug);
}

export function getEnglishLandingPages(): LandingPage[] {
  return landingPages.filter((lp) => lp.slug.startsWith('en-'));
}

export function getChineseLandingPages(): LandingPage[] {
  return landingPages.filter((lp) => !lp.slug.startsWith('en-'));
}

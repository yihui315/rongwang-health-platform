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
      metaTitle: '女性抗疲劳保健品怎么选？AI 科学方案 | 荣旺健康',
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
      metaTitle: '深度睡眠保健品推荐 · AI 科学方案 | 荣旺健康',
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

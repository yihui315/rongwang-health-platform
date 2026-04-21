/**
 * 荣旺健康 · 自动化邮件序列
 *
 * 由一辉智能体按照 Drip / AG1 电子商务最佳实践设计。
 * 每个序列包含触发条件、分支逻辑、退出条件与性能基准。
 *
 * 使用方式：
 *   import { emailSequences } from '@/data/email-sequences';
 *   const seq = emailSequences.welcome;
 *   // 交由 Resend / SendGrid / 自建 SMTP 投递
 */

export interface EmailTemplate {
  step: number;
  delayHours: number;      // 相对上一步（step 1 为触发后延迟）
  subject: string;
  preview: string;         // inbox 预览文字
  heading: string;
  body: string;            // Markdown / 纯文本，占位符 {{name}} {{plan}} 等
  cta: { text: string; href: string };
  tag?: string;            // 用于效果归因
}

export interface EmailSequence {
  slug: string;
  name: string;
  trigger: string;
  goal: string;
  exitCondition: string;
  benchmark: { openRate: string; clickRate: string };
  templates: EmailTemplate[];
}

export const emailSequences: Record<string, EmailSequence> = {
  /* ============================================================
     1. Welcome 新用户欢迎序列 (触发：完成 AI 测验 / 注册)
     ============================================================ */
  welcome: {
    slug: 'welcome',
    name: '新用户欢迎序列',
    trigger: '用户完成 AI 健康测验或注册',
    goal: '首 14 天内完成第一次下单',
    exitCondition: '用户完成订单或主动退订',
    benchmark: { openRate: '45-55%', clickRate: '8-14%' },
    templates: [
      {
        step: 1,
        delayHours: 0,
        subject: '欢迎 {{name}}！你的专属健康方案已就绪 🌱',
        preview: 'AI 为你匹配了 {{plan}}，来看看完整解读',
        heading: '你好 {{name}}，',
        body: `感谢信任荣旺健康。

根据你的 AI 测验结果，我们为你匹配到：**{{plan}}**。
这是一份为你身体状态量身定制的 30 天方案，搭配已被临床研究验证的核心成分。

在接下来的几天里，我会陆续把最有用的健康洞察推送给你，帮你把这套方案发挥到最大。

—— 荣旺健康 AI 顾问`,
        cta: { text: '查看完整方案', href: '/dashboard' },
        tag: 'welcome_day0',
      },
      {
        step: 2,
        delayHours: 24,
        subject: '为什么 {{plan}} 对你有效？科学机制 3 分钟看懂',
        preview: '线粒体、GABA 系统、HPA 轴……一次讲清楚',
        heading: '方案背后的科学',
        body: `你可能好奇：这些成分是怎么起作用的？

我们用 3 分钟带你看懂机制：从线粒体能量代谢，到神经递质调控，再到炎症水平——
每一个成分在你方案中的角色都有明确依据。

点开下面的文章，你会发现自己对身体的理解完全不一样了。`,
        cta: { text: '阅读科学解读', href: '/articles' },
        tag: 'welcome_day1_science',
      },
      {
        step: 3,
        delayHours: 48,
        subject: '🎁 首单立减 ¥50 · 仅限今天',
        preview: '用优惠码 START50 结账即享',
        heading: '给你的专属礼物',
        body: `我们想让你的第一步更轻松。

在接下来 24 小时内下单任意方案，使用优惠码 \`START50\`
立减 **¥50**，还可享受首次免运费直邮。

相当于第一个月不到每天 8 元，就能获得临床级的健康支持。`,
        cta: { text: '立即下单', href: '/subscription?coupon=START50' },
        tag: 'welcome_day3_offer',
      },
      {
        step: 4,
        delayHours: 96,
        subject: '还在犹豫？看看 52,847 位用户怎么说',
        preview: '真实案例 + 常见疑问解答',
        heading: '他们已经行动了',
        body: `过去 90 天内，有 3,218 位用户选择了 {{plan}}。
其中 89% 在第 14 天开始感知到明显变化：精力更稳、睡眠更深、状态更好。

我们整理了 12 条最真实的用户反馈和 5 个高频疑问解答，也许能回应你心里的那个顾虑。`,
        cta: { text: '查看真实评价', href: '/reviews' },
        tag: 'welcome_day7_social',
      },
      {
        step: 5,
        delayHours: 168,
        subject: '最后提醒：你的专属方案将在明天过期',
        preview: '方案锁定与优惠码同时失效',
        heading: '还有最后一次机会',
        body: `为了保证算法的推荐准确性，每份 AI 方案在生成 14 天后会自动过期。
你的 {{plan}} 将在 24 小时后回到初始化状态。

如果你想试一下，这是最后窗口。`,
        cta: { text: '锁定我的方案', href: '/subscription' },
        tag: 'welcome_day14_last',
      },
    ],
  },

  /* ============================================================
     2. Abandoned Cart 弃单挽回序列 (触发：加购后 2h 未结账)
     ============================================================ */
  abandoned_cart: {
    slug: 'abandoned_cart',
    name: '弃单挽回序列',
    trigger: '购物车有商品但 2 小时内未完成结账',
    goal: '24 小时内完成原有订单',
    exitCondition: '订单完成 / 清空购物车 / 超过 72 小时',
    benchmark: { openRate: '50-60%', clickRate: '12-18%' },
    templates: [
      {
        step: 1,
        delayHours: 2,
        subject: '你的购物车还等着你 🛒',
        preview: '我们为你保留了 24 小时',
        heading: '差一步就完成了',
        body: `你之前加入购物车的 {{productName}} 还在等你。

我们为你保留了 **24 小时**，超过时间后库存可能被其他用户抢走。
点下面一键继续之前的下单流程，30 秒完成。`,
        cta: { text: '继续结账', href: '/cart' },
        tag: 'cart_2h',
      },
      {
        step: 2,
        delayHours: 22,
        subject: '最后 2 小时：你的购物车 + ¥30 优惠',
        preview: '优惠码 COMEBACK30 · 结账自动生效',
        heading: '给你一个理由回来',
        body: `我们知道犹豫是正常的。

如果价格是唯一的顾虑，用优惠码 \`COMEBACK30\` 在结账时减 ¥30。
加上我们的 30 天无忧退款，真的没有风险。`,
        cta: { text: '使用优惠码下单', href: '/cart?coupon=COMEBACK30' },
        tag: 'cart_24h_discount',
      },
      {
        step: 3,
        delayHours: 48,
        subject: '我们帮你保留到最后',
        preview: '库存即将释放，方案自动解锁',
        heading: '要不要最后看一眼？',
        body: `超过 72 小时，我们就会把库存释放给其他用户。

这是最后一次提醒——如果你还有任何疑问，直接回复这封邮件，
我们的营养顾问会在 1 小时内回复你。`,
        cta: { text: '完成订单', href: '/cart' },
        tag: 'cart_48h_final',
      },
    ],
  },

  /* ============================================================
     3. Reorder 复购提醒序列 (触发：订单配送后第 25 天)
     ============================================================ */
  reorder: {
    slug: 'reorder',
    name: '复购提醒序列',
    trigger: '订单送达 25 天后',
    goal: '自动续订或升级到订阅',
    exitCondition: '用户续订或 45 天后无动作',
    benchmark: { openRate: '40-50%', clickRate: '15-20%' },
    templates: [
      {
        step: 1,
        delayHours: 600,
        subject: '你的 {{plan}} 快吃完了 · 续一个月？',
        preview: '一键下单，5 天内送达',
        heading: '该补货了',
        body: `根据你上次下单的日期，你的 {{plan}} 应该剩 5-7 天。

为避免中断导致前面 30 天的效果反弹，建议你现在就下单。
直邮 3-5 天到家，时间刚好无缝衔接。`,
        cta: { text: '一键续订', href: '/dashboard' },
        tag: 'reorder_day25',
      },
      {
        step: 2,
        delayHours: 168,
        subject: '升级为订阅制 · 省 15% + 永不断货',
        preview: '包月方案，可随时暂停',
        heading: '换一种更省心的方式',
        body: `如果你已经确定 {{plan}} 适合自己，不如考虑订阅制：

- 自动配送，永不断货
- 订阅价比单次购买省 **15%**
- 任何时候都可以暂停 / 修改 / 取消
- 会员享健康顾问 1v1 答疑

相当于每天比原价省一杯咖啡钱。`,
        cta: { text: '升级订阅', href: '/subscription' },
        tag: 'reorder_day32_upsell',
      },
    ],
  },

  /* ============================================================
     4. Win-back 流失挽回序列 (触发：90 天无购买)
     ============================================================ */
  winback: {
    slug: 'winback',
    name: '流失挽回序列',
    trigger: '用户 90 天未下单',
    goal: '唤醒并完成新一次订单',
    exitCondition: '30 天后未响应自动转入低频期刊',
    benchmark: { openRate: '25-35%', clickRate: '5-10%' },
    templates: [
      {
        step: 1,
        delayHours: 0,
        subject: '好久不见 · 最近过得怎么样？',
        preview: '一份免费的 30 天健康状态重评',
        heading: '别来无恙',
        body: `已经有 90 天没收到你的消息了。

人的身体状态会变化——也许你现在的需求和之前完全不同。
我们为你准备了一份 **免费的状态重评**，只需要 3 分钟。

AI 会基于你的新答案，重新给出适配你当下的方案。`,
        cta: { text: '开始免费重评', href: '/quiz' },
        tag: 'winback_d0',
      },
      {
        step: 2,
        delayHours: 168,
        subject: '🎁 回归专享：任意方案立减 ¥80',
        preview: '优惠码 WELCOMEBACK80 · 3 天有效',
        heading: '给一个重新开始的理由',
        body: `如果你准备重新开始，我们想让这一步便宜一点。

使用优惠码 \`WELCOMEBACK80\`，任意方案首单立减 ¥80。
3 天有效，过期不补。`,
        cta: { text: '领取优惠回归', href: '/products?coupon=WELCOMEBACK80' },
        tag: 'winback_d7_offer',
      },
    ],
  },
};

export const sequenceList = Object.values(emailSequences);

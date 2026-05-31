import MeasuredText from '@/src/components/text/MeasuredText';
import CopyWechatButton from '@/src/components/contact/CopyWechatButton';
import { contactChannels } from '@/src/lib/contact/contact-channels';

const contactTextFonts = {
  title: '700 20px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
  copy: '400 16px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
};

const contactCards = [
  {
    title: '健康咨询与购买确认',
    copy: `WhatsApp: ${contactChannels.whatsappDisplay}。顾问人工确认购买方式。`,
    action: '打开 WhatsApp',
    href: contactChannels.whatsappHref,
    external: true,
  },
  {
    title: '微信客服',
    copy: `微信号：${contactChannels.wechatId}`,
    action: '',
    href: '',
    kind: 'wechat',
    note: contactChannels.qrFallbackLabel,
  },
  {
    title: '客服邮箱',
    copy: contactChannels.supportEmail,
    action: '发送邮件',
    href: `mailto:${contactChannels.supportEmail}`,
  },
  {
    title: '商务合作',
    copy: contactChannels.businessEmail,
    action: '联系商务',
    href: `mailto:${contactChannels.businessEmail}`,
  },
  {
    title: '评估留资',
    copy: '如果你不确定买哪类产品，先提交评估方向，顾问再跟进。',
    action: '提交 AI 评估线索',
    href: '/ai-consult',
  },
];

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-hero">
        <p className="simple-page-eyebrow">Contact</p>
        <h1>联系我们</h1>
        <p>需要确认适用方向、购买方式、物流或售后问题，可以通过以下渠道联系荣旺健康。</p>
      </section>

      <section className="contact-grid">
        {contactCards.map((card) => (
          <article key={card.title}>
            <MeasuredText
              as="h2"
              className="contact-card-title"
              font={contactTextFonts.title}
              lineHeight={28}
              maxLines={2}
            >
              {card.title}
            </MeasuredText>
            <MeasuredText
              className="contact-card-copy"
              font={contactTextFonts.copy}
              lineHeight={29}
              maxLines={2}
            >
              {card.copy}
            </MeasuredText>
            {card.kind === 'wechat' ? (
              <CopyWechatButton />
            ) : (
              <a
                href={card.href}
                target={card.external ? '_blank' : undefined}
                rel={card.external ? 'noopener noreferrer' : undefined}
              >
                {card.action}
              </a>
            )}
            {'note' in card && card.note ? <p className="contact-card-note">{card.note}</p> : null}
          </article>
        ))}
      </section>

      <section className="contact-notice">
        <h2>咨询边界</h2>
        <p>
          本站内容仅供健康教育参考，不构成医疗建议。本品不能替代药物。跨境商品符合原产国标准，可能与中国相关标准存在差异。
        </p>
        <p>
          官网商城当前为商品展示与顾问确认入口，当前不提供站内支付。微信商城/小程序待开通，请通过微信、WhatsApp 或邮箱确认购买方式、物流和售后边界。
        </p>
      </section>
    </main>
  );
}

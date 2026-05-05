/**
 * 内联 SVG 插画库 — 用于代替真人/真实产品照片，避免授权问题。
 * 风格：柔和色块 + 简洁线条 + 渐变背景，呼应截图视觉但不使用真实人物素材。
 */

interface IllustrationProps {
  className?: string;
}

/* --------------------------------------------------------------------- */
/* 健康方向卡片插画：sleep / fatigue / immune / female                   */
/* --------------------------------------------------------------------- */

export function SleepIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden>
      <defs>
        <linearGradient id="sleep-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="100%" stopColor="#f5f3ff" />
        </linearGradient>
        <linearGradient id="sleep-pillow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#sleep-bg)" />
      {/* 月亮 */}
      <circle cx="262" cy="46" r="18" fill="#fef9c3" opacity="0.7" />
      <circle cx="252" cy="42" r="14" fill="url(#sleep-bg)" />
      {/* 星星 */}
      <circle cx="220" cy="32" r="2" fill="#c4b5fd" />
      <circle cx="285" cy="80" r="1.6" fill="#c4b5fd" />
      <circle cx="200" cy="60" r="1.4" fill="#c4b5fd" />
      {/* 枕头 */}
      <ellipse cx="92" cy="142" rx="62" ry="20" fill="url(#sleep-pillow)" stroke="#e2e8f0" strokeWidth="1" />
      {/* 头 (侧面 / 闭眼) */}
      <circle cx="120" cy="118" r="28" fill="#fde2cf" />
      {/* 头发 */}
      <path d="M92 110 Q92 86 122 86 Q150 86 150 116 L150 118 Q150 100 122 100 Q98 100 92 116 Z" fill="#1f2937" />
      {/* 眼睛 闭 */}
      <path d="M128 118 Q132 121 136 118" stroke="#1f2937" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* 嘴 */}
      <path d="M134 128 Q137 130 140 128" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* 被子 */}
      <path d="M30 175 Q30 160 50 160 L290 160 Q290 175 290 200 L30 200 Z" fill="#a78bfa" opacity="0.5" />
      <path d="M30 175 Q30 160 50 160 L290 160 Q290 175 290 200 L30 200 Z" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.4" />
      {/* Z 标记 */}
      <text x="178" y="76" fontSize="14" fill="#8b5cf6" opacity="0.6" fontFamily="serif" fontWeight="bold">z</text>
      <text x="190" y="64" fontSize="18" fill="#8b5cf6" opacity="0.7" fontFamily="serif" fontWeight="bold">z</text>
      <text x="206" y="48" fontSize="22" fill="#8b5cf6" opacity="0.8" fontFamily="serif" fontWeight="bold">Z</text>
    </svg>
  );
}

export function FatigueIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden>
      <defs>
        <linearGradient id="fatigue-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dcfce7" />
          <stop offset="100%" stopColor="#f0fdf4" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#fatigue-bg)" />
      {/* 太阳 */}
      <circle cx="56" cy="48" r="14" fill="#fde68a" />
      <g stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
        <line x1="56" y1="22" x2="56" y2="28" />
        <line x1="56" y1="68" x2="56" y2="74" />
        <line x1="30" y1="48" x2="36" y2="48" />
        <line x1="76" y1="48" x2="82" y2="48" />
        <line x1="40" y1="32" x2="44" y2="36" />
        <line x1="68" y1="60" x2="72" y2="64" />
        <line x1="68" y1="36" x2="72" y2="32" />
        <line x1="40" y1="64" x2="44" y2="60" />
      </g>
      {/* 树/植物背景 */}
      <ellipse cx="280" cy="180" rx="50" ry="30" fill="#bbf7d0" opacity="0.6" />
      <ellipse cx="40" cy="180" rx="40" ry="22" fill="#bbf7d0" opacity="0.5" />
      {/* 人 - 伸懒腰姿势 */}
      <g transform="translate(160 100)">
        {/* 身体 */}
        <path d="M-18 30 Q-18 8 0 6 Q18 8 18 30 L18 80 Q18 92 12 92 L-12 92 Q-18 92 -18 80 Z" fill="#a7f3d0" />
        <path d="M-18 30 Q-18 8 0 6 Q18 8 18 30 L18 80 Q18 92 12 92 L-12 92 Q-18 92 -18 80 Z" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.5" />
        {/* 头 */}
        <circle cx="0" cy="-6" r="20" fill="#fde2cf" />
        {/* 头发 */}
        <path d="M-20 -8 Q-20 -28 0 -28 Q22 -28 22 -8 L22 -10 Q18 -22 0 -22 Q-18 -22 -20 -10 Z" fill="#7c2d12" />
        {/* 闭眼笑 */}
        <path d="M-7 -7 Q-4 -10 -1 -7" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M1 -7 Q4 -10 7 -7" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* 微笑 */}
        <path d="M-4 4 Q0 8 4 4" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* 双手举起伸展 */}
        <path d="M-18 30 L-44 -8" stroke="#fde2cf" strokeWidth="10" strokeLinecap="round" />
        <path d="M18 30 L44 -8" stroke="#fde2cf" strokeWidth="10" strokeLinecap="round" />
        {/* 手 */}
        <circle cx="-44" cy="-8" r="6" fill="#fde2cf" />
        <circle cx="44" cy="-8" r="6" fill="#fde2cf" />
      </g>
      {/* 能量火花 */}
      <g fill="#10b981" opacity="0.8">
        <path d="M86 88 l3 -8 l3 8 l-3 8 z" />
        <path d="M232 76 l2 -6 l2 6 l-2 6 z" />
      </g>
    </svg>
  );
}

export function ImmuneIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden>
      <defs>
        <linearGradient id="immune-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#immune-bg)" />
      {/* 后景盾牌轮廓 */}
      <path d="M226 38 L266 38 L268 70 Q268 98 246 110 Q224 98 224 70 Z" fill="#bfdbfe" opacity="0.6" />
      <path d="M236 70 L244 78 L256 62" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      {/* 人物 */}
      <g transform="translate(140 100)">
        {/* 身体 (运动背心) */}
        <path d="M-22 32 Q-22 14 0 12 Q22 14 22 32 L22 80 Q22 92 16 92 L-16 92 Q-22 92 -22 80 Z" fill="#93c5fd" opacity="0.55" />
        <path d="M-12 18 L-12 80 M12 18 L12 80" stroke="#3b82f6" strokeWidth="0.8" fill="none" opacity="0.5" />
        {/* 头 */}
        <circle cx="0" cy="-2" r="22" fill="#fde2cf" />
        {/* 头发-马尾 */}
        <path d="M-22 -2 Q-22 -24 0 -24 Q22 -24 22 -2 L22 -6 Q18 -18 0 -18 Q-18 -18 -22 -6 Z" fill="#1f2937" />
        <ellipse cx="22" cy="6" rx="6" ry="14" fill="#1f2937" />
        {/* 眼睛 */}
        <circle cx="-7" cy="-2" r="1.2" fill="#1f2937" />
        <circle cx="7" cy="-2" r="1.2" fill="#1f2937" />
        {/* 微笑 */}
        <path d="M-4 8 Q0 12 4 8" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* 手叉腰 */}
        <path d="M-22 38 L-32 60 L-26 70" stroke="#fde2cf" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M22 38 L32 60 L26 70" stroke="#fde2cf" strokeWidth="9" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

export function FemaleIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden>
      <defs>
        <linearGradient id="female-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="100%" stopColor="#fdf2f8" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#female-bg)" />
      {/* 装饰花 */}
      <g opacity="0.5">
        <circle cx="50" cy="50" r="3" fill="#f472b6" />
        <circle cx="46" cy="46" r="3" fill="#fbcfe8" />
        <circle cx="54" cy="46" r="3" fill="#fbcfe8" />
        <circle cx="46" cy="54" r="3" fill="#fbcfe8" />
        <circle cx="54" cy="54" r="3" fill="#fbcfe8" />
      </g>
      <g opacity="0.4">
        <circle cx="270" cy="70" r="3" fill="#f472b6" />
        <circle cx="266" cy="66" r="3" fill="#fbcfe8" />
        <circle cx="274" cy="66" r="3" fill="#fbcfe8" />
        <circle cx="266" cy="74" r="3" fill="#fbcfe8" />
        <circle cx="274" cy="74" r="3" fill="#fbcfe8" />
      </g>
      {/* 人 */}
      <g transform="translate(160 100)">
        {/* 身体 (毛衣) */}
        <path d="M-26 36 Q-26 16 0 14 Q26 16 26 36 L26 86 Q26 98 18 98 L-18 98 Q-26 98 -26 86 Z" fill="#f9a8d4" opacity="0.5" />
        {/* 头 */}
        <circle cx="0" cy="-6" r="22" fill="#fde2cf" />
        {/* 长发 */}
        <path d="M-24 -2 Q-24 -28 0 -28 Q24 -28 24 -2 L26 30 Q22 30 22 12 Q22 -8 0 -8 Q-22 -8 -22 12 Q-22 30 -26 30 Z" fill="#7c2d12" />
        {/* 眼睛 微闭 (笑) */}
        <path d="M-9 -6 Q-6 -3 -3 -6" stroke="#1f2937" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d="M3 -6 Q6 -3 9 -6" stroke="#1f2937" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        {/* 嘴 微笑 */}
        <path d="M-5 5 Q0 10 5 5" stroke="#be185d" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* 拿杯子的手 */}
        <path d="M-26 50 Q-30 60 -22 66" stroke="#fde2cf" strokeWidth="9" strokeLinecap="round" fill="none" />
        {/* 杯子 */}
        <g transform="translate(-32 60)">
          <rect x="-10" y="-8" width="20" height="18" rx="2" fill="#fff" stroke="#94a3b8" strokeWidth="1" />
          <path d="M10 -2 Q16 -2 16 4 Q16 10 10 10" fill="none" stroke="#94a3b8" strokeWidth="1.4" />
          {/* 蒸汽 */}
          <path d="M-4 -14 Q-2 -18 -4 -22" stroke="#cbd5e1" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M2 -14 Q4 -18 2 -22" stroke="#cbd5e1" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

/* --------------------------------------------------------------------- */
/* 营养顾问 / 医生插画 - 用于 ExpertTrust 模块中央                       */
/* --------------------------------------------------------------------- */

export function DoctorIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 280 360" className={className} aria-hidden>
      <defs>
        <linearGradient id="doc-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ecfdf5" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="280" height="360" rx="24" fill="url(#doc-bg)" />
      {/* 后景圆 */}
      <circle cx="140" cy="120" r="90" fill="#d1fae5" opacity="0.5" />

      <g transform="translate(140 120)">
        {/* 头 */}
        <circle cx="0" cy="0" r="40" fill="#fde2cf" />
        {/* 长发 */}
        <path d="M-42 0 Q-42 -42 0 -42 Q42 -42 42 0 L46 36 Q40 36 40 18 Q40 -8 0 -8 Q-40 -8 -40 18 Q-40 36 -46 36 Z" fill="#1f2937" />
        {/* 头发柔光 */}
        <path d="M-32 -14 Q-20 -28 0 -28 Q20 -28 32 -14" stroke="#374151" strokeWidth="1" fill="none" opacity="0.4" />
        {/* 眉 */}
        <path d="M-16 -8 Q-12 -10 -8 -8" stroke="#1f2937" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M8 -8 Q12 -10 16 -8" stroke="#1f2937" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* 眼睛 */}
        <ellipse cx="-12" cy="-2" rx="2" ry="2.6" fill="#1f2937" />
        <ellipse cx="12" cy="-2" rx="2" ry="2.6" fill="#1f2937" />
        {/* 鼻 */}
        <path d="M0 4 L-1 12 L2 14" stroke="#d4a373" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* 嘴 微笑 */}
        <path d="M-7 22 Q0 27 7 22" stroke="#be185d" strokeWidth="1.4" fill="none" strokeLinecap="round" />

        {/* 脖子 */}
        <rect x="-12" y="34" width="24" height="14" fill="#fde2cf" />

        {/* 白大褂 */}
        <path d="M-72 144 Q-72 70 -36 50 Q-12 60 0 60 Q12 60 36 50 Q72 70 72 144 Z"
              fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.4" />
        {/* 领口 V */}
        <path d="M-12 50 L0 92 L12 50 Z" fill="#ecfdf5" stroke="#94a3b8" strokeWidth="1" />
        {/* 翻领 */}
        <path d="M-36 50 L-22 100 L-12 50" stroke="#cbd5e1" strokeWidth="1.4" fill="none" />
        <path d="M36 50 L22 100 L12 50" stroke="#cbd5e1" strokeWidth="1.4" fill="none" />
        {/* 名牌 (绿色叶) */}
        <rect x="22" y="80" width="14" height="6" rx="1" fill="#10b981" />
        {/* 听诊器 */}
        <path d="M-18 90 Q-30 120 -10 130 Q10 138 8 156"
              stroke="#0f766e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="8" cy="158" r="6" fill="#0f766e" />
        <circle cx="8" cy="158" r="3" fill="#0d9488" />

        {/* 手抱平板 */}
        <path d="M-72 144 L-90 200 L-50 220 L-30 168" fill="#fde2cf" stroke="#d4a373" strokeWidth="0.8" />
        <path d="M72 144 L90 200 L50 220 L30 168" fill="#fde2cf" stroke="#d4a373" strokeWidth="0.8" />

        {/* 平板/夹板 */}
        <rect x="-50" y="160" width="100" height="68" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.4" />
        <rect x="-12" y="156" width="24" height="8" rx="2" fill="#cbd5e1" />
        {/* 报告内容线 */}
        <line x1="-40" y1="180" x2="20" y2="180" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        <line x1="-40" y1="190" x2="36" y2="190" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="-40" y1="200" x2="30" y2="200" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="-40" y1="210" x2="22" y2="210" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
        {/* checkbox */}
        <rect x="26" y="178" width="6" height="6" rx="1" fill="#10b981" />
      </g>
    </svg>
  );
}

/* --------------------------------------------------------------------- */
/* 产品瓶身插画                                                          */
/* --------------------------------------------------------------------- */

export function ProductBottle({
  variant,
  className,
}: {
  variant: "sleep" | "immune" | "fatigue";
  className?: string;
}) {
  const palette = {
    sleep: { label: "#f8fafc", text: "#475569", accent: "#16a34a", cap: "#94a3b8" },
    immune: { label: "#16a34a", text: "#ffffff", accent: "#fbbf24", cap: "#0f766e" },
    fatigue: { label: "#7c2d12", text: "#fef3c7", accent: "#dc2626", cap: "#a16207" },
  } as const;
  const c = palette[variant];

  return (
    <svg viewBox="0 0 140 180" className={className} aria-hidden>
      <defs>
        <linearGradient id={`bottle-shadow-${variant}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id={`label-shadow-${variant}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.08" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {/* 阴影 */}
      <ellipse cx="70" cy="170" rx="44" ry="4" fill="#000" opacity="0.08" />
      {/* 瓶盖 */}
      <rect x="42" y="14" width="56" height="20" rx="3" fill={c.cap} />
      <rect x="42" y="14" width="56" height="6" rx="3" fill="#000" opacity="0.15" />
      {/* 瓶身 */}
      <rect x="32" y="34" width="76" height="128" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.4" />
      <rect x="32" y="34" width="76" height="128" rx="8" fill={`url(#bottle-shadow-${variant})`} />
      {/* 标签 */}
      <rect x="38" y="62" width="64" height="80" rx="3" fill={c.label} />
      <rect x="38" y="62" width="64" height="80" rx="3" fill={`url(#label-shadow-${variant})`} />
      {/* 标签上 brand mark */}
      <circle cx="70" cy="78" r="6" fill={c.accent} opacity="0.85" />
      {/* 标签线 */}
      <rect x="46" y="92" width="48" height="3" rx="1.5" fill={c.text} opacity="0.95" />
      <rect x="50" y="100" width="40" height="2" rx="1" fill={c.text} opacity="0.6" />
      <rect x="50" y="106" width="36" height="2" rx="1" fill={c.text} opacity="0.45" />
      {/* 底标小条 */}
      <rect x="50" y="124" width="40" height="6" rx="1" fill={c.accent} opacity="0.85" />
    </svg>
  );
}

/* --------------------------------------------------------------------- */
/* 用户头像 (SVG 抽象人物轮廓 — 不使用真人照片)                          */
/* --------------------------------------------------------------------- */

export function Avatar({
  variant,
  className,
}: {
  variant: "female-1" | "male-1" | "female-2";
  className?: string;
}) {
  if (variant === "male-1") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden>
        <defs>
          <linearGradient id="avt-m1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="32" fill="url(#avt-m1)" />
        {/* 头 */}
        <circle cx="32" cy="26" r="11" fill="#fde2cf" />
        {/* 短发 */}
        <path d="M21 22 Q21 13 32 13 Q43 13 43 22 L43 21 Q42 17 32 17 Q22 17 21 21 Z" fill="#1f2937" />
        {/* 眉 */}
        <path d="M26 24 L29 24 M35 24 L38 24" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />
        {/* 眼 */}
        <circle cx="28" cy="27" r="0.9" fill="#1f2937" />
        <circle cx="36" cy="27" r="0.9" fill="#1f2937" />
        {/* 嘴 */}
        <path d="M30 31 Q32 33 34 31" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* 衬衫 */}
        <path d="M14 64 Q14 46 24 41 L32 49 L40 41 Q50 46 50 64 Z" fill="#3b82f6" opacity="0.7" />
      </svg>
    );
  }
  if (variant === "female-2") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden>
        <defs>
          <linearGradient id="avt-f2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ede9fe" />
            <stop offset="100%" stopColor="#ddd6fe" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="32" fill="url(#avt-f2)" />
        <circle cx="32" cy="26" r="11" fill="#fde2cf" />
        {/* 中长发 */}
        <path d="M20 26 Q20 13 32 13 Q44 13 44 26 L46 36 Q44 36 44 30 Q44 19 32 19 Q20 19 20 30 Q20 36 18 36 Z" fill="#7c2d12" />
        <path d="M27 27 Q29 25 31 27 M33 27 Q35 25 37 27" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M30 31 Q32 33 34 31" stroke="#be185d" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M14 64 Q14 46 26 42 L32 49 L38 42 Q50 46 50 64 Z" fill="#a78bfa" opacity="0.7" />
      </svg>
    );
  }
  // female-1 default
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="avt-f1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="100%" stopColor="#fbcfe8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="32" fill="url(#avt-f1)" />
      <circle cx="32" cy="26" r="11" fill="#fde2cf" />
      {/* 长发 */}
      <path d="M20 26 Q20 12 32 12 Q44 12 44 26 L46 38 Q44 38 44 32 Q44 18 32 18 Q20 18 20 32 Q20 38 18 38 Z" fill="#1f2937" />
      <path d="M27 27 Q29 25 31 27 M33 27 Q35 25 37 27" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M30 31 Q32 33 34 31" stroke="#be185d" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M14 64 Q14 46 26 42 L32 49 L38 42 Q50 46 50 64 Z" fill="#f472b6" opacity="0.7" />
    </svg>
  );
}

# Rongwang Protocol Design System V3.0

## Design Intent

Rongwang should feel like a calm health triage protocol: structured, protective, evidence-aware, and service-oriented.

The interface must not feel like:

- A quiz farm with many separate tests.
- A product catalog with assessment decoration.
- A medical diagnosis app.
- A high-pressure ecommerce funnel.

The interface should feel like:

- A guided intake.
- A risk segmentation report.
- A careful nutrition support and evidence review.
- A cross-border product identity and fulfillment decision aid.

## Product Experience Principles

1. One protocol, many entry concerns.
2. Assessment before recommendations.
3. Risk state before CTA intensity.
4. Evidence and cautions before product action.
5. Consent before health processing.
6. Human support before private follow-up.

## Information Architecture

### Homepage First View

Required first-viewport signals:

- Brand: 荣旺健康 / Rongwang Health.
- Protocol name: 荣旺健康分层协议.
- One primary CTA: `免费做一次健康分层评估`.
- Secondary CTA: `看看评估后会得到什么`.
- Fallback CTA: `我不确定，帮我判断`.
- Short protocol steps: 主诉选择 -> 统一评估 -> 风险分层 -> 报告与支持方向.

Avoid:

- Multiple independent health test cards above the fold.
- Product SKUs in the hero.
- Claims that imply diagnosis, treatment, cure, prevention, or guaranteed outcomes.

### Chief Complaint Selector

Pattern:

- Use a segmented selector or compact option list.
- Selecting a concern changes context, not the assessment engine.
- The "I am not sure" option should be visible and reassuring.

Allowed labels:

- 睡眠与恢复
- 疲劳与精力
- 压力与情绪负荷
- 饮酒应酬后支持
- 免疫与日常防护
- 男性健康支持
- 我不确定

Microcopy:

- Use "先帮你判断风险层级，再给出支持方向".
- Avoid "测一测你有什么病" or similar diagnostic framing.

### Assessment Flow

Required states:

- Scenario context.
- Required consent checkbox.
- Optional marketing consent checkbox, unchecked by default.
- Progress indication.
- Safety disclaimer.
- Structured result state.

Consent copy direction:

- Required: "我同意荣旺根据我的回答生成健康教育与风险分层报告。"
- Optional: "我愿意接收报告提醒和后续营养支持资讯。"

Do not bundle marketing consent into required assessment consent.

### Result Report

Risk badges:

| Risk | Label | Tone |
| --- | --- | --- |
| LOW | 低风险提示 | Stable, educational |
| MEDIUM | 中等风险提醒 | Cautious, consult-friendly |
| HIGH | 高风险提醒 | Protective, no commerce |
| urgent | 紧急提醒 | Professional care first |

Result layout:

- Risk summary.
- What this means.
- What to watch.
- Suggested next step.
- Report save action.
- Nutrition support direction only when allowed.
- Product Passport entry only when commerce is allowed.

High and urgent states:

- Show save report.
- Show doctor/pharmacist guidance.
- Show retest/reminder option.
- Do not show product purchase CTA.

### Product Passport

The Product Passport should replace generic ecommerce persuasion with structured trust.

Required fields:

- Product name and identity.
- Brand/manufacturer.
- Origin.
- Key ingredients.
- Nutrition support direction.
- Suitable direction.
- Not suitable when.
- Cautions.
- Evidence/review status.
- Cross-border fulfillment notes.
- Support channel.

Visual pattern:

- Use a compact section with clear labels.
- Cautions should appear before purchase action.
- Review status should be visible, not hidden in metadata.
- Missing fields should show "待审核" or "信息待补充", not disappear.

## CTA Rules

Global homepage CTAs:

- Primary: `免费做一次健康分层评估`
- Secondary: `看看评估后会得到什么`
- Fallback: `我不确定，帮我判断`

Allowed assessment and report CTAs:

- `保存我的评估报告`
- `查看营养支持方向`
- `下载给医生/药师沟通的清单`
- `稍后重新评估`
- `联系顾问了解报告`

Allowed product evaluation CTAs:

- `查看产品证据护照`
- `查看适合与不适合情况`
- `咨询客服确认跨境配送`

Avoid:

- `立即治疗`
- `修复肝脏`
- `改善抑郁`
- `降低血糖`
- `降低血压`
- `治失眠`
- `抗癌`
- `保证有效`
- `无副作用`

## Visual Language

Use a restrained, information-dense health service style.

Recommended tokens:

- Trust ink: `#12302B`
- Clinical green: `#1F7A5B`
- Evidence blue: `#2563EB`
- Attention amber: `#B7791F`
- Safety red: `#B42318`
- Surface: `#F6F8F7`
- Paper: `#FFFDF7`
- Border: `#D8E0DC`
- Text: `#17211E`
- Muted text: `#5C6964`

Rules:

- Do not let one hue dominate the entire interface.
- Keep cards to individual repeated items, report panels, and passport fields.
- Avoid nested cards.
- Use compact headings inside tool surfaces.
- Keep core text readable on mobile.
- Use stable dimensions for selectors, badges, and passport field grids to prevent layout shifts.

## Component Inventory

New or refactored components should map to this inventory:

- `ProtocolHero`
- `ChiefComplaintSelector`
- `AssessmentConsent`
- `RiskSegmentationCard`
- `ReportSavePanel`
- `HighRiskActions`
- `NutritionSupportDirection`
- `ProductPassport`
- `EvidenceStatusBadge`
- `CrossBorderTrustPanel`
- `ArticleAssessmentCTA`

Prefer existing local components where they already match the design intent.

## Copy Tone

Use:

- Calm.
- Specific.
- Education-first.
- Non-diagnostic.
- Caution-aware.

Avoid:

- Fear-based urgency unless the risk route truly requires professional care guidance.
- Product-first claims.
- Medical certainty.
- Before/after outcome framing.
- Numeric efficacy unless reviewed and clearly supported.

## Accessibility And Rendering

Requirements:

- Core homepage copy must be visible in SSR/SSG HTML.
- Loading states must not hide all meaningful content from crawlers.
- Interactive selectors need keyboard focus states.
- Risk color cannot be the only signal; always include text labels.
- Consent checkboxes need explicit labels.
- Personal report pages must be noindex.

## Design Acceptance Checklist

Before shipping a UI PR:

- The first screen routes into one unified assessment.
- The page does not present independent health tests.
- Risk state controls CTA intensity.
- High-risk paths have no product purchase CTA.
- Required and optional consent are visually separate.
- Product Passport shows cautions before commerce.
- Copy avoids prohibited health claims.
- Screenshots are attached for desktop and mobile.
- Analytics events use non-sensitive names and coarse attributes only.


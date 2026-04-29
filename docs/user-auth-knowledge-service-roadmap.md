# User Auth And Health Knowledge Service Roadmap

This document defines the next Rongwang service layer after the WeChat mall MVP:
registered users, WeChat identity, saved AI assessment reports, and a governed
health/OTC knowledge base.

## Skill Selection

Use the existing skills as the implementation spine:

- `rongwang-health-ai-skill`: primary project guardrails for AI assessment,
  health safety, recommendation rules, report storage, and OTC education copy.
- `vercel:auth`: website authentication architecture for Next.js. Prefer this
  over low-install external Clerk/NextAuth skills found in the public skill
  search.
- `auth-wechat-miniprogram`: Mini Program identity design, especially OPENID
  and UNIONID handling.

Public skill search results were useful but not strong enough to install for
the knowledge-base track. The WeChat-specific skill was the only mature match
found (`tencentcloudbase/skills@auth-wechat-miniprogram`, about 1.5K installs),
and it is already available locally. Knowledge-base and RAG skills found in the
search had low install counts or broad scope, so Rongwang should keep this
domain-specific and project-owned.

## Target Capability

The service should support:

- One user record per person, with optional WeChat Open Platform UNIONID to link
  Official Account, Mini Program, and website identities.
- Website WeChat scan login for desktop/mobile web, using a WeChat Open Platform
  website application after the real AppID, AppSecret, and callback domain are
  approved.
- Mini Program identity through the existing mini program login path now, and
  CloudBase/OPENID automation later if CloudBase becomes the runtime.
- Saved basic user profile: age band, gender, goals, allergies, medications,
  lifestyle signals, consent version, and privacy timestamps.
- Saved AI assessment reports for review: profile snapshot, risk level,
  result JSON, recommendations, safety flags, AI provider/model/prompt version,
  and user-visible report summary.
- Governed health/OTC knowledge base: condition/solution topics, OTC ingredient
  monographs, product ingredient mappings, contraindications, red flags, source
  references, review status, and effective dates.

## Data Model Direction

Add these Prisma models in the next migration:

- `UserAccount`: internal user id, display name, phone/email if collected,
  consent fields, and timestamps.
- `UserIdentity`: provider identities such as `wechat_open`, `wechat_mp`,
  `wechat_miniprogram`, email, or phone. Store provider ids hashed where
  practical; never expose raw secrets.
- `UserHealthProfile`: current editable profile plus a `snapshotVersion`.
- `AssessmentReport`: immutable saved report tied to `UserAccount`,
  `Consultation`, and `UserHealthProfile` snapshot.
- `KnowledgeSource`: citation/reference metadata, source type, url, publisher,
  reviewedAt, and status.
- `HealthKnowledgeEntry`: education topic or OTC monograph with scope,
  contraindications, warning signals, evidence level, and review status.
- `ProductKnowledgeLink`: mapping between product SKUs, ingredients, OTC
  directions, and knowledge entries.

Keep existing `Consultation` as the event/audit table. `AssessmentReport` is
the user-facing saved artifact.

## Login Implementation Path

Phase 1, site account foundation:

- Add internal account tables and session-safe user APIs.
- Save assessment reports only after explicit user action such as "保存报告".
- Keep anonymous assessment available.

Phase 2, WeChat scan login:

- Add `WECHAT_OPEN_APPID`, `WECHAT_OPEN_SECRET`, and
  `WECHAT_OPEN_LOGIN_CALLBACK_URL`.
- Add `/auth/wechat` to create the OAuth state and QR-login URL.
- Add `/api/auth/wechat/callback` to exchange `code`, validate `state`, resolve
  OPENID/UNIONID, and attach/create `UserAccount`.
- Store refresh/access tokens only if truly needed; default to not retaining
  remote access tokens after identity resolution.

Phase 3, Mini Program account linking:

- Use the existing `/api/wechat/miniprogram/login` path for `code2Session`.
- Associate Mini Program OPENID with `UserIdentity`.
- Prefer UNIONID when available to merge Website, Official Account, and Mini
  Program identities.

## Knowledge Base Rules

- The AI may use the knowledge base to explain risks, lifestyle suggestions,
  OTC education, and ingredient context.
- The AI must not prescribe, diagnose, or promise treatment outcomes.
- Red flags override commerce and recommendations.
- Product selection remains rule-based; the knowledge base can explain why a
  direction was shown, but it should not let the model freely choose SKUs.
- Every knowledge entry needs status: `draft`, `reviewed`, `retired`.
- Public copy should use only `reviewed` entries.

## Acceptance Criteria

- A visitor can complete assessment anonymously.
- A visitor can sign in with WeChat scan login after credentials are configured.
- A signed-in user can save and reopen an AI assessment report.
- The report includes disclaimer, risk level, safety flags, and recommendation
  snapshot.
- Admin can inspect user reports without exposing WeChat secrets.
- Health/OTC knowledge entries are versioned and review-gated.
- Urgent or high-risk reports never show product purchase prompts.

## MVP Implementation Notes

- Website sessions use the `rw_session` opaque HTTP-only cookie and
  `UserAuthSession`; production requires `AUTH_ID_HASH_SALT`.
- Email login/signup now create `UserAccount` and `UserIdentity(provider=email)`;
  WeChat Open Platform QR login uses `UserIdentity(provider=wechat_open)`.
- `/api/assessment-reports` saves immutable report snapshots from existing
  `Consultation` records. Anonymous users receive `auth_required`.
- `/api/wechat/miniprogram/login` now performs the real `code2Session` shape
  when credentials are configured, stores only hashed identifiers in
  `UserIdentity`, and does not expose raw openid/unionid.
- `/admin/knowledge` is the read-first v1 knowledge-base surface. Public AI
  copy should use only `reviewed` entries, and product links remain
  education-only context.

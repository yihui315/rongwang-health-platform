/**
 * WeChat Platform Configuration
 *
 * Real implementation requires WeChat Official Account API credentials.
 * The pipeline reads: WECHAT_APP_ID, WECHAT_APP_SECRET, WECHAT_TOKEN,
 * WECHAT_DEFAULT_COVER_PATH, WECHAT_DRAFT_UPLOAD_ENABLED, WECHAT_OFFICIAL_DRY_RUN
 */

export interface WechatConfig {
  appId?: string;
  appSecret?: string;
  token?: string;
  enabled: boolean;
}

export interface WechatReadinessStatus {
  officialAccount: {
    configured: boolean;
    hasCover: boolean;
    draftUploadEnabled: boolean;
    canUploadDraft: boolean;
    dryRun: boolean;
  };
}

export function getWechatReadinessStatus(): WechatReadinessStatus {
  const configured = !!(
    process.env.WECHAT_APP_ID &&
    process.env.WECHAT_APP_SECRET
  );
  const hasCover = !!(
    process.env.WECHAT_DEFAULT_COVER_PATH ||
    process.env.WECHAT_DEFAULT_COVER_MEDIA_ID
  );
  const draftUploadEnabled = process.env.WECHAT_DRAFT_UPLOAD_ENABLED === 'true';
  const dryRun = process.env.WECHAT_OFFICIAL_DRY_RUN !== 'false';

  return {
    officialAccount: {
      configured,
      hasCover,
      draftUploadEnabled,
      canUploadDraft: configured && hasCover,
      dryRun,
    },
  };
}

export function isWechatConfigured(): boolean {
  return !!(
    process.env.WECHAT_APP_ID &&
    process.env.WECHAT_APP_SECRET &&
    process.env.WECHAT_TOKEN
  );
}

function isConfigured(key: string) {
  const value = process.env[key];
  if (!value) {
    return false;
  }

  const lower = value.toLowerCase();
  return !(
    lower.includes("your-") ||
    lower.includes("replace-with") ||
    lower.includes("xxx") ||
    lower === "changeme"
  );
}

function missing(keys: string[]) {
  return keys.filter((key) => !isConfigured(key));
}

export function getWechatReadinessStatus() {
  const hasOfficialAccountCredentials = isConfigured("WECHAT_APPID") && isConfigured("WECHAT_SECRET");
  const hasCover = isConfigured("WECHAT_DEFAULT_COVER_PATH") || isConfigured("WECHAT_DEFAULT_COVER_MEDIA_ID");
  const miniProgramRequired = ["WECHAT_MINIPROGRAM_APPID", "WECHAT_MINIPROGRAM_SECRET"];
  const pddMode = process.env.PDD_SHORT_LINK_MODE === "mini_program" ||
    process.env.PDD_SHORT_LINK_MODE === "copy_link" ||
    process.env.PDD_SHORT_LINK_MODE === "web_bridge"
    ? process.env.PDD_SHORT_LINK_MODE
    : "web_bridge";
  const pddRequired = pddMode === "mini_program"
    ? ["PDD_MINIPROGRAM_APPID", "PDD_MINIPROGRAM_PATH_TEMPLATE"]
    : [];
  const payRequired = [
    "WECHAT_PAY_MCH_ID",
    "WECHAT_PAY_API_V3_KEY",
    "WECHAT_PAY_CERT_SERIAL_NO",
    "WECHAT_PAY_PRIVATE_KEY",
    "WECHAT_PAY_NOTIFY_URL",
  ];

  return {
    officialAccount: {
      configured: hasOfficialAccountCredentials,
      hasCover,
      draftUploadEnabled: process.env.WECHAT_DRAFT_UPLOAD_ENABLED === "true",
      dryRun: process.env.WECHAT_OFFICIAL_DRY_RUN !== "false",
      canPreview: true,
      canUploadDraft: hasOfficialAccountCredentials && hasCover,
      missing: missing(["WECHAT_APPID", "WECHAT_SECRET"]).concat(hasCover ? [] : ["WECHAT_DEFAULT_COVER_PATH_OR_MEDIA_ID"]),
    },
    miniProgram: {
      configured: missing(miniProgramRequired).length === 0,
      missing: missing(miniProgramRequired),
    },
    pddRedirect: {
      configured: missing(pddRequired).length === 0,
      mode: pddMode,
      fallbackMode: process.env.PDD_LINK_FALLBACK_MODE || "web_bridge",
      missing: missing(pddRequired),
    },
    pay: {
      configured: missing(payRequired).length === 0,
      missing: missing(payRequired),
    },
  };
}

const featureFlagConfig = {
  aiProvider: {
    env: "FEATURE_AI_PROVIDER",
    defaultValue: true,
  },
  dbRecommendationRules: {
    env: "FEATURE_DB_RECOMMENDATION_RULES",
    defaultValue: true,
  },
  analyticsPersistence: {
    env: "FEATURE_ANALYTICS_PERSISTENCE",
    defaultValue: true,
  },
  marketingAutomation: {
    env: "FEATURE_MARKETING_AUTOMATION",
    defaultValue: true,
  },
  marketingAutopilot: {
    env: "FEATURE_MARKETING_AUTOPILOT",
    defaultValue: true,
  },
  marketingContentAi: {
    env: "FEATURE_MARKETING_CONTENT_AI",
    defaultValue: false,
  },
  marketingEmailAi: {
    env: "FEATURE_MARKETING_EMAIL_AI",
    defaultValue: false,
  },
  marketingLandingAi: {
    env: "FEATURE_MARKETING_LANDING_AI",
    defaultValue: false,
  },
} as const;

export type FeatureFlagName = keyof typeof featureFlagConfig;

function parseFlag(value: string | undefined, defaultValue: boolean) {
  if (value === undefined || value.trim() === "") {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on", "enabled"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off", "disabled"].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

export function isFeatureEnabled(name: FeatureFlagName) {
  const config = featureFlagConfig[name];
  return parseFlag(process.env[config.env], config.defaultValue);
}

export function getFeatureFlagSnapshot() {
  return Object.fromEntries(
    (Object.keys(featureFlagConfig) as FeatureFlagName[]).map((name) => [
      name,
      isFeatureEnabled(name),
    ]),
  ) as Record<FeatureFlagName, boolean>;
}

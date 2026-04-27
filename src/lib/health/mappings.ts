export const canonicalSolutionSlugs = [
  "sleep",
  "fatigue",
  "liver",
  "immune",
  "male-health",
  "female-health",
] as const;

export const solutionTypeValues = [
  "sleep",
  "fatigue",
  "liver",
  "immune",
  "male_health",
  "female_health",
  "general",
] as const;

export type SolutionSlug = (typeof canonicalSolutionSlugs)[number];
export type SolutionType = (typeof solutionTypeValues)[number];
export type RoutedSolutionType = Exclude<SolutionType, "general">;

const solutionTypeSlugMap: Record<RoutedSolutionType, SolutionSlug> = {
  sleep: "sleep",
  fatigue: "fatigue",
  liver: "liver",
  immune: "immune",
  male_health: "male-health",
  female_health: "female-health",
};

const solutionSlugTypeMap: Record<SolutionSlug, RoutedSolutionType> = {
  sleep: "sleep",
  fatigue: "fatigue",
  liver: "liver",
  immune: "immune",
  "male-health": "male_health",
  "female-health": "female_health",
};

const solutionSlugAliasMap: Record<string, SolutionSlug> = {
  sleep: "sleep",
  "sleep-support": "sleep",
  fatigue: "fatigue",
  "fatigue-support": "fatigue",
  liver: "liver",
  "liver-health": "liver",
  immune: "immune",
  "immune-support": "immune",
  "male-health": "male-health",
  male_health: "male-health",
  malehealth: "male-health",
  "female-health": "female-health",
  female_health: "female-health",
  femalehealth: "female-health",
  "women-health": "female-health",
  women_health: "female-health",
  "womens-health": "female-health",
  womens_health: "female-health",
};

export function isSolutionType(value: string): value is SolutionType {
  return (solutionTypeValues as readonly string[]).includes(value);
}

export function normalizeSolutionType(value: string | null | undefined): SolutionType | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace(/-/g, "_");
  return isSolutionType(normalized) ? normalized : null;
}

export function normalizeSolutionSlug(value: string | null | undefined): SolutionSlug | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return solutionSlugAliasMap[normalized] ?? null;
}

export function solutionTypeToSlug(type: SolutionType): SolutionSlug {
  if (type === "general") {
    return "fatigue";
  }

  return solutionTypeSlugMap[type];
}

export function solutionSlugToType(slug: string | null | undefined): RoutedSolutionType | null {
  const canonicalSlug = normalizeSolutionSlug(slug);
  return canonicalSlug ? solutionSlugTypeMap[canonicalSlug] : null;
}

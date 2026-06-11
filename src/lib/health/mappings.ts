// Solution slug normalization and mapping utilities

export const canonicalSolutionSlugs = [
  'sleep',
  'fatigue',
  'liver',
  'immune',
  'male-health',
  'female-health',
] as const;

export type SolutionSlug = typeof canonicalSolutionSlugs[number];
export type RoutedSolutionType = SolutionType;

// Solution types used in AI recommendation results
export const solutionTypeValues = [
  'sleep',
  'fatigue',
  'liver',
  'immune',
  'male_health',
  'female_health',
  'general',
] as const;
export type SolutionType = typeof solutionTypeValues[number];

export function normalizeSolutionSlug(slug: string | null | undefined): SolutionSlug | undefined {
  if (!slug) return undefined;
  const map: Record<string, SolutionSlug> = {
    sleep: 'sleep',
    fatigue: 'fatigue',
    liver: 'liver',
    immune: 'immune',
    'male-health': 'male-health',
    'female-health': 'female-health',
    '睡眠': 'sleep',
    '疲劳': 'fatigue',
    '肝脏': 'liver',
    '免疫': 'immune',
    '男性': 'male-health',
    '女性': 'female-health',
  };
  return map[slug.toLowerCase()];
}

export function normalizeSolutionType(type: string): SolutionType | undefined {
  const all: SolutionType[] = ['sleep', 'fatigue', 'liver', 'immune', 'male_health', 'female_health', 'general'];
  return all.includes(type as SolutionType) ? type as SolutionType : undefined;
}

export function solutionTypeToSlug(type: string): SolutionSlug | undefined {
  const map: Record<string, string> = {
    sleep: 'sleep',
    fatigue: 'fatigue',
    liver: 'liver',
    immune: 'immune',
    'male-health': 'male-health',
    'female-health': 'female-health',
    // internal types (underscore form)
    male_health: 'male-health',
    female_health: 'female-health',
  };
  return map[type.toLowerCase()] as SolutionSlug | undefined;
}

export function solutionSlugToType(slug: string): string | undefined {
  const map: Record<string, string> = {
    sleep: 'sleep',
    fatigue: 'fatigue',
    liver: 'liver',
    immune: 'immune',
    'male-health': 'male_health',
    'female-health': 'female_health',
  };
  return map[slug.toLowerCase()];
}

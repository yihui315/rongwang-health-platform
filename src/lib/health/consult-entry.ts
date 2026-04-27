import {
  normalizeSolutionSlug,
  normalizeSolutionType,
  solutionTypeToSlug,
  type SolutionSlug,
} from "@/lib/health/mappings";

function resolveCanonicalSolutionSlug(
  value: string | null | undefined,
): SolutionSlug | null {
  const slug = normalizeSolutionSlug(value);
  if (slug) {
    return slug;
  }

  const solutionType = normalizeSolutionType(value);
  if (!solutionType || solutionType === "general") {
    return null;
  }

  return solutionTypeToSlug(solutionType);
}

export function getAiConsultHrefForValue(
  value: string | null | undefined,
): string {
  const slug = resolveCanonicalSolutionSlug(value);
  return slug ? `/ai-consult?focus=${slug}` : "/ai-consult";
}

export function getAiConsultHrefForValues(
  values: readonly (string | null | undefined)[],
): string {
  for (const value of values) {
    const slug = resolveCanonicalSolutionSlug(value);
    if (slug) {
      return `/ai-consult?focus=${slug}`;
    }
  }

  return "/ai-consult";
}

export function getSolutionHrefForValue(
  value: string | null | undefined,
): string | null {
  const slug = resolveCanonicalSolutionSlug(value);
  return slug ? `/solutions/${slug}` : null;
}

export function getSolutionHrefForValues(
  values: readonly (string | null | undefined)[],
): string | null {
  for (const value of values) {
    const solutionHref = getSolutionHrefForValue(value);
    if (solutionHref) {
      return solutionHref;
    }
  }

  return null;
}

export function getAssessmentHrefForValue(
  value: string | null | undefined,
): string | null {
  const slug = resolveCanonicalSolutionSlug(value);
  return slug ? `/assessment/${slug}` : null;
}

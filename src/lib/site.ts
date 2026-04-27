export const DEFAULT_SITE_URL = "https://rongwang.health";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export function createCanonicalUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

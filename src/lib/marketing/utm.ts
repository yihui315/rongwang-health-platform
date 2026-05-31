export type UTMInput = {
  baseUrl: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

export function buildUtmUrl(input: UTMInput): string {
  if (!input.baseUrl.trim()) {
    return '';
  }

  try {
    const url = new URL(input.baseUrl);
    url.searchParams.set('utm_source', input.source ?? 'rongwang');
    url.searchParams.set('utm_medium', input.medium ?? 'pdd_referral');
    url.searchParams.set('utm_campaign', input.campaign ?? 'fast_funnel_v2');

    if (input.content) {
      url.searchParams.set('utm_content', input.content);
    }

    if (input.term) {
      url.searchParams.set('utm_term', input.term);
    }

    return url.toString();
  } catch {
    return '';
  }
}

export type SupportedSource = 'jd' | 'pdd' | 'unknown';

export type FetchProductInput = {
  sourceUrl: string;
  createdBy?: string;
};

export type RawProductPayload = {
  title?: string;
  price?: string;
  images?: string[];
  specs?: Record<string, string>;
  sourceUrl: string;
  source: SupportedSource;
};

export type NormalizedProduct = {
  source: SupportedSource;
  sourceUrl: string;
  externalId: string | null;
  title: string;
  subtitle: string | null;
  brand: string | null;
  originCountry: string | null;
  category: string | null;
  priceText: string | null;
  specs: Record<string, string>;
  rawPayload: RawProductPayload;
};

export function detectSource(url: string): SupportedSource {
  const hostname = new URL(url).hostname.toLowerCase();

  if (hostname === 'jd.com' || hostname.endsWith('.jd.com')) return 'jd';
  if (
    hostname === 'pinduoduo.com' ||
    hostname.endsWith('.pinduoduo.com') ||
    hostname === 'yangkeduo.com' ||
    hostname.endsWith('.yangkeduo.com')
  ) {
    return 'pdd';
  }

  return 'unknown';
}

export function validateUrl(url: string): void {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid product URL');
  }

  if (!['https:', 'http:'].includes(parsed.protocol)) {
    throw new Error('Unsupported product URL protocol');
  }

  if (detectSource(url) === 'unknown') {
    throw new Error('Unsupported product source');
  }
}

async function fetchRawProduct(input: FetchProductInput): Promise<RawProductPayload> {
  const source = detectSource(input.sourceUrl);

  return {
    sourceUrl: input.sourceUrl,
    source,
    title: '示例商品标题',
    price: '¥199',
    images: [],
    specs: {
      规格: '60 粒',
      产地: 'Australia',
    },
  };
}

export function normalizeProduct(raw: RawProductPayload): NormalizedProduct {
  return {
    source: raw.source,
    sourceUrl: raw.sourceUrl,
    externalId: null,
    title: raw.title || '未命名商品',
    subtitle: null,
    brand: null,
    originCountry: raw.specs?.产地 || null,
    category: null,
    priceText: raw.price || null,
    specs: raw.specs || {},
    rawPayload: raw,
  };
}

export async function runFetchProductAgent(input: FetchProductInput): Promise<NormalizedProduct> {
  validateUrl(input.sourceUrl);
  const raw = await fetchRawProduct(input);
  return normalizeProduct(raw);
}

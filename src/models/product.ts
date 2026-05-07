export type Product = {
  id: string;
  source: string;
  sourceUrl: string;
  title: string;
  subtitle?: string | null;
  brand?: string | null;
  originCountry?: string | null;
  category?: string | null;
  priceText?: string | null;
  specs: Record<string, string>;
  status: 'draft' | 'imported' | 'approved' | 'rejected';
};

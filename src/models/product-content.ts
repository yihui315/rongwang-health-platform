export type ProductContent = {
  id: string;
  productId: string;
  shortTitle: string;
  shortDescription: string;
  longDescription: string;
  seoKeywords: string[];
  faqDraft: string[];
  disclaimer: string;
  riskFlags: string[];
  status: 'generated' | 'pending_manual_review' | 'approved' | 'rejected';
};

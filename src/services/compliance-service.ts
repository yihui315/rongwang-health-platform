export type ComplianceReviewStatus = 'pending_manual_review' | 'compliance_flagged';

export type ComplianceScanResult = {
  reviewStatus: ComplianceReviewStatus;
  riskLevel: 'low' | 'medium' | 'high';
  riskFlags: string[];
};

const bannedWords = ['治疗', '治愈', '根治', '医治', '临床证明可治疗', '替代处方药', '抗衰老神药', '百病可用', '神药'];
const highRiskCategoryWords = ['NMN', '激素', '减肥', '壮阳', '性功能', '抗衰老', '药效'];
const healthDisclaimer = '本品不能替代药物';
const crossBorderDisclaimer = '原产国标准';

export function scanCompliance(text: string, disclaimer = ''): ComplianceScanResult {
  const haystack = `${text} ${disclaimer}`;
  const riskFlags = [
    ...bannedWords.filter((word) => haystack.includes(word)),
    ...highRiskCategoryWords.filter((word) => haystack.includes(word)),
  ];

  if (!disclaimer.includes(healthDisclaimer)) {
    riskFlags.push('missing_health_disclaimer');
  }

  if (!disclaimer.includes(crossBorderDisclaimer)) {
    riskFlags.push('missing_cross_border_disclaimer');
  }

  const uniqueRiskFlags = [...new Set(riskFlags)];

  return {
    reviewStatus: uniqueRiskFlags.length > 0 ? 'compliance_flagged' : 'pending_manual_review',
    riskLevel: uniqueRiskFlags.length > 2 ? 'high' : uniqueRiskFlags.length > 0 ? 'medium' : 'low',
    riskFlags: uniqueRiskFlags,
  };
}

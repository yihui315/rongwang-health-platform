export const riskWords = [
  "治愈",
  "根治",
  "保证有效",
  "立刻见效",
  "第一",
  "最强",
  "无副作用"
];

export function hasRiskWords(text: string) {
  return riskWords.some((word) => text.includes(word));
}

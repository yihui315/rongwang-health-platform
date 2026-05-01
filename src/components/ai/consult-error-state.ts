const fallbackConsultErrorMessage =
  "AI 评估暂时没有完成，请稍后再试，或先联系在线顾问。";

export function buildConsultErrorMessage(status: number, fallback?: string) {
  if (status === 400) {
    return (
      fallback ||
      "输入信息校验未通过，请检查年龄、症状、持续时间和健康目标。"
    );
  }

  if (status === 429) {
    return "请求过于频繁，请稍后再试。";
  }

  if (status >= 500) {
    return (
      fallback ||
      "AI 服务暂时不可用，系统会尽量使用规则兜底，请稍后重试。"
    );
  }

  return fallback || fallbackConsultErrorMessage;
}

export function buildInvalidConsultResponseMessage() {
  return "AI 返回结果格式不完整，请稍后再试。";
}

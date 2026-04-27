import type { Metadata } from "next";
import ConsultExperience from "@/components/ai/ConsultExperience";

export const metadata: Metadata = {
  title: "AI 健康咨询",
  description: "填写年龄、症状、生活方式与健康目标，获取 AI 风险分层、生活建议和问题方案入口。",
};

export default function AIConsultPage() {
  return <ConsultExperience />;
}

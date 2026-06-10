import type { Metadata } from "next";
import ConsultExperience from "@/components/ai/ConsultExperience";

export const metadata: Metadata = {
  title: "AI 健康咨詢",
  description: "填寫年齡、症狀、生活方式與健康目標，獲取 AI 風險分層、生活建議和問題方案入口。",
};

export default function AIConsultPage() {
  return <ConsultExperience />;
}

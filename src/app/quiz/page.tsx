import { redirect } from "next/navigation";
import { getAiConsultHrefForValue } from "@/lib/health/consult-entry";

type QuizPageProps = {
  searchParams: Promise<{ pre?: string; focus?: string }>;
};

export default async function QuizPage({ searchParams }: QuizPageProps) {
  const { pre, focus } = await searchParams;
  redirect(getAiConsultHrefForValue(focus ?? pre));
}

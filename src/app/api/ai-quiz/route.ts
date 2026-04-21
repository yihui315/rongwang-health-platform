import { NextRequest, NextResponse } from 'next/server';
import { PlanSlug } from '@/types';
import { summarizeQuiz } from '@/lib/ai-brain';
import { getSupabase } from '@/lib/supabase';

interface QuizAnswerPayload {
  questionId: number;
  answer: string;
}

// Symptom to plan mapping
const symptomToPlanMap: Record<string, PlanSlug> = {
  // Fatigue symptoms
  '疲劳': 'fatigue',
  '无力': 'fatigue',
  '精力不足': 'fatigue',
  '经常感到疲惫': 'fatigue',
  '工作累': 'fatigue',

  // Sleep symptoms
  '失眠': 'sleep',
  '入睡困难': 'sleep',
  '睡眠浅': 'sleep',
  '夜间醒': 'sleep',
  '睡眠质量差': 'sleep',
  '多梦': 'sleep',

  // Immune symptoms
  '免疫力弱': 'immune',
  '容易感冒': 'immune',
  '换季易生病': 'immune',
  '体质差': 'immune',
  '经常生病': 'immune',

  // Stress symptoms
  '压力大': 'stress',
  '焦虑': 'stress',
  '紧张': 'stress',
  '情绪波动': 'stress',
  '神经衰弱': 'stress',
  '易怒': 'stress',

  // Liver symptoms
  '喝酒': 'liver',
  '应酬': 'liver',
  '熬夜': 'liver',
  '肝脏': 'liver',
  '解酒': 'liver',
  '宿醉': 'liver',

  // Beauty symptoms
  '皮肤': 'beauty',
  '减肥': 'beauty',
  '抗衰': 'beauty',
  '美白': 'beauty',
  '代谢': 'beauty',
  '气色': 'beauty',
  '身材': 'beauty',

  // Cardio symptoms
  '三高': 'cardio',
  '血压': 'cardio',
  '血糖': 'cardio',
  '血脂': 'cardio',
  '心脑': 'cardio',
  '记忆力': 'cardio',
  '尿酸': 'cardio',
};

function recommendPlans(answers: QuizAnswerPayload[]): PlanSlug[] {
  const planScores: Record<PlanSlug, number> = {
    fatigue: 0,
    sleep: 0,
    immune: 0,
    stress: 0,
    liver: 0,
    beauty: 0,
    cardio: 0,
  };

  // Score each answer
  for (const answer of answers) {
    const lowerAnswer = answer.answer.toLowerCase();

    // Check for symptom keywords
    for (const [symptom, plan] of Object.entries(symptomToPlanMap)) {
      if (lowerAnswer.includes(symptom) || symptom.includes(lowerAnswer)) {
        planScores[plan]++;
      }
    }

    // Also check the answer text directly
    for (const plan of Object.keys(planScores) as PlanSlug[]) {
      if (lowerAnswer.includes(plan)) {
        planScores[plan]++;
      }
    }
  }

  // Get recommendations (sort by score, take top 2)
  const recommendations = (Object.entries(planScores) as [PlanSlug, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([plan]) => plan)
    .filter(plan => planScores[plan] > 0);

  // If no strong recommendations, suggest all plans
  if (recommendations.length === 0) {
    return ['fatigue', 'sleep', 'immune', 'stress'];
  }

  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const answers: QuizAnswerPayload[] = body.answers;

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid answers array' },
        { status: 400 }
      );
    }

    // Get recommendations based on answers
    const recommendations = recommendPlans(answers);

    // AI-enhanced personalised summary (falls back to template when AI offline)
    const aiSummary = await summarizeQuiz(answers, recommendations);

    // Persist result (stub-safe — no-op when Supabase not configured)
    try {
      await getSupabase().from('quiz_results').insert({
        answers,
        recommendations,
        ai_summary: aiSummary,
      });
    } catch {
      /* ignore storage failure — recommendation still returned */
    }

    return NextResponse.json({
      recommendations,
      aiSummary,
      message: '根据您的回答，我们为您推荐以下方案'
    });
  } catch (error) {
    console.error('Quiz processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process quiz answers' },
      { status: 500 }
    );
  }
}

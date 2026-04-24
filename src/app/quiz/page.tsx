'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PurchaseButton from '@/components/ui/PurchaseButton';
import WeChatCTA from '@/components/ui/WeChatCTA';
import LeadCaptureModal, { type LeadData } from '@/components/ui/LeadCaptureModal';
import { plans } from '@/data/plans';
import type { PlanSlug } from '@/types';

interface Question {
  id: number;
  text: string;
  options: { label: string; value: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: '你最近最困扰的健康问题是什么？',
    options: [
      { label: '经常感到疲惫，精力不足', value: '经常感到疲惫' },
      { label: '睡眠质量差，入睡困难', value: '睡眠质量差' },
      { label: '容易感冒，免疫力弱', value: '容易感冒' },
      { label: '压力大，容易焦虑紧张', value: '压力大' },
    ],
  },
  {
    id: 2,
    text: '你的日常工作状态是？',
    options: [
      { label: '高强度脑力劳动，久坐不动', value: '工作累' },
      { label: '作息不规律，经常熬夜', value: '入睡困难' },
      { label: '经常出差，环境变化大', value: '换季易生病' },
      { label: '压力极大，需要持续高效输出', value: '焦虑' },
    ],
  },
  {
    id: 3,
    text: '你有以下哪种情况？',
    options: [
      { label: '下午容易犯困，需要咖啡续命', value: '精力不足' },
      { label: '躺在床上脑子停不下来', value: '失眠' },
      { label: '换季时特别容易生病', value: '免疫力弱' },
      { label: '情绪波动大，容易烦躁', value: '情绪波动' },
    ],
  },
  {
    id: 4,
    text: '你的饮食习惯是？',
    options: [
      { label: '经常外卖，营养不均衡', value: '疲劳' },
      { label: '晚上吃得晚，睡前有进食', value: '多梦' },
      { label: '水果蔬菜吃得少', value: '体质差' },
      { label: '咖啡/茶摄入过多', value: '紧张' },
    ],
  },
  {
    id: 5,
    text: '你希望改善到什么程度？',
    options: [
      { label: '白天精力充沛，不再依赖咖啡', value: '无力' },
      { label: '能快速入睡，一觉到天亮', value: '夜间醒' },
      { label: '整个换季不感冒', value: '经常生病' },
      { label: '心态平和，从容应对工作', value: '神经衰弱' },
    ],
  },
];

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0); // 0=intro, 1-5=questions, 6=loading, 7=lead-capture, 8=results
  const [answers, setAnswers] = useState<{ questionId: number; answer: string }[]>([]);
  const [recommendations, setRecommendations] = useState<PlanSlug[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadData, setLeadData] = useState<LeadData | null>(null);

  const handleAnswer = (questionId: number, answer: string) => {
    const newAnswers = [...answers.filter((a) => a.questionId !== questionId), { questionId, answer }];
    setAnswers(newAnswers);

    if (currentStep < questions.length) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const handleSubmit = async () => {
    setCurrentStep(questions.length + 1); // loading
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) throw new Error('Failed');

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setAiSummary(data.aiSummary || '');
      // Open lead capture gate BEFORE showing results
      setShowLeadModal(true);
      setCurrentStep(questions.length + 2); // lead-capture step (modal handles visibility)
    } catch (error) {
      console.error('Quiz error:', error);
      setRecommendations(['fatigue', 'sleep', 'immune', 'stress']);
      setShowLeadModal(true);
      setCurrentStep(questions.length + 2);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (data: LeadData) => {
    // Persist lead + quiz result to backend
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, answers, recommendations, aiSummary }),
      });
    } catch {
      // Non-blocking — show results regardless
    }
    setLeadData(data);
    setShowLeadModal(false);
    setCurrentStep(questions.length + 3); // results
  };

  const handleCloseLeadModal = () => {
    // Allow skipping lead capture but still show results
    setShowLeadModal(false);
    setLeadData(null);
    setCurrentStep(questions.length + 3); // results
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setRecommendations([]);
    setAiSummary('');
    setLeadData(null);
  };

  const recommendedPlans = plans.filter((p) => recommendations.includes(p.slug as PlanSlug));

  // ─── INTRO ───────────────────────────────────────────────────────────────────
  if (currentStep === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-teal-600 to-white px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 mb-8">
            <span className="text-4xl">🔬</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">AI健康检测</h1>
          <p className="text-lg text-white/80 mb-2">3分钟快速评估，找到最适合你的健康方案</p>
          <p className="text-white/60 mb-10">基于AI分析 + 专业营养学，为你精准推荐</p>

          <div className="mb-10 grid gap-4 md:grid-cols-3 text-left">
            {[
              { icon: '📋', title: '5道问题', desc: '简单选择，无需医学知识' },
              { icon: '🤖', title: 'AI分析', desc: '智能匹配最佳方案' },
              { icon: '🎁', title: '专属方案', desc: '获取个性化推荐和指导' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-white/90 p-5">
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(1)}
            className="rounded-full bg-white text-orange-600 px-10 py-4 text-lg font-bold hover:bg-orange-50 transition-colors active:scale-95 shadow-lg"
          >
            开始检测
          </button>
        </div>
      </main>
    );
  }

  // ─── QUESTIONS ───────────────────────────────────────────────────────────────
  if (currentStep >= 1 && currentStep <= questions.length) {
    const question = questions[currentStep - 1];
    const selectedAnswer = answers.find((a) => a.questionId === question.id)?.answer;

    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
              <span>
                第 {currentStep}/{questions.length} 题
              </span>
              <span>{Math.round((currentStep / questions.length) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-teal transition-all duration-500"
                style={{ width: `${(currentStep / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-8">{question.text}</h2>

          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(question.id, option.value)}
                className={`w-full text-left rounded-xl border p-5 transition-all ${
                  selectedAnswer === option.value
                    ? 'border-teal bg-teal/5 ring-2 ring-teal'
                    : 'border-slate-200 bg-white hover:border-teal/50 hover:shadow-sm'
                }`}
              >
                <span className="text-slate-900 font-medium">{option.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              ← 上一题
            </button>

            {currentStep === questions.length && answers.length >= questions.length && (
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-orange px-8 py-3 font-semibold text-white hover:bg-orange/90 transition-colors"
              >
                查看结果
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ─── LOADING ─────────────────────────────────────────────────────────────────
  if (currentStep === questions.length + 1) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 mb-6 animate-pulse">
            <span className="text-3xl">🤖</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">AI正在分析您的健康状况...</h2>
          <p className="text-slate-500">综合评估中，请稍候</p>
          <div className="mt-8 flex justify-center gap-1">
            {[0, 150, 300].map((delay) => (
              <div
                key={delay}
                className="h-3 w-3 rounded-full bg-teal animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ─── RESULTS (shown after lead capture or skip) ──────────────────────────────
  if (currentStep === questions.length + 3) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Lead context banner */}
          {leadData && (
            <div className="mb-6 rounded-xl bg-teal/5 border border-teal/20 px-5 py-3 text-sm text-teal-700 flex items-center gap-2">
              <span>✅</span>
              <span>
                <strong>{leadData.name}</strong>，你的健康档案已创建
                {leadData.phone && ` — 我们将联系你：{leadData.phone}`}
              </span>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 mb-4">
              <svg className="h-8 w-8 text-teal" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">你的AI健康检测报告</h1>
            <p className="text-slate-600">根据你的回答，AI为你推荐以下健康方案</p>

            {/* AI Summary */}
            {aiSummary && (
              <div className="mt-6 mx-auto max-w-xl rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal/20 p-6 text-left">
                <p className="text-sm font-semibold text-teal mb-2 flex items-center gap-1.5">
                  <span>🤖</span> AI营养顾问解读
                </p>
                <p className="text-slate-700 leading-relaxed text-[15px]">{aiSummary}</p>
              </div>
            )}
          </div>

          {/* Recommended Plans */}
          <div className="space-y-6 mb-10">
            {recommendedPlans.map((plan) => (
              <div
                key={plan.slug}
                className="rounded-2xl bg-white p-6 md:p-8 border border-slate-200 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Plan info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{plan.icon}</span>
                      <span className="inline-block rounded-full bg-teal/10 px-3 py-1 text-xs font-medium text-teal">
                        推荐方案
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-slate-600 mt-1 text-sm">{plan.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {plan.ingredients.map((ing) => (
                        <span
                          key={ing}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Purchase + link */}
                  <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-2xl font-bold text-slate-900">¥{plan.price}</span>
                      <span className="text-slate-500 text-sm">/月</span>
                    </div>
                    <PurchaseButton slug={plan.slug as PlanSlug} />
                    <Link
                      href={`/plans/${plan.slug}`}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium underline underline-offset-2"
                    >
                      查看方案详情
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* WeChat CTA + restart */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* WeChat contact */}
            <WeChatCTA
              title="健康顾问1对1服务"
              description="扫码领取你的专属方案，专业营养师全程指导"
              cardMode={true}
            />

            {/* Right: value add + restart */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-center gap-4">
              <div className="space-y-3">
                {[
                  '📊 完整AI健康分析报告',
                  '🎯 针对性产品搭配建议',
                  '💬 营养师1对1咨询',
                  '📦 正规跨境保健品保障',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="text-teal">✓</span>
                    <span className="text-slate-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={restart}
                className="mt-2 text-slate-500 hover:text-slate-900 transition-colors text-sm underline"
              >
                重新检测
              </button>
            </div>
          </div>
        </div>

        {/* Lead capture modal */}
        <LeadCaptureModal
          isOpen={showLeadModal}
          onClose={handleCloseLeadModal}
          onSubmit={handleLeadSubmit}
        />
      </main>
    );
  }

  return null;
}

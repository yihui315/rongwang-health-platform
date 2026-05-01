"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ConsultForm from "@/components/ai/ConsultForm";
import ConsultResponsePanel from "@/components/ai/ConsultResponsePanel";
import {
  buildConsultErrorMessage,
  buildInvalidConsultResponseMessage,
} from "@/components/ai/consult-error-state";
import {
  firstConsultFormErrorMessage,
  initialConsultFormState,
  type ConsultFormState,
} from "@/components/ai/consult-form-state";
import {
  consultationResponseSchema,
  type ConsultationResponse,
} from "@/schemas/consultation-response";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { healthProfileSchema } from "@/schemas/health";
import { getSolutionGuideBySlug } from "@/lib/health/solutions";

function buildSeededFormState(
  focusGuide: ReturnType<typeof getSolutionGuideBySlug>,
): ConsultFormState {
  const baseState: ConsultFormState = {
    ...initialConsultFormState,
    symptoms: [...initialConsultFormState.symptoms],
  };

  if (!focusGuide) {
    return baseState;
  }

  return {
    ...baseState,
    symptoms: focusGuide.commonSymptoms.slice(0, 2),
    goal: `想优先改善${focusGuide.shortTitle}相关问题`,
  };
}

export default function ConsultExperience() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<ConsultFormState>(() =>
    buildSeededFormState(undefined),
  );
  const [customSymptom, setCustomSymptom] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<ConsultationResponse | null>(null);
  const requestAbortRef = useRef<AbortController | null>(null);

  const focus = searchParams.get("focus");
  const focusGuide = useMemo(
    () => getSolutionGuideBySlug(focus ?? ""),
    [focus],
  );

  useEffect(() => {
    if (!focusGuide) {
      return;
    }

    const seededState = buildSeededFormState(focusGuide);
    setForm((current) => ({
      ...current,
      symptoms: current.symptoms.length > 0 ? current.symptoms : seededState.symptoms,
      goal:
        current.goal && current.goal !== initialConsultFormState.goal
          ? current.goal
          : seededState.goal,
    }));
  }, [focusGuide]);

  useEffect(
    () => () => {
      requestAbortRef.current?.abort();
    },
    [],
  );

  function toggleSymptom(symptom: string) {
    setForm((current) => ({
      ...current,
      symptoms: current.symptoms.includes(symptom)
        ? current.symptoms.filter((item) => item !== symptom)
        : [...current.symptoms, symptom].slice(0, 8),
    }));
  }

  function addCustomSymptom() {
    const value = customSymptom.trim();
    if (!value) {
      return;
    }

    if (!form.symptoms.includes(value)) {
      setForm((current) => ({
        ...current,
        symptoms: [...current.symptoms, value].slice(0, 8),
      }));
    }

    setCustomSymptom("");
  }

  function clearCurrentResult() {
    setError("");
    setResponse(null);
  }

  function resetForm() {
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    setIsSubmitting(false);
    setCustomSymptom("");
    setForm(buildSeededFormState(focusGuide));
    setError("");
    setResponse(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const payload = {
      profile: {
        age: Number(form.age),
        gender: form.gender,
        symptoms: form.symptoms,
        duration: form.duration,
        lifestyle: {
          sleep: form.sleep,
          alcohol: form.alcohol,
          smoking: form.smoking,
          exercise: form.exercise,
        },
        goal: form.goal,
        medications: form.medications,
        allergies: form.allergies,
      },
    };

    const parsed = healthProfileSchema.safeParse(payload.profile);
    if (!parsed.success) {
      setError(firstConsultFormErrorMessage(parsed));
      return;
    }

    setResponse(null);
    setIsSubmitting(true);
    requestAbortRef.current?.abort();
    const controller = new AbortController();
    requestAbortRef.current = controller;

    try {
      trackAnalyticsEvent({
        name: "assessment_started",
        source: "ai-consult",
        solutionSlug: focusGuide?.slug,
      });

      const result = await fetch("/api/ai/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({ profile: parsed.data }),
      });

      const data = (await result.json()) as ConsultationResponse & { error?: string };
      if (!result.ok) {
        throw new Error(buildConsultErrorMessage(result.status, data.error));
      }

      const validated = consultationResponseSchema.safeParse(data);
      if (!validated.success) {
        throw new Error(buildInvalidConsultResponseMessage());
      }

      setResponse(validated.data);
      trackAnalyticsEvent({
        name: "assessment_completed",
        consultationId: validated.data.consultationId,
        source: "ai-consult",
        solutionSlug: focusGuide?.slug,
        metadata: {
          riskLevel: validated.data.result.riskLevel,
          recommendationCount: validated.data.recommendations.length,
        },
      });
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === "AbortError") {
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : buildConsultErrorMessage(0),
      );
    } finally {
      if (requestAbortRef.current === controller) {
        requestAbortRef.current = null;
        setIsSubmitting(false);
      }
    }
  }

  return (
    <main className="bg-[var(--bg)]">
      <section className="border-b border-slate-100 bg-white">
        <div className="section-container py-14 md:py-16">
          <div className="max-w-3xl">
            <span className="badge-teal">AI评估</span>
            <h1 className="mt-4 text-balance text-slate-900">AI健康评估主入口</h1>
            <p className="mt-4 text-lg leading-8 text-slate-500">
              先收集年龄、主要困扰和生活方式，再生成风险分层、生活建议、营养支持方向与可控购买入口。
            </p>
          </div>
        </div>
      </section>

      <section className="section-container py-12 md:py-16">
        <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <ConsultForm
            form={form}
            customSymptom={customSymptom}
            focusLabel={focusGuide?.shortTitle}
            error={error}
            hasResponse={Boolean(response)}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onAgeChange={(value) =>
              setForm((current) => ({ ...current, age: value }))
            }
            onGenderChange={(value) =>
              setForm((current) => ({ ...current, gender: value }))
            }
            onToggleSymptom={toggleSymptom}
            onCustomSymptomChange={setCustomSymptom}
            onAddCustomSymptom={addCustomSymptom}
            onDurationChange={(value) =>
              setForm((current) => ({ ...current, duration: value }))
            }
            onSleepChange={(value) =>
              setForm((current) => ({ ...current, sleep: value }))
            }
            onExerciseChange={(value) =>
              setForm((current) => ({ ...current, exercise: value }))
            }
            onGoalChange={(value) =>
              setForm((current) => ({ ...current, goal: value }))
            }
            onAlcoholChange={(value) =>
              setForm((current) => ({ ...current, alcohol: value }))
            }
            onSmokingChange={(value) =>
              setForm((current) => ({ ...current, smoking: value }))
            }
            onMedicationsChange={(value) =>
              setForm((current) => ({ ...current, medications: value }))
            }
            onAllergiesChange={(value) =>
              setForm((current) => ({ ...current, allergies: value }))
            }
            onClearResult={clearCurrentResult}
            onResetForm={resetForm}
          />

          <ConsultResponsePanel
            response={response}
            error={error}
            isSubmitting={isSubmitting}
          />
        </div>
      </section>
    </main>
  );
}

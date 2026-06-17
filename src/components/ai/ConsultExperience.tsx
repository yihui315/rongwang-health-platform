"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ConsultForm from "@/components/ai/ConsultForm";
import ConsultResponsePanel from "@/components/ai/ConsultResponsePanel";
import AssessmentConsentCard from "@/components/ai/AssessmentConsentCard";
import {
  buildConsultErrorMessage,
  buildInvalidConsultResponseMessage,
} from "@/components/ai/consult-error-state";
import {
  applyScenarioToConsultFormState,
  buildScenarioConsultFormState,
  firstConsultFormErrorMessage,
  initialConsultFormState,
  type ConsultFormState,
} from "@/components/ai/consult-form-state";
import {
  consultationResponseSchema,
  type ConsultationResponse,
} from "@/schemas/consultation-response";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { persistProductSuitabilityAssessment } from "@/lib/product-suitability";
import { healthProfileSchema } from "@/schemas/health";
import { getSolutionGuideBySlug } from "@/lib/health/solutions";
import {
  ASSESSMENT_RULE_VERSION,
  ASSESSMENT_VERSION,
  assessmentScenarioOptions,
  createAssessmentId,
  createAssessmentRouterContext,
  getAssessmentScenarioLabel,
  updateAssessmentRouterContextScenario,
  type AssessmentRouterContext,
  type AssessmentScenario,
} from "@/schemas/assessment-router";
import {
  ASSESSMENT_CONSENT_SOURCE,
  createAssessmentConsentRecord,
  getAssessmentConsentAnalyticsMetadata,
  type AssessmentConsent,
} from "@/schemas/assessment-consent";

interface ConsultExperienceProps {
  assessmentRouter?: {
    entryScenario: AssessmentScenario;
    entrySource: string;
  };
}

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

function persistAssessmentContext(context: AssessmentRouterContext) {
  try {
    window.localStorage.setItem(
      "rongwang_assessment_router_context",
      JSON.stringify(context),
    );
  } catch {
    // Local persistence is best-effort only.
  }
}

function persistAssessmentConsent(consent: AssessmentConsent) {
  try {
    window.localStorage.setItem(
      "rongwang_assessment_consent",
      JSON.stringify(consent),
    );
    window.localStorage.setItem(
      `rongwang_assessment_consent:${consent.assessment_id}`,
      JSON.stringify(consent),
    );
  } catch {
    // Local persistence is best-effort only.
  }
}

function scenarioToSolutionSlug(scenario: AssessmentScenario) {
  const slugMap: Record<AssessmentScenario, string | undefined> = {
    unknown: undefined,
    sleep: "sleep",
    fatigue: "fatigue",
    alcohol: "liver",
    immunity: "immune",
    female: "female-health",
    male: "male-health",
  };

  return slugMap[scenario];
}

export default function ConsultExperience({ assessmentRouter }: ConsultExperienceProps) {
  const searchParams = useSearchParams();
  const routerEnabled = Boolean(assessmentRouter);
  const initialScenario = assessmentRouter?.entryScenario ?? "unknown";
  const [selectedScenario, setSelectedScenario] = useState<AssessmentScenario>(initialScenario);
  const [assessmentContext, setAssessmentContext] = useState<AssessmentRouterContext | null>(() =>
    assessmentRouter
      ? createAssessmentRouterContext({
          entryScenario: assessmentRouter.entryScenario,
          selectedScenario: assessmentRouter.entryScenario,
          entrySource: assessmentRouter.entrySource,
        })
      : null,
  );
  const [form, setForm] = useState<ConsultFormState>(() =>
    assessmentRouter
      ? buildScenarioConsultFormState(assessmentRouter.entryScenario)
      : buildSeededFormState(undefined),
  );
  const [customSymptom, setCustomSymptom] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<ConsultationResponse | null>(null);
  const [reportConsentChecked, setReportConsentChecked] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [assessmentConsent, setAssessmentConsent] = useState<AssessmentConsent | null>(null);
  const [consentError, setConsentError] = useState("");
  const requestAbortRef = useRef<AbortController | null>(null);
  const loadedAssessmentRef = useRef<string | null>(null);
  const consentAssessmentIdRef = useRef<string | null>(null);
  const privacyViewAssessmentRef = useRef<string | null>(null);
  const currentRouterEntryRef = useRef(
    assessmentRouter
      ? `${assessmentRouter.entryScenario}:${assessmentRouter.entrySource}`
      : "",
  );

  const focus = searchParams.get("focus");
  const focusGuide = useMemo(
    () => getSolutionGuideBySlug(focus ?? ""),
    [focus],
  );

  function getConsentAssessmentId() {
    if (assessmentContext) {
      return assessmentContext.assessment_id;
    }

    if (!consentAssessmentIdRef.current) {
      consentAssessmentIdRef.current = createAssessmentId();
    }

    return consentAssessmentIdRef.current;
  }

  function buildConsentEventMetadata(extra?: {
    report_consent?: boolean;
    marketing_opt_in?: boolean;
  }) {
    return {
      assessment_id: getConsentAssessmentId(),
      assessment_version: assessmentContext?.assessment_version ?? ASSESSMENT_VERSION,
      rule_version: assessmentContext?.rule_version ?? ASSESSMENT_RULE_VERSION,
      consent_source: ASSESSMENT_CONSENT_SOURCE,
      ...extra,
    };
  }

  useEffect(() => {
    if (!focusGuide || routerEnabled) {
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
  }, [focusGuide, routerEnabled]);

  useEffect(() => {
    if (!assessmentRouter) {
      return;
    }

    const currentEntry = `${assessmentRouter.entryScenario}:${assessmentRouter.entrySource}`;
    if (currentRouterEntryRef.current === currentEntry) {
      return;
    }

    currentRouterEntryRef.current = currentEntry;
    setSelectedScenario(assessmentRouter.entryScenario);
    setAssessmentContext(
      createAssessmentRouterContext({
        entryScenario: assessmentRouter.entryScenario,
        selectedScenario: assessmentRouter.entryScenario,
        entrySource: assessmentRouter.entrySource,
      }),
    );
    setForm(buildScenarioConsultFormState(assessmentRouter.entryScenario));
    setCustomSymptom("");
    setError("");
    setResponse(null);
    setReportConsentChecked(false);
    setMarketingOptIn(false);
    setAssessmentConsent(null);
    setConsentError("");
  }, [assessmentRouter]);

  useEffect(() => {
    if (!assessmentContext) {
      return;
    }

    persistAssessmentContext(assessmentContext);
  }, [assessmentContext]);

  useEffect(() => {
    if (!assessmentContext || loadedAssessmentRef.current === assessmentContext.assessment_id) {
      return;
    }

    loadedAssessmentRef.current = assessmentContext.assessment_id;
    trackAnalyticsEvent({
      name: "assessment_router_loaded",
      source: "assessment_router",
      metadata: { ...assessmentContext },
    });
    trackAnalyticsEvent({
      name: "assessment_scenario_preselected",
      source: "assessment_router",
      metadata: { ...assessmentContext },
    });
  }, [assessmentContext]);

  useEffect(() => {
    const assessmentId = getConsentAssessmentId();
    if (privacyViewAssessmentRef.current === assessmentId) {
      return;
    }

    privacyViewAssessmentRef.current = assessmentId;
    trackAnalyticsEvent({
      name: "assessment_privacy_view",
      source: assessmentContext ? "assessment_router" : "ai-consult",
      metadata: buildConsentEventMetadata({
        report_consent: false,
        marketing_opt_in: false,
      }),
    });
  }, [assessmentContext]);

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

  function handleReportConsentChange(checked: boolean) {
    setReportConsentChecked(checked);
    setConsentError("");

    if (checked) {
      trackAnalyticsEvent({
        name: "assessment_report_consent_checked",
        source: assessmentContext ? "assessment_router" : "ai-consult",
        metadata: buildConsentEventMetadata({
          report_consent: true,
          marketing_opt_in: marketingOptIn,
        }),
      });
    }
  }

  function handleMarketingOptInChange(checked: boolean) {
    setMarketingOptIn(checked);
    setConsentError("");

    if (checked) {
      trackAnalyticsEvent({
        name: "assessment_marketing_opt_in_checked",
        source: assessmentContext ? "assessment_router" : "ai-consult",
        metadata: buildConsentEventMetadata({
          report_consent: reportConsentChecked,
          marketing_opt_in: true,
        }),
      });
    }
  }

  function handleConsentContinue() {
    if (assessmentConsent) {
      return;
    }

    if (!reportConsentChecked) {
      setConsentError("请先勾选必选同意项，再继续填写健康分层问题。");
      return;
    }

    const consent = createAssessmentConsentRecord({
      assessmentContext,
      assessmentId: getConsentAssessmentId(),
      marketingOptIn,
    });
    setAssessmentConsent(consent);
    setConsentError("");
    persistAssessmentConsent(consent);
    trackAnalyticsEvent({
      name: "assessment_consent_continue_click",
      source: assessmentContext ? "assessment_router" : "ai-consult",
      metadata: getAssessmentConsentAnalyticsMetadata(consent),
    });
  }

  function changeAssessmentScenario(scenario: AssessmentScenario) {
    if (!assessmentContext || scenario === selectedScenario) {
      return;
    }

    const nextContext = updateAssessmentRouterContextScenario(
      assessmentContext,
      scenario,
    );
    setSelectedScenario(scenario);
    setAssessmentContext(nextContext);
    setForm((current) => applyScenarioToConsultFormState(current, scenario));
    setCustomSymptom("");
    setError("");
    setResponse(null);
    trackAnalyticsEvent({
      name: "assessment_scenario_changed",
      source: "assessment_router",
      metadata: {
        ...nextContext,
        previous_scenario: selectedScenario,
      },
    });
  }

  function resetForm() {
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    setIsSubmitting(false);
    setCustomSymptom("");
    setForm(
      assessmentRouter
        ? buildScenarioConsultFormState(selectedScenario)
        : buildSeededFormState(focusGuide),
    );
    setError("");
    setResponse(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!assessmentConsent) {
      setConsentError("请先完成资料使用同意，再开始健康分层评估。");
      return;
    }

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
      const consentMetadata = getAssessmentConsentAnalyticsMetadata(assessmentConsent);
      trackAnalyticsEvent({
        name: "assessment_started",
        source: assessmentContext ? "assessment_router" : "ai-consult",
        solutionSlug: focusGuide?.slug ?? (assessmentContext ? scenarioToSolutionSlug(selectedScenario) : undefined),
        metadata: {
          ...(assessmentContext ?? {}),
          ...consentMetadata,
        },
      });

      const result = await fetch("/api/ai/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          profile: parsed.data,
          assessment: assessmentContext ?? undefined,
          consent: assessmentConsent,
        }),
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
      persistProductSuitabilityAssessment({
        assessment_id: assessmentContext?.assessment_id ?? assessmentConsent.assessment_id,
        consultation_id: validated.data.consultationId,
        assessment_version:
          assessmentContext?.assessment_version ?? assessmentConsent.assessment_version,
        rule_version: assessmentContext?.rule_version ?? assessmentConsent.rule_version,
        risk_level: validated.data.result.riskLevel === "low"
          ? "low"
          : validated.data.result.riskLevel === "medium"
            ? "medium"
            : "high",
        selected_scenario: assessmentContext ? selectedScenario : undefined,
        recommended_solution_type: validated.data.result.recommendedSolutionType,
        completed_at: new Date().toISOString(),
      });
      trackAnalyticsEvent({
        name: "assessment_completed",
        consultationId: validated.data.consultationId,
        source: assessmentContext ? "assessment_router" : "ai-consult",
        solutionSlug: focusGuide?.slug ?? (assessmentContext ? scenarioToSolutionSlug(selectedScenario) : undefined),
        metadata: {
          ...(assessmentContext ?? {}),
          ...consentMetadata,
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
            <span className="badge-teal">
              {assessmentContext ? "Rongwang Health Triage Protocol" : "AI评估"}
            </span>
            <h1 className="mt-4 text-balance text-slate-900">
              {assessmentContext ? "荣旺健康分层评估" : "AI健康评估主入口"}
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-500">
              先确认主诉入口，再收集年龄、主要困扰和生活方式，生成健康教育用途的风险分层、生活建议与营养支持方向。
            </p>
          </div>
        </div>
      </section>

      <section className="section-container py-12 md:py-16">
        {assessmentContext ? (
          <div className="mb-8 rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-xs)] md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                <span className="badge-slate">First Question</span>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
                  你主要想先判断哪类状态？
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] md:text-base">
                  已根据入口预选为「{getAssessmentScenarioLabel(selectedScenario)}」。你可以在继续填写前切换；所有选项都会进入同一个健康分层流程。
                </p>
              </div>
              <div className="rounded-lg border border-[var(--clinical-border)] bg-[var(--surface-muted)] px-4 py-3 text-xs leading-6 text-[var(--text-secondary)]">
                <p>评估版本：{assessmentContext.assessment_version}</p>
                <p>规则版本：{assessmentContext.rule_version}</p>
              </div>
            </div>

            <div
              className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
              role="radiogroup"
              aria-label="健康分层主诉选择"
            >
              {assessmentScenarioOptions.map((option) => {
                const isSelected = selectedScenario === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => changeAssessmentScenario(option.value)}
                    className={`rounded-lg border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-[var(--clinical-primary)] bg-[var(--clinical-primary-soft)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]"
                        : "border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[var(--clinical-border)] hover:bg-[var(--surface-muted)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="mt-1 block text-xs leading-5">{option.helper}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <AssessmentConsentCard
          consent={assessmentConsent}
          reportConsentChecked={reportConsentChecked}
          marketingOptIn={marketingOptIn}
          error={consentError}
          onReportConsentChange={handleReportConsentChange}
          onMarketingOptInChange={handleMarketingOptInChange}
          onContinue={handleConsentContinue}
        />

        {assessmentConsent ? (
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <ConsultForm
              form={form}
              customSymptom={customSymptom}
              focusLabel={assessmentContext ? getAssessmentScenarioLabel(selectedScenario) : focusGuide?.shortTitle}
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
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--clinical-border)] bg-[var(--surface-muted)] px-5 py-6 text-sm leading-7 text-[var(--text-secondary)]">
            完成上方必选同意后，系统会显示基础资料与健康状态问题。营销接收是独立选项，不影响继续评估。
          </div>
        )}
      </section>
    </main>
  );
}

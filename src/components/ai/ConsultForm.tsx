"use client";

import {
  durationOptions,
  exerciseOptions,
  goalOptions,
  sleepOptions,
  symptomOptions,
  type HealthProfile,
} from "@/schemas/health";
import type { ConsultFormState } from "@/components/ai/consult-form-state";

interface ConsultFormProps {
  form: ConsultFormState;
  customSymptom: string;
  focusLabel?: string;
  error: string;
  hasResponse: boolean;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onAgeChange: (value: string) => void;
  onGenderChange: (value: HealthProfile["gender"]) => void;
  onToggleSymptom: (symptom: string) => void;
  onCustomSymptomChange: (value: string) => void;
  onAddCustomSymptom: () => void;
  onDurationChange: (value: string) => void;
  onSleepChange: (value: string) => void;
  onExerciseChange: (value: string) => void;
  onGoalChange: (value: string) => void;
  onAlcoholChange: (value: boolean) => void;
  onSmokingChange: (value: boolean) => void;
  onMedicationsChange: (value: string) => void;
  onAllergiesChange: (value: string) => void;
  onClearResult: () => void;
  onResetForm: () => void;
}

export default function ConsultForm({
  form,
  customSymptom,
  focusLabel,
  error,
  hasResponse,
  isSubmitting,
  onSubmit,
  onAgeChange,
  onGenderChange,
  onToggleSymptom,
  onCustomSymptomChange,
  onAddCustomSymptom,
  onDurationChange,
  onSleepChange,
  onExerciseChange,
  onGoalChange,
  onAlcoholChange,
  onSmokingChange,
  onMedicationsChange,
  onAllergiesChange,
  onClearResult,
  onResetForm,
}: ConsultFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="card-elevated">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">基础资料</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              这些信息会参与风险分层和推荐方向判断。
            </p>
          </div>
          {focusLabel && <span className="badge-slate">{focusLabel}</span>}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-800">年龄</span>
            <input
              value={form.age}
              onChange={(event) => onAgeChange(event.target.value)}
              type="number"
              min={12}
              max={90}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200/60"
              placeholder="例如 32"
            />
          </label>

          <div>
            <span className="text-sm font-medium text-slate-800">性别</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { value: "female", label: "女" },
                { value: "male", label: "男" },
                { value: "other", label: "其他" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    onGenderChange(option.value as HealthProfile["gender"])
                  }
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                    form.gender === option.value
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated">
        <h2 className="text-xl font-semibold text-slate-900">主要困扰</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          至少选择 1 项，最多 8 项。
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {symptomOptions.map((symptom) => (
            <button
              key={symptom}
              type="button"
              onClick={() => onToggleSymptom(symptom)}
              className={`rounded-full border px-4 py-2 text-sm ${
                form.symptoms.includes(symptom)
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <input
            value={customSymptom}
            onChange={(event) => onCustomSymptomChange(event.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200/60"
            placeholder="添加其他症状或困扰"
          />
          <button type="button" onClick={onAddCustomSymptom} className="btn-secondary">
            添加
          </button>
        </div>
      </div>

      <div className="card-elevated">
        <h2 className="text-xl font-semibold text-slate-900">生活方式与目标</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-800">持续时间</span>
            <select
              value={form.duration}
              onChange={(event) => onDurationChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200/60"
            >
              {durationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-800">睡眠情况</span>
            <select
              value={form.sleep}
              onChange={(event) => onSleepChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200/60"
            >
              {sleepOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-800">运动情况</span>
            <select
              value={form.exercise}
              onChange={(event) => onExerciseChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200/60"
            >
              {exerciseOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-800">健康目标</span>
            <select
              value={form.goal}
              onChange={(event) => onGoalChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200/60"
            >
              {goalOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
            <span className="text-sm font-medium text-slate-800">近期有饮酒习惯</span>
            <input
              checked={form.alcohol}
              onChange={(event) => onAlcoholChange(event.target.checked)}
              type="checkbox"
              className="h-4 w-4 accent-teal-600"
            />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
            <span className="text-sm font-medium text-slate-800">近期有吸烟习惯</span>
            <input
              checked={form.smoking}
              onChange={(event) => onSmokingChange(event.target.checked)}
              type="checkbox"
              className="h-4 w-4 accent-teal-600"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-800">正在服用药物</span>
            <textarea
              value={form.medications}
              onChange={(event) => onMedicationsChange(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200/60"
              placeholder="例如：长期用药、慢病用药，若无可留空"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-800">过敏史</span>
            <textarea
              value={form.allergies}
              onChange={(event) => onAllergiesChange(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200/60"
              placeholder="例如：海鲜、某些成分过敏，若无可留空"
            />
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-950 px-6 py-6 text-white">
        <p className="text-sm text-slate-300">提交前提醒</p>
        <p className="mt-3 text-sm leading-7 text-slate-100">
          AI 结果用于健康教育与一般参考。若症状严重、持续或正在服药，请优先咨询医生或药师。
        </p>

        {error && (
          <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            disabled={isSubmitting}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? "AI 正在分析..."
              : hasResponse
                ? "重新生成 AI 健康建议"
                : "生成 AI 健康建议"}
          </button>
          {(hasResponse || error) && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClearResult}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              清空当前结果
            </button>
          )}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onResetForm}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
          >
            恢复默认输入
          </button>
        </div>
      </div>
    </form>
  );
}

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

const genderOptions: Array<{ value: HealthProfile["gender"]; label: string }> = [
  { value: "female", label: "女性" },
  { value: "male", label: "男性" },
  { value: "other", label: "其他" },
];

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
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">基础资料</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              这些信息用于风险分层和方向判断，不会替代医生诊断。
            </p>
          </div>
          {focusLabel ? <span className="badge-slate">{focusLabel}</span> : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[var(--text-primary)]">年龄</span>
            <input
              value={form.age}
              onChange={(event) => onAgeChange(event.target.value)}
              type="number"
              min={12}
              max={90}
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--ring-focus)]"
              placeholder="例如 32"
            />
          </label>

          <div>
            <span className="text-sm font-medium text-[var(--text-primary)]">性别</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onGenderChange(option.value)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                    form.gender === option.value
                      ? "border-[var(--teal)] bg-[#e8f5f1] text-[var(--teal-dark)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[#cfc5b6]"
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
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">主要困扰</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          至少选择1项，最多选择8项。也可以补充你自己的描述。
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {symptomOptions.map((symptom) => (
            <button
              key={symptom}
              type="button"
              onClick={() => onToggleSymptom(symptom)}
              className={`rounded-full border px-4 py-2 text-sm ${
                form.symptoms.includes(symptom)
                  ? "border-[var(--teal)] bg-[#e8f5f1] text-[var(--teal-dark)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[#cfc5b6]"
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={customSymptom}
            onChange={(event) => onCustomSymptomChange(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--ring-focus)]"
            placeholder="添加其他症状或困扰"
          />
          <button type="button" onClick={onAddCustomSymptom} className="btn-secondary">
            添加
          </button>
        </div>
      </div>

      <div className="card-elevated">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">生活方式与目标</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <SelectField label="持续时间" value={form.duration} options={durationOptions} onChange={onDurationChange} />
          <SelectField label="睡眠情况" value={form.sleep} options={sleepOptions} onChange={onSleepChange} />
          <SelectField label="运动情况" value={form.exercise} options={exerciseOptions} onChange={onExerciseChange} />
          <SelectField label="健康目标" value={form.goal} options={goalOptions} onChange={onGoalChange} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">近期有饮酒习惯</span>
            <input
              checked={form.alcohol}
              onChange={(event) => onAlcoholChange(event.target.checked)}
              type="checkbox"
              className="h-4 w-4 accent-[var(--teal)]"
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">近期有吸烟习惯</span>
            <input
              checked={form.smoking}
              onChange={(event) => onSmokingChange(event.target.checked)}
              type="checkbox"
              className="h-4 w-4 accent-[var(--teal)]"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4">
          <TextAreaField
            label="正在服用药物"
            value={form.medications}
            onChange={onMedicationsChange}
            placeholder="例如：长期用药、慢病用药。若无可留空。"
          />
          <TextAreaField
            label="过敏史"
            value={form.allergies}
            onChange={onAllergiesChange}
            placeholder="例如：海鲜、乳制品或某些成分过敏。若无可留空。"
          />
        </div>
      </div>

      <div className="rounded-lg border border-[#2c504a] bg-[var(--surface-strong)] px-5 py-6 text-white">
        <p className="text-sm text-teal-100">提交前提醒</p>
        <p className="mt-3 text-sm leading-7 text-white/90">
          AI结果用于健康教育与一般参考。若症状严重、持续加重，或正在服药，请优先咨询医生或药师。
        </p>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "AI正在分析..." : hasResponse ? "重新生成评估报告" : "生成AI健康报告"}
          </button>
          {(hasResponse || error) ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClearResult}
              className="btn-ghost disabled:cursor-not-allowed disabled:opacity-70"
            >
              清空结果
            </button>
          ) : null}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onResetForm}
            className="btn-ghost disabled:cursor-not-allowed disabled:opacity-70"
          >
            恢复默认
          </button>
        </div>
      </div>
    </form>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--ring-focus)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--ring-focus)]"
        placeholder={placeholder}
      />
    </label>
  );
}

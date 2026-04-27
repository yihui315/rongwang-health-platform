"use client";

import { getConsultStreamSteps } from "@/components/ai/consult-stream-state";

interface ConsultStreamProps {
  activeIndex?: number;
}

export default function ConsultStream({ activeIndex = 1 }: ConsultStreamProps) {
  const steps = getConsultStreamSteps(activeIndex);

  return (
    <div className="mt-6 rounded-3xl border border-teal-100 bg-teal-50/70 p-5">
      <p className="text-sm font-semibold text-teal-800">分析过程</p>
      <div className="mt-4 space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex gap-3">
            <span
              className={`mt-1 h-2.5 w-2.5 rounded-full ${
                step.status === "active" ? "bg-teal-500" : "bg-slate-300"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-slate-900">{step.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

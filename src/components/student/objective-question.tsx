"use client";

import { Check } from "lucide-react";

interface ObjectiveQuestionProps {
  options: readonly string[];
  selected: number | undefined;
  onSelect: (index: number) => void;
}

export function ObjectiveQuestion({
  options,
  selected,
  onSelect,
}: ObjectiveQuestionProps) {
  const labels = ["A", "B", "C", "D"];

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt, oi) => {
        const isSelected = selected === oi;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(oi)}
            className={`flex cursor-pointer items-center gap-3 rounded-[10px] border-2 px-4 py-3 text-left transition-all ${
              isSelected
                ? "border-navy bg-indigo-50"
                : "border-exam-border bg-exam-white"
            }`}
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                isSelected
                  ? "border-navy bg-navy"
                  : "border-exam-border bg-exam-white"
              }`}
            >
              {isSelected ? (
                <Check size={13} className="text-exam-white" strokeWidth={3} />
              ) : (
                <span className="text-[11px] font-bold text-exam-muted">
                  {labels[oi]}
                </span>
              )}
            </div>
            <span
              className={`text-sm ${
                isSelected ? "font-semibold text-navy" : "text-exam-text"
              }`}
            >
              {opt}
            </span>
          </button>
        );
      })}
    </div>
  );
}

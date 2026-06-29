"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHead } from "@/components/ui/section-head";
import { cn } from "@/lib/utils";
import type { Question } from "@/data/mock/questions";

interface QuestionNavigatorProps {
  questions: readonly Question[];
  current: number;
  answers: Record<number, number>;
  flagged: Set<number>;
  onSelect: (index: number) => void;
}

export function QuestionNavigator({
  questions,
  current,
  answers,
  flagged,
  onSelect,
}: QuestionNavigatorProps) {
  const objQs = questions.filter((q) => q.type === "obj");
  const thQs = questions.filter((q) => q.type === "theory");

  const getStyle = (index: number) => {
    if (index === current) return "bg-navy text-exam-white";
    if (flagged.has(index))
      return "border border-exam-amber bg-amber-50 text-exam-amber";
    if (answers[index] !== undefined || questions[index].type === "theory")
      return "bg-emerald-50 text-emerald-800";
    return "border border-exam-border bg-exam-white text-exam-muted";
  };

  return (
    <div className="w-[204px] shrink-0 overflow-y-auto border-r border-exam-border bg-exam-white p-3.5">
      <SectionHead>Objective ({objQs.length})</SectionHead>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {questions.map((q, i) =>
          q.type === "obj" ? (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "h-[34px] w-[34px] cursor-pointer rounded-md border-0 text-xs font-bold",
                getStyle(i),
              )}
            >
              {i + 1}
            </button>
          ) : null,
        )}
      </div>
      <SectionHead>Theory ({thQs.length})</SectionHead>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {questions.map((q, i) =>
          q.type === "theory" ? (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "h-[34px] w-[34px] cursor-pointer rounded-md border-0 text-xs font-bold",
                getStyle(i),
              )}
            >
              {i + 1}
            </button>
          ) : null,
        )}
      </div>
      <div className="rounded-lg bg-surface p-2.5 text-[11px] leading-relaxed">
        {[
          { bg: "bg-navy", label: "Current" },
          { bg: "bg-emerald-50", label: "Answered" },
          { bg: "bg-amber-50", label: "Flagged" },
          { bg: "bg-exam-white border border-exam-border", label: "Unanswered" },
        ].map((item) => (
          <div key={item.label} className="mb-1 flex items-center gap-1.5">
            <div className={cn("h-3.5 w-3.5 rounded-sm", item.bg)} />
            <span className="text-exam-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

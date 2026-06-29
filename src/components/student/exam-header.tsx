"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import { Clock } from "lucide-react";

interface ExamHeaderProps {
  title: string;
  subtitle: string;
  timeLeft: number;
  onSubmit: () => void;
}

export function ExamHeader({
  title,
  subtitle,
  timeLeft,
  onSubmit,
}: ExamHeaderProps) {
  const timerColor =
    timeLeft > 600
      ? "text-navy"
      : timeLeft > 180
        ? "text-exam-amber"
        : "text-exam-red";

  return (
    <div className="flex shrink-0 items-center justify-between bg-navy px-5 py-3 shadow-md">
      <div>
        <div className="text-sm font-bold text-exam-white">{title}</div>
        <div className="mt-0.5 text-[11px] text-[#8899CC]">{subtitle}</div>
      </div>
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 rounded-[10px] px-3.5 py-2 ${
            timeLeft <= 180
              ? "border border-exam-red bg-red-500/15"
              : "border border-white/15 bg-white/8"
          }`}
        >
          <Clock size={15} className={timerColor} />
          <span
            className={`text-xl font-extrabold tabular-nums tracking-wide ${timerColor}`}
          >
            {formatDuration(timeLeft)}
          </span>
        </div>
        <Button variant="primary" size="sm" onClick={onSubmit}>
          Submit Exam
        </Button>
      </div>
    </div>
  );
}

export function QuestionMeta({
  current,
  total,
  type,
  marks,
  flagged,
  onToggleFlag,
}: {
  current: number;
  total: number;
  type: "obj" | "theory";
  marks: number;
  flagged: boolean;
  onToggleFlag: () => void;
}) {
  return (
    <div className="mb-4.5 flex items-center justify-between">
      <div>
        <span className="text-xs font-semibold text-exam-muted">
          Q{current + 1} OF {total}
        </span>
        <span className="ml-2.5">
          <Badge status={type === "obj" ? "obj" : "theory"} />
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-exam-muted">
          {marks} mark{marks > 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={onToggleFlag}
          className={`flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold ${
            flagged
              ? "border-exam-amber bg-amber-50 text-exam-amber"
              : "border-exam-border bg-exam-white text-exam-muted"
          }`}
        >
          Flag
        </button>
      </div>
    </div>
  );
}

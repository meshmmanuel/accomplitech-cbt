"use client";

import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { SectionHead } from "@/components/ui/section-head";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";
import { Clock } from "lucide-react";

export interface NavigatorQuestion {
  id: string;
  legacyType: "obj" | "theory";
}

interface QuestionNavigatorProps {
  questions: NavigatorQuestion[];
  current: number;
  answers: Record<string, string | null | undefined>;
  flagged: Set<string>;
  onSelect: (index: number) => void;
}

export function QuestionNavigator({
  questions,
  current,
  answers,
  flagged,
  onSelect,
}: QuestionNavigatorProps) {
  const objQs = questions.filter((q) => q.legacyType === "obj");
  const thQs = questions.filter((q) => q.legacyType === "theory");

  const getStyle = (index: number, question: NavigatorQuestion) => {
    if (index === current) return "bg-navy text-exam-white";
    if (flagged.has(question.id))
      return "border border-exam-amber bg-amber-50 text-exam-amber";
    if (answers[question.id] || question.legacyType === "theory")
      return "bg-emerald-50 text-emerald-800";
    return "border border-exam-border bg-exam-white text-exam-muted";
  };

  return (
    <div className="w-[204px] shrink-0 overflow-y-auto border-r border-exam-border bg-exam-white p-3.5">
      <SectionHead>Objective ({objQs.length})</SectionHead>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {questions.map((q, i) =>
          q.legacyType === "obj" ? (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "h-[34px] w-[34px] cursor-pointer rounded-md border-0 text-xs font-bold",
                getStyle(i, q),
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
          q.legacyType === "theory" ? (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "h-[34px] w-[34px] cursor-pointer rounded-md border-0 text-xs font-bold",
                getStyle(i, q),
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

interface SessionTimerProps {
  timeRemainingSeconds: number;
}

export function SessionTimerBar({ timeRemainingSeconds }: SessionTimerProps) {
  const timerColor =
    timeRemainingSeconds > 600
      ? "text-navy"
      : timeRemainingSeconds > 180
        ? "text-exam-amber"
        : "text-exam-red";

  return (
    <div
      className={`flex items-center gap-2 rounded-[10px] px-3.5 py-2 ${
        timeRemainingSeconds <= 180
          ? "border border-exam-red bg-red-500/15"
          : "border border-white/15 bg-white/8"
      }`}
    >
      <Clock size={15} className={timerColor} />
      <span
        className={`text-xl font-extrabold tabular-nums tracking-wide ${timerColor}`}
      >
        {formatDuration(timeRemainingSeconds)}
      </span>
    </div>
  );
}

interface SessionHubPanelProps {
  sessionName: string;
  admissionNumber: string;
  timeRemainingSeconds: number;
  exams: Array<{
    id: string;
    name: string;
    subjectCode: string;
    subjectName: string;
    attemptStatus: string;
    questionCount: number;
    attemptId: string | null;
  }>;
  loadingExamId: string | null;
  onOpenExam: (examId: string) => void;
}

export function SessionHubPanel({
  sessionName,
  admissionNumber,
  timeRemainingSeconds,
  exams,
  loadingExamId,
  onOpenExam,
}: SessionHubPanelProps) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="flex items-center justify-between bg-navy px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <BrandLogo size="sm" showName onDark />
          <p className="m-0 text-[11px] text-[#8899CC]">{sessionName}</p>
        </div>
        <div className="flex items-center gap-3">
          <SessionTimerBar timeRemainingSeconds={timeRemainingSeconds} />
          <span className="text-xs text-[#8899CC]">{admissionNumber}</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-2 text-xl font-extrabold text-exam-text">Your exams</h1>
        <p className="mb-6 text-sm text-exam-muted">
          One timer for all papers. Open any exam in any order. Submit each paper when
          you are done.
        </p>

        <div className="flex flex-col gap-3">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="flex items-center justify-between rounded-xl border border-exam-border bg-exam-white p-4"
            >
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-bold text-navy">{exam.subjectName}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-exam-muted">
                    {exam.subjectCode}
                  </span>
                  <Badge
                    status={
                      exam.attemptStatus === "submitted"
                        ? "submitted"
                        : exam.attemptStatus === "in_progress"
                          ? "active"
                          : "idle"
                    }
                  />
                </div>
                <p className="m-0 text-sm text-exam-text">{exam.name}</p>
                <p className="m-0 mt-1 text-xs text-exam-muted">
                  {exam.questionCount} questions
                </p>
              </div>
              <Button
                variant={
                  exam.attemptStatus === "submitted" ? "ghost" : "primary"
                }
                size="sm"
                disabled={
                  loadingExamId === exam.id ||
                  exam.attemptStatus === "submitted" ||
                  timeRemainingSeconds <= 0
                }
                onClick={() => onOpenExam(exam.id)}
              >
                {loadingExamId === exam.id
                  ? "Opening..."
                  : exam.attemptStatus === "submitted"
                    ? "Submitted"
                    : exam.attemptStatus === "in_progress"
                      ? "Continue"
                      : "Start"}
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

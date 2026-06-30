"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatDuration, cn } from "@/lib/utils";
import type { SessionExamSummary } from "@/modules/student-exam";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface SessionSubmitAllModalProps {
  sessionName: string;
  exams: SessionExamSummary[];
  timeLeft: number;
  singleExam?: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function SessionSubmitAllModal({
  sessionName,
  exams,
  timeLeft,
  singleExam = false,
  submitting = false,
  onClose,
  onSubmit,
}: SessionSubmitAllModalProps) {
  const unopened = exams.filter((exam) => !exam.opened);
  const incomplete = exams.filter(
    (exam) => exam.opened && exam.objAnswered < exam.objTotal,
  );

  return (
    <Modal
      title={singleExam ? "Submit exam?" : "Submit all papers?"}
      onClose={onClose}
      className="max-w-[480px]"
    >
      <p className="-mt-3 mb-4 text-[13px] text-exam-muted">
        {singleExam
          ? `${sessionName} — this submits your exam. This cannot be undone.`
          : `${sessionName} — this submits every paper you have worked on. This cannot be undone.`}
      </p>

      <div className="mb-4 space-y-2">
        {exams.map((exam) => {
          const complete = exam.opened && exam.objAnswered === exam.objTotal;
          return (
            <div
              key={exam.examId}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2.5",
                !exam.opened
                  ? "border-amber-300 bg-amber-50"
                  : "border-exam-border bg-surface",
              )}
            >
              <div className="flex items-center gap-2">
                {exam.markedDone ? (
                  <CheckCircle2 size={14} className="text-exam-green" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-exam-border bg-exam-white" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-navy">
                      {exam.subjectName}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-exam-muted">
                      {exam.subjectCode}
                    </span>
                    {!exam.opened && (
                      <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                        Unopened
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-exam-muted">{exam.examName}</div>
                </div>
              </div>
              <div className="text-right text-[12px]">
                {!exam.opened ? (
                  <span className="font-semibold text-amber-800">
                    Will not be submitted
                  </span>
                ) : (
                  <span
                    className={`font-bold ${complete ? "text-exam-green" : "text-exam-red"}`}
                  >
                    {exam.objAnswered}/{exam.objTotal} obj
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-4 rounded-[10px] bg-surface px-3.5 py-2.5 text-[13px]">
        <div className="flex justify-between py-1">
          <span className="text-exam-muted">Time remaining</span>
          <span className="font-bold text-exam-text">{formatDuration(timeLeft)}</span>
        </div>
      </div>

      {(unopened.length > 0 || incomplete.length > 0) && (
        <div className="mb-4 flex gap-1.5 rounded-lg bg-amber-50 p-2.5 text-[13px] text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            {unopened.length > 0 &&
              `${unopened.length} paper${unopened.length > 1 ? "s" : ""} not opened. `}
            {incomplete.length > 0 &&
              `${incomplete.length} paper${incomplete.length > 1 ? "s" : ""} have unanswered objective questions.`}
          </span>
        </div>
      )}

      <div className="flex gap-2.5">
        <Button variant="ghost" className="flex-1 justify-center" onClick={onClose}>
          Go back
        </Button>
        <Button
          variant="primary"
          className="flex-1 justify-center"
          disabled={submitting}
          onClick={onSubmit}
        >
          {submitting ? "Submitting..." : singleExam ? "Submit exam" : "Submit all"}
        </Button>
      </div>
    </Modal>
  );
}

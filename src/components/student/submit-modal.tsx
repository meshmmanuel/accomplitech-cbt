"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatDuration } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface SubmitModalProps {
  answered: number;
  objTotal: number;
  thTotal: number;
  flagged: number;
  timeLeft: number;
  onClose: () => void;
  onSubmit: () => void;
}

export function SubmitModal({
  answered,
  objTotal,
  thTotal,
  flagged,
  timeLeft,
  onClose,
  onSubmit,
}: SubmitModalProps) {
  const unanswered = objTotal - answered;

  return (
    <Modal title="Submit Exam?" onClose={onClose} className="max-w-[420px]">
      <p className="-mt-3 mb-5 text-[13px] text-exam-muted">
        This action cannot be undone.
      </p>
      <div className="mb-5 rounded-[10px] bg-surface p-3.5">
        {[
          {
            label: "Objective answered",
            value: `${answered} / ${objTotal}`,
            ok: answered === objTotal,
          },
          { label: "Theory (paper)", value: `${thTotal}`, ok: true },
          { label: "Flagged", value: `${flagged}`, ok: flagged === 0 },
          {
            label: "Time remaining",
            value: formatDuration(timeLeft),
            ok: true,
          },
        ].map((row) => (
          <div
            key={row.label}
            className="flex justify-between border-b border-exam-border py-1.5 last:border-0"
          >
            <span className="text-[13px] text-exam-muted">{row.label}</span>
            <span
              className={`text-[13px] font-bold ${
                row.ok ? "text-exam-text" : "text-exam-red"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
      {unanswered > 0 && (
        <div className="mb-3.5 flex gap-1.5 rounded-lg bg-red-50 p-2.5 text-[13px] text-exam-red">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {unanswered} unanswered objective question
          {unanswered > 1 ? "s" : ""}.
        </div>
      )}
      <div className="flex gap-2.5">
        <Button variant="ghost" className="flex-1 justify-center" onClick={onClose}>
          Go Back
        </Button>
        <Button
          variant="primary"
          className="flex-1 justify-center"
          onClick={onSubmit}
        >
          Submit Now
        </Button>
      </div>
    </Modal>
  );
}

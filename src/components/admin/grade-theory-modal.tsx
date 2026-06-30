"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { apiGet, apiPatch } from "@/lib/api-client";
import type { AttemptGradingDetail } from "@/modules/grading";
import { AlertCircle } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

interface GradeTheoryModalProps {
  attemptId: string;
  readOnly?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GradeTheoryModal({
  attemptId,
  readOnly = false,
  onClose,
  onSuccess,
}: GradeTheoryModalProps) {
  const [detail, setDetail] = useState<AttemptGradingDetail | null>(null);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError("");

      const result = await apiGet<AttemptGradingDetail>(
        `/api/attempts/${attemptId}/grading`,
      );

      if (cancelled) return;

      if (result.error || !result.data) {
        setError(result.error ?? result.message ?? "Failed to load grading detail");
        setLoading(false);
        return;
      }

      setDetail(result.data);
      setMarks(
        Object.fromEntries(
          result.data.theoryQuestions.map((question) => [
            question.questionId,
            question.marksAwarded?.toString() ?? "",
          ]),
        ),
      );
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  const theoryAwarded = useMemo(() => {
    if (!detail) return 0;
    return detail.theoryQuestions.reduce((sum, question) => {
      const value = Number(marks[question.questionId]);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
  }, [detail, marks]);

  const totalScore =
    detail && detail.theoryScore !== null
      ? (detail.objectiveScore ?? 0) + detail.theoryScore
      : detail
        ? (detail.objectiveScore ?? 0) + theoryAwarded
        : null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!detail || readOnly) return;

    setSaving(true);
    setError("");

    const payload = {
      marks: detail.theoryQuestions.map((question) => ({
        questionId: question.questionId,
        marksAwarded: Number(marks[question.questionId] ?? 0),
      })),
    };

    for (const question of detail.theoryQuestions) {
      const value = Number(marks[question.questionId]);
      if (!Number.isInteger(value) || value < 0) {
        setError(`Enter a valid mark for question ${question.sortOrder + 1}`);
        setSaving(false);
        return;
      }
      if (value > question.marks) {
        setError(`Question ${question.sortOrder + 1} cannot exceed ${question.marks} marks`);
        setSaving(false);
        return;
      }
    }

    const result = await apiPatch(`/api/attempts/${attemptId}/grade`, payload);

    setSaving(false);

    if (result.error) {
      setError(result.error ?? result.message ?? "Failed to save grades");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Modal
      title={
        readOnly
          ? `View Grades — ${detail?.studentName ?? "Student"}`
          : `Grade Theory — ${detail?.studentName ?? "Student"}`
      }
      onClose={onClose}
      wide
      className="max-w-[720px]"
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-lg bg-surface"
            />
          ))}
        </div>
      ) : error && !detail ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-exam-red">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : detail ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-5 grid gap-3 rounded-xl border border-exam-border bg-surface p-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-exam-muted">
                Exam
              </p>
              <p className="mt-1 text-sm font-semibold text-exam-text">
                {detail.subjectCode} · {detail.examName}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-exam-muted">
                Objective
              </p>
              <p className="mt-1 text-sm font-semibold text-exam-text">
                {detail.objectiveTotal > 0
                  ? `${detail.objectiveScore ?? 0}/${detail.objectiveTotal}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-exam-muted">
                Total
              </p>
              <p className="mt-1 text-sm font-semibold text-exam-text">
                {totalScore !== null
                  ? `${totalScore}/${detail.objectiveTotal + detail.theoryTotal}`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {detail.theoryQuestions.map((question, index) => (
              <div
                key={question.questionId}
                className="rounded-xl border border-exam-border p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-exam-muted">
                      Theory {index + 1}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-exam-text">
                      {question.text}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-800">
                    Max {question.marks}
                  </span>
                </div>

                <Input
                  label="Marks awarded"
                  type="number"
                  min={0}
                  max={question.marks}
                  step={1}
                  value={marks[question.questionId] ?? ""}
                  onChange={(event) =>
                    setMarks((prev) => ({
                      ...prev,
                      [question.questionId]: event.target.value,
                    }))
                  }
                  disabled={readOnly || saving}
                  className="mb-0 max-w-[160px]"
                />
              </div>
            ))}
          </div>

          {error ? (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-exam-red">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
            {!readOnly ? (
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : "Save grades"}
              </Button>
            ) : null}
          </div>
        </form>
      ) : null}
    </Modal>
  );
}

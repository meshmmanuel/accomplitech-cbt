"use client";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { apiPatch, apiPost } from "@/lib/api-client";
import type { ExamDetail } from "@/modules/exams";
import type { ExamTypeCode } from "@/types";
import { AlertCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

interface ExamFormModalProps {
  subjectId: string;
  exam?: ExamDetail | null;
  onClose: () => void;
  onSuccess: (exam: ExamDetail) => void;
}

const EXAM_TYPES: { id: ExamTypeCode; label: string }[] = [
  { id: "obj", label: "Objective" },
  { id: "theory", label: "Theory" },
  { id: "both", label: "Obj + Theory" },
];

const EXAM_STATUSES = [
  { id: "draft", label: "Draft" },
  { id: "active", label: "Active" },
] as const;

export function ExamFormModal({
  subjectId,
  exam,
  onClose,
  onSuccess,
}: ExamFormModalProps) {
  const isEdit = Boolean(exam);
  const [name, setName] = useState(exam?.name ?? "");
  const [type, setType] = useState<ExamTypeCode>(exam?.type ?? "obj");
  const [durationMinutes, setDurationMinutes] = useState(
    String(exam?.durationMinutes ?? 60),
  );
  const [passMark, setPassMark] = useState(String(exam?.passMark ?? 50));
  const [totalMarks, setTotalMarks] = useState(String(exam?.totalMarks ?? 100));
  const [instructions, setInstructions] = useState(exam?.instructions ?? "");
  const [status, setStatus] = useState(exam?.status ?? "draft");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(exam?.name ?? "");
    setType(exam?.type ?? "obj");
    setDurationMinutes(String(exam?.durationMinutes ?? 60));
    setPassMark(String(exam?.passMark ?? 50));
    setTotalMarks(String(exam?.totalMarks ?? 100));
    setInstructions(exam?.instructions ?? "");
    setStatus(exam?.status ?? "draft");
    setError("");
  }, [exam]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name,
      type,
      durationMinutes: Number.parseInt(durationMinutes, 10),
      passMark: Number.parseInt(passMark, 10),
      totalMarks: Number.parseInt(totalMarks, 10),
      instructions,
      status,
    };

    const result =
      isEdit && exam
        ? await apiPatch<ExamDetail>(`/api/exams/${exam.id}`, payload)
        : await apiPost<ExamDetail>(`/api/subjects/${subjectId}/exams`, payload);

    setLoading(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Save failed");
      return;
    }

    onSuccess(result.data);
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit Exam" : "New Exam"} onClose={onClose}>
      <form onSubmit={submit}>
        <Input
          label="Exam Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mid-Term Assessment"
          required
        />

        <div className="mb-3.5">
          <label className="mb-1.5 block text-xs font-semibold text-exam-text">
            Exam Type
          </label>
          <div className="flex flex-wrap gap-2">
            {EXAM_TYPES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  type === item.id
                    ? "border-navy bg-indigo-50 text-navy"
                    : "border-exam-border text-exam-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Duration (min)"
            type="number"
            min={5}
            max={600}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            required
          />
          <Input
            label="Pass Mark (%)"
            type="number"
            min={0}
            max={100}
            value={passMark}
            onChange={(e) => setPassMark(e.target.value)}
            required
          />
          <Input
            label="Total Marks"
            type="number"
            min={1}
            max={1000}
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            required
          />
        </div>

        <div className="mb-3.5">
          <label className="mb-1.5 block text-xs font-semibold text-exam-text">
            Status
          </label>
          <div className="flex gap-2">
            {EXAM_STATUSES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatus(item.id)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  status === item.id
                    ? "border-navy bg-indigo-50 text-navy"
                    : "border-exam-border text-exam-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Exam Instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Instructions shown to students before the exam begins..."
          rows={5}
        />

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-[13px] text-exam-red">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Exam"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

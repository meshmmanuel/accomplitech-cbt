"use client";

import { ExamFormModal } from "@/components/admin/exam-form-modal";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { apiDelete } from "@/lib/api-client";
import type { ExamDetail } from "@/modules/exams";
import { AlertCircle, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ExamDetailActionsProps {
  exam: ExamDetail;
  subjectCode: string;
}

export function ExamDetailActions({ exam, subjectCode }: ExamDetailActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const refresh = () => router.refresh();

  const confirmDelete = async () => {
    setError("");
    setDeleting(true);

    const result = await apiDelete<{ deleted: boolean }>(
      `/api/exams/${exam.id}`,
    );

    setDeleting(false);

    if (result.error) {
      setError(result.error ?? result.message ?? "Delete failed");
      return;
    }

    router.push(`/admin/subjects/${exam.subjectId}`);
    router.refresh();
  };

  return (
    <>
      <div className="mb-3.5 flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>
          <Edit size={12} /> Edit Exam
        </Button>
        <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
          <Trash2 size={12} /> Delete
        </Button>
      </div>

      {showEdit && (
        <ExamFormModal
          subjectId={exam.subjectId}
          exam={exam}
          onClose={() => setShowEdit(false)}
          onSuccess={() => refresh()}
        />
      )}

      {showDelete && (
        <Modal title="Delete Exam?" onClose={() => setShowDelete(false)}>
          <p className="mb-4 text-sm leading-relaxed text-exam-muted">
            Are you sure you want to delete{" "}
            <strong className="text-exam-text">{exam.name}</strong> from{" "}
            <strong className="text-exam-text">{subjectCode}</strong>? This
            cannot be undone.
          </p>
          {exam.questionCount > 0 && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-[13px] text-amber-800">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              This exam has {exam.questionCount} question
              {exam.questionCount !== 1 ? "s" : ""}. All questions will be
              permanently deleted.
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-[13px] text-exam-red">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? "Deleting..." : "Delete Exam"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

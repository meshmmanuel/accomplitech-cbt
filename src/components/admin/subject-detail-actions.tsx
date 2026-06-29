"use client";

import { SubjectFormModal } from "@/components/admin/subject-form-modal";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { apiDelete } from "@/lib/api-client";
import type { SubjectDetail } from "@/modules/subjects";
import { AlertCircle, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SubjectDetailActionsProps {
  subject: SubjectDetail;
}

export function SubjectDetailActions({ subject }: SubjectDetailActionsProps) {
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
      `/api/subjects/${subject.id}`,
    );

    setDeleting(false);

    if (result.error) {
      setError(result.error ?? result.message ?? "Delete failed");
      return;
    }

    router.push("/admin/subjects");
    router.refresh();
  };

  return (
    <>
      <div className="mb-4.5 flex gap-2.5">
        <Button variant="ghost" onClick={() => setShowEdit(true)}>
          <Edit size={14} /> Edit Subject
        </Button>
        <Button variant="danger" onClick={() => setShowDelete(true)}>
          <Trash2 size={14} /> Delete
        </Button>
      </div>

      {showEdit && (
        <SubjectFormModal
          subject={subject}
          onClose={() => setShowEdit(false)}
          onSuccess={refresh}
        />
      )}

      {showDelete && (
        <Modal title="Delete Subject?" onClose={() => setShowDelete(false)}>
          <p className="mb-4 text-sm leading-relaxed text-exam-muted">
            Are you sure you want to delete{" "}
            <strong className="text-exam-text">{subject.name}</strong>? This
            cannot be undone.
          </p>
          {subject.examCount > 0 && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-[13px] text-amber-800">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              This subject has {subject.examCount} exam
              {subject.examCount !== 1 ? "s" : ""}. Remove them before deleting.
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
              disabled={deleting || subject.examCount > 0}
              onClick={confirmDelete}
            >
              {deleting ? "Deleting..." : "Delete Subject"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

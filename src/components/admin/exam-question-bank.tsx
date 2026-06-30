"use client";

import { QuestionBlockPreview } from "@/components/admin/question-block-preview";
import { QuestionFormModal } from "@/components/admin/question-form-modal";
import { QuestionWordImportModal } from "@/components/admin/question-word-import-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { apiDelete, apiPatch } from "@/lib/api-client";
import type { QuestionBankItem } from "@/modules/questions";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Database,
  Edit,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ExamQuestionBankProps {
  examId: string;
  questions: QuestionBankItem[];
}

export function ExamQuestionBank({ examId, questions }: ExamQuestionBankProps) {
  const router = useRouter();
  const [showWordImport, setShowWordImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(
    null,
  );
  const [deletingQuestion, setDeletingQuestion] =
    useState<QuestionBankItem | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const refresh = () => router.refresh();

  const confirmDelete = async () => {
    if (!deletingQuestion) return;

    setDeleteError("");
    setDeleting(true);

    const result = await apiDelete<{ deleted: boolean }>(
      `/api/exams/${examId}/questions/${deletingQuestion.id}`,
    );

    setDeleting(false);

    if (result.error) {
      setDeleteError(result.error ?? result.message ?? "Delete failed");
      return;
    }

    setDeletingQuestion(null);
    refresh();
  };

  const moveQuestion = async (
    questionId: string,
    direction: "up" | "down",
  ) => {
    setReorderingId(questionId);
    await apiPatch<QuestionBankItem[]>(
      `/api/exams/${examId}/questions/reorder`,
      { questionId, direction },
    );
    setReorderingId(null);
    refresh();
  };

  return (
    <>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[13px] font-bold text-exam-text">
          Question Bank ({questions.length})
        </span>
        <div className="flex gap-1.5">
          <Button variant="primary" size="sm" onClick={() => setShowWordImport(true)}>
            <FileText size={12} /> Import Word
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingQuestion(null);
              setShowAdd(true);
            }}
          >
            <Plus size={12} /> Add Manual
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="py-8 text-center text-exam-muted">
          <Database size={32} className="mx-auto mb-2 text-exam-border" />
          <div className="text-[13px]">
            No questions yet. Import your question paper from Word to get started.
          </div>
        </div>
      ) : (
        questions.map((question, index) => (
          <div
            key={question.id}
            className="flex items-start gap-2.5 border-b border-exam-border py-2.5 last:border-0"
          >
            <div className="flex shrink-0 flex-col items-center gap-0.5">
              <div
                className={`flex h-[26px] w-[26px] items-center justify-center rounded-md text-[10px] font-bold ${
                  question.legacyType === "obj"
                    ? "bg-sky-50 text-sky-800"
                    : "bg-purple-50 text-purple-800"
                }`}
              >
                {index + 1}
              </div>
              <button
                type="button"
                className="cursor-pointer p-0.5 text-exam-muted hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
                disabled={index === 0 || reorderingId === question.id}
                onClick={() => moveQuestion(question.id, "up")}
                aria-label="Move question up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                className="cursor-pointer p-0.5 text-exam-muted hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
                disabled={
                  index === questions.length - 1 || reorderingId === question.id
                }
                onClick={() => moveQuestion(question.id, "down")}
                aria-label="Move question down"
              >
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <QuestionBlockPreview
                blocks={question.blocks}
                assets={question.assets}
                assetUrlMap={question.assetUrlMap}
                className="mb-1.5"
              />
              <div className="flex flex-wrap gap-2">
                <Badge status={question.legacyType} />
                <span className="text-[11px] text-exam-muted">
                  {question.marks} marks
                </span>
                {question.topic && (
                  <span className="text-[11px] text-exam-muted">
                    · {question.topic}
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-0.5">
              <button
                type="button"
                className="cursor-pointer p-1 text-exam-muted hover:text-navy"
                onClick={() => {
                  setShowAdd(false);
                  setEditingQuestion(question);
                }}
                aria-label="Edit question"
              >
                <Edit size={13} />
              </button>
              <button
                type="button"
                className="cursor-pointer p-1 text-exam-muted hover:text-exam-red"
                onClick={() => {
                  setDeleteError("");
                  setDeletingQuestion(question);
                }}
                aria-label="Delete question"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))
      )}

      {showWordImport && (
        <QuestionWordImportModal
          examId={examId}
          onClose={() => setShowWordImport(false)}
          onSuccess={refresh}
        />
      )}

      {(showAdd || editingQuestion) && (
        <QuestionFormModal
          examId={examId}
          question={editingQuestion}
          onClose={() => {
            setShowAdd(false);
            setEditingQuestion(null);
          }}
          onSuccess={refresh}
        />
      )}

      {deletingQuestion && (
        <Modal
          title="Delete Question?"
          onClose={() => {
            setDeletingQuestion(null);
            setDeleteError("");
          }}
        >
          <p className="mb-4 text-sm leading-relaxed text-exam-muted">
            Are you sure you want to delete question{" "}
            <strong className="text-exam-text">{deletingQuestion.text.slice(0, 80)}
            {deletingQuestion.text.length > 80 ? "…" : ""}</strong>? This cannot
            be undone.
          </p>
          {deleteError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-[13px] text-exam-red">
              <AlertCircle size={14} />
              {deleteError}
            </div>
          )}
          <div className="flex justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDeletingQuestion(null);
                setDeleteError("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? "Deleting..." : "Delete Question"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

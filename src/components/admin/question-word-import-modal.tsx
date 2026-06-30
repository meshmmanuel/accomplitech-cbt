"use client";

import { QuestionImportReview } from "@/components/admin/question-import-review";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { apiPost, apiPostFormData } from "@/lib/api-client";
import type { CanonicalQuestion, WordImportPreview } from "@/modules/questions";
import { AlertCircle, FileText, Loader2, Upload } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

interface QuestionWordImportModalProps {
  examId: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "upload" | "processing" | "review";

export function QuestionWordImportModal({
  examId,
  onClose,
  onSuccess,
}: QuestionWordImportModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<WordImportPreview | null>(null);
  const [questions, setQuestions] = useState<CanonicalQuestion[]>([]);
  const [mode, setMode] = useState<"append" | "replace">("append");
  const [saving, setSaving] = useState(false);

  const assetUrlMap =
    preview?.assetPreviews.reduce<Record<string, string>>((acc, asset) => {
      acc[asset.id] = asset.url;
      return acc;
    }, {}) ?? {};

  const processFile = async (file: File) => {
    setError("");
    setStep("processing");

    const formData = new FormData();
    formData.append("file", file);

    const result = await apiPostFormData<WordImportPreview>(
      `/api/exams/${examId}/questions/import/word`,
      formData,
    );

    if (!result.data) {
      setStep("upload");
      setError(result.error ?? result.message ?? "Processing failed");
      return;
    }

    setPreview(result.data);
    setQuestions(result.data.questions);

    if (!result.data.valid) {
      setStep("upload");
      setError(
        result.data.errors[0]?.message ?? "Could not validate extracted questions",
      );
      return;
    }

    setStep("review");
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
  };

  const saveQuestions = async () => {
    if (!preview || questions.length === 0) return;
    setSaving(true);
    setError("");

    const result = await apiPost<{ imported: number }>(
      `/api/exams/${examId}/questions/import/commit`,
      {
        questions,
        mode,
        stagingId: preview.stagingId,
      },
    );

    setSaving(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Save failed");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Modal
      title={step === "review" ? "Review Imported Questions" : "Import from Word"}
      onClose={onClose}
      wide
    >
      {step === "upload" && (
        <>
          <div
            className="mb-4 cursor-pointer rounded-[10px] border-2 border-dashed border-exam-border bg-surface p-8 text-center"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                inputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <Upload size={32} className="mx-auto mb-3 text-gold" />
            <p className="mb-1 text-sm font-semibold text-exam-text">
              Upload your question paper (.docx)
            </p>
            <p className="mb-3 text-xs text-exam-muted">
              We extract text, images, and structure — then you review before saving.
            </p>
            <Button type="button" variant="primary" size="sm">
              <FileText size={14} /> Choose Word Document
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-[13px] text-exam-red">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </>
      )}

      {step === "processing" && (
        <div className="flex flex-col items-center py-12 text-center">
          <Loader2 size={36} className="mb-4 animate-spin text-navy" />
          <p className="mb-1 text-sm font-semibold text-exam-text">
            Processing document…
          </p>
          <p className="text-xs text-exam-muted">
            Extracting content and generating structured questions
          </p>
        </div>
      )}

      {step === "review" && preview && (
        <>
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            {preview.summary.total} questions detected ·{" "}
            {preview.summary.multipleChoice} objective · {preview.summary.essay}{" "}
            theory · {preview.summary.totalMarks} total marks
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold text-exam-text">Save mode</p>
            <div className="flex gap-2">
              {(["append", "replace"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize ${
                    mode === option
                      ? "border-navy bg-indigo-50 text-navy"
                      : "border-exam-border text-exam-muted"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <QuestionImportReview
            questions={questions}
            assetUrlMap={assetUrlMap}
            onChange={setQuestions}
          />

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-[13px] text-exam-red">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" onClick={() => setStep("upload")}>
              Back
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={saving || questions.length === 0}
              onClick={saveQuestions}
            >
              {saving ? "Saving…" : `Save ${questions.length} Questions`}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

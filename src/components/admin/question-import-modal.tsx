"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { apiPostFormData } from "@/lib/api-client";
import { CSV_SAMPLE, type ImportMode, type ImportPreviewResult } from "@/modules/questions";
import { AlertCircle, Upload } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

interface QuestionImportModalProps {
  examId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuestionImportModal({
  examId,
  onClose,
  onSuccess,
}: QuestionImportModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ImportMode>("append");
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const runPreview = async (selectedFile: File) => {
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    const result = await apiPostFormData<ImportPreviewResult>(
      `/api/exams/${examId}/questions/import/preview`,
      formData,
    );

    setLoading(false);

    if (result.data) {
      setPreview(result.data);
      if (!result.data.valid) {
        setError(result.data.errors[0]?.message ?? "Validation failed");
      }
      return;
    }

    setError(result.error ?? result.message ?? "Preview failed");
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setPreview(null);
    if (selected) {
      await runPreview(selected);
    }
  };

  const importQuestions = async () => {
    if (!file) return;
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    const result = await apiPostFormData<{ imported: number }>(
      `/api/exams/${examId}/questions/import`,
      formData,
    );

    setLoading(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Import failed");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Modal title="Upload Questions" onClose={onClose} wide>
      <div
        className="mb-4 cursor-pointer rounded-[10px] border-2 border-dashed border-exam-border bg-surface p-7 text-center"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <Upload size={28} className="mx-auto mb-2 text-exam-muted" />
        <p className="mb-1 text-sm font-semibold text-exam-text">
          {file ? file.name : "Drop CSV or TXT file here"}
        </p>
        <Button type="button" variant="ghost" size="sm">
          Browse Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      <div className="mb-4 rounded-lg bg-surface p-3.5">
        <p className="mb-2 text-xs font-bold text-exam-text">Expected CSV format</p>
        <pre className="overflow-x-auto rounded-lg bg-navy p-3 text-[10px] leading-relaxed text-[#A8C0FF]">
          {CSV_SAMPLE}
        </pre>
        <p className="mt-2 text-[11px] text-exam-muted">
          <strong>type:</strong> obj or theory · <strong>answer:</strong> A/B/C/D
          for objective · leave options blank for theory
        </p>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold text-exam-text">Import mode</p>
        <div className="flex gap-2">
          {(["append", "replace"] as ImportMode[]).map((option) => (
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
        {mode === "replace" && (
          <p className="mt-2 text-[11px] text-amber-700">
            Replace removes all existing questions before import. Blocked if
            students have already attempted this exam.
          </p>
        )}
      </div>

      {preview?.valid && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          Ready to import {preview.summary.total} questions (
          {preview.summary.multipleChoice} objective, {preview.summary.essay}{" "}
          theory) · {preview.summary.totalMarks} total marks
        </div>
      )}

      {preview && !preview.valid && preview.errors.length > 0 && (
        <div className="mb-4 max-h-32 overflow-y-auto rounded-lg bg-red-50 p-3">
          {preview.errors.slice(0, 8).map((item) => (
            <div
              key={`${item.row}-${item.field ?? "general"}-${item.message}`}
              className="mb-1 flex items-start gap-2 text-[12px] text-exam-red"
            >
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              Row {item.row}
              {item.field ? ` (${item.field})` : ""}: {item.message}
            </div>
          ))}
        </div>
      )}

      {error && !preview?.errors.length && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-[13px] text-exam-red">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2.5">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={loading || !file || !preview?.valid}
          onClick={importQuestions}
        >
          {loading ? "Importing..." : "Import Questions"}
        </Button>
      </div>
    </Modal>
  );
}

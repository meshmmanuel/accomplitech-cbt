"use client";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { apiPatch, apiPost } from "@/lib/api-client";
import type {
  ExamPickerItem,
  SessionListItem,
  SessionStatusCode,
} from "@/modules/sessions";
import { AlertCircle } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

interface SessionFormModalProps {
  session?: SessionListItem | null;
  exams: ExamPickerItem[];
  onClose: () => void;
  onSuccess: (session: SessionListItem) => void;
}

const SESSION_STATUSES: { id: SessionStatusCode; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "upcoming", label: "Upcoming" },
  { id: "open", label: "Open" },
  { id: "completed", label: "Completed" },
];

function defaultDateInput() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function SessionFormModal({
  session,
  exams,
  onClose,
  onSuccess,
}: SessionFormModalProps) {
  const isEdit = Boolean(session);
  const [name, setName] = useState(session?.name ?? "");
  const [date, setDate] = useState(session?.dateInput ?? defaultDateInput());
  const [startTime, setStartTime] = useState(session?.startTime ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    String(session?.durationMinutes ?? 60),
  );
  const [examCode, setExamCode] = useState(session?.examCode ?? "");
  const [instructions, setInstructions] = useState(session?.instructions ?? "");
  const [status, setStatus] = useState<SessionStatusCode>(
    session?.status ?? "draft",
  );
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>(
    session?.exams.map((exam) => exam.id) ?? [],
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(session?.name ?? "");
    setDate(session?.dateInput ?? defaultDateInput());
    setStartTime(session?.startTime ?? "");
    setDurationMinutes(String(session?.durationMinutes ?? 60));
    setExamCode(session?.examCode ?? "");
    setInstructions(session?.instructions ?? "");
    setStatus(session?.status ?? "draft");
    setSelectedExamIds(session?.exams.map((exam) => exam.id) ?? []);
    setError("");
  }, [session]);

  const examsBySubject = useMemo(() => {
    const groups = new Map<string, ExamPickerItem[]>();
    for (const exam of exams) {
      const key = `${exam.subjectCode} — ${exam.subjectName}`;
      const list = groups.get(key) ?? [];
      list.push(exam);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [exams]);

  const toggleExam = (examId: string) => {
    setSelectedExamIds((current) =>
      current.includes(examId)
        ? current.filter((id) => id !== examId)
        : [...current, examId],
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name,
      date,
      startTime,
      durationMinutes: Number.parseInt(durationMinutes, 10),
      examCode,
      instructions,
      status,
      examIds: selectedExamIds,
    };

    const result =
      isEdit && session
        ? await apiPatch<SessionListItem>(`/api/sessions/${session.id}`, payload)
        : await apiPost<SessionListItem>("/api/sessions", payload);

    setLoading(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Save failed");
      return;
    }

    onSuccess(result.data);
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Edit Session" : "New Session"}
      onClose={onClose}
      wide
    >
      <form onSubmit={submit}>
        <Input
          label="Session Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mid-Term Assessment"
          required
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            label="Start Time (optional)"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="10:00 AM"
          />
          <Input
            label="Duration (min)"
            type="number"
            min={5}
            max={600}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            required
          />
        </div>

        <Input
          label="Exam Code"
          value={examCode}
          onChange={(e) => setExamCode(e.target.value.toUpperCase())}
          placeholder="MT2025"
          required
        />
        <p className="-mt-2 mb-3.5 text-[11px] text-exam-muted">
          Students use this code with their admission number to log in.
        </p>

        <div className="mb-3.5">
          <label className="mb-1.5 block text-xs font-semibold text-exam-text">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {SESSION_STATUSES.map((item) => (
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
          <p className="mt-1.5 text-[11px] text-exam-muted">
            Set to Open when students should be able to log in.
          </p>
        </div>

        <Textarea
          label="Session Instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Instructions shown to students before the exam..."
          rows={4}
        />

        <div className="mb-3.5">
          <label className="mb-1.5 block text-xs font-semibold text-exam-text">
            Exams in this session
          </label>
          {exams.length === 0 ? (
            <div className="rounded-lg border border-dashed border-exam-border bg-surface p-4 text-sm text-exam-muted">
              No exams available. Create exams under Subjects &amp; Exams first.
            </div>
          ) : (
            <div className="max-h-52 space-y-3 overflow-y-auto rounded-lg border border-exam-border p-3">
              {examsBySubject.map(([subjectLabel, subjectExams]) => (
                <div key={subjectLabel}>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-exam-muted">
                    {subjectLabel}
                  </p>
                  <div className="space-y-1.5">
                    {subjectExams.map((exam) => {
                      const checked = selectedExamIds.includes(exam.id);
                      return (
                        <label
                          key={exam.id}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                            checked
                              ? "border-navy bg-indigo-50"
                              : "border-exam-border"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleExam(exam.id)}
                              className="accent-navy"
                            />
                            <span className="font-semibold text-exam-text">
                              {exam.name}
                            </span>
                          </span>
                          <span className="text-exam-muted">
                            {exam.durationMinutes} min
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
          <Button
            type="submit"
            variant="primary"
            disabled={loading || exams.length === 0}
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Session"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

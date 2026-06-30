"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Download, Eye, PenLine } from "lucide-react";
import { GradeTheoryModal } from "@/components/admin/grade-theory-modal";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AttemptResultsSummary } from "@/services/attempt.service";

interface ResultsPanelProps {
  items: AttemptResultsSummary[];
  canGrade?: boolean;
}

function formatSubmittedAt(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ResultsPanel({ items, canGrade = true }: ResultsPanelProps) {
  const router = useRouter();
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradingReadOnly, setGradingReadOnly] = useState(false);
  const [sessionFilter, setSessionFilter] = useState("all");
  const [examFilter, setExamFilter] = useState("all");

  const sessionOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(item.sessionId, item.sessionName);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [items]);

  const examOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(item.examId, `${item.subjectCode} - ${item.examName}`);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [items]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (sessionFilter !== "all" && item.sessionId !== sessionFilter) return false;
        if (examFilter !== "all" && item.examId !== examFilter) return false;
        return true;
      }),
    [items, sessionFilter, examFilter],
  );

  const pendingGrades = filtered.filter(
    (item) => item.theoryScore === null && item.theoryTotal > 0,
  ).length;

  return (
    <>
      <div className="mb-4.5 flex flex-wrap items-center gap-2.5">
        <select
          value={sessionFilter}
          onChange={(event) => setSessionFilter(event.target.value)}
          className="rounded-lg border border-exam-border bg-exam-white px-3 py-2 text-[13px] text-exam-text"
        >
          <option value="all">All Sessions</option>
          {sessionOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        <select
          value={examFilter}
          onChange={(event) => setExamFilter(event.target.value)}
          className="rounded-lg border border-exam-border bg-exam-white px-3 py-2 text-[13px] text-exam-text"
        >
          <option value="all">All Exams</option>
          {examOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        <Button variant="ghost">
          <Download size={14} /> Export CSV
        </Button>
        <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-exam-red">
          <AlertCircle size={13} />
          {pendingGrades} pending theory grade{pendingGrades !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-[13px] border border-dashed border-exam-border bg-exam-white p-8 text-center">
          <p className="mb-1 text-[15px] font-bold text-exam-text">No results yet</p>
          <p className="text-sm text-exam-muted">
            Submitted attempts will appear here for grading and export.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-exam-border bg-exam-white">
          <div className="overflow-x-auto">
            <table className="min-w-[750px] w-full border-collapse">
              <thead>
                <tr className="bg-surface">
                  {[
                    "Student",
                    "Exam",
                    "Objective",
                    "Theory",
                    "Total",
                    "Submitted",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="border-b border-exam-border px-3.5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-exam-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const total =
                    item.theoryTotal > 0
                      ? item.theoryScore !== null
                        ? (item.objectiveScore ?? 0) + item.theoryScore
                        : null
                      : item.objectiveScore;
                  const maxTotal = (item.objectiveTotal || 0) + (item.theoryTotal || 0);
                  const pct =
                    total !== null && maxTotal > 0
                      ? Math.round((total / maxTotal) * 100)
                      : null;
                  const pending = item.theoryScore === null && item.theoryTotal > 0;

                  return (
                    <tr
                      key={item.attemptId}
                      className={`border-b border-exam-border ${pending ? "bg-amber-50/50" : ""}`}
                    >
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={item.studentName} />
                          <span className="text-[13px] font-semibold text-exam-text">
                            {item.studentName}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-3 text-xs font-medium text-exam-text">
                        {item.subjectCode} - {item.examName}
                      </td>
                      <td className="px-3.5 py-3 text-[13px] font-bold text-exam-text">
                        {item.objectiveScore !== null
                          ? `${item.objectiveScore}/${item.objectiveTotal}`
                          : "—"}
                      </td>
                      <td className="px-3.5 py-3">
                        {pending ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-exam-amber">
                            <AlertCircle size={12} /> Pending
                          </span>
                        ) : (
                          <span className="text-[13px] font-bold text-exam-text">
                            {item.theoryScore !== null
                              ? `${item.theoryScore}/${item.theoryTotal}`
                              : "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-3">
                        {total !== null ? (
                          <span
                            className={`text-[13px] font-bold ${pct !== null && pct >= 50 ? "text-exam-green" : "text-exam-red"}`}
                          >
                            {total}/{maxTotal}{" "}
                            <span className="text-[11px] font-medium text-exam-muted">
                              ({pct}%)
                            </span>
                          </span>
                        ) : (
                          <span className="text-[13px] text-exam-muted">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-3 text-xs text-exam-muted">
                        {formatSubmittedAt(item.submittedAt)}
                      </td>
                      <td className="px-3.5 py-3">
                        {pending && canGrade ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setGradingReadOnly(false);
                              setGradingId(item.attemptId);
                            }}
                          >
                            <PenLine size={12} /> Grade
                          </Button>
                        ) : pending ? (
                          <span className="text-xs font-semibold text-exam-amber">
                            Pending
                          </span>
                        ) : item.theoryTotal > 0 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setGradingReadOnly(true);
                              setGradingId(item.attemptId);
                            }}
                          >
                            <Eye size={12} /> View
                          </Button>
                        ) : (
                          <span className="text-xs text-exam-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {gradingId !== null && (
        <GradeTheoryModal
          attemptId={gradingId}
          readOnly={gradingReadOnly}
          onClose={() => setGradingId(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}

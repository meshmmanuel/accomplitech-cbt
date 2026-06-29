"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { exams } from "@/data/mock/exams";
import { results } from "@/data/mock/results";
import { sessions } from "@/data/mock/sessions";
import { AlertCircle, Download, Eye, PenLine } from "lucide-react";
import { useState } from "react";

export default function AdminResultsPage() {
  const [gradingId, setGradingId] = useState<number | null>(null);
  const pendingGrades = results.filter(
    (r) => r.th === null && r.thT > 0,
  ).length;

  return (
    <>
      <div className="mb-4.5 flex flex-wrap items-center gap-2.5">
        <select className="rounded-lg border border-exam-border bg-exam-white px-3 py-2 text-[13px] text-exam-text">
          <option>All Sessions</option>
          {sessions.map((s) => (
            <option key={s.id}>{s.name}</option>
          ))}
        </select>
        <select className="rounded-lg border border-exam-border bg-exam-white px-3 py-2 text-[13px] text-exam-text">
          <option>All Exams</option>
          {exams.map((e) => (
            <option key={e.id}>
              {e.subCode} - {e.name}
            </option>
          ))}
        </select>
        <Button variant="ghost">
          <Download size={14} /> Export CSV
        </Button>
        <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-exam-red">
          <AlertCircle size={13} />
          {pendingGrades} pending theory grade
          {pendingGrades !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-exam-border bg-exam-white">
        <div className="overflow-x-auto">
          <table className="min-w-[750px] w-full border-collapse">
            <thead>
              <tr className="bg-surface">
                {[
                  "Student",
                  "Matric",
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
              {results.map((r) => {
                const total =
                  r.obj !== null && r.th !== null ? r.obj + r.th : null;
                const maxTotal = (r.objT || 0) + (r.thT || 0);
                const pct =
                  total !== null ? Math.round((total / maxTotal) * 100) : null;
                const pending = r.th === null && r.thT > 0;

                return (
                  <tr
                    key={r.id}
                    className={`border-b border-exam-border ${pending ? "bg-amber-50/50" : ""}`}
                  >
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={r.name} />
                        <span className="text-[13px] font-semibold text-exam-text">
                          {r.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 font-mono text-xs text-exam-muted">
                      {r.matric}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3 text-xs font-medium text-exam-text">
                      {r.exam}
                    </td>
                    <td className="px-3.5 py-3 text-[13px] font-bold text-exam-text">
                      {r.obj !== null ? `${r.obj}/${r.objT}` : "—"}
                    </td>
                    <td className="px-3.5 py-3">
                      {pending ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-exam-amber">
                          <AlertCircle size={12} /> Pending
                        </span>
                      ) : (
                        <span className="text-[13px] font-bold text-exam-text">
                          {r.th !== null ? `${r.th}/${r.thT}` : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-3">
                      {total !== null ? (
                        <span
                          className={`text-[13px] font-bold ${pct! >= 50 ? "text-exam-green" : "text-exam-red"}`}
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
                      {r.sub}
                    </td>
                    <td className="px-3.5 py-3">
                      {pending ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setGradingId(r.id)}
                        >
                          <PenLine size={12} /> Grade
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm">
                          <Eye size={12} /> View
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {gradingId !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-navy-dark/65 p-4">
          <div className="max-h-[88vh] w-full max-w-[520px] overflow-y-auto rounded-[18px] bg-exam-white p-7 shadow-2xl">
            <h3 className="mb-5 text-[17px] font-extrabold text-exam-text">
              Grade Theory — {results.find((r) => r.id === gradingId)?.name}
            </h3>
            <p className="mb-4 text-[13px] text-exam-muted">
              Theory grading UI — mock placeholder for Phase 2.
            </p>
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => setGradingId(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

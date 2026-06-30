"use client";

import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api-client";
import { clearStudentClientContext } from "@/lib/client-storage";
import { formatDuration } from "@/lib/utils";
import type { SessionHubState, StudentAttemptState } from "@/modules/student-exam";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ExamSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const sessionId = searchParams.get("sessionId");

  const [attempt, setAttempt] = useState<StudentAttemptState | null>(null);
  const [hub, setHub] = useState<SessionHubState | null>(null);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);

  const returnToPortal = async () => {
    setLeaving(true);
    await apiPost("/api/auth/student/logout", {});
    clearStudentClientContext();
    router.push("/student/login");
    router.refresh();
  };

  useEffect(() => {
    async function load() {
      if (attemptId) {
        const result = await apiGet<StudentAttemptState>(
          `/api/attempts/${attemptId}`,
        );
        if (result.error || !result.data) {
          setError(result.error ?? result.message ?? "Could not load results");
          return;
        }
        setAttempt(result.data);
        return;
      }

      if (sessionId) {
        const result = await apiGet<SessionHubState>(
          `/api/sessions/${sessionId}/hub`,
        );
        if (result.error || !result.data) {
          setError(result.error ?? result.message ?? "Could not load session");
          return;
        }
        setHub(result.data);
      }
    }

    void load();
  }, [attemptId, sessionId]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <p className="text-sm text-exam-red">{error}</p>
      </div>
    );
  }

  if (!attempt && !hub) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm text-exam-muted">Loading results...</p>
      </div>
    );
  }

  const title = attempt
    ? `${attempt.subjectCode} · ${attempt.examName}`
    : hub?.sessionName ?? "Session complete";

  const objQuestions =
    attempt?.questions.filter((q) => q.legacyType === "obj") ?? [];
  const thQuestions =
    attempt?.questions.filter((q) => q.legacyType === "theory") ?? [];
  const maxObjectiveScore = objQuestions.reduce((sum, q) => sum + q.marks, 0);
  const score = attempt?.score ?? null;

  const pct =
    score != null && maxObjectiveScore > 0
      ? Math.round((score / maxObjectiveScore) * 100)
      : null;

  return (
    <div className="min-h-screen bg-surface p-10">
      <div className="mx-auto max-w-[560px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-exam-green bg-emerald-50">
            <CheckCircle size={40} className="text-exam-green" />
          </div>
          <h2 className="m-0 mb-1.5 text-[26px] font-black text-exam-text">
            {hub?.expired ? "Session Ended" : "Exam Submitted"}
          </h2>
          <p className="text-sm text-exam-muted">{title}</p>
        </div>

        {attempt && (
          <div className="mb-4 rounded-2xl border border-exam-border bg-exam-white p-6.5">
            <div className="mb-5 grid grid-cols-3 gap-3">
              {[
                {
                  label: "Objective Score",
                  value:
                    score != null ? `${score}/${maxObjectiveScore}` : "—",
                  sub: pct != null ? `${pct}%` : "Graded on submit",
                  color: "text-exam-green",
                },
                {
                  label: "Theory (Paper)",
                  value: `${thQuestions.reduce((s, q) => s + q.marks, 0)} marks`,
                  sub: "To be graded",
                  color: "text-exam-amber",
                },
                {
                  label: "Time left",
                  value: formatDuration(attempt.timeRemainingSeconds),
                  sub: "Session timer",
                  color: "text-navy",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[10px] bg-surface p-3.5 text-center"
                >
                  <div className="mb-1 text-[11px] text-exam-muted">
                    {stat.label}
                  </div>
                  <div className={`text-xl font-extrabold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-exam-muted">{stat.sub}</div>
                </div>
              ))}
            </div>
            {pct != null && (
              <div className="h-1.5 overflow-hidden rounded-full bg-exam-border">
                <div
                  className="h-full rounded-full bg-exam-green"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        )}

        {hub && !attempt && (
          <div className="mb-4 rounded-2xl border border-exam-border bg-exam-white p-6.5">
            <p className="m-0 mb-4 text-sm text-exam-muted">
              Your session time has ended. Submitted papers are listed below.
            </p>
            <ul className="m-0 space-y-2 p-0">
              {hub.exams.map((exam) => (
                <li
                  key={exam.id}
                  className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-bold text-navy">{exam.subjectName}</span>
                    {" · "}
                    {exam.name}
                  </span>
                  <span className="text-exam-muted">
                    {exam.attemptStatus === "submitted"
                      ? "Submitted"
                      : "Not submitted"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {attempt && attempt.examCount > 1 && (
          <Link href={`/session/${attempt.sessionId}/hub`} className="mb-3 block">
            <Button variant="ghost" className="w-full justify-center">
              Continue other exams
            </Button>
          </Link>
        )}

        <Button
          variant="navy"
          className="w-full justify-center"
          disabled={leaving}
          onClick={returnToPortal}
        >
          {leaving ? "Signing out..." : "Back to Exam Portal"}
        </Button>
      </div>
    </div>
  );
}

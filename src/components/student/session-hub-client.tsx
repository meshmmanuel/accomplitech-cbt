"use client";

import { SessionHubPanel } from "@/components/student/question-navigator";
import { apiGet, apiPost } from "@/lib/api-client";
import type { SessionHubState, StudentAttemptState } from "@/modules/student-exam";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface SessionHubClientProps {
  sessionId: string;
  admissionNumber: string;
}

export function SessionHubClient({
  sessionId,
  admissionNumber,
}: SessionHubClientProps) {
  const router = useRouter();
  const [hub, setHub] = useState<SessionHubState | null>(null);
  const [error, setError] = useState("");
  const [loadingExamId, setLoadingExamId] = useState<string | null>(null);

  const loadHub = useCallback(async () => {
    const result = await apiGet<SessionHubState>(
      `/api/sessions/${sessionId}/hub`,
    );

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Failed to load session");
      return;
    }

    setHub(result.data);

    if (result.data.expired) {
      router.push(`/exam/success?sessionId=${sessionId}`);
    }
  }, [sessionId, router]);

  useEffect(() => {
    loadHub();
    const timer = setInterval(loadHub, 15000);
    return () => clearInterval(timer);
  }, [loadHub]);

  useEffect(() => {
    if (!hub || hub.timeRemainingSeconds <= 0) return;
    const tick = setInterval(() => {
      setHub((current) =>
        current
          ? {
              ...current,
              timeRemainingSeconds: Math.max(0, current.timeRemainingSeconds - 1),
            }
          : current,
      );
    }, 1000);
    return () => clearInterval(tick);
  }, [hub?.startedAt]);

  const openExam = async (examId: string) => {
    setLoadingExamId(examId);
    setError("");

    const result = await apiPost<StudentAttemptState>(
      `/api/sessions/${sessionId}/exams/${examId}/start`,
      {},
    );

    setLoadingExamId(null);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Could not open exam");
      return;
    }

    router.push(`/exam/${result.data.attemptId}`);
    router.refresh();
  };

  if (error && !hub) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <p className="text-sm text-exam-red">{error}</p>
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm text-exam-muted">Loading session...</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 px-6 py-2 text-center text-sm text-exam-red">
          {error}
        </div>
      )}
      <SessionHubPanel
        sessionName={hub.sessionName}
        admissionNumber={admissionNumber}
        timeRemainingSeconds={hub.timeRemainingSeconds}
        exams={hub.exams}
        loadingExamId={loadingExamId}
        onOpenExam={openExam}
      />
    </>
  );
}

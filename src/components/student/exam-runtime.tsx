"use client";

import { ExamHeader, QuestionMeta } from "@/components/student/exam-header";
import { InstructionsModal } from "@/components/student/instructions-modal";
import { ObjectiveQuestion } from "@/components/student/objective-question";
import { QuestionNavigator } from "@/components/student/question-navigator";
import { StudentQuestionStem } from "@/components/student/question-stem";
import { SubmitModal } from "@/components/student/submit-modal";
import { TheoryQuestion } from "@/components/student/theory-question";
import { Button } from "@/components/ui/button";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import type {
  StudentAttemptState,
  SubmitAttemptResult,
} from "@/modules/student-exam";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const OPTION_LETTERS = ["A", "B", "C", "D"];

interface ExamRuntimeProps {
  attemptId: string;
  sessionId: string;
  examInstructions?: string | null;
}

export function ExamRuntime({
  attemptId,
  sessionId,
  examInstructions,
}: ExamRuntimeProps) {
  const router = useRouter();
  const [state, setState] = useState<StudentAttemptState | null>(null);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showInstructions, setShowInstructions] = useState(Boolean(examInstructions));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAttempt = useCallback(async () => {
    const result = await apiGet<StudentAttemptState>(
      `/api/attempts/${attemptId}`,
    );

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Failed to load exam");
      return;
    }

    setState(result.data);
    setTimeLeft(result.data.timeRemainingSeconds);

    if (result.data.expired || result.data.status === "SUBMITTED") {
      if (result.data.examCount > 1) {
        router.push(`/session/${sessionId}/hub`);
      } else {
        router.push(
          `/exam/success?attemptId=${attemptId}&sessionId=${sessionId}`,
        );
      }
    }
  }, [attemptId, router, sessionId]);

  useEffect(() => {
    loadAttempt();
    const sync = setInterval(loadAttempt, 30000);
    return () => clearInterval(sync);
  }, [loadAttempt]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft > 0]);

  useEffect(() => {
    if (timeLeft === 0 && state && state.status === "IN_PROGRESS") {
      void handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft === 0]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <p className="text-sm text-exam-red">{error}</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm text-exam-muted">Loading exam...</p>
      </div>
    );
  }

  const questions = state.questions;
  const q = questions[current];
  const objQs = questions.filter((x) => x.legacyType === "obj");
  const thQs = questions.filter((x) => x.legacyType === "theory");
  const answered = objQs.filter((question) => state.answers[question.id]?.selectedOption)
    .length;

  const flagged = new Set(
    questions
      .filter((question) => state.answers[question.id]?.flagged)
      .map((question) => question.id),
  );

  const answerMap = Object.fromEntries(
    Object.entries(state.answers).map(([id, value]) => [id, value.selectedOption]),
  );

  const selectedIndex =
    q && state.answers[q.id]?.selectedOption
      ? OPTION_LETTERS.indexOf(state.answers[q.id].selectedOption!.toUpperCase())
      : -1;

  const persistAnswer = async (
    questionId: string,
    patch: { selectedOption?: string | null; flaggedForReview?: boolean },
  ) => {
    await apiPatch(`/api/attempts/${attemptId}/answers`, {
      questionId,
      ...patch,
    });
  };

  const selectOption = async (index: number) => {
    if (!q || q.legacyType !== "obj") return;
    const letter = OPTION_LETTERS[index];
    setState((prev) =>
      prev
        ? {
            ...prev,
            answers: {
              ...prev.answers,
              [q.id]: {
                ...prev.answers[q.id],
                selectedOption: letter,
                flagged: prev.answers[q.id]?.flagged ?? false,
              },
            },
          }
        : prev,
    );
    await persistAnswer(q.id, { selectedOption: letter });
  };

  const toggleFlag = async () => {
    if (!q) return;
    const next = !state.answers[q.id]?.flagged;
    setState((prev) =>
      prev
        ? {
            ...prev,
            answers: {
              ...prev.answers,
              [q.id]: {
                selectedOption: prev.answers[q.id]?.selectedOption ?? null,
                flagged: next,
              },
            },
          }
        : prev,
    );
    await persistAnswer(q.id, { flaggedForReview: next });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await apiPost<SubmitAttemptResult>(
      `/api/attempts/${attemptId}/submit`,
      {},
    );
    setSubmitting(false);
    setShowSubmit(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Submit failed");
      return;
    }

    if (result.data.examCount > 1 && !result.data.allSubmitted) {
      router.push(`/session/${sessionId}/hub`);
      return;
    }

    router.push(
      `/exam/success?attemptId=${attemptId}&sessionId=${sessionId}`,
    );
  };

  if (showInstructions && examInstructions) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-navy-dark/75 p-4">
        <div className="w-full max-w-[500px] rounded-[18px] bg-exam-white p-8 shadow-2xl">
          <InstructionsModal
            instructions={examInstructions}
            onBegin={() => setShowInstructions(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-surface">
      <ExamHeader
        title={`${state.subjectCode} · ${state.examName}`}
        subtitle={`${answered}/${objQs.length} objective answered · ${thQs.length} theory on paper`}
        timeLeft={timeLeft}
        onSubmit={() => setShowSubmit(true)}
        switchHref={
          state.examCount > 1 ? `/session/${sessionId}/hub` : undefined
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <QuestionNavigator
          questions={questions}
          current={current}
          answers={answerMap}
          flagged={flagged}
          onSelect={setCurrent}
        />

        <div className="flex-1 overflow-y-auto p-7">
          <div className="mx-auto max-w-[620px]">
            {q && (
              <>
                <QuestionMeta
                  current={current}
                  total={questions.length}
                  type={q.legacyType}
                  marks={q.marks}
                  flagged={flagged.has(q.id)}
                  onToggleFlag={toggleFlag}
                />

                <div className="mb-4.5 rounded-[14px] border border-exam-border bg-exam-white p-6.5">
                  <StudentQuestionStem
                    blocks={q.blocks}
                    assets={q.assets}
                    assetUrlMap={q.assetUrlMap}
                  />
                  {q.legacyType === "obj" ? (
                    <ObjectiveQuestion
                      options={q.options}
                      selected={selectedIndex >= 0 ? selectedIndex : undefined}
                      onSelect={selectOption}
                    />
                  ) : (
                    <TheoryQuestion />
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrent(Math.max(0, current - 1))}
                  >
                    <ChevronLeft size={14} /> Previous
                  </Button>
                  {current < questions.length - 1 ? (
                    <Button
                      variant="navy"
                      size="sm"
                      onClick={() => setCurrent(current + 1)}
                    >
                      Next <ChevronRight size={14} />
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowSubmit(true)}
                    >
                      Review and Submit
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showSubmit && (
        <SubmitModal
          answered={answered}
          objTotal={objQs.length}
          thTotal={thQs.length}
          flagged={flagged.size}
          timeLeft={timeLeft}
          onClose={() => setShowSubmit(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}

"use client";

import { QuestionMeta } from "@/components/student/exam-header";
import { ObjectiveQuestion } from "@/components/student/objective-question";
import { QuestionNavigator } from "@/components/student/question-navigator";
import { SessionSubmitAllModal } from "@/components/student/session-submit-all-modal";
import { StudentQuestionStem } from "@/components/student/question-stem";
import { TheoryQuestion } from "@/components/student/theory-question";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  clearWorkspaceState,
  loadWorkspaceState,
  saveWorkspaceState,
} from "@/lib/workspace-persistence";
import { computeTimeRemainingSeconds } from "@/lib/session-timer";
import { cn, formatDuration } from "@/lib/utils";
import type {
  SessionExamSummary,
  SessionHubExam,
  SessionHubState,
  StudentAttemptState,
  SubmitSessionResult,
} from "@/modules/student-exam";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Monitor,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const OPTION_LETTERS = ["A", "B", "C", "D"];
const SAVE_DEBOUNCE_MS = 1500;
const HUB_SYNC_MS = 8000;

interface PendingSave {
  attemptId: string;
  examId: string;
  questionId: string;
  selectedOption?: string | null;
  flaggedForReview?: boolean;
  previous: { selectedOption: string | null; flagged: boolean };
}

interface SessionWorkspaceProps {
  sessionId: string;
}

export function SessionWorkspace({ sessionId }: SessionWorkspaceProps) {
  const router = useRouter();
  const [hub, setHub] = useState<SessionHubState | null>(null);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Record<string, StudentAttemptState>>({});
  const [currentByExam, setCurrentByExam] = useState<Record<string, number>>({});
  const [doneExams, setDoneExams] = useState<Set<string>>(new Set());
  const [openedExamIds, setOpenedExamIds] = useState<Set<string>>(new Set());
  const [instructionsOpen, setInstructionsOpen] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingExamId, setLoadingExamId] = useState<string | null>(null);
  const [showSubmitAll, setShowSubmitAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [bootstrapping, setBootstrapping] = useState(true);
  const [showTimeUp, setShowTimeUp] = useState(false);

  const attemptsRef = useRef(attempts);
  attemptsRef.current = attempts;

  const activeExamIdRef = useRef(activeExamId);
  activeExamIdRef.current = activeExamId;

  const hubRef = useRef<SessionHubState | null>(null);
  const sessionSubmittedRef = useRef(false);
  const expiryHandledRef = useRef(false);
  const handleTimeExpiredRef = useRef<() => Promise<void>>(async () => {});
  const syncHubStateRef = useRef<() => Promise<SessionHubState | null>>(
    async () => null,
  );
  const ensureExamStartedRef = useRef<
    (exam: SessionHubExam) => Promise<StudentAttemptState | null>
  >(async () => null);
  const pendingRef = useRef<Map<string, PendingSave>>(new Map());
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushingRef = useRef(false);

  const finishSubmittedSession = useCallback(() => {
    sessionSubmittedRef.current = true;
    clearWorkspaceState(sessionId);
    router.push(`/exam/success?sessionId=${sessionId}`);
  }, [router, sessionId]);

  const applyHubState = useCallback((data: SessionHubState) => {
    setHub(data);
    hubRef.current = data;
    setTimeLeft(computeTimeRemainingSeconds(data));
  }, []);

  const syncHubState = useCallback(async (): Promise<SessionHubState | null> => {
    const result = await apiGet<SessionHubState>(`/api/sessions/${sessionId}/hub`);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Failed to load session");
      return null;
    }

    applyHubState(result.data);

    if (result.data.allSubmitted) {
      finishSubmittedSession();
      return null;
    }

    if (
      result.data.expired &&
      !expiryHandledRef.current &&
      !sessionSubmittedRef.current
    ) {
      expiryHandledRef.current = true;
      void handleTimeExpiredRef.current();
    }

    return result.data;
  }, [applyHubState, finishSubmittedSession, sessionId]);

  syncHubStateRef.current = syncHubState;

  const loadAttempt = useCallback(async (examId: string, attemptId: string) => {
    const result = await apiGet<StudentAttemptState>(`/api/attempts/${attemptId}`);
    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Failed to load exam");
      return null;
    }
    setAttempts((prev) => ({ ...prev, [examId]: result.data! }));
    setOpenedExamIds((prev) => new Set(prev).add(examId));
    return result.data;
  }, []);

  const markExamOpened = useCallback((examId: string) => {
    setOpenedExamIds((prev) => new Set(prev).add(examId));
  }, []);

  const ensureExamStarted = useCallback(
    async (exam: SessionHubExam): Promise<StudentAttemptState | null> => {
      const cached = attemptsRef.current[exam.id];
      if (cached?.status === "IN_PROGRESS") {
        markExamOpened(exam.id);
        return cached;
      }

      if (exam.attemptId && exam.attemptStatus === "in_progress") {
        const loaded = await loadAttempt(exam.id, exam.attemptId);
        if (loaded) markExamOpened(exam.id);
        return loaded;
      }

      if (exam.attemptStatus === "submitted" && exam.attemptId) {
        const loaded = await loadAttempt(exam.id, exam.attemptId);
        if (loaded) markExamOpened(exam.id);
        return loaded;
      }

      setLoadingExamId(exam.id);
      const result = await apiPost<StudentAttemptState>(
        `/api/sessions/${sessionId}/exams/${exam.id}/start`,
        {},
      );
      setLoadingExamId(null);

      if (result.error || !result.data) {
        setError(result.error ?? result.message ?? "Could not open exam");
        return null;
      }

      setAttempts((prev) => ({ ...prev, [exam.id]: result.data! }));
      markExamOpened(exam.id);
      return result.data;
    },
    [loadAttempt, markExamOpened, sessionId],
  );

  ensureExamStartedRef.current = ensureExamStarted;

  const patchAttemptAnswers = useCallback(
    (
      examId: string,
      questionId: string,
      patch: { selectedOption?: string | null; flaggedForReview?: boolean },
    ) => {
      setAttempts((prev) => {
        const attempt = prev[examId];
        if (!attempt) return prev;
        return {
          ...prev,
          [examId]: {
            ...attempt,
            answers: {
              ...attempt.answers,
              [questionId]: {
                selectedOption:
                  patch.selectedOption !== undefined
                    ? patch.selectedOption
                    : (attempt.answers[questionId]?.selectedOption ?? null),
                flagged:
                  patch.flaggedForReview !== undefined
                    ? patch.flaggedForReview
                    : (attempt.answers[questionId]?.flagged ?? false),
              },
            },
          },
        };
      });
    },
    [],
  );

  const revertAnswer = useCallback(
    (
      examId: string,
      questionId: string,
      previous: { selectedOption: string | null; flagged: boolean },
    ) => {
      setAttempts((prev) => {
        const attempt = prev[examId];
        if (!attempt) return prev;
        return {
          ...prev,
          [examId]: {
            ...attempt,
            answers: { ...attempt.answers, [questionId]: previous },
          },
        };
      });
    },
    [],
  );

  const flushPendingSaves = useCallback(async (): Promise<boolean> => {
    if (flushingRef.current || sessionSubmittedRef.current) return true;

    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }

    const pending = Array.from(pendingRef.current.values());
    if (pending.length === 0) return true;

    flushingRef.current = true;
    pendingRef.current.clear();

    const result = await apiPost<{ saved: number }>(
      `/api/sessions/${sessionId}/answers/batch`,
      {
        saves: pending.map((item) => ({
          attemptId: item.attemptId,
          questionId: item.questionId,
          selectedOption: item.selectedOption,
          flaggedForReview: item.flaggedForReview,
        })),
      },
    );

    flushingRef.current = false;

    if (result.error || !result.data) {
      for (const item of pending) {
        revertAnswer(item.examId, item.questionId, item.previous);
        pendingRef.current.set(`${item.examId}:${item.questionId}`, item);
      }
      setSaveError(
        result.error ?? result.message ?? "Some answers could not be saved",
      );
      return false;
    }

    setSaveError("");
    return true;
  }, [revertAnswer, sessionId]);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      void flushPendingSaves();
    }, SAVE_DEBOUNCE_MS);
  }, [flushPendingSaves]);

  const queueAnswerSave = useCallback(
    (
      attemptId: string,
      examId: string,
      questionId: string,
      patch: { selectedOption?: string | null; flaggedForReview?: boolean },
    ) => {
      const attempt = attemptsRef.current[examId];
      if (!attempt) return;

      const key = `${examId}:${questionId}`;
      const current = attempt.answers[questionId] ?? {
        selectedOption: null,
        flagged: false,
      };

      const existing = pendingRef.current.get(key);
      if (!existing) {
        pendingRef.current.set(key, {
          attemptId,
          examId,
          questionId,
          ...patch,
          previous: { ...current },
        });
      } else {
        pendingRef.current.set(key, {
          ...existing,
          ...patch,
        });
      }

      patchAttemptAnswers(examId, questionId, patch);
      scheduleFlush();
    },
    [patchAttemptAnswers, scheduleFlush],
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setBootstrapping(true);
      const state = await syncHubStateRef.current();
      if (cancelled) return;

      if (!state || state.exams.length === 0) {
        setBootstrapping(false);
        return;
      }

      const persisted = loadWorkspaceState(sessionId);
      const restoredId =
        persisted?.activeExamId &&
        state.exams.some((exam) => exam.id === persisted.activeExamId)
          ? persisted.activeExamId
          : state.exams[0].id;

      if (persisted) {
        setDoneExams(new Set(persisted.doneExams));
        setCurrentByExam(persisted.currentByExam);
        setOpenedExamIds(new Set(persisted.openedExamIds));
      }

      setActiveExamId(restoredId);

      const restoredExam = state.exams.find((exam) => exam.id === restoredId)!;
      await ensureExamStartedRef.current(restoredExam);

      if (persisted?.openedExamIds) {
        for (const examId of persisted.openedExamIds) {
          if (examId === restoredId) continue;
          const exam = state.exams.find((item) => item.id === examId);
          if (exam) void ensureExamStartedRef.current(exam);
        }
      }

      if (!cancelled) setBootstrapping(false);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
    // Bootstrap once per session — callbacks accessed via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    const sync = setInterval(() => {
      void syncHubStateRef.current();
    }, HUB_SYNC_MS);
    return () => clearInterval(sync);
  }, [sessionId]);

  useEffect(() => {
    if (!hub) return;

    const tick = () => {
      const current = hubRef.current;
      if (!current || sessionSubmittedRef.current) return;

      const remaining = computeTimeRemainingSeconds(current);
      setTimeLeft(remaining);

      if (remaining <= 0 && !expiryHandledRef.current) {
        expiryHandledRef.current = true;
        if (hubRef.current) {
          hubRef.current = { ...hubRef.current, expired: true };
        }
        void handleTimeExpiredRef.current();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [hub?.startedAt, hub?.durationMinutes, hub?.expired]);

  useEffect(() => {
    if (!activeExamId || bootstrapping) return;
    saveWorkspaceState(sessionId, {
      activeExamId,
      doneExams: [...doneExams],
      currentByExam,
      openedExamIds: [...openedExamIds],
    });
  }, [
    activeExamId,
    bootstrapping,
    currentByExam,
    doneExams,
    openedExamIds,
    sessionId,
  ]);

  useEffect(() => {
    const warnOnLeave = (event: BeforeUnloadEvent) => {
      if (sessionSubmittedRef.current) return;
      if (pendingRef.current.size === 0 && !hub) return;
      event.preventDefault();
      event.returnValue =
        "Your exam session is still in progress. Leaving will submit your papers.";
    };

    const handlePageHide = () => {
      if (sessionSubmittedRef.current) return;

      const pending = Array.from(pendingRef.current.values());
      if (pending.length > 0) {
        void fetch(`/api/sessions/${sessionId}/answers/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            saves: pending.map((item) => ({
              attemptId: item.attemptId,
              questionId: item.questionId,
              selectedOption: item.selectedOption,
              flaggedForReview: item.flaggedForReview,
            })),
          }),
          keepalive: true,
          credentials: "include",
        });
      }

      void fetch(`/api/sessions/${sessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        keepalive: true,
        credentials: "include",
      });
    };

    window.addEventListener("beforeunload", warnOnLeave);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("beforeunload", warnOnLeave);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [hub, sessionId]);

  const activeExam = hub?.exams.find((exam) => exam.id === activeExamId);
  const activeAttempt = activeExamId ? attempts[activeExamId] : undefined;
  const current = activeExamId ? (currentByExam[activeExamId] ?? 0) : 0;
  const loadingActiveExam = Boolean(
    activeExamId && (loadingExamId === activeExamId || !activeAttempt),
  );

  const selectTab = async (exam: SessionHubExam) => {
    if (exam.id === activeExamIdRef.current) return;
    await flushPendingSaves();
    setActiveExamId(exam.id);
    setError("");
    await ensureExamStarted(exam);
  };

  const toggleDone = (examId: string) => {
    setDoneExams((prev) => {
      const next = new Set(prev);
      if (next.has(examId)) next.delete(examId);
      else next.add(examId);
      return next;
    });
  };

  const toggleInstructions = (examId: string) => {
    setInstructionsOpen((prev) => ({
      ...prev,
      [examId]: !(prev[examId] ?? false),
    }));
  };

  const setCurrentForActive = (index: number) => {
    if (!activeExamId) return;
    setCurrentByExam((prev) => ({ ...prev, [activeExamId]: index }));
  };

  const examSummaries = useMemo((): SessionExamSummary[] => {
    if (!hub) return [];
    return hub.exams.map((exam) => {
      const attempt = attempts[exam.id];
      const objQs = attempt?.questions.filter((q) => q.legacyType === "obj") ?? [];
      const thQs = attempt?.questions.filter((q) => q.legacyType === "theory") ?? [];
      const objAnswered = objQs.filter(
        (q) => attempt?.answers[q.id]?.selectedOption,
      ).length;
      const flagged = attempt
        ? attempt.questions.filter((q) => attempt.answers[q.id]?.flagged).length
        : 0;
      const opened = openedExamIds.has(exam.id) || Boolean(attempt);

      return {
        examId: exam.id,
        subjectCode: exam.subjectCode,
        subjectName: exam.subjectName,
        examName: exam.name,
        objAnswered,
        objTotal: objQs.length || exam.questionCount,
        thTotal: thQs.length,
        flagged,
        markedDone: doneExams.has(exam.id),
        opened,
      };
    });
  }, [attempts, doneExams, hub, openedExamIds]);

  const handleSubmitAll = useCallback(async () => {
    const flushed = await flushPendingSaves();
    if (!flushed) return;

    setSubmitting(true);
    const result = await apiPost<SubmitSessionResult>(
      `/api/sessions/${sessionId}/submit`,
      {},
    );
    setSubmitting(false);
    setShowSubmitAll(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Submit failed");
      setShowTimeUp(false);
      return;
    }

    finishSubmittedSession();
    router.refresh();
  }, [finishSubmittedSession, flushPendingSaves, router, sessionId]);

  const handleTimeExpired = useCallback(async () => {
    if (sessionSubmittedRef.current) return;
    setShowTimeUp(true);
    await handleSubmitAll();
  }, [handleSubmitAll]);

  handleTimeExpiredRef.current = handleTimeExpired;

  if (bootstrapping || !hub || !activeExam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm text-exam-muted">Loading session...</p>
      </div>
    );
  }

  if (error && !hub) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <p className="text-sm text-exam-red">{error}</p>
      </div>
    );
  }

  const questions = activeAttempt?.questions ?? [];
  const q = questions[current];
  const objQs = questions.filter((x) => x.legacyType === "obj");
  const thQs = questions.filter((x) => x.legacyType === "theory");
  const answered = objQs.filter(
    (question) => activeAttempt?.answers[question.id]?.selectedOption,
  ).length;

  const flagged = new Set(
    questions
      .filter((question) => activeAttempt?.answers[question.id]?.flagged)
      .map((question) => question.id),
  );

  const answerMap = Object.fromEntries(
    Object.entries(activeAttempt?.answers ?? {}).map(([id, value]) => [
      id,
      value.selectedOption,
    ]),
  );

  const selectedIndex =
    q && activeAttempt?.answers[q.id]?.selectedOption
      ? OPTION_LETTERS.indexOf(
          activeAttempt.answers[q.id].selectedOption!.toUpperCase(),
        )
      : -1;

  const timerColor =
    timeLeft > 600
      ? "text-exam-white"
      : timeLeft > 180
        ? "text-gold"
        : "text-red-300";

  const showInstructions = instructionsOpen[activeExam.id] ?? false;
  const hasInstructions = Boolean(activeExam.instructions?.trim());
  const isSingleExam = hub.exams.length === 1;

  return (
    <div className="flex h-screen flex-col bg-surface">
      <header className="shrink-0 bg-navy shadow-md">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold">
            <Monitor size={15} className="text-navy-dark" />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-x-auto">
            {isSingleExam ? (
              <div className="min-w-0 px-1">
                <div className="truncate text-sm font-bold text-exam-white">
                  {activeExam.subjectName}
                </div>
                <div className="truncate text-[11px] text-[#8899CC]">
                  {activeExam.name}
                  <span className="mx-1.5 text-white/25">·</span>
                  <span className="font-semibold uppercase tracking-wide">
                    {activeExam.subjectCode}
                  </span>
                </div>
              </div>
            ) : (
              hub.exams.map((exam) => {
                const isActive = exam.id === activeExamId;
                const isDone = doneExams.has(exam.id);
                const isLoading = loadingExamId === exam.id;
                const isUnopened =
                  !openedExamIds.has(exam.id) && !attempts[exam.id];

                return (
                  <div
                    key={exam.id}
                    className={cn(
                      "flex shrink-0 items-stretch overflow-hidden rounded-lg border",
                      isActive
                        ? "border-gold/60 bg-white/10"
                        : isUnopened
                          ? "border-amber-400/40 bg-amber-500/10"
                          : "border-white/15 bg-white/5 hover:bg-white/8",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => void selectTab(exam)}
                      className={cn(
                        "flex max-w-[220px] items-center gap-1.5 border-0 bg-transparent px-3 py-2",
                        isActive ? "text-gold" : "text-exam-white",
                      )}
                    >
                      <span className="truncate text-sm font-bold">
                        {exam.subjectName}
                      </span>
                      {isUnopened && (
                        <span className="shrink-0 rounded bg-amber-500/25 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-200">
                          Not opened
                        </span>
                      )}
                      {isDone && (
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-exam-green">
                          <Check size={9} className="text-exam-white" />
                        </span>
                      )}
                      {isLoading && (
                        <span className="shrink-0 text-[10px] text-[#8899CC]">…</span>
                      )}
                    </button>
                    <div className="w-px self-stretch bg-white/20" aria-hidden />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleDone(exam.id);
                      }}
                      className={cn(
                        "shrink-0 border-0 px-3 py-2 text-[10px] font-bold transition-colors",
                        isDone
                          ? "bg-emerald-500/15 text-emerald-200"
                          : "bg-transparent text-[#8899CC] hover:bg-white/10 hover:text-exam-white",
                      )}
                    >
                      I&apos;m done
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1",
                timeLeft <= 180
                  ? "border border-exam-red bg-red-500/20"
                  : "border border-white/15 bg-white/8",
              )}
            >
              <Clock size={14} className={timerColor} />
              <span
                className={cn(
                  "text-base font-extrabold tabular-nums tracking-wide",
                  timerColor,
                )}
              >
                {formatDuration(timeLeft)}
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="shrink-0"
              onClick={() => setShowSubmitAll(true)}
            >
              {isSingleExam ? "Submit exam" : "Submit all"}
            </Button>
          </div>
        </div>

        {hasInstructions && (
          <div className="border-t border-white/10 bg-navy-dark/40">
            <button
              type="button"
              onClick={() => toggleInstructions(activeExam.id)}
              className="flex w-full items-center justify-between px-5 py-2 text-left text-[12px] font-semibold text-[#8899CC] hover:text-exam-white"
            >
              <span>{activeExam.subjectName} instructions</span>
              {showInstructions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showInstructions && (
              <div className="border-t border-white/5 px-5 py-3">
                <p className="m-0 whitespace-pre-line text-[12px] leading-relaxed text-[#B8C4E8]">
                  {activeExam.instructions}
                </p>
              </div>
            )}
          </div>
        )}
      </header>

      {(error || saveError) && (
        <div className="bg-red-50 px-5 py-2 text-center text-sm text-exam-red">
          {error || saveError}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {loadingActiveExam || !activeAttempt ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-exam-muted">Loading questions...</p>
          </div>
        ) : (
          <>
            <QuestionNavigator
              questions={questions}
              current={current}
              answers={answerMap}
              flagged={flagged}
              onSelect={setCurrentForActive}
            />

            <div className="flex-1 overflow-y-auto p-7">
              <div className="mx-auto max-w-[620px]">
                <p className="mb-4 text-[11px] text-exam-muted">
                  {answered}/{objQs.length} objective answered · {thQs.length} theory
                  on paper
                </p>

                {q && (
                  <>
                    <QuestionMeta
                      current={current}
                      total={questions.length}
                      type={q.legacyType}
                      marks={q.marks}
                      flagged={flagged.has(q.id)}
                      onToggleFlag={() => {
                        const next = !activeAttempt.answers[q.id]?.flagged;
                        queueAnswerSave(
                          activeAttempt.attemptId,
                          activeExam.id,
                          q.id,
                          { flaggedForReview: next },
                        );
                      }}
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
                          onSelect={(index) => {
                            const letter = OPTION_LETTERS[index];
                            queueAnswerSave(
                              activeAttempt.attemptId,
                              activeExam.id,
                              q.id,
                              { selectedOption: letter },
                            );
                          }}
                        />
                      ) : (
                        <TheoryQuestion />
                      )}
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentForActive(Math.max(0, current - 1))}
                      >
                        <ChevronLeft size={14} /> Previous
                      </Button>
                      {current < questions.length - 1 ? (
                        <Button
                          variant="navy"
                          size="sm"
                          onClick={() => setCurrentForActive(current + 1)}
                        >
                          Next <ChevronRight size={14} />
                        </Button>
                      ) : (
                        <span className="self-center text-xs text-exam-muted">
                          {isSingleExam
                            ? "Last question — submit when ready"
                            : "Last question — switch tab or submit all when ready"}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showSubmitAll && (
        <SessionSubmitAllModal
          sessionName={hub.sessionName}
          exams={examSummaries}
          timeLeft={timeLeft}
          singleExam={isSingleExam}
          submitting={submitting}
          onClose={() => setShowSubmitAll(false)}
          onSubmit={handleSubmitAll}
        />
      )}

      {showTimeUp && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-navy-dark/80 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-exam-white p-8 text-center shadow-2xl">
            <Clock size={32} className="mx-auto mb-3 text-exam-amber" />
            <h2 className="m-0 mb-2 text-lg font-extrabold text-exam-text">
              Time is up
            </h2>
            <p className="m-0 text-sm text-exam-muted">
              {submitting
                ? "Saving your answers and submitting your exam…"
                : isSingleExam
                  ? "Your session time has ended. Submitting your exam now."
                  : "Your session time has ended. Submitting now."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

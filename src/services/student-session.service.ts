import { SessionStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";
import type {
  SessionHubState,
  StudentAttemptState,
  SubmitAttemptResult,
  SubmitSessionResult,
} from "@/modules/student-exam";
import {
  buildCanonicalFromDb,
  toQuestionBankItem,
} from "@/modules/questions";
import { canonicalOptionsToLegacyStrings } from "@/modules/questions/blocks";
import { examTypeToCode } from "@/modules/subjects/mappers";
import { attemptRepository } from "@/repositories/attempt.repository";
import { sessionParticipationRepository } from "@/repositories/session-participation.repository";
import { sessionRepository } from "@/repositories/session.repository";
import { attemptService } from "@/services/attempt.service";

function buildAssetUrlMap(
  assets?: Array<{ id: string; path: string }>,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const asset of assets ?? []) {
    if (asset.path.startsWith("http") || asset.path.startsWith("/")) {
      map[asset.id] = asset.path;
    } else {
      map[asset.id] = `/api/assets/${asset.path.replace(/^\/+/, "")}`;
    }
  }
  return map;
}

export class StudentSessionService {
  private async getOpenSessionOrThrow(sessionId: string) {
    const session = await sessionRepository.findById(sessionId);
    if (!session) {
      throw new AppError("Session not found", 404);
    }
    if (session.status !== SessionStatus.OPEN) {
      throw new AppError("This exam session is not currently open", 403);
    }
    return session;
  }

  getTimeRemainingSeconds(
    startedAt: Date,
    durationMinutes: number,
    endedAt?: Date | null,
  ) {
    if (endedAt) return 0;
    const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    return Math.max(0, durationMinutes * 60 - elapsedSeconds);
  }

  async beginSession(sessionId: string, admissionNumber: string) {
    const session = await this.getOpenSessionOrThrow(sessionId);

    let participation =
      await sessionParticipationRepository.findBySessionAndAdmission(
        sessionId,
        admissionNumber,
      );

    if (!participation) {
      participation = await sessionParticipationRepository.create(
        sessionId,
        admissionNumber,
      );
    }

    return this.buildHubState(session, participation, admissionNumber);
  }

  async getHub(sessionId: string, admissionNumber: string) {
    const session = await this.getOpenSessionOrThrow(sessionId);
    const participation =
      await sessionParticipationRepository.findBySessionAndAdmission(
        sessionId,
        admissionNumber,
      );

    if (!participation) {
      throw new AppError("Session has not been started yet", 400);
    }

    return this.buildHubState(session, participation, admissionNumber);
  }

  private async buildHubState(
    session: NonNullable<Awaited<ReturnType<typeof sessionRepository.findById>>>,
    participation: { startedAt: Date; endedAt: Date | null },
    admissionNumber: string,
  ): Promise<SessionHubState> {
    const timeRemainingSeconds = this.getTimeRemainingSeconds(
      participation.startedAt,
      session.durationMinutes,
      participation.endedAt,
    );
    const expired = timeRemainingSeconds <= 0;

    if (expired && !participation.endedAt) {
      await this.expireStudentSession(session.id, admissionNumber);
      participation =
        (await sessionParticipationRepository.findBySessionAndAdmission(
          session.id,
          admissionNumber,
        )) ?? participation;
    }

    const attempts = await attemptRepository.findBySessionAndAdmission(
      session.id,
      admissionNumber,
    );
    const attemptByExamId = new Map(attempts.map((a) => [a.examId, a]));

    const exams = session.sessionExams.map(({ exam }) => {
      const attempt = attemptByExamId.get(exam.id);
      let attemptStatus: SessionHubState["exams"][0]["attemptStatus"] =
        "not_started";
      if (attempt?.status === "IN_PROGRESS") attemptStatus = "in_progress";
      if (attempt?.status === "SUBMITTED" || attempt?.status === "GRADED") {
        attemptStatus = "submitted";
      }

      return {
        id: exam.id,
        name: exam.name,
        subjectCode: exam.subject.code,
        subjectName: exam.subject.name,
        type: examTypeToCode(exam.type),
        questionCount: exam.questions?.length ?? 0,
        attemptId: attempt?.id ?? null,
        attemptStatus,
        score: attempt?.score ?? null,
        instructions: exam.instructions,
      };
    });

    const allSubmitted =
      exams.length > 0 &&
      exams.every((exam) => exam.attemptStatus === "submitted");

    return {
      sessionId: session.id,
      sessionName: session.name,
      startedAt: participation.startedAt.toISOString(),
      timeRemainingSeconds: expired ? 0 : timeRemainingSeconds,
      durationMinutes: session.durationMinutes,
      examCount: exams.length,
      exams,
      allSubmitted,
      expired,
    };
  }

  async expireStudentSession(sessionId: string, admissionNumber: string) {
    const inProgress = await attemptRepository.findInProgressBySessionAndAdmission(
      sessionId,
      admissionNumber,
    );

    const participation =
      await sessionParticipationRepository.findBySessionAndAdmission(
        sessionId,
        admissionNumber,
      );

    const timeSpentSeconds = participation
      ? Math.min(
          Math.floor((Date.now() - participation.startedAt.getTime()) / 1000),
          ((await sessionRepository.findById(sessionId))?.durationMinutes ?? 0) *
            60,
        )
      : 0;

    for (const attempt of inProgress) {
      await attemptService.submitAttempt(attempt.id, timeSpentSeconds);
    }

    if (participation && !participation.endedAt) {
      await sessionParticipationRepository.markEnded(sessionId, admissionNumber);
    }
  }

  async startExam(
    sessionId: string,
    examId: string,
    admissionNumber: string,
  ) {
    const session = await this.getOpenSessionOrThrow(sessionId);
    const linked = session.sessionExams.some(({ examId: id }) => id === examId);
    if (!linked) {
      throw new AppError("Exam is not part of this session", 400);
    }

    const participation =
      await sessionParticipationRepository.findBySessionAndAdmission(
        sessionId,
        admissionNumber,
      );
    if (!participation) {
      throw new AppError("Start the session before opening an exam", 400);
    }

    const timeRemainingSeconds = this.getTimeRemainingSeconds(
      participation.startedAt,
      session.durationMinutes,
      participation.endedAt,
    );

    if (timeRemainingSeconds <= 0) {
      await this.expireStudentSession(sessionId, admissionNumber);
      throw new AppError("Session time has expired", 403);
    }

    const attempt = await attemptService.startAttempt({
      sessionId,
      examId,
      admissionNumber,
    });

    if (!attempt) {
      throw new AppError("Failed to start exam", 500);
    }

    return this.getAttemptForStudent(
      attempt.id,
      sessionId,
      admissionNumber,
    );
  }

  async getAttemptForStudent(
    attemptId: string,
    sessionId: string,
    admissionNumber: string,
  ): Promise<StudentAttemptState> {
    const attempt = await attemptRepository.findById(attemptId);
    if (!attempt) {
      throw new AppError("Attempt not found", 404);
    }

    if (
      attempt.sessionId !== sessionId ||
      attempt.admissionNumber !== admissionNumber
    ) {
      throw new AppError("Access denied", 403);
    }

    const session = await sessionRepository.findById(sessionId);
    if (!session) {
      throw new AppError("Session not found", 404);
    }

    const participation =
      await sessionParticipationRepository.findBySessionAndAdmission(
        sessionId,
        admissionNumber,
      );

    const timeRemainingSeconds = participation
      ? this.getTimeRemainingSeconds(
          participation.startedAt,
          session.durationMinutes,
          participation.endedAt,
        )
      : 0;

    const expired = timeRemainingSeconds <= 0;

    const questions = attempt.exam.questions.map((question) => {
      const bankItem = toQuestionBankItem(question);
      const legacyOptions = canonicalOptionsToLegacyStrings(
        buildCanonicalFromDb(question).options,
      );

      return {
        id: question.id,
        legacyType: bankItem.legacyType,
        marks: question.marks,
        blocks: bankItem.blocks,
        assets: bankItem.assets,
        assetUrlMap: bankItem.assetUrlMap,
        options: legacyOptions ?? [],
      };
    });

    const answers: StudentAttemptState["answers"] = {};
    for (const answer of attempt.answers) {
      answers[answer.questionId] = {
        selectedOption: answer.selectedOption,
        flagged: answer.flaggedForReview,
      };
    }

    return {
      attemptId: attempt.id,
      examId: attempt.examId,
      sessionId: attempt.sessionId,
      examName: attempt.exam.name,
      subjectCode: attempt.exam.subject.code,
      examCount: session.sessionExams.length,
      status: attempt.status,
      score: attempt.score,
      timeRemainingSeconds: Math.max(0, timeRemainingSeconds),
      expired,
      questions,
      answers,
    };
  }

  async saveAnswer(input: {
    attemptId: string;
    sessionId: string;
    admissionNumber: string;
    questionId: string;
    selectedOption?: string | null;
    flaggedForReview?: boolean;
  }) {
    const attempt = await attemptRepository.findById(input.attemptId);
    if (!attempt) {
      throw new AppError("Attempt not found", 404);
    }

    if (
      attempt.sessionId !== input.sessionId ||
      attempt.admissionNumber !== input.admissionNumber
    ) {
      throw new AppError("Access denied", 403);
    }

    if (attempt.status !== "IN_PROGRESS") {
      throw new AppError("This exam has already been submitted", 400);
    }

    const session = await sessionRepository.findById(input.sessionId);
    if (!session) {
      throw new AppError("Session not found", 404);
    }

    const participation =
      await sessionParticipationRepository.findBySessionAndAdmission(
        input.sessionId,
        input.admissionNumber,
      );

    const timeRemainingSeconds = participation
      ? this.getTimeRemainingSeconds(
          participation.startedAt,
          session.durationMinutes,
          participation.endedAt,
        )
      : 0;

    if (timeRemainingSeconds <= 0) {
      throw new AppError("Session time has expired", 403);
    }

    await attemptService.saveAnswer({
      attemptId: input.attemptId,
      questionId: input.questionId,
      selectedOption: input.selectedOption,
      flaggedForReview: input.flaggedForReview,
    });

    return { saved: true };
  }

  async saveAnswersBatch(input: {
    sessionId: string;
    admissionNumber: string;
    saves: Array<{
      attemptId: string;
      questionId: string;
      selectedOption?: string | null;
      flaggedForReview?: boolean;
    }>;
  }) {
    if (input.saves.length === 0) {
      return { saved: 0 };
    }

    const session = await sessionRepository.findById(input.sessionId);
    if (!session) {
      throw new AppError("Session not found", 404);
    }

    const participation =
      await sessionParticipationRepository.findBySessionAndAdmission(
        input.sessionId,
        input.admissionNumber,
      );

    const timeRemainingSeconds = participation
      ? this.getTimeRemainingSeconds(
          participation.startedAt,
          session.durationMinutes,
          participation.endedAt,
        )
      : 0;

    if (timeRemainingSeconds <= 0) {
      throw new AppError("Session time has expired", 403);
    }

    let saved = 0;

    for (const save of input.saves) {
      const attempt = await attemptRepository.findById(save.attemptId);
      if (!attempt) continue;

      if (
        attempt.sessionId !== input.sessionId ||
        attempt.admissionNumber !== input.admissionNumber ||
        attempt.status !== "IN_PROGRESS"
      ) {
        continue;
      }

      await attemptService.saveAnswer({
        attemptId: save.attemptId,
        questionId: save.questionId,
        selectedOption: save.selectedOption,
        flaggedForReview: save.flaggedForReview,
      });
      saved += 1;
    }

    return { saved };
  }

  async submitExam(
    attemptId: string,
    sessionId: string,
    admissionNumber: string,
  ): Promise<SubmitAttemptResult> {
    const attemptState = await this.getAttemptForStudent(
      attemptId,
      sessionId,
      admissionNumber,
    );

    if (attemptState.status !== "IN_PROGRESS") {
      throw new AppError("This exam has already been submitted", 400);
    }

    const participation =
      await sessionParticipationRepository.findBySessionAndAdmission(
        sessionId,
        admissionNumber,
      );

    const timeSpentSeconds = participation
      ? Math.floor((Date.now() - participation.startedAt.getTime()) / 1000)
      : 0;

    const submitted = await attemptService.submitAttempt(
      attemptId,
      timeSpentSeconds,
    );

    const hub = await this.getHub(sessionId, admissionNumber);

    return {
      attemptId,
      examId: submitted?.examId ?? attemptState.examId,
      sessionId,
      score: submitted?.score ?? null,
      examCount: hub.examCount,
      allSubmitted: hub.allSubmitted,
      timeRemainingSeconds: hub.timeRemainingSeconds,
    };
  }

  async submitAllExams(
    sessionId: string,
    admissionNumber: string,
  ): Promise<SubmitSessionResult> {
    const hub = await this.getHub(sessionId, admissionNumber);

    if (hub.allSubmitted) {
      throw new AppError("Session has already been submitted", 400);
    }

    if (hub.expired) {
      throw new AppError("Session time has expired", 403);
    }

    const participation =
      await sessionParticipationRepository.findBySessionAndAdmission(
        sessionId,
        admissionNumber,
      );

    const timeSpentSeconds = participation
      ? Math.floor((Date.now() - participation.startedAt.getTime()) / 1000)
      : 0;

    const inProgress = await attemptRepository.findInProgressBySessionAndAdmission(
      sessionId,
      admissionNumber,
    );

    for (const attempt of inProgress) {
      await attemptService.submitAttempt(attempt.id, timeSpentSeconds);
    }

    if (participation && !participation.endedAt) {
      await sessionParticipationRepository.markEnded(sessionId, admissionNumber);
    }

    return {
      sessionId,
      examCount: hub.examCount,
      submittedCount: inProgress.length,
      timeRemainingSeconds: hub.timeRemainingSeconds,
    };
  }
}

export const studentSessionService = new StudentSessionService();

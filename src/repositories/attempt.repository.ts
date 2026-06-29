import type { AttemptStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export class AttemptRepository {
  findById(id: string) {
    return db.examAttempt.findUnique({
      where: { id },
      include: {
        session: true,
        exam: {
          include: {
            subject: true,
            questions: { orderBy: { sortOrder: "asc" } },
          },
        },
        answers: true,
      },
    });
  }

  findActive(sessionId: string, examId: string, admissionNumber: string) {
    return db.examAttempt.findFirst({
      where: {
        sessionId,
        examId,
        admissionNumber,
        status: "IN_PROGRESS",
      },
      include: { answers: true },
    });
  }

  findBySession(sessionId: string) {
    return db.examAttempt.findMany({
      where: { sessionId },
      include: {
        exam: { include: { subject: true } },
      },
      orderBy: { startedAt: "desc" },
    });
  }

  create(data: Prisma.ExamAttemptCreateInput) {
    return db.examAttempt.create({ data });
  }

  update(id: string, data: Prisma.ExamAttemptUpdateInput) {
    return db.examAttempt.update({ where: { id }, data });
  }

  upsertAnswer(data: {
    attemptId: string;
    questionId: string;
    selectedOption?: string | null;
    flaggedForReview?: boolean;
  }) {
    return db.examAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: data.attemptId,
          questionId: data.questionId,
        },
      },
      create: {
        attemptId: data.attemptId,
        questionId: data.questionId,
        selectedOption: data.selectedOption,
        flaggedForReview: data.flaggedForReview ?? false,
        answeredAt: data.selectedOption ? new Date() : undefined,
      },
      update: {
        selectedOption: data.selectedOption,
        flaggedForReview: data.flaggedForReview,
        answeredAt: data.selectedOption ? new Date() : undefined,
      },
    });
  }

  submit(id: string, score: number | null, timeSpentSeconds: number) {
    return db.examAttempt.update({
      where: { id },
      data: {
        status: "SUBMITTED" satisfies AttemptStatus,
        submittedAt: new Date(),
        score,
        timeSpentSeconds,
      },
    });
  }

  countInProgress(institutionId: string) {
    return db.examAttempt.count({
      where: {
        status: "IN_PROGRESS",
        session: { institutionId },
      },
    });
  }
}

export const attemptRepository = new AttemptRepository();

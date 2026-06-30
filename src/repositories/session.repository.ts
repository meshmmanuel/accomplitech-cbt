import type { Prisma, SessionStatus } from "@prisma/client";
import { db } from "@/lib/db";

export class SessionRepository {
  findAllByInstitution(institutionId: string) {
    return db.examSession.findMany({
      where: { institutionId },
      include: {
        sessionExams: {
          include: {
            exam: {
              include: { subject: true },
            },
          },
        },
        _count: { select: { attempts: true } },
      },
      orderBy: { date: "desc" },
    });
  }

  findById(id: string) {
    return db.examSession.findUnique({
      where: { id },
      include: {
        sessionExams: {
          include: {
            exam: {
              include: {
                subject: true,
                questions: { orderBy: { sortOrder: "asc" } },
              },
            },
          },
        },
        _count: { select: { attempts: true } },
      },
    });
  }

  findByExamCode(examCode: string) {
    return db.examSession.findUnique({
      where: { examCode: examCode.toUpperCase() },
      include: {
        sessionExams: {
          include: {
            exam: {
              include: {
                subject: true,
                questions: { orderBy: { sortOrder: "asc" } },
              },
            },
          },
        },
      },
    });
  }

  findByExamCodeConflict(examCode: string, excludeId?: string) {
    return db.examSession.findFirst({
      where: {
        examCode: examCode.toUpperCase(),
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }

  create(data: Prisma.ExamSessionCreateInput) {
    return db.examSession.create({ data });
  }

  update(id: string, data: Prisma.ExamSessionUpdateInput) {
    return db.examSession.update({ where: { id }, data });
  }

  updateStatus(id: string, status: SessionStatus) {
    return db.examSession.update({
      where: { id },
      data: { status },
    });
  }

  delete(id: string) {
    return db.examSession.delete({ where: { id } });
  }

  replaceSessionExams(sessionId: string, examIds: string[]) {
    return db.$transaction(async (tx) => {
      await tx.examSessionExam.deleteMany({ where: { sessionId } });
      if (examIds.length > 0) {
        await tx.examSessionExam.createMany({
          data: examIds.map((examId) => ({
            sessionId,
            examId,
            isReleased: false,
          })),
        });
      }
    });
  }

  setExamRelease(sessionId: string, examId: string, isReleased: boolean) {
    return db.examSessionExam.update({
      where: {
        sessionId_examId: { sessionId, examId },
      },
      data: {
        isReleased,
        releasedAt: isReleased ? new Date() : null,
      },
    });
  }

  countActive(institutionId: string) {
    return db.examSession.count({
      where: { institutionId, status: "OPEN" },
    });
  }
}

export const sessionRepository = new SessionRepository();

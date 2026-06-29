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

  countActive(institutionId: string) {
    return db.examSession.count({
      where: { institutionId, status: "OPEN" },
    });
  }
}

export const sessionRepository = new SessionRepository();

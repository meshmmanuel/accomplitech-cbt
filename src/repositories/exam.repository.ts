import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export class ExamRepository {
  findById(id: string) {
    return db.exam.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: { orderBy: { sortOrder: "asc" } },
        _count: { select: { questions: true } },
      },
    });
  }

  findByIdWithRelations(id: string) {
    return db.exam.findUnique({
      where: { id },
      include: {
        _count: {
          select: { questions: true, sessionExams: true, attempts: true },
        },
      },
    });
  }

  findBySubject(subjectId: string) {
    return db.exam.findMany({
      where: { subjectId },
      include: {
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findAllByInstitution(institutionId: string) {
    return db.exam.findMany({
      where: { subject: { institutionId } },
      include: { subject: true },
      orderBy: [{ subject: { code: "asc" } }, { name: "asc" }],
    });
  }

  findManyByIdsForInstitution(institutionId: string, examIds: string[]) {
    return db.exam.findMany({
      where: {
        id: { in: examIds },
        subject: { institutionId },
      },
      include: { subject: true },
    });
  }

  create(data: Prisma.ExamCreateInput) {
    return db.exam.create({ data });
  }

  update(id: string, data: Prisma.ExamUpdateInput) {
    return db.exam.update({ where: { id }, data });
  }

  delete(id: string) {
    return db.exam.delete({ where: { id } });
  }

  countByInstitution(institutionId: string) {
    return db.exam.count({
      where: { subject: { institutionId } },
    });
  }
}

export const examRepository = new ExamRepository();

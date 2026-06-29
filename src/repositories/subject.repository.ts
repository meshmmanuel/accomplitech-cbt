import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export class SubjectRepository {
  findAllByInstitution(institutionId: string) {
    return db.subject.findMany({
      where: { institutionId },
      include: {
        _count: { select: { exams: true } },
      },
      orderBy: { code: "asc" },
    });
  }

  findById(id: string) {
    return db.subject.findUnique({
      where: { id },
      include: {
        exams: {
          include: {
            _count: { select: { questions: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  findByCode(institutionId: string, code: string) {
    return db.subject.findUnique({
      where: {
        institutionId_code: { institutionId, code },
      },
    });
  }

  create(data: Prisma.SubjectCreateInput) {
    return db.subject.create({ data });
  }

  update(id: string, data: Prisma.SubjectUpdateInput) {
    return db.subject.update({ where: { id }, data });
  }

  delete(id: string) {
    return db.subject.delete({ where: { id } });
  }
}

export const subjectRepository = new SubjectRepository();

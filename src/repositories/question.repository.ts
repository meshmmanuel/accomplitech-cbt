import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export class QuestionRepository {
  findByExam(examId: string) {
    return db.question.findMany({
      where: { examId },
      orderBy: { sortOrder: "asc" },
    });
  }

  findById(id: string) {
    return db.question.findUnique({ where: { id } });
  }

  create(data: Prisma.QuestionCreateInput) {
    return db.question.create({ data });
  }

  createMany(data: Prisma.QuestionCreateManyInput[]) {
    return db.question.createMany({ data });
  }

  update(id: string, data: Prisma.QuestionUpdateInput) {
    return db.question.update({ where: { id }, data });
  }

  delete(id: string) {
    return db.question.delete({ where: { id } });
  }

  deleteByExam(examId: string) {
    return db.question.deleteMany({ where: { examId } });
  }

  getMaxSortOrder(examId: string) {
    return db.question
      .aggregate({
        where: { examId },
        _max: { sortOrder: true },
      })
      .then((result) => result._max.sortOrder ?? -1);
  }
}

export const questionRepository = new QuestionRepository();

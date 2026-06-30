import type { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";

const userWithSubjectsInclude = {
  subjectAssignments: {
    include: {
      subject: {
        select: { id: true, code: true },
      },
    },
  },
} as const;

export type UserWithSubjectAssignments = User & {
  subjectAssignments: Array<{
    subject: { id: string; code: string };
  }>;
};

export class UserRepository {
  findByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      include: { institution: true },
    });
  }

  findById(id: string) {
    return db.user.findUnique({
      where: { id },
      include: { institution: true },
    });
  }

  findByIdWithSubjects(id: string) {
    return db.user.findUnique({
      where: { id },
      include: userWithSubjectsInclude,
    });
  }

  findAllByInstitution(institutionId: string) {
    return db.user.findMany({
      where: { institutionId },
      include: userWithSubjectsInclude,
      orderBy: [{ status: "asc" }, { name: "asc" }],
    });
  }

  findAssignedSubjectIds(userId: string) {
    return db.userSubject
      .findMany({
        where: { userId },
        select: { subjectId: true },
      })
      .then((rows) => rows.map((row) => row.subjectId));
  }

  create(data: Prisma.UserCreateInput) {
    return db.user.create({ data });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return db.user.update({ where: { id }, data });
  }

  async replaceSubjectAssignments(userId: string, subjectIds: string[]) {
    await db.$transaction(async (tx) => {
      await tx.userSubject.deleteMany({ where: { userId } });
      if (subjectIds.length === 0) return;

      await tx.userSubject.createMany({
        data: subjectIds.map((subjectId) => ({ userId, subjectId })),
      });
    });
  }
}

export const userRepository = new UserRepository();

export type UserWithInstitution = User & {
  institution: { id: string; name: string };
};

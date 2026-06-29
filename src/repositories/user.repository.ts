import type { Prisma, User } from "@prisma/client";
import { db } from "@/lib/db";

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

  create(data: Prisma.UserCreateInput) {
    return db.user.create({ data });
  }
}

export const userRepository = new UserRepository();

export type UserWithInstitution = User & {
  institution: { id: string; name: string };
};

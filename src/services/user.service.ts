import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import { AppError } from "@/lib/errors";
import type { AdminAuthUser } from "@/modules/auth/types";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserListItem,
} from "@/modules/users";
import { institutionRepository } from "@/repositories/institution.repository";
import { subjectRepository } from "@/repositories/subject.repository";
import {
  userRepository,
  type UserWithSubjectAssignments,
} from "@/repositories/user.repository";

function toUserListItem(user: UserWithSubjectAssignments): UserListItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    subjectIds: user.subjectAssignments.map((item) => item.subject.id),
    subjectCodes: user.subjectAssignments.map((item) => item.subject.code),
    createdAt: user.createdAt.toISOString(),
  };
}

export class UserService {
  private async getDefaultInstitutionId() {
    const institution = await institutionRepository.findDefault();
    if (!institution) {
      throw new AppError("Institution not configured", 500);
    }
    return institution.id;
  }

  private async validateSubjectAssignments(
    institutionId: string,
    role: UserRole,
    subjectIds: string[] | undefined,
  ) {
    if (role !== "LECTURER") {
      return [];
    }

    if (!subjectIds || subjectIds.length === 0) {
      throw new AppError("Lecturers must be assigned at least one subject", 400);
    }

    for (const subjectId of subjectIds) {
      const subject = await subjectRepository.findById(subjectId);
      if (!subject || subject.institutionId !== institutionId) {
        throw new AppError("One or more assigned subjects are invalid", 400);
      }
    }

    return [...new Set(subjectIds)];
  }

  async listForInstitution(institutionId: string) {
    const users = await userRepository.findAllByInstitution(institutionId);
    return users.map(toUserListItem);
  }

  async create(input: CreateUserInput, actor: AdminAuthUser) {
    const institutionId = actor.institutionId;
    const email = input.email.trim().toLowerCase();
    const existing = await userRepository.findByEmail(email);

    if (existing) {
      throw new AppError("A user with this email already exists", 409);
    }

    if (input.role === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") {
      throw new AppError("Only super admins can create super admin accounts", 403);
    }

    const subjectIds = await this.validateSubjectAssignments(
      institutionId,
      input.role,
      input.subjectIds,
    );

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await userRepository.create({
      institution: { connect: { id: institutionId } },
      email,
      name: input.name.trim(),
      role: input.role,
      passwordHash,
    });

    if (subjectIds.length > 0) {
      await userRepository.replaceSubjectAssignments(user.id, subjectIds);
    }

    const created = await userRepository.findByIdWithSubjects(user.id);
    if (!created) {
      throw new AppError("Failed to create user", 500);
    }

    return toUserListItem(created);
  }

  async update(
    userId: string,
    input: UpdateUserInput,
    actor: AdminAuthUser,
  ) {
    const existing = await userRepository.findByIdWithSubjects(userId);
    if (!existing || existing.institutionId !== actor.institutionId) {
      throw new AppError("User not found", 404);
    }

    if (userId === actor.id && input.status === "INACTIVE") {
      throw new AppError("You cannot deactivate your own account", 400);
    }

    if (
      input.role === "SUPER_ADMIN" &&
      actor.role !== "SUPER_ADMIN" &&
      existing.role !== "SUPER_ADMIN"
    ) {
      throw new AppError("Only super admins can assign the super admin role", 403);
    }

    const nextRole = input.role ?? existing.role;
    const subjectIds =
      input.subjectIds !== undefined
        ? await this.validateSubjectAssignments(
            actor.institutionId,
            nextRole,
            input.subjectIds,
          )
        : nextRole === "LECTURER"
          ? existing.subjectAssignments.map((item) => item.subject.id)
          : [];

    if (nextRole === "LECTURER" && subjectIds.length === 0) {
      throw new AppError("Lecturers must be assigned at least one subject", 400);
    }

    const updateData: Parameters<typeof userRepository.update>[1] = {};
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.role !== undefined) updateData.role = input.role;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(input.password, 10);
    }

    if (Object.keys(updateData).length > 0) {
      await userRepository.update(userId, updateData);
    }

    if (input.subjectIds !== undefined || input.role !== undefined) {
      await userRepository.replaceSubjectAssignments(
        userId,
        nextRole === "LECTURER" ? subjectIds : [],
      );
    }

    const updated = await userRepository.findByIdWithSubjects(userId);
    if (!updated) {
      throw new AppError("User not found", 404);
    }

    return toUserListItem(updated);
  }
}

export const userService = new UserService();

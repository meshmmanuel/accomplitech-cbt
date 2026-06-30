import type { UserRole } from "@prisma/client";
import type { AdminAuthUser } from "@/modules/auth/types";
import { AppError } from "@/lib/errors";
import {
  canManageExamContent,
  canManageSubjects,
} from "@/lib/admin-roles";
import { userRepository } from "@/repositories/user.repository";

export async function getAssignedSubjectIds(
  admin: AdminAuthUser,
): Promise<string[] | null> {
  if (admin.role !== "LECTURER") {
    return null;
  }

  return userRepository.findAssignedSubjectIds(admin.id);
}

export async function assertSubjectAccess(
  admin: AdminAuthUser,
  subjectId: string,
) {
  if (!canManageExamContent(admin.role)) {
    throw new AppError("You do not have permission to access this subject", 403);
  }

  if (admin.role !== "LECTURER") {
    return;
  }

  const assigned = await userRepository.findAssignedSubjectIds(admin.id);
  if (!assigned.includes(subjectId)) {
    throw new AppError("You do not have access to this subject", 403);
  }
}

export async function assertInstitutionSubjectAccess(
  admin: AdminAuthUser,
  institutionId: string,
  subjectId: string,
) {
  if (admin.institutionId !== institutionId) {
    throw new AppError("Subject not found", 404);
  }

  await assertSubjectAccess(admin, subjectId);
}

export function assertCanManageSubjects(admin: AdminAuthUser) {
  if (!canManageSubjects(admin.role)) {
    throw new AppError("You do not have permission to manage subjects", 403);
  }
}

export function filterSubjectsForAdmin<T extends { id: string }>(
  admin: AdminAuthUser,
  subjects: T[],
  assignedSubjectIds: string[] | null,
) {
  if (assignedSubjectIds === null) {
    return subjects;
  }

  const allowed = new Set(assignedSubjectIds);
  return subjects.filter((subject) => allowed.has(subject.id));
}

export function isLecturer(role: UserRole) {
  return role === "LECTURER";
}

import { AppError } from "@/lib/errors";
import {
  assertCanManageSubjects,
  assertSubjectAccess,
  filterSubjectsForAdmin,
  getAssignedSubjectIds,
} from "@/lib/admin-access";
import type { AdminAuthUser } from "@/modules/auth/types";
import {
  toSubjectDetail,
  toSubjectListItem,
  type CreateSubjectInput,
  type UpdateSubjectInput,
} from "@/modules/subjects";
import { institutionRepository } from "@/repositories/institution.repository";
import { subjectRepository } from "@/repositories/subject.repository";

export class SubjectService {
  private async getDefaultInstitutionId() {
    const institution = await institutionRepository.findDefault();
    if (!institution) {
      throw new AppError("Institution not configured", 500);
    }
    return institution.id;
  }

  async listAllForInstitution(admin: AdminAuthUser) {
    const subjects = await subjectRepository.findAllByInstitution(
      admin.institutionId,
    );
    return subjects.map(toSubjectListItem);
  }

  async listForAdmin(admin: AdminAuthUser) {
    const subjects = await subjectRepository.findAllByInstitution(
      admin.institutionId,
    );
    const assignedSubjectIds = await getAssignedSubjectIds(admin);
    const filtered = filterSubjectsForAdmin(
      admin,
      subjects,
      assignedSubjectIds,
    );
    return filtered.map(toSubjectListItem);
  }

  async listForDefaultInstitution() {
    const institutionId = await this.getDefaultInstitutionId();
    const subjects = await subjectRepository.findAllByInstitution(institutionId);
    return subjects.map(toSubjectListItem);
  }

  async getByIdForAdmin(id: string, admin: AdminAuthUser) {
    const subject = await subjectRepository.findById(id);
    if (!subject || subject.institutionId !== admin.institutionId) {
      return null;
    }

    await assertSubjectAccess(admin, id);
    return toSubjectDetail(subject);
  }

  async create(input: CreateSubjectInput, admin: AdminAuthUser) {
    assertCanManageSubjects(admin);
    const institutionId = admin.institutionId;
    const existing = await subjectRepository.findByCode(institutionId, input.code);
    if (existing) {
      throw new AppError(`Subject code "${input.code}" already exists`, 409);
    }

    const subject = await subjectRepository.create({
      institution: { connect: { id: institutionId } },
      code: input.code,
      name: input.name,
      description: input.description || null,
      department: input.department || null,
    });

    return toSubjectListItem({
      ...subject,
      _count: { exams: 0 },
    });
  }

  async update(id: string, input: UpdateSubjectInput, admin: AdminAuthUser) {
    assertCanManageSubjects(admin);
    const existing = await subjectRepository.findById(id);
    if (!existing) {
      throw new AppError("Subject not found", 404);
    }

    if (input.code && input.code !== existing.code) {
      const duplicate = await subjectRepository.findByCode(
        existing.institutionId,
        input.code,
      );
      if (duplicate) {
        throw new AppError(`Subject code "${input.code}" already exists`, 409);
      }
    }

    const subject = await subjectRepository.update(id, {
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description || null }
        : {}),
      ...(input.department !== undefined
        ? { department: input.department || null }
        : {}),
    });

    const examCount = existing.exams.length;
    return toSubjectListItem({
      ...subject,
      _count: { exams: examCount },
    });
  }

  async delete(id: string, admin: AdminAuthUser) {
    assertCanManageSubjects(admin);
    const existing = await subjectRepository.findById(id);
    if (!existing) {
      throw new AppError("Subject not found", 404);
    }

    if (existing.exams.length > 0) {
      throw new AppError(
        "Cannot delete a subject that has exams. Remove its exams first.",
        409,
      );
    }

    await subjectRepository.delete(id);
  }
}

export const subjectService = new SubjectService();

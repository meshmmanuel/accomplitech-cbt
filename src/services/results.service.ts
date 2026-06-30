import { attemptService } from "@/services/attempt.service";
import { institutionRepository } from "@/repositories/institution.repository";
import { AppError } from "@/lib/errors";
import type { AdminAuthUser } from "@/modules/auth/types";
import { getAssignedSubjectIds } from "@/lib/admin-access";

export class ResultsService {
  private async getDefaultInstitutionId() {
    const institution = await institutionRepository.findDefault();
    if (!institution) {
      throw new AppError("Institution not configured", 500);
    }
    return institution.id;
  }

  async listForAdmin(admin: AdminAuthUser) {
    const items = await attemptService.listSubmittedForInstitution(
      admin.institutionId,
    );

    if (admin.role !== "LECTURER") {
      return items;
    }

    const assigned = new Set(await getAssignedSubjectIds(admin));
    return items.filter((item) => assigned.has(item.subjectId));
  }

  async listForDefaultInstitution() {
    const institutionId = await this.getDefaultInstitutionId();
    return attemptService.listSubmittedForInstitution(institutionId);
  }

  async getGradingDetail(attemptId: string, admin: AdminAuthUser) {
    const detail = await attemptService.getGradingDetail(
      attemptId,
      admin.institutionId,
    );

    if (admin.role === "LECTURER") {
      const attempt = await attemptService.getById(attemptId);
      const assigned = new Set(await getAssignedSubjectIds(admin));
      if (!attempt || !assigned.has(attempt.exam.subjectId)) {
        throw new AppError("Attempt not found", 404);
      }
    }

    return detail;
  }

  async gradeTheory(input: {
    attemptId: string;
    admin: AdminAuthUser;
    marks: Array<{ questionId: string; marksAwarded: number }>;
  }) {
    if (input.admin.role === "LECTURER") {
      const attempt = await attemptService.getById(input.attemptId);
      const assigned = new Set(await getAssignedSubjectIds(input.admin));
      if (!attempt || !assigned.has(attempt.exam.subjectId)) {
        throw new AppError("Attempt not found", 404);
      }
    }

    return attemptService.gradeTheory({
      attemptId: input.attemptId,
      institutionId: input.admin.institutionId,
      gradedById: input.admin.id,
      marks: input.marks,
    });
  }
}

export const resultsService = new ResultsService();

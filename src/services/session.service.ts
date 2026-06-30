import { AppError } from "@/lib/errors";
import {
  sessionStatusCodeToDb,
  toExamPickerItem,
  toSessionListItem,
  type CreateSessionInput,
  type UpdateSessionInput,
} from "@/modules/sessions";
import { examRepository } from "@/repositories/exam.repository";
import { institutionRepository } from "@/repositories/institution.repository";
import { sessionRepository } from "@/repositories/session.repository";

export class SessionService {
  private async getDefaultInstitutionId() {
    const institution = await institutionRepository.findDefault();
    if (!institution) {
      throw new AppError("Institution not configured", 500);
    }
    return institution.id;
  }

  async listForDefaultInstitution() {
    const institutionId = await this.getDefaultInstitutionId();
    const sessions = await sessionRepository.findAllByInstitution(institutionId);
    return sessions.map(toSessionListItem);
  }

  async listExamsForPicker() {
    const institutionId = await this.getDefaultInstitutionId();
    const exams = await examRepository.findAllByInstitution(institutionId);
    return exams.map(toExamPickerItem);
  }

  async getDetail(id: string) {
    const session = await sessionRepository.findById(id);
    if (!session) return null;
    return toSessionListItem(session);
  }

  getById(id: string) {
    return sessionRepository.findById(id);
  }

  async getOpenSessionByCode(examCode: string) {
    const session = await sessionRepository.findByExamCode(examCode);

    if (!session) {
      throw new AppError("Exam code not found", 404);
    }

    if (session.status !== "OPEN") {
      throw new AppError("This exam session is not currently open", 403);
    }

    return session;
  }

  async getByExamCode(examCode: string) {
    const session = await sessionRepository.findByExamCode(examCode);
    if (!session) {
      throw new AppError("Exam code not found", 404);
    }
    return session;
  }

  private async validateExamIds(institutionId: string, examIds: string[]) {
    const exams = await examRepository.findManyByIdsForInstitution(
      institutionId,
      examIds,
    );

    if (exams.length !== examIds.length) {
      throw new AppError("One or more selected exams were not found", 400);
    }

    return exams;
  }

  private async assertUniqueExamCode(examCode: string, excludeId?: string) {
    const existing = await sessionRepository.findByExamCodeConflict(
      examCode,
      excludeId,
    );
    if (existing) {
      throw new AppError(`Exam code "${examCode.toUpperCase()}" is already in use`, 409);
    }
  }

  async create(input: CreateSessionInput) {
    const institutionId = await this.getDefaultInstitutionId();
    await this.assertUniqueExamCode(input.examCode);
    await this.validateExamIds(institutionId, input.examIds);

    const session = await sessionRepository.create({
      institution: { connect: { id: institutionId } },
      name: input.name,
      date: new Date(input.date),
      startTime: input.startTime || null,
      durationMinutes: input.durationMinutes,
      instructions: input.instructions || null,
      examCode: input.examCode,
      status: sessionStatusCodeToDb(input.status ?? "draft"),
      sessionExams: {
        create: input.examIds.map((examId) => ({ examId })),
      },
    });

    const created = await sessionRepository.findById(session.id);
    if (!created) {
      throw new AppError("Failed to create session", 500);
    }

    return toSessionListItem(created);
  }

  async update(id: string, input: UpdateSessionInput) {
    const existing = await sessionRepository.findById(id);
    if (!existing) {
      throw new AppError("Session not found", 404);
    }

    const institutionId = await this.getDefaultInstitutionId();

    if (input.examCode) {
      await this.assertUniqueExamCode(input.examCode, id);
    }

    if (input.examIds) {
      await this.validateExamIds(institutionId, input.examIds);
    }

    await sessionRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
      ...(input.startTime !== undefined
        ? { startTime: input.startTime || null }
        : {}),
      ...(input.durationMinutes !== undefined
        ? { durationMinutes: input.durationMinutes }
        : {}),
      ...(input.instructions !== undefined
        ? { instructions: input.instructions || null }
        : {}),
      ...(input.examCode !== undefined ? { examCode: input.examCode } : {}),
      ...(input.status !== undefined
        ? { status: sessionStatusCodeToDb(input.status) }
        : {}),
    });

    if (input.examIds) {
      await sessionRepository.replaceSessionExams(id, input.examIds);
    }

    const updated = await sessionRepository.findById(id);
    if (!updated) {
      throw new AppError("Session not found", 404);
    }

    return toSessionListItem(updated);
  }

  async delete(id: string) {
    const existing = await sessionRepository.findById(id);
    if (!existing) {
      throw new AppError("Session not found", 404);
    }

    if (existing._count.attempts > 0) {
      throw new AppError(
        "Cannot delete a session that has student attempts.",
        409,
      );
    }

    await sessionRepository.delete(id);
  }
}

export const sessionService = new SessionService();

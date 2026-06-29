import { SessionStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { institutionRepository } from "@/repositories/institution.repository";
import { sessionRepository } from "@/repositories/session.repository";

export class SessionService {
  async listForDefaultInstitution() {
    const institution = await institutionRepository.findDefault();
    if (!institution) return [];
    return sessionRepository.findAllByInstitution(institution.id);
  }

  getById(id: string) {
    return sessionRepository.findById(id);
  }

  async getOpenSessionByCode(examCode: string) {
    const session = await sessionRepository.findByExamCode(examCode);

    if (!session) {
      throw new AppError("Exam code not found", 404);
    }

    if (session.status !== SessionStatus.OPEN) {
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
}

export const sessionService = new SessionService();

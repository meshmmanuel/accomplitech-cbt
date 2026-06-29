import { attemptRepository } from "@/repositories/attempt.repository";
import { examRepository } from "@/repositories/exam.repository";
import { institutionRepository } from "@/repositories/institution.repository";
import { sessionRepository } from "@/repositories/session.repository";
import { subjectRepository } from "@/repositories/subject.repository";

export class OverviewService {
  async getStats() {
    const institution = await institutionRepository.findDefault();
    if (!institution) {
      return {
        activeAttempts: 0,
        totalSubjects: 0,
        totalExams: 0,
        activeSessions: 0,
      };
    }

    const [subjects, totalExams, activeSessions, activeAttempts] =
      await Promise.all([
        subjectRepository.findAllByInstitution(institution.id),
        examRepository.countByInstitution(institution.id),
        sessionRepository.countActive(institution.id),
        attemptRepository.countInProgress(institution.id),
      ]);

    return {
      activeAttempts,
      totalSubjects: subjects.length,
      totalExams,
      activeSessions,
    };
  }
}

export const overviewService = new OverviewService();

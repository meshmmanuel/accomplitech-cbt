import type { OverviewDashboard, OverviewStats } from "@/modules/overview/types";
import { toSessionListItem } from "@/modules/sessions";
import { toSubjectListItem } from "@/modules/subjects";
import { attemptRepository } from "@/repositories/attempt.repository";
import { examRepository } from "@/repositories/exam.repository";
import { institutionRepository } from "@/repositories/institution.repository";
import { sessionRepository } from "@/repositories/session.repository";
import { subjectRepository } from "@/repositories/subject.repository";
import { attemptService } from "@/services/attempt.service";
import { monitorService } from "@/services/monitor.service";

const EMPTY_STATS: OverviewStats = {
  inExam: 0,
  clientsOnline: 0,
  studentsConnected: 0,
  totalExams: 0,
  totalSubjects: 0,
  activeSessions: 0,
  pendingGrades: 0,
};

export class OverviewService {
  async getStats(): Promise<OverviewStats> {
    const institution = await institutionRepository.findDefault();
    if (!institution) return EMPTY_STATS;

    const [monitor, totalExams, activeSessions, subjects, submitted] =
      await Promise.all([
        monitorService.getLiveState(),
        examRepository.countByInstitution(institution.id),
        sessionRepository.countActive(institution.id),
        subjectRepository.findAllByInstitution(institution.id),
        attemptService.listSubmittedForInstitution(institution.id),
      ]);

    const pendingGrades = submitted.filter(
      (item) => item.theoryScore === null && item.theoryTotal > 0,
    ).length;

    const studentsConnected = monitor.clients.filter(
      (client) => client.presence === "online" && client.admissionNumber,
    ).length;

    return {
      inExam: monitor.summary.inExam,
      clientsOnline: monitor.summary.online,
      studentsConnected,
      totalExams,
      totalSubjects: subjects.length,
      activeSessions,
      pendingGrades,
    };
  }

  async getDashboard(): Promise<OverviewDashboard> {
    const institution = await institutionRepository.findDefault();
    if (!institution) {
      return { stats: EMPTY_STATS, sessions: [], subjects: [] };
    }

    const [stats, sessions, subjects] = await Promise.all([
      this.getStats(),
      sessionRepository.findAllByInstitution(institution.id),
      subjectRepository.findAllByInstitution(institution.id),
    ]);

    return {
      stats,
      sessions: sessions
        .map(toSessionListItem)
        .sort(
          (a, b) =>
            new Date(b.dateInput).getTime() - new Date(a.dateInput).getTime(),
        )
        .slice(0, 6),
      subjects: subjects.map(toSubjectListItem),
    };
  }
}

export const overviewService = new OverviewService();

import type { ClientActivity } from "@prisma/client";
import { mapPresenceToMonitorStatus } from "@/modules/clients/mappers";
import type { MonitorClientRow, MonitorLiveState } from "@/modules/clients/types";
import { attemptRepository } from "@/repositories/attempt.repository";
import { examClientRepository } from "@/repositories/exam-client.repository";
import { institutionRepository } from "@/repositories/institution.repository";
import { sessionParticipationRepository } from "@/repositories/session-participation.repository";
import { sessionRepository } from "@/repositories/session.repository";
import { examClientService } from "@/services/exam-client.service";

export class MonitorService {
  async getLiveState(): Promise<MonitorLiveState> {
    const institution = await institutionRepository.findDefault();
    const clients = institution
      ? await examClientRepository.findAllForInstitution(institution.id)
      : await examClientRepository.findAll();

    const rows: MonitorClientRow[] = [];

    for (const client of clients) {
      const presence = examClientService.resolvePresence(
        client.lastSeenAt,
        client.activity,
      );
      const status = mapPresenceToMonitorStatus(presence, client.activity);

      let examLabel: string | null = null;
      let questionsAnswered = 0;
      let totalQuestions = 0;
      let timeLeftSeconds: number | null = null;
      let displayName = client.admissionNumber;

      if (client.sessionId && client.admissionNumber) {
        const attempts = await attemptRepository.findBySessionAndAdmission(
          client.sessionId,
          client.admissionNumber,
        );

        const activeAttempt =
          attempts.find((attempt) => attempt.status === "IN_PROGRESS") ??
          attempts.find((attempt) => attempt.id === client.activeAttemptId) ??
          attempts.at(-1);

        if (activeAttempt) {
          examLabel = `${activeAttempt.exam.subject.code} · ${activeAttempt.exam.name}`;
          totalQuestions = activeAttempt.exam._count.questions;

          const fullAttempt = await attemptRepository.findById(activeAttempt.id);
          if (fullAttempt) {
            questionsAnswered = fullAttempt.answers.filter(
              (answer) => answer.selectedOption,
            ).length;
          }
        }

        if (client.sessionId && client.admissionNumber && client.activity === "IN_EXAM") {
          const session = await sessionRepository.findById(client.sessionId);
          const participation =
            await sessionParticipationRepository.findBySessionAndAdmission(
              client.sessionId,
              client.admissionNumber,
            );

          if (session && participation) {
            const endsAt =
              participation.startedAt.getTime() +
              session.durationMinutes * 60 * 1000;
            timeLeftSeconds = Math.max(
              0,
              Math.floor((endsAt - Date.now()) / 1000),
            );
          }
        }
      }

      const progressPct =
        totalQuestions > 0
          ? Math.round((questionsAnswered / totalQuestions) * 100)
          : 0;

      rows.push({
        clientId: client.id,
        ipAddress: client.ipAddress,
        presence,
        activity: client.activity as ClientActivity,
        status,
        admissionNumber: client.admissionNumber,
        displayName,
        examLabel,
        questionsAnswered,
        totalQuestions,
        progressPct,
        timeLeftSeconds,
        lastSeenAt: client.lastSeenAt.toISOString(),
      });
    }

    const summary = {
      online: rows.filter((row) => row.presence === "online").length,
      offline: rows.filter((row) => row.presence !== "online").length,
      inExam: rows.filter(
        (row) => row.presence === "online" && row.activity === "IN_EXAM",
      ).length,
      idle: rows.filter(
        (row) =>
          row.presence === "online" &&
          (row.activity === "IDLE" || row.activity === "INSTRUCTIONS"),
      ).length,
    };

    return {
      clients: rows,
      summary,
      serverTime: new Date().toISOString(),
    };
  }
}

export const monitorService = new MonitorService();

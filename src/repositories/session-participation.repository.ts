import { db } from "@/lib/db";

export class SessionParticipationRepository {
  findBySessionAndAdmission(sessionId: string, admissionNumber: string) {
    return db.sessionParticipation.findUnique({
      where: {
        sessionId_admissionNumber: { sessionId, admissionNumber },
      },
    });
  }

  create(sessionId: string, admissionNumber: string) {
    return db.sessionParticipation.create({
      data: { sessionId, admissionNumber },
    });
  }

  markEnded(sessionId: string, admissionNumber: string) {
    return db.sessionParticipation.update({
      where: {
        sessionId_admissionNumber: { sessionId, admissionNumber },
      },
      data: { endedAt: new Date() },
    });
  }
}

export const sessionParticipationRepository =
  new SessionParticipationRepository();

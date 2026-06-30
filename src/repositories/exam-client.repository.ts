import type { ClientActivity, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export class ExamClientRepository {
  findById(id: string) {
    return db.examClient.findUnique({ where: { id } });
  }

  findAllForInstitution(institutionId: string) {
    return db.examClient.findMany({
      where: { institutionId },
      orderBy: [{ lastSeenAt: "desc" }],
    });
  }

  findAll() {
    return db.examClient.findMany({
      orderBy: [{ lastSeenAt: "desc" }],
    });
  }

  upsert(data: {
    id: string;
    institutionId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    activity: ClientActivity;
    sessionId?: string | null;
    admissionNumber?: string | null;
    activeAttemptId?: string | null;
    lastSeenAt: Date;
  }) {
    const { id, ...rest } = data;

    return db.examClient.upsert({
      where: { id },
      create: { id, ...rest },
      update: rest,
    });
  }

  touchDisconnect(id: string) {
    return db.examClient.update({
      where: { id },
      data: { lastSeenAt: new Date(0) },
    });
  }
}

export class ClientConnectionEventRepository {
  create(data: Prisma.ClientConnectionEventCreateInput) {
    return db.clientConnectionEvent.create({ data });
  }

  findRecentForClient(clientId: string, limit = 50) {
    return db.clientConnectionEvent.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  findRecentForInstitution(institutionId: string, limit = 100) {
    return db.clientConnectionEvent.findMany({
      where: { client: { institutionId } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const examClientRepository = new ExamClientRepository();
export const clientConnectionEventRepository =
  new ClientConnectionEventRepository();

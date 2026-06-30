import type { ClientActivity } from "@prisma/client";
import { CLIENT_OFFLINE_THRESHOLD_SECONDS } from "@/modules/clients/constants";
import { SERVER_CONNECTION_EVENTS } from "@/modules/clients/constants";
import type { ClientPresence, HeartbeatPayload, HeartbeatResult } from "@/modules/clients/types";
import { institutionRepository } from "@/repositories/institution.repository";
import {
  clientConnectionEventRepository,
  examClientRepository,
} from "@/repositories/exam-client.repository";

function computePresence(lastSeenAt: Date): ClientPresence {
  const ageSeconds = (Date.now() - lastSeenAt.getTime()) / 1000;
  return ageSeconds <= CLIENT_OFFLINE_THRESHOLD_SECONDS ? "online" : "offline";
}

export class ExamClientService {
  private async logEvent(input: {
    clientId: string;
    eventType: string;
    ipAddress?: string | null;
    sessionId?: string | null;
    admissionNumber?: string | null;
    detail?: string | null;
  }) {
    await clientConnectionEventRepository.create({
      client: { connect: { id: input.clientId } },
      eventType: input.eventType,
      ipAddress: input.ipAddress ?? undefined,
      sessionId: input.sessionId ?? undefined,
      admissionNumber: input.admissionNumber ?? undefined,
      detail: input.detail ?? undefined,
    });
  }

  async recordHeartbeat(
    payload: HeartbeatPayload,
    meta: { ipAddress: string | null; userAgent: string | null },
  ): Promise<HeartbeatResult> {
    const institution = await institutionRepository.findDefault();
    const existing = await examClientRepository.findById(payload.clientId);
    const now = new Date();

    const wasOffline =
      !existing ||
      computePresence(existing.lastSeenAt) === "offline" ||
      payload.reconnecting;

    let sessionId = existing?.sessionId ?? null;
    let admissionNumber = existing?.admissionNumber ?? null;
    let activeAttemptId = existing?.activeAttemptId ?? null;

    if (payload.studentAuthenticated) {
      if (payload.sessionId !== undefined) {
        sessionId = payload.sessionId ?? null;
      }
      if (payload.admissionNumber !== undefined) {
        admissionNumber = payload.admissionNumber ?? null;
      }
      if (payload.activeAttemptId !== undefined) {
        activeAttemptId = payload.activeAttemptId ?? null;
      }
    } else if (payload.studentAuthenticated === false) {
      sessionId = null;
      admissionNumber = null;
      activeAttemptId = null;
    }

    const client = await examClientRepository.upsert({
      id: payload.clientId,
      institutionId: institution?.id ?? existing?.institutionId ?? null,
      ipAddress: meta.ipAddress ?? existing?.ipAddress ?? null,
      userAgent: meta.userAgent ?? existing?.userAgent ?? null,
      activity: payload.activity,
      sessionId,
      admissionNumber,
      activeAttemptId,
      lastSeenAt: now,
    });

    if (!existing) {
      await this.logEvent({
        clientId: client.id,
        eventType: SERVER_CONNECTION_EVENTS.REGISTERED,
        ipAddress: meta.ipAddress,
        sessionId,
        admissionNumber,
      });
    } else if (wasOffline) {
      await this.logEvent({
        clientId: client.id,
        eventType: SERVER_CONNECTION_EVENTS.RECONNECTED,
        ipAddress: meta.ipAddress,
        sessionId,
        admissionNumber,
      });
    }

    if (existing && existing.activity !== payload.activity) {
      await this.logEvent({
        clientId: client.id,
        eventType: SERVER_CONNECTION_EVENTS.ACTIVITY_CHANGED,
        detail: `${existing.activity} -> ${payload.activity}`,
        sessionId,
        admissionNumber,
      });
    }

    const hadStudent = Boolean(existing?.admissionNumber);
    const hasStudent = Boolean(admissionNumber);

    if (!hadStudent && hasStudent) {
      await this.logEvent({
        clientId: client.id,
        eventType: SERVER_CONNECTION_EVENTS.STUDENT_BOUND,
        admissionNumber,
        sessionId,
      });
    } else if (hadStudent && !hasStudent) {
      await this.logEvent({
        clientId: client.id,
        eventType: SERVER_CONNECTION_EVENTS.STUDENT_CLEARED,
        admissionNumber: existing?.admissionNumber,
        sessionId: existing?.sessionId,
      });
    }

    return {
      clientId: client.id,
      serverTime: now.toISOString(),
      presence: computePresence(client.lastSeenAt),
    };
  }

  async recordDisconnect(
    clientId: string,
    meta: { ipAddress: string | null },
  ) {
    const existing = await examClientRepository.findById(clientId);
    if (!existing) return;

    await examClientRepository.touchDisconnect(clientId);
    await this.logEvent({
      clientId,
      eventType: SERVER_CONNECTION_EVENTS.DISCONNECTED,
      ipAddress: meta.ipAddress,
      sessionId: existing.sessionId,
      admissionNumber: existing.admissionNumber,
    });
  }

  resolvePresence(
    lastSeenAt: Date,
    activity: ClientActivity,
  ): ClientPresence {
    const base = computePresence(lastSeenAt);
    if (base === "offline" && activity === "IN_EXAM") {
      return "disconnected";
    }
    return base;
  }
}

export const examClientService = new ExamClientService();

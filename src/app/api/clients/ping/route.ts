import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { isAppError } from "@/lib/errors";
import { getRequestIp } from "@/lib/request-ip";
import { clientPingSchema } from "@/modules/clients/schemas";
import { getServerInfo } from "@/lib/server-network";
import { examClientService } from "@/services/exam-client.service";

export async function POST(request: Request) {
  try {
    const body = clientPingSchema.parse(await request.json());

    const result = await examClientService.recordHeartbeat(
      {
        clientId: body.client.id,
        activity: body.client.activity,
        reconnecting: body.reconnecting,
        studentAuthenticated: body.student?.authenticated ?? false,
        sessionId: body.student?.sessionId,
        admissionNumber: body.student?.admissionNumber,
        activeAttemptId: body.student?.activeAttemptId,
      },
      {
        ipAddress: getRequestIp(request),
        userAgent: request.headers.get("user-agent"),
      },
    );

    return ok({
      server: { ...getServerInfo(request), time: result.serverTime },
      client: { id: result.clientId, presence: result.presence },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    if (isAppError(error)) {
      return fail(error.message, error.statusCode);
    }
    console.error("POST /api/clients/ping failed:", error);
    return fail("Ping failed", 500);
  }
}


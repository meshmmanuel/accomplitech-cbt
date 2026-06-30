import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { isAppError } from "@/lib/errors";
import { getRequestIp } from "@/lib/request-ip";
import { disconnectSchema } from "@/modules/clients/schemas";
import { examClientService } from "@/services/exam-client.service";

export async function POST(request: Request) {
  try {
    const body = disconnectSchema.parse(await request.json());
    await examClientService.recordDisconnect(body.clientId, {
      ipAddress: getRequestIp(request),
    });

    return ok({ disconnected: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    if (isAppError(error)) {
      return fail(error.message, error.statusCode);
    }
    console.error("POST /api/clients/disconnect failed:", error);
    return fail("Disconnect failed", 500);
  }
}

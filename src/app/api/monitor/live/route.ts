import { ok, fail } from "@/lib/api-response";
import { isAppError } from "@/lib/errors";
import { monitorService } from "@/services/monitor.service";

export async function GET() {
  try {
    const state = await monitorService.getLiveState();
    return ok(state);
  } catch (error) {
    if (isAppError(error)) {
      return fail(error.message, error.statusCode);
    }
    console.error("GET /api/monitor/live failed:", error);
    return fail("Failed to load monitor state", 500);
  }
}

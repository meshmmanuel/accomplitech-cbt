import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { overviewService } from "@/services/overview.service";

export async function GET() {
  try {
    await requireAdminSession();
    const stats = await overviewService.getStats();
    return ok(stats);
  } catch (error) {
    if (isAppError(error)) {
      return fail(error.message, error.statusCode);
    }
    console.error("GET /api/overview/stats failed:", error);
    return fail("Failed to load overview stats", 500);
  }
}

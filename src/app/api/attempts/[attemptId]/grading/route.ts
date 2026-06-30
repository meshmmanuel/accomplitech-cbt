import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { resultsService } from "@/services/results.service";

type RouteContext = { params: Promise<{ attemptId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdminSession();
    const { attemptId } = await context.params;

    const detail = await resultsService.getGradingDetail(attemptId, admin);

    return ok(detail);
  } catch (error) {
    console.error("GET /api/attempts/[attemptId]/grading failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to load grading detail", 500);
  }
}

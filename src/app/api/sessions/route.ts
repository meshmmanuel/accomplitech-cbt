import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { sessionService } from "@/services/session.service";

export async function GET() {
  try {
    await requireAdminSession();
    const sessions = await sessionService.listForDefaultInstitution();
    return ok(sessions);
  } catch (error) {
    console.error("GET /api/sessions failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to fetch sessions", 500);
  }
}

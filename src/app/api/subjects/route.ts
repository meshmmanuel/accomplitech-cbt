import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { subjectService } from "@/services/subject.service";

export async function GET() {
  try {
    await requireAdminSession();
    const subjects = await subjectService.listForDefaultInstitution();
    return ok(subjects);
  } catch (error) {
    console.error("GET /api/subjects failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to fetch subjects", 500);
  }
}

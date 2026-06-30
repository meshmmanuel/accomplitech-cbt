import { ok, fail } from "@/lib/api-response";
import { requireStudentSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { studentSessionService } from "@/services/student-session.service";

type RouteContext = { params: Promise<{ attemptId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const student = await requireStudentSession();
    const { attemptId } = await context.params;

    const attempt = await studentSessionService.getAttemptForStudent(
      attemptId,
      student.sessionId,
      student.admissionNumber,
    );

    return ok(attempt);
  } catch (error) {
    console.error("GET /api/attempts/[attemptId] failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to load exam", 500);
  }
}

import { ok, fail } from "@/lib/api-response";
import { requireStudentSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { studentSessionService } from "@/services/student-session.service";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const student = await requireStudentSession();
    const { sessionId } = await context.params;

    if (student.sessionId !== sessionId) {
      return fail("Session mismatch", 403);
    }

    const result = await studentSessionService.submitAllExams(
      sessionId,
      student.admissionNumber,
    );

    return ok(result);
  } catch (error) {
    console.error("POST /api/sessions/[sessionId]/submit failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to submit session", 500);
  }
}

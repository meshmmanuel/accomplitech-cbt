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

    const hub = await studentSessionService.beginSession(
      sessionId,
      student.admissionNumber,
    );

    return ok(hub);
  } catch (error) {
    console.error("POST /api/sessions/[sessionId]/begin failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to start session", 500);
  }
}

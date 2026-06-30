import { ok, fail } from "@/lib/api-response";
import { requireStudentSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { studentSessionService } from "@/services/student-session.service";

type RouteContext = { params: Promise<{ attemptId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const student = await requireStudentSession();
    const { attemptId } = await context.params;

    const result = await studentSessionService.submitExam(
      attemptId,
      student.sessionId,
      student.admissionNumber,
    );

    return ok(result);
  } catch (error) {
    console.error("POST /api/attempts/[attemptId]/submit failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to submit exam", 500);
  }
}

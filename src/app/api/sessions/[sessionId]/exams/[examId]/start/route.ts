import { ok, fail } from "@/lib/api-response";
import { requireStudentSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { studentSessionService } from "@/services/student-session.service";

type RouteContext = {
  params: Promise<{ sessionId: string; examId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const student = await requireStudentSession();
    const { sessionId, examId } = await context.params;

    if (student.sessionId !== sessionId) {
      return fail("Session mismatch", 403);
    }

    const attempt = await studentSessionService.startExam(
      sessionId,
      examId,
      student.admissionNumber,
    );

    return ok(attempt, 201);
  } catch (error) {
    console.error(
      "POST /api/sessions/[sessionId]/exams/[examId]/start failed:",
      error,
    );
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to start exam", 500);
  }
}

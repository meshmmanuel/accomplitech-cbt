import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireStudentSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { batchSaveAnswersSchema } from "@/modules/student-exam/schemas";
import { studentSessionService } from "@/services/student-session.service";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const student = await requireStudentSession();
    const { sessionId } = await context.params;

    if (student.sessionId !== sessionId) {
      return fail("Session mismatch", 403);
    }

    const body = batchSaveAnswersSchema.parse(await request.json());
    const result = await studentSessionService.saveAnswersBatch({
      sessionId,
      admissionNumber: student.admissionNumber,
      saves: body.saves,
    });

    return ok(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("POST /api/sessions/[sessionId]/answers/batch failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to save answers", 500);
  }
}

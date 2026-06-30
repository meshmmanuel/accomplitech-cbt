import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireStudentSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { saveAnswerSchema } from "@/modules/student-exam/schemas";
import { studentSessionService } from "@/services/student-session.service";

type RouteContext = { params: Promise<{ attemptId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const student = await requireStudentSession();
    const { attemptId } = await context.params;
    const body = saveAnswerSchema.parse(await request.json());

    const result = await studentSessionService.saveAnswer({
      attemptId,
      sessionId: student.sessionId,
      admissionNumber: student.admissionNumber,
      questionId: body.questionId,
      selectedOption: body.selectedOption,
      flaggedForReview: body.flaggedForReview,
    });

    return ok(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("PATCH /api/attempts/[attemptId]/answers failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to save answer", 500);
  }
}

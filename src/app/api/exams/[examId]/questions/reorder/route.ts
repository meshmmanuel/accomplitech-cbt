import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { reorderQuestionSchema } from "@/modules/questions";
import { questionService } from "@/services/question.service";

type RouteContext = { params: Promise<{ examId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { examId } = await context.params;
    const body = reorderQuestionSchema.parse(await request.json());
    const questions = await questionService.reorder(examId, body);
    return ok(questions);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("PATCH /api/exams/[examId]/questions/reorder failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to reorder questions", 500);
  }
}

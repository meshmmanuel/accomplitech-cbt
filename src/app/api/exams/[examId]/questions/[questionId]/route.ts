import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { createQuestionInputSchema } from "@/modules/questions";
import { questionService } from "@/services/question.service";

type RouteContext = {
  params: Promise<{ examId: string; questionId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { questionId } = await context.params;
    const body = createQuestionInputSchema.parse(await request.json());
    const question = await questionService.update(questionId, body);
    return ok(question);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error(
      "PATCH /api/exams/[examId]/questions/[questionId] failed:",
      error,
    );
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to update question", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { questionId } = await context.params;
    await questionService.delete(questionId);
    return ok({ deleted: true });
  } catch (error) {
    console.error(
      "DELETE /api/exams/[examId]/questions/[questionId] failed:",
      error,
    );
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to delete question", 500);
  }
}

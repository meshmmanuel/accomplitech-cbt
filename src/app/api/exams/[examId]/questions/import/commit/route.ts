import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { commitImportSchema } from "@/modules/questions/commit-schema";
import { questionService } from "@/services/question.service";

type RouteContext = { params: Promise<{ examId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { examId } = await context.params;
    const body = commitImportSchema.parse(await request.json());

    const result = await questionService.importCanonicalQuestions(
      examId,
      body.questions,
      body.mode,
      body.stagingId,
    );

    return ok(result, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("POST /api/exams/[examId]/questions/import/commit failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to save imported questions", 500);
  }
}

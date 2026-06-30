import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { createQuestionInputSchema } from "@/modules/questions";
import { questionService } from "@/services/question.service";

type RouteContext = { params: Promise<{ examId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { examId } = await context.params;
    const questions = await questionService.listByExam(examId);
    return ok(questions);
  } catch (error) {
    console.error("GET /api/exams/[examId]/questions failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to fetch questions", 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { examId } = await context.params;
    const body = createQuestionInputSchema.parse(await request.json());
    const question = await questionService.create(examId, body);
    return ok(question, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("POST /api/exams/[examId]/questions failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to create question", 500);
  }
}

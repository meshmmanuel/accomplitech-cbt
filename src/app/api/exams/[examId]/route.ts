import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { updateExamSchema } from "@/modules/exams";
import { examService } from "@/services/exam.service";

type RouteContext = { params: Promise<{ examId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdminSession();
    const { examId } = await context.params;
    await examService.requireAccess(admin, examId);
    const exam = await examService.getDetail(examId);
    if (!exam) return fail("Exam not found", 404);
    return ok(exam);
  } catch (error) {
    console.error("GET /api/exams/[examId] failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to fetch exam", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdminSession();
    const { examId } = await context.params;
    await examService.requireAccess(admin, examId);
    const body = updateExamSchema.parse(await request.json());
    const exam = await examService.update(examId, body);
    return ok(exam);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("PATCH /api/exams/[examId] failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to update exam", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdminSession();
    const { examId } = await context.params;
    await examService.requireAccess(admin, examId);
    await examService.delete(examId);
    return ok({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/exams/[examId] failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to delete exam", 500);
  }
}

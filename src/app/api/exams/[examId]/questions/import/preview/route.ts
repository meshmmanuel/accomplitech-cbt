import { ok, fail } from "@/lib/api-response";
import { requireExamAdminAccess } from "@/lib/exam-route-auth";
import { isAppError } from "@/lib/errors";
import { examRepository } from "@/repositories/exam.repository";
import { questionService } from "@/services/question.service";

type RouteContext = { params: Promise<{ examId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { examId } = await context.params;
    await requireExamAdminAccess(examId);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return fail("CSV file is required", 400);
    }

    const exam = await examRepository.findById(examId);
    if (!exam) return fail("Exam not found", 404);

    const csvText = await file.text();
    const preview = questionService.previewImport(exam.type, csvText);

    return ok(preview, preview.valid ? 200 : 422);
  } catch (error) {
    console.error(
      "POST /api/exams/[examId]/questions/import/preview failed:",
      error,
    );
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to preview import", 500);
  }
}

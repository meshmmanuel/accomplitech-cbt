import { ok, fail } from "@/lib/api-response";
import { requireExamAdminAccess } from "@/lib/exam-route-auth";
import { isAppError } from "@/lib/errors";
import { importModeSchema } from "@/modules/questions";
import { examRepository } from "@/repositories/exam.repository";
import { questionService } from "@/services/question.service";

type RouteContext = { params: Promise<{ examId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { examId } = await context.params;
    await requireExamAdminAccess(examId);
    const formData = await request.formData();
    const file = formData.get("file");
    const mode = importModeSchema.parse(formData.get("mode") ?? "append");

    if (!(file instanceof File)) {
      return fail("CSV file is required", 400);
    }

    const csvText = await file.text();
    const exam = await examRepository.findById(examId);
    if (!exam) return fail("Exam not found", 404);

    const preview = questionService.previewImport(exam.type, csvText);
    if (!preview.valid) {
      return ok(
        {
          valid: false,
          errors: preview.errors,
          summary: preview.summary,
          questions: preview.questions,
        },
        422,
      );
    }

    const result = await questionService.importFromCsv(examId, csvText, mode);
    return ok({ valid: true, ...result });
  } catch (error) {
    console.error("POST /api/exams/[examId]/questions/import failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to import questions", 500);
  }
}

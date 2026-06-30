import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { examRepository } from "@/repositories/exam.repository";
import { questionImportService } from "@/services/question-import.service";

type RouteContext = { params: Promise<{ examId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { examId } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return fail("Word document (.docx) is required", 400);
    }

    if (!file.name.toLowerCase().endsWith(".docx")) {
      return fail("Only .docx Word documents are supported", 400);
    }

    const exam = await examRepository.findById(examId);
    if (!exam) return fail("Exam not found", 404);

    const buffer = Buffer.from(await file.arrayBuffer());
    const preview = await questionImportService.processWordDocument(
      examId,
      exam.type,
      buffer,
    );

    return ok(preview, preview.valid ? 200 : 422);
  } catch (error) {
    console.error("POST /api/exams/[examId]/questions/import/word failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to process Word document", 500);
  }
}

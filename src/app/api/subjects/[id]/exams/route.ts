import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { createExamSchema } from "@/modules/exams";
import { examService } from "@/services/exam.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdminSession();
    const { id: subjectId } = await context.params;
    const body = createExamSchema.parse(await request.json());
    const exam = await examService.create(subjectId, body, admin);
    return ok(exam, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("POST /api/subjects/[id]/exams failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to create exam", 500);
  }
}

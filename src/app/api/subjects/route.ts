import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { createSubjectSchema } from "@/modules/subjects";
import { subjectService } from "@/services/subject.service";

export async function GET() {
  try {
    const admin = await requireAdminSession();
    const subjects = await subjectService.listForAdmin(admin);
    return ok(subjects);
  } catch (error) {
    console.error("GET /api/subjects failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to fetch subjects", 500);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession();
    const body = createSubjectSchema.parse(await request.json());
    const subject = await subjectService.create(body, admin);
    return ok(subject, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("POST /api/subjects failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to create subject", 500);
  }
}

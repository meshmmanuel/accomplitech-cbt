import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { updateSubjectSchema } from "@/modules/subjects";
import { subjectService } from "@/services/subject.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdminSession();
    const { id } = await context.params;
    const subject = await subjectService.getByIdForAdmin(id, admin);
    if (!subject) return fail("Subject not found", 404);
    return ok(subject);
  } catch (error) {
    console.error("GET /api/subjects/[id] failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to fetch subject", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdminSession();
    const { id } = await context.params;
    const body = updateSubjectSchema.parse(await request.json());
    const subject = await subjectService.update(id, body, admin);
    return ok(subject);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("PATCH /api/subjects/[id] failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to update subject", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdminSession();
    const { id } = await context.params;
    await subjectService.delete(id, admin);
    return ok({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/subjects/[id] failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to delete subject", 500);
  }
}

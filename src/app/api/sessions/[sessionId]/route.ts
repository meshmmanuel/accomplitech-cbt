import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { updateSessionSchema } from "@/modules/sessions";
import { sessionService } from "@/services/session.service";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { sessionId } = await context.params;
    const session = await sessionService.getDetail(sessionId);
    if (!session) return fail("Session not found", 404);
    return ok(session);
  } catch (error) {
    console.error("GET /api/sessions/[sessionId] failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to fetch session", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { sessionId } = await context.params;
    const body = updateSessionSchema.parse(await request.json());
    const session = await sessionService.update(sessionId, body);
    return ok(session);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("PATCH /api/sessions/[sessionId] failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to update session", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { sessionId } = await context.params;
    await sessionService.delete(sessionId);
    return ok({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/sessions/[sessionId] failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to delete session", 500);
  }
}

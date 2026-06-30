import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { releaseSessionExamSchema } from "@/modules/sessions";
import { sessionService } from "@/services/session.service";

type RouteContext = {
  params: Promise<{ sessionId: string; examId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { sessionId, examId } = await context.params;
    const body = releaseSessionExamSchema.parse(await request.json());
    const session = await sessionService.setExamRelease(
      sessionId,
      examId,
      body.isReleased,
    );
    return ok(session);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error(
      "PATCH /api/sessions/[sessionId]/exams/[examId]/release failed:",
      error,
    );
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to update exam release", 500);
  }
}

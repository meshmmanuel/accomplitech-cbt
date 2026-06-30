import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireGraderSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { gradeTheorySchema } from "@/modules/grading";
import { resultsService } from "@/services/results.service";

type RouteContext = { params: Promise<{ attemptId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireGraderSession();
    const { attemptId } = await context.params;
    const body = gradeTheorySchema.parse(await request.json());

    const result = await resultsService.gradeTheory({
      attemptId,
      admin,
      marks: body.marks,
    });

    return ok(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("PATCH /api/attempts/[attemptId]/grade failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to save theory grades", 500);
  }
}

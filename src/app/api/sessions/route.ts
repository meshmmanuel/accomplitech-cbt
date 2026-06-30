import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { createSessionSchema } from "@/modules/sessions";
import { sessionService } from "@/services/session.service";

export async function GET() {
  try {
    await requireAdminSession();
    const sessions = await sessionService.listForDefaultInstitution();
    return ok(sessions);
  } catch (error) {
    console.error("GET /api/sessions failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to fetch sessions", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = createSessionSchema.parse(await request.json());
    const session = await sessionService.create(body);
    return ok(session, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("POST /api/sessions failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to create session", 500);
  }
}

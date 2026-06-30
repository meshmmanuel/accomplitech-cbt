import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireUserManagerSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { updateUserSchema } from "@/modules/users";
import { userService } from "@/services/user.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireUserManagerSession();
    const { id } = await context.params;
    const body = updateUserSchema.parse(await request.json());
    const user = await userService.update(id, body, admin);
    return ok(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("PATCH /api/users/[id] failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to update user", 500);
  }
}

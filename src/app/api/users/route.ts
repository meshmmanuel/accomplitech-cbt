import { ZodError } from "zod";
import { ok, fail } from "@/lib/api-response";
import { requireUserManagerSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";
import { createUserSchema } from "@/modules/users";
import { userService } from "@/services/user.service";

export async function GET() {
  try {
    const admin = await requireUserManagerSession();
    const users = await userService.listForInstitution(admin.institutionId);
    return ok(users);
  } catch (error) {
    console.error("GET /api/users failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to fetch users", 500);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireUserManagerSession();
    const body = createUserSchema.parse(await request.json());
    const user = await userService.create(body, admin);
    return ok(user, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    console.error("POST /api/users failed:", error);
    if (isAppError(error)) return fail(error.message, error.statusCode);
    return fail("Failed to create user", 500);
  }
}

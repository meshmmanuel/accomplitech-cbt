import { ZodError } from "zod";
import { setAdminAuthCookies } from "@/lib/auth-cookies";
import { ok, fail } from "@/lib/api-response";
import { isAppError } from "@/lib/errors";
import { adminLoginSchema } from "@/modules/auth/schemas";
import { authService } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = adminLoginSchema.parse(await request.json());
    const result = await authService.loginAdmin(body.email, body.password);

    await setAdminAuthCookies(result.accessToken, result.refreshToken);

    return ok({
      user: result.user,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    if (isAppError(error)) {
      return fail(error.message, error.statusCode);
    }
    console.error("POST /api/auth/admin/login failed:", error);
    return fail("Login failed", 500);
  }
}

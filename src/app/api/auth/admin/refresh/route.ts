import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth-config";
import { setAdminAuthCookies } from "@/lib/auth-cookies";
import { ok, fail } from "@/lib/api-response";
import { isAppError } from "@/lib/errors";
import { authService } from "@/services/auth.service";

export async function POST() {
  try {
    const jar = await cookies();
    const refreshToken = jar.get(AUTH_COOKIE.adminRefresh)?.value;

    if (!refreshToken) {
      return fail("Refresh token not found", 401);
    }

    const result = await authService.refreshAdmin(refreshToken);
    await setAdminAuthCookies(result.accessToken, refreshToken);

    return ok({ expiresIn: result.expiresIn });
  } catch (error) {
    if (isAppError(error)) {
      return fail(error.message, error.statusCode);
    }
    console.error("POST /api/auth/admin/refresh failed:", error);
    return fail("Token refresh failed", 500);
  }
}

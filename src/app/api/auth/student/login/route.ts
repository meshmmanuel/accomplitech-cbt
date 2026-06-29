import { ZodError } from "zod";
import { setStudentAuthCookie } from "@/lib/auth-cookies";
import { ok, fail } from "@/lib/api-response";
import { isAppError } from "@/lib/errors";
import { studentLoginSchema } from "@/modules/auth/schemas";
import { authService } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = studentLoginSchema.parse(await request.json());
    const result = await authService.loginStudent(
      body.admissionNumber,
      body.examCode,
    );

    await setStudentAuthCookie(result.accessToken);

    return ok({
      admissionNumber: result.admissionNumber,
      session: result.session,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues[0]?.message ?? "Invalid request", 400);
    }
    if (isAppError(error)) {
      return fail(error.message, error.statusCode);
    }
    console.error("POST /api/auth/student/login failed:", error);
    return fail("Login failed", 500);
  }
}

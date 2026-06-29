import { getAuthSession } from "@/lib/auth-server";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return fail("Not authenticated", 401);
  }

  return ok(session);
}

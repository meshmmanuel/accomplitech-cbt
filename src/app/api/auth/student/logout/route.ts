import { clearStudentAuthCookie } from "@/lib/auth-cookies";
import { ok } from "@/lib/api-response";

export async function POST() {
  await clearStudentAuthCookie();
  return ok({ loggedOut: true });
}

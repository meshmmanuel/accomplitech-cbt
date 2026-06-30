import { ok } from "@/lib/api-response";
import { getServerInfo } from "@/lib/server-network";

export async function GET(request: Request) {
  return ok(getServerInfo(request));
}

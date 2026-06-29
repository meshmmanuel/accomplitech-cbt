import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { overviewService } from "@/services/overview.service";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    const stats = await overviewService.getStats();

    return ok({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      stats,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return fail("Database connection failed", 503);
  }
}

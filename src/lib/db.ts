import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

function createAdapter() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";

  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    throw new Error(
      "PostgreSQL adapter not configured. Set provider to postgresql in schema.prisma and install @prisma/adapter-pg.",
    );
  }

  return new PrismaBetterSqlite3({ url });
}

export function createPrismaClient() {
  return new PrismaClient({
    adapter: createAdapter(),
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

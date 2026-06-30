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

function isPrismaClientReady(client: PrismaClient) {
  return Boolean(client.examClient && client.clientConnectionEvent);
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  if (cached && isPrismaClientReady(cached)) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }

  const client = createPrismaClient();
  if (!isPrismaClientReady(client)) {
    throw new Error(
      "Prisma client is missing ExamClient models. Run `npx prisma generate` and restart the dev server.",
    );
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});

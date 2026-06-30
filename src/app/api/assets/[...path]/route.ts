import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getAuthSession, requireStudentSession } from "@/lib/auth-server";
import { isAppError } from "@/lib/errors";

type RouteContext = { params: Promise<{ path: string[] }> };

const STORAGE_ROOT = path.join(process.cwd(), "storage");

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    if (!session) {
      await requireStudentSession();
    }
    const segments = (await context.params).path;
    const relativePath = segments.join("/");

    if (
      relativePath.includes("..") ||
      (!relativePath.startsWith("import-staging/") &&
        !relativePath.startsWith("question-assets/"))
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const absolutePath = path.join(STORAGE_ROOT, relativePath);
    if (!absolutePath.startsWith(STORAGE_ROOT)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const buffer = await readFile(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }
}

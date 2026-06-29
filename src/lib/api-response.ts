import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data } satisfies ApiResponse<T>, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json(
    { error: message, message } satisfies ApiResponse<never>,
    { status },
  );
}

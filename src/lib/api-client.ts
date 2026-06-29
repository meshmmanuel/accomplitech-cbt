import type { ApiResponse } from "@/types";

type ApiResult<T> = ApiResponse<T> & { status: number };

async function parseResponse<T>(response: Response): Promise<ApiResult<T>> {
  const body = (await response.json()) as ApiResponse<T>;
  return { ...body, status: response.status };
}

export async function apiPost<T>(url: string, data: unknown): Promise<ApiResult<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return parseResponse<T>(response);
}

export async function apiGet<T>(url: string): Promise<ApiResult<T>> {
  const response = await fetch(url, { credentials: "include" });
  return parseResponse<T>(response);
}

export async function apiPatch<T>(url: string, data: unknown): Promise<ApiResult<T>> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return parseResponse<T>(response);
}

export async function apiDelete<T>(url: string): Promise<ApiResult<T>> {
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return parseResponse<T>(response);
}

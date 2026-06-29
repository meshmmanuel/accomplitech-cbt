import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { AUTH_COOKIE, AUTH_TTL } from "@/lib/auth-config";

const baseCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function setAdminAuthCookies(
  accessToken: string,
  refreshToken: string,
) {
  const jar = await cookies();
  jar.set(AUTH_COOKIE.adminAccess, accessToken, {
    ...baseCookieOptions,
    maxAge: AUTH_TTL.adminAccessSeconds,
  });
  jar.set(AUTH_COOKIE.adminRefresh, refreshToken, {
    ...baseCookieOptions,
    maxAge: AUTH_TTL.adminRefreshSeconds,
  });
}

export async function setStudentAuthCookie(accessToken: string) {
  const jar = await cookies();
  jar.set(AUTH_COOKIE.studentAccess, accessToken, {
    ...baseCookieOptions,
    maxAge: AUTH_TTL.studentAccessSeconds,
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE.adminAccess);
  jar.delete(AUTH_COOKIE.adminRefresh);
  jar.delete(AUTH_COOKIE.studentAccess);
}

export async function getAdminAccessToken() {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE.adminAccess)?.value;
}

export async function getAdminRefreshToken() {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE.adminRefresh)?.value;
}

export async function getStudentAccessToken() {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE.studentAccess)?.value;
}

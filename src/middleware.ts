import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/auth-config";

const ADMIN_API_PREFIXES = ["/api/subjects", "/api/exams"];

function isStudentSessionApi(pathname: string) {
  return (
    /^\/api\/sessions\/[^/]+\/(begin|hub|submit)$/.test(pathname) ||
    /^\/api\/sessions\/[^/]+\/answers\/batch$/.test(pathname) ||
    /^\/api\/sessions\/[^/]+\/exams\/[^/]+\/start$/.test(pathname)
  );
}

function isAdminSessionsApi(pathname: string) {
  return pathname === "/api/sessions" || pathname.startsWith("/api/sessions/");
}

function unauthorizedJson() {
  return NextResponse.json(
    { error: "Authentication required", message: "Authentication required" },
    { status: 401 },
  );
}

async function verifyAdminToken(token: string | undefined) {
  if (!token) return false;
  try {
    await verifyAccessToken(token, "admin");
    return true;
  } catch {
    return false;
  }
}

async function verifyStudentToken(token: string | undefined) {
  if (!token) return false;
  try {
    await verifyAccessToken(token, "student");
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const adminToken = request.cookies.get(AUTH_COOKIE.adminAccess)?.value;
    const isAuthed = await verifyAdminToken(adminToken);

    if (isLoginPage) {
      if (isAuthed) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!isAuthed) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/api/assets")) {
    const adminToken = request.cookies.get(AUTH_COOKIE.adminAccess)?.value;
    const studentToken = request.cookies.get(AUTH_COOKIE.studentAccess)?.value;
    const allowed =
      (await verifyAdminToken(adminToken)) ||
      (await verifyStudentToken(studentToken));
    if (!allowed) {
      return unauthorizedJson();
    }
    return NextResponse.next();
  }

  if (isStudentSessionApi(pathname)) {
    const studentToken = request.cookies.get(AUTH_COOKIE.studentAccess)?.value;
    if (!(await verifyStudentToken(studentToken))) {
      return unauthorizedJson();
    }
    return NextResponse.next();
  }

  if (
    ADMIN_API_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    isAdminSessionsApi(pathname) ||
    pathname.startsWith("/api/monitor") ||
    pathname.startsWith("/api/overview") ||
    pathname.startsWith("/api/users")
  ) {
    const adminToken = request.cookies.get(AUTH_COOKIE.adminAccess)?.value;
    if (!(await verifyAdminToken(adminToken))) {
      return unauthorizedJson();
    }
    return NextResponse.next();
  }

  const isProtectedExamPage =
    pathname.startsWith("/exam/") && pathname !== "/exam/demo";

  if (pathname.startsWith("/session/") || isProtectedExamPage) {
    const studentToken = request.cookies.get(AUTH_COOKIE.studentAccess)?.value;
    if (!(await verifyStudentToken(studentToken))) {
      return NextResponse.redirect(new URL("/student/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/subjects/:path*",
    "/api/sessions/:path*",
    "/api/exams/:path*",
    "/api/monitor/:path*",
    "/api/overview/:path*",
    "/api/users/:path*",
    "/api/assets/:path*",
    "/session/:path*",
    "/exam/:path*",
  ],
};

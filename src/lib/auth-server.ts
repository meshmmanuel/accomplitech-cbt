import { redirect } from "next/navigation";
import { AppError } from "@/lib/errors";
import {
  getAdminAccessToken,
  getStudentAccessToken,
} from "@/lib/auth-cookies";
import { verifyAccessToken } from "@/lib/auth";
import type {
  AdminAuthUser,
  AuthSession,
  StudentTokenPayload,
} from "@/modules/auth/types";

export async function getAuthSession(): Promise<AuthSession | null> {
  const [adminToken, studentToken] = await Promise.all([
    getAdminAccessToken(),
    getStudentAccessToken(),
  ]);

  if (adminToken) {
    const payload = await verifyAccessToken(adminToken, "admin");
    if (payload.kind !== "admin") {
      return null;
    }
    return {
      kind: "admin",
      admin: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        institutionId: payload.institutionId,
      },
    };
  }

  if (studentToken) {
    const payload = await verifyAccessToken(studentToken, "student");
    if (payload.kind !== "student") {
      return null;
    }
    const { kind: _, sub: __, ...student } = payload;
    return {
      kind: "student",
      student,
    };
  }

  return null;
}

export async function requireAdminSession(): Promise<AdminAuthUser> {
  const adminToken = await getAdminAccessToken();
  if (!adminToken) {
    throw new AppError("Authentication required", 401);
  }

  const payload = await verifyAccessToken(adminToken, "admin");
  if (payload.kind !== "admin") {
    throw new AppError("Authentication required", 401);
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    institutionId: payload.institutionId,
  };
}

export async function requireStudentSession(): Promise<
  Omit<StudentTokenPayload, "kind" | "sub">
> {
  const studentToken = await getStudentAccessToken();
  if (!studentToken) {
    throw new AppError("Authentication required", 401);
  }

  const payload = await verifyAccessToken(studentToken, "student");
  if (payload.kind !== "student") {
    throw new AppError("Authentication required", 401);
  }

  const { kind: _, sub: __, ...student } = payload;
  return student;
}

export async function getAdminSessionOrRedirect(): Promise<AdminAuthUser> {
  try {
    return await requireAdminSession();
  } catch {
    redirect("/admin/login");
  }
}

export async function getStudentSessionOrRedirect(): Promise<
  Omit<StudentTokenPayload, "kind" | "sub">
> {
  try {
    return await requireStudentSession();
  } catch {
    redirect("/student/login");
  }
}

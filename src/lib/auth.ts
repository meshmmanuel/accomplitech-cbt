import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { AppError } from "@/lib/errors";
import {
  AUTH_TTL,
  getJwtSecret,
} from "@/lib/auth-config";
import type {
  AccessTokenPayload,
  AdminTokenPayload,
  StudentTokenPayload,
} from "@/modules/auth/types";

function assertPayload(
  payload: JWTPayload,
  kind: AccessTokenPayload["kind"],
): AccessTokenPayload {
  if (payload.kind !== kind) {
    throw new AppError("Invalid token type", 401);
  }

  if (kind === "admin") {
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.institutionId !== "string"
    ) {
      throw new AppError("Invalid admin token", 401);
    }

    return {
      kind: "admin",
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role as AdminTokenPayload["role"],
      institutionId: payload.institutionId,
    };
  }

  if (
    typeof payload.sub !== "string" ||
    typeof payload.admissionNumber !== "string" ||
    typeof payload.sessionId !== "string" ||
    typeof payload.sessionName !== "string" ||
    typeof payload.examCode !== "string"
  ) {
    throw new AppError("Invalid student token", 401);
  }

  return {
    kind: "student",
    sub: payload.sub,
    admissionNumber: payload.admissionNumber,
    sessionId: payload.sessionId,
    sessionName: payload.sessionName,
    examCode: payload.examCode,
  };
}

export async function signAdminAccessToken(payload: AdminTokenPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_TTL.adminAccessSeconds}s`)
    .sign(getJwtSecret());
}

export async function signAdminRefreshToken(payload: AdminTokenPayload) {
  return new SignJWT({ ...payload, tokenUse: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_TTL.adminRefreshSeconds}s`)
    .sign(getJwtSecret());
}

export async function signStudentAccessToken(payload: StudentTokenPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_TTL.studentAccessSeconds}s`)
    .sign(getJwtSecret());
}

export async function verifyAccessToken(token: string, kind?: AccessTokenPayload["kind"]) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const parsed = assertPayload(payload, kind ?? (payload.kind as AccessTokenPayload["kind"]));

    if (kind && parsed.kind !== kind) {
      throw new AppError("Invalid token type", 401);
    }

    return parsed;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Invalid or expired token", 401);
  }
}

export async function verifyAdminRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (payload.kind !== "admin" || payload.tokenUse !== "refresh") {
      throw new AppError("Invalid refresh token", 401);
    }

    return assertPayload(payload, "admin");
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Invalid or expired refresh token", 401);
  }
}

export function buildStudentSubject(sessionId: string, admissionNumber: string) {
  return `${sessionId}:${admissionNumber}`;
}

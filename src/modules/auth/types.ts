import type { UserRole } from "@prisma/client";

export type AuthKind = "admin" | "student";

export interface AdminAuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId: string;
}

export interface AdminTokenPayload {
  kind: "admin";
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId: string;
}

export interface StudentTokenPayload {
  kind: "student";
  sub: string;
  admissionNumber: string;
  sessionId: string;
  sessionName: string;
  examCode: string;
}

export type AccessTokenPayload = AdminTokenPayload | StudentTokenPayload;

export interface AdminLoginResult {
  user: AdminAuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface StudentLoginResult {
  admissionNumber: string;
  session: {
    id: string;
    name: string;
    examCode: string;
    status: string;
    instructions: string | null;
    durationMinutes: number;
    exams: Array<{
      id: string;
      name: string;
      type: string;
      durationMinutes: number;
      subjectCode: string;
      subjectName: string;
    }>;
  };
  accessToken: string;
  expiresIn: number;
}

export interface AuthSession {
  kind: AuthKind;
  admin?: AdminAuthUser;
  student?: Omit<StudentTokenPayload, "kind" | "sub">;
}

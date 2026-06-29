import bcrypt from "bcryptjs";
import { AUTH_TTL } from "@/lib/auth-config";
import {
  buildStudentSubject,
  signAdminAccessToken,
  signAdminRefreshToken,
  signStudentAccessToken,
} from "@/lib/auth";
import { AppError } from "@/lib/errors";
import type {
  AdminLoginResult,
  AdminTokenPayload,
  StudentLoginResult,
} from "@/modules/auth/types";
import { userRepository } from "@/repositories/user.repository";
import { sessionService } from "@/services/session.service";

export class AuthService {
  async loginAdmin(email: string, password: string): Promise<AdminLoginResult> {
    const user = await userRepository.findByEmail(email.trim().toLowerCase());

    if (!user || user.status !== "ACTIVE") {
      throw new AppError("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid email or password", 401);
    }

    const tokenPayload: AdminTokenPayload = {
      kind: "admin",
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      institutionId: user.institutionId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      signAdminAccessToken(tokenPayload),
      signAdminRefreshToken(tokenPayload),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
      },
      accessToken,
      refreshToken,
      expiresIn: AUTH_TTL.adminAccessSeconds,
    };
  }

  async loginStudent(
    admissionNumber: string,
    examCode: string,
  ): Promise<StudentLoginResult> {
    const normalizedAdmission = admissionNumber.trim().toUpperCase();
    const normalizedCode = examCode.trim().toUpperCase();

    if (!normalizedAdmission) {
      throw new AppError("Admission number is required", 400);
    }

    const session = await sessionService.getOpenSessionByCode(normalizedCode);

    const accessToken = await signStudentAccessToken({
      kind: "student",
      sub: buildStudentSubject(session.id, normalizedAdmission),
      admissionNumber: normalizedAdmission,
      sessionId: session.id,
      sessionName: session.name,
      examCode: session.examCode,
    });

    return {
      admissionNumber: normalizedAdmission,
      session: {
        id: session.id,
        name: session.name,
        examCode: session.examCode,
        status: session.status,
        instructions: session.instructions,
        durationMinutes: session.durationMinutes,
        exams: session.sessionExams.map(({ exam }) => ({
          id: exam.id,
          name: exam.name,
          type: exam.type,
          durationMinutes: exam.durationMinutes,
          subjectCode: exam.subject.code,
          subjectName: exam.subject.name,
        })),
      },
      accessToken,
      expiresIn: AUTH_TTL.studentAccessSeconds,
    };
  }

  async refreshAdmin(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    const { verifyAdminRefreshToken, signAdminAccessToken } = await import(
      "@/lib/auth"
    );
    const payload = await verifyAdminRefreshToken(refreshToken);

    const user = await userRepository.findById(payload.sub);
    if (!user || user.status !== "ACTIVE") {
      throw new AppError("Account is no longer active", 401);
    }

    const accessToken = await signAdminAccessToken({
      kind: "admin",
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      institutionId: user.institutionId,
    });

    return {
      accessToken,
      expiresIn: AUTH_TTL.adminAccessSeconds,
    };
  }
}

export const authService = new AuthService();

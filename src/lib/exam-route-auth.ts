import { requireAdminSession } from "@/lib/auth-server";
import { examService } from "@/services/exam.service";

export async function requireExamAdminAccess(examId: string) {
  const admin = await requireAdminSession();
  await examService.requireAccess(admin, examId);
  return admin;
}

import { redirect } from "next/navigation";

export default async function ExamAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId: _attemptId } = await params;
  const { getStudentSessionOrRedirect } = await import("@/lib/auth-server");
  const student = await getStudentSessionOrRedirect();

  redirect(`/session/${student.sessionId}/workspace`);
}

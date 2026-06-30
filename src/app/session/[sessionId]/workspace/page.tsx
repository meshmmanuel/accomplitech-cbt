import { SessionWorkspace } from "@/components/student/session-workspace";
import { getStudentSessionOrRedirect } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function SessionWorkspacePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const student = await getStudentSessionOrRedirect();

  if (student.sessionId !== sessionId) {
    redirect("/student/login");
  }

  return <SessionWorkspace sessionId={sessionId} />;
}

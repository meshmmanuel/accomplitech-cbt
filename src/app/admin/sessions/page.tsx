import { SessionsPanel } from "@/components/admin/sessions-panel";
import { getAdminSessionOrRedirect } from "@/lib/auth-server";
import { sessionService } from "@/services/session.service";
import { AlertCircle } from "lucide-react";

export default async function AdminSessionsPage() {
  await getAdminSessionOrRedirect();

  try {
    const [sessions, exams] = await Promise.all([
      sessionService.listForDefaultInstitution(),
      sessionService.listExamsForPicker(),
    ]);

    return <SessionsPanel sessions={sessions} exams={exams} />;
  } catch (error) {
    console.error("Admin sessions page failed:", error);
    return (
      <div className="flex min-h-60 flex-col items-center justify-center rounded-[13px] border border-exam-border bg-exam-white p-8 text-center">
        <AlertCircle size={28} className="mb-3 text-exam-red" />
        <p className="mb-1 text-[15px] font-bold text-exam-text">
          Failed to load sessions
        </p>
        <p className="text-sm text-exam-muted">
          Check your database connection and try again.
        </p>
      </div>
    );
  }
}

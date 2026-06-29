import { SubjectsPanel } from "@/components/admin/subjects-panel";
import { getAdminSessionOrRedirect } from "@/lib/auth-server";
import { subjectService } from "@/services/subject.service";
import { AlertCircle } from "lucide-react";

export default async function AdminSubjectsPage() {
  await getAdminSessionOrRedirect();

  try {
    const subjects = await subjectService.listForDefaultInstitution();
    return <SubjectsPanel subjects={subjects} />;
  } catch (error) {
    console.error("Admin subjects page failed:", error);
    return (
      <div className="flex min-h-60 flex-col items-center justify-center rounded-[13px] border border-exam-border bg-exam-white p-8 text-center">
        <AlertCircle size={28} className="mb-3 text-exam-red" />
        <p className="mb-1 text-[15px] font-bold text-exam-text">
          Failed to load subjects
        </p>
        <p className="text-sm text-exam-muted">
          Check your database connection and try again.
        </p>
      </div>
    );
  }
}

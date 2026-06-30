import { getAdminSessionOrRedirect } from "@/lib/auth-server";
import { resultsService } from "@/services/results.service";
import { ResultsPanel } from "@/components/admin/results-panel";
import { canGradeTheory } from "@/lib/admin-roles";
import { AlertCircle } from "lucide-react";

export default async function AdminResultsPage() {
  const admin = await getAdminSessionOrRedirect();

  try {
    const items = await resultsService.listForAdmin(admin);
    return <ResultsPanel items={items} canGrade={canGradeTheory(admin.role)} />;
  } catch (error) {
    console.error("Admin results page failed:", error);
    return (
      <div className="flex min-h-60 flex-col items-center justify-center rounded-[13px] border border-exam-border bg-exam-white p-8 text-center">
        <AlertCircle size={28} className="mb-3 text-exam-red" />
        <p className="mb-1 text-[15px] font-bold text-exam-text">
          Failed to load results
        </p>
        <p className="text-sm text-exam-muted">
          Check your database connection and try again.
        </p>
      </div>
    );
  }
}

import { OverviewPanel } from "@/components/admin/overview-panel";
import { getAdminSessionOrRedirect } from "@/lib/auth-server";
import { overviewService } from "@/services/overview.service";
import { AlertCircle } from "lucide-react";

export default async function AdminOverviewPage() {
  await getAdminSessionOrRedirect();

  try {
    const data = await overviewService.getDashboard();
    return <OverviewPanel data={data} />;
  } catch (error) {
    console.error("Admin overview page failed:", error);
    return (
      <div className="flex min-h-60 flex-col items-center justify-center rounded-[13px] border border-exam-border bg-exam-white p-8 text-center">
        <AlertCircle size={28} className="mb-3 text-exam-red" />
        <p className="mb-1 text-[15px] font-bold text-exam-text">
          Failed to load overview
        </p>
        <p className="text-sm text-exam-muted">
          Check your database connection and try again.
        </p>
      </div>
    );
  }
}

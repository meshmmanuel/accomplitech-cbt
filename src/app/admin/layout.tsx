"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  const title =
    pathname === "/admin"
      ? "Overview"
      : pathname.startsWith("/admin/subjects")
        ? "Subjects & Exams"
        : pathname.startsWith("/admin/sessions")
          ? "Sessions"
          : pathname.startsWith("/admin/monitor")
            ? "Monitor"
            : pathname.startsWith("/admin/results")
              ? "Results & Grading"
              : pathname.startsWith("/admin/reports")
                ? "Reports"
                : pathname.startsWith("/admin/settings")
                  ? "Settings"
                  : "Admin";

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-surface">
        <header className="flex shrink-0 items-center justify-between border-b border-exam-border bg-exam-white px-5.5 py-3">
          <h2 className="m-0 text-[17px] font-extrabold text-exam-text">
            {title}
          </h2>
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-exam-muted">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-navy text-xs font-bold text-exam-white">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5.5">{children}</main>
      </div>
    </div>
  );
}

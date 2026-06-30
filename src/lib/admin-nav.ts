import type { UserRole } from "@prisma/client";
import {
  canAccessMonitor,
  canAccessReports,
  canAccessResults,
  canAccessSettings,
  canManageExamContent,
  canManageSessions,
} from "@/lib/admin-roles";

export interface AdminNavItem {
  href: string;
  label: string;
  exact?: boolean;
  badgeKey?: "inExam" | "pendingGrades";
}

const ALL_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/subjects", label: "Subjects & Exams" },
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/monitor", label: "Monitor", badgeKey: "inExam" },
  { href: "/admin/results", label: "Results & Grading", badgeKey: "pendingGrades" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];

export function navItemsForRole(role: UserRole) {
  return ALL_NAV_ITEMS.filter((item) => {
    if (item.href === "/admin/subjects") return canManageExamContent(role);
    if (item.href === "/admin/sessions") return canManageSessions(role);
    if (item.href === "/admin/monitor") return canAccessMonitor(role);
    if (item.href === "/admin/results") return canAccessResults(role);
    if (item.href === "/admin/reports") return canAccessReports(role);
    if (item.href === "/admin/settings") return canAccessSettings(role);
    return true;
  });
}

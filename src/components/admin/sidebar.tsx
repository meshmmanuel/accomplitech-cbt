"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Award,
  BarChart3,
  BookMarked,
  Layers,
  LogOut,
  Monitor,
  Settings,
  TrendingUp,
} from "lucide-react";
import { liveStudents } from "@/data/mock/live";
import { results } from "@/data/mock/results";
import { apiPost } from "@/lib/api-client";

const navItems = [
  { href: "/admin", icon: BarChart3, label: "Overview", exact: true },
  { href: "/admin/subjects", icon: BookMarked, label: "Subjects & Exams" },
  { href: "/admin/sessions", icon: Layers, label: "Sessions" },
  {
    href: "/admin/monitor",
    icon: Activity,
    label: "Monitor",
    badge: liveStudents.filter((s) => s.status === "active").length || null,
  },
  {
    href: "/admin/results",
    icon: Award,
    label: "Results & Grading",
    badge: results.filter((r) => r.th === null && r.thT > 0).length || null,
  },
  { href: "/admin/reports", icon: TrendingUp, label: "Reports" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeCount = liveStudents.filter((s) => s.status === "active").length;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const signOut = async () => {
    await apiPost("/api/auth/logout", {});
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="flex w-[220px] shrink-0 flex-col bg-navy-dark">
      <div className="flex items-center gap-2.5 border-b border-white/7 px-3.5 py-4.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold">
          <Monitor size={16} className="text-navy-dark" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-exam-white">ExamLink</div>
          <div className="mt-0.5 text-[10px] text-[#4455AA]">Admin Console</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-0.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[13px] transition-all ${
                active
                  ? "bg-navy font-semibold text-exam-white"
                  : "font-normal text-[#6677BB] hover:bg-navy/50"
              }`}
            >
              <Icon size={17} />
              {item.label}
              {item.badge ? (
                <span
                  className={`ml-auto rounded-full px-1.5 py-px text-[10px] font-bold text-exam-white ${
                    item.href.includes("results") ? "bg-exam-amber" : "bg-exam-green"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/7 px-3.5 py-4.5">
        {[
          { label: "Server", value: "Online", ok: true },
          { label: "Network", value: "LAN", ok: true },
          { label: "Active", value: `${activeCount} students`, ok: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="mb-1 flex justify-between text-[11px] text-[#5566AA]"
          >
            <span>{stat.label}</span>
            <span
              className={`font-semibold ${stat.ok ? "text-exam-green" : "text-exam-red"}`}
            >
              {stat.value}
            </span>
          </div>
        ))}
        <button
          type="button"
          onClick={signOut}
          className="mt-2.5 flex items-center gap-1.5 text-xs text-[#4455AA] hover:text-exam-white"
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </aside>
  );
}

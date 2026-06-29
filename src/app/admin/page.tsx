import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { exams } from "@/data/mock/exams";
import { liveStudents } from "@/data/mock/live";
import { results } from "@/data/mock/results";
import { sessions } from "@/data/mock/sessions";
import { students } from "@/data/mock/students";
import { subjects } from "@/data/mock/subjects";
import Link from "next/link";

export default function AdminOverviewPage() {
  const activeCount = liveStudents.filter((s) => s.status === "active").length;
  const pendingGrades = results.filter(
    (r) => r.th === null && r.thT > 0,
  ).length;

  return (
    <>
      <div className="mb-5 grid grid-cols-4 gap-3">
        <StatCard
          label="Active Students"
          value={activeCount}
          sub="In exam right now"
          accent="bg-emerald-50"
          barColor="bg-exam-green"
        />
        <StatCard
          label="Total Students"
          value={students.length}
          sub="In roster"
          accent="bg-indigo-50"
          barColor="bg-navy"
        />
        <StatCard
          label="Exams Created"
          value={exams.length}
          sub="Across all subjects"
          accent="bg-amber-50"
          barColor="bg-exam-amber"
        />
        <StatCard
          label="Pending Grades"
          value={pendingGrades}
          sub="Theory to mark"
          accent="bg-purple-50"
          barColor="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-[1.3fr_1fr] gap-3.5">
        <div className="rounded-xl border border-exam-border bg-exam-white p-4.5">
          <div className="mb-3.5 text-sm font-bold text-exam-text">Sessions</div>
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border-b border-exam-border py-2.5 last:border-0"
            >
              <div>
                <div className="text-[13px] font-semibold text-exam-text">
                  {s.name}
                </div>
                <div className="text-xs text-exam-muted">
                  {s.date} · {s.enrolled} students · {s.dur} min
                </div>
              </div>
              <Badge status={s.status} />
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-exam-border bg-exam-white p-4.5">
          <div className="mb-3.5 text-sm font-bold text-exam-text">Subjects</div>
          {subjects.map((s) => (
            <Link
              key={s.id}
              href={`/admin/subjects/${s.id}`}
              className="flex cursor-pointer items-center justify-between border-b border-exam-border py-2.5 last:border-0"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: s.dot }}
                />
                <div>
                  <div className="text-[13px] font-semibold text-exam-text">
                    {s.code}
                  </div>
                  <div className="text-[11px] text-exam-muted">
                    {s.examCount} exam{s.examCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-navy">View</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

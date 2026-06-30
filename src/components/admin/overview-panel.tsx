import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import type { OverviewDashboard } from "@/modules/overview/types";
import Link from "next/link";

interface OverviewPanelProps {
  data: OverviewDashboard;
}

export function OverviewPanel({ data }: OverviewPanelProps) {
  const { stats, sessions, subjects } = data;

  return (
    <>
      <div className="mb-5 grid grid-cols-4 gap-3">
        <StatCard
          label="In Exam"
          value={stats.inExam}
          sub="Students actively taking an exam"
          accent="bg-emerald-50"
          barColor="bg-exam-green"
        />
        <StatCard
          label="Clients Online"
          value={stats.clientsOnline}
          sub={
            stats.studentsConnected > 0
              ? `${stats.studentsConnected} with student logged in`
              : "Workstations connected"
          }
          accent="bg-indigo-50"
          barColor="bg-navy"
        />
        <StatCard
          label="Exams Created"
          value={stats.totalExams}
          sub={`Across ${stats.totalSubjects} subject${stats.totalSubjects !== 1 ? "s" : ""}`}
          accent="bg-amber-50"
          barColor="bg-exam-amber"
        />
        <StatCard
          label="Pending Grades"
          value={stats.pendingGrades}
          sub="Theory scripts to mark"
          accent="bg-purple-50"
          barColor="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-[1.3fr_1fr] gap-3.5">
        <div className="rounded-xl border border-exam-border bg-exam-white p-4.5">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="text-sm font-bold text-exam-text">Sessions</div>
            <Link
              href="/admin/sessions"
              className="text-xs font-semibold text-navy hover:underline"
            >
              View all
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-exam-border px-4 py-8 text-center">
              <p className="mb-1 text-sm font-semibold text-exam-text">
                No sessions yet
              </p>
              <p className="mb-3 text-xs text-exam-muted">
                Create a session to schedule exams for students.
              </p>
              <Link
                href="/admin/sessions"
                className="text-xs font-semibold text-navy hover:underline"
              >
                Go to Sessions
              </Link>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between border-b border-exam-border py-2.5 last:border-0"
              >
                <div>
                  <div className="text-[13px] font-semibold text-exam-text">
                    {session.name}
                  </div>
                  <div className="text-xs text-exam-muted">
                    {session.date} · {session.attemptCount} attempt
                    {session.attemptCount !== 1 ? "s" : ""} ·{" "}
                    {session.durationMinutes} min
                  </div>
                </div>
                <Badge status={session.status} />
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl border border-exam-border bg-exam-white p-4.5">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="text-sm font-bold text-exam-text">Subjects</div>
            <Link
              href="/admin/subjects"
              className="text-xs font-semibold text-navy hover:underline"
            >
              View all
            </Link>
          </div>

          {subjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-exam-border px-4 py-8 text-center">
              <p className="mb-1 text-sm font-semibold text-exam-text">
                No subjects yet
              </p>
              <p className="mb-3 text-xs text-exam-muted">
                Add subjects before creating exams and sessions.
              </p>
              <Link
                href="/admin/subjects"
                className="text-xs font-semibold text-navy hover:underline"
              >
                Go to Subjects
              </Link>
            </div>
          ) : (
            subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/admin/subjects/${subject.id}`}
                className="flex cursor-pointer items-center justify-between border-b border-exam-border py-2.5 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: subject.dot }}
                  />
                  <div>
                    <div className="text-[13px] font-semibold text-exam-text">
                      {subject.code}
                    </div>
                    <div className="text-[11px] text-exam-muted">
                      {subject.examCount} exam
                      {subject.examCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-navy">View</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}

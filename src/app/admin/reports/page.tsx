import { Button } from "@/components/ui/button";
import { subjects } from "@/data/mock/subjects";
import { Download } from "lucide-react";

export default function AdminReportsPage() {
  const topPerformers = [
    { name: "Olawale Blessing", score: "44/46", pct: 96 },
    { name: "Adeyemi Fatimah", score: "38/46", pct: 83 },
    { name: "Nwachukwu Ngozi", score: "36/46", pct: 78 },
    { name: "Ibrahim Aisha", score: "38/60", pct: 63 },
  ];

  return (
    <>
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          {
            label: "Average Score",
            value: "67%",
            sub: "All exams this term",
            color: "text-exam-green",
          },
          {
            label: "Pass Rate",
            value: "78%",
            sub: "Students above pass mark",
            color: "text-navy",
          },
          {
            label: "Completion Rate",
            value: "94%",
            sub: "Submitted before timeout",
            color: "text-exam-amber",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-exam-border bg-exam-white p-5 text-center"
          >
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-exam-muted">
              {stat.label}
            </div>
            <div className={`mb-1 text-[38px] font-black ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-exam-muted">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="rounded-xl border border-exam-border bg-exam-white p-4.5">
          <div className="mb-3.5 text-[13px] font-bold text-exam-text">
            Performance by Subject
          </div>
          {subjects.map((s, i) => {
            const pct = [72, 58, 81, 65][i];
            return (
              <div key={s.id} className="mb-3.5">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-exam-text">
                    {s.code} — {s.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                  <span className="font-semibold text-exam-muted">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-exam-border">
                  <div
                    className={`h-full rounded-full ${
                      pct >= 60
                        ? "bg-exam-green"
                        : pct >= 45
                          ? "bg-exam-amber"
                          : "bg-exam-red"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-exam-border bg-exam-white p-4.5">
          <div className="mb-3.5 flex items-center justify-between text-[13px] font-bold text-exam-text">
            Top Performers
            <Button variant="ghost" size="sm">
              <Download size={12} /> Export
            </Button>
          </div>
          {topPerformers.map((s, i) => (
            <div key={s.name} className="mb-3 flex items-center gap-2.5">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
                  i === 0
                    ? "bg-gold text-navy-dark"
                    : i === 1
                      ? "bg-slate-300 text-navy-dark"
                      : i === 2
                        ? "bg-amber-600 text-exam-white"
                        : "bg-surface text-exam-muted"
                }`}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-exam-text">
                  {s.name}
                </div>
                <div className="mt-0.5 h-1 rounded-full bg-exam-border">
                  <div
                    className="h-full rounded-full bg-exam-green"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
              <span className="whitespace-nowrap text-xs font-bold text-exam-text">
                {s.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

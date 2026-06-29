import { Badge } from "@/components/ui/badge";
import { exams } from "@/data/mock/exams";
import type { Session } from "@/data/mock/sessions";
import { Clock, Users } from "lucide-react";
import { SectionHead } from "@/components/ui/section-head";

export function SessionCard({ session }: { session: Session }) {
  const sessionExams = exams.filter((e) =>
    (session.examIds as readonly number[]).includes(e.id),
  );

  return (
    <div className="rounded-[13px] border border-exam-border bg-exam-white p-5">
      <div className="mb-3.5 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[15px] font-bold text-exam-text">
              {session.name}
            </span>
            <Badge status={session.status} />
            <Badge status={session.type} />
          </div>
          <div className="flex flex-wrap gap-3.5 text-xs text-exam-muted">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {session.date} · {session.time}
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              {session.enrolled} students
            </span>
            <span>{session.dur} min total</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface p-3">
          <SectionHead>Exams in this session</SectionHead>
          {sessionExams.length > 0 ? (
            sessionExams.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between border-b border-exam-border py-1 text-xs last:border-0"
              >
                <span className="font-semibold text-navy">{e.subCode}</span>
                <span className="text-exam-muted">
                  {e.name} · {e.dur}min
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-exam-muted">No exams linked yet</span>
          )}
        </div>
        <div className="rounded-lg border border-[#FDDEA0] bg-gold-light p-3">
          <SectionHead>Session Instructions</SectionHead>
          <p className="m-0 whitespace-pre-line text-xs leading-relaxed text-amber-800">
            {session.instructions}
          </p>
        </div>
      </div>
    </div>
  );
}

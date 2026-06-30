import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SessionListItem } from "@/modules/sessions";
import { Clock, Edit, Hash, Trash2, Users } from "lucide-react";
import { SectionHead } from "@/components/ui/section-head";

interface SessionCardProps {
  session: SessionListItem;
  onEdit: (session: SessionListItem) => void;
  onDelete: (session: SessionListItem) => void;
}

export function SessionCard({ session, onEdit, onDelete }: SessionCardProps) {
  return (
    <div className="rounded-[13px] border border-exam-border bg-exam-white p-5">
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold text-exam-text">
              {session.name}
            </span>
            <Badge status={session.status} />
            <Badge status={session.type} />
          </div>
          <div className="flex flex-wrap gap-3.5 text-xs text-exam-muted">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {session.date}
              {session.startTime ? ` · ${session.startTime}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <Hash size={11} />
              {session.examCode}
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              {session.attemptCount} attempt
              {session.attemptCount !== 1 ? "s" : ""}
            </span>
            <span>{session.durationMinutes} min total</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => onEdit(session)}>
            <Edit size={12} /> Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(session)}>
            <Trash2 size={12} /> Delete
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface p-3">
          <SectionHead>Exams in this session</SectionHead>
          {session.exams.length > 0 ? (
            session.exams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between border-b border-exam-border py-1 text-xs last:border-0"
              >
                <span className="font-semibold text-navy">{exam.subjectCode}</span>
                <span className="text-exam-muted">
                  {exam.name} · {exam.durationMinutes}min
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
            {session.instructions || "No instructions set."}
          </p>
        </div>
      </div>
    </div>
  );
}

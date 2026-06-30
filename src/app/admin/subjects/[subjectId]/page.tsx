import { SubjectDetailActions } from "@/components/admin/subject-detail-actions";
import { SubjectExamsToolbar } from "@/components/admin/subject-exams-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminSessionOrRedirect } from "@/lib/auth-server";
import { subjectService } from "@/services/subject.service";
import {
  Award,
  Clock,
  Eye,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SubjectExamsPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const admin = await getAdminSessionOrRedirect();
  const { subjectId } = await params;
  const subject = await subjectService.getByIdForAdmin(subjectId, admin);
  if (!subject) notFound();

  return (
    <>
      <Link
        href="/admin/subjects"
        className="mb-4 inline-flex text-xs text-exam-muted hover:text-exam-text"
      >
        ← Subjects
      </Link>

      <div className="mb-4 rounded-xl border border-exam-border bg-exam-white p-4.5">
        <div className="mb-1 flex items-center gap-2">
          <span
            className="rounded-lg px-2 py-1 text-[11px] font-extrabold"
            style={{ backgroundColor: subject.color, color: subject.dot }}
          >
            {subject.code}
          </span>
          {subject.department && (
            <span className="text-xs text-exam-muted">{subject.department}</span>
          )}
        </div>
        <h3 className="mb-1 text-lg font-extrabold text-exam-text">
          {subject.name}
        </h3>
        {subject.description && (
          <p className="text-sm text-exam-muted">{subject.description}</p>
        )}
      </div>

      <SubjectDetailActions subject={subject} />

      <SubjectExamsToolbar subjectId={subject.id} />

      {subject.exams.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-exam-border bg-exam-white p-8 text-center">
          <FileText size={24} className="mb-2 text-exam-muted" />
          <p className="mb-1 text-sm font-bold text-exam-text">No exams yet</p>
          <p className="text-xs text-exam-muted">
            Exams for this subject will appear here once created.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {subject.exams.map((exam) => (
            <div
              key={exam.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-exam-border bg-exam-white p-4.5"
            >
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-sm font-bold text-exam-text">
                    {exam.name}
                  </span>
                  <Badge status={exam.status} />
                  <Badge status={exam.type} />
                </div>
                <div className="flex flex-wrap gap-3.5 text-xs text-exam-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {exam.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={11} />
                    {exam.questionCount} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Award size={11} />
                    Pass: {exam.passMark}%
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Link href={`/admin/subjects/${subject.id}/exams/${exam.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye size={12} /> Manage
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

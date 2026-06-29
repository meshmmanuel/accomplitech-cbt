import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exams } from "@/data/mock/exams";
import { subjects } from "@/data/mock/subjects";
import { Award, Clock, Edit, Eye, FileText, Plus, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SubjectExamsPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const subject = subjects.find((s) => s.id === Number(subjectId));
  if (!subject) notFound();

  const subjectExams = exams.filter((e) => e.subId === subject.id);

  return (
    <>
      <Link
        href="/admin/subjects"
        className="mb-4 inline-flex text-xs text-exam-muted hover:text-exam-text"
      >
        ← Subjects
      </Link>

      <div className="mb-4.5 flex gap-2.5">
        <Button variant="primary">
          <Plus size={14} /> New Exam
        </Button>
        <Button variant="ghost">
          <Upload size={14} /> Upload Questions
        </Button>
      </div>

      <div className="flex flex-col gap-2.5">
        {subjectExams.map((ex) => (
          <div
            key={ex.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-exam-border bg-exam-white p-4.5"
          >
            <div className="flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-bold text-exam-text">
                  {ex.name}
                </span>
                <Badge status={ex.status} />
                <Badge status={ex.type} />
              </div>
              <div className="flex flex-wrap gap-3.5 text-xs text-exam-muted">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {ex.dur} min
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={11} />
                  {ex.qCount} questions
                </span>
                <span className="flex items-center gap-1">
                  <Award size={11} />
                  Pass: {ex.pass}%
                </span>
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Link href={`/admin/subjects/${subject.id}/exams/${ex.id}`}>
                <Button variant="ghost" size="sm">
                  <Eye size={12} /> Manage
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Edit size={12} />
              </Button>
              <Button variant="danger" size="sm">
                <Trash2 size={12} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

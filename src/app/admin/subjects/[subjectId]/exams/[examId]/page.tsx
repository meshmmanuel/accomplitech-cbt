import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exams } from "@/data/mock/exams";
import { sampleQuestions } from "@/data/mock/questions";
import { subjects } from "@/data/mock/subjects";
import { Database, Edit, Plus, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string; examId: string }>;
}) {
  const { subjectId, examId } = await params;
  const subject = subjects.find((s) => s.id === Number(subjectId));
  const exam = exams.find((e) => e.id === Number(examId));
  if (!subject || !exam) notFound();

  const questions = sampleQuestions.filter((q) => q.examId === exam.id);

  return (
    <>
      <Link
        href={`/admin/subjects/${subject.id}`}
        className="mb-4 inline-flex text-xs text-exam-muted hover:text-exam-text"
      >
        ← {subject.code}
      </Link>

      <div className="grid grid-cols-[300px_1fr] items-start gap-4">
        <div>
          <div className="mb-3.5 rounded-xl border border-exam-border bg-exam-white p-4.5">
            <div className="mb-3 flex items-center justify-between text-[13px] font-bold text-exam-text">
              Exam Details
              <Button variant="ghost" size="sm">
                <Edit size={12} />
              </Button>
            </div>
            {[
              { label: "Subject", value: exam.subCode },
              { label: "Type", value: <Badge status={exam.type} /> },
              { label: "Duration", value: `${exam.dur} min` },
              { label: "Pass Mark", value: `${exam.pass}%` },
              { label: "Questions", value: `${exam.qCount}` },
              { label: "Status", value: <Badge status={exam.status} /> },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-exam-border py-2 last:border-0"
              >
                <span className="text-xs text-exam-muted">{row.label}</span>
                <span className="text-xs font-semibold text-exam-text">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-exam-border bg-exam-white p-4.5">
            <div className="mb-2.5 flex items-center justify-between text-[13px] font-bold text-exam-text">
              Instructions
              <Button variant="ghost" size="sm">
                <Edit size={12} />
              </Button>
            </div>
            <div className="rounded-lg border border-[#FDDEA0] bg-gold-light p-3.5">
              <p className="m-0 whitespace-pre-line text-xs leading-relaxed text-amber-800">
                {exam.instructions}
              </p>
            </div>
            <p className="mt-2 text-[11px] text-exam-muted">
              Shown to students before the exam begins.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-exam-border bg-exam-white p-4.5">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="text-[13px] font-bold text-exam-text">
              Question Bank ({questions.length})
            </span>
            <div className="flex gap-1.5">
              <Button variant="primary" size="sm">
                <Upload size={12} /> Upload CSV
              </Button>
              <Button variant="ghost" size="sm">
                <Plus size={12} /> Add Manual
              </Button>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="py-8 text-center text-exam-muted">
              <Database size={32} className="mx-auto mb-2 text-exam-border" />
              <div className="text-[13px]">
                No questions yet. Upload a CSV to get started.
              </div>
            </div>
          ) : (
            questions.map((q, i) => (
              <div
                key={q.id}
                className="flex items-start gap-2.5 border-b border-exam-border py-2.5 last:border-0"
              >
                <div
                  className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                    q.type === "obj"
                      ? "bg-sky-50 text-sky-800"
                      : "bg-purple-50 text-purple-800"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-xs leading-relaxed text-exam-text">
                    {q.q}
                  </div>
                  <div className="flex gap-2">
                    <Badge status={q.type === "obj" ? "obj" : "theory"} />
                    <span className="text-[11px] text-exam-muted">
                      {q.marks} marks
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="cursor-pointer p-1 text-exam-muted"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

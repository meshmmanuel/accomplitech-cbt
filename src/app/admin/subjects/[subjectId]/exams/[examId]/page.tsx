import { ExamDetailActions } from "@/components/admin/exam-detail-actions";
import { ExamQuestionBank } from "@/components/admin/exam-question-bank";
import { Badge } from "@/components/ui/badge";
import { getAdminSessionOrRedirect } from "@/lib/auth-server";
import { toExamDetail } from "@/modules/exams";
import { toQuestionBankItem } from "@/modules/questions";
import { examTypeToCode } from "@/modules/subjects/mappers";
import { examService } from "@/services/exam.service";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string; examId: string }>;
}) {
  await getAdminSessionOrRedirect();
  const { subjectId, examId } = await params;
  const exam = await examService.getById(examId);

  if (!exam || exam.subjectId !== subjectId) notFound();

  const subject = exam.subject;
  const typeCode = examTypeToCode(exam.type);
  const questions = exam.questions.map(toQuestionBankItem);
  const examDetail = toExamDetail(exam);

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
            <div className="mb-3 text-[13px] font-bold text-exam-text">
              Exam Details
            </div>
            <ExamDetailActions exam={examDetail} subjectCode={subject.code} />
            {[
              { label: "Subject", value: subject.code },
              { label: "Type", value: <Badge status={typeCode} /> },
              { label: "Duration", value: `${exam.durationMinutes} min` },
              { label: "Pass Mark", value: `${exam.passMark}%` },
              { label: "Total Marks", value: `${exam.totalMarks}` },
              { label: "Questions", value: `${exam._count.questions}` },
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
            <div className="mb-2.5 text-[13px] font-bold text-exam-text">
              Instructions
            </div>
            <div className="rounded-lg border border-[#FDDEA0] bg-gold-light p-3.5">
              <p className="m-0 whitespace-pre-line text-xs leading-relaxed text-amber-800">
                {exam.instructions ?? "No instructions set."}
              </p>
            </div>
            <p className="mt-2 text-[11px] text-exam-muted">
              Shown to students before the exam begins.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-exam-border bg-exam-white p-4.5">
          <ExamQuestionBank examId={examId} questions={questions} />
        </div>
      </div>
    </>
  );
}

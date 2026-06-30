import { SessionBeginButton } from "@/components/student/session-begin-button";
import { Button } from "@/components/ui/button";
import { getStudentSessionOrRedirect } from "@/lib/auth-server";
import { sessionService } from "@/services/session.service";
import { ClipboardList, Monitor } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SessionInstructionsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const student = await getStudentSessionOrRedirect();

  if (student.sessionId !== sessionId) {
    redirect("/student/login");
  }

  const session = await sessionService.getById(sessionId);
  if (!session) {
    redirect("/student/login");
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="flex items-center justify-between bg-navy px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold">
            <Monitor size={16} className="text-navy-dark" />
          </div>
          <span className="text-sm font-bold text-exam-white">ExamLink CBT</span>
        </div>
        <span className="text-xs text-[#8899CC]">
          {student.admissionNumber}
        </span>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <ClipboardList size={24} className="text-navy" />
          <div>
            <h1 className="m-0 text-xl font-extrabold text-exam-text">
              Session Instructions
            </h1>
            <p className="m-0 mt-1 text-sm text-exam-muted">{session.name}</p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-[#FDDEA0] bg-gold-light p-5">
          <p className="m-0 whitespace-pre-line text-sm leading-relaxed text-[#92400E]">
            {session.instructions ??
              "Please read all instructions carefully before proceeding."}
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-exam-border bg-exam-white p-5">
          <h2 className="m-0 mb-3 text-sm font-bold text-exam-text">
            Exams in this session
          </h2>
          <p className="mb-3 text-xs text-exam-muted">
            You have {session.durationMinutes} minutes total for{" "}
            {session.sessionExams.length === 1
              ? "this exam"
              : `all ${session.sessionExams.length} exams`}
            . The timer starts when you begin.
          </p>
          <ul className="m-0 space-y-2 p-0">
            {session.sessionExams.map(({ exam }) => (
              <li
                key={exam.id}
                className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm"
              >
                <span>
                  <span className="font-bold text-navy">{exam.subject.code}</span>
                  {" · "}
                  {exam.name}
                </span>
                <span className="text-exam-muted">{exam.questions.length} Q</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Link href="/student/login" className="flex-1">
            <Button variant="ghost" className="w-full justify-center">
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <SessionBeginButton
              sessionId={sessionId}
              examCount={session.sessionExams.length}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

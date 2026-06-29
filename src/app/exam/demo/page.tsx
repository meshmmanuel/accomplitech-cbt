"use client";

import { ExamHeader, QuestionMeta } from "@/components/student/exam-header";
import { InstructionsModal } from "@/components/student/instructions-modal";
import { ObjectiveQuestion } from "@/components/student/objective-question";
import { QuestionNavigator } from "@/components/student/question-navigator";
import { SubmitModal } from "@/components/student/submit-modal";
import { TheoryQuestion } from "@/components/student/theory-question";
import { Button } from "@/components/ui/button";
import { demoExamQuestions } from "@/data/mock/questions";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EXAM_INSTRUCTIONS = `1. Read all questions carefully before answering.
2. For theory questions, write legibly in your answer booklet.
3. No programmable calculators allowed.
4. Mobile phones must be switched off and placed under your desk.`;

export default function ExamDemoPage() {
  const router = useRouter();
  const questions = demoExamQuestions;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(5400);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (timeLeft <= 0) {
      router.push("/exam/success");
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const q = questions[current];
  const objQs = questions.filter((x) => x.type === "obj");
  const thQs = questions.filter((x) => x.type === "theory");
  const answered = Object.keys(answers).length;

  const toggleFlag = () => {
    const next = new Set(flagged);
    if (next.has(current)) next.delete(current);
    else next.add(current);
    setFlagged(next);
  };

  if (showInstructions) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-navy-dark/75 p-4">
        <div className="w-full max-w-[500px] rounded-[18px] bg-exam-white p-8 shadow-2xl">
          <InstructionsModal
            instructions={EXAM_INSTRUCTIONS}
            onBegin={() => setShowInstructions(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-surface">
      <ExamHeader
        title="CS101 · Introduction to Computer Science · Mid-Term Assessment"
        subtitle={`${answered}/${objQs.length} objective answered · ${thQs.length} theory on paper`}
        timeLeft={timeLeft}
        onSubmit={() => setShowSubmit(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <QuestionNavigator
          questions={questions}
          current={current}
          answers={answers}
          flagged={flagged}
          onSelect={setCurrent}
        />

        <div className="flex-1 overflow-y-auto p-7">
          <div className="mx-auto max-w-[620px]">
            <QuestionMeta
              current={current}
              total={questions.length}
              type={q.type}
              marks={q.marks}
              flagged={flagged.has(current)}
              onToggleFlag={toggleFlag}
            />

            <div className="mb-4.5 rounded-[14px] border border-exam-border bg-exam-white p-6.5">
              <p className="m-0 mb-5.5 text-base font-medium leading-relaxed text-exam-text">
                {q.q}
              </p>
              {q.type === "obj" && "opts" in q ? (
                <ObjectiveQuestion
                  options={q.opts}
                  selected={answers[current]}
                  onSelect={(oi) =>
                    setAnswers({ ...answers, [current]: oi })
                  }
                />
              ) : (
                <TheoryQuestion />
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrent(Math.max(0, current - 1))}
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              {current < questions.length - 1 ? (
                <Button
                  variant="navy"
                  size="sm"
                  onClick={() => setCurrent(current + 1)}
                >
                  Next <ChevronRight size={14} />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowSubmit(true)}
                >
                  Review and Submit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSubmit && (
        <SubmitModal
          answered={answered}
          objTotal={objQs.length}
          thTotal={thQs.length}
          flagged={flagged.size}
          timeLeft={timeLeft}
          onClose={() => setShowSubmit(false)}
          onSubmit={() => router.push("/exam/success")}
        />
      )}
    </div>
  );
}

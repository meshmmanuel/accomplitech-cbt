import type { Exam, ExamType } from "@prisma/client";
import type { ExamTypeCode } from "@/types";
import type { ExamDetail } from "./types";

export function examCodeToType(code: ExamTypeCode): ExamType {
  if (code === "obj") return "OBJECTIVE";
  if (code === "theory") return "THEORY";
  return "BOTH";
}

export function examTypeToCode(type: ExamType): ExamTypeCode {
  if (type === "OBJECTIVE") return "obj";
  if (type === "THEORY") return "theory";
  return "both";
}

type ExamWithQuestionCount = Exam & {
  _count: { questions: number };
};

export function toExamDetail(exam: ExamWithQuestionCount): ExamDetail {
  return {
    id: exam.id,
    subjectId: exam.subjectId,
    name: exam.name,
    type: examTypeToCode(exam.type),
    durationMinutes: exam.durationMinutes,
    passMark: exam.passMark,
    totalMarks: exam.totalMarks,
    instructions: exam.instructions,
    status: exam.status,
    questionCount: exam._count.questions,
  };
}

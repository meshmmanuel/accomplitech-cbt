import type { Exam, ExamType, Subject } from "@prisma/client";
import type { ExamTypeCode } from "@/types";
import { getSubjectColors } from "./constants";
import type { SubjectDetail, SubjectExamSummary, SubjectListItem } from "./types";

export function examTypeToCode(type: ExamType): ExamTypeCode {
  if (type === "OBJECTIVE") return "obj";
  if (type === "THEORY") return "theory";
  return "both";
}

type SubjectWithExamCount = Subject & {
  _count: { exams: number };
};

type SubjectWithExams = Subject & {
  _count?: { exams: number };
  exams: Array<
    Exam & {
      _count: { questions: number };
    }
  >;
};

export function toSubjectListItem(subject: SubjectWithExamCount): SubjectListItem {
  const colors = getSubjectColors(subject.code);
  return {
    id: subject.id,
    code: subject.code,
    name: subject.name,
    description: subject.description,
    department: subject.department,
    status: subject.status,
    examCount: subject._count.exams,
    color: colors.color,
    dot: colors.dot,
  };
}

function toExamSummary(
  exam: Exam & { _count: { questions: number } },
): SubjectExamSummary {
  return {
    id: exam.id,
    name: exam.name,
    type: examTypeToCode(exam.type),
    durationMinutes: exam.durationMinutes,
    passMark: exam.passMark,
    questionCount: exam._count.questions,
    status: exam.status,
  };
}

export function toSubjectDetail(subject: SubjectWithExams): SubjectDetail {
  const listItem = toSubjectListItem({
    ...subject,
    _count: subject._count ?? { exams: subject.exams.length },
  });

  return {
    ...listItem,
    exams: subject.exams.map(toExamSummary),
  };
}

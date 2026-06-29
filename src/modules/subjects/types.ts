import type { ExamTypeCode } from "@/types";

export interface SubjectListItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  department: string | null;
  status: string;
  examCount: number;
  color: string;
  dot: string;
}

export interface SubjectExamSummary {
  id: string;
  name: string;
  type: ExamTypeCode;
  durationMinutes: number;
  passMark: number;
  questionCount: number;
  status: string;
}

export interface SubjectDetail extends SubjectListItem {
  exams: SubjectExamSummary[];
}

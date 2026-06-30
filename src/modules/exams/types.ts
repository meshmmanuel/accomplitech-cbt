import type { ExamTypeCode } from "@/types";

export interface ExamDetail {
  id: string;
  subjectId: string;
  name: string;
  type: ExamTypeCode;
  durationMinutes: number;
  passMark: number;
  totalMarks: number;
  instructions: string | null;
  status: string;
  questionCount: number;
}

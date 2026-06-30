import type { ExamTypeCode } from "@/types";

export type SessionStatusCode = "draft" | "upcoming" | "open" | "completed";

export interface SessionExamSummary {
  id: string;
  name: string;
  subjectCode: string;
  durationMinutes: number;
  type: ExamTypeCode;
  isReleased: boolean;
  releasedAt: string | null;
}

export interface SessionListItem {
  id: string;
  name: string;
  date: string;
  dateInput: string;
  startTime: string | null;
  durationMinutes: number;
  instructions: string | null;
  examCode: string;
  status: SessionStatusCode;
  type: ExamTypeCode;
  attemptCount: number;
  releasedExamCount: number;
  exams: SessionExamSummary[];
}

export interface ExamPickerItem {
  id: string;
  name: string;
  subjectCode: string;
  subjectName: string;
  durationMinutes: number;
  type: ExamTypeCode;
}

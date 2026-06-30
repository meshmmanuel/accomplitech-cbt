import type { ContentBlock, QuestionAsset } from "@/modules/questions";

export type ExamAttemptUiStatus = "not_started" | "in_progress" | "submitted";

export interface SessionHubExam {
  id: string;
  name: string;
  subjectCode: string;
  subjectName: string;
  type: "obj" | "theory" | "both";
  questionCount: number;
  attemptId: string | null;
  attemptStatus: ExamAttemptUiStatus;
  score: number | null;
  instructions: string | null;
}

export interface SessionHubState {
  sessionId: string;
  sessionName: string;
  startedAt: string;
  timeRemainingSeconds: number;
  durationMinutes: number;
  examCount: number;
  exams: SessionHubExam[];
  allSubmitted: boolean;
  expired: boolean;
}

export interface StudentExamQuestion {
  id: string;
  legacyType: "obj" | "theory";
  marks: number;
  blocks: ContentBlock[];
  assets?: QuestionAsset[];
  assetUrlMap: Record<string, string>;
  options: string[];
}

export interface StudentAttemptState {
  attemptId: string;
  examId: string;
  sessionId: string;
  examName: string;
  subjectCode: string;
  examCount: number;
  status: string;
  score: number | null;
  timeRemainingSeconds: number;
  expired: boolean;
  questions: StudentExamQuestion[];
  answers: Record<string, { selectedOption: string | null; flagged: boolean }>;
}

export interface SubmitAttemptResult {
  attemptId: string;
  examId: string;
  sessionId: string;
  score: number | null;
  examCount: number;
  allSubmitted: boolean;
  timeRemainingSeconds: number;
}

export interface SubmitSessionResult {
  sessionId: string;
  examCount: number;
  submittedCount: number;
  timeRemainingSeconds: number;
}

export interface SessionExamSummary {
  examId: string;
  subjectCode: string;
  subjectName: string;
  examName: string;
  objAnswered: number;
  objTotal: number;
  thTotal: number;
  flagged: number;
  markedDone: boolean;
  opened: boolean;
}

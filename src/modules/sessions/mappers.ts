import type { Exam, ExamSession, ExamType, SessionStatus, Subject } from "@prisma/client";
import type { ExamTypeCode } from "@/types";
import { examTypeToCode } from "@/modules/subjects/mappers";
import { countReleasedSessionExams } from "./release";
import type {
  ExamPickerItem,
  SessionExamSummary,
  SessionListItem,
  SessionStatusCode,
} from "./types";

type SessionWithRelations = ExamSession & {
  sessionExams: Array<{
    isReleased: boolean;
    releasedAt: Date | null;
    exam: Exam & { subject: Subject };
  }>;
  _count: { attempts: number };
};

type ExamWithSubject = Exam & { subject: Subject };

export function sessionStatusToCode(status: SessionStatus): SessionStatusCode {
  if (status === "DRAFT") return "draft";
  if (status === "UPCOMING") return "upcoming";
  if (status === "OPEN") return "open";
  return "completed";
}

export function sessionStatusCodeToDb(status: SessionStatusCode): SessionStatus {
  if (status === "draft") return "DRAFT";
  if (status === "upcoming") return "UPCOMING";
  if (status === "open") return "OPEN";
  return "CLOSED";
}

function deriveSessionType(exams: SessionExamSummary[]): ExamTypeCode {
  if (exams.length === 0) return "obj";
  const types = new Set(exams.map((exam) => exam.type));
  if (types.size === 1) return exams[0].type;
  return "both";
}

function formatSessionDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toSessionExamSummary(
  sessionExam: SessionWithRelations["sessionExams"][number],
): SessionExamSummary {
  const { exam } = sessionExam;
  return {
    id: exam.id,
    name: exam.name,
    subjectCode: exam.subject.code,
    durationMinutes: exam.durationMinutes,
    type: examTypeToCode(exam.type),
    isReleased: sessionExam.isReleased,
    releasedAt: sessionExam.releasedAt?.toISOString() ?? null,
  };
}

export function toSessionListItem(session: SessionWithRelations): SessionListItem {
  const exams = session.sessionExams.map((sessionExam) =>
    toSessionExamSummary(sessionExam),
  );

  return {
    id: session.id,
    name: session.name,
    date: formatSessionDate(session.date),
    dateInput: toDateInputValue(session.date),
    startTime: session.startTime,
    durationMinutes: session.durationMinutes,
    instructions: session.instructions,
    examCode: session.examCode,
    status: sessionStatusToCode(session.status),
    type: deriveSessionType(exams),
    attemptCount: session._count.attempts,
    releasedExamCount: countReleasedSessionExams(session.sessionExams),
    exams,
  };
}

export function toExamPickerItem(exam: ExamWithSubject): ExamPickerItem {
  return {
    id: exam.id,
    name: exam.name,
    subjectCode: exam.subject.code,
    subjectName: exam.subject.name,
    durationMinutes: exam.durationMinutes,
    type: examTypeToCode(exam.type),
  };
}

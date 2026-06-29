export type ExamTypeCode = "obj" | "theory" | "both";

export type SessionStatusCode =
  | "draft"
  | "upcoming"
  | "active"
  | "open"
  | "completed"
  | "closed";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

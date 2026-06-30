import type { SessionListItem } from "@/modules/sessions";
import type { SubjectListItem } from "@/modules/subjects";

export interface OverviewStats {
  inExam: number;
  clientsOnline: number;
  studentsConnected: number;
  totalExams: number;
  totalSubjects: number;
  activeSessions: number;
  pendingGrades: number;
}

export interface OverviewDashboard {
  stats: OverviewStats;
  sessions: SessionListItem[];
  subjects: SubjectListItem[];
}

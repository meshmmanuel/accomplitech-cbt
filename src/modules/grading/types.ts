export interface TheoryQuestionGrade {
  questionId: string;
  text: string;
  marks: number;
  marksAwarded: number | null;
  sortOrder: number;
}

export interface AttemptGradingDetail {
  attemptId: string;
  studentName: string;
  admissionNumber: string;
  examName: string;
  subjectCode: string;
  sessionName: string;
  submittedAt: string | null;
  status: "submitted" | "graded";
  objectiveScore: number | null;
  objectiveTotal: number;
  theoryScore: number | null;
  theoryTotal: number;
  theoryQuestions: TheoryQuestionGrade[];
}

export interface GradeTheoryResult {
  attemptId: string;
  theoryScore: number;
  theoryTotal: number;
  objectiveScore: number | null;
  totalScore: number;
  status: "graded";
}

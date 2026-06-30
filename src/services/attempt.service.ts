import { QuestionType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { attemptRepository } from "@/repositories/attempt.repository";
import { examRepository } from "@/repositories/exam.repository";
import { questionService } from "@/services/question.service";

export interface AttemptResultsSummary {
  attemptId: string;
  sessionId: string;
  sessionName: string;
  examId: string;
  examName: string;
  subjectCode: string;
  admissionNumber: string;
  studentName: string;
  objectiveScore: number | null;
  objectiveTotal: number;
  theoryScore: number | null;
  theoryTotal: number;
  submittedAt: string | null;
  status: "submitted" | "graded";
}

const ANSWER_INDEX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

export class AttemptService {
  getById(id: string) {
    return attemptRepository.findById(id);
  }

  async startAttempt(input: {
    sessionId: string;
    examId: string;
    admissionNumber: string;
    displayName?: string;
  }) {
    const exam = await examRepository.findById(input.examId);
    if (!exam) {
      throw new AppError("Exam not found", 404);
    }

    const existing = await attemptRepository.findForStudentExam(
      input.sessionId,
      input.examId,
      input.admissionNumber,
    );

    if (existing) {
      return attemptRepository.findById(existing.id);
    }

    try {
      const attempt = await attemptRepository.create({
        session: { connect: { id: input.sessionId } },
        exam: { connect: { id: input.examId } },
        admissionNumber: input.admissionNumber,
        displayName: input.displayName,
      });

      return attemptRepository.findById(attempt.id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const raced = await attemptRepository.findForStudentExam(
          input.sessionId,
          input.examId,
          input.admissionNumber,
        );
        if (raced) {
          return attemptRepository.findById(raced.id);
        }
      }
      throw error;
    }
  }

  saveAnswer(input: {
    attemptId: string;
    questionId: string;
    selectedOption?: string | null;
    flaggedForReview?: boolean;
  }) {
    return attemptRepository.upsertAnswer(input);
  }

  async submitAttempt(attemptId: string, timeSpentSeconds: number) {
    const attempt = await attemptRepository.findById(attemptId);
    if (!attempt) {
      throw new AppError("Attempt not found", 404);
    }

    if (attempt.status !== "IN_PROGRESS") {
      throw new AppError("Attempt already submitted", 400);
    }

    const score = this.calculateObjectiveScore(attempt.exam.questions, attempt.answers);

    return attemptRepository.submit(attemptId, score, timeSpentSeconds);
  }

  private calculateObjectiveScore(
    questions: Array<{
      id: string;
      type: QuestionType;
      marks: number;
      correctAnswer: string | null;
      answer: unknown;
      options: unknown;
    }>,
    answers: Array<{ questionId: string; selectedOption: string | null }>,
  ) {
    let score = 0;

    for (const question of questions) {
      if (question.type !== QuestionType.OBJECTIVE) {
        continue;
      }

      const correctLetter = questionService.resolveCorrectLetter(question);
      if (!correctLetter) continue;

      const answer = answers.find((item) => item.questionId === question.id);
      if (answer?.selectedOption?.toUpperCase() === correctLetter) {
        score += question.marks;
      }
    }

    return score;
  }

  /** Map selected option letter to index for UI */
  optionIndex(selectedOption: string | null | undefined) {
    if (!selectedOption) return undefined;
    return ANSWER_INDEX[selectedOption.toUpperCase()];
  }

  async listSubmittedForInstitution(institutionId: string) {
    const attempts = await attemptRepository.findSubmittedByInstitution(institutionId);

    return attempts.map<AttemptResultsSummary>((attempt) => {
      const objectiveQuestions = attempt.exam.questions.filter(
        (question) => question.type === QuestionType.OBJECTIVE,
      );
      const theoryQuestions = attempt.exam.questions.filter(
        (question) => question.type === QuestionType.THEORY,
      );

      const objectiveTotal = objectiveQuestions.reduce(
        (sum, question) => sum + question.marks,
        0,
      );
      const theoryTotal = theoryQuestions.reduce(
        (sum, question) => sum + question.marks,
        0,
      );

      return {
        attemptId: attempt.id,
        sessionId: attempt.sessionId,
        sessionName: attempt.session.name,
        examId: attempt.examId,
        examName: attempt.exam.name,
        subjectCode: attempt.exam.subject.code,
        admissionNumber: attempt.admissionNumber,
        studentName: attempt.displayName ?? attempt.admissionNumber,
        objectiveScore: attempt.score,
        objectiveTotal,
        theoryScore: null,
        theoryTotal,
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
        status: attempt.status === "GRADED" ? "graded" : "submitted",
      };
    });
  }
}

export const attemptService = new AttemptService();

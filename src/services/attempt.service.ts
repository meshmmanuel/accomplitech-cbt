import { QuestionType } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { attemptRepository } from "@/repositories/attempt.repository";
import { examRepository } from "@/repositories/exam.repository";

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

    const existing = await attemptRepository.findActive(
      input.sessionId,
      input.examId,
      input.admissionNumber,
    );

    if (existing) {
      return attemptRepository.findById(existing.id);
    }

    const attempt = await attemptRepository.create({
      session: { connect: { id: input.sessionId } },
      exam: { connect: { id: input.examId } },
      admissionNumber: input.admissionNumber,
      displayName: input.displayName,
    });

    return attemptRepository.findById(attempt.id);
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
      options: unknown;
    }>,
    answers: Array<{ questionId: string; selectedOption: string | null }>,
  ) {
    let score = 0;

    for (const question of questions) {
      if (question.type !== QuestionType.OBJECTIVE || !question.correctAnswer) {
        continue;
      }

      const answer = answers.find((item) => item.questionId === question.id);
      if (answer?.selectedOption === question.correctAnswer) {
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
}

export const attemptService = new AttemptService();

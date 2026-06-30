import type { ExamType } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { db } from "@/lib/db";
import {
  finalizeStagingAssets,
} from "@/lib/question-assets";
import {
  MAX_IMPORT_ROWS,
  buildImportPreview,
  canonicalToDbFields,
  csvTextToCanonicalQuestions,
  type CreateQuestionInput,
  type ImportMode,
  type ImportPreviewResult,
  type ReorderQuestionInput,
  toQuestionBankItem,
} from "@/modules/questions";
import { attemptRepository } from "@/repositories/attempt.repository";
import { examRepository } from "@/repositories/exam.repository";
import { questionRepository } from "@/repositories/question.repository";

export class QuestionService {
  async listByExam(examId: string) {
    const questions = await questionRepository.findByExam(examId);
    return questions.map(toQuestionBankItem);
  }

  async getById(id: string) {
    const question = await questionRepository.findById(id);
    if (!question) return null;
    return toQuestionBankItem(question);
  }

  private async getExamOrThrow(examId: string) {
    const exam = await examRepository.findById(examId);
    if (!exam) {
      throw new AppError("Exam not found", 404);
    }
    return exam;
  }

  async create(examId: string, input: CreateQuestionInput) {
    const exam = await this.getExamOrThrow(examId);
    const preview = buildImportPreview([input], [], exam.type);
    if (!preview.valid) {
      throw new AppError(preview.errors[0]?.message ?? "Invalid question", 400);
    }

    const sortOrder = (await questionRepository.getMaxSortOrder(examId)) + 1;
    const { examId: _examId, ...fields } = canonicalToDbFields(
      input,
      examId,
      sortOrder,
    );
    const question = await questionRepository.create({
      exam: { connect: { id: examId } },
      ...fields,
    });

    return toQuestionBankItem(question);
  }

  async update(questionId: string, input: CreateQuestionInput) {
    const existing = await questionRepository.findById(questionId);
    if (!existing) {
      throw new AppError("Question not found", 404);
    }

    const exam = await this.getExamOrThrow(existing.examId);
    const preview = buildImportPreview([input], [], exam.type);
    if (!preview.valid) {
      throw new AppError(preview.errors[0]?.message ?? "Invalid question", 400);
    }

    const { examId: _examId, ...fields } = canonicalToDbFields(
      input,
      existing.examId,
      existing.sortOrder,
    );
    const question = await questionRepository.update(questionId, fields);
    return toQuestionBankItem(question);
  }

  async reorder(examId: string, input: ReorderQuestionInput) {
    await this.getExamOrThrow(examId);

    const questions = await questionRepository.findByExam(examId);
    const index = questions.findIndex((q) => q.id === input.questionId);

    if (index === -1) {
      throw new AppError("Question not found", 404);
    }

    const swapIndex = input.direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= questions.length) {
      return questions.map(toQuestionBankItem);
    }

    const current = questions[index];
    const adjacent = questions[swapIndex];

    await db.$transaction([
      db.question.update({
        where: { id: current.id },
        data: { sortOrder: adjacent.sortOrder },
      }),
      db.question.update({
        where: { id: adjacent.id },
        data: { sortOrder: current.sortOrder },
      }),
    ]);

    const reordered = await questionRepository.findByExam(examId);
    return reordered.map(toQuestionBankItem);
  }

  async delete(questionId: string) {
    const existing = await questionRepository.findById(questionId);
    if (!existing) {
      throw new AppError("Question not found", 404);
    }

    const attempts = await attemptRepository.countByExam(existing.examId);
    if (attempts > 0) {
      throw new AppError(
        "Cannot delete questions from an exam that has student attempts",
        409,
      );
    }

    await questionRepository.delete(questionId);
  }

  previewImport(
    examType: ExamType,
    csvText: string,
  ): ImportPreviewResult {
    if (!csvText.trim()) {
      return {
        valid: false,
        questions: [],
        errors: [{ row: 1, message: "CSV content is empty" }],
        summary: {
          total: 0,
          multipleChoice: 0,
          essay: 0,
          totalMarks: 0,
        },
      };
    }

    const { questions, errors } = csvTextToCanonicalQuestions(csvText);

    if (questions.length > MAX_IMPORT_ROWS) {
      return buildImportPreview([], [
        {
          row: 1,
          message: `Import exceeds maximum of ${MAX_IMPORT_ROWS} questions`,
        },
      ], examType);
    }

    return buildImportPreview(questions, errors, examType);
  }

  async importFromCsv(
    examId: string,
    csvText: string,
    mode: ImportMode,
  ) {
    const exam = await this.getExamOrThrow(examId);
    const preview = this.previewImport(exam.type, csvText);

    if (!preview.valid) {
      throw new AppError(
        preview.errors[0]?.message ?? "Import validation failed",
        422,
      );
    }

    return this.importCanonicalQuestions(examId, preview.questions, mode);
  }

  async importCanonicalQuestions(
    examId: string,
    questions: CreateQuestionInput[],
    mode: ImportMode,
    stagingId?: string,
  ) {
    const exam = await this.getExamOrThrow(examId);
    const preview = buildImportPreview(questions, [], exam.type);

    if (!preview.valid) {
      throw new AppError(
        preview.errors[0]?.message ?? "Import validation failed",
        422,
      );
    }

    if (questions.length > MAX_IMPORT_ROWS) {
      throw new AppError(
        `Import exceeds maximum of ${MAX_IMPORT_ROWS} questions`,
        400,
      );
    }

    const attempts = await attemptRepository.countByExam(examId);
    if (mode === "replace" && attempts > 0) {
      throw new AppError(
        "Cannot replace questions on an exam that has student attempts",
        409,
      );
    }

    const resolvedQuestions = stagingId
      ? await this.finalizeQuestionAssets(examId, stagingId, questions)
      : questions;

    const startSortOrder =
      mode === "append"
        ? (await questionRepository.getMaxSortOrder(examId)) + 1
        : 0;

    await db.$transaction(async (tx) => {
      if (mode === "replace") {
        await tx.question.deleteMany({ where: { examId } });
      }

      for (const [index, question] of resolvedQuestions.entries()) {
        const { examId: _examId, ...fields } = canonicalToDbFields(
          question,
          examId,
          startSortOrder + index,
        );

        await tx.question.create({
          data: {
            exam: { connect: { id: examId } },
            ...fields,
          },
        });
      }
    });

    return {
      imported: resolvedQuestions.length,
      mode,
      summary: preview.summary,
    };
  }

  private async finalizeQuestionAssets(
    examId: string,
    stagingId: string,
    questions: CreateQuestionInput[],
  ) {
    const assets = questions.flatMap((question) => question.assets ?? []);
    if (assets.length === 0) return questions;

    const pathMap = await finalizeStagingAssets(
      stagingId,
      examId,
      assets.map((asset) => ({
        id: asset.id,
        path: asset.path.split("/").pop() ?? asset.path,
      })),
    );

    return questions.map((question) => ({
      ...question,
      assets: question.assets?.map((asset) => ({
        ...asset,
        path: pathMap.get(asset.id) ?? asset.path,
      })),
    }));
  }

  /** Resolve correct answer letter for grading — canonical first, legacy fallback */
  resolveCorrectLetter(question: {
    answer: unknown;
    correctAnswer: string | null;
    type: string;
  }): string | null {
    const answer = question.answer as { kind?: string; value?: string } | null;
    if (answer?.kind === "single" && answer.value) {
      return answer.value.toUpperCase();
    }
    return question.correctAnswer?.toUpperCase() ?? null;
  }
}

export const questionService = new QuestionService();

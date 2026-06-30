import type { ExamType, Question, QuestionType } from "@prisma/client";
import {
  blocksToPlainText,
  canonicalOptionsToLegacyStrings,
  firstAssetPath,
  legacyOptionsToCanonical,
  textBlock,
} from "./blocks";
import { canonicalQuestionSchema } from "./schemas";
import type {
  AnswerKey,
  CanonicalQuestion,
  CanonicalQuestionType,
  ImportPreviewResult,
  ImportValidationError,
  QuestionBankItem,
  QuestionListItem,
} from "./types";
import {
  OBJECTIVE_CANONICAL_TYPES,
  THEORY_CANONICAL_TYPES,
} from "./constants";
import { isPlaceholderQuestion } from "./worksheet-parser";

export function canonicalTypeToLegacy(
  questionType: CanonicalQuestionType,
): "obj" | "theory" {
  return OBJECTIVE_CANONICAL_TYPES.includes(questionType) ? "obj" : "theory";
}

export function canonicalTypeToPrismaType(
  questionType: CanonicalQuestionType,
): QuestionType {
  return OBJECTIVE_CANONICAL_TYPES.includes(questionType)
    ? "OBJECTIVE"
    : "THEORY";
}

export function answerKeyToLegacyLetter(answer: AnswerKey): string | null {
  if (answer.kind === "single") return answer.value;
  return null;
}

export function buildCanonicalFromDb(question: Question): CanonicalQuestion {
  const content = question.content as unknown as CanonicalQuestion["blocks"] | null;
  const answer = question.answer as unknown as AnswerKey | null;
  const options = legacyOptionsToCanonical(question.options);

  if (content?.length && answer) {
    return {
      questionType: question.questionType as CanonicalQuestionType,
      marks: question.marks,
      blocks: content,
      options,
      answer,
      assets: (question.assets as unknown as CanonicalQuestion["assets"]) ?? undefined,
      topic: question.topic ?? undefined,
      difficulty: question.difficulty ?? undefined,
      explanation: question.explanation ?? undefined,
      tags: question.tags ? question.tags.split(",").map((t) => t.trim()) : undefined,
    };
  }

  // Legacy fallback for unmigrated rows
  const questionType =
    question.type === "OBJECTIVE" ? "multiple_choice" : "essay";

  return {
    questionType,
    marks: question.marks,
    blocks: [textBlock(question.text)],
    options: options,
    answer:
      question.type === "OBJECTIVE" && question.correctAnswer
        ? { kind: "single", value: question.correctAnswer }
        : { kind: "essay", value: null },
    topic: question.topic ?? undefined,
    difficulty: question.difficulty ?? undefined,
    explanation: question.explanation ?? undefined,
  };
}

export function canonicalToDbFields(
  question: CanonicalQuestion,
  examId: string,
  sortOrder: number,
) {
  const parsed = canonicalQuestionSchema.parse(question);
  const plainText = blocksToPlainText(parsed.blocks);
  const legacyOptions = canonicalOptionsToLegacyStrings(parsed.options);
  const assets = parsed.assets ?? [];

  return {
    examId,
    questionType: parsed.questionType,
    type: canonicalTypeToPrismaType(parsed.questionType),
    content: parsed.blocks,
    answer: parsed.answer,
    assets: assets.length ? assets : undefined,
    text: plainText,
    imagePath: firstAssetPath(parsed.blocks, assets),
    marks: parsed.marks,
    topic: parsed.topic ?? null,
    difficulty: parsed.difficulty ?? null,
    options: legacyOptions ?? parsed.options ?? undefined,
    correctAnswer: answerKeyToLegacyLetter(parsed.answer),
    explanation: parsed.explanation ?? null,
    tags: parsed.tags?.join(",") ?? null,
    sortOrder,
    status: "active",
  };
}

export function toQuestionListItem(question: Question): QuestionListItem {
  const canonical = buildCanonicalFromDb(question);
  const legacyType = canonicalTypeToLegacy(canonical.questionType);

  return {
    id: question.id,
    examId: question.examId,
    questionType: canonical.questionType,
    legacyType,
    text: question.text,
    marks: question.marks,
    topic: question.topic,
    difficulty: question.difficulty,
    sortOrder: question.sortOrder,
    optionCount: canonical.options?.length ?? 0,
  };
}

function buildAssetUrlMap(
  assets?: CanonicalQuestion["assets"],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const asset of assets ?? []) {
    if (asset.path.startsWith("http") || asset.path.startsWith("/")) {
      map[asset.id] = asset.path;
    } else {
      map[asset.id] = `/api/assets/${asset.path.replace(/^\/+/, "")}`;
    }
  }
  return map;
}

export function toQuestionBankItem(question: Question): QuestionBankItem {
  const canonical = buildCanonicalFromDb(question);
  const listItem = toQuestionListItem(question);

  return {
    ...listItem,
    blocks: canonical.blocks,
    options: canonical.options,
    answer: canonical.answer,
    assets: canonical.assets,
    assetUrlMap: buildAssetUrlMap(canonical.assets),
  };
}

export function validateQuestionsForExamType(
  questions: CanonicalQuestion[],
  examType: ExamType,
  startRow = 1,
): ImportValidationError[] {
  const errors: ImportValidationError[] = [];

  questions.forEach((question, index) => {
    const row = startRow + index;
    const schemaResult = canonicalQuestionSchema.safeParse(question);

    if (!schemaResult.success) {
      errors.push({
        row,
        message: schemaResult.error.issues[0]?.message ?? "Invalid question",
      });
      return;
    }

    const parsed = schemaResult.data;

    if (
      examType === "OBJECTIVE" &&
      THEORY_CANONICAL_TYPES.includes(parsed.questionType)
    ) {
      errors.push({
        row,
        field: "type",
        message: "Theory questions are not allowed in an objective-only exam",
      });
    }

    if (
      examType === "THEORY" &&
      OBJECTIVE_CANONICAL_TYPES.includes(parsed.questionType)
    ) {
      errors.push({
        row,
        field: "type",
        message: "Objective questions are not allowed in a theory-only exam",
      });
    }

    if (isPlaceholderQuestion(parsed)) {
      errors.push({
        row,
        field: "stem",
        message: "Question text is missing or could not be extracted",
      });
    }
  });

  return errors;
}

export function buildImportPreview(
  questions: CanonicalQuestion[],
  errors: ImportValidationError[],
  examType: ExamType,
): ImportPreviewResult {
  const examErrors = validateQuestionsForExamType(questions, examType);
  const allErrors = [...errors, ...examErrors];

  return {
    valid: allErrors.length === 0 && questions.length > 0,
    questions,
    errors: allErrors,
    summary: {
      total: questions.length,
      multipleChoice: questions.filter((q) => q.questionType === "multiple_choice")
        .length,
      essay: questions.filter((q) => q.questionType === "essay").length,
      totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    },
  };
}

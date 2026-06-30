import { parseCsv, rowsToRecords } from "./csv-parser";
import { textBlock } from "./blocks";
import type {
  CanonicalQuestion,
  ImportValidationError,
} from "./types";

const OPTION_KEYS = ["opt_a", "opt_b", "opt_c", "opt_d"] as const;
const ANSWER_LETTERS = ["A", "B", "C", "D"] as const;

function pushError(
  errors: ImportValidationError[],
  row: number,
  message: string,
  field?: string,
) {
  errors.push({ row, field, message });
}

export function csvRowToCanonical(
  record: Record<string, string>,
  rowNumber: number,
): { question?: CanonicalQuestion; errors: ImportValidationError[] } {
  const errors: ImportValidationError[] = [];
  const rawType = record.type?.toLowerCase();

  if (!rawType) {
    pushError(errors, rowNumber, "type is required", "type");
    return { errors };
  }

  if (!record.question) {
    pushError(errors, rowNumber, "question is required", "question");
  }

  const marks = Number.parseInt(record.marks ?? "", 10);
  if (!Number.isInteger(marks) || marks <= 0) {
    pushError(errors, rowNumber, "marks must be a positive integer", "marks");
  }

  if (errors.length > 0) {
    return { errors };
  }

  const topic = record.topic || undefined;
  const difficulty = record.difficulty || undefined;

  if (rawType === "obj" || rawType === "objective" || rawType === "mcq") {
    const options = OPTION_KEYS.map((key, index) => ({
      id: ANSWER_LETTERS[index],
      value: record[key] ?? "",
    }));

    for (const option of options) {
      if (!option.value) {
        pushError(
          errors,
          rowNumber,
          `Option ${option.id} is required for objective questions`,
          `opt_${option.id.toLowerCase()}`,
        );
      }
    }

    const answer = (record.answer ?? "").toUpperCase();
    if (!ANSWER_LETTERS.includes(answer as (typeof ANSWER_LETTERS)[number])) {
      pushError(
        errors,
        rowNumber,
        "answer must be A, B, C, or D for objective questions",
        "answer",
      );
    }

    if (errors.length > 0) {
      return { errors };
    }

    return {
      question: {
        questionType: "multiple_choice",
        marks,
        blocks: [textBlock(record.question)],
        options: options.map((option) => ({
          id: option.id,
          blocks: [textBlock(option.value)],
        })),
        answer: { kind: "single", value: answer },
        topic,
        difficulty,
      },
      errors,
    };
  }

  if (rawType === "theory" || rawType === "essay") {
    return {
      question: {
        questionType: "essay",
        marks,
        blocks: [textBlock(record.question)],
        answer: { kind: "essay", value: null },
        topic,
        difficulty,
      },
      errors,
    };
  }

  pushError(
    errors,
    rowNumber,
    'type must be "obj" or "theory"',
    "type",
  );
  return { errors };
}

export function csvTextToCanonicalQuestions(csvText: string): {
  questions: CanonicalQuestion[];
  errors: ImportValidationError[];
} {
  const rows = parseCsv(csvText);
  const records = rowsToRecords(rows);
  const questions: CanonicalQuestion[] = [];
  const errors: ImportValidationError[] = [];

  if (records.length === 0) {
    errors.push({ row: 1, message: "CSV file is empty or has no data rows" });
    return { questions, errors };
  }

  records.forEach((record, index) => {
    const rowNumber = index + 2;
    const result = csvRowToCanonical(record, rowNumber);
    errors.push(...result.errors);
    if (result.question) {
      questions.push(result.question);
    }
  });

  return { questions, errors };
}

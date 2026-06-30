import { textBlock } from "./blocks";
import type { CanonicalQuestion, CanonicalQuestionType } from "./types";

function inferQuestionType(stem: string): CanonicalQuestionType {
  const lower = stem.toLowerCase();
  if (
    /\b(draw|sketch|label|diagram|graph axes|ray diagram)\b/.test(lower)
  ) {
    return "label_diagram";
  }
  if (
    /\b(calculate|computation|convert|formula|if .+=|given .+=|find the|work out)\b/.test(
      lower,
    ) ||
    /[=+\-*/^]/.test(stem)
  ) {
    return "calculation";
  }
  if (/\b(explain|discuss|describe in detail)\b/.test(lower) && stem.length > 120) {
    return "essay";
  }
  return "short_answer";
}

function defaultMarks(type: CanonicalQuestionType) {
  if (type === "calculation") return 3;
  if (type === "label_diagram") return 5;
  if (type === "essay") return 10;
  return 2;
}

/**
 * Parse numbered worksheet text:
 *   1. Define physics.
 *   Answer: Physics is the branch of science...
 */
export function parseWorksheetText(text: string): CanonicalQuestion[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const sections = normalized
    .split(/\n(?=\d+\.\s)/)
    .map((section) => section.trim())
    .filter((section) => /^\d+\.\s/.test(section));

  const questions: CanonicalQuestion[] = [];

  for (const section of sections) {
    const withoutNumber = section.replace(/^\d+\.\s*/, "");
    const answerSplit = withoutNumber.split(/\n\s*Answer:\s*/i);

    let stem = answerSplit[0]?.trim() ?? "";
    let answerText = answerSplit.slice(1).join("\nAnswer: ").trim();

    if (!answerText) {
      const inline = withoutNumber.match(/^([\s\S]*?)\s+Answer:\s*(.+)$/i);
      if (inline) {
        stem = inline[1].trim();
        answerText = inline[2].trim();
      }
    }

    stem = stem.replace(/\s+/g, " ").trim();
    answerText = answerText.replace(/\s+/g, " ").trim();

    if (!stem || stem.length < 3) continue;
    if (/^SS\d+|practice questions|with answers$/i.test(stem)) continue;

    const questionType = inferQuestionType(stem);
    const marks = defaultMarks(questionType);

    questions.push({
      questionType,
      marks,
      blocks: [textBlock(stem)],
      answer: answerText
        ? { kind: "fill_blank", values: [answerText] }
        : { kind: "essay", value: null },
      explanation: answerText || undefined,
    });
  }

  return questions;
}

export function isPlaceholderQuestion(question: CanonicalQuestion) {
  const stem = question.blocks
    .filter((block) => block.kind === "text")
    .map((block) => block.value)
    .join(" ")
    .trim()
    .toLowerCase();

  return stem === "untitled question" || stem.length < 3;
}

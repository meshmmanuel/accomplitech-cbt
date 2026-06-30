import { textBlock } from "./blocks";
import type { CanonicalQuestion, QuestionOption } from "./types";
import {
  bestTextForParsing,
  htmlToStructuredText,
  preprocessPlainText,
} from "./docx-text-preprocess";
import { parseWorksheetText } from "./worksheet-parser";

const BULLET_SPLIT = /\n?\s*[•\u2022\u00b7]\s+/;

const HEADER_SKIP =
  /^(?:section\s+[ab]:|answer\s+all\s+questions|junior\s+secondary|mathematics|third\s+term|objective\s+questions|theory|essay\s+questions|type\s+of\s+bird|number\s+of\s+birds)/i;

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseMcqBullet(chunk: string): CanonicalQuestion | null {
  const sectionTrimmed = chunk.split(/\n\s*Section\s+[AB]:/i)[0]?.trim() ?? chunk;
  const answerMatch = sectionTrimmed.match(/\s+Answer:\s*([A-D])\b/i);
  if (!answerMatch || answerMatch.index === undefined) return null;

  const correctLetter = answerMatch[1].toUpperCase();
  const beforeAnswer = sectionTrimmed.slice(0, answerMatch.index).trim();

  const optionRegex = /(?:^|\s)([A-D])\.(?=\s|$)/g;
  const optionMatches = [...beforeAnswer.matchAll(optionRegex)];

  if (optionMatches.length < 4) return null;

  const stemEnd = optionMatches[0].index ?? 0;
  const stem = collapseWhitespace(beforeAnswer.slice(0, stemEnd));
  if (stem.length < 5) return null;

  const options: QuestionOption[] = [];

  for (let i = 0; i < 4; i++) {
    const letter = optionMatches[i][1];
    const start = (optionMatches[i].index ?? 0) + optionMatches[i][0].length;
    const end =
      i + 1 < optionMatches.length
        ? (optionMatches[i + 1].index ?? beforeAnswer.length)
        : beforeAnswer.length;
    const optionText = collapseWhitespace(beforeAnswer.slice(start, end));
    options.push({
      id: letter,
      blocks: [textBlock(optionText || `Option ${letter}`)],
    });
  }

  return {
    questionType: "multiple_choice",
    marks: 1,
    blocks: [textBlock(stem)],
    options,
    answer: { kind: "single", value: correctLetter },
  };
}

function parseTheoryBullet(chunk: string): CanonicalQuestion | null {
  const text = collapseWhitespace(chunk);
  if (text.length < 30) return null;
  if (/\s+Answer:\s*[A-D]\b/i.test(text)) return null;
  if (HEADER_SKIP.test(text)) return null;
  if (/^(?:chickens|turkeys|ducks)\s+\d+$/i.test(text)) return null;

  return {
    questionType: "essay",
    marks: 10,
    blocks: [textBlock(text)],
    answer: { kind: "essay", value: null },
  };
}

/**
 * Parse exam papers that use bullet (•) items:
 * - Section A MCQ: stem + A. B. C. D. + Answer: X
 * - Section B theory: multi-part bullet without lettered answer key
 */
export function parseBulletExamText(text: string): CanonicalQuestion[] {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\t[•\u2022\u00b7]\t/g, "\n• ")
    .replace(/\t[•\u2022\u00b7]\s*/g, "\n• ")
    .trim();
  if (!normalized) return [];

  const chunks = normalized
    .split(BULLET_SPLIT)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const questions: CanonicalQuestion[] = [];

  for (const chunk of chunks) {
    if (HEADER_SKIP.test(collapseWhitespace(chunk))) continue;

    const mcq = parseMcqBullet(chunk);
    if (mcq) {
      questions.push(mcq);
      continue;
    }

    const theory = parseTheoryBullet(chunk);
    if (theory) questions.push(theory);
  }

  return questions;
}

/** Try all deterministic parsers; return the best non-AI result */
export function parseDocumentText(text: string): CanonicalQuestion[] {
  const worksheet = parseWorksheetText(text);
  const bullet = parseBulletExamText(text);

  if (bullet.length >= 3 && bullet.length >= worksheet.length) {
    return bullet;
  }

  if (worksheet.length >= 3) {
    return worksheet;
  }

  return bullet.length > worksheet.length ? bullet : worksheet;
}

/** Parse using the best mammoth text + HTML sources */
export function parseExtractedDocument(text: string, html: string): CanonicalQuestion[] {
  const candidates = [
    parseDocumentText(bestTextForParsing(text, html)),
    parseDocumentText(htmlToStructuredText(html)),
    parseDocumentText(preprocessPlainText(text)),
    parseDocumentText(text),
  ];

  return candidates.reduce(
    (best, current) => (current.length > best.length ? current : best),
    [] as CanonicalQuestion[],
  );
}

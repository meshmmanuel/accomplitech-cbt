import type { AnswerKey, CanonicalQuestionType, ContentBlock } from "./types";

const TYPE_ALIASES: Record<string, CanonicalQuestionType> = {
  multiple_choice: "multiple_choice",
  mcq: "multiple_choice",
  objective: "multiple_choice",
  obj: "multiple_choice",
  multiple_correct: "multiple_correct",
  true_false: "true_false",
  truefalse: "true_false",
  "true/false": "true_false",
  fill_blank: "fill_blank",
  fill_in_the_blank: "fill_blank",
  essay: "essay",
  theory: "essay",
  long_answer: "essay",
  short_answer: "short_answer",
  shortanswer: "short_answer",
  definition: "short_answer",
  descriptive: "short_answer",
  open_ended: "short_answer",
  open: "short_answer",
  text: "short_answer",
  qa: "short_answer",
  question_answer: "short_answer",
  calculation: "calculation",
  calculate: "calculation",
  numeric: "calculation",
  math: "calculation",
  problem: "calculation",
  computation: "calculation",
  label_diagram: "label_diagram",
  diagram: "label_diagram",
  draw: "label_diagram",
  drawing: "label_diagram",
  label: "label_diagram",
  image: "image",
  matching: "matching",
  ordering: "ordering",
  programming: "programming",
  drag_drop: "drag_drop",
  hotspot: "hotspot",
};

const THEORY_IMPORT_TYPES = new Set<CanonicalQuestionType>([
  "essay",
  "short_answer",
  "calculation",
  "label_diagram",
]);

function normalizeQuestionType(raw: unknown): CanonicalQuestionType {
  if (typeof raw !== "string") return "short_answer";
  const key = raw.trim().toLowerCase().replace(/\s+/g, "_");
  return TYPE_ALIASES[key] ?? "short_answer";
}

function extractStemText(raw: Record<string, unknown>): string {
  if (typeof raw.question === "string") return raw.question;
  if (typeof raw.stem === "string") return raw.stem;
  if (typeof raw.prompt === "string") return raw.prompt;
  if (typeof raw.q === "string") return raw.q;
  if (typeof raw.title === "string") return raw.title;
  if (typeof raw.questionText === "string") return raw.questionText;
  if (typeof raw.question_text === "string") return raw.question_text;
  if (typeof raw.body === "string") return raw.body;
  if (typeof raw.text === "string" && !raw.blocks) return raw.text;

  if (typeof raw.content === "string") return raw.content;

  if (Array.isArray(raw.content)) {
    const parts = raw.content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          if (typeof record.value === "string") return record.value;
          if (typeof record.text === "string") return record.text;
          if (typeof record.content === "string") return record.content;
        }
        return "";
      })
      .filter(Boolean);
    if (parts.length > 0) return parts.join("\n");
  }

  if (Array.isArray(raw.blocks) && raw.blocks.length > 0) {
    const parts = raw.blocks
      .map((block) => {
        if (typeof block === "string") return block;
        if (!block || typeof block !== "object") return "";
        const record = block as Record<string, unknown>;
        if (record.kind === "text" && typeof record.value === "string") {
          return record.value;
        }
        if (typeof record.value === "string") return record.value;
        if (typeof record.text === "string") return record.text;
        if (typeof record.content === "string") return record.content;
        return "";
      })
      .filter(Boolean);
    if (parts.length > 0) return parts.join("\n");
  }

  return "";
}

function normalizeOptions(
  raw: Record<string, unknown>,
  questionType: CanonicalQuestionType,
) {
  if (
    questionType !== "multiple_choice" &&
    questionType !== "multiple_correct"
  ) {
    return undefined;
  }

  const options = raw.options;
  if (!options) return undefined;

  const letters = ["A", "B", "C", "D"] as const;

  if (Array.isArray(options)) {
    return options.slice(0, 4).map((option, index) => {
      if (typeof option === "string") {
        const matched = option.match(/^([A-D])\.\s*(.*)$/i);
        const id = matched ? matched[1].toUpperCase() : letters[index];
        const value = matched ? matched[2].trim() : option.trim();
        return {
          id,
          blocks: [{ kind: "text", value: value || `Option ${id}` }],
        };
      }

      if (option && typeof option === "object") {
        const record = option as Record<string, unknown>;
        const id =
          typeof record.id === "string"
            ? record.id.toUpperCase()
            : letters[index];
        const text =
          (typeof record.text === "string" && record.text) ||
          (Array.isArray(record.blocks) &&
            (record.blocks[0] as { value?: string })?.value) ||
          "";
        return {
          id,
          blocks: [{ kind: "text", value: text || `Option ${id}` }],
        };
      }

      return {
        id: letters[index],
        blocks: [{ kind: "text", value: String(option) }],
      };
    });
  }

  if (options && typeof options === "object") {
    return letters.map((letter) => {
      const value =
        (options as Record<string, unknown>)[letter] ??
        (options as Record<string, unknown>)[letter.toLowerCase()] ??
        "";
      return {
        id: letter,
        blocks: [
          {
            kind: "text",
            value: String(value).trim() || `Option ${letter}`,
          },
        ],
      };
    });
  }

  return undefined;
}

function normalizeBlocks(raw: Record<string, unknown>): ContentBlock[] | null {
  if (Array.isArray(raw.blocks) && raw.blocks.length > 0) {
    const blocks = raw.blocks as ContentBlock[];
    const text = blocks
      .filter((b) => b.kind === "text")
      .map((b) => (b as { value: string }).value)
      .join(" ")
      .trim();
    if (text.toLowerCase() === "untitled question") return null;
    return blocks;
  }

  const text = extractStemText(raw).trim();
  if (!text || text.toLowerCase() === "untitled question") return null;
  return [{ kind: "text", value: text }];
}

function normalizeAnswer(
  raw: Record<string, unknown>,
  questionType: CanonicalQuestionType,
): AnswerKey {
  const answer = raw.answer;

  if (answer && typeof answer === "object" && "kind" in (answer as object)) {
    return answer as AnswerKey;
  }

  const answerText =
    (typeof answer === "string" && answer) ||
    (typeof raw.correct_answer === "string" && raw.correct_answer) ||
    (typeof raw.correctAnswer === "string" && raw.correctAnswer) ||
    (typeof raw.correct_option === "string" && raw.correct_option) ||
    (typeof raw.answer_key === "string" && raw.answer_key) ||
    (typeof raw.model_answer === "string" && raw.model_answer) ||
    (typeof raw.solution === "string" && raw.solution) ||
    (typeof raw.ans === "string" && raw.ans) ||
    "";

  if (questionType === "multiple_choice") {
    const letter = answerText.trim().toUpperCase().slice(0, 1);
    if (/^[A-D]$/.test(letter)) {
      return { kind: "single", value: letter };
    }
    return { kind: "single", value: "A" };
  }

  if (questionType === "essay") {
    return { kind: "essay", value: null };
  }

  if (answerText.trim()) {
    return { kind: "fill_blank", values: [answerText.trim()] };
  }

  return { kind: "essay", value: null };
}

function normalizeMarks(raw: Record<string, unknown>) {
  const value = raw.marks ?? raw.mark ?? raw.points ?? 2;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 2;
}

/** Coerce loose AI JSON into canonical question shape before Zod validation */
export function normalizeRawAiQuestion(
  raw: unknown,
): Record<string, unknown> | null {
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return null;
    return {
      questionType: "short_answer",
      marks: 2,
      blocks: [{ kind: "text", value: text }],
      answer: { kind: "essay", value: null },
    };
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const blocks = normalizeBlocks(record);
  if (!blocks) return null;

  const questionType = normalizeQuestionType(record.questionType ?? record.type);

  const normalizedOptions = normalizeOptions(record, questionType);

  const normalized: Record<string, unknown> = {
    questionType,
    marks: normalizeMarks(record),
    blocks,
    answer: normalizeAnswer(record, questionType),
  };

  if (normalizedOptions) {
    normalized.options = normalizedOptions;
  } else if (Array.isArray(record.options)) {
    normalized.options = record.options;
  }

  if (Array.isArray(record.assets)) {
    normalized.assets = record.assets;
  }

  if (typeof record.topic === "string") normalized.topic = record.topic;
  if (typeof record.difficulty === "string") {
    normalized.difficulty = record.difficulty;
  }
  if (typeof record.explanation === "string") {
    normalized.explanation = record.explanation;
  } else if (
    normalized.answer &&
    typeof normalized.answer === "object" &&
    (normalized.answer as AnswerKey).kind === "fill_blank"
  ) {
    normalized.explanation = (
      normalized.answer as { values: string[] }
    ).values.join("; ");
  }

  if (THEORY_IMPORT_TYPES.has(questionType) && !record.options) {
    delete normalized.options;
  }

  return normalized;
}

/** Supported block kinds — extend as renderers are added */
export type ContentBlockKind =
  | "text"
  | "formula"
  | "image"
  | "svg"
  | "table"
  | "code";

export interface TextBlock {
  kind: "text";
  value: string;
}

export interface FormulaBlock {
  kind: "formula";
  latex: string;
}

export interface ImageBlock {
  kind: "image";
  assetId: string;
}

export interface SvgBlock {
  kind: "svg";
  assetId: string;
}

export interface TableBlock {
  kind: "table";
  headers: string[];
  rows: string[][];
}

export interface CodeBlock {
  kind: "code";
  language?: string;
  value: string;
}

export type ContentBlock =
  | TextBlock
  | FormulaBlock
  | ImageBlock
  | SvgBlock
  | TableBlock
  | CodeBlock;

export interface QuestionAsset {
  id: string;
  path: string;
  kind: "image" | "svg" | "audio" | "video";
  alt?: string;
}

export interface QuestionOption {
  id: string;
  blocks: ContentBlock[];
}

export type AnswerKey =
  | { kind: "single"; value: string }
  | { kind: "multiple"; values: string[] }
  | { kind: "true_false"; value: boolean }
  | { kind: "essay"; value: null }
  | { kind: "fill_blank"; values: string[] };

/** Canonical question types — V1 implements multiple_choice + essay */
export type CanonicalQuestionType =
  | "multiple_choice"
  | "multiple_correct"
  | "true_false"
  | "fill_blank"
  | "essay"
  | "short_answer"
  | "matching"
  | "ordering"
  | "image"
  | "label_diagram"
  | "programming"
  | "calculation"
  | "drag_drop"
  | "hotspot";

export interface CanonicalQuestion {
  questionType: CanonicalQuestionType;
  marks: number;
  blocks: ContentBlock[];
  options?: QuestionOption[];
  answer: AnswerKey;
  assets?: QuestionAsset[];
  topic?: string;
  difficulty?: string;
  explanation?: string;
  tags?: string[];
}

export interface ImportValidationError {
  row: number;
  field?: string;
  message: string;
}

export interface ImportPreviewResult {
  valid: boolean;
  questions: CanonicalQuestion[];
  errors: ImportValidationError[];
  summary: {
    total: number;
    multipleChoice: number;
    essay: number;
    totalMarks: number;
  };
}

export type ImportMode = "append" | "replace";

export interface WordImportPreview extends ImportPreviewResult {
  stagingId: string;
  assetPreviews: Array<{ id: string; url: string; kind: string }>;
}

export interface QuestionListItem {
  id: string;
  examId: string;
  questionType: CanonicalQuestionType;
  legacyType: "obj" | "theory";
  text: string;
  marks: number;
  topic: string | null;
  difficulty: string | null;
  sortOrder: number;
  optionCount: number;
}

/** Full question payload for admin bank list, preview, and edit */
export interface QuestionBankItem extends QuestionListItem {
  blocks: ContentBlock[];
  options?: QuestionOption[];
  answer: AnswerKey;
  assets?: QuestionAsset[];
  assetUrlMap: Record<string, string>;
}

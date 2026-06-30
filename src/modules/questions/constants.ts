import type { CanonicalQuestionType } from "./types";

export const CSV_HEADERS = [
  "type",
  "question",
  "opt_a",
  "opt_b",
  "opt_c",
  "opt_d",
  "answer",
  "marks",
  "topic",
  "difficulty",
] as const;

export const CSV_SAMPLE = `type,question,opt_a,opt_b,opt_c,opt_d,answer,marks
obj,What is 2+2?,1,2,4,8,C,2
theory,Explain OOP.,,,,,,10`;

export const MAX_IMPORT_ROWS = 500;

export const V1_QUESTION_TYPES: CanonicalQuestionType[] = [
  "multiple_choice",
  "essay",
  "short_answer",
  "calculation",
  "label_diagram",
];

export const OBJECTIVE_CANONICAL_TYPES: CanonicalQuestionType[] = [
  "multiple_choice",
  "multiple_correct",
  "true_false",
  "fill_blank",
];

export const THEORY_CANONICAL_TYPES: CanonicalQuestionType[] = [
  "essay",
  "short_answer",
  "calculation",
  "label_diagram",
  "image",
];

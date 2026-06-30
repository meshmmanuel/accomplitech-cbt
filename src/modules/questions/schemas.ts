import { z } from "zod";

const textBlockSchema = z.object({
  kind: z.literal("text"),
  value: z.string().min(1),
});

const formulaBlockSchema = z.object({
  kind: z.literal("formula"),
  latex: z.string().min(1),
});

const imageBlockSchema = z.object({
  kind: z.literal("image"),
  assetId: z.string().min(1),
});

const svgBlockSchema = z.object({
  kind: z.literal("svg"),
  assetId: z.string().min(1),
});

const tableBlockSchema = z.object({
  kind: z.literal("table"),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

const codeBlockSchema = z.object({
  kind: z.literal("code"),
  language: z.string().optional(),
  value: z.string().min(1),
});

export const contentBlockSchema = z.discriminatedUnion("kind", [
  textBlockSchema,
  formulaBlockSchema,
  imageBlockSchema,
  svgBlockSchema,
  tableBlockSchema,
  codeBlockSchema,
]);

export const questionAssetSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  kind: z.enum(["image", "svg", "audio", "video"]),
  alt: z.string().optional(),
});

export const questionOptionSchema = z.object({
  id: z.string().regex(/^[A-D]$/),
  blocks: z.array(contentBlockSchema).min(1),
});

export const answerKeySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("single"), value: z.string().regex(/^[A-D]$/) }),
  z.object({
    kind: z.literal("multiple"),
    values: z.array(z.string().regex(/^[A-D]$/)).min(1),
  }),
  z.object({ kind: z.literal("true_false"), value: z.boolean() }),
  z.object({ kind: z.literal("essay"), value: z.null() }),
  z.object({
    kind: z.literal("fill_blank"),
    values: z.array(z.string().min(1)).min(1),
  }),
]);

export const canonicalQuestionTypeSchema = z.enum([
  "multiple_choice",
  "multiple_correct",
  "true_false",
  "fill_blank",
  "essay",
  "short_answer",
  "matching",
  "ordering",
  "image",
  "label_diagram",
  "programming",
  "calculation",
  "drag_drop",
  "hotspot",
]);

export const canonicalQuestionSchema = z
  .object({
    questionType: canonicalQuestionTypeSchema,
    marks: z.number().int().positive(),
    blocks: z.array(contentBlockSchema).min(1),
    options: z.array(questionOptionSchema).optional(),
    answer: answerKeySchema,
    assets: z.array(questionAssetSchema).optional(),
    topic: z.string().optional(),
    difficulty: z.string().optional(),
    explanation: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .superRefine((question, ctx) => {
    if (question.questionType === "multiple_choice") {
      if (!question.options || question.options.length !== 4) {
        ctx.addIssue({
          code: "custom",
          message: "Multiple choice questions require exactly 4 options",
          path: ["options"],
        });
      }
      if (question.answer.kind !== "single") {
        ctx.addIssue({
          code: "custom",
          message: "Multiple choice questions require a single-letter answer",
          path: ["answer"],
        });
      }
    }

    if (
      question.questionType === "essay" &&
      question.answer.kind !== "essay"
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Essay questions require an essay answer key",
        path: ["answer"],
      });
    }

    const theoryWithModelAnswer = [
      "short_answer",
      "calculation",
      "label_diagram",
      "fill_blank",
    ] as const;

    if (
      theoryWithModelAnswer.includes(
        question.questionType as (typeof theoryWithModelAnswer)[number],
      ) &&
      question.answer.kind !== "fill_blank" &&
      question.answer.kind !== "essay"
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "Short answer / calculation questions require fill_blank or essay answer",
        path: ["answer"],
      });
    }
  });

export const createQuestionInputSchema = canonicalQuestionSchema;

export const importModeSchema = z.enum(["append", "replace"]);

export const reorderQuestionSchema = z.object({
  questionId: z.string().min(1),
  direction: z.enum(["up", "down"]),
});

export type CreateQuestionInput = z.infer<typeof createQuestionInputSchema>;
export type ReorderQuestionInput = z.infer<typeof reorderQuestionSchema>;

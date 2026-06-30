import { z } from "zod";

export const saveAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedOption: z
    .union([z.string().regex(/^[A-D]$/), z.null()])
    .optional(),
  flaggedForReview: z.boolean().optional(),
});

export const batchSaveAnswersSchema = z.object({
  saves: z
    .array(
      z.object({
        attemptId: z.string().min(1),
        questionId: z.string().min(1),
        selectedOption: z
          .union([z.string().regex(/^[A-D]$/), z.null()])
          .optional(),
        flaggedForReview: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(200),
});

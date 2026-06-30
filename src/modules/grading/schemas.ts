import { z } from "zod";

export const gradeTheorySchema = z.object({
  marks: z
    .array(
      z.object({
        questionId: z.string().min(1),
        marksAwarded: z.number().int().min(0),
      }),
    )
    .min(1, "At least one theory mark is required"),
});

import { z } from "zod";
import { createQuestionInputSchema, importModeSchema } from "@/modules/questions/schemas";

export const commitImportSchema = z.object({
  questions: z.array(createQuestionInputSchema).min(1),
  mode: importModeSchema.default("append"),
  stagingId: z.string().uuid().optional(),
});

export type CommitImportInput = z.infer<typeof commitImportSchema>;

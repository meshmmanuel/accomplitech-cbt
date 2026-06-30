import { z } from "zod";

const examTypeSchema = z.enum(["obj", "theory", "both"]);
const examStatusSchema = z.enum(["draft", "active"]);

export const createExamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name is too long"),
  type: examTypeSchema,
  durationMinutes: z.coerce
    .number()
    .int("Duration must be a whole number")
    .min(5, "Duration must be at least 5 minutes")
    .max(600, "Duration cannot exceed 600 minutes"),
  passMark: z.coerce
    .number()
    .int("Pass mark must be a whole number")
    .min(0, "Pass mark cannot be negative")
    .max(100, "Pass mark cannot exceed 100"),
  totalMarks: z.coerce
    .number()
    .int("Total marks must be a whole number")
    .min(1, "Total marks must be at least 1")
    .max(1000, "Total marks is too high")
    .optional()
    .default(100),
  instructions: z
    .string()
    .trim()
    .max(5000, "Instructions are too long")
    .optional()
    .or(z.literal("")),
  status: examStatusSchema.optional().default("draft"),
});

export const updateExamSchema = createExamSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" },
);

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;

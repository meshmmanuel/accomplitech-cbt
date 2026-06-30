import { z } from "zod";

const sessionStatusSchema = z.enum(["draft", "upcoming", "open", "completed"]);

export const createSessionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Name is too long"),
  date: z
    .string()
    .trim()
    .min(1, "Date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
  startTime: z
    .string()
    .trim()
    .max(20, "Start time is too long")
    .optional()
    .or(z.literal("")),
  durationMinutes: z.coerce
    .number()
    .int("Duration must be a whole number")
    .min(5, "Duration must be at least 5 minutes")
    .max(600, "Duration cannot exceed 600 minutes"),
  examCode: z
    .string()
    .trim()
    .min(3, "Exam code must be at least 3 characters")
    .max(20, "Exam code is too long")
    .transform((value) => value.toUpperCase()),
  instructions: z
    .string()
    .trim()
    .max(5000, "Instructions are too long")
    .optional()
    .or(z.literal("")),
  status: sessionStatusSchema.optional().default("draft"),
  examIds: z
    .array(z.string().trim().min(1))
    .min(1, "Select at least one exam"),
});

export const updateSessionSchema = createSessionSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" },
);

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

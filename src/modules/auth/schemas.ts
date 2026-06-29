import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const studentLoginSchema = z.object({
  admissionNumber: z
    .string()
    .min(1, "Admission number is required")
    .max(64, "Admission number is too long"),
  examCode: z
    .string()
    .min(4, "Exam code must be at least 4 characters")
    .max(32, "Exam code is too long"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type StudentLoginInput = z.infer<typeof studentLoginSchema>;

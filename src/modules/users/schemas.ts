import { z } from "zod";
import { UserRole, UserStatus } from "@prisma/client";

const assignableRoleSchema = z.enum([
  "EXAM_OFFICER",
  "LECTURER",
  "INVIGILATOR",
  "VIEWER",
  "SUPER_ADMIN",
]);

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: assignableRoleSchema,
  subjectIds: z.array(z.string().min(1)).optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    role: assignableRoleSchema.optional(),
    status: z.nativeEnum(UserStatus).optional(),
    password: z.string().min(6).optional(),
    subjectIds: z.array(z.string().min(1)).optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.role !== undefined ||
      value.status !== undefined ||
      value.password !== undefined ||
      value.subjectIds !== undefined,
    { message: "No changes provided" },
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

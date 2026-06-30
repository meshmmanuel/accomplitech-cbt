import { z } from "zod";

const clientActivitySchema = z.enum([
  "IDLE",
  "INSTRUCTIONS",
  "IN_EXAM",
  "SUBMITTED",
]);

export const heartbeatSchema = z.object({
  clientId: z.string().min(8).max(64),
  activity: clientActivitySchema.default("IDLE"),
  sessionId: z.string().optional(),
  admissionNumber: z.string().max(64).optional(),
  activeAttemptId: z.string().optional(),
  reconnecting: z.boolean().optional(),
});

export const clientPingSchema = z.object({
  client: z.object({
    id: z.string().min(8).max(64),
    activity: clientActivitySchema.default("IDLE"),
  }),
  student: z
    .object({
      authenticated: z.boolean(),
      sessionId: z.string().optional(),
      admissionNumber: z.string().max(64).optional(),
      activeAttemptId: z.string().optional(),
    })
    .optional(),
  reconnecting: z.boolean().optional(),
});

export const disconnectSchema = z.object({
  clientId: z.string().min(8).max(64),
});

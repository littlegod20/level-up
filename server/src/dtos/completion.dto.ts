import { z } from "zod";

const ymd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const createCompletionSchema = z.object({
  date: ymd,
  skipped: z.boolean().optional(),
  note: z.string().max(2000).nullable().optional(),
});

export type CreateCompletionInput = z.infer<typeof createCompletionSchema>;

export const listCompletionsQuerySchema = z.object({
  from: ymd.optional(),
  to: ymd.optional(),
});

export type ListCompletionsQuery = z.infer<typeof listCompletionsQuerySchema>;

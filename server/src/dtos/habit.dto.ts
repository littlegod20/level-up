import { z } from "zod";

const frequency = z.enum(["daily", "weekly", "custom"]);

export const createHabitSchema = z.object({
  name: z.string().min(1).max(255),
  icon: z.string().min(1).max(64),
  color: z.string().min(1).max(32),
  frequency,
  customWeekdays: z.array(z.number().int().min(0).max(6)).nullable().optional(),
  reminderTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(),
  xpReward: z.number().int().min(0),
  archived: z.boolean().optional(),
});

export const updateHabitSchema = createHabitSchema.partial();

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;

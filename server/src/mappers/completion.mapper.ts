import { Completion } from "@entities/completion.entity";

export function completionToJson(c: Completion) {
  return {
    id: c.id,
    habitId: c.habitId,
    date: c.completionDate,
    completedAt: c.completedAt.toISOString(),
    skipped: c.skipped,
    note: c.note,
    xpAwarded: c.xpAwarded,
  };
}

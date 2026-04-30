import { Habit } from "@entities/habit.entity";

export function habitToJson(h: Habit) {
  return {
    id: h.id,
    name: h.name,
    icon: h.icon,
    color: h.color,
    frequency: h.frequency,
    customWeekdays: h.customWeekdays,
    reminderTime: h.reminderTime,
    xpReward: h.xpReward,
    archived: h.archived,
    createdAt: h.createdAt.toISOString(),
  };
}
